## Objetivo
Review do K-172: branch `docs/k172-pronto-praticas`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, commit 87079bef3a22cd3215d99576fd96a1d38e04f068 (entrega conferida; 1 linha trocada em `docs/engineering/praticas.md`), base develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13. Só documentação, classe T (sem QA).

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b diff 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13 87079bef3a22cd3215d99576fd96a1d38e04f068`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/026-front-do-011-lote3.md`, linhas 40 e 143.

## Entregar
- "E2.2 (tech-lead): review do K-172." (E2.2)
- (E2) (E2.2) Review: o texto novo diz o mesmo que a decisão do dono de 2026-10-21 (pronto completo uma vez, antes do commit final; testes e typecheck do pacote durante o desenvolvimento), não afrouxa e não contradiz o resto de `praticas.md`. Parecer `docs/reviews/092-k172-pronto-praticas.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: docs/k172-pronto-praticas`, `commit: 87079bef3a22cd3215d99576fd96a1d38e04f068` e o veredito. Commit só do parecer com `Cartão: K-172` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/docs/k172-pronto-praticas` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/092-k172-pronto-praticas.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b show origin/docs/k172-pronto-praticas:docs/reviews/092-k172-pronto-praticas.md` · espera: contém 'commit: 87079bef3a22cd3215d99576fd96a1d38e04f068'
