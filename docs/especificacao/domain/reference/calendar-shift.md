---
type: entity
aggregate: business-calendar
attributes:
  - name: weekday
    type: integer
    required: true
  - name: start_minute
    type: integer
    required: true
  - name: end_minute
    type: integer
    required: true
  - name: validity
    type: validity-period
    required: true
---

## Description

Turno de expediente de um dia da semana (`dspd_core.ref_calendario_turno`).

## Responsibility

Delimitar as horas úteis de cada dia.
