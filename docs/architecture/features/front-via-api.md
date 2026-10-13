# Plano técnico: front lendo pela API (`HttpFonteMetricas`)

- Status: proposta (discovery técnico, sem mudança de tela; sem UX)
- Data: 2026-10-12
- Origem: achado S4 e risco "SPA ainda no mock" em `docs/architecture/features/homologacao.md`; H3/H4 da homologação; ADR 0007 ("trocar a fonte é só trocar a fonte").
- Relacionadas: ADR 0003 (orçamento), ADR 0007 (contratos), `docs/contratos/http.md`, `docs/api/openapi.json`.

## 1. Resumo e situação atual
- A UI só conhece `FonteMetricas` (`web/src/data/FonteMetricas.ts`, 6 métodos: `obter`, `opcoesFiltro`, `criterios`, `dataReferencia`, `estadoColeta`, `historicoColetas`) e o campo `tipo: 'mock' | 'api'`, que o `useMetrica` já usa para ignorar `?mock=` com a API. A única implementação é `MockFonteMetricas`; `criarFontePadrao()` (`web/src/app/App.tsx:23`) sempre a instancia.
- O React Query já faz cache e deduplicação por chave (`['metrica', id, filtros, modo]`, `staleTime: Infinity`, `retry: false`, `keepPreviousData`). A estrutura do front está pronta: falta só a implementação HTTP e a seleção por configuração.
- A API já existe e cobre quase tudo: `GET /api/v1/metricas/{id}` (uma rota por `MetricaId`), `/filtros/{dominio}`, `/referencia`, `/fontes/{dominio}/estado`, `/fontes/{dominio}/coletas?pagina=`, `/criterios`. O nginx (`docker/web/nginx.conf`) já faz proxy de `/api/` para `api:3000`: mesma origem, sem CORS.

## 2. Módulos afetados
Front (`web/`): `src/data/http/HttpFonteMetricas.ts` (novo), `src/data/index.ts` (export), `src/app/App.tsx` (`criarFontePadrao`), `vite.config.ts` (proxy de dev), `.env.example` do web, `e2e/playwright.config.ts`. Back (`server/`): nenhum, salvo o item de paridade (ver 5) e a lacuna da seção 4.

## 3. Desenho da `HttpFonteMetricas`

| Método da interface | Rota | Validação (Zod de `@metricas-dspd/contratos`) |
|---|---|---|
| `obter(id, filtros)` | `GET /api/v1/metricas/{id}?...` | `SCHEMAS_RESULTADO[id].safeParse` (ADR 0007) |
| `opcoesFiltro(d)` | `GET /api/v1/filtros/{d}` | `opcoesFiltroSchema` (hoje definido em `server/.../referencia/schemas.ts`; ver risco R6) |
| `criterios()` | `GET /api/v1/criterios` | `z.array(versaoCriterioSchema)` |
| `dataReferencia()` | `GET /api/v1/referencia` (campo `dataReferencia`) | `referenciaSchema` (idem R6) |
| `estadoColeta(d)` | `GET /api/v1/fontes/{d}/estado` | `estadoColetaSchema` |
| `historicoColetas(d,p)` | `GET /api/v1/fontes/{d}/coletas?pagina=p` | `paginaColetasSchema` |

- **Serialização de filtros:** função pura `filtrosParaQuery(filtros)`: listas em CSV (`equipe=a,b`), omite vazio/"Todos", `periodo`, `de`/`ate` só com `custom`, `dataReferencia` quando presente. Testada contra os schemas de entrada do servidor (que são `.strict()`: parâmetro a mais vira 400, e isso é o teste).
- **Fonte pesquisa (PV1) e visão geral:** seguem a mesma rota; o schema de entrada é do domínio da métrica no servidor, o front só envia o que o `FiltrosDe<K>` produz.
- **Cancelamento:** `obter` aceita o `AbortSignal` do React Query (`queryFn: ({ signal })`). O `useMetrica` hoje não repassa o sinal; mudança mínima: estender a interface com um segundo argumento opcional `opcoes?: { signal?: AbortSignal }` (o mock ignora). Trocar o filtro muda a chave e o Query cancela a requisição anterior; `keepPreviousData` mantém o conteúdo na tela (comportamento visual atual, sem mudança de tela).
- **Cache e deduplicação:** duas camadas, sem código novo além da configuração. (1) React Query: dedup por chave; `staleTime: Infinity` continua correto porque nada muda até nova coleta, e o botão "Tentar de novo" refaz. (2) Navegador: a API responde `Cache-Control: private, max-age=60` e `ETag` fraco com 304; o `fetch` padrão usa isso sem código. Não criar cache próprio. Recomendação: o selo de frescor (`estadoColeta`) com `staleTime` de 60 s e `refetchOnWindowFocus` ainda `false` (WCAG 2.2.2, decisão existente); o painel só reflete nova coleta ao recarregar a página ou ao "Tentar de novo". Decisão em aberto D1 abaixo.
- **Cabeçalhos:** `obter` lê `X-Data-Referencia` e `X-Versao-Criterio`. O resultado da interface é só o DTO, então: guardar a data no cache de `dataReferencia` por `queryClient.setQueryData(['data-referencia'])` é acoplamento indesejado; alternativa adotada: `dataReferencia()` usa `/referencia` (uma chamada, compartilhada) e o cabeçalho serve de conferência (divergência entre os dois = log em dev, não erro). `X-Request-Id` é registrado no erro para o suporte.
- **Frescor:** vem do corpo de `/fontes/{d}/estado` (D1 de `integracao-real.md`), que o `useEstadoColeta` já consome. Nada de novo.
- **Erros e estados:** classe `ErroApi { status, code, requestId }` a partir do formato `{ error: { code, message, details? } }`. Mapeamento para os estados existentes do cartão (`carregando | erro | vazio | ok`): qualquer falha de rede, 4xx, 5xx ou `safeParse` inválido vira `erro` (o `useMetrica` já trata via `isError`). Casos com mensagem própria sem tela nova: `503 REFERENCIA_AUSENTE` e `503 BASE_INDISPONIVEL` (texto de erro existente, com o código em `data-*` para o E2E), `422 PERIODO_FORA_DO_HISTORICO` (erro do filtro, nunca silencioso). Resposta que não passa no schema: log com `console.error` em dev e `requestId`, sem o corpo em produção. `retry: false` permanece; timeout de 15 s via `AbortSignal.timeout` combinado com o sinal do Query. "Amostra insuficiente" continua sendo `status: "insuficiente"` dentro do DTO, não erro.
- **Sem pessoa:** a validação pelo Zod `.strict()` do DTO também recusa campo imprevisto vindo do servidor (defesa em profundidade da regra inviolável).

## 4. Seleção da fonte e impacto no orçamento (ADR 0003)

**Seleção:** `VITE_FONTE=mock|api` lido em `criarFontePadrao()`. Padrão `mock` em `vite dev` e testes unitários (`fonteDeTeste` e `FonteFixa` seguem explícitas, nenhum teste muda); padrão `api` no build da imagem de homologação (`docker/web/Dockerfile` passa `--build-arg VITE_FONTE=api`). Valor inválido = erro na partida (falha rápida, sem cair no mock em silêncio). `VITE_*` é público: só a escolha da fonte e a base da API (`VITE_API_BASE`, padrão `/api/v1`, relativa, mesma origem); nunca segredo. O aviso permanente de dados fictícios já depende de `tipo === 'mock'`.

**Bundle (F6/F9):** com `import()` dinâmico das duas fontes, o chunk do mock + biblioteca (F9) deixa de ser baixado no modo `api`; o ganho é líquido: tira o cálculo da thread principal (C1 a C6 deixam de valer no navegador; valem A1/A3 e M1 no servidor). A `HttpFonteMetricas` deve ser minúscula (< 5 KB gzip); o Zod já está no bundle (ADR 0001). Teste: `size` confirma que o mock não entra no inicial nos dois modos e que não entra no grafo do modo `api` (tree-shaking por constante de build).

**Chamadas por painel:** cada cartão chama a sua métrica (D7), então um painel faz de 1 a ~12 `GET` paralelos, mais 4 a 5 de apoio compartilhados (filtros, referência, critérios, estado de 1 ou 2 fontes), todos deduplicados pelo Query. Em HTTP/1.1 o navegador limita 6 conexões por origem: `GET`s excedentes enfileiram; nginx local atende HTTP/1.1. Decisão: **não criar rota agregada agora.** Motivos: o cache do servidor por chave (métrica, versão de carga, filtros) já torna a 2ª chamada barata (A2 < 50 ms); o 304 evita corpo; agregar acopla o painel inteiro à métrica mais lenta (hoje cada cartão aparece sozinho, spec D7) e exigiria contrato novo no OpenAPI. Gatilho para reabrir: F5 (< 500 ms por troca de filtro) ou A1 (p95 < 300 ms) estourarem na medição de H6 contra a API. Alternativas se estourar, em ordem: (1) habilitar HTTP/2 no nginx (config, sem código); (2) limitar concorrência no front; (3) rota `GET /api/v1/paineis/{id}` agregada (node-backend), só então. **Atenção:** o F5 do ADR 0003 foi definido "sem a latência simulada" para o mock; com a API, a latência real de rede + cálculo entra na medição e o E2E de perf precisa de um novo limite de referência para o modo `api` (registrar a medição, não afrouxar o orçamento sem exceção em ADR).

**O2 e paginação:** a API devolve `itens` da página 1 (até 200) e `itensMeta`; o mock devolve todos. Verificar no cartão de O2 se a tela usa a lista completa (contagem, "Ver dados em tabela"); se usar, o front precisa paginar ou pedir `pageSize=200` e mostrar o total de `itensMeta`. É a única divergência de formato conhecida entre mock e API; fica registrada como R3 e coberta pela paridade.

## 5. Paridade mock × API (H3, D15)
Teste com os dois caminhos sobre a **mesma base**: o gerador `@metricas-dspd/mock` (semente e `hoje` fixos) é a fonte do seed do PostgreSQL de teste; para cada `MetricaId` (46: 45 do briefing + PV1) e 2 conjuntos de filtros (padrão e período máximo, mais 1 filtro por domínio), compara `MockFonteMetricas.obter` com `HttpFonteMetricas.obter` contra a API de pé, com `toStrictEqual` após normalizar só o O2 (paginação). Tem duas camadas: (a) **contrato** (rápido, em `server/tests/pg`): a API sobre o seed valida em `SCHEMAS_RESULTADO` e bate com `calcularMetrica` sobre a mesma base em memória; (b) **ponta a ponta** (H3/H4): `HttpFonteMetricas` apontada para a API de homologação, comparada com o mock. Diferença é falha, nunca tolerância numérica (mesma biblioteca). Depende de o seed de homologação ser derivado do mock com a mesma semente; se não for (dado real depois), a paridade passa a valer só no ambiente com seed. Dono: `qa-engineer` com o `node-backend` no seed.

## 6. E2E de homologação apontando para a API
- `E2E_BASE_URL=http://127.0.0.1:18080` (nginx de homologação, SPA buildada com `VITE_FONTE=api`); sem `webServer`. Os specs que dependem de dados fictícios específicos (semente `7` do `dist-alt`, `?mock=`) ficam num grupo `@mock`, executado só no modo mock (CI do PR); os demais rodam nos dois modos, com asserções por estrutura (existe cartão, estado `ok`/`insuficiente`/`vazio`), não por número fixo, exceto onde o seed é o do mock (paridade cobre o número).
- Os estados `?mock=erro|vazio|...` não existem na API: os cenários de erro viram interceptação de rota do Playwright (`page.route` devolvendo 500/503/422 e corpo inválido) no modo `api`.
- Critério novo do H4: nenhuma requisição a `/api/` falha ou é cancelada sem motivo (listener de `requestfailed`/status) e nenhuma requisição sai de `127.0.0.1:18080` (asserção de mesma origem).
- O perf (`e2e/perf`) ganha variante `api` com limites medidos e registrados.

## 7. Segurança (revisão rápida, `cyber-security`)
- Fronteira nova: navegador → nginx → API. Mesma origem: **sem CORS aberto**; a API continua sem `Access-Control-Allow-Origin`. Em dev, proxy do Vite (`/api` → `127.0.0.1:3000`) em vez de CORS.
- Sem token no front: a API ainda não autentica (D6; `http.md` §1). Acesso apenas local (portas em `127.0.0.1`, H2 já verifica). **Risco aceito até o SSO (ADR 0009):** qualquer processo na máquina lê as métricas agregadas; não há dado de pessoa nas respostas (regra inviolável, Zod `.strict()` nos dois lados). Quando o SSO existir: cookie httpOnly + `SameSite`, sem token em `localStorage`; a `HttpFonteMetricas` passa a tratar `401` redirecionando ao login (ponto de extensão já reservado em `ErroApi`).
- `VITE_*` público: só base relativa e escolha da fonte. CSP do nginx (S-25) precisa de `connect-src 'self'`.
- Mensagens de erro da UI não exibem `message` do servidor sem sanitização (texto puro, nunca HTML); `requestId` pode ser exibido para suporte.
- Rate limit e limites de tempo: as mesmas rotas já têm; o front não repete automaticamente (sem retry), então não amplifica carga.

## 8. Riscos
| # | Risco | Prob. x impacto | Mitigação |
|---|---|---|---|
| R1 | Divergência mock × API que a tela esconde (número diferente) | média x alto | paridade da seção 5 como portão H3 |
| R2 | F5/A1 estouram com 6 conexões e ~12 `GET` por painel | média x médio | medir em H6; escada: HTTP/2, concorrência, rota agregada |
| R3 | O2 paginado (200) vs mock completo | média x médio | verificar o cartão; `itensMeta` |

**Decisão proposta sobre o O2 paginado (FA-1, a confirmar no FA-3):** a API é a fonte de formato; o mock se alinha a ela, não o contrário. Proposta: o `HttpFonteMetricas` envia `pageSize=200` e a tela mostra o total vindo de `itensMeta` (contagem real) e a lista parcial só como amostra; "Ver dados em tabela" e exportação do O2 pedem páginas seguintes (`itensMeta`) até completar, em vez de assumir a lista inteira. O `MockFonteMetricas` passa a devolver `itens` limitado a 200 com `itensMeta` coerente, para a paridade (FA-4) comparar sem normalizar. Implementação fica com o `react-frontend` no FA-3; FA-1 não altera o front.
| R4 | Testes que dependem da latência e dos estados do mock (`?mock=`) quebram no modo `api` | alta x baixo | grupo `@mock`; `page.route` |
| R5 | Padrão `api` na imagem sem a API de pé deixa o painel todo em erro | baixa x médio | smoke H2 + H3 antes do H4 |
| R6 | `opcoesFiltroSchema` e `referenciaSchema` ficam só em `server/` (o front não os importa) | certa x baixo | node-backend move os dois para `@metricas-dspd/contratos` (sem mudar o contrato HTTP) |
| R7 | Instante em `/referencia` sem `Z` vs ADR 0007 (pendência de `http.md` §1) | baixa x baixo | o front só usa `dataReferencia` (data civil); decidir depois |
| R8 | Servidor lento na primeira chamada (cálculo a frio, S1 do ADR 0003) mostra "carregando" longo | média x baixo | já coberto pelo estado de carregamento; medir em A1 |

## 9. Decisões em aberto
- D1 (usuário não precisa decidir, arquiteto propõe): `staleTime` de `estadoColeta` em 60 s; demais `Infinity`.
- D2: padrão de `VITE_FONTE` na imagem de homologação = `api` (proposto). O usuário só valida o resultado; mock continua no PR e no dev.
- D3 (node-backend confirma): nenhuma rota nova no servidor; só o movimento de schemas (R6).

## 10. Cartões, ordem e esforço
| # | Cartão | Agente | Esforço | Depende de |
|---|---|---|---|---|
| FA-1 | Mover `opcoesFiltroSchema`/`referenciaSchema` para `@metricas-dspd/contratos` (re-export no servidor; OpenAPI inalterado) | node-backend | P | — |
| FA-2 | `HttpFonteMetricas` + `ErroApi` + `filtrosParaQuery` + `AbortSignal` na interface + testes unitários (fetch simulado, schema inválido, 4xx/5xx/503, cancelamento) | react-frontend | M | FA-1 (pode começar com o import local) |
| FA-3 | Seleção `VITE_FONTE`/`VITE_API_BASE`, `criarFontePadrao`, proxy de dev, build arg no Dockerfile, `.env.example`; `size` mostrando que o mock sai do modo `api`; verificar O2 (R3) | react-frontend | P | FA-2 |
| FA-4 | Teste de paridade mock × API (camadas a e b), seed derivado do mock | qa-engineer + node-backend (seed) | M | FA-2, HM-04 |
| FA-5 | E2E: `E2E_BASE_URL` com a SPA `api`, grupo `@mock`, cenários de erro por `page.route`, asserção de mesma origem; perf variante `api` com medição | qa-engineer | M | FA-3, HM-05 |
| FA-6 | Code review, parecer de QA em `docs/qa/`, revisão de segurança curta em `docs/security/` (itens da seção 7) | tech-lead, qa-engineer, software-architect | P | FA-2 a FA-5 |

Ordem: FA-1 e FA-2 em paralelo; FA-3 após FA-2; FA-4 e FA-5 em paralelo após FA-3 (o QA pode preparar os esqueletos de FA-4/FA-5 desde já). Total relativo: 2 pequenos + 3 médios (em torno de 4 a 6 dias-pessoa somados, 1 cartão em andamento por agente). Nenhuma mudança de interface visível: sem UX; o `ux-designer` só confirma, na revisão, que os estados de erro não ganharam texto novo.

## 11. Execução FA-4 e FA-5 (QA, 2026-10-12)
Entregues: teste de paridade (`web/paridade/`, `pnpm --dir web run test:paridade`), projetos E2E `chromium-api` e `perf-api` (ligados por `E2E_API_URL`), `scripts/com-api-mock.sh` e `server/tests/pg/servidor-api-mock.ts`. Resultado real e bugs em `docs/qa/front-via-api.md` e `docs/qa/bugs/FA-001` a `FA-005`: a paridade acusa 35 testes com defeito (seed sem referências, contagens divergentes em O10/O12/S7, `janela.*` descartada). **D2 não deve ser adotada antes de FA-001 a FA-003.** Proposta de D2 na seção final do plano de QA.
