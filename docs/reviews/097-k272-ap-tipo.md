---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k272-ap-tipo-categoria
commit: dbd120a49bfbe801f75c829d0eead0e12018d358
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: K-272, AP-TIPO e filtro tipo por categoria (097, E6.2), revalidação depois do merge da develop

Revalidação depois do merge da develop (f4c122f1) na branch, em dbd120a4, sem conflito. Parecer anterior: aprovado em 1d691f4e (commit 9b553443).

## Delta lido
- `forge-check parecer delta docs/reviews/097-k272-ap-tipo.md`: intervalo `1d691f4e..39dabe31`, escopo sem o que veio da base (develop), "nenhum arquivo do domínio mudou".
- O `.github/actions/playwright/action.yml` que marcou o parecer como desatualizado veio da develop (PR 318), não do item.
- Patch do item conferido: `git diff eac38a64 1d691f4e -- server` e `git diff f4c122f1 dbd120a4 -- server` são iguais (fora as linhas de `index` e `@@`): `repositorio.ts`, `servico.ts` e `apontamento-rota.test.ts`, os mesmos 3 arquivos de antes.
- QA revalidado em 39dabe31 (`docs/qa/097-k272-ap-tipo.md`), não refeito.

## Achados
- A3 (recomendado) server/src/modulos/apontamento/servico.ts:96 · `idDaCategoria.get(l.typeId) as string`: lerLinhas e lerTiposDoHistorico são leituras separadas; exclusão ou troca de tipo entre elas deixa o id indefinido. Sugestão: `?? l.typeId` ou mesma transação. Mantido da rodada anterior, sem mudança.

## Veredito
**Aprovado** em dbd120a49bfbe801f75c829d0eead0e12018d358: mesmo veredito de 1d691f4e, o patch do item não mudou com o merge da develop; sem bloqueante.
