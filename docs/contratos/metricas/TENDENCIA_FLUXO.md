# Contrato da métrica TENDENCIA_FLUXO

Propósito: descrever a rota, os filtros, as regras de cálculo, o schema do resultado e um exemplo da métrica TENDENCIA_FLUXO. Público: time (back-end, front-end, QA). Revisão: 2026-11-01.

<!-- gerado:inicio -->
Gerado por `pnpm run docs:gerar` a partir do código e do OpenAPI; não edite entre as marcas.

## Rota

`GET /api/v1/metricas/TENDENCIA_FLUXO` (contrato completo de erros, cabeçalhos e cache: [http.md](../http.md); OpenAPI: [openapi.json](../../api/openapi.json)).

| Parâmetro | Tipo | Obrigatório | Detalhe |
|---|---|---|---|
| `dataReferencia` | string | não | formato: date |

## Filtros

- Atuam nesta métrica: nenhuma.
- Não atuam: equipe, tipo, sistema, periodo.

## Regras de cálculo

| Campo | Valor |
|---|---|
| Domínio | businessmap |
| Granularidade | story |
| Segmentação permitida | tipo |
| Ordem | temporal |
| Inclui arquivados | true |
| Mínimo de amostra | 20 itens por classe |
| Partes sob mínimo | percentis |
| Referência no briefing | ADR 0019; plano sustentacao-no-operacional (O3 e O4 por mês) |
| Status | ok |

## Cartões que usam a métrica

Nenhum cartão do catálogo usa esta métrica diretamente.

## Schema do resultado

JSON Schema gerado do Zod (`SCHEMAS_RESULTADO.TENDENCIA_FLUXO`); a fotografia versionada usada no teste de compatibilidade está em [`../snapshots/resultados/TENDENCIA_FLUXO.json`](../snapshots/resultados/TENDENCIA_FLUXO.json).

```json
{
  "type": "object",
  "properties": {
    "base": {
      "type": "object",
      "properties": {
        "n": {"type":"number"},
        "unidade": {"type":"string"},
        "janela": {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "inicio": {"type":"string"},
                "fim": {"type":"string"},
                "unidade": {"type":"string","enum":["semanas","meses"]},
                "quantidade": {"type":"number"}
              },
              "required": ["inicio","fim"],
              "additionalProperties": false
            },
            {"type":"null"}
          ]
        },
        "complemento": {
          "type": "object",
          "properties": {"n":{"type":"number"},"unidade":{"type":"string"}},
          "required": ["n","unidade"],
          "additionalProperties": false
        }
      },
      "required": ["n","unidade","janela"],
      "additionalProperties": false
    },
    "criterios": {
      "type": "object",
      "properties": {
        "serie": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {"id":{"type":"string"},"data":{"type":"string"},"descricao":{"type":"string"}},
            "required": ["id","data","descricao"],
            "additionalProperties": false
          }
        },
        "janela": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {"id":{"type":"string"},"data":{"type":"string"},"descricao":{"type":"string"}},
            "required": ["id","data","descricao"],
            "additionalProperties": false
          }
        }
      },
      "required": ["serie","janela"],
      "additionalProperties": false
    },
    "meses": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "mes": {"type":"string","pattern":"^\\d{4}-(0[1-9]|1[0-2])$"},
          "fimDoMes": {"type":"string"},
          "janelaPercentis": {
            "type": "object",
            "properties": {
              "inicio": {"type":"string"},
              "fim": {"type":"string"},
              "unidade": {"type":"string","enum":["semanas","meses"]},
              "quantidade": {"type":"number"}
            },
            "required": ["inicio","fim","unidade","quantidade"],
            "additionalProperties": false
          },
          "p85PorTipo": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "tipo": {
                  "type": "string",
                  "enum": [
                    "Incidente",
                    "Requisição",
                    "Melhoria",
                    "Iniciativa",
                    "Bug interno",
                    "Defeito em produção",
                    "Dívida técnica",
                    "Trabalho de produto"
                  ]
                },
                "n": {"type":"number"},
                "estatistica": {
                  "oneOf": [
                    {
                      "type": "object",
                      "properties": {
                        "status": {"type":"string","const":"ok"},
                        "n": {"type":"integer","minimum":20,"maximum":9007199254740991},
                        "valor": {
                          "type": "object",
                          "properties": {"p50":{"type":"number"},"p85":{"type":"number"}},
                          "required": ["p50","p85"],
                          "additionalProperties": false
                        },
                        "janela": {
                          "type": "object",
                          "properties": {
                            "inicio": {"type":"string"},
                            "fim": {"type":"string"},
                            "unidade": {"type":"string","enum":["semanas","meses"]},
                            "quantidade": {"type":"number"}
                          },
                          "required": ["inicio","fim"],
                          "additionalProperties": false
                        }
                      },
                      "required": ["status","n","valor","janela"],
                      "additionalProperties": false
                    },
                    {
                      "type": "object",
                      "properties": {
                        "status": {"type":"string","const":"insuficiente"},
                        "n": {"type":"integer","minimum":-9007199254740991,"maximum":19},
                        "minimo": {"type":"number","const":20},
                        "janela": {
                          "type": "object",
                          "properties": {
                            "inicio": {"type":"string"},
                            "fim": {"type":"string"},
                            "unidade": {"type":"string","enum":["semanas","meses"]},
                            "quantidade": {"type":"number"}
                          },
                          "required": ["inicio","fim"],
                          "additionalProperties": false
                        }
                      },
                      "required": ["status","n","minimo","janela"],
                      "additionalProperties": false
                    }
                  ]
                }
              },
              "required": ["tipo","n","estatistica"],
              "additionalProperties": false
            }
          },
          "concluidos": {"type":"number"}
        },
        "required": ["mes","fimDoMes","janelaPercentis","p85PorTipo","concluidos"],
        "additionalProperties": false
      }
    }
  },
  "required": ["base","criterios","meses"],
  "additionalProperties": false
}
```

## Exemplo de resposta

Resultado da base fictícia determinística (semente padrão), validado pelo schema acima. Listas com mais de 2 itens aparecem truncadas.

```json
{
  "base": {"n":1342,"unidade":"itens concluídos","janela":{"inicio":"2026-04-01","fim":"2026-09-30"}},
  "criterios": {"serie":[],"janela":[]},
  "meses": [
    {
      "mes": "2026-04",
      "fimDoMes": "2026-04-30",
      "janelaPercentis": {"inicio":"2026-02-06","fim":"2026-04-30","unidade":"semanas","quantidade":12},
      "p85PorTipo": [
        {
          "tipo": "Incidente",
          "n": 67,
          "estatistica": {
            "status": "ok",
            "n": 67,
            "valor": {"p50":1.5553527430555556,"p85":2.3191158090277777},
            "janela": {"inicio":"2026-02-06","fim":"2026-04-30","unidade":"semanas","quantidade":12}
          }
        },
        {
          "tipo": "Requisição",
          "n": 77,
          "estatistica": {
            "status": "ok",
            "n": 77,
            "valor": {"p50":2.556332048611111,"p85":4.033975402777777},
            "janela": {"inicio":"2026-02-06","fim":"2026-04-30","unidade":"semanas","quantidade":12}
          }
        }
      ],
      "concluidos": 304
    },
    {
      "mes": "2026-05",
      "fimDoMes": "2026-05-31",
      "janelaPercentis": {"inicio":"2026-03-09","fim":"2026-05-31","unidade":"semanas","quantidade":12},
      "p85PorTipo": [
        {
          "tipo": "Incidente",
          "n": 64,
          "estatistica": {
            "status": "ok",
            "n": 64,
            "valor": {"p50":1.4565304861111112,"p85":2.220181800347222},
            "janela": {"inicio":"2026-03-09","fim":"2026-05-31","unidade":"semanas","quantidade":12}
          }
        },
        {
          "tipo": "Requisição",
          "n": 80,
          "estatistica": {
            "status": "ok",
            "n": 80,
            "valor": {"p50":2.598423072916667,"p85":3.5557562517361108},
            "janela": {"inicio":"2026-03-09","fim":"2026-05-31","unidade":"semanas","quantidade":12}
          }
        }
      ],
      "concluidos": 252
    }
  ]
}
```
<!-- gerado:fim -->
