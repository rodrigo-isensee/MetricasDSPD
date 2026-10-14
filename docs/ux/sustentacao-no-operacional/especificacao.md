# Sustentação dentro do Operacional

Discovery de UX do pedido do usuário: "métricas de operação dentro da aba Operacional; o UX sugere o melhor posicionamento de cada métrica". Base lida: `origin/main` (demo): `features/{operacional,sustentacao,percepcao,complementares,filtros,painel,exportar,visao-geral}`, `packages/contratos/src/cartoes.ts`; `docs/ux/revisao-geral-usabilidade/{02-propostas,04-decisoes}.md` (U1 a U5, P1 a P3); `docs/ux/espera-invisivel-nos-paineis/especificacao.md`; briefing T3.1, T3.4, WS5, T6.1 e seção 6 (FL1 e Sustentação). Protótipo: `prototipo.html` (nesta pasta). O que está marcado como **hipótese** espera confirmação do usuário.

**Status (2026-10-13):** D1 a D3 decididas pelo usuário (seção 13). O seletor passa a ser **Visão: Resumo (padrão) · Diária · Semanal · Sustentação**; a nova visão **Resumo** está especificada na seção 5.9 e no protótipo. Onde o texto antigo falar em "Também nesta aba" ou em seletor de três opções, vale a seção 13 e a 5.9. Nada entra em "Pronto para fazer" antes de o usuário validar o protótipo atualizado e responder as perguntas Q1 a Q6 (5.9.8).

**Dependência:** começa depois do merge de `espera-invisivel-nos-paineis` (mexe nos mesmos arquivos: `OperacionalPage`, `paineis.ts`, `codec.ts`, `exportar/selecao.ts`, redirecionador). Um ajuste nessa demanda é necessário (ver 7.4: o prefixo `sust_` não pode ser removido).

---

## 1. Objetivo
Quem acompanha a operação (times, coordenadores, líder da sustentação) encontra num só lugar, a aba Operacional, tudo o que mede o dia a dia: o fluxo de projeto (BusinessMap) e o atendimento de chamados (Acelerato). O resultado esperado é um menu com uma aba a menos, sem nenhum link quebrado, sem nenhum oculto perdido e **sem nenhuma leitura que misture as duas fontes**.

## 2. Personas / contexto de uso
| Persona | O que procura no Operacional | Cadência | Dispositivo |
|---|---|---|---|
| Time de projeto (daily e revisão semanal) | Item parado, bloqueios, WIP; distribuição de tempo | Diária, semanal | 1280 projetado; 375 consulta |
| Coordenador | Fluxo do time e, quando a equipe também atende chamados, se o SLA está em risco | Semanal | 1280 |
| Líder da sustentação | Aderência ao SLA e tempos por prioridade; volume, escalação, causas | Semanal e mensal (subtítulo atual do painel) | 1280 na reunião; 375 consulta |

Insight do briefing (seção 02): "sustentação e demanda não planejada convivem nos quadros dos times". Ver o atendimento perto do fluxo faz sentido para o coordenador. Mas as populações, as unidades (dias úteis × horas úteis), os filtros e os rituais são diferentes, e a regra inviolável proíbe misturar as fontes em qualquer cálculo, histograma, percentil ou previsão.

Hipóteses (confirmar, sem bloquear):
- **H1.** A sustentação não tem leitura diária: todas as métricas S são de período, calculadas sobre chamados fechados, e o briefing não define daily de sustentação (T6.1). Por isso a visão Diária continua só do fluxo.
- **H2.** As equipes do BusinessMap e as do Acelerato (SSSC TOTVS, SENIOR, FLUIG) não têm correspondência definida. Não há filtro de equipe comum: cada fonte tem o seu. Se um dia houver correspondência, ela é regra de negócio do usuário e não se infere no código.
- **H3 (revista).** Abrir o Operacional sem parâmetro cai no **Resumo** (decisão D1). Links antigos com `cadencia=diaria|semanal` seguem valendo; links antigos sem `cadencia` que contavam com a Diária mudam de destino (5.9.6).

## 3. Ideação: onde a Sustentação entra

### 3.1 Alternativas
| Alt. | Ideia | Prós | Contras | Esforço |
|---|---|---|---|---|
| **A. Subabas por fonte** | Operacional ganha dois níveis de navegação: "Fluxo de projeto" e "Sustentação"; dentro do fluxo continua "Diária / Semanal" | Separação perfeita; filtros sem ambiguidade | Dois seletores empilhados (fonte e cadência): é a aba antiga com um clique a mais e mais um nível para aprender | M |
| **B. Seções por pergunta, intercaladas** | "Tempo" com O3 e S1 lado a lado; "Volume" com O4 e S3; "Qualidade" com O15 e S8 | Responde ao pé da letra "posicionar cada métrica"; leitura por pergunta | Cartões de fontes, unidades e populações diferentes lado a lado convidam à comparação (a regra veta no cálculo, e a proximidade empurra a leitura para isso); cada seção teria cartões com filtros diferentes (equipe do BM ao lado de prioridade do Acelerato), o que confunde; sem "Pede atenção" coerente por seção; e nenhum ritual usa essa mistura (T6.1) | G |
| **C. Semanal com dois blocos empilhados** | A visão Semanal mostra o bloco "Fluxo de projeto · BusinessMap" e, abaixo, o bloco "Sustentação · Acelerato", cada um com a sua barra de filtros e o seu "Pede atenção" | Tudo numa rolagem; separação clara por bloco | Página mais longa do produto (cerca de 20 cartões do núcleo); duas barras de filtros na mesma tela (qual vale para o cartão que estou vendo?); duas reuniões diferentes (revisão de fluxo e revisão do serviço) dividem a mesma tela; mais pesada (exigiria carga por seção) | M/G |
| **D. Visões por reunião (recomendada)** | O seletor que hoje é "Cadência: Diária / Semanal" vira **"Visão: Diária · Semanal · Sustentação"**. Cada visão é a pauta de uma reunião, de uma fonte só, com a sua pergunta, os seus filtros, o seu "Pede atenção" e o seu índice. Nas visões do fluxo, uma linha discreta avisa se a Sustentação pede atenção (e vice-versa) | Um único controle, que já existe e as pessoas conhecem; o seletor espelha o "Por reunião" da Visão geral; uma fonte por tela, então filtros, alertas e índice continuam sem ambiguidade; a página não fica mais pesada (só a visão ativa carrega); a linha cruzada evita que a sustentação "suma atrás de um clique" | "Sustentação" não é uma cadência (por isso o rótulo vira "Visão"); quem quiser ver tudo na mesma rolagem não vê | M |

```
Impacto (clareza × aderência às regras)
 alto  |  D        A
 médio |       C
 baixo |              B
       +---------------------> esforço
          P      M      G
```

**Escolhida: D.** É a que entrega o pedido (tudo no Operacional, uma aba a menos) com o menor custo de aprendizado e o menor risco de leitura misturada. B fica descartada pela regra inviolável. C fica como plano B caso o usuário prefira uma rolagem única (D1).

### 3.2 Posicionamento de cada métrica (alternativa D)
| Visão | Fonte | Seção (id) | Cartões | Observação |
|---|---|---|---|---|
| Diária | BusinessMap | (sem título) | O2, BLOQUEADOS, O1 | Sem mudança. Nenhuma métrica da sustentação (H1). |
| Semanal | BusinessMap | `tempo` Tempo | O3, O9 | Sem mudança. |
| Semanal | BusinessMap | `fluxo` Fluxo | O4 | |
| Semanal | BusinessMap | `compromissos` Compromissos | O12 | |
| Semanal | BusinessMap | `backlog` Backlog | O10, O7 | |
| Semanal | BusinessMap | `qualidade` Qualidade | O15, O18 | O15 continua com "leia junto" O17, agora na visão Sustentação (ver 5.6). |
| Semanal | BusinessMap | `espera-invisivel` "Quanto do tempo do solicitante fica fora da nossa gestão?" | EI-FL1 | Como na espec. da espera invisível. |
| Semanal | BusinessMap | `mais-metricas` | O5, O6, O8, O11, O13, O14, O16 | Sem mudança. |
| Sustentação | Acelerato | (nota de recorte) | | O texto atual do recorte (`recorte-sustentacao`) fica no topo da visão. |
| Sustentação | Acelerato | `prazos` Prazos | S2, S1 | Ordem atual: S2 primeiro (é o que o "Pede atenção" aponta). |
| Sustentação | Acelerato | `volume` Volume e resolução | S3, S4 | |
| Sustentação | Acelerato | `causas` Escalação, encerramento e reclassificação | S5, S6, S7 | |
| Sustentação | Acelerato | `espera` "Quanto do tempo do solicitante fica fora da nossa gestão?" | EI-SUST | Mesmo título da seção do fluxo; o selo de fonte e a unidade (horas úteis) distinguem. |
| Sustentação | Acelerato | `mais-metricas` | S9, S10 (`sust-por-que-demora`); S8, S11, O17 (`sust-qualidade`); S12 (`sust-o-que-entra`) | O17 fica aqui: no briefing ela é do FL1, mas a implementação usa incidentes do Acelerato; a fonte manda nos filtros e na tela. |
| Sustentação | Pesquisa de percepção | `percepcao` Percepção de valor · pesquisa trimestral | PV1 | Fica no fim, como hoje: terceira fonte, sem cálculo cruzado. |

Ids de cartão: **nenhum muda**. Ids de seção: só os das complementares da sustentação ganham o prefixo `sust-` (hoje `por-que-demora` e `o-que-entra` existem nos dois painéis e gerariam `#compl-por-que-demora` repetido na mesma rota). `secao` é metadado do catálogo e não é gravado em preferências.

## 4. Fluxo
1. A pessoa entra pelo menu em "Operacional" (cai no **Resumo**, H3), pela Visão geral (alerta, cartão do nível Sustentação, "Por reunião"), por link antigo `/sustentacao...` ou por link com hash.
2. No Resumo responde "estamos bem?" em uma tela: alertas, números-chave e tendência dos últimos 6 meses, de cada fonte em seu bloco. Dali segue pelos links "Ver na Diária / Semanal / Sustentação" para o detalhe.
3. Ou escolhe a visão no seletor "Visão: Resumo · Diária · Semanal · Sustentação". A URL troca `cadencia` (entrada no histórico: Voltar desfaz). Foco fica no rádio escolhido; anúncio educado: "Visão Sustentação. Fonte: Acelerato." (no Resumo: "Visão Resumo. Fontes: BusinessMap e Acelerato, em blocos separados.")
4. Nas visões de detalhe, lê o "Pede atenção", usa o índice fixo e filtra com os filtros daquela fonte. (Sem linha "Também nesta aba": D2 decidida como "não"; o Resumo reúne os alertas das duas fontes.)

Fluxos alternativos:
- **Link com hash** de cartão ou seção de outra visão: abre a visão dona do hash (tabela 6.2), rola e foca o cartão; se oculto, cai no marcador da P1 com "Mostrar".
- **Link antigo `/sustentacao`**: redireciona sem tela intermediária (6.1).
- **Fonte sem nenhuma coleta ok**: só a visão daquela fonte mostra o estado `SemDadosDaFonte`; as outras visões funcionam.
- **Erro em um cartão**: erro por cartão com "Tentar de novo"; não derruba a seção nem a visão.

## 5. Telas

### 5.1 Wireframe 1280 (visão Sustentação)
```
[Métricas DSPD]  Visão geral · Operacional · Tático · Estratégico · Dados       [Dados fictícios] [Prefs]
------------------------------------------------------------------------------------------------------
Operacional                                              Dados até 09/10/2026 · Fonte: Acelerato  (o)
Estamos atendendo e restaurando dentro do combinado?
Visão: ( Resumo | Diária | Semanal | [x Sustentação] )   Para o líder da sustentação · semanal e mensal
[Métricas 13 de 14 v] [Exportar] [Exportar vários]
+-- barra fixa ------------------------------------------------------------------------------------+
| Filtros da Sustentação · Acelerato:  Equipe de sustentação v  Prioridade v  Período: 6 meses v    |
| Prazos · 2 pedem atenção | Volume e resolução | Escalação... | Espera invisível | Mais | Percepção |
+--------------------------------------------------------------------------------------------------+
Chamados da organização DSPD Sustentação, tipo DSPD - SSSC ... (nota de recorte)
Os filtros do fluxo de projeto (2 ativos) continuam guardados para as visões Diária e Semanal.
+ PEDE ATENÇÃO NA SEMANA · SUSTENTAÇÃO (ACELERATO) -----------------------------------------------+
| ! Aderência ao SLA abaixo de 90% em 2 prioridades   Ver Aderência ao SLA (S2)                    |
| ! Mediana acima do alvo em 1 prioridade             Ver Primeiro atendimento e restauração (S1)  |
+--------------------------------------------------------------------------------------------------+
## Prazos                     Cumprimos o combinado, em cada prioridade?
[S2 Aderência ao SLA ............ Fonte: Acelerato]  [S1 Primeiro atendimento ... Fonte: Acelerato]
## Volume e resolução ...
## Escalação, encerramento e reclassificação ...
## Quanto do tempo do solicitante fica fora da nossa gestão?   [EI-SUST ... horas úteis]
[> Mais métricas desta visão · 6 complementares]
## Percepção de valor · pesquisa trimestral   [PV1 ... Fonte: Pesquisa de percepção]
```
Nas visões Diária e Semanal o desenho é o atual (com P1 e P3), mais o título "Filtros do fluxo de projeto · BusinessMap" na barra. Wireframes do Resumo: 5.9.

### 5.2 Wireframe 375 (visão Sustentação)
```
Operacional                         (o)
Estamos atendendo e restaurando...
Dados até 09/10 · Fonte: Acelerato
Visão: [Resumo][Diária][Semanal][x Sustentação]   (44 px; se não couber em 343 px, 2 linhas, sem rolagem horizontal)
[Métricas] [Exportar]
+ fixa: [Filtros da Sustentação (1)] [Seção: Prazos · 2 pedem atenção v] +
PEDE ATENÇÃO NA SEMANA · SUSTENTAÇÃO
! Aderência ao SLA abaixo de 90% em 2 prioridades
  Ver Aderência ao SLA (S2)
[cartões em coluna única]
```

### 5.3 Componentes (reaproveitar)
- `SeletorCadencia` com `rotulo="Visão"` e três opções (sem componente novo).
- `PainelFluxo` / `PainelSustentacao` → a página Operacional passa a montar o molde da fonte da visão ativa (a `Casca` já aceita `fontes`, `preferencias` e `painelDoCorpo`; o título e o slug ficam "Operacional"). Detalhe técnico com o arquiteto.
- `BarraFiltros` (com legenda de grupo nova, ver 5.5), `ChipsFiltros`, `FaixaAtencao`, `SecaoPainel`, índice da P3, marcador da P1, `MaisMetricas`, `CartaoPV1`, `ChipFonte` e `ChipFiltros` do `CartaoMetrica`.
- Novo e pequeno: `LinhaOutraFonte` ("Também nesta aba"), ver 5.4.

### 5.4 "Pede atenção" (fontes separadas)
- Cada visão tem a sua faixa, de uma fonte só: Diária "Pede atenção hoje" (O2, BLOQUEADOS, O1); Semanal "Pede atenção na semana" (O3, O10, O12); Sustentação "Pede atenção na semana" (S2, S1). Mesmas regras de hoje; nada novo é calculado.
- O título da faixa ganha a fonte quando a página tem duas: "Pede atenção na semana · Sustentação (Acelerato)" e "Pede atenção na semana · Fluxo de projeto (BusinessMap)". Na Diária: "Pede atenção hoje · Fluxo de projeto (BusinessMap)".
- **Linha "Também nesta aba": REMOVIDA (D2 = não).** Substituída pelo Resumo, que reúne os alertas das duas fontes em blocos separados (5.9.4). Os estados, microcopy e critério 9 antigos foram descartados.
- Visão geral: o grupo "Sustentação" do "Pede atenção" continua separado por nível, como hoje; só o destino do link muda (5.8).

### 5.5 Filtros na mesma página
Princípio: **uma barra por visão, com os filtros da fonte daquela visão, e o nome da fonte escrito na barra.** Nunca dois conjuntos de filtros visíveis ao mesmo tempo.

| Visão | Legenda da barra | Filtros | Período padrão |
|---|---|---|---|
| Diária, Semanal | "Filtros do fluxo de projeto · BusinessMap" | Equipe, Tipo de demanda, Sistema, Período | 12 semanas |
| Sustentação | "Filtros da Sustentação · Acelerato" | Equipe de sustentação, Prioridade, Período | 6 meses |

- **Rótulo "Equipe de sustentação"** na visão Sustentação (as equipes são outras, H2); "Equipe" no fluxo continua como está.
- **Prioridade só aparece na visão Sustentação; Tipo e Sistema só nas do fluxo.** Não há filtro desabilitado nem "não se aplica" na barra: o que não vale não aparece (regra D3 da spec de filtros, já vigente).
- **Os dois conjuntos ficam guardados na URL ao mesmo tempo**, para que trocar de visão não perca o que foi filtrado. Os do fluxo continuam sem prefixo (todos os links atuais seguem válidos); os da sustentação usam o prefixo `sust_` (`sust_equipe`, `sust_prioridade`, `sust_periodo`, `sust_de`, `sust_ate`). Os parâmetros de cartão (`s3`, `s4`, `s5`, `s6`, `ei_sust`, `o2`, `o3`...) não mudam (já são únicos).
- Na visão Sustentação, se houver filtros do fluxo fora do padrão, uma linha discreta abaixo da barra: "Os filtros do fluxo de projeto (2 ativos) continuam guardados para as visões Diária e Semanal." (recíproca nas visões do fluxo). Sem botão: é só status.
- Chips, "Limpar filtros" e "Remover" agem só nos filtros da visão ativa. O aviso de link com valor inválido (2.6) cita a fonte: "Prioridade 'P9' não existe na Sustentação e foi ignorada."
- **Aplicabilidade por cartão:** o rodapé atual do cartão ("Filtros aplicados: … · Não afetado por: …") lista só filtros da própria fonte; nunca cita "Tipo" num cartão S nem "Prioridade" num cartão O. PV1 continua "Não afetado pelos filtros (pesquisa trimestral)".
- Memória da sessão: igual a hoje (só o fluxo é lembrado entre painéis). A sustentação segue independente.

### 5.6 Selo de fonte em cada cartão
- Todo cartão das três visões mostra o `ChipFonte` ("Fonte: BusinessMap", "Fonte: Acelerato", "Fonte: Pesquisa de percepção"). Hoje já existe no `CartaoMetrica`; o critério de aceite garante que nenhum cartão (inclusive complementares, EI e PV1) fique sem.
- O cabeçalho da página mostra a fonte e o frescor **da visão ativa** ("Fonte: Acelerato"), não das duas.
- Nenhuma cor por fonte (evita sugerir comparação e não depende de cor): a fonte é sempre texto.
- "Leia junto" que cruza visões (O15 ↔ O17) é rotulado: "Leia junto: Defeitos por causa raiz e sistema (O17) · visão Sustentação, fonte Acelerato". O clique troca a visão, abre "Mais métricas" e foca o cartão. Ler junto não é calcular junto: nenhum número sai de um cartão para outro.

### 5.7 Índice fixo por seção (P3)
- Um índice por visão, só com as seções dela, com o mesmo resumo da P3 ("1 pede atenção", "1 oculta", "sem alerta"), sem cálculo novo.
- Semanal: Tempo · Fluxo · Compromissos · Backlog · Qualidade · Espera invisível · Mais métricas. Sustentação: Prazos · Volume e resolução · Escalação, encerramento e reclassificação · Espera invisível · Mais métricas · Percepção de valor. Diária: sem índice (três cartões; como hoje).
- Some do índice a seção com tudo oculto (regra CA-12 atual).
- 375: vira o seletor "Seção" fixo junto de "Filtros (n)", como na P3. O seletor de Visão não é fixo (economiza altura no celular); em 1280 ele também não é fixo.

### 5.8 Visão geral, catálogo, exportação, preferências, Ajuda
**Visão geral**
- `ROTA_DO_NIVEL.sustentacao` → `/operacional?cadencia=sustentacao`. O cartão do nível continua chamado "Sustentação"; o link vira "Abrir Operacional · Sustentação".
- Espera invisível da Sustentação → `/operacional?cadencia=sustentacao#ei-sust`.
- "Por reunião" (D3 decidida: **semanal**): entra "Revisão da sustentação · semanal · Estamos atendendo e restaurando dentro do combinado? → `/operacional?cadencia=sustentacao`", depois da "Revisão de fluxo semanal". Os demais itens de "Por reunião" que apontam para o Operacional passam a levar `cadencia` explícito (`diaria` ou `semanal`), pois o padrão sem parâmetro agora é o Resumo.

**Catálogo (`/metricas`, na Ajuda)**
- As linhas S1 a S12, O17, EI-SUST e PV1 mostram painel "Operacional · Sustentação" e levam a `/operacional?cadencia=sustentacao#<id>`. O filtro "Painel" troca a opção "Sustentação" por "Operacional · Sustentação". Contagens não mudam.

**Exportação**
- O botão "Exportar" de cada visão exporta a fonte da visão: Diária e Semanal exportam o nível `operacional` (BusinessMap, como hoje); a Sustentação exporta o nível `sustentacao` (Acelerato, como hoje). Nome de arquivo e escopo (`fluxo-operacional`, `sustentacao`) **não mudam**.
- Título do diálogo: "Exportar · Operacional (fluxo de projeto)" e "Exportar · Operacional · Sustentação".
- "Vários painéis": a opção "Sustentação" vira "Operacional · Sustentação", mesma ordem logo após "Operacional"; `rota` passa a `/operacional`, e os filtros vêm dos parâmetros `sust_` quando a pessoa está em `/operacional` (em qualquer visão), senão dos padrões. As seções do arquivo continuam separadas por fonte (BusinessMap, depois Acelerato).
- Oculto continua fora da exportação (regra do 007).

**Preferências (contrato do 007 intacto, sem migração)**
- O formato gravado continua `{ versao: 1, paineis: { operacional: {ocultar}, sustentacao: {ocultar}, ... } }`. **A chave `sustentacao` é mantida** como identificador interno do conjunto de cartões da visão Sustentação. Nenhum id de cartão muda. Logo, todo oculto já salvo continua valendo, sem migração, e voltar a uma versão anterior também não perde nada.
- Só muda o que é exibido: `ROTULO_PAINEL.sustentacao` passa a "Operacional · Sustentação"; na página Preferências ele aparece logo depois de "Operacional"; o popover "Métricas" de cada visão lista os cartões do conjunto daquela visão ("Métricas desta visão").
- Alternativa avaliada e não recomendada: fundir em `operacional` (exigiria migração na leitura: unir `sustentacao.ocultar` em `operacional.ocultar`, os ids são únicos, e nunca apagar a chave antiga). Não traz ganho visível e cria risco de perda em ida e volta de versão.

**Ajuda e textos**
- Trocar menções a "painel Sustentação" por "visão Sustentação do Operacional" (Ajuda, glossário, notas de exportação, mensagens de `SemDadosDaFonte`).

### 5.9 Visão Resumo (padrão)

**Pergunta da visão:** "Estamos bem?" Público: "Para coordenadores e líderes · uma leitura rápida das duas fontes." Não substitui as visões de detalhe: responde em um minuto e leva a elas.

#### 5.9.1 Princípios
- **Dois blocos, um por fonte, empilhados** (nunca lado a lado, para não convidar à comparação): "Fluxo de projeto · BusinessMap" e, abaixo, "Sustentação · Acelerato". Cada bloco tem título, selo "Fonte: ...", frescor próprio ("Dados até ...") e a mesma estrutura: alertas, números-chave, tendência, link.
- Nenhum número, gráfico ou alerta combina as fontes; nenhuma conta entre blocos; nenhum "total geral"; sem cor por fonte.
- Poucos números: os do núcleo que respondem "estamos bem?". Nada de complementares no Resumo.
- Sem barra de filtros (**hipótese H5**): o Resumo usa sempre os padrões (todas as equipes e tipos; janela de 12 semanas). Se houver filtros guardados nas outras visões, linha de status: "Os filtros guardados (fluxo de projeto: 2 ativos · Sustentação: 1 ativo) não se aplicam ao Resumo." Isso também evita que um número do Resumo difira do cartão filtrado sem explicação. Ver Q5.
- Todo cálculo continua na biblioteca compartilhada (T2.5). O Resumo **não calcula nada próprio**: reaproveita os DTOs dos cartões; a tendência mensal exige a consulta nova descrita em 5.9.3 (Q1).

#### 5.9.2 Números-chave (hipótese H6: confirmar a escolha)
Janela: 12 semanas móveis, dias úteis (fluxo) e horas úteis (sustentação). Abaixo de 20 itens, o número não é publicado: no lugar, "Poucos itens (n=14). Estatística não publicada." Cada número traz: rótulo, valor, unidade, base ("n itens concluídos"), o alvo em texto ("Meta: acima de 90%") e se está dentro ou fora **em texto com ícone** (nunca só cor), e link "Ver [código] na [visão]".

| Bloco | Número-chave | Origem (cartão) | Por que entra |
|---|---|---|---|
| Fluxo | **P85 do tempo de ciclo** (e P50 em segundo plano) | O3 | É o compromisso de previsibilidade (meta: reduzir P85 em 20% no semestre) |
| Fluxo | **Vazão**: itens concluídos na última semana fechada e faixa das 12 semanas (mín. a máx.) | O4 | "Faixa, não só média" (briefing) |
| Fluxo | **Itens abertos acima do P95** (contagem) | O2 | Meta: nenhum sem plano |
| Fluxo | **Vencidos por causa interna** (contagem) | O12 | Meta: zero |
| Sustentação | **Prioridades com aderência ao SLA abaixo de 90%** ("2 de 5") | S2 | Resume S2 sem agregar prioridades (Q3) |
| Sustentação | **Prioridades com mediana acima do alvo** ("1 de 5") | S1 | Idem, para MTTA/MTTR |
| Sustentação | **Volume de chamados na janela e proporção de P1+P2** | S3 | Contexto de carga; meta: proporção estável |

O3 no Resumo: percentil sobre o conjunto padrão do cartão O3 sem segmentação; se o O3 for segmentado por tipo, o Resumo mostra o tipo predominante rotulado ou "por tipo" com link (Q7). Story, frente e projeto nunca no mesmo histograma: o Resumo só traz o nível do Operacional (story).
Itens do núcleo que ficam só no detalhe: O1, O9, O10, O7, O15, O18, EI, PV1 e S4 a S7. Vão ao Resumo apenas pelo "Pede atenção" (O1, O10, bloqueados).
Respeita preferências: se o cartão de origem estiver oculto (P1), o número vira o marcador "oculta nas suas preferências · Mostrar" (mesmo contrato do 007); a tendência da métrica oculta também some.

#### 5.9.3 Tendência mês a mês (últimos 6 meses)
Uma série pequena por bloco (hipótese H7: duas séries por fonte, a decidir em Q6): Fluxo: **P85 do tempo de ciclo** e **itens concluídos no mês**; Sustentação: **aderência ao SLA** e **volume de chamados**.
- **Eixo:** os 6 últimos meses-calendário **fechados** (com a data de hoje, 13/10/2026: abril a setembro). O mês em curso não entra (H8; Q4). Os dois blocos usam o mesmo intervalo de meses.
- **Pertencimento ao mês:** fluxo, pela data de conclusão do item; sustentação, pela data de fechamento do chamado (as mesmas bases dos cartões O3/O4 e S1/S2/S3). Itens arquivados e excluídos permanecem (carga incremental).
- **Séries de contagem** (itens concluídos, volume de chamados): contagem simples do mês-calendário. Não são estatística de distribuição; o mês mostra o n como valor. Mês com 0 mostra 0, nunca lacuna.
- **Séries de distribuição** (P85, aderência): **cada ponto é o valor que o painel mostraria no último dia do mês**, ou seja, o percentil (ou a proporção) sobre a **janela móvel de 12 semanas terminando nesse dia**, calculado pela biblioteca T2.5 "como se estivesse naquela data" (consulta com data de referência). Nunca um percentil calculado só com os itens do mês: isso trocaria a janela de 12 semanas por uma de 4 a 5 semanas, regra que o briefing não autoriza e que pode enganar (amostras menores, caudas instáveis). Janelas vizinhas se sobrepõem por construção; o eixo diz isso: "cada ponto = janela de 12 semanas até o fim do mês". Alternativa (percentil só do mês-calendário) só com autorização do usuário (Q1).
- **Mês com menos de 20 itens na janela do ponto:** o valor **não é publicado**. O ponto aparece como marcador vazado (círculo aberto) sobre o eixo, **sem valor e sem linha ligando** os vizinhos, e o rótulo do mês diz "Abr · poucos itens (n=14)". Também na tabela alternativa: "n=14 · não publicado". Não depende de cor.
- **Mudança de critério de cálculo** (T2.6): linha vertical rotulada com a data, como nos demais gráficos.
- **Texto sempre presente:** título "P85 do tempo de ciclo, em dias úteis, últimos 6 meses", frase de leitura gerada ("Em setembro: 14 dias úteis, 2 a menos que em agosto") sem adjetivos e sem meta de pessoa, e botão "Ver como tabela" (tabela com mês, valor, n e marcação). Gráfico `role="img"` com `aria-label` resumindo; a tabela é o equivalente acessível.
- **Escala** com zero na base nas barras de contagem; linha para percentis com eixo rotulado e unidade. Cor da série: a do design system (`--serie`), mais marcador e rótulo diretos.
- **Estados:** carregando (esqueleto de altura fixa, 160 px a 1280, 200 px a 375); vazio total ("Ainda não há histórico suficiente: nenhum dos últimos 6 meses atinge 20 itens."); erro ("Não foi possível carregar a tendência. Tentar de novo", sem derrubar o bloco); fonte sem coleta (o bloco todo diz `SemDadosDaFonte`).

#### 5.9.4 Alertas ("Pede atenção"), separados por fonte
- Bloco Fluxo: título "Pede atenção · Fluxo de projeto (BusinessMap)" com os itens das regras atuais das visões Diária e Semanal (O2, Bloqueados, O1 e O3, O10, O12), sem duplicar e na ordem de gravidade já usada. Bloco Sustentação: "Pede atenção · Sustentação (Acelerato)", itens S2 e S1.
- Cada item mantém o texto atual e o link "Ver ..." que vai à visão dona do cartão, com hash (6.2). Nada novo é calculado.
- Vazio: "Nada pede atenção no fluxo de projeto agora." / "Nada pede atenção na Sustentação na semana." Carregando: altura reservada (fluxo 108 px; sustentação 88 px a 1280). Erro: por bloco, com "Tentar de novo".
- Os alertas vêm **antes** dos números em cada bloco (o que exige ação primeiro).

#### 5.9.5 Links para as outras visões
Rodapé de cada bloco, uma ação primária por bloco: fluxo, "Ver na Semanal" (primário) e "Ver na Diária" (secundário); sustentação, "Ver na Sustentação". Mais os links por número e por alerta. Na Visão geral, "Revisão da sustentação" (semanal) leva à visão Sustentação e as revisões de fluxo levam à Diária ou à Semanal (nunca ao Resumo, para não perder o destino de reunião).

#### 5.9.6 URL, compatibilidade, preferências, exportação
- **URL:** `cadencia=resumo` é o padrão e é **omitido** na URL canônica (`/operacional`). Se vier explícito, é aceito e a URL é normalizada com `replace` (sem entrada no histórico). Escolher Resumo a partir de outra visão remove `cadencia` (entrada de histórico). Valor desconhecido: Resumo, com o aviso 2.6 de valor inválido.
- **Compatibilidade:** links com `cadencia=diaria|semanal|sustentacao` e todos os hashes de cartão/seção continuam exatamente como antes (o hash decide a visão, 6.2). **Muda** só o link sem `cadencia` e sem hash: antes Diária, agora Resumo. Lista de revisão obrigatória para o front: itens da Visão geral ("Por reunião", "Pede atenção", cartões de nível), catálogo, redirecionadores, favoritos citados na Ajuda, testes E2E (`e2e/`) que abrem `/operacional` esperando a Diária. Parâmetros `sust_*` e os do fluxo no Resumo são **preservados na URL** (viram padrão ao trocar de visão), embora não se apliquem ao Resumo.
- **Filtros:** o Resumo não grava nem lê filtros; ao ir do Resumo para uma visão de detalhe, valem os guardados na URL ou os padrões daquela fonte. Aviso do Resumo: ver 5.9.1.
- **Preferências:** contrato do 007 intacto, **sem chave nova**: o Resumo não tem cartões ocultáveis próprios; respeita as ocultações dos cartões de origem (5.9.2). O popover "Métricas" não aparece no Resumo (nada a configurar nele); a página Preferências não muda. Não se grava a visão escolhida (a visão é por URL).
- **Exportação:** o Resumo **não ganha exportação própria nova** na v1 (Q6). O botão do Resumo é só "Exportar vários painéis", com "Operacional" e "Operacional · Sustentação" pré-selecionados e filtros padrão; as seções do arquivo seguem separadas por fonte. A tendência mensal não entra na exportação da v1 (as métricas continuam exportáveis pelos cartões de origem). Oculto fica fora, como no 007.
- **Título do documento:** "Operacional · Resumo · Métricas DSPD". Catálogo e Ajuda: "Resumo" não é métrica; ganha uma linha de texto na Ajuda explicando as duas fontes e a janela.

#### 5.9.7 Wireframes
```
1280
Operacional                                     Dados: BusinessMap até 09/10 · Acelerato até 09/10
Estamos bem?   Visão: ( [x Resumo] | Diária | Semanal | Sustentação )   Para coordenadores e líderes
[Exportar vários painéis]    Filtros guardados (fluxo: 2 · Sustentação: 1) não se aplicam ao Resumo.
+== FLUXO DE PROJETO · BUSINESSMAP =============================== Fonte: BusinessMap · 12 semanas =+
| Pede atenção: ! 3 itens acima do P95 (Ver O2)  ! 16 vencidos por causa interna (Ver O12)          |
| [P85 tempo de ciclo 14 d.u.] [Vazão 11/sem (8 a 15)] [Acima do P95: 3] [Vencidos internos: 16]    |
| Tendência (6 meses, janela de 12 semanas até o fim do mês)  [ Ver como tabela ]                   |
|   P85:  Abr o  Mai *  Jun *  Jul *  Ago *  Set *      Itens concluídos: barras Abr..Set          |
| Ver na Semanal (primário)   Ver na Diária                                                         |
+===================================================================================================+
+== SUSTENTAÇÃO · ACELERATO ====================================== Fonte: Acelerato · 12 semanas =+
| Pede atenção: ! SLA abaixo de 90% em 2 prioridades (Ver S2)  ! Mediana acima do alvo em 1 (S1)    |
| [SLA < 90%: 2 de 5 prioridades] [Mediana > alvo: 1 de 5] [Volume 214 · P1+P2 6%]                  |
| Tendência: aderência ao SLA ... | volume de chamados ...                                          |
| Ver na Sustentação                                                                                |
+===================================================================================================+
375: coluna única, mesma ordem; números em grade de 2 colunas; tendência em largura total
com tabela alternativa recolhida; seletor de visão em até 2 linhas; sem barra fixa de filtros
e sem índice (a página tem 2 blocos); botões de 44 px.
```

#### 5.9.8 Acessibilidade, estados e perguntas abertas
- **A11y:** `h1` Operacional; cada bloco é `section` com `h2` (nome e fonte); números em `h3`/lista descritiva (`dl`); fonte e situação (dentro/fora do alvo) em texto com ícone; gráfico com alternativa em tabela; marcador de mês sem dado diferenciado por forma e texto; alvos 44 px a 375, 24 px mínimo a 1280; foco visível; `prefers-reduced-motion` respeitado; contraste 4.5:1; ordem do foco = ordem visual (alertas, números, tendência, links).
- **Estados globais:** carregando (por bloco, independente); vazio (< 20 itens no número ou 6 meses sem dados); erro (por bloco e por série, com "Tentar de novo"); fonte sem coleta (só o bloco); sem permissão: não se aplica.
- **Perguntas para o usuário (regra de negócio; o briefing não responde, nada foi decidido por inferência):**
  - **Q1.** Cada ponto mensal de percentil/aderência pode ser "a janela móvel de 12 semanas terminando no fim do mês" (recomendado, respeita a regra)? Ou deseja o percentil só dos itens concluídos no mês-calendário (exigiria exceção formal à regra da janela de 12 semanas, e ainda a regra de n mínimo)?
  - **Q2.** A regra "abaixo de 20 itens não publica" vale também para a aderência ao SLA (proporção) e para contagens? Proposto: vale para percentis e proporções; contagens mostram o n.
  - **Q3.** S2 e S1 por prioridade: o Resumo conta "quantas das 5 prioridades estão fora do alvo" (proposto, sem agregar prioridades). A série mensal de aderência é de qual recorte (todas as prioridades juntas, só P1 e P2, ou a prioridade escolhida)? Agregar prioridades é um cálculo novo.
  - **Q4.** O mês em curso fica fora da tendência (proposto) ou entra marcado como "parcial"?
  - **Q5.** O Resumo ignora filtros e sempre mostra todas as equipes (proposto), ou deve respeitar a equipe do fluxo? E a janela de 12 semanas vale também para a Sustentação (decisão atual), apesar de o padrão do detalhe ser 6 meses?
  - **Q6.** Quais séries entram na tendência (propostas em H7) e o Resumo precisa ser exportável além do "vários painéis"?
  - **Q7.** O3 no Resumo: sem segmentar, ou por tipo predominante?

## 6. Rotas

### 6.1 `/sustentacao` antiga (redirecionador)
- Sai do menu (`rotas.ts`) e do roteador como página; a rota fica só como redirecionador, sem tela e sem chunk de página, por substituição (`replace`, Voltar não entra em laço). Mantido por tempo indeterminado.
- Destino: `/operacional?cadencia=sustentacao` + parâmetros convertidos + **hash intacto**.

| Parâmetro de entrada | Saída |
|---|---|
| `equipe`, `prioridade`, `periodo`, `de`, `ate` | `sust_equipe`, `sust_prioridade`, `sust_periodo`, `sust_de`, `sust_ate` |
| `s3`, `s4`, `s5`, `s6`, `ei_sust`, `mock` | intactos |
| qualquer outro (ex.: `tipo`, `sistema`) | descartado (nunca valeu na Sustentação) |
| hash `#s2`, `#prazos`, `#ei-sust`, `#s9`, `#pv1`, `#mais-metricas`... | intacto (ids não mudam) |
| hash de seção complementar antiga `#compl-por-que-demora`, `#compl-o-que-entra`, `#compl-qualidade` | `#compl-sust-por-que-demora`, `#compl-sust-o-que-entra`, `#compl-sust-qualidade` |

- Os filtros do fluxo da memória da sessão não entram pelo redirecionador (a URL de destino só tem os da sustentação; ao trocar para Diária/Semanal, valem as regras atuais).
- `/espera-invisivel#ei-sust` passa a ir **direto** para `/operacional?cadencia=sustentacao#ei-sust`, com `sust_*` intactos e os do fluxo descartados (sem dois saltos).

### 6.2 Hash decide a visão
Em `/operacional`, o hash vence o `cadencia` (a URL é corrigida com `replace`), como já ocorre com `#ei-fl1` e a Diária.

| Hash | Visão |
|---|---|
| `#o2`, `#bloqueados`, `#o1` | Diária |
| `#o3`, `#o9`, `#o4`, `#o12`, `#o10`, `#o7`, `#o15`, `#o18`, `#ei-fl1`, complementares do fluxo, `#tempo`, `#fluxo`, `#compromissos`, `#backlog`, `#qualidade`, `#espera-invisivel`, `#compl-*` do fluxo | Semanal |
| `#s1` a `#s12`, `#o17`, `#ei-sust`, `#pv1`, `#prazos`, `#volume`, `#causas`, `#espera`, `#percepcao`, `#compl-sust-*` | Sustentação |
| `#resumo-fluxo`, `#resumo-sustentacao`, `#tendencia-fluxo`, `#tendencia-sustentacao` | Resumo |
| `#mais-metricas` ou desconhecido | a do `cadencia` (ou Resumo, se ausente) |

Hash de complementar abre "Mais métricas" e foca o cartão (comportamento atual de `alvoComplementar`).

## 7. Desempenho, acessibilidade e layout

### 7.1 Desempenho (ADR 0003)
- Só a visão ativa é montada e consulta dados: a página não fica mais pesada que o Operacional semanal atual. O código da visão Sustentação vira um chunk carregado sob demanda (ao escolher a visão ou chegar por link), com pré-carga ao passar o ponteiro ou focar o rádio "Sustentação".
- "Mais métricas" segue sob demanda (só monta ao abrir).
- O Resumo (padrão, logo a primeira tela) consulta as duas fontes: cada bloco carrega de forma independente (esqueleto com altura reservada, sem CLS), o bloco da Sustentação vem sob demanda do mesmo chunk da visão Sustentação ou de um chunk próprio do Resumo, e a tendência mensal carrega **depois** dos números-chave e do "Pede atenção" do bloco. Orçamento medido em `/operacional` (agora o Resumo), que é a página mais visitada. O cache das consultas torna imediata a ida às visões de detalhe.
- Carga por seção sob IntersectionObserver: **não é necessária** com a alternativa D. Só seria com a C.
- Lighthouse e orçamento medidos nas três URLs: `/operacional`, `?cadencia=semanal`, `?cadencia=sustentacao`.

### 7.2 Acessibilidade (WCAG 2.2 AA)
- Seletor "Visão": `radiogroup` com rótulo visível "Visão"; setas trocam a opção; o foco fica no rádio; `aria-live="polite"` anuncia "Visão Sustentação. Fonte: Acelerato." ao trocar. `document.title`: "Operacional · Sustentação · Métricas DSPD" (e "Operacional · Semanal", "Operacional · Diária").
- `h1` "Operacional"; seções `h2`; cartões `h3` (como hoje). A legenda da barra de filtros é um `fieldset`/`legend` (ou `role="group"` com `aria-labelledby`) com o nome da fonte.
- A fonte nunca é só cor: texto no selo, na barra, no cabeçalho e no título do "Pede atenção".
- Alvos: 44 px a 375 (rádios, "Filtros", seletor "Seção", link da linha cruzada); 24 px mínimo a 1280 (o padrão `alvo` já garante 32 px).
- Chegada por hash: foco no título do cartão (ou no "Mostrar" do marcador, se oculto) com foco visível; `scroll-padding-top` igual à altura da barra fixa (2.4.11, foco não encoberto).
- `prefers-reduced-motion`: sem rolagem suave nem destaque animado.

### 7.3 Layout
- **1280:** igual ao atual; pares compactos lado a lado só onde a P3 já prevê (O10/O7, O15/O18; na Sustentação, S3/S4 e S5/S6; S7 sozinho). Seletor de três opções numa linha com a frase de público.
- **375:** seletor "Diária · Semanal · Sustentação" numa linha (cabe em 343 px com 44 px de altura; se não couber num aparelho com fonte ampliada, quebra para duas linhas, nunca rolagem horizontal). Filtros num botão "Filtros da Sustentação (n)" que abre a folha atual com a legenda da fonte. Cartões em coluna única. Sem rolagem horizontal da página.

### 7.4 Nota para o arquiteto e o tech lead (não é decisão de produto)
- A demanda `espera-invisivel-nos-paineis` previa remover o prefixo `sust_` "porque só existia para a página de espera". **Ele volta a ser necessário aqui.** Recomendo manter o mecanismo de prefixo em `useFiltros`/`codec` e, no redirecionador de `/espera-invisivel`, passar `sust_*` intactos para o novo destino.
- `PAINEIS` (filtros) ganha uma configuração para a visão Sustentação dentro de `/operacional` (domínio `sustentacao`, prefixo `sust_`) e a normalização de "parâmetros conhecidos não aplicáveis" (2.6.1) **não pode apagar** os `sust_*` em `/operacional`, nem os do fluxo quando a visão é Sustentação.
- `coleta/fontes.ts`: em `/operacional` a fonte vem da visão (`cadencia=sustentacao` → `acelerato`).

## 8. Estados
| Estado | Comportamento |
|---|---|
| Carregando | Esqueletos dos cartões da visão; faixa "Pede atenção" com altura reservada (Sustentação: 108 px a 375, 88 px a 1280, como hoje). Chunk da visão Sustentação carregando: o mesmo esqueleto, sem tela em branco. |
| Vazio / amostra < 20 | Texto neutro atual por cartão; nenhuma estatística publicada. |
| Erro de cartão | Erro no cartão com "Tentar de novo". |
| Fonte sem coleta ok | `SemDadosDaFonte` só na visão daquela fonte; no Resumo, só no bloco daquela fonte (o outro bloco funciona). |
| Calibração | A faixa de calibração é a da fonte da visão. |
| Oculto | Marcador da P1 no lugar; seção some do índice se toda oculta. |
| Sem permissão | Não se aplica (painéis abertos). |

## 9. Necessidades de dados
Nenhuma nova. Mesmos DTOs (O*, S*, EI_FL1, EI_SUST, PV1, VISAO_GERAL). Nenhum cálculo novo, nenhuma agregação entre fontes. A linha "Também nesta aba" reaproveita as consultas que o "Pede atenção" de cada fonte já faz.

## 10. Microcopy
| Onde | Texto |
|---|---|
| Rótulo do seletor | Visão |
| Opções | Resumo · Diária · Semanal · Sustentação |
| Pergunta por visão | Diária: Pergunta da daily: "Qual item mais velho não andou desde ontem?" · Semanal: Pergunta: "O que mudou na nossa distribuição de tempo?" · Sustentação: Pergunta: "Estamos atendendo e restaurando dentro do combinado?" |
| Público por visão | Diária/Semanal: "Para times · diária e semanal." · Sustentação: "Para o líder da sustentação · semanal e mensal." |
| Legenda dos filtros | Filtros do fluxo de projeto · BusinessMap / Filtros da Sustentação · Acelerato |
| Filtro | Equipe de sustentação |
| Faixa | Pede atenção hoje · Fluxo de projeto (BusinessMap) / Pede atenção na semana · Sustentação (Acelerato) |
| Filtros guardados | Os filtros do fluxo de projeto (2 ativos) continuam guardados para as visões Diária e Semanal. |
| Anúncio | Visão Sustentação. Fonte: Acelerato. |
| Visão geral | Abrir Operacional · Sustentação |
| Exportação | Exportar · Operacional · Sustentação |
| Leia junto cruzado | Leia junto: Defeitos por causa raiz e sistema (O17) · visão Sustentação, fonte Acelerato |

## 11. Critérios de aceite (verificáveis por E2E)
1. **Menu:** não existe o item "Sustentação" na navegação global em 375 e 1280; "Operacional" existe.
2. **Seletor:** em `/operacional` há um `radiogroup` "Visão" com "Resumo", "Diária", "Semanal", "Sustentação"; sem parâmetro, "Resumo" está marcada. Escolher "Sustentação" grava `cadencia=sustentacao` na URL (com entrada no histórico) e mostra `recorte-sustentacao` e as seções `#prazos`, `#volume`, `#causas`, `#espera`, `#percepcao`.
3. **Uma fonte por visão:** na visão Sustentação não existe nenhum cartão `metrica-O*` do BusinessMap (O17 é a exceção esperada, fonte Acelerato), e nas visões Diária e Semanal não existe nenhum `metrica-S*`, `metrica-EI-SUST` nem `metrica-PV1`.
4. **Selo de fonte:** todo cartão visível em cada visão (núcleo, complementar aberto, EI, PV1) contém o texto "Fonte: BusinessMap", "Fonte: Acelerato" ou "Fonte: Pesquisa de percepção", coerente com a visão (PV1 é a única "Pesquisa de percepção").
5. **Filtros:** na visão Sustentação, a barra tem a legenda "Filtros da Sustentação · Acelerato" e só os controles Equipe de sustentação, Prioridade e Período (padrão 6 meses); não há Tipo nem Sistema. Nas visões do fluxo, a legenda "Filtros do fluxo de projeto · BusinessMap" e Equipe, Tipo de demanda, Sistema, Período (padrão 12 semanas); não há Prioridade.
6. **Filtros guardados ao trocar:** dado `/operacional?cadencia=semanal&equipe=X&periodo=4s`, escolher Prioridade P1 na Sustentação gera `sust_prioridade=P1` e mantém `equipe=X&periodo=4s`; voltar à Semanal mostra os chips Equipe X e 4 semanas, e a Sustentação continua com P1. "Limpar filtros" numa visão não altera a outra.
7. **Rodapé do cartão:** nenhum cartão S cita "Tipo" ou "Sistema" em "Filtros aplicados"/"Não afetado por"; nenhum cartão O cita "Prioridade".
8. **Pede atenção separado:** na Sustentação, a faixa tem o título com "Sustentação (Acelerato)" e só itens S2/S1; na Semanal, só O3/O10/O12; nenhuma faixa mistura códigos das duas fontes.
9. **Sem linha cruzada:** em nenhuma visão existe o texto "Também nesta aba".
10. **Índice P3:** na Sustentação, o índice lista Prazos, Volume e resolução, Escalação..., Espera invisível, Mais métricas, Percepção de valor; ocultar S3 e S4 retira "Volume e resolução" do índice. A 375 é um seletor "Seção".
11. **Redirecionamento:** `/sustentacao?prioridade=P1&periodo=12m&equipe=Y&tipo=Bug#s2` termina em `/operacional` com `cadencia=sustentacao`, `sust_prioridade=P1`, `sust_periodo=12m`, `sust_equipe=Y`, sem `tipo`, hash `#s2`, cartão `metrica-S2` visível e focado; Voltar não retorna a `/sustentacao`. `/sustentacao` sem nada termina em `/operacional?cadencia=sustentacao`. `#compl-qualidade` vira `#compl-sust-qualidade` com "Mais métricas" aberto.
12. **Hash decide a visão:** `/operacional?cadencia=diaria#s1` termina com `cadencia=sustentacao` e `metrica-S1` focado; `/operacional?cadencia=sustentacao#o3` termina na Semanal com `metrica-O3` focado.
13. **Espera invisível:** `/espera-invisivel?sust_prioridade=P2&equipe=X#ei-sust` termina em `/operacional?cadencia=sustentacao&sust_prioridade=P2#ei-sust` (sem `equipe`).
14. **Preferências sem perda:** com `localStorage` pré-carregado `{versao:1,paineis:{sustentacao:{ocultar:['s3','pv1']}}}`, a visão Sustentação mostra os marcadores de S3 e PV1 no lugar; ocultar S5 grava `paineis.sustentacao.ocultar` contendo `s5` (mesma chave e formato do 007); a página Preferências mostra o grupo "Operacional · Sustentação" logo depois de "Operacional".
15. **Exportação:** na visão Sustentação, "Exportar" lista só métricas do Acelerato visíveis (sem ocultas) e gera arquivo com escopo `sustentacao` e os filtros `sust_*` da URL; na Semanal, só BusinessMap. "Vários painéis" mostra "Operacional · Sustentação"; o arquivo com os dois níveis tem seções separadas por fonte.
16. **Visão geral:** o link do nível Sustentação, o item de Sustentação do "Pede atenção", o da espera invisível (`#ei-sust`) e (se D3 = a) "Revisão da sustentação" em "Por reunião" levam à visão Sustentação, sem nenhum parâmetro do fluxo.
17. **Catálogo:** S1 a S12, O17, EI-SUST e PV1 com painel "Operacional · Sustentação" e destino `/operacional?cadencia=sustentacao#<id>`; o filtro "Painel" tem essa opção e não tem "Sustentação" sozinha.
18. **Leia junto cruzado:** no O15, o link para O17 diz "visão Sustentação, fonte Acelerato", troca a visão, abre "Mais métricas" e foca `metrica-O17`.
19. **Acessibilidade:** axe sem violações sérias nas três visões em 375 e 1280; trocar a visão anuncia "Visão Sustentação. Fonte: Acelerato." numa região `aria-live`; `document.title` muda por visão; o foco permanece no rádio.
20. **Layout:** sem rolagem horizontal da página em 375 e 1280 nas três visões; o seletor tem alvos de 44 px a 375.
21. **Desempenho:** abrir `/operacional?cadencia=diaria` ou `semanal` não baixa o chunk da visão Sustentação; o Lighthouse de `/operacional` (Resumo), `?cadencia=semanal` e `?cadencia=sustentacao` fica dentro do orçamento da ADR 0003.
22. **Fonte sem coleta:** com o Acelerato sem coleta ok, a visão Sustentação mostra `SemDadosDaFonte` e as visões do fluxo funcionam normalmente.

### Critérios novos da visão Resumo (E2E)
23. **Padrão:** `/operacional` sem parâmetro marca "Resumo", mostra dois blocos (`resumo-fluxo`, `resumo-sustentacao`) nessa ordem e a URL não contém `cadencia`; `?cadencia=resumo` é aceito e normalizado (sem `cadencia`).
24. **Compatibilidade:** `?cadencia=diaria`, `?cadencia=semanal`, `?cadencia=sustentacao` e `#o3`, `#s2` etc. continuam abrindo a visão e o cartão como antes; nenhum link interno (Visão geral, catálogo, redirecionadores) que esperava a Diária cai no Resumo.
25. **Fontes separadas:** cada bloco mostra o selo "Fonte: BusinessMap" ou "Fonte: Acelerato" e o frescor próprio; nenhum elemento do bloco Fluxo contém código S*, EI-SUST ou PV1, e nenhum do bloco Sustentação contém O* (O17 não aparece no Resumo); não existe nenhum total ou valor que combine as fontes; os blocos não ficam lado a lado a 1280.
26. **Números-chave:** o bloco Fluxo tem exatamente os números de O3, O4, O2 e O12; o bloco Sustentação, os de S2, S1 e S3 (5.9.2); cada um com base ("n itens"), unidade (dias úteis ou horas úteis) e link "Ver ..." para a visão dona. Com n < 20 mostra "Poucos itens (n=...)" e nenhum valor.
27. **Tendência:** cada série tem 6 meses fechados (mês em curso fora, salvo Q4); um mês com < 20 itens aparece sem valor, com marcador vazado e rótulo "poucos itens (n=...)", sem linha ligando os vizinhos; "Ver como tabela" lista mês, valor, n e "não publicado"; o título declara "janela de 12 semanas até o fim do mês" para percentil e aderência.
28. **Alertas:** títulos "Pede atenção · Fluxo de projeto (BusinessMap)" e "Pede atenção · Sustentação (Acelerato)"; itens conforme 5.9.4; cada link leva à visão dona com o cartão focado.
29. **Filtros e preferências:** o Resumo não exibe barra de filtros; com filtros guardados, mostra a linha que diz que não se aplicam; com `localStorage` `{versao:1,paineis:{operacional:{ocultar:['o3']}}}`, o número do O3 vira marcador "oculta" e a série P85 some; nenhuma chave nova é gravada.
30. **Exportação:** no Resumo só existe "Exportar vários painéis" com os dois níveis pré-selecionados; arquivo com seções separadas por fonte.
31. **Estados e a11y:** carregamento independente por bloco, erro de um bloco não afeta o outro, `SemDadosDaFonte` só no bloco da fonte sem coleta; axe sem violações sérias em 375 e 1280; sem rolagem horizontal; anúncio "Visão Resumo. ..." ao trocar; `document.title` "Operacional · Resumo".

## 12. Decisões que só o usuário toma (RESOLVIDAS em 2026-10-13: ver seção 13; texto original mantido como histórico)
**D1. Como a Sustentação entra no Operacional?**
- (a) **Visões por reunião**: "Visão: Diária · Semanal · Sustentação", uma fonte por tela. 
- (b) Semanal com dois blocos empilhados (fluxo, depois sustentação), cada um com seus filtros e seu "Pede atenção".
- (c) Seções por pergunta, com cartões das duas fontes intercalados.

**Recomendação: (a).** Entrega tudo no Operacional sem duas barras de filtros na mesma tela e sem cartões de fontes diferentes lado a lado. (c) não é recomendável: aproxima demais o que a regra manda manter separado.

**D2. Avisar na visão do fluxo quando a Sustentação pede atenção (e vice-versa)?**
- (a) Sim, uma linha "Também nesta aba" nas três visões, só com a contagem de itens e o link.
- (b) Só na visão Semanal.
- (c) Não; cada visão fala só da sua fonte.

**Recomendação: (a).** É o que evita a sustentação "sumir atrás de um clique" para o coordenador, sem misturar números.

**D3. "Revisão da sustentação" entra no "Por reunião" da Visão geral?**
- (a) Sim, como reunião semanal ("Estamos atendendo e restaurando dentro do combinado?").
- (b) Sim, como mensal.
- (c) Não, até a governança (WS6) definir o ritual da sustentação (o briefing não define).

**Recomendação: (a).** O painel já se apresenta como "semanal e mensal" e o "Pede atenção" dele é da semana. Mas o ritual é governança, por isso a decisão é sua.

## 13. Decisões do usuário (2026-10-13)
- **D1:** seletor do Operacional = **Visão: Resumo (padrão) · Diária · Semanal · Sustentação**. O **Resumo** mostra, por fonte e sem misturar, os números-chave da janela de 12 semanas, a **tendência mês a mês** dos últimos 6 meses (marcando meses com poucos itens) e os alertas ("Pede atenção") das duas fontes, com links para as outras visões. A "Semana completa com dois blocos" não entra.
- **D2:** sem a linha "Também nesta aba" (o Resumo reúne os alertas das duas fontes).
- **D3:** "Revisão da sustentação" **semanal** na seção "Por reunião" da Visão geral.

### Respostas do time às perguntas 5.9.8 (2026-10-13; reversíveis; Q1 vai ao usuário)
- **Q2:** o mínimo de 20 itens vale para percentis e proporções (taxas, %); contagens simples são publicadas sempre, com o "n".
- **Q3:** sem cálculo agregado novo: a aderência aparece como "k de 5 prioridades fora do alvo" (S2 por prioridade, como no detalhe).
- **Q4:** o mês em curso fica fora da tendência.
- **Q5:** o Resumo não tem filtros; cada fonte usa a janela do seu detalhe (fluxo: 12 semanas; sustentação: a janela atual do painel de sustentação).
- **Q6:** séries da tendência: O3 (P85) e O4 no fluxo; S2 (k de 5 fora do alvo) e S3 na sustentação. O Resumo não exporta nesta entrega.
- **Q7:** O3 na granularidade story, sem segmentar por tipo (nunca mistura story, frente e projeto).
- **Q1 (usuário, 2026-10-13):** cada ponto mensal = janela móvel de 12 semanas terminando no último dia do mês (regra do briefing; mínimo de 20 itens).
