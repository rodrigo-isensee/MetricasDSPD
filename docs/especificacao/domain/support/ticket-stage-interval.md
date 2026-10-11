---
type: entity
aggregate: ticket
attributes:
  - name: stage
    type: string
    required: true
  - name: entered_at
    type: datetime
    required: true
  - name: left_at
    type: datetime
  - name: pending_reason
    type: string
  - name: totalizer
    type: string
---

## Description

Intervalo do chamado em uma etapa (`dspd_ac.fato_etapa_chamado`, original "etapa"), mapeado a um dos totalizadores.

## Responsibility

Decompor o tempo do chamado por etapa e por totalizador.
