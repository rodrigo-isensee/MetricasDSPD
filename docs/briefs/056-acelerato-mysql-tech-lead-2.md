Agente destino: forge:tech-lead
Pedido: 056-acelerato-mysql
Tipo: codigo
Branch: docs/056-acelerato-discovery   Base: develop   Base-sha: 11141d7516b7a71418b3ec069473e3449453fe81
Etapa: codigo   Cobre: E2.0

## Objetivo
Instalar as dependências e enviar ao GitHub as branches que o pre-push barrou (pedido 056, E2.0), agora que o dono liberou CPU ("pode agora"). Worktree `/home/rodrigoisensee/MetricasDSPD-056` (branch `docs/056-acelerato-discovery`, ainda só local) e clone principal `/home/rodrigoisensee/Metricas/MetricasDSPD` (branch `docs/jarvis-2026-10-23`, commits locais à frente do origin).

## Ler
- Nada além deste brief.

## Entregar
- "E2.0 (tech-lead): `pnpm install --frozen-lockfile` em prioridade baixa (nice) na worktree `/home/rodrigoisensee/MetricasDSPD-056` e no clone principal, e push da `docs/056-acelerato-discovery` e da `docs/jarvis-2026-10-23` (o pre-push exige as dependências), sem commit novo e sem testes além do pre-push." (E2.0)
- (E2.0) `nice -n 19 pnpm -C /home/rodrigoisensee/MetricasDSPD-056 install --frozen-lockfile` e `nice -n 19 pnpm -C /home/rodrigoisensee/Metricas/MetricasDSPD install --frozen-lockfile`, um depois do outro; se o lockfile recusar, pare e relate a mensagem literal, sem atualizar o lockfile.
- (E2.0) Push sem commit novo: `git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/docs/056-acelerato-discovery` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD push origin HEAD:refs/heads/docs/jarvis-2026-10-23`; antes, `git branch --show-current` em cada um (espera `docs/056-acelerato-discovery` e `docs/jarvis-2026-10-23`). Os arquivos não rastreados da worktree 056 (documentos do discovery) não entram: só a branch vai ao origin.
- (E1, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
- DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".
- ADR 0013 (citada no pedido): prevê o Acelerato por uma tabela no Metabase, só leitura, uma vez por dia (§4); a revisão para a fonte MySQL é proposta no plano, sem editar a ADR.
- ADR 0020 (citada no pedido): protege dado de pessoa: nenhuma coluna de pessoa chega à base; o que precisar de pessoa é calculado em memória e só o agregado é gravado.
- Erro recorrente deste destino (forge-check, 30 dias): base em 11 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 10 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 5 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): o time olha só a estrutura da tabela e a documentação do dash colada pelo dono, nunca linha de dado; nenhum agente lê o `.env` nem conecta no MySQL.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha.
- DECISÃO DO DONO (2026-10-30), no Histórico do pedido: "pode agora" (CPU liberada para o pnpm install e o push); a instalação roda em prioridade baixa (nice 19), uma de cada vez.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa do pre-push: pare e relate a mensagem literal.

## Fora do escopo
- "E1.1 (dono): validar o plano; depois dele, as etapas de código (coletor) entram neste pedido." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): mudança da regra do CLAUDE.md (Acelerato pela tabela MySQL do time de ciência de dados, só leitura) junto com o commit, o review e o PR dos documentos da E3.2 e da E3.3 para a develop." · etapa de outra delegação; continua no pedido
- "E3.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056` e branch `docs/056-acelerato-discovery` a partir da `develop`, com push, sem commit e sem testes (onde a E3.2 e a E3.3 escrevem)." · etapa de outra delegação; feita em parte (worktree e branch locais em 11141d7; push nesta E2.0)
- "E3.1 (dono): rodar no terminal a consulta só de estrutura da tabela (nomes e tipos das colunas e total de linhas, sem nenhuma linha de dado) e colar a saída; contar, se quiser, quais painéis o dash atual do Acelerato tem e de onde vem cada número." · etapa de outra delegação; feita (estrutura na seção "Estrutura da tabela" do pedido)
- "E3.2 (software-architect): com a estrutura colada e o catálogo de métricas de sustentação do briefing, o mapeamento coluna da tabela → métrica (quais saem direto, quais precisam de cálculo, quais faltam), o desenho do coletor MySQL só leitura e incremental e o que muda na ADR 0013, no data-model §4 e no metabase-acelerato-configuracao; lista de perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita (plano proposto em docs/architecture/features/056-acelerato-mysql.md, sem commit)
- "E3.3 (security-engineer): modelo de ameaças da fonte MySQL (usuário só leitor, credencial no .env, colunas de pessoa barradas na fronteira por lista fechada), em paralelo à E3.2, em docs, sem commit." · etapa de outra delegação; feita (docs/security/056-acelerato-mysql-ameacas.md, sem commit)
- "E3.4 (software-architect): atualizar o plano da E3.2 com as decisões D-2 a D-6 do dono e com `docs/integracao/acelerato-dash-atual.md` (o que o dash resolve das perguntas, o que não é reproduzido por ser individual, o que muda na reconciliação), encurtando as perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; em paralelo a esta
- Commit, PR, testes além do pre-push, editar arquivo versionado ou não rastreado; ler ou editar o `.env`; conectar no MySQL; o quadro e o arquivo do pedido.

## Pronto quando
- PQ-1 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-056/node_modules/.pnpm` · espera: rc=0
- PQ-2 (push): `git -C /home/rodrigoisensee/MetricasDSPD-056 ls-remote origin refs/heads/docs/056-acelerato-discovery` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-056 rev-parse HEAD`
- PQ-3 (push): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD ls-remote origin refs/heads/docs/jarvis-2026-10-23` igual ao `git -C /home/rodrigoisensee/Metricas/MetricasDSPD rev-parse HEAD`

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
