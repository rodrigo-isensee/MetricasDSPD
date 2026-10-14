# Métricas "Também disponíveis" (pedido 011) · 04 Decisões

Duas partes: **(A) decisões do usuário** (produto e regra de negócio), a levar **uma por vez**, na ordem abaixo (da que mais trava para a que menos trava); **(B) decisões de UX**, tomadas aqui e registradas para a validação.

Nenhuma regra de negócio foi inferida: onde a proposta ou o briefing não definem, a métrica fica com `[D-n]` em `02-especificacao.md` e o mock usa a recomendação marcada como provisória.

## A. Decisões do usuário

### D-1 · Custo por sistema: como expressar sem virar "horas apontadas como esforço"
A proposta pede "custo por demanda e por sistema" com origem "extração + custo de capacidade". A forma comum (horas apontadas × custo-hora) é **métrica proibida** (briefing 7.1).
- **A. Só participação na capacidade (%), sem R$.** Percentual das entregas por sistema e natureza. Prós: nenhum risco de 7.1, nenhum dado financeiro novo. Contras: a diretoria não vê valor em dinheiro.
- **B. Participação × custo total do DSPD (rateio em R$).** Um único valor de custo para a área inteira (orçamento), informado como configuração, rateado pela participação. Prós: dá ordem de grandeza em R$. Contras: o número parece preciso sem ser (é rateio); custo por equipe pequena permitiria inferir salário, por isso só o total da área.
- **C. Horas apontadas × custo-hora.** Proibida (7.1). Listada só para registro: recusada.
- **D. Não publicar E7.** O T3 e o S12 já dão parte da resposta.
- **Recomendação: A agora**, B só se a área fornecer o custo total do DSPD e aceitar o chip "Rateio do custo total do DSPD, não esforço medido". Nunca custo por equipe nem por pessoa.

### D-2 · Peso da participação por sistema (E7)
Itens têm tamanhos diferentes (cuidado do T3 na proposta).
- **A. Contagem de entregas** (demanda, sem subtarefa). Simples e coerente com T3.
- **B. Dias úteis em execução.** Reflete tamanho, mas é tempo decorrido, fácil de ler como esforço.
- **C. Faixa de tamanho declarado (P/M/G) como peso.** Depende de `tamanho_declarado` preenchido (O8).
- **Recomendação: A**, com a tabela mostrando também a contagem por tipo. Reavaliar C quando `tamanho_declarado` tiver cobertura.

### D-3 · Concentração de conhecimento: definição e janela (E8)
- **A. Pessoas distintas responsáveis pelas entregas do sistema em 12 meses.** "Depende de uma pessoa" = 1 pessoa distinta.
- **B. Mesma regra em 6 meses.** Mais sensível a mudanças recentes, mais ruidosa.
- **C. Pessoas que tocaram qualquer card do sistema (não só entregas) em 12 meses.** Mais ampla; exige histórico de responsável por card, mais dado de pessoa na coleta.
- **Recomendação: A.** Janela mínima de 12 meses; o coletor grava só o número de pessoas por sistema.

### D-4 · Concentração de conhecimento: mostrar quais sistemas estão em "1 pessoa"?
Em times pequenos, dizer o sistema pode apontar quem é a pessoa.
- **A. Só as contagens** (4 sistemas em 1 pessoa, 6 em 2...). Máxima proteção; pouco acionável.
- **B. Contagens + lista dos sistemas em "1 pessoa"**, sem nenhuma pessoa, com o selo "Mede risco de continuidade do parque". Acionável (plano de repasse por sistema); risco de reidentificação indireta.
- **C. Lista só no export para a gerência.** Cria visão diferente por perfil, o que o sistema hoje não tem.
- **Recomendação: B**, porque a ação é por sistema (repassar conhecimento) e não por pessoa; com o recorte mínimo de 5 sistemas (CA-10) e a regra de que o cartão nunca é usado em avaliação, comunicada no T6.3.

### D-5 · Passagens de mão: o que conta como passagem (O26)
- **A. Toda troca de responsável no card** (entrada ou saída de alguém do conjunto de responsáveis).
- **B. Só quando o card muda de equipe ou de quadro.** Não exige histórico de responsável (sem dado de pessoa), mas perde as trocas dentro do time.
- **C. A + B, mostrados separados.**
- **Recomendação: A**, contada na fronteira do coletor (só o inteiro sobe). Se a coleta do histórico de responsável não for viável na API do BusinessMap (o arquiteto confirma), cair para B.

### D-6 · Ordem de chegada: dentro de que grupo se compara (O24)
- **A. Mesma equipe, mesmo tipo e mesma classe de serviço; classe "Urgente" fora** (passar na frente é a regra dela).
- **B. Mesma equipe e mesmo tipo, todas as classes.** Mostra também o custo das urgências.
- **C. Mesma equipe, qualquer tipo.** Compara itens de natureza diferente.
- **Recomendação: A.** A ordem de chegada só é expectativa dentro da mesma classe.

### D-7 · Datas do portfólio: qual data vale (E6)
- **A. A primeira data acordada após a aprovação.** Mede a promessa original; replanejamentos aparecem como contagem.
- **B. A última data vigente antes da entrega.** Mede a promessa final; esconde os replanejamentos no número principal.
- **C. As duas, lado a lado.**
- **Recomendação: A**, com o número de replanejamentos visível em cada ponto. Tolerância: zero dia útil (entregue até a data = no prazo).

### D-8 · Qualidade da entrada: o que é "ida e volta" (T12)
- **A. Bloqueio com motivo "Falta de informação no chamado" antes do início, ou retorno do card da coluna de compromisso para o backlog.**
- **B. Só o bloqueio "Falta de informação no chamado".** Depende de o time marcar o bloqueio.
- **C. Qualquer retorno antes do início, por qualquer motivo.** Mais amplo, pode contar repriorização como falha da área.
- **Recomendação: A.**

### D-9 · Primeiro toque: o que conta como reação (O22)
- **A. O primeiro destes eventos depois da criação: mudança de coluna, comentário ou atribuição de responsável.**
- **B. Só mudança de coluna.** Já existe no modelo; ignora a resposta por comentário.
- **C. Só comentário.**
- **Recomendação: A**, guardando só o instante (sem autor e sem texto do comentário). Eventos automáticos (regras do BusinessMap) não contam.

### D-10 · Prazo contratado por fornecedor (T10)
- **A. Sem prazo contratado por enquanto:** o cartão mostra só o tempo praticado (P50/P85).
- **B. Cadastro do prazo contratado por fornecedor** como configuração versionada (T2.6), mantido pela coordenação.
- **Recomendação: A agora, B quando os contratos forem informados.** O cartão já prevê a linha "Prazo contratado não informado".

### D-11 · Sazonalidade também na Sustentação?
A proposta põe a sazonalidade no Tático (BusinessMap). A chegada de chamados (folha, fechamento) costuma ter padrão próprio.
- **A. Só no Tático (BusinessMap)**, como na proposta.
- **B. Também um cartão gêmeo na Sustentação (Acelerato)**, mesmo componente, nunca somado ao do BusinessMap. Aumenta o escopo do pedido em um cartão.
- **Recomendação: B**, em outra entrega, depois das 16.

### D-12 · Ordem de implementação das 16
O briefing diz que o catálogo complementar é "sob demanda".
- **A. Primeiro as que usam só dado já no modelo** (O19, O20, O21, O23, O24, O25, T11, T12, E9; mais T10 e E7 na versão sem configuração), depois as de extração nova (O22, O26, T13, E6, E8).
- **B. Por painel** (Operacional, Tático, Estratégico).
- **C. Pela ordem da proposta.**
- **Recomendação: A**: entrega valor sem esperar coleta nova e não bloqueia nas decisões D-3 a D-9.

### D-13 · Descarte: que tempo é "o tempo já consumido" (O25)
O briefing 4.2 diz "entra na taxa de descarte com o tempo já consumido", sem dizer de qual marco.
- **A. Do início (primeira entrada em execução) até o descarte;** descartado antes de iniciar conta zero e aparece à parte.
- **B. Da entrada (criação) até o descarte.** Inclui o tempo de fila, que não é esforço.
- **Recomendação: A.**

### D-14 · Dependências: que vínculo conta (T13)
- **A. Vínculo explícito entre cards (predecessor/dependência) com card de quadro de outra equipe.**
- **B. Bloqueio com motivo "Dependência de outra demanda".** Já existe; não diz de quem.
- **C. A ou B.**
- **Recomendação: C**, mostrando a parte de B (dias bloqueados) separada no cartão, como na spec.

### Abertas da T14 (2026-10-14, K-078): uma por vez, ainda não levadas ao usuário
- **D-15 · Que item e que escopo a T14 conta.** A. Demandas (story) não descartadas, em qualquer estado, de projetos em andamento (recomendação: é a unidade de B:110 e responde "quanto do projeto"). B. Só demandas entregues no período. C. Frentes (o time responsável da frente é do coordenador, não do time; não recomendada).
- **D-16 · O que é "meu time" quando o filtro de Equipe está vazio ("Todas") ou tem várias.** A. O cartão pede uma equipe e não calcula (recomendação: evita inventar um "time" e não vira comparação). B. Soma das equipes selecionadas como "meu time". C. Usar a equipe do usuário no perfil (não existe hoje; criaria dado de pessoa).
- **D-17 · Demanda sem time responsável.** A. Fica à parte em "Sem time informado", fora do denominador, com contagem visível (recomendação). B. Conta como "outros times" (infla "não é do meu time"). C. Conta pelo quadro em que está.
- Ao arquiteto: confirmar o campo exato de time responsável na API do BusinessMap, se está preenchido nas stories e se a ligação story > frente > projeto é obtida pela hierarquia já coletada.

## B. Decisões de UX (tomadas e registradas)
| # | Decisão | Por quê |
|---|---|---|
| U-1 | Retrabalho e reincidência sai do escopo e vira nota no catálogo com links para O13, T5, O21, S8 e S12. | A pergunta já é respondida; cartão novo duplicaria número e convidaria a somar fontes. |
| U-2 | Estoque parado dentro do WIP vira bloco do O2 (O23), não cartão. | O O2 já calcula "sem mover há" e já é o cartão diário; um cartão a mais repetiria a lista. |
| U-3 | Os 16 entram como complementares, na seção recolhida "Mais métricas deste painel", sem alerta. | Segue D-1 e D-3 das complementares (decisões de 11/10). |
| U-4 | Cinco seções novas por pergunta (tabela 4 da spec). | Mantém o padrão "seção = pergunta do painel". |
| U-5 | "Previsibilidade do portfólio" renomeada para "Datas do portfólio" (E6). | Evita confusão com O6 "Previsibilidade" (P85 ÷ P50). |
| U-6 | "Envelhecimento de iniciativas paradas" renomeado para "Projetos aguardando início" (E9). | O vocabulário do painel é "projeto"; "parada" sugeria projeto em execução sem movimento. |
| U-7 | "SLA real de terceiros" renomeado para "Tempo de terceiros" (T10). | "SLA" é vocabulário da sustentação (Acelerato); no BusinessMap o termo é prazo. |
| U-8 | Listas por área, fornecedor e sistema sem "pior/melhor", ordenadas por volume ou nome. | Evita leitura de ranking; áreas e fornecedores não são times, mas a leitura punitiva prejudica o uso. |
| U-9 | O26 e E8 com selo permanente de "não identifica pessoa"; E8 sem filtro de Sistema e com recorte mínimo de 5 sistemas. | Reduz a reidentificação indireta. |
| U-10 | O22 em dias úteis com uma casa decimal, faixas estreitas no histograma. | Unidade única do sistema; 7.3 (faixas largas escondem a distribuição de classes rápidas). |
| U-11 | "Uma semana" do O23 = 5 dias úteis. | Conversão direta pela regra de dias úteis; confirmar na validação (pergunta 6 do roteiro abaixo). |
| U-12 | T11 com janela fixa de 24 meses e chip "Não afetado por: Período". | Sazonalidade exige comparar o mesmo mês entre anos; o filtro de período (até 12 meses) não serve. |
| U-14 | T14 em "De quem depende o prazo?", com "meu time" × "outros times (somados)", ordenada por volume do projeto. | Mesma pergunta do T13; nunca nomear nem ordenar outros times (comparação entre times proibida, B:406). |
| U-13 | E6 e E9 usam a variante `lenta` da AmostraInsuficiente. | Poucos projetos é esperado; mostrar os pontos com "k de n" (padrão de E1). |

## Roteiro de validação no protótipo (5 a 10 min, 1280 e 375)
1. Na nota de catálogo, Retrabalho e reincidência está bem resolvida pelas métricas apontadas, ou falta algo?
2. Abra O19 e diga qual motivo custou mais dias. A ordem por dias somados ajuda?
3. Em O21, ache a volta mais comum e a diferença de prazo entre quem volta e quem não volta.
4. Em E8, a contagem sem nomes responde "quantos sistemas dependem de uma pessoa"? A lista de sistemas (D-4) é necessária?
5. Em E7, a participação percentual basta para a diretoria (D-1)?
6. No bloco do O2, "mais de 5 dias úteis" corresponde à "uma semana" que você tinha em mente?
7. Algum cartão parece meta, ranking ou avaliação de pessoa?

Registro do retorno: (vazio) Decisão: aprovado | ajustar (voltar à etapa X) | descartar.

## Respostas do usuário
- **D-1 (2026-10-14): A**, só participação em %, sem R$.
- **D-2 (2026-10-14): A**, contagem de entregas (com contagem por tipo na tabela).
- **D-3 (2026-10-14): A**, pessoas distintas responsáveis pelas entregas em 12 meses; o coletor grava só o número.
- **D-4 (2026-10-14): B**, contagens + lista dos sistemas em "1 pessoa", sem pessoa, recorte mínimo de 5 sistemas, selo de risco de continuidade.

## C. Conciliação com os documentos (2026-10-14)
Regra pedida pelo usuário: o que o briefing ou a proposta definem vale e prevalece, inclusive sobre decisão já tomada por ele. O briefing vence a proposta; a seção 7.1 do briefing vence qualquer trecho da proposta (horas apontadas nunca entram). Só volta ao usuário o que nenhum documento resolve. Abreviações: **B** = `docs/briefing-execucao-metricas.md`, **P** = `docs/proposta-metricas-ageis.md`, **H** = `docs/referencia/proposta-metricas-ageis-unificada.html`, **HB** = `docs/referencia/briefing-execucao-metricas.html`. Os HTML foram conferidos para os termos em questão; o texto convertido não perdeu nada que mude as conclusões abaixo.

| # | Classificação | Decisão do usuário |
|---|---|---|
| D-1 | Decidida pelo usuário em 2026-10-14: A | Rateio do custo total do DSPD pela participação por sistema; "por demanda" = custo ÷ entregas; sem horas apontadas |
| D-2 | Resolvida | Confirmada |
| D-3 | Parcialmente resolvida | Confirmada (a parte não definida segue a escolha dele) |
| D-4 | Não resolvida pelos documentos | Mantida (já decidida) |
| D-5 | Decidida pelo usuário em 2026-10-14: B | Troca = alguém sai e outro entra, ou o conjunto é substituído; incluir co-responsável sem saída não conta |
| D-6 | Decidida pelo usuário em 2026-10-14: A | Grupo = classe Padrão + mesmo tipo, por equipe (quadro) |
| D-7 | Resolvida | — |
| D-8 | Decidida pelo usuário em 2026-10-14: A | Bloqueio "Falta de informação no chamado" antes do início ou retorno da coluna de compromisso ao backlog |
| D-9 | Parcialmente resolvida | — |
| D-10 | Parcialmente resolvida | — |
| D-11 | Resolvida | — (recomendação de UX revertida) |
| D-12 | Resolvida | — |
| D-13 | Resolvida | — |
| D-14 | Parcialmente resolvida | — (recomendação de UX revertida) |

### D-1 · Custo por sistema — parcialmente resolvida; decisão do usuário revertida em parte pelo documento
- **O que o documento fixa:**
  - A métrica é de **custo** em dinheiro: "Custo por demanda e por sistema | Quanto custa manter cada sistema do parque | Extração + custo de capacidade" (P:402; H:1617).
  - O "custo de capacidade" é dado **externo**, que não está no Kanban e se obtém por "acordo com outras áreas, não tecnologia" (P:561; H:2209).
  - O campo que habilita a métrica é `sistema_afetado` ("Custo por sistema, concentração", B:124).
  - Horas apontadas nunca entram: "Horas apontadas como proxy de esforço entregue" é métrica proibida (B:409, P:664). A opção C continua recusada.
- **O que vale:** a resposta A do usuário ("só %, sem R$") **deixa de ser a forma final do E7**. Passa a ser o estado provisório enquanto o custo de capacidade não for informado; o CA-13 já cobre esse estado. Quando o custo for informado, o E7 mostra R$ (rateio do custo de capacidade pela participação de D-2), porque é isso que a proposta pede.
- **O que sobra para o usuário (D-1'):** os documentos não dizem de que é o "custo de capacidade" nem como se mostra o "por demanda".
  - **A.** Custo total do DSPD no período, rateado pela participação por sistema. O "por demanda" é esse custo ÷ entregas do sistema.
  - **B.** Custo por equipe, rateado dentro de cada equipe. Em equipe pequena, isso deixa inferir salário e põe equipes lado a lado (comparação entre times proibida, B:406).
  - **C.** Por sistema, sem "por demanda".
  - **Recomendação: A**, com o chip "Rateio do custo total do DSPD, não esforço medido". Nunca por equipe nem por pessoa. Quem informa o valor e com que periodicidade fica registrado como configuração versionada (T2.6).

### D-2 · Peso da participação — resolvida; confirma a decisão do usuário (A)
- "unidade demanda entregável ao solicitante · subtarefa NÃO conta como item na vazão" (B:110), repetido em "A unidade de contagem é sempre a demanda entregável ao solicitante" (P:629).
- `tamanho_declarado` habilita só "O8, política de quebra" (B:129), não o custo por sistema, o que descarta a opção C. Para a opção B (dias úteis em execução como peso) não há base em nenhum documento.
- **Vale:** contagem de demandas entregues, sem subtarefa (A).

### D-3 · Concentração de conhecimento — parcialmente resolvida; decisão do usuário mantida
- **O que o documento fixa:**
  - A pergunta é "Quantos sistemas dependem de uma única pessoa" (P:403; H:1618).
  - A dimensão é `sistema_afetado` (B:124; P:612).
  - O dado de pessoa é `dim_card.responsaveis` (B:142), um conjunto **por card** que não exige histórico de responsável. Isso afasta a necessidade de coleta extra da opção C.
  - A unidade é a demanda entregável (B:110).
- **O que não fixa:** a janela. Os documentos falam de janela de 12 semanas só para distribuições e percentis (B:110), e esta métrica é contagem.
- **Vale:** a resposta A do usuário. Pessoas distintas em `responsaveis` das demandas entregues, por sistema, em 12 meses. O coletor grava só o número.

### D-4 · Lista dos sistemas em "1 pessoa" — não resolvida pelos documentos; decisão do usuário mantida
- Os documentos só formulam a contagem ("Quantos sistemas", P:403) e o compromisso de não usar métrica em avaliação individual (P:665). Não proíbem nem pedem a lista.
- **Vale:** a resposta B do usuário.

### D-5 · Passagens de mão — parcialmente resolvida
- **O que o documento fixa:**
  - "Quantas trocas de **responsável** uma demanda sofre | Extração" (P:252; H:1112). Mudança de equipe ou de quadro não é troca de responsável, o que **descarta B e C**.
  - O histórico vem de `/cards/{id}/revisions` (B:53), que o coletor já lê (B:201).
- **O que sobra para o usuário:** o que é "troca" quando o card tem mais de um responsável.
  - **A.** Toda alteração do conjunto de responsáveis (entrada ou saída).
  - **B.** Só quando alguém sai e outro entra, ou quando o conjunto é substituído. Incluir um co-responsável sem ninguém sair não conta.
  - **Recomendação: B**, que é a leitura mais próxima de "troca". O arquiteto confirma se as revisões trazem o campo de responsáveis.

### D-6 · Ordem de chegada — parcialmente resolvida
- **O que o documento fixa:** a ordem de chegada é política **só da classe Padrão**, "dentro do tipo" (P:599; H:2269).
  - Urgente "fura a fila" (P:597).
  - Prazo fixo é "planejada para iniciar com folga sobre o percentil 85" (P:598).
  - Intangível é "protegida por cota fixa" (P:600).
  - Portanto o grupo de comparação é **classe Padrão + mesmo tipo**. Isso **altera a opção A**: Prazo fixo e Intangível também ficam fora, além de Urgente. As opções B e C ficam descartadas.
- **O que sobra para o usuário:** se a fila é por equipe (quadro) ou do DSPD inteiro. Os documentos não dizem.
  - **A.** Por equipe.
  - **B.** Todas as equipes juntas.
  - **Recomendação: A**, porque cada equipe tem a sua fila. Comparar a ordem entre quadros diferentes mede outra coisa.

### D-7 · Datas do portfólio — resolvida (A)
- `data_acordada` é preenchida "No compromisso" (B:127; P:615). A pergunta é "Quando comprometemos uma data, ela se confirma?" (P:401). A data que vale é a registrada no compromisso: a primeira, opção A.
- As alterações posteriores aparecem como replanejamentos. Elas vêm do histórico de revisões (B:53), que o coletor já coleta (B:201). Não é recurso novo, é derivação nova.
- Tolerância: igual à de O12, em que vencido é "venceu sem entrega" após a data acordada (P:173; B:358). Entregue até a data = no prazo, tolerância zero.

### D-8 · Qualidade da entrada — parcialmente resolvida
- **O que o documento fixa:**
  - A dimensão é `area_solicitante`, que habilita "qualidade da entrada" (B:123; P:611).
  - A origem é "Extração" (P:347; H:1430), que a proposta define como cálculo sobre o histórico de movimentação e a "direção do movimento" (P:560). A outra métrica baseada só em bloqueio, Bloqueios por causa, tem origem "Nativo + motivos padronizados" (P:245). Isso é indício de que a métrica envolve retorno no fluxo, não uma definição.
  - O motivo "Falta de informação no chamado" existe no domínio fechado (B:136).
- **O que sobra para o usuário:** a regra de "ida e volta". As opções são as A, B e C acima. **Recomendação: A**, que usa o retorno indicado pela origem "Extração" e o motivo do domínio.

### D-9 · Primeiro toque — parcialmente resolvida
- **O que o documento fixa:**
  - A fonte listada para "Primeiro toque" é a linha "comentários · tempo apontado · bloqueios → Primeiro toque, estoque parado, fato_bloqueio" (B:57; HB:204). Na leitura em ordem, comentário é a fonte do primeiro toque. Mudança de coluna vem de outra linha, revisões → `fato_transicao` (B:53).
  - **Tempo apontado nunca entra** (B:409), mesmo estando na mesma linha da tabela.
  - Só o instante é gravado. Autor e texto do comentário ficam fora, pela regra de dados de pessoa e texto livre.
- **O que sobra para o usuário:** a pergunta é "nenhuma reação nossa" (P:248), que é mais ampla que comentário, e a tabela de fontes aponta comentário.
  - **A.** Comentário, mudança de coluna ou atribuição.
  - **C.** Só comentário.
  - **Recomendação: C**, por seguir a fonte que o briefing lista. Comentário gerado por regra automática não conta.

### D-10 · Prazo contratado por fornecedor — parcialmente resolvida
- **O que o documento fixa:** a pergunta é "O tempo de resposta contratado é o praticado?" com origem "Extração + campo fornecedor" (P:344; H:1427). O lado praticado vem de `fato_bloqueio` com `fornecedor`, preenchido "Ao bloquear" (B:126, B:142).
- **O que não fixa:** de onde vem o prazo contratado. Ele não está no Kanban e não consta entre os dados externos (P:561).
- **O que sobra para o usuário:** as opções A e B acima. **Recomendação: A agora, B quando os contratos forem informados.**

### D-11 · Sazonalidade na Sustentação — resolvida (A)
- A sazonalidade está catalogada só no nível tático do BusinessMap (P:346; H:1429). O catálogo da sustentação (B:386-399, S1 a S12) não a inclui.
- **Vale:** só no Tático. O gêmeo no Acelerato sai do pedido 011 e só entra se o usuário pedir à parte. A recomendação B deste documento fica revertida.

### D-12 · Ordem de implementação — resolvida (A)
- "Configuração (WS1 e WS4) precede coleta (WS2 e WS5), que precede painel" (B:20).
- Métricas fora do núcleo são "implementadas sob demanda" (B:344).
- "Sete das métricas derivadas precisam apenas de datas que já existem no card... uma forma barata de testar o valor" (P:563).
- **Vale:** primeiro as que usam dado já no modelo, depois as que dependem de coleta nova (O22, O26, T13, replanejamentos do E6, agregado do E8).
- Partes que dependem de configuração do WS1 só depois dela: domínio fechado do motivo de descarte (O25), campos `fornecedor`, `area_solicitante` e `sistema_afetado` com cobertura (T10, T12, E7, E8).

### D-13 · Tempo consumido no descarte — resolvida (A)
- "descartado sai do cálculo de tempo de ciclo · entra na taxa de descarte com o tempo já consumido" (B:110; P:628).
- O tempo de ciclo começa no marco "inicio: primeira entrada em coluna de execução" (B:106).
- A pergunta é "Quanto **esforço** foi investido no que nunca foi entregue" (P:251).
- **Vale:** do início até o descarte. Descartado antes de iniciar consome zero e aparece à parte. A opção B (desde a criação) contaria fila, que não é esforço nem tempo de ciclo.
- Ressalva: a conclusão vem da leitura conjunta dos três trechos. O usuário pode contestá-la na validação.

### D-14 · Dependências — parcialmente resolvida; recomendação de UX revertida
- **O que o documento fixa:** "Densidade de dependências entre quadros | Quanto do prazo depende de trabalho que não é nosso | **Extração + vínculos**" (P:348; H:1431). A métrica é por vínculo entre cards de quadros diferentes, opção A. O bloqueio "Dependência de outra demanda", opção B, não faz parte da definição.
  - A recomendação C deste documento fica revertida.
  - O bloco "(c) dias bloqueados" sai do T13 e vira "leia junto" com o O19, que já mostra esse motivo.
- **O que sobra:**
  - Quais tipos de vínculo contam. Pai/filho é hierarquia, não dependência (B:41-42), e cruza quadros por construção: story no quadro do time, frente no do coordenador. Se pai/filho contasse, quase toda story "dependeria".
  - O briefing lista só os vínculos pai/filho como recurso (B:54).
  - **Recomendação:** contar só vínculos de dependência (predecessor/sucessor) com card de outro quadro e excluir pai/filho. O arquiteto confirma quais tipos de vínculo a API do BusinessMap expõe. Se não houver vínculo de dependência, o T13 fica sem fonte e volta como decisão.

### Achados laterais (fora de D-1 a D-14)
- **O23 e tempo apontado:** o briefing lista "tempo apontado" ao lado de "estoque parado" (B:57). Pela 7.1 (B:409) ele nunca entra. O O23 continua só com a ausência de movimento de coluna (`semMoverHaDiasUteis`).
- **O23 "uma semana":** o texto é da proposta, "não se move há mais de uma semana" (P:249). 5 dias úteis é a conversão pela regra de dias úteis (B:110). A regra de higiene "mais de duas semanas em coluna de execução" (P:637) é para a pauta da revisão semanal, não para esta métrica.

### O que volta ao usuário (uma por vez, nesta ordem)
1. **D-14'** tipos de vínculo (junto com **R-4**, vínculo removido): depende antes da confirmação do arquiteto sobre a API.
2. **D-9'** primeiro toque: só comentário ou qualquer reação.
3. **D-8** regra de "ida e volta".
4. **D-5'** o que é "troca" com mais de um responsável.
5. **D-6'** fila por equipe ou do DSPD (junto com **R-1**, o "custo" da ultrapassagem).
6. **D-1'** de que é o custo de capacidade e como aparece o "por demanda".
7. **D-10** prazo contratado (junto com **R-7**, só se for B).
8. **R-2'** instante do descarte para card sem arquivamento, e se o excluído entra.

## D. Lacunas de regra levantadas pelo arquiteto (R-1 a R-7), conciliadas com os documentos (2026-10-14)
Mesmo critério da seção C e mesmas abreviações (**B**, **P**, **H**, **HB**). Origem: `docs/architecture/features/metricas-tambem-disponiveis.md`, final da seção 7. Os termos em questão foram conferidos também nos HTML de `docs/referencia/` (por exemplo H:1110-1111 e H:1431), sem diferença em relação ao texto convertido.

| # | Métrica | Classificação | O que vale |
|---|---|---|---|
| R-1 | O24 | Decidida pelo usuário em 2026-10-14: A | Espera do ultrapassado do início de quem passou na frente até o próprio início, em dias úteis |
| R-2 | O25 | Parcialmente resolvida | Excluído entra (P:564); resto volta como R-2' |
| R-3 | E7 | Resolvida | As 4 naturezas do T3 |
| R-4 | T13 | Não resolvida | Volta ao usuário |
| R-5 | T10 | Resolvida (com ressalva) | Entra todo bloqueio com fornecedor informado |
| R-6 | E9 | Resolvida | O card de projeto nasce com a aprovação |
| R-7 | T10 | Parcialmente resolvida | Vale só com D-10 = B; recomendação P85 |

### R-1 · O24, o que são os "dias úteis a mais" dos ultrapassados — não resolvida
- **O que o documento fixa:** só a pergunta, "Quem passou na frente de quem, e a que custo" (P:250; H:1110), com origem "Extração". Não define o "custo", nem em unidade nem em referência de comparação. Também não há definição em B (a métrica nem consta do catálogo de B:345-385).
- **Opções** (as duas do arquiteto):
  - **A (leitura i).** Para cada ultrapassado, o tempo entre o início de quem passou na frente (o primeiro que o ultrapassou) e o início dele próprio. Prós: usa só datas do card, sem referência externa. Contras: é a espera depois da ultrapassagem, não o "a mais" em sentido estrito.
  - **B (leitura ii).** A espera real do ultrapassado menos a mediana da espera dos itens do grupo atendidos em ordem. Prós: isola o efeito da ultrapassagem. Contras: depende de um contrafactual (a mediana do grupo) e de n suficiente nele; mais difícil de explicar.
- **Recomendação: A**, com o texto do cartão "esperaram, depois de ultrapassados, X dias úteis até começar", e não "dias a mais". É o que se calcula sem inventar um valor esperado.
- Enquanto isso o O24 publica só a taxa de inícios fora de ordem; o custo fica como provisório (chip "R-1" no protótipo).

### R-2 · O25, instante do descarte e excluídos — parcialmente resolvida
- **O que o documento fixa:**
  - `arquivado_em` e `motivo_descarte` são colunas de `dim_card` (B:142), e cards arquivados e excluídos não podem ser perdidos (B:59, B:203, P:635).
  - A proposta trata o excluído como demanda cancelada: "card excluído ou arquivado some das consultas padrão... perdemos justamente as demandas canceladas" (P:564; B:59). **Vale: card excluído entra no descarte**, como o arquivado.
  - "Criado por engano" **não aparece em nenhum documento**: é valor inventado do mock. Sai da lista de motivos (o mock só pode marcar motivos como provisórios).
  - Card de teste ou rascunho fica em quadro separado, fora de qualquer cálculo (B:110, P:632): não é descarte.
- **O que não fixa (R-2'):** qual é o instante do descarte quando o card tem `motivo_descarte` mas nunca foi arquivado nem excluído, e qual é o instante do excluído (o campo de exclusão não consta em B:142).
  - **A.** Só é descarte o card arquivado ou excluído, e o instante é o do arquivamento ou da exclusão. Motivo preenchido sem nenhum dos dois é defeito de dado: fica fora da taxa e aparece à parte, como aviso.
  - **B.** Motivo preenchido já é descarte, e o instante é a última movimentação de coluna. Prós: não perde ninguém. Contras: inventa um marco; o tempo consumido pode errar.
  - **Recomendação: A**: o instante vem de um evento real e o erro de preenchimento fica visível em vez de escondido.

### R-3 · E7, 3 ou 4 naturezas — resolvida
- A alocação da capacidade tem quatro categorias: "sustentação, evolução, projetos e dívida técnica" (B:369; P:280 cita incidente, requisição, melhoria, projeto e dívida técnica e permite cruzar "por sistema"). Já a taxonomia de tipos (B:113-119, P:587-593) tem natureza Sustentação, Evolução e Qualidade, e é o insumo do mapeamento por tipo (provisório P8 no código).
- As três naturezas da especificação anterior (Sustentação, Evolução e Dívida técnica) **não têm base** nos documentos.
- **Vale:** as 4 do T3, pela mesma função `naturezaDe`, sem segundo mapeamento. "Projetos" significa demanda que pertence a um projeto: o item continua sendo demanda (D-2), então não mistura card de projeto com story. O E7 e o T3 não podem divergir.

### R-4 · T13, vínculo removido antes da entrega — não resolvida
- Nenhum documento trata remoção de vínculo. O briefing só lista os vínculos como recurso do coletor (B:54, B:201).
- **Opções:**
  - **A.** Conta como "dependeu" se o vínculo esteve vigente em algum momento antes de `concluido_em`. Prós: a espera, se houve, já aconteceu; remover o vínculo não a desfaz. Combina com histórico que nunca se sobrescreve (B:59).
  - **B.** Só conta o vínculo vigente na entrega. Prós: simples. Contras: apagar o vínculo apaga a dependência do cálculo, e a medida fica manipulável.
  - **Recomendação: A.**
- Decidir junto com D-14' (mesmo cartão).

### R-5 · T10, "Aguardando licença ou contrato" entra? — resolvida (com ressalva)
- A métrica depende do campo `fornecedor` ("fornecedor | Lista fechada | Ao bloquear | SLA real de terceiros", B:126; P:614), preenchido por "quem bloqueia" e guardado em `fato_bloqueio` (B:142). A origem é "Extração + campo fornecedor" (P:344; H:1427). Nenhum documento amarra a métrica a um motivo específico.
- **Vale:** o critério é o campo, não o motivo. Entra todo bloqueio encerrado com fornecedor informado, inclusive "Aguardando licença ou contrato". O filtro "só Aguardando fornecedor" da especificação anterior **não tinha base**.
- **Ressalva:** a conclusão vem da leitura do campo como critério. O usuário pode contestá-la na validação. Bloqueio com motivo "Aguardando fornecedor" e fornecedor vazio é falha de preenchimento e fica fora da tabela.

### R-6 · E9, o card de projeto nasce com a aprovação? — resolvida
- "Aprovado na comissão, é criado o card de projeto no quadro do gerente, e é esse o marco de entrada do relógio estratégico" (B:39). Idem "contado da criação do card, logo após a aprovação na comissão" (P:359; H:1460) e "o relógio estratégico começa na aprovação da comissão" (P:46). O tempo anterior (TAP) está fora do escopo (B:39, P:46). A proposta ainda cita "projeto aprovado e não iniciado" como métrica de portfólio (P:59).
- **Vale:** `criado_em` do card de projeto é a aprovação. A coluna "Aprovado em" do E9 usa essa data. Sem campo ou coluna de aprovação a procurar.

### R-7 · T10, comparar o P85 ou a fração dentro do prazo — parcialmente resolvida
- **O que o documento fixa:** a pergunta é "O tempo de resposta contratado é o praticado?" (P:344) e toda distribuição é por percentis 50/85/95, "média nunca sozinha" (B:110). Compromisso externo é sempre no P85 (B:372, T6) e data comunicada no P85 (B:382, E5). Isso é convenção para promessa, não regra de T10.
- **O que não fixa:** o critério de "dentro" e "acima" do contratado.
  - **A.** Compara o P85 da duração com o prazo contratado.
  - **B.** Percentual de bloqueios encerrados dentro do prazo.
- **Recomendação: A**, pela convenção do P85 para compromisso externo e porque B é percentual sobre n pequeno por fornecedor. **Só importa se D-10 = B** (sem prazo cadastrado o cartão mostra só P50/P85). Por isso entra na fila junto com D-10, e não separada.

### O que mudou na especificação por causa desta seção
- E7 com 4 naturezas (R-3); E9 com a nota do marco (R-6); T10 com o critério por campo `fornecedor` (R-5) e prazo só com D-10 = B.
- O24, O25, T13 e T10 ganharam chips de regra provisória (R-1, R-2', R-4, R-7).
- Achado para o arquiteto: o plano técnico (§2, T10) fala em filtrar só "Aguardando fornecedor", e (§2, O25) em "Criado por engano" nos motivos. As duas coisas ficam sem base e devem ser ajustadas ali.
- **D-9' (2026-10-14): só comentário** (opção C da seção de conciliação; apresentada ao usuário como "a"). Primeiro toque = primeiro comentário humano no cartão (B:57).
