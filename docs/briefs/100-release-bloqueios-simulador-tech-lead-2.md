## Objetivo
Release 100, segundo degrau: os três pareceres estão aprovados na branch `docs/100-release` (review a71366af, segurança aeba81a0, QA 17ffe670, todos sobre o CHANGELOG fc0f952a). Durante a release o dono mesclou na develop o PR 325 (K-271, com QA e review próprios aprovados), e a ponta da develop (`origin/develop`) já tem o PR 325. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`.

## Ler
- Os três pareceres da release na worktree: `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/100-release.md`, `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/100-release.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/qa/100-release.md` (os achados).

## Entregar
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." (E1.4)
- (E1) (E1.4) Atualizar `docs/100-release` com a develop só por merge (sem rebase nem force); acrescentar ao `CHANGELOG.md` a nota do PR 325 (K-271), num commit só do CHANGELOG com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito). Rodar da worktree `forge-check pr 100-release-bloqueios-simulador --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref docs/100-release --base develop`; se pedir revalidação de parecer por algo que não veio só da base (o PR 325 veio da base), pare e relate a saída. Aprovado, enviar com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release` (`github.com` em allowed_domains) e abrir o PR da `docs/100-release` para a `develop` (squash) pelo gh, com o corpo escrito pela ferramenta Write num arquivo do scratchpad e passado por `--body-file` (o que entra na release, os três pareceres, os achados recomendados, `Cartão: K-204`). Esperar os checks até o fim e relatar cada um, dizendo no fim se o PR está todo verde. Não mesclar: o merge é do dono.
- arquivos: CHANGELOG.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --head docs/100-release --state all --json number` · espera: contém 'number'
