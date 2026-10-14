# Compatibilidade com celular, iPad e tablet · 04 Decisões

Base: `01-diagnostico.md`, `02-propostas.md` e o protótipo `03-prototipo/index.html`.

## Decisão para o usuário (uma)

### D1. Qual é o compromisso de suporte, e como ele é verificado?
Esta é de produto e de custo: define o que conta como bug e quanto tempo de QA cada release com interface gasta. O desenho de interface (`02-propostas.md`) é o mesmo nas três opções. O que muda é o que é **testado e garantido**.

| Opção | O que é garantido (nível 1) | Como se verifica | Custo |
|---|---|---|---|
| A | Celular (iPhone e Android), iPad **e** tablet Android, retrato e paisagem | E2E com emulação + roteiro em **aparelho real dos quatro tipos** a cada release que muda interface (aparelhos próprios ou serviço de aparelhos na nuvem, pago) | Alto: ~1 h de QA por release e, sem tablet Android no time, serviço pago |
| **B (recomendada)** | **Celular (iPhone e Android) e iPad**, retrato e paisagem; tablet Android fica no nível 2 (funciona, sem teste dedicado) | E2E com emulação dos quatro tipos (o tablet Android usa o mesmo Chrome do celular Android, então a emulação cobre bem) + roteiro de ~15 min em **iPhone e iPad reais** a cada release que muda interface | Médio: 15 min por release, com aparelhos que o time ou você já têm |
| C | Só celular; iPad e tablets no nível 2 | E2E com emulação + roteiro em iPhone real | Baixo, mas o iPad em reunião (persona do gerente) fica sem garantia |

**Recomendação: B.** Cobre as duas personas que mais usam fora da mesa (gerente no celular e no iPad), e o tablet Android, que é minoria (hipótese H2), já está coberto pela emulação do mesmo motor. O Safari só se verifica de verdade em aparelho Apple: o WebKit do Playwright não reproduz a barra do Safari, o zoom em campos nem a folha de compartilhar.

**Em todas as opções:** versões mínimas como na matriz (iOS/iPadOS 18 testado, 16.4 como piso técnico; Chrome atual e anterior, 111 como piso; Android 10+), sem app nativo, sem offline e sem tela cheia.

## Perguntas de contexto (informação, não decisão)
Confirmam hipóteses; se a resposta não vier, seguimos com a hipótese marcada.
- **Q1. Parque de aparelhos.** Os iPhones e iPads corporativos estão em iOS/iPadOS 18 ou mais novo? Há aparelhos geridos (MDM) presos numa versão antiga? Se houver algum abaixo do 16.4, ele vê o aviso de navegador sem suporte.
- **Q2. Onde o celular abre o sistema.** Hoje o celular acessa só na rede da empresa (Wi-Fi ou VPN) ou também pela internet (4G)? O desenho não muda; muda o peso que o arquiteto dá ao orçamento de rede móvel (02, seção 7). Abrir o acesso pela internet **não faz parte desta demanda**; se for desejado, vira um pedido próprio com o arquiteto.

## Decisões do time (registradas; não precisam do usuário)
Decisões de UX e técnicas tomadas neste estudo. Reversíveis na revisão de UX da implementação.

| # | Decisão | Por quê |
|---|---|---|
| T1 | Três eixos: largura decide layout; `any-pointer: coarse` decide alvos, campos e gestos; altura < 600 decide que nada fica fixo | Largura não diz se há dedo nem quanta altura sobra (MT1, MT2) |
| T2 | Alvo de 44 px em todo aparelho de toque, em qualquer largura; 24 px mínimo sem toque | iPad e celular deitado hoje recebem alvos de desktop |
| T3 | Campos de formulário com 16 px no toque | Evita o zoom automático do Safari (MT5) sem bloquear o zoom com pinça |
| T4 | Breakpoints de largura mantidos (640, 768, 1024, 1280) | Coerência com o design system e com os E2E existentes |
| T5 | Celular: barra de contexto fixa de 52 px com "Filtros (n)" e "Seção", como a P3 e a spec da Sustentação previram; não fixa com altura < 600 | Recorte e navegação por seção sempre à vista (MT3, MT4) |
| T6 | Tema sai do cabeçalho abaixo de 1024 e vai para a gaveta do Menu; cabeçalho de uma linha de 56 px | G1 e P2 da revisão geral; mais área útil |
| T7 | Seletor de Visão em grade 2×2 abaixo de 400 px | Quebra previsível em vez de quebra aleatória |
| T8 | Tablet em pé: pares compactos lado a lado a partir de 768; gráficos de série em largura total | Menos altura sem espremer gráfico (3.6 do diagnóstico) |
| T9 | Gráfico no toque: faixa de leitura acima do gráfico, coluna mais próxima; dispersão com raio de 24 px; arrastar na vertical rola a página | Equivalente ao hover sem o dedo cobrir o valor (MT7) |
| T10 | Primeira coluna fixa nas tabelas largas abaixo de 1024; catálogo vira lista de cartões abaixo de 640 | Rótulo da linha nunca some (3.6, 3.12) |
| T11 | "amostra insuficiente" explicada em nota escrita abaixo da tabela; fim do `title` | Hover sem equivalente (MT6, WCAG 1.4.13) |
| T12 | Exportação e popover "Métricas" viram diálogo/popover a partir de 768 (folha só abaixo) | Folha de 820 px no iPad é desajeitada (MT9) |
| T13 | "Compartilhar" com a folha nativa no toque quando o navegador oferece; "Copiar link" continua como alternativa | Gesto natural do celular; o link não leva dados de pessoa |
| T14 | Aviso de navegador sem suporte abaixo do piso (Safari 16.4, Chrome 111) | Melhor que uma página sem estilo |
| T15 | Nenhum recurso some no celular; o que fica no desktop e na faixa ampla é só a densidade | Links compartilhados abrem a mesma coisa em qualquer aparelho |
| T16 | Sem tela cheia (PWA standalone). Atalho na tela de início sem tela cheia é opcional (fatia 3) | No iPhone, tela cheia tira o Voltar e a barra de endereço, base da navegação por URL |
| T17 | Ao girar o aparelho, manter visível a seção que estava no topo | O Safari não ancora a rolagem sozinho |

## Encaminhado ao arquiteto (decisão técnica dele, não do UX nem do usuário)
- Itens de orçamento para celular e rede móvel no ADR 0003 (F1m, F10m, F12, F13, F14 em `02-propostas.md`, seção 7), inclusive se a carga de cartões por proximidade vale para todas as larguras ou só para o celular.
- Confirmação das versões mínimas na data da implementação (piso do Tailwind 4; Android mínimo do Chrome atual).
- Projetos móveis do Playwright e o teto de recursos da estação (rodar por tag no CI e na rodada noturna).

## Respostas (2026-10-13)
O usuário delegou ao time ("UX, tome as decisões").
- **D1 = B:** celular e iPad garantidos, com roteiro de ~15 min em iPhone e iPad reais a cada release que muda a interface.
- **Q1:** sem a informação, vale o piso da matriz (iOS/iPadOS 18+ testado; Safari 16.4 e Chrome 111 como piso técnico, com aviso abaixo disso).
- **Q2:** projetar para a rede móvel (4G), o cenário mais restritivo; o arquiteto inclui o orçamento móvel na ADR 0003.
