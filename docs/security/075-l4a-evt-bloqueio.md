---
tipo: revisao-seguranca
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l4a-evt-bloqueio
commit: b44f714aa4216a02b53482b9f8f7538da52e14f2
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-07
---
# Review de segurança: lote 4a do pedido 075 (projetor grava `evt_bloqueio`)

Propósito: conferir o diff `718d46be...b44f714a` (7 arquivos, +196 -6) contra o gatilho do plano (banco, dado da fonte na projeção) e os controles do modelo de ameaças que o 4a toca. Público: tech-lead, node-backend, qa-engineer. Revisão estática; nada foi alterado em código.

## Gatilhos
Banco e dado da fonte na projeção (`R-SEGURANCA`): o projetor lê `stg_card` e grava `evt_bloqueio`.

## Resultado por controle
- **Leitura mínima: conforme.** A consulta nova (`projetor.ts:117-120`) seleciona `id_origem`, `coletado_em`, `excluido_detectado` e cinco chaves nomeadas de `payload` (`is_blocked`, `block_reason_id`, `column_id`, `archived_at`, `custom_fields`). Nunca o `payload` inteiro. `archived_at` e `excluido_detectado` são o desvio declarado pelo autor: são data e booleano, sem texto de pessoa; aceito. `block_reason` (label, comment, user_id) nem existe no `payload` do `stg_card`: a allow-list guarda só `reason_id` (`allow-list.ts:98-99`, sem diff), então o texto de pessoa não tem como chegar à consulta.
- **`motivo_codigo` só dígitos ou nulo: conforme.** O valor passa por `codigoDe` (`bloqueios.ts:24-27`, `^\d{1,10}$`) antes de chegar à linha (`projetor.ts:135`); marcador de texto vira `null` e a nota `motivo_codigo_invalido`. O teste CA-075-10 varre `evt_bloqueio`, `ctl_coleta_contagem` e `ctl_coleta_falha` pelo marcador e espera zero. `coluna_id` passa pelo mesmo `codigoDe`; `fornecedor_codigo` segue a regra já existente de `colunasDeLista` (texto de domínio, corte em 80, igual a `dim_card.fornecedor`), sem exposição nova.
- **Append-only e idempotência: conforme.** A gravação usa `ON CONFLICT ON CONSTRAINT uq_evt_bloqueio DO NOTHING` (`projetor.ts:138`); a migração 0005 aplica `appendOnly` à tabela (`0005_bm_historico.ts:58`); o teste CA-075-8 confirma que UPDATE e DELETE são negados. `idOrigem` é hash de `cardId|coletadoEm`, determinístico. Não há DELETE nem UPDATE no código novo.
- **Controle 7, `exigirEsquemaSemSeed` antes de gravar: conforme.** A chamada (`projetor.ts:244`) corre antes de `projetarLote`, que chama `gravarBloqueios`; o teste CA-075-9 prova a recusa sem evento novo, e `limpar-seed.pg.test.ts` prova que o evento real fica.
- **Contagens só com números: conforme.** `projecao_bloqueio_evento` e `nota_bloqueio_*` recebem inteiros; o nome da nota vem de lista fixa do derivador, sem valor da fonte.
- **SEG-A1 do 2b fechado.** `bloqueios.ts:50-51` limita o marco de arquivamento a `coletadoEm` (min) e o teste CA-075-7 usa `archived_at` de 2099.
- **Sem diff** em `grants.ts`, `lgpd.ts`, `allow-list.ts`, `coleta.ts`, `server/migrations` e `packages/contratos`. `TABELAS_LIMPAS_NA_RECONSTRUCAO` segue `['dim_card']` (só a linha de contexto aparece no diff). Sem GRANT novo, sem campo novo da fonte, sem leitura de `dspd_ac`.
- **CA-075-1 ponta a ponta adiado ao 4c: risco coberto até lá.** O controle é estrutural (allow-list sem label, comment e user_id, mais a consulta de chaves nomeadas), não depende do teste. Há prova parcial no 4a (CA-075-10 com marcador em `reason_id`). O 4b ainda não grava `fato_bloqueio`, que é o que a API lê, então nada do 4a chega ao navegador antes do 4c; o 4c precisa ficar antes do 6b e da prova do dono (SEG-A1 do plano).
- **Testes:** `bloqueios.test.ts` e `projetor-businessmap.test.ts`, 41 passados (vitest, 2 workers). Os `.pg` não rodaram aqui (sem banco de teste no ambiente); valem os da CI do push, verde segundo o brief. Suíte inteira é do QA.
- **Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não foram rodados aqui; sem dependência nova no diff, ficam com o CI.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/projetor.ts:117 · Plano (TL-A6) pede tempo do `bm:projetar` e EXPLAIN da consulta nova no parecer; não vi registro. Sem ataque, só desempenho (ADR 0003): registrar a medida no 4b.

## Plano em cartões
Nenhum bloqueante. A1 vai ao node-backend, junto da medição do 4b, se o tech-lead concordar.

## Riscos aceitos
Nenhum.
