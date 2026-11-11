## Objetivo
QA do lote 6b do pedido 075 (publicação real de BLOQUEADOS, O1, O2, O5 e O19): branch `feature/075-l6b-publicacao-real`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, commit bd76128a (base develop 129fc3d5ba918789e17d3dc1b663039795c4a9e6), `pnpm run pronto` verde pelo autor.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 129fc3d5ba918789e17d3dc1b663039795c4a9e6 bd76128a`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 6b".
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/qa/075-l6a-versao-criterio.md`, achado A2.

## Entregar
- "E1.8 (qa-engineer): QA por lote." (E1.8) Nesta delegação, só o lote 6b.
- (E1) (E4) (E1.8) Rodar com no máximo 2 workers os testes tocados (`server/tests/painel-real-f6.test.ts`, `server/tests/corte-serie-o1-075.test.ts`, `server/tests/qa-f6-painel.test.ts`, `packages/contratos/src/origem.test.ts` e os três do web); conferir CA-075-11, O5 e O19 abaixo de 20 sem percentil, a marca da versão de critério no O1 e no O5 (A2 do 6a fechado), T10 e T12 fora; uma mutação (desligar o interruptor ou voltar a data a '2099-12-31') que os testes pegam, restaurada antes do commit. Não rodar `pnpm run pronto` nem o E2E (a suíte completa e o E2E de API vão ao CI do PR). Grave `docs/qa/075-l6b-publicacao-real.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 075-bloqueios-reais`, `branch: feature/075-l6b-publicacao-real`, `commit:` com o sha40 de bd76128a, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/075-l6b-publicacao-real` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2, E3, E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/075-l6b-publicacao-real.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/075-l6b-publicacao-real:docs/qa/075-l6b-publicacao-real.md` · espera: contém 'branch: feature/075-l6b-publicacao-real'
