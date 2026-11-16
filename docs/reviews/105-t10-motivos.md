---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t10-develop
commit: ed09731be65b13522a96872b34b0eedb6fab4973
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: T10 trazido da homolog para a develop, com os motivos 11 e 14 (105, E7.286, E7.300)

Escopo: `655029ad..ed09731b`. O `0b4db1fa` é o squash do PR 487 (T10 real) sobre a develop `655029ad`; os quatro commits seguintes são o E7.264 do `node-backend` (motivos 11 e 14), que estavam só na worktree `MetricasDSPD-041`, trazidos por cherry-pick (E7.300), sem código do revisor.

**Veredito: aprovado.** O A1 está resolvido no `ed09731b`; o A3 também; o A2 fica recomendado, reduzido à nota da tela.

## Revalidação (volta 1, E7.300)
Delta lido: `forge-check parecer delta docs/reviews/105-t10-motivos.md`, intervalo `0b4db1fa..ed09731b` (o `be3ecd6a` entre eles é este parecer), 7 arquivos no domínio: `CHANGELOG.md`, `docs/contratos/metricas/T10.md`, `bloqueios.test.ts`, `t10.ts`, `criterios.ts`, `regras.ts`, `painel-real-f6.test.ts` (69 adições, 21 remoções).

Commits trazidos (origem na 041 → aqui):
- `cbf18434` → `9f84bb91` feat: T10 filtra por `MOTIVOS_FORNECEDOR`. Na origem é um merge (`08d95f5d` T10 real × `d3d67fdf` motivos-bm); entrou com `cherry-pick -m 2` (a diferença sobre o lado motivos-bm, que a develop já tem), e o resultado só traz a parte do T10. Cinco conflitos, todos resolvidos com o lado do commit, salvo o `CHANGELOG.md`, que manteve a linha da develop (implantação na VM, E7.245) que o commit não conhecia. O import de `MOTIVO_SEM_LISTA_POR_FORNECEDOR` ficou único. O teste "T10 sobre o mock", ausente no `0b4db1fa`, volta com o commit.
- `5ab2cf43` → `c424d11e` test: o teste sobre o mock soma os motivos 14 e 11; linha no CHANGELOG.
- `81029c2c` → `5ae03dbe` style: prettier.
- `e65a710a` → `ed09731b` docs: `T10.md` regerado e `regras.ts` com o texto dos dois motivos.

Leitura do delta:
- `t10.ts:30` filtra por `MOTIVOS_DE_FORNECEDOR.includes(b.motivo)`, que é a lista única do contrato (`MOTIVOS_FORNECEDOR`, `comum.ts`). O `MOTIVO_FORNECEDOR` exportado saiu e não tinha outro uso.
- `criterios.ts`: versão nova `criterio-2026-11-16-t10-motivos-fornecedor` em `VERSOES_DA_BIBLIOTECA` (T2.6, mudança de critério com data e marca). As versões anteriores ficam como registro histórico, o que está certo.
- Testes: caso com 11 e 14 juntos, outro motivo e abertos fora (E7.77); 11 sozinho com 19 não publica e 14 + 11 chegam a 20 (E7.264); o mock confere o T10 contra a soma dos dois motivos no O19; o teste de rota (`painel-real-f6`) põe um 11 e um GMUD.
- Biblioteca compartilhada, mínimo de 20, janela de 12 semanas e texto livre fora da base: sem mudança.

## Ferramentas (citadas, sem refazer)
- `pnpm run pronto` pela raiz da worktree, no head `ed09731b` (via `scripts/suite-unica.sh`, depois da fila): `rc=0`; `packages/metricas` 55 arquivos, 1454 testes passaram; `server` com 100% de linhas; `docs:check: ok`.
- Mutante (só o teste do item): `t10.ts` com o filtro voltado a `b.motivo === "Aguardando fornecedor"` derruba 3 testes em `bloqueios.test.ts` (E7.77, E7.264 e o do mock); restaurado com `git checkout`.
- Tamanho (M14): 752 linhas de código e teste fora de `docs/` e `.md` contra a develop; é o PR 487 já revisado (`docs/reviews/105-t10-real.md`) mais as 69/21 do E7.264.

## Achados
- A1 (bloqueante) packages/metricas/src/businessmap/t10.ts:30 · resolvido no `9f84bb91`: o T10 conta os motivos 14 e 11 pela lista `MOTIVOS_FORNECEDOR`.
- A2 (recomendado) web/src/features/complementares/notas.ts:266 · O "Como se calcula" do cartão ainda diz só "Aguardando fornecedor"; com o E7.264, deve citar também "Dependência Externa". `regras.ts` e o `T10.md` já foram corrigidos; as versões antigas de `criterios.ts` são histórico e ficam como estão.
- A3 (recomendado) packages/metricas/src/businessmap/bloqueios.test.ts:209 · resolvido: os testes do T10 têm casos com "Dependência Externa" e com outros motivos fora.
