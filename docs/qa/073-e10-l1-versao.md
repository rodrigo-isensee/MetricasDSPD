---
tipo: qa
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-e10-l1-versao
commit: c9f887118bf9d6272e027b1043e1d2541123f55b
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: E10 Lote 1, versão nova a cada mudança de vigência no ac:ref-sync (pedido 073, E10.6, K-235)

Base: develop 78cf396c. Teste do lote: c9f88711 (HEAD da branch são os pareceres de review e segurança, só documentação sobre ele). Spec: seção "Lote 1" de `docs/analises/073-e10-plano.md` (P-E10-4).

## Achados

## Critério → teste → resultado
| Critério (plano, Lote 1) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Referência `056:ref-dominio:<sha256>:<AAAA-MM-DD>` | `dominio-acelerato.test.ts:184-185` (literal e pela função) | formato exato, data no fim | passou (29/29 local) |
| A, B e de novo A em três datas geram três versões | `dominio-acelerato.pg.test.ts:110` | reversão a hash já visto, datas D1, D2, D3 | passou na CI do push (job banco, run 42331476876) |
| Mesma carga no mesmo dia gera uma versão | `dominio-acelerato.pg.test.ts:110` (2ª chamada em D3: `versaoRegistrada: false`) e dublê `dominio-acelerato.test.ts:206` | idempotência por hash e dia | passou (CI e local) |
| Carga sem diferença não gera versão | `dominio-acelerato.pg.test.ts` (repetição sem diferença, `versaoRegistrada: false`) | vazio do plano | passou na CI |
| Versões antigas intactas | `dominio-acelerato.pg.test.ts:110` (contagem 3 pelo prefixo) e diff sem UPDATE nem DELETE em `ref_versao_criterio` | histórico só acrescentado | passou |
| Reverter no mesmo dia continua recusado | `dominio-acelerato.pg.test.ts` (data retroativa, `/anterior à última vigência/`), `planejarDominio` fora do diff | limite do mesmo dia | passou na CI |
| CA-8 e ac:ref-sync com a data | `acelerato-ca8-ref-sync.pg.test.ts:31,51,59` | referência com dia 2026-11-05 e 2026-11-06 | passou na CI |
| Sem diferença contra a base em `ref-sync-ac.ts`, `server/migrations`, web, `packages/contratos` | `git diff --stat 78cf396c HEAD` nesses caminhos | escopo do lote | vazio, conferido |

## Cenários e resultado real
- Diff `78cf396c..c9f88711`: 5 arquivos, +35 -16; produção só em `dominio-acelerato.ts` (assinatura `referenciaDaVersao(sha, dia)` e o ramo `mudou` com `hoje`). Escopo igual ao plano; nenhum CA mudou.
- Suíte do arquivo (máx. 2 workers): `vitest run tests/dominio-acelerato.test.ts --maxWorkers=2`: 1 arquivo, 29 passaram. Os dois `.pg` ficam com a CI: `gh run view 42331476876 --json headSha,conclusion` devolveu `headSha c9f887118bf9d6272e027b1043e1d2541123f55b`, `conclusion success` (job banco incluso).
- Vermelho contra a base (cópia em `$TMPDIR/qa-engineer-073-e10l1/`: código de produção de 78cf396c com os testes de c9f88711), sem mexer na worktree: `vitest run tests/dominio-acelerato.test.ts` falhou 1 de 29, "grava as vigências e a versão de critério ... numa transação": `AssertionError: expected '056:ref-dominio:ae9fe4f8...' to be '056:ref-dominio:ae9fe4f8...'` (a base grava a referência sem o dia). A falha é de valor, não de ausência de símbolo (a base já exportava `referenciaDaVersao`), então a mutação à mão não foi necessária. Os testes `.pg` novos (três datas) não rodam sem banco; o vermelho deles é só inferido do mesmo comportamento e a prova verde está na CI.
- Limite do que foi provado: a prova das três datas depende do job banco da CI; o unitário local cobre a forma da referência e o dublê. Sem bug aberto.
- Review (5ced0941) e segurança (ddbd23cf) aprovados, com A1 recomendado do review (texto de documentação) que não devolve.

## Parecer
Aprovado.
