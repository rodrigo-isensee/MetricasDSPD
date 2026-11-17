---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-fora-da-conta
commit: 6e7dfe71a529abfaf0e66a843d2265f63905b527
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-fora-da-conta (K-404, E7.489)

Objetivo (decisão A do dono): no cartão vazio a nota de exclusão abre com "Fora da conta:" (O19, O25, E6, S1, S5, S6, S7, S8, S11, T9); com dado nada muda. Sem cálculo novo: o diff só mexe em texto e na prop `vazio`/`complementoVazio`.

## Achados
- A1 (recomendado) web/src/features/complementares/vazio-nota-exclusao.test.tsx:134 · o caso S1 usa regex sem âncora e passa na base; não prova que a nota vem antes da frase da escala. Âncorar (`^Fora da conta:`) ou conferir a ordem.

## Critério → teste → resultado
Sem especificação de UX nova; a obrigação é o brief.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Vazio: nota começa com "Fora da conta:" (O19, O25, E6, S5, S6, S7, S8, S11) | vazio-nota-exclusao.test.tsx, casos "vazio com itens de fora" | vazio n=0, contagem 2 | passou; vermelho na base (8 de 8) |
| T9 vazio | tatico/ramos.test.tsx "todos os projetos sem início" | vazio | passou; vermelho na base |
| S1 vazio: nota antes da escala | caso S1 | vazio | passou, mas não prova a ordem (A1) |
| Sem itens de fora, sem nota | casos "sem itens de fora" | contagem 0 | passou |
| Com dado nada muda | suítes existentes (sustentacao.test.tsx, complementares) | corpo com dado | passou: `vazio` tem padrão false e só o `complementoVazio` passa true; corpo do S7 sem a prop |

## Provas locais (head 6e7dfe71)
- `npx vitest run src/features/complementares src/features/tatico src/features/sustentacao` (web/): 18 arquivos, 465 testes, todos passam.
- Vermelho: revertido à base ca6a1281 só o código de produção dos cartões, mantidos os testes do head: 9 falham (E6, O19, O25, S11, S5, S6, S7, S8 e T9); S1 não cai (A1). Árvore restaurada ao head, limpa.
- `forge-testes --vermelho` não se aplica (stack web, sem mapa).
- Mutação: sem ferramenta gratuita configurada; trocar o `true` de um `complementoVazio` por `false` derruba o caso do cartão, exceto S1 (A1).
- Suíte inteira: fica para o CI do PR; cito o `pronto` rc=0 do autor, sem afirmar CI verde.
