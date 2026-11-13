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

Prazos de primeiro atendimento e de restauração por prioridade P1 a P5 (`dspd_ac.ref_alvo_prioridade`; briefing 3.4). Cada prazo guarda a unidade (`unidade_pa`, `unidade_r`: `corrido` ou `util`), pela Q-099-11 e pelo PROC 30.000.010 v002: P1 (os dois prazos) e o primeiro atendimento de P2 em tempo corrido (plantão); a restauração de P2 e os dois prazos de P3 a P5 em horas úteis. Os prazos em dias úteis ficam em horas com o dia útil da Sustentação de 8 h 48 (528 min; Decisão 13 do pedido 099, D3b): P3 restauração 17,6 h, P4 restauração 44 h, P5 primeiro atendimento 8,8 h e restauração 88 h; os prazos escritos em horas (P2 restauração 8 h úteis, P3 e P4 primeiro atendimento 2 h e 4 h) não mudam. O arquivo `acelerato-alvos.json` guarda `horas_por_dia_util` e o carregador recusa se o expediente gravado do calendário da Sustentação não somar essas horas. A janela do expediente (08:00-12:00 e 13:00-17:48) é a recomendação A da Q-099-32, ainda com o dono. A S1 mede cada prazo na unidade do seu alvo. A unidade reabre se a reconciliação com `sla_pa_tempo_min` e `sla_r_tempo_min` mostrar que o Acelerato mede P1 e P2 em tempo útil.

## Responsibility

Dar o alvo de SLA de cada prioridade, com vigência.
