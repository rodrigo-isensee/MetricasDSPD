# 024-001 - e8.test.ts (G3) reprova o format:check da CI
- Severidade: média (bloqueia o job `rapida` da CI e o portão; sem efeito em runtime)
- Responsável sugerido: qa-engineer (autor do teste); o brief atual proíbe tocar em testes, então precisa de novo brief
- Ambiente: branch feature/024-e7-sem-reais, commit 4fb04ad (arquivo vindo de 8a4a5a7)

## Passos para reproduzir
1. Na worktree, rodar `pnpm exec prettier --check packages/metricas/src/businessmap/e8.test.ts`.

## Resultado esperado
Arquivo formatado, `format:check` com rc=0.

## Resultado obtido
Aviso de estilo em `e8.test.ts`, linha 119: a chamada `extDe([linha('A', 1), ... linha('E', 1, 25)])` está numa linha só e o Prettier a quebra em um item por linha. Job `rapida` da CI vermelho (`pnpm run format:check`, rc=1).

## Evidência
Run 39037889777 (head 4fb04ad): rapida=failure; testes, banco, build, openapi, seguranca, imagem e filtro=success; e2e e perf=skipped (dependem da `rapida`). Não é ruído: determinístico, o Prettier local reproduz.

## Situação
- Corrigido (E1.9, K-114): `e8.test.ts` formatado com `pnpm exec prettier --write`. Diff só de quebra de linha da chamada `extDe([...])` na linha 119; asserções e dados inalterados (`git diff -w` vazio).
- Commit da correção: o que contém este registro, `git log -1 --format=%H -- docs/qa/bugs/024-001-e8-test-fora-do-prettier.md` (o sha não pode constar dentro do próprio commit).
- Verificação: `pnpm run format:check` rc=0; `pnpm run lint` rc=0; `pnpm --filter @metricas-dspd/metricas test` 37 arquivos, 1082 testes passando.
