---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k278-ux-busca
commit: 9e5ece3b188bd24ab13a87b9015e25d0c03d5ab8
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: K-278, ressalvas de UX da busca nos filtros (097, E3.3)

Base develop 4b1e3122, head 9e5ece3b. Diff conferido: `BarraFiltros.tsx`, `FiltroMulti.tsx`, `filtros-componentes.test.tsx`, `barra-e-ramos.test.tsx`, `e2e/tests/intensivo-filtros.spec.ts`. Escopo bate com A1 a A7, o placeholder do A8 e o A5 do review; o botão "Limpar busca" do A8 fica para o dono e não está no diff.

## Critério → teste → resultado
| Achado | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A1 foco da folha mobile sem teclado | `K-278 A1` (foco no `dialog` "Filtros") | foco inicial da folha | passa; cai sob mutação |
| A2 nome acessível do popover | `K-278 A2` (`dialog` name "Equipe") | nome do diálogo | passa |
| A3 contagem "de N" e "N opções" acima de 12 | dois testes `K-278 A3` (1 de 3; 13 opções mostra, 3 não) | limite 12 (13 mostra, 3 não) | passam |
| A4 frase "fora da busca" na região viva | `K-278 A4` | marcação escondida | passa; cai sob mutação |
| A5 Enter anuncia Marcada/Desmarcada | `K-278 A5` (alterna duas vezes) | alternância | passa |
| A6 Esc conforme o foco | `K-278 A6` (Esc em "Fechar" com texto fecha) | foco fora da lista | passa; cai sob mutação |
| A7 "Limpar seleção" | testes de Limpar atualizados (`filtros-componentes`, `barra-e-ramos`) | rótulo | passam |
| A8 placeholder | `K-278 A8` | texto de ajuda | passa |

## Execução
`VITEST_MAX_WORKERS=2 npx vitest run src/features/filtros src/features/apontamento/barra-e-ramos.test.tsx` em `web/`: 12 arquivos, 151 testes, todos passaram. Nada contra a base real nem `.env*`. A suíte inteira, o eslint da raiz e o e2e (`intensivo-filtros.spec.ts` só troca o nome do botão para "Limpar seleção") rodam no CI do PR; o QA não cita `.verde` local.

## Mutação no código alterado (restaurada, árvore limpa)
Três mutações num só passe: (1) removido o `e.preventDefault()` do `onOpenAutoFocus` da folha; (2) `escLimpaBuscaFocada(e.target)` trocado por `true` no Esc do popover; (3) frase `textoFora` retirada da região viva. Resultado em `filtros-componentes.test.tsx`: 3 falharam (A1, A4, A6), 38 passaram. Nenhum sobrevivente. `git checkout web/src` restaurou os arquivos.

## Observações (sem achado)
- Contraste, leitor de tela e foco em aparelho real seguem para a revisão de UX e o `@axe`; o jsdom não mede teclado virtual.
- A frase "fora da busca" e "N opções" ficam `aria-hidden` na tela e vão à região viva, o que evita leitura dupla.

## Achados
