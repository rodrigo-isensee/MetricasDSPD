Agente destino: forge:devops-engineer
Pedido: docs/pedidos/040-banco-local-no-computador-novo.md
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 306cf6ef29db7bbae2509194406e0b7fcc6ab232

## Objetivo
Deixar o ambiente local deste computador novo pronto: toolchain do projeto, `.env` local, PostgreSQL no ar com as migrações e o seed carregado, como no computador anterior. Etapa E1.1 do pedido 040, cartão K-136, prioridade do dono ("na frente da fila"). Trabalho no repositório principal `/home/rodrigoisensee/Metricas/MetricasDSPD` (branch atual `docs/jarvis-2026-10-20-noite`, do Jarvis; não troque de branch nem commite): é ambiente, sem commit.

## Ler
- `docs/pedidos/040-banco-local-no-computador-novo.md`, seções "Diagnóstico", "Escopo" e "Suposições".
- `package.json` da raiz (scripts `db:*` e `packageManager: pnpm@10.34.6`), `scripts/db.sh`, `docker-compose.yml` (serviço `postgres`, imagem `postgres:17`) e `.env.example`.
- `docker/` só se o serviço `postgres` montar algo de lá (scripts de criação dos papéis).

## Entregar
- (E4) Toolchain: o node v24.22.1 está em `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` (com `pnpm` e `corepack`), mas fora do PATH do shell não interativo. Use esse PATH; garanta o pnpm da versão do `packageManager` (corepack) e rode `pnpm install` na raiz com o lockfile congelado. O PATH do shell interativo do dono (o hook `.githooks/pre-push` chama `pnpm`) é dele: se o pre-push não achar o pnpm num shell novo, relate o ajuste exato (linha do `~/.bashrc` ou equivalente) em vez de editar arquivo de configuração pessoal.
- (E3) `.env` local na raiz, copiado do `.env.example`, com senhas locais geradas na hora (aleatórias, só para este computador) em todas as variáveis de senha, e URLs coerentes com elas; nada de credencial do BusinessMap ou do Acelerato. Confira que `.env` está no `.gitignore` e não aparece no `git status`. Não imprima senhas no relatório.
- (E1) Verificar se o Docker já responde (`docker version` e `docker compose version`, sem sudo). Se responder: `pnpm run db:up` e `pnpm run db:migrate` (papéis, bancos `metricas` e `metricas_test` e GRANTs como os scripts do projeto fazem). Se não responder, pare nesse ponto, relate que falta o E0.1 (instalação do dono) e entregue o E3 e o E4 prontos.
- (E2) Com o banco migrado, `pnpm run db:seed` e uma consulta de prova (contagem > 0 em `dspd_bm.ctl_coleta` e em `dspd_ac.ctl_coleta`, com o usuário de migração).

## Fora do escopo
- "E0.1 (dono): instalar o Docker neste computador (precisa de sudo ou de instalador do Windows), conforme a decisão sobre a forma de instalação." · etapa do dono; continua no pedido.
- Credenciais reais do BusinessMap e do Acelerato, coleta real, homologação local (`homolog:subir`); mudar `docker-compose.yml`, scripts, migrações, hooks ou qualquer arquivo versionado; commit, push, PR; instalar pacote do sistema ou usar sudo; o push do 025.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "troquei de computador, talvez o banco dedados nao exista verifique e refaca a criacao e dos dados tambem".
- DECISÃO DO DONO (2026-10-22): prioridade, "coloque essa questao de banco na frente da fila": o 040 passa à frente de 025 e 037. O tech-lead-6 do 025 (git, sem banco nem pnpm) já tinha sido disparado e segue em paralelo, porque não disputa recurso com o 040.
- DECISÃO DO DONO (2026-10-22): recibo aceito ("ok no recibo").
- DECISÃO DO DONO (2026-10-22): Docker, opção A ("decisao A"): Docker Engine dentro do WSL, instalado pelo dono com sudo (E0.1).
- CLAUDE.md do projeto: credenciais só em `.env`, nunca no código; carga incremental nunca sobrescreve histórico (aqui o banco é novo e vazio: `db:reset` só se o banco estiver vazio).
- R-VERIFY e R-CONFORMIDADE: bloqueio não se contorna, vira relato. R-TETO: `pnpm install` e migrações são pesados, um por vez.

## Pronto quando
- PQ-1 (cmd): `PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/bin:/bin pnpm -v` · espera: igual '10.34.6'
- PQ-2 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/node_modules/.modules.yaml`
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD check-ignore .env` · espera: igual '.env'
- PQ-4 (cmd): `docker compose -f /home/rodrigoisensee/Metricas/MetricasDSPD/docker-compose.yml ps postgres --format '{{.Health}}'` · espera: igual 'healthy' (não cumprido se o E0.1 ainda não foi feito)
- PQ-5 (cmd): `docker compose -f /home/rodrigoisensee/Metricas/MetricasDSPD/docker-compose.yml exec -T postgres psql -U postgres -d metricas -tAc 'select (select count(*) from dspd_bm.ctl_coleta) > 0 and (select count(*) from dspd_ac.ctl_coleta) > 0'` · espera: igual 't' (não cumprido se o E0.1 ainda não foi feito)

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
