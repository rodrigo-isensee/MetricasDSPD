---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-motivos-bm
commit: 95050bda55b746b3f1095a1e6bebd2a54037585e
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: motivos de bloqueio do BusinessMap (E7.229, revalidação E7.250, E7.257)

## Revalidação (E7.257, merge da develop, cabeça 95050bda)
- **Delta lido:** `forge-check parecer delta docs/reviews/105-motivos-bm.md`, intervalo `89e421e4..95050bda`, 26 arquivos no domínio (CHANGELOG, `openapi.json`, `businessmap-dominio.json`, contratos, mock, métricas, servidor e web). Quase tudo é a develop (`57989aa0`, PR 493 e anteriores) entrando por merge automático; o patch próprio do merge, lido por `git show --remerge-diff 95050bda`, está em 14 arquivos (13 com conflito e `server/tests/dominio-businessmap.test.ts`).
- **Nada se perdeu.** Conferido por arquivo contra os dois pais (`13459f9e` motivos, `57989aa0` develop, base comum `0c989148`): todo arquivo tocado só pela branch é idêntico ao da ponta dos motivos; todo arquivo tocado só pela develop é idêntico ao da develop, exceto `dominio-businessmap.test.ts`, que só ganhou o ajuste à união (afeta com 8 métricas e os 11 códigos de `motivo_bloqueio`).
- **`businessmap-dominio.json` (união):** campos 48 e 49 com `value_id` e a `tamanho_regua` (63) da develop; `motivo_bloqueio` com os 11 motivos (ids 1 a 3, 6, 7 e 9 a 14); `regra` com o texto dos 11 motivos e o trecho `tamanho_regua` da develop; uma versão de critério com `afeta` O8, O14, O17, BLOQUEADOS, O2, O19, T10 e T12, descrição e motivo citando E7.102, E7.203 e E7.184. A mudança de formato da lista `motivo_bloqueio` (um objeto por linha) é só de formatação.
- **`comum.ts`:** `TAMANHOS_REGUA` da develop e `MOTIVOS_BLOQUEIO` com os 11 da branch, o comentário de cada um no seu lugar.
- **Teste pg (`dominio-businessmap.pg.test.ts`):** a versão da develop (dois campos, 38 linhas de campo, régua) somando os 11 motivos: 458 + 11 = 469; métricas da versão registrada com as 8. `CHANGELOG.md`: as três linhas (motivos, value_id, O22) presentes.
- **Hashes do mock:** os dois lados regravavam a mesma base; o merge dá base `61a511eb`, escala 0,2 `e8035bf0`, BusinessMap sem passos `858acf56`, aplicados de forma igual em `mock.test`, `coletas.test`, `complementares.test`, `extensaoTambem.test`, `pesquisa.test` (a chamada `gerarPesquisaMock` segue no teste), `tambem.test` e `nucleoMock.paridade.test`; `hashAcelerato` 797abc95 intacto; referência e nota em `docs/qa/evidencias/` com a linha da regravação do merge.
- **Teste rodado:** `server/tests/dominio-businessmap.test.ts` e `dominio-motivo-bloqueio.test.ts` na cabeça: 104 passaram. A suíte inteira fica com o CI do PR 496 no head `95050bda` (citado abaixo, não rerrodado).
- **Develop seguinte:** a develop avançou um commit (E5 e extensão, `packages/metricas/src/businessmap/{comum,e5,t9}.ts`), sem arquivo em comum com o patch dos motivos; entra só no merge (`R-FLUXO`).

## Revalidação (E7.250, volta 2, cabeça 89e421e4)
- **Delta lido:** `forge-check parecer delta docs/reviews/105-motivos-bm.md`, intervalo `e0fb925f..89e421e4`, 8 arquivos no domínio: `CHANGELOG.md`, `docs/architecture/decisoes/105-motivos-bm-contrato.md`, `docs/architecture/fontes/businessmap-dominio.json`, `docs/briefing-execucao-metricas.md`, `packages/metricas/src/businessmap/t12.test.ts`, `packages/metricas/src/businessmap/t12.ts`, `packages/metricas/src/core/criterios.ts`, `server/tests/dominio-businessmap.pg.test.ts`. Só o delta foi relido.
- **A1 resolvido:** `criterios.ts:142` diz 11 motivos, ids 1 a 3, 6, 7 e 9 a 14, fornecedor "Aguardando fornecedor" e "Dependência Externa".
- **A2 resolvido:** nota datada em `briefing-execucao-metricas.md:137` com o mesmo texto.
- **A3 resolvido:** `CHANGELOG.md:9` alinhado.
- **A4 resolvido:** `regra` de `businessmap-dominio.json` diz "um dos 11 motivos".
- **A5 resolvido:** comentário de `t12.ts:9` diz 11.
- **A6 resolvido:** `MOTIVOS_IDA_E_VOLTA` é `ReadonlySet` vazio; `teveIdaEVolta` e `calcularT12` recebem `motivos` por parâmetro com o padrão vazio, e `calcular.ts:63` segue chamando sem o terceiro argumento (produção usa o vazio). O teste "E7.184" chama `calcularT12Base` sem parâmetro e prova o padrão. Mutante rodado: `motivos.has(b.motivo)` trocado por `MOTIVOS_IDA_E_VOLTA.has(b.motivo)` em `t12.ts:28` derruba 5 testes (CA-39 (a) duas vezes, n >= 20 e o do mock): morto. Fonte restaurada, árvore limpa. `t12.test.ts` na cabeça: 15 passaram.
- **A7 resolvido:** imports no topo; sem `beforeAll`/`afterAll` mutando estado global.
- **A9 resolvido:** `dominio-businessmap.pg.test.ts:66` espera 381; no CI do push em `89e421e4` (run `43904757225`) o job `banco` passou.
- **A8 (hash da base mock), do QA, resolvido em `3c83af10` (E7.251).** Em `89e421e4` o gate falhava (`FALHOU: difere em hashBase, hashBusinessMap (antes: b6a3c384, 8d47d431; agora: 88a5c095, 08e2b5e2)`; passo "Gate (fronteiras BM x AC, hash da base mock, tamanho)" do job `build` do run `43904757225` vermelho). Com a referência regravada pelo QA: `node e2e/scripts/hash-base-mock.mjs --comparar docs/qa/evidencias/hash-base-fase-a.json` → `OK: base mock idêntica à linha de base.`
- **Decisão do arquiteto versionada** (`docs/architecture/decisoes/105-motivos-bm-contrato.md`, E7.231): a condição dela (os três textos) está cumprida por A1 a A3. Ratifico como tech-lead, completando o "falta o `tech-lead`" do cabeçalho: aprovação sem `/api/v2`, convivência zero, critério de reversão presente.

## O que foi conferido (primeira passada, e0fb925f)
- Diff `0c989148...e0fb925f`, 2 commits (`fa1e83e6` E7.184, `e0fb925f` E7.210), 46 arquivos. Código e teste em `packages/`, `server/`, `web/` e `e2e/`: 407 linhas, acima da orientação de 150 (M14). É um comportamento só (o domínio fechado de motivos troca de lista) que se espalha por fixtures e testes que citavam os 7 textos antigos; o PR precisa levar `teto: excedido, 407 linhas, troca do domínio de motivos arrasta fixtures e testes que citavam os 7 do briefing`.
- **Decisão B do dono (2026-11-16 09:13) e catálogo.** `MOTIVOS_BLOQUEIO` (`packages/contratos/src/comum.ts:99`) tem os 11 rótulos do catálogo, texto exato; `motivo_bloqueio` em `businessmap-dominio.json` mapeia os ids 1 a 3, 6, 7 e 9 a 14 aos mesmos rótulos, sem 5 e 8. Id sem entrada ou nulo segue "não classificado". Teste `server/tests/dominio-motivo-bloqueio.test.ts`: 14 passaram.
- **Decisão das 09:29 (T10).** `MOTIVOS_FORNECEDOR` = 14 Aguardando fornecedor e 11 Dependência Externa, com `satisfies readonly MotivoBloqueio[]`. Neste diff ela só alimenta o mock; a ligação do T10 real aos dois motivos é do PR 487 (Riscos).
- **T12 sem inferência.** `MOTIVOS_IDA_E_VOLTA` nasce vazio: o critério (a) não conta nada e só o (b) vale, até o dono apontar o motivo (pergunta aberta registrada às 10:29).
- **Mock.** Sorteio de motivo em fluxos derivados próprios; `rngBlq` consome o mesmo número de sorteios, então volume e datas dos bloqueios não mudam.
- **Versão de critério (T2.6).** `VERSAO_CRITERIO_MOTIVOS_BLOQUEIO_BM` em `VERSOES_DA_BIBLIOTECA` com `afeta` BLOQUEADOS, O2, O19, T10 e T12.
- **Regras invioláveis.** Sem pessoa; motivo é domínio fechado. BusinessMap e Acelerato não se misturam (o "Aguardando fornecedor" do Acelerato é outro domínio, não tocado). Cálculo na biblioteca compartilhada.
- **Incompatibilidade de contrato: ratificada** (politica-de-mudanca §2 e §5, junto do arquiteto): consumidor único (`web` do mesmo repositório), fotografias novas e `aceitas.json` vazio.
- Commits: Conventional Commits em português, um por etapa, com cartão.

## Achados
- A1 (bloqueante) packages/metricas/src/core/criterios.ts:142 · resolvido em 6eb8560a: descrição com 11 motivos, ids 9 a 14 e os dois de fornecedor.
- A2 (bloqueante) docs/briefing-execucao-metricas.md:137 · resolvido em 6eb8560a.
- A3 (recomendado) CHANGELOG.md:9 · resolvido em 6eb8560a.
- A4 (recomendado) docs/architecture/fontes/businessmap-dominio.json:12 · resolvido em 6eb8560a.
- A5 (recomendado) packages/metricas/src/businessmap/t12.ts:9 · resolvido em 6eb8560a.
- A6 (recomendado) packages/metricas/src/businessmap/t12.ts:12 · resolvido em 6eb8560a: `ReadonlySet` e motivo de teste por parâmetro; mutante morto.
- A7 (recomendado) packages/metricas/src/businessmap/t12.test.ts:1 · resolvido em 6eb8560a/89e421e4.
- A8 (bloqueante) docs/qa/evidencias/hash-base-fase-a.json:1 · resolvido pelo QA em 3c83af10 (E7.251): comparação local OK.
- A9 (bloqueante) server/tests/dominio-businessmap.pg.test.ts:66 · resolvido em 6eb8560a: 381; no merge da develop (95050bda) passa a 469 pela união com os campos 48 e 49 e a régua.

## Riscos e pendências
- CI do PR 496 no head `95050bda`: verde (runs `43909714343` e `43909728275`; `testes`, `banco`, `e2e-parte` 1/2 e 2/2, `build`, `seguranca`, `openapi` passaram; `perf` pulado).
- T10 real ainda não usa `MOTIVOS_FORNECEDOR`: entra pelo PR 487. Até lá, o T10 com dado real segue o critério antigo (fornecedor informado) e a marca da versão de critério já aparece nele.
- T12: pergunta ao dono (qual motivo é ida e volta) segue aberta; até a resposta, o critério (a) não conta nada.
- Depois do merge, recarregar o domínio (`pnpm --filter server bm:ref-sync`) e reprojetar os bloqueios; sem isso, todo bloqueio real segue "não classificado". O mesmo `bm:ref-sync` grava a versão única (O8, O14, O17 e os bloqueios).
- O PR leva `teto: excedido` (ver acima) e o hash do aceite de cada contrato (O2, BLOQUEADOS, O19), como pede a observação do arquiteto.
