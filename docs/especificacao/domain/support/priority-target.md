---
type: aggregate-root
attributes:
  - name: priority
    type: priority
    required: true
  - name: first_response_business_hours
    type: decimal
  - name: restoration_business_hours
    type: decimal
  - name: valid_from
    type: date
    required: true
---

## Description

Prazos de primeiro atendimento e de restauração por prioridade P1 a P5 (`dspd_ac.ref_alvo_prioridade`; briefing 3.4). P1 usa minutos e horas corridas, P2 a P5 usam horas úteis.

## Responsibility

Dar o alvo de SLA de cada prioridade, com vigência.
