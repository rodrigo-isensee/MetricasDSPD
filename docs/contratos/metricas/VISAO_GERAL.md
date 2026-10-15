# Contrato da métrica VISAO_GERAL

Propósito: descrever a rota, os filtros, as regras de cálculo, o schema do resultado e um exemplo da métrica VISAO_GERAL. Público: time (back-end, front-end, QA). Revisão: 2026-10-15.

<!-- gerado:inicio -->
Gerado por `pnpm run docs:gerar` a partir do código e do OpenAPI; não edite entre as marcas.

## Rota

`GET /api/v1/metricas/VISAO_GERAL` (contrato completo de erros, cabeçalhos e cache: [http.md](../http.md); OpenAPI: [openapi.json](../../api/openapi.json)).

| Parâmetro | Tipo | Obrigatório | Detalhe |
|---|---|---|---|
| `dataReferencia` | string | não | formato: date |

## Filtros

- Atuam nesta métrica: nenhuma.
- Não atuam: nenhuma.

## Regras de cálculo

| Campo | Valor |
|---|---|
| Domínio | composicao |
| Granularidade | story, frente, projeto, chamado |
| Segmentação permitida | nenhuma |
| Ordem | neutra |
| Inclui arquivados | nao-se-aplica |
| Mínimo de amostra | 0 (contagem, censo ou retrato: sem mínimo) |
| Partes sob mínimo | nenhuma |
| Referência no briefing | 3.1 da spec UX; Q1 (herda de cada métrica exposta; blocos por domínio) |
| Status | ok |

## Cartões que usam a métrica

Nenhum cartão do catálogo usa esta métrica diretamente.

## Schema do resultado

JSON Schema gerado do Zod (`SCHEMAS_RESULTADO.VISAO_GERAL`); a fotografia versionada usada no teste de compatibilidade está em [`../snapshots/resultados/VISAO_GERAL.json`](../snapshots/resultados/VISAO_GERAL.json).

```json
{
  "type": "object",
  "properties": {
    "dataCorte": {"type":"string"},
    "recortes": {
      "type": "object",
      "properties": {
        "fluxo": {
          "type": "object",
          "properties": {"inicio":{"type":"string"},"fim":{"type":"string"}},
          "required": ["inicio","fim"],
          "additionalProperties": false
        },
        "estrategico": {
          "type": "object",
          "properties": {"inicio":{"type":"string"},"fim":{"type":"string"}},
          "required": ["inicio","fim"],
          "additionalProperties": false
        },
        "sustentacao": {
          "type": "object",
          "properties": {"inicio":{"type":"string"},"fim":{"type":"string"}},
          "required": ["inicio","fim"],
          "additionalProperties": false
        }
      },
      "required": ["fluxo","estrategico","sustentacao"],
      "additionalProperties": false
    },
    "alertas": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "nivel": {"type":"string","enum":["operacional","tatico","estrategico","sustentacao"]},
          "metrica": {"type":"string"},
          "ancora": {"type":"string"},
          "codigo": {
            "type": "string",
            "enum": [
              "O2_ACIMA_P95",
              "O1_WIP_ACIMA_LIMITE",
              "O12_VENCIDOS_INTERNOS",
              "O10_BACKLOG_180",
              "T2_ABAIXO_85",
              "T4_RAZAO_FORA",
              "T3_DESVIO",
              "T9_ESCOPO",
              "E2_ABAIXO_60",
              "E3_SEM_RESULTADO",
              "S2_ABAIXO_90",
              "S1_MEDIANA_ACIMA_ALVO"
            ]
          },
          "valor": {"type":"number"},
          "de": {"type":["number","null"]}
        },
        "required": ["nivel","metrica","ancora","codigo","valor","de"],
        "additionalProperties": false
      }
    },
    "niveis": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "nivel": {"type":"string","enum":["operacional","tatico","estrategico","sustentacao"]},
          "fonte": {"type":"string","enum":["BusinessMap","Acelerato"]},
          "status": {"type":"string","enum":["atencao","dentro","insuficiente","sem-meta"]},
          "indicadores": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "metrica": {
                  "type": "string",
                  "enum": [
                    "O1",
                    "O2",
                    "BLOQUEADOS",
                    "O3",
                    "O4",
                    "O7",
                    "O9",
                    "O10",
                    "O12",
                    "O15",
                    "O18",
                    "O5",
                    "O6",
                    "O8",
                    "O11",
                    "O13",
                    "O14",
                    "O16",
                    "O17",
                    "O19",
                    "O20",
                    "O21",
                    "O24",
                    "O25",
                    "T1",
                    "T2",
                    "T3",
                    "T4",
                    "T5",
                    "T7",
                    "T9",
                    "T6",
                    "T8",
                    "T10",
                    "T12",
                    "E1",
                    "E2",
                    "E3",
                    "E4",
                    "E5",
                    "E7",
                    "E9",
                    "S1",
                    "S2",
                    "S3",
                    "S4",
                    "S5",
                    "S6",
                    "S7",
                    "S8",
                    "S9",
                    "S10",
                    "S11",
                    "S12",
                    "EI_FL1",
                    "EI_FL2",
                    "EI_FL3",
                    "EI_SUST",
                    "VISAO_GERAL"
                  ]
                },
                "codigo": {"type":"string"},
                "valor": {"type":["number","null"]},
                "de": {"type":["number","null"]},
                "base": {
                  "type": "object",
                  "properties": {"n":{"type":"number"},"unidade":{"type":"string"}},
                  "required": ["n","unidade"],
                  "additionalProperties": false
                },
                "status": {"type":"string","enum":["dentro","fora","insuficiente","sem-meta"]},
                "amostra": {
                  "anyOf": [
                    {
                      "type": "object",
                      "properties": {"n":{"type":"number"},"minimo":{"type":"number"}},
                      "required": ["n","minimo"],
                      "additionalProperties": false
                    },
                    {"type":"null"}
                  ]
                }
              },
              "required": ["metrica","codigo","valor","de","base","status","amostra"],
              "additionalProperties": false
            }
          }
        },
        "required": ["nivel","fonte","status","indicadores"],
        "additionalProperties": false
      }
    },
    "esperaInvisivel": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "nivel": {"type":"string","enum":["FL1","FL2","FL3","SUST"]},
          "fonte": {"type":"string","enum":["BusinessMap","Acelerato"]},
          "unidade": {"type":"string","enum":["dias-uteis","horas-uteis"]},
          "segmentos": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "chave": {"type":["string","null"]},
                "rotulo": {"type":["string","null"]},
                "estatistica": {
                  "oneOf": [
                    {
                      "type": "object",
                      "properties": {
                        "status": {"type":"string","const":"ok"},
                        "n": {"type":"integer","minimum":20,"maximum":9007199254740991},
                        "valor": {
                          "type": "object",
                          "properties": {
                            "cliente": {"type":"number"},
                            "time": {"type":"number"},
                            "indicePct": {"type":"number"},
                            "acimaDe50": {"type":"boolean"}
                          },
                          "required": ["cliente","time","indicePct","acimaDe50"],
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
              "required": ["chave","rotulo","estatistica"],
              "additionalProperties": false
            }
          }
        },
        "required": ["nivel","fonte","unidade","segmentos"],
        "additionalProperties": false
      }
    }
  },
  "required": ["dataCorte","recortes","alertas","niveis","esperaInvisivel"],
  "additionalProperties": false
}
```

## Exemplo de resposta

Resultado da base fictícia determinística (semente padrão), validado pelo schema acima. Listas com mais de 2 itens aparecem truncadas.

```json
{
  "dataCorte": "2026-10-09",
  "recortes": {
    "fluxo": {"inicio":"2026-07-18","fim":"2026-10-09"},
    "estrategico": {"inicio":"2025-10-10","fim":"2026-10-09"},
    "sustentacao": {"inicio":"2026-04-10","fim":"2026-10-09"}
  },
  "alertas": [
    {"nivel":"operacional","metrica":"O2","ancora":"o2","codigo":"O2_ACIMA_P95","valor":1,"de":89},
    {
      "nivel": "operacional",
      "metrica": "O1",
      "ancora": "o1",
      "codigo": "O1_WIP_ACIMA_LIMITE",
      "valor": 49,
      "de": 59
    }
  ],
  "niveis": [
    {
      "nivel": "operacional",
      "fonte": "BusinessMap",
      "status": "atencao",
      "indicadores": [
        {
          "metrica": "O2",
          "codigo": "O2",
          "valor": 1,
          "de": 89,
          "base": {"n":89,"unidade":"itens abertos"},
          "status": "fora",
          "amostra": null
        },
        {
          "metrica": "O1",
          "codigo": "O1",
          "valor": 83.05084745762711,
          "de": 59,
          "base": {"n":59,"unidade":"dias úteis"},
          "status": "fora",
          "amostra": null
        }
      ]
    },
    {
      "nivel": "tatico",
      "fonte": "BusinessMap",
      "status": "atencao",
      "indicadores": [
        {
          "metrica": "T2",
          "codigo": "T2",
          "valor": 1,
          "de": 3,
          "base": {"n":602,"unidade":"demandas entregues"},
          "status": "fora",
          "amostra": null
        },
        {
          "metrica": "T4",
          "codigo": "T4",
          "valor": 3,
          "de": 3,
          "base": {"n":1180,"unidade":"chegadas e entregas"},
          "status": "fora",
          "amostra": null
        }
      ]
    }
  ],
  "esperaInvisivel": [
    {
      "nivel": "FL1",
      "fonte": "BusinessMap",
      "unidade": "dias-uteis",
      "segmentos": [
        {
          "chave": "incidente",
          "rotulo": "Incidente",
          "estatistica": {
            "status": "ok",
            "n": 80,
            "valor": {"cliente":2.46,"time":1.93,"indicePct":21.71,"acimaDe50":false},
            "janela": {"inicio":"2026-07-18","fim":"2026-10-09","unidade":"semanas","quantidade":12}
          }
        },
        {
          "chave": "requisicao",
          "rotulo": "Requisição",
          "estatistica": {
            "status": "ok",
            "n": 74,
            "valor": {"cliente":8.77,"time":3.35,"indicePct":61.76,"acimaDe50":true},
            "janela": {"inicio":"2026-07-18","fim":"2026-10-09","unidade":"semanas","quantidade":12}
          }
        }
      ]
    },
    {
      "nivel": "FL2",
      "fonte": "BusinessMap",
      "unidade": "dias-uteis",
      "segmentos": [
        {
          "chave": null,
          "rotulo": null,
          "estatistica": {
            "status": "ok",
            "n": 27,
            "valor": {"cliente":65.98,"time":23.81,"indicePct":63.92,"acimaDe50":true},
            "janela": {"inicio":"2026-07-18","fim":"2026-10-09","unidade":"semanas","quantidade":12}
          }
        }
      ]
    }
  ]
}
```
<!-- gerado:fim -->
