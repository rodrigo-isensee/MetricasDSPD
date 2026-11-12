---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l2d-mock-fora-do-build
commit: 4bbc8f94c05bfd2b63ed3ca5093d9b5181e1aeb6
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: L2d do 099, o mock fora do build `api` com as guardas G1 e G2 (K-275, E2.12)

## Achados
- A1 (recomendado) web/scripts/sem-mock.mjs:11 · `new URL('../dist/', import.meta.url).pathname` deixa `%20` e acentos codificados no caminho; trocar por `fileURLToPath(new URL('../dist/', import.meta.url))`, como o `vite.config.ts` já faz.
- A2 (recomendado) web/scripts/sem-mock.mjs:8 · a sentinela é copiada à mão de `web/src/data/mock/sentinela.ts:6` ("Mantida igual"); um teste que compare as duas evita a deriva. Hoje a deriva não abre buraco: o nome do chunk (`/mock/i`) ainda pega o mock.
- A3 (recomendado) docs/architecture/features/front-via-api.md:41 · registrar que, no build, `VITE_FONTE` vem só do ambiente do processo (`define` do `vite.config.ts`); `.env` com `VITE_FONTE=mock` deixa de valer no build e cai em `api`.
- A4 (recomendado) web/src/test/lint.meta.test.ts:315 · a G2 não vê `import()` com template literal (`` import(`@/data/mock/X`) ``); a G1 cobre o efeito no build, então fica como reforço.

## Sondas

## Parecer
Aprovado sobre 4bbc8f94 (base develop d4edc6d1). Diff: 22 arquivos, só `web/`, 330 linhas pelo `git diff --numstat --no-renames origin/develop...4bbc8f94` (cerca de 2/3 teste). Um comportamento só: o código do mock não entra no build `api`. O commit não traz a linha `teto:`; o PR do lote (E2.14) leva `teto: excedido, 330 linhas, G1 e G2 vêm com o corte do mock porque a ADR 0030 D6 as prende ao mesmo lote` no corpo.

- **Cumpre a ADR 0030 D6 no recorte do L2d:** `App.tsx:52` testa o literal `import.meta.env.VITE_FONTE === 'mock'` e só esse ramo faz `import('@/data/mock/MockFonteMetricas')`; o `define` do `vite.config.ts:10-12` fixa o valor no build, e o ramo morto sai do bundle. `data/index.ts` deixa de reexportar `MockFonteMetricas` (os testes passam a importar do caminho direto). G1 entra no `pronto` da web entre `build` e `size`; G2 em `lint.meta.test.ts`.
- **Carga assíncrona do mock:** `useFontePadrao` devolve a fonte `api` na hora e a do mock depois da `Promise`, com "Carregando…" em `role="status"`, guarda de desmontagem (`vivo`) e falha relançada no render para o limite de erro (nunca cai em `api` nem fica em silêncio). Os três casos têm teste em `composicao.test.tsx`. Valor inválido de `VITE_FONTE` segue falhando na partida.
- **Desvio 1, sentinela em `web/src/data/mock/` e não em `packages/mock`: aceito.** `@metricas-dspd/mock` só pode ser importado de `web/src/data/mock/` (regra de lint existente, `lint.meta.test.ts:171-215`), e a G1 pega o pacote pelo nome do chunk: no build mock da sonda abaixo, `nucleoMock-*.js` e `nucleoMock.worker-*.js` caem por nome e `MockFonteMetricas-*.js` por nome e sentinela. A sentinela fica como propriedade de instância (`readonly sentinela`), que o minificador não remove enquanto a classe estiver no bundle. O escopo do L2d é `web/`.
- **Desvio 2, G2 no teste e não no `eslint.config.js`: aceito.** A própria ADR 0030 D6 põe a G2 em `web/src/test/lint.meta.test.ts`; o `no-restricted-imports` não distingue `import()` do ramo mock do App de import estático sem override por arquivo. A varredura roda no Vitest do `pronto`, com 5 fixtures de recusa (alias, relativo, `import()` fora do App, estático no App, relativo de outra pasta), fixtures de aceite e a passada real sobre `web/src`.
- **Desvio 3, `VITE_FONTE=mock` só de `.env` deixa de valer no build: aceito.** Todo build mock declara a variável no processo: `e2e/playwright.config.ts:44` e `:54`, `docker/web/Dockerfile:8-9` (`ARG` para `ENV`) que o `docker-compose.homolog.yml:81` alimenta. O erro possível cai para o lado seguro (`api`), que é o princípio da ADR. Em `vite dev` e nos testes o `.env` segue lido. Falta só o registro na doc (A3). Não li nenhum `.env*`.
- **Regras invioláveis e segurança:** nenhum número inventado chega à tela de uso diário; sem pessoa, credencial, banco nem dependência nova. O parecer de segurança (`docs/security/099-l2d-mock-fora-do-build.md`) e o de QA (`docs/qa/099-l2d-mock-fora-do-build.md`) ficam com os papéis deles.
- **Execução (worktree MetricasDSPD-052g, head 308e864f = 4bbc8f94 mais os pareceres de segurança e QA, só `docs/`):** `VITEST_MAX_WORKERS=2 TZ=UTC pnpm exec vitest run` nos 22 arquivos de teste tocados ou afetados: 22 arquivos, 519 testes, 519 passaram (87 s). Build `api` (`env -u VITE_FONTE vite build --outDir <rascunho>/dist-api`) e `node scripts/sem-mock.mjs <rascunho>/dist-api`: "G1 ok", saída 0. Build com `VITE_FONTE=mock` e a mesma G1: "G1 FALHOU" com `MockFonteMetricas-DFaaxRiK.js` (nome e sentinela), `nucleoMock-XiMY9yZZ.js` e `nucleoMock.worker-C0RPsiK9.js`, ou seja, a G1 separa os dois builds.
- **CI:** run 43161199086 (push, head 8694356e = 4bbc8f94 mais o parecer de segurança) concluiu success; o run de 4bbc8f94 (43160539222) foi cancelado pelo push seguinte.
- **Pendência do merge, fora deste diff:** a ADR 0030 ("Por que o existente não basta") condiciona o merge do L2d à linha de Leituras com a G1 e a G3 vermelhas na `develop` antes do L2 (L5, E3.10, QA). O PR do lote (E2.14) confere essa linha antes do merge.
- **Commits:** um commit de código, `fix(web): ...`, Conventional Commits em português, corpo com o que muda e `Cartão: K-275`.
