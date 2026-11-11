---
tipo: qa
contrato: 1
pedido: 094-lote-testes-e-guia
branch: fix/k266-seed-tmpdir
commit: 1d7c429115f22f9f4d44785b14e9c69ec735d3ca
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# Parecer de QA 094 (E2.3, K-266): TMPDIR no env do filho do teste do seed

Commit revisado: 1d7c4291 (base develop 18701297). Review aprovado em 52427ad2 (só `docs/`).

## Achados

## Diff conferido
- `git diff 18701297 1d7c4291`: uma linha, `server/tests/seed-recusa-real.pg.test.ts:108`. O env do filho passa a ser PATH, HOME, TMPDIR (só quando definida no pai) e PG_MIGRADOR_URL. É um objeto literal, sem espalhar `process.env`: PG_SEED_URL e variáveis do `.env` continuam fora do filho, e o caso segue provando a recusa na partida.
- Nenhuma asserção mudou: o `expect` e o comando (`pnpm exec tsx src/plataforma/db/seed-cli.ts`) estão intactos. Nenhum código de produção tocado, então não há guarda nem mutante a declarar.

## Execução local
- `vitest run tests/seed-recusa-real.pg.test.ts --maxWorkers=2` (R-TETO) no pacote server: 1 arquivo pulado, 8 testes pulados. Os casos são pulados sem banco (`.pg`); local não prova o comportamento.
- `tsc --noEmit -p .` no server: sem erros, `rc=0`.

## Prova de execução
A prova de execução real é o check com banco do CI do PR (PostgreSQL 17). Este parecer não cita `.verde` local. Vermelho antes do verde não se aplica: não há teste novo nem regra nova, só o ambiente do filho de um teste existente; o ganho (o `pnpm`/`tsx` do filho achar a pasta temporária) só aparece com banco, no CI.

## Critério → resultado
| Obrigação (K-266) | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Filho recebe TMPDIR quando definida | caso "o CLI do seed sem PG_SEED_URL falha na partida" | lido no diff; execução no CI com banco | TMPDIR ausente: ternário não a injeta |
| Filho não herda PG_SEED_URL | mesmo caso | objeto literal, sem espalhar o ambiente | PG_SEED_URL ausente |
| Asserções inalteradas | mesmo caso | diff não toca o `expect` | n/a |

## Não executado aqui
- Testes pg: do check com banco do CI do PR. Nada foi rodado contra base real; arquivos `.env*` não foram abertos.
