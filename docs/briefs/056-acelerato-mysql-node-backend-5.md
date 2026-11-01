Agente destino: forge:node-backend
Pedido: 056-acelerato-mysql
Tipo: codigo
Branch: feature/056-coletor-acelerato   Base: develop   Base-sha: 11141d7516b7a71418b3ec069473e3449453fe81
Etapa: codigo   Cobre: E4.12

## Objetivo
Corrigir a F1 e a F2 do coletor do Acelerato com os achados do code review e da segurança (volta 1, R-REVIEW), para o QA e o PR seguirem (pedido 056, E4.12, K-190). Worktree `/home/rodrigoisensee/MetricasDSPD-056c`, branch `feature/056-coletor-acelerato`, base 11141d7516b7a71418b3ec069473e3449453fe81; ponta aed1930fd70cdec3d8eb49a0b53a998ba739d98e.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056c/docs/reviews/056-coletor-f1-f2.md`, bloco `## Achados` e "O que a volta precisa trazer".
- `/home/rodrigoisensee/MetricasDSPD-056c/docs/security/056-coletor-f1-f2.md`, bloco `## Achados` (A1, A2, A5).

## Entregar
- "E4.12 (node-backend): volta 1 da F2 com os achados do review (e82c0a2: A1, A2, R2, R3; A3 só na forma dos commits) e da segurança (aed1930: A1, A2, A5), com testes; commit e push, antes da E4.10." (E4.12)
- (E4.12) Review A1: em `server/src/modulos/metricas/repositorio.ts:91`, tirar o filtro `prioridade IS NOT NULL`; o chamado com prioridade fora da escala P fica na base e conta em todas as métricas de sustentação (D-8, D-12), sem prioridade. Para isso, `prioridade` passa a opcional no tipo `Chamado` da biblioteca compartilhada, só esse campo, sem mudar nenhum cálculo. Teste: chamado com prioridade fora da escala P conta no S2 e na reconciliação.
- (E4.12) Review A2: em `docs/qa/056-coletor-plano-de-testes.md`, trocar o frontmatter inteiro por `contrato: 0`, como em `docs/qa/integracao-real.md`, sem mudar o resto do arquivo.
- (E4.12) Review A3: a divisão em dois PRs é do tech-lead na E4.11; aqui, as correções entram como commits novos `fix(...)` depois da F2, sem reescrever o histórico e sem tocar nos commits da F1.
- (E4.12) Review R2: em `server/src/modulos/acelerato/coletor.ts:144`, incluir os ausentes na consulta da saída do recorte, para o ausente que reaparece fora do recorte virar `fora_do_recorte`, com teste.
- (E4.12) Review R3: teste .pg do projetor (DELETE e INSERT em `dim_chamado` pelo `dspd_coletor`, UPDATE de `ctl_coleta`, CHECK de `reincidente_90d`) e `pnpm run pronto` e `pnpm run test:pg` rodados na ponta, com a saída no relatório.
- (E4.12) Segurança A1: em `server/src/modulos/acelerato/cliente-mysql.ts:43`, `permitRedirect: false` e `restrictedAuth` com os métodos do parecer. Segurança A2: tratador de `error` na conexão (`cliente-mysql.ts:91`) que não imprime nada. Segurança A5: `categoria` e `descricao_workflow` (`allow-list.ts:74`) em domínio fechado no `ref_dominio`, como status e prioridade; valor fora do domínio vira nulo com contagem.
- (E4.12) Commits no padrão do `docs/engineering/praticas.md`, com `Cartão: K-190`, `git add` explícito por caminho; mensagens gravadas antes pela ferramenta Write em `/tmp/claude-1000/commit-056-e412-<n>.txt` e usadas com `git commit -F <arquivo>`.
- (E4.12) Antes do push, `git -C /home/rodrigoisensee/MetricasDSPD-056c branch --show-current` deve dar `feature/056-coletor-acelerato`; `git -C /home/rodrigoisensee/MetricasDSPD-056c pull --rebase origin feature/056-coletor-acelerato` (nunca `--force`) e `git -C /home/rodrigoisensee/MetricasDSPD-056c push origin HEAD:refs/heads/feature/056-coletor-acelerato`, sem PR.
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
- DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".
- DECISÃO DO DONO (2026-10-30): "A" (recorte para segunda 2026-11-02): dados reais do BusinessMap e do Acelerato na base, mais as métricas que já saem deles; a tela de times e as métricas que dependem de respostas pendentes ficam para depois. Complemento do dono: "quero as operacionais e as do acelerato so, tatico e estrategico ficam para depois".
- ADR 0013 (citada no pedido): o §4 está substituído pela ADR 0023.
- ADR 0023 (citada no pedido): fonte só leitura, driver mariadb, TLS fixado, consultas constantes; as correções não mudam a leitura da origem.
- ADR 0020 (citada no pedido): nenhuma coluna de pessoa chega à base; nenhuma métrica por agente.
- ADR 0004 (citada no pedido): o frontmatter `estado` aceita só `proposta` ou `vigente`; em `docs/qa/` vale `contrato: 0`.
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): volta 1 da F2 num brief único com o A1 do review e os recomendados R2 e R3 do review e A1, A2 e A5 da segurança; `prioridade` opcional no `Chamado` da biblioteca compartilhada, mudança mínima autorizada só nesse campo, com teste.
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): a volta 1 da F2 vira a etapa E4.12, porque o `brief gerar --volta` exige o Fora do escopo idêntico ao brief anterior.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041): testes com `nice -n 19`, uma suíte por vez.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha; texto grande vai para arquivo pela ferramenta Write.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.
- NÃO tocar: o módulo `businessmap`, a biblioteca compartilhada além do campo `prioridade` do `Chamado`, os documentos de arquitetura e de segurança, o `.env` e as worktrees 056, 052, 052b e 052c.

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
- "E4.8 (dono): carga inicial manual na máquina do dono e conferência do painel de sustentação com dado real." · etapa de outra delegação; depois da E4.11
- "E4.9 (tech-lead): code review da F1 e da F2 em `docs/reviews/056-coletor-f1-f2.md`, em paralelo à E4.7; commit e push do parecer." · etapa de outra delegação; feita (e82c0a2, reprovado; origem desta volta)
- "E4.10 (qa-engineer): QA da F1 e da F2 em `docs/qa/056-coletor-f1-f2.md`, com os testes .pg contra PostgreSQL local, depois da E4.9; commit e push do parecer." · etapa de outra delegação; depois desta
- "E4.11 (tech-lead): PR da `feature/056-coletor-acelerato` para a develop (squash) e merge com os checks verdes e os pareceres em dia." · etapa de outra delegação; depois da E4.10
- R1, R4 e R5 do review e A3 e A4 da segurança (ficam para a F3, o merge do discovery e a revisão da ADR); PR; conectar no MySQL real; ler ou editar o `.env`; o quadro e o arquivo do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-056c log --format=%H aed1930fd70cdec3d8eb49a0b53a998ba739d98e..origin/feature/056-coletor-acelerato` · espera: linhas>=1
- PQ-2 (cmd): `grep -c 'prioridade IS NOT NULL' /home/rodrigoisensee/MetricasDSPD-056c/server/src/modulos/metricas/repositorio.ts` · espera: igual '0'
- PQ-3 (cmd): `nice -n 19 pnpm --dir /home/rodrigoisensee/MetricasDSPD-056c/server exec vitest run acelerato metricas` · espera: rc=0
- PQ-4 (cmd): `nice -n 19 pnpm --dir /home/rodrigoisensee/MetricasDSPD-056c/server run typecheck` · espera: rc=0
- PQ-5 (push): `git -C /home/rodrigoisensee/MetricasDSPD-056c ls-remote origin refs/heads/feature/056-coletor-acelerato` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-056c rev-parse HEAD`
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056c status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
