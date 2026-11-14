# 099-d3b-a1 - Linha de base do hash da base mock sem regravar
- Severidade: média
- Responsável sugerido: node-backend
- Ambiente: feature/099-d3b-dia-528 @ 079a492d, CI run 43401902961 (job build)

## Passos para reproduzir
1. `pnpm --filter @metricas-dspd/e2e run gate` no head.

## Resultado esperado
Gate aprovado: hashes iguais à linha de base `docs/qa/evidencias/hash-base-fase-a.json`.

## Resultado obtido
"difere em hashBase, hashAcelerato (antes: de6a8953, 20541e9d; agora: dd6787b1, b047a163)". O mock lê o calendário de 528 min; os testes do mock já têm os hashes novos, a evidência não.

## Evidência
Log do run 43401902961; parecer `docs/qa/099-d3b-dia-528.md`, achado A1. Mesma classe do PR 364.
