---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-test-pg-ambiente
commit: 9edfaccf19e293243b026b2b6b13ec94c900205d
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: K-392 (test:pg com Postgres descartável)

## Achados
- A1 (recomendado) scripts/test-pg.sh:23 · SIGKILL (kill -9) ou queda do host não roda o trap: sobra 1 contêiner, 1 volume e 1 rede metricasdspd-teste-<id>. Atendido na volta 1: operacao-banco.md, README e o cabeçalho do script trazem o comando de limpeza.
- A2 (recomendado) docs/engineering/operacao-banco.md:102 · Divergência local (banco próprio) × CI (compartilhado, ADR 0014). Atendido na volta 1: o texto diz que a CI não passa pelo script e segue pelo banco do próprio job.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Cada execução sobe Postgres próprio (projeto metricasdspd-teste-<id>, volume e porta próprios) | 2 execuções de `pnpm run test:pg`, ids distintos nos logs de interrupção | n/a | passou |
| Derruba no fim, sem sobrar contêiner, volume ou rede | Contagem de `teste` em ps -a, volume ls e network ls antes e depois de cada execução | fim normal | passou: 0/0/0 antes e depois, nas duas |
| Idem quando interrompida | SIGINT durante o vitest, SIGTERM durante o vitest, SIGINT durante o `up --wait` | interrupção em 3 pontos | passou: 0/0/0 depois, 0 vitest órfão |
| Interrompida na fila (sem ter subido nada) | SIGINT enquanto `suite-unica` espera a trava | espera na fila | passou: nada criado |
| Não toca o banco de desenvolvimento | `docker ps` ao fim | isolamento | passou: metricasdspd-postgres-1 segue healthy |
| Suíte completa passa sem .env | 2 execuções (head 944aa74c); PQ do autor no head 0c44ef94: 342 de 342 | n/a | passou |
| Com PG_TESTE_URL no ambiente usa a URL e não sobe nada | volta 1, execução C | CI | passou |
| .env copiado do exemplo sobe o descartável | volta 1, execuções A e B | .env com a variável comentada e ativa | passou |
| PG_TESTE_URL só no .env é descartada | volta 1, execução B | regressão do bug original | passou |
| HUP derruba o descartável | volta 1, execução D | SIGHUP | passou |
| SIGKILL | `kill -9` do grupo | morte sem trap | resíduo inevitável; documentado (A1) |

## Cenários e resultado real
- Ambiente (1ª passada): worktree desanexada em 944aa74c, Docker local, sem .env. Contagem por nome contendo `teste`, pois outros agentes mexem em volumes alheios na mesma estação.
- Execução 1 e 2 pela fila única (`pnpm run test:pg`, suite-unica.sh): rc=0, `Test Files 50 passed (50)`, `Tests 342 passed (342)`, 122 s de vitest cada. Antes e depois: `ctn=0 vol=0 net=0`.
- Interrupção, por `scripts/test-pg.sh` direto: SIGINT 8 s depois de o contêiner existir, `depois: ctn=0 vol=0 net=0`; SIGTERM 12 s depois, idem; SIGINT durante o `up --wait`, idem. `processos vitest restantes: 0` em todas.
- SIGKILL: `depois: ctn=1 vol=1 net=1` (metricasdspd-teste-6c7b5c73). Inevitável para trap em bash.
- Vermelho antes do verde e mutação: sem teste novo (a entrega é script e doc); a prova é a observação. O parecer não afirma CI verde: não há PR; a suíte inteira fica para o CI do PR.

## Revalidação (volta 1, head 0c44ef94, escopo incremental)
Delta lido por `forge-check parecer delta` (944aa74c..0c44ef94): `.env.example`, `README.md`, `carga-da-pesquisa-de-percepcao.md`, `operacao-banco.md`, `scripts/test-pg.sh`. Ambiente: worktree desanexada em 0c44ef94, Docker local. Não li o `.env` real: criei um `.env` descartável com `cp .env.example .env` na worktree (ignorado pelo git) e o removi no fim. Para provar a decisão do script sem gastar a fila e 122 s de vitest, o `pnpm` foi trocado por um stub no PATH que imprime `PG_TESTE_URL` e quantos contêineres `metricasdspd-teste` estão no ar. A suíte completa (342 de 342) é o PQ do autor, não rerrodada neste head; a CI do PR decide.
- A) `.env` copiado do exemplo (variável comentada), sem `PG_TESTE_URL` no ambiente: sobe o descartável (`metricasdspd-teste-0bf15c53`, porta 38071), o stub vê a URL do descartável e 1 contêiner no ar; ao fim `ctn=0 vol=0 net=0`.
- B) `.env` com `PG_TESTE_URL=postgres://x:y@127.0.0.1:1/morto` ativa (a regressão do bug original), sem a variável no ambiente: o valor do `.env` é descartado e o descartável sobe (`metricasdspd-teste-a644dfbd`); `0/0/0` ao fim.
- C) `PG_TESTE_URL` no ambiente, com o mesmo `.env` ativo: o stub recebe a URL do ambiente, `projeto=<nenhum>`, 0 contêineres no ar, nada criado (`0/0/0`).
- D) SIGHUP enviado só ao pid do script, com o contêiner no ar (`ctn=1 vol=1 net=1`): o bash adia o trap até o filho em primeiro plano (`sleep 30` do stub) terminar; ao terminar, o trap rodou e deixou `ctn=0 vol=0 net=0`, sem script restante. Em terminal real o HUP vai ao grupo inteiro.
- Duas execuções seguidas (A e B): `0/0/0` entre e depois, sem sobra.
- Docs: README, operacao-banco.md e carga-da-pesquisa conferem com o script.
- Vermelho antes do verde: B é o equivalente (o script anterior usaria a URL do `.env`); não rodei o script anterior. Sem mutantes: não é pedido de controle do Forge.

## Revalidação (volta 2, head 9edfaccf, escopo incremental)
Delta lido por `forge-check parecer delta` (0c44ef94..9edfaccf): só `docs/architecture/adr/0014-stack-tecnica-do-back-end.md` (nota de revisão datada de 2026-11-16, seções Testes, CI e Histórico). Nenhum código, teste ou script mudou; nada rerrodado. Conferi a nota contra o que já observei: `scripts/test-pg.sh` sobe o descartável por execução com `trap` e `down -v`, decide `PG_TESTE_URL` só do ambiente (linhas 6 a 14), para com mensagem sem Docker (linha 23), e o job `banco` da CI (`ci.yml:103-134`) usa service container e `PG_TESTE_URL`. A nota diz o mesmo, inclusive o resíduo do `kill -9` e o comando de limpeza (A1). Sem achado novo; A1 e A2 seguem atendidos. A suíte inteira fica para o CI do PR (PQ do autor: 342 de 342 no head 0c44ef94); não afirmo CI verde.
