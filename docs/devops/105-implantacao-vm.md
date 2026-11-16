# Implantação na VM da empresa (produção)

Pedido 105-melhorias-15-11, etapa E7.270. A empresa fornece o PostgreSQL 17 e o HTTPS; a VM roda a API, o painel e as coletas. Recomendações de segurança do pedido. Nada aqui foi executado na VM.

## 1. O que muda em relação ao `docker-compose.yml`

`docker-compose.prod.yml` é o único que vale em produção; o `docker-compose.yml` é de desenvolvimento e tem senhas `_dev`.

- Sem serviço `postgres`: o banco é o da empresa (`DB_HOST`, `DB_PORT`, `DB_NOME`).
- Sem senha padrão: `DSPD_PWD_MIGRADOR`, `DSPD_PWD_API`, `DSPD_PWD_APONTAMENTO`, `DSPD_PWD_COLETOR`, `DSPD_PWD_REF` e `DB_HOST` usam `${VAR:?mensagem}`; sem valor, o Compose recusa montar e subir.
- TLS: todas as URLs (migrador, api, api_apontamento, coletor, ref) levam `?sslmode=${DB_SSLMODE:-require}`. Com CA privada da empresa, use `DB_SSLMODE=verify-full` e entregue a CA ao contêiner (`NODE_EXTRA_CA_CERTS` no ambiente, PEM em volume somente leitura); combine com o DBA.
- Papéis `dspd_webhook`, `dspd_automacao` e `dspd_pesquisa` ficam NOLOGIN (`deploy/sql/papeis-producao.sql`); nenhuma URL deles existe no compose de produção, então o webhook do BusinessMap fica desligado. Ligar um deles é decisão do dono: `ALTER ROLE ... LOGIN PASSWORD ...` pelo DBA e a URL no compose.
- `APONTAMENTO_NOMES` fixo em `0` (nome real nunca em servidor). Portas só em `127.0.0.1`; o HTTPS é do proxy reverso da empresa.

## 2. Variáveis (só nomes; nenhum valor em arquivo versionado)

`/etc/metricas-dspd/compose.env` (dono root, 600): `DB_HOST`, `DB_PORT` (5432), `DB_NOME` (metricas), `DB_SSLMODE` (require) e os cinco `DSPD_PWD_*` acima. `POSTGRES_PASSWORD` não existe em produção. Os segredos da coleta ficam no `coleta.env`, como no runbook (`docs/devops/runbook-coleta-diaria.md`, item 3).

## 3. O que pedir ao DBA

1. Banco `metricas` e os papéis, rodando `deploy/sql/papeis-producao.sql`. As senhas vão por variável de ambiente lida pelo `psql` (`\getenv`), nunca por `-v senha=...` (fica no histórico do shell e na lista de processos): `read -rs PWD_API; export PWD_API` para cada uma e `unset` ao terminar. Para a conexão do próprio DBA, `~/.pgpass` com permissão 600 e `PGSSLMODE=require`.
2. TLS obrigatório no servidor (`hostssl` no `pg_hba.conf`), com a CA em que o cliente deve confiar.
3. Backup cifrado em repouso e em trânsito, com acesso restrito a quem opera o banco, retenção definida e restauração testada (pedir a data do último teste). O banco tem dado pessoal sob a LGPD; o backup herda a restrição.
4. `dspd_migrador` com DDL só no banco `metricas`; os demais papéis não são donos de nada (as migrações aplicam os GRANTs).

## 4. Quem pode usar o Docker

Estar no grupo `docker` equivale a ser root na VM (monta qualquer diretório e lê os `.env`). Só o administrador responsável pela implantação (o dono e, no máximo, um substituto nomeado) entra nele; desenvolvedores e contas de serviço não. Rever `getent group docker` a cada release.

## 5. Subir em produção

Como root, na VM:

```
cd /opt/metricas-dspd
export COMPOSE_FILE=docker-compose.prod.yml
export COMPOSE_ENV_FILES=/etc/metricas-dspd/compose.env
docker compose config -q
docker compose build
docker compose up -d
docker compose ps
curl -fsS http://127.0.0.1:3000/health/ready
```

`docker compose config -q` falha com "defina ..." se faltar variável. As unidades de `deploy/systemd/` chamam `docker compose --profile coleta run --rm coleta ...`: ponha `COMPOSE_FILE` e `COMPOSE_ENV_FILES` (mesmos valores) no `/etc/metricas-dspd/host.env`, lido por `EnvironmentFile`, senão elas usariam o Compose de desenvolvimento. Confira antes de ligar os timers.

Rollback: `git checkout <tag anterior>`, `docker compose build` e `docker compose up -d`; a migração tem volta, escrita pelo dev da stack, conferida antes do deploy.

## 6. PESSOA_ELIMINADA_SAL

Na VM, sem `PESSOA_ELIMINADA_SAL` (32 caracteres ou mais) no `coleta.env`, o Apontamento para sem dado: a coleta passa a avisar disso (K-382). Defina a variável antes da primeira coleta e guarde-a com o dono: trocar o sal depois muda os identificadores já gravados.

## 7. Validação feita na entrega

`docker compose -f docker-compose.prod.yml config` sem variáveis falha com a mensagem `defina ...`; com valores fictícios monta, sem serviço postgres e com `sslmode=require` nas URLs.
