---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o22-coleta
commit: 6a8adeea58e1f14cea78b94cce60a83cbaf372e1
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: B7a do O22, coleta do primeiro toque (E7.164, revalidação E7.189)

Propósito: dizer se o código do B7a (fronteira, cliente e normalizador do primeiro toque do O22) cumpre a ADR 0020 revisão 6, o parecer `docs/security/105-o22-adr.md` (A1 a A6) e o modelo de ameaças `docs/security/105-o22-primeiro-toque-ameacas.md` (R-T1 a R-T9, casos de abuso 1 a 15). Público: node-backend, qa-engineer, tech-lead, Jarvis. Primeira passada: diff `369cb3d7..3c2ddba0`. Revalidação (volta 1, E7.189): delta `3c2ddba0..6a8adeea` lido por `forge-check parecer delta`, testes do toque rodados localmente na cabeça `6a8adeea` e a sonda S1 repetida.

**Resumo.** **Aprovado.** Na volta 1, A1 (redact da chave no topo) e A3 (consulta vazia própria de `/cards/{id}/comments`) foram corrigidos com teste; A2 (teto de páginas local tratado como fatal) segue recomendado, sem mudança, para o B7b. A mudança da guarda estática do papel da aba Apontamento (`toque-grants-estatico.test.ts`) estreita a exceção: antes as duas tabelas `ctl_` eram puladas inteiras, agora só `estado` e `motivo` nelas, o que endurece o R-T5. A mudança em `contaComoToque.ts` é só formatação (mesma lógica, conferida no delta). Nenhuma coluna, tabela ou log novo grava pessoa.

## Gatilhos
Dado pessoal na fronteira (id de pessoa nas revisões, e-mail de terceiro no autor do comentário, texto livre), caminho novo na lista fechada do cliente com a credencial do dono (`/cards/comments`), mudança no `redact` do logger. Sem migração nem GRANT novo nesta etapa (B7b).

## Achados
- A1 (recomendado) server/src/plataforma/log.ts:39 · corrigido na volta 1: user_id, author, text, attachments, comment, comentario, realname e responsavel_nome sem prefixo em CAMINHOS_REDIGIDOS, com teste no log.test.ts (um caso por chave); sonda S1 repetida sai redigida.
- A2 (recomendado) server/src/modulos/businessmap/toque-leitura.ts:12 · limite-paginas local (50 páginas, :34) é tratado como fatal: um lote de comentários ou um card com revisões acima de 50 páginas para a execução inteira todo dia (sonda S4). Tipo próprio, falha do lote ou do card. Sem mudança na volta 1; fica para o B7b.
- A3 (recomendado) server/src/plataforma/http.ts:269 · corrigido na volta 1: /cards/{id}/comments usa CONSULTA_VAZIA (:111), qualquer parâmetro recusado antes da rede; teste em toque-fronteira.test.ts (board_ids, card_ids, per_page, page, fields recusados, sem pedido; sem consulta passa).

## Sondas

## Detalhe dos achados
**A1, redact da chave no topo (corrigido).** Evidência: `server/src/plataforma/log.ts:38` a `:46` acrescenta os oito caminhos sem prefixo, exatamente a lista da correção mínima da primeira passada. Teste: `server/tests/log.test.ts`, bloco "a chave no topo do objeto de log também é redigida", um caso por chave, com marcador. Sonda S1 repetida na cabeça `6a8adeea` (`log.info({ text: 'MARC1', user_id: 'MARC2', author: { value: 'MARC3' }, comment: 'MARC4' })` com `opcoesLog`): nenhum marcador na saída. Nenhum log do código atual usa essas chaves no topo com valor legítimo (busca em `server/src`), então a redação não apaga informação operacional.

**A2, teto de páginas local tratado como fatal (aberto, recomendado).** Evidência: `toque-leitura.ts:34` lança `limite-paginas` ao passar de 50 páginas numa leitura; `:12` põe `limite-paginas` em `FATAIS`, então `lerLote` relança e `lerToqueDoCard` propaga. O tipo é o mesmo do teto de páginas da execução do cliente (`http.ts`, `listarPaginas`), que é de fato fatal; aqui o teto é de uma leitura só. Sonda S4 (primeira passada): servidor falso com `all_pages: 60` faz `lerComentariosDoLote` lançar `limite-paginas`. Caminho: não há atacante externo; um card com muitos comentários (ou revisões) mantém a coleta parada todo dia, porque volta na frente da fila (mesma família de R-T8 e do A5 do B6). Sem vazamento: só disponibilidade. Severidade: baixa. Correção mínima: tipo próprio para o teto local (ou tratamento antes do `FATAIS`): no lote de comentários, dividir como em `limite-bytes` e, com um card só, marcar o card com código; nas revisões, falha do card (não lido, contado), nunca parada da execução. Teste com `all_pages` acima de 50 nos dois caminhos. Esforço P. Dono: node-backend; teste: qa-engineer. Dimensão nova de T9 na matriz do modelo de ameaças (tamanho em páginas, além de bytes).

**A3, consulta vazia de `/cards/{id}/comments` (corrigido).** Evidência: `http.ts:111` define `CONSULTA_VAZIA = {}`; `montarAlvo` a escolhe para `/^\/cards\/\d+\/comments$/` (`http.ts:269` e `:270`), e o laço de consulta recusa qualquer nome fora dela com `Object.hasOwn` (sem herança de protótipo). O spike chama `ler(..., '/cards/${e.id}/comments')` com a consulta padrão vazia (`spike.ts:151` e `:263`), então continua passando. Teste: `toque-fronteira.test.ts`, "/cards/{id}/comments (spike F1) não aceita parâmetro algum", com `pedidos` vazio depois das cinco recusas (recusa antes da rede).

**Observação sem achado.** `LISTA_IDS` (`http.ts:33`) aceita `0` e zero à esquerda em `card_ids`; o único chamador de `/cards/comments` (`lerComentariosDoLote`) valida antes com `ID_DE_CARD`. Sem efeito de segurança (o filtro continua presente).

## Conferência do parecer do B6 e do modelo de ameaças
- **A1 / R-T3 (obrigatório): cumprido.** `CONSULTA_REVISOES` só com `page`; `/revisions/{n}` fora do padrão. Teste: caso 4 em `toque-fronteira.test.ts`.
- **A2 / R-T2 (obrigatório): cumprido.** Comentário de card fora do lote é descartado e contado como `toque_forma`, sem valor. Teste: caso 5 em `toque-leitura.test.ts`.
- **A3 / R-T6 (obrigatório): cumprido.** Erros do B7a com texto fixo e caminho; falha do lote vira código por tipo; redact em um e dois níveis, dentro de array e, desde a volta 1, no topo.
- **A4 / R-T5 (obrigatório): cumprido no que cabe ao B7a, e mais estrito na volta 1.** `toque-grants-estatico.test.ts` agora confere também as tabelas `bm.ctl_apontamento_cobertura` e `bm.ctl_coleta`, pulando nelas só `estado` e `motivo` (colunas genéricas dessas tabelas); antes elas eram puladas inteiras. O `permission denied` em banco (casos 13 e 14) é do B7b.
- **A5 / R-T8: cumprido na parte do B7a** (divisão do lote por bytes, caso 15). Tirar da frente o card que falha em execuções seguidas é do B7b.
- **A6: aplicado na volta 1** (A3 acima).
- **R-T1: cumprido.** `CONSULTA_COMENTARIOS` (`card_ids`, `page`) e recusa sem `card_ids`. Casos 1 a 3.
- **R-T4: cumprido.** `CAMPOS_TOQUE` única, registro construído campo a campo só com escalares, nenhum espalhamento do objeto lido.
- **R-T7:** interface, B8. **R-T9:** Jarvis, antes do B7c.
- **Casos de abuso 9 a 12:** `contaComoToque` com property tests (26 testes); a volta 1 só reformatou `contaComoToque.ts` e o teste.
- **Cliente:** continua só GET, sem redirect, chave só no cabeçalho, erro sem corpo; nenhuma escrita no BusinessMap.

## Provas
- Primeira passada: leitura do diff `369cb3d7..3c2ddba0`; sondas S1 a S4 com servidor falso (S1 marcador no log, S2 alvo montado com `board_ids` e `per_page`, S3 `card_ids=0,00` aceito pelo cliente, S4 `limite-paginas` lançado). Nenhuma sonda prova bloqueante; por isso o bloco `## Sondas` fica vazio.
- Revalidação: `forge-check parecer delta docs/security/105-o22-coleta.md`, intervalo `3c2ddba0..6a8adeea`, no domínio `contaComoToque.ts`, `http.ts`, `log.ts` (lidos inteiros no delta); testes alterados lidos (`log.test.ts`, `toque-fronteira.test.ts`, `toque-grants-estatico.test.ts`).
- Testes locais na cabeça `6a8adeea`: `log`, `toque-fronteira`, `toque-grants-estatico`, `toque-leitura`, `http` do servidor: 5 arquivos, 113 testes passaram; `contaComoToque.test.ts`: 26 passaram. Sonda S1 repetida: redigido.
- Suíte inteira: fica para o CI. Run 43866989872 do push de `6a8adeea`: filtro, rapida, testes, banco, build, imagem, openapi e seguranca com sucesso; e2e e perf pulados no push. Sem PR para a branch; este parecer não afirma CI verde do PR.

## Plano em cartões
- node-backend (B7b): A2.
- node-backend e qa-engineer (B7b): casos 13 e 14 em banco; R-T8 parte da fila.
- Jarvis: R-T9 antes do B7c.
- security-engineer: parecer do B7b (migração, GRANT, carga).

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura estática, testes locais do toque e sonda com o logger da cabeça. Lacunas: o varredor de segredos, o de dependências e o SAST não estão no PATH desta estação; o job de segurança do CI os cobre.
