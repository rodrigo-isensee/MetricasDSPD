---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f4-projetor
commit: ac47bf16c9443bae8cb20cd8f39f3a3a72478c7f
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-01
---
# Review: 052-integracao-businessmap (F4 do plano 052, normalizador e projetor, T2.4, K-182)

**Veredito (E2.62, renovação por delta): aprovado** em `ac47bf1`. O A2 fecha pela decisão do dono de 2026-11-01 06:33 ("A": um PR só da `feature/052-f4-projetor`, com exceção à M14 registrada no PR). O delta desde `7a1907a` traz só teste do QA e pareceres, sem código de produção, e nenhum achado novo.

## Renovação E2.62 (`7a1907a..ac47bf1`)

**Delta lido.** Rodei `forge-check delta --parecer docs/reviews/052-f4-projetor.md`. Ele lista um arquivo de código ou teste: `server/tests/projetor-businessmap-qa.pg.test.ts`, linhas 1 a 168 (arquivo novo do QA, `4f54b8a`). Li o arquivo inteiro. O resto do intervalo é documento: o parecer e o roteiro do QA da F4 (`e7651a2`), a renovação de segurança da F4 (`5ec6a4b`), a do QA da WS1 (`ac47bf1`) e a minha revalidação anterior (`e1e5f86`).

**Já lido.** Todo o código de produção e os testes do autor (`dd15c93..7a1907a`), sem mudança desde a E2.64.

**O teste do QA.** Seis casos contra PostgreSQL em schemas próprios do arquivo (`prefixoDeTeste`), com `afterAll` que derruba os schemas e fecha os pools. Cobre datas com e sem fuso (A5), ordem de gravação diferente da ordem do tempo (H-9 e H-10), "Descartado" sem `concluido_em` (H-11), campos de pessoa e texto livre fora de toda tabela (ADR 0020, com mínimo de tabelas afirmado), reconstrução dupla sem fato nem versão nova (DT-1) e GRANT do `dspd_api`. O SQL interpolado usa só o nome do schema de teste; os valores vão por parâmetro. Ids inventados, nenhum dado real. Sem defeito.

**Achados anteriores:**
- **A2 resolvido** pela decisão do dono (forma do PR da F4, "A"). O corpo do PR leva a linha de exceção com o número recontado abaixo, aceita por mim.
- A3 e A4 seguem com o software-architect na F6 (E2.67). A7 segue como pergunta ao dono; o QA o registrou como dependente da resposta. A8 segue como recomendação.

**Outros pareceres, citados e não refeitos.** Segurança da F4 aprovada em `e7651a2` (`docs/security/052-f4-projetor.md`, E2.79). QA da F4 aprovado em `4f54b8a` (`docs/qa/052-f4-projetor.md`): `test:pg` com 23 arquivos e 153 testes, rc=0; unitária do server com 1038 testes. O `praticas.md` continua sem regra "decidida por: `<comando>`".

**Teto recontado (decisão M14).** `git diff --numstat --no-renames origin/develop...HEAD` (base `dd15c93`, develop em `d73f5fc`), sem `.md`: **2062 linhas** (2042 a mais e 20 a menos), 168 delas do teste do QA. O PR leva `teto: excedido, 2062 linhas, F4 do plano 052 (normalizador e projetor) mais A3 e A6 do review da F3, um PR só por decisão do dono de 2026-11-01`.

## Revalidação E2.64 (volta E2.63, `89a50c9..7a1907a`): reprovado só pelo A2

Texto do veredito daquela rodada: **reprovado** em `7a1907a`, só pelo A2. A volta E2.63 resolve o A1, o A5 e o A6, e não traz achado novo de código. O A2 (três comportamentos num PR, decisão M14) não depende de código: segue aberto até o dono decidir. Se o dono aceitar a exceção, o parecer vira aprovado sem nova leitura de código. Se ele mandar separar, o A3 e o A6 da F3 saem desta branch e o delta da separação é revalidado.

## Revalidação E2.64 (volta E2.63, `89a50c9..7a1907a`)

**Delta lido.** Rodei `forge-check delta --parecer docs/reviews/052-f4-projetor.md`. Ele lista 4 arquivos, 74 linhas a mais e 24 a menos, num commit só (`7a1907a`):
- `server/src/modulos/businessmap/normalizador.ts`: linhas 24, 162 e 174 e 175;
- `server/tests/normalizador-businessmap.test.ts`: +46 -12;
- `server/tests/projetor-businessmap.pg.test.ts`: +18 -9;
- `server/tests/times-sem-comparacao.test.ts`: +6.

Li o delta inteiro. Para entender o contexto, li também `normalizador.ts:140-213` (o cálculo de `dentro` e o retorno de `dim`) e as constantes exportadas da `0019` e o `ENUM situacao` da `0018`.

**Já lido.** O resto da branch (`dd15c93..89a50c9`) não mudou desde o review da E2.59. Vale a leitura registrada no Histórico abaixo.

**Achados anteriores:**
- **A1 resolvido.** `normalizador.ts:175` agora exige equipe só no nível `story` e mantém fora quem tem `situacao = 'fora'` (H-7, os dois motivos da `0019`). Frente e projeto sem time recebem a granularidade, com equipe nula. A conferência com a `0019` bate: os workflows do quadro 35 e os de iniciativa não têm linha em `ref_time_workflow`, só 215 e 216 têm, como `fora`. Story sem time continua fora. Os testes cobrem:
  - frente, projeto e story sem time;
  - frente em workflow `fora`;
  - projeto no PostgreSQL (`projetor-businessmap.pg.test.ts:184`).

  A frente sem time só tem caso unitário, e isso basta, porque o caminho é o mesmo.
- **A5 resolvido.** Em `normalizador.ts:24`, o `Z` vale `+00:00` e a constante `FUSO_PADRAO_BM` só vale para data sem fuso. Como a constante hoje também é `+00:00`, o teste de comportamento sozinho não distingue os dois casos. Por isso o autor afirma também sobre o texto da fonte, no mesmo padrão do guard de times. Aceito.
- **A6 resolvido.** Em `normalizador.ts:162`, a categoria do tipo usa o dia do evento medido (U-2), como já faziam o nível e a equipe. O teste novo cobre a troca de categoria entre a criação e a entrega. O pai (linha 185) continua no dia da criação: ali só se decide se o pai é Sprint, e isso não é medida do card. Fica como está.

**Fora dos achados:**
- **A2 da segurança.** O guard novo (`times-sem-comparacao.test.ts:20`) varre o normalizador sem agrupar, contar nem ordenar por time. Hoje ele passa, porque o único `.sort` do arquivo ordena ids de pai. Quem renova esse ponto é a segurança (E2.65). Cito e não refaço.
- **Fixtures pela 0019.** Os nomes de time e o workflow `fora` dos testes vêm de `TIMES_PROPRIOS` e de `FORA_DE_TODO_CALCULO`, e o import da migração não tem efeito colateral (só monta `up` e `down`). Achado novo A8: um comentário ficou desatualizado.

**Execuções** (prioridade baixa, uma suíte por vez):
- `vitest run` nos 3 arquivos sem PG do delta (normalizador, `times-sem-comparacao`, projetor): 35 testes, todos passaram.

O `pronto` (rc=0) e o `test:pg` (22 arquivos, 147 testes) ficam com o relatório do autor (E2.63) e com o QA (E2.61). Cito e não refaço. O `praticas.md` continua sem regra "decidida por: `<comando>`".

**Teto recontado (decisão M14).** `git diff --numstat --no-renames dd15c93...7a1907a`, sem `.md`, dá **1894 linhas** (1874 a mais e 20 a menos). A exceção aceita para a projeção da F4 continua de pé. O PR da E2.62 leva `teto: excedido, 1894 linhas, F4 do plano 052: normalizador e projetor do staging para fatos e dimensões, com marcos pela biblioteca`, ou o número recontado na hora, se o A2 tirar o A3 e o A6 da F3 da branch.

**Destino dos achados que não mudam aqui:**
- A2: pergunta ao dono (PERGUNTA de 2026-10-31 21:22).
- A3 e A4: software-architect, antes da F6 (decisões de 21:23 e 21:29).
- A7: pergunta ao dono.

## Histórico: review da E2.59 (em `783612d`, reprovado: A1 e A2)

**Escopo lido.** Delta `dd15c93..783612d`, 3 commits (`369d018`, `50b8b51` e `783612d`): 23 arquivos, 1836 linhas a mais e 20 a menos. Li o delta inteiro e a seção F4 do plano (linhas 172 a 178), mais as decisões H-1, H-23 e §10. Para conferir contra o que já existe, li também:
- `0005`, `0006`, `0018` e `0019`;
- `responsaveis.ts` e `descartado.ts`;
- `metricas/repositorio.ts` e `mapa.ts`;
- `contratos/src/comum.ts`.

**Execuções.** 96 testes do server e 10 de `marcos.test.ts`, todos passaram; `docs:check` ok.

**Segurança.** Parecer em `9418d4c` e `88983e0`, aprovado. Cito e não refaço.

**Conferência.** O que conferiu na E2.59:
- `derivarMarcos` e `direcaoDaTransicao` puros na biblioteca T2.5, com H-9, H-10, H-11, H-23 e 4.1;
- idempotência por `ON CONFLICT` e versão só com mudança;
- reconstrução que só limpa `dim_card` e preserva `dim_responsavel` (DT-1);
- I-2;
- A3 e A6 da F3 corretos (CT-B do QA idêntico ao arquivo dele);
- suposições do autor aceitas, menos `dim_card.tipo` (A3);
- documentação de `data-model.md` e `server.md` em dia;
- regras invioláveis: só `dspd_bm`, nada por pessoa ou por time, fatos e versões só com INSERT.

**Teto.** 1844 linhas, exceção aceita só para a projeção.

## Achados

- A1 (bloqueante) server/src/modulos/businessmap/normalizador.ts:174 · granularidade só sai com equipe; a 0019 não dá time a workflow de iniciativa nem do quadro 35, e frente e projeto ficam nulos (H-1). Resolvido em 7a1907a (normalizador.ts:175), com testes.
- A2 (bloqueante) server/src/modulos/businessmap/coleta.ts:203 · o PR leva três comportamentos: projeção da F4, A3 (transição inválida não torna parcial, com o CT-B) e A6 (coleta-comando.ts:77). Pela M14, um por PR. Resolvido: o dono aceitou um PR só, com a exceção no PR (2026-11-01 06:33).
- A3 (recomendado) server/src/modulos/businessmap/normalizador.ts:196 · dim_card.tipo recebe código (bug_interno, produto), mas mapa.ts:40 converte para TipoCard (rótulos), e produto não tem rótulo: O7, O13 e o filtro por tipo vazios com dado real. Destino: software-architect antes da F6.
- A4 (recomendado) server/src/modulos/businessmap/projetor.ts:151 · fato_transicao.tipo_coluna fica congelado (DO NOTHING, reconstruir só limpa dim_card) e a API o lê (repositorio.ts:64): correção U-1 não chega ao WIP nem ao CFD. Destino: software-architect (DT-1 e F5).
- A5 (recomendado) server/src/modulos/businessmap/normalizador.ts:24 · o `Z` explícito virava FUSO_PADRAO_BM. Resolvido em 7a1907a: `Z` vale +00:00 e a constante só vale sem fuso, com teste.
- A6 (recomendado) server/src/modulos/businessmap/normalizador.ts:162 · a categoria do tipo usava o dia da criação, e nível e equipe o dia do evento (U-2). Resolvido em 7a1907a: mesmo dia do evento, com teste.
- A7 (recomendado) packages/metricas/src/businessmap/marcos.ts:50 · card que foi da seção 3 para a 2 fica com compromisso depois do início (marcos.test.ts:69); a H-23 não cobre e foi resolvido por inferência. Destino: pergunta ao dono.
- A8 (recomendado) server/tests/normalizador-businessmap.test.ts:11 · o comentário diz "Ids e nomes inventados; nenhum dado real", mas os nomes de time e o workflow fora agora vêm da 0019. Ajuste o texto na próxima mexida no arquivo; não devolve.
