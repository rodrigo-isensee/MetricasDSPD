Agente destino: forge:tech-lead
Pedido: 090-release-2026-11-11
Tipo: codigo
Branch: docs/090-release   Base: develop   Base-sha: 85394c5b3c04d38028436609d4acd70e90e3f29a
Etapa: codigo   Cobre: E1.4

## Objetivo
Release 090, segundo degrau: PR da branch `docs/090-release` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`; CHANGELOG 81e30293048c0448066ca1ebd831074e5c82ddfb, review 6e819bad, segurança b4c981a3 e QA bf341ede, todos aprovados; QA com `pnpm run pronto` rc=0) para a develop.

## Ler
- Na worktree: `docs/reviews/090-release.md` (novo), `docs/security/090-release.md` (novo) e `docs/qa/090-release.md` (novo).

## Entregar
- "E1.4 (tech-lead): PR da docs/090-release para a develop, squash com a CI verde, antes da E1.5; o merge é do dono (K-250)." (E1.4)
- (E1) (E1.4) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-262`; os três pareceres e os achados recomendados) e esperar a CI verde (`testes` e `e2e`) em laços de até 170 s por chamada. Não mesclar (o merge é do dono, E1.4). Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 090-release-2026-11-11 até 74c4dff7f5ff7c6b2a452e50513f874c9b5e939e9a4dbc648c9394baafa2de7b (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/090-release-2026-11-11.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release, na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 090." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head docs/090-release --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
