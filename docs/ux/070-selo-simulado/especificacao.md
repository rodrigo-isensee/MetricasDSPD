# Selo "Simulado" no cartão de métrica (pedido 070, E1.2)

Status: proposta, aguardando validação do dono no protótipo (`prototipo.html`). Nada aqui é decisão de regra de negócio; ver "Perguntas ao dono".

## Objetivo
Quem lê o painel precisa saber, sem esforço, se o cartão mostra dado real ou dado de exemplo, para nunca tomar decisão em cima de número que não é da operação. O selo "Simulado" fica no próprio cartão e some quando o dado real chega.

## Personas / contexto de uso
Gerência e coordenação lendo os painéis FL1, FL2, FL3 e Sustentação em desktop (uso principal) e celular (consulta). Quem lê pode não saber o que é "mock" ou "staging"; o texto não usa esses termos.

## Fluxo
1. A pessoa abre um painel. Cada cartão com dado real aparece como hoje, sem selo.
2. Cartão sem dado real aparece com o selo "Simulado", uma faixa de aviso e o gráfico com dados de exemplo.
3. A pessoa clica em "O que é simulado?" (no selo) e lê a explicação curta.
4. Quando o dado real passa a existir, o cartão troca sozinho: selo, faixa e marcas visuais saem; nada mais muda na anatomia.
5. Alternativo: se o cartão estiver em erro ou carregando, não mostra selo (o estado de erro/carregando vale; ver "Estados").

## Telas
### Cartão de métrica simulado (anatomia 4.0 do dashboard-metricas, com acréscimos)
Wireframe:
```
+--------------------------------------------------------------+
| [O2] Tempo de ciclo   [Como ler] [Ver como tabela]           |
|      [Base: 38 itens]  [SIMULADO (i)]                        |   <- selo no cabeçalho
+--------------------------------------------------------------+
| (!) Dados de exemplo. Este cartão ainda não tem dado real.   |   <- faixa de aviso
|     [O que é simulado?]                                      |
| Subtítulo / frase de leitura                                 |
| +----------------- gráfico com dados de exemplo ----------+  |   <- borda tracejada
| Rodapé: meta · fonte · filtros                               |
+--------------------------------------------------------------+
```
- **Onde fica:** o selo vai no cabeçalho, logo depois do selo da base amostral (mesma linha, quebra para a linha seguinte em tela estreita). A faixa de aviso fica entre o cabeçalho e o subtítulo, ocupando a largura do cartão. Os dois aparecem juntos; o selo sozinho não basta em impressão e captura de tela, e a faixa sozinha some quando o cartão rola o cabeçalho.
- **Marcas redundantes (não depender só de cor):** texto "Simulado", ícone de aviso, borda tracejada no cartão e marca d'água diagonal discreta "SIMULADO" sobre a área do gráfico (decorativa, `aria-hidden`). Assim a captura de tela do cartão continua dizendo que é simulado.
- **Componentes:** reaproveita o selo de base amostral e o bloco expansível da nota metodológica (D11); a explicação abre inline (não modal), como a nota.
- **Interações:** "O que é simulado?" é um botão que expande/recolhe a explicação (`aria-expanded`); Enter e Espaço alternam; foco visível. Não há ação de "trocar para real" (a troca é automática, por cartão).
- **Alternador "Ver como tabela":** a tabela também leva a coluna ou legenda "Dados de exemplo" e a mesma faixa acima dela.

### Cartão real
Idêntico ao atual: sem selo, sem faixa, sem borda tracejada, sem marca d'água. Nenhum selo "Real" é adicionado (cartão sem selo = real; evita ruído).

## Estados
- Real: sem selo.
- Simulado: selo + faixa + marcas.
- Carregando: esqueleto sem selo; o selo só aparece quando a resposta chega dizendo que é simulado (evita piscar "real" e virar "simulado").
- Erro: mensagem de erro do cartão, sem selo e sem dado de exemplo.
- Vazio por filtro: mantém o selo se o cartão for simulado.
- Transição simulado para real: ocorre na carga da página (não ao vivo); ver Regras.

## Regras que nunca mudam
- Nunca real e simulado no mesmo gráfico, série, tabela ou número. Um cartão é inteiro real ou inteiro simulado. Se só parte do dado existir, o cartão inteiro é simulado (decisão do desenho do arquiteto, E1.1; aqui apenas se garante que a tela não mistura).
- Nunca BusinessMap e Acelerato juntos; o selo de fonte do cartão continua único e separado do selo "Simulado".
- Nunca simulado em métrica individual: dado de exemplo não traz nome de pessoa nem recorte por pessoa.
- O selo de "Visão geral" e os destaques "O que pede atenção agora" não podem ranquear ou alertar com base em cartão simulado: item simulado entra com o selo e fora de "pede atenção" (a confirmar com o dono, ver perguntas).
- "Copiar link desta visão" e exportações de um cartão simulado levam o selo junto.

## Microcopy
- Selo: "Simulado"
- Nome acessível do selo: "Dados simulados: este cartão mostra números de exemplo, não da operação."
- Faixa: "Dados de exemplo. Este cartão ainda não tem dado real, então os números abaixo não representam a operação."
- Botão: "O que é simulado?" (aberto: "Fechar explicação")
- Explicação (expandida):
  "Simulado quer dizer que os números e o gráfico deste cartão são inventados, só para mostrar como ele vai ficar. Não use para decidir nem para comparar. Quando o dado real da operação estiver disponível, este cartão passa a mostrá-lo sozinho e o aviso desaparece. Cada cartão muda por conta própria: um cartão real nunca traz números de exemplo misturados."
- Tabela: legenda "Dados de exemplo (simulado)".
- Frase de leitura de cartão simulado: prefixo "Exemplo:" ("Exemplo: 2 itens estão acima do P95"), para a frase gerada não parecer afirmação real.

## Acessibilidade (WCAG 2.2 AA)
- Contraste: texto do selo e da faixa em marrom escuro `#6b3a00` sobre fundo âmbar claro `#fff1d6` (cerca de 8:1, estimado; o front-end confere com ferramenta) e borda do selo `#b45309` sobre branco (3:1 ou mais para elemento de UI). Marca d'água com baixo contraste é decorativa, não carrega informação que só ela diga.
- Não só cor: texto + ícone + borda tracejada.
- Leitor de tela: o selo é texto real (não imagem) com o nome acessível acima; a faixa é `role="note"` (não `alert`, para não interromper a leitura) e vem logo após o título do cartão na ordem do DOM, de modo que quem navega por títulos ouve "Dados simulados" antes do gráfico. O gráfico simulado herda o resumo textual/tabela com o prefixo "Exemplo".
- Teclado: o botão "O que é simulado?" é focável na ordem natural, alvo de pelo menos 44x44px em toque, foco visível.
- Movimento: sem animação; a troca é na carga da página, então nada pisca.
- Mobile (menos de 640px): selo quebra para linha própria; faixa em largura total, texto sem truncar.

## Quando o dado real chega
Na próxima carga da página, o cartão volta ao desenho normal: o selo, a faixa, a borda tracejada, a marca d'água e o prefixo "Exemplo:" saem juntos; a explicação expandida (se estava aberta) fecha. Não fica histórico de "já foi simulado" no cartão. O gráfico real não herda nada do simulado (nem escala nem série). Se o dado real sumir de novo, o cartão volta ao simulado com selo (sem aviso especial, a decisão é por carga).

## Necessidades de dados
Por cartão, a API precisa informar, junto da resposta da métrica, um indicador de origem do conteúdo: real ou simulado (o nome do campo e o contrato são do back-end/arquiteto, E1.1). A tela só lê esse indicador; não decide sozinha. Texto do selo e da explicação são fixos no front-end.

## Perguntas ao dono (decisão dele, nenhuma tomada aqui)
1. "O que pede atenção agora" e a Visão geral devem ignorar cartões simulados (recomendação: sim, para não alertar com número inventado)?
2. O selo ao lado de cartões simulados na Visão geral deve aparecer também no resumo/atalho que aponta para o cartão (recomendação: sim, o mesmo selo menor)?
3. O texto da explicação e a faixa estão bons ou o dono prefere versão mais curta (só selo + explicação no clique)?

## Critérios de aceite
- CA-1 ENQUANTO o cartão for simulado O SISTEMA DEVE exibir, no cabeçalho, o selo com o texto "Simulado" e o ícone de aviso.
- CA-2 ENQUANTO o cartão for simulado O SISTEMA DEVE exibir a faixa "Dados de exemplo..." entre o cabeçalho e o subtítulo.
- CA-3 ENQUANTO o cartão for real O SISTEMA DEVE NÃO exibir selo, faixa, borda tracejada nem marca d'água de simulado.
- CA-4 QUANDO a pessoa aciona "O que é simulado?" por clique, Enter ou Espaço O SISTEMA DEVE expandir a explicação inline e definir `aria-expanded="true"` no botão.
- CA-5 O SISTEMA DEVE expor o selo como texto com o nome acessível "Dados simulados: este cartão mostra números de exemplo, não da operação."
- CA-6 O SISTEMA DEVE manter razão de contraste de pelo menos 4,5:1 no texto do selo e da faixa e 3:1 na borda do selo.
- CA-7 QUANDO a API passa a responder "real" para um cartão que era simulado O SISTEMA DEVE, na carga seguinte, remover selo, faixa, marcas e prefixo "Exemplo:" desse cartão sem afetar os outros.
- CA-8 O SISTEMA DEVE NÃO apresentar, em um mesmo gráfico, tabela ou número, valores reais e simulados.
- CA-9 O SISTEMA DEVE NÃO apresentar dado de BusinessMap e de Acelerato no mesmo cartão, simulado ou real.
- CA-10 O SISTEMA DEVE NÃO exibir nome de pessoa nem recorte por pessoa em cartão simulado.
- CA-11 ENQUANTO o cartão estiver carregando ou em erro O SISTEMA DEVE NÃO exibir o selo "Simulado".
- CA-12 ENQUANTO o cartão for simulado, a frase de leitura DEVE começar com "Exemplo:" e a visão em tabela DEVE trazer a legenda "Dados de exemplo (simulado)".
- CA-13 ONDE a largura for menor que 640px O SISTEMA DEVE exibir o selo em linha própria e a faixa em largura total sem truncar o texto.
