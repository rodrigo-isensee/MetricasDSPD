---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l2-marcacoes
commit: 0d28bb1678b0880cb645188831c58e143ecfaee4
parecer: aprovado
revisor: tech-lead
data: 2026-11-06
---
# Code review: 077 lote 2, a tendência herda as marcações de critério (K-211, E2.2)

Diff lido: `78cf396c...0d28bb16` (3 arquivos, 46 adições e 4 remoções), contra a seção `## Lote 2` e a `## 5. Ordem, teto e conflito com o 075` de `docs/analises/077-desenho.md`.

## Parecer
**Aprovado.** Faz o que o lote pede, nem mais nem menos.

- **Aderência ao desenho:** tabela única `ORIGEM_DA_TENDENCIA` em `packages/metricas/src/core/criterios.ts:138` (`TENDENCIA_FLUXO` -> O3, O4; `TENDENCIA_SUST` -> S2, S3, pela ADR 0019), usada só por `marcacoesNoPeriodo` (`:158`), que passa a filtrar pela própria métrica mais as de origem. Métrica fora da tabela segue valendo só por si (`?? []`), então nenhuma outra métrica muda. Cada versão entra uma vez, mesmo se afetar a tendência e a origem juntas (o filtro é sobre a versão). `criteriosDe` chama a mesma função para `serie` e `janela`, então as duas janelas herdam.
- **Nunca cruzado:** a tabela não liga fluxo a sustentação; o teste afirma `['O3']` sem marca em `TENDENCIA_SUST` e `['S2']` sem marca em `TENDENCIA_FLUXO`. BusinessMap e Acelerato seguem separados.
- **Versão real da virada fora (A8):** nenhuma entrada nova em `VERSOES_DA_BIBLIOTECA`.
- **Testes (`core.test.ts:199-214`):** O3 e O4 marcam `TENDENCIA_FLUXO`, S2 e S3 marcam `TENDENCIA_SUST`, os dois cruzamentos dão zero, a marca sai com `id`, `data` e `descricao` (sem `afeta`), e `criteriosDe('TENDENCIA_SUST', ...)` traz a versão em `serie` (base do CA-12). Data dentro do período, determinístico.
- **`docs/contratos/metricas/TENDENCIA_SUST.md`:** commit à parte (`0d28bb16`), mudança só dentro das marcas de gerado e na data de revisão, que o próprio gerador atualiza (`tools/docs-contratos/src/blocos.test.ts:35`). O exemplo passa a listar `criterio-2026-06-01` em `criterios.serie` e `criterios.janela`, que é a versão fictícia de `packages/mock/src/criterios.ts:15` com `afeta` S2 e S3: consequência direta da herança, `criterios` preenchido (CA-12). `TENDENCIA_FLUXO.md` não muda porque a versão fictícia do fluxo (`criterio-2026-03-02`) não afeta O3 nem O4: coerente.
- **Fora do diff, como pedido:** sem migração, sem mudança de schema, `aceitas.json`, `server/` e `web/` sem diff.
- **Sobreposição com o 075:** `criterios.ts` também é tocado pelo 6a do 075; a branch se atualiza só no merge (`R-FLUXO`) e o PR roda `forge-check sobreposicao` (E2.4).

## Ferramentas
- CI do push no head `0d28bb16`: run 42286081180, `push`, `completed`, `success` (`gh run view`).
- Testes do arquivo tocado, 2 workers: `packages/metricas/src/core/core.test.ts`, 25 verdes.
- `docs:check`: coberto pelo job de contratos da mesma CI verde; não refeito.

## Teto M14
31 linhas de código e teste (`criterios.ts` 11+1, `core.test.ts` 18+1), dentro de 150; a página gerada é `.md`, fora da conta. Um comportamento só.

## Achados
