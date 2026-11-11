## Objetivo
QA da volta 2 do L1 do pedido 097 (busca nos filtros): branch `feature/097-l1-busca`, worktree `/home/rodrigoisensee/MetricasDSPD-052c`, código em b5d206efc8fe4ab6bd38b19147d26c95bcceaf28 (dois testes do Esc com o foco numa opção, no Popover e na folha; cobertura do web de volta a 100% segundo o autor), sobre o seu parecer reprovado em 6b7f8730 (código 86a6c85e).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff 86a6c85e730dd52cd00766d9c86a96098ae44ea3 b5d206efc8fe4ab6bd38b19147d26c95bcceaf28`.
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/qa/097-l1-busca.md` (o A1).

## Entregar
- "E3.3 (qa-engineer): QA por lote do 097." (E3.3) Nesta delegação, a revalidação do L1 no head b5d206ef.
- (E3) (E3.3) Conferir que o A1 está resolvido (os dois testes novos cobrem o `setBusca` do Esc numa opção) e rodar a cobertura do web (`pnpm --filter @metricas-dspd/web exec vitest run --coverage --maxWorkers=2`, em segundo plano, cerca de 9 min), conferindo os 100%. Regravar `docs/qa/097-l1-busca.md` só pela ferramenta Write com `commit: b5d206efc8fe4ab6bd38b19147d26c95bcceaf28`, o veredito, a contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado. Commit só do parecer com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/097-l1-busca` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/097-l1-busca.md, web/src/features/filtros/ (a pasta é o escopo da entrega revisada, para a conferência; o QA só grava o parecer)

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/feature/097-l1-busca:docs/qa/097-l1-busca.md` · espera: contém 'commit: b5d206efc8fe4ab6bd38b19147d26c95bcceaf28'
