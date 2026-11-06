---
tipo: review
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-fronteira-eslint
commit: 5af33d345bbbc68a7b2d58874437ebc1a43bc48b
parecer: aprovado
revisor: tech-lead
data: 2026-11-05
---
# Code review: regra de fronteira do eslint cobre toda pasta de src fora de modulos (K-225, E4)

## Parecer
Aprovado, sem achado bloqueante. O glob `src/**/*.ts` com `ignores` de `src/modulos/**` e das exceções antigas mantém o que já valia e fecha a classe do A1 do parecer 069-zz5-l9c (pasta nova fora do glob, como `src/apoio` foi).

Lido: `git diff 8a789d43...5af33d34` (3 arquivos: `server/eslint.config.js`, `server/tests/fronteira-eslint.test.ts`, `docs/architecture/server.md`) e o achado de origem (A1 e a melhoria vista de `069-zz5-l9c`).

## O que conferi
- Exceções antigas iguais: `npx eslint --print-config` mostra o padrão `modulos/[^/]+/(?!index\.js$)` ausente em `src/plataforma/db/seed.ts` e `src/plataforma/db/extensoes-mock.ts` (isentos, como antes) e ausente em `src/modulos/x/a.ts` (que segue a própria regra por módulo); presente em `src/zznova/a.ts`, pasta que não existe e nenhuma lista citava. `MONTAM_A_API` segue com o bloco próprio, que só libera o módulo da aba.
- Cobertura: o teste lê as pastas reais de `src/` (hoje `apoio`, `entradas`, `plataforma`) e exige `no-restricted-imports` em `error` com o padrão de módulo; com o glob antigo, uma pasta nova devolveria a regra `undefined` e `r?.[0]` reprovaria. Não refiz a mutação com `src/zznova` (o brief veda tocar o código); a prova acima, por `--print-config`, é a mesma condição.
- Ferramenta: `npx vitest run tests/fronteira-eslint.test.ts tests/plataforma2.test.ts --maxWorkers=2`: `Test Files 2 passed (2)`, `Tests 40 passed (40)`. Suíte inteira fica com o QA (D-5).
- Documentação: `docs/architecture/server.md:190` descreve a regra nova e o teste; confere com o código.

## Teto M14
35 linhas de código e teste (`server/eslint.config.js` 2+2, `server/tests/fronteira-eslint.test.ts` 31+0); dentro do teto de 150. Um comportamento só.

## Achados
- A1 (recomendado) server/tests/fronteira-eslint.test.ts:13 · só confere o primeiro nível de `src/` (e o arquivo na raiz); pasta aninhada nova em `src/` já é coberta pelo glob, mas o teste não a exercita. Aceitável hoje, sem devolução.
