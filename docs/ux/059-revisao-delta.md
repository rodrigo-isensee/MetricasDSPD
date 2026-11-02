# Revisão de UX da aba Apontamento (pedido 059, E2.33)

Veredito: aprovada com ressalvas. Nenhum achado crítico. Dois altos e um médio pedem ajuste antes do PR; os demais podem ir em volta posterior.

Escopo e método: leitura estática do código de `web/src/features/apontamento/` na branch `feature/059-aba-front` (worktree 052h) e dos testes da aba, contra `docs/ux/059-aba-apontamento.md` e `docs/ux/059-aba-apontamento-textos.md` (ramo do discovery), as heurísticas de Nielsen e a WCAG 2.2 AA. Não executei a aplicação nem a suíte (o papel não tem Bash): contraste real das faixas do mapa e comportamento em 375 px ficam como verificação visual do QA. Nenhum nome de pessoa neste parecer.

## Conformidade com a especificação e os textos

| Item pedido | Resultado | Evidência |
|---|---|---|
| Seções e cartões | Conforme: seis seções com título em pergunta, cartões no `CartaoMetrica`, ids `ap-*`, nota "Como ler" e critério | `ApontamentoPage.tsx`, `textos.ts` (SECOES, CARTOES) |
| Estados | Conforme: carregando (anúncio em região viva), vazio tratado uma vez na página, erro por cartão com "Tentar de novo", dado defasado com selo e aviso | `ApontamentoPage.tsx`, `CabecalhoApontamento.tsx`, `CartaoApontamento.tsx` |
| Tabela alternativa | Conforme: gráficos têm "Ver como tabela"; mapa diário tem tabela pessoa, dia, horas, faixa, observação; listas por pessoa já são tabelas | `CartaoDiario.tsx` (TabelaDoMapa), `CartoesQualidade.tsx` |
| Mapa diário | Conforme com ressalvas (A-2, A-5): faixas fixas vindas do contrato, legenda com texto, fim de semana e feriado neutros e distintos de dia útil vazio, marca de possível erro com ícone e texto, teclas de seta com roving tabindex, rótulo de célula "pessoa, dia, horas, faixa", rolagem só no bloco, colunas de pessoa e total fixas | `CartaoDiario.tsx` |
| o1 ordem neutra, ordenar por total | Conforme: padrão alfabético, "Ordem" como escolha, vale em matriz, qualidade, capacidade e mapa, grava na URL | `ordem.ts`, `BarraFiltrosApontamento.tsx` |
| o2 utilização sem semáforo | Conforme: só número, sem cor, faixa, meta ou média; selo "Comparação relativa; não é jornada total" sempre visível, ícone mais texto, cor neutra | `CartoesCapacidade.tsx`, `SeloLeituraRelativa.tsx` |
| o3 amostra insuficiente | Conforme: percentual vira "amostra insuficiente" abaixo de 20 e a contagem e a soma ficam; a decisão vem do contrato (status), o front não recalcula | `CartoesQualidade.tsx`, `CartaoKpis.tsx`, `CartaoDistribuicao.tsx` |
| o4 fora da exportação | Conforme: nenhum botão nem texto de exportação na aba | busca no código; teste "o4 e AP-8" |
| Aviso de nome real | Conforme com ressalva (A-7): faixa só com `nomesReais`, ícone e texto, `role="status"`, não dispensável, detalhe expansível; sem nome real, linha "Pessoas aparecem como 'Pessoa 1'..." | `CabecalhoApontamento.tsx`, `BarraFiltrosApontamento.tsx` |
| Outra área sem nome | Conforme no mecanismo (chave fixa, sem nome, sempre por último, aceita na URL); falta explicação ao leitor (A-3) e há dúvida de leitura no mapa e na capacidade (A-4) | `ordem.ts`, `filtros.ts`, `ligacao.test.tsx` |
| Quinta opção do seletor | Conforme: quinta opção "Apontamento" com rota própria, pré-carga na intenção, foco devolvido ao título da visão de destino | `SeletorVisao.tsx`, `visao.ts` |
| Textos do discovery | Conforme quase literal; diferenças em A-6 e A-9 | `textos.ts` |
| Fonte única e regras de agrupamento | Conforme: todo cartão diz BusinessMap, matriz mostra um nível por vez, pessoa só por `pessoaRef` na URL | testes "fonte única" e CA-5 |

## Achados

- [alto] A-1. Onde: `CartoesCapacidade.tsx` (CapacidadePessoa) e `CartoesQualidade.tsx` (QualidadePessoa), tabelas largas. Por quê: com mais colunas que a largura, em 375 px a tabela precisa de rolagem interna com a coluna Pessoa fixa; o código não mostra isso e o teste de CA-8 cobre só o mapa. Correção: confirmar no QA que as tabelas rolam só no bloco, com a coluna Pessoa fixa.
- [alto] A-2. Onde: `CartaoDiario.tsx`, célula do mapa com `tabIndex` e `role="gridcell"` dentro de `RegiaoRolavel`. Por quê: a célula focada pode ficar sob a coluna fixa de pessoa ou de total ao navegar por seta, e o foco some da vista (WCAG 2.4.11, foco não obscurecido). Correção: rolar a célula para a vista ao focar, com margem para as colunas fixas, e cobrir com teste.
- [médio] A-3. Onde: filtro "Pessoa que apontou", listas por pessoa e mapa. Por quê: "Outra área" aparece sem dizer quem é; quem lê pode achar que é uma pessoa ou uma equipe, e o texto do discovery não cobre a entrada nova. Correção: nota fixa, uma vez por cartão, como a de pessoa não identificada: "Outra área: pessoas que não foram responsáveis por card do DSPD nos últimos 12 meses, somadas, sem nome."
- [médio] A-4. Onde: linha "Outra área" no mapa diário, na capacidade por pessoa e na utilização. Por quê: a linha soma várias pessoas; faixas de 4 h e 8 h e o limite diário de possível erro foram pensados por pessoa e dia, então a linha tende a ficar sempre na faixa mais alta e marcada como erro. Hipótese, depende da regra no servidor. Correção: validar com o arquiteto; se confirmado, não faixar nem marcar a linha agregada e não calcular utilização para ela.
- [médio] A-5. Onde: `CartaoDiario.tsx`, célula de dia não útil com apontamento. Por quê: a célula recebe a cor da faixa e o rótulo acessível não diz "fim de semana" ou "feriado"; a legenda só trata o caso vazio. Correção: incluir o motivo no rótulo ("sábado, 6,5 horas") e acrescentar à legenda "Apontamento em fim de semana ou feriado".
- [baixo] A-6. Onde: `ApontamentoPage.tsx`, texto de público "Para o time e a liderança". Por quê: a decisão do dono é que qualquer usuário do painel vê a aba, inclusive fora do time; o texto subdimensiona o público. Correção: "Para quem acompanha o painel · fonte única: BusinessMap."
- [baixo] A-7. Onde: `AvisoNomeReal` com `role="status"` renderizado já no carregamento. Por quê: região viva presente desde o início pode não ser anunciada; a faixa carrega a regra de conduta da tela. Correção: manter a faixa e acrescentar a frase ao `aria-label` da seção ou ao título da página quando `nomesReais` for verdadeiro.
- [baixo] A-8. Onde: filtros recolhidos em 375 px. Por quê: "Ordem" e "Ocultar possíveis erros" ficam dentro do painel recolhido e não geram chip; quem chega por link com ordem por total não vê que a ordem não é a neutra. Correção: chip "Ordem: total de horas" com remoção, e contar os dois controles em "Filtros (n)".
- [baixo] A-9. Onde: `textos.ts`, notas "Critério". Por quê: o discovery pede a data de revisão do dicionário e do calendário e "Mês em andamento vale até {data}" no como ler; o front só mostra a data quando há mudança de critério e, no mensal, na tabela. Correção: exibir a data da versão vigente de `criterios[]` na linha "Critério" e a data de corte do mês em andamento no texto.
- [baixo] A-10. Onde: células de utilização, "Utilização: 19%" repetido sob a coluna "Utilização". Por quê: o leitor de tela lê o rótulo duas vezes e a coluna fica mais larga sem ganho. Correção: só o valor ("19%") na célula; manter "Utilização: x%" fora da tabela.
- [baixo] A-11. Onde: cabeçalho, texto "Carregando apontamentos" visível e a região viva com o mesmo texto. Por quê: o anúncio sai duplicado em leitores de tela. Correção: manter só a região viva e deixar o texto visível com `aria-hidden`.
- [baixo] A-12. Onde: atalho "Ver apontamentos" do achado de dias atípicos (âncora `#ap-diario`). Por quê: a âncora rola a página mas não leva o foco ao cartão, e o rótulo promete lista de apontamentos quando abre o mapa. Correção: rótulo "Ver mapa diário" e foco no título do cartão ao ativar.
- [baixo] A-13. Onde: período dos dados "Dados de AAAA-MM-DD a AAAA-MM-DD" no cabeçalho e datas dd/mm/aaaa no mapa e nas tabelas. Por quê: dois formatos de data na mesma tela. Correção: usar `fmtData` também no cabeçalho, ajustando o texto do discovery.

## Pontos fortes (sem ação)
- Todo texto vem do arquivo de textos do discovery, com valores por parâmetro e nenhum número escrito à mão; achado de código desconhecido ou incompleto é descartado sem erro.
- Os testes cobrem os critérios CA-1 a CA-11, o1 a o4, estados, URL sem nome, ausência de pessoa em armazenamento do navegador e Outra área por último.
- Flags, anomalia e faixas usam texto e ícone, nunca só cor; alvos de toque usam a classe de alvo do painel.

## Recomendação
Corrigir A-1 a A-5 antes do PR (A-4 depende de resposta do arquiteto) e tratar A-6 a A-13 na volta seguinte. Nada aqui exige decisão do dono além do texto de A-3, que é sugestão de microcopy para ele validar.
