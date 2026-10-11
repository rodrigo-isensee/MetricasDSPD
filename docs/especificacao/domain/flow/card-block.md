---
type: entity
aggregate: card
attributes:
  - name: block_reason
    type: block-reason
    required: true
  - name: supplier
    type: string
  - name: column_id
    type: string
  - name: started_at
    type: datetime
    required: true
  - name: ended_at
    type: datetime
  - name: business_hours_duration
    type: decimal
---

## Description

Intervalo em que o card esteve bloqueado (`dspd_bm.fato_bloqueio`, original "bloqueio"); bloqueio é marca no card e não move o card de coluna (briefing 4.2).

## Responsibility

Registrar o tempo bloqueado e o motivo, em horas úteis.
