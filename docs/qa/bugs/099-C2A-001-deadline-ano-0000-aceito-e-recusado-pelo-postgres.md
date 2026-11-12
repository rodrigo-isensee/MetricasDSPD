# 099-C2A-001 - deadline `0000-01-01` passa no parse estrito, mas o PostgreSQL não tem ano zero
- Severidade: média
- Responsável sugerido: node-backend
- Ambiente: feature/099-c2a-o12-projecao, 34ba37fc; Node 24, vitest 5.1

## Passos para reproduzir
1. Chamar `dataAcordada('0000-01-01', [])` (`server/src/modulos/businessmap/normalizador.ts:145`).
2. O JS aceita o ano 0 (`new Date('0000-01-01T00:00:00Z').toISOString()` dá `0000-01-01T...`), então a volta confere e a função devolve `'0000-01-01'`, sem nota.
3. O projetor grava esse texto em `dim_card.data_acordada` (coluna `date`). O PostgreSQL não tem ano 0000 e recusa `'0000-01-01'::date` com `date/time field value out of range` (comportamento conhecido do tipo; não testei, sem banco local).

## Resultado esperado
Valor que a coluna `date` não aceita vira `null` com a nota `deadline_fora_da_forma`, como diz o §2 do desenho ("só uma data válida chega à coluna").

## Resultado obtido
Retorna `'0000-01-01'`. Se o banco recusar, o INSERT do `dim_card` falha e derruba o lote inteiro da projeção por um card com prazo digitado errado.

## Evidência
Teste descartável numa cópia: `expect(dataAcordada('0000-01-01', n)).toBeNull()` falha (recebe `'0000-01-01'`). Nenhum teste do diff cobre o ano 0000. Correção sugerida: exigir ano >= 0001 e acrescentar `'0000-01-01'` à lista `ruins` do teste.
