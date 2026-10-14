# Contrato da métrica TENDENCIA_SUST

Propósito: descrever a rota, os filtros, as regras de cálculo, o schema do resultado e um exemplo da métrica TENDENCIA_SUST. Público: time (back-end, front-end, QA). Revisão: 2026-10-14.

<!-- gerado:inicio -->
Gerado por `pnpm run docs:gerar` a partir do código e do OpenAPI; não edite entre as marcas.

## Rota

`GET /api/v1/metricas/TENDENCIA_SUST` (contrato completo de erros, cabeçalhos e cache: [http.md](../http.md); OpenAPI: [openapi.json](../../api/openapi.json)).

| Parâmetro | Tipo | Obrigatório | Detalhe |
|---|---|---|---|
| `dataReferencia` | string | não | formato: date |

## Filtros

- Atuam nesta métrica: equipe, prioridade, periodo.
- Não atuam: nenhuma.

## Regras de cálculo

| Campo | Valor |
|---|---|
| Domínio | acelerato |
| Granularidade | chamado |
| Segmentação permitida | prioridade |
| Ordem | temporal |
| Inclui arquivados | nao-se-aplica |
| Mínimo de amostra | 20 itens por classe |
| Partes sob mínimo | taxa |
| Referência no briefing | ADR 0019; plano sustentacao-no-operacional (S2 e S3 por mês) |
| Status | ok |

## Cartões que usam a métrica

Nenhum cartão do catálogo usa esta métrica diretamente.

## Schema do resultado

JSON Schema gerado do Zod (`SCHEMAS_RESULTADO.TENDENCIA_SUST`); a fotografia versionada usada no teste de compatibilidade está em [`../snapshots/resultados/TENDENCIA_SUST.json`](../snapshots/resultados/TENDENCIA_SUST.json).

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
          "janela": {
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
          "prioridades": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "prioridade": {"type":"string","enum":["P1","P2","P3","P4","P5"]},
                "primeiroAtendimento": {
                  "type": "object",
                  "properties": {
                    "taxa": {
                      "oneOf": [
                        {
                          "type": "object",
                          "properties": {
                            "status": {"type":"string","const":"ok"},
                            "k": {"type":"number"},
                            "n": {"type":"integer","minimum":20,"maximum":9007199254740991},
                            "pct": {"type":"number"}
                          },
                          "required": ["status","k","n","pct"],
                          "additionalProperties": false
                        },
                        {
                          "type": "object",
                          "properties": {
                            "status": {"type":"string","const":"insuficiente"},
                            "k": {"type":"number"},
                            "n": {"type":"integer","minimum":-9007199254740991,"maximum":19},
                            "minimo": {"type":"number","const":20}
                          },
                          "required": ["status","k","n","minimo"],
                          "additionalProperties": false
                        }
                      ]
                    },
                    "statusMeta": {"type":"string","enum":["dentro","fora","sem-referencia"]}
                  },
                  "required": ["taxa","statusMeta"],
                  "additionalProperties": false
                },
                "restauracao": {
                  "type": "object",
                  "properties": {
                    "taxa": {
                      "oneOf": [
                        {
                          "type": "object",
                          "properties": {
                            "status": {"type":"string","const":"ok"},
                            "k": {"type":"number"},
                            "n": {"type":"integer","minimum":20,"maximum":9007199254740991},
                            "pct": {"type":"number"}
                          },
                          "required": ["status","k","n","pct"],
                          "additionalProperties": false
                        },
                        {
                          "type": "object",
                          "properties": {
                            "status": {"type":"string","const":"insuficiente"},
                            "k": {"type":"number"},
                            "n": {"type":"integer","minimum":-9007199254740991,"maximum":19},
                            "minimo": {"type":"number","const":20}
                          },
                          "required": ["status","k","n","minimo"],
                          "additionalProperties": false
                        }
                      ]
                    },
                    "statusMeta": {"type":"string","enum":["dentro","fora","sem-referencia"]}
                  },
                  "required": ["taxa","statusMeta"],
                  "additionalProperties": false
                }
              },
              "required": ["prioridade","primeiroAtendimento","restauracao"],
              "additionalProperties": false
            }
          },
          "volume": {"type":"number"}
        },
        "required": ["mes","fimDoMes","janela","prioridades","volume"],
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
  "base": {"n":2017,"unidade":"chamados abertos","janela":{"inicio":"2026-04-01","fim":"2026-09-30"}},
  "criterios": {"serie":[],"janela":[]},
  "meses": [
    {
      "mes": "2026-04",
      "fimDoMes": "2026-04-30",
      "janela": {"inicio":"2026-02-06","fim":"2026-04-30","unidade":"semanas","quantidade":12},
      "prioridades": [
        {
          "prioridade": "P1",
          "primeiroAtendimento": {"taxa":{"status":"insuficiente","k":6,"n":6,"minimo":20},"statusMeta":"sem-referencia"},
          "restauracao": {"taxa":{"status":"insuficiente","k":6,"n":6,"minimo":20},"statusMeta":"sem-referencia"}
        },
        {
          "prioridade": "P2",
          "primeiroAtendimento": {"taxa":{"status":"ok","k":52,"n":57,"pct":91.22807017543859},"statusMeta":"dentro"},
          "restauracao": {"taxa":{"status":"ok","k":48,"n":57,"pct":84.21052631578947},"statusMeta":"fora"}
        }
      ],
      "volume": 318
    },
    {
      "mes": "2026-05",
      "fimDoMes": "2026-05-31",
      "janela": {"inicio":"2026-03-09","fim":"2026-05-31","unidade":"semanas","quantidade":12},
      "prioridades": [
        {
          "prioridade": "P1",
          "primeiroAtendimento": {"taxa":{"status":"insuficiente","k":6,"n":6,"minimo":20},"statusMeta":"sem-referencia"},
          "restauracao": {"taxa":{"status":"insuficiente","k":6,"n":6,"minimo":20},"statusMeta":"sem-referencia"}
        },
        {
          "prioridade": "P2",
          "primeiroAtendimento": {"taxa":{"status":"ok","k":61,"n":69,"pct":88.40579710144928},"statusMeta":"fora"},
          "restauracao": {"taxa":{"status":"ok","k":56,"n":69,"pct":81.15942028985508},"statusMeta":"fora"}
        }
      ],
      "volume": 328
    }
  ]
}
```
<!-- gerado:fim -->
