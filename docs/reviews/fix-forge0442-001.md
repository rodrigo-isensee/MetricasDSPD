---
tipo: review
contrato: 1
pedido: fix-forge0442-001
branch: fix/forge0442-001
commit: 45870cefdbb3e90a0df2132574ff4ff14c0796e9
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---

# Code review: FORGE0442-001, falhas preexistentes do pronto

Branch `fix/forge0442-001` contra `origin/develop` (528ae77), 3 commits, 58 linhas de código e teste (teto M14: 150). Um comportamento só: destravar o `pronto`.

## Lido
- `scripts/suite-unica.sh` e `.test.sh`: `METRICAS_DSPD_SUITE_DIR` troca só o diretório da trava; o padrão `/tmp/claude-<uid>` segue (o teste confere o literal). O teste 4 usa diretório temporário e não disputa a trava que o `pronto` já segura. Rodei `bash scripts/suite-unica.test.sh`: tudo certo.
- `server/tests/spike-erro-permissao.test.ts`: `vi.mock` do `mkdir` com EACCES cobre `spike.ts:71` sem depender de não-root; afirma código 2, mensagem exata e que a rede não foi usada (teste de comportamento do ramo de falha). Não rodei o vitest aqui (sem `node` no PATH deste ambiente); vale a evidência do autor: server pronto rc=0 com 100% de cobertura.
- `package.json`: lint da raiz com heap de 4 GB; `CLAUDE.md` e o registro do bug atualizados na mesma entrega.

## Achados
- A1 (recomendado) packages/metricas classificarApontamento.test.ts · "A3: orçamento de tempo" falhou no pronto completo (7009 e 5440 ms contra 5 s, load ~18). Fora do escopo e sem relação com o bug; teste de tempo é sensível à carga e merece cartão próprio. Não devolve.

Sem bloqueantes. Guardas: nenhuma nova no código de produção (o `?:-` do shell é valor padrão, coberto pelo teste 4). Segurança: sem alteração de superfície (a variável só é usada pelo teste do script).
