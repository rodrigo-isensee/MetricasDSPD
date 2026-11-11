## Objetivo
Terminar o envio das retrospectivas do 078, 084 e 085: a branch `docs/retros-2026-11-10` (worktree `/home/rodrigoisensee/MetricasDSPD-052c`, head 0e0b3049, já enviada) só de documentação, classe T. O `gh pr create` foi recusado pelo hook R-REVIEW por falta de parecer de review com `branch: docs/retros-2026-11-10`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c show --stat 0e0b3049` e os três arquivos de `docs/retrospectivas/` desse commit.
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/reviews/083-retros-2026-11-09.md` (modelo do parecer).

## Entregar
- "E1.8 (tech-lead): envio das retrospectivas do 078, 084 e 085 (worktree 052c, branch docs/retros-2026-11-10): commit, push e PR para a develop; o merge é do dono." (E1.8)
- (E1) (E1.8) Code review das três retrospectivas (forma, nenhum dado pessoal nem avaliação individual, linhas MELHORIA com evidência) e parecer `docs/reviews/078-retros-2026-11-10.md` (novo) pela ferramenta Write, no formato do modelo, com `pedido: 078-release-noite-2026-11-07`, `branch: docs/retros-2026-11-10`, `commit: 0e0b3049` em 40 caracteres e o veredito. Commit só do parecer (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/docs/retros-2026-11-10` (`github.com` em allowed_domains); commit e push em chamadas separadas. Se aprovado, abrir o PR para a develop pelo nome da branch, a partir da worktree, com o corpo de `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/pr-retros.md` com a seção "Pareceres" corrigida (por Write), passado com `--body-file`, e esperar a CI verde. Não mesclar.
- arquivos: docs/reviews/078-retros-2026-11-10.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head docs/retros-2026-11-10 --base develop --json number --jq .[].number` · espera: linhas=1
