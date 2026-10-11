---
type: aggregate-root
attributes:
  - name: criteria_version_id
    type: string
    required: true
  - name: effective_since
    type: date
    required: true
  - name: data_source
    type: domain/metrics/data-source
    required: true
  - name: description
    type: string
    required: true
  - name: reason
    type: string
    required: true
  - name: reference
    type: string
  - name: affected_metrics
    type: string
    many: true
---

## Description

Registro de mudança de critério de cálculo, com data (`dspd_core.ref_versao_criterio`, tarefa T2.6); mudança nos dois domínios gera duas versões.

## Responsibility

Marcar nos gráficos quando um critério mudou.
