---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l6a-versao-criterio
commit: 9e3078c17f4586afb3308108059755e2ebe6dc85
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 075 L6a, versão de critério do bloqueio com dado real e corte da série do O1 (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 6a" de `docs/analises/075-plano.md` pede, como código escuro: com `BLOQUEIOS_COM_DADO_REAL = false` (`packages/contratos/src/origem.ts:51`) a resposta não muda. Os dois achados abaixo são recomendados e não devolvem.

## O que foi lido (diff `54f02c42...9e3078c1`, 2 commits)

- Versão de critério (`packages/metricas/src/core/criterios.ts:122-135`):
  - `VERSAO_CRITERIO_BLOQUEIO_COM_DADO_REAL` com id `criterio-${DATA}-bloqueio-com-dado-real`, `afeta` O1, O2, O5, O19 e BLOQUEADOS, incluída em `VERSOES_DA_BIBLIOTECA`.
  - A descrição começa por "histórico parcial de bloqueios" e registra a regra do instante da coleta. O conteúdo de P-075-2 (início e fim no instante da coleta) e de P-075-6 (histórico parcial) está no texto; os IDs ficam só no comentário. A descrição é texto de tela (marcação T2.6), onde o ID de pergunta não ajuda quem lê: aceito como está, sem achado.
- Data pendente: `DATA_BLOQUEIO_COM_DADO_REAL = '2099-12-31'` num ponto só, com comentário "DATA PENDENTE" que aponta a fonte da data real (primeiro `coletado_em` de `stg_card`, prova do 6b). O id, a `data` da versão e o padrão de `comCorteDaSerieO1` derivam dela. A forma bate com o plano ("o 6a mescla com a data pendente marcada no PR e a data entra no 6b"); o PR precisa levar a marca (E1.9).
- A data futura é segura nas duas pontas:
  - `marcacoesNoPeriodo` (`criterios.ts:163`) só marca versão com data dentro do período: nenhuma marcação aparece agora.
  - A versão vigente vem da base (`lerVersaoCriterioVigente`, `referencia/repositorio.ts:47`), não da biblioteca: a versão nova não vira vigente.
  - Se o interruptor for ligado antes do 6b trocar a data, a série inteira sai `null` (lacuna, nunca zero): falha para o lado seguro.
- Corte da série (`server/src/modulos/metricas/parte-sem-dado.ts:51-60`): função pura, sem cálculo. Só O1 e só com o interruptor ligado. Pontos com `data` anterior à da versão ficam com `bloqueados: null`, o ponto da data em diante segue numérico (CA-7), e `hoje`, `porColuna` e o resto não mudam.
  - A comparação de texto vale porque `data` é ISO `AAAA-MM-DD` (`isoDeDia`, `businessmap/o1.ts:38`).
  - `serie` sempre existe no resultado do O1 (`o1.ts:91`), então o `map` sem guarda de nulo é seguro.
- Ligação (`server/src/modulos/metricas/servico.ts:322`): só na base real, depois do `semParteDeBloqueio` (que só age com o interruptor desligado). As duas publicações se excluem pelo mesmo interruptor. A chamada não tem teste próprio (A1).
- T2.5: nada é calculado fora da biblioteca, o corte é só publicação, como a H-24 e o `semParteDeBloqueio`. T2.6: versão nova na lista da biblioteca, marcada pelo mecanismo existente.
- Testes (`server/tests/corte-serie-o1-075.test.ts`, 4 casos):
  - ligado com data no meio da série (`null` antes, numérico depois, `hoje` intacto);
  - desligado e outra métrica (mesma referência);
  - data pendente (série toda `null`, nenhuma marcação no período);
  - versão na lista, com id, `afeta` e começo da descrição.
  - Rodei só o arquivo tocado (`vitest run tests/corte-serie-o1-075.test.ts`): 4 verdes.
- Escopo: sem diff em `server/src/modulos/businessmap`, `packages/contratos`, `server/migrations` e `web`. Um comportamento só.
- Linha de 15:00 do Histórico conferida no diff real: `criterios.ts` e `parte-sem-dado.ts` são arquivos do 6a. O 4c (`3ae2d53d...origin/feature/075-l4c-colunas-grant`) só mexe em `projetor.ts` (comentários), em testes de colunas e GRANT e em pareceres. Não há arquivo em comum, então não há sobreposição na integração.
- Teto (M14): `git diff --numstat --no-renames 54f02c42...9e3078c1` dá 61 linhas de código e teste (16 + 12 + 4 + 29). O brief fala em 62. Abaixo de 150, sem exceção.
- CI do push no head `9e3078c1`: run 42421899712, `completed`/`success`. O run anterior (42420072430, `0fa4d217`) falhou só no Prettier, corrigido no segundo commit.
- Segurança: sem gatilho (sem leitura nova, sem dado de pessoa).

## Achados

- A1 (recomendado) server/src/modulos/metricas/servico.ts:322 · chamada sem teste próprio; com o interruptor desligado o semParteDeBloqueio já anula a série, então um argumento errado aqui não aparece; o 6b, que liga o corte com a data real, deve testar o O1 real pelo ServicoMetricas.
- A2 (recomendado) server/tests/corte-serie-o1-075.test.ts:17 · o caso da data pendente quebra quando o 6b trocar a data; reescrevê-lo no 6b e somar a marcação presente no O1 e O5 com a data real dentro do período.
