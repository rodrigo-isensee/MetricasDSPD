---
type: aggregate-root
attributes:
  - name: ticket_id
    type: string
    required: true
  - name: nature
    type: ticket-nature
    required: true
  - name: support_team
    type: support-team
    required: true
  - name: organization
    type: string
  - name: ticket_type
    type: string
  - name: system_category
    type: string
  - name: priority
    type: priority
  - name: impact
    type: impact-level
  - name: urgency
    type: urgency-level
  - name: opened_at
    type: datetime
    required: true
  - name: first_response_at
    type: datetime
  - name: restored_at
    type: datetime
  - name: closed_at
    type: datetime
  - name: sla_restoration_outcome
    type: sla-outcome
  - name: sla_first_response_outcome
    type: sla-outcome
  - name: escalation_reason
    type: escalation-reason
  - name: resolution_level
    type: resolution-level
  - name: closure_reason
    type: closure-reason
  - name: deleted
    type: boolean
    required: true
  - name: sla_exception_registered_later
    type: boolean
relationships:
  - target: ticket-stage-interval
    type: composition
    cardinality: "0..*"
  - target: ticket-automation-action
    type: composition
    cardinality: "0..*"
operations:
  - reclassify-priority
---

## Description

Chamado do Acelerato (`dspd_ac.dim_chamado`, original "chamado"). Solicitante, atendente e e-mail ficam fora do modelo lógico.

## Responsibility

Guardar o chamado com o resultado do SLA, o recorte da população e a prioridade.
