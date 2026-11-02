#!/bin/bash
# Uso: scripts/coleta.sh ac [--releitura] [--reconhecer-mudanca]. Carrega .env (se existir) e roda a coleta manual do Acelerato.
set -euo pipefail
cd "$(dirname "$0")/.."
# shellcheck disable=SC1091
[ -f .env ] && set -a && . ./.env && set +a
pnpm --filter @metricas-dspd/server exec tsx src/entradas/coleta.ts "$@"
