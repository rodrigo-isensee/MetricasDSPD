---
tipo: qa
contrato: 1
pedido: k094-seed-concorrente
branch: fix/seed-concorrente
commit: 6e3ab28
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-15
---

# QA: K-094, seed concorrente

Links: review `docs/reviews/k094-seed-concorrente.md` (aprovado em a4718eb), correção `68d030b`.

## Veredito
**Aprovado.** Nenhum bug aberto. Nenhum código de produção foi alterado pelo QA. O QA acrescentou só o teste R1 recomendado pelo review (commit `6e3ab28`).

## Obrigação → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Dois seeds simultâneos não intercalam: a trava é única (`dspd:seed`) e vale antes de qualquer schema (K-094) | `seed.pg.test.ts` "o seed espera a trava única "dspd:seed" e só grava depois que ela é solta" | trava mantida por outra transação: `semear` pendente, 0 linhas em `ctl_coleta` de BM e AC; após o COMMIT, `semeado` com todas as linhas | verde no código novo; **vermelho no antigo** |
| Um BEGIN, um COMMIT, uma trava | `seed.duble.test.ts` (já no commit 68d030b) | n/a | verde (suíte do servidor, ver review) |
| Idempotência e recusa de outra semente preservadas | `seed.pg.test.ts` "grava, é idempotente e recusa outra semente" | semente diferente | verde |
| Dois seeds simultâneos gravam uma vez | `seed.pg.test.ts` "dois seeds simultâneos" | n/a | verde (não é regressão do K-094: passa também no código antigo, como o review registrou) |

## Vermelho antes do verde
- Código novo: `seed.pg.test.ts`, 6 de 6 verdes.
- Código antigo (`git show 68d030b~1:server/src/plataforma/db/seed.ts` copiado sobre `seed.ts`, restaurado com `git checkout` em seguida): 1 falha, 5 verdes. Falha observada: `AssertionError: expected 0 to be greater than 0` em `expect.poll` sobre `pg_locks` (`locktype='advisory' AND NOT granted`): o seed antigo toma a trava `dspd:seed:<schema>`, nunca fica bloqueado pela `dspd:seed` e grava sem esperar (10,3 s de poll até estourar).
- O teste é determinístico: o sinal é uma sessão com trava advisory não concedida em `pg_locks`, sem espera fixa. Estabilidade: 2 execuções isoladas adicionais verdes, além da suíte completa (a 3ª a 5ª repetição foram interrompidas por fila do `flock`, ocupado por outras tarefas).

## Execução real
Ambiente: Postgres 17 do Compose, `flock /tmp/metricas-pesado.lock nice -n 19`, `DSPD_PWD_PESQUISA` removida do ambiente do processo (a senha divergente é do ambiente do usuário, K-095), o resto do `.env` da worktree mantido. Executado com `vitest run --project pg` (mesmos passos do `scripts/test-pg.sh`, sem a variável).
- `test:pg` completo: **15 arquivos, 84 testes aprovados, 0 falhas** (83 do review + o novo). As 7 falhas de `pesquisa.pg.test.ts` do review eram só a senha do ambiente: sem a variável, o padrão de desenvolvimento passa. Nenhuma falha real aparece.
- Suíte do servidor sem banco e `docs:check`: executadas pelo tech-lead no review (496 testes, EXIT=0); o diff do QA toca só um arquivo de teste de banco.

## Mutação
Sem ferramenta de mutação configurada para o diff. Mutante manual equivalente: o código anterior (trava por schema, nome diferente) é morto pelo teste novo, ver acima.

## Riscos
- O teste depende de `pg_locks` visível ao papel migrador (visível a todos os papéis em consulta de contagem; verde nas execuções).
- Se o `semear` falhar antes de pedir a trava, o `expect.poll` falha em 10 s, e o `finally` solta a conexão e apaga os schemas.
