Agente destino: forge:tech-lead
Pedido: 090-release-2026-11-11
Tipo: codigo
Branch: docs/retros-2026-11-11   Base: develop   Base-sha: 61c30b1ea25982fcfa84f16466f79448cc46296a
Etapa: codigo   Cobre: E1.8

## Objetivo
Levar à develop as três retrospectivas escritas e não commitadas na worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `docs/retros-2026-11-11` (base develop 61c30b1e): `docs/retrospectivas/2026-11-11-088-forge-0455.md`, `docs/retrospectivas/2026-11-11-089-apontamento-d2-d3.md` e `docs/retrospectivas/2026-11-11-090-release.md`, com o review delas.

## Ler
- Os três arquivos acima (novo), na worktree.
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/reviews/078-retros-2026-11-10.md` (modelo do parecer).

## Entregar
- "E1.8 (tech-lead): review e envio das retrospectivas do 088, 089 e 090 (worktree 052c, branch docs/retros-2026-11-11): parecer de review, commit, push e PR para a develop; o merge é do dono." (E1.8)
- (E1) (E1.8) Trazer a develop (`git merge origin/develop`, sem rebase), rodar `pnpm run docs:check` e corrigir só forma de documentação se ele acusar. Commit dos três arquivos com `Cartão: K-204, K-213, K-255, K-261, K-262` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos três caminhos). Review das três (forma, nenhum dado pessoal nem avaliação individual, linhas MELHORIA com evidência) e parecer `docs/reviews/090-retros-2026-11-11.md` (novo) pela ferramenta Write, no formato do modelo, com `pedido: 090-release-2026-11-11`, `branch: docs/retros-2026-11-11`, `commit:` o sha40 do commit das retrospectivas e o veredito; commit só do parecer. Push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push -u origin HEAD:refs/heads/docs/retros-2026-11-11` (`github.com` em allowed_domains); commit e push em chamadas separadas. Se aprovado, abrir o PR para a develop pelo nome da branch, a partir da worktree, com corpo gravado por Write e passado com `--body-file`, e esperar a CI verde em laços de até 170 s por chamada. Não mesclar.
- arquivos: docs/retrospectivas/2026-11-11-088-forge-0455.md, docs/retrospectivas/2026-11-11-089-apontamento-d2-d3.md, docs/retrospectivas/2026-11-11-090-release.md, docs/reviews/090-retros-2026-11-11.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 090-release-2026-11-11 até 74c4dff7f5ff7c6b2a452e50513f874c9b5e939e9a4dbc648c9394baafa2de7b (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/090-release-2026-11-11.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release, na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/090-release para a develop, squash com a CI verde, antes da E1.5; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde; o merge é do tech-lead pelo CLAUDE.md (DECISÃO TÉCNICA de 2026-11-11 02:58), ou do dono se o hook recusar (K-250)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 090." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head docs/retros-2026-11-11 --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
