## Objetivo
Levar à develop as três retrospectivas escritas e não commitadas na worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `docs/retros-2026-11-10` (base 7a44f941): `docs/retrospectivas/2026-11-10-078-release.md`, `docs/retrospectivas/2026-11-10-084-forge-0450.md` e `docs/retrospectivas/2026-11-10-085-suite-unica-trava-no-pronto.md`.

## Ler
- Os três arquivos acima (novo), na worktree, só para conferir forma (`pnpm run docs:check` da raiz da worktree).

## Entregar
- "E1.8 (tech-lead): envio das retrospectivas do 078, 084 e 085 (worktree 052c, branch docs/retros-2026-11-10): commit, push e PR para a develop; o merge é do dono." (E1.8)
- (E1) (E1.8) Atualizar a branch com a develop (`git merge origin/develop`, sem rebase), rodar `pnpm run docs:check` e corrigir só forma de documentação se ele acusar. Um commit com os três arquivos e `Cartão:` com os cartões do 078, 084 e 085 conforme o quadro (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos três caminhos); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push -u origin HEAD:refs/heads/docs/retros-2026-11-10` (`github.com` em allowed_domains); commit e push em chamadas separadas. Abrir o PR para a develop pelo nome da branch, a partir da worktree, com corpo gravado por Write e passado com `--body-file`, e esperar a CI verde. Não mesclar.
- arquivos: docs/retrospectivas/2026-11-10-078-release.md, docs/retrospectivas/2026-11-10-084-forge-0450.md, docs/retrospectivas/2026-11-10-085-suite-unica-trava-no-pronto.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head docs/retros-2026-11-10 --base develop --json number --jq .[].number` · espera: linhas=1
