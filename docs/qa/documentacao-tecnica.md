# Parecer de QA - documentação técnica

Propósito: registrar a validação (uma rodada) da entrega de documentação técnica: gate, teste de mutação, achabilidade e conferência contra o código. Público: tech-lead, arquiteto e usuário. Revisão: 2026-10-11.

Ambiente: worktree `MetricasDSPD-doc`, branch `docs/documentacao-tecnica`, HEAD c1eaf00; Node do projeto; Chromium do Playwright 1248 (`setup-chromium-local.sh` + `PUPPETEER_EXECUTABLE_PATH`). Acessibilidade (axe) não se aplica.

## Parecer
**Aprovado com ressalvas.** Gate e mutação passam. Há 1 defeito de achabilidade (média) e 1 de exatidão (média) a corrigir antes do PR; ambos são de documentação (sem código de produção). Nenhum defeito crítico ou alto.

## 1. Gate (resultado real)
| Comando | Resultado |
|---|---|
| `pnpm run pronto` | exit 0. spec-check 14, contratos 22, metricas 343, mock 107, server 239 passaram, web 559, docs-contratos 86 (cobertura 100% em linhas, ramos e funções). |
| `pnpm run docs:check` | exit 0: 282 páginas, 33 métricas, 2 eventos. |
| `pnpm run docs:mermaid` | exit 0: 54 diagramas renderizados sem erro. |

Ressalva de ambiente: no `server`, 9 arquivos e 44 testes ficaram `skipped` (testes com PostgreSQL, `pnpm run test:pg`, sem banco nesta máquina). Não foram executados por mim; o CI deve cobri-los. Sem o `eval` do setup do Chromium na mesma sessão, `docs:mermaid` falha com "Failed to launch the browser" (código 127): o erro é claro e é problema do ambiente.

## 2. Teste de mutação (em cópia temporária; nada commitado; cópia restaurada com `git checkout` após cada caso)
| ID | Mutação | Comando | Resultado | Mensagem |
|---|---|---|---|---|
| M1 | link para arquivo inexistente em `docs/README.md` | docs:check | FALHOU (exit 1) | `link quebrado para docs/especificacao/domain/NAOEXISTE.md` |
| M1b | âncora inexistente | docs:check | FALHOU | `âncora inexistente #nao-existe em ...padrao-de-documentacao.md` |
| M2 | removida a linha Propósito do cabeçalho de `eventos.md` | docs:check | FALHOU | `cabeçalho sem propósito nas 5 primeiras linhas` |
| M3 | sintaxe do diagrama (`stateDiagramXX-v2`) | docs:mermaid | FALHOU | `eventos.md:40: diagrama Mermaid não renderiza: Parse error on line 1` |
| M3a | mesma mutação | docs:check | **passou (exit 0)** | esperado pelo desenho: sintaxe só é checada em `docs:mermaid`; por isso o CI roda os dois (commit ba40298) |
| M3b | removido o título `###` do diagrama | docs:check | FALHOU | `diagrama sem título (### imediatamente acima)` |
| M3c | removida a legenda | docs:check | FALHOU | `diagrama sem legenda logo abaixo` |
| M4 | página gerada editada à mão (O3.md) | docs:check | FALHOU | `desatualizada; rode pnpm run docs:gerar` |
| S1 | schema O3: `cicloDiasUteis` number -> string | docs:check | FALHOU | exceção `exemplo de O3 não passa no schema` com lista Zod |
| S2 | schema O3: campo `titulo` removido | docs:check | FALHOU | `resultados/O3: mudança INCOMPATÍVEL ($.classes[].pontos[].titulo: campo removido (ou renomeado)). Entregue /api/v2 ... ou registre em snapshots/aceitas.json` |
| S3 | schema O3: campo obrigatório novo | docs:check | FALHOU | exceção `exemplo de O2 não passa no schema ... novoObrigatorio` |
| E1 | evento `coleta.concluida`: enum sem `parcial` | docs:check | FALHOU | `eventos/coleta.concluida: mudança INCOMPATÍVEL ($.status: valor "parcial" removido do enum)` |
| E2 | evento `bm.webhook.recebido`: regex do hash 64 -> 40 | docs:check | FALHOU | `exemplo de evento bm.webhook.recebido não passa no schema` |
| E3 | evento: `coletaId` renomeado | docs:check | FALHOU | `exemplo de evento coleta.concluida não passa no schema ... coleta` |
| C1 | controle: enum com valor NOVO (compatível) | docs:check | FALHOU (esperado) | `fotografia desatualizada ($.status: valor "cancelada" novo no enum); rode docs:fotografar` (compatível pede só atualizar a fotografia) |

Observação (baixa, DOC-03): em S1, S3, E2 e E3 a falha vem como exceção com stack trace (exemplo gerado não valida), sem a classificação INCOMPATÍVEL e sem a orientação de `/api/v2` das mutações S2/E1. Falha corretamente, mas a mensagem é menos útil.

## 3. Achabilidade a partir de `docs/README.md` (apenas links; caminho mínimo por busca em largura nos links Markdown)
| # | Tarefa | Cliques | Caminho | Resultado |
|---|---|---|---|---|
| 1 | Contrato da métrica O3 | **sem caminho** | `docs/contratos/metricas/O3.md` não é alcançável por link a partir do índice (nem `metricas/README.md`) | **FALHA** (DOC-01) |
| 2 | Mapa de contextos | 1 a 2 | README > `especificacao/domain/README.md` (1); ou > `architecture/ddd/README.md` > `02-contextos-e-mapa.md` (2) | ok |
| 3 | Catálogo de eventos | 2 | README > `contratos/README.md` > `eventos.md` | ok |
| 4 | Política de mudança de contrato | 2 | README > `contratos/README.md` > `politica-de-mudanca.md` | ok |
| 5 | Modelo de domínio | 1 | README > `especificacao/domain/README.md` | ok |
| 6 | ADR vigente do banco | 1 | README (tabela de ADRs) > ADR 0014 (0004 MySQL marcada como substituída) | ok |

Tempo: não cronometrei humano; com 1 a 2 cliques e tabelas de uma tela, 60 s é plausível nas tarefas 2 a 6. Os 6 destinos do roteiro do próprio README (tarefas 1 a 6 de lá) ficam a 1 clique, exceto `flow/_context.md` (2). O `docs:check` não detectou o problema da tarefa 1 (ver DOC-01).

## 4. Conferência por amostragem: 10 afirmações contra o código
| # | Afirmação (doc) | Código | Veredito |
|---|---|---|---|
| 1 | 8 tentativas, retenção 30 dias, reserva 5 min (`eventos.md`) | `server/src/plataforma/eventos/outbox.ts:10-12` | confere (doc cita :9, :10, :11: deslocado em 1) |
| 2 | Backoff 30 s dobrando, teto 1 h | `outbox.ts:13-14,17` | confere |
| 3 | Reserva com `FOR UPDATE SKIP LOCKED` | `outbox.ts:61` | confere |
| 4 | Cadastro recusa prefixo cruzado e consumidor duplicado | `server/src/plataforma/eventos/consumidores.ts:18,21` | confere |
| 5 | `coleta.concluida` publicado na transação que fecha a coleta, payload `{fonte, coletaId, status}` | `server/src/modulos/operacao/concluida.ts:25` | confere |
| 6 | Webhook idempotente por SHA-256, evento na mesma transação | `server/src/modulos/businessmap/webhook.ts:34-46` (`ON CONFLICT ... DO NOTHING`) | confere (faixa citada `:28-41` deslocada) |
| 7 | Prefixo `/api/v1` | `server/src/app.ts:61` | confere |
| 8 | Saída fora do schema vira 500 | `server/src/plataforma/erros.ts:39-41` | confere |
| 9 | Preferências `...:v1` e `CARTOES_RETIRADOS` | `packages/contratos/src/cartoes.ts:150,127` | confere; leitura inválida vira padrão em `web/src/features/preferencias/fonte.ts:42` |
| 10a | "schema Zod por tipo [planejado]; payload é `unknown`; consumidor lê com asserção" (`eventos.md` §1) | `server/src/plataforma/eventos/catalogo.ts:11-33` (schemas `.strict()`), `validarPayload` usado em `webhook.ts:37`; a asserção em `concluida.ts:36` existe | **desatualizado** (DOC-02) |
| 10b | "teste de compatibilidade entre fotografias: [planejado]" (`politica-de-mudanca.md:27`) | `tools/docs-contratos/src/cli.ts:60` (`conferirFotografias`), provado nas mutações S2/E1/C1 | **desatualizado** (DOC-02) |
| 10c | `openapi:verificar` em `server/package.json:27` | está em `server/package.json:30` | deslocado (baixa, DOC-04) |

## Bugs
| ID | Título | Severidade | Responsável |
|---|---|---|---|
| DOC-01 | Contratos por métrica inalcançáveis por link; `docs:check` não detecta | média | tech-lead (autor da doc; ajuste de `docs/` e do verificador) |
| DOC-02 | Textos "[planejado]" já realizados (schemas de evento e teste de compatibilidade) | média | tech-lead / software-architect (docs) |
| DOC-03 | Mutações S1, S3, E2, E3 falham com exceção bruta, sem classificação | baixa | tech-lead (ferramenta `tools/docs-contratos`) |
| DOC-04 | Referências `arquivo:linha` deslocadas em 1 a 3 linhas | baixa | tech-lead (docs) |

### DOC-01 - Contratos por métrica inalcançáveis por link
- Passos: abrir `docs/README.md`; seguir links até `docs/contratos/metricas/O3.md`. `docs/contratos/README.md` (linha 12) e `docs/contratos/http.md` (linha 6) ainda dizem "[planejado: ... ainda não existe neste commit]" e citam `docs/contratos/metricas/` sem link; `metricas/README.md` não tem link de entrada em `docs/` (busca em largura a partir do índice: inalcançável).
- Esperado: O3 a até 2 cliques; os 33 contratos e `metricas/README.md` linkados do índice de contratos.
- Obtido: nenhum caminho de links. O `docs:check` passa (a verificação de páginas órfãs não acusa o subgrafo, pois as páginas se referenciam entre si).
- Sugestão: linkar `metricas/README.md` em `contratos/README.md`, `http.md` e `docs/README.md`; remover o "[planejado]"; fazer a checagem de órfãs exigir alcance a partir de `docs/README.md`.
### DOC-02 - Textos "[planejado]" desatualizados
- Onde: `docs/contratos/eventos.md` §1 (schema Zod por tipo, `payload` como `unknown`) e `docs/contratos/politica-de-mudanca.md:27` (teste de compatibilidade), mais o "[planejado]" do item 1 de `docs/engineering/contratos-plano.md`.
- Esperado: a doc descreve o que existe (catálogo `catalogo.ts`, `validarPayload`, `docs:check` classifica mudança incompatível).
- Evidência: itens 10a e 10b da seção 4.
### DOC-03 - Mensagem bruta nas mutações de exemplo inválido
- Reproduzir: alterar `cicloDiasUteis` para `z.string()` em `packages/contratos/src/schemas.ts` e rodar `pnpm run docs:check`. Obtido: stack trace com `exemplo de O3 não passa no schema`. Esperado: linha `problema` única indicando a métrica e o caminho, como em S2.
### DOC-04 - Linhas citadas deslocadas
- Exemplos: `outbox.ts` (doc :9-16, real :10-17), `server/package.json:27` (real :30), `webhook.ts:28-41`. Esperado: citações corretas; considerar citar o símbolo em vez do número.

## Resultado da execução
Data: 2026-10-11. Gate verde; mutações: 15 de 15 detectadas (3 de forma menos útil: DOC-03; sintaxe Mermaid só em `docs:mermaid`); achabilidade: 5 de 6 tarefas ok; amostragem: 8 de 10 confirmadas, 2 desatualizadas. Reteste após correção de DOC-01 e DOC-02 antes do PR.
