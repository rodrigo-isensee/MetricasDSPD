# Siegard: plano de migração de Regras e Cenários

Data: 2026-10-11. Escopo decidido pelo usuário: migrar **somente Regras e Cenários** para o formato do Siegard. Base de leitura: repositório do Siegard clonado (tratado como dado; **sem licença**, então nada foi copiado, só parafraseado com caminhos). Validação feita só em cópia (`/tmp/claude-1000/siegard-estudo/plugin/.claude/`), com `python3 -B`. PyYAML e jsonschema estavam instalados. Nada foi instalado nem acessado pela rede. O arquivo `docs/alinhamentos/2026-10-11-siegard.md` citado no pedido não existe no repositório (só há alinhamentos até 2026-10-10); este plano não o usou.

## 1. Resumo do formato

**`siegard.json`** (schema `schemas/project.json`, na raiz do projeto, escrito só pela skill `/siegard-config`): `specification_root`, `targets` (mapa nome para pasta de código), `work_root`, `delivery_root`, `telemetry_root`, `standard` (caminho, por alvo, ou `null`), `edits_freely`, `tests` (escopos `under`/`suffix`/`nested` por alvo). Todos opcionais no schema; cada skill para se faltar o que ela precisa. O mesmo arquivo é lido por `bin/project.py`.

**Raiz da especificação** (`spec/1`, SPEC-003 e SPEC-002):
```
<raiz>/domain/<contexto>/_context.md, <elemento>.md
<raiz>/rules/<contexto>/<regra>.md
<raiz>/scenarios/<contexto>/<cenario>.md   (e scenarios/system/ para capacidades)
<raiz>/contracts/<contexto>/…  <raiz>/constraints/<slug>.md
<nó>.log.md  (log de decisão ao lado do nó)
```
Cinco classes fechadas: Domain Model, Rule, Scenario, Contract, Architecture Constraint.

**Identidade.** O ID é o caminho a partir da raiz, sem `.md` (`rules/metrics/minimum-sample-of-20`). Não existe campo `id`, `name` ou `class`. Referência é slug nu dentro do mesmo diretório e identidade completa fora. Renomear arquivo muda a identidade e exige atualizar todas as referências na mesma mudança. Slug: kebab-case, único por diretório.

**Nó Rule** (frontmatter YAML + corpo com `## Description`). Campos: `type` (`invariant` | `policy` | `state-machine`) e `statement` obrigatórios; `expression` opcional (o `statement` prevalece); `constrains` (lista de identidades `domain/<ctx>/<elemento>`) **obrigatório** em invariant e policy; `consistency` (`immediate`|`eventual`) obrigatório em policy que cruza agregado ou contexto, e imediato através de fronteira é erro; state-machine exige `subject`, `status`, `initial`, `transitions` e checa totalidade (todo par estado não terminal x gatilho é transição ou rejeição). `additionalProperties: false`. Regra não tem exemplos.

**Nó Scenario**: `subject` (exatamente uma âncora: elemento de Domain Model, Rule ou Contract, por identidade completa) e `given`/`when`/`then` (listas não vazias de strings) obrigatórios; `involves` opcional. Sem subtipos.

**Âncoras para o Domain Model.** Regra invariant/policy precisa apontar `constrains` para elementos que existem; elementos têm tipo fechado (`aggregate-root`, `entity`, `value-object`, `domain-service`, `enumeration`), cada um com atributos tipados (primitivos fechados ou outro elemento), e entidade, VO e enumeração precisam ser alcançáveis (senão "bloat" e erro). Cada contexto exige `_context.md` (`strategic`: core/supporting/generic) e pelo menos um elemento.

**Validação.** `python3 -B bin/spec.py <raiz>` (exit 0 sound, 1 problemas, 2 não roda). Aplica o schema por arquivo e depois checagens cruzadas. Também há `--node <arquivo>`, `--impact`, `--shape`, `--digest`, `--project` (gera diagramas e visão geral em `projections/`), `--decide` (acrescenta entrada no log).

**Erros recusados** (resultado real, teste negativo no piloto): contexto sem elemento; `statement` com mais de uma frase; campo de proveniência (`rationale`, `sources`, `gaps`, `proposal`); cenário apontando regra inexistente; `involves` com identidade inexistente. Ainda: referência quebrada, atributo `unknown`, composição cruzando agregado, policy imediata cruzando fronteira, state-machine não total, log sem nó.

**Como uma tarefa cita nós.** O nó de plano `task/<épico>/<slug>.md` (schema `plan-node.json`) lista os nós implementados em `implements`; o épico declara `covers`/`uncovered`. Depois da entrega, `bin/trace.py` grava em `siegard-trace.json` o hash do nó e dos arquivos que o implementam (drift em ambos os lados). Testes certificados ligam-se a nós pela certificação (SPEC-004). Nó de Rule/Scenario não tem campo apontando para teste: a ligação vive no trace e nos registros de entrega, fora do arquivo.

## 2. O que o plugin exige e conflita com o nosso projeto

| Exigência | Fonte | Conflito conosco |
|---|---|---|
| **Tudo em inglês (en-US)**: slugs, statements, linhas de cenário, logs. | SPEC-001 R12 (não checado por máquina; é julgamento da análise) | Nossa documentação e critérios são em português. O validador **não** recusa português, mas a norma do plugin e as skills dele assumem inglês. Conflita com a convenção do projeto de documentar em português. |
| Python 3 + PyYAML + jsonschema para validar | cabeçalho de `spec.py`/`project.py` | O projeto é Node/TS. Seria uma dependência nova no CI e no WSL (aqui estão instalados). Só leitura/validação, sem instalar nada no repositório se o plugin ficar fora do repo. |
| `siegard.json` na raiz | `project.py` | Arquivo novo, sem choque. `targets` mapeia bem para `server/`, `web/`, `packages/`. |
| Domain Model obrigatório como âncora de Rule invariant/policy | schema `rule.json` | Nosso material não tem Domain Model. Precisa de um mínimo (ver seção 4). |
| Uma frase por `statement`; sem exemplos na regra | SPEC-003 | Nossas regras do briefing têm várias condições por linha; terão de ser quebradas (ver custo). |
| Sem campos de proveniência; decisões vão para `.log.md` | SPEC-001 R8-R10 | Nossa convenção `pendente-usuario` / perguntas ao usuário não tem forma no nó. "Dúvida não se resolve por inferência" **colide** com o princípio do plugin "decidir e divulgar no log" (R4, R13). |
| `CLAUDE.md` com marcador de regras e hooks do plugin em toda sessão | `project.py`, `hooks/` | O plugin injeta suas regras nas sessões; sobrepõe-se ao nosso `CLAUDE.md` e aos agentes (`jarvis` etc.). Risco de instruções concorrentes. Só vale para quem instalar o plugin; migrar só os arquivos de spec não exige. |
| Fluxo próprio (`plan-work`, `implement-task`, `review-change`, `delivery_root`, `work_root`) | skills | Duplica o nosso fluxo (UX, arquitetura, backend, front, QA) e o Kanban. Não será adotado nesta fase (escopo: só Regras e Cenários). |
| Cenário só ancora em Domain/Rule/Contract | `scenario.json` | Critério de tela (testid, aria, microcopy) não tem âncora natural (seção 3). |

## 3. Inventário do nosso material

**Regras invioláveis.**
- `CLAUDE.md`: 12 regras invioláveis (sem avaliação individual; métricas proibidas; BusinessMap x Acelerato nunca se misturam; story/frente/projeto nunca no mesmo histograma; horas/dias úteis e percentis 50/85/95 em 12 semanas; mínimo 20; carga incremental sem sobrescrever; cálculo só pela biblioteca compartilhada; mudança de critério registrada; dúvida vira pergunta; ordem WS1/WS4, WS2/WS5, WS3; credenciais só em `.env` e MySQL somente leitura). As três últimas (ordem, credenciais, dúvida) são de processo/arquitetura, não de domínio.
- Briefing `docs/briefing-execucao-metricas.md`, seção 4 (linhas 100-142): marcos 4.1 (5), convenções 4.2 (cerca de 25 afirmações em blocos de código: tempo, distribuições, contagem, bug, colunas), taxonomia 4.3 (7 tipos + desempate), campos 4.4 (12 campos e 4 domínios fechados), modelo analítico 4.5 (3 tabelas). Seção 7: 7.1 (6 proibidas), 7.2 (4 metas), 7.3 (8 armadilhas).
- `docs/architecture/regras-metricas.md` (147 linhas) e `REGRAS_METRICA` em `packages/metricas/src/core/regras.ts` (432 linhas): **33 linhas de matriz** (11 O, 7 T, 3 E, 7 S, 4 EI, 1 composição) com 8 colunas cada, mais 6 propriedades testadas em `regras.property.test.ts` e 1 pergunta aberta (P1, 8 células `pendente-usuario`). É dado executável em TypeScript, usado por teste de propriedade.
- Estimativa de regras atômicas (uma condição por nó): cerca de **60 a 75** (12 do CLAUDE.md menos as 3 de processo = 9; ~25 de 4.2; 5 marcos viram elementos/atributos, não regras; 7.1 + 7.2 + 7.3 = 18; 6 propriedades; a matriz gera regras por métrica só onde difere da regra geral, cerca de 10).

**Cenários e critérios de aceite (251 itens contados).**

| Fonte | Itens | Natureza |
|---|---|---|
| `docs/ux/dashboard-metricas/especificacao.md` seção 10 (linha 1077) | **111** | Maioria é tela: rotas, testid, foco, contraste, filtros na URL. Parte pequena é regra de negócio (n<20, mock, sem pessoa). |
| `docs/ux/preferencias-metricas/06-especificacao.md` | **20** | Tela e preferências do usuário. |
| `docs/ux/integracao-real/05-especificacao.md` | **22** | Frescor, calibração, `/dados`; misto tela e dado. |
| `docs/qa/aceitacao/K-006, 007, 008, 023, 024, 025, 026` | **98** (18+15+12+23+9+11+10) | Entrada, saída esperada e regra: já no formato dado/quando/então, maior aderência. Ex.: n=19 sem percentil, T-BMAC, T-ARQ. |
| `docs/ux/exportar-metricas/` (01 a 04) | critérios de sucesso em `02-definicao.md`; **sem lista numerada de aceite** | Falta a especificação final; só há definição e protótipo. Não contado. |

Estimativa de quais cabem em Cenário: os **98 K-*** quase todos; dos 153 de UX, cerca de 25 a 40% (regra de negócio visível), o resto é UI (testid, aria, microcopy, layout) e não tem âncora no formato.

## 4. Proposta de mapeamento e layout

**Raiz.** `docs/especificacao/` (junto da documentação, versionada no git, lida por pessoas). Alternativas na seção 5. `siegard.json` na raiz do repositório com `specification_root: "docs/especificacao"` e `targets` (`server`, `web`, `packages`).

**Contextos** (diretório = namespace; dependem de decisão): `flow` (BusinessMap), `support` (Acelerato), `metrics` (cálculo compartilhado e publicação). O contexto separa por construção a regra "BusinessMap e Acelerato nunca se misturam".

**Domain Model mínimo** (só o que as regras ancoram, 4 a 8 elementos para a primeira leva): `metrics/statistic` (agregado: fonte, tamanho da amostra, janela, segmentação), `metrics/data-source` (enumeração), `flow/card` (agregado: arquivado, subtarefa, entregue em, motivo de descarte), `support/ticket`. Mais adiante: `card-kind` (taxonomia 4.3), classe de serviço, bloqueio. Elementos nunca ancorados são recusados por inalcançáveis.

**Granularidade.** Uma regra = uma condição = uma frase = um arquivo. Um cenário = um arquivo, âncora em uma regra. Seguindo a regra do plugin (SPEC-003 R4), cada nó tem arquivo próprio.

**ID.** Caminho: `rules/<contexto>/<slug-em-inglês>`. Não há campo para guardar o código antigo (`K-006 C1`, `4.2`, `O3`); ele iria no `## Description`.

**Regras que precisam de Domain Model para ancorar:** praticamente todas as de cálculo (precisam de `statistic`); as de card (arquivado, subtarefa, descarte, bug em 30 dias) precisam de `card`; "sem avaliação individual" também precisa de `statistic` (a segmentação). Regras de processo/arquitetura (credenciais em `.env`, ordem WS, MySQL somente leitura) **não cabem em Rule**: são Architecture Constraint ou processo, fora do escopo decidido.

**Piloto: 5 regras e 5 cenários** em `/tmp/claude-1000/siegard-estudo/piloto/` (fora do repositório), escritos em inglês:

- Regras: `rules/metrics/minimum-sample-of-20`, `rules/metrics/single-source-per-statistic`, `rules/metrics/no-individual-segmentation`, `rules/flow/archived-cards-stay-in-base`, `rules/flow/subtask-is-not-throughput`. Todas `invariant`.
- Cenários: `scenarios/metrics/nineteen-items-publish-nothing` e `twenty-items-publish-percentiles` (K-006 C1), `mixed-sources-are-refused` (T-BMAC), `scenarios/flow/delivered-then-archived-card-counts` (T-ARQ, só o ramo "entregue"; o ramo P1 fica de fora porque é pergunta aberta), `subtask-is-left-out-of-throughput` (briefing 4.2).
- Domain Model: 3 contextos, 4 elementos (`statistic`, `data-source`, `card`, `ticket`).

**Resultado real da validação** (`python3 -B .claude/bin/spec.py <piloto>`):
```
specification sound: 4 element(s), 5 rule(s), 5 scenario(s) across 3 context(s); 0 decision(s) disclosed
exit=0
```
Teste negativo, com as cinco quebras plantadas em cópia (sem log): o validador recusou todas e saiu com exit 1:
```
domain/support: holds no element — «a linguistic boundary with no language is not comprehensible» (SPEC-001 R2)
rules/flow/subtask-is-not-throughput: statement carries 2 sentences; …
rules/metrics/no-individual-segmentation: carries `rationale`, a provenance meta-field …
scenarios/flow/delivered-then-archived-card-counts: subject names rules/flow/nao-existe, which the specification does not hold
scenarios/metrics/mixed-sources-are-refused: involves[1] names domain/support/ticket, which the specification does not hold
5 problem(s) over 16 file(s); the specification is not sound while these stand.
```
`--impact rules/metrics/minimum-sample-of-20` listou, em um salto, o elemento ancorado e os dois cenários. `--shape` rodou, nada a apontar.

**O que o piloto mostrou onde o formato atrapalha:**
1. O validador **não** verifica idioma nem se o `statement` é realmente falsificável; "uma frase" se burla com ponto e vírgula (a própria spec diz que é "lombada", não parede).
2. Regra e cenário não apontam para o **teste** que os verifica. A ligação nó-teste vive no trace/certificação do fluxo do plugin. Sem adotar o fluxo, a rastreabilidade regra para teste teria de ser outra convenção nossa (por exemplo, o nome do teste citar a identidade).
3. Um cenário de tela (ex.: critério 8 "aviso Dados fictícios em todas as rotas") só ancora em Contract do tipo `capability` (que exige `contracts/system/...`), ou fica sem âncora. Tela não é o foco do formato.
4. Exigir Domain Model antes de regra inverte nossa ordem: a regra "mínimo 20" hoje existe sem entidade; aqui a regra só existe se alguém modelar `statistic`.

## 5. Decisões que cabem ao usuário

1. **Idioma dos nós.** (a) Inglês, conforme SPEC-001 R12: alinhado com o plugin e com o autor, e permite usar as skills dele sem atrito; custa tradução de termos do domínio (briefing em português; risco de deriva entre termos) e foge da convenção em português do projeto. (b) Português nos nós: preserva o vocabulário do negócio e a revisão pelo gerente de área; o validador aceita, mas contraria a norma e pode confundir as skills. (c) Slugs em inglês, `## Description` bilíngue, com o termo em português citado: meio-termo. **Recomendo (c)**: ID e statement em inglês, prosa com o termo em português e o código antigo (O3, K-006 C1). Reversível se o usuário preferir (a).
2. **Esquema de IDs.** (a) Caminho semântico em inglês, como o plugin manda (`rules/metrics/minimum-sample-of-20`); (b) tentar manter códigos (K-006-C1): impossível, o ID é o nome do arquivo e deve ser slug kebab. **Recomendo (a)** e registrar o código antigo no `## Description` como referência.
3. **Diretório da raiz.** (a) `docs/especificacao/` (visível, junto do briefing); (b) `spec/` na raiz do repositório (mais perto da convenção do plugin, mas poluí a raiz); (c) subpasta de `docs/` por contexto. **Recomendo (a).**
4. **Granularidade das regras.** (a) Uma condição por arquivo (obrigatório pelo formato, mais nós: 60 a 75); (b) agrupar por métrica: não passa na validação de uma frase. **Recomendo (a)**, aceitando o custo.
5. **Granularidade dos cenários.** (a) Migrar os 98 K-* e só os critérios de UX que expressam regra de negócio (cerca de 40 a 55); (b) migrar os 251, inclusive os de tela, forçando âncoras artificiais; (c) migrar só os K-*. **Recomendo (a)**; os critérios de UI ficam nas especificações de UX (são especificação de tela, não de comportamento de domínio).
6. **Domain Model mínimo.** (a) Criar só o que as regras ancoram (4 a 10 elementos); (b) modelar o domínio completo (card, bloqueio, transição, chamado, SLA): fora do escopo decidido, custo alto. **Recomendo (a)**, com o aviso de que isso é uma segunda classe (Domain Model) entrando contra a decisão de só Regras e Cenários: é inevitável porque Rule invariant/policy exige `constrains`. Precisa de confirmação explícita do usuário.
7. **Como ligar cada regra ao teste que a verifica.** (a) Convenção nossa: o nome do `describe`/`it` cita a identidade (`rules/metrics/minimum-sample-of-20`) e um script de CI confere que todo nó tem pelo menos um teste citando-o (e vice-versa); (b) adotar o trace do plugin (`siegard-trace.json`, certificação), que arrasta o fluxo `plan-work`/`implement-task`; (c) não ligar. **Recomendo (a)** (Node, sem Python), com `(b)` avaliado numa fase posterior.
8. **O que fazer com `REGRAS_METRICA`.** (a) Manter como está: é a tabela executável dos testes de propriedade; os nós em Markdown passam a ser a fonte legível, e um teste confere que as duas listas dizem o mesmo; (b) gerar a tabela a partir dos nós: o formato não tem campos de segmentação, mínimo ou granularidade, então exigiria extensão que o schema recusa (`additionalProperties: false`); (c) abandonar. **Recomendo (a)**, aceitando duas fontes por um tempo; fecha-se depois que as regras gerais estiverem migradas.
9. **Células `pendente-usuario` e perguntas ao usuário.** O formato manda decidir e divulgar no log; o nosso CLAUDE.md manda perguntar. (a) Não migrar a regra pendente (P1) até o usuário responder; ela continua em `regras-metricas.md`; (b) migrar com a decisão provisória registrada no `.log.md`: contradiz a regra inviolável. **Recomendo (a).**
10. **Validação e dependências.** (a) Rodar o `spec.py` do plugin fora do repositório (Python local); (b) portar a validação para Node (reimplementar): custo alto e sem licença para copiar; (c) não validar por máquina. **Recomendo (a)**, copiando o plugin para uma pasta fora do repo, sem instalar hooks nem skills dele no projeto nesta fase.
11. **Plugin e `CLAUDE.md`.** Instalar o plugin injeta suas regras em toda sessão e agentes. **Recomendo não instalar** nesta fase; só adotar o formato dos arquivos. Registrar a decisão para evitar conflito com o `jarvis`.
12. **Regras de processo e arquitetura** (ordem WS, credenciais, MySQL somente leitura, biblioteca compartilhada). (a) Ficam em `CLAUDE.md`/ADRs; (b) virar Architecture Constraint (fora do escopo decidido). **Recomendo (a)**.
13. **Licença.** O repositório não tem licença; só trabalhamos com o formato (a nossa especificação é nossa). Pedir ao autor (o gerente) uma licença ou autorização por escrito se o plugin for copiado para dentro do repositório.

## 6. Custo estimado e riscos

**Nós.** Regras: 60 a 75. Cenários: 98 (K-*) mais 40 a 55 de UX = cerca de 140 a 155. Domain Model: 4 a 10 elementos mais 3 `_context.md`. Total aproximado: **210 a 245 arquivos**. Logs de decisão só onde houver decisão (estimativa 20 a 40 arquivos).

**Esforço (estimativa, não medida).** O piloto de 5+5+7 arquivos saiu de uma leitura dirigida e levou poucos minutos de escrita, mas foi com termos óbvios. Escala linear dá cerca de 2 a 4 horas de agente para os 210 a 245 arquivos, mais revisão humana: a tradução e a quebra de "uma condição por frase" pedem julgamento (cerca de 20% voltam para revisão). Tokens: algo entre 300 mil e 600 mil, incluindo leitura das fontes e execução repetida do validador. A conferência regra-teste (decisão 7a) e o teste de paridade com `REGRAS_METRICA` (8a) são trabalho de Node a parte, estimado em uma ou duas tarefas pequenas.

**Riscos.**
1. Deriva entre duas fontes (briefing e nós; `REGRAS_METRICA` e nós) até a conclusão. Mitigação: nomes citados em teste e um teste de paridade.
2. Tradução distorce o domínio ("fila", "plantão", "aderência"); mudança de critério (T2.6) precisa continuar registrada por data, e o formato não tem campo de data/versão da regra. Fica no `git log` e no `.log.md`.
3. O validador é uma lombada, não uma parede (uma frase, sem checagem de idioma, sem checagem de que o cenário realmente exercita a regra). A cobertura real vem dos testes.
4. Autor único e sem licença: dependência de um formato ainda `proposed` (as specs do repositório trazem `status: proposed`), que pode mudar.
5. Python como dependência de revisão de PR no ambiente WSL/CI.
6. Regra "dúvida vira pergunta" contra "decide e divulga" do plugin: se o usuário aceitar o log como substituto, muda uma regra inviolável. Não decidir sem ele.
7. Escopo: o Domain Model entra como segunda classe sem ter sido decidida; sem ele, o formato não valida regra de domínio.
