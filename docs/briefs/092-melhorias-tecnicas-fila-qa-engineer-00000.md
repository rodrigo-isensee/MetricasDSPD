## Objetivo
QA do lote 1 do K-174: branch `fix/k174-insumos-carga`, worktree `/home/rodrigoisensee/MetricasDSPD-052c`, código em e722029aacd63bb312f3cf016686ab5268579121 (biblioteca de tempo: feriados em número de dia; teste de equivalência bit a bit), review aprovado (3ec5fbe1), base develop d8d52103c20837fce3ece3d5bed5f6c68c88c8a2.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff d8d52103c20837fce3ece3d5bed5f6c68c88c8a2 e722029aacd63bb312f3cf016686ab5268579121`.
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/reviews/092-k174-calendario.md` (novo) e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/092-k174-plano.md` (a prova pedida).

## Entregar
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T)." (E3.3)
- (E3) (E3.3) Rodar os testes de `packages/metricas` com no máximo 2 workers (R-TETO) e conferir a cobertura de 100%; rodar `node scripts/hash-base-mock.mjs --comparar` (ou o caminho que o plano cita) e conferir a base de demonstração igual; uma mutação na biblioteca (por exemplo, tratar o feriado de um dia como dia útil) que o teste de equivalência pega, restaurada antes do commit; o tempo a frio do `carregarInsumos` (mediana de 5 processos novos) para confirmar a ordem de grandeza do ganho. Não rodar teste sob carga artificial (R-TETO). Grave `docs/qa/092-k174-calendario.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: fix/k174-insumos-carga`, `commit: e722029aacd63bb312f3cf016686ab5268579121`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (vazio se não houver). Commit só do parecer com `Cartão: K-174` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/fix/k174-insumos-carga` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E5) (E6) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/092-k174-calendario.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/fix/k174-insumos-carga:docs/qa/092-k174-calendario.md` · espera: contém 'commit: e722029aacd63bb312f3cf016686ab5268579121'
