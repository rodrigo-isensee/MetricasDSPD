# 097 - Revisão de UX do K-295 (E4.45)

Revisor: ux-designer. Código: branch `fix/k295-l6-web` (worktree `/home/rodrigoisensee/MetricasDSPD-052g`, só leitura), arquivos `FiltroMulti.tsx`, `BarraFiltros.tsx`, `taticas.tsx`, `filtros-componentes.test.tsx`, `taticas.test.tsx`. Referência: `docs/ux/097-revisao-l6.md` (A1 a A4). Acessibilidade marcada `lido` (código); nada foi medido.

## Parecer

**Aprovado.** A1 e A2 do L6 foram atendidos nos textos, nos momentos e nos testes. Nenhum achado crítico, alto ou médio. Dois baixos (N1, N2), que não bloqueiam o PR.

## Conferência contra A1 e A2

| Pedido da revisão do L6 | Resultado | Onde |
|---|---|---|
| Texto "Nenhum tipo disponível neste recorte." | Atende; Sistema e Prioridade usam o mesmo molde ("Nenhum sistema...", "Nenhuma prioridade...", gênero correto) | `BarraFiltros.tsx:25-29,58,71,82` |
| "Carregando tipos..." enquanto não há opções | Atende (`!opcoes`), também para sistemas e prioridades | `BarraFiltros.tsx:26-28` |
| Aparece só com lista vazia | Atende: `vazio && opcoes.length === 0`; com opções, a lista normal e a busca | `FiltroMulti.tsx:151` |
| Sem campo de busca na lista vazia | Atende: retorna só legenda e parágrafo | `FiltroMulti.tsx:151-159`; teste linhas 684, 688, 697 |
| Anúncio por região viva | Atende em parte (`lido`): `<p role="status">` (polite implícito). Ver N1 | `FiltroMulti.tsx:155` |
| T11: "Sem outros tipos no dado deste recorte." só com dado carregado e sem tipos | Atende: `opcoes && tiposAba.length === 0`; nunca durante o carregamento | `taticas.tsx:280-284`; testes 304, 325-326, 338 |
| A3 (id estranho) | Atende: `tiposOpc` filtra por `TIPO_POR_ID` | `BarraFiltros.tsx:39`; teste 714-719 |
| A4 (prova de que a aba some) | Atende: testes com opções sem um tipo e com lista vazia | `taticas.test.tsx` 304-338 |

Foco e teclado: o `Popover.Content` ainda recebe `aria-label`, e a busca some só na lista vazia; sem campo para focar, o `onOpenAutoFocus` faz `buscaRef.current?.focus()` com ref nula e o foco fica no conteúdo do popover (`lido`; Esc fecha e devolve o foco ao botão, coberto pelo teste da linha 685).

## Achados

- **N1 (baixo, WCAG 4.1.3, `lido`)** `FiltroMulti.tsx:155`. O `role="status"` nasce junto com o texto, ao abrir o popover. Leitores de tela costumam não anunciar uma região viva inserida já preenchida. A pessoa ouve o nome do diálogo e a legenda, mas o texto pode não ser lido sozinho. Correção: manter o parágrafo (texto visível, que o leitor alcança pela navegação) e dar ao fieldset ou ao popover `aria-describedby` apontando para o parágrafo, ou manter a região viva montada e só trocar o conteúdo. Não bloqueia: o texto está visível e é alcançável.
- **N2 (baixo, heurística 9, recuperar de erro)** `BarraFiltros.tsx:58,71,82` + `useOpcoesFiltro`. O carregamento é `!opcoes`. Se a chamada das opções falhar (rede), `data` continua indefinido e o filtro mostra "Carregando tipos..." para sempre, sem dizer que houve erro. O comentário em `BarraFiltros.tsx:25` assume o limite ("a lista não distingue"). Correção futura: usar `isPending` para o carregando e, em `isError`, "Não foi possível carregar os tipos. Recarregue a página." Em T11 o mesmo estado só mostra "Todos os tipos", sem aviso (aceitável). Recomendo cartão pequeno, sem barrar.

## Conferido sem achado

- Português do Brasil, voz direta, sem culpar a pessoa; reticências "..." como no restante da interface.
- Texto em `text-texto-2` (mesmo token das demais mensagens de lista; contraste `lido`, o QA mede).
- Equipe segue sem `vazio` (fora do escopo do K-295; lista em branco só se as equipes vierem vazias, estado que a E4 do pedido trata nos times).
- Nenhuma tela mostra métrica individual nem ranking por pessoa: as mudanças só tocam filtros de Tipo, Sistema, Prioridade e as abas do T11 (agrupamentos por tipo de demanda, não por pessoa). Sem comparação entre times, sem meta por pessoa.
- BusinessMap e Acelerato seguem separados: Tipo e Sistema leem `opcoes.dominio === 'businessmap'`, Prioridade lê `acelerato`.
