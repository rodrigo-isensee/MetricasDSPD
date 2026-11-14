---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l7-sust-real-b
commit: 42bf48aaf5535918e1e8f3f3af2d15c39f9528ed
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---
# Code review: 077 lote 7, TENDENCIA_SUST no mapa real, branch limpa (K-211, E2.2)

Diff lido: `7a44f941...42bf48aa` (um commit sobre a `develop`). Classe N.

## Parecer
**Aprovado.** O diff contra a `develop` é só o do Lote 7 e é idêntico ao já aprovado na `feature/077-l7-sust-real`.

- **Identidade com o já aprovado:** `git diff --stat origin/feature/077-l7-sust-real 42bf48aa -- packages server` saiu vazio.
- **Escopo:** 5 arquivos. `origem.ts` põe `TENDENCIA_SUST` em `METRICAS_ORIGEM_REAL` (segue fora da simulação); `criterios.ts` traz `VERSAO_CRITERIO_TENDENCIA_SUST_DADO_REAL` (`afeta: ['TENDENCIA_SUST']`, data 2026-11-10); testes ajustados (`origem.test.ts`, `qa-f6-painel.test.ts`) e `tendencia-sust-real-l7.test.ts` novo.
- **Constante do Lote 5 intacta:** `VERSAO_CRITERIO_TENDENCIA_FLUXO_DADO_REAL` aparece só como contexto no diff, sem alteração.
- **As duas em `VERSOES_DA_BIBLIOTECA`:** a do Lote 5 e a nova, esta acrescentada ao fim da lista.
- **Regras invioláveis:** sem mistura BusinessMap e Acelerato (a tendência da sustentação lê só o Acelerato), sem métrica individual, cálculo pela biblioteca (ADR 0019), mudança de critério registrada com data.

## Ferramentas
- **Testes dos arquivos tocados (rodados aqui):** server `tendencia-sust-real-l7.test.ts` e `qa-f6-painel.test.ts`, 11 verdes; contratos `origem.test.ts`, 17 verdes. `bin/forge-testes` não existe neste projeto; usei `vitest run` direto.
- **CI do PR:** é a que vale para o merge; não refeita aqui.

## Teto M14
Contra a `develop`: `origem.test.ts` 5+5, `origem.ts` 2+0, `criterios.ts` 10+0, `qa-f6-painel.test.ts` 1+1, `tendencia-sust-real-l7.test.ts` 85+0, ou seja 109 linhas, com um comportamento só.

## Achados
Nenhum.
