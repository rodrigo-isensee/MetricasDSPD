#!/bin/bash
# Sobe o MySQL descartável, roda os testes MySQL e derruba (mesmo em falha).
set -uo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a
export MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-troque-me-root}"
command -v docker >/dev/null || { echo "Docker não encontrado (veja docs/architecture/server.md)"; exit 1; }
trap 'docker compose --profile test rm -sfv mysql-test >/dev/null' EXIT
docker compose --profile test up -d --wait mysql-test || exit 1
MYSQL_TEST_URL="mysql://root:${MYSQL_ROOT_PASSWORD}@127.0.0.1:${MYSQL_TEST_PORT:-3307}" \
  npm test -w @metricas-dspd/server
