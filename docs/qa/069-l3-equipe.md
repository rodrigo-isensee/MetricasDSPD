---
tipo: qa
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-l3-equipe
commit: 4f52c57ad6b2a75d7b0e79232589ca05b1f3db31
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-04
---
# QA: 069 L3-a, filtro de equipe do O2 (E1.5, K-220)

Código testado: `4f52c57` (o HEAD `80b0ac3` só soma `docs/reviews/069-l3-equipe.md`). Obrigação: `docs/analises/069-desenho.md`, seção E1 · L3 (lote L3-a). Não há especificação de UX com `CA-n`; cada ponto do desenho virou um teste.

## Escopo
- Dentro: helper `colunasDaEquipe` (`comum.ts`), usado no O2 e no O1 (refatoração sem mudança de comportamento).
- Fora: O20 (mesmo padrão, dívida declarada no desenho); `test:pg`, `pronto` e E2E (sem mudança de tela ou contrato). Postgres da base real não foi consultado neste parecer: a base real foi exercitada pela forma dela (quadro numérico, coluna com `equipe`) nos testes.

## Critério → teste → resultado
| Obrigação (desenho) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Base real: etapas = colunas de trabalho e homologação do time, em ordem; parado na coluna certa | `o2.equipe.test.ts` caso 1 (`quadro_id: '35'`, `equipe: 'Equipe A'`) | quadro numérico, `etapas` não vazio | passou |
| Base semeada mantém `quadro-<slug>` | caso 2 (sem `equipe`: vazio no quadro de teste, preenchido com `quadro-equipe-a`) | ramo `equipe === undefined` | passou |
| Coluna de outro time no mesmo quadro não entra | caso 3 | vazamento entre times | passou |
| Sem filtro de equipe: Fila e Execução | caso 4 | modo sem equipe | passou |
| O1 não mudou | `o1.h12.test.ts` e demais do O1 dentro da suíte de metricas | refatoração | passou |

## Execução (2 workers, MemAvailable 13 GB, load 0,95)
- `git pull --ff-only origin feature/069-l3-equipe`: Already up to date.
- packages/metricas, `vitest run --coverage --maxWorkers=2`: `43 files, 1262 passed`; Statements 100% (3593/3593), Branches 100% (1790/1790), Functions 100%, Lines 100% (3007/3007).
- server, `vitest run --coverage --maxWorkers=2`: `80 passed, 33 skipped; 1625 passed, 232 skipped` (skipped = `.pg.test.ts`); cobertura 100% nos quatro eixos.
- tools/docs-contratos: `14 files, 102 passed`.
- `pnpm exec prettier --check web packages tools`: All matched files use Prettier code style.
- `pnpm run docs:check`: `ok (930 páginas Markdown, 69 métricas, 2 eventos)`.
- Diff do O1: 2 inserções, 11 remoções, só a troca do predicado pela chamada do helper (mesmo predicado, mesma ordenação).

## Não feito
- Vermelho antes do verde por execução: não rodei o teste contra o `o2.ts` anterior (sem cópia com dependências, e a worktree não se toca). Por leitura: o `o2.ts` anterior filtra `quadro_id === 'quadro-equipe-a'`; com `quadro_id: '35'` o caso 1 teria `etapas = []` e falharia no `toBeGreaterThan(0)`. Sem prova executada.
- Mutação: não rodada (stack sem ferramenta declarada para este diff). O helper tem 100% de cobertura e um caso por ramo da condição.
- Chamada real `GET /api/v1/metricas/O2?equipe=<slug>` na base local: não feita (sem Postgres no ar neste ambiente); fica para a validação do dono.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/o2.equipe.test.ts:1 · vermelho antes do verde e chamada real na base local não executados; rodar na validação do dono.
