# Exportar métricas · 03 Idear

## Alternativas
**E1. "Exportar" no cartão (menu), uma métrica, PNG ou PDF.** Prós: gesto direto, simples. Contras: não serve para várias; repetição. Esforço: baixo.
**E2. "Exportar" na barra do painel, abre diálogo com caixas das métricas visíveis, formato (PDF/PNG) e prévia.** Prós: uma ou várias, usa a seleção do 007 como ponto de partida, descobrível. Contras: mais um diálogo. Esforço: médio.
**E3. Modo "Selecionar para exportar" no painel (caixas sobre os cartões).** Prós: contexto visual. Contras: modo, ruim em teclado e celular. Esforço: alto.
**E4. Imprimir pelo navegador com CSS de impressão.** Prós: quase sem custo. Contras: sem controle de conteúdo obrigatório, sem PNG, depende do navegador. Esforço: baixo.

## Matriz
Impacto alto: E2, E1; esforço baixo: E1, E4; alto: E3.

## Escolhida: E2 + atalho E1
O cartão tem "Exportar esta métrica" que abre o mesmo diálogo com só aquela marcada. Motivo: um único componente, cobre uma ou várias, sem modo.

## Regras de conteúdo (todas)
1. Por padrão exporta as métricas **visíveis** (preferências do 007); o diálogo permite incluir uma oculta marcando-a (o arquivo diz "exportada a pedido", não "oculta").
2. Cada métrica leva: título, gráfico como está na tela, base amostral, janela, fonte, filtros aplicados, "amostra insuficiente" quando for o caso, nota resumida, marca de mudança de critério, "Dados fictícios" no mock, data/hora de geração.
3. Uma exportação = um painel = uma fonte; BusinessMap e Acelerato nunca no mesmo arquivo. A Visão geral não exporta no v1 (H).
4. Sem nome de pessoa; rodapé "O sistema não compara equipes nem avalia pessoas".
5. PDF: A4, uma ou mais métricas por página, cabeçalho e rodapé fixos. PNG: uma imagem por métrica (várias = arquivo .zip, H).
6. Resultado consolidado: aviso do painel entra no cabeçalho do arquivo.

## Perguntas para o arquiteto
1. Geração no cliente (canvas/print) ou no servidor (renderização)? Impacto em fidelidade, fontes e acessibilidade do PDF (PDF com texto selecionável e título/idioma).
2. O que vem do back-end para garantir o conteúdo obrigatório (base, janela, nota, critério alterado) independente do que a tela mostra?
3. Zip para várias imagens: aceitável no cliente?
4. Limite de métricas por exportação e tempo máximo; fila ou resposta direta?
5. Log: registrar exportações? (proposta: nenhum registro por pessoa; só contador agregado ou nada.)
6. Como o mock marca o arquivo "dados fictícios" e testa o conteúdo obrigatório (E2E lendo o PDF)?

## Decisões para o usuário
D-1: PDF com várias métricas e PNG por métrica (zip para várias): ok? D-2: permitir incluir métrica oculta marcando-a no diálogo? D-3: Visão geral fora do v1? D-4: exportação só do painel atual (uma fonte) ou também combinada? (recomendado: só do painel atual). D-5: registrar exportações? (recomendado: não.)
