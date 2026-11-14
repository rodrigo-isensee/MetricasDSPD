# Revisão de UX do K-320 (E4.50): linha de nomes ocultos nos cartões com pessoas

Pedido 097. Branch `fix/k320-nomes-ocultos`, revisado o código em `web/src/features/apontamento/` e `revisao-ux.test.tsx`. Referências: A3 de `docs/ux/097-revisao-l3.md` e A3 de `docs/ux/097-revisao-k303-k289.md`.
Método: leitura do código (`lido`). Nenhuma medição de ferramenta foi feita; contraste e leitor de tela ficam para o QA (`@axe`).

## Parecer: APROVADO, com dois achados baixos que não bloqueiam

O K-320 cumpre o que o A3 pediu: a explicação de "Pessoa n" aparece nos quatro lugares que listam pessoas, com o mesmo texto, e some com nomes reais.

## Conferência contra o A3

| Item | Resultado | Evidência (lido) |
|---|---|---|
| Texto único, mesmo nas quatro telas | Cumpre | `NotaNomesOcultos.tsx` lê só `LINHA_NOMES_OCULTOS` (`textos.ts` 33). O teste `revisao-ux.test.tsx` 268-277 compara com o literal nos quatro cartões. |
| Matriz Pessoa × categoria | Cumpre | `CartaoMatriz.tsx` 51, abaixo da tabela, antes de "não identificada" e "Outra área" |
| Qualidade por pessoa | Cumpre | `CartoesQualidade.tsx` 177, mesma posição |
| Capacidade por pessoa | Cumpre | `CartoesCapacidade.tsx` 112, acima da tabela |
| Mapa diário | Cumpre | `CartaoDiario.tsx` 279, acima do mapa e da tabela, fora da escolha de modo; vale para mapa e para tabela |
| Some com nomes reais | Cumpre | `NotaNomesOcultos.tsx` 6 (`if (r.nomesReais) return null`); teste 279-283 nos quatro cartões; `apontamento.test.tsx` 690-696 confirma a faixa de aviso no lugar |
| Mapa sem pessoas | Cumpre, sem teste direto (A2) | `CartaoDiario.tsx` 279 só renderiza com `linhas.length > 0`; no vazio entra a mensagem `diario-sem-pessoas` |
| Uma vez por cartão | Cumpre | teste 275 espera exatamente 1 |
| Sem estilo que dependa só de cor | Cumpre | texto simples, `text-xs text-texto-2`; o contraste de `texto-2` sobre a superfície fica para o QA medir |

## Individual e ranking

Nenhuma tela ganha métrica individual nem ranking por pessoa com o K-320. A mudança só acrescenta um parágrafo de texto, sem número, sem ordenação e sem comparação. As tabelas por pessoa que ele acompanha já existiam e foram validadas antes (legenda da capacidade: "sem meta nem faixa de bom ou ruim"). O rótulo "Pessoa n" continua sendo a proteção, e a linha explica por que o nome não aparece.

## Achados

### A1 (baixo) - Posição da linha varia entre os cartões
- Onde: `CartaoMatriz.tsx` 51 e `CartoesQualidade.tsx` 177 (abaixo da tabela); `CartoesCapacidade.tsx` 112 e `CartaoDiario.tsx` 279 (acima).
- Por quê: quem lê de cima para baixo vê "Pessoa 3" na tabela antes de chegar à explicação, na matriz e na qualidade. Na capacidade e no mapa a explicação vem antes. Não confunde, mas a consistência ficou parcial. O texto é curto e a tabela costuma caber na tela, por isso é baixo.
- Correção (opcional, pode virar cartão pequeno): padronizar acima da tabela, junto do aviso de leitura, ou manter abaixo nas duas tabelas longas e registrar a escolha. Não mexer sem pedido do dono; a Q-3 segue validada.

### A2 (baixo) - Falta teste do caso "mapa sem pessoas não mostra a linha"
- Onde: `vazio-e-mapa.test.tsx` 97-122 testa o vazio, mas não afirma `queryByTestId('linha-nomes-ocultos')` nulo; `revisao-ux.test.tsx` 268-284 só cobre mapa com dados.
- Por quê: o comportamento está correto no código (`CartaoDiario.tsx` 279), mas nada o protege de regressão. É o caso que o brief pede para conferir.
- Correção: acrescentar a asserção `expect(within(screen.getByTestId('metrica-AP-DIARIO')).queryByTestId('linha-nomes-ocultos')).toBeNull()` aos dois testes de vazio (período vazio e só "Outra área").

## Observações sem ação
- O texto usa aspas retas e "..." em vez de reticências. Está de acordo com o literal validado e com o teste; não alterar.
- O `CartoesCapacidade.tsx` 111 ainda traz comentário "Moradia nova (097, Q-3)", agora desatualizado, porque o componente é compartilhado. Cosmético.
