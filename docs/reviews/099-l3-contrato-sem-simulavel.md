---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l3-contrato-sem-simulavel
commit: ef0dc300c2f0017c7fddcae18388aa24d566a965
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L3 do pedido 099, o contrato sem simulavel (E2.12, K-275)

## Achados

## Sondas

## Parecer
Aprovado sobre ef0dc300 (base develop 96d9b69f). Diff de três pontos: 4 arquivos, +15 -65 (80 linhas pelo `git diff --numstat --no-renames`, dentro das 150), um comportamento só: o corpo `sem-dado-real` perde o campo `simulavel`.

- **Cumpre a ADR 0030 (D1 e a linha P3 da tabela) no recorte do L3:** saem `simulavel` de `semDadoRealSchema` e de `corpoSemDadoReal`, `podeSimular` e `METRICAS_SEM_SIMULACAO` (`packages/contratos/src/origem.ts`); o schema continua `.strict()`, então um corpo com `simulavel` passa a ser recusado. Os comentários de `TENDENCIA_FLUXO` e `TENDENCIA_SUST` deixam de citar a lista removida. Nada mais muda no contrato nem no servidor.
- **Contrato compatível com a web atual:** `git grep` em ef0dc300 não acha `simulavel`, `podeSimular` nem `METRICAS_SEM_SIMULACAO` em `web/`, `server/src` nem `packages/` fora dos testes que provam a ausência (o L2b e L2c, PR 342, já tirou a leitura de `HttpFonteMetricas`). A web valida com `semDadoRealSchema.or(schema)` (`web/src/data/http/HttpFonteMetricas.ts:113`); como web e servidor saem no mesmo build, não há janela em que o servidor novo fale com a web antiga ou o contrário. Sem `versaoContrato` nova: a remoção de um campo opcional que nenhum cliente lê (ADR 0007).
- **OpenAPI:** `docs/api/openapi.json` na develop não tem `simulavel` (o campo nunca entrou no documento), o que confirma a afirmação do autor; o job `openapi` do CI do head passou.
- **Nota em `docs/api/`:** `docs/api/metricas.md:53` troca o parágrafo do pedido 070 pela nota do 099 (corpo com só `estado`, `metrica` e `motivo`, schema strict que recusa `simulavel`); o exemplo JSON da linha 49 perde o campo. Fiel ao código.
- **Testes que provam:** `origem.test.ts` T-C2 afirma que o schema aceita o corpo base e recusa `simulavel: true` e `valor`; o teste das chaves do corpo exige exatamente `estado`, `metrica`, `motivo`. `painel-real-f6.test.ts` T-S1 percorre toda métrica fora do mapa real pela rota e exige as três chaves (com mínimo implícito: a lista de não reais não é vazia, O8 e VISAO_GERAL têm casos próprios). A mutação do QA que devolve `simulavel` ao schema morreu (`docs/qa/` do L3, e911e340). Rodei os dois arquivos tocados com `VITEST_MAX_WORKERS=2`: contratos `src/origem.test.ts` 15 passed; server `tests/painel-real-f6.test.ts` 39 passed.
- **Os dois commits:** ddb0e2a8 faz a remoção; ef0dc300 restaura 16 linhas de teste (PV1 e notas da sustentação) que o primeiro cortou por engano. O resultado líquido está certo e cada commit compila; o segundo seria melhor absorvido no primeiro antes do push, mas o PR sai por squash, então o histórico da develop fica com um commit só. Mensagens em Conventional Commits com `Cartão: K-275`.
- **CI do head ef0dc300 (run 43152487481): verde** em testes, filtro, build, rapida, imagem, seguranca, openapi e banco (`.pg`); perf e e2e pulados pelo filtro de caminhos.
- **Fora do recorte, já com dono:** `e2e/tests-api/simulado-070-l3.spec.ts:7` ainda cita `simulavel` e espera o selo; é o A1 e o A2 do QA do L3, que vão ao L5 (guardas de QA). Não bloqueia: o e2e não roda neste diff e o código que ele exercitava já saiu no L2b e L2c.
- Regras invioláveis: nenhuma métrica ganha cálculo nem número; a API segue sem número simulado; sem dado de pessoa, sem credencial.
