## Objetivo
QA do lote 9b dos bloqueios reais (K-204): branch `feature/075-9b`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, código em e4eaa56c90f8424d86e7e37151e7ae27745375c2 (o contrato perde a nota `bloqueio-sem-dado-real`; aceite de contrato incompatível gravado, fotografado e removido; testes do 065 reescritos; CA-12 só pelo interruptor), base develop f4c122f15c05fbf5fea86797c9c348656d11ab36.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff f4c122f15c05fbf5fea86797c9c348656d11ab36 e4eaa56c90f8424d86e7e37151e7ae27745375c2`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 9b".

## Entregar
- "E1.8 (qa-engineer): QA por lote." (E1.8) Nesta delegação, o QA do lote 9b.
- (E1) (E1.8) Rodar `packages/contratos/src/origem.test.ts`, `server/tests/painel-real-f6.test.ts` e o `docs:check` com no máximo 2 workers (R-TETO); conferir que a nota sumiu do enum e da API, que o O1, o O2 e o O3 seguem com o dado real, que o `bloqueados` nulo do O1 continua nulo (nunca vira 0), que CA-12 passa só pelo interruptor e que `aceitas.json` voltou igual à develop. Uma mutação (religar a nota em `semParteDeBloqueio`) que o teste pega, restaurada antes do commit. Grave `docs/qa/075-l9b-contrato.md` (novo) só pela ferramenta Write, com `pedido: 075-bloqueios-reais`, `branch: feature/075-9b`, `commit: e4eaa56c90f8424d86e7e37151e7ae27745375c2`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado. Commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/075-9b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/075-l9b-contrato.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/feature/075-9b:docs/qa/075-l9b-contrato.md` · espera: contém 'commit: e4eaa56c90f8424d86e7e37151e7ae27745375c2'
