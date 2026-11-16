---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-suite-duas-vagas
commit: 1e0ec6f7215516be9395eaafe1ab6b49f667aaba
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-16
---
# Review de devops: fila de testes com duas vagas (105, E7.370 / E7.375)

## Parecer
Aprovado, sem achado bloqueante. A mudança é de scripts (`scripts/suite-unica.sh`, `scripts/suite-unica.test.sh`), de um script do `package.json` (`test:pg`) e de `docs/engineering/praticas.md`. Não toca `.github/`, `Dockerfile*`, `compose*` nem IaC: sem custo (`R-CUSTO`), sem workflow, sem `continue-on-error`/`[skip ci]` (`R-VERIFY`), nada na `main` (`R-MAIN`). O autor não rodou o `pnpm run pronto` completo e não há PR; a suíte inteira fica para o CI do PR, e este parecer não afirma CI verde. Valem o `pnpm run test:trava` parcial (só `suite-unica.test.sh`, abaixo) e a medição na estação.

## Achados
- A1 (recomendado) scripts/suite-unica.sh:85 · `kill -9` no script deixa o filho vivo segurando o fd 9 e a vaga (provado: a vaga só liberou ao matar o neto); é o mesmo desenho da trava antiga (o `kill` do wrapper com SIGTERM também não mata o filho); documentar em `praticas.md` "vaga presa: `cat` na vaga, achar o pid e matar a árvore".
- A2 (recomendado) scripts/suite-unica.sh:44 · na transição, worktree com o script antigo trava `metricas-dspd-suite.lock` (existe em /tmp/claude-1000, de 15/11) e não vê as vagas novas: até virar a `develop` em todas, pode haver mais de 2 suítes; avisar o `tech-lead` para rebasear as worktrees.

## Detalhes
- Lógica: `flock -n` em cada vaga e espera por polling de 0,3 s, o fd 9 herdado pelos filhos até o fim do comando; o aviso lista cada vaga com `pid`, pasta e comando (visto em uso real, ver abaixo). Chamada aninhada pela marca `METRICAS_DSPD_SUITE_SEGURA`: o `pronto` já segura uma vaga e as chamadas internas rodam direto. O `test:pg` não é chamado por dentro do `pronto` (`pronto:interno` não o invoca; o projeto `pg` do vitest usa schemas por execução), então a vaga única do `pg` só é disputada por quem roda `pnpm run test:pg`.
- Validação de entrada: `METRICAS_DSPD_SUITE_VAGAS` só aceita 1 a 16 (0 e texto dão rc=2), `METRICAS_DSPD_SUITE_GRUPO` só `[A-Za-z0-9_-]` (`../x` dá rc=2), link simbólico em diretório ou vaga é recusado, diretório 0700 em `/tmp/claude-<uid>`.
- Limpeza das travas: `flock` é preso ao descritor aberto, então a vaga cai sozinha quando o processo (e os filhos que herdaram o fd) morre; o arquivo fica no disco, vazio ou com o texto da última execução, o que não atrapalha (quem espera só lê o texto com todas as vagas ocupadas, e o dono seguinte reescreve com `>`). Visto: após `kill -9` do script, a vaga continuou ocupada só enquanto o neto vivia (A1); com ele morto, a vaga liberou. Os arquivos antigos em /tmp/claude-1000 (`metricas-dspd-suite.lock`, 0 byte) não são mais usados e podem ser apagados pelo dono; os de teste vão para `mktemp -d` e saem no `trap`. Não houve vaga de teste vazada em /tmp/claude-1000.
- Teste do script (rodado aqui na worktree, no head 1e0ec6f7): `bash scripts/suite-unica.test.sh` em 12,6 s, 20 verificações `ok`, "tudo certo", rc=0, incluindo no máximo duas simultâneas, a terceira esperando, `VAGAS=1` em série, aninhada, `pg` com uma vaga mesmo com `VAGAS=8` e recusa de entrada inválida/link. Isso não é o `pnpm run pronto` completo.
- `shellcheck` (no PATH): sem erro; avisos SC2174 (`mkdir -p -m`, só o último diretório recebe o modo, aqui é o desejado), SC2319 e SC2016 (informativo) em `suite-unica.test.sh`, sem efeito. `actionlint` e `zizmor` fora do PATH, mas nenhum workflow mudou.
- Uso de CPU e memória com duas suítes juntas (medido de verdade, 16/11 20:46 a 20:47, estação com as duas vagas cheias por dois `pnpm run pronto:interno` da worktree 063, e mais outros agentes na máquina; não rodei suítes minhas para não furar a fila nem inflar a carga): 16 núcleos e 18 GB (o `CLAUDE.md` fala em 8 GB e 8 núcleos; a estação atual é maior). Três amostras de 9 s: load average 19,0 / 17,3 / 16,5; CPU ociosa 39 a 43% (vmstat `id`), nenhuma espera de I/O (`wa` 0), swap 0; memória usada 9,9 / 10,9 / 11,4 GB, disponível 8,1 / 7,1 / 6,6 GB (tendência de queda de ~0,75 GB por amostra enquanto os workers do vitest subiam, 0,6 a 1,5 GB de RSS por worker); pressão de memória (`/proc/pressure/memory`) em 0 (`full` 0, `some` avg60 0,04%); pressão de CPU `some` avg60 15%, avg300 9%, sem `full`. Soma de RSS de vitest/playwright/chrome/postgres: ~3 GB. Leitura: duas suítes de unidade/tipos/build cabem com folga de memória e sem espera de I/O; a CPU fica saturada em picos (load acima de 16), o que alonga cada suíte mas não derruba. Limite: não vi duas suítes E2E (Chromium) juntas; cada navegador pesa mais, então vale conferir o `available` na primeira vez em que dois `test:e2e` rodarem juntos e, se cair de ~3 GB, reduzir com `METRICAS_DSPD_SUITE_VAGAS=1`.
- Fila em uso real: vi 5 `pronto` esperando atrás de duas vagas ocupadas (arquivos de vaga com `pid`, pasta e comando) e uma vaga `pg` separada ocupada por `test-pg.sh` ao mesmo tempo, sem uma bloquear a outra.

## Custo e rollback
Custo zero: sem minutos de CI, sem recurso novo. Rollback: reverter o commit (volta à trava única) ou, sem reverter, `METRICAS_DSPD_SUITE_VAGAS=1` (uma suíte por vez, só a fila `suite`; o `pg` já é de uma vaga).
