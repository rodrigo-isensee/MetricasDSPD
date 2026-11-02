Agente destino: forge:tech-lead
Pedido: 059-aba-apontamento
Tipo: codigo
Branch: docs/059-apontamento-discovery   Base: develop   Base-sha: 4a01e39384ef108d6adba942f56623a2750d3cfd
Etapa: codigo   Cobre: E1.5

## Objetivo
Versionar o discovery da aba Apontamento para o dono validar (pedido 059, E1.5, K-193). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `docs/059-apontamento-discovery`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c status --short`.

## Entregar
- "E1.5 (tech-lead): commit e push do discovery (E1.2 a E1.4) na `docs/059-apontamento-discovery`, sem PR." (E1.5)
- (E1.5) Commit, sem PR, dos três documentos do discovery: `docs/architecture/features/059-aba-apontamento.md`, `docs/ux/059-aba-apontamento.md` e `docs/security/059-aba-apontamento-ameacas.md`, com `Cartão: K-193`, mensagem gravada pela ferramenta Write em `/tmp/claude-1000/commit-059-e15.txt`, `git add` explícito por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/docs/059-apontamento-discovery`; se o pre-push ou o `forge-check docs` recusar, pare e relate a mensagem literal, sem editar os documentos dos outros papéis.
- (E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-01): "A" (exceção à regra de métrica individual): registrar formalmente a exceção para a aba Apontamento no CLAUDE.md e no briefing, por PR que o dono revisa e mescla; discovery com o security-engineer (controle de acesso, revisão da ADR 0020).
- DECISÃO DO DONO (2026-11-01): "C" (quem vê a aba): qualquer usuário do painel, inclusive fora do time.
- DECISÃO DO DONO (2026-11-01): "Por enquanto sim" (recibo confirmado).
- DECISÃO DO DONO (2026-11-01): "A" (horas apontadas): a exceção da aba Apontamento cobre também as horas apontadas, só para capacidade, utilização e distribuição do tempo do time e de cada pessoa; nunca como esforço de entrega, velocidade, custo de card ou meta.
- DECISÃO DO DONO (2026-11-01): "A, mas veja senão tem melhorias a propor e correções então toque o discovery gostaria de entregar ata amanhã também" (começa agora, discovery com melhorias e correções, entrega desejada até 2026-11-02).
- ADR 0020 (citada no pedido): nenhum nome de pessoa em documento, saída ou log desta etapa.
- Erro recorrente deste destino (forge-check, 30 dias): base em 13 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 11 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 7 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- 2026-11-01 20:52: E1.2 cumprida: plano em docs/architecture/features/059-aba-apontamento.md (worktree 052c, sem commit): proposta literal da exceção (CLAUDE.md e briefing 7.1, com cláusulas opcionais o1 a o4), coleta por GET /loggedTime com chave logged_time_id e histórico de edição e exclusão, comentário classificado na fronteira e descartado, pessoa por id, hierarquia até a iniciativa, dicionário versionado, API agregada com papel dspd_api_apontamento; 12 correções e 5 melhorias à especificação; perguntas Q-A1 a Q-A12; até 2026-11-02 cabe a F0 (discovery, validação e PR da exceção), código e tela não. Próximo: E1.5 (commit do discovery) e a validação do dono, uma pergunta por vez.
- Sandbox: o GitHub precisa de `github.com` em `allowed_domains`.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha.
- O agente nunca abre nem lê o `.env`.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.
- NÃO tocar: o texto dos documentos, código, o `CLAUDE.md`, o briefing, o `.env`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): na worktree `/home/rodrigoisensee/MetricasDSPD-052c` (branch da F0 já mesclada), criar a `docs/059-apontamento-discovery` a partir da `origin/develop` e fazer push, sem commit novo e sem testes." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): proposta literal do texto da exceção para o `CLAUDE.md` e o briefing §7.1 (aplicada depois por PR que o dono revisa e mescla, sem editar os dois nesta etapa), e o desenho técnico enxuto da aba (coleta do worklog pela API do BusinessMap, carga incremental com chave do apontamento, de-para de pessoa por id, hierarquia até a iniciativa, calendário com feriados, dicionário de subgrupo configurável, classificação do comentário na fronteira, cálculos pela biblioteca T2.5) com as correções e melhorias à especificação, em `docs/architecture/features/059-aba-apontamento.md`, na worktree 052c, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): a especificação do dono (texto, sem o HTML) como protótipo: ajuste ao padrão do painel operacional e lista de melhorias e correções de interface, em `docs/ux/059-aba-apontamento.md`, na worktree 052c, sem commit, em paralelo à E1.2." · etapa de outra delegação; continua no pedido
- "E1.4 (security-engineer): modelo de ameaças da aba (nome de pessoa na API, visível a qualquer usuário; comentário do apontamento; chave do BusinessMap) e revisão proposta da ADR 0020, em `docs/security/059-aba-apontamento-ameacas.md`, na worktree 052c, sem commit, em paralelo à E1.2." · etapa de outra delegação; continua no pedido
- "E1.6 (dono): validar o desenho e as melhorias (ponto de compromisso)." · etapa de outra delegação; continua no pedido
- "E2.1 (a definir depois da E1.6): implementação, segurança, code review, QA, revisão de UX e PR." · etapa de outra delegação; continua no pedido
- A validação do dono (E1.6) e o PR; o quadro e o arquivo do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052c ls-remote origin refs/heads/docs/059-apontamento-discovery` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-052c rev-parse HEAD`
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c ls-files docs/architecture/features/059-aba-apontamento.md docs/ux/059-aba-apontamento.md docs/security/059-aba-apontamento-ameacas.md` · espera: linhas=3

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
