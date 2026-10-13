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
case "${PG_TESTE_URL%%\?*}" in
  */*_test) ;;
  *) echo "PG_TESTE_URL deve apontar para um banco de teste (nome terminado em _test)."; exit 1 ;;
esac
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
  if [ -n "$P" ]; then
    # por conexão (driver pg do server), sem depender do nome do container nem de psql no host
    (cd server && P="$P" node -e '
      const pg = require("pg");
      const c = new pg.Client({ connectionString: process.env.PG_TESTE_URL });
      c.connect()
        .then(() => Promise.all(["bm", "ac", "core"].map((d) => c.query(`DROP SCHEMA IF EXISTS ${process.env.P}dspd_${d} CASCADE`))))
        .then(() => c.end());
    ') >/dev/null 2>&1 || echo "aviso: não removi os schemas temporários ${P}dspd_* (remova à mão, se sobraram)" >&2
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
