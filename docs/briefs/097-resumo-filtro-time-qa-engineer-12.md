## Objetivo
QA da volta 1 do L1 do pedido 097 (busca nos filtros): branch `feature/097-l1-busca`, worktree `/home/rodrigoisensee/MetricasDSPD-052c`, código em 86a6c85e730dd52cd00766d9c86a96098ae44ea3 (o Esc na folha mobile com texto só limpa a busca; sem texto fecha e devolve o foco), sobre o seu parecer reprovado em 7a41ae85 (código b3b1a6cd). O `pnpm run pronto` do autor estourou o tempo na cobertura do web e do server, sem teste falhando.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff b3b1a6cd43a97ec5fca32f88538c06039487a6ce 86a6c85e730dd52cd00766d9c86a96098ae44ea3`.
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/qa/097-l1-busca.md` (o B1).

## Entregar
- "E3.3 (qa-engineer): QA por lote do 097." (E3.3) Nesta delegação, a revalidação do L1 no head novo.
- (E3) (E3.3) Conferir que o B1 está resolvido (Esc na folha com e sem texto, foco devolvido) e que o Popover continua igual; rodar `web/src/features/filtros` com no máximo 2 workers e a cobertura só do web (`pnpm --filter @metricas-dspd/web exec vitest run --coverage --maxWorkers=2`) para fechar a lacuna do pronto do autor (a cobertura do web tem de seguir 100%). Uma mutação (tirar o `preventDefault` do Dialog) que o teste novo pega, restaurada antes do commit. Regravar `docs/qa/097-l1-busca.md` só pela ferramenta Write com `commit: 86a6c85e730dd52cd00766d9c86a96098ae44ea3`, o veredito, a contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado. Commit só do parecer com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/097-l1-busca` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/097-l1-busca.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/feature/097-l1-busca:docs/qa/097-l1-busca.md` · espera: contém 'commit: 86a6c85e730dd52cd00766d9c86a96098ae44ea3'
