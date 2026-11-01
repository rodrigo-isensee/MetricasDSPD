Agente destino: forge:security-engineer
Pedido: 056-acelerato-mysql
Tipo: codigo
Branch: feature/056-coletor-acelerato   Base: develop   Base-sha: 11141d7516b7a71418b3ec069473e3449453fe81
Etapa: codigo   Cobre: E4.2

## Objetivo
Revisar, antes do código, as listas fechadas do plano e o driver MySQL do coletor do Acelerato, e decidir os achados de segurança abertos no review (pedido 056, E4.2, K-190; gatilhos: dados pessoais, credencial externa, banco, dependência nova, R-SEGURANCA). Worktree `/home/rodrigoisensee/MetricasDSPD-056c`, branch `feature/056-coletor-acelerato`, base 11141d7516b7a71418b3ec069473e3449453fe81. Sem commit.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056/docs/architecture/features/056-acelerato-mysql.md`, §2 (com §2.1) e §4.
- `/home/rodrigoisensee/MetricasDSPD-056/docs/security/056-acelerato-mysql-ameacas.md` (o modelo de ameaças que você mesmo revisou na E3.6).
- `/home/rodrigoisensee/MetricasDSPD-056/docs/reviews/056-acelerato-discovery.md`, bloco `## Achados` (A1 e A3).

## Entregar
- "E4.2 (security-engineer): revisão das listas fechadas e da §2 do plano e parecer do driver MySQL (cadeia de suprimentos), em paralelo à E4.1, na worktree 056c, sem commit." (E4.2)
- (E4.2) Parecer em `/home/rodrigoisensee/MetricasDSPD-056c/docs/security/056-coletor-listas-e-driver.md`: frontmatter com `pedido: 056-acelerato-mysql`, veredito e bloco `## Achados` uma linha por achado (arquivo:linha, bloqueante ou recomendado, até 300 caracteres). Conteúdo: (a) as listas da §2 e da §2.1 do plano deixam fora nome, e-mail, `usuarioKey`, ids de agente e solicitante, título, descrição, `raw` e campos livres; (b) o driver `mysql2` (ou o que a §4 propuser): versão, mantenedores, licença, dependências e avisos de segurança, lidos por `pnpm view` e pela base de avisos, sem instalar; (c) decisão sobre o A1 do review (o `CLAUDE.md` citar TLS verificado e filtro na origem), com o texto proposto se for o caso; (d) posição sobre o A3 (`com_agente` no SELECT). O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
- DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
- DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".
- DECISÃO DO DONO (2026-10-30): "A" (recorte para segunda 2026-11-02): dados reais do BusinessMap e do Acelerato na base, mais as métricas que já saem deles; a tela de times e as métricas que dependem de respostas pendentes ficam para depois. Complemento do dono: "quero as operacionais e as do acelerato so, tatico e estrategico ficam para depois".
- ADR 0013 (citada no pedido): o §4 (Acelerato pelo Metabase) é substituído pela ADR 0023 que nasce na E4.1.
- ADR 0023 (citada no pedido): nasce na E4.1, nesta worktree: fonte MySQL só leitura, driver, TLS fixado, consulta com lista fechada.
- ADR 0020 (citada no pedido): nenhuma coluna de pessoa chega à base; o que precisar de pessoa é calculado em memória e só o agregado é gravado.
- ADR 0004 (citada no pedido): o frontmatter `estado` de documento aceita só `proposta` ou `vigente`.
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): E4.0 parte da develop sem esperar a E2.4; os agentes leem o plano na worktree 056 até o merge.
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): A2 do review fica para a primeira carga (E4.8): o filtro pelas 2 organizações fica (M11) e a F1 (E4.5) informa, só como contagem, quantos chamados SSSC das 3 equipes estão fora delas; se maior que zero, vira PERGUNTA ao dono antes de publicar o painel.
- Fato registrado no Histórico do pedido (2026-10-30 17:14): impressão SHA-256 do certificado do servidor obtida; certificado autogerado pelo MySQL 8.0.35, válido até 2035-10-22; vai ao .env como ACELERATO_MYSQL_TLS_SHA256; o coletor fixa o certificado por impressão digital.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha; texto grande vai para arquivo pela ferramenta Write.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.
- NÃO tocar: o plano, o modelo de ameaças, o `CLAUDE.md`, os arquivos da E4.1 (ADR 0023 e listas) e o `.env`.

## Fora do escopo
- "E1.1 (dono): validar o plano; depois dele, as etapas de código (coletor) entram neste pedido." · etapa de outra delegação; feita (plano validado pelo dono em 2026-10-30)
- "E2.0 (tech-lead): `pnpm install --frozen-lockfile` em prioridade baixa (nice) na worktree `/home/rodrigoisensee/MetricasDSPD-056` e no clone principal, e push da `docs/056-acelerato-discovery` e da `docs/jarvis-2026-10-23` (o pre-push exige as dependências), sem commit novo e sem testes além do pre-push." · etapa de outra delegação; feita
- "E2.1 (tech-lead): na worktree 056, mudança da regra do CLAUDE.md (Acelerato pela tabela MySQL do time de ciência de dados, só leitura) e commit dos quatro documentos do discovery (plano, modelo de ameaças, doc do dash, respostas), com push, sem PR." · etapa de outra delegação; feita (19275cb, conferida)
- "E2.2 (tech-lead): review da E2.1 em `docs/reviews/056-acelerato-discovery.md` (inclui conferir que nenhum documento traz linha de dado, nome de pessoa, endereço do servidor nem organização cliente), commit e push do parecer." · etapa de outra delegação; feita (e92a268, aprovado, conferida)
- "E2.3 (qa-engineer): QA da E2.1 em `docs/qa/056-acelerato-discovery.md` (a mudança do CLAUDE.md não é isenta de QA), commit e push do parecer." · etapa de outra delegação; feita (31c5042, reprovado: A1)
- "E2.4 (tech-lead): PR da `docs/056-acelerato-discovery` para a develop (squash) e merge com os checks verdes e os pareceres em dia." · etapa de outra delegação; depois da E2.6
- "E2.5 (tech-lead): volta 1 do QA (A1 bloqueante de `docs/qa/056-acelerato-discovery.md`): no plano `docs/architecture/features/056-acelerato-mysql.md`, frontmatter `estado: vigente` e a linha "Estado:" dizendo que o plano foi validado pelo dono em 2026-10-30; commit e push na `docs/056-acelerato-discovery`." · etapa de outra delegação; feita (ca55f58)
- "E2.6 (qa-engineer): revalidação do QA depois da E2.5, no mesmo parecer `docs/qa/056-acelerato-discovery.md`, com o `## Achados` uma linha por achado; commit e push." · etapa de outra delegação; em andamento, outra worktree (056)
- "E3.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056` e branch `docs/056-acelerato-discovery` a partir da `develop`, com push, sem commit e sem testes (onde a E3.2 e a E3.3 escrevem)." · etapa de outra delegação; feita
- "E3.1 (dono): rodar no terminal a consulta só de estrutura da tabela (nomes e tipos das colunas e total de linhas, sem nenhuma linha de dado) e colar a saída; contar, se quiser, quais painéis o dash atual do Acelerato tem e de onde vem cada número." · etapa de outra delegação; feita
- "E3.2 (software-architect): com a estrutura colada e o catálogo de métricas de sustentação do briefing, o mapeamento coluna da tabela → métrica (quais saem direto, quais precisam de cálculo, quais faltam), o desenho do coletor MySQL só leitura e incremental e o que muda na ADR 0013, no data-model §4 e no metabase-acelerato-configuracao; lista de perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita
- "E3.3 (security-engineer): modelo de ameaças da fonte MySQL (usuário só leitor, credencial no .env, colunas de pessoa barradas na fronteira por lista fechada), em paralelo à E3.2, em docs, sem commit." · etapa de outra delegação; feita
- "E3.4 (software-architect): atualizar o plano da E3.2 com as decisões D-2 a D-6 do dono e com `docs/integracao/acelerato-dash-atual.md` (o que o dash resolve das perguntas, o que não é reproduzido por ser individual, o que muda na reconciliação), encurtando as perguntas ao time de ciência de dados; em docs, sem commit." · etapa de outra delegação; feita
- "E3.5 (software-architect): atualizar o plano com as decisões D-7 a D-10 do dono e com `docs/integracao/acelerato-respostas-ciencia-de-dados.md` (filtro na origem por tipo DSPD - SSSC, campos de etapa para S5, S6, S7 e S11, `quantidadeDeVezes`, cobertura de 2,7% do campo dos 90 dias, separação das filas, `sla_r_tempo_min` negativo), marcando o plano como pronto para validação; em docs, sem commit." · etapa de outra delegação; feita
- "E3.6 (security-engineer): revisar o modelo de ameaças com as respostas (conta com só SELECT e SHOW VIEW na tabela e host aberto, TLS disponível sem CA, colunas e campos de pessoa novos em `raw`, `campos_personalizados`, `campos_personalizados_etapa` e `estatisticas.impedimentos`, clientes externos na tabela), em paralelo à E3.5; em docs, sem commit." · etapa de outra delegação; feita
- "E4.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056c` e branch `feature/056-coletor-acelerato` a partir da `develop`, com push e `pnpm install --frozen-lockfile` em prioridade baixa, sem commit novo e sem testes." · etapa de outra delegação; feita (worktree 056c)
- "E4.1 (software-architect): na worktree 056c, ADR 0023 (substitui a ADR 0013 §4; escolha do driver MySQL) e as edições da §5 do plano (ADR 0013 §4, `data-model.md`, `metabase-acelerato-configuracao.md`), com as listas fechadas de nomes, etapas, prioridades, tipo, equipes e organizações da §2.1 para o `ref_dominio`, sem commit." · etapa de outra delegação; em paralelo a esta
- "E4.3 (qa-engineer): plano de testes da F1 e da F2 (CA-1 a CA-10, fixture das 50 colunas com os marcadores de pessoa da §2.1, casos da §3.3), em paralelo à E4.1, na worktree 056c, sem commit." · etapa de outra delegação; em paralelo a esta
- "E4.4 (tech-lead): commit e push da E4.1 a E4.3 na `feature/056-coletor-acelerato`." · etapa de outra delegação; depois da E4.1 a E4.3
- "E4.5 (node-backend): F1 do coletor (config, cliente MySQL com TLS fixado por impressão digital, filtro de origem, allow-list, staging, `ctl_coleta`, releitura semanal e saída do recorte), com testes; commit e push." · etapa de outra delegação; depois da E4.4
- "E4.6 (node-backend): F2 (normalizador e projetor; S2, S4, S8, S9 tempo, S10, S12, contagem da S3, S1 com dado real, marcas da D-7 e da D-10, reconciliação de 1%), com testes; commit e push." · etapa de outra delegação; depois da E4.5
- "E4.7 (security-engineer, tech-lead, qa-engineer): review de segurança, code review e QA da F1 e da F2; PR para a develop (squash) e merge pelo tech-lead." · etapa de outra delegação; depois da E4.6
- "E4.8 (dono): carga inicial manual na máquina do dono e conferência do painel de sustentação com dado real." · etapa de outra delegação; depois da E4.7
- Editar o plano, o modelo de ameaças, o `CLAUDE.md` ou as listas da E4.1; instalar dependência; commit, branch ou push (a E4.4 commita); código do coletor; ler ou editar o `.env`; conectar no MySQL; o quadro e o arquivo do pedido; as worktrees 056, 052 e 052b.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-056c/docs/security/056-coletor-listas-e-driver.md`
- PQ-2 (cmd): `grep -c '## Achados' /home/rodrigoisensee/MetricasDSPD-056c/docs/security/056-coletor-listas-e-driver.md` · espera: igual '1'
- PQ-3 (cmd): `grep -c 'mysql2' /home/rodrigoisensee/MetricasDSPD-056c/docs/security/056-coletor-listas-e-driver.md` · espera: rc=0

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
