---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l2d-mock-fora-do-build
commit: 4bbc8f94c05bfd2b63ed3ca5093d9b5181e1aeb6
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-12
---
# Review de segurança: L2d, o mock fora do build `api`, com as guardas G1 e G2 (E2.21)

Propósito: o L2d do 099 (ADR 0030, D6) no head `4bbc8f94`, base `d4edc6d1`. O diff toca só `web/`: `package.json` (passo `sem-mock` no `pronto`), `scripts/sem-mock.mjs` (G1, novo), `vite.config.ts` (`define` no build), `src/app/App.tsx` (mock por `import()` só no ramo `VITE_FONTE === 'mock'`), `src/data/index.ts` (deixa de reexportar o mock), `src/data/mock/sentinela.ts` (novo), `src/test/lint.meta.test.ts` (G2) e imports de testes. Nada rodou contra base real e nenhum `.env*` foi aberto (em `web/` só existe `.env.example`, que o Vite não carrega). Rodados: `vite build` sem `VITE_FONTE` e com `VITE_FONTE=mock`, cada um para uma pasta no scratchpad, e `node scripts/sem-mock.mjs` sobre as duas; `vitest run` de `src/test/lint.meta.test.ts` e `src/app/composicao.test.tsx` com `VITEST_MAX_WORKERS=2` (2 arquivos, 61 testes, todos passaram).

## Gatilhos
- `web/package.json`: o `pronto` da web ganha um passo (`web/package.json:21`). Sem dependência nova nem script de instalação.

## Resultado por ponto do brief

**1. O passo novo do `pronto` só lê o `dist`: conforme.** `web/scripts/sem-mock.mjs` importa só `node:fs` (`readdirSync`, `readFileSync`) e `node:path`; lê os nomes e o conteúdo dos arquivos de `<raiz>/assets` (`:12`, `:20`), escreve só no console e sai com 1 quando acha algo. Sem rede, sem processo filho, sem `eval`, sem leitura de variável de ambiente nem de segredo. O argumento opcional de pasta é do próprio desenvolvedor, local. Pasta ausente faz o `readdirSync` lançar e o passo falhar (falha fechada), e o `build` anterior esvazia o `dist`, então não há leitura de build velho.

**2. O `define` não põe variável sensível no bundle: conforme.** `web/vite.config.ts:11` define só a chave `import.meta.env.VITE_FONTE`, com `JSON.stringify(process.env.VITE_FONTE ?? 'api')`, e só no `build`. Não expõe `process.env` inteiro nem outra chave. No bundle `api` gerado aparecem só `VITE_FONTE` (valor `api`) e `VITE_API_BASE` (que já estava antes), no objeto `import.meta.env` que o Vite monta (`BASE_URL`, `DEV`, `MODE`, `PROD`, `SSR`, `VITE_FONTE`). Nenhum dos dois é segredo.

**3. O modo mock não vaza para o build `api`: conforme.** O build sem `VITE_FONTE` não tem nenhum chunk com "mock" no nome nem a sentinela, e a G1 passa ("G1 ok"). O build com `VITE_FONTE=mock` gera `MockFonteMetricas-*.js` (com a sentinela), `nucleoMock-*.js` e `nucleoMock.worker-*.js`, e a G1 os recusa (vermelho provado). Nenhum módulo de produção de `web/src` importa `data/mock` fora do `import()` em `App.tsx:36`; `src/test/helpers.tsx` e `src/features/painel/testes/fonteFixa.ts` importam, mas nenhum módulo de produção importa esses dois.

**4. Os três desvios do autor, pelo lado da segurança.**
- Sentinela em `web/src/data/mock/` e não em `packages/mock`: neutro. É onde mora o código que a ADR quer fora do bundle; a sentinela é texto fixo, sem dado.
- G2 no teste e não no `eslint.config.js`: neutro para segurança (a G1 no build é a guarda que decide). Os pontos cegos da G2 estão no A1, recomendado.
- `VITE_FONTE=mock` só de arquivo `.env` deixa de valer no build: favorável. Um `.env` esquecido com `mock` não liga mais o mock no build; o `define` fixa `api` (falha para o lado seguro). Os builds que querem o mock passam a variável pelo ambiente do processo: `e2e/playwright.config.ts:44` e `:54`, e o `docker/web/Dockerfile:8-9` (`ARG` virando `ENV`, usado pelo `docker-compose.homolog.yml:81`), e continuam funcionando.

**Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH. Não fazem falta aqui: o diff não traz dependência nova nem credencial, e o bundle foi lido direto.

## Achados
- A1 (recomendado) web/src/test/lint.meta.test.ts:312 · A G2 não vê o mock por new Worker(new URL(...)) nem por um módulo de produção que importe test/ ou testes/ (pastas isentas). Sem caminho de ataque: a G1 no build pega os dois casos; vale como dimensão nova da G2 se o review quiser.

## Plano em cartões
Nenhum bloqueante. O A1 é qualidade da guarda, para o react-frontend e o tech-lead decidirem no review; não segura a entrega.

## Riscos aceitos
Nenhum.
