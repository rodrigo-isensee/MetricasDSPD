## Objetivo
Review do L1 do pedido 097 (busca digitando nos filtros de lista): branch `feature/097-l1-busca`, worktree `/home/rodrigoisensee/MetricasDSPD-052c`, código em b5d206efc8fe4ab6bd38b19147d26c95bcceaf28 (busca em todo `FiltroMulti`, Esc na folha mobile, testes; cobertura do web 100%), QA aprovado em 8e1edc5a depois de duas voltas, base develop f4c122f15c05fbf5fea86797c9c348656d11ab36.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff f4c122f15c05fbf5fea86797c9c348656d11ab36 b5d206efc8fe4ab6bd38b19147d26c95bcceaf28`.
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/qa/097-l1-busca.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/097-filtros-time-busca.md` (CA-10 a CA-16).

## Entregar
- "E3.2 (tech-lead): review por lote do 097." (E3.2) Nesta delegação, o review do L1.
- (E3) (E3.2) Review: aderência aos CA-10 a CA-16 e à Q-1; o `onEscapeKeyDown` do Dialog e o do Popover sem duplicar lógica; estado da busca fora da URL; acessibilidade (rótulo, `aria-live`, foco); teto de linhas declarado. Rodar `web/src/features/filtros` com no máximo 2 workers (R-TETO). Parecer `docs/reviews/097-l1-busca.md` (novo) pela ferramenta Write, com `pedido: 097-resumo-filtro-time`, `branch: feature/097-l1-busca`, `commit: b5d206efc8fe4ab6bd38b19147d26c95bcceaf28` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/097-l1-busca` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/097-l1-busca.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/feature/097-l1-busca:docs/reviews/097-l1-busca.md` · espera: contém 'branch: feature/097-l1-busca'
