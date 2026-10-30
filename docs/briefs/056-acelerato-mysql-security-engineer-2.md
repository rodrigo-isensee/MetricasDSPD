Agente destino: forge:security-engineer
Pedido: 056-acelerato-mysql
Tipo: codigo
Branch: docs/056-acelerato-discovery   Base: develop   Base-sha: 11141d7516b7a71418b3ec069473e3449453fe81
Etapa: codigo   Cobre: E3.6

## Objetivo
Revisar o modelo de ameaças do Acelerato com as respostas do time de ciência de dados (pedido 056, E3.6), em paralelo ao fechamento do plano. Worktree `/home/rodrigoisensee/MetricasDSPD-056`, documento `docs/security/056-acelerato-mysql-ameacas.md` (sem commit).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056/docs/integracao/acelerato-respostas-ciencia-de-dados.md`: em especial os itens 1, 3, 10, 11, 13, 14, 15 e 17.
- `/home/rodrigoisensee/MetricasDSPD-056/docs/security/056-acelerato-mysql-ameacas.md`: o modelo a revisar.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/056-acelerato-mysql.md`: as linhas DECISÃO DO DONO do Histórico (credencial atual por enquanto, coleta só na máquina do dono, cálculo em memória).

## Entregar
- "E3.6 (security-engineer): revisar o modelo de ameaças com as respostas (conta com só SELECT e SHOW VIEW na tabela e host aberto, TLS disponível sem CA, colunas e campos de pessoa novos em `raw`, `campos_personalizados`, `campos_personalizados_etapa` e `estatisticas.impedimentos`, clientes externos na tabela), em paralelo à E3.5; em docs, sem commit." (E3.6)
- (E3.6) No modelo `/home/rodrigoisensee/MetricasDSPD-056/docs/security/056-acelerato-mysql-ameacas.md`, pela ferramenta Write ou Edit: rever M1 (a conta tem só SELECT e SHOW VIEW na tabela, host aberto; o risco que sobra e o pedido ao DBA de restringir host e criar view), M3 (TLS disponível, `require_secure_transport` desligado, CA desconhecida: o coletor exige TLS e verifica o certificado; sem CA o que fazer), M4 (lista fechada atualizada com as colunas e campos de pessoa novos: `raw`, "Acelerato - Atendente", "Acelerato - Solicitante", Cargo, Bairro, "Complemento do Problema", `campos_personalizados_etapa.valor` livre, `estatisticas.impedimentos.usuarios`), M6 (a tabela atende o dash e a carga roda o dia todo; consulta só da população SSSC, cerca de 7 mil linhas), o filtro na origem por causa dos clientes externos e os limites do servidor (sem tempo máximo de consulta); atualizar as perguntas que ainda faltam e os casos de abuso afetados.
- (E3.6) Em nenhum ponto copie linha de dado nem nome de organização cliente. O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- (E1, E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
- DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".
- ADR 0013 (citada no pedido): prevê o Acelerato por uma tabela no Metabase, só leitura, uma vez por dia (§4); a revisão para a fonte MySQL é proposta no plano, sem editar a ADR.
- ADR 0020 (citada no pedido): protege dado de pessoa: nenhuma coluna de pessoa chega à base; o que precisar de pessoa é calculado em memória e só o agregado é gravado.
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): o time olha só a estrutura da tabela, a documentação do dash e as respostas coladas pelo dono, nunca linha de dado; nenhum agente lê o `.env`.
- Regras invioláveis do CLAUDE.md: BusinessMap e Acelerato nunca se misturam; nenhuma métrica individual; percentis 50/85/95 em janela de 12 semanas; abaixo de 20 itens não publica; carga incremental sem sobrescrever histórico; todo cálculo pela biblioteca compartilhada.
- O dono pediu para reduzir o uso de CPU: nada de testes ou comandos pesados.

## Fora do escopo
- "E1.1 (dono): validar o plano; depois dele, as etapas de código (coletor) entram neste pedido." · etapa de outra delegação; continua no pedido
- "E2.0 (tech-lead): `pnpm install --frozen-lockfile` em prioridade baixa (nice) na worktree `/home/rodrigoisensee/MetricasDSPD-056` e no clone principal, e push da `docs/056-acelerato-discovery` e da `docs/jarvis-2026-10-23` (o pre-push exige as dependências), sem commit novo e sem testes além do pre-push." · etapa de outra delegação; feita (install em nice e push das duas branches)
- "E2.1 (tech-lead): mudança da regra do CLAUDE.md (Acelerato pela tabela MySQL do time de ciência de dados, só leitura) junto com o commit, o review e o PR dos documentos da E3.2 e da E3.3 para a develop." · etapa de outra delegação; continua no pedido
- "E3.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056` e branch `docs/056-acelerato-discovery` a partir da `develop`, com push, sem commit e sem testes (onde a E3.2 e a E3.3 escrevem)." · etapa de outra delegação; feita (worktree e branch, push na E2.0)
- "E3.1 (dono): rodar no terminal a consulta só de estrutura da tabela (nomes e tipos das colunas e total de linhas, sem nenhuma linha de dado) e colar a saída; contar, se quiser, quais painéis o dash atual do Acelerato tem e de onde vem cada número." · etapa de outra delegação; feita (estrutura na seção "Estrutura da tabela" do pedido)
- "E3.2 (software-architect): com a estrutura colada e o catálogo de métricas de sustentação do briefing, o mapeamento coluna da tabela → métrica (quais saem direto, quais precisam de cálculo, quais faltam), o desenho do coletor MySQL só leitura e incremental e o que muda na ADR 0013, no data-model §4 e no metabase-acelerato-configuracao; lista de perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita (plano proposto, sem commit)
- "E3.3 (security-engineer): modelo de ameaças da fonte MySQL (usuário só leitor, credencial no .env, colunas de pessoa barradas na fronteira por lista fechada), em paralelo à E3.2, em docs, sem commit." · etapa de outra delegação; feita (modelo de ameaças, sem commit)
- "E3.4 (software-architect): atualizar o plano da E3.2 com as decisões D-2 a D-6 do dono e com `docs/integracao/acelerato-dash-atual.md` (o que o dash resolve das perguntas, o que não é reproduzido por ser individual, o que muda na reconciliação), encurtando as perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita (plano com D-2 a D-6 e a doc do dash, sem commit)
- "E3.5 (software-architect): atualizar o plano com as decisões D-7 a D-10 do dono e com `docs/integracao/acelerato-respostas-ciencia-de-dados.md` (filtro na origem por tipo DSPD - SSSC, campos de etapa para S5, S6, S7 e S11, `quantidadeDeVezes`, cobertura de 2,7% do campo dos 90 dias, separação das filas, `sla_r_tempo_min` negativo), marcando o plano como pronto para validação; em docs, sem commit." · etapa de outra delegação; em paralelo a esta
- Editar o plano, a ADR 0013, o data-model ou o metabase-acelerato-configuracao; código; commit, push ou PR; ler ou editar o `.env`; conectar no MySQL; o quadro e o arquivo do pedido; outras worktrees.

## Pronto quando
- PQ-1 (cmd): `grep -c -i acelerato-respostas-ciencia-de-dados /home/rodrigoisensee/MetricasDSPD-056/docs/security/056-acelerato-mysql-ameacas.md` · espera: linhas=1
- PQ-2 (cmd): `grep -c -i 'Complemento do Problema' /home/rodrigoisensee/MetricasDSPD-056/docs/security/056-acelerato-mysql-ameacas.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
