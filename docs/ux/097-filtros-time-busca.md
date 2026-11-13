# Pedido 097: filtro de equipe e setor, busca nos filtros, opções reais e recolher cartão

Estado: **1ª rodada** (Resumo, Apontamento, busca) aceita por delegação do dono em 2026-11-11 14:05 (literal: "faca suas recomendacoes"), sem o dono abrir o protótipo. **2ª rodada** (rótulo Equipe, E5 recolher cartão e 10 maiores, E7 Setor): **aguardando o usuário** no protótipo `docs/ux/prototipos/097-filtros.html`. Nada da 2ª rodada é "aprovado". Hipóteses estão marcadas como tal.

Decisões do dono já incorporadas (literais no pedido): 14:08 "troque time por equipe. Time fica muito informal." (rótulo **Equipe** em todo o produto, "Sem equipe" no lugar de "Sem time"); 13:45 "A" (recolher em todo cartão de gráfico); 14:05 "faca suas recomendacoes" (10 maiores com "ver todos" no AP-PROJETO; busca em listas curtas; nota "Outra área" junto da capacidade; opções de toda a base; equipe pelo card da hora com "Sem equipe"; Tipo = categoria do contrato); 14:09 "A" (Setor sem o sobrenome do responsável).

## Objetivo
O dono quer (1) filtrar por equipe no Resumo, (2) filtrar por equipe, e não por pessoa, no Apontamento, (3) digitar para achar a opção nos filtros de lista, (4) ver nos filtros só opções que existem no dado, (5) recolher cartões de gráfico que ficam enormes (ex.: "Horas por projeto") e (6) filtrar o fluxo por setor. O resultado esperado é achar uma equipe, setor ou sistema em poucos segundos, nunca ver opção inventada e controlar quanto espaço cada gráfico ocupa.

## Personas / contexto de uso (hipótese, a partir do pedido e do código)
- Gestor/a de equipe ou coordenação (desktop, uso semanal): abre o Resumo, quer ver a sua equipe ou o seu setor; no Apontamento, as horas da equipe.
- Pessoa de liderança de sustentação (desktop, diário): olha a Sustentação da sua equipe.
- Dono do produto (desktop): navega entre painéis e quer controlar o tamanho dos gráficos.
- Uso em tela estreita existe (folha de filtros no mobile); ver CA-16.
- Pergunta aberta ao dono: quem mais usa o Resumo e com que frequência? (hipótese, não confirmado).

## Princípios e limites (CLAUDE.md)
- Filtrar por equipe ou por setor não é comparar: cada painel mostra UM conjunto de números, nunca equipes ou setores lado a lado, nunca ranking, nunca série por equipe ou por setor.
- BusinessMap e Acelerato nunca se misturam: cada bloco tem os filtros da sua fonte. Setor existe só no BusinessMap.
- Troca de Pessoa por Equipe no Apontamento reduz a exposição individual; o cartão de capacidade por pessoa não muda (decisão do dono), sem ranking e sem meta por pessoa.
- O ranking dos 10 projetos com mais horas é de projetos, não de pessoas nem de equipes, e é permitido.
- Setor nunca mostra o sobrenome do responsável (regra de nenhuma métrica servir para avaliação individual).
- Selecionar mais de uma equipe (ou mais de um setor) apresenta resultado consolidado; o aviso existente é mantido com o novo rótulo: "O sistema não compara equipes." / "O sistema não compara setores."

## Fluxo
1. Resumo: a pessoa abre o Resumo, vê dois blocos. O bloco Fluxo tem "Setor: Todos" e "Equipe: Todas"; o bloco Sustentação tem só "Equipe: Todas". Abre um filtro, digita parte do nome, marca uma ou mais opções; os números e a tendência SÓ daquele bloco atualizam; o outro bloco não muda.
2. Apontamento: a pessoa usa "Equipe" onde antes havia "Pessoa"; a lista de capacidade por pessoa mostra as pessoas das equipes escolhidas.
3. Qualquer filtro de lista: abrir, digitar, marcar, fechar (Esc ou Fechar), com o foco devolvido ao botão.
4. Recolher: a pessoa vê o cartão "Horas por projeto" grande, aciona "Recolher" no cabeçalho do cartão; o corpo some, ficam título, uma linha de resumo e o botão "Expandir". Ao voltar outro dia, o cartão continua recolhido.
5. AP-PROJETO: o cartão abre com os 10 projetos de mais horas e "Ver todos os N projetos"; ao acionar, a lista completa aparece com rolagem própria.
6. Erro e vazio: ver "Estados".

## Telas

### 1. Resumo (E1, E7)
Onde ficam os filtros: **dentro de cada bloco**, entre o cabeçalho (título e "Fonte: ...") e os números. Não há barra única no topo da página, porque ela sugeriria que uma equipe vale para as duas fontes.

```
+-- Fluxo de projetos ----------------------------------------+
| Fonte: BusinessMap · Dados até 10/11/2026 · 12 semanas       |
| [Setor: Todos v] [Equipe: Todas v]      (Limpar filtros)     |
| Resultado consolidado de 2 equipes. O sistema não compara equipes. (só com 2 ou mais)
| chips: Setor: Plataformas (x)  Equipe: Mobile (x)            |
| ...cartões, tendência, links (como hoje)...                  |
+--------------------------------------------------------------+
+-- Sustentação ---------------------------------------------+
| Fonte: Acelerato ...  [Equipe: Todas v]  ...                 |
```

- Componentes: `FiltroMulti` (com a busca de E3), `ChipsFiltros`, aviso consolidado já existente em `BarraFiltros`. Hipótese de implementação (arquiteto): estado na URL com parâmetro por bloco, para link compartilhável.
- Rótulo: **"Equipe"** nos dois blocos (decisão 14:08). Gênero feminino: "Equipe: Todas", "2 selecionadas".
- Estados: carregando (botão desabilitado "Equipe: carregando…", altura reservada); vazio (botão desabilitado "Equipe: sem opções" e frase); erro ("Equipe: indisponível", abre mensagem com "Tentar de novo"; os números do bloco continuam visíveis); sem permissão: não se aplica (hipótese).
- Seleção sem dado: menos de 20 itens na janela, o bloco aplica a regra existente (abaixo de 20 não publica percentis) e diz isso no lugar do número.
- Interações: marcar/desmarcar aplica na hora; "Limpar" volta a "Todas"/"Todos".

### 2. Apontamento (E2, E5)
Ordem atual: período, pessoa, projeto, tipo, subgrupo, subtarefa, qualidade. Nova ordem: período, **equipe**, projeto, tipo, subgrupo, subtarefa, qualidade. O filtro Pessoa sai. Cartão de capacidade por pessoa, ordem e "Ocultar possíveis erros" ficam iguais, mas o cartão passa a ser recolhível (E5).
- A "linha de nomes ocultos" e a nota "Outra área" passam para junto do cartão de capacidade (decidido em 14:05, Q-3).
- Equipe da hora vem do card do lançamento; card sem equipe entra em **"Sem equipe"** (opção do filtro, decidido em 14:05). Pessoa com horas em mais de uma equipe aparece em cada uma (consequência de a equipe vir do card, não da pessoa).
- Chip passa a "Equipe: X". Links antigos com `pessoa=`: valor não mais suportado, com o aviso "Valor inválido ignorado em: pessoa".
- Estados: iguais aos do Resumo.

```
+-- Horas por projeto (AP-PROJETO) ------------ [Recolher] --+
| Mostrando os 10 projetos com mais horas, de 24.            |
| Portal do Cliente        ████████████  412,5 h             |
| Integração ERP           ███████████   388,0 h             |
| ... (10 linhas)                                            |
| Demais 14 projetos: 1.076,2 h        [Ver todos os 24 projetos]
+------------------------------------------------------------+
recolhido:
+-- Horas por projeto (AP-PROJETO) ----------- [Expandir] ----+
| Recolhido. 24 projetos, 3.669,6 h no total.                |
+------------------------------------------------------------+
```

### 3. Busca nos filtros de lista (E3)
Vale para todo `FiltroMulti`: Equipe, Setor, Tipo, Sistema, Prioridade, Projeto, Subgrupo, Subtarefa, Qualidade; popover e folha mobile. Período não é lista e não muda.

```
[Equipe: Todas v]
+--------------------------+
| Buscar                   |
| [ digite para buscar   ] |
| 3 opções encontradas de 60.   <- aria-live
| 1 selecionada fora da busca (continua aplicada).
| [ ] Integrações          |
| [x] Mobile               |
| ...(rola dentro da lista)|
| [Limpar seleção]  [Fechar]
+--------------------------+
```

- Campo "Buscar" com rótulo visível, foco inicial ao abrir. A lista continua sendo um grupo de caixas de marcação (padrão atual, bom com leitor de tela); o campo só filtra as caixas exibidas. Escolha deliberada: não é combobox ARIA com `aria-activedescendant`.
- Comparação sem diferenciar maiúsculas e acentos, em qualquer parte do nome.
- Teclado: Seta para baixo no campo vai à primeira opção; setas movem entre opções; Seta para cima na primeira volta ao campo; Espaço marca; Enter no campo com exatamente uma opção visível a marca; Esc com texto limpa o texto; Esc sem texto fecha e devolve o foco ao botão. Tab percorre campo, lista, "Limpar seleção" e "Fechar".
- A busca não altera a seleção; opções marcadas e fora da busca continuam aplicadas e são contadas. "Limpar seleção" limpa a seleção toda e mantém o texto.
- O texto da busca zera ao fechar e não vai para a URL.
- Sem resultado: "Nenhuma opção com "xyz"." e anúncio "Nenhuma opção encontrada.".
- Muitos itens: lista com altura máxima e rolagem própria (256 px); com mais de 12 opções mostra "N opções" sob o campo.
- Listas curtas: a busca aparece sempre (decidido em 14:05, Q-1).
- Nomes longos: no botão, reticências (280 px) com nome completo em `title` e `aria-label`; na lista, quebra em linhas.

### 4. Opções do dado real (E4)
- Todas as opções vêm da base (de toda a base, não só do período; decidido em 14:05): Tipo do Operacional deixa a lista fixa (Tipo = categoria do contrato, só as que têm card); equipes da Sustentação deixam a lista fixa de 3 SSSC; as equipes refletem o pedido 098.
- Ordem alfabética fixa.
- Nomes provisórios ("Workflow 105"): o filtro mostra o que o dado trouxer; a troca por nomes legíveis é do pedido 098.
- Filtro vazio: botão desabilitado e frase "Ainda não há <itens> na base. O filtro aparece quando houver dados." Não esconder o filtro.
- Link com valor que deixou de existir: aviso existente de valor inválido.

### 5. Recolher cartão de gráfico (E5)
Vale para todo cartão de gráfico ou tabela de dado dos painéis (Resumo, Operacional, Tático, Estratégico, Sustentação, Apontamento). Os cartões de número único (KPI) não recolhem: já são pequenos (hipótese; o dono confirma ao ver o protótipo).
- Controle: botão de texto no canto direito do cabeçalho do cartão, "Recolher" quando aberto e "Expandir" quando recolhido; `aria-expanded`, `aria-controls` apontando para o corpo, `aria-label` "Recolher cartão: Horas por projeto". Texto visível, não só ícone.
- Recolhido: o corpo é ocultado (não apenas escondido por altura); ficam título, botão e uma linha de resumo de uma frase com o total, por exemplo "Recolhido. 24 projetos, 3.669,6 h no total." O resumo nunca traz número por pessoa, equipe ou setor.
- Memória: a escolha vale por cartão (chave estável, ex.: AP-PROJETO), guardada no navegador da pessoa; não vai para a URL e não muda os filtros. "Ver todos" do AP-PROJETO não é lembrado: ao reabrir, volta a 10 (hipótese).
- Restaurar: quando há ao menos um cartão recolhido no painel, aparece "Restaurar cartões recolhidos" acima dos cartões; expande todos do painel e apaga a memória.
- Estados: carregando/vazio/erro também recolhem; recolhido com erro mostra no resumo "Não foi possível carregar este cartão." em vez do total, para o erro não sumir.
- O dado do cartão continua sendo carregado quando recolhido (hipótese; o arquiteto pode decidir adiar a leitura, desde que o resumo apareça).
- Sem animação de altura (atende `prefers-reduced-motion` sem trabalho extra).

### 6. AP-PROJETO: os 10 maiores com "ver todos" (E5)
- Mostra os 10 projetos com mais horas no recorte filtrado, em ordem decrescente de horas; empate em ordem alfabética.
- Com mais de 10 projetos: texto "Mostrando os 10 projetos com mais horas, de N.", linha "Demais N-10 projetos: X h" (mantém o total conferível) e botão "Ver todos os N projetos".
- Ao acionar: lista completa dentro de região com rolagem própria (altura máxima 360 px, focável por teclado), botão vira "Ver só os 10 maiores", com `aria-expanded`. O foco continua no botão.
- Com 10 projetos ou menos: sem botão e sem linha "Demais".
- Os filtros do painel valem antes do corte (os 10 maiores do recorte filtrado).

### 7. Filtro Setor nos painéis do fluxo (E7)
Onde: bloco Fluxo do Resumo e painéis do fluxo (BusinessMap) FL1, FL2 e FL3; antes do filtro Equipe na barra (do mais amplo ao mais estreito). Não existe na Sustentação (o Acelerato não tem setor).
- Opções (7, sem o sobrenome do responsável; AI Iniciatives fora), em ordem alfabética: Ciência de Dados; Desenv Sistemas Plataformas Digitais - Gerencial; Escritório de Processos e Projetos; Marketing e Vendas; Plataformas; Sistemas Corporativos; Sistemas de Vendas e Operações.
- O sobrenome não aparece em lugar nenhum: botão, lista, chip, `title`, `aria-label`, anúncio de leitor de tela, URL. O nome de exibição vem de um dicionário de setores (id do quadro para nome sem sobrenome), nunca do nome bruto do quadro (arquiteto).
- Setor e Equipe combinam por interseção (hipótese, o arquiteto confirma como o card liga ao quadro): as listas são independentes; combinação sem itens cai na regra de menos de 20 itens.
- Multiseleção como os demais filtros; com 2 ou mais: "Resultado consolidado de N setores. O sistema não compara setores." e um só conjunto de números.
- Proibido: setores lado a lado, ranking de setores, séries por setor num gráfico, tabela com uma linha por setor.
- Estados: iguais aos filtros de lista (carregando, vazio, erro).
- Apontamento: ver Q-7.

## Necessidades de dados
- Resumo/fluxo: lista de equipes do BusinessMap (id, nome) e de setores (id estável, nome de exibição sem sobrenome); números e tendência do bloco aceitando equipe e setor.
- Resumo/sustentação: lista de equipes do Acelerato (id, nome); depende do pedido 098.
- Apontamento: lista de equipes e a equipe de cada card (dim_card.equipe); "Sem equipe" para card sem equipe; total de horas por projeto, ordenável, para os 10 maiores e a linha "Demais".
- Opções de Tipo, Sistema, Prioridade e demais filtros lidas da base (toda a base) com id estável e nome. Sem colunas de pessoa na API do projeto (GRANT por coluna).
- Setor: como o card se liga ao quadro do espaço de trabalho e qual é a lista de quadros de setor (arquiteto).
- Recolher: só no navegador (sem dado no servidor).
- A busca é local sobre a lista já carregada. Limite a confirmar: até algumas centenas de opções.

## Microcopy
- Botão de filtro: "Equipe: Todas" / "Equipe: Mobile" / "Equipe: 3 selecionadas" / "Equipe: carregando…" / "Equipe: sem opções" / "Equipe: indisponível"; "Setor: Todos" / "Setor: Plataformas" / "Setor: 2 selecionados".
- Opção: "Sem equipe".
- Campo: rótulo "Buscar", ajuda "Digite para buscar".
- Contagem: "3 opções encontradas de 60." / "1 opção encontrada de 60." / "Nenhuma opção encontrada."
- Fora da busca: "1 selecionada fora da busca (continua aplicada)." / "2 selecionadas fora da busca (continuam aplicadas)."
- Sem resultado: "Nenhuma opção com "texto"."
- Rodapé: "Limpar seleção", "Fechar".
- Vazio: "Ainda não há equipes na base. O filtro aparece quando houver dados."
- Erro: "Não foi possível carregar as opções de Equipe." + "Tentar de novo".
- Aviso consolidado: "Resultado consolidado de N equipes. O sistema não compara equipes." / "Resultado consolidado de N setores. O sistema não compara setores."
- Menos de 20: "Menos de 20 itens na janela (N). Os percentis não são publicados."
- Link antigo: "Valor inválido ignorado em: pessoa."
- Recolher: "Recolher" / "Expandir" (rótulo acessível "Recolher cartão: Horas por projeto"); "Restaurar cartões recolhidos"; resumo "Recolhido. 24 projetos, 3.669,6 h no total."; erro recolhido "Não foi possível carregar este cartão."
- 10 maiores: "Mostrando os 10 projetos com mais horas, de 24." / "Demais 14 projetos: 1.076,2 h" / "Ver todos os 24 projetos" / "Ver só os 10 maiores".
- Sustentação: "Sem filtro Setor aqui: o Acelerato não tem setor."

## Critérios de aceite
Os CA-1 a CA-23 são da 1ª rodada, com o rótulo "Equipe" no lugar de "Time". O CA-8 ganha "Sem equipe" (alteração de texto, mesmo número).

- CA-1 QUANDO a pessoa abre o Resumo O SISTEMA DEVE exibir um filtro "Equipe" dentro do bloco Fluxo e outro dentro do bloco Sustentação, ambos com valor inicial "Todas".
- CA-2 O SISTEMA DEVE listar no filtro do bloco Fluxo apenas equipes do BusinessMap e, no do bloco Sustentação, apenas equipes do Acelerato.
- CA-3 QUANDO a pessoa marca uma equipe no bloco Fluxo O SISTEMA DEVE atualizar os números e a tendência do bloco Fluxo e não alterar o bloco Sustentação (e vice-versa).
- CA-4 ENQUANTO duas ou mais equipes estão marcadas em um bloco O SISTEMA DEVE exibir "Resultado consolidado de N equipes. O sistema não compara equipes." e um único conjunto de números, sem números por equipe.
- CA-5 O SISTEMA NÃO DEVE exibir, em nenhum bloco, números de equipes lado a lado, ordenação de equipes nem soma de BusinessMap com Acelerato.
- CA-6 SE a seleção tem menos de 20 itens na janela ENTÃO O SISTEMA DEVE manter a regra de não publicar percentis e informar o motivo no lugar do número.
- CA-7 QUANDO a pessoa abre o Apontamento O SISTEMA DEVE exibir o filtro "Equipe" no lugar de "Pessoa", e NÃO DEVE exibir o filtro "Pessoa".
- CA-8 QUANDO a pessoa marca uma equipe no Apontamento O SISTEMA DEVE restringir os dados do período, e a lista de capacidade por pessoa, às horas dos cards daquela equipe (card sem equipe na opção "Sem equipe"), sem alterar o formato do cartão de capacidade.
- CA-9 SE o link traz o parâmetro `pessoa` ENTÃO O SISTEMA DEVE ignorá-lo, exibir "Valor inválido ignorado em: pessoa." e manter a página funcional.
- CA-10 QUANDO a pessoa abre qualquer filtro de lista O SISTEMA DEVE exibir o campo "Buscar" com rótulo visível e dar foco a ele.
- CA-11 QUANDO a pessoa digita no campo O SISTEMA DEVE exibir só as opções cujo nome contém o texto, sem diferenciar maiúsculas nem acentos, e anunciar a contagem a leitores de tela (região `aria-live="polite"`).
- CA-12 SE nenhuma opção corresponde ao texto ENTÃO O SISTEMA DEVE exibir "Nenhuma opção com "texto"." e anunciar "Nenhuma opção encontrada.".
- CA-13 QUANDO a busca oculta opções já marcadas O SISTEMA DEVE manter a seleção aplicada e informar quantas estão fora da busca.
- CA-14 QUANDO a pessoa usa o teclado O SISTEMA DEVE permitir: Seta para baixo do campo à lista, setas entre opções, Espaço para marcar, Enter com uma única opção visível para marcá-la, Esc com texto para limpar o texto e Esc sem texto para fechar e devolver o foco ao botão do filtro.
- CA-15 QUANDO a pessoa fecha o popover O SISTEMA DEVE zerar o texto da busca e NÃO DEVE gravá-lo na URL.
- CA-16 ONDE o filtro aparece na folha mobile O SISTEMA DEVE oferecer o mesmo campo de busca e as mesmas regras de CA-10 a CA-15 dentro da folha.
- CA-17 O SISTEMA DEVE preencher cada filtro de lista (Equipe, Tipo, Sistema, Prioridade, Projeto, Subgrupo, Subtarefa) só com opções lidas do dado real, sem lista fixa no código.
- CA-18 O SISTEMA DEVE exibir as opções em ordem alfabética estável.
- CA-19 ENQUANTO as opções carregam O SISTEMA DEVE mostrar o botão desabilitado com "carregando…", reservar a altura da barra e NÃO DEVE provocar salto de layout.
- CA-20 SE a lista chega vazia ENTÃO O SISTEMA DEVE manter o filtro visível e desabilitado com "sem opções" e exibir a frase de vazio.
- CA-21 SE o carregamento das opções falha ENTÃO O SISTEMA DEVE exibir "<Rótulo>: indisponível", mensagem com `role="alert"` ao abrir e o botão "Tentar de novo", sem esconder os números do painel.
- CA-22 SE o nome de uma opção é longo ENTÃO O SISTEMA DEVE cortar com reticências no botão (nome completo em `title` e `aria-label`) e quebrar em linhas na lista, sem rolagem horizontal.
- CA-23 O SISTEMA DEVE manter alvo de toque mínimo de 24×24 px, foco visível e contraste 4,5:1 em todos os controles novos.

2ª rodada (a partir do CA-24):

- CA-24 O SISTEMA DEVE exibir o rótulo "Equipe" (e "Sem equipe") em todo filtro, chip, aviso e mensagem do produto, e NÃO DEVE exibir "Time" nem "Sem time" como rótulo de equipe.
- CA-25 O SISTEMA DEVE exibir, no cabeçalho de cada cartão de gráfico ou tabela de dado dos painéis, um botão com texto visível "Recolher".
- CA-26 QUANDO a pessoa aciona "Recolher" O SISTEMA DEVE ocultar o corpo do cartão, manter título e botão, trocar o texto do botão para "Expandir", definir `aria-expanded="false"` e exibir uma linha de resumo do cartão.
- CA-27 QUANDO a pessoa aciona "Expandir" O SISTEMA DEVE exibir o corpo do cartão, trocar o botão para "Recolher" e definir `aria-expanded="true"`.
- CA-28 QUANDO a pessoa aciona "Recolher" ou "Expandir" O SISTEMA DEVE manter o foco no mesmo botão.
- CA-29 QUANDO a pessoa volta ao painel no mesmo navegador O SISTEMA DEVE exibir cada cartão como ela o deixou (recolhido ou aberto), por cartão, sem gravar nada na URL e sem alterar os filtros.
- CA-30 ENQUANTO ao menos um cartão do painel está recolhido O SISTEMA DEVE exibir "Restaurar cartões recolhidos" e, ao acioná-lo, expandir todos os cartões do painel e apagar a memória das escolhas.
- CA-31 SE o cartão recolhido está em erro de carregamento ENTÃO O SISTEMA DEVE exibir na linha de resumo "Não foi possível carregar este cartão." em vez do total.
- CA-32 O SISTEMA NÃO DEVE exibir na linha de resumo de cartão recolhido números por pessoa, por equipe ou por setor.
- CA-33 QUANDO o AP-PROJETO tem mais de 10 projetos no recorte filtrado O SISTEMA DEVE listar os 10 com mais horas, em ordem decrescente (empate em ordem alfabética), com "Mostrando os 10 projetos com mais horas, de N.".
- CA-34 QUANDO o AP-PROJETO tem mais de 10 projetos O SISTEMA DEVE exibir "Demais N-10 projetos: X h" com a soma das horas dos projetos fora dos 10 e o botão "Ver todos os N projetos".
- CA-35 QUANDO a pessoa aciona "Ver todos os N projetos" O SISTEMA DEVE listar todos os projetos numa região com rolagem própria de altura máxima 360 px, focável por teclado, trocar o botão para "Ver só os 10 maiores" com `aria-expanded="true"` e manter o foco no botão.
- CA-36 QUANDO o AP-PROJETO tem 10 projetos ou menos O SISTEMA DEVE listar todos e NÃO DEVE exibir o botão nem a linha "Demais".
- CA-37 O SISTEMA DEVE aplicar os filtros do painel antes de escolher os 10 maiores do AP-PROJETO.
- CA-38 QUANDO a pessoa reabre o painel O SISTEMA DEVE exibir o AP-PROJETO com os 10 maiores, mesmo que antes ela tenha acionado "Ver todos" (hipótese).
- CA-39 O SISTEMA DEVE exibir um filtro "Setor", com valor inicial "Todos", no bloco Fluxo do Resumo e nos painéis do fluxo (BusinessMap) FL1, FL2 e FL3.
- CA-40 O SISTEMA DEVE listar no filtro Setor exatamente sete opções, em ordem alfabética: Ciência de Dados; Desenv Sistemas Plataformas Digitais - Gerencial; Escritório de Processos e Projetos; Marketing e Vendas; Plataformas; Sistemas Corporativos; Sistemas de Vendas e Operações.
- CA-41 O SISTEMA NÃO DEVE exibir o sobrenome do responsável de um setor em botão, lista, chip, `title`, `aria-label`, anúncio de leitor de tela nem URL.
- CA-42 O SISTEMA NÃO DEVE listar "AI Iniciatives" como opção do filtro Setor.
- CA-43 O SISTEMA NÃO DEVE exibir o filtro Setor no bloco Sustentação nem em painéis do Acelerato.
- CA-44 QUANDO a pessoa marca um ou mais setores O SISTEMA DEVE restringir os números e a tendência do painel aos cards desses setores e manter o filtro Equipe combinado por interseção.
- CA-45 ENQUANTO dois ou mais setores estão marcados O SISTEMA DEVE exibir "Resultado consolidado de N setores. O sistema não compara setores." e um único conjunto de números.
- CA-46 O SISTEMA NÃO DEVE exibir setores lado a lado, ranking de setores, série por setor em gráfico nem tabela com uma linha por setor.
- CA-47 SE a seleção de setores (com ou sem equipe) tem menos de 20 itens na janela ENTÃO O SISTEMA DEVE não publicar percentis e informar "Menos de 20 itens na janela (N). Os percentis não são publicados.".
- CA-48 O SISTEMA DEVE oferecer no filtro Setor a busca, o teclado e os estados (carregando, vazio, erro) de CA-10 a CA-22.
- CA-49 QUANDO a pessoa marca um setor no Resumo O SISTEMA DEVE alterar apenas o bloco Fluxo e não alterar o bloco Sustentação.

## Perguntas abertas (uma por vez, para o dono; `R-DECISAO`)
Decididas em 2026-11-11: Q-1 (busca em toda lista), Q-2 (rótulo: Equipe, 14:08), Q-3 (nota "Outra área" junto da capacidade), Q-4 (equipe pelo card; "Sem equipe"), Q-5 (opções de toda a base), P-097-B (Tipo = categoria).
- Q-6 O "Todos" do filtro Setor inclui os cards do quadro AI Iniciatives, que fica fora da lista de opções? Recomendação: sim, "Todos" continua igual ao de hoje (os números atuais não mudam) e AI Iniciatives só não é opção para filtrar. Alternativa: "Todos" passa a somar só os 7 setores.
- Q-7 O Apontamento (horas dos cards do BusinessMap) também ganha o filtro Setor? Recomendação: sim, desde que o card se ligue ao quadro (arquiteto confirma); o protótipo não o mostra na aba Apontamento.
- Q-8 Os cartões de número único (KPI) ficam sem o botão de recolher? Recomendação: sim, só gráficos e tabelas recolhem.
- Q-9 "Ver todos" do AP-PROJETO deve ser lembrado como o recolher? Recomendação: não, volta a 10 (CA-38).

## Validação
Roteiro para o dono abrir `docs/ux/prototipos/097-filtros.html` no navegador:
1. Aba Resumo: no bloco Fluxo, marque um Setor e uma Equipe; veja que o bloco Sustentação não muda e que ele não tem Setor. Marque "Ciência de Dados" (14 itens) e leia o aviso de menos de 20 itens. Marque dois setores e leia o aviso consolidado. Confira que o rótulo é "Equipe" e que a lista de setores não mostra sobrenome.
2. Aba Apontamento: confira "Equipe" no lugar de "Pessoa". Recolha "Horas por projeto", recarregue a página e veja que continua recolhido; use "Restaurar cartões recolhidos". Reabra o cartão e use "Ver todos os 24 projetos" e "Ver só os 10 maiores".
3. Aba Painel do fluxo: recolha um gráfico, troque o Setor e veja que o resumo do cartão acompanha.
4. Aba "Busca e estados": digite "integ", "xyz", "financeiro"; use setas, Enter e Esc; experimente muitos itens, nomes longos, vazio, carregando e erro.
Retorno do dono sobre a 2ª rodada: **aguardando o usuário** (sem frase literal registrada). Só depois dele a demanda vai para "Pronto para fazer".
