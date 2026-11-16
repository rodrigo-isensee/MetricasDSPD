-- Papéis do banco da empresa para produção (pedido 105, E7.270). Rodado pelo DBA (superusuário ou dono do banco), uma vez.
-- Nenhuma senha aqui: cada \getenv lê a variável de ambiente do shell do DBA (não passa por -v, não vai ao histórico nem à lista de processos).
-- Uso: exportar PWD_MIGRADOR, PWD_COLETOR, PWD_API, PWD_REF e PWD_APONTAMENTO (read -rs, sem echo; ver docs/devops/105-implantacao-vm.md) e rodar
--   psql "host=<host> dbname=postgres sslmode=require" -v ON_ERROR_STOP=1 -f deploy/sql/papeis-producao.sql   (psql 15 ou mais novo)
\getenv pwd_migrador PWD_MIGRADOR
\getenv pwd_coletor PWD_COLETOR
\getenv pwd_api PWD_API
\getenv pwd_ref PWD_REF
\getenv pwd_apontamento PWD_APONTAMENTO

CREATE ROLE dspd_migrador LOGIN PASSWORD :'pwd_migrador';
CREATE ROLE dspd_coletor LOGIN PASSWORD :'pwd_coletor';
CREATE ROLE dspd_api LOGIN PASSWORD :'pwd_api';
CREATE ROLE dspd_ref LOGIN PASSWORD :'pwd_ref';
CREATE ROLE dspd_api_apontamento LOGIN PASSWORD :'pwd_apontamento';
-- Sem uso em produção por enquanto: existem para os GRANTs das migrações, mas NÃO entram (NOLOGIN, sem senha).
-- Para ligar um deles: ALTER ROLE <papel> LOGIN PASSWORD ... (decisão do dono, junto com o serviço que o usa).
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
