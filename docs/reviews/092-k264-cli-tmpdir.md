---
tipo: review
contrato: 1
pedido: 092-melhorias-tecnicas-fila
branch: fix/k264-cli-tmpdir
commit: 6d2e15be27630e6f75d21ddb7876f7b3ed18b074
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Code review: K-264, testes de CLI repassam a pasta temporária ao processo filho

**Veredito: aprovado.**

Escopo: `6e42dfb8..6d2e15be`, seis arquivos, todos em `server/tests/` (+19 −7, bem abaixo do teto de 150 linhas). Um ajudante novo, `server/tests/ajuda-cli-filho.ts`, e a troca do `env` literal pelo ajudante em cinco testes de entrada de CLI. Nenhum arquivo de produção mudou: `git diff --stat` não mostra nada fora de `server/tests/`.

## O que conferi
1. **Ambiente do filho:** `ambienteFilho(extra)` devolve `PATH` (ou string vazia), `TMPDIR` só quando está definida no processo do vitest, e por cima o `extra` de cada teste. Nada mais é herdado. Antes o filho recebia `{ PATH, ...env }`; agora recebe a mesma coisa mais a pasta temporária, que o `tsx` precisa para o cache dele. O `extra` vem por último, então um teste ainda pode sobrescrever qualquer uma das duas, como já podia sobrescrever o `PATH`.
2. **Isolamento do K-261:** o diff não toca no prelúdio `--import sem-env.mjs` nem no `cwd` temporário de `ref-sync-apontamento-entrada.test.ts`. Ali só a expressão do `env` mudou. As outras entradas testadas (`ac:ref-sync`, `bm:ref-sync`, `ref:sync-calendario`) não chamam `loadEnvFile` (grep em `server/src/entradas`). Os casos de `apontamento-entradas` recusam o argumento antes de ler a configuração. O `.env` real continua fora do alcance dos testes, e `TMPDIR` não é variável de configuração do sistema.
3. **Asserções:** nenhuma linha de `expect` aparece no diff. Os códigos de saída, as mensagens de uso e os `stdout` vazios exigidos continuam os mesmos nos cinco arquivos.
4. **Legibilidade:** o ajudante é pequeno e tem um propósito só. O comentário diz por que a pasta temporária entra e remete ao K-261.

## Ferramentas (citadas, não refeitas)
- Os cinco arquivos tocados, nesta worktree, em `6d2e15be`, com no máximo 2 workers (R-TETO): `npx vitest run --maxWorkers=2 <os cinco>`, rodado em `server/`, deu `Test Files 5 passed (5)` e `Tests 38 passed (38)`.
- O `pnpm run pronto` foi rodado pelo autor, verde dentro do sandbox, conforme o brief. Lint, formatação, typecheck e a suíte completa ficam com o CI do PR.

## Achados
- A1 (recomendado) server/tests/seed-recusa-real.pg.test.ts:108 · mesmo padrão fora do diff: filho via `pnpm exec tsx` com env só PATH e HOME, sem TMPDIR. Por ser `.pg`, não roda no sandbox hoje; se rodar, pode falhar igual. Sugestão: cartão para usar `ambienteFilho` ali também. Não bloqueia.

## Sondas

## Parecer
Aprovado. O K-264 corrige a falha dos testes de CLI no sandbox. A falha vinha do `tsx` sem pasta temporária gravável. A correção repassa só o mínimo ao filho, mantém o isolamento do K-261, não afrouxa nenhuma asserção e não toca em produção. O único achado, A1, é recomendado e fica fora do escopo deste item.
