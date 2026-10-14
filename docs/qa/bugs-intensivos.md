---
tipo: qa
contrato: 1
pedido: bugs-intensivos
branch: fix/bugs-intensivos
commit: 70b48a3
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-14
---

# Parecer de QA: lote de bugs dos testes intensivos (IF-001 a IF-007, IS-001 a IS-007)

Links: `docs/reviews/bugs-intensivos.md` (code review aprovado), `docs/qa/intensivo-filtros.md`, `docs/qa/intensivo-sistemico.md`, `docs/qa/bugs/`.

## Veredito
**Aprovado** no HEAD 70b48a3. Os 15 bugs do lote estão resolvidos (IF-001 a IF-007, IS-001 a IS-008). O IS-008 (`format:check` reprovava dois arquivos, média) foi corrigido em 0c7d348, só formatação.

Reteste incremental após 81e1ae0 (entraram b74d78f, parecer de UX; 4e47bcf, `fix(web)`; 70b48a3, review). O diff de `web` desde 81e1ae0 toca `AvisoFiltrosInvalidos.tsx` (texto novo quando o período personalizado do link é inválido), `FiltroMulti.tsx` (botão e `aria-label` passam a usar `exibidos`, as caixas marcadas, em vez de `selecionados`) e dois arquivos de teste de unidade.
- E2E (`chromium`, `--workers=2`, `nice -n 19`, `flock`): `filtros` e `intensivo-filtros*` (177 testes): **176 passaram, 1 falhou** (IF-A `/operacional?cadencia=semanal`, instável sob carga). Reexecutado isolado (`--workers=1`) duas vezes: **2/2 passaram** (41,8 s e 50,2 s). IF-I01 e IF-U passaram desta vez. Instabilidade só de tempo, sem divergência de asserção; fica reportada, sem `skip`.
- Texto novo do aviso: as 9 variantes de período inválido do `intensivo-filtros-bordas.spec.ts` (B09 a B17, asserção `/período personalizado/` em `aviso-filtros-invalidos`) passaram com a mensagem nova; o teste de unidade `filtros-url.test.tsx` confere "O período personalizado do link é inválido" e a ausência do texto de "filtros inexistentes". O aviso mantém `role="status"`.
- Anúncio do botão: `filtros-componentes.test.tsx` confere `toHaveAccessibleName('Equipe: Alfa')` e o texto visível iguais logo após marcar a caixa (nome acessível coincide com o rótulo visível, WCAG 2.5.3). Os axe do IF-I09 (375 e 1280 px, claro e escuro) e o IF-I08 (teclado) passaram sem violações sérias.
- `docs/qa/evidencias/`: não regravado.

Verificações da rodada anterior (b76b789, sem mudança de código fora de `web` desde então): `format:check` e `lint` verdes; `pnpm -r --if-present run pronto` (typecheck, testes com cobertura, build e orçamentos do web, docs:check: 377 páginas, 51 métricas) sem falha. Os testes de unidade do web alterados em 4e47bcf foram cobertos pelo autor e pelo review; esta rodada não repetiu o `pronto` completo.

## Ambiente
WSL2, Chromium headless, `nice -n 19` e `flock /tmp/metricas-pesado.lock`, `--workers=2`. Load de 1 minuto entre 1 e 5.

## Execução da rodada anterior (b76b789)
- E2E (`intensivo-sistemico`, `intensivo-filtros*`, `filtros`, `exportar`, `complementares`): 285 passaram, 3 falharam por timeout de 30 s sob load ~6 (IF-U-operacional, IF-A semanal, IF-I01); reexecutadas isoladas, 4/4 passaram.

## Status por bug
| Bug | Status | Evidência |
|---|---|---|
| IF-001 mudança de filtro perde a anterior | resolvido | `intensivo-filtros.spec.ts` (IF-U, sequências rápidas) verde; teste unitário `useFiltros.test.tsx` |
| IF-002 marcar todas rápido deixa parâmetro | resolvido | IF-I01 verde; `filtros-componentes.test.tsx` |
| IF-003 EI-FL3 recortado por equipe | resolvido | `businessmap.test.ts`; página `EI_FL3.md` (não atuam: equipe) |
| IF-004 O6 recortado por tipo | resolvido (decisão do usuário: O6 segue o filtro de tipo) | `businessmap.test.ts`; contrato O6 regenerado, `docs:check` ok |
| IF-005 período inválido sem aviso | resolvido | `intensivo-filtros-bordas.spec.ts` B09 a B17 verdes com o texto novo |
| IF-006 URL não canônica | resolvido | `paramsOrdenados` no IF-U e na matriz de URLs do spec, verde |
| IF-007 janela de 12 meses sem ano | resolvido | `formatar.test.ts`; spec de filtros verde |
| IS-001 pronto falha por timeout | resolvido (4000300, 45 s; 8dc19d6, 90 s medido sob load 10) | `pnpm -r run pronto` do web sem timeout sob load 6,6 |
| IS-002 desempenho O9 p95 | resolvido | teste de perf do mock/server (melhor de 3 rodadas), verde no `pronto` |
| IS-003 FiltroMulti perde marcação | resolvido (reforçado em 4e47bcf: botão segue as caixas) | IF-I01 e `filtros-componentes.test.tsx` |
| IS-004 EI-SUST mostra filtros do fluxo | resolvido (pela espera invisível) | `intensivo-sistemico.spec.ts` verde |
| IS-005 catálogo sem o cartão | resolvido | `catalogo.test.tsx`; `intensivo-sistemico` e `complementares` verdes |
| IS-006 PDF do E3 sem o k | resolvido | `modelo.test.ts`; `exportar.spec.ts` verde |
| IS-007 C5 heap nunca medido | resolvido | C5 em `perf.spec.ts`; teste de unidade do web |
| IS-008 format:check reprova 2 arquivos | resolvido (0c7d348, só formatação) | `format:check` e `lint` verdes; `docs/qa/bugs/IS-008-*.md` |

## Pendências fora do lote (cartões do review)
Dividir testes lentos do web e baixar o teto de 90 s; mínimos de `pFrio`/`pQuente` do perf do server; rota e hash do cartão de origem em `intensivo-sistemico.spec.ts:137`. Mais: o IF-A semanal (e, antes, IF-U e IF-I01) de `intensivo-filtros` estoura o timeout de 30 s sob carga com `--workers=2` (candidatos a timeout maior ou menos passos por teste); sob observação.
