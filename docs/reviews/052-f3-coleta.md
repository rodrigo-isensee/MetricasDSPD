---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f3-coleta
commit: e2ad47ba722d6f4f9ca6930d12cded84add4f7b6
parecer: reprovado
revisor: forge:tech-lead
data: 2026-10-31
---
# Review: 052-integracao-businessmap (E2.48, F3 do coletor do BusinessMap, coleta dos cards para o staging, K-182)

**Veredito: reprovado** em `e2ad47b`, por dois bloqueantes:
- A1: o motivo por chave não dá para usar, porque o comando não mostra quais chaves pedem motivo.
- A2: a documentação do back não foi atualizada na entrega.

O resto confere com o plano e com as decisões Q-2, Q-2b, Q-2c, H-20 e Q-8. Os recomendados A3 a A6 não devolvem.

## Escopo e o que foi lido

Delta `0783caa..e2ad47b`, com 3 commits (`27fc78e`, `fe76252` e `e2ad47b`): 29 arquivos, 1893 linhas a mais e 17 a menos. Li o delta inteiro e a seção F3 do plano (`docs/architecture/features/052-integracao-businessmap.md`, linhas 156 a 165). Para conferir o que o código grava, li também:
- `uq_stg_revision` em `0004_bm_staging.ts`;
- `CONSULTA_PERMITIDA` em `http.ts`;
- `planejar` em `referencia.ts`;
- as linhas de `data-model.md` sobre grants (§8) e pessoa (§9).

Não li o `.env` e não chamei o BusinessMap. A única execução foi `vitest run` de `coleta-businessmap.test.ts`, `coleta-comando-businessmap.test.ts`, `transicoes-businessmap.test.ts`, `usuarios-businessmap.test.ts` e `config-businessmap.test.ts`: 5 arquivos, 69 testes, todos passaram. O `pronto` e o `test:pg` (127) ficam com o relatório do autor e com o QA (E2.49), que cito sem refazer. O `praticas.md` não tem regra "decidida por: `<comando>`", então não há saída de ferramenta a citar.

A segurança tem parecer próprio (E2.47, `docs/security/052-f3-coleta.md`, em paralelo). Cito e não refaço: GET só, allow-list, GRANT novo e projeção de `/users`.

## Conferência contra o plano e as decisões

- **Recorte dos três estados (Q-2b, Q-2c).** A carga inicial lê `active` sem filtro de data, `archived` por `archived_from` e `discarded` por `discarded_from`, todos com hoje menos 12 meses (`coleta.ts:238`). Os dois parâmetros já estavam na lista fechada do cliente. O teste da `coleta-businessmap.test.ts:51` prova os quatro casos: card ativo antigo entra, e os de fora da data não entram. O incremental lê os três estados por `last_modified_from`, que é a marca menos 3600 s. Confere.
- **Retomada por página em `ctl_coleta.parametros`.** Cada página grava numa transação, junto com `paginas["quadro|estado"] = {ultima, total}` (`coleta.ts:203`). Quando a carga anterior não terminou com sucesso e tem o mesmo início, a carga seguinte faz três coisas:
  - copia as páginas;
  - relê a última página concluída e pula o que já terminou;
  - mantém o `iniciada_em` da primeira tentativa.
  O `GRANT UPDATE (parametros)` vale só no `dspd_bm`, e o `.pg` da `:191` prova o 42501 em outra coluna e no `dspd_ac`. Confere. Há um risco de paginação por deslocamento no A4.
- **Marca d'água só em coleta ok.** `marca_dagua_ate` é gravada só com `estado === 'sucesso'`, na mesma transação do fechamento (`coleta.ts:303`). O valor é o início da primeira tentativa, então nada modificado durante a carga se perde. Falha só de `/users` não derruba a coleta, como o plano manda. Confere. Há uma consequência operacional no A3.
- **Motivo por chave na referência (A2 do review da F2).** `--motivo-chave=tabela:chave=motivo` vai até `planejar` (`referencia.ts:242`), e a regra está certa. Mas o operador não tem como saber as chaves: ver o A1.
- **`revision_id` das transições com a saída (suposição aceita).** O id é o sha256 de coluna, entrada e saída, cortado em 32 caracteres. A transição aberta que fecha depois entra como linha nova, e a recoleta igual não duplica. O `.pg` da `:111` prova isso, e também prova o 42501 no UPDATE. A F4 usa a última linha por card, coluna e entrada, como o Jarvis decidiu às 18:18. Há uma ressalva sobre a raia no A5.
- **Transição inválida fecha como parcial.** A transição sem coluna ou sem entrada vira `transicao-invalida` em `ctl_coleta_falha`, só com o id do card, e entra em `x.falhas`. A coleta fecha `parcial` e sem marca (`coleta.ts:195`; teste da `transicoes-businessmap.test.ts:70`). Confere.
- **H-20.** O comando é manual (`bm:coleta`), sem registro na agenda. Confere.
- **Q-8 e `dim_responsavel` (revisão de modelagem).** A migração `0020` tem a forma da proposta do plano e da ADR 0020 (R3-1 e R3-2), com duas CHECKs a mais: id só com dígitos e nome de 1 a 200 caracteres. As duas colunas estão em `COLUNAS_PESSOA`, e o `dspd_api` não tem nenhum GRANT, nem de tabela nem de coluna (`.pg` da `:191`). O coletor tem SELECT, INSERT e UPDATE, sem DELETE (DT-3). O UPSERT é feito em dois passos, porque o projeto proíbe DO UPDATE. A releitura a cada 30 dias e o id não devolvido estão cobertos. Da minha parte, a modelagem está aprovada. A forma final no `data-model.md` entra no A2.
- **Regras invioláveis.** BusinessMap e Acelerato continuam separados, sem consulta ao `dspd_ac` fora do teste de grant. A staging continua append-only, e não há nome em `stg_`, log ou falha. Nenhuma métrica é individual. Os fields 36 e 42 ficam fora do mapa, mesmo se alguém os puser lá.

## Testes `.pg`: o que falta contra PostgreSQL (para o QA, E2.49)

Os `.pg` do autor cobrem: carga, retomada, recoleta, transições, interrompida, `dim_responsavel`, CHECKs, 42501, referência em transação com rollback e o comando com trava. Falta contra o banco real:
- (a) `--motivo-chave` numa mudança de significado: a chave dita grava, e a outra fica pendente;
- (b) transição inválida fechando `parcial` e sem marca;
- (c) incremental com cards arquivados e descartados;
- (d) falha no meio de uma página: a página volta, e o `parametros` fica na página anterior.

## Teto de linhas (decisão M14)

O `praticas.md` não traz regra de teto, então vale a M14 do Forge. A conta foi `git diff --numstat --no-renames 0783caa..e2ad47b`, adições mais remoções: 1910 no total. Tirei os 4 de `tests/pg/esquema.snapshot.json`, que é fixture, e ficam **1906 linhas** de código e teste.

O comportamento é um só, a F3 do plano: a coleta manual para o staging, com cards, transições e nomes na mesma execução, e a referência no comando. Isso segue o precedente da F0 à F2 e a decisão do Jarvis de revisar E2.45 e E2.46 juntas. Aceito a exceção. O PR da E2.50 leva a linha `teto: excedido, <n> linhas, F3 do plano 052: coleta manual dos cards para o staging (três estados, retomada por página, transições, nomes por /users e referência no comando)`, com o `<n>` recontado depois da volta.

## Achados
- A1 (bloqueante) server/src/modulos/businessmap/coleta.ts:264 · O erro de motivo lista até 100 chaves (referencia.ts:311), mas a coleta guarda só o código e o comando não mostra as chaves; sem elas o --motivo-chave não se usa (A2 da F2). Entregar: chaves pendentes no resultado do comando, sem valor de pessoa, com teste.
- A2 (bloqueante) docs/architecture/data-model.md:331 · Doc do back sem a F3 (praticas §7 item 7): grant UPDATE (parametros), dim_responsavel ainda proposta (:357), CAMPOS_TRANSICAO e revision_id fora da ADR 0020 4c, formato de parametros.paginas e bm:coleta. Entregar: software-architect atualiza data-model, ADR 0020 e server.md.
- A3 (recomendado) server/src/modulos/businessmap/coleta.ts:301 · Transição inválida persistente deixa todo incremental parcial e a marca d'água parada; e a carga retomada pula as leituras já concluídas e fecha sucesso sem reler a inválida. Sugestão: arquiteto decide e registra o tratamento.
- A4 (recomendado) server/src/modulos/businessmap/coleta.ts:277 · Retomada por número de página: se a lista de ativos muda entre as tentativas, cards não modificados podem sair da página relida e ficar fora até a varredura da F5. Sugestão: registrar o risco no plano e cobrir pela F5.
- A5 (recomendado) server/src/modulos/businessmap/allow-list.ts:157 · revision_id sem lane_id: troca de raia com mesma coluna, entrada e saída cai no uq_stg_revision como já existente. Sugestão: QA ou arquiteto confere na forma real se troca de raia gera transição nova; se não, a raia entra no hash.
- A6 (recomendado) server/src/modulos/businessmap/coleta-comando.ts:249 · Na retomada, a referência recebe o início de hoje e não o da carga retomada; hoje não muda nada, porque a tabela já não está vazia. Sugestão: passar o início gravado em ctl_coleta, ou comentar por que não importa.
