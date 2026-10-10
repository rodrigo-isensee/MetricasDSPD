# 0002 - Monorepo com npm workspaces e pacotes compartilhados
- Status: aceita
- Data: 2026-10-09
- Substitui parcialmente: ADR 0001 (linha "Pacotes", linha "Regras de lint arquiteturais" e o risco de migração da biblioteca)
- Origem: ata `docs/alinhamentos/2026-10-09-checkpoint-001-kickoff-002.md`, decisões D2 e D3 (com D4 e D5 como contexto)
- Pedidos: `docs/pedidos/001-dashboard-mock.md`, `docs/pedidos/002-arquitetura-completa.md`

## Contexto
O ADR 0001 deixou `web/` e `e2e/` como pacotes npm independentes, sem workspaces, com a biblioteca de cálculo em `web/src/lib/metrics` e a promessa de migrá-la "para `packages/shared` ou `server/`" quando houvesse back-end. O pedido 002 exige que o 001 nasça **dentro** da arquitetura final: um único pacote de cálculo usado pelo back-end e pelo mock (T2.5), contratos tipados compartilhados entre front e back e um seed MySQL gerado a partir do mesmo mock.

Forças:
- **Biblioteca única (T2.5):** o servidor (002) e o mock (001) precisam importar exatamente o mesmo código de horas úteis, janela, percentis e mínimo de 20. Cópia ou "migração depois" abre espaço para duas implementações divergentes.
- **Contratos únicos:** `HttpFonteMetricas` (web) e a API (server) validam os mesmos DTOs e filtros com os mesmos schemas zod.
- **Seed do MySQL (002) e paridade mock × banco (D15):** o gerador do mock precisa rodar fora do navegador, a partir do `server/` e dos testes de paridade.
- **Fronteiras de domínio:** BusinessMap e Acelerato nunca se misturam; painéis nunca calculam. Hoje isso é convenção de pasta e ainda não tem lint (ata, seção 2). Fronteira de pacote é mais forte que fronteira de pasta.
- **Custo da mudança:** a fase A (K-004) já tem `contracts/`, `lib/metrics` (núcleo e todas as métricas) e `mock/` com 64 testes. A extração precisa ser mecânica, verificável e feita uma vez só.
- **Branches (D4, D5):** o monorepo entra na `feature/dashboard-mock` e chega ao usuário no PR único do 001; o restante do 002 sai da `feature/arquitetura-mysql`, criada depois da extração.

Estado atual relevante (levantado no código em 2026-10-09):
- `lib/metrics` depende só de `contracts` (via alias `@/contracts/*`) e de si mesma.
- `mock/` depende de `contracts` e de `lib/metrics` (calendário do `core` e tipos `BaseBM`/`BaseAC` em `businessmap/modelo.ts` e `acelerato/modelo.ts`).
- Na raiz de `lib/metrics` há uma camada de orquestração (`calcular.ts`, `visaoGeral.ts`, `slug.ts`) que importa os dois domínios para despachar por `MetricaId` e montar o DTO da Visão geral, que só exibe resultados lado a lado.
- `data/mock/MockFonteMetricas.ts` carrega `@/mock` e `@/lib/metrics` por `import()` dinâmico.
- **Desvio de fronteira encontrado:** `mock/acelerato/gerador.ts` importa `CRITERIOS_MOCK` de `mock/businessmap/catalogos.ts`. É cruzamento BM → AC dentro do mock e deve ser corrigido antes ou durante a extração (ver Procedimento, passo 2).

## Decisão

### Estrutura
npm workspaces na raiz, escopo `@metricas-dspd/*`, Node 24 LTS.

```
/
  package.json            # private, "workspaces": ["packages/*", "web", "server", "e2e"], scripts agregados
  package-lock.json       # único, na raiz
  tsconfig.base.json      # opções comuns do compilador
  eslint.config.js        # flat config única, com blocos por pacote (fronteiras)
  .prettierrc
  packages/
    contratos/            # @metricas-dspd/contratos   (de web/src/contracts)
    metricas/             # @metricas-dspd/metricas    (de web/src/lib/metrics)
    mock/                 # @metricas-dspd/mock        (de web/src/mock)
  web/                    # @metricas-dspd/web         (SPA; mantém src/data, app, features, components...)
  server/                 # @metricas-dspd/server      (criado no 002, feature/arquitetura-mysql)
  e2e/                    # @metricas-dspd/e2e         (Playwright + axe)
```

| Pacote | Conteúdo | Pode depender de | Exports |
|---|---|---|---|
| `@metricas-dspd/contratos` | DTOs, filtros, `MetricaId`, domínios fechados (`as const`), schemas zod | `zod` | `.` |
| `@metricas-dspd/metricas` | `core` (calendário, janela, percentil, amostra, estatística, histograma, séries, critérios, Monte Carlo), `businessmap`, `acelerato`, orquestração | `contratos` | `.` (orquestração: `calcularMetrica`, `calcularVisaoGeral`, `slug`), `./core`, `./businessmap`, `./acelerato` |
| `@metricas-dspd/mock` | gerador determinístico (PRNG, distribuições, config, geradores BM e AC) | `contratos`, `metricas` | `.` (`gerarBaseMock`, `CONFIG_PADRAO`, tipos) |
| `@metricas-dspd/web` | SPA; `src/data` (FonteMetricas, provider, `useMetrica`, simulação `?mock=`, `MockFonteMetricas`, futura `HttpFonteMetricas`) | `contratos`; `metricas` e `mock` **só** em `src/data/mock/**` | — |
| `@metricas-dspd/server` (002) | API, coletores, migrações, seed | `contratos`, `metricas`; `mock` **só** no seed e nos testes de paridade | — |
| `@metricas-dspd/e2e` | testes E2E e de performance do front | nenhum pacote interno (testa pela UI) | — |

Grafo acíclico: `contratos ← metricas ← mock`; `web` e `server` no topo. Dependências internas declaradas no `package.json` de cada pacote (`"@metricas-dspd/contratos": "*"`), nunca alcançadas por caminho relativo (`../../packages/...`).

Observação sobre a raiz `.` de `metricas`: a tarefa de D2 lista os subpaths `core`, `businessmap` e `acelerato`; a orquestração existente (`calcular.ts`, `visaoGeral.ts`) não pertence a nenhum dos três e fica no export raiz. Ela só despacha por `MetricaId` e compõe DTOs já calculados; não cria amostra, não concatena valores e não calcula estatística (regra de lint abaixo e revisão de código).

### Pacotes como TS-fonte
- Sem etapa de build nos pacotes internos. `package.json` de cada pacote aponta os exports para os arquivos `.ts`:
  ```json
  {
    "name": "@metricas-dspd/metricas",
    "private": true,
    "type": "module",
    "sideEffects": false,
    "exports": {
      ".": "./src/index.ts",
      "./core": "./src/core/index.ts",
      "./businessmap": "./src/businessmap/index.ts",
      "./acelerato": "./src/acelerato/index.ts"
    },
    "dependencies": { "@metricas-dspd/contratos": "*" }
  }
  ```
- Consumidores: Vite e Vitest (web) compilam o fonte dos workspaces; o `server/` (002) roda com `tsx` em desenvolvimento e empacota (esbuild ou equivalente, a decidir no ADR do framework da API) para produção, o que inlinha os pacotes. A escolha concreta do runner do servidor fica no ADR do 002 (D13).
- `"sideEffects": false` e exports por subpath para o tree-shaking manter o gerador e a biblioteca fora do chunk inicial do web (ADR 0003).
- Arquivos `*.test.ts` e utilitários de teste (`businessmap/testing.ts`) ficam no pacote, fora dos exports.

### `tsconfig.base.json`
Herdado por todos os pacotes (`"extends": "../tsconfig.base.json"`):
`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedModules`, `erasableSyntaxOnly` (sem `enum`/namespaces, para o fonte rodar com remoção de tipos), `moduleResolution: "bundler"`, `module: "ESNext"`, `target: "ES2023"`, `skipLibCheck`. Cada pacote define só o que é seu: `lib` (`DOM` apenas em `web` e `e2e`; os pacotes compartilhados **não** têm `DOM`, o que impede API de navegador no cálculo), `types` e `include`. Type-check de tudo por `tsc -b` com project references a partir da raiz.

### Imports
- O alias `@/` continua existindo **somente dentro de `web/`**. Nos pacotes, imports internos são relativos; entre pacotes, sempre pelo nome (`@metricas-dspd/contratos`, `@metricas-dspd/metricas/core`).
- Troca mecânica na extração: `@/contracts/<arquivo>` → `@metricas-dspd/contratos`; `@/lib/metrics` → `@metricas-dspd/metricas`; `@/lib/metrics/core` → `@metricas-dspd/metricas/core`; `@/lib/metrics/<dominio>/modelo` → `@metricas-dspd/metricas/<dominio>` (tipos re-exportados pelo `index.ts` do domínio, sem novo subpath); `@/mock` → `@metricas-dspd/mock`.

### `web/src/data` permanece no web
`FonteMetricas`, provider, `useMetrica`, simulação de estados `?mock=` e `MockFonteMetricas` dependem de React, TanStack Query e da URL; são adaptadores do front, não código compartilhado. A interface `FonteMetricas` fica em `web/src/data`; o que é compartilhado com o servidor são os tipos que ela usa (de `contratos`).

### Calendário de feriados como parâmetro
- A biblioteca não lê feriados de lugar nenhum: todo cálculo de tempo recebe um `Calendario` (`criarCalendario({ turnos, feriados, offsetMinutos })`), levado no contexto das métricas. `feriados.ts` já foi absorvido por `calendario.ts` (ata, seção 2).
- `FERIADOS_NACIONAIS` e `CALENDARIO_PADRAO` continuam no `core` como valor padrão provisório (pergunta P2 do plano técnico, aberta), usados pelo mock. No 002 o servidor monta o `Calendario` a partir da tabela de calendário do MySQL e o passa à mesma biblioteca; nenhuma função de métrica usa o padrão implicitamente.
- Funções de formatação com padrão (`dataIso`, `instanteDeIso`) podem manter o parâmetro opcional; funções de cálculo de tempo (`horasUteisEntre`, `somarHorasUteis`, `diasUteis`, janela) exigem o calendário explícito.

### Fronteiras garantidas por lint
`eslint.config.js` único na raiz, com blocos por `files`. Regras mínimas (`no-restricted-imports` com `patterns`, `no-restricted-globals`, `no-restricted-properties`, `no-restricted-syntax`):

| Onde | Proibido |
|---|---|
| `packages/contratos/**` | importar qualquer `@metricas-dspd/*`, React, DOM |
| `packages/metricas/src/core/**` | importar `../businessmap`, `../acelerato`, `@metricas-dspd/metricas/*`, `@metricas-dspd/mock` |
| `packages/metricas/src/businessmap/**` | importar `../acelerato/**` ou `@metricas-dspd/metricas/acelerato` |
| `packages/metricas/src/acelerato/**` | importar `../businessmap/**` ou `@metricas-dspd/metricas/businessmap` |
| `packages/mock/src/businessmap/**` × `packages/mock/src/acelerato/**` | importar um ao outro (mesma regra, nos dois sentidos) |
| `packages/metricas/**`, `packages/mock/**` | `Math.random`, `Date.now`, `new Date()` sem argumento, getters locais de `Date` (`getHours`, `getDay`...), `@metricas-dspd/mock` dentro de `metricas`, React |
| todos os pacotes | `Math.min(...x)`/`Math.max(...x)` com spread (estouro de pilha e custo em arrays grandes; ADR 0003) via `no-restricted-syntax` |
| `web/src/**` exceto `web/src/data/mock/**` | importar `@metricas-dspd/metricas*` e `@metricas-dspd/mock` (painel não calcula) |
| `web/src/data/mock/**` | importar `@metricas-dspd/metricas` e `@metricas-dspd/mock` de forma estática (só `import()` dinâmico; o `import type` é permitido) |
| `server/**` (002) exceto seed e testes de paridade | importar `@metricas-dspd/mock` |
| `e2e/**` | importar pacotes internos |
| qualquer pacote | importar outro pacote por caminho relativo (`**/packages/**`) |

O lint roda na raiz (`npm run lint`) e no CI; violar fronteira falha o build. Um teste de arquitetura simples (lista de imports por pacote) é opcional se o lint se mostrar insuficiente.

### Scripts na raiz
`dev` (web), `build` (web), `lint`, `typecheck` (`tsc -b`), `test` (`npm test --workspaces --if-present`, cada pacote com `TZ=UTC`), `check` (lint + typecheck + test), `e2e`. O critério de pronto do 001 passa a ser `npm install && npm run dev` **na raiz** (ajustar README e plano de testes).

### Procedimento da extração (D3)
Quando: depois do code review (D8) e do QA da fase A, **antes** da fase B. Executa: `react-frontend`. Commita: `tech-lead`. Branch: `feature/dashboard-mock` (D4); a `feature/arquitetura-mysql` só é criada depois deste commit.

1. **Linha de base**, com a fase A aprovada: rodar `check` em `web/`, registrar o número de testes que passam e o hash da base mock (semente e `hoje` padrão, mesma função de hash usada no teste de determinismo do gerador). Anotar os dois na mensagem do commit.
2. **Correção prévia, em commit separado:** mover `CRITERIOS_MOCK` de `mock/businessmap/catalogos.ts` para um arquivo neutro do mock (ex.: `mock/criterios.ts`) e ajustar os dois geradores. Não muda dados; o hash deve continuar o mesmo.
3. **Commit mecânico único:** criar `package.json` raiz, `tsconfig.base.json`, `package.json` e `tsconfig.json` de cada pacote; `git mv web/src/contracts packages/contratos/src`, `git mv web/src/lib/metrics packages/metricas/src`, `git mv web/src/mock packages/mock/src`; trocar imports conforme a tabela acima; mover devDependencies comuns (TypeScript, ESLint, Prettier, Vitest, fast-check) para a raiz; mover `eslint.config.js` para a raiz com os blocos por pacote; apagar `web/package-lock.json` e gerar o lock da raiz. **Sem mudança de lógica, de nome de função nem de teste** além de caminhos de import.
4. **Critério de aceite:** `npm install` limpo na raiz; lint, type-check e todos os testes verdes; **mesmo número de testes** e **mesmo hash da base mock** do passo 1; `npm run build` e `npm run dev` funcionando; bundle inicial dentro do ADR 0003 (o chunk do mock continua fora do inicial). Se o hash mudar, o commit é desfeito e investigado; nada de "ajustar o hash esperado".
5. Junto (commit separado, do `ux-designer`, D10): spec movida para `docs/ux/dashboard-metricas/especificacao.md`.
6. QA reexecuta a suíte e o E2E disponível sobre o resultado (portão de QA).

## Alternativas consideradas
- **Pacote único `packages/shared`** (padrão da skill): menos pacotes e menos configuração. Contras: mistura contratos (que o front inteiro usa) com cálculo e gerador (que nenhum painel pode usar), o que impede expressar "painel importa contratos mas não importa cálculo" como dependência de pacote; o servidor de produção arrastaria o gerador de mock; fronteira BM × AC ficaria só como convenção de pasta. Descartada.
- **Manter tudo dentro de `web/`** (ADR 0001 original) e migrar quando o servidor existir: zero custo agora. Contras: o servidor do 002 teria de importar de dentro do front ou copiar a biblioteca (viola T2.5 e o próprio pedido 002); a migração acontece de qualquer jeito, mais tarde e com mais código; o seed e os testes de paridade (D15) precisam do gerador fora do navegador. Descartada.
- **Mais pacotes** (`metricas-core`, `metricas-businessmap`, `metricas-acelerato` separados): fronteira BM × AC por dependência de pacote, sem lint. Contras: três `package.json`, versões e configs para um código que sempre muda junto; a orquestração precisaria de um quarto pacote. Subpaths + lint dão a mesma garantia com menos cerimônia. Pode ser revisto se o lint falhar em pegar algum cruzamento.
- **Pacotes compilados (`dist/` + `tsc --build`)**: consumo padrão por qualquer ferramenta. Contras: etapa de build extra no dev e no CI, risco de consumir `dist/` desatualizado, source maps. Com todos os consumidores capazes de ler TS (Vite, Vitest, tsx, empacotador do servidor), não compensa agora.
- **pnpm ou Turborepo/Nx**: melhor isolamento de dependências e cache de tarefas. Contras: ferramenta a mais para quatro ou cinco pacotes; npm já está no CI e no time. Reavaliar se o tempo de CI crescer.
- **Path aliases do TypeScript em vez de workspaces**: sem `node_modules` ligados. Contras: cada ferramenta precisa replicar o alias, não há `package.json` declarando dependências nem `exports` controlando o que é público.

## Consequências
- Mais fácil: servidor e mock usam a mesma biblioteca por construção (T2.5); `HttpFonteMetricas` e a API compartilham schemas; seed e paridade mock × MySQL (D15) importam o gerador direto; fronteiras viram erro de lint e de grafo de dependências, não só revisão.
- Mais difícil: configuração inicial maior (workspaces, project references, ESLint com blocos por pacote); todo novo arquivo precisa estar no pacote certo; o `react-frontend` faz um commit grande na fase de transição.
- Riscos:
  - **Extração quebrar algo silenciosamente** → mitigado pelo critério de mesmo número de testes e mesmo hash da base mock, e pelo commit sem mudança de lógica.
  - **Tree-shaking falhar e o gerador entrar no chunk inicial** → `sideEffects: false`, `import()` dinâmico só em `web/src/data/mock`, e o orçamento de bundle do ADR 0003 bloqueia a entrega.
  - **Runner do servidor e TS-fonte** (imports sem extensão, sem `enum`) → `erasableSyntaxOnly` desde já; decisão final do runner no ADR do framework da API (002).
  - **Pasta compartilhada entre agentes durante a extração** → a extração acontece com a fase A parada (depois do review/QA) e antes de abrir o worktree do 002 (D4).
  - **Tipos do modelo analítico (`BaseBM`, `BaseAC`) ficam em `metricas`**; se o servidor precisar deles sem a biblioteca, avaliar movê-los para `contratos` no 002.

## Adendo — K-016/K-043 (2026-10-10)
Origem: `docs/reviews/001-K-016-r1.md`, `001-K-043-r1.md` e `001-branch-final.md` (item 2). Complementa as seções acima; o restante da decisão segue valendo.

### Exceção aceita: `metricas` → `mock` só em teste
- `@metricas-dspd/metricas` declara `@metricas-dspd/mock` como **devDependency**, usada só em `*.test.ts` (hoje `regras.test.ts` e `regras.property.test.ts`, que verificam regras sobre a base mock inteira). O ciclo `metricas ↔ mock` existe só no grafo de devDependencies; o grafo de produção continua acíclico (`contratos ← metricas ← mock`).
- Garantia: lint proíbe `@metricas-dspd/mock` em `packages/metricas/**` fora de `*.test.ts`, sem outras brechas em `ignores` (a entrada `**/testing.ts` foi retirada), com fixture nos dois sentidos (deve falhar em código de produção, deve passar em teste) no meta-teste `web/src/test/lint.meta.test.ts`.
- Condição de remoção: a exceção cai quando esses testes migrarem para `packages/mock/src/` ou para uma suíte de integração fora de `packages/metricas/src` (ex.: `packages/metricas/test-integracao`), ou quando surgir um terceiro uso do mock dentro de `metricas`; nesse momento, mover os testes e retirar a devDependency em vez de ampliar a exceção.

### Desvios aceitos da decisão original
- **Sem project references:** o `typecheck` da raiz roda `tsc --noEmit -p .` em cada workspace (inclui `e2e`), não `tsc -b`. Mais simples para TS-fonte sem build; references ficam para quando houver build incremental.
- **Subpath `@metricas-dspd/contratos/validacao`:** a tabela de exports de `contratos` passa a ser `.` e `./validacao`. `./validacao` concentra os schemas zod de runtime (`SCHEMAS_RESULTADO`), separados do `.`, que o front usa quase só para tipos.
- **Constantes `META_*` em `contratos`** (`packages/contratos/src/metas.ts`, K-042): valores de meta do briefing usados só para desenhar a linha de referência nos gráficos, fonte única para a biblioteca e a UI. Não decidem status: dentro/fora vem sempre do DTO calculado pela biblioteca.
