Proposta de Métricas Ágeis — Operacional, Tático e Estratégico
Proposta para discussão entre pares · versão 1
# Métricas ágeis para decidir em três altitudes
Um conjunto de métricas extraídas do BusinessMap, organizado em nível operacional, tático e estratégico — para que as equipes melhorem o fluxo, a coordenação negocie prazos com base em dados e a diretoria acompanhe resultado, não esforço.
Fonte de dadosBusinessMap (Kanban)
ReferênciasMétricas Ágeis (R. D. Albino) · Flight Levels (K. Leopold)
NaturezaProposta aberta a ajustes
CoberturaBusinessMap e Acelerato
- Por que medir
- Estrutura de quadros
- Cliente × time
- Operacional
- Tático
- Estratégico
- Acelerato
- Origem dos dados
- Critérios
- Rituais
- O que não medir
- Resumo
- Visão geral
## Em resumo
- Proponho um conjunto de métricas organizado em três níveis, com donos e cadências distintas, em vez de um painel único que não serve bem a ninguém.
- Nenhuma delas depende de estimativa em pontos ou horas — todas saem do histórico de movimentação dos cards que já temos no BusinessMap.
- Parte é nativa da ferramenta; parte exige extração de dados, e essas estão marcadas ao longo do documento para que o custo fique explícito.
- Começamos por um núcleo pequeno: dez métricas operacionais, sete táticas, três estratégicas e o índice que compara as duas visões. O restante entra conforme a necessidade aparecer.
- A sustentação tem parte própria, com as métricas do Acelerato separadas das do BusinessMap, porque a população, o relógio e o vocabulário são outros.
- Toda métrica de tempo aparece em duas versões — a visão do cliente e a visão do time — nos três níveis, porque é a distância entre elas que localiza a espera.
- Junto vai um conjunto de critérios sugeridos — marcos temporais, tipos de demanda, campos e regras de cálculo — para que todos estejam medindo a mesma coisa.
- Proponho também um compromisso explícito: nenhuma dessas métricas será usada para avaliação de desempenho individual.
## Por que medir, e por que em três níveis
Hoje conseguimos responder o que está sendo feitoolhando o quadro. O que ainda respondemos por percepção é quanto tempo leva, quanto cabee se valeu a pena. São perguntas diferentes, feitas por pessoas diferentes, em ritmos diferentes — e é por isso que um painel único não resolve.
A proposta separa as métricas em três altitudes, na lógica de Flight Levels. No nível operacionalo interesse é o fluxo do dia a dia: o que está parado, o que está envelhecendo, o que está bloqueado. No nível táticoo interesse é a coordenação ponta a ponta: da solicitação da área de negócio até a entrega em produção, incluindo o tempo em fila e as dependências de terceiros. No nível estratégicoo interesse não é mais o fluxo, e sim a carteira: onde estamos gastando a capacidade das equipes, e o que isso produziu de resultado.
Três princípios guiam a seleção, seguindo a linha de Raphael Albino: medir o fluxo e não as pessoas; usar percentis em vez de média, porque a média esconde o caso ruim que o cliente lembra; e tratar prazo como probabilidade, não como promessa.
Sobre o tamanho do conjunto.O documento apresenta o inventário completo do que é possível medir, mas a proposta de adoção é deliberadamente pequena. Métrica que não entra em uma conversa concreta vira custo de coleta e ruído de painel — por isso o núcleo tem vinte e um indicadores, e o resto fica catalogado para quando fizer falta.
## A estrutura de quadros já é a estrutura dos níveis
Esta é a parte que torna a proposta implementável em vez de conceitual: os três níveis de voo não precisam ser criados, porque já existem nos nossos quadros. Um projeto aprovado pela comissão vira um card no quadro do gerente. Esse card tem filhos — features e pacotes — nos quadros dos coordenadores, organizados em sprints. Esses, por sua vez, têm filhos nos quadros dos times: user stories e tarefas.
Feature e pacote ocupam o mesmo nível da hierarquia e, para efeito de medição, são tratados da mesma forma: são as peças em que o projeto foi dividido e cuja conclusão faz o projeto avançar. Toda métrica descrita adiante para feature vale igualmente para pacote.
Cada nível de voo corresponde a um quadro real e a uma granularidade real de card — não é preciso criar estrutura nova, apenas medir a que já existe.
| Nível | Quadro | Card | Pergunta central
| FL3 · Estratégico | Gerente | Projeto | Estamos fazendo as apostas certas, e elas estão terminando?
| FL2 · Tático | Coordenadores | Feature ou pacote, organizados em sprints | O projeto está avançando de verdade, e no ritmo previsto?
| FL1 · Operacional | Times | User story, tarefa, demanda de sustentação | O trabalho está fluindo?
### Três consequências práticas
- A consolidação depende inteiramente do vínculo pai/filho.Feature ou pacote sem projeto pai, e user story sem pai, são invisíveis para o painel de cima — e representam capacidade consumida que não aparece em lugar nenhum. Vínculo incompleto não é um detalhe de higiene: é um buraco no indicador.
- O relógio estratégico começa na aprovação da comissão.O tempo do processo de TAP anterior a isso fica deliberadamente fora do escopo desta proposta. Se um dia quisermos medi-lo, é uma extensão natural — mas não é o que estamos propondo agora.
- Cada granularidade tem sua própria distribuição.User story, feature ou pacote, e projeto não entram no mesmo histograma. Misturá-los produz um número que não descreve nenhum dos três e destrói qualquer previsão.
Uma observação sobre o que convive com os projetos: os quadros dos times recebem também sustentação e demanda não planejada, que não pertencem a nenhum projeto. Isso é normal e não precisa ser corrigido — precisa ser distinguível, para que o consumo de capacidade fora de projeto apareça no painel em vez de virar a explicação informal de por que o projeto atrasou.
## Duas visões em cada nível: a do cliente e a do time
Toda métrica de tempo desta proposta existe em duas versões, e proponho que o painel sempre mostre as duas lado a lado. A visão do timemede o que está sob nossa gestão: começa quando assumimos o trabalho e termina quando entregamos. A visão do clientemede o que a outra ponta experimenta: começa quando ele pede e termina quando ele pode usar.
Os dois números são verdadeiros e medem coisas diferentes. Publicar só o do time para fora produz a sensação de que os indicadores não descrevem a realidade de quem espera; cobrar a equipe pelo número do cliente sem decompor produz injustiça e desconfiança no painel. O valor está justamente na distância entre eles — é ela que localiza a espera e diz de quem é a ação.
A barra cheia é o que o solicitante espera; a barra clara é o que está sob nossa gestão. A faixa entre as duas é a espera invisível — e ela existe nos três níveis, por motivos diferentes em cada um.
| Nível | Visão do cliente | Visão do time | O que a diferença revela
| FL1
Demanda  | Lead time do cliente, envelhecimento do backlog do cliente, acordos vencidos por pendência nossa  | Cycle time, lead time da equipe, aging WIP, vazão, WIP  | Fila de priorização e tempo de validação — trabalho parado que não aparece no quadro da equipe
| FL2
Frente  | Tempo entre a frente ser prometida e estar disponível para uso; avanço percebido pelo solicitante  | Fluxo de features e pacotes, aderência da sprint, carry-over, WIP de frentes  | Espera entre frentes: dependência de terceiros, homologação do negócio, janela de mudança
| FL3
Projeto  | Tempo entre a aprovação na comissão e o valor disponível; aderência à data comunicada; resultado obtido  | Lead time de execução, WIP de projetos, capacidade por objetivo, manter × evoluir  | Tempo de portfólio: projeto aprovado e não iniciado, fila de decisão, excesso de frentes abertas
### O número que resume a comparação
Para que a diferença não fique apenas visual, proponho um indicador único por nível, calculado sobre as medianas:
espera_invisivel = (visao_cliente - visao_time) / visao_cliente # no exemplo acima: FL1 61% · FL2 45% · FL3 43%
Ele responde, em um número, quanto do tempo total que o solicitante experimenta acontece fora do período em que estávamos efetivamente trabalhando. É o indicador que mais rapidamente muda a natureza da conversa: acima de 50%, qualquer discussão sobre produtividade da equipe é secundária.
Como apresentar.A visão do cliente é a que vai para fora do departamento; a visão do time é a que orienta a melhoria interna. Nunca separadas: quando o painel externo mostra só o número do cliente, a equipe se sente cobrada por espera que não causou; quando o painel interno mostra só o número do time, comemoramos uma eficiência que o solicitante não sente.
Cuidado.As duas visões só são comparáveis se os marcos temporais estiverem registrados com disciplina — especialmente a data de entrada real do pedido e a data de disponibilidade para uso. Se o card for criado só quando o trabalho começa, a visão do cliente simplesmente não existe, e o indicador de espera invisível dará zero num cenário em que ele deveria ser o mais alto.
FL1
## Nível operacional
Métricas do fluxo do time. Servem para decidir hoje: o que puxar, o que destravar, onde o trabalho está parando. São as métricas que a própria equipe olha, sem intermediário.
Quem usaEquipe, líder técnico, coordenação
CadênciaDiária e semanal
Unidade de análiseCard / demanda
O1 · núcleo
### Trabalho em progresso (WIP) e aderência ao limite
NativoWIP Run Chart
Estamos começando mais do que conseguimos terminar?
Quantidade de itens em andamento por etapa e no fluxo inteiro, comparada ao limite acordado. É a métrica com maior relação causal com todas as outras: pela Lei de Little, o tempo de ciclo cresce proporcionalmente ao WIP para uma mesma vazão. Reduzir WIP é o botão mais direto que temos para entregar mais rápido sem contratar ninguém.
Doze semanas de WIP contra o limite. O indicador não é o valor médio, é o tempo passado acima da linha — e o que acontece com o tempo de ciclo nas semanas seguintes a cada pico.
Cuidado.Só faz sentido se itens bloqueados e "aguardando terceiros" continuarem contando como WIP. Quando se cria uma coluna de espera fora do limite para liberar espaço, o indicador melhora e a entrega piora.
Meta sugerida: WIP dentro do limite em 90% dos dias, com limite revisado a cada trimestre
O2 · núcleo
### Idade do trabalho em progresso (Aging WIP)
NativoAging WIP Chart
Qual item em andamento já passou do tempo esperado e ninguém percebeu?
Há quantos dias cada card em aberto está no fluxo, posicionado na etapa em que se encontra e comparado aos percentis históricos. É a métrica mais acionável do conjunto, porque olha para o trabalho que ainda dá para salvar — diferente do tempo de ciclo, que só fala de item já concluído.
Leitura: os dois pontos vermelhos, parados em "Aguardando negócio", já duraram mais que 95% de tudo que o time entregou. Entram na pauta da daily antes de qualquer item novo.
Como usar na rotina:percorrer o quadro da direita para a esquerda e discutir primeiro os cards acima da linha de 85%. A pergunta não é "como está?", é "o que precisa acontecer hoje para esse item andar?".
Meta sugerida: nenhum item em aberto acima do percentil 95 sem plano de ação registrado
O3 · núcleo
### Tempo de ciclo por percentis e SLE
NativoCycle Time Scatterplot
Em quantos dias entregamos, com que grau de confiança?
Distribuição do tempo entre o início efetivo do trabalho e a entrega. A leitura correta é por percentil: dizer "85% das melhorias ficam prontas em até 9 dias" é uma afirmação verificável e negociável. Dessa distribuição nasce o SLE — Service Level Expectation, o compromisso que publicamos para as áreas de negócio.
Cada ponto é uma demanda concluída. Os pontos acima do percentil 95 são o material das retrospectivas — quase sempre têm causa nomeável: dependência externa, escopo mal quebrado, reabertura.
Exemplo de SLE publicado:"Requisições de acesso: 85% em até 2 dias úteis. Melhorias pequenas: 85% em até 9 dias úteis. Acima disso, acionamos escalonamento." É o tipo de compromisso que substitui a negociação de prazo item a item.
Cuidado.Medir por tipo de demanda separadamente. Misturar incidente de 4 horas com projeto de 40 dias na mesma distribuição produz um número que não descreve nenhum dos dois.
Meta sugerida: reduzir o percentil 85 em 20% no semestre, mantendo a vazão
O4 · núcleo
### Vazão (Throughput)
NativoThroughput Run Chart
Quantas demandas concluímos por semana, e o quanto isso varia?
Contagem de itens concluídos por período. É a base de qualquer previsão e o substituto direto da estimativa: em vez de perguntar quanto esforço uma demanda tem, olhamos quantas demandas historicamente saem por semana. O que importa tanto quanto o número é a estabilidadedele.
A faixa observada (5 a 11) é mais informativa que a média: é ela que alimenta a simulação probabilística no nível tático.
Cuidado.Vazão não é produtividade individual e não deve ser comparada entre times. Quebras de demanda diferentes produzem números incomparáveis. Serve para prever o próprio futuro, não para ranquear.
Meta sugerida: estabilizar a variação — reduzir a amplitude entre semana boa e ruim
O5
### Eficiência de fluxo
NativoExige colunas de fila
Do tempo total que a demanda levou, quanto foi trabalho e quanto foi espera?
Percentual do tempo de ciclo em que o item esteve efetivamente em execução, descontados fila e bloqueio. Muda a conversa sobre prazo: quando 70% do tempo é espera, contratar mais gente não resolve — resolve atacar dependência, fila e tamanho de lote. Valores típicos em TI corporativa ficam entre 15% e 40%; o que importa é a tendência e ondea espera acontece.
A mesma demanda, vista por dentro. O ganho possível está nos 8,5 dias cinzas, não em acelerar os 3,5 dias verdes.
Meta sugerida: elevar a eficiência de fluxo em 10 pontos percentuais em dois trimestres
O6
### Índice de previsibilidade (P85 ÷ P50)
Exige extraçãoesforço baixo
O quanto nosso prazo é confiável, em um único número?
A razão entre o percentil 85 e a mediana condensa a dispersão em um indicador único. Dois times com a mesma mediana de 4 dias são completamente diferentes se um tem P85 de 6 e o outro de 24. É o número que permite acompanhar ganho de previsibilidade ao longo dos meses sem depender de leitura de gráfico.
IP = percentil_85(lead_time) / percentil_50(lead_time) # até 2,5 saudável · 2,5 a 4 atenção · acima de 4 imprevisível
Um número por mês, com a faixa de leitura ao fundo. A mediana pode não ter mudado no período — o que melhorou foi a confiabilidade da promessa.
Exemplo:melhorias com P50 de 5 dias e P85 de 21 resultam em IP 4,2. Mesmo com mediana boa, não dá para prometer prazo — a cauda domina a experiência de quem solicitou.
O7 · núcleo
### Volume de entrada e saída por mês, por tipo de demanda
NativoExige tipos de card padronizados
Em que tipo de demanda estamos acumulando trabalho, mês a mês?
Quantidade de cards que entraram e que saíram em cada mês, com cada barra decomposta por tipo de demanda. É a leitura mais simples e mais imediatamente compreensível do conjunto — funciona com qualquer plateia, inclusive quem nunca viu um gráfico de fluxo — e ainda assim responde uma pergunta que nenhuma das outras responde sozinha: ondeo desequilíbrio está se formando.
Barra sólida é o que entrou; barra clara é o que saiu. O número acima de cada par é o saldo do mês — quanto a fila cresceu ou diminuiu.
O que este gráfico mostra que os outros não mostram.No semestre o saldo acumulado foi de 28 itens, mas o desequilíbrio não está espalhado: incidentes e requisições entram e saem praticamente no mesmo ritmo, enquanto as melhorias entraram 55 e saíram 39. Toda a fila que cresceu é fila de melhoria.
A conclusão prática muda com essa informação. O agregado sugeriria "falta capacidade"; a decomposição por tipo mostra que a demanda reativa está consumindo a capacidade e empurrando a evolução para frente, mês após mês, sem que ninguém tenha decidido isso.
Cuidado.Mês é um recorte grosseiro e sensível a feriado, férias e pico sazonal — dois meses não são tendência. A recomendação é sempre exibir pelo menos seis meses e acompanhar o saldo acumulado, não o saldo isolado de cada mês.
Esta métrica é a versão operacional e por tipo da relação demanda × capacidade do nível tático (T4). A diferença de uso: aqui serve para a equipe enxergar onde o próprio trabalho se acumula; lá, com a projeção de fila, serve para negociar escopo e capacidade com as áreas.
Meta sugerida: saída maior ou igual à entrada em cada tipo de demanda no acumulado trimestral
O8
### Tamanho médio das demandas
NativoDistribuição exige extração
Nossas demandas têm tamanho adequado para fluir, ou estamos trabalhando em blocos grandes demais?
Tamanho pode ser lido de duas formas, e vale acompanhar as duas. O tamanho realizadoé o tempo que o item levou em execução — a medida mais honesta, porque não depende de ninguém acertar uma estimativa. O tamanho declaradoé o campo de tamanho do card, quando preenchido no refinamento; serve para comparar o que esperávamos com o que aconteceu e calibrar o julgamento da equipe ao longo do tempo.
A média de 4,5 dias não descreve nenhuma tarefa típica: metade termina em até 3 dias e a média é puxada por uma minoria de itens grandes.
Por isso a média nunca vem sozinha.Acompanhamos três números juntos: mediana (o tamanho típico), média (sensível à cauda) e percentual de itens acima do percentil 85 (o tamanho problemático). A distância entre média e mediana já é, por si só, um indicador — quanto maior, mais o fluxo depende de poucos itens grandes.
Para que serve na prática
Sustenta uma política objetiva de quebra de demanda: item que, no refinamento, aparenta passar do limite acordado precisa ser dividido antes de entrar no fluxo. Itens grandes dominam a cauda da distribuição, travam colunas, aumentam o WIP e destroem a previsibilidade — e é mais barato dividir antes do que descobrir depois.
Cuidado.Tamanho médio isolado é facilmente manipulável: basta fatiar cards artificialmente para o número melhorar sem que nada flua mais rápido. Por isso deve ser lido sempre ao lado da vazão e do tempo de ciclo — se o tamanho cai e a vazão em valor entregue não acompanha, o que mudou foi a contagem, não o trabalho.
Meta sugerida: reduzir o percentual de itens acima do percentil 85, mantendo média e mediana próximas
O9 · núcleo
### Os três relógios: lead time do cliente, lead time da equipe e cycle time
NativoExige marcos de entrada, compromisso e início
Quanto tempo o solicitante espera, quanto tempo a demanda fica sob nossa gestão, e quanto tempo de fato trabalhamos nela?
São três medidas do mesmo item, com pontos de partida diferentes, e a diferença entre elas é o diagnóstico. O lead time do clienteconta do pedido à entrega, incluindo a fila de priorização. O lead time da equipeconta do momento em que a demanda é comprometida e entra no nosso fluxo. O cycle timeconta apenas a execução efetiva. Olhar só um deles leva a conclusões erradas com frequência.
Quando o relógio do cliente é muito maior que o da equipe, o problema é de priorização e fila. Quando o da equipe é muito maior que o cycle time, o problema é de espera interna e bloqueio.
Duas visões para cada relógio.O histograma por faixas de dias, segmentado por tipo de demanda, mostra a forma da distribuição e o tamanho da cauda. A série mensal do mesmo indicador, também por tipo, mostra se estamos melhorando ou piorando. As duas juntas evitam a leitura ingênua de um número isolado.
Exemplo de leitura cruzada:o lead time do cliente para manutenção caiu de 89 para 23 dias no trimestre, enquanto o cycle time ficou estável em 4. O ganho não veio de executar mais rápido — veio de reduzir a fila. É uma conclusão que nenhum dos dois indicadores revela sozinho.
Cuidado.Faixas largas no histograma escondem variação onde ela importa. Para tipos rápidos, faixas de 0 a 10 dias agrupam quase tudo em uma única barra e a distribuição desaparece — vale usar faixas menores por classe de serviço.
Meta sugerida: reduzir a distância entre lead time do cliente e cycle time, atacando a fila antes da execução
O10 · núcleo
### Envelhecimento do backlog
NativoSérie histórica exige extração
O que está esperando há mais tempo sem nunca ter começado?
Distribuição da idade dos itens que ainda não entraram em execução, em faixas de dias e por tipo de demanda, acompanhada da evolução mensal da idade média. O gráfico de envelhecimento do trabalho em progresso (O2) só enxerga o que já está em andamento; o estoque parado na entrada, que costuma ser muito maior, fica invisível sem esta visão.
A barra da direita é a mais importante do gráfico: 67 itens parados há mais de 200 dias. Na prática, esses itens não serão feitos — ou saem da lista formalmente, ou continuam gerando cobrança e ruído indefinidamente.
Duas perspectivas, leituras diferentes.O backlog da equipe mostra tudo o que está registrado; o backlog do cliente mostra apenas o que alguém de fora ainda está esperando. A segunda visão é a que importa na conversa com as áreas — e a que costuma ter os itens mais velhos, porque ninguém arquiva o pedido de outra pessoa.
Exemplo de tendência:a idade média das melhorias subiu de 362 para 408 dias no trimestre, enquanto a das manutenções ficou estável em torno de 53. A fila de evolução está envelhecendo sem que ninguém tenha decidido isso.
Meta sugerida: nenhum item acima de 180 dias sem decisão explícita de manter na fila ou encerrar
O11
### Composição do backlog: em definição × pronto para fazer
Exige separar refinamento de fila de execução
O que está represado por falta de clareza, e o que está represado por falta de capacidade?
Volume do backlog dividido em duas frentes, acompanhado mês a mês e por tipo: itens ainda em descoberta ou refinamento, que precisam ser entendidos antes de entrar; e itens prontos para execução, que só aguardam disponibilidade. São dois problemas com soluções completamente diferentes, e tratá-los como um único número de backlog impede escolher a ação certa.
A faixa de itens prontos para execução está estável; o que cresce é a fila de coisas que ainda precisam ser entendidas. Mais gente executando não mudaria este gráfico.
Como ler:se o lado da descoberta cresce, o gargalo está no refinamento e na definição com as áreas de negócio — mais gente executando não resolve. Se o lado pronto para execução cresce, o gargalo é de capacidade e a conversa é sobre escopo, prioridade ou time.
Meta sugerida: manter o backlog pronto para execução dimensionado em poucas semanas de vazão
O12 · núcleo
### Acordos versus vencidos
NativoExige data acordada no card
Dos prazos que combinamos, quantos vencemos — e de quem foi o atraso?
Total de compromissos com data acordada no mês, quantos venceram sem entrega e o percentual correspondente, separado entre atraso de responsabilidade interna e atraso causado pelo solicitante ou por terceiros. É a leitura diária e concreta do que o SLE (T2) mede de forma estatística — e a separação por responsabilidade é o que transforma a apresentação do número em conversa produtiva em vez de troca de acusações.
Em abril nenhum vencimento por causa interna. A linha decrescente é o que se apresenta às áreas; a decomposição por responsabilidade é o que se discute internamente.
Exemplo:136 acordos em abril, nenhum vencido por causa interna, 4% vencidos por pendência do solicitante. A série trimestral caiu de 10% para 6% e depois 4% — e o dado mostra que o ganho recente veio de melhoria no processo de validação com as áreas, não de execução mais rápida.
Cuidado.A classificação da responsabilidade precisa ter critério escrito e ser preenchida no momento do vencimento, não depois. Classificada retroativamente, ela vira narrativa — e um indicador que conta a história que queríamos contar não serve para decidir nada.
Meta sugerida: zero vencidos por causa interna; os demais com motivo registrado
O13
### Vazão de defeitos
NativoExige tipo de card específico
Quantos defeitos estamos gerando e corrigindo por mês?
Volume mensal de itens do tipo defeito ou correção, em número absoluto e como percentual da vazão total. É o contrapeso obrigatório de todas as métricas de velocidade: sem ele, um time pode melhorar tempo de ciclo e vazão simplesmente entregando com menos qualidade, e os indicadores aplaudirão.
O volume absoluto é apenas a porta de entrada: sozinho ele não distingue mês de muita entrega de mês de pouca qualidade. O pico de fevereiro só faz sentido lido junto com o que foi entregue naquele mês.
Exemplo:36, 55 e 29 defeitos no trimestre, contra uma vazão total de 2.891 itens — cerca de 4%. O pico do mês central coincide com a entrega de uma mudança grande, o que é informação útil para a retrospectiva e para a política de quebra de demanda (O8).
Cuidado.Número baixo pode significar qualidade boa ou detecção ruim. É por isso que este indicador é apenas a porta de entrada: a decomposição por fase de detecção (O15), o estoque em aberto (O16) e a causa raiz (O17) é que permitem agir.
Meta sugerida: reduzir a proporção de defeitos encontrados em produção sobre o total entregue
O14
### Origem da demanda: principais solicitantes
Exige campo de área solicitanteDashboards
De onde vem o volume, e de que natureza é o que cada um pede?
Ranking das áreas, clientes ou sistemas que mais geram demanda no período, com cada barra decomposta por tipo. A concentração já é informação; a composição é mais ainda. Um solicitante que gera quase só manutenção sinaliza um sistema instável; um que gera quase só melhorias sinaliza uma área em transformação. As duas situações exigem respostas opostas.
A concentração já é informação; a composição é mais ainda. Duas áreas com volume parecido pedem ações opostas quando uma só gera correção e a outra só gera evolução.
Exemplo:entre os dez maiores solicitantes, um concentra 33 demandas, todas de evolução, enquanto outro concentra 22, das quais 20 são manutenção corretiva. O primeiro é candidato a planejamento dedicado; o segundo, a uma investigação de causa raiz.
Meta sugerida: revisar trimestralmente os três maiores geradores de manutenção corretiva
O15 · núcleo
### Contenção de bugs: onde o defeito é encontrado
Exige campo de fase de detecçãoDashboards
Estamos encontrando nossos próprios erros cedo, ou deixando que o negócio e a produção os encontrem por nós?
Distribuição dos bugs por fase em que foram detectados — desenvolvimento, revisão de código, teste interno, homologação do negócio, produção. É a métrica de qualidade mais útil que existe no nível operacional, porque o custo de corrigir cresce de forma acentuada a cada fase que o defeito atravessa sem ser notado. O número absoluto de bugs diz pouco; ondeeles aparecem diz quase tudo.
As três primeiras barras são defeitos que custaram pouco. As duas últimas são os que realmente importam: um bug que chega ao negócio consome tempo de outra área; um que chega à produção consome confiança.
Dois números derivados desta distribuição:
Taxa de contenção— percentual de bugs detectados antes da homologação do negócio. No exemplo, 80%. É a métrica que deve subir.
Taxa de escape— percentual que chegou à produção. No exemplo, 5,5%. É a que deve cair, e a única que o cliente percebe.
O cuidado mais importante desta proposta inteira.A meta nunca é zero bugs internos. Bug interno registrado é sinal de que a detecção está funcionando — se a equipe for cobrada pelo número absoluto, ela para de registrar e o indicador melhora enquanto a qualidade piora. Proponho que isso seja dito explicitamente às equipes quando o painel for apresentado: o que cobramos é a taxa de escape, não o volume de bugs internos.
Meta sugerida: elevar a taxa de contenção e reduzir a de escape, sem meta sobre o volume absoluto
O16
### Estoque de bugs abertos e envelhecimento
NativoExige severidade no card
A quantidade de bugs em aberto está crescendo, e há quanto tempo os mais antigos estão lá?
Três leituras complementares: quantos bugs entram e quantos são corrigidos por período; quantos estão abertos agora, por severidade; e há quantos dias os mais antigos esperam. É a aplicação da lógica de entrada × saída (O7) e de envelhecimento (O10) especificamente à qualidade — e o sinal antecipado mais confiável de que a dívida de qualidade está se acumulando.
A partir de março o time passou a corrigir mais do que abre, e o estoque começou a cair. Antes disso, nenhuma ação de qualidade teria efeito visível — a fila só crescia.
Densidade, não volume.O número absoluto de bugs sobe quando o time entrega mais, o que não significa piora. A leitura correta é a densidade: bugs abertos por entrega concluída no período. Assim o indicador fica comparável entre meses de ritmo diferente.
Exemplo:38 bugs abertos, dos quais 6 há mais de 90 dias. Nenhum deles é grave — e é exatamente por isso que estão lá há 90 dias. Bug pequeno que nunca é priorizado ocupa espaço mental, reaparece em triagem toda semana e acaba sendo corrigido duas vezes por pessoas diferentes.
Regra sugerida para não acumular
Limite de bugs abertos por equipe.Acima do limite acordado, a equipe para de puxar história nova até voltar ao teto. É a mesma lógica do limite de WIP, aplicada à qualidade — e é o mecanismo mais eficaz que existe para impedir que o estoque cresça, porque transforma qualidade em restrição de fluxo e não em boa intenção.
Bug de história ainda na sprint não vira card novo.Se a história ainda não foi entregue, o defeito é parte dela e se corrige antes de concluir. Abrir card separado infla a contagem e cria a ilusão de entrega.
Prazo por severidade, não por prioridade negociada.Bug crítico corrige hoje; alto, nesta sprint; médio e baixo, ou entram numa cota fixa por sprint, ou são encerrados formalmente. Bug que ninguém vai corrigir deve ser fechado, não mantido na lista.
Meta sugerida: estoque de bugs estável ou decrescente, com limite explícito por equipe
O17
### Causa raiz e concentração dos bugs
Exige causa e módulo no cardCruzamento exige extração
Por que os bugs acontecem, e onde eles se concentram?
As duas métricas anteriores dizem quantos e onde foram pegos. Esta é a única que permite reduzir. São dois cruzamentos: a distribuição por causa raiz, classificada em lista fechada no fechamento do bug; e a concentração por módulo, sistema ou feature de origem. A segunda quase sempre revela que uma minoria dos componentes responde pela maioria dos defeitos.
Cada causa aponta para uma ação diferente. Sem essa classificação, a conversa sobre qualidade vira exortação genérica para tomar mais cuidado.
Taxonomia de causa raiz sugerida
Requisito ausente ou ambíguo · Regra de negócio não mapeada · Erro de implementação · Regressão em funcionalidade existente · Integração com terceiro ou sistema externo · Ambiente ou massa de dados de teste · Configuração e parametrização
Cada causa aponta para uma ação diferente, e é por isso que a taxonomia importa mais que a contagem. Requisito ambíguo em alta significa que os critérios de aceite estão sendo escritos depois de o trabalho começar. Regressão em alta significa falta de cobertura de teste automatizado em área que muda com frequência. Ambiente em alta significa que estamos gastando tempo de desenvolvimento para compensar infraestrutura de teste inadequada.
Exemplo:41% dos bugs do trimestre classificados como requisito ausente ou ambíguo, concentrados em dois módulos. Nenhuma prática de código resolve isso — a ação é no refinamento, com a área de negócio.
Cuidado.Classificação de causa raiz feita no fechamento, em trinta segundos, com lista fechada. Se virar análise formal, ninguém preenche; se for campo de texto livre, não agrupa. E a revisão das três maiores causas precisa ter cadência definida — dado de causa raiz que não gera ação estruturante é o tipo mais caro de métrica: custa registro e não devolve nada.
Meta sugerida: as três principais causas com ação definida a cada trimestre, e queda na causa atacada no trimestre anterior
O18 · núcleo
### Vazão com e sem bug, e densidade de bugs por card
Exige vínculo do bug com o card de origemDashboards
De tudo que entregamos no mês, quanto saiu limpo?
A vazão mensal decomposta em duas partes — cards entregues sem nenhum bug registrado e cards que tiveram ao menos um — acompanhada da densidade: bugs registrados dividido por cards entregues. É a métrica que fecha o par com a vazão (O4): aquela mostra quanto entregamos, esta mostra a que custo. Sozinha, a vazão premia velocidade; com esta ao lado, deixa de premiar.
A proporção de entregas com bug caiu de 36% em março para 18% em junho, e a densidade caiu de 0,67 para 0,26 bug por card — com a vazão total subindo no mesmo período. É a combinação que se busca.
Dois números derivados:
Taxa de entrega limpa— percentual de cards concluídos sem nenhum bug vinculado. É o indicador de qualidade mais fácil de entender por qualquer plateia, inclusive fora da área técnica.
Densidade— bugs registrados por card entregue. Vale calcular também a densidade entre os cards que tiveram bug: se ela é bem maior que a média geral, os bugs estão se concentrando em poucos cards, o que aponta para tamanho e complexidade e não para qualidade geral. No exemplo de junho: 0,26 no geral, mas 1,4 entre os cards afetados — o problema está em sete cards, não na entrega inteira.
Cuidado com a janela de atribuição.Um bug descoberto seis meses depois não deve reabrir a estatística de um mês já fechado. Proponho a regra: bug vinculado até 30 dias após a entrega conta para o mês daquela entrega; depois disso, entra como defeito em produção do mês corrente. Sem esse corte, nenhum mês fica fechado e a série histórica muda sozinha a cada semana.
Meta sugerida: elevar a taxa de entrega limpa mantendo ou aumentando a vazão total
### Também disponíveis neste nível
Não fazem parte do núcleo proposto, mas ficam catalogadas porque respondem perguntas que aparecem com frequência.
| Métrica | Responde | Origem
| Bloqueios por causa | O que mais trava o trabalho, e quanto custa em dias | Nativo + motivos padronizados
| Diagrama de fluxo cumulativo | Onde o trabalho está se acumulando | Nativo
| Matriz de transição e fluxo reverso | Por onde o trabalho volta, e quanto isso pesa no prazo | Extração
| Tempo até o primeiro toque | Quanto tempo um pedido fica sem nenhuma reação nossa | Extração
| Estoque parado dentro do WIP | Quanto do "em andamento" não se move há mais de uma semana | Extração
| Aderência à ordem de chegada | Quem passou na frente de quem, e a que custo | Extração
| Taxa e custo do descarte | Quanto esforço foi investido no que nunca foi entregue | Extração
| Passagens de mão por demanda | Quantas trocas de responsável uma demanda sofre | Extração
FL2
## Nível tático
Métricas de coordenação. Olham o caminho completo da demanda — do pedido da área de negócio à entrega em produção — incluindo o que acontece antesde o time começar e o que depende de terceiros. É aqui que prazo vira compromisso negociável.
Quem usaCoordenação, gestores das áreas, fornecedores
CadênciaQuinzenal e mensal
Unidade de análiseFluxo de valor / serviço
T1 · núcleo
### Lead time ponta a ponta (do pedido à entrega)
NativoExige card criado na chegada do pedido
Quanto tempo o solicitante realmente espera — e quanto desse tempo sequer é nosso?
Diferente do tempo de ciclo operacional, conta desde o registro da solicitação, incluindo o tempo parado no backlog aguardando priorização. É quase sempre a métrica que mais surpreende: um time que "entrega em 9 dias" pode estar fazendo a área esperar 45, porque 36 foram de fila.
A mesma entrega que o time registra como nove dias. A conversa com a área muda quando os quatro blocos aparecem separados, porque cada um tem um dono diferente.
Exemplo de decomposição:pedido registrado em 3/2 · priorizado em 28/2 (25 dias de fila) · iniciado em 3/3 · entregue em 12/3 (9 dias de execução) · homologado pelo negócio em 22/3 (10 dias). Total: 47 dias. A conversa com a área muda completamente quando os três blocos aparecem separados.
Cuidado.Expor o tempo de fila costuma gerar desconforto no primeiro ciclo. Vale apresentar junto com a relação demanda × capacidade, para que a leitura seja "temos mais pedidos do que capacidade" e não "o time é lento".
Meta sugerida: publicar o lead time ponta a ponta por classe de serviço e reduzir o tempo de fila
T2 · núcleo
### Previsibilidade: aderência ao SLE
NativoExceeded SLE Scatter / Heat Map
Estamos cumprindo o que prometemos, e quando falhamos, onde?
Percentual de demandas entregues dentro do SLE publicado, com detalhamento de quais estouraram e em que etapa o tempo foi perdido. Previsibilidade é o produto principal de uma área de sustentação: entregar em 10 dias sempre vale mais, para o negócio, do que entregar em 5 às vezes e em 30 às vezes.
Um SLE por classe, e não um prazo único. O mapa de calor da ferramenta mostra em seguida em que etapa o tempo foi perdido em cada classe que ficou abaixo da meta.
Exemplo:incidentes críticos com 96% de aderência; melhorias com 64%. O mapa de calor mostra a concentração das falhas na etapa de homologação do negócio, não no desenvolvimento — o que redireciona completamente a ação.
Meta sugerida: 85% de aderência por classe de serviço, medida mensalmente
T3 · núcleo
### Alocação de capacidade por classe de demanda
Exige tipos de card padronizadosDashboards
Nossa capacidade está sendo consumida onde acordamos que seria?
Distribuição das entregas entre categorias como incidente, requisição, melhoria, projeto e dívida técnica, podendo ser cruzada por área solicitante e por sistema. É a métrica que transforma discussão de prioridade em acordo explícito.
A distância entre as duas barras é o assunto da reunião. A dívida técnica, que tinha 5% acordados, praticamente desapareceu — e ninguém decidiu isso.
Exemplo de acordo de alocação
Acordado: 40% sustentação · 40% evolução · 15% projetos · 5% dívida técnica.
Realizado no trimestre: 63% sustentação · 24% evolução · 12% projetos · 1% dívida técnica.
Conclusão: a evolução não parou por falta de prioridade, parou por absorção de chamados — e esse trade-off precisa ser decidido, não sofrido.
Cuidado.Contar por quantidade de cards distorce quando os itens têm tamanhos muito diferentes. Se a diferença for grande, usar tempo em execução ou faixa de tamanho como peso.
Meta sugerida: desvio máximo de 10 pontos percentuais em relação ao acordo trimestral
T4 · núcleo
### Demanda versus capacidade
NativoProjeção exige extração
A fila está crescendo ou diminuindo?
Comparação entre quantos itens entram e quantos saem por período. Se a chegada supera a vazão de forma sustentada, nenhum esforço de produtividade resolve — a fila cresce por aritmética, e o lead time cresce junto. É o argumento mais objetivo que existe para discutir escopo, capacidade ou filtro de entrada.
saldo_semanal = vazao - chegada se saldo <= 0: a fila cresce indefinidamente senão: semanas_para_zerar = backlog / saldo # calcular por classe de serviço; o agregado esconde o problema
Enquanto a linha vermelha estiver acima da verde, nenhuma melhoria de produtividade estabiliza o prazo. A decisão é sobre entrada, capacidade ou escopo.
Exemplo:chegada média de 11 itens por semana contra vazão de 8. Em 12 semanas, o backlog cresceu 36 itens e o lead time dobrou. As três saídas possíveis — reduzir entrada, aumentar capacidade, reduzir escopo por item — são todas decisão de gestão.
Meta sugerida: manter a razão chegada/vazão entre 0,9 e 1,0 no acumulado trimestral
T5 · núcleo
### Demanda de falha
Exige extraçãoExige campo de origem
Quanto do nosso trabalho existe só porque algo antes não foi feito certo?
Percentual da demanda que chega porque uma entrega anterior falhou, um processo não funcionou ou uma informação não foi repassada — em oposição à demanda de valor, que é pedido legítimo de algo novo. Em sustentação é comum que boa parte da carga seja demanda de falha, e essa é a única métrica que a torna visível e atacável.
# campo de origem preenchido na aberturademanda_falha = erro em entrega anterior · configuração incorreta · falta de treinamento do usuário · informação não repassada · processo manual que deveria estar automatizado taxa = demanda_falha / demanda_total # por sistema e por área
No Sistema A, quatro de cada dez pedidos existem porque algo antes não funcionou. É a parcela da carga que pode ser eliminada em vez de acelerada.
Exemplo:41% dos chamados de um sistema no trimestre foram dúvidas de uso da mesma tela. Isso não é demanda de TI, é demanda de treinamento — e o dado permite devolvê-la a quem pode resolver, em vez de absorvê-la indefinidamente.
Meta sugerida: reduzir a demanda de falha em 15% ao semestre nos dois sistemas mais afetados
T6
### Previsão probabilística (Monte Carlo)
NativoVersão segmentada exige extração
Com que probabilidade entregamos este conjunto até tal data?
Simulação que usa o histórico real de vazão para projetar cenários futuros, devolvendo uma faixa com probabilidades em vez de uma data única. Substitui o cronograma otimista por um compromisso honesto — e permite escolher o nível de risco a assumir em cada caso.
A data com 50% de chance é uma aposta; a com 85% é um compromisso. A recomendação é comunicar sempre a segunda para fora do departamento.
A simulação nativa usa o histórico do quadro inteiro. Recalculando sobre dados extraídos, dá para simular cenários específicos — só uma área, só um sistema, excluindo período de férias ou considerando redução de capacidade. É a diferença entre uma previsão genérica e a resposta para a pergunta que foi realmente feita.
Meta sugerida: todo compromisso externo comunicado com percentil 85, não com data única
T7 · núcleo
### Fluxo de features e pacotes
NativoExige vínculo com o projeto pai
Quantas frentes estamos tocando ao mesmo tempo, quanto tempo cada uma leva, e quais estão envelhecendo?
As mesmas três métricas de fluxo do nível operacional — WIP, tempo de ciclo e envelhecimento — aplicadas à granularidade de feature ou pacote, no quadro do coordenador. É o nível onde o excesso de frentes simultâneas realmente aparece: um time pode ter WIP baixo de user stories e ainda assim estar dividido entre seis frentes de quatro projetos diferentes, o que nenhum indicador do nível de baixo revela.
Cada bloco é uma feature ou pacote em andamento. Fechar as duas vermelhas antes de abrir qualquer frente nova reduz o tempo de todas as demais.
O que olhar, nesta ordem.Primeiro o WIP de features e pacotes por projeto, e o número de projetos com frentes em andamento ao mesmo tempo. Depois o envelhecimento das frentes abertas, comparado ao histórico. Só então o tempo de ciclo médio e por percentil.
Exemplo:quatro projetos com frentes simultâneas, 11 abertas e mediana de 34 dias cada. Fechar as duas mais antigas antes de abrir qualquer frente nova reduz o tempo de todas as demais, sem nenhuma mudança de capacidade.
Cuidado com o tamanho da frente.Feature ou pacote que não cabe em uma ou duas sprints inviabiliza qualquer previsão: fica em andamento por tanto tempo que o avanço do projeto para de se mover no painel, mesmo com trabalho acontecendo. Se não cabe, precisa ser quebrado antes de entrar — vale a mesma política de O8, aplicada uma granularidade acima.
Meta sugerida: limitar features e pacotes simultâneos por equipe e por projeto, com limite explícito no quadro
T8
### Sprint: comprometido versus entregue e carry-over
NativoExige marcação de sprint no card
O que combinamos no início da sprint, o que saiu, e o que atravessou para a seguinte?
Três leituras da mesma sprint: percentual dos itens comprometidos que foram efetivamente entregues; volume de carry-over, isto é, itens que atravessam de uma sprint para a outra; e entrada não planejada, o trabalho que foi inserido depois de a sprint começar. As três juntas explicam por que o planejado e o realizado divergem — e quase sempre a resposta está na terceira.
A aderência baixa da S3 não vem de a equipe ter comprometido demais: vem da faixa amarela. É por isso que o indicador nunca deve virar meta de acerto de planejamento.
Exemplo:68% de aderência ao comprometido, com 7 itens de carry-over e 9 itens de entrada não planejada na mesma sprint. A conversa não é sobre a equipe ter comprometido demais; é sobre a sprint ter sido interrompida nove vezes.
Cuidado.Aderência à sprint não deve virar meta. Meta de 100% é atingida em duas sprints — comprometendo menos, não entregando mais. O indicador serve para diagnosticar a fonte da variação, não para cobrar acerto de planejamento.
Meta sugerida: reduzir a entrada não planejada, protegendo a capacidade acordada para projeto
T9 · núcleo
### Avanço real do projeto e crescimento de escopo
Exige vínculo pai/filho completoSérie de escopo exige extração
O projeto está de fato onde dizemos que está?
Duas medidas que só fazem sentido juntas: o percentual de features e pacotes concluídos sobre o total previsto para o projeto, calculado a partir dos cards filhos e nunca declarado manualmente; e o crescimento de escopo, ou seja, quantas frentes foram adicionadas depois do início da execução. A primeira sozinha engana, porque um projeto pode entregar frentes e mesmo assim estar mais longe do fim do que no mês anterior.
As duas primeiras barras medem a mesma coisa de formas diferentes. A terceira explica a divergência — e é a que costuma não aparecer em nenhum relatório.
Exemplo:projeto reportado como 60% concluído. A contagem dos cards filhos mostra 8 de 21 frentes entregues — 38% — e cinco dessas 21 foram criadas depois do início. O projeto não atrasou por lentidão: ele cresceu 31% e ninguém replanejou a data.
Cuidado.Contar frentes é uma aproximação, porque elas têm tamanhos diferentes. A leitura fica mais honesta quando features e pacotes estão razoavelmente padronizados em tamanho — o que é mais um argumento para a política de quebra proposta em T7. Escopo crescente não é erro: é informação que precisa chegar a quem decide, no momento em que acontece, e não na véspera da entrega.
Meta sugerida: avanço sempre calculado pelos cards filhos, com crescimento de escopo reportado na revisão mensal
### Também disponíveis neste nível
| Métrica | Responde | Origem
| SLA real de terceiros por fornecedor | O tempo de resposta contratado é o praticado? | Extração + campo fornecedor
| Retrabalho e reincidência | Quanto da capacidade corrige o que já entregamos | Extração
| Sazonalidade da chegada | Quando a demanda chega, e por que nos pega de surpresa | Extração
| Qualidade da entrada por área | Quais áreas abrem demandas executáveis sem ida e volta | Extração
| Densidade de dependências entre quadros | Quanto do prazo depende de trabalho que não é nosso | Extração + vínculos
FL3
## Nível estratégico
Métricas de portfólio e resultado. Não respondem se o time é rápido, e sim se estamos fazendo as coisas certas: onde a capacidade está sendo investida, quanto tempo uma decisão leva para virar valor, e o que a organização ganhou com isso.
Quem usaDiretoria, coordenação, áreas de negócio
CadênciaMensal e trimestral
Unidade de análiseIniciativa / objetivo
E1 · núcleo
### Lead time de iniciativas e fração consumida antes do início
Exige Portfolio KanbanFração exige extração
Quanto tempo leva entre decidir fazer algo e esse algo estar em produção — e o gargalo está na execução ou na decisão?
Tempo de ciclo dos projetos no quadro do gerente, contado da criação do card — logo após a aprovação na comissão — até a entrega, decomposto entre o período anterior ao início e o de execução. Quando mais da metade do tempo é consumida antes de o trabalho começar, a conclusão estratégica é que o problema é de priorização e governança, não de capacidade técnica — e investir em ferramenta ou contratação não altera o resultado percebido.
Cada ponto é um projeto concluído, posicionado no trimestre em que terminou. A dispersão importa mais que a mediana: é ela que determina se uma data pode ser prometida.
Exemplo:mediana de 4,5 meses entre aprovação e produção, com 40% desse tempo antes do início efetivo. A leitura não é "acelerar o desenvolvimento", é "aprovar menos iniciativas ao mesmo tempo".
Meta sugerida: reduzir a mediana em 25% ao ano, limitando iniciativas simultâneas
E2 · núcleo
### Investimento de capacidade por objetivo estratégico
Exige campo de objetivoDashboards
A carteira reflete as prioridades declaradas da empresa?
Percentual da capacidade entregue, por trimestre, associada a cada objetivo estratégico — e, criticamente, quanto sobra fora de qualquer objetivo. É o teste de coerência entre discurso e execução: se a maior parte da capacidade não se liga a nenhum objetivo, ou os objetivos estão errados ou a priorização está.
O teste de coerência entre discurso e execução. A faixa de obrigação legal é legítima e precisa existir — a vermelha é a que merece explicação.
Cuidado.Manutenção e obrigação legal precisam ter categoria própria e legítima. Forçar tudo a se encaixar num objetivo estratégico gera classificação decorativa e destrói a confiança no número.
Meta sugerida: no mínimo 60% da capacidade de evolução vinculada a objetivos declarados
E3 · núcleo
### Entrega versus resultado
Exige métrica de negócio
O que entregamos produziu o efeito que justificou a iniciativa?
Para cada iniciativa relevante, uma métrica de negócio definida antesda execução e medida depois: horas de trabalho manual eliminadas, redução de erro em fechamento, tempo de processo, chamados evitados, custo reduzido. Sem esse fechamento, todo o resto do painel mede movimento com precisão crescente sem nunca responder se valeu a pena.
Entregar não é o mesmo que resolver. A iniciativa de 40% não foi mal executada — a hipótese de negócio é que não se confirmou, e isso é aprendizado, não falha de projeto.
Exemplo de ficha de iniciativa
Resultado esperado:reduzir de 3 dias para 4 horas o fechamento mensal de uma área.
Medição:tempo médio de fechamento nos 3 meses seguintes à entrega.
Realizado:7 horas — 82% do ganho previsto.
Meta sugerida: 100% das iniciativas estratégicas com resultado esperado declarado antes do início
E4
### Iniciadas versus concluídas, e divisão entre manter e evoluir
Exige extraçãoesforço baixo
Estamos terminando iniciativas ou só começando? E quanto sobra para construir o futuro?
Duas leituras complementares da mesma carteira. A primeira compara iniciativas iniciadas e concluídas por trimestre: quando a linha de iniciadas fica persistentemente acima, o portfólio acumula trabalho parcialmente feito, que não gera valor e consome atenção de todos. A segunda acompanha a proporção entre sustentação do parque atual e construção de novas capacidades — cuja tendência de piora é o sintoma financeiro da dívida técnica.
Quatro trimestres começando mais do que terminando. A linha preta é o custo disso: trabalho parcialmente feito, que não gera valor e consome atenção de todos.
Exemplo:14 iniciativas iniciadas e 6 concluídas em 12 meses, com 19 em aberto ao final. Na mesma série, a sustentação passou de 55% para 67% da capacidade. Nenhum aumento de time resolve isso sozinho — é preciso limitar frentes simultâneas e atacar a causa da sustentação.
Meta sugerida: concluir mais iniciativas do que iniciar em dois trimestres consecutivos
E5
### Previsão de término dos projetos pelo fluxo de features
Exige extraçãoExige vínculo pai/filho
Com que probabilidade este projeto termina dentro do trimestre?
A mesma simulação probabilística do nível tático, aplicada ao portfólio: em vez de projetar demandas, projeta features e pacotes. Usa a vazão histórica dessas frentes nas equipes envolvidas e o número de frentes restantes do projeto para devolver uma faixa de datas com probabilidade. É a ponte mais direta entre o que o time faz e o que a diretoria precisa saber — e substitui o cronograma linear por uma leitura que já incorpora a variação real.
A leitura é direta: qualquer data escolhida na curva tem uma probabilidade associada. Escolher março é uma aposta; escolher maio é um compromisso.
Exemplo:projeto com 13 frentes restantes e vazão histórica de 2 a 5 por mês nas equipes envolvidas. A simulação devolve conclusão em março com 50% de chance e em maio com 85%. O compromisso comunicado é maio.
Cuidado.A previsão pressupõe escopo estável. Projeto que ganha frentes novas todo mês tem previsão que se desloca sozinha, e a simulação passa a medir o crescimento do escopo em vez do progresso. Por isso a previsão é sempre apresentada ao lado do crescimento de escopo (T9) — separadas, as duas contam histórias incompletas.
Meta sugerida: datas de projeto comunicadas sempre com percentil 85 e revisadas mensalmente
### Também disponíveis neste nível
| Métrica | Responde | Origem
| Previsibilidade do portfólio | Quando comprometemos uma data, ela se confirma? | Nativo
| Custo por demanda e por sistema | Quanto custa manter cada sistema do parque | Extração + custo de capacidade
| Concentração de conhecimento | Quantos sistemas dependem de uma única pessoa | Extração
| Envelhecimento de iniciativas paradas | Quanto tempo uma decisão espera para virar trabalho | Extração
| Percepção de valor das áreas | Quem depende de nós considera que o serviço serve | Pesquisa trimestral
SUS2
## Parte 2 — Sustentação no Acelerato
Tudo até aqui descreve o fluxo de projeto no BusinessMap. A sustentação vive em outra ferramenta, com outra população, outro relógio e outro vocabulário — e por isso merece uma parte própria, e não um capítulo dentro das anteriores.
FerramentaAcelerato · painel DSPD-SSSC
PopulaçãoOrg. DSPD Sustentação · equipes TOTVS, Senior e Fluig
UnidadeChamado (incidente e requisição)
## Por que uma parte separada
Chamado não é card, e SLA não é SLE. No BusinessMap medimos o fluxo de trabalho planejado, com hierarquia de projeto, frente e story; no Acelerato medimos atendimento reativo, com prioridade, prazo contratado e etapas de espera próprias. Juntar as duas populações num mesmo histograma produziria um número que não descreve nenhuma das duas.
Há também uma diferença de natureza que vale explicitar na apresentação: o painel do Acelerato já existe e já roda. Nesta parte, portanto, primeiro registramos o que já medimos hoje— e só então, na sequência, entram as métricas propostas.
### O que o painel já entrega hoje
O painel DSPD-SSSC lê direto da base do Acelerato e está organizado em quatro abas, com filtro único de equipe, agente e período compartilhado entre elas.
| Aba | O que já mede | Base do recorte atual
| SLA e performance  | Aderência ao SLA de resolução e de primeiro atendimento contra a meta; série mensal empilhada com acumulado corrido; ranking de agentes; detalhe mensal; tempo sem atendimento; abertos × fechados; relação fechados/abertos; agentes ativos por mês  | 1.047 fechados em 9 meses · 89,0% dentro do SLA · meta 85% atingida em 7 dos 9 meses
| Abertos  | Fotografia dos chamados em aberto: SLA vencido × no prazo, idade, distribuição por etapa do kanban e por agente, chamados sem agente, projeção do SLA do mês simulando os abertos  | 92 abertos · 24% já vencidos · idade média 50 dias · 47 acima de 30 dias · 9 sem agente
| Reincidência  | Percentual de chamados marcados como reincidentes sobre o total aberto no período, série mensal e lista nominal dos casos  | 29 reincidentes em 1.113 abertos · 2,6% · pico de 15% em jul/26
| Aging  | Decomposição do tempo de vida do chamado em cinco totalizadores — sem atendimento, em atendimento, espera combinada, espera do solicitante e espera de outros times — em total, média e percentual, com séries mensais e ranking por agente  | 1.065 fechados · aging médio 14,0 dias · 92,0 mil horas somadas
### A leitura mais forte que o painel já produz
A decomposição do aging em cinco totalizadores responde, sem precisar de nenhuma métrica nova, a pergunta que mais importa na sustentação: de todo o tempo que um chamado vive, quanto foi efetivamente atendimento.
Cinco totalizadores, 1.065 chamados fechados. Quatro deles são espera de algum tipo, e somam 90,4% do tempo de vida dos chamados.
Traduzindo para o vocabulário da primeira parte: a eficiência de fluxo da sustentação é de 9,6%. É um número baixo mesmo para os padrões de TI corporativa, e ele reposiciona qualquer discussão sobre capacidade da equipe — mais da metade do tempo (54,4%) está em poder do solicitante ou de outros times.
### O contraste entre SLA e experiência
As duas métricas seguintes vêm do mesmo painel e contam histórias diferentes. A aderência ao SLA está em 89% no acumulado do ano, acima da meta na maioria dos meses. O tempo de vida do chamado, no mesmo período, é de 14 dias em média — e está piorando.
Setembro é o mês em que as duas linhas se separam de forma visível: SLA em 72% e tempo de vida em 27,4 dias, contra 11,8 em janeiro. Os dados de setembro ainda são parciais, mas a tendência de junho já apontava na mesma direção.
### O que os números já dizem, sem nenhuma métrica nova
- Cumprir SLA e atender rápido não são a mesma coisa.Com 89% de aderência e 14 dias de tempo de vida médio, o SLA está medindo o relógio contratado, com suas pausas, e não a experiência de quem abriu o chamado. É exatamente a distinção entre visão do time e visão do cliente aplicada à sustentação.
- O gargalo não é a equipe.54,4% do tempo está em espera do solicitante ou de outros times, e 17,8% é fila antes de qualquer tratamento. O tempo de trabalho efetivo é a menor das cinco fatias.
- O estoque de abertos está envelhecido.92 chamados em aberto com idade média de 50 dias, 47 deles acima de 30 dias e 24% já vencidos. Metade dos abertos está em etapas de espera.
- A fila cresce devagar e de forma consistente.A relação fechados sobre abertos ficou abaixo de 100% em sete dos nove meses.
- A força de atendimento oscila muito.Agentes ativos variando de 10 em março para 4 em setembro, com a carga por agente subindo de 14 para mais de 20 chamados no mesmo movimento.
### Limites que o próprio painel já sinaliza
Três ressalvas que estão declaradas no painel e que vale manter visíveis quando ele for apresentado, porque definem o que o número pode e não pode sustentar.
- A reincidência está subestimada.O campo que marca recorrência é pouco preenchido e, quando ausente, o chamado conta como não reincidente. Os 2,6% são piso, não medida.
- O aging considera apenas chamados fechados.Os casos mais antigos e problemáticos, que ainda estão abertos, não entram na média — o que torna o número conservador por construção.
- A projeção de SLA do mês é simulação, não previsão: assume todos os abertos sendo concluídos hoje no estado atual. Serve como alerta antecipado, não como compromisso.
Uma ressalva adicional sobre o ranking de agentes, que existe na aba de SLA e performance: ele é útil para identificar carga desigual e necessidade de apoio, mas não deve ser usado como medida de desempenho individual. Vale o mesmo compromisso proposto na primeira parte — e nesta base ele é ainda mais importante, porque a distribuição de volume entre agentes é bastante desigual e a natureza dos chamados de cada fila é diferente.
Da fotografia para a proposta
O painel atual mede bem o que a ferramenta já entrega hoje: aderência ao SLA, aging e volume. O que ele ainda não mede é o processo— porque quase todos os indicadores previstos no PROC 30.000.010 dependem de campos e etapas que só existem depois da parametrização. As métricas a seguir nascem dessas duas fontes: a seção 6 do procedimento e o desenho de etapas, transições e campos já especificado para o Acelerato.
TOBE
## Métricas propostas para a sustentação
Doze métricas, todas ancoradas em um campo ou etapa da parametrização. Nenhuma delas exige desenvolvimento novo além do que já está na solicitação de mudança — mas nenhuma existe antes dela, e vale dizer isso com clareza na apresentação.
OrigemPROC 30.000.010 §6 + parametrização
Pré-requisitoEtapas, campos e gatilhos em produção
UnidadeChamado de incidente
S1 · núcleo
### MTTA e MTTR por prioridade
Etapas com SLA correndoCampo de exceção por registro posterior
Quanto tempo levamos para tocar no chamado e para restaurar o serviço, em cada faixa de prioridade?
Os dois indicadores centrais do procedimento. O MTTA conta da abertura ao primeiro atendimento significativo; o MTTR, da abertura à restauração validada. Ambos comparados ao alvo da matriz de prioridade — 4 horas de restauração em P1, 8 horas úteis em P2, 2 dias em P3, 5 em P4, 10 em P5. Os casos marcados como exceção de SLA por registro posterior saem da apuração regular e são analisados à parte, como o PROC determina.
Cada barra é o tempo realizado em relação ao alvo da própria prioridade, o que permite comparar faixas com prazos muito diferentes no mesmo gráfico.
Cuidado registrado na parametrização.O Acelerato pausa apenas o relógio de resolução, não o de primeiro atendimento — e o próprio pedido de informação ao solicitante, sendo o primeiro comentário, já marca o MTTA. O número é tempo útil, apurado pelo calendário de expediente e com as pendências descontadas do MTTR. Quem apresentar o indicador precisa saber disso, senão a primeira pergunta da mesa derruba a conversa.
Meta: conforme os prazos de primeiro atendimento e restauração da matriz de prioridade vigente
S2 · núcleo
### Aderência ao SLA por prioridade, separando os dois prazos
Base de SLA por prioridadeJá parcialmente no painel
Cumprimos o prazo de responder e o prazo de restaurar — e em qual deles falhamos?
O painel de hoje mostra a aderência agregada. A proposta é abrir em duas dimensões: por prioridade, porque P1 e P5 têm compromissos incomparáveis; e por tipo de prazo, porque falhar no primeiro atendimento e falhar na restauração têm causas e donos diferentes. Falha no primeiro atendimento é problema de triagem e capacidade de fila; falha na restauração é problema de diagnóstico, escalação ou dependência.
P2 é a faixa crítica: responde no prazo em 85% dos casos, mas restaura em apenas 74%. O gargalo está depois do primeiro contato, não antes.
Meta: superior a 90%, conforme a seção 6 do procedimento
S3 · núcleo
### Volume mensal por prioridade
Campos de Impacto e UrgênciaMatriz P1–P5
Quantos chamados de cada prioridade chegam por mês, e essa distribuição está mudando?
Contagem mensal de incidentes por faixa da matriz, em volume absoluto e em proporção. É a métrica de base de toda a parte de sustentação: define a carga real da operação, dimensiona a escala de plantão e serve de denominador para praticamente todos os outros indicadores. Sem ela, um mês com menos aderência ao SLA pode significar piora de atendimento ou simplesmente mais P1 e P2 do que o normal — e não há como distinguir os dois casos.
A distribuição importa tanto quanto o total. Junho teve volume alto e concentração incomum de P1 e P2 — e foi também o mês em que o tempo de vida do chamado saltou para 23,4 dias no painel atual.
Duas leituras complementares.Em volume absoluto, para dimensionar equipe, escala de plantão e cobertura de horário. Em proporção, para detectar deslocamento da mistura: se a fatia de P1 e P2 cresce de forma sustentada, ou o parque está se degradando, ou a matriz de prioridade está sendo aplicada com mão leve.
Vale acompanhar também o cruzamento com a reclassificação de prioridade (S7): quando o volume de uma faixa cresce ao mesmo tempo em que os ajustes manuais para aquela faixa aumentam, o crescimento é de classificação, não de incidente.
Cuidado com a inflação de prioridade.Se a prioridade passar a ser vista como fila preferencial, a distribuição migra para cima sozinha, sem que nada tenha piorado no ambiente. O antídoto não é métrica, é critério: a matriz Impacto × Urgência com exemplos de aplicação, que o procedimento já define, e a justificativa obrigatória em todo ajuste manual.
Meta sugerida: acompanhamento contínuo, com estabilidade da proporção de P1 e P2 sobre o total
S4 · núcleo
### Onde o chamado foi resolvido: N1, N2, N3 ou fornecedor
Etapas N1, N2 e N3 separadas
Quanto do volume o primeiro nível resolve sozinho, e quanto chega ao especialista?
A separação das etapas de atendimento por nível — decisão já tomada na parametrização — é o que torna esta métrica possível. Ela responde duas coisas ao mesmo tempo: a taxa de resolução no primeiro nível, que mede a eficácia da base de conhecimento e do treinamento do N1; e a carga que chega ao N3, que é o recurso mais escasso e mais caro da operação.
A etapa é a fonte da verdade do nível, e não a atribuição de time — a troca de equipe é consequência do gatilho de mudança de etapa, como definido na parametrização.
Cuidado.Taxa de resolução no N1 não deve virar meta isolada. Se o N1 for cobrado por ela, o efeito previsível é segurar chamado que deveria ter escalado — e o custo aparece depois, no MTTR e na reabertura. A leitura correta é sempre ao lado de S1 e S9.
Meta sugerida: elevar a resolução no N1 sem piorar MTTR nem taxa de reabertura
S5 · núcleo
### Motivos da escalação
Campo obrigatório na saída de Em diagnóstico
Por que o chamado saiu do primeiro nível?
O campo de motivo da escalação tem domínio fechado com cinco opções e é obrigatório na saída do diagnóstico. Ele distingue, nas palavras da própria parametrização, escalação legítima de escalação por comodidade — e cada motivo aponta para uma ação diferente.
Os dois primeiros motivos somam 62% e apontam para a mesma ação: base de conhecimento e capacitação do primeiro nível. O último, ainda que pequeno, merece leitura própria.
Meta sugerida: reduzir a escalação por ausência de conhecimento no N1, atacando a base de conhecimento
S6 · núcleo
### Motivos de encerramento e taxa de contorno
Campo obrigatório no encerramento
Como os chamados terminam — resolvidos de verdade, contornados, ou nem eram incidente?
O campo de motivo de encerramento tem cinco valores e cada um conta uma história diferente. Resolução definitivaé o desfecho desejado. Contorno aplicadoé o indicador que o PROC pede acompanhar continuamente: mede a proporção de incidentes encerrados sem eliminar a causa raiz, e é o insumo direto da Gestão de Problemas. Reclassificado, não é incidentemede a qualidade da entrada e do catálogo de serviços. Encerrado sem retornoe duplicadomedem higiene.
Um quinto a um terço dos encerramentos por contorno significa que a causa raiz continua viva. Cada um desses chamados é candidato a Registro de Problema.
Meta: acompanhamento contínuo do percentual por contorno, com tendência de queda da faixa de reclassificação
S7 · núcleo
### Reclassificação: de prioridade e de tipo
Prioridade ajustada manualmente + justificativaMotivo de encerramento
Quantos chamados tiveram a classificação alterada, e por quê?
São dois fenômenos diferentes que costumam ser tratados como um só, e vale medir separados. A reclassificação de prioridadeocorre quando o Líder da Equipe ou o Coordenador ajusta o resultado da matriz Impacto × Urgência — registrada no campo de ajuste manual, com justificativa obrigatória. A reclassificação de tipoocorre quando se identifica que a demanda não era incidente, tratada pela exceção 4.1.1 e registrada no motivo de encerramento.
Volume alto e estável de ajuste de prioridade indica matriz mal calibrada ou critérios de impacto mal entendidos na abertura. Volume alto de reclassificação de tipo indica catálogo de serviços confuso para quem abre.
Sobre o ranking dos principais motivos
Os motivos de encerramento e de escalação têm domínio fechado com cinco opções cada, então um ranking de dez posições não sai deles. As razões reais da reclassificação de prioridade ficam no campo livre de justificativa — e é de lá que o top de motivos precisa vir.
A sugestão é rodar uma leitura trimestral dessas justificativas, agrupá-las manualmente na primeira rodada e, a partir dos agrupamentos que se repetirem, propor um domínio fechado de motivo de reclassificação. É o mesmo caminho que se usou para os motivos de pendência e escalação: texto livre primeiro, lista fechada depois que os padrões aparecem.
Meta sugerida: reduzir a reclassificação de tipo atacando o catálogo; manter a de prioridade sempre justificada
S8
### Taxa de reabertura
Rastreável na ferramentaDepende da transição de retomada
A restauração que entregamos se sustentou?
Percentual de incidentes reabertos por reincidência do mesmo sintoma em curto intervalo. É a métrica de qualidade da restauração e tem meta explícita no procedimento: abaixo de 5%.
A faixa verde é a zona da meta. A leitura só é confiável se as reaberturas forem de fato reaberturas.
O ponto crítico está na parametrização, não no indicador.Se a transição de Aguardando validaçãode volta para Em diagnósticonão for liberada, o atendente abre chamado novo quando o solicitante diz que não resolveu — e a taxa de reabertura fica artificialmente baixa. Seria o pior cenário possível: o indicador melhorando justamente quando a qualidade piora.
Meta: inferior a 5%, conforme a seção 6 do procedimento
S9
### Tempo em pendência, por motivo
Motivo de pendência + previsão de retorno
Quando o relógio para, de quem estamos esperando?
A etapa Pendente pausa o SLA — o que é correto do ponto de vista contratual e enganoso do ponto de vista do solicitante, que continua esperando. O campo de motivo de pendência transforma essa caixa-preta em informação acionável, com quatro valores. A métrica soma o tempo pausado por motivo e mede o cumprimento da previsão de retorno.
Com o motivo preenchido, a escalação por atraso prevista na exceção 4.1.3 deixa de depender de alguém perceber e passa a ser disparada por dado.
Meta sugerida: previsão de retorno cumprida na maioria dos casos, com escalação automática no vencimento
S10
### Tempo na fila de atribuição e a regra dos 15 minutos
Etapa Aguardando atribuição
Quanto tempo um chamado escalado fica sem dono?
A etapa de fila única existe justamente para tornar mensurável o aceite após a escalação. A exceção 4.1.2 dá 15 minutos para o Coordenador designar substituto quando o atendente especializado não está disponível — e, nas palavras da parametrização, é justamente onde a exceção costuma ser descumprida sem ninguém perceber.
Sem a etapa de fila, esse tempo se dilui dentro do atendimento e nenhuma das barras vermelhas existiria no relatório.
Meta sugerida: aceite dentro de 15 minutos na maioria das escalações, com exceções justificadas
S11
### Avaliação de Problema e conversão incidente → problema
Campo Avaliação de ProblemaVínculo entre tickets
Estamos avaliando a causa raiz onde o procedimento exige, e o que vira Problema de fato?
O procedimento torna a avaliação obrigatória em P1, P2 e em todo incidente encerrado por contorno, com meta de 100%. A métrica tem duas partes: a aderência à regra — percentual desses incidentes com avaliação registrada, seja pela abertura do Problema, seja pela justificativa de não abertura — e a taxa de conversão, que mostra quantos efetivamente viraram Registro de Problema.
A aderência mede disciplina de processo; a conversão mede o quanto a causa raiz está sendo efetivamente perseguida. As duas juntas evitam que a avaliação vire carimbo.
Meta: 100% de avaliação registrada em P1, P2 e encerramentos por contorno
S12
### Volume por sistema e exceção de registro posterior
Categoria por domínio tecnológicoCampo de exceção
Onde os incidentes se concentram, e quanto do atendimento acontece antes do registro?
Dois indicadores do procedimento que compartilham a mesma leitura estrutural. O volume por categoria ou sistemaapoia a priorização de investimento e revela padrões de recorrência — é o equivalente, na sustentação, da concentração de bugs por módulo da primeira parte. O percentual com registro posterior por atendimento emergencialmede quanto do trabalho acontece fora do processo formal; o procedimento pede acompanhamento contínuo com tendência de redução.
A barra vermelha é o que interessa: o Fiscal concentra volume e recorrência ao mesmo tempo, o que o torna o primeiro candidato a Registro de Problema estruturado.
Meta: acompanhamento contínuo, com tendência de redução do registro posterior
### Resumo da parte de sustentação
| Métrica | Origem | Depende de | Meta
| MTTA e MTTR por prioridade | PROC §6 | Etapas com SLA correndo | Matriz de prioridade
| Aderência ao SLA por prioridade | PROC §6 | SLA por prioridade | Acima de 90%
| Volume mensal por prioridade | Parametrização | Impacto, Urgência e matriz | Proporção estável de P1/P2
| Resolução por nível N1/N2/N3 | Parametrização | Etapas separadas por nível | Sem meta isolada
| Motivos da escalação | Parametrização | Campo obrigatório | Reduzir por falta de conhecimento
| Motivos de encerramento e contorno | PROC §6 + campo | Campo obrigatório | Acompanhamento contínuo
| Reclassificação de prioridade e tipo | Parametrização | Ajuste manual + justificativa | Sempre justificada
| Taxa de reabertura | PROC §6 | Transição de retomada liberada | Abaixo de 5%
| Tempo em pendência por motivo | Parametrização | Motivo + previsão de retorno | Previsão cumprida
| Fila de atribuição e regra dos 15 min | Parametrização | Etapa Aguardando atribuição | Aceite em 15 min
| Avaliação de Problema e conversão | PROC §6 | Campo + vínculo entre tickets | 100% em P1, P2 e contorno
| Volume por sistema e registro posterior | PROC §6 | Categoria + campo de exceção | Tendência de redução
A dependência que precisa ficar explícita na apresentação.Dez das doze métricas acima não existem hoje e não passam a existir por esforço de análise: elas dependem das etapas, dos campos e dos gatilhos entrarem em produção no Acelerato. Apresentar a proposta sem essa amarração cria a expectativa de que o painel pode ser montado na semana seguinte — e a frustração recai sobre a proposta, não sobre a dependência.
## De onde vem cada dado
As métricas desta proposta têm três origens, com custos de implantação bem diferentes. A distinção importa porque define o que dá para ter na semana que vem e o que exige projeto.
- Nativas do BusinessMap.Já existem no módulo de Analytics e dependem apenas de configurar corretamente o quadro. Custo: configuração e disciplina de registro.
- Derivadas de extração.Calculadas a partir do histórico de movimentação dos cards, obtido pela API. O módulo de Analytics responde bem sobre um card ou sobre o agregado do quadro; o que ele não faz é comparar cards entre si, olhar a direção do movimento ou cruzar com dado de fora — e é exatamente aí que estão métricas como demanda de falha, fluxo reverso e taxa de descarte. Custo: um coletor agendado e um lugar para guardar os eventos.
- Externas.Dependem de informação que não está no Kanban: custo de capacidade, métrica de negócio da iniciativa, percepção das áreas. Custo: acordo com outras áreas, não tecnologia.
- Acelerato.As métricas de sustentação têm origem própria — a base do Acelerato, lida diretamente por consulta SQL, com o painel DSPD-SSSC já em operação. Não se misturam às demais e estão na segunda parte deste documento.
Sete das métricas derivadas precisam apenas de datas que já existem no card, sem nenhuma mudança de processo. Dá para rodá-las sobre uma extração única dos últimos seis meses e ter resultado para discutir em poucos dias — o que é uma forma barata de testar o valor da proposta antes de investir em automação.
Um alerta que vale antecipar:card excluído ou arquivado some das consultas padrão. Se não preservarmos esse histórico desde o início, perdemos justamente as demandas canceladas — que são uma das medidas de desperdício mais reveladoras.
## Critérios sugeridos
Tudo o que vem a seguir é sugestão, não padrão fechado. São as definições operacionais sem as quais duas pessoas medem a mesma coisa de formas diferentes e o painel perde sentido. Proponho que discutamos cada bloco e ajustemos o que não servir — o importante é que, depois de acordado, valha igual para todos os quadros.
Comecemos pelo essencial: sete ajustes de configuração que precedem qualquer painel.
- Colunas de fila separadas das de execução.Sem essa distinção não existe eficiência de fluxo nem leitura correta de espera. Toda coluna cujo nome comece com "aguardando" ou "pronto para" é fila.
- Tipos de card padronizados.Incidente, requisição, melhoria, projeto, dívida técnica — com o mesmo significado entre as equipes, o que só funciona se combinarmos.
- Data de entrada real da demanda.O card precisa ser criado quando o pedido chega, não quando o trabalho começa; caso contrário o tempo de fila fica invisível.
- Motivos de bloqueio em lista fechada.Motivo digitado livremente inutiliza o agrupamento.
- Campos customizados mínimos.Área solicitante, sistema afetado, fornecedor envolvido, objetivo estratégico e origem da demanda.
- Vínculo pai/filho entre iniciativa e tarefas.É o que permite consolidar do operacional até o portfólio sem retrabalho de planilha.
- Limites de WIP acordados e visíveispor coluna e no fluxo, com revisão trimestral.
Os primeiros 30 a 60 dias de dados após essas mudanças servem para calibrar, não para cobrar. Percentis calculados sobre histórico inconsistente produzem compromissos que não se sustentam.
### A · Marcos temporais — onde cada relógio começa e para
É a decisão mais importante do conjunto. Sem ela, "lead time" significa uma coisa em cada quadro e nenhuma consolidação é possível.
| Marco | Evento no quadro | Quem registra | Métricas que dependem
| Entrada | Criação do card, no momento em que o pedido chega — não quando o trabalho começa | Quem recebe a demanda | Lead time do cliente, envelhecimento do backlog, entrada × saída
| Compromisso | Card entra na coluna de priorizado / comprometido | Coordenação, na reunião de reposição | Lead time da equipe
| Início | Primeira entrada em coluna de execução | Automático | Cycle time, tamanho, aging WIP
| Entrega | Disponível em produção para o usuário | Quem entrega | Todas as métricas de tempo e vazão
| Aceite | Confirmação do solicitante | Solicitante | Medido à parte (ver regra)
Regra sugerida:o relógio do cliente para na entrega em produção, e o tempo entre entrega e aceite é medido separadamente. Misturar os dois faz a disponibilidade da área de negócio aparecer como lentidão nossa — e vice-versa, esconde quando somos nós que demoramos.
### B · Tipos de demanda
| Tipo | Definição proposta | Natureza
| Incidente | Indisponibilidade ou erro em produção afetando a operação agora | Sustentação
| Requisição | Pedido padronizado e previsível: acesso, cadastro, relatório, parametrização simples | Sustentação
| Melhoria | Mudança em sistema existente que agrega capacidade nova | Evolução
| Iniciativa | Conjunto de entregas com objetivo e resultado declarados | Evolução
| Bug interno | Erro encontrado antes de chegar ao usuário: desenvolvimento, revisão, teste ou homologação | Qualidade (sem meta de volume)
| Defeito em produção | Erro em algo que já entregamos, encontrado pelo usuário ou pela operação | Sustentação (qualidade)
| Dívida técnica | Trabalho sem valor visível ao usuário que reduz risco, custo ou esforço futuro | Evolução
Regra sugerida:um card tem um tipo só, e na dúvida vale o motivo pelo qual o trabalho existe, não a atividade executada. Corrigir uma configuração para destravar um usuário é incidente, mesmo que o trabalho seja idêntico ao de uma requisição.
### C · Classes de serviço e SLE inicial
| Classe | Critério de enquadramento | Política
| Urgente | Parada de operação, risco legal ou financeiro imediato | Fura a fila; no máximo um por equipe ao mesmo tempo; motivo registrado
| Prazo fixo | Obrigação com data externa: fiscal, contratual, regulatória | Planejada para iniciar com folga sobre o percentil 85 da classe
| Padrão | A maioria das demandas | Ordem de chegada dentro do tipo; SLE definido pelo histórico
| Intangível | Dívida técnica, melhoria interna, automação de processo próprio | Sem SLE; protegida por cota fixa de capacidade no acordo de alocação
Regra sugerida:o SLE só é publicado após 60 dias de dados limpos e com no mínimo 20 itens concluídos na classe. Antes disso, qualquer número é ilustrativo — e publicar um compromisso que o histórico não sustenta destrói a credibilidade logo no primeiro mês.
### D · Colunas: o que é fila e o que é execução
- Colunas de fila são nomeadas começando por "Aguardando"ou "Pronto para". Colunas de execução recebem o nome da atividade.
- Nenhuma coluna de fila fica fora do limite de WIP — a espera continua contando como trabalho em progresso.
- Bloqueio não move o card para outra coluna: ele é marcado como bloqueio no próprio card, para que o tempo continue atribuído à etapa onde o problema aconteceu.
### E · Motivos de bloqueio — lista fechada proposta
Aguardando fornecedor · Aguardando validação do negócio · Aguardando ambiente ou infraestrutura · Dependência de outra demanda · Falta de informação no chamado · Janela de mudança · Aguardando licença ou contrato
Todo bloqueio registra motivo e quem é responsável por removê-lo. A lista é revisada a cada trimestre: motivo que aparece muito em "outros" vira categoria própria; categoria que não aparece há dois trimestres sai.
### F · Campos e quem preenche
| Campo | Formato | Quem preenche | Quando | Métricas dependentes
| Área solicitante | Lista fechada | Quem abre | Abertura | Origem da demanda, alocação, qualidade da entrada
| Sistema afetado | Lista fechada | Quem abre | Abertura | Custo por sistema, concentração de conhecimento
| Origem da demanda | Lista fechada | Quem faz a triagem | Triagem | Demanda de falha
| Fornecedor envolvido | Lista fechada | Quem bloqueia | Ao bloquear | SLA real de terceiros
| Data acordada | Data | Coordenação | No compromisso | Acordos × vencidos
| Responsabilidade do atraso | Interno / Solicitante / Terceiro | Coordenação | No vencimento, nunca depois | Acordos × vencidos
| Tamanho declarado | P / M / G | Equipe | Refinamento | Tamanho médio, política de quebra
| Fase de detecção | Lista fechada | Quem registra o bug | Abertura do bug | Contenção e taxa de escape
| Severidade | Crítica / Alta / Média / Baixa | Quem registra o bug | Abertura do bug | Estoque e prazo de correção
| Causa raiz | Lista fechada | Quem corrige | Fechamento do bug | Causa raiz e concentração
| Origem do bug | Vínculo com a story ou frente | Quem registra o bug | Abertura do bug | Concentração por módulo, densidade
| Objetivo estratégico | Lista fechada | Coordenação | Aprovação da iniciativa | Capacidade por objetivo
Princípio sugerido para a lista acima:nenhum campo obrigatório sem métrica que dependa dele. Campo que ninguém lê é atrito na abertura e acaba preenchido com qualquer coisa — o que é pior do que não ter o campo.
### G · Regras de cálculo
- Horas úteis, não corridas.Calendário padrão de dias úteis, com exceção explícita para as classes atendidas em regime de plantão.
- Percentis sobre janela móvel de 12 semanas, com mínimo de 20 itens concluídos. Abaixo disso o número existe mas não é publicado.
- Item reabertonão vira card novo: reabre o original e o tempo volta a contar, com um card de defeito vinculado para a contagem de qualidade.
- Item descartadosai dos cálculos de tempo de ciclo, mas entra na taxa de descarte com o tempo que já havia consumido.
- Subtarefa não conta como itemna vazão. A unidade de contagem é sempre a demanda entregável ao solicitante.
- Faixas de histogramaajustadas por classe: faixas curtas (0-1, 2-3, 4-5, 6-10, 11-20, +20 dias) para demandas rápidas; faixas longas apenas para o envelhecimento do backlog.
- Janela de atribuição de bug.Bug vinculado até 30 dias após a entrega conta para o mês daquela entrega; depois disso entra como defeito em produção do mês corrente. Sem esse corte, nenhum mês fica fechado e a série histórica se altera sozinha.
- Cards de teste e rascunhoem quadro separado, fora de qualquer cálculo.
### H · Higiene do quadro
- Revisão mensal do backlog: todo item acima de 180 dias recebe decisão explícita de manter ou encerrar, com registro do motivo.
- Card arquivado nunca é excluído — o histórico dos itens descartados é dado, não lixo.
- Um card representa uma demanda entregável. Se precisa de duas entregas separadas para o solicitante, são dois cards.
- Card sem movimento há mais de duas semanas em coluna de execução entra automaticamente na pauta da revisão semanal.
### I · Hierarquia de cards e vínculos entre quadros
- Todo card tem pai, exceto a sustentação.Feature e pacote pertencem a um projeto; user story pertence a uma feature ou pacote. Trabalho sem pai só é legítimo nos tipos de sustentação e demanda não planejada — que precisam ser identificáveis justamente para que esse consumo de capacidade apareça.
- Feature e pacote são o mesmo nível.Podem ter significados diferentes no planejamento, mas para efeito de medição contam igual: são as peças cuja conclusão faz o projeto avançar. Se em algum quadro um pacote agrupar features, isso cria um quarto nível — e nesse caso vale escolher qual dos dois é a unidade de avanço, para não contar duas vezes.
- Granularidade sugerida.Projeto medido em meses; feature ou pacote em uma a duas sprints; user story em poucos dias. Frente que não cabe em duas sprints é candidata a quebra antes de entrar no fluxo.
- Definição de concluído, no nível da frente:todas as user stories filhas entregues e a capacidade disponível para uso — não "desenvolvimento terminado". Sem esse critério, o avanço do projeto mede trabalho feito e não valor disponível.
- Avanço do projeto nunca é declarado à mão, e sim calculado pelas frentes filhas concluídas sobre o total.
- Escopo adicionado depois do inícioé marcado como tal no card, para que o crescimento de escopo seja mensurável em vez de percebido.
- Vínculo faltando é tratado como defeito de dado.Card filho sem pai entra numa lista de exceções revisada semanalmente — não porque seja burocracia, mas porque cada um deles é um pedaço de capacidade invisível no painel de cima.
### J · Como mudamos um critério
Qualquer um destes critérios pode ser revisto, e a revisão natural é trimestral. A única exigência que proponho é de registro: mudança de critério quebra a série histórica, então a data da mudança fica anotada no painel, e comparações que atravessam essa data precisam dizer isso explicitamente. Sem essa disciplina, uma melhoria aparente de indicador pode ser apenas uma mudança silenciosa de definição.
## Onde cada métrica é olhada
Métrica sem reunião correspondente não gera decisão. A proposta associa cada nível a um ritual que já existe ou que passa a existir, com uma pergunta fixa de abertura.
| Ritual | Cadência | Participantes | Métricas em pauta | Pergunta de abertura
| Daily de fluxo | Diária, 15 min | Equipe | Aging WIP, bloqueios, WIP | Qual item mais velho não andou desde ontem?
| Revisão de fluxo | Semanal, 30 min | Equipe e coordenação | Vazão, tempo de ciclo, previsibilidade, eficiência; entrada × saída por tipo, uma vez por mês | O que mudou na nossa distribuição de tempo?
| Reunião de serviço | Quinzenal, 45 min | Coordenação e áreas | Lead time ponta a ponta, aderência ao SLE, demanda de falha | Estamos cumprindo o que publicamos?
| Reposição e priorização | Quinzenal | Coordenação e demandantes | Demanda × capacidade, alocação por classe | O que entra, e o que sai da fila para isso caber?
| Revisão de portfólio | Mensal | Coordenação e diretoria | Lead time de iniciativas, iniciadas × concluídas | Estamos terminando ou só começando?
| Revisão estratégica | Trimestral | Diretoria e áreas | Capacidade por objetivo, entrega × resultado | O que entregamos mudou algum número do negócio?
## O que deliberadamente não vamos medir
Parte do valor da proposta está nas exclusões. Estas métricas são comuns, parecem úteis e produzem comportamento ruim — a recomendação é não adotá-las, e explicar por quê desde o início.
- Produtividade individual.Induz a fatiar demanda, evitar trabalho difícil e não ajudar colegas. O sistema entrega, não o indivíduo.
- Velocidade em pontos como meta.Pontos são inflacionáveis. Uma meta de velocidade é atingida em duas semanas — inflacionando a estimativa, não entregando mais.
- Comparação entre times.Contextos e granularidades diferentes tornam a comparação sem significado. Cada time compara-se com seu próprio histórico.
- Percentual de conclusão de tarefa.Item 90% pronto entrega zero valor. Só conta o que está em produção.
- Média de tempo de ciclo isolada.A média não descreve a cauda, e é a cauda que o cliente lembra e reclama.
- Horas apontadas como proxy de esforço entregue.Mede presença, não fluxo nem valor.
Compromisso proposto junto com o painel: nenhuma dessas métricas será usada em avaliação de desempenho individual.Sem essa garantia explícita e assumida por todos nós, o dado vira política e a qualidade da informação desaba em poucos meses.
## Resumo em uma página
Em destaque, o núcleo proposto para adoção imediata. As demais ficam catalogadas e podem ser ativadas quando a pergunta correspondente aparecer.
| Métrica | Nível | Origem | Cadência | Decisão que apoia
| WIP e limite | Operacional | Nativo | Diária | Terminar antes de começar
| Aging WIP | Operacional | Nativo | Diária | Onde intervir hoje
| Tempo de ciclo e SLE | Operacional | Nativo | Semanal | Compromisso de prazo por classe
| Vazão | Operacional | Nativo | Semanal | Base de previsão
| Entrada × saída por tipo | Operacional | Nativo | Mensal | Onde a fila está crescendo
| Eficiência de fluxo | Operacional | Nativo | Mensal | Atacar espera em vez de cobrar velocidade
| Índice de previsibilidade | Operacional | Extração | Mensal | Acompanhar ganho de confiabilidade
| Tamanho médio das demandas | Operacional | Nativo | Mensal | Política de quebra de demanda
| Três relógios (cliente, equipe, cycle) | Operacional | Config. | Mensal | Separar problema de fila de problema de execução
| Envelhecimento do backlog | Operacional | Nativo | Mensal | Encerrar ou assumir o que está parado
| Acordos × vencidos | Operacional | Config. | Semanal | Cumprimento do prazo combinado
| Composição do backlog | Operacional | Config. | Mensal | Refinamento ou capacidade
| Vazão de defeitos | Operacional | Nativo | Mensal | Contrapeso de qualidade
| Contenção de bugs por fase | Operacional | Config. | Mensal | Encontrar o erro mais cedo
| Estoque e envelhecimento de bugs | Operacional | Nativo | Semanal | Parar de acumular dívida de qualidade
| Causa raiz e concentração de bugs | Operacional | Config. | Trimestral | Ação estruturante de prevenção
| Vazão com e sem bug | Operacional | Config. | Mensal | Velocidade com qualidade, não apesar dela
| Origem da demanda | Operacional | Config. | Trimestral | Onde atacar causa raiz
| Lead time ponta a ponta | Tático | Nativo | Mensal | Negociação com áreas
| Aderência ao SLE | Tático | Nativo | Mensal | Credibilidade do serviço
| Alocação por classe | Tático | Config. | Mensal | Acordo de capacidade
| Demanda × capacidade | Tático | Nativo | Quinzenal | Escopo, time ou filtro de entrada
| Demanda de falha | Tático | Extração | Mensal | Devolver o problema a quem resolve
| Monte Carlo | Tático | Nativo | Sob demanda | Comprometer data com probabilidade
| Fluxo de features e pacotes | Tático | Config. | Quinzenal | Limitar frentes simultâneas
| Sprint: comprometido × entregue | Tático | Config. | Por sprint | Proteger a capacidade de projeto
| Avanço real e crescimento de escopo | Tático | Config. | Mensal | Replanejar data quando o escopo cresce
| Lead time de iniciativas | Estratégico | Config. | Trimestral | Limitar iniciativas simultâneas
| Capacidade por objetivo | Estratégico | Config. | Trimestral | Coerência entre estratégia e execução
| Entrega × resultado | Estratégico | Externo | Trimestral | Continuar, ajustar ou encerrar aposta
| Iniciadas × concluídas / run × change | Estratégico | Extração | Trimestral | Investimento em dívida técnica
| Previsão de término dos projetos | Estratégico | Extração | Mensal | Data de projeto com probabilidade
| Espera invisível (cliente × time) | Os três | Extração | Mensal | Onde atacar a espera, em cada nível
Em negrito, o núcleo proposto para adoção imediata. O inventário completo das demais métricas está nas tabelas ao final de cada nível.
## Visão geral: todas as métricas, por altitude e por pergunta
Quarenta e quatro métricas distribuídas em quatro níveis e quatro dimensões. O mapa abaixo não serve para consultar métrica — serve para enxergar a forma do conjunto e, principalmente, os espaços vazios, que são tão informativos quanto as células cheias.
Quatro níveis, quatro perguntas. As três células vazias e a faixa amarela são as informações mais úteis do mapa.
### O que o mapa mostra
- O valor está no topo e a qualidade embaixo.Nenhuma métrica operacional mede valor, e nenhuma estratégica mede qualidade — e isso está correto, desde que os níveis conversem. O risco não é a célula vazia: é ler um nível sozinho. FL1 todo verde com FL3 vermelho significa que estamos executando muito bem a coisa errada.
- Carga é a única dimensão presente nos quatro níveis.A pergunta "cabe?" se faz em qualquer altitude, só muda a unidade: cabe nesta semana, nesta sprint, neste trimestre, nesta escala de plantão.
- O FL1 concentra 40% do conjunto, o que é natural — é onde o dado nasce. Também é onde mais facilmente se acumula métrica que ninguém usa, e por isso o núcleo proposto é bem menor que o inventário catalogado.
- A sustentação espelha o FL1 e o FL2 ao mesmo tempo, com peso maior em qualidade, o que faz sentido para um serviço reativo. Mas ela não tem coluna de valor, e essa é uma lacuna real: hoje nada mede se o serviço de sustentação atende ao propósito de quem depende dele. A pesquisa trimestral de percepção, catalogada no nível estratégico, é a candidata natural a preencher esse espaço.
- A espera invisível não pertence a nenhum nível porque está em todos.É o único indicador do conjunto que se calcula da mesma forma nas quatro linhas, e o único que compara duas medidas em vez de produzir uma.
### O conjunto completo
| Dimensão | FL1 · Demanda | FL2 · Frente | FL3 · Projeto | Sustentação
| Tempo e
previsibilidade  | O2 idade do WIP
O3 tempo de ciclo e SLE
O5 eficiência de fluxo
O6 índice de previsibilidade
O9 três relógios
O10 envelhecimento do backlog
O12 acordos × vencidos  | T1 lead time ponta a ponta
T2 aderência ao SLE
T6 previsão probabilística  | E1 lead time de projetos
E5 previsão de término  | S1 MTTA e MTTR
S2 aderência ao SLA
S9 tempo em pendência
S10 fila de atribuição
| Carga e
capacidade  | O1 WIP e limite
O4 vazão
O7 entrada × saída
O8 tamanho das demandas
O11 composição do backlog
O14 origem da demanda  | T3 alocação por classe
T4 demanda × capacidade
T7 fluxo de frentes
T8 sprint e carry-over  | E4 iniciadas × concluídas
e manter × evoluir  | S3 volume por prioridade
S4 resolução por nível
S12 volume por sistema
| Qualidade  | O13 vazão de defeitos
O15 contenção de bugs
O16 estoque de bugs
O17 causa raiz
O18 vazão com e sem bug  | T5 demanda de falha  | —  | S5 motivos de escalação
S6 motivos de encerramento
S7 reclassificação
S8 reabertura
S11 avaliação de problema
| Valor e
resultado  | —  | T9 avanço real e escopo  | E2 capacidade por objetivo
E3 entrega × resultado  | —
Como usar este mapa numa reunião.Antes de discutir qualquer indicador, vale localizar em que célula ele está. Métrica de carga não responde pergunta de qualidade, e métrica de tempo do FL1 não responde pergunta de valor do FL3 — boa parte das discussões improdutivas sobre dados nasce de cobrar de um número uma resposta que ele não tem como dar.
Proposta preparada para discussão. Os valores numéricos são ilustrativos e serão substituídos pelo histórico real dos quadros assim que os pré-requisitos de configuração estiverem aplicados.
Referências conceituais: Métricas Ágeis — obtenha melhores resultados em sua equipe, Raphael Donaire Albino · modelo Flight Levels, Klaus Leopold · módulo de Analytics e API do BusinessMap.