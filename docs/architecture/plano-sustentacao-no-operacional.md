---
tipo: plano-tecnico
contrato: 1
pedido: sustentacao-no-operacional
estado: aceito
ux: docs/ux/sustentacao-no-operacional/especificacao.md
adrs: [0003, 0011, 0012, 0019]
agentes: [node-backend, react-frontend, qa-engineer, tech-lead, ux-designer]
---

# Plano técnico: Sustentação dentro do Operacional

**Conferência com as regras.** Não existe `docs/constituicao.md`; a conferência foi feita contra as regras invioláveis do `CLAUDE.md`.
- Uma fonte por cálculo: **conforme**. As duas séries novas são métricas separadas, uma por fonte; o Resumo mostra dois blocos sem nenhum número combinado.
- Story, frente e projeto nunca no mesmo histograma: **conforme**. O Resumo só usa story (O3, O4, O2, O12).
- Biblioteca compartilhada (T2.5): **conforme**. Os pontos mensais chamam `calcularO3` e `calcularS2` na data de referência (ADR 0019). A interface não calcula percentil, taxa nem média.
- Mínimo de 20 itens e janela de 12 semanas: **conforme** (Q1 e Q2).
- Nenhuma avaliação individual: **conforme**. Não há nenhuma visão por pessoa.
- Mudança de critério marcada (T2.6): **conforme**. As séries trazem `criterios`.
- **Desvio a decidir (P1, abaixo):** a resposta Q7 do time ("O3 sem segmentar por tipo") conflita com o briefing (catálogo, O3: "segmentada por tipo") e com a regra da biblioteca (`REGRAS_METRICA.O3.segmentacao = ['tipo']`: percentil só dentro da classe). Pela `R-CONFORMIDADE`, isso não se contorna: vai ao usuário. O contrato foi desenhado por tipo, para que o back não espere a resposta.

Base lida: a spec de UX inteira (D1 a D3 e Q1 a Q7 decididas, sem reabrir nenhuma); o registro de implementação da espera invisível; o código de `feature/espera-invisivel-nos-paineis` (`OperacionalPage`, `SustentacaoPage`, `PainelPagina`, `filtros/{paineis,useFiltros,codec,useParametroLocal}`, `exportar/selecao`, `coleta/fontes`, `RedirecionaEsperaInvisivel`, `router`, `visao-geral`, `destinoCartao`, `ProvedorPainelPreferencias`, `SeletorCadencia`); os contratos (`schemas.ts`, `metricas.ts`, `comum.ts`); a biblioteca (`calcular.ts`, `o3.ts`, `s2.ts`, `s3.ts`, `regras.ts`); o serviço e as rotas de métricas.

**Começa depois** do merge de `feature/espera-invisivel-nos-paineis` na `develop`. Branch: `feature/sustentacao-no-operacional`, criada da `develop` já com esse merge.

---

## 1. Resumo
- `/operacional` ganha o seletor **Visão: Resumo (padrão) · Diária · Semanal · Sustentação**, gravado no parâmetro `cadencia`. O nome do parâmetro não muda, para os links atuais continuarem valendo.
- A página `/sustentacao` deixa de existir: vira um redirecionador para `/operacional?cadencia=sustentacao`, com os filtros convertidos para `sust_*` e o hash preservado.
- O conteúdo da Sustentação vira uma visão carregada sob demanda (chunk próprio), com os filtros `sust_*` na mesma URL dos filtros do fluxo.
- **Resumo** (novo): dois blocos empilhados, Fluxo de projeto · BusinessMap e Sustentação · Acelerato, cada um com "Pede atenção", números-chave, tendência dos 6 últimos meses fechados e links para as outras visões.
- Back-end: só a tendência mensal (duas métricas novas, ADR 0019) e um campo novo no S3 (`janela`). O resto reaproveita os DTOs atuais.

## 2. Módulos afetados

### Back-end e pacotes compartilhados (`node-backend`)
| Módulo | Mudança |
|---|---|
| `packages/contratos/src/comum.ts` | `METRICA_IDS` += `TENDENCIA_FLUXO`, `TENDENCIA_SUST` |
| `packages/contratos/src/schemas.ts` | `resultadoTendenciaFluxo`, `resultadoTendenciaSust`; `resultadoS3` ganha `janela` (acréscimo compatível) |
| `packages/contratos/src/metricas.ts` | `ContratoMetricas` (os dois ids novos, sem filtros); `METRICAS_SUSTENTACAO` += `TENDENCIA_SUST` |
| `packages/contratos/src/validacao.ts` | `SCHEMAS_RESULTADO` com os dois ids |
| `packages/contratos/src/cartoes.ts` | Ids de seção das complementares da sustentação: `por-que-demora`, `qualidade` e `o-que-entra` viram `sust-por-que-demora`, `sust-qualidade` e `sust-o-que-entra`. Nenhum id de cartão muda. **Tarefa do front (F4)**, com revisão do back. |
| `packages/metricas/src/` | `businessmap/tendencia.ts`, `acelerato/tendencia.ts`, `acelerato/s3.ts` (campo `janela`), `calcular.ts` (`CALCULOS`), `core/regras.ts` (duas linhas) |
| `server/src/modulos/metricas/{rotas,schemas}.ts` | Os ids novos aceitam só `dataReferencia` (schema `strict`, como a `VISAO_GERAL`) |
| `docs/api/metricas.md`, `docs/tecnica/biblioteca-de-calculo.md` | Contratos e regras das métricas novas |

### Front-end (`react-frontend`)
| Módulo | Mudança |
|---|---|
| `features/operacional/visao.ts` (novo) | Tipo `Visao`, leitura de `cadencia`, a tabela hash → visão, normalização da URL e montagem de links. Módulo puro. |
| `features/operacional/useVisaoOperacional.ts` (novo) | Hook: escolha com `push`, normalização com `replace`, hash com prioridade sobre `cadencia` |
| `features/operacional/OperacionalPage.tsx` | Vira a casca que monta a visão ativa; Diária e Semanal ficam nela |
| `features/operacional/resumo/*` (novo) | `VisaoResumo`, `BlocoResumo`, `NumeroChave`, `TendenciaMensal`, `AtencaoResumo` |
| `features/operacional/atencao.ts` (novo) | Funções puras dos itens de "Pede atenção" (O2, Bloqueados, O1, O3, O10, O12; S2, S1), usadas pelas visões e pelo Resumo |
| `features/sustentacao/SustentacaoPage.tsx` → `VisaoSustentacao.tsx` | Mesmo conteúdo, montado como chunk sob demanda pelo Operacional |
| `features/painel/PainelPagina.tsx` | `PainelSustentacao` aceita `prefixo`; a `Casca` aceita a legenda da barra e a fonte da visão; o título e o slug ficam "Operacional" |
| `features/filtros/{paineis,useFiltros,BarraFiltros,AvisoFiltrosInvalidos,ChipsFiltros}` | Parâmetros de cartão da sustentação conhecidos em `/operacional`; rótulo "Equipe de sustentação"; legenda com a fonte; aviso de valor inválido cita a fonte; linha dos filtros guardados da outra fonte |
| `features/coleta/fontes.ts` | `dominiosDaRota(caminho, busca, hash)`: a fonte de `/operacional` vem da visão |
| `features/exportar/{selecao,DialogoExportar,BotaoExportar}` | Rótulo "Operacional · Sustentação", `rota: '/operacional'`, filtros lidos de `sust_*`; títulos do diálogo; "Exportar vários" com pré-seleção no Resumo |
| `features/preferencias/*` | `ROTULO_PAINEL.sustentacao` = "Operacional · Sustentação", logo depois de "Operacional"; popover "Métricas desta visão". **Chave gravada `sustentacao` intacta.** |
| `features/visao-geral/{VisaoGeralPage,textos}` | `ROTA_DO_NIVEL.sustentacao`, `EI_NIVEIS.SUST`, destino dos alertas S*, "Revisão da sustentação" em "Por reunião", `cadencia` explícito nas reuniões do fluxo |
| `features/complementares/LeiaJunto.tsx` | Link cruzado O15 → O17 rotulado com a visão e a fonte |
| `components/ui/{SeletorCadencia,FaixaAtencao}` | Seletor: rótulo "Visão", intenção (pré-carga) e anúncio; faixa: sufixo da fonte no título |
| `app/{router,rotas,RedirecionaEsperaInvisivel,AppShell}`, `app/RedirecionaSustentacao.tsx` (novo) | Redirecionadores, menu sem "Sustentação", título do documento por visão |
| `lib/destinoCartao.ts`, `content/catalogo-metricas.ts`, `features/ajuda/*`, `coleta/SemDadosDaFonte` | Destinos e textos ("visão Sustentação do Operacional") |
| `e2e/lighthouse/lighthouserc.cjs`, `e2e/fixtures/constantes.ts` | Lighthouse nas três URLs (`/operacional`, `?cadencia=semanal`, `?cadencia=sustentacao`) |

## 3. Modelo de dados
Nenhuma tabela, coluna, migração ou GRANT novo. Nenhum dado de pessoa entra em contrato novo. O `data-model.md` não muda.

## 4. Contratos

### 4.1 Rota, parâmetros e visão
| Elemento | Regra |
|---|---|
| Parâmetro | `cadencia` ∈ `resumo` · `diaria` · `semanal` · `sustentacao` |
| Padrão | `resumo`, **omitido** na URL canônica. `?cadencia=resumo` é aceito e removido com `replace`. |
| Valor desconhecido | Resumo, com o aviso de valor inválido (2.6), e a URL corrigida com `replace` |
| Trocar a visão no seletor | `push` (o Voltar desfaz). Escolher Resumo remove `cadencia`. Os demais parâmetros ficam intactos. Isto muda o comportamento atual: hoje `useParametroLocal` usa `replace`. O hook novo não reaproveita esse. |
| Hash | Vence `cadencia` (tabela 4.2). A URL é corrigida com `replace`, mantendo o hash. |
| Filtros do fluxo | Sem prefixo: `equipe`, `tipo`, `sistema`, `periodo`, `de`, `ate`. Todos os links atuais continuam valendo. |
| Filtros da sustentação | Prefixo `sust_`: `sust_equipe`, `sust_prioridade`, `sust_periodo`, `sust_de`, `sust_ate` (mecanismo já restaurado em `codec`/`useFiltros`) |
| Parâmetros de cartão | Sem prefixo e únicos: `o2`, `o3`, `o7`, `o9`, `o10`, `ei_fl1`, `s3`, `s4`, `s5`, `s6`, `ei_sust` |
| No Resumo | Nenhum filtro é lido nem gravado, e nenhum parâmetro é removido: tudo fica guardado para as outras visões |

Normalização (2.6.1) em `/operacional`:
- `PAINEIS.operacional.params` passa a incluir os parâmetros de cartão da sustentação (`s3`, `s4`, `s5`, `s6`, `ei_sust`). Sem isso, a Diária e a Semanal os apagam.
- Os `sust_*` não estão em `PARAMS_CONHECIDOS`, por isso não são apagados. Um teste trava esse invariante.
- `prioridade` sem prefixo continua sendo "não aplicável" em `/operacional` e é removido em silêncio. Os links antigos que a usam passam pelo redirecionador.
- Na visão Sustentação, `useFiltros('sustentacao', { prefixo: 'sust_' })` já pula a remoção de conhecidos (`prefixo !== ''`). Por isso os filtros do fluxo ficam.
- A memória de sessão continua só do fluxo (`memorizaFluxo` exige prefixo vazio). Nada muda nela.

### 4.2 Hash → visão
A tabela é **derivada do catálogo** (`cartoesDoPainel('operacional' | 'sustentacao')` e os ids de seção). Não é uma lista escrita à mão, a não ser pelo que o catálogo não tem: os cartões da Diária e as âncoras do Resumo.
| Hash | Visão |
|---|---|
| `#o2`, `#bloqueados`, `#o1` | Diária |
| Demais cartões do painel `operacional` (núcleo, `ei-fl1`, complementares), seções `#tempo`, `#fluxo`, `#compromissos`, `#backlog`, `#qualidade`, `#espera-invisivel`, `#compl-<secao do fluxo>` | Semanal |
| Cartões do painel `sustentacao` (S1 a S12, `o17`, `ei-sust`, `pv1`), seções `#prazos`, `#volume`, `#causas`, `#espera`, `#percepcao`, `#compl-sust-*` | Sustentação |
| `#resumo-fluxo`, `#resumo-sustentacao`, `#tendencia-fluxo`, `#tendencia-sustentacao` | Resumo |
| `#mais-metricas`, vazio ou desconhecido | a do `cadencia` (Resumo, se ausente) |

A comparação ignora maiúsculas (como já faz o redirecionador da espera invisível). Teste obrigatório: **nenhum hash pertence a duas visões**.

### 4.3 Redirecionamentos
`/sustentacao` (componente síncrono, sem chunk de página, `<Navigate replace>`):
| Entrada | Saída |
|---|---|
| caminho | `/operacional`, com `cadencia=sustentacao` sempre |
| `equipe`, `prioridade`, `periodo`, `de`, `ate` | `sust_equipe`, `sust_prioridade`, `sust_periodo`, `sust_de`, `sust_ate` |
| `sust_*` já com prefixo (link gerado entre as duas demandas) | intactos |
| `s3`, `s4`, `s5`, `s6`, `ei_sust`, `mock` | intactos |
| qualquer outro (`tipo`, `sistema`, `cadencia`...) | descartado |
| `#compl-por-que-demora`, `#compl-o-que-entra`, `#compl-qualidade` | `#compl-sust-por-que-demora`, `#compl-sust-o-que-entra`, `#compl-sust-qualidade` |
| qualquer outro hash | intacto |

`/espera-invisivel#ei-sust`: em vez de ir para `/sustentacao` sem prefixo, vai direto para `/operacional?cadencia=sustentacao` com os `sust_*` **intactos**, mais `ei_sust` e `mock`. Os do fluxo são descartados. Os outros hashes não mudam. Isso corrige um detalhe de hoje: o `mock` cai no grupo do fluxo e se perde no ramo `#ei-sust`.

Segurança: o destino é sempre um caminho interno fixo. Nenhum valor da URL vira `pathname`, e os parâmetros são reconstruídos com `URLSearchParams`, sem redirecionamento aberto.

Outros destinos:
- `destinoDoCartao`: painel `sustentacao` → `/operacional?cadencia=sustentacao#<id>`. No painel `operacional`, a visão vem da tabela 4.2 (`#o2` → `diaria`), em vez de `semanal` fixo.
- Visão geral: `ROTA_DO_NIVEL.sustentacao` = `/operacional?cadencia=sustentacao`; `EI_NIVEIS.SUST.rota` = `/operacional?cadencia=sustentacao#ei-sust`; os alertas `S2_*`/`S1_*` levam `?cadencia=sustentacao#<ancora>`; os alertas O1/O2 levam `?cadencia=diaria` (o padrão sem parâmetro agora é o Resumo). "Por reunião" ganha "Revisão da sustentação · semanal" depois da "Revisão de fluxo semanal". Nenhum link da Visão geral leva ao Resumo (5.9.5).
- `dominiosDaRota('/operacional', busca, hash)`: Resumo → `['businessmap', 'acelerato']`; Sustentação → `['acelerato']`; Diária/Semanal → `['businessmap']`. `CalibracaoDasFontes` passa a usar `useLocation()` inteiro.

### 4.4 Métricas novas (alto nível; o detalhe e a OpenAPI são do `node-backend`)
`GET /api/v1/metricas/TENDENCIA_FLUXO?dataReferencia=AAAA-MM-DD` e `GET /api/v1/metricas/TENDENCIA_SUST?dataReferencia=...`
- Query `strict`, só com `dataReferencia` (sem filtros: o Resumo usa os padrões, Q5). As mesmas regras de data futura, cache, `etag`, `x-data-referencia` e `x-versao-criterio` das outras métricas.
- **Meses:** os 6 últimos meses-calendário cujo último dia é menor ou igual à data de referência. O mês em curso fica fora (Q4).
- **Mesmo eixo nos dois blocos:** a interface manda nas duas consultas a mesma `dataReferencia`: a mais antiga das duas últimas coletas ok (a regra que a `VISAO_GERAL` já usa). Se uma fonte não tem coleta, usa a da outra, e o bloco da fonte sem coleta mostra `SemDadosDaFonte`.

Esqueleto (o nome final dos campos fica com o back):
```ts
// TENDENCIA_FLUXO (BusinessMap, story)
{ base, criterios, meses: Array<{
    mes: 'AAAA-MM'; fimDoMes: 'AAAA-MM-DD';
    janelaPercentis: Janela;                 // 12 semanas até fimDoMes
    p85PorTipo: Array<{ tipo: TipoCard; estatistica: Estatistica<{ p50: number; p85: number }> }>; // = calcularO3(ctx(fimDoMes), 12s).classes
    concluidos: number;                       // contagem do mês-calendário pela data de conclusão (sempre publicada, Q2)
}> }

// TENDENCIA_SUST (Acelerato, chamado)
{ base, criterios, meses: Array<{
    mes: 'AAAA-MM'; fimDoMes: 'AAAA-MM-DD';
    janela: JanelaCalculo;                    // 12 semanas até fimDoMes
    prioridades: ResultadoS2['prioridades'];  // = calcularS2(ctx(fimDoMes), { periodo: 12s }).prioridades
    volume: number;                           // contagem do mês-calendário (base: P4)
}> }
```
- O ponto "k de 5 fora do alvo" (Q3 e Q6) **não é calculado no back nem na tela**. A tela usa a mesma função pura que já conta as prioridades fora no "Pede atenção" (`contarForaS2`, extraída para `atencao.ts`), para os dois lugares nunca divergirem. A apresentação de prioridades com amostra insuficiente depende de P2.
- O P85 vem **por tipo** (classe estatística do O3). A forma de mostrá-lo no Resumo depende de P1.

`S3` (acréscimo compatível): `janela: { total: number; p1p2: Taxa }` sobre o período filtrado, com o mínimo de 20 da `taxa` (Q2). Alimenta o número-chave "Volume na janela e proporção de P1+P2". A tela não soma meses nem calcula proporção.

### 4.5 Origem de cada número do Resumo (sem cálculo na tela)
| Bloco | Número | Origem | Filtros |
|---|---|---|---|
| Fluxo | P85 (P50 em segundo plano) | `O3.classes[*].estatistica` (forma: P1) | padrão do fluxo (12 semanas) |
| Fluxo | Vazão: última semana fechada e faixa de 12 semanas | `O4.semanas` (última com `emAndamento=false`) e `O4.faixa` | idem |
| Fluxo | Itens abertos acima do P95 | `O2.acimaP95` | idem |
| Fluxo | Vencidos por causa interna | `O12.vencidosCausaInterna` | idem |
| Sustentação | Prioridades com aderência < 90% | `contarForaS2(S2.prioridades)`, regra igual à do "Pede atenção" | 12 semanas no Resumo (P3 = a); no detalhe, o período do filtro (padrão 6 meses, Q5) |
| Sustentação | Prioridades com mediana acima do alvo | `S1.prioridades[*].restauracao.statusMeta`, regra igual à do "Pede atenção" | idem |
| Sustentação | Volume e P1+P2 | `S3.base.n` e `S3.janela.p1p2` | idem |
| Ambos | "Pede atenção" | `atencao.ts` (mesmas regras de hoje) | Resumo: 12 semanas; detalhe: período do filtro. Janela do alerta segue a opção (a) da U1 (duas janelas, explicadas na tela) até o usuário decidir |
| Ambos | Tendência | `TENDENCIA_FLUXO`, `TENDENCIA_SUST` | sem filtros |

Com filtros padrão, as consultas são as mesmas da Diária, da Semanal e da Sustentação. O cache do React Query é compartilhado, e a ida às visões de detalhe é imediata.

## 5. Desenho do front (para o `react-frontend`)
- **Casca por visão.** `OperacionalPage` lê a visão (`useVisaoOperacional`) e monta: Diária/Semanal → `PainelFluxo painel="operacional"` (como hoje); Sustentação → `lazy(() => import('@/features/sustentacao/VisaoSustentacao'))` dentro de `Suspense`, com o esqueleto da visão (sem tela em branco); Resumo → `VisaoResumo`, no chunk da página, porque é a primeira tela. Só a visão ativa monta e consulta dados.
- **Pré-carga:** `SeletorCadencia` ganha `onIntencao(valor)` (ponteiro e foco). A visão Sustentação chama o `import()` nessa hora. Na Diária e na Semanal, o chunk da Sustentação não baixa sem intenção (CA-21).
- **`PainelSustentacao`** ganha `prefixo` (`'sust_'` em `/operacional`) e continua passando `painelDoCorpo="sustentacao"` para preferências e exportação. O título fica "Operacional", com o slug `operacional`.
- **Cabeçalho:** a fonte e o frescor são os da visão ativa. No Resumo, os dois frescores aparecem, um em cada bloco. A pergunta e o público vêm por visão (microcopy, seção 10 da spec).
- **Barra de filtros:** a prop `legenda` gera um `fieldset`/`legend` ("Filtros do fluxo de projeto · BusinessMap" ou "Filtros da Sustentação · Acelerato"). O rótulo de `equipe` vem por domínio ("Equipe de sustentação"). A linha "Os filtros do ... (n ativos) continuam guardados..." conta com a função pura `contarAtivos(params, dominio, prefixo)` (leitura via `codec`, sem normalizar a outra fonte).
- **Título do documento:** `handle.titulo` passa a aceitar uma função de `Location` em `AppShell`. O Operacional devolve "Operacional · Resumo", "Operacional · Diária" etc. As outras rotas não mudam.
- **Anúncio da troca de visão:** uma região `aria-live="polite"` própria do seletor ("Visão Sustentação. Fonte: Acelerato."). O foco fica no rádio.
- **Resumo:**
  - Cada bloco é uma `section` com `h2`, o seu `CorpoDaFonte` (`SemDadosDaFonte` só nele) e estados de carregar e de erro independentes ("Tentar de novo" por bloco e por série).
  - A tendência só dispara depois dos números-chave do bloco (`enabled` quando as consultas do bloco resolvem, sem derrubar se uma delas falhar).
  - O gráfico usa o Recharts, no chunk de gráficos (ADR 0012, F8). Um mês sem valor publicado aparece como marcador vazado, sem linha ligando os vizinhos (`connectNulls=false`), e com o rótulo "poucos itens (n=..)".
  - Cada série tem "Ver como tabela", e o título declara "janela de 12 semanas até o fim do mês". A mudança de critério aparece como linha vertical (o componente atual de marcações).
  - Os números de cartão oculto viram o marcador da P1 (lido de `usePreferencias().ocultosNaVisita` dos dois painéis), e a série correspondente some.
  - Só existe "Exportar vários painéis", com `operacional` e `sustentacao` pré-selecionados. Não aparecem a barra de filtros nem o popover "Métricas".
- **Exportação:** `filtrosDoNivel('sustentacao', '/operacional', params)` lê com prefixo `sust_`; `filtrosDoNivel('operacional', ...)` lê sem prefixo. `NIVEIS`: a Sustentação passa logo depois do Operacional, com o rótulo "Operacional · Sustentação" (o `ux-designer` confere a ordem na revisão). O nome do arquivo e o escopo (`sustentacao`, `fluxo-operacional`) não mudam.
- **Preferências:** sem migração e sem chave nova. O teste com `localStorage` pré-carregado (CA-14 e CA-29) garante a ida e volta de versão.

## 6. Riscos
| # | Risco | Prob. × impacto | Mitigação |
|---|---|---|---|
| R1 | P85 "sem segmentar" (Q7) viola a regra do O3 por tipo | certo se implementado × alto | Contrato por tipo (4.4). Forma de exibir decidida pelo usuário (P1). Nenhum percentil entre tipos sem ADR e exceção ao briefing. |
| R2 | Custo da tendência: até 6 contextos por fonte, a frio, depois de cada carga | média × média | Cache por versão de carga (ADR 0019). Medir A1 (< 300 ms p95) e C4 no `perf-api.spec.ts`. Se estourar, pré-cálculo no worker, nunca troca de semântica. |
| R3 | O Resumo é a página padrão e faz cerca de 12 GETs (7 do fluxo, 3 da sustentação, 2 de tendência) | média × média | Tendência depois dos números; cache compartilhado com as visões; esqueletos de altura fixa (CLS); Lighthouse em `/operacional` contra a ADR 0003. Plano B, com ADR, se estourar: um endpoint de composição **por fonte**. |
| R4 | A normalização 2.6.1 apaga `sust_*` ou `s3`/`ei_sust` em `/operacional` | alta sem teste × alto (link perdido) | `params` do operacional ampliado; testes de invariante no `useFiltros` e E2E CA-6 e CA-11 |
| R5 | Hash ambíguo entre visões (ex.: `qualidade` × `sust-qualidade`) | baixa × médio | Tabela derivada do catálogo, mais teste de unicidade |
| R6 | Links internos que esperavam a Diária caem no Resumo | média × médio | Auditoria por `grep` de `'/operacional'` sem `cadencia` (Visão geral, catálogo, Ajuda, redirecionadores, E2E); CA-24 |
| R7 | ~~Números da sustentação em 6 meses (Q5) ao lado de uma série de 12 semanas (Q1): o último ponto difere do número~~ **Superado pela P3 = (a) (seção 10):** no Resumo, números e série usam 12 semanas. Resta a diferença entre o Resumo (12 semanas) e o detalhe (período do filtro), tratada pela U1 = (a) | baixa × baixo (leitura) | Janela escrita em cada número, no título da série e no "Pede atenção" |
| R8 | Coletas das duas fontes em meses diferentes desalinham o eixo | baixa × baixo | A mesma `dataReferencia` (a mais antiga) nas duas tendências (4.4) |
| R9 | Contradição da spec na base do volume mensal da sustentação | certa × médio | Pergunta P4. Até lá, a série de volume não entra no merge. |
| R10 | Conflito com a branch da espera invisível (mesmos arquivos) | alta × baixo | Só começa depois do merge dela; branch nova a partir da `develop` |
| R11 | `handle.titulo` como função muda o `AppShell` de todas as rotas | baixa × baixo | Teste do shell para rota com string e com função |
| R12 | Rotatividade de E2E: 17 specs citam `/sustentacao` ou `/operacional` sem parâmetro | certa × médio | Tarefa própria (F8) e lista na seção 8 |

Segurança (skill `cyber-security`): nada muda em autenticação, banco, CI, Docker ou dependências. As superfícies novas são duas rotas GET com query `strict` (parâmetro desconhecido devolve 400), DTOs só com agregados (sem id, título ou pessoa do Acelerato; allow-list e GRANT intactos) e dois redirecionadores para caminho fixo (sem redirecionamento aberto). Não é preciso registro novo em `docs/security/`. O `tech-lead` confere esses três pontos no code review.

## 7. Divisão de tarefas

Ordem: **B1 primeiro** (contrato, pequeno). Depois rodam em paralelo o back (B2, B3) e o front (F1 a F5, F7), que não dependem da tendência. **F6 (Resumo)** espera B1 e B2: a fonte mock da interface usa a própria biblioteca. O QA prepara os testes desde o início. Limite de 1 cartão por agente.

### Back-end (`node-backend`)
- **B1. Contratos** (bloqueia F6 e B2). Ids novos, schemas, `ContratoMetricas`, `METRICAS_SUSTENTACAO`, `SCHEMAS_RESULTADO`, `S3.janela`, `fonteDaMetrica` (o teste de varredura exige uma fonte conhecida para cada id).
  *Pronto quando:* `pnpm run pronto` passa, o compilador acusa as faltas em `CALCULOS` e `REGRAS_METRICA` até B2, e o teste de varredura cobre os ids novos.
- **B2. Biblioteca.** Tarefas:
  - `calcularTendenciaFluxo` e `calcularTendenciaSust` (ADR 0019): contexto por fim de mês e chamada a `calcularO3`/`calcularS2` com `12s`.
  - Contagens mensais pela seleção das métricas de origem: O4 pela data de conclusão; S3 pela base decidida em P4.
  - `criterios` do intervalo.
  - Linhas em `REGRAS_METRICA`: domínio único, `segmentacao` `['tipo']` / `['prioridade']`, mínimo 20 sobre percentis e taxas, granularidade `story` / `chamado`.
  - `S3.janela`.

  *Pronto quando:*
  - Teste de propriedade: para cada mês, o ponto é igual a `calcularO3`/`calcularS2` no contexto do fim do mês.
  - Mês com 19 itens na janela devolve `insuficiente` sem valor; mês sem itens devolve a contagem 0.
  - O mês em curso nunca entra.
  - Arquivados e excluídos contam.
  - A saída não depende da ordem de entrada.
  - Cobertura de 100%.
- **B3. API e documentação.** As rotas aceitam só `dataReferencia`; parâmetro extra devolve 400 e data futura também. `docs/api/metricas.md` e `biblioteca-de-calculo.md` atualizados. Medição A1/A2 a frio e a quente no `perf-api.spec.ts`.
  *Pronto quando:* os testes de API passam (200, 304 por `etag`, 400) e a medição está registrada contra a ADR 0003.

### Front-end (`react-frontend`)
- **F1. Fundação da visão.**
  - `visao.ts` (tipo, leitura, tabela 4.2 derivada do catálogo, normalização, `hrefDaVisao`).
  - `useVisaoOperacional` (`push` na escolha, `replace` na normalização, hash com prioridade).
  - `dominiosDaRota` com busca e hash; `destinoDoCartao`.

  *Pronto quando:* existem testes de tabela para cada linha da 4.1 e da 4.2, mais o teste de unicidade dos hashes.
- **F2. Filtros com dois conjuntos.**
  - `PAINEIS.operacional.params` ampliado.
  - Legenda da barra; rótulo "Equipe de sustentação"; aviso de inválido com a fonte.
  - `contarAtivos` e a linha dos filtros guardados.
  - `filtrosDoNivel` com prefixo.

  *Pronto quando:* há testes do invariante "Diária, Semanal e Sustentação não apagam o conjunto da outra fonte" e do CA-6 em teste de integração.
- **F3. Redirecionadores e menu.**
  - `RedirecionaSustentacao` (`destinoDaSustentacao` puro, tabela 4.3) e ajuste de `destinoDaEsperaInvisivel`.
  - `router` sem a página `/sustentacao`; `rotas.ts` sem o item; Lighthouse nas três URLs.

  *Pronto quando:* há testes de tabela do redirecionador, e `/sustentacao` não carrega nenhum chunk de página.
- **F4. Visão Sustentação.**
  - `VisaoSustentacao` como chunk sob demanda; `PainelSustentacao` com prefixo.
  - Ids de seção `sust-*` no catálogo; título da faixa com a fonte; índice P3 da visão.
  - Pré-carga por intenção.

  *Pronto quando:* CA-2, 3, 5, 7, 8, 10 e 22 passam em teste de integração (Vitest), e o build mostra a Sustentação num chunk separado.
- **F5. Casca do Operacional.**
  - Seletor com 4 opções, rótulo "Visão", anúncio.
  - `document.title` por visão; cabeçalho com a fonte da visão; pergunta e público por visão.
  - `atencao.ts` extraído (Diária, Semanal e Sustentação passam a usá-lo, sem mudar o comportamento).
  - Leia junto O15 → O17 cruzado.

  *Pronto quando:* os testes atuais de `diaria`, `semanal` e `sustentacao` passam, adaptados só em rota e rótulo, mais CA-18 e CA-19 (anúncio e título).
- **F6. Resumo** (depois de B1 e B2).
  - Os dois blocos, números (4.5), "Pede atenção", tendência com tabela e marcadores, estados, ocultos, "Exportar vários" pré-selecionado e a linha "filtros guardados não se aplicam".
  - **A forma do P85 depende de P1**, a apresentação do "k de 5" de P2 e a série de volume de P4.

  *Pronto quando:* CA-23 a CA-31 passam em teste de integração com `FonteFixa` (inclusive mês com n=14, erro de um bloco e fonte sem coleta).
- **F7. Visão geral, catálogo, preferências, exportação e textos.** Os itens da seção 2: Ajuda, glossário e `SemDadosDaFonte` com o texto "visão Sustentação do Operacional".
  *Pronto quando:* CA-14 a CA-17 passam em teste de integração.
- **F8. Migração dos testes existentes**, unitários e E2E: tudo o que abre `/sustentacao` ou espera a Diária em `/operacional` sem parâmetro.
  *Pronto quando:* `pnpm run pronto` passa com cobertura de 100% e a suíte E2E completa passa.

### QA (`qa-engineer`), em paralelo desde B1
- **Q1.** Spec E2E nova `e2e/tests/sustentacao-no-operacional.spec.ts` com os **critérios 1 a 31** da spec de UX (um `test` por critério; 375 e 1280 onde o critério pede).
- **Q2.** Adaptação de `a11y`, `responsivo`, `filtros`, `exportar`, `preferencias`, `complementares`, `b3-sust-ei-vg`, `espera-invisivel-nos-paineis`, `lacuna-de-valor`, `shell`, `integracao-real*`, `acabamento-ux-evidencias` e `b3-a11y-evidencias`. Excluir o `zz-qa-tmp.spec.ts`, se ainda existir.
- **Q3.** Desempenho: Lighthouse nas três URLs e `perf-api` das métricas de tendência.
- **Q4.** Parecer em `docs/qa/`.

### Revisões
- `tech-lead`: code review de B1 a B3 e F1 a F8, com atenção a R1, R4 e à seção de segurança.
- `ux-designer`: revisão da interface depois de F6, incluindo a ordem de "Vários painéis" e de Preferências.

## 8. Plano de testes

### Unitários e de integração (Vitest; **cobertura de 100%** de linhas, ramos, funções e instruções, exigida pelo `pnpm run pronto`)
| Alvo | Casos |
|---|---|
| `packages/metricas` tendência | Equivalência ponto ≡ métrica de origem na data (propriedade, fixtures geradas); limite 19/20; mês vazio = 0; mês em curso fora; data de referência no último dia do mês e no primeiro dia do mês seguinte; arquivados e excluídos contam; mudança de critério dentro do intervalo aparece em `criterios`; nenhuma leitura do contexto da outra fonte (contexto vazio da outra fonte não muda o resultado) |
| `packages/metricas` `S3.janela` | `p1p2` com n 19/20; período custom |
| `regras.property.test.ts` | Linhas novas passam nas propriedades atuais (classe estatística, ordem neutra, mínimo) |
| `server` rotas | 200 com schema de saída; 304; 400 para filtro em `TENDENCIA_*`; 400 para data futura |
| `visao.ts` | Cada linha da 4.1 e da 4.2; maiúsculas; unicidade dos hashes; `hrefDaVisao` preserva os dois conjuntos de filtros e o `mock` |
| `useVisaoOperacional` | `push` na escolha, `replace` na normalização, hash vence, Voltar desfaz |
| `RedirecionaSustentacao`, `destinoDaEsperaInvisivel` | Cada linha da 4.3 (tabela de casos) |
| `useFiltros`/`codec` | Os `sust_*` sobrevivem à Diária e à Semanal; `s3`/`ei_sust` sobrevivem; `prioridade` sem prefixo é removido; ida e volta com prefixo; aviso de inválido cita a fonte |
| `selecao.filtrosDoNivel` | `sust_*` em `/operacional`; padrões fora dele |
| `dominiosDaRota` | As 4 visões, mais hash |
| `atencao.ts` | Regras atuais (O2, Bloqueados, O1, O3, O10, O12, S2, S1), vazio |
| Resumo | Números com n < 20; marcador oculto; erro e recarregar por bloco; `SemDadosDaFonte` só no bloco; série com mês não publicado (sem valor, rótulo com n); "Ver como tabela"; nenhum código S* no bloco Fluxo e nenhum O* no bloco Sustentação |
| `AppShell` | Título com string e com função |

### E2E (Playwright, `e2e/tests/sustentacao-no-operacional.spec.ts`)
- Critérios 1 a 31 da spec, com estes pontos de atenção:
  - CA-6 (filtros guardados ao trocar);
  - CA-11 a 13 (redirecionamentos e hash);
  - CA-14 e CA-29 (`localStorage` pré-carregado);
  - CA-21 (o chunk da Sustentação não baixa na Diária e na Semanal: interceptar as requisições de `assets`);
  - CA-27 (mês com poucos itens).
- A fonte mock precisa ter ao menos 7 meses de histórico e um mês com menos de 20 itens na janela, para o CA-27. Se o gerador não produzir isso, o `react-frontend` cria um cenário mock dedicado (parâmetro `mock`), combinado com o QA.
- axe (sem violações sérias) e ausência de rolagem horizontal em 375 e 1280 nas quatro visões.

## 9. Perguntas ao usuário (regra de negócio; nada foi decidido por inferência)
- **P1 (bloqueia só o número e a série de P85 do bloco Fluxo).**
  - A resposta Q7 ("O3 sem segmentar por tipo") junta tipos diferentes num mesmo percentil. O briefing define o O3 "segmentado por tipo", e a biblioteca proíbe percentil entre classes.
  - Qual forma vale?
    - (a) **tipo predominante** na janela (o mesmo critério da aba padrão do cartão O3), rotulado ("P85 · Melhoria"), com "ver por tipo" levando ao O3; a série é desse mesmo tipo. Recomendado: cumpre a regra e não exige cálculo novo.
    - (b) um P85 por tipo no número e na série.
    - (c) percentil com todos os tipos juntos. Exigiria uma exceção formal ao briefing (ADR e mudança em `REGRAS_METRICA`).
- **P2 (bloqueia só a apresentação da série "k de 5" da Sustentação).**
  - Num mês em que alguma prioridade tem menos de 20 chamados na janela, a aderência dela não é publicada.
  - O ponto deve mostrar:
    - (a) "k de m avaliadas", com m < 5 escrito e "não publicado" só se m = 0;
    - (b) "não publicado" se qualquer prioridade estiver insuficiente;
    - (c) outro critério?
- **P3 (não bloqueia; o plano segue Q5 ao pé da letra).** **Superada: respondida (a) na seção 10; o texto abaixo é a pergunta original.**
  - Os números-chave da Sustentação usam a janela do detalhe (6 meses, Q5). A série usa 12 semanas até o fim do mês (Q1). Por isso o último ponto e o número podem diferir; as duas janelas ficam escritas na tela.
  - Confirma? Ou os números da Sustentação no Resumo também devem usar 12 semanas, como dizia o wireframe?
- **P4 (bloqueia só a série de volume da Sustentação).**
  - A spec diz que a sustentação pertence ao mês "pela data de fechamento do chamado (as mesmas bases dos cartões S1/S2/S3)". Mas o cartão S3 conta os chamados **abertos** no mês.
  - A série "volume de chamados" usa:
    - (a) a data de abertura, igual ao cartão S3, para o ponto bater com o detalhe;
    - (b) a data de fechamento.

## 10. Respostas do usuário
- **P1 (2026-10-13): (a) tipo predominante.** O Resumo mostra o P85 do tipo com mais itens na janela, rotulado ("P85 · <tipo>"), com "ver por tipo" levando ao O3; a série segue o mesmo tipo. Substitui a resposta Q7 do time no ponto "sem segmentar".
- **P2 (2026-10-13): (a)** o ponto mostra "k de m avaliadas" (m < 5 escrito quando alguma prioridade tem menos de 20 chamados na janela); "não publicado" só se m = 0.
- **P3 e P4 (2026-10-13): delegadas ao time pelo usuário** ("UX, tome as decisões").
  - **P3 = (a):** os números da Sustentação no Resumo usam 12 semanas, a mesma janela da série; os 6 meses ficam no painel detalhado.
  - **P4 = (a):** a série de volume usa a data de abertura, a mesma base do cartão S3, para o ponto bater com o detalhe.
