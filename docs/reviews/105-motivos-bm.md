---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-motivos-bm
commit: 89e421e46a0ff9fb9014ce21c755db8adbfd0a54
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: motivos de bloqueio do BusinessMap (E7.229, revalidação E7.250)

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
- **A8 (hash da base mock) é do QA** (histórico 12:22 e 13:14: o QA regrava o hash na E7.251). Segue aberto nesta cabeça: `node e2e/scripts/hash-base-mock.mjs --comparar docs/qa/evidencias/hash-base-fase-a.json` → `FALHOU: difere em hashBase, hashBusinessMap (antes: b6a3c384, 8d47d431; agora: 88a5c095, 08e2b5e2)`, e o passo "Gate (fronteiras BM x AC, hash da base mock, tamanho)" do job `build` do run `43904757225` falhou. O código está correto (a base mock muda pelos motivos, como já registrado); falta só a referência. Não bloqueia este parecer de código, bloqueia o merge até o QA regravar e o CI ficar verde.
- **Decisão do arquiteto versionada** (`docs/architecture/decisoes/105-motivos-bm-contrato.md`, E7.231): a condição dela (os três textos) está cumprida por A1 a A3. Ratifico como tech-lead, completando o "falta o `tech-lead`" do cabeçalho: aprovação sem `/api/v2`, convivência zero, critério de reversão presente.
- **Sem PR nesta volta:** a suíte inteira fica para o CI do PR; não afirmo CI verde (o run do push ainda tinha `testes` em andamento e `build` vermelho pelo A8). PQ do autor da volta 2: não há linha de pronto verde para `89e421e4` no histórico do pedido; o Jarvis confere o PQ da E7.232.

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
- A8 (bloqueante) docs/qa/evidencias/hash-base-fase-a.json:1 · pendente: com o QA (E7.251); a referência do hash ainda é a antiga e o gate do job `build` falha. Bloqueia o merge, não o código.
- A9 (bloqueante) server/tests/dominio-businessmap.pg.test.ts:66 · resolvido em 6eb8560a: 381; job `banco` verde no run 43904757225.

## Riscos e pendências
- Merge depende do A8 (QA regrava o hash) e do CI verde do PR.
- T10 real ainda não usa `MOTIVOS_FORNECEDOR`: entra pelo PR 487. Até lá, o T10 com dado real segue o critério antigo (fornecedor informado) e a marca da versão de critério já aparece nele.
- T12: pergunta ao dono (qual motivo é ida e volta) segue aberta; até a resposta, o critério (a) não conta nada.
- Depois do merge, recarregar o domínio (`pnpm --filter server bm:ref-sync`) e reprojetar os bloqueios; sem isso, todo bloqueio real segue "não classificado".
- O PR leva `teto: excedido` (ver acima) e o hash do aceite de cada contrato (O2, BLOQUEADOS, O19), como pede a observação do arquiteto.
