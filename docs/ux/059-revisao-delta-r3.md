# Revisão de UX da aba Apontamento, renovação r3 (pedido 059, E2.33)

Veredito: aprovada. O filtro por tipo está sempre visível, com rótulos, chip e remoção corretos, e o recorte vazio por id inexistente tem estado vazio com saída. A sonda e o aviso de filtro indisponível foram retirados. Nenhum achado crítico, alto ou médio; três baixos novos, que não bloqueiam o PR.

Método: leitura estática na worktree 052h de `BarraFiltrosApontamento.tsx`, `filtros.ts`, `ApontamentoPage.tsx`, `textos.ts`, `FiltroMulti.tsx`, `ChipsFiltros.tsx` e do bloco "filtro por tipo" de `ligacao.test.tsx`, contra `docs/ux/059-revisao-delta-r2.md`. Não executei a aplicação nem a suíte (o papel não tem Bash). Comportamento visual e contraste reais seguem com o QA. Nenhum nome de pessoa neste parecer.

## Conferência

| Ponto | Resultado | Evidência |
|---|---|---|
| Filtro por tipo sempre visível | Atendido | `BarraFiltrosApontamento` renderiza o `FiltroMulti` de Tipo sem condição, entre Projeto e Subgrupo, como a ordem documentada. Teste "fica sempre visível" confere o botão e que a primeira chamada é a da aba. |
| Sonda e aviso de indisponível retirados | Atendido | Busca por indispon, sonda e 422 nos arquivos que não são de teste não acha nada na aba; o teste confirma que não há consulta de sondagem. |
| Rótulos | Atendido | Botão "Tipo: Todos" (gênero masculino), "Tipo: Correção" com um, "2 selecionados" com dois; a lista mostra o rótulo, e o id (dígitos) só vai à URL e à rota. |
| Chip e remoção | Atendido | Chip "Tipo: Correção" com nome acessível "Remover filtro Tipo: Correção"; remover um valor mantém os demais; "Limpar filtros" apaga o tipo junto com os outros. |
| Estado vazio com id inexistente | Atendido | `tipo=999` vai à rota, volta zero apontamentos e a página mostra "Nenhum apontamento encontrado", com a barra e o chip acima, e o chip sai pelo X voltando ao recorte cheio. |
| Valor antigo na URL (rótulo em vez de dígitos) | Atendido | Descartado sem eco, com o aviso "Valor inválido ignorado em: Tipo", e nunca enviado à rota. |
| Mobile | Atendido | A barra recolhe em "Filtros (n)", e os chips ficam fora do painel recolhido, então o filtro de tipo ativo continua visível e removível. |

## Achados

- [baixo] R3-1. Onde: `filtros.ts` (`nomeDoValor`) e `resumo` de `FiltroMulti`, com `tipo=999`. Por quê: id fora das opções aparece cru ("Tipo: 999") no chip e no botão do filtro, e quem lê não sabe o que é 999. Correção: trocar o rótulo do valor desconhecido por "Tipo não encontrado" (só no chip e no botão, o id segue na URL).
- [baixo] R3-2. Onde: texto `VAZIO.texto`, "Nenhum apontamento atende aos filtros atuais." Por quê: o estado vazio não diz como sair, e o botão "Limpar filtros" fica acima, longe do olhar. Correção: acrescentar "Remova um filtro ou use Limpar filtros." e avaliar levar o botão ao próprio estado vazio.
- [baixo] R3-3. Onde: `FiltroMulti` de Tipo quando `opcoes.tipos` vier vazio (base sem tipo coletado). Por quê: o popover abre sem nenhuma caixa e sem explicação. Correção: mostrar "Nenhum tipo disponível no período" dentro da lista vazia; só se a rota puder devolver lista vazia, o que o arquiteto confirma.

## Pendências herdadas, sem mudança

- R2-1 e R2-2: verificação visual em 375 px, com o QA.
- R2-3: o dono confirmar o texto de `NOTA_OUTRA_AREA`.

## Recomendação
Liberar o filtro por tipo da perspectiva de UX. R3-1 a R3-3 podem entrar na volta do QA ou virar melhoria depois; nenhum bloqueia o PR.
