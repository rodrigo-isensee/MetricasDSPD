# Revisão de interface: selo Simulado (pedido 070, E1.7)

pedido: 070-simulado-por-cartao
branch: feature/070-simulado-por-cartao
commit: 9605ead23032f5fc0c35eda72a3318f2fc5721b1
revisor: ux-designer
data: 2026-11-05
base da revisão: especificação e protótipo validados pelo dono (K-221, decisão "A" de 2026-11-04), heurísticas de Nielsen e WCAG 2.2 AA. Leitura só do código (`web/src`), sem executar a interface.

## Veredito
Aprovado com ressalvas. O selo, a faixa, a borda tracejada, a marca d'água e o prefixo "Exemplo:" seguem a especificação e o protótipo. As três decisões de tela do autor são confirmadas. Um achado de severidade alta contradiz a decisão "cartão simulado sem dentro/fora da meta": ele deve ser corrigido antes do release, no L2 ou em lote seguinte, a critério do tech-lead. Não há achado crítico.

## Conferência contra a especificação

| Item | Resultado | Onde |
|---|---|---|
| Selo "Simulado" no cabeçalho, com ícone e nome acessível (CA-1, CA-5) | conforme | `SeloSimulado.tsx`; `CartaoMetrica.tsx:263`, depois da base amostral |
| Faixa entre cabeçalho e subtítulo, `role="note"` (CA-2) | conforme | `FaixaSimulado`; `CartaoMetrica.tsx:278` |
| Botão "O que é simulado?" com `aria-expanded` e `aria-controls`, inline (CA-4) | conforme | `SeloSimulado.tsx:51-66`; é `button` nativo, Enter e Espaço funcionam |
| Borda tracejada no cartão simulado (CA-3) | conforme | `CartaoMetrica.tsx:211`; o cartão real mantém a borda sólida |
| Marca d'água `aria-hidden`, sem pointer-events | conforme | `MarcaDaguaSimulado`, dentro da área do corpo |
| Prefixo "Exemplo:" na leitura e legenda da tabela (CA-12) | conforme | `CartaoMetrica.tsx:330` e `:342` |
| Sem selo em carregando e erro; vazio mantém (CA-11) | conforme | `CartaoMetrica.tsx:152` |
| Texto do selo em coluna própria no celular (CA-13) | conforme | `max-sm:basis-full` |
| Texto da faixa, explicação, selo e legenda iguais ao validado | conforme | constantes iguais às da especificação |
| Contraste (CA-6) | conforme com tokens | atencao `#8a5a00` sobre atencao-fundo `#fff4dc`: cerca de 5,4:1 (texto, mínimo 4,5); borda sobre superfície branca: cerca de 5,9:1 (mínimo 3). Cálculo manual, o QA confirma com ferramenta. O tema escuro não foi medido. |

## Decisões de tela do autor
1. Motivo visível na faixa: **confirmada**. Responde "por que é simulado" (visibilidade do status) sem poluir o selo. O motivo vem da API e está fora do texto validado, mas não o altera.
2. Cartão simulado sem dentro/fora da meta e sem selo de calibração no rodapé do cartão: **confirmada** no rodapé (`CartaoMetrica.tsx:372`), com a restrição do achado A-1: o mesmo princípio não chegou ao corpo de alguns cartões.
3. Cores pelos tokens atencao e atencao-fundo em vez dos hex do protótipo: **confirmada**. Segue o tema claro e o escuro e passa no contraste. A aparência é um pouco mais clara que a do protótipo, o que não contradiz a validação.

## Cartão simulado só na própria aba; resumo só com dado real
Conforme com a segunda decisão "A" do dono. `useMetrica` só pede o simulado quando quem chama passa `simulado: true` e a API autoriza com `simulavel`. Os cartões (O1, S1, E1, EI e os demais da amostra) passam a opção. Resumo, Visão geral, faixas "Pede atenção" e números-chave usam o padrão (`simulado: false`) e continuam recebendo "sem dado real". `OrigemDosCartoes` mantém `origemDoCartao` só com o real, então a contagem "N cartões sem dado real" do cabeçalho inclui os simulados. Isso é coerente com R6, mas ver A-6.

## Achados
- A-1 (alto) Cartões simulados mostram dentro/fora da meta no corpo: S1 (tabela, "Mediana dentro do alvo"), T2, T4, T7, T3, S7 e o complementar de sustentação usam `StatusMeta` direto. Isso contradiz a decisão do autor, o CA-3 do desenho e R6. Ocultar quando `origem` é simulada, por meio de contexto, e testar.
- A-2 (médio) `aria-label` no `span` do selo (`SeloSimulado.tsx:21`): `span` não tem papel e leitores de tela podem ignorar o nome, lendo só "Simulado". Para o CA-5 valer, usar texto visualmente oculto com a frase completa ou `role="img"` com nome. O protótipo validado tinha o mesmo desenho.
- A-3 (médio) O texto visível do selo é só "Simulado" e a explicação fica fechada. Para quem usa leitor de tela, a frase "números de exemplo, não da operação" depende do A-2. Corrigido o A-2, o ponto fica resolvido.
- A-4 (baixo) Motivo da faixa vem cru da API e pode trazer sigla interna (ex.: "P-DS-19" no mapa de origem). A especificação pede texto sem jargão para a gerência. Traduzir ou ocultar siglas no `motivoDaOrigemMock`.
- A-5 (baixo) Marca d'água em `text-4xl` com `opacity-15` sobre a tabela, no modo "Ver como tabela", pode atrapalhar a leitura em telas pequenas e não tem `overflow` contido. Conferir em 320px e no modo tabela, e esconder a marca na tabela, se for o caso.
- A-6 (baixo) O cabeçalho do painel diz "N cartões sem dado real" enquanto esses cartões exibem "Simulado". Não há contradição, mas a nota pode confundir. Sugestão: "N cartões sem dado real (com exemplo)". Decisão de microcopy do dono.
- A-7 (baixo) O botão "O que é simulado?" tem alvo de 24px no desktop (`alvo`), contra os 44px do protótipo. Passa na WCAG 2.2 AA (24px), mas a especificação pede 44px em toque. No celular o `alvo` já é de 44px (conforme).
- A-8 (baixo) A explicação aberta é um `p` com borda sem `role`; funciona com `aria-expanded`, mas a leitura inclui o texto sem anúncio de região. Aceitável: o protótipo validado era igual. Registrado apenas como observação.

## Limites desta revisão
Não executei a interface nem testes. A amostra de cartões lida foi O1, S1, E1 e EI, e o resto vem de busca textual por `StatusMeta`. O A-1 pode atingir outros cartões. O contraste do tema escuro e o comportamento em 320px ficam para o QA ou para medição manual.
