-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- Roda UMA vez, como administrador, conectado ao banco `postgres` (psql 15 ou mais novo, por causa do \getenv).
-- Antes, no shell do DBA: `read -rs <VARIAVEL>; export <VARIAVEL>` para cada uma de PWD_MIGRADOR, PWD_COLETOR, PWD_API, PWD_REF, PWD_APONTAMENTO; `unset` ao terminar.
--   psql "host=<servidor> dbname=postgres sslmode=verify-full" -v ON_ERROR_STOP=1 -f 00_papeis_e_banco.sql
-- Variável ausente ou vazia: o script para antes do primeiro CREATE e diz qual falta (falha fechada, nada é criado). Nenhuma senha vai na linha de comando; os SET do começo (antes de qualquer comando que leia uma senha) tiram o comando com senha do log do servidor, mesmo com log_statement=all, log_min_duration_statement=0 ou erro no CREATE ROLE.
-- webhook, automação e pesquisa ficam NOLOGIN, sem senha e sem CONNECT (existem só para os GRANTs das migrações); ligar um deles é decisão do dono.
-- Se falhar no meio, nada é desfeito sozinho: veja "Se o roteiro de papéis falhar" em docs/devops/105-implantacao-vm.md.
-- Se a empresa já criou o banco `metricas` (UTF8), apague a linha CREATE DATABASE.
\set ON_ERROR_STOP on
SET log_statement = 'none';
SET log_min_duration_statement = -1;
SET log_min_error_statement = panic;
\getenv pwd_migrador PWD_MIGRADOR
\getenv pwd_coletor PWD_COLETOR
\getenv pwd_api PWD_API
\getenv pwd_ref PWD_REF
\getenv pwd_apontamento PWD_APONTAMENTO
\if :{?pwd_migrador}
\else
  DO $$ BEGIN RAISE EXCEPTION 'falta a variável de ambiente PWD_MIGRADOR; nada foi criado'; END $$;
\endif
SELECT (btrim(:'pwd_migrador') = '') AS pwd_migrador_vazia \gset
\if :pwd_migrador_vazia
  DO $$ BEGIN RAISE EXCEPTION 'PWD_MIGRADOR está vazia ou só de espaços; nada foi criado'; END $$;
\endif
\if :{?pwd_coletor}
\else
  DO $$ BEGIN RAISE EXCEPTION 'falta a variável de ambiente PWD_COLETOR; nada foi criado'; END $$;
\endif
SELECT (btrim(:'pwd_coletor') = '') AS pwd_coletor_vazia \gset
\if :pwd_coletor_vazia
  DO $$ BEGIN RAISE EXCEPTION 'PWD_COLETOR está vazia ou só de espaços; nada foi criado'; END $$;
\endif
\if :{?pwd_api}
\else
  DO $$ BEGIN RAISE EXCEPTION 'falta a variável de ambiente PWD_API; nada foi criado'; END $$;
\endif
SELECT (btrim(:'pwd_api') = '') AS pwd_api_vazia \gset
\if :pwd_api_vazia
  DO $$ BEGIN RAISE EXCEPTION 'PWD_API está vazia ou só de espaços; nada foi criado'; END $$;
\endif
\if :{?pwd_ref}
\else
  DO $$ BEGIN RAISE EXCEPTION 'falta a variável de ambiente PWD_REF; nada foi criado'; END $$;
\endif
SELECT (btrim(:'pwd_ref') = '') AS pwd_ref_vazia \gset
\if :pwd_ref_vazia
  DO $$ BEGIN RAISE EXCEPTION 'PWD_REF está vazia ou só de espaços; nada foi criado'; END $$;
\endif
\if :{?pwd_apontamento}
\else
  DO $$ BEGIN RAISE EXCEPTION 'falta a variável de ambiente PWD_APONTAMENTO; nada foi criado'; END $$;
\endif
SELECT (btrim(:'pwd_apontamento') = '') AS pwd_apontamento_vazia \gset
\if :pwd_apontamento_vazia
  DO $$ BEGIN RAISE EXCEPTION 'PWD_APONTAMENTO está vazia ou só de espaços; nada foi criado'; END $$;
\endif
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
