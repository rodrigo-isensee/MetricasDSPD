# Plano de testes - Sustentação dentro do Operacional (K-080)

Links: especificação `docs/ux/sustentacao-no-operacional/especificacao.md` (CA-1 a CA-31, seção 11); plano técnico `docs/architecture/plano-sustentacao-no-operacional.md` (contratos 4.1 a 4.5, respostas P1 a P4 na seção 10); review `docs/reviews/sustentacao-no-operacional.md` (reprovado na volta 1: B1, M1 a M3, L1 a L8). Contrato da API: `docs/api/metricas.md` (TENDENCIA_FLUXO, TENDENCIA_SUST, `S3.janela`).

Branch `feature/sustentacao-no-operacional`, worktree `/home/rodrigoisensee/MetricasDSPD-sust`. Cobre o back B1 a B3 (K-072) e o front F1 a F8 (K-073). Este documento é o **plano**: nada foi executado (os autores ainda corrigem a volta 1). O parecer `R-QA` é outro arquivo, `docs/qa/sustentacao-no-operacional.md`, escrito depois do review aprovado, com o commit HEAD testado.

## 1. Escopo

Dentro:
- 31 critérios de aceite, do menu ao Resumo.
- Contratos novos: 53 `MetricaId`, `ResultadoS3.janela` obrigatório, tendências mensais.
- Ids de seção `sust-*` com redirecionamento dos hashes antigos.
- `/operacional` sem `cadencia` abrindo o Resumo.
- Regras invioláveis, acessibilidade (WCAG 2.2 AA), layout 375 e 1280.
- Medição A1/A2 no Postgres real (pendente do review).

Fora:
- Revisão visual e ordem de "Vários painéis" e Preferências: `ux-designer`.
- Parecer de segurança: `security-engineer` (os casos de abuso dele viram teste aqui quando chegarem).
- Pipeline e container: `devops-engineer`.
- Cálculo em si das métricas de origem (O3, S2): coberto por testes anteriores; aqui só a equivalência ponto mensal = métrica de origem.

Estado dos testes existentes (diff contra `origin/develop`): já há `e2e/tests/sustentacao-no-operacional.spec.ts` (31 testes, um por CA, mais variantes a 375/1280 do CA-19 e CA-20) e muitos testes de unidade e integração novos. Os autores escreveram o grosso. O trabalho do QA é: (a) provar que cada teste existente falha quando a obrigação quebra (vermelho antes do verde e mutação), (b) cobrir as lacunas marcadas "a escrever" abaixo, (c) executar e reportar.

Convenção da coluna "Teste": caminho relativo à raiz da worktree. "existe" = já no diff; "a escrever (QA)" = o QA cria em `e2e/tests/` ou ajusta; "a escrever (dev)" = unidade/integração, pede-se ao autor (QA não altera código de produção, mas pode escrever teste). Prioridade A = bloqueia; M = média; B = baixa.

## 2. Cenários por critério de aceite

E2E principal: `e2e/tests/sustentacao-no-operacional.spec.ts` (abreviado E2E-SNO). Mock é a fonte padrão. Cada caso abaixo pode ter mais de um teste, listados.

### 2.1 Menu, seletor, fontes (CA-1 a CA-10)

| ID | CA | Cenário (fronteira protegida) | Teste | Prior. |
|---|---|---|---|---|
| CT-01 | 1 | Navegação global sem "Sustentação" e com "Operacional", em 1280 e 375 (menu recolhido) | E2E-SNO CA-1 (existe); `web/src/app/app.test.tsx` (existe) | A |
| CT-02 | 2 | Seletor `radiogroup` "Visão" com 4 opções; Resumo marcado sem parâmetro; escolher Sustentação grava `cadencia=sustentacao` com entrada no histórico (Voltar volta ao Resumo) e mostra `recorte-sustentacao` e `#prazos #volume #causas #espera #percepcao` | E2E-SNO CA-2; `web/src/features/operacional/useVisaoOperacional.test.tsx`, `visoes.test.tsx` (existem) | A |
| CT-03 | 2 | Navegação só por teclado no seletor: Tab chega ao grupo, setas trocam a opção e o foco fica no rádio (também Home/End se o grupo as aceita, anotar) | E2E-SNO CA-19 foco (parcial); teclado completo: a escrever (QA) | A |
| CT-04 | 3 | Sustentação: nenhum `metrica-O*` exceto O17; Diária e Semanal: nenhum `metrica-S*`, `EI-SUST`, `PV1` (inclui complementares abertas) | E2E-SNO CA-3 (existe); asserção com mínimo de cartões visíveis: conferir guarda contra suíte vazia | A |
| CT-05 | 4 | Todo cartão visível (núcleo, complementar aberto, EI, PV1) tem "Fonte: ..." coerente; PV1 é o único "Pesquisa de percepção" | E2E-SNO CA-4 (existe); `web/src/components/ui/ui.test.tsx` (existe) | A |
| CT-06 | 5 | Legenda "Filtros da Sustentação · Acelerato" com só Equipe de sustentação, Prioridade, Período (padrão 6 meses); fluxo com Equipe, Tipo, Sistema, Período (12 semanas), sem Prioridade; legenda é `fieldset/legend` ou grupo rotulado | E2E-SNO CA-5; `web/src/features/filtros/duas-fontes.test.tsx` (existem) | A |
| CT-07 | 6 | `?cadencia=semanal&equipe=X&periodo=4s` → Sustentação, Prioridade P1 → `sust_prioridade=P1` e `equipe=X&periodo=4s` mantidos; voltar mostra chips X e 4 semanas; "Limpar filtros" numa visão não toca a outra (R4 do plano) | E2E-SNO CA-6; `duas-fontes.test.tsx` (existem) | A |
| CT-08 | 6 | Invariante: Diária e Semanal não apagam `sust_*`, `s3 s4 s5 s6 ei_sust`; `prioridade` sem prefixo é removida em silêncio; Sustentação não apaga os filtros do fluxo | `duas-fontes.test.tsx`, `web/src/features/filtros/filtros-url.test.tsx` (existem); mutação no `PAINEIS.operacional.params` | A |
| CT-09 | 6 | Linha "Os filtros do ... (n ativos) continuam guardados..." nas duas direções e no Resumo, com n correto (bordas: 0 ativo some, 1, 5) | `duas-fontes.test.tsx` (existe, conferir 0 e recíproca); E2E-SNO CA-29 | M |
| CT-10 | 5 | Valor inválido: `sust_prioridade=P9` ignorada com aviso "Prioridade 'P9' não existe na Sustentação e foi ignorada." (cita a fonte); `cadencia=xyz` cai no Resumo com aviso e URL corrigida por `replace` | `duas-fontes.test.tsx`, `visao.test.ts` (existem); E2E do aviso: a escrever (QA) | M |
| CT-11 | 7 | Rodapé de cartão: S* nunca cita Tipo/Sistema; O* nunca cita Prioridade; PV1 "Não afetado pelos filtros" | E2E-SNO CA-7 (existe) | M |
| CT-12 | 8 | Faixa da Sustentação com "Sustentação (Acelerato)" e só S2/S1; Semanal só O3/O10/O12; Diária só O2/Bloqueados/O1 e título "Pede atenção hoje · Fluxo de projeto (BusinessMap)" | E2E-SNO CA-8; `web/src/features/operacional/atencao.test.ts` (existem) | A |
| CT-13 | 9 | Texto "Também nesta aba" ausente nas 4 visões | E2E-SNO CA-9 (existe) | B |
| CT-14 | 10 | Índice da Sustentação na ordem do CA; ocultar S3 e S4 retira "Volume e resolução"; resumo "1 pede atenção / 1 oculta / sem alerta"; a 375 vira seletor "Seção" fixo com "Filtros (n)" | E2E-SNO CA-10 (existe; 375 conferir) | M |

### 2.2 Redirecionamentos, hash, preferências, exportação, catálogo (CA-11 a CA-18)

| ID | CA | Cenário (fronteira protegida) | Teste | Prior. |
|---|---|---|---|---|
| CT-15 | 11 | `/sustentacao?prioridade=P1&periodo=12m&equipe=Y&tipo=Bug#s2` → `/operacional?cadencia=sustentacao&sust_prioridade=P1&sust_periodo=12m&sust_equipe=Y#s2`, sem `tipo`, `metrica-S2` visível e focado, Voltar não volta a `/sustentacao` (sem laço); sem sistema `sistema` descartado | E2E-SNO CA-11; `web/src/app/redireciona.test.tsx` (existem) | A |
| CT-16 | 11 | `/sustentacao` pura → `/operacional?cadencia=sustentacao`; `sust_*` já prefixados, `s3 s4 s5 s6 ei_sust mock` intactos; `cadencia` de entrada descartada | `redireciona.test.tsx` (existe, tabela 4.3) | A |
| CT-17 | 11 | Hashes antigos `#compl-por-que-demora`, `#compl-o-que-entra`, `#compl-qualidade` viram `#compl-sust-*` com "Mais métricas" aberto e o cartão focado (risco: ids `sust-*`) | E2E-SNO CA-11 (cobre só `#compl-qualidade`: os outros dois a escrever, QA); `redireciona.test.tsx` | A |
| CT-18 | 11 | Segurança do redirecionador: valor em `?next=//evil.com`, `equipe=%0d%0a`, `//` em hash, nada vira `pathname`; destino sempre `/operacional` | a escrever (QA, E2E, caso de abuso) + `redireciona.test.tsx` conferir | A |
| CT-19 | 12 | `?cadencia=diaria#s1` → Sustentação com `metrica-S1` focado; `?cadencia=sustentacao#o3` → Semanal com `metrica-O3` focado; hash em maiúsculas (`#S2`) | E2E-SNO CA-12; `web/src/features/navegacao/visao.test.ts` (existem); maiúsculas conferir | A |
| CT-20 | 12 | Unicidade: nenhum hash pertence a duas visões (`qualidade` × `sust-qualidade`, `espera` × `espera-invisivel`), tabela derivada do catálogo; guarda contra tabela vazia | `visao.test.ts` (existe, conferir mínimo de itens) | A |
| CT-21 | 13 | `/espera-invisivel?sust_prioridade=P2&equipe=X#ei-sust` → `/operacional?cadencia=sustentacao&sust_prioridade=P2#ei-sust`, em um salto, sem `equipe`; `mock` preservado; `#ei-fl1` não regride | E2E-SNO CA-13; `redireciona.test.tsx` (existem) | A |
| CT-22 | 14 | `localStorage` `{versao:1,paineis:{sustentacao:{ocultar:['s3','pv1']}}}`: marcadores de S3 e PV1; ocultar S5 grava em `paineis.sustentacao.ocultar` (mesma chave, mesmo formato); Preferências mostra "Operacional · Sustentação" logo após "Operacional" | E2E-SNO CA-14; `web/src/features/preferencias/preferencias.test.tsx` (existem) | A |
| CT-23 | 14 | Ida e volta de versão: o perfil gravado pela versão nova ainda é lido pelo schema antigo (`versao:1`, sem chave nova, nada apagado) | a escrever (QA, unidade/E2E com perfil antigo e novo) | A |
| CT-24 | 15 | Exportar na Sustentação: só Acelerato visível, sem oculta, escopo `sustentacao`, filtros `sust_*` da URL; Semanal só BusinessMap, escopo `fluxo-operacional`, nome de arquivo inalterado; "Vários painéis" com "Operacional · Sustentação", seções separadas por fonte | E2E-SNO CA-15; `selecao.test.ts`, `DialogoExportar.test.tsx`, `exportar.sistemico.test.tsx` (existem) | A |
| CT-25 | 15 | Oculto fora do arquivo exportado (regra do 007), conteúdo do arquivo conferido (não só o botão) | a escrever (QA, abrir o arquivo baixado) | M |
| CT-26 | 16 | Visão geral: link do nível, alerta S*, `#ei-sust`, "Revisão da sustentação · semanal" levam à Sustentação sem parâmetro do fluxo; reuniões do fluxo levam `cadencia` explícito; alertas O1/O2 levam `?cadencia=diaria`; nenhum leva ao Resumo | E2E-SNO CA-16; `web/src/features/visao-geral/visao-geral.test.tsx`, `web/src/lib/destinoCartao.test.ts` (existem) | A |
| CT-27 | 17 | Catálogo: S1 a S12, O17, EI-SUST, PV1 com painel "Operacional · Sustentação" e destino `/operacional?cadencia=sustentacao#<id>`; filtro "Painel" sem "Sustentação" sozinha; contagens inalteradas | E2E-SNO CA-17; `catalogo.test.tsx` (existem) | M |
| CT-28 | 18 | O15 → O17 com "visão Sustentação, fonte Acelerato": troca a visão, abre "Mais métricas", foca `metrica-O17`; nenhum número cruza | E2E-SNO CA-18; `web/src/features/complementares/leiajunto.test.tsx` (existem) | M |

### 2.3 Acessibilidade, layout, desempenho, estados (CA-19 a CA-22)

| ID | CA | Cenário | Teste | Prior. |
|---|---|---|---|---|
| CT-29 | 19 | axe (tags WCAG 2.2 AA) sem violações críticas ou sérias nas 4 visões, a 375 e 1280, também com "Mais métricas" aberto e com cartão oculto (marcador P1) | E2E-SNO CA-19 (axe; existe, usar tags `wcag22aa`, conferir); variantes aberta/oculta: a escrever (QA) | A |
| CT-30 | 19 | Troca de visão anuncia "Visão Sustentação. Fonte: Acelerato." em região `aria-live="polite"`; título do documento por visão (`Operacional · Resumo · Métricas DSPD` etc.); foco no rádio | E2E-SNO CA-19 (segundo teste); `AppShell` título string e função em `web/src/app/app.test.tsx` (existem) | A |
| CT-31 | 19 | Chegada por hash: foco no título do cartão (ou no "Mostrar" do marcador) com foco visível e não encoberto pela barra fixa (2.4.11); `prefers-reduced-motion` sem rolagem suave | E2E-SNO CA-11/12 (foco, parcial); 2.4.11 e reduced-motion: a escrever (QA) | M |
| CT-32 | 20 | Sem rolagem horizontal (`scrollWidth <= clientWidth`) nas 4 visões a 375 e 1280; seletor com alvos de 44 px a 375, em até 2 linhas, também com fonte ampliada (zoom 200%) | E2E-SNO CA-20 (existe); zoom 200% a escrever (QA); `e2e/tests/responsivo.spec.ts` (adaptado) | A |
| CT-33 | 21 | Diária e Semanal não baixam o chunk da Sustentação; baixa na intenção (hover/foco do rádio) e na escolha; `/sustentacao` não carrega chunk de página | E2E-SNO CA-21 (existe); inspeção do build: `pnpm --filter web build` e conferir o chunk separado | A |
| CT-34 | 21 | Lighthouse e orçamento da ADR 0003 nas 3 URLs: `/operacional`, `?cadencia=semanal`, `?cadencia=sustentacao` | `e2e/lighthouse/lighthouserc.cjs` (existe, ajustado); executar `pnpm --filter @metricas-dspd/e2e run perf:tudo` | A |
| CT-35 | 22 | Acelerato sem coleta ok: `SemDadosDaFonte` só na Sustentação (texto "visão Sustentação do Operacional"); visões do fluxo funcionam; no Resumo só o bloco da Sustentação | E2E-SNO CA-22; `web/src/features/coleta/*.test.tsx` e `fontes.test.ts` (existem) | A |
| CT-36 | 8 (erro) | Erro de um cartão: "Tentar de novo", sem derrubar a seção nem a visão (`mock=erro:<ID>`) | `e2e/tests/estados.spec.ts` (adaptado); caso em visão Sustentação a escrever (QA) | M |

### 2.4 Resumo (CA-23 a CA-31)

| ID | CA | Cenário (fronteira protegida) | Teste | Prior. |
|---|---|---|---|---|
| CT-37 | 23 | `/operacional` sem parâmetro: Resumo marcado, `resumo-fluxo` antes de `resumo-sustentacao`, URL sem `cadencia`; `?cadencia=resumo` aceito e normalizado por `replace` (sem entrada no histórico); voltar ao Resumo remove `cadencia` com `push` | E2E-SNO CA-23; `useVisaoOperacional.test.tsx` (existem) | A |
| CT-38 | 24 | Compatibilidade: `cadencia=diaria|semanal|sustentacao` e hashes antigos como antes; nenhum link interno (Visão geral, catálogo, Ajuda, redirecionadores) que esperava a Diária cai no Resumo. Varredura: `grep '/operacional'` sem `cadencia` no código e nos E2E (R6) | E2E-SNO CA-24; varredura por grep: a executar (QA) | A |
| CT-39 | 25 | Fontes separadas: selo e frescor por bloco; nenhum S*, EI-SUST, PV1 no bloco Fluxo; nenhum O* (inclui O17) no bloco Sustentação; nenhum total ou valor combinado; blocos empilhados a 1280 (`y` do segundo > `y+altura` do primeiro) | E2E-SNO CA-25; `web/src/features/operacional/resumo/resumo.test.tsx` (existem) | A |
| CT-40 | 26 | Números-chave: Fluxo = O3, O4, O2, O12; Sustentação = S2, S1, S3; cada um com base, unidade (dias úteis, horas úteis) e link "Ver ..." à visão dona; janela de 12 semanas escrita nos dois blocos (P3) | E2E-SNO CA-26; `resumo/modelo.test.ts`, `resumo/componentes.test.tsx` (existem) | A |
| CT-41 | 26 | Fronteira dos 20: n=19 "Poucos itens (n=19). Estatística não publicada.", sem valor; n=20 publica; contagens (vencidos, acima do P95, vazão) publicadas sempre, com n | `modelo.test.ts` (conferir 19/20); E2E-SNO CA-26 (n<20 via mock) | A |
| CT-42 | 26 | P1: P85 do tipo predominante rotulado "P85 · <tipo>", série do mesmo tipo, "ver por tipo" leva ao O3; empate de tipos é determinístico; critério igual ao do O3 (L8) | `modelo.test.ts`, `CartaoO3` testes (conferir empate); a escrever (dev) se faltar | A |
| CT-43 | 27 | Tendência: 6 meses-calendário fechados (mês em curso fora), hoje 14/10/2026 = abril a setembro; mês <20 sem valor, marcador vazado, sem linha ligando vizinhos, rótulo "poucos itens (n=14)"; "Ver como tabela" com mês, valor, n e "não publicado"; título "janela de 12 semanas até o fim do mês"; marcação de mudança de critério (T2.6) | E2E-SNO CA-27 (`mock=tendencia-poucos`); `componentes.test.tsx`, `graficos.test.tsx`, `MockFonteMetricas.test.ts` (existem) | A |
| CT-44 | 27 | Mês-calendário com 0: mostra 0, nunca lacuna; vazio total ("nenhum dos últimos 6 meses atinge 20 itens"); data de referência no último dia e no primeiro dia do mês seguinte | `packages/metricas/src/tendencia.test.ts` (existe); vazio total na tela: conferir `resumo.test.tsx` | A |
| CT-45 | 27 | P2: série da Sustentação "k de m avaliadas", m<5 escrito, "não publicado" só se m=0; P4: volume mensal pela data de abertura, igual ao S3 (ponto do volume de um mês = S3 do mesmo mês) | `tendencia.test.ts`, `resumo.test.tsx` (existem); equivalência com S3 via API: a escrever (QA, contrato) | A |
| CT-46 | 28 | Alertas: títulos "Pede atenção · Fluxo de projeto (BusinessMap)" e "... Sustentação (Acelerato)"; vazio "Nada pede atenção ..."; link leva à visão dona com o cartão focado; alertas antes dos números | E2E-SNO CA-28; `atencao.test.ts` (existem) | A |
| CT-47 | 29 | Resumo sem barra de filtros; guardados avisados; `{operacional:{ocultar:['o3']}}` → marcador "oculta nas suas preferências · Mostrar" no lugar do número do O3 e a série P85 some; **nenhuma chave nova no localStorage** (comparar chaves antes e depois) | E2E-SNO CA-29; `resumo.test.tsx` (existem) | A |
| CT-48 | 30 | Resumo: só "Exportar vários painéis", com Operacional e Operacional · Sustentação pré-selecionados; arquivo com seções por fonte; sem exportar a tendência; sem popover "Métricas" | E2E-SNO CA-30 (existe; ver ambiguidade A4) | M |
| CT-49 | 31 | Estados por bloco: carregamento independente (esqueleto de altura fixa, CLS); erro de um bloco não afeta o outro, "Tentar de novo" por bloco e por série; `SemDadosDaFonte` só no bloco sem coleta; anúncio "Visão Resumo. Fontes: BusinessMap e Acelerato, em blocos separados."; título "Operacional · Resumo" | E2E-SNO CA-31; `resumo.test.tsx` (existem) | A |
| CT-50 | 31 (review M1) | `mock=erro:O3`: a série P85 **não** afirma "nenhum dos últimos 6 meses atinge 20 itens"; mostra estado próprio e "Tentar de novo". Caso nascido do achado M1 | a escrever (dev, integração) + E2E a escrever (QA); vermelho esperado hoje | A |
| CT-51 | 31 | axe e 375 a Resumo: coluna única, grade de 2 colunas, tabela alternativa recolhida, alvos de 44 px, gráfico `role="img"` com `aria-label` | E2E-SNO CA-19/20 (Resumo incluso) + a escrever (QA): `role="img"` e a tabela alternativa | A |

## 3. Back-end B1 a B3 (contrato e API)

| ID | Obrigação | Cenário | Teste | Prior. |
|---|---|---|---|---|
| CT-52 | B1 53 ids | `METRICA_IDS` tem 53 itens; os dois novos têm fonte, schema de saída e regra; varredura cobre todos; nenhum id some | `packages/contratos/src/contratos.test.ts`, `packages/metricas/src/varredura.test.ts`, `server/tests/metricas.test.ts` (existem) | A |
| CT-53 | B1 `S3.janela` obrigatório | Resposta do S3 com `janela` válida; **S3 sem `janela` é rejeitado pelo schema de saída** (a escrever, contrato); consumidores antigos que geram S3 por fora quebram: conferir `packages/mock` e fixtures | `packages/contratos/src/contratos.test.ts`, `packages/mock/src/coletas.test.ts` (existem); caso "sem `janela` rejeitado": conferir | A |
| CT-54 | B2 equivalência | Para cada mês, o ponto = `calcularO3`/`calcularS2` no contexto do fim do mês (3 bases geradas) | `packages/metricas/src/tendencia.test.ts` (existe) | A |
| CT-55 | B2 fronteiras | 19 itens → `insuficiente` sem valor; 20 publica; mês sem itens = contagem 0; mês em curso nunca entra; data de referência no dia 1 do mês seguinte; arquivados e excluídos contam; descartados e subtarefas fora; ordem de entrada neutra | `tendencia.test.ts` (existe) | A |
| CT-56 | B2 fontes | Contexto vazio da outra fonte não altera o resultado (BM e Acelerato não se misturam); `REGRAS_METRICA` com `segmentacao` e domínio único | `tendencia.test.ts`, `packages/metricas/src/regras.property.test.ts` (existem) | A |
| CT-57 | B2 `S3.janela` | `p1p2` com n 19 e 20 (taxa só publica com 20); período custom; volume = `S3.base.n` | `packages/metricas/src/*` de S3 (existe, conferir) | A |
| CT-58 | B3 API | `GET /api/v1/metricas/TENDENCIA_FLUXO` e `TENDENCIA_SUST`: 200 com schema; 304 por `etag`; 400 com parâmetro extra (filtro, `equipe`, `tipo`, `prioridade`, `pageSize`); 400 com `dataReferencia` futura e inválida (`2026-13-40`, `2026-02-30`, vazio); cabeçalhos `x-data-referencia` e `x-versao-criterio` | `server/tests/metricas.test.ts`, `api.sistemico-intensivo.test.ts` (existem) | A |
| CT-59 | B3 sem pessoa | Nenhum campo de pessoa (nome, e-mail, `usuarioKey`, título, descrição) nas 53 rotas; GRANT por coluna do `dspd_api` intacto (executa com Postgres) | `server/tests/api.sistemico-intensivo.test.ts` (existe); `pnpm run test:pg` | A |
| CT-60 | B3 contrato×doc | `docs/api/metricas.md`, OpenAPI e `contratos` gerados em sincronia (`docs:check`) | `pnpm run docs:check` | A |
| CT-61 | review L3 | `mes` no formato `AAAA-MM` (regex); mês `2026-13` rejeitado | a escrever (dev), só depois de L3 corrigido | B |
| CT-62 | API contra o front | O front lê as tendências por HTTP: `HttpFonteMetricas` envia só `dataReferencia`; M2 remove os casts | `web/src/data/http/HttpFonteMetricas.test.ts` (existe); E2E `chromium-api` (ver 6) | M |

## 4. Regras invioláveis (casos explícitos)

| ID | Regra (`CLAUDE.md`) | Cenário | Teste | Prior. |
|---|---|---|---|---|
| CT-63 | Sem avaliação individual | Nenhuma tela, DTO ou exportação nova traz pessoa, ranking, meta por pessoa; varredura do DOM das 4 visões e do conteúdo do arquivo exportado: nenhum nome/e-mail/`usuarioKey` | a escrever (QA, E2E + varredura de DTO no `server`) | A |
| CT-64 | Sem comparação entre times | Resumo e Sustentação não oferecem comparar equipes; filtro de equipe é filtro, não ranking | E2E-SNO CA-25 (parcial); a escrever: nenhum elemento ordenando equipes | A |
| CT-65 | BM e Acelerato nunca se misturam | Nenhum número, gráfico, percentil, total ou texto cruza; nenhum "total geral"; `RESUMO` sem soma; "leia junto" não carrega número | CT-39, CT-56, E2E-SNO CA-25 | A |
| CT-66 | Story, frente e projeto no mesmo histograma | O Resumo só traz story; O3 por tipo (P1) | `modelo.test.ts`; `REGRAS_METRICA.O3.segmentacao` (`regras.property.test.ts`) | A |
| CT-67 | Mínimo de 20 itens e janela de 12 semanas | Percentis e proporções <20 não publicam (número, ponto da série, `S3.janela.p1p2`, "k de m avaliadas"); contagens publicam | CT-41, CT-44, CT-45, CT-55, CT-57 | A |
| CT-68 | Cálculo só na biblioteca (T2.5) | O front não calcula percentil, taxa ou média (L1: delta da frase da série derivado na tela); varredura de `web/src` por `percentil|quantile|reduce.*/` e conferir; teste de equivalência | CT-54; varredura: a executar (QA); L1 vira bug se confirmado | A |
| CT-69 | Mudança de critério marcada (T2.6) | `criterios` presente no DTO e linha vertical rotulada com data nos dois gráficos | `tendencia.test.ts`, `graficos.test.tsx` (existem) | M |
| CT-70 | Carga incremental e histórico | Arquivados e excluídos contam nas séries; nenhuma escrita (todas as rotas novas são GET) | CT-55; `server/tests/metricas.test.ts` | A |
| CT-71 | Métricas proibidas (7.1) | Sem média de tempo de ciclo sem percentil, sem velocidade em pontos, sem horas apontadas como esforço, sem % de conclusão; conferir o conteúdo dos DTOs e a Ajuda "Resumo" | revisão do catálogo e do Resumo (QA, manual guiado) | M |
| CT-72 | Credenciais e Acelerato só GET | Nenhuma credencial no código novo; nenhum POST ao Acelerato (`grep` no diff) | `git diff origin/develop...HEAD` por padrões; `server` fronteiras (`e2e/scripts/verificar-fronteiras.mjs`) | A |

## 5. Medição A1/A2 no Postgres real (pendente do review)

Contexto: a ADR 0003 (A1 `GET` de métrica de painel, p95 < 300 ms, bloqueante; A2 cache quente, p95 < 50 ms, alerta) só foi medida com dublê de banco (10,9 ms fluxo, 77,6 ms Sustentação sem cache). Falta o Postgres real com 2 anos de seed, que é a evidência do review.

Lacuna: `e2e/perf/perf-api.spec.ts` lista `['O1' ... 'S3']` e **não inclui `TENDENCIA_FLUXO`, `TENDENCIA_SUST` nem usa `dataReferencia`**, e `ROTAS_PAINEL` já inclui as 3 URLs de Operacional mais `/sustentacao` (rota antiga: virou redirecionador; conferir se o teste conta o redirect). Ajuste de teste, permitido ao QA: acrescentar os dois ids (com `dataReferencia=<mais antiga das duas últimas coletas>`) e `S3` com `janela`.

| ID | Cenário | Como medir | Aceite | Prior. |
|---|---|---|---|---|
| CT-73 | A1 isolada, fria, TENDENCIA_FLUXO e TENDENCIA_SUST, Postgres real (2 anos de seed) | `PERF_VARIANTE=api` + `PERF_REPETICOES_A1=10`, estender `ids` em `perf-api.spec.ts`; primeira chamada de cada id, `cache-control: no-cache` | p95 < 300 ms; registrar p95 e max em `perf-results/resultado-api.json` | A |
| CT-74 | A2 quente (cache por versão de carga) das duas tendências | mesmas chamadas, de 2 em diante | p95 < 50 ms (alerta, não bloqueia); registrar | M |
| CT-75 | A1 navegador do Resumo (12 GETs: 7 fluxo, 3 Sustentação, 2 tendência), contexto novo, cache limpo | `A1 no navegador` com `ROTAS_PAINEL` (inclui `operacionalResumo`) | p95 < 300 ms por rota; tendência depois dos números (conferir a ordem das requisições) | A |
| CT-76 | Estabilidade: `dataReferencia` fora do cache (a Sustentação reindexa o Acelerato, 77,6 ms no dublê) | variar `dataReferencia` entre chamadas, n=10 | p95 < 300 ms; se estourar, bug de desempenho (alto) para `node-backend` (pré-cálculo no worker, R2 do plano) | A |
| CT-77 | Carga posterior à coleta (primeira consulta depois de uma carga) | rodar uma coleta de teste e medir a primeira chamada | registrar; não é meta nova, só evidência | B |

Ambiente: Docker Compose com Postgres (`docker compose up -d --wait postgres`), seed de 2 anos (`scripts/db.sh`, conferir qual comando semeia), API local por `scripts/com-api-mock.sh`; confirmar com o usuário se a máquina com 8 GB comporta a pilha completa (ver 8, riscos).

## 6. Dados de teste

- Mock padrão do front (`VITE_FONTE` mock) com a semente atual; `chromium-semente-alt` para a segunda semente (C80).
- Modos de mock: `?mock=tendencia-poucos` (junho do fluxo com n=14; Sustentação com junho sem P2, julho sem nenhuma prioridade), `?mock=erro:O3`, `?mock=erro:S2`, `mock` para Acelerato sem coleta (conferir nome do modo no E2E-SNO CA-22). A tabela do E2E-SNO CA-27 exige >= 7 meses de histórico: conferir que o gerador entrega.
- `localStorage`: perfis `{versao:1,paineis:{sustentacao:{ocultar:['s3','pv1']}}}` e `{versao:1,paineis:{operacional:{ocultar:['o3']}}}`; perfil vazio; perfil corrompido (JSON inválido) deve cair no padrão sem erro.
- URLs de borda: `cadencia` desconhecida, `cadencia=RESUMO`, `sust_prioridade=P9`, `sust_periodo=xx`, `sust_de` > `sust_ate`, hash em maiúsculas, hash desconhecido, parâmetro repetido (`equipe=A&equipe=B`), caracteres especiais e acentos em `equipe`.
- Data de referência: fixar em 2026-10-13 (spec) para o eixo abril a setembro; repetir com 2026-10-01 e 2026-09-30 (borda do último dia do mês).
- API: seed Postgres de 2 anos (CT-73), `dspd_api` (GRANT por coluna) e `PG_TESTE_URL` do `scripts/test-pg.sh`.

## 7. Comandos da execução

Todos na worktree `/home/rodrigoisensee/MetricasDSPD-sust`, depois do review aprovado e com os autores parados (um único dono do disco). Rodar com `flock` e `nice -n 19` como o tech-lead, para não repetir o estouro de tempo do M3.

```bash
cd /home/rodrigoisensee/MetricasDSPD-sust
git rev-parse HEAD                       # registrar o commit testado (frontmatter do parecer)
pnpm install --frozen-lockfile
flock /tmp/pronto.lock nice -n 19 pnpm run pronto      # lint, format, back, front, cobertura 100%
pnpm run docs:check                                   # contratos e docs sincronizados
bash scripts/test-pg.sh                               # testes de banco (Postgres do Compose)
pnpm --filter @metricas-dspd/web build                # confere o chunk separado da Sustentação
pnpm --filter @metricas-dspd/e2e exec playwright test tests/sustentacao-no-operacional.spec.ts --project=chromium
pnpm run e2e                                          # suíte E2E completa (mock; todos os projetos)
pnpm --filter @metricas-dspd/e2e run test:smoke
E2E_API_URL=... pnpm --filter @metricas-dspd/e2e run test:api        # front via API real (scripts/com-api-mock.sh)
PERF_VARIANTE=api PERF_REPETICOES_A1=10 pnpm --filter @metricas-dspd/e2e run test:perf:api   # A1/A2
pnpm --filter @metricas-dspd/e2e run perf:tudo        # size, perf do front, Lighthouse nas 3 URLs
```

Varreduras estáticas (QA, só leitura):
```bash
git diff origin/develop...HEAD -- '*.ts' '*.tsx' | grep -nE "as never|as Record<string, never>"           # M2
git diff origin/develop...HEAD -- web/src | grep -nE "\bquantil|percentil|Math\.(round|floor)"          # CT-68
grep -rnE "'/operacional'(\)|,|`)" web/src e2e/tests | grep -v cadencia                                  # CT-38, R6
git diff origin/develop...HEAD | grep -niE "apikey|token|password|senha"                               # CT-72
```

Vermelho antes do verde (seção "Vermelho antes do verde" da skill) para cada teste de regra ou de correção novo. Roteiro: `git stash` do código de produção do commit (ou `git checkout <commit-pai> -- <arquivo de produção>` numa cópia descartável, nunca na branch dos autores) e rodar o teste; registrar o comando e a falha. Casos prioritários (testes que provam regra nova): CT-08, CT-17, CT-20, CT-41, CT-47, CT-50, CT-53, CT-55.

Mutação (Stryker) só nos arquivos do diff, quando houver config: `pnpm stryker run --mutate "$(git diff --name-only origin/develop -- '*.ts' '*.tsx' | grep -v '\.test\.' | paste -sd,)"`. Arquivos de maior valor: `packages/metricas/src/{businessmap,acelerato}/tendencia.ts`, `web/src/features/operacional/{visao.ts,atencao.ts}`, `resumo/modelo.ts`, `RedirecionaSustentacao`. Conferir a meta em `docs/engineering/praticas.md`; sobrevivente vira teste ou justificativa.

Instável = reportar, nunca `skip`.

## 8. Lacunas e ambiguidades da especificação (ao tech-lead e ao usuário; nada decidido por inferência)

- **A1.** CA-3 diz "nas visões Diária e Semanal não existe nenhum `metrica-S*`"; a seção 5.9.2 não proíbe O17 no Resumo e o CA-25 o proíbe. Assumido: O17 só na Sustentação (CA-3, 3.2, CA-25 concordam).
- **A2.** CA-19 diz "nas três visões" e o título do E2E-SNO diz "quatro"; o CA-31 acrescenta o Resumo. Assumido: as 4 visões em 375 e 1280.
- **A3.** CA-26 não escreve a janela dos números da Sustentação; o plano (P3) fixou 12 semanas; a seção 5.9 e Q5 antigas diziam "a do painel". O teste usa 12 semanas e confere que está escrita na tela. Ao usuário: confirmar (também registra a divergência de alerta Resumo × Sustentação, ver riscos).
- **A4.** CA-30 diz "os dois níveis pré-selecionados"; o título do E2E-SNO CA-30 diz "os cartões dos números já marcados". Assumido: os dois níveis pré-selecionados (texto da spec e 5.9.6); o teste existente pode estar afirmando outra coisa: conferir na execução.
- **A5.** CA-27 não define a fronteira exata do "mês fechado" quando a `dataReferencia` cai no último dia do mês (mês fechado ou em curso?). Assumido pelo plano 4.4 (último dia <= data de referência, ou seja, o mês entra). Caso CT-44; ao tech-lead.
- **A6.** CA-14 e CA-29 testam o localStorage antigo mas nenhuma frase cobre perfil corrompido ou `versao` diferente de 1. Caso CT-23 e dados de teste abaixo; ao tech-lead.
- **A7.** Spec 5.9.8 (sem permissão: "não se aplica") e CA-6 deixam a ordem de `push`/`replace` ao trocar a visão pelo teclado (setas) ambígua: cada seta empilha uma entrada no histórico? Assumido: cada troca é um `push` (5.9.6). Observar na execução.
- **A8.** Spec 6.2: "`#mais-metricas` ou desconhecido → a do `cadencia`" e CA-24 dizem só que links antigos continuam. Não há CA para hash desconhecido com `cadencia` inválido ao mesmo tempo. Caso de borda em CT-10, sem critério.
- **A9.** O "tipo predominante" (P1) não tem critério de empate. Ao tech-lead/usuário se o teste (CT-42) achar não determinismo.
- **A10.** Q2 da spec: contagens "publicadas sempre"; CA-26 só trata n<20 para percentil/taxa. Coberto por CT-41, sem CA próprio.

## 9. Riscos para a execução

1. Review reprovado: B1 (documentação), M1 (CT-50 deve falhar hoje), M2 (casts), M3 (`varredura.test.ts:70` estoura o tempo sob carga). A execução só começa depois da volta 2; recomeçar o plano nos testes que os autores alterarem.
2. `pnpm run pronto` instável sob carga (M3): rodar com `flock` e `nice`, sem E2E em paralelo, e registrar a carga da máquina no parecer.
3. Medição A1/A2 exige Docker, Postgres e seed de 2 anos: pode não caber nos 8 GB junto com o Playwright; rodar em etapas e confirmar com o usuário.
4. O Resumo faz 12 GETs e é a página padrão: risco de A1, LCP e CLS. Orçamento ADR 0003.
5. Janelas diferentes: o alerta da Sustentação no Resumo (12 semanas) pode diferir do da visão Sustentação (6 meses). Não é bug por spec (P3), mas pode virar bug de percepção; o parecer registra o par de telas.
6. 17 E2E antigos adaptados (F8): risco de teste adaptado que deixou de provar a obrigação; amostrar 3 por mutação manual (quebrar o código e ver falhar).
7. `ResultadoS3.janela` obrigatório: consumidor externo que valida com o schema antigo passa; um que gera S3 por fora quebra (CT-53). Links externos para `/operacional` agora caem no Resumo (CT-38).
8. Bug esperado de `perf-api.spec.ts` (ids sem as tendências, CT-73): ajuste de teste do QA, não defeito.

## 10. Resumo de cobertura

Total de casos: 77 (CT-01 a CT-77). Critérios de aceite CA-1 a CA-31: todos com ao menos um caso (CT-01 a CT-51). Casos já ligados a teste existente: a maioria; "a escrever (QA)": CT-03, 10 (E2E do aviso), 17 (dois hashes), 18, 23, 25, 29 (variantes), 31, 32 (zoom), 36, 45, 51, 63, 64, 73 a 77; "a escrever (dev)": CT-42 (empate), CT-50, CT-61.

## Resultado da execução
Executado em 2026-10-14 no HEAD 18d8327 (código de produção de 67624ba). Resultado completo, tabela critério → teste → resultado, A1 e A2, vermelho antes do verde e mutação: `docs/qa/sustentacao-no-operacional.md` (aprovado com ressalvas). Bugs: `docs/qa/bugs/SNO-001` a `SNO-005` (SNO-003 resolvido no teste). Os casos "a escrever (QA)" foram escritos em `e2e/tests/sustentacao-no-operacional-qa.spec.ts`, `e2e/tests-api/tendencias.spec.ts`, `e2e/perf/perf-api.spec.ts` e `packages/contratos/src/s3-janela.test.ts`; CT-42 (empate) e CT-61 (`mes` AAAA-MM) já estavam cobertos por teste dos autores.
