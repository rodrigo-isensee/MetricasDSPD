---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-9b
commit: e4eaa56c90f8424d86e7e37151e7ae27745375c2
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA do lote 9b (K-204): contrato sem a nota `bloqueio-sem-dado-real`

Base: develop f4c122f15c05fbf5fea86797c9c348656d11ab36. Plano: `docs/analises/075-plano.md`, seção "Lote 9b". Mudança de lote de contrato, sem especificação de UX nova: não há `CA-n` novo; vale o CA-12 do pedido (reversão só pelo interruptor).

## Resultado

| Obrigação | Teste ou prova | Resultado | Fronteira protegida |
|---|---|---|---|
| Nota fora do enum | `origem.test.ts` C3: `notaCartaoIdSchema.safeParse('bloqueio-sem-dado-real')` falso; chaves de `TEXTO_NOTA_CARTAO` = `sem-classe`, `sle-nao-definido` | passa (17 de 17) | id removido recusado |
| Nota fora da API e do OpenAPI | `openapi.json` (3 enums de `notas`) e `snapshots/resultados/O1` sem o valor; S9 varre O1, O2, O3, O5, O19 e BLOQUEADOS na base real | passa (39 de 39) | resposta real sem a nota |
| O1, O2 e O3 seguem com o dado real | S5/S6/S8 e S9 da `painel-real-f6.test.ts` (O1 com bloqueados calculado, O2 com motivo) | passa | n/a |
| `bloqueados` nulo do O1 continua nulo | corte da série antes de 2026-11-01 (teste do 6a, linha 374) e S9b desligado (`hoje` e série todos `null`) | passa | lacuna nunca vira 0 |
| CA-12 só pelo interruptor | S9b com `BLOQUEIOS_COM_DADO_REAL` falso injetado: O1 nulo sem nota, O2 sem nota | passa | interruptor falso |
| Aceite de contrato removido | `git diff f4c122f1 HEAD -- docs/contratos/snapshots/aceitas.json` vazio | `aceitas.json` igual à develop | uso único removido |
| Contrato e docs coerentes | `pnpm run docs:check` | `docs:check: ok (1199 páginas Markdown, 69 métricas, 2 eventos)` | n/a |

Execução com 2 workers (R-TETO; no vitest 5 a opção é `--maxWorkers=2`): `origem.test.ts` 17 passam; `painel-real-f6.test.ts` 39 passam. A suíte inteira fica para o check-run `bateria` do mesmo sha no PR; não cito `.verde` local.

## Mutação no diff

Mutante: religar a nota em `semParteDeBloqueio` (`server/src/modulos/metricas/parte-sem-dado.ts`, ramo O1: `notas: ['bloqueio-sem-dado-real']`).
Saída: `× S9b: CA-12, só pelo interruptor ...` e `Tests 1 failed | 38 passed (39)`. Morto. Arquivo restaurado com `git checkout`; árvore limpa antes do commit.

## Vermelho antes do verde

Os testes mudados invertem asserções existentes (nota aceita vira recusada). A base tinha `true` onde o HEAD tem `false`, então o C3 e o S9 caem na base por construção. Não rodei `forge-testes --vermelho` (comando do Forge, fora deste projeto); a mutação acima prova o S9b falhando sem a implementação.

## Observação

O título do S9b diz "ligado, nenhuma nula no hoje", mas o corpo só prova o lado desligado; o lado ligado é coberto por S6 e S8. É texto de título, não lacuna de cobertura.

## Achados

- A1 (recomendado) server/tests/painel-real-f6.test.ts:484 · título do S9b cita o caso "ligado" que o corpo não afirma; ajustar o título ou mover a frase para S6.
