---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k288-equipe-slug-estavel
commit: e9ca7d2747c859f875e9e71c121763c2652936b0
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: K-288, equipe da Sustentação com slug repetido (097, E3.3)

Base develop 2c1e1fac. Diff `origin/develop...e9ca7d27`: `referencia/repositorio.ts` (ordenação por bytes em `lerEquipesAC`), `referencia/servico.ts` (helper `equipesPorSlug`, primeiro vence), `server/tests/app.test.ts` e `server/tests/corte-unico.test.ts`.

## Veredito
**Aprovado** (volta 1, head e9ca7d27; anterior 62d00ef3). Sem bug aberto. O delta tira o `ORDER BY equipe COLLATE "C"` (o Postgres recusava com `SELECT DISTINCT`, 500 no job banco do PR 352), remove o teste que conferia o texto do SQL e corrige o recuo (A2 do review). A ordem por bytes fica só no código. Job `banco` do PR 352 no mesmo sha: success (run 43164401255, head e9ca7d2747c859f875e9e71c121763c2652936b0). A suíte inteira fica com o check-run `bateria` do CI.

## Execução
- Delta lido: `git diff 62d00ef3 e9ca7d27` em `repositorio.ts`, `app.test.ts` e `corte-unico.test.ts`; contrato, schemas e corte (`WHERE ${CORTE_CHAMADOS}`) intactos; sem coluna de pessoa.
- `npx vitest run tests/app.test.ts tests/corte-unico.test.ts` em `server/`, `VITEST_MAX_WORKERS=2`: 2 arquivos, 22 testes passaram (23 antes; sai "a consulta fixa a collation C", obrigação que deixou de existir).
- Estabilidade: o teste "K-288: dois nomes de mesmo slug..." percorre as duas ordens do banco e exige `Time Novo` (byte 0x54 < 0x74) nas duas; "lerEquipesAC ordena por bytes" exige a mesma saída para entrada embaralhada.
- Mutação: M1 (último nome vence, 2 testes caem) e M2 (sem `.sort` por bytes, 2 testes caem), da rodada anterior, valem sobre código inalterado no delta. M3 (tirar `COLLATE "C"`) deixa de existir com a remoção da cláusula; M2 segue guardando a única fonte da ordem.
- Vermelho: o 500 do job banco no head anterior é o vermelho do delta; verde no head e9ca7d27 (run acima).

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-288: primeiro nome (em bytes) vence em slug repetido | app.test.ts "K-288: dois nomes de mesmo slug..." | ordem do banco (as duas) | passou |
| Ordem de bytes independe da collation do banco | corte-unico.test.ts "lerEquipesAC ordena por bytes" | entrada embaralhada | passou |
| Consulta com DISTINCT aceita pelo Postgres | job banco do PR 352 (run 43164401255) | SELECT DISTINCT sem ORDER BY | passou |
| Sem id repetido; equipes do dado real (L7a) | app.test.ts "acelerato: equipes do dado real..." | slug repetido | passou |
| Corte único não mudou (K-280) | corte-unico.test.ts (existentes) | corte | passou |

## Achados
