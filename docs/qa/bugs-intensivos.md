---
tipo: qa
contrato: 1
pedido: bugs-intensivos
branch: fix/bugs-intensivos
commit: be4dfb1
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-10-14
aceite_usuario: sim
---

# Parecer de QA: lote de bugs dos testes intensivos (IF-001 a IF-007, IS-001 a IS-007)

Links: `docs/reviews/bugs-intensivos.md` (code review aprovado), `docs/qa/intensivo-filtros.md`, `docs/qa/intensivo-sistemico.md`, `docs/qa/bugs/`.

## Veredito
**Reprovado por um item de forma, não de comportamento.** Os 14 bugs do lote estão resolvidos. Mas `pnpm run pronto` falha em `format:check` em dois arquivos que o lote deixou sem formatar (IS-008, média). Correção trivial (`prettier --write` e um commit `style`); com ela, e o `pronto` verde, o parecer passa a aprovado sem nova rodada de E2E (só toca formatação). Quando o `pronto` completo rodar, registrar aqui.

## Ambiente
WSL2, Chromium headless, `nice -n 19` e `flock /tmp/metricas-pesado.lock`, `--workers=2`. Load de 1 minuto entre 0,2 e 6,8 durante as rodadas (o usuário usava a máquina).

## Execução
- E2E (`chromium`, `--workers=2`): `intensivo-sistemico`, `intensivo-filtros*`, `filtros`, `exportar`, `complementares`: **285 passaram, 3 falharam** (todas em `intensivo-filtros.spec.ts`: IF-U-operacional, IF-A `/operacional?cadencia=semanal` e IF-I01). As 3 falharam por `Test timeout of 30000ms exceeded` / espera de `expect.poll` sob load ~6, sem divergência de asserção de comportamento. Reexecutadas isoladamente (`--workers=1`, load 0,2 a 5): **4/4 passaram** (20 s, 2,4 s, 25,7 s e 16 s). Instáveis sob carga, não defeito; ficam reportadas, sem `skip`. Não há spec `catalogo` separado: o catálogo é coberto em `intensivo-sistemico` e `complementares`.
- `pnpm run pronto`: lint verde; **`format:check` reprova** `web/src/features/exportar/modelo.ts` e `packages/mock/src/desempenho.test.ts` (IS-008). Sem o format, `pnpm -r --if-present run pronto` (typecheck, testes com cobertura, build e orçamentos do web, docs:check: 377 páginas, 51 métricas) terminou sem falha em 7 min 40 s sob load até 6,6.
- Specs `docs/qa/evidencias/`: não regravadas (`git status` limpo antes da correção do IS-001).

## Status por bug
| Bug | Status | Evidência |
|---|---|---|
| IF-001 mudança de filtro perde a anterior | resolvido | `intensivo-filtros.spec.ts` (IF-U, sequências rápidas) verde; teste unitário `useFiltros.test.tsx` |
| IF-002 marcar todas rápido deixa parâmetro | resolvido | IF-I01 verde (isolado); `filtros-componentes.test.tsx` |
| IF-003 EI-FL3 recortado por equipe | resolvido | `businessmap.test.ts`; página `EI_FL3.md` (não atuam: equipe) |
| IF-004 O6 recortado por tipo | resolvido (decisão do usuário: O6 segue o filtro de tipo) | `businessmap.test.ts`; contrato O6 regenerado, `docs:check` ok |
| IF-005 período inválido sem aviso | resolvido | `intensivo-filtros-bordas.spec.ts` (aviso de filtros inválidos) verde |
| IF-006 URL não canônica | resolvido | `paramsOrdenados` no IF-U e na matriz de URLs do spec, verde |
| IF-007 janela de 12 meses sem ano | resolvido | `formatar.test.ts`; spec de filtros verde |
| IS-001 pronto falha por timeout | resolvido (4000300, 45 s; 8dc19d6, 90 s medido sob load 10) | `pnpm -r run pronto` do web sem timeout sob load 6,6; linha "Correção:" corrigida neste commit |
| IS-002 desempenho O9 p95 | resolvido | teste de perf do mock/server (melhor de 3 rodadas), verde no `pronto` |
| IS-003 FiltroMulti perde marcação | resolvido | IF-I01 e `filtros-componentes.test.tsx` |
| IS-004 EI-SUST mostra filtros do fluxo | resolvido (já resolvido pela espera invisível) | `intensivo-sistemico.spec.ts` verde |
| IS-005 catálogo sem o cartão | resolvido | `catalogo.test.tsx`; `intensivo-sistemico` e `complementares` verdes |
| IS-006 PDF do E3 sem o k | resolvido | `modelo.test.ts`; `exportar.spec.ts` verde |
| IS-007 C5 heap nunca medido | resolvido | C5 em `perf.spec.ts`; teste de unidade do web |
| IS-008 (novo) format:check reprova 2 arquivos | **aberto** | `pnpm run format:check` |

## Pendências fora do lote (cartões do review)
Dividir testes lentos do web e baixar o teto de 90 s; mínimos de `pFrio`/`pQuente` do perf do server; rota e hash do cartão de origem em `intensivo-sistemico.spec.ts:137`. Mais: os 3 E2E de `intensivo-filtros` com timeout de 30 s sob carga ficam sob observação (candidatos a um timeout maior ou a menos passos por teste).
