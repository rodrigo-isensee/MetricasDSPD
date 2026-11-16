---
tipo: revisao-ux
pedido: 105-melhorias-15-11
etapa: E7.92
branch: feature/105-t9-real
commit: 6b772b00
parecer: aprovado com ressalvas
revisor: ux-designer
data: 2026-11-16
---
# 105 · Revisão de UX do T9 com dado real (CartaoT9 e a nota nova)

Parecer: aprovado com ressalvas. Nenhum achado crítico ou alto. Tudo é `lido` (código e testes em 6b772b00); não rodei a interface nem medi contraste ou leitor de tela (o QA mede, `@axe`).

## A nota nova (`t9-nota-escopo`, `CartaoT9.tsx:43-49`)
- Explica a regra (frente adicionada = criada depois do início do projeto) e o limite (criada antes e ligada depois conta como original). Atende ao pedido de explicar a regra.
- Singular e plural tratados ("1 projeto ... ficou" / "3 projetos ... ficaram"), com teste. A frase de projetos sem início só aparece com `semInicio > 0`.
- Sem métrica proibida, sem pessoa, sem comparação entre times. Texto simples, sem número de dado além da contagem.

## Achados
### Médio
- **T9-1 · Todos os projetos sem início: a nota some e o cartão diz só "sem dados".** `t9.ts` devolve `projetos` vazio e `base.n = 0` quando nenhum projeto tem `iniciado_em`; `vazio.ts:14` marca o estado `vazio`; `CartaoMetrica.tsx:390-396` mostra só `EstadoVazio` e não renderiza os filhos, onde mora a nota. A pessoa não fica sabendo que N projetos ficaram fora por falta de data de início (heurística 1, visibilidade; 9, recuperar de erro). Isso é o caso extremo do que a nota quer informar. Correção: no estado vazio, quando `projetosSemInicio > 0`, mostrar a frase "N projetos sem data de início ficaram fora desta conta" junto do vazio (por exemplo `vazio` com complemento, ou `ehVazio` que não trate esse caso como vazio puro). Estado `vazio` com `projetosSemInicio = 0` segue como está. Testar o caso (hoje não há teste: ramos.test.tsx:247-269 só testa o estado ok). `lido`.
- **T9-2 · Escopo "cresceu 0,0%" quando não há frente original.** `t9.ts:57` devolve `crescimentoEscopoPct = 0` se `originais === 0`. Com a regra D-T9 "A" isso é plausível (projeto cujas frentes todas foram criadas depois do início). A linha fica "Escopo cresceu 0,0% (+3 frentes; 0 originais)", o que se contradiz, e o projeto cai no fim da ordem por crescimento, quando é o de maior mudança de escopo (heurística 2, correspondência). Correção de UX: quando `originais === 0 && adicionadas > 0`, mostrar "Escopo sem frente original (+3 frentes)", sem percentual; a ordenação é decisão do arquiteto (o percentual não existe: sugiro ir ao topo). Não inventei a regra: se o dono preferir outro tratamento, vira pergunta (`R-DECISAO`). `lido`.

### Baixo
- **T9-3 · A leitura resumida não trata o singular.** `CartaoT9.tsx:31`: "1 frentes foram adicionadas" e "1 de 1 frentes concluídas" com uma frente. A tabela trata o singular (`:103`); a leitura não. Correção: `frente/frentes` e `foi/foram` por contagem. `lido`.
- **T9-4 · "A base não guarda" é vocabulário técnico.** `CartaoT9.tsx:44-46`. Quem não é técnico lê "base" como base de cálculo. Texto sugerido: "O sistema não registra quando a frente foi ligada ao projeto; por isso a frente criada antes do início e ligada depois conta como original." A primeira frase ("Frente adicionada depois do início é a frente criada depois do início do projeto") repete "depois do início" três vezes; sugestão: "Contamos como adicionada a frente criada depois do início do projeto." Os testes comparam só a frase dos projetos sem início, então a mudança não os quebra. `lido`.
- **T9-5 · A nota diz só "sem data de início".** Não diz o que fazer (preencher a data de início no quadro). Sugestão: acrescentar "Preencha a data de início no quadro para incluí-los." Só se o dono confirmar que o início é preenchido por pessoas no BusinessMap (hipótese, não confirmada). `lido`.

## Estado sem dado e insuficiente
- Sem dado real: `propsCartao` passa `estado` do `useMetrica` e o cartão mostra `EstadoSemDadoReal` com o motivo; nenhuma tabela nem número aparece (`lido`, `CartaoMetrica.tsx:385-389`). Atende.
- Insuficiente: o T9 é censo ("k de n", `baseVariante="censo"`), sem percentil nem percentual do conjunto, de modo que o corte de 20 itens não se aplica; o código e `t9.ts:13` dizem isso. Atende (`lido`).

## Acessibilidade (WCAG 2.2 AA, `lido`)
- Padrões do cartão mantidos: tabela com `caption` `sr-only`, `th scope`, barras `aria-hidden` e o mesmo dado em texto na célula; legenda por textura além da cor (não depende só de cor). Região rolável nomeada.
- Contraste da textura e foco da região rolável: sem medição, fica para o QA.

## Risco registrado fora do escopo (E5)
- **T9-6 · Dois critérios para "adicionada depois do início".** `e5.ts:36` ainda conta `frentesAdicionadasAposInicio` por `adicionado_apos_inicio_pai`; o T9 agora usa `criado_em > iniciado_em`. Se E5 e T9 aparecerem na mesma tela ou reunião para o mesmo projeto, os números das frentes adicionadas podem divergir sem explicação (heurística 4, consistência). Severidade média como risco; fora do escopo deste PR, como o brief diz. Sugiro cartão próprio para alinhar o E5 ou rotular o critério dele. `lido`.

## Critérios cobertos pela entrega
Regra e limite explicados na nota: atende. Contagem de projetos sem início fora, singular e plural: atende (caso ok). Caso "todos sem início": não atende (T9-1). Estado sem dado real e censo: atende.

## Pendente para o usuário
Nenhuma validação de interface nova. Perguntas de produto abertas, se quiserem tratar: T9-2 (como mostrar projeto sem frente original) e T9-5 (o início do projeto é preenchido por quem, e o texto deve orientar o preenchimento?).
