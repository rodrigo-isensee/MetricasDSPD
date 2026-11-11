Agente destino: forge:tech-lead
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: fix/k268-simulado-intermitente   Base: develop   Base-sha: d8d52103c20837fce3ece3d5bed5f6c68c88c8a2
Etapa: codigo   Cobre: E6.4

## Objetivo
PR do K-268 para a develop: branch `fix/k268-simulado-intermitente`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, head a20b357c (código 52aa703d só em `web/src/features/coleta/simulado.test.tsx`; review aprovado em 41ce5e3d; QA aprovado em a20b357c, 0 bugs, 20 de 20), base develop d8d52103c20837fce3ece3d5bed5f6c68c88c8a2.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/reviews/092-k268-simulado.md` e `/home/rodrigoisensee/MetricasDSPD-052d/docs/qa/092-k268-simulado.md`.

## Entregar
- "E6.4 (tech-lead): PR do K-268; o merge é do dono." (E6.4)
- (E6) (E6.4) Abrir o PR da branch para a `develop` (squash) pelo gh, com título e corpo curtos (o que mudou, review e QA com os caminhos dos pareceres, `Cartão: K-268`); se a branch estiver atrás da develop, atualizar só por merge da develop na branch (sem rebase nem force) e relatar o novo head. Esperar os checks do PR e relatar o estado de cada um (falha: nome do check e linha do erro). Não mesclar: o merge é do dono.
- (E1) (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/features/coleta/simulado.test.tsx, docs/reviews/092-k268-simulado.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (qa-engineer): K-121, frontmatter nos 8 documentos de docs/qa que o forge-check docs acusa, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-121." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-121 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): K-121, frontmatter em docs/reviews/front-via-api.md, na mesma branch, depois da E1.1." · etapa de outra delegação; continua no pedido
- "E1.5 (software-architect): K-121, frontmatter em docs/architecture/features/front-via-api.md, na mesma branch (o tech-lead leva o arquivo ao commit)." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): K-172, na branch docs/k172-pronto-praticas, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-172." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): PR do K-172 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-174, na branch fix/k174-insumos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052c (primeira tentativa em fix/k174-docs-contratos-carga, 052g, sem PR)." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-174." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T)." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-174 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): plano do K-174: tornar mais barato o cálculo de tempo da biblioteca compartilhada (packages/metricas/src/core/calendario.ts: horasUteisEntre, diaDeIso, ehDiaUtil) e o gerarBaseMock, sem mudar nenhum resultado, com o efeito no servidor e a forma de provar; só leitura, parecer em docs/analises/, sem commit." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review e envio das retrospectivas do 091 e do 092 (worktree 052g, branch docs/retros-2026-11-11b): parecer de review, commit, push e PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E5.1 (node-backend): K-264, na branch fix/k264-cli-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E5.2 (tech-lead): review do K-264." · etapa de outra delegação; continua no pedido
- "E5.3 (qa-engineer): QA do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.1 (react-frontend): K-268, teste intermitente de simulado.test.tsx, na branch fix/k268-simulado-intermitente, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-268." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-268." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/k268-simulado-intermitente --state open --json number` · espera: contém 'number'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
