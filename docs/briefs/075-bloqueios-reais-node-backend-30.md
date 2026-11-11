## Objetivo
Lote 9b dos bloqueios reais (K-204): com o 9a na develop (PR 320), o contrato perde a nota `bloqueio-sem-dado-real`, que a API não emite desde o 6b. Worktree `/home/rodrigoisensee/MetricasDSPD-056`, branch `feature/075-9b` (a partir da develop f4c122f15c05fbf5fea86797c9c348656d11ab36).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 9b" e a §7.
- `/home/rodrigoisensee/MetricasDSPD-056/docs/contratos/politica-de-mudanca.md` (aceite de mudança incompatível, mesmo fluxo do lote 1a).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/075-revisao-l9a.md`, achado 1 (o O1 com `bloqueados` nulo).

## Entregar
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." (E1.4) Nesta delegação, o lote 9b do plano (contrato), como registrado no Histórico de 13:08.
- (E1) (E1.4) Como o plano manda: `bloqueio-sem-dado-real` sai de `TEXTO_NOTA_CARTAO` e de `NOTA_CARTAO_IDS`; `METRICAS_COM_PARTE_DE_BLOQUEIO`, `MOTIVO_BLOQUEIOS_NAO_COLETADOS` e `MOTIVO_O5_BLOQUEIOS_NAO_COLETADOS` saem de `origem.ts`; `VERSAO_CRITERIO_BLOQUEIO_SEM_DADO_REAL` fica (história, T2.6). Contrato incompatível: entradas em `docs/contratos/snapshots/aceitas.json` copiadas da saída do `docs:check`, com o motivo do plano, gravadas, fotografadas e removidas no mesmo PR (linha do checklist §6 para o corpo do PR). Os casos do 065 que esperavam a nota saem; CA-12 passa a valer só pelo interruptor (teste de unidade com `BLOQUEIOS_COM_DADO_REAL` falso). Se o `bloqueados` nulo do O1 puder sair do contrato neste lote sem quebrar o "nulo nunca vira 0", tire também o ramo "sem dado real" do O1 (achado 1 da UX); se não puder, relate por quê. Rodar `pnpm run pronto` da raiz da worktree. Commits com `Cartão: K-204` e a linha `teto:` na mensagem se passar de 150 linhas (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/075-9b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: packages/contratos/, server/src/, server/tests/, web/src/features/operacional/, docs/contratos/, docs/api/, e2e/

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 log -1 --format=%B origin/feature/075-9b` · espera: contém 'Cartão: K-204'
