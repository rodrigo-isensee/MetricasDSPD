---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k284-aviso-marcada
commit: b1481e32fc6279c9f416c205d1e9fad5dba37e5a
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-12
---

# QA: K-284, aviso "Marcada: X." sai da região viva no clique e no Esc (097, E3.3)

Base develop bbdf9976. Diff `origin/develop...b1481e32`: `web/src/features/filtros/FiltroMulti.tsx` (+7/-2) e `filtros-componentes.test.tsx` (+21). Obrigação: N1 da revisão de UX do K-278 (`docs/ux/097-revisao-k278.md`).

## Veredito
**Reprovado, por um item só e mecânico.** A correção funcional está certa e provada, mas o check `rapida` do CI do head falhou no passo `pnpm run format:check`: o Prettier reescreve o `if (e.key === 'Escape')` de `aoEsc` (FiltroMulti.tsx:116). Reproduzido local: `prettier src/features/filtros/FiltroMulti.tsx` difere do arquivo só nas linhas 116-117 (quebra de linha depois do `if`); o arquivo da base não tinha esse desvio. Rodar `prettier --write` nesse arquivo e reenviar resolve; o código não muda.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| N1: clique na caixa apaga o aviso | "K-284: o clique na caixa apaga o aviso "Marcada" da região viva" | região viva sem "Marcada" nem "Desmarcada" depois de outra ação | passa; cai com a mutação 1 |
| N1: Esc apaga o aviso | "K-284: o Esc apaga o aviso "Marcada" da região viva" | região viva vazia depois do Esc | passa; cai com a mutação 2 |
| K-278 A5: Enter anuncia uma vez e alterna Marcada/Desmarcada | "K-278 A5: Enter com uma opção anuncia "Marcada" e depois "Desmarcada"" (existente) | um só aviso por Enter | passa (43/43) |

## Execução
- `VITEST_MAX_WORKERS=2 npx vitest run src/features/filtros/filtros-componentes.test.tsx` em `web/`: 1 arquivo, 43 passaram.
- Enter segue anunciando uma vez: em `alternar` o `setRetorno('')` roda antes e o `setRetorno('Marcada: X.')` do Enter logo depois, no mesmo lote; vale o último. O teste A5 e o novo teste do clique (que começa por Enter e vê "Marcada: Beta.") confirmam.
- Mutação 1 (tirar `setRetorno('')` de `alternar`): `× K-284: o clique na caixa apaga o aviso "Marcada" da região viva`, 1 falhou, 42 passaram.
- Mutação 2 (tirar `setRetorno('')` do callback do Esc): `× K-284: o Esc apaga o aviso "Marcada" da região viva`, 1 falhou, 42 passaram.
- Os dois arquivos foram restaurados depois de cada mutação; `git status --short` limpo.
- CI do head b1481e32 (run 43150708985): `testes`, `banco`, `build`, `openapi`, `imagem`, `seguranca`, `filtro` com sucesso; `e2e` e `perf` ignorados; `rapida` com falha (format:check). O run está `completed failure`.

## Achados
- A1 (bloqueante) web/src/features/filtros/FiltroMulti.tsx:116 · `format:check` falha no CI (check `rapida`): o Prettier quer quebrar a linha após `if (e.key === 'Escape')`; rodar `prettier --write` no arquivo e reenviar.
