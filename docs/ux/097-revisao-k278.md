# Revisão de UX do 097, lote K-278 (ressalvas da busca nos filtros)

Revisor: ux-designer. Código: branch `fix/k278-ux-busca`, head 9e5ece3b, worktree `/home/rodrigoisensee/MetricasDSPD-052c` (só leitura), arquivos `web/src/features/filtros/FiltroMulti.tsx`, `BarraFiltros.tsx` e `filtros-componentes.test.tsx`. Referência: `docs/ux/097-revisao-l1.md` (A1 a A8).

Método: tudo `lido` (código e nomes e corpos dos testes). Nada foi executado nem medido; foco real, leitor de tela e contraste ficam para o QA (`@axe`), que já aprovou (3b5df0c3). Os CA-10 a CA-16 seguem hipótese de especificação até o dono validar o protótipo.

## Veredito: aprovado
Todos os achados A1 a A7 e o placeholder do A8 ficaram como a revisão do L1 pediu. Nenhum achado crítico, alto ou médio novo. Um achado baixo novo (N1, o recomendado do review), que recomendo corrigir mas não bloqueia o PR.

## Conferência dos achados (lido)
| Achado | Pedido | Resultado | Onde (código / teste) |
|---|---|---|---|
| A1 médio, foco da folha | Não focar a busca ao abrir a folha | Atendido: `onOpenAutoFocus` com `preventDefault` e foco no `Dialog.Content` (`tabIndex=-1`) | BarraFiltros.tsx:210-219 / teste "K-278 A1" (folha com foco) |
| A2 médio, nome do popover | `aria-label={rotulo}` no `Popover.Content` | Atendido | FiltroMulti.tsx:314 / teste "K-278 A2" (`dialog` com nome "Equipe") |
| A3 baixo, contagem | "de N" e "N opções" acima de 12 | Atendido: "N opção(ões) encontrada(s) de M." e "N opções" (visual, `aria-hidden`, só sem busca) | FiltroMulti.tsx:103-107, 169-173 / dois testes "A3" |
| A4 baixo, fora da busca | Frase anunciada; microcopy única | Atendido: frase na mesma região viva, texto alinhado à especificação "(continua aplicada)", cópia visual `aria-hidden` para não duplicar | FiltroMulti.tsx:102, 109, 166-182 / teste "A4" |
| A5 baixo, Enter alterna | Anunciar "Marcada: X." / "Desmarcada: X." | Atendido: `retorno` entra na mesma região; digitar zera | FiltroMulti.tsx:101, 121-129, 156-159 / teste "A5" |
| A6 baixo, Esc por foco | Mesma regra no popover e na folha | Atendido: ambos só limpam com o foco dentro do `fieldset` com texto (`escLimpaBuscaFocada`); em "Fechar" ou "Limpar seleção" o Esc fecha | FiltroMulti.tsx:53-59, 320-324; BarraFiltros.tsx:220-223 / teste "A6", S1, S2 |
| A7 baixo, rótulo | "Limpar seleção" | Atendido | FiltroMulti.tsx:345 / testes das linhas 143 e 150 |
| A8 baixo, ajuda | Placeholder "Digite para buscar" | Atendido; "Limpar busca" aguarda o dono e não é achado | FiltroMulti.tsx:154 / teste "A8" |

Observações de leitura, sem achado: o rótulo visível "Buscar" mais o `sr-only` "em {rótulo}" segue com nome acessível que começa pelo texto visível (WCAG 2.5.3); os campos da folha têm nomes distintos (teste "A4" da folha); contagem e retorno numa só região `role="status"` evitam anúncio duplo. Ressalva já conhecida: o placeholder é texto de ajuda, não substitui o rótulo, que continua visível (`lido`); contraste do placeholder não medido (QA).

## Achado novo

### N1. Baixo: o aviso "Marcada: X." / "Desmarcada: X." fica na região viva depois de um clique ou do Esc (o recomendado do review)
- Onde: `FiltroMulti.tsx:101` (estado `retorno`), zerado só em `onChange` do campo (linhas 156-159); não é zerado em `alternar` (clique ou Espaço na caixa) nem no Esc (`setBusca('')` direto, linha 114).
- Por quê: o retorno descreve a última ação do Enter. Depois de outra marcação por clique, ou depois do Esc, a região viva ainda contém "Marcada: Beta." e, ao mudar a contagem (o Esc a esvazia; um filtro novo a troca), o texto inteiro é recomposto e leitores de tela tendem a relê-lo, anunciando um estado velho, até incorreto (a Beta pode ter sido desmarcada por clique). Heurística: visibilidade do status (informação correta). `lido`; o QA mede com leitor de tela.
- Opinião sobre o recomendado: concordo; apagar o aviso ao marcar por clique e no Esc é a correção certa e de baixo risco. Regra simples: o retorno vale só até a próxima ação que não seja a do Enter, então zerar em `alternar` quando a origem não for o Enter (zerar antes de chamar, e o Enter define o texto depois), no Esc (callback de limpar) e ao fechar. Os alternados "Marcada"/"Desmarcada" continuam funcionando, pois cada Enter reescreve o texto. Teste sugerido: Enter marca, clique em outra opção, região sem "Marcada"; e Enter marca, Esc, região vazia.
- Pode entrar neste PR ou virar cartão pequeno; não bloqueia.

## Para o QA medir (`@axe` e leitor de tela)
Foco da folha no contêiner e devolução ao botão ao fechar; anúncio único (sem repetição) de contagem, frase "fora da busca" e retorno do Enter; nome do popover ao abrir; contraste do placeholder e do texto `text-texto-2`; alvo de 24 px a 640 px.
