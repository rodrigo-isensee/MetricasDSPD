#!/bin/bash
# Roda o comando recebido sob trava exclusiva (flock): uma suíte de teste por vez, em todas as worktrees.
# Uso: bash scripts/suite-unica.sh <comando> [argumentos...]
# Trava ocupada: avisa no terminal e espera (não falha). Quem segura: fuser /tmp/metricas-dspd-suite.lock
# Não aninha: se este processo (ou um ancestral) já segura a trava, roda o comando direto.
# METRICAS_DSPD_SUITE_LOCK troca o arquivo da trava (usado só pelo teste do script).
set -uo pipefail

[ "$#" -ge 1 ] || { echo "uso: suite-unica.sh <comando> [argumentos...]" >&2; exit 2; }

# Marca posta pelo próprio script: já seguramos a trava, roda direto.
if [ "${METRICAS_DSPD_SUITE_SEGURA:-}" = "1" ]; then
  exec "$@"
fi

command -v flock >/dev/null || { echo "suite-unica: flock não encontrado (util-linux)" >&2; exit 1; }

TRAVA="${METRICAS_DSPD_SUITE_LOCK:-/tmp/metricas-dspd-suite.lock}"
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
