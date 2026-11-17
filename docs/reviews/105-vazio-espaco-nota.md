---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vazio-espaco-nota
commit: 288a04d7aa8953004e20901efd5073fc19e7b9d2
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: nota do cartão vazio com o mesmo espaço (K-400, E7.468; revalidação E7.473)

Diff lido na volta 0: `5b2c4292...5bdb0a25`, 4 arquivos, 6+/3- (`CartaoMetrica.tsx`, `sustentacao.tsx`, `CartaoT9.tsx`, fragmento em `changelog.d/`). Dentro do teto M14; classe T.

- **Faz o que o cartão pede.** `CartaoMetrica.tsx:395` envolve `complementoVazio` num `div.mt-2` só quando o valor é verdadeiro; S8 e T9 perdem o `mt-2` próprio. S1, O19 e S6/S11 passam a ganhar os mesmos 8 px.
- **S8:** o `complementoVazio` devolve `false` quando não há chamado sem resposta; o `&&` não cria o wrapper. Correto.
- **Suíte:** sem PR para a branch; vale o PQ do autor (`pnpm run pronto` rc=0). Não afirmo CI verde.

## Revalidação (volta 1)

Delta lido (`forge-check parecer delta`): `5bdb0a25..288a04d7`, no domínio `sustentacao.tsx` (S11), `CartaoS5.tsx`, `CartaoS6.tsx`, `CartaoS7.tsx` e `vazio-nota-exclusao.test.tsx`.

- S5, S6 e S7 só passam `complementoVazio` com `d.foraDoFluxo > 0`; S11 devolve `null` com `semFluxo = 0`. Corrige o A1 (bug 105-001).
- 4 casos novos (S5, S6, S7, S11 com n = 0) afirmam nenhum `div.mt-2` vazio no cartão. Rodei o arquivo: 20 passed. Mutante (S5 sem `> 0`): o caso S5 falha (1 failed | 19 passed); restaurado.
- Suíte: PQ do autor (`pronto` rc=0); sem PR, não afirmo CI verde.

## Achados
- A1 (recomendado) web/src/components/ui/CartaoMetrica.tsx:395 · resolvido em 288a04d7: S5, S6, S7 e S11 só passam a nota com n > 0.
