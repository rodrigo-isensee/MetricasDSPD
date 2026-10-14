# Revisão geral de usabilidade · 01 Diagnóstico

Versão avaliada: `origin/main` 0af552a, lida em `/home/rodrigoisensee/MetricasDSPD-demo` (os caminhos abaixo são relativos à raiz desse repositório). Método: avaliação heurística (Nielsen) mais critérios de painel (hierarquia, densidade, leitura em 5 s, consistência, prevenção de erro, recuperação/desfazer, acessibilidade WCAG 2.2 AA, celular). Fontes: código em `web/src`, design system (`docs/ux/design-system.md`), especificações em `docs/ux/*` e capturas em `docs/qa/evidencias/`.

Algumas capturas são anteriores ao item "Catálogo de métricas" na navegação (mostram 7 destinos; o código tem 8, `web/src/app/rotas.ts:2-11`). Isso só piora os achados de cabeçalho. Medidas em pixels vêm das capturas e são aproximadas.

## Escala de severidade (Nielsen)
| Nota | Significado |
|---|---|
| 0 | Não é problema de usabilidade |
| 1 | Cosmético: corrigir se sobrar tempo |
| 2 | Menor: atrapalha, mas tem contorno; prioridade baixa |
| 3 | Maior: atrapalha tarefa frequente ou deixa a pessoa sem saída; prioridade alta |
| 4 | Catástrofe: impede a tarefa; corrigir antes de liberar |

Nenhum problema chegou a 4: o produto funciona e respeita as regras invioláveis (nada individual, fontes separadas, n < 20 não publicado). Os problemas 3 se concentram em **o que se vê primeiro**, **ocultar/mostrar** e **destinos que somem**.

## Personas consideradas (das especificações já validadas)
- **Coordenador (FL2)** no ritual semanal: tela projetada, Operacional semanal e Tático, conduz a conversa e precisa achar o cartão rápido e voltar a ele.
- **Gerente (FL3)**: notebook e celular, uso mensal, lê o Estratégico e a Visão geral; pouca familiaridade com os códigos.
- **Sustentação**: painel Sustentação (Acelerato), revisão semanal de prazos e escalações.
- **Time (FL1)**: daily no Operacional diário.

---

## 1. Resumo: os 10 problemas mais graves
| # | Problema | Sev. | Onde | Quem sofre mais |
|---|---|---|---|---|
| H1 | Para mostrar de novo um cartão oculto, o controle fica no topo da página, longe de onde o cartão estava | 3 | `features/preferencias/FaixaOcultas.tsx`; `features/painel/PainelPagina.tsx:132` | Coordenador |
| H2 | O cartão oculto some sem deixar vestígio no lugar; o layout se reorganiza | 3 | `components/ui/CartaoMetrica.tsx:315-318` | Coordenador, gerente |
| H3 | "Desfazer" é um aviso flutuante que some em 10 s, não pausa e, pelo teclado, só se alcança depois de todo o conteúdo | 3 | `features/preferencias/ProvedorPainelPreferencias.tsx:27,64-68,169-177` | Quem usa teclado ou leitor de tela |
| H4 | "Ocultar" no painel vale só para a visita (memória da aba), mas o botão não diz isso; ao recarregar o cartão volta | 3 | `features/preferencias/ProvedorPreferencias.tsx:109,125-128`; `CartaoMetrica.tsx:204` | Coordenador (reoculta toda semana) |
| N1 | Link para um cartão oculto (Visão geral, Catálogo, "Por reunião") cai no topo do painel sem aviso | 3 | `ProvedorPainelPreferencias.tsx:85-94` (só complementares); `app/AppShell.tsx:52-55` (desiste em 2 s) | Gerente, coordenador |
| P1 | Muito "chrome" antes do conteúdo: o "Pede atenção" começa perto de 690 px (1280) e de 720 px (375); na Visão geral a 375, depois de ~1000 px | 3 | `PainelPagina.tsx:103-133`; capturas `pre-pr/painel-ocultas-1280-claro.png`, `b12/operacional-diaria-375-claro.png`, `b3/visao-geral-375-claro.png` | Todos; leitura em 5 s falha |
| O1 | Operacional semanal tem ~8.400 px de altura a 1280, sem resumo nem índice fixo; cartões em coluna única | 3 | `features/operacional/OperacionalPage.tsx:158-193`; captura `b12/operacional-semanal-1280-claro.png` (1280×8441) | Coordenador projetando |
| S1 | "Aplicar sugestão do meu papel" sobrescreve na hora as preferências salvas de todos os painéis, sem confirmação nem desfazer (já "Restaurar padrão" pede confirmação) | 3 | `ProvedorPreferencias.tsx:112-115`; `features/preferencias/PreferenciasPage.tsx:155-163` | Qualquer pessoa que testa o atalho |
| H5 | Três mecanismos de recorte com persistências diferentes (Ocultar no cartão, popover "Métricas", página Preferências) e rótulos ambíguos ("Usar minhas preferências" x "Mostrar todas") | 2 | `features/preferencias/BotaoMetricas.tsx:107-108`; `FaixaOcultas.tsx:21-22` | Gerente (uso esporádico) |
| G2 | Os códigos (O2, T4, BLOQUEADOS, EI-FL1) são o rótulo principal de links e listas ("Ver O2", "2 métricas ocultas: O9, O10") | 2 | `components/ui/FaixaAtencao.tsx:153`; `FaixaOcultas.tsx:19` | Gerente, sustentação |

---

## 2. Por fluxo

### 2.1 Fluxo ocultar e mostrar um cartão (ponto de partida do usuário)
Jornada atual (1280, Operacional semanal, cartão O18 no fim da página):
1. A pessoa clica em "Ocultar" (link sublinhado, último item do cabeçalho do cartão).
2. O cartão desaparece; o foco vai ao título do próximo cartão; um aviso flutuante aparece embaixo ("O18 oculta. 9 de 10 métricas visíveis. Desfazer") e some em 10 s.
3. Depois de 10 s, para trazer de volta: subir uns 7.000 px até a faixa "N métricas ocultas: O18" sob os filtros, ou abrir "Métricas: N de M" e achar a caixa certa.
4. Se houver mudança de critério em O18, aparece mais uma faixa âmbar no topo ("Critério alterado em O18 (oculta)…").
5. Ao recarregar a página ou abrir em nova aba, O18 volta (a escolha era só da visita).

| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| H1 | Controle de "mostrar" longe do lugar do cartão (lei da proximidade); exige lembrar o código e rolar até o topo | Reconhecer em vez de lembrar; controle e liberdade | 3 | `PainelPagina.tsx:132` coloca `FaixaOcultas` entre filtros e conteúdo; captura `pre-pr/painel-ocultas-1280-claro.png` (faixa em y≈480–540, longe dos cartões) | Coordenador perde o fio da conversa no ritual para "desfazer" um clique |
| H2 | Sem vestígio no lugar: a seção não indica que tinha um cartão ali; a grade se reorganiza e muda a memória espacial de quem usa o painel toda semana | Visibilidade do status; consistência | 3 | `CartaoMetrica.tsx:315-318` retorna `null`; `SecaoPainel.tsx:23-36` só avisa quando **todos** da seção estão ocultos | "Cadê o gráfico de bugs?" na reunião seguinte |
| H3 | Desfazer temporizado (10 s), sem pausa ao passar o mouse ou focar; renderizado depois de `children` (fim da ordem de tabulação) enquanto o foco é levado ao próximo título; o anúncio em `aria-live` diz "Desfazer" como texto, sem ação ao alcance | WCAG 2.2.1 (tempo ajustável), 2.4.3 (ordem do foco); controle e liberdade | 3 | `ProvedorPainelPreferencias.tsx:27` (`MS_AVISO = 10_000`), `:64-68`, `:115`, `:169-177` | Quem usa teclado ou leitor de tela, na prática, não consegue desfazer |
| H4 | "Ocultar" é volátil (estado em memória), mas o rótulo não diz "nesta visita"; a página Preferências é o único lugar que grava, e ela não é sugerida no momento de ocultar | Correspondência com o modelo mental; visibilidade do status | 3 | `ProvedorPreferencias.tsx:109` (`visita[p] ?? salvos(p)`), `:125-128` (estado React); botão em `CartaoMetrica.tsx:197-205` com rótulo "Ocultar" | Coordenador oculta as mesmas 3 métricas toda semana; conclui que "a ferramenta não guarda" |
| H5 | Três caminhos e dois níveis de persistência; "Usar minhas preferências" não diz o que acontece (volta ao padrão salvo? e se nunca salvei?) e convive com "Mostrar todas" no mesmo nível | Consistência; correspondência com o mundo real | 2 | `BotaoMetricas.tsx:81-85,107-108`; `FaixaOcultas.tsx:21-22`; spec `docs/ux/preferencias-metricas/06-especificacao.md` fluxo 2 | Gerente esporádico não forma modelo mental |
| H6 | Avisos empilhados no topo: faixa de ocultas + uma faixa âmbar por mudança de critério de cada métrica oculta. Âmbar é a cor de "atenção" no design system, e aqui disputa com o "Pede atenção" | Design minimalista; hierarquia | 2 | `AvisosCriterioOcultas.tsx:16-31`; captura `pre-pr/painel-ocultas-1280-claro.png` (duas faixas âmbar antes do "Pede atenção") | Empurra o "Pede atenção" para baixo da dobra |
| H7 | A faixa de ocultas lista só códigos ("O9, O10") | Reconhecer em vez de lembrar | 2 | `FaixaOcultas.tsx:9,19` | Gerente não sabe o que é O9 |
| H8 | "Ocultar" tem estilo de link sublinhado ao lado de botões com borda, sem ícone; a especificação previa "Ocultar esta métrica" em menu do cartão | Consistência e padrões | 1 | `CartaoMetrica.tsx:202` x `docs/ux/preferencias-metricas/06-especificacao.md` ("Menu do cartão") | Ação parece navegação |
| H9 | O botão "Métricas: N de M (+K complementares)" tem rótulo longo e soma de leitura difícil; o "+K" aparece sempre | Minimalismo | 1 | `BotaoMetricas.tsx:67-70` | Ruído na barra |
| H10 | Com todas as complementares ocultas, a seção vira só um texto sem botão para mostrar (beco sem saída local) | Ajudar a recuperar | 2 | `features/complementares/MaisMetricas.tsx:41-50` | É preciso descobrir o popover |
| H11 | Ponto positivo a replicar: no "Pede atenção", um alerta de métrica oculta mostra o selo "métrica oculta" e "Mostrar O10 nesta visita" **no próprio item** | (bom exemplo de proximidade) | 0 | `FaixaAtencao.tsx:122-145` | Padrão a estender ao lugar do cartão |

Resposta direta à pergunta do usuário: **não, o botão no topo não é a melhor solução.** Ele resolve "saber que há ocultas" (visibilidade), mas falha em proximidade (H1), em vestígio no lugar (H2), em desfazer acessível (H3) e em expectativa de persistência (H4). As alternativas estão em `02-propostas.md` (proposta P1) e no protótipo `03-prototipo/p1-ocultar-no-lugar.html`.

### 2.2 Fluxo seguir um link para um cartão (Visão geral, Catálogo, "Por reunião", "Pede atenção")
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| N1 | Se o cartão de destino é do núcleo e está oculto, nada acontece: a página abre no topo, sem mensagem. Só os complementares são reabertos ao chegar pelo hash | Visibilidade do status; ajudar a recuperar | 3 | `ProvedorPainelPreferencias.tsx:85-94` (só `grupo === 'complementar'`); `AppShell.tsx:52-55` (tenta 40× e desiste em silêncio); destinos em `lib/destinoCartao.ts:7-9`, `features/visao-geral/VisaoGeralPage.tsx:166-177,193` | Gerente clica "Ver O2" na Visão geral e "o link não funciona" |
| N2 | Na Visão geral, a entrada pelo ritual ("Por reunião": daily, revisão semanal, reunião de serviço…) é a última seção da página | Hierarquia; flexibilidade (atalho para quem usa sempre) | 2 | `VisaoGeralPage.tsx:301-315` | Coordenador abre a Visão geral na reunião e tem que rolar até o fim |
| N3 | Os links dos alertas usam o código ("Ver O2", "Ver BLOQUEADOS") em vez do nome | Reconhecer em vez de lembrar | 2 | `FaixaAtencao.tsx:153`; captura `b12/operacional-diaria-1280-claro.png` | Gerente e sustentação |

### 2.3 Fluxo filtrar
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| F1 | Abaixo de 768 px a barra não é fixa e o cabeçalho do app também não; ao rolar um painel longo, quem está no celular não vê mais quais filtros estão ativos (só os chips no topo) | Visibilidade do status | 2 | `features/filtros/BarraFiltros.tsx:152` (`md:sticky`), `app/AppShell.tsx:95` (`md:sticky`) | Gerente no celular lê um número sem saber o recorte; mitigado pelo chip "Filtros aplicados" no rodapé de cada cartão |
| F2 | Ponto positivo: aplicação imediata, chips removíveis, anúncio em `aria-live`, "Limpar filtros" só fora do padrão, aviso de consolidado sem comparar equipes | (bom) | 0 | `BarraFiltros.tsx:103-240` | Manter |

### 2.4 Fluxo exportar
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| X1 | Dois botões vizinhos, "Exportar" e "Exportação personalizada", com a diferença (este painel x todos os níveis) só dentro do diálogo | Correspondência; minimalismo | 2 | `PainelPagina.tsx:126-130`; `VisaoGeralPage.tsx:220-223` | Hesitação; quem quer só o painel abre o personalizado |
| X2 | No diálogo, "Limpar seleção" fica entre o primário e "Cancelar" e tem o mesmo peso de "Cancelar"; desmarca tudo sem desfazer | Prevenção de erro | 1 | captura `pre-pr/exportar-dialogo-1280-claro.png` | Clique errado custa remarcar até 12 caixas |
| X3 | Ponto positivo: prévia do arquivo com nome, selo "Dados fictícios em todas as páginas" e "sem nomes de pessoas" | (bom) | 0 | idem | Manter |

### 2.5 Fluxo preferências (perfil)
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| S1 | "Aplicar sugestão do papel" grava por cima de tudo, sem confirmação e sem desfazer; "Restaurar padrão" (menos destrutivo) pede confirmação | Prevenção de erro; consistência | 3 | `ProvedorPreferencias.tsx:112-115`; `PreferenciasPage.tsx:93-112,155-163` | Perde o ajuste fino feito antes; a composição dos conjuntos ainda é provisória (P-1 em aberto na spec) |
| S2 | A página não mostra o efeito (prévia ou link "Ver o painel"); aplicar na hora sem retorno visual perto da caixa (o "Salvo neste navegador" fica no fim da página, depois de quatro grupos) | Visibilidade do status | 2 | `PreferenciasPage.tsx:169-178`; captura `pre-pr/preferencias-1280-claro.png` (status em y≈1560) | Dúvida se salvou |
| S3 | Rótulos com código em negrito antes do nome ("**O2** Idade do trabalho") invertem a hierarquia de leitura | Reconhecer em vez de lembrar | 1 | `PreferenciasPage.tsx:67-69`; `BotaoMetricas.tsx:44-46` | Leve |

---

## 3. Por tela

### 3.1 Shell (cabeçalho, navegação, rodapé)
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| G1 | Cabeçalho em duas linhas a 1280 (8 destinos + selo + tema + Preferências + Ajuda); a 375 ocupa ~112 px com "Menu", selo e seletor de tema, que é um `<select>` nativo | Minimalismo; hierarquia | 2 | `app/AppShell.tsx:97-123`; `app/NavegacaoGlobal.tsx:32-41`; capturas `b3/visao-geral-1280-claro.png`, `b12/operacional-diaria-375-claro.png` | Menos área útil; o tema é uma preferência rara ocupando lugar nobre |
| G2 | Códigos como rótulo primário em toda parte (ver N3, H7, S3) | Reconhecer em vez de lembrar | 2 | ver linhas acima | Gerente, sustentação |
| G3 | Abas com dois estilos: `SeletorLocal` (borda inferior e fundo claro) e abas de `/dados` (botão preenchido) | Consistência | 1 | `features/dados/DadosPage.tsx:61,68` x `docs/ux/design-system.md` 2.8 | Leve |
| G4 | Ponto positivo: "Pular para o conteúdo", foco no h1 ao trocar de rota, título da aba com "Dados fictícios" | (bom) | 0 | `AppShell.tsx:17-36,60-72,83-92` | Manter |

### 3.2 Cabeçalho comum dos painéis
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| P1 | Até nove blocos antes do primeiro conteúdo: título, "Dados até", pergunta, "Copiar link", frescor por fonte, linha reservada do "Link copiado", faixa de calibração, cadência, barra "Métricas/Exportar", filtros, aviso de consolidado, faixa de ocultas, avisos de critério. O "Pede atenção" (o que deveria ser lido em 5 s) fica no fim da primeira tela ou abaixo dela | Hierarquia; leitura em 5 s; minimalismo | 3 | `PainelPagina.tsx:103-133`; `components/ui/CabecalhoPainel.tsx:69-106`; capturas `pre-pr/painel-ocultas-1280-claro.png` ("Pede atenção" em y≈685), `b12/operacional-diaria-375-claro.png` (primeiro item em y≈765 de 812) | Todos; no celular o primeiro alerta mal aparece |
| P2 | Espaço vazio reservado de ~40 px entre o frescor e a cadência (linha de status do "Link copiado" sempre presente) | Minimalismo | 1 | `CabecalhoPainel.tsx:92-94`; capturas citadas (vão entre "Coleta falhou…" e "Cadência") | Leve |
| P3 | Três barras de ação empilhadas (cadência; Métricas/Exportar; filtros), cada uma com regra própria de alinhamento | Hierarquia; consistência | 2 | `PainelPagina.tsx:125-131` | Leitura fragmentada |
| P4 | A 375, a faixa de calibração põe o link "Saiba mais…" ao lado do texto e espreme o texto em coluna de ~120 px, com 9 linhas | Celular; legibilidade | 2 | captura `b3/visao-geral-375-claro.png` (y≈600–800) | Gerente no celular |
| P5 | "Entenda" ao lado do selo de frescor é vago (entender o quê?) | Correspondência | 1 | capturas de frescor | Leve |

### 3.3 Visão geral
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| V1 | Alerta com texto que soa positivo: "WIP dentro do limite em 46 de 59 dias úteis (meta: 90% dos dias)" ao lado de um ícone de alerta. A falha (78%, abaixo de 90%) não está escrita | Correspondência; prevenção de erro de leitura | 2 | captura `b3/visao-geral-1280-claro.png` (item "Ver O1") | Gerente lê "dentro do limite" e ignora |
| V2 | Três blocos explicativos antes dos alertas ("As preferências valem…", calibração, recorte fixo com quatro intervalos de datas) | Minimalismo; leitura em 5 s | 2 | `VisaoGeralPage.tsx:214-239` | A primeira tela é texto de contexto, não status |
| V3 | "Por reunião" no fim (ver N2) | Hierarquia | 2 | `VisaoGeralPage.tsx:301-315` | Coordenador |
| V4 | Faixa titulada "O que pede atenção agora" mas configurada com `momento="hoje"` (inconsistência interna com a spec 7.3, sem efeito visível) | Consistência | 0 | `VisaoGeralPage.tsx:263` | Só manutenção |

### 3.4 Operacional (diária e semanal)
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| O1 | Semanal com ~8.400 px a 1280: 10 cartões de largura total em sequência; o "Ir para" é uma linha de links que não acompanha a rolagem; não há resumo do estado das seções | Hierarquia; densidade; flexibilidade | 3 | `OperacionalPage.tsx:161-191`; captura `b12/operacional-semanal-1280-claro.png` | Coordenador projetando: "volta lá no tempo de ciclo" exige rolar muito |
| O2 | Cartão O2 com tabela "Itens para olhar primeiro" de 10 linhas e títulos quebrados em 4 linhas: o cartão passa de 900 px e empurra BLOQUEADOS e O1 para baixo | Densidade | 2 | captura `b12/operacional-diaria-1280-claro.png` (y≈340–1270 em escala) | Time na daily |
| O3 | Ponto positivo: pergunta da cadência visível ("Qual item mais velho não andou desde ontem?") e link para a semanal no fim | (bom) | 0 | `OperacionalPage.tsx:32-35,147-154` | Manter |

### 3.5 Tático, Estratégico e Sustentação
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| T1 | Mesmo cabeçalho pesado (P1) e mesma página longa (O1) em menor grau; Sustentação a 375 repete o padrão de frescor e calibração antes do conteúdo | Hierarquia | 2 | capturas `b12/tatico-1280-claro.png`, `b3/sustentacao-375-claro.png` | Sustentação na revisão semanal |
| T2 | Ponto positivo: amostra insuficiente explicada por estatística, nunca o cartão inteiro; aviso "Resultado consolidado de N equipes. O sistema não compara equipes." | (bom) | 0 | `docs/ux/design-system.md` 2.5 | Manter |

### 3.6 "Mais métricas deste painel"
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| M1 | Com todas as complementares ocultas, vira texto sem ação (H10) | Ajudar a recuperar | 2 | `MaisMetricas.tsx:41-50` | — |
| M2 | Borda de acento no `<details>` fechado dá aparência de item selecionado ou com foco | Consistência | 1 | `MaisMetricas.tsx:56` | Leve |

### 3.7 Catálogo `/metricas`
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| C1 | Sem busca por nome ou pergunta; 46 linhas só com filtros por painel e grupo; a tabela não traz a pergunta que cada métrica responde | Flexibilidade; reconhecer | 2 | `features/catalogo/CatalogoPage.tsx:31-64,68-77` | Gerente procurando "lead time" |
| C2 | Filtros do catálogo não vão para a URL (não dá para compartilhar "catálogo do Tático") | Consistência com o resto do produto (URL é a fonte da verdade) | 1 | `CatalogoPage.tsx:15-16` | Leve |
| C3 | "Ir ao painel" de métrica oculta cai no caso N1 e o catálogo não indica que a métrica está oculta para a pessoa | Visibilidade do status | 2 | `CatalogoPage.tsx:86-90` | — |

### 3.8 Dados e coletas `/dados`
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| D1 | Abas com estilo diferente das abas do painel (G3) | Consistência | 1 | `DadosPage.tsx:61` | Leve |
| D2 | Ponto positivo: aviso "não há informação por pessoa"; fontes em abas que nunca se somam | (bom) | 0 | `DadosPage.tsx:43-49,73-77` | Manter |

### 3.9 Estados (carregando, erro, vazio, amostra insuficiente)
| Id | Problema | Heurística / critério | Sev. | Evidência | Impacto |
|---|---|---|---|---|---|
| E1 | Enquanto o estado de coleta não chega, o painel inteiro fica em branco reservado (`min-h-screen`), sem esqueleto nem texto: a pessoa vê só o cabeçalho | Visibilidade do status | 2 | `PainelPagina.tsx:118-119`; `VisaoGeralPage.tsx:240-241` | Em rede lenta parece travado |
| E2 | Ponto positivo: erro de um cartão não derruba a página; "Tentar de novo"; faixa nunca afirma "nada pede atenção" enquanto carrega | (bom) | 0 | `FaixaAtencao.tsx:91-114`; capturas `b12/*estado-erro*` | Manter |

### 3.10 Celular (375)
Resumo dos achados que se somam no celular: P1 (primeiro alerta na dobra), P4 (calibração espremida), F1 (filtros e cabeçalho não fixos), G1 (cabeçalho de 112 px), H3 (aviso flutuante cobre conteúdo; 10 s). Severidade agregada para o gerente: 3.

---

## 4. Acessibilidade (WCAG 2.2 AA), recorte desta revisão
| Critério | Situação | Achado |
|---|---|---|
| 2.2.1 Tempo ajustável | Falha parcial | H3: desfazer some em 10 s sem pausar nem estender (há caminho alternativo, por isso não é bloqueio) |
| 2.4.3 Ordem do foco | Falha parcial | H3: o aviso com "Desfazer" fica no fim do DOM, depois de todo o painel |
| 4.1.3 Mensagens de status | Atende, com ressalva | Anúncio inclui a palavra "Desfazer" sem ação associada (`ProvedorPainelPreferencias.tsx:115`) |
| 1.4.11 Contraste de não texto | Atende | Tokens `--borda-controle` |
| 2.5.8 Tamanho do alvo | Atende | Classe `.alvo` (24 px; 44 px abaixo de 768) |
| 1.4.1 Uso de cor | Atende | Ícone e texto em todo status |
| 2.4.11 Foco não encoberto | Risco | Aviso flutuante fixo embaixo (`bottom-4`) pode cobrir o título focado em telas baixas; barra de filtros fixa já tem `scroll-padding` |

## 5. Regras invioláveis
Nenhum achado viola as regras do briefing. As propostas em `02-propostas.md` foram desenhadas para não criar ranking, meta por pessoa nem comparação entre equipes, e para manter BusinessMap e Acelerato separados.
