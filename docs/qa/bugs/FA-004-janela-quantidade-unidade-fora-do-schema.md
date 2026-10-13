# FA-004 - Biblioteca devolve `janela.quantidade/unidade`, o contrato não declara e a API descarta; schemas de resultado não são `.strict()`
- Status: verificado pelo QA em 2026-10-13 (paridade 52/52 e E2E chromium-api 18/18); era: corrigido (feature/front-via-api)
- Severidade: baixa
- Responsável sugerido: node-backend (pacote `contratos`: declarar os campos ou parar de emiti-los na biblioteca)
- Ambiente: feature/front-via-api

## Passos para reproduzir
Teste de paridade, comparação "corpo bruto" (O2, O4, O6, O8, O9, T1, T6, E1, E5, S4, S9, S10, EI_*).

## Resultado esperado
O mesmo objeto antes e depois do parse; campo extra deveria falhar (`.strict()`), não sumir.

## Resultado obtido
O mock (biblioteca) emite `base.janela.unidade/quantidade` (e em `estatistica.janela`, `previsao.janela`, `faixa.janela`); o serializador da API os remove e o parse do front também. Hoje é invisível na tela (a UI não usa), mas a paridade só vê isso comparando o corpo bruto, e nada impede um campo novo de vazar ou de sumir em silêncio.

## Evidência
`$.base.janela.unidade: só no mock | $.base.janela.quantidade: só no mock` na saída do teste de paridade.

## Correção
`unidade` (`semanas`|`meses`) e `quantidade` passam a ser declaradas, opcionais, em `base.janela`, `estatistica.janela`, `janelaFaixa` e `janelaAnterior` (`janelaCalculoSchema` em `packages/contratos/src/comum.ts`; acréscimo compatível: o `docs:check` classifica como "campo novo opcional" e os snapshots, o OpenAPI e as páginas foram regerados). `.strict()` nos schemas de resultado foi avaliado e não aplicado: os mesmos schemas validam a resposta no front, e campo novo da API passaria a derrubar um front mais antigo (acréscimo deixa de ser compatível); testado, 2 testes do front quebraram exatamente por isso. A detecção de campo que some ou aparece fica com o corpo bruto da paridade (`web/paridade`), documentado em `docs/api/metricas.md`.
