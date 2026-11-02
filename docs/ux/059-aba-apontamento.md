# Aba Apontamento (pedido 059, E1.3)

Discovery de UX. A especificação do dono (texto, seções 3 a 9, sem nomes de pessoa) faz o papel de protótipo; não há protótipo HTML novo. Padrão visual lido: `CartaoMetrica`, `SeloFrescor`, `EstadoVazio`, `AmostraInsuficiente`, `MapaCalor` e `docs/ux/espera-invisivel-nos-paineis/especificacao.md`. Tudo o que é inferência está marcado como hipótese. Nenhum nome de pessoa neste documento (ADR 0020); os exemplos usam "Pessoa A", "Pessoa B".

## Decisões do dono que valem aqui
- Exceção à regra de métrica individual só para esta aba (a registrar no `CLAUDE.md` e no briefing por PR do dono).
- Quem vê: qualquer usuário do painel, inclusive fora do time. Consequência de UX: o nome da pessoa aparece para um público amplo; o desenho abaixo reduz a exposição onde a necessidade do dono não exige o nome (itens M-3 e M-4).
- Fonte única: BusinessMap (worklog). A aba não mistura Acelerato em nada.

## 1. Ajuste ao padrão do painel operacional

### 1.1 Estrutura da página
- Cabeçalho como o dos outros painéis: título "Apontamento", selo de frescor da fonte BusinessMap (`SeloFrescor`, ícone mais texto, "Atrasado: última coleta há N h"), período dos dados ("Dados de AAAA-MM-DD a AAAA-MM-DD"), e o índice "Ir para" com as seções.
- Os blocos viram seções com título em pergunta (`h2`), e cada gráfico num `CartaoMetrica` (`h3`, pergunta, frase de leitura gerada dos dados, nota "Como ler", "Ver como tabela", chips de fonte, granularidade e filtros). Nada de cartão fora desse componente.
- Ocultar por preferência (contrato do 007): cada cartão ganha id (`ap-kpis`, `ap-projeto` etc.) no catálogo de cartões; ids novos, sem migração de estado salvo.

| Bloco da especificação | Seção (título em pergunta, proposta) | Cartões |
|---|---|---|
| 1 KPIs | "Quanto foi apontado e com que qualidade?" | KPIs (horas, apontamentos, pessoas ativas no período, % de apontamentos completos) |
| 2 Distribuição | "Onde o esforço apontado está sendo gasto?" | por projeto (iniciativa), por tipo, por subgrupo |
| 3 Matriz e qualidade | "Os apontamentos dizem o que foi feito?" | qualidade geral, qualidade por pessoa, matriz pessoa × categoria |
| 3 Capacidade | "A capacidade apontada acompanha o período?" | capacidade mensal; capacidade por pessoa (ver M-4) |
| 4 Achados | "O que mais chama atenção neste período?" | achados gerados dos dados (ver M-1) |
| 5 Diário | "Como os apontamentos se distribuem dia a dia?" | mapa de calor pessoa × dia |

### 1.2 Filtros
Mesma barra e mesmo comportamento dos painéis: estado na URL, chips de filtros ativos, "Limpar filtros" e "Remover filtro X" (reaproveita `EstadoVazio`), `FiltroMulti` para seleção múltipla.
- Filtros: Pessoa, Mês, Tipo, Subtarefa, Subgrupo, Projeto, Qualidade (os sete da especificação). Rótulos em português com "Pessoa" no lugar de "Usuário" (o termo do BusinessMap é "user", mas a tela fala de quem apontou).
- Cada cartão declara os filtros que o afetam (`aplicaveis`); o rodapé mostra "não afetam" onde for o caso. Hoje só o mapa de calor ignora quase todos (apenas Pessoa): fica explícito no chip, não só na especificação.
- Período: a especificação usa "Ano-mês". Proposta: trocar por `FiltroPeriodo` do painel (padrão 12 semanas e meses fechados), com seleção de meses como atalho. Hipótese (ver P-3).
- Ordem dos filtros: período, pessoa, projeto, tipo, subgrupo, subtarefa, qualidade (do mais usado ao mais fino). Hipótese.
- Alvo de toque ≥ 44px em 375, rótulo visível em cada filtro, no mobile a barra recolhe num botão "Filtros (n)".

### 1.3 Estados (todos os cartões)
- Carregando: esqueleto com altura reservada, sem salto de layout.
- Vazio (zero itens nos filtros): `EstadoVazio` com "Nenhum apontamento encontrado" e botões de limpar/remover filtro.
- Mínimo de 20 itens (regra do projeto, abaixo de 20 não se publica estatística): ver M-2 e P-1. Onde a conta é soma de horas (KPI), mostra-se o valor com a base; percentual, mediana e utilização de um recorte de 1 a 19 apontamentos viram `AmostraInsuficiente`.
- Erro: erro por cartão com "Tentar de novo".
- Dados defasados: selo "Atrasado" no cabeçalho e aviso no cartão; a aba não esconde dado velho.
- Sem permissão: não se aplica (decisão C).

### 1.4 Acessibilidade (WCAG 2.2 AA)
- Mapa de calor: não depende só de cor (o valor em horas aparece na célula ou em dica focável, e a tabela alternativa por "Ver como tabela" entrega o mesmo dado); contraste mínimo 3:1 entre faixas e do texto da célula 4.5:1; navegação por teclado entre células (setas) e leitura "Pessoa A, 12/08, 6,5 horas".
- Mapa de 60 dias de largura em 375px: rolagem horizontal só dentro do bloco, cabeçalho de linha (pessoa) e coluna de total fixos; nunca rolagem na página.
- Gráficos de barras: tabela alternativa, rótulos diretos, sem legenda só por cor, padrão ou texto além da cor.
- Foco visível, ordem lógica, `prefers-reduced-motion` respeitado, alvos ≥ 24px (44px em 375).
- Flags de qualidade (Sem comentário, Genérico etc.) como texto e ícone, nunca só cor.

## 2. Melhorias e correções de interface à especificação

Cada item: o que muda, o motivo e o impacto (C = corrige problema da especificação, M = melhoria).

| Id | Tipo | Mudança | Motivo |
|---|---|---|---|
| M-1 | C | "Principais achados" saem de texto escrito à mão com números fixos e passam a ser frases geradas dos dados (padrão `leitura` do cartão). | A própria seção 9.7 aponta o problema: número fixo no código envelhece e contradiz o gráfico ao lado. Sem cálculo próprio: sai da biblioteca T2.5. |
| M-2 | C | Estatísticas com menos de 20 apontamentos no recorte (percentual de qualidade, utilização, mediana de horas) viram `AmostraInsuficiente`; soma de horas e contagem mostram o valor com a base ("n apontamentos"). | Regra do projeto (abaixo de 20 não se publica) que a especificação não trata; recortes por pessoa e subgrupo caem facilmente abaixo disso. Depende da pergunta P-1. |
| M-3 | M | Ordenação do mapa de calor e da matriz: padrão alfabético ou por equipe, com "Ordenar por total" como escolha explícita da pessoa. | A especificação ordena por total decrescente, o que cria ranking de quem mais aponta como leitura principal. Mesmo com a exceção, a ordem padrão neutra reduz o uso como comparação entre pessoas. Depende de P-2. |
| M-4 | M | Utilização (%) por pessoa vem com selo fixo "Comparação relativa; não é jornada total" e nunca em faixa verde/vermelha; sem meta nem semáforo. Mensal fica como indicador da equipe. | A seção 9.4 diz que a base cobre só parte da jornada, então o valor engana se lido como absoluto. Meta ou cor por pessoa é a meta individual que a regra proíbe e que a exceção não cobre. Depende de P-2. |
| M-5 | C | Apontamento anômalo (ex.: mais de 24h por pessoa no dia, como o caso de 115h) é destacado no mapa de calor e na tabela com marca "Possível erro de apontamento" e entra no recorte com opção "Ocultar anômalos"; limite configurável. | A seção 9.5 reconhece que o caso existe sem tratamento. Um valor desses esmaga a escala de cor do mapa (intensidade proporcional ao máximo) e distorce totais. |
| M-6 | C | Intensidade do mapa de calor por faixas fixas (ex.: 0, até 4h, 4 a 8h, 8h+) com legenda, em vez de proporcional ao maior valor. | O máximo muda a cada carga e a cor de uma mesma célula muda sem a pessoa ter apontado diferente; com uma anomalia, todo o resto fica claro. Faixas na legenda também resolvem a leitura sem cor. Hipótese: faixas a validar. |
| M-7 | C | Janela do mapa de calor (mês anterior até a data máxima) é substituída por seleção explícita de período, padrão 4 semanas, e o título diz o intervalo. A janela varia de 1 a 2 meses, então o mapa muda de largura de um dia para outro. | Janela implícita e variável confunde ("por que sumiram dias?"); alinha com o resto da aba e do painel. Sem alterar o dado. |
| M-8 | M | Dias úteis por calendário com feriados e dias sem apontamento (fim de semana, feriado) em cinza neutro, distinto de "dia útil sem apontamento" (célula vazia com borda). | Hoje fim de semana e falta de apontamento são indistinguíveis, e a ausência de feriado (9.3) infla a capacidade. Depende do calendário (E1.2). |
| M-9 | M | Nomes de pessoa: a visão por padrão agrupa por equipe e mostra pessoas só nas visões em que a necessidade do dono exige (mapa diário, capacidade por pessoa, matriz). Pessoa sem de-para resolvido aparece como "Pessoa não identificada" e não se mistura com outra de nome parecido. | Decisão C expõe nomes a qualquer usuário; reduzir o número de lugares com nome é mitigação de UX (a decisão técnica de controle é do security-engineer). A seção 9.6 já mostra que o nome varia entre exports; o id é a chave, não o texto. |
| M-10 | M | Matriz pessoa × categoria: seletor "Tipo, Subtarefa, Subgrupo" como grupo de botões (rádio) acessível, com o nível escolhido na URL; células como horas e %, com a soma da linha. | A especificação fala em "troca de nível" sem definir o controle. Mantém a regra "story, frente e projeto nunca no mesmo histograma": os três níveis nunca aparecem juntos. |
| M-11 | M | Qualidade: uma só leitura "x% completos" no KPI e o detalhe por flag em barras empilhadas com texto; o apontamento pode ter várias flags, então a soma passa de 100%: o gráfico diz isso na nota. | Flags não excludentes geram soma maior que 100% e leitura errada em barras empilhadas. |
| M-12 | M | Atalho "Ver apontamentos" abre a lista de apontamentos do recorte (sem o comentário em texto livre; só classe, subgrupo, horas, data, projeto). | Quem vê "Sem vínculo claro" precisa achar quais; o comentário não é exibido porque é texto livre (risco de dado sensível; a decisão sobre exibir é do security-engineer, E1.4). |
| M-13 | M | Cada cartão tem nota "Como ler" com a regra de cálculo em linguagem simples (subgrupo e qualidade por palavra-chave, capacidade = dias úteis × 8 h) e a data da última revisão do dicionário. | A especificação (9.2) admite que são heurísticas; esconder isso leva a ler o subgrupo como verdade. Mudança de critério registrada com data e marcada nos gráficos (T2.6). |
| M-14 | M | Tela de "Não classificado" com contagem em destaque e atalho para o filtro Subgrupo = Não classificado. | É o principal indicador de dicionário insuficiente; ver o problema é o primeiro passo para ajustar o dicionário. |
| M-15 | C | Filtro por quem apontou (user), nunca por Reporter; rótulo "Pessoa que apontou" no filtro e na nota. | Seção 9.8: o BusinessMap filtra por Reporter e o painel por user; sem o rótulo, o dono compara números que parecem iguais e não são. |
| M-16 | M | Exportação do recorte pelo botão padrão do painel, respeitando cartões ocultos, sem coluna de comentário e com a nota de que o arquivo traz nome de pessoa (aviso antes de exportar). | Um arquivo sai do controle de acesso da tela; o aviso nomeia o que será exportado. A decisão de permitir é do security-engineer. |

## 3. Perguntas ao dono (uma por vez, com recomendação)
- **P-1 (mínimo de 20, regra de negócio).** O mínimo de 20 vale para quê, em apontamento: abaixo de 20 apontamentos no recorte escondemos percentuais e utilização, mas mostramos soma de horas e contagem? Opções: (a) sim, só estatística (percentual, utilização, mediana) exige 20; (b) o recorte inteiro exige 20, inclusive soma; (c) o dono decide o mínimo para esta aba. Recomendação: (a), que mantém a regra do projeto sem esconder horas.
- **P-2 (ordem e leitura individual).** Dentro da exceção, o mapa e a matriz podem abrir em ordem alfabética (ou por equipe) com "Ordenar por total" à escolha, e a utilização por pessoa sem meta nem cor de semáforo? Opções: (a) sim, padrão neutro; (b) manter total decrescente como na especificação; (c) sem utilização por pessoa, só mensal. Recomendação: (a).
- **P-3 (período).** Trocar "Ano-mês" pelo período padrão do painel (12 semanas, com meses fechados e atalho de mês)? Recomendação: sim, para consistência; se o dono usa o fechamento mensal como rito, manter o atalho de mês em primeiro plano.
- **P-4 (anomalia).** Qual é o limite de horas de uma pessoa por dia a partir do qual o apontamento é marcado como possível erro, e a marca só avisa ou oculta do total? Recomendação: padrão 16 h por pessoa/dia, só marca; o dono ajusta.
- **P-5 (equipe).** O BusinessMap tem equipe como agrupamento da pessoa? Se existir, o padrão de agrupamento da M-9 é por ela; se não, a aba mostra a lista sem agrupar. Pergunta de dado, não de gosto.
- **P-6 (comentário).** O texto do comentário do apontamento pode aparecer na tela e na exportação? Recomendação: não (só a classificação), e a decisão final volta pelo security-engineer.
- **P-7 (tratamento de edições).** A especificação diz que a base é substituída a cada export e que registros editados ou removidos somem. Na carga incremental, apontamento editado ou apagado no BusinessMap deve continuar no histórico (regra do projeto) ou refletir a mudança? Regra de negócio: o dono decide; a recomendação do arquiteto está no documento da E1.2.

## 4. O que cabe até 2026-11-02
Hipótese de prazo: depende de segurança (E1.4), desenho técnico (E1.2) e validação do dono (E1.6) fecharem no dia 2026-11-01 e 2026-11-02.

| Fatia | Conteúdo | Cabe até 2026-11-02? |
|---|---|---|
| 0 | Discovery fechado: este documento, o desenho técnico, o modelo de ameaças, respostas P-1 a P-7 e validação do dono (E1.6). | Sim, é a meta realista do prazo. |
| 1 | Aba com filtros, selo de frescor, KPIs, distribuição por projeto, tipo e subgrupo, qualidade, com estados e acessibilidade. Sem iniciativa raiz (projeto = card pai ou título), com a nota dizendo isso. | Só se a coleta do worklog pela API (WS2) já estiver pronta e o controle de acesso aprovado. Não é o caso hoje (hipótese): não prometo. |
| 2 | Matriz pessoa × categoria, capacidade por pessoa e mensal, achados gerados. | Não. Depende de de-para por id e calendário. |
| 3 | Mapa de calor diário, hierarquia até a iniciativa, anomalias, exportação. | Não. |

Resumo honesto: até 2026-11-02 cabem o discovery fechado e a decisão do dono. A aba utilizável, mesmo na fatia 1, passa antes por coleta incremental, pelo controle de acesso e por QA e code review (nenhuma branch sai sem QA). Se o dono quiser algo visível no dia 2, a alternativa é uma exceção que só ele decide: mostrar a fatia 1 em ambiente de homologação com dados de exemplo sem nome de pessoa.

## 5. Critérios de aceite (rascunho para a especificação final, depois de P-1 a P-7)
- CA-1: QUANDO a aba abre ENTÃO O SISTEMA DEVE mostrar o selo de frescor da fonte BusinessMap com ícone e texto, e o período dos dados.
- CA-2: QUANDO o recorte tem zero apontamentos ENTÃO O SISTEMA DEVE mostrar o estado vazio com "Limpar filtros" e "Remover filtro X" para cada filtro ativo.
- CA-3: SE o recorte tem de 1 a 19 apontamentos ENTÃO O SISTEMA DEVE exibir "amostra insuficiente" no lugar de percentual de qualidade e utilização, mantendo soma de horas e contagem (sujeito a P-1).
- CA-4: QUANDO a pessoa escolhe um filtro ENTÃO O SISTEMA DEVE gravar o filtro na URL e atualizar os cartões que o aplicam, sem alterar o mapa de calor para filtros que ele não usa e indicando isso no chip do cartão.
- CA-5: QUANDO a matriz troca o nível entre tipo, subtarefa e subgrupo ENTÃO O SISTEMA DEVE mostrar um nível por vez, nunca dois no mesmo gráfico.
- CA-6: O SISTEMA DEVE oferecer tabela alternativa em todo gráfico, incluindo o mapa de calor, com o mesmo dado.
- CA-7: QUANDO um apontamento passa do limite diário configurado ENTÃO O SISTEMA DEVE marcá-lo como "Possível erro de apontamento" com texto e ícone.
- CA-8: QUANDO a página é aberta em 375px ENTÃO O SISTEMA DEVE manter a página sem rolagem horizontal, com rolagem só dentro do mapa de calor.
- CA-9: O SISTEMA DEVE mostrar a utilização por pessoa sem meta e sem faixa de cor de bom ou ruim.
- CA-10: SE a pessoa não tem de-para resolvido ENTÃO O SISTEMA DEVE mostrá-la como "Pessoa não identificada", sem juntá-la a outra.
- CA-11: O SISTEMA DEVE gerar os "achados" dos dados do recorte, sem número fixo em texto.

## 6. Validação (E1.6, roteiro curto)
O dono confere: (1) o ajuste de seções e cartões da seção 1; (2) cada melhoria da seção 2 com aceitar, ajustar ou descartar; (3) respostas P-1 a P-7; (4) a fatia da seção 4. Retorno do dono: pendente. Sem a validação a demanda não vai a "Pronto para fazer".
