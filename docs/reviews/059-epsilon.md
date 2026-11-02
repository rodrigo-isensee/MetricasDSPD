---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-dicionario-radicais
commit: 387b1fedc466cb010d339235d165c963cdc7ddfb
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 059-aba-apontamento, dicionário em radicais (E2.76, K-193)

**Veredito: aprovado** em `387b1fe`. A troca atende ao A1 do QA da trilha B (`docs/qa/059-alfa.md`) e à decisão do dono de 2026-11-02 (termos em radicais). Cada radical novo casa as variações comuns sem pegar palavra de outro sentido, fora o residual aceito de `test`. Os termos que ficam inteiros têm motivo em `docs/architecture/server.md`, e os testes provam as duas direções. A versão nova entra pela vigência do `ref:sync`, sem sobrescrever a anterior. Os três achados são recomendados e não devolvem a entrega.

## Escopo lido
- `git diff origin/develop...origin/feature/059-dicionario-radicais`, um commit (`387b1fe`) e 3 arquivos, todos lidos por inteiro: `docs/architecture/fontes/apontamento-dicionario.json` (+6 -6), `docs/architecture/server.md` (+1 -1, o parágrafo do `bm:ref-sync-apontamento`) e `server/tests/apontamento-dicionario.test.ts` (+53 -3).
- Para conferir, li sem diff: `termosQueCasam` e `palavrasDe` em `packages/metricas/src/coletor/classificarApontamento.ts` (início de palavra por `startsWith` sobre palavras normalizadas, sem acento), a migração `0030_bm_ref_apontamento_vigencia.ts` (CHECK `vigente_ate >= vigente_de`, único parcial só no vigente) e os testes de vigência que já existem (`apontamento-dicionario.test.ts:192`, `:311` e `apontamento-dicionario.pg.test.ts:126`).

## Radicais (um por um)
- `test`: casa teste, testes, testar, testando e testado. Não casa protesto nem contesto, porque o casamento é por início de palavra. O residual testemunha e testamento é o risco aceito, já registrado em `server.md`. O termo antigo `teste` já casava testemunha, então a troca acrescenta só testamento, testa e o inglês testing (o último é do mesmo sentido). O custo continua sendo um subgrupo errado num comentário raro (A1).
- `analise`, `analisa`, `analisei` e `analisou`: cobrem análise, análises, analisar, analisando e analisou sem pegar analista, como a doc explica. O `analisei` é redundante, porque toda palavra que começa com `analisei` começa com `analise` (A2).
- `diagnos`, `configur`, `infraestrutur`, `apoi`, `ajust`, `correc`, `corrig`, `criac` e `rotin`: conferi as palavras de outro sentido mais próximas (confirmar, conferir, infração, apontamento, apostila, justificativa, reajuste, corrente, correto, criança, criativo, rota, rotativo). Nenhuma casa. Não achei palavra corrente de outro sentido que comece por esses radicais.
- O caminhar duplo de `termosQueCasam` continua correto com termos que são prefixo um do outro (`analisa` < `analise` < `analisei`). As palavras que começam com um termo vêm logo depois dele na ordem, e o índice só avança.
- A soma de termos do teste (`2 + 4 + 5 + 3 + 1 + 3 + 1 + 10`) bate com o arquivo, e todos os termos passam no CHECK `^[a-z0-9]{2,40}$` da 0026.

## Termos inteiros
- `server.md` dá o motivo de `rdm`, `gmud`, `call`, `meet`, `mudanca`, `fonte`, `ambiente`, `debug`, `implement`, `alinhament`, `homolog`, `document` e `desenvolv`. O `script` fica inteiro e o teste diz isso (`:104`), mas a lista da doc não o cita (A3). `reuni` não mudou e já era radical.

## Testes nas duas direções
- Cada radical trocado tem uma linha com as variações que casam e as palavras de outro sentido que seguem em `execucao-tecnica` (`:68-78`). O A1 do QA tem caso próprio, com singular, plural, acento, maiúsculas, frase e a borda `coreuniao` (`:99-103`). Os termos inteiros casam o próprio plural, e calendário, cálculo, font-size e mudo não casam (`:104-112`). Os testes passam pelo dicionário carregado do arquivo real (`planejarComoBanco` e `carregarDicionario`), não por uma cópia.
- Em `:89`, o teste troca `analise` por `analisa` na conferência de presença. Funciona, mas lê mal: a linha `analise` da tabela já está no arquivo, e a troca esconde que o que se quer provar é a presença de `analisa`. Não vira achado.

## Versão e vigência
- `versao` passa a `2026-11-02-v2`, e os dois testes que fixavam a v1 foram atualizados. A referência da versão de critério leva a versão do arquivo e o sha256 (`059:ref-apontamento:<versao>:<sha256>`), então a carga nova registra uma versão nova (T2.6) sem tocar na anterior.
- Pelo mecanismo da 0030, já coberto por teste, a carga da v2 fecha `teste`, `diagnostic`, `configuracao`, `infraestrutura`, `apoio`, `ajuste`, `correcao` e `criacao` só com `vigente_ate`. Ela também abre os radicais e `analisa`, `analisei`, `analisou` e `corrig`. Nada é apagado. Se a v1 e a v2 forem carregadas no mesmo dia, a linha fechada fica com `vigente_de = vigente_ate`, que o CHECK da 0030 aceita. A ação do dono depois do merge (rodar `bm:ref-sync-apontamento`) está no registro do pedido.

## Ferramentas, teto e outros pareceres
- O `docs/engineering/praticas.md` não tem regra "decidida por: `<comando>`". Segue a pendência do tech-lead com o arquiteto, a mesma de `059-alfa.md` e `059-beta.md`, sem review manual de lint ou formatação.
- CI verde em `387b1fe` (run 41497940815, `completed:success`). Não refiz a suíte. O autor relatou o pronto verde, 13 falhas antes da troca e 45 testes verdes depois.
- Decisão M14: `git diff --numstat --no-renames origin/develop...HEAD` dá 68 linhas de código, teste e dado (12 no JSON e 56 no teste), sem o `.md`. Fica abaixo do teto, com um comportamento só e sem precisar da linha `teto: excedido`.
- Segurança: não há gatilho, porque só mudam o conteúdo do dicionário e os testes. Nada de pessoa, rota, papel ou consulta, como diz a decisão técnica de 14:49.
- Commit: Conventional Commits em português, com `Cartão: K-193`.

## Achados
- A1 (recomendado) server/tests/apontamento-dicionario.test.ts:68 · o residual aceito de test (testemunha, testamento) não tem teste que o fixe. Um caso que afirme que testemunha cai em testes deixaria o risco documentado como comportamento e acusaria a mudança se o termo trocar.
- A2 (recomendado) docs/architecture/fontes/apontamento-dicionario.json:20 · analisei é redundante, porque toda palavra que começa com analisei começa com analise. Pode sair na próxima troca de arquivo, sem efeito na classificação.
- A3 (recomendado) docs/architecture/server.md:224 · script fica inteiro (o teste em :104 o lista entre os inteiros), mas a lista de termos inteiros da doc não dá o motivo dele.
