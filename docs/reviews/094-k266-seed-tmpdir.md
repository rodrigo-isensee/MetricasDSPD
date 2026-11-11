---
tipo: review
contrato: 1
pedido: 094-lote-testes-e-guia
branch: fix/k266-seed-tmpdir
commit: 1d7c429115f22f9f4d44785b14e9c69ec735d3ca
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: o teste do CLI do seed repassa TMPDIR ao filho (094, E2.2, K-266)

## Achados
- A1 (recomendado) server/tests/seed-recusa-real.pg.test.ts:108 · a expressão do TMPDIR repete a do ajudante ambienteFilho() do K-264 (server/tests/ajuda-cli-filho.ts, ainda fora da develop); quando os dois estiverem na develop, montar o env deste teste a partir do ajudante mais HOME e PG_MIGRADOR_URL, num cartão próprio.

## Sondas

## Parecer
Aprovado. Diff lido: `18701297..1d7c4291`, uma linha trocada em `server/tests/seed-recusa-real.pg.test.ts:108` (só teste).

- **Faz o que o cartão pede:** o env do filho passa a ser PATH, HOME, TMPDIR só quando definida e PG_MIGRADOR_URL. Nada mais é herdado de `process.env`: a forma é um objeto literal, sem espalhar o ambiente do pai, então PG_SEED_URL e o `.env` real continuam fora do filho e o caso segue provando a recusa na partida.
- **Asserções intactas:** o diff não toca o `expect` nem o comando executado; o que o teste prova é o mesmo de antes.
- **Mesma forma do K-264:** `...(process.env.TMPDIR ? { TMPDIR: process.env.TMPDIR } : {})` é a expressão do `ambienteFilho()` (commit 6d2e15be). O ajudante não está na base deste PR e não traz HOME, que o `pnpm` deste teste usa; repetir a expressão aqui é aceitável (A1, recomendado, não devolve).
- **Guardas:** nenhuma guarda de produção mudada; o ternário escolhe só o que entra no ambiente do teste.
- **Verificação local:** `vitest run tests/seed-recusa-real.pg.test.ts` no pacote server: 1 arquivo pulado, 8 testes pulados (é `.pg`, sem banco local); `tsc --noEmit -p server` sem erros. A execução real com PostgreSQL fica com o CI do PR.
- Commit: um só, Conventional Commits em português, escopo `server`.
