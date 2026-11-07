---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l6b-tela-ressalva
commit: 1335576d27fca37b7e7781b18c5a31fc89dbc91a
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 077 lote 6b, ressalva do S2 na tendência de SLA (E2.3, K-211)

Código testado: `1335576d` (código e testes). O HEAD `b9291559` só soma o review. Branch empilhada sobre o 4b: o intervalo testado é `0236c717..1335576d` (3 arquivos de `web/`, 89 linhas). Obrigação: `docs/ux/077-tendencias.md` (seção 2, seção 5, CA-8 a CA-11 e CA-13; o CA-12 é do lote 7). Nenhum teste novo meu: os testes do lote cobrem cada CA, e por isso o `commit:` é o do código.

## Escopo
- Dentro: lista `notas-tendencia-sla` em `SerieMensal` (props `notas` e `notasTestid`), a condição em `TendenciaSustentacao.tsx` e o texto lido de `TEXTO_NOTA_QUALQUER`.
- Fora: marca de critério (lote 7), `server/`, `packages/`, mapa real. `git diff --stat 0236c717..1335576d -- server packages docs/contratos` vazio.

## Critério, teste, resultado
| Critério | Teste (`componentes.test.tsx`, bloco "ressalva do S2") | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-8 nota com o id e ponto publicado, entre subtítulo e gráfico | "CA-8 e CA-13..." (ordem por `compareDocumentPosition`) | posição no DOM; ponto publicado | passou |
| CA-9 sem nota no resultado, nada aparece | "CA-9: sem a nota..." | `notas` ausente | passou |
| CA-10 nunca na série de abertos | mesmo teste do CA-8 (volume sem o texto; uma só ocorrência na tela) | outra série | passou |
| CA-11 S2 oculto, série e nota somem juntas | "CA-11..." com `ContextoPreferenciasPainel`; o volume segue | permissão/preferência | passou |
| CA-13 texto do contrato, sem duplicar | mesmo teste do CA-8 compara com `TEXTO_NOTA_SUSTENTACAO`; leitura do diff: nenhum literal da nota em `web/` | texto exato | passou |
| Série de SLA vazia: sem nota | "série de SLA vazia..." (`meses` com `prioridades: []`) | vazio | passou |
| Acessibilidade da lista | E2E `CA-19` (axe, 4 visões, 375 e 1280 px) verde; axe-core em jsdom sobre a lista, em arquivo descartável não commitado (`wcag2a`, `wcag2aa`, `wcag22aa`, `best-practice`, sem contraste): 0 críticas e 0 sérias | WCAG 2.2 AA | passou, com limite (ver A1) |

## Vermelho antes do verde
Cópia descartável na ponta do 4b (`0236c717`) com o `componentes.test.tsx` de `1335576d`: `1 failed | 29 passed (30)`. Cai o "CA-8 e CA-13 ... CA-10" (a lista não existe na base). Os outros três testes novos (CA-9, vazia, CA-11) são afirmações de ausência e passam na base por natureza; quem os prova são os mutantes M1, M2, M5 e M9 abaixo.

## Mutação à mão nos ramos novos (vitest do arquivo, 2 workers)
| Mutante | Resultado |
|---|---|
| M1 tira `sla.some(valor !== null)` (nota com série vazia) | morreu (1 falha) |
| M2 tira `notas?.includes(...)` (nota sempre) | morreu |
| M3 `includes` de outro id | morreu |
| M4 mesma nota passada ao volume | morreu |
| M5 `notas.length > 0` vira `true` (lista vazia renderiza) | morreu (2 falhas) |
| M6 texto literal no lugar do contrato | morreu |
| M7 remove o `data-testid` da lista | morreu |
| M8 lista nunca renderiza | morreu |
| M9 `verSla` sempre verdadeiro (oculto não oculta) | morreu |

9 de 9 mortos; árvore restaurada (`git status` sem alteração em `web/`).

## Execução
- `vitest run --maxWorkers=2 src/features/operacional/resumo`: 3 arquivos, 72 testes verdes.
- E2E só de `e2e/tests/sustentacao-no-operacional.spec.ts` (chromium, 2 workers): 40 passed (1,2 min). A suíte E2E inteira fica com a CI, por decisão do Jarvis de 2026-11-07 19:24.
- Review: A1 do tech-lead (`role="list"` no `ul`) é recomendado e não devolve.

## Achados
- A1 (recomendado) web/src/features/operacional/resumo/SerieMensal.tsx:103 · o mock do E2E não serve `notas` em TENDENCIA_SUST, então o contraste da nota não é medido em navegador; jsdom não mede contraste; classes iguais às do CartaoMetrica.
