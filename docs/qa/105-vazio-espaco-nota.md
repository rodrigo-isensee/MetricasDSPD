---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vazio-espaco-nota
commit: 5bdb0a25769c03837fb88a7ed3ebe8698c426e39
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-17
---
# QA: 105-vazio-espaco-nota (K-400, E7.469)

Mudança só de espaçamento: `CartaoMetrica.tsx` envolve `complementoVazio` num `div mt-2`; S8 e T9 perdem o `mt-2` próprio. Sem teste novo (o autor declarou); sem especificação nova de UX, então não há plano antecipado.

## Achados
- A1 (recomendado) web/src/components/ui/CartaoMetrica.tsx:395 · `complementoVazio` de S5, S6, S7 e S11 é elemento sempre truthy que rende null com n=0 (NotaForaDoFluxo); o div mt-2 sai vazio, contra "só quando há conteúdo". Bug 105-001.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Nota do vazio com o mesmo espaço em todos os cartões | vazio-nota-exclusao.test.tsx (O19, O25, E6, S11, S8, T9; 16 testes) | vazio com nota, vazio sem nota | passou (16/16) |
| Nenhum cartão sem nota ganha div vazio | leitura de código dos usos de `complementoVazio` | nota ausente | parcial: O19, O25, E6, S8, S1 ok; S5, S6, S7 e S11 geram div vazio com n=0 (A1) |

## Cenários e resultado real
- Diff 5b2c4292..5bdb0a25: 4 arquivos (CartaoMetrica, sustentacao.tsx, CartaoT9, changelog.d); escopo confere com o brief.
- `vitest run vazio-nota-exclusao` na worktree, head 5bdb0a25: Test Files 1 passed, Tests 16 passed (16).
- O19, O25 e E6 devolvem null com zero e S8 devolve `false`: nada de div. S1 sempre traz texto. S5, S6 e S7 passam o prop quando há dado e S11 sempre; os quatro passam `<NotaForaDoFluxo>`, que devolve null com n<=0, mas o elemento é truthy: o div `mt-2` sai vazio (8 px de margem sem conteúdo). Antes do K-400 não rendia nada. Efeito cosmético.
- Vermelho antes do verde: não se aplica (sem teste novo, só espaçamento). Mutação: não rodada (classes CSS, sem regra).
- Suíte inteira: no CI do PR (ainda sem PR); o PQ do autor é `pronto rc=0`, citado, não reexecutado. Não afirmo CI verde.
