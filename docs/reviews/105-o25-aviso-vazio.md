---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-o25-aviso-vazio
commit: f509357af95b3a8b5aea2ac28a0d405e15592a35
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: aviso de preenchimento do O25 no cartão vazio, K-399 (E7.464)

Branch `fix/105-o25-aviso-vazio`, empilhada sobre `fix/105-vazio-nota-exclusao` (K-373, PR 528); diff lido: `origin/fix/105-vazio-nota-exclusao...f509357a`. 3 arquivos, 31 adições e 8 remoções (34 linhas de código e teste, fora o changelog); um comportamento só. Fecha o A1 do review do K-373.

## Parecer
**Aprovado** no head `f509357a`.

- Escopo: `notaPreenchimentoO25(n)` (null com `n <= 0`) extrai o aviso que já existia no corpo e passa a ser usada também no `complementoVazio` do `CartaoO25`. Mesmo texto e mesmo `testid` (`o25-aviso-preenchimento`); sem cálculo novo nem duplicação.
- Testes: par do O25 (com e sem itens de fora) em `vazio-nota-exclusao.test.tsx`. Rodei: 18 passed.
- Mutante `n <= 0` → `n < 0` em `notaPreenchimentoO25` (operacionais.tsx:703): morto ("O25: vazio sem itens de fora não mostra a nota", 1 failed, 17 passed); fonte restaurada.
- Suíte: PQ do autor, `pnpm run pronto` rc=0. Sem PR, não afirmo CI verde.
- Regras invioláveis: só contagem agregada de cards; nada individual, nenhuma mistura de fontes.
- Changelog: fragmento `changelog.d/fix-105-o25-aviso-vazio.md` presente.

## Achados
