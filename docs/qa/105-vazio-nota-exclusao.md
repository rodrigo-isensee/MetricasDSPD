---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vazio-nota-exclusao
commit: 556d057bb1e4ede8c4f8b54a8137e5c587b780bd
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-vazio-nota-exclusao (K-373, E7.457)

Objetivo: no estado vazio (base.n = 0) o cartão mostra a nota de exclusão que a métrica já tinha, só com contagem maior que zero. Cartões: O19, E6, S8, S11, S5, S6, S7, S1. Sem cálculo novo (conferido no diff: só reposicionamento de texto e a prop `complementoVazio`).

## Achados
- A1 (recomendado) web/src/features/complementares/estrategicas.tsx:190 · o JSDoc de CartaoE6 ficou acima do helper notaSemDataE6; CartaoE6 perdeu a doc. Mesmo em operacionais.tsx:130 (O19). Mover o comentário de volta.

## Critério → teste → resultado
Não há especificação de UX nova (correção); a obrigação é o objetivo do brief.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Vazio com itens de fora mostra a nota (8 cartões) | vazio-nota-exclusao.test.tsx, 8 casos "vazio com itens de fora" | vazio (n = 0) com contagem 2 | passou |
| Vazio sem itens de fora não mostra a nota | 8 casos "vazio sem itens de fora" | contagem 0 (limite logo abaixo) | passou |
| Corpo com dados mantém a nota (E6, O19, S1 extraídos para helper) | suíte existente dos cartões (CI do PR) | n/a | não rodei; vale o PQ do autor |

## Cenários e resultado real
- Teste novo, local, no head 556d057b: 16 de 16 passam (vitest, `web/`).
- Vermelho antes do verde: `forge-testes --vermelho d65624e7` não tem mapa para estes arquivos e saiu "nenhum teste prova" (a ferramenta é do Forge/Python, não vale aqui). Fiz à mão: revertido à base `d65624e7` o código dos 8 arquivos de produção e mantido o teste novo, 8 de 16 falham (O19, E6, S8, S11, S5, S6, S7, S1, os casos "com itens de fora"); os 8 de "sem itens de fora" passam, como esperado. Árvore restaurada ao head depois.
- Conferência "na tela": não houve navegador; o teste renderiza o cartão em jsdom com o estado `data-estado="vazio"` e confere o texto e o testid da nota dentro do cartão. Isso é o que foi visto.
- Mutação: sem ferramenta gratuita configurada para esta rodada; os 8 casos "com" e 8 "sem" cobrem a guarda `> 0` de cada cartão.
- Suíte inteira: fica para o CI do PR (não afirmo CI verde); cito o `pronto` rc=0 do autor.
- Fora do escopo, intocados: O26, T13, O12, O18, O22, O25.
