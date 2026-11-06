---
tipo: qa
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-fronteira-eslint
commit: 5af33d345bbbc68a7b2d58874437ebc1a43bc48b
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-05
---
# QA: regra de fronteira do eslint cobre toda pasta de src fora de modulos (K-225, E4)

## Escopo
Diff `8a789d43...5af33d34`: `server/eslint.config.js`, `server/tests/fronteira-eslint.test.ts`, `docs/architecture/server.md`. Pedido técnico sem especificação de UX nem contrato de API; sem gatilho de segurança. A obrigação testada é a regra do pedido (K-225): pasta nova de `src/` fora de `modulos/` herda a restrição de importação (ADR 0013 §9).

## Obrigação, teste, resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Toda pasta de `src/` fora de `modulos/` tem `no-restricted-imports` em error com o padrão de módulo | `fronteira-eslint.test.ts` (um caso por pasta real: apoio, entradas, plataforma) | pasta nova fora do glob | passou |
| Arquivo na raiz de `src/` coberto | `fronteira-eslint.test.ts` (src/*.ts) | raiz de src | passou |
| Guarda de suíte vazia | `fronteira-eslint.test.ts` (há pastas para cobrir) | lista vazia de pastas | passou |
| Importar arquivo interno de módulo é recusado em pasta nova | prova manual com `src/zzqa` | pasta fora de qualquer lista antiga | recusou |

## Execução
- `npx eslint .` (cwd `server/`): rc=0.
- `npx vitest run --maxWorkers=2` (server inteiro): `Test Files 90 passed | 36 skipped (126)`, `Tests 1811 passed | 248 skipped (2059)`. Os skipped já vêm da base (testes condicionados ao ambiente), não foram tocados por este diff.
- `pnpm run docs:check`: `ok (1020 páginas Markdown, 69 métricas, 2 eventos)`.
- Prova manual: criei `server/src/zzqa/a.ts` importando `../modulos/acelerato/allow-list.js`; `npx eslint src/zzqa` saiu rc=1 com `no-restricted-imports ... Módulos se conhecem só pelo index.ts (ADR 0013 §9)`. Pasta apagada antes do commit; `git status` limpo.

## Vermelho antes do verde
Projeto sem `forge-testes` aplicável à stack: usei cópia da base em `$TMPDIR` (`git archive 8a789d43 server`, com o teste novo e `node_modules` por link). Com as pastas reais, o teste passa também na base (o glob antigo listava as três pastas existentes). Com a pasta nova `src/zznova/a.ts` na cópia da base: `× src/zznova traz no-restricted-imports ativo`, `Tests 1 failed | 5 passed (6)`. Com o `eslint.config.js` do HEAD na mesma cópia: `Tests 6 passed (6)`. O teste cai sem a correção e passa com ela. Cópia removida.

## Mutação
Stack sem ferramenta de mutação gratuita para configuração de lint; a prova acima (glob antigo contra pasta nova) faz o papel do mutante.

## Achados
- A1 (recomendado) server/tests/fronteira-eslint.test.ts:13 · o teste só confere o primeiro nível de `src/`; pasta aninhada nova já é coberta pelo glob `src/**/*.ts`. Sem devolução, igual ao A1 do review.
