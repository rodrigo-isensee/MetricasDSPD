---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-test-pg-ambiente
commit: 944aa74c86daea77411965377cc82f9c528f13b9
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: K-392 (test:pg com Postgres descartável)

## Achados
- A1 (recomendado) scripts/test-pg.sh:23 · SIGKILL (kill -9) ou queda do host não roda o trap: sobra 1 contêiner, 1 volume e 1 rede metricasdspd-teste-<id>. Reproduzido; limpei à mão. Registrar em operacao-banco.md o comando de limpeza (docker compose -p <projeto> down -v).
- A2 (recomendado) docs/engineering/operacao-banco.md:102 · O ponto do autor procede: local sobe banco próprio, a CI (job db) usa o compartilhado do ADR 0014. A seção nova cobre só o lado local; falta dizer que a divergência é deliberada e a CI segue pelo PG_TESTE_URL.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Cada execução sobe Postgres próprio (projeto metricasdspd-teste-<id>, volume e porta próprios) | 2 execuções de `pnpm run test:pg`, ids distintos nos logs de interrupção | n/a | passou |
| Derruba no fim, sem sobrar contêiner, volume ou rede | Contagem de `teste` em ps -a, volume ls e network ls antes e depois de cada execução | fim normal | passou: 0/0/0 antes e depois, nas duas |
| Idem quando interrompida | SIGINT durante o vitest, SIGTERM durante o vitest, SIGINT durante o `up --wait` | interrupção em 3 pontos | passou: 0/0/0 depois, 0 vitest órfão |
| Interrompida na fila (sem ter subido nada) | SIGINT enquanto `suite-unica` espera a trava | espera na fila | passou: nada criado |
| Não toca o banco de desenvolvimento | `docker ps` ao fim | isolamento | passou: metricasdspd-postgres-1 segue healthy |
| Suíte completa passa sem .env | 2 execuções | n/a | passou: 342 de 342 (50 arquivos) nas duas |
| Com PG_TESTE_URL usa a URL e não sobe nada | leitura (test-pg.sh:19) | CI | não executado aqui (sem a URL de CI); a CI do PR prova |
| SIGKILL | `kill -9` do grupo | morte sem trap | resíduo, ver A1 |

## Cenários e resultado real
- Ambiente: worktree desanexada em 944aa74c, Docker local, sem .env. Contagem por nome contendo `teste`, pois outros agentes mexem em volumes alheios na mesma estação (o total de volumes variou de 19 para 28 sem relação com esta branch).
- Execução 1 e 2 pela fila única (`pnpm run test:pg`, suite-unica.sh): rc=0, `Test Files 50 passed (50)`, `Tests 342 passed (342)`, 122 s de vitest cada. Antes e depois: `ctn=0 vol=0 net=0`.
- Interrupção, por `scripts/test-pg.sh` direto (a fila estava ocupada por outras suítes por mais de 10 min; o trap é do test-pg.sh, a fila só envolve): SIGINT 8 s depois de o contêiner existir, `depois: ctn=0 vol=0 net=0`; SIGTERM 12 s depois, idem; SIGINT 0 s (durante o `up --wait`), idem. `processos vitest restantes: 0` em todas.
- SIGINT na fila: a execução foi interrompida esperando a trava; nada foi criado (0/0/0).
- SIGKILL: `depois: ctn=1 vol=1 net=1` (metricasdspd-teste-6c7b5c73). Inevitável para trap em bash; recomendação A1.
- Vermelho antes do verde e mutação: sem teste novo (a entrega é script e doc); a prova é a observação acima. O parecer não afirma CI verde: não há PR; a suíte inteira fica para o CI do PR (PQ do autor: 342 de 342, confirmado aqui duas vezes).
- Diff conferido: só scripts/test-pg.sh e docs/engineering/operacao-banco.md.
