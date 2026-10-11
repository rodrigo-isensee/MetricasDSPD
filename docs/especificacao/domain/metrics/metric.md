---
type: aggregate-root
attributes:
  - name: metric_id
    type: string
    required: true
  - name: data_source
    type: data-source
    required: true
  - name: minimum_sample
    type: integer
    required: true
  - name: segmentation_keys
    type: string
    many: true
  - name: briefing_reference
    type: string
---

## Description

Métrica do catálogo (original "métrica", MetricaId: O1 a O17, T1 a T5, S1 a S7, E1 a E3), com sua regra de cálculo (`REGRAS_METRICA` em `packages/metricas`).

## Responsibility

Declarar fonte, amostra mínima e segmentação permitida de cada métrica.
