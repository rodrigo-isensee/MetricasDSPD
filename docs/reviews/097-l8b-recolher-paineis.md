---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l8b-recolher-paineis
commit: 50561b925cd3c9a4f5cc7623c68c5dfcfc46d910
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Review: L8b do 097, recolher cartão ligado nos painéis (E4.52)

## Achados
- A1 (recomendado) web/src/components/ui/CartaoMetrica.tsx:152 · `useRecolhido` registra como montado o cartão com `recolhivel={false}` (AP-KPIS); com `AP-KPIS` na memória (só por edição manual), o "Restaurar" aparece sem cartão recolhido. Não registrar nesse caso, com teste.
- A2 (recomendado) web/src/features/apontamento/components/CartaoDistribuicao.tsx:173 · o resumo do AP-PROJETO conta `linhas.length`, que inclui a linha sem projeto identificado quando ela existe; conferir com a UX se "N projetos" deve contá-la.

## Parecer
Aprovado em 50561b92. Li o diff `4bb55c33...50561b92` (11 arquivos) e o `git show --remerge-diff 50561b92`.

- **Resolução dos conflitos:** o remerge-diff mostra os conflitos de `CartaoMetrica.tsx`, `Recolhidos.tsx`, `recolhidos.test.tsx` e `ApontamentoPage.tsx` resolvidos pelo lado do L8b. O diff contra a develop, nesses arquivos, só acrescenta o L8b sobre o L8a da develop (`montados`/`registrar`, `resumoDoRecolhido`, seletor `main [data-cartao-titulo]`, aviso condicionado, `CODIGO_CARTAO` exportado): nenhum ramo do mecanismo do L8a (memória validada por zod, teto, `gravarPainel`, `recolhivel`) foi removido ou mudou de condição.
- **ApontamentoPage:** `git diff -w` contra a develop mostra só o `ProvedorRecolhidos painel="apontamento"` em volta da seção e o `RestaurarRecolhidos`; `equipes`/`removerEquipe` (linhas 94-95), `nomesReais` com o `AvisoNomeReal` e o vazio do K-303 (`kpis.apontamentos === 0`, linhas 99 e 146-150) ficaram como na develop.
- **Ressalvas do L8a, com teste em `recolhidos.test.tsx`:** M1 (sem dado real e vazio no resumo, selo de origem visível recolhido; `it.each`), M2 (carregando e atualizando), B1 (aviso some ao recolher de novo e volta na segunda restauração), B2 (código sem cartão montado e cartão ocultado não fazem o "Restaurar" aparecer), A1 (todos os códigos do catálogo e da aba Apontamento casam com `CODIGO_CARTAO`, com mínimo de 20 itens), A2 (foco vai ao título dentro do `main`, com um título-isca fora). A3 é a linha nova de `docs/tecnica/arquitetura-front.md`.
- **`docs/tecnica/arquitetura-front.md`:** legítimo. É a ressalva A3 do review do L8a (documentar a chave `metricas-dspd:recolhidos:v1` quando o provedor entrasse nas páginas); o texto confere com o código (regex, teto, KPIs com `recolhivel={false}`, Resumo sem provedor).
- **Nada por pessoa recolhido:** o resumo padrão é a base do cartão (n de apontamentos/itens) ou "Recolhido."; o único `resumoRecolhido` próprio é o do AP-PROJETO (total de projetos e de horas, sem nome; teste `recolher.test.tsx` com regex fechada). Os cartões de qualidade e capacidade por pessoa não têm base nem resumo próprio e mostram só "Recolhido.". A memória guarda só id de painel e código de cartão.
- **Painéis:** o `Casca` envolve Operacional, Tático, Estratégico e Sustentação; `painel.test.tsx` prova recolher e restaurar nas quatro rotas. AP-KPIS não recolhe (`recolher.test.tsx`).
- **Testes locais (VITEST_MAX_WORKERS=2):** `recolhidos.test.tsx`, `apontamento/recolher.test.tsx` e `painel/painel.test.tsx`: 3 arquivos, 38 testes passando. Mutação: 19 mutantes mortos, pelo PQ do autor (não refiz).
- **CI do head 50561b92 (check-runs, run 43547092049):** `testes`, `rapida`, `build`, `banco`, `seguranca`, `openapi`, `imagem` e `filtro` com `success`; `e2e`, `e2e-parte` e `perf` pulados pelo filtro da CI.
- **Tamanho:** 548 linhas de código e teste (`git diff --numstat --no-renames 4bb55c33...50561b92`, fora o `.md`), a maior parte reindentação do `ApontamentoPage` e do `PainelPagina` pelo provedor novo e os testes das ressalvas; o corpo do PR leva `teto: excedido, 548 linhas, reindentação pelo ProvedorRecolhidos e testes das ressalvas M1, M2, B1, B2, A1 e A2`.
- **Regras de `praticas.md`:** o arquivo não marca regras com "decidida por"; li o checklist da skill sobre o diff.
- **Commits:** `feat(web)` do L8b e o merge da develop com a resolução descrita na mensagem.
