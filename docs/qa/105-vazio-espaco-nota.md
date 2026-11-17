---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vazio-espaco-nota
commit: 288a04d7aa8953004e20901efd5073fc19e7b9d2
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-vazio-espaco-nota (K-400, E7.469 e revalidação E7.474)

Mudança só de espaçamento: `CartaoMetrica.tsx` envolve `complementoVazio` num `div mt-2`; S8 e T9 perdem o `mt-2` próprio. Volta 1 (288a04d7): S5, S6, S7 e S11 só passam a nota ao `complementoVazio` com n > 0; 4 casos novos em `vazio-nota-exclusao.test.tsx`.

Sem achados abertos: o A1 da rodada anterior (bug 105-001) está fechado, pois S5, S6, S7 e S11 não passam mais o elemento com n=0.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Nota do vazio com o mesmo espaço em todos os cartões | vazio-nota-exclusao.test.tsx (O19, O25, E6, S11, S8, T9) | vazio com nota | passou |
| Nenhum cartão sem nota ganha div vazio | vazio-nota-exclusao.test.tsx, 4 casos novos (S5, S6, S7, S11 com n=0: nenhum `div.mt-2` sem filho e sem texto) | nota ausente (n=0) | passou (4/4) |

## Cenários e resultado real
- Diff 5bdb0a25..288a04d7 (delta do domínio): sustentacao.tsx (S11), CartaoS5/S6/S7 (`d && d.foraDoFluxo > 0`) e o teste; confere com o brief.
- `vitest run vazio-nota-exclusao` no head 288a04d7: Test Files 1 passed, Tests 20 passed (20).
- Vermelho antes do verde (`forge-testes` não existe neste projeto; feito à mão): os 4 arquivos de produção voltados ao 5bdb0a25, mesmo teste: `Tests 4 failed | 16 passed (20)`; falharam os 4 novos ("S5/S6/S7/S11: vazio com n = 0 não deixa o div da nota vazio no cartão"). Árvore restaurada ao 288a04d7, limpa.
- Mutação: não rodada (condição `> 0` coberta pelo vermelho acima; sem ferramenta no escopo).
- Suíte inteira: no CI do PR (ainda sem PR); o PQ do autor é `pronto rc=0`, citado, não reexecutado. Não afirmo CI verde.
