## Objetivo
Review do lote 9a dos bloqueios reais (K-204): branch `feature/075-9a`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, código em f79685e841932a7043b681d9224cac66168de104 (a web deixa de depender da nota `bloqueio-sem-dado-real` no O1 e no O2; teste invertido; 173 linhas, quase tudo remoção), QA aprovado em 7a19ce61 com A1 recomendado, base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff eac38a64b0b580d7c920f4b2b501287f7fb56599 f79685e841932a7043b681d9224cac66168de104`.
- `/home/rodrigoisensee/MetricasDSPD-056/docs/qa/075-l9a-web.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 9a".

## Entregar
- "E1.6 (tech-lead): review por lote." (E1.6) Nesta delegação, o review do lote 9a.
- (E1) (E1.6) Review: aderência ao lote 9a do plano; nada do contrato muda (o `bloqueados` nulo segue tratado até o 9b); o estado genérico de métrica sem fonte real de outras métricas não muda; o teto excedido por remoção declarado; o A1 do QA (mutação M1 sobreviveu por falta de fixture com a nota) avaliado. Rodar os testes de `web/src/features/operacional` com no máximo 2 workers (R-TETO). Parecer `docs/reviews/075-l9a-web.md` (novo) pela ferramenta Write, com `pedido: 075-bloqueios-reais`, `branch: feature/075-9a`, `commit: f79685e841932a7043b681d9224cac66168de104` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/075-9a` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/075-l9a-web.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/feature/075-9a:docs/reviews/075-l9a-web.md` · espera: contém 'branch: feature/075-9a'
