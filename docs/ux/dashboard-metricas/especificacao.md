# Dashboard de métricas ágeis do DSPD (versão com dados fictícios)

Especificação de UX · revisão 4 · 2026-10-10 · autor: `ux-designer`
Pedido de origem: `docs/pedidos/001-dashboard-mock.md`. Fonte das regras: `CLAUDE.md` e `docs/briefing-execucao-metricas.md` (em conflito, vale o briefing).

## Revisão 4 (2026-10-10) — mudanças
Origem: desvio aceito no parecer B3; só registra o que o código já faz.
- **Parâmetros de URL das abas** (rev. 4): a aba ativa de um cartão com abas fica na URL, para o link copiado reabrir a mesma visão. Um parâmetro por cartão: `ei_fl1` (EI-FL1, tipo de demanda), `ei_fl2` (EI-FL2), `ei_fl3` (EI-FL3, tipo de projeto), `ei_sust` (EI-SUST, prioridade P1 a P5), `s4` (S4) e `e1` (E1, tipo de projeto). O valor é o identificador da aba.
- Regras: valor ausente ou inválido cai na primeira aba, em silêncio; parâmetro de painel onde o cartão não existe é ignorado e removido da URL, mas fica guardado na sessão (mesma regra de 2.5 e 2.6); trocar de aba atualiza a URL sem nova entrada no histórico; "Limpar filtros" não zera as abas (não são filtros). Estes parâmetros entram em "Copiar link desta visão".
- Critério de aceite 112 (novo): abrir uma URL com `ei_fl1`, `ei_fl2`, `ei_fl3`, `ei_sust`, `s4` ou `e1` válidos mostra a aba correspondente selecionada; valor inválido mostra a primeira aba sem erro.

## Revisão 3 (2026-10-09) — mudanças
Origem: `docs/alinhamentos/2026-10-09-decisoes-review-fase-a.md` e review da fase A. Marcadas com "(rev. 3)". Provisórias e reversíveis.
- **EI segmentado por tipo** (Q4): EI-FL1 por tipo de demanda e EI-FL3 por tipo de projeto, um tipo por vez (abas), nunca mediana misturada. Cada tipo com < 20 itens mostra "Amostra insuficiente". Ver 4.EI.
- **EI-SUST por prioridade** (Q2): P1 a P5, uma por vez (abas). Substitui o "Prioridade não afeta".
- **Q1 decidida:** a Visão geral mostra, por nível, o tipo (ou prioridade) com maior índice entre os que têm amostra, nomeado, com link ao cartão. Ver 3.1.
- **T5** em ordem neutra por volume (confirmado, sem mudança de regra); **tema** como `select` (M9 aceito).
- Nova seção "Faça / não faça" (final do documento) e checklist por cartão em `docs/ux/checklist-cartao.md`.

## Revisão 2 — mudanças
A numeração dos critérios de aceite foi preservada: os critérios 6, 24, 25, 26, 31, 52, 55, 62, 66, 72, 78 e 94 foram editados no lugar; os critérios 105 a 111 são novos e estão no fim da seção 10. Mudanças marcadas com "(rev. 2)" no texto.

**Decisões do tech lead**
- **J1, janela única de 12 semanas.** Percentis usam 12 semanas em todas as granularidades (story, frente, projeto, chamado). Some o "12 meses (provisória)". A janela é um parâmetro único no código; a pergunta 2 segue aberta. "Amostra insuficiente" em E1, EI-FL3 e, possivelmente, T7 e EI-FL2 é estado normal, com texto próprio (nova seção 6.3.1). Alterados: 4.0.3, 2.2, T7, E1, EI, 7.3, 9.2, critérios 52, 55, 78, pergunta 2.
- **J2, sustentação em horas úteis.** Todas as prioridades (inclusive P1) em horas úteis; dia útil = 8 horas úteis (seg a sex, 8h às 12h e 13h às 17h, feriados nacionais, fuso -03:00). Exibição: horas úteis em P1 a P3, dias úteis em P4 e P5, sem minutos e sem horas corridas; EI da Sustentação em horas úteis. Alterados: 4.0.4, S1, S4, EI, 7.3, critérios 62 e 72, perguntas 11 e 15.

**Lacunas do QA** (L1 e L2 correspondem a J1 e J2)
- L3: domínio fechado de S6 corrigido para os cinco valores do briefing 3.4 (S6, critério 66).
- L4: O12 passa a ficar só na seção "Compromissos" da cadência semanal; âncoras das seções definidas (3.3, critério 31).
- L5: convenção de `data-testid` completada: `BLOQUEADOS`, `EI-{NIVEL}`, `{nivel}`, slugs, chave do tema, nome do seletor de tema (seção 10, abertura).
- L6: aviso de consolidação sempre que o resultado soma 2 ou mais equipes, inclusive "Todas" (2.1, critério 25).
- L7 e L8: parâmetro não aplicável ao painel é ignorado em silêncio e removido da URL, mas fica guardado na sessão e volta ao navegar (2.5, 2.6, critérios 6 e 24, critério 107).
- L9: tabela 2.2 cobre EI por nível, "Bloqueados agora" e S1 a S7.
- L10: T5 sem ranking: ordem por volume de demanda, selo só em sistemas (T5, critério 108).
- L12: T4 usa a soma de chegadas e saídas da classe, sem interrogação (T4, pergunta 20).
- L13: parâmetro `mock` completamente definido (6.6, critério 109).
- L14: texto explícito de que Incidente e Requisição do BusinessMap não têm relação com chamados do Acelerato (2.1, 7.5).
- L15: início do histórico no período personalizado vem da fonte de dados (2.3, critério 26).
- L11: requisito do mock registrado em 9.2. L16: critério de axe confirmado (critério 94, com relato das violações moderadas e leves, critério 111).

## Objetivo
Entregar painéis que pessoas não técnicas em métricas de fluxo (gerente, coordenadores, times) consigam ler sem treinamento: cada gráfico responde a uma pergunta escrita na tela, mostra de quantos itens vem o número, diz como ler e o que fazer, e nunca expõe pessoas. A versão usa dados fictícios para validar a experiência com as áreas antes da coleta real.

## Personas e contexto de uso
Nenhuma persona usa o sistema para avaliar pessoas; o sistema não tem visão individual.

| Persona | Quer saber | Cadência | Dispositivo e situação |
|---|---|---|---|
| Time / líder técnico (FL1) | "Qual item mais velho não andou desde ontem?" | Diária (15 min) e semanal | Notebook ou TV da sala em reunião em pé; leitura em segundos |
| Coordenador (FL2) | "Estamos cumprindo o que publicamos? O que entra e o que sai da fila?" | Quinzenal e mensal | Notebook; reunião com áreas, às vezes projetado |
| Gerente (FL3) | "Estamos terminando ou só começando? O que entregamos mudou o negócio?" | Mensal e trimestral | Notebook e eventualmente celular, para consulta |
| Líder da sustentação | "Cumprimos os prazos por prioridade? Por que escalamos?" | Semanal e mensal | Notebook |
| Quem recebe um link | Abrir exatamente a visão que foi compartilhada | Eventual | Qualquer tela |

Desktop é o contexto principal; tablet e celular são para consulta (tudo precisa funcionar, mas o desenho otimiza o desktop).

## Princípios de design
1. **Primeiro o que pede ação, depois o detalhe.** Cada painel abre com uma faixa "Pede atenção" e só então os gráficos.
2. **Cada gráfico é uma pergunta.** O título é curto; a pergunta aparece logo abaixo, em linguagem do dia a dia.
3. **Número nunca sozinho.** Todo número vem com base amostral, unidade, janela e (quando houver) meta.
4. **Leitura em uma frase.** Cada cartão traz uma frase gerada a partir dos dados ("2 itens estão acima do P95"), para quem não sabe ler o gráfico.
5. **Honestidade estatística.** Percentis 50/85/95 com a mediana sempre ao lado; média nunca sozinha; abaixo de 20 itens a estatística some e a base é declarada.
6. **Sem pessoas.** Nenhuma tela, tabela, tooltip ou filtro mostra responsável, agente ou ranking de pessoas. Equipe é recorte, nunca eixo, cor, coluna ou comparação.
7. **Fontes separadas.** BusinessMap e Acelerato nunca aparecem no mesmo gráfico, cálculo ou eixo; cada cartão carrega o selo da fonte.
8. **Cliente e time juntos.** Visões de espera do cliente e do time nunca aparecem isoladas.
9. **Cor nunca é o único canal.** Todo estado tem ícone, texto ou padrão.
10. **Estado compartilhável.** Filtros e seletores locais vivem na URL.

## Suposições
- Sem login, sem permissões, sem gravação: tudo é leitura. "Sem permissão" não se aplica nesta etapa.
- Há uma **data de corte** fixa do mock (a "data de hoje" do gerador), exibida como "Dados até DD/MM/AAAA". Toda janela é calculada a partir dela. O gerador produz 12+ meses de histórico antes dela.
- Os nomes de equipes, sistemas, projetos, frentes e cards são fictícios e **sem nomes de pessoas**. O campo `responsaveis` do modelo existe no mock, mas **nenhuma tela o lê**.
- Portal em português do Brasil (`lang="pt-BR"`), números `1.234,5`, datas `DD/MM/AAAA`, fuso `America/Sao_Paulo`.
- Dia útil e expediente vêm da biblioteca de cálculo; a interface só rotula a unidade ("dias úteis", "horas úteis"). (rev. 2) Calendário do plano técnico: expediente de segunda a sexta, das 8h às 12h e das 13h às 17h; feriados nacionais; fuso -03:00; **1 dia útil = 8 horas úteis**. Valores provisórios; ver pergunta em aberto 15.
- As metas citadas vêm do briefing (seção 6); nenhum valor de exemplo do briefing é usado como baseline.

## Decisões de UX registradas
| # | Decisão |
|---|---|
| D1 | Navegação superior com 6 destinos; filtros ficam em barra própria abaixo do cabeçalho do painel, não em menu lateral. |
| D2 | Filtros de fluxo (equipe, tipo, sistema, período) são compartilhados entre Operacional, Tático e Estratégico via URL; Sustentação tem filtros próprios e nunca herda os do fluxo. |
| D3 | Cada painel mostra só os filtros que se aplicam a ele. Dentro de um painel, o cartão informa quando um filtro não o afeta. |
| D4 | Filtros aplicam na hora, sem botão "Aplicar" (exceto datas personalizadas). |
| D5 | Segmentação por tipo de demanda é feita por **seletor local** (abas) dentro do cartão, uma classe por vez, para nunca misturar distribuições. |
| D6 | Equipe múltipla = soma consolidada. Nenhum gráfico quebra por equipe. O1 por coluna só com uma equipe selecionada. |
| D7 | "Bloqueados agora" aparece como lista dentro da visão diária, junto de O1 e O2 (não é a métrica catalogada "bloqueios por causa"). Ver pergunta 4. |
| D8 | Percentis (e qualquer distribuição) somem abaixo de 20 itens; pontos individuais e contagens absolutas permanecem. Ver pergunta 3. |
| D9 | Meses e semanas incompletos ficam marcados com padrão e rótulo "em andamento" e não entram em estatística. |
| D10 | Status "Dentro da meta / Fora da meta" só existe quando a meta do briefing é numérica; nas demais o cartão mostra a meta como texto neutro. |
| D11 | Nota metodológica é um bloco expansível dentro do cartão (não modal), sempre com as mesmas cinco seções. |
| D12 | O aviso de dados fictícios é um selo fixo no cabeçalho e um texto no rodapé; não pode ser dispensado. |
| D13 | Sem filtro nem visão por agente na sustentação (o briefing T5.1 cita "agente"; recusado por risco de avaliação individual). Ver pergunta 17. |

---

## 1. Arquitetura de informação e navegação

### 1.1 Mapa e rotas
| Destino | Rota | Fonte | Para quem / cadência | Pergunta central |
|---|---|---|---|---|
| Visão geral (entrada) | `/` | BusinessMap e Acelerato, em blocos separados | Todos | "O que pede atenção agora?" |
| Operacional (FL1) | `/operacional` | BusinessMap | Times · diária e semanal | "O trabalho está fluindo?" |
| Tático (FL2) | `/tatico` | BusinessMap | Coordenadores · quinzenal e mensal | "O projeto está avançando de verdade, e no ritmo previsto?" |
| Estratégico (FL3) | `/estrategico` | BusinessMap | Gerente · mensal e trimestral | "Estamos fazendo as apostas certas, e elas estão terminando?" |
| Sustentação | `/sustentacao` | Acelerato | Líder da sustentação · semanal e mensal | "Estamos atendendo e restaurando dentro do combinado?" |
| Espera invisível | `/espera-invisivel` | BusinessMap (3 níveis) e Acelerato (bloco separado) | Todos | "Quanto do tempo do solicitante acontece fora da nossa gestão?" |
| Ajuda | `/ajuda` | n/a | Todos | Como ler, regras de uso, glossário e mudanças de critério |
| Não encontrada | qualquer outra | n/a | n/a | Página 404 com link para a Visão geral |

Âncoras: cada cartão tem `id` estável em minúsculas (`#o2`, `#t9`, `#s1`, `#ei-fl1`), usado pelos atalhos "Ir para" e pela Visão geral. (rev. 2, L5) Ids: o código em minúsculas; "Bloqueados agora" é `#bloqueados`; os cartões de Espera invisível são `#ei-fl1`, `#ei-fl2`, `#ei-fl3` e `#ei-sust` (um por nível, o mesmo id em `/espera-invisivel` e no painel do nível). Abrir uma URL com âncora rola até o cartão e coloca o foco no título do cartão.

### 1.2 Navegação global
```
+--------------------------------------------------------------------------------+
| [Pular para o conteúdo]   (primeiro elemento focável)                          |
+--------------------------------------------------------------------------------+
| Métricas DSPD   Visão geral | Operacional | Tático | Estratégico | Sustentação |  [Dados fictícios] [Tema ◐] [Ajuda ?]
|                             Espera invisível                                   |
+--------------------------------------------------------------------------------+
```
- ≥1024px: navegação horizontal; item atual com `aria-current="page"`, sublinhado e peso de fonte maior (não só cor).
- <1024px: botão "Menu" abre uma gaveta (diálogo com foco preso, Esc fecha, foco volta ao botão).
- (rev. 3, M9) O seletor de tema é um `select` nativo com label visível "Tema" e opções "Automático (sistema)", "Claro", "Escuro"; muda ao selecionar, sem botão de ciclar.
- O selo "Dados fictícios", o seletor de tema e "Ajuda" ficam sempre visíveis no cabeçalho, nesta ordem e neste lugar em todas as telas (WCAG 3.2.6).
- Rodapé: "Dados fictícios gerados para validar a experiência. Nenhum número representa a operação real. Dados até DD/MM/AAAA." + links para Ajuda e Regras de uso.
- Os links de navegação entre painéis de fluxo (Operacional, Tático, Estratégico, Espera invisível) **carregam os filtros de fluxo** (equipe, tipo, sistema, período); o link para Sustentação e para a Visão geral é sempre limpo. (rev. 2, L7) Os links são montados a partir dos **filtros de fluxo da sessão** (guardados em memória, não em `localStorage`), e não só da URL do painel de origem; ver 2.6.
- Para quem pergunta "qual reunião?": a Visão geral traz o bloco "Por reunião" com atalhos (1.4).

### 1.3 Cabeçalho de cada painel
```
Operacional                                       Dados até 09/10/2026 · Fonte: BusinessMap
O trabalho está fluindo? Para times · diária e semanal           [Copiar link]
```
- `h1` com o nome do painel; subtítulo com a pergunta central e o público/cadência.
- "Copiar link" copia a URL atual (com filtros) e anuncia "Link copiado" (região `role="status"`); se a Clipboard API falhar, abre o texto da URL selecionado num campo.
- Sob o cabeçalho: barra de filtros (seção 2), faixa "Pede atenção", e as seções.

### 1.4 Jornadas principais
1. **Daily do time (15 min):** abre `/operacional` (cadência diária por padrão) → lê a faixa "Pede atenção" → olha "Itens para olhar primeiro" (O2) → "Bloqueados agora" → O1 → decide quem destrava o quê. Alternativo: filtra pela equipe antes de projetar a tela; copia o link para fixar a visão.
2. **Revisão de fluxo semanal:** `/operacional?cadencia=semanal` → O3 ("o que mudou na nossa distribuição de tempo?") → O9 → O4 → O12 → O10 → O7 → O15 → O18 (a ordem da tela, 3.3).
3. **Reunião de serviço e reposição (quinzenal):** `/tatico` → seções na ordem T2, T1, T5 (cumprindo o publicado) e T4, T3 (o que entra/sai) e T9, T7 (projetos).
4. **Revisão de portfólio mensal e estratégica trimestral:** `/estrategico` → E1, E2, E3.
5. **Sustentação semanal:** `/sustentacao` → S2 e S1 (prazos) → S3 → S4 → S5, S6, S7.
6. **Gerente que só quer o panorama:** `/` → "O que pede atenção agora" → cartão do nível → "Abrir painel".
7. **Quem recebe o link:** abre a URL; vê os filtros aplicados em chips legíveis; "Limpar filtros" volta ao padrão; filtros inválidos do link são ignorados com aviso (2.6).
8. **Fluxos de erro:** falha de um cartão não derruba a página (6.4); rota inexistente → 404; URL com filtro inválido → aviso e fallback.

Bloco "Por reunião" (Visão geral), usando as perguntas da T6.1:
| Reunião | Pergunta fixa | Abre em |
|---|---|---|
| Daily de fluxo | Qual item mais velho não andou desde ontem? | `/operacional?cadencia=diaria` |
| Revisão de fluxo semanal | O que mudou na nossa distribuição de tempo? | `/operacional?cadencia=semanal` |
| Reunião de serviço | Estamos cumprindo o que publicamos? | `/tatico#t2` |
| Reposição e priorização | O que entra, e o que sai da fila para isso caber? | `/tatico#t4` |
| Revisão de portfólio | Estamos terminando ou só começando? | `/estrategico#e1` |
| Revisão estratégica | O que entregamos mudou algum número do negócio? | `/estrategico#e3` |

---

## 2. Filtros

### 2.1 Quais filtros, onde e com que padrão
| Filtro | Valores | Padrão | Seleção | Operacional | Tático | Estratégico | Espera invisível (fluxo) | Sustentação |
|---|---|---|---|---|---|---|---|---|
| Equipe (BusinessMap) | equipes da base | Todas (consolidado) | múltipla | sim | sim | **não** | sim | n/a |
| Tipo de demanda | Incidente, Requisição, Melhoria, Bug interno, Defeito em produção, Dívida técnica | Todos | múltipla | sim | sim | **não** | sim (FL1/FL2) | n/a |
| Sistema | sistemas da base (Protheus, Fluig, Senior, marketing, 5G...) | Todos | múltipla | sim | sim | sim | sim | n/a |
| Período | ver 2.3 | 12 semanas (Estratégico: 12 meses) | única | sim | sim | sim | sim | n/a |
| Equipe (Acelerato) | SSSC TOTVS, SSSC SENIOR, SSSC FLUIG | Todas as três | múltipla | n/a | n/a | n/a | n/a | sim |
| Prioridade | P1, P2, P3, P4, P5 | Todas | múltipla | n/a | n/a | n/a | n/a | sim |
| Período (sustentação) | ver 2.3 | 6 meses | única | n/a | n/a | n/a | n/a | sim |

Regras:
- **Estratégico não tem filtro de equipe nem de tipo.** Projetos atravessam equipes e a granularidade é projeto. A barra mostra um ícone "i" com a explicação: "O nível estratégico olha projetos, que envolvem várias equipes. Por isso não há filtro por equipe."
- "Iniciativa" não aparece na lista de tipos dos filtros de FL1/FL2 (é tipo de projeto, FL3). Ver pergunta 9.
- Tipos de sustentação (Incidente, Requisição) no fluxo são cards do **BusinessMap**. O filtro de tipo traz a dica: "Aqui são cards do BusinessMap. Chamados do Acelerato estão no painel Sustentação." (rev. 2, L14) **Incidente e Requisição do BusinessMap são só tipos de card do fluxo; não têm relação com os chamados do Acelerato.** Os dois sistemas nunca se cruzam; um número de um não explica nem completa o do outro. A dica do filtro e o glossário da Ajuda (7.5) dizem isso.
- **Equipe é recorte, nunca comparação:** com 2 ou mais equipes no resultado os números são consolidados; nenhum gráfico, tabela, legenda ou tooltip usa equipe como série, cor, faceta ou coluna. (rev. 2, L6) O texto fixo "Resultado consolidado de N equipes. O sistema não compara equipes." aparece **sempre que o resultado soma 2 ou mais equipes**: seleção de 2 ou mais, "Todas" (padrão) e todas marcadas, com N igual ao número real de equipes somadas (ex.: 6 no fluxo, 3 em `/sustentacao`). Com uma só equipe o texto não aparece. Fica numa linha logo abaixo da barra de filtros (`aviso-consolidado`). No Estratégico não aparece (não há filtro de equipe); em `/espera-invisivel` vale para os três primeiros blocos e o bloco de Sustentação traz o seu próprio, com as equipes SSSC.
- Selecionar todos os valores equivale a "Todos" (a URL omite o parâmetro).
- Sustentação nunca tem gráfico por equipe SSSC; o filtro só recorta. Prioridade é dimensão legítima (S1, S2, S3).

### 2.2 Aplicabilidade por métrica
`E` equipe, `T` tipo, `S` sistema, `P` período. Entre parênteses, como o período atua: **série** (intervalo do eixo X), **janela** (as 12 semanas até o fim do período, para percentis), **ref** (apenas define a data de referência de um retrato do momento).

| Métrica | E | T | S | P |
|---|---|---|---|---|
| O1 | sim | sim | sim | série + ref |
| O2 | sim | sim | sim | ref (retrato) + janela (percentis) |
| Bloqueados agora | sim | sim | sim | ref (retrato na data final do período; não usa janela nem série) |
| O3 | sim | sim | sim | janela (pontos e percentis) + série (evolução do P85) |
| O4 | sim | sim | sim | série + janela (faixa) |
| O7 | sim | sim | sim | série (mínimo 6 meses) |
| O9 | sim | sim | sim | janela + série |
| O10 | sim | sim | sim | ref (retrato) + série (evolução) |
| O12 | sim | **não** | sim | série |
| O15 | sim | **não** (é sobre bugs) | sim | série |
| O18 | sim | **não** | sim | série |
| T1, T2, T4 | sim | sim | sim | janela / série |
| T3 | sim | **não** (a natureza é a dimensão) | sim | série |
| T5 | sim | sim | **não** (sistema é a dimensão); recorte por área também é dimensão | janela / série |
| T7 | sim | **não** | sim | ref + janela |
| T9 | sim | **não** | sim | ref |
| E1 | **não** | **não** | sim | série (pontos no período) + janela de 12 semanas (percentis) |
| E2, E3 | **não** | **não** | sim | série (trimestres) / retrato (E3) |
| EI-FL1 (Operacional semanal e `/espera-invisivel`, bloco 1) | sim | **tipo é dimensão (abas, um por vez; rev. 3)** | sim | janela de 12 semanas (índice) + série mensal (evolução) |
| EI-FL2 (Tático e bloco 2) | sim | **não** (tipos são de story) | sim | janela de 12 semanas + série mensal |
| EI-FL3 (Estratégico e bloco 3) | **não** | **tipo de projeto é dimensão (abas; rev. 3)** | sim | janela de 12 semanas + série mensal |
| EI-SUST (Sustentação e bloco 4) | equipe SSSC | n/a | n/a | janela de 12 semanas + série mensal; **Prioridade é dimensão (rev. 3): abas P1 a P5, uma por vez**; filtros próprios da sustentação |
| S1 a S3 | equipe SSSC (recorte) | n/a | n/a | **Prioridade é dimensão** (limita as linhas/segmentos); período = série |
| S4 a S7 | equipe SSSC (recorte) | n/a | n/a | Prioridade recorta os chamados; período = série |

(rev. 2, L9) Colunas E, T, S e P valem para os filtros do fluxo; nas linhas de Sustentação "E" é a equipe SSSC e "P" é o período. Em EI o período escolhido define a série mensal; o índice sempre usa a janela de 12 semanas até o fim do período (J1). Na Visão geral não há filtros: nenhum chip de filtro aparece.

Quando um filtro ativo **não** atua em um cartão, o rodapé do cartão mostra o chip "Não afetado por: Tipo de demanda" (texto + ícone). Quando atua, mostra "Filtros aplicados: Equipe Protheus · Sistema Fluig".

### 2.3 Período
Opções (rádio, uma por vez): `Últimas 4 semanas` · `Últimas 12 semanas` · `Últimos 6 meses` · `Últimos 12 meses` · `Personalizado` (dois campos de data: "De" e "Até").
- Todos os períodos terminam na data de corte, exceto o personalizado.
- **Janela dos percentis:** sempre 12 semanas (84 dias corridos) terminando no último dia do período, independentemente de o período ser menor ou maior. Quando o período difere de 12 semanas, os cartões de percentil mostram o selo "Janela fixa: 12 semanas" com tooltip "Os percentis usam sempre as últimas 12 semanas do período escolhido." Ver pergunta 14.
- Semana = segunda a domingo. A semana (ou o mês) corrente é "em andamento": desenhada com padrão listrado e rótulo, fora de estatísticas.
- (rev. 2) **No Estratégico só valem `Últimos 6 meses` e `Últimos 12 meses`** (projetos e trimestres não cabem em 4 ou 12 semanas); as demais opções não aparecem nesse painel. Um `periodo` de outro painel que o Estratégico não aceita é tratado como não aplicável (2.6).
- Validação do personalizado: "De" ≤ "Até"; "Até" ≤ data de corte; "De" ≥ início do histórico; intervalo mínimo de 7 dias. (rev. 2, L15) **O início do histórico vem da fonte de dados** (menor data com dados da fonte do painel: BusinessMap no fluxo, Acelerato na Sustentação, entregue pela camada de dados junto das opções de filtro); a interface nunca escreve essa data no código. A data "01/08/2025" abaixo é só exemplo. Erros em texto junto dos campos (3.3.1) e `aria-describedby`; o botão "Aplicar período" fica ativo, mas o aplicar com erro mantém o período anterior.
- Mensagens: "A data inicial precisa ser anterior à data final.", "A data final não pode passar de 09/10/2026 (data dos dados).", "Há dados a partir de 01/08/2025. Escolha uma data a partir dela.", "Escolha um intervalo de pelo menos 7 dias."

### 2.4 Comportamento
- Controle: botão com rótulo visível "Equipe: Todas ▾" que abre um popover com lista de caixas de seleção (`checkbox`), botão "Limpar" e "Fechar". Esc fecha e devolve o foco ao botão. Clique fora fecha.
- Aplica na hora a cada marcação; a região `aria-live="polite"` anuncia "Filtros atualizados. Equipe: Protheus e Fluig."
- Ordem na barra: Equipe, Tipo de demanda, Sistema, Período; depois "Limpar filtros".
- Barra fixa ao rolar (sticky) em ≥768px; altura ≤ 64px; `scroll-padding-top` iguala a altura do cabeçalho + barra para o foco nunca ficar escondido (WCAG 2.4.11). Em <768px a barra não é fixa e se resume ao botão "Filtros (2)" que abre uma folha (diálogo) com os mesmos controles e o botão "Ver resultados".
- Abaixo da barra, **chips dos filtros ativos** ("Equipe: Protheus ✕", "Período: Últimas 4 semanas ✕"). Cada chip tem botão de remover com rótulo "Remover filtro Equipe: Protheus". Só aparecem filtros fora do padrão.
- **Limpar filtros:** botão visível apenas se algum filtro estiver fora do padrão; volta tudo ao padrão do painel (inclusive período) e anuncia "Filtros limpos."
- Mudar filtro atualiza a URL com `history.pushState` (o botão Voltar desfaz a última mudança). Mudar vários filtros dentro do mesmo popover conta como uma mudança só.
- O filtro de sustentação é independente: trocar de painel não o carrega para o fluxo.

### 2.5 Parâmetros de URL
Só valores fora do padrão entram na URL. Vários valores separados por vírgula, em minúsculas e sem acento.
| Parâmetro | Valores | Painéis |
|---|---|---|
| `equipe` | slugs das equipes (fluxo) · em `/sustentacao`: `totvs`, `senior`, `fluig` | fluxo e sustentação |
| `tipo` | `incidente`, `requisicao`, `melhoria`, `bug-interno`, `defeito-producao`, `divida-tecnica` | Operacional, Tático, EI |
| `sistema` | slugs dos sistemas | fluxo |
| `prioridade` | `p1`..`p5` | Sustentação |
| `periodo` | `4s`, `12s`, `6m`, `12m`, `custom` (com `de` e `ate` em `AAAA-MM-DD`) | todos |
| `cadencia` | `diaria` (padrão), `semanal` | Operacional |
| `o2`, `o3`, `o7`, `o9`, `o10`, `t1`, `t2`, `t4`, `t5` | slug do tipo ou classe escolhido no seletor local do cartão | respectivos cartões |
| `s3` | `abs` (padrão) ou `prop` | Sustentação |
| `s5`, `s6` | `distribuicao` (padrão) ou `evolucao` | Sustentação |

Padrão do período: `12s` no Operacional e no Tático; `12m` no Estratégico; `6m` na Sustentação. Exemplo: `/operacional?cadencia=semanal&equipe=erp-protheus,fluig&tipo=melhoria&o3=melhoria`.
O alternador "Ver como tabela" não vai para a URL.

(rev. 2, L5) **Slugs do mock** (minúsculas, sem acento, hífen; a lista real vem da fonte de dados e o front não os fixa no código):
- Equipes do fluxo: `erp-protheus`, `fluig`, `senior`, `marketing-vendas`, `dados`, `plataforma-5g`. Rótulos: ERP Protheus, Fluig, Senior, Marketing e Vendas, Dados, Plataforma 5G.
- Sistemas: `protheus`, `fluig`, `senior`, `crm`, `site-marketing`, `data-lake`, `core-5g`, `portal-cliente`.
- Equipes SSSC (Sustentação): `totvs`, `senior`, `fluig`.
- Os valores `{nivel}` dos testids de Espera invisível: `fl1`, `fl2`, `fl3`, `sust`.

### 2.6 URL inválida
Valor desconhecido (equipe removida, tipo mal escrito, data inválida) é **ignorado**, o resto da URL vale, e aparece um aviso no topo do painel (`role="status"`): "Alguns filtros do link não existem e foram ignorados: equipe "xyz". [Entendi]". A URL é corrigida com `replaceState`.

### 2.6.1 Parâmetro conhecido, mas não aplicável ao painel (rev. 2, L7 e L8)
Há dois casos diferentes, tratados de forma diferente:
| Caso | Exemplo | Comportamento |
|---|---|---|
| **Inválido**: o valor não existe | `equipe=xyz`; `equipe=totvs` no fluxo; `equipe=erp-protheus` em `/sustentacao` | Ignorado, com o aviso de 2.6 e URL corrigida. |
| **Não aplicável**: o parâmetro existe no sistema, mas o painel não o usa | `equipe=` e `tipo=` no Estratégico; `periodo=4s` no Estratégico; `prioridade=` em qualquer painel de fluxo; `tipo=`, `sistema=` ou `s3=` em `/sustentacao`; `cadencia=` fora do Operacional; seletor local (`o3=`, `t1=`...) em outro painel | **Ignorado em silêncio** (sem aviso de erro) e **removido da URL do painel de destino** com `replaceState`; o painel não mostra chip nem filtro para ele. |

Regra de memória (só para os filtros de fluxo `equipe`, `tipo`, `sistema`, `periodo`): o front guarda em memória da sessão (não em `localStorage`; recarregar a página zera) os últimos valores de filtros de fluxo escolhidos ou recebidos por URL. Os links entre painéis de fluxo são montados com esses valores. Assim, quem vai do Operacional (com `equipe=fluig`) ao Estratégico e volta encontra `equipe=fluig` de novo; no Estratégico a URL fica limpa dos parâmetros que ele não usa. Se o usuário muda um filtro de fluxo no Estratégico (`sistema`, `periodo`), o valor novo atualiza a memória. `prioridade` e os filtros da Sustentação **não** entram nessa memória (D2: a Sustentação é independente).
- Quando o Estratégico tem na memória valores de `equipe` ou `tipo`, mostra sob a barra de filtros, com o ícone "i", o texto: "Equipe e Tipo de demanda não se aplicam ao nível estratégico. Seus filtros foram guardados e voltam quando você abrir outro painel de fluxo." (`aviso-filtros-nao-aplicaveis`). Sem valores guardados, o texto não aparece.
- `periodo` explícito vindo do Operacional ou do Tático vale no Estratégico só se for `6m` ou `12m`; os demais (`4s`, `12s`, `custom`) ficam guardados e o Estratégico usa o padrão `12m`. Ao voltar ao fluxo, o período guardado volta junto. `periodo` ausente na URL significa "padrão de cada painel" (12s no fluxo, 12m no Estratégico) e não é propagado.
- Um link compartilhado que abre o Estratégico com `equipe=` ou `tipo=` segue a mesma regra: parâmetros ignorados e removidos, sem aviso de erro e sem chip, e guardados na memória daquela sessão.

---

## 3. Layout dos painéis

Grade de 12 colunas, espaçamento em múltiplos de 4px, largura máxima do conteúdo 1440px. Em ≥1024px as spans abaixo valem; abaixo disso tudo é uma coluna (ver 8.6).

### 3.1 Visão geral (`/`)
```
Visão geral                                         Dados até 09/10/2026
Consolidado de todas as equipes (o sistema não compara equipes) · últimas 12 semanas (sem filtros nesta tela)

O QUE PEDE ATENÇÃO AGORA                                         (lista, até 6 itens)
 [!] Operacional  3 itens acima do P95 de idade (O2)           [Ver O2]
 [!] Tático       Aderência ao SLE abaixo de 85% em 1 classe   [Ver T2]
 [!] Sustentação  Aderência de restauração P2 abaixo de 90%    [Ver S2]
 (vazio: "Nada pede atenção agora com base nas metas publicadas.")

+-- Operacional (FL1) ---+ +-- Tático (FL2) ------+ +-- Estratégico (FL3) --+ +-- Sustentação --------+
| Status: Atenção        | | Status: Atenção       | | Status: Dentro da meta | | Status: Atenção        |
| 3 acima do P95 (O2)    | | 1 de 3 classes < 85%  | | 2 de 11 iniciativas    | | 1 de 5 prioridades     |
| WIP dentro do limite   | | 1 classe fora de      | |  sem resultado (E3)    | |  abaixo de 90% (S2)    |
|  87% dos dias (O1)     | |  0,9-1,0 (T4)         | | Evolução vinculada     | | P1: amostra            |
| 4 bloqueados agora     | | 3 projetos com escopo | |  61% (E2)              | |  insuficiente          |
| Fonte: BusinessMap     | |  crescido (T9)        | | Fonte: BusinessMap     | | Fonte: Acelerato       |
| [Abrir Operacional]    | | [Abrir Tático]        | | [Abrir Estratégico]    | | [Abrir Sustentação]    |
+------------------------+ +-----------------------+ +------------------------+ +------------------------+

ESPERA INVISÍVEL  (sempre as duas visões)
 Operacional: cliente 45 d.u. · time 18 d.u. · espera invisível 60%      [Detalhar]
 Tático: ... · Estratégico: ... · Sustentação (Acelerato, separada): ...

POR REUNIÃO   (tabela da seção 1.4)
```
Regras:
- O bloco de atenção lista só violações de metas numéricas do briefing: O2 (itens > P95), O1 (aderência < 90% dos dias), O12 (vencidos por causa interna > 0), T2 (< 85% por classe), T4 (razão fora de 0,9 a 1,0), T3 (desvio > 10 p.p.), T9 (projetos com escopo adicionado), E2 (evolução vinculada < 60%), E3 (iniciativas sem resultado declarado), S2 (< 90% por prioridade), S1 (mediana acima do alvo). Cada item leva ao cartão. Ordem: Operacional, Tático, Estratégico, Sustentação; dentro do nível, na ordem da lista. Máximo 6 itens com "Ver todos os alertas (N)" que expande.
- Cada cartão de nível mostra no máximo 3 indicadores, cada um com número, unidade, base ("em 62 itens") e ícone de status; o selo de status do cartão é "Atenção" se algum indicador viola a meta, "Dentro da meta" se todos os que têm meta estão dentro, "Amostra insuficiente" se todos estão insuficientes.
- Se um indicador está com amostra insuficiente, o texto é "Amostra insuficiente (12 de 20 itens mínimos)" no lugar do número.
- (rev. 2, J1) Com a janela de 12 semanas, a linha de Estratégico (e talvez a de Tático) do bloco de Espera invisível aparece como "Amostra insuficiente (7 de 20 projetos)" em vez de números. Isso é normal e igual ao que o painel do nível mostra (6.3.1).
- (rev. 3, Q1) **Espera invisível na Visão geral:** cada nível é uma linha que mostra **um único segmento, nomeado**: o tipo (FL1, FL3) ou a prioridade (Sustentação) de **maior índice entre os que têm amostra ≥ 20**, com cliente, time, índice e base, por exemplo "Incidente: cliente 45, time 18, índice 60% (31 demandas)", mais o link "Ver todos os tipos" para o cartão `#ei-fl1`. Nunca mediana ou índice de tipos misturados. Se nenhum segmento tem amostra, "Amostra insuficiente" (6.3.1). FL2 segue sem segmentação. Segmentos sem amostra não são listados aqui. O destaque descreve fila por tipo, não ranking de pessoas ou equipes.
- O bloco de Espera invisível mostra cada nível como linha própria com as duas medianas e o índice (rev. 3: do segmento acima); Sustentação aparece separada por um divisor com a legenda "Fonte diferente (Acelerato). Não comparável com os níveis acima."
- Dados da Visão geral são calculados com a mesma biblioteca e os mesmos padrões dos painéis (Equipe: todas; Período: 12 semanas; para Estratégico: 12 meses; Sustentação: 6 meses). A tela informa isso na linha de recorte.

### 3.2 Operacional, cadência diária (`/operacional`)
```
Operacional · O trabalho está fluindo?                          [Copiar link]
[Filtros: Equipe | Tipo | Sistema | Período]      chips ativos  [Limpar filtros]
Cadência:  (•) Diária   ( ) Semanal       Pergunta da daily: "Qual item mais velho não andou desde ontem?"

PEDE ATENÇÃO HOJE   [3 itens acima do P95 ↓O2] [4 bloqueados ↓Bloqueados] [WIP 2 acima do limite ↓O1]

+-- O2 Idade do trabalho em progresso (12/12) -----------------------------------------------+
| Gráfico de pontos por etapa, linhas P50/P85/P95  (7/12)   | Itens para olhar primeiro (5/12)|
+-------------------------------------------------------------------------------------------+
+-- Bloqueados agora (5/12) -----------------+ +-- O1 Trabalho em progresso e limite (7/12) --+
| lista: card, motivo, bloqueado há          | | por coluna (1 equipe) + WIP no período       |
+--------------------------------------------+ +----------------------------------------------+
Link ao final: "Ver também a visão semanal (tempo de ciclo, vazão, qualidade)"
```
Ordem do DOM = ordem visual = O2, Bloqueados, O1 (a ordem de leitura da daily).

### 3.3 Operacional, cadência semanal (`/operacional?cadencia=semanal`)
```
Cadência: ( ) Diária  (•) Semanal       Pergunta: "O que mudou na nossa distribuição de tempo?"
Ir para: Tempo · Fluxo · Compromissos · Backlog · Qualidade
PEDE ATENÇÃO NA SEMANA   [P85 subiu ...] [N itens do backlog > 180 dias ↓O10] [Vencidos por causa interna ↓O12]

TEMPO         O3 Tempo de ciclo (12)  ·  O9 Os três relógios (12)  ·  Espera invisível do nível (12, compacto)
FLUXO         O4 Vazão semanal (12)
COMPROMISSOS  O12 Acordos e vencidos (12)
BACKLOG       O10 Envelhecimento do backlog (12)  ·  O7 Entrada × saída por tipo (12, leitura mensal)
QUALIDADE     O15 Onde os bugs são encontrados (6)  +  O18 Entregas com e sem bug (6)
```
(rev. 2, L4) Cinco seções, cada uma com `h2` e id próprio: `#tempo`, `#fluxo`, `#compromissos`, `#backlog`, `#qualidade`. O atalho "Ir para" leva ao `h2` da seção e coloca o foco nele (não no primeiro cartão). **O12 pertence só à seção "Compromissos"**, que vem logo depois de "Fluxo" (O4); ele não aparece dentro de "Fluxo". Ordem real de leitura e de DOM: O3, O9, EI-FL1, O4, O12, O10, O7, O15, O18.

### 3.4 Tático (`/tatico`)
Seções por ritual (perguntas da T6.1):
```
Tático · O projeto está avançando de verdade, e no ritmo previsto?
[Filtros: Equipe | Tipo | Sistema | Período]
PEDE ATENÇÃO  [classes abaixo de 85% (T2)] [fila crescendo (T4)] [projetos com escopo crescido (T9)] [alocação com desvio > 10 p.p. (T3)]

A. "Estamos cumprindo o que publicamos?"      T2 Aderência ao SLE (12) · T1 Lead time ponta a ponta (12) · T5 Demanda de falha (12)
B. "O que entra, e o que sai da fila para isso caber?"  T4 Demanda × capacidade (12) · T3 Alocação da capacidade (12)
C. "Os projetos estão avançando de verdade?"   T9 Avanço real e escopo (12) · T7 Fluxo de frentes (12)
D. Espera invisível do nível (12)
```
T1 e T4 aparecem a um clique um do outro: T1 traz o link "Leia junto com Demanda × capacidade (T4)" e T4 traz "Veja o lead time (T1)". Motivo: expor tempo de fila sem a relação demanda × capacidade pode soar como "o time é lento" (proposta, T1).

### 3.5 Estratégico (`/estrategico`)
```
Estratégico · Estamos fazendo as apostas certas, e elas estão terminando?
[Filtros: Sistema | Período]     (i) Por que não há filtro de equipe?
PEDE ATENÇÃO  [iniciativas sem resultado declarado (E3)] [capacidade fora de objetivo (E2)]
E1 Lead time de projetos (12)
E2 Capacidade por objetivo estratégico (6) + E3 Entrega × resultado (6)
Espera invisível do nível (12)
```

### 3.6 Sustentação (`/sustentacao`)
```
Sustentação · Estamos atendendo e restaurando dentro do combinado?          Fonte: Acelerato
Recorte: DSPD-SSSC · chamados fechados para tempos e aderência  (i)
[Filtros: Equipe SSSC | Prioridade | Período]   chips   [Limpar filtros]
PEDE ATENÇÃO  [aderência abaixo de 90% em P2 (S2)] [restauração acima do alvo em P3 (S1)]
S2 Aderência ao SLA (6) + S1 Primeiro atendimento e restauração (6)
S3 Volume mensal por prioridade (12)
S4 Onde o chamado foi resolvido (6) + S5 Motivos da escalação (6)
S6 Motivos de encerramento (6) + S7 Reclassificação (6)
Espera invisível da sustentação (12)
```
Faixa sobre o recorte (sempre visível): "Chamados da organização DSPD Sustentação, tipo DSPD - SSSC, equipes SSSC TOTVS, SENIOR e FLUIG, excluídos os removidos. Tempos e aderência usam somente chamados fechados. Chamados com exceção de SLA por registro posterior ficam fora destas apurações."

### 3.7 Espera invisível (`/espera-invisivel`)
```
Espera invisível · Quanto do tempo do solicitante acontece fora da nossa gestão?
Como ler: (texto curto + fórmula) 
[Filtros do fluxo: Equipe | Tipo | Sistema | Período]  (valem para os 3 primeiros blocos)

1. Operacional (demandas)  -> EICartao
2. Tático (frentes)        -> EICartao
3. Estratégico (projetos)  -> EICartao
---- divisor: "Fonte diferente: Acelerato" ----
4. Sustentação (chamados) -> EICartao  (filtros próprios de sustentação, neste bloco apenas: equipe SSSC e período)
```
Cada bloco tem granularidade própria (demanda, frente, projeto, chamado) e **eixo próprio**; blocos nunca dividem gráfico. Detalhe em 4.EI.

---

## 4. Especificação das métricas

### 4.0 Anatomia comum de cada cartão de métrica
1. Cabeçalho: selo do código (`O2`), título curto, botão "Como ler" (abre a nota), alternador "Ver como tabela", selo da **base amostral**.
2. Subtítulo: a pergunta que o gráfico responde.
3. Frase de leitura (gerada a partir dos dados).
4. Corpo: gráfico (ou estado).
5. Rodapé: meta (texto ou status), chips de granularidade e fonte, "Filtros aplicados / Não afetado por", marcador de mudança de critério quando houver.

### 4.0.1 Nota metodológica (conteúdo fixo de cinco seções)
`O que é` · `Como se calcula` · `Como ler` · `Meta` · `Cuidados e limites`. Em todas, o final traz as linhas automáticas **"Nesta tela"**: janela usada, filtros aplicados, base amostral e regra de amostra mínima.

### 4.0.2 Regra de amostra mínima (decisão D8)
| O que é | Abaixo de 20 itens |
|---|---|
| Percentis, mediana, média, faixa, índices e razões de distribuição | **Não exibir.** Mostrar "Amostra insuficiente" com a base. |
| Histogramas | **Não exibir** (é distribuição). |
| Taxas e percentuais calculados sobre uma amostra de itens (aderência, taxa de contenção, entrega limpa, demanda de falha, % vencidos...) | **Não exibir o percentual**; mostrar a contagem "k de n". |
| Contagens absolutas, listas de itens, pontos individuais (dispersão) | **Exibir** com a base. |
| Retrato do momento (O2, O10, bloqueados, T7) | Exibir sempre; as **referências** percentis seguem a regra acima. |
| Censos de uma entidade (T9 por projeto, E3 por iniciativa) | Exibir sempre, com "k de n". |
O limite é por classe/série mostrada (por tipo, por prioridade, por classe de serviço). Um painel pode ter classes publicadas e classes insuficientes ao mesmo tempo. Ver perguntas 3 e 16.

### 4.0.3 Janelas por granularidade
| Granularidade | Janela padrão de percentis |
|---|---|
| Demanda/story (FL1, T1, T2, T4, T5, EI-FL1) | 12 semanas |
| Frente (T7, EI-FL2) | 12 semanas |
| Projeto (E1, EI-FL3) | 12 semanas |
| Chamado (S1 a S7, EI-Sust) | 12 semanas |
(rev. 2, J1) **A janela é de 12 semanas para todas as granularidades**, como no briefing. Não existe mais selo "provisória". A janela é um parâmetro único no código e os textos de janela ("últimas 12 semanas") são gerados a partir dele, nunca escritos à mão; a pergunta 2 segue aberta com o usuário. Consequência aceita: com 12 semanas, projetos (E1, EI-FL3) quase sempre e frentes (T7, EI-FL2) às vezes ficam abaixo de 20 itens e mostram "Amostra insuficiente"; isso é **estado normal**, explicado em 6.3.1 (e não erro, nem motivo para mudar a regra). Pontos individuais, contagens e censos continuam à mostra (4.0.2). Story, frente e projeto nunca dividem histograma, percentil, eixo ou tabela de estatística. E2 e E3 (por trimestre e censo) não usam percentil e não são afetados.

### 4.0.4 Regras de legenda e unidade
- Tempo: "dias úteis" (FL1 a FL3); toda unidade escrita no eixo e no valor.
- (rev. 2, J2) **Sustentação: tudo é medido em horas úteis, para todas as prioridades, inclusive P1** (calendário de 2.1: 1 dia útil = 8 horas úteis). Unidade de exibição: **P1, P2 e P3 em "h úteis"; P4 e P5 em "dias úteis"** (a unidade é fixa por prioridade, não muda conforme o valor). **Sem minutos e sem horas corridas** em nenhum lugar da Sustentação. Formato: vírgula decimal, até 2 casas em horas e até 1 casa em dias, sem zeros sobrando (15 min = "0,25 h úteis"; 4 h úteis em P4 = "0,5 dia útil"); "dia útil" no singular até 1,0 e "dias úteis" acima. Fora de S1 (S4, Espera invisível da sustentação), onde não há prioridade, a unidade é "h úteis", sem conversão para dias. Pergunta 11 sobre P1 em plantão segue aberta.
- Percentis sempre escritos assim: "50% em até X", "85% em até Y", "95% em até Z" e, abreviado em eixos, "P50, P85, P95". A mediana (P50) sempre aparece junto de P85 e P95.
- Metas: texto "Meta: ...". Status só quando D10 permitir.
- Nenhum cartão mostra "média" sozinha. Quando a média aparece (O4, T4), vem com a faixa e a mediana.

---

## FL1 · Operacional (fonte: BusinessMap · granularidade: demanda/story)

### O1 · Trabalho em progresso e limite (diária)
- **Pergunta:** Estamos começando mais do que conseguimos terminar?
- **Gráfico:** (a) barras horizontais por coluna do fluxo com marcador de limite e (b) linha do WIP total no período com o limite em degrau e a área acima do limite hachurada. Barra = comparar quantidade contra um limite fixo; linha com área = mostra o **tempo acima do limite**, que é o indicador (não o valor médio).
- **Eixos:** (a) y = colunas na ordem do fluxo, x = itens; (b) x = dias úteis, y = itens em progresso.
- **Segmentação:** cada barra tem segmento "bloqueados" (padrão hachurado) dentro do total, porque bloqueado conta como WIP. Colunas de fila (nome começa com "Aguardando" ou "Pronto para") levam o rótulo "Fila" e ícone; **fila conta no WIP e dentro do limite**. (a) só existe com **uma** equipe selecionada; com 0 ou 2+ equipes, (a) vira "Fila" × "Execução" com a nota "Selecione uma equipe para ver por coluna." e o limite é a soma dos limites das equipes ("Limite somado de N equipes").
- **KPI:** "Dias dentro do limite: 54 de 60 (90%)". Meta: "Dentro do limite em 90% dos dias" (status Dentro/Fora da meta).
- **Base amostral:** "60 dias úteis · 14 itens em progresso hoje". O percentual de dias exige 20 dias úteis (período ≥ 4 semanas); abaixo disso mostra "k de n dias" sem percentual.
- **Leitura:** "Hoje há 14 itens em progresso para um limite de 12 (2 acima), 3 deles bloqueados. Nos últimos 60 dias úteis o WIP ficou dentro do limite em 54."
- **Nota:** *O que é:* quantidade de itens em execução por coluna e no fluxo, contra o limite combinado. *Como se calcula:* itens com início e sem entrega no dia; bloqueados e itens em colunas de fila contam. *Como ler:* o que importa é por quantos dias a linha ficou acima do limite e o que aconteceu com o tempo de ciclo depois de cada pico. *Meta:* dentro do limite em 90% dos dias. *Cuidados:* se uma coluna de espera for criada fora do limite o número melhora e a entrega piora; aqui toda fila conta.
- **Dados:** `dim_card` (iniciado_em, concluido_em, arquivado_em, motivo_descarte), `fato_transicao` (coluna e `tipo_coluna`), `fato_bloqueio`, limites de WIP por coluna e fluxo (configuração).

### Bloqueados agora (diária, parte de O1/O2)
- **Pergunta:** O que está parado esperando alguém e há quanto tempo?
- **Gráfico:** lista (tabela) ordenada por "Bloqueado há" decrescente. Colunas: Card (código e título), Tipo, Etapa em que bloqueou, Motivo (domínio fechado: Aguardando fornecedor, Aguardando validação do negócio, Aguardando ambiente ou infraestrutura, Dependência de outra demanda, Falta de informação no chamado, Janela de mudança, Aguardando licença ou contrato), Fornecedor (se houver), Bloqueado há (dias úteis). **Sem coluna de responsável.** Lista é o formato certo para decidir quem destrava o quê.
- **Base:** "4 itens bloqueados hoje". Contagem pura, sem estatística, sem mínimo.
- **Leitura:** "4 itens estão bloqueados. O mais antigo está bloqueado há 6 dias úteis por 'Aguardando fornecedor'."
- **Vazio:** "Nenhum item bloqueado hoje." (estado de sucesso, ícone de confirmação)
- **Nota:** o bloqueio é marcado no card e **não move** o card de coluna; o tempo continua na etapa onde o problema ocorreu. Esta lista não é a análise de bloqueios por causa (fora do núcleo).
- **Dados:** `fato_bloqueio` (motivo, coluna, fornecedor, inicio, fim nulo), `dim_card`.

### O2 · Idade do trabalho em progresso
- **Pergunta:** Qual item em andamento já passou do tempo esperado e ninguém percebeu?
- **Gráfico:** (a) gráfico de pontos: cada ponto é um card aberto; x = etapa do fluxo na ordem (com uma equipe) ou "Fila" e "Execução" (várias equipes); y = idade em dias úteis desde o início. Linhas horizontais de P50, P85, P95 **do tipo** selecionado. Pontos: círculo = até P85; losango = entre P85 e P95; triângulo = acima de P95; anel duplo = bloqueado. (b) À direita, lista "Itens para olhar primeiro": os 10 mais velhos, com Card, Tipo, Etapa, Idade (d.u.), **Sem mover há** (d.u., a partir da última transição), Situação ("Acima do P95 do tipo", "Entre P85 e P95", "Dentro do esperado", "Sem referência: amostra insuficiente"), Bloqueado (motivo). Ordenável por Idade (padrão) ou Sem mover há.
- **Por quê:** o gráfico de pontos mostra onde o trabalho está parando; a lista é o que se discute. Sem responsável.
- **Segmentação:** seletor local "Ver por tipo" (abas com contagem de abertos por tipo, padrão = tipo com mais itens acima do P85; URL `o2=`). As linhas de percentil dependem do tipo selecionado. A lista mostra todos os tipos, cada item comparado ao percentil do próprio tipo.
- **Base:** "18 itens abertos · referência: 87 itens concluídos do tipo nas últimas 12 semanas". Se o tipo tem < 20 concluídos: sem linhas de percentil e a lista mostra "Sem referência"; a aba traz "(amostra insuficiente)".
- **Meta:** "Nenhum item acima do P95 sem plano de ação" (status "Fora da meta" se houver itens acima de P95; o plano é registrado fora do sistema).
- **Leitura:** "3 itens estão acima do P95 do seu tipo. O mais velho tem 21 dias úteis e está em 'Aguardando negócio'."
- **Nota:** *O que é:* a idade de cada item ainda em andamento, posicionado na etapa onde está. *Como se calcula:* dias úteis desde o início (primeira entrada em coluna de execução) até a data de corte; percentis calculados com os itens concluídos do tipo nas últimas 12 semanas. *Como ler:* percorra da direita para a esquerda; comece pelos itens acima da linha de 85%. A pergunta é "o que precisa acontecer hoje para este item andar?". *Meta:* nenhum item acima do P95 sem plano. *Cuidados:* é um retrato de hoje e só olha o que ainda dá para salvar; não substitui o tempo de ciclo.
- **Dados:** `dim_card` (tipo, iniciado_em, concluido_em), `fato_transicao` (última transição, coluna atual, `tipo_coluna`), `fato_bloqueio`.

### O3 · Tempo de ciclo
- **Pergunta:** Em quantos dias entregamos, com que grau de confiança?
- **Gráfico:** dispersão: cada ponto é uma demanda entregue; x = data de entrega, y = tempo de ciclo (início → entrega) em dias úteis; linhas P50, P85 e P95. À direita (ou acima em telas estreitas), três "cartões de número": "50% em até X dias úteis", "85% em até Y", "95% em até Z". Abaixo, linha "Como o P85 evoluiu": uma janela de 12 semanas deslizando, um ponto por semana (ponto só se a janela tiver ≥ 20 itens; senão lacuna), com marcadores de mudança de critério.
- **Por quê:** a dispersão mostra a cauda longa e cada ponto acima do P95 é material de retrospectiva; a leitura por percentil é a afirmação negociável ("85% em até Y dias"), que alimenta o SLE.
- **Segmentação:** **seletor local de tipo** (abas; URL `o3=`); uma distribuição por vez, nunca misturada. Uma tabela-resumo acima do gráfico lista todos os tipos: Tipo · Itens · P50 · P85 · P95, com "amostra insuficiente" onde < 20.
- **Base:** "87 itens concluídos · Melhoria · últimas 12 semanas (14/07 a 05/10)". Janela fixa de 12 semanas.
- **Meta:** "Reduzir o P85 em 20% no semestre". Chip de variação: "P85 hoje vs. 6 meses atrás: −14% (meta −20%)" mostrado só se as duas janelas tiverem ≥ 20 itens; senão "Comparação indisponível: amostra insuficiente em uma das janelas." Ver pergunta 20.
- **Leitura:** "Melhorias: 85% ficam prontas em até 9 dias úteis; metade em até 4. 6 itens passaram do P95."
- **Nota:** *O que é:* tempo entre o início efetivo e a entrega. *Como se calcula:* dias úteis, primeira entrada em coluna de execução até a entrega em produção, itens concluídos nas últimas 12 semanas; descartados saem; subtarefas não contam. *Como ler:* por percentil, não pela média. *Meta:* reduzir o P85 em 20% no semestre. *Cuidados:* nunca misturar tipos (um incidente de 4 horas e um projeto de 40 dias não têm distribuição comum); abaixo de 20 itens não há percentil.
- **Dados:** `dim_card` (tipo, iniciado_em, concluido_em, motivo_descarte).

### O4 · Vazão semanal
- **Pergunta:** Quantas demandas concluímos por semana, e o quanto isso varia?
- **Gráfico:** colunas por semana (itens concluídos) com uma **faixa** sombreada (mínimo a máximo das semanas completas da janela) e uma linha tracejada de mediana. Colunas = contagem por período; faixa = a variação, que é o que importa e o que alimenta a previsão.
- **Eixos:** x = semanas (segunda a domingo); y = itens concluídos. Semana em andamento listrada e rotulada.
- **Segmentação:** total por padrão; alternador "Empilhar por tipo" (padrão desligado; URL não guarda).
- **Base:** "112 itens em 12 semanas completas".
- **Estatística:** "Faixa: 5 a 11 por semana · mediana 8" só se o total da janela ≥ 20; senão apenas colunas e o aviso "Faixa e mediana indisponíveis: 14 de 20 itens mínimos."
- **Meta:** "Reduzir a amplitude da variação" (texto, sem status).
- **Leitura:** "Nas últimas 12 semanas a vazão ficou entre 5 e 11 itens por semana; a mediana é 8."
- **Nota:** *O que é:* demandas entregáveis ao solicitante concluídas por semana. *Como se calcula:* contagem por semana de entrega; subtarefas não contam; reabertos reabrem o original. *Como ler:* olhe a faixa, não só a média; ela é a base das previsões. *Meta:* reduzir a amplitude. *Cuidados:* vazão não é produtividade individual nem serve para comparar equipes; só prevê o próprio futuro.
- **Dados:** `dim_card` (concluido_em, tipo).

### O7 · Entrada × saída por tipo
- **Pergunta:** Em que tipo de demanda estamos acumulando trabalho, mês a mês?
- **Gráfico:** (a) tabela-resumo por tipo: Tipo · Entrou · Saiu · Saldo do período · Saldo acumulado · Situação ("A fila cresce", "Estável", "A fila diminui", com ícone), ordenada pelo saldo acumulado decrescente; (b) abaixo, **pequenos múltiplos**, um por tipo: colunas pareadas por mês (Entrada = sólida; Saída = listrada) e linha de saldo acumulado. O desequilíbrio por tipo é a informação; o agregado esconde. Escala do eixo y própria em cada pequeno múltiplo (indicado no título "escala própria").
- **Eixos:** x = meses; y = cards. Mínimo de 6 meses (o cartão usa o maior entre o período escolhido e 6 meses e avisa: "Este gráfico mostra no mínimo 6 meses."). Mês em andamento listrado.
- **Segmentação:** por tipo (pequenos múltiplos); seletor local não é necessário.
- **Base:** "Entraram 612 e saíram 584 cards em 6 meses" + por tipo na tabela. Contagem; sem mínimo de 20.
- **Meta:** "Saída ≥ entrada em cada tipo no acumulado do trimestre": tipo com saldo acumulado positivo no trimestre recebe o selo "Entrada acima da saída" (ícone + texto; sem verde/vermelho como único sinal).
- **Leitura:** "Toda a fila que cresceu no período é de Melhoria: entraram 55 e saíram 39."
- **Nota:** *O que é:* cards criados e concluídos por mês e tipo. *Como se calcula:* entrada = criação do card (chegada do pedido); saída = entrega; saldo = entrada − saída. *Como ler:* observe o saldo acumulado, não o de cada mês. *Meta:* saída maior ou igual à entrada por tipo no trimestre. *Cuidados:* mês é um recorte grosseiro (feriados, férias, sazonalidade); dois meses não são tendência. Marcador de mudança de critério do marco de entrada, quando cruzado.
- **Dados:** `dim_card` (tipo, criado_em, concluido_em).

### O9 · Os três relógios do pedido
- **Pergunta:** Quanto o solicitante espera, quanto fica sob nossa gestão e quanto de fato trabalhamos?
- **Gráfico:** (a) resumo: três barras horizontais aninhadas na **mesma escala** (cliente = cheia, equipe = média, cycle time = clara) mostrando a mediana, com marcas de P85; ao lado, a tabela "Relógio · P50 · P85 · P95"; (b) três histogramas empilhados com o **mesmo eixo x** (cliente, equipe, cycle time) para ver a distância entre eles; (c) série mensal: três linhas de P50 (sólidas) e P85 (tracejadas) por mês, uma por relógio, para ver a tendência.
- **Eixos:** x histograma = faixas de dias úteis (curtas para tipos rápidos: 0-1, 2-3, 4-5, 6-10, 11-20, +20; para Melhoria e Dívida técnica: 0-5, 6-10, 11-20, 21-40, 41-80, +80; ver pergunta 13); y = itens. Série: x = meses, y = dias úteis.
- **Segmentação:** seletor local de tipo (URL `o9=`); um tipo por vez.
- **Base:** "87 itens entregues · Melhoria · 12 semanas". Histogramas e percentis somem abaixo de 20 itens do tipo (estado "Amostra insuficiente"); a série mensal só plota meses com janela suficiente.
- **Meta:** "Reduzir a distância entre o lead time do cliente e o cycle time, atacando a fila antes da execução." Chip "Distância cliente–cycle: mediana 41 dias úteis".
- **Leitura:** "Para Melhoria, o cliente espera 45 dias úteis (mediana), a equipe tem a demanda por 18 e trabalha nela por 9. A maior parte da distância está antes de começar."
- **Nota:** *O que é:* três medidas do mesmo item com pontos de partida diferentes. *Como se calcula:* cliente = entrada → entrega; equipe = compromisso → entrega; cycle time = início → entrega, em dias úteis; aceite fica fora. *Como ler:* cliente muito maior que equipe = problema de priorização e fila; equipe muito maior que cycle = espera interna e bloqueio. *Meta:* reduzir a distância. *Cuidados:* faixas largas escondem a distribuição; exige que o card nasça na chegada do pedido (T1.5), senão o relógio do cliente não existe; marcador de mudança de critério quando a série cruzar a data.
- **Dados:** `dim_card` (tipo, criado_em, comprometido_em, iniciado_em, concluido_em).

### O10 · Envelhecimento do backlog
- **Pergunta:** O que está esperando há mais tempo sem nunca ter começado?
- **Gráfico:** dois histogramas **lado a lado**, mesma escala: "Tudo o que está registrado" (visão do time) e "O que alguém de fora ainda espera" (visão do cliente). Colunas = itens não iniciados por faixa de idade; empilhadas por tipo (7 segmentos máximo, com padrão e rótulo). Destaque numérico acima: "N itens com mais de 180 dias". Abaixo, evolução mensal de **mediana e P85** da idade do backlog (não a média).
- **Eixos:** x = faixas de idade em dias corridos (faixas longas: 0-30, 31-60, 61-90, 91-180, 181-365, +365; a regra do briefing permite faixas longas só aqui); y = itens. Evolução: x = meses, y = dias.
- **Segmentação:** tipo como empilhamento; seletor local de tipo para a evolução (URL `o10=`).
- **Base:** "Time: 318 itens · Cliente: 204 itens, não iniciados em 05/10". Os histogramas e a evolução somem abaixo de 20 itens; o contador ">180 dias" é contagem e permanece.
- **Meta:** "Nenhum item acima de 180 dias sem decisão explícita de manter ou encerrar" (status "Fora da meta" se houver itens > 180). A decisão não está no modelo; ver pergunta 5.
- **Leitura:** "67 itens estão parados há mais de 180 dias, todos de Melhoria. A fila do cliente é mais velha que a do time."
- **Nota:** *O que é:* idade dos itens que ainda não começaram. *Como se calcula:* data de corte − entrada (criação do card), em dias; apenas itens sem início. *Como ler:* a barra da direita é a mais importante: item parado há mais de 180 dias provavelmente não será feito. *Meta:* nenhum sem decisão. *Cuidados:* a visão do cliente costuma ter os itens mais velhos porque ninguém arquiva o pedido de outra pessoa; exige T1.5.
- **Dados:** `dim_card` (tipo, area_solicitante, criado_em, iniciado_em, arquivado_em).

### O12 · Acordos e vencidos
- **Pergunta:** Dos prazos que combinamos, quantos vencemos, e de quem foi o atraso?
- **Gráfico:** colunas mensais: altura = acordos com data no mês; a parte vencida em empilhamento por responsabilidade do atraso (Interno, Solicitante, Terceiro, Não classificado) e a linha de "% vencidos". Cada responsabilidade tem cor, padrão e rótulo distintos.
- **Eixos:** x = meses (mês em andamento listrado); y = compromissos (esq.) e % (dir.).
- **Base:** "136 acordos em 6 meses · 9 vencidos". % só se acordos do mês ≥ 20; senão mostra "k de n".
- **KPI:** "Vencidos por causa interna no período: 0". Meta: "Zero vencidos por causa interna" (status Dentro/Fora da meta). Os demais com motivo registrado.
- **Leitura:** "Nenhum acordo venceu por causa interna. 4% venceram por pendência do solicitante."
- **Nota:** *O que é:* compromissos com data acordada, quantos venceram sem entrega e por responsabilidade de quem. *Como se calcula:* `data_acordada` no mês vs entrega; responsabilidade registrada no vencimento. *Como ler:* a linha decrescente é o que se apresenta às áreas; a decomposição é a conversa interna. *Meta:* zero vencidos por causa interna. *Cuidados:* a responsabilidade precisa ser preenchida no vencimento, nunca depois ("Não classificado" mostra o que ficou sem preencher).
- **Dados:** `dim_card` (data_acordada, responsabilidade_atraso, concluido_em, sistema).

### O15 · Onde os bugs são encontrados
- **Pergunta:** Estamos encontrando nossos próprios erros cedo, ou deixando o negócio e a produção encontrarem?
- **Gráfico:** barras verticais por fase de detecção, **na ordem do processo**: Desenvolvimento, Revisão de código, Teste interno, Homologação do negócio, Produção. As três primeiras agrupadas sob o rótulo "Contido pela equipe", Homologação como "Chegou ao negócio", Produção como "Escapou para produção". Dois números grandes: "Taxa de contenção" (antes da homologação) e "Taxa de escape" (produção), mais evolução mensal das duas em linhas. Cores sequenciais neutras + rótulos; **sem verde/vermelho por volume** (não há meta de volume).
- **Eixos:** x = fases; y = bugs. Evolução: x = meses, y = %.
- **Base:** "74 bugs registrados no período". Percentuais e evolução somem se < 20 bugs; contagens por fase permanecem.
- **Meta:** "Elevar a contenção e reduzir o escape; não há meta sobre o volume de bugs internos" (texto fixo, sem status). Texto fixo sob o título: "O que se cobra é a taxa de escape, não o volume de bugs internos."
- **Leitura:** "80% dos bugs foram contidos antes da homologação; 5,5% chegaram à produção."
- **Nota:** *O que é:* distribuição dos bugs pela fase em que foram detectados. *Como se calcula:* contenção = bugs detectados antes da homologação ÷ total; escape = bugs em produção ÷ total; usa `fase_deteccao`. *Como ler:* onde aparecem diz mais que quantos são. *Meta:* elevar contenção, reduzir escape. *Cuidados:* bug interno registrado é sinal de que a detecção funciona; cobrar o volume faz a equipe parar de registrar. Número baixo pode ser qualidade boa ou detecção ruim.
- **Dados:** `dim_card` (tipo bug/defeito, fase_deteccao, criado_em, sistema).

### O18 · Entregas com e sem bug
- **Pergunta:** De tudo que entregamos no mês, quanto saiu limpo?
- **Gráfico:** colunas empilhadas mensais "Entregas sem bug" e "Entregas com bug" + linha de densidade (bugs por card entregue). Dois KPI: "Taxa de entrega limpa" e "Densidade: 0,26 no geral; 1,4 entre os cards afetados".
- **Eixos:** x = meses; y = cards entregues (esq.), bugs por card (dir.).
- **Segmentação:** vínculo bug → card de origem; a janela de 30 dias após a entrega decide o mês. **Mês cujo prazo de 30 dias ainda não fechou** aparece listrado com o rótulo "em apuração até DD/MM" (mais o mês em andamento).
- **Base:** "412 cards entregues em 6 meses · 63 bugs vinculados". Percentual e densidades somem se < 20 cards no mês; contagens permanecem.
- **Meta:** "Elevar a taxa de entrega limpa mantendo ou aumentando a vazão" (texto; ao lado, link "Ver vazão (O4)").
- **Leitura:** "Em junho, 82% das entregas saíram sem bug. A densidade foi de 0,26 bug por card; entre os cards com bug, 1,4: o problema está em poucos cards."
- **Nota:** *O que é:* a vazão do mês decomposta em entregas limpas e com bug. *Como se calcula:* bug vinculado até 30 dias após a entrega conta para o mês da entrega; depois disso entra como defeito em produção do mês corrente. *Como ler:* leia sempre ao lado da vazão (O4). *Meta:* elevar a entrega limpa. *Cuidados:* sem o corte de 30 dias nenhum mês fecha; densidade entre os afetados bem maior que a geral aponta tamanho e complexidade, não qualidade geral.
- **Dados:** `dim_card` (concluido_em, origem_bug, tipo bug/defeito, criado_em dos bugs).

---

## FL2 · Tático (fonte: BusinessMap · granularidade indicada em cada cartão)

### T1 · Lead time ponta a ponta (demanda, por classe de serviço)
- **Pergunta:** Quanto tempo o solicitante realmente espera, e quanto desse tempo sequer é nosso?
- **Gráfico:** barras horizontais empilhadas, uma por classe de serviço (Urgente, Prazo fixo, Padrão, Intangível), cada barra com quatro blocos na ordem do tempo: **Fila**, **Espera**, **Execução**, **Homologação** (mediana de cada bloco), e uma marca de "P85 do total". A decomposição de cada classe fica em tabela abaixo (Bloco · Mediana · Dono sugerido da ação). Mantém visível quem é "dono" de cada bloco sem nomear pessoas ("Priorização", "Fluxo do time", "Validação do negócio").
- **Eixos:** x = dias úteis; y = classes.
- **Segmentação:** classe de serviço (seletor local de classe para o detalhe: `t1=`). Ver pergunta 9 e 6.
- **Base:** por classe: "Padrão · 64 demandas entregues em 12 semanas". Classe < 20: linha com "Amostra insuficiente (12 de 20 itens mínimos)" e sem barra.
- **Meta:** "Publicar o lead time por classe e reduzir o tempo de fila". Link fixo "Leia junto com Demanda × capacidade (T4)".
- **Leitura:** "Para a classe Padrão, a mediana do lead time é 38 dias úteis; 22 deles (58%) são fila antes de a equipe assumir o pedido."
- **Nota:** *O que é:* tempo do pedido à entrega, em quatro blocos. *Como se calcula:* entrada → entrega, dividido pelos marcos e pelo tipo de coluna (fila/execução) das transições; a soma das medianas dos blocos **não** é a mediana do total (as duas aparecem separadas). *Como ler:* cada bloco tem um dono diferente. *Meta:* publicar por classe e reduzir a fila. *Cuidados:* expor a fila costuma incomodar no primeiro ciclo; leia com a demanda × capacidade: "temos mais pedidos do que capacidade", não "o time é lento". Aceite fica fora (medido à parte).
- **Dados:** `dim_card` (classe_servico, criado_em, comprometido_em, iniciado_em, concluido_em), `fato_transicao`.

### T2 · Aderência ao SLE (demanda, por classe)
- **Pergunta:** Estamos cumprindo o que prometemos, e quando falhamos, onde?
- **Gráfico:** (a) uma barra de progresso horizontal por classe com o percentual dentro do SLE e a linha de meta de 85%; (b) **mapa de calor** classe × etapa (Fila, Espera, Execução, Homologação) com a **contagem** de itens que estouraram o SLE em que a etapa foi a de maior duração, número dentro de cada célula (nunca só cor). Barra = comparação com uma meta; mapa = onde procurar a causa.
- **Eixos:** (a) x = % de 0 a 100; (b) linhas = classes, colunas = etapas.
- **Segmentação:** por classe; "Intangível" mostra "Sem SLE (cota fixa de capacidade)" e fica fora.
- **Base:** "Padrão · 64 entregues no período; 54 dentro do SLE publicado de 9 dias úteis". Classe < 20 entregues: "Amostra insuficiente"; SLE exibido como "SLE: não publicado".
- **Meta:** "85% por classe" (status por classe, ícone + texto).
- **Leitura:** "Urgente: 96% dentro do SLE. Padrão: 64%; os estouros se concentram na etapa Homologação."
- **Nota:** *O que é:* percentual de demandas entregues dentro do SLE publicado. *Como se calcula:* entregues com tempo de ciclo ≤ SLE da classe, nas últimas 12 semanas; o SLE da classe é o P85 publicado (com data). *Como ler:* um prazo por classe, não um prazo único; o mapa indica em que etapa o tempo se perdeu. *Meta:* 85% por classe. *Cuidados:* neste mock o SLE é um valor de configuração com data de publicação; só é válido após 60 dias de dados limpos e 20 itens por classe.
- **Dados:** `dim_card` (classe_servico), `fato_transicao`, SLE publicado por classe (configuração). Ver pergunta 7.

### T3 · Alocação da capacidade (demanda, por natureza)
- **Pergunta:** Nossa capacidade está sendo consumida onde acordamos que seria?
- **Gráfico:** barras horizontais agrupadas por natureza (Sustentação, Evolução, Projetos, Dívida técnica): "Acordado" (barra contornada) e "Realizado" (barra cheia), com o desvio em pontos percentuais escrito ao lado e o selo "Desvio acima de 10 p.p." quando aplicável. A distância entre as duas barras é o assunto da reunião.
- **Eixos:** x = % da capacidade (0 a 100); y = naturezas.
- **Segmentação:** natureza (mapeamento de tipo para natureza em pergunta 8). Alternador "Contar por: Itens | Tempo em execução" (padrão Itens) com a dica: "Use 'Tempo em execução' quando os itens têm tamanhos muito diferentes." URL `contagem` não é guardada.
- **Base:** "Realizado: 248 itens entregues no trimestre". Percentuais somem se < 20 itens no total.
- **Meta:** "Desvio máximo de 10 pontos percentuais" (status por natureza).
- **Leitura:** "Sustentação consumiu 63% da capacidade (acordado: 40%). Dívida técnica ficou em 1% (acordado: 5%)."
- **Nota:** *O que é:* distribuição das entregas por natureza do trabalho contra o acordo. *Como se calcula:* itens entregues no período agrupados por natureza; acordo é o definido pela coordenação. *Como ler:* a distância entre as barras é a decisão a tomar. *Meta:* desvio máximo de 10 p.p. *Cuidados:* contar cards distorce quando os tamanhos diferem muito. Valores de acordo no mock são fictícios.
- **Dados:** `dim_card` (tipo, concluido_em), acordo de alocação (configuração).

### T4 · Demanda × capacidade (demanda, por classe)
- **Pergunta:** A fila está crescendo ou diminuindo?
- **Gráfico:** tabela por classe e, para a classe escolhida, linha dupla "Chegada" (tracejada) e "Vazão" (sólida) por semana nas 12 semanas, com a área entre as linhas preenchida (padrão quando a chegada supera a vazão). **Sempre por classe**; não existe visão agregada (o agregado esconde o problema). Tabela: Classe · Chegada por semana (faixa e mediana) · Vazão por semana (faixa e mediana) · Razão chegada/vazão · Backlog · Semanas para zerar.
- **Eixos:** x = semanas; y = itens por semana.
- **Segmentação:** classe de serviço (seletor local `t4=`).
- **Estatística:** razão = chegada ÷ vazão; se a vazão ≤ chegada o texto é "A fila cresce: chegam mais itens do que saem" (não se mostra "semanas para zerar"); senão "semanas para zerar = backlog ÷ (vazão − chegada)". Média semanal só junto da faixa e da mediana. (rev. 2, L12) **Regra dos 20 itens em T4:** a classe só publica razão, faixa, mediana, "semanas para zerar" e a linha dupla quando a **soma de chegadas e saídas da classe nas 12 semanas** é ≥ 20. Abaixo disso mostra a tabela só com as contagens ("Chegadas: 9 · Saídas: 7 · 16 de 20 itens mínimos") e a contagem de backlog. Em ambos os casos a base mostra chegadas e saídas separadas. Provisório: ver pergunta 20.
- **Meta:** "Razão entre 0,9 e 1,0 no acumulado do trimestre" (status por classe).
- **Leitura:** "Padrão: chegam 11 itens por semana e saem 8. A fila cresceu 36 itens em 12 semanas e nenhuma melhoria de produtividade a estabiliza: a decisão é sobre entrada, capacidade ou escopo."
- **Nota:** *O que é:* chegada de pedidos contra a vazão. *Como se calcula:* contagem semanal por classe de entradas (criação) e saídas (entrega); saldo = vazão − chegada. *Como ler:* enquanto a linha de chegada estiver acima da de vazão, nenhuma melhoria de produtividade estabiliza o prazo. *Meta:* razão entre 0,9 e 1,0. *Cuidados:* calcule por classe; leia junto do lead time (T1).
- **Dados:** `dim_card` (classe_servico, criado_em, concluido_em).

### T5 · Demanda de falha (demanda, por sistema e por área)
- **Pergunta:** Quanto do nosso trabalho existe só porque algo antes não foi feito certo?
- **Gráfico:** barras horizontais 100% empilhadas por sistema (e, na aba "Por área", por área solicitante): segmentos "Demanda de valor" e as cinco origens de falha (Erro em entrega anterior, Configuração incorreta, Falta de treinamento do usuário, Informação não repassada, Processo manual que deveria estar automatizado). (rev. 2, L10) **Ordem neutra: por volume total de itens da barra, do maior para o menor, com desempate alfabético**, nas duas abas. Justificativa: o volume mostra onde a base é mais sólida e não atribui mérito nem culpa; ordenar pela parcela de falha transformaria o gráfico em ranking de áreas. Rótulo fixo sob o título: "Ordem por volume de demanda. Não é um ranking." Na aba "Por área" acrescenta-se: "A parcela de falha vem de processos e entregas anteriores, não das áreas." Na aba "Por sistema", os dois sistemas com maior parcela de falha recebem o selo "Foco da meta" (ícone + texto) porque a meta é sobre sistemas; na aba "Por área" **não há selo, destaque, cor ou ordenação por falha**. Apenas sistemas/áreas com ≥ 20 itens aparecem no gráfico; os demais ficam numa lista "Sem amostra suficiente" com a base ("Fluig: 11 de 20 itens mínimos").
- **Eixos:** x = % da demanda (0 a 100); y = sistemas ou áreas.
- **Segmentação:** seletor local "Por sistema | Por área" (`t5=sistema|area`). O filtro Sistema não se aplica (é a dimensão).
- **Meta:** "−15% ao semestre nos dois sistemas mais afetados" (variação mostrada só com as duas janelas ≥ 20 itens).
- **Leitura:** "No Protheus, 41% dos pedidos existem porque algo antes falhou; a maior origem é 'Falta de treinamento do usuário'."
- **Nota:** *O que é:* parcela da demanda que chega por falha anterior. *Como se calcula:* demanda de falha ÷ demanda total, por `origem_demanda`, no período. *Como ler:* é a parcela da carga que pode ser eliminada em vez de acelerada. *Meta:* −15% ao semestre nos dois piores. *Cuidados:* mostra sistemas e áreas, **não pessoas ou equipes**; não use para ranquear.
- **Dados:** `dim_card` (origem_demanda, sistema, area_solicitante, criado_em).

### T7 · Fluxo de frentes (frente)
- **Pergunta:** Quantas frentes estamos tocando ao mesmo tempo, quanto cada uma leva e quais estão envelhecendo?
- **Gráfico:** (a) KPIs: "Frentes em andamento", "Projetos com frentes ao mesmo tempo" e limite de frentes simultâneas; (b) barras por projeto com o número de frentes abertas (ordenadas decrescente); (c) pontos de idade das frentes abertas, com linhas P50/P85/P95 do tempo de ciclo de frentes; (d) histograma do tempo de ciclo das frentes concluídas (só granularidade frente).
- **Ordem de leitura:** (a), (b), (c), (d), conforme a proposta: WIP por projeto, depois envelhecimento, depois tempo de ciclo.
- **Eixos:** (c) x = projeto, y = dias úteis; (d) x = faixas de dias úteis, y = frentes.
- **Base:** "11 frentes abertas em 4 projetos · referência: 27 frentes concluídas nas últimas 12 semanas" (rev. 2, J1). Percentis e histograma somem abaixo de 20 frentes concluídas **na janela de 12 semanas** (com filtros estreitos isso é comum e é estado normal, 6.3.1); (a), (b) e a lista permanecem.
- **Meta:** "Limite explícito de frentes" (status se houver limite).
- **Leitura:** "4 projetos têm frentes em andamento ao mesmo tempo (11 abertas). As 2 mais antigas estão acima do P85. Fechar essas antes de abrir novas reduz o tempo das demais."
- **Nota:** *O que é:* WIP, envelhecimento e tempo de ciclo de features e pacotes. *Como se calcula:* mesmas definições do nível operacional, na granularidade de frente (feature e pacote contam igual). *Como ler:* um time pode ter WIP baixo de stories e estar dividido entre seis frentes. *Meta:* limite explícito. *Cuidados:* frente que não cabe em 1 ou 2 sprints precisa ser quebrada; **granularidade de frente nunca entra no histograma de story**.
- **Dados:** `dim_card` (card_pai, tipo feature/pacote, iniciado_em, concluido_em), `fato_transicao`, limites de frentes (configuração).

### T9 · Avanço real e escopo (projeto)
- **Pergunta:** O projeto está de fato onde dizemos que está?
- **Gráfico:** uma linha por projeto (barra horizontal segmentada): frentes concluídas (sólido), em andamento (listrado fino), a fazer (contorno) e, ao final, o escopo **adicionado depois do início** (hachurado cruzado, com o rótulo "+5 frentes"). Ao lado: "8 de 21 frentes (38%)" e "Escopo cresceu 31%" (adicionadas ÷ escopo original). Avanço e escopo na **mesma linha**, nunca separados. Ordenação padrão: maior crescimento de escopo.
- **Eixos:** x = frentes (contagem); y = projetos.
- **Segmentação:** por projeto; granularidade projeto → frente (consolidação pelos vínculos pai/filho).
- **Base:** "21 frentes no projeto Alfa (16 originais, 5 adicionadas)". Censo: sem mínimo de 20.
- **Meta:** "Avanço sempre calculado pelos cards filhos, com o crescimento de escopo reportado na revisão mensal". Não existe campo de avanço informado manualmente na tela (regra do briefing).
- **Leitura:** "O projeto Alfa tem 8 de 21 frentes concluídas (38%). Cinco frentes foram adicionadas depois do início: o escopo cresceu 31%."
- **Nota:** *O que é:* percentual de frentes concluídas e quanto o escopo cresceu. *Como se calcula:* concluídas ÷ total (originais + adicionadas); concluída = todas as stories entregues e disponível para uso; adicionadas = frentes marcadas como criadas após o início. *Como ler:* um projeto pode entregar frentes e ainda estar mais longe do fim do que no mês anterior. *Meta:* avanço calculado, nunca declarado. *Cuidados:* contar frentes é aproximação (têm tamanhos diferentes); escopo crescente é informação, não erro.
- **Dados:** `dim_card` (card_pai, tipo, concluido_em, criado_em, marca de escopo adicionado).

---

## FL3 · Estratégico (fonte: BusinessMap · granularidade: projeto)

### E1 · Lead time de projetos
- **Pergunta:** Quanto tempo leva entre decidir fazer algo e esse algo estar em produção, e o gargalo está na execução ou na decisão?
- **Gráfico:** (a) dispersão: cada ponto é um projeto concluído; x = trimestre de conclusão, y = lead time em dias úteis, com as linhas de mediana e P85 da janela; (b) barras horizontais "Antes do início" e "Execução" (medianas) com o texto "Fração antes do início: 40%".
- **Por quê:** a dispersão importa mais que a mediana (define se uma data pode ser prometida); a decomposição diz se o problema é de decisão ou execução.
- **Eixos:** x = trimestres, y = dias úteis (rótulo auxiliar "≈ 4,5 meses" na mediana).
- **Base:** (rev. 2, J1) "Pontos: 23 projetos concluídos em 12 meses · Percentis: 7 de 20 projetos mínimos nas últimas 12 semanas". Os pontos mostram o período escolhido; mediana, P85 e fração "antes do início" usam só a janela de 12 semanas e somem com < 20 projetos (o esperado na maior parte do tempo; texto de 6.3.1). Os pontos e a contagem permanecem.
- **Meta:** "−25% da mediana ao ano" (variação mostrada só se as duas janelas tiverem ≥ 20 projetos; com a janela de 12 semanas aparece, em geral, "Comparação indisponível: amostra insuficiente em uma das janelas.").
- **Leitura (amostra insuficiente, rev. 2):** "Foram concluídos 7 projetos nas últimas 12 semanas. Abaixo de 20 não publicamos mediana nem P85; cada projeto aparece como ponto."
- **Leitura (com amostra):** "A mediana do lead time dos projetos é 98 dias úteis. 40% desse tempo passa antes de o trabalho começar: a conversa é de priorização e governança, não de capacidade técnica."
- **Nota:** *O que é:* tempo da aprovação na comissão até a entrega. *Como se calcula:* criação do card do projeto → entrega, em dias úteis, decomposto em antes e depois do início. *Como ler:* mais da metade antes do início aponta para priorização, não para execução. *Meta:* −25% da mediana ao ano. *Cuidados:* o tempo do TAP anterior à aprovação está fora do escopo; poucos projetos por ano tornam a amostra pequena.
- **Dados:** `dim_card` (tipo projeto, criado_em, iniciado_em, concluido_em).

### E2 · Capacidade por objetivo estratégico
- **Pergunta:** A carteira reflete as prioridades declaradas da empresa?
- **Gráfico:** barras horizontais 100% empilhadas por trimestre; segmentos: um por objetivo estratégico, "Obrigação legal", "Manutenção" e **"Fora de objetivo"** (destaque com contorno grosso e padrão). KPI: "Evolução vinculada a objetivo: 61%" com a meta de 60%.
- **Eixos:** x = % da capacidade entregue; y = trimestres.
- **Base:** "180 itens entregues no trimestre". % some se < 20 itens no trimestre.
- **Meta:** "≥ 60% da evolução vinculada a objetivos declarados" (status).
- **Leitura:** "61% da capacidade de evolução está ligada a um objetivo; 14% está fora de qualquer objetivo."
- **Nota:** *O que é:* percentual da capacidade entregue por objetivo. *Como se calcula:* itens entregues no trimestre, agrupados pelo `objetivo_estrategico` do projeto de origem. *Como ler:* é o teste de coerência entre discurso e execução; "Fora de objetivo" é o que merece explicação. *Meta:* ≥ 60%. *Cuidados:* manutenção e obrigação legal são categorias legítimas; forçar tudo em um objetivo gera classificação decorativa.
- **Dados:** `dim_card` (objetivo_estrategico, card_pai, concluido_em, tipo). Ver pergunta 10.

### E3 · Entrega × resultado
- **Pergunta:** O que entregamos produziu o efeito que justificou a iniciativa?
- **Gráfico:** lista de iniciativas; cada linha tem: nome, resultado esperado (texto, "declarado antes do início: sim/não"), barra "ganho medido ÷ previsto" com marcador de 100% e o valor em %, e a medida (por exemplo "tempo de fechamento: 3 dias → 4 h; realizado 7 h"). Iniciativas **sem ficha** aparecem primeiro com o selo "Sem resultado declarado".
- **Eixos:** x = % do ganho previsto (0 a 150%); linhas = iniciativas.
- **Base:** "9 de 11 iniciativas com resultado declarado". Censo, sem mínimo.
- **Meta:** "100% das iniciativas com resultado declarado antes do início" (status).
- **Leitura:** "2 de 11 iniciativas não têm resultado declarado. Entre as medidas, a iniciativa 'Fechamento mensal' atingiu 82% do ganho previsto."
- **Nota:** *O que é:* o ganho medido contra o previsto. *Como se calcula:* ganho medido ÷ ganho previsto, com o previsto declarado antes do início. *Como ler:* entregar não é o mesmo que resolver; 40% do ganho é aprendizado, não falha. *Meta:* 100% com resultado declarado. *Cuidados:* sem esse fechamento o painel mede movimento, não valor. Valores são fictícios.
- **Dados:** ficha de resultado por iniciativa (configuração: esperado, unidade, medição, realizado, data de declaração).

---

## Sustentação (fonte: Acelerato · granularidade: chamado)

Todos os cartões levam o selo de fonte "Acelerato" e o selo de granularidade "Chamado". Nunca aparecem junto de BusinessMap.

### S1 · Primeiro atendimento e restauração, por prioridade
- **Pergunta:** Quanto tempo levamos para tocar no chamado e para restaurar o serviço, em cada prioridade?
- **Gráfico:** duas linhas de gráficos de barras horizontais (MTTA e MTTR), uma barra por prioridade P1 a P5; cada barra mostra o tempo **como proporção do alvo da própria prioridade** (100% = alvo), com marcadores de P50 e P85 e rótulo do valor real na unidade da prioridade (rev. 2, J2: "0,37 h úteis" em P1; "3 h úteis" em P3; "1,5 dia útil" em P4; nunca minutos nem horas corridas). Normalizar permite comparar prioridades com prazos muito diferentes sem misturá-las: o alvo de cada uma está escrito ao lado ("alvo: 0,25 h úteis"). Tabela abaixo: Prioridade · Alvo · Mediana · P85 · P95 · Média · Base.
- **Eixos:** x = tempo realizado ÷ alvo (0% a 300%+, com marcador de 100%); y = prioridades. Alvos da matriz (rev. 2, J2: todos em horas úteis; 1 dia útil = 8 h úteis; exibidos na unidade da prioridade):
| Prioridade | Primeiro atendimento | Restauração |
|---|---|---|
| P1 | 0,25 h úteis (15 min no briefing) | 4 h úteis |
| P2 | 0,5 h úteis (30 min no briefing) | 8 h úteis |
| P3 | 2 h úteis | 16 h úteis (2 dias úteis no briefing) |
| P4 | 0,5 dia útil (4 h úteis) | 5 dias úteis (40 h úteis) |
| P5 | 1 dia útil (8 h úteis) | 10 dias úteis (80 h úteis) |
Os valores entre parênteses são só conversão para o leitor desta spec; a tela mostra apenas a unidade da coluna da prioridade. A normalização do eixo (tempo ÷ alvo, ambos em horas úteis) não muda. Os alvos de P1 e P2 em "tempo corrido" no briefing passam a ser lidos como horas úteis por decisão do tech lead; ver pergunta 11.
- **Segmentação:** sempre por prioridade, **nunca agregado**. Filtro Prioridade limita as linhas mostradas.
- **Base:** "P2 · 41 chamados fechados no período; 3 com exceção de registro posterior (fora)". Prioridade < 20 chamados: linha com "Amostra insuficiente (12 de 20 itens mínimos)" e sem barra.
- **Meta:** alvos da matriz (status por prioridade: "Mediana dentro do alvo" / "Mediana acima do alvo").
- **Leitura:** "P2: metade dos chamados restaura em até 7 h úteis (alvo: 8 h úteis); 85% em até 14 h úteis."
- **Nota:** *O que é:* tempo até o primeiro atendimento (MTTA) e até a restauração validada (MTTR). *Como se calcula:* tempo útil pelo calendário de expediente; no MTTR, as pendências são descontadas do relógio de resolução; exceções de registro posterior saem desta apuração. *Como ler:* cada barra é comparada ao alvo da sua prioridade. *Meta:* os prazos da matriz Impacto × Urgência. *Cuidados:* o pedido de informação ao solicitante, sendo o primeiro comentário, já marca o primeiro atendimento; use mediana e P85 (a média aparece só na tabela, nunca sozinha). Todas as prioridades, inclusive P1, são medidas em horas úteis (dia útil = 8 horas úteis). Ver pergunta 11.
- **Dados:** chamados fechados (prioridade, aberto_em, primeiro_atendimento_em, restaurado_em, tempo em pendência, flag de exceção de registro posterior, equipe).

### S2 · Aderência ao SLA, por prioridade
- **Pergunta:** Cumprimos o prazo de responder e o prazo de restaurar, e em qual deles falhamos?
- **Gráfico:** colunas agrupadas por prioridade (P1 a P5), duas colunas por grupo: "Primeiro atendimento" e "Restauração", altura = % dentro do prazo; linha de meta em 90%. Rótulo de valor em cada coluna e "k de n" na tabela abaixo. Agrupadas porque a comparação relevante é entre os dois prazos da mesma prioridade.
- **Eixos:** y = % dentro do prazo (0 a 100); x = prioridades.
- **Base:** "P2 · 41 chamados". Célula < 20 chamados: sem coluna, com "12 de 20 itens mínimos"; a contagem "k de n" permanece.
- **Meta:** "Acima de 90%" (status por célula).
- **Leitura:** "P2 responde no prazo em 85% dos chamados, mas restaura no prazo em 74%: o gargalo está depois do primeiro contato."
- **Nota:** *O que é:* percentual de chamados dentro do prazo, por prioridade e tipo de prazo. *Como se calcula:* chamados fechados com `REALIZADO_NO_PRAZO` ÷ fechados; separados primeiro atendimento e restauração; exceções de registro posterior ficam de fora. *Como ler:* falhar no primeiro atendimento é problema de triagem e fila; falhar na restauração é diagnóstico, escalação ou dependência. *Meta:* acima de 90%. *Cuidados:* P1 e P5 têm compromissos incomparáveis; nunca agregar.
- **Dados:** chamados fechados (prioridade, status_sla de primeiro atendimento e de resolução, exceção).

### S3 · Volume mensal por prioridade
- **Pergunta:** Quantos chamados de cada prioridade chegam por mês, e essa distribuição está mudando?
- **Gráfico:** colunas empilhadas por mês, segmentos P1 a P5 (paleta sequencial com rótulo/padrão); alternador "Absoluto | Proporção" (URL `s3=`). Em "Proporção", linha de destaque "P1 + P2". Tooltip e tabela incluem "Ajustes manuais de prioridade no mês (S7)" como contagem, para o cruzamento pedido.
- **Eixos:** x = meses (mês em andamento listrado e rotulado); y = chamados (absoluto) ou % (proporção).
- **Base:** "218 chamados abertos no período". Proporção mensal some se o mês tiver < 20 chamados; absoluto permanece.
- **Meta:** "Proporção de P1 e P2 estável" (texto, sem status).
- **Leitura:** "Em junho entraram 61 chamados, com concentração incomum de P1 e P2 (28%)."
- **Nota:** *O que é:* contagem mensal de chamados por prioridade. *Como se calcula:* chamados abertos no mês, pela prioridade da matriz Impacto × Urgência. *Como ler:* mês com menos aderência pode ser piora do atendimento ou só mais P1 e P2. *Meta:* proporção estável de P1/P2. *Cuidados:* inflação de prioridade (prioridade como fila preferencial) desloca a distribuição para cima sem que o ambiente piore; cruze com S7.
- **Dados:** chamados (aberto_em, prioridade, flag de ajuste manual).

### S4 · Onde o chamado foi resolvido
- **Pergunta:** Quanto do volume o primeiro nível resolve sozinho, e quanto chega ao especialista?
- **Gráfico:** (a) barras horizontais com o volume resolvido em N1, N2, N3 e Fornecedor, **cor única neutra** (sem verde/vermelho; o briefing não define meta); (b) tabela "Etapa · Tempo mediano · P85" para as etapas de atendimento, em "h úteis" (rev. 2, J2; sem prioridade na linha, então sem dias úteis). Texto fixo "Leia ao lado de S1 (tempo) e da reabertura; sem meta isolada."
- **Eixos:** x = chamados resolvidos; y = níveis.
- **Base:** "480 chamados fechados". Tempos somem por nível < 20 chamados.
- **Meta:** "Sem meta isolada" (texto fixo).
- **Leitura:** "O N1 resolveu 52% dos chamados; o N3 recebeu 9%."
- **Nota:** *O que é:* onde o chamado foi resolvido e quanto tempo passou em cada etapa. *Como se calcula:* o nível vem da **etapa de atendimento** (fonte da verdade), não da equipe atribuída. *Como ler:* mede eficácia da base de conhecimento do N1 e carga no N3, o recurso mais escasso. *Meta:* nenhuma isolada. *Cuidados:* se o N1 for cobrado por resolver, vai segurar chamados que deveriam escalar e o custo aparece no tempo de restauração.
- **Dados:** chamados fechados (nível de resolução, tempo em cada etapa).

### S5 · Motivos da escalação
- **Pergunta:** Por que o chamado saiu do primeiro nível?
- **Gráfico:** barras horizontais com os cinco valores do domínio fechado (Sem conhecimento técnico no N1, Sem solução ou contorno conhecido, Risco de estouro de SLA, Múltiplos sistemas ou dependências, Necessidade de atuação especializada), ordenadas por volume; destaque (contorno e rótulo "Foco da meta") em "Sem conhecimento técnico no N1". Alternativa "Evolução mensal" (100% empilhado). Alternador `s5=distribuicao|evolucao`.
- **Base:** "162 chamados escalados". Percentuais somem se < 20; contagens permanecem.
- **Meta:** "Reduzir a escalação por falta de conhecimento técnico no N1" (texto).
- **Leitura:** "Os dois primeiros motivos somam 62% das escalações e apontam para a mesma ação: base de conhecimento e capacitação do N1."
- **Nota:** *O que é:* a distribuição dos motivos de escalação. *Como se calcula:* campo "Motivo da escalação", obrigatório na saída de "Em diagnóstico". *Como ler:* cada motivo aponta para uma ação diferente; o último, ainda que pequeno, merece leitura própria. *Meta:* reduzir falta de conhecimento. *Cuidados:* distingue escalação legítima de escalação por comodidade.
- **Dados:** chamados (motivo_escalacao).

### S6 · Motivos de encerramento
- **Pergunta:** Como os chamados terminam: resolvidos de verdade, contornados ou nem eram incidente?
- **Gráfico:** barras horizontais com os **cinco valores do domínio fechado do campo "Motivo de encerramento"** (rev. 2, L3; briefing 3.4): "Resolução definitiva", "Contorno aplicado", "Reclassificado, não é incidente", "Encerrado sem retorno" e "Duplicado". A vírgula em "Reclassificado, não é incidente" faz parte do rótulo: é **um** valor, não dois; o gráfico tem exatamente 5 barras e a tabela equivalente exatamente 5 linhas, mesmo com contagem zero. Destaque numérico "Taxa de contorno: 22%". Alternador `s6=distribuicao|evolucao`.
- **Base:** "480 chamados encerrados". Taxa e percentuais somem < 20.
- **Meta:** "Acompanhamento contínuo da taxa de contorno" (texto).
- **Leitura:** "22% dos encerramentos foram por contorno: a causa raiz continua viva e cada um é candidato a Registro de Problema."
- **Nota:** *O que é:* distribuição do motivo de encerramento. *Como se calcula:* campo "Motivo de encerramento" no encerramento. *Como ler:* contorno é o insumo da Gestão de Problemas; reclassificado mede qualidade da entrada; sem retorno e duplicado medem higiene. *Meta:* acompanhamento contínuo. *Cuidados:* um quinto a um terço por contorno significa causa raiz viva.
- **Dados:** chamados (motivo_encerramento).

### S7 · Reclassificação
- **Pergunta:** Quantos chamados tiveram a classificação alterada, e por quê?
- **Gráfico:** dois blocos **separados** lado a lado, cada um com colunas mensais e KPI: (a) "Ajuste manual de prioridade" (contagem e "% dos chamados do mês"), com "Justificados: k de n"; (b) "Reclassificado, não é incidente" (contagem e %). Nunca somados.
- **Eixos:** x = meses; y = chamados (e %).
- **Base:** "Prioridade: 37 ajustes em 218 chamados; Tipo: 14 em 480". % some < 20 chamados no mês.
- **Meta:** "Sempre justificada; reduzir a reclassificação de tipo" (a justificativa mostra "k de n" e status só nesse item).
- **Leitura:** "37 chamados tiveram prioridade ajustada manualmente (todos justificados) e 14 foram encerrados como 'não é incidente'."
- **Nota:** *O que é:* dois fenômenos diferentes, medidos separados. *Como se calcula:* ajuste manual = campo "Prioridade ajustada manualmente = Sim", e "justificado" = campo de justificativa preenchido (não vazio); tipo = motivo de encerramento "Reclassificado, não é incidente". *Como ler:* ajuste de prioridade alto e estável indica matriz mal calibrada; de tipo, catálogo confuso. *Meta:* sempre justificada; reduzir a de tipo. *Cuidados:* as razões ficam em campo livre e ainda não há lista fechada (agrupamento trimestral está planejado); por isso esta tela não lista motivos.
- **Dados:** chamados (ajuste_manual, justificativa preenchida sim/não, motivo_encerramento).

---

## Espera invisível (transversal)

### EI · Espera invisível por nível
- **Pergunta:** Quanto do tempo que o solicitante experimenta acontece fora do período em que estávamos efetivamente trabalhando?
- **Gráfico (por nível):** (a) **par de barras na mesma escala**: "Visão do cliente" (barra cheia) e "Visão do time" (barra clara), mediana em dias úteis; a faixa entre elas rotulada "Espera invisível: 60%". (b) Evolução mensal: duas linhas (cliente e time) com a faixa entre elas sombreada, e marcadores de mudança de critério. Sempre as duas visões juntas; **não existe versão com uma só**.
- **(rev. 3) Segmentação, sempre uma classe por vez (abas, `role="tablist"`):** EI-FL1 por tipo (incidente, requisição, melhoria, bug interno, defeito em produção, dívida técnica); EI-FL3 por tipo de projeto (Iniciativa e Melhoria **não** se juntam); EI-SUST por prioridade P1 a P5. EI-FL2 não segmenta. Cada aba aplica sozinha a regra de 20 itens (as duas visões) e mostra "Amostra insuficiente ({n} de 20)" quando não passa; não existe aba "Todos" com mediana misturada. Abas com amostra insuficiente continuam selecionáveis. No mock, EI-FL3 fica em "Amostra insuficiente" por tipo, comportamento correto. Aba na URL: `ei=<valor>`. Os testids ganham o segmento: `ei-indice-fl1-incidente`. O cartão compacto dos painéis mostra a aba escolhida, nomeada no título.
- **Definição por nível (provisória; ver pergunta 1):**
| Nível | Granularidade | Visão do cliente | Visão do time |
|---|---|---|---|
| FL1 | demanda | lead time do cliente (entrada → entrega) | lead time da equipe (compromisso → entrega) |
| FL2 | frente | criação da frente → disponível para uso | compromisso da frente → disponível para uso |
| FL3 | projeto | aprovação na comissão (criação do card) → entrega | início → entrega |
| Sustentação | chamado | tempo de vida do chamado fechado (soma dos cinco totalizadores) | tempo "em atendimento" |
- **Cálculo:** `(visão_cliente − visão_time) ÷ visão_cliente` sobre as **medianas** da mesma janela e dos mesmos itens. Cada nível usa a janela da seção 4.0.3 (rev. 2, J1: 12 semanas em todos). **Unidade:** FL1 a FL3 em dias úteis; **Sustentação em horas úteis** (J2, "h úteis", sem minutos, sem horas corridas e sem conversão para dias; o índice é adimensional). Com a janela de 12 semanas, EI-FL3 (projetos) quase sempre e EI-FL2 (frentes) às vezes ficam em "Amostra insuficiente (7 de 20 projetos)": estado normal (6.3.1), igual no cartão do nível, em `/espera-invisivel` e na Visão geral, sem número parcial.
- **Base:** por nível: "FL1: 87 demandas · 12 semanas". Se **qualquer** das duas visões tiver < 20 itens, **nenhuma** é publicada (nunca uma visão isolada) e o bloco mostra "Amostra insuficiente (12 de 20 itens mínimos)".
- **Leitura:** "O cliente espera 45 dias úteis (mediana); o time tem o pedido por 18. 60% do tempo do solicitante acontece fora da nossa gestão. Acima de 50% a discussão é de fila, não de produtividade da equipe."
- **Meta:** "Reduzir; acima de 50% a discussão é de fila" (selo "Acima de 50%" com ícone e texto quando aplicável; não é meta numérica de aprovação, então não usa Dentro/Fora da meta).
- **Nota:** *O que é:* a fração do tempo do cliente fora da gestão do time. *Como se calcula:* a fórmula acima, por nível. *Como ler:* os dois números são verdadeiros e medem coisas diferentes; o valor está na distância entre eles; a visão do cliente é a que vai para fora, a do time é a que orienta a melhoria interna. *Meta:* reduzir. *Cuidados:* só é comparável se os marcos estiverem registrados com disciplina; se o card nascer só quando o trabalho começa, a visão do cliente não existe e o índice dá zero quando deveria ser o mais alto. Em Sustentação, a leitura é diferente (tempo de vida inclui esperas do solicitante e de outros times) e vem de **outra fonte**: **não compare** com os níveis do BusinessMap.
- **Identificação (rev. 2, L5):** um cartão por nível, código `EI-FL1`, `EI-FL2`, `EI-FL3`, `EI-SUST`; id de âncora `ei-fl1`, `ei-fl2`, `ei-fl3`, `ei-sust`; testids `metrica-EI-FL1`..., `ei-cliente-fl1`, `ei-time-fl1`, `ei-indice-fl1`... (valores de `{nivel}`: `fl1`, `fl2`, `fl3`, `sust`). Em cada painel de nível há apenas o cartão do seu nível; em `/espera-invisivel` há os quatro.
- **Onde aparece:** seção "Espera invisível do nível" (cartão compacto: par de barras + índice + link "Ver evolução") em Operacional (semanal), Tático, Estratégico e Sustentação; página `/espera-invisivel` com os quatro blocos completos; resumo na Visão geral (três números por nível: cliente, time, índice).
- **Dados:** os mesmos de O9, T1, E1 e do tempo de vida e totalizadores do Acelerato.

---

## 4.1 Faça / não faça (rev. 3, padrões que erraram na fase A)
Checklist marcável por cartão: `docs/ux/checklist-cartao.md`.
| Faça | Não faça |
|---|---|
| Gerar o texto da janela ("12 semanas") do parâmetro único da janela | Escrever "12 semanas" ou "12 meses" fixo no texto |
| Série distinguida por cor **e** padrão (traço, marcador) | Diferenciar séries só por cor |
| Alvo clicável ≥ 24×24 px (abas, chips, "Remover filtro", links) | Links e botões de texto pequenos sem área de toque |
| Unidade no eixo ("dias úteis", "h úteis", "%") | Eixo só com números |
| Base, meta e rodapé a 14 px ou mais | Letra de 11 a 12 px em base e meta |
| Cor fixa por tipo/série em todo o sistema; estado (lenta, alerta) por variante com ícone e texto | Reusar a cor de um tipo para outro cartão ou sinalizar estado só por cor |
| "Remover filtro" que remove de fato e atualiza URL e dados | Chip com botão que não faz nada |
| Tabela alternativa por cartão e `data-testid` da convenção | Gráfico sem tabela; testid ad hoc |
| Links internos sem `mock` na URL (usa o parâmetro só onde 6.6 manda) | Propagar `mock` para links de navegação |
| Uma classe por vez (abas) em EI, T1, T2, T4 | Mediana ou índice de tipos, frentes ou projetos misturados |
| Ordem neutra por volume em T5 | Ordenar por parcela de falha |

## 5. Componentes reutilizáveis

| Componente | Uso e regras |
|---|---|
| `AppShell` | Cabeçalho, navegação, selo "Dados fictícios", tema, ajuda, link "Pular para o conteúdo", rodapé com aviso. |
| `CabecalhoPainel` | `h1`, pergunta central, "Dados até", fonte, "Copiar link". |
| `BarraFiltros` + `FiltroMulti` + `FiltroPeriodo` + `ChipsFiltros` | Seção 2. Sticky ≥768px; folha em <768px. |
| `SeletorCadencia` | Grupo de rádio segmentado "Diária / Semanal" (`role="radiogroup"`); altera `cadencia` na URL e o conteúdo; o foco permanece no seletor. |
| `FaixaAtencao` | Lista de alertas com ícone, texto e link de âncora. Vazio: "Nada pede atenção agora." Nunca esconde alertas por cor. |
| `CartaoMetrica` | Anatomia 4.0. Variantes: `padrao`, `compacto` (EI, Visão geral). Contém `figure`, `figcaption`, tabela alternativa, nota, base, rodapé e estados. |
| `BadgeBase` | Texto "Base: N itens · janela". Variantes: `ok`, `insuficiente` (ícone de atenção, texto "12 de 20 itens mínimos"), `censo` ("k de n"). Tooltip: o que conta como item. |
| `NotaMetodologica` | Botão "Como ler e como é calculado" com `aria-expanded` e `aria-controls`; região com as cinco seções (4.0.1) + "Nesta tela". Estado fechado por padrão; abrir/fechar não muda o foco. |
| `AmostraInsuficiente` | Painel substituto do gráfico ou da estatística (6.3). |
| `EstadoVazio`, `EstadoErro`, `EsqueletoCartao` | Seção 6. |
| `MarcadorCriterio` | Linha vertical tracejada com bandeira e rótulo "Mudança de critério em DD/MM/AAAA" nos gráficos de série que cruzam a data, com tooltip da descrição; e `AvisoCriterio` (faixa acima do gráfico: "Esta série atravessa uma mudança de critério. Não compare antes e depois diretamente." + link para Ajuda). Em cartões de percentil cuja janela cruza a data: "A janela de 12 semanas inclui dados anteriores à mudança de critério de DD/MM." Lista oficial em `/ajuda#criterios`. |
| `AvisoDadosFicticios` | Selo "Dados fictícios" no cabeçalho (texto + ícone, contraste 4.5:1), popover com a explicação; texto no rodapé. Não dispensável. |
| `SeletorLocal` | Abas (`role="tablist"`) para tipo, classe, etc., com contagem e selo "(amostra insuficiente)" na aba quando aplicável; setas movem, Enter/Espaço selecionam; reflete na URL. |
| `AlternarTabela` | Botão "Ver como tabela" / "Ver como gráfico" no cabeçalho do cartão; troca o gráfico pela tabela de dados equivalente. |
| `TabelaDados` | `table` com `caption`, `th scope`, números alinhados à direita, rolagem horizontal acessível em telas estreitas. |
| `GraficoBase` | Contêiner `figure`, resumo textual associado (`aria-describedby` na frase de leitura), tooltips acessíveis, paleta e padrões, regras de foco. |
| `ParEspera` | Par de barras cliente × time com a faixa de espera; nunca renderiza uma barra isolada. |
| `ChipFonte`, `ChipGranularidade`, `ChipMeta`, `ChipFiltros` | Rótulos de rodapé: "Fonte: BusinessMap", "Granularidade: demanda", "Meta: ...", "Filtros aplicados..." / "Não afetado por...". |
| `StatusMeta` | Ícone + texto: "Dentro da meta", "Fora da meta", "Sem meta numérica", "Sem referência". |
| `Dica` (tooltip) | Aparece em foco e hover, dispensável com Esc, não some ao passar o mouse sobre ela (WCAG 1.4.13). |
| `Toast` | Somente para "Link copiado" e confirmações curtas, `role="status"`, some em 5 s e não pode ser a única forma de saber o resultado. |
| `AvisoFiltrosInvalidos` | Aviso de 2.6. |

---

## 6. Estados

### 6.1 Carregando
- Esqueleto do cartão com **as mesmas dimensões** do conteúdo (sem salto de layout). Texto oculto para leitores de tela: "Carregando O3 Tempo de ciclo". `aria-busy="true"` no cartão.
- O esqueleto só aparece se o carregamento passar de 150 ms e, uma vez mostrado, permanece pelo menos 300 ms (evita piscar).
- Com `prefers-reduced-motion`, o esqueleto é estático (sem brilho animado).
- Mudar filtro com dados já na tela: mantém o conteúdo antigo esmaecido por até 150 ms e então mostra o esqueleto; a região `aria-live` anuncia "Atualizando painel" e "Painel atualizado".

### 6.2 Vazio (filtros sem dados)
- Substitui o gráfico por: ícone, título "Nenhum item encontrado", texto "Não há itens para estes filtros no período." e botões de ação: "Limpar filtros" e, para cada filtro ativo, "Remover filtro Tipo". Altura reduzida.
- Diferente de "amostra insuficiente" (1 a 19 itens). Vazio = 0 itens.
- Se todos os cartões da página estão vazios, um aviso no topo do painel repete a causa uma vez.
- Lista de "Itens para olhar primeiro" e "Bloqueados agora" vazias com dados válidos não é erro: "Nenhum item acima do P95 hoje." / "Nenhum item bloqueado hoje." (estado positivo).

### 6.3 Amostra insuficiente
```
+-- ⚠ Amostra insuficiente ----------------------------------------------+
| Só publicamos esta estatística com pelo menos 20 itens.                |
| Aqui há 12 itens (12 de 20 itens mínimos).   [██████░░░░] 12/20         |
| Para chegar a 20, tente: [Remover filtro Sistema] [Escolher outro tipo] |
+------------------------------------------------------------------------+
```
- Substitui apenas a estatística afetada (percentis, histograma, taxa), não o cartão inteiro: a base e a contagem permanecem.
- Barra de progresso com `role="meter"` (`aria-valuenow=12`, `aria-valuemin=0`, `aria-valuemax=20`) e texto equivalente.
- Mostra sugestões só para filtros ativos que reduzem a amostra; se não houver filtros: "Esta classe tem poucos itens mesmo sem filtros."
- O selo `BadgeBase` fica na variante `insuficiente`; o rótulo da aba/linha repete "(amostra insuficiente)".
- Em tabelas, a célula mostra "—" + `<abbr>`/texto "amostra insuficiente"; nunca célula em branco.

### 6.3.1 Amostra insuficiente em frentes e projetos: estado normal (rev. 2, J1)
Vale para E1, T7 (percentis e histograma), EI-FL2, EI-FL3 e a linha correspondente da Visão geral. Com a janela de 12 semanas, poucos projetos (e às vezes poucas frentes) terminam, então este estado é **esperado**, não falha. Regras de apresentação:
- Visual neutro e informativo: ícone "i" (não o triângulo de alerta), sem cor de erro, sem `role="alert"`; selo de base `insuficiente`; a barra `role="meter"` continua.
- Texto fixo (variante `lenta` do `AmostraInsuficiente`), no lugar do "Para chegar a 20, tente…":
  - Título: "Amostra insuficiente"
  - Linha 1: "Foram concluídos {n} {projetos|frentes} nas últimas 12 semanas ({n} de 20 itens mínimos)."
  - Linha 2: "Isso é esperado: {projetos terminam em poucas unidades por trimestre|frentes terminam em número menor que stories}, então em 12 semanas é comum ficar abaixo de 20. Só publicamos percentis com pelo menos 20 itens, para não mostrar uma precisão que os dados não sustentam."
  - Linha 3: "Cada {projeto|frente} concluído aparece como ponto e a contagem está acima."
- Não sugere aumentar a janela, trocar o período nem mudar a regra; a janela de percentis é a mesma em todos os níveis. A sugestão "Remover filtro {nome}" só aparece se houver filtro ativo que reduza a amostra.
- Na Visão geral, o indicador mostra "Amostra insuficiente ({n} de 20 projetos)" e o status do cartão do nível segue a regra de 3.1 (não conta como "Atenção").
- Pontos, listas, contagens e censos (T9, E3) permanecem sempre visíveis.

### 6.4 Erro
- Por cartão: ícone, título "Não foi possível carregar este gráfico", texto "Tivemos um problema ao ler os dados. Seus filtros foram mantidos." e botão "Tentar de novo". Região `role="alert"` na primeira ocorrência da página; as demais são `role="status"` para não interromper.
- Erro em um cartão não bloqueia os outros nem a navegação.
- Erro de página (falha na rota): título "Não foi possível abrir este painel", botões "Tentar de novo" e "Ir para a Visão geral".
- 404: "Página não encontrada" + "Ir para a Visão geral".
- Detalhe técnico (código) em texto pequeno recolhido "Detalhes técnicos".

### 6.5 Sucesso
- Cartão com dados: conteúdo completo; **nenhum toast** para carregamento. Status "Painel atualizado" só na região `aria-live` (invisível).
- Estados de sucesso explícitos: "Link copiado.", "Filtros limpos.", "Nenhum item bloqueado hoje." (positivo).
- "Sem permissão": não se aplica nesta etapa (sem login).

### 6.6 Estados simulados (para validação e testes)
O parâmetro oculto `mock` na URL força estados. Não aparece na interface (nem em chips, nem em avisos); fica documentado no README. Serve para a validação com as áreas e para o QA. (rev. 2, L13) Definição completa:
| Valor | Efeito |
|---|---|
| `mock=carregando` | Todos os cartões do painel ficam no esqueleto **indefinidamente** (sem tempo limite nem retorno por si só). O esqueleto segue a regra de 6.1 (aparece após 150 ms). |
| `mock=erro` | Erro de painel (6.4). |
| `mock=vazio` | Todos os cartões do painel no estado vazio (6.2). |
| `mock=erro:{id}` | Só o cartão indicado mostra o erro de cartão; **falha em todas as tentativas** ("Tentar de novo" repete e falha de novo). Aceita lista separada por vírgula: `mock=erro:o3,t1`. |
| `mock=erro-uma-vez:{id}` | Só o cartão indicado falha na primeira carga; "Tentar de novo" carrega com sucesso. Serve para testar a recuperação. Lista por vírgula também. |
- **Ids válidos** (os mesmos ids de âncora, minúsculas): `o1`, `o2`, `o3`, `o4`, `o7`, `o9`, `o10`, `o12`, `o15`, `o18`, `t1`, `t2`, `t3`, `t4`, `t5`, `t7`, `t9`, `e1`, `e2`, `e3`, `s1` a `s7`, `bloqueados`, `ei-fl1`, `ei-fl2`, `ei-fl3`, `ei-sust`; na Visão geral também `atencao`, `nivel-operacional`, `nivel-tatico`, `nivel-estrategico`, `nivel-sustentacao`. Id que não existe na página aberta é ignorado em silêncio.
- **Persistência:** `mock` vale só para a página cuja URL o contém. Mudar filtros nessa página mantém o `mock` na URL (a página continua simulando o estado). Os links de navegação entre painéis **não** propagam `mock`, e "Copiar link" **não** o inclui. Valor inválido (`?mock=xyz`) é ignorado, sem aviso.
- `mock` não participa de 2.6: nunca gera o aviso de filtros ignorados.

---

## 7. Microcopy (português do Brasil)

### 7.1 Estrutura global
| Elemento | Texto |
|---|---|
| Título do site | Métricas DSPD |
| `<title>` | "{Painel} · Métricas DSPD · Dados fictícios" |
| Navegação | Visão geral · Operacional · Tático · Estratégico · Sustentação · Espera invisível · Ajuda |
| Pular link | Pular para o conteúdo |
| Selo | Dados fictícios |
| Popover do selo | Estes painéis usam dados gerados para validar a experiência. Nenhum número representa a operação real. |
| Rodapé | Dados fictícios gerados para validar a experiência. Nenhum número representa a operação real. Dados até {data}. |
| Tema | Tema: Claro · Escuro · Sistema |
| Cabeçalho de painel | Dados até {data} · Fonte: BusinessMap / Acelerato |
| Copiar link | Copiar link desta visão · Confirmação: "Link copiado." |
| Ajuda | Como ler os painéis |

### 7.2 Filtros
| Elemento | Texto |
|---|---|
| Rótulos | Equipe · Tipo de demanda · Sistema · Período · Prioridade |
| Valor padrão | Todas · Todos |
| Botões | Limpar filtros · Limpar · Fechar · Aplicar período · Ver resultados · Filtros ({n}) |
| Chip | "{Filtro}: {valor}" com botão "Remover filtro {Filtro}: {valor}" |
| Período | Últimas 4 semanas · Últimas 12 semanas · Últimos 6 meses · Últimos 12 meses · Personalizado · De · Até |
| Equipe múltipla | Resultado consolidado de {n} equipes. O sistema não compara equipes. (sempre que {n} ≥ 2, inclusive em "Todas") |
| Filtros não aplicáveis (Estratégico) | Equipe e Tipo de demanda não se aplicam ao nível estratégico. Seus filtros foram guardados e voltam quando você abrir outro painel de fluxo. |
| Tema (nome acessível) | Tema · opções: Claro, Escuro, Sistema |
| Estratégico | O nível estratégico olha projetos, que envolvem várias equipes. Por isso não há filtro por equipe. |
| Tipo | Aqui são cards do BusinessMap. Chamados do Acelerato estão no painel Sustentação. |
| Cartão | Filtros aplicados: {lista} · Não afetado por: {lista} |
| Janela | Janela fixa: 12 semanas. Os percentis usam sempre as últimas 12 semanas do período escolhido. |
| Aviso de link | Alguns filtros do link não existem e foram ignorados: {lista}. |
| Anúncio | Filtros atualizados. {resumo} · Filtros limpos. |

### 7.3 Painéis e cartões
| Elemento | Texto |
|---|---|
| Faixa de atenção | Pede atenção hoje / na semana / agora · Nada pede atenção agora com base nas metas publicadas. |
| Botões de cartão | Como ler e como é calculado · Ver como tabela · Ver como gráfico · Tentar de novo |
| Seções da nota | O que é · Como se calcula · Como ler · Meta · Cuidados e limites · Nesta tela |
| Base | Base: {n} {itens} · {janela} |
| Base insuficiente | Amostra insuficiente: {n} de 20 itens mínimos |
| Janela | Janela: últimas 12 semanas ({data} a {data}) em todas as granularidades (rev. 2, J1: não existe "Janela: 12 meses (provisória)") |
| Amostra insuficiente em projetos/frentes | Ver texto fixo em 6.3.1 |
| T5 | Ordem por volume de demanda. Não é um ranking. · A parcela de falha vem de processos e entregas anteriores, não das áreas. |
| Em andamento | Semana em andamento · Mês em andamento · Em apuração até {data} |
| Percentis | 50% em até {x} dias úteis · 85% em até {y} dias úteis · 95% em até {z} dias úteis. Sustentação (rev. 2, J2): "50% em até {x} h úteis" (P1 a P3, S4, EI-SUST) ou "{x} dias úteis" (P4 e P5); nunca minutos nem horas corridas |
| Mudança de critério | Mudança de critério em {data}: {descrição} · Esta série atravessa uma mudança de critério. Não compare antes e depois diretamente. |
| Meta | Meta: {texto} · Status: Dentro da meta · Fora da meta · Sem meta numérica · Sem referência |
| Retratos | Itens para olhar primeiro · Bloqueados agora · Sem mover há · Bloqueado há |
| Situação do item | Acima do P95 do tipo · Entre P85 e P95 · Dentro do esperado · Sem referência: amostra insuficiente |
| Visão geral | O que pede atenção agora · Por reunião · Abrir painel {nome} · Ver todos os alertas ({n}) |
| EI | Visão do cliente · Visão do time · Espera invisível · Acima de 50%: a discussão é de fila, não de produtividade da equipe. |
| Fonte | Fonte: BusinessMap · Fonte: Acelerato · Fonte diferente (Acelerato). Não comparável com os níveis acima. |
| Sustentação | Chamados fechados nas apurações de tempo e aderência. Exceção de SLA por registro posterior fica fora. |
| O15 | O que se cobra é a taxa de escape, não o volume de bugs internos. |

### 7.4 Estados
| Estado | Texto |
|---|---|
| Carregando | Carregando {código} {título}… |
| Vazio | Nenhum item encontrado. Não há itens para estes filtros no período. [Limpar filtros] |
| Amostra insuficiente | Amostra insuficiente. Só publicamos esta estatística com pelo menos 20 itens. Aqui há {n} ({n} de 20 itens mínimos). |
| Erro de cartão | Não foi possível carregar este gráfico. Tivemos um problema ao ler os dados. Seus filtros foram mantidos. [Tentar de novo] |
| Erro de página | Não foi possível abrir este painel. [Tentar de novo] [Ir para a Visão geral] |
| 404 | Página não encontrada. [Ir para a Visão geral] |
| Positivo | Nenhum item acima do P95 hoje. · Nenhum item bloqueado hoje. |

### 7.5 Ajuda (`/ajuda`), estrutura e texto-base
1. **Como ler os painéis:** "Cada gráfico responde a uma pergunta. Procure primeiro a faixa 'Pede atenção'. Cada cartão mostra de quantos itens vem o número e traz uma nota com o cálculo."
2. **Regras de uso (âncora `#regras`):** "Nenhuma métrica deste sistema serve para avaliar pessoas. Não há visão por pessoa, ranking, meta individual nem comparação entre equipes. Os filtros por equipe recortam; não comparam."
3. **Como lemos os números:** percentis 50/85/95, janela de 12 semanas, mínimo de 20 itens, dias úteis (na Sustentação, horas úteis; 1 dia útil = 8 horas úteis), média nunca sozinha.
4. **Fontes:** BusinessMap (fluxo de projeto) e Acelerato (sustentação) nunca se misturam. (rev. 2, L14) "Incidente" e "Requisição" no fluxo são tipos de card do BusinessMap; não têm relação com os chamados do Acelerato, que só aparecem na Sustentação.
5. **Glossário:** WIP, cycle time, lead time do cliente e da equipe, SLE, SLA, MTTA, MTTR, aging, vazão, espera invisível, contenção, escape, densidade, objetivo estratégico, frente, projeto.
6. **Mudanças de critério (âncora `#criterios`):** tabela Data · O que mudou · Onde afeta. Dados do mock: 02/03/2026 "Marco de entrada passou a ser a criação do card na chegada do pedido" (afeta O7, O9, O10, T1, EI); 01/06/2026 "Novas etapas do Acelerato em produção e mapeamento dos totalizadores revisado" (afeta S1 a S7 e EI de sustentação). Valores fictícios.
7. **Sobre os dados:** "Dados fictícios gerados com semente fixa. Data de referência: {data}."

---

## 8. Acessibilidade (WCAG 2.2 AA)

### 8.1 Estrutura
- `lang="pt-BR"`; marcos `header`, `nav` (com rótulo), `main`, `footer`; um `h1` por rota; `h2` para seções; `h3` para cartões.
- Link "Pular para o conteúdo" é o primeiro foco; título da página único por rota.
- Troca de rota: foco vai para o `h1` (com `tabindex="-1"`) e o título muda.
- Âncora de cartão: o foco vai para o título do cartão.

### 8.2 Tema claro e escuro
- Preferência: Sistema (padrão), Claro, Escuro; guardada em `localStorage` na chave `metricas-dspd:tema` com os valores `claro`, `escuro` ou `sistema` (chave ausente = sistema); sem flash ao carregar (aplicar antes da pintura). (rev. 2, L5) O seletor é um grupo `role="radiogroup"` com nome acessível "Tema" e três opções com rótulo visível ou nome acessível "Claro", "Escuro" e "Sistema" (`data-testid="seletor-tema"`).
- Tokens semânticos (o front implementa por variáveis CSS; valores são ponto de partida e **precisam ser validados** com axe e medidor de contraste):

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--superficie` | #FFFFFF | #161C2A | Cartões |
| `--fundo` | #F6F7F9 | #0F1420 | Página |
| `--texto` | #1A1F2B (16:1) | #E8ECF4 (≥14:1) | Texto principal |
| `--texto-2` | #4A5365 (≥7:1) | #AAB3C5 (≥8:1) | Texto secundário |
| `--borda-controle` | #6B7488 (4,7:1) | #8590A6 (≥4,5:1) | Bordas de campos, ícones de UI |
| `--acento` | #1F5FBF (6,1:1) | #6AA8FF (7:1) | Links, foco, seleção |
| `--alerta` | #B42318 (6,6:1) | #FF8A80 | Fora da meta, acima do P95 |
| `--atencao` | #8A5A00 (5,9:1) | #E0B040 | Atenção, em apuração |
| `--ok` | #0B6B3A (6,6:1) | #3CCB9B | Dentro da meta |

- Séries categóricas (≥3:1 contra a superfície, sempre com padrão ou rótulo): claro `#0072B2 #D55E00 #009E73 #7B3FA0 #B87A00 #CC79A7` + cinza `#5B6477` para "Outros"; escuro `#6AA8FF #FF9A5C #3CCB9B #B48CFF #E0B040 #F08CC0` + `#9AA3B5`. No máximo 7 séries por gráfico; acima disso agrupar em "Outros" com tabela completa.
- Gráficos sequenciais (P1 a P5; mapa de calor): rampa de uma cor com números escritos nas células.
- Foco visível: contorno de 2 px na cor `--acento`, deslocamento de 2 px, contraste ≥3:1 com o fundo adjacente, em ambos os temas.

### 8.3 Não depender só de cor
- Status: sempre ícone + texto ("Fora da meta"). Pontos do O2: círculo/losango/triângulo/anel. Séries: padrão (listras, pontos, hachura) + rótulo direto ou legenda com o padrão.
- Semana/mês em andamento: padrão listrado + rótulo.
- Linhas de percentil: tracejados diferentes + rótulo "P50/P85/P95" no próprio gráfico.
- Mapa de calor: número em cada célula.

### 8.4 Alternativa textual para cada gráfico
- Todo gráfico é um `figure` com `figcaption` (título + pergunta). A **frase de leitura** é a descrição curta (`aria-describedby`).
- Todo cartão tem "Ver como tabela" que substitui o gráfico por uma tabela com os mesmos números (cabeçalhos `th scope`, `caption`); o botão fica antes do gráfico na ordem do DOM. As listas (O2, bloqueados, T9) já são tabelas.
- Marcas do gráfico (barras, colunas, pontos de linha, até 12 marcas): navegáveis com setas (foco itinerante), mostrando o tooltip e anunciando "{série}: {valor} {unidade}, {contexto}". Dispersões e gráficos densos: SVG com `aria-hidden` e a tabela como equivalente.
- Tooltips: aparecem em foco e hover, dispensáveis com Esc, não somem ao mover o ponteiro sobre elas (1.4.13) e repetem os valores em texto.
- Número grande (KPI) tem texto completo ("P85: 9 dias úteis"), não só a cifra.

### 8.5 Teclado e foco
- Tudo operável por teclado; ordem de foco = ordem visual = ordem de leitura; sem armadilhas (WCAG 2.1.2).
- Popovers de filtro: Enter/Espaço abrem, Tab percorre as opções, Esc fecha e devolve o foco; sem arrastar nada (2.5.7); datas com `input type="date"` ou campo digitável.
- Gaveta e folha de filtros: diálogos modais (`role="dialog"`, `aria-modal`), foco preso, Esc fecha, foco volta ao disparador.
- Barra de filtros sticky e cabeçalho não podem cobrir o elemento focado (`scroll-padding-top`, WCAG 2.4.11).
- Abas (`SeletorLocal`): setas entre abas; Tab sai para o conteúdo.
- Atalhos de teclado de uma tecla: **não usar** (2.1.4).
- Nada atualiza sozinho nem se move (2.2.2); sem polling.
- Alvos de toque ≥ 44×44 px em <768 px e ≥ 24×24 px em todas as larguras (2.5.8); chips de remoção e botões de ícone também.

### 8.6 Responsividade (mobile-first; breakpoints 640, 768, 1024, 1280)
| Largura | Layout |
|---|---|
| <640 | Uma coluna; barra de filtros vira botão "Filtros (n)" com folha; navegação em gaveta; cartões com gráfico em largura total e altura mínima 240 px; tabelas rolam na horizontal (`tabindex="0"`, rótulo "Tabela de {título}, role para os lados") com primeira coluna fixa; pequenos múltiplos de O7 empilhados; histogramas lado a lado do O10 empilham (cliente depois time, com o mesmo eixo x). |
| 640–767 | Uma coluna; KPIs em 2 colunas; ainda sem barra sticky. |
| 768–1023 | Barra de filtros sticky em linha; cartões de largura total; O2 gráfico acima da lista; navegação em gaveta. |
| 1024–1279 | Grade de 12 colunas conforme a seção 3; navegação horizontal. |
| ≥1280 | Mesma grade com largura máxima de 1440 px centralizada; gráficos ganham altura, não mais colunas. |
- Reflow sem rolagem horizontal da página em 320 px (1.4.10); texto escalável até 200% sem perda de conteúdo; espaçamento de texto (1.4.12) sem sobreposição; sem bloqueio de orientação.
- Ordem do DOM é a mesma em todas as larguras (nada de reordenar visualmente com CSS de forma que contradiga o foco).

### 8.7 Movimento e mídia
- Respeitar `prefers-reduced-motion`: sem animação de entrada de gráficos, esqueleto estático, transições ≤ 200 ms quando permitido (mudança de cadência, abrir nota).
- Nenhum áudio, vídeo ou conteúdo que pisque.

### 8.8 Formulários (filtros)
- Todo controle tem rótulo visível; erros do período personalizado ficam junto ao campo, ligados por `aria-describedby`, e são anunciados.
- Estados de campo desabilitado são evitados; quando um filtro não se aplica ao painel, ele não é exibido.

---

## 9. Necessidades de dados

### 9.1 O que a interface lê (modelo da seção 4.5 do briefing, mais campos da 4.4)
| Entidade | Campos que as telas usam |
|---|---|
| `dim_card` | card_id, titulo (fictício), tipo, classe_servico, sistema, area_solicitante, fornecedor, objetivo_estrategico, card_pai, criado_em, comprometido_em, iniciado_em, concluido_em, arquivado_em, motivo_descarte, tamanho_declarado (não usado no núcleo), data_acordada, responsabilidade_atraso, fase_deteccao, origem_bug (vínculo), origem_demanda, marca de escopo adicionado, coluna_atual, bloqueado (derivado), equipe |
| `fato_transicao` | card_id, coluna_origem, coluna_destino, tipo_coluna (fila/execucao), timestamp, direcao |
| `fato_bloqueio` | card_id, motivo, coluna, fornecedor, inicio, fim, duracao_horas_uteis |
| Sustentação (chamados) | id, equipe (SSSC TOTVS/SENIOR/FLUIG), prioridade P1 a P5, aberto_em, primeiro_atendimento_em, restaurado_em, finalizado_em, status_sla_r (prazo de resolução) e de primeiro atendimento, etapas e tempo por etapa (cinco totalizadores), nível de resolução (N1, N2, N3, fornecedor), motivo_escalacao, motivo_encerramento, prioridade_ajustada_manualmente, justificativa preenchida (sim/não), exceção_sla_registro_posterior, tempo em pendência, excluido=false |
| Configuração (fixtures, não vêm de `dim_card`) | data de corte; limites de WIP por coluna e por fluxo e de frentes simultâneas; SLE publicado por classe (com data); acordo de alocação por natureza; objetivos estratégicos; fichas de resultado (E3); mudanças de critério (data, descrição, métricas afetadas); expediente e feriados; alvos da matriz de prioridade |

O front consome tudo por uma única camada de cálculo (biblioteca compartilhada) que devolve, para cada estatística, `{ valor, n, minimo, publicavel, janela, marcadoresCriterio }`. Os componentes não calculam nada e nunca têm número fixo.

### 9.2 Requisitos do mock para exercitar a interface
- 12 meses ou mais de histórico antes da data de corte; hierarquia projeto → frente → story com vínculos; 6 ou mais equipes e 5 ou mais sistemas (Protheus, Fluig, Senior, marketing, 5G...).
- Caudas longas no tempo de ciclo; bloqueios com todos os motivos do domínio; bugs em todas as fases e causas; itens acima do P95 hoje; backlog com itens de mais de 180 dias; acordos vencidos com as quatro responsabilidades (inclusive "não classificado").
- **Classes com menos de 20 itens em pelo menos:** um tipo no FL1 (para O3, O9), uma classe de serviço no Tático (T1, T2, T4), um sistema/área em T5, a prioridade P1 na Sustentação (S1, S2), e o recorte de uma única equipe pequena. E também classes com mais de 20.
- (rev. 2, L11) **Com os filtros padrão (consolidado de todas as equipes, 12 semanas), o Operacional precisa ter pelo menos um tipo de demanda com menos de 20 itens concluídos na janela** (ex.: Dívida técnica ou Defeito em produção), além de tipos com 20 ou mais. Não basta a classe pequena existir só em filtro de uma equipe. "Iniciativa" não é opção do filtro de tipo (pergunta 9) e não serve para isso.
- Pelo menos 1 projeto com escopo adicionado; pelo menos 2 iniciativas sem ficha de resultado.
- (rev. 2, J1) Com a janela de 12 semanas: projetos concluídos na janela ficam abaixo de 20 (E1 e EI-FL3 em "Amostra insuficiente" é o esperado); frentes concluídas na janela devem ser 20 ou mais no consolidado padrão (T7 publica) e menos de 20 em filtros estreitos; EI-FL2 pode cair em insuficiente. O gerador deve conservar projetos concluídos em 12 meses (pontos de E1) mesmo que a janela tenha poucos.
- (rev. 2, J2) Chamados do mock com durações em horas úteis do calendário de 2.1, incluindo P1.
- Pelo menos 2 mudanças de critério (7.5, item 6) dentro do histórico.
- Dados de sustentação em população separada, sem relação com cards do BusinessMap.
- Nenhum nome de pessoa em lugar nenhum.

---

## 10. Critérios de aceite

Convenção de identificadores para teste (`data-testid`): `painel-{slug}`, `filtro-{equipe|tipo|sistema|periodo|prioridade}`, `chip-filtro-{nome}`, `limpar-filtros`, `copiar-link`, `metrica-{codigo}` (ex.: `metrica-O2`), `base-{codigo}`, `nota-{codigo}`, `tabela-{codigo}`, `amostra-insuficiente-{codigo}`, `estado-vazio-{codigo}`, `estado-erro-{codigo}`, `estado-carregando-{codigo}`, `marcador-criterio`, `aviso-dados-ficticios`, `ei-cliente-{nivel}`, `ei-time-{nivel}`, `ei-indice-{nivel}`, `seletor-local-{codigo}`, `seletor-cadencia`.

(rev. 2, L5) Complemento da convenção:
- `{codigo}` é o código do cartão em maiúsculas: `O1`..`S7`, `BLOQUEADOS` ("Bloqueados agora": `metrica-BLOQUEADOS`, `base-BLOQUEADOS`, `tabela-BLOQUEADOS`, `estado-vazio-BLOQUEADOS`) e `EI-FL1`, `EI-FL2`, `EI-FL3`, `EI-SUST` (cartões de Espera invisível: `metrica-EI-FL1`, `base-EI-FL1`, `amostra-insuficiente-EI-FL1`...).
- `{nivel}` nos testids `ei-*` é minúsculo: `fl1`, `fl2`, `fl3`, `sust` (ex.: `ei-indice-fl2`). Em `/espera-invisivel` existe um de cada, os quatro; nos painéis de nível, só o do seu nível.
- `{slug}` de `painel-{slug}`: `visao-geral`, `operacional`, `tatico`, `estrategico`, `sustentacao`, `espera-invisivel`, `ajuda`. Visão geral: `nivel-{operacional|tatico|estrategico|sustentacao}`, `faixa-atencao` (também nos painéis), `ei-resumo`.
- Avisos: `aviso-consolidado`, `aviso-filtros-invalidos`, `aviso-filtros-nao-aplicaveis`, `aviso-criterio`.
- Ids de âncora: ver 1.1 (cartões) e 3.3 (`tempo`, `fluxo`, `compromissos`, `backlog`, `qualidade`).
- Slugs de equipes, sistemas e equipes SSSC: seção 2.5.
- Tema: chave de `localStorage` `metricas-dspd:tema` (`claro`, `escuro`, `sistema`); seletor com nome acessível "Tema" (`seletor-tema`), opções "Claro", "Escuro", "Sistema" (8.2).
- Estado simulado `mock`: seção 6.6.

### Navegação e estrutura
1. `/` abre a Visão geral e é a entrada do sistema; `npm run dev` leva a ela.
2. A navegação tem exatamente os destinos Visão geral, Operacional, Tático, Estratégico, Sustentação e Espera invisível, nesta ordem, e o item da rota atual tem `aria-current="page"`.
3. As rotas `/operacional`, `/tatico`, `/estrategico`, `/sustentacao`, `/espera-invisivel` e `/ajuda` existem; uma rota desconhecida mostra a página 404 com link para `/`.
4. Cada rota tem um único `h1` e um `<title>` terminado em "Métricas DSPD · Dados fictícios"; ao trocar de rota o foco vai para o `h1`.
5. O link "Pular para o conteúdo" é o primeiro elemento focável e move o foco para o `main`.
6. Os links de navegação entre painéis de fluxo carregam `equipe`, `tipo`, `sistema` e `periodo` guardados na sessão (2.6.1); cada painel remove da URL o que não se aplica a ele (Estratégico: `equipe`, `tipo` e `periodo` diferente de `6m`/`12m`) e os valores voltam ao retornar a um painel de fluxo; os links para `/sustentacao` e `/` não carregam filtros.
7. Cada cartão de métrica tem `id` igual ao código em minúsculas; abrir `/tatico#t9` rola até o cartão e foca o título dele.

### Aviso de dados fictícios
8. Em **todas** as rotas há um elemento `aviso-dados-ficticios` visível no cabeçalho com o texto "Dados fictícios" e contraste ≥ 4,5:1 nos dois temas; não existe botão que o remova.
9. O rodapé de todas as rotas contém o texto "Dados fictícios gerados para validar a experiência" e a data dos dados.

### Visão geral
10. A Visão geral mostra a seção "O que pede atenção agora", quatro cartões de nível (Operacional, Tático, Estratégico, Sustentação) e o bloco Espera invisível.
11. Cada cartão de nível tem no máximo 3 indicadores, cada um com número, base e ícone de status, e um link "Abrir painel {nome}" que leva ao painel.
12. Cada alerta da seção "O que pede atenção agora" leva, por âncora, ao cartão da métrica que o originou.
13. Se nenhuma meta é violada, a seção mostra "Nada pede atenção agora com base nas metas publicadas."
14. O bloco Espera invisível mostra, para cada nível, as duas medianas e o índice juntos; a Sustentação aparece separada por um divisor com a legenda "Fonte diferente (Acelerato)".
15. A tabela "Por reunião" tem as seis reuniões da seção 1.4 com as perguntas fixas e links para os destinos descritos.

### Filtros
16. O Operacional e o Tático exibem os filtros Equipe, Tipo de demanda, Sistema e Período; o Estratégico exibe apenas Sistema e Período e explica por que não há filtro de equipe; a Sustentação exibe apenas Equipe (três opções SSSC TOTVS, SSSC SENIOR, SSSC FLUIG), Prioridade (P1 a P5) e Período.
17. Os padrões são: equipe, tipo, sistema e prioridade = todos; período = 12 semanas (Operacional, Tático), 12 meses (Estratégico), 6 meses (Sustentação).
18. Alterar um filtro atualiza a URL no mesmo instante e sem botão "Aplicar"; recarregar a página restaura exatamente os filtros; abrir a mesma URL em outra aba mostra os mesmos filtros e os mesmos números.
19. Apenas valores fora do padrão aparecem na URL; selecionar todos os valores de um filtro remove o parâmetro.
20. O botão Voltar do navegador desfaz a última mudança de filtros.
21. Filtros ativos aparecem como chips com botão de remover acessível ("Remover filtro Equipe: Protheus"); remover um chip remove só aquele filtro.
22. "Limpar filtros" só aparece com filtro fora do padrão, restaura todos os padrões do painel (inclusive o período) e anuncia "Filtros limpos."
23. O filtro de sustentação não é herdado pelo fluxo, nem o contrário.
24. Uma URL com valor de filtro inválido ignora só o valor inválido, mostra o aviso "Alguns filtros do link não existem e foram ignorados" e corrige a URL. Parâmetro conhecido mas não aplicável ao painel (2.6.1) é removido da URL em silêncio, sem esse aviso.
25. Sempre que o resultado soma 2 ou mais equipes (2 ou mais marcadas, "Todas" ou todas marcadas) aparece "Resultado consolidado de N equipes. O sistema não compara equipes." com N real e `aviso-consolidado`; com 1 equipe e no Estratégico não aparece; nenhum gráfico, tabela, legenda ou tooltip usa equipe como série, cor, faceta ou coluna.
26. O período personalizado valida: "De" anterior a "Até"; "Até" não posterior à data de corte; "De" não anterior ao início do histórico **informado pela fonte de dados** (a data da mensagem vem da fonte, não do código); intervalo mínimo de 7 dias; as mensagens de erro ficam junto dos campos e são lidas por leitor de tela.
27. Cada cartão afetado lista "Filtros aplicados" e cada cartão não afetado mostra "Não afetado por: {filtro}" conforme a tabela 2.2.
28. Em <768 px os filtros ficam numa folha acionada por "Filtros ({n})" e a página continua utilizável; em ≥768 px a barra permanece visível ao rolar e não cobre o foco do teclado.
29. O parâmetro `periodo` muda a janela da série; os percentis seguem usando 12 semanas até o fim do período e o selo "Janela fixa: 12 semanas" aparece quando o período difere de 12 semanas.

### Operacional
30. `/operacional` abre na cadência Diária; a ordem dos blocos é O2, Bloqueados agora, O1; a pergunta "Qual item mais velho não andou desde ontem?" está visível.
31. O seletor de cadência alterna para Semanal, atualiza `cadencia=semanal` na URL e exibe, nesta ordem, O3, O9, Espera invisível (EI-FL1), O4, O12, O10, O7, O15, O18, agrupados nas seções Tempo (O3, O9, EI-FL1), Fluxo (O4), Compromissos (O12), Backlog (O10, O7) e Qualidade (O15, O18); o atalho "Ir para" tem esses cinco nomes e leva ao `h2` da seção (`#tempo`, `#fluxo`, `#compromissos`, `#backlog`, `#qualidade`); O12 não aparece dentro de Fluxo.
32. A faixa "Pede atenção" lista, quando aplicável: itens acima do P95 (O2), aderência de WIP abaixo de 90% (O1), itens > 180 dias no backlog (O10), vencidos por causa interna (O12); cada item leva a seu cartão.
33. O2 mostra a lista "Itens para olhar primeiro" com Card, Tipo, Etapa, Idade (dias úteis) e "Sem mover há" e **nenhuma coluna de pessoa**; as linhas de P50, P85 e P95 aparecem só se o tipo tem 20 ou mais itens concluídos na janela.
34. "Bloqueados agora" lista motivo (domínio fechado) e "Bloqueado há"; sem responsável; com zero bloqueados mostra "Nenhum item bloqueado hoje."
35. O1 mostra a quebra por coluna apenas com uma equipe selecionada; com várias equipes mostra "Fila" × "Execução" e a mensagem "Selecione uma equipe para ver por coluna."; os itens bloqueados e as colunas de fila são contados no WIP.
36. O3 mostra P50, P85 e P95 juntos (a mediana nunca falta) e **uma classe por vez** via seletor local de tipo; não existe visão com todos os tipos misturados no mesmo gráfico.
37. O3 com menos de 20 itens no tipo selecionado oculta percentis e linhas e mostra "Amostra insuficiente" com "n de 20 itens mínimos"; os pontos individuais permanecem.
38. O4 mostra colunas semanais com a faixa e a mediana; a semana corrente aparece listrada e rotulada "em andamento"; com menos de 20 itens na janela, faixa e mediana são ocultas.
39. O7 mostra pelo menos 6 meses, um pequeno múltiplo por tipo e a tabela com saldo acumulado; o mês corrente é marcado como em andamento.
40. O9 mostra os três relógios com a mesma escala, histogramas por tipo com faixas curtas e a série mensal; nunca mistura tipos num histograma.
41. O10 mostra os dois histogramas (time e cliente) lado a lado, o contador de itens > 180 dias e a evolução com mediana e P85 (nunca só média).
42. O12 mostra vencidos por responsabilidade (Interno, Solicitante, Terceiro, Não classificado) e o KPI de vencidos por causa interna com meta zero e status.
43. O15 mostra as cinco fases na ordem do processo, taxa de contenção e taxa de escape, e o texto "O que se cobra é a taxa de escape, não o volume de bugs internos"; não existe meta nem status de cor sobre o volume de bugs.
44. O18 mostra entregas com e sem bug, taxa de entrega limpa e as duas densidades; meses dentro dos 30 dias de janela de vínculo aparecem como "em apuração".

### Tático
45. `/tatico` mostra as seções A (T2, T1, T5), B (T4, T3) e C (T9, T7) e o cartão de Espera invisível do nível, com a faixa "Pede atenção" no topo.
46. T1, T2 e T4 são por classe de serviço, sem agregado; "Intangível" mostra "Sem SLE".
47. T1 mostra quatro blocos (Fila, Espera, Execução, Homologação) e o link "Leia junto com Demanda × capacidade (T4)".
48. T2 mostra o percentual por classe com linha de meta em 85% e o mapa de calor com número em cada célula.
49. T3 mostra "Acordado" × "Realizado" por natureza e o desvio em pontos percentuais, com o selo quando maior que 10.
50. T4 só existe por classe; quando a chegada supera a vazão mostra "A fila cresce..." em vez de "semanas para zerar".
51. T5 oculta sistemas ou áreas com menos de 20 itens do gráfico e os lista em "Sem amostra suficiente" com a base.
52. T7 não mistura frente com story; mostra frentes por projeto e, com menos de 20 frentes concluídas **nas últimas 12 semanas**, oculta percentis e histograma (estado normal, texto de 6.3.1).
53. T9 mostra, na mesma linha, "k de n frentes (x%)" e o crescimento do escopo; não existe campo ou controle para informar avanço manualmente.

### Estratégico
54. `/estrategico` mostra E1, E2 e E3 e o cartão de Espera invisível do nível; não mostra filtros de Equipe nem de Tipo.
55. E1 mostra um ponto por projeto concluído no período; com menos de 20 projetos concluídos **nas últimas 12 semanas** oculta mediana, P85 e fração "antes do início", mantém os pontos e mostra o texto de 6.3.1 (visual informativo, não de erro).
56. E2 mostra a faixa "Fora de objetivo" com destaque e o KPI de evolução vinculada com meta de 60%.
57. E3 mostra iniciativas sem ficha primeiro, com o selo "Sem resultado declarado", e o contador "k de n".

### Sustentação
58. `/sustentacao` mostra a faixa de recorte DSPD-SSSC e os cartões S1 a S7 mais a Espera invisível da sustentação, todos com o selo "Fonte: Acelerato".
59. Nenhuma tela da Sustentação mostra dados do BusinessMap, e nenhuma tela do fluxo mostra chamados do Acelerato.
60. Não existe filtro, coluna, gráfico ou ranking por agente ou por pessoa em nenhuma tela.
61. S1 e S2 são sempre por prioridade (P1 a P5), nunca agregados; a prioridade com menos de 20 chamados mostra "Amostra insuficiente" e o "k de n".
62. S1 mostra o alvo de cada prioridade, o valor real com unidade escrita e a tabela com mediana, P85 e P95; as unidades são "h úteis" em P1, P2 e P3 e "dias úteis" em P4 e P5 (alvos da tabela de S1: P1 0,25 e 4 h úteis; P2 0,5 e 8; P3 2 e 16; P4 0,5 dia útil e 5 dias úteis; P5 1 dia útil e 10 dias úteis).
63. S2 mostra duas colunas por prioridade (primeiro atendimento e restauração) e a linha de 90%.
64. S3 alterna entre "Absoluto" e "Proporção" (`s3=` na URL) e mostra o ajuste manual do mês na tabela/tooltip.
65. S4 usa uma única cor neutra e o texto "sem meta isolada".
66. S5 e S6 mostram exatamente os cinco valores do domínio fechado cada (barras e linhas da tabela, mesmo com zero); os de S6 são "Resolução definitiva", "Contorno aplicado", "Reclassificado, não é incidente", "Encerrado sem retorno" e "Duplicado"; S6 mostra a taxa de contorno.
67. S7 mostra reclassificação de prioridade e de tipo em blocos separados, nunca somados.

### Espera invisível
68. Nenhuma tela exibe a visão do cliente sem a visão do time, nem o contrário; se uma das visões tiver menos de 20 itens, as duas são ocultas e aparece "Amostra insuficiente".
69. `/espera-invisivel` mostra quatro blocos (Operacional, Tático, Estratégico, Sustentação), cada um com seu próprio eixo; o bloco de Sustentação está separado por divisor e legenda de fonte diferente.
70. O índice é `(cliente − time) ÷ cliente` sobre as medianas, e com valor acima de 50% aparece o selo "Acima de 50%".
71. A Espera invisível aparece também em Operacional (semanal), Tático, Estratégico e Sustentação, como cartão compacto.

### Regras de cálculo e metodologia
72. Todo tempo é exibido com a unidade escrita: dias úteis no fluxo (FL1 a FL3); na Sustentação, horas úteis em P1 a P3, S4 e EI-SUST e dias úteis em P4 e P5; nunca minutos nem horas corridas (dia útil = 8 horas úteis).
73. Todo cartão com percentil mostra P50, P85 e P95 juntos; nenhum cartão mostra média sem faixa e mediana.
74. Todo cartão tem o `BadgeBase` visível com o número de itens e a janela; nenhum número sem base.
75. Qualquer estatística com menos de 20 itens não é renderizada; o painel exibe "Amostra insuficiente" com "n de 20 itens mínimos" e a barra de progresso `role="meter"`.
76. Pelo menos uma classe publicada e uma classe insuficiente existem na mesma tela do Operacional, do Tático e da Sustentação com os dados do mock.
77. Story, frente e projeto nunca compartilham histograma, percentil ou eixo; cada cartão traz o chip de granularidade.
78. Percentis usam a janela de 12 semanas até o fim do período em **todas** as granularidades (story, frente, projeto, chamado); não existe selo nem texto "12 meses (provisória)"; a janela vem de um parâmetro único. E1, EI-FL3 e, possivelmente, T7 e EI-FL2 podem aparecer como "Amostra insuficiente", sem tratamento de erro (6.3.1).
79. Séries que cruzam a data de uma mudança de critério mostram o `marcador-criterio` com a data e o `AvisoCriterio`; cartões de percentil cuja janela cruza a data mostram o aviso da janela.
80. Nenhum número vem escrito no componente: alterar a semente ou o gerador altera os números na tela (verificável por teste unitário e por E2E com dois conjuntos de dados).

### Nota metodológica
81. Todo cartão de métrica do núcleo tem o botão "Como ler e como é calculado" com `aria-expanded`; ao abrir, exibe as seções O que é, Como se calcula, Como ler, Meta, Cuidados e limites e Nesta tela.
82. A seção "Nesta tela" mostra a janela, os filtros aplicados e a base amostral reais do cartão.
83. A nota abre e fecha por teclado e não move o foco.

### Estados
84. Com `?mock=carregando`, todos os cartões mostram o esqueleto com `aria-busy="true"` e sem salto de layout ao carregar.
85. Com um filtro sem resultados, o cartão mostra "Nenhum item encontrado" com botões "Limpar filtros" e "Remover filtro {nome}".
86. Com `?mock=erro:o3`, só o cartão O3 mostra o erro com "Tentar de novo"; os demais cartões e a navegação funcionam; "Tentar de novo" recarrega apenas aquele cartão e mantém os filtros.
87. Com `?mock=erro`, a página mostra o erro de painel com "Tentar de novo" e "Ir para a Visão geral".
88. "Amostra insuficiente" e "Nenhum item encontrado" são estados distintos (1 a 19 itens vs. 0 itens).
89. Com zero itens acima do P95 e zero bloqueados, os cartões mostram mensagens positivas, sem tratamento de erro.

### Regras invioláveis
90. Nenhuma tela exibe nome de pessoa, responsável, agente, ranking de pessoas ou meta por pessoa; o campo `responsaveis` não é lido por nenhum componente.
91. Nenhuma tela compara equipes lado a lado; "equipe" não é série, faceta, cor, coluna de tabela nem item de legenda em nenhum gráfico.
92. As métricas proibidas (produtividade individual, velocidade em pontos, comparação entre times, percentual de conclusão de tarefa, média de tempo de ciclo isolada, horas apontadas) não existem em nenhuma tela.
93. Só existem as métricas do núcleo (O1, O2, O3, O4, O7, O9, O10, O12, O15, O18, T1, T2, T3, T4, T5, T7, T9, E1, E2, E3, S1 a S7, EI) e o bloco "Bloqueados agora"; não há cartões para métricas fora do núcleo.

### Acessibilidade
94. Todas as telas passam em axe com **zero violações sérias ou críticas** nos temas claro e escuro. Violações moderadas e menores são relatadas pelo QA e corrigidas quando viável; não bloqueiam a entrega, mas cada uma não corrigida precisa de justificativa registrada (critério 111).
95. O contraste de texto é ≥ 4,5:1 e de elementos de interface e marcas de gráfico é ≥ 3:1, nos dois temas.
96. Todo o sistema é operável só por teclado; o foco é sempre visível (contorno de 2 px), a ordem de foco é a ordem visual e o elemento focado nunca fica coberto pela barra sticky.
97. Todo gráfico tem `figure`, `figcaption`, frase de leitura e o botão "Ver como tabela" que mostra uma tabela equivalente com `caption` e `th scope`.
98. Status e séries nunca dependem só de cor: há ícone, texto, padrão ou rótulo.
99. Popovers e tooltips fecham com Esc e não somem ao passar o ponteiro sobre eles; gaveta e folha de filtros prendem e devolvem o foco.
100. Com `prefers-reduced-motion: reduce`, não há animação de gráfico nem esqueleto animado.
101. Não há perda de conteúdo ou rolagem horizontal da página em 320 px e com zoom de 200%; tabelas largas rolam dentro de sua região, que tem rótulo e `tabindex="0"`.
102. Alvos interativos têm pelo menos 24×24 px (44×44 px em <768 px).
103. O tema (claro/escuro/sistema) persiste entre recargas e não pisca ao carregar.
104. Os breakpoints 640, 768, 1024 e 1280 px produzem os layouts da seção 8.6, e a ordem do DOM permanece igual em todas as larguras.

### Revisão 2
105. (J1) Amostra insuficiente em E1, T7, EI-FL2 e EI-FL3 usa o texto de 6.3.1 (visual informativo, sem `role="alert"`, sem sugerir mudar janela ou regra) e é idêntica no painel do nível, em `/espera-invisivel` e na Visão geral; não existe o selo "Janela: 12 meses (provisória)" em nenhuma tela.
106. (J2) Nenhuma tela da Sustentação mostra minutos ("min") nem horas corridas; S1 usa "h úteis" em P1 a P3 e "dias úteis" em P4 e P5, e S4 e EI-SUST usam "h úteis"; os alvos de S1 são os da tabela do cartão.
107. (L7, L8) Abrir o Estratégico com `equipe=` ou `tipo=` (por link ou por navegação) não quebra a página, não mostra chip nem aviso de erro e remove os parâmetros da URL; `aviso-filtros-nao-aplicaveis` aparece só quando há valores guardados; ao voltar ao Operacional ou ao Tático por link de navegação os valores reaparecem. `prioridade=` e `cadencia=` fora de seus painéis são removidos em silêncio.
108. (L10) T5 ordena por volume de demanda (desempate alfabético) nas duas abas, mostra "Ordem por volume de demanda. Não é um ranking." e na aba "Por área" não tem selo, destaque nem ordenação por parcela de falha; o selo "Foco da meta" só existe em "Por sistema".
109. (L13) `mock` segue a tabela de 6.6: `carregando` não termina; `erro:{id}` falha em toda tentativa e `erro-uma-vez:{id}` recupera na segunda; ids inexistentes e valores inválidos são ignorados sem aviso; `mock` não é propagado pelos links de navegação nem por "Copiar link", mas permanece ao mudar filtros na mesma página.
110. (L4, L5) Os ids e testids de 1.1, 3.3 e da convenção de abertura desta seção existem (`BLOQUEADOS`, `EI-FL1` a `EI-SUST`, `{nivel}` em `fl1|fl2|fl3|sust`, seções `tempo|fluxo|compromissos|backlog|qualidade`, `seletor-tema`, chave `metricas-dspd:tema`).
111. (L16) O relatório de acessibilidade lista as violações moderadas e menores do axe por tela e tema; cada uma é corrigida ou tem justificativa registrada.

---

## 11. Perguntas em aberto

Dúvidas de regra de negócio que o briefing não resolve. Cada uma tem a **apresentação provisória** já usada neste documento, que o front implementa e que fica marcada na interface como provisória apenas onde indicado.

| # | Pergunta | Apresentação provisória |
|---|---|---|
| 1 | **Espera invisível: quatro níveis e marcos.** O briefing (T3.4) diz "quatro níveis", a proposta descreve três. Qual é o quarto (Sustentação)? E quais marcos formam a visão do cliente e do time em FL2, FL3 e Sustentação? Em FL1 o "time" é o lead time da equipe (compromisso → entrega) ou o cycle time? | Quatro níveis (FL1, FL2, FL3 e Sustentação, esta em bloco separado de fonte diferente). Marcos da tabela da seção EI (FL1: lead time do cliente × da equipe). |
| 2 | **Janela de 12 semanas para frentes e projetos.** Em 12 semanas há poucas frentes e quase nenhum projeto concluído; a regra de 20 itens faria FL2 e FL3 ficarem quase sempre insuficientes. Qual janela usar nessas granularidades? | (rev. 2, J1) 12 semanas em todas as granularidades, como no briefing; a janela é parâmetro único no código. E1, EI-FL3 e, às vezes, T7 e EI-FL2 aparecem como "Amostra insuficiente" e a tela explica por quê (6.3.1). Pergunta segue aberta. |
| 3 | **Alcance da regra dos 20 itens.** Vale só para percentis ou também para taxas e histogramas? Pontos individuais e contagens podem ser mostrados com menos de 20? | Percentis, mediana, média, faixas, histogramas e taxas somem; pontos, listas e contagens permanecem (4.0.2). |
| 4 | **Bloqueios na cadência diária.** A cadência diária inclui "bloqueios", mas "bloqueios por causa" está fora do núcleo. O que entra? | Só a lista "Bloqueados agora" (sem agregação por causa), ligada ao O1/O2. |
| 5 | **O10: definição das visões e "decisão".** O que distingue o backlog "do cliente" do "da equipe" nos dados, e onde se registra a decisão de manter ou encerrar item > 180 dias? | Cliente = itens com área solicitante externa ao DSPD; time = todos os registrados; a "decisão" não é medida nesta etapa (só a contagem de itens > 180 dias). |
| 6 | **T1: decomposição.** O que é "espera" e "homologação" na decomposição, se o modelo só classifica colunas em fila e execução? Homologação entra antes da entrega ou é o aceite (que o briefing manda medir à parte)? | Fila = entrada → compromisso; Espera = tempo em colunas de fila e bloqueio após o compromisso; Execução = colunas de execução; Homologação = colunas de execução de homologação antes da entrega. O aceite fica fora. |
| 7 | **T2: SLE publicado e "etapa onde o tempo foi perdido".** De onde vem o SLE no mock e como se define a etapa de perda? | SLE por classe como valor de configuração com data de publicação; etapa = a de maior duração do item. |
| 8 | **T3: natureza e acordo.** Como os tipos se agrupam em Sustentação, Evolução, Projetos e Dívida técnica? De onde vem o "acordado"? A medida de capacidade é itens ou tempo? | Sustentação = Incidente, Requisição e Defeito em produção; Evolução = Melhoria; Projetos = itens com projeto pai; Dívida técnica = Dívida técnica; acordo como configuração fictícia; itens por padrão com alternador de tempo. |
| 9 | **Classe de serviço × tipo no nível tático; "Iniciativa" no filtro.** T1, T2 e T4 usam classe de serviço (Urgente, Prazo fixo, Padrão, Intangível) ou tipo? Iniciativa aparece no filtro de tipo em FL1 e FL2? | Classe de serviço em T1, T2, T4; "Iniciativa" fica só no FL3 (não aparece no filtro de tipo). |
| 10 | **E2: unidade de capacidade e categorias.** Capacidade = itens entregues? "Evolução" no denominador da meta de 60% inclui quais tipos? | Itens entregues agrupados pelo objetivo do projeto de origem; evolução = Melhoria e Iniciativa; categorias "Obrigação legal", "Manutenção" e "Fora de objetivo" explícitas. |
| 11 | **S1: média × mediana e plantão.** MTTA e MTTR são médias por definição; o briefing proíbe média sozinha. P1 (alvos de 15 min e 4 h no briefing) é medida em horas corridas por regime de plantão? | Mediana e P85 em destaque, média só na tabela. (rev. 2, J2) Todas as prioridades, inclusive P1, em horas úteis (dia útil = 8 h úteis); exibição em h úteis em P1 a P3 e dias úteis em P4 e P5, sem minutos e sem horas corridas. A pergunta, se P1 de plantão deveria ser corrido, segue aberta para o usuário. |
| 12 | **EI de sustentação.** A definição de visão do cliente (tempo de vida) e do time ("em atendimento") é válida? | Provisória, com aviso "não comparável com o BusinessMap". |
| 13 | **Faixas dos histogramas por classe.** O briefing dá as faixas curtas para classes rápidas; quais para classes lentas (Melhoria, Dívida técnica) e para frentes? | Rápidas: 0-1, 2-3, 4-5, 6-10, 11-20, +20; lentas: 0-5, 6-10, 11-20, 21-40, 41-80, +80; frentes: 0-10, 11-20, 21-40, 41-80, 81-160, +160. |
| 14 | **Período × janela de percentis.** O período escolhido recorta a janela de 12 semanas ou define só a série? | Janela fixa de 12 semanas até o fim do período; período define a série (2.3). |
| 15 | **Dia útil e expediente.** Quantas horas tem o dia útil, quais feriados, e as horas úteis do Acelerato usam o mesmo calendário? | A biblioteca de cálculo decide; a interface só rotula a unidade. (rev. 2) Provisório do plano técnico: segunda a sexta, 8h às 12h e 13h às 17h, feriados nacionais, fuso -03:00, 1 dia útil = 8 h úteis, o mesmo calendário no Acelerato. Registrar em ADR. |
| 16 | **Censos fora da regra dos 20 itens.** Avanço por projeto (T9) e ficha por iniciativa (E3) são census de uma entidade e escapam da regra? | Sim, com "k de n" sempre visível. |
| 17 | **Filtro por agente na Sustentação (T5.1 do briefing).** O briefing lista "agente" entre os filtros compartilhados. | Não implementado (risco de avaliação individual); recusa registrada, a confirmar. |
| 18 | **Rótulos de natureza dos chamados.** Cards de Incidente e Requisição no BusinessMap e chamados do Acelerato podem confundir quem lê. | Selo de fonte e dica no filtro Tipo (2.1); (rev. 2, L14) texto explícito de que Incidente e Requisição do BusinessMap não têm relação com chamados do Acelerato (2.1 e Ajuda); a confirmar se os nomes bastam. |
| 19 | **Meta e status de "Frentes simultâneas" (T7).** O limite de frentes por equipe e por projeto existe no mock? | Existe um limite por fluxo, como configuração fictícia. |
| 20 | **Variação contra a referência (O3, E1, T5).** Com que janela se calcula "−20% no semestre", "−25% ao ano", "−15% ao semestre"? E em T4 a regra dos 20 itens conta chegadas, saídas ou ambas? | Janela atual de 12 semanas contra a janela equivalente 6 meses (O3, T5) ou 12 meses (E1) antes; ambas com ≥ 20 itens, senão "Comparação indisponível". T4 (rev. 2, L12): ≥ 20 itens na **soma de chegadas e saídas** da classe nas 12 semanas; alternativa mais conservadora a decidir com o usuário: exigir 20 em cada uma. |
