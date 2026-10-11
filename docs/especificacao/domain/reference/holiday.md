---
type: entity
aggregate: business-calendar
attributes:
  - name: date
    type: date
    required: true
  - name: scope
    type: holiday-scope
    required: true
  - name: description
    type: string
---

## Description

Feriado do calendário (`dspd_core.ref_feriado`, original "feriado").

## Responsibility

Tirar o dia do cálculo de horas úteis.
