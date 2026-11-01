---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-ws1-estrutura
commit: ac47bf16c9443bae8cb20cd8f39f3a3a72478c7f
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-01
---
# Review: 052-integracao-businessmap (E1.17, script de diagnóstico da WS1, K-185)

Escopo da primeira rodada: `9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5..27d32b26f346fdfd56d1ab45c5e38579d7c1018a` (1 commit, 7 arquivos, 734 linhas a mais). Lido por leitura: o diff inteiro e as seções 2, 3, 4, 8 e 9 do `docs/engineering/praticas.md`.

## Renovação por delta (E2.62, 2026-11-01)

Motivo: o `forge-check pr 052-integracao-businessmap --ref origin/feature/052-f4-projetor --base origin/develop` marcou este parecer como desatualizado porque o `docs/architecture/data-model.md` mudou na F4 (`783612d`). O `docs/architecture/data-model.md` de `3ad39f8` é igual ao de `dd15c93` (o squash da F3). Delta lido, e só ele: `git diff dd15c93..ac47bf1 -- docs/architecture/data-model.md server/package.json server/src/modulos/businessmap/index.ts`.

- `docs/architecture/data-model.md`: um bloco novo na §3.3, a projeção do BusinessMap da F4 (`fato_transicao`, `dim_card.tipo`, granularidade e equipe, marcos, descarte, `card_pai`, `dim_card_versao` e a reconstrução que preserva `dim_responsavel`). Trata de tabelas que o script da WS1 não lê nem grava.
- `server/package.json`: uma linha nova, o script `bm:projetar`. O `bm:diagnostico` segue igual; nenhuma dependência nova.
- `server/src/modulos/businessmap/index.ts`: o tipo `ResultadoComando` e os exports do projetor e do normalizador. O export do `diagnosticar` segue igual, e o `index.ts` continua sem efeito colateral ao importar.

Já lido e fora do delta: o código e os testes da WS1, sem mudança. O código novo tem parecer próprio (`docs/reviews/052-f4-projetor.md`, aprovado em `ac47bf1`). O QA renovou o dele (`docs/qa/052-ws1-estrutura.md`, E2.80, `5ec6a4b`). Conclusão: a mudança não afeta o script da WS1; nenhum achado novo, e o parecer segue aprovado em `ac47bf1`.

## Renovação por delta (E2.50, 2026-10-31)

Motivo: o `forge-check pr 052-integracao-businessmap --ref origin/feature/052-f3-coleta --base origin/develop` marcou este parecer como desatualizado porque a ADR 0020 mudou depois dele (`ad7cde3`, E2.52 da F3). O `forge-check delta --parecer` não roda aqui (`da4919a` não é ancestral de `3ad39f8`); o delta lido foi `git diff 0783caa..3ad39f8 -- docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md server/package.json server/src/modulos/businessmap/index.ts`, e só ele.

- ADR 0020: a linha `Estado:` ganha o complemento da F3; o item 4c ganha as transições de `expand=transitions` (`CAMPOS_TRANSICAO`) e o `revision_id` determinístico com a saída; a R3-2 registra a forma final de `dim_responsavel` (migração 0020); uma linha nova na tabela de revisões. Tudo trata da coleta de cards e de `/users`, que o script da WS1 não faz (sem cards, sem `/users`, nada gravado na base).
- `server/package.json`: uma linha nova, o script `bm:coleta`. O `bm:diagnostico` segue igual; nenhuma dependência nova.
- `server/src/modulos/businessmap/index.ts`: exports novos da F3 (allow-list das transições, `lerConferencia`, coleta, comando e usuários). O export do `diagnosticar` segue igual, e o `index.ts` continua sem efeito colateral ao importar. O código novo tem parecer próprio (`docs/reviews/052-f3-coleta.md`, aprovado em `cc8c0cf`).

Já lido e fora do delta: o código e os testes da WS1, sem mudança desde `0783caa`. Segurança e QA da F3 têm pareceres próprios (`docs/security/052-f3-coleta.md`, `c088778`; `docs/qa/052-f3-coleta.md`, `3ad39f8`). Conclusão: a mudança não afeta o script da WS1; nenhum achado novo, e o parecer segue aprovado em `3ad39f8`.

## Renovação por delta (E2.43, 2026-10-31)

Motivo: parecer desatualizado por arquivos da WS1 que mudaram na F2 depois dele. O `forge-check delta` não roda aqui (`0714135` não é ancestral da ponta); o delta lido foi `git diff 64644b1..da4919a -- server/src/modulos/businessmap/index.ts server/package.json docs/architecture/fontes/businessmap-conferencia.json`, e só ele.

- `server/src/modulos/businessmap/index.ts`: um bloco novo de exports da F2 (`sincronizarReferencia`, `lerReferenciaReal`, `planejar`, `registrarFolhasSemConferencia`, `vigenteEm`, `contextoDoEvento`, `folhasDoMarco`, `nivelDoWorkflow`, `ErroReferencia` e o tipo `ResultadoReferencia`). O export do `diagnosticar` segue igual, e o `index.ts` continua sem efeito colateral ao importar. O código novo tem parecer próprio (`docs/reviews/052-f2-referencia.md`).
- `server/package.json`: sem mudança desde `64644b1` (o diff vem vazio); nenhuma dependência nova.
- `docs/architecture/fontes/businessmap-conferencia.json`: o campo novo `excecoes_papel_trabalho` (6 exceções da pergunta 2 do dono, 2026-10-31) e duas notas. É dado de configuração da F2; o script da WS1 não lê esse arquivo.

Já lido e fora do delta: o código e os testes da WS1, sem mudança. Segurança e QA renovam os pareceres deles em paralelo (E2.41 e E2.42). Conclusão: a mudança não afeta o script da WS1; nenhum achado novo, e o parecer segue aprovado em `da4919a`.

## Renovação por delta (E2.30, 2026-10-31)

Motivo: o mesmo das renovações anteriores, parecer desatualizado por arquivo da WS1 que mudou depois dele; aqui, a F1 mexeu no `server/package.json` e no `server/src/modulos/businessmap/index.ts`. Delta lido, e só ele: `git diff f24c3a9..0714135 -- server/package.json server/src/modulos/businessmap/index.ts`.

- `server/package.json`: uma linha nova, o script `bm:spike` (`tsx src/entradas/spike-businessmap.ts`). O `bm:diagnostico` da WS1 segue igual; nenhuma dependência nova.
- `server/src/modulos/businessmap/index.ts`: dois exports novos (`executarSpike` com o tipo `ResultadoSpike`, e `ARQUIVO_CONFERENCIA`). O export do `diagnosticar` segue igual, e o `index.ts` continua sem efeito colateral ao importar.

Já lido e fora do delta: o código e os testes da WS1, sem mudança. O código novo da F1 tem parecer próprio (`docs/reviews/052-f1-spike.md`, aprovado em `d242f2a`). O QA renovou o dele sobre o mesmo commit (`docs/qa/052-ws1-estrutura.md`, E2.29, `29f3d38`). Conclusão: a mudança não afeta o script da WS1; nenhum achado novo, e o parecer segue aprovado em `0714135`.

## Renovação por delta (E2.21, 2026-10-31)

Motivo: o parecer ficou desatualizado pelo `.env.example`, que mudou depois do commit `47ea60b`. O `git log -- .env.example` mostra dois commits novos desde então: `2303cd2` (bloco do BusinessMap, F0 do 052) e `f24c3a9` (merge da `develop` com o bloco do Acelerato, do `4e7a180`, PR 175, E2.19). Delta lido: só o `.env.example` em `f24c3a9`, linhas 25 a 44.

- O bloco do BusinessMap (`BUSINESSMAP_URL_BASE`, `BUSINESSMAP_APIKEY` e mais quatro variáveis) e o bloco do Acelerato (`ACELERATO_MYSQL_*`, todas comentadas) estão separados, cada um com o seu comentário de pedido e de ADR. Nenhuma variável é compartilhada entre as duas fontes.
- Só nomes, sem valor de credencial. As duas únicas com valor (`ACELERATO_MYSQL_MAX_EXEC_MS` e `ACELERATO_MYSQL_MARGEM_HORAS`) são limites operacionais.
- O script da WS1 lê só `BUSINESSMAP_URL_BASE` e `BUSINESSMAP_APIKEY`, que continuam com os mesmos nomes. Por isso a mudança não afeta o script.

Já lido e fora do delta: o código e os testes da WS1, sem mudança. A segurança renovou o parecer dela sobre o mesmo commit (`docs/security/052-ws1-estrutura.md`, E2.20, `7c52a97`). Conclusão: nenhum achado novo, e o parecer segue aprovado em `f24c3a9`.

## Renovação por delta (E1.26, 2026-10-30)

Motivo: o `forge-check pr 052-integracao-businessmap` marcou este parecer como desatualizado porque a ADR 0015 mudou depois dele (revisão 1 da S-22, commits `52dfb30` e `485df6a` da `docs/052-plano-hierarquia`). O `forge-check delta --parecer` não roda aqui (`22af869` não é ancestral da branch, que nasceu do squash `11141d7`); o delta lido foi `git diff 11141d7 47ea60b -- docs/architecture/adr/0015-bibliotecas-e-praticas-do-back-end.md`, e só ele.

Lido: a linha "Revisão 1" do cabeçalho, a linha "HTTP de saída do BusinessMap" da tabela, a linha do `axios` em "Não adotar", o item "Timeouts em tudo", a linha S-22 e a seção "Revisão 1 (2026-10-30)" com o critério de reversão. Já lido e fora do delta: todo o código e os testes da WS1 (rodadas anteriores), sem mudança desde `11141d7`.

Conferência do script da WS1 contra a revisão: `diagnostico.ts` já usa `fetch` nativo, sem ky e sem p-throttle (`server/package.json` não tem nenhum dos dois); não segue redirect (`redirect: 'error'`, :112, mesmo efeito do 3xx em erro que a ADR exige numa volta); o erro de rede lê só o `code` do `cause` (:165) e não o propaga; só GET. O alcance da revisão 1 é o cliente do coletor em `plataforma/http.ts` (F0); o script de diagnóstico é manual, anterior à F0 e fora desse alcance. Conclusão: a mudança da ADR 0015 não afeta o script da WS1; nenhum achado novo.

## Revalidação (volta 1, delta)

Intervalo do delta: `c2f20382eb32f7a35228a44faa7b9070e086da6c..22af8695311a303f81760fbaac79c307664760d5` (1 commit de código, `22af869`; o `1bc1c52` seguinte só traz o parecer de segurança). O `forge-check delta --parecer docs/reviews/052-ws1-estrutura.md` listou e eu li só isto:
- `docs/integracao/businessmap-api-configuracao.md:150`
- `server/src/modulos/businessmap/diagnostico.ts`: 46-53, 55, 136, 151, 173 e 310
- `server/tests/diagnostico-businessmap.test.ts`: 285-297 e 302-312

Já lido na primeira rodada e fora do delta: o resto do `diagnostico.ts`, a entrada em `entradas/`, o `index.ts`, o `scripts/bm-diagnostico.sh`, o `package.json` e o resto dos testes.

Saída de ferramenta: `pnpm run pronto` da raiz da worktree, uma vez, rc=0. No `server`: 28 arquivos de teste aprovados e 15 pulados (os `*.pg.test.ts`, sem banco), 621 testes aprovados (2 a mais que na primeira rodada); cobertura de 100% em instruções (1446/1446), ramos (899/899), funções (375/375) e linhas (1173/1173). `docs:check` ok (800 páginas), web dentro do orçamento.

Achados da primeira rodada:
- A1 resolvido. O teste "302 para outro host" (tests:290) sobe um segundo servidor e confere 0 requisições nele, a seção `indisponivel` e a ausência da chave na saída. O mesmo teste fecha o A2 da segurança.
- A2 resolvido. O §8 diz agora 3 tentativas no total, com espera de 1 s e 4 s, o 429 com até 5 esperas por caminho e a mensagem `limite de 429 esgotado`, o que bate com o código (:145, :173, :174).
- A3 resolvido. A mensagem do 429 persistente diz `limite de 429 esgotado`, e o teste da linha 285 afirma esse texto.
- A4 segue para o PR da E1.19, com o número atualizado (abaixo).

Correção do A1 da segurança: `urlSegura` (:47) exige `https:` e aceita `http:` só em `127.0.0.1`, `localhost` e `[::1]` (o `hostname` do WHATWG traz os colchetes no IPv6, então a comparação está certa). O teste da linha 302 recusa `http://` de host comum, `http://10.0.0.1` e `ftp://127.0.0.1` com código 2 e só o nome da variável, e aceita https e os três loopbacks. Cobertura de 100% no arquivo, pela saída acima. A3 da segurança: o cabeçalho (:310) promete agora "sem campos de pessoa" e pede para conferir os nomes de quadro, coluna e raia antes de colar.

Sem regressão no delta: a troca do texto da mensagem não muda tipo de erro nem código de saída; o `refine` só estreita a validação que já existia.

## Achados
- A4 (recomendado) docs/reviews/052-ws1-estrutura.md:1 · teto M14: 765 linhas de código e teste (numstat de 9aa6b29..22af869). O corpo do PR leva `teto: excedido, 765 linhas, script de diagnóstico único: lógica, entrada e testes contra servidor falso`. Aceito por mim; sem a linha, vira bloqueante.
- A5 (recomendado) server/src/modulos/businessmap/diagnostico.ts:151 · `limite429` não volta a falso no `catch` de erro de rede: 429 esgotado seguido de 2 erros de rede sai como "erro de rede (limite de 429 esgotado)". Zerar no `catch` ou derivar da última falha. Só texto; não devolve.

## Parecer
Aprovado no commit `22af869`. A1 a A3 resolvidos, sem regressão; A4 fica para o corpo do PR da E1.19; A5 é recomendação. Pontos conferidos na primeira rodada e que seguem valendo:
- O Entregar da E1.15 está cumprido. A lógica fica em `modulos/businessmap/diagnostico.ts` e a entrada fina em `entradas/` (fora da cobertura, como o `vitest.config.ts` define). O `bm:diagnostico` chama `scripts/bm-diagnostico.sh`, que carrega o `.env` como o `db.sh`.
- Cliente só GET numa lista fechada (`CAMINHOS_PERMITIDOS`, testada), regex que recusa antes da rede, pedidos em sequência dentro do limite por minuto, `redirect: 'error'`.
- Allow-list na saída: campo customizado só com `field_id`, `name` e `type`; o teste injeta campos de pessoa e `allowedValues` e confere que nenhum aparece.
- Chave só no cabeçalho; toda mensagem passa pelo `limpar`; o teste confere a ausência da chave no stdout e no stderr em todos os caminhos de erro.
- Linha do `server/src/modulos/businessmap/index.ts`: fica (interface pública do módulo, sem efeito colateral ao importar).
- Regras invioláveis e ADR 0020: sem cards, sem `/users`, sem valores de campo, sem métrica por pessoa; nada gravado na base; BusinessMap sozinho.
- Commits em Conventional Commits em português, com `Cartão: K-185`; um tema por commit.
- Segurança: o parecer do security-engineer (`docs/security/052-ws1-estrutura.md`, aprovado em `1bc1c52`) não é refeito aqui.
