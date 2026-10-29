---
tipo: review
contrato: 1
pedido: 042-forge-0-30-3-e-retomada
branch: fix/151-develop-verde
commit: 0ece31d55f7721a5355da3cb1efdc144c3ed0af4
parecer: aprovado
revisor: tech-lead
data: 2026-10-27
---

# Code review: develop verde após o Dependabot (042, K-151, E3.5)

**Revalidação (2026-10-28, head 0ece31d):** a mudança posterior na branch `forge/upgrade-0.30.3` é só o arquivo de versão do Forge e pareceres do 042, coberta por `docs/reviews/042-forge-0-30-3.md` e `docs/qa/042-forge-0-30-3.md`; veredito, branch e achados iguais. O corpo abaixo vale para o intervalo `3bf1b5e..2389e62`.

**Veredito: aprovado.** O intervalo `3bf1b5e..2389e62` (1 commit, 2 arquivos, +11/-4) trata as duas falhas da CI da develop na run 40580307663: o lint `no-deprecated` no mock de `matchMedia` e a espera estourada no teste da PV1. Não amplia o escopo.

## Leitura

- **`web/src/test/setup.ts:39-49`, mock de `matchMedia`.** O mock perdeu `addListener` e `removeListener`, e o cast passou de `as MediaQueryList` para `as unknown as MediaQueryList`. Conferi se o cast esconde algum método que o código usa:
  - O código do app (`web/src/app/tema.tsx:43-48`) usa só `matches`, `addEventListener` e `removeEventListener`, e os três continuam no mock.
  - Nas dependências, só o react-router 8.5.0 chama `matchMedia` (`dist/.../dom/ssr/links.js:55`), e só lê `.matches`.
  - Nenhum arquivo de `web/src` chama `addListener` nem `removeListener`.
  - `shell.test.tsx` faz o próprio stub com `vi.stubGlobal` e não depende deste mock.

  Conclusão: o cast não esconde método usado. Ele segue o padrão do `ResizeObserverFalso` duas linhas acima, que já tem o comentário de motivo (linha 30).
- **`web/src/features/percepcao/percepcao.test.tsx:498-505`, `beforeAll` de aquecimento.** O hook renderiza `/sustentacao`, espera `metrica-PV1` por `findByTestId` e desmonta. Ele não mascara defeito do react-router 8:
  1. O próprio hook falha se o redirecionamento `/sustentacao` → `/operacional?cadencia=sustentacao` (`RedirecionaSustentacao.tsx:41`) ou o cartão quebrarem. O `findByTestId` lança depois de 5 s (`asyncUtilTimeout: 5000`, `setup.ts:23`), e isso derruba o `describe` inteiro.
  2. Cada teste do bloco continua chamando `renderizarApp('/sustentacao', fonte)`, então o caminho segue coberto em todos eles.
  3. Ficam fora do relógio do primeiro teste apenas o custo único do chunk lazy da página (cache de módulo) e o primeiro render. A medição do autor (histórico do pedido, 19:00) atribui a falha ao tempo e não ao router.

  O `r.unmount()` explícito evita que esse render vaze para o primeiro teste, porque o `cleanup` do `afterEach` não alcança o `beforeAll`.
- **Sem afrouxar a espera.** O diff não aumenta nenhum timeout e não liga retry. `testTimeout` e `hookTimeout` continuam em 90000 (`web/vite.config.ts:59-60`), e `asyncUtilTimeout` continua em 5000, os três sem mudança no intervalo.
- **Checklist (praticas.md, seção 8).** Itens 2, 3, 6 e 9 não se aplicam: não há métrica, campo de pessoa nem interface tocados. Item 10: a mudança é só de infraestrutura de teste e não altera comportamento documentado, então não há doc a atualizar. Commit único, em Conventional Commits, com `Cartão: K-151` e as linhas de atribuição.

## Regras de ferramenta

- Lint, typecheck e testes cabem ao `pnpm run pronto`. O autor o declara com rc=0 (histórico, 19:00), e a conferência da entrega (19:01) deu "cumpriu". Não refiz aqui, porque o brief proíbe rodar suítes. O verde da CI fica com o QA no E3.6.
- Teto M14: 15 linhas de código e teste (11 + 4, `git diff --numstat --no-renames 3bf1b5e..2389e62`), dentro de 400.
- Segurança e devops: o intervalo não toca pipeline, container, coleta nem dado de pessoa. Não há parecer a citar.

## Achados

- A1 (recomendado) web/src/features/percepcao/percepcao.test.tsx:498 · O aquecimento esconde, nesse teste, a lentidão do primeiro render do painel. Se o custo crescer, só a medição de performance (ADR 0003) acusa. Vale o QA conferir no E3.6 o tempo do hook na CI.
