# 099: varredura do dado simulado na web e proposta por item (E1.1)

- **Propósito:** listar todo ponto em que a web mostra dado simulado, fictício, de mock ou fixo fora do modo homologação (E1), dizer o que entra no lugar de cada um (E2) e propor a guarda contra a volta (E3). Pedido `docs/pedidos/099-nenhuma-metrica-simulada.md`, K-275.
- **Público:** dono, Jarvis, tech-lead, react-frontend, node-backend, ux-designer, qa-engineer.
- **Base lida:** a `develop` em `/home/rodrigoisensee/Metricas/MetricasDSPD-demo` (base-sha `ae009a75`, a mesma versão da demo do dono). Os caminhos e as linhas abaixo são dessa árvore. **Não li a base real nem `.env`; não rodei nada.** As provas são de leitura do código. As provas de execução ficam com o QA, como "vermelho antes do verde" das guardas (§6).
- **Estado:** proposta. Nenhuma linha de código muda por esta análise.

## 0. Resumo para o dono

1. **De onde vem o simulado.** A web de uso diário (`VITE_FONTE=api`, padrão do Docker) liga o "dado simulado por cartão" da ADR 0028 (pedido 070) em `web/src/app/App.tsx:41-42`. Quando a API responde "sem dado real" e a métrica pode ser simulada, o navegador gera o número com o mock, num Web Worker, e mostra o cartão com o selo "Simulado". **Toda métrica simulada que o dono vê sai por essa porta.** A API não devolve número inventado (ADR 0026): ela só autoriza a simulação com o campo `simulavel`.
2. **Tamanho.** São 45 cartões simulados. No Operacional são 20: na visão Semanal, 3 do núcleo e 9 em "Mais métricas"; na visão Sustentação, 4 do núcleo e 4 em "Mais métricas". O Tático tem 15 e o Estratégico tem 10, e nesses dois painéis todos os cartões são simulados. A visão Diária, o Resumo e a aba Apontamento não têm cartão simulado.
3. **Além do número, há textos que dizem "fictício"** na web de uso diário: a coluna "Dados" do Catálogo diz "Fictícios" em todas as linhas, inclusive nas reais, e 8 notas de cartão falam em mock. Há também listas fixas nos filtros (Tipo e times da Sustentação), que já estão nos pedidos 097 e 098.
4. **A correção é pequena.** Basta tirar o decorador `FonteComSimulado` em `App.tsx`. Com isso, os 45 cartões voltam a "Sem dado real" com o motivo, como decidido no pedido 060 (Q1 "A"). A ADR 0028 já previa essa volta como critério de reversão: "o dono pedir que o simulado saia do painel de uso diário". Depois vem a limpeza do código do simulado e a guarda.
5. **Três perguntas de produto** estão em §8: Q-099-1 (cartão sem dado real fica com o aviso ou sai da tela), Q-099-2 (Tático e Estratégico sem nenhuma métrica real) e Q-099-3 (remover o código do simulado ou só desligar). Cada uma traz uma recomendação.

## 1. Conferência com as regras e as ADRs

| Fonte | Situação |
|---|---|
| ADR 0026 (vigente): métricas só com dado real; o mapa `METRICAS_ORIGEM_REAL` é o portão; fora dele, "sem dado real" com o motivo; o mock só existe em testes, E2E, CI e homologação | **Volta a valer inteira na web.** A proposta repõe as consequências P4 e P5 que a 0028 tinha revisto. O servidor não muda de comportamento. |
| ADR 0028 (vigente): simulado por cartão com selo | **O critério de reversão aconteceu**: "o dono pedir que o simulado saia do painel de uso diário" (0028, Critério de reversão), e o pedido literal foi "quero que nao tenha nenhuma metrica simulada". O arquiteto escreve a ADR 0030, que revoga a 0028 sem editar o texto dela (L0, §7). |
| ADR 0021 (cálculo do mock em Web Worker) | O núcleo do mock deixa de servir a produção e volta a ser só do modo mock (testes, E2E, homologação). |
| CLAUDE.md: BusinessMap e Acelerato não se misturam; mínimo de 20; cálculo só na biblioteca | Nada muda. Tirar o simulado só tira número. |
| Fora do escopo do pedido: o modo homologação (`docker-compose.homolog.yml`, `VITE_FONTE: mock` na linha 81 e `DSPD_MODO_MOCK: homologacao` na linha 52) | Fica como está. Os itens só do modo mock estão em §4, com a prova de que não aparecem fora dele. |
| Afrouxa? | **Sim, um controle.** A proposta tira os testes que exigem o selo "Simulado" (ADR 0028) e põe as guardas G1 a G4 (§6) no lugar. Por isso vai ao dono pela Q-099-3 e pela ADR 0030 (`R-DECISAO`). Nenhum texto de `docs/regras/` muda. |

## 2. Aba Operacional (onde o dono viu o problema)

Mecanismo comum aos cartões marcados "sim" na coluna "Fora da homologação?": o cartão chama `useMetrica(id, filtros, { simulado: true })`. A API responde `sem-dado-real` com `simulavel: true` (`packages/contratos/src/origem.ts:143-150`). A web então pede o número a `FonteComSimulado.obterSimulado` (`web/src/data/FonteComSimulado.ts:78-105`, ligado em `web/src/app/App.tsx:41-42`), que gera a base fictícia com semente fixa (`gerarBaseMock`, núcleo em `web/src/data/mock/nucleoMock.ts:22`) e mostra o resultado com o selo e a faixa "Simulado" (`web/src/components/ui/CartaoMetrica.tsx:154`, `:265`, `:280`). O motivo da falta de dado real vem de `MOTIVO_ORIGEM_MOCK` (`origem.ts:74-90`) ou é o genérico "fonte real ainda não definida" (`origem.ts:93`).

**Proposta comum (E2):** o cartão mostra "Sem dado real" com o motivo, sem número, até a métrica entrar no mapa real pelo plano dela (ADR 0026, P3). Isso vale se a Q-099-1 for "A". Nos itens marcados "candidato a dado real", a fonte talvez já exista, mas isso **não se decide por inferência**: cada um precisa de plano próprio com a regra de cálculo confirmada.

### 2.1 Visão Diária e "O que pede atenção"
Nada simulado. O2, BLOQUEADOS e O1 estão no mapa real (`origem.ts:12-40`; BLOQUEADOS desde o pedido 075, com `BLOQUEIOS_COM_DADO_REAL = true` em `origem.ts:58`). As faixas de atenção (`web/src/features/operacional/AtencaoFluxo.tsx:10-30`) usam `useMetrica` sem `simulado` e só leem o real.

### 2.2 Visão Semanal (BusinessMap)

| # | Arquivo e linha | Seção · cartão | O que é simulado | Fora da homologação? | Proposta |
|---|---|---|---|---|---|
| OP-1 | `features/operacional/components/CartaoO12.tsx:11` | Compromissos · O12 Acordos e vencidos | O cartão inteiro (motivo: "aguardando campo no quadro") | sim | Sem dado real. O campo é de configuração (WS1), feita por pessoas. |
| OP-2 | `features/operacional/components/CartaoO15.tsx:18` | Qualidade · O15 Onde os bugs são encontrados | O cartão inteiro (aguardando campo no quadro) | sim | Sem dado real (depende de campo da WS1) |
| OP-3 | `features/operacional/components/CartaoO18.tsx:12` | Qualidade · O18 Entregas com e sem bug | O cartão inteiro (aguardando campo no quadro) | sim | Sem dado real (depende de campo da WS1) |
| OP-4 | `features/complementares/fluxo.tsx:126` | Mais métricas · Por que demora? · O8 Tamanho das demandas | O cartão inteiro (aguardando campo no quadro) | sim | Sem dado real |
| OP-5 | `features/complementares/operacionais.tsx:515` | Mais métricas · Por que demora? · O22 Primeiro toque | O cartão inteiro (motivo genérico; extensão "Também" só no mock, `server/src/modulos/metricas/servico.ts:80`) | sim | Sem dado real |
| OP-6 | `features/complementares/operacionais.tsx:240` | Mais métricas · Onde o trabalho acumula? · O20 Fluxo cumulativo | O cartão inteiro (motivo genérico) | sim | Sem dado real. É candidato a dado real por plano próprio. |
| OP-7 | `features/complementares/operacionais.tsx:614` | Mais métricas · Onde o trabalho acumula? · O24 Ordem de chegada | O cartão inteiro (motivo genérico) | sim | Sem dado real. É candidato a dado real por plano próprio. |
| OP-8 | `features/complementares/operacionais.tsx:316` | Mais métricas · Onde se perde esforço? · O21 Fluxo reverso | O cartão inteiro (motivo genérico) | sim | Sem dado real. É candidato a dado real por plano próprio. |
| OP-9 | `features/complementares/operacionais.tsx:701` | Mais métricas · Onde se perde esforço? · O25 Descarte | O cartão inteiro (motivo genérico) | sim | Sem dado real. É candidato a dado real por plano próprio. |
| OP-10 | `features/complementares/operacionais.tsx:841` | Mais métricas · Onde se perde esforço? · O26 Passagens de mão | O cartão inteiro (extensão "Também" só no mock) | sim | Sem dado real |
| OP-11 | `features/complementares/fluxo.tsx:293` | Mais métricas · O que entra? · O14 Origem da demanda | O cartão inteiro (aguardando campo no quadro) | sim | Sem dado real |
| OP-12 | `features/complementares/fluxo.tsx:345` | Mais métricas · Qualidade · O16 Estoque e idade de bugs | O cartão inteiro (aguardando campo no quadro) | sim | Sem dado real |

São reais e não mudam: O3, O9, O4, O10, O7 e EI-FL1 no núcleo, e O5, O6, O19, O11 e O13 em "Mais métricas". Pedem `simulado: true`, mas a API devolve o DTO real e o simulado nunca é pedido (`useMetrica.ts:73-77`).

### 2.3 Visão Sustentação (Acelerato)

| # | Arquivo e linha | Seção · cartão | O que é simulado | Fora da homologação? | Proposta |
|---|---|---|---|---|---|
| OP-13 | `features/sustentacao/components/CartaoS1.tsx:127` | Prazos · S1 Primeiro atendimento e restauração | O cartão inteiro (aguardando prazos de SLA por prioridade) | sim | Sem dado real |
| OP-14 | `features/sustentacao/components/CartaoS5.tsx:12` | Escalação · S5 Motivos da escalação | O cartão inteiro (aguardando tipo e domínio do campo do chamado, P-DS-19) | sim | Sem dado real |
| OP-15 | `features/sustentacao/components/CartaoS6.tsx:12` | Escalação · S6 Motivos de encerramento | O cartão inteiro (P-DS-19) | sim | Sem dado real |
| OP-16 | `features/sustentacao/components/CartaoS7.tsx:69` | Escalação · S7 Reclassificação | O cartão inteiro (P-DS-19) | sim | Sem dado real |
| OP-17 | `features/complementares/sustentacao.tsx:149` | Mais métricas · Por que demora? · S9 Tempo em pendência | O cartão inteiro (aguardando motivo de pendência) | sim | Sem dado real |
| OP-18 | `features/complementares/sustentacao.tsx:251` | Mais métricas · Qualidade · S11 Avaliação de Problema | O cartão inteiro (P-DS-19) | sim | Sem dado real |
| OP-19 | `features/complementares/sustentacao.tsx:25` | Mais métricas · Qualidade · O17 Defeitos por causa raiz e sistema | O cartão inteiro (aguardando campo) | sim | Sem dado real |
| OP-20 | `features/complementares/sustentacao.tsx:307` | Mais métricas · O que entra? · S12 Volume por sistema | O cartão inteiro (aguardando registro posterior de exceção de SLA) | sim | Sem dado real |
| OP-21 | `features/complementares/notas.ts:184` | Nota do S11 ("Cuidados") | Texto: "O campo de Registro de Problema é fictício por ora." | sim | Reescrever (UX) sem "fictício": o cartão já diz "Sem dado real" e o motivo. |
| OP-22 | `packages/contratos/src/filtros.ts:12-19`, `web/src/features/filtros/codec.ts:134` e `:249`, `server/src/modulos/referencia/servico.ts:34` | Filtro Equipe da Sustentação | Lista fixa das 3 equipes SSSC, não lida da base | sim | **Já tratado no 097 (E4) e no 098.** Os times passam a vir de `dim_chamado` (análise `docs/analises/097-filtros-plano.md`, §2). |

São reais e não mudam: S2, S3, S4, PV1 ("sem pesquisa" é a resposta real), S8 e S10. EI-SUST já mostra "Sem dado real" e não é simulada (`METRICAS_SEM_SIMULACAO`, `origem.ts:130-135`).

### 2.4 Filtros do Operacional (fluxo)

| # | Arquivo e linha | Onde | O que é fixo | Fora da homologação? | Proposta |
|---|---|---|---|---|---|
| OP-23 | `packages/contratos/src/comum.ts:48-56`; `web/src/features/filtros/BarraFiltros.tsx:27`; `codec.ts:109`, `:152` e `:254`; `server/src/modulos/referencia/servico.ts:26` | Filtro Tipo (Diária, Semanal, Mais métricas) | Lista fixa `TIPOS_FILTRO`. A web ignora `opcoes.tipos` da API, e "Incidente" nunca tem card real (ADR 0024) | sim | **Já tratado no 097 (E4).** Opção T-A da análise 097: as categorias presentes na base. |

### 2.5 Visão Resumo e aba Apontamento
- **Resumo:** nada simulado. `BlocoFluxo.tsx:26-36` e `BlocoSustentacao.tsx:22-25` usam `useMetrica` sem `simulado`, então O12 e S1 aparecem como "sem dado real" e nunca com número (ADR 0028, D6). O filtro de time do Resumo é do 097 (E1).
- **Apontamento:** nada simulado. A aba lê `GET /api/apontamento` (`features/apontamento/ApontamentoPage.tsx:50`). A fixture com nomes "Exemplo" (`features/apontamento/fixture.ts:483-494`) só é importada por testes e por `rota-falsa.ts`, que também só entra em testes (o `sem-fonte-metricas.test.ts:12` já confere). O agrupamento do AP-TIPO é o K-272 (097, E6).

## 3. Resto da web

### 3.1 Tático (15 cartões, todos simulados, nenhum no mapa real)

| # | Arquivo e linha | Cartão | Proposta |
|---|---|---|---|
| TA-1 a TA-7 | `features/tatico/components/CartaoT1.tsx:29`, `CartaoT2.tsx:14`, `CartaoT3.tsx:23`, `CartaoT4.tsx:20`, `CartaoT5.tsx:15`, `CartaoT7.tsx:16`, `CartaoT9.tsx:22` | T1, T2, T3, T4, T5, T7, T9 (núcleo) | Sem dado real (conforme Q-099-1 e Q-099-2) |
| TA-8 | `features/espera-invisivel/components/CartaoEI.tsx:288` | EI-FL2 | Sem dado real |
| TA-9 a TA-15 | `features/complementares/previsao.tsx:22` e `:113`; `taticas.tsx:57`, `:155`, `:304`, `:405` e `:554` | T6, T8, T10, T11, T12, T13, T14 (Mais métricas) | Sem dado real. T10 e T12 seguem fora do mapa (P-075-11 e P-075-12, "B"). |
| TA-16 | `features/tatico/notas.ts:22` | Nota do T2 | Texto "Neste mock o SLE é um valor de configuração…": reescrever sem "mock" (UX) |
| TA-17 | `features/tatico/notas.ts:31` | Nota do T3 | Texto "Valores de acordo no mock são fictícios.": tirar a frase |
| TA-18 | `features/complementares/notas.ts:300` e `:310` | Notas do T13 e do T14 | Texto "Dado fictício até a coleta real.": tirar a frase |
| TA-19 | `features/complementares/taticas.tsx:272` | Seletor de tipo do T11 | Lista fixa `TIPOS_FILTRO`: **já tratado no 097 (E4)** |

### 3.2 Estratégico (10 cartões, todos simulados)

| # | Arquivo e linha | Cartão | Proposta |
|---|---|---|---|
| ES-1 a ES-3 | `features/estrategico/components/CartaoE1.tsx:12`, `CartaoE2.tsx:11`, `CartaoE3.tsx:29` | E1, E2, E3 (núcleo) | Sem dado real |
| ES-4 | `features/espera-invisivel/components/CartaoEI.tsx:302` | EI-FL3 | Sem dado real |
| ES-5 a ES-10 | `features/complementares/previsao.tsx:180` e `:229`; `estrategicas.tsx:26`, `:192`, `:316` e `:408` | E4, E5, E9, E6, E7, E8 (Mais métricas) | Sem dado real |
| ES-11 | `features/estrategico/notas.ts:29` | Nota do E3 | "Valores são fictícios.": tirar a frase |
| ES-12 | `features/complementares/notas.ts:320` e `:342` | Notas do E6 e do E8 | "Dado fictício até a coleta real.": tirar a frase |

### 3.3 Telas que não são painel

| # | Arquivo e linha | Tela | O que é falso | Fora da homologação? | Proposta |
|---|---|---|---|---|---|
| WB-1 | `features/catalogo/linhas.ts:15` e `:39`; `features/catalogo/CatalogoPage.tsx:29-30` | Catálogo de métricas (`/metricas`), coluna "Dados" e parágrafo de abertura | "Fictícios" fixo em todas as linhas, inclusive nas métricas do mapa real; o texto "todas as métricas usam dados fictícios" | sim | Dado real: derivar a coluna de `origemDaMetrica` ("Real" ou "Sem dado real"; "Fictícios" só com a fonte mock). Reescrever o parágrafo (UX). |
| WB-2 | `web/src/styles/tokens.css:145` | CSS do botão "O que é simulado?" | Estilo do selo | inerte sem o simulado | Sai junto com o selo (L2c) |
| WB-3 | `features/visao-geral/VisaoGeralPage.tsx:201` | Visão geral | Nada: VISAO_GERAL fica fora do mapa e fora da simulação e mostra "sem dado real" | não | Sem mudança (o plano próprio da Visão Geral segue) |

## 4. O que só existe no modo homologação (fica)

São itens ligados só com `fonte.tipo === 'mock'`, que só existe com `VITE_FONTE=mock` explícito (`App.tsx:39-50`; o padrão do `docker/web/Dockerfile:8` é `api`):
- O selo global "Dados fictícios" (`app/AvisoDadosFicticios.tsx:12`), o título da aba (`app/AppShell.tsx:63` e `:76`), o rodapé (`app/Rodape.tsx:7`), a linha da Ajuda (`features/ajuda/AjudaPage.tsx:69` e `:167`) e o sufixo `_ficticio` da exportação (`features/exportar/modelo.ts:166`; `BotaoExportar.tsx:35`).
- O simulador de estados `?mock=` (`data/simulacao.ts`), que é ignorado contra a API (`data/useMetrica.ts:61` e `:148`), e a passagem desse parâmetro em `app/RedirecionaSustentacao.tsx:9` e `app/RedirecionaEsperaInvisivel.tsx:20`.
- O `status: 'mock'` do catálogo de cartões e `COM_EXTENSAO_MOCK` (`packages/contratos/src/cartoes.ts:42`, `:58-71`, `:90-93`). Na fonte API eles não valem (`features/coleta/OrigemDosCartoes.tsx:24-35`), e o provedor de origem envolve o app inteiro (`app/AppShell.tsx:137`).

## 5. API

Nada simulado fora da homologação. O modo mock só liga com `DSPD_MODO_MOCK=homologacao` (`server/src/plataforma/config.ts:36`, `entradas/api.ts:20`), recusa base com coleta real (`plataforma/db/guarda-mock.ts:10-19`) e carrega as extensões e a pesquisa fictícias só nesse modo (`app.ts:73-75`). Fora dele, a métrica fora do mapa responde `sem-dado-real` sem número (ADR 0026, P3).

| # | Arquivo e linha | O que muda | Proposta |
|---|---|---|---|
| API-1 | `packages/contratos/src/origem.ts:106` (campo `simulavel`), `:126-140` (`METRICAS_SEM_SIMULACAO`, `podeSimular`) e `:148`; `web/src/data/http/SemDadoRealErro.ts:12-18`; `web/src/data/http/HttpFonteMetricas.ts:116`; `docs/api/metricas.md:49` | É a autorização que a API dá à web para simular. Não é número, mas é a porta do simulado. | Sai do contrato e da resposta (L3). O campo é opcional: tirar não quebra nenhum cliente (`semDadoRealSchema` continua `.strict()`, sem o campo). |
| API-2 | `server/src/modulos/referencia/servico.ts:26` e `:34`; `server/src/modulos/metricas/schemas.ts:60` | Opções fixas de Tipo e de times da Sustentação | **Já tratado no 097 (E4) e no 098** |

## 6. Guarda contra a volta (E3)

### Por que o existente não basta
- **Regra de lint do mock** (`web/src/test/lint.meta.test.ts:171-215`): só `web/src/data/mock/` importa `@metricas-dspd/mock`. Ela não impede a produção de carregar `data/mock`. Prova: `FonteComSimulado.ts:28` faz `import('./mock/MockFonteMetricas')`, passa no lint e entra no build `api`.
- **Orçamento F9** (`web/scripts/size.mjs:59-66`): só falha se o mock estiver no bundle **inicial**. Com o mock num chunk sob demanda, o resultado é "ok". A ADR 0028 registra que esse chunk é baixado em produção (Consequências, "Piora").
- **E2E `*-api`** (`e2e/tests-api/simulado-070-l3.spec.ts`): exige o contrário do que se quer agora, ou seja, número **com** o selo "Simulado".
- Evidência de execução a produzir pelo QA (vermelho antes do verde): na `develop` de hoje, `VITE_FONTE=api pnpm --filter web exec vite build` seguido de `ls web/dist/assets | grep -E '^(nucleoMock|mock)'` deve listar arquivos. A guarda G1 tem de falhar nesse estado.

### Guardas propostas

| Id | O que é | Onde roda | Falha quando |
|---|---|---|---|
| G1 | Script `web/scripts/sem-mock.mjs`, chamado depois do `build` no `pronto` da web (`web/package.json:20`; o build padrão já é `api`). Ele lê `dist/assets` e `dist/index.html`. Para o script ter o que procurar, `App.tsx` passa a escolher a fonte por `import.meta.env.VITE_FONTE === 'mock'`, com o mock num `import()` dentro desse ramo; assim o Vite tira o mock do build `api`. O pacote mock ganha uma constante-sentinela em texto (ex.: `MARCA_DO_MOCK`) que sobrevive à minificação. | `pnpm run pronto` e a CI, pelo mesmo comando, sem passo novo no workflow | algum chunk do build `api` tem nome `nucleoMock*` ou `mock-*`, contém a sentinela, ou contém os textos "Simulado" ou "Dados de exemplo" |
| G2 | Extensão da regra de lint: fora de testes, só `app/App.tsx` (no ramo mock) importa de `web/src/data/mock/` | `lint.meta.test.ts` (já no `pronto`) | um módulo de produção importa `data/mock` |
| G3 | E2E `*-api` no lugar de `simulado-070-l3.spec.ts`: para cada cartão do catálogo, com a API respondendo `sem-dado-real` fora do mapa, o cartão mostra "Sem dado real" e nenhum número. A página não tem `[data-testid^="selo-simulado"]`, `faixa-simulado` nem `marca-dagua-simulado`, e a rede não pede chunk do mock nem o Worker. | projeto `chromium-api` | um cartão sem dado real mostra número, selo de simulado, ou o navegador baixa o mock |
| G4 | Teste unitário "painel sem nenhum dado real", que é o oráculo do "número fixo": uma fonte de teste em que **toda** métrica responde `SemDadoRealErro`. Ele renderiza Operacional (Diária, Semanal, Sustentação, Resumo), Tático e Estratégico, com "Mais métricas" aberta. Todo cartão do `CATALOGO_CARTOES` do painel tem de estar no estado `sem-dado-real`, e não pode haver texto "Simulado", "Dados de exemplo" nem "fictíci". | Vitest da web | algum cartão mostra conteúdo que não veio da fonte (número fixo ou simulado) |

G1 e G4 são mecanismos novos. G2 e G3 trocam controles que já existem. Nenhuma guarda toca banco, credencial, Docker ou workflow. Gatilho de segurança: nenhum, desde que G1 rode dentro do `pronto` da web; um passo novo no workflow seria gatilho de CI.

### Critério de parada (PAR-P2)
- bloqueia: build de produção da web (`VITE_FONTE=api`) com código do mock, ou cartão que mostra número sem dado real vindo da API.
- C1-mock-no-build · chunk do mock, sentinela ou texto do selo no `dist` do build `api` · oráculo: `pnpm --filter web run build && node web/scripts/sem-mock.mjs`
- C2-import-de-producao · módulo fora de teste (e fora do ramo mock do `App.tsx`) importa `web/src/data/mock/` · oráculo: `pnpm --filter web exec vitest run src/test/lint.meta.test.ts`
- C3-numero-sem-dado · cartão do catálogo fora do estado `sem-dado-real` com a fonte sem nenhum dado · oráculo: o teste G4 no Vitest da web
- C4-selo-na-api · selo, faixa ou marca d'água "Simulado", ou download do Worker do mock no build `api` · oráculo: `E2E_API_URL=… pnpm --filter e2e exec playwright test --project=chromium-api` (G3)
- gatilho · oráculo: na `develop` de hoje, G1 e G3 ficam vermelhos (o mock está no build `api` e o selo aparece); depois do L2, ficam verdes.

## 7. Lotes (até 150 linhas cada; estimativas, o tech-lead recorta se passar)

| Lote | Agente | Conteúdo | Depende de | Em paralelo com |
|---|---|---|---|---|
| L0 | software-architect | ADR 0030: revoga a 0028, devolve à 0026 as consequências P4 e P5 e anota a 0021 (o núcleo do mock volta a ser só do modo mock). Só docs. | Q-099-3 | QA prepara G3 e G4 |
| L1 | react-frontend | **Correção visível:** `App.tsx:41-42` passa a usar `HttpFonteMetricas` sem `FonteComSimulado`, e os testes de composição se ajustam (`app/composicao.test.tsx`, `app/app.test.tsx`). Efeito: os 45 cartões vão para "Sem dado real" com o motivo. Cerca de 40 linhas. | L0 | L4 |
| L2a | react-frontend | Tira a opção `simulado` de `useMetrica` (`useMetrica.ts:56` e `:71-104`) e o `{ simulado: true }` dos cerca de 75 cartões. Cerca de 130 linhas. | L1 | L3 |
| L2b | react-frontend | Apaga `data/FonteComSimulado.ts`, `data/simulado.ts`, as exportações em `data/index.ts:22-31` e `SemDadoRealErro.simulavel`, mais os testes desses arquivos (`data/simulado.test.tsx`). Quase tudo é remoção. | L2a | L3 |
| L2c | react-frontend | Tira o selo da interface: `components/ui/SeloSimulado.tsx`, os ramos de `CartaoMetrica.tsx:143-176`, `:213`, `:265`, `:280`, `:332-366` e `:376`, `OrigemCartao.simulado` (`Ficticios.tsx:15`), `OrigemDosCartoes.tsx:47-63`, `StatusMeta.tsx:25-30`, `CartaoT3.tsx:12-14` e `tokens.css:145`, mais os testes (`components/ui/simulado.test.tsx`, `features/coleta/simulado.test.tsx`) | L2b | L4 |
| L2d | react-frontend | O ramo mock do `App.tsx` passa a usar `import.meta.env` e `import()`, e entram G1 (`sem-mock.mjs` no `pronto` da web) e G2 | L2c | L3 |
| L3 | node-backend | Tira do contrato `simulavel`, `podeSimular` e `METRICAS_SEM_SIMULACAO` (`origem.ts:106` e `:126-150`); atualiza `origem.test.ts`, `server/tests/painel-real-f6.test.ts`, `docs/api/metricas.md:49` e o OpenAPI | L1 (com a web ignorando o campo, a remoção é segura) | L2a a L2d |
| L4 | ux-designer (texto) e react-frontend | Catálogo (WB-1) e as 8 notas (OP-21, TA-16 a TA-18, ES-11, ES-12). Cerca de 50 linhas. | L0 | L1 a L3 |
| L5 | qa-engineer | G3 (troca `e2e/tests-api/simulado-070-l3.spec.ts`), G4, a prova vermelho-antes-do-verde de G1 e G3, e o parecer em `docs/qa/` | prepara desde L0; roda depois de L2d e L3 | todos |

O L1 sozinho já resolve o que o dono vê, e o servidor não muda. Os lotes L2 a L3 tiram o código parado e fecham a porta. Se a Q-099-1 ou a Q-099-2 forem "B" ou "C", entra um lote de UX e react-frontend para esconder cartões ou painéis, depois do L1.

Riscos:
- **R1:** com o L1, o Tático e o Estratégico ficam inteiros em "Sem dado real" (é o efeito previsto na ADR 0026); daí a Q-099-2.
- **R2:** o `perf-api` (`e2e/perf/perf-api.spec.ts`) mede um painel com simulado; a medição muda, e o QA deve ajustar a referência.
- **R3:** o orçamento F6 deve cair cerca de 2,3 KB (a nota da ADR 0028 sobre o L2 do 070), o que só melhora.
- **R4:** O20, O21, O24 e O25 parecem calculáveis com dado já coletado, mas isso é regra de negócio e vira plano próprio, não inferência.

## 8. Perguntas ao dono (só escolha de produto)

- **Q-099-1. O que o cartão sem dado real mostra?** (A) Fica visível, com "Sem dado real" e o motivo (ex.: "aguardando campo no quadro"), como o dono decidiu no pedido 060 (Q1 "A"). (B) Sai da tela até ter dado real. (C) O cartão do núcleo fica com "Sem dado real" e o complementar sem dado real sai de "Mais métricas" (no Operacional, a seção cai de 14 para 5 cartões no fluxo e de 6 para 2 na Sustentação). **Recomendação: A.** Já foi decidido assim, mostra o que falta e por quê, e não exige tela nova. A opção C é a melhor alternativa se o "Mais métricas" ficar poluído.
- **Q-099-2. Tático e Estratégico, que hoje não têm nenhuma métrica real.** (A) Ficam no menu, com cada cartão em "Sem dado real" e a nota do cabeçalho "N cartões sem dado real", que já existe (`OrigemDosCartoes.tsx:76-88`). (B) Saem do menu até ter a primeira métrica real. (C) Ficam no menu com um aviso único no topo ("Este painel ainda não tem dado real") e sem os cartões. **Recomendação: A.** É coerente com a Q-099-1 e não exige mudança de navegação. A opção C é melhor para leitura, mas pede desenho do UX.
- **Q-099-3. O código do simulado.** (A) Remover o simulado por cartão (decorador, selo, opção nos cartões, campo `simulavel`) e os testes dele, com as guardas G1 a G4 no lugar. (B) Só desligar (L1) e deixar o código parado para religar depois. **Recomendação: A.** Código parado continua no build de produção e pode ser religado sem querer. O G1 só é possível com o mock fora do build `api`. Se um dia o dono quiser o simulado de volta, a ADR 0028 e o histórico do git guardam o desenho. Ao escolher A, o dono aceita tirar os testes do selo "Simulado" (§1, "Afrouxa").
