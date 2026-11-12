---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l7a-sustentacao-equipe
commit: ad0522d9a8515913fea2313d1ae1d0e487fe5181
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L7a do 097, equipe da Sustentação do dado real em slug (E3.2, K-273)

## Achados
- A1 (bloqueante) web/src/features/filtros/codec.ts:131 · a API passa a dar opções `sssc-totvs`..., mas o codec da web só aceita `totvs|senior|fluig` (e o colapsarTodos em :249): escolher equipe na Sustentação vira "valor inválido" e some (S1). O L7a não entra na develop sem o L7b.
- A2 (recomendado) docs/contratos/http.md:38 · ainda diz equipe da Sustentação `totvs`, `senior`, `fluig`; alinhar ao `docs/api/metricas.md:30` (slug do nome, ids antigos como apelido).
- A3 (recomendado) packages/contratos/src/filtros.ts:12 · o apelido vale "por um ciclo de release" sem cartão nem versão de remoção; abrir cartão que remova `APELIDO_EQUIPE_SUSTENTACAO`, `EQUIPES_SUSTENTACAO_ID` e `NOME_EQUIPE_SUSTENTACAO` na release seguinte à do L7b.
- A4 (recomendado) packages/contratos/src/filtros.ts:63 · `filtrosSustentacaoSchema.equipe` aceita qualquer texto (vazio, espaço); a fronteira do server valida com `idSlug`, mas o contrato compartilhado poderia usar a mesma regra de slug.
- A5 (recomendado) server/src/modulos/referencia/servico.ts:38 · com dois nomes de mesmo slug, o `Map` guarda o último na ordem do `ORDER BY` (dependente de collation); preferir o primeiro, e o teste de app.test.ts:17 deixa de depender disso.

## Sondas
- S1 · `lerSustentacao(new URLSearchParams('equipe=sssc-totvs'), {dominio:'acelerato', equipes:[{id:'sssc-totvs',nome:'SSSC TOTVS'}], ...}, '6m')` no codec de ad0522d9 · espera: `equipe: ['sssc-totvs']` · obtido: `{"equipe":[],...,"invalidos":["equipe \"sssc-totvs\""]}`

## Parecer
Reprovado só pelo A1, que é de integração, não do código do servidor. Diff lido: `origin/develop...ad0522d9` em `server/`, `packages/` e `docs/api/` (14 arquivos, 127 linhas de código e teste, dentro da orientação de 150), e o delta da volta `0f61133b..ad0522d9`.

- **A1, o defeito:** `BarraFiltros.tsx:36` monta a lista com `opcoes.equipes` da API, que agora devolve os slugs do nome (`sssc-totvs`). A URL leva `equipe=sssc-totvs`, e `lerSustentacao` valida contra `EQUIPES_SUSTENTACAO_ID` e a descarta como inválida (S1). Com o L7a sozinho na develop, e daí na homolog, o filtro de equipe da Sustentação deixa de funcionar na web. O plano (linha 110) diz "não precisa de ordem" porque a entrada fica mais ampla, mas a **saída** de `GET /filtros/acelerato` mudou de ids. Saídas possíveis (a escolha é do Jarvis): o L7b (codec com `idsDe(opcoes, 'equipes')` e o apelido) entra nesta branch e no mesmo PR, ou o PR do L7a fica em rascunho até o L7b estar pronto e os dois entram juntos, sem promoção entre um e outro. O código do servidor não precisa mudar por causa do A1.
- **Contrato (enum para slug na entrada):** `querySustentacaoSchema.equipe` passa a `lista(idSlug)`, a mesma regra de BusinessMap e das tendências. Tudo o que era aceito antes continua aceito, e slug fora do padrão dá 400 (`metricas.test.ts`: `SSSC%20TOTVS`, `-x`, `a_b`, 61 caracteres). `openapi:verificar` diz "openapi.json em dia". Isso fecha o A1 do review do L4 (assimetria da tendência).
- **Apelido dos ids antigos:** `idEquipeSustentacao` está num só lugar (`contratos`), e `selecionarAC` resolve o apelido antes de comparar. A tendência passa pelo mesmo caminho (teste `totvs` e `sssc-totvs` com volume 20). O prazo de remoção não tem cartão (A3).
- **`lerEquipesAC` com a constante única do K-280:** `WHERE ${CORTE_CHAMADOS}` de `referencia/cortes.ts`, sem copiar a condição. O teste `app.test.ts` ("só as do corte de lerChamados") confere as três partes do corte no SQL emitido. `DISTINCT equipe` não traz pessoa nem contagem, e o GRANT segue o mesmo (coluna `equipe` já lida por `lerChamados`).
- **Biblioteca:** `equipeId = slug(c.equipe)`, o mesmo `slug` das opções, de modo que opção e filtro batem e equipe nova funciona sem código novo (teste `time-novo` = 3). BusinessMap e Acelerato seguem separados, a união de equipes dá uma série só e nada é comparado entre equipes. Foi removido o cast `as FiltrosSustentacao['equipe']` da tendência (fecha o A2 do review do L4).
- **Testes que provam algo:** a tendência por slug, por id antigo e por equipe nova, as opções do dado real com dedupe e base vazia, o corte no SQL, a matriz sistêmica com `equipe=Equipe_Outra` (inválido de verdade, a volta do A1 do QA) e os 400 da rota. Faltou o teste do codec da web, que mostraria o A1; ele vem com o L7b.
- **`docs/api/metricas.md`:** atualizado (entrada e opções, mudança compatível na entrada). `docs/contratos/http.md` ficou para trás (A2).
- **Verificação local (VITEST_MAX_WORKERS=2, só os testes tocados, no head 15994fde = ad0522d9 + parecer do QA):** `packages/contratos` contratos.test.ts com 17 testes, `packages/metricas` tendencia.test.ts com 39, `server` app, metricas, api.sistemico-intensivo e corte-unico com 237, todos passando. O `.pg` e a suíte completa ficam no CI.
- **Pareceres da branch:** QA aprovado na volta 1 (15994fde, em ad0522d9). Não refiz esse trabalho.
- **Regras de `praticas.md`:** o arquivo não marca regras com "decidida por". Li o checklist da skill sobre o diff.
- **Commits:** `feat(sustentacao)`, o merge da develop e `fix(server)` da volta, todos em Conventional Commits em português.
