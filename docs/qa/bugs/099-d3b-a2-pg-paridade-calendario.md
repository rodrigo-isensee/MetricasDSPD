# 099-d3b-a2 - metricas.pg.test.ts compara o PG com o calendário padrão de 8 h
- Severidade: média
- Responsável sugerido: node-backend
- Ambiente: feature/099-d3b-dia-528 @ 079a492d, CI run 43401902961 (job banco)

## Passos para reproduzir
1. `pnpm --filter @metricas-dspd/server run test:pg` no head (CI).

## Resultado esperado
"as 50 métricas: resultado idêntico ao do mock em memória" passa.

## Resultado obtido
Falha no S1: esperado `horasPorDiaUtil` 8, recebido 8,8, e percentis maiores. O esperado em memória usa `CALENDARIO_PADRAO` (server/tests/metricas.pg.test.ts:47) e o servidor usa o da Sustentação (528 min).

## Evidência
Log do run 43401902961; parecer `docs/qa/099-d3b-dia-528.md`, achado A2. Correção: `acelerato.CALENDARIO_SUSTENTACAO_PADRAO` no contexto do Acelerato do teste.
