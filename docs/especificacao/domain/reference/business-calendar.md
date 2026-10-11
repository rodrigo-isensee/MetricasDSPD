---
type: aggregate-root
attributes:
  - name: calendar_id
    type: string
    required: true
  - name: name
    type: string
    required: true
  - name: offset_minutes
    type: integer
    required: true
relationships:
  - target: calendar-shift
    type: composition
    cardinality: "1..*"
  - target: holiday
    type: composition
    cardinality: "0..*"
---

## Description

Calendário de expediente (`dspd_core.ref_calendario`, original "calendário"), base das horas úteis; plantão é exceção explícita por classe (briefing 4.2).

## Responsibility

Dizer quando o relógio de horas úteis corre.
