---
tipo: qa
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: feature/048-ajustes-front
commit: 7e54ff115c3fcea8d4ce94d1e1005df78f5251b4
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-30
---

# QA: ajustes do front do pedido 048 (K-128, K-126, K-133, K-127)

Entrega testada: `feature/048-ajustes-front`, intervalo de código `7c94348..832541d`, review aprovado em `7e54ff1`. Sem gatilho de segurança (R-SEGURANCA): só `web/` e documentos. Plano técnico: ADR 0021 (§8) e linhas F2 e F9 da ADR 0003.

**Parecer: aprovado.** `pnpm run pronto` completo com rc=0 no head, as 8 medidas de CLS abaixo de 0,1, E2E com 250 de 250 e os testes novos vistos vermelhos na base. Nenhum código de produção foi mexido; o QA só somou `e2e/perf/cls-tatico-equipes.spec.ts`.

## Tabela critério, teste, resultado

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-128: `COM_TAMBEM` do mock com T11, T13 e T14, igual ao servidor | `nucleoMock.paridade.test.ts` ("inclui T11, T13 e T14..." e "T13 e T14 chegam ao front com a extensão") | lista com T11, T13 e T14; DTO não vazio | passou |
| K-126: `postMessage` que lança vira `{ id, ok: false, erro }`, pedido não fica pendente | `MockFonteMetricas.transporte.test.ts` (dois casos: `Error` e valor que não é `Error`) | exceção de clonagem; valor sem `message` | passou |
| K-126: núcleo não iniciado vira erro explícito | `MockFonteMetricas.transporte.test.ts` ("vira erro explícito, não TypeError genérico") | pedido antes do `iniciar` | passou |
| K-126: transporte em Chromium real (Worker de módulo, mesma origem; fallback sem `Worker`, mesmo conteúdo) | `e2e/tests/mock-transporte-worker.spec.ts` | `blob:` e `data:` recusados; fallback idêntico | passou |
| K-133: CLS de `/tatico` abaixo de 0,1 (F2) em cada equipe do mock, inclusive a da faixa em duas linhas (A1 do review) | `e2e/perf/cls-tatico-equipes.spec.ts` (latência simulada ligada, 5 cargas por caso) | pior carga por equipe; equipe de duas linhas | passou |
| K-133: reserva 88 px com equipe e 130 px sem | `reservaFaixa.test.ts` | com e sem equipe | passou |
| K-127: F9 pelo maior caminho (72,39 KB) e soma informativa | `f9-size.test.ts` e as quatro linhas do `size.mjs` no `pronto` | raiz no inicial falha; limite de 120 KB | passou |
| Regressão de `/tatico` e das telas | `a11y`, `responsivo`, `espera-invisivel-nos-paineis`, `shell`, `complementares`, `intensivo-filtros` | axe WCAG 2.2 AA; console limpo | passou |

## CLS de `/tatico` por equipe (K-133, achado A1 do review)

Build de produção, Chromium desktop 1366x768, latência simulada ligada, 5 cargas por equipe, valor da pior carga (limite F2: 0,1):

| Equipe | CLS máximo |
|---|---|
| sem equipe | 0,003 |
| erp-protheus | 0,006 |
| fluig | 0,003 |
| senior | 0,003 |
| marketing-vendas (faixa em duas linhas) | 0,060 |
| dados | 0,003 |
| plataforma-5g | 0,014 |

São 6 equipes de fluxo no mock (`SLUGS.equipesFluxo`), não 5; todas medidas. A pior é a de duas linhas, com 0,060 (as cargas ficaram entre 0,039 e 0,060), abaixo de 0,1. O A1 do review fica fechado sem volta ao autor.

## F9 (K-127), conferência da ADR 0021 §8

Saída do `pronto`:
- `F6 inicial: 192.31 KB (< 200) ok`.
- `F9 caminho worker: nucleoMock.worker-QBrqPoLa.js = 72.39 KB`.
- `F9 caminho processo: nucleoMock, tambem, metas = 47.49 KB`.
- `F9 mock + biblioteca (maior caminho: worker): 72.39 KB (< 120) ok`.
- `F9 informativo: soma de todos os chunks mock: 118.22 KB`.

O maior caminho é o do Worker (72,39 KB), como o planejado. A soma informativa subiu 0,87 KB sobre os 117,35 KB da medida antiga: coerente com o código novo (invólucro, `tambem` e `COM_TAMBEM`), e só informativa.

## Vermelho antes do verde

Os testes novos foram copiados para uma worktree descartável na base `7c94348` (sem o código novo), com `pnpm exec vitest run` nos quatro arquivos. Resultado: 7 testes falharam e 2 arquivos não carregaram (`reservaFaixa.test.ts` e `f9-size.test.ts`, módulos que a base não tem):
- `postMessage que lança (Error)` e `(valor que não é Error)`: pedido pendente, `DataCloneError` sem tratamento.
- `vira erro explícito, não TypeError genérico`.
- `inclui T11, T13 e T14 ...` e `T13 e T14 chegam ao front com a extensão`.
- Dois casos de `toda MetricaId: o núcleo clonado é idêntico à biblioteca direta`, que na base falham porque o DTO calculado não traz `tambem`.

No head, os mesmos arquivos passam (web: 82 arquivos e 1241 testes). O teste de CLS é novo e não tem base para vermelho: ele mede a entrega, e o CLS de antes (0,073 a 0,100) está no comentário do `reservaFaixa.ts` e no review.

## Execução

- `pnpm run pronto` na raiz, head `7e54ff1`, rc=0: web 1241, metricas 1092, mock 258, server 591 (84 pulados pelo próprio projeto, sem mudança nesta entrega), contratos 161, docs-contratos 102, `docs:check` ok.
- E2E (`E2E_PORTA=4181`, `E2E_SEM_ALT=1`, projeto `chromium`): `mock-transporte-worker`, `a11y`, `responsivo`, `espera-invisivel-nos-paineis`, `shell`, `complementares` e `intensivo-filtros`: 250 passaram, 0 falharam, 0 pulados.
- E2E de desempenho (projeto `perf`): `cls-tatico-equipes`, 8 de 8.
- Mutação: o Forge só a exige para `bin/`, `hooks/` e afins; esta entrega não os toca.

## Achados

Nenhum. As recomendações A2 a A5 do review seguem com o autor e não bloqueiam; o A5 (comparar a lista de `COM_TAMBEM` com a do servidor) segue sem teste que pegue deriva do servidor.
