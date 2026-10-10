# Métricas fora do núcleo · 03 Idear

Prototipado em `docs/ux/figma/prototipos/complementares-1280.html` e `-375.html` (tokens do design system, aviso "protótipo").

## Alternativas
**A. Seção recolhida "Mais métricas deste painel" ao fim de cada painel.** `<details>` fechado por padrão, com contagem ("8 complementares"), cartões no mesmo padrão agrupados por pergunta ("Por que demora?", "O que entra?", "Qualidade"). Cada cartão do núcleo ganha o link "Leia junto: O5, O8" que abre a seção e leva ao cartão. Prós: zero aumento do painel padrão, contexto preservado, sem rota nova, mesmo padrão de cartão. Contras: quem nunca desce não descobre; painel longo se abrir tudo. Esforço: baixo-médio.
```
Operacional  [Métricas: 9 de 9 (+8 complementares) v]
 (núcleo: 9 cartões)
 > Mais métricas deste painel · 8 complementares   (recolhido)
```
**B. Página "Catálogo de métricas" (`/metricas`)** com as 45 métricas do briefing (núcleo e complementares), painel de origem, status e link para o painel. Cartões não são plotados ali. Prós: resolve a descoberta e o "o que existe", serve ao DSPD; esforço baixo (tabela). Contras: sozinha leva o usuário a sair do contexto; não responde a pergunta.
**C. Complementares por opt-in no seletor "Métricas"** (grupo "Complementares", desligadas por padrão; ligar as exibe no próprio painel). Prós: painel só mostra o que a pessoa pediu. Contras: exige guardar o que está **ligado** (contrato do 007 guarda só ocultos, para métrica nova aparecer); quebra a regra "link compartilha só ocultos"; baixa descoberta. Esforço: alto.

## Matriz impacto x esforço
| | Impacto alto | Impacto baixo |
|---|---|---|
| Esforço baixo | B | n/a |
| Esforço médio | A | n/a |
| Esforço alto | n/a | C |

## Escolhida: A + B
A resolve a pergunta no contexto; B resolve a descoberta e o status. C descartada: conflita com o contrato de preferências.

## Interação com o pedido 007 (preferências)
1. A seção recolhida é **estado de disclosure por visita** (não é preferência): não entra no perfil nem no `ocultar`. Aberta/fechada vale na sessão do painel.
2. Complementares **entram no catálogo único de ids** do 007 com `grupo: "complementar"`. Podem ser ocultadas (`ocultar=o5`) como qualquer cartão; o seletor "Métricas" ganha o grupo "Complementares" e o contador "9 de 9 (+8)".
3. Dentro da seção recolhida, nada é filtrado por preferência além do `ocultar` normal; "Restaurar padrão" continua "mostrar tudo", e **tudo** significa também mostrar as complementares (que seguem dentro da seção).
4. Faixa "Pede atenção": complementares **não geram alertas** nesta fase (H3, D-3). Se geradas depois, valem as regras de segurança 1 a 3 do 007 (selo "métrica oculta").
5. Aviso de critério alterado em complementar oculta segue a regra 3 do 007.
6. Visão geral não lista complementares (H4 do 007).
7. Sem mudança no contrato `{versao, paineis:{p:{ocultar:[]}}}`.

## Estados por cartão complementar
disponível (cartão normal, com base e fonte) | amostra insuficiente (<20: "Amostra insuficiente: 14 itens. Mínimo 20." sem número) | em breve (catalogada, ainda não implementada: só no catálogo e como item na seção, "Em breve", sem gráfico) | carregando | erro | sem dados.
Granularidade e fonte sempre visíveis: O8 em stories (BusinessMap); E4/E5 em projetos/frentes; S8 a S12 só Acelerato.

## Regras de leitura (anti-meta, 7.2)
O13/O16: sem alvo de volume, subtítulo "leia com a taxa de escape (O15)". O8: nunca média isolada, ao lado de O4 e O3. T8: junto de "entrada não planejada", sem alvo de 100%. T6/E5: P50/P85/P95; E5 sempre ao lado do crescimento de escopo; "compromisso externo no P85". O14: por área, cliente ou sistema, nunca pessoa.

## Perguntas para o arquiteto
1. Catálogo único de métricas (id, nome, painel, seção, grupo núcleo/complementar, status, granularidade, fonte) servindo painel, seletor, 007 e página `/metricas`: onde mora e quem o gera?
2. Quais das 17 têm dado/cálculo prontos na biblioteca compartilhada (T2.5)? T6/E5 dependem de Monte Carlo (o arquivo `montecarlo.ts` está em remoção no working tree: confirmar o destino).
3. S8 (reabertura) depende de T4.2 e O16 de T1.4: o dado existe no mock/real? Como o status "em breve" é derivado (flag do catálogo ou ausência de dado)?
4. Carga: seção recolhida deve buscar dados só ao abrir (lazy) para respeitar o orçamento de performance (ADR 0003)?
5. E4/E5 e O8: confirmar que cada um usa uma única granularidade.

## Decisões para o usuário
- D-1: Aprova A + B (seção recolhida + catálogo) em vez de C?
- D-2: Quais complementares realmente implementar primeiro (ordem)? O briefing diz "sob demanda".
- D-3: Complementares podem gerar alerta em "Pede atenção"? Recomendação: não por enquanto.
- D-4: "Restaurar padrão" do 007 deve abrir também a seção? Recomendação: sim, só a abre na visita.
- D-5: Mostrar "Em breve" na seção do painel ou só no catálogo? Recomendação: só no catálogo, com uma linha de resumo no painel.
- D-6: Nome da seção: "Mais métricas" ou "Métricas complementares"?
