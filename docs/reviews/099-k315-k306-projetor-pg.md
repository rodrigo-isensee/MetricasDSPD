---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k315-k306-projetor-pg
commit: 33edc8d5b2c99ce5a8c4086af501a6910bb26f0f
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Code review: K-315 (lint do server na CI) e K-306 (teste .pg de priority até dim_card.severidade) (E3.147)

Diff lido: `git diff origin/develop...9515517d` (base `d71599f9`), 3 arquivos, 30 adições e 3 remoções, 2 commits: `480df98c` (K-315) e `9515517d` (K-306). Tamanho dentro da orientação M14 (33 linhas). Nenhuma linha de guarda de código de produção mudou: o diff é um script do `package.json` e dois testes, então não há mutante a declarar.

## Ferramentas (citadas, não refeitas)
- CI do head `9515517d`, run 43457719601: `completed:success`. Jobs `rapida`, `banco`, `testes`, `build`, `seguranca`, `openapi`, `imagem` verdes; e2e e perf pulados pelo filtro de caminhos.
- No job `rapida`, o passo `pnpm run lint` executou `> @metricas-dspd/server@0.0.0 lint .../server` e passou: o lint do server entrou na CI.
- No job `banco` (`test:pg`), `tests/projetor-businessmap.pg.test.ts` rodou 19 testes, todos verdes, entre eles o C8a (K-306). No job `testes` o arquivo aparece pulado, como esperado: lá não há `PG_TESTE_URL`.
- Aqui, na worktree: `pnpm --filter @metricas-dspd/server run lint` limpo. A suíte inteira não rodou (fica no CI; o dono estava usando a máquina).

## K-315: efeito do script `lint` na CI
- `ci.yml:34` (job `rapida`) e `homolog.yml:75` (job `qualidade`) rodam `pnpm run lint`. Os dois passam a cobrir o `server/**`, que o `eslint.config.js` da raiz ignora. Agora a CI e o portão de homologação conferem o mesmo que o `pronto`. Nenhum workflow precisou mudar.
- O `pronto:interno` passa a lintar o server duas vezes: uma pelo `pnpm run lint` e outra pelo `pronto` do server. O custo é pequeno e foi declarado no brief. Fica assim (A2).
- As duas correções de lint trocam a desestruturação com variável não usada por `{ ...x }` seguida de `delete`. `AC_VALIDAS` é `Record<string, string>` e `Cartao` é `Record<string, unknown>`, então o `delete` é aceito pela tipagem estrita, e o comportamento dos testes continua o mesmo.

## K-306: teste C8a
- O teste segue o caminho real, do staging ao projetor e daí a `dim_card`. Sem linhas em `ref_dominio`, nenhuma severidade é projetada. Com o mapa 1 a 4 (Crítica a Baixa, o de-para do desenho C8a), `1` vira Crítica e `4` vira Baixa. `5` fica nulo e conta `priority_fora_do_mapa`; o valor ausente fica nulo. Isso cobre a Q-099-33 (A): fora do mapa nunca vira Baixa.
- O mapa é escrito à mão no teste, sem ser importado do código (B-1 da ADR 0020). O `finally` apaga as linhas de `prioridade_severidade`, então os outros testes do arquivo não herdam o mapa.
- Mutação: não reexecutada aqui, porque não há PostgreSQL local. Pela leitura, um projetor que ignore o mapa (`prioridades` vazio) ou que leia outro `campo` deixa `crit` nulo, e o `toBe('Crítica')` cai. As afirmações discriminam a mudança.
- Regras invioláveis: só BusinessMap, sem pessoa e sem cálculo novo.

## Revalidação (E3.160): junção com a develop e correção do lint, head `33edc8d5`
Delta lido: `forge-check parecer delta docs/reviews/099-k315-k306-projetor-pg.md`, intervalo `9515517d..33edc8d5`, sem o que veio da base; no domínio, só `server/tests/coleta-nomes-env.test.ts`.
- Junção `4ccfb74a` (develop `b2ce48ef`, com os PRs 375 K-305 e 376 K-311): `git show --remerge-diff 4ccfb74a` vazio, sem conflito resolvido à mão. Em relação à develop, a junção só soma o que a branch já tinha (o `package.json` do K-315, os dois testes e os pareceres).
- Correção `33edc8d5` (E3.157): o teste que veio do K-311 (`coleta-nomes-env.test.ts:92`) desestruturava com `_a` e `_b` não usados, e o lint do server, que o K-315 passou a rodar, os barrou no job `rapida`. A troca por `{ ...AC_VALIDAS }` tipado `NodeJS.ProcessEnv` seguido de dois `delete` repete o padrão que o próprio K-315 já usa na linha 34. O objeto e a expectativa são os mesmos, então o comportamento do teste não muda. O `delete` age sobre a cópia, e `AC_VALIDAS` fica intacto para os outros testes.
- Que o K-315 pegou um erro real vindo da develop é a prova de que o lint do server na CI funciona.
- Aqui, na worktree: `vitest run tests/coleta-nomes-env.test.ts` deu 16 de 16, e `eslint` no arquivo saiu limpo. Não há guarda de produção no delta, então não há mutante a declarar.
- CI do PR 378 no head `33edc8d5`: os runs 43470490358 (push) e 43470501934 (pull_request) terminaram em `completed:success`, e `gh pr checks 378` saiu com 0. Ficaram verdes `rapida` (com o lint do server), `banco`, `testes`, `build`, `seguranca`, `openapi`, `imagem` e as duas partes do `e2e-parte`. Só o `perf` foi pulado, pelo filtro de caminhos. Com isso, o parecer continua aprovado no head `33edc8d5`.

## Achados
- A1 (recomendado) scripts/lint-alterados.sh:1 · ignora `server/**` em silêncio, a mesma lacuna que o K-315 fecha na CI. Fora do escopo, como o brief declara; vira cartão.
- A2 (recomendado) package.json:21 · o `pronto:interno` passa o lint no server duas vezes (`pnpm run lint` e o `pronto` do server). Dá para tirar o `lint` do `pronto` do server ou aceitar a duplicação; não bloqueia.
