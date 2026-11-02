#!/bin/bash
# Repara um volume ANTIGO do Postgres (criado antes das migrações 0013 e do pedido 059) sem apagá-lo: cria os papéis `dspd_pesquisa` e
# `dspd_api_apontamento` se faltarem e concede CONNECT nos databases. Idempotente (rodar de novo não muda nada). Roda como administrador; o init do
# Compose só roda em volume novo, e o migrador (`dspd_migrador`) não pode criar papel nem conceder CONNECT.
# Uso: DSPD_PWD_PESQUISA=... DSPD_PWD_APONTAMENTO=... bash docker/postgres/reparar-papeis.sh [banco ...]   (padrão: metricas metricas_test)
# Dentro do contêiner de dev: docker compose exec -e DSPD_PWD_PESQUISA=... -e DSPD_PWD_APONTAMENTO=... -T postgres bash -s < docker/postgres/reparar-papeis.sh
set -euo pipefail

: "${DSPD_PWD_PESQUISA:?defina DSPD_PWD_PESQUISA (a senha do papel dspd_pesquisa)}"
: "${DSPD_PWD_APONTAMENTO:?defina DSPD_PWD_APONTAMENTO (a senha do papel dspd_api_apontamento)}"
USUARIO="${POSTGRES_USER:-postgres}"
BANCOS=("$@")
[ ${#BANCOS[@]} -gt 0 ] || BANCOS=(metricas metricas_test)

psql -v ON_ERROR_STOP=1 --username "$USUARIO" --dbname postgres -v pwd_pesquisa="$DSPD_PWD_PESQUISA" -v pwd_apontamento="$DSPD_PWD_APONTAMENTO" <<'SQL'
SELECT 'CREATE ROLE dspd_pesquisa LOGIN PASSWORD ' || quote_literal(:'pwd_pesquisa')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dspd_pesquisa')
\gexec
SELECT 'CREATE ROLE dspd_api_apontamento LOGIN PASSWORD ' || quote_literal(:'pwd_apontamento')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dspd_api_apontamento')
\gexec
SQL

for banco in "${BANCOS[@]}"; do
  [[ "$banco" =~ ^[a-z_][a-z0-9_]*$ ]] || { echo "nome de banco inválido: $banco" >&2; exit 1; }
  psql -v ON_ERROR_STOP=1 --username "$USUARIO" --dbname postgres -c "GRANT CONNECT ON DATABASE $banco TO dspd_pesquisa, dspd_api_apontamento"
done
