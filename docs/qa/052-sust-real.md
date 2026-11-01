---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-sust-real
commit: 671e8d718c5f2a0f161af60fe4ce05eaaecb9426
parecer: reprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
aceite_usuario: sim
data: 2026-11-01
---
# QA: 052-sust-real (sustentação com dado real do Acelerato, E2.115 e E2.117, K-182)

**Parecer (E2.120): reprovado, por um defeito só de formatação** (052-SR-001): `pnpm run pronto` sai com rc 1 em `format:check` (`packages/contratos/src/origem.ts` e `origem.test.ts`). O comportamento está certo: as suítes do server, do web, dos pacotes e a .pg passam, e S2, S3, S4, S8 e S10 saem reais, as demais da sustentação saem fictícias com motivo. Corrigido o Prettier e rodado o pronto de novo, aprovo sem outra rodada.

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
| `pnpm run pronto` | comando acima | pronto da fábrica | **falha** (052-SR-001) |

## O A1 do review esconde defeito?
O A1 dizia que o (e) do `.pg` só conferia o status 200 da S3. Escrevi `server/tests/qa-sust-real.pg.test.ts`: semeia duas bases, esvazia `dim_chamado` da real e exige que S2, S3, S4, S8 e S10 mudem de corpo (leem a real) enquanto S1, S5, S6, S7, S9, S11, S12 e EI_SUST saem idênticas à base única do seed. Verde no HEAD. Vermelho antes do verde, por mutação (o arquivo é novo, então não há "base" para o `forge-testes`):
- Mutante 1, tirar `S4` de `METRICAS_ORIGEM_REAL`: o teste novo cai (`S4 deveria ter mudado ao esvaziar a base real`).
- Mutante 2, voltar o `extReal` do `servico.ts:282` para `extensoes === undefined` (sem `real ||`): o teste .pg não o pega, mas `painel-real-f6.test.ts` (S8 usa o campo dos 90 dias) cai. O mutante 2 fica provado pelo teste unitário, não pelo .pg.
Conclusão: o A1 não esconde defeito; a lacuna do .pg está coberta pelo teste novo.

## Achados
- A1 (bloqueante) packages/contratos/src/origem.ts:35 · `pnpm run pronto` falha em `format:check` (origem.ts e origem.test.ts); rodar prettier --write nos dois, commitar e refazer o pronto (052-SR-001)
- A2 (recomendado) web/src/features/coleta/origem.test.tsx:106 · o teste da contagem recalcula `n` pela mesma `origemDoCartao` e só exige 6 ou mais; fixar o número esperado (cartões da sustentação menos os 5 reais) para quebrar se o mapa mudar
- A3 (recomendado) server/tests/painel-real-f6.pg.test.ts:115 · (e) segue só com 200 na S3 e título que promete mais; o `qa-sust-real.pg.test.ts` do QA cobre, mas vale ajustar o título ou fundir (A1 do review)

## Bugs
- 052-SR-001 (média, aberto): `docs/qa/bugs/052-SR-001-prettier-quebra-o-pronto.md`.

## Arquivos do QA
`server/tests/qa-sust-real.pg.test.ts` (novo, teste do QA, .pg) e este parecer.
