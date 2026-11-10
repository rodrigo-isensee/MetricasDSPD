# 077 · Revisão de interface do Lote 4b (janela incompleta na tendência da sustentação), volta

pedido: 077-tendencias-dado-real
branch: feature/077-l4b-tela-janela-sust
commit: 0236c717c874000b6c96921aa7323afb88932a6a
revisor: ux-designer, 2026-11-07 (revisão incremental da volta)
método: só leitura de `GraficoMensal.tsx` (linhas 96-100 e 62-77), `modelo.ts` (`serieSla`, `fraseDaSerieSla`) e das linhas do pedido (volta de 13:13 e QA do 4b). Nada medido por mim (sem axe, sem render). Acessibilidade abaixo é `lido`, salvo o que cito como medido pelo QA.

## Veredito
Aprovado. A volta fecha o A-1 e o A-4 sem efeito novo na tela. Nenhum achado crítico, alto ou médio abertos. Restam baixos já conhecidos, nenhum bloqueia o QA nem a entrega.

## Conferência (lido)
- A-1 fechado: `serieSla` passa `motivo: 'sem prioridade avaliada'` só quando `av === 0`; `GraficoMensal` usa `janelaIncompleta` primeiro, depois `motivo`, depois "poucos itens". Os outros pontos sem valor seguem "poucos itens". Bate com a seção 6 e com o texto da lista ("Nenhuma prioridade com 20 chamados ou mais...").
- A-4 fechado: com janela incompleta a frase vira "Em julho, janela incompleta: ..." (vírgula, minúscula, um só dois-pontos). Os demais ramos mantêm "Em {mês}: {texto}" com um dois-pontos.
- Sem efeito novo: forma do marcador, tabela, lista, `role="img"`, `aria-label` e `aria-hidden` do `○` não mudaram; o motivo continua em texto (sem depender de cor, seção 5).
- A-2 (marcador em y=0): segue como estava; aceito, a forma e o texto do eixo distinguem.
- A-3 (n=0 na tabela): segue como estava.
- A-5 (data no vazio por janela incompleta): segue como estava, aberto.
- A-6: tratado; o QA mediu que o texto de 11 px cabe no cartão. A sobreposição de rótulos de mês a 320 px (A2 do QA) é anterior ao lote e vai ao lote 7.

## Achados
- A-1 (resolvido) GraficoMensal.tsx:99: o eixo diz "sem prioridade avaliada" só no ponto da SLA sem prioridade; os demais sem valor seguem "poucos itens".
- A-2 (baixo) GraficoMensal.tsx:101: marcador vazado em y=0, igual ao valor publicado "0 de m"; só forma e rótulo distinguem. Aceito, sem ação.
- A-3 (baixo) modelo.ts:286: ponto sem prioridade avaliada tem n: 0, e a tabela mostra "n=0". Preferir "—" na base ou "nenhuma prioridade avaliada". Segue aberto.
- A-4 (resolvido) modelo.ts:313: a frase da SLA com janela incompleta usa vírgula e minúscula, sem dois-pontos duplo.
- A-5 (baixo) SerieMensal.tsx:96-99: o vazio por janela incompleta não cita a data de início do histórico. Segue aberto; citar a data no vazio, no lote 7.
- A-6 (baixo) GraficoMensal.tsx:70: texto de 11 px sob o mês cabe no cartão (QA mediu). A sobreposição de rótulos a 320 px (A2 do QA) segue ao lote 7.
- A-7 (baixo) modelo.ts:315: o ramo "nenhuma prioridade avaliada" não é alcançado, pois valor null sai antes na linha 314. Código morto, sem efeito na tela; limpar no lote 7.
