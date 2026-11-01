Agente destino: forge:tech-lead
Pedido: 056-acelerato-mysql
Tipo: merge
Branch: docs/056-acelerato-discovery   Base: develop   Base-sha: 11141d7516b7a71418b3ec069473e3449453fe81
Etapa: merge-integracao   Cobre: E2.1

## Objetivo
Levar à develop o discovery validado do Acelerato pela tabela MySQL (pedido 056, E2.1, K-189): o plano, o modelo de ameaças, a documentação do dash e as respostas do time de ciência de dados, com a regra do `CLAUDE.md` ajustada à decisão do dono. Worktree `/home/rodrigoisensee/MetricasDSPD-056`, branch `docs/056-acelerato-discovery`, base 11141d7516b7a71418b3ec069473e3449453fe81.

## Ler
- Na worktree, os quatro documentos não rastreados: `docs/architecture/features/056-acelerato-mysql.md`, `docs/security/056-acelerato-mysql-ameacas.md`, `docs/integracao/acelerato-dash-atual.md` e `docs/integracao/acelerato-respostas-ciencia-de-dados.md`.
- `/home/rodrigoisensee/MetricasDSPD-056/CLAUDE.md`, a linha 23 (credenciais e Acelerato).
- Seções de commits e de pull request do `docs/engineering/praticas.md`, na worktree.

## Entregar
- "E2.1 (tech-lead): mudança da regra do CLAUDE.md (Acelerato pela tabela MySQL do time de ciência de dados, só leitura) junto com o commit, o review e o PR dos documentos da E3.2 e da E3.3 para a develop." (E2.1)
- (E2.1) Em `/home/rodrigoisensee/MetricasDSPD-056/CLAUDE.md`, linha 23: trocar "e-mail e token da API do Acelerato" por "usuário e senha do MySQL do Acelerato" e trocar o trecho que começa em "O Acelerato é lido somente pela sua API pública" e termina em "nunca chegam ao staging nem a outra tabela." por: "O Acelerato é lido somente da tabela MySQL mantida pelo time de ciência de dados (cópia do Acelerato), só com SELECT e com usuário de banco só leitor (nada é escrito no MySQL nem no Acelerato). Essa tabela traz dados de pessoa (nome, e-mail, ids de usuário) e texto livre (título, descrição, `raw`, campos livres): o coletor aplica uma lista fechada de colunas e campos (allow-list) na própria consulta e na fronteira, e nome, e-mail, `usuarioKey`, ids de agente e de solicitante, descrição e título do chamado nunca chegam ao staging nem a outra tabela." (o resto da linha, sobre o `dspd_api`, fica igual).
- (E2.1) Parecer de review do discovery em `/home/rodrigoisensee/MetricasDSPD-056/docs/reviews/056-acelerato-discovery.md` pela ferramenta Write: frontmatter com `pedido: 056-acelerato-mysql` e `commit:` do commit dos documentos, veredito e o bloco `## Achados` no formato que o `forge-check pr` lê (cada achado com arquivo:linha e até 300 caracteres); conferir que nenhum documento traz linha de dado, nome de pessoa, endereço ou porta do servidor, nem nome de organização cliente. O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- (E2.1) Commits no padrão do `docs/engineering/praticas.md`, com `Cartão: K-189`, `git add` por caminho, mensagem gravada antes pela ferramenta Write em `/tmp/claude-1000/commit-056-e21.txt` e usada com `git commit -F <arquivo>`: um commit com os quatro documentos e o `CLAUDE.md`, outro com o parecer.
- (E2.1) Na worktree, `forge-check pr 056-acelerato-mysql` limpo; push com `git push origin HEAD:refs/heads/docs/056-acelerato-discovery`; PR com `gh pr create --base develop --head docs/056-acelerato-discovery`, corpo gravado pela ferramenta Write em `/tmp/claude-1000/pr-056.md` e passado com `--body-file` (o que entra, a mudança da regra do CLAUDE.md com a decisão do dono "B", o parecer, QA isento por ser só documentação); checks com `gh pr checks docs/056-acelerato-discovery --watch`; verdes, `gh pr merge docs/056-acelerato-discovery --squash`; vermelho ou recusa, pare e relate a mensagem literal.
- (E1, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
- DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".
- ADR 0013 (citada no pedido): o §4 (Acelerato pelo Metabase) será substituído pela ADR 0023 na etapa seguinte; aqui o plano só propõe o texto.
- ADR 0020 (citada no pedido): nenhuma coluna de pessoa chega à base; o que precisar de pessoa é calculado em memória e só o agregado é gravado.
- Erro recorrente deste destino (forge-check, 30 dias): base em 11 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 10 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 5 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): o time olha só a estrutura da tabela, a documentação do dash e as respostas coladas pelo dono, nunca linha de dado; nenhum agente lê o `.env`.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha; texto grande vai para arquivo pela ferramenta Write.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; check vermelho ou recusa de hook: pare e relate a mensagem literal.
- R-MAIN: o PR vai só para a `develop`.

## Fora do escopo
- "E1.1 (dono): validar o plano; depois dele, as etapas de código (coletor) entram neste pedido." · etapa de outra delegação; feita (plano validado pelo dono em 2026-10-30)
- "E2.0 (tech-lead): `pnpm install --frozen-lockfile` em prioridade baixa (nice) na worktree `/home/rodrigoisensee/MetricasDSPD-056` e no clone principal, e push da `docs/056-acelerato-discovery` e da `docs/jarvis-2026-10-23` (o pre-push exige as dependências), sem commit novo e sem testes além do pre-push." · etapa de outra delegação; feita
- "E3.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056` e branch `docs/056-acelerato-discovery` a partir da `develop`, com push, sem commit e sem testes (onde a E3.2 e a E3.3 escrevem)." · etapa de outra delegação; feita
- "E3.1 (dono): rodar no terminal a consulta só de estrutura da tabela (nomes e tipos das colunas e total de linhas, sem nenhuma linha de dado) e colar a saída; contar, se quiser, quais painéis o dash atual do Acelerato tem e de onde vem cada número." · etapa de outra delegação; feita
- "E3.2 (software-architect): com a estrutura colada e o catálogo de métricas de sustentação do briefing, o mapeamento coluna da tabela → métrica (quais saem direto, quais precisam de cálculo, quais faltam), o desenho do coletor MySQL só leitura e incremental e o que muda na ADR 0013, no data-model §4 e no metabase-acelerato-configuracao; lista de perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita
- "E3.3 (security-engineer): modelo de ameaças da fonte MySQL (usuário só leitor, credencial no .env, colunas de pessoa barradas na fronteira por lista fechada), em paralelo à E3.2, em docs, sem commit." · etapa de outra delegação; feita
- "E3.4 (software-architect): atualizar o plano da E3.2 com as decisões D-2 a D-6 do dono e com `docs/integracao/acelerato-dash-atual.md` (o que o dash resolve das perguntas, o que não é reproduzido por ser individual, o que muda na reconciliação), encurtando as perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita
- "E3.5 (software-architect): atualizar o plano com as decisões D-7 a D-10 do dono e com `docs/integracao/acelerato-respostas-ciencia-de-dados.md` (filtro na origem por tipo DSPD - SSSC, campos de etapa para S5, S6, S7 e S11, `quantidadeDeVezes`, cobertura de 2,7% do campo dos 90 dias, separação das filas, `sla_r_tempo_min` negativo), marcando o plano como pronto para validação; em docs, sem commit." · etapa de outra delegação; feita (plano pronto-para-validacao)
- "E3.6 (security-engineer): revisar o modelo de ameaças com as respostas (conta com só SELECT e SHOW VIEW na tabela e host aberto, TLS disponível sem CA, colunas e campos de pessoa novos em `raw`, `campos_personalizados`, `campos_personalizados_etapa` e `estatisticas.impedimentos`, clientes externos na tabela), em paralelo à E3.5; em docs, sem commit." · etapa de outra delegação; feita (modelo de ameaças revisto)
- Editar o plano, o modelo de ameaças ou os documentos do dono (achados viram parecer, não correção); ADR 0023 e código do coletor; ler ou editar o `.env`; conectar no MySQL; o quadro e o arquivo do pedido; outras worktrees.

## Pronto quando
- PQ-1 (pr): `gh pr list --head docs/056-acelerato-discovery --state all --json number,state` · espera: contém 'MERGED'
- PQ-2 (merge): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD merge-base --is-ancestor <mergeCommit> origin/develop` · espera: rc=0 (troque <mergeCommit> pelo sha do squash)
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/develop:CLAUDE.md` · espera: contém 'tabela MySQL mantida pelo time de ciência de dados'

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
