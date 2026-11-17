---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: ci/105-timeout-testes
commit: 18f168415b1c98a22b4ee28f031240d27ee9c704
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: aumento do tempo limite do CI (E7.534)

## Escopo lido
Diff `808a163c..504266a0`: `.github/workflows/ci.yml` (2 linhas) e `changelog.d/ci-105-timeout-testes.md` (novo).

- Confere com a decisão do dono 1 = A: `timeout-minutes` do job `testes` de 15 para 25 e do `e2e-parte` de 30 para 45. Nada mais muda no workflow: nenhum passo, filtro, `if` ou matriz alterado, nenhum teste pulado.
- Sem guarda nova ou mudada (só valores numéricos de limite); não há mutante a declarar.
- Changelog no formato `### Alterado`, cita o pedido e a etapa de implementação (E7.533).
- Tamanho: 2 linhas de código, dentro do teto M14.
- Risco: falha lenta de verdade passa a demorar até 10/15 min a mais para estourar; aceitável e decidido pelo dono. Critério de reversão implícito: se o tempo real dos jobs cair, voltar aos limites antigos.
- Ferramentas e CI: sem PR para a branch, a suíte fica para o CI do PR; não afirmo CI verde neste head e o brief não traz PQ do autor. O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.
- Pipeline: o parecer de pipeline é do `devops-engineer`; não o refaço.

## Revalidação (18f16841, E7.543)
Delta lido: `forge-check parecer delta docs/reviews/105-ci-timeout-testes.md` (504266a0..18f16841): `ci.yml`, `homolog.yml`, `changelog.d/ci-105-timeout-testes.md`, `web/src/test/setup.ts`, `web/vite.config.ts`.

- Lentidão local segue visível: o `test.env` do `vite.config.ts` usa `process.env.METRICAS_DSPD_ESPERA_ASYNC_MS ?? '5000'`; sem a variável, a espera fica em 5 s na estação, como antes.
- Variável só no CI: `git grep` no 18f16841 acha a definição apenas no passo `pnpm run cobertura` de `ci.yml:56` e `homolog.yml:81`.
- Cobertura de ramos: `setup.ts` não ganha ramo (uma chamada `Number(...)`); o `??` está em `vite.config.ts`, fora do `include` da cobertura (`src/**`). Limiares de 100% intocados.
- Nada pulado, sem retry nem `continue-on-error`; motivo no changelog e nos comentários. Pipeline: parecer do `devops-engineer`, não refeito.
- CI do #546 na leitura: build, filtro, imagem, openapi e seguranca verdes; rapida, banco e e2e-parte pendentes. Não afirmo CI verde; o merge depende dele.

## Achados
- A1 (recomendado) web/src/test/setup.ts:24 · `Number(...)` vira `NaN` se a variável vier vazia ou não numérica (o `??` de `vite.config.ts:76` não cobre string vazia) e as buscas esgotam na hora com erro enganoso; sugestão: validar (`Number.isFinite` e > 0) e falhar com mensagem clara. Sem gatilho na configuração atual, não bloqueia.
