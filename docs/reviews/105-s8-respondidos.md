---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s8-respondidos
commit: 6dcd705e17cda5e56a1a9678872d15aaea854d20
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: S8 só com incidentes respondidos e contagem dos sem resposta, E7.237 (review E7.306)

Branch `feature/105-s8-respondidos` contra `develop` (base `57989aa0`), head `6dcd705e`. São 13 arquivos e 120 linhas de código e teste (fora `.md`, CHANGELOG, OpenAPI e a fotografia do contrato), abaixo do teto de 150. É um comportamento só: o S8 publica a contagem dos sem resposta e a versão de critério datada. O autor não mandou relatório, então conferi o commit e o CI eu mesmo.

## Parecer
**Aprovado** no head `6dcd705e`. A entrega aplica a decisão A do dono (pedido 105, 2026-11-16 12:34): o S8 conta só os incidentes com o campo de reincidência respondido; quem ficou sem resposta sai do denominador e o cartão mostra quantos são; abaixo de 20 respondidos a amostra é insuficiente; a D-10 sai e a versão de critério fica datada. O A1 é recomendado e não bloqueia.

Observação sobre o brief: ele descreve o S8 como "tempo de primeira resposta". A decisão do pedido (linha 567) e o código tratam da **taxa de reabertura** (campo "Este problema já ocorreu nos últimos 90 dias?"). Revisei contra a decisão do pedido.

## Achados
- A1 (recomendado) docs/api/metricas.md:417 · A seção nova `### S8: contagem dos sem resposta` entrou antes do último item da seção do 066, e o item "Critério versionado (T2.6): `066:S8-com-resposta`…" foi parar sob o título do 105. Mova a seção nova para depois desse item.

## O que conferi
- Cálculo (`packages/metricas/src/acelerato/s8.ts:57`): `semResposta = n - informados`, e 0 sem extensão. O denominador continua sendo o dos incidentes informados (`taxa(k, informados)`, linha 49). O limite de 20 vem da `taxa` da biblioteca compartilhada, sem conta própria. Só entram chamados do Acelerato (`selecionarAC`); nada do BusinessMap se mistura.
- Contrato: `semResposta` é opcional (`z.number().int().min(0).optional()`), o que mantém a mudança compatível. OpenAPI, `docs/contratos/metricas/S8.md` e a fotografia mudam juntos.
- Versão de critério (T2.6): `105:S8-so-respondidos` no domínio `acelerato`, com `metricas: ['S8']`. O teste CT-49 passa a esperar 8 entradas e o par `['8','S8']`. A data vem do `ac:ref-sync`.
- Cartão (`web/src/features/complementares/sustentacao.tsx:77`): usa o campo do contrato e, se ele faltar, calcula total menos respondidos. O texto vai no singular ou no plural e só aparece quando a cobertura é parcial. A nota "Como se calcula" foi atualizada.
- Regras invioláveis: nada de pessoa nem texto livre no diff; nenhuma visão individual.
- Testes: rodei os novos testes locais nas bordas 0, 19, 20 e 25 respondidos e a variante sem extensão (`vitest -t S8`: 10 passaram em `packages/metricas` e 7 em `web`).
- Mutantes:
  - `n - informados` → `n` (s8.ts:57) derruba 2 testes.
  - Tirar a guarda `ext === undefined ? 0 :` deixa todos os testes verdes, mas o mutante é equivalente: sem extensão, `ausente` fica vazio e `informados` = `n`, então `n - informados` já dá 0. Não é falta de teste.

## CI e suíte
- Run 43947519970 (push, `6dcd705e`): `rapida`, `build`, `seguranca`, `openapi`, `imagem` e `banco` passaram. O job `testes` foi cancelado porque o push do parecer do QA (`c4f01dfe`) abriu um run novo.
- `c4f01dfe` difere de `6dcd705e` só em `docs/qa/105-s8-respondidos.md`. O CI dele, o run 43948477543 (push), terminou com `success`, e o job `testes` passou. Como o código é o mesmo, vale para `6dcd705e`.
- Não rodei a suíte inteira. Sem PR, ela fica para o CI do PR.
