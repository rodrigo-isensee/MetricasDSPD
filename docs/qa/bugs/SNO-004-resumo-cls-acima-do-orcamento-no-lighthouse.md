# SNO-004 - Resumo do Operacional: CLS de 0,125 no Lighthouse, acima do orçamento F2 (0,1)
- Severidade: média
- Responsável sugerido: react-frontend (`web/src/features/operacional/resumo/BlocoFluxo.tsx`, `NumeroChave.tsx` e o esqueleto do bloco)
- Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-sust`, branch `feature/sustentacao-no-operacional`, HEAD 67624ba; Lighthouse CI (`pnpm --filter @metricas-dspd/e2e run lighthouse`), preset móvel padrão, build de produção em `vite preview`
- Critério: CA-31 (esqueleto de altura fixa, CLS) e orçamento F2 da ADR 0003 (CLS < 0,1)

## Passos para reproduzir
1. `cd web && pnpm run build`.
2. `cd e2e && pnpm run lighthouse` (as 3 URLs de Operacional: `/operacional`, `?cadencia=semanal`, `?cadencia=sustentacao`).
3. Abrir o relatório JSON de `/operacional` e olhar `layout-shifts`.

## Resultado esperado
CLS menor que 0,1 nas três URLs.

## Resultado obtido
`/operacional` (Resumo): CLS = 0,125 nas 3 execuções (`all values: 0.12526`), asserção `cumulative-layout-shift` em aviso. Os deslocamentos vêm de `section#resumo-fluxo` (0,092) e do bloco do número P85 (0,029): o bloco do fluxo cresce quando os dados chegam. A Semanal (0,018) e a Sustentação (0,067) passam. Desempenho 95 e acessibilidade 100 no Resumo.
Medição do F2 pelo Playwright (`pnpm run test:perf`, 1366 e 375 px) **passa** para `/operacional`; a divergência aparece só sob a emulação móvel com CPU e rede limitadas do Lighthouse. A asserção do Lighthouse está configurada como aviso, por isso não derruba o comando.

## Evidência
`e2e/lighthouse/relatorios/localhost-operacional-2026_10_15_00_34_53.report.json` (e as duas seguintes), seção `audits.layout-shifts.details.items`.

## Decisão de QA
Não bloqueia (a medição bloqueante do F2 passou e não há perda de função), mas fica aberto e o parecer leva `aceite_usuario: sim`.
