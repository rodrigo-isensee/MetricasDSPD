## Objetivo
Review do lote 9b dos bloqueios reais (K-204): branch `feature/075-9b`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, código em e4eaa56c90f8424d86e7e37151e7ae27745375c2 (o contrato perde a nota `bloqueio-sem-dado-real`; aceite de contrato incompatível gravado, fotografado e removido no mesmo lote), QA aprovado em 8c3d905c, base develop f4c122f15c05fbf5fea86797c9c348656d11ab36.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff f4c122f15c05fbf5fea86797c9c348656d11ab36 e4eaa56c90f8424d86e7e37151e7ae27745375c2`.
- `/home/rodrigoisensee/MetricasDSPD-056/docs/qa/075-l9b-contrato.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 9b" e a classificação de contrato (TL-A2).

## Entregar
- "E1.6 (tech-lead): review por lote." (E1.6) Nesta delegação, o review do lote 9b.
- (E1) (E1.6) Review: aderência ao lote 9b do plano; a classificação de contrato e o aceite pela `politica-de-mudanca.md` (incompatível, aceite de uso único, sem `/api/v2`, porque a web já não consome a nota desde o 9a); `VERSAO_CRITERIO_BLOQUEIO_SEM_DADO_REAL` mantida (T2.6); o nulo do O1 continua nulo; o achado 1 da revisão de UX do 9a (ramo "sem dado real" do O1) segue até o nulo sair do contrato, com o motivo; o A1 do QA. Rodar os testes tocados com no máximo 2 workers (R-TETO). Parecer `docs/reviews/075-l9b-contrato.md` (novo) pela ferramenta Write, com `pedido: 075-bloqueios-reais`, `branch: feature/075-9b`, `commit: e4eaa56c90f8424d86e7e37151e7ae27745375c2` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/075-9b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/075-l9b-contrato.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/feature/075-9b:docs/reviews/075-l9b-contrato.md` · espera: contém 'branch: feature/075-9b'
