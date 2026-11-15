# Revisão de UX do K-341 (E4.97): linha sem projeto fixa embaixo no AP-PROJETO

Escopo: diff de `origin/fix/k324-concentracao` até `3e9fdd6f`, lido nos arquivos da worktree (sem shell: não rodei testes nem ferramenta de acessibilidade). Itens de acessibilidade marcados `lido`. Contra CA-33 e CA-34 de `docs/ux/097-filtros-time-busca.md`.

## Veredito
- CA-33: atendido (lido). `separarSemProjeto` tira a linha de `ID_SEM_PROJETO` antes de `dezMaiores`; as 10 vagas e o "de N" (`projetos.length`) contam só projetos. A linha é anexada por último em `linhas` (gráfico e tabela). Teste `sem-projeto-fixo.test.tsx` cobre 10 e 12 projetos e a posição na tabela.
- CA-34: atendido (lido). "Demais" (`corte.demais`), "Ver todos os N projetos" e "Mostrando todos os N projetos" saem de `projetos`, sem a linha. Com "Ver todos", a linha segue por último. Testes cobrem 10+linha (sem botão, sem "11 projetos"), 12+linha e Ver todos.
- Achado de concentração (decisão 1a): `horasSemProjeto` vira "À parte, X h ficaram sem projeto." sem tratar a linha como projeto; 0 h também é dito; valor inválido volta à frase antiga (lido).
- Frase de leitura (A1 da E4.72): `topo` filtra `ID_SEM_PROJETO`; só com a linha, não há frase (lido).
- Resumo recolhido: N sem a linha, horas com ela, texto "e horas sem projeto" (lido, coberto em `recolher.test.tsx`).

## A linha fixa se lê como fora da contagem?
Parcialmente. Está fora da contagem por posição e por número, mas nada na tela diz isso.

### Médio
1. Barra extra sem explicação. Com 12 projetos a tela mostra "Mostrando os 10 projetos com mais horas, de 12." e, logo abaixo, 11 barras (a 11ª é "Sem iniciativa", no mesmo gráfico, mesma cor e sem separação). Quem conta barras acha 11 e desconfia do texto. Onde: `CartaoDistribuicao.tsx`, `categorias` do `Barras` e rótulo de `rotuloLinha`. Correção: tirar a linha do `Barras` e mostrá-la como linha própria abaixo do gráfico ("Sem iniciativa, não conta como projeto: 50 h"), ou, no mínimo, rotular a barra "Sem iniciativa (fora da contagem de projetos)".
2. Ordem visual "Demais" depois da linha fixa. No DOM e na tela a sequência é 10 barras, "Sem iniciativa", "Demais 2 projetos: 5 h", botão. A linha fica entre os maiores e os "Demais", que é o que o CA-34 proíbe no espírito ("nunca entre os Demais"; "fixa embaixo da lista"); o texto literal passa, a leitura não. Correção: se a linha sair do gráfico (item 1), colocá-la depois da linha "Demais" e do botão, ou como último elemento do cartão antes da tabela.
3. Com "Ver todos", a região rolável (max 360 px) inclui a barra sem projeto: ao rolar, ela some do campo de visão. "Fixa embaixo" só vale se ela ficar fora da região rolável. Resolvido junto com o item 1 (linha fora do gráfico, depois da região).

### Baixo
4. Com 10 projetos ou menos não há texto de contagem; a linha sem projeto aparece como mais uma barra sem nota. Mesma correção do item 1.
5. Cobertura de teste olha só a tabela (`linhasDaTabela`), não o gráfico nem a ordem "Demais" x linha fixa. Se a correção acima for adotada, o QA precisa de teste de posição no DOM (CA-34: linha depois de `projetos-demais`).
6. A tabela mantém "Parte das horas" da linha sem projeto sobre o total com ela. Confirmo só o que li: o cálculo é do servidor; não avaliei a base do percentual.

## O que está bom
- Português e microcopy consistentes com o restante ("Demais 2 projetos", singular tratado).
- Selo de registro incompleto da linha sem projeto preservado na lista de selos.
- Região com rolagem mantém `tabIndex=0`, `role=region` e rótulo (lido; sem mudança nesse diff).
- Informação também na tabela de dados, sem depender de cor.

## Decisão pendente
As correções 1 a 3 mudam o desenho (linha fora do gráfico). Os CA-33 e CA-34 passam como estão; se o dono quiser que "se leia como fora da contagem", sugiro ajuste pequeno (linha própria abaixo do gráfico, depois de "Demais"), sem novo CA além de um para a ordem. Recomendo fazê-lo na mesma branch ou como cartão de acompanhamento, a critério do tech-lead; é decisão do dono (R-DECISAO).
