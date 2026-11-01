Agente destino: forge:tech-lead
Pedido: 056-acelerato-mysql
Tipo: codigo
Branch: docs/056-acelerato-discovery   Base: develop   Base-sha: 11141d7516b7a71418b3ec069473e3449453fe81
Etapa: review   Cobre: E2.2

## Objetivo
Code review da E2.1 do pedido 056 (commit 19275cb004b57361a6bf60ba0e654ebee0828ef5, K-189): os quatro documentos do discovery do Acelerato e a regra nova do `CLAUDE.md`, antes do QA e do PR. Worktree `/home/rodrigoisensee/MetricasDSPD-056`, branch `docs/056-acelerato-discovery`, base 11141d7516b7a71418b3ec069473e3449453fe81.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 show 19275cb004b57361a6bf60ba0e654ebee0828ef5` (o diff inteiro da E2.1: o `CLAUDE.md` e os quatro documentos).
- Seções de commits e de review do `docs/engineering/praticas.md`, na worktree.

## Entregar
- "E2.2 (tech-lead): review da E2.1 em `docs/reviews/056-acelerato-discovery.md` (inclui conferir que nenhum documento traz linha de dado, nome de pessoa, endereço do servidor nem organização cliente), commit e push do parecer." (E2.2)
- (E2.2) Parecer em `/home/rodrigoisensee/MetricasDSPD-056/docs/reviews/056-acelerato-discovery.md` pela ferramenta Write: frontmatter com `pedido: 056-acelerato-mysql` e `commit: 19275cb004b57361a6bf60ba0e654ebee0828ef5`, veredito (aprovado ou reprovado) e o bloco `## Achados` no formato que o `forge-check pr` lê, cada achado com arquivo:linha e se é bloqueante. Conferir: nenhum dos quatro documentos traz linha de dado da tabela, nome de pessoa, endereço ou porta do servidor, nem nome de organização cliente; a linha 23 do `CLAUDE.md` bate com a DECISÃO DO DONO "B" e não contradiz as outras regras invioláveis. O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- (E2.2) Um commit, no padrão do `docs/engineering/praticas.md`, com `Cartão: K-189`, só com o parecer adicionado por `git add` explícito; a mensagem vai num arquivo gravado antes pela ferramenta Write em `/tmp/claude-1000/commit-056-e22.txt` e usado com `git commit -F <arquivo>`.
- (E2.2) Antes do push, `git -C /home/rodrigoisensee/MetricasDSPD-056 branch --show-current` deve dar `docs/056-acelerato-discovery`; rode antes `git -C /home/rodrigoisensee/MetricasDSPD-056 pull --rebase origin docs/056-acelerato-discovery` (nunca `--force`) e depois `git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/docs/056-acelerato-discovery`, sem PR.
- (E1, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
- DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".
- ADR 0013 (citada no pedido): o §4 (Acelerato pelo Metabase) será substituído pela ADR 0023 numa etapa seguinte; aqui o plano só propõe o texto.
- ADR 0020 (citada no pedido): nenhuma coluna de pessoa chega à base; o que precisar de pessoa é calculado em memória e só o agregado é gravado.
- Erro recorrente deste destino (forge-check, 30 dias): base em 11 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 10 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 5 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): a E2.1 se divide em E2.1 (commit e push), E2.2 (review), E2.3 (QA) e E2.4 (PR e merge); o review (E2.2) vem antes do QA (E2.3), R-REVIEW.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha; texto grande vai para arquivo pela ferramenta Write.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.

## Fora do escopo
- "E1.1 (dono): validar o plano; depois dele, as etapas de código (coletor) entram neste pedido." · etapa de outra delegação; feita (plano validado pelo dono em 2026-10-30)
- "E2.0 (tech-lead): `pnpm install --frozen-lockfile` em prioridade baixa (nice) na worktree `/home/rodrigoisensee/MetricasDSPD-056` e no clone principal, e push da `docs/056-acelerato-discovery` e da `docs/jarvis-2026-10-23` (o pre-push exige as dependências), sem commit novo e sem testes além do pre-push." · etapa de outra delegação; feita
- "E2.1 (tech-lead): na worktree 056, mudança da regra do CLAUDE.md (Acelerato pela tabela MySQL do time de ciência de dados, só leitura) e commit dos quatro documentos do discovery (plano, modelo de ameaças, doc do dash, respostas), com push, sem PR." · etapa de outra delegação; feita (commit 19275cb004b57361a6bf60ba0e654ebee0828ef5, conferida)
- "E2.3 (qa-engineer): QA da E2.1 em `docs/qa/056-acelerato-discovery.md` (a mudança do CLAUDE.md não é isenta de QA), commit e push do parecer." · etapa de outra delegação; depois desta (review antes do QA)
- "E2.4 (tech-lead): PR da `docs/056-acelerato-discovery` para a develop (squash) e merge com os checks verdes e os pareceres em dia." · etapa de outra delegação; depois da E2.2 e da E2.3
- "E3.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056` e branch `docs/056-acelerato-discovery` a partir da `develop`, com push, sem commit e sem testes (onde a E3.2 e a E3.3 escrevem)." · etapa de outra delegação; feita
- "E3.1 (dono): rodar no terminal a consulta só de estrutura da tabela (nomes e tipos das colunas e total de linhas, sem nenhuma linha de dado) e colar a saída; contar, se quiser, quais painéis o dash atual do Acelerato tem e de onde vem cada número." · etapa de outra delegação; feita
- "E3.2 (software-architect): com a estrutura colada e o catálogo de métricas de sustentação do briefing, o mapeamento coluna da tabela → métrica (quais saem direto, quais precisam de cálculo, quais faltam), o desenho do coletor MySQL só leitura e incremental e o que muda na ADR 0013, no data-model §4 e no metabase-acelerato-configuracao; lista de perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita
- "E3.3 (security-engineer): modelo de ameaças da fonte MySQL (usuário só leitor, credencial no .env, colunas de pessoa barradas na fronteira por lista fechada), em paralelo à E3.2, em docs, sem commit." · etapa de outra delegação; feita
- "E3.4 (software-architect): atualizar o plano da E3.2 com as decisões D-2 a D-6 do dono e com `docs/integracao/acelerato-dash-atual.md` (o que o dash resolve das perguntas, o que não é reproduzido por ser individual, o que muda na reconciliação), encurtando as perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita
- "E3.5 (software-architect): atualizar o plano com as decisões D-7 a D-10 do dono e com `docs/integracao/acelerato-respostas-ciencia-de-dados.md` (filtro na origem por tipo DSPD - SSSC, campos de etapa para S5, S6, S7 e S11, `quantidadeDeVezes`, cobertura de 2,7% do campo dos 90 dias, separação das filas, `sla_r_tempo_min` negativo), marcando o plano como pronto para validação; em docs, sem commit." · etapa de outra delegação; feita (plano pronto-para-validacao)
- "E3.6 (security-engineer): revisar o modelo de ameaças com as respostas (conta com só SELECT e SHOW VIEW na tabela e host aberto, TLS disponível sem CA, colunas e campos de pessoa novos em `raw`, `campos_personalizados`, `campos_personalizados_etapa` e `estatisticas.impedimentos`, clientes externos na tabela), em paralelo à E3.5; em docs, sem commit." · etapa de outra delegação; feita (modelo de ameaças revisto)
- Corrigir os documentos ou o `CLAUDE.md` (achado vira parecer, não correção); o parecer de QA; PR e merge; ADR 0023 e código; ler ou editar o `.env`; o quadro e o arquivo do pedido; outras worktrees.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-056/docs/reviews/056-acelerato-discovery.md`
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-056 log --format=%H 19275cb004b57361a6bf60ba0e654ebee0828ef5..HEAD -- docs/reviews/056-acelerato-discovery.md` · espera: linhas=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/docs/056-acelerato-discovery:docs/reviews/056-acelerato-discovery.md` · espera: contém 'commit: 19275cb004b57361a6bf60ba0e654ebee0828ef5'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-056 ls-remote origin refs/heads/docs/056-acelerato-discovery` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-056 rev-parse HEAD`

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
