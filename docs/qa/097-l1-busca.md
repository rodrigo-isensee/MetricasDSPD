---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l1-busca
commit: b3b1a6cd43a97ec5fca32f88538c06039487a6ce
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-11
---

# QA: busca digitando nos filtros de lista (097 L1, E3.3)

Links: especificação `docs/ux/097-filtros-time-busca.md` (CA-10 a CA-16), pedido `docs/pedidos/097-resumo-filtro-time.md`, base develop f4c122f1.

## Veredito
**Reprovado por 1 bug médio** (B1, Esc com texto na folha mobile fecha a folha inteira, contra CA-16 e CA-14). O restante do diff `f4c122f1..b3b1a6cd` (`FiltroMulti.tsx`, `filtros-componentes.test.tsx`) cumpre os critérios.

## Execução
- `npx vitest run src/features/filtros --maxWorkers=2` (R-TETO): 11 arquivos, 110 testes passaram, 0 pulados. O bloco novo tem 8 testes (CA-10 a CA-16).
- Acessibilidade: o projeto não usa `@axe` nos testes de `filtros`. Por leitura do código: o campo tem `<label htmlFor>` visível "Buscar"; a contagem vai em `<p role="status" aria-live="polite" class="sr-only">`; a mensagem de lista vazia é texto visível; o foco vai ao campo ao abrir (`onOpenAutoFocus`) e volta ao botão do filtro ao fechar (Radix); o campo e as caixas têm alvo de toque (`alvo`). Sem violação aparente.
- Sonda temporária (arquivo removido, árvore limpa): na folha mobile, digitar "zz" no campo e teclar Esc devolveu `aberto=false texto=`, isto é, a folha inteira fechou.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-10 campo com rótulo e foco ao abrir | "CA-10: abre com o campo Buscar focado, mesmo com lista curta" | lista curta | passou |
| CA-11 sem maiúsculas e acentos, contagem anunciada | "CA-11: ignora maiúsculas e acentos e anuncia a contagem" | acento, caixa, singular/plural | passou; mutação o derruba |
| CA-12 lista vazia | "CA-12: sem resultado mostra a mensagem e anuncia" | zero resultados | passou |
| CA-13 seleção fora da busca mantida e contada | "CA-13: a seleção fora da busca continua aplicada e é contada" | seleção oculta | passou |
| CA-14 teclado, Esc | 2 testes "CA-14" (seta, Enter com uma opção, Esc limpa e depois fecha; Enter com várias ou nenhuma, fim da lista) | uma opção, várias, nenhuma, Esc com e sem texto | passou (popover) |
| CA-15 fechar zera o texto, fora da URL | "CA-15: fechar zera o texto" | fechar o popover | passou; a URL não é tocada pelo código (o texto vive em `useState`) |
| CA-16 folha mobile, mesmas regras | "CA-16: a variante lista (folha mobile) tem o mesmo campo" | variante `lista` | passou para o campo; Esc na folha não coberto, e falha (B1) |

## Mutação no código alterado
- Mutação: remover `.replace(/\p{M}/gu, '')` de `normalizarBusca` (desliga a remoção de acentos). Resultado: 2 testes falharam (CA-11 e CA-16), 25 passaram. Mutante morto. Restaurado por `git checkout`; árvore limpa antes do commit.
- Vermelho antes do verde: os testes novos exigem o campo "Buscar", que não existe na base; a mutação mostra a falha do teste de regra.

## Bug
- B1 (média): na folha mobile (variante `lista`, dentro do `Dialog`), Esc com texto no campo fecha a folha toda em vez de só limpar o texto. Em `FiltroMulti.tsx:95` o `stopPropagation` do React não impede o Esc do `Dialog` (o Radix escuta no documento); o `onEscapeKeyDown` (linha 272) só existe no `Popover`. Esperado (CA-16 + CA-14): Esc com texto limpa o texto; sem texto fecha. Obtido: fecha com texto. Contorno simples (reabrir), mas os filtros já marcados ficam aplicados. Corrige: `react-frontend`. Teste sugerido: sonda acima, na folha.

## Achados
- A1 (bloqueante) web/src/features/filtros/FiltroMulti.tsx:95 · Esc com texto na folha mobile fecha a folha inteira (provado em sonda); CA-16 pede as regras de CA-14. Impedir o fechamento do Dialog com texto (ex.: `onEscapeKeyDown` do Dialog ou tratar o Esc em captura) e cobrir com teste.
