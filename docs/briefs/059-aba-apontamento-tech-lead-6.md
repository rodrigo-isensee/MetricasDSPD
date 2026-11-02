Agente destino: forge:tech-lead
Pedido: 059-aba-apontamento
Tipo: codigo
Branch: docs/059-excecao-apontamento   Base: develop   Base-sha: db00570cd6423089d041250ae9ed2d51a0489b4b
Etapa: pr   Cobre: E1.7

## Objetivo
Levar ao dono, por PR, a exceção da aba Apontamento já aprovada por ele, no `CLAUDE.md` e no briefing (pedido 059, E1.7, K-193). Worktree `/home/rodrigoisensee/MetricasDSPD-052b`, branch `docs/059-excecao-apontamento` (nova).

## Ler
- O §1 do plano `docs/architecture/features/059-aba-apontamento.md` na branch `docs/059-apontamento-discovery` (`git -C /home/rodrigoisensee/MetricasDSPD-052b show origin/docs/059-apontamento-discovery:docs/architecture/features/059-aba-apontamento.md`); no `CLAUDE.md`, a seção Regras invioláveis; no briefing `docs/briefing-execucao-metricas.md`, a seção 7.1.

## Entregar
- "E1.7 (tech-lead): depois da E1.5, branch própria a partir da develop com a exceção aprovada (textos 1.1 e 1.2 do plano, com as cláusulas o1 a o4) aplicada no `CLAUDE.md` e no briefing §7.1, review, PR só de documentação para a develop; o merge é do dono." (E1.7)
- (E1.7) `git -C /home/rodrigoisensee/MetricasDSPD-052b fetch origin` e `git -C /home/rodrigoisensee/MetricasDSPD-052b switch -c docs/059-excecao-apontamento --no-track origin/develop` (a worktree está na branch da WS1, já mesclada; se estiver suja, pare e relate).
- (E1.7) Aplicar, pela ferramenta Edit, o texto 1.1 do plano no `CLAUDE.md` (no lugar indicado) e o texto 1.2 no fim da lista do §7.1 do briefing, literais, cada um com as cláusulas o1 a o4 aprovadas pelo dono; nenhuma outra mudança nos dois arquivos; rodar `pnpm -C /home/rodrigoisensee/MetricasDSPD-052b run docs:check`.
- (E1.7) Code review da mudança em `docs/reviews/059-excecao-apontamento.md`; commit com `Cartão: K-193` (os dois arquivos e o parecer), mensagem gravada pela ferramenta Write em `/tmp/claude-1000/commit-059-e17.txt`, `git add` explícito por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052b push origin HEAD:refs/heads/docs/059-excecao-apontamento`.
- (E1.7) Corpo do PR gravado pela ferramenta Write em `/tmp/claude-1000/pr-059-excecao.md` (o que muda, as decisões do dono de 2026-11-01 que o texto traduz, pedido 059 e as linhas de atribuição do Claude Code); `gh pr create --draft --base develop --head docs/059-excecao-apontamento --title 'docs: exceção da aba Apontamento no CLAUDE.md e no briefing' --body-file /tmp/claude-1000/pr-059-excecao.md`, `gh pr ready docs/059-excecao-apontamento`; esperar os checks; não mesclar: relatar o número e o comando de merge para o dono.
- (E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-01): "A" (exceção à regra de métrica individual): registrar formalmente a exceção para a aba Apontamento no CLAUDE.md e no briefing, por PR que o dono revisa e mescla; discovery com o security-engineer (controle de acesso, revisão da ADR 0020).
- DECISÃO DO DONO (2026-11-01): "C" (quem vê a aba): qualquer usuário do painel, inclusive fora do time.
- DECISÃO DO DONO (2026-11-01): "Por enquanto sim" (recibo confirmado).
- DECISÃO DO DONO (2026-11-01): "A" (texto da exceção, Q-A12): aprova os textos 1.1 (CLAUDE.md) e 1.2 (briefing §7.1) do plano docs/architecture/features/059-aba-apontamento.md com as quatro cláusulas opcionais o1 a o4 (ordem neutra, sem semáforo, piso de 20 apontamentos para percentual por pessoa, aba fora da exportação).
- DECISÃO DO DONO (2026-11-01): "A" (recomendações em bloco): aceita as recomendações do time para as perguntas Q-A1 a Q-A11 do plano, P-1 a P-7 do UX e P-3 a P-8 da segurança (as já respondidas pelas cláusulas o1 a o4 seguem as cláusulas); pode reabrir qualquer item depois. Ficam fora do bloco e vêm separadas: P-1 da segurança (onde o painel roda e quem o alcança) e P-2 da segurança (retenção e base legal).
- DECISÃO DO DONO (2026-11-01): "Faça sua recomendação depois vamos ter login pelo ad" (onde o painel com nome real roda, P-1 da segurança): por enquanto, nome real só na máquina do dono ou na rede local sob controle dele, desligado em qualquer outro ambiente; depois entra login pelo AD da empresa (fatia futura).
- DECISÃO DO DONO (2026-11-01): "A" (retenção, P-2 da segurança): o vínculo entre horas e pessoa fica enquanto a aba usar o dado; no pedido de eliminação saem o nome e o vínculo (chave de pessoa anulada no fato) e as horas ficam como agregado do time, sem sobrescrever valor de métrica; o prazo exato vai ao DPO antes da fatia de retenção.
- DECISÃO DO DONO (2026-11-01): "A" (horas apontadas): a exceção da aba Apontamento cobre também as horas apontadas, só para capacidade, utilização e distribuição do tempo do time e de cada pessoa; nunca como esforço de entrega, velocidade, custo de card ou meta.
- DECISÃO DO DONO (2026-11-01): "A, mas veja senão tem melhorias a propor e correções então toque o discovery gostaria de entregar ata amanhã também" (começa agora, discovery com melhorias e correções, entrega desejada até 2026-11-02).
- ADR 0020 (citada no pedido): nenhum nome de pessoa em documento, saída ou log desta etapa.
- Erro recorrente deste destino (forge-check, 30 dias): base em 13 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 11 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 7 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- 2026-11-01 20:52: E1.2 cumprida: plano em docs/architecture/features/059-aba-apontamento.md (worktree 052c, sem commit): proposta literal da exceção (CLAUDE.md e briefing 7.1, com cláusulas opcionais o1 a o4), coleta por GET /loggedTime com chave logged_time_id e histórico de edição e exclusão, comentário classificado na fronteira e descartado, pessoa por id, hierarquia até a iniciativa, dicionário versionado, API agregada com papel dspd_api_apontamento; 12 correções e 5 melhorias à especificação; perguntas Q-A1 a Q-A12; até 2026-11-02 cabe a F0 (discovery, validação e PR da exceção), código e tela não. Próximo: E1.5 (commit do discovery) e a validação do dono, uma pergunta por vez.
- Sandbox: comandos que começam com pnpm rodam fora dele; o GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha.
- O agente nunca abre nem lê o `.env`.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.
- O parecer é escrito só pela ferramenta Write ou Edit do papel; bloco `## Achados` só com linhas de achado; frase de regra só pelo ID; achado até 300 caracteres.
- NÃO tocar: código, outras seções do `CLAUDE.md` e do briefing, o `.env`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): na worktree `/home/rodrigoisensee/MetricasDSPD-052c` (branch da F0 já mesclada), criar a `docs/059-apontamento-discovery` a partir da `origin/develop` e fazer push, sem commit novo e sem testes." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): proposta literal do texto da exceção para o `CLAUDE.md` e o briefing §7.1 (aplicada depois por PR que o dono revisa e mescla, sem editar os dois nesta etapa), e o desenho técnico enxuto da aba (coleta do worklog pela API do BusinessMap, carga incremental com chave do apontamento, de-para de pessoa por id, hierarquia até a iniciativa, calendário com feriados, dicionário de subgrupo configurável, classificação do comentário na fronteira, cálculos pela biblioteca T2.5) com as correções e melhorias à especificação, em `docs/architecture/features/059-aba-apontamento.md`, na worktree 052c, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): a especificação do dono (texto, sem o HTML) como protótipo: ajuste ao padrão do painel operacional e lista de melhorias e correções de interface, em `docs/ux/059-aba-apontamento.md`, na worktree 052c, sem commit, em paralelo à E1.2." · etapa de outra delegação; continua no pedido
- "E1.4 (security-engineer): modelo de ameaças da aba (nome de pessoa na API, visível a qualquer usuário; comentário do apontamento; chave do BusinessMap) e revisão proposta da ADR 0020, em `docs/security/059-aba-apontamento-ameacas.md`, na worktree 052c, sem commit, em paralelo à E1.2." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): commit e push do discovery (E1.2 a E1.4) na `docs/059-apontamento-discovery`, sem PR." · etapa de outra delegação; continua no pedido
- "E1.6 (dono): validar o desenho e as melhorias (ponto de compromisso)." · etapa de outra delegação; continua no pedido
- "E2.1 (a definir depois da E1.6): implementação, segurança, code review, QA, revisão de UX e PR." · etapa de outra delegação; continua no pedido
- O merge do PR (o dono mescla); o PR dos documentos do discovery; o quadro e o arquivo do pedido.

## Pronto quando
- PQ-1 (pr): `gh pr list --head docs/059-excecao-apontamento --state all --json number --jq length` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052b show origin/docs/059-excecao-apontamento:CLAUDE.md` · espera: contém 'aba Apontamento'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
