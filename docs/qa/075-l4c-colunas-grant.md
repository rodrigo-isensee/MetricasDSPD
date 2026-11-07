---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l4c-colunas-grant
commit: ea3b51b5ad99a67e3a244395d62ef99e5200cb3a
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 075-bloqueios-reais, lote 4c (colunas e GRANT de bloqueio, K-204)

Diff lido: `3ae2d53d...ea3b51b5` (5 arquivos, 104 inserções, 3 remoções; código de produção só em dois comentários de `projetor.ts`). `grants.ts`, `lgpd.ts`, `allow-list.ts`, `coleta.ts`, `server/migrations` e `packages/contratos` sem diferença contra a base do lote. Segurança (d165049a) e review (e459722d) aprovados; o commit testado é o dos testes (ea3b51b5).

## Critério → teste → resultado

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| SEG-A4 (coluna nova reprova) | `bloqueio-colunas-grant.pg.test.ts`, lista exata em ordem contra `information_schema.columns` | lista de colunas de `evt_bloqueio` e `fato_bloqueio` | CI banco verde (run 42391385262, headSha ea3b51b5) |
| CA-075-4 (`ALTER TABLE` e texto livre) | `bloqueio-colunas-grant.test.ts`, migrações > 0006 (`up` e `down`), mínimo `> 0`, caso ruim com `bloqueado_por`, `comentario`, `observacao` (4 reprovações) e caso bom em `dim_card` | migração nova sobre as duas tabelas | verde; mutante S1 reprova |
| CA-075-5 (GRANT fixado) | `gerarGrants` com 4 linhas literais; `dspd_api` com `42501` em `evt_bloqueio` e `stg_bloqueio` (`.pg`) | papel da API fora de evt e stg | unidade verde; `.pg` verde na CI; mutantes G1, G2 e G3 reprovam |
| CA-075-1 ponta a ponta | `projetor-bloqueio.pg.test.ts` (label, comment, user_id; stg_*, evt, fato, ctl_coleta_falha, ctl_coleta_contagem, saída; mínimo `> 8` tabelas) | dado de pessoa e texto livre em qualquer tabela ou saída | `.pg` verde na CI |
| DT (1) comentários de append-only | `projetor.ts:26` e `:274` | n/a | conferido no diff |
| DT (2) bloqueio aberto fecha depois | `.pg` A2 do review do 4b (`atualizado_por_coleta_id` só na linha mudada) | linha não mudada preservada | `.pg` verde na CI |
| DT (3) vigência de `ref_coluna` em instante passado | `projetor-businessmap.test.ts` (coluna 10, 2026-10-21) | limite de vigência 2026-10-31 | verde; mutante M6 reprova |
| DT (4) dublê mata M5 e M13 | `projetor-businessmap.test.ts:283` (filtro `tipo = 'inicio'`, `motivo = v.motivo` no SET, motivos enviados) | filtro do evento de início e motivo reclassificado | verde; M5, M13 e M11 reprovam |

## Execução (2 workers, só os arquivos tocados)

`npx vitest run --maxWorkers=2` em `server/` sobre os 4 arquivos do lote: 2 arquivos de unidade passam (20 testes), os 2 `.pg` ficam em skip sem banco local (12 testes), e a CI do push cobre o banco: `gh run view 42391385262 --json headSha,conclusion` devolve `ea3b51b5ad99a67e3a244395d62ef99e5200cb3a` e `success`, com o job `banco` em `success`. A suíte inteira não foi rodada (instrução da delegação).

## Vermelho antes do verde

Os testes novos são trincos de guarda: o código da base (3ae2d53d) já atende, então rodados contra ela passam (20 de 20 numa cópia em `/tmp/claude-1000/qa-engineer-075-l4c/base`). A prova de que reprovam está na mutação abaixo, feita em cópia fora da worktree. O vermelho dos `.pg` não é medível sem PostgreSQL local; vale a CI.

## Mutação à mão (cópia descartável do HEAD; cada mutante restaurado)

| Mutante | Reprovou |
|---|---|
| G1: `IMUTAVEL` sem `evt_` | sim (CA-075-5) |
| G2: `PROJECAO` sem `fato_bloqueio` | sim (CA-075-5) |
| G3: API passa a ler `evt_*` | sim (CA-075-5) |
| S1: `ALTER TABLE fato_bloqueio ADD COLUMN comentario` na migração 0035 | sim (CA-075-4) |
| M5: filtro `tipo = 'inicio'` removido | sim |
| M6: vigência avaliada em 2099 | sim |
| M13: `motivo` fora do SET do UPDATE | sim |
| M11: `motivo` fora do `IS DISTINCT FROM` | sim |

Não rodáveis sem banco: coluna acrescentada na lista do `.pg` e marcador vazando em `stg_*` (a CI do push cobre; o teste do catálogo compara lista exata em ordem).

## Bugs

Nenhum.

## Achados
- A1 (recomendado) server/tests/bloqueio-colunas-grant.test.ts:7 · a regex do CA-075-4 não pega `ALTER TABLE ONLY`, `IF EXISTS` nem lista de tabelas; só o teste do catálogo no `.pg` cobre. Ampliar a regex quando o arquivo for tocado (coincide com o A1 da segurança).
- A2 (recomendado) server/tests/projetor-bloqueio.pg.test.ts:114 · a captura de saída do CA-075-1 espia só `process.stdout` e `process.stderr`; sob vitest `console.*` pode não passar por aí. Espiar também `console.log`, `console.warn` e `console.error` (A2 da segurança).
- A3 (recomendado) server/tests/projetor-bloqueio.pg.test.ts:135 · o caso que fecha confere só `duracao_horas_uteis` não nulo; um valor errado passa. Fixar o valor pelo calendário do teste (A2 do review).
