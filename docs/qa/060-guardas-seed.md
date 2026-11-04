---
tipo: qa
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-guardas-seed
commit: 0183e430d6b3df391a60320abc652022d0f17aab
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-03
---
# QA: 060-triagem-dependabot, guardas do seed (E2.26, K-195)

Parecer sobre o código em `b1104f3` (os commits seguintes só mexem nos pareceres). Diff `3c284ff...b1104f3`: 11 arquivos, 3 de teste de dublê, 1 de teste `test:pg`, 6 de código de coleta e seed. Sem especificação de UX: as obrigações vêm do P1 do plano `060-sem-mock` e do A3 da ADR 0026.

## Achados
- A1 (recomendado) server/tests/seed-recusa-real.pg.test.ts:81 · o teste `test:pg` do webhook não roda aqui (PostgreSQL ausente, 8 pulados); a prova do A3 em banco real fica para a CI do PR, que precisa mostrá-lo verde.
- A2 (recomendado) server/tests/esquema-com-seed.test.ts:26 · a trava `dspd:seed` só é provada na ordem das chamadas do dublê; a serialização entre guarda e seed simultâneos só se prova em banco real (CI). O A1 do review e o da segurança (trava solta antes do INSERT) seguem como cartão técnico.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| P1: seed recusa esquema com coleta real, sem escrever | `seed.duble.test.ts` (recusa com coleta e com item real; sem INSERT) e `seed-recusa-real.pg.test.ts` (banco) | esquema com coleta real: zero escrita | dublê passou; `test:pg` pulado, fica para a CI |
| A3 da ADR 0026: contagem de `stg_webhook_evento` recusa o seed | `seed.duble.test.ts` (3 eventos: mensagem só de tabela e contagem, nenhum INSERT, ROLLBACK, consulta só no esquema do BusinessMap) e `guarda-seed.test.ts` (conta e recusa identificador inválido) | webhook > 0 recusa; identificador inválido; Acelerato não consulta a tabela | passou (dublê); `test:pg` pulado |
| P1: coleta recusa esquema com seed (BusinessMap: cards, worklog, comando) | `esquema-com-seed.test.ts` (ordem `BEGIN, trava, guarda, ROLLBACK`; zero escrita; `get` da origem não chamado) | seed presente: nenhuma leitura da origem nem escrita | passou |
| P1: coleta recusa esquema com seed (Acelerato) e projetor | `esquema-com-seed.test.ts` (ordem `fonte, BEGIN, trava-seed, guarda, ROLLBACK, solta`; sem linha de falha em `ctl_coleta`; log só com o código; trava da fonte ocupada não olha o esquema; projetor sem escrita) | seed presente: zero escrita, sem MySQL | passou |
| Trava `dspd:seed` única (A1 do review do P1) | `esquema-com-seed.test.ts` (`eTrava`) | guarda e seed na mesma trava | passou (ordem no dublê) |

## Cenários e resultado real
- Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-052d`, HEAD do remoto (`pull --ff-only`: já atualizado), carga 4,96 e 7495 MB livres antes da rodada.
- `vitest run --maxWorkers=4` nos 4 arquivos tocados (`esquema-com-seed`, `guarda-seed`, `seed-recusa-real.pg`, `seed.duble`): 3 arquivos passaram, 1 pulado (o `.pg`); 21 testes passaram, 8 pulados (todos do `.pg`, sem PostgreSQL no sandbox). Nenhum pulado adicionado pelo diff.
- `tsc --noEmit` no `server`: rc=0.
- Leitura do diff: os testes cobrem a recusa do seed em base com coleta real, a contagem de `stg_webhook_evento` (só no BusinessMap) e a recusa da coleta em esquema com seed; todos afirmam zero escrita (INSERT, UPDATE, DELETE). Nada foi executado na base do dono: nenhum seed, coleta ou limpeza, nenhum `.env` aberto.
- Não rodados aqui, por determinação do brief (a trava da suíte não funciona no sandbox): `pronto`, `test:pg` e lint; ficam para a CI do PR.
- Vermelho antes do verde e mutação: não executados nesta rodada (sem escrita em código e sem ferramenta de mutação no escopo do brief); a CI do PR e o `test:pg` são a prova restante.
- Regras do CLAUDE.md: a branch não toca cálculo de métrica, e BusinessMap e Acelerato seguem em esquemas e guardas separados; nenhuma métrica individual.
- Bugs: nenhum.

Histórico: 2026-11-03, commit atualizado para a ponta da branch da API; o código das guardas revisado em b1104f3 não mudou.
