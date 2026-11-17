---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-ref-sle
commit: becf285c52b29b24ff3c3c4855222170fc2be9d7
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-ref-sle (K-214, E7.493)

Links: pedido `docs/pedidos/105-melhorias-15-11.md` (D-T2), código `server/src/modulos/referencia/sle-businessmap.ts`, entrada `server/src/entradas/ref-sync-sle.ts`, arquivo `docs/architecture/fontes/businessmap-sle.json`. Sem especificação de UX nem contrato de API (carga de referência, sem tela); as obrigações são as do brief.

## Achados
- A1 (recomendado) server/tests/qa-sle-pg.pg.test.ts:1 · teste contra o PostgreSQL real, escrito pelo QA em commit próprio (6 testes, mutação 3 de 3); o autor só tinha banco simulado. Manter na suíte `pg`; renomear se quiser.

## Critério → teste → resultado
| Critério (brief) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Arquivo vazio não grava nada | CT-1 (arquivo real) | vazio | passou |
| Uma linha no T2: grava `ref_sle` (equipe `*`, P85, classe = prioridade) e versão T2.6 com T2 e O3 | CT-2 | uma linha; `numeric(6,1)` (12,5) | passou |
| Duas rodadas sem duplicar | CT-3 | repetição | passou |
| Só INSERT e UPDATE de `vigente_ate`; sem sobrescrever histórico | CT-4, CT-6 | data igual, anterior e futura recusadas; UPDATE de `dias_uteis` e DELETE negados ao `dspd_ref` | passou |
| Tudo ou nada | CT-5 | erro na 2ª linha desfaz a 1ª | passou |
| Erro nomeia campo e linha | 23 testes do autor (banco simulado) | campo e `#n` | conforme PQ do autor, não reexecutado |

## Cenários e resultado real
- Base: PostgreSQL 17 descartável do `scripts/test-pg.sh` (projeto Compose próprio, porta livre, `down -v` no fim). Não toquei a base local nem o `.env`.
- `pnpm run test:pg` completo no head becf285c com o meu arquivo: 52 arquivos passaram, 356 testes passaram, 1 falhou: foi erro meu (import de `lerSle` do módulo errado, `TypeError: lerSle is not a function`), corrigido no teste; nada do código do autor.
- Só o meu arquivo, depois da correção: `Test Files 1 passed (1) · Tests 6 passed (6)`.
- `lerSle` (leitura do T2, `metricas/repositorio.ts`) enxerga a linha gravada pelo carregador (CT-2).
- Tudo roda em transação desfeita no fim (as tabelas de referência não aceitam DELETE), no padrão de `calendario-referencia.pg.test.ts`.

## Vermelho antes do verde (mutação no diff)
Teste novo do QA, sobre código que já existia; a prova é por mutante em `sle-businessmap.ts`, restaurado a cada rodada:
| Mutante | Caiu |
|---|---|
| `p.aprovado_em <= ultima` para `<` | CT-4 e CT-5 |
| `if (atual !== undefined) plano.fechar.push` para `if (false)` | CT-4 |
| remove o `continue` de prazo igual ao vigente | CT-3 |

Sobreviventes: nenhum.

## Limites
- A suíte inteira roda só no CI do PR; não há PR, então não afirmo CI verde. O PQ do autor (23 testes, banco simulado) não foi reexecutado.
- Não executei `bm:ref-sync-sle` pela linha de comando (precisa de `PG_REF_URL`, que fica no `.env`, fora do meu escopo); a função `sincronizarSleBm` e o `lerSleBm` real foram exercitados no banco.
