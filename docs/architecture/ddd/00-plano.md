# Documentação técnica em DDD: plano

Propósito: planejar a documentação técnica em DDD e ligar suas páginas ([índice](README.md), [agregados](03-agregados.md)). Público: time e agentes de IA. Revisão: 2026-10-11.

- Data: 2026-10-11 · Dono: `software-architect` (com `tech-lead` e `ux-designer`) · Branch: `docs/documentacao-tecnica`
- Pedido do usuário: "não acho a documentação dos contratos nem diagramas no padrão do DDD".
- Princípio: **referenciar, não duplicar**. O Modelo de Domínio já existe no Siegard (`docs/especificacao/domain/`, 5 contextos, 57 elementos) e os contratos já existem em código (`packages/contratos`, `docs/api/openapi.json` gerado). Falta a camada que os explica e liga, e um índice que os encontre.

## 1. Inventário

| Existe | Onde | Estado |
|---|---|---|
| C4 contexto e contêineres, módulos do `server/`, sequência coleta → cartão, regra inviolável → garantia | `architecture/overview.md` | Atual (ADR 0014 rev. 2). Módulos `acelerato` e `preferencias` desenhados, mas ainda não existem em `server/src/modulos/` (marcar "alvo"). |
| Estrutura do servidor, migrações, seed, Compose, papéis, outbox | `architecture/server.md` | Atual, mas é um diário de lotes (S-01..S-12): difícil de ler como referência. |
| ER de `dspd_bm` e `dspd_ac`; `dspd_core` e outbox só em texto | `architecture/data-model.md` | Atual. Sem ER do `dspd_core` (ref, ctl, outbox). |
| C4 nível 3 do front, ER do mock, biblioteca de cálculo, testes | `tecnica/*.md` | Atuais no conteúdo. **`tecnica/README.md` (índice geral) está desatualizado:** descreve a ADR 0013 como Lambda/Hono/Kysely/AWS e o overview como "containers na AWS"; não cita ADR 0014/0015, `docs/api/`, `docs/especificacao/`, `docs/security/`. |
| Modelo de Domínio (agregados, entidades, VOs, enumerações, serviços) | `especificacao/domain/{flow,support,metrics,collection,reference}/` | Atual, validado pelo Siegard. Sem diagramas; sem `rules/`, `scenarios/`, `contracts/` no repositório. `_context.md` traz só `strategic` e descrição: **não há relações entre contextos.** |
| Contratos | `packages/contratos/src/*.ts` (zod, fonte), `docs/api/openapi.json` (gerado, conferido no CI), `docs/api/{metricas,fontes}.md` (narrativa) | Corretos, mas sem índice: não há uma página "contratos" que liste rotas, DTOs, eventos da outbox e a fronteira `FonteMetricas`. Eventos (`coleta.concluida`, `bm.webhook.recebido`) só aparecem em prosa no `server.md`. |
| ADRs 0001–0015 | `architecture/adr/` | Atuais; 0004, 0006, 0008 substituídas. |

**Lacunas reais:** linguagem ubíqua (PT ↔ termo do Siegard em inglês ↔ tabela ↔ tipo TS); mapa de contextos com relações; diagramas de classe por agregado; ER do `dspd_core`; catálogo de eventos de domínio; máquinas de estado do card e do chamado; sequências de cálculo/publicação e de exportação; índice de contratos; validação dos diagramas no CI.

## 2. Artefatos (o mínimo que responde ao pedido)

Contextos já definidos pelo Siegard: **Fluxo** (`flow`, núcleo, BM), **Sustentação** (`support`, núcleo, AC), **Métricas** (`metrics`, núcleo), **Coleta** (`collection`, suporte), **Referência** (`reference`, suporte). Na apresentação não se cria contexto novo; `operacao`, `preferencias` e a camada HTTP são módulos de aplicação, não contextos.

| # | Artefato | Conteúdo | Origem |
|---|---|---|---|
| 01 | `01-linguagem-ubiqua.md` | Tabela termo PT · elemento Siegard (link) · tabela/coluna · tipo TS · definição em 1 linha. Termos proibidos (produtividade individual etc.). | Escrito; links para o Siegard, sem copiar atributos. |
| 02 | `02-contextos-e-mapa.md` | Mapa de contextos (Mermaid `flowchart`) com relações: BusinessMap → Fluxo e Metabase → Sustentação por **ACL** (coletores + normalização); Fluxo/Sustentação → Métricas **cliente-fornecedor** via `BaseBM`/`BaseAC`; `@metricas-dspd/metricas/core` como **núcleo compartilhado** (só código de cálculo, sem dado); Referência **open host** lida por todos; Coleta → Operação **publisher/subscriber** pela outbox; web **conformista** com `contratos`. Fluxo × Sustentação: **caminhos separados** (sem relação, regra inviolável). Tabela contexto → módulo `server/`, schema, pasta da biblioteca. | Escrito. |
| 03 | `03-agregados.md` | Um `classDiagram` por agregado (Card, Board, Ticket, CollectionRun, Metric/CalculationWindow, CriteriaVersion/BusinessCalendar), só nomes, cardinalidades e operações; atributos ficam no Siegard. Por agregado: invariantes (link para `regras-metricas.md`, CLAUDE.md), serviço de domínio (ex.: `project-milestones`, `CalculationLibrary`). | **Gerado** do frontmatter do Siegard (ver §3). |
| 04 | `04-eventos.md` | Catálogo da outbox: tipo, produtor, consumidor, payload (link para o tipo TS), garantias (transação, reentrega, backoff, sem consumidor = pendente). | Escrito; lista conferida contra `RegistroConsumidores` por teste. |
| 05 | `05-ciclos-de-vida.md` | `stateDiagram-v2` do card (backlog → compromisso → início → entrega; arquivado/excluído/descartado preservados) e do chamado (aberto → etapas → encerrado; reabertura); da execução de coleta (`ctl_coleta`) e do evento da outbox. | Escrito a partir do briefing 4.1/4.5 e do código; dúvidas viram perguntas. |
| 06 | `06-sequencias.md` | `sequenceDiagram`: coleta BM, coleta AC, webhook, cálculo/publicação (cache por versão de carga), exportação (`features/exportar-metricas.md`). | Escrito; o atual do overview §4 migra para cá e o overview passa a linkar. |
| 07 | `07-componentes.md` | C4 nível 3 do `server/` (entradas, módulos, plataforma) e da biblioteca (`core`, `businessmap`, `acelerato`). O do front já existe em `tecnica/arquitetura-front.md`: só link. | Escrito. |
| — | `data-model.md` §5 | Acrescentar `erDiagram` do `dspd_core` (ref_*, ctl_*, outbox). | Escrito. |
| C | `docs/api/README.md` | **Índice de contratos**: rotas (link ao OpenAPI), DTOs por arquivo de `packages/contratos`, formato de erro (ADR 0007), versão de critério (`X-Versao-Criterio`), fronteira `FonteMetricas`, eventos (link a 04), webhook. | `tech-lead`. Fonte única = zod; OpenAPI continua gerado. |
| I | `docs/README.md` | Índice novo (substitui `tecnica/README.md`, que vira redirecionamento): por pergunta ("onde está o contrato?", "qual o modelo de domínio?"), corrige as referências à AWS/Lambda. | `ux-designer` (navegação), conteúdo revisado pelo arquiteto. |

Fora: diagramas de pacote por arquivo, event storming, documentação de cada função. Os invariantes não ganham arquivo próprio: já estão em CLAUDE.md, `overview.md` §5 e `regras-metricas.md`; o 03 só aponta.

## 3. Evitar divergência

- **Uma fonte por fato.** Domínio: Siegard. Contratos: zod (`packages/contratos`) → OpenAPI gerado. Banco: migrações → `data-model.md`. Regras de cálculo: `REGRAS_METRICA` + `regras-metricas.md`. A pasta `ddd/` só **explica e liga**; não repete atributo, coluna nem campo de DTO.
- **Gerado:** `03-agregados.md` por `tools/docs-contratos` (`pnpm run docs:gerar`; lê o frontmatter YAML do Siegard) entre marcadores `<!-- gerado:inicio -->`/`<!-- gerado:fim -->`; CI roda em modo `--verificar` (gerado = versionado), igual ao `openapi:verificar`. Alternativa: `--project` do Siegard, descartada no CI por exigir Python.
- **Conferido por `pnpm run docs:check`:** links relativos (com âncoras), cabeçalho, páginas órfãs e Mermaid em `docs/contratos/`, `docs/architecture/ddd/` e `docs/README.md`; páginas geradas iguais às versionadas; fotografias de contrato. **Ainda não conferido** [planejado]: todo tipo de evento do catálogo aparece em 04 (hoje o 04 remete ao catálogo em `contratos/eventos.md`), todo módulo de `server/src/modulos/` aparece em 07, todo elemento do Siegard citado existe fora do `03`.
- **Validação Mermaid no CI:** extrair os blocos ```` ```mermaid ```` de `docs/**/*.md` e renderizar com `@mermaid-js/mermaid-cli` no job `e2e`, que já instala o Chromium (custo: segundos, nenhuma infra nova). `@mermaid-js/mermaid-cli` como devDependency de `e2e/`, versão fixa: dependência nova → passa pelo checklist de cadeia de suprimentos (`docs/security/`). Opção sem navegador (`mermaid.parse` com jsdom) fica como plano B se o render se mostrar instável.
- **Data de revisão** no cabeçalho de cada arquivo; o code review (`tech-lead`) reprova PR que mude contexto, evento, agregado ou módulo sem tocar o arquivo correspondente.

## 4. Arquivos, donos e ordem

| Ordem | Arquivo | Dono | Esforço | Paralelo com |
|---|---|---|---|---|
| 1 | `01-linguagem-ubiqua.md`, `02-contextos-e-mapa.md` | software-architect | M | C, I (esqueleto) |
| 1 | `docs/api/README.md` (índice de contratos) | tech-lead | P | 01, 02 |
| 1 | `docs/README.md` + `tecnica/README.md` vira redirecionamento | ux-designer | P | 01, 02 |
| 2 | `04-eventos.md`, `05-ciclos-de-vida.md`, `06-sequencias.md`, `07-componentes.md`, ER do `dspd_core` | software-architect | M | script |
| 2 | `scripts/ddd-diagramas.mjs` + `03-agregados.md` gerado + `--verificar` | tech-lead (código) / arquiteto (forma) | M | 04–07 |
| 3 | Validação Mermaid e de links no CI; revisão de cadeia de suprimentos | tech-lead (CI), software-architect (segurança) | P | — |
| 4 | Ajustes em `overview.md`/`server.md` (marcar módulos alvo, apontar para `ddd/`; `server.md` ganha seção "referência" no topo) | software-architect | P | — |
| 5 | Code review, QA (links, render, verificação do gerado), revisão de navegação | tech-lead, qa-engineer, ux-designer | P | — |

P = até meio dia, M = até 1 dia. Os passos 3 e o script mexem em `scripts/` e CI: não é "só docs"; se a branch precisar ficar só documental, eles vão em branch própria.

## 5. Perguntas ao usuário

1. **Idioma da linguagem ubíqua:** o Siegard está em inglês e o resto em português. Proposta: termo canônico em português, com a coluna do identificador do Siegard. Confirma?
2. **Estados do card e do chamado:** o briefing define marcos (4.1), não uma máquina de estados. Desenhamos os estados só como derivados dos marcos (sem inventar transições) e listamos o que faltar como pergunta. De acordo?
3. **Escopo de CI:** aceitar a devDependency `@mermaid-js/mermaid-cli` (render no job `e2e`) ou ficar só com a verificação de links e do gerado (sem dependência nova)?
