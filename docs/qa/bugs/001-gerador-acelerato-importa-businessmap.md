# 001 - Gerador do Acelerato importa catálogo do BusinessMap
- Severidade: média (viola a regra "BusinessMap e Acelerato nunca se misturam" no código do mock; os dados não são afetados, é uma constante de critérios)
- Responsável sugerido: react-frontend
- Ambiente: branch `feature/dashboard-mock`, HEAD ae4b262 + fase A em andamento; Node v24.21.0

## Passos para reproduzir
1. Na raiz do projeto: `cd e2e && node scripts/verificar-fronteiras.mjs`
2. Ou abrir `web/src/mock/acelerato/gerador.ts`, linha 31.

## Resultado esperado
Nenhum arquivo de `mock/acelerato` importa algo de `mock/businessmap` (nem o contrário). `CRITERIOS_MOCK` fica em arquivo neutro (`mock/criterios.ts`), conforme o passo 2 do procedimento do ADR 0002.

## Resultado obtido
```
FALHOU: 1 violação(ões)
 - mock: businessmap x acelerato: web/src/mock/acelerato/gerador.ts importa "../businessmap/catalogos" (acelerato -> businessmap)
```
`import { CRITERIOS_MOCK } from '../businessmap/catalogos'` na linha 31.

## Evidência
Saída do script acima. Correção sem mudança de dados: o hash da base mock deve permanecer `924448d4` (BM `f780e90f`, AC `0113e077`), conferível com `node scripts/hash-base-mock.mjs --comparar ../docs/qa/evidencias/hash-base-fase-a.json`.
