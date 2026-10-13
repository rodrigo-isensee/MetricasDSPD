#!/bin/bash
# Repara um volume ANTIGO do Postgres (criado antes da migração 0013) sem apagá-lo: cria o papel `dspd_pesquisa` se faltar
# e concede CONNECT nos databases. Idempotente (rodar de novo não muda nada). Roda como administrador; o init do Compose
# só roda em volume novo, e o migrador (`dspd_migrador`) não pode criar papel nem conceder CONNECT.
# Uso: DSPD_PWD_PESQUISA=... bash docker/postgres/reparar-papeis.sh [banco ...]   (padrão: metricas metricas_test)
# Dentro do contêiner de dev: docker compose exec -e DSPD_PWD_PESQUISA=... -T postgres bash -s < docker/postgres/reparar-papeis.sh
set -euo pipefail

: "${DSPD_PWD_PESQUISA:?defina DSPD_PWD_PESQUISA (a senha do papel dspd_pesquisa)}"
USUARIO="${POSTGRES_USER:-postgres}"
BANCOS=("$@")
[ ${#BANCOS[@]} -gt 0 ] || BANCOS=(metricas metricas_test)

psql -v ON_ERROR_STOP=1 --username "$USUARIO" --dbname postgres -v pwd_pesquisa="$DSPD_PWD_PESQUISA" <<'SQL'
SELECT 'CREATE ROLE dspd_pesquisa LOGIN PASSWORD ' || quote_literal(:'pwd_pesquisa')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dspd_pesquisa')
\gexec
SQL

for banco in "${BANCOS[@]}"; do
  [[ "$banco" =~ ^[a-z_][a-z0-9_]*$ ]] || { echo "nome de banco inválido: $banco" >&2; exit 1; }
  psql -v ON_ERROR_STOP=1 --username "$USUARIO" --dbname postgres -c "GRANT CONNECT ON DATABASE $banco TO dspd_pesquisa"
done
