# Revisão de UX: correções do lote de bugs intensivos

Escopo: branch `fix/bugs-intensivos` (worktree `MetricasDSPD-bugs`). Revisão só de leitura do código dos componentes web, contra o esperado de cada bug, o design system, as heurísticas de Nielsen e a WCAG 2.2 AA. Não rodei servidor nem testes: o comportamento em tela fica a cargo do QA. Os commits não puderam ser abertos com `git show` (sem shell); li o estado atual dos arquivos na branch. IF-004 (O6 segue o filtro de tipo) é decisão do usuário e não foi reaberta.

## Veredito por bug

| Bug | Veredito | Onde |
|---|---|---|
| IF-005 aviso de período personalizado inválido | Atende, com ajuste de texto (baixo) | `web/src/features/filtros/useFiltros.ts:216-229`, `AvisoFiltrosInvalidos.tsx:19`, `codec.ts:81` |
| IF-007 ano na janela de 12 meses | Atende | `web/src/lib/formatar.ts:37-40`, usado em `CartaoMetrica.tsx:142` |
| IF-001 filtro perde o anterior | Atende | `useFiltros.ts:248-261, 306-310`, `buscaPendente.ts` |
| IF-002 marcar todas deixa parâmetro | Atende, com observação (baixo) | `FiltroMulti.tsx:122-131` |
| IS-003 filtro múltiplo perde marcação sob carga | Atende, com ajuste (baixo) | `FiltroMulti.tsx:97-121, 162-165` |
| IS-005 catálogo leva ao cartão | Atende | `web/src/features/catalogo/linhas.ts:28-40`, `web/src/lib/destinoCartao.ts:4-14` |
| IS-006 PDF do E3 com "k de n" | Atende | `web/src/features/exportar/modelo.ts:310-315, 361` |

### IF-005
- O aviso agora aparece: `custom` inválido deixou de cair no ramo "não aplicável" que apagava os parâmetros em silêncio (`useFiltros.ts:216-218`). `role="status"` anuncia a mensagem, o ícone vem com texto (não depende só de cor) e há botão "Entendi".
- Ajuste (baixo, microcopy), `AvisoFiltrosInvalidos.tsx:19` e `codec.ts:81`: o texto lê "Alguns filtros do link não existem e foram ignorados: período personalizado." O período existe, só está inválido (sem datas, invertido, data impossível). Sugestão: "O período personalizado do link não é válido e foi ignorado. Mostrando Últimas 12 semanas." Dizer o que vale no lugar ajuda a recuperar do erro. Não bloqueia.
- O botão "Entendi" usa a classe `text-xs`; confirmar que o alvo de toque do `Botao` mantém 44 px no mobile (`.alvo` em `tokens.css:133-142`). Não é regressão desta correção.

### IF-007
- `fmtIntervalo` mostra o ano do início só quando difere do fim ("10/10/2025 a 09/10/2026"), igual ao recorte da Visão geral. Texto claro, sem ambiguidade para leitor de tela.

### IF-001, IF-002 e IS-003
- A causa estava na base da escrita da URL: agora toda ação parte do estado vigente (`buscaVigente`, `registrarBusca`), então cliques rápidos não se desfazem. Boa solução, invisível para a pessoa.
- `FiltroMulti` exibe a última marcação emitida (`exibidos`), e a lista de caixas passa a refletir o clique na hora. As caixas têm `label` visível, `fieldset` com `legend` (sr-only), foco nativo e alvo `.alvo`. Atende.
- Ajuste (baixo, consistência), `FiltroMulti.tsx:162 e 165`: o botão do filtro (texto e `aria-label`) ainda usa `selecionados` (a prop, vinda da URL), e as caixas usam `exibidos`. Sob carga, o botão pode dizer "Equipe: Todas" enquanto as caixas já mostram 2 marcadas, e o leitor de tela anuncia o valor velho. Sugestão: usar `exibidos` também no `resumo` e no `aria-label`. Não há perda de dado, só descompasso breve.
- Observação (baixo, IF-002), `FiltroMulti.tsx:130`: ao marcar a última caixa, todas voltam a desmarcadas, porque "todas" vira "Todas" na URL. É coerente com o botão ("Todas") e com a URL canônica, mas pode surpreender quem marca uma a uma. Se o QA ou o usuário estranhar, a alternativa é manter todas marcadas e só normalizar a URL. Não é defeito frente ao esperado do bug.

### IS-005
- Toda linha do catálogo aponta para o cartão (`#id`), o Operacional fora da faixa do dia pede `cadencia=semanal`, e O1, O2 e Bloqueados ficam na visão diária, onde existem. A EI leva ao primeiro cartão (um por nível): aceitável, e a linha poderia deixar claro que há um por nível (sugestão, não obrigatória). Atende.

### IS-006
- `textoBase` traz "Base: 9 de 11 iniciativas" quando há `k`, igual ao selo da tela, e só o E3 passa o `k` (`modelo.ts:361`). Atende.

## Design system e acessibilidade (resumo)
- Português claro: exceto o texto do IF-005 acima, os textos revisados estão corretos.
- ARIA e foco: aviso em `role="status"`; popover com Esc que devolve o foco (Radix); checkboxes rotuladas. Único descompasso: o `aria-label` do botão do filtro (ajuste de IS-003).
- Contraste: o aviso usa os tokens `atencao` e `atencao-fundo`; não medi as razões nesta revisão. Confirmar 4,5:1 no texto do aviso na checagem de contraste do QA.
- Alvos de toque: caixas e botões usam `.alvo` (24 px no desktop, 44 px abaixo de 768 px), em conformidade com a WCAG 2.2 AA.

## Veredito final
**Aprovado com ajustes não bloqueantes.** As 7 correções atendem ao esperado de cada bug. Dois ajustes baixos, sem impedir o PR, podem entrar neste lote ou virar cartão:
1. Reescrever o texto do aviso para período personalizado inválido (IF-005).
2. Usar `exibidos` no resumo e no `aria-label` do botão do `FiltroMulti` (IS-003).
