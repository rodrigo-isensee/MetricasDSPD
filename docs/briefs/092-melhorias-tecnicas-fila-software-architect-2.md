Agente destino: forge:software-architect
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: fix/k174-insumos-carga   Base: develop   Base-sha: 7b2325a91a80f78f309755d7bc69afee71ec3608
Etapa: codigo   Cobre: E3.5

## Objetivo
Plano do K-174: o `carregarInsumos` de `tools/docs-contratos` leva de 0,9 a 1,4 s a frio e estoura o timeout de 5 s de um teste sob carga. O perfil da segunda tentativa (Histórico do pedido 092, 11:17) pôs o custo na biblioteca compartilhada de tempo (`packages/metricas/src/core/calendario.ts`: `horasUteisEntre`, `diaDeIso`, `ehDiaUtil`, cerca de 300 ms dos 500 ms do cálculo das métricas) e no `gerarBaseMock` de `packages/mock` (cerca de 210 ms). A biblioteca é a T2.5, compartilhada com o servidor.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/092-melhorias-tecnicas-fila.md`, entradas de 09:22 e 11:17.
- Na develop atual (pasta principal): `packages/metricas/src/core/calendario.ts` e quem chama essas funções; `packages/mock/src` (o `gerarBaseMock`).

## Entregar
- "E3.5 (software-architect): plano do K-174: tornar mais barato o cálculo de tempo da biblioteca compartilhada (packages/metricas/src/core/calendario.ts: horasUteisEntre, diaDeIso, ehDiaUtil) e o gerarBaseMock, sem mudar nenhum resultado, com o efeito no servidor e a forma de provar; só leitura, parecer em docs/analises/, sem commit." (E3.5)
- (E3) (E3.5) Plano curto em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/092-k174-plano.md` (novo), pela ferramenta Write: onde está o custo e por quê; opções (por exemplo memoização por dia e calendário, pré-cálculo dos dias úteis do intervalo, ou mudar só o teste), com o ganho esperado, o risco de mudar resultado (percentis, Monte Carlo, horas úteis), o efeito no servidor e na memória; a opção recomendada e como provar que nenhum número muda (testes existentes com 100% e comparação das páginas geradas). Regra de negócio em dúvida vira pergunta ao dono, não decisão. Sem commit nem push.
- (E1) (E2) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/analises/092-k174-plano.md

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
- "E3.1 (node-backend): K-174, na branch fix/k174-docs-contratos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-174." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T)." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-174 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review e envio das retrospectivas do 091 e do 092 (worktree 052g, branch docs/retros-2026-11-11b): parecer de review, commit, push e PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E5.1 (node-backend): K-264, na branch fix/k264-cli-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E5.2 (tech-lead): review do K-264." · etapa de outra delegação; continua no pedido
- "E5.3 (qa-engineer): QA do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/092-k174-plano.md` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
