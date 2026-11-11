Agente destino: forge:tech-lead
Pedido: 090-release-2026-11-11
Tipo: merge
Branch: origin/develop   Base: homolog   Base-sha: 3773e7da46453836ad53785cc6cca12254cd8dc2
Etapa: merge-integracao   Cobre: E1.5

## Objetivo
Release 090, merge do PR 300 (develop para a homolog; head do PR 299 já mesclado), aberto pelo tech-lead com o portão verde e CLEAN (rapida, testes, banco, openapi, imagem, build, perf, e2e). Worktree `/home/rodrigoisensee/MetricasDSPD-052h` (só para rodar o `gh` a partir do repositório).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`, seção da promoção para a homolog.

## Entregar
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde; o merge é do tech-lead pelo CLAUDE.md (DECISÃO TÉCNICA de 2026-11-11 02:58), ou do dono se o hook recusar (K-250)." (E1.5)
- (E1) (E1.5) Conferir que o PR 300 segue OPEN, CLEAN, com os checks verdes e o head igual ao da CI verde, o merge do PR 299 (se o head mudou ou algum check não está verde, pare e relate). Rodar `forge-check pr 090-release-2026-11-11 --ref origin/develop --base origin/homolog` e, aprovado, mesclar por merge commit: `gh pr merge develop --repo rodrigo-isensee/MetricasDSPD --merge --match-head-commit` com o sha40 do head (o PR 300 pelo nome da branch) (nunca `--admin`, `--squash` nem `--rebase`). Se o hook ou o sistema de permissões recusar, pare e relate a mensagem literal (não contorne; o merge fica para o dono). Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 090-release-2026-11-11 até 74c4dff7f5ff7c6b2a452e50513f874c9b5e939e9a4dbc648c9394baafa2de7b (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/090-release-2026-11-11.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres, outras worktrees, a `develop` e a `main`; a `homolog` só pelo merge do PR 300; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release, na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/090-release para a develop, squash com a CI verde, antes da E1.5; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 090." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr view 300 --repo rodrigo-isensee/MetricasDSPD --json state --jq .state` · espera: contém 'MERGED'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
