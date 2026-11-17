---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vazio-nota-exclusao
commit: 556d057bb1e4ede8c4f8b54a8137e5c587b780bd
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: nota de exclusão no cartão vazio, K-373 (E7.456)

Branch `fix/105-vazio-nota-exclusao` contra `develop` (base `d65624e7`), head `556d057b`. 10 arquivos, 245 linhas de código e teste (fora o fragmento de changelog); um comportamento só: no estado vazio (`base.n = 0`) o cartão mostra a nota de exclusão que a métrica já mostrava no corpo, só com contagem maior que zero.

## Parecer
**Aprovado** no head `556d057b`.

- Escopo: O19, E6, S8, S11, S5, S6, S7 e S1 passam a usar o `complementoVazio` que o `CartaoMetrica` já tinha (o mesmo usado pelo T9). Texto existente, extraído para uma função (`notaAbertosO19`, `notaSemDataE6`, `notaForaDaMatriz`) usada no corpo e no vazio: sem duplicação e sem cálculo novo. O `CartaoComplementar` ganha a prop opcional e só a repassa com dado.
- Desvio de escopo (arquivos em `web/src/features` fora do brief do autor): aceito. É o lugar natural da mudança e o erro foi do brief, como o próprio Jarvis registrou; nada fora do comportamento pedido.
- O22: fica fora com razão. `semToque` descreve pedidos que estão na conta, não itens excluídos; com `base.n = 0` não há o que dizer.
- O25: o "Aviso de preenchimento" (cards com motivo sem estar descartados, "fora da taxa") é nota de exclusão do mesmo tipo e caberia no vazio. Não bloqueia: vai como A1, cartão novo.
- Testes: `vazio-nota-exclusao.test.tsx`, 16 casos (8 métricas x com e sem itens de fora). Rodei: 16 passed. Mutante `n <= 0` → `n < 0` em `notaAbertosO19`: morto (falha "O19: vazio sem itens de fora não mostra a nota").
- Suíte: PQ do autor, `pnpm run pronto` rc=0. Sem PR, não afirmo CI verde.
- Regras invioláveis: só texto de contagem agregada; nada individual, nenhuma mistura de fontes.

## Achados
- A1 (recomendado) web/src/features/complementares/operacionais.tsx:790 · O25: o aviso de preenchimento ("fora da taxa") não aparece no estado vazio; abrir cartão para levá-lo ao `complementoVazio` como os demais.
- A2 (recomendado) web/src/features/complementares/vazio-nota-exclusao.test.tsx:1 · 245 linhas de código e teste, acima da orientação de 150: o corpo do PR deve trazer `teto: excedido, 245 linhas, 8 cartões com o mesmo padrão e teste parametrizado`.
- A3 (recomendado) web/src/features/complementares/operacionais.tsx:130 · dois blocos de doc seguidos (`/** O19: barras... */` e `/** O19: bloqueios... */`); o primeiro ficou órfão sobre a função nova. O mesmo em estrategicas.tsx:190 (E6). Mover o comentário original para junto do `CartaoO19`/`CartaoE6`.
