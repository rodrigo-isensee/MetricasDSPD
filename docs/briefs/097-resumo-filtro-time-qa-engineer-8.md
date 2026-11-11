## Objetivo
QA do L1 do pedido 097 (busca digitando nos filtros de lista): branch `feature/097-l1-busca`, worktree `/home/rodrigoisensee/MetricasDSPD-052c`, código em b3b1a6cd43a97ec5fca32f88538c06039487a6ce (campo "Buscar" em todo `FiltroMulti`, também nas listas curtas), base develop f4c122f15c05fbf5fea86797c9c348656d11ab36.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff f4c122f15c05fbf5fea86797c9c348656d11ab36 b3b1a6cd43a97ec5fca32f88538c06039487a6ce`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/097-filtros-time-busca.md`, CA-10 a CA-16.

## Entregar
- "E3.3 (qa-engineer): QA por lote do 097." (E3.3) Nesta delegação, o QA do L1.
- (E3) (E3.3) Rodar `web/src/features/filtros` com no máximo 2 workers (R-TETO) e conferir cada critério CA-10 a CA-16 (busca sem maiúsculas e acentos, contagem anunciada, lista vazia, seleção fora da busca mantida, teclado, Esc, folha mobile, texto fora da URL); acessibilidade por leitura do código e pelos testes (`@axe`, se o projeto usar). Uma mutação (desligar a remoção de acentos) que o teste pega, restaurada antes do commit. Grave `docs/qa/097-l1-busca.md` (novo) só pela ferramenta Write, com `pedido: 097-resumo-filtro-time`, `branch: feature/097-l1-busca`, `commit: b3b1a6cd43a97ec5fca32f88538c06039487a6ce`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado. Commit só do parecer com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/097-l1-busca` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/097-l1-busca.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/feature/097-l1-busca:docs/qa/097-l1-busca.md` · espera: contém 'commit: b3b1a6cd43a97ec5fca32f88538c06039487a6ce'
