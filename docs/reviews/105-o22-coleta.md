---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o22-coleta
commit: 3c2ddba09a13f4bcaf94644e6c3003cb09f0f3c2
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: O22 B7a, coleta do primeiro toque, fronteira e normalizador (105, E7.165)

Revisado de `369cb3d7` (Base-sha) até `3c2ddba0` (E7.156). Os dois commits do meio (`45105e4f`, ADR 0020 revisão 6; `38288b0c`, parecer de segurança) são documentos já aprovados e servem de referência. São 19 arquivos com +1335/-9. Código e teste somam 956 linhas: passa da orientação M14 por uma fatia só (fronteira, leitura e normalizador). Isso vai explicado no corpo do PR quando ele for aberto.

**Motivo da reprovação: só o formato (A1).** Desenho, lógica e testes estão aprovados. Na volta, a revalidação lê só o delta da formatação.

## O que foi conferido
- **R6-2, consultas fechadas (A1 do parecer de segurança):** `/cards/comments` entrou em `CAMINHOS_PERMITIDOS` (`http.ts:27`) com `CONSULTA_COMENTARIOS` (`card_ids` no formato `LISTA_IDS` e `page`) e com a guarda que exige `card_ids` antes da rede (`http.ts:283-285`). A lista de revisões usa `CONSULTA_REVISOES`, que aceita só `page`. `/revisions/{n}` é recusado como caminho. Os testes cobrem parâmetro fora da lista, 201 ids, id vazio e falta de `card_ids`, sempre com zero pedido de rede (`toque-fronteira.test.ts:71-109`). O A6 não foi aplicado (`/cards/{id}/comments` segue no padrão por causa do spike F1). A decisão está registrada no comentário do código e fica com o arquiteto, como o parecer pede.
- **R6-3, `CAMPOS_TOQUE`:** a constante é a única fonte do corte (`allow-list.ts:54-80`). Campo que não é escalar não passa, e item que não é objeto vira `null`. O teste usa uma fixture com todas as chaves da OpenAPI mais uma desconhecida e põe um marcador em `text`, `attachments`, `sender` e `recipients`. Do comentário só sobrevive o autor, que fica em memória até `contaComoToque`.
- **R6-5, `contaComoToque`:** função pura, entra só pela entrada `./coletor`. O lint já restringe esse import a `modulos/businessmap` (`server/eslint.config.js:39`), e o teste de bundle do `web/` já cobre `metricas/coletor` (`classificarApontamento.test.ts:481`). Os property tests cobrem número e texto, 0, negativo, decimal, texto com letra, `external` e "nunca lança".
- **R6-4, conferência da lista:** buraco, repetição, lista curta, lista longa, `replaced_at` inválido e `revision` inválido viram `leitura_incompleta` com o motivo e nenhum evento. A releitura de `revision` acontece uma vez, só para lista curta ou longa (`toque-leitura.ts:134-141`). `autor_pendente` segue a regra (instante de `r<revision>` estritamente depois da criação e antes do primeiro toque conhecido). O autor de `r<n>` sai do item `n`, e o instante sai do item `n-1`, ambos por `AUTOR_DO_TOQUE` num só lugar.
- **Comentário malformado (`instante_invalido`, `toque.ts:117`):** comentário sem `comment_id` válido ou sem `created_at` válido põe o card inteiro em `leitura_incompleta`, sem evento. É o comportamento certo: não há descarte silencioso nem "sem toque". O código do motivo é que fica impreciso para o caso de id inválido (A2).
- **Lote de comentários (A2 e A5 de segurança, R-T2 e R-T8):** comentário de card fora do lote é descartado e contado como `toque_forma` com caminho, sem valor. Falha HTTP, de formato ou de indisponibilidade marca todos os cards do lote com o código. Lote acima do teto de bytes se divide ao meio até um card. Erro fatal sobe.
- **R6-7, erros e log (A3 de segurança):** as mensagens levam só o caminho e o código. Os testes provam que o envelope inválido não ecoa o corpo. O `redact` ganhou as oito entradas, em um e dois níveis, também dentro de lista (`log.test.ts:45-65`).
- **A4 de segurança (R-T5):** a guarda estática de `COLUNAS_API_APONTAMENTO` está em `toque-grants-estatico.test.ts`. A prova no banco fica com o B7b, como o parecer prevê.
- **Fora do escopo, como o pedido manda:** não há migração, carga nem versão de critério (B7b e B8). `data-model.md` e o CHANGELOG foram atualizados.
- **Regras invioláveis:** nenhum dado de pessoa sai do normalizador. Os eventos levam só id, instante e booleano. BusinessMap e Acelerato não se cruzam.
- **Regras de ferramenta:** o CI do head, run 43857367907, tem o job `rapida` vermelho (`pnpm run format:check`, 2 arquivos). Isso cancelou o job `testes`, então a suíte não está provada no CI deste SHA. O parecer não afirma CI verde.
- **Testes do item rodados aqui (fora do CI):** `toque-fronteira`, `toque-leitura`, `toque-grants-estatico`, `log` e `http` deram 104 de 104 verdes. `contaComoToque.test.ts` deu 26 de 26.
- **Mutantes à mão, depois revertidos:** M1 tirou `|| ms === null` de `toque.ts:117` e foi morto pelo teste "comentário sem identidade ou sem instante válido". M2 tirou `&& ids.length > 1` de `toque-leitura.ts:73` e foi morto pelo "caso 15".

## Achados
- A1 (bloqueante) packages/metricas/src/coletor/contaComoToque.ts:11 · `format:check` reprova este arquivo e o `.test.ts` (estilo do pacote, sem ponto e vírgula). O `rapida` do CI ficou vermelho (run 43857367907) e o `testes` foi cancelado. Correção: prettier `--write` nos dois e `pronto` verde.
- A2 (recomendado) server/src/modulos/businessmap/toque.ts:117 · comentário com `comment_id` inválido sai com o motivo `instante_invalido`. O estado está certo, mas o código engana o diagnóstico. Antes da migração (B7b): registrar isso na R6-4 ou criar um motivo próprio no CHECK.
- A3 (recomendado) server/src/modulos/businessmap/toque-leitura.ts:12 · `limite-paginas` é fatal no lote de comentários: com mais de 50 páginas, a execução inteira para, sem dividir o lote como no `limite-bytes` (`:73`). Sugestão para o B7b: dividir também.
- A4 (recomendado) server/tests/toque-grants-estatico.test.ts:14 · o `continue` pula as duas tabelas `ctl_` inteiras, inclusive para `primeiro_toque_em`. Pular só as colunas genéricas (`estado`, `motivo`) mantém a guarda.

## Revalidação
A volta revalida só o delta da formatação do A1, que não muda a lógica. Os recomendados A2 a A4 ficam para o B7b ou para o arquiteto, e o parecer não depende deles.
