---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l7-sust-real
commit: d0b7818a94086c77ef365c1fdd5c1d35147e9b26
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---
# Code review: 077 lote 7, TENDENCIA_SUST no mapa real (K-211, E2.2)

Revisão incremental depois do merge da develop (`7a44f941`, com o Lote 5 por squash). Diff lido: `origin/develop..d0b7818a` nos arquivos de código e teste (5 arquivos, 103 adições e 6 remoções); os outros dois arquivos do diff são os pareceres de QA e de review. Comparado com `## Lote 7` de `docs/analises/077-desenho.md` e com A8, A9 e A11 de `docs/analises/077-desenho-revisao-tech-lead.md`.

## Parecer
**Aprovado.** Contra a develop atual o diff é só o do Lote 7, sem nada a mais.

- **Resolução do merge:** a constante do Lote 5 (`VERSAO_CRITERIO_TENDENCIA_FLUXO_DADO_REAL`, id `criterio-2026-11-10-tendencia-fluxo-dado-real`, data 2026-11-10, `packages/metricas/src/core/criterios.ts:138-144`) ficou intacta (o diff não a toca) e as duas constantes estão em `VERSOES_DA_BIBLIOTECA` (`:166-167`). `TENDENCIA_FLUXO` segue em `METRICAS_ORIGEM_REAL`.
- **Mapa real e simulação (A9):** `TENDENCIA_SUST` entrou em `METRICAS_ORIGEM_REAL` (`packages/contratos/src/origem.ts:35-36`) e continua em `METRICAS_SEM_SIMULACAO`. `origem.test.ts` confere por lista de ids e o T-C1 afirma o id no mapa real com `podeSimular` falso.
- **Constante da virada (A8, P-077-3):** `VERSAO_CRITERIO_TENDENCIA_SUST_DADO_REAL` com `afeta: ['TENDENCIA_SUST']` (`criterios.ts:146-153`), no molde do Lote 5. Data 2026-11-10 (A1 abaixo).
- **P-077-6 = (a):** sem início de histórico no Acelerato, nenhum mês sai com `janelaIncompleta`, mesmo com carga inicial do BusinessMap na base (`server/tests/tendencia-sust-real-l7.test.ts:65-68`).
- **Mínimo de 20 itens:** P2 com 19 apuráveis sai `insuficiente` com `n: 19` e P3 publica, no mesmo mês (`:56-63`).
- **BusinessMap e Acelerato sem mistura:** o corpo com card do BusinessMap é igual ao corpo sem ele (`:70-74`).
- **Marca da virada em `criterios`** (`:76-80`) e **nota do S2 no resultado real** (`:82-84`).
- **Nenhum cálculo novo (T2.5, ADR 0019):** o diff não tem fórmula; o número sai pela biblioteca.
- **`qa-f6-painel.test.ts`:** a única mudança inclui o id na lista dos reais (`:98`).
- Regras invioláveis: nenhuma visão individual, nada de credencial nem dado de pessoa no diff.

## Ferramentas
- **Testes dos arquivos tocados, rodados em `d0b7818a`:** `server` `tests/tendencia-sust-real-l7.test.ts` e `tests/qa-f6-painel.test.ts`, 11 verdes; `packages/contratos` `src/origem.test.ts`, 17 verdes. Lint, tipos e cobertura vêm da CI do PR.
- **Mutações:** S1 e S2 refeitas no parecer anterior (sobre `9dc0c0ef`); o patch do Lote 7 não mudou no merge (mesmos 103+6 de código e teste), então valem.

## Teto M14
109 linhas de código e teste (`origem.test.ts` 5+5, `origem.ts` 2+0, `criterios.ts` 10+0, `qa-f6-painel.test.ts` 1+1, `tendencia-sust-real-l7.test.ts` 85+0), um comportamento só.

## Sondas
- S1 · tirar `'TENDENCIA_SUST'` de `METRICAS_ORIGEM_REAL` (`origem.ts:36`) · espera: teste reprova · obtido: 7 reprovados (5 no server, 2 em `origem.test.ts`)
- S2 · tirar a constante de `VERSOES_DA_BIBLIOTECA` (`criterios.ts:167`) · espera: teste reprova · obtido: 1 reprovado (`a marca da virada aparece em criterios`)

## Achados
- A1 (recomendado) packages/metricas/src/core/criterios.ts:148 · a data 2026-11-10 (e o id que a repete) é a da entrega; se o dia do merge do PR for outro, corrigir os dois (A8). A marca só aparece no mês fechado (R5).
- A2 (recomendado) server/tests/tendencia-sust-real-l7.test.ts:65 · para `TENDENCIA_SUST` o serviço nem carrega o BusinessMap (`servico.ts:270`); os testes da janela e do card valem como regressão, sem provar que o dublê do BusinessMap foi consultado.
