# Contrato da métrica EI_SUST

Propósito: descrever a rota, os filtros, as regras de cálculo, o schema do resultado e um exemplo da métrica EI_SUST. Público: time (back-end, front-end, QA). Revisão: 2026-10-11.

<!-- gerado:inicio -->
Gerado por `pnpm run docs:gerar` a partir do código e do OpenAPI; não edite entre as marcas.

## Rota

`GET /api/v1/metricas/EI_SUST` (contrato completo de erros, cabeçalhos e cache: [http.md](../http.md); OpenAPI: [openapi.json](../../api/openapi.json)).

| Parâmetro | Tipo | Obrigatório | Detalhe |
|---|---|---|---|
| `equipe` | string | não |  |
| `prioridade` | string | não |  |
| `periodo` | string | não | valores: 4s, 12s, 6m, 12m, custom; padrão: 12s |
| `de` | string | não | formato: date |
| `ate` | string | não | formato: date |
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
| Partes sob mínimo | mediana |
| Referência no briefing | T3.4; Q2 |
| Status | ok |

## Cartões que usam a métrica

- Painel `sustentacao`, seção `espera`: Espera invisível · Sustentação (`ei-sust`).

## Schema do resultado

JSON Schema gerado do Zod (`SCHEMAS_RESULTADO.EI_SUST`); a fotografia versionada usada no teste de compatibilidade está em [`../snapshots/resultados/EI_SUST.json`](../snapshots/resultados/EI_SUST.json).

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
    "nivel": {"type":"string","enum":["FL1","FL2","FL3","SUST"]},
    "fonte": {"type":"string","enum":["BusinessMap","Acelerato"]},
    "granularidade": {"type":"string","enum":["demanda","frente","projeto","chamado"]},
    "unidade": {"type":"string","enum":["dias-uteis","horas-uteis"]},
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
    "segmentoPor": {"anyOf":[{"type":"string","enum":["tipo","prioridade"]},{"type":"null"}]},
    "segmentos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "chave": {"type":["string","null"]},
          "rotulo": {"type":["string","null"]},
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
                    "properties": {"inicio":{"type":"string"},"fim":{"type":"string"}},
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
                    "properties": {"inicio":{"type":"string"},"fim":{"type":"string"}},
                    "required": ["inicio","fim"],
                    "additionalProperties": false
                  }
                },
                "required": ["status","n","minimo","janela"],
                "additionalProperties": false
              }
            ]
          },
          "serie": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "mes": {"type":"string"},
                "n": {"type":"number"},
                "cliente": {"type":["number","null"]},
                "time": {"type":["number","null"]},
                "indicePct": {"type":["number","null"]}
              },
              "required": ["mes","n","cliente","time","indicePct"],
              "additionalProperties": false
            }
          }
        },
        "required": ["chave","rotulo","n","estatistica","serie"],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "base",
    "criterios",
    "nivel",
    "fonte",
    "granularidade",
    "unidade",
    "janelaPercentis",
    "segmentoPor",
    "segmentos"
  ],
  "additionalProperties": false
}
```

## Exemplo de resposta

Resultado da base fictícia determinística (semente padrão), validado pelo schema acima. Listas com mais de 2 itens aparecem truncadas.

```json
{
  "base": {
    "n": 932,
    "unidade": "chamados",
    "janela": {"inicio":"2026-07-18","fim":"2026-10-09","unidade":"semanas","quantidade":12}
  },
  "criterios": {"serie":[],"janela":[]},
  "nivel": "SUST",
  "fonte": "Acelerato",
  "granularidade": "chamado",
  "unidade": "horas-uteis",
  "janelaPercentis": {"inicio":"2026-07-18","fim":"2026-10-09","unidade":"semanas","quantidade":12},
  "segmentoPor": "prioridade",
  "segmentos": [
    {
      "chave": "p1",
      "rotulo": "P1",
      "n": 9,
      "estatistica": {
        "status": "insuficiente",
        "n": 9,
        "minimo": 20,
        "janela": {"inicio":"2026-07-18","fim":"2026-10-09","unidade":"semanas","quantidade":12}
      },
      "serie": [
        {"mes":"2026-08","n":16,"cliente":null,"time":null,"indicePct":null},
        {"mes":"2026-09","n":8,"cliente":null,"time":null,"indicePct":null}
      ]
    },
    {
      "chave": "p2",
      "rotulo": "P2",
      "n": 56,
      "estatistica": {
        "status": "ok",
        "n": 56,
        "valor": {"cliente":17.58,"time":4.4,"indicePct":75,"acimaDe50":true},
        "janela": {"inicio":"2026-07-18","fim":"2026-10-09","unidade":"semanas","quantidade":12}
      },
      "serie": [
        {"mes":"2026-08","n":87,"cliente":16.59,"time":4.61,"indicePct":72.22},
        {"mes":"2026-09","n":52,"cliente":17.58,"time":4.65,"indicePct":73.57}
      ]
    }
  ]
}
```
<!-- gerado:fim -->
