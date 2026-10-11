---
type: entity
aggregate: collection-run
attributes:
  - name: entity_name
    type: string
    required: true
  - name: origin_id
    type: string
  - name: attempts
    type: integer
    required: true
  - name: error
    type: string
---

## Description

Falha de um item na coleta (`ctl_coleta_falha`); sem payload nem dado pessoal.

## Responsibility

Guardar o item que falhou para nova tentativa.
