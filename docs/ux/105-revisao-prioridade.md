# Revisão de UX: classe pela prioridade nativa (105, E7.175)

parecer: aprovado com ressalvas (1 alto, 2 médios, 1 baixo). Nada crítico.
commit: 8ec2598e
Método: leitura do código (`lido`); sem ferramenta de medição. Itens de acessibilidade abaixo são todos `lido`; o QA mede (@axe).

## O que está certo
- Rótulos "Prioridade", "Crítica, Alta, Média e Baixa" em T1, T2, T4 e T6 (rótulos de linha, seletor, legenda e tabela). Nenhum "classe de serviço" nem "etiqueta" em código não-teste de `web/src` (Grep). `lido`
- Faixa "Sem prioridade" presente nos seis cartões (O6, O24, T1, T2, T4, T6) com `data-testid` por cartão; nunca é somada à Média. `lido`
- T2: prazo "SLE ainda não definido para esta prioridade" (n >= 20) separado de "Amostra insuficiente" (n < 20); nota explica que o SLE fica não definido até o dono aprovar e que os 60 dias recomeçam na troca de critério. `lido`
- O24: nota diz que usa só a Média e que cartão sem prioridade não entra e é contado à parte. `lido`
- Texto simples, sem jargão novo.

## Achados

### Alto
**A1. A faixa "Sem prioridade" mostra só um número absoluto, sem proporção e sem dizer o que ele não significa.**
Onde: `web/src/components/ui/SemPrioridade.tsx`, usado nos seis cartões.
Por quê: o texto é "N cartões ficaram fora da separação por prioridade". A pessoa não sabe se N é grande ou pequeno (falta o total) e nada diz que o cartão foi trabalhado e entregue normalmente, só não tem prioridade preenchida. O dado do assistente mostra que isso é 34% dos entregues e 47% dos criados em novembro, concentrado em dois quadros e no tipo Enabler. Com 276 ou 85 cartões lidos sem referência, o risco é duplo: ler "o time não entregou" ou ignorar uma faixa que é quase metade da base. O contrato guarda só `{ n }` (`packages/contratos/src/schemas.ts:53`, `tambem.ts:136`).
Correção: (1) o contrato passa a trazer o total do mesmo universo e o componente mostra "N de M (P%)". (2) Microcopy sugerida: "Sem prioridade: 85 de 252 entregues (34%). Esses cartões foram trabalhados e entregues; só não têm prioridade preenchida no BusinessMap, por isso ficam fora da separação acima." (3) Quando P for 20% ou mais, destacar (fundo de aviso, ícone e texto, não só cor) em vez de `text-sm text-texto-2`.

### Médio
**M1. A unidade da faixa é ambígua entre cartões.** O mesmo "cartões" vale para entregues (T1, T2), criados (T4), inícios (O24), itens (T6) e O6. A pessoa lê o mesmo texto com bases diferentes. Correção: o componente recebe o universo ("entregues", "criados", "iniciados") e o escreve na frase. `lido`

**M2. T4 pode induzir leitura errada da razão chegada/vazão.** Com 47% das criações sem prioridade, a chegada por prioridade está subestimada e a razão parece mais saudável do que a realidade. A faixa fica depois do seletor e do link para T1, longe da tabela de razão. Correção: mover a faixa para logo abaixo da tabela de razão no T4 e acrescentar "A chegada total é maior que a soma das prioridades acima." (como a faixa, só com a contagem real). `lido`

### Baixo
**B1. Sem pista de onde está a concentração.** A causa é concentrada (quadros de Ciência de Dados e Marketing e Vendas; tipo Enabler). Ao filtrar por esses quadros, a faixa maior que as barras deixa o cartão quase vazio sem explicar. Sugestão: quando nenhuma prioridade publica e a faixa é a maioria, a leitura do cartão deve dizer "A maior parte dos cartões deste recorte está sem prioridade" em vez de só "Nenhuma prioridade tem amostra suficiente" (T1, T2). Hipótese, a validar com o dono: esses times usam ou não o campo (ver ACHADOS do assistente, seção 4).

## Acessibilidade (`lido`)
- A faixa é texto (`<p>` com `<strong>`), não depende de cor; leitor de tela lê na ordem. Cor `text-texto-2` em `text-sm`: contraste sem medição, o QA mede.
- Se o destaque de A1 usar cor, manter o texto "Sem prioridade:" e o número como portadores da informação.

## Perguntas ao dono (R-DECISAO, uma por vez, com recomendação)
1. Mostrar a proporção ("N de M, P%") na faixa? Recomendo sim; exige o total no contrato.
2. A frase de que o cartão foi entregue, só sem prioridade, entra na faixa ou só na nota? Recomendo na faixa, curta.
