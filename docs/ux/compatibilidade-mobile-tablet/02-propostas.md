# Compatibilidade com celular, iPad e tablet · 02 Propostas

Base: `01-diagnostico.md` (achados MT1 a MT14). Protótipo: `03-prototipo/index.html`. Decisões do usuário e decisões do time: `04-decisoes.md`.

## 1. Quem usa e quando (empatia, resumida)
As personas são as das especificações já validadas; aqui só o que muda com o aparelho. O que não está documentado fica como **hipótese** até o usuário confirmar (Q1 e Q2 em `04-decisoes.md`).

| Persona | Aparelho e momento | Tarefa no aparelho | Dor de hoje |
|---|---|---|---|
| Gerente (FL3) | Celular, fora da mesa (corredor, deslocamento, antes de uma reunião); iPad em reunião | "Estamos bem?": Visão geral e Resumo do Operacional; abrir o link que alguém mandou no Teams | Primeira tela só com cabeçalho (P1); não sabe o recorte depois de rolar (MT4); não descobre por que um número não aparece (MT6) |
| Coordenador (FL2) | Notebook projetado no ritual; tablet ou iPad no colo durante a reunião semanal | Achar a seção certa rápido ("volta no tempo de ciclo"), alternar Diária/Semanal/Sustentação, compartilhar o link da visão | Página longa sem índice (MT3); alvos pequenos no tablet (MT1) |
| Sustentação | Celular durante plantão; desktop na revisão | Ver "Pede atenção" da Sustentação e o SLA por prioridade | Filtros de prioridade some ao rolar (MT4) |
| Time (FL1) | Desktop ou TV na daily; celular para consulta rápida | Diária: "qual item mais velho não andou?" | O2 com tabela larga no celular |

**Hipóteses.** H1: o celular é para **leitura e compartilhamento**, não para configurar (Preferências e exportação no celular são raras, mas precisam funcionar). H2: o iPad é usado tanto em pé quanto deitado; o tablet Android é minoria. H3: a maior parte do uso móvel é na rede corporativa ou em 4G com sinal bom; rede ruim é exceção.

## 2. Definição
**Problema.** Gerente e coordenador precisam ler o estado do fluxo e da sustentação no celular e no tablet com a mesma confiança do desktop, porque é ali que surgem as perguntas fora da mesa, mas hoje o sistema decide tudo pela largura da tela e trata o iPad como desktop (alvos pequenos) e o celular deitado como notebook (barras fixas comendo a altura).

**Como podemos...**
1. ...garantir alvos de toque confortáveis em qualquer aparelho de toque, sem engordar o desktop?
2. ...manter o recorte (filtros) e a navegação por seção sempre à vista no celular, gastando no máximo uma faixa de 52 px?
3. ...dar ao gráfico um equivalente de toque tão bom quanto o hover, sem misturar fontes e sem esconder o n?
4. ...aproveitar o tablet em pé sem transformá-lo num celular esticado?
5. ...manter o sistema rápido em 4G sem mudar a regra de "cada cartão carrega sozinho"?

**Critérios de sucesso (medidos no teste com o usuário e nos E2E).**
- No celular a 375, o primeiro item de "Pede atenção" aparece **sem rolar** em todos os painéis com faixa de atenção (hoje: perto de 720 px).
- 100% dos controles interativos com pelo menos 44×44 px quando o aparelho tem ponteiro de toque, em qualquer largura.
- Com o celular deitado, as partes fixas ocupam **0 px** da altura.
- Em 3 tarefas cronometradas no protótipo (achar a seção "Qualidade", trocar a equipe, abrir o valor de uma semana no gráfico), o gerente conclui cada uma em até 15 s no celular, sem ajuda.
- Orçamento de rede móvel proposto ao arquiteto (seção 7) cumprido nas rotas `/` e `/operacional`.

## 3. Ideação: alternativas
| | Alternativa | Como é | Prós | Contras | Esforço |
|---|---|---|---|---|---|
| A | Só ajustar as larguras atuais | Mover alguns `md:` para `lg:`, aumentar o `.alvo` até 1024 | Barato, pouco risco | Continua decidindo por largura: notebook estreito ganha alvos de 44, celular deitado continua com barras fixas, iPad Pro 13" (1366) continua com alvos de desktop | Baixo |
| **B** | **Largura × ponteiro × altura** | Largura decide o **layout** (4 faixas); o tipo de ponteiro (`any-pointer: coarse`) decide **alvos, campos e gestos**; a altura (`min-height: 600px`) decide **o que pode ficar fixo** | Cobre iPad em qualquer orientação, celular deitado, notebook com tela de toque, janela dividida; uma regra por preocupação, fácil de testar | Três eixos para o time conhecer; precisa de E2E com emulação de toque | Médio |
| C | Experiência móvel separada | Rotas ou componentes próprios para celular (abas inferiores, cartões resumidos, "modo leitura") | Pode ficar muito enxuta no celular | Dois produtos para manter; risco de o celular mostrar menos regras (n, fonte, janela) que o desktop; links compartilhados abririam telas diferentes em cada aparelho | Alto |
| D | App instalável (PWA) com tela cheia | Manifesto `display: standalone`, ícone, abre sem barra do navegador | Parece app | No iPhone, em tela cheia **não há botão Voltar nem barra de endereço**: "Copiar link" e o histórico por URL (base de todo o produto) ficam piores. Offline está fora do escopo e não faz sentido para dados que mudam a cada coleta | Médio |

**Impacto × esforço.** B tem o maior impacto por esforço; A é um subconjunto de B (fica como primeira fatia, seção 9); C e D pioram a regra de ouro do produto ("a URL é a fonte da verdade e o link compartilhado mostra a mesma coisa").

**Escolhida: B.** Ícone na tela de início sem tela cheia (só o atalho, que abre no navegador) é técnico e barato e entra como item opcional da fatia 3, sem decisão de produto: não muda comportamento.

## 4. Matriz de suporte recomendada

### 4.1 Níveis
| Nível | Significado | O que o QA faz |
|---|---|---|
| **1 · Suportado e testado** | Funciona e é otimizado; defeito é bug com prioridade normal | E2E com emulação a cada PR com interface + roteiro curto em aparelho real a cada release que muda interface |
| **2 · Funciona** | Mesmo motor e mesmas faixas do nível 1; sem teste dedicado; defeito é tratado se reproduzir no nível 1 ou se for bloqueio | Coberto indiretamente (mesmo motor, mesma largura) |
| **3 · Não suportado** | Abaixo do piso técnico | Mostra aviso "navegador sem suporte" (seção 5.13) |

### 4.2 Aparelhos, navegadores e versões
| Classe | Aparelho de referência (CSS px) | Navegador | Versão mínima testada (nível 1) | Piso técnico (nível 2) | Orientação |
|---|---|---|---|---|---|
| Celular iPhone | iPhone SE 2ª/3ª (375×667) e iPhone 15/16 (393×852) | Safari iOS | **iOS 18** (Safari 18) | iOS 16.4 (Safari 16.4) | Retrato otimizado; paisagem funcional |
| Celular Android | Galaxy A/S (360×780, 384×854), Pixel (412×915) | Chrome Android | **Chrome estável atual e o anterior**, Android 10+ | Chrome 111 | Retrato otimizado; paisagem funcional |
| iPad | iPad 10ª/11ª geração e Air 11" (820×1180) | Safari iPadOS | **iPadOS 18** | iPadOS 16.4 | **Retrato e paisagem otimizados** |
| Tablet Android | Galaxy Tab S (800×1280) | Chrome Android | Chrome estável atual | Chrome 111 | Retrato e paisagem (nível do D1) |
| Outros | iPad mini (744), iPad Pro 13" (1024×1366), Split View e Slide Over, dobráveis (Galaxy Z Fold), Samsung Internet 22+, Firefox Android 128+, Edge Android, navegador embutido do Teams e do WhatsApp | — | — | pisos acima | Nível 2 |

**Por que esses números.**
- **Piso técnico = Safari 16.4 e Chrome 111** porque o front usa **Tailwind CSS 4**, que exige esses motores (camadas em cascata, `@property`, `color-mix()`); abaixo disso o CSS não se aplica e a tela fica sem estilo. Baixar o piso exigiria trocar ou reconfigurar o Tailwind, custo alto para aparelhos de 2018 ou anteriores.
- **iOS/iPadOS 18 como mínimo testado** é a política "versão atual e a anterior" da Apple: em outubro de 2026 a atual é a linha 26 (a Apple pulou de 18 para 26 em 2025) e a anterior é a 18, que ainda recebe correções de segurança. O iOS 18 roda do iPhone XS/XR (2018) em diante. Se o iOS 27 já estiver no parque, a regra continua "atual e anterior". Versões 16.4 a 17 ficam no nível 2: funcionam pelo piso, sem teste.
- **Chrome Android: atual e anterior**, porque o Chrome se atualiza sozinho pela Play Store; **Android 10+** porque o Chrome atual não instala mais em Android 8 e 9 (informação a confirmar pelo arquiteto na data da implementação).
- **Celular deitado é funcional, não otimizado**: é o modo de "ver um gráfico maior" por alguns segundos; o compromisso é nada fixo, nada cortado e nada a rolar de lado na página.
- **Navegador embutido (Teams, WhatsApp)** entra no nível 2 porque é como o link compartilhado é aberto no celular; ele usa o mesmo motor (WebKit no iOS, Chrome no Android), mas pode bloquear o download do PDF (seção 5.9).
- **Fora:** app nativo, offline, tela cheia (PWA standalone), relógio, TV, larguras abaixo de 320.

**Hipótese a confirmar (Q1 em 04):** o parque corporativo (MDM) tem iPhones e iPads em iOS/iPadOS 18 ou superior. Se houver aparelhos presos abaixo de 16.4, eles caem no nível 3.

## 5. Padrão por faixa e por componente

### 5.1 Os três eixos (regra única do design system)
| Eixo | Condição CSS | Decide |
|---|---|---|
| Largura · **compacta** | `< 640` (celular em pé, Slide Over) | Coluna única; filtros em folha; menu em gaveta |
| Largura · **média** | `640 a 1023` (celular deitado, iPad mini, tablets em pé, Split View) | Coluna larga; pares compactos lado a lado a partir de 768; filtros em linha a partir de 768; menu em gaveta |
| Largura · **ampla** | `1024 a 1279` (tablets deitados, notebook pequeno) | Grade de 12 colunas, pares lado a lado; navegação completa em uma linha |
| Largura · **desktop** | `≥ 1280` | Como hoje (até 1440 centralizado) |
| Ponteiro · **toque** | `(any-pointer: coarse)` | Alvos de 44 px, campos com 16 px, tooltips por toque, área de toque ampliada nos gráficos, "Compartilhar link" |
| Ponteiro · **fino** | sem toque | Alvos de 24 px mínimos (como hoje) |
| Altura · **baixa** | `(max-height: 599px)` | **Nada fixo** (cabeçalho, filtros, barra de contexto e índice rolam com a página) |

Os breakpoints de largura continuam os do design system (640, 768, 1024, 1280). A diferença é que **alvo e fixação deixam de depender da largura**. `any-pointer` (e não `pointer`) porque um iPad com teclado e trackpad continua sendo tocado e um notebook com tela de toque também.

### 5.2 Shell: cabeçalho e menu
| Faixa | Padrão |
|---|---|
| Compacta | Uma linha de 56 px: "Métricas DSPD", selo curto "Fictícios" (texto completo no `aria-label` e na gaveta) e "Menu". **Tema sai do cabeçalho** e vai para a gaveta (G1, P2 da revisão). Cabeçalho **não fixo** |
| Média | Igual à compacta; com 768 ou mais e altura ≥ 600, o cabeçalho fica fixo (56 px) |
| Ampla | Navegação completa em **uma linha** (menu-alvo de 5 destinos + Preferências + Ajuda); tema volta ao cabeçalho; fixo com altura ≥ 600 |
| Desktop | Igual à ampla |
| Gaveta (compacta e média) | Lado esquerdo, `min(18rem, 85vw)`; "Fechar" (×) no topo à direita, 44 px; destinos com 44 px; grupo "Tema" com três opções (Claro, Escuro, Sistema) em rádio de 44 px; Preferências e Ajuda no fim. Fecha ao escolher destino, com Esc e tocando fora |

### 5.3 Barra de contexto fixa no celular (filtros + seção)
Resolve MT3 e MT4 juntos, no formato que a P3 e a spec da Sustentação (5.2 e 5.7) já previram.
| Faixa | Padrão |
|---|---|
| Compacta, altura ≥ 600 | Faixa fixa no topo de **52 px** com dois botões de 44 px: **"Filtros (n)"** (abre a folha atual) e **"Seção: Tempo ▾"** (abre a lista de seções com o resumo da P3: "1 pede atenção", "1 oculta", "sem alerta"). Aparece só em páginas com filtros ou com índice; sem índice (Diária, Resumo), só "Filtros (n)" em largura total. Abaixo dela, uma linha de 20 px com o recorte em texto ("Todas as equipes · 12 semanas"), que some quando a pessoa já está no topo |
| Compacta, altura < 600 | A mesma faixa, mas **não fixa** |
| Média (768+) e acima | Barra de filtros em linha (como hoje) e, logo abaixo, o índice da U3 em uma linha rolável com as seções; os dois fixos só com altura ≥ 600 |
| Regra | O seletor de Visão (Resumo, Diária, Semanal, Sustentação) **nunca** é fixo (spec 5.7). A legenda de fonte da barra ("Filtros da Sustentação · Acelerato") aparece no título da folha e no botão quando a visão é a Sustentação: "Filtros da Sustentação (1)" |

### 5.4 Cabeçalho do painel
| Faixa | Padrão |
|---|---|
| Compacta | Ordem: título + "Dados até" na mesma linha; pergunta do painel; seletor de Visão; **"Pede atenção"**; o resto (frescor detalhado, calibração, "Métricas", "Exportar", "Compartilhar") vai para uma linha de ações compacta e para "Sobre estes dados ▾" recolhido. Meta: primeiro alerta antes de 560 px de altura a 375 |
| Compacta, seletor de Visão | 4 opções em **grade 2×2** abaixo de 400 px de largura (previsível, sem quebra aleatória); uma linha a partir de 400 |
| Média | Igual ao desktop, em uma coluna larga; calibração em linha inteira (nunca espremida ao lado de link, P4) |
| Ampla e desktop | Como a revisão geral propõe (P2, topo enxuto) |

### 5.5 Grade de cartões
| Faixa | Padrão |
|---|---|
| Compacta | Coluna única |
| Média (768 a 1023) | Largura total para cartões com gráfico de série ou tabela; **pares compactos lado a lado** (cartões só de números ou lista curta), partindo dos pares já definidos na P3. Confirmado: O15 + O18 (só números). Os outros pares da P3 (O10/O7, S3/S4, S5/S6) só entram lado a lado em 768 se nenhum dos dois tiver gráfico de série; a lista final sai da revisão de UX da implementação. Os demais seguem em largura total |
| Ampla e desktop | Como hoje (`lg:col-span-6` / `12`) |
| Regra inviolável | Nunca um cartão do BusinessMap ao lado de um do Acelerato (as visões já separam; o Resumo empilha os blocos em todas as faixas) |

### 5.6 Cabeçalho do cartão e "Ocultar"
| Ponteiro | Padrão |
|---|---|
| Toque | "Como ler", "Ver como tabela" e "Ocultar" viram botões de 44 px com ícone e texto, 8 px entre eles; "Ocultar" vai para o fim da linha, separado dos outros por um espaço maior (`ml-auto`), para não ser tocado por engano. A 360, se não couber, "Ocultar" desce para a linha de baixo, sozinho à direita |
| Fino | Como hoje (H8 da revisão segue como proposta à parte) |
| Marcador de oculto (U2) | Nasce com "Mostrar" de 44 px no toque |

### 5.7 Gráficos (equivalente de toque para o hover)
| Ponteiro | Padrão |
|---|---|
| Toque | Tocar no gráfico seleciona a **coluna (semana, mês) mais próxima do dedo** em barras, linhas e áreas; em dispersão, o **ponto mais próximo num raio de 24 px**. O valor aparece numa **faixa de leitura acima do gráfico** (não um tooltip debaixo do dedo): "Semana de 21/09: 71 itens concluídos". Fica até tocar fora, tocar em outra coluna ou tocar em "×". Arrastar na horizontal sobre o gráfico **não** rouba a rolagem vertical da página |
| Fino | Tooltip como hoje |
| Todos | "Ver como tabela" continua sendo o equivalente completo. Linha de referência (P50, P85, meta) rotulada fora da área das barras quando a largura do gráfico for < 400 (MT12). O tooltip da dispersão perde o `role="status"` (consistente com o `TooltipTema`) |
| Amostra < 20 | A faixa de leitura diz "Poucos itens (n=14). Estatística não publicada." e nunca mostra o valor |

### 5.8 Tabelas largas e mapa de calor
| Faixa | Padrão |
|---|---|
| Compacta e média | Rolam dentro da região rotulada (como hoje), **com a primeira coluna fixa** (rótulo da linha sempre visível) e a sombra de borda atual |
| Compacta, catálogo (na Ajuda) | Cada métrica vira um **cartão de lista** (nome, pergunta, painel e visão, fonte, link "Abrir"); filtros por painel em folha |
| "amostra insuficiente" (MT6) | Some o `title`. A tabela ganha uma nota fixa logo abaixo: "— amostra insuficiente: menos de 20 itens, a estatística não é publicada." Uma vez por tabela, visível em todos os aparelhos |

### 5.9 Exportação
| Faixa | Padrão |
|---|---|
| Compacta | Folha inferior (como hoje), rodapé fixo com o botão primário em largura total |
| Média (768+) | **Modal central** de `min(52rem, 100vw - 48px)`, uma coluna até 1023, duas a partir de 1024 |
| Toque | Depois de "Baixar", a linha de status diz: "Se o arquivo não abrir, abra esta página no Safari ou no Chrome e tente de novo." (cobre o navegador embutido do Teams e do WhatsApp sem precisar detectá-lo) |
| Tudo | Nada muda nas regras do 007/008 (oculto fica fora; seções por fonte; "sem nomes de pessoas") |

### 5.10 Compartilhar link
| Ponteiro | Padrão |
|---|---|
| Toque, com `navigator.share` | Botão **"Compartilhar"** abre a folha nativa (Teams, e-mail, WhatsApp) com título "Métricas DSPD · Operacional · Semanal" e a URL da visão (sem o parâmetro `mock`). Cancelar a folha não mostra erro |
| Sem `navigator.share` ou ponteiro fino | "Copiar link desta visão" como hoje, com o campo selecionado como alternativa |
| Status | Some a linha vazia reservada do "Link copiado" (P2): o status aparece no próprio botão por 5 s ("Link copiado") |

### 5.11 Popovers e folhas (Filtros, Métricas, Período, Dica)
| Faixa | Padrão |
|---|---|
| Compacta | Folha inferior; botão de fechar no topo e ação primária no rodapé fixo da folha (nunca no fim da rolagem); `max-height: 90dvh` |
| Média e acima | Popover ancorado (como o desktop); o popover "Métricas" passa a ser popover a partir de 768 (hoje só a partir de 1024) |
| Altura baixa | Folha ocupa até 100dvh com cabeçalho e rodapé fixos dentro dela (MT2a) |
| Campos (toque) | `input`, `select` e `textarea` com 16 px (MT5) |

### 5.12 Rotação
Ao girar, a página mantém visível a **seção que estava no topo** (o Safari não tem ancoragem de rolagem nativa). Folhas e diálogos abertos continuam abertos e se reposicionam.

### 5.13 Navegador sem suporte (nível 3)
Se o navegador não tiver os recursos do piso (detecção por `@supports` de `color-mix()`), a página mostra só um aviso legível sem depender do Tailwind: "Este navegador não é compatível com o Métricas DSPD. Atualize o iOS para a versão 16.4 ou mais nova, ou use o Chrome atualizado." Nada de tela sem estilo.

### 5.14 O que fica só no desktop
**Nenhum recurso** fica só no desktop: tudo o que existe no desktop existe no celular e no tablet (inclusive Preferências, exportação, Dados e coletas e Ajuda), porque esconder recursos quebra links compartilhados e cria "por que no meu celular não tem?". O que fica deliberadamente no desktop e na faixa ampla é a **densidade**: navegação completa em linha, pares de cartões lado a lado com gráfico, diálogo de exportação em duas colunas e a projeção em sala (o ritual continua desenhado para 1280+).

## 6. Necessidades de dados
Nenhuma nova. Nada de pessoa entra no celular. A barra de contexto usa o mesmo resumo de seção da P3 (sem cálculo novo) e o recorte vem dos filtros da URL.

## 7. Desempenho em rede móvel (proposta para o arquiteto; não é decisão do UX)
O ADR 0003 mede só desktop. Proposta de itens novos, para o arquiteto avaliar e registrar:
| # | Item | Proposta | Bloqueia? |
|---|---|---|---|
| F1m | LCP em `/` e `/operacional`, perfil móvel do Lighthouse (4G lenta: ~1,6 Mbps, 150 ms de latência; CPU 4× mais lenta), carga fria | < 2,5 s | a definir pelo arquiteto |
| F10m | Lighthouse móvel | Desempenho ≥ 80, Acessibilidade ≥ 95 | alerta |
| F12 | Bytes transferidos na primeira visita a `/operacional` (JS + CSS + dados da primeira tela, gzip) | < 500 KB | alerta |
| F13 | Cartões fora da primeira tela no celular | Consultar e montar o gráfico só ao se aproximarem da área visível (uma tela de margem), mantendo a altura reservada (sem CLS) | alerta |
| F14 | Geração do PDF de 12 métricas em Android de entrada (CPU 4×) | < 8 s, sem travar a rolagem | alerta |
Observação: a spec da Sustentação (7.1) dispensou a carga por proximidade **no desktop**; no celular ela reduz os dados baixados de uma página de ~10 cartões em 4G. Cabe ao arquiteto decidir se vale para todas as faixas ou só para a compacta.

## 8. Critérios de aceite (EARS)
Identificadores próprios desta demanda (`MOB-CA-n`) para não colidir com os `CA-n` de outras specs.

**Alvos e campos**
- `MOB-CA-1` ENQUANTO o aparelho tem ponteiro de toque (`any-pointer: coarse`) O SISTEMA DEVE renderizar todo botão, link, aba, rádio, caixa de seleção com rótulo e gatilho de Dica com caixa de toque de pelo menos 44×44 px, em qualquer largura de 320 a 1366.
- `MOB-CA-2` ENQUANTO o aparelho não tem ponteiro de toque O SISTEMA DEVE manter os alvos com pelo menos 24×24 px e a aparência atual do desktop.
- `MOB-CA-3` ENQUANTO o aparelho tem ponteiro de toque O SISTEMA DEVE exibir `input`, `select` e `textarea` com fonte computada de pelo menos 16 px.
- `MOB-CA-4` ENQUANTO o aparelho tem ponteiro de toque O SISTEMA DEVE manter pelo menos 8 px entre alvos vizinhos no cabeçalho do cartão, e "Ocultar" DEVE ser o último controle da linha.

**Fixação e altura**
- `MOB-CA-5` ENQUANTO a altura da janela é menor que 600 px O SISTEMA DEVE manter cabeçalho, barra de filtros, barra de contexto e índice com `position` diferente de `sticky` e `fixed`.
- `MOB-CA-6` ENQUANTO a largura é menor que 768 px e a altura é de pelo menos 600 px, QUANDO a pessoa rola um painel com filtros O SISTEMA DEVE manter visível no topo a barra de contexto com "Filtros (n)", com altura total de no máximo 52 px.
- `MOB-CA-7` ONDE o painel ou a visão tem índice de seções (U3; no mínimo Semanal e Sustentação, spec 5.7), ENQUANTO a largura é menor que 768 px, O SISTEMA DEVE mostrar "Seção: <nome da seção atual>" na barra de contexto e, QUANDO tocado, listar as seções com o resumo da P3; escolher uma seção DEVE levar a rolagem até o título dela e mover o foco para ele sem que fique coberto pela barra.
- `MOB-CA-8` QUANDO a pessoa abre um painel a 375×667 O SISTEMA DEVE exibir o título do primeiro item de "Pede atenção" (ou o texto "Nada pede atenção…") inteiramente dentro da primeira tela, sem rolar.

**Shell e navegação**
- `MOB-CA-9` ENQUANTO a largura é menor que 1024 px O SISTEMA DEVE exibir o cabeçalho em uma única linha de no máximo 56 px, sem o seletor de tema, e o tema DEVE estar disponível na gaveta do Menu.
- `MOB-CA-10` ENQUANTO a largura é de 1024 px ou mais O SISTEMA DEVE exibir todos os destinos do menu numa única linha, com cabeçalho de no máximo 64 px de altura.
- `MOB-CA-11` QUANDO a pessoa toca em "Menu" O SISTEMA DEVE abrir a gaveta com "Fechar" no topo e, QUANDO toca num destino, navegar e fechar a gaveta com o foco no `h1` da página.

**Seletor de Visão e grade**
- `MOB-CA-12` ENQUANTO a largura é menor que 400 px O SISTEMA DEVE exibir o seletor de Visão do Operacional em grade de 2×2 opções de pelo menos 44 px de altura, sem rolagem horizontal.
- `MOB-CA-13` ENQUANTO a largura está entre 768 e 1023 px O SISTEMA DEVE exibir O15 e O18 lado a lado na visão Semanal e exibir em largura total os cartões com gráfico de série (O3 e O4).
- `MOB-CA-14` O SISTEMA DEVE manter os blocos "Fluxo de projeto · BusinessMap" e "Sustentação · Acelerato" do Resumo empilhados, um abaixo do outro, em todas as larguras de 320 a 1920.

**Gráficos e tabelas**
- `MOB-CA-15` ENQUANTO o aparelho tem ponteiro de toque, QUANDO a pessoa toca num gráfico de barras, linhas ou áreas, O SISTEMA DEVE mostrar na faixa de leitura acima do gráfico o rótulo da coluna mais próxima e os valores de cada série com unidade.
- `MOB-CA-16` ENQUANTO o aparelho tem ponteiro de toque, QUANDO a pessoa toca a até 24 px de um ponto de dispersão, O SISTEMA DEVE mostrar na faixa de leitura o rótulo e o valor desse ponto.
- `MOB-CA-17` SE a estatística do ponto selecionado tem menos de 20 itens ENTÃO O SISTEMA DEVE mostrar na faixa de leitura "Poucos itens (n=<n>). Estatística não publicada." e nenhum valor.
- `MOB-CA-18` QUANDO a pessoa arrasta o dedo na vertical sobre um gráfico O SISTEMA DEVE rolar a página.
- `MOB-CA-19` ENQUANTO a largura é menor que 1024 px O SISTEMA DEVE manter a primeira coluna das tabelas largas e do mapa de calor visível durante a rolagem horizontal da tabela.
- `MOB-CA-20` ONDE uma tabela tem célula "amostra insuficiente" O SISTEMA DEVE exibir abaixo da tabela o texto "— amostra insuficiente: menos de 20 itens, a estatística não é publicada." e nenhum elemento com atributo `title` deve carregar essa explicação.

**Exportação, compartilhamento e diálogos**
- `MOB-CA-21` ENQUANTO a largura está entre 768 e 1023 px, QUANDO a pessoa abre a exportação, O SISTEMA DEVE exibir um diálogo centralizado com no máximo `100vw - 48px` de largura, e não uma folha inferior.
- `MOB-CA-22` ENQUANTO o aparelho tem ponteiro de toque e o navegador oferece `navigator.share`, QUANDO a pessoa toca em "Compartilhar", O SISTEMA DEVE abrir a folha nativa com a URL da visão atual sem o parâmetro `mock`; SE a pessoa cancela a folha ENTÃO O SISTEMA NÃO DEVE mostrar mensagem de erro.
- `MOB-CA-23` ENQUANTO a altura é menor que 600 px, QUANDO uma folha (Filtros, Métricas, Exportar) está aberta, O SISTEMA DEVE manter a ação primária visível no rodapé da folha sem rolar a folha.

**Geral**
- `MOB-CA-24` O SISTEMA DEVE abrir todas as rotas sem rolagem horizontal da página em todas as larguras da lista de viewports (seção 9), em retrato e paisagem.
- `MOB-CA-25` QUANDO a pessoa gira o aparelho O SISTEMA DEVE manter visível o título da seção que estava no topo antes da rotação.
- `MOB-CA-26` SE o navegador não oferece `color-mix()` ENTÃO O SISTEMA DEVE mostrar o aviso de navegador sem suporte com o texto da seção 5.13, legível e sem depender das folhas de estilo do app.
- `MOB-CA-27` O SISTEMA DEVE manter o zoom com pinça disponível (sem `maximum-scale` nem `user-scalable=no` no `meta viewport`).

## 9. Viewports e projetos para o QA

### 9.1 Lista de viewports (largura × altura em CSS px)
| Grupo | Viewports | Toque | Para quê |
|---|---|---|---|
| Celular retrato | **360×780**, **375×667**, **390×844**, 430×932 | sim | MOB-CA-1, 3, 6 a 8, 12, 15 a 18, 24 |
| Celular paisagem | **667×375**, **844×390**, 932×430 | sim | MOB-CA-5, 23, 24 |
| Tablet retrato | 744×1133, **768×1024**, **820×1180**, **834×1194** | sim | MOB-CA-1, 13, 19, 21 |
| Tablet paisagem | **1024×768**, **1180×820**, 1194×834, **1366×1024** | sim | MOB-CA-1, 10, 24 |
| Desktop | **1280×800**, 1366×768, 1920×1080 | não | MOB-CA-2, regressão |
| Reflow e zoom | **320×568** (equivale a 1280 com 400% de zoom) | sim e não | MOB-CA-24 |
Em negrito, o mínimo por PR com interface; os demais na rodada noturna.

### 9.2 Projetos do Playwright sugeridos
- `celular-chromium`: Chromium com `isMobile: true`, `hasTouch: true`, 360×780 e 390×844 (Chrome Android).
- `celular-webkit`: WebKit com o perfil de iPhone (375×667 e 390×844), `hasTouch: true`.
- `tablet-webkit`: WebKit com perfil de iPad, 820×1180 e 1180×820.
- `tablet-chromium`: Chromium, 800×1280 e 1280×800, `hasTouch: true`.
- Paisagem: os mesmos projetos com largura e altura trocadas.
- Teto de recursos da estação (8 GB): rodar os projetos móveis por tag `@movel` no CI e na rodada noturna; localmente, um projeto por vez.
- **Limite da emulação:** o WebKit do Playwright não é o Safari do iPhone (sem barra dinâmica, sem zoom automático em campos, sem folha de compartilhar). Por isso o nível 1 inclui um **roteiro curto em aparelho real** a cada release que muda interface (~15 min: abrir Visão geral, Operacional Resumo e Semanal, filtrar, trocar seção, tocar num gráfico, exportar, compartilhar, girar). Ver D1.

### 9.3 Testes que mudam
- `A11Y-13` passa a medir alvos por **tipo de ponteiro** (toque = 44 em todas as larguras), não só 375 e 1280, e a cobrir o cabeçalho do cartão.
- `RESP-01` ganha as alturas e a paisagem da 9.1.
- `A7` (sticky sem sobreposição) ganha 768×1024 e 820×1180 e um caso de altura < 600 (nada fixo).

## 10. Fatiamento sugerido (para o tech lead)
1. **Fundamentos** (MT1, MT2, MT5, MT6, MOB-CA-1 a 5, 20, 23, 26, 27): eixo de ponteiro e de altura no CSS, campos de 16 px, nota de amostra insuficiente, aviso de navegador, projetos móveis no Playwright. Pequena, sem mudança visual no desktop.
2. **Celular** (MT3, MT4, P1 no celular; MOB-CA-6 a 12, 22): barra de contexto, cabeçalho de uma linha, seletor de Visão 2×2, compartilhar. Depende do índice da U3 e do seletor de Visão da Sustentação.
3. **Tablet e gráficos** (MT7, MT8, MT9; MOB-CA-13 a 19, 21, 25): pares compactos em 768, faixa de leitura dos gráficos, primeira coluna fixa, exportação centralizada, rotação. Opcional: ícone na tela de início sem tela cheia.
