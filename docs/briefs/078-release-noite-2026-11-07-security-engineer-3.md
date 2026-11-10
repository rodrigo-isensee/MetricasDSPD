Agente destino: forge:security-engineer
Pedido: 078-release-noite-2026-11-07
Tipo: review
Branch: docs/078-release   Base: develop   Base-sha: 4388083c63ea04993f2b1fbb7c94d45e518008ce
Etapa: seguranca   Cobre: E1.3
Revisar-sha: 8548bc178522c910637a591b5a7cb2b5c30b797d

## Objetivo
Commitar e enviar o parecer de segurança da release (pedido 078, E1.3), já gravado pelo security-engineer na worktree `/home/rodrigoisensee/MetricasDSPD-052d` (branch `docs/078-release`), sem mudar o conteúdo.

## Ler
- O cabeçalho de `/home/rodrigoisensee/MetricasDSPD-052d/docs/security/078-release.md` (novo).

## Entregar
- "E1.3 (security-engineer): parecer de segurança da release (coletor do Acelerato, ref-sync e derivador de bloqueio), na branch docs/078-release." (E1.3) Nesta delegação, só o commit e o envio do parecer já gravado.
- (E1) (E1.3) Conferir `git -C /home/rodrigoisensee/MetricasDSPD-052d rev-parse --abbrev-ref HEAD` = `docs/078-release`; commitar só `docs/security/078-release.md` (sem mudar o conteúdo), com `git add` explícito pelo caminho e mensagem `docs(security): parecer de segurança da release 078` com `Cartão: K-242` (por `git commit -F` de arquivo gravado por Write no scratchpad); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/docs/078-release` (`github.com` em allowed_domains); sem PR.

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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/docs/078-release:docs/security/078-release.md` · espera: contém 'pedido: 078-release-noite-2026-11-07'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
