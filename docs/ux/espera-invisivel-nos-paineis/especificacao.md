# Espera invisível dentro dos painéis (e fim da página própria)

Discovery curto, sem protótipo: a mudança move cartões que já existem. Base lida: origem `main` (demo), `docs/ux/revisao-geral-usabilidade/02-propostas.md` (P1, P3). Itens marcados como hipótese esperam confirmação do usuário.

## Objetivo
Quem está no Operacional, Tático, Estratégico ou Sustentação vê a espera invisível do próprio nível no mesmo painel, sem trocar de página, e só vai a um lugar para achar cada coisa. Resultado: a rota `/espera-invisivel` deixa de existir e nada que apontava para ela quebra.

## Situação encontrada (importante)
Os quatro cartões já estão nos painéis em variante `compacto` (Operacional: semanal, seção "Tempo"; Tático e Estratégico: seção `espera-invisivel`; Sustentação: seção `espera`). Os ids de cartão `ei-fl1`, `ei-fl2`, `ei-fl3`, `ei-sust` já existem em `CATALOGO_CARTOES` e já são ocultáveis por painel. O que falta é só: (a) a evolução mensal, que hoje só aparece na página própria (link "Ver evolução"); (b) remover a página, o menu e os resíduos (catálogo, exportação, Visão geral, filtros, coleta).

## Personas / contexto de uso
Mesmas do painel de destino: times (Operacional, semanal), líderes de frente (Tático), gerente (Estratégico), sustentação. 375px (consulta) e 1280px (ritual projetado).

## Posição e título por painel
Seção única e igual nos quatro painéis, sempre a última antes de "Mais métricas" (padrão que Tático, Estratégico e Sustentação já seguem; faz o índice da P3 ter o mesmo item em todos).

| Painel | Visão | Seção (id) | Posição | Cartão (âncora) |
|---|---|---|---|---|
| Operacional | só semanal | `espera-invisivel` | depois de "Qualidade"; sai de "Tempo" | `ei-fl1` |
| Tático | único | `espera-invisivel` | depois de "Os projetos estão avançando..." | `ei-fl2` |
| Estratégico | único | `espera-invisivel` | depois de "As entregas refletem..." | `ei-fl3` |
| Sustentação | único | `espera` (mantém) | antes de "Percepção de valor" (como hoje) | `ei-sust` |

- Título da seção, nos quatro: **"Quanto do tempo do solicitante fica fora da nossa gestão?"** (pergunta, como as demais seções; troca o "Espera invisível do nível", que é jargão). O título do cartão continua "Espera invisível".
- Operacional diária: não entra (a daily trata de item parado hoje; EI é estatística de período). Quem abrir `#ei-fl1` com `cadencia=diaria` é levado à semanal (ver redirecionamento). O link "Ver também a visão semanal" fica como está.
- "Ir para" do Operacional (semanal) ganha o item "Espera invisível" no fim; segue a regra existente (some se o cartão está oculto). Na P3, a seção entra no índice com o mesmo resumo de uma linha dos demais (o resumo é o `leitura` do cartão; sem cálculo novo).
- Nenhum cartão novo, nenhuma métrica nova, nenhuma comparação entre níveis: cada painel mostra só o seu nível; Sustentação (Acelerato) nunca divide tela de cálculo com o fluxo.

## Cartão no painel (o que muda)
- Mantém a variante compacta (três números, par cliente × time, abas por tipo/prioridade, leitura, nota, base, filtros aplicáveis).
- O link "Ver evolução" (navegava) vira botão "Ver evolução mensal" (`aria-expanded`, `aria-controls`) que abre no próprio cartão o gráfico de séries hoje exclusivo da página, com a tabela alternativa (`ComTabelaPropria`) e as marcas de mudança de critério. Estado local (não vai na URL); fechado por padrão. Ao fechar, o foco volta ao botão. Texto do botão aberto: "Esconder evolução mensal".
- Com amostra insuficiente (menos de 20 itens), o botão não aparece (não há série publicável) e vale o texto neutro atual de `AmostraInsuficiente`.
- Segmento escolhido (`ei_fl1` etc.) continua na URL e vale para o gráfico aberto.

## Destino da página `/espera-invisivel` e do menu
- Recomendação adotada: **remover a página, o item "Espera invisível" do menu (`rotas.ts`), a rota e o painel `espera-invisivel` de `PAINEIS`**; a rota fica só como redirecionador (sem tela, sem entrada no menu).
- Redirecionamento (substitui a rota, mantém links, favoritos e marcadores antigos), decidido por hash, preservando a busca:

| Entrada | Destino |
|---|---|
| `#ei-fl1` | `/operacional?cadencia=semanal#ei-fl1` |
| `#ei-fl2` | `/tatico#ei-fl2` |
| `#ei-fl3` | `/estrategico#ei-fl3` |
| `#ei-sust` | `/sustentacao#ei-sust` |
| sem hash ou hash desconhecido | `/` (Visão geral, que tem a linha de espera por nível) |

- Parâmetros: equipe, tipo, sistema, periodo, de, ate e `ei_fl1/2/3` passam intactos aos destinos do fluxo (o painel destino aplica sua normalização habitual: Estratégico ignora equipe e tipo e aceita só 6m e 12m; é o comportamento já existente para link de fora, sem aviso novo). Para `#ei-sust`, os parâmetros `sust_*` perdem o prefixo (`sust_prioridade` vira `prioridade`, etc.), `ei_sust` passa intacto, e os do fluxo são descartados (BusinessMap e Acelerato não se misturam).
- Redirecionamento por substituição (`replace`), para o botão Voltar não cair em loop. Manter indefinidamente (custo desprezível).
- Resíduos a limpar: `coleta/fontes.ts` (rota `/espera-invisivel`), `PAINEIS['espera-invisivel']` e o prefixo `sust_` (só existia por esta página), `PainelPagina` (`painel !== 'espera-invisivel'`), `PainelDaMetrica` e `ROTULO` do catálogo, `rotulo` "Espera invisível" de `NIVEIS` na exportação, link `Ver evolução` do cartão (`/espera-invisivel#...`), item de Ajuda/glossário se linkar a página.

## Visão geral
`EI_NIVEIS[*].rota` passa a apontar para o painel: `/operacional?cadencia=semanal#ei-fl1`, `/tatico#ei-fl2`, `/estrategico#ei-fl3`, `/sustentacao#ei-sust`, com a mesma regra de filtros que os links "Abrir <painel>" já usam (memória da sessão no fluxo; Sustentação sem filtros do fluxo). Os rótulos dos links ("Ver todos os tipos", "Detalhar", "Ver todas as prioridades") ficam. Se o cartão de destino está oculto, vale a chegada da P1 (marcador no lugar, com "Mostrar"); nenhum caso novo.

## Catálogo `/metricas`
Hoje uma linha só ("Espera invisível", painel "Espera invisível"; EI_FL2/3/SUST em `FORA`). Passa a **quatro linhas**, uma por nível, com painel real e destino no cartão: "Espera invisível · Operacional" (Operacional, BusinessMap), "· Tático", "· Estratégico", "· Sustentação" (Acelerato, horas úteis). Nome igual ao `rotulo` de `CATALOGO_CARTOES` (um nome só no app inteiro). Destinos: os da seção acima. Remover `'espera-invisivel'` de `PainelDaMetrica`; ajustar o texto/contagem do catálogo (hoje "45 métricas mais a PV1": a EI deixa de ser uma linha única; manter a contagem do briefing no texto e deixar o total de linhas na tabela; checar com QA os testes de contagem). Filtro "Painel" da tabela perde a opção "Espera invisível".

## Preferências (contrato do 007 intacto)
- O cartão já pertence ao painel: ids `ei-fl1`, `ei-fl2`, `ei-fl3`, `ei-sust` estão no catálogo de cartões, no formato `{ <painel>: [ids ocultos] }`. **Os ids não mudam, logo ids e ocultos já salvos continuam valendo sem migração.**
- A única mudança é de metadado: `ei-fl1` passa da seção `tempo` para a seção `espera-invisivel`/título novo; `secao` e `secaoTitulo` dos quatro passam a "Quanto do tempo do solicitante fica fora da nossa gestão?". A página Preferências, o popover "Métricas" e a contagem por seção (P1) leem isso, então a lista agrupa certo sozinha. Não é identificador gravado.
- Defesa: chave `espera-invisivel` solta em preferências guardadas (nunca foi gravada, pois a página não tinha ocultar) é ignorada em silêncio, como já ocorre com id desconhecido.
- Oculto aqui continua oculto na exportação (regra do 007 para núcleo).

## Exportação
- Sai a opção "Espera invisível" do "Vários painéis" e do botão (`NIVEIS`, `ESCOPO_DO_NIVEL`, ramo especial de `itensDoNivel`, `filtrosDoItem` com `sust_`, `BotaoExportar`).
- As quatro métricas passam a sair pela exportação do próprio painel: `ei-fl1` etc. são grupo núcleo, então entram em `itensDoNivel` sem código novo, respeitando ocultos, com os filtros do painel (Sustentação: filtros próprios). Notas e rótulos de `exportar/notas.ts` não mudam. Arquivo de uma só métrica continua levando o id (`EI_FL1`); o escopo `espera-invisivel` no nome some.
- Exportar com o cartão aberto ou fechado dá o mesmo arquivo.

## Estados
- Carregando: esqueleto do cartão compacto (altura reservada 300px, já existente); a seção não pula. Gráfico aberto: esqueleto de 320px até chegar o dado.
- Vazio/insuficiente (<20): texto neutro atual; sem botão de evolução.
- Erro: erro por cartão com "Tentar de novo" (atual); não derruba a seção.
- Oculto por preferência: marcador da P1 no lugar da seção/cartão; a seção some do índice (P3) e do "Ir para".
- Sem permissão: não se aplica (painéis abertos).

## Acessibilidade
- Seção com `h2` (título em pergunta) e cartão com `h3`; âncoras `#ei-*` recebem foco ao chegar por link (como os demais cartões) com foco visível.
- Botão de evolução: alvo ≥ 44px em 375, nome acessível inclui o nível ("Ver evolução mensal, Operacional"), `aria-expanded`/`aria-controls`.
- Gráfico com tabela alternativa e marcas de critério não dependentes só de cor (o `SerieLinhas` atual); `prefers-reduced-motion` respeitado na abertura (sem animação).
- Redirecionador: sem tela intermediária; foco inicial e título do documento são os do painel de destino.
- Leitura de tela: o `leitura` do cartão segue como resumo textual.

## Layout
- 1280: cartão em largura total da grade (12 colunas), como hoje; gráfico aberto com altura da série atual, sem rolagem horizontal.
- 375: três números em grade de 3 sem estourar (já funciona no compacto); abas por tipo/prioridade quebram em linhas; gráfico aberto com rolagem horizontal só dentro do bloco do gráfico, nunca na página. O botão fica sob o par cliente × time.

## Necessidades de dados
Nenhuma nova: os mesmos `EI_FL1`, `EI_FL2`, `EI_FL3`, `EI_SUST` (série mensal por segmento já vem no resultado; hoje só não é desenhada na variante compacta). Sem mudança de contrato nem de cálculo.

## Microcopy
- Título da seção: "Quanto do tempo do solicitante fica fora da nossa gestão?"
- Botão: "Ver evolução mensal" / "Esconder evolução mensal".
- Nota da Sustentação (mantida): "Fonte diferente (Acelerato), em horas úteis. Não comparável com os níveis do BusinessMap (FL1 a FL3)."
- Item do "Ir para": "Espera invisível".

## Critérios de aceite (verificáveis por E2E)
1. Menu: não existe link "Espera invisível" em AppShell/navegação em 375 e 1280.
2. `GET /espera-invisivel#ei-fl1?...`: dado `/espera-invisivel?periodo=4s&equipe=X#ei-fl1`, termina em `/operacional` com `cadencia=semanal`, `periodo=4s`, `equipe=X`, hash `#ei-fl1`, e o cartão `metrica-EI-FL1` visível e focado. Análogo para `#ei-fl2` (Tático), `#ei-fl3` (Estratégico, sem `equipe`/`tipo`), `#ei-sust` (Sustentação, com `sust_prioridade=P1` virando `prioridade=P1`, sem nenhum parâmetro do fluxo). Sem hash: termina em `/`. Voltar do navegador não retorna a `/espera-invisivel`.
3. Operacional: na visão semanal há seção `#espera-invisivel` depois de "Qualidade" com `metrica-EI-FL1`; "Tempo" não contém EI-FL1; item "Espera invisível" no "Ir para"; na visão diária não há EI-FL1.
4. Tático, Estratégico, Sustentação: seção com o título-pergunta, com `metrica-EI-FL2`, `metrica-EI-FL3`, `metrica-EI-SUST`, respectivamente, e nenhum outro nível de EI no mesmo painel.
5. "Ver evolução mensal" abre o gráfico e a tabela alternativa no próprio cartão sem mudar de URL; `aria-expanded` alterna; Esc/segundo clique fecha e devolve foco ao botão; com <20 itens não há botão.
6. Trocar a aba de tipo/prioridade atualiza `ei_*` na URL e o gráfico aberto acompanha.
7. Visão geral: os links de espera apontam para os quatro destinos acima, e cada um chega ao cartão correspondente.
8. Catálogo: quatro linhas de espera, cada uma com painel e destino corretos, e nenhuma com painel "Espera invisível"; a opção some do filtro "Painel".
9. Preferências: ocultar `ei-fl2` no Tático grava `{tatico:['ei-fl2']}` (mesmo formato do 007); estado salvo antes da mudança continua ocultando; o marcador da P1 aparece no lugar; a seção some do índice P3.
10. Exportação: o botão do painel lista a métrica de EI do próprio nível (e não lista se oculta); "Vários painéis" não tem "Espera invisível"; exportar do Sustentação usa os filtros dele; nenhum arquivo mistura BusinessMap e Acelerato numa mesma seção.
11. Sem rolagem horizontal da página em 375 e 1280 nos quatro painéis, com o gráfico aberto.
12. `/espera-invisivel` não carrega nenhum chunk de página (rota só redireciona); testes antigos da página (`espera-invisivel.test.tsx`, ramos de `app.test`, `exportar`, `catalogo`, `preferencias` L454) migrados para os painéis.

## Decisões que só o usuário toma
- Nenhuma bloqueante. Premissas a confirmar (hipóteses): (a) EI fica fora da visão diária do Operacional; (b) link sem hash cai na Visão geral; (c) a evolução mensal fica atrás de um botão (não aberta por padrão), coerente com a recomendação U3(c) de não alongar o painel semanal.

## Registro da implementação (feature/espera-invisivel-nos-paineis)
- Feito: cartão com evolução mensal por botão, seção `espera-invisivel` nos quatro painéis, rota antiga só redireciona (por hash, com `replace`), menu, Visão geral, catálogo (4 linhas), filtros, exportação, preferências e testes E2E (axe, 375 e 1280).
- Ajuste pedido depois: o mecanismo de prefixo `sust_` (`lerFluxo`, `lerSustentacao`, `escreverFluxo`, `escreverSustentacao`, `useFiltros(..., { prefixo })`) foi restaurado, porque a demanda `sustentacao-no-operacional` põe os dois conjuntos de filtros na mesma URL. Nesta demanda o painel `/sustentacao` continua sem prefixo, e o redirecionador da rota antiga tira o `sust_` ao levar para `/sustentacao` (critério 2); a demanda seguinte passa `sust_*` intactos para `/operacional?cadencia=sustentacao`.
- E2E: o alvo do botão de evolução exige 44px só em 375 (no desktop vale o piso de 24px do sistema); o teste do menu em 375 abre o menu antes; o foco de Esc parte do gráfico (o Tático não tem abas).
- Critérios atendidos: 1 a 12. Verificação: `pnpm run pronto` verde (cobertura 100%) e `espera-invisivel-nos-paineis.spec.ts` (23), mais `a11y`, `filtros`, `exportar`, `responsivo` e `b3-sust-ei-vg` verdes.
