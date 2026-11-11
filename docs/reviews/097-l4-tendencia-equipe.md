---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l4-tendencia-equipe
commit: 440c863f8f04ca02a353747081d92e0c3f322b78
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: L4 do 097, equipe opcional nas duas tendências do Resumo (E3.2, K-273)

## Achados
- A1 (recomendado) server/src/modulos/metricas/schemas.ts:76 · achado A1 do QA: TENDENCIA_SUST aceita qualquer slug e devolve recorte vazio. Coerente com a L7a, que leva a sustentação a `idSlug` com opções do dado real (E4); enum por fonte iria contra a L7a. Não mexer agora; a L7a fecha a assimetria com querySustentacaoSchema.
- A2 (recomendado) packages/metricas/src/acelerato/tendencia.ts:33 · o cast `as FiltrosSustentacao['equipe']` é escape de tipo comentado e provisório; a L7a deve removê-lo ao trocar o tipo da equipe da sustentação para texto/slug.
- A3 (recomendado) docs/tecnica/arquitetura-front.md:182 · ainda diz que a única entrada das tendências é `dataReferencia` (`SoDataReferencia`, tipo renomeado para `FiltrosTendencia`); atualizar na L5, que liga o filtro na tela. Idem docs/api/metricas.md:379 (nota histórica).

## Sondas

## Parecer
Aprovado. Diff lido: `f4c122f1..440c863f` (13 arquivos, +138 −30; código e testes em 9 arquivos).

- **Aderência ao L4:** `equipe` opcional no contrato (`FiltrosTendencia`), no `queryTendenciaSchema`, nas duas bibliotecas e no `calcular.ts`. Nada além: janela fixa de 12 semanas, `tipo`, `prioridade`, `periodo` e pessoa seguem com 400. A forma da resposta não muda.
- **Contrato compatível** (`docs/contratos/politica-de-mudanca.md`, linha 24, "Parâmetro de entrada novo opcional"): sem `equipe` o resultado é o mesmo de antes (teste `toEqual` entre sem e `[]`, nas duas fontes). OpenAPI e os dois contratos de métrica regenerados no commit 440c863f.
- **Fontes separadas:** `calcularTendenciaFluxo` lê só `ctx.bm` e `calcularTendenciaSust` só `ctx.ac`; a equipe filtra dentro de cada fonte (slug do BusinessMap no fluxo, `equipeId` do Acelerato na sustentação). Slug de uma fonte na outra dá recorte vazio, nunca mistura.
- **Sem comparação entre equipes:** várias equipes = união numa série só (teste: união de A e B igual a todas). Nenhuma saída por equipe.
- **Biblioteca compartilhada:** o recorte reaproveita `concluidosDeDemanda`, `entreguesPorTipo`, `diasDeAbertura`, `apuraveisComDia` e `aderenciaPorPrioridade` com os filtros montados sobre o `PADRAO`; nenhum cálculo novo. Mínimo de 20 vale sobre o recorte (teste com 5 itens: `insuficiente`).
- **Validação na fronteira:** `lista(idSlug)` com `.strict()`, o mesmo das demais consultas; casos de slug inválido (`Fluig X`, `a;b`, `..%2F..`) dão 400 no teste de rota e na matriz sistêmica.
- **A1 do QA contra a L7a:** a L7a troca o enum da sustentação por `idSlug` com opções vindas de `dim_chamado`; depois dela `querySustentacaoSchema` também aceitará qualquer slug com recorte vazio. A L4 já está no comportamento final; não bloqueia (A1 acima).
- **Regras de `praticas.md`:** o arquivo não traz regras marcadas "decidida por"; o checklist da skill foi lido sobre o diff.
- **Verificação local (R-TETO, `--maxWorkers=2`, só os testes tocados):** `packages/metricas` `tendencia.test.ts` e `filtros.intensivo.test.ts`: 2 arquivos, 54 testes passando; `server` `tests/metricas.test.ts` e `tests/api.sistemico-intensivo.test.ts`: 2 arquivos, 217 testes passando. A suíte completa fica com o CI do PR.
- **Pareceres da branch:** QA aprovado em 35b99f3a (com o A1 tratado acima); não o refaço.
- **Commits:** dois, Conventional Commits em português (`feat(api)` e `docs(contratos)`), um propósito cada.
