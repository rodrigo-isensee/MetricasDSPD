---
type: aggregate-root
attributes:
  - name: card_id
    type: string
    required: true
  - name: card_type
    type: card-type
    required: true
  - name: service_class
    type: service-class
  - name: granularity
    type: granularity
    required: true
  - name: system
    type: string
  - name: requester_area
    type: string
  - name: supplier
    type: string
  - name: strategic_objective
    type: string
  - name: declared_size
    type: declared-size
  - name: delay_responsibility
    type: delay-responsibility
  - name: severity
    type: severity
  - name: detection_phase
    type: detection-phase
  - name: root_cause
    type: root-cause
  - name: demand_origin
    type: demand-origin
  - name: agreed_date
    type: date
  - name: created_at
    type: datetime
    required: true
  - name: committed_at
    type: datetime
  - name: started_at
    type: datetime
  - name: completed_at
    type: datetime
  - name: archived_at
    type: datetime
  - name: discard_reason
    type: string
relationships:
  - target: card-transition
    type: composition
    cardinality: "0..*"
  - target: card-block
    type: composition
    cardinality: "0..*"
  - target: card-lifecycle-event
    type: composition
    cardinality: "0..*"
  - target: card
    type: reference
    cardinality: "0..1"
    role: parent
  - target: board
    type: reference
    cardinality: "1"
operations:
  - project-milestones
---

## Description

Card do BusinessMap (`dspd_bm.dim_card`, original "card"), com um tipo só e os marcos de entrada, compromisso, início e entrega (briefing 4.1, 4.5). Cards arquivados e excluídos permanecem na base. A pessoa responsável não faz parte do modelo lógico.

## Responsibility

Guardar o card e seus marcos para todo cálculo do fluxo de projeto.
