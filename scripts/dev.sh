#!/bin/bash
# api e worker com tsx watch (fora do contêiner, contra o postgres do Compose) + Vite da web.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a
docker compose up -d --wait postgres
export PG_API_URL="${PG_API_URL:-postgres://dspd_api:${DSPD_PWD_API:-api_dev}@127.0.0.1:${PG_PORT:-5432}/metricas}"
export PG_COLETOR_URL="${PG_COLETOR_URL:-postgres://dspd_coletor:${DSPD_PWD_COLETOR:-coletor_dev}@127.0.0.1:${PG_PORT:-5432}/metricas}"
trap 'kill 0' EXIT
pnpm --filter @metricas-dspd/server run dev:api &
pnpm --filter @metricas-dspd/server run dev:worker &
pnpm --filter @metricas-dspd/web dev &
wait
