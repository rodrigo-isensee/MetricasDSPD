# Retrospectiva do pedido 076: publicação no ambiente local até a VM

Data: 2026-11-06. Fonte: `docs/pedidos/076-publicacao-local.md` (Histórico), `docs/kanban/conferencias.md` (linhas do 076), `docs/devops/076-publicacao-local.md` (## Resultado) e, para a queda da sessão anterior, `docs/pedidos/075-bloqueios-reais.md` (Histórico 12:28 e 13:00). Fala do processo, não de pessoas.

## 1. Dados do pedido
- Aberto 10:33, E1 e E2 entregues 13:29: 2 h 56 min de relógio. Cartões K-216 e K-200 (a parte da VM continua aberta).
- Lead time e cycle time: menos de 20 itens, sem percentil. Valor bruto do pedido: 2 h 56 min (aberto até a entrega da E2.1). Vazão: 2 etapas de execução (E1.0, E1.1/E2.1) entregues no dia; K-216 não está em Pronto (depende da VM). Os relógios D-4 (`forge-check voltas`) não foram rodados aqui: não medido.
- Briefs (de `conferencias.md`): 18 passagens de conferência de brief no 076, 11 reprovadas e 7 aprovadas. Reprovações por classe de causa: decisão 8 (10:35, 10:36, 10:52, 10:54, 11:14, 11:16, 11:18, 11:20), escopo 1 (11:27), forma 1 (13:01), citação 1 (13:32, este brief). Primeiro brief aprovado só às 11:21, 48 min depois da abertura.
- Entregas: 1 "não cumpriu (etapa)" (11:26, causa ambiente: hook barrou o `pnpm install` no papel devops).
- Execução: passo 4 falhou 2 vezes (11:30, 13:05) e fechou na terceira (rc=0 às 13:26, depois da correção do dono às 13:19). Passos 3, 5 e 6 rc=0 na primeira tentativa em que rodaram.
- Clareza: 2 confirmado, 2 técnico, 0 suposição, 0 perguntas na abertura; no Histórico há 2 `NAO-ENTENDI` (10:36, 11:11) e 2 perguntas ao dono (P-076-1, P-076-2). Escopo depois do início: 0 `ESCOPO+/-`; 1 etapa nova (E1.0, 11:23). Devolvidas: 0 `DEVOLVIDA:`.
- Retrabalho de cartão e escape: não medido neste pedido (sem cartão devolvido registrado no Histórico; `forge-check escape resumo` não rodado). DORA: não medido (sem PR neste pedido, só publicação local).

## 2. O que funcionou
- A decisão B (10:50) e a P-076-2 "A" (11:11) deixaram o dono no controle sem lhe passar a execução; nenhum comando destrutivo rodou (`migrate up` só aplicou a 0034, sem `down`).
- O devops parou no primeiro erro, como pedido, e registrou o roteiro com 6 passos e o resultado esperado de cada um; a conferência E2.1 fechou a conta da coleta (8769 + 40429 = 49198).
- O conferente de brief achou os dois desvios de decisão (10:36 recibo, 10:54 `.env` sem script) antes de qualquer execução.
- O Postgres parado pela queda do WSL foi identificado com causa (13:19) em vez de ficar como "banco inválido".

## 3. O que custou tempo (hora de cada evento do Histórico)
- 10:33 a 11:21: 8 reprovações de brief por decisão. Os briefs repetiam decisões já substituídas, ou estendiam o carregamento do `.env` além do que o dono decidiu. 48 min até o primeiro brief aprovado.
- 11:23: o hook barrou `pnpm install` no papel devops; nada rodou. A E1.0 foi criada e o tech-lead executou o passo 1 (11:26). 5 min de espera, mas um brief devops reprovado/aprovado e uma etapa a mais.
- 11:30: passo 4 rc=1 com a mensagem "configuração ou banco inválidos", sem a categoria do erro. A hipótese do devops (variável ausente) só foi confirmada às 13:19 pelo dono. O Postgres estava parado às 11:30 (queda do WSL), o que a mensagem também não distinguia.
- 13:00: retomada; 13:05 o passo 4 falhou de novo pela mesma causa (`PG_REF_URL` ausente), pois o aviso do dono cobriu só as variáveis do apontamento. Espera total do passo 4: 11:30 a 13:19 = 1 h 49 min, quase toda de espera do dono (a causa estava no `.env`, que o time não lê).
- 13:26: os 3 comandos (passos 4 a 6) rodaram fora do sandbox sem prompt de aprovação visível ao devops, contra a decisão B e o pedido do dono das 13:19 ("um comando por vez com a aprovacao do dono na tela"). Nada destrutivo rodou, mas o controle que o dono escolheu não funcionou como combinado.
- 13:29: o hook de conformidade barrou texto de heredoc que só cita `pnpm install`, sem executá-lo. Contornar não cabe (R-CONFORMIDADE); custo: reescrever o texto.
- Sessão anterior (fonte: pedido 075, Histórico 12:28 e 13:00; o 076 registra a retomada às 13:00): a sessão caiu e perdeu o controle remoto, dois commits dos pareceres do 075 ficaram só locais, com o push preso no `pre-push`; o Histórico de 12:28 foi escrito depois, sem registro na hora. A retomada às 13:00 decidiu um push simples com limite de 15 minutos. O 076 sofreu o mesmo corte (11:30 a 13:00 sem registro de andamento).

## 4. Avaliação dos pontos pedidos
- Hook no `pnpm install` do devops (11:23): o controle funcionou (papel certo), mas o brief gerador não avisou; custo evitável de 1 etapa e 1 rodada. Causa: classe ambiente/brief.
- Passo 4 falhou duas vezes sem categoria do erro (11:30 e 13:05), até 13:19 e rc=0 às 13:26: a saída "configuração ou banco inválidos" mistura variável ausente, autenticação e conexão (aqui eram duas causas: variável ausente e Postgres parado). Medida: voltas por passo, alvo 1.
- Comandos do 13:26 sem aprovação na tela: é desvio da decisão B. O modo da sessão (provável aprovação automática) anulou o controle; só o dono confirma se houve prompt. Não se afrouxa, vira regra de brief/hook.
- Hook que barra texto de heredoc (13:29): falso positivo em texto que cita o comando; o hook não distingue citação de execução.
- Queda da sessão anterior: o registro do que ficou pronto (commits locais, push preso) dependeu de reconstrução na retomada.

## 5. Ações de melhoria (até 3)
1. Categoria do erro nos comandos de `ref:sync-calendario` e `bm:apontamento`; responsável: node-backend por cartão do Jarvis; medida: voltas do passo por causa de variável ausente (hoje 2) cair a 0 num novo pedido de publicação.
2. Brief de comando sob aprovação do dono na tela (Forge): exigir confirmação explícita; responsável: Jarvis leva ao Forge; medida: desvios de aprovação por pedido (hoje 1) = 0.
3. Brief do devops avisar do hook de `pnpm install` e do falso positivo de heredoc; responsável: Jarvis (brief gerar) e Forge (hook); medida: etapas "não cumpriu (ambiente)" por hook (hoje 1) = 0.

## 6. Revisão das ações da retrospectiva anterior
Não revisadas neste documento: não li a retrospectiva anterior (o brief não a cita); fica não medido.

## 7. Linhas MELHORIA
Classe de `R-DECISAO`: "Melhoria vista" (entrada direta quando só registra); as de fábrica seguem ao Forge por PR e as de projeto por cartão.

MELHORIA: (projeto) a saída "configuração ou banco inválidos" não diz a categoria do erro; o passo 4 falhou 2 vezes (docs/pedidos/076-publicacao-local.md, 2026-11-06 11:30 e 13:05; 1 h 49 min até a causa); medida: voltas por passo por causa de variável ausente = 0 · projeto
MELHORIA: (fábrica) comando "só com aprovação do dono na tela" rodou sem prompt visível (docs/pedidos/076-publicacao-local.md, 2026-11-06 13:26); medida: desvios de aprovação por pedido = 0 · Forge
MELHORIA: (fábrica) o hook barrou o `pnpm install` do devops e depois texto de heredoc que só cita o comando (docs/pedidos/076-publicacao-local.md, 2026-11-06 11:23 e 13:29; docs/kanban/conferencias.md, 11:26); medida: entregas "não cumpriu (ambiente)" por hook = 0 · Forge
MELHORIA: (fábrica) 8 de 11 reprovações de brief do 076 são de decisão: brief copia linha substituída ou estende a decisão do dono (docs/kanban/conferencias.md, 10:35 a 11:20; 48 min até o primeiro aprovado); medida: reprovações de brief por decisão por pedido, hoje 8 · Forge
MELHORIA: (fábrica) sessão caiu com push preso no pre-push e sem registro na hora (docs/pedidos/075-bloqueios-reais.md, 12:28 e 13:00; docs/pedidos/076-publicacao-local.md, 13:00); medida: eventos sem registro por queda de sessão = 0 · Forge
