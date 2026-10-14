# Compatibilidade com celular, iPad e tablet · 01 Diagnóstico

Pedido: `docs/pedidos/010-compatibilidade-mobile-tablet.md`. Versão avaliada: worktree `MetricasDSPD-qa` (branch `feature/espera-invisivel-nos-paineis`, 3ad62a7). Caminhos relativos a `web/src` quando não indicado.

**Método.** Leitura do CSS, dos tokens e de cada componente com regra responsiva (`@media`, prefixos `sm:/md:/lg:/xl:`, `matchMedia`), das capturas em `docs/qa/evidencias/` (375, 768, 1024, 1280) e dos E2E `e2e/tests/responsivo.spec.ts`. Não subi o app nem rodei a suíte (restrição do pedido). Cada medida diz a origem: **(captura)** quando vem de imagem, **(código)** quando é deduzida das classes (ex.: `py-1.5` + `text-sm` + borda = 34 px de altura). O que depende de aparelho real está marcado **hipótese** e entra no roteiro de validação.

**Estado-alvo considerado.** As decisões já tomadas mudam o que o celular e o tablet vão ver, e o diagnóstico leva isso em conta:
- U3 (índice fixo por seção), U5 ("Por reunião" logo abaixo de "Pede atenção"), U1/U2 (oculto lembrado, marcador no lugar) e o Catálogo dentro da Ajuda (`revisao-geral-usabilidade/04-decisoes.md`).
- D1 a D3 da Sustentação: o Operacional ganha o seletor **Visão: Resumo (padrão) · Diária · Semanal · Sustentação**; `/sustentacao` vira redirecionador; "Revisão da sustentação" semanal entra em "Por reunião" (`sustentacao-no-operacional/especificacao.md`, seção 13).
- Com isso, o menu-alvo tem **5 destinos** (Visão geral, Operacional, Tático, Estratégico, Dados e coletas) mais Preferências e Ajuda. Hoje o código tem 8 (`app/rotas.ts:2-11`).

## Escala de severidade
Mesma da revisão geral: 0 não é problema · 1 cosmético · 2 menor (tem contorno) · 3 maior (atrapalha tarefa frequente) · 4 impede a tarefa.

Nenhum achado chega a 4: o sistema abre e funciona em todas as larguras de 320 a 1920 sem rolagem horizontal da página (RESP-01 cobre 320, 375, 640, 768, 1024, 1180, 1280, 1920). O problema central não é "quebra", é que **o sistema decide tudo pela largura**, e largura não diz se a pessoa usa dedo ou mouse, nem quanta altura sobra.

## Classes de dispositivo consideradas (larguras em CSS px)
| Classe | Retrato | Paisagem | Exemplos |
|---|---|---|---|
| Celular | 360, 375, 390 (até 430) | 640 a 932 × 360 a 430 de altura | Galaxy A/S (360, 384, 412), iPhone SE (375), iPhone 12 a 16 (390/393), Pro Max (430) |
| Tablet pequeno | 744 | 1133 | iPad mini |
| Tablet retrato | 768, 800, 810, 820, 834 | — | iPad 9ª geração (810), iPad 10ª/11ª e Air 11" (820), iPad Pro 11" (834), Galaxy Tab S (800) |
| Tablet paisagem | — | 1024, 1080, 1180, 1194, 1280, 1366 | os mesmos aparelhos deitados; iPad Pro 13" (1366) |
| Janela dividida no iPad | 320, 375 (Slide Over), 507, 678, 694 | — | caem nas faixas acima pela largura |

Breakpoints atuais (`docs/ux/design-system.md:51`, Tailwind padrão): 640 (`sm`), 768 (`md`), 1024 (`lg`), 1280 (`xl`).

---

## 1. Resumo: os problemas mais graves
| # | Problema | Sev. | Onde | Quem sofre |
|---|---|---|---|---|
| MT1 | Alvos de toque de 44 px só abaixo de 768 px de largura. iPad e tablet (retrato 768 a 834 e toda paisagem) e celular deitado (844, 932) recebem alvos de desktop: 24 px no "Ocultar", na Dica (i) e nas caixas de seleção, cerca de 32 a 34 px nos botões | 3 | `styles/tokens.css:132-142` (`.alvo` por `max-width: 47.99rem`); `components/ui/Botao.tsx:29`; `CartaoMetrica.tsx:197-205` | Gerente no iPad; coordenador no tablet |
| MT2 | Celular deitado: com largura de 768 ou mais, o cabeçalho e a barra de filtros ficam fixos e ocupam cerca de 150 a 200 px de 360 a 430 de altura (40% a 50% da tela) | 3 | `app/AppShell.tsx:95` (`md:sticky`); `features/filtros/BarraFiltros.tsx:152` (`md:sticky`); nenhuma regra por altura | Qualquer um que gire o celular para ver um gráfico |
| MT3 | Páginas longas sem índice no celular: Operacional semanal tem ~8.400 px a 1280 (captura); em coluna única a 375 passa disso (código). O índice da U3 ainda não existe e o "Ir para" não acompanha a rolagem | 3 | `features/operacional/OperacionalPage.tsx:161`; revisão geral O1 | Coordenador e gerente no celular |
| MT4 | No celular, ao rolar, somem os filtros ativos e a navegação (nada é fixo abaixo de 768) | 2 | `AppShell.tsx:95`, `BarraFiltros.tsx:152`; revisão geral F1 | Gerente lê número sem ver o recorte |
| MT5 | Zoom automático do Safari no iPhone ao tocar em campo com fonte menor que 16 px: seletor de tema e datas do período personalizado (14 px). A página fica ampliada depois de fechar o campo | 2 | `app/SeletorTema.tsx:9-17` (`text-sm` herdado); `features/filtros/FiltroPeriodo.tsx:79-104` | Quem filtra período no iPhone |
| MT6 | "amostra insuficiente" nas tabelas explica a regra só no `title` de um `abbr`: no toque não aparece. A pessoa não descobre que "menos de 20 itens não é publicado" | 2 | `components/ui/AmostraInsuficiente.tsx:134` | Todos no celular e tablet |
| MT7 | Dispersões e barras finas: o valor exato aparece no tooltip ao passar o ponteiro. No toque ele abre só se o dedo acertar a marca (pontos de poucos pixels) e o dedo cobre o tooltip. Há equivalente ("Ver como tabela"), por isso não é 3 | 2 | `components/charts/Dispersao.tsx:192-209`; `TooltipTema.tsx` | Gerente no celular |
| MT8 | Faixa 1024 a 1279 (iPad deitado): a navegação completa aparece a partir de 1024 e quebra em duas linhas (captura `fase-a/operacional-1024-claro.png`, já com 6 destinos; hoje são 8). Cabeçalho fixo de ~96 px + barra de filtros fixa | 2 | `app/NavegacaoGlobal.tsx:32` (`lg:block`) | iPad paisagem |
| MT9 | Diálogos pensados para dois extremos: abaixo de 1024 a exportação e o popover "Métricas" viram folha inferior de largura total. No iPad em pé isso é uma folha de 820 px com uma coluna de caixas de seleção | 1 | `features/exportar/DialogoExportar.tsx:118`; `features/preferencias/BotaoMetricas.tsx:76` | iPad retrato |
| MT10 | Os E2E não emulam toque nem celular real: só viewport de desktop no Chromium (`devices['Desktop Chrome']`), WebKit só de desktop e só no CI. Ninguém verifica `pointer: coarse`, paisagem baixa nem Safari móvel | 2 | `e2e/playwright.config.ts:40-66` | QA e quem recebe a release |

---

## 2. Transversal (vale para todas as telas)

### 2.1 Alvos de toque (WCAG 2.5.8; recomendado 44 px)
| Id | Situação | Sev. | Evidência |
|---|---|---|---|
| MT1 | `.alvo` = 24 px a partir de 768 de largura, 44 px abaixo. O critério certo é o **tipo de ponteiro**, não a largura: um iPad tem 820 a 1366 de largura e é tocado com o dedo; um notebook com janela estreita é usado com mouse | 3 | `tokens.css:132-142` |
| MT1a | Alvos menores que 44 px no tablet (código): Dica (i) 24×24; "Ocultar" 24 de altura, sem padding; caixas de seleção de 16 px (a linha inteira é clicável, ok, mas tem 24 px de altura); botões ~34 px; links da navegação ~32 px; abas do `SeletorLocal` ~34 px; botão "Fechar" do período em `text-xs` (~30 px) | 3 | `Dica.tsx:56`; `CartaoMetrica.tsx:202`; `FiltroPeriodo.tsx:156`; `SeletorLocal.tsx:72` |
| MT1b | Espaço entre alvos: `gap-2` (8 px) na maioria; no cabeçalho do cartão "Como ler", "Ver como tabela" e "Ocultar" ficam lado a lado com 8 px. Com 34 px de altura no tablet, toque errado entre "Ver como tabela" e "Ocultar" é provável | 2 | `CartaoMetrica.tsx:182-207` |
| MT1c | O E2E A11Y-13 mede alvos só em 1280 (24) e 375 (44), e só no cabeçalho e nos filtros | 2 | `responsivo.spec.ts:68-76` |
| + | Ponto positivo: abaixo de 768 tudo que usa `.alvo` tem 44 px, inclusive menu, filtros e botões do cartão | 0 | idem |

### 2.2 Hover sem equivalente para toque
| Id | Elemento | Situação | Sev. |
|---|---|---|---|
| + | Dica (i) | Abre por toque, clique, Enter/Espaço, foco e mouse; ignora `pointerType` diferente de mouse no hover, então não "pisca" no toque; fecha tocando fora. Bom exemplo | 0 |
| + | Estilos `hover:` | Tailwind 4 só aplica `hover:` quando o aparelho tem hover de verdade (`@media (hover: hover)`), então não há "hover preso" depois do toque no iPhone | 0 |
| MT6 | `abbr title` de "amostra insuficiente" | Sem equivalente no toque nem no teclado | 2 |
| MT7 | Tooltip dos gráficos (Recharts) | Equivalente existe ("Ver como tabela" e frase de leitura); no toque depende de acertar a marca (**hipótese** de comportamento: barra e linha abrem ao tocar ou arrastar; ponto de dispersão só no acerto). O tooltip da dispersão tem `role="status"` e o `TooltipTema` deliberadamente não tem (inconsistência; leitor de tela fala a cada toque) | 2 |
| MT7a | Pré-carga de chunk "ao passar o ponteiro" no rádio Sustentação (spec 7.1) | No toque não há passagem de ponteiro; a pré-carga precisa também do `pointerdown`/foco, senão a primeira troca de visão espera a rede móvel | 1 |

### 2.3 Zoom e texto
| Id | Situação | Sev. | Evidência |
|---|---|---|---|
| + | `meta viewport` sem `maximum-scale` nem `user-scalable=no`: o zoom com pinça funciona (WCAG 1.4.4) | 0 | `web/index.html:5` |
| + | Reflow a 320 px sem rolagem horizontal da página (WCAG 1.4.10), testado em RESP-01; `-webkit-text-size-adjust: 100%` evita que o Safari aumente texto sozinho ao girar | 0 | `tokens.css:111`; `responsivo.spec.ts:5-15` |
| MT5 | Campos com fonte < 16 px causam zoom automático no iOS ao focar (seletor de tema, datas). Não se resolve proibindo zoom (isso fere 1.4.4): se resolve com 16 px nos campos | 2 | `SeletorTema.tsx`; `FiltroPeriodo.tsx` |
| MT11 | Texto ampliado do sistema (Tamanho do Texto do iOS, Fonte do Android): o Chrome Android aplica; o Safari não aplica a sites (só zoom da página pelo "aA"). Com 200% de zoom num tablet de 820 a página cai no layout de 410 px, que já funciona | 1 | **hipótese**, verificar em aparelho |
| MT12 | Gráficos a 320 px: rótulos do eixo X do O4 sem colisão (M6). Os demais gráficos não têm teste equivalente; legenda e rótulos de linhas de referência ("Mediana", "P85") podem se sobrepor às barras em 360 | 1 | `responsivo.spec.ts:51-66`; captura 768 (rótulo "Mediana" sobre a última barra) |

### 2.4 Orientação e altura
| Id | Situação | Sev. | Evidência |
|---|---|---|---|
| MT2 | Nenhuma regra usa altura. Celular deitado com 844×390: cabeçalho fixo (~56 px, ou ~96 px se quebrar) + barra de filtros fixa (~60 px, ~110 px com duas linhas) + barra de endereço do navegador | 3 | `AppShell.tsx:95`; `BarraFiltros.tsx:152` |
| MT2a | Folhas inferiores com `max-h-[90dvh]`: no celular deitado a folha de filtros ocupa quase tudo e o botão "Ver resultados" fica no fim da rolagem interna | 2 | `BarraFiltros.tsx:186`; `DialogoExportar.tsx:118` |
| MT13 | Ao girar o aparelho, o layout troca de faixa (ex.: 820 → 1180 no iPad) e a rolagem pode "pular" de seção. Sem âncora de rolagem explícita | 1 | **hipótese** (o navegador tenta preservar; com cartões que mudam de altura pode falhar) |
| + | `min-h-dvh` no shell e `dvh` nas folhas: a altura acompanha a barra do Safari | 0 | `AppShell.tsx:82` |

### 2.5 Rede móvel e desempenho (ADR 0003)
| Id | Situação | Sev. |
|---|---|---|
| MT14 | O orçamento vigente é só de desktop: LCP < 2,0 s em 1366×768 sem limitar rede (F1), Lighthouse desktop (F10). Não há meta para celular em 4G nem medição com CPU de celular (a CPU 4× existe só como alerta) | 2 |
| MT14a | Cada cartão consulta sozinho (D7). Operacional semanal: ~10 cartões + EI + complementares sob demanda; com A3 (até 50 KB gzip por métrica), a primeira visita pode baixar algumas centenas de KB só de dados, todos ao mesmo tempo, inclusive os que estão a 5.000 px da dobra | 2 |
| MT14b | Exportação em PDF (jsPDF, chunk < 150 KB) roda no aparelho. Em celular Android de entrada, gerar 12 métricas pode passar de alguns segundos e pressionar a memória (**hipótese**, medir) | 2 |
| + | Sem fonte web baixada (Inter cai para a fonte do sistema), gráficos em chunk próprio, PDF só sob demanda, esqueletos com altura reservada (CLS) | 0 |

### 2.6 Navegadores e versões (o que o código já impõe)
- **Tailwind CSS 4** (`web/package.json`: `tailwindcss ^4.3.3`) usa camadas em cascata, `@property` e `color-mix()`. Piso documentado pelo Tailwind: **Safari 16.4, Chrome 111, Firefox 128**. Abaixo disso o CSS quebra (cores e espaçamentos somem), não só "fica feio".
- Unidades `dvh` (Safari 15.4, Chrome 108) e `:focus-visible` (Safari 15.4) ficam abaixo do piso acima.
- React 19, React Router 7 e Radix: sem exigência acima do piso do Tailwind.
- `navigator.clipboard.writeText` exige contexto seguro (HTTPS) e gesto do usuário no iOS; já há o caminho alternativo do campo selecionado (`CabecalhoPainel.tsx:53-65`).
- Download por `<a download>` com URL de blob: no iOS abre a confirmação de download (Arquivos) ou a pré-visualização; no Android vai para Downloads. Em navegador embutido (link aberto de dentro do Teams ou do WhatsApp) o download pode não acontecer (**hipótese**).
- Não há nada no app que avise "navegador sem suporte": um iPhone preso no iOS 15 abre a página sem estilo.

---

## 3. Por tela e faixa
Legenda das colunas: **Celular** 360/375/390 retrato · **Tablet retrato** 768/820/834 (e iPad mini 744) · **Tablet paisagem** 1024/1180/1366 · **Desktop** 1280+.

### 3.1 Shell: cabeçalho e menu
| Faixa | Situação | Sev. |
|---|---|---|
| Celular | Cabeçalho de ~112 px (captura `b12/operacional-diaria-375`): marca, "Menu", selo "Dados fictícios", seletor de tema (select nativo). Não é fixo. Menu = gaveta à esquerda (`w-72`, 85vw), alvos 44, "Preferências" e "Ajuda" dentro dela; "Fechar" no fim da lista | 2 (G1) |
| Tablet retrato | "Menu" (gaveta) até 1023; "Preferências" e "Ajuda" voltam ao cabeçalho a partir de 768; cabeçalho passa a ser fixo; alvos de 24 a 34 px (MT1). iPad mini (744) fica com o layout de celular, o que é aceitável | 2 |
| Tablet paisagem | Navegação completa a partir de 1024 em duas linhas (MT8): ~96 px fixos. Com o menu-alvo de 5 destinos a linha única cabe em 1024 (estimativa: 5 rótulos + marca + selo + tema + Preferências + Ajuda ≈ 980 px) | 2 |
| Desktop | Como hoje; duas linhas a 1280 com 8 destinos (G1); uma linha com 5 | 1 |

### 3.2 Cabeçalho comum do painel (título, frescor, cadência/visão, Métricas, Exportar)
| Faixa | Situação | Sev. |
|---|---|---|
| Celular | "Pede atenção" começa perto de 720 px (captura; revisão geral P1): a primeira tela mostra só cabeçalho. Faixa de calibração espremida em ~120 px com 9 linhas (P4). Linha reservada vazia do "Link copiado" (P2). Seletor de Visão com 4 opções precisa caber em 343 px ou quebrar em 2 linhas (spec 7.3) | 3 (P1) |
| Tablet retrato | Cabe em uma coluna larga; "Copiar link desta visão" ao lado da pergunta; a barra de filtros quebra em 2 linhas a 768 (captura) e, fixa, ocupa ~110 px | 2 |
| Tablet paisagem | Igual ao desktop; cabeçalho + filtros fixos ~156 px de ~750 px visíveis no iPad deitado (~21%) | 1 |
| Desktop | Revisão geral P1/P3 | — |

### 3.3 Barra de filtros e chips
| Faixa | Situação | Sev. |
|---|---|---|
| Celular | Botão "Filtros (n)" abre folha inferior com listas (44 px), "Limpar filtros" e "Ver resultados"; uma mudança de histórico por folha. Bom. Não é fixa: ao rolar, o recorte some (MT4); chips só no topo; mitigado pelo rodapé "Filtros aplicados" de cada cartão | 2 |
| Tablet retrato | Popovers de desktop (Equipe, Tipo, Sistema, Período) com alvos ~34 px; o popover do Período tem `w-64` e campos de data de 14 px (zoom no iPad? o iPadOS não amplia como o iPhone; **hipótese**); barra fixa em 2 linhas | 2 |
| Tablet paisagem | Uma linha, fixa; alvos ~34 px; Dica (i) 24 px | 2 (MT1) |
| Desktop | Bom (revisão geral F2) | 0 |

### 3.4 Visão geral
| Faixa | Situação | Sev. |
|---|---|---|
| Celular | "Pede atenção" depois de ~1000 px (captura `b3/visao-geral-375`); três blocos de texto antes (V2); cartões de nível em coluna; "Por reunião" sobe (U5), mas continua depois dos alertas. Links "Ver O2" com código (G2) | 3 (P1) |
| Tablet retrato | Grade de níveis em uma coluna até 1023 (`lg:col-span-3`): quatro cartões empilhados de ~770 px de largura com pouco conteúdo cada; muito espaço vazio à direita | 2 |
| Tablet paisagem | Grade de 12 colunas (4 níveis lado a lado em 1024: ~230 px cada), "Por reunião" em 3 colunas | 1 |
| Desktop | Como na revisão geral | — |

### 3.5 Operacional: Resumo (especificado, ainda não implementado)
| Faixa | Situação | Sev. |
|---|---|---|
| Celular | Spec 5.9.7 já prevê 375: coluna única, números em 2 colunas, tendência em largura total, sem barra fixa e sem índice, alvos 44. Falta: o que acontece com a tendência de 6 meses a 360 (6 rótulos de mês cabem; com "Abr · poucos itens (n=14)" não cabem no eixo, precisa ir para a frase ou para a tabela) | 1 |
| Tablet retrato | Não especificado. Proposta em 02 | — |
| Tablet paisagem / Desktop | Wireframe 1280 serve; blocos empilhados (nunca lado a lado) valem para todas as faixas | 0 |

### 3.6 Operacional: Diária, Semanal e Sustentação
| Faixa | Situação | Sev. |
|---|---|---|
| Celular | Coluna única; O2 com tabela "Itens para olhar primeiro" de 10 linhas e títulos quebrados (O2 da revisão); MapaCalor e tabelas largas rolam dentro de `RegiaoRolavel` com sombra (bom), mas **sem primeira coluna fixa**: ao rolar para o lado, perde-se o rótulo da linha; Semanal e Sustentação sem índice (MT3); seletor de Visão de 4 opções | 3 |
| Tablet retrato | Grade de 2 colunas só a partir de 1024: em 768 a 1023 todos os cartões têm largura total (~770 px), inclusive os compactos (O1, Bloqueados, O15, O18, S3/S4), o que dobra a altura da página sem ganho de leitura | 2 |
| Tablet paisagem | Pares lado a lado como no desktop; cartões de ~480 px (captura 1024: O4 legível); alvos pequenos (MT1) | 2 (MT1) |
| Desktop | Revisão geral O1/O2 | — |

### 3.7 Tático e Estratégico
| Faixa | Situação | Sev. |
|---|---|---|
| Celular | Coluna única; gráficos de distribuição e previsão (Monte Carlo) com legenda abaixo; Estratégico sem filtro de equipe com Dica explicando (abre por toque, bom); E1 com grade `sm:grid-cols-3` que a 360 empilha | 2 |
| Tablet retrato | Mesmo problema de largura total dos compactos (3.6) | 2 |
| Tablet paisagem / Desktop | Pares em 2 colunas; ok, salvo MT1 | 1 |

### 3.8 "Mais métricas", marcadores de oculto e "Pede atenção"
| Faixa | Situação | Sev. |
|---|---|---|
| Todas | `<details>` nativo funciona no toque. "Ocultar" é link sublinhado de 24 px de altura no tablet (MT1) colado a "Ver como tabela". O marcador de oculto da U2 ainda vai nascer: precisa nascer com 44 px no toque | 2 |

### 3.9 Exportação (diálogo)
| Faixa | Situação | Sev. |
|---|---|---|
| Celular | Folha inferior de 90dvh, rodapé fixo com "Gerar arquivo" / "Baixar" em largura total, prévia abaixo das caixas (bom). Depois de "Gerar", "Baixar" é um segundo toque (bom para o iOS, que exige gesto). Captura `pre-pr/exportar-dialogo-375-escuro.png` | 1 |
| Tablet retrato | Folha inferior de 820 px de largura em uma coluna (MT9) | 1 |
| Tablet paisagem / Desktop | Modal central de 52rem, duas colunas | 0 |
| Todas | Navegador embutido (Teams/WhatsApp) pode não baixar; tempo de geração em celular de entrada não medido (MT14b) | 2 |

### 3.10 Copiar link
| Faixa | Situação | Sev. |
|---|---|---|
| Celular e tablet | Funciona (HTTPS + toque). No celular, o gesto natural é **compartilhar** (folha nativa com Teams, e-mail, WhatsApp); hoje a pessoa copia e depois abre o outro app | 1 |

### 3.11 Preferências
| Faixa | Situação | Sev. |
|---|---|---|
| Celular | Lista longa de caixas por painel; status "Salvo neste navegador" no fim (S2 da revisão); linhas com 44 px. Funciona | 1 |
| Tablet retrato | `md:grid-cols-2`: duas colunas de caixas com linhas de 24 px de altura (MT1) | 2 |
| Paisagem / Desktop | ok | 0 |

### 3.12 Ajuda (com o Catálogo dentro) e Dados e coletas
| Faixa | Situação | Sev. |
|---|---|---|
| Celular | Catálogo: tabela de 46 linhas com várias colunas, rola de lado (sem busca, C1); no celular a tabela é a pior forma de ler um catálogo. Dados e coletas: `Contagens` em 2 colunas (bom); abas com estilo próprio (G3) | 2 |
| Tablet retrato | Tabela cabe quase inteira; ok | 1 |
| Paisagem / Desktop | ok | 0 |

### 3.13 Estados (carregando, erro, vazio, amostra insuficiente)
| Faixa | Situação | Sev. |
|---|---|---|
| Todas | Esqueletos com altura própria para celular (`ALTURAS_ESQUELETO_MOBILE`), bom. Em 4G, o painel em branco reservado (E1 da revisão) dura mais e parece travado. Amostra insuficiente explicada por estatística (bom), salvo a célula de tabela (MT6) | 2 |

---

## 4. Acessibilidade (WCAG 2.2 AA) no recorte de dispositivo
| Critério | Situação | Achado |
|---|---|---|
| 1.3.4 Orientação | Atende | Nada trava a orientação |
| 1.4.4 Redimensionar texto | Atende | Zoom permitido; MT5 é efeito colateral, não bloqueio |
| 1.4.10 Reflow | Atende | 320 px sem rolagem horizontal da página (tabelas e gráficos rolam dentro de região rotulada, exceção permitida) |
| 1.4.13 Conteúdo em hover ou foco | Falha parcial | MT6 (`title`): conteúdo só no hover, não dispensável e não acessível por teclado/toque |
| 2.5.1 Gestos de ponteiro | Atende | Nenhum gesto de caminho ou multiponto obrigatório |
| 2.5.2 Cancelamento do ponteiro | Atende | Ações no `click` (ativação ao soltar) |
| 2.5.8 Tamanho do alvo (mínimo) | Atende | 24 px garantidos; o problema é o recomendado de 44 em telas de toque (MT1), que é AAA (2.5.5), mas é o padrão do design system para toque |
| 2.4.11 Foco não encoberto | Risco | Celular deitado com cabeçalho e filtros fixos (MT2): o `scroll-padding` reserva altura, mas sobra pouca tela |
| 4.1.3 Mensagens de status | Atenção | Tooltip da dispersão com `role="status"` (MT7) |

## 5. Regras invioláveis
Nenhum achado viola as regras. Pontos de atenção para o celular, que viram critérios em 02:
- No celular, a tentação é colocar números lado a lado para economizar altura: nunca lado a lado entre **fontes** (BusinessMap e Acelerato), só dentro do mesmo bloco de fonte.
- Telas pequenas não podem "resumir" escondendo o n: "Poucos itens (n=14). Estatística não publicada." precisa caber a 360 sem truncar.
- Nada de visão por pessoa no celular (nenhum "meus itens").
