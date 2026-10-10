#!/bin/bash
# Uso: scripts/db.sh migrate|seed. Carrega .env (se existir) e roda o CLI do servidor.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a
case "${1:-}" in
  migrate)
    pnpm --filter @metricas-dspd/server run migrate
    MYSQL_GRANTS_URL="mysql://root:${MYSQL_ROOT_PASSWORD}@127.0.0.1:${MYSQL_PORT:-3306}" pnpm --filter @metricas-dspd/server run grants ;;
  seed) pnpm --filter @metricas-dspd/server run seed ;;
  *) echo "uso: db.sh migrate|seed"; exit 2 ;;
esac
