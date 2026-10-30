Agente destino: forge:software-architect
Pedido: 056-acelerato-mysql
Tipo: codigo
Branch: docs/056-acelerato-discovery   Base: develop   Base-sha: 11141d7516b7a71418b3ec069473e3449453fe81
Etapa: codigo   Cobre: E3.2

## Objetivo
Desenhar a leitura do Acelerato pela tabela MySQL do time de ciência de dados e mapear as colunas dela nas 12 métricas de sustentação do briefing (pedido 056, E3.2), antes de qualquer código; o dono diz que o dash atual sobre essa tabela já mostra exatamente as métricas do briefing. Worktree `/home/rodrigoisensee/MetricasDSPD-056`, branch local `docs/056-acelerato-discovery` (sem push: o push vai com a E2.1).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/056-acelerato-mysql.md`, seção "Estrutura da tabela" (as 50 colunas e tipos colados pelo dono) e as linhas DECISÃO DO DONO.
- Na worktree: `docs/briefing-execucao-metricas.md` §3.2 (Acelerato), §3.3, §3.4 e "Sustentação · Acelerato — 12 métricas" (linha 386 em diante); regras de cálculo da §7 que valem para o Acelerato.
- Na worktree: `docs/architecture/data-model.md` §4 (schema `dspd_ac`), `docs/architecture/adr/0013-arquitetura-modular-serverless.md` §4 e `docs/integracao/metabase-acelerato-configuracao.md` (o desenho anterior pelo Metabase).
- `/home/rodrigoisensee/MetricasDSPD-056/docs/security/056-acelerato-mysql-ameacas.md` (modelo de ameaças da E3.3, sem commit): controles M1 a M10 e a lista provisória de colunas barradas.

## Entregar
- "E3.2 (software-architect): com a estrutura colada e o catálogo de métricas de sustentação do briefing, o mapeamento coluna da tabela → métrica (quais saem direto, quais precisam de cálculo, quais faltam), o desenho do coletor MySQL só leitura e incremental e o que muda na ADR 0013, no data-model §4 e no metabase-acelerato-configuracao; lista de perguntas ao time de ciência de dados; em docs, sem commit." (E3.2)
- (E3.2) Plano novo `/home/rodrigoisensee/MetricasDSPD-056/docs/architecture/features/056-acelerato-mysql.md` pela ferramenta Write: (a) tabela coluna → uso, marcando cada uma das 50 colunas como lida, lida só em memória (dado de pessoa usado para agregar, nunca gravado) ou barrada, com o motivo; (b) as 12 métricas de sustentação, cada uma com as colunas de onde sai, se sai direto ou com cálculo (pela biblioteca compartilhada T2.5) e o que falta; (c) o coletor: consulta fixa só SELECT com lista fechada de colunas, incremental por `data_atualizacao` (que tem índice) e `ticket_key`, sem sobrescrever histórico (lixeira e arquivados permanecem), filtro da população DSPD-SSSC do briefing §3.2, frequência; (d) o que muda na ADR 0013 §4, no `data-model.md` §4 e no `metabase-acelerato-configuracao.md` (proposta de texto, sem editar esses arquivos); (e) as perguntas ao time de ciência de dados (as de segurança já estão na E3.3; acrescente as de dados: atualização, histórico, o que há nos campos json, semântica das colunas de SLA e de tempo) e as perguntas ao dono que forem de regra de negócio, sem decidir por inferência.
- (E3.2) Em nenhum ponto copie linha de dado: o plano usa só nomes e tipos de colunas. O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- (E1, E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
- DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".
- ADR 0013 (citada no pedido): prevê o Acelerato por uma tabela no Metabase, só leitura, uma vez por dia (§4); esta etapa propõe a revisão para a fonte MySQL, sem editar a ADR.
- ADR 0020 (citada no pedido): protege dado de pessoa: nenhuma coluna de pessoa chega à base; o que precisar de pessoa é calculado em memória e só o agregado é gravado (decisão do dono de 2026-10-30, pergunta 3 do §6).
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): o time olha só a estrutura da tabela (nomes e tipos de colunas) colada pelo dono, nunca linha de dado; nenhum agente lê o `.env` nem conecta no MySQL.
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): a E3.2 e a E3.3 escrevem na worktree local sem push; o commit e o push vão com a E2.1.
- Regras invioláveis do CLAUDE.md: BusinessMap e Acelerato nunca se misturam; nenhuma métrica individual; percentis 50/85/95 em janela de 12 semanas; abaixo de 20 itens não publica; carga incremental sem sobrescrever histórico; todo cálculo pela biblioteca compartilhada.
- O dono pediu para reduzir o uso de CPU: nada de testes ou comandos pesados nesta etapa.

## Fora do escopo
- "E1.1 (dono): validar o plano; depois dele, as etapas de código (coletor) entram neste pedido." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): mudança da regra do CLAUDE.md (Acelerato pela tabela MySQL do time de ciência de dados, só leitura) junto com o commit, o review e o PR dos documentos da E3.2 e da E3.3 para a develop." · etapa de outra delegação; continua no pedido
- "E3.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056` e branch `docs/056-acelerato-discovery` a partir da `develop`, com push, sem commit e sem testes (onde a E3.2 e a E3.3 escrevem)." · etapa de outra delegação; feita em parte (worktree e branch locais em 11141d7; push com a E2.1)
- "E3.1 (dono): rodar no terminal a consulta só de estrutura da tabela (nomes e tipos das colunas e total de linhas, sem nenhuma linha de dado) e colar a saída; contar, se quiser, quais painéis o dash atual do Acelerato tem e de onde vem cada número." · etapa de outra delegação; feita (estrutura na seção "Estrutura da tabela" do pedido)
- "E3.3 (security-engineer): modelo de ameaças da fonte MySQL (usuário só leitor, credencial no .env, colunas de pessoa barradas na fronteira por lista fechada), em paralelo à E3.2, em docs, sem commit." · etapa de outra delegação; feita (docs/security/056-acelerato-mysql-ameacas.md na worktree, sem commit)
- Editar a ADR 0013, o data-model ou o metabase-acelerato-configuracao (só proposta de texto no plano); código; commit, push ou PR; ler ou editar o `.env`; conectar no MySQL; o quadro e o arquivo do pedido; outras worktrees.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-056/docs/architecture/features/056-acelerato-mysql.md`
- PQ-2 (cmd): `grep -c -e ticket_key -e sla_r_violado -e data_atualizacao /home/rodrigoisensee/MetricasDSPD-056/docs/architecture/features/056-acelerato-mysql.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
