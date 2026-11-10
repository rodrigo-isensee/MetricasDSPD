Agente destino: forge:security-engineer
Pedido: 078-release-noite-2026-11-07
Tipo: review
Etapa: seguranca   Cobre: E1.3

## Objetivo
Parecer de segurança da release (pedido 078, P-078-1 = "A"): a develop atual (4388083c63ea04993f2b1fbb7c94d45e518008ce, PRs 238 a 280) contra a homolog, antes da promoção. Revisão estática, sem commit: o parecer fica na worktree `/home/rodrigoisensee/MetricasDSPD-052d` (branch `docs/078-release`, aberta pelo tech-lead) e o tech-lead o leva ao PR.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff --stat origin/homolog 4388083c63ea04993f2b1fbb7c94d45e518008ce` e, desse diff, o que toca coletor do Acelerato, ref-sync, projetor e derivador de bloqueio do BusinessMap, migrações, GRANT, `.github/`, scripts e dependências.
- Os pareceres de segurança dos lotes que já tiveram (`docs/security/` na develop: 073, 075, 085 e os do 069 L9-c).

## Entregar
- "E1.3 (security-engineer): parecer de segurança da release (coletor do Acelerato, ref-sync e derivador de bloqueio), na branch docs/078-release." (E1.3)
- (E1) (E1.3) Revisão estática da release: nenhuma credencial no código; o Acelerato só lido por GET com a allow-list de campos na fronteira (nome, e-mail, `usuarioKey`, descrição e título nunca passam); a API (`dspd_api`) sem colunas de pessoa (GRANT por coluna); nenhum dado de pessoa nas projeções novas (bloqueio); dependências novas com parecer; nada que afrouxe a CI ou o pre-push. Grave `docs/security/078-release.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 078-release-noite-2026-11-07`, `branch: docs/078-release`, `commit: 4388083c63ea04993f2b1fbb7c94d45e518008ce`, veredito e `## Achados` (até 300 caracteres por achado); se a worktree ainda não estiver na branch `docs/078-release`, grave o arquivo mesmo assim no caminho acima e diga no relatório; sem commit.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 078-release-noite-2026-11-07 até d5389355145dad7898cfcfc5376f6318e3101337490ed1004560c2489653ddca (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/078-release-noite-2026-11-07.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.3 (copiadas literalmente):
- - 2026-11-10 12:42: DECISÃO DO DONO (literal): "a decisado P-078 e a A" (P-078-1: release agora com tudo o que está na develop, mesmo com 073, 075 e 077 parciais; o dono vai migrar para a VM oficial hoje). ESCOPO+ (dono): o E1 passa a ser a develop atual (5ba5b2a3d697ead96fd231d6662ee79f0e5d368d, PRs 238 a 279) inteira para a homolog e o PR de release homolog -> main; o PR 280 (085) e o do Forge 0.45.2 entram se mesclados antes da promoção. DECISÃO TÉCNICA (Jarvis): a release retoma pelas etapas E1.1 a E1.7 na branch docs/078-release a partir da develop atual, na worktree 052d (livre: o 8b já está na develop), em série (tech-lead, QA; o security-engineer em paralelo, sem commit, e o tech-lead leva o parecer); o merge na main é do dono (CLAUDE.md, "A main é do usuário"; a autorização da noite de 07/11 não vale mais).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/078-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/078-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/078-release para a develop, squash com a CI verde, antes da E1.5." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde, --match-head-commit, sem --admin." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main; o merge segue a regra da noite do dono e o CLAUDE.md (ver Histórico)." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 078." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052d/docs/security/078-release.md`
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
