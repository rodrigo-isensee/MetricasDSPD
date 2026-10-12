# Auditoria do banco de dados (PostgreSQL 17)

- Data: 2026-10-12 · Autor: `software-architect` · Pedido do usuário: "como estão as práticas para o banco; estamos aplicando as melhores práticas, índices e tudo mais?"
- Escopo lido: `server/migrations/0001` a `0012`, `server/src/plataforma/db/*`, os repositórios (`modulos/metricas|operacao|referencia/repositorio.ts`) e as demais consultas SQL do servidor (`businessmap/staging.ts`, `businessmap/webhook.ts`, `operacao/concluida.ts`, `plataforma/eventos/outbox.ts`, `plataforma/saude.ts`), `docker/postgres/init`, `docker-compose.yml`, `.github/workflows/ci.yml`, os testes `server/tests/*.pg.test.ts` e `tests/pg/desempenho.ts`, `docs/architecture/data-model.md`, `server.md`, ADRs 0010, 0014 e 0015.
- **A ADR 0016 (SCD tipo 2) não existe** neste worktree nem no repositório principal. Ela é citada em `docs/security/varredura-de-segredos-2026-10-12.md:72`. O desenho SCD2 vigente está em `data-model.md:83-89` (§3.2), e foi esse o texto auditado.
- **Kysely (ADR 0015, S-14 a S-17) ainda não foi implementado:** não existe `plataforma/db/kysely.ts`, e os repositórios continuam em `pg` puro com SQL interpolado por `${S.x}`. A auditoria vale para o código atual.
- Método: revisão estática. Nenhuma consulta foi executada. Os números de desempenho citados são os que `server.md:163` registrou a partir de `tests/pg/desempenho.ts`.

Legenda: **C** = conforme · **L** = lacuna (falta prática, sem dano imediato) · **R** = risco (pode causar dano: dado errado, perda, indisponibilidade). Severidade: alta, média, baixa, info. Esforço: P (até meio dia), M (1 a 3 dias), G (mais que isso).

---

## 1. Resumo

O banco está **bem acima da média em modelagem, integridade do histórico e segurança de acesso**:
- tipos corretos;
- append-only garantido por privilégio e por gatilho, com teste;
- GRANT por coluna para dados de pessoa, com teste negativo conectando como cada papel;
- idempotência por `ON CONFLICT ON CONSTRAINT`;
- migrações reversíveis com checksum e teste `up → down → up`;
- job `banco` no CI contra um Postgres real.

As fraquezas estão em quatro pontos:
1. **Operação.** Não há backup automatizado nem restauração testada, e um `migrate down` em produção apaga o staging, que é irrecuperável.
2. **Timeouts e conexões.** Faltam `lock_timeout`, `idle_in_transaction_session_timeout` e `connectionTimeoutMillis`, e há um vazamento possível de advisory lock.
3. **Desempenho medido, mas sem trava.** `desempenho.ts` é manual, os EXPLAIN dele não são as consultas reais e o CI não tem teste de plano.
4. **Índices desenhados para filtros que o servidor não aplica no SQL.** Metade dos índices das projeções não atende nenhuma consulta de hoje, enquanto duas consultas reais crescem sem limite.

Há ainda um **risco de correção**: a carga de transições lê `fato_transicao` direto, e não a view canônica. Quando o webhook gravar transições, elas vão contar em dobro.

---

## 2. Modelagem

| # | Ponto | Evidência | Classe | Sev. | Esf. |
|---|---|---|---|---|---|
| M1 | Instantes em `timestamptz(3)`, sessão em UTC; datas civis em `date` | `ddl.ts:17`, `pool.ts:39`, `init/01-databases-papeis.sh:21`, `0006:22` (`data_acordada date`) | C | — | — |
| M2 | Valores exatos em `numeric`, nunca `float` (`duracao_horas_uteis numeric(12,2)`, `divergencia_pct numeric(7,4)`, prazos `numeric(8,2)`). `int8` e `numeric` chegam ao TS como `string` | `0006:35`, `0002:40`, `0009:32`, `pool.ts:18-24` | C | — | — |
| M3 | `float8` só na **saída** de duas consultas (epoch ms), o que é exato até 2^53 ms e escolha consciente de desempenho | `metricas/repositorio.ts:59`, `:91-92`, `server.md:163` | C | — | — |
| M4 | Listas fechadas em `text + CHECK IN (...)`, sem `ENUM`; códigos de domínio em `varchar(80)` iguais a `ref_dominio.codigo` | `ddl.ts:21-22`, `ddl.ts:12`, `data-model.md:32` | C | — | — |
| M5 | Chave natural da origem com `CHECK` de ASCII visível; chave substituta `bigint GENERATED ALWAYS AS IDENTITY` | `ddl.ts:15-16`, `ddl.ts:19` | C | — | — |
| M6 | Rastro de origem: `sistema_origem` com `CHECK` constante por schema, o que torna mistura BM × AC impossível por linha | `ddl.ts:24-26`; testado em `staging.pg.test.ts:77-85` | C | — | — |
| M7 | Hash `bytea` com `CHECK (octet_length = 32)` | `ddl.ts:18` | C | — | — |
| M8 | Normalização: staging em `jsonb` bruto, eventos normalizados, projeções desnormalizadas (forma do briefing 4.5), referência com vigência. As camadas são separadas de propósito | `data-model.md:9-24` | C | — | — |
| M9 | Códigos de domínio sem FK para `ref_dominio` (decisão registrada: a vigência está na PK, e a FK travaria a substituição de projeção). A integridade fica a cargo da "reconciliação", que **ainda não existe em código** | `data-model.md:36`; nenhuma consulta de órfãos em `server/src` | L | baixa | P |
| M10 | `status_sla_pa` sem `CHECK` até a resposta da P5 (registrado) | `ddl.ts:114-115` | L (aceita) | info | — |
| M11 | Valor de domínio fixo dentro de view: `p.status = 'Concluído'` (o restante do recorte vem de `ref_dominio`) | `0009:54` | L | baixa | P |
| M12 | SCD2 sem `vigente_ate`: a vigente é o maior `vigente_de` por card, servida pelo `UNIQUE (card_id, vigente_de)`. A consulta "estado em X" usa o mesmo índice. Duas mudanças no mesmo milissegundo colidem no `UNIQUE`, e o desenho de WS2 precisa dizer o que fazer nesse caso | `0005:28`, `0008:23`, `data-model.md:89` | C (com nota) | info | — |
| M13 | Tamanho de `equipe` diverge: `varchar(60)` no BM (`dim_card`, `ref_quadro`) e `varchar(80)` no AC (`dim_chamado`). Como os domínios são separados, não há mistura, só inconsistência | `0005:18`, `0007:10`, `ddl.ts:98` | L | info | P |

## 3. Integridade

| # | Ponto | Evidência | Classe | Sev. | Esf. |
|---|---|---|---|---|---|
| I1 | `NOT NULL` explícito em todas as colunas, `CHECK` de não negativo nos contadores, `UNIQUE` nomeado para cada chave natural (`uq_<tabela>`) | `0002:16-24`, `0004:20,34,41,50`, `0005:28-53` | C | — | — |
| I2 | Cadeia linear do staging por `UNIQUE NULLS NOT DISTINCT (chave, anterior_sk)`; borda A→B→A e concorrência testadas | `ddl.ts:72`, `staging.pg.test.ts:21-75` | C | — | — |
| I3 | FK física só para `ctl_coleta` e entre tabelas imutáveis (decisão registrada) | `ddl.ts:28-29`, `0005:29,47-48`, `data-model.md:36` | C | — | — |
| I4 | **Vigência sem `CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de)`** em nenhuma das 13 tabelas `ref_*` com vigência. Também não há proteção contra vigências **sobrepostas** fechadas: só a aberta é única (índice parcial) | `ddl.ts:83-87`; `0007`, `0009:27-33`, `0010:21-37`, `0012:13` | L | média | P |
| I5 | Intervalos sem `CHECK` de ordem: `fato_bloqueio (fim >= inicio)`, `fato_etapa_chamado (saida >= entrada)`, `ctl_coleta (finalizado_em >= iniciado_em)`, `marca_dagua_ate >= marca_dagua_de` | `0006:34`, `0009:23`, `0002:13-15` | L | média | P |
| I6 | Invariante de estado de `ctl_coleta` não garantida (`status = 'em_andamento'` se e só se `finalizado_em IS NULL`). O código se defende repetindo `finalizado_em IS NOT NULL` nas consultas | `0002:13-14`; `operacao/repositorio.ts:24,65,79` | L | baixa | P |
| I7 | Faixas de valor sem `CHECK`: `ref_alocacao_acordada.percentual` (0 a 100), `ref_alvo_prioridade.prazo_*` (> 0), `ref_sle.dias_uteis` (> 0), `ref_calendario_turno.fim_min` (≤ 1440), `ref_calendario.offset_minutos` | `0007:21,24`, `0009:32`, `0010:20-25` | L | baixa | P |
| I8 | `outbox`: estado sem `CHECK` cruzado (`processado` ⇒ `processado_em` não nulo; `processando` ⇒ `reservado_ate` não nulo) | `0011:15-18` | L | baixa | P |
| I9 | `ref_versao_criterio_metrica.metrica_id` sem `CHECK`; o código descarta id desconhecido em silêncio | `0010:16`, `operacao/repositorio.ts:55` | L | baixa | P |

## 4. Índices: cada consulta real e o índice que a cobre

O volume esperado é de ~2 mil cards ativos + ~2 mil arquivados por quadro. **Suposição:** o número de quadros ainda não foi informado. A medição de `server.md:163` (27.798 cards, 226.571 transições, 30.057 chamados, 223.097 etapas) equivale a ~7 quadros. As cargas da API leem a tabela inteira por versão de carga (cache), por desenho (`server.md:164`).

### 4.1 Consultas de leitura

| # | Consulta (arquivo:linha) | Índice que atende | Situação |
|---|---|---|---|
| Q1 | `lerCards`: `dim_card` inteira, `ORDER BY card_id` (`metricas/repositorio.ts:45-53`) | PK `card_id` (ou varredura + sort em memória) | C. Varredura por desenho; p95 151-162 ms |
| Q2 | `lerTransicoes`: `fato_transicao` inteira, sem ORDER BY (`:56-61`) | nenhum (varredura) | C para índice; **R de correção, ver R1** |
| Q3 | `lerBloqueios`: `ORDER BY card_id, inicio, bloqueio_sk` (`:63-68`) | `ix_fato_bloqueio_card (card_id, inicio)` permite incremental sort | C |
| Q4 | `lerColunas`: `vigente_ate IS NULL` (`:70-75`) | `uq_ref_coluna_vigente` (parcial) | C |
| Q5 | `lerChamados`: inteira, `ORDER BY chamado_id` (`:77-86`) | PK | C |
| Q6 | `lerEtapas`: inteira (`:89-93`) | nenhum (varredura) | C |
| Q7-Q13 | `lerDominio`, `lerLimitesWip`, `lerLimiteFrentes`, `lerSle`, `lerAlocacao`, `lerFichas`, `lerAlvos`: chave + `vigente_ate IS NULL` (`:105-140`) | `uq_<ref>_vigente` (índice parcial, chave na ordem certa) | C |
| Q14 | `lerEventos` (coletas): `tarefa = 'coleta_incremental' AND status <> 'em_andamento' ORDER BY iniciado_em DESC, coleta_id DESC`, **sem LIMIT** (`operacao/repositorio.ts:22-25`) | `ix_ctl_coleta_incremental` (parcial, `0012:18-19`) | **R2**: o índice serve, mas a consulta devolve o histórico inteiro a cada chamada; a paginação de 20 é feita em memória (`operacao/servico.ts:16`) |
| Q15 | `lerEventos` (contagens): `JOIN` de todo o histórico de `ctl_coleta_contagem` (`:26-29`) | PK `(coleta_id, entidade)` | **R2** (mesma causa) |
| Q16 | `lerVersoes`: `dominio = $1 ORDER BY vigente_desde, versao_id` (`:47-50`) | `ix_ref_versao_criterio_dom (dominio, vigente_desde)` + PK de `_metrica` | C |
| Q17 | `lerFimUltimaColetaOk`: `status = 'sucesso' ... ORDER BY finalizado_em DESC LIMIT 1` (`:63-66`) | `ix_ctl_coleta_ok` (parcial, `0012:16-17`) | C |
| Q18 | `lerMarcaDagua`: `tarefa = ANY($1) AND status = 'sucesso' ... LIMIT 1` (`:77-80`) | `ix_ctl_coleta_ok` | C |
| Q19 | `lerEquipesBM`: `DISTINCT equipe` vigente (`referencia/repositorio.ts:8-10`) | tabela pequena, varredura | C |
| Q20 | `lerSistemasBM` (`:16-18`) | `uq_ref_dominio_vigente` | C |
| Q21 | `lerInicioBM`: `min(criado_em)` (`:24-25`) | `ix_dim_card_criado` | C |
| Q22 | `lerInicioAC`: `min(aberto_em)` (`:29-30`) | `ix_dim_chamado_aberto` (`0012:15`) | C |
| Q23 | `lerVersaoCriterioVigente`: `vigente_desde <= $1 ORDER BY vigente_desde DESC LIMIT 1`, **sem filtro de domínio** (`:36-38`) | nenhum (o índice começa por `dominio`); dezenas de linhas | C (info) |
| Q24 | `/health/ready`: `SELECT 1` (`saude.ts:16`) | — | C |

### 4.2 Consultas de escrita

| # | Consulta (arquivo:linha) | Índice que atende | Situação |
|---|---|---|---|
| W1 | Última versão do card: `WHERE id_origem = $1 ORDER BY stg_sk DESC LIMIT 1` (`staging.ts:24`) | `ix_stg_card_ultima (id_origem, stg_sk DESC)` (`ddl.ts:75`) | C. Poderia ser index-only com `INCLUDE (payload_sha256)` (opcional, X3) |
| W2 | `INSERT ... ON CONFLICT ON CONSTRAINT uq_stg_card` (`staging.ts:28-32`) | `uq_stg_card` | C |
| W3 | Webhook: `ON CONFLICT ON CONSTRAINT uq_stg_webhook_evento` + `INSERT` na outbox (`webhook.ts:36-45`) | `uq_stg_webhook_evento (payload_sha256)` | C |
| W4 | Reserva da outbox: `fonte = $1 AND tipo = ANY($4) AND ((pendente AND disponivel_em <= $2) OR (processando AND reservado_ate < $2)) ORDER BY evento_sk LIMIT $3 FOR UPDATE SKIP LOCKED` (`outbox.ts:50-54`) | `ix_outbox_fila (fonte, disponivel_em, evento_sk) WHERE status IN (pendente, processando)` (`0011:21`) | **R3**: o índice não tem `tipo`. Os eventos `bm.webhook.recebido` ficam `pendente` sem consumidor por desenho (`server.md:165`) e se acumulam no índice parcial. Cada ciclo do poller relê esse acúmulo inteiro para descartá-lo pelo `tipo` |
| W5 | `UPDATE outbox ... WHERE evento_sk = ...` (`outbox.ts:58-85`) | PK | C |
| W6 | Retenção: `DELETE ... WHERE status = 'processado' AND processado_em < $1` (`outbox.ts:90-93`) | `ix_outbox_retencao` (parcial) | C. Linhas `falha` nunca saem (L, info) |
| W7 | `fecharColeta`: `UPDATE ctl_coleta WHERE coleta_id = $1 AND status = 'em_andamento'` (`concluida.ts:19-23`) | PK | C |
| W8 | Seed: `ctl_coleta WHERE versao_coletor = $1` (`seed.ts:159-160`) | nenhum; só desenvolvimento | C |

### 4.3 Índices que nenhuma consulta atual usa

Há indícios de escrita desnecessária. As projeções são refeitas por `DELETE + INSERT` (`data-model.md:22`), e cada índice multiplica a escrita e as tuplas mortas a cada rebuild.

| Índice | Onde | Observação |
|---|---|---|
| `ix_dim_card_equipe`, `ix_dim_card_sistema`, `ix_dim_card_abertos`, `ix_dim_card_pai` | `0006:27-31` | desenhados para filtros por painel (`data-model.md:199-213`), mas o filtro é aplicado em memória (`server.md:164`) |
| `ix_fato_transicao_ocorrido` | `0005:60` | idem |
| `ix_fato_transicao_card` | `0005:59` | sem uso na API; **manter**, porque é o acesso natural do projetor de WS2 (marcos por card) |
| `ix_fato_bloqueio_abertos` | `0006:38` | idem filtros |
| `ix_dim_chamado_equipe`, `ix_dim_chamado_abertos` | `0009:21-22` | `_abertos (aberto_em) WHERE data_finalizado IS NULL` ficou quase redundante com `ix_dim_chamado_aberto (aberto_em)` completo (`0012:15`) |
| `ix_fato_etapa_etapa` | `0009:26` | idem filtros |
| `ix_ctl_coleta_tarefa` | `0002:20`, `0003:20` | substituído na prática pelos parciais da `0012` |
| `ix_<stg>_coletado` (8 tabelas) e `ix_stg_webhook_evento_recebido` | `ddl.ts:77`, `0004:23,35` | "reprocessamento e retenção" (`data-model.md:209`): nenhuma consulta existe ainda |

Classificação: **L, baixa** no volume atual. A recomendação é medir antes de apagar: `pg_stat_user_indexes.idx_scan = 0` depois de 30 dias de uso real (cartão C9).

### 4.4 Outros pontos de índice

| # | Ponto | Evidência | Classe | Sev. | Esf. |
|---|---|---|---|---|---|
| X1 | FK sem índice, contrariando a regra do próprio modelo ("toda FK indexada", `data-model.md:37`): `dim_card_versao.stg_card_sk`, `dim_chamado_versao.stg_chamado_sk`, `ref_feriado.incluido_por_versao_id`, `ref_calendario_aplicacao.calendario_id`. Como a tabela pai é append-only (o gatilho proíbe DELETE), o custo clássico (varredura no DELETE do pai) não ocorre. O custo real é a busca "versões geradas por este staging" no reprocessamento | `0005:16,29`, `0008:20,24`, `0010:30-36` | L | baixa | P |
| X2 | Demais FKs indexadas (como primeira coluna de PK ou UNIQUE, ou `ix_*_coleta`) | `ddl.ts:76`, `0002:25,34`, `0004:41,44`, `0005:45-46,58` | C | — | — |
| X3 | Índice de cobertura possível em W1: `(id_origem, stg_sk DESC) INCLUDE (payload_sha256)`. Tabela insert-only tem o visibility map mantido pelo autovacuum de inserção (PG 13+), então o index-only scan funciona | `ddl.ts:75` | L (opcional) | info | P |
| X4 | **BRIN:** adequado para `stg_*.coletado_em` e `stg_webhook_evento.recebido_em` (append-only e correlacionados com a ordem física). Substituiria os B-tree de X-4.3 com 1% do tamanho, **quando** existir a consulta de retenção ou reprocessamento. **Não** serve para `fato_transicao.ocorrido_em`: a carga histórica de revisions insere fora de ordem | `ddl.ts:77` | L | info | P |
| X5 | Ordem de colunas: as parciais de vigência e a `ix_stg_*_ultima` estão na ordem certa (igualdade primeiro, ordenação depois); `ix_ctl_coleta_ok/_incremental` têm `DESC` alinhado ao `ORDER BY` | `ddl.ts:75,86`, `0012:16-19` | C | — | — |

## 5. Planos de consulta e orçamento de desempenho

| # | Ponto | Evidência | Classe | Sev. | Esf. |
|---|---|---|---|---|---|
| P1 | Existe medição com volume ~5x e EXPLAIN (ANALYZE, BUFFERS), e o resultado está registrado (p95 de 1 a 354 ms nas cargas contra o orçamento de 500 ms; API p95 de 143 a 149 ms sem cache contra 300 ms) | `tests/pg/desempenho.ts`, `server.md:163` | C | — | — |
| P2 | **A medição é manual e fica fora do CI** ("Não faz parte da suíte", `desempenho.ts:4`). O job `perf` roda Playwright e Lighthouse, não `desempenho.ts` (`ci.yml:190-208`). Uma regressão de plano passa sem aviso | — | L | média | M |
| P3 | **Os EXPLAIN de `desempenho.ts` não são as consultas reais:** `fato_transicao` e `fato_etapa_chamado` têm `ORDER BY` que o repositório removeu (`desempenho.ts:71,74` contra `repositorio.ts:56-61,89-93`); a outbox é medida com outra consulta (`desempenho.ts:82`: ordena por `disponivel_em`, sem `tipo` e sem o `OR` de reserva vencida, contra `outbox.ts:50-54`) | ver ao lado | L | média | P |
| P4 | `data-model.md:197` diz que os EXPLAIN estão "registrados em `docs/architecture/explain/`". **O diretório não existe** | Glob vazio | L (doc) | baixa | P |
| P5 | Teto de crescimento: as cargas são lineares no volume. Com ~20 quadros (~80 mil cards, ~650 mil transições, pela proporção medida), `lerTransicoes` passaria de ~1 s, o dobro do orçamento de 500 ms, mas por versão de carga e não por requisição. `server.md:164` já aponta a saída (carga incremental por marca d'água). Falta registrar o gatilho numérico | `server.md:163-164` | L | baixa | P |
| P6 | Acelerato: o volume real de chamados é desconhecido (o mock tem ~30 mil a 5x). Cada coleta lê a tabela inteira do Metabase e deduplica pelo hash (`data-model.md:141`), então o crescimento do staging depende só das mudanças | — | info | — | — |

## 6. Append-only e imutabilidade

| # | Ponto | Evidência | Classe | Sev. | Esf. |
|---|---|---|---|---|---|
| A1 | Gatilho `BEFORE UPDATE OR DELETE` (por linha) e `BEFORE TRUNCATE` (por instrução) em toda `stg_`, `evt_`, `rec_`, `*_versao` e `fato_transicao`, valendo até para o dono | `ddl.ts:47-50`, `0001:14-18` | C | — | — |
| A2 | Coberto por teste de catálogo: o gatilho existe em toda tabela append-only e em nenhuma outra; barra UPDATE, DELETE e TRUNCATE do migrador | `catalogo.pg.test.ts:36-56` | C | — | — |
| A3 | Por privilégio: o coletor só tem `SELECT, INSERT` nas imutáveis; ninguém tem `TRUNCATE`, `REFERENCES` nem `TRIGGER` | `grants.ts:45`, `catalogo.pg.test.ts:87-92` | C | — | — |
| A4 | `ctl_coleta_falha`, `ctl_reconciliacao` e `ctl_automacao` são append-only só por privilégio, sem gatilho (decisão registrada) | `grants.ts:47-52`, `0009:34` | C (aceita) | — | — |
| A5 | **`DROP TABLE` não é barrado por gatilho de DML.** O `down` das migrações apaga staging e eventos (`ddl.ts:89`, `0004:55-56`, `0005:69`, `0008:34`). `cli.ts:9-12` aceita `down N` e `redo` em qualquer banco, inclusive `metricas`, sem trava. O staging é a única cópia do que a ferramenta não devolve mais (`ADR 0010:36`) | ver ao lado | **R** | **alta** (impacto) / baixa (probabilidade) | P |

## 7. Particionamento

**Não é necessário agora.** Com as suposições acima, as maiores tabelas (`fato_transicao`, `stg_revision`, `stg_card`) ficam na casa de 10^5 a 10^6 linhas e poucos GB. Particionar traria custo:
- a PK e os UNIQUE precisariam incluir a coluna de partição, o que quebra `uq_stg_*` (chave do item, `anterior_sk`);
- o planejamento de consultas fica mais caro;
- os GRANTs passariam a valer por partição.

O append-only já elimina o principal motivo prático (descarte por `DROP PARTITION`).

**Gatilho para reavaliar:** `pg_total_relation_size` de qualquer `stg_*` acima de ~50 GB, ou uma regra de retenção LGPD que exija descarte por período (S-32). Nesse caso, a candidata é `RANGE (coletado_em)` mensal só no staging, com a chave natural reescrita. Para payloads `jsonb` grandes, avaliar `ALTER TABLE ... ALTER COLUMN payload SET COMPRESSION lz4` (PG 14+), que custa P e não muda o modelo.

## 8. Migrações

| # | Ponto | Evidência | Classe | Sev. | Esf. |
|---|---|---|---|---|---|
| G1 | SQL explícito revisado igual ao executado (`ddl(S)` puro); checksum por migração; `checkOrder` | `executar.ts:6-16`, `checksums.ts:6-7`, `migrar.ts:62-66` | C | — | — |
| G2 | Reversíveis e testadas: `up → (up de novo não faz nada) → down de todas → up` com contagem de objetos; DDL transacional testada | `migracoes.pg.test.ts:26-65` | C | — | — |
| G3 | GRANTs reaplicados ao fim de cada migração, começando por `REVOKE` geral (idempotente e testado) | `migrar.ts:30-44`, `grants.ts:31-33`, `catalogo.pg.test.ts:94-103` | C | — | — |
| G4 | **Sem `lock_timeout`** no cliente do migrador (`migrar.ts:59`). Um `CREATE INDEX` ou `ALTER TABLE` que espera atrás de uma carga longa da API (`statement_timeout` de 10 s) ou do coletor (60 s) **enfileira todas as leituras seguintes** atrás do pedido de lock | `migrar.ts:59`; `0012:15-19` criou índices sem `CONCURRENTLY` em tabelas existentes | L | média | P |
| G5 | `CREATE INDEX CONCURRENTLY` está previsto mas sem regra objetiva de quando usar (`ADR 0014:52`). A `0012` foi segura por causa do volume. Falta a regra: índice novo em tabela com mais de ~100 mil linhas em produção vai em migração própria com `pgm.noTransaction()` e `CONCURRENTLY` | `ADR 0014:52` | L | baixa | P |
| G6 | O comentário diz "uma transação para o lote" (`migrar.ts:51`), mas `singleTransaction` não é passado ao `runner` (`migrar.ts:62-66`). A atomicidade por lote depende do padrão da biblioteca. Tornar a opção explícita | `migrar.ts:51,62-66` | L (doc/código) | baixa | P |
| G7 | O snapshot de esquema compara só colunas, tipos, nulidade e default (`information_schema.columns`). **Índices, CHECKs, UNIQUE e FKs não entram:** um índice removido ou um CHECK afrouxado passa no CI | `catalogo.pg.test.ts:17-25` | L | média | P |
| G8 | Expandir → migrar → contrair e backup antes de migrar em produção estão decididos na ADR, mas não há script | `ADR 0010:32` | L | média | P (junto de C2) |

## 9. Segurança

| # | Ponto | Evidência | Classe | Sev. | Esf. |
|---|---|---|---|---|---|
| S1 | Um papel por pool, com privilégio mínimo: a `api` só recebe `dspd_api` e o `worker` só `dspd_coletor` | `docker-compose.yml:38-62`, `entradas/api.ts:8-9`, `grants.ts:21-76` | C | — | — |
| S2 | GRANT por coluna derivado da lista fechada `COLUNAS_PESSOA`; testes negativos com `42501` conectando como cada papel, inclusive por `SELECT *` e através de view | `grants.ts:36-59`, `lgpd.ts:11-15`, `papeis.pg.test.ts:24-46`, `catalogo.pg.test.ts:72-85` | C | — | — |
| S3 | Views `security_invoker`, sem coluna de pessoa (testado) | `catalogo.pg.test.ts:58-70` | C | — | — |
| S4 | `public` fechado; sem `SECURITY DEFINER`; identificadores só do prefixo validado; valores sempre parametrizados | `init/...sh:22-25`, `esquemas.ts:8-12`, `seed.ts:124-129` | C | — | — |
| S5 | `search_path` não é fixado, mas todo SQL é qualificado por schema (`esquemas.ts:2`) e `public` não aceita `CREATE`. Fixar `search_path` por papel é defesa em profundidade | `esquemas.ts:2` | L | info | P |
| S6 | RLS: **não se aplica**. Não há multi-inquilino, e a fronteira de pessoa é por coluna, não por linha. RLS para "nenhuma visão individual" não ajudaria, porque a regra proíbe agregar e não ler linhas | — | C (n/a) | — | — |
| S7 | `statement_timeout` por pool (API 10 s, webhook 5 s, worker 60 s) | `pool.ts:36-38`, `entradas/api.ts:8-9`, `entradas/worker.ts:13` | C | — | — |
| S8 | **Faltam `lock_timeout`, `idle_in_transaction_session_timeout` e `connectionTimeoutMillis`.** A ADR 0015 diz que o `idle_in_transaction` está "definido no init" (`ADR 0015:68`), mas o init não define nenhum parâmetro por papel (`init/...sh:9-14`); é a S-19, ainda pendente (`ADR 0015:91`). Sem `connectionTimeoutMillis`, `pool.connect()` espera para sempre com o pool esgotado ou o banco fora. Também não há `application_name`, então `pg_stat_activity` não distingue os pools | `pool.ts:35-41` | L | média | P |
| S9 | Senhas com padrão fraco por `:-` no Compose (`docker-compose.yml:11-17`). A porta já está em `127.0.0.1` (`:18`), o que mitiga; já aceito para desenvolvimento em `revisao-de-seguranca.md` I-1. Para qualquer ambiente hospedado: `:?` (obrigatório) | `docker-compose.yml:11-17` | L | baixa | P |
| S10 | SSL: nenhuma configuração no pool. Hoje tudo é local, na mesma rede Docker (ADR 0014), então não há caminho de ataque. Quando o banco sair da máquina: `sslmode=verify-full` e validação na config que recuse host não local sem SSL | `pool.ts:37-40` | L | info (hoje) | P |
| S11 | Imagem `postgres:17` sem versão menor fixa nem digest (Compose e CI) | `docker-compose.yml:7`, `ci.yml:90` | L | baixa | P |
| S12 | `dspd_api` lê `ctl_coleta_falha.erro` e `ctl_coleta.parametros`. A ausência de dado pessoal ali é garantida só pelo código (`data-model.md:189`) | `grants.ts:55` | L | baixa | P |

## 10. Operação

| # | Ponto | Evidência | Classe | Sev. | Esf. |
|---|---|---|---|---|---|
| O1 | **Backup e restauração:** a única menção é "`pg_dump` local agendado pelo usuário" (`overview.md:153`). Não há script, agendamento, cópia fora da máquina nem **teste de restauração** (busca por `pg_dump`, `pg_basebackup`, `archive_mode` no repositório: só a frase do overview). O staging é irrecuperável (`ADR 0010:36`) | — | **R** | **alta** | M |
| O2 | PITR (arquivamento de WAL): ausente. Num único host local, `pg_dump` diário + teste de restauração cobre o essencial; PITR só se a perda de até 24 h de coleta não for aceitável. Isso é decisão do usuário (I-14) | — | L | média | M |
| O3 | Monitoramento: só `SELECT 1` (`saude.ts:16`). Sem `pg_stat_statements`, `log_min_duration_statement`, `log_lock_waits` nem `auto_explain`. Sem isso não há como confirmar 4.3 (índices sem uso) nem achar a consulta lenta em produção | `docker-compose.yml:6-27` (sem `command:`) | L | média | P |
| O4 | Autovacuum: as tabelas insert-only são atendidas pelo autovacuum de inserção (PG 13+). As projeções (`DELETE + INSERT` no rebuild) e a `outbox` (UPDATE e DELETE em ciclo) geram tuplas mortas. No volume atual o padrão basta; acompanhar `n_dead_tup` e, para a outbox, considerar `autovacuum_vacuum_scale_factor = 0.01` | `data-model.md:22`, `outbox.ts:58-93` | info | — | P |
| O5 | Retenção e eliminação LGPD em tabelas append-only: sem procedimento. Já rastreado como **S-32** (`revisao-de-seguranca.md:165`) e I-12 (DPO) | `data-model.md:253` | L (já em cartão) | média | M |
| O6 | Extensões: nenhuma (`gen_random_uuid()` é nativo desde o PG 13). C | `0011:11` | C | — | — |

## 11. Pool e transações

| # | Ponto | Evidência | Classe | Sev. | Esf. |
|---|---|---|---|---|---|
| T1 | `READ COMMITTED` (padrão) e documentado como requisito da releitura do staging | `staging.ts:10-11` | C | — | — |
| T2 | Outbox: reserva com `FOR UPDATE SKIP LOCKED` confirmada **antes** de chamar o consumidor, reserva com prazo e backoff; dois pollers e rollback testados no Postgres | `outbox.ts:47-96`, `outbox.pg.test.ts:21-27` e seguintes | C | — | — |
| T3 | Advisory locks sempre `pg_try_*` (não bloqueante): por fonte no worker e por schema no seed (`xact`) | `trava.ts:14`, `seed.ts:158` | C | — | — |
| T4 | **Vazamento possível de advisory lock:** se `pg_advisory_unlock` falhar (`trava.ts:19`), o `finally` externo devolve ao pool uma conexão que **ainda segura o lock de sessão** (`trava.ts:22`). A fonte fica travada até essa conexão fechar, e as próximas execuções devolvem `executou: false` | `trava.ts:16-23` | **R** | média | P |
| T5 | `emTransacao`: se o `ROLLBACK` falhar (conexão quebrada), o erro original se perde e o cliente volta ao pool sem `release(err)` | `pool.ts:51-55`; padrão igual em `migrar.ts:39-41` | L | baixa | P |
| T6 | Deadlocks: hoje não há duas transações que escrevam as mesmas linhas em ordens diferentes. O projetor de WS2 (rebuild por entidade) precisa ordenar por chave (`ORDER BY card_id`) as entidades afetadas. Registrar como regra no plano de WS2 | — | info | — | — |
| T7 | Tamanhos de pool (API 10, webhook 4, worker 10) cabem com folga em `max_connections` 100 | `pool.ts:36`, `entradas/api.ts:9` | C | — | — |

## 12. Testes de banco

| # | Ponto | Evidência | Classe | Sev. | Esf. |
|---|---|---|---|---|---|
| E1 | Job `banco` no CI: Postgres 17 real, o **mesmo script de init** do Compose, `test:pg`, schemas prefixados por execução | `ci.yml:81-120`, `tests/pg/global-setup.ts:19-27` | C | — | — |
| E2 | Paridade mock × Postgres das 33 métricas com seed real e papel `dspd_api`, mais a paridade com dublê | `server.md:162`, `metricas.paridade.test.ts:16-30` | C | — | — |
| E3 | Catálogo: snapshot de colunas, LGPD, gatilhos, `security_invoker`, privilégios, idempotência dos GRANTs | `catalogo.pg.test.ts` | C (ver G7) | — | — |
| E4 | Concorrência real (8 e 4 escritores) no staging | `staging.pg.test.ts:33-47` | C | — | — |
| E5 | Sem teste de plano nem de orçamento no CI | P2, P3 | L | média | M |
| E6 | Sem teste de restauração de backup | O1 | L | alta | M (com C2) |

---

## 13. Riscos fora de "boas práticas" que a auditoria encontrou

**R1. Transições em dobro quando o webhook entrar (alta, P).**
- `lerTransicoes` lê `${S.bm}.fato_transicao` direto (`metricas/repositorio.ts:60`).
- O modelo define que a biblioteca consome a **view canônica** `vw_transicao_canonica`: todas as `revision` + webhooks **sem par** (`data-model.md:91`; view em `0005:62-67`). O próprio `grants.ts:19` diz que a API lê `fato_transicao` "só porque `vw_transicao_canonica` a lê".
- Hoje o seed só grava `fonte = 'revision'` (`seed.ts:63`), por isso a paridade passa.
- Quando o consumidor do webhook (WS2) gravar `fonte = 'webhook'`, cada movimentação casada passa a contar duas vezes no CFD, no WIP e nos marcos. O dado sai errado sem nenhum erro.
- Correção: `FROM ${S.bm}.vw_transicao_canonica`, mais um teste no Postgres com um par webhook × revision casado que espera uma linha só.
- Dono: `node-backend`.

**R2. Histórico de coletas sem limite na API (média, P).**
- `lerEventos` devolve todas as coletas incrementais da fonte e todas as contagens (`operacao/repositorio.ts:22-29`) a cada `estadoColeta` e `historicoColetas`, e pagina em memória (`operacao/servico.ts:9,16`).
- Com coleta a cada 15 min (P13 em aberto), são ~35 mil linhas por ano por fonte, que crescem para sempre.
- Correção: janela no SQL para o estado (`iniciado_em >= $agora - 14 dias`, que é a janela que a regra usa) e `LIMIT 21 OFFSET` (ou keyset por `(iniciado_em, coleta_id)`) para o histórico. `ix_ctl_coleta_incremental` já atende as duas.
- A regra de 14 dias está em `montarEstadoColeta` (`packages/metricas/core`); o `node-backend` confirma a janela exata lendo a função, sem inferir.

**R3. Varredura do acúmulo da outbox (média, P).** Ver W4. A correção está no cartão C5.

**Observação de regra de negócio (não é de banco).** `ref_quadro.eh_teste` ("fora de todo cálculo", `data-model.md:104`) não é aplicado em nenhum ponto da carga de métricas. `lerCards` (`metricas/repositorio.ts:45-53`) não filtra, e a busca por `eh_teste` em `packages/` não encontra nada. Hoje só `lerEquipesBM` usa o campo. O jarvis encaminha ao `node-backend`; se houver dúvida sobre onde filtrar, vira pergunta ao usuário.

---

## 14. Cartões propostos, por retorno

Retorno = (severidade × probabilidade) / esforço. Os nomes de schema abaixo são os de produção; nas migrações reais tudo passa por `ddl(S)`, `${S.bm}` etc.

| Ordem | Cartão | Resolve | Sev. | Esf. | Dono |
|---|---|---|---|---|---|
| 1 | **C1** Carga de transições pela view canônica + teste do par casado | R1 | alta | P | `node-backend` |
| 2 | **C2** Backup diário + restauração testada + trava de `down` em produção | O1, A5, G8, E6 | alta | M | `node-backend` + `tech-lead`; destino da cópia: **usuário** (I-14) |
| 3 | **C3** Timeouts e higiene de conexão | S8, G4, T4, T5, G6 | média | P | `node-backend` (fecha parte da S-19) |
| 4 | **C4** Histórico de coletas limitado no SQL | R2 | média | P | `node-backend` |
| 5 | **C5** Índice da outbox com `tipo` | R3/W4 | média | P | `node-backend` |
| 6 | **C6** Snapshot de índices e restrições no teste de catálogo | G7 | média | P | `node-backend` / `qa-engineer` |
| 7 | **C7** Testes de plano e orçamento no CI; `desempenho.ts` com o SQL real | P2, P3, P4, E5 | média | M | `node-backend` + `qa-engineer` |
| 8 | **C8** Migração de integridade (CHECKs de vigência, intervalos e estado) | I4-I8 | média/baixa | P | `node-backend` (revisão do arquiteto) |
| 9 | **C9** Observabilidade do banco + revisão de índices sem uso | O3, 4.3 | média/baixa | P | `node-backend` |
| 10 | **C10** Índices de FK nas versões; `INCLUDE` opcional | X1, X3 | baixa | P | `node-backend` |
| 11 | **C11** Endurecimento de ambiente hospedado | S9-S11, S5 | baixa | P | `tech-lead` |
| 12 | **C12** Documentação | ADR 0016 ausente, P4, G6, P5, status do Kysely (ADR 0015) | baixa | P | `software-architect` |

### C1. Transições canônicas
```sql
-- metricas/repositorio.ts: lerTransicoes
SELECT card_id, quadro_id, coluna_origem_id, coluna_destino_id, tipo_coluna, direcao,
       (extract(epoch FROM ocorrido_em) * 1000)::float8 AS ocorrido_em
  FROM dspd_bm.vw_transicao_canonica
 WHERE tipo_coluna IS NOT NULL AND direcao IS NOT NULL;
```
O `NOT EXISTS` da view usa `uq_rec_par_webhook`. Medir de novo o p95 com `desempenho.ts`, porque a view acrescenta um anti-join.

### C2. Backup, restauração e trava do `down`
- `scripts/db-backup.sh`: `pg_dump -Fc -d metricas` (papel `dspd_migrador`, que é dono de tudo), mais `pg_dumpall --roles-only`. Agendamento no host e cópia para fora da máquina; o destino é decisão do usuário.
- Restauração testada: job mensal ou `workflow_dispatch` que restaura o dump do seed num banco novo, roda `migrate up` (deve aplicar 0 migrações) e compara contagens e o snapshot do catálogo.
- `cli.ts`: recusar `down` e `redo` quando `DSPD_SCHEMA_PREFIXO` estiver vazio, salvo com `DSPD_PERMITIR_DOWN=1` e o backup do dia confirmado.

### C3. Timeouts (sem privilégio extra: tudo pela configuração do cliente `pg`)
```ts
// pool.ts, criarPool: além do que já existe
new pg.Pool({ ..., statement_timeout, lock_timeout: 5_000, idle_in_transaction_session_timeout: 30_000,
  connectionTimeoutMillis: 5_000, application_name: `dspd-${papel}` });
```
- Migrador (`migrar.ts:59`): `options: '-c TimeZone=UTC -c lock_timeout=5s'` e `singleTransaction` explícito.
- `trava.ts`: se o `unlock` falhar, `cliente.release(true)` (destrói a conexão e solta o lock).
- `emTransacao`: `release(erro)` quando o `ROLLBACK` falhar, preservando o erro original.
- Defesa para clientes fora da aplicação (psql, scripts), no init: `ALTER ROLE dspd_api SET statement_timeout = '10s'; ALTER ROLE dspd_api SET idle_in_transaction_session_timeout = '30s';` e o mesmo para os demais papéis, com valores próprios.

### C4. Histórico de coletas
```sql
-- estado (janela da regra de falhas; confirmar a janela em montarEstadoColeta)
SELECT coleta_id, iniciado_em, finalizado_em, status, erro_resumo FROM dspd_bm.ctl_coleta
 WHERE tarefa = 'coleta_incremental' AND status <> 'em_andamento' AND iniciado_em >= $1
 ORDER BY iniciado_em DESC, coleta_id DESC;
-- histórico paginado (keyset; uma linha a mais indica "há próxima")
... AND (iniciado_em, coleta_id) < ($1, $2) ORDER BY iniciado_em DESC, coleta_id DESC LIMIT 21;
-- contagens só das coletas devolvidas
SELECT coleta_id, entidade, lidos, inseridos, ja_existentes FROM dspd_bm.ctl_coleta_contagem WHERE coleta_id = ANY($1::bigint[]);
```

### C5. Outbox (migração `0013_outbox_indice_tipo`)
```sql
CREATE INDEX ix_outbox_reserva ON dspd_core.outbox (fonte, tipo, evento_sk)
  WHERE status IN ('pendente','processando');
DROP INDEX dspd_core.ix_outbox_fila;
-- down: recria ix_outbox_fila (fonte, disponivel_em, evento_sk) com o mesmo WHERE e remove ix_outbox_reserva
```
Teste: 10 mil eventos `pendente` de um tipo sem consumidor; `EXPLAIN (ANALYZE, BUFFERS)` da reserva lê só as linhas do tipo pedido (asserção sobre `Rows Removed by Filter` = 0, ou sobre buffers abaixo de um teto).

### C6. Snapshot de índices e restrições
Acrescentar ao `catalogo.pg.test.ts` um segundo snapshot com `pg_indexes.indexdef` e `pg_get_constraintdef(oid)` de `pg_constraint` dos três schemas (sem o prefixo de teste), regravado com `ATUALIZAR_SNAPSHOT=1`.

### C7. Testes de plano e orçamento
- **Fonte única do SQL:** exportar dos repositórios o texto das consultas (ou as funções) e fazer `desempenho.ts` usar o mesmo texto. Corrigir P3.
- **Teste de plano no `test:pg`** (rápido, sem volume): para as consultas pontuais (W1, Q7-Q13, Q17, Q18, Q21, Q22, W4), `SET enable_seqscan = off` + `EXPLAIN (FORMAT JSON)` e asserção de que o nó usa o índice esperado pelo nome. Isso prova que o índice é **utilizável** pela consulta real e quebra se alguém mudar a consulta ou o índice.
- **Orçamento no job `perf` noturno** (`ci.yml:190`): rodar `desempenho.ts` com `DESEMPENHO_ESCALA=5` e falhar se o p95 de qualquer carga passar de 500 ms ou o da API sem cache passar de 300 ms. Publicar os EXPLAIN como artefato, o que resolve P4 sem versionar arquivos de plano.

### C8. Migração de integridade (`0014_integridade_checks`; `NOT VALID` + `VALIDATE` para não bloquear escrita)
```sql
-- vigência (gerado por helper para as 13 ref_* com vigente_ate)
ALTER TABLE dspd_bm.ref_coluna ADD CONSTRAINT ck_ref_coluna_vigencia
  CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de) NOT VALID;
ALTER TABLE dspd_bm.ref_coluna VALIDATE CONSTRAINT ck_ref_coluna_vigencia;
-- intervalos
ALTER TABLE dspd_bm.fato_bloqueio ADD CONSTRAINT ck_fato_bloqueio_intervalo CHECK (fim IS NULL OR fim >= inicio) NOT VALID;
ALTER TABLE dspd_ac.fato_etapa_chamado ADD CONSTRAINT ck_fato_etapa_intervalo CHECK (saida IS NULL OR saida >= entrada) NOT VALID;
-- controle (bm e ac)
ALTER TABLE dspd_bm.ctl_coleta ADD CONSTRAINT ck_ctl_coleta_estado
  CHECK ((status = 'em_andamento') = (finalizado_em IS NULL) AND (finalizado_em IS NULL OR finalizado_em >= iniciado_em)
         AND (marca_dagua_de IS NULL OR marca_dagua_ate IS NULL OR marca_dagua_ate >= marca_dagua_de)) NOT VALID;
-- faixas
ALTER TABLE dspd_bm.ref_alocacao_acordada ADD CONSTRAINT ck_ref_alocacao_pct CHECK (percentual BETWEEN 0 AND 100) NOT VALID;
ALTER TABLE dspd_ac.ref_alvo_prioridade ADD CONSTRAINT ck_ref_alvo_positivo
  CHECK (prazo_pa_horas_uteis > 0 AND prazo_r_horas_uteis > 0) NOT VALID;
ALTER TABLE dspd_core.ref_calendario_turno ADD CONSTRAINT ck_turno_fim_dia CHECK (fim_min <= 1440) NOT VALID;
-- outbox
ALTER TABLE dspd_core.outbox ADD CONSTRAINT ck_outbox_estado
  CHECK ((status <> 'processado' OR processado_em IS NOT NULL) AND (status <> 'processando' OR reservado_ate IS NOT NULL)) NOT VALID;
-- seguido de VALIDATE CONSTRAINT para cada uma; down: DROP CONSTRAINT IF EXISTS
```
- **Pergunta ao usuário antes de C8:** uma vigência pode ser anulada antes de começar (`vigente_ate < vigente_de`)? A recomendação é não permitir; se precisar, cria-se uma nova vigência.
- **Opcional, exige ADR curta:** proibir vigências sobrepostas com `EXCLUDE`. `btree_gist` é extensão *trusted* desde o PG 13 e o migrador pode criá-la:
```sql
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA dspd_core;
ALTER TABLE dspd_bm.ref_coluna ADD CONSTRAINT ex_ref_coluna_vigencia
  EXCLUDE USING gist (quadro_id WITH =, coluna_id WITH =, daterange(vigente_de, vigente_ate, '[]') WITH &&);
```

### C9. Observabilidade do banco
- Compose: `command: ["postgres", "-c", "shared_preload_libraries=pg_stat_statements", "-c", "log_min_duration_statement=500ms", "-c", "log_lock_waits=on"]`.
- Init: `CREATE EXTENSION pg_stat_statements` em `metricas`, mais `GRANT pg_read_all_stats` a um papel de leitura operacional (não à `dspd_api`).
- Depois de 30 dias de uso real: `SELECT schemaname, relname, indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid)) FROM pg_stat_user_indexes WHERE schemaname LIKE 'dspd_%' ORDER BY idx_scan;`. Apagar, por migração, os índices de 4.3 com `idx_scan = 0`, exceto os reservados ao WS2.

### C10. Índices de FK (e cobertura opcional)
```sql
CREATE INDEX ix_dim_card_versao_stg ON dspd_bm.dim_card_versao (stg_card_sk);
CREATE INDEX ix_dim_chamado_versao_stg ON dspd_ac.dim_chamado_versao (stg_chamado_sk);
-- opcional, quando o coletor real medir W1:
-- CREATE INDEX ix_stg_card_ultima2 ON dspd_bm.stg_card (id_origem, stg_sk DESC) INCLUDE (payload_sha256); DROP INDEX dspd_bm.ix_stg_card_ultima;
```

### C11. Ambiente hospedado
Senhas `:?` obrigatórias fora do desenvolvimento, `postgres:17.x` fixado (idealmente por digest, via Dependabot), `sslmode=verify-full` quando o banco sair do host e `ALTER ROLE ... SET search_path = ''` por papel.

### C12. Documentação
- Criar a ADR 0016 (SCD2) ou corrigir a referência em `varredura-de-segredos-2026-10-12.md:72`.
- `data-model.md §7`: trocar "registrado em `docs/architecture/explain/`" pelo artefato do C7 e marcar quais índices atendem consulta real e quais são reservados ao WS2.
- Registrar o gatilho de carga incremental (P5) e a regra de `CONCURRENTLY` (G5).
- Dizer na ADR 0015 que o Kysely (S-14 a S-17) ainda não foi implementado.

---

## 15. Nota geral

**O que está bom, de verdade:**
- **Integridade do histórico:** append-only por gatilho e por privilégio, testado contra o próprio dono.
- **LGPD por privilégio:** GRANT por coluna e testes negativos conectando como cada papel.
- **Idempotência correta no Postgres:** `ON CONFLICT ON CONSTRAINT` e `NULLS NOT DISTINCT`, com teste de concorrência real.
- **Tipos bem escolhidos.**
- **Migrações:** SQL revisado igual ao executado, checksum, `up → down → up` no CI.
- **Medição de desempenho com volume**, que já levou a ajustes medidos.

Para um projeto deste porte, a disciplina de modelagem e de acesso está no nível de boas práticas de mercado ou acima.

**O que falta:**
- A disciplina de **operação** não acompanha a de modelagem. Não há backup testado, e um `down` acidental apaga o que não se recupera.
- **Timeouts e higiene de conexão** estão pela metade: só o `statement_timeout`.
- O **desempenho é medido, mas não vigiado.** O EXPLAIN não é o da consulta real, e o CI não tem teste de plano nem de orçamento.
- O **conjunto de índices** foi desenhado para filtros em SQL que o servidor decidiu fazer em memória. Sobram índices nas projeções e faltam limites em duas consultas que crescem para sempre: o histórico de coletas e o acúmulo da outbox.
- As **restrições de integridade** de vigência e de intervalo, baratas de adicionar, não existem.
- **Um risco de dado errado (R1)** fica latente até o webhook entrar, e corrigi-lo custa uma linha.

**Prioridade:** C1 e C2 antes de qualquer dado real; C3 a C6 na próxima iteração de plataforma; o restante conforme o WS2 avança.
