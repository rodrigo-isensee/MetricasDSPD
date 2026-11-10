# 077 · Tendências do Resumo com dado real: especificação curta (E2.0)

Autor: ux-designer, 2026-11-06. Base: `docs/analises/077-desenho.md`; leitura da develop em `/home/rodrigoisensee/MetricasDSPD-056d` (f21220fe). Decisões do dono (2026-11-06): P-077-1 "A", P-077-2 "A", P-077-3 "A". Sem protótipo novo: nenhum layout muda, só os estados de pontos e a nota; os componentes existentes cobrem tudo (nenhum componente novo). Não há dado de pessoa em nenhuma peça.

## Objetivo
Quando as tendências passam a ler a base real, a pessoa precisa distinguir três coisas sem ambiguidade: ponto publicado, ponto não publicado por poucos itens, ponto não publicado porque a janela de 12 semanas começa antes da primeira carga (janela incompleta). Na tendência de SLA, deve ver a mesma ressalva que o S2 já mostra. A virada de "Sem dado real" para série real fica marcada como mudança de critério.

## Contexto de uso
Resumo do Operacional (BusinessMap) e da Sustentação (Acelerato), desktop e mobile, consulta semanal. Cada tendência continua de uma só fonte; fluxo e sustentação nunca no mesmo gráfico.

## 1. Janela incompleta (P-077-1)
Regra do dono: ponto cuja janela de 12 semanas começa antes da primeira carga não publica e mostra "janela incompleta". Vale para as séries de linha (P50/P85 do fluxo e SLA da sustentação). As barras de contagem (concluídos, abertos) não dependem da janela de 12 semanas e seguem como estão (a contagem é do mês-calendário; ADR 0019 item 5).

- **No gráfico:** o ponto não tem valor: marcador vazado sobre o eixo do mês, sem linha ligando e **nunca plotado como zero** (mesmo padrão do `insuficiente` de hoje no `SerieMensal`, `forma="linha"`). A linha quebra no ponto e retoma depois.
- **Distinção de causa sem depender de cor:** o texto do ponto diz o motivo. Dois motivos, dois textos:
  - Poucos itens (já existe): "Poucos itens (n=14). Estatística não publicada."
  - Janela incompleta (novo texto, mesmo lugar): "Janela incompleta: o histórico carregado começa em 14/08/2026, depois do início da janela de 12 semanas. Estatística não publicada."
  - Se os dois motivos valem, mostrar só "janela incompleta" (é a causa anterior e não se resolve com mais itens).
- **Texto de apoio (lista abaixo do gráfico, `data-testid={id}-sem-valor`, já existe):** a linha do mês vira "○ jul/2026 · Janela incompleta: o histórico começa em 14/08/2026. Estatística não publicada." O prefixo "○" é decorativo (`aria-hidden`); o motivo está no texto.
- **Subtítulo:** acrescentar uma frase fixa quando houver pelo menos um ponto assim: "Meses cuja janela de 12 semanas começa antes da primeira carga não são publicados." A frase some se nenhum ponto tem esse motivo.
- **Tabela ("Ver como tabela"):** coluna Situação: "não publicado · janela incompleta" (contra "n=14 · não publicado" para poucos itens); valor "—", Base (n) "—" quando não calculada.
- **Resumo para leitor de tela (`figcaption`):** "jul/2026: janela incompleta (histórico começa em 14/08/2026)".
- **Vazio da série:** se todos os pontos de linha são não publicados, vale o texto de vazio existente; acrescentar "ou a janela de 12 semanas ainda é incompleta" quando ao menos um ponto tem esse motivo. Fluxo: "Ainda não há histórico suficiente: nenhum dos últimos 6 meses atinge 20 itens com a janela de 12 semanas completa." Sustentação: "Ainda não há histórico suficiente: nenhuma prioridade teve 20 chamados ou mais, com a janela de 12 semanas completa, em nenhum dos últimos 6 meses."
- **Necessidade de dados:** por ponto, indicador do motivo de não publicação (`poucos-itens` ou `janela-incompleta`) e, no segundo caso, a data da primeira carga. Contrato é do back-end; o UX só pede que o motivo chegue por ponto, não um booleano.

## 2. Ressalva do S2 na tendência de SLA (P-077-2)
- **Texto reaproveitado, sem reescrever:** `TEXTO_NOTA_SUSTENTACAO['excecao-sla-sem-fonte']` (`packages/contratos/src/origem.ts:168`): "Exceção de SLA por registro posterior sem fonte: todo chamado fechado conta como apurável." A web lê do contrato (`TEXTO_NOTA_QUALQUER`), nunca duplica o texto.
- **Padrão do S2:** o `CartaoMetrica` mostra a nota como item de lista logo abaixo da pergunta, texto `text-xs text-texto-2`, ícone `info` de 14px à esquerda (`data-testid=notas-cartao-<codigo>`). Na tendência, mesmo visual, em lista própria **entre o subtítulo e o gráfico** da série de SLA (`tendencia-sustentacao-sla`), `data-testid="notas-tendencia-sla"`.
- **Só na série de SLA.** A série de volume (chamados abertos) não leva a nota: ela não depende do SLA.
- **Condição:** aparece quando o resultado traz `notas` com `excecao-sla-sem-fonte` (campo opcional do L3). Sem nota no resultado, nada aparece (a web não decide sozinha). Como a nota é herdada de todos os pontos mensais, aparece uma vez por série, não por ponto.
- **Na tabela alternativa:** a nota permanece visível (está fora do gráfico e da tabela), sem repetição.
- **Se a série de SLA estiver vazia:** a nota continua visível acima do texto de vazio? Não: com a série vazia não há leitura a ressalvar; a nota não aparece e o vazio fala sozinho.
- **Se a pessoa ocultar o S2** nas preferências (`estaOculto('s2')`): a série e a nota somem juntas (já é o comportamento da série).
- Componente novo: nenhum. Reuso do ícone `info` e do estilo da lista de notas; o L3 pode extrair a lista de notas do `CartaoMetrica` num pequeno subcomponente compartilhado se o tech-lead preferir, mas a spec não exige.

## 3. Marca de critério da passagem para dado real (P-077-3)
- Reuso do mecanismo de T2.6 já presente em `SerieMensal`: linha vertical rotulada com a data no eixo (`marcas`) e a linha "⚑ Mudança de critério em DD/MM/AAAA: <descrição>" sob a série (`data-testid="marcador-criterio"`). Nenhum componente novo, nenhuma mudança no `AvisoCriterio` (a faixa do `AvisoCriterio` é do cartão; as tendências usam a lista da `SerieMensal`).
- Descrição sugerida (microcopy): "Tendência passou a usar dado real; os meses anteriores ao primeiro dado real não são publicados." Quem registra a `VersaoCriterio` é o back-end; o texto é proposta para o desenho.
- **Posição:** a marca cai no primeiro mês em ou depois da data (regra `mesDaMarcacao` atual). Em ambas as tendências (fluxo e sustentação) e nas duas séries de cada uma.
- **Observação de consistência:** como os meses anteriores à primeira carga já não publicam (seção 1), a marca fica normalmente junto do primeiro ponto publicado; não há comparação antes e depois a alertar além do texto da lista.
- Quando a série cruza a marca, o cartão do Resumo mostra o `AvisoCriterio` do cartão **apenas se já o faz hoje**; esta spec não altera isso.

## 4. Estados
Para cada série: carregando (esqueleto, já existe) | sem dado real (`EstadoSemDadoReal`, já existe; deixa de acontecer após L1/L2) | erro (`ErroTendencia` com "Tentar de novo") | vazio (textos da seção 1) | sucesso (com pontos publicados e não publicados misturados) | sem permissão (não se aplica: o Resumo já filtra por escopo antes).

## 5. Acessibilidade (WCAG 2.2 AA)
- O motivo de não publicação é texto, não só marcador vazado nem cor (1.4.1). O marcador vazado tem contraste de 3:1 contra o fundo (1.4.11); verificar na revisão.
- Gráfico com `role="img"` e `aria-label`; o resumo em `figcaption.sr-only` diz o motivo de cada ponto não publicado; "Ver como tabela" é o equivalente completo.
- Nota do S2 e linhas de motivo são texto estático legível por leitor de tela; sem tooltip como única fonte (a informação não depende de hover/foco no gráfico).
- Texto mínimo `text-xs` (12px) para notas, como já é nas notas do cartão; contraste de `text-texto-2` já validado nas notas existentes.
- "Ver como tabela" continua com alvo de toque mínimo e foco visível (já é `Botao`).
- Sem animação nova (`prefers-reduced-motion` não se aplica).

## 6. Microcopy
- Janela incompleta, ponto: "Janela incompleta: o histórico carregado começa em {data}, depois do início da janela de 12 semanas. Estatística não publicada."
- Janela incompleta, lista: "{mês} · Janela incompleta: o histórico começa em {data}. Estatística não publicada."
- Tabela, situação: "não publicado · janela incompleta".
- Subtítulo acrescido: "Meses cuja janela de 12 semanas começa antes da primeira carga não são publicados."
- Nota do S2 (texto do contrato): "Exceção de SLA por registro posterior sem fonte: todo chamado fechado conta como apurável."
- Marca de critério: "Mudança de critério em {data}: Tendência passou a usar dado real; os meses anteriores ao primeiro dado real não são publicados."

## 7. Critérios de aceite (EARS)
- `CA-1` QUANDO a janela de 12 semanas de um ponto mensal de linha começa antes da primeira carga O SISTEMA DEVE não plotar valor para esse mês (marcador vazado, sem linha ligando) e nunca plotá-lo como zero.
- `CA-2` QUANDO um ponto não é publicado por janela incompleta O SISTEMA DEVE listar abaixo do gráfico o texto "Janela incompleta: o histórico começa em {data}. Estatística não publicada." com o mês.
- `CA-3` QUANDO um ponto não é publicado por poucos itens O SISTEMA DEVE manter o texto "Poucos itens (n=N). Estatística não publicada." e não o texto de janela incompleta.
- `CA-4` SE um ponto tem poucos itens e janela incompleta ao mesmo tempo ENTÃO O SISTEMA DEVE mostrar apenas o motivo "janela incompleta".
- `CA-5` QUANDO a pessoa abre "Ver como tabela" O SISTEMA DEVE mostrar, para o ponto de janela incompleta, valor "—" e situação "não publicado · janela incompleta".
- `CA-6` QUANDO ao menos um ponto da série tem janela incompleta O SISTEMA DEVE exibir no subtítulo a frase "Meses cuja janela de 12 semanas começa antes da primeira carga não são publicados." e omiti-la quando nenhum ponto tem esse motivo.
- `CA-7` QUANDO todos os pontos de linha de uma série estão não publicados O SISTEMA DEVE mostrar o texto de vazio da série em vez do gráfico, sem botão de tabela.
- `CA-8` QUANDO o resultado de TENDENCIA_SUST traz a nota `excecao-sla-sem-fonte` e a série de SLA tem ao menos um ponto publicado O SISTEMA DEVE exibir, entre o subtítulo e o gráfico da série de SLA, o texto do contrato dessa nota, com o ícone de informação.
- `CA-9` QUANDO o resultado não traz a nota O SISTEMA DEVE não exibir a ressalva na tendência de SLA.
- `CA-10` O SISTEMA DEVE não exibir a ressalva do S2 na série de chamados abertos.
- `CA-11` ENQUANTO o S2 está oculto nas preferências O SISTEMA DEVE ocultar a série de SLA e a sua nota juntas.
- `CA-12` QUANDO a tendência passa a ser servida com dado real e existe `VersaoCriterio` da virada no período O SISTEMA DEVE marcar a data no eixo de cada série e listar "Mudança de critério em {data}: {descrição}" abaixo dela.
- `CA-13` O SISTEMA DEVE ler o texto da nota de `TEXTO_NOTA_SUSTENTACAO` do contrato e não duplicá-lo na web.
- `CA-14` O SISTEMA DEVE oferecer o motivo de cada ponto não publicado como texto (lista, tabela e resumo do gráfico), sem depender de cor ou de hover.
- `CA-15` O SISTEMA DEVE não exibir nenhum dado de pessoa nas tendências.

## 8. Perguntas abertas (hipóteses, não decididas)
- Hipótese: o texto da descrição da marca de critério (seção 3) é aceito pelo dono; ajustar na revisão se não for.
- Hipótese: o back-end consegue entregar o motivo por ponto e a data da primeira carga (ver "Necessidades de dados"); caso não, a lista usa só "Janela incompleta. Estatística não publicada." sem data.
