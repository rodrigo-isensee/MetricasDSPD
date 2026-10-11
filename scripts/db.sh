#!/bin/bash
# Uso: scripts/db.sh migrate|seed|limpar-testes. Carrega .env (se existir) e roda o CLI do servidor.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a
export PG_MIGRADOR_URL="${PG_MIGRADOR_URL:-postgres://dspd_migrador:${DSPD_PWD_MIGRADOR:-migrador_dev}@127.0.0.1:${PG_PORT:-5432}/metricas}"
export PG_TESTE_URL="${PG_TESTE_URL:-postgres://dspd_migrador:${DSPD_PWD_MIGRADOR:-migrador_dev}@127.0.0.1:${PG_PORT:-5432}/metricas_test}"
case "${1:-}" in
  migrate) pnpm --filter @metricas-dspd/server run migrate "${@:2}" ;;
  seed) pnpm --filter @metricas-dspd/server run seed ;;
  limpar-testes) pnpm --filter @metricas-dspd/server run db:limpar-testes ;;
  *) echo "uso: db.sh migrate [up|down [N]|redo] | seed | limpar-testes"; exit 2 ;;
esac
