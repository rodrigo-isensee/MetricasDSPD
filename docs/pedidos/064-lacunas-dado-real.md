# Pedido 064: levantamento das lacunas de dado real (operacionais, apontamento e sustentação)

- **Modo:** analisar
- **Objetivo:** dizer com prova o que falta para as telas operacionais, a aba do apontamento e a sustentação (Acelerato) mostrarem tudo com dado real, sem mudar código
- **Clareza:** 2 confirmado; 2 suposição; 0 perguntas
- **Depende de:** 060-triagem-dependabot (web e API só com dado real, PRs 207 e 208); 063-worklog-cards-acima-do-teto (lote na develop, PR 209)

## Escopo
- E1. Mapa de cada tela e indicador das operacionais, da aba do apontamento e da sustentação: de onde vem o dado, a regra de "sem dado" e a condição para aparecer com dado real · `confirmado`
- E2. Conferência com o dado real da base local: para cada indicador, se hoje aparece com dado, aparece "sem dado" (e por quê) ou falta código; lista final de lacunas com dono de cada uma · `confirmado`

## Etapas
- E1.1 (qa-engineer): levar a worktree de leitura /home/rodrigoisensee/MetricasDSPD-056d (HEAD destacado, limpa) para a origin/develop atual, sem commit.
- E1.2 (software-architect): mapa de E1 lido do código e das especificações da develop na worktree 056d (só leitura) e gravado em /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md (sem commit).
- E1.3 (qa-engineer): conferência de E2 contra a base local, só leitura (API local ou consultas SELECT), acrescentando a coluna de resultado ao mapa; o que não der para conferir no sandbox vira consulta para o dono rodar.
- E1.4 (dono): rodar as consultas que o QA não conseguir rodar, se houver.

- E1.5 (qa-engineer): ler a saída das consultas do dono, preencher o resultado na base de cada linha do mapa e listar as lacunas com o tamanho medido.
- E1.6 (agile-coach): retrospectiva do pedido 064.
## Fora do escopo
- Corrigir qualquer lacuna: cada uma vira cartão ou pedido depois, com decisão do dono · `confirmado`
- Visão Geral nova com dado real (K-197, pedido 060 E3) · `suposição` (base: está em modo planejar, fora das três áreas pedidas)
- Escrever no BusinessMap ou no Acelerato, ou chamar as APIs externas · `confirmado` (regras invioláveis)

DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]

## Suposições
- A base local tem a carga real do BusinessMap (worklog de 2026-11-02) e do Acelerato (coleta de 2026-11-01) · base: Histórico dos pedidos 059 e 056.
- Métrica abaixo de 20 itens que aparece "sem dado" não é lacuna de código, é a regra do briefing · base: regras invioláveis do CLAUDE.md.

## Perguntas na fila

## Histórico
- 2026-11-04 04:27: pedido aberto pela escolha "A" do dono à pergunta do levantamento (a opção dizia: análise sem mudar código, arquiteto e QA comparam cada tela com o dado real e listam o que falta); a escolha vale como recibo. Cartão K-202. DECISÃO TÉCNICA (Jarvis): a worktree de leitura nasce em 052e (pasta liberada no sandbox e livre) pelo QA, que tem Bash; o arquiteto mapeia sem Bash a partir dela; depois o QA confere com a base.
- 2026-11-04 04:30: E1.1 não cumprida pelo qa-engineer: o sandbox não deixa criar pasta nova em /home/rodrigoisensee (Read-only file system ao criar a 052e, que já não existia); origin/develop em 1f1da673b0fbb8210f2cd5cae5c3a4525afff901. DECISÃO TÉCNICA (Jarvis): a worktree de leitura passa a ser a 056d, que já existe, está limpa e com HEAD destacado em b446021 (fora da limpeza de branches); o QA a leva para a origin/develop atual; o arquiteto lê dela.
- 2026-11-04 04:48: E1.2 cumprida pelo software-architect: mapa em docs/analises/064-lacunas-dado-real.md (sem commit), uma tabela por área; sem mock nem TODO na rota real; lacunas: L1 fato_bloqueio só gravado pelo seed (BLOQUEADOS no mapa real mostraria nenhum bloqueado; afeta O1, O2 e O5); L2 colunas de dim_card não projetadas (O6 sem classe, O10 cliente igual ao time, filtro de sistema zera); L9 colunas de dim_chamado não projetadas (S3 ajustes manuais sempre 0, S2 apurável a mais); L7 aba Apontamento sem feriado e calendário das métricas fixo até 2026-12-25; L3 O2 sem etapas com equipe filtrada (suspeita); L4 tendências do Resumo fora do mapa; ADR 0026 ainda sem commit (branch docs/060-triagem-dependabot). Melhoria vista do arquiteto: BLOQUEADOS no mapa real sem projeção é decisão do dono (R-DECISAO). DECISÃO TÉCNICA (Jarvis): E1.3 com o QA: o agente não lê o .env, então não acessa a base; ele confere no código o que der e escreve as consultas SELECT, só leitura, que o dono roda (E1.4); a pergunta sobre BLOQUEADOS vai ao dono com o resultado.
- 2026-11-04 04:51: E1.1 cumprida pelo qa-engineer: worktree 056d levada para origin/develop 1f1da673b0fbb8210f2cd5cae5c3a4525afff901 (HEAD destacado, limpa), sem commit.
- 2026-11-04 04:53: nota do Jarvis: o mapa do arquiteto tem as lacunas L1 a L12 (L10 a L12 no fim do arquivo); a linha da E1.2 cita só as de maior risco.
- 2026-11-04 04:58: E1.3 cumprida pelo qa-engineer: L1 a L11 confirmadas no código (L1 se estende a evt_bloqueio); L12 depende do ambiente (PG_APONTAMENTO_URL); O17 tem motivo próprio (origem.ts:53); suspeita na L2: eh_subtarefa nunca gravado, o filtro de subtarefa não exclui ninguém (para o arquiteto); docs/analises/064-consultas-dono.sql com Q01 a Q32, só SELECT e contagens, sem coluna de pessoa na saída (Q19 agrupa por pessoa só por dentro para contar dias acima de 16 h); base não consultada (sem psql e sem API local no sandbox). Aguardando o dono: rodar as 32 consultas (E1.4) e decidir BLOQUEADOS no mapa real.
- 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- 2026-11-04 08:05: E1.4 cumprida pelo dono (pelo assistente do app): 32 consultas rodadas em transação só de leitura; saída em /home/rodrigoisensee/logs-metricas/064-consultas-saida-20261104-0803.txt; só a Q20 falhou (dspd_bm.ctl_apontamento_cobertura não existe na base local: migração 0034 ainda não aplicada). Dono pediu: ler o arquivo, abrir os cartões das lacunas e seguir com as retrospectivas. DECISÃO TÉCNICA (Jarvis): E1.5 com o QA para interpretar a saída; os cartões saem do resultado dele.
- 2026-11-04 08:17: E1.5 cumprida pelo qa-engineer: mapa fechado com o medido; L1, L2, L3, L5, L6, L7, L9, L10 e L11 confirmadas; L8 não confirmada (risco latente); L4 sem consulta própria; L12 não verificável por consulta; achados novos M1 a M8. DECISÃO TÉCNICA (Jarvis), prioridade por preferência do time (dado errado ou ausente em tela publicada primeiro): cartões K-206 a K-216 (alta: L2, L9, L3, M1, L7; média: L4, M6, M7; baixa: L5, L8; deploy: L12 e M8). Configuração de ferramenta por pessoas (WS1 e WS4), sem código do time: M2 limites de WIP, M3 papel e tipo das colunas, M4 nível de resolução, L5 SLE, L7 feriados, M6 domínios e campos T1.3 do quadro. L6 (valores de 16 h e limiares) e M5 (S8 0% com 95% sem resposta) são perguntas ao dono, na fila. L10 sem correção (decisão D-7); L11 espera haver pesquisa.
- 2026-11-04 08:18: DECISÃO TÉCNICA (Jarvis): E1.6 com o agile-coach, retrospectiva do 064 com commit na branch do Jarvis, sem push.
- 2026-11-04 08:21: E1.6 cumprida pelo agile-coach: retrospectiva em docs/retrospectivas/2026-11-04-064-lacunas-dado-real.md, commit 42953e69bb32e0c8514c3a89fbfabd5b6c90778e (sem push); 5 briefs, 5 reprovações (decisão 2, citação 2, escopo 1); 4 linhas MELHORIA (2 para o Forge: sandbox sem pasta de worktree e ADR sem commit citada no brief; 2 do projeto: acesso à base e métrica sem gravador).
- 2026-11-04 14:11: DECISÃO DO DONO "B" (S8): contar só os incidentes com resposta; abaixo de 20 não publica. DECISÃO TÉCNICA (Jarvis): vira o pedido 066 (implementar).
- 2026-11-04 14:13: DECISÃO DO DONO "Atipico acima de 10 horas" (L6): o dia atípico passa a acima de 10 h. DECISÃO TÉCNICA (Jarvis): vira o pedido 067 (implementar); os outros limites seguem provisórios até o dono dizer o contrário (suposição no recibo).
