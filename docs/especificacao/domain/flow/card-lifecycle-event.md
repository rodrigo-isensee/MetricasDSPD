---
type: entity
aggregate: card
attributes:
  - name: event_type
    type: card-lifecycle-event-type
    required: true
  - name: occurred_at
    type: datetime
    required: true
---

## Description

Evento de ciclo de vida do card: criado, arquivado, desarquivado, exclusão detectada ou restaurado (`dspd_bm.evt_card`).

## Responsibility

Manter o histórico de arquivamento e exclusão, que nunca é sobrescrito.
