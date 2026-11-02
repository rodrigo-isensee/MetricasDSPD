# Revisão de UX da aba Apontamento, renovação r2 (pedido 059, E2.33)

Veredito: aprovada. Os achados A-1 a A-13 da revisão anterior estão resolvidos no código da branch `feature/059-aba-front` (worktree 052h, ponta 2f25c22 segundo o relato da E2.35). Nenhum achado novo crítico, alto ou médio. A mudança no componente compartilhado `TabelaDados` não quebra as outras telas. A nota de Outra área segue provisória, como pedido.

Método: leitura estática de `CartaoDiario.tsx`, `CartoesCapacidade.tsx`, `NotaOutraArea.tsx`, `rolagem.ts`, `TabelaDados.tsx` e do teste `revisao-ux.test.tsx`, contra `docs/ux/059-revisao-delta.md`. Não executei a aplicação nem a suíte (o papel não tem Bash). Comportamento visual em 375 px e contraste real continuam como verificação do QA. Nenhum nome de pessoa neste parecer.

## Conferência dos achados anteriores

| Achado | Resultado | Evidência |
|---|---|---|
| A-1 rolagem com Pessoa fixa nas tabelas por pessoa | Resolvido | Teste "A-1" confere região com `tabindex 0`, `overflow-x-auto`, `max-w-full` e cabeçalho e linhas da coluna Pessoa com `sticky`, nas duas tabelas por pessoa. O cabeçalho fixo vem do `TabelaDados`. Falta só a prova visual em 375 px (QA). |
| A-2 célula focada sob colunas fixas | Resolvido | `rolagem.ts` calcula o deslocamento entre a coluna fixa esquerda e a direita, e `CartaoDiario` chama `rolarCelulaParaVista` no foco. Testes em `mapa-diario.test.tsx` cobrem a função pura e o caso sem região. |
| A-3 nota de Outra área | Resolvido, provisório | `NotaOutraArea` mostra a frase uma vez por cartão quando a linha existe (matriz, qualidade por pessoa, filtro). Texto igual ao sugerido. Fica provisório até o dono validar o microcopy. |
| A-4 Outra área nas faixas por pessoa e dia | Resolvido | Mapa diário e capacidade por pessoa excluem Outra área; matriz e qualidade a mantêm como soma. Segue a decisão técnica de 2026-11-02. |
| A-5 dia não útil sem motivo | Resolvido | Rótulo acessível traz "fim de semana" ou "feriado" antes das horas; célula com apontamento mantém a faixa e borda tracejada; legenda ganhou "Apontamento em fim de semana ou feriado". |
| A-6 texto de público | Resolvido | Teste confirma "Para quem acompanha o painel · fonte única: BusinessMap." |
| A-7 aviso de nome real | Resolvido | A região da aba carrega o aviso no nome acessível com `nomesReais`, e só se chama "Apontamento" sem ele. |
| A-8 chip de ordem | Resolvido | Chip "Ordem: total de horas" removível, "Filtros (n)" conta a ordem, "Limpar filtros" volta à neutra. |
| A-9 datas de critério | Resolvido | "Versão vigente desde dd/mm/aaaa" usa a mais recente da família, em qualquer ordem; mês em andamento diz até quando vale. |
| A-10 célula de utilização | Resolvido | Célula traz só "19%"; abaixo do piso, a marca de amostra insuficiente. |
| A-11 anúncio duplicado | Resolvido | Texto visível com `aria-hidden`; a região viva anuncia. |
| A-12 atalho de dias atípicos | Resolvido | Rótulo "Ver mapa diário", âncora `#ap-diario` e foco no título do cartão. |
| A-13 formato de data | Resolvido | Período do cabeçalho em dd/mm/aaaa. |

## Efeito da mudança no `TabelaDados` nas outras telas

A única mudança é a primeira célula do cabeçalho ganhar `sticky left-0 z-10 bg-superficie-2`, igual ao que as células da primeira coluna das linhas já tinham. Avaliação:
- Sem rolagem horizontal (tabelas que cabem na região), `sticky` não tem efeito visível; o fundo é o mesmo do `thead`, então a aparência não muda.
- Com rolagem, o cabeçalho da primeira coluna passa a acompanhar a coluna fixa, o que corrige um defeito (rótulo da coluna sumia ao rolar). É ganho em todas as 30 e poucas telas que usam o componente (operacional, tático, sustentação, complementares, dados, catálogo, percepção), sem mudar API nem conteúdo.
- Texto de cabeçalho é o mesmo; contraste não muda.

## Achados

- [baixo] R2-1. Onde: `TabelaDados.tsx`, cabeçalho e primeira coluna com `z-10`. Por quê: sem teste visual, a coluna fixa pode ficar acima de menus ou popovers com z-index igual nas telas que reúnem os dois. Correção: o QA conferir uma tela com tabela rolável perto de popover (filtros) em 375 px; só agir se houver sobreposição.
- [baixo] R2-2. Onde: A-1 e A-2, comportamento em 375 px. Por quê: os testes cobrem classes e geometria simulada, não o layout real; a prova do foco sempre visível (WCAG 2.4.11) depende de navegador. Correção: o QA cobrir no E2E, ou à mão, setas no mapa em 375 px com a coluna Total.
- [baixo] R2-3. Onde: `NOTA_OUTRA_AREA`. Por quê: texto é sugestão minha ainda não validada pelo dono. Correção: o dono confirmar ou ajustar o microcopy; trocar só a constante em `textos.ts`.

## Recomendação
Liberar a aba da perspectiva de UX. Os itens R2-1 e R2-2 vão ao QA como verificação visual; R2-3 espera o dono. Não bloqueiam o PR.
