---
tipo: qa
contrato: 1
pedido: 011-fase2-estrategicas
branch: feature/011-fase2-estrategicas
commit: 3aeaa3d
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-16
---

# QA: back da fase 2 do pedido 011, lote 1 (estratégicas: E6, E7 com R$, E8)

Links: plano `docs/qa/011-back-plano.md` (casos E6, E7, E8), arquitetura `docs/architecture/features/metricas-tambem-disponiveis.md` §2, review `docs/reviews/011-fase2-estrategicas.md` (aprovado), segurança `docs/security/011-fase2-estrategicas.md` (aprovado, na `feature/011-fase2-back`, sem commit).

**Veredito: aprovado.** Zero bug aberto. Escopo incremental: só o diff `f81567e..3aeaa3d`; os casos da fase 1 seguem cobertos pelo parecer `docs/qa/011-back.md` e passam na suíte completa.

## Execução
- `pnpm run pronto` na raiz da worktree, sobre `3aeaa3d`: **rc=0** (load 0,06 no início, 4,4 GB livres). Testes: metricas 985, mock 221, contratos 134, server 569 passaram (84 pulados, os que exigem banco real, preexistentes e fora do diff), web 1045, tools 222. Cobertura 100% nos pacotes, `docs:check` ok (65 métricas).
- Nenhum teste foi marcado `skip` neste lote.

## Critério → teste → resultado
| Critério / regra | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-20, D-7 (E6, deslize em dias úteis, tolerância zero) | `e6.test.ts:47,55,65` | dia da data comprometida (0), um dia depois, fim de semana | passou |
| CA-20 (E6, projeto sem data vira `semData`) | `e6.test.ts:99` | vazio / sem extensão | passou |
| Mínimo 20 (E6: percentual, P50/P85) | `e6.test.ts:118` | 19 sem estatística, 20 com | passou |
| Janela de 12 semanas no percentil, período na contagem | `e6.test.ts:132` | item fora da janela conta, mas não entra no percentil | passou |
| Só projeto (story, frente e projeto não se misturam) | `e6.test.ts:159` | demanda, frente, projeto aberto fora | passou |
| Sem pessoa nem equipe (E6) | `e6.test.ts:184` | schema estrito | passou |
| Q-E7-1 (pró-rata por dias corridos) | `e7.custo.test.ts:25-71` | mês cheio, meio mês, meses de tamanhos diferentes, troca de vigência, ano 365/366, sem vigência = `null` (nunca 0) | passou |
| D-1' = A, CA-35 (rateio do custo total pela participação) | `e7.custo.test.ts:99,136,145` | soma dos rateados não passa do total; 2 casas; sem horas, equipe, pessoa | passou |
| CA-13 (sem configuração, sem R$) | `e7.custo.test.ts:108`; `e7.test.ts` | `custoConfigurado: false`, valores nulos | passou |
| Mínimo de 20 por sistema, "k de n" | `e7.custo.test.ts:121`; `e7.test.ts` 19/20 | 19 sem R$ nem participação, 20 com | passou |
| CA-23, CA-11 (naturezas, ordem neutra) | `e7.natureza.test.ts`, `e7.test.ts` | 4 naturezas sempre; menos de 20 no fim | passou |
| D-3, R-1 = B, CA-10 (E8: só contagem, sem nomes) | `e8.test.ts:37,58,91` | 4 sistemas fecha, 5 abre; schema rejeita lista de nomes e campo de pessoa | passou |
| E8 sem entrega não conta; filtros não atuam | `e8.test.ts:74,110` | `entregas` 0 | passou |
| T2.6 (E6 e E8 fora do `afeta` do descarte nativo) | `o23.test.ts:70`, `fase2.regras.test.ts` | lista nominal e contagem 48 | passou |
| Nada de pessoa na saída (rota) | `server/tests/metricas.test.ts:531-541`, `tambem2.test.ts`, P6 | `responsavel=` dá 400 | passou |
| A-2 (rota) | `qa011-fase1.api.test.ts:57-75` | E6 e E8 200 no schema; O22, O26, T13, T14, O27, T15, E10 seguem 404 | passou |

## Conferência pedida pelo review, ponto (c)
- `qa011-fase1.api.test.ts` (A-2 de 404 para 200): **aceita.** A premissa mudou por decisão (as ids entraram com cálculo). A obrigação "nenhum dado inventado" continua guardada: as ids dos lotes seguintes, da fase 3 e inexistentes seguem em 404 com `METRICA_NAO_ENCONTRADA`, e o teste varre 7 ids. Ressalva (R3 do review, baixa): o título promete "o estado vazio" e a asserção só confere 200 e schema. Sem bug; ajuste de título fica para o autor no lote seguinte.
- `o23.test.ts` e `t11.test.ts`: **aceitas.** O23 troca a lista nominal por `['T11','E6','E8']` e a contagem 46 por 48 (a trava continua igual, só cresce com as ids novas) e agora afirma "sem marcação" para as 3 ids, em vez de só o T11. O T11 acrescenta o campo novo da extensão (`EXTENSAO_TAMBEM_BM_VAZIA`), sem relaxar asserção.

## Vermelho antes do verde (mutação manual no diff, `packages/metricas`)
Sem Stryker rodado (teto de recursos); quatro mutantes aplicados um por vez, com restauração por `git checkout`. Comando: `npx vitest run src/businessmap/{e8,e7.custo,e7,e6}.test.ts` (base: 38 passam).
| Mutante | Falha observada |
|---|---|
| `MINIMO_SISTEMAS_E8` 5 → 4 | `e8.test.ts` "CA-10: com 4 sistemas as faixas não abrem; com 5 abrem" |
| E7: rateio com `e >= 1` no lugar de `>= MINIMO_AMOSTRA` | `e7.custo.test.ts` "abaixo de 20 entregas ... só k de n" |
| `custo.ts`: divisor de dias do mês fixo em 30 | `e7.custo.test.ts` (meses de tamanhos diferentes; anual 365/366), 2 falhas |
| E8: `s.entregas > 0` → `>= 0` | `e8.test.ts` "sistema sem entrega na janela não conta" |
Nenhum sobrevivente. Código de produção restaurado (`git status` limpo nos pacotes).

## Observações (sem bug)
- E7 com R$: o `custoPorDemanda` sai igual em todos os sistemas (rateio por contagem). É a aritmética de D-1' = A; o usuário precisa saber disso (já anotado no review).
- O R$ do E7 só existe por fixture; a rota e o mock não trazem custo (CA-13 confirmado).
- Pendência de fase 3 (segurança B-1 e review R1): E8 passar a ler `temEntrega` em vez de `entregas`. Não bloqueia este lote.
- Divergência E7 (spec previa 18 a 20 sistemas, mock gera 8) segue para validação do usuário.
- Não testado aqui: front (pedido 021), lotes 2 e 3, coleta real (fase 3).
