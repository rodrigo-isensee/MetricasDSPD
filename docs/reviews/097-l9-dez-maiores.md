---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l9-dez-maiores
commit: 162404f913cd40839146e8070a48cef8fa52bb3e
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L9 do 097, os 10 maiores do AP-PROJETO com Ver todos (E3.2, K-273)

## Achados
- A1 (recomendado) web/src/features/apontamento/dezMaiores.ts:27 · o corte reordena com `localeCompare('pt-BR')` sem `id`, e o Ver todos mostra a ordem do servidor (`ordenarNeutro`: unidade de código, depois `id`). Empate de horas na 10ª vaga com rótulos que diferem em caixa ou acento troca quem aparece. Sugestão: cortar a ordem recebida.
- A2 (recomendado) web/src/features/apontamento/textos.ts:322 · "10" escrito à mão em `mostrando` e `verMaiores`, enquanto o corte usa `LIMITE_MAIORES`; montar o texto a partir da constante evita divergência se o limite mudar.

## Parecer
Aprovado em 162404f9. Li o diff inteiro `origin/develop...162404f9` (5 arquivos) e o §3 de `docs/analises/097-plano-e5-e7.md`. O `c9e1218f` por cima é só o parecer do QA (`docs/qa/097-l9-dez-maiores.md`, aprovado), que não refiz; os achados A1 (CA-38 sem teste) e A2 (propriedade fraca) dele valem e não os repito.

- **Função pura (`dezMaiores.ts`):** sem efeito, não altera a entrada (`toSorted`, cópia no caminho de 10 ou menos; teste "não altera a lista recebida"). Só soma inteira de `segundos` já calculados no servidor: não é tempo, percentil nem Monte Carlo, então não precisa da biblioteca compartilhada; uma fonte só (BusinessMap), nada misturado.
- **Ordem e desempate:** horas decrescentes e empate alfabético (CA-33), provados no unitário com Alfa e Zeta em 50 na 10ª vaga. Com 10 ou menos, ordem recebida (CA-36). A divergência de comparador com o servidor fica no A1: o efeito só aparece em empate exato de segundos na fronteira com rótulos de caixa ou acento diferentes (sondado: `["alfa","Beta","Érico","Zeta"]` dá `Beta, Zeta, alfa, Érico` por unidade de código e `alfa, Beta, Érico, Zeta` por `localeCompare`); não fere o CA-33, por isso não bloqueia.
- **Só o AP-PROJETO cortado:** `corte` só existe com `bloco === 'projeto'`; tipo e subgrupo seguem com `todas`. O selo de incompleto lê `todas` (R5 do plano), provado pelo teste do Projeto 00 fora dos 10.
- **Acessibilidade do Ver todos:** `Botao` com `aria-expanded` e nome com a quantidade; o botão fica no mesmo lugar da árvore, então o foco permanece nele ao alternar (testado com `toHaveFocus`). A região com rolagem tem `role="region"`, nome acessível e `tabIndex={0}`, o que deixa rolar pelo teclado; a tabela alternativa do `Barras` segue dentro dela (13 linhas com 12 projetos). Estado só no componente (Q-9, CA-38).
- **Testes que provam:** propriedade fast-check de soma e contagem (a do plano), unitários de ordem, borda de 10 e imutabilidade, e testes de tela pelo texto e pela tabela, não pelo SVG (`praticas.md` §4). `Math.min(...)` em `dezMaiores.test.ts:31` está fora do alcance da regra de lint, que exclui testes.
- **Ferramentas (citadas, não refeitas à mão):** `VITEST_MAX_WORKERS=2 npx vitest run src/features/apontamento`: 13 arquivos, 178 testes passando. `npx eslint` nos 5 arquivos: sem saída. `npx tsc --noEmit -p web`: sem saída. A suíte completa fica no CI do PR.
- **Tamanho:** 310 linhas de código e teste (`git diff --numstat --no-renames origin/develop...162404f9`, 190 delas de teste); o corpo do PR (E3.4) leva `teto: excedido, 310 linhas, função pura com teste de propriedade e 190 linhas de teste dos CA-33 a CA-36`.
- **Regras de `praticas.md`:** o arquivo não marca regras com "decidida por"; li o checklist da skill sobre o diff.
- **Commits:** um `feat(apontamento)` em Conventional Commits em português.
