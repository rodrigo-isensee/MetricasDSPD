---
tipo: qa
contrato: 1
pedido: fix-forge0442-001
branch: fix/forge0442-001
commit: 45870ce
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
aceite_usuario: pendente
data: 2026-11-10
---

# QA: FORGE0442-001, falhas pré-existentes do `pronto`

Bug: `docs/qa/bugs/FORGE0442-001-falhas-preexistentes-do-pronto.md`. Sem UX nova; as obrigações são os três critérios do bug. Commits: d917496, 975218e, 45870ce.

## Critério, teste e resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Teste 4 de suite-unica não trava | `bash scripts/suite-unica.test.sh` (trava própria em diretório temporário, literal do diretório padrão conferido) | trava padrão `/tmp/claude-<uid>` fora do teste | passou, rc=0, "tudo certo" |
| Cobertura do server em 100% (spike.ts:71) | `server/tests/spike-erro-permissao.test.ts`, `pnpm --filter @metricas-dspd/server run pronto` | EACCES no mkdir | rc=0; 100% em statements, branches, funções e linhas; 1910 passed, 274 skipped |
| Lint da raiz sem estourar heap | comando de lint com `--max-old-space-size=4096` (diff lido; CLAUDE.md documenta) | heap | configuração conferida no diff; lint da raiz não reexecutado por mim (o autor relata ~3 min limpo) |

## Execução
- Server pronto (typecheck, lint e cobertura): rc=0. Os 274 skipped são testes de PostgreSQL ausente no ambiente, cobertos pelo job `banco` da CI.
- Pacote `packages/metricas`: 44 arquivos, 1278 testes passaram. O "A3: orçamento de tempo" passou (10 000 comentários em 1233 ms para o teto de 5 s) com load1 de 11 a 16: não houve falha, então não há flake a registrar.
- Carga: load1 não baixou de 10 em 10 min de espera (11 a 23); rodei assim mesmo, load1 11,3 no início e 16,5 no fim.
- Vermelho antes do verde do teste novo do spike: não executei a base; a falta é a linha 71 sem cobertura que o bug registra (99,97%), agora fechada.

## Achados
Nenhum.
