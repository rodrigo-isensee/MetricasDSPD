---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l1a-contrato
commit: 5f51fdcd72e9962e6fcbd3b63e41038cb73c8785
parecer: aprovado
revisor: tech-lead
data: 2026-11-06
---
# Code review: 075 L1a, contrato aceita o motivo "não classificado" (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 1a" de `docs/analises/075-plano.md` pede, nem mais nem menos: o contrato de BLOQUEADOS, O2 e O19 aceita o 8º valor de motivo (P-075-3), sem mexer nos 7 do briefing, e nada publicado muda (sem versão de critério T2.6, como o plano diz). Como tech-lead, aprovo a mudança incompatível de contrato (valor novo de enum na resposta) pela saída de aceite por mudança concreta, como pede o §5 da política de mudança e o §6 do plano.

## O que foi lido (diff `6754df7a...5f51fdcd`, 13 commits)

- `packages/contratos/src/comum.ts`: `MOTIVO_NAO_CLASSIFICADO = 'não classificado'` (texto da UX 075 §1), `MOTIVOS_BLOQUEIO_PUBLICADOS` como `[...MOTIVOS_BLOQUEIO, MOTIVO_NAO_CLASSIFICADO]` e o tipo `MotivoBloqueioPublicado`. Os 7 do briefing ficam intactos e continuam a fonte única.
- `schemas.ts:101` e `:135` e `tambem.ts:71` passam ao enum publicado, exatamente os três pontos que o plano lista.
- `packages/metricas/src/businessmap/modelo.ts` (`FatoBloqueio.motivo`) e `estado.ts` (`bloqueioAberto.motivo`): só troca de tipo (import e anotação, +2 -2 cada), sem lógica. O `estado.ts` não está na lista do plano, mas é a consequência de tipo do `FatoBloqueio` alargado; aceito.
- `o19.ts:26` segue iterando os 7: é o Lote 1b (leitura publica "não classificado"), fora deste lote. `t12.ts`, o mock e `bloqueios.test.ts` seguem no tipo de 7, que é atribuível ao de 8; nada a fazer aqui.
- Consumidor: `web/src` não cita `MotivoBloqueio`, `MOTIVOS_BLOQUEIO` nem os textos do enum (busca na ponta, 0 ocorrências), então nenhum `switch` ou `Record<MotivoBloqueio, ...>` exaustivo quebra.
- Teste novo `packages/contratos/src/motivo-nao-classificado.test.ts`: o texto exato, 7 do briefing mais 1, cada um dos três campos aceita os 8 e recusa um nono (`'outro motivo'`) e a variante de caixa (`'Não classificado'`); CA-075-11 percorre as chaves dos três schemas e não acha segmento de pessoa. Cobre o "Testes" do plano.
- Documentação gerada: as três fotografias em `docs/contratos/snapshots/resultados/`, as páginas `BLOQUEADOS.md`, `O2.md`, `O19.md` e `docs/api/openapi.json` mudam só na linha do enum (e na data de revisão das páginas).
- `docs/contratos/snapshots/aceitas.json`: sem diferença no fim da branch e nenhum commit da branch o toca; o aceite foi de uso único, gravado e removido antes da fotografia (precedente `docs/reviews/069-z7-l9a.md`).
- Regras invioláveis: nada individual, só BusinessMap, nenhum cálculo novo, nenhum dado de pessoa.

## Ferramentas

- CI do push na ponta `5f51fdcd`: run 42240125978, `completed`/`success` (inclui `docs:check` e `openapi:verificar`, conforme o plano).
- Teste do arquivo tocado (D-5): `vitest run src/motivo-nao-classificado.test.ts --maxWorkers=2` em `packages/contratos`: 1 arquivo, 5 testes, todos verdes.
- Teto M14: código e teste somam 68 linhas (`comum.ts` 5, teste 45, `schemas.ts` 6, `tambem.ts` 4, `estado.ts` 4, `modelo.ts` 4); fotografias, `openapi.json` e `.md` ficam fora. Abaixo de 150, um comportamento só.

## Achados

- A1 (recomendado) docs/contratos/snapshots/aceitas.json:1 · O aceite não ficou no histórico da branch; o corpo do PR (E1.9) traz as 3 entradas copiadas do docs:check, a linha do checklist §6 e a conferência de que o web não é exaustivo, como o plano do Lote 1a manda.
