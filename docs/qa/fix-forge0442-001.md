---
tipo: qa
contrato: 1
pedido: fix-forge0442-001
branch: fix/forge0442-001
commit: bdb6669e3c7176d78d5a31452df49f5b00e651e2
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
aceite_usuario: pendente
data: 2026-11-14
---

# QA: FORGE0442-001, falhas pré-existentes do `pronto`

Bug: `docs/qa/bugs/FORGE0442-001-falhas-preexistentes-do-pronto.md`. Sem UX nova; as obrigações são os três critérios do bug. Commits de código: d917496, 975218e, 45870ce (os commits seguintes só trazem pareceres).

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

## Revalidação (2026-11-14, bdb6669e; 3506ffdb e 3ab93fda só tocam docs)
Delta (forge-check parecer delta, 0dd46250..3ab93fda, sem o que veio da develop): package.json (prefixo de heap no lint) e scripts/suite-unica.test.sh (teste 4 com trava própria em $TMP/claude-trava). Máquina livre antes de cada comando pesado (sem eslint, vitest, tsc nem playwright; load1 0,8).
- bash scripts/suite-unica.test.sh solto: rc=0, 8 de 8 ok, "tudo certo".
- bash scripts/suite-unica.sh bash scripts/suite-unica.test.sh (a trava do pronto): rc=0, 8 de 8 ok. O teste 4 não disputa a trava segurada pelo pai.
- pnpm run lint (raiz com heap de 4 GB e depois o lint do server), uma vez: rc=0, sem aviso, 1m12s.
- Mutante à mão na trava do teste 4: a segunda chamada passou a usar METRICAS_DSPD_SUITE_DIR="$DIR_PROPRIO-outro" (outra trava, então não espera). Saída: "FALHOU - caminho padrão ...: segunda chamada espera a primeira" e "1 falha(s)": morreu. Arquivo restaurado por git show HEAD:scripts/suite-unica.test.sh; git status sem diferença nele.
- A suíte inteira fica com o check-run bateria do CI do PR; o resultado de 2026-11-10 (server 100%, metricas 1278) segue valendo, pois o código do server e do pacote não mudou no delta.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Teste 4 não trava sob o pronto | suite-unica.test.sh solto e sob suite-unica.sh | trava padrão de /tmp/claude-uid fora do teste | passou nos dois |
| Lint da raiz sem estourar heap | pnpm run lint | heap do eslint | rc=0 |
| Teste 4 prova a exclusão mútua no caminho padrão | mutante da trava (diretório diferente na 2ª chamada) | segunda chamada espera a primeira | mutante morto |

## Achados
- A1 (recomendado) scripts/suite-unica.test.sh:8 · DENTRO_DE_SUITE é atribuída e nunca lida depois do merge (o teste 4 não consulta mais a trava padrão); código morto, remover. Mesmo ponto do A2 da segurança.
