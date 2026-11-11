---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l1-busca
commit: 86a6c85e730dd52cd00766d9c86a96098ae44ea3
parecer: reprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-11
---

# QA: busca digitando nos filtros de lista (097 L1, E3.3), revalidação

Links: especificação `docs/ux/097-filtros-time-busca.md` (CA-10 a CA-16), pedido `docs/pedidos/097-resumo-filtro-time.md`, base develop f4c122f1. Revalida o parecer anterior (código b3b1a6cd); diff `b3b1a6cd..86a6c85e` em `BarraFiltros.tsx`, `FiltroMulti.tsx` e `filtros-componentes.test.tsx`.

## Veredito
**Reprovado por 1 bug médio** (B2): o B1 (Esc com texto fechava a folha mobile) está resolvido e o Popover segue igual, mas a cobertura do web, que a regra do projeto fixa em 100%, cai para 99,98% em statements e branches por uma linha nova sem teste (`FiltroMulti.tsx:101`). O `pnpm run pronto` falha nessa trava; a causa do estouro de tempo do autor é outra (suíte longa, ver Execução).

## Execução
- `cd web && npx vitest run src/features/filtros --maxWorkers=2`: 11 arquivos, 111 testes passaram (110 + o novo de folha), 0 pulados.
- `pnpm --filter @metricas-dspd/web exec vitest run --coverage --maxWorkers=2` (suíte inteira do web, 2 workers): 98 arquivos, 1510 testes passaram, duração de 520 s (real 8m43s). Cobertura: Statements 99,98% (5619/5620), Branches 99,98% (5219/5220), Functions 100%, Lines 100%. Saída: `ERROR: Coverage for statements (99.98%) does not meet global threshold (100%)` e o mesmo para branches; rc 1. A primeira tentativa, limitada a 580 s pelo meu `timeout`, foi cortada sem veredito; a segunda, com 1500 s, terminou. O tempo é a suíte (cerca de 9 min com 2 workers), não teste preso.
- Localização do furo (rodada de `src/features/filtros` com `--coverage.reporter=text`): `FiltroMulti.tsx` 98,95% statements, 97,5% branches, linha 101 descoberta: `if (e.key === 'Escape' && busca) setBusca('')` em `aoTeclarLista` (Esc teclado numa caixa de opção, com texto na busca). Nenhum teste tecla Esc com o foco numa caixa.
- B1 resolvido: o teste novo "CA-16/CA-14: na folha, Esc com texto só limpa o texto; sem texto fecha e devolve o foco" digita "zz" no campo, Esc mantém a folha e zera o texto, segundo Esc fecha e o foco volta ao botão `abrir-filtros`. Passou. O Popover mantém o `onEscapeKeyDown` (`FiltroMulti.tsx:272`) intacto; os 2 testes "CA-14" do popover seguem verdes.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-10 campo com rótulo e foco ao abrir | "CA-10: abre com o campo Buscar focado, mesmo com lista curta" | lista curta | passou |
| CA-11 sem maiúsculas e acentos, contagem anunciada | "CA-11: ignora maiúsculas e acentos e anuncia a contagem" | acento, caixa, singular/plural | passou |
| CA-12 lista vazia | "CA-12: sem resultado mostra a mensagem e anuncia" | zero resultados | passou |
| CA-13 seleção fora da busca mantida e contada | "CA-13: a seleção fora da busca continua aplicada e é contada" | seleção oculta | passou |
| CA-14 teclado, Esc | 2 testes "CA-14" (popover) | uma opção, várias, nenhuma, Esc com e sem texto | passou; Esc com foco numa caixa não coberto (B2) |
| CA-15 fechar zera o texto, fora da URL | "CA-15: fechar zera o texto" | fechar o popover | passou |
| CA-16 folha mobile, mesmas regras | "CA-16: a variante lista..." e "CA-16/CA-14: na folha, Esc..." | variante `lista`, Esc com e sem texto, foco devolvido | passou |

## Mutação no código alterado
- Mutação: em `BarraFiltros.tsx`, trocar `e.preventDefault()` do `onEscapeKeyDown` do Dialog por `void e` (o Dialog volta a fechar com texto). Resultado: o teste novo falhou ("CA-16/CA-14: na folha, Esc com texto só limpa o texto..."), 110 passaram. Mutante morto. Restaurado por `git checkout`; árvore limpa antes do commit.
- Mutação do parecer anterior (remover a remoção de acentos de `normalizarBusca`) segue morta (código não mudou).
- Vermelho antes do verde: o teste novo de folha falha com o Dialog sem `preventDefault` (mutação acima), que reproduz o B1.

## Bug
- B2 (média): `FiltroMulti.tsx:101`, o `setBusca('')` do Esc em `aoTeclarLista` (foco numa caixa de opção) não tem teste; derruba a trava de 100% da cobertura do web (statements e branches 99,98%) e deixa sem prova o Esc com o foco na lista, nos dois contêineres. Contorno simples: um teste. Corrige: `react-frontend` (teste que tecla Esc numa caixa com texto na busca, no popover e na folha, e confirma o texto zerado; ou remover a linha se o `onEscapeKeyDown` do contêiner bastar, mas na folha o `preventDefault` só impede o fechamento, quem limpa o texto é essa linha).

## Achados
- A1 (bloqueante) web/src/features/filtros/FiltroMulti.tsx:101 · linha nova sem teste: Esc numa caixa com texto na busca não é exercitado; cobertura do web 99,98% contra a trava de 100% (`pronto` falha). Cobrir com teste na folha e no popover.
