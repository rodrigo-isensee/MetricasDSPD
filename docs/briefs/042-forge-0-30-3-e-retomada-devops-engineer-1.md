Agente destino: forge:devops-engineer
Pedido: docs/pedidos/042-forge-0-30-3-e-retomada.md
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8

## Objetivo
Etapa E2.3 do pedido 042 (cartão K-141): recriar o banco local nesta máquina nova (o dono trocou de máquina) e provar que ele está de pé, para a fila do 041 rodar testes. Trabalhe na raiz `/home/rodrigoisensee/MetricasDSPD`; Node 24 pelo nvm (`. ~/.nvm/nvm.sh`), pnpm e dependências já instalados pela E2.2; o Docker responde à sessão.

## Ler
- `/home/rodrigoisensee/MetricasDSPD/docker-compose.yml`, serviço `postgres`.
- `/home/rodrigoisensee/MetricasDSPD/scripts/db.sh` e os scripts `db:*` do `/home/rodrigoisensee/MetricasDSPD/package.json`.

## Entregar
- (E2.3) `pnpm run db:up`, `pnpm run db:migrate` e `pnpm run db:seed` na raiz, banco criado do zero.
- (E2.3) Consulta de prova: contagem de linhas de uma tabela que o seed preenche, rodada dentro do container (`docker compose exec postgres psql ...`), e a lista das migrações aplicadas igual à lista de arquivos de migração do repositório.
- (E2.3) Se faltar variável no `.env` para subir, não leia nem edite o `.env`: relate o nome da variável (do `docker-compose.yml` ou do `scripts/db.sh`) para o dono preencher.
- (E2.3) Sem commit: nada versionado muda.
- (E1, E3) Versão do Forge e fila do 041: não nesta delegação.

## Fora do escopo
- "E1.1 (dono): no terminal, na raiz do projeto: `forge-upgrade` (cria a branch `forge/upgrade-0.30.3` com o commit da versão; nada vai ao GitHub)." · etapa de outra delegação; continua no pedido
- "E1.2 (forge:tech-lead): push da branch, PR para a develop, parecer de review, merge por squash depois do QA, limpeza da branch." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:qa-engineer): parecer de QA (CI do PR verde e `pnpm run pronto`)." · etapa de outra delegação; continua no pedido
- "E2.1 (dono): Docker Engine no WSL (sudo; decisão A do 040), `cp .env.example .env`, Node 24 pelo nvm, `sudo` das dependências do Chromium (`pnpm exec playwright install-deps chromium`), `forge doutor` no terminal (proteção do git e branch homolog) e `/sandbox`." · etapa de outra delegação; continua no pedido
- "E2.2 (forge:tech-lead): `pnpm install --frozen-lockfile` e `pnpm exec playwright install chromium`." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:software-architect): E2.3 do 041 (ADR 0003, regra do F4), sem depender do ambiente." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:qa-engineer, forge:devops-engineer, forge:tech-lead): o resto do 041 na ordem do pedido 041, depois do E2." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:tech-lead): PR de docs do Jarvis, PRs do dependabot (#145, #146, #147) e K-125, depois do E2." · etapa de outra delegação; continua no pedido
- `.env` (não ler nem editar), `docker compose down -v` em banco que já tenha dado de fora, suíte de testes, homologação (`homolog:*`).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): "talvez precise atualizar algo no banco ja quetroquei de maquina" (coberto pelo E2.3: banco recriado do zero, migrações e seed).
- DECISÃO DO DONO (2026-10-27): "pode usar o poder computacional disponivl para paralelizar" (lido como: agentes em paralelo até o teto de R-TETO desta máquina; suítes de teste limitadas pela memória medida, 7 GB visíveis).
- DECISÃO DO DONO (2026-10-27): pedido de origem acima (atualizar para 0.30.3 por branch e PR para a develop; retomar a fila).
- ADR 0003 (citada no pedido): orçamento de performance; esta entrega não muda limite nem medição.
- Credenciais só no `.env` (CLAUDE.md); a worktree `/home/rodrigoisensee/MetricasDSPD-041` tem a ADR 0003 alterada sem commit: não toque nela.

## Pronto quando
- PQ-1 (cmd): `docker compose -f /home/rodrigoisensee/MetricasDSPD/docker-compose.yml ps postgres --format '{{.Health}}'` · espera: igual 'healthy'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD status --porcelain -- . ':!docs' ':!KANBAN.md'` · espera: linhas=0
- PQ-3 (cmd): a consulta de prova do Entregar, copiada no relatório com a saída · espera: contém '(1 row)'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
