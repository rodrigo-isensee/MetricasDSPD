---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-e2e-habilitador
commit: 5cd315ecda4e6c54d077e13e73909881e03b5060
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-17
---
# Review: 105-melhorias-15-11 · e2e de filtros com o Habilitador (E7.581)

Classe T. Base `acb62951` (develop, #547). Diff: uma linha, `e2e/tests/intensivo-filtros.spec.ts:21` (1+/1-).

## O que foi lido
- `e2e/tests/intensivo-filtros.spec.ts:21`: `TIPOS` ganha `habilitador` entre `divida-tecnica` e `trabalho-produto`, a mesma ordem de `TIPO_ID` em `packages/contratos/src/filtros.ts:17-26` (sem `incidente`, que é só da Sustentação e já ficava fora da lista). `TIPOS` é usada em IF-00 (linha 229, `toEqual`) e em IF-I01 (linha 553); os dois passam a conferir as 7 opções da tela.
- Outras listas fixas de tipo no `e2e/`: as demais ocorrências (`estados.spec.ts:48`, `operacional-lote3.spec.ts:143`, `espera-invisivel-nos-paineis.spec.ts:151`, `intensivo-filtros.spec.ts:82,431-433`) são filtros pontuais, não listas completas; nenhuma fica defasada pelo T3.
- `e2e/fixtures/constantes.ts:98` (`SLUGS.tipos`): fica fora deste PR. Não tem nenhum importador em `e2e/`, `web/`, `server/` nem `packages/` (grep por `SLUGS`), e já estava defasada antes do T3 (falta `trabalho-produto`). Não muda resultado de teste; é código morto, recomendado remover num item próprio (A1).

## Verificação
- Teste da linha mudada, no head `5cd315ec`: `playwright test tests/intensivo-filtros.spec.ts -g "IF-00|IF-I01"` → `2 passed (32.5s)`.
- Mutante (linha 21 de volta ao texto da develop): os mesmos dois → `2 failed` (IF-00 `:217`, IF-I01 `:547`). O teste mata o mutante; árvore restaurada depois.
- Spec inteira: cito o PQ do autor, 139 passed em `intensivo-filtros.spec.ts` com IF-00 e IF-I01 de volta ao verde; não rerrodei. Sem PR aberto para a branch: a suíte inteira fica para o CI do PR, e este parecer não afirma CI verde.
- Regras "leitura" alcançadas: só teste E2E; nenhuma regra inviolável tocada (lista de tipo do fluxo, sem mistura com Sustentação). A tela não foi ajustada ao teste: o teste é que segue o contrato.

## Achados
- A1 (recomendado) e2e/fixtures/constantes.ts:98 · SLUGS.tipos não tem importador e já estava defasada antes do T3 (sem trabalho-produto); código morto. Remover SLUGS (ou só tipos) num item próprio, fora deste fix urgente.

## Sondas

## Parecer
Aprovado. A correção é mínima, segue a ordem do contrato (`TIPO_ID`) e o par IF-00/IF-I01 passa no head e falha com a linha antiga. A1 é recomendado e não devolve.
