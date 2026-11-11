---
tipo: review
contrato: 1
pedido: 096-criterios-apontamento-env
branch: fix/k270-criterios-env
commit: 3316cce9582e2c8aeda9180c60fc453aa123f4b0
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: critérios do apontamento com o .env da raiz e script bm:criterios-apontamento (096, E1.2, K-270)

## Achados
- A1 (recomendado) server/src/entradas/criterios-apontamento.ts:11 · o bloco do carregador (raiz + loadEnvFile + ENOENT) é idêntico ao das outras 7 entradas; agora são 8 cópias. Extrair um carregarEnvDaRaiz() comum em cartão próprio, não neste PR.
- A2 (recomendado) server/src/entradas/criterios-apontamento.ts:22 · a mensagem de uso ainda diz `criterios-apontamento.ts [AAAA-MM-DD]`; a do ref-sync-apontamento já usa o nome do script (`bm:ref-sync-apontamento`). Trocar por `bm:criterios-apontamento [AAAA-MM-DD]` numa próxima mudança do arquivo.
- A3 (recomendado) server/tests/criterios-apontamento-entrada.test.ts:56 · o caso "sem .env" troca loadEnvFile por no-op, então não passa pelo ramo ENOENT real, e o ramo de falha não-ENOENT (exit 2) não tem caso; mesma lacuna das outras entradas, cobrir junto com o A1.

## Sondas

## Parecer
Aprovado. Diff lido: `eac38a64..3316cce9` (4 arquivos, +95 −1: CHANGELOG, server/package.json, a entrada e um teste novo).

- **Mesmo carregador dos `bm:*`:** o bloco novo é igual, caractere por caractere, ao de `ref-sync-apontamento.ts:16-24` e ao das outras 6 entradas que leem o `.env` (coleta, projetor, apontamento, eliminar-pessoa, limpar-seed, spike). Não há cópia divergente: mesma raiz (`../../../`), ENOENT tolerado e qualquer outro erro sai com código 2, sem imprimir o conteúdo. A duplicação já existia (A1).
- **Mudança mínima:** o código só ganha o bloco do carregador e o comentário de uso; a regra (`registrarCriteriosApontamento`, data, idempotência) não muda. O script `bm:criterios-apontamento` segue a convenção dos vizinhos (`bm:ref-sync-apontamento`, `tsx src/entradas/<arquivo>.ts`).
- **Teste hermético e legível:** o filho roda com `ambienteFilho()` (só PATH e TMPDIR), `cwd` em pasta temporária e um `--import` que troca `process.loadEnvFile`. Nenhum `.env` da máquina é lido e o "banco" é um socket local que recusa a conexão. O caso 3 prova o comportamento: lê o caminho `<raiz>/.env`, usa o `PG_MIGRADOR_URL` dele (houve conexão) e não imprime o segredo. O caso 1 confere o texto da fonte: vale como trava de igualdade com o `ref-sync-apontamento`, não como teste de guarda.
- **Guardas:** o `if (code !== 'ENOENT') … process.exit(2)` é guarda nova neste arquivo, mas cópia de um padrão já em uso. O ramo de falha não tem caso aqui (A3, recomendado, não devolve).
- **Verificação local:** `vitest run --project unit --maxWorkers=2 tests/criterios-apontamento-entrada.test.ts`: 1 arquivo, 3 testes passando. A suíte completa fica com o CI do PR.
- **E2, roteiro do CHANGELOG (linha 56):** os dois pontos que citavam `criterios-apontamento <data>` passam a citar `pnpm --filter @metricas-dspd/server run bm:criterios-apontamento <data>`. O nome do pacote confere com `server/package.json` (`@metricas-dspd/server`), e a ordem de implantação (ref:sync, critérios, coleta, no mesmo dia) ficou como estava.
- **Pareceres da branch:** QA aprovado em 508823c3 e segurança em 1545a83e; não os refaço.
- Commit: um só, Conventional Commits em português, escopo `apontamento`.
