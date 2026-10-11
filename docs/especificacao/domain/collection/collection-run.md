---
type: aggregate-root
attributes:
  - name: task
    type: collection-task
    required: true
  - name: data_source
    type: domain/metrics/data-source
    required: true
  - name: started_at
    type: datetime
    required: true
  - name: finished_at
    type: datetime
  - name: outcome
    type: collection-outcome
  - name: watermark_from
    type: datetime
  - name: watermark_until
    type: datetime
relationships:
  - target: collection-count
    type: composition
    cardinality: "0..*"
  - target: collection-failure
    type: composition
    cardinality: "0..*"
operations:
  - finish-run
---

## Description

Execução de coleta (`ctl_coleta`, original "coleta"), uma por fonte por vez, com marca d'água.

## Responsibility

Registrar o que foi lido e até onde, para a próxima coleta continuar dali.
