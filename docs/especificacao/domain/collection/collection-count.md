---
type: entity
aggregate: collection-run
attributes:
  - name: entity_name
    type: string
    required: true
  - name: read
    type: integer
    required: true
  - name: inserted
    type: integer
    required: true
  - name: already_existing
    type: integer
    required: true
  - name: failures
    type: integer
    required: true
---

## Description

Contagem por entidade de uma execução (`ctl_coleta_contagem`).

## Responsibility

Dizer quantos registros foram lidos, inseridos, repetidos e falhos.
