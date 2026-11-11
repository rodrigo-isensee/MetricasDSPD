Agente destino: forge:tech-lead
Pedido: 090-release-2026-11-11
Tipo: merge
Branch: origin/develop   Base: homolog   Base-sha: 3773e7da46453836ad53785cc6cca12254cd8dc2
Etapa: pr   Cobre: E1.5

## Objetivo
Release 090, terceiro degrau: PR da develop (com o PR 299 da docs/090-release já mesclado: CHANGELOG e os pareceres de review, segurança e QA aprovados) para a homolog. Worktree `/home/rodrigoisensee/MetricasDSPD-052h` (só para rodar o `gh` a partir do repositório).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`.
- Os pareceres `docs/reviews/090-release.md` (novo), `docs/security/090-release.md` (novo) e `docs/qa/090-release.md` (novo), que o PR 299 levou à develop: ler com `git show` sobre `origin/develop` na worktree 052h.

## Entregar
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde; o merge é do dono (K-250)." (E1.5)
- (E1) (E1.5) Conferir que a develop contém o PR 299 e não contém o PR 298 (6b), que fica fora desta release (se o 298 estiver na develop, pare e relate antes de abrir). Abrir o PR da develop para a homolog (`--base homolog --head develop`; corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-262`; os PRs 293 a 297 e 299; o achado A1 do QA: conferir no check-run da suíte completa com banco os testes que ficaram pulados no pronto local) e esperar o portão da homolog verde em laços de até 170 s por chamada. Não mesclar (o merge, por merge commit, é do dono, E1.5). Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 090-release-2026-11-11 até 74c4dff7f5ff7c6b2a452e50513f874c9b5e939e9a4dbc648c9394baafa2de7b (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/090-release-2026-11-11.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release, na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/090-release para a develop, squash com a CI verde, antes da E1.5; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 090." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head develop --base homolog --json number,state --jq .[0].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
