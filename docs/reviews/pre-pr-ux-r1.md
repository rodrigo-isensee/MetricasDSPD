---
contrato: 0
---
# Parecer de UX pré-PR da develop (r1)

Parecer imutável. Escopo: pedido 007 (preferências de métricas) e pedido 008 (exportar PDF). Base: `docs/qa/develop-pre-pr.md`, quatro capturas em `docs/qa/evidencias/pre-pr/`, decisões do usuário (§6, §9, §10). Limite da revisão: `exemplo-operacional.pdf` não pôde ser aberto (sem `pdftoppm` no ambiente), então o conteúdo do PDF não foi inspecionado; só a prévia textual e o diálogo. Revisão visual por captura, sem navegação ao vivo; a conformidade com a especificação foi tomada do relatório do QA (289 testes verdes, axe sem violações bloqueantes).

## Veredito
Sem achado crítico nem alto. Pode seguir para o PR. Há 3 achados médios e 3 baixos, que podem virar correção posterior, exceto M-1 (recomendado antes do PR, se barato).

## Aderência às decisões do usuário
- Todos começam vendo tudo: confirmado (12 de 12, 8 de 8, 4 de 4, 8 de 8 visíveis; "Por padrão, todas as métricas aparecem").
- Sem `ocultar` na URL: confirmado pelo QA (PREF link copiado). Não verificável visualmente.
- Diálogo de primeiro login fora da entrega: nenhum vestígio nas capturas. OK.
- Nada de ranking, meta por pessoa ou comparação: os textos "Ninguém as vê e elas não entram em nenhum cálculo", "O sistema não compara equipes" e "Sem nomes de pessoas" reforçam a regra. OK.
- BusinessMap e Acelerato separados: o diálogo rotula a fonte de cada métrica e a prévia agrupa por fonte. OK.

## Achados

### Médio
**M-1. Diálogo de exportar em 375 px: rodapé de ações fora da vista.**
Onde: `exportar-dialogo-375-escuro.png`. A lista de 12 métricas ocupa a tela e o texto "Limite de 12 métricas..." é cortado. "Gerar arquivo", a ação primária, só aparece depois da rolagem. A captura não prova rolagem interna. Por quê: a ação primária some e o usuário precisa descobrir a rolagem (Nielsen: visibilidade; WCAG 2.2 Reflow e foco). Correção: título e rodapé fixos (sticky) com a lista rolando entre eles, `max-height` em `dvh`, e rodapé empilhado em largura total no mobile.

**M-2. Avisos de "critério alterado" empilhados para cada métrica oculta.**
Onde: `painel-ocultas-1280-claro.png`, dois banners amarelos (O9, O10) abaixo da faixa "2 métricas ocultas". Por quê: com N ocultas, o topo do painel é empurrado por N banners e o conteúdo real desce. A faixa cinza já informa as ocultas. Por outro lado, o aviso de mudança de critério é obrigatório (T2.6) e não pode sumir. Correção: agrupar em um único aviso ("Critério alterado em O9 e O10 (ocultas) em 02/03/2026") com um botão "Mostrar essas métricas", ou integrar o aviso à faixa de ocultas.

**M-3. Excesso de camadas de status no topo do painel Operacional.**
Onde: mesma captura. Há selo "Falha" + "Entenda" + frase de coleta + faixa de ocultas + banners + "Pede atenção", antes de qualquer gráfico (a primeira métrica fica abaixo da dobra a 1280×800). Por quê: design minimalista. Correção: com os banners agrupados (M-2), o ganho já ocorre. Opcionalmente, recolher a frase de falha em tooltip/disclosure, mantendo o selo "Falha" visível.

### Baixo
**B-1. Diálogo de exportar sem "Marcar todas".** Onde: `exportar-dialogo-1280-claro.png`. Com "Limpar seleção" e limite de 12, falta o atalho inverso, e a lista da personalizada pode crescer. Correção: "Selecionar todas (até 12)" ou nota de que o limite se aplica; manter "Limpar seleção" como ação terciária (texto, não botão com mesmo peso de Cancelar).

**B-2. Prévia vazia em boa parte da coluna.** Mostra só nome de arquivo, selo e lista de IDs. É aceitável, mas a lista de IDs cita "BLOQUEADOS" sem nome. Correção: usar "ID + nome curto" ou contar "12 métricas, ~N páginas" se for barato. O nome do arquivo inclui "_ficticio", o que é bom.

**B-3. Detalhes de consistência.** (a) Botão "Copiar link  desta visão" com espaço duplo/ícone desalinhado. (b) Em "Preferências", fundo do botão "Restaurar padrão" desabilitado com contraste baixo (texto cinza claro); estado desabilitado está isento do WCAG, mas diga por que está desabilitado ("Você já está vendo tudo"). (c) O diálogo a 1280 mostra chip "Período: Últimas 4 semanas" em fundo enquanto o painel mostra "Últimas 12 semanas": se for estado do teste, ignorar; se não, é inconsistência.

## Pontos positivos
- Contagem "12 de 12 visíveis" por painel e agrupamento por pergunta, com IDs e fonte.
- "Mostrar O10 nesta visita" no alerta de métrica oculta com selo "métrica oculta": o alerta crítico não se perde.
- Sinais não dependem só de cor (ícones e texto em Falha, atenção, selos).
- Foco, desfazer e painel vazio cobertos nos testes; tema escuro legível; alvos de toque adequados.

## Desvios declarados
- **007, "Ocultar" como botão direto no cartão (não menu): aceitável.** Reduz um clique, é visível por teclado e leitor de tela, e o desfazer com foco está testado. Ressalva: em 375 px, confirmar que o link "Ocultar" mantém alvo de 24 px, no mínimo, e não se aproxima de "Ver como tabela" (captura 1280 mostra espaçamento curto).
- **008, gráfico vira tabela de dados no PDF por orçamento de bundle (F11): aceitável**, desde que o PDF diga claramente que é tabela de dados (nota "valores do gráfico em tabela") e o roteiro de validação do usuário registre isso. Tabela é acessível e conferível, e atende bem a quem exporta para anexar. Registrar como dívida: gráfico em imagem fica para depois. Não pude confirmar pelo PDF.
- **008, prévia textual (não visual): aceitável** para esta entrega; a prévia cumpre o essencial (arquivo, selo de dados fictícios, fontes separadas, aviso de não comparação).
- **008, exportação personalizada reaproveita o diálogo: aceitável** e até melhor (consistência), pois o botão "Exportar" e "Exportação personalizada" abrem a mesma estrutura. Ressalva: ambos os botões ficam próximos com rótulos parecidos; ao abrir a personalizada, o título deveria mudar para "Exportação personalizada" e vir sem marcação padrão, se o fluxo não fizer isso hoje.

Parecer fechado: 2026-10-10 18:45
