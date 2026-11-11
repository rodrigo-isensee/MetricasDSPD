## Objetivo
Volta da release 100, QA: o PR 325 (K-271) entrou na develop depois do parecer de QA da release. Branch `docs/100-release-b` (a partir da develop 27ac9064fc4ffad4e7f3bf18241aa1979912c009; review e segurança revalidados), worktree `/home/rodrigoisensee/MetricasDSPD-052h`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff c7c3e092~1 c7c3e092` (o K-271).
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/qa/100-release.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/qa/096-k271-criterios-robustez.md`.

## Entregar
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/100-release." (E1.3) Nesta volta, na branch `docs/100-release-b`.
- (E1) (E1.3) Revalidar o QA da release sobre o delta: rodar `server/tests/criterios-apontamento-entrada.test.ts` com no máximo 2 workers (o resto do range já foi testado no parecer anterior) e conferir o CI da develop no c7c3e092 (run 43088790240) e no 27ac9064. Regravar `docs/qa/100-release.md` inteiro só pela ferramenta Write, com `pedido: 100-release-bloqueios-simulador`, `branch: docs/100-release-b`, `commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release-b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/qa/100-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/100-release-b:docs/qa/100-release.md` · espera: contém 'branch: docs/100-release-b'
