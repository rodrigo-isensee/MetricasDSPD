# Aviso de registro de horas incompleto (pedido 063, E1.2, cartão K-200)

Especificação de UX do aviso na aba Apontamento. Base: `docs/ux/059-aba-apontamento.md`, `docs/ux/059-aba-apontamento-textos.md` e `web/src/features/apontamento/ApontamentoPage.tsx` (faixa `AvisoNomeReal`, `CabecalhoPainel`, `CartaoDistribuicao`). Aguarda validação do dono (E1.3) antes de qualquer código. Não depende do plano do arquiteto (E1.1): descreve a tela e declara o que precisa dos dados.

## Objetivo
Cinco cards do BusinessMap têm mais registros de horas do que a coleta consegue buscar de uma vez, então as horas deles estão incompletas na base. Quem lê a aba precisa saber disso para não tratar o total como completo. O aviso diz o fato, sem estimar quanto falta, e some sozinho quando a coleta, lendo todas as páginas do registro de horas (D-5), completar o card.

## Personas / contexto de uso
Qualquer pessoa que acompanha o painel (decisão do 059), em desktop ou celular, ao abrir a aba para olhar horas por projeto, tipo e capacidade. Uso eventual. Ninguém precisa agir: o aviso informa, não cobra.

## Fluxo
1. A pessoa abre a aba. Se houver card incompleto no recorte, vê a faixa de aviso no topo, abaixo da legenda da finalidade, e a marca no projeto afetado.
2. Pode abrir "Ver quais cards" na faixa: lista de cards (identificador do card e projeto), sem pessoa.
3. Quando a coleta completar o card, o próximo carregamento da aba vem sem o sinal e o aviso e as marcas desaparecem. Nada fica gravado no navegador.
4. Alternativas: sem card incompleto, nada aparece (sem faixa de "tudo certo"). Erro ao carregar o sinal: ver Estados.

## Telas

### Lugar 1: faixa-resumo na aba (principal)
- Posição: dentro do `CabecalhoPainel`, logo abaixo de `LegendaFinalidade` e acima da barra de filtros. Não fica no topo da página: o topo é reservado ao aviso de nome real, que é de privacidade e tem precedência.
- Wireframe:
```
[i] Registro de horas incompleto em {n} cards
    As horas apontadas nesses cards estão incompletas, então os totais
    desta aba podem estar abaixo do real. Estamos buscando o restante.
    [Ver quais cards v]
```
- Componente: faixa fixa no mesmo padrão visual de `AvisoNomeReal` (ícone mais texto, `role="status"`), em tom neutro-informativo (não vermelho, não semáforo). Não dispensável.
- Escopo do número: conta os cards incompletos que afetam o recorte atual (período e filtros de Projeto, Tipo, Mês). Se os filtros deixarem nenhum card incompleto no recorte, a faixa some. Hipótese: o back-end filtra; se não der, a faixa mostra o total geral e o texto troca "neste recorte" por nada. Pergunta ao arquiteto na integração.
- Lista expandida ("Ver quais cards"): botão com `aria-expanded`; cada linha mostra identificador do card, título do card do BusinessMap e projeto (iniciativa raiz). Nunca mostra pessoa, nem horas, nem quantidade de registros que faltam. Hipótese: título do card do BusinessMap pode ser exibido (a restrição de título vale para o Acelerato); o dono confirma.

### Lugar 2: marca no projeto (cartão "horas por projeto", `ap-projeto`)
- A linha do projeto que contém card incompleto ganha, ao lado do rótulo, o selo "Horas incompletas" (ícone mais texto) com dica focável: "Há card deste projeto com registro de horas incompleto. A soma pode estar abaixo do real."
- Se o projeto tiver mais de um card incompleto, o selo é o mesmo; o detalhe está na lista da faixa.
- Sem destaque por cor ou posição: o selo não reordena nem muda o tamanho da barra. A linha continua na ordem normal do cartão.
- Hipótese: nos cartões por tipo e subgrupo não há marca (o card incompleto afeta qualquer recorte); basta a faixa. Se o dono quiser a marca neles, vira nota no "Como ler" de cada cartão.
- A tabela alternativa ("Ver como tabela") ganha a coluna "Observação" com "Horas incompletas" na mesma linha, para leitor de tela e para quem não vê o selo.

### Lugar 3: nota no cartão de KPIs (`ap-kpis`)
- Linha curta no rodapé do cartão, só com card incompleto: "Totais de horas podem estar abaixo do real: veja o aviso no topo." Aponta para a faixa (âncora). Não repete o número.
- Não vai nos cartões de qualidade, capacidade nem mapa diário: o aviso fica em um lugar principal (faixa) e onde o total de horas é lido (KPIs, projeto). Hipótese a validar. Capacidade por pessoa usa horas, mas a marca por pessoa seria destaque individual; por isso fica de fora.

### Tela estreita (375 px)
- A faixa ocupa a largura inteira, texto quebra em linhas, sem rolagem horizontal. Ícone acima ou à esquerda, sem cortar o texto.
- "Ver quais cards" tem alvo de toque de pelo menos 44 px; a lista abre em coluna, uma linha por card (identificador, depois título, depois projeto, empilhados).
- O selo "Horas incompletas" no projeto quebra para a linha de baixo do rótulo; a dica abre por toque e fecha com toque fora ou Esc.
- A faixa não fica fixa na rolagem (não cobre conteúdo).

### Estados
- Carregando: a faixa não reserva espaço enquanto o sinal não chegou (o sinal vem junto da resposta da aba); sem salto, pois a faixa entra no mesmo carregamento que os cartões.
- Vazio (nenhum card incompleto): nenhuma faixa, nenhuma marca, nenhuma nota.
- Erro: se a aba carregou mas o sinal não veio (campo ausente), nada é exibido e a aba não quebra. Não se infere "completo" em tela: a ausência do campo não aparece como garantia.
- Sucesso/completo: ver CA-6.
- Sem permissão: não se aplica.

## Acessibilidade (WCAG 2.2 AA)
- Não depende de cor: ícone e texto na faixa e no selo; o tom é neutro e o contraste de texto é de 4.5:1 ou mais, o do ícone e da borda, 3:1 ou mais.
- Faixa com `role="status"` (anuncia ao entrar sem tirar o foco); o rótulo da seção pode incluir o aviso, como já ocorre com o nome real. Cuidado para não anunciar duas vezes: só um dos dois leva o texto completo.
- "Ver quais cards": botão nativo, `aria-expanded`, `aria-controls`, operável por Enter e Espaço; foco visível.
- Dica do selo: abre ao ativar o selo (clique, toque, Enter ou Espaço), não ao receber foco nem só ao passar o mouse; fecha com Esc; texto também na coluna "Observação" da tabela.
- Ordem de foco: faixa, botão da lista, filtros. Respeita `prefers-reduced-motion` (a expansão não anima ou usa animação mínima).

## Regras de conteúdo
- Linguagem simples: nada de "teto", "lote", "1000", "worklog", "paginação", "API" nem "loggedTime" em tela.
- Nenhum número estimado de horas, de registros ou de percentual faltante. O único número é a quantidade de cards (fato contado, não estimativa).
- Nenhuma pessoa, ranking, ordenação nem destaque por pessoa. O aviso é sobre cards e projetos.
- Não promete prazo ("em breve", "amanhã"). "Estamos buscando o restante" descreve a intenção sem data; ver pergunta Q-1.
- Não escreve nada no BusinessMap; é só leitura e exibição.

## Necessidades de dados
Para o back-end (o contrato é do back-end; o sinal e a origem são da E1.1):
- Na resposta da aba: lista de cards com registro incompleto, cada um com identificador, título e rótulo do projeto (iniciativa raiz, com "Fora dos quadros coletados" onde couber), e o total de cards incompletos no recorte.
- Por linha do cartão `ap-projeto`: indicador booleano "contém card incompleto".
- O sinal deve deixar de existir quando a coleta (leitura de todas as páginas, D-5) marcar o card como completo; o front não guarda nem decide isso.
- Nada de pessoa nem de horas faltantes nesses campos.

## Microcopy
| Onde | Texto |
|---|---|
| Título da faixa (n = 1) | "Registro de horas incompleto em 1 card" |
| Título da faixa (n > 1) | "Registro de horas incompleto em {n} cards" |
| Corpo da faixa | "As horas apontadas nesses cards estão incompletas, então os totais desta aba podem estar abaixo do real. Estamos buscando o restante." |
| Botão da lista | "Ver quais cards" / "Ocultar lista de cards" |
| Cabeçalhos da lista | "Card", "Projeto" |
| Selo no projeto | "Horas incompletas" |
| Dica do selo | "Há card deste projeto com registro de horas incompleto. A soma pode estar abaixo do real." |
| Coluna da tabela alternativa | "Observação", valor "Horas incompletas" |
| Nota nos KPIs | "Totais de horas podem estar abaixo do real: veja o aviso no topo." |
| Como ler (acrescentar em `ap-kpis` e `ap-projeto`, só com sinal) | "Cards com registro de horas incompleto entram nos totais só com o que já foi coletado." |

## Perguntas ao dono (uma por vez, com recomendação)
- Q-1 (texto): manter "Estamos buscando o restante" no corpo da faixa? Recomendação: sim, sem prazo. Decidido pelo dono em 2026-11-03 (E1.3). Pela D-5, a coleta lê todas as páginas de cada consulta e o aviso some quando a coleta completa o card; a divisão por período é só contingência e não muda o texto.
- Q-2 (conteúdo da lista): exibir título do card do BusinessMap na lista? Recomendação: sim, só identificador mais título; é fonte BusinessMap e não envolve pessoa.
- Q-3 (lugar): faixa no cabeçalho mais marca no projeto e nota nos KPIs, conforme acima? Recomendação: sim.

## Critérios de aceite
- CA-1 QUANDO a resposta da aba traz ao menos um card com registro incompleto no recorte O SISTEMA DEVE exibir, abaixo da legenda da finalidade, a faixa "Registro de horas incompleto em {n} cards" (singular com n = 1) com ícone e o corpo de microcopy.
- CA-2 QUANDO a pessoa aciona "Ver quais cards" O SISTEMA DEVE expandir a lista com identificador, título e projeto de cada card, marcar `aria-expanded="true"` e não exibir pessoa, horas nem quantidade faltante.
- CA-3 QUANDO um projeto do cartão `ap-projeto` contém card incompleto O SISTEMA DEVE exibir o selo "Horas incompletas" (ícone e texto) na linha dele, sem alterar a ordem nem o tamanho da barra, e a coluna "Observação" na tabela alternativa.
- CA-4 QUANDO a pessoa ativa o selo (clique, toque, Enter ou Espaço) O SISTEMA DEVE abrir a dica completa ao ativar o selo (e não ao receber foco), e fechá-la com Esc.
- CA-5 ENQUANTO a faixa está visível O SISTEMA DEVE mantê-la sem botão de dispensa e sem ocultação pela preferência "Ocultar cartões".
- CA-6 QUANDO a resposta da aba deixa de trazer card incompleto (a coleta completou o card) O SISTEMA DEVE remover a faixa, os selos e a nota dos KPIs no mesmo carregamento, sem guardar o aviso no navegador.
- CA-7 SE os filtros ativos deixam nenhum card incompleto no recorte ENTÃO O SISTEMA DEVE ocultar a faixa e os selos (sujeito à hipótese de recorte do Lugar 1).
- CA-8 O SISTEMA DEVE não exibir nos textos do aviso os termos "teto", "lote", "1000", "worklog", "paginação" nem valor estimado de horas, registros ou percentual.
- CA-9 ONDE a tela tem 375 px de largura O SISTEMA DEVE quebrar o texto da faixa e da lista sem rolagem horizontal da página, com alvo de toque de 44 px no botão "Ver quais cards".
- CA-10 O SISTEMA DEVE transmitir o aviso por ícone e texto, com contraste de 4.5:1 no texto, sem depender de cor, e anunciar a faixa por `role="status"` uma única vez.
- CA-11 O SISTEMA DEVE não exibir o aviso, o selo nem a lista associados a pessoa, ranking ou ordenação por pessoa.
- CA-12 SE o campo do sinal estiver ausente na resposta ENTÃO O SISTEMA DEVE exibir a aba normalmente, sem faixa e sem erro visível.
