# Práticas de engenharia — MetricasDSPD

Versão 2 · 2026-10-09 (alinhada às ADRs 0002 e 0003) · Mantido por tech-lead + software-architect (K-015, decisão D9 da ata `docs/alinhamentos/2026-10-09-checkpoint-001-kickoff-002.md`).
Base: skill `.claude/skills/engineering-practices/SKILL.md`. Este arquivo prevalece sobre a skill; decisões estruturais ficam em ADR (`docs/architecture/adr/`). Divergência entre tech-lead e arquiteto vira ADR com as duas posições.

Regras marcadas **[lint]** ou **[CI]** são verificadas por máquina; as demais, no code review.

## 1. Estrutura e fronteiras
Estrutura alvo (D2): monorepo com npm workspaces, escopo `@metricas-dspd/*`, pacotes como TS-fonte (sem build próprio), grafo `contratos ← metricas ← mock`. Fonte da verdade: [ADR 0002](../architecture/adr/0002-monorepo-pacotes-compartilhados.md) (seções "Estrutura" e "Fronteiras garantidas por lint"); a tabela abaixo é o resumo para o dia a dia.

| Pacote | Conteúdo | Pode importar |
|---|---|---|
| `@metricas-dspd/contratos` (`packages/contratos`) | DTOs, filtros, `MetricaId`, domínios fechados, schemas zod | só `zod` (nada do projeto, sem React/DOM) |
| `@metricas-dspd/metricas` (`packages/metricas`; exports `.`, `./core`, `./businessmap`, `./acelerato`) | toda a lógica de cálculo (T2.5) | `contratos`. Dentro do pacote: `core` não importa ninguém do pacote; `businessmap` e `acelerato` importam só `core`; a raiz `.` (orquestração) importa os dois domínios |
| `@metricas-dspd/mock` (`packages/mock`) | gerador determinístico das bases fictícias | `contratos`, `metricas`; `mock/businessmap` e `mock/acelerato` não se importam |
| `@metricas-dspd/web` (`web/`) | SPA | `contratos`; `metricas` e `mock` **só** em `web/src/data/mock/**` e só por `import()` dinâmico (`import type` permitido) |
| `@metricas-dspd/server` (`server/`, pedido 002) | API, coletores, migrações, seed | `contratos`, `metricas`; `mock` só no seed e nos testes de paridade |
| `@metricas-dspd/e2e` (`e2e/`) | Playwright + axe + projeto `perf` | nenhum pacote interno (testa pela UI) |

Até a extração (D3, depois do review e do QA da fase A), as mesmas fronteiras valem por caminho dentro de `web/src/` (`contracts/`, `lib/metrics/`, `mock/`, `data/`), com as regras de lint do [ADR 0001](../architecture/adr/0001-stack-front-dashboard-mock.md).

- **[lint]** `businessmap` e `acelerato` não se importam, nem por caminho relativo nem por subpath, na `metricas` e na `mock`. BusinessMap e Acelerato nunca se misturam em cálculo, histograma, percentil ou previsão.
- **Orquestração na raiz de `metricas`** (`calcularMetrica`, `calcularVisaoGeral`, `slug`) é o único código que conhece os dois domínios. Pode despachar por `MetricaId` e compor resultados já calculados em blocos separados, cada um com sua `fonte`. Não pode criar amostra, concatenar valores, calcular estatística nem derivar indicador a partir de dados das duas fontes juntas. Verificado no review (o lint não cobre o conteúdo das funções).
- **[lint]** Painéis e componentes (todo `web/src/**` fora de `data/mock/**`) não importam `@metricas-dspd/metricas` nem `@metricas-dspd/mock` (antes da extração: `lib/metrics` e `mock`). **Painel não calcula.**
- **[lint]** Entre pacotes, import sempre pelo nome (`@metricas-dspd/metricas/core`), nunca por caminho relativo (`../../packages/...`). O alias `@/` existe só dentro de `web/`; dentro de um pacote, imports relativos.
- **`FonteMetricas` é a única entrada de dados dos painéis.** Tela usa `useMetrica`/`useOpcoesFiltro`; trocar `MockFonteMetricas` por `HttpFonteMetricas` não pode exigir mudança em painel.
- **[lint]** Recharts só é importado em `components/charts/`.
- Todo cálculo de tempo, percentil, janela e Monte Carlo passa pela biblioteca `core`. Métrica com cálculo próprio de qualquer um deles é bloqueio no review.
- Contorno de regra de lint (`eslint-disable`) só com comentário explicando o motivo e aprovação no review; nunca para as regras de fronteira.

## 2. Código
- TypeScript pelo `tsconfig.base.json` da raiz (ADR 0002): `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedModules`, `erasableSyntaxOnly` (**sem `enum` nem `namespace`**: use objeto `as const` + união). Pacotes compartilhados sem `DOM` no `lib`. Sem `any` (use `unknown` + zod); `@ts-expect-error` só com comentário; `@ts-ignore` proibido.
- **Tempo e aleatoriedade injetados [lint].** Em `metricas` e `mock` são proibidos `new Date()` sem argumento, `Date.now`, `Math.random` e getters locais de `Date` (`getHours`, `getDay`...). A data de referência ("agora"/`hoje`) entra por parâmetro; aleatoriedade, por gerador com semente. Instantes em epoch ms.
- **Calendário como parâmetro.** Expediente, feriados e `-03:00` vivem só em `core`; toda função de cálculo de tempo (`horasUteisEntre`, `somarHorasUteis`, `diasUteis`, janela) recebe o `Calendario` explícito, levado no contexto das métricas. `CALENDARIO_PADRAO` é padrão provisório (P2) usado pelo mock; nenhuma métrica o usa implicitamente.
- Funções pequenas, um propósito; sem abreviação obscura. **[lint]** `Math.min(...x)`/`Math.max(...x)` com spread proibidos em todos os pacotes: use laço (estouro de pilha e custo; D6, ADR 0003).
- **Nomes de domínio em português**, alinhados ao briefing e ao catálogo (`chamado`, `cartao`, `frente`, `janela`, `amostra`, `percentil`, `tempoCiclo`, `horasUteis`). Identificadores sem acento. Termos técnicos consagrados podem ficar em inglês (`hook`, `provider`, `schema`). IDs de métrica iguais ao catálogo (`O1`, `T7`, `S3`).
- Erros explícitos: sem `catch` vazio; erro de domínio tipado; log com contexto. Sem `console.log` esquecido, sem código morto, sem TODO sem cartão no `KANBAN.md`.
- Dependência nova só com motivo (tamanho, manutenção, licença), registrado na descrição do PR e checado contra o orçamento de bundle.
- ESLint 9 + typescript-eslint `strictTypeChecked` + react-hooks + jsx-a11y + Prettier **[CI]**.

## 3. Regras de produto que viram regra de código
- **Contratos sem campos por pessoa.** Nenhum DTO, schema, filtro, coluna ou dimensão de agrupamento por responsável/pessoa. Nenhuma visão de ranking, meta ou comparação individual ou entre times. Se aparecer em spec ou cartão, parar e sinalizar ao Jarvis.
- Métricas proibidas (briefing 7.1) não são implementadas nem como "extra".
- Abaixo de 20 itens a estatística **não é publicada**: o resultado traz estado "insuficiente" e a base amostral (`n`, janela, descrição); a UI mostra `AmostraInsuficiente`, nunca um número.
- Story, frente e projeto nunca no mesmo histograma.
- Janela móvel de 12 semanas definida num único lugar (`core/janela`); percentis 50/85/95.
- Mudança de critério: nova `VersaoCriterio` (data, descrição, métricas afetadas) em `criterios`; todo DTO de série devolve `marcacoes` e o gráfico as desenha (T2.6).
- Dúvida de regra de negócio não se resolve no código: vira pergunta no documento do pedido e valor provisório marcado como tal.

## 4. Testes
- **Toda métrica tem teste unitário**, com bordas documentadas no próprio arquivo de teste, no mínimo:
  - `n = 19` (insuficiente) e `n = 20` (publica);
  - janela vazia e borda da janela (dia 84 dentro, 85 fora);
  - mudança de critério cruzando o período (marcação presente);
  - quando aplicável: fora do expediente, fim de semana, feriado, intervalo nulo, `fim < início`.
- Propriedades com fast-check na `core` (`p50 ≤ p85 ≤ p95`, `min ≤ p ≤ max`, `n < 20 ⇒ insuficiente`).
- Determinismo: testes rodam com `TZ=UTC`, data de referência fixa e semente fixa. Gerador: mesma semente ⇒ mesmo hash da base.
- Todo bug corrigido ganha teste que falha antes e passa depois.
- Componentes testados pela tabela alternativa e pelo texto, não pelo SVG.
- Testes de tempo (performance) com limite folgado e explícito, valor real impresso; a medição fina é do QA. Limites de CI do [ADR 0003](../architecture/adr/0003-orcamento-de-performance.md): gerador < 1,5 s (C2); métrica < 150 ms inclusive a frio e painel < 900 ms (3× C3/C4).
- Memoização e otimização não mudam resultado: testes de métrica e hash da base mock continuam iguais; chave de cache inclui todos os filtros normalizados (inclusive período).

## 5. Acessibilidade e performance (front)
- **Todo gráfico tem alternativa em tabela** ("Ver dados em tabela") e resumo em `figcaption`. Gráfico novo entra em `components/charts/` já com a tabela.
- WCAG 2.2 AA: semântica, foco visível, teclado, contraste nos dois temas; axe sem violações nos E2E.
- **Orçamento de performance:** [ADR 0003](../architecture/adr/0003-orcamento-de-performance.md) (K-018, D1), que é a fonte da verdade. Os que mais aparecem no review: bundle JS inicial < 200 KB gz (F6); chunk de rota < 60 KB gz (F7, alerta); gráficos < 130 KB gz só nas rotas com gráfico (F8); mock + biblioteca fora do inicial (F9); LCP < 2,0 s desktop (F1); resposta visual ao filtro < 100 ms e painel atualizado < 500 ms (F4, F5); geração + contexto < 500 ms (C1); métrica < 50 ms p95 inclusive a frio (C3); painel < 300 ms (C4); API p95 < 300 ms e consultas MySQL p95 < 500 ms sem full scan nas fatos (A1, M1, M2, no 002).
- Item que "bloqueia" fora do orçamento bloqueia o review e o PR. Exceção só registrada na ADR 0003 (item, valor medido, motivo, remédio, prazo), aprovada por arquiteto e tech-lead e comunicada ao usuário. Mudar o orçamento exige alterar a ADR.
- Rotas `lazy`; gerador mock e biblioteca em chunk por `import()` dinâmico, pacotes com `"sideEffects": false`; Recharts só no chunk de gráficos.

## 6. Modelagem MySQL (rascunho — revisar no 002 com o arquiteto, D13)
- MySQL 8, InnoDB, `utf8mb4` / `utf8mb4_0900_ai_ci`, `snake_case`.
- Datas em UTC, `DATETIME(3)`; conversão para `America/Sao_Paulo` só na apresentação.
- Schemas separados por origem: `dspd_bm` (BusinessMap), `dspd_ac` (Acelerato), `dspd_core` (referência e critérios). Nenhuma consulta junta `dspd_bm` com `dspd_ac`.
- Prefixos de camada: `stg_`, `dim_`, `fato_`, `ref_`.
- **Append-only:** staging e eventos nunca sofrem `UPDATE`/`DELETE` de histórico; mudança de atributo vira nova versão (SCD2) ou novo evento. Cartões arquivados e excluídos permanecem (com marcação).
- **Idempotência:** restrição `UNIQUE` na chave natural da origem (ex.: `card_id` + `momento` + `tipo_evento`); recarga do mesmo lote não duplica nem altera.
- Toda FK indexada; todo filtro de painel coberto por índice; `EXPLAIN` das consultas principais registrado no data-model.
- **Nenhuma dimensão por pessoa.** Responsável/usuário não é coluna de dimensão nem de agrupamento. Se a carga precisar de identificador de pessoa para regra de negócio (ex.: deduplicação), discutir em ADR, com LGPD, antes da migração.
- Colunas que vêm das extensões ao modelo 4.5 (ex.: `titulo`) entram marcadas como provisórias no data-model.
- Migrações versionadas, uma mudança por migração, com caminho de volta; migração aplicada nunca é editada. Ferramenta definida em ADR no 002.
- Toda mudança de esquema passa pela revisão de modelagem (tech-lead + arquiteto) **antes** de a migração ser escrita.
- Credenciais só em `.env` (nunca versionado); usuário do MySQL do Acelerato somente leitura.

## 7. Definição de pronto (por cartão)
1. `npm run check` verde (lint + typecheck + test) e `npm run build` verde: até a extração, em `web/`; depois, na raiz (todos os workspaces). Bundle (F6, F8, F9) e testes de tempo (C2, C3, C4) dentro dos limites de CI.
2. Testes cobrindo o comportamento novo e as bordas da seção 4.
3. Dentro do orçamento de performance.
4. Parecer **aprovado** do tech-lead em `docs/reviews/<pedido>-<etapa>.md`.
5. Parecer do QA (e da UX, quando houver tela) sem bloqueio aberto.
6. Commit feito pelo tech-lead.

## 8. Code review
Ordem para o 001 (D8): fase A em 4 blocos (cálculo e contratos, com rigor máximo contra o briefing; mock; dados; componentes e acessibilidade) → um review por cartão da fase B → review final da branch.

Checklist:
1. Faz o que o cartão/especificação pede, nem mais nem menos?
2. Respeita ADRs, fronteiras (seção 1) e regras invioláveis (seção 3)? Algum campo ou visão por pessoa?
3. Cálculo passa pela `core`? Respeita n < 20, janela, percentis, marcação de critério, separação BM × AC e story/frente/projeto?
4. Legível sem explicação? Nomes, tamanho de funções, duplicação.
5. Tipos corretos, entradas validadas (zod nas bordas), erros tratados?
6. Segurança: segredos, injeção (SQL só parametrizado), dados pessoais.
7. Performance: índices, N+1, renderizações, bundle dentro do orçamento?
8. Testes cobrem o novo e as bordas? Determinísticos?
9. Acessibilidade: semântica, foco, contraste, tabela alternativa.
10. Pronto para commit limpo?

Parecer: **aprovado** ou **ajustes necessários**, cada item com `arquivo:linha · problema · sugestão · severidade (bloqueia / recomendado)`. Correção de lógica volta ao autor; o tech-lead só faz ajuste trivial de formatação.

## 9. Git, commits e PR
- **Autores não commitam** (D8): o agente entrega, o tech-lead revisa e commita.
- A `main` é do usuário: nenhum agente faz commit, merge, rebase, reset ou push nela; hook `pre-push` em `.githooks/` (`git config core.hooksPath .githooks`); `--no-verify` proibido.
- Branches a partir da base certa: `feature/`, `fix/`, `docs/`, `chore/`, `refactor/` + slug. Encadeamento atual (D4): `feature/dashboard-mock` (PR 1, todo o 001 + monorepo) → `feature/arquitetura-mysql` (PR 2, criada após a extração, em `git worktree` separado).
- Conventional Commits em português: `tipo(escopo): descrição no imperativo`, tipos `feat, fix, docs, test, refactor, perf, chore, ci`. Escopos usuais: `metricas`, `mock`, `dados`, `ui`, `painel-<nome>`, `contratos`, `server`, `db`, `e2e`, `kanban`, `arquitetura`, `ux`, `engenharia`.
- Um commit por mudança coerente; cada commit compila e passa nos testes.
- Extração para pacotes (D3): segue o "Procedimento da extração" do [ADR 0002](../architecture/adr/0002-monorepo-pacotes-compartilhados.md). Linha de base (número de testes e hash da base mock) anotada na mensagem; correção do cruzamento `CRITERIOS_MOCK` em commit próprio antes; depois um commit mecânico único (`git mv` + imports + configs), sem mudança de lógica, de nome nem de teste. Aceite: mesmo número de testes e mesmo hash; se o hash mudar, o commit é desfeito e investigado, nunca se ajusta o hash esperado.
- Antes de commitar: `git status` e `git diff --staged`. Nunca versionar `.env`, `node_modules`, `dist`, relatórios de teste.
- Atualizar a branch: `git fetch` + `git merge origin/main` na própria branch.
- Descrição do PR: objetivo e pedido · o que mudou · decisões e ADRs · como testar · parecer do QA · parecer do code review · riscos e pendências.

## 10. Pipeline de CI (planejada)
Ordem, falhando no primeiro erro, por workspace afetado:
1. `lint` (inclui fronteiras)
2. `typecheck`
3. `test` (`TZ=UTC`)
4. `build`
5. `size` (orçamento de bundle F6–F9 do ADR 0003: `size-limit` ou script de gzip sobre `dist/assets`)
6. E2E Playwright + axe (projeto `mock`; no 002 também o projeto `api` contra MySQL 8 em container, com teste de paridade mock × seed — D15)
7. Lighthouse CI desktop (F10: Performance ≥ 90, Acessibilidade ≥ 95) e projeto `perf` do Playwright (F1–F5, C5, C6) na pré-entrega

Até o CI existir, o autor roda 1 a 5 localmente (`npm run check && npm run build && npm run size`) e o QA roda 6 e 7 na máquina de referência.
