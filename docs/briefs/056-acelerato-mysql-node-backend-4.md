Agente destino: forge:node-backend
Pedido: 056-acelerato-mysql
Tipo: codigo
Branch: feature/056-coletor-acelerato   Base: develop   Base-sha: 11141d7516b7a71418b3ec069473e3449453fe81
Etapa: codigo   Cobre: E4.6

## Objetivo
Implementar a F2 do coletor do Acelerato (normalizador, projetor e as métricas de sustentação que já saem do dado), para o painel de sustentação mostrar dado real em 2026-11-02 (pedido 056, E4.6, K-190). Worktree `/home/rodrigoisensee/MetricasDSPD-056c`, branch `feature/056-coletor-acelerato`, base 11141d7516b7a71418b3ec069473e3449453fe81; ponta da F1 ed631c09ad3cdaf0406560ff0d4728ca14a6b7ca.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056/docs/architecture/features/056-acelerato-mysql.md`, §0 (decisões D-2 a D-16), §3 (as 12 métricas, com §3.1, §3.3, §3.5 e §3.6) e §4.3.
- `/home/rodrigoisensee/MetricasDSPD-056c/docs/architecture/data-model.md` §4 (`dim_chamado`, `dim_chamado_versao`, `vw_populacao_sssc`, versões de critério D-7 e D-10).
- `/home/rodrigoisensee/MetricasDSPD-056c/docs/qa/056-coletor-plano-de-testes.md`, os casos da F2.
- `/home/rodrigoisensee/MetricasDSPD-056c/server/src/modulos/acelerato/` (a F1 que você estende) e a biblioteca compartilhada de cálculo (`packages/metricas` ou onde o projeto a mantém) só para usar, sem mudar.

## Entregar
- "E4.6 (node-backend): F2 (normalizador e projetor; S2, S4, S8, S9 tempo, S10, S12, contagem da S3, S1 com dado real, marcas da D-7 e da D-10, reconciliação de 1%), com testes; commit e push." (E4.6)
- (E4.6) Normalizador e projetor em `/home/rodrigoisensee/MetricasDSPD-056c/server/src/modulos/acelerato/`: do staging para `dim_chamado_versao` e `dim_chamado` (versão nova quando o hash muda, nada sobrescrito), com fuso, natureza e campos por nome como a §3 do plano; o veredito de SLA da §3.1 (D-2) e o `com_agente` vindo do staging.
- (E4.6) As métricas da F2 do plano: S2, S4, S8, S9 (só tempo), S10, S12, a contagem da S3 e a S1 com dado real, todas calculadas pela biblioteca compartilhada (T2.5: percentis 50/85/95, janela móvel de 12 semanas, abaixo de 20 itens não publica), servidas pela API que o painel de sustentação já lê, no lugar do mock dessa fonte.
- (E4.6) As marcas da D-7 (tempo por etapa da ferramenta) e da D-10 (S8 pelo campo dos 90 dias) registradas em `ref_versao_criterio` com data, para os gráficos marcarem (T2.6).
- (E4.6) Reconciliação de 1% contra o dash atual (D-6) como verificação escrita: consulta ou script que compara as contagens agregadas do painel novo com os números agregados do dash que o dono informar na carga inicial, sem dado de pessoa nem o código do dash.
- (E4.6) Testes dos casos da F2 do plano de testes, com a fixture sintética; nenhum teste conecta no MySQL real.
- (E4.6) Retomada: a primeira tentativa desta etapa parou sem commit e deixou na worktree trabalho em andamento (veja `git -C /home/rodrigoisensee/MetricasDSPD-056c status --porcelain`: normalizador, projetor, reconciliação, critérios, migração 0017 e ajustes em métricas, referência e testes). Revise esse trabalho, complete o que falta e commite; não descarte nada sem motivo escrito no relatório.
- (E4.6) Commits no padrão do `docs/engineering/praticas.md`, com `Cartão: K-190`, `git add` explícito por caminho; mensagens gravadas antes pela ferramenta Write em `/tmp/claude-1000/commit-056-e46-<n>.txt` e usadas com `git commit -F <arquivo>`.
- (E4.6) Antes do push, `git -C /home/rodrigoisensee/MetricasDSPD-056c branch --show-current` deve dar `feature/056-coletor-acelerato`; push com `git -C /home/rodrigoisensee/MetricasDSPD-056c push origin HEAD:refs/heads/feature/056-coletor-acelerato`, sem PR.
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
- DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".
- DECISÃO DO DONO (2026-10-30): "A" (recorte para segunda 2026-11-02): dados reais do BusinessMap e do Acelerato na base, mais as métricas que já saem deles; a tela de times e as métricas que dependem de respostas pendentes ficam para depois. Complemento do dono: "quero as operacionais e as do acelerato so, tatico e estrategico ficam para depois".
- ADR 0013 (citada no pedido): o §4 está substituído pela ADR 0023; o painel não lê o Metabase.
- ADR 0023 (citada no pedido): fonte, driver, TLS e consultas já decididos e implementados na F1; a F2 não muda a leitura da origem.
- ADR 0020 (citada no pedido): nenhuma coluna de pessoa chega à base; o SLA sem agente usa só o booleano `com_agente`; nenhuma métrica por agente.
- ADR 0004 (citada no pedido): documento novo, se houver, leva frontmatter com `estado: proposta` ou `vigente`.
- Regras invioláveis do `CLAUDE.md` que esta fatia toca: BusinessMap e Acelerato nunca no mesmo cálculo; todo cálculo de tempo e percentil pela biblioteca compartilhada (T2.5); abaixo de 20 itens não publica; nenhuma métrica individual (o dash tem ranking e custo por agente, que não se reproduzem); mudança de critério com data e marca (T2.6).
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): segue o driver mariadb na F1; se o parecer de segurança recusar, volta ao mysql2 com a CA do DBA.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041): testes com `nice -n 19`, uma suíte por vez.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha; texto grande vai para arquivo pela ferramenta Write.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.
- NÃO tocar: o módulo `businessmap`, a biblioteca compartilhada de cálculo (só usar), os documentos de arquitetura e de segurança, o plano de testes, o `.env` e as worktrees 056, 052 e 052b.

## Fora do escopo
- "E1.1 (dono): validar o plano; depois dele, as etapas de código (coletor) entram neste pedido." · etapa de outra delegação; feita (plano validado pelo dono em 2026-10-30)
- "E2.0 (tech-lead): `pnpm install --frozen-lockfile` em prioridade baixa (nice) na worktree `/home/rodrigoisensee/MetricasDSPD-056` e no clone principal, e push da `docs/056-acelerato-discovery` e da `docs/jarvis-2026-10-23` (o pre-push exige as dependências), sem commit novo e sem testes além do pre-push." · etapa de outra delegação; feita
- "E2.1 (tech-lead): na worktree 056, mudança da regra do CLAUDE.md (Acelerato pela tabela MySQL do time de ciência de dados, só leitura) e commit dos quatro documentos do discovery (plano, modelo de ameaças, doc do dash, respostas), com push, sem PR." · etapa de outra delegação; feita (19275cb, conferida)
- "E2.2 (tech-lead): review da E2.1 em `docs/reviews/056-acelerato-discovery.md` (inclui conferir que nenhum documento traz linha de dado, nome de pessoa, endereço do servidor nem organização cliente), commit e push do parecer." · etapa de outra delegação; feita (e92a268, conferida)
- "E2.3 (qa-engineer): QA da E2.1 em `docs/qa/056-acelerato-discovery.md` (a mudança do CLAUDE.md não é isenta de QA), commit e push do parecer." · etapa de outra delegação; feita (31c5042, reprovado: A1)
- "E2.4 (tech-lead): PR da `docs/056-acelerato-discovery` para a develop (squash) e merge com os checks verdes e os pareceres em dia." · etapa de outra delegação; depois da E2.6
- "E2.5 (tech-lead): volta 1 do QA (A1 bloqueante de `docs/qa/056-acelerato-discovery.md`): no plano `docs/architecture/features/056-acelerato-mysql.md`, frontmatter `estado: vigente` e a linha "Estado:" dizendo que o plano foi validado pelo dono em 2026-10-30; commit e push na `docs/056-acelerato-discovery`." · etapa de outra delegação; feita (ca55f58)
- "E2.6 (qa-engineer): revalidação do QA depois da E2.5, no mesmo parecer `docs/qa/056-acelerato-discovery.md`, com o `## Achados` uma linha por achado; commit e push." · etapa de outra delegação; na fila, outra worktree (056)
- "E3.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056` e branch `docs/056-acelerato-discovery` a partir da `develop`, com push, sem commit e sem testes (onde a E3.2 e a E3.3 escrevem)." · etapa de outra delegação; feita
- "E3.1 (dono): rodar no terminal a consulta só de estrutura da tabela (nomes e tipos das colunas e total de linhas, sem nenhuma linha de dado) e colar a saída; contar, se quiser, quais painéis o dash atual do Acelerato tem e de onde vem cada número." · etapa de outra delegação; feita
- "E3.2 (software-architect): com a estrutura colada e o catálogo de métricas de sustentação do briefing, o mapeamento coluna da tabela → métrica (quais saem direto, quais precisam de cálculo, quais faltam), o desenho do coletor MySQL só leitura e incremental e o que muda na ADR 0013, no data-model §4 e no metabase-acelerato-configuracao; lista de perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita
- "E3.3 (security-engineer): modelo de ameaças da fonte MySQL (usuário só leitor, credencial no .env, colunas de pessoa barradas na fronteira por lista fechada), em paralelo à E3.2, em docs, sem commit." · etapa de outra delegação; feita
- "E3.4 (software-architect): atualizar o plano da E3.2 com as decisões D-2 a D-6 do dono e com `docs/integracao/acelerato-dash-atual.md` (o que o dash resolve das perguntas, o que não é reproduzido por ser individual, o que muda na reconciliação), encurtando as perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita
- "E3.5 (software-architect): atualizar o plano com as decisões D-7 a D-10 do dono e com `docs/integracao/acelerato-respostas-ciencia-de-dados.md` (filtro na origem por tipo DSPD - SSSC, campos de etapa para S5, S6, S7 e S11, `quantidadeDeVezes`, cobertura de 2,7% do campo dos 90 dias, separação das filas, `sla_r_tempo_min` negativo), marcando o plano como pronto para validação; em docs, sem commit." · etapa de outra delegação; feita
- "E3.6 (security-engineer): revisar o modelo de ameaças com as respostas (conta com só SELECT e SHOW VIEW na tabela e host aberto, TLS disponível sem CA, colunas e campos de pessoa novos em `raw`, `campos_personalizados`, `campos_personalizados_etapa` e `estatisticas.impedimentos`, clientes externos na tabela), em paralelo à E3.5; em docs, sem commit." · etapa de outra delegação; feita
- "E4.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056c` e branch `feature/056-coletor-acelerato` a partir da `develop`, com push e `pnpm install --frozen-lockfile` em prioridade baixa, sem commit novo e sem testes." · etapa de outra delegação; feita (worktree 056c)
- "E4.1 (software-architect): na worktree 056c, ADR 0023 (substitui a ADR 0013 §4; escolha do driver MySQL) e as edições da §5 do plano (ADR 0013 §4, `data-model.md`, `metabase-acelerato-configuracao.md`), com as listas fechadas de nomes, etapas, prioridades, tipo, equipes e organizações da §2.1 para o `ref_dominio`, sem commit." · etapa de outra delegação; feita (ADR 0023 e listas)
- "E4.2 (security-engineer): revisão das listas fechadas e da §2 do plano e parecer do driver MySQL (cadeia de suprimentos), em paralelo à E4.1, na worktree 056c, sem commit." · etapa de outra delegação; feita (parecer aprovado)
- "E4.3 (qa-engineer): plano de testes da F1 e da F2 (CA-1 a CA-10, fixture das 50 colunas com os marcadores de pessoa da §2.1, casos da §3.3), em paralelo à E4.1, na worktree 056c, sem commit." · etapa de outra delegação; feita (plano de testes e fixture)
- "E4.4 (tech-lead): commit e push da E4.1 a E4.3 na `feature/056-coletor-acelerato`." · etapa de outra delegação; feita (commits na branch)
- "E4.5 (node-backend): F1 do coletor (config, cliente MySQL com TLS fixado por impressão digital, filtro de origem, allow-list, staging, `ctl_coleta`, releitura semanal e saída do recorte), com testes; commit e push." · etapa de outra delegação; feita antes desta (F1, ed631c0)
- "E4.7 (security-engineer, tech-lead, qa-engineer): review de segurança, code review e QA da F1 e da F2; PR para a develop (squash) e merge pelo tech-lead." · etapa de outra delegação; depois desta
- "E4.8 (dono): carga inicial manual na máquina do dono e conferência do painel de sustentação com dado real." · etapa de outra delegação; depois da E4.7
- F3 (S5, S6, S7, S11, motivo da S9, quebras por prioridade, MTTA, fila), que depende da P-DS-19 e das D-11 a D-13; telas novas; conectar no MySQL real; ler ou editar o `.env`; PR; o quadro e o arquivo do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-056c log --format=%H ed631c09ad3cdaf0406560ff0d4728ca14a6b7ca..origin/feature/056-coletor-acelerato` · espera: linhas>=1
- PQ-2 (cmd): `nice -n 19 pnpm --dir /home/rodrigoisensee/MetricasDSPD-056c/server exec vitest run acelerato` · espera: rc=0
- PQ-3 (cmd): `nice -n 19 pnpm --dir /home/rodrigoisensee/MetricasDSPD-056c/server run typecheck` · espera: rc=0
- PQ-4 (cmd): `nice -n 19 pnpm --dir /home/rodrigoisensee/MetricasDSPD-056c/server exec eslint src/modulos/acelerato` · espera: rc=0
- PQ-5 (push): `git -C /home/rodrigoisensee/MetricasDSPD-056c ls-remote origin refs/heads/feature/056-coletor-acelerato` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-056c rev-parse HEAD`
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056c status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
