---
contrato: 0
---
# Code review r2 — 001 · fase A (delta `a1f9125..252bed4` na `develop`)

Revisor: tech-lead · base: [`001-fase-a.md`](001-fase-a.md) · fechado em 2026-10-09 22:13.

## Parecer
**Aprovado**, com recomendados abertos em cartão (abaixo). Integração na `feature/dashboard-mock` **aguarda o parecer do QA** (`docs/qa/001-fase-a.md`, ainda inexistente no fechamento deste parecer).

## Verificação executada (resultado real)
- `web`: `npm run check` verde (9 arquivos, 162 testes); `npm run build` ok (graficos 108 KB gz em chunk próprio; mock/biblioteca fora do inicial).
- `e2e`: `npm run gate` → **APROVADO** (fronteiras, hash da base mock idêntico à linha de base, bundle F7–F9).
- `src/mock/desempenho.test.ts`: orçamento por métrica (frio e p95 de 10) e `VISAO_GERAL` passam.

## Bloqueantes do r1
| Item | Situação |
|---|---|
| B1, B2 | Resolvido: `classes[]` por tipo de demanda / prioridade (`contracts/schemas.ts:135,207,337`). |
| B3 | Resolvido: descarte = `motivo_descarte !== null` (`businessmap/indice.ts:140`); entregue arquivado segue nos cálculos. Arquivado sem desfecho sai só do WIP (`estado.ts:41`, `o10.ts:18`), coerente com a P1. |
| B4 | Resolvido: `ordemNeutra` (`t5.ts:45`); `piores` em seleção separada (`t5.ts:73-75`). |
| B5 | Resolvido: base em dias úteis + WIP de hoje (`o1.ts:80`). |
| B6 | Resolvido: testes de orçamento C3/C4 no Vitest passam. |
| B7 | Resolvido: `core/extremos.ts`; spread só em teste. |
| B8 | Resolvido: fronteiras no ESLint e conferidas pelo gate. |
| B9 | Resolvido em `a1f9125` (hash inalterado, confirmado pelo gate). |
| B10 | Resolvido: `toBeLessThan(1500)` (`mock/mock.test.ts:34`). |
| B11 | Resolvido: latência sorteada por PRNG com semente; `VITE_MOCK_LATENCIA` zera (`MockFonteMetricas.ts:60-67`). |
| B12 | Resolvido: `data-estado` (`CartaoMetrica.tsx:152`). |
| B13 | Resolvido: `mock/mock.test.ts:50`, `lib/metrics/regras.test.ts:82`. |
| B14 | Resolvido: testes parametrizados por `MetricaId` em `regras.test.ts`. |

## Pendências do autor — classificação
| Item | Classificação | Motivo / condição |
|---|---|---|
| R9 · O7 `saldoAcumulado` | **Não bloqueia** | Depende de definição da UX; o O7 não tem cartão renderizado na fase A. Condição: não exibir `saldoAcumulado` até a definição; cartão no quadro. |
| R5 parcial · `calcularPercentis` cru em O3, O9, T1, E1, O10, S4 | **Não bloqueia** | As amostras já vêm segmentadas e passam pela `core` (sem cálculo próprio); `criarAmostraInterna` saiu do índice público. É dívida de tipo: resolver antes da extração (D3) para o `Amostra` proteger a API. Nota: O3 também está na lista (`o3.ts:33`). |
| R17 · `as unknown as` | **Não bloqueia** | Dois casts na UI (`PainelPagina.tsx:53`, `useFiltros.ts:77`), sem efeito em cálculo. Corrigir com genéricos em `BarraFiltros` na fase B. |

## Observação
- `web/src/lib/metrics/zz.test.ts` não rastreado na árvore de trabalho (não faz parte do delta). Não versionar; o dono deve removê-lo.

## Próximos passos
1. Jarvis abre cartões para R5, R9 e R17 no quadro.
2. Com `docs/qa/001-fase-a.md` aprovado, o tech-lead integra `252bed4` na `feature/dashboard-mock` (`--no-ff`, práticas §9).
