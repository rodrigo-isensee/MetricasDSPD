---
type: aggregate-root
attributes:
  - name: board_id
    type: string
    required: true
  - name: level
    type: board-level
    required: true
  - name: is_test
    type: boolean
    required: true
relationships:
  - target: board-column
    type: composition
    cardinality: "1..*"
---

## Description

Quadro do BusinessMap (`dspd_bm.ref_quadro`, original "quadro"); quadro de teste ou rascunho fica fora de qualquer cálculo (briefing 4.2).

## Responsibility

Situar a equipe e o nível do quadro e dizer se ele entra no cálculo.
