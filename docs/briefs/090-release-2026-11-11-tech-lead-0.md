## Objetivo
Release 090 (decisão A do dono: abre à 01:00 com o que está na develop): a develop em 85394c5b (PRs 293 a 297: 089 back-end e front-end, retrospectivas, Forge 0.45.5 e K-261) vai à homolog e o PR de release homolog para main fica aberto. Primeiro degrau: CHANGELOG e review na branch docs/090-release, worktree `/home/rodrigoisensee/MetricasDSPD-052h` (hoje na branch feature/089-apontamento-d2-d3, já mesclada; worktree limpa).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-052h log --oneline origin/homolog..85394c5b`.

## Entregar
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/090-release." (E1.1)
- (E1) (E1.1) Criar a branch: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052h status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052h fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052h switch -c docs/090-release 85394c5b` (a partir do sha, sem rastreio); conferir `branch --show-current` = `docs/090-release` (se não, pare e relate). Escrever no `CHANGELOG.md` as notas dos PRs 293 a 297, no formato das entradas anteriores; commit só desse arquivo com `Cartão: K-213` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito), push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/090-release` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, revisar a release: cada PR da lista tem review aprovado e entrou com a CI verde; o 089 (D2 e D3) traz a ordem de implantação registrada no PR 293 (`ref:sync` do dicionário v3 e `criterios-apontamento <data da primeira varredura completa>` no mesmo dia, depois a coleta de 12 meses), que vai ao corpo do PR de release; o interruptor `BLOQUEIOS_COM_DADO_REAL` segue desligado (o 6b não entra). Parecer `docs/reviews/090-release.md` (novo) gravado inteiro pela ferramenta Write, uma vez só, com `pedido: 090-release-2026-11-11`, `branch: docs/090-release`, `commit:` o sha40 do commit do CHANGELOG, veredito e `## Achados`; commit só do parecer com `Cartão: K-213`; push como acima; sem PR. Não rodar `pnpm run pronto` (é do QA).
- arquivos: CHANGELOG.md, docs/reviews/090-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/090-release:docs/reviews/090-release.md` · espera: contém 'pedido: 090-release-2026-11-11'
