## Objetivo
O PR 298 (lote 6b, `feature/075-l6b-publicacao-real`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, ponta 74ec452e) ficou em conflito com a develop depois dos merges da noite (release 090). O único arquivo em conflito é `CHANGELOG.md`: os dois lados acrescentaram notas. Review, segurança e QA do lote já estão aprovados sobre o código bd76128a.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d merge-tree --write-tree --name-only origin/develop origin/feature/075-l6b-publicacao-real` (só CHANGELOG.md em conflito).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9) Nesta delegação, só o lote 6b.
- (E1) (E4) (E1.9) Na worktree limpa: `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin`, `git merge origin/develop` (sem rebase) e resolver o conflito do `CHANGELOG.md` mantendo as notas dos dois lados (as da release 090 e a do 6b), sem mudar o texto de nenhuma; se outro arquivo entrar em conflito, pare e relate. Conferir que o diff da branch contra a develop continua só o do lote 6b. Commit do merge com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad), push em segundo plano (decisão técnica de 2026-11-07 17:01), esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/075-l6b-publicacao-real` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, esperar a CI verde do PR 298 (`testes` e `e2e`) em laços de até 170 s por chamada. Não mesclar nesta delegação (quem mescla o 6b segue a DECISÃO TÉCNICA de 2026-11-11 00:28 do Histórico, a última sobre o merge, que substitui a linha de 00:25).
- (E2, E3, E5) Nada a entregar aqui: não nesta delegação.
- arquivos: CHANGELOG.md

## Pronto quando
- PQ-1 (cmd): `gh pr view 298 --repo rodrigo-isensee/MetricasDSPD --json mergeStateStatus --jq .mergeStateStatus` · espera: contém 'CLEAN'
