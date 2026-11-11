## Objetivo
Continuação da E1.4 da release 100: a branch `docs/100-release`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`, está no head local cab96b6138af3f30c7100e0fe57bd8d392f053b5 (merge da develop com o PR 325 e a nota dele no CHANGELOG), ainda não enviado. A entrega desse head foi conferida pelo Jarvis às 17:15 (linha no Histórico do pedido).

## Ler
- O Histórico do pedido `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/100-release-bloqueios-simulador.md` (a linha "entrega conferida cab96b61...").

## Entregar
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." (E1.4) Nesta delegação, enviar e abrir o PR.
- (E1) (E1.4) Rodar da worktree `forge-check pr 100-release-bloqueios-simulador --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref docs/100-release --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Enviar com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release` (`github.com` em allowed_domains) e abrir o PR da `docs/100-release` para a `develop` (squash) pelo gh, com o corpo escrito pela ferramenta Write num arquivo do scratchpad e passado por `--body-file` (o que entra na release, os três pareceres, os achados recomendados, `Cartão: K-204`). Esperar os checks até o fim e relatar cada um, dizendo no fim se o PR está todo verde. Não mesclar: o merge é do dono.
- arquivos: nenhum

## Pronto quando
- PQ-1 (cmd): `gh pr list --head docs/100-release --state all --json number` · espera: contém 'number'
