---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-suite-duas-vagas
commit: 0813ca6d4c07d4fa790d29c0dba7a686becd22a8
parecer: aprovado
resultado: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: fila de testes com duas vagas (pedido 105, E7.370, E7.374)

Branch `fix/105-suite-duas-vagas`, head 1e0ec6f7, base ab12a37f. Diff: `scripts/suite-unica.sh`, `scripts/suite-unica.test.sh`, `package.json` (test:pg com `METRICAS_DSPD_SUITE_GRUPO=pg`) e `docs/engineering/praticas.md`. Sem PR: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde nem cita o PQ do autor (o autor não rodou o `pnpm run pronto` completo).

## Achados
- A1 (recomendado) scripts/suite-unica.sh:1 · sem achado bloqueante; ver Observações no fim.

## Obrigações → prova → resultado
| Obrigação (decisão do dono, E7.370) | Prova | Fronteira protegida | Resultado |
|---|---|---|---|
| Teste do script verde | `bash scripts/suite-unica.test.sh`: 21 `ok`, "tudo certo", rc=0 | n/a | passou |
| Duas suítes ao mesmo tempo | pronto A e B (`pnpm run pronto`, locks reais em `/tmp/claude-1000`): vagas 1 e 2 seguradas, cada uma com `pid … em <worktree>: pnpm run pronto:interno` | máximo de 2 | passou |
| Terceira espera e mostra quem segura | pronto C: "as 2 vaga(s) estão ocupadas; esperando a primeira livre", mais uma linha por vaga com pid e comando; C ainda esperando aos 10 s (timeout, rc=124) | vagas cheias | passou |
| Terceira entra quando uma libera | cenário com comandos curtos nos caminhos padrão: ordem A-ini, B-ini, A-fim, C-ini, B-fim | liberação | passou |
| test:pg fora da fila da suíte | com a suíte em `metricas-dspd-suite-1/2.lock`, `METRICAS_DSPD_SUITE_GRUPO=pg` rodou na hora (`PG-rodou`, rc=0) e criou `metricas-dspd-pg-1.lock`, arquivo próprio; o teste do script cobre ainda a 2ª chamada pg esperando (1 vaga) e `VAGAS=8` não muda o pg | fila separada, 1 vaga | passou |
| Entradas inválidas | vagas=0, não numérico, grupo com `/`: rc=2; vaga que é link simbólico: rc=1 (teste do script) | 0, texto, caminho, symlink | passou |
| Mutação no diff | (1) padrão `:-2` para `:-1`: 7 testes caem; (2) vaga do grupo pg `VAGAS=1` para `2`: 2 testes caem | padrão de vagas, vaga única do pg | os 2 mutantes morreram |
| `praticas.md` atualizado | diff de 1 linha, confere com o comportamento acima | n/a | conferido por leitura |

## Observações (sem bloqueio)
- Primeira tentativa de teste real: o worktree principal estava em outra branch, cujo `pronto` não passa pela fila; só uma vaga foi segurada e o 3º processo entrou. Erro de montagem do meu cenário, não do código; repetido com os três `pronto` no head revisado (tabela acima).
- O `pnpm run test:pg` real subiu e recriou o contêiner `metricasdspd-postgres-1` (compartilhado) durante o teste; cortado por timeout. Vermelho antes do verde não se aplica: não há teste de correção de regra fora do teste do script, e os mutantes acima o provam.
- Os dois `pronto` foram cortados por timeout (45 s) e não rodaram até o fim: a conclusão da suíte inteira é do CI.

## Revalidação no head 0813ca6d (E7.392, escopo incremental)
Delta (`forge-check parecer delta`, intervalo 1e0ec6f7..0813ca6d): `package.json`, `scripts/suite-unica.sh`, `scripts/suite-unica.test.sh`, `docs/engineering/praticas.md`. O autor rodou o teste do script e o `pronto` com rc=0; a suíte inteira fica para o CI do PR (sem PR, não afirmo CI verde).

| Obrigação (E7.377, e2e em fila própria) | Prova | Fronteira protegida | Resultado |
|---|---|---|---|
| Teste do script verde com o caso 6b | `bash scripts/suite-unica.test.sh`: 4 `ok` novos do e2e, "tudo certo", rc=0 | n/a | passou |
| Duas chamadas de e2e não rodam juntas | `METRICAS_DSPD_SUITE_GRUPO=e2e` com a suíte cheia: A segurou `metricas-dspd-e2e-1.lock` (`pid … sh -c echo e2eA-ini…`); B esperou, rc=124, com aviso "as 1 vaga(s) estão ocupadas" e quem segura | 1 vaga do e2e | passou |
| e2e ocupado não segura a fila da suíte | teste 6b ("e2e ocupado não segura a fila da suíte" e "…do pg"); a suíte com 2 vagas cheias também não bloqueou o e2e A, que entrou na hora | filas separadas | passou |
| `test:e2e` usa a fila e2e | `package.json` com `METRICAS_DSPD_SUITE_GRUPO=e2e`; teste "test:e2e do package.json usa a fila e2e" | n/a | passou |
| `praticas.md` (vaga do e2e, `PG_TESTE_URL`, vaga presa após `kill -9`) | lido: confere com o script (a trava é solta quando o processo morre) | n/a | conferido por leitura |
| Mutação no diff | (1) `package.json` sem `GRUPO=e2e`: 1 falha; (2) vaga de grupo não-suite `VAGAS=1` para `2`: 3 falhas (pg x2, e2e) | vaga única do e2e | os 2 mutantes morreram; árvore restaurada |

Vermelho antes do verde: sem teste de correção fora do teste do script; os mutantes acima o provam. Sem achado novo.
