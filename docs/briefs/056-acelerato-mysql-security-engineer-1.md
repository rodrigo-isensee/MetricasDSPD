Agente destino: forge:security-engineer
Pedido: 056-acelerato-mysql
Tipo: seguranca
Branch: docs/056-acelerato-discovery   Base: develop   Base-sha: 11141d7516b7a71418b3ec069473e3449453fe81
Etapa: codigo   Cobre: E3.3

## Objetivo
Modelo de ameaças da nova fonte do Acelerato, a tabela MySQL mantida pelo time de ciência de dados (pedido 056, E3.3), em paralelo ao desenho da E3.2, antes de qualquer código. Worktree `/home/rodrigoisensee/MetricasDSPD-056`, branch local `docs/056-acelerato-discovery` (ainda sem push: o push vai com a E2.1).

## Ler
- `docs/security/adr-0020-protecao-de-pessoa.md` e `docs/security/k084-coletor-allow-list.md`, na worktree: a proteção de pessoa e a allow-list que já valem para o coletor.
- `docs/integracao/metabase-acelerato-configuracao.md` §1 e §2, na worktree: o desenho anterior do Acelerato pelo Metabase.
- `docs/briefing-execucao-metricas.md` §3.2 (Acelerato), na worktree.
- Regras invioláveis do `CLAUDE.md` do projeto, só a linha das credenciais e do Acelerato.

## Entregar
- "E3.3 (security-engineer): modelo de ameaças da fonte MySQL (usuário só leitor, credencial no .env, colunas de pessoa barradas na fronteira por lista fechada), em paralelo à E3.2, em docs, sem commit." (E3.3)
- (E3.3) Documento novo `/home/rodrigoisensee/MetricasDSPD-056/docs/security/056-acelerato-mysql-ameacas.md` pela ferramenta Write, no formato dos modelos de ameaças do projeto: ativos (credencial do MySQL, dados de pessoa da tabela, base analítica), ameaças e controles para: usuário de banco só leitor com SELECT só na tabela necessária; credencial só no `.env`, fora de log e de mensagem de erro; conexão com TLS; lista fechada de colunas lidas na fronteira (nenhum nome, e-mail, `usuarioKey`, título ou descrição chega ao staging), com a lista provisória das colunas a barrar e a ressalva de que a lista final depende da estrutura da tabela que o dono vai colar; consulta só SELECT, parametrizada, sem SQL montado com texto de fora; o que muda em relação ao desenho pelo Metabase; perguntas ao time de ciência de dados que sejam de segurança.
- (E3.3) O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- (E1, E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
- DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".
- ADR 0013 (citada no pedido): prevê o Acelerato por uma tabela no Metabase, só leitura, uma vez por dia (§4); a revisão dela para a fonte MySQL é da E3.2, e este modelo de ameaças a alimenta.
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): o time olha só a estrutura da tabela (nomes e tipos de colunas) colada pelo dono, nunca linha de dado; nenhum agente lê o `.env` nem conecta no MySQL.
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): a E3.2 e a E3.3 escrevem na worktree local sem push; o commit e o push vão com a E2.1.
- O dono pediu para reduzir o uso de CPU: nada de testes, `pnpm install` ou comandos pesados nesta etapa.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha.

## Fora do escopo
- "E1.1 (dono): validar o plano; depois dele, as etapas de código (coletor) entram neste pedido." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): mudança da regra do CLAUDE.md (Acelerato pela tabela MySQL do time de ciência de dados, só leitura) junto com o commit, o review e o PR dos documentos da E3.2 e da E3.3 para a develop." · etapa de outra delegação; continua no pedido
- "E3.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056` e branch `docs/056-acelerato-discovery` a partir da `develop`, com push, sem commit e sem testes (onde a E3.2 e a E3.3 escrevem)." · etapa de outra delegação; feita em parte (worktree e branch locais em 11141d7; push com a E2.1)
- "E3.1 (dono): rodar no terminal a consulta só de estrutura da tabela (nomes e tipos das colunas e total de linhas, sem nenhuma linha de dado) e colar a saída; contar, se quiser, quais painéis o dash atual do Acelerato tem e de onde vem cada número." · etapa de outra delegação; continua no pedido
- "E3.2 (software-architect): com a estrutura colada e o catálogo de métricas de sustentação do briefing, o mapeamento coluna da tabela → métrica (quais saem direto, quais precisam de cálculo, quais faltam), o desenho do coletor MySQL só leitura e incremental e o que muda na ADR 0013, no data-model §4 e no metabase-acelerato-configuracao; lista de perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; continua no pedido
- Commit, push ou PR; ler ou editar o `.env`; conectar no MySQL ou no Metabase; código; o quadro e o arquivo do pedido; outras worktrees.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-056/docs/security/056-acelerato-mysql-ameacas.md`
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 status --porcelain` · espera: igual '?? docs/security/056-acelerato-mysql-ameacas.md'

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
