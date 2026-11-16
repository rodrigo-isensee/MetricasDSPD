---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s8-respondidos
commit: e1b617d54df9c857f2e445677e18d84b2d4fe7b6
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: S8 só com incidentes respondidos e contagem dos sem resposta, E7.237 (review E7.306, revalidação E7.319)

Branch `feature/105-s8-respondidos` contra `develop`. A primeira revisão foi no head `6dcd705e` (base `57989aa0`). A revalidação é no head `e1b617d5`, que integra a `origin/develop` para resolver um conflito no CHANGELOG. São 13 arquivos e 120 linhas de código e teste (fora `.md`, CHANGELOG, OpenAPI e a fotografia do contrato), abaixo do teto de 150. É um comportamento só: o S8 publica a contagem dos sem resposta e a versão de critério datada.

## Parecer
**Aprovado** no head `e1b617d5`. A entrega aplica a decisão A do dono (pedido 105, 2026-11-16 12:34): o S8 conta só os incidentes com o campo de reincidência respondido; quem ficou sem resposta sai do denominador e o cartão mostra quantos são; abaixo de 20 respondidos a amostra é insuficiente; a D-10 sai e a versão de critério fica datada. O A1 é recomendado e não bloqueia.

Observação sobre o brief da primeira revisão: ele descreve o S8 como "tempo de primeira resposta". A decisão do pedido (linha 567) e o código tratam da **taxa de reabertura** (campo "Este problema já ocorreu nos últimos 90 dias?"). Revisei contra a decisão do pedido.

## Revalidação no head e1b617d5 (delta lido)
- Comando: `forge-check parecer delta docs/reviews/105-s8-respondidos.md`. Intervalo `6dcd705e..e1b617d5`, escopo "sem o que veio da base".
- No domínio, ele listou `CHANGELOG.md`, `docs/api/metricas.md`, `docs/api/openapi.json`, `packages/metricas/src/complementares.test.ts` e `web/src/features/complementares/notas.ts`. Fora o CHANGELOG, as mudanças desses arquivos são de outros itens que já estão na develop: o O12 com o campo 51 (E7.214) e os 11 motivos de bloqueio do BusinessMap (E7.184). Nenhuma delas é do S8.
- Para provar que o patch do S8 não mudou, comparei o `git patch-id --stable` sem o CHANGELOG e sem os pareceres. `57989aa0..6dcd705e` dá `239a9950c0a7`, e `origin/develop..e1b617d5` dá o mesmo `239a9950c0a7`. O patch é idêntico ao revisado.
- No CHANGELOG, o diff contra a develop é só a linha do S8 em "### Corrigido", e a resolução do conflito manteve as linhas da develop.
- Por isso, o parecer de código da primeira revisão continua valendo, sem achado novo.

## Achados
- A1 (recomendado) docs/api/metricas.md:417 · A seção nova `### S8: contagem dos sem resposta` entrou antes do último item da seção do 066, e o item "Critério versionado (T2.6): `066:S8-com-resposta`…" foi parar sob o título do 105. Mova a seção nova para depois desse item.

## O que conferi (primeira revisão, head 6dcd705e)
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
- Head `6dcd705e`: o run 43947519970 (push) passou nos jobs `rapida`, `build`, `seguranca`, `openapi`, `imagem` e `banco`. O job `testes` foi cancelado porque o push do parecer do QA abriu um run novo. O run 43948477543 (`c4f01dfe`, que difere só no parecer do QA) terminou com `success`, inclusive no job `testes`.
- Head `e1b617d5`: os runs 43956965615 (push) e 43956976506 (pull_request) estavam `in_progress` quando revalidei. O merge da develop precisa desse CI verde. Fica como pendência do merge, não do parecer.
- Não rodei a suíte inteira. Ela fica para o CI do PR.
