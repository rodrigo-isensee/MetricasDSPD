---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l4a-evt-bloqueio
commit: b44f714aa4216a02b53482b9f8f7538da52e14f2
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 075 L4a, projetor grava `evt_bloqueio` (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 4a" de `docs/analises/075-plano.md` pede: a projeção grava os eventos de bloqueio de forma idempotente, sem migração nem contrato. O teto excedido é aceito com o CA-075-1 ponta a ponta no 4c. Os dois achados são recomendados e não devolvem.

## O que foi lido (diff `718d46be...b44f714a`, 1 commit)

- `projetor.ts`, `gravarBloqueios`:
  - A consulta nova lê do `stg_card` só os campos usados: `id_origem`, `coletado_em`, `payload -> 'is_blocked'`, `'block_reason_id'`, `'column_id'`, `'custom_fields'`. Nunca lê o `payload` inteiro, e o teste de dublê confere isso.
  - `archived_at` (do payload) e `excluido_detectado` (coluna) entram a mais. É o desvio declarado pelo autor e já aceito pela segurança: o derivador do 2b exige esses dois campos para os marcos de P-075-5. Aceito.
  - A ordem é por `id_origem, stg_sk`, como o derivador pede.
- `derivarBloqueios` roda por card, e os marcos vêm de `ref.colunas`: `papel = 'entrega'` e `eh_descarte`. O fornecedor vem de `ref.camposLista`.
- A gravação usa `ON CONFLICT ON CONSTRAINT uq_evt_bloqueio DO NOTHING`, sobre a chave `(card_id, id_origem, tipo)` de `0005_bm_historico.ts:53`. O `id_origem` é um hash do card e do `coletado_em` da versão que abriu, então a reprojeção é idempotente.
- Contagens em `ctl_coleta_contagem`:
  - `projecao_bloqueio_evento` registra lidos e inseridos.
  - `nota_bloqueio_*` conta cards por código.
  - Só números: o teste com `MARCADOR-PESSOA-075` confere que o valor não chega a contagem, falha nem evento.
- `VERSAO_PROJETOR` passou a `bm-f4/2`.
- `exigirEsquemaSemSeed` corre antes de tudo. O CA-075-9 `.pg` prova que a projeção recusa com `esquema-com-seed` sem escrever nenhum evento.
- `gravarBloqueios` roda antes do `if (ok.length === 0) return`. Assim, card sem `created_at` também tem seus eventos de bloqueio.
- `grants.ts`, `lgpd.ts`, `TABELAS_LIMPAS_NA_RECONSTRUCAO`, migrações e contratos ficam sem diff.
- Recomendados do 2b:
  - SEG A1 e QA A1 aplicados em `bloqueios.ts:50`: `Math.min(arquivado, coleta)` impede que o fim fique depois da coleta.
  - O teste "arquivado" mudou de T3 para T2 de propósito. Ganhou também o caso "arquivado entre o início e a coleta", que fecha no instante do arquivamento. Aceito.
  - A1 e A2 do review do 2b resolvidos na leitura: `archived_at` passa por `instanteDoBm` e vira ISO, e `coletado_em` vem como `Date` da coluna e vira ISO.
- Testes:
  - Dublê: 2 testes, com abre/fecha, campos lidos, contagem, ausência de `dspd_ac` e marcos com SEG-A1.
  - `.pg`: 5 testes, cobrindo CA-075-6, 7, 8, 9, 10 e 12. O `limpar-seed.pg` cobre o evento real que fica.
  - Os `.pg` são pulados na cobertura e rodam no job `banco` da CI.
- Regras invioláveis respeitadas: só BusinessMap, nada individual e nenhum dado de pessoa na saída.
- Segurança: parecer aprovado do security-engineer em `docs/security/075-l4a-evt-bloqueio.md` (c228cc7d). Não refaço esse parecer.

## Performance (TL-A6, ADR 0003; A1 da segurança)

Números do autor, medidos localmente no `.pg` (Postgres descartável):
- `bm:projetar`: 1.223 ms na primeira projeção (11.600 eventos) e 780 ms na reprojeção, com 23.200 versões.
- `EXPLAIN` da consulta nova: 2,97 ms, em `ix_stg_card_ultima`.

Ficam dentro do orçamento. A medição da CI é a noturna, não a do push.

## Ferramentas

- CI do push na ponta `b44f714a`: run 42359938014, `completed`/`success`. Os jobs build, testes, rapida, openapi, imagem, filtro, seguranca e banco passaram; e2e e perf foram pulados, como em push de feature.
- Testes dos arquivos tocados (D-5): `vitest run tests/bloqueios.test.ts tests/projetor-businessmap.test.ts --maxWorkers=2` em `server` deu 2 arquivos e 41 testes, todos verdes. Os `.pg` ficam na CI (job `banco`).
- Teto M14: o `git diff --numstat --no-renames` soma 202 linhas (código 47, teste 155), não as 196 e 43 que o autor declarou, porque ele contou só as adições. A exceção é aceita: um comportamento só, e o CA-075-1 ponta a ponta foi para o 4c. O PR do E1.9 leva a linha `teto: excedido, 202 linhas, <motivo>`.

## Achados

- A1 (recomendado) server/src/modulos/businessmap/projetor.ts:121 · os marcos usam todas as vigências de `ref_coluna`: coluna que foi entrega ou descarte numa vigência antiga fecha bloqueio hoje. No 4b, filtrar pela vigência no instante da versão ou registrar a escolha.
- A2 (recomendado) server/src/modulos/businessmap/projetor.ts:127 · o array do card é recriado a cada versão (spread, quadrático por card); `push` no array existente evita o custo quando o card tem muitas versões.
