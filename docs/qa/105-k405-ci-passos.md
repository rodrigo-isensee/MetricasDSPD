---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: ci/105-k405-diagnostico
commit: b67a4cbf7c408da87b2bf99722465c529e07258d
parecer: aprovado
resultado: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: K-405 passos 1 e 2a, CI mede o runner e roda o web sozinho (pedido 105, E7.563)

Branch `ci/105-k405-diagnostico`, head b67a4cbf, base acb62951. Diff: `.github/workflows/ci.yml`, `homolog.yml`, `changelog.d/ci-105-k405-diagnostico.md`, `docs/devops/105-k405-diagnostico.md`. Sem PR: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde e não cita PQ do autor. Mudança só de workflow, sem teste novo: não há vermelho-antes-do-verde nem mutação aplicáveis (nenhum código nem teste alterado).

## Achados
- A1 (recomendado) .github/workflows/ci.yml:54 · os pacotes deixam de rodar em paralelo (server e web rodavam juntos por ~11 min): o job `testes` (teto 25 min) fica mais longo; ler o tempo no 1º run e, se passar de ~20 min, tratar antes do passo 3.

## Obrigações → prova → resultado
| Obrigação (detalhe do K-405) | Prova | Fronteira protegida | Resultado |
|---|---|---|---|
| Passo "Medir o runner" (`nproc`, `free -m`, `uptime`) em ci.yml e homolog.yml | diff: passo presente nos dois, antes da cobertura | n/a | ok |
| Cobertura em dois passos; o filtro pega todos os pacotes menos o web | `pnpm -r --filter '!@metricas-dspd/web' exec` lista 8 pacotes: tools/homolog, packages/contratos, tools/spec-check, tools/pesquisa, packages/mock, packages/metricas, server, tools/docs-contratos; os 9 pacotes com script `cobertura` são esses 8 mais o web | pacote esquecido (nenhum fica sem cobertura) | ok |
| `METRICAS_DSPD_ESPERA_ASYNC_MS=15000` só no passo do web | `grep`: a variável só é lida em `web/vite.config.ts` e `web/src/test/setup.ts`; `env:` ficou no passo "Cobertura do web" nos dois workflows | env fora do web | ok |
| Resumo e artefato continuam lendo `*/coverage` | ci.yml:66-85 inalterado (`server web tools/homolog`; `server/coverage`, `web/coverage`) e o passo do web grava `web/coverage` | caminho do artefato | ok |
| Sem `continue-on-error`, retry, `[skip ci]`, teste pulado nem custo novo | `grep` no diff: nenhum; o `continue-on-error` de ci.yml:300 é anterior e fora do diff; sem job nem matriz novos | n/a | ok |
| Sintaxe dos workflows | `yaml.safe_load` dos dois arquivos: ok. `actionlint`: ausente do PATH (lacuna registrada, não rodado) | YAML inválido | ok, com lacuna |
| Estimativa do job contra 25 min | ver A1: baseline 13-15 min (verde) e 21-23 min (vermelho); sequência soma server (~10 min com disputa, menos sozinho) e web | teto do job | risco registrado, não medido |

## Observações
- `time pnpm ...` num passo `run` usa o builtin do bash e imprime real/user/sys no log: serve ao diagnóstico.
- Passos com `--filter` do pnpm falham se algum pacote falhar (sem `continue-on-error`), então a falha do 1º passo impede o web de rodar: aceitável, o job já era vermelho.
- Execução do CI não feita aqui: o ganho ou perda real só aparece no run do PR.

parecer: aprovado
