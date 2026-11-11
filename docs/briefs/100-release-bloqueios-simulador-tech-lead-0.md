## Objetivo
Release 100: a develop em 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047 (CI verde no run 43084376256) vai à homolog, e o PR de release homolog para main fica aberto para o dono. Primeiro degrau: CHANGELOG e review na branch `docs/100-release`, worktree `/home/rodrigoisensee/MetricasDSPD-052h` (hoje destacada na develop, sem mudança).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-052h log --oneline origin/homolog..77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047`.

## Entregar
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/100-release, worktree /home/rodrigoisensee/MetricasDSPD-052h." (E1.1)
- (E1) (E1.1) Criar a branch: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052h status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052h fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052h switch --no-track -c docs/100-release 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047`; conferir `branch --show-current` = `docs/100-release` (se não, pare e relate). Escrever no `CHANGELOG.md` as notas dos PRs que estão na develop e não na homolog (316 a 324), no formato das entradas anteriores; commit só desse arquivo com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, revisar a release: cada PR tem review aprovado; registrar quais entraram com checks ainda rodando (321, 322, 323, 324) e confirmar que a develop no 77c208a9 está verde (run 43084376256); o contrato do 9b (aceite de uso único) e a ADR 0030 coerentes; migrações novas, se houver. Parecer `docs/reviews/100-release.md` (novo) gravado inteiro pela ferramenta Write, uma vez só, com `pedido: 100-release-bloqueios-simulador`, `branch: docs/100-release`, `commit:` o sha40 do commit do CHANGELOG, veredito e `## Achados` com linhas de até 300 caracteres; commit só do parecer; push como acima; sem PR. Não rodar `pnpm run pronto` (é do QA).
- arquivos: CHANGELOG.md, docs/reviews/100-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/100-release:docs/reviews/100-release.md` · espera: contém 'branch: docs/100-release'
