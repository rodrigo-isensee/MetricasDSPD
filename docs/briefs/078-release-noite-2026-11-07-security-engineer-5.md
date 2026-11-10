Agente destino: forge:security-engineer
Pedido: 078-release-noite-2026-11-07
Tipo: review
Branch: docs/078-release-b   Base: develop   Base-sha: 31d98e278a016d88f458b963fcb22d9734e0e722
Etapa: seguranca   Cobre: E1.3
Revisar-sha: ace67959d5560fb3563cf3230e11776e00506a3c

## Objetivo
Volta do parecer de segurança da release 078 sobre a develop atual (DECISÃO TÉCNICA do Histórico do pedido de 2026-11-10, a última): entraram na develop os PRs 281 (Forge 0.45.2), 283 (categoria do erro no ref-sync do apontamento), 284 (comando da demo com dado real, que lê o `.env` do dono) e 285 (tendência da sustentação). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `docs/078-release-b`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff origin/homolog 31d98e278a016d88f458b963fcb22d9734e0e722 --stat` e o parecer anterior `docs/security/078-release.md` na worktree.

## Entregar
- "E1.3 (security-engineer): parecer de segurança da release (coletor do Acelerato, ref-sync e derivador de bloqueio), na branch docs/078-release." (E1.3) Nesta volta, na branch `docs/078-release-b`, cobrindo também o que entrou depois do parecer anterior.
- (E1) (E1.3) Revisão estática do delta (sem rodar nada contra base real nem ler `.env*`). Regrave `docs/security/078-release.md` inteiro pela ferramenta Write, uma vez só, com `pedido: 078-release-noite-2026-11-07`, `branch: docs/078-release-b`, `commit:` ace67959d5560fb3563cf3230e11776e00506a3c (o commit do CHANGELOG do tech-lead), veredito e `## Achados`; commit só desse arquivo com `Cartão: K-242` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito), depois do commit do parecer de review do tech-lead (já na branch, 82c176db); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/docs/078-release-b` (`github.com` em allowed_domains); sem PR.
- arquivos: docs/security/078-release.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 078-release-noite-2026-11-07 até d5389355145dad7898cfcfc5376f6318e3101337490ed1004560c2489653ddca (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/078-release-noite-2026-11-07.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.3 (copiadas literalmente):
- - 2026-11-10 12:42: DECISÃO DO DONO (literal): "a decisado P-078 e a A" (P-078-1: release agora com tudo o que está na develop, mesmo com 073, 075 e 077 parciais; o dono vai migrar para a VM oficial hoje). ESCOPO+ (dono): o E1 passa a ser a develop atual (5ba5b2a3d697ead96fd231d6662ee79f0e5d368d, PRs 238 a 279) inteira para a homolog e o PR de release homolog -> main; o PR 280 (085) e o do Forge 0.45.2 entram se mesclados antes da promoção. DECISÃO TÉCNICA (Jarvis): a release retoma pelas etapas E1.1 a E1.7 na branch docs/078-release a partir da develop atual, na worktree 052d (livre: o 8b já está na develop), em série (tech-lead, QA; o security-engineer em paralelo, sem commit, e o tech-lead leva o parecer); o merge na main é do dono (CLAUDE.md, "A main é do usuário"; a autorização da noite de 07/11 não vale mais).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/078-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/078-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/078-release para a develop, squash com a CI verde, antes da E1.5." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde, --match-head-commit, sem --admin." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main; o merge segue a regra da noite do dono e o CLAUDE.md (ver Histórico)." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 078." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/docs/078-release-b:docs/security/078-release.md` · espera: contém 'commit: ace67959d5560fb3563cf3230e11776e00506a3c'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
