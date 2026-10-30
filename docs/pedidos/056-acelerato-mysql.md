# Pedido 056: conexão com o Acelerato pela tabela MySQL

- **Modo:** analisar (sobe para planejar ou implementar só com o dono)
- **Objetivo:** "do acelerato eu tenho uma tabela no mysql, quero fazer a conexao tambem" (dono, 2026-10-30)
- **Clareza:** 3 confirmados; 0 suposições; 0 perguntas
- **Depende de:** nenhum (o pedido 052, BusinessMap, segue em paralelo)

## Escopo
- E1. Leitura do Acelerato pela tabela MySQL do dono, só leitura · `confirmado` (dono, "B", 2026-10-30)
- E2. Mudança da regra inviolável do `CLAUDE.md` do projeto que hoje manda ler o Acelerato só pela API pública · `confirmado` (consequência direta da "B")
- E3. Discovery da fonte (o que é a tabela, colunas, dado de pessoa, credencial, usuário só leitor) antes de qualquer código · `técnico` (R-DISCOVERY, R-SEGURANCA)

## Etapas
- E3.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056` e branch `docs/056-acelerato-discovery` a partir da `develop`, com push, sem commit e sem testes (onde a E3.2 e a E3.3 escrevem).
- E3.1 (dono): rodar no terminal a consulta só de estrutura da tabela (nomes e tipos das colunas e total de linhas, sem nenhuma linha de dado) e colar a saída; contar, se quiser, quais painéis o dash atual do Acelerato tem e de onde vem cada número.
- E3.2 (software-architect): com a estrutura colada e o catálogo de métricas de sustentação do briefing, o mapeamento coluna da tabela → métrica (quais saem direto, quais precisam de cálculo, quais faltam), o desenho do coletor MySQL só leitura e incremental e o que muda na ADR 0013, no data-model §4 e no metabase-acelerato-configuracao; lista de perguntas ao time de ciência de dados; em docs, sem commit.
- E3.3 (security-engineer): modelo de ameaças da fonte MySQL (usuário só leitor, credencial no .env, colunas de pessoa barradas na fronteira por lista fechada), em paralelo à E3.2, em docs, sem commit.
- E2.1 (tech-lead): mudança da regra do CLAUDE.md (Acelerato pela tabela MySQL do time de ciência de dados, só leitura) junto com o commit, o review e o PR dos documentos da E3.2 e da E3.3 para a develop.
- E1.1 (dono): validar o plano; depois dele, as etapas de código (coletor) entram neste pedido.

## Fora do escopo
- Escrever no MySQL ou no Acelerato · `confirmado` (dono, "B": só leitura)
- Misturar Acelerato e BusinessMap em qualquer cálculo · `confirmado` (regra inviolável do CLAUDE.md)

DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".

## Suposições
- nenhuma

## Histórico
- 2026-10-30: pedido aberto; PERGUNTA 1 (fonte do Acelerato: API, MySQL ou as duas) respondida com "B". Fila: pergunta 2 (o que é a tabela) e pergunta 3 (prioridade em relação ao 052).
- 2026-10-30 13:17: PERGUNTA 2 respondida: tabela mantida pelo time de ciência de dados (opção B). Fila: pergunta 3 (prioridade).
- 2026-10-30 13:21: PERGUNTA 3 respondida com "A". Recibo enviado ao dono.
- 2026-10-30 13:33: o dono gravou as variáveis ACELERATO_MYSQL_* (nomes provisórios) no .env deste computador ("env feito"); o Jarvis não leu o .env. Recibo do 056 ainda sem resposta.
- 2026-10-30 13:40: recibo aceito; o dono pede que o time olhe a tabela e mapeie as métricas (já existe um dash do Acelerato sobre ela). DECISÃO TÉCNICA (Jarvis): o time olha só a estrutura (nomes e tipos das colunas), que o dono roda e cola (E3.1), sem ler linha de dado, por causa das colunas de pessoa (CLAUDE.md) e porque nenhum agente lê o .env; o mapeamento coluna → métrica fica com o software-architect (E3.2). Etapas abertas.
- 2026-10-30 13:54: o dono informa que o dash atual sobre a tabela "mostra o que estava no briefing exatamente" (as métricas de sustentação do briefing). Entra na E3.2 como base do mapeamento; falta a estrutura da tabela (E3.1).
- 2026-10-30 13:54: DECISÃO TÉCNICA (Jarvis): aberta a E3.0 (worktree e branch do discovery com o tech-lead, sem testes, por causa do pedido do dono de reduzir CPU); a E3.2 e a E3.3 começam depois dela, em paralelo, só documentos.
- 2026-10-30 13:56: brief tech-lead-1 (E3.0) aprovado pelo conferente na rodada 1; delegado (o nome docs/* segue o precedente das branches de discovery 052).
- 2026-10-30 13:57: E3.0 entregue em parte pelo tech-lead: worktree /home/rodrigoisensee/MetricasDSPD-056 e branch local docs/056-acelerato-discovery em 11141d7; push recusado pelo pre-push (lint sem node_modules; o brief proibia pnpm install). DECISÃO TÉCNICA (Jarvis): a E3.2 e a E3.3 escrevem na worktree local, sem push; o push vai junto com a E2.1, com pnpm install em prioridade baixa quando o dono liberar CPU. Sem commit, sem conferência de entrega (R-PROVA).
- 2026-10-30 13:59: brief security-engineer-1 (E3.3) aprovado pelo conferente na rodada 1; delegado.
- 2026-10-30 14:03: E3.3 entregue pelo security-engineer: docs/security/056-acelerato-mysql-ameacas.md na worktree 056 (sem commit), M1 a M10, controles e casos de abuso CA-1 a CA-10; lista de colunas barradas provisória até a E3.1. PERGUNTA: 3 ao dono (§6): onde roda a coleta; credencial própria e não a do dash; cálculo em memória se uma métrica depender de pessoa. 9 perguntas ao time de ciência de dados, levadas pelo dono. Sem commit, sem conferência de entrega (R-PROVA).
- 2026-10-30 14:23: DECISÃO DO DONO (pergunta 1 do §6 do modelo de ameaças, onde roda a coleta): "A": a coleta do Acelerato roda só na máquina do dono (credencial no .env local, banco local), como a do BusinessMap (S-3 = Q-4 A do 052); servidor e homologação não tocam o MySQL do time de ciência de dados. Observação do Jarvis: a conexão que funciona hoje usa uma conta de desenvolvimento compartilhada; para olhar a estrutura ela serve, para o coletor fica a recomendação M1 (usuário próprio só com SELECT), pergunta 1 ao time de ciência de dados. Próxima ao dono: pergunta 2 do §6 (credencial do dash).
- 2026-10-30 14:24: DECISÃO DO DONO (pergunta 2 do §6, credencial): "B": o coletor usa por enquanto a conta de desenvolvimento compartilhada que já conecta; risco M1 aceito pelo dono e registrado; troca por usuário próprio só com SELECT quando o time de ciência de dados criar (pendência antes da coleta agendada, como a chave do BusinessMap). Mitigação do time: consulta fixa só SELECT, parametrizada, sem multi-comando nem LOCAL INFILE, TLS verificado, credencial só no .env. Próxima ao dono: pergunta 3 do §6 (cálculo em memória).
- 2026-10-30 14:25: DECISÃO DO DONO (pergunta 3 do §6, métrica que dependa de pessoa): "A": mesmo padrão do BusinessMap (ADR 0020): o dado de pessoa só existe em memória durante a coleta e na base vai só o resultado agregado (contagem, sim ou não), sem identificar ninguém; nenhuma métrica individual. Perguntas do §6 ao dono encerradas. Falta a E3.1 (estrutura da tabela) para a E3.2.
