---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-coleta-worklog
commit: 1dc1b37e708ff23dbaa9b49ef28601224544608a
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 059-aba-apontamento, branch da coleta do worklog (trilha A, E2.37, K-193)

**Veredito: reprovado** em `1dc1b37` (código em `2462ee5`; o commit de cima só traz o parecer de segurança). A coleta, a varredura, a guarda de massa, a supressão, a eliminação e o dicionário com vigência fazem o que o plano §3.1 a §3.6 e a ADR 0025 pedem, com testes de borda. Um bloqueante, o A1: o tamanho e a forma do PR pela decisão M14. Os demais achados são recomendações e não devolvem. O A1 do parecer de segurança (`docs/security/059-beta.md`, a coleta de cards recria a pessoa eliminada) segue valendo e não é repetido aqui; a volta da coleta junta os dois.

## Escopo lido
- `git log origin/develop..origin/feature/059-coleta-worklog`: de `57413dc` (spike) a `1dc1b37`, com o merge da trilha B em `79e47fe`.
- Diff contra a develop (base `b1c2865`), todo o código de `server/`: migrações 0021 a 0031, `server/src/modulos/businessmap/apontamento/*.ts` (coleta, gravação, registro, lotes, supressão, eliminação, dicionário, hierarquia, montagem, comando), as três entradas novas, `coleta-comando.ts`, `http.ts`, `config.ts`, `grants.ts`, `lgpd.ts`, `log.ts`, `ddl.ts`, `allow-list.ts` e `docs/architecture/server.md`. Nos testes, li os nomes de todos os casos de `apontamento-coleta.test.ts` e `apontamento.pg.test.ts` e os blocos de exclusão, massa, reaparecido, supressão e retomada.
- Fora deste review: os arquivos da trilha B que vieram pelo merge (`packages/contratos/src/apontamento*`, `packages/metricas/src/coletor/classificarApontamento*`, `packages/metricas/src/businessmap/apontamento/*`). Eles têm review próprio (`docs/reviews/059-alfa.md`), e a versão na coleta é a anterior à volta da trilha B (`de9e320`). Li só o que a coleta mudou neles (`70b70a9`: subcaminho `./coletor` no `package.json` e os três testes de guarda).
- Plano `docs/architecture/features/059-aba-apontamento.md` no ramo `origin/docs/059-apontamento-discovery`: §3.1 a §3.6 e §7.2 (trilha A). ADR 0025 e revisão 4 da ADR 0020 no mesmo ramo.

## Conferência pedida
- **Coleta (§3.1, §3.2):** só GET `/loggedTime` por lote de 200 cards do escopo, com `fields` fixo e `card_ids` obrigatório no cliente (`http.ts`). O lote no teto é dividido ao meio e, com um card só, fica incompleto (`lotes.ts:55-59`). A marca d'água é própria (tarefa `apontamento`, 0021), anda só em sucesso e o incremental não roda sem carga inicial nem com a coleta de cards em falha (`coleta.ts:228-253`). A carga inicial retoma pelo checkpoint de lote em ordem (`coleta.ts:289-292`). Confere.
- **Projetor (§3.3):** a staging é append-only, com `UNIQUE (logged_time_id, registro_sha256)`. No fato, UPDATE do que mudou e INSERT do que falta, sem `DO UPDATE`. `pessoa_ref` e `type_id` não são apagados por leitura sem valor (COALESCE). `versoes` vem da staging. `iniciativa_card_id` e o bit 8 são gravados na mesma transação de `dim_card_raiz` (`gravacao.ts:127-151`, A6 do review de modelagem). Confere, com a ressalva do A2.
- **Varredura e exclusão:** só lote completo e sem registro recusado vira fonte de exclusão; subtarefa exige o lote do pai completo; guarda de massa com limiar em parâmetro; evento com chave na data civil; `reaparecido` devolve às somas e nada é apagado (`coleta.ts:182-202`, `gravacao.ts:104-120`). Os testes cobrem dois eventos no mesmo dia, 20 e 21 de 100, zero ativos, 401, 404, lote no teto e subtarefa. Confere.
- **Eliminação (A4, CA-AP-10):** a eliminação é do `dspd_migrador`, sob a trava da fonte, numa transação, com ensaio sem `--confirmar`. Grava o HMAC, apaga a linha de pessoa e anula `pessoa_ref`, e as horas ficam (`eliminacao.ts:49-73`). Confere no caminho do worklog; o caminho dos cards é o A1 da segurança.
- **Dicionário com vigência (E2.27):** compara o arquivo com o vigente, fecha antes de abrir, numa transação só, com versão de critério por carga e data que não volta no tempo. Recusa tirar os dois subgrupos reservados, e o rótulo de tipo é resolvido sem adivinhar (`dicionario.ts:107-153`, `:177-223`). A 0030 troca a chave natural por índice único parcial entre vigentes e liga o gatilho de vigência das demais `ref_`. Confere, com as ressalvas do A3 e do A4.
- **Migrações 0021 a 0031:** uma mudança por migração, cada uma com `down`. Ids em `IDN` (dígitos), `DT()`, CHECK de 1 a 86 400 s e da máscara 0 a 31, índices parciais com `excluido_em` nulo e `EXPLAIN` em teste (`apontamento.pg.test.ts:430`), FK de coleta com índice (A4, A5, A8 e A9 do review de modelagem). O `down` da 0030 apaga linhas fechadas e diz que é só para desenvolvimento. A 0026 nasce com chave natural e a 0030 a troca na mesma branch. Não editar a 0026 já aplicada é o certo, e o custo é só uma migração a mais.
- **Regras invioláveis:** só BusinessMap, nada do Acelerato; histórico preservado (staging e eventos append-only, exclusão por evento, dicionário por vigência); nenhuma credencial no código; comentário e `user_id` só em memória.

## Achados
- A1 (bloqueante) server/src/modulos/businessmap/apontamento/coleta.ts:1 · decisão M14: 4598 linhas de código e teste em server/ e vários comportamentos (esquema, cliente, coleta e varredura, dicionário, eliminação). Divida em PRs ou leve ao dono a exceção, com a linha teto: excedido no PR.
- A2 (recomendado) server/src/modulos/businessmap/apontamento/gravacao.ts:43 · volta ao valor antigo (A, B, A): o ON CONFLICT descarta o segundo A, a última linha da staging fica B e o fato fica A. O fato deixa de ser reconstruível da staging (§3.3). Revisão de modelagem com o arquiteto.
- A3 (recomendado) server/src/modulos/businessmap/apontamento/dicionario.ts:204 · a varredura reclassifica 90 dias (12 meses aos domingos) com o dicionário novo, porque subgrupo e versão entram no hash (registro.ts:130). O texto "sem reclassificar o passado" daqui e da 0026:8 não vale.
- A4 (recomendado) server/src/modulos/businessmap/apontamento/dicionario.ts:199 · arquivo mudado sem trocar o campo versao grava nova versão de critério com o mesmo rótulo, e versao_dicionario na staging deixa de identificar o dicionário. Recuse versao já usada com outro sha256.
- A5 (recomendado) server/src/modulos/businessmap/coleta-comando.ts:108 · com o sal no .env e sem carga inicial do worklog ou sem dicionário, a etapa lança sem-marca ou dicionario depois dos cards gravados: bm:coleta sai 1 sem imprimir o resultado dos cards. Leve a falha ao campo apontamento.
- A6 (recomendado) server/src/modulos/businessmap/coleta-comando.ts:108 · a etapa do worklog roda também sem --projetar, sobre o dim_card da projeção anterior: card novo fica fora do escopo e da hierarquia até a próxima projeção. Rode a etapa só com a projeção ou documente.
- A7 (recomendado) server/src/modulos/businessmap/apontamento/coleta.ts:312 · registro recusado permanente (tempo-invalido, id-invalido) deixa toda execução parcial: a carga inicial não chega a sucesso e o incremental não começa (sem-marca). Pergunta ao arquiteto: falha já registrada segura a marca?
- A8 (recomendado) server/src/modulos/businessmap/apontamento/registro.ts:21 · o bit 16 (valor-atipico) é preservado no fato (gravacao.ts:66), mas nada o grava: a soma diária é calculada na leitura (biblioteca e rota). Ajuste o comentário ou a máscara.
- A9 (recomendado) server/src/entradas/coleta-businessmap.ts:40 · const coletor = poolColetor é só um apelido. Use poolColetor direto.

## Detalhe

### A1: decisão M14
A contagem foi feita com `git diff --numstat --no-renames origin/develop...origin/feature/059-coleta-worklog -- server`, sem `.md`, sem `server/tests/pg/esquema.snapshot.json` e sem `server/migrations/checksums.json`: **4598 linhas**, das quais 1694 são de `server/src` e `server/migrations`. Com os arquivos da trilha B herdados, o total da branch sem `.md` é 7851. Depois do merge do α na develop, a trilha B sai da conta, mas o código da coleta continua mais de dez vezes acima do teto. A branch carrega vários comportamentos: esquema e papéis (0021 a 0028), cliente e fronteira, coleta incremental com varredura, `type_id` (0029), dicionário com vigência (0030), eliminação a pedido (0031) e as entradas de CLI.

Ainda não existe PR, então a linha de exceção ainda não tem onde estar. Valem os dois caminhos do review da trilha B (`059-alfa.md`, A3): (a) dividir em PRs empilhados, por exemplo esquema e cliente, coleta e varredura, dicionário, e eliminação; (b) exceção decidida pelo dono e registrada no corpo do PR com o número recontado depois do merge do α, como no 052 F4. O plano §7.2 juntou A1 a A4 numa trilha só por causa do prazo, e isso pesa a favor da exceção, mas a decisão é do dono, pelo Jarvis.

### A2: staging e a volta ao valor antigo
O caso é um apontamento editado de A para B e depois de volta para A. Na terceira leitura, `gravarStgApontamento` tenta inserir `(id, hash de A)`, que já existe, e o `ON CONFLICT DO NOTHING` descarta a linha. O fato é atualizado direto da leitura e fica A, com `versoes` 2. A última linha da staging (`ix_stg_apontamento_ultima`, `stg_sk DESC`) continua B. O plano diz que o fato é "reconstruível da staging, menos `pessoa_ref`", e uma reconstrução daria B. A transição B para A também não fica registrada em lugar nenhum. O próprio autor apontou o caso no registro de 2026-11-02 00:20.

A chave da staging foi a aprovada no review de modelagem (`059-modelagem.md`) e no §3.2, então não é defeito do autor. É lacuna do desenho, e a correção mexe na chave natural. Por isso fica como recomendação, para nova revisão de modelagem (tech-lead e arquiteto) antes da carga inicial real. Duas opções: deduplicar só contra a última versão do mesmo `logged_time_id`, em vez de qualquer versão, com o índice que já existe; ou registrar a volta como evento. Hoje nada lê a staging para reconstruir, e o fato está certo, por isso não bloqueia.

### A3: o dicionário novo reclassifica a janela da varredura
`classificar` (`registro.ts:126-131`) põe `subgrupo_codigo`, `flags_qualidade` e `versao_dicionario` no hash. Depois de um `ref:sync` que muda algo, a varredura do dia seguinte relê 90 dias (no domingo, 12 meses) e classifica com o dicionário vigente. Cada apontamento cuja saída muda ganha hash novo, linha nova na staging, `versoes` mais 1 e subgrupo novo no fato. O plano §3.4 já prevê isso ("reclassificar o passado exige reler o worklog pelo período"), e a varredura faz exatamente essa releitura. O comportamento cabe no desenho, mas dois textos dizem o contrário. O `motivo` gravado em `ref_versao_criterio` (`dicionario.ts:204`, "sem reclassificar o passado") é o texto da marca de critério (T2.6). O comentário da 0026 (linha 8) também. A correção mínima é o texto: dizer que a vigência vale a partir da data e que a varredura reclassifica a janela relida. Se o passado não deve mudar com o dicionário, é pergunta ao arquiteto (manter a classificação quando só o dicionário mudou), não decisão no código.

### A4: versão do arquivo repetida
`sincronizarDicionario` registra versão de critério sempre que há diferença. A referência traz versão e sha256, mas o coletor grava só a versão (`carregarDicionario`, `:249`). Se o arquivo mudar e o campo `versao` ficar igual, duas classificações diferentes ficam com o mesmo `versao_dicionario` na staging e no fato. A recusa custa uma consulta: existe `ref_versao_criterio` com o mesmo prefixo e a mesma versão, mas com outro sha256? Então recuse com `ErroDicionario('mudanca')` e a mensagem "troque o campo versao".

### A5 e A6: a etapa do worklog dentro do `bm:coleta`
No A5, a etapa (`coleta-comando.ts:108`) roda dentro da trava, depois que os cards já foram gravados. Uma exceção dela (`sem-marca` antes da carga inicial do worklog, `dicionario` antes do `ref:sync`) sobe até a entrada, que imprime `bm:coleta falhou: sem-marca (...)` e sai com 1. Os cards deram certo, o JSON deles não sai, e `sem-marca` é o mesmo código que a coleta de cards usa para dizer que ela própria não tem marca. O caminho aparece assim que o dono põe o sal no `.env` antes de rodar os passos 1 e 2 do `server.md`. Sugestão: capturar `ErroColetaBm` da etapa e devolver `apontamento: { falha: <codigo> }`, com o código de saída 3, sem mascarar os cards.

No A6, a etapa roda com `args.projetar` falso também. `escopoDoWorklog` e `atualizarHierarquia` leem `dim_card`, que só a projeção atualiza. Card novo fica fora do escopo nessa execução. O passe dos novos não traz o worklog dele, e a varredura só o recupera depois da próxima projeção, dentro de 90 dias. O plano §3.2 pede `dim_card` atualizado. Ou a etapa exige `--projetar`, ou o `server.md` diz que o incremental do worklog deve rodar com ele.

### A7: registro recusado permanente segura a marca
O estado vira `parcial` com qualquer código em `x.falhas`, e isso inclui registro recusado (`coleta.ts:312`). Na carga inicial, o lote com o registro ruim nunca entra no checkpoint, então a carga nunca fecha `sucesso`, não grava marca d'água, e o incremental recusa com `sem-marca`. No incremental, um registro ruim dentro dos 90 dias deixa todas as execuções `parcial`, e a marca não anda (o passe dos novos lê cada vez mais). O plano §3.1 manda fechar `parcial`, então o código segue o plano. O efeito de longo prazo (nunca sair da carga inicial por um registro que a origem não vai corrigir) não está decidido em lugar nenhum. `data-futura` se resolve sozinho com o tempo, mas `tempo-invalido` e `id-invalido` não. Pergunta ao arquiteto, pelo Jarvis: falha de registro já gravada em `ctl_coleta_falha` deve segurar a marca d'água?

## Ferramentas e outros pareceres
- O `docs/engineering/praticas.md` não tem regra "decidida por: `<comando>`". Fica como pendência do tech-lead com o arquiteto (a mesma do `059-alfa.md`), sem review manual de lint ou formatação.
- CI verde em `1dc1b37` (run 41412452410: `rapida`, `testes`, `banco`, `build`, `openapi`, `seguranca`, `imagem` e `filtro` verdes; `e2e` e `perf` pulados) e em `2462ee5` (run 41411301693). Não refiz a suíte. O autor relatou pronto verde e 197 testes `.pg` verdes em `2462ee5`.
- Segurança: `docs/security/059-beta.md`, reprovado em `2462ee5` pelo A1 (a coleta de cards recria a pessoa eliminada), com os recomendados A2 a A4. Não refiz os achados dele. Nenhum achado deste review é de segurança.
- Devops: a branch não mexe em workflow, compose nem nginx, e não precisa de parecer próprio.
- QA: ainda não houve, e vem depois da volta.

## Pendências fora da volta do autor
- Linha `PESSOA_ELIMINADA_SAL=` no `.env.example`: fica com o tech-lead na integração (decisão técnica do Jarvis de 2026-11-02 04:30).
- `data-model.md` §3, §8 e §9 com as tabelas novas: G3 do arquiteto, em PR de documentação (§7.2).
- Número 0029 repetido entre a coleta (`type_id`) e a rota (view de quem é do time): a rota renumera (E2.28) depois do merge da coleta.
- A trilha B desta branch é a anterior à volta dela. Depois que o α for mesclado, a coleta traz a develop por merge na hora do PR (`R-FLUXO`), e o `forge-check pr` aponta o que invalida.
