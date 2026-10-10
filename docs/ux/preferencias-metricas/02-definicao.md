# Preferências de métricas · 02 Definir

## Declaração do problema
Quem consulta os painéis (time, coordenação, gerência, sustentação) precisa **ver só as métricas que usa, sem perder o que pede atenção**, porque painéis completos têm até 9 cartões e cada papel olha poucos; mas esconder sem sinalização cria risco de decisão com visão parcial e de links que mostram coisas diferentes para cada pessoa.

## Como podemos...?
1. Como podemos deixar a pessoa definir um padrão pessoal sem exigir login hoje e sem refazer o trabalho quando o login existir?
2. Como podemos permitir recortar a visão na hora, em um gesto, e voltar atrás com a mesma facilidade?
3. Como podemos deixar claro, em todo momento, que há métricas ocultas e como restaurar?
4. Como podemos garantir que alertas e avisos obrigatórios nunca desapareçam por preferência?
5. Como podemos compartilhar uma visão sem vazar a preferência pessoal nem confundir o destinatário?

## Restrições (do pedido e do CLAUDE.md)
Preferência só decide quais **cartões** aparecem. Avisos obrigatórios (dados fictícios, amostra insuficiente, base amostral, nota metodológica, marcação de mudança de critério, "resultado consolidado") não são controláveis. Preferência é pessoal: nada por pessoa, nada agregado, nenhuma tela de "quem escondeu o quê". BM e AC continuam separados.

## Critérios de sucesso (mensuráveis)
1. Ocultar uma métrica leva no máximo 2 interações (cartão: "Ocultar" + opcional "Desfazer"; popover: 1 desmarcação).
2. 100% das telas com métrica oculta mostram "N de M métricas" e um controle "Mostrar todas" visível sem rolagem na barra do painel.
3. Zero alertas da faixa "Pede atenção" deixam de aparecer por causa de preferência (teste automatizado).
4. Zero avisos obrigatórios ausentes com qualquer combinação de ocultos (teste por painel).
5. Link com `ocultar=` abre a mesma seleção do remetente; link sem `ocultar` nunca contém preferência do perfil (teste).
6. Painel e popover operáveis só por teclado; leitor de tela anuncia mudança; alvos >= 44 px no mobile; axe sem violações graves.
7. Na validação: 4 de 5 pessoas completam "ocultar duas métricas e restaurar o padrão" sem ajuda (meta a confirmar).
