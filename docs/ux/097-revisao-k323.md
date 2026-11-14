# Revisão de UX: K-323 (E4.75)

Branch `fix/k323-filtros-web`, código em `7a3436cb`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`. Lidos: `web/src/features/filtros/{FiltroMulti.tsx,BarraFiltros.tsx,useFiltros.ts}`, `web/src/data/useMetrica.ts`, `web/src/app/App.tsx` e os testes de `filtros-componentes.test.tsx` (linhas 680 a 770). Todo item abaixo é `lido` (código e testes); nada foi executado nem medido por mim.

## Veredito

Não aprovado como está: 1 achado bloqueante, 2 médios, 3 baixos. A parte pedida do N1 (região viva da lista vazia) e os textos estão certos. O problema está no fluxo do teclado e do foco ao redor do Tentar de novo, que o teste não cobre (ele usa `userEvent.click`).

Observação de rastreio: a revisão do L6 (`docs/ux/097-revisao-l6.md`) numera os achados como A1 a A4, não N1 e N2. Conferi o que o brief descreve: A1 do L6 (lista em branco sem texto) e o mecanismo de região viva sempre montada, que vem do N1 da UX do K-295, citado no comentário de `FiltroMulti.tsx:91`.

## Conferência pedida

| Item | Resultado | Evidência (`lido`) |
|---|---|---|
| Lista vazia anunciada (N1) | atende com ressalva (B3) | `FiltroMulti.tsx:92-95,163-168`: `<p role="status">` montado vazio e preenchido por `textContent` no efeito; teste `:711` |
| Lista em branco sem texto (A1 do L6) | atende para Tipo, Sistema, Prioridade; falta Equipe (M2) | `BarraFiltros.tsx:68,82,94` têm `vazio` sempre; `:55` só no erro |
| Texto do erro | atende | "Não foi possível carregar tipos/sistemas/equipes/prioridades." diz o que houve, sem culpar; o botão ao lado é a saída |
| Posição do Tentar de novo | atende | abaixo do texto, dentro do mesmo `fieldset`, antes de "Limpar seleção" e "Fechar"; usa `Botao` com a classe `alvo` (alvo de toque do projeto) |
| Foco do Tentar de novo | reprova (B1, M1) | ver abaixo |
| A4 do review (falha repetida sem aviso) | confirmado, com nuance (M1) | ver abaixo |

## Achados

- **B1 (bloqueante, WCAG 2.1.1 Teclado, 2.4.3 Ordem de foco; heurística 9)** `FiltroMulti.tsx:350-353` com `:159-175`. No popover (desktop), `onOpenAutoFocus` faz `e.preventDefault()` e manda o foco para `buscaRef.current`. Na lista vazia ou com erro não há campo de busca, então `buscaRef.current` é `null`, o foco não vai a lugar nenhum e fica no botão do filtro. O conteúdo do popover está num portal no fim do `body`; Tab a partir do botão segue para o próximo elemento da página e fecha o popover (foco fora de uma camada não modal). Resultado: quem usa só teclado abre o filtro com erro e não alcança o Tentar de novo (nem Limpar seleção e Fechar). O teste `:729` clica com o mouse, por isso não pega. Correção: só impedir o foco padrão quando há campo: `if (buscaRef.current) { e.preventDefault(); buscaRef.current.focus() }`; sem campo, o Radix foca o primeiro elemento focável do popover (o Tentar de novo). Acrescentar teste com teclado (Enter no botão do filtro com erro, depois Enter no Tentar de novo, sem mouse). A folha mobile não tem o problema: ela foca o contêiner e o Dialog prende o foco.
- **M1 (médio, heurística 1 e 9; A4 do review)** `useFiltros.ts:73,80`, `BarraFiltros.tsx:40,55,68`. O Tentar de novo chama `refetch()`. No TanStack Query v5, uma consulta sem dado que volta a buscar sai de `error` para `pending`, então `opcoesErro` vira `false` durante a nova tentativa. Efeitos: (a) o botão some (`aoTentar` fica `undefined`) enquanto o foco está nele: o foco cai no `body` (no popover) ou no contêiner (folha); quem usa teclado perde o lugar. (b) Se a nova tentativa falha, a pessoa vê "Carregando..." e depois o mesmo "Não foi possível...", sem sinal de que tentou e falhou; em Equipe, nem o "Carregando" aparece (M2) e a região viva é desmontada e remontada, o que o leitor de tela pode não anunciar. Concordo com o A4: não há aviso próprio de falha repetida. Correção: manter o botão montado durante a tentativa, com `aria-disabled="true"` (não `disabled`, que tira o foco) e o rótulo "Tentando de novo..."; ao falhar de novo, trocar o texto da região para "Ainda não foi possível carregar tipos. Tente de novo em instantes." (contador de tentativas no `Lista` ou estado passado por `BarraFiltros`), e devolver o foco ao botão. Teste: fonte que falha duas vezes, afirmando o texto da segunda falha e `document.activeElement` no botão.
- **M2 (médio, heurística 1; resíduo do A1 do L6)** `BarraFiltros.tsx:55`. Para Equipe, `vazio` só existe com erro. Sem erro e sem opções (carregando ou recorte sem equipes) o filtro abre com campo de busca e lista em branco, o estado que o K-323 corrigiu para os outros três. Correção: `vazio={semOpcoes(!opcoes, opcoesErro, 'equipes', 'f')}` e teste de "Carregando equipes..." e de "Nenhuma equipe disponível neste recorte." Também elimina a troca de leiaute em M1 para Equipe.
- **B2 (baixo, WCAG 2.4.6, 4.1.2)** `BarraFiltros.tsx:253` com `FiltroMulti.tsx:169-173`. Na folha mobile as quatro listas ficam todas à vista; com erro aparecem até quatro botões "Tentar de novo" idênticos para o leitor de tela, todos disparando a mesma consulta. Correção: nome acessível que cita o filtro (`aria-label="Tentar carregar tipos de novo"`, mantendo o texto visível) ou um único botão na folha. Na barra desktop (um popover por vez) não há ambiguidade.
- **B3 (baixo, medição pendente)** `FiltroMulti.tsx:93-95`. A região viva é montada e preenchida no mesmo ciclo do popover (o efeito roda logo depois da montagem). Alguns pares leitor de tela e navegador não anunciam texto inserido tão perto da criação da região. Com B1 corrigido, o foco entra no popover (role `dialog` com `aria-label`) e o texto é lido no conteúdo, o que cobre a falha; mesmo assim vale medir com NVDA e VoiceOver. Quando as opções chegam, a região some sem anunciar; aceitável porque a lista aparece no lugar.
- **B4 (baixo)** `FiltroMulti.tsx:159`. `vazio as string` esconde o tipo `undefined`; o `if (vazio && ...)` já garante, então é só higiene: tirar o `as` e usar `?? ''` no efeito. Sem efeito visível.

## O que não mudou (conferido)

Com opções, a lista segue com busca, contagem e retorno do Enter (`:752` do teste); Esc, "Limpar seleção" e "Fechar" iguais; o texto de "sem opções" por gênero (Nenhum/Nenhuma) correto; `staleTime: Infinity` e `retry: false` do cliente fazem o erro aparecer de imediato e o Tentar de novo ser a única forma de repetir, o que torna M1 mais importante.

## Pendência de medição

Contraste do texto `text-texto-2` no estado de erro, leitor de tela (B3) e a ordem de foco real (B1) não foram medidos; cabe ao QA (`@axe`, teste de teclado). B1 e M1 são leitura do código e do comportamento documentado do Radix e do TanStack Query v5; um teste de teclado confirma ou derruba os dois.
