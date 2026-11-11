Agente destino: forge:tech-lead
Pedido: 078-release-noite-2026-11-07
Tipo: codigo
Branch: docs/retros-2026-11-10   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.8

## Objetivo
Terminar o envio das retrospectivas do 078, 084 e 085: a branch `docs/retros-2026-11-10` (worktree `/home/rodrigoisensee/MetricasDSPD-052c`, head 0e0b3049, já enviada) só de documentação, classe T. O `gh pr create` foi recusado pelo hook R-REVIEW por falta de parecer de review com `branch: docs/retros-2026-11-10`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c show --stat 0e0b3049` e os três arquivos de `docs/retrospectivas/` desse commit.
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/reviews/083-retros-2026-11-09.md` (modelo do parecer).

## Entregar
- "E1.8 (tech-lead): envio das retrospectivas do 078, 084 e 085 (worktree 052c, branch docs/retros-2026-11-10): commit, push e PR para a develop; o merge é do dono." (E1.8)
- (E1) (E1.8) Code review das três retrospectivas (forma, nenhum dado pessoal nem avaliação individual, linhas MELHORIA com evidência) e parecer `docs/reviews/078-retros-2026-11-10.md` (novo) pela ferramenta Write, no formato do modelo, com `pedido: 078-release-noite-2026-11-07`, `branch: docs/retros-2026-11-10`, `commit: 0e0b3049` em 40 caracteres e o veredito. Commit só do parecer (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/docs/retros-2026-11-10` (`github.com` em allowed_domains); commit e push em chamadas separadas. Se aprovado, abrir o PR para a develop pelo nome da branch, a partir da worktree, com o corpo de `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/pr-retros.md` com a seção "Pareceres" corrigida (por Write), passado com `--body-file`, e esperar a CI verde. Não mesclar.
- arquivos: docs/reviews/078-retros-2026-11-10.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 078-release-noite-2026-11-07 até 789e2cc8f226a15e3f1c605022418eafe8b5f0cef4515968c36879e06d059962 (3 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/078-release-noite-2026-11-07.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.8 (copiadas literalmente):
- - 2026-11-10 12:42: DECISÃO DO DONO (literal): "a decisado P-078 e a A" (P-078-1: release agora com tudo o que está na develop, mesmo com 073, 075 e 077 parciais; o dono vai migrar para a VM oficial hoje). ESCOPO+ (dono): o E1 passa a ser a develop atual (5ba5b2a3d697ead96fd231d6662ee79f0e5d368d, PRs 238 a 279) inteira para a homolog e o PR de release homolog -> main; o PR 280 (085) e o do Forge 0.45.2 entram se mesclados antes da promoção. DECISÃO TÉCNICA (Jarvis): a release retoma pelas etapas E1.1 a E1.7 na branch docs/078-release a partir da develop atual, na worktree 052d (livre: o 8b já está na develop), em série (tech-lead, QA; o security-engineer em paralelo, sem commit, e o tech-lead leva o parecer); o merge na main é do dono (CLAUDE.md, "A main é do usuário"; a autorização da noite de 07/11 não vale mais).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/078-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/078-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release (coletor do Acelerato, ref-sync e derivador de bloqueio), na branch docs/078-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/078-release para a develop, squash com a CI verde, antes da E1.5." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde, --match-head-commit, sem --admin." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main; o merge segue a regra da noite do dono e o CLAUDE.md (ver Histórico)." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 078." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head docs/retros-2026-11-10 --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
