## Objetivo
Review do lote 1 do K-174: branch `fix/k174-insumos-carga`, worktree `/home/rodrigoisensee/MetricasDSPD-052c`, commit e722029a (base develop d8d52103c20837fce3ece3d5bed5f6c68c88c8a2). Mudança na biblioteca compartilhada de tempo (T2.5): feriados em número de dia e cópia do `Set` em `criarCalendario`, com teste de equivalência bit a bit contra o código antigo. Tempo a frio do `carregarInsumos` caiu 34% (1524 para 1004 ms, mediana de 10); `hash-base-mock --comparar` igual; cobertura 100%; pronto verde pelo autor.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff d8d52103c20837fce3ece3d5bed5f6c68c88c8a2 e722029a`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/092-k174-plano.md`, lote 1 e prova.

## Entregar
- "E3.2 (tech-lead): review do K-174." (E3.2)
- (E3) (E3.2) Review: nenhum resultado da biblioteca muda (o teste de equivalência cobre datas, turnos, calendários estranhos, NaN e fuso, com `Object.is`); a cópia do `Set` não deixa o calendário mudar por fora; o `WeakMap` não vaza memória nem fica velho se o `Set` mudar; o servidor só ganha; o diff passa do teto de 150 linhas por causa do teste (declarar no PR). Rodar os testes de `packages/metricas` com no máximo 2 workers (R-TETO). Parecer `docs/reviews/092-k174-calendario.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: fix/k174-insumos-carga`, `commit:` o sha40 de e722029a e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-174` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/fix/k174-insumos-carga` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E5) (E6) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/092-k174-calendario.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/fix/k174-insumos-carga:docs/reviews/092-k174-calendario.md` · espera: contém 'branch: fix/k174-insumos-carga'
