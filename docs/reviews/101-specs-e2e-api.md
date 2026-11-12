---
tipo: review
contrato: 1
pedido: 101-release-filtros-sem-simulado
branch: fix/101-specs-e2e-api
commit: 43ebaabcbe336ffd04d8a7c09eac6d25f47e713b
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: specs velhos do e2e chromium-api (E1.9, cartão K-273)

Escopo: `git diff origin/develop...43ebaabc` (base ea826a9c), 1 commit, 3 arquivos, +18 −11, todos em `e2e/tests-api/`. Sem código de produção, migração nem configuração.

## Conferências

- **Só specs de `e2e/tests-api/`:** `api.spec.ts`, `tatico-011-lote2.spec.ts`, `tendencias.spec.ts`.
- **FA5-04 e FA5-16 (tipo Melhoria):** `melhoria` é id válido de `TIPO_ID` (`packages/contratos/src/filtros.ts:42`); o teste continua provando a query do contrato e o cancelamento da requisição antiga, só troca a opção que existe nos dados reais. Sem guarda afrouxada.
- **TT-02 (selo fictício 0 em T10 a T14):** acompanha a ADR 0030 (sem simulado na web). A asserção ficou mais estrita (0 em todas), não mais frouxa.
- **CT-58 (equipe opcional):** `equipe` saiu da lista de parâmetros extras porque o schema da tendência passou a aceitá-la (`server/src/modulos/metricas/schemas.ts:76`, `lista(idSlug)`). O teste cobre os dois ramos: slugs válidos (`fluig`, `sssc-totvs`, `fluig,senior`) dão 200 e inválidos (`A%20B`, `x_y`, `-x`) dão 400, conferidos contra a regex `^[a-z0-9][a-z0-9-]{0,59}$` (`schemas.ts:10`). Os demais extras (`tipo`, `prioridade`, `periodo`, `pageSize`, `usuarioKey`) seguem em 400.
- **CT-59 (regex PESSOA):** `usuarioKey`, `e-mail`, `nome`, `titulo`, `assignee` e `responsavel` continuam checados no corpo inteiro, inclusive dentro de `criterios`. Só `"descricao"` passou a ser checado no corpo sem a chave `criterios` (marco de critério é texto fixo do sistema). A checagem de e-mail no corpo inteiro ficou. Guarda de pessoa mantida.
- **Ferramentas:** `pnpm run typecheck` em `e2e/` sem erro; `eslint` nos 3 specs sem saída. A execução do chromium-api (69 de 69) é do QA, citada do commit, não refeita.
- **Commit:** Conventional Commits em português, com `Cartão: K-273`.

## Achados

- A1 (recomendado) e2e/tests-api/tendencias.spec.ts:28 · o replacer de `semCriterios` remove a chave `criterios` em qualquer profundidade, não só no topo; hoje só existe no topo, mas restringir a `this === raiz` deixaria a exceção do `descricao` no tamanho exato da justificativa.
