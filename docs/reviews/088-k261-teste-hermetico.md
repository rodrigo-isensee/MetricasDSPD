---
tipo: review
contrato: 1
pedido: 088-forge-0455
branch: fix/k261-teste-hermetico
commit: 0c16aeb52601a49cf7404bb5bfb65a3cec37492b
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---

# Code review: K-261, teste da entrada `bm:ref-sync-apontamento` hermético (BUG-088-QA1)

**Veredito: aprovado.** O achado A1 do QA (`docs/qa/chore-forge-0455.md`, na branch do 088) foi resolvido no teste, sem tocar em produção.

Escopo: `129fc3d5..0c16aeb5`, um arquivo, `server/tests/ref-sync-apontamento-entrada.test.ts` (+26 −3, dentro do teto de 150 linhas). `server/src/entradas/ref-sync-apontamento.ts` não mudou.

## O que conferi
1. **Caso "sem configuração":** o teste continua exigindo `status` 1, `stderr` igual a `bm:ref-sync-apontamento falhou: configuração: PG_REF_URL\n` e `stdout` vazio. As asserções não foram afrouxadas; mudou só o modo de rodar o filho.
2. **Isolamento só no filho:** `sem-env.mjs` (`process.loadEnvFile = () => undefined`) é gravado na pasta do `mkdtempSync(tmpdir())` e entra só no `argv` do `spawn`, por `--import`, antes do `tsx`. O processo do vitest e o código de produção não mudam: a entrada segue lendo `<raiz>/.env` por `loadEnvFile` e tratando `ENOENT`, e no filho essa chamada vira no-op. O ambiente do filho continua sendo só `PATH` mais o `env` explícito, e o `cwd` é a pasta temporária. O `tsx` é resolvido pelo `import.meta.resolve` do teste, o que dá certo porque o `cwd` do filho fica fora do repositório.
3. **`.env` de mentira:** é gravado em `join(pastaTemp, '.env')`, ou seja, só na pasta temporária. Nenhum caminho do teste aponta para o `.env` da raiz. A sonda lê o arquivo falso pelo caminho explícito, e o `afterAll` remove a pasta inteira.
4. **Controle:** a mesma sonda, rodada sem o módulo de isolamento, imprime `postgres://x:y@127.0.0.1:1/db`. Com o módulo, imprime `undefined`. Isso prova que o arquivo falso seria lido e que só o módulo o neutraliza, então o teste não passa "no vazio".

## Ferramentas (citadas, não refeitas)
- Testes do arquivo tocado, nesta worktree, em 0c16aeb5: `npx vitest run tests/ref-sync-apontamento-entrada.test.ts` (em `server/`, `TZ=UTC`) passou **1 arquivo e 7 testes**.
- Lint, formatação, typecheck e a suíte completa ficam com o CI do PR (check `bateria`). O `pnpm run pronto` não rodou aqui, por ordem do brief.

## Achados
- A1 (recomendado) server/tests/ref-sync-apontamento-entrada.test.ts:66 · o `rmSync(falso)` só roda se as asserções passarem. Se uma delas falhar, o `.env` falso fica na pasta temporária até o `afterAll`. Hoje não há efeito, porque a entrada lê `<raiz>/.env`, não o `cwd`, e o `loadEnvFile` está neutralizado. Se quiser, troque por `try/finally` ou grave o arquivo numa subpasta própria. Não bloqueia.

## Entregar
- E1.8 (review do K-261): este parecer.
