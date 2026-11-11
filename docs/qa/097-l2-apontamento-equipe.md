---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l2-apontamento-equipe
commit: 18424b56d70cb11bc0428f9cede542b8c4e85b62
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: 097 L2, equipe no Apontamento (parte servidor), volta 1

**Veredito: aprovado.** Revalidação pelo delta `bca89b99..18424b56` (só `repositorio.ts`, `servico.ts` e dois testes de rota). O A1 e o A2 da primeira passada estão corrigidos; nada mais mudou de comportamento. Os 4 arquivos de `packages/` e o `grants.ts` seguem como no commit original (já cobertos pela segurança e por este QA; a decisão de mantê-los é do review). A tabela critério → teste da primeira passada (recorte das linhas, 400 em entrada inválida, `pessoa` aceito, `opcoes.equipes`, sem bloco por time, openapi, GRANT no job banco do CI) vale sem mudança.

## Execução (`VITEST_MAX_WORKERS=2`, sem `.env`, sem base real)
- `server`: `tests/apontamento-rota.test.ts` + `tests/times-sem-comparacao.test.ts`: `Test Files 2 passed (2)`, `Tests 89 passed (89)` (eram 87; +2 testes novos).
- `apontamento-rota.pg.test.ts` roda no job banco do CI; o `.verde` local não vale como prova.

## Critério → teste → resultado (delta)
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A1: slug inexistente zera linhas e incompletos | "097 L2 (A1): ... lista vazia, nunca como sem filtro" (`valores` = `[..., null, null, [], false]`) | filtro ativo sem nome resolvido | passou |
| A2: slug vazio vale `sem-time` nos dois lados | "097 L2 (A2): nome de time com slug vazio ..." (`['---']`, `true`; opção `sem-time`; 1 apontamento) | slug vazio | passou |
| Sem `equipe`, nada muda | teste existente com `[null, null, null, false]` | sem filtro | passou |

## Mutação (uma por correção, restauradas, árvore limpa)
| Mutante | Resultado |
|---|---|
| MA1 `repositorio.ts`: voltar a condição `nomes.length === 0 && !semTime ? null` | morto: o teste A1 caiu (1 falha, 81 passaram) |
| MA2 `servico.ts`: voltar `slugs.includes(slug(n))`, sem o ramo do slug vazio | morto: o teste A2 caiu (1 falha, 81 passaram) |

A semântica do SQL com `ANY('{}')` (lista vazia zera) é do Postgres e só o `.pg` do CI a exerce; o teste de unidade prova o parâmetro enviado.

## Achados
