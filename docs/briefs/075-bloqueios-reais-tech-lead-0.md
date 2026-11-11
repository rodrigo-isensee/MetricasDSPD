## Objetivo
Code review do lote 6b do pedido 075 (publicação real de BLOQUEADOS, O1, O2, O5 e O19): branch `feature/075-l6b-publicacao-real`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, commit bd76128a (base develop 129fc3d5ba918789e17d3dc1b663039795c4a9e6), `pnpm run pronto` verde pelo autor.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 129fc3d5ba918789e17d3dc1b663039795c4a9e6 bd76128a`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 6b" e §5.

## Entregar
- "E1.6 (tech-lead): review por lote." (E1.6) Nesta delegação, só o lote 6b.
- (E1) (E4) (E1.6) Review pelo plano: interruptor e mapa de origem (T10 e T12 fora), data da versão de critério 2026-11-01 e a marca no O1 e no O5, nenhuma estatística abaixo de 20 itens, BusinessMap e Acelerato sem mistura, histórico nunca sobrescrito, testes invertidos sem asserção afrouxada (corte-serie-o1-075, qa-f6-painel, Q65 do E2E de API, os três testes do web) e o caso S9b. Parecer `docs/reviews/075-l6b-publicacao-real.md` (novo) pela ferramenta Write, com `pedido: 075-bloqueios-reais`, `branch: feature/075-l6b-publicacao-real`, `commit:` com o sha40 de bd76128a e o veredito. Commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/075-l6b-publicacao-real` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Não rodar `pnpm run pronto` (já verde pelo autor; a suíte completa vai ao CI do PR).
- (E2, E3, E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/075-l6b-publicacao-real.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/075-l6b-publicacao-real:docs/reviews/075-l6b-publicacao-real.md` · espera: contém 'branch: feature/075-l6b-publicacao-real'
