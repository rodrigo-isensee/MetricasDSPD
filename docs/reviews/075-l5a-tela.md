---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l5a-tela
commit: 09a2d16c6de02f6ee6f95fba02e44de9bcf34bbc
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 075 L5a, motivo "não classificado" em BLOQUEADOS, O2 e O19 (K-204), delta do caso E2E

## Parecer

Aprovado em `09a2d16c`. O código da tela já estava aprovado em `6d4a392c` (segunda volta, A1 resolvido, exceção do médio 2 da UX aceita); o QA acrescentou depois o caso E2E do axe (`92c10424...09a2d16c`), que deixou aquele parecer desatualizado. Este parecer cobre o delta e mantém o anterior para o resto. O parecer cobre também o O19 da E4 (P-075-8).

## O que foi lido (delta `92c10424...09a2d16c`, 2 arquivos)

Os arquivos fora do delta ficam como já lidos no parecer anterior, em `6d4a392c`.

- `e2e/tests-api/motivo-nao-classificado-075-l5a.spec.ts` (novo, 80 linhas):
  - Só usa `page.route` do Playwright: BLOQUEADOS e O19 recebem corpo simulado no contrato; o O2 busca a resposta real do stub e troca só `notas` e `bloqueioMotivo`. Não toca `web/src` nem o servidor.
  - Roda `rodarAxe` do projeto (tags WCAG 2.2 AA) em cada um dos três cartões (`include`), nos temas claro e escuro, e falha com qualquer violação, bloqueante ou informativa.
  - Roda também a regra `color-contrast` isolada no cartão e exige que ela tenha sido avaliada (`passes + incomplete > 0`), então um cartão sem texto avaliado não passa em silêncio.
  - Confere `data-estado="ok"` e o texto "não classificado" visível antes do axe; abre "Mais métricas" para o O19.
  - Não depende de dado real nem da base: o corpo é fixo no arquivo.
  - Fica em `e2e/tests-api/`, coberto pelo `testDir` do projeto `chromium-api` (o `testIgnore` só exclui `grafias`).
- `docs/qa/075-l5a-tela.md`: só texto, parecer do QA; não revisado por mim.
- `web/src`, `server/` e `packages/`: sem diff no delta.

## Ferramentas

- Guardas de código de produção no delta: nenhuma (só teste e texto).
- CI do push no head `09a2d16c` (run 42331589680): verde, mas o job e2e foi pulado pelo filtro da CI do push. O caso E2E não tem prova de CI ainda: a prova vem da CI do PR do 5a, que só mescla com o e2e verde (decisão técnica do pedido, 2026-11-07 00:02).
- Não rodei o E2E neste review: ele exige o servidor stub e a SPA em `VITE_FONTE=api` (ambiente do CI do PR).
- Teto M14: o delta não toca código de produção; o teste novo tem 80 linhas e, somado ao web (155 de código e 162 de teste, já aceitos), a exceção do parecer anterior fica mantida. O corpo do PR leva a linha de exceção, com o total atualizado pela contagem de `git diff --numstat --no-renames origin/develop...HEAD` no momento do PR:

teto: excedido, 317 linhas no web mais o caso E2E de 80 linhas, um comportamento (marca do motivo não classificado em BLOQUEADOS, O2 e O19), mais da metade é teste dos CA e o acréscimo veio das correções de review, UX e QA

## Achados

- A3 (recomendado) web/src/features/complementares/operacionais.tsx:156 · Rótulo do eixo do O19 sem itálico nem ícone (médio 2 da UX), aceito como exceção: hachura, texto e legenda distinguem. Se o Barras ganhar tick customizável, igualar à tabela num cartão próprio.
- A4 (recomendado) web/src/features/operacional/components/CartaoO2.tsx:71 · O apoio do motivo depende de haver "não classificado" entre os 10 itens listados (baixo 5 da UX); o QA confere com a ordenação por "Sem mover há".
- A5 (recomendado) e2e/tests-api/motivo-nao-classificado-075-l5a.spec.ts:73 · O `import('@axe-core/playwright')` dentro do laço poderia ser um import estático no topo (o `rodarAxe` já o usa); sem efeito no resultado.
