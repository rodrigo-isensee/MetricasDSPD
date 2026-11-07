---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l4a-evt-bloqueio
commit: b44f714aa4216a02b53482b9f8f7538da52e14f2
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 075-bloqueios-reais, lote 4a (projetor grava `evt_bloqueio`, K-204)

Contrato: ADR 0029, plano `docs/analises/075-plano.md` (Lote 4a e item QA da seção 7). Segurança (c228cc7d) e review (d5d693bb) aprovados sobre o mesmo código; os dois commits depois de `b44f714a` só trazem esses pareceres (`git diff --stat b44f714a HEAD`: 2 arquivos em `docs/`).

## Achados
- A1 (recomendado) server/tests/projetor-bloqueio.pg.test.ts:60 · o CA-075-7 em banco cobre arquivado, excluído e entregue; o descartado só tem prova no dublê (projetor-businessmap.test.ts, coluna 8). Somar o descartado ao `.pg` no 4b ou 4c, sem devolver.
- A2 (recomendado) server/src/modulos/businessmap/projetor.ts:121 · os marcos usam todas as vigências de `ref_coluna` (A1 do review); confirmado na leitura. No 4b, filtrar pela vigência do instante da versão ou registrar a escolha.

## Conferência do lote contra o plano
- Diff `718d46be..b44f714a`: 7 arquivos, 196 inserções e 6 remoções (código: `projetor.ts` e `bloqueios.ts`; testes: 2 unitários, 2 `.pg` existentes, 1 `.pg` novo).
- `git diff --stat 718d46be b44f714a` sobre `allow-list.ts`, `coleta.ts`, `grants.ts`, `lgpd.ts`, `server/migrations` e `packages/contratos`: vazio. Sem contrato nem migração, como o plano manda.
- `gravarBloqueios` lê só `is_blocked`, `block_reason_id`, `column_id`, `archived_at` e `custom_fields` do payload, mais as colunas `coletado_em` e `excluido_detectado`; nunca o `payload` inteiro. Os dois campos a mais são o desvio declarado, aceito por review e segurança (o derivador do 2b os exige).
- Grava com `ON CONFLICT ON CONSTRAINT uq_evt_bloqueio DO NOTHING`; `VERSAO_PROJETOR` vai a `bm-f4/2`; contagens `projecao_bloqueio_evento` e `nota_bloqueio_*` só com números.
- SEG A1 do 2b: `bloqueios.ts:50-51` limita o marco de arquivamento à coleta. O teste "arquivado" mudou de T3 para T2 de propósito (arquivado depois da coleta fecha na coleta) e ganhou o caso "arquivado entre o início e a coleta"; a mudança de expectativa é a correção pedida, não afrouxamento.
- CA-075-1 ponta a ponta fica no 4c (plano, SEG-A3 adiado, aceito por review e segurança): não é bug deste lote. Prova parcial no 4a: o marcador em `reason_id` (CA-075-10).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-075-6 (reprojeção e coleta repetida, sobreposição de 3600 s, sem linha nova) | `projetor-bloqueio.pg` CA-075-6 e CA-075-12 (duas projeções e uma coleta repetida; contagem igual); dublê: `ON CONFLICT ... DO NOTHING` no texto | repetição idêntica (mínimo de linhas novas: zero) | passou no dublê e no job `banco` da CI (run 42359938014, `success`) |
| CA-075-7 (arquivado depois bloqueado, descartado e excluído mantêm os eventos) | `projetor-bloqueio.pg` CA-075-7 (arquivado de 2099, excluído, entregue); dublê "marcos" (arquivado depois e antes da coleta, entrega, descarte, excluído) | `archived_at` fora do intervalo (2099); nunca fim depois da coleta | passou; descartado só no dublê (A1) |
| CA-075-8 (UPDATE e DELETE negados) | `projetor-bloqueio.pg` CA-075-8 (`/append-only/`) | permissão: gatilho, até para o dono do esquema | passou (CI, job `banco`) |
| CA-075-9 (`limpar-seed` remove só o seed) | `limpar-seed.pg` (evento real fica: contagem 1); `projetor-bloqueio.pg` CA-075-9 (recusa `esquema-com-seed` sem escrever evento) | seed e real no mesmo esquema | passou (CI, job `banco`) |
| CA-075-10 (motivo-marcador vira nulo, nota por código) | dublê (nota `motivo_codigo_invalido` com `[88, ..., 1, 1, 0, 0]`, marcador ausente das chamadas de `ctl_coleta`); `.pg` (nulo, uma nota, varredura de `evt_bloqueio`, contagem e falha) | entrada inválida (texto no lugar do código) | passou |
| CA-075-12 (fornecedor só do `bm`) | dublê (`FORN_A` do `custom_fields`, nenhuma chamada com `dspd_ac`); `.pg` (fornecedor lido da versão que abriu) | fronteira BusinessMap e Acelerato | passou |
| `motivo_codigo` só dígitos ou nulo | `.pg` (consulta `motivo_codigo !~ '^[0-9]+$'` dá zero) | texto livre | passou |
| Marco de arquivamento limitado à coleta (SEG A1 do 2b) | `bloqueios.test.ts` (arquivado depois da coleta; entre início e coleta); dublê "marcos"; `.pg` CA-075-7 | logo fora do limite (2099) | passou |
| CA-075-1 ponta a ponta | adiado ao 4c (plano) | n/a neste lote | fora do lote, sem bug |

## Execução
- Testes dos arquivos tocados (D-5), no head: `npx vitest run tests/bloqueios.test.ts tests/projetor-businessmap.test.ts --maxWorkers=2` em `server`: `Test Files 2 passed (2)`, `Tests 41 passed (41)`.
- Os `.pg` não rodei aqui (ficam com a CI do push): `gh run view 42359938014 --repo rodrigo-isensee/MetricasDSPD --json headSha,conclusion` devolveu `{"conclusion":"success","headSha":"b44f714aa4216a02b53482b9f8f7538da52e14f2"}`, o mesmo SHA do código.
- Suíte completa não rodada nesta delegação (o brief limita aos dois arquivos); a CI do push cobre o restante.

## Vermelho antes do verde (base 718d46be, cópia em `/tmp/claude-1000/qa-engineer-075-l4a/base`)
Código de `server/` e `packages/` da base com os testes de `b44f714a`: `Tests 3 failed | 38 passed (41)`.
- `bloqueios.test.ts`: "card arquivado depois da coleta (SEG-A1: nunca depois dela)" cai (base fecha em T3, o teste espera T2).
- `projetor-businessmap.test.ts`: "abre e fecha por is_blocked..." e "marcos: arquivado depois da coleta..." caem (a base não tem `bloqueios` no resultado nem grava `evt_bloqueio`).
Como dois dos três só provam a ausência do código, fiz mutação à mão sobre o head (cópia em `/tmp/claude-1000/qa-engineer-075-l4a/mut`). Todos os seis morreram:
| Mutante | Resultado dos 41 testes |
|---|---|
| M1: tirar `Math.min(arquivadoMs, coletaMs)` | 2 falharam |
| M3: descarte sem `eh_descarte` | 1 falhou |
| M4: entrega com `papel === 'trabalho'` | 2 falharam |
| M5: `derivarBloqueios` sem `ref.camposLista` (fornecedor) | 1 falhou |
| M6: `DO NOTHING` trocado por `DO UPDATE` | 1 falhou |
| M7: leitura de `payload` inteiro no lugar de `payload -> 'is_blocked'` | 2 falharam |

Lacuna que a mutação não alcança no dublê: a ordem `ORDER BY id_origem, stg_sk` e a posição de `gravarBloqueios` antes do `if (ok.length === 0) return`; as duas dependem do banco real e ficam com o `.pg` da CI (CA-075-6, CA-075-12, card sem `created_at`).

## Regras invioláveis
BusinessMap e Acelerato separados (nenhuma leitura de `dspd_ac`, provada no dublê); evento só com `is_blocked`, código do motivo e instante, nunca texto de pessoa; histórico nunca sobrescrito (gatilho append-only e `DO NOTHING`); `TABELAS_LIMPAS_NA_RECONSTRUCAO` e `grants.ts` sem diferença. Nenhuma métrica nova, nada individual.

## Bugs
Nenhum aberto (críticos 0, altos 0, médios 0, baixos 0). Os dois achados são recomendados.
