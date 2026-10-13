#!/bin/bash
# Roda uma vez, no primeiro start do volume (docker-entrypoint-initdb.d). Cria os papéis (LOGIN, senhas do ambiente),
# os databases `metricas` e `metricas_test` e fecha o schema `public`. Schemas dspd_* são criados pela migração 0001.
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
  -v pwd_migrador="$DSPD_PWD_MIGRADOR" -v pwd_coletor="$DSPD_PWD_COLETOR" -v pwd_api="$DSPD_PWD_API" \
  -v pwd_ref="$DSPD_PWD_REF" -v pwd_webhook="$DSPD_PWD_WEBHOOK" -v pwd_automacao="$DSPD_PWD_AUTOMACAO" \
  -v pwd_pesquisa="${DSPD_PWD_PESQUISA:-pesquisa_dev}" <<'SQL'
CREATE ROLE dspd_migrador LOGIN PASSWORD :'pwd_migrador';
CREATE ROLE dspd_coletor LOGIN PASSWORD :'pwd_coletor';
CREATE ROLE dspd_api LOGIN PASSWORD :'pwd_api';
CREATE ROLE dspd_ref LOGIN PASSWORD :'pwd_ref';
CREATE ROLE dspd_webhook LOGIN PASSWORD :'pwd_webhook';
CREATE ROLE dspd_automacao LOGIN PASSWORD :'pwd_automacao';
CREATE ROLE dspd_pesquisa LOGIN PASSWORD :'pwd_pesquisa';
CREATE DATABASE metricas ENCODING 'UTF8' TEMPLATE template0;
CREATE DATABASE metricas_test ENCODING 'UTF8' TEMPLATE template0;
SQL

for banco in metricas metricas_test; do
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$banco" <<SQL
ALTER DATABASE $banco SET timezone TO 'UTC';
REVOKE ALL ON DATABASE $banco FROM PUBLIC;
GRANT CONNECT ON DATABASE $banco TO dspd_migrador, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa;
GRANT CREATE ON DATABASE $banco TO dspd_migrador;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
SQL
done
