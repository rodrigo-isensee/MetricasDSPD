# Métricas "Também disponíveis" (pedido 011) · 02 Especificação

Base: `01-cobertura.md`. Protótipo: `03-prototipo/`. Decisões: `04-decisoes.md`. Segue o padrão do discovery das complementares (`docs/ux/metricas-fora-do-nucleo/`), o design system (`docs/ux/design-system.md`) e o checklist por cartão (`docs/ux/checklist-cartao.md`).

**Status: todas as decisões de produto e de regra do pedido 011 estão tomadas (2026-10-14, revistas em 2026-10-16 e 2026-10-17, ver §11); resta a validação do usuário no protótipo** (ponto de compromisso). O que depende da integração com o BusinessMap está marcado "a confirmar na integração": nome e cardinalidade do campo "Time responsável" (T14), se a API registra nas revisões a troca de responsável (O26) e a mudança de vínculo (T13), e o catálogo de motivos de descarte (O25). Decisões e datas: `04-decisoes.md` e pedido 011.

**Acréscimo de 2026-10-14 (K-078):** a métrica T14 "Participação do meu time no projeto" entrou no escopo por decisão do usuário (pedido 011). Total: 17 métricas (16 cartões complementares e o bloco O23). Onde o texto abaixo disser "os 16", leia 17.

## 1. Objetivo
Responder as perguntas da proposta que ficaram fora do catálogo (bloqueios, acúmulo, retorno, descarte, terceiros, sazonalidade, dependências, datas do portfólio, capacidade por sistema, concentração de conhecimento e projetos parados) sem aumentar o painel padrão e sem abrir brecha para avaliação individual.

## 2. Personas e contexto de uso
As mesmas das complementares (`metricas-fora-do-nucleo/01-empatia.md`): time e coordenação no Operacional (diário/semanal, desktop e celular), coordenação e gestores das áreas no Tático (quinzenal/mensal, desktop), gerência e diretoria no Estratégico (mensal/trimestral, desktop e celular em reunião).

## 3. Regras transversais (valem para os 17; a T14 foi acrescentada em 2026-10-14, K-078)
1. **Onde entram:** como complementares (`grupo: 'complementar'`), dentro da seção recolhida "Mais métricas deste painel", agrupadas por pergunta. Exceção: O23 é um bloco do cartão O2 (núcleo).
2. **Status:** `mock` ("Dados fictícios") até existir coleta real do dado; entram em `COM_EXTENSAO_MOCK` as que dependem de dado novo (O22, O26, T13, T14, E6 com replanejamento, E8). O E7 não depende de dado novo: não tem custo (D2 = A, 2026-10-17).
3. **Sem alertas** em "Pede atenção" (decisão D-3 das complementares). Nenhuma tem meta numérica nesta fase: o rodapé mostra "Sem meta numérica" com ícone "i".
4. **Fonte única por cartão:** todos os 17 são **BusinessMap**. Nenhum soma, compara no mesmo eixo ou divide por dado do Acelerato.
5. **Granularidade única por gráfico:** Operacional e Tático em demanda (story); T13 e T14 permitem trocar para frente por seletor local (uma por vez; no T14 o projeto é só o agrupador); Estratégico em projeto, exceto E7 (demanda entregue, agregada por sistema) e E8 (sistema).
6. **Mínimo de 20:** percentil (P50/P85/P95) e percentual só com n ≥ 20 na classe; abaixo, "k de n" e o componente AmostraInsuficiente. Projetos usam a variante `lenta` (pontos por projeto e contagem visíveis). Contagens e somas (censo) são publicadas com BadgeBase.
7. **Percentil só dentro da classe:** toda distribuição de tempo é por tipo de demanda (SeletorLocal, um tipo por vez). Comparação "com × sem" (O21, T13) só entre dois grupos do **mesmo** tipo, cada um com n ≥ 20.
8. **Pessoas e times:** nenhum cartão mostra, filtra, ordena ou exporta por pessoa. O26 e E8 recebem só contagens já agregadas; o E8 mostra só a contagem de sistemas por faixa e **nunca nomeia sistema** (R-1 = B, 2026-10-16). Nenhum cartão lista, nomeia ou ordena times uns contra os outros: a T14 mostra só "meu time" e "outros times" somados (e, quando "outros times" fica oculto, só a fatia do meu time; T14-M1 = B, 2026-10-17).
9. **Ordenação neutra:** listas por área (T12), fornecedor (T10) e sistema (E7, E8) ordenam por volume ou alfabeticamente, nunca por "pior desempenho"; sem pódio, sem medalhas, sem "top 3".
10. **Cálculo:** tempo, percentil e taxa pela biblioteca compartilhada (T2.5); dias úteis; janela de percentis vem do parâmetro único.
11. **Anatomia:** a do CartaoMetrica (design system 2.2), com "Como ler e como é calculado" (cinco seções) e "Ver como tabela" em todos.
12. **Horas apontadas nunca entram** em nenhum dos 16 (briefing 7.1), embora o briefing liste "tempo apontado" entre os recursos da API (B:57).
13. **Ordem de implementação** (D-12, resolvida por B:20, B:344, P:563):
    - Primeiro as que usam dado já no modelo: O19, O20, O21, O23, O24, O25 sem tabela por motivo, T11, T12, E9, T10 sem prazo contratado e E7 (só participação nas entregas; sem custo, D2 = A).
    - Depois as de coleta nova: O22, O26, T13, T14, replanejamentos do E6, agregado do E8.
    - Partes que dependem de configuração do WS1 (domínio do motivo de descarte; cobertura de `fornecedor`, `area_solicitante`, `sistema_afetado`) só depois dela.

## 4. Seções novas e mapa de cartões
| Painel | Seção (pergunta) | Cartões | Nova? |
|---|---|---|---|
| Operacional | Visão diária (núcleo) | O2 ganha o bloco O23 | não |
| Operacional | Por que demora? | O19, O22 (junto de O5, O6, O8) | não |
| Operacional | Onde o trabalho acumula? | O20, O24 | sim |
| Operacional | Onde se perde esforço? | O21, O25, O26 | sim |
| Tático | O que entra, e quando? | T11, T12 | sim |
| Tático | De quem depende o prazo? | T10, T13, T14 | sim |
| Estratégico | Estamos terminando ou só começando? | E9 (junto de E4) | não |
| Estratégico | Quando termina? | E6 (junto de E5) | não |
| Estratégico | Onde o parque se concentra, e qual o risco de continuidade? | E7, E8 | sim |

> Título revisto em 2026-10-16 (revisão de UX do front do lote 1): a seção deixou de falar em custo porque o E7 não mostra mais valor em dinheiro (D2 = A). O título antigo, "O que custa manter o parque, e de quem depende?", fica substituído; aguarda confirmação do usuário. Alternativas na revisão `docs/ux/revisao-011-front-estrategicas.md`.

Contador do seletor "Métricas": Operacional passa de "+8" para "+15" complementares, Tático de "+2" para "+7", Estratégico de "+2" para "+6".

## 5. Cartões

Formato de cada um: pergunta · painel e seção · visual · frase de leitura · "leia junto" · alerta · filtros · mínimo de amostra · fonte · dado.

### O19 Bloqueios por causa
- **Pergunta:** O que mais trava o trabalho, e quanto isso custa em dias?
- **Painel/seção:** Operacional · Por que demora?
- **Visual:** barras horizontais, uma por motivo do domínio fechado (7), comprimento = dias úteis bloqueados somados na janela; rótulo à direita "64 d úteis · 12 bloqueios"; padrão de preenchimento por barra. Abaixo, tabela P50/P85 da duração por motivo (só motivos com ≥ 20 bloqueios; os demais "— amostra insuficiente"). Ordem: por dias somados, decrescente (motivo não é pessoa). **O percentual de cada causa é sobre os dias úteis bloqueados (O19-pct = B, 2026-10-16)**; o mínimo de 20 continua sobre o número de bloqueios da causa.
- **Leitura:** "Aguardando validação do negócio somou 64 dias úteis de bloqueio nas últimas 12 semanas, 38% do total."
- **Leia junto:** BLOQUEADOS (o que está bloqueado agora), O5 (eficiência de fluxo).
- **Alerta:** nenhum.
- **Filtros:** Equipe, Tipo, Sistema, Período. Base = bloqueios **encerrados** no período; bloqueios em aberto ficam no BLOQUEADOS e são citados em nota ("3 bloqueios ainda abertos não entram na soma").
- **Mínimo:** soma e contagem publicadas sempre; P50/P85 por motivo com ≥ 20 bloqueios.
- **Fonte/dado:** BusinessMap · `fato_bloqueio` (motivo, início, fim, duração em horas úteis) · **já no modelo**.

### O20 Fluxo cumulativo
- **Pergunta:** Onde o trabalho está se acumulando?
- **Painel/seção:** Operacional · Onde o trabalho acumula?
- **Visual:** área empilhada diária (CFD). Com uma equipe filtrada: uma faixa por coluna do quadro. Com "Todas": faixas por papel da coluna (Backlog, Pronto para, Em execução, Homologação, Entregue), igual ao agrupamento do O2. Cada faixa com cor e hachura; legenda com os dois. Linha vertical tracejada para mudança de critério (T2.6).
- **Leitura:** "Nas últimas 4 semanas a faixa 'Aguardando homologação' cresceu de 6 para 15 itens enquanto as entregas ficaram estáveis: o acúmulo está na homologação."
  - Regra da frase: aponta a faixa de fila com maior crescimento absoluto entre o início e o fim do período; se nenhuma cresceu, "Nenhuma etapa acumulou trabalho no período."
  - **O20-destaque = A (2026-10-16):** o destaque considera só as filas **a partir do compromisso**. O Backlog continua desenhado como faixa do gráfico, mas nunca é o destaque (nem com "Todas"); se só o Backlog cresceu, vale "Nenhuma etapa acumulou trabalho no período."
- **Leia junto:** O1 (WIP e limite), O7 (entrada × saída).
- **Alerta:** nenhum.
- **Filtros:** Equipe, Tipo, Sistema, Período.
- **Mínimo:** não há estatística (contagem diária); estado vazio se não houver transição no período.
- **Fonte/dado:** BusinessMap · `fato_transicao` + `dim_coluna` (papel, ordem) · **já no modelo**. Cards arquivados e excluídos permanecem até o instante do arquivamento (função `fimDeVidaAberta`).

### O21 Fluxo reverso
- **Pergunta:** Por onde o trabalho volta, e quanto isso pesa no prazo?
- **Painel/seção:** Operacional · Onde se perde esforço?
- **Visual:** (a) número de destaque "31 de 96 entregas (32%) voltaram ao menos uma vez"; (b) matriz origem × destino só com transições de retorno (`direcao = 'retorno'`), células com número escrito e rampa sequencial; retorno a partir de "Entregue" (reabertura, briefing 4.2) em linha própria e destacada com texto "reaberto"; (c) par de valores do tipo escolhido: P50/P85 do tempo de ciclo das entregas **com** retorno × **sem** retorno.
- **Leitura:** "32% das entregas voltaram ao menos uma vez. A volta mais comum é de 'Em teste' para 'Em desenvolvimento' (14 vezes). Em Melhoria, quem volta tem P85 de 14 dias úteis contra 8 de quem não volta."
- **Leia junto:** O13 (vazão de defeitos), O5 (eficiência de fluxo).
- **Alerta:** nenhum.
- **Filtros:** Equipe, Tipo, Sistema, Período. Com "Todas" as equipes, a matriz usa o papel da coluna (os nomes de coluna variam por quadro).
- **Mínimo:** percentual com n ≥ 20 entregas; comparação com × sem só se **cada** grupo tiver ≥ 20 no tipo, senão "k de n" e AmostraInsuficiente no par.
- **Fonte/dado:** BusinessMap · `fato_transicao.direcao` · **já no modelo**.

### O22 Primeiro toque
- **Pergunta:** Quanto tempo um pedido fica sem nenhuma reação nossa?
- **Painel/seção:** Operacional · Por que demora?
- **Visual:** SeletorLocal por tipo (um por vez); para o tipo, faixa P50/P85/P95 em dias úteis (uma casa decimal) e histograma com faixas estreitas (0–0,5, 0,5–1, 1–2, 2–5, 5–10, 10+). Ao lado, bloco "Ainda sem toque": quantos pedidos abertos nunca tiveram reação e a idade do mais antigo.
- **Leitura:** "Metade dos pedidos de Requisição recebe a primeira reação em até 0,8 dia útil; 85% em até 3,5. Há 6 pedidos ainda sem nenhuma reação, o mais antigo há 9 dias úteis."
- **Leia junto:** O9 (três relógios), O10 (envelhecimento do backlog).
- **Alerta:** nenhum.
- **Filtros:** Equipe, Tipo, Sistema, Período.
- **Mínimo:** percentis com ≥ 20 pedidos tocados no tipo, janela de 12 semanas.
- **Fonte/dado:** BusinessMap · **extração nova**: instante do primeiro comentário depois da criação. A fonte listada pelo briefing é "comentários" (B:57). Só o comentário conta (mudança de coluna e atribuição não). Comentário gerado por regra automática não conta. Tempo apontado nunca. Guardar só o instante (`dim_card.primeiro_toque_em`), nunca quem tocou nem o texto do comentário.

### O23 Estoque parado dentro do WIP (bloco do O2)
- **Pergunta:** Quanto do "em andamento" não se move há mais de uma semana?
- **Painel/seção:** Operacional · Visão diária, dentro do cartão O2, acima da lista "Itens para olhar primeiro".
- **Visual:** linha de destaque "7 de 31 itens em andamento (23%) sem mover há mais de 5 dias úteis" + barra fina segmentada por etapa com rótulos; botão "Ver os parados" muda a ordenação da lista para "Sem mover há" (já existe).
- **Leitura:** a própria linha de destaque.
- **Leia junto:** O1 (já é o par natural do O2).
- **Alerta:** nenhum novo (O2 continua alertando só acima do P95).
- **Filtros:** os do O2.
- **Mínimo:** censo do WIP atual; percentual só com ≥ 20 itens em andamento, senão "k de n".
- **Fonte/dado:** BusinessMap · `semMoverHaDiasUteis` já calculado pelo O2 · **já no modelo**.
  - "Mover" é só mudança de coluna. Tempo apontado nunca é sinal de movimento (B:409).
  - Limite: "mais de uma semana" (P:249) = 5 dias úteis, pela conversão da regra de dias úteis (B:110). Confirmar na validação.

### O24 Ordem de chegada
- **Pergunta:** Que pedidos passaram na frente de pedidos mais antigos, e a que custo para os que esperaram?
- **Painel/seção:** Operacional · Onde o trabalho acumula?
- **Visual:** (a) destaque "18 de 64 inícios (28%) passaram na frente de um pedido mais antigo"; (b) barras mensais empilhadas "em ordem" × "fora de ordem" (cor + hachura); (c) para o tipo escolhido, P50/P85 dos dias úteis que os ultrapassados esperaram, depois de ultrapassados, até começar.
- **Leitura:** "28% dos inícios da classe Padrão passaram na frente de um pedido mais antigo do mesmo tipo, na fila da mesma equipe. Os ultrapassados esperaram, depois de ultrapassados, 9 dias úteis até começar (P85)."
- **Leia junto:** O10 (envelhecimento do backlog), T2 (aderência ao SLE).
- **Alerta:** nenhum. Texto fixo na nota: "A ordem de chegada é a política da classe Padrão. Urgente, Prazo fixo e Intangível têm regra própria e ficam fora. O cartão mostra o custo de passar na frente, não um erro."
- **Filtros:** Equipe, Tipo, Sistema, Período.
- **Mínimo:** percentual com ≥ 20 inícios; P50/P85 com ≥ 20 itens ultrapassados no tipo.
- **Fonte/dado:** BusinessMap · `criado_em`, `iniciado_em`, `equipe`, `tipo`, `classe_servico` · **já no modelo**.
  - Grupo de comparação: **só classe Padrão, mesmo tipo, na fila de cada equipe (quadro)** (P:597-600; decisão do usuário, 2026-10-14).
  - Custo da ultrapassagem (decisão do usuário, 2026-10-14): dias úteis entre o início do primeiro item que passou na frente e o início do ultrapassado. Texto do cartão: "esperaram, depois de ultrapassados, X dias úteis até começar"; nunca "dias a mais".

### O25 Descarte
- **Pergunta:** Quanto esforço foi investido no que nunca foi entregue?
- **Painel/seção:** Operacional · Onde se perde esforço?
- **Visual:** (a) destaque "9 descartados de 105 encerrados (8,6%)"; (b) barras mensais da taxa (mês corrente listrado + rótulo "em andamento"); (c) tempo já consumido: soma de dias úteis dividida em "antes do início" (descarte saudável, decidido na fila) e "depois do início" (trabalho jogado fora), com P50/P85 do tempo consumido depois do início; (d) aviso de preenchimento quando há card com motivo de descarte e sem estar descartado nem excluído. Nesta fase o cartão mostra só taxa e tempo consumido, sem divisão por motivo; a tabela por motivo só entra quando a integração ler o catálogo de motivos do BusinessMap (a confirmar na integração).
- **Leitura:** "9 itens foram descartados no período (8,6% do que encerrou). Eles tinham consumido 38 dias úteis depois de começar; 6 foram descartados ainda na fila, sem trabalho iniciado."
- **Leia junto:** O4 (vazão), O7 (entrada × saída).
- **Alerta:** nenhum. Nota: "Descartar cedo é saudável; o custo está no que foi descartado depois de começar."
- **Filtros:** Equipe, Tipo, Sistema, Período.
- **Mínimo:** taxa com ≥ 20 encerrados (entregues + descartados) no período; P50/P85 do tempo consumido com ≥ 20 descartados após o início (raro: o normal é mostrar soma e contagem).
- **Fonte/dado:** BusinessMap · estado nativo `discarded` do card (e card excluído), `iniciado_em`, `discarded_at` · **já no modelo** (a confirmar na integração: leitura do estado nativo e do catálogo de motivos).
  - **O25(b) = B (2026-10-16):** card entregue e depois excluído **não** conta como descarte; continua como entrega na vazão e no ciclo.
  - Descartado = card com estado nativo `discarded` do BusinessMap e também o card excluído que não tinha sido entregue (P:564, B:59). Instante: `discarded_at`; no excluído, o instante da exclusão ou, sem ele, a última revisão, marcada como aproximada (decisão do usuário, 2026-10-14). Motivo preenchido sem descarte nem exclusão vira aviso de preenchimento e fica fora da taxa.
  - Tempo consumido = do início (primeira entrada em execução) até o descarte. Descartado antes de iniciar consome zero e aparece à parte (B:106, B:110, P:251).
  - Motivos: o domínio é o catálogo nativo do BusinessMap (`/discardReasons`, `reason_id`), com mudanças versionadas (T2.6); `discard_comment` nunca entra (**a confirmar na integração**). Até a integração ler o catálogo, `porMotivo = null` e o cartão publica só taxa e tempo consumido. "Criado por engano" não existe nos documentos e fica fora do mock.

### O26 Passagens de mão
- **Pergunta:** Quantas trocas de responsável uma demanda sofre até ser entregue?
- **Painel/seção:** Operacional · Onde se perde esforço?
- **Visual:** SeletorLocal por tipo; histograma de demandas entregues por número de passagens (0, 1, 2, 3, 4 ou mais); ao lado, P85 do tempo de ciclo em cada faixa (só faixas com ≥ 20). Selo fixo no cabeçalho do gráfico: "Conta trocas, nunca quem."
- **Leitura:** "Em Melhoria, 41% das entregas tiveram 2 ou mais passagens de mão. Com 3 ou mais, o P85 do ciclo foi de 19 dias úteis, contra 7 com até 1."
- **Leia junto:** O5 (eficiência de fluxo), O3 (tempo de ciclo).
- **Alerta:** nenhum.
- **Filtros:** Equipe, Tipo, Sistema, Período. Não existe e não existirá filtro ou abertura por pessoa.
- **Mínimo:** histograma (contagem) sempre; percentual e P85 por faixa com ≥ 20.
- **Fonte/dado:** BusinessMap · **extração nova**: número de **trocas de responsável** por card (`dim_card.passagens`, P:252), calculado na fronteira do coletor a partir das revisões (B:53). O coletor descarta as identidades e grava só o inteiro.
  - Mudança de equipe ou de quadro não conta.
  - Troca = alguém sai e outro entra, ou o conjunto de responsáveis é substituído. Incluir um co-responsável sem ninguém sair não conta (decisão do usuário, 2026-10-14). **A confirmar na integração:** que as revisões do BusinessMap trazem o campo de responsáveis.

### T10 Tempo de terceiros
- **Pergunta:** O tempo de resposta contratado com cada fornecedor é o praticado?
- **Painel/seção:** Tático · De quem depende o prazo?
- **Visual:** tabela-gráfico, uma linha por fornecedor em **ordem alfabética**: bloqueios, dias úteis somados, P50 e P85 da duração (barra horizontal com marcas P50/P85) e, se houver, uma linha de rodapé "Prazo contratado não informado". Nesta fase não há coluna de prazo contratado nem status "dentro/acima do contratado" (decisão do usuário, 2026-10-14).
- **Leitura:** "Os bloqueios por fornecedor somaram 52 dias úteis no período. Fornecedor Beta respondeu em até 6 dias úteis em 85% dos casos. Prazo contratado não informado."
- **Leia junto:** BLOQUEADOS, O12 (atrasos de responsabilidade "Terceiro"), O19.
- **Alerta:** nenhum nesta fase.
- **Filtros:** Equipe, Tipo, Sistema, Período.
- **Mínimo:** P50/P85 por fornecedor com ≥ 20 bloqueios encerrados, senão "— amostra insuficiente" na célula e só contagem e soma. Janela (T10-janela = A, 2026-10-16): os percentis ficam na janela móvel de 12 semanas (regra inviolável) e a contagem segue o período do painel; não há exceção de 12 meses para fornecedor, e a nota de amostra insuficiente não sugere outra janela. **B11-001 = sim (2026-10-17):** o nome do fornecedor ignora maiúsculas, minúsculas e espaços ("Totvs", "TOTVS" e "totvs" são uma linha só).
- **Fonte/dado:** BusinessMap · `fato_bloqueio` com o campo `fornecedor` preenchido, de qualquer motivo (B:126, P:614; inclui "Aguardando licença ou contrato") · **já no modelo**. Prazo contratado: fora desta fase (decisão do usuário, 2026-10-14). Quando os contratos forem informados, entra como configuração versionada (T2.6), com comparação do P85 ao prazo, em nova entrega. Não usa S9 (Acelerato).

### T11 Sazonalidade da chegada
- **Pergunta:** Quando a demanda chega, e o que se repete todo ano?
- **Painel/seção:** Tático · O que entra, e quando?
- **Visual:** mapa de calor mês (colunas jan a dez) × ano (linhas), número escrito em cada célula, rampa sequencial com troca de cor do texto para 4,5:1; SeletorLocal "Todos os tipos" / um tipo; mês corrente listrado com rótulo "em andamento".
- **Leitura:** "Janeiro e julho trazem, nos dois anos, 30% a mais de pedidos que a média mensal. Julho de 2026 teve 41 pedidos, contra 38 em julho de 2025."
  - "Média mensal" aqui é referência de contagem, não estatística de tempo; nunca aparece sozinha (o mapa mostra todos os meses).
- **Leia junto:** T4 (demanda × capacidade), T6 (previsão probabilística).
- **Alerta:** nenhum.
- **Filtros:** Equipe, Tipo, Sistema. **Não afetado por: Período** (chip): a janela é fixa de 24 meses fechados mais o corrente. Com menos de 24 meses de histórico, mostra o que existe e a nota "Com menos de dois anos, ainda não dá para separar padrão de acaso".
- **Mínimo:** contagem (censo); sem percentil.
- **Fonte/dado:** BusinessMap · `criado_em` (marco de entrada, depende de T1.5) · **já no modelo**; exige histórico de 24 meses na base e no mock. Sem gêmeo na Sustentação: a proposta cataloga a sazonalidade só no Tático (P:346) e o catálogo S1 a S12 não a inclui (D-11, resolvida).

### T12 Qualidade da entrada por área
- **Pergunta:** Quais áreas abrem demandas executáveis sem ida e volta?
- **Painel/seção:** Tático · O que entra, e quando?
- **Visual:** lista por área solicitante, **ordenada por volume** de demandas que entraram (como O14): barra 100% dividida em "sem ida e volta" × "com ida e volta" (cor + hachura), com "k de n" e percentual escrito.
- **Leitura:** "18% das demandas do período precisaram de ida e volta antes de começar. Na área Financeiro, 11 de 34."
- **Leia junto:** O14 (origem da demanda), O11 (composição do backlog).
- **Alerta:** nenhum. Nota: "Mede a clareza do pedido que chega, para combinar com a área o que um pedido precisa trazer. Não é nota da área."
- **Filtros:** Equipe, Tipo, Sistema, Período.
- **Mínimo:** percentual por área com ≥ 20 demandas; abaixo, só "k de n".
- **Fonte/dado:** BusinessMap · `area_solicitante`, `fato_bloqueio` (motivo "Falta de informação no chamado"), `fato_transicao` (retorno) · **já no modelo**. Dimensão `area_solicitante` (B:123). "Ida e volta" = bloqueio com motivo "Falta de informação no chamado" antes do início, ou retorno do card da coluna de compromisso para o backlog (decisão do usuário, 2026-10-14).

### T13 Dependências entre quadros
- **Pergunta:** Quanto do prazo depende de trabalho que não é nosso?
- **Painel/seção:** Tático · De quem depende o prazo?
- **Visual:** SeletorLocal de granularidade "Demandas" / "Frentes" (uma por vez, nunca juntas) e de tipo; (a) destaque "31 de 88 entregas (35%) dependeram de outro quadro"; (b) par P50/P85 do lead time com dependência × sem dependência, mesmo tipo. O antigo bloco (c) de dias bloqueados por "Dependência de outra demanda" saiu: a métrica é por vínculo (P:348), e esse motivo já está no O19.
- **Leitura:** "35% das demandas entregues dependeram de trabalho de outro quadro. Em Melhoria, essas tiveram P85 de 21 dias úteis, contra 9 das que não dependeram."
- **Leia junto:** T1 (lead time ponta a ponta), O19 (bloqueios por causa, inclusive "Dependência de outra demanda").
- **Alerta:** nenhum.
- **Filtros:** Equipe, Tipo, Sistema, Período. Não identifica o outro quadro por equipe (evita virar comparação entre times): mostra só "outro quadro".
- **Mínimo:** percentual com ≥ 20 entregas; par com × sem só se cada grupo tiver ≥ 20 no tipo e na granularidade.
- **Fonte/dado:** BusinessMap · **extração nova** de vínculos entre cards (`fato_vinculo`: card, card relacionado, tipo de vínculo, quadro do relacionado). Origem "Extração + vínculos" (P:348).
  - Pai/filho **não conta**: é hierarquia e cruza quadros por construção (B:41-42).
  - Conta só o vínculo `predecessor` com card de outro quadro; "relacionado" e pai/filho ficam fora (decisão do usuário, 2026-10-14).
  - Vínculo removido antes da entrega conta, se esteve vigente em algum momento antes da entrega (decisão do usuário, 2026-10-14). **A confirmar na integração:** que a API registra a mudança de vínculo nas revisões; sem isso, só vale o vínculo vigente na coleta.

### T14 Participação do meu time no projeto
Aprovada pelo usuário em 2026-10-14 (pedido 011, K-078); entra na fase 3 (coleta nova). Motivação: "quanto deste projeto não é do meu time", porque o time é cobrado por entregas de projetos em que atua pouco.
- **Pergunta:** Quanto deste projeto não é do meu time?
- **Painel/seção:** Tático · De quem depende o prazo? (com T13). Cabe melhor aqui que em "O que entra, e quando?" porque, como o T13, mede o quanto do resultado de um projeto está em mãos que não são do time; "De quem depende" é a pergunta do painel.
- **Visual:** uma linha por projeto em andamento, ordenada pelo **total de demandas do projeto** (volume, nunca pela participação). Barra 100% em três partes com cor + hachura: "Meu time", "Outros times (somados)" e "Sem time informado". Rótulo escrito "k de n (p%) meu time". Destaque acima: "61 de 173 demandas com time informado (35%) são do meu time". Selo: "Só mostra meu time e os outros somados. Não compara times."
- **Leitura:** "61 de 173 demandas com time informado (35%) são do meu time; as outras 112 estão em outros times. No PRJ-031, 4 de 34 (12%) são do meu time."
  - Regra da frase: o destaque é o total do recorte; o exemplo cita o projeto de menor participação do meu time **só em texto**, nunca em ordenação. Se nenhum projeto publica percentual, a frase omite o exemplo.
- **Leia junto:** T13 (dependências entre quadros), T9 (avanço real e escopo).
- **Alerta:** nenhum. Sem meta numérica; não existe "participação mínima esperada". Nota fixa: "Mostra a parte do projeto que é do meu time, para entender a cobrança por entregas em que atuo pouco. Não é nota do time nem comparação."
- **Filtros:** Equipe (**obrigatório**: define "meu time"; com "Todas" ou várias o cartão não calcula), Sistema, Período. O Período escolhe quais projetos entram (projetos em andamento em algum momento do período); a contagem é sempre do projeto inteiro. Sem filtro nem abertura por outro time, por pessoa ou por responsável.
- **Mínimo:** percentual (por projeto e total) só com n ≥ 20 demandas **com time informado**; abaixo, "k de n" e "percentual não publicado (menos de 20)", mas a barra aparece (contagem é censo). O total geral segue a mesma regra.
- **Fonte/dado:** BusinessMap · demandas (story) agrupadas ao projeto pela hierarquia projeto > frente > demanda (B:41-42) e **campo customizado "Time responsável" do card** (decisão do usuário, 2026-10-14) · **extração nova** (`dim_card.time_responsavel` e vínculo da demanda ao projeto, ver necessidades de dados).
  - **A confirmar na integração:** nome exato do campo e cardinalidade (escolha única ou múltipla); se a hierarquia story > frente > projeto já coletada basta para ligar a demanda ao projeto. Até lá vale: se o card tiver vários times, conta como "meu time" quando o meu estiver entre eles (funciona nos dois casos).
  - **Projetos que aparecem (decisão do usuário, 2026-10-14):** os ligados a um sistema do meu time (`ConfigBM.equipes[].sistemas`), inclusive com 0% de atuação, e também qualquer projeto com pelo menos 1 card do meu time.
  - **Item contado (suposição do time):** demanda (story), a unidade de B:110, com seletor local para frente (uma granularidade por vez, nunca juntas, como no T13). Projeto é só o agrupador.
  - **Escopo (suposição do time):** cards não descartados, em qualquer estado ("quanto do projeto" é do escopo todo). Vale o time do card na entrega ou, antes dela, o time atual.
  - **Sem time responsável (suposição do time):** o card sem o campo preenchido entra no total de demandas do projeto como "Sem time informado", fora do denominador do percentual, com a contagem visível como aviso de dado.
  - **"Outros times" (decisão do usuário, Q-T14-6 = A, 2026-10-14; refinada pela R-1 = B, 2026-10-16):** soma única, publicada mesmo quando o projeto tem um único outro time, **só quando esses outros times somam 2 pessoas ou mais**; sempre sem nome, sem tempo, sem vazão e sem ranking. Participação de cards no projeto não é comparação de desempenho entre times (7.1). O sistema nunca lista, nomeia nem ordena times, nem na tabela alternativa nem na exportação.
  - **Quem conta como pessoa (Q-T14-10 = B, 2026-10-17):** quem está no cadastro de membros por time, mantido na configuração (WS1); o cadastro é dado de pessoa e fica fora do alcance do `dspd_api`. À interface só chega o indicador "outros times publicável: sim/não".
  - **"Outros times" oculto (T14-M1 = B, 2026-10-17):** quando o indicador é "não", a linha do projeto mostra só o texto "Meu time: k" (k demandas do meu time), **sem barra, sem "Sem time informado", sem o total exato do projeto, sem "k de n" e sem percentual**, para que n − k não possa ser calculado (ficha alinhada à tela em 2026-10-23, T14-1 = A). O destaque do recorte e a ordenação por total de demandas (CA-30) seguem usando o total internamente; o projeto com "outros times" oculto é posicionado sem mostrar o total.
  - Só BusinessMap: nenhuma parcela vem de chamados do Acelerato.

### E6 Datas do portfólio
- **Pergunta:** Quando comprometemos uma data de projeto, ela se confirma?
- **Painel/seção:** Estratégico · Quando termina? (com E5)
- **Visual:** pontos por projeto concluído (um ponto = um projeto, código e título no rótulo), eixo y = deslize em dias úteis (negativo = antes; 0 = na data); linha 0 rotulada "data comprometida"; forma do ponto indica replanejamentos (círculo 0, losango 1, triângulo 2+), com legenda. Destaque "4 de 11 projetos entregues na data comprometida".
- **Leitura:** "4 de 11 projetos concluídos nos últimos 12 meses saíram na data comprometida. Os demais atrasaram de 8 a 63 dias úteis; 5 tiveram a data replanejada ao menos uma vez."
- **Leia junto:** E5 (previsão de término), T9 (avanço real e escopo).
- **Alerta:** nenhum.
- **Filtros:** os do Estratégico (sem Equipe). Período padrão 12 meses.
- **Mínimo:** percentual e P50/P85 do deslize com ≥ 20 projetos; abaixo, AmostraInsuficiente variante `lenta` (esperado: poucos projetos) com "k de n" e os pontos.
- **Fonte/dado:** BusinessMap · `data_acordada` do card de projeto · **já no modelo**.
  - **Vale a data registrada no compromisso** (B:127, "No compromisso"; D-7 resolvida). As alterações posteriores contam como replanejamentos. Elas são derivadas das revisões (B:53) que o coletor já lê (B:201): derivação nova, não recurso novo.
  - Tolerância zero: entregue até a data = no prazo, igual a "vencido" no O12 (P:173).

### E7 Entregas por sistema
- **Pergunta:** Qual a participação de cada sistema nas nossas entregas?
  - Mudança em 2026-10-20 (decisão do dono, pedido 036, opção A): a pergunta anterior falava em "capacidade"; agora pergunta pela participação nas entregas, que é o que o cartão mede (contagem, não custo).
- **Painel/seção:** Estratégico · Onde o parque se concentra, e qual o risco de continuidade?
- **Visual:** barras horizontais 100% por sistema (ordem por participação), divididas por natureza (as 4 do T3: Sustentação, Evolução, Projetos e Dívida técnica, pela mesma função do T3; R-3 resolvida por B:369) com cor + hachura; rótulo "% das entregas · n itens".
  - **Decisão do usuário D2 = A (revê a D-1' e a Q-E7-1):** o E7 não mostra nenhum valor em dinheiro, nem custo rateado, nem custo dividido por demanda, em nenhuma variante e com ou sem custo total configurado. Mostra só a participação percentual de cada sistema pelas entregas e a contagem. A origem "custo de capacidade" de P:402 não se aplica; o custo total do DSPD deixa de ser dado de entrada deste cartão.
  - O selo "Rateio do custo total do DSPD, não esforço medido." deixa de existir. No lugar, a nota fixa: "Participação por contagem de demandas entregues, não esforço medido nem valor em dinheiro." Horas apontadas não entram (7.1); nunca por equipe nem por pessoa.
- **Leitura:** "O sistema Folha concentrou 22% das entregas do trimestre, 81% delas de sustentação."
- **Leia junto:** T3 (alocação da capacidade), E2 (capacidade por objetivo).
- **Alerta:** nenhum.
- **Filtros:** Sistema, Período (sem Equipe, como o Estratégico).
- **Mínimo:** percentual com ≥ 20 entregas no total; sistemas com menos de 20 entregas mostram "k de n" e ficam agrupados no fim.
- **Fonte/dado:** BusinessMap · `sistema`, `tipo`, `concluido_em` (granularidade demanda, subtarefa fora) · **já no modelo**.
  - Peso = contagem de demandas entregues (D-2, resolvida por B:110 e P:629).
  - Custo total do DSPD: **não é mais necessário no E7** (D2 = A); o campo de custo da API, se existir, não é lido pela interface.
  - **Nunca horas apontadas** (B:409). Chamados do Acelerato por sistema seguem só no S12; o cartão diz "Não inclui os chamados da sustentação (Acelerato), que estão no S12" com link.

### E8 Concentração de conhecimento
- **Pergunta:** Quantos sistemas dependem de uma única pessoa?
- **Painel/seção:** Estratégico · Onde o parque se concentra, e qual o risco de continuidade?
- **Visual:** três números grandes lado a lado: "Sistemas com entregas de 1 pessoa: 4", "de 2 pessoas: 6", "de 3 ou mais: 9" (de 19 sistemas com entregas na janela); barra 100% com as três faixas (cor + hachura). **Só a contagem: o cartão não lista nem nomeia os sistemas da faixa "1 pessoa"** (R-1 = B, 2026-10-16, que revoga a listagem da D-4 = B de 2026-10-14), porque o nome do sistema e a lista de membros do time reidentificariam a pessoa. Selo fixo: "Mede risco de continuidade do parque. Não mostra nem avalia pessoas."
- **Leitura:** "4 dos 19 sistemas com entregas nos últimos 12 meses tiveram todas as entregas feitas por uma única pessoa."
- **Leia junto:** E7.
- **Alerta:** nenhum.
- **Filtros:** Período (padrão e mínimo 12 meses; D-3 = A, decisão do usuário). Sem Equipe, sem Sistema (filtrar por sistema reduziria a uma linha e apontaria a pessoa).
- **Mínimo:** contagem de sistemas (censo); sem percentil. Se houver menos de 5 sistemas no recorte, o cartão não abre as faixas (só "Recorte pequeno demais para mostrar a concentração sem identificar pessoas").
- **Fonte/dado:** BusinessMap · **agregado novo** calculado no coletor: por sistema e janela, número de pessoas distintas em `dim_card.responsaveis` (B:142) das demandas entregues do sistema (`sistema_afetado`, B:124), janela de 12 meses (`agg_conhecimento_sistema`: sistema, janela, pessoas_distintas). Não exige histórico de responsável. A API lê só esse inteiro (papel `dspd_api` sem acesso a colunas de pessoa). Não existe versão Acelerato (ids de pessoa não entram na base).

### E9 Projetos aguardando início
- **Pergunta:** Quanto tempo uma decisão aprovada espera para virar trabalho?
- **Painel/seção:** Estratégico · Estamos terminando ou só começando? (com E4)
- **Visual:** pontos por projeto aprovado e ainda não iniciado (idade em dias úteis desde a criação do card, que nasce logo após a aprovação), com faixas de fundo 0–30, 31–90, 91–180, mais de 180; linha de referência = P85 do "antes do início" dos projetos concluídos (E1), só se E1 tiver ≥ 20 projetos, senão o texto "Sem referência: menos de 20 projetos concluídos". Tabela: projeto, aprovado em, idade.
- **Leitura:** "7 projetos aprovados ainda não começaram. O mais antigo espera há 212 dias úteis; 3 esperam há mais de 90."
- **Leia junto:** E1 (lead time de projetos), E4 (iniciadas × concluídas).
- **Alerta:** nenhum.
- **Filtros:** os do Estratégico. Retrato do dia ("Não afetado por: Período").
- **Mínimo:** censo dos abertos; referência de percentil com ≥ 20 concluídos.
- **Fonte/dado:** BusinessMap · cards de projeto com `criado_em` e `iniciado_em` nulo, fora de descartados · **já no modelo**. `criado_em` do card de projeto é a aprovação na comissão (R-6, resolvida por B:39, P:359, P:46).

## 6. Estados (todos os cartões)
Carregando (esqueleto com altura reservada) · Vazio ("Sem dados para estes filtros." + "Limpar filtros") · Erro ("Não foi possível carregar este gráfico." + "Tentar de novo") · Amostra insuficiente (componente padrão; `lenta` em E6 e E9) · Dados fictícios (selo do cabeçalho, status `mock`). Específicos: O22 "Nenhum pedido sem reação." (positivo, com check); E8 recorte pequeno (texto acima); T10 sem fornecedor no período "Nenhum bloqueio por fornecedor no período."; T11 histórico curto (nota acima).

## 7. Necessidades de dados (resumo para o arquiteto e o back-end)
| Dado | Cartões | Situação |
|---|---|---|
| `fato_bloqueio` (motivo, fornecedor, duração) | O19, T10, T12 | já no modelo |
| `fato_transicao` (direção, coluna, tipo de coluna) | O20, O21, T12 | já no modelo |
| `dim_coluna` (papel, ordem) | O20, O21 | já no modelo |
| `semMoverHaDiasUteis` (O2) | O23 | já calculado |
| `criado_em`, `iniciado_em`, `classe_servico`, `equipe` | O24, T11, E9 | já no modelo |
| estado `discarded`, `discarded_at`, exclusão; catálogo `/discardReasons` | O25 | no modelo o estado e o instante; instante da exclusão e catálogo de motivos **a confirmar na integração** (`porMotivo = null` até lá) |
| `primeiro_toque_em` | O22 | **extração nova** (só comentário humano, B:57; só o instante) |
| `passagens` (inteiro por card) | O26 | **extração nova** a partir das revisões (alguém sai e outro entra, ou conjunto substituído), calculada na fronteira; identidades descartadas; campo de responsáveis nas revisões **a confirmar na integração** |
| `fato_vinculo` | T13 | **extração nova** (só `predecessor` com card de outro quadro, inclusive removido antes da entrega; pai/filho e relacionado fora); registro de mudança de vínculo nas revisões **a confirmar na integração** |
| `time_responsavel` (campo customizado "Time responsável"; nome e cardinalidade **a confirmar na integração**), a ligação demanda > frente > projeto e `ConfigBM.equipes[].sistemas` | T14 | **extração nova**; só o rótulo "meu time / outros / sem informação" sobe à API, nunca o nome de outro time |
| `data_acordada_original`, `replanejamentos` | E6 | **derivação nova** das revisões já coletadas (valor no compromisso e alterações posteriores) |
| Prazo contratado por fornecedor | T10 | fora desta fase; configuração versionada (T2.6) numa entrega futura, quando os contratos forem informados |
| `agg_conhecimento_sistema` (pessoas distintas em `responsaveis` das entregas por sistema, 12 meses) | E8 | **agregado novo** no coletor; API nunca lê pessoa |
| Histórico de 24 meses de `criado_em` | T11 | carga histórica (coletor e mock) |

## 8. O que o mock precisa gerar (`packages/mock`, BusinessMap)
1. **Bloqueios:** pelo menos 120 bloqueios encerrados em 12 semanas, distribuídos nos 7 motivos de forma desigual (um motivo com mais de 20 para ter P50/P85, outros abaixo de 20), 3 a 5 em aberto; 40 a 60 com "Aguardando fornecedor" repartidos em 3 a 4 fornecedores fictícios ("Fornecedor Alfa", "Beta", "Gama", "Delta"), um deles com ≥ 20.
2. **Transições:** retornos (`direcao = 'retorno'`) em cerca de 25% das entregas, concentrados em "Em teste → Em desenvolvimento" e "Em homologação → Em desenvolvimento"; 2 a 4 reaberturas a partir de "Entregue"; uma etapa de fila (ex.: "Aguardando homologação") que cresce nas últimas 4 semanas, para o CFD ter história.
3. **Primeiro toque:** `primeiro_toque_em` para todos os cards com reação, distribuição assimétrica (maioria em menos de 1 dia útil, cauda até 15); 5 a 8 pedidos abertos sem toque; um tipo com menos de 20 para exercitar a amostra insuficiente.
4. **Parados no WIP:** 20% a 30% do WIP com `semMover` acima de 5 dias úteis.
5. **Ordem de chegada:** inícios fora de ordem em cerca de 25% dos casos da classe Padrão, dentro de mesma equipe e tipo. Cards das classes Urgente, Prazo fixo e Intangível existem no mock, mas ficam fora do cálculo, para exercitar o filtro de classe.
6. **Descarte:** 6% a 10% dos encerrados em estado `discarded`, dois terços antes do início, um terço depois, mais 1 card com motivo e sem descarte (para o aviso); sem motivos no mock (`porMotivo = null`) até a integração ler o catálogo.
7. **Passagens:** `passagens` inteiro por card entregue, 0 a 6, correlacionado positivamente com o tempo de ciclo; nenhuma identidade no mock além do que já existe.
8. **Sazonalidade:** 24 meses de `criado_em` com picos em janeiro e julho (ou o padrão que o usuário indicar na validação) e ruído; mês corrente parcial.
9. **Áreas:** 6 a 8 áreas solicitantes, volumes desiguais; 10% a 25% de "ida e volta" por área; duas áreas com menos de 20 demandas.
10. **Vínculos:** `fato_vinculo` em cerca de 35% das demandas e 50% das frentes, apontando para cards de quadros de outras equipes.
11. **Projetos:** 11 a 14 projetos concluídos em 12 meses com `data_acordada`, data original e 0 a 3 replanejamentos (menos de 20, para exercitar a variante `lenta`); 6 a 8 projetos aprovados não iniciados, um acima de 180 dias úteis.
12. **Sistemas:** 18 a 20 sistemas com entregas, natureza por tipo; `agg_conhecimento_sistema` com 4 sistemas em 1 pessoa, 6 em 2, o resto em 3 ou mais. O mock gera o agregado diretamente, sem pessoas.
14. **T14:** 6 projetos em andamento (dois com menos de 20 demandas, um deles ligado a um sistema do meu time com 0% de atuação), 12 a 62 demandas cada, três times fictícios por projeto no mínimo (nunca exibidos), participação do meu time de 12% a 66%, 1 a 2 demandas por projeto sem time responsável.
13. **Configuração:** nenhum prazo contratado (T10 mostra "Prazo contratado não informado"). O mock não gera custo total do DSPD: o E7 mostra só participação e contagem (D2 = A, 2026-10-17).

## 9. Microcopy comum
- Seções: "Onde o trabalho acumula?", "Onde se perde esforço?", "O que entra, e quando?", "De quem depende o prazo?", "Onde o parque se concentra, e qual o risco de continuidade?".
- Selos: "Conta trocas, nunca quem." (O26) · "Mede risco de continuidade do parque. Não mostra nem avalia pessoas." (E8). O selo "Rateio do custo total do DSPD..." do E7 foi retirado (D2 = A).
- Célula sem amostra: "— amostra insuficiente".
- Rodapé: "Fonte: BusinessMap" · "Granularidade: demanda | frente | projeto | sistema" · "Sem meta numérica".

## 10. Critérios de aceite (EARS)
- `CA-1` QUANDO a pessoa abre "Mais métricas deste painel" no Operacional O SISTEMA DEVE exibir as seções "Por que demora?", "Onde o trabalho acumula?" e "Onde se perde esforço?" com os cartões O19, O22, O20, O24, O21, O25 e O26 nas seções da tabela 4.
- `CA-2` QUANDO a pessoa abre "Mais métricas deste painel" no Tático O SISTEMA DEVE exibir T11 e T12 em "O que entra, e quando?" e T10, T13 e T14 em "De quem depende o prazo?".
- `CA-3` QUANDO a pessoa abre "Mais métricas deste painel" no Estratégico O SISTEMA DEVE exibir E9 com E4, E6 com E5 e E7 e E8 em "Onde o parque se concentra, e qual o risco de continuidade?".
- `CA-4` QUANDO o cartão O2 carrega com itens em andamento O SISTEMA DEVE exibir a linha "k de n itens em andamento sem mover há mais de 5 dias úteis", com o percentual só se n ≥ 20.
- `CA-5` SE uma classe tem menos de 20 itens ENTÃO O SISTEMA DEVE substituir percentil e percentual por AmostraInsuficiente ou "k de n", sem mostrar o número.
- `CA-6` SE um grupo do par "com × sem" (O21, T13) tem menos de 20 itens no tipo ENTÃO O SISTEMA DEVE não exibir a comparação e indicar qual grupo está abaixo do mínimo.
- `CA-7` O SISTEMA DEVE exibir "Fonte: BusinessMap" no rodapé dos 17 cartões e nunca combinar dado do Acelerato em qualquer valor deles.
- `CA-8` O SISTEMA DEVE oferecer em T13 a troca entre "Demandas" e "Frentes" exibindo uma granularidade por vez.
- `CA-9` O SISTEMA DEVE omitir dos cartões O26 e E8, da tabela equivalente e da exportação qualquer nome, e-mail ou identificador de pessoa.
- `CA-10` QUANDO o recorte de E8 tem menos de 5 sistemas O SISTEMA DEVE exibir "Recorte pequeno demais para mostrar a concentração sem identificar pessoas." e ocultar as faixas.
- `CA-11` O SISTEMA DEVE ordenar T10 por nome do fornecedor, T12 por volume de demandas e E7 por participação, sem destaque de "pior" ou "melhor".
- `CA-12` QUANDO a pessoa abre T11 O SISTEMA DEVE exibir o chip "Não afetado por: Período" e a janela fixa de 24 meses mais o mês corrente listrado.
- `CA-13` O SISTEMA DEVE exibir no E7 só a participação percentual e a contagem de entregas por sistema, sem nenhum valor em dinheiro, esteja o custo total do DSPD configurado ou não (D2 = A, 2026-10-16).
- `CA-35` ~~Custo rateado no E7~~ **Revogado por D2 = A (2026-10-16):** o E7 não exibe custo; vale o CA-13.
- `CA-36` O SISTEMA DEVE exibir no T10 a linha "Prazo contratado não informado" e não exibir coluna de prazo contratado nem status "dentro/acima do contratado".
- `CA-37` O SISTEMA DEVE calcular no O24 a espera do ultrapassado como os dias úteis entre o início do primeiro item que passou na frente e o início dele próprio, na fila da mesma equipe, e exibi-la como "esperaram, depois de ultrapassados, X dias úteis até começar".
- `CA-38` O SISTEMA DEVE contar como passagem no O26 só a troca em que alguém sai e outro entra ou o conjunto de responsáveis é substituído, e não contar a inclusão de co-responsável sem saída.
- `CA-39` O SISTEMA DEVE contar como "ida e volta" no T12 o bloqueio com motivo "Falta de informação no chamado" antes do início ou o retorno do card da coluna de compromisso ao backlog.
- `CA-40` O SISTEMA DEVE contar no T13 só o vínculo `predecessor` com card de outro quadro, inclusive o removido antes da entrega que esteve vigente antes dela.
- `CA-41` O SISTEMA DEVE listar no T14 os projetos ligados a um sistema do meu time, mesmo com 0% de atuação, e os projetos com pelo menos 1 card do meu time.
- `CA-42` (alinhado à R-1 = B, 2026-10-16, que refina a Q-T14-6 = A) O SISTEMA DEVE exibir "Outros times" no T14 mesmo quando o projeto tem um único outro time, desde que os outros times somem 2 pessoas ou mais, sem nome, tempo, vazão nem ranking.
- `CA-45` (T14-M1 = B, 2026-10-17) SE os outros times de um projeto somam menos de 2 pessoas (cadastro de membros, Q-T14-10 = B) ENTÃO O SISTEMA DEVE ocultar "Outros times" no T14 e exibir só o texto "Meu time: k", sem barra, sem "Sem time informado", sem o total exato do projeto, sem "k de n" e sem percentual, na tela, na tabela alternativa e na exportação (texto alinhado pela T14-1 = A, 2026-10-23).
- `CA-43` O SISTEMA DEVE considerar o primeiro toque do O22 só como o primeiro comentário humano posterior à criação do card.
- `CA-14` O SISTEMA DEVE não incluir nenhum dos 17 cartões na faixa "Pede atenção".
- `CA-15` QUANDO a pessoa abre a página "Métricas" O SISTEMA DEVE listar "Retrabalho e reincidência" com status "Coberta por outras métricas" e links para O13, T5, O21, S8 e S12, sem cartão próprio.
- `CA-16` O SISTEMA DEVE exibir em cada um dos 17 cartões "Como ler e como é calculado", "Ver como tabela" com os mesmos números do gráfico e o selo "Dados fictícios" enquanto o status for `mock`.
- `CA-17` O SISTEMA DEVE calcular O24 só com cards da classe Padrão, comparando cada início com pedidos mais antigos do mesmo tipo, e excluir as classes Urgente, Prazo fixo e Intangível.
- `CA-18` ~~Listar os sistemas da faixa "1 pessoa" no E8~~ **Revogado por R-1 = B (2026-10-16):** o E8 mostra só a contagem de sistemas por faixa e nunca nomeia sistema; vale o CA-46.
- `CA-19` O SISTEMA DEVE calcular o tempo consumido do O25 do início (primeira entrada em execução) até o descarte e mostrar à parte os descartados antes do início, com tempo zero.
- `CA-20` O SISTEMA DEVE usar em E6, como data comprometida, o valor de `data_acordada` registrado no compromisso e exibir o número de alterações posteriores como replanejamentos.
- `CA-21` O SISTEMA DEVE excluir vínculos pai/filho da contagem de dependências do T13.
- `CA-22` O SISTEMA DEVE não usar tempo apontado em nenhum dos 17 cartões.
- `CA-23` O SISTEMA DEVE dividir as barras do E7 nas quatro naturezas do T3 (Sustentação, Evolução, Projetos, Dívida técnica), pela mesma função de classificação do T3.
- `CA-24` O SISTEMA DEVE incluir no T10 todo bloqueio encerrado com fornecedor informado, qualquer que seja o motivo, e excluir o bloqueio sem fornecedor.
- `CA-25` ~~Não listar sistemas com recorte de 4 ou menos~~ **Revogado por R-1 = B (2026-10-16):** a lista não existe em nenhum recorte; vale o CA-46 (o recorte pequeno segue no CA-10).
- `CA-46` (R-1 = B, 2026-10-16) O SISTEMA DEVE exibir no E8, em qualquer recorte, só a contagem de sistemas nas faixas "1 pessoa", "2 pessoas" e "3 ou mais", sem nomear nem listar nenhum sistema, na tela, na tabela alternativa e na exportação.
- `CA-47` (O20-destaque = A, 2026-10-16) QUANDO o O20 compõe a frase de destaque O SISTEMA DEVE considerar só as faixas de fila a partir do compromisso e nunca apontar o Backlog como a etapa que mais acumulou, embora o desenhe como faixa do gráfico.
- `CA-48` (O19-pct = B, 2026-10-16) O SISTEMA DEVE calcular no O19 o percentual de cada causa sobre os dias úteis bloqueados e aplicar o mínimo de 20 sobre o número de bloqueios da causa.
- `CA-49` (O25(b) = B, 2026-10-16) O SISTEMA DEVE não contar como descarte no O25 o card entregue e depois excluído, mantendo-o como entrega na vazão e no ciclo.
- `CA-50` (T10-janela = A, 2026-10-16) O SISTEMA DEVE calcular no T10 os percentis P50/P85 na janela móvel de 12 semanas, e a contagem e a soma pelo período do painel.
- `CA-51` (B11-001 = sim, 2026-10-17) O SISTEMA DEVE tratar no T10 como o mesmo fornecedor os nomes que diferem só por maiúsculas, minúsculas ou espaços.
- `CA-27` QUANDO a pessoa abre o T14 com uma equipe no filtro O SISTEMA DEVE exibir, para cada projeto em andamento, a contagem de demandas do meu time, de outros times (somados) e sem time informado, em barra com cor e hachura e rótulo "k de n", exceto no projeto com "outros times" oculto (CA-45).
- `CA-28` SE o filtro de Equipe está em "Todas" ou tem mais de uma equipe ENTÃO O SISTEMA DEVE exibir "Escolha uma equipe para ver a participação do meu time." no T14 e não calcular nenhum valor.
- `CA-29` O SISTEMA DEVE não listar, nomear, filtrar nem ordenar nenhum outro time no T14, na tabela alternativa e na exportação; "outros times" é uma única soma.
- `CA-30` O SISTEMA DEVE ordenar os projetos do T14 pelo total de demandas do projeto, do maior para o menor, e não pela participação do meu time.
- `CA-31` SE o projeto (ou o total) tem menos de 20 demandas com time informado ENTÃO O SISTEMA DEVE exibir "k de n" e "percentual não publicado (menos de 20)" no T14, sem o percentual.
- `CA-32` O SISTEMA DEVE contar no T14, por padrão, demandas (story) agrupadas ao projeto e oferecer a troca para frentes exibindo uma granularidade por vez, sem nunca contar projeto.
- `CA-33` O SISTEMA DEVE incluir no total de demandas do T14 as demandas sem time responsável, excluí-las do denominador do percentual e exibir a contagem delas em "Sem time informado".
- `CA-34` O SISTEMA DEVE exibir no T14 o selo "Só mostra meu time e os outros somados. Não compara times." e aplicar o filtro de Período à escolha dos projetos, contando sempre o projeto inteiro.
- `CA-26` O SISTEMA DEVE contar como descartados no O25 os cards com estado nativo `discarded` e os excluídos, usando `discarded_at` (no excluído, o instante da exclusão ou, sem ele, a última revisão, marcada como aproximada), e listar à parte, fora da taxa, o card com motivo de descarte sem estar descartado nem excluído.
- `CA-44` ENQUANTO a integração não ler o catálogo de motivos de descarte do BusinessMap O SISTEMA DEVE exibir no O25 só a taxa e o tempo consumido, sem divisão por motivo, e nunca usar o comentário do descarte.

## 11. Registro de alinhamentos às decisões do usuário (E3.2, 2026-10-17)
| Decisão | Data | O que mudou nesta especificação |
|---|---|---|
| R-1 = B (reidentificação no E8 e na T14; não é a R-1 = A do O24) | 2026-10-16 | E8 sem lista de sistemas (§3 item 8, §5 E8, CA-18 e CA-25 revogados, CA-46); T14 com "outros times" só com 2 pessoas ou mais (§5 T14, CA-42) |
| T14-M1 = B | 2026-10-17 | T14 com "outros times" oculto mostra só a fatia do meu time, sem o total (§3 item 8, §5 T14, CA-45, CA-27 ressalvado) |
| T14-1 = A | 2026-10-23 | ficha da T14 alinhada à tela: projeto oculto mostra só 'Meu time: k' (§5 T14, CA-45) |
| Q-T14-10 = B | 2026-10-17 | "Pessoa" = membro no cadastro por time da configuração (§5 T14) |
| D2 = A | 2026-10-17 | E7 sem custo: §3 itens 2 e 13, §5 E7, §7 (linha do custo total removida), §8 item 13, CA-13, CA-35 |
| O20-destaque = A | 2026-10-16 | §5 O20, CA-47 |
| O19-pct = B | 2026-10-16 | §5 O19, CA-48 |
| O25(b) = B | 2026-10-16 | §5 O25, CA-49 |
| T10-janela = A | 2026-10-16 | §5 T10, CA-50 |
| B11-001 = sim | 2026-10-17 | §5 T10, CA-51 |
| Nome novo do E7 (decisão do dono no pedido 021, opção A = A-10 da revisão de UX; aplicada no pedido 024) | 2026-10-17 | Título do E7 na §5 e linha 15 do catálogo em `01-cobertura.md`; nesta data a pergunta não mudou (trocada em 2026-10-20, ver a linha abaixo); os critérios de aceite não mudam (CA-3, CA-11, CA-13 e CA-23 citam só "E7") |
| Pergunta do E7 = opção A (decisão do dono, pedido 036) | 2026-10-20 | §5 E7: pergunta passa a pedir a participação de cada sistema nas entregas (texto exato na ficha do E7; antes falava em capacidade); catálogo `web/src/content/catalogo-metricas.ts` trocado em bf137a9; critérios de aceite não mudam |
