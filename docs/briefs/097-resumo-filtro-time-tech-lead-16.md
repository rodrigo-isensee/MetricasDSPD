## Objetivo
Review da correção do teste do K-272 (classe T, só teste): branch `fix/k272-teste-pg`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, código em 6a285daa27889d150e36bdee95b4a7aa4ac05c16, base develop 443c99cf296ec830c50f077ef0efd9ff482ff152. A develop está vermelha no check `banco` porque `server/tests/apontamento-rota.pg.test.ts` ainda esperava um type_id por opção; o autor ajustou o caso do filtro por tipo ao agrupamento por categoria e acrescentou um card de outra categoria para provar que o filtro separa. Não há PostgreSQL de teste local: o `.pg` rodou "skipped"; a prova é o check `banco` do CI.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff 443c99cf296ec830c50f077ef0efd9ff482ff152 6a285daa27889d150e36bdee95b4a7aa4ac05c16`.

## Entregar
- "E6.2 (tech-lead): review do K-272." (E6.2) Nesta delegação, o review da correção do teste .pg.
- (E6) (E6.2) Review: o teste prova o comportamento decidido ("Agrupar"), não afrouxa o que provava sobre o filtro ponta a ponta, o card novo entra e sai da massa (setup e cleanup) sem vazar para outros testes, e as somas batem com a massa. Parecer `docs/reviews/097-k272-teste-pg.md` (novo) pela ferramenta Write, com `pedido: 097-resumo-filtro-time`, `branch: fix/k272-teste-pg`, `commit: 6a285daa27889d150e36bdee95b4a7aa4ac05c16` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-272` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-teste-pg` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/097-k272-teste-pg.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/fix/k272-teste-pg:docs/reviews/097-k272-teste-pg.md` · espera: contém 'branch: fix/k272-teste-pg'
