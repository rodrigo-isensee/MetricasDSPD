Agente destino: forge:tech-lead
Pedido: docs/pedidos/042-forge-0-30-3-e-retomada.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: c4db73e666e560f2120ab0b0d4cff1307d7710c9

## Objetivo
Etapa E2.2 do pedido 042 (cartão K-141): deixar o toolchain do projeto de pé nesta máquina nova, para a fila do 041 voltar a rodar testes. Node v24.22.1 já está no nvm (carregue com `. ~/.nvm/nvm.sh`); pnpm ainda não. Cópias de trabalho: `/home/rodrigoisensee/MetricasDSPD` (branch docs/jarvis-2026-10-23) e `/home/rodrigoisensee/MetricasDSPD-041` (feature/041-estabilidade).

## Ler
- `/home/rodrigoisensee/MetricasDSPD/README.md`, seção de instalação (linhas 1 a 20).
- `/home/rodrigoisensee/MetricasDSPD/package.json`, campos `engines` e `packageManager`.

## Entregar
- (E2.2) `corepack enable` e pnpm 10.34.6 (o do `packageManager`) no PATH do nvm.
- (E2.2) `pnpm install --frozen-lockfile` em `/home/rodrigoisensee/MetricasDSPD-041` (worktree da fila do 041) e em `/home/rodrigoisensee/MetricasDSPD`; lockfile sem mudança.
- (E2.2) Chromium do Playwright: `pnpm exec playwright install chromium` em `/home/rodrigoisensee/MetricasDSPD-041` (as dependências de sistema o dono já instalou).
- (E2.2) Uma checagem leve de que o ambiente roda, sem suíte de teste: o typecheck do monorepo em `/home/rodrigoisensee/MetricasDSPD-041`, com o pico de memória observado (`free -m` antes e depois).
- (E2.2) Sem commit: nada de código muda. Se o install mexer em arquivo versionado, pare e relate.
- (E1, E3) Versão do Forge e fila do 041: não nesta delegação.

## Fora do escopo
- "E1.1 (dono): no terminal, na raiz do projeto: `forge-upgrade` (cria a branch `forge/upgrade-0.30.3` com o commit da versão; nada vai ao GitHub)." · feito pelo dono (67f57e1)
- "E1.2 (forge:tech-lead): push da branch, PR para a develop, parecer de review, merge por squash depois do QA, limpeza da branch." · etapa de outra delegação, em paralelo
- "E1.3 (forge:qa-engineer): parecer de QA (CI do PR verde e `pnpm run pronto`)." · etapa de outra delegação
- "E2.1 (dono): Docker Engine no WSL (sudo; decisão A do 040), `cp .env.example .env`, Node 24 pelo nvm, `sudo` das dependências do Chromium (`pnpm exec playwright install-deps chromium`), `forge doutor` no terminal (proteção do git e branch homolog) e `/sandbox`." · do dono
- "E2.3 (forge:devops-engineer): banco (db:up, db:migrate, db:seed) e consulta de prova." · etapa de outra delegação (o Docker ainda não responde a esta sessão)
- "E3.1 (forge:software-architect): E2.3 do 041 (ADR 0003, regra do F4), sem depender do ambiente." · já entregue
- "E3.2 (forge:qa-engineer, forge:devops-engineer, forge:tech-lead): o resto do 041 na ordem do pedido 041, depois do E2." · etapas de outra delegação
- "E3.3 (forge:tech-lead): PR de docs do Jarvis, PRs do dependabot (#145, #146, #147) e K-125, depois do E2." · etapa de outra delegação
- `.env` (não ler nem editar), `core.hooksPath`, `pnpm update`, `approve-builds`, suíte de testes completa.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): "talvez precise atualizar algo no banco ja quetroquei de maquina" (coberto pelo E2.3: banco recriado do zero, migrações e seed).
- DECISÃO DO DONO (2026-10-27): "pode usar o poder computacional disponivl para paralelizar" (lido como: agentes em paralelo até o teto de R-TETO desta máquina; suítes de teste limitadas pela memória medida, 7 GB visíveis).
- DECISÃO DO DONO (2026-10-27): pedido de origem acima (atualizar para 0.30.3 por branch e PR para a develop; retomar a fila).
- ADR 0003 (citada no pedido): orçamento de performance; esta entrega não muda limite nem medição.
- A worktree `/home/rodrigoisensee/MetricasDSPD-041` tem um arquivo alterado sem commit (`docs/architecture/adr/0003-orcamento-de-performance.md`, da E2.3 do 041): não toque nele.
- Memória: 7 GB visíveis; nada de suíte de teste nesta entrega.

## Pronto quando
- PQ-1 (cmd): `bash -lc '. ~/.nvm/nvm.sh >/dev/null && pnpm -v'` · espera: igual '10.34.6'
- PQ-2 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-041/node_modules/.pnpm && test -d /home/rodrigoisensee/MetricasDSPD/node_modules/.pnpm` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 status --porcelain` · espera: linhas=1
- PQ-4 (cmd): `ls -d ~/.cache/ms-playwright/chromium-*` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
