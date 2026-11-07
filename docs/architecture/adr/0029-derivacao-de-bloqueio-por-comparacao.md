# 0029 - Derivação de bloqueio por comparação entre coletas

Estado: proposta. Data: 2026-11-06.
Propósito: registrar como o bloqueio do BusinessMap vira evento (início e fim) a partir do que já chega ao `stg_card`, e onde o motivo é traduzido. Público: node-backend, software-architect, tech-lead, security-engineer, qa-engineer. Revisão: 2026-12-06.

- Origem: pedido 075 (`docs/pedidos/075-bloqueios-reais.md`), cartão K-204; plano `docs/analises/075-plano.md`, Lote 2a.
- Relacionadas: ADR 0020 (allow-list; sem campo novo), ADR 0022 (item 3 nega `stg_bloqueio`; a via A não o usa), ADR 0011 (biblioteca única de cálculo).

## Contexto

A coleta não grava bloqueios, e as telas de bloqueio mostram "Sem dado real" (pedidos 064 e 065). A fonte não expõe o histórico de bloqueio no que já é coletado; o que existe por versão do card é `is_blocked`, `block_reason_id` e `current_block_time`.

## Decisão

1. **Via A (P-075-1).** O bloqueio é derivado da comparação entre versões consecutivas do card no `stg_card`, sem dado novo da fonte. Perde bloqueio mais curto que o intervalo entre coletas e o passado anterior à primeira coleta.
2. **Instante (P-075-2).** Falso para verdadeiro, ou primeira versão já bloqueada, abre no `coletado_em` da versão; verdadeiro para falso fecha no `coletado_em` da versão.
3. **Troca de motivo (P-075-3b, P-075-10).** Trocar `block_reason_id` com o card bloqueado é o mesmo bloqueio: não gera evento e vale o motivo do início.
4. **Evento com o código da fonte.** `motivo_codigo` é o `block_reason_id` como texto validado por `^\d{1,10}$`; nulo, ausente ou fora do padrão vira `null` com a nota `motivo_codigo_invalido`, nunca o valor lido. O derivador não traduz.
5. **Tradução na projeção (lote 4b).** `fato_bloqueio` aplica o mapa do código para os 7 motivos do briefing; sem mapa, "não classificado". Preencher o mapa depois reclassifica o passado.
6. **`id_origem`.** Hash determinístico de (`card_id`, `coletado_em` da versão que abriu), nunca de texto; o `fim` usa o mesmo `id_origem`. A derivação é idempotente.
7. **Função pura.** `derivarBloqueios` em `server/src/modulos/businessmap/bloqueios.ts`, sem banco nem relógio.

## Consequências

- Duração com erro de até um intervalo de coleta; a agenda diária (P-075-7) o limita a um dia.
- Nenhum campo novo na allow-list e nenhuma tabela nova de staging.

## Critério de reversão

A via B for escolhida pelo dono, ou a prova do lote 6b mostrar evento perdido por `last_modified`.
