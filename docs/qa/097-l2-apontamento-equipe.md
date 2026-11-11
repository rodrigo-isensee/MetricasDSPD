---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l2-apontamento-equipe
commit: bca89b999ec509ffbdc118e97899bbd65878ed09
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 1
data: 2026-11-11
---
# QA: 097 L2, equipe no Apontamento (parte servidor)

**Veredito: reprovado, por um defeito provado (A1).** O filtro `equipe` recorta bem as linhas, mas o sinal de cards incompletos ignora o filtro quando nenhum slug pedido existe na base. Classe N. O diff inclui os 4 arquivos fora do escopo declarado (`packages/contratos/src/apontamento.ts`, `filtros.ts`, `tipos.ts`, teste da biblioteca): conferidos, são mínimos e coerentes com o plano (L2).

## Execução (no sandbox, `VITEST_MAX_WORKERS=2`, sem `.env`, sem base real)
- `server`: `tests/apontamento-rota.test.ts` + `tests/times-sem-comparacao.test.ts`: `Test Files 2 passed (2)`, `Tests 87 passed (87)`.
- `packages/metricas`: `src/businessmap/apontamento`: `Test Files 1 passed (1)`, `Tests 66 passed (66)`.
- `openapi:verificar` (`tsx src/entradas/openapi.ts --verificar`): `openapi.json em dia`.
- `apontamento-rota.pg.test.ts` (GRANT por coluna e ponta a ponta com o papel da aba) não roda aqui: é do job banco do CI; o `.verde` local não vale como prova.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| `equipe` recorta as linhas (time do card ou do pai) | `apontamento-rota.test.ts` "o filtro equipe restringe o calculo"; biblioteca "097 L2: o filtro equipe restringe" | lista vazia = sem filtro; time desconhecido zera | passou |
| `sem-time` pega card sem equipe | idem (`sem-time` = 1800 s) | card sem time | passou |
| Cards incompletos recortados (card e pai) | "o filtro equipe chega por parametro" (valores `['Time Alfa'], true`; SQL com `COALESCE(ec.equipe, ep.equipe)`) | só valida parâmetro e texto do SQL; a semântica do SQL só no `.pg` (CI) | passou, com lacuna (A1) |
| Slug que não existe na base recorta os incompletos | nenhum | slug desconhecido sozinho | **falhou: sem teste e com defeito (A1)** |
| Repetido ou inválido dá 400 | "entrada invalida ou repetida" (maiúscula, aspas, repetido, 61 caracteres) | máximo 60, formato | passou |
| Sem `equipe`, resposta igual à anterior | teste de chamada: `valores.slice(2)` = `[null, null, null, false]`; chaves da resposta iguais com e sem filtro | sem filtro | passou |
| `pessoa` segue aceito | "o parametro pessoa continua aceito" | compatibilidade | passou |
| `opcoes.equipes` não encolhe com o filtro | lista do período (`noRecorte`), como `projetos` e `tipos`; teste de listagem sem filtro e `.pg` com 3 opções | só o período recorta a lista | passou (o caso "filtrado continua listando todas" não tem teste próprio; baixa, ver A2) |
| Sem bloco agregado por equipe | "a resposta nao ganha bloco por time"; `times-sem-comparacao` (sem GROUP BY, contagem ou ordem por time) | regra inviolável de times | passou |
| `docs/api/openapi.json` bate com a rota | `openapi:verificar`: em dia; `docs/api/apontamento.md` descreve `equipe` e `opcoes.equipes` | contrato aditivo | passou |
| GRANT só de `dim_card.equipe`, sem coluna de pessoa | `.pg` (CI): `SELECT equipe` ok, `responsaveis`, `responsavel_id`, `card_pai` dão 42501 | permissão por coluna | CI (job banco) |

## Mutação (restaurada, árvore limpa)
| Mutante | Resultado |
|---|---|
| M1 `servico.ts`: tirar `equipe` dos filtros do cálculo | morto: "o filtro equipe restringe o calculo" caiu (1 falha, 79 passaram) |
| M2 `repositorio.ts`: filtro de equipe do SQL de incompletos trocado por `AND true` | morto, mas só pelo teste de texto do SQL ("nunca vira SQL", regex `COALESCE`); a semântica só o `.pg` pega |
| M3 `servico.ts`: `semTime: false` fixo | morto: "o filtro equipe chega por parametro" |

## Defeito provado (A1)
`filtroDeEquipe(['inexistente'], ['Time Alfa'])` devolve `{"nomes":[],"semTime":false}` (sonda temporária, removida). `lerCardsIncompletos` trata `nomes.length === 0 && !semTime` como "sem filtro" e passa `null` no `$5`: com `equipe=<slug que não existe>` as linhas zeram (comprovado no teste), mas `registroIncompleto` lista todos os cards incompletos do período e do projeto. O mesmo vale para o link de um time renomeado ou apagado (risco já anotado no plano, 098 E4). Esperado: nenhum card. Ponto da segurança (slug vazio): `equipeDe` leva nome com slug vazio a "Sem time" (linhas), mas `filtroDeEquipe` não o põe em `nomes` nem a consulta o pega com `IS NULL`: o card de time `!!!` conta nas horas de `sem-time` e some dos incompletos (A2). Bug: `docs/qa/bugs/` não gravado neste portão (só o parecer); correção no `node-backend`.

## Achados
- A1 (bloqueante) server/src/modulos/apontamento/repositorio.ts:201 · `equipes` vira `null` (sem filtro) quando `nomes` é vazio e `semTime` falso: com `equipe=<slug inexistente>` os incompletos vêm todos, e as linhas, zeradas. Passar `[]` com filtro ativo (`ANY('{}')` zera) e testar.
- A2 (recomendado) server/src/modulos/apontamento/servico.ts:24 · nome de time com slug vazio entra em `sem-time` nas linhas, mas não no filtro dos incompletos. Incluir no `semTime` e na consulta (`slug(equipe) = ''`), ou tratá-lo igual nos dois lados; teste da fronteira.
