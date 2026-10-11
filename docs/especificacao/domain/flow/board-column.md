---
type: entity
aggregate: board
attributes:
  - name: column_id
    type: string
    required: true
  - name: name
    type: string
    required: true
  - name: column_kind
    type: column-kind
    required: true
  - name: role
    type: string
  - name: position
    type: integer
    required: true
  - name: wip_limit
    type: integer
---

## Description

Coluna de um quadro (`dspd_bm.ref_coluna`, original "coluna"), classificada em fila ou execução; fila conta dentro do limite de WIP (briefing 4.2).

## Responsibility

Separar espera de trabalho efetivo e dar o limite de WIP.
