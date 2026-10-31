---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f3-coleta
commit: ad7cde3aadf94927f315650230aaf1b1f7360a61
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-31
---
# Review: 052-integracao-businessmap (E2.48, F3 do coletor do BusinessMap, coleta dos cards para o staging, K-182)

## Revalidação (E2.53, 2026-10-31): aprovado em `ad7cde3`

**Veredito: aprovado** em `ad7cde3`. Os dois bloqueantes fecharam: A1 pelo código da E2.51 (`a4021d0`) e A2 pelos documentos da E2.52 (`ad7cde3`, commit meu). Os recomendados A3 a A6 seguem como recomendados, com o destino da decisão técnica do Histórico do pedido (2026-10-31 18:36).

**Delta lido.** Rodei `forge-check delta --parecer docs/reviews/052-f3-coleta.md`, intervalo `e2ad47b..ad7cde3`. Li tudo o que ele listou:
- código e teste (E2.51, `f891ab3..a4021d0`): `coleta-businessmap.ts:13-14`, `coleta.ts:77-78, 158, 258, 267, 314`, `referencia.ts:20, 311-313`, `coleta-businessmap.test.ts:340-346`, `coleta-comando-businessmap.test.ts:132-153`;
- documentos (E2.52): `adr/0020-protecao-de-pessoa-no-coletor.md:3, 33-35, 94, 149`, `data-model.md:4, 17, 71, 105, 298-314, 349-383`, `server.md:180-185`.

Ficou como "já lido": o resto da F3, revisado em `e2ad47b` neste parecer (abaixo), que o delta não mudou.

**A1 (fechado, `a4021d0`).** `ErroReferencia` ganhou `pendentes` (`tabela:chave`, até 100), montado de `plano.pendentes` em `referencia.ts:311-313`. A coleta copia essas chaves para `ResultadoColeta.motivosPendentes` (`coleta.ts:267`), e a entrada imprime o resultado inteiro em JSON. As chaves são de referência (quadro, workflow, coluna, tipo), não valores de pessoa. O banco continua só com o código: o teste `coleta-businessmap.test.ts:346` prova que `2532` não está no estado do banco. O teste do comando prova a volta inteira (`coleta-comando-businessmap.test.ts:132-135`): a chave sai no formato do `--motivo-chave`, `analisarArgumentos` a aceita (a regex de `coleta-comando.ts:21` aceita `|` na chave) e o JSON não traz nome nem e-mail. Também prova a lista vazia com `--motivo` global e a chave que segue pendente quando o motivo dado é de outra chave. Rodei `vitest run` nos dois arquivos de teste do delta: 2 arquivos, 48 testes, todos passaram.

**A2 (fechado, `ad7cde3`).** `pnpm run docs:check` deu ok (822 páginas Markdown, 69 métricas, 2 eventos) com os três documentos. Cada item do A2 confere com o código:
- `data-model.md` §1 e §8: `GRANT UPDATE (parametros)` só em `dspd_bm`, e `dim_responsavel` com `SELECT, INSERT, UPDATE`, sem `DELETE`;
- `data-model.md` §3.3: `dim_responsavel` vigente, com as CHECKs da migração `0020`;
- `data-model.md` §6: o formato de `parametros` (`tipo`, `host_sha256`, `quadros_sha256`, `inicio_carga`, `iniciada_em`, `paginas`), igual a `coleta.ts:250-251`, com a regra de retomada e o risco do A4;
- `data-model.md` §9: as duas colunas novas em `COLUNAS_PESSOA`;
- ADR 0020, item 4c: `CAMPOS_TRANSICAO`, o `revision_id` com a saída e por que a raia fica fora (A5);
- ADR 0020, R3-2: a forma final;
- `server.md`: o `bm:coleta`, com opções, ordem da execução, saída com `motivosPendentes` e códigos de saída 0, 2, 3 e 1, iguais a `coleta-businessmap.ts:21, 42, 47`.

A suposição do autor (o hash cobre coluna, entrada e saída, e o card fica na chave única) é o que o código faz e o que este parecer já tinha conferido.

**Teto recontado (decisão M14).** `git diff --numstat --no-renames 0783caa..ad7cde3`, sem `.md`: 1924 linhas. Tirando os 4 de `tests/pg/esquema.snapshot.json` (fixture), ficam **1920 linhas** de código e teste. A exceção continua aceita, um comportamento só (abaixo). O PR da E2.50 leva `teto: excedido, 1920 linhas, F3 do plano 052: coleta manual dos cards para o staging (três estados, retomada por página, transições, nomes por /users e referência no comando)`.

Segurança por delta (E2.54) e QA (E2.49) vêm depois deste commit. Cito e não refaço.

## Review original (E2.48, sobre `e2ad47b`)

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
- A1 (recomendado) server/src/modulos/businessmap/coleta.ts:267 · Fechado em a4021d0: chaves pendentes em motivosPendentes (tabela:chave, até 100), aceitas pelo --motivo-chave, fora do banco, com teste (coleta-comando-businessmap.test.ts:132). Era bloqueante em e2ad47b.
- A2 (recomendado) docs/architecture/data-model.md:298 · Fechado em ad7cde3: data-model (§1, §3.3, §6, §8, §9), ADR 0020 (4c e R3-2) e server.md (bm:coleta) com a F3, conferidos contra o código; docs:check ok. Era bloqueante em e2ad47b.
- A3 (recomendado) server/src/modulos/businessmap/coleta.ts:304 · Transição inválida persistente deixa todo incremental parcial e a marca d'água parada; a carga retomada pula as leituras concluídas e fecha sucesso sem reler a inválida. Destino: F4 (decisão técnica, 2026-10-31 18:36).
- A4 (recomendado) server/src/modulos/businessmap/coleta.ts:280 · Retomada por número de página: card não modificado que muda de página entre as tentativas fica fora até a varredura da F5. Risco registrado em data-model §6. Destino: F5 (decisão técnica, 2026-10-31 18:36).
- A5 (recomendado) server/src/modulos/businessmap/allow-list.ts:157 · revision_id sem lane_id: troca de raia com mesma coluna, entrada e saída cai no uq_stg_revision como já existente. Destino: fica como está (decisão técnica, 2026-10-31 18:36; ADR 0020 4c).
- A6 (recomendado) server/src/modulos/businessmap/coleta-comando.ts:249 · Na retomada, a referência recebe o início de hoje e não o da carga retomada; hoje sem efeito, porque a tabela já não está vazia. Destino: F4 (decisão técnica, 2026-10-31 18:36).
