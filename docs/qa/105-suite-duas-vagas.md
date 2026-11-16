---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-suite-duas-vagas
commit: 1e0ec6f7215516be9395eaafe1ab6b49f667aaba
parecer: aprovado
resultado: aprovado
escopo: completo
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
