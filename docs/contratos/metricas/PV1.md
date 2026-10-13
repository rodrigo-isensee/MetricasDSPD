# Contrato da métrica PV1

Propósito: descrever a rota, os filtros, as regras de cálculo, o schema do resultado e um exemplo da métrica PV1. Público: time (back-end, front-end, QA). Revisão: 2026-10-13.

<!-- gerado:inicio -->
Gerado por `pnpm run docs:gerar` a partir do código e do OpenAPI; não edite entre as marcas.

## Rota

`GET /api/v1/metricas/PV1` (contrato completo de erros, cabeçalhos e cache: [http.md](../http.md); OpenAPI: [openapi.json](../../api/openapi.json)).

| Parâmetro | Tipo | Obrigatório | Detalhe |
|---|---|---|---|
| `dataReferencia` | string | não | formato: date |

## Filtros

- Atuam nesta métrica: nenhuma.
- Não atuam: nenhuma.

## Regras de cálculo

| Campo | Valor |
|---|---|
| Domínio | pesquisa |
| Granularidade | resposta |
| Segmentação permitida | pergunta, area |
| Ordem | neutra |
| Inclui arquivados | nao-se-aplica |
| Mínimo de amostra | 20 itens por classe |
| Partes sob mínimo | faixa, taxa |
| Referência no briefing | Sustentação (lacuna de valor, não especificada no briefing); 4.2 mínimo de 20; T2.6; plano lacuna-de-valor |
| Status | ok |

## Cartões que usam a métrica

- Painel `sustentacao`, seção `percepcao`: Percepção de valor do serviço (`pv1`).

## Schema do resultado

JSON Schema gerado do Zod (`SCHEMAS_RESULTADO.PV1`); a fotografia versionada usada no teste de compatibilidade está em [`../snapshots/resultados/PV1.json`](../snapshots/resultados/PV1.json).

```json
{
  "oneOf": [
    {
      "type": "object",
      "properties": {
        "status": {"type":"string","const":"sem-pesquisa"},
        "fonte": {"type":"string","const":"pesquisa"}
      },
      "required": ["status","fonte"],
      "additionalProperties": false
    },
    {
      "type": "object",
      "properties": {
        "status": {"type":"string","const":"ok"},
        "fonte": {"type":"string","const":"pesquisa"},
        "trimestre": {"type":"string","pattern":"^\\d{4}-T[1-4]$"},
        "ciclo": {"type":"integer","minimum":1,"maximum":9007199254740991},
        "questionario": {
          "type": "object",
          "properties": {
            "versaoId": {"type":"string"},
            "vigenteDesde": {"type":"string"},
            "perguntas": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "codigo": {"type":"string"},
                  "ordem": {"type":"integer","minimum":-9007199254740991,"maximum":9007199254740991},
                  "texto": {"type":"string"}
                },
                "required": ["codigo","ordem","texto"],
                "additionalProperties": false
              }
            }
          },
          "required": ["versaoId","vigenteDesde","perguntas"],
          "additionalProperties": false
        },
        "participacao": {
          "type": "object",
          "properties": {
            "respondentes": {"type":"integer","minimum":-9007199254740991,"maximum":9007199254740991},
            "convidados": {"type":"integer","minimum":-9007199254740991,"maximum":9007199254740991},
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
            }
          },
          "required": ["respondentes","convidados","taxa"],
          "additionalProperties": false
        },
        "consolidado": {
          "oneOf": [
            {
              "type": "object",
              "properties": {
                "status": {"type":"string","const":"base-insuficiente"},
                "n": {"type":"integer","minimum":0,"maximum":4},
                "minimo": {"type":"number","const":5}
              },
              "required": ["status","n","minimo"],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "status": {"type":"string","const":"publicado"},
                "n": {"type":"integer","minimum":5,"maximum":9007199254740991},
                "perguntas": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "codigo": {"type":"string"},
                      "faixas": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "faixa": {
                              "anyOf": [
                                {"type":"number","const":1},
                                {"type":"number","const":2},
                                {"type":"number","const":3},
                                {"type":"number","const":4},
                                {"type":"number","const":5}
                              ]
                            },
                            "contagem": {
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
                            }
                          },
                          "required": ["faixa","contagem"],
                          "additionalProperties": false
                        }
                      }
                    },
                    "required": ["codigo","faixas"],
                    "additionalProperties": false
                  }
                }
              },
              "required": ["status","n","perguntas"],
              "additionalProperties": false
            }
          ]
        },
        "porArea": {
          "oneOf": [
            {
              "type": "object",
              "properties": {
                "status": {"type":"string","const":"nao-publicado"},
                "motivo": {"type":"string","enum":["primeiro-ciclo","base-insuficiente"]}
              },
              "required": ["status","motivo"],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "status": {"type":"string","const":"publicado"},
                "areas": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "rotulo": {"type":"string"},
                      "outras": {"type":"boolean"},
                      "bloco": {
                        "type": "object",
                        "properties": {
                          "status": {"type":"string","const":"publicado"},
                          "n": {"type":"integer","minimum":3,"maximum":9007199254740991},
                          "perguntas": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "codigo": {"type":"string"},
                                "faixas": {
                                  "type": "array",
                                  "items": {
                                    "type": "object",
                                    "properties": {
                                      "faixa": {
                                        "anyOf": [
                                          {"type":"number","const":1},
                                          {"type":"number","const":2},
                                          {"type":"number","const":3},
                                          {"type":"number","const":4},
                                          {"type":"number","const":5}
                                        ]
                                      },
                                      "contagem": {
                                        "oneOf": [
                                          {
                                            "type": "object",
                                            "properties": {
                                              "status": {"type":"string","const":"ok"},
                                              "k": {"type":"number"},
                                              "n": {
                                                "type": "integer",
                                                "minimum": 20,
                                                "maximum": 9007199254740991
                                              },
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
                                              "n": {
                                                "type": "integer",
                                                "minimum": -9007199254740991,
                                                "maximum": 19
                                              },
                                              "minimo": {"type":"number","const":20}
                                            },
                                            "required": ["status","k","n","minimo"],
                                            "additionalProperties": false
                                          }
                                        ]
                                      }
                                    },
                                    "required": ["faixa","contagem"],
                                    "additionalProperties": false
                                  }
                                }
                              },
                              "required": ["codigo","faixas"],
                              "additionalProperties": false
                            }
                          }
                        },
                        "required": ["status","n","perguntas"],
                        "additionalProperties": false
                      }
                    },
                    "required": ["rotulo","outras","bloco"],
                    "additionalProperties": false
                  }
                }
              },
              "required": ["status","areas"],
              "additionalProperties": false
            }
          ]
        },
        "tendencia": {
          "maxItems": 4,
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "trimestre": {"type":"string","pattern":"^\\d{4}-T[1-4]$"},
              "versaoId": {"type":"string"},
              "bloco": {
                "oneOf": [
                  {
                    "type": "object",
                    "properties": {
                      "status": {"type":"string","const":"base-insuficiente"},
                      "n": {"type":"integer","minimum":0,"maximum":4},
                      "minimo": {"type":"number","const":5}
                    },
                    "required": ["status","n","minimo"],
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "status": {"type":"string","const":"publicado"},
                      "n": {"type":"integer","minimum":5,"maximum":9007199254740991},
                      "concordam": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "codigo": {"type":"string"},
                            "contagem": {
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
                            }
                          },
                          "required": ["codigo","contagem"],
                          "additionalProperties": false
                        }
                      }
                    },
                    "required": ["status","n","concordam"],
                    "additionalProperties": false
                  }
                ]
              }
            },
            "required": ["trimestre","versaoId","bloco"],
            "additionalProperties": false
          }
        },
        "oQueMudou": {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "trimestre": {"type":"string","pattern":"^\\d{4}-T[1-4]$"},
                "texto": {"type":"string","maxLength":500}
              },
              "required": ["trimestre","texto"],
              "additionalProperties": false
            },
            {"type":"null"}
          ]
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
        "base": {
          "type": "object",
          "properties": {
            "n": {"type":"number"},
            "unidade": {"type":"string"},
            "janela": {
              "anyOf": [
                {
                  "type": "object",
                  "properties": {"inicio":{"type":"string"},"fim":{"type":"string"}},
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
        }
      },
      "required": [
        "status",
        "fonte",
        "trimestre",
        "ciclo",
        "questionario",
        "participacao",
        "consolidado",
        "porArea",
        "tendencia",
        "oQueMudou",
        "criterios",
        "base"
      ],
      "additionalProperties": false
    }
  ]
}
```

## Exemplo de resposta

Resultado da base fictícia determinística (semente padrão), validado pelo schema acima. Listas com mais de 2 itens aparecem truncadas.

```json
{
  "status": "ok",
  "fonte": "pesquisa",
  "trimestre": "2026-T3",
  "ciclo": 6,
  "questionario": {
    "versaoId": "q-v2",
    "vigenteDesde": "2026-04-01",
    "perguntas": [
      {"codigo":"resolve","ordem":1,"texto":"A sustentação resolve o que a minha área precisa."},
      {
        "codigo": "prazo",
        "ordem": 2,
        "texto": "O prazo de atendimento é adequado à criticidade para a minha área."
      }
    ]
  },
  "participacao": {"respondentes":24,"convidados":37,"taxa":{"status":"ok","k":24,"n":37,"pct":64.86486486486487}},
  "consolidado": {
    "status": "publicado",
    "n": 24,
    "perguntas": [
      {
        "codigo": "resolve",
        "faixas": [
          {"faixa":1,"contagem":{"status":"ok","k":0,"n":24,"pct":0}},
          {"faixa":2,"contagem":{"status":"ok","k":4,"n":24,"pct":16.666666666666664}}
        ]
      },
      {
        "codigo": "prazo",
        "faixas": [
          {"faixa":1,"contagem":{"status":"ok","k":1,"n":24,"pct":4.166666666666666}},
          {"faixa":2,"contagem":{"status":"ok","k":1,"n":24,"pct":4.166666666666666}}
        ]
      }
    ]
  },
  "porArea": {
    "status": "publicado",
    "areas": [
      {
        "rotulo": "Atendimento",
        "outras": false,
        "bloco": {
          "status": "publicado",
          "n": 4,
          "perguntas": [
            {
              "codigo": "resolve",
              "faixas": [
                {"faixa":1,"contagem":{"status":"insuficiente","k":0,"n":4,"minimo":20}},
                {"faixa":2,"contagem":{"status":"insuficiente","k":2,"n":4,"minimo":20}}
              ]
            },
            {
              "codigo": "prazo",
              "faixas": [
                {"faixa":1,"contagem":{"status":"insuficiente","k":1,"n":4,"minimo":20}},
                {"faixa":2,"contagem":{"status":"insuficiente","k":1,"n":4,"minimo":20}}
              ]
            }
          ]
        }
      },
      {
        "rotulo": "Comercial",
        "outras": false,
        "bloco": {
          "status": "publicado",
          "n": 3,
          "perguntas": [
            {
              "codigo": "resolve",
              "faixas": [
                {"faixa":1,"contagem":{"status":"insuficiente","k":0,"n":3,"minimo":20}},
                {"faixa":2,"contagem":{"status":"insuficiente","k":1,"n":3,"minimo":20}}
              ]
            },
            {
              "codigo": "prazo",
              "faixas": [
                {"faixa":1,"contagem":{"status":"insuficiente","k":0,"n":3,"minimo":20}},
                {"faixa":2,"contagem":{"status":"insuficiente","k":0,"n":3,"minimo":20}}
              ]
            }
          ]
        }
      }
    ]
  },
  "tendencia": [
    {
      "trimestre": "2025-T4",
      "versaoId": "q-v1",
      "bloco": {"status":"base-insuficiente","n":4,"minimo":5}
    },
    {
      "trimestre": "2026-T1",
      "versaoId": "q-v1",
      "bloco": {
        "status": "publicado",
        "n": 14,
        "concordam": [
          {"codigo":"resolve","contagem":{"status":"insuficiente","k":9,"n":14,"minimo":20}},
          {"codigo":"prazo","contagem":{"status":"insuficiente","k":11,"n":14,"minimo":20}}
        ]
      }
    }
  ],
  "oQueMudou": {"trimestre":"2026-T3","texto":"Publicamos a agenda de manutenção com antecedência."},
  "criterios": {
    "serie": [
      {
        "id": "pesquisa-q-v2",
        "data": "2026-04-01",
        "descricao": "Questionário v2: texto da pergunta sobre informação ajustado."
      }
    ],
    "janela": []
  },
  "base": {"n":24,"unidade":"respostas","janela":null}
}
```
<!-- gerado:fim -->
