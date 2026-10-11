---
type: aggregate-root
attributes:
  - name: field
    type: string
    required: true
  - name: code
    type: string
    required: true
  - name: data_source
    type: domain/metrics/data-source
    required: true
  - name: validity
    type: validity-period
    required: true
---

## Description

Valor de um domínio fechado, por fonte (`ref_dominio`, original "domínio fechado"; briefing 4.4).

## Responsibility

Guardar as listas fechadas com vigência, separadas por fonte.
