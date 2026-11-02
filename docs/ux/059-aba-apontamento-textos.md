# Aba Apontamento: textos para o front (pedido 059, E2.9, trilha H1)

Textos em português do Brasil para o C1 usar. Base: `docs/ux/059-aba-apontamento.md` (seções, cartões, M-1 a M-16) e contrato zod v1 (§3.9 do plano). Nenhum nome de pessoa aqui (ADR 0020); exemplos usam "Pessoa 1", "Pessoa 2". Voz ativa, sem culpar quem lê, sem semáforo.

Convenções:
- `{n}`, `{pct}`, `{horas}` etc. são valores formatados pelo front a partir do contrato. Horas vêm em segundos e são formatadas na tela (ex.: 7,5 h). Percentual vem pronto; o front não calcula.
- Cada "Como ler" é a nota do `CartaoMetrica`. A linha "Critério" mostra a data da versão vigente de `criterios[]` quando existir (T2.6).
- Onde o texto cita regras (o1 a o4), é só o ID; a redação aprovada está no pedido e no plano.

## 1. Como ler de cada cartão

Ids sugeridos seguem o catálogo da E1.3 (`ap-kpis` etc.). Hipótese: ids exatos de `ap-distribuicao-*`, `ap-qualidade-*` e demais ficam a critério do C1, desde que únicos e estáveis.

### Seção "Quanto foi apontado e com que qualidade?"

**ap-kpis, KPIs**
- Pergunta: "Quanto foi apontado neste período?"
- Como ler: "Horas, apontamentos e pessoas que apontaram no período e nos filtros escolhidos. Horas são a soma do tempo registrado no BusinessMap, não a jornada de trabalho. 'Completos' é a parte dos apontamentos sem nenhum problema de qualidade; só aparece como percentual com 20 apontamentos ou mais."
- Critério: "Fonte: worklog do BusinessMap. O Acelerato não entra."

**ap-qualidade-geral, qualidade geral** (seção "Os apontamentos dizem o que foi feito?")
- Pergunta: "Os apontamentos descrevem o trabalho feito?"
- Como ler: "Cada apontamento pode ter mais de um problema (por exemplo, sem comentário e sem vínculo). Por isso as barras somam mais de 100%. 'Completo' significa nenhum problema encontrado. A qualidade avalia o texto do apontamento, não a pessoa nem o trabalho."
- Critério: "Classificação por palavras-chave do dicionário, revisão de {data}. É uma heurística: confira a lista antes de tirar conclusões."

**ap-qualidade-pessoa, qualidade por pessoa**
- Pergunta: "Em quais recortes os apontamentos têm menos detalhe?"
- Como ler: "Mostra, para cada pessoa, quantos apontamentos tiveram cada problema. O percentual só aparece com 20 apontamentos ou mais (o3); abaixo disso você vê só a contagem. A lista segue ordem alfabética (o1); use 'Ordenar por total' se quiser outra ordem. Não há meta nem comparação com a média."
- Critério: igual ao da qualidade geral.

### Seção "Onde o esforço apontado está sendo gasto?"

**ap-projeto, horas por projeto**
- Pergunta: "Quais projetos receberam mais horas apontadas?"
- Como ler: "Horas apontadas agrupadas pela iniciativa raiz do card. 'Projeto' aqui é só um rótulo de agrupamento das horas, não mede entrega nem esforço de conclusão. Projetos marcados 'Fora dos quadros coletados' têm a raiz em um quadro que o painel não lê; o título mostrado é o do card mais alto conhecido."
- Critério: "Hierarquia pela relação de card pai, até 10 níveis."

**ap-tipo, horas por tipo**
- Pergunta: "Em que tipos de card o tempo foi apontado?"
- Como ler: "Horas apontadas por tipo de card do BusinessMap (por exemplo, tarefa, correção). Cada barra mostra a parte do total do recorte."

**ap-subgrupo, horas por subgrupo**
- Pergunta: "Que tipo de atividade as horas descrevem?"
- Como ler: "O subgrupo vem das palavras do comentário e do tipo do card, segundo o dicionário vigente. É uma estimativa, não uma verdade: 'Não classificado' mostra apontamentos que o dicionário não reconheceu. Se esse grupo for grande, o dicionário precisa de ajuste."
- Critério: "Dicionário revisão de {data}. Mudanças aparecem como marca no gráfico."

### Seção "Os apontamentos dizem o que foi feito?" (matriz)

**ap-matriz, pessoa × categoria**
- Pergunta: "Como o tempo de cada pessoa se divide entre as categorias?"
- Como ler: "Cada linha é uma pessoa; cada coluna, uma categoria do nível escolhido (tipo, subtarefa ou subgrupo). Um nível por vez: troque o nível no seletor acima da tabela. As células mostram horas e a parte da linha. A ordem inicial é alfabética (o1); 'Ordenar por total' é escolha de quem lê. A soma da linha é o total apontado, não a jornada."

### Seção "A capacidade apontada acompanha o período?"

**ap-capacidade-mensal, capacidade mensal (equipe)**
- Pergunta: "O tempo apontado acompanha a capacidade de cada mês?"
- Como ler: "Capacidade é a soma, por pessoa, dos dias úteis do mês (sem fins de semana e feriados) vezes {horasPorDia} h. Utilização é o apontado dividido pela capacidade e pode passar de 100%. A base cobre só parte da jornada, então leia como comparação entre meses, não como ocupação total. Mês em andamento vale até {data da última coleta}."
- Critério: "Calendário revisão de {data}."

**ap-capacidade-pessoa, capacidade por pessoa**
- Pergunta: "Quanto cada pessoa apontou frente aos dias úteis do seu intervalo?"
- Como ler: "Para cada pessoa, vai do primeiro ao último apontamento do período; conta os dias úteis desse intervalo vezes {horasPorDia} h. A utilização é uma comparação relativa, sem meta, sem faixa de bom ou ruim e sem comparação com a média (o2). Quem entrou ou saiu no meio do período tem intervalo menor. Com menos de 20 apontamentos, só aparecem soma e contagem (o3)."
- Mostra o selo de leitura relativa (item 5).

### Seção "O que mais chama atenção neste período?"

**ap-achados, achados**
- Pergunta: "O que os dados deste período destacam?"
- Como ler: "Frases geradas pelos dados do recorte, por regras fixas. Cada achado aponta algo para conferir, não é um julgamento. Nenhum achado cita pessoa. Se nada se destaca, a lista aparece vazia."

### Seção "Como os apontamentos se distribuem dia a dia?"

**ap-diario, mapa de calor pessoa × dia**
- Pergunta: "Como as horas se distribuem pelos dias, por pessoa?"
- Como ler: "Cada célula é o total apontado por uma pessoa em um dia, em faixas fixas: 0 h, até 4 h, de 4 a 8 h e mais de 8 h. As faixas não mudam com a carga, então a mesma cor sempre significa a mesma faixa. Cinza neutro é fim de semana ou feriado; célula vazia com borda é dia útil sem apontamento. 'Possível erro de apontamento' marca dias acima de {limite} h. Este cartão responde só ao filtro Pessoa. Período padrão: 4 semanas."
- Acessibilidade: dica focável de cada célula: "Pessoa 1, 12/08, 6,5 horas, faixa de 4 a 8 horas".

## 2. Frase de cada código de achado

O contrato entrega `codigo`, `valores` (chaves de livre escolha do back-end, hoje `z.record`) e `rotuloRef` (rótulo de projeto, tipo ou subgrupo, nunca de pessoa). O front monta a frase. Hipótese: nomes de chave abaixo são a proposta do UX; o node-backend confirma ou ajusta e o C1 acompanha o contrato.

| Código | Frase | Chaves de `valores` (proposta) |
|---|---|---|
| `nao-classificado-alto` | "{pct}% das horas apontadas ({n} apontamentos) caíram em 'Não classificado'. O dicionário de subgrupos pode estar incompleto." | `pct`, `n` |
| `sem-comentario-alto` | "{pct}% dos apontamentos ({n}) estão sem comentário. Sem texto, não dá para saber o que foi feito." | `pct`, `n` |
| `concentracao-em-projeto` | "O projeto '{rotuloRef}' concentra {pct}% das horas apontadas no período." | `pct` (rótulo em `rotuloRef`) |
| `dias-atipicos` | "{n} dias com mais de {limite} h apontadas por uma pessoa foram marcados como possível erro de apontamento." | `n`, `limite` |
| `utilizacao-mensal-variou` | "A utilização da equipe passou de {pctAnterior}% em {mesAnterior} para {pct}% em {mes}." | `pctAnterior`, `pct`, `mesAnterior`, `mes` |

Regras de redação:
- Cada frase termina com um atalho quando houver: "Ver apontamentos" (aplica o filtro correspondente: Subgrupo = Não classificado, Qualidade = Sem comentário, Projeto = rótulo, o mapa diário) ou "Ver capacidade mensal".
- `concentracao-em-projeto`: se `rotuloRef` for nulo, usar "Um projeto". Projeto fora dos quadros coletados leva o sufixo " (fora dos quadros coletados)".
- Percentual ausente por piso de 20: o back-end não emite achado nesse caso. Se chegar `valores` sem `pct`, o front não monta a frase e descarta o achado, sem erro visível.
- Código desconhecido (versão nova do back-end): o front ignora o achado e não quebra a seção.
- Vazio: "Nenhum destaque neste período com os filtros atuais."
- Tom: afirma o fato e sugere conferir; nunca "ruim", "alerta" ou "problema da equipe".

## 3. Legenda da finalidade

Exibida de forma persistente no cabeçalho da aba (não só em dica), sob o título, em texto curto, com "Saiba mais" que abre o texto longo. Cumpre a P-7 da segurança (finalidade na legenda) e a exceção para horas apontadas.

**Texto curto (sempre visível):**
"Estas horas servem para ver capacidade, utilização e distribuição do tempo do time e de cada pessoa. Não medem esforço de entrega, velocidade, custo de card nem meta."

**Texto longo ("Saiba mais"):**
"A aba Apontamento é uma exceção à regra de que as métricas do painel não olham para pessoas. Ela existe só para entender onde o tempo apontado foi gasto e se a capacidade acompanha o período. Por isso:
- a lista de pessoas vem em ordem alfabética; ordenar por total é escolha sua;
- a utilização por pessoa não tem semáforo, faixa de bom ou ruim, nem comparação com a média;
- percentual por pessoa só aparece com 20 apontamentos ou mais;
- a aba fica fora da exportação do painel.
O comentário do apontamento não é guardado nem exibido. Os dados vêm só do BusinessMap."

Observação: a redação das quatro cláusulas aqui é a do pedido (21:30). Se o PR da exceção mudar a redação oficial, ajustar este bloco; o front deve manter as quatro linhas.

## 4. Aviso de nome real

Exibido só quando `nomesReais = true` (interruptor `APONTAMENTO_NOMES`, hoje só na máquina ou na rede local do dono). Faixa fixa no topo da aba, com ícone e texto (nunca só cor), `role="status"`, não dispensável.

**Faixa:** "Esta tela mostra nomes reais de pessoas. Não compartilhe prints, links com filtro nem o conteúdo da tela fora de quem deve vê-lo."

**Detalhe (expansível):** "Nomes aparecem porque o ambiente está configurado para isso (máquina ou rede local sob controle do responsável). Os dados servem à finalidade descrita acima. Para pedir a retirada dos seus dados, fale com o responsável pelo painel."

**Quando `nomesReais = false`:** nenhuma faixa de nome real. Em vez dela, uma linha discreta ao lado do filtro Pessoa: "Pessoas aparecem como 'Pessoa 1', 'Pessoa 2'..." Isso evita a leitura de que o painel está com defeito. Pessoa sem de-para: "Pessoa não identificada" (CA-10), com a dica "Não foi possível ligar este apontamento a uma pessoa. Ele não é somado a outra."

**Regras de UX para o front (derivam de AP-8 e das decisões da segurança):** filtro de Pessoa na URL guarda só `pessoaRef`, nunca o nome; não persistir pessoa em `localStorage`; a faixa não pode ser ocultada pela preferência "Ocultar cartões".

## 5. Selo de leitura relativa

Ligado a `capacidade.leituraRelativa = true`; sempre visível em utilização por pessoa e mensal, nunca como dica só ao passar o mouse. Ícone de informação mais texto (não depende de cor), cor neutra (sem verde, amarelo ou vermelho).

- **Selo (texto fixo):** "Comparação relativa; não é jornada total"
- **Dica ao foco ou toque (texto longo):** "O apontamento cobre só parte da jornada. Por isso a utilização serve para comparar períodos, não para medir quanto alguém trabalhou. Pode passar de 100%."
- **Valor sem base suficiente (o3):** em lugar do percentual: "Amostra insuficiente: {n} apontamentos (mínimo 20)", mantendo soma de horas e contagem. Reaproveita `AmostraInsuficiente`.
- **Sem meta:** nenhum texto de meta, nenhuma faixa "bom/ruim", nenhuma referência à média (o2). O texto de apoio ao valor é só "Utilização: {pct}%".

## 6. Textos complementares (estados e controles)

Para o C1 não improvisar; todos reaproveitam o padrão do painel.

| Onde | Texto |
|---|---|
| Selo de frescor, atrasado | "Atrasado: última coleta há {n} h" |
| Selo de frescor, sem coleta | "Sem coleta até agora" |
| Período dos dados | "Dados de {AAAA-MM-DD} a {AAAA-MM-DD}" |
| Vazio (recorte sem apontamento) | título "Nenhum apontamento encontrado"; corpo "Nenhum apontamento atende aos filtros atuais."; botões "Limpar filtros" e "Remover filtro {nome}" |
| Erro por cartão | "Não foi possível carregar este cartão. Seus filtros foram mantidos." + botão "Tentar de novo" |
| Carregando | "Carregando apontamentos" (anunciado em `aria-live`, esqueleto sem salto) |
| Amostra insuficiente (geral) | "Amostra insuficiente: {n} apontamentos. O percentual aparece com 20 ou mais." |
| Matriz, seletor de nível | rótulo "Agrupar por"; opções "Tipo", "Subtarefa", "Subgrupo" |
| Subtarefa, enquanto o dicionário fechado não existe | opções "Em subtarefa" e "Direto no card" |
| Ordenação | rótulo "Ordem"; opções "Alfabética (padrão)" e "Total de horas (maior primeiro)" |
| Anomalia, marca | "Possível erro de apontamento" (texto e ícone) |
| Anomalia, filtro | "Ocultar possíveis erros" (desligado por padrão: marcar e manter na soma) |
| Anomalia, dica | "Mais de {limite} h apontadas por uma pessoa em um dia. O valor foi mantido na soma e marcado para conferência." |
| Filtro Pessoa | rótulo "Pessoa que apontou" |
| Flags de qualidade | "Sem comentário", "Comentário genérico", "Sem vínculo claro", "Card sem iniciativa", "Possível erro de apontamento", "Completo" |
| Mudança de critério (T2.6), marca no gráfico | "Critério mudou em {data}: {descrição curta}" |
| Não classificado, atalho | "Ver apontamentos não classificados" |
| Exportação | não há botão de exportar nesta aba (o4); nenhum texto de exportação |

## 7. Pendências e hipóteses

- Chaves de `valores` dos achados (item 2): proposta do UX; confirmar com o node-backend. Hipótese até lá.
- Redação das cláusulas o1 a o4 e da finalidade (item 3): copia a registrada às 21:30 no pedido; mudar junto com o texto oficial da exceção (PR da E1.7).
- Rótulo "Card sem iniciativa" (Q-A8) e "Fora dos quadros coletados" (Q-A7) seguem as recomendações aceitas em bloco.
- A faixa do mapa diário usa os quatro rótulos do contrato (`zero`, `ate-4h`, `4h-a-8h`, `mais-de-8h`); a legenda mostra "0 h", "até 4 h", "4 a 8 h", "mais de 8 h".
- Texto de contato para eliminação de dados (item 4): "responsável pelo painel" é genérico; o dono define o canal quando o prazo e a base legal passarem pelo DPO.
