# Review final da branch (D8): `feature/dashboard-mock..develop`

Revisor: tech-lead · 46 commits, 308 arquivos (+14226 / -5698) · HEAD `45049ff`.
Portões no HEAD: `typecheck` (inclui e2e) ok, `lint` ok, testes unitários ok (261 + 26 + 174). E2E e axe: parecer final do QA, em andamento.

## Parecer: ajustes necessários (2 bloqueantes antes do PR)
| # | Item | Dono | Severidade |
|---|---|---|---|
| 1 | 001-K-047-048-r1 item 1: `minHeight` medido com linha esticada aplicado no estado pronto (T9 >= 2683 px no mobile e em tabela) | react-frontend | bloqueia |
| 2 | Adendo da ADR 0002 registrando a exceção do ciclo `metricas -> mock` por devDependency (condição do 001-K-043-r1 e do 001-K-016-r1, "antes do PR do 001"). Não existe em `docs/architecture/adr/0002-monorepo-pacotes-compartilhados.md`. | software-architect | bloqueia |

## Cobertura de pareceres
| Commits | Parecer | Situação |
|---|---|---|
| 1ef5360 (K-030/M-004) | 001-K-030-r1; itens (a) e (b) fechados em 001-K-043-r1 e 001-B1-r1; (c) fechado com `web/tsconfig.test.json` | aprovado |
| dbbcfb4 (K-016), 19440cf | 001-K-016-r1; bloqueantes fechados (c410727, 19440cf) e aceitos em 001-K-043-r1. 19440cf (2 linhas, tipo do e2e + typecheck raiz) revisado aqui. | aprovado |
| B1 (K-039, K-006, K-023) | 001-B1-r1 | aprovado |
| B2 (K-007, K-024) | 001-B2-r1 | aprovado |
| B3 (K-008, K-025, K-026) | 001-B3-r1, ajustes fechados em 001-K-043-r1 | aprovado |
| K-041, K-042, K-043 | 001-K-043-r1, bloqueantes fechados em 001-K-044-045-r1 | aprovado |
| K-044, K-045, B3-00x, B12-00x, 23554e9 | 001-K-044-045-r1 | aprovado |
| K-046 | 001-K-046-r1 | aprovado |
| K-047, K-048 (84ce0ed) | 001-K-047-048-r1 | aprovado |
| K-048 (45049ff) | 001-K-047-048-r1 | **ajustes** |
| Docs, UX e QA (docs/, e2e/) | pareceres de UX e QA próprios | fora do code review de código |

## Higiene do versionamento
- Nada de `.env`, `dist`, `node_modules`, `coverage`, `test-results` ou `playwright-report` versionado (o único acerto por nome é `packages/mock/src/distribuicoes.ts`, legítimo).
- `web/dist-alt/` está **fora** do git, mas não é ignorado (`.gitignore` só tem `dist/`). Apagar o diretório ou incluir `dist-*/` no `.gitignore` antes de qualquer `git add` amplo. Recomendado.
- Evidências PNG: 49 arquivos, 7,4 MB nesta branch (71 e 10,5 MB no repositório). Aceitável. Ajustes recomendados: `docs/qa/evidencias/b3/visao-geral-estado-vazio-1280-claro.png` é idêntica (mesmo MD5) a `visao-geral-1280-claro.png`, então sai ou é recapturada (a captura do estado vazio não mostra o estado vazio); as quatro de `b12/*-1280-claro.png` (0,4 a 1 MB cada) podem ser comprimidas (pngquant) ou trocadas por recortes. Para o 002, capturas de página inteira vão como artefato de CI, não no git.
- `docs/qa/evidencias/fase-a/axe-resumo.json` modificado e não commitado: é do QA, entra no commit dele.

## Regras invioláveis do CLAUDE.md
- Painel não calcula, sem mistura de fontes e fronteiras de pacote: lint da ADR 0002 com meta-teste de fixtures que devem falhar e passar (`web/src/test/lint.meta.test.ts`).
- Mínimo de 20 itens, percentis e segmentação: propriedades sobre a matriz inteira em `packages/metricas/src/regras.property.test.ts`, com exceções nominais (fronteira 19/20, S4 por prioridade x nível).
- Sem comparação entre equipes: aviso "consolidado, o sistema não compara equipes" e sem ranking. Sem regressão neste delta.

## Recomendados abertos (não bloqueiam) para o resumo do PR
1. 001-B1-r1 #2, #3, #4 e 001-B2-r1 R2: `replaceAll('%2C')` duplicado (`NavegacaoGlobal.tsx`, `OperacionalPage.tsx`), `Math.max(0, ...)` silencioso em `charts/tema.ts`, cast de interseção em `filtros/codec.ts`, `pct ?? 0` em `CartaoT3.tsx`. Um `refactor(web)` ou cartão.
2. 001-K-044-045-r1 #1: assimetria S1/S2 na faixa da Sustentação (S1 olha só restauração).
3. 001-K-046-r1: número mágico `6.5` em `Barras.tsx`; sobreposição de "(em andamento)" a 375 px; teste de `truncar` e do `aria-label` da `RegiaoRolavel`; "Mediana encosta na barra" como pendência de UX.
4. 001-K-047-048-r1 #2 a #4: tipo do `estadoFaixa`, `vazio` tratado como ok, teste dos cinco usos, condição redundante na `BarraFiltros`.
5. `docs/api/` ainda não existe (contrato S4 registrado só na matriz de regras); segue para o 002.
6. Higiene acima: `web/dist-alt/`, PNG duplicada, compressão das capturas b12.

Próximo passo: fechar os bloqueantes 1 e 2, r2 do K-048 só com o delta, parecer final do QA. Depois disso, a branch está pronta para o PR.

Parecer fechado: 2026-10-10
