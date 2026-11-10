# 077 · Revisão de interface do Lote 4a (janela incompleta no fluxo)

pedido: 077-tendencias-dado-real
branch: feature/077-l4a-tela-janela-fluxo
commit: 9342bc7aaef52c2b05773d11725c8bd5fdc4320c
revisor: ux-designer, 2026-11-07
método: só leitura de `SerieMensal.tsx`, `modelo.ts` e dos testes; nada medido (sem axe, sem render). Toda a acessibilidade abaixo é `lido`.

## Veredito
Aprovado com ressalvas. Nenhum achado crítico ou alto. A tela cumpre CA-2, CA-4 a CA-7 e CA-14 pela leitura do código. CA-1 e CA-3 ficam parciais (ver achados). O Lote 4a pode seguir para o QA.

## Conferência por critério (lido)
- CA-1: `valor: null` no modelo, nunca zero; o desenho do marcador vazado está em `GraficoMensal`, fora do diff: não conferido.
- CA-2: lista `-sem-valor` traz o mês e "Janela incompleta: o histórico começa em {data}. Estatística não publicada." Conforme.
- CA-3: lista mostra "poucos itens (n=14)" em minúsculas, sem "Estatística não publicada." Parcial (A-1).
- CA-4: `serieP85` testa a janela antes dos poucos itens. Conforme.
- CA-5: tabela com "—" no valor e na base e "não publicado · janela incompleta". Conforme.
- CA-6: frase fixa só com `janelaIncompleta`; vale com ou sem subtítulo. Conforme.
- CA-7: `semHistorico` troca gráfico por vazio e esconde o botão. Conforme (só `forma="linha"`).
- CA-14: motivo em texto na lista, na tabela e no `figcaption` sr-only; sem hover. Conforme.
- Seção 5: `○` com `aria-hidden`; `Botao` com texto; `role="img"` com `aria-label`. Contraste do marcador vazado (1.4.11): não medido.

## Achados
- A-1 (médio) SerieMensal.tsx:148-151 e modelo.ts:233: ponto de poucos itens aparece como "poucos itens (n=14)", sem a frase "Estatística não publicada." de CA-3; fica diferente do texto de janela incompleta. Usar a frase da seção 6 nos dois motivos.
- A-2 (baixo) modelo.ts:241: o texto do ponto "janela incompleta (histórico começa em ...)" não segue a microcopy da seção 6 ("... depois do início da janela de 12 semanas"). Só aparece no resumo sr-only e na frase; alinhar ou registrar a variação como decisão.
- A-3 (baixo) SerieMensal.tsx:59: o vazio com janela usa o texto do fluxo por padrão. A sustentação tem texto próprio na seção 1; o lote que a ligar deve passar `vazioJanela`, senão mostra "itens".
- A-4 (baixo) SerieMensal.tsx:141-155: a lista de motivos some quando `semHistorico`, mas o vazio não diz qual mês ou data; a data de início do histórico fica só na lista. Avaliar citar a data no vazio.
- A-5 (baixo) CA-1: não conferi o marcador vazado e a quebra da linha em `GraficoMensal`, fora do diff. O QA deve medir o contraste 3:1 (1.4.11) e confirmar que não há linha ligando.
