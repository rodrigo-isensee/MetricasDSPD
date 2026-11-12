---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l2d-mock-fora-do-build
commit: ce420a8b5102a4718457667e35235d2e1762e535
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: pedido 099, L2d (mock fora do build api)

Links: ADR 0030 (D6), pedido `docs/pedidos/099-nenhuma-metrica-simulada.md`.

## Veredito
**Aprovado** sobre 4bbc8f94 (base d4edc6d1; o commit seguinte da branch, 8694356e, só adiciona o parecer de segurança). Nenhum bug aberto. Diff: 22 arquivos em `web/` (App.tsx com `import()` só no ramo mock, `define` no `vite.config.ts`, G1 em `scripts/sem-mock.mjs` no `pronto`, G2 em `lint.meta.test.ts`, sentinela, testes migrados do barrel para `data/mock/MockFonteMetricas`).

## Critério, teste, resultado
| Critério (E2.13, L2d) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Build `api` sem chunk do mock e com G1 ok | `vite build` (sem VITE_FONTE) em pasta temporária, `ls assets \| grep -ci mock` = 0, `node scripts/sem-mock.mjs <pasta>`: "G1 ok", rc 0 | build de produção sem código do mock | passa |
| G1 cai quando o mock volta ao bundle (controle) | `VITE_FONTE=mock vite build` + G1: rc 1, lista `MockFonteMetricas-*`, `nucleoMock-*`, `nucleoMock.worker-*` e a sentinela | build mock detectado por nome e por texto | passa |
| Mutação: ramo api religa o mock | `App.tsx`: `import.meta.env.VITE_FONTE === 'mock'` trocado por `true as boolean`; build + G1: rc 1 (3 chunks e a sentinela). Restaurado (`git status` limpo) | ramo condicional descartado só com a constante | morta |
| G2 cai com import estático | mutação: `import { MockFonteMetricas } from '@/data/mock/MockFonteMetricas'` estático no topo do App.tsx; `lint.meta.test.ts`: 1 falhou, 48 passaram ("nenhum módulo de produção ... importa data/mock fora do ramo do App"). Restaurado | import estático no App; import fora do App | morta |
| Modo `VITE_FONTE=mock` segue valendo nos testes | `TZ=UTC VITEST_MAX_WORKERS=2 vitest run src/app src/test/lint.meta.test.ts src/data`: 13 arquivos, 206 testes passaram; `tsc -b`: rc 0 | carga assíncrona do mock, valor inválido falha na partida | passa |
| Modo mock no E2E | `playwright test --project=chromium tests/b12-fluxo.spec.ts` (build `VITE_FONTE=mock` + preview): 39 passaram | app mock carrega após "Carregando…" e renderiza os painéis | passa |
| Suíte inteira e cobertura | check-run `bateria`/`testes` do CI no sha do PR (não rodado aqui) | limiar de cobertura da web | a conferir no CI do PR |

## Revalidação (volta 1, head ce420a8b)
Delta: merge da develop (21e70aa5) e `equipe.test.tsx` importando `MockFonteMetricas` direto de `@/data/mock/MockFonteMetricas` (mais ajustes de teste em `taticas.test.tsx` e `resumo.test.tsx` vindos da base). Vitest de `web/src/features/operacional/resumo/`: 4 arquivos, 87 testes passaram. Build `api` (sem VITE_FONTE) em `$TMPDIR`: 0 chunks com "mock" e `sem-mock`: "G1 ok", rc 0. Nenhum import de `MockFonteMetricas` pelo `@/data` em `web/` e `e2e/` (o índice só exporta hooks como `useModoMock`). Suíte inteira: check-run `bateria` do CI no sha do PR, não rodada aqui. Parecer segue aprovado.

## Desvios do autor (lidos pelo QA)
- Sentinela em `web/src/data/mock/` e G2 no teste: a G2 varre todos os módulos de produção de `web/src` e a mutação a derrubou; a G1 pega o mock por nome do chunk e por texto. Sem lacuna vista.
- `VITE_FONTE=mock` só em arquivo `.env` deixa de valer no build (o `define` lê `process.env`): não abri `.env*`; o E2E e o `pronto` passam a variável no processo, e a falha é segura (cai em `api`, e a G1 protege o build de produção). Decisão do review.

## Execução
Builds em pasta temporária (`$TMPDIR`), sem tocar `web/dist`. Nada contra base real nem `.env*`. Mutações restauradas; árvore limpa.

## Achados
