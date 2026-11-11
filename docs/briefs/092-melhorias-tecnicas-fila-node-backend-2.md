Agente destino: forge:node-backend
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: fix/k264-cli-tmpdir   Base: develop   Base-sha: 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13
Etapa: codigo   Cobre: E5.1

## Objetivo
K-264: os testes de CLI do server (`server/tests/apontamento-entradas.test.ts`, `server/tests/ref-sync-ac-entrada.test.ts`, `server/tests/ref-sync-apontamento-entrada.test.ts`, `server/tests/ref-sync-businessmap-entrada.test.ts`, `server/tests/ref-sync-calendario-entrada.test.ts`) rodam o processo filho com um ambiente só com `PATH`; no sandbox dos agentes o `tsx` não acha pasta temporária gravável e 31 testes falham no `pnpm run pronto` local (no CI passam). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `fix/k264-cli-tmpdir` (a partir da develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13).

## Ler
- Os cinco arquivos de teste acima, na worktree, e o ponto em que cada um monta o ambiente do processo filho.

## Entregar
- "E5.1 (node-backend): K-264, na branch fix/k264-cli-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052g." (E5.1)
- (E5) (E5.1) Passar ao processo filho a variável da pasta temporária do processo do teste (`TMPDIR`, quando definida), sem herdar mais nada do ambiente e sem afrouxar o isolamento do K-261 (o `.env` real continua ignorado); de preferência por um ajudante comum aos cinco testes, só em arquivos de teste. Provar: os cinco arquivos passam rodados com no máximo 2 workers dentro do sandbox (vermelho antes do verde: antes da mudança caem por ENOENT), e o `pnpm run pronto` da raiz da worktree. Commit com `Cartão: K-264` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/k264-cli-tmpdir` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Se precisar mudar código de produção, pare e relate antes.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: server/tests/apontamento-entradas.test.ts, server/tests/ref-sync-ac-entrada.test.ts, server/tests/ref-sync-apontamento-entrada.test.ts, server/tests/ref-sync-businessmap-entrada.test.ts, server/tests/ref-sync-calendario-entrada.test.ts, server/tests/ajuda-cli-filho.ts

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): K-121, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-121." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-121 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): K-172, na branch docs/k172-pronto-praticas, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-172." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): PR do K-172 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-174, na branch fix/k174-docs-contratos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-174." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T)." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-174 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E5.2 (tech-lead): review do K-264." · etapa de outra delegação; continua no pedido
- "E5.3 (qa-engineer): QA do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `pnpm run pronto` (da raiz de `/home/rodrigoisensee/MetricasDSPD-052g`) · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g log -1 --format=%B origin/fix/k264-cli-tmpdir` · espera: contém 'Cartão: K-264'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
