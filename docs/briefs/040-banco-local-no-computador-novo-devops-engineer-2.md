Agente destino: forge:devops-engineer
Pedido: docs/pedidos/040-banco-local-no-computador-novo.md
Tipo: codigo
Branch: docs/jarvis-2026-10-20-noite   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Subir o PostgreSQL local deste computador novo, aplicar as migrações e carregar o seed, como no computador anterior. Etapas E1.3 e E2.1 do pedido 040, cartão K-136, prioridade do dono ("na frente da fila"). Repositório principal `/home/rodrigoisensee/Metricas/MetricasDSPD`, na branch `docs/jarvis-2026-10-20-noite` do Jarvis: não troque de branch nem commite, porque é trabalho de ambiente, sem commit. Pré-condições cumpridas: o Docker 29.1.3 responde sem sudo (ACL no socket, posta pelo dono), não há container nenhum, o `.env` foi criado pelo dono (E3.1) e as dependências foram instaladas (E4.1).

## Ler
- `docs/pedidos/040-banco-local-no-computador-novo.md`, seções "Etapas" e "Andamento".
- `package.json` da raiz (scripts `db:*`), `scripts/db.sh` e o serviço `postgres` de `docker-compose.yml`.

## Entregar
- (E1) Com o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` na frente: `pnpm run db:up` e, com o container saudável, `pnpm run db:migrate`. Se o `db:up` falhar por falta de variável do `.env`, pare e relate o nome da variável, sem ler nem imprimir o `.env`.
- (E2) `pnpm run db:seed` e a consulta de prova do PQ-2.

## Fora do escopo
- "E3.1 (dono): `cp .env.example .env` na raiz (E3), como manda o README; o hook não deixa agente tocar no `.env`." · etapa do dono, cumprida.
- "E4.1 (forge:tech-lead): `pnpm install --frozen-lockfile` na raiz (E4); o hook atribui `pnpm install` a dev, qa e tech-lead." · etapa de outro papel, cumprida.
- "E0.1 (dono): instalar o Docker neste computador (precisa de sudo ou de instalador do Windows), conforme a decisão sobre a forma de instalação." · etapa do dono, cumprida.
- "E1.1 (forge:devops-engineer): E3, E4, E1 e E2, com o relatório do que ficou de pé (banco no ar, migrações aplicadas, seed carregado, consulta de prova). Feita em parte: pnpm 10.34.6 ok; E3 e E4 barrados pelo hook (ver Andamento)." · etapa substituída por esta.
- Credenciais reais do BusinessMap e do Acelerato, coleta real, homologação local (`homolog:subir`); mudar `docker-compose.yml`, scripts, migrações, hooks ou qualquer arquivo versionado; commit, push, PR; ler ou editar o `.env`; sudo.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "troquei de computador, talvez o banco dedados nao exista verifique e refaca a criacao e dos dados tambem".
- DECISÃO DO DONO (2026-10-22): prioridade, "coloque essa questao de banco na frente da fila": o 040 passa à frente de 025 e 037. O tech-lead-6 do 025 (git, sem banco nem pnpm) já tinha sido disparado e segue em paralelo, porque não disputa recurso com o 040.
- DECISÃO DO DONO (2026-10-22): recibo aceito ("ok no recibo").
- DECISÃO DO DONO (2026-10-22): Docker, opção A ("decisao A"): Docker Engine dentro do WSL, instalado pelo dono com sudo (E0.1).
- CLAUDE.md do projeto: credenciais só em `.env`, nunca no código.
- R-VERIFY e R-CONFORMIDADE: bloqueio não se contorna, vira relato.

## Pronto quando
- PQ-1 (cmd): `docker compose -f /home/rodrigoisensee/Metricas/MetricasDSPD/docker-compose.yml ps postgres --format '{{.Health}}'` · espera: igual 'healthy'
- PQ-2 (cmd): `docker compose -f /home/rodrigoisensee/Metricas/MetricasDSPD/docker-compose.yml exec -T postgres psql -U postgres -d metricas -tAc 'select (select count(*) from dspd_bm.ctl_coleta) > 0 and (select count(*) from dspd_ac.ctl_coleta) > 0'` · espera: igual 't'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
