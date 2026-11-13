---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k315-k306-projetor-pg
commit: 9515517db685f2ced9dc0d438c37bf250c3424d1
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-13
---
# QA: K-315 (lint do server no pronto) e K-306 (teste .pg do projetor), pedido 099

Base d71599f9, código 9515517d, head ed6b3b0c (review e segurança aprovados). Classe N, sem UX nem contrato de API. Obrigações: o cartão K-315 (pronto da raiz deve pegar erro de lint do server) e o K-306 (priority do staging vira severidade em dim_card pelo mapa `prioridade_severidade`). Diff: `package.json` (comando lint), dois testes do server sem `_var` não usada, um teste `.pg` novo.

## Achados
- A1 (recomendado) packages/metricas/src/coletor/classificarApontamento.test.ts:795 · teste de orçamento de tempo (5 s) falhou 2 de 2 dentro de `pnpm run pronto` (5417 ms) e passa isolado e em série (cobertura incluída). Não é do diff; pacotes em paralelo na máquina compartilhada o estouram. Cartão baixo.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-315: lint da raiz inclui o server | erro plantado em `server/src/plantado-qa.ts` (variável não usada) | arquivo do server, antes ignorado pelo eslint da raiz | `pnpm run lint` rc 1 com `no-unused-vars` em server/src/plantado-qa.ts; sem o arquivo, rc 0 |
| K-315: os dois erros de lint corrigidos sem mudar comportamento | coleta-nomes-env.test.ts (7) e projetor-businessmap.pg.test.ts (F4) | `delete` equivale ao rest que descartava a chave | lint do server limpo; teste de nomes passa |
| K-306: priority 1 e 4 viram Crítica e Baixa com mapa vigente | projetor-businessmap.pg.test.ts (C8a) | mapa presente | passou no CI |
| K-306: fora do mapa (5), nulo e sem mapa ficam sem severidade; nota `priority_fora_do_mapa` | idem | fora do mapa, nulo, sem mapa | passou no CI |
| K-306: o teste limpa o ref_dominio (`finally`) | idem | ordem entre testes | passou no CI |

## Execução
- Carga: `memory.pressure` do jarvis.slice abaixo de 30 o tempo todo (avg10 máx. 0,00; avg60 máx. 3,23).
- `pnpm run pronto` da raiz, 2 vezes: test:trava, `pnpm run lint` (eslint da raiz e do server) e format:check verdes; `pnpm -r run pronto` falha só em packages/metricas pelo A1 (1311 de 1312), nas duas.
- Para fechar o resto do pronto sem a carga paralela: `pnpm -r --if-present --workspace-concurrency=1 run pronto` rc 0. Resumo: contratos 218, homolog 78, spec-check 14, pesquisa 33, metricas 1312/1312 com cobertura, server 2096 passaram e 291 puladas (43 arquivos `.pg`, sem PostgreSQL local), web 1554, e2e 102.
- Os testes `.pg` (K-306) só rodam na CI: run 43459903944 do head ed6b3b0c, `success` (check `bateria` do mesmo sha). Citado, não rerrodado (I5).
- Vermelho antes do verde: K-306 cobre comportamento já existente do projetor (teste sem código novo), então não há vermelho a provar. A prova de K-315 é o lint plantado acima: falha com o comando novo e não falharia com o `eslint .` antigo (o eslint da raiz ignora server/**). Planta removida, `git status` limpo, lint volta a rc 0.
- Mutação: o diff de código é uma linha de package.json. O mutante "tirar `&& pnpm --filter ... server run lint`" morre pelo plantio (rc 0 em vez de 1). Mutação do projetor não se aplica: não há código de produção no diff.
- Diff conferido contra as obrigações: nada fora do escopo. A1 e A2 do review (lint-alterados.sh pula server/**; lint do server duas vezes no pronto) seguem como cartões recomendados do review.

## Bugs
- Baixo: A1 acima (teste de orçamento de tempo instável sob carga). Vira cartão no quadro, sem aceite do usuário (`R-QA`).
