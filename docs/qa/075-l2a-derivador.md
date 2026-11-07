---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l2a-derivador
commit: 2c19b9895c67c803c9beeb5b8ddee660b0630ec2
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-06
---
# QA: 075-bloqueios-reais, lote 2a (derivador de bloqueio, K-204)

Contrato: ADR 0029 (proposta nesta branch), plano `docs/analises/075-plano.md` (Lote 2a). Pareceres de review e segurança do 2a aprovados no mesmo código.

## Achados
- A1 (recomendado) server/tests/bloqueios.test.ts:12 · nenhum teste usa `fim` com `block_reason_id` não nulo: o mutante que grava o motivo no `fim` sobreviveu; um caso com motivo na versão que desbloqueia fixaria `motivoCodigo: null` no fim.

## Conferência do lote contra o plano
- Diff base..2c19b989: 3 arquivos (ADR 0029, `bloqueios.ts` com 50 linhas, `bloqueios.test.ts` com 50 linhas). `allow-list.ts`, `coleta.ts` e `packages/contratos`: sem diferença contra a base (`git diff --stat` vazio nesses caminhos).
- Escopo não mudou: derivador puro, sem banco, relógio, contrato nem migração. Marcos e fornecedor ficam para o 2b (`fornecedorCodigo` sempre null).
- Todos os casos de teste do plano estão presentes (tabela abaixo).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| P-075-2 abre/fecha no coletado_em | "abre e fecha no coletado_em..." | fim com mesmo `id_origem` do início | passou |
| P-075-2 reabre, dois `id_origem` | "reabre com outro id_origem" | 4 eventos, ids distintos | passou |
| P-075-3b e P-075-10 troca de motivo | "troca de motivo bloqueado não gera evento..." | motivo do início, sem evento extra | passou |
| P-075-2 primeira versão bloqueada | "primeira versão já bloqueada abre na coleta" | lista de uma versão | passou |
| Idempotência da derivação | "versões repetidas não geram evento..." | repetição sem evento, saída igual | passou |
| CA-075-2 `reason_id` numérico, nulo, ausente, não numérico, 11 dígitos | `it.each` com 8 entradas | 10 dígitos aceitos, 11 recusados, `1.5` e objeto recusados, nota `motivo_codigo_invalido` | passou |
| CA-075-1 `label`, `comment`, `user_id` não saem | "CA-075-1: ... marcadores não chegam à saída" | saída serializada sem os 3 marcadores | passou |
| Coluna e `is_blocked` 1 (volta do 2a) | "coluna do evento aceita texto, número ou ausência..." | texto, número, ausente, objeto | passou |

## Execução
- Local, 2 workers: `npx vitest run tests/bloqueios.test.ts --maxWorkers=2` na worktree, 1 arquivo e 15 testes, todos verdes.
- Suíte: CI do push, `gh run view 42269882748 --json headSha,conclusion` devolveu `{"conclusion":"success","headSha":"2c19b9895c67c803c9beeb5b8ddee660b0630ec2"}`, o head do código. Não rodei a suíte inteira localmente; a prova dela é essa CI.
- Vermelho: `forge-testes --vermelho d1f22008a434` saiu "o mapa não sabe (bloqueios.ts sem mapa); suíte completa", "contagem: nenhum teste", "nenhum teste prova a mudança" (não serve: o módulo é novo). Prova manual em cópia em `$TMPDIR/qa-engineer-075-l2a/` com a base e só o teste novo: `bloqueios.test.ts` falha na carga ("Tests no tests", import de `bloqueios.js` inexistente), o que só prova que a base não tinha o módulo; a prova de poder dos testes está na mutação abaixo.
- Mutação manual na cópia (8 mutantes, `bloqueios.ts`): mortos 6 (fim com outro id; regex `{1,11}`; início a cada versão bloqueada; sem a nota de motivo inválido; `is_blocked` só `true`; id sem `coletadoEm`). Sobreviveram 2: o motivo gravado no `fim` (A1, lacuna real) e a troca de `Number.isInteger` por verdadeiro (equivalente: `String` de número não inteiro tem ponto ou expoente e a regex `^\d{1,10}$` o recusa).

## Observações sem bloqueio
Recomendados do review e da segurança (zeros à esquerda em `motivoDe`, `colunaId` sem validação, `is_blocked` fora de true/1 que fecha sem nota, parâmetros sem uso) seguem para o 2b ou 4b a critério do tech-lead; não há bug aberto.
