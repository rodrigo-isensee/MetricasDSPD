---
type: aggregate-root
attributes:
  - name: day
    type: date
    required: true
  - name: entity_name
    type: string
    required: true
  - name: data_source
    type: domain/metrics/data-source
    required: true
  - name: tool_count
    type: integer
    required: true
  - name: base_count
    type: integer
    required: true
  - name: divergence_percent
    type: decimal
---

## Description

Reconciliação diária entre a contagem da ferramenta e a da base (`ctl_reconciliacao`).

## Responsibility

Apontar divergência entre a ferramenta e a base.
