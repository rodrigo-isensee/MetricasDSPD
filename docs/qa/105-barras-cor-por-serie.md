---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-barras-cor-por-serie
commit: 1a42330abb39cd5a1c5e16f297e4df99bd43399d
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-barras-cor-por-serie (K-366, E7.454)

Pedido de correção sem especificação nova: sem plano antecipado. Obrigação: a mesma série tem sempre a mesma cor e o mesmo padrão nas barras, mesmo quando outra série some por estar vazia.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Série vazia no meio não desloca cor e padrão das demais | graficos-composicao.test.tsx, "série vazia no meio: ... posição na lista completa" | série vazia entre duas com valor | passou no head, falha na base |
| Legenda, tabela e desenho usam a mesma configuração | mesmo `cfg` em Barras.tsx (lido no diff); 27 testes do arquivo passam | n/a | passou |

## Cenários e resultado real
- Vermelho antes do verde: com a Barras.tsx da base d65624e7 e o teste do head, 1 falhou e 26 passaram ("série vazia no meio: ... mantêm cor e padrão da posição na lista completa"); com o head, 27 de 27 passaram. Feito numa cópia do arquivo na própria worktree, restaurado, árvore limpa.
- Consumidores de Barras: `vitest run src/features src/components/charts` na primeira rodada, 3 falhas (apontamento CA-8 mobile, operacional/diaria O3, tatico T7) e 1535 passes; reexecutados os 3 arquivos sozinhos: 91 de 91 passaram. Falha só sob carga da suíte, sem relação com Barras (nenhum dos 3 testes toca a configuração de série); registrado como instável, não como defeito. A suíte inteira roda no CI do PR; não afirmo CI verde (sem PR ainda).
- Cartões que comparam períodos (O1, O4, T1, T2, E1 usam Barras): passam nos testes de feature.
- Diff lido: `semPadrao` agora conta a lista completa; padrão por posição só com 2 ou mais séries sem padrão informado. Efeito colateral aceito: série vazia que não tem padrão ainda conta para ligar os padrões; não quebra o critério.
- Mutação: não rodada (stack sem ferramenta registrada para este diff); o teste mata o retorno ao índice pós-filtro, comprovado pelo vermelho acima.
- PQ do autor: pronto rc=0 (informado no brief).
