Agente destino: forge:tech-lead
Pedido: 059-aba-apontamento
Tipo: codigo
Branch: docs/059-apontamento-discovery   Base: develop   Base-sha: 4a01e39384ef108d6adba942f56623a2750d3cfd
Etapa: codigo   Cobre: E1.1

## Objetivo
Preparar a branch do discovery da aba Apontamento, que começa já em paralelo ao 052 (pedido 059, E1.1, K-193). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c status -sb` (a branch atual é a da F0, já mesclada).

## Entregar
- "E1.1 (tech-lead): na worktree `/home/rodrigoisensee/MetricasDSPD-052c` (branch da F0 já mesclada), criar a `docs/059-apontamento-discovery` a partir da `origin/develop` e fazer push, sem commit novo e sem testes." (E1.1)
- (E1.1) `git -C /home/rodrigoisensee/MetricasDSPD-052c fetch origin`, `git -C /home/rodrigoisensee/MetricasDSPD-052c switch -c docs/059-apontamento-discovery --no-track origin/develop`, `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/docs/059-apontamento-discovery`; sem commit novo, sem pnpm install e sem testes.
- (E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-01): "A" (exceção à regra de métrica individual): registrar formalmente a exceção para a aba Apontamento no CLAUDE.md e no briefing, por PR que o dono revisa e mescla; discovery com o security-engineer (controle de acesso, revisão da ADR 0020).
- DECISÃO DO DONO (2026-11-01): "C" (quem vê a aba): qualquer usuário do painel, inclusive fora do time.
- DECISÃO DO DONO (2026-11-01): "Por enquanto sim" (recibo confirmado).
- DECISÃO DO DONO (2026-11-01): "A, mas veja senão tem melhorias a propor e correções então toque o discovery gostaria de entregar ata amanhã também" (começa agora, discovery com melhorias e correções, entrega desejada até 2026-11-02).
- ADR 0020 (citada no pedido): nenhum nome de pessoa em documento, saída ou log desta etapa.
- Erro recorrente deste destino (forge-check, 30 dias): base em 13 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 11 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 7 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- Sandbox: o GitHub precisa de `github.com` em `allowed_domains`.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha.
- O agente nunca abre nem lê o `.env`.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.
- NÃO tocar: a branch da F0 (só sai dela), as outras worktrees, o `.env` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (software-architect): texto da exceção no `CLAUDE.md` e no briefing §7.1, e o desenho técnico enxuto da aba (coleta do worklog pela API do BusinessMap, carga incremental com chave do apontamento, de-para de pessoa por id, hierarquia até a iniciativa, calendário com feriados, dicionário de subgrupo configurável, classificação do comentário na fronteira, cálculos pela biblioteca T2.5) com as correções e melhorias à especificação, em `docs/architecture/features/059-aba-apontamento.md`, na worktree 052c, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): a especificação e o HTML como protótipo: ajuste ao padrão do painel operacional e lista de melhorias e correções de interface, em `docs/ux/059-aba-apontamento.md`, na worktree 052c, sem commit, em paralelo à E1.2." · etapa de outra delegação; continua no pedido
- "E1.4 (security-engineer): modelo de ameaças da aba (nome de pessoa na API, visível a qualquer usuário; comentário do apontamento; chave do BusinessMap) e revisão proposta da ADR 0020, em `docs/security/059-aba-apontamento-ameacas.md`, na worktree 052c, sem commit, em paralelo à E1.2." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): commit e push do discovery (E1.2 a E1.4) na `docs/059-apontamento-discovery`, sem PR." · etapa de outra delegação; continua no pedido
- "E1.6 (dono): validar o desenho e as melhorias (ponto de compromisso)." · etapa de outra delegação; continua no pedido
- "E2.1 (a definir depois da E1.6): implementação, segurança, code review, QA, revisão de UX e PR." · etapa de outra delegação; continua no pedido
- Os documentos do discovery e o commit deles (etapas seguintes); o quadro e o arquivo do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052c ls-remote origin refs/heads/docs/059-apontamento-discovery` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-052c rev-parse HEAD`
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c branch --show-current` · espera: igual 'docs/059-apontamento-discovery'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
