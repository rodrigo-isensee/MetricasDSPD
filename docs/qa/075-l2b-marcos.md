---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l2b-marcos
commit: 54d49872f824aee266062ded66c358c97e84d295
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 075-bloqueios-reais, lote 2b (marcos de saída e fornecedor, K-204)

Contrato: ADR 0029, plano `docs/analises/075-plano.md` (Lote 2b e TL-A5). Pareceres de review (19ee43e8) e de segurança (3db58b80) aprovados sobre o mesmo código.

## Achados
- A1 (recomendado) server/tests/bloqueios.test.ts:79 · nenhum teste usa `archivedAt` posterior à coleta (A1 da segurança, vai ao 4a); quando o 4a limitar o marco a `coletadoEm`, o caso entra junto com o código.

## Conferência do lote contra o plano
- Diff `e89ae3f3..54d49872`: 3 arquivos (`bloqueios.ts`, `normalizador.ts` com só o `export` de `colunasDeLista`, `bloqueios.test.ts`). `allow-list.ts`, `coleta.ts`, `server/migrations` e `packages/contratos`: `git diff --stat` vazio nesses caminhos.
- Escopo igual ao plano: derivador puro, sem contrato nem migração; a `colunasDeLista` é a exportada, não cópia.
- Os dois testes antigos que mudaram de expectativa conferem com o review: `0034` vira `34` e coluna `abc` vira `null` (código normalizado, id de coluna inteiro). Sem outra expectativa antiga alterada.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| P-075-5 arquivado, excluído, entregue, descartado bloqueado fecha no marco | `it.each` "card %s bloqueado fecha no marco" (4 casos) | instante do marco: `archivedAt` nativo, ou coleta nos demais | passou |
| P-075-9 fim antes do início vira duração 0 | "marco anterior ao início observado dá fim = início" | marco menor que o início | passou |
| TL-A5 arquivado volta ativo bloqueado: bloqueio novo, outro `id_origem` | "arquivado que volta ativo e bloqueado abre bloqueio novo..." | dois ids distintos, motivo do novo início | passou |
| A9 dentro do marco não abre | "arquivado e bloqueado com versões seguintes no marco: zero evento" | primeira versão já no marco; versões seguidas | passou |
| P-075-4 fornecedor presente, ausente, trocado depois | "fornecedor do início: presente, ausente e trocado depois" | vale o do início; fim grava `null` | passou |
| CA-075-12 fornecedor só de `custom_fields` mapeado | "CA-075-12: fornecedor só de custom_fields mapeado..." | `fornecedor` e `label` avulsos e field_id fora do mapa; valor vazio vira `null` com nota | passou |
| CA-075-2 motivo normalizado | `it.each` com `'0034'` esperando `'34'` | zeros à esquerda, 11 dígitos recusados | passou |
| Coluna só inteiro decimal | "coluna do evento aceita texto, número ou ausência..." | `abc`, ausente e objeto viram `null` | passou |
| Entrada inválida de `is_blocked` | "is_blocked ausente ou inválido não fecha nem abre..." | ausente e `'x'` sem evento, com nota | passou |
| 2a: fim sem o motivo da versão que desbloqueia | "o fim não grava o motivo da versão que desbloqueia" | fim com `motivoCodigo` nulo | passou |

## Execução
- Local, 2 workers: `npx vitest run tests/bloqueios.test.ts tests/normalizador-businessmap.test.ts --maxWorkers=2` em `server` na worktree: 2 arquivos, 50 testes (26 do derivador e 24 do normalizador), todos verdes.
- Suíte: CI do push, `gh run list --branch feature/075-l2b-marcos --event push` traz `{"conclusion":"success","headSha":"54d49872f824aee266062ded66c358c97e84d295"}`, o head do código. Não rodei a suíte inteira localmente; a prova dela é essa CI.
- Vermelho: cópia em `/tmp/claude-1000/qa-engineer-075-l2b/` com `bloqueios.ts` e `normalizador.ts` da base (`e89ae3f3`) e o teste novo: `Tests 12 failed | 14 passed (26)`. Os 12: `0034`, coluna, `is_blocked` inválido, 4 marcos, P-075-9, TL-A5, A9, fornecedor do início e CA-075-12. Por ser prova de ausência de código, vale a mutação abaixo.
- Mutação manual sobre `bloqueios.ts` do head (12 mutantes, cópia): todos mortos. Fim sem o `Math.max` do início (1 falha); sem `excluidoDetectado` (1); abertura dentro do marco (1); sem coluna de entrega (2); sem coluna de descarte (1); marco gravado como coleta (2); fornecedor sempre nulo (2); fornecedor lido de campo avulso (1); fim gravando o fornecedor (1); sem normalizar zeros (1); `archivedAt` ignorado (4); `id_origem` da reabertura alterado (2). Mais um: coluna sem `codigoDe` (1 falha). Sobreviventes: nenhum.

## Observações sem bloqueio
Os recomendados do review (`archivedAt` como `Date`, `coletadoEm` inválido, nota de campos que não são o fornecedor) seguem para o 4b, a critério do tech-lead. Não há bug aberto.
