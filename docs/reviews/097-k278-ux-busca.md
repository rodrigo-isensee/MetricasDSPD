---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k278-ux-busca
commit: 9e5ece3b188bd24ab13a87b9015e25d0c03d5ab8
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: ressalvas de UX da busca nos filtros (097, K-278, E3.2)

Diff lido: `4b1e31225f83..9e5ece3b` (5 arquivos, +119 −18: `FiltroMulti.tsx`, `BarraFiltros.tsx`, `filtros-componentes.test.tsx`, `barra-e-ramos.test.tsx`, `e2e/tests/intensivo-filtros.spec.ts`). Referência: `docs/ux/097-revisao-l1.md` (A1 a A8) e o A5 do review do L1 (`docs/reviews/097-l1-busca.md`).

## Achados
- A1 (recomendado) web/src/features/filtros/FiltroMulti.tsx:101 · `retorno` ("Marcada: X.") só se zera ao digitar (linha 157): após o Enter, um clique na caixa ou o Esc que limpa a busca deixa o texto velho na região viva, e com o Esc ele fica sozinho e pode ser reanunciado. Zerar também em `alternar` e no `aoEsc`.

## Parecer
Aprovado. O diff faz o que o K-278 pede, nem mais nem menos: A1 a A7 da revisão de UX, A8 só com o `placeholder` (o botão "Limpar busca" espera o dono) e o A5 do review do L1 (`/^Buscar/` na linha 509).

- **Acessibilidade sem anúncio duplicado:** uma só região `role="status"` junta contagem ("de N"), a frase das marcações fora da busca e o retorno do Enter; as cópias visíveis ("N opções" e a frase fora da busca) ficam `aria-hidden`, então o leitor de tela ouve cada texto uma vez. O popover ganhou `aria-label={rotulo}` (A2); a folha foca o próprio `Dialog.Content` (`tabIndex={-1}`) em vez do primeiro campo (A1).
- **A6:** o popover passa a usar `escLimpaBuscaFocada(e.target)`, a mesma regra da folha; foco em "Fechar" fecha mesmo com texto. A regra continua única em `FiltroMulti.tsx`.
- **A7:** "Limpar seleção" sem resto de `'Limpar'` exato em `web/src` e `e2e/tests` (grep vazio); o e2e e o `barra-e-ramos` seguem o rótulo novo.
- **Testes que provam algo:** cada ressalva tem um teste que falharia sem a mudança (foco na folha, nome do dialog, "de 3" e "13 opções", frase na região viva, Marcada/Desmarcada, Esc em "Fechar", placeholder). `VITEST_MAX_WORKERS=2 npx vitest run` dos dois arquivos de teste tocados: 2 arquivos, 68 testes verdes. O e2e roda no CI.
- **Commits:** dois `fix(web)` com `Cartão: K-278`, claros. O corpo do primeiro diz que o A7 "fica de fora" e o segundo o faz; o squash do PR resolve, sem achado.
- Tamanho: 137 linhas de código e teste, dentro da orientação de 150; um comportamento (ressalvas de UX do mesmo componente).
- Pronto: o `pnpm run pronto` local não fechou (eslint saiu 143 sob carga, segundo o brief); a prova é o CI do PR, que cito e não refaço.
