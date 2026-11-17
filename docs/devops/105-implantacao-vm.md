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

Modelo: `.env.homolog.example`. Tem `HOMOLOG_PG_SUPERUSER_PWD` (senha do administrador, obrigatória) e as oito senhas do banco local de homologação (que sobe o próprio Postgres), todas obrigatórias, sem valor padrão, com 12 ou mais caracteres e nunca `*_dev`: `DSPD_PWD_MIGRADOR`, `DSPD_PWD_COLETOR`, `DSPD_PWD_API`, `DSPD_PWD_REF`, `DSPD_PWD_WEBHOOK`, `DSPD_PWD_AUTOMACAO`, `DSPD_PWD_PESQUISA` e `DSPD_PWD_APONTAMENTO`. A seção 1.1 lista só cinco; `WEBHOOK`, `AUTOMACAO` e `PESQUISA` também são exigidas aqui (conferido contra `docker-compose.homolog.yml`). Opcionais: `HOMOLOG_PG_PORT` (15432), `HOMOLOG_API_PORT` (13000), `HOMOLOG_WEB_PORT` (18080). **A homologação usa só dados fictícios**: não leva chave do BusinessMap nem senha do Acelerato.

## 2. Comandos

Todos na pasta do projeto na VM, na versão liberada pelo dono (`R-MAIN`: nunca `main` sem o merge dele). `pnpm` precisa estar instalado (seção 3). **Só `db:migrate` e `vm:preparar` leem o `.env` da raiz sozinhos.** Os demais (`ac:*`, `bm:*`, `ref:*`, `coleta`) não: com o `.env` na raiz, carregue-o no comando, `(set -a; . ./.env; set +a; pnpm ...)`, ou exporte as variáveis (senão falham com "PG_MIGRADOR_URL" ou "PG_REF_URL" ausente). Na VM o Compose de produção usa o `compose.env`, e o Docker não vê o `.env` da raiz.

### 2.1 Produção

1. **Preparar:** ter o `/etc/metricas-dspd/compose.env` (seção 1.1) e a CA do banco, e os papéis e o banco criados pelo DBA (`00_papeis_e_banco.sql`, seção 6). `pnpm` só é necessário para os comandos fora do Docker (itens 4 e 5).
2. **Subir (Docker, sem banco local). A ordem importa: backup, `up`, conferir o resumo.** O `up` já migra (o serviço `migrate` roda o `vm:preparar` antes da API), então o backup vem **antes** dele, não depois:
   1. **Versão com migração nova?** Compare `ls server/migrations` (versão liberada) com `SELECT count(*) FROM dspd_core.pgmigrations;`. Há migração a mais: faça o **backup agora** (item 8) e anote que o dia foi confirmado. A volta segura é restaurar um backup anterior à migração (seção 6, "Volta"); backup tirado depois do `up` já tem a migração dentro. Sem migração nova, pule o backup. **Antes do `up`, a coleta do Acelerato precisa estar parada** (`systemctl stop metricas-coleta-acelerato.timer metricas-coleta-acelerato-releitura.timer` e espere o serviço em execução acabar): o `vm:preparar` roda as reprojeções (etapas, fluxo, escala) e uma coleta no meio delas mistura as regras. Religue só depois de conferir o resumo (item 4 abaixo).
   2. `docker compose -f docker-compose.prod.yml config -q` e `build`.
   3. `docker compose -f docker-compose.prod.yml up -d` (com migração nova: `DSPD_BACKUP_CONFIRMADO=$(TZ=America/Sao_Paulo date +%F) docker compose -f docker-compose.prod.yml up -d`, só **depois** do backup bom de hoje). O `vm:preparar` **recusa migrar** se houver migração pendente sobre base com dados e a data de hoje (Brasília) não estiver nessa variável: a mensagem diz o que fazer e a API não sobe. Base virgem e versão sem migração nova não pedem confirmação.
   4. **Conferir o resumo do `vm:preparar`:** `docker compose -f docker-compose.prod.yml logs migrate`. Sucesso termina com `vm:preparar: ok, 8 passo(s): ...` e o texto do próximo passo. Falha termina com `vm:preparar: FALHOU no passo "<nome>" (código N)`: nada depois dele rodou, a API e o worker não sobem (`depends_on`), e repetir o `up` depois de corrigir é seguro. A mensagem do passo traz só a categoria (autenticação, conexão, configuração, outro), nunca URL nem senha.
   5. O painel fica em `http://127.0.0.1:8080`, a API em `127.0.0.1:3000` (health em `/health/ready`). **Não use `pnpm run stack:up` em servidor**: ele sobe o Compose de desenvolvimento (banco local, senhas `_dev`).
3. **O que o `vm:preparar` faz** (`server/src/entradas/vm-preparar.ts`; fora do Docker, `pnpm run vm:preparar` com `PG_MIGRADOR_URL` e `PG_REF_URL` terminando em `?sslmode=verify-full` e `NODE_EXTRA_CA_CERTS=<PEM da CA do banco>`; carrega o `.env` da raiz se existir, e variável já no ambiente vale mais). Em ordem, parando no primeiro erro e nomeando o passo; cada um idempotente, nenhum chama BusinessMap nem Acelerato:
   1. `migrar` (migrações e GRANTs, papel migrador; antes dele, a conferência do backup acima);
   2. `ref:sync-calendario` (calendários e feriados; vem antes do `ac:ref-sync`, cujos alvos em dias úteis conferem o expediente gravado);
   3. `bm:ref-sync` (dicionário do BusinessMap);
   4. `ac:ref-sync` (listas e alvos de prazo do Acelerato);
   5. `ac:reprojetar-etapas` (refaz as etapas do Acelerato, marca `099:D-7-528`; recusa com código 4 se o calendário da referência difere do da montagem);
   6. `ac:reprojetar-fluxo` (preenche `dim_chamado.fluxo`, migração 0038);
   7. `ac:reprojetar-escala` (preenche `dim_chamado.escala_p`, migração 0040, escala P1 a P5 do S1; já está na `develop`, #516). A coleta do Acelerato deve estar **parada** antes do `up` e o backup do dia confirmado (ver "Versão com a migração 0040", item 4);
   8. `ac:criterios` (marcas de critério do Acelerato com a data de hoje, T2.6; imprime a lista `gravadas` com as **referências gravadas** na execução, vazia numa repetição, não só contagens).
   **Fica de fora de propósito:** a **primeira carga** (item 5), `bm:ref-sync-apontamento` (recusa, com "o tipo de card ... não existe", numa base sem cards: roda depois da primeira carga do BusinessMap e já está no timer semanal de referências) e `bm:criterios-classe-servico` (só grava depois da primeira carga, item 5). Os usuários do banco ficam com o DBA.
   **O `ac:ref-sync` repetido no mesmo dia (decisão: fica na subida).** O risco antigo era regravar os alvos e confundir a vigência. O código já compara o arquivo com o que está gravado: mesmo arquivo, mesmo dia, **não grava nada** (provado: a 2ª subida do dia devolve `inseridos: 0, fechados: 0`). Se o arquivo de alvos **mudou** e já houve carga hoje, o passo **recusa** ("a data ... não é posterior à última vigência"), a subida para e nomeia o passo; resolva com `ac:ref-sync AAAA-MM-DD` com a data de amanhã (ou espere o dia virar). Nunca grava duas vigências no mesmo dia.
   **Efeito colateral (corrigido pelo K-397):** `ac:reprojetar-etapas` e `ac:reprojetar-fluxo` **só gravam em `ctl_coleta` quando mudam alguma linha** (a primeira subida depois da 0038 ou de uma mudança de regra). Reprojeção sem mudança, como a repetição da subida, não grava nada e **não move** o "última carga" da tela do Acelerato. Quando houve mudança, o "última carga" mostra a hora da reprojeção até a próxima coleta do Acelerato (não é erro nem dado novo). O `ac:reprojetar-escala` ainda soma uma linha de execução em `ctl_coleta` a cada rodada (o K-397 não o alcançou, `server/src/modulos/acelerato/reprojecao-escala.ts`): na subida em que ele roda, o "última carga" pode mostrar a hora dele até a próxima coleta.
4. **Migrar o banco à mão** (quando só o banco mudou, sem `up`): backup antes (item 8), depois `pnpm run vm:preparar` (migra e prepara; exige `DSPD_BACKUP_CONFIRMADO` como acima) ou só `pnpm run db:migrate`, com `PG_MIGRADOR_URL` terminando em `?sslmode=verify-full` e `NODE_EXTRA_CA_CERTS=<PEM da CA do banco>` no ambiente (fora do Docker o Node não conhece a CA da empresa; sem `sslmode` a conexão não valida o servidor). Nunca baixe o `sslmode`. À mão, sem o `vm:preparar`, cada comando `ac:*`/`bm:*`/`ref:*` exige o `.env` carregado (ver o começo desta seção) e aceita data opcional `AAAA-MM-DD` (vigência; sem data, hoje em Brasília).
   - **Depois da primeira carga, uma vez:** `pnpm --filter @metricas-dspd/server run bm:ref-sync-apontamento` (subgrupos do Apontamento) e `pnpm --filter @metricas-dspd/server run bm:criterios-classe-servico AAAA-MM-DD` (registra a data do critério "classe pela prioridade", `105:classe-pela-prioridade`, para a marca nos gráficos; só grava uma vez, com a data da primeira carga do BusinessMap).
   - **Versão com a migração 0040 (escala P do S1; já na `develop`, vale para a release que a traz):** (1) backup **antes do `up`** (item 2.1); (2) **pare a coleta do Acelerato** (`systemctl stop metricas-coleta-acelerato.timer metricas-coleta-acelerato-releitura.timer` e espere o serviço em execução acabar) **antes** do `up`, porque o `vm:preparar` passa a rodar o `ac:reprojetar-escala` e uma coleta no meio da reprojeção mistura as escalas; (3) `up -d` com `DSPD_BACKUP_CONFIRMADO`; (4) confira no resumo que o `ac:reprojetar-escala` e o `ac:criterios` (que então grava `105:S1-escala-p`) rodaram (com a 0040 o resumo lista 8 passos, não 7); (5) religue os timers (`systemctl start ...` dos mesmos dois; `systemctl list-timers 'metricas-*'`).
   - **Rollback (0038, 0039 e 0040):** é o **rollback geral da seção 7, passos 0 a 4**, sem atalho: (0) pare os quatro timers, (1) `docker compose ... down`, (2) **recomendado: restaurar o backup anterior à subida** (tira as três migrações; perde o que entrou depois do backup); o `down 1` com as duas travas (`DSPD_PERMITIR_DOWN=1` e backup de hoje confirmado em `DSPD_BACKUP_DIR`: `DSPD_PERMITIR_DOWN=1 DSPD_BACKUP_DIR=<pasta fora do repositório> pnpm run db:migrate down 1`) vale **só para a 0040**, a última, e **uma vez**: o segundo `down 1` tira a 0039 e derruba as tabelas do BusinessMap, e a 0038 e a 0039 sozinhas só saem por restauração, (3) código anterior, `build` e `up -d` (o `migrate` do código antigo roda sobre banco com as migrações já desfeitas), (4) conferir e religar. Passo a passo do `down` e da conferência: `docs/devops/105-roteiro-dono.md`, seção 4 (receita A, restaurar; receita B, `down 1` só da 0040). A 0040 só criou a coluna derivada `dim_chamado.escala_p`; o `down 1` a tira e a reprojeção a refaz.
5. **Primeira carga (manual, com o dono presente; não é agendada):**
   - BusinessMap: `pnpm --filter @metricas-dspd/server run bm:coleta carga-inicial --projetar`
   - Apontamento: depois da carga de cards, `bm:ref-sync-apontamento` (item 4) e então `pnpm --filter @metricas-dspd/server run bm:apontamento carga-inicial`
   - Acelerato: `pnpm run coleta ac`
6. **Coletas diárias, agendadas pelo systemd** (`deploy/systemd/`, instalação no `docs/devops/runbook-coleta-diaria.md`, item 4):
   - BusinessMap, todo dia 06:00: `src/entradas/coleta-businessmap.ts incremental --projetar`. O Apontamento incremental roda como etapa desta coleta (comentário em `server/src/entradas/apontamento-businessmap.ts`), sem timer próprio.
   - Acelerato, todo dia 06:30: `src/entradas/coleta.ts ac`; releitura aos domingos 07:30: `coleta.ts ac --releitura`.
   - Ligar: `systemctl enable --now metricas-coleta-businessmap.timer metricas-coleta-acelerato.timer metricas-coleta-acelerato-releitura.timer metricas-referencias.timer` (este, domingo 05:00, roda as quatro sincronizações de referência); conferir com `systemctl list-timers 'metricas-*'` (o padrão `metricas-coleta-*` não lista o `metricas-referencias.timer`).
   - Falha: e-mail ao `AVISO_EMAIL`; log em `journalctl -u metricas-coleta-businessmap.service`.
7. **Parar:** `docker compose -f docker-compose.prod.yml down` (o banco é da empresa; os dados ficam lá).
8. **Backup:** `scripts/db-backup.sh`, diário 03:30, e teste de restauração aos domingos 04:30 (`docs/engineering/operacao-banco.md`). Roda no host, fora do Docker: exporte `PGSSLMODE=verify-full` e `PGSSLROOTCERT=<PEM da CA do banco>` (sem eles o libpq usa `prefer` e não valida o servidor), `PGHOST` com o nome que consta no certificado, e tenha o cliente `pg_dump`, `pg_restore` e `psql` **17** no host (`pg_dump` mais antigo que o servidor recusa). Agendamento descrito só para Windows/WSL e cron: **LACUNA** para o agendador da VM (cron serve, o texto existente já traz o modelo; ponha as duas variáveis `PGSSL*` no ambiente do job).

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
- **Referências no agendador.** O `metricas-referencias.timer` (domingo 05:00) roda, em sequência, as quatro sincronizações de referência (as três primeiras já rodam na subida, seção 2.1, item 3; os subgrupos do Apontamento só depois da primeira carga): BusinessMap, Acelerato, calendário e subgrupos do Apontamento (`deploy/systemd/metricas-referencias.service`). Seguem manuais, com o dono presente, a carga inicial (item 5) e `bm:criterios-classe-servico` (item 4, depois da primeira carga), que usa o papel migrador, não entregue ao container de coleta, e grava uma vez só. A ADR 0022 item 4 trata só da carga inicial; o runbook `docs/devops/runbook-coleta-diaria.md` traz as duas coisas.
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
| 16 | **Saída para os repositórios de pacotes** (npm e imagens `postgres`, `node`, `nginx`) ou espelho interno, só para instalar e atualizar. Sem isso, a empresa leva as imagens e o cache do `pnpm` prontos. | `pnpm install --frozen-lockfile`, `docker compose -f docker-compose.prod.yml build` | Sim |

## 6. Migrações do banco para o DBA (E7.246)

O banco é da empresa. O mesmo esquema chega por **duas formas**, com o mesmo resultado (o comando de geração prova isso).

**Forma A, pela aplicação.** Com papéis e banco já criados pelo DBA (passo 1 abaixo), na VM: `pnpm run db:migrate`. Roda como `dspd_migrador` (`PG_MIGRADOR_URL`), aplica as migrações em uma transação e depois os GRANTs. É o caminho das atualizações.

**Forma B, SQL aplicado pelo DBA.** Arquivos em `deploy/sql/` (gerados; não edite à mão):

| Arquivo | O que é | Quem roda e onde |
|---|---|---|
| `00_papeis_e_banco.sql` | Cria os cinco papéis de login e os três NOLOGIN e o banco `metricas`, concede `CONNECT` só aos cinco de login e fecha o schema `public`. Senhas por variável de **ambiente** lida pelo `psql` (`\getenv`), nunca por `-v` nem no arquivo | Administrador, banco `postgres`, **uma vez**. Se o banco já existe, apague a linha `CREATE DATABASE` |
| `0000_preparo.sql`, `0001_...sql` a `0040_...sql` | Um arquivo por migração, em ordem; cada um em transação e já registra o nome na tabela de controle `dspd_core.pgmigrations` | `dspd_migrador`, banco `metricas` |
| `9000_grants.sql` | GRANTs por papel (inclui os por coluna: `dspd_api` sem coluna de pessoa; `dspd_api_apontamento` lê duas colunas de pessoa: `responsavel_nome` de `dim_responsavel`, o nome real em claro, e `pessoa_ref` de `fato_apontamento`, `dim_responsavel` e `apt_pessoa_time`. O sal não protege o nome: ele só alimenta o HMAC do `user_id` na lista de supressão; a eliminação a pedido é que apaga a linha de `dim_responsavel` e anula `pessoa_ref` no fato). Depende de todas as migrações | `dspd_migrador`, por último |
| `consolidado.sql` | De `0000` a `9000` numa só transação (tudo ou nada). Em instalação nova é o único arquivo depois do `00` | `dspd_migrador`, banco `metricas` |

Passo a passo do DBA (instalação nova):
1. No shell do DBA (psql 15 ou mais novo), sem eco: `read -rs PWD_MIGRADOR; export PWD_MIGRADOR` e o mesmo para `PWD_COLETOR`, `PWD_API`, `PWD_REF` e `PWD_APONTAMENTO`. O script confere as cinco antes do primeiro `CREATE`: se uma faltar ou estiver vazia, termina com erro que nomeia a variável (por exemplo `falta a variável de ambiente PWD_REF; nada foi criado`) e nenhum papel é criado. Depois `psql "host=<servidor> dbname=postgres sslmode=verify-full" -v ON_ERROR_STOP=1 -f deploy/sql/00_papeis_e_banco.sql` e `unset` das cinco. A conexão do DBA usa `~/.pgpass` (600). O script abre com `\set ON_ERROR_STOP on` (para no primeiro erro) e três `SET` (`log_statement = 'none'`, `log_min_duration_statement = -1` e `log_min_error_statement = panic`) para o comando com senha não ir ao log do servidor, nem por duração nem por erro; se o DBA não puder fazer esses `SET`, crie os papéis sem senha e use `\password <papel>` interativo. **Aviso ao DBA (`pg_stat_statements`):** esses `SET` cobrem o log do servidor, não as estatísticas. Se o banco tiver `pg_stat_statements` guardando comandos administrativos (`pg_stat_statements.track_utility = on`, o padrão), o texto do `CREATE ROLE ... PASSWORD` pode ficar nas estatísticas. O desligamento tem de valer na **mesma conexão** do `psql -f`: um `SET` dado numa sessão à parte não alcança a conexão que o `-f` abre, e a senha aparece na view. Rode assim: `PGOPTIONS='-c pg_stat_statements.track=none' psql "host=<servidor> dbname=postgres sslmode=verify-full" -v ON_ERROR_STOP=1 -f deploy/sql/00_papeis_e_banco.sql` (alternativa: `psql ... -c "SET pg_stat_statements.track = 'none'" -f deploy/sql/00_papeis_e_banco.sql`, em que `-c` e `-f` correm na mesma conexão). Esse ajuste exige superusuário ou `GRANT SET ON PARAMETER pg_stat_statements.track` (PostgreSQL 15 ou mais novo), o mesmo privilégio que os `SET` de log do script já pedem (`log_statement`, `log_min_duration_statement`, `log_min_error_statement`); sem ele, com `PGOPTIONS` a conexão é recusada (`permission denied to set parameter`) e nada é criado. Provado em PostgreSQL 17 descartável com `pg_stat_statements` e senha fictícia: sem `PGOPTIONS`, 5 comandos com a senha ficaram na view; com `PGOPTIONS`, 0, e os 8 papéis foram criados. Se não houver como usar o ajuste, avise quem lê essas estatísticas e, depois, rode `SELECT pg_stat_statements_reset();` se a política da empresa permitir.
2. `psql -v ON_ERROR_STOP=1 -h <servidor> -U dspd_migrador -d metricas -f deploy/sql/consolidado.sql`
3. Conferir: `SELECT count(*) FROM dspd_core.pgmigrations;` deve dar 39 (hoje).

Atualização depois (versão com migração nova): gere de novo (`pnpm run db:sql`), aplique só os `00NN_*.sql` novos e, por último, o `9000_grants.sql` atualizado; ou use a Forma A. O registro em `pgmigrations` é o mesmo nas duas formas, então dá para trocar de uma para outra sem refazer nada.

**Comando que gera:** `pnpm run db:sql` (`scripts/gerar-sql-migracoes.sh` e `.mjs`). Lê `server/migrations/*.ts`, sobe um PostgreSQL 17 descartável em Docker (127.0.0.1:55432, apagado ao fim, sem relação com o banco do projeto), aplica os próprios SQL, roda o `db:migrate` real em outro banco e **falha se esquema, GRANTs ou registro de migrações diferirem**. Sem segredo no resultado. Precisa de Docker no computador de quem gera, não na VM. Rode e commite de novo a cada migração nova. O `.mjs` não roda sozinho: sem o wrapper ele recusa (código 3) e não toca em `deploy/sql`; chamado direto, antes, apagava os `.sql` da pasta.

**Volta (rollback):** as migrações têm `down`, mas o `db:migrate down` em servidor exige `DSPD_PERMITIR_DOWN=1` e o backup do dia confirmado (`docs/engineering/operacao-banco.md`). Para o DBA, a volta segura é **restaurar o backup anterior à migração**; os SQL gerados são só de ida.

**Se o roteiro de papéis falhar no meio:** o script não é transacional (`CREATE DATABASE` não pode ser). Veja onde parou: papéis criados (`\du dspd_*`) e banco (`\l metricas`). Para recomeçar do zero (banco ainda sem dado): `DROP DATABASE IF EXISTS metricas;` e `DROP ROLE IF EXISTS` nos oito papéis, depois rode de novo. Para continuar, rode só as linhas que faltam (comente as já aplicadas).

Cuidados: (1) o banco precisa estar em UTC (o `00` já define); (2) o migrador não cria papel nem concede `CONNECT`: sem o passo 1, a aplicação recusa migrar.

## 7. Produção com o compose próprio (E7.270)

`docker-compose.prod.yml` é o único que vale em produção.

- Sem serviço `postgres` e sem senha padrão: `DB_HOST`, `DB_CA_ARQUIVO` e os cinco `DSPD_PWD_*` usam `${VAR:?}`; sem valor, o Compose recusa montar.
- **TLS:** as URLs levam `sslmode=verify-full`, fixo. No cliente do banco da stack (`pg` 8) `require` já vale `verify-full` (valida cadeia e nome do host), então não existe modo "TLS sem validar" e **nunca se baixa o `sslmode`** (`disable`, `no-verify`). Falha de conexão é CA errada ou `DB_HOST` fora do certificado, nunca motivo para afrouxar. A CA entra por `DB_CA_ARQUIVO` (PEM no host, montado só leitura em `/segredos-db/ca.pem`) e `NODE_EXTRA_CA_CERTS`, em `migrate`, `api`, `worker` e `coleta`. Combine a CA e o nome com o DBA.
- Webhook do BusinessMap desligado (sem `PG_WEBHOOK_URL`); `APONTAMENTO_NOMES` fixo em `0`; portas só em `127.0.0.1` (o HTTPS é do proxy da empresa).
- **Quem usa o Docker:** estar no grupo `docker` equivale a ser root (lê os `.env`). Só o administrador responsável (o dono e, no máximo, um substituto nomeado); desenvolvedores e contas de serviço não. Rever `getent group docker` a cada release.

Subir, como root na VM (**com migração nova na versão, faça o backup antes do `up` e use `DSPD_BACKUP_CONFIRMADO`: seção 2.1, item 2**; o `up` roda o `vm:preparar` no serviço `migrate`):

```
cd /opt/metricas-dspd
export COMPOSE_ENV_FILES=/etc/metricas-dspd/compose.env
docker compose -f docker-compose.prod.yml config -q
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
curl -fsS http://127.0.0.1:3000/health/ready
```

As unidades de `deploy/systemd/` já fixam `COMPOSE_FILE` e `COMPOSE_ENV_FILES` e exigem o `/etc/metricas-dspd/host.env` (sem `-`): sem ele a unidade falha em vez de cair no Compose de desenvolvimento. O `host.env` traz o `AVISO_EMAIL`.

- **Reinício da VM:** `api`, `worker` e `web` têm `restart: unless-stopped` e voltam sozinhos com o Docker; `migrate` e `coleta` são pontuais (`restart: "no"`; a coleta é do systemd).
- **Log dos contêineres:** driver `json-file` com teto de 5 arquivos de 10 MB por serviço (`x-log` no compose), para não encher o disco. Ler: `docker compose -f docker-compose.prod.yml logs --tail 200 api` (ou `worker`, `web`). A retenção de 30 dias pedida é do log da VM (`journalctl`), não dos contêineres.

**Pós-deploy** (antes de ligar ou religar os timers):

```
docker compose -f docker-compose.prod.yml ps
curl -fsS http://127.0.0.1:3000/health/ready
curl -fsS -o /dev/null http://127.0.0.1:8080/
systemctl start metricas-coleta-businessmap.service
journalctl -u metricas-coleta-businessmap.service -n 50 --no-pager
```

API pronta, painel respondendo e uma coleta de teste sem erro; só então `systemctl enable --now` dos timers (seção 2.1, item 6). Os dois últimos comandos valem só na primeira implantação (timers ainda desligados). **Redeploy** (timers já ligados): não rode o `systemctl start` manual, que colidiria com a rodada agendada; veja a próxima em `systemctl list-timers 'metricas-*'` e leia o `journalctl` depois que ela passar.

**Rollback, nesta ordem** (a migração vem antes do código; senão o `migrate` do código antigo roda sobre um banco já migrado):
0. Pare os timers de coleta, para nenhuma rodada escrever no banco durante a restauração: `systemctl stop metricas-coleta-businessmap.timer metricas-coleta-acelerato.timer metricas-coleta-acelerato-releitura.timer metricas-referencias.timer` (e espere terminar a coleta em curso: `systemctl list-units 'metricas-*' --state=running`).
1. `docker compose -f docker-compose.prod.yml down` (API e worker param; o banco é da empresa e fica).
2. Banco: **restaurar o backup anterior à migração** (volta segura, seção 6) ou, **só se a última migração aplicada for a 0040**, `DSPD_PERMITIR_DOWN=1 pnpm run db:migrate down 1` (um só) com o backup do dia confirmado (mesmos `PG_MIGRADOR_URL` com `verify-full` e `NODE_EXTRA_CA_CERTS` do item 3 da seção 2.1).
3. `git checkout <tag anterior>`, `docker compose -f docker-compose.prod.yml build` e `docker compose -f docker-compose.prod.yml up -d`.
4. Conferir como no pós-deploy (`/health/ready` e o painel em `127.0.0.1:8080`); depois religue os quatro timers do passo 0 (`systemctl start` de cada `.timer`).

Release sem migração: pule o passo 2. A migração tem volta, escrita pelo dev da stack e conferida antes do deploy (seção 6, "Volta").

`PESSOA_ELIMINADA_SAL` (seção 1.3): sem ele o Apontamento para sem dado. Defina antes da primeira coleta e guarde com o dono: trocar o sal muda os identificadores já gravados.

Validação na entrega: `docker compose -f docker-compose.prod.yml config -q` sem variáveis falha com `defina ...`; com valores fictícios monta, sem postgres, com `verify-full` e o PEM da CA somente leitura. Nada foi executado na VM.
