# Implantação na VM da empresa (pedido 105, E7.244)

Para quem não é desenvolvedor. Responde as três perguntas do git da empresa: variáveis de ambiente, comandos de produção e homologação, tecnologia base. Vale para o que será usado: **Operacional** (BusinessMap), **Apontamento** (horas do BusinessMap) e **Sustentação** (Acelerato). A versão sobe inteira, sem desligar abas (decisão do dono). Em produção vale só o `docker-compose.prod.yml` (seção 7); este documento é o único da implantação (E7.244, E7.246 e E7.270 fundidos).

Regras que valem em tudo: nenhum valor secreto neste documento (só nomes); BusinessMap e Acelerato nunca se misturam; nada aqui foi executado na VM. Onde o projeto não tem a resposta, está marcado **LACUNA**.

## 1. Variáveis de ambiente (só nomes)

Cada variável vai num arquivo `.env` no servidor, com permissão 600 (só o administrador lê). O valor é escolhido por quem instala; nenhuma senha padrão (`*_dev`) pode ficar em servidor. Os papéis `dspd_webhook`, `dspd_automacao` e `dspd_pesquisa` ficam NOLOGIN em produção: não há senha nem URL deles.

Fontes: `.env.example` (raiz), `server/.env.example`, `web/.env.example`, `.env.homolog.example`.

### 1.1 Banco de dados (produção: `/etc/metricas-dspd/compose.env`, dono root, 600)

Na VM não existe `POSTGRES_PASSWORD` (o banco é da empresa). Além das senhas abaixo, o `docker-compose.prod.yml` exige `DB_HOST` (o nome que consta no certificado do banco) e `DB_CA_ARQUIVO` (caminho do PEM da CA do banco no host) e aceita `DB_PORT` (5432) e `DB_NOME` (metricas). Senha só com caracteres seguros para URL (`openssl rand -hex 32`): `@`, `:`, `/`, `#` ou `%` quebram a conexão, pois o Compose não as codifica.

| Variável | Para que serve | Obrigatória? | De onde vem |
|---|---|---|---|
| `DSPD_PWD_MIGRADOR` | Senha do papel que cria e altera tabelas | Sim | `.env.example`, `.env.homolog.example` |
| `DSPD_PWD_COLETOR` | Senha do papel das coletas (grava dados) | Sim | `.env.example`, `.env.homolog.example` |
| `DSPD_PWD_API` | Senha do papel que a API usa só para ler | Sim | `.env.example`, `.env.homolog.example` |
| `DSPD_PWD_REF` | Senha do papel que carrega as referências (listas, calendário) | Sim | `.env.example`, `.env.homolog.example` |
| `DSPD_PWD_APONTAMENTO` | Senha do papel que serve a aba Apontamento | Sim (Apontamento será usado) | `.env.example`, `.env.homolog.example` |
| `PG_MIGRADOR_URL` | Endereço de conexão do migrador, usado ao rodar comandos do projeto fora do Docker (migrar, `criterios-classe-servico`) | Sim para esses comandos fora do Docker | `.env.example` |
| `PG_COLETOR_URL` | Endereço de conexão do coletor, para coletas fora do Docker | Sim para coletas fora do Docker | `.env.example` |
| `PG_REF_URL` | Endereço de conexão do papel de referência (`*:ref-sync`, `ref:sync-calendario`). Sem ele vale `PG_COLETOR_URL` + `DSPD_PWD_REF` | Uma das duas formas | `.env.example` |
| `PG_API_URL` | Endereço de conexão da API, só quando a API roda fora do Docker | Não (o Docker monta sozinho) | `.env.example` |
| `PG_PORT` | Porta do banco no servidor (padrão 5432, só em 127.0.0.1) | Não | `.env.example` |
| `PG_TESTE_URL` | Banco só dos testes automáticos | Não (não usar em servidor) | `.env.example`, `server/.env.example` |

Os endereços `PG_*_URL` embutem a senha: por isso ficam só no `.env` e nunca em log ou chat.

### 1.2 API e painel

| Variável | Para que serve | Obrigatória? | De onde vem |
|---|---|---|---|
| `API_PORT` | Porta da API no servidor (padrão 3000, só em 127.0.0.1) | Não | `.env.example` |
| `WEB_PORT` | Porta do painel (padrão 8080, só em 127.0.0.1) | Não | `.env.example` |
| `LOG_LEVEL` | Nível de detalhe do log (padrão `info`) | Não | `.env.example` |
| `APONTAMENTO_NOMES` | `0` (padrão): a aba Apontamento mostra "Pessoa n". `1`: nome real | Não. **Deixe `0` no servidor**: o próprio arquivo diz "nunca em homologação, CI ou servidor" | `.env.example` |
| `PG_APONTAMENTO_URL`, `APONTAMENTO_REDE_LOCAL`, `APONTAMENTO_PUBLICACAO_LOOPBACK` | Só para a API rodando fora do Docker ou com nome real. No Docker o `docker-compose.yml` já monta | Não | `.env.example` |
| `WEBHOOK_BM_SEGREDO` (e `PG_WEBHOOK_URL`) | Liga o recebimento de avisos do BusinessMap (16+ caracteres) | Não; não faz parte do que será usado | `.env.example` |
| `DADOS_FONTE`, `MOCK_SEMENTE`, `DSPD_SCHEMA_PREFIXO`, `DSPD_SCHEMA_PREFIXO_SEED` | Dados fictícios e testes | Não (desenvolvimento; a API recusa `DADOS_FONTE` e `DSPD_SCHEMA_PREFIXO_SEED`) | `.env.example` |
| `VITE_FONTE`, `VITE_API_BASE`, `VITE_MOCK_*` | Escolha de fonte do painel (`api` em produção, `mock` só demonstração). Valem na construção da imagem, nunca são segredo | Não (a imagem de produção já constrói com `api`) | `web/.env.example`, `docker/web/Dockerfile` |

### 1.3 Coleta do BusinessMap (Operacional e Apontamento)

Ficam em `/etc/metricas-dspd/coleta.env`, lido só pelo serviço de coleta (`docs/devops/runbook-coleta-diaria.md`, item 3).

| Variável | Para que serve | Obrigatória? | De onde vem |
|---|---|---|---|
| `BUSINESSMAP_URL_BASE` | Endereço do BusinessMap | Sim | `.env.example` |
| `BUSINESSMAP_APIKEY` | Chave de acesso (a do dono; nunca em log nem no git) | Sim | `.env.example` |
| `BUSINESSMAP_QUADROS_IDS` | Quais quadros coletar | Sim | `.env.example` |
| `PESSOA_ELIMINADA_SAL` | Texto secreto de 32+ caracteres, necessário à carga de Apontamento | Sim (Apontamento) | `server/src/plataforma/config.ts`, runbook; consta no `.env.example` |
| `BUSINESSMAP_LIMITE_POR_MINUTO` | Teto de chamadas por minuto (máx. 25) | Não | `.env.example` |
| `BUSINESSMAP_TIMEOUT_MS`, `BUSINESSMAP_PAGINA_TAMANHO` | Tempo limite e tamanho de página | Não | `.env.example` |

### 1.4 Coleta do Acelerato (Sustentação)

Também em `coleta.env`. Só leitura, e o certificado do servidor é obrigatório.

| Variável | Para que serve | Obrigatória? | De onde vem |
|---|---|---|---|
| `ACELERATO_MYSQL_HOST`, `_PORT`, `_DATABASE` | Onde está o banco do Acelerato | Sim | `.env.example` |
| `ACELERATO_MYSQL_USER`, `_PASSWORD` | Conta de leitura | Sim | `.env.example` |
| `ACELERATO_MYSQL_TLS_SHA256` | Impressão digital do certificado do servidor | Sim | `.env.example` |
| `ACELERATO_MYSQL_TLS_CERT_FILE` | Caminho do certificado (`/segredos/acelerato.pem` no Docker) | Sim | `.env.example` |
| `ACELERATO_MYSQL_MAX_EXEC_MS`, `_MARGEM_HORAS` | Tempo máximo (120000) e margem de releitura (24) | Não | `.env.example` |

### 1.5 Do servidor (não vêm de `.env.example`)

| Variável | Para que serve | Obrigatória? | De onde vem |
|---|---|---|---|
| `AVISO_EMAIL` (em `/etc/metricas-dspd/host.env`) | E-mail que recebe o aviso de falha da coleta | Sim, se quiser o aviso | runbook, item 3 |
| `COLETA_ENV_FILE`, `COLETA_SEGREDOS_DIR` | Outros caminhos para `coleta.env` e para o certificado | Não | `docker-compose.yml`, runbook |
| `DSPD_BACKUP_DIR` e outras `DSPD_BACKUP_*` | Pasta do backup (obrigatória para o script de backup) | Sim, se usar o backup | `docs/engineering/operacao-banco.md` |

### 1.6 Homologação (`.env.homolog`)

Modelo: `.env.homolog.example`. Tem `HOMOLOG_PG_SUPERUSER_PWD` (senha do administrador, obrigatória) e as mesmas `DSPD_PWD_*` da seção 1.1 (as do banco local de homologação, que sobe o próprio Postgres), todas obrigatórias e sem valor padrão. Opcionais: `HOMOLOG_PG_PORT` (15432), `HOMOLOG_API_PORT` (13000), `HOMOLOG_WEB_PORT` (18080). **A homologação usa só dados fictícios**: não leva chave do BusinessMap nem senha do Acelerato.

## 2. Comandos

Todos na pasta do projeto na VM, na versão liberada pelo dono (`R-MAIN`: nunca `main` sem o merge dele). `pnpm` precisa estar instalado (seção 3). Os comandos com `pnpm` leem o `.env` da raiz sozinhos.

### 2.1 Produção

1. **Preparar:** ter o `/etc/metricas-dspd/compose.env` (seção 1.1) e a CA do banco. `pnpm` só é necessário para os comandos de referência dos itens 3 e 4 fora do Docker.
2. **Subir migração, API e painel (Docker, sem banco local):** `docker compose -f docker-compose.prod.yml config -q`, `build` e `up -d` (seção 7). O serviço `migrate` roda sozinho antes da API. O painel fica em `http://127.0.0.1:8080`, a API em `127.0.0.1:3000`. **Não use `pnpm run stack:up` em servidor**: ele sobe o Compose de desenvolvimento (banco local, senhas `_dev`).
3. **Migrar o banco à mão** (quando só o banco mudou): `pnpm run db:migrate`. Antes, faça o backup (`scripts/db-backup.sh`, `docs/engineering/operacao-banco.md`).
4. **Sincronizar as referências** (carregam listas, calendário e critérios; seguros de repetir, não chamam BusinessMap nem Acelerato, exceto o último que só grava). Ordem sugerida, depois do passo 3:
   - `pnpm --filter @metricas-dspd/server run bm:ref-sync`: dicionário do BusinessMap (`businessmap-dominio.json`).
   - `pnpm --filter @metricas-dspd/server run ac:ref-sync`: listas e alvos de prazo do Acelerato. Não rode duas vezes no mesmo dia (confunde a data de vigência dos alvos).
   - `pnpm --filter @metricas-dspd/server run ref:sync-calendario`: calendários e feriados (`calendario.json`).
   - `pnpm --filter @metricas-dspd/server run bm:ref-sync-apontamento`: dicionário de subgrupos do Apontamento.
   - `pnpm --filter @metricas-dspd/server run bm:criterios-classe-servico AAAA-MM-DD`: registra a data do critério "classe pela prioridade" (`105:classe-pela-prioridade`) para a marca nos gráficos. Só grava uma vez; rode depois da primeira carga do BusinessMap, com a data dessa carga.
   Cada comando aceita uma data opcional `AAAA-MM-DD` (vigência; sem data vale hoje, horário de Brasília).
5. **Primeira carga (manual, com o dono presente; não é agendada):**
   - BusinessMap: `pnpm --filter @metricas-dspd/server run bm:coleta carga-inicial --projetar`
   - Apontamento: `pnpm --filter @metricas-dspd/server run bm:apontamento carga-inicial` (precisa do dicionário do item 4 e da carga de cards feita antes)
   - Acelerato: `pnpm run coleta ac`
6. **Coletas diárias, agendadas pelo systemd** (`deploy/systemd/`, instalação no `docs/devops/runbook-coleta-diaria.md`, item 4):
   - BusinessMap, todo dia 06:00: `src/entradas/coleta-businessmap.ts incremental --projetar`. O Apontamento incremental roda como etapa desta coleta (comentário em `server/src/entradas/apontamento-businessmap.ts`), sem timer próprio.
   - Acelerato, todo dia 06:30: `src/entradas/coleta.ts ac`; releitura aos domingos 07:30: `coleta.ts ac --releitura`.
   - Ligar: `systemctl enable --now metricas-coleta-businessmap.timer metricas-coleta-acelerato.timer metricas-coleta-acelerato-releitura.timer metricas-referencias.timer` (este, domingo 05:00, roda as quatro sincronizações de referência); conferir com `systemctl list-timers 'metricas-*'` (o padrão `metricas-coleta-*` não lista o `metricas-referencias.timer`).
   - Falha: e-mail ao `AVISO_EMAIL`; log em `journalctl -u metricas-coleta-businessmap.service`.
7. **Parar:** `docker compose -f docker-compose.prod.yml down` (o banco é da empresa; os dados ficam lá).
8. **Backup:** `scripts/db-backup.sh`, diário 03:30, e teste de restauração aos domingos 04:30 (`docs/engineering/operacao-banco.md`). Agendamento descrito só para Windows/WSL e cron: **LACUNA** para o agendador da VM (cron serve, o texto existente já traz o modelo).

Cuidado: o `docker-compose.yml` (desenvolvimento) usa senhas padrão públicas se faltar variável. O de produção falha em vez de assumir padrão: use sempre `-f docker-compose.prod.yml`.

### 2.2 Homologação

Ambiente separado, só dados fictícios, portas 15432/13000/18080 em 127.0.0.1 (`docs/engineering/fluxo-homologacao.md`, `docker-compose.homolog.yml`).

1. `cp .env.homolog.example .env.homolog`, preencher as senhas (12+ caracteres, nada de `*_dev`) e `chmod 600 .env.homolog`.
2. Subir (constrói, migra, carrega dados fictícios e faz o teste de fumaça): `pnpm run homolog:subir`. Abrir `http://127.0.0.1:18080`.
3. Conferir de novo: `pnpm run homolog:smoke`.
4. Testar a migração a partir da versão em produção: `pnpm run homolog:migracao -- --origem <pasta da main> --destino .`
5. Derrubar: `pnpm run homolog:derrubar` (com `-- --volume` apaga também o banco de homologação).

Não há coleta agendada nem referências reais em homologação.

## 3. Tecnologia base

| Item | Resposta | Fonte |
|---|---|---|
| Linguagem | TypeScript (JavaScript tipado), em módulos ES | `package.json`, `tsconfig.base.json` |
| Ambiente de execução | Node.js 24 ou mais novo (as imagens usam `node:24-slim`) | `package.json` (`engines`), `server/Dockerfile` |
| Back-end | Fastify 5 (API), `tsx` para executar o TypeScript, `zod` para validar, `pino` para log, `node-pg-migrate` para as migrações do banco | `server/package.json` |
| Front-end | React 19, Vite 8, TanStack Query 5, Recharts 3; em produção servido por nginx, que repassa `/api` para a API | `web/package.json`, `docker/web/Dockerfile`, `docker/web/nginx.conf` |
| Banco de dados | PostgreSQL 17 (imagem `postgres:17`), um banco `metricas`; acesso por vários papéis com permissão mínima | `docker-compose.yml` |
| Fonte do Acelerato | Leitura direta do banco MySQL do Acelerato (driver `mariadb`), só leitura, TLS fixado | `server/package.json`, `.env.example` |
| Gerenciador de pacotes | pnpm 10.34.6 (repositório com vários pacotes, `pnpm-workspace.yaml`), instalação travada pelo `pnpm-lock.yaml` | `package.json` (`packageManager`) |
| Contêineres | Docker Engine com Compose 2.24 ou mais novo | `docker-compose.prod.yml`, runbook item 2 |
| Agendamento | systemd (timers) na VM | `deploy/systemd/` |
| Testes | Vitest, fast-check; E2E em `e2e/` | `package.json` |
| Comando de pronto | `pnpm run pronto` | `package.json`, `CLAUDE.md` |

## 4. Lacunas e avisos

- **Compose de produção:** existe (`docker-compose.prod.yml`, seção 7). **LACUNA:** nada fixa as imagens base por digest (`node:24-slim`, `nginx:alpine`).
- **LACUNA: acesso de outras máquinas.** As portas 8080 e 3000 abrem só em `127.0.0.1`. Para a equipe abrir o painel de outro computador falta decidir proxy reverso e HTTPS; o projeto não traz isso.
- **LACUNA: Apontamento na VM.** O runbook da coleta só descreve BusinessMap e Acelerato. A carga inicial do Apontamento e o `PESSOA_ELIMINADA_SAL` (já no `.env.example`) estão no código, mas falta um roteiro de VM. A medição de duração das coletas segue pendente.
- **Referências no agendador.** O `metricas-referencias.timer` (domingo 05:00) roda, em sequência, as quatro sincronizações de referência da seção 2.1, item 4: BusinessMap, Acelerato, calendário e subgrupos do Apontamento (`deploy/systemd/metricas-referencias.service`). Seguem manuais, com o dono presente, a carga inicial (item 5) e `bm:criterios-classe-servico` (item 4), que usa o papel migrador, não entregue ao container de coleta, e grava uma vez só. A ADR 0022 item 4 trata só da carga inicial; o runbook `docs/devops/runbook-coleta-diaria.md` traz as duas coisas.
- **LACUNA: versão do Node em arquivo.** Não há `.nvmrc`; vale `engines` (24 ou mais novo).
- **Roteiros K-333 e K-216:** os dois são do computador local (`docs/devops/104-roteiro-dono.md`, `docs/devops/105-roteiro-dono.md`), não da VM. K-216 confirma que a API do Compose monta sozinha a conexão do Apontamento a partir de `DSPD_PWD_APONTAMENTO`; o K-333 lista a ordem carga a carga que a seção 2.1 reaproveita. Os cartões K-333, K-216 e K-340 (VM) não aparecem no `KANBAN.md` desta branch; usei os roteiros em `docs/devops/`.
- **Divergência a decidir:** o `CLAUDE.md` descreve o Acelerato como "API pública, só GET", e o código lê o banco MySQL em modo leitura (`.env.example`, ADR 0023). Este documento segue o código; o git da empresa deve receber a versão correta.
- **Critério de classe de serviço:** o roteiro 105 cita `105:classe-por-etiqueta`; o código atual registra `105:classe-pela-prioridade` (`server/src/entradas/criterios-classe-servico.ts`). Vale o código.

## 5. O que pedir à infraestrutura (texto para o chamado, E7.246)

Decisão do dono: **a empresa fornece o banco e o HTTPS**; o time pede tudo o que o sistema precisa. Cada item traz o motivo e o arquivo que o justifica. **Sim** na última coluna = obrigatório no primeiro dia (sem isso a primeira carga não roda). Nenhum valor secreto vai no chamado: só o tipo de acesso; o valor chega ao dono por canal próprio. Sem custo de nuvem (`R-CUSTO`): tudo roda na VM e no banco interno da empresa.

| # | Pedido | Por quê / arquivo | 1º dia? |
|---|---|---|---|
| 1 | **VM Linux** (Debian/Ubuntu LTS, com systemd), 4 vCPU, 8 GB de RAM, 60 GB de disco (dados, imagens e backups locais; cresce com o histórico). É estimativa: o projeto não mediu a coleta na VM (seção 4). | Roda API, painel e coletas. `docker-compose.yml`, `deploy/systemd/` | Sim |
| 2 | **Node.js 24 ou mais novo e pnpm 10.34.6**, e **Docker Engine com Compose 2.24+** (API e painel sobem por Compose). Conta de serviço sem login interativo para as coletas. | Comandos da seção 2.1. `package.json` (`engines`, `packageManager`), `server/Dockerfile` | Sim |
| 3 | **PostgreSQL 17 gerenciado**, 1 banco `metricas` em UTF8, fuso `UTC`, sem extensões (o SQL gerado não usa `CREATE EXTENSION`). Tamanho inicial 20 GB, a redimensionar depois da carga. | Base analítica. `deploy/sql/`, `docker-compose.yml` (`postgres:17`) | Sim |
| 4 | **Cinco papéis de login no banco**, permissão mínima, sem superusuário: `dspd_migrador` (cria e altera tabelas), `dspd_coletor` (grava as coletas), `dspd_api` (só lê; nunca coluna de pessoa), `dspd_ref` (carga de referências), `dspd_api_apontamento` (só a aba Apontamento); e **três papéis NOLOGIN, sem senha e sem CONNECT** (`dspd_webhook`, `dspd_automacao`, `dspd_pesquisa`, só para os GRANTs das migrações). Senhas escolhidas pelo dono e passadas por variável de ambiente. O DBA cria com `deploy/sql/00_papeis_e_banco.sql`. | `CLAUDE.md` (GRANT por coluna). `docker/postgres/init/01-databases-papeis.sh`, `server/src/plataforma/db/grants.ts` | Sim |
| 5 | **Conexão da VM ao banco**: host e porta liberados no firewall, TLS exigido (`hostssl` no `pg_hba.conf`) com certificado cujo nome seja o de `DB_HOST`, e a CA para a VM; `CONNECT` dos cinco papéis de login no banco `metricas`. | `PG_*_URL`, seção 1.1 | Sim |
| 6 | **Backup do banco com retenção** (sugestão: diário, 14 dias, mais um mensal por 6 meses) e **teste de restauração** periódico, pela empresa ou com `scripts/db-backup.sh`; combinar quem restaura e em quanto tempo. O backup é cifrado em repouso e em trânsito, com acesso só de quem opera o banco (tem dado pessoal, LGPD). **Depois de restaurar, reaplicar a eliminação a pedido (`cfg_pessoa_eliminada`) antes de reabrir o painel**, e alinhar a retenção do backup a ela: restaurar um backup antigo traz de volta pessoa já eliminada. | O histórico nunca é recriado (nada se sobrescreve). `docs/engineering/operacao-banco.md` | Sim |
| 7 | **Nome (DNS), certificado HTTPS e proxy reverso** repassando para `127.0.0.1:8080` (painel; o nginx dele já leva `/api` à API) e mantendo o cabeçalho `Host` original. Só o painel é publicado; a API (`127.0.0.1:3000`) não. | A aba Apontamento valida `Host` e `Origin`. `docker/web/nginx.conf`. Hoje o projeto não traz proxy nem HTTPS (seção 4) | Sim |
| 8 | **Quem pode abrir o painel**: faixa de rede ou VPN interna, ou grupo; e se a empresa oferece login único. **Decisão do dono**: o projeto não tem login próprio. | LGPD; `CLAUDE.md` (nenhuma métrica individual) | Sim |
| 9 | **Saída de rede da VM para o BusinessMap**: HTTPS (443) ao endereço da empresa, sem inspeção que quebre o certificado. O endereço entra em `BUSINESSMAP_URL_BASE` (variável, não está no código). | Coleta do Operacional e do Apontamento. `.env.example`, `docs/devops/runbook-coleta-diaria.md` | Sim |
| 10 | **Saída de rede da VM para o Acelerato**: o código lê o **banco MySQL** do Acelerato, só leitura, com TLS fixado (não a API HTTP; divergência com o `CLAUDE.md` na seção 4). Host e porta em `ACELERATO_MYSQL_HOST` e `_PORT`. | Coleta da Sustentação. `.env.example`, ADR 0023 | Sim, se a Sustentação sobe no 1º dia |
| 11 | **Acessos de leitura, criados pela área dona de cada sistema** (só o tipo; o valor vai ao dono): (a) BusinessMap: **conta de serviço só leitura**, limitada aos quadros de `BUSINESSMAP_QUADROS_IDS`, com rotação combinada, no lugar da chave pessoal do dono (`BUSINESSMAP_APIKEY`); (b) Acelerato: conta MySQL **só com SELECT na tabela `ACELERATO_CHAMADOS`** (por coluna da lista de campos permitidos da coleta, quando possível; `server/src/modulos/acelerato/sql.ts`), o certificado do servidor (`.pem`) e a impressão digital SHA-256 (`ACELERATO_MYSQL_USER`, `_PASSWORD`, `_TLS_CERT_FILE`, `_TLS_SHA256`). Nenhuma conta com escrita. | `.env.example`, `server/src/plataforma/config.ts` | Sim |
| 12 | **Agendamento**: systemd na VM, com 4 timers (BusinessMap 06:00, Acelerato 06:30, releitura do Acelerato domingo 07:30, referências domingo 05:00) e o do backup (03:30), se for o `db-backup.sh`. | `deploy/systemd/`, runbook item 4 | Sim |
| 13 | **E-mail de saída (relay SMTP) ou outro canal** para o aviso de falha da coleta (`AVISO_EMAIL`), com o endereço de quem recebe. | `deploy/systemd/aviso-falha.sh`, runbook item 3 | Não (recomendado) |
| 14 | **Monitoramento e logs**: logs da VM e dos contêineres retidos (sugestão: 30 dias) e visíveis a quem opera; alerta de disco cheio, contêiner parado e coleta que falhou; relógio sincronizado (NTP). | `GET /health` da API; `journalctl -u 'metricas-coleta-*'` | Não (recomendado) |
| 15 | **Acesso administrativo**: SSH por chave e `sudo` para instalar e ligar os timers, só para a lista nominal que o dono enviar; sem acesso direto ao banco para quem não é do DBA. | `R-CONFORMIDADE`: acessos e segredos são do dono | Sim |
| 16 | **Saída para os repositórios de pacotes** (npm e imagens `postgres`, `node`, `nginx`) ou espelho interno, só para instalar e atualizar. Sem isso, a empresa leva as imagens e o cache do `pnpm` prontos. | `pnpm install --frozen-lockfile`, `docker compose build` | Sim |

## 6. Migrações do banco para o DBA (E7.246)

O banco é da empresa. O mesmo esquema chega por **duas formas**, com o mesmo resultado (o comando de geração prova isso).

**Forma A, pela aplicação.** Com papéis e banco já criados pelo DBA (passo 1 abaixo), na VM: `pnpm run db:migrate`. Roda como `dspd_migrador` (`PG_MIGRADOR_URL`), aplica as migrações em uma transação e depois os GRANTs. É o caminho das atualizações.

**Forma B, SQL aplicado pelo DBA.** Arquivos em `deploy/sql/` (gerados; não edite à mão):

| Arquivo | O que é | Quem roda e onde |
|---|---|---|
| `00_papeis_e_banco.sql` | Cria os cinco papéis de login e os três NOLOGIN e o banco `metricas`, concede `CONNECT` só aos cinco de login e fecha o schema `public`. Senhas por variável de **ambiente** lida pelo `psql` (`\getenv`), nunca por `-v` nem no arquivo | Administrador, banco `postgres`, **uma vez**. Se o banco já existe, apague a linha `CREATE DATABASE` |
| `0000_preparo.sql`, `0001_...sql` a `0039_...sql` | Um arquivo por migração, em ordem; cada um em transação e já registra o nome na tabela de controle `dspd_core.pgmigrations` | `dspd_migrador`, banco `metricas` |
| `9000_grants.sql` | GRANTs por papel (inclui os por coluna: `dspd_api` sem coluna de pessoa; `dspd_api_apontamento` lê duas colunas de pessoa: `responsavel_nome` de `dim_responsavel`, o nome real em claro, e `pessoa_ref` de `fato_apontamento`, `dim_responsavel` e `apt_pessoa_time`. O sal não protege o nome: ele só alimenta o HMAC do `user_id` na lista de supressão; a eliminação a pedido é que apaga a linha de `dim_responsavel` e anula `pessoa_ref` no fato). Depende de todas as migrações | `dspd_migrador`, por último |
| `consolidado.sql` | De `0000` a `9000` numa só transação (tudo ou nada). Em instalação nova é o único arquivo depois do `00` | `dspd_migrador`, banco `metricas` |

Passo a passo do DBA (instalação nova):
1. No shell do DBA (psql 15 ou mais novo), sem eco: `read -rs PWD_MIGRADOR; export PWD_MIGRADOR` e o mesmo para `PWD_COLETOR`, `PWD_API`, `PWD_REF` e `PWD_APONTAMENTO`. Depois `psql "host=<servidor> dbname=postgres sslmode=verify-full" -v ON_ERROR_STOP=1 -f deploy/sql/00_papeis_e_banco.sql` e `unset` das cinco. A conexão do DBA usa `~/.pgpass` (600). O script abre com `SET log_statement = 'none'` para o comando com senha não ir ao log do servidor; se o DBA não puder fazer esse `SET`, crie os papéis sem senha e use `\password <papel>` interativo.
2. `psql -v ON_ERROR_STOP=1 -h <servidor> -U dspd_migrador -d metricas -f deploy/sql/consolidado.sql`
3. Conferir: `SELECT count(*) FROM dspd_core.pgmigrations;` deve dar 39 (hoje).

Atualização depois (versão com migração nova): gere de novo (`pnpm run db:sql`), aplique só os `00NN_*.sql` novos e, por último, o `9000_grants.sql` atualizado; ou use a Forma A. O registro em `pgmigrations` é o mesmo nas duas formas, então dá para trocar de uma para outra sem refazer nada.

**Comando que gera:** `pnpm run db:sql` (`scripts/gerar-sql-migracoes.sh` e `.mjs`). Lê `server/migrations/*.ts`, sobe um PostgreSQL 17 descartável em Docker (127.0.0.1:55432, apagado ao fim, sem relação com o banco do projeto), aplica os próprios SQL, roda o `db:migrate` real em outro banco e **falha se esquema, GRANTs ou registro de migrações diferirem**. Sem segredo no resultado. Precisa de Docker no computador de quem gera, não na VM. Rode e commite de novo a cada migração nova.

**Volta (rollback):** as migrações têm `down`, mas o `db:migrate down` em servidor exige `DSPD_PERMITIR_DOWN=1` e o backup do dia confirmado (`docs/engineering/operacao-banco.md`). Para o DBA, a volta segura é **restaurar o backup anterior à migração**; os SQL gerados são só de ida.

**Se o roteiro de papéis falhar no meio:** o script não é transacional (`CREATE DATABASE` não pode ser). Veja onde parou: papéis criados (`\du dspd_*`) e banco (`\l metricas`). Para recomeçar do zero (banco ainda sem dado): `DROP DATABASE IF EXISTS metricas;` e `DROP ROLE IF EXISTS` nos oito papéis, depois rode de novo. Para continuar, rode só as linhas que faltam (comente as já aplicadas).

Cuidados: (1) o banco precisa estar em UTC (o `00` já define); (2) o migrador não cria papel nem concede `CONNECT`: sem o passo 1, a aplicação recusa migrar.

## 7. Produção com o compose próprio (E7.270)

`docker-compose.prod.yml` é o único que vale em produção.

- Sem serviço `postgres` e sem senha padrão: `DB_HOST`, `DB_CA_ARQUIVO` e os cinco `DSPD_PWD_*` usam `${VAR:?}`; sem valor, o Compose recusa montar.
- **TLS:** as URLs levam `sslmode=verify-full`, fixo. No cliente do banco da stack (`pg` 8) `require` já vale `verify-full` (valida cadeia e nome do host), então não existe modo "TLS sem validar" e **nunca se baixa o `sslmode`** (`disable`, `no-verify`). Falha de conexão é CA errada ou `DB_HOST` fora do certificado, nunca motivo para afrouxar. A CA entra por `DB_CA_ARQUIVO` (PEM no host, montado só leitura em `/segredos-db/ca.pem`) e `NODE_EXTRA_CA_CERTS`, em `migrate`, `api`, `worker` e `coleta`. Combine a CA e o nome com o DBA.
- Webhook do BusinessMap desligado (sem `PG_WEBHOOK_URL`); `APONTAMENTO_NOMES` fixo em `0`; portas só em `127.0.0.1` (o HTTPS é do proxy da empresa).
- **Quem usa o Docker:** estar no grupo `docker` equivale a ser root (lê os `.env`). Só o administrador responsável (o dono e, no máximo, um substituto nomeado); desenvolvedores e contas de serviço não. Rever `getent group docker` a cada release.

Subir, como root na VM:

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

As unidades de `deploy/systemd/` já fixam `COMPOSE_FILE` e `COMPOSE_ENV_FILES` e exigem o `/etc/metricas-dspd/host.env` (sem `-`): sem ele a unidade falha em vez de cair no Compose de desenvolvimento. O `host.env` traz o `AVISO_EMAIL`.

Rollback: `git checkout <tag anterior>`, `docker compose build` e `docker compose up -d`; a migração tem volta, escrita pelo dev da stack e conferida antes do deploy (seção 6, "Volta").

`PESSOA_ELIMINADA_SAL` (seção 1.3): sem ele o Apontamento para sem dado. Defina antes da primeira coleta e guarde com o dono: trocar o sal muda os identificadores já gravados.

Validação na entrega: `docker compose -f docker-compose.prod.yml config -q` sem variáveis falha com `defina ...`; com valores fictícios monta, sem postgres, com `verify-full` e o PEM da CA somente leitura. Nada foi executado na VM.
