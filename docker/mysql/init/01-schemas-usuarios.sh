#!/bin/bash
# Roda uma vez, na primeira inicialização do volume. Cria os 3 schemas e os usuários por papel.
# Os GRANTs por tabela (grants.ts) são aplicados depois das migrações: npm run db:migrate.
set -euo pipefail
mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS dspd_bm   CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS dspd_ac   CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS dspd_core CHARACTER SET utf8mb4;
CREATE USER IF NOT EXISTS 'dspd_migrador'@'%'  IDENTIFIED BY '${DSPD_PWD_MIGRADOR}';
CREATE USER IF NOT EXISTS 'dspd_coletor'@'%'   IDENTIFIED BY '${DSPD_PWD_COLETOR}';
CREATE USER IF NOT EXISTS 'dspd_api'@'%'       IDENTIFIED BY '${DSPD_PWD_API}';
CREATE USER IF NOT EXISTS 'dspd_ref'@'%'       IDENTIFIED BY '${DSPD_PWD_REF}';
CREATE USER IF NOT EXISTS 'dspd_webhook'@'%'   IDENTIFIED BY '${DSPD_PWD_WEBHOOK}';
CREATE USER IF NOT EXISTS 'dspd_automacao'@'%' IDENTIFIED BY '${DSPD_PWD_AUTOMACAO}';
GRANT ALL PRIVILEGES ON dspd_bm.*   TO 'dspd_migrador'@'%';
GRANT ALL PRIVILEGES ON dspd_ac.*   TO 'dspd_migrador'@'%';
GRANT ALL PRIVILEGES ON dspd_core.* TO 'dspd_migrador'@'%';
FLUSH PRIVILEGES;
SQL
