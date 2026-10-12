# Plano: documentação de contratos (`docs/contratos/`)

> Tech lead, 2026-10-11. Pedido do usuário: "não achei a documentação dos contratos". Diagnóstico: os contratos existem e são bem testados, mas estão espalhados por `docs/api/`, `docs/architecture/`, `docs/tecnica/` e comentários de código, sem índice nem página por métrica, e parte do texto está desatualizada.

## 1. Inventário

| Tipo | Fonte no código | Documentado hoje em | Falta |
|---|---|---|---|
| **API HTTP**: 43 rotas (33 de métrica, uma por `MetricaId` + 10: saúde x3, filtros, referência, fontes x2, critérios, webhook), filtros por domínio, erros, cabeçalhos, cache, paginação do O2 | `server/src/modulos/*/rotas.ts`, schemas Zod | `docs/api/openapi.json` (gerado, CI `openapi:verificar`), `docs/api/metricas.md`, `docs/api/fontes.md` | `metricas.md` ainda diz "RASCUNHO" e aponta `web/src/contracts/` (hoje `packages/contratos`); ADR 0007 fala em MySQL. O OpenAPI tem 0 `components.schemas` (tudo inline): ilegível por métrica. Sem exemplo de resposta por métrica. Tabela de erros duplicada entre os dois `.md` |
| **Biblioteca**: `ContratoMetricas`, `ResultadoDe<K>`, `SCHEMAS_RESULTADO`, `APLICABILIDADE_FLUXO`, `METRICAS_SUSTENTACAO`, domínios fechados (`comum.ts`), `MINIMO_AMOSTRA`, metas | `packages/contratos/src/*` | `docs/tecnica/biblioteca-de-calculo.md` §5, `guia-do-desenvolvedor.md` (só onde fica) | Página por métrica: schema do resultado, filtros aplicáveis, regra de mínimo, granularidade |
| **`REGRAS_METRICA`** (33 entradas, `pendente-usuario`) | `packages/metricas/src/core/regras.ts` | `docs/architecture/regras-metricas.md` §2 (tabela **à mão**, pode divergir) | Tabela gerada |
| **`CATALOGO_CARTOES`**, papéis, preferências (`CHAVE_PREFERENCIAS = ...:v1`, `preferenciasMetricasSchema`) (pedido 007) | `packages/contratos/src/cartoes.ts` | plano do 007 em `docs/architecture/features/` e `docs/ux/` | Contrato de persistência (chave versionada, migração de `v1`, `CARTOES_RETIRADOS`) |
| **Exportação** (pedido 008): limites (`LIMITE_METRICAS = 12`, 20 linhas, 8 colunas), blocos por fonte, nada recalculado | `web/src/features/exportar/modelo.ts` | `docs/architecture/features/exportar-metricas.md` | Seção curta de contrato (entrada DTO, saída, limites) |
| **Eventos (outbox)**: `coleta.concluida` `{fonte, coletaId, status}`; `bm.webhook.recebido` `{webhookSk, payloadSha256}`; regra de prefixo `bm.`/`ac.`/`coleta.` | `modulos/operacao/concluida.ts`, `modulos/businessmap/webhook.ts`, `plataforma/eventos/*` | `docs/architecture/server.md` (semântica de entrega), `data-model.md` §5 (tabela) | **Catálogo de eventos não existe** e `payload` é `unknown`: sem schema Zod por tipo |
| **Dados**: camadas `stg_/evt_/dim_/fato_/ref_/ctl_`, `COLUNAS_PESSOA`, grants por papel, paridade mock x banco | migrações, `plataforma/db/lgpd.ts`, `grants.ts`, `tests/metricas.paridade.test.ts` | `docs/architecture/data-model.md` §3-9, `server.md` | Só um link e um resumo no índice (o data-model já é a fonte; não duplicar) |
| **Fontes**: BusinessMap (API + webhook), Acelerato (tabela do Metabase, só leitura) | `modulos/businessmap/staging.ts`, `webhook.ts` | `data-model.md` §3.1 e §4, ADR 0006/0013, `docs/especificacao/domain/` | Formato real do payload do webhook e colunas do Metabase: pendentes do coletor (WS2); registrar como "a confirmar" |

## 2. Estrutura proposta

```
docs/contratos/
  README.md                 índice: tipos de contrato, onde está a fonte, dono, como mudar   (à mão)
  politica-de-mudanca.md    versionamento, compatibilidade, T2.6, checklist de PR            (à mão)
  http.md                   regras gerais, erros (única tabela), cabeçalhos, cache, paginação (à mão; absorve docs/api/*.md)
  eventos.md                semântica da outbox + tabela gerada de tipos e payloads           (misto)
  dados.md                  resumo e links para data-model §3-9; COLUNAS_PESSOA gerada        (misto)
  fontes.md                 BusinessMap e Acelerato; itens "a confirmar"                      (à mão)
  preferencias-e-exportacao.md                                                                (à mão)
  metricas/README.md        tabela gerada das 33 (id, domínio, rota, granularidade, mínimo, status)
  metricas/<ID>.md          uma por métrica, gerada
```
`docs/api/openapi.json` continua onde está (CI e ferramentas o leem); `docs/api/*.md` vira um ponteiro para `docs/contratos/`.

**Gerado** (bloco entre `<!-- gerado:inicio -->` e `<!-- gerado:fim -->`, o resto da página é à mão e preservado):
- `metricas/<ID>.md`: rota e parâmetros (do OpenAPI), filtros aplicáveis (`APLICABILIDADE_FLUXO`/domínio), schema do resultado (`z.toJSONSchema(SCHEMAS_RESULTADO[id])`, Zod 4 nativo), linha de `REGRAS_METRICA`, cartões que a usam (`CATALOGO_CARTOES`), exemplo de resposta (resultado do mock determinístico, validado pelo schema).
- `metricas/README.md`, tabela de eventos, `COLUNAS_PESSOA`, domínios fechados, e a tabela §2 de `regras-metricas.md` (passa a ser gerada).

**Escrito à mão**: semântica de cada campo quando não óbvia, erros e quando ocorrem, exemplos de uso, versionamento, política de mudança, ligação com T2.6.

**Script e CI**: pacote `tools/docs-contratos` (mesmo padrão do `tools/spec-check`: Node + TS, `pronto` com 100% de cobertura). `pnpm docs:gerar` grava; `pnpm docs:check` regenera em memória e falha se diferir do versionado (mesmo desenho de `openapi:verificar`). Entra no job `openapi` do CI (renomear para `contratos`) e no `pronto`. O gerador é funções puras (`(insumos) -> string`) + um `main.ts` fino, testadas com insumos pequenos; o teste de integração roda contra os insumos reais e compara com o versionado.

## 3. Testes de contrato e versionamento

Já existem (manter): saída validada por Zod em toda rota (fora do schema = 500); entrada `.strict()` (parâmetro de pessoa = 400); OpenAPI gerado = versionado; paridade das 33 métricas mock x banco; testes negativos de pessoa (respostas, OpenAPI, `dspd_api`); propriedades de `REGRAS_METRICA`.

Novos:
1. **Schema de evento**: `catalogo-eventos.ts` com Zod por tipo; `publicarEvento` e o webhook validam o payload; teste de que todo tipo registrado tem schema e nenhum payload tem chave de pessoa.
2. **Compatibilidade**: teste que compara o JSON Schema de cada resultado com uma fotografia versionada (`docs/contratos/metricas/*.schema.json`, gerada) e classifica a diferença: campo novo opcional = compatível; remoção, renomeação, troca de tipo, novo obrigatório, valor de enum removido = **incompatível**, falha a menos que o PR traga `/api/v2` ou registro explícito em `politica-de-mudanca.md`.
3. **Exemplo válido**: todo exemplo gerado passa no schema (cobre a página por métrica).
4. **Front**: `HttpFonteMetricas` com `safeParse` (já previsto na ADR 0007) coberto por um teste com resposta fora do contrato.

**Política** (texto em `politica-de-mudanca.md`, base ADR 0007): `/api/v1`; aditivo opcional não muda versão; incompatível = `/api/v2` em paralelo com prazo de convivência; preferências mudam a chave (`:v2`) com leitura migrada de `:v1`; cartão retirado vai para `CARTOES_RETIRADOS`; eventos: tipo novo para mudança incompatível (`coleta.concluida.v2`), consumidor antigo continua até a outbox esvaziar. Mudança de **critério de cálculo** não é mudança de contrato: segue T2.6 (`ref_versao_criterio`, `X-Versao-Criterio`, marcação no gráfico); o PR que muda cálculo cita a versão de critério criada. Todo PR que toca `packages/contratos`, rotas ou eventos marca no checklist "contrato: compatível / incompatível (justificativa)".

## 4. Entregáveis, dono, esforço e ordem

| # | Entrega | Dono | Esforço |
|---|---|---|---|
| 1 | `docs/contratos/README.md` + `politica-de-mudanca.md`; ponteiros em `docs/api/*.md`; corrigir textos desatualizados (RASCUNHO, `web/src/contracts`, MySQL na ADR 0007) | tech-lead + software-architect | P (0,5 dia) |
| 2 | `tools/docs-contratos` (gerador, `docs:gerar`, `docs:check`, 100% cobertura), páginas por métrica e índice gerados | node-backend | M (1,5 dia) |
| 3 | `catalogo-eventos.ts` com Zod + validação em `publicarEvento`/webhook + `eventos.md` | node-backend (schema), arquiteto (texto) | P (0,5 dia) |
| 4 | Teste de compatibilidade de schema (fotografias + classificador) | node-backend | P-M (1 dia) |
| 5 | `http.md`, `dados.md`, `fontes.md`, `preferencias-e-exportacao.md`; semântica nas páginas por métrica | tech-lead + arquiteto (react-frontend revisa 007/008) | M (1 dia) |
| 6 | CI: job `contratos` (openapi + docs:check), item no checklist de review em `praticas.md` | tech-lead | P |
| 7 | Code review e QA (`docs:check` quebrando com doc velho; página por métrica conferida por amostra) | tech-lead, qa-engineer | P |

Ordem: 1 → 2 e 3 em paralelo → 4 → 5 → 6 → 7. Branch: `docs/documentacao-tecnica` para 1 e 5; 2-4 têm código, então `chore/contratos-gerados` (ou na mesma branch, se o usuário preferir um PR só).

## 5. Perguntas ao usuário (produto)

1. A documentação de contratos é só para o time (repositório) ou também para consumidores externos? Se externos, servir Swagger UI pela própria api (`/docs`) e decidir se exige autenticação. Sem resposta, fica só no repositório.
