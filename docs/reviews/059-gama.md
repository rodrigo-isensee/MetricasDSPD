---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: docs/059-apontamento-discovery
commit: 1d95dd502ab77463d70ca9c4a2b1aaba4022b3a4
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 059-aba-apontamento, branch da rota da aba (trilha B4, E2.51, K-193)

**Rodada 5 (revalidação por delta na branch do discovery, E2.96). Veredito: aprovado em `1d95dd5`.** A rota mesclada na develop (PR 196, squash `31de83f`) segue a revisão 4 da ADR 0020 nos pontos conferidos abaixo. O delta é só documentação e não muda código. Dois achados novos, os dois recomendados e só no texto da ADR: A6 e A7. A1 a A7 não devolvem.

## Delta lido na rodada 5
- `forge-check pr 059-aba-apontamento --raiz /home/rodrigoisensee/MetricasDSPD-052c --ref origin/docs/059-apontamento-discovery --base origin/develop` diz o PR isento de QA (só `.md` fora do controle) e acusa este parecer por `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md` (base `origin/develop` `e32ee54`).
- `forge-check delta --parecer docs/reviews/059-gama.md` não calcula o intervalo: `f0cd292 não é ancestral de 1d95dd5` (a rodada 4 foi na branch do dicionário, que entrou na develop por squash, PR 197). No lugar dele: `git diff --stat origin/develop..origin/docs/059-apontamento-discovery` mostra os 10 documentos do discovery (1567 linhas a mais, 1 a menos). O mesmo diff restrito a `server`, `packages`, `web`, `scripts`, `.github` e `e2e` sai vazio.
- Lido por inteiro: o diff da ADR 0020 (revisão 4, R4-1 a R4-8, alternativas, critério de reversão e as duas linhas do histórico). A última mudança dela na branch é `9ac2855` (R4-5 com a view de quem é do time e a view definer escolhida, E2.30), igual ao texto que a rodada 1 já citou. Os outros 9 documentos (plano, ADR 0025, dicionário, textos e especificação de UX, modelo de ameaças, parecer das ADRs, review de modelagem e plano de testes) não são citados pela rota além do que a rodada 1 leu (plano §3.7 a §3.9) e têm portões próprios (QA documental E2.97, segurança `docs/security/059-adrs.md` aprovado em `114c435`, modelagem `docs/reviews/059-modelagem.md`). Não os reli.
- **Rota da develop contra a revisão 4, conferida no código de `origin/develop`:**
  - R4-5, papel e GRANTs: `COLUNAS_API_APONTAMENTO` (`server/src/plataforma/db/grants.ts:14`) bate com a lista da R4-5. De `dim_responsavel`, só `pessoa_ref` e `responsavel_nome`, sem `responsavel_id`. De `fato_apontamento`, sem `logged_time_id`. Entram `apt_pessoa_time` (só `pessoa_ref` e `vigencia_ate`), `ref_versao_criterio_metrica` e o mínimo de `ctl_coleta`. Nada em `stg_` nem `evt_`. O dicionário fica em `TABELAS_FORA_DA_API`.
  - R4-5, 421: `server/src/modulos/apontamento/hosts.ts` tem lista fechada (`localhost`, `127.0.0.1`, `::1` e a rede local declarada), comparação exata, porta fora e `Origin` só `http(s)`. `rotas.ts:55` e `:62` dão `no-store` e 421 sem corpo, com log só do código.
  - R4-5, interruptor e guarda de partida: `server/src/plataforma/config.ts:44` a `:52`. Padrão `0`. Rede local só IPv4 privado. `0.0.0.0` só com `APONTAMENTO_PUBLICACAO_LOOPBACK=1`. A mensagem de recusa nomeia a variável.
  - R4-5, pool e lint: `server/eslint.config.js:5`, `:15` e `:45`, com `noInlineConfig` em todo o server.
  - R4-3, nome só ligado: `servico.ts:102` lê o nome só com `nomesReais`, e `repositorio.ts:59` é a única leitura de `responsavel_nome`.
  - R4-2, `redact` em dois níveis: `server/src/plataforma/log.ts:24` e `:26`.
  - Alternativa (b), view definer só para `apt_pessoa_time`: é a 0033 que a rodada 1 leu.
- Já lido nas rodadas 1 a 4 e não relido: o código que a rota soma, o dicionário v2 e o encaixe do front.

## Ferramentas e outros pareceres (rodada 5)
- Branch só de documentação: o autor do merge (E2.95) relata `docs:check` verde. Não refiz. O QA documental é a E2.97, em paralelo.
- Teto da decisão M14: não se aplica, porque o diff não tem código nem teste.

---

## Histórico: rodada 4

**Rodada 4 (revalidação por delta na branch do dicionário em radicais, E2.91). Veredito: aprovado em `f0cd292`.** A rota continua atendida com o dicionário `2026-11-02-v2`. O delta não muda código da rota. Achado: o recomendado A5, latente (o v2 não o dispara), registrado de novo porque a versão desta branch que o trazia (E2.83, `ab47244`) foi trocada pela da develop no alinhamento (E2.90). A1 a A5 não devolvem.

## Delta lido na rodada 4
- `forge-check pr 059-aba-apontamento --raiz /home/rodrigoisensee/MetricasDSPD-052e --ref origin/feature/059-dicionario-radicais --base origin/develop` acusou este parecer (e o QA da rota, renovação própria na E2.92) por `docs/architecture/fontes/apontamento-dicionario.json` (base `origin/develop` `60be28a`).
- `forge-check delta --parecer docs/reviews/059-gama.md` não calcula o intervalo: `dc3a5b4 não é ancestral de 53fd1a9` (o front entrou na develop por squash, PR 198). No lugar dele: `git diff --stat dc3a5b4 origin/develop -- server packages` sai vazio, então o código da rota na develop é o aprovado nas rodadas 1 a 3. O delta é `git diff origin/develop..origin/feature/059-dicionario-radicais` (6 arquivos).
- Fora dos pareceres (`docs/qa/059-epsilon.md`, `docs/qa/059-excecao-apontamento.md`, `docs/reviews/059-epsilon.md`, de outros papéis e etapas), o delta muda 3 arquivos: o dicionário (`versao` v1 para v2; termos em radicais `test`, `analisa`, `analisei`, `analisou`, `diagnos`, `configur`, `infraestrutur`, `apoi`, `ajust`, `correc`, `corrig`, `criac`, `rotin`), `docs/architecture/server.md:224` (motivo de cada radical e dos termos inteiros) e `server/tests/apontamento-dicionario.test.ts` (versão, contagem 2+4+5+3+1+3+1+10 e a matriz de radicais). Os 12 subgrupos, a prioridade, os rótulos e as regras por tipo saem iguais. O conteúdo do dicionário e do teste tem review próprio em `docs/reviews/059-epsilon.md`; aqui li só o efeito na rota. `git diff origin/develop origin/feature/059-dicionario-radicais -- server/src packages` sai vazio.
- **Efeito na rota:** o JSON só é lido por `server/src/modulos/businessmap/apontamento/dicionario.ts:17` e `server/src/entradas/ref-sync-apontamento.ts`, fora do módulo da rota. A rota lê o subgrupo já gravado em `fato_apontamento` na coleta, então linha antiga não muda de subgrupo e nada é sobrescrito. De `ref_apontamento_subgrupo` ela lê só `codigo` e `rotulo` (`repositorio.ts:76`), que o v2 não muda. Em `criterios` (`repositorio.ts:114`) entra a versão aberta pela carga que inclui termo: a troca do arquivo aparece como critério novo com data (T2.6), como a rota prevê. Contrato, filtros e códigos de subgrupo não mudam.
- Já lido nas rodadas 1 a 3 e não relido: todo o código que a rota soma.

## Ferramentas e outros pareceres (rodada 4)
- CI da ponta `f0cd292`: runs `41521480411` e `41521469564` em andamento na hora deste parecer; a ponta anterior `d308ab4` saiu `success` (run `41519912512`). O pronto da E2.90 corre em paralelo, com o tech-lead. Não refiz a suíte.
- Teto da decisão M14: a contagem da linha `teto: excedido` vale para o PR desta branch (197), não para este parecer.

---

## Histórico: rodada 3

**Rodada 3 (revalidação por delta na branch do front, E2.85). Veredito: aprovado em `dc3a5b4`.** A rota continua atendida pelo front. O delta não muda código da rota e não traz achado novo. Os recomendados A1 a A4 da rodada 1 seguem abertos e não devolvem.

## Delta lido na rodada 3
- `forge-check pr 059-aba-apontamento --raiz /home/rodrigoisensee/MetricasDSPD-052h --ref origin/feature/059-aba-front --base origin/develop` acusou este parecer por `docs/tecnica/arquitetura-front.md` (base `origin/develop` `31de83f`). O mesmo aviso saiu para o QA do front, por `docs/ux/059-revisao-delta-r4.md`, que tem renovação própria (E2.86).
- `forge-check delta --parecer docs/reviews/059-gama.md` não calcula o intervalo: `1bf3338 não é ancestral de dc3a5b4`, porque a rota entrou na develop por squash (PR 196). No lugar dele: `git diff --stat 1bf3338 31de83f -- . ':!docs'` sai vazio, então o código da rota na develop é o mesmo aprovado na rodada 2. O delta é `git diff origin/develop..origin/feature/059-aba-front` (54 arquivos).
- **Fora da rota:** esse diff não toca `server/`, `packages/`, `scripts/`, `.github/` nem as migrações. Muda só `web/`, `e2e/`, `docs/ux/`, os pareceres do front e `docs/tecnica/arquitetura-front.md`. O código do front tem review próprio em `docs/reviews/059-delta.md`; aqui li só o encaixe na rota.
- **`docs/tecnica/arquitetura-front.md` (diagrama e §14):** o texto bate com a rota e com `docs/api/apontamento.md`. A rota é única (`GET /api/apontamento`, mesma origem, `no-store`). Toda resposta 200 passa pelo `respostaApontamentoSchema` importado de `@metricas-dspd/contratos`, sem redeclaração no `web/`. O filtro `tipo` manda o `id` de `opcoes.tipos`, sem a sonda do 422. `outra-area` é a chave fixa, sem nome e sempre por último.
- **Encaixe conferido no código:** o caminho é o mesmo dos dois lados (`web/src/features/apontamento/api.ts:10` e `server/src/modulos/apontamento/rotas.ts:65`). `consultaParaQuery` (`api.ts:16`) envia só as chaves do contrato, que é estrito. As listas vão em CSV, que o contrato aceita (`packages/contratos/src/apontamento.ts:97`, divisão por vírgula). A pessoa vai só como `pessoaRef`. O erro HTTP lê só `error.code`, sem log do corpo. O front não calcula métrica e não lê o Acelerato.
- Já lido nas rodadas 1 e 2 e não relido: todo o código que a rota soma.

## Ferramentas e outros pareceres (rodada 3)
- CI da ponta `dc3a5b4`: o run `41511517953` estava em andamento na hora deste parecer. O autor do merge relata pronto verde (web 1401) e `test:e2e` verde (795) na E2.78. Não refiz a suíte.
- Teto da decisão M14: a contagem da linha `teto: excedido` vale para o PR do front e é recontada na abertura (E2.65), não neste parecer.

---

## Histórico: rodada 2

**Rodada 2 (revalidação por delta sobre o merge da develop, E2.72). Veredito: aprovado em `1bf3338`.** O merge não traz código novo da rota. Não há achado novo. Os recomendados A1 a A4 da rodada 1 seguem abertos e não devolvem.

## Delta lido na rodada 2
- O `forge-check pr 059-aba-apontamento --raiz /home/rodrigoisensee/MetricasDSPD-052g --ref origin/feature/059-rota-apontamento --base origin/develop` acusou este parecer como desatualizado por `packages/metricas/src/businessmap/index.ts` (base `origin/develop` `32ebf3a`). O mesmo aviso saiu para o QA da rota, o devops e a segurança, que têm renovação própria (E2.73 a E2.75).
- `forge-check delta --parecer docs/reviews/059-gama.md 1bf3338` dá o intervalo `abfd287..1bf3338`. Fora dos pareceres, só mudam `.forge/versao` (+1 -1), `CLAUDE.md` (linha 14, +1) e o briefing (linha 410, +1). Os três vêm da develop (PRs 192 e 193) e saem iguais à `origin/develop`. Nenhum arquivo de `server/`, `web/`, `packages/`, `e2e/`, `scripts/` ou `.github/` mudou no intervalo.
- **Merge `0b4519c..1bf3338` (squashes dos PRs 194 e 195):** `git diff --stat 0b4519c 1bf3338` mostra só 4 pareceres da coleta e da exceção (`docs/qa/059-beta.md`, `docs/qa/059-excecao-apontamento.md`, `docs/reviews/059-beta.md`, `docs/security/059-beta.md`), na versão da develop. `git diff 0b4519c 1bf3338 -- . ':!docs'` sai vazio. A trilha B e a coleta já estavam na branch com o mesmo conteúdo, aprovadas nos pareceres delas, e não as reli.
- **Os arquivos do conflito (decisões técnicas do conflito da rota e da extensão dela):** `git diff origin/develop..origin/feature/059-rota-apontamento -- packages` agora mostra só a linha `ordenarPorPessoa,` no export de `packages/metricas/src/businessmap/index.ts:67`. Esse export veio do `0f582f2`, já lido na rodada 1. Ele é usado só por `server/src/modulos/apontamento/servico.ts:4` e `:122`. A função está em `apontamento/comum.ts:72` na develop, com testes em `apontamento.test.ts:181-199`. Os outros 7 arquivos do conflito (migrações, `checksums.json`, `lgpd.ts`, os três `.pg` e o snapshot) não mudaram no intervalo e ficam na versão da rota, que a rodada 1 leu: a 0033 e a view de quem é do time.
- Já lido na rodada 1 e não relido: todo o código que a rota soma (`server/src/modulos/apontamento/`, a 0033, grants, config, critérios, lint, testes).

## Ferramentas e outros pareceres (rodada 2)
- PR 196 com `headRefOid` `1bf3338` e `mergeStateStatus` CLEAN. Os checks da ponta estão todos `pass` (runs `41491565001` e `41491575279`: rapida, testes, filtro, openapi, imagem, build, seguranca, banco, e2e e as duas partes). Os `skipping` são os jobs condicionais (perf e a matriz do e2e no run sem e2e). Não refiz a suíte.
- Teto da decisão M14: o número da linha `teto: excedido` é recontado na hora do PR, agora sem a trilha B e a coleta, que ficaram iguais à develop.

---

## Histórico: rodada 1

**Rodada 1. Veredito: aprovado em `abfd287`.** Nenhum bloqueante. Quatro recomendados (A1 a A4), que não devolvem; o A1 leva uma pergunta ao dono. O teto da decisão M14 fica coberto pela decisão do dono de 2026-11-02 (teto por PR da aba): o PR da rota para a develop leva no corpo a linha `teto: excedido, <n> linhas, <motivo>`, com o número recontado na hora do PR.

## O que foi lido
- `git diff origin/develop...origin/feature/059-rota-apontamento` (136 arquivos). O que veio do contrato e biblioteca (`d75e5ac`) e da coleta (`6106442`, contida na ponta; `d3d50b4` da coleta só acrescenta o parecer de QA) tem review aprovado em `docs/reviews/059-alfa.md` e `docs/reviews/059-beta.md` e não foi relido. As mudanças de `limpar-seed` e os pareceres do 052 vêm da develop.
- O que a rota soma, lido linha a linha (`git diff 6106442 abfd287`, sem o que veio do contrato): `server/src/modulos/apontamento/` inteiro (`hosts.ts`, `pool.ts`, `repositorio.ts`, `rotas.ts`, `servico.ts`, `index.ts`), a migração `0033_bm_apt_pessoa_time.ts` e `checksums.json`, `modulos/referencia/criterios-apontamento.ts` e a entrada `entradas/criterios-apontamento.ts`, `plataforma/config.ts`, `plataforma/db/grants.ts`, `plataforma/db/lgpd.ts`, `app.ts`, `entradas/api.ts`, `entradas/openapi.ts`, `eslint.config.js`, `scripts/test-pg.sh`, `tools/homolog/src/ambiente.ts`; dos testes, os nomes de todos os casos de `apontamento-rota.test.ts`, `apontamento-rota.pg.test.ts`, `apontamento-papel.test.ts` e `apontamento-config.test.ts`, e o corpo dos casos de Outra área e da view.
- Plano `docs/architecture/features/059-aba-apontamento.md` §3.7 a §3.9 e a revisão 4 da ADR 0020 no ramo `origin/docs/059-apontamento-discovery`.
- Pareceres da branch, citados e não refeitos: segurança `docs/security/059-rota-apontamento.md` (aprovado em `75bd9d9`, código até `8a92a49`; a renovação sobre `a1e211f` e `abfd287` é etapa dela) e devops `docs/devops/059-rota-apontamento.md` (aprovado em `8a92a49`; CI, compose, nginx e scripts de papéis).

## Ferramentas (citadas, não refeitas)
- CI do GitHub no HEAD revisado: run `41429255932`, `abfd287`, `success` (pronto, lint, tipos e `.pg`). O autor relata pronto e `.pg` 224 verdes (E2.48).
- Pendência: o `docs/engineering/praticas.md` do projeto não marca as regras com "decidida por"; o review seguiu o checklist da skill `engineering-practices` para o que é leitura.

## Conferência do que a rota soma
- **Módulo e rota:** rota única `GET /api/apontamento` registrada num contexto próprio do Fastify, então os ganchos de 421 e `no-store` valem só para ela; sem `deps.apontamento` a rota não existe (teste). A consulta passa pelo schema do contrato mais a recusa de valor repetido; erro 400 sai só com caminho e código, sem eco. Falha de banco vira 500 genérico, com só classe e SQLSTATE no log. Serializador de requisição sem consulta nem `Host`. Confere com o plano §3.9.
- **Papel e GRANTs:** `dspd_api_apontamento` em `PAPEIS` (entra no REVOKE geral), USAGE só em `bm` e `core`, SELECT por coluna pela lista fechada `COLUNAS_API_APONTAMENTO`; de `dim_responsavel`, só `pessoa_ref` e o nome; de `fato_apontamento`, sem `logged_time_id`, hash, comentário nem categoria. Teste confere que toda coluna concedida existe no catálogo e que o `dspd_api` segue sem nada da aba. `type_id` concedido para o filtro.
- **View de quem é do time (0033):** sem `security_invoker`, entrega só `pessoa_ref` e `vigencia_ate`; o corte dos 12 meses é parâmetro da rota. Exceção nomeada em `lgpd.ts`. A semântica do corte para card encerrado é o A1.
- **Filtro por tipo:** `opcoes.tipos[].id` é o `type_id` em dígitos, o mesmo valor que o filtro aceita; linha sem `type_id` entra nas somas como `sem-tipo` e não vira opção. Valor do filtro nunca entra no SQL (filtragem na biblioteca). Teste ponta a ponta com o papel da aba.
- **Rótulos fixos:** com `nomesReais` falso, rótulo `Pessoa <ref>` e `Outra área`, e a coluna do nome nem é consultada (teste conta as consultas). Ligado, o nome sai só em `opcoes.pessoas[].rotulo` e só para quem é do time.
- **Interruptor:** `APONTAMENTO_NOMES` em `0|1` sem `vazioIndefinido` (vazio recusa a partida); ligado, exige `HOST` em loopback, no `APONTAMENTO_REDE_LOCAL` (um IPv4 privado específico) ou `0.0.0.0` com a publicação declarada em loopback. Testes de config e de arquivos de compose e CI.
- **421:** lista fechada, comparação exata, porta fora, `Origin` só `http(s)`; vale com o interruptor ligado ou desligado; sem corpo e sem eco; `no-store` também na 421 (o `onSend` roda depois do `onRequest`).
- **Lint do pool:** `noInlineConfig` em todo o server; o módulo da aba só é importável por `app.ts`, `entradas/api.ts` e `entradas/openapi.ts`; outro módulo, plataforma ou entrada falha o lint (testes que rodam o ESLint de verdade).
- **Cálculo:** o serviço só lê e monta a moldura; soma, capacidade, utilização, achados e piso de 20 são de `calcularApontamento` (T2.5). Só BusinessMap. Limiares dos achados registrados como versão de critério (T2.6), a partir da constante única da biblioteca.

## Achados
- A1 (recomendado) server/migrations/0033_bm_apt_pessoa_time.ts:22 · a última versão de todo card tem ate nulo, então quem é responsável num card encerrado há anos conta como do time para sempre e aparece com nome; levar ao dono se responsabilidade em card encerrado vale para os 12 meses
- A2 (recomendado) server/src/modulos/referencia/criterios-apontamento.ts:31 · os dois INSERT sem transação: falha entre eles deixa a versão sem a ligação à métrica, e a reexecução a pula pela referência, então ela nunca aparece em criterios; envolver o laço em BEGIN e COMMIT
- A3 (recomendado) server/src/modulos/apontamento/servico.ts:144 · opcoes.subtarefas sai de linhas (período mais diário) e as outras opções saem de noRecorte; usar noRecorte, ou comentar por que as duas opções fixas saem sempre
- A4 (recomendado) server/src/modulos/apontamento/rotas.ts:40 · cast `as never` sem comentário que o explique; tipar o parâmetro como o tratarErro espera ou comentar o escape
- A5 (recomendado) server/src/modulos/apontamento/repositorio.ts:76 · o comentário diz dicionário vigente, mas o SELECT não filtra vigente_ate IS NULL; se a troca de arquivo mudar o rótulo de um subgrupo, saem duas linhas do mesmo código e o Map fica com a que vier por último; filtrar o vigente
- A6 (recomendado) docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:118 · R4-1 diz que a aba lê só o esquema dspd_bm, mas a R4-5 e o grants.ts:24 a :28 dão ao papel da aba tabelas de dspd_core (calendário, feriado, versões de critério); trocar por "não lê dspd_ac"
- A7 (recomendado) docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:112 · a revisão 4 segue proposta (linhas 3, 112, 209 e 210), mas as duas condições já valem (059-adrs aprovado, PR 193 em 76fffa5) e o código está na develop (31de83f); passar a vigente com a data

## Encaminhamentos
- A1: pergunta ao dono pelo Jarvis (dúvida de regra de negócio não se resolve no código). Toca dado de pessoa (nome de quem saiu do time): cartão para o `security-engineer` considerar na renovação do parecer da rota. Se o dono decidir que card encerrado não conta, a view precisa de uma data de encerramento do card (conclusão ou arquivamento) como fim da responsabilidade.
- A2 a A4: ao `node-backend` numa volta futura, sem bloquear o QA.
- A5 (rodadas 3 do dicionário e 4): ao `node-backend` numa volta futura, sem bloquear o QA nem o PR do dicionário (o v2 não muda rótulo de subgrupo). O filtro precisa do GRANT de `vigente_ate` ao `dspd_api_apontamento` (`server/src/plataforma/db/grants.ts:20` concede só `codigo`, `rotulo` e `incluido_por_versao_id`), com teste de rótulo trocado. GRANT de coluna é escopo de segurança: cartão ao `security-engineer` quando a volta vier.
- A6 e A7 (rodada 5): ao `software-architect`, numa edição só de texto da ADR 0020. Pode ir na própria branch do discovery antes do PR da E2.98, ou depois, numa branch própria. Nenhum dos dois muda código.
- Teto da decisão M14: recontar na hora do PR, com a linha `teto: excedido` no corpo. Hoje, `git diff --numstat --no-renames origin/develop...abfd287` sem `.md`, snapshot e `checksums.json` dá 12964 linhas, com o contrato e a coleta herdados; o que a rota soma sobre a coleta, em `server/` e scripts, sem `limpar-seed`, é cerca de 1678 linhas.
- Integração: os PRs da aba para a develop esperam o PR da exceção mesclado pelo dono (a revisão 4 da ADR 0020 só vale na branch até lá); depois de mesclados o contrato e a coleta, a rota se atualiza com a develop na hora do merge, e o `forge-check pr` aponta se o parecer precisa de revalidação.
