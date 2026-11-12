---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l5-resumo-equipe
commit: 914f082ca60321143ae7388f4d7c8074d4b8dedc
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L5 do 097, filtro Equipe dentro de cada bloco do Resumo (E3.2, K-273)

## Achados
- A1 (recomendado) web/src/features/operacional/resumo/BlocoFluxo.tsx:24 · `useFiltros('operacional')` liga a memória de sessão no Resumo: a equipe do bloco Fluxo passa a seguir para o Tático e a visão Fluxo. É regra de produto: pergunta ao dono pelo Jarvis.
- A2 (recomendado) web/src/features/operacional/resumo/FiltroEquipeBloco.tsx:83 · `data-testid="aviso-consolidado"` repete nos dois blocos; os testes usam `within`, mas um id por bloco (`aviso-consolidado-${bloco}`) evita ambiguidade no e2e.

## Parecer
Aprovado em 914f082c. Li o diff inteiro `696ca87c...914f082c` (13 arquivos) e as linhas 110 a 120 de `docs/ux/097-filtros-time-busca.md`. O `80689ee1` por cima é só o parecer do QA, que não refiz.

- **Dois conjuntos na mesma URL (`useFiltros.ts`, `buscaPendente.ts`):** quando a URL vigente (com a pendente) é igual à renderizada, o efeito usa `normalizada.p` como antes: nos painéis de um conjunto só o comportamento não muda, fora o `registrarBusca` também na normalização, que só antecipa a mesma busca. Quando outro conjunto já normalizou no mesmo instante, aplica só a sua diferença por chave e soma os avisos (`invalidosPendentes`, presos à rota e aos 3 s). Prova: equipe.test.tsx, caso "as duas normalizações da URL se somam" (fluxo descarta o inválido, Sustentação troca o id antigo pelo slug; sem a soma, a segunda escrita apagaria a primeira) e buscaPendente.test.ts (rota, troca e validade).
- **Contagem dos guardados:** `contarAtivos(..., semEquipe)` só no Resumo; Fluxo e Sustentação contam como antes. duas-fontes.test.tsx e resumo.test.tsx passam de 2 para 1 ativo com `equipe=x&periodo=4s`.
- **Nenhuma comparação entre equipes (CA-4, CA-5, regra inviolável):** um conjunto de números por bloco, aviso consolidado com 2 ou mais, chips só de equipe, fontes nunca misturadas (`useOpcoesFiltro` por fonte do bloco; CA-2 testado sem interseção). CA-6 mantém "não publicado" abaixo de 20.
- **Tendências:** `filtrosTendencia` só leva `equipe` com seleção (mesma chave de cache sem ela); o servidor aceita desde o L4 (#333, `queryTendenciaSchema` com `lista(idSlug)`, `.strict()`).
- **Testes locais (VITEST_MAX_WORKERS=2):** `vitest run src/features/filtros src/features/operacional/resumo`, 15 arquivos, 215 testes passando. A suíte completa e o e2e (`resumo-equipe.spec.ts`) ficam no CI do PR.
- **Tamanho:** 633 linhas de código e teste (`git diff --numstat --no-renames origin/develop...914f082c`); o corpo do PR leva `teto: excedido, 633 linhas, filtro por bloco com os dois conjuntos na mesma URL e 286 linhas de teste dos CA-1 a CA-6`.
- **Regras de `praticas.md`:** o arquivo não marca regras com "decidida por"; li o checklist da skill sobre o diff.
- **Commits:** um `feat(operacional)` em Conventional Commits em português.
