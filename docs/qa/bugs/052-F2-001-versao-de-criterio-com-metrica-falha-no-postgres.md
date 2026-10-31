# 052-F2-001 - Marca de mudança de processo falha no PostgreSQL (tipo do parâmetro $2)
- Severidade: alta
- Responsável sugerido: node-backend
- Ambiente: `feature/052-f2-referencia` em 9c6bb3a (código em 75ee953), PostgreSQL 17 do Compose, schemas de teste

## Passos para reproduzir
1. `PG_TESTE_URL=<url do migrador de teste> pnpm --filter @metricas-dspd/server exec vitest run --project pg tests/referencia-businessmap.pg.test.ts`.
2. CT-5 e CT-6 chamam `sincronizarReferencia` com um segundo estado do quadro e `motivo: 'processo'` (ou mudança só de limite de WIP).

## Resultado esperado
A carga fecha a vigência, abre a nova e grava a versão de critério com as métricas afetadas (12 no processo geral, só O1 no limite de WIP), como diz o plano (U-1 e T2.6).

## Resultado obtido
`error: inconsistent types deduced for parameter $2`, em `registrarVersao` (`server/src/modulos/businessmap/referencia.ts:289-291`). O texto `SELECT $1, $2 WHERE NOT EXISTS (... versao_id = $1 AND metrica_id = $2)` não dá ao PostgreSQL um tipo único para `$2`. Toda carga com mudança de processo (a que deve marcar o critério) quebra; a transação do chamador desfaz tudo, sem perda de dado. A carga inicial não passa por esse trecho (versão de partida sem métrica) e por isso passa. O dublê dos testes unitários não valida tipos, então o defeito só aparece contra o banco.

## Evidência
- HEAD: CT-5 e CT-6 vermelhos, 9 de 11 verdes; `pnpm --filter @metricas-dspd/server run test:pg`: 2 falhos de 117.
- Cópia descartável fora do repositório, só com `SELECT $1::bigint, $2::varchar WHERE NOT EXISTS` no lugar do trecho: 11 de 11 verdes. A correção sugerida é essa (conversão explícita dos dois parâmetros).
