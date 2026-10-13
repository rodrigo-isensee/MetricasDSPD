#!/bin/bash
# Sobe o Postgres do Compose (se preciso) e roda os testes de banco do servidor, num conjunto de schemas próprio.
# O Postgres fica de pé (volume persistente); só os schemas da execução são removidos (globalTeardown).
set -uo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a
command -v docker >/dev/null || { echo "Docker não encontrado (veja docs/architecture/server.md)"; exit 1; }
docker compose up -d --wait postgres || exit 1
export PG_TESTE_URL="${PG_TESTE_URL:-postgres://dspd_migrador:${DSPD_PWD_MIGRADOR:-migrador_dev}@127.0.0.1:${PG_PORT:-5432}/metricas_test}"
export DSPD_PWD_API DSPD_PWD_COLETOR DSPD_PWD_REF DSPD_PWD_WEBHOOK DSPD_PWD_AUTOMACAO DSPD_PWD_PESQUISA
pnpm --filter @metricas-dspd/server run test:pg
