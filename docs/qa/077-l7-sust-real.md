---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l7-sust-real
commit: 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---
# QA: 077 lote 7, TENDENCIA_SUST no mapa real (E2.3, K-211)

Código testado: `9dc0c0ef` (diff `origin/feature/077-l5-fluxo-real..9dc0c0ef`, 5 arquivos; o HEAD `20042cb6` só soma `docs/reviews/077-l7-sust-real.md`). Obrigações: `## Lote 7` de `docs/analises/077-desenho.md`, A11, P-077-6 = (a), ADR 0003 (A1, C3). Sem alteração minha em código ou teste: reversões e mutantes foram feitos à mão na worktree e restaurados (`git status` limpo antes do commit).

## Escopo
- Dentro: `TENDENCIA_SUST` em `METRICAS_ORIGEM_REAL` (e fora da simulação), constante da virada do Acelerato em `VERSOES_DA_BIBLIOTECA`, prova de rota com base real mínima (sem mock do serviço nem da biblioteca).
- Fora: tela (L3/L4/L6b), `TENDENCIA_FLUXO` (Lote 5), E2E e acessibilidade (sem mudança de tela, `web/` sem diff), Postgres real.
- Escopo conferido contra o diff: nada além do Lote 7; `qa-f6-painel.test.ts` só inclui o id na lista dos reais. O Lote 7 não toca `servico.ts`: a decisão de domínio (`ac` lido, `bm` nulo) já vem do `fonteDaMetrica`.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Prioridade com 19 apuráveis `insuficiente` (abaixo de 20 não publica); a de 60 publica `ok`; resposta pelo schema, sem `x-estado-dado` | `tendencia-sust-real-l7.test.ts` "responde com dado real..." | 19 (mínimo - 1) | passou (ver A1) |
| P-077-6 = (a): nenhum ponto com janela incompleta pelo Acelerato, mesmo com `inicio_carga` do BusinessMap (2026-11-20) | "sem início de histórico..." | histórico do BM tardio | passou |
| BusinessMap sem efeito no resultado (cards na base não mudam o corpo) | "dado do BusinessMap não altera o resultado" | n/a | passou (ver nota 1) |
| Marca da virada em `criterios` (id e data da constante) | "a marca da virada aparece em criterios" | n/a | passou |
| Nota da ressalva do S2 (`excecao-sla-sem-fonte`) no resultado real, ponta a ponta | "a nota da exceção de SLA sem fonte..." | n/a | passou |
| Id no mapa real e nunca simulável | `packages/contratos/src/origem.test.ts` (lista exata por id, T-C1), `qa-f6-painel.test.ts` | lista exata de ids | passou |

Nota 1: com o código do lote revertido o teste do BusinessMap passa (corpo `sem-dado-real` igual com e sem cards); ele só prova a separação com o cálculo ligado. Provei que não é vazio por mutação (M1 abaixo).

## Execução
Node do nvm, `--maxWorkers=2`, na worktree, no head `20042cb6` (código igual a `9dc0c0ef`).
- `server/tests/tendencia-sust-real-l7.test.ts`: 5 passaram; `server/tests/qa-f6-painel.test.ts`: 6 passaram.
- `packages/contratos/src/origem.test.ts`: 17 passaram.
- Suíte completa: não rodei local. Prova: check-run `bateria` do CI do mesmo sha; não conferido por mim neste parecer (o review aprovou em `20042cb6`).

## Vermelho antes do verde
Código do lote revertido à base à mão (`git checkout 8e2889ba -- packages/contratos/src/origem.ts packages/metricas/src/core/criterios.ts`, testes do head mantidos); restaurado com `git checkout HEAD -- packages server/src`. Não usei `forge-testes --vermelho` (pedido de produto; reversão à mão, como o brief pediu).
- `server`: 5 falharam, 6 passaram (11). Falham: o mapa real do `qa-f6-painel`, "responde com dado real...", "sem início de histórico...", "marca da virada", "nota da exceção". Passou na base: "dado do BusinessMap" (nota 1) e testes não ligados ao id.
- `packages/contratos` `origem.test.ts`: 2 falharam, 15 passaram ("é real exatamente para as..." e "T-C1").

## Mutação à mão no diff (cada mutante contra `tendencia-sust-real-l7.test.ts`)
| Mutante | Resultado |
|---|---|
| M1 `servico.ts:272` carregar o BusinessMap sempre (tirar `dom === 'acelerato' ? null :`) | morto: "dado do BusinessMap não altera o resultado" |
| M2 `afeta` da constante trocado para `TENDENCIA_FLUXO` | morto: "marca da virada" |
| M3 tirar a constante de `VERSOES_DA_BIBLIOTECA` | morto: "marca da virada" |
| M4 tirar `TENDENCIA_SUST` de `METRICAS_ORIGEM_REAL` | morto: 4 no `server`, 2 em `origem.test.ts` (reversão acima) |
Nenhum sobrevivente.

## Latência (A1 e C3 da ADR 0003): medido, com ressalva
Método: arquivo temporário `server/tests/zz-qa-lat.test.ts` (removido; não vai ao repositório), mesma fixture do lote com 6.000 chamados sintéticos (4 prioridades, 700 dias, todos apuráveis), `buildApp` real, pg em dublê, `GET /api/v1/metricas/TENDENCIA_SUST?dataReferencia=2026-12-01`, app novo a cada chamada (monta app, lê a base e calcula: pior caso), 1 fria mais 20 medidas, relógio de parede, load médio 0,6 a 0,8, duas rodadas.
| Condição | Fria | p50 | p95 |
|---|---|---|---|
| 6.000 chamados, app novo a cada chamada, rodada 1 | 334 ms | 100 ms | 155 ms |
| idem, rodada 2 | 345 ms | 102 ms | 222 ms |
Leitura: o p95 de 20 medidas fica em 155 a 222 ms, dentro de A1 (< 300 ms). A primeira chamada fria (montagem do app mais leitura da base) passou de 300 ms (334 e 345), como já ocorreu no Lote 5; A1 pede p95 e a frio de partida é coberta por S1, mas a margem é curta. **Não medido:** A1 contra o Postgres real com 2 anos de seed (`e2e/tests/perf-api.spec.ts` exige a pilha no ar; regra: nada contra a base real) e o C3 em CPU time da biblioteca isolada (`packages/mock/src/desempenho.test.ts` não cobre este id). O dublê não tem custo de rede nem de leitura de linhas. Não é bug, não bloqueia.

## Bugs
Nenhum aberto.

## Achados
- A1 (recomendado) server/tests/tendencia-sust-real-l7.test.ts:62 · a fronteira publica/insuficiente testa 19 e 60, não 20 exato; 20 apuráveis na rota pegaria `> 20` no lugar de `>= 20` na integração (a biblioteca cobre o 20 em `regras.test.ts`).
- A2 (recomendado) server/src/modulos/metricas/servico.ts:272 · a primeira chamada fria mediu 334 a 345 ms sem Postgres (A1 = 300 por p95); medir contra a base real na homologação e, se passar, pré-calcular na carga (ADR 0019).
