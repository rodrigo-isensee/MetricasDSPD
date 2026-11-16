-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- Roda UMA vez, como administrador, conectado ao banco `postgres`:
--   psql -v ON_ERROR_STOP=1 -h <servidor> -U <administrador> -d postgres \
--     -v pwd_migrador=... -v pwd_coletor=... -v pwd_api=... -v pwd_ref=... -v pwd_webhook=... -v pwd_automacao=... -v pwd_pesquisa=... -v pwd_apontamento=... \
--     -f 00_papeis_e_banco.sql
-- Se a empresa já criou o banco `metricas` (UTF8), apague a linha CREATE DATABASE. As senhas ficam no .env da VM, nunca aqui.
CREATE ROLE dspd_migrador LOGIN PASSWORD :'pwd_migrador';
CREATE ROLE dspd_coletor LOGIN PASSWORD :'pwd_coletor';
CREATE ROLE dspd_api LOGIN PASSWORD :'pwd_api';
CREATE ROLE dspd_ref LOGIN PASSWORD :'pwd_ref';
CREATE ROLE dspd_webhook LOGIN PASSWORD :'pwd_webhook';
CREATE ROLE dspd_automacao LOGIN PASSWORD :'pwd_automacao';
CREATE ROLE dspd_pesquisa LOGIN PASSWORD :'pwd_pesquisa';
CREATE ROLE dspd_api_apontamento LOGIN PASSWORD :'pwd_apontamento';
CREATE DATABASE metricas ENCODING 'UTF8' TEMPLATE template0;
\connect metricas
ALTER DATABASE metricas SET timezone TO 'UTC';
REVOKE ALL ON DATABASE metricas FROM PUBLIC;
GRANT CONNECT ON DATABASE metricas TO dspd_migrador, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;
GRANT CREATE ON DATABASE metricas TO dspd_migrador;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
