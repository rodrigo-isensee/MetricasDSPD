Agente destino: forge:tech-lead
Pedido: 076-publicacao-local
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.0

## Objetivo
Criar a worktree destacada da `main` para a publicação local (K-200, K-216) e instalar as dependências nela, porque o hook do Forge não deixa o devops-engineer rodar `pnpm install` (pedido 076, E1.0).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/076-publicacao-local.md` (Etapas e a última linha do Histórico).

## Entregar
- "E1.0 (tech-lead): criar a worktree destacada da main em /home/rodrigoisensee/MetricasDSPD-076 e rodar o pnpm install --frozen-lockfile nela, sem tocar no .env." (E1.0)
- (E1) (E1.0) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD fetch origin main`; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree add --detach /home/rodrigoisensee/MetricasDSPD-076 8bb1210ba65e89f4093b28597af8378ce880ae46`; `pnpm --dir /home/rodrigoisensee/MetricasDSPD-076 install --frozen-lockfile`; um comando por chamada; se a pasta estiver fora da área de escrita do sandbox, rode com `dangerouslyDisableSandbox` (passa pela aprovação do dono); sem commit.
- (E2) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 10:29: DECISÃO DO DONO (literal): "ainda nao estamos na vm entao podemos fazer tudo por aqui por enquanto." e "vou migrar para vmsemana que vem, entao faca tudo por aqui." Leitura do Jarvis: os passos de publicação que estavam marcados para a VM (K-200, K-216: migração 0034, coleta do apontamento, conferência Q20; e o ref:sync-calendario) passam a ser feitos no ambiente local desta máquina até a migração para a VM na semana que vem. Ordem ampla: o que mexe na base real local ou no .env vai ao dono num recibo antes (R-DECISAO, falar-com-o-dono).
- 2026-11-06 10:32: DECISÃO DO DONO: "isso" (recibo das 10:29 confirmado): no ambiente local, migrações pendentes, ref:sync-calendario, uma coleta do apontamento e a Q20, com o devops-engineer (pedido 076); e o pedido 075 dos bloqueios reais (K-204) pelo discovery; sem .env, sem coleta agendada, nada na VM. [Leitura: "sem .env" é o "Não vou: editar o .env" do recibo de 10:29; carregar o .env no comando é a P-076-2 "A" do pedido 076, 11:11]
- 2026-11-06 10:50: DECISÃO DO DONO: "B" (P-076-1): o devops-engineer roda os comandos locais, cada um fora do sandbox e só depois da aprovação do dono na tela, sem ler o .env. Etapas ajustadas (E1.1 roteiro e execução; E1.2 dono aprova; E2.1 conferência). [SUBSTITUÍDA pela linha de 10:52: E1.1 e E2.1 em delegações separadas] DECISÃO TÉCNICA (Jarvis): E1.1 e E2.1 numa delegação só ao devops-engineer, porque a conferência é das saídas da própria execução.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-076-2, a primeira da lista e a única que vale nas duas leituras da resposta): o devops-engineer carrega o .env no próprio comando de ref:sync-calendario e de bm:apontamento, do mesmo jeito que o scripts/db.sh (set -a; . ./.env), sem ver nem imprimir os valores, cada comando com a aprovação do dono. NAO-ENTENDI: (Jarvis) a resposta "A" veio depois da lista de 17 decisões; leituras: (1) A em todas; (2) A só na P-076-2. Pergunta devolvida ao dono para as outras 16. [SEM EFEITO: o dono respondeu "A" em todas, linha de 11:11]
- 2026-11-06 10:52: [SUBSTITUÍDA na parte do .env pela P-076-2 "A" (11:11) e pela DECISÃO TÉCNICA das 11:14] [SUBSTITUI a parte técnica da linha das 10:50] DECISÃO TÉCNICA (Jarvis): o forge-check não deixa juntar E1.1 e E2.1 numa delegação; a E2.1 vai numa delegação curta depois da E1.1. O .env só chega aos comandos pelos scripts do repositório que já o carregam (scripts/db.sh, scripts/coleta.sh); comando sem script assim, ou script que só carrega o .env de um checkout que não tem o código da main, para e volta como pergunta ao dono.
- 2026-11-06 11:11: Leitura confirmada pela repetição do dono (três respostas "A" seguidas à lista): A em todas, inclusive a P-076-2.
- 2026-11-06 11:14: DECISÃO TÉCNICA (Jarvis): na worktree da main (/home/rodrigoisensee/MetricasDSPD-076) o .env chega por um link simbólico para o .env da raiz (sem copiar conteúdo), para o scripts/db.sh carregá-lo como hoje; no ref:sync-calendario e no bm:apontamento, carregado no próprio comando (P-076-2 "A"); o agente nunca abre para ver, imprime, copia nem edita o .env, só o carrega no shell; recusa de hook ao link: para e relata.
- O passo 1 do roteiro vai ao tech-lead pela DECISÃO TÉCNICA da última linha do Histórico do 076 (hook R-CONFORMIDADE: pnpm install não é do devops); os passos 2 a 6 continuam com o devops-engineer.
- Não criar link para o `.env`, não abrir nem carregar o `.env`; isso é do passo 2, com o devops-engineer.
- Recusa de hook, sandbox, classificador ou do dono: pare e relate a mensagem literal, sem contornar e sem repetir. git e pnpm precisam de `github.com` e `registry.npmjs.org` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, `.env*`, o roteiro em docs/devops/, `KANBAN.md`, os pedidos, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): roteiro em docs/devops/076-publicacao-local.md e execução dos comandos no ambiente local, cada um fora do sandbox e só depois da aprovação do dono na tela, sem abrir o .env para ver (ele só é carregado no shell do comando, P-076-2); para no primeiro erro; sem commit." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): aprovar ou negar cada comando na tela." · etapa de outra delegação; continua no pedido
- "E2.1 (devops-engineer): conferir as saídas e registrar no mesmo roteiro o que ficou pronto." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-076 rev-parse HEAD` · espera: igual '8bb1210ba65e89f4093b28597af8378ce880ae46'
- PQ-2 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-076/node_modules/.modules.yaml` · a instalação terminou

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
