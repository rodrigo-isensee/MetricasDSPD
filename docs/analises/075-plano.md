# 075: plano técnico em lotes dos bloqueios reais (E3.1, K-204)

Autor: software-architect, 2026-11-06 (segunda versão, depois das revisões E3.3 e E3.4). Só leitura no checkout da develop `/home/rodrigoisensee/MetricasDSPD-056d` (HEAD f21220fe); caminhos relativos a esse checkout. Nada executado contra API ou base. Entradas: desenho `docs/analises/075-desenho.md`, modelo de ameaças `docs/security/075-modelo-ameacas.md` (controles 1 a 10, CA-075-1 a 12; 11 a 14 não se aplicam, ver §1), especificação de UX `docs/ux/075-bloqueios-reais.md` (CA-1 a CA-12), decisões do dono de 2026-11-06 11:11 (P-075-1 a P-075-8, todas "A") e 11:28 (P-075-9 "A", P-075-10 "A", P-075-11 "B", P-075-12 "B"), revisão do tech-lead `docs/analises/075-plano-revisao-tech-lead.md` (TL-A1 a TL-A8) e revisão de segurança `docs/analises/075-plano-revisao-seguranca.md` (SEG-A1 a SEG-A6).

Conferência com a constituição: `docs/constituicao.md` não existe neste projeto; as regras invioláveis do `CLAUDE.md` foram conferidas uma a uma em §2. Conforme.

## 0. O que mudou desta versão (por achado)
| Achado | Correção | Onde |
|---|---|---|
| TL-A1 (bloqueante) | Teto de 150 linhas de código e teste por lote, um comportamento por lote: lotes 1a/1b, 2a/2b, 3, 4a/4b/4c, 5a/5b, 6a/6b, 9a/9b. Exceção só onde a divisão quebra a compilação, com `teto: excedido, <n> linhas, <motivo>` no corpo do PR, aceita no review. Documentação, `openapi.json`, fotografias e snapshots gerados não contam. | todos os lotes |
| TL-A2 + SEG-A2 do contrato (bloqueante) | Lotes 1a e 9b são **incompatíveis** pela `politica-de-mudanca.md:23,25` e levam aceite por mudança concreta em `docs/contratos/snapshots/aceitas.json` | Lotes 1a e 9b, §6 |
| TL-A3 + SEG-A2 (bloqueante; mesmo ponto nas duas revisões) | `evt_bloqueio.motivo_codigo` guarda o `reason_id` numérico da fonte (validado `^\d{1,10}$`); `fato_bloqueio.motivo` é o mapa aplicado na projeção e entra no `DO UPDATE`, então o mapa preenchido depois reclassifica o passado sem tocar no evento | Lotes 2a, 4a, 4b, 3 |
| TL-A4 + SEG-A5 (bloqueante / recomendado) | P-075-9 a P-075-12 registradas como decididas; os lotes do T10 e do T12 saem do pedido; o motivo próprio de T10 e T12 em `MOTIVO_ORIGEM_MOCK` fica para depois da WS1; pendências do T10 e do T12 numa seção própria | §3, §4, §5, Lote 6b |
| TL-A5 | Regra e teste do card fechado por marco que volta ativo ainda bloqueado | Lote 2b |
| TL-A6 | E2E `*-api` provados pelo run do PR em rascunho; performance medida localmente no `.pg` com `EXPLAIN` | Lotes 4a, 4b, 6b |
| TL-A7 | De onde roda a projeção real e a release dos lotes de coleta antes da prova | Lote 6a/6b "Depende", §7 |
| TL-A8 | Back-end em série; o 3 pode vir antes do 2 | §7 |
| SEG-A1 | Os estáticos (4c) entram na ordem antes da prova e do 6b | §7, Lote 6b |
| SEG-A3 | CA-075-1 ponta a ponta no `.pg` | Lote 4a |
| SEG-A4 | Teste de colunas contra o catálogo final e veto a `ALTER TABLE` depois da `0006` | Lote 4c |
| SEG-A6 | Lote 2 (2a e 2b) entra na lista de pareceres do security-engineer | §7 |

## 1. Resumo
Via A (P-075-1): o projetor deriva o bloqueio comparando as versões de `stg_card` que a coleta já grava (`is_blocked`, `block_reason_id`, `column_id`, `custom_fields`), sem campo novo da fonte, sem `stg_bloqueio`, sem chamada nova. Grava `evt_bloqueio` (append-only, fonte da história, só códigos da fonte) e `fato_bloqueio` (projeção, derivada só de `evt_bloqueio` mais as referências vigentes: mapa de motivos e calendário). A publicação volta por interruptor, depois de prova de linhas reais (desenho R6), com versão de critério T2.6 e marca de histórico parcial. Os controles 11 e 12 (via B) e 13 (via C) e os casos CA-075-13 e CA-075-14 ficam fora: nenhum lote os toca, e qualquer diff em `EXPAND_COLETA`, `stg_bloqueio` ou caminho novo do cliente é achado bloqueante do review.

Sem migração em nenhum lote: `evt_bloqueio` (`0005_bm_historico.ts:49-53`: `motivo_codigo` e `fornecedor_codigo` códigos nuláveis, `uq_evt_bloqueio (card_id, id_origem, tipo)`) e `fato_bloqueio` (`0006_bm_projecoes.ts:32-38`, `uq_fato_bloqueio (card_id, id_origem)`, `motivo`/`fornecedor` código nulável) já têm o que a via A precisa. O `CHECK` de enum no banco (recomendação do controle 2) não entra: o enum vai crescer quando as pessoas definirem o mapa dos motivos e cada crescimento viraria migração; a validação fica no projetor e nos testes (Lotes 4a e 4b).

Escopo: O1 (série), O2, O5, O19 e BLOQUEADOS voltam ao mapa real. T10 e T12 ficam fora deste pedido (P-075-11 e P-075-12 "B", ESCOPO- do dono), ver §5.

## 2. Regras invioláveis conferidas
- Avaliação individual: nenhum campo de pessoa, autor ou comentário; nenhuma rota agrega por pessoa (controle 10, CA-075-11, UX CA-5). Conforme.
- BusinessMap e Acelerato: fornecedor só de `custom_fields` da versão do card no esquema `bm` (controle 9, CA-075-12). Conforme.
- Histograma misto: O19 segue `selecionar(ctx, f, 'story')` (`o19.ts:19`). Conforme.
- Percentis 50/85/95 em 12 semanas e mínimo de 20: só pela biblioteca (`estatistica`, `janelaPercentis`); nenhum lote calcula fora dela. Conforme.
- Nunca sobrescrever histórico: `evt_bloqueio` append-only e sem tradução (guarda o código da fonte); `fato_bloqueio` só `INSERT ... ON CONFLICT` e `UPDATE` de `fim`, duração e `motivo` (projeção recalculada das referências), sem `DELETE`; `TABELAS_LIMPAS_NA_RECONSTRUCAO` continua `['dim_card']` (`projetor.ts:23`). Conforme.
- Biblioteca T2.5: duração por `horasUteisEntre` com o calendário da referência (ADR 0027), nunca em SQL. Conforme.
- T2.6: versão de critério nova no Lote 6a; a do mapa de motivos, no pedido que trouxer o mapa (Lote 3). Conforme.
- Dúvida de regra: P-075-9 a P-075-12 respondidas às 11:28 (§5); nenhuma pergunta aberta trava lote. A regra de reabertura do TL-A5 decorre de P-075-2 e P-075-5 (Lote 2b); se o review discordar, vira pergunta ao dono, não código. Conforme.

## 3. Onde entra cada decisão e cada controle

| Item | Lote |
|---|---|
| P-075-1 (via A) | 2a, 4a |
| P-075-2 (início e fim = instante da coleta que viu) | 2a (regra), 5b (texto de precisão, UX CA-11), 6a (descrição da versão de critério) |
| P-075-3 (sem mapa = "não classificado") | 1a (contrato), 1b (leitura), 3 (domínio vazio), 4b (projeção), 5a (tela) |
| P-075-3b (troca de motivo = mesmo bloqueio) | 2a |
| P-075-4 (fornecedor do card no início) | 2b (lido da versão que abriu), 4a |
| P-075-5 (arquivado, descartado, entregue fecha) | 2b |
| P-075-6 (volta com histórico parcial e marca T2.6) | 5b (faixa e lacuna na série), 6a (versão e corte da série) |
| P-075-7 (agenda diária depois da VM) | E5.1 do devops-engineer, fora desta delegação; o 6b não espera por ela (o texto de precisão do 5b cobre a coleta manual) |
| P-075-8 (O19, T10, T12 no mapa real) | O19 no 6b; T10 e T12 fora deste pedido pela P-075-11 e P-075-12 "B" (§5) |
| P-075-9 (fim antes do início = duração 0, conta) | 2b |
| P-075-10 (troca de motivo: vale o do início) | 2a (o `reason_id` do evento `inicio`), 4b |
| P-075-11 e P-075-12 ("B") | §5; teste de que T10 e T12 ficam fora no 6b |
| Controle 1 (só `reason_id`) | 2a, 4a (CA-075-1 ponta a ponta, SEG-A3) |
| Controle 2 (motivo de lista fechada) | 1a, 1b, 3, 4b (CA-075-2, CA-075-3); no evento, só dígitos (4a) |
| Controle 3 (colunas fechadas por teste) | 4c (CA-075-4, SEG-A4) |
| Controle 4 (sem GRANT novo) | 4c (CA-075-5) |
| Controle 5 (incremental sem sobrescrever) | 2a, 4a, 4b (CA-075-6, CA-075-7, CA-075-8) |
| Controle 6 (duração pela T2.5, interruptor único, T2.6) | 4b (duração), 6a (versão), 6b (interruptor) |
| Controle 7 (seed separado) | 4a (CA-075-9) |
| Controle 8 (erro só com código) | 4a (CA-075-10) |
| Controle 9 (só BusinessMap) | 2b, 4a (CA-075-12); parte do T10 em §5 |
| Controle 10 (API sem pessoa) | 1a, 6b (CA-075-11); parte do T10 e do T12 em §5 |
| Controles 11 a 14 (vias B e C) | nenhum: fora pela P-075-1 |

## 4. O19 no mapa real
Lê só `fato_bloqueio` e `dim_card` (`bloqueios.ts:14-35`, `o19.ts`); não lê extensão mock na base real (`servico.ts:300-301` só passa `ext`/`tambem` com `!real`). Falta (a) linhas reais em `fato_bloqueio` (Lotes 2a a 4c), (b) aceitar o 8º motivo: hoje itera os 7 de `MOTIVOS_BLOQUEIO` (`o19.ts:26`) e o contrato é `z.enum(MOTIVOS_BLOQUEIO)` (`tambem.ts:71`), então bloqueio "não classificado" sumiria da soma por causa sem sair do total (Lotes 1a e 1b), (c) entrar no mapa com o interruptor (Lote 6b). Com o mapa de motivos vazio, só a linha "não classificado" terá bloqueios: é o retrato honesto (UX §1) e já previsto pela P-075-3. Quando o mapa for preenchido, a próxima projeção reclassifica o passado (Lote 4b).

## 5. T10 e T12: fora deste pedido e pendências para quando voltarem
Decisões de 11:28: P-075-11 "B" (o T10 espera o campo fornecedor no mapa de campos da WS1) e P-075-12 "B" (o T12 espera a WS1 preencher a área solicitante); ESCOPO- do dono: o T10 e o T12 da E4 (P-075-8) ficam para depois da WS1. Neste pedido:
- T10 e T12 continuam fora de `METRICAS_ORIGEM_REAL` e respondem como hoje ("fonte real ainda não definida", `origem.ts:88`), mesmo com `fato_bloqueio` real (eles leem a mesma tabela). O Lote 6b traz o teste disso (SEG-A5).
- O motivo próprio de T10 e T12 em `MOTIVO_ORIGEM_MOCK` (texto do tipo "aguardando fornecedor/área solicitante no quadro", a confirmar pela UX) **não entra neste pedido**: fica para depois da WS1, junto com o T10 e o T12, pelas P-075-11 e P-075-12 "B". Nenhum lote mexe em `MOTIVO_ORIGEM_MOCK` para T10 ou T12.

Pendências para o pedido que trouxer o T10 e o T12 de volta (SEG-A5; nada aqui é código deste pedido):
- **Fato que falta na base:** T10 precisa de `fato_bloqueio.fornecedor` preenchido, que depende do campo fornecedor no mapa de campos (`COLUNAS_LISTA`, `allow-list.ts:64-65`; `colunasDeLista`, `normalizador.ts:115-129`; `docs/architecture/fontes/businessmap-dominio.json`); o 064 não mediu `fornecedor`. T12 precisa de `dim_card.area_solicitante` (0 de 12633 stories, L2/Q05; `mapa.ts:41` troca nulo por `''`) e o critério (a) do D-8 depende do motivo "Falta de informação no chamado" (`t12.ts:8, 17-19`), que só ocorre com o mapa de motivos preenchido.
- **Controle 9 no T10:** fornecedor ausente fora da linha e nenhuma leitura de `dspd_ac` na rota (CA-075-12 na resposta do T10).
- **Controle 10:** CA-075-11 nas respostas do T10 e do T12; área solicitante é dimensão permitida (`EXCECOES_PESSOA`), nunca equipe nem pessoa; área vazia nunca como `''` silencioso.
- **Controle 6:** versão de critério T2.6 própria de cada um (`afeta` T10; `afeta` T12), com "histórico parcial" e, no T10, "fornecedor do card no início do bloqueio" (P-075-4).
- **Testes:** T10 com fornecedores de grafias diferentes (B11-001), menos de 20 por fornecedor sem percentil; T12 com taxa só com n >= 20, bloqueio "não classificado" não conta como ida e volta, retorno compromisso→backlog conta.
- **Consulta do dono** antes de cada um entrar: bloqueios encerrados com `fornecedor` não nulo (T10) e cards com `area_solicitante` não vazia (T12).

## 6. Por que o existente não basta (8º valor de motivo e domínio `motivo_bloqueio`)
- **8º valor:** o contrato só aceita os 7 motivos (`MOTIVOS_BLOQUEIO`, `comum.ts:97-105`; `schemas.ts:101` e `:135`, `tambem.ts:71`, todos `z.enum`). Gravar `null` no motivo não serve: a leitura descarta bloqueio sem motivo (`repositorio.ts:74-79`, "só `motivo` não nulo", confirmado em `064-lacunas-dado-real.md:17`), o que tira o bloqueio de todas as métricas e contradiz a P-075-3. Reaproveitar um dos 7 seria afirmar um motivo de negócio falso. O valor novo fica num enum à parte (`MOTIVOS_BLOQUEIO_PUBLICADOS`), sem mexer nos 7 do briefing, que o mock e o domínio continuam usando.
- **Domínio `motivo_bloqueio`:** o `ref_dominio` do BusinessMap já é carregado por arquivo versionado com `textoSeguro` (`dominio-businessmap.ts:17, 32`); o que não existe é o campo que liga `reason_id` a um dos 7. Sem ele, o mapa iria para constante no código, que o controle 2 proíbe e que obrigaria um PR a cada decisão das pessoas. O arquivo nasce sem entradas (a P-075-3 adia o mapa).
- **Classificação de contrato (TL-A2):** valor novo de enum na resposta (Lote 1a) e valor removido de enum (Lote 9b) são incompatíveis pela `docs/contratos/politica-de-mudanca.md:23` e `:25` (classificador conservador, ratificação de 2026-10-11, `:32`). Saída escolhida: aceite por mudança concreta em `aceitas.json` (§2, saída 2), não `/api/v2`, porque o único consumidor é o `web` do próprio repositório e nenhum consumidor é exaustivo sobre o motivo: `MotivoBloqueio` e `MOTIVOS_BLOQUEIO` não aparecem em `web/src` (busca em f21220fe, 0 ocorrências). Aprovação do software-architect: dada neste plano para as duas mudanças descritas; a do tech-lead, no review de cada PR (§5 da política).

## Lote 1a (node-backend): contrato aceita "não classificado"
- **Comportamento:** o contrato de BLOQUEADOS, O2 e O19 aceita o 8º valor de motivo.
- **Arquivos:** `packages/contratos/src/comum.ts` (`MOTIVO_NAO_CLASSIFICADO = 'não classificado'`, texto exato da UX §1; `MOTIVOS_BLOQUEIO_PUBLICADOS = [...MOTIVOS_BLOQUEIO, MOTIVO_NAO_CLASSIFICADO]` e seu tipo); `schemas.ts:101` e `:135` e `tambem.ts:71` passam ao enum publicado; `packages/metricas/src/businessmap/modelo.ts:65` (`FatoBloqueio.motivo` no tipo publicado).
- **Contrato: incompatível** (valor novo de enum na resposta, `politica-de-mudanca.md:25`). Fluxo da política (`:45`): alterar o schema; `pnpm run docs:check` falha e imprime o hash de cada contrato; registrar em `docs/contratos/snapshots/aceitas.json` uma entrada por contrato (esperados `resultados/BLOQUEADOS`, `resultados/O2`, `resultados/O19`, as três fotografias que hoje têm os 7 motivos; vale a lista que o `docs:check` imprimir), no formato:
  `{"contrato": "resultados/O19", "mudanca": "<sha256 copiado da saída do docs:check>", "motivo": "075 L1a: valor 'não classificado' no enum de motivo (P-075-3); único consumidor web, sem switch exaustivo", "data": "AAAA-MM-DD"}`;
  `pnpm run docs:fotografar`; remover as entradas (aceite de uso único, `:41`); `docs:check` verde. Schema, fotografias, `openapi.json`, `docs/contratos/metricas/{O19,O2,BLOQUEADOS}.md` e a remoção do aceite no mesmo PR; `aceitas.json` sem diferença no fim da branch (precedente `docs/reviews/069-z7-l9a.md:27`). No corpo do PR: as entradas copiadas, a linha do checklist §6 (`contrato: incompatível (valor novo de enum na resposta; aceite em aceitas.json)`) e a conferência de que nenhum `switch` ou `Record<MotivoBloqueio, ...>` no `web` é exaustivo.
- **Migração:** nenhuma.
- **Testes:** contrato aceita os 8 e recusa um nono; CA-075-11 sobre os schemas (nenhuma chave com segmento de pessoa); `pnpm --filter web` compila.
- **Versão de critério T2.6:** nenhuma (nada publicado muda).
- **Gatilho de segurança:** contrato da API (controle 10).
- **Prova:** CI do push verde (inclui `docs:check` e `openapi:verificar`).
- **Teto:** 150 (estimativa 60).

## Lote 1b (node-backend): leitura publica "não classificado"
Depende do 1a.
- **Comportamento:** motivo fora dos 8 vira "não classificado" na leitura, e o O19 lista os 8.
- **Arquivos:** `o19.ts:26` itera o enum publicado (ordem neutra do domínio com "não classificado" por último; a ordenação por soma é da interface); `server/src/modulos/metricas/mapa.ts:62-69` (`bloqueioDe`: motivo fora dos 8 vira "não classificado", nunca o texto lido; defesa de leitura do controle 2). `t12.ts` não muda.
- **Contrato:** nenhum (o 1a já alargou). **Migração:** nenhuma.
- **Testes:** O19 devolve 8 linhas com "não classificado" por último; `bloqueioDe` com motivo desconhecido, vazio e com marcador `MARCADOR-PESSOA-075` sai "não classificado".
- **Versão de critério T2.6:** nenhuma. **Gatilho de segurança:** leitura de projeção (controle 2).
- **Prova:** CI do push verde.
- **Teto:** 150 (estimativa 80).

## Lote 2a (node-backend): derivador puro, abrir e fechar
Não depende do Lote 1 (com o TL-A3 o derivador não traduz motivo).
- **Comportamento:** de versões ordenadas de um card, derivar eventos `inicio`/`fim` por mudança de `is_blocked`.
- **Arquivos:** novo `server/src/modulos/businessmap/bloqueios.ts`, função pura `derivarBloqueios(versoes, marcos, mapaCampos)` sem banco nem relógio. Entrada: versões do card em ordem de `stg_sk` (`coletado_em`, `is_blocked`, `block_reason_id`, `column_id`, `custom_fields` já reduzidos). Saída: eventos com `tipo`, `id_origem`, `ocorrido_em`, `motivo_codigo`, `coluna_id`, `fornecedor_codigo`, e notas por código.
- **Regras (do dono):** falso→verdadeiro, ou primeira versão já bloqueada, abre no `coletado_em` da versão (P-075-2, desenho R5); verdadeiro→falso fecha no `coletado_em` da versão (P-075-2); troca de `block_reason_id` com o card bloqueado não gera evento (P-075-3b) e o motivo do bloqueio é o do início (P-075-10): `motivo_codigo` do evento `inicio` = `block_reason_id` da versão que abriu.
- **`motivo_codigo` (TL-A3, SEG-A2):** o `reason_id` numérico da fonte, como texto validado por `^\d{1,10}$`; nulo, ausente ou fora do padrão vira `null` com nota por código (`motivo_codigo_invalido`), nunca o valor lido. Nenhuma tradução para os 7 aqui: ela é da projeção (Lote 4b). `reason_id` objeto já é descartado na allow-list (`allow-list.test.ts:81`).
- **`id_origem`:** hash determinístico de (`card_id`, `coletado_em` da versão que abriu), nunca de texto (controle 5); o `fim` usa o mesmo `id_origem` com `tipo = 'fim'`.
- **Contrato:** nenhum. **Migração:** nenhuma.
- **Testes (unidade):** abre, fecha, reabre (dois `id_origem`), troca de motivo sem evento e com o código do início, primeira versão bloqueada, versões repetidas (idempotência da derivação), `reason_id` numérico, nulo, ausente, não numérico e com 11 dígitos (CA-075-2), fixture com `label`, `comment` e `user_id` marcadores que não aparecem na saída (CA-075-1, unidade).
- **Versão de critério T2.6:** nenhuma (nada publicado).
- **Gatilho de segurança:** decide o que vai do `stg_card` ao evento (controles 1, 2, 5); parecer do security-engineer (SEG-A6). O parecer confere que `allow-list.ts` e `coleta.ts` não mudaram.
- **Prova:** CI do push verde.
- **Teto:** 150 (estimativa 140).

## Lote 2b (node-backend): marcos de saída e fornecedor
Depende do 2a.
- **Comportamento:** fechar por marco de saída e ler o fornecedor da versão que abriu.
- **Arquivos:** `bloqueios.ts` (entrada `marcos`: arquivado nativo, descarte/exclusão detectada, entrega pela coluna de papel `entrega`); exportação de `colunasDeLista` em `normalizador.ts` (exportada, não copiada).
- **Regras:** arquivado, descartado/excluído ou entregue com bloqueio aberto fecha no instante desse marco (P-075-5); se esse instante for anterior ao início observado, `fim = início` (duração 0, o bloqueio conta, P-075-9); fornecedor = valor do campo fornecedor nos `custom_fields` da versão que abriu, pela `colunasDeLista` do normalizador (P-075-4); ausente vira `null`.
- **Reabertura depois de marco (TL-A5):** card fechado por marco que volta ativo e é visto bloqueado abre um bloqueio **novo** no `coletado_em` da primeira versão ativa vista bloqueada, com `id_origem` dessa versão. Decorre das decisões, não é inferência nova: a P-075-5 fecha o bloqueio no marco e o `fim` gravado é append-only, então não há bloqueio aberto a continuar; ver um card ativo bloqueado sem bloqueio aberto é o caso "primeira versão já bloqueada" da P-075-2 (desenho R5). Se o review ou o dono discordarem, o lote para e vira pergunta, não ajuste no código.
- **Contrato:** nenhum. **Migração:** nenhuma.
- **Testes (unidade):** card arquivado, descartado e entregue bloqueado; fim antes do início (duração 0); card arquivado bloqueado que volta ativo bloqueado (dois bloqueios, dois `id_origem`); fornecedor presente, ausente e trocado depois do início (vale o do início); fornecedor nunca de fora de `custom_fields` do `bm` (CA-075-12, unidade).
- **Versão de critério T2.6:** nenhuma. **Gatilho de segurança:** como o 2a (controles 5 e 9); parecer do security-engineer (SEG-A6).
- **Prova:** CI do push verde.
- **Teto:** 150 (estimativa 140).

## Lote 3 (node-backend): domínio `motivo_bloqueio` no `bm:ref-sync`
Independente de 2a e 2b; na série do back-end pode vir antes do 2a (TL-A8).
- **Comportamento:** carregar o mapa `reason_id` → um dos 7 do arquivo de referência.
- **Arquivos:** `server/src/modulos/businessmap/dominio-businessmap.ts` (campo `motivo_bloqueio`: `codigo` = `reason_id` validado por `^\d{1,10}$`, `rotulo` restrito aos 7 de `MOTIVOS_BLOQUEIO` por `z.enum`, nunca texto livre nem "não classificado", que é ausência de mapa); `docs/architecture/fontes/businessmap-dominio.json` com a lista `motivo_bloqueio` vazia e a `regra` dizendo que o mapa é das pessoas (P-075-3); leitura do mapa para o projetor no mesmo módulo.
- **Contrato:** nenhum. **Migração:** nenhuma (`ref_dominio` já existe).
- **Testes:** arquivo com rótulo `MARCADOR-PESSOA-075`, com `@`, fora dos 7 ou com código não numérico recusado sem carregar nada (CA-075-3); arquivo vazio carrega zero linhas; `.pg` do `ref-sync` com o campo novo.
- **Versão de critério T2.6:** nenhuma agora. Quando as pessoas preencherem o mapa, a mudança do arquivo é versionada pelo próprio `ref-sync` (referência `069:ref-bm-campos:<sha>`, `dominio-businessmap.ts:112`); a próxima `bm:projetar` reclassifica `fato_bloqueio.motivo` dos bloqueios passados (Lote 4b; o evento não muda), e o pedido que trouxer o mapa registra versão de critério `afeta` O2, O19 e BLOQUEADOS (e T12, se já estiver no mapa real).
- **Gatilho de segurança:** referência carregada de arquivo (texto vindo de pessoas); parecer do security-engineer.
- **Prova:** CI do push verde.
- **Teto:** 150 (estimativa 130).

## Lote 4a (node-backend): projetor grava `evt_bloqueio`
Depende de 2a e 2b.
- **Comportamento:** a projeção grava os eventos de bloqueio de forma idempotente.
- **Arquivos:** `server/src/modulos/businessmap/projetor.ts`: em `projetarLote`, uma consulta a mais lê todas as versões dos cards do lote só com os campos usados (`stg_sk`, `coletado_em`, `payload->'is_blocked'`, `payload->'block_reason_id'`, `payload->'column_id'`, `payload->'custom_fields'`), nunca o `payload` inteiro; monta os marcos com o que o projetor já lê; chama `derivarBloqueios`; grava `evt_bloqueio` com `ON CONFLICT ON CONSTRAINT uq_evt_bloqueio DO NOTHING`. Contagens em `ctl_coleta_contagem` (`projecao_bloqueio_evento`, `nota_bloqueio_*`), só números. `VERSAO_PROJETOR` vira `bm-f4/2`.
- **Fechado por desenho:** `exigirEsquemaSemSeed` já corre antes (`projetor.ts:207`), então a projeção dos bloqueios nunca grava sobre esquema com coleta `seed-mock` (controle 7); `TABELAS_LIMPAS_NA_RECONSTRUCAO` não muda; `grants.ts` e `lgpd.ts` não mudam (qualquer diff neles é achado bloqueante).
- **Contrato:** nenhum. **Migração:** nenhuma.
- **Testes (`.pg`):** reprojeção e coleta repetida com sobreposição de 3600 s não criam linha nova (CA-075-6); card bloqueado depois arquivado e card descartado mantêm os eventos (CA-075-7); `UPDATE`/`DELETE` em `evt_bloqueio` negado pelo gatilho (CA-075-8); base com `seed-mock` mais real e `limpar-seed` remove só o seed (CA-075-9, `limpar-seed.ts:95`); falha de um bloqueio grava código, `card_id` e campo constante, sem o marcador (CA-075-10); fornecedor só de `bm`, nenhuma leitura de `dspd_ac` (CA-075-12); `evt_bloqueio.motivo_codigo` só dígitos ou nulo. **CA-075-1 ponta a ponta (SEG-A3):** card com `block_reason {reason_id, label: MARCADOR-PESSOA-075, comment: MARCADOR-PESSOA-075, user_id: 888}` passando por `registroCard` → `stg_card` → `projetarBusinessMap`, com varredura de `stg_*`, `evt_bloqueio`, `fato_bloqueio` (vazio até o 4b, a varredura já fica), log e `ctl_coleta_falha`.
- **Performance (TL-A6):** a consulta nova é o custo novo e entra aqui: tempo do `bm:projetar` medido localmente no `.pg` com o volume de referência e `EXPLAIN` da consulta sobre `stg_card` por card, registrados no parecer (ADR 0003). Não é prova do push (a medição da CI é a noturna, `ci.yml:7`).
- **Versão de critério T2.6:** nenhuma. **Gatilho de segurança:** banco, dado da fonte na projeção; parecer do security-engineer.
- **Prova:** CI do push verde, incluindo a suíte `.pg`; medida local no parecer.
- **Teto:** 150 (estimativa 150; se passar, `teto: excedido` no PR ou o CA-075-1 ponta a ponta vai ao 4c).

## Lote 4b (node-backend): projetor monta `fato_bloqueio`
Depende de 4a e 3.
- **Comportamento:** a projeção monta o fato a partir dos eventos gravados, aplicando o mapa de motivos e o calendário vigentes.
- **Arquivos:** `projetor.ts`: `fato_bloqueio` montado dos eventos gravados do card (não da derivação em memória): `inicio`, `fim`, `coluna_em_que_bloqueou` e `fornecedor` dos eventos; `motivo` = mapa do domínio (Lote 3) aplicado ao `motivo_codigo` do evento `inicio`, ou "não classificado" quando não há mapa para o código ou o código é nulo (P-075-3, P-075-10); duração por `horasUteisEntre` da biblioteca com o calendário vigente (`lerCalendarioVigente`, ADR 0027). Grava com `INSERT ... ON CONFLICT ON CONSTRAINT uq_fato_bloqueio DO UPDATE SET fim, duracao_horas_uteis, motivo, atualizado_por_coleta_id` só quando algum deles mudou, sem `DELETE`. Como `projetarBusinessMap` percorre toda a staging a cada execução (`projetor.ts:219-225`), a mudança do mapa (ou do calendário) reclassifica o passado na execução seguinte, sem tocar no evento (TL-A3). Contagem `projecao_bloqueio_fato`.
- **Contrato:** nenhum. **Migração:** nenhuma.
- **Testes (`.pg`):** mapa vazio → todos "não classificado"; mapa com um `reason_id` → nova `bm:projetar` muda o `motivo` do fato antigo e `evt_bloqueio` fica idêntico (contagem e conteúdo); troca de calendário recalcula a duração; `fato_bloqueio.motivo` só com valor dos 8 (controle 2); bloqueio aberto sem `fim` e sem duração; fim igual ao início com duração 0 (P-075-9).
- **Performance:** o tempo do 4a remedido com a montagem do fato, no parecer.
- **Versão de critério T2.6:** nenhuma ainda (a API continua com o interruptor desligado).
- **Gatilho de segurança:** banco (projeção lida pela API); parecer do security-engineer.
- **Prova:** CI do push verde, incluindo `.pg`.
- **Teto:** 150 (estimativa 140).
- **Documentação:** `docs/architecture/data-model.md` (regra de derivação de `evt_bloqueio` e `fato_bloqueio`: evento com código da fonte, fato com o mapa aplicado), `docs/integracao/businessmap-api-configuracao.md` §4.4 (bloqueio por instantâneo e o limite de precisão).

## Lote 4c (node-backend): testes estáticos de colunas e GRANT
Depende de 4b. Antes da prova do dono e do 6b (SEG-A1).
- **Comportamento:** fechar por teste as colunas e os GRANTs das duas tabelas.
- **Testes:** lista exata das colunas atuais de `fato_bloqueio` e `evt_bloqueio` escrita no teste (não derivada da migração) e comparada com o catálogo depois de todas as migrações (`information_schema.columns` no `.pg`, SEG-A4); estático que reprova qualquer `ALTER TABLE` sobre `fato_bloqueio` ou `evt_bloqueio` em migração posterior à `0006` e migração de teste com `bloqueado_por`, `comentario` e `observacao` reprovada (CA-075-4); `gerarGrants` idêntico ao da develop e `dspd_api` com `42501` em `evt_bloqueio` e `stg_bloqueio` (CA-075-5).
- **Contrato:** nenhum. **Migração:** nenhuma. **Versão de critério:** nenhuma.
- **Gatilho de segurança:** controles 3 e 4; parecer do security-engineer.
- **Prova:** CI do push verde, incluindo `.pg`.
- **Teto:** 150 (estimativa 100).

## Lote 5a (react-frontend): motivo "não classificado" em BLOQUEADOS, O2 e O19
Depende do 1a (contrato); roda em paralelo à série do back-end, com fixtures. A UX especifica (`docs/ux/075-bloqueios-reais.md`) e revisa a tela implementada.
- **Comportamento:** mostrar o 8º motivo com a marca da UX.
- **Arquivos:** `web/src/features/operacional/components/CartaoBloqueados.tsx` (texto "não classificado" em itálico, cor neutra e ícone `aria-hidden`, CA-1 e CA-4; leitura "por motivo não classificado", CA-3; zero bloqueados segue "Nenhum item bloqueado hoje.", CA-10); `CartaoO2.tsx` (distribuição por motivo com "não classificado" por último, hachura ou contorno, somado ao total, CA-2 e CA-4); O19 em `web/src/features/complementares/operacionais.tsx` (mesma ordem e marca).
- **Contrato:** só consome. **Migração:** nenhuma.
- **Testes:** unidade dos cartões para CA-1 a CA-4 e CA-10; CA-5 por varredura das colunas e legendas; CA-12 (interruptor desligado mantém "Sem dado real") continua passando.
- **Versão de critério T2.6:** nenhuma. **Gatilho de segurança:** nenhum novo (sem campo de pessoa; CA-5).
- **Prova:** CI do push verde.
- **Teto:** 150 (estimativa 140).

## Lote 5b (react-frontend): histórico parcial no O5 e na série do O1
Depende do 1a; depois do 5a (um cartão por agente).
- **Comportamento:** marcar o histórico parcial e a precisão do instante.
- **Arquivos:** O5 em `complementares/fluxo.tsx` e a série do O1 em `CartaoO1.tsx` reaproveitando `AvisoCriterio` (faixa `janela` no O5 mesmo em amostra insuficiente, CA-6, CA-8, CA-9; faixa `serie` e linha vertical no O1, trecho anterior sem ponto, nunca zero, CA-7); os dois textos de apoio sob a tabela de bloqueados com `aria-describedby` (CA-11, precisão do instante, P-075-2).
- **Contrato:** só consome; o ponto nulo da série e a `MarcacaoCriterio` já existem (`schemas.ts:82`, `bloqueados` nulável).
- **Testes:** unidade para CA-6 a CA-9 e CA-11, com fixture da versão de critério do 6a; E2E `*-api` só no 6b.
- **Versão de critério T2.6:** consome a do 6a (fixture). **Gatilho de segurança:** nenhum.
- **Prova:** CI do push verde.
- **Teto:** 150 (estimativa 150).

## Lote 6a (node-backend): versão de critério e corte da série do O1
Depende de 4c em `develop`. Código escuro: nada muda na resposta enquanto o interruptor estiver desligado.
- **Comportamento:** registrar a versão de critério e cortar a série do O1 antes da data dela.
- **Arquivos:** `packages/metricas/src/core/criterios.ts` (nova `VersaoCriterio` `criterio-AAAA-MM-DD-bloqueio-com-dado-real`, `afeta` O1, O2, O5, O19 e BLOQUEADOS, descrição começando por "histórico parcial de bloqueios" e registrando a regra do instante da coleta, UX §3 e P-075-2/P-075-6, incluída em `VERSOES_DA_BIBLIOTECA`); `server/src/modulos/metricas/parte-sem-dado.ts` (função pura: pontos da série do O1 anteriores à data da versão ficam `null`, CA-7), ligada só com o interruptor.
- **Data da versão:** a primeira coleta real do BusinessMap (primeiro `coletado_em` de `stg_card`), da consulta do dono na prova abaixo; se a prova ainda não tiver vindo, o 6a mescla com a data pendente marcada no PR e a data entra no 6b.
- **Contrato:** nenhum. **Migração:** nenhuma.
- **Testes:** série do O1 nula antes da data e numérica depois (função pura); a versão aparece na lista da biblioteca; com o interruptor desligado a resposta não muda.
- **Versão de critério T2.6:** a nova acima (degrau esperado no O5: o tempo bloqueado sai da execução).
- **Gatilho de segurança:** nenhum (sem leitura nova).
- **Prova:** CI do push verde.
- **Teto:** 150 (estimativa 100).

## Lote 6b (node-backend): publicação com dado real (BLOQUEADOS, O1, O2, O5, O19)
Depende de 1a a 6a em `develop` e de **prova na base real**, feita pelo dono (o agente não consulta a base).
- **De onde roda a projeção real (TL-A7):** a prova exige os Lotes 2a a 4c no checkout em que o dono coleta e projeta. Antes da prova, o Jarvis confirma com o dono qual é esse checkout. Se for a `main`, os lotes 1a a 4c (e 5a, 5b, 6a, já mesclados) sobem por release `homolog` → `main` antes do 6b; com o interruptor desligado a release não muda a interface (sem validação manual). Se for a `develop` ou o ambiente de homologação local (`pnpm run homolog:subir`), não há release antes.
- **Prova do dono:** depois de uma coleta e uma projeção reais com o 4c, `fato_bloqueio` > 0 (desenho R6) e pelo menos um `evt_bloqueio` `fim` vindo de coleta incremental (confirma que bloquear/desbloquear move `last_modified`, desenho R3; se der 0 com cards sabidamente bloqueados e desbloqueados, o lote para e vira pergunta ao dono). A data da primeira coleta real sai da mesma consulta.
- **Comportamento:** o interruptor liga a publicação real.
- **Arquivos:** `packages/contratos/src/origem.ts` (`BLOQUEIOS_COM_DADO_REAL = true`; BLOQUEADOS, O5 e O19 em `METRICAS_ORIGEM_REAL`; BLOQUEADOS e O5 saem de `MOTIVO_ORIGEM_MOCK`; T10 e T12 não mudam, §5); `servico.ts:306-307` (de "parte de bloqueio sempre nula" para o corte do 6a; a nota `bloqueio-sem-dado-real` deixa de ser emitida, mas o id continua no enum até o 9b para não quebrar a web).
- **Contrato:** sem chave nova nem valor de enum novo; muda só o valor publicado (`docs:check` sem diferença de fotografia). `docs/api/metricas.md` §065 (`:56`, `:407-415`) e `openapi.json` atualizados.
- **Migração:** nenhuma.
- **Testes:** `origem.test.ts` com o mapa novo e **T10 e T12 fora de `METRICAS_ORIGEM_REAL` com `fato_bloqueio` real** (SEG-A5); `painel-real-f6` e `api-stub-065` com os casos Q65 invertidos; O5 e O19 abaixo de 20 por tipo ou motivo sem percentil (biblioteca); CA-075-11 nas respostas de BLOQUEADOS, O1, O2, O5, O19 e na exportação; E2E `*-api` dos cartões com o 5a e o 5b.
- **Versão de critério T2.6:** a do 6a passa a ser publicada.
- **Gatilho de segurança:** projeção passa a ser lida pela API com dado real; parecer do security-engineer.
- **Prova (TL-A6):** CI do push verde; os E2E `*-api` não rodam no push (`ci.yml:193`), então a prova deles é o run do PR em rascunho (run id no parecer do QA); na homologação, o portão da CI; validação manual do dono (a release muda a interface).
- **Teto:** 150 (estimativa 130).
- **Documentação:** CHANGELOG; `docs/analises/064-lacunas-dado-real.md` L1 marcada como corrigida.

## Lote 9a (react-frontend): web sem o ramo "sem dado real" de bloqueio
Depois do 6b em `homolog` validado pelo dono.
- **Comportamento:** a web deixa de depender da nota `bloqueio-sem-dado-real`.
- **Arquivos:** ramos "sem dado real" de BLOQUEADOS, O1, O2 e da faixa "Pede atenção" (065-desenho §5); `web/src/features/operacional/bloqueio-sem-dado.test.tsx` sai ou se inverte.
- **Contrato:** nenhum (só deixa de consumir). **Migração:** nenhuma.
- **Testes:** cartões sem a nota mostram o dado; nenhum uso do id na web (`grep`).
- **Versão de critério T2.6:** nenhuma. **Gatilho de segurança:** nenhum.
- **Prova:** CI do push verde.
- **Teto:** 150 de linhas alteradas, remoções incluídas (estimativa 150; a maior parte é remoção, `teto: excedido` aceito se a divisão quebrar a compilação).

## Lote 9b (node-backend): contrato sem a nota de bloqueio
Depende do 9a.
- **Comportamento:** o enum de notas perde o valor que a API já não emite.
- **Arquivos:** `bloqueio-sem-dado-real` sai de `TEXTO_NOTA_CARTAO` e `NOTA_CARTAO_IDS`; `METRICAS_COM_PARTE_DE_BLOQUEIO` e `MOTIVO_BLOQUEIOS_NAO_COLETADOS`/`MOTIVO_O5_BLOQUEIOS_NAO_COLETADOS` saem de `origem.ts`. `VERSAO_CRITERIO_BLOQUEIO_SEM_DADO_REAL` fica (é história, T2.6).
- **Contrato: incompatível** (valor de enum removido, `politica-de-mudanca.md:23`). Mesmo fluxo do 1a: entradas em `docs/contratos/snapshots/aceitas.json` copiadas da saída do `docs:check` (esperados `resultados/O1`, `resultados/O2`, `resultados/O3`, as fotografias que hoje têm `bloqueio-sem-dado-real`; vale a lista impressa), `motivo` do tipo "075 L9b: remove nota bloqueio-sem-dado-real, que a API não emite desde o 6b; web já não a consome (9a)", gravadas, fotografadas e removidas no mesmo PR; linha do checklist §6 no corpo do PR. Saída por aceite e não `/api/v2`: o único consumidor (web) já foi ajustado no 9a.
- **Migração:** nenhuma.
- **Testes:** os casos do 065 que esperavam a nota saem; CA-12 passa a valer só pelo interruptor (teste de unidade com `BLOQUEIOS_COM_DADO_REAL` falso injetado).
- **Versão de critério T2.6:** nenhuma. **Gatilho de segurança:** nenhum.
- **Prova:** CI do push verde (inclui `docs:check`).
- **Teto:** 150 (estimativa 90).

## 7. Ordem e paralelismo
- **Back-end (node-backend, em série, TL-A8):** 1a → 1b → 3 → 2a → 2b → 4a → 4b → 4c → 6a → [release, se a projeção real roda da `main`, TL-A7] → prova do dono → 6b → (depois do 9a) 9b. O 3 vem antes do 2a por ser menor e independente; pode trocar de lugar sem mudar dependências. O 4c vem antes da prova e do 6b (SEG-A1): o 6b não abre sem o 4c mesclado.
- **Front-end (react-frontend):** 5a → 5b, a partir do 1a mesclado, em paralelo à série do back-end; 9a depois do 6b em `homolog` validado pelo dono.
- **QA:** o qa-engineer escreve em paralelo, desde o 1a, os CA-075-1 a 12 e os CA-1 a CA-12 da UX como teste, e dá parecer em `docs/qa/` de cada lote.
- **Segurança (SEG-A6):** parecer do security-engineer sobre o commit final dos Lotes 1a, 2a, 2b, 3, 4a, 4b, 4c e 6b (gatilhos de cada lote).
- **Review:** o tech-lead revisa todos, incluindo a classificação de contrato e o aceite do 1a e do 9b.
- Um cartão em andamento por agente.

## 8. Riscos e pontos em aberto
- R1 e R2 do desenho continuam (bloqueio curto invisível, instante com erro de até um intervalo de coleta) enquanto a coleta for manual; a agenda diária (P-075-7, E5.1) reduz o erro a um dia. O texto de precisão do 5b diz isso na tela.
- R3 (`last_modified`) é verificado só na prova do 6b; se falhar, a via A perde eventos e o lote para (pergunta ao dono, não ajuste no código).
- Custo da leitura de todas as versões de `stg_card` a cada `bm:projetar` (4a): medido localmente e no parecer; se passar do orçamento da ADR 0003, ler só versões posteriores ao último `evt_bloqueio` do card, sem mudar a regra. A reclassificação do passado pelo mapa (4b) depende de a projeção percorrer todos os cards; se essa otimização entrar, ela precisa manter a remontagem do fato a partir dos eventos.
- Checkout da projeção real (TL-A7): fato operacional a confirmar com o dono antes da prova; não é regra de negócio.
- A regra de derivação é decisão estrutural nova (projetor deriva evento de instantâneo; evento com código da fonte, tradução na projeção). Recomendo uma ADR curta registrando a via A, o `id_origem`, o `motivo_codigo` como código da fonte e o critério de reversão (fato observável: a via B for escolhida pelo dono, ou a prova do 6b mostrar evento perdido por `last_modified`); esta delegação não toca ADRs, então fica para o Jarvis delegar.
- A ADR 0020 não ganha revisão (nenhum campo novo da fonte); a revisão 5 continua sendo a condição da via B.
