---
tipo: revisao-devops
contrato: 1
pedido: 105-ci-timeout-testes
branch: ci/105-timeout-testes
commit: 18f168415b1c98a22b4ee28f031240d27ee9c704
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-17
---
# Review de devops: 105-ci-timeout-testes (E7.533, E7.535, E7.544)

## Parecer
Aprovado. O diff sobre a base 808a163c tem 2 arquivos: `.github/workflows/ci.yml` (`timeout-minutes` do job `testes` de 15 para 25, linha 42, e do `e2e-parte` de 30 para 45, linha 200) e `changelog.d/ci-105-timeout-testes.md` (seção Alterado, cita o pedido e diz que nenhum teste foi pulado). Decisão do dono 1 = A. Nenhuma outra linha do workflow mudou: sem `continue-on-error`, sem `[skip ci]`, sem teste pulado, sem check desligado (`R-VERIFY`); ações continuam fixadas por SHA; `permissions` e `concurrency` intactos; nenhum job novo, então o agregador `e2e` e os checks exigidos não mudam. Só sobe o teto de tempo, não troca runner nem serviço: custo de dinheiro zero (`R-CUSTO`); o teto só é consumido em execução que já estaria travada ou lenta.

## Achados
- A1 (recomendado) .github/workflows/ci.yml:42 · o teto novo não resolve a causa; se a duração passar de ~20 min no `testes` ou ~35 min no `e2e-parte`, abrir cartão para particionar (`--shard=N/3`). Medir pelo `gh run list` no checkpoint.
- A2 (recomendado) .github/workflows/ci.yml:200 · pior caso de minutos por PR sobe (25 + 2x45 = 115 contra 75); confirmar no checkpoint que segue na franquia gratuita.

## Notas
Rollback: reverter o commit. Arquivo protegido: pode exigir o rótulo `afrouxa-regra` do dono no PR (catraca); o `tech-lead` avalia; o envio de workflow é do dono (escopo `workflow`). Lacuna: `actionlint` ausente do PATH, não executado. Este parecer não afirma CI verde.

## Revalidação
Delta c08a69de..18f16841 (`forge-check parecer delta`): `ci.yml` e `homolog.yml` (domínio), mais `web/src/test/setup.ts`, `web/vite.config.ts` e o `changelog.d` (fora do domínio). Aprovado.
- A variável `METRICAS_DSPD_ESPERA_ASYNC_MS: '15000'` está só no passo `pnpm run cobertura` (`ci.yml:56`, `homolog.yml:81`), como `env` do passo e não do job; `grep` no repositório não acha outra definição.
- Lentidão local preservada: `web/vite.config.ts:76` usa `process.env.METRICAS_DSPD_ESPERA_ASYNC_MS ?? '5000'` no `test.env`; na estação a variável não existe, então a espera segue em 5 s e a lentidão continua aparecendo (objeção do review do T3).
- Sem `continue-on-error`, retry, `[skip ci]` ou teste pulado (`R-VERIFY`); custo zero (`R-CUSTO`); permissões, SHAs e agregador intactos.
- Cobertura de ramos 100%: o `setup.ts` não ganhou ramo (`Number(...)`), e o `??` fica em `vite.config.ts`, fora do `include` de cobertura (`src/**`). Confirmação final pelo passo de cobertura do CI; não rodei a suíte aqui.
- Lacuna: `actionlint` ausente do PATH, não executado; o YAML muda em um bloco `env` de duas linhas.
- Rollback: reverter o commit; o `test.env` cai no padrão de 5000.
