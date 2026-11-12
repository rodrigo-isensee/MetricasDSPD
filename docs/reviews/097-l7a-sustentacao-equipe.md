---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l7a-sustentacao-equipe
commit: d4ba9bf9d681082e3c899c9189c6393e4f0cdd1a
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L7a e L7b do 097, equipe da Sustentação do dado real em slug (E3.2, K-273)

## Achados
- A3 (recomendado) packages/contratos/src/filtros.ts:12 · o apelido vale "por um ciclo de release" sem cartão; virou cartão: remover `APELIDO_EQUIPE_SUSTENTACAO`, `EQUIPES_SUSTENTACAO_ID` e `NOME_EQUIPE_SUSTENTACAO` na release seguinte à que levar o L7b; fora dos testes, ninguém mais usa os dois últimos.
- A4 (recomendado) packages/contratos/src/filtros.ts:63 · `filtrosSustentacaoSchema.equipe` aceita qualquer texto; entra no mesmo cartão do A3 (o contrato passa a usar a regra de slug quando o apelido sair).
- A5 (recomendado) server/src/modulos/referencia/servico.ts:38 · com dois nomes de mesmo slug, o `Map` guarda o último na ordem do `ORDER BY` (depende de collation); virou cartão próprio, de servidor: ficar com o primeiro e tirar a dependência do teste app.test.ts:17.

## Parecer
Aprovado em d4ba9bf9. Revalidação: li só o delta do L7b, `b7442810..d4ba9bf9` (16 arquivos, 85 adições e 53 remoções, em `web/`, `e2e/` e `docs/contratos/http.md`). O `ec72caae` por cima é só o parecer do QA (aprovado), que não refiz.

- **A1 fechado (integração com a web):** `lerSustentacao` valida a equipe contra `idsDe(opcoes, 'equipes')`, as opções da API, e não mais contra a lista fixa; `colapsarTodos` faz o mesmo (codec.ts:252). A sonda S1 do review anterior virou teste: `equipe=sssc-totvs,time-novo` lido sem inválidos (codec.test.ts:114), que falha no codec de b7442810.
- **A2 fechado:** `docs/contratos/http.md:38` diz slug do nome (`sssc-totvs`) com os ids antigos como apelido, igual ao `docs/api/metricas.md`.
- **Codec sem segunda tabela de ids:** o apelido entra em `lerLista` como função (`idEquipeSustentacao`, de `@metricas-dspd/contratos`); a web não tem lista própria de equipes nem de apelidos. O inválido é anotado com o valor original da URL, e o apelido é resolvido antes da deduplicação (`totvs,sssc-totvs,fluig` dá dois slugs, codec.test.ts:120).
- **Sem opções carregadas:** `idsDe` devolve `null` e a leitura aceita qualquer slug, igual ao fluxo (`lerFluxo`), então `contarAtivos` e a exportação não perdem filtro enquanto as opções carregam. É o comportamento que o BusinessMap já tem.
- **Tipos:** saíram os casts `as never` (BarraFiltros.tsx:39), `as Uso` (BarraFiltros.tsx:151 e :159) e `as typeof f.equipe` (useFiltros.ts:335), porque a equipe passou a ser `string`. `tsc -p tsconfig.app.json` e `tsc -p tsconfig.test.json` sem erro.
- **Mock:** `nucleoMock.ts` passa a dar o slug do nome com `lib.slug`, a mesma função do servidor, sem a constante antiga.
- **Testes que provam algo:** o slug novo e a equipe nova, o apelido sem duplicar e a escrita em slug, o slug fora das opções anotado como inválido, e o colapso de "todas" pelas opções (k039.test.ts:30). Os e2e (`intensivo-filtros`, `sustentacao-no-operacional`) passam a usar os slugs; rodam no CI.
- **Verificação local (VITEST_MAX_WORKERS=2, só os 8 arquivos de teste tocados da web, em ec72caae):** 127 testes passando. A suíte da web e o e2e ficam no CI.
- **A3, A4 e A5:** nenhum bloqueia. Decisão: A3 vira cartão (com A4 junto, porque os dois mexem no mesmo contrato quando o apelido sair) e A5 vira cartão de servidor. O Jarvis abre os dois.
- **Tamanho:** L7a e L7b no mesmo PR, como o A1 exigia, somam 263 linhas de código e teste (`git diff --numstat --no-renames 608fd604...d4ba9bf9`, fora `.md`). O corpo do PR (E3.4) leva `teto: excedido, 263 linhas, L7a e L7b entram juntos (A1: a saída de opções mudou de ids)`.
- **Regras de `praticas.md`:** o arquivo não marca regras com "decidida por". Li o checklist da skill sobre o delta.
- **Commits:** `feat(web)` do L7b em Conventional Commits em português.
