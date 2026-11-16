---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-t9-real
commit: 6b772b00710434dea455a6675af68b3c9262a121
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: T9 avanço real e escopo com dado real (105, E7.90)

Revisado de `ffc59d8a` (Base-sha) até `6b772b00`: `af2c1270` (métrica, contrato, critério e tela), `883747de` (testes de origem e faixa do Tático) e `6b772b00` (nota no singular e no plural). 16 arquivos, +299/-18.

## O que foi conferido
- **Regra do dono (D-T9 "T9 A") em `t9.ts`:** frente adicionada = `criado_em` da frente estritamente depois do `iniciado_em` do projeto; a criada antes conta como original. Derivada na leitura, sem coluna nova nem migração; `adicionado_apos_inicio_pai` deixa de ser lida pelo T9. Nada além da decisão: a limitação (instante do vínculo não guardado) vira nota no cartão, não inferência no código.
- **Projeto sem início:** fica fora da tabela e da conta e soma em `projetosSemInicio` só quando tem frente filha (projeto sem início e sem frente não conta). Teste unitário cobre os dois casos.
- **Avanço:** concluídas ÷ total das frentes filhas. Só a granularidade `frente` entra nas linhas e só `projeto` como pai: story, frente e projeto não se misturam. Censo por projeto, sem percentil nem estatística agregada (a regra dos 20 itens não se aplica a "k de n").
- **Histórico:** nada é gravado; leitura pura. **Pessoa:** nenhum campo de pessoa lido nem exposto. **BM × Acelerato:** só código do BusinessMap.
- **Contrato:** `projetosSemInicio` opcional (`int`, `>= 0`), mudança compatível; OpenAPI, fotografia `snapshots/resultados/T9.json` e `T9.md` regravados no mesmo diff (exemplo do mock com 3 projetos sem início). CHANGELOG com a entrada.
- **Critério (T2.6):** `VERSAO_CRITERIO_T9_ESCOPO_CRIADO_EM` (`criterio-2026-11-16-t9-escopo-criado-em`, afeta T9) em `VERSOES_DA_BIBLIOTECA`; o teste de servidor confere `x-versao-criterio` diferente de 0.
- **Origem:** T9 em `METRICAS_ORIGEM_REAL`; `origem.test.ts` e `qa-f6-painel.test.ts` atualizados, este último mantendo os demais T e E fora do mapa real.
- **Tela:** nota `t9-nota-escopo` com a regra e a contagem de projetos sem início, no singular e no plural (testes em `ramos.test.tsx`); nota "como se calcula" alinhada.
- **Testes rodados por mim:** `t9.test.ts` 7 de 7 verdes. Mutantes das guardas: `if (fs.length > 0)` removido mata 1 teste; `criado_em > inicio` trocado pela leitura de `adicionado_apos_inicio_pai` mata 4; `>` trocado por `>=` sobrevive (A1).
- **Tamanho (M14):** 296 linhas de código e teste (137 só em `t9.test.ts`), um comportamento só.

## CI do head
`6b772b00`: run de push 43840512709 todo verde (testes, build, banco, rapida, openapi, seguranca, imagem, filtro; e2e e perf fora por desenho). Run do PR 43840521762: verdes testes (8m18s), build, banco, e2e-parte 1/2 e demais; `e2e-parte (2/2)` cancelado pelo envio do parecer do QA (`ee5978e5`, delta só `docs/qa/105-t9-real.md`). O run 43837118739 vermelho era do `883747de` (job testes, cobertura), resolvido pelos testes do `6b772b00`. Mesmo código em `ee5978e5`: run do PR 43842984121 todo verde, incluindo `e2e-parte (1/2)`, `e2e-parte (2/2)` e `e2e`, e run de push 43842973699 verde.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/t9.ts:43 · a fronteira `criado_em` igual a `iniciado_em` não tem teste: o mutante `>` para `>=` passa 7 de 7. O código segue o "depois" do dono; falta o caso de igualdade no `t9.test.ts`.
- A2 (recomendado) packages/metricas/src/businessmap/e5.ts:36 · o E5 ainda lê `adicionado_apos_inicio_pai`, que a base real nunca grava (vem false). Hoje o E5 está fora do mapa real e não publica zero falso; quando entrar, precisa da mesma regra derivada do T9, senão T9 e E5 divergem sobre o mesmo projeto. Cartão no quadro.
- A3 (recomendado) packages/metricas/src/businessmap/t9.test.ts:1 · tamanho M14: o corpo do PR 483 não traz `teto: excedido, 296 linhas, <motivo>` (M14); o excesso é de teste e o comportamento é um só, então basta a linha no corpo.

## Sem teste
Nada a justificar.
