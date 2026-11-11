## Objetivo
Levar à develop as duas retrospectivas escritas e não commitadas na worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `docs/retros-2026-11-11b` (base develop 87eaef8f): `docs/retrospectivas/2026-11-11-091-homolog-reavalia.md` e `docs/retrospectivas/2026-11-11-092-melhorias-tecnicas.md`, com o review delas.

## Ler
- Os dois arquivos acima (novo), na worktree.
- Um parecer de review recente de retrospectivas como modelo, por exemplo `docs/reviews/078-retros-2026-11-10.md` na develop.

## Entregar
- "E4.2 (tech-lead): review e envio das retrospectivas do 091 e do 092 (worktree 052g, branch docs/retros-2026-11-11b): parecer de review, commit, push e PR para a develop; o merge é do dono." (E4.2)
- (E1) (E2) (E3) (E5) (E4.2) Trazer a develop (`git merge origin/develop`, sem rebase), rodar `pnpm run docs:check` e corrigir só forma de documentação se ele acusar. Commit dos dois arquivos com `Cartão: K-121, K-172, K-174, K-263, K-264` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos dois caminhos). Review das duas (forma, nenhum dado pessoal nem avaliação individual, linhas MELHORIA com evidência) e parecer `docs/reviews/092-retros-2026-11-11b.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: docs/retros-2026-11-11b`, `commit:` o sha40 do commit das retrospectivas e o veredito; `## Achados` com linhas de até 300 caracteres; commit só do parecer. Push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/docs/retros-2026-11-11b` (`github.com` em allowed_domains); commit e push em chamadas separadas. Se aprovado, abrir o PR para a develop pelo nome da branch, a partir da worktree, com corpo gravado por Write e passado com `--body-file`, e esperar a CI em laços de até 170 s por chamada, com uma leitura final de `gh pr checks`; se o PR for mesclado no meio, registre e pare. Não mesclar.
- arquivos: docs/retrospectivas/2026-11-11-091-homolog-reavalia.md, docs/retrospectivas/2026-11-11-092-melhorias-tecnicas.md, docs/reviews/092-retros-2026-11-11b.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head docs/retros-2026-11-11b --base develop --json number --jq .[].number` · espera: linhas=1
