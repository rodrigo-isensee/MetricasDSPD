#!/bin/bash
# Sobe a API real local com o mock semeado (DADOS_FONTE=mock, schemas temporários no banco de teste), roda o comando
# recebido com API_URL apontando para ela e derruba tudo ao final (os schemas temporários são removidos).
# Uso: bash scripts/com-api-mock.sh <comando...>   (FA-4 paridade; FA-5 E2E em VITE_FONTE=api). Rode sob flock.
set -uo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a
# Não recria o Postgres compartilhado: só sobe se não houver nada escutando na porta.
if ! (echo > "/dev/tcp/127.0.0.1/${PG_PORT:-5432}") 2>/dev/null; then docker compose up -d --wait postgres >/dev/null || exit 1; fi
export PG_TESTE_URL="${PG_TESTE_URL:-postgres://dspd_migrador:${DSPD_PWD_MIGRADOR:-migrador_dev}@127.0.0.1:${PG_PORT:-5432}/metricas_test}"
export DSPD_PWD_API
PORTA="${API_PORTA:-3100}"
LOG="$(mktemp)"
(cd server && PORT="$PORTA" exec pnpm exec tsx tests/pg/servidor-api-mock.ts) >"$LOG" 2>&1 &
API_PID=$!
cleanup() {
  pkill -TERM -P "$API_PID" 2>/dev/null
  kill -TERM "$API_PID" 2>/dev/null
  wait "$API_PID" 2>/dev/null
  # garantia: se o processo morreu antes do próprio teardown, remove os schemas temporários desta execução
  P="$(grep -o 'PREFIXO [a-z0-9_]*' "$LOG" | head -1 | cut -d' ' -f2)"
  if [ -n "$P" ] && command -v docker >/dev/null; then
    for d in bm ac core; do
      docker exec -e PGPASSWORD="${DSPD_PWD_MIGRADOR:-migrador_dev}" metricasdspd-postgres-1 psql -U dspd_migrador -h 127.0.0.1 -d metricas_test -qc "DROP SCHEMA IF EXISTS ${P}dspd_$d CASCADE" >/dev/null 2>&1
    done
  fi
  rm -f "$LOG"
}
trap cleanup EXIT
for _ in $(seq 1 120); do
  grep -q API_PRONTA "$LOG" && break
  kill -0 "$API_PID" 2>/dev/null || { echo "API não subiu:"; cat "$LOG"; exit 1; }
  sleep 1
done
grep -q API_PRONTA "$LOG" || { echo "API não ficou pronta em 120 s:"; cat "$LOG"; exit 1; }
API_URL="http://127.0.0.1:$PORTA" "$@"
