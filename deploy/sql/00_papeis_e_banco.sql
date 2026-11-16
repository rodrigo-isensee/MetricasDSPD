-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- Roda UMA vez, como administrador, conectado ao banco `postgres` (psql 15 ou mais novo, por causa do \getenv).
-- Antes, no shell do DBA: `read -rs <VARIAVEL>; export <VARIAVEL>` para cada uma de PWD_MIGRADOR, PWD_COLETOR, PWD_API, PWD_REF, PWD_APONTAMENTO; `unset` ao terminar.
--   psql "host=<servidor> dbname=postgres sslmode=verify-full" -v ON_ERROR_STOP=1 -f 00_papeis_e_banco.sql
-- Variável ausente para o script (falha fechada). Nenhuma senha vai na linha de comando; o SET abaixo evita o comando com senha no log do servidor.
-- webhook, automação e pesquisa ficam NOLOGIN, sem senha e sem CONNECT (existem só para os GRANTs das migrações); ligar um deles é decisão do dono.
-- Se falhar no meio, nada é desfeito sozinho: veja "Se o roteiro de papéis falhar" em docs/devops/105-implantacao-vm.md.
-- Se a empresa já criou o banco `metricas` (UTF8), apague a linha CREATE DATABASE.
\getenv pwd_migrador PWD_MIGRADOR
\getenv pwd_coletor PWD_COLETOR
\getenv pwd_api PWD_API
\getenv pwd_ref PWD_REF
\getenv pwd_apontamento PWD_APONTAMENTO
SET log_statement = 'none';
CREATE ROLE dspd_migrador LOGIN PASSWORD :'pwd_migrador';
CREATE ROLE dspd_coletor LOGIN PASSWORD :'pwd_coletor';
CREATE ROLE dspd_api LOGIN PASSWORD :'pwd_api';
CREATE ROLE dspd_ref LOGIN PASSWORD :'pwd_ref';
CREATE ROLE dspd_api_apontamento LOGIN PASSWORD :'pwd_apontamento';
CREATE ROLE dspd_webhook NOLOGIN;
CREATE ROLE dspd_automacao NOLOGIN;
CREATE ROLE dspd_pesquisa NOLOGIN;
CREATE DATABASE metricas ENCODING 'UTF8' TEMPLATE template0;
\connect metricas
ALTER DATABASE metricas SET timezone TO 'UTC';
REVOKE ALL ON DATABASE metricas FROM PUBLIC;
GRANT CONNECT ON DATABASE metricas TO dspd_migrador, dspd_coletor, dspd_api, dspd_ref, dspd_api_apontamento;
GRANT CREATE ON DATABASE metricas TO dspd_migrador;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
