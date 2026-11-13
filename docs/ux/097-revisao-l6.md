# Revisão de UX: L6 web do pedido 097 (E3.5)

Branch `feature/097-l6-tipos-reais-web`, head `1ee4b7cc`. Base: decisão do dono E4 (opções de filtro vêm do dado real). Arquivos lidos: `web/src/features/filtros/{BarraFiltros.tsx,codec.ts,FiltroMulti.tsx,AvisoFiltrosInvalidos.tsx,useFiltros.ts}`, `web/src/features/complementares/taticas.tsx` (T11), os testes `codec.test.ts` e `taticas.test.tsx` e o parecer de QA `docs/qa/097-l6-tipos-reais-web.md`. Tudo marcado `lido` (pelo código e pelos testes); nada foi executado nem medido por mim.

## Veredito

Aprovado com ressalvas. Não há achado crítico nem alto. Os dois pontos pedidos estão atendidos (lista de Tipo e abas do T11 só com tipos do dado real, rótulos de sempre; aviso de tipo inválido na URL). Há dois achados médios e dois baixos, todos tratáveis em K-card, sem bloquear o PR.

## Conferência pedida (E3)

| Item | Resultado | Evidência (`lido`) |
|---|---|---|
| Lista de Tipo do Operacional só com tipos do dado real | atende | `BarraFiltros.tsx:32,50`: `opcoes = bm?.tipos ?? []`; `TIPOS_FILTRO` não é mais fonte na web |
| Abas do T11 só com tipos do dado real | atende | `taticas.tsx:155,273`: "Todos os tipos" + `opcoes.tipos`; mapa só aparece após escolha ou "Todos" |
| Rótulos de sempre | atende | rótulo do campo "Tipo de demanda", aba "Todos os tipos", chips com o rótulo do contrato (`useFiltros.ts:96`, `TIPO_ID`); nomes das opções vêm do servidor, que entrega só ids de `TIPO_ID` (comentário em `BarraFiltros.tsx:21`) |
| Estado sem opções | atende em parte | codec: sem opções valem os ids do contrato (`codec.ts:154-157`); tela: ver A1 e A2 |
| Aviso de tipo inválido na URL | atende | `codec.ts:154` filtra pelas opções; `codec.test.ts:55-58` espera `invalidos = ['tipo "incidente"']`; `AvisoFiltrosInvalidos` mostra "Alguns filtros do link não existem ... e foram ignorados: tipo "incidente"." com `role="status"` e "Entendi" |
| Prioridades só as presentes | atende | `BarraFiltros.tsx:74` e `codec.ts:160-163,259`; `colapsarTodos` só colapsa com todas as presentes e nunca com lista vazia |
| Equipes, Sistema, Período | sem regressão | trechos intactos |

## Achados

- **A1 (médio, heurística 1 visibilidade do status e 9 recuperar de erro)** `BarraFiltros.tsx:45-58` + `FiltroMulti.tsx:192`. Com `opcoes.tipos` vazio (opções ainda carregando, erro de rede ou base sem tipos no recorte), o filtro "Tipo de demanda" abre com o campo de busca e uma lista em branco, sem texto. A pessoa não sabe se não há tipos ou se algo falhou. Antes havia sempre a lista fixa, então este estado é novo. Correção: quando `opcoes.length === 0` mostrar "Nenhum tipo disponível neste recorte." (ou "Carregando tipos..." enquanto `opcoes` é `undefined`) e esconder o campo de busca. O mesmo vale para Prioridade e Sistema, pela mesma rota. Sem teste hoje para este estado.
- **A2 (médio, heurística 1)** `taticas.tsx:265-275`. Sem opções, o T11 mostra uma única aba "Todos os tipos", sem dizer por que não há outras. Não quebra (o mapa geral continua), mas um seletor de uma opção só parece defeito. Correção: esconder o seletor quando `opcoes?.tipos` é vazio, ou manter e acrescentar "Sem outros tipos no dado." Cobrir com um teste do estado vazio.
- **A3 (baixo, heurística 5 prevenção de erros)** `BarraFiltros.tsx:50,55` + `tiposDe`. Se uma opção trouxer um id que o contrato não conhece, ela aparece na lista, mas `tiposDe` a descarta ao marcar, e a caixa não fica marcada, sem aviso. O codec já trata esse caso na URL (`codec.test.ts:67-79`); a lista deveria filtrar do mesmo jeito (`tiposOpc` só com ids de `TIPO_ID`). Hoje o servidor só entrega ids do contrato, então o risco é baixo.
- **A4 (baixo, QA A1 reafirmado)** `taticas.test.tsx:226`. O teste do T11 espera a aba "Melhoria" do mock e passaria também com a lista fixa. Falta um teste com opções sem um dos tipos provando que a aba não aparece. Recomendado para fechar a prova de E4 no T11.

## O que não mudou (conferido)

Chips de Tipo com rótulo do contrato; anúncio "Filtros atualizados. Tipo de demanda: ..." com `role="status"`; dica "Sobre o filtro de tipo"; folha mobile; "Limpar filtros". Acessibilidade `lido`: campo de busca com label visível (`FiltroMulti.tsx:152`), `legend` para leitor de tela, anúncio das contagens da busca; sem medição de contraste nem de leitor de tela (cabe ao QA, `@axe`).

## Pendência de medição

O Playwright do QA não concluiu (prazo estourado); o E2E de filtros vale só pelo check-run `bateria` do CI no mesmo sha. Nada aqui foi medido.
