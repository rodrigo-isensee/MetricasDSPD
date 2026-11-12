---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k284-aviso-marcada
commit: 34140469ec5b09ad5e65df00e7f498abb390bca3
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: K-284, aviso "Marcada: X." sai da região viva no clique e no Esc (097, E3.3)

Base develop bbdf9976. Diff `origin/develop...34140469`: `web/src/features/filtros/FiltroMulti.tsx` e `filtros-componentes.test.tsx`. Obrigação: N1 da revisão de UX do K-278 (`docs/ux/097-revisao-k278.md`).

## Veredito
**Aprovado.** A volta 1 corrige o único achado (A1, `format:check`). O delta `b1481e32..34140469` (`forge-check parecer delta`) toca só `FiltroMulti.tsx`: a quebra de linha do Prettier em `aoEsc` (`if (e.key === 'Escape')` com o `escLimpaBusca` na linha seguinte), sem mudança de lógica. O CI do head fechou verde, inclusive `rapida`.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| N1: clique na caixa apaga o aviso | "K-284: o clique na caixa apaga o aviso "Marcada" da região viva" | região viva sem "Marcada" nem "Desmarcada" depois de outra ação | passa; cai com a mutação 1 (parecer anterior, código inalterado) |
| N1: Esc apaga o aviso | "K-284: o Esc apaga o aviso "Marcada" da região viva" | região viva vazia depois do Esc | passa; cai com a mutação 2 (idem) |
| K-278 A5: Enter anuncia uma vez e alterna Marcada/Desmarcada | "K-278 A5: Enter com uma opção anuncia "Marcada" e depois "Desmarcada"" (existente) | um só aviso por Enter | passa |

## Execução (revalidação no head 34140469)
- `npx prettier --check` nos dois arquivos do diff: `All matched files use Prettier code style!`.
- `VITEST_MAX_WORKERS=2 npx vitest run src/features/filtros/filtros-componentes.test.tsx` em `web/`: 1 arquivo, 43 passaram.
- Mutações 1 e 2 e o vermelho: já provados no parecer anterior; o delta é só quebra de linha, sem efeito sobre eles.
- CI do head (run 43151881848, sha 34140469): `rapida`, `testes`, `banco`, `build`, `openapi`, `imagem`, `seguranca` e `filtro` com sucesso; `e2e` e `perf` ignorados; run `completed success`.

## Achados
