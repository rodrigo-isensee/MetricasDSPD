---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k288-equipe-slug-estavel
commit: 62d00ef3bddf211bcc1a189e203187f0b5eaa650
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: K-288, equipe da Sustentação com slug repetido (097, E3.3)

Base develop 2c1e1fac. Diff `origin/develop...62d00ef3`: `referencia/repositorio.ts` (`ORDER BY equipe COLLATE "C"` e ordenação por bytes em `lerEquipesAC`), `referencia/servico.ts` (helper `equipesPorSlug`, primeiro vence), `server/tests/app.test.ts` e `server/tests/corte-unico.test.ts`.

## Veredito
**Aprovado.** Sem bug aberto. A escolha do nome é estável nas duas ordens do banco; contrato e corte não mudaram; três mutações derrubam teste e foram restauradas. Os testes `.pg` e a suíte inteira ficam com o check-run `bateria` do mesmo sha no CI.

## Execução
- `npx vitest run tests/app.test.ts tests/corte-unico.test.ts` em `server/`, `VITEST_MAX_WORKERS=2`: 2 arquivos, 23 testes passaram.
- Estabilidade: o teste "K-288: dois nomes de mesmo slug..." percorre as duas ordens (`['time-novo','Time Novo']` e `['Time Novo','time-novo']`) e exige `Time Novo` (byte 0x54 < 0x74) nas duas. O teste de `lerEquipesAC` exige a mesma saída para entradas embaralhadas.
- Contrato: nenhum arquivo de `schemas.ts` nem de `docs/api` mudou; o formato `{id, nome}` e a ordem por slug-primeiro são os mesmos.
- Corte: `CORTE_CHAMADOS` intacto; a consulta segue em `WHERE ${CORTE_CHAMADOS}` (teste do K-280 passa), só a cláusula `ORDER BY` mudou. Sem coluna de pessoa; só esquema Acelerato.
- Teste existente que mudou: a expectativa de `time-novo` (nome) passou de `'time-novo'` para `'Time Novo'`. Coerente com a regra nova (o primeiro em bytes); o motivo é a decisão do pedido, não acomodação.
- Mutação (cada uma restaurada, árvore limpa ao fim):
  - M1, voltar a manter o último nome (`servico.ts`, tira o `if (!porId.has(...))`): 2 falharam (o teste de equipes do dado real e o K-288 do app).
  - M2, tirar o `.sort` por bytes de `repositorio.ts`: 2 falharam (K-288 do app e `lerEquipesAC ordena por bytes`).
  - M3, tirar `COLLATE "C"` da consulta: 1 falhou (`a consulta fixa a collation C`).
- Vermelho antes do verde: a mutação M1 reproduz o comportamento anterior (último nome vence) e é o que o teste novo e o teste mudado pegam.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-288: primeiro nome (em bytes) vence em slug repetido | app.test.ts "K-288: dois nomes de mesmo slug..." | ordem do banco (as duas) | passou |
| Ordem de bytes independe da collation do banco | corte-unico.test.ts "lerEquipesAC ordena por bytes" | entrada embaralhada | passou |
| Consulta fixa a collation C | corte-unico.test.ts "a consulta fixa a collation C" | n/a | passou |
| Sem id repetido; equipes do dado real (L7a) | app.test.ts "acelerato: equipes do dado real..." | slug repetido | passou |
| Corte único não mudou (K-280) | corte-unico.test.ts (existentes) | corte | passou |

## Achados
