#!/bin/bash
# Roda o comando recebido numa vaga da fila de testes (flock): por padrão duas suítes ao mesmo tempo, em todas as worktrees.
# Uso: bash scripts/suite-unica.sh <comando> [argumentos...]
# Vagas ocupadas: avisa no terminal (com cada vaga e quem a segura) e espera a primeira que liberar (não falha).
# Quem segura: o texto escrito na própria vaga, ou fuser /tmp/claude-<uid>/metricas-dspd-suite-<n>.lock
# As vagas ficam em /tmp/claude-<uid> (o diretório do TMPDIR dos agentes, que o sandbox grava; o dono no terminal
# usa o mesmo caminho, pois ele não depende da variável TMPDIR): uma fila por estação.
# METRICAS_DSPD_SUITE_VAGAS define quantas vagas (padrão 2, inteiro de 1 a 16).
# METRICAS_DSPD_SUITE_GRUPO escolhe a fila: suite (padrão, usa as vagas acima) ou outro nome, que tem UMA vaga própria, separada: pg (test:pg; o banco de teste é compartilhado, até o K-392)
# e e2e (test:e2e; o Playwright usa portas fixas 4173, 4174 e 4175).
# Não aninha: se este processo (ou um ancestral) já segura uma vaga, roda o comando direto.
# METRICAS_DSPD_SUITE_LOCK troca o prefixo do arquivo da vaga (<prefixo>-<n>.lock) e METRICAS_DSPD_SUITE_DIR troca
# só o diretório (os dois são usados só pelo teste do script, para não disputar as vagas que o próprio pronto segura).
set -uo pipefail

[ "$#" -ge 1 ] || { echo "uso: suite-unica.sh <comando> [argumentos...]" >&2; exit 2; }

# Marca posta pelo próprio script: já seguramos uma vaga, roda direto.
if [ "${METRICAS_DSPD_SUITE_SEGURA:-}" = "1" ]; then
  exec "$@"
fi

command -v flock >/dev/null || { echo "suite-unica: flock não encontrado (util-linux)" >&2; exit 1; }

GRUPO="${METRICAS_DSPD_SUITE_GRUPO:-suite}"
case "$GRUPO" in
  '' | *[!A-Za-z0-9_-]*) echo "suite-unica: METRICAS_DSPD_SUITE_GRUPO inválido: $GRUPO" >&2; exit 2 ;;
esac
if [ "$GRUPO" = "suite" ]; then
  VAGAS="${METRICAS_DSPD_SUITE_VAGAS:-2}"
  case "$VAGAS" in
    [1-9] | 1[0-6]) ;;
    *) echo "suite-unica: METRICAS_DSPD_SUITE_VAGAS inválido: $VAGAS (use de 1 a 16)" >&2; exit 2 ;;
  esac
else
  VAGAS=1
fi

if [ -n "${METRICAS_DSPD_SUITE_LOCK:-}" ]; then
  BASE="$METRICAS_DSPD_SUITE_LOCK"
  [ "$GRUPO" = "suite" ] || BASE="$BASE-$GRUPO"
else
  DIR_TRAVA="${METRICAS_DSPD_SUITE_DIR:-/tmp/claude-$(id -u)}"
  [ -L "$DIR_TRAVA" ] && { echo "suite-unica: $DIR_TRAVA é um link simbólico; recusado" >&2; exit 1; }
  mkdir -p -m 700 "$DIR_TRAVA" 2>/dev/null || [ -d "$DIR_TRAVA" ] || { echo "suite-unica: não consegui criar $DIR_TRAVA" >&2; exit 1; }
  BASE="$DIR_TRAVA/metricas-dspd-$GRUPO"
fi

# Recusa link simbólico em qualquer vaga.
n=1
while [ "$n" -le "$VAGAS" ]; do
  [ -L "$BASE-$n.lock" ] && { echo "suite-unica: $BASE-$n.lock é um link simbólico; recusado" >&2; exit 1; }
  n=$((n + 1))
done

# Tenta cada vaga sem esperar; devolve 0 com o fd 9 preso à vaga em $VAGA.
tenta_vaga() {
  local k=1
  while [ "$k" -le "$VAGAS" ]; do
    VAGA="$BASE-$k.lock"
    exec 9>>"$VAGA" || { echo "suite-unica: não consegui abrir $VAGA" >&2; exit 1; }
    if flock -n 9; then return 0; fi
    exec 9>&-
    k=$((k + 1))
  done
  return 1
}

if ! tenta_vaga; then
  {
    echo "suite-unica: as $VAGAS vaga(s) estão ocupadas; esperando a primeira livre"
    k=1
    while [ "$k" -le "$VAGAS" ]; do
      echo "  vaga $k ($BASE-$k.lock) segurada por: $(head -c 300 "$BASE-$k.lock" 2>/dev/null | tr '\n' ' ')"
      k=$((k + 1))
    done
  } >&2
  until tenta_vaga; do sleep 0.3; done
fi
# Registra quem segura (o aviso de quem espera lê isto); o fd 9 continua na vaga.
printf 'pid %s em %s: %s\n' "$$" "$PWD" "$*" >"$VAGA" 2>/dev/null || true

export METRICAS_DSPD_SUITE_SEGURA=1
# Sem exec: o fd 9 (a vaga) fica com este processo e com os filhos até o fim do comando.
"$@"
exit "$?"
