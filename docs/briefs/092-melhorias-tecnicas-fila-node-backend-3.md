Agente destino: forge:node-backend
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: fix/k174-insumos-carga   Base: develop   Base-sha: 7b2325a91a80f78f309755d7bc69afee71ec3608
Etapa: codigo   Cobre: E3.1

## Objetivo
K-174, segunda tentativa: na primeira tentativa (branch fix/k174-docs-contratos-carga, sem PR), o teste "as páginas geradas coincidem com o código" de `tools/docs-contratos/src/insumos.test.ts` gastou só 26 a 67 ms; o custo real é o `carregarInsumos(RAIZ)` no nível do módulo, cerca de 1,2 s a frio, que sob carga derruba o arquivo e o pronto. Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `fix/k174-insumos-carga` (a partir da develop 7b2325a91a80f78f309755d7bc69afee71ec3608).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052c/tools/docs-contratos/src/insumos.ts` e `/home/rodrigoisensee/MetricasDSPD-052c/tools/docs-contratos/src/insumos.test.ts`.
- O Histórico do pedido 092 de 09:22 (medição da primeira tentativa).

## Entregar
- "E3.1 (node-backend): K-174, na branch fix/k174-docs-contratos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052g." (E3.1) Nesta volta, na branch `fix/k174-insumos-carga` (worktree 052c), com a pista da primeira tentativa.
- (E3) (E3.1) Medir onde o `carregarInsumos` gasta o tempo a frio (perfil simples por etapa) e torná-lo mais barato sem mudar o que ele devolve (mesmos insumos, mesma ordem, mesmas páginas geradas): por exemplo, ler e analisar cada arquivo uma vez, evitar trabalho repetido ou importar menos na carga. Se o ganho exigir mudar o contrato do módulo, pare e relate. Sem aumentar timeout nem retry. Prova: tempo a frio antes e depois, os testes de `tools/docs-contratos` verdes com no máximo 2 workers (R-TETO), `pnpm run docs:check` igual (mesmas páginas) e o `pnpm run pronto` da raiz da worktree. Commit com `Cartão: K-174` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/fix/k174-insumos-carga` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR (o PR vem depois da release 093).
- (E1) (E2) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: tools/docs-contratos/src/insumos.ts, tools/docs-contratos/src/insumos.test.ts

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (qa-engineer): K-121, frontmatter nos 8 documentos de docs/qa que o forge-check docs acusa, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-121." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-121 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): K-121, frontmatter em docs/reviews/front-via-api.md, na mesma branch, depois da E1.1." · etapa de outra delegação; continua no pedido
- "E1.5 (software-architect): K-121, frontmatter em docs/architecture/features/front-via-api.md, na mesma branch (o tech-lead leva o arquivo ao commit)." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): K-172, na branch docs/k172-pronto-praticas, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-172." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): PR do K-172 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-174." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T)." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-174 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E5.1 (node-backend): K-264, na branch fix/k264-cli-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E5.2 (tech-lead): review do K-264." · etapa de outra delegação; continua no pedido
- "E5.3 (qa-engineer): QA do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-052c/tools/docs-contratos test` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c log -1 --format=%B origin/fix/k174-insumos-carga` · espera: contém 'Cartão: K-174'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
