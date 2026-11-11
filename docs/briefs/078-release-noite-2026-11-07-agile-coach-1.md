Agente destino: forge:agile-coach
Pedido: 078-release-noite-2026-11-07
Tipo: codigo
Branch: docs/retros-2026-11-10   Base: develop   Base-sha: 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2
Etapa: codigo   Cobre: E1.7

## Objetivo
Retrospectiva do pedido 078 (release da develop até a main; PRs 282, 286, 287 e 288, na main desde 2026-11-10 16:44). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `docs/retros-2026-11-10` (já tem, sem commit, as retrospectivas do 084 e do 085, que não devem ser tocadas).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/078-release-noite-2026-11-07.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 078.

## Entregar
- "E1.7 (agile-coach): retrospectiva do pedido 078." (E1.7)
- (E1) (E1.7) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052c/docs/retrospectivas/2026-11-10-078-release.md`, no formato das retrospectivas da pasta: o que correu bem, o que travou (merges recusados pelo prazo do hook R-REVIEW; pareceres desatualizados pelos PRs que entraram depois; conferência de pareceres paralelos na mesma branch; os `ERRO-JARVIS` do Histórico como dado), retrabalho medido pelas conferências do 078, lead time pelo Histórico e as linhas `MELHORIA:` (uma por linha, com a evidência; o que é do Forge marcado "vai ao Forge"). Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 078-release-noite-2026-11-07 até d5389355145dad7898cfcfc5376f6318e3101337490ed1004560c2489653ddca (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/078-release-noite-2026-11-07.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.7 (copiadas literalmente):
- - 2026-11-10 12:42: DECISÃO DO DONO (literal): "a decisado P-078 e a A" (P-078-1: release agora com tudo o que está na develop, mesmo com 073, 075 e 077 parciais; o dono vai migrar para a VM oficial hoje). ESCOPO+ (dono): o E1 passa a ser a develop atual (5ba5b2a3d697ead96fd231d6662ee79f0e5d368d, PRs 238 a 279) inteira para a homolog e o PR de release homolog -> main; o PR 280 (085) e o do Forge 0.45.2 entram se mesclados antes da promoção. DECISÃO TÉCNICA (Jarvis): a release retoma pelas etapas E1.1 a E1.7 na branch docs/078-release a partir da develop atual, na worktree 052d (livre: o 8b já está na develop), em série (tech-lead, QA; o security-engineer em paralelo, sem commit, e o tech-lead leva o parecer); o merge na main é do dono (CLAUDE.md, "A main é do usuário"; a autorização da noite de 07/11 não vale mais).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/078-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/078-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release (coletor do Acelerato, ref-sync e derivador de bloqueio), na branch docs/078-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/078-release para a develop, squash com a CI verde, antes da E1.5." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde, --match-head-commit, sem --admin." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main; o merge segue a regra da noite do dono e o CLAUDE.md (ver Histórico)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/MetricasDSPD-052c/docs/retrospectivas/2026-11-10-078-release.md` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
