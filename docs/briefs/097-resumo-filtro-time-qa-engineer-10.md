## Objetivo
QA do L4 do pedido 097 (equipe opcional nas duas tendências do Resumo): branch `feature/097-l4-tendencia-equipe`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`, código em 440c863f8f04ca02a353747081d92e0c3f322b78 (contrato, bibliotecas de fluxo e sustentação, servidor e contratos regenerados), base develop f4c122f15c05fbf5fea86797c9c348656d11ab36.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff f4c122f15c05fbf5fea86797c9c348656d11ab36 440c863f8f04ca02a353747081d92e0c3f322b78`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/097-filtros-plano.md`, linha do L4.

## Entregar
- "E3.3 (qa-engineer): QA por lote do 097." (E3.3) Nesta delegação, o QA do L4.
- (E1) (E3.3) Rodar os testes tocados (contratos, `packages/metricas` das tendências e os testes do servidor das rotas de tendência) com no máximo 2 workers (R-TETO), e o `docs:check`; conferir que sem `equipe` o resultado é igual ao de antes, que com `equipe` a tendência só soma a equipe pedida e cada fonte só aceita as suas equipes (BusinessMap e Acelerato nunca misturados), que equipe inválida é recusada pelo `idSlug`, e que nenhuma saída compara equipes. Uma mutação (ignorar o filtro de equipe numa das bibliotecas) que o teste pega, restaurada antes do commit. Grave `docs/qa/097-l4-tendencia-equipe.md` (novo) só pela ferramenta Write, com `pedido: 097-resumo-filtro-time`, `branch: feature/097-l4-tendencia-equipe`, `commit: 440c863f8f04ca02a353747081d92e0c3f322b78`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado. Commit só do parecer com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/097-l4-tendencia-equipe` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/097-l4-tendencia-equipe.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/feature/097-l4-tendencia-equipe:docs/qa/097-l4-tendencia-equipe.md` · espera: contém 'commit: 440c863f8f04ca02a353747081d92e0c3f322b78'
