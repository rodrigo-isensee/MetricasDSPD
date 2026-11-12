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

Prazos de primeiro atendimento e de restauração por prioridade P1 a P5 (`dspd_ac.ref_alvo_prioridade`; briefing 3.4). Cada prazo guarda a unidade (`unidade_pa`, `unidade_r`: `corrido` ou `util`), pela Q-099-11 e pelo PROC 30.000.010 v002: P1 (os dois prazos) e o primeiro atendimento de P2 em tempo corrido (plantão); a restauração de P2 e os dois prazos de P3 a P5 em horas úteis. Os prazos em dias úteis ficam em horas (dia útil = 8 h). A S1 mede cada prazo na unidade do seu alvo. A unidade reabre se a reconciliação com `sla_pa_tempo_min` e `sla_r_tempo_min` mostrar que o Acelerato mede P1 e P2 em tempo útil.

## Responsibility

Dar o alvo de SLA de cada prioridade, com vigência.
