---
type: value-object
attributes:
  - name: start
    type: date
    required: true
  - name: end
    type: date
    required: true
  - name: unit
    type: window-unit
    required: true
  - name: quantity
    type: integer
    required: true
---

## Description

Janela móvel do cálculo (original "janela móvel"), 12 semanas por padrão.

## Responsibility

Delimitar o período de onde sai a amostra.
