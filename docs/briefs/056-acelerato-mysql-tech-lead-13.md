Agente destino: forge:tech-lead
Pedido: 056-acelerato-mysql
Tipo: codigo
Branch: feature/056-coletor-acelerato   Base: develop   Base-sha: 11141d7516b7a71418b3ec069473e3449453fe81
Etapa: merge-integracao   Cobre: E4.11

## Objetivo
Commitar a E4.16 e levar o coletor do Acelerato (F1 e F2) para a `develop` em PRs com os checks verdes e os pareceres em dia, para a carga inicial (E4.8) seguir (pedido 056, E4.11, K-190). Worktree `/home/rodrigoisensee/MetricasDSPD-056c`, branch `feature/056-coletor-acelerato`, ponta 4180ce9cd2d8988bbedf4701ea88bf10f99b53d8, com a E4.16 sem commit.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056c/docs/reviews/056-coletor-f1-f2.md` (o A3: dois PRs, F1 até ed631c0 e F2 com o resto), `/home/rodrigoisensee/MetricasDSPD-056c/docs/security/056-coletor-f1-f2.md` e `/home/rodrigoisensee/MetricasDSPD-056c/docs/qa/056-coletor-f1-f2.md`, vereditos.
- Seção de pull request e o teto de linhas do `docs/engineering/praticas.md`, na worktree.

## Entregar
- "E4.11 (tech-lead): PR da `feature/056-coletor-acelerato` para a develop (squash) e merge com os checks verdes e os pareceres em dia." (E4.11)
- (E4.11) Commit da E4.16 (`docs/architecture/fontes/acelerato-listas.md`) com `Cartão: K-190`, `git add` explícito por caminho, mensagem gravada antes pela ferramenta Write em `/tmp/claude-1000/commit-056-e411.txt` e usada com `git commit -F <arquivo>`; push com `git push origin HEAD:refs/heads/feature/056-coletor-acelerato`.
- (E4.11) Pelo A3 do review: PR 1 com a F1 (uma branch nova a partir de ed631c0) e PR 2 com o resto da `feature/056-coletor-acelerato`, depois que o PR 1 entrar; cada um com `forge-check pr 056-acelerato-mysql` verde, corpo no padrão do `praticas.md` (cita K-190, as etapas, review aprovado em 414533f, segurança em c86e6b3 com o R-1 aceito pelo dono e QA aprovado em 65f5a64) e a linha de teto excedido com o motivo; merge squash só com todos os checks verdes; depois do merge, apagar as branches remota e local da PR mesclada, sem `--force` (R-FLUXO, Depois do merge).
- (E4.11) Depois do commit da E4.16 e antes do PR 1, renovar por delta o seu parecer `docs/reviews/056-coletor-f1-f2.md` (desatualizado porque `docs/architecture/fontes/acelerato-listas.md` mudou na E4.15 e na E4.16): ler só esse delta, atualizar o frontmatter `commit:` e registrar a revalidação; commit com `Cartão: K-190` e push.
- (E4.11) Corpo de cada PR gravado antes pela ferramenta Write em `/tmp/claude-1000/pr-056-e411-<n>.md` e usado com `gh pr create --body-file <arquivo>`.
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
- DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".
- DECISÃO DO DONO (2026-10-30): "A" (recorte para segunda 2026-11-02): dados reais do BusinessMap e do Acelerato na base, mais as métricas que já saem deles; a tela de times e as métricas que dependem de respostas pendentes ficam para depois. Complemento do dono: "quero as operacionais e as do acelerato so, tatico e estrategico ficam para depois".
- ADR 0013 (citada no pedido): o §4 está substituído pela ADR 0023.
- ADR 0023 (citada no pedido): fonte só leitura, driver mariadb, TLS fixado, consultas constantes.
- ADR 0020 (citada no pedido): nenhuma coluna de pessoa chega à base; nenhuma métrica por agente.
- ADR 0004 (citada no pedido): o frontmatter `estado` aceita só `proposta` ou `vigente`; em `docs/qa/` vale `contrato: 0`.
- Erro recorrente deste destino (forge-check, 30 dias): base em 11 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 10 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 5 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): o R6 vira a E4.16 (software-architect, depois do QA, sem commit), commitado pelo tech-lead na E4.11.
- A `main` é do dono: o merge desta etapa é só na `develop` (CLAUDE.md, "A main é do usuário").
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): a E4.17 renova por delta o parecer de segurança `docs/security/056-coletor-listas-e-driver.md` antes da E4.11; na E4.11 o tech-lead também renova por delta o seu parecer de review, desatualizado pela E4.15 e pela E4.16, antes do PR 1.
- R-1 da segurança: aceito pelo dono na conversa; o arquivo de aceite em `docs/security/aceites/` é do dono (o hook barra agentes). Se o `forge-check pr` exigir esse arquivo, pare e relate, sem contornar.
- O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha; texto grande vai para arquivo pela ferramenta Write.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.
- NÃO tocar: código, os outros documentos, `docs/security/aceites/`, a `main`, a `homolog`, o `.env`, o MySQL real e as worktrees 056, 052, 052b e 052c.

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
- "E4.5 (node-backend): F1 do coletor (config, cliente MySQL com TLS fixado por impressão digital, filtro de origem, allow-list, staging, `ctl_coleta`, releitura semanal e saída do recorte), com testes; commit e push." · etapa de outra delegação; feita (F1, ed631c0)
- "E4.6 (node-backend): F2 (normalizador e projetor; S2, S4, S8, S9 tempo, S10, S12, contagem da S3, S1 com dado real, marcas da D-7 e da D-10, reconciliação de 1%), com testes; commit e push." · etapa de outra delegação; feita (F2, cb91ff5)
- "E4.7 (security-engineer): review de segurança da F1 e da F2 (inclui o pacote mariadb, que a E4.2 não avaliou) em `docs/security/056-coletor-f1-f2.md`, em paralelo à E4.9; commit e push do parecer." · etapa de outra delegação; feita (aed1930, riscos-aceitos)
- "E4.8 (dono): carga inicial manual na máquina do dono e conferência do painel de sustentação com dado real." · etapa de outra delegação; depois desta
- "E4.9 (tech-lead): code review da F1 e da F2 em `docs/reviews/056-coletor-f1-f2.md`, em paralelo à E4.7; commit e push do parecer." · etapa de outra delegação; feita (e82c0a2, reprovado)
- "E4.10 (qa-engineer): QA da F1 e da F2 em `docs/qa/056-coletor-f1-f2.md`, com os testes .pg contra PostgreSQL local, depois da E4.9; commit e push do parecer." · etapa de outra delegação; feita (65f5a64, aprovado)
- "E4.12 (node-backend): volta 1 da F2 com os achados do review (e82c0a2: A1, A2, R2, R3; A3 só na forma dos commits) e da segurança (aed1930: A1, A2, A5), com testes; commit e push, antes da E4.10." · etapa de outra delegação; feita (3b2f98f)
- "E4.13 (tech-lead): revalidação do code review sobre a volta (aed1930..3b2f98f) no mesmo parecer `docs/reviews/056-coletor-f1-f2.md`, mais o commit da E4.15; commit e push." · etapa de outra delegação; feita (414533f, aprovado)
- "E4.14 (security-engineer): revalidação de A1, A2 e A5 sobre a volta (aed1930..3b2f98f) no mesmo parecer `docs/security/056-coletor-f1-f2.md`, em paralelo à E4.13; commit e push." · etapa de outra delegação; feita (c86e6b3, sem achado novo)
- "E4.15 (software-architect): seção das listas de `categoria` e `descricao_workflow` (nomes dos campos e das contagens fora do domínio usados na volta) em `docs/architecture/fontes/acelerato-listas.md`, na worktree 056c, sem commit, antes da E4.13." · etapa de outra delegação; feita (63e09f7)
- "E4.16 (software-architect): R6 do review (414533f): corrigir `docs/architecture/fontes/acelerato-listas.md:7` para dizer o que o código faz (fora das listas de status, prioridade e etapa: nulo com contagem; fora do recorte: `fora-do-recorte`), na worktree 056c, sem commit; o commit vai na E4.11." · etapa de outra delegação; feita (worktree 056c, sem commit; entra no commit desta etapa)
- "E4.17 (security-engineer): renovar por delta o parecer `docs/security/056-coletor-listas-e-driver.md`, desatualizado porque o `.env.example` mudou depois dele, na worktree 056c; commit e push, antes da E4.11." · etapa de outra delegação; feita (4180ce9, aprovado)
- O PR do discovery (E2.4); a carga inicial (E4.8); promoção para `homolog` e `main`; conectar no MySQL real; ler ou editar o `.env`; o quadro e o arquivo do pedido.

## Pronto quando
- PQ-1 (pr): `gh pr list --search K-190 --state merged --json number` · espera: linhas>=1
- PQ-2 (merge): `gh pr list --search K-190 --state merged --json mergeCommit` · espera: contém 'oid'

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
