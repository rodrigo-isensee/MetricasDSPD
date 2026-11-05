Agente destino: forge:agile-coach
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.11

## Objetivo
Retrospectiva do pedido 069 (lacunas de dado real de prioridade alta, lotes L3, M1, L2, L9 e L7) (pedido 069, E1.11, K-220).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/069-lacunas-alta.md` (Histórico inteiro); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md` (linhas do 069); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/historico.md` (K-220).

## Entregar
- "E1.11 (agile-coach): retrospectiva do pedido 069." (E1.11)
- (E1, E2, E3, E4, E5) (E1.11) retrospectiva do processo do pedido inteiro (os cinco itens do escopo), sem trabalho novo neles: retrospectiva em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-11-05-069-lacunas-alta.md`, gravada só com Write ou Edit: o que foi bem, o que custou tempo (hora de cada evento do Histórico, relógio local), rodadas e reprovações de brief e de entrega por classe de causa, e linhas `MELHORIA:` (uma por linha: problema, evidência por data e arquivo, medida do efeito, Forge ou projeto). Avalie pelo menos: as três voltas do L9-c (ordem da Q6 sem garantia na fonte, fronteira de importação do comando de apoio, teste pg aprovado sem banco e achado pela CI do PR 238); o erro de formato da linha entrega conferida (2026-11-05 16:28) e as conferências recusadas por ele; as decisões do dono que chegaram durante as conferências (campo repetido A e B, P-L9C-1 a 3) e os briefs refeitos; o tamanho do L9-c (884 linhas) frente ao teto; o L2-c pendente do campo de data; commit só do arquivo com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD add docs/retrospectivas/2026-11-05-069-lacunas-alta.md` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD commit -m <mensagem> -m 'Cartão: K-220' -- docs/retrospectivas/2026-11-05-069-lacunas-alta.md` (sem heredoc e sem pipe), na branch docs/jarvis-2026-10-23, sem push.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-05): "B" (resposta à pergunta "No Acelerato, a lista de campos de etapa de cada chamado vem na ordem das etapas por onde ele passou? A) Sim, vem nessa ordem. B) Não vem, ou não sei. A regra muda para outro critério: vale o valor da etapa que vem por último no desenho do fluxo de atendimento, não na passagem real do chamado"): no campo repetido em várias etapas, o critério "etapa mais recente pela qual o chamado passou" da decisão "A" de 2026-11-05 é trocado por "vale o valor preenchido da etapa que vem por último no desenho do fluxo de atendimento"; um vazio continua não apagando um valor preenchido.
- DECISÃO DO DONO (2026-11-05): "A" (P-L9C-1, de onde vem a ordem das etapas no desenho do fluxo de atendimento; opções: A uma lista escrita pelas pessoas que configuram o Acelerato e pelo dono, guardada com versão; B a tabela de 11 etapas do briefing §3.4; C confirmar com quem conhece o Acelerato que a lista de etapas do workflow vem na ordem do desenho): a ordem vem de uma lista escrita pelas pessoas (WS4) e pelo dono, versionada na referência (etapa_fluxo); preencher a lista é trabalho de pessoas, não do time.
- DECISÃO DO DONO (2026-11-05): "A" (P-L9C-2, etapa fora da lista do fluxo ou empate entre etapas na mesma posição com valores diferentes; opções: A o campo fica vazio com contagem; B vale o último valor na ordem devolvida pelo Acelerato): o campo fica nulo com contagem, sem escolher valor por palpite.
- DECISÃO DO DONO (2026-11-05): "A" (consultas de apoio do L9-c, P-L9C-3; opções: A o time cria um comando que usa a conexão da coleta, roda só as duas consultas e mostra só as contagens, para o dono rodar numa linha; B o dono roda as consultas no cliente de banco): o node-backend cria o comando de apoio só leitura (só contagens), com review e segurança, junto com a volta do L9-c; o dono o roda no terminal.
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
- DECISÃO DO DONO (2026-11-05): "A" [SUBSTITUÍDA no critério de ordem pela decisão "B" de 2026-11-05; só o "vazio nunca apaga" segue valendo] (L9-c, campo de etapa do Acelerato repetido em várias etapas, A1 do review do L9-b): vale o valor preenchido da etapa mais recente pela qual o chamado passou; um vazio nunca apaga um valor preenchido.
- DECISÃO DO DONO (2026-11-05): "A" (D-L9-1, previsao_retorno do L9-c): guardar só "tem previsão: sim ou não" (booleano), como a lista fechada já diz; a coluna de data muda de tipo no próprio L9-c; a data prevista não é coletada.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): calendário por domínio (L7-a); nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:05: Retrospectiva do 069 aberta: os lotes do 069 estão na develop (L9-c no PR 238) e parte na main pela release 071. DECISÃO TÉCNICA (Jarvis): retrospectiva com o agile-coach, commit na branch do Jarvis (docs/jarvis-2026-10-23), sem push, cobrindo as voltas do L9-c (ordem da Q6, fronteira do apoio, teste pg sem banco), o erro de formato da linha entrega conferida, as decisões do dono que chegaram durante as conferências e o tamanho do L9-c frente ao teto.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Sem métrica individual: a retrospectiva fala do processo, nunca de pessoa.
- Recusa de hook: pare e relate a mensagem literal, sem contornar. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outros arquivos (o pedido, o quadro e as conferências inclusive), o `CLAUDE.md`, os arquivos `.env*`, as worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-11-05-069-lacunas-alta.md` · espera: rc=0
- PQ-2 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-11-05-069-lacunas-alta.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
