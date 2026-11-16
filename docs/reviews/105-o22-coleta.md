---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o22-coleta
commit: 6a8adeea58e1f14cea78b94cce60a83cbaf372e1
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: O22 B7a, coleta do primeiro toque, fronteira e normalizador (105, E7.165; revalidação E7.187)

O primeiro toque (`3c2ddba0`) revisou o trecho de `369cb3d7` (Base-sha) até `3c2ddba0` (E7.156). Os dois commits do meio (`45105e4f`, ADR 0020 revisão 6; `38288b0c`, parecer de segurança) são documentos já aprovados e servem de referência. São 19 arquivos com +1335/-9. Código e teste somam 956 linhas: passa da orientação M14 por uma fatia só (fronteira, leitura e normalizador). Isso vai explicado no corpo do PR quando ele for aberto.

O primeiro toque foi reprovado só pelo formato (A1). A volta 1 (`6a8adeea`, E7.170) corrige o A1 e também resolve o A4 deste parecer e o A3 da segurança. Esta revalidação aprova a branch.

## O que foi conferido
- **R6-2, consultas fechadas (A1 do parecer de segurança):** `/cards/comments` entrou em `CAMINHOS_PERMITIDOS` (`http.ts:27`) com `CONSULTA_COMENTARIOS` (`card_ids` no formato `LISTA_IDS` e `page`) e com a guarda que exige `card_ids` antes da rede. A lista de revisões usa `CONSULTA_REVISOES`, que aceita só `page`. `/revisions/{n}` é recusado como caminho. Os testes cobrem parâmetro fora da lista, 201 ids, id vazio e falta de `card_ids`, sempre com zero pedido de rede (`toque-fronteira.test.ts:71-109`).
- **R6-3, `CAMPOS_TOQUE`:** a constante é a única fonte do corte (`allow-list.ts:54-80`). Campo que não é escalar não passa, e item que não é objeto vira `null`. O teste usa uma fixture com todas as chaves da OpenAPI mais uma desconhecida e põe um marcador em `text`, `attachments`, `sender` e `recipients`. Do comentário só sobrevive o autor, que fica em memória até `contaComoToque`.
- **R6-5, `contaComoToque`:** função pura, entra só pela entrada `./coletor`. O lint já restringe esse import a `modulos/businessmap` (`server/eslint.config.js:39`), e o teste de bundle do `web/` já cobre `metricas/coletor`. Os property tests cobrem número e texto, 0, negativo, decimal, texto com letra, `external` e "nunca lança".
- **R6-4, conferência da lista:** buraco, repetição, lista curta, lista longa, `replaced_at` inválido e `revision` inválido viram `leitura_incompleta` com o motivo e nenhum evento. A releitura de `revision` acontece uma vez, só para lista curta ou longa. `autor_pendente` segue a regra. O autor de `r<n>` sai do item `n` e o instante sai do item `n-1`, os dois por `AUTOR_DO_TOQUE` num só lugar.
- **Lote de comentários, erros e log, A4 de segurança, fora do escopo e regras invioláveis:** conferidos no primeiro toque e sem mudança na volta.

## Revalidação (volta 1, `3c2ddba0..6a8adeea`)
Delta lido com `forge-check parecer delta docs/reviews/105-o22-coleta.md`. No domínio estão 8 arquivos: `CHANGELOG.md`, `contaComoToque.ts` e `.test.ts`, `http.ts`, `log.ts`, `log.test.ts`, `toque-fronteira.test.ts` e `toque-grants-estatico.test.ts`. O código e os testes somam +105/-38. Os outros três arquivos (`docs/qa`, `docs/security` e este parecer) são pareceres.
- **A1 (formato):** `contaComoToque.ts` e `.test.ts` foram reformatados sem ponto e vírgula, que é o estilo do pacote. Só muda o formato: a regex, o ramo de número e texto e a regra `internal` ficaram iguais. `pnpm run format:check` aqui: "All matched files use Prettier code style!". **Resolvido.**
- **`log.ts:38-46` (A3 de segurança):** entraram as oito chaves de pessoa e de texto no topo do objeto de log. Isso fecha o buraco do `log.info({ text })`, que os caminhos com prefixo não alcançavam. O teste novo (`log.test.ts:67-74`) cobre as oito chaves.
- **`http.ts:110-111` e `:269-271`:** `CONSULTA_VAZIA` vale para `/cards/{id}/comments`. A rota usada pelo spike F1 passa a recusar qualquer parâmetro antes da rede e segue aceitando a chamada sem consulta. Isso fecha o A6 do parecer 105-o22-adr do lado do código. O teste (`toque-fronteira.test.ts:95-102`) prova cinco parâmetros recusados, zero pedido de rede e a chamada sem consulta aceita.
- **A4 deste parecer (`toque-grants-estatico.test.ts:10-21`):** o `continue` agora pula só `estado` e `motivo` das tabelas `ctl_`. `primeiro_toque_em` e as outras colunas do toque voltam a ser conferidas nelas. **Resolvido.**
- **Testes do item rodados aqui (fora do CI):** `log`, `toque-fronteira`, `toque-grants-estatico` e `http` deram 95 de 95. `contaComoToque.test.ts` deu 26 de 26.
- **Mutantes à mão, depois revertidos:** M3 trocou `CONSULTA_VAZIA` por `CONSULTA_PERMITIDA` em `http.ts:270` e foi morto pelo teste "/cards/{id}/comments (spike F1) não aceita parâmetro algum". M4 tirou `'text'` do topo em `log.ts` e foi morto por "text no topo".
- **CI:** o CI de push do head, run 43866989872, terminou `success`. Os jobs `rapida`, `testes`, `banco`, `build`, `seguranca`, `openapi`, `filtro` e `imagem` passaram, e `perf` e `e2e` foram pulados pelo filtro. A branch ainda não tem PR: o CI obrigatório para o merge é o do PR, e este parecer não o substitui.

## Achados
- A1 (bloqueante) packages/metricas/src/coletor/contaComoToque.ts:11 · resolvido em `6a8adeea`: formato do pacote aplicado, `format:check` verde e `rapida` verde no run 43866989872.
- A2 (recomendado) server/src/modulos/businessmap/toque.ts:117 · comentário com `comment_id` inválido sai com o motivo `instante_invalido`. O estado está certo, mas o código engana o diagnóstico. Antes da migração (B7b): registrar isso na R6-4 ou criar um motivo próprio no CHECK. Segue aberto.
- A3 (recomendado) server/src/modulos/businessmap/toque-leitura.ts:12 · `limite-paginas` é fatal no lote de comentários: com mais de 50 páginas, a execução inteira para, sem dividir o lote como no `limite-bytes`. Sugestão para o B7b: dividir também. Segue aberto.
- A4 (recomendado) server/tests/toque-grants-estatico.test.ts:14 · resolvido em `6a8adeea`: as tabelas `ctl_` pulam só `estado` e `motivo`.
