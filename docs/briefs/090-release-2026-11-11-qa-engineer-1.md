Agente destino: forge:qa-engineer
Pedido: 090-release-2026-11-11
Tipo: codigo
Branch: docs/090-release   Base: develop   Base-sha: 85394c5b3c04d38028436609d4acd70e90e3f29a
Etapa: codigo   Cobre: E1.2

## Objetivo
QA da release 090: a develop em 85394c5b (PRs 293 a 297) na branch `docs/090-release` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, com o CHANGELOG 81e30293048c0448066ca1ebd831074e5c82ddfb, o review e o parecer de segurança).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/090-release.md` (novo) e `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/090-release.md` (novo).

## Entregar
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/090-release." (E1.2)
- (E1) (E1.2) Na worktree, rodar `pnpm run pronto` sozinho na máquina (tarefa pesada; instale as dependências antes, se faltarem, com `CI=true pnpm install --frozen-lockfile`, `registry.npmjs.org` em allowed_domains; a saída vai para arquivo no scratchpad desde o início; em segundo plano se passar de 170 s, esperando o fim sem rodar outra suíte) e conferir o rc. Falha que for carga da máquina (tempo estourado) e passar ao rodar o arquivo sozinho vai como achado, não como bug. Grave `docs/qa/090-release.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 090-release-2026-11-11`, `branch: docs/090-release`, `commit: 81e30293048c0448066ca1ebd831074e5c82ddfb`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-262` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/090-release` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/qa/090-release.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 090-release-2026-11-11 até 74c4dff7f5ff7c6b2a452e50513f874c9b5e939e9a4dbc648c9394baafa2de7b (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/090-release-2026-11-11.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release, na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/090-release para a develop, squash com a CI verde, antes da E1.5; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 090." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/090-release:docs/qa/090-release.md` · espera: contém 'pedido: 090-release-2026-11-11'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
