# 099-d3b-a4 - acelerato.test.ts reprova no prettier
- Severidade: média
- Responsável sugerido: node-backend
- Ambiente: feature/099-d3b-dia-528 @ 079a492d, CI run 43401902961 (job rapida)

## Passos para reproduzir
1. `npx prettier --check packages/metricas/src/acelerato/acelerato.test.ts`.

## Resultado esperado
Arquivo formatado.

## Resultado obtido
"Code style issues found" (format:check). O teste D3b acrescentado nesse arquivo não segue o prettier.

## Evidência
Log do run 43401902961; parecer `docs/qa/099-d3b-dia-528.md`, achado A4.
