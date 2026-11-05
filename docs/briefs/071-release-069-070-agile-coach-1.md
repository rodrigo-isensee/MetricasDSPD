Agente destino: forge:agile-coach
Pedido: 071-release-069-070
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.7

## Objetivo
Retrospectiva do pedido 071 (release dos lotes do 069 L7-a e L7-b e do 070, até o PR 237 na main) (pedido 071, E1.7, K-222).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/071-release-069-070.md` (Histórico inteiro); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md` (linhas do 071); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/historico.md` (K-222).

## Entregar
- "E1.7 (agile-coach): retrospectiva do pedido 071." (E1.7)
- (E1) (E1.7) retrospectiva em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-11-05-071-release-069-070.md`, gravada só com Write ou Edit: o que foi bem, o que custou tempo (hora de cada evento do Histórico), rodadas e reprovações de brief e de entrega por classe de causa, e linhas `MELHORIA:` (uma por linha: problema, evidência por data e arquivo, medida do efeito, Forge ou projeto). Avalie pelo menos: o laço do Desde por pedido no forge-check entrega (recusa sem o Desde e recusa com ele, no QA da release, no PR 235 e no PR 237); os briefs reprovados porque decisões do dono no 069 chegaram depois do brief (Depende de); o CHANGELOG antes do review, lição do 068 aplicada; o PQ que lia "PR aberto" depois do merge do dono; o tempo da abertura do pedido (13:35) até o merge na main; commit só do arquivo com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD add docs/retrospectivas/2026-11-05-071-release-069-070.md` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD commit -m <mensagem> -m 'Cartão: K-222' -- docs/retrospectivas/2026-11-05-071-release-069-070.md` (sem heredoc e sem pipe), na branch docs/jarvis-2026-10-23, sem push.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-05): "isso" (resposta ao recibo: "vou fazer: levar à main o que está na develop e não está na homolog (069 L7-a e L7-b; 070 simulado por cartão, correção do contraste, E2E e ADR 0028 vigente; Forge 0.32.0) por review, QA e segurança da release, develop para homolog com o portão verde e PR de release homolog para main aberto; não vou fazer: merge na main, incluir o L9-c; é isso?"): release confirmada com esse escopo.
### Do registro citado docs/pedidos/069-lacunas-alta.md (Depende de; todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-05): "B" (resposta à pergunta "No Acelerato, a lista de campos de etapa de cada chamado vem na ordem das etapas por onde ele passou? A) Sim, vem nessa ordem. B) Não vem, ou não sei. A regra muda para outro critério: vale o valor da etapa que vem por último no desenho do fluxo de atendimento, não na passagem real do chamado"): no campo repetido em várias etapas, o critério "etapa mais recente pela qual o chamado passou" da decisão "A" de 2026-11-05 é trocado por "vale o valor preenchido da etapa que vem por último no desenho do fluxo de atendimento"; um vazio continua não apagando um valor preenchido.
- DECISÃO DO DONO (2026-11-05): "A" (P-L9C-1, de onde vem a ordem das etapas no desenho do fluxo de atendimento; opções: A uma lista escrita pelas pessoas que configuram o Acelerato e pelo dono, guardada com versão; B a tabela de 11 etapas do briefing §3.4; C confirmar com quem conhece o Acelerato que a lista de etapas do workflow vem na ordem do desenho): a ordem vem de uma lista escrita pelas pessoas (WS4) e pelo dono, versionada na referência (etapa_fluxo); preencher a lista é trabalho de pessoas, não do time.
- DECISÃO DO DONO (2026-11-05): "A" (P-L9C-2, etapa fora da lista do fluxo ou empate entre etapas na mesma posição com valores diferentes; opções: A o campo fica vazio com contagem; B vale o último valor na ordem devolvida pelo Acelerato): o campo fica nulo com contagem, sem escolher valor por palpite.
- DECISÃO DO DONO (2026-11-05): "A" (consultas de apoio do L9-c, P-L9C-3; opções: A o time cria um comando que usa a conexão da coleta, roda só as duas consultas e mostra só as contagens, para o dono rodar numa linha; B o dono roda as consultas no cliente de banco): o node-backend cria o comando de apoio só leitura (só contagens), com review e segurança, junto com a volta do L9-c; o dono o roda no terminal.
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
- DECISÃO DO DONO (2026-11-05): "A" (L9-c, campo de etapa do Acelerato repetido em várias etapas, A1 do review do L9-b): vale o valor preenchido da etapa mais recente pela qual o chamado passou; um vazio nunca apaga um valor preenchido. [Nota do Jarvis: o critério de ordem desta linha foi trocado pelo dono na decisão "B" de 2026-11-05, na resposta à opção B, que dizia "a regra muda para outro critério"; o "vazio nunca apaga" segue valendo.]
- DECISÃO DO DONO (2026-11-05): "A" (D-L9-1, previsao_retorno do L9-c): guardar só "tem previsão: sim ou não" (booleano), como a lista fechada já diz; a coluna de data muda de tipo no próprio L9-c; a data prevista não é coletada.
### Do registro citado docs/pedidos/070-simulado-por-cartao.md (Depende de; todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
- DECISÃO DO DONO (2026-11-05): "A" (suposições S1 a S3 do 070, pergunta das 12:28): confirmadas as três: S1 os filtros de equipe, sistema e prioridade não se aplicam ao cartão simulado; S2 a exportação leva só o dado real; S3 as duas tendências do Resumo e o EI_SUST ficam sem simulado; com isso a ADR 0028 pode passar a vigente.
### Do Histórico deste pedido, docs/pedidos/071-release-069-070.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 16:14: Retrospectiva do 071 aberta. DECISÃO TÉCNICA (Jarvis): E1.7 com o agile-coach, retrospectiva com commit na branch do Jarvis (docs/jarvis-2026-10-23), sem push, cobrindo o laço do Desde por pedido no forge-check entrega (QA, PR 235 e PR 237), os briefs reprovados por decisões do Depende de que chegaram depois do brief, o CHANGELOG antes do review (lição do 068 aplicada) e o tempo da abertura à main.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Sem métrica individual: a retrospectiva fala do processo, nunca de pessoa.
- Recusa de hook: pare e relate a mensagem literal, sem contornar. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outros arquivos (o pedido, o quadro e as conferências inclusive), o `CLAUDE.md`, os arquivos `.env*`, as worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1. A develop vai à homolog por PR com o portão verde e o PR de release homolog para main fica aberto para o dono, com review, QA e segurança da release antes · `confirmado`" · etapa de outra delegação; continua no pedido
- "E1.1 (tech-lead): review da release (develop contra homolog), parecer na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release (L7-a grava em tabelas de referência), na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/071-release para a develop, squash com a CI verde, antes da E1.5." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-11-05-071-release-069-070.md` · espera: rc=0
- PQ-2 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-11-05-071-release-069-070.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
