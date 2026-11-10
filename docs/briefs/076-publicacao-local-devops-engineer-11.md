Agente destino: forge:devops-engineer
Pedido: 076-publicacao-local
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
Pôr no ambiente local desta máquina o que estava marcado para a VM (K-200, K-216): migrações pendentes, `ref:sync-calendario`, uma coleta do apontamento e a Q20, até o dono migrar para a VM na semana que vem; você roda cada comando, fora do sandbox e só depois da aprovação do dono na tela (pedido 076, E1.1). Retomada (Histórico do pedido, 13:00): os passos 1 a 3 estão feitos e registrados no roteiro; o passo 4 falhou às 11:30. O dono editou o `.env` (senha do `dspd_api_apontamento` e `PG_APONTAMENTO_URL`) e subiu o Postgres local; você recomeça no passo 4.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/076-publicacao-local.md` (Escopo, Etapas, Fora do escopo).
- Código da `main` (`origin/main`, 8bb1210b): `package.json`, `server/package.json`, `scripts/db.sh`, `.env.example` (só os nomes de variável, por `git show origin/main:.env.example`) e a lista de `server/migrations/`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-consultas-dono.sql` (a Q20, linha 205) e as notas de deploy do 063 e do 069 L7-a que citam 0034, `ref:sync-calendario` e `PG_APONTAMENTO_URL` (procure por esses termos em `docs/`).

## Entregar
- "E1.1 (devops-engineer): roteiro em docs/devops/076-publicacao-local.md e execução dos comandos no ambiente local, cada um fora do sandbox e só depois da aprovação do dono na tela, sem abrir o .env para ver (ele só é carregado no shell do comando, P-076-2); para no primeiro erro; sem commit." (E1.1)
- (E1) (E1.1) Rodar do passo 4 ao 6 do roteiro `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/076-publicacao-local.md`, um por vez com `dangerouslyDisableSandbox` (cada um passa pela aprovação do dono), parando no primeiro erro, sem repetir passo negado. Nos passos 4 e 5 o `.env` é carregado no próprio comando, como o `scripts/db.sh` faz (`set -a; . ./.env; set +a`), na worktree. Antes do passo 5, confira MemAvailable e load (restrição abaixo).
- (E1) (E1.1) Em cada `## Passo <n>` de 4 a 6, acrescentar a linha `- Saída (13:00 em diante):` com a saída resumida (sem senha, sem dado de pessoa, sem valor do `.env`), mantendo a saída das 11:30; se o passo 4 falhar de novo, diga a categoria provável (variável ausente, autenticação, conexão) pela leitura do código, sem abrir o `.env`.
- (E2) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 10:50: DECISÃO DO DONO: "B" (P-076-1): o devops-engineer roda os comandos locais, cada um fora do sandbox e só depois da aprovação do dono na tela, sem ler o .env. Etapas ajustadas (E1.1 roteiro e execução; E1.2 dono aprova; E2.1 conferência). [SUBSTITUÍDA pela linha de 10:52: E1.1 e E2.1 em delegações separadas] DECISÃO TÉCNICA (Jarvis): E1.1 e E2.1 numa delegação só ao devops-engineer, porque a conferência é das saídas da própria execução.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-076-2, a primeira da lista e a única que vale nas duas leituras da resposta): o devops-engineer carrega o .env no próprio comando de ref:sync-calendario e de bm:apontamento, do mesmo jeito que o scripts/db.sh (set -a; . ./.env), sem ver nem imprimir os valores, cada comando com a aprovação do dono. NAO-ENTENDI: (Jarvis) a resposta "A" veio depois da lista de 17 decisões; leituras: (1) A em todas; (2) A só na P-076-2. Pergunta devolvida ao dono para as outras 16. [SEM EFEITO: o dono respondeu "A" em todas, linha de 11:11]
- 2026-11-06 10:29: DECISÃO DO DONO (literal): "ainda nao estamos na vm entao podemos fazer tudo por aqui por enquanto." e "vou migrar para vmsemana que vem, entao faca tudo por aqui." Leitura do Jarvis: os passos de publicação que estavam marcados para a VM (K-200, K-216: migração 0034, coleta do apontamento, conferência Q20; e o ref:sync-calendario) passam a ser feitos no ambiente local desta máquina até a migração para a VM na semana que vem. Ordem ampla: o que mexe na base real local ou no .env vai ao dono num recibo antes (R-DECISAO, falar-com-o-dono).
- 2026-11-06 10:32: DECISÃO DO DONO: "isso" (recibo das 10:29 confirmado): no ambiente local, migrações pendentes, ref:sync-calendario, uma coleta do apontamento e a Q20, com o devops-engineer (pedido 076); e o pedido 075 dos bloqueios reais (K-204) pelo discovery; sem .env, sem coleta agendada, nada na VM. [Leitura: "sem .env" é o "Não vou: editar o .env" do recibo de 10:29; carregar o .env no comando é a P-076-2 "A" do pedido 076, 11:11]
- 2026-11-06 10:52: [SUBSTITUÍDA na parte do .env pela P-076-2 "A" (11:11) e pela DECISÃO TÉCNICA das 11:14] [SUBSTITUI a parte técnica da linha das 10:50] DECISÃO TÉCNICA (Jarvis): o forge-check não deixa juntar E1.1 e E2.1 numa delegação; a E2.1 vai numa delegação curta depois da E1.1. O .env só chega aos comandos pelos scripts do repositório que já o carregam (scripts/db.sh, scripts/coleta.sh); comando sem script assim, ou script que só carrega o .env de um checkout que não tem o código da main, para e volta como pergunta ao dono.
- 2026-11-06 11:11: Leitura confirmada pela repetição do dono (três respostas "A" seguidas à lista): A em todas, inclusive a P-076-2.
- 2026-11-06 11:14: DECISÃO TÉCNICA (Jarvis): na worktree da main (/home/rodrigoisensee/MetricasDSPD-076) o .env chega por um link simbólico para o .env da raiz (sem copiar conteúdo), para o scripts/db.sh carregá-lo como hoje; no ref:sync-calendario e no bm:apontamento, carregado no próprio comando (P-076-2 "A"); o agente nunca abre para ver, imprime, copia nem edita o .env, só o carrega no shell; recusa de hook ao link: para e relata.
- 2026-11-06 11:23: E1.1 parada no passo 1 pelo hook do Forge (literal: "R-CONFORMIDADE: pnpm install é de dev/qa/tech-lead (papel: devops). Corrigir: peça ao dev"); nada rodou, a worktree não existe; roteiro escrito com 6 passos. Achados do devops: o passo 5 só aceita o modo carga-inicial; psql não está no PATH, a Q20 vai por docker exec no contêiner metricasdspd-postgres-1. DECISÃO TÉCNICA (Jarvis): o passo 1 (worktree e pnpm install) vai ao tech-lead, dono das worktrees (etapa E1.0 nova); o devops-engineer segue do passo 2 ao 6 depois; continua valendo a decisão B do dono (o time roda, o dono aprova cada comando). MELHORIA (fábrica): brief do devops que manda pnpm install é barrado pelo hook; o brief gerar podia avisar.
- 2026-11-06 11:26: E1.0 entregue pelo tech-lead: worktree /home/rodrigoisensee/MetricasDSPD-076 em 8bb1210ba65e89f4093b28597af8378ce880ae46 (origin/main) e pnpm install --frozen-lockfile rc=0, os dois fora do sandbox com aprovação do dono; sem .env e sem link. DECISÃO TÉCNICA (Jarvis): o devops-engineer retoma do passo 2 ao 6 (brief devops-engineer-9).
- 2026-11-06 13:00: Retomada do Jarvis em sessão nova. AÇÃO DO DONO cumprida (aviso do dono pelo assistente do app): o .env local foi editado pelo dono (senha do dspd_api_apontamento e PG_APONTAMENTO_URL) e o Postgres local está no ar. DECISÃO TÉCNICA (Jarvis): o devops-engineer retoma a E1.1 do passo 4 ao 6 (ref:sync-calendario, coleta do apontamento, Q20), cada comando com a aprovação do dono na tela, parando no primeiro erro.
- O `.env`: nunca abrir para ver, imprimir, copiar nem editar o conteúdo; nada de `cat`, `grep` ou `echo` de variável de senha; os únicos usos permitidos são o link simbólico do passo 2 e o carregamento no shell do comando (`set -a; . ./.env; set +a`).
- Recursos: uma tarefa pesada por vez; MemAvailable acima de 3000 MB e load abaixo de 4 antes da coleta (regra de recursos do dono, KANBAN.md, cabeçalho "Recursos (dono, 2026-11-03 13:48)").
- Recusa de hook, sandbox, classificador ou do dono: pare e relate a mensagem literal, sem contornar e sem repetir.
- NÃO tocar: código, o conteúdo do `.env`, o `.env.example`, `KANBAN.md`, os pedidos, outras worktrees, a `develop`, a `homolog`, a `main`, a VM e o agendador da máquina (sem coleta agendada); sem `db:reset`, `migrate down` nem `limpar-seed` (CLAUDE.md, regras invioláveis: carga incremental, nunca sobrescrever histórico).

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.0 (tech-lead): criar a worktree destacada da main em /home/rodrigoisensee/MetricasDSPD-076 e rodar o pnpm install --frozen-lockfile nela, sem tocar no .env." · etapa de outra delegação; feita
- "E1.2 (dono): aprovar ou negar cada comando na tela." · etapa de outra delegação; continua no pedido
- "E2.1 (devops-engineer): conferir as saídas e registrar no mesmo roteiro o que ficou pronto." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `grep -c "^## Passo" /home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/076-publicacao-local.md` · espera: igual '6'
- PQ-3 (cmd): `grep "^- Saída (13:00 em diante):" /home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/076-publicacao-local.md` · espera: linhas>=1 (uma linha por passo rodado, de 1 a 3; o número vai no relatório)
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-076 rev-parse HEAD` · espera: igual '8bb1210ba65e89f4093b28597af8378ce880ae46'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo; diga até qual passo chegou. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
