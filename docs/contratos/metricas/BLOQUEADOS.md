# Contrato da métrica BLOQUEADOS

Propósito: descrever a rota, os filtros, as regras de cálculo, o schema do resultado e um exemplo da métrica BLOQUEADOS. Público: time (back-end, front-end, QA). Revisão: 2026-10-15.

<!-- gerado:inicio -->
Gerado por `pnpm run docs:gerar` a partir do código e do OpenAPI; não edite entre as marcas.

## Rota

`GET /api/v1/metricas/BLOQUEADOS` (contrato completo de erros, cabeçalhos e cache: [http.md](../http.md); OpenAPI: [openapi.json](../../api/openapi.json)).

| Parâmetro | Tipo | Obrigatório | Detalhe |
|---|---|---|---|
| `equipe` | string | não |  |
| `tipo` | string | não |  |
| `sistema` | string | não |  |
| `periodo` | string | não | valores: 4s, 12s, 6m, 12m, custom; padrão: 12s |
| `de` | string | não | formato: date |
| `ate` | string | não | formato: date |
| `dataReferencia` | string | não | formato: date |
| `page` | integer | não |  |
| `pageSize` | integer | não |  |

## Filtros

- Atuam nesta métrica: equipe, tipo, sistema, periodo.
- Não atuam: nenhuma.

## Regras de cálculo

| Campo | Valor |
|---|---|
| Domínio | businessmap |
| Granularidade | story |
| Segmentação permitida | coluna, tipo |
| Ordem | neutra |
| Inclui arquivados | true |
| Mínimo de amostra | 0 (contagem, censo ou retrato: sem mínimo) |
| Partes sob mínimo | nenhuma |
| Referência no briefing | 4.2 bloqueio marcado no card; 06 O1 |
| Status | ok |

## Cartões que usam a métrica

- Painel `operacional`, seção `diaria`: Bloqueados agora (`bloqueados`).

## Schema do resultado

JSON Schema gerado do Zod (`SCHEMAS_RESULTADO.BLOQUEADOS`); a fotografia versionada usada no teste de compatibilidade está em [`../snapshots/resultados/BLOQUEADOS.json`](../snapshots/resultados/BLOQUEADOS.json).

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
    "itens": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "cardId": {"type":"string"},
          "titulo": {"type":"string"},
          "tipo": {
            "type": "string",
            "enum": [
              "Incidente",
              "Requisição",
              "Melhoria",
              "Iniciativa",
              "Bug interno",
              "Defeito em produção",
              "Dívida técnica"
            ]
          },
          "etapa": {"type":"string"},
          "motivo": {
            "type": "string",
            "enum": [
              "Aguardando fornecedor",
              "Aguardando validação do negócio",
              "Aguardando ambiente ou infraestrutura",
              "Dependência de outra demanda",
              "Falta de informação no chamado",
              "Janela de mudança",
              "Aguardando licença ou contrato"
            ]
          },
          "fornecedor": {"type":["string","null"]},
          "bloqueadoHaDiasUteis": {"type":"number"}
        },
        "required": ["cardId","titulo","tipo","etapa","motivo","fornecedor","bloqueadoHaDiasUteis"],
        "additionalProperties": false
      }
    }
  },
  "required": ["base","criterios","itens"],
  "additionalProperties": false
}
```

## Exemplo de resposta

Resultado da base fictícia determinística (semente padrão), validado pelo schema acima. Listas com mais de 2 itens aparecem truncadas.

```json
{
  "base": {"n":4,"unidade":"itens bloqueados","janela":null},
  "criterios": {"serie":[],"janela":[]},
  "itens": [
    {
      "cardId": "S-1916",
      "titulo": "Migrar importação de leads (CRM)",
      "tipo": "Requisição",
      "etapa": "Em desenvolvimento",
      "motivo": "Aguardando fornecedor",
      "fornecedor": "Fornecedor Beta",
      "bloqueadoHaDiasUteis": 0.84
    },
    {
      "cardId": "S-1892",
      "titulo": "Criar pedido de compra (Protheus)",
      "tipo": "Requisição",
      "etapa": "Em desenvolvimento",
      "motivo": "Falta de informação no chamado",
      "fornecedor": null,
      "bloqueadoHaDiasUteis": 0.52
    }
  ]
}
```
<!-- gerado:fim -->
