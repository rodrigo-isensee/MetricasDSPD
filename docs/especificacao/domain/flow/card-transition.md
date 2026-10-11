---
type: entity
aggregate: card
attributes:
  - name: occurred_at
    type: datetime
    required: true
  - name: source_column_id
    type: string
  - name: destination_column_id
    type: string
    required: true
  - name: column_kind
    type: column-kind
    required: true
  - name: direction
    type: transition-direction
    required: true
---

## Description

Movimentação de um card entre colunas (`dspd_bm.fato_transicao`, original "transição"); a canônica é a revision, e o webhook só antecipa.

## Responsibility

Registrar cada passagem do card, base dos marcos e dos retornos.
