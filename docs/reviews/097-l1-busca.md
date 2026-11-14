---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l1-busca
commit: d5083317568496c30d23815f8f36996bbe315061
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: busca digitando nos filtros de lista (097 L1, E3.2, K-273)

## Achados
- A5 (recomendado) web/src/features/filtros/filtros-componentes.test.tsx:502 · `queryByLabelText('Buscar')` (match exato) não acha mais nada desde que o nome virou "Buscar em {rótulo}" (A4): a ausência passa vazia. Trocar por `/^Buscar/`, como nas outras linhas; o `toHaveFocus` seguinte ainda cobre o fechamento.

## Parecer
Aprovado. Revalidação da volta 3 sobre o delta lido por `forge-check parecer delta docs/reviews/097-l1-busca.md`: intervalo `b5d206ef..d5083317` (código igual em 8e1edc5a), no domínio só `docs/tecnica/arquitetura-front.md`, `BarraFiltros.tsx`, `FiltroMulti.tsx` e `filtros-componentes.test.tsx`; nada fora dos quatro achados mudou.

- **A1 resolvido:** o Dialog da folha decide por `escLimpaBuscaFocada(e.target)`, que olha só o `[data-busca-filtro]` do `fieldset` do alvo (o da `Lista`; a `BarraFiltros` não tem `fieldset` próprio, então foco em "Ver resultados" dá `false`). O Radix lê o Esc em captura, antes do `onKeyDown` que limpa, então a decisão vê o texto ainda presente. S1 e S2 viraram testes e passam.
- **A2 resolvido:** seção 4 de `arquitetura-front.md` ganhou "Busca nos filtros de lista": estado local fora da URL, zerado ao abrir e fechar, e a regra do Esc com `escLimpaBusca` e `escLimpaBuscaFocada`.
- **A3 resolvido:** "Esc com texto limpa" está em `escLimpaBusca`, usada pelo Popover e pelos dois teclados da `Lista`. No Popover a limpeza roda duas vezes (captura do Radix e `onKeyDown`), sem efeito visível.
- **A4 resolvido:** rótulo visível "Buscar" com `sr-only` "em {rótulo}"; teste confere "Buscar em Equipe" e "Buscar em Tipo de demanda". A troca do nome deixou o A5.
- **Verificação local:** `npx vitest run src/features/filtros --maxWorkers=2` em d5083317: 11 arquivos, 116 testes passando. Os timeouts relatados em `visoes.test.tsx` e `preferencias.test.tsx` ficam com o QA e o CI do PR.
- **Teto de linhas:** segue acima de 150; o PR (E3.4) leva `teto: excedido, <n> linhas, <motivo>` com o total final.
- **Pareceres da branch:** o QA revalida sobre d5083317; a revisão de UX segue com o ux-designer.
