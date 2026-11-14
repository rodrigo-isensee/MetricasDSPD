---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k318-lint-raiz-metricas
commit: 762bc4acdf8e215d890bf1bda34e6f490f32bc8c
parecer: aprovado
revisor: tech-lead
data: 2026-11-13
---

# Code review: K-318, o lint do server barra a raiz de @metricas-dspd/metricas fora de modulos/metricas (E3.169)

## O que foi conferido
- Diff `e5092e05..762bc4ac`: cinco arquivos, 29 linhas adicionadas e 4 removidas. Dentro do teto de 150 linhas; um comportamento só.
- Blocos do flat config (`server/eslint.config.js`): o `no-restricted-imports` não soma entre blocos (o último que casa substitui o anterior), então a regra precisa estar em cada bloco que casa com um arquivo de `src/`. Está nos quatro: o bloco por módulo (`paths` só quando `m !== 'metricas'`, linha 36), o `src/**` fora de módulos (linha 52), o `MONTAM_A_API` (linha 54) e o bloco novo de seed e mocks (linha 56), que antes não tinha `no-restricted-imports` nenhum. Nenhum bloco posterior redefine a regra. Os conjuntos não se sobrepõem: `src/**` ignora `src/modulos/**`, os cinco arquivos de seed e mock e o `MONTAM_A_API`.
- `paths` com `name` exato: barra só `@metricas-dspd/metricas`; `/core`, `/businessmap` e `/acelerato` seguem livres, como a tabela da ADR 0013 §9 manda.
- `import type` barrado: a ADR 0013 §9 proíbe "importar a raiz" sem exceção para tipo, e o `no-restricted-imports` sem `allowTypeImports` recusa os dois. Decisão correta.
- Reexport de `ExtensoesMetricas` em `modulos/metricas/index.ts:2`: é `export type`, apagado na compilação; o `index.ts` já é a face pública do módulo e o `app.ts` já o importava. O `extensoes-mock.ts` passa a importar `../../modulos/metricas/index.js` só por tipo, sem acoplamento em tempo de execução; o padrão `modulos/[^/]+/(?!index\.js$)` libera o index. Não abre fronteira nova.
- Nenhum import da raiz sobra em `server/src` fora de `modulos/metricas` (`grep "from '@metricas-dspd/metricas'"`, vazio).
- Teste (`server/tests/fronteira-eslint.test.ts`): um representante por bloco (`app.ts`, `plataforma/zz.ts`, `extensoes-mock.ts`, `operacao`, `businessmap`), valor e tipo em cada um, mais as duas liberações (`/core` fora do módulo, raiz dentro de `modulos/metricas`). Usa `lintText` com o config real; não lê o texto da fonte. `vitest run tests/fronteira-eslint.test.ts` → 12 passed.
- Mutação manual (restaurada com `git show HEAD:`; árvore limpa ao fim):
  - sem `paths` no bloco de seed e mocks: morto (1 falha).
  - sem `paths` no `MONTAM_A_API`: morto (1 falha).
  - sem `paths` no `src/**`: morto (1 falha).
  - condição do módulo trocada por `true` (barra também `metricas`): morto (1 falha).
  - condição do módulo trocada por `false`: morto (2 falhas).
- Commit `762bc4ac`: Conventional Commits em português, escopo `server`, com o cartão no título.
- CI do head: run 43530278423 (`CI`), situação no momento do parecer registrada no relatório ao Jarvis; o merge depende dele verde.

## Achados
- A1 (recomendado) server/eslint.config.js:56 · a lista dos cinco arquivos de seed e mock agora se repete no `ignores` da linha 51 e no `files` do bloco novo; uma constante (`SEED_E_MOCKS`) evita que um arquivo novo entre numa lista e não na outra.

## Veredito
Aprovado no head `762bc4ac`. A regra está em todos os blocos que casam com `src/`, o teste prova a recusa (valor e tipo) e as duas liberações, e cada bloco tem mutante morto. O A1 é só manutenção.
