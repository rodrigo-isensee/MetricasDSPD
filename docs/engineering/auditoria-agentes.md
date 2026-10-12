# Auditoria do setup de agentes

2026-10-11 · tech-lead · branch `chore/praticas-agentes` (base `origin/develop`, `d27b988`). Só diagnóstico e proposta: nada aqui foi aplicado.

Fontes lidas: `CLAUDE.md`, `.claude/agents/*.md`, `.claude/skills/*/SKILL.md`, `.claude/settings.json`, `.githooks/pre-push`, `docs/engineering/praticas.md`, `docs/engineering/economia-de-tokens.md`, `docs/engineering/guia-do-desenvolvedor.md`, `docs/kanban/melhorias.md`, `docs/retrospectivas/2026-10-10-001.md`, 37 pareceres em `docs/reviews/` e os relatórios de `docs/qa/`, além de `eslint.config.js`, `package.json` e `.github/workflows/ci.yml`. O arquivo `docs/engineering/melhoria-continua.md` citado no pedido **não existe**: no lugar dele, usei `docs/kanban/melhorias.md` e `economia-de-tokens.md`.

Neste documento, mudanças em `.claude/agents/*.md` e no `CLAUDE.md` dependem de aprovação do usuário (política do `agile-coach`). Elas estão separadas no grupo B (seção 9).

---

## 1. Custo fixo de contexto por execução

Estimativa: bytes ÷ 4 ≈ tokens. O texto é em português UTF-8, então a conta subestima um pouco. Cada execução carrega o `CLAUDE.md` (5.978 B), o corpo do agente, as skills listadas em `skills:` no frontmatter (pré-carregadas) e cerca de 2k tokens do hook do Siegard.

| Agente | Agente (B) | Skills pré-carregadas (B) | Total fixo (B) | ≈ tokens fixos | Leituras "obrigatórias" a mais |
|---|---|---|---|---|---|
| jarvis | 11.581 | kanban-scrum 8.885 (pedido explícito no corpo) | 26.444 | **≈ 8.600** | KANBAN.md 14,6 KB + historico.md 21,3 KB ≈ 9k |
| agile-coach | 2.588 | kanban-scrum 8.885 | 17.451 | ≈ 6.400 | historico.md ≈ 5,3k |
| software-architect | 2.776 | software-architecture 2.835 + cyber-security 4.842 | 16.431 | ≈ 6.100 | "Leia `docs/architecture/`" inteiro (15 ADRs) |
| tech-lead | 2.890 | engineering-practices 4.162 | 13.030 | ≈ 5.300 | praticas.md 18,7 KB ≈ 4,7k |
| ux-designer | 2.920 | ux-design 3.944 | 12.842 | ≈ 5.200 | spec de UX do pedido |
| qa-engineer | 1.603 | qa-testing 2.926 | 10.507 | ≈ 4.600 | plano de testes 89 KB ≈ 22k quando lido inteiro |
| node-backend | 1.500 | node-backend 2.413 | 9.891 | ≈ 4.500 | "as ADRs em `docs/architecture/adr/`" (todas) |
| react-frontend | 1.208 | react-frontend 2.266 | 9.452 | ≈ 4.400 | — |

O `CLAUDE.md` também manda ler as seções 00 a 04 do briefing "antes de qualquer tarefa": são 16.878 B, ≈ **4,2k tokens por execução**, inclusive em tarefas de commit, de quadro ou de UX. Somando as leituras obrigatórias, o custo real por execução de especialista fica entre **9k e 11k tokens** antes de qualquer trabalho. A `economia-de-tokens.md` registra cerca de 170 execuções por sessão, o que dá **≈ 1,5M a 1,9M tokens de custo fixo por sessão**.

## 2. Causas recorrentes de retrabalho (evidência)

| # | Causa | Evidência | Por que acontece |
|---|---|---|---|
| R1 | Coisa que a máquina deveria pegar chegou ao review ou ao QA | 2 bloqueantes de typecheck do `e2e/` (`001-K-016-r1`, `001-B1-r1`); `pnpm run pronto` **vermelho** levado ao review (`002-K-017-r1`, B3); CLS a 375 px e rolagem a 320 px só no QA final (bugs 007 e 008); `pnpm run gate` inexistente na raiz (`docs/qa/develop-pre-pr.md`) | O portão é instrução em texto ("rode antes"), não barreira; nada impede commitar ou pedir review com o `pronto` vermelho |
| R2 | Regra de negócio interpretada no código | O7 com semana parcial (`001-fase-a`), S4 agregando P1 a P5, unidade de tempo de `docs/api/metricas.md` (dias úteis × horas úteis × dias corridos) | Agente lê o briefing inteiro sem foco e infere; a matriz de regras (M-005) só pegou parte |
| R3 | Árvore de trabalho compartilhada entre agentes paralelos | Timeouts de `app.test.tsx` sob CPU disputada (`develop-pre-pr-r1`, `002-K-017-r1` B3); o `pre-push` deixa passar falha "com árvore suja"; merge antecipado 7d5bf9f (retro 001) | Instâncias paralelas no mesmo diretório; o hook tem uma brecha deliberada |
| R4 | Rodadas repetidas e relançamentos | K-017 r1→r3, K-014/K-033/K-034-F em r2; revisores relançados em duplicata às 20:16 (retro 001) | Sem prompt-padrão com critério de pronto e formato de saída; Jarvis leu agente lento como falhado |
| R5 | Documentação e instruções desatualizadas | Skills ainda citam MySQL e Prisma; `praticas.md` §9 descreve a `feature/dashboard-mock`; o Jarvis diz que "não há `gh`" | Mudanças de decisão (ADR 0014, PR #17, pedido 009) não propagaram para agentes e skills |
| R6 | Ambiente ausente | 9 testes de banco pulados em 2 rodadas (sem Docker); `container_name` fixo colidindo | Resolvido em parte no pedido 009; falta a pré-condição no prompt |

## 3. Duplicações

| Conteúdo | Onde aparece | Proposta |
|---|---|---|
| "A main é do usuário" + hook + `--no-verify` | `CLAUDE.md`, `jarvis.md`, `tech-lead.md`, skill `engineering-practices`, `praticas.md` §9 (5 cópias) | Já é imposto pelo hook e pelo `deny` do `settings.json`. Fica 1 linha no `CLAUDE.md`; as demais viram ponteiro ou são removidas |
| Tabela do time | `CLAUDE.md` e `jarvis.md` (o Jarvis carrega as duas) | Remover do `jarvis.md` |
| Fluxo upstream/downstream e paralelismo | `CLAUDE.md`, `jarvis.md` (2 seções), `ux-designer.md`, `software-architect.md`, `kanban-scrum` | Fonte única no `jarvis.md`; o `CLAUDE.md` fica com 3 linhas |
| Checklist de code review | skill `engineering-practices` (9 itens) e `praticas.md` §8 (11 itens) | Fica só o `praticas.md` (que prevalece); a skill aponta para ele |
| Orçamento de performance | `jarvis.md` e ADR 0003 / `praticas.md` §5 | Remover do `jarvis.md` e apontar para a ADR 0003 |
| Regras invioláveis | `CLAUDE.md` e `praticas.md` §3 | Aceitável: o `praticas.md` traduz para código. Manter |

## 4. Contradições

| # | Tema | Conflito | Fonte que deve valer |
|---|---|---|---|
| C1 | **Quem commita** | `CLAUDE.md` e `jarvis.md` (com o pedido 005) dizem que os commits são do tech-lead e que o Jarvis "não commita". `praticas.md` §9 diz que os devs, a UX e o QA commitam na `develop` e que o Jarvis commita quadro e configuração | `praticas.md` §9 (decisão do usuário). Ajustar `CLAUDE.md` e `jarvis.md` |
| C2 | **Branches e PR** | `praticas.md` §9: "a `develop` nunca vira PR", integração `--no-ff` na `feature/dashboard-mock`. A realidade: o PR #17 mesclou a `develop` na `main`, e as branches novas saem de `origin/develop`. A skill diz "Branches a partir da `main` atualizada" e `merge origin/main` | Decisão a confirmar com o usuário (pergunta P1); depois, uma regra só |
| C3 | **Banco** | `tech-lead.md` ("esquema (MySQL)") e skill `engineering-practices` ("MySQL 8", `DATETIME(3)`) contra a ADR 0014, o `praticas.md` §6 e o `CLAUDE.md` (PostgreSQL 17, `pg` puro) | ADR 0014 |
| C4 | **ORM e estrutura do server** | Skills `node-backend` e `software-architecture`: Prisma, `modules/<recurso>.service.ts`, `packages/shared`. O código e a ADR 0014 usam `pg` puro, `server/src/modulos/.../servico.ts` e `packages/contratos` | ADR 0014 e ADR 0002 |
| C5 | **QA e revisão em toda correção** | `CLAUDE.md` ("todo desenvolvimento passa pelo QA, sem exceção") e `jarvis.md` ("inclusive correções pequenas; QA revalida depois de qualquer correção") contra `economia-de-tokens.md` §1 ("correção pequena é conferida pelo autor") | Decisão do usuário (P2). Proposta: o QA continua obrigatório **por entrega**, e a correção pequena é revalidada pelo teste automatizado mais o CI |
| C6 | **Discovery adiantado** | `CLAUDE.md`, `jarvis.md`, `ux-designer.md` e `software-architect.md`: "o discovery corre à frente; adiante as próximas fases". `economia-de-tokens.md` §6: "nenhum protótipo ou discovery novo sem pedido" | Economia (é a mais recente). Tirar "adiantar" dos agentes |
| C7 | **Cerimônias e quadro** | `jarvis.md`: atualizar o quadro "a cada mudança de estado", 5 tipos de reunião, agile-coach nas reuniões. Economia §3: quadro em lote por entrega, sem acionar o agile-coach, retro só no fim | Economia, com a ressalva da retro 001 (o histórico ficou com 2h11 de lacuna) |
| C8 | **Portão antes do commit** | `praticas.md` §7 e §9: `pnpm run check` (sem cobertura), "até a extração, em `web/`" (obsoleto). Guia: `pnpm run pronto` antes de cada commit. Economia §5: o agente roda só o teste do que mexeu | `pnpm run pronto` (ele carrega a cobertura de 100% e o build), carimbado por hook (G2), uma vez por commit |
| C9 | **Cobertura 100%** | Imposta por `thresholds` 100/100/100/100 nos 5 workspaces e no CI (`pnpm run cobertura`), mas ausente do `praticas.md`, da skill `engineering-practices` e da skill `qa-testing` | Registrar no `praticas.md` §4/§7 com a política de exclusão (`/* v8 ignore */` só com motivo) |
| C10 | **`gh`** | `jarvis.md`: "Não há `gh` instalado". `/usr/bin/gh` existe e o `settings.json` já tem `ask` para `gh pr merge` | Atualizar: `gh pr create` permitido; merge continua com o usuário |
| C11 | **Caminho da spec de UX** | `qa-engineer.md` lê `docs/ux/<feature>.md`; a UX escreve em `docs/ux/<demanda>/especificacao.md` | A da skill `ux-design` |
| C12 | **Orçamento** | `jarvis.md`: LCP < 2,5 s, bundle < 250 KB, filtro < 200 ms. ADR 0003: LCP < 2,0 s, bundle < 200 KB, filtro < 100 ms | ADR 0003 |

## 5. Instruções que deveriam ser hooks ou gates determinísticos

| Instrução em texto hoje | Situação real | Gate proposto |
|---|---|---|
| "Nunca commitar na `main`" | Só o push é bloqueado. O pedido 005 registra commits na `main` local (`6a99116`, `34e8940`) | `.githooks/pre-commit`: recusa quando `git branch --show-current` = `main` |
| "`pronto` verde antes de cada commit" | `pronto` vermelho chegou ao review (K-017 B3) | `pre-commit` exige o carimbo `$(git rev-parse --git-dir)/pronto-ok` = `git write-tree`, gravado pelo `pronto` quando passa. Commits só de `*.md` e `docs/` ficam isentos |
| `Math.min/max` com spread proibido "em todos os pacotes" (`praticas.md` §2) | O lint cobre `web/src` e `packages/`, mas o `server/` é ignorado na raiz e o `server/eslint.config.js` não tem a regra. Já existem `server/src/plataforma/db/seed.ts:41` (`Math.min(...cards.map(...))`, sobre a base inteira) e `server/src/modulos/referencia/servico.ts:45` (2 elementos, inofensivo) | Levar `semSpreadEmMinMax` para o `server/eslint.config.js`; corrigir o `seed.ts:41` (dono: `node-backend`) |
| `pre-push` bloqueia lint/typecheck | Com a árvore suja, só avisa e segue | Com worktree por agente (seção 7), remover a brecha; enquanto isso, mantê-la |
| "Nunca `--no-verify` / `--force`" | Já está no `deny` do `settings.json` | OK. Falta `Bash(git commit*--no-verify*)`, coberto pelo padrão `git * --no-verify*`. OK |
| "Não mexer em `.claude/agents` sem aprovação do usuário" | Só texto | Hook `PreToolUse` (Write/Edit) que pede confirmação (`ask`) para `.claude/**` e `CLAUDE.md`: entrada `ask` no `permissions` com `Edit(.claude/**)`, `Write(.claude/**)`, `Edit(CLAUDE.md)` |
| "QA não altera código de produção" | Só texto | Opcional. `hooks` no frontmatter do subagente, se a versão 2.1.296 suportar; validar antes |
| "Parecer de review e de QA antes de enviar" | Só texto | Job de CI em `pull_request` que falha se o corpo do PR não tiver links para `docs/reviews/` e `docs/qa/` (barato, determinístico) |

## 6. Conhecimento que deveria virar skill sob demanda

| Hoje | Peso | Proposta |
|---|---|---|
| `jarvis.md`: "Reuniões de alinhamento" e "Orçamento" | ≈ 3,3 KB | Nova skill `alinhamento` (pauta, tipos, ata), lida só quando houver reunião. O orçamento vira link para a ADR 0003 |
| `kanban-scrum` lida inteira pelo Jarvis | 8,9 KB | Separar em duas: `kanban-quadro` (colunas, WIP, formato de cartão e de linha do histórico, ≈ 2,5 KB) para o Jarvis, e `kanban-scrum` (métricas, retro, experimentos) para o agile-coach |
| `cyber-security` pré-carregada no arquiteto | 4,8 KB | Tirar do `skills:`. O corpo já diz "leia quando houver mudança sensível" |
| Briefing 00 a 04 "antes de qualquer tarefa" | 16,9 KB | Ler só quando a tarefa toca regra de cálculo, coleta ou contrato, e só as seções apontadas no prompt. As invioláveis já estão no `CLAUDE.md` |
| `praticas.md` §9 (integração, extração D3) | ≈ 3,5 KB | Mover o procedimento de integração para uma skill `git-integracao` do tech-lead; os devs precisam de 4 linhas |
| Skill `engineering-practices` genérica (e com MySQL) | 4,2 KB | Reduzir a ponteiro para `praticas.md` e aos dois itens que só existem nela (dependência nova, descrição do PR) |

## 7. Ferramentas por agente

| Agente | Ferramentas | Observação |
|---|---|---|
| jarvis | Agent, Read, Grep, Glob, Bash, Write, Edit, TodoWrite | Coerente com quadro e config. "Não implementa" é só texto. Aceitável |
| software-architect | + WebFetch, sem Bash | Sem Bash ele não roda `git` nem os comandos de `EXPLAIN` do `praticas.md` §6, que ficam com o back. WebFetch: manter (documentação de bibliotecas) |
| ux-designer | + WebFetch | Pouco usado. Pode sair, ganho pequeno |
| qa-engineer | Write/Edit em tudo | Os limites do texto proíbem mexer em produção. Ver gate opcional da seção 5 |
| agile-coach | Bash | Só precisa de `git log`/`date`. Aceitável |
| node-backend, react-frontend | Bash livre | Precisam rodar testes. Merge, rebase e push são proibidos por texto (§9); o `pre-push` só protege a `main` |

Conclusão: o excesso de ferramentas não é o problema principal. As barreiras importantes devem ser hooks (seção 5), não remoção de ferramentas.

## 8. Ausências

**Prompt-padrão de delegação.** O `jarvis.md` lista 5 itens ("objetivo, entradas, entrega, restrições, critério"), mas não há molde. Faltam: cartão e pedido, worktree e branch, leitura dirigida (arquivo e seção, não o documento inteiro), comando exato de pronto, quem commita, modelo, tamanho da resposta e pré-condições de ambiente (Docker, Chromium). Os efeitos estão em R3, R4 e R6.

**Registro de tokens por entrega.** `historico.md` e `KANBAN.md` não registram tokens. A política de economia não tem como ser medida: nenhum dado mostra se ela reduziu o consumo. O resultado de cada `Agent` já traz o total de tokens, e um hook `SubagentStop` pode gravá-lo sem depender da memória do Jarvis.

## 9. Cinco achados de maior retorno

1. **Regras contraditórias levam o agente a escolher uma delas e gerar retrabalho (C1, C2, C5 a C8).** As duas políticas (`jarvis.md`/`CLAUDE.md` × `economia-de-tokens.md`/`praticas.md` §9) convivem sem dizer qual prevalece.
2. **O portão é texto, não barreira (R1).** Commit na `main` local é possível, o `pronto` vermelho chega ao review, e o spread de `Math.min/max` já entrou no `server/`.
3. **O custo fixo é dominado por leitura obrigatória, não pelo agente.** São ≈ 4,2k tokens do briefing, ≈ 4,7k do `praticas.md` e ≈ 2,2k da `kanban-scrum` no Jarvis por execução; o Jarvis sozinho carrega ≈ 8,6k fixos.
4. **Sem prompt-padrão nem worktree por agente**, o paralelismo gera testes instáveis, brecha no pre-push, relançamentos duplicados e rodadas r2/r3.
5. **Skills e agentes desatualizados (MySQL, Prisma, `gh`, orçamento) e consumo de tokens não medido.** Nenhuma dessas decisões se propaga sozinha, e nenhuma melhoria pode ser verificada.

## 10. Mudanças propostas, ordenadas por retorno

### Grupo A: não mudam `.claude/agents/*.md` nem `CLAUDE.md` (decisão do time; código passa por review e QA)

**A1. `pre-commit` com main bloqueada e carimbo do `pronto`.** Ganho: fecha R1 (cerca de 3 bloqueantes por pedido) e o commit na `main` local. Risco: atrito em commit urgente, mitigado pela isenção de docs. A falha é visível e reversível.
```diff
+ .githooks/pre-commit
+#!/usr/bin/env bash
+# Commit na main é do usuário; código só com `pnpm run pronto` verde sobre exatamente o que está em stage.
+[ "$(git branch --show-current)" = main ] && { echo "pre-commit: commit na main bloqueado." >&2; exit 1; }
+git diff --cached --name-only | grep -qvE '(^docs/|\.md$)' || exit 0
+carimbo="$(cat "$(git rev-parse --git-dir)/pronto-ok" 2>/dev/null)"
+[ "$carimbo" = "$(git write-tree)" ] || { echo "pre-commit: rode 'pnpm run pronto' com estas mudanças em stage." >&2; exit 1; }

  package.json
-    "pronto": "pnpm run lint && pnpm run format:check && pnpm -r --if-present run pronto",
+    "pronto": "pnpm run lint && pnpm run format:check && pnpm -r --if-present run pronto && git write-tree > \"$(git rev-parse --git-dir)/pronto-ok\"",
```
O `git rev-parse --git-dir` é por worktree, então cada worktree tem o próprio carimbo.

**A2. Regra de spread no `server/`.** Ganho: cumpre o `praticas.md` §2 e pega o `seed.ts:41`. Risco: baixo; exige corrigir as 2 ocorrências (`node-backend`).
```diff
  server/eslint.config.js
+  // Math.min/max com spread proibido (ADR 0003, praticas §2), como na raiz.
+  { files: ['src/**/*.ts'], ignores: ['**/*.test.ts'],
+    rules: { 'no-restricted-syntax': ['error',
+      { selector: "CallExpression[callee.object.name='Math'][callee.property.name=/^(min|max)$/] > SpreadElement",
+        message: 'Math.min/max com spread estoura a pilha (ADR 0003): use minimo()/maximo() ou um laço.' }] } },
```

**A3. `praticas.md` como fonte única e atualizada (C1, C2, C3, C8, C9).** Ganho: elimina a classe R5 e encurta o documento em ≈ 3,5 KB. Risco: nenhum técnico; o C2 depende da resposta P1 do usuário.
```diff
  docs/engineering/praticas.md
- §7.1 `pnpm run check` verde (...) e `pnpm run build` verde: até a extração, em `web/`; depois, na raiz
+ §7.1 `pnpm run pronto` verde na raiz (lint, format, typecheck, cobertura 100% em todos os workspaces, build, size); carimbado pelo pre-commit
+ §4   Cobertura 100% (linhas, ramos, funções, instruções) em contratos, metricas, mock, web e server; exclusão só com `/* v8 ignore */` + motivo, aprovada no review
- §9   (integração na feature/dashboard-mock, "a develop nunca vira PR")
+ §9   [conforme P1] branches de trabalho saem de origin/develop; PR develop → main validado pelo usuário; procedimento detalhado na skill git-integracao
+ Cabeçalho: "Em conflito com instrução de agente ou skill, vale este arquivo; economia-de-tokens.md vale para cerimônia e rodadas."
```

**A4. Skills corrigidas e enxutas (C3, C4, seção 6).** Ganho: ≈ 1,2k tokens a menos por execução do arquiteto (`cyber-security` sob demanda), ≈ 0,7k no tech-lead, e o fim das instruções erradas (Prisma, MySQL). Risco: baixo.
```diff
  .claude/skills/engineering-practices/SKILL.md
- description: ... (TypeScript, Node, React, MySQL) ...
- ## Modelagem e banco (MySQL 8) ... (seção inteira)
- ## Checklist de code review ... (9 itens)
- - Branches a partir da `main` atualizada ...
+ As regras do projeto estão em docs/engineering/praticas.md (prevalece): §6 modelagem PostgreSQL, §8 checklist, §9 git.
  .claude/skills/node-backend/SKILL.md e software-architecture/SKILL.md
- Prisma como ORM / acessado via Prisma / modules/<recurso>.service.ts / packages/shared
+ pg puro + node-pg-migrate (ADR 0014); server/src/modulos/<recurso>/{rotas,servico,repositorio}.ts; packages/contratos (ADR 0002)
  .claude/skills/kanban-scrum/SKILL.md → dividir: nova .claude/skills/kanban-quadro/SKILL.md (Quadro, Formato do cartão, Histórico)
+ .claude/skills/alinhamento/SKILL.md (conteúdo de "Reuniões de alinhamento" do jarvis.md, orçamento → link ADR 0003)
+ .claude/skills/git-integracao/SKILL.md (praticas §9 detalhado, extração D3)
```

**A5. Registro de tokens por entrega.** Ganho: mede a política de economia e permite comparar pedidos. Risco: os campos do JSON do `SubagentStop` na 2.1.296 precisam ser validados (o script falha em silêncio, nunca bloqueia).
```diff
  .claude/settings.json
+  "hooks": { "SubagentStop": [ { "hooks": [ { "type": "command",
+      "command": "node .claude/hooks/registrar-tokens.mjs" } ] } ] }
+ .claude/hooks/registrar-tokens.mjs: lê o JSON do stdin; soma `usage` (input, cache_read, cache_creation, output) do
+   transcript do subagente; anexa em docs/kanban/tokens.csv: data,agente,cartao(da 1ª linha "Cartão: K-xxx" do prompt),tokens,exit 0 sempre
+ docs/kanban/historico.md: na linha que fecha a entrega, coluna "Tokens" = soma do tokens.csv do cartão
```

**A6. Confirmação para editar a configuração do time.** Ganho: barreira determinística para a regra "mudança em agente precisa do usuário". Risco: um prompt a mais quando a mudança já foi aprovada.
```diff
  .claude/settings.json  "permissions"
-    "ask": ["Bash(gh pr merge*)", "Bash(gh api * -X PUT*)"]
+    "ask": ["Bash(gh pr merge*)", "Bash(gh api * -X PUT*)",
+            "Edit(./.claude/**)", "Write(./.claude/**)", "Edit(./CLAUDE.md)", "Write(./CLAUDE.md)"]
```

**A7. CI exige os links de pareceres no PR.** Ganho pequeno (o portão de QA hoje é cumprido) e risco baixo. Job `pareceres` em `pull_request`: `grep -q 'docs/reviews/' && grep -q 'docs/qa/'` sobre o `github.event.pull_request.body`.

### Grupo B: mudam `.claude/agents/*.md` ou `CLAUDE.md` (precisam de aprovação do usuário)

**B1. Prompt-padrão de delegação no `jarvis.md`** (substitui "Como escrever o pedido para um agente"). Ganho: ataca R3, R4 e R6, com menos releitura e menos relançamento. Risco: baixo.
```diff
  .claude/agents/jarvis.md
-## Como escrever o pedido para um agente
-(5 itens)
+## Prompt-padrão de delegação (copiar e preencher)
+Cartão: K-xxx · Pedido: NNN · Worktree: ../MetricasDSPD-<cartão> · Branch: <nome> (base <ref>) · Modelo: haiku|sonnet|opus
+Objetivo (1 frase) e por quê.
+Ler só: <arquivo §seção>, <arquivo §seção>. Não reler documentos inteiros.
+Entregar: <arquivos>. Commit: <quem> | sem commit.
+Pronto quando: <comando exato, ex. pnpm run pronto> verde + <critério>.
+Pré-condições: <Docker/Chromium/nenhuma>. Decisões já tomadas: <...>. Fora de escopo: <...>.
+Resposta: no máximo 5 linhas (resultado real, arquivos, pendências). Antes de relançar: conferir se a instância anterior ainda roda.
```

**B2. Enxugar o `jarvis.md` (11,6 KB para cerca de 6 KB).** Ganho: ≈ 1,5k tokens fixos por turno do Jarvis (o agente mais executado), mais ≈ 1,6k ao ler `kanban-quadro` em vez de `kanban-scrum`. Também resolve C5, C6, C7, C10 e C12. Risco: perder uma nuance da cerimônia; mitigado porque o conteúdo vai para a skill `alinhamento`.
```diff
- ## Time (tabela)                                   → remover (já está no CLAUDE.md)
- ## Reuniões de alinhamento (inteira) + Orçamento   → "Reuniões: skill `alinhamento`, só nos marcos kickoff e pré-entrega."
- Siga a skill `kanban-scrum` (leia .claude/skills/kanban-scrum/SKILL.md)
+ Siga a skill `kanban-quadro`. Quadro e histórico atualizados em lote por entrega, com `date` no ato.
- Discovery corre à frente da entrega (dual-track)...
+ Discovery só sob pedido do usuário (economia-de-tokens §6).
- Toda mudança de código passa pelo QA, inclusive correções pequenas ... Depois de qualquer correção, o QA revalida
+ QA por entrega (P2); correção pequena revalidada pelo teste que a cobre + CI; o QA reabre se for regra de negócio ou componente compartilhado.
- Decisões de commit são do tech-lead ... não commita por conta própria.
+ Commits conforme praticas.md §9 (devs, UX e QA na develop; Jarvis só quadro e config; tech-lead integra e prepara o PR).
- Não há `gh` instalado: entregue o link de comparação
+ `gh pr create` permitido para abrir o PR; merge é sempre do usuário.
```

**B3. `CLAUDE.md` mais curto e sem contradição.** Ganho: ≈ 4,2k tokens por execução que não toca regra de cálculo, aplicado a todos os agentes; com cerca de 170 execuções, **≈ 0,5M a 0,7M tokens por sessão**. Risco: um agente pular o briefing quando precisava. Mitigação: o prompt-padrão (B1) aponta as seções.
```diff
- Leia as seções 00 a 04 antes de qualquer tarefa.
+ Leia as seções 00 a 04 antes de tarefa que toque cálculo, coleta, contrato ou painel; nas demais, as regras abaixo bastam.
- **Upstream (discovery)** ... **Downstream (entrega)** 1. a 7. (bloco inteiro)
+ Fluxo: discovery (UX + arquiteto) sob pedido → plano técnico → implementação → code review → QA → revisão de UX → PR. Detalhe no jarvis.md.
- 2. `tech-lead` cria a branch; ...   6. `tech-lead` envia a branch e prepara o pull request.
+ Commits e branches: docs/engineering/praticas.md §9 (prevalece sobre agentes e skills).
+ Em conflito entre documentos: ADR > praticas.md > economia-de-tokens.md > agente > skill.
```

**B4. Agentes especialistas: correções pontuais.** Ganho: fim de C3, C6 e C11 e leituras mais dirigidas. Risco: baixo.
```diff
  tech-lead.md          - Toda mudança de esquema (MySQL)        + Toda mudança de esquema (PostgreSQL, ADR 0014)
                        - (seção "A main é do usuário", 4 itens) + A main é do usuário (hook e settings impõem); integração: skill git-integracao.
  software-architect.md - skills: software-architecture, cyber-security   + skills: software-architecture
                        - Leia CLAUDE.md, docs/architecture/ e o código   + Leia o overview, o data-model e as ADRs citadas no prompt
                        - O discovery corre à frente da entrega: adiante as próximas fases.   (remover)
  ux-designer.md        - O discovery corre à frente da entrega: ... adiante as próximas fases.   (remover)
  node-backend.md       - e as ADRs em docs/architecture/adr/   + e as ADRs citadas no plano ou no prompt
                        + Antes de concluir: `pnpm run pronto` (gera o carimbo do commit); commit na develop conforme praticas §9.
  react-frontend.md     + Antes de concluir: `pnpm run pronto`; commit na develop conforme praticas §9.
  qa-engineer.md        - docs/ux/<feature>.md   + docs/ux/<demanda>/especificacao.md (critérios de aceite)
```

**B5. Worktree por agente em paralelo** (no `jarvis.md`, na seção de paralelismo). Ganho: acaba com timeouts sob disputa e com a brecha "árvore suja" do pre-push (que pode ser removida depois). Risco: disco e `pnpm install` por worktree (o store do pnpm é compartilhado, então o custo é baixo).
```diff
+ Instâncias em paralelo trabalham cada uma no seu `git worktree` (../MetricasDSPD-<cartão>), nunca no mesmo diretório.
```

## 11. Perguntas ao usuário (não se resolvem por inferência)
- **P1.** A `develop` virou a branch de PR para a `main` (como no PR #17)? Se sim, a regra da `feature/dashboard-mock` no `praticas.md` §9 fica obsoleta, e as branches de trabalho saem da `develop`.
- **P2.** O QA continua obrigatório em **toda** correção (o texto atual do `CLAUDE.md`) ou **por entrega**, com a correção pequena validada pelo teste e pelo CI (o que diz a `economia-de-tokens.md`)?
