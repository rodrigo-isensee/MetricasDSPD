---
type: entity
aggregate: ticket
attributes:
  - name: rule
    type: string
    required: true
  - name: trigger_moment
    type: datetime
    required: true
  - name: attempt
    type: integer
    required: true
  - name: action
    type: string
    required: true
  - name: mode
    type: automation-mode
    required: true
  - name: result
    type: string
  - name: recorded_in_ticket
    type: boolean
---

## Description

Ação da automação externa sobre o chamado (`dspd_ac.ctl_automacao`, tarefa T4.3), em simulação ou ativa.

## Responsibility

Registrar cada tentativa de automação sem alterar o histórico.
