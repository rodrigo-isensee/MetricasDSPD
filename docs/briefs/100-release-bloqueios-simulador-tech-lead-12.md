## Objetivo
PR da volta da release 100 para a develop: branch `docs/100-release-b` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 2b85b70e, já no remoto), com os quatro pareceres da release revalidados (review d5d9d40b, segurança 0c43e495, QA b2c8e252, devops 2b85b70e) e confirmados sob o pedido 100-REV. A entrega desse head foi conferida às 17:48.

## Ler
- Os pareceres da branch: `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/100-release.md`, `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/100-release.md`, `/home/rodrigoisensee/MetricasDSPD-052h/docs/qa/100-release.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/100-release.md`.

## Entregar
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." (E1.4) Nesta delegação, o PR da volta.
- (E1) (E1.4) Rodar da worktree `forge-check pr 100-release-bloqueios-simulador --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref docs/100-release-b --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Abrir o PR da branch para a `develop` (squash) pelo gh, com o corpo escrito pela ferramenta Write num arquivo do scratchpad e passado por `--body-file` (os quatro pareceres revalidados, o motivo da volta, `Cartão: K-204`). Esperar os checks até o fim em laços de até 170 s e relatar cada um, dizendo no fim se o PR está todo verde. Não mesclar: o merge é do dono.
- arquivos: nenhum

## Pronto quando
- PQ-1 (cmd): `gh pr list --head docs/100-release-b --state all --json number` · espera: contém 'number'
