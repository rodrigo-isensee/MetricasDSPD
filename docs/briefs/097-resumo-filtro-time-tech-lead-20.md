## Objetivo
Review do L4 do pedido 097 (equipe opcional nas duas tendências do Resumo): branch `feature/097-l4-tendencia-equipe`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`, código em 440c863f8f04ca02a353747081d92e0c3f322b78, QA aprovado em 35b99f3a com A1 recomendado, base develop f4c122f15c05fbf5fea86797c9c348656d11ab36.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff f4c122f15c05fbf5fea86797c9c348656d11ab36 440c863f8f04ca02a353747081d92e0c3f322b78`.
- `/home/rodrigoisensee/MetricasDSPD-052g/docs/qa/097-l4-tendencia-equipe.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/097-filtros-plano.md` (L4 e L7a).

## Entregar
- "E3.2 (tech-lead): review por lote do 097." (E3.2) Nesta delegação, o review do L4.
- (E1) (E3.2) Review: aderência ao L4; mudança de contrato compatível (entrada opcional) pela `politica-de-mudanca.md`; BusinessMap e Acelerato nunca misturados; sem comparação entre equipes; cálculo pela biblioteca compartilhada; o A1 do QA (a tendência da sustentação aceita qualquer slug e devolve recorte vazio) avaliado contra o L7a. Rodar os testes tocados com no máximo 2 workers (R-TETO). Parecer `docs/reviews/097-l4-tendencia-equipe.md` (novo) pela ferramenta Write, com `pedido: 097-resumo-filtro-time`, `branch: feature/097-l4-tendencia-equipe`, `commit: 440c863f8f04ca02a353747081d92e0c3f322b78` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/097-l4-tendencia-equipe` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/097-l4-tendencia-equipe.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/feature/097-l4-tendencia-equipe:docs/reviews/097-l4-tendencia-equipe.md` · espera: contém 'branch: feature/097-l4-tendencia-equipe'
