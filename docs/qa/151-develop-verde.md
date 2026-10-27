---
tipo: qa
contrato: 1
pedido: 042-forge-0-30-3-e-retomada
branch: fix/151-develop-verde
commit: b6d8a9d586453cc4ec3a4ba496287afa2646bae6
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-27
---

# Parecer de QA: develop verde após o Dependabot (042, K-151, E3.6)

Escopo: correção de infraestrutura de teste (2389e62: remoção de `addListener`/`removeListener` do mock de `matchMedia` em `web/src/test/setup.ts` e `beforeAll` de aquecimento em `percepcao.test.tsx`), com review aprovado em b6d8a9d. Sem especificação nova nem `CA-n`; a obrigação é devolver o verde à develop sem afrouxar espera nem ligar retry.

## CI do push (run 40592056755)

Conclusão `success`. Por job: `rapida` ok (1m25s), `build` ok (54s), `testes` ok (4m56s), `filtro` ok, `banco` ok (56s), `openapi` ok, `imagem` ok, `seguranca` ok (gitleaks informativo, não bloqueia); `e2e` e `perf` skipped (não rodam em push de feature branch).

Tempo do `percepcao.test.tsx` no job `testes`, comparado ao run 40580307663 (falhou):

| Run | Arquivo | Resultado |
|---|---|---|
| 40580307663 (3bf1b5e) | 39960 ms | 1 falha (PV1 sem `metrica-PV1`) |
| 40592056755 (b6d8a9d) | 25735 ms | 38 de 38 passam |

O teste "a seção fica no fim do painel" passou em 1218 ms. O tempo isolado do `beforeAll` não é impresso pelo vitest (só o do arquivo e dos testes lentos); o arquivo inteiro, que o inclui, ficou 14 s abaixo dos 40 s da falha. Sobre o A1 do review: não há sinal de custo crescente; a observação fica para a medição de performance (ADR 0003).

## Local

- `pnpm run pronto` completo, uma suíte por vez (nenhum vitest/playwright em curso antes): rc=0 (lint, typecheck, unitários e `docs:check` ok: 739 páginas, 69 métricas, 2 eventos).
- E2E do caminho `/sustentacao` → `/operacional`, 1 worker, sem retry:
  `pnpm --filter @metricas-dspd/e2e exec playwright test tests/sustentacao-no-operacional.spec.ts tests/sustentacao-no-operacional-qa.spec.ts --retries=0 --workers=1`
  Resultado: 77 passaram, 0 falharam (4,5 min).

## Vermelho antes do verde

O teste da PV1 não é novo: o diff só muda a infraestrutura dele (aquecimento). O vermelho é o run 40580307663 (falha na CI com a base 3bf1b5e) contra o verde do run 40592056755. A causa por tempo e não por regressão do react-router 8 é sustentada pelas 77 E2E do mesmo caminho, que passam.

## Achados

- A1 (recomendado) web/src/features/percepcao/percepcao.test.tsx:498 · Aquecimento esconde a lentidão do primeiro render; arquivo caiu de 40 s para 25,7 s na CI. Acompanhar pela medição de performance (ADR 0003); não devolve.
