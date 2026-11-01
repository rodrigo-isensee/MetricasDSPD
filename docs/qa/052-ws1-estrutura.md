---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-fix-coleta
commit: f763d6acffca29233c78966abe44882be10c1daa
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-01
---
# QA: 052-integracao-businessmap (E1.18, script de diagnóstico da WS1, K-185)

Veredito: aprovado, com 2 recomendações que não devolvem. Testado o head `780000b` (script `pnpm run bm:diagnostico` e `server/src/modulos/businessmap/diagnostico.ts`). Obrigações lidas do Entregar das duas entregas do E1.15 (briefs node-backend 1 e 2) e do §8 de `docs/integracao/businessmap-api-configuracao.md`; sem especificação de UX nem contrato de API (ferramenta de linha de comando). Pareceres de segurança (1bc1c52) e de review (780000b) aprovados, lidos só por veredito e achados.

Método: caixa-preta. Servidor falso próprio em `node:http` (127.0.0.1, portas 4701 a 4710) que devolve pessoa e `allowedValues` em todas as respostas e registra método, caminho e cabeçalho `apikey` de cada pedido; chave sentinela de teste. O script real rodou como processo (`tsx src/entradas/diagnostico-businessmap.ts`) com as variáveis só no comando. Não houve leitura nem edição de `.env` (a worktree não tem `.env`, conferido por listagem de nome, o que também impede o `scripts/bm-diagnostico.sh` de sobrescrever as variáveis), nem chamada ao BusinessMap real.

## Achados
- A1 (recomendado) server/tests/diagnostico-businessmap.test.ts:1 · nenhum teste afirma o cabeçalho "sem campos de pessoa; confira os nomes de quadro, coluna e raia antes de colar" (mutante que o encurta sobrevive). A frase existe e saiu certa na execução real; cartão K-186 pode somar a guarda.
- A2 (recomendado) server/src/modulos/businessmap/diagnostico.ts:98 · a redação da chave (`limpar`, também em :281) não tem teste que a faça falhar: as mensagens são montadas só de texto fixo e código de erro filtrado, então hoje é defesa em profundidade sem caminho vivo. Manter e justificar.
- A3 (recomendado) server/src/modulos/businessmap/diagnostico.ts:243 · o nó raiz de `currentStructure` sai como `- (sem campos permitidos)` seguido dos filhos; correto, mas confunde o dono ao ler a seção. Estético.

## Renovação por delta (E2.22, depois da E2.19)
Veredito: aprovado, mantido. Este parecer foi dado sobre `780000b` e ficou desatualizado porque o `.env.example` mudou depois dele: o commit `2303cd2` (F0 do 052) somou o bloco do BusinessMap e o merge `f24c3a9` (E2.19) somou o bloco do Acelerato da develop. Delta conferido (`780000b..f24c3a9`): `server/src/modulos/businessmap/diagnostico.ts`, `server/src/entradas/diagnostico-businessmap.ts`, `scripts/bm-diagnostico.sh` e `server/tests/diagnostico-businessmap.test.ts` não mudaram, então as obrigações e os resultados das tabelas abaixo continuam valendo.

Só o `.env.example` foi relido (ferramenta Read, no head `f24c3a9`): bloco do BusinessMap nas linhas 25 a 32 (`BUSINESSMAP_URL_BASE`, `BUSINESSMAP_APIKEY`, `BUSINESSMAP_QUADROS_IDS` e os três de limite, tempo e página) e bloco do Acelerato nas linhas 33 a 44 (`ACELERATO_MYSQL_*`, comentados), separados por linhas de comentário próprias, sem mistura. As variáveis que o script lê continuam as mesmas e sem valor no exemplo; nenhuma chave nem senha no arquivo. O `.env` não foi lido.

Reexecução: `pnpm --dir /home/rodrigoisensee/MetricasDSPD-052c run pronto` rc=0 (server 869 testes passaram e 106 pulados, cobertura do server 100%; os 30 testes do diagnóstico estão entre eles), o mesmo run registrado no parecer `docs/qa/052-f0-fundacoes.md`. Sem mutante novo: o código do script não mudou, e A1 e A2 do parecer anterior seguem como recomendações.

## Renovação por delta (E2.29, depois da E2.24)
Veredito: aprovado, mantido. O parecer ficou desatualizado porque, na F1, mudaram dois arquivos que ele cobre: `server/package.json` e `server/src/modulos/businessmap/index.ts`. Delta lido (`f24c3a9..0714135`, só esses dois caminhos, ferramenta Read e `git diff`):
- `server/package.json`: entrou uma linha, o script `bm:spike` (`tsx src/entradas/spike-businessmap.ts`). É da F1, não da WS1; nenhum script existente mudou.
- `server/src/modulos/businessmap/index.ts`: dois exports novos, `executarSpike`/`ResultadoSpike` (de `spike.js`) e `ARQUIVO_CONFERENCIA` (de `conferencia.js`). O export de `diagnosticar` e `ResultadoDiagnostico` segue igual.

Conferido que o script da WS1 e suas variáveis seguem iguais: `git diff f24c3a9..0714135` sobre `server/src/modulos/businessmap/diagnostico.ts`, `server/src/entradas/diagnostico-businessmap.ts`, `scripts/bm-diagnostico.sh`, `server/tests/diagnostico-businessmap.test.ts` e `.env.example` não traz nenhuma linha; `bm:diagnostico` continua no `package.json` da raiz (linha 33, `bash scripts/bm-diagnostico.sh`). As obrigações e os resultados das tabelas abaixo continuam valendo, e A1 a A3 seguem como recomendações.

Sem suíte, sem mutantes e sem chamada ao BusinessMap (o `bm:spike` não foi rodado), como pedido; o `bm:spike` é coberto pelo parecer `docs/qa/052-f1-spike.md`. O `.env` não foi lido.

## Renovação por delta (E2.41, depois da F2)
Veredito: aprovado, mantido. O parecer ficou desatualizado porque, na F2, mudou `server/src/modulos/businessmap/index.ts`. Delta lido (`64644b1..da4919a`, só `index.ts`, `server/package.json` e `docs/architecture/fontes/businessmap-conferencia.json`, ferramenta `git diff`):
- `server/src/modulos/businessmap/index.ts`: um bloco de exports novo, da F2, de `referencia.js` (`sincronizarReferencia`, `lerReferenciaReal`, `planejar`, `registrarFolhasSemConferencia`, `vigenteEm`, `contextoDoEvento`, `folhasDoMarco`, `nivelDoWorkflow`, `ErroReferencia`, `ResultadoReferencia`). O export de `diagnosticar` e `ResultadoDiagnostico` segue igual.
- `server/package.json`: sem nenhuma linha no delta (o `bm:spike` já estava em 64644b1).
- `docs/architecture/fontes/businessmap-conferencia.json`: entrou `excecoes_papel_trabalho` (6 folhas dos workflows 191, 212, 242, 248, 250 e 202, decisão do dono de 2026-10-31, pergunta 2) e duas linhas de nota. É da F1/F2 (lista de conferência de colunas), não da WS1.

Conferido que o script da WS1 segue igual: `git diff f24c3a9..da4919a` sobre `server/src/modulos/businessmap/diagnostico.ts`, `server/src/entradas/diagnostico-businessmap.ts`, `scripts/bm-diagnostico.sh` e `server/tests/diagnostico-businessmap.test.ts` não traz nenhuma linha (stat vazio); `bm:diagnostico` continua no `package.json` da raiz (linha 33, `bash scripts/bm-diagnostico.sh`). As obrigações e os resultados das tabelas abaixo continuam valendo, e A1 a A3 seguem como recomendações.

Sem suíte, sem mutantes e sem chamada ao BusinessMap, como pedido. O `.env` não foi lido.

## Renovação por delta (E2.49, depois da F3)
Veredito: aprovado, mantido. O `forge-check pr` deu o parecer por desatualizado porque `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md` mudou (a F3 somou o item 4c das transições e a forma final de `dim_responsavel`). Delta lido (`git diff da4919a..cc8c0cf`, só os caminhos que este parecer cobre):
- ADR 0020: texto da F3 (transições de coluna, `revision_id`, forma final de `dim_responsavel`); não toca o script da WS1 nem a regra de que o diagnóstico não lê cards nem usuários.
- `server/package.json`: uma linha nova, `bm:coleta`; `bm:diagnostico` e os outros scripts não mudaram.
- `server/src/modulos/businessmap/index.ts`: exports novos da F3 (`CAMPOS_TRANSICAO`, `registroTransicao`, `revisionIdDaTransicao`, `transicoesDoCard`, `lerConferencia`, `coletarCards` e afins, `analisarArgumentos`, `etapaReferencia`, `executarColeta`, `projetarUsuarios`, `resolverResponsaveis`); `diagnosticar` e `ResultadoDiagnostico` seguem iguais.

`git diff` sobre `diagnostico.ts`, `server/src/entradas/diagnostico-businessmap.ts`, `scripts/bm-diagnostico.sh` e `server/tests/diagnostico-businessmap.test.ts`: vazio. Reexecução: `vitest run --project unit` dos testes do diagnóstico e dos da F3 (6 arquivos, 99 testes) passou. Sem mutante novo e sem chamada ao BusinessMap; o `.env` não foi lido. O parecer da F3 (`docs/qa/052-f3-coleta.md`) cobre o coletor novo.

## Renovação por delta (E2.80, depois da F4)
Veredito: aprovado, mantido. O `forge-check pr` deu o parecer por desatualizado porque `docs/architecture/data-model.md` mudou na F4. Delta lido (`cc8c0cf..5ec6a4b`, só os caminhos que este parecer cobre, ferramenta `git diff`):
- `docs/architecture/data-model.md`: 8 linhas novas, o bloco "Projeção do BusinessMap" (normalizador e projetor, `fato_transicao`, marcos, descarte, `dim_card_versao`). Só documento da F4; não toca o diagnóstico da WS1, que não lê cards nem usuários.
- `server/package.json`: uma linha nova, `bm:projetar`; `bm:diagnostico` está na raiz e não mudou.
- `server/src/modulos/businessmap/index.ts`: exports novos do projetor e do normalizador e um tipo a mais (`ResultadoComando`); `diagnosticar` e `ResultadoDiagnostico` seguem iguais.

`git diff cc8c0cf..5ec6a4b` sobre `server/src/modulos/businessmap/diagnostico.ts`, `server/src/entradas/diagnostico-businessmap.ts`, `scripts/bm-diagnostico.sh`, `server/tests/diagnostico-businessmap.test.ts` e `.env.example`: vazio (stat vazio). As obrigações e os resultados das tabelas abaixo continuam valendo, e A1 a A3 seguem como recomendações. Sem suíte, sem mutantes e sem chamada ao BusinessMap, como pedido; a suíte da F4 está em `docs/qa/052-f4-projetor.md`. O `.env` não foi lido.

## Renovação por delta (E2.88, depois da correção da coleta)
Veredito: aprovado, mantido. O parecer ficou desatualizado porque `docs/integracao/businessmap-api-configuracao.md` mudou na E2.83. Delta lido (`c0c4aee..f763d6a`, ferramenta `git diff`, só os caminhos que este parecer cobre):
- `docs/integracao/businessmap-api-configuracao.md`: duas linhas novas no §4.2, ambas sobre a listagem de `/cards`: `archived_from` e `discarded_from` com data pura dão 400 e o coletor manda data e hora em UTC; `co_owner_ids` é valor de `expand`, não de `fields`. É documento da coleta (F3), sem relação com os pedidos do diagnóstico, que só lê estrutura (§8) e não lê cards.
- `.env.example`: uma variável nova, `PG_REF_URL` (papel de referência do Acelerato, pedido 056, vindo da develop). O bloco do BusinessMap e as variáveis que o script lê seguem iguais.
- `server/package.json`: uma linha nova, `ac:ref-sync` (056); `bm:diagnostico` está na `package.json` da raiz e não mudou.

`git diff c0c4aee..f763d6a` sobre `server/src/modulos/businessmap/diagnostico.ts`, `server/src/entradas/diagnostico-businessmap.ts`, `scripts/bm-diagnostico.sh`, `server/tests/diagnostico-businessmap.test.ts`, `server/src/modulos/businessmap/index.ts` e `docs/architecture/data-model.md`: vazio. As obrigações e os resultados das tabelas abaixo continuam valendo, e A1 a A3 seguem como recomendações. Sem suíte, sem mutantes e sem chamada ao BusinessMap, como pedido (delta só de documento e configuração alheia ao script); a correção da coleta tem parecer próprio em `docs/qa/052-fix-coleta.md`. O `.env` não foi lido. Parecer regravado pelo papel qa na E2.90, sem mudança de veredito.

## Critério → teste → resultado
Obrigação = item do Entregar (`E1.15` e volta 1).

| Obrigação | Teste (QA, servidor falso) | Fronteira protegida | Resultado |
|---|---|---|---|
| Só GET, só caminhos da lista | `ok`: 8 pedidos, todos GET, em /workspaces, /boards, /boards/{10,11}/workflows e currentStructure, /cardTypes, /customFields | sem /users nem /cards (0 pedidos) | passou |
| Chave só no cabeçalho `apikey` | `ok`: 0 pedidos sem a chave certa; chave em stdout e stderr: 0 em todos os cenários | chave fora de saída, erro e URL | passou |
| https obrigatório; http só em loopback | `http://exemplo.invalid`, `ftp://`, `http://localhost.evil.com`, `http://127.0.0.1.evil.com`, `http://localhost@exemplo.invalid`: rc=2 `variável inválida: BUSINESSMAP_URL_BASE`; `http://127.0.0.1` e `http://[::1]` aceitos | host parecido com loopback, userinfo, esquema | passou |
| 302 para outro host recusado | servidor 4704 responde 302 para 4705: 0 pedidos em 4705, seção `indisponivel`, rc=0 | chave não vai a outro host | passou |
| Allow-list sem campo de pessoa | respostas com e-mail, realname, username, owner, user_id, `allowedValues`, descrição: 0 ocorrências na saída | pessoa e valores de lista descartados | passou |
| 401 e 403 | rc=1, stderr `autenticacao: GET /workspaces respondeu 40x`, 1 pedido (sem repetir) | credencial rejeitada | passou |
| 429 | 1º pedido 429 com retry_after=1: repete e conclui, rc=0 | limite da API | passou |
| 5xx | 12 pedidos (3 tentativas por seção), seções `indisponivel ... HTTP 500 (3 tentativas)`, corpo com a chave não vaza | falha do servidor | passou |
| Erro de rede | porta fechada: `erro de rede ECONNREFUSED (3 tentativas)`, rc=0, sem chave | rede fora | passou |
| Variável obrigatória faltando | sem chave, sem URL, chave só com espaços: rc=2 e nome da variável, nunca o valor | vazio | passou |
| `BUSINESSMAP_QUADROS_IDS` | `11`: só o quadro 11 no relatório e só pedidos a /boards/11; `abc`: rc=2 `variável inválida: BUSINESSMAP_QUADROS_IDS` | filtro e formato inválido | passou |
| Formato não reconhecido | `{foo,bar}`: `formato não reconhecido: foo, bar`, só chaves de topo | resposta inesperada | passou |
| Cabeçalho "sem campos de pessoa; confira ..." | presente no relatório real (linha 3) | texto exato | passou (sem teste automático, A1) |
| `pnpm run bm:diagnostico` ponta a ponta | servidor falso 4710: rc=0, 52 linhas em stdout (banner do pnpm incluso), chave ausente; sem chave: pnpm sai com 1 e repassa `exit code 2` | saída e código | passou |
| Nada gravado, árvore limpa | `git status --porcelain` vazio depois de tudo | n/a | passou |

Observação: o pnpm imprime o banner (`> metricas-dspd@... bm:diagnostico`) no stdout; o dono deve colar só a partir de `# Diagnóstico`. Código de saída via pnpm é 1 para qualquer falha; o 2 do script só aparece na linha de erro do pnpm.

## Mutação no código alterado (manual, em 9 mutantes, revertidos por `git checkout`; árvore limpa)
Rodado `vitest run tests/diagnostico-businessmap.test.ts` (30 testes) com cada mutante.
- M1 `redirect: 'follow'`: morreu. M2 https aceito sempre: morreu. M3 método POST: morreu. M4 campo `email` na allow-list: morreu (3 testes). M6 403 não tratado como autenticação: morreu. M8 filtro de quadros desligado: morreu. M9 lista fechada desligada: morreu.
- M5 redação da chave desligada: sobreviveu (A2, sem caminho vivo). M7 cabeçalho encurtado: sobreviveu (A1).

Vermelho antes do verde: o módulo `diagnostico.ts` não existe na base `9aa6b29`, então todos os testes novos falham por carga na base; o que vale como prova são os 7 mutantes mortos acima. `forge-testes --vermelho` não foi usado (comando da fábrica; sem ele disponível neste ambiente de projeto).

## Suíte
`pnpm run pronto` na raiz da worktree, uma vez, antes do commit: rc=0. Server 621 passaram, 84 ignorados (testes dependentes de banco, já existentes), cobertura 100% (instruções 1446/1446, ramos 899/899, funções 375/375, linhas 1173/1173); web 1228; metricas 1092; mock 258; contratos 161; homolog 73; pesquisa 33; spec-check 14; docs-contratos 102 e `docs:check` ok. Nenhum teste marcado como skip por mim.

## Cenários e resultado real
Resumo nas tabelas acima: 16 obrigações, 16 passaram, 0 bugs, 0 falhas. Acessibilidade e E2E de navegador não se aplicam (sem interface).
