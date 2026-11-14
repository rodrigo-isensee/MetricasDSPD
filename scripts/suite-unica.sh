#!/bin/bash
# Roda o comando recebido sob trava exclusiva (flock): uma suíte de teste por vez, em todas as worktrees.
# Uso: bash scripts/suite-unica.sh <comando> [argumentos...]
# Trava ocupada: avisa no terminal e espera (não falha). Quem segura: fuser /tmp/claude-<uid>/metricas-dspd-suite.lock
# A trava fica em /tmp/claude-<uid> (o diretório do TMPDIR dos agentes, que o sandbox grava; o dono no terminal
# usa o mesmo caminho, pois ele não depende da variável TMPDIR): uma trava única por estação.
# Não aninha: se este processo (ou um ancestral) já segura a trava, roda o comando direto.
# METRICAS_DSPD_SUITE_LOCK troca o arquivo da trava e METRICAS_DSPD_SUITE_DIR troca só o diretório dela
# (os dois são usados só pelo teste do script, para não disputar a trava que o próprio pronto segura).
set -uo pipefail

[ "$#" -ge 1 ] || { echo "uso: suite-unica.sh <comando> [argumentos...]" >&2; exit 2; }

# Marca posta pelo próprio script: já seguramos a trava, roda direto.
if [ "${METRICAS_DSPD_SUITE_SEGURA:-}" = "1" ]; then
  exec "$@"
fi

command -v flock >/dev/null || { echo "suite-unica: flock não encontrado (util-linux)" >&2; exit 1; }

if [ -n "${METRICAS_DSPD_SUITE_LOCK:-}" ]; then
  TRAVA="$METRICAS_DSPD_SUITE_LOCK"
else
  DIR_TRAVA="${METRICAS_DSPD_SUITE_DIR:-/tmp/claude-$(id -u)}"
  [ -L "$DIR_TRAVA" ] && { echo "suite-unica: $DIR_TRAVA é um link simbólico; recusado" >&2; exit 1; }
  mkdir -p -m 700 "$DIR_TRAVA" 2>/dev/null || [ -d "$DIR_TRAVA" ] || { echo "suite-unica: não consegui criar $DIR_TRAVA" >&2; exit 1; }
  TRAVA="$DIR_TRAVA/metricas-dspd-suite.lock"
fi
# Não segue link simbólico no caminho da trava.
[ -L "$TRAVA" ] && { echo "suite-unica: $TRAVA é um link simbólico; recusado" >&2; exit 1; }

exec 9>>"$TRAVA" || { echo "suite-unica: não consegui abrir $TRAVA" >&2; exit 1; }
if ! flock -n 9; then
  echo "suite-unica: outra suíte está rodando; esperando a trava $TRAVA (quem segura: fuser $TRAVA)" >&2
  flock 9
fi

export METRICAS_DSPD_SUITE_SEGURA=1
# Sem exec: o fd 9 (a trava) fica com este processo e com os filhos até o fim do comando.
"$@"
exit "$?"
