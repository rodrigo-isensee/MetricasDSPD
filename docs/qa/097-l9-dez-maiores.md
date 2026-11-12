---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l9-dez-maiores
commit: 162404f913cd40839146e8070a48cef8fa52bb3e
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: os 10 maiores do AP-PROJETO (097 L9, E3.3, K-273)

Links: plano `docs/analises/097-plano-e5-e7.md` §3 (CA-33 a CA-38 vêm dele e do pedido; não há ficha própria dos CA-36 a CA-38 na especificação de UX, então li o texto do plano), pedido `docs/pedidos/097-resumo-filtro-time.md`, base develop d01524d4.

## Veredito
**Aprovado.** CA-33 a CA-37 têm teste que prova; o CA-38 (reabrir volta a 10) vale por construção (`useState` local) mas sem teste dedicado (A1, recomendado). A propriedade de soma e contagem está certa e o selo de incompleto cobre os 12 projetos, inclusive o que cai fora dos 10. Nenhum cálculo de tempo, percentil ou previsão: só soma inteira de `segundos` já vindos do servidor, sem misturar fontes. A suíte inteira é a do check-run `bateria` do mesmo sha; aqui rodei os testes afetados e os meus cenários.

## Execução
- Diff conferido contra CA-33 a CA-38: 5 arquivos (`dezMaiores.ts`, `CartaoDistribuicao.tsx`, `textos.ts` e dois testes); o escopo não mudou.
- `VITEST_MAX_WORKERS=2 npx vitest run src/features/apontamento`: 13 arquivos, 178 testes passaram, 0 pulados.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-33 ordem por horas, empate alfabético | `dezMaiores.test.ts` "com mais de 10 ordena..."; `dez-maiores.test.tsx` CA-33/CA-34 | empate de 50 h (Alfa antes de Zeta) na 10ª vaga | passou |
| CA-34 frase, linha Demais, botão | `dez-maiores.test.tsx` CA-33/CA-34 e "singular com 11" | 11 (singular) e 12 (plural); 11 linhas na tabela | passou |
| CA-35 ver todos: região com rolagem focável, foco mantido, alterna | `dez-maiores.test.tsx` CA-35 | `tabindex=0`, `max-h-[360px]`, `aria-expanded`, foco no botão | passou |
| CA-36 10 ou menos: sem botão nem Demais | `dez-maiores.test.tsx` CA-36; `dezMaiores.test.ts` "10 ou menos" | exatamente 10; ordem recebida | passou |
| CA-37 filtros já valem | corte feito sobre as linhas recebidas (já filtradas pelo servidor); coberto pelos testes do painel | n/a | passou (por construção) |
| CA-38 reabrir volta a 10 | sem teste dedicado (A1) | n/a | sem prova direta |
| Propriedade soma e contagem | `dezMaiores.test.ts` fast-check (soma, contagem, `visiveis <= 10`) | 0 a 40 linhas, rótulos aleatórios | passou |
| Selo de incompleto sobre todos | `dez-maiores.test.tsx` "o selo de incompleto..." (Projeto 00, o menor, fora dos 10) | projeto incompleto entre os demais | passou |

## Vermelho antes do verde
`CartaoDistribuicao.tsx` voltado à base `origin/develop` e restaurado (`git status --short` vazio): `vitest run dez-maiores.test.tsx` na base: 3 de 5 falharam (CA-33/CA-34, singular, CA-35); os 2 que passam (CA-36 e selo) afirmam o comportamento que já existia e que não pode regredir. `dezMaiores.ts` é arquivo novo: seu teste não carrega na base.

## Mutação no código alterado
- M1 `dezMaiores.ts` `slice(0, limite)` vira `slice(0, limite + 1)`: morto por 2 testes (CA-33 unitário e CA-33/CA-34 de tela).
- M2 `linhas.length <= limite` vira `<`: morto por 1 teste (CA-36 unitário).
- M3 `CartaoDistribuicao.tsx` `comSelo` sobre `linhas` (visíveis) em vez de `todas`: morto por "o selo de incompleto vale para projeto fora dos 10 maiores".
- M4 desempate alfabético removido: morto por CA-33 unitário.
- Todos restaurados por `git checkout`; árvore limpa.

## Bug
Nenhum aberto.

## Achados
- A1 (recomendado) web/src/features/apontamento/dez-maiores.test.tsx:96 · CA-38 sem teste: abrir "Ver todos", trocar de aba ou remontar o cartão e afirmar que volta a 10 (hoje vale só por `useState` local). Fica a critério do autor; não bloqueia.
- A2 (recomendado) web/src/features/apontamento/dezMaiores.test.ts:24 · a 2ª propriedade só limita a soma dos demais (`<= menor * fora`); não prova que o menor visível é maior ou igual a cada demais. Comparar por linha (`max(demais) <= min(visiveis)`).
