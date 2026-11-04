---
pedido: 063-worklog-cards-acima-do-teto
branch: feature/063-aviso-incompleto
commit: 63261e12fecdb52040dca1d62b4be254e05abfe9
etapa: E2.7 (ux-designer)
veredito: aprovado com ressalvas (nenhum achado crítico ou alto; 1 médio a decidir antes do QA)
---

# Revisão de interface do aviso de registro de horas incompleto (063, E2.7)

Contra `docs/ux/063-aviso-registro-incompleto.md` (12 CA), heurísticas de Nielsen e WCAG 2.2 AA. Revisão por leitura de código (`AvisoRegistroIncompleto.tsx`, `CartaoDistribuicao.tsx`, `CartaoKpis.tsx`, `CabecalhoPainel.tsx`, `Dica.tsx`, `ApontamentoPage.tsx`, `textos.ts`) e do recorte no servidor (`repositorio.ts`, `servico.ts`). Não rodei a tela no navegador.

## Conformidade por critério
| CA | Resultado |
|---|---|
| CA-1 | Atende: faixa dentro do cabeçalho, abaixo da legenda e acima dos filtros; singular/plural; ícone e corpo da microcopy. |
| CA-2 | Atende: botão nativo, `aria-expanded`/`aria-controls`; lista só com card, título e projeto. |
| CA-3 | Atende com desvio aceito (achado 1): selo em lista abaixo do gráfico; coluna "Observação" na tabela. |
| CA-4 | Atende só por ativação (achado 2); Esc fecha. |
| CA-5 | Atende: sem botão de dispensa. |
| CA-6 | Atende: o sinal vem na mesma resposta; nada no navegador. |
| CA-7 | Atende para período, Projeto e Tipo (achado 3). |
| CA-8 | Atende: nenhum termo proibido nem valor estimado nos textos. |
| CA-9 | Plausível pelas classes (coluna, `break-words`, `min-h-11`), sem prova (achado 4). |
| CA-10 | Atende no que o código mostra; contraste dos tokens não medido (achado 6). |
| CA-11 | Atende: sem pessoa, horas ou ordenação por pessoa. |
| CA-12 | Atende: `temIncompleto` trata campo ausente e total 0 como nada. |

## Achados
1. Baixo, desvio aceito. Onde: `CartaoDistribuicao.tsx` (lista "Projetos com horas incompletas"). Por quê: a especificação pedia o selo ao lado do rótulo; o gráfico de barras é SVG e não aceita elemento no rótulo. Correção: aceitar a lista (tem `aria-label`, é lida por leitor de tela e repete a coluna da tabela); registrar o desvio na especificação.
2. Médio. Onde: `Dica.tsx` e `SeloHorasIncompletas`. Por quê: o comentário do `Dica` e o CA-4 dizem que abre por foco, mas não há tratamento de foco; abre por clique, toque, Enter e Espaço, e o teste usa Enter. Quem navega por Tab não vê a dica sem ativar. Correção: preferida, ajustar o CA-4 para "ao ativar o selo" (botão nativo, vale para WCAG 1.4.13 e 2.1.1) e corrigir o comentário do `Dica`; alternativa, abrir no foco só para este selo.
3. Baixo. Onde: `repositorio.ts` `lerCardsIncompletos`. Por quê: o servidor aplica período, Projeto e Tipo, o que cumpre o CA-7; Pessoa, Subgrupo e Subtarefa não reduzem a lista, o que é coerente (o card segue incompleto) mas a faixa pode aparecer com esses filtros. Correção: nenhuma; registrar na especificação que o recorte da faixa é período, Projeto e Tipo. A hipótese da especificação (o back filtra) fica confirmada.
4. Médio. Onde: tela de 375 px, sem teste de layout. Por quê: o jsdom não mede layout; CA-9 (sem rolagem horizontal, alvo de 44 px) depende de CSS não verificado, e o título longo de card pode estourar. Correção: o QA conferir 375 px no navegador (E2E ou manual) com título longo; o código já usa `break-words` na lista e `min-h-11` no botão.
5. Baixo. Onde: `NotaKpisIncompleto`. Por quê: a nota diz "veja o aviso no topo" e o link "Ir ao aviso" move o foco para a faixa (bom); a faixa fica no cabeçalho, logo abaixo da legenda, não no topo absoluto. Correção: nenhuma obrigatória; se o texto confundir na validação, trocar "no topo" por "acima".
6. Baixo. Onde: faixa (`text-texto-2` sobre `bg-superficie-2`) e selo (`text-xs`). Por quê: o par de cores do corpo da faixa não foi medido contra 4.5:1; o selo tem 24 px de altura, no mínimo da WCAG 2.5.8, abaixo do ideal de 44 px. Correção: o QA medir o contraste nos dois temas; ampliar o alvo do selo se couber sem inchar a lista.
7. Baixo. Onde: textos da especificação e do `textos.ts`. Por quê: onde a especificação fala em "coleta por período completar o card", vale a leitura de todas as páginas (D-5); a tela não cita período, então nenhum texto muda. Correção: ajustar só a redação da especificação (Objetivo, Fluxo 3 e CA-6) para "a coleta completar o card".

## Dependências e fora do escopo
- O sinal some quando o back marca o card como completo (cobertura mais recente diferente de `incompleto`); o front não decide isso. Conferir na E2.6 com uma resposta sem o card.
- Ordem de foco e anúncio: faixa com `role="status"` uma vez (o rótulo da seção não repete o texto). Ok.
