---
type: aggregate-root
attributes:
  - name: data_source
    type: data-source
    required: true
  - name: sample_size
    type: integer
    required: true
  - name: window
    type: calculation-window
    required: true
  - name: percentiles
    type: percentile-set
  - name: histogram
    type: histogram-bin
    many: true
  - name: rate
    type: rate-figure
  - name: segmented_by
    type: string
    many: true
relationships:
  - target: metric
    type: reference
    cardinality: "1"
  - target: domain/reference/criteria-version
    type: reference
    cardinality: "0..*"
    role: applied-criteria
operations:
  - publish-statistic
---

## Description

Estatística publicada (original "estatística"): percentis ou taxa sobre uma classe de itens de uma única fonte (`Estatistica<T>` em `packages/contratos`).

## Responsibility

Manter o número publicado junto da amostra e da janela de que saiu.
