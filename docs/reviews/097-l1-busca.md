---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l1-busca
commit: b5d206efc8fe4ab6bd38b19147d26c95bcceaf28
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: busca digitando nos filtros de lista (097 L1, E3.2, K-273)

## Achados
- A1 (bloqueante) web/src/features/filtros/BarraFiltros.tsx:217 · na folha, o Dialog decide pelo texto de qualquer campo `[data-busca-filtro]` do documento, e só limpa o da lista focada: com texto em Equipe e foco em outro filtro ou em "Ver resultados", Esc não limpa nem fecha (S1, S2; CA-14/16).
- A2 (bloqueante) docs/tecnica/arquitetura-front.md:135 · a seção 4 (filtros) não registra a busca: estado local fora da URL, zerado ao abrir/fechar, e o contrato do Esc entre FiltroMulti e o Popover/Dialog (`data-busca-filtro`). praticas.md, review item 10: falta de doc de front bloqueia.
- A3 (recomendado) web/src/features/filtros/FiltroMulti.tsx:274 · no Popover a regra "Esc com texto limpa" vive em três lugares (onEscapeKeyDown, aoTeclarCampo:95, aoTeclarLista:101); por isso o mutante da linha 101 sobrevive ao teste do Popover (parecer do QA). Ao corrigir o A1, uma regra só.
- A4 (recomendado) web/src/features/filtros/FiltroMulti.tsx:114 · na folha há até quatro campos com o mesmo nome acessível "Buscar"; o contexto vem só da legend do fieldset. Sugestão: manter o rótulo visível e completar o nome com texto sr-only ("Buscar em {rotulo}").

## Sondas
- S1 · folha em /operacional, digitar "zz" na busca de Equipe, focar a busca (vazia) de Tipo, Esc, Esc · espera: Esc sem texto no campo focado fecha a folha · obtido: `aberto=true equipe=zz` (folha aberta, texto intacto)
- S2 · folha em /operacional, digitar "zz" na busca de Equipe, focar "Ver resultados", Esc, Esc · espera: Esc limpa o texto ou fecha · obtido: `aberto=true equipe=zz` (Esc sem efeito)

## Parecer
Reprovado por A1 (defeito provado por sonda) e A2 (requisito de documentação do projeto). Diff lido: `f4c122f1..b5d206ef` (código e teste: BarraFiltros.tsx +7, FiltroMulti.tsx +114 −3, filtros-componentes.test.tsx +155).

- **CA-10 a CA-13, CA-15:** atendidos. Campo "Buscar" com `label` visível e foco ao abrir (`onOpenAutoFocus`); `normalizarBusca` tira acentos (NFD + `\p{M}`) e caixa; contagem e lista vazia anunciadas numa região `role="status"`/`aria-live="polite"` montada antes da mudança; seleção fora da busca mantida e contada.
- **Q-1 (busca também em listas curtas, decisão do dono de 2026-11-11 14:05):** atendida, o campo aparece em todo `FiltroMulti`, sem limiar.
- **Estado fora da URL:** `useState` local no `FiltroMulti`; `onOpenChange` zera ao abrir e ao fechar; na folha o conteúdo do Dialog desmonta ao fechar, o que também zera. Nada passa por `useFiltros`.
- **CA-14/CA-16 e o `onEscapeKeyDown`:** no Popover o comportamento está certo, mas a lógica está duplicada (A3). No Dialog, o critério ("algum campo da página tem texto") diverge do que limpa ("o campo da lista focada"), o que gera a tecla morta do A1. Correção sugerida: o Dialog olha só a lista do alvo do evento (por exemplo, `closest('fieldset')` do `e.target` e o `[data-busca-filtro]` dela), a mesma regra do Popover; e um teste do ramo "texto em outro filtro, foco fora dele".
- **Teto de linhas:** 279 linhas de código e teste, acima de 150; declarado no corpo de b3b1a6cd (`teto: 150 linhas excedidas…`). O PR (E3.4) leva a linha no formato `teto: excedido, <n> linhas, <motivo>` com o total final.
- **Verificação local:** `npx vitest run src/features/filtros --maxWorkers=2` no HEAD 8e1edc5a (código igual a b5d206ef): 11 arquivos, 113 testes passando. As sondas S1 e S2 rodaram num arquivo de teste temporário, apagado depois (árvore limpa). A suíte completa fica com o CI do PR.
- **Pareceres da branch:** QA aprovado em 8e1edc5a (cobertura do web 100%); não o refaço. A revisão de UX segue com o ux-designer.
- **Commits:** Conventional Commits em português, um por mudança, `Cartão: K-273`.
