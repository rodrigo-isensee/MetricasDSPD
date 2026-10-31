---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f2-referencia
commit: da4919acc3e469e61b2922ef1e3ae993234c20c3
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-31
---
# Review: 052-integracao-businessmap (E2.34, F2 do coletor do BusinessMap, referência real do quadro, K-182)

**Veredito: aprovado** em `da4919a` (renovação da E2.43, abaixo). O A1 bloqueante, o A3 e o A5 foram resolvidos na volta da E2.37, e o bug 052-F2-001 do QA, na volta 2 (E2.40). Os recomendados A2, A4, A6 e A7 continuam, já destinados pela decisão técnica do Jarvis.

Veredito anterior: reprovado em `5a75265` (E2.34), pelo A1.

## Renovação por delta (E2.43, volta 2, `da4919a`)

`forge-check delta --parecer docs/reviews/052-f2-referencia.md` deu o intervalo `75ee953..55adf52` e listou só dois trechos de código, que li:
- `referencia.ts:291`, uma linha trocada;
- `server/tests/referencia-businessmap.pg.test.ts`, arquivo novo do QA (E2.35), 370 linhas, inteiro.

Os demais commits do intervalo (`bd4af7f`, `55adf52`) são só pareceres de segurança e de QA, que cito e não refaço. Já lido e fora do delta: o resto do parecer, em `75ee953`.

- **Correção do 052-F2-001 (`referencia.ts:291`).** O `SELECT $1, $2 WHERE NOT EXISTS (... versao_id = $1 AND metrica_id = $2)` dava tipos inconsistentes ao PostgreSQL para o mesmo parâmetro. Agora o SELECT tem `$1::bigint` e `$2::varchar`, e o `WHERE NOT EXISTS` fica como estava. Os tipos batem com `versao_id` e `metrica_id` que o INSERT recebe. O comportamento, a idempotência e os valores gravados não mudam, e não há SQL nova, escrita nova nem leitura de pessoa. A causa estava fora do alcance do dublê, e o `.pg` a provou, como o review da volta 1 pedia ("Testes do gravador contra PostgreSQL").
- **Testes `.pg` do QA (CT-1 a CT-11).** Lidos por inteiro. Cobrem os 7 pontos que o review pediu ao QA:
  - carga nas 4 tabelas com o papel `dspd_ref` (CT-1) e CHECKs (CT-2);
  - grant de UPDATE só em `vigente_ate` e gatilho `55000` (CT-3), e o coletor sem escrita (CT-4);
  - mudança de processo com as 12 métricas e `EI_FL1`, e a segunda execução sem duplicar (CT-5, que é o caso do bug);
  - correção sem marca (CT-6) e `ErroReferencia` de vigência com a data em texto, nunca a PK (CT-7);
  - `registrarFolhasSemConferencia` pelo coletor (CT-8), os contadores da volta 1 (CT-9), rollback por erro real do banco (CT-10) e o rótulo "Nome (id)" por `lerColunas` e `montarBaseBM` (CT-11).
  O quadro 9025 é de teste, a transação é desfeita no fim e o `skipIf(!url)` mantém o teste fora do `pronto` sem banco. Ressalva: o `pronto` não roda `.pg` (melhoria já registrada pelo Jarvis); o verde do `.pg` com banco é do QA (parecer `55adf52`) e do relatório da E2.40 (117 de 117), que cito sem refazer.
- **Efeito no número do PR.** O teste `.pg` conta como teste do projeto: `git diff --numstat --no-renames 64644b1..da4919a`, só `server/src` e `server/tests`, dá **1313 linhas** (943 do parecer anterior mais 370 do `.pg`). O comportamento é o mesmo (a referência do quadro por id) e o teste é prova dele, então a exceção continua aceita. A linha do PR da E2.36 passa a ser `teto: excedido, 1313 linhas, F2 do plano 052: referência do quadro por id (carga com vigência, papel único por folha, consumo em mapa.ts e testes contra PostgreSQL)`.
- **Segurança e QA.** Pareceres próprios (`docs/security/052-f2-referencia.md`, `docs/qa/052-f2-referencia.md`), citados e não refeitos.

Conclusão: aprovado em `da4919a`; nenhum achado novo, e os recomendados A2, A4, A6 e A7 seguem como estão.

## Revalidação por delta (E2.39, volta 1, `75ee953`)

`forge-check delta --parecer docs/reviews/052-f2-referencia.md` deu o intervalo `5a75265..a64695a`. Os trechos listados foram estes:
- `referencia.ts` nas linhas 189-192, 194, 216-217, 222-225, 250, 272, 336 e 388;
- `referencia-businessmap.test.ts` nas linhas 155, 158-163 e 415-473.

O commit `a64695a` é só o parecer de segurança. Li só esse delta, que é `0db2de1..75ee953` no código. O resto do parecer, abaixo, fica como "já lido" em `5a75265`. Rodei `vitest run` de `referencia-businessmap.test.ts`, `conferencia.test.ts` e `metricas.mapa.test.ts`: 3 arquivos, 40 testes, todos passaram (antes eram 37, e os 3 novos são os da volta).

- **A1, resolvido.** Em `referencia.ts:388`, o compromisso agora é a união das folhas `compromisso` com as folhas `trabalho` e `homologacao` da seção 3. Isso dá a mesma forma da entrega, por card. A folha `trabalho` da seção 4 (as exceções de publicação) fica fora, porque o filtro pede a seção 3. O comentário foi ajustado. O teste da `:155` prova a regra no workflow 191, que tem seção 2:
  - o marco é `['2531', '2533']`;
  - o trajeto 2530 → 2533 tem o marco em 2533;
  - o trajeto 2530 → 2531 → 2533 tem o marco em 2531;
  - o 192 e o caso só com a seção 3 continuam iguais.
- **A3, resolvido.** O `Plano` e o `Resultado` ganharam `ausentes` por tabela (coluna, workflow e tipo). A conta é: chave vigente que não está entre as desejadas. A vigência não é fechada, e por isso fechar ou não continua decisão do arquiteto, sem inferência. O teste de `:416` remove a coluna 2530, o tipo 5 e os workflows 192 e 193 e confere a contagem `{1, 2, 1}`. Ele também confere que não há operação de fechar nem UPDATE com 2530.
- **A5, resolvido.** `folhasSemPapel` conta as folhas que não são descarte e têm `papel` nulo, no `Plano` e no `Resultado`. O teste de `:433` confere 0 na base, que tem a coluna Descartado, e 1 com uma folha de seção 9.
- **A1 da segurança.** Há um teste negativo de `:446` com os campos `owner_user_id`, `email`, `realname` e `username` marcados no quadro, nas colunas, nos workflows e nos tipos. Ele confere que nada disso chega ao texto nem aos valores das escritas, nem à mensagem de erro da mudança sem motivo. A segurança revalidou em `a64695a` (aprovado), e eu só cito.
- **Fora dos achados.** O delta não traz SQL nova, escrita nova nem leitura de pessoa. BusinessMap e Acelerato continuam separados.

Teto recontado: `git diff --numstat --no-renames 64644b1..75ee953`, só código e teste, dá **943 linhas**, o mesmo número que o autor relatou:
- `referencia.ts`: 390;
- o teste: 473;
- `spike-lista.ts`: 45;
- `mapa.ts`: 24;
- `conferencia.ts`: 5;
- `index.ts`: 4;
- `conferencia.test.ts`: 2.

O comportamento continua um só. O PR da E2.36 leva a linha `teto: excedido, 943 linhas, F2 do plano 052: referência do quadro por id (carga com vigência, papel único por folha e consumo em mapa.ts)`.

## Escopo e o que foi lido

Delta: `64644b1..5a75265`, 2 commits (`07422d4` e `5a75265`), 8 arquivos, 861 linhas a mais e 18 a menos. Li o delta inteiro e, no plano da worktree 052e, a seção F2 (linhas 142 a 154), o §10 e o §11. Para conferir o que o código grava, li também as migrações `0007_bm_referencia.ts` e `0018_bm_referencia_workflow_tipo_times.ts`, o interpretador de tipos de `pool.ts` (date volta como texto `AAAA-MM-DD`) e `lerColunas` em `repositorio.ts` (só a vigência aberta).

Não li o `.env` nem a saída bruta da E2.28, e não chamei o BusinessMap. A única execução foi `vitest run` de `referencia-businessmap.test.ts`, `conferencia.test.ts` e `metricas.mapa.test.ts`: 3 arquivos, 37 testes, todos passaram. O verde do `pnpm run pronto` fica com o QA (E2.35). O `praticas.md` não tem regra com "decidida por: `<comando>`", então não há saída de ferramenta a citar e nada vira pendência por isso.

A segurança deu parecer em `cf902ff` (`docs/security/052-f2-referencia.md`, aprovado, recomendados A1 e A2). Este review cita esse parecer e não o refaz. Decisão do tech-lead sobre o A1 da segurança (teste negativo de pessoa): entra na volta deste review, já que a volta existe, sem bloquear. O A2 da segurança (transação e papel no chamador) fica para o comando da F3, e eu confiro no plano da F3.

## Conferência contra o plano e as decisões

- **Função única de papel por folha** (`spike-lista.ts:72`, `papelDaFolha`). A lista da F1 e a carga da F2 usam a mesma função. A ordem é descarte (pelo nome ou pelo arquivo, H-11), depois a exceção de trabalho e depois a seção. O tipo vem da exceção H-8 ou do `flow_type`. A lista da F1 manteve a saída anterior: o teste antigo da F1 continua verde, e há teste novo para a marca de trabalho. Confere.
- **H-1, H-2 e H-17.** `nivelDoWorkflow` usa o quadro 35 como projeto, `type` 1 como feature, `type` 0 como story e `type` 2 como "nenhum". O `type` desconhecido sai e é contado (`workflowsIgnorados`), sem inferência. Sprint fica sem item e sem categoria, o que respeita a CHECK `eh_item = (categoria IS NOT NULL)`. Tipo fora do mapa recebe o padrão. Os testes cobrem os três casos. Confere.
- **H-8 a H-12 e H-26.** Seção e `flow_type` restritos aos valores das CHECKs. A filha sem seção usa a seção da mãe. Descartado da seção 4 fica com `papel = NULL` e `eh_descarte = true`, sem entrega. Homologação vem pela função da F1. Confere.
- **Limite 0 como NULL** (`referencia.ts:140`). A H-12 diz que 0 é "sem limite". Gravar NULL faz o O1 mostrar o WIP sem limite e nunca comparar com 0. Limite negativo também vira NULL, e o teto é 32767, que cabe no `smallint`. A mudança de limite é processo automático e marca só o O1. Confere.
- **Vigência e motivo obrigatório (U-1).** A mudança de significado sem `motivo` não grava nada (`ErroReferencia('motivo')`), então processo ou correção é decisão de quem opera. Processo abre versão de critério com as 12 métricas, e mudança só de limite marca só o O1. Correção não marca. A troca de rótulo na `ref_coluna` vai como correção. Uma segunda mudança no mesmo dia é recusada antes da PK `(chave, vigente_de)`. A escrita é só INSERT de vigência nova e UPDATE de `vigente_ate`, como o gatilho `proibir_alteracao_vigencia` exige, então o histórico nunca é sobrescrito. A versão de partida é única por `referencia` (idempotente). Confere, com o A2 e o A3.
  - Leitura de `vigenteEm`: a correção vale desde o início da versão que ela corrige. Logo, depois de uma mudança de processo, ela corrige só o período desse processo. É coerente com a U-1 ("como foi" mais a correção do erro de mapeamento). Registro aqui como leitura, não como achado.
- **U-2** (`contextoDoEvento`). A coluna dá o workflow no dia, e o workflow dá o nível e o time no dia. Teste com um card que muda de workflow e com um time que muda de definição. Confere.
- **Pergunta 2 da lista de colunas (2026-10-31).** O campo novo `excecoes_papel_trabalho` tem esquema próprio: `papel` literal `trabalho`, `nome` opcional, coluna única e `.default([])`. Ele fica separado de `excecoes_papel_coluna`, cujo `papel` guarda fila ou execução. Separar evita misturar papel e tipo num campo só, e por isso é a forma certa. Na carga, a folha listada vira `trabalho` com o tipo do `flow_type`, e a entrega passa para a folha seguinte da seção 4. A lista da F1 não marca mais essa folha como candidata de marco, e a H-23 não conta uma folha `trabalho` da seção 4 como "folha da seção 4". `excecoesSemColuna` também cobre o campo novo. As perguntas 1 e 3 não geram exceção, como diz a nota do arquivo. Confere, com o A4.
- **`mapa.ts` por id com o rótulo "Nome (id)"** (`mapa.ts:29-33` e `:73-80`). A chave segue `quadro|coluna_id`. O rótulo é o nome quando ele é único no quadro e "Nome (id)" quando ele se repete. `nomesDeColuna`, que serve para transições, cards e bloqueios, e `colunasDe`, que serve para a dimensão, recebem a mesma lista (`montarBaseBM`) e por isso dão o mesmo rótulo. Duas colunas nunca se fundem, e sem repetição nada muda nos dados de exemplo. **Efeito nos cartões:** no quadro real (78 workflows em 7 quadros), "Backlog", "Concluído" e "Descartado" se repetem muito. A legenda do CFD, os blocos por coluna do O2, o envelhecimento por coluna e o arquivo exportado vão mostrar "Backlog (2530)". Isso é correto para a métrica, mas é mudança visível (A7). A contagem inclui as colunas mãe, que podem dar id a uma folha sem necessidade. O efeito é só no rótulo.
- **ADR 0020, 0022 e 0015.** Nenhuma pessoa é lida ou gravada (só ids e nomes de coluna, workflow e tipo). Só há GET por `lerReferenciaReal`, pelo cliente da F0, sem cards nem usuários. A SQL usa nomes de tabela e coluna de constantes e valores por parâmetro. BusinessMap e Acelerato não se cruzam. Confere, e a segurança aprovou.
- **Plano F2, item fora da entrega.** O "O quê" do plano lista `ref_dominio` e o mapa `field_id` → domínio. A E2.32 não os pediu, e o código não os traz (A6).

## A1 (bloqueante): compromisso por card na H-23

`referencia.ts:371-380`. Para o compromisso, `folhasDoMarco` devolve as folhas `compromisso` quando o workflow as tem, e só no workflow sem nenhuma devolve as folhas da seção 3. A H-23 = A (plano, linha 148) é por card: "card que pula a seção 2 tem o compromisso na primeira entrada na seção 3".

Prova: no workflow 191 do teste (`referencia-businessmap.test.ts:158`), a função devolve só `['2531']`. Um card que vai de 2530 (seção 1) direto para 2533 (seção 3) nunca entra em 2531 e fica sem compromisso. Com isso, sai do tempo de ciclo e do WIP que dependem do compromisso.

A entrega já funciona por card: une as folhas de entrega das seções 4 e 5, e a primeira entrada do card em qualquer uma delas é o marco. O compromisso deve ter a mesma forma: folhas `compromisso` mais as folhas `trabalho` e `homologacao` da seção 3. A primeira entrada do card nesse conjunto é o marco. Para quem passa pela seção 2, nada muda, porque ele entra nela antes. Pedido: o teste de `:155` deve provar o card que pula a seção 2 num workflow que a tem, e o comentário da `:378` deve ser ajustado.

## Testes do gravador contra PostgreSQL (para o QA, E2.35)

A F2 não traz testes `.pg`. O dublê confere o texto e os valores, mas não confere grants, CHECKs, gatilho nem tipos. O QA deve rodar contra o PostgreSQL local, com o papel que a F3 vai usar (`dspd_ref`, conforme o A2 da segurança):

1. A carga inicial dos fixtures grava nas 4 tabelas: grant por coluna em `ref_coluna`, inclusive `section`, `flow_type`, `eh_folha`, `eh_descarte` e `motivo`; CHECK de `ref_tipo_card`; regex de `ID`; e `nivel` de `ref_quadro` em `coordenacao` e `gerencia`.
2. A segunda carga com mudança de processo passa pelo gatilho: o UPDATE só de `vigente_ate` em `ref_workflow` e `ref_tipo_card`, e o grant de UPDATE de `vigente_ate` em `ref_coluna`.
3. A comparação de `vigente_de` com o dia, com o date como texto (`pool.ts`). A recusa no mesmo dia deve vir da `ErroReferencia`, não da PK.
4. `ref_versao_criterio` e `ref_versao_criterio_metrica` aceitam os 12 ids, inclusive `EI_FL1` (não há catálogo com FK a conferir, mas a gravação precisa passar), e a segunda execução no mesmo dia não duplica.
5. `registrarFolhasSemConferencia` como `dspd_coletor` (UPDATE e INSERT em `ctl_coleta_contagem`).
6. Erro no meio da carga dentro de uma transação desfaz tudo.
7. `lerColunas` depois da carga, mais `montarBaseBM`: o rótulo "Nome (id)" sai igual na dimensão e nas transições.

## Teto de linhas (M14)

`git diff --numstat --no-renames 64644b1..5a75265`, só código e teste: 869 linhas.
- `referencia.ts`: 380;
- o teste novo: 409;
- `spike-lista.ts`: 45;
- `mapa.ts`: 24;
- `conferencia.ts`: 5;
- `index.ts`: 4;
- `conferencia.test.ts`: 2.

O JSON de conferência (10 linhas) é dado de configuração e não entra na conta. O `praticas.md` não tem regra própria de tamanho de PR, então vale o teto da fábrica, como na F1 (PR 179).

Conto um comportamento só: a referência do quadro passa a ser identificada por id. Isso cobre a carga com vigência, a regra única de papel por folha que a carga usa e o consumo por id em `mapa.ts`. Sem esse consumo, a carga real fundiria colunas homônimas nos painéis, e o plano junta as três partes na F2. Aceito a exceção.

O PR da E2.36 deve trazer a linha `teto: excedido, <n> linhas, F2 do plano 052: referência do quadro por id (carga com vigência, papel único por folha e consumo em mapa.ts)`, com o `<n>` medido depois da volta. Sem essa linha, ou com um número antigo, o teto vira achado bloqueante quando o PR for aberto.

## Achados
- A2 (recomendado) server/src/modulos/businessmap/referencia.ts:230 · Um só motivo por execução vale para todas as mudanças de significado; processo e correção na mesma carga não se expressam. Sugestão: motivo por chave no comando da F3, ou erro que liste todas as chaves.
- A4 (recomendado) docs/architecture/fontes/businessmap-conferencia.json:24 · 242/2314 e 248/2326 sem nome e uma folha por workflow, mas a pergunta 2 cita três nomes. Sugestão: arquiteto confere na lista da E2.28 que nenhuma outra folha desses nomes antecede na seção 4 (ordem do 191).
- A6 (recomendado) docs/architecture/features/052-integracao-businessmap.md:143 · O plano lista ref_dominio e o mapa field_id para domínio na F2, que a E2.32 não pediu nem trouxe. Sugestão: software-architect registra a fatia onde entram (F3 ou F3b).
- A7 (recomendado) server/src/modulos/metricas/mapa.ts:31 · O rótulo Nome (id) vai aparecer muito nos cartões e na exportação do quadro real, e a contagem inclui colunas mãe. Sugestão: ux-designer confere na F6; contar só folhas.
