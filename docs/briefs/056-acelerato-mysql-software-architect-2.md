Agente destino: forge:software-architect
Pedido: 056-acelerato-mysql
Tipo: codigo
Branch: docs/056-acelerato-discovery   Base: develop   Base-sha: 11141d7516b7a71418b3ec069473e3449453fe81
Etapa: codigo   Cobre: E3.4

## Objetivo
Atualizar o plano do Acelerato com as decisões do dono D-2 a D-6 e com a documentação do dash atual (pedido 056, E3.4), antes da validação do dono. Worktree `/home/rodrigoisensee/MetricasDSPD-056`, plano `docs/architecture/features/056-acelerato-mysql.md` (proposta, sem commit).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/056-acelerato-mysql.md`: as linhas DECISÃO DO DONO, inclusive as do Histórico (D-2 a D-6 e as três do §6 do modelo de ameaças).
- `/home/rodrigoisensee/MetricasDSPD-056/docs/integracao/acelerato-dash-atual.md`: a documentação do dash colada pelo dono.
- `/home/rodrigoisensee/MetricasDSPD-056/docs/architecture/features/056-acelerato-mysql.md`: o plano a atualizar.

## Entregar
- "E3.4 (software-architect): atualizar o plano da E3.2 com as decisões D-2 a D-6 do dono e com `docs/integracao/acelerato-dash-atual.md` (o que o dash resolve das perguntas, o que não é reproduzido por ser individual, o que muda na reconciliação), encurtando as perguntas ao time de ciência de dados; em docs, sem commit." (E3.4)
- (E3.4) No plano `/home/rodrigoisensee/MetricasDSPD-056/docs/architecture/features/056-acelerato-mysql.md`, pela ferramenta Write ou Edit: registrar D-2 (veredito das colunas da ferramenta, normalizado como no dash §2.1), D-3 (tempos pela biblioteca a partir dos instantes; relógio da ferramenta só para reconciliação), D-4 (recorrente por categoria, limiar a definir na montagem do painel), D-5 (o dash já mostra S1 a S12; a §3.3 do briefing está desatualizada nesse ponto) e D-6 (reconciliação de 1% contra o dash, com a mesma população); usar o dash para fechar o que ele responde (fuso fixo BRT, fechado = data_pronto, tempo por etapa em `estatisticas.workflow.etapas[]` em segundos, reincidência pelo campo de 90 dias, filas nova e antiga pela organização, histórico de SLA até 2026-08 vindo da tabela antiga) e reclassificar as métricas que deixam de ficar pendentes; listar o que não é reproduzido por ser individual (ranking, filtro e custo por agente) e as diferenças esperadas na reconciliação (média em dias corridos no dash contra percentis em horas úteis aqui; exclusão de chamados sem agente no SLA do dash, que vira pergunta ao dono); encurtar a lista de perguntas ao time de ciência de dados, tirando as que o dash responde; mudar o frontmatter `estado` só se o plano já estiver pronto para validação (mantenha `proposta`).
- (E3.4) Em nenhum ponto copie linha de dado. O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- (E1, E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
- DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".
- ADR 0013 (citada no pedido): prevê o Acelerato por uma tabela no Metabase, só leitura, uma vez por dia (§4); a revisão para a fonte MySQL é proposta no plano, sem editar a ADR.
- ADR 0020 (citada no pedido): protege dado de pessoa: nenhuma coluna de pessoa chega à base; o que precisar de pessoa é calculado em memória e só o agregado é gravado.
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): o time olha só a estrutura da tabela e a documentação do dash colada pelo dono, nunca linha de dado; nenhum agente lê o `.env` nem conecta no MySQL.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha.
- Regras invioláveis do CLAUDE.md: BusinessMap e Acelerato nunca se misturam; nenhuma métrica individual; percentis 50/85/95 em janela de 12 semanas; abaixo de 20 itens não publica; carga incremental sem sobrescrever histórico; todo cálculo pela biblioteca compartilhada.

## Fora do escopo
- "E1.1 (dono): validar o plano; depois dele, as etapas de código (coletor) entram neste pedido." · etapa de outra delegação; continua no pedido
- "E2.0 (tech-lead): `pnpm install --frozen-lockfile` em prioridade baixa (nice) na worktree `/home/rodrigoisensee/MetricasDSPD-056` e no clone principal, e push da `docs/056-acelerato-discovery` e da `docs/jarvis-2026-10-23` (o pre-push exige as dependências), sem commit novo e sem testes além do pre-push." · etapa de outra delegação; em paralelo a esta
- "E2.1 (tech-lead): mudança da regra do CLAUDE.md (Acelerato pela tabela MySQL do time de ciência de dados, só leitura) junto com o commit, o review e o PR dos documentos da E3.2 e da E3.3 para a develop." · etapa de outra delegação; continua no pedido
- "E3.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056` e branch `docs/056-acelerato-discovery` a partir da `develop`, com push, sem commit e sem testes (onde a E3.2 e a E3.3 escrevem)." · etapa de outra delegação; feita em parte (worktree e branch locais em 11141d7; push nesta E2.0)
- "E3.1 (dono): rodar no terminal a consulta só de estrutura da tabela (nomes e tipos das colunas e total de linhas, sem nenhuma linha de dado) e colar a saída; contar, se quiser, quais painéis o dash atual do Acelerato tem e de onde vem cada número." · etapa de outra delegação; feita (estrutura na seção "Estrutura da tabela" do pedido)
- "E3.2 (software-architect): com a estrutura colada e o catálogo de métricas de sustentação do briefing, o mapeamento coluna da tabela → métrica (quais saem direto, quais precisam de cálculo, quais faltam), o desenho do coletor MySQL só leitura e incremental e o que muda na ADR 0013, no data-model §4 e no metabase-acelerato-configuracao; lista de perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita (plano proposto em docs/architecture/features/056-acelerato-mysql.md, sem commit)
- "E3.3 (security-engineer): modelo de ameaças da fonte MySQL (usuário só leitor, credencial no .env, colunas de pessoa barradas na fronteira por lista fechada), em paralelo à E3.2, em docs, sem commit." · etapa de outra delegação; feita (docs/security/056-acelerato-mysql-ameacas.md, sem commit)
- Editar a ADR 0013, o data-model ou o metabase-acelerato-configuracao; código; commit, push ou PR; ler ou editar o `.env`; conectar no MySQL; o quadro e o arquivo do pedido; outras worktrees.

## Pronto quando
- PQ-1 (cmd): `grep -c D-6 /home/rodrigoisensee/MetricasDSPD-056/docs/architecture/features/056-acelerato-mysql.md` · espera: linhas=1
- PQ-2 (cmd): `grep -c -i acelerato-dash-atual /home/rodrigoisensee/MetricasDSPD-056/docs/architecture/features/056-acelerato-mysql.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
