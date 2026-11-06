Agente destino: forge:devops-engineer
Pedido: 076-publicacao-local
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
Roteiro para o dono pôr no ambiente local o que estava marcado para a VM (K-200, K-216), até ele migrar para a VM na semana que vem (pedido 076, E1.1). Os comandos leem o `.env`, que o sandbox do time não lê; por isso o dono roda e o time só prepara e confere.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/076-publicacao-local.md` (Escopo, Etapas, Fora do escopo).
- No checkout da main: `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/main:<arquivo>` para `package.json`, `server/package.json`, `scripts/db.sh`, `.env.example` (nomes de variável, sem valor) e as migrações em `server/migrations/` (só a lista); na develop, a mesma lista para comparar.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-consultas-dono.sql` (a Q20, linha 205) e as notas de deploy do 063 e do 069 L7-a que citam 0034, `ref:sync-calendario` e `PG_APONTAMENTO_URL` (procure por esses termos em `docs/`).

## Entregar
- "E1.1 (devops-engineer): roteiro em docs/devops/076-publicacao-local.md, só leitura e sem commit; cada comando numa linha que o dono roda, porque os comandos leem o .env, que o sandbox do time não lê." (E1.1)
- (E1) (E1.1) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/076-publicacao-local.md` pela ferramenta Write, sem commit: de qual checkout rodar (o código da `main`, numa worktree destacada; diga o comando de criá-la e como o `.env` da raiz chega a ela sem copiar segredo para arquivo novo, ou, se não houver jeito limpo, diga isso como pendência); pré-condições (Postgres local no ar, variáveis que o dono confere no `.env`, só pelo nome); a ordem dos comandos, cada um numa linha (migrações pendentes, `ref:sync-calendario`, uma coleta do apontamento, a Q20 no psql); o que cada um deve imprimir quando dá certo e o que fazer se falhar; o que o dono cola de volta para a conferência seguinte, sem senha nem dado de pessoa.
- (E2) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 10:29: DECISÃO DO DONO (literal): "ainda nao estamos na vm entao podemos fazer tudo por aqui por enquanto." e "vou migrar para vmsemana que vem, entao faca tudo por aqui." Leitura do Jarvis: os passos de publicação que estavam marcados para a VM (K-200, K-216: migração 0034, coleta do apontamento, conferência Q20; e o ref:sync-calendario) passam a ser feitos no ambiente local desta máquina até a migração para a VM na semana que vem. Ordem ampla: o que mexe na base real local ou no .env vai ao dono num recibo antes (R-DECISAO, falar-com-o-dono).
- 2026-11-06 10:32: DECISÃO DO DONO: "isso" (recibo das 10:29 confirmado): no ambiente local, migrações pendentes, ref:sync-calendario, uma coleta do apontamento e a Q20, com o devops-engineer (pedido 076); e o pedido 075 dos bloqueios reais (K-204) pelo discovery; sem .env, sem coleta agendada, nada na VM.
- O agente não abre, lê nem edita arquivos `.env*` (o `.env.example` só pelo `git show`), não roda nada contra a base local nem a real e não cria worktree: só escreve o roteiro.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar.
- NÃO tocar: código, `.env*`, `KANBAN.md`, os pedidos, as worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (dono): rodar o roteiro e colar as saídas." · etapa de outra delegação; continua no pedido
- "E2.1 (devops-engineer): conferir as saídas coladas e dizer o que ficou pronto." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/076-publicacao-local.md` · o roteiro existe com os comandos em ordem e o resultado esperado de cada um

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
