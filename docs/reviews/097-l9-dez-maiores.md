---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l9-dez-maiores
commit: 98e3213446edf24f41ab130f1f6c46e7009fa986
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L9 do 097, os 10 maiores do AP-PROJETO com Ver todos (E3.2, K-273)

## Achados
- A3 (recomendado) web/src/features/apontamento/dez-maiores.test.tsx:124 · o vetor `ordem` tem 5 rótulos e o teste usa só 3 (`Érico` e `alfa` nunca entram), e há uma linha em branco no meio da cadeia em :133. Sugestão: deixar só os 3 rótulos usados e tirar a linha em branco.

## Revalidação (volta 1)
Delta lido por `forge-check parecer delta docs/reviews/097-l9-dez-maiores.md`: intervalo `162404f9..b3b50478`, no domínio só `dez-maiores.test.tsx`, `dezMaiores.test.ts`, `dezMaiores.ts` e `textos.ts`, todos do `98e32134`; o `b3b50478` por cima é só o parecer do QA, que não refiz.

- **A1 fechado:** `dezMaiores` não ordena mais; corta a lista recebida (`slice`), que é a mesma do Ver todos. A ordem vem da biblioteca, `ordenarNeutro(itens, (i) => [-i.segundos, i.rotulo, i.id])` em `packages/metricas/src/businessmap/apontamento/distribuicao.ts:33`, então o corte continua sendo o dos 10 com mais horas (CA-33) e o desempate é um só nas duas vistas. O genérico deixou de exigir `rotulo`, coerente com a função. O teste de tela do empate na 10ª vaga discrimina: com o comparador antigo a 10ª linha seria `Alfa`; agora é `zeta`, e as 10 primeiras do Ver todos são iguais às do corte.
- **A2 fechado:** `mostrando` e `verMaiores` montam o número com `LIMITE_MAIORES`; `dezMaiores.ts` não importa nada de `textos.ts`, sem ciclo.
- **Achados do QA:** o CA-38 tem teste (abre o Ver todos, desmonta, remonta e volta a 11 linhas com `aria-expanded="false"`); a propriedade agora compara por linha (`visiveis` igual aos 10 primeiros da lista ordenada e cada um dos demais com no máximo o menor visível).
- **Fixtures ajustados:** `projetos()` passou a gerar horas decrescentes, como o servidor entrega; os testes de 11 linhas e do selo fora dos 10 (`p11`) seguiram a nova ordem sem perder o que provam.
- **Ferramentas (citadas, não refeitas à mão):** `VITEST_MAX_WORKERS=2 npx vitest run src/features/apontamento`: 13 arquivos, 180 testes passando. `npx eslint` e `npx prettier --check` nos 4 arquivos: limpos. `npx tsc --noEmit -p web`: sem saída. A suíte completa fica no CI do PR.
- **Tamanho:** 340 linhas de código e teste em `web/` (`git diff --numstat --no-renames d01524d4...98e32134`); o corpo do PR (E3.4) leva `teto: excedido, 340 linhas, função pura com teste de propriedade e testes de tela dos CA-33 a CA-38`.
- **Commits:** um `fix(apontamento)` em Conventional Commits em português, com `Cartão: K-273`.

## Parecer
Aprovado em 98e32134. A1 e A2 fechados sem segunda ordenação; o A3 é de limpeza de teste e não bloqueia.

Histórico: aprovado em 162404f9 com A1 (comparador do corte diferente do servidor) e A2 ("10" escrito à mão nos textos), ambos recomendados.
