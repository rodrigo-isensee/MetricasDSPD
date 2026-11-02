---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-sust-real
commit: 1f821a0
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-01
---
# QA: 052-sust-real (sustentação com dado real do Acelerato, E2.115 e E2.117, K-182)

**Parecer (E2.128, revalidação por delta): aprovado.** O 052-SR-001 está corrigido: o `pnpm run pronto` na ponta de código `1f821a0` sai verde (trava, lint, `format:check` e `pnpm -r run pronto`, com `docs:check` ok). O delta `b531d77..1f821a0` é só a quebra de linha de três constantes e de um `toBe` em `packages/contratos/src/origem.ts` e `origem.test.ts` (9 linhas, texto das strings idêntico, conferido no diff); nenhum código do servidor nem do web mudou, então a suíte .pg da rodada anterior (170 testes verdes, com o teste do QA) segue valendo e não foi repetida. Abaixo, a rodada original (E2.120, `671e8d7`) e a revalidação.

## Revalidação (E2.128)
| Etapa | Comando | Resultado |
|---|---|---|
| Delta | `git diff b531d77 HEAD` | 2 arquivos, só formatação (as strings das constantes não mudaram) |
| Pronto completo | `pnpm run pronto` | rc 0: trava ok, lint ok, `format:check` ok ("All matched files use Prettier code style"); contratos 171, metricas 1108, mock 258, pesquisa 33, spec-check 14, homolog 73, docs-contratos 102 (`docs:check` ok, 846 páginas, 69 métricas), server 1130 passaram e 170 puladas (as .pg), web 1256 |
| Bug | 052-SR-001 | fechado |

Os achados A2 e A3 (recomendados) seguem como recomendação, sem devolver a entrega.

Escopo: delta `2efa879..671e8d7` (F6 já tem pareceres próprios; HEAD da branch é `0f38ab6`, com só os pareceres de review e segurança depois do `671e8d7`). Ambiente: WSL2, Node/pnpm do repositório, PostgreSQL de teste do Compose (`metricas_test`), `PG_TESTE_URL` montada pelo `scripts/test-pg.sh`. Nenhum dado de pessoa em teste nem neste parecer (ADR 0020).

## Resultado da execução (uma suíte por vez)
| Etapa | Comando | Resultado |
|---|---|---|
| Pronto completo | `pnpm run pronto` | **rc 1**: trava, lint ok; `format:check` falha em 2 arquivos (052-SR-001) |
| Pronto, parte dos pacotes (o que vem depois do `format:check`) | `pnpm -r --if-present run pronto` | rc 0: contratos 171, metricas 1108, mock 258, pesquisa 33, spec-check 14, homolog 73, docs-contratos 102 (`docs:check` ok), server 1130 passaram e 169 puladas (as .pg), web 1256 |
| Servidor .pg | `pnpm run test:pg` | 26 arquivos, 169 testes, todos verdes (33 s); com o teste do QA abaixo, 27 arquivos e 170 testes verdes |

## Critério → teste → resultado
A especificação desta entrega é a decisão do dono de 2026-11-01 17:30 ("S1 a S12 e EI_SUST reais; se faltar campo, segue fictícia com selo e motivo") e o plano 056; os critérios abaixo vêm do brief da E2.120.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| S2, S3, S4, S8 e S10 reais, sem selo | `packages/contratos/src/origem.test.ts` (lista exata); `web/src/features/coleta/origem.test.tsx:80` | lista exata de reais (uma a mais ou a menos falha) | passa |
| S1, S5, S6, S7, S9, S11, S12 e EI_SUST fictícias com selo e motivo | os mesmos, motivo literal de cada uma | motivo por métrica; campo ausente nunca vira real (S9, S12) | passa |
| Roteamento: real lê só a base real do Acelerato; mock só a do seed; nada do BusinessMap | `server/tests/painel-real-f6.test.ts` (1 leitura de `dim_chamado` real, 0 do seed, 0 de `dim_card`) | uma base por métrica; BusinessMap e Acelerato não se misturam | passa |
| S8 no modo de duas bases usa o campo dos 90 dias da base real | `painel-real-f6.test.ts` (cobertura 3 de 3; "sem campo" nunca 0%) | cobertura total; campo ausente em todos | passa |
| Roteamento no PostgreSQL, com o papel `dspd_api` (A1 do review) | **novo, do QA:** `server/tests/qa-sust-real.pg.test.ts` | base real vazia; mock igual ao seed | passa (ver mutação) |
| Contagem do cabeçalho | `origem.test.tsx:106` (`contarFicticios` igual ao filtro dos cartões, abaixo do total, no mínimo 6) | mínimo de fictícios | passa, com ressalva A2 |
| Exportar: "Dados fictícios" por cartão | `web/src/features/exportar/gerar.ts:133` usa `origemDoCartao`, a mesma fonte do selo; suíte do web verde (`desenhista.test.ts`) | fonte única do selo | passa |
| Nenhuma métrica individual, nenhum dado de pessoa | leitura do delta e dos testes (chamados sem nome nem e-mail) | ADR 0020 | passa |
| `pnpm run pronto` | comando acima (rodada E2.120: rc 1; revalidação E2.128 em `1f821a0`: rc 0) | pronto da fábrica | passa (052-SR-001 fechado) |

## O A1 do review esconde defeito?
O A1 dizia que o (e) do `.pg` só conferia o status 200 da S3. Escrevi `server/tests/qa-sust-real.pg.test.ts`: semeia duas bases, esvazia `dim_chamado` da real e exige que S2, S3, S4, S8 e S10 mudem de corpo (leem a real) enquanto S1, S5, S6, S7, S9, S11, S12 e EI_SUST saem idênticas à base única do seed. Verde no HEAD. Vermelho antes do verde, por mutação (o arquivo é novo, então não há "base" para o `forge-testes`):
- Mutante 1, tirar `S4` de `METRICAS_ORIGEM_REAL`: o teste novo cai (`S4 deveria ter mudado ao esvaziar a base real`).
- Mutante 2, voltar o `extReal` do `servico.ts:282` para `extensoes === undefined` (sem `real ||`): o teste .pg não o pega, mas `painel-real-f6.test.ts` (S8 usa o campo dos 90 dias) cai. O mutante 2 fica provado pelo teste unitário, não pelo .pg.
Conclusão: o A1 não esconde defeito; a lacuna do .pg está coberta pelo teste novo.

## Achados
- A2 (recomendado) web/src/features/coleta/origem.test.tsx:106 · o teste da contagem recalcula `n` pela mesma `origemDoCartao` e só exige 6 ou mais; fixar o número esperado (cartões da sustentação menos os 5 reais) para quebrar se o mapa mudar
- A3 (recomendado) server/tests/painel-real-f6.pg.test.ts:115 · (e) segue só com 200 na S3 e título que promete mais; o `qa-sust-real.pg.test.ts` do QA cobre, mas vale ajustar o título ou fundir (A1 do review)

## Bugs
- 052-SR-001 (média, fechado na E2.127, revalidado na E2.128): `docs/qa/bugs/052-SR-001-prettier-quebra-o-pronto.md`.

## Arquivos do QA
`server/tests/qa-sust-real.pg.test.ts` (novo, teste do QA, .pg) e este parecer.
