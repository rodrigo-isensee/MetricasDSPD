---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l1b-janela-tendencias
commit: d5f6981e4aee058f839820d587c7e95409069437
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 077 lote 1b, as tendências aplicam a janela incompleta (K-211, E2.2)

Diff lido: `e89ae3f3...d5f6981e` (5 arquivos, 104 adições e 7 remoções), contra `## 3. Regras técnicas fixadas` (regra da janela, A4) e `## Lote 1b` de `docs/analises/077-desenho.md`.

## Parecer
**Aprovado.** Faz o que o lote pede, nem mais nem menos.

- **Aderência ao desenho:** `ContextoBM` e `ContextoAC` ganham `historicoDesde?: string` (`businessmap/indice.ts:77`, `acelerato/indice.ts:52`). Os dois `tendencia.ts` chamam `janelaIncompleta` (de `core/series.ts:116`) com a janela que já calculam por `janelaMovelDia` (`janelaPercentis` no fluxo, `janela` na sustentação); nenhuma reimplementação das 12 semanas.
- **Sem estatística e antes do "poucos itens" (CA-4):** com a janela incompleta, `p85PorTipo` e `prioridades` saem vazios antes de qualquer `classesNaJanela`/`aderenciaPorPrioridade`, então o `insuficiente` nunca aparece num mês de janela incompleta; o ponto leva `janelaIncompleta: { historicoDesde }`, no formato do schema do Lote 1a (`contratos/src/schemas.ts:1325`).
- **Contagens inalteradas:** `concluidos` (fluxo) e `volume` (sustentação) continuam calculados fora do ramo da janela.
- **Ausente = hoje:** `janelaIncompleta` devolve falso sem `historicoDesde`; os testes comparam por `toEqual` o resultado com e sem o campo ausente, e a propriedade "cada ponto = `calcularO3`" (`tendencia.test.ts:305`) segue rodando sem `historicoDesde`.
- **Fontes separadas:** o campo do BusinessMap vive em `ContextoBM` e só a tendência do fluxo o lê; o do Acelerato, em `ContextoAC`. Nenhum cálculo cruza as fontes.
- **Testes (`tendencia.test.ts:370-453`):** CA-1 (30 itens, sem estatística, com a data, schema válido), CA-4 (14 itens, só a marca), CA-3 (janela completa com 19, `insuficiente`), ausente = hoje, nas duas fontes. A data `2026-06-10` deixa agosto incompleto (janela começa em 2026-06-09) e setembro completo: conta conferida. Tirar o ramo `incompleta` derruba o CA-1 e o CA-4.
- **Fora do diff, como pedido:** sem migração, sem mudança de schema nem de `aceitas.json`; `packages/contratos`, `server/` e `web/` sem diff.

## Ferramentas
- CI do push no head `d5f6981e`: run 42335758291, `push`, `completed`, `success` (`gh run list`).
- Testes do arquivo tocado, 2 workers: `packages/metricas/src/tendencia.test.ts`, 31 verdes.
- Lint, tipos e `docs:check`: cobertos pela mesma CI verde; não refeitos.

## Teto M14
111 linhas de código e teste (`acelerato/tendencia.ts` 10+5, `businessmap/tendencia.ts` 5+2, os dois `indice.ts` 2+0 cada, `tendencia.test.ts` 85+0), dentro de 150. Um comportamento só.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/tendencia.ts:32 · `ctx.historicoDesde as string` é escape de tipo; seguro porque `janelaIncompleta` só é verdadeira com o campo definido, mas um guarda de tipo (`historicoDesde is string`) tiraria o cast. Vale também para `acelerato/tendencia.ts:34`.
- A2 (recomendado) packages/metricas/src/tendencia.test.ts:386 · a contagem de agosto é afirmada por relação com setembro; comparar `concluidos` e `volume` mês a mês com o resultado sem `historicoDesde` provaria "contagens inalteradas" direto.
