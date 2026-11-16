---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o22-coleta
commit: 3c2ddba09a13f4bcaf94644e6c3003cb09f0f3c2
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: B7a do O22, coleta do primeiro toque (E7.164)

Propósito: dizer se o código do B7a (fronteira, cliente e normalizador do primeiro toque do O22) cumpre a ADR 0020 revisão 6, o parecer `docs/security/105-o22-adr.md` (A1 a A6) e o modelo de ameaças `docs/security/105-o22-primeiro-toque-ameacas.md` (R-T1 a R-T9, casos de abuso 1 a 15). Público: node-backend, qa-engineer, tech-lead, Jarvis. Revisão estática do diff `369cb3d7..3c2ddba0` (cabeça `3c2ddba0`), mais os testes do toque rodados localmente e três sondas.

**Resumo.** **Aprovado.** Os quatro obrigatórios do parecer do B6 estão cumpridos com teste: A1 (consulta fechada das revisões), A2 (comentário fora do lote descartado e contado), A3 (erro só com caminho e código; nenhum validador que ecoe valor) e A4 (guarda estática do papel da aba Apontamento; o teste de banco fica no B7b). A5 está cumprido na parte do B7a (divisão do lote por bytes). A6 não foi aplicado, com motivo registrado no código (`http.ts:23`); a decisão é aceitável como recomendação, e há uma alternativa que não quebra o spike (A3 abaixo). Nenhuma coluna, tabela ou log novo grava pessoa: `user_id`, `author`, `text` e `attachments` morrem na fronteira (`allow-list.ts`) ou em `contaComoToque`, que devolve só booleano. Três recomendações novas, nenhuma bloqueante.

## Gatilhos
Dado pessoal na fronteira (id de pessoa nas revisões, e-mail de terceiro no autor do comentário, texto livre), caminho novo na lista fechada do cliente com a credencial do dono (`/cards/comments`), mudança no `redact` do logger. Sem migração nem GRANT novo nesta etapa (B7b).

## Achados
- A1 (recomendado) server/src/plataforma/log.ts:30 · o redact cobre um e dois níveis, mas não a chave no topo: log.info({ text, user_id, author }) sai sem redação (sonda S1). Acrescentar text, user_id, author e attachments sem prefixo, com teste.
- A2 (recomendado) server/src/modulos/businessmap/toque-leitura.ts:12 · limite-paginas local (50 páginas, :34) é tratado como fatal: um lote de comentários ou um card com revisões acima de 50 páginas para a execução inteira todo dia (sonda S4). Tipo próprio, falha do lote ou do card, como a de bytes.
- A3 (recomendado) server/src/plataforma/http.ts:24 · A6 do B6 não aplicado: /cards/{id}/comments segue com a consulta genérica e aceita board_ids e per_page (sonda S2). O spike chama o caminho sem consulta (spike.ts:263): consulta vazia própria fecha a superfície sem quebrá-lo.

## Sondas

## Detalhe dos achados
**A1, redact da chave no topo.** Evidência: `server/src/plataforma/log.ts:30` a `:37` lista `*.user_id`, `*.author`, `*.text`, `*.attachments` e as formas `*.*.`; no logger, a chave do objeto mesclado no topo (`log.info({ text })`) não casa `*.text`. Sonda S1 (abaixo, em Provas) mostrou o marcador no log. Caminho: código futuro que registra o comentário cortado ou um item cru diretamente (`log.warn({ ...item }, 'forma inesperada')`) grava e-mail de terceiro ou texto no log do contêiner. Hoje nenhum código do B7a loga objeto lido (conferido em `toque.ts`, `toque-leitura.ts`), por isso é defesa secundária, não vulnerabilidade. É o mesmo desenho dos caminhos do pedido 059 (`*.comment` sem a forma do topo), então a correção vale para os dois grupos. Severidade: baixa. Correção mínima: acrescentar a `CAMINHOS_REDIGIDOS` os caminhos sem prefixo `user_id`, `author`, `text`, `attachments`, `comment`, `comentario`, `realname`, `responsavel_nome`, e um caso no `log.test.ts` com cada um no topo. Esforço P. Dono: node-backend.

**A2, teto de páginas local tratado como fatal.** Evidência: `toque-leitura.ts:34` lança `limite-paginas` ao passar de 50 páginas numa leitura; `:12` põe `limite-paginas` em `FATAIS`, então `lerLote` relança (`:71`) e `lerToqueDoCard` propaga. O tipo é o mesmo do teto de páginas da execução do cliente (`http.ts`, `listarPaginas`), que é de fato fatal; aqui o teto é de uma leitura só. Sonda S4: servidor falso com `all_pages: 60` faz `lerComentariosDoLote` lançar `limite-paginas`. Caminho: não há atacante externo; um card com muitos comentários (ou revisões) mantém a coleta parada todo dia, porque volta na frente da fila (mesma família de R-T8 e do A5 do B6). Sem vazamento: só disponibilidade. Severidade: baixa. Correção mínima: tipo próprio para o teto local (ou tratamento antes do `FATAIS`): no lote de comentários, dividir como em `limite-bytes` e, com um card só, marcar o card com código; nas revisões, falha do card (não lido, contado), nunca parada da execução. Teste com `all_pages` acima de 50 nos dois caminhos. Esforço P. Dono: node-backend; teste: qa-engineer. Entra na matriz do modelo de ameaças como dimensão nova de T9 (tamanho em páginas, além de bytes).

**A3, decisão sobre o A6 do B6.** Evidência: `http.ts:23` registra que `/cards/{id}/comments` fica aberto porque o spike F1 o usa; `montarAlvo` (`http.ts:256` a `:266`) cai em `CONSULTA_PERMITIDA` para ele. Sonda S2: `get('/cards/9/comments', { consulta: { board_ids: '1', per_page: '200' } })` monta o alvo sem recusa. O spike chama `ler(..., '/cards/${e.id}/comments')` sem consulta (`server/src/modulos/businessmap/spike.ts:263`). Caminho: código futuro lê comentários por card fora da regra do R6-3. Severidade: informativa. Correção mínima: consulta vazia própria para `/^\/cards\/\d+\/comments$/` (qualquer parâmetro recusado antes da rede), com caso no `toque-fronteira.test.ts`; o spike continua passando. Esforço P. Dono: node-backend, se o arquiteto concordar; senão fica como está, registrado aqui.

**Observação sem achado.** `LISTA_IDS` (`http.ts:33`) aceita `0` e zero à esquerda em `card_ids`; o único chamador de `/cards/comments` (`lerComentariosDoLote`) valida antes com `ID_DE_CARD` (`toque-leitura.ts:107`, teste "lote vazio, com mais de 200 ids, repetido ou com id fora da forma"). Sonda S3 confirmou que o cliente sozinho aceita `card_ids=0,00`; sem efeito de segurança (o filtro continua presente).

## Conferência do parecer do B6 e do modelo de ameaças
- **A1 / R-T3 (obrigatório): cumprido.** `CONSULTA_REVISOES` só com `page` (`http.ts:106`), escolhida em `montarAlvo` (`http.ts:264` e `:265`); `/revisions/{n}` fora do padrão (`http.ts:24`). Teste: caso 4 em `toque-fronteira.test.ts:95`.
- **A2 / R-T2 (obrigatório): cumprido.** `toque-leitura.ts:92`: comentário de card fora do lote é descartado e contado como `toque_forma` com caminho `comments[].card_id`, sem valor. Teste: caso 5 em `toque-leitura.test.ts:104`.
- **A3 / R-T6 (obrigatório): cumprido.** O normalizador não usa validador com mensagem; todo erro do B7a sai de texto fixo com o caminho da chamada (`toque-leitura.ts:27`, `:34`, `:44`, `:108`), e a falha do lote vira código por tipo (`toque-leitura.ts:64`, nunca a mensagem). Forma inválida do autor não gera erro: `contaComoToque` devolve `false` (caso 7, `toque-fronteira.test.ts:247`). Redact em um e dois níveis e dentro de array provado em `log.test.ts` (12 casos); a lacuna do topo é o A1 acima, recomendado.
- **A4 / R-T5 (obrigatório): cumprido no que cabe ao B7a.** `toque-grants-estatico.test.ts` barra as colunas do toque em `COLUNAS_API_APONTAMENTO` e as tabelas do toque na lista do papel; o `permission denied` em banco (casos 13 e 14) é do B7b, com a migração.
- **A5 / R-T8: cumprido na parte do B7a.** `toque-leitura.ts:73`: `limite-bytes` divide o lote ao meio até um card; o card que sozinho passa do teto fica com o código. Teste: caso 15 em `toque-leitura.test.ts:141`. Tirar da frente o card que falha em execuções seguidas é do B7b (fila e controle).
- **A6: não aplicado**, motivo registrado em `http.ts:23`; ver A3 acima.
- **R-T1: cumprido.** `CONSULTA_COMENTARIOS` (`card_ids`, `page`) e recusa sem `card_ids` (`http.ts:283`). Testes: casos 1 a 3 em `toque-fronteira.test.ts:71` e `:84`.
- **R-T4: cumprido.** `CAMPOS_TOQUE` única (`allow-list.ts`), registro construído campo a campo só com escalares (`cortarRevisaoDoToque`, `cortarComentarioDoToque`), nenhum espalhamento do objeto lido; `ResultadoToque` só com card, revisão, estado, motivo em código, eventos (id, instante, booleano) e contagens. Testes: caso 8 e "o resultado não carrega nada além dos escalares" (`toque-fronteira.test.ts:19`, `:30`, `:237`).
- **R-T7:** interface, B8. **R-T9:** Jarvis, antes do B7c.
- **Casos de abuso 9 a 12:** conferência da lista e `contaComoToque` com property tests (`contaComoToque.test.ts`, 26 testes; `toque-fronteira.test.ts:197` a `:231`; caso 11 em `toque-leitura.test.ts:201`).
- **Isolamento de `contaComoToque`:** exportada só por `@metricas-dspd/metricas/coletor` (`packages/metricas/src/coletor/index.ts`), ponto de entrada fora do público e restrito por lint a `server/src/modulos/businessmap/**`.
- **Cliente:** continua só GET, sem redirect, chave só no cabeçalho, erro sem corpo; nenhuma escrita no BusinessMap.

## Provas
- Leitura do diff `369cb3d7..3c2ddba0` e de `server/src/plataforma/http.ts`, `log.ts`, `db/grants.ts` e `server/src/modulos/businessmap/spike.ts` na cabeça revisada.
- Testes do toque na cabeça `3c2ddba0`, locais: `toque-fronteira`, `toque-leitura`, `toque-grants-estatico`, `log` e `http` do servidor: 5 arquivos, 104 testes passaram; `contaComoToque.test.ts`: 26 passaram.
- Sondas (script local que importa os módulos da cabeça, servidor falso, sem rede externa): S1 `log.info({ text: 'MARC1', user_id: 'MARC2', author: { value: 'MARC3' } })` · espera: redigido · obtido: marcador no log (A1). S2 `get('/cards/9/comments', { consulta: { board_ids: '1', per_page: '200' } })` · espera: recusa `consulta` · obtido: alvo montado (A3). S3 `get('/cards/comments', { consulta: { card_ids: '0,00' } })` · obtido: aceito pelo cliente (observação). S4 `lerComentariosDoLote(c, ['1','2'])` com `all_pages: 60` · espera: falha do lote · obtido: `limite-paginas` lançado (A2). Nenhuma sonda prova bloqueante; por isso o bloco `## Sondas` fica vazio.
- Suíte inteira: fica para o CI. Run do push da cabeça (43857367907, `3c2ddba0`): job de segurança, banco, build, imagem e openapi verdes; `rapida` vermelho só por formatação em `contaComoToque.ts` e `contaComoToque.test.ts` (estilo, encaminhado ao tech-lead, não é achado de segurança), e com isso `testes` cancelado. Sem PR para a branch; este parecer não afirma CI verde do PR.

## Plano em cartões
- node-backend (B7b, ou volta curta no B7a se o tech-lead preferir): A1, A2; A3 se o arquiteto concordar.
- node-backend e qa-engineer (B7b): casos 13 e 14 em banco; R-T8 parte da fila.
- Jarvis: R-T9 antes do B7c.
- security-engineer: parecer do B7b (migração, GRANT, carga).

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura estática, testes locais do toque e sondas com servidor falso. Lacunas: o varredor de segredos, o de dependências e o SAST não estão no PATH desta estação; o job de segurança do CI os cobre.
