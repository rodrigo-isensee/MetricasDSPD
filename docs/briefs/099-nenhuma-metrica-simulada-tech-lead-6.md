## Objetivo
PR do L1 do pedido 099 (desligar o simulador) para a develop: branch `fix/099-l1-sem-simulador`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, head local 9cf5cb96 (código dec8924c; análises e ADRs na branch; merge limpo da develop em b7d0e684, entrega conferida às 15:11; QA revalidado em a03dc1b3 e review revalidado em 9cf5cb96, ambos aprovados). Nada enviado ainda.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/099-l1-sem-simulador.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/qa/099-l1-sem-simulador.md`.

## Entregar
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono." (E2.5)
- (E2) (E2.5) Rodar da worktree `forge-check pr 099-nenhuma-metrica-simulada --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref fix/099-l1-sem-simulador --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Enviar com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l1-sem-simulador` (`github.com` em allowed_domains). Abrir o PR para a `develop` (squash) pelo gh, com corpo curto: o que muda para o dono (nenhum número simulado na web; cartões sem dado real mostram "Sem dado real"), a ADR 0030, os pareceres, o A1 recomendado e `Cartão: K-275`. Se o hook recusar, pare e relate a mensagem literal. Esperar os checks e relatar cada um. Não mesclar: o merge é do dono.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/099-l1-sem-simulador --state all --json number` · espera: contém 'number'
