# K-303 (pedido 097, E5.4): vazio da aba do Apontamento e mapa diário

Decisão de UX para o `react-frontend`. Base da leitura: `ApontamentoPage.tsx` (linhas 97 e 146-174), `CartaoDiario.tsx` e `EstadoVazio.tsx` na worktree `/home/rodrigoisensee/MetricasDSPD-052c`; nada medido, nenhuma ferramenta rodada. Contexto: A2 e Volta 1 de `docs/ux/097-revisao-k286.md`.

## Problema
`vazio = kpis.apontamentos === 0` troca as seis seções por um único `EstadoVazio`, inclusive "Dia a dia". Mas o mapa diário tem janela própria (`diarioDe`/`diarioAte`) e, com Equipe, só ela o recorta. Assim, o período dos filtros pode estar vazio e a janela do mapa ter dados; a pessoa não os vê e acha que não há nada (visibilidade do status, correspondência com o mundo real). O mapa já trata o próprio vazio (`diario-sem-pessoas`, K-286), então não precisa do vazio da aba para se proteger.

## Decisão
O vazio da aba vale **só para os cartões que dependem do período dos filtros** (seções Quanto foi apontado, Onde o esforço foi gasto, Qualidade, Capacidade, Achados). A seção "Dia a dia" (mapa) **continua renderizada** com a janela própria, e decide o próprio estado: com dados mostra o mapa; sem dados mostra `diario-sem-pessoas`.

Alternativas descartadas: (a) manter o vazio total e avisar do mapa: esconde dado existente. (b) fazer o mapa seguir o período dos filtros: contradiz o K-286 e a nota "a janela dele é a escolhida aqui". (c) mostrar os cartões zerados: números 0 sem sentido e KPIs enganosos.

## Estrutura (wireframe)
```
[Cabeçalho, seletor de visão, filtros]   (inalterados)
[status sr-only]
(sem índice de seções: ver CA-6)

## Período dos filtros                    <- Secao id="secao-periodo"
+ - - - - - - - - - - - - - - - - - - - +
| (i) Nenhum apontamento no período     |   <- EstadoVazio codigo="AP"
|     dos filtros                       |
|  Nenhum apontamento atende aos        |
|  filtros atuais. O mapa dia a dia     |
|  abaixo usa a janela própria dele.    |
|  [Limpar filtros] [Remover filtro X]  |
+ - - - - - - - - - - - - - - - - - - - +

## Dia a dia                              <- Secao id="secao-diario"
[Cartão AP-DIARIO: mapa, ou diario-sem-pessoas]
```

## Textos exatos
- Título do vazio: `Nenhum apontamento no período dos filtros`
- Texto do vazio: `Nenhum apontamento atende aos filtros atuais. O mapa dia a dia abaixo usa a janela própria dele.`
- Título da seção do vazio: `Período dos filtros`
- Botões: os do `EstadoVazio` (`Limpar filtros`, `Remover filtro <rótulo>`), sem mudança.
- Anúncio (região `status` existente): `Nenhum apontamento no período dos filtros. O mapa dia a dia tem janela própria.`
- Mapa sem dados na janela: os textos do K-286 (`diario-sem-pessoas`), sem mudança.
- Quando o próprio mapa também está sem pessoas, a frase "O mapa dia a dia abaixo usa a janela própria dele." continua verdadeira; não há texto extra.

Substitui `VAZIO.titulo` e `VAZIO.texto` em `textos.ts`.

## Foco e leitor de tela
- O foco **não se move** sozinho: a mudança vem de um filtro que a pessoa acabou de operar, e o foco fica nele (sem roubo de foco, sem perda de contexto). Os botões do vazio são alcançáveis por Tab na ordem do documento, antes do mapa.
- O vazio aparece/desaparece sem a pessoa ter foco nele, então precisa de anúncio: a região `role="status"` `aria-live="polite"` já existente (`anuncio-carregando`) recebe o texto de anúncio quando `vazio` passa a verdadeiro e volta a `''` quando deixa de ser. Não criar segunda região.
- Cada Secao mantém seu título como cabeçalho, então a navegação por títulos mostra "Período dos filtros" e "Dia a dia".
- Ao carregar de novo (`estado === 'carregando'`), vale o anúncio de carregando, não o de vazio.

## Estados
- Carregando: inalterado (sem `resposta` não há vazio).
- Vazio do período + mapa com dados: vazio na Secao "Período dos filtros" + mapa visível.
- Vazio do período + mapa sem dados: vazio + `diario-sem-pessoas` (duas mensagens, cada uma sobre o seu escopo).
- Com dados no período: inalterado.
- Erro: inalterado.

## Regras invioláveis
Só "Pessoa n"; o mapa segue como grade de capacidade já aprovada (059), sem ranking, meta ou comparação entre equipes. O vazio não cita nomes de pessoa nem de equipe além dos rótulos de filtro já existentes. Nada novo de dados: nenhuma necessidade de back-end (`kpis.apontamentos` e `diario` já vêm na mesma resposta).

## Critérios de aceite
- `CA-1` QUANDO a resposta tem `kpis.apontamentos === 0` O SISTEMA DEVE renderizar a seção "Dia a dia" com o cartão AP-DIARIO, e não renderizar as seções Quanto foi apontado, Onde o esforço foi gasto, Qualidade dos apontamentos, Capacidade e Achados.
- `CA-2` QUANDO a resposta tem `kpis.apontamentos === 0` e `diario.linhas` com ao menos uma pessoa (diferente de "Outra área") O SISTEMA DEVE exibir o mapa de calor (ou a tabela alternativa, conforme o modo) com a legenda, no mesmo estado de quando há apontamento no período.
- `CA-3` QUANDO a resposta tem `kpis.apontamentos === 0` O SISTEMA DEVE exibir, sob o título de seção "Período dos filtros", o `EstadoVazio` com o título "Nenhum apontamento no período dos filtros" e o texto "Nenhum apontamento atende aos filtros atuais. O mapa dia a dia abaixo usa a janela própria dele.", posicionado antes da seção "Dia a dia".
- `CA-4` QUANDO a resposta tem `kpis.apontamentos === 0` e há filtro ativo O SISTEMA DEVE exibir no vazio os botões "Limpar filtros" e "Remover filtro <rótulo>" por filtro ativo, e o clique em um deles DEVE atualizar a URL e a consulta como hoje.
- `CA-5` QUANDO a resposta tem `kpis.apontamentos === 0` e `diario.linhas` sem pessoa (vazia ou só "Outra área") O SISTEMA DEVE exibir o vazio do período e o bloco `diario-sem-pessoas` do K-286 com seus textos atuais.
- `CA-6` ENQUANTO o vazio do período está ativo O SISTEMA DEVE omitir o índice de seções.
- `CA-7` QUANDO `kpis.apontamentos === 0` passa a verdadeiro depois de uma consulta O SISTEMA DEVE escrever na região `status` existente o texto "Nenhum apontamento no período dos filtros. O mapa dia a dia tem janela própria." e esvaziá-la quando deixar de valer, sem criar segunda região de anúncio.
- `CA-8` QUANDO o vazio do período aparece O SISTEMA DEVE manter o foco no elemento que o tinha (o controle de filtro operado), sem movê-lo.
- `CA-9` QUANDO o vazio do período está ativo e a pessoa altera a janela do mapa O SISTEMA DEVE atualizar só o mapa e manter o vazio do período, sem alterar os filtros da barra.
- `CA-10` O SISTEMA DEVE manter o rodapé do cartão do mapa ("Filtros aplicados: Equipe ...", "Não afetado por: ...") igual no estado de vazio do período e no estado com dados.
- `CA-11` O SISTEMA NÃO DEVE exibir, em nenhum estado desta decisão, nome real de pessoa, total ou ordem por equipe, nem ranking.
- `CA-12` ONDE `kpis.apontamentos > 0` O SISTEMA DEVE manter as seis seções e o índice como hoje (regressão), e `VAZIO.titulo`/`VAZIO.texto` antigos NÃO DEVEM mais aparecer em nenhum estado.

## Notas para o QA
Teste do CA-1/2: fixture com `kpis.apontamentos: 0` e `diario.linhas` com "Pessoa 1". Hoje esse teste falha (o mapa não existe no DOM). `@axe` no estado CA-3 e leitura do anúncio do CA-7 são do QA (aqui, `lido`).

## Providências
- `react-frontend`: `ApontamentoPage.tsx` (separar as seções dependentes do período do `CartaoDiario`; omitir o índice no vazio) e `textos.ts` (VAZIO e texto de anúncio).
- `qa-engineer`: um teste por CA, com o `CA-n` no nome.
- Nenhuma pergunta aberta ao dono: é refinamento dentro da decisão do 097 (protótipo e recomendações aceitos), sem regra de negócio nova.
