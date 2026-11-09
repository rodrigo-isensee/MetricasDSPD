---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l4c-colunas-grant
commit: f8510b3fe38373a348442bec232bcfa012ede4b2
parecer: aprovado
revisor: tech-lead
data: 2026-11-09
---
# Code review: 075 L4c, colunas e GRANT de bloqueio (K-204), revalidação após merges da develop

## Parecer

Aprovado. O código e os testes do 4b e do 4c seguem iguais aos de `e720eeed`; o que mudou veio da develop e não toca o 4c. Os dois achados recomendados do review anterior seguem valendo e não devolvem.

## Revalidação (delta lido e "já lido")

- **Já lido** (parecer anterior, diff `3ae2d53d...ea3b51b5`): SEG-A4, CA-075-4, CA-075-5, CA-075-1 ponta a ponta, itens (1) a (4) da decisão de 12:56, teto de 107 linhas, desvio do `| tail`, pendência TL-A6. Nada disso mudou.
- **Delta lido** (`git diff e720eeed f8510b3f`, 18 arquivos): só develop. `.githooks/pre-push` e `scripts/lint-alterados*.sh` (083), `package.json` e `pnpm-lock.yaml` (versões), `criterios.ts`, `parte-sem-dado.ts`, `servico.ts` e `corte-serie-o1-075.test.ts` (6a), pareceres de outros pedidos. Conferido: nenhum arquivo do 4b e do 4c no diff (`projetor*.ts`, `projetor-bloqueio.pg.test.ts`, `projetor-businessmap.test.ts`, `bloqueio-colunas-grant*.test.ts` sem diferença contra `e720eeed`).
- **Merges:** o conflito em `projetor-bloqueio.pg.test.ts` ficou com a versão do 4c; o bloco duplicado em `projetor-businessmap.test.ts` saiu em `f8510b3f`, sem diferença final contra `e720eeed`.
- **Testes dos arquivos tocados (D-5), vitest com 2 workers:** `bloqueio-colunas-grant.test.ts`, `projetor-businessmap.test.ts` e `corte-serie-o1-075.test.ts`, 24 passados. Os `.pg` valem pela CI.
- **CI do push:** run 42572114650 em `7b2abc7b` verde (head do merge); o run 42574692217 em `f8510b3f` estava em andamento na hora do review, e a diferença para `7b2abc7b` é só a remoção do bloco duplicado de teste. O `forge-check pr` confere a CI no fechamento.

## Achados

- A1 (recomendado) server/tests/projetor-businessmap.test.ts:283 · M5 e M13 provados pelo texto do SQL do dublê; a prova de comportamento está no `.pg`. Aceito como está.
- A2 (recomendado) server/tests/projetor-bloqueio.pg.test.ts:135 · o caso que fecha confere só duração não nula; fixar o valor esperado no próximo lote que tocar o arquivo.
