## Objetivo
QA do lote 9a dos bloqueios reais (K-204): branch `feature/075-9a`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, código em f79685e841932a7043b681d9224cac66168de104 (a web deixa de depender da nota `bloqueio-sem-dado-real` no O1 e no O2; teste invertido), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff eac38a64b0b580d7c920f4b2b501287f7fb56599 f79685e841932a7043b681d9224cac66168de104`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 9a".

## Entregar
- "E1.8 (qa-engineer): QA por lote." (E1.8) Nesta delegação, o QA do lote 9a.
- (E1) (E1.8) Rodar os testes de `web/src/features/operacional` e `web/src/features/complementares` com no máximo 2 workers (R-TETO); conferir que O1, O2, BLOQUEADOS e a faixa "Pede atenção" mostram o dado de bloqueio real sem o texto "Sem dado real" e que o estado genérico de métrica sem fonte real de outras métricas não mudou; `grep -rn bloqueio-sem-dado-real web/src` vazio; uma mutação (religar o ramo da nota no O2) que o teste pega, restaurada antes do commit. Grave `docs/qa/075-l9a-web.md` (novo) pela ferramenta Write, com `pedido: 075-bloqueios-reais`, `branch: feature/075-9a`, `commit: f79685e841932a7043b681d9224cac66168de104`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (vazio se não houver). Commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/075-9a` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/075-l9a-web.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/feature/075-9a:docs/qa/075-l9a-web.md` · espera: contém 'commit: f79685e841932a7043b681d9224cac66168de104'
