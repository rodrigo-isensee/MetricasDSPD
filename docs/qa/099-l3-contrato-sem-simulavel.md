---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l3-contrato-sem-simulavel
commit: ef0dc300c2f0017c7fddcae18388aa24d566a965
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: 099 L3, contrato sem `simulavel`

Diff de três pontos contra `develop` (96d9b69f): `docs/api/metricas.md`, `packages/contratos/src/origem.ts` e `origem.test.ts`, `server/tests/painel-real-f6.test.ts`. O OpenAPI não mudou e não tinha o nome (0 ocorrências em `docs/api/openapi.json`). Sem especificação de UX nova: as obrigações são as da decisão do dono e da ADR 0030 (sem número simulado, contrato sem os três nomes).

## Conferências pedidas
- **Schema estrito recusa `simulavel`:** `semDadoRealSchema` perdeu o campo e segue `.strict()`; o teste `T-C2` agora afirma `safeParse({...base, simulavel: true}).success === false` e a recusa de `valor`.
- **Resto dos três nomes:** `grep -rniE "simulavel|podeSimular|METRICAS_SEM_SIMULACAO"` fora de `docs/`, `node_modules` e `dist`: só provas de recusa (`origem.test.ts:122,129`, `painel-real-f6.test.ts:131,142`) e um comentário em `e2e/tests-api/simulado-070-l3.spec.ts:7` (A1).
- **PV1 e notas da sustentação:** o diff de `origem.test.ts` só remove a linha `podeSimular(id)` do laço de ids reais e o `describe` do pedido 070; o bloco de PV1 (`PV1 não tem motivo de dado fictício`, laço dos ids reais) e o `describe` "notas só da sustentação (pedido 069, L9-a)" estão sem alteração. Restaurados como antes.
- **Mutação:** em `packages/contratos/src/origem.ts`, devolvi `simulavel: z.boolean().optional()` ao schema. Caiu 1 de 15: `T-C2: o schema é strict e recusa simulavel`. Morta. Arquivo restaurado (`git status` limpo).

## Execução local (`VITEST_MAX_WORKERS=2`, dentro de cada pacote)
- `packages/contratos`: `src/origem.test.ts` 15 de 15 passaram.
- `server`: `tests/painel-real-f6.test.ts` 39 de 39 passaram.
- Nada contra a base real nem `.env*`.

## CI do head ef0dc300c2f0017c7fddcae18388aa24d566a965 (run 43152487481)
`testes` success, `banco` (o `.pg`) success, `openapi` success, `build` success, `rapida` success, `seguranca` success, `imagem` success, `filtro` success. `e2e`, `e2e-parte` e `perf` ficaram `skipped` neste head, então o e2e não rodou: a suíte `e2e/` não prova nada sobre este L3 (A2).

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Corpo "sem dado real" só com `estado`, `metrica`, `motivo` | `o corpo não carrega número nem campo fora de estado, métrica e motivo` | campo extra no corpo | passou |
| Schema recusa `simulavel` e `valor` | `T-C2: o schema é strict e recusa simulavel` | campo desconhecido (strict) | passou; mutação o derruba |
| A rota devolve o corpo sem `simulavel` (O8, VISAO_GERAL, toda métrica fora do mapa real) | `painel-real-f6.test.ts`: O8, VISAO_GERAL, `T-S1` e o laço das chaves | chaves exatas do corpo | passou (39 de 39) |
| Métrica real não ganha campo extra | `T-S1` (`not.toHaveProperty('simulavel')`) | métrica real | passou |
| PV1 sem motivo fictício; notas da sustentação | blocos mantidos de `origem.test.ts` | n/a | passou (15 de 15) |

Vermelho antes do verde: a mutação acima é a prova do teste que mudou de sentido (`T-C2`); os demais testes só tiveram expectativa ajustada à remoção.

## Achados
- A1 (recomendado) e2e/tests-api/simulado-070-l3.spec.ts:7 · comentário ainda cita `simulavel` do contrato; resto dos três nomes fora da prova de recusa. Atualizar ao tratar o A2.
- A2 (recomendado) e2e/tests-api/simulado-070-l3.spec.ts:20 · spec do 070 L3 espera `selo-simulado-O12` e número simulado, que o L2b e L2c removeram da web. Não rodei (e2e pulado no CI); provável vermelho quando o e2e rodar. Apagar ou reescrever no L4.
