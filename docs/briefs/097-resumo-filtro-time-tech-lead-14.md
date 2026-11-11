## Objetivo
PR do K-272 para a develop, pelo caminho que o seu diagnóstico achou: branch `fix/k272-ap-tipo-categoria`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, head b93e012a (código 1d691f4e, já conferido; merge limpo da develop em dbd120a4; QA e review aprovados). Com `--base develop`, o `forge-check pr` aprova este head.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/097-k272-ap-tipo.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/097-k272-ap-tipo.md`.

## Entregar
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." (E6.4)
- (E6) (E6.4) Rodar da worktree `forge-check pr 097-resumo-filtro-time --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref fix/k272-ap-tipo-categoria --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Conferir que a branch remota está em b93e012a (se não, enviar com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-ap-tipo-categoria`, com `github.com` em allowed_domains). Abrir o PR para a `develop` (squash) pelo gh, com corpo curto: o defeito (rótulo "Trabalho de produto" repetido no AP-TIPO), a decisão do dono "Agrupar", os pareceres de QA e review, o A3 recomendado, e `Cartão: K-272`. Se o hook recusar a abertura, pare e relate a mensagem literal. Esperar os checks e relatar cada um. Não mesclar: o merge é do dono.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/k272-ap-tipo-categoria --state all --json number` · espera: contém 'number'
