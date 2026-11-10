Agente destino: forge:devops-engineer
Pedido: 076-publicacao-local
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
Pôr no ambiente local desta máquina o que estava marcado para a VM (K-200, K-216): migrações pendentes, `ref:sync-calendario`, uma coleta do apontamento e a Q20, até o dono migrar para a VM na semana que vem; você roda cada comando, fora do sandbox e só depois da aprovação do dono na tela (pedido 076, E1.1).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/076-publicacao-local.md` (Escopo, Etapas, Fora do escopo).
- Código da `main` (`origin/main`, 8bb1210b): `package.json`, `server/package.json`, `scripts/db.sh`, `.env.example` (só os nomes de variável, por `git show origin/main:.env.example`) e a lista de `server/migrations/`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-consultas-dono.sql` (a Q20, linha 205) e as notas de deploy do 063 e do 069 L7-a que citam 0034, `ref:sync-calendario` e `PG_APONTAMENTO_URL` (procure por esses termos em `docs/`).

## Entregar
- "E1.1 (devops-engineer): roteiro em docs/devops/076-publicacao-local.md e execução dos comandos no ambiente local, cada um fora do sandbox e só depois da aprovação do dono na tela, sem ler o .env (os scripts o carregam); para no primeiro erro; sem commit." (E1.1)
- (E1) (E1.1) Escrever o roteiro `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/076-publicacao-local.md` pela ferramenta Write antes de rodar: de qual checkout (código da `main`; se precisar de worktree destacada nova, `/home/rodrigoisensee/MetricasDSPD-076` a partir de `origin/main`, com `pnpm install --frozen-lockfile`), que o `.env` só chega aos comandos pelos scripts do repositório que já o carregam (`scripts/db.sh`, `scripts/coleta.sh`), sem você ler o conteúdo nem copiá-lo; comando sem script assim, ou script que só carrega o `.env` de um checkout que não tem o código da `main`, você não roda: para e relata como pergunta ao dono, as pré-condições (Postgres local no ar) e a ordem: migrações pendentes, `ref:sync-calendario`, uma coleta do apontamento, a Q20; depois rodar um comando por vez com `dangerouslyDisableSandbox` (cada um passa pela aprovação do dono), parando no primeiro erro, sem repetir comando negado pelo dono.
- (E1) (E1.1) Acrescentar ao roteiro, para cada comando rodado, a saída resumida (sem senha, sem dado de pessoa, sem valor do `.env`).
- (E2) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 10:50: DECISÃO DO DONO: "B" (P-076-1): o devops-engineer roda os comandos locais, cada um fora do sandbox e só depois da aprovação do dono na tela, sem ler o .env. Etapas ajustadas (E1.1 roteiro e execução; E1.2 dono aprova; E2.1 conferência). DECISÃO TÉCNICA (Jarvis): E1.1 e E2.1 numa delegação só ao devops-engineer, porque a conferência é das saídas da própria execução.
- 2026-11-06 10:29: DECISÃO DO DONO (literal): "ainda nao estamos na vm entao podemos fazer tudo por aqui por enquanto." e "vou migrar para vmsemana que vem, entao faca tudo por aqui." Leitura do Jarvis: os passos de publicação que estavam marcados para a VM (K-200, K-216: migração 0034, coleta do apontamento, conferência Q20; e o ref:sync-calendario) passam a ser feitos no ambiente local desta máquina até a migração para a VM na semana que vem. Ordem ampla: o que mexe na base real local ou no .env vai ao dono num recibo antes (R-DECISAO, falar-com-o-dono).
- 2026-11-06 10:32: DECISÃO DO DONO: "isso" (recibo das 10:29 confirmado): no ambiente local, migrações pendentes, ref:sync-calendario, uma coleta do apontamento e a Q20, com o devops-engineer (pedido 076); e o pedido 075 dos bloqueios reais (K-204) pelo discovery; sem .env, sem coleta agendada, nada na VM.
- O agente não abre, lê, imprime nem edita arquivos `.env*` (o `.env.example` só pelo `git show`); nada de `cat`, `grep` ou `echo` de variável de senha.
- Recursos: uma tarefa pesada por vez; MemAvailable acima de 3000 MB e load abaixo de 4 antes da coleta.
- Recusa de hook, sandbox, classificador ou do dono: pare e relate a mensagem literal, sem contornar e sem repetir.
- NÃO tocar: código, `.env*`, `KANBAN.md`, os pedidos, outras worktrees, a `develop`, a `homolog`, a `main`, a VM e o agendador da máquina (sem coleta agendada); sem `db:reset`, `migrate down` nem `limpar-seed`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (dono): aprovar ou negar cada comando na tela." · etapa de outra delegação; continua no pedido
- "E2.1 (devops-engineer): conferir as saídas e registrar no mesmo roteiro o que ficou pronto." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/076-publicacao-local.md` · o roteiro existe com os comandos em ordem e, para cada um, a saída resumida

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
