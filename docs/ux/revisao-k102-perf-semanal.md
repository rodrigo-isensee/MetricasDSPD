---
tipo: revisao-ux
pedido: k102-perf-semanal
branch: fix/perf-visao-semanal
commit: aeacff4
parecer: aprovado com ressalvas
revisor: ux-designer
data: 2026-10-16
---

# Revisão de UX: K-102, fila de montagem dos gráficos

**Escopo:** `filaDeGraficos.ts`, `GraficoBase.tsx`, a seção 10 de `docs/tecnica/arquitetura-front.md` e os itens 4, 5 e "Revisão de UX" de `docs/reviews/k102-perf-semanal.md`. Revisão de leitura de código, contra a ADR 0001 (tabela equivalente), as heurísticas de Nielsen e a WCAG 2.2 AA. Não rodei o navegador, o leitor de tela nem o tema escuro (ver "Não verificado"). Nenhuma especificação nova.

**Veredito:** aprovado com ressalvas. Os quatro pontos pedidos passam. Há dois achados médios e dois baixos, nenhum bloqueia o PR.

## Pontos pedidos

| Ponto | Resultado | Base |
|---|---|---|
| Reserva de espaço (sem salto de layout) | passa | A caixa `height: altura` + `minHeight: 200` está no primeiro commit (`GraficoBase.tsx:27-33`); o gráfico entra dentro dela. A legenda fica abaixo da caixa e não se move. CLS medido igual ao anterior (0,018 / 0,004 / 0,067). |
| Ordem de leitura e foco | passa, com a ressalva U-1 | `figure`, `figcaption` e `aria-describedby` existem desde o primeiro commit; só o conteúdo da caixa muda. A ordem do DOM não muda. Nada recebe nem perde foco por programa (sem `focus()`). Ressalva: pontos de tabulação novos (U-1). |
| Anúncios repetidos no leitor de tela | passa | Nenhum `aria-live`, `aria-busy` nem `role="status"` no `GraficoBase`. O gráfico entra numa região que não é viva, então não há anúncio. A frase de leitura e a legenda já estão disponíveis antes do gráfico. Quando o gráfico é `densa`, a caixa é `aria-hidden` e continua assim. O `TooltipTema` evita `role="status"` de propósito. |
| `prefers-reduced-motion` | passa | Não há animação de entrada: o gráfico entra sem transição, e as séries usam `isAnimationActive={false}` (nos 5 componentes que usam o prop). `tokens.css:150` já zera animações no modo reduzido. Nada some: o gráfico aparece sempre, só em outro instante. |

## Achados

| # | Severidade | Onde | Problema | Correção sugerida |
|---|---|---|---|---|
| U-1 | médio | `GraficoBase.tsx:32` + Recharts (`accessibilityLayer` padrão; só `Dispersao.tsx:164` desliga) e `MapaCalor.tsx:19-21` (`role="region"` `tabIndex=0`) | Cada gráfico, ao montar, traz um ponto de tabulação (o SVG do Recharts) que não existia no primeiro commit. Quem já está navegando por teclado na página vê a ordem de tab ganhar paradas novas, algumas antes do foco atual, durante os primeiros instantes de carga. O foco não é roubado, mas a contagem de Tab até um controle muda enquanto a fila corre. Hipótese: o gráfico em si é a parada de teclado por design (a confirmar no navegador). | Aceitar para este cartão (a janela é de milissegundos a no máximo cerca de 1 s) e registrar. Se o QA medir a janela maior que 1 s com dados reais, avaliar `tabIndex={-1}` nos gráficos com tabela equivalente, decisão separada do K-102. |
| U-2 | médio | `GraficoBase.tsx:32` | Caixa vazia sem sinal de carregamento (Nielsen, visibilidade do status): por alguns instantes o cartão mostra um retângulo em branco de 200 a 260 px, e o cartão parece "sem dado" em vez de "carregando". Em máquina lenta ou com a aba voltando do segundo plano, a espera cresce com o número de gráficos (uma tarefa por gráfico, até 71 ms cada). O parecer do tech-lead pediu confirmar que isso é aceitável. Aceitável sem esqueleto enquanto a espera total ficar abaixo de cerca de 1 s. | Não exige código agora. Se a janela passar de 1 s em dispositivo lento (QA com CPU throttling 4x), mostrar o esqueleto que já existe no sistema (`brilho`, `tokens.css:177`), sem animar sob `prefers-reduced-motion`. Não usar `aria-busy` nem texto "Carregando" por gráfico, para não gerar anúncios. |
| U-3 | baixo | `filaDeGraficos.ts:48-58` (ordem de montagem) | A ordem não é a da página: vale a ordem de chegada dos dados. Um gráfico abaixo da dobra pode aparecer antes de um do topo, e o olho vê o conteúdo "pipocar" fora de sequência. | Aceitar. Melhoria futura: priorizar gráficos visíveis (IntersectionObserver). Fora do K-102. |
| U-4 | baixo | `filaDeGraficos.ts:52` (primeiro turno espera `requestAnimationFrame`) | Aba em segundo plano congela o rAF; ao voltar, o gráfico aparece só depois. Impressão (`Ctrl+P`) feita nos primeiros instantes sai com caixas vazias; o projeto não tem `@media print`. | Registrar como limitação conhecida. Sem ação agora. |

## Não verificado (para o QA, no roteiro dele)
- Tema escuro e largura de 320 px: a caixa vazia não tem borda nem fundo próprios no código lido, então não há contraste a medir; confirmar visualmente que não surge um retângulo destacado.
- Leitor de tela (NVDA ou Orca) com a carga em andamento: confirmar que nada é anunciado quando o gráfico entra, e que o modo de navegação não reposiciona o cursor virtual.
- Tabulação durante a carga, para dimensionar U-1 com dados reais.
- Com `prefers-reduced-motion: reduce` ligado no navegador, os gráficos aparecem do mesmo jeito, sem transição.

## Notas
- "Ver como tabela" não depende da fila (`GraficoBase.tsx:23` devolve a `TabelaDados` antes de olhar a vez), então a alternativa acessível (ADR 0001) fica disponível desde o primeiro commit. Isso sustenta a decisão de não ter esqueleto.
- Sem mudança de texto nem de fluxo; nenhuma regra inviolável tocada.
