---
tipo: review
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-doc-env-acelerato
commit: 858b98b99d3384eda721ed4fb60598358036045e
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---

# Code review: aviso de nomes do `.env` do Acelerato na documentação da demo (E4.7, K-258)

Escopo: só `docs/engineering/demo-dado-real.md` (classe T, documentação). Sem código, sem guarda, sem teste a exigir.

## Conferência contra `scripts/demo-dado-real.sh`

- A etapa 1 (linhas 36 a 51) exige `ACELERATO_MYSQL_HOST`, `_PORT`, `_DATABASE`, `_USER`, `_PASSWORD`, `_TLS_SHA256` e `_TLS_CERT_FILE`. A tabela nova do doc traz exatamente os quatro nomes novos (`_PORT`, `_DATABASE`, `_USER`, `_PASSWORD`), cada um com o antigo correspondente (`_PORTA`, `_BANCO`, `_USUARIO`, `_SENHA`); o mapeamento é o mesmo de sempre.
- "Se falhar": a etapa 1 lista só os nomes que faltam (`variavel-ausente`, "so os nomes"); com `.env` antigo, faltam os quatro novos. O texto bate com o script.
- Sem valor de credencial: a tabela e o texto só têm nomes de variável.
- Os dois pontos do doc (lista de "Antes de rodar" e tabela) usam a mesma grafia; sem divergência interna.

## Achados

Nenhum.
