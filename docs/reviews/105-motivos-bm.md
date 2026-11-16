---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-motivos-bm
commit: e0fb925f66e710efcd3f150b4385710a87c16407
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: motivos de bloqueio do BusinessMap (E7.229)

## O que foi conferido
- Diff `0c989148...e0fb925f`, 2 commits (`fa1e83e6` E7.184, `e0fb925f` E7.210), 46 arquivos. Código e teste em `packages/`, `server/`, `web/` e `e2e/`: 407 linhas, acima da orientação de 150 (M14). É um comportamento só (o domínio fechado de motivos troca de lista) que se espalha por fixtures e testes que citavam os 7 textos antigos; o PR precisa levar `teto: excedido, 407 linhas, troca do domínio de motivos arrasta fixtures e testes que citavam os 7 do briefing`.
- **Decisão B do dono (2026-11-16 09:13) e catálogo.** `MOTIVOS_BLOQUEIO` (`packages/contratos/src/comum.ts:99`) tem os 11 rótulos do catálogo, texto exato; `motivo_bloqueio` em `businessmap-dominio.json` mapeia os ids 1 a 3, 6, 7 e 9 a 14 aos mesmos rótulos, sem 5 e 8. Id sem entrada ou nulo segue "não classificado" (`motivosDeLinhas` e `motivoPublicado` inalterados na lógica). Teste `server/tests/dominio-motivo-bloqueio.test.ts`: 14 passaram.
- **Decisão das 09:29 (T10, substitui a das 09:21).** `MOTIVOS_FORNECEDOR` = 14 Aguardando fornecedor e 11 Dependência Externa, com `satisfies readonly MotivoBloqueio[]`. Neste diff ela só alimenta o mock; o `t10.ts` real continua contando bloqueio com fornecedor informado, de qualquer motivo: a ligação do T10 aos dois motivos é do PR 487, que volta à fila depois deste (Riscos).
- **T12 sem inferência.** `MOTIVOS_IDA_E_VOLTA` nasce vazio: o critério (a) não conta nada e só o (b) vale, até o dono apontar o motivo (pergunta aberta registrada às 10:29). A fotografia do T12 cai de k=120 para k=28 na base fictícia, coerente com isso. Mutante rodado: `MOTIVOS_IDA_E_VOLTA.has(b.motivo)` trocado por `true` em `t12.ts:24` derruba 3 testes, entre eles o novo "E7.184: sem motivo de ida e volta definido pelo dono" (morto). Fonte restaurada, árvore limpa. `t12.test.ts`: 15 passaram.
- **Mock.** O sorteio de motivo saiu de `rngBlq` para fluxos derivados próprios e `rngBlq` consome o mesmo número de sorteios de antes (um para a fatia de fornecedor, outro para o nome), então volume e datas dos bloqueios não mudam; a proporção de 2 em 7 para fornecedor fica.
- **Versão de critério (T2.6).** `VERSAO_CRITERIO_MOTIVOS_BLOQUEIO_BM` entra em `VERSOES_DA_BIBLIOTECA` com `afeta` BLOQUEADOS, O2, O19, T10 e T12, como o pedido diz. O texto dela, porém, é o do primeiro commit e não foi atualizado com o id 14 (A1); o mesmo texto velho está na nota do briefing (A2) e em outros três lugares (A3 a A5).
- **Regras invioláveis.** Sem pessoa: motivo é domínio fechado, nunca texto livre. BusinessMap e Acelerato não se misturam: o "Aguardando fornecedor" do Acelerato (`acelerato/modelo.ts:22`, `totalizadores.ts:65`) é outro domínio e não foi tocado. Cálculo na biblioteca compartilhada.
- **Incompatibilidade de contrato: ratifico** (politica-de-mudanca §2 e §5, junto do arquiteto). O enum de motivo em O2, BLOQUEADOS e O19 perde 6 valores e ganha 10: é incompatível ("valor de enum removido" e "valor novo de enum na resposta"). Aceito sem `/api/v2` porque o único consumidor é o `web` deste repositório, que muda no mesmo PR; e, no dado real, o mapa de motivos nascia vazio, então nada publicado trazia os 7 antigos (tudo saía "não classificado"). O fluxo do §2 foi seguido: fotografias novas em `docs/contratos/snapshots/resultados/` e nenhuma entrada sobrando em `aceitas.json`. Mudança de critério é do dono, e ele decidiu (decisão B).
- **PQ do autor:** pronto verde em `e0fb925f` (histórico do pedido, 2026-11-16 12:09). Suíte inteira: só no CI do PR. Mas o CI do push em `e0fb925f` (run `43893195688`) terminou vermelho em dois jobs, `build` e `banco` (A8 e A9); o `pronto` local não pega nenhum dos dois. Reproduzi o A8 local: `node e2e/scripts/hash-base-mock.mjs --comparar docs/qa/evidencias/hash-base-fase-a.json` → `FALHOU: difere em hashBase, hashBusinessMap (antes: b6a3c384, 8d47d431; agora: 88a5c095, 08e2b5e2)`.
- Commits: Conventional Commits em português, um por etapa, com cartão.

## Achados
- A1 (bloqueante) packages/metricas/src/core/criterios.ts:142 · descrição diz "10 motivos, ids ... 9 a 13" e fornecedor só Dependência Externa; o código tem 11 e a decisão das 09:29 conta 11 e 14. O texto vai à tela (`AvisoCriterio.tsx:41`): corrigir para ids 1 a 3, 6, 7, 9 a 14 e os dois de fornecedor.
- A2 (bloqueante) docs/briefing-execucao-metricas.md:137 · a nota datada na fonte da verdade repete o texto velho (ids até 13, fornecedor só Dependência Externa) e contradiz a decisão das 09:29. Mesma correção de A1.
- A3 (recomendado) CHANGELOG.md:9 · "os 10 habilitados (ids 1 a 3, 6, 7 e 9 a 13)" e fornecedor só "Dependência Externa"; alinhar com A1.
- A4 (recomendado) docs/architecture/fontes/businessmap-dominio.json:12 · a `regra` diz "um dos 10 motivos habilitados"; o mapa logo abaixo tem 11.
- A5 (recomendado) packages/metricas/src/businessmap/t12.ts:9 · o comentário diz "nenhum dos 10 motivos do BusinessMap"; são 11.
- A6 (recomendado) packages/metricas/src/businessmap/t12.ts:12 · `Set` exportado e mutável: qualquer importador muda a regra do T12, e o teste depende disso. Quando o dono responder, usar `ReadonlySet` constante e passar o motivo de teste por parâmetro de `teveIdaEVolta`.
- A7 (recomendado) packages/metricas/src/businessmap/t12.test.ts:16 · `import` depois de `beforeAll`/`afterAll`; o ESM içou, mas lê como se os hooks rodassem antes. Subir o `import` para o topo.
- A8 (bloqueante) docs/qa/evidencias/hash-base-fase-a.json:1 · o gerador mudou a base mock (motivos), mas a referência do hash não; o gate do job `build` falha. Atualizar a referência com o hash novo, registrando no commit que a mudança é a dos motivos.
- A9 (bloqueante) server/tests/dominio-businessmap.pg.test.ts:66 · `expect(esperadas).toBe(370)` com o arquivo real dando 381 (os 11 do mapa de motivos); o job `banco` falha (`expected 381 to be 370`). Ajustar a contagem fixa ao arquivo.

## Riscos e pendências
- T10 real ainda não usa `MOTIVOS_FORNECEDOR`: entra pelo PR 487. Até lá, o T10 com dado real segue o critério antigo (fornecedor informado) e a marca da versão de critério já aparece nele.
- T12: pergunta ao dono (qual motivo é ida e volta) segue aberta; até a resposta, o critério (a) não conta nada.
- Depois do merge, recarregar o domínio (`pnpm --filter server bm:ref-sync`) e reprojetar os bloqueios para o mapa de motivos chegar à base; sem isso, todo bloqueio real segue "não classificado".
