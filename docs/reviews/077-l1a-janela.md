---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l1a-janela
commit: 6058609f3d36060e6bb07cfe27c56cf5d600ddbf
parecer: aprovado
revisor: tech-lead
data: 2026-11-06
---
# Code review: 077 L1a, janela incompleta na biblioteca e no contrato das tendências (K-211)

## Parecer

Aprovado. O lote faz o que a seção "Lote 1a" de `docs/analises/077-desenho.md` pede, nem mais nem menos: a função única da janela na biblioteca e o campo opcional com refine nos dois schemas de tendência, como mudança aditiva (§4), sem `aceitas.json` e sem `.strict()`. Nenhum cálculo de O3, O4, S2 ou S3 muda (ADR 0019), e nenhuma tendência aplica a janela ainda (isso é o Lote 1b).

## O que foi lido (diff `78cf396c...6058609f`, 2 commits)

- `packages/metricas/src/core/series.ts:116-118`: `janelaIncompleta(janela: Intervalo, historicoDesde?: string)` é verdadeira só com `janela.inicio < historicoDesde`. Recebe a janela pronta (não recalcula as 12 semanas), e o campo ausente dá falso, como a regra A4 do §3. Fica em `core` e é exportada por `core/index.ts:8` (`export * from './series'`).
- `packages/metricas/src/core/series.janela-incompleta.test.ts`: cobre a fronteira (`inicio = historicoDesde` completa; `historicoDesde` um dia depois do início, ou seja, janela que começa um dia antes, incompleta) e o ausente (omitido e `undefined`).
- `packages/contratos/src/schemas.ts:1324-1375`: `janelaIncompleta: { historicoDesde }` opcional por item de `meses` em `resultadoTendenciaFluxo` e `resultadoTendenciaSust`. O refine recusa o mês marcado que traz `p85PorTipo` ou `prioridades` não vazio. Não há `.strict()`, e o comentário cita a A5. A reindentação explica o tamanho do diff do `schemas.ts` (+37 -24).
- `packages/contratos/src/tendencia-janela.test.ts`: o campo ausente é aceito nos dois schemas; o refine recusa o mês marcado com estatística e aceita o mês marcado só com contagens; o campo extra de pessoa some no parse. Cobre a lista de testes do Lote 1a.
- Documentação gerada no commit `a8e3cd87`: as duas fotografias (`docs/contratos/snapshots/resultados/TENDENCIA_FLUXO.json` e `TENDENCIA_SUST.json`) e as páginas `TENDENCIA_FLUXO.md` e `TENDENCIA_SUST.md` mudam só no bloco `janelaIncompleta` e na data de revisão. O `required` de cada mês fica igual, então a mudança é aditiva.
- Desvio do brief, `docs/api/openapi.json` (commit à parte `6058609f`, +24 -0): o commit toca só esse arquivo, e o diff é o mesmo bloco `janelaIncompleta` gerado do Zod, uma vez em cada schema de tendência. Nada além disso muda, e o job `openapi` da CI na ponta confirma que o arquivo bate com o schema. Aceito como artefato gerado (DECISÃO TÉCNICA do Jarvis, 16:05).
- `server/`, `web/` e `docs/contratos/snapshots/aceitas.json`: sem diff na branch.
- Regras invioláveis: nenhum campo por pessoa (o teste prova que um campo extra some), BusinessMap e Acelerato não se misturam (cada schema guarda a sua marca) e a janela segue num só lugar (`core`).

## Ferramentas

- CI do push na ponta `6058609f`: run 42274952850, `completed`/`success`. Ficaram verdes `rapida`, `testes` (cobertura 100%, spec-check, docs:check), `openapi`, `banco`, `imagem`, `build` e `seguranca`; `e2e` e `perf` foram pulados pelo filtro.
- Testes dos arquivos tocados (D-5), com `--maxWorkers=2`: `vitest run src/tendencia-janela.test.ts` em `packages/contratos` deu 1 arquivo e 4 testes verdes; `vitest run src/core/series.janela-incompleta.test.ts` em `packages/metricas` deu 1 arquivo e 2 testes verdes.
- Teto M14 (`git diff --numstat --no-renames`): código e teste somam 150 linhas (`schemas.ts` 61, `tendencia-janela.test.ts` 70, `series.janela-incompleta.test.ts` 14, `series.ts` 5). Fotografias, `openapi.json` e `.md` ficam fora da conta. O lote fica no teto, sem passar dele, e tem um comportamento só.

## Achados

- A1 (recomendado) packages/metricas/src/core/series.ts:117 · A comparação é de texto e só vale com as duas datas em AAAA-MM-DD (`iso` é `z.string()`). Com hora no `historicoDesde`, a fronteira erra. O Lote 3a entrega o campo já validado em AAAA-MM-DD (A13), com teste de fronteira.
