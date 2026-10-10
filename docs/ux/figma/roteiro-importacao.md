# Roteiro de importação para o Figma (html.to.design)

Objetivo: levar as telas **entregues** e os protótipos do discovery para o Figma, organizados e nomeados.

## Preparação
1. Na raiz do repositório: `npm run dev`; abra http://localhost:5173 no Chrome.
2. Instale a extensão Chrome "html.to.design" (by .to.design) e entre com a conta. No Figma, abra o plugin "html.to.design" no arquivo de destino.
3. Dados são fictícios (mock); o selo "Dados fictícios" aparece em todas as capturas, o que é esperado.
4. Largura: redimensione a janela (DevTools, modo dispositivo) para **1280** e **375** antes de capturar. Na extensão, escolha "Capture full page" e a opção de viewport correspondente; marque "Dark mode" quando a linha pedir tema escuro (ou alterne o tema pelo botão do cabeçalho antes de capturar).
5. Aguarde o fim do esqueleto (cerca de 1 s) antes de capturar, exceto nos frames "carregando". Para "carregando", use `?mock=carregando` e capture na hora.
6. Para os protótipos HTML (grupo Discovery): abra o arquivo (`file://`) no Chrome com a largura certa e capture igual. Alternativa: plugin, aba "Import from file/URL".

## Organização do Figma
Páginas: `Design system`, `Visão geral`, `Operacional`, `Tático`, `Estratégico`, `Sustentação`, `Espera invisível`, `Ajuda`, `Estados`, `Discovery`. Nome do frame: `<Painel> / <variação> / <largura>` (ex.: `Operacional / diária / 1280`). Tema escuro: sufixo `/ escuro`.

## Frames a capturar
Cadências do Operacional: `cadencia=diaria` (padrão) e `semanal`. Abas locais: `o2`, `o3`, `o9`, `o10` (tipo de card), `t1`, `t4` (classe de serviço), `s3`, `s4` (`p1` a `p5`), `e1`. Os valores exatos vêm das opções do seletor na tela; clique na aba e copie a URL.

| # | Página Figma | Frame | Rota e parâmetros | Larg. |
|---|---|---|---|---|
| 1 | Visão geral | Visão geral / padrão | `/` | 1280, 375 |
| 2 | Visão geral | Visão geral / padrão / escuro | `/` com tema escuro | 1280, 375 |
| 3 | Operacional | Operacional / diária | `/operacional` | 1280, 375 |
| 4 | Operacional | Operacional / semanal | `/operacional?cadencia=semanal` | 1280, 375 |
| 5 | Operacional | Operacional / diária / escuro | `/operacional` escuro | 1280 |
| 6 | Operacional | Operacional / nota aberta | `/operacional`, abrir "Como ler e como é calculado" em O2 | 1280 |
| 7 | Operacional | Operacional / tabela | `/operacional`, "Ver como tabela" em O2 | 1280, 375 |
| 8 | Operacional | Operacional / filtros (mobile) | `/operacional`, abrir "Filtros (n)" | 375 |
| 9 | Tático | Tático / padrão | `/tatico` | 1280, 375 |
| 10 | Tático | Tático / escuro | `/tatico` escuro | 1280 |
| 11 | Estratégico | Estratégico / padrão | `/estrategico` | 1280, 375 |
| 12 | Estratégico | Estratégico / E1 projetos | `/estrategico?e1=<aba>` (uma por aba) | 1280 |
| 13 | Estratégico | Estratégico / escuro | `/estrategico` escuro | 1280 |
| 14 | Sustentação | Sustentação / padrão | `/sustentacao` | 1280, 375 |
| 15 | Sustentação | Sustentação / S4 P1 a P5 | `/sustentacao?s4=p1` (e `p2`..`p5`) | 1280 |
| 16 | Sustentação | Sustentação / escuro | `/sustentacao` escuro | 1280 |
| 17 | Espera invisível | Espera invisível / padrão | `/espera-invisivel` | 1280, 375 |
| 18 | Espera invisível | Espera invisível / escuro | `/espera-invisivel` escuro | 1280 |
| 19 | Ajuda | Ajuda / padrão | `/ajuda` | 1280, 375 |
| 20 | Ajuda | Ajuda / critérios | `/ajuda#criterios` | 1280 |
| 21 | Estados | Carregando / Operacional | `/operacional?mock=carregando` | 1280, 375 |
| 22 | Estados | Vazio / Operacional | `/operacional?mock=vazio` | 1280, 375 |
| 23 | Estados | Erro / Operacional | `/operacional?mock=erro` | 1280, 375 |
| 24 | Estados | Carregando, vazio e erro / Sustentação | `/sustentacao?mock=carregando`, `?mock=vazio`, `?mock=erro` | 1280 |
| 25 | Estados | Carregando, vazio e erro / Estratégico | `/estrategico?mock=...` | 1280 |
| 26 | Estados | Amostra insuficiente / padrão | `/operacional?periodo=4s&equipe=<uma equipe>&tipo=<um tipo raro>` até O2/O3 mostrar o aviso; ajuste filtros até aparecer | 1280, 375 |
| 27 | Estados | Amostra insuficiente / sustentação | `/sustentacao?prioridade=p1&equipe=fluig&periodo=4s` (ajuste até aparecer) | 1280 |
| 28 | Estados | Amostra insuficiente / lenta | `/estrategico` com `e1` em aba lenta e `periodo=6m`; T7 em `/tatico` | 1280 |
| 29 | Estados | Filtro inválido (aviso) | `/operacional?equipe=xyz` | 1280 |
| 30 | Estados | 404 | `/rota-inexistente` | 1280, 375 |
| 31 | Design system | Chrome do app (cabeçalho, navegação, selo) | recorte do topo de `/` | 1280, 375 |
| 32 | Design system | Folha do design system | `figma/prototipos/design-system-1280.html` e `-375.html` | 1280, 375 |
| 33 | Discovery | Integração real | `figma/prototipos/integracao-real-1280.html` e `-375.html` | 1280, 375 |
| 34 | Discovery | Tela /dados (BusinessMap e Acelerato) | `figma/prototipos/dados-1280.html` e `-375.html` | 1280, 375 |
| 35 | Discovery | Preferências de métricas: perfil | `figma/prototipos/preferencias-perfil-1280.html` e `-375.html` | 1280, 375 |
| 36 | Discovery | Preferências de métricas: painel com ocultas | `figma/prototipos/preferencias-painel-1280.html` e `-375.html` | 1280, 375 |

Dica para o item 26 a 28: não há URL fixa; combine filtros até o aviso aparecer e registre a URL usada no nome do frame. Se a base fictícia não gerar o caso, anote no frame "não reproduzível no mock" e use a folha do design system, que mostra as duas variantes.

## Depois da importação
1. Agrupe por página e padronize nomes.
2. Crie Variables de cor (modos Claro e Escuro) a partir de `docs/ux/design-system.md` seção 1 e vincule aos preenchimentos.
3. Converta os blocos da folha do design system em Components (Botao, CartaoMetrica, AmostraInsuficiente padrão e lenta, FaixaAtencao, chips, abas, tabela, selo).
4. Limitações conhecidas: gráficos SVG chegam como vetores sem interação; popovers, folhas e estados de foco exigem abrir antes de capturar; texto pode vir com fonte de fallback se Inter não estiver instalada no Figma.
5. Os frames são cópias; a fonte da verdade continua sendo o app e `docs/ux/`.
