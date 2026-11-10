---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l4b-fato-bloqueio
commit: 65859649df7bc4525b94521938fe9bc75150038d
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 075 L4b, projetor monta `fato_bloqueio` (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 4b" de `docs/analises/075-plano.md` pede, e o desvio aceito pelo Jarvis às 10:12 (`UPDATE ... IS DISTINCT FROM` + `INSERT ... DO NOTHING`) tem o mesmo efeito do `DO UPDATE` condicional do plano. Os recomendados 1 a 4 entraram. Os três achados abaixo são recomendados e não devolvem.

## O que foi lido (diff `b906f4fa...65859649`, 1 commit)

- Aderência ao plano (`projetor.ts:148-176`):
  - O fato vem dos eventos gravados (`evt_bloqueio` início com LEFT JOIN do fim pela mesma chave), não da derivação em memória.
  - `inicio`, `fim`, `coluna_em_que_bloqueou` e `fornecedor` vêm do evento.
  - `motivo` = `motivosDeLinhas` do domínio `motivo_bloqueio` vigente aplicado ao `motivo_codigo` do início; sem mapa ou com código nulo, `MOTIVO_NAO_CLASSIFICADO` (P-075-3, P-075-10). `motivosDeLinhas` só aceita rótulo dos 8, e o `.pg` confere que nenhum `motivo` fica fora de `MOTIVOS_BLOQUEIO_PUBLICADOS` (controle 2).
  - Duração por `horasUteisEntre` da biblioteca, com `lerCalendarioVigente('businessmap', 'fluxo')` ou `CALENDARIO_PADRAO` (ADR 0027). O arredondamento a 2 casas só iguala a escala de `numeric(12,2)` para o `IS DISTINCT FROM` não regravar a cada execução; não é cálculo próprio.
  - Bloqueio aberto: `fim` e duração nulos. Fim = início: duração 0 (P-075-9, o clamp já vem do derivador).
  - Sem `DELETE` (o dublê confere). `VERSAO_PROJETOR` = `bm-f4/3` (A11 da revisão do plano). Contagem `projecao_bloqueio_fato`.
  - Mapa e calendário lidos uma vez por projeção; como a projeção percorre toda a staging, o passado é reclassificado sem tocar no evento (TL-A3), provado no `.pg` com `evt_bloqueio` idêntico antes e depois.
- Equivalência do desvio (DECISÃO TÉCNICA de 10:12):
  - O `UPDATE` casa por `(card_id, id_origem)`, a mesma chave de `uq_fato_bloqueio` (`0006_bm_projecoes.ts:36`), e só toca a linha quando `(fim, duracao_horas_uteis, motivo)` difere: `atualizado_por_coleta_id` muda só nas linhas mudadas, como no `DO UPDATE ... WHERE`. As colunas regravadas são as do plano.
  - O `INSERT ... ON CONFLICT ON CONSTRAINT uq_fato_bloqueio DO NOTHING` grava só o que falta; a linha já atualizada conflita e não conta duas vezes em `inseridos`.
  - Sem corrida: os dois comandos rodam na mesma transação (`emTransacao`, `projetor.ts:278`) e a projeção inteira está sob `comTravaDaFonte(..., 'businessmap')` (`projetor.ts:328`). A regra do eslint (`server/eslint.config.js:9`) segue intacta.
  - O `.pg` prova a idempotência: a terceira projeção sem mudança dá `fatosBloqueio.inseridos` = 0.
- Recomendados destinados ao 4b:
  - (1) Marcos pela vigência de `ref_coluna`: `marco()` usa `noDia` no dia da versão (`projetor.ts:127-128`), o mesmo critério do normalizador; o dublê cobre a coluna que foi entrega e virou trabalho e a coluna desconhecida, e o `.pg` ganhou o descarte.
  - (2) `archivedAt` como `Date` (`bloqueios.ts:47`), (3) `coletadoEm` inválido lança `RangeError` sem eco do valor (`bloqueios.ts:42`), (4) nota `campo_fora_do_dominio` só do fornecedor (`bloqueios.ts:40`, mapa filtrado): os três com teste em `bloqueios.test.ts`.
  - Testes existentes ajustados: marcos como função e `bm-f4/3`.
- Testes: dublê com 2 casos novos (motivo, duração, aberto, fim = início, contagem, sem `DELETE`, troca de calendário); `.pg` com 1 caso novo e o descarte no CA-075-7. Os `.pg` são pulados na cobertura e rodam no job `banco` da CI. Rodei só os testes dos arquivos tocados sem banco (`vitest run tests/bloqueios.test.ts tests/projetor-businessmap.test.ts`): 2 arquivos, 44 testes verdes.
- CI do push no head `65859649`: run 42375310643, `CI`, `completed`/`success` (inclui lint, tipos e o job com PostgreSQL).
- Teto (M14): `git diff --numstat --no-renames b906f4fa...65859649` dá 146 linhas de código e teste (adições mais remoções) e 3 de `.md`; abaixo de 150, sem exceção. Um comportamento só.
- Documentação: `data-model.md` (regra de derivação de evento e fato) e `businessmap-api-configuracao.md` §4.4 (instantâneo e limite de precisão), como o plano pede.
- Performance (TL-A6, ADR 0003), avaliada pela consulta: a leitura dos eventos filtra `i.card_id = ANY($1)` e faz o LEFT JOIN por `(card_id, id_origem, tipo)`, prefixo e chave inteira de `uq_evt_bloqueio`, então as duas pontas usam o índice único; o `UPDATE ... FROM unnest` casa por `uq_fato_bloqueio`. Não há varredura sem índice nem N+1 (uma leitura e dois comandos por lote de 500 cards). A medida de tempo não foi feita (sem PostgreSQL local do autor): fica pendente (A3).
- Segurança: parecer do security-engineer aprovado em `docs/security/075-l4b-fato-bloqueio.md` (`108983f9`, A1 recomendado); não refeito aqui.

## Achados

- A1 (recomendado) server/src/modulos/businessmap/projetor.ts:274 · o comentário diz que o já gravado "não é alterado" e o da linha 26 chama o fato de append-only; `fato_bloqueio` agora é atualizado (fim, duração, motivo). Ajustar os dois comentários no 4c.
- A2 (recomendado) server/tests/projetor-bloqueio.pg.test.ts:92 · falta o caso de bloqueio aberto que fecha numa projeção seguinte (UPDATE de `fim` nulo) e a conferência de que `atualizado_por_coleta_id` muda só nas linhas mudadas. Levar ao 4c.
- A3 (recomendado) server/src/modulos/businessmap/projetor.ts:161 · TL-A6 (ADR 0003): tempo da projeção com o fato não medido; a consulta usa `uq_evt_bloqueio` e `uq_fato_bloqueio`. Medir no QA com PostgreSQL ou no 4c e registrar no parecer.
