# Pedido 040: recriar o banco local e os dados no computador novo

- **Data:** 2026-10-22
- **Origem:** usuário: "troquei de computador, talvez o banco dedados nao exista verifique e refaca a criacao e dos dados tambem".
- **Modo:** implementar
- **Objetivo:** deixar o PostgreSQL local deste computador pronto (`.env`, container, migrações e dados de seed), como estava no computador anterior.
- **Clareza:** 2 confirmados, 2 técnicos, 2 suposições; 1 pergunta (instalação do Docker).

## Diagnóstico (2026-10-22, feito pelo Jarvis)
- `docker`: não existe (nem no WSL, nem pelo Docker Desktop em `/mnt/c/Program Files/Docker`). O `db:up` depende de `docker compose` (imagem `postgres:17`).
- `.env`: não existe; só `.env.example` e `.env.homolog.example`.
- `node`: v24.22.1 instalado pelo nvm, mas fora do PATH do shell não interativo; `pnpm` não encontrado; sem `node_modules`.
- `sudo`: pede senha (o time não instala pacotes do sistema).
- Máquina: Ubuntu 26.04.1 no WSL2, 19 GB de RAM.

## Escopo
- E1. Verificar se o banco existe e, se não existir, criá-lo (container, papéis e migrações). · `confirmado`
- E2. Recarregar os dados (seed do projeto). · `confirmado`
- E3. `.env` local, criado a partir do `.env.example` com senhas locais geradas, sem segredo de API real. · `técnico`
- E4. Toolchain do projeto (node pelo nvm, pnpm pelo corepack, `pnpm install`), pré-requisito do E1 e do E2. · `técnico`

## Etapas
- E0.1 (dono): instalar o Docker neste computador (precisa de sudo ou de instalador do Windows), conforme a decisão sobre a forma de instalação.
- E1.1 (forge:devops-engineer): E3, E4, E1 e E2, com o relatório do que ficou de pé (banco no ar, migrações aplicadas, seed carregado, consulta de prova). Feita em parte: pnpm 10.34.6 ok; E3 e E4 barrados pelo hook (ver Andamento).
- E3.1 (dono): `cp .env.example .env` na raiz (E3), como manda o README; o hook não deixa agente tocar no `.env`.
- E1.2 (forge:tech-lead): `pnpm install --frozen-lockfile` na raiz (E4); o hook atribui `pnpm install` a dev, qa e tech-lead.
- E1.3 (forge:devops-engineer): E1 (db:up e db:migrate), depois do E0.1, do E3.1 e do E1.2.
- E2.1 (forge:devops-engineer): E2 (db:seed e a consulta de prova), junto com o E1.3.

## Andamento
- 2026-10-22 15:25 — devops-1: o pnpm 10.34.6 responde pelo PATH do nvm. O hook `conformidade` barrou o `pnpm install` ("pnpm install é de dev/qa/tech-lead (papel: devops)") e a criação do `.env` ("ler .env expõe segredos"). O Docker ainda não existe. Decisão técnica do Jarvis (`técnico`, base: mensagens do hook e README linha 18): o E3 passa ao dono (E3.1), o E4 ao tech-lead (E1.2) e o E1 e o E2 continuam com o devops (E1.3). Seguir o papel que o hook indica não é contorno.
- 2026-10-22 15:20 — Dono: "pronto" (E0.1 e E3.1). O Docker 2.40.3 está instalado e o grupo `docker` inclui rodrigoisensee, mas a sessão do Claude Code começou antes do `usermod`, por isso ela e os agentes recebem "permission denied" no `docker.sock`. Para o E1.3, o dono precisa reiniciar a sessão (`/exit` e `claude --continue`) depois que o tech-lead-1 (pnpm install) terminar. O `.env` não pode ser verificado pelo Jarvis (o hook barra), e o `db:up` vai confirmar.
- 2026-10-22 15:25 — E1.2 cumprida (tech-lead-1, sem commit): `pnpm install --frozen-lockfile` na raiz e na worktree -025, lockfile sem divergência e pnpm já no PATH do shell interativo (o `~/.bashrc` carrega o nvm). Os builds de core-js e puppeteer foram ignorados pelo pnpm 10, sem `approve-builds`; isso só vira assunto se algum E2E precisar. Próximo passo: o dono reinicia a sessão e, em seguida, vem o E1.3 com o E2.1 (devops), usando o brief `040-...-devops-engineer-2`.
- MELHORIA: 2026-10-22 · ao Forge: o brief de ambiente local para o devops esbarra no hook (pnpm install e .env). Ou o roteiro de "ambiente novo" já aponta os papéis certos, ou o Forge prevê `.env.example` → `.env` sem leitura.

## Fora do escopo
- Credenciais reais do BusinessMap e do Acelerato e a coleta real (fase 3; ficam com o dono). · `suposição` · base: decisão do dono de 2026-10-20 (integrações oficiais depois de operacionais)
- Ambiente de homologação local (`homolog:subir`). · `técnico`
- Mudar `docker-compose.yml`, scripts ou migrações. · `técnico`

## Suposições
- "dados" = o seed do projeto (`pnpm run db:seed`). No computador anterior não havia coleta real, porque as integrações oficiais ainda não estão funcionando. · `suposição` · base: pedido 036 (integrações oficiais depois das operacionais)

## Critério de pronto
- PQ-1 container do postgres saudável · prova: cmd
- PQ-2 migrações aplicadas e seed carregado (contagem > 0 numa tabela do seed) · prova: cmd

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-22): "troquei de computador, talvez o banco dedados nao exista verifique e refaca a criacao e dos dados tambem".
DECISÃO DO DONO (2026-10-22): prioridade, "coloque essa questao de banco na frente da fila": o 040 passa à frente de 025 e 037. O tech-lead-6 do 025 (git, sem banco nem pnpm) já tinha sido disparado e segue em paralelo, porque não disputa recurso com o 040.
DECISÃO DO DONO (2026-10-22): recibo aceito ("ok no recibo").
DECISÃO DO DONO (2026-10-22): Docker, opção A ("decisao A"): Docker Engine dentro do WSL, instalado pelo dono com sudo (E0.1).

## Registro de clareza
PERGUNTA: 2026-10-22 · Docker: instalar o Docker Engine dentro do WSL (apt, de graça) ou o Docker Desktop no Windows (licença paga para empresa grande)

## Histórico
- 2026-10-22: pedido aberto; diagnóstico feito; recibo e pergunta sobre o Docker enviados ao dono.
