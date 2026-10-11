---
type: aggregate-root
attributes:
  - name: data_source
    type: domain/metrics/data-source
    required: true
  - name: origin_id
    type: string
    required: true
  - name: payload_sha256
    type: string
    required: true
  - name: collected_at
    type: datetime
    required: true
relationships:
  - target: collection-run
    type: reference
    cardinality: "1"
---

## Description

Registro de origem imutável no staging (`stg_*`, original "registro de origem"), deduplicado por hash contra a última versão do item.

## Responsibility

Guardar o payload original, a fonte da verdade fora da ferramenta.
