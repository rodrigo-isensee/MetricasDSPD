---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l8a-contagem-parcial
commit: 50241b30c45bee9679fc24002de4051a8afe6c0a
parecer: aprovado
revisor: tech-lead
data: 2026-11-09
---
# Code review: 077 lote 8a, contagemParcial no item de meses das tendências (K-211, E2.2)

Diff lido: `54f02c42...01877ac8` (12 arquivos, 139 adições e 5 remoções; código e testes em `4c60e099`, artefatos gerados em `01877ac8`), contra `## Lote 8` e `## P-077-5 revista` de `docs/analises/077-desenho.md`. O head revisado `50241b30` é o merge da develop `fb719e7a` sobre `01877ac8`, sem conflito: a base do lote (`54f02c42`) é ancestral da develop, e o diff contra `origin/develop` dá as mesmas 144 linhas.

## Parecer
**Aprovado.** Faz o que o Lote 8a pede (P-077-5 = A, molde aditivo, confirmada pelo dono em 2026-11-07 21:56), sem nada a mais.

- **Função única pela biblioteca (T2.5, ADR 0019):** `contagemParcial(primeiroDiaDoMesIso, historicoDesde?)` em `packages/metricas/src/core/series.ts:124-125`; os dois cálculos (`businessmap/tendencia.ts:39-41`, `acelerato/tendencia.ts:41-43`) só a chamam com `isoDeDia(b.inicioDia)`. Nenhuma regra na API nem em `server/`.
- **Condição diferente da janela (A10):** compara o primeiro dia do mês, não o início da janela de 12 semanas (`janelaIncompleta`, `series.ts:116-117`). Comparação de texto segura: `historicoDesde` vem do `inicio_carga` validado como `AAAA-MM-DD` (`server/src/modulos/metricas/repositorio.ts:171`), mesmo formato do `isoDeDia`.
- **Fronteira:** mês que começa no `historicoDesde` não é parcial, e com o `historicoDesde` um dia depois do primeiro dia do mês é (`series.janela-incompleta.test.ts:17-19`); ausente sem `historicoDesde` (`:21-22` na função; `tendencia.test.ts:471-477` nas duas tendências, por `'contagemParcial' in m`, que pega também a chave com `undefined`).
- **Número mantido:** `concluidos` e `volume` seguem obrigatórios no schema e no payload; o teste do fluxo afirma o número no mês marcado (`tendencia.test.ts:461`).
- **Contrato aditivo:** `contagemParcialTendencia = z.object({ historicoDesde: iso }).optional()` (`schemas.ts:1327`) nos itens de `meses` das duas tendências (`:1352`, `:1373`); os refines existentes intactos. `docs/contratos/snapshots/aceitas.json` sem diff (segue `"aceitas": []`); `docs:check` verde.
- **Artefatos gerados coerentes:** `openapi.json` com o mesmo bloco duas vezes (uma por tendência), `TENDENCIA_FLUXO.md` e `TENDENCIA_SUST.md` (bloco gerado e data de revisão) e as duas fotografias em `snapshots/resultados/`, todos com o mesmo shape do schema (objeto, `historicoDesde` string obrigatório, `additionalProperties: false`), só no commit `01877ac8`.
- **BusinessMap e Acelerato sem mistura:** cada tendência lê o `historicoDesde` do próprio contexto (`ContextoBM`, `ContextoAC`). Pela P-077-6 (a), o Acelerato não tem início de histórico; o ramo da sustentação fica sem efeito em produção até alguém preencher `ContextoAC.historicoDesde`, e o teste prova o comportamento se isso ocorrer.
- **Fora do diff, como pedido:** `web/`, `server/` e migrações sem diff.

## Ferramentas
- CI do push no head `50241b30`: run 42571965393, `CI`, `completed`, `success` (jobs rapida, testes, filtro, seguranca, build, openapi, imagem e banco verdes; e2e e perf pulados pela regra do workflow). Lint, tipos e cobertura cobertos por ela; não refeitos.
- **Os 8 timeouts da web relatados pelo autor sob carga:** a CI do push não os confirma; o job `testes` fechou `web cobertura: Test Files 98 passed (98)`. A web não foi tocada pelo lote; tratá-los como efeito da carga local (pedido 080, testes instáveis da web).
- Testes dos arquivos tocados: `packages/metricas` `src/core/series.janela-incompleta.test.ts` e `src/tendencia.test.ts`, 38 verdes; `packages/contratos` `src/tendencia-janela.test.ts`, 6 verdes.
- `pnpm run docs:check`: `ok (1095 páginas Markdown, 69 métricas, 2 eventos)`.

## Teto M14
80 linhas de código e teste (`series.ts` 8+0, `series.janela-incompleta.test.ts` 11+1, `businessmap/tendencia.ts` 10+1, `acelerato/tendencia.ts` 10+1, `tendencia.test.ts` 26+0, `schemas.ts` 4+0, `tendencia-janela.test.ts` 8+0); 144 com os artefatos gerados, que ficam fora da conta. Um comportamento só.

## Achados
- A1 (recomendado) packages/metricas/src/tendencia.test.ts:465 · o caso da sustentação não afirma que `volume` segue número no mês marcado, como o do fluxo faz com `concluidos`; acrescentar no próximo lote que tocar o arquivo, sem volta só por isso.
