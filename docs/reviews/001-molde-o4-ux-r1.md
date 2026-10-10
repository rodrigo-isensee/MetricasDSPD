# Parecer de UX 001 - M-008: cartão O4 e shell como molde da fase B (r1)

Revisor: `ux-designer` · 2026-10-09 · Imutável.
Insumos: `docs/qa/001-fase-a.md` (develop @ 252bed4), `docs/qa/evidencias/fase-a/axe-resumo.json`, pareceres anteriores `001-fase-a-ux.md` e adendo, spec rev. 3.
Método e limite: li o parecer do QA e o resumo do axe. Não abri os PNGs nem o código neste parecer; a conferência de A1 a A8 e M1 a M10 baseia-se no que o QA reporta como coberto/aprovado e no r2 de code review. Itens sem evidência do QA seguem "não verificado" e estão marcados.

## Veredito: APROVADO COM RESSALVAS como molde

O shell e o cartão O4 podem ser copiados pela fase B, desde que os dois médios abertos (002, 003) e as ressalvas R1 a R4 abaixo sejam tratados antes ou junto das primeiras telas da fase B. Nenhum achado crítico ou alto.

## Evidência favorável
- axe (wcag2a, 2aa, 22aa): 0 violações em 31 execuções (9 rotas, 4 estados, 2 temas, overlays, 375 px).
- 71 de 78 E2E passam; as 7 falhas correspondem aos bugs 002 a 005 (todos de severidade média ou baixa).
- Reflow a 320 px sem rolagem horizontal; eixo X do O4 sem colisão (M6 resolvido no eixo X).
- Gate de bundle e fronteiras aprovado; F4 21 ms e INP 32 ms, adequados para troca de filtro.
- A7 parcialmente resolvido: altura do cabeçalho agora medida (`--h-cabecalho`) e `scroll-padding` acompanha.

## Achados por severidade

### Médio
- **R1 (bug 003). Barra de filtros não é sticky em nenhuma largura e o cabeçalho quebra em duas linhas até ~1200 px.** Era o A7 do parecer anterior; o `scroll-padding` correto evita foco oculto, mas a spec 2.4 pede a barra fixa. Por que importa: toda tela da fase B depende da barra para o contexto dos filtros. Correção: tornar a barra sticky com `top: var(--h-cabecalho)` e impedir a quebra (itens menores ou gaveta até 1280). Verificar em 1024, 1100, 1180 px.
- **R2 (bug 002). Estado vazio mostra também "Amostra insuficiente: 0 de 20".** Mensagem contraditória e erra a regra dos 20 itens; a fase B vai herdar nos 15 ou mais cartões. Correção: no vazio mostrar só o estado vazio.
- **R3. Eixo Y sem unidade escrita (reporte do QA, resíduo de M6).** Spec 4.0.4: unidade no eixo e no valor. Correção: título de eixo ou subtítulo do gráfico, feito no `GraficoBase` para valer a todos os cartões.

### Baixo
- **R4 (bugs 004, 005).** `equipe` não removida da URL ao marcar todas e `%2C` na vírgula; link da marca com 28 px a 375 px (mínimo 44 px abaixo de 768). Corrigir junto.
- **R5. Pendências de acessibilidade para a fase B:** navegação por setas nas barras (A11Y-16), teclado completo e A11Y-09 (tema forçado, escala de cinza) ficam abertos; o axe zerado não cobre foco, ordem ou "não só cor". Incluir no plano da fase B, não como bloqueio do molde.
- **R6. Instabilidade dos testes de orçamento (O1 a frio, tarefa longa C6, heap NaN).** Falha de medição dependente da máquina, não de interface; ajustar o orçamento ou isolar antes da pré-entrega.

### Não verificado por esta revisão (confirmar na reconferência)
- Se os altos A1 a A6 e A8 e os médios M1 a M5 do parecer anterior e do adendo estão fechados no código: o QA não os cita como falhos, e o r2 cobriu o delta, mas esta revisão não os reabriu. Os pontos que mais replicam e devem ser conferidos antes de copiar: selo/texto de janela derivados do DTO (A5), variante "lenta" de `AmostraInsuficiente` (A6, necessária para E1, T7 e EI), rótulo "em andamento" com legenda oculta (A8), mapa fixo tipo para cor e padrão (M5), `errorElement` dentro do shell, `Dica` por toque.

## O que a fase B deve COPIAR
- Anatomia do `CartaoMetrica` (pergunta, base, nota expansível, leitura, rodapé "Filtros aplicados / Não afetado por") e os quatro estados com o primeiro erro como `role="alert"`.
- Tabela alternativa por cartão com o alternador, gráfico com texto de leitura gerado do DTO.
- Filtros na URL com aplicação imediata, chips removíveis, aviso de consolidação "O sistema não compara equipes".
- Tema por tokens semânticos, selo "Dados fictícios" permanente, foco visível, `prefers-reduced-motion`.
- Medição da altura do cabeçalho em variável CSS.
- Os cenários E2E e a rotina axe por rota, estado e tema como critério de pronto de cada tela.

## O que a fase B deve EVITAR
- Texto de janela ou período escrito à mão no cartão; derivar sempre do parâmetro.
- Eixos sem unidade; cores de série que mudam com o filtro; empilhado distinguido só por cor.
- `text-xs` (12 px) em base amostral, meta e legenda.
- Alvos abaixo de 24 px (44 px abaixo de 768 px) em alternadores novos; usar um componente com `.alvo`.
- Mostrar mensagens de amostra insuficiente em estado vazio; usar a variante "lenta" para as métricas lentas.
- Propagar `?mock=` em links ou no "Copiar link" (spec 6.6).
- Copiar o cabeçalho que quebra de linha: corrigir R1 antes de multiplicar telas.

## Condição de aceite do molde
R1 e R2 corrigidos e reverificados pelo QA, R3 resolvido no `GraficoBase`, e a confirmação dos itens "não verificado" antes do primeiro cartão da fase B. Depois disso, a UX considera o molde fechado sem novo parecer; basta o registro do QA.

Parecer fechado: 2026-10-09 (hora não informada; o parecer do QA não traz hora e não há relógio disponível)
