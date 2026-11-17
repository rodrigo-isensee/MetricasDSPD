#!/bin/bash
# Gera deploy/sql/ (scripts SQL das migrações para o DBA) a partir de server/migrations. Pedido 105, E7.246.
# Sobe um Postgres 17 DESCARTÁVEL em 127.0.0.1:${DSPD_SQL_PORTA:-55432}, aplica os próprios SQL (testa o que o DBA vai rodar), roda o runner
# real e confere que os dois caminhos dão o mesmo esquema. Não toca o banco do projeto; sem segredo (senha do descartável é fixa e local).
set -euo pipefail
cd "$(dirname "$0")/.."
PORTA="${DSPD_SQL_PORTA:-55432}"
NOME="sql-gerador-$$"
TMP="$(mktemp -d)"
cleanup() { docker rm -f "$NOME" >/dev/null 2>&1 || true; rm -rf "$TMP"; }
trap cleanup EXIT
gerar() { DSPD_GERADOR_VIA_WRAPPER=1 pnpm --filter @metricas-dspd/server exec tsx "$PWD/scripts/gerar-sql-migracoes.mjs" "$@"; }
psqla() { docker exec -i "$NOME" psql -v ON_ERROR_STOP=1 -q -U postgres "$@"; }

gerar arquivos
docker run -d --rm --name "$NOME" -e POSTGRES_PASSWORD=descartavel -p "127.0.0.1:$PORTA:5432" postgres:17 >/dev/null
for _ in $(seq 1 60); do
  if psqla -d postgres -tA -c "SELECT 1" >/dev/null 2>&1; then break; fi
  sleep 1
done
psqla -d postgres -c "SELECT 1" >/dev/null || { echo "Postgres descartável não subiu" >&2; exit 1; }
# Os próprios SQL de papéis e banco, com senhas de mentira.
docker exec -i -e PWD_MIGRADOR=x -e PWD_COLETOR=x -e PWD_API=x -e PWD_REF=x -e PWD_APONTAMENTO=x "$NOME" psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres < deploy/sql/00_papeis_e_banco.sql
export PG_MIGRADOR_URL="postgres://dspd_migrador:x@127.0.0.1:$PORTA/metricas"
# Caminho A: o runner real da aplicação (db:migrate).
pnpm --filter @metricas-dspd/server run migrate >/dev/null
gerar grants
# Caminho B: o consolidado gerado, em outro banco descartável, para provar que dá o mesmo esquema.
psqla -d postgres -c "CREATE DATABASE metricas_b ENCODING 'UTF8' TEMPLATE template0" -c "ALTER DATABASE metricas_b SET timezone TO 'UTC'" \
  -c "GRANT CONNECT, CREATE ON DATABASE metricas_b TO dspd_migrador" \
  -c "GRANT CONNECT ON DATABASE metricas_b TO dspd_coletor, dspd_api, dspd_ref, dspd_api_apontamento"
psqla -d metricas_b -c "REVOKE ALL ON SCHEMA public FROM PUBLIC"
docker exec -i "$NOME" psql -v ON_ERROR_STOP=1 -q -U dspd_migrador -d metricas_b < deploy/sql/consolidado.sql
dump() { docker exec "$NOME" pg_dump -U postgres --schema-only --no-owner "$1" | grep -v '^\\' | grep -v '^--'; }
dump metricas > "$TMP/a.sql"
dump metricas_b > "$TMP/b.sql"
if diff -q "$TMP/a.sql" "$TMP/b.sql" >/dev/null; then
  echo "OK: runner e SQL gerado produzem o mesmo esquema ($(wc -l < "$TMP/a.sql") linhas de dump)"
else
  diff "$TMP/a.sql" "$TMP/b.sql" | head -40
  echo "DIFERENCA entre runner e SQL gerado" >&2
  exit 1
fi
n_a=$(psqla -d metricas -tA -c "SELECT count(*) FROM dspd_core.pgmigrations")
n_b=$(psqla -d metricas_b -tA -c "SELECT count(*) FROM dspd_core.pgmigrations")
[ "$n_a" = "$n_b" ] || { echo "pgmigrations difere: $n_a x $n_b" >&2; exit 1; }
echo "OK: $n_a migracoes registradas nos dois caminhos"
