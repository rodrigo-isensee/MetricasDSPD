Agente destino: forge:security-engineer
Pedido: 059-aba-apontamento
Tipo: codigo
Branch: docs/059-apontamento-discovery   Base: develop   Base-sha: 4a01e39384ef108d6adba942f56623a2750d3cfd
Etapa: codigo   Cobre: E1.4

## Objetivo
Modelo de ameaças da aba Apontamento (nome de pessoa na API, visível a qualquer usuário do painel) e revisão proposta da ADR 0020 (pedido 059, E1.4, K-193). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`.

## Ler
- `/tmp/claude-1000/espec-059-apontamento.md`, seções 2, 3 e 6 a 10; a ADR 0020 e `docs/security/adr-0020-protecao-de-pessoa.md`; `docs/security/052-integracao-businessmap-ameacas.md`.

## Entregar
- "E1.4 (security-engineer): modelo de ameaças da aba (nome de pessoa na API, visível a qualquer usuário; comentário do apontamento; chave do BusinessMap) e revisão proposta da ADR 0020, em `docs/security/059-aba-apontamento-ameacas.md`, na worktree 052c, sem commit, em paralelo à E1.2." (E1.4)
- (E1.4) Em `docs/security/059-aba-apontamento-ameacas.md`: ameaças e controles da coleta do worklog (chave do BusinessMap, só GET, allow-list sem o comentário na base), do nome de pessoa exposto pela API a qualquer usuário do painel (papel novo ou GRANT por coluna, exportação, logs), da retenção; a revisão proposta da ADR 0020 (o que muda e o que não muda); as perguntas ao dono.
- (E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-01): "A" (exceção à regra de métrica individual): registrar formalmente a exceção para a aba Apontamento no CLAUDE.md e no briefing, por PR que o dono revisa e mescla; discovery com o security-engineer (controle de acesso, revisão da ADR 0020).
- DECISÃO DO DONO (2026-11-01): "C" (quem vê a aba): qualquer usuário do painel, inclusive fora do time.
- DECISÃO DO DONO (2026-11-01): "Por enquanto sim" (recibo confirmado).
- DECISÃO DO DONO (2026-11-01): "A, mas veja senão tem melhorias a propor e correções então toque o discovery gostaria de entregar ata amanhã também" (começa agora, discovery com melhorias e correções, entrega desejada até 2026-11-02).
- ADR 0020 (citada no pedido): nenhum nome de pessoa em documento, saída ou log desta etapa.
- Erro recorrente deste destino (forge-check, 30 dias): forma em 4 entregas · evita: cole inteira a saída de `forge-check brief mensagem` (R-BRIEF)
- Erro recorrente deste destino (forge-check, 30 dias): base em 3 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- A especificação do dono (Especificação do Painel de Capacidade, seções 1 a 10) está fora do repositório em `/tmp/claude-1000/espec-059-apontamento.md`, sem nome de pessoa; nenhum nome de pessoa, nem do HTML nem da especificação, entra em documento do repositório (ADR 0020).
- O HTML de referência do dono fica fora do repositório e não é lido: tem nomes de pessoa; a especificação basta.
- Regras do projeto que seguem valendo: BusinessMap e Acelerato nunca se misturam; tempo e percentis só pela biblioteca T2.5; abaixo de 20 itens não se publica estatística; carga incremental sem sobrescrever histórico; dúvida de regra de negócio vira pergunta ao dono no documento, não decisão.
- Prazo: o dono quer entregar a aba até 2026-11-02; o documento diz o que cabe nesse prazo e o que fica para depois, em fatias.
- Escreva só pela ferramenta Write ou Edit, na worktree /home/rodrigoisensee/MetricasDSPD-052c (branch docs/059-apontamento-discovery), sem commit; frase de regra só pelo ID.
- O agente nunca abre nem lê o `.env`.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.
- NÃO tocar: código, os documentos dos outros papéis desta rodada, o `.env`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): na worktree `/home/rodrigoisensee/MetricasDSPD-052c` (branch da F0 já mesclada), criar a `docs/059-apontamento-discovery` a partir da `origin/develop` e fazer push, sem commit novo e sem testes." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): texto da exceção no `CLAUDE.md` e no briefing §7.1, e o desenho técnico enxuto da aba (coleta do worklog pela API do BusinessMap, carga incremental com chave do apontamento, de-para de pessoa por id, hierarquia até a iniciativa, calendário com feriados, dicionário de subgrupo configurável, classificação do comentário na fronteira, cálculos pela biblioteca T2.5) com as correções e melhorias à especificação, em `docs/architecture/features/059-aba-apontamento.md`, na worktree 052c, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): a especificação e o HTML como protótipo: ajuste ao padrão do painel operacional e lista de melhorias e correções de interface, em `docs/ux/059-aba-apontamento.md`, na worktree 052c, sem commit, em paralelo à E1.2." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): commit e push do discovery (E1.2 a E1.4) na `docs/059-apontamento-discovery`, sem PR." · etapa de outra delegação; continua no pedido
- "E1.6 (dono): validar o desenho e as melhorias (ponto de compromisso)." · etapa de outra delegação; continua no pedido
- "E2.1 (a definir depois da E1.6): implementação, segurança, code review, QA, revisão de UX e PR." · etapa de outra delegação; continua no pedido
- O commit do discovery (E1.5) e a validação do dono (E1.6); o quadro e o arquivo do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/MetricasDSPD-052c/docs/security/059-aba-apontamento-ameacas.md` existe com a seção da revisão proposta da ADR 0020

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
