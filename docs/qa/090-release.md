---
tipo: qa
contrato: 1
pedido: 090-release-2026-11-11
branch: docs/090-release
commit: 81e30293048c0448066ca1ebd831074e5c82ddfb
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: release 090 (develop em 85394c5b, PRs 293 a 297) (E1.2)

Links: pedido `docs/pedidos/090-release-2026-11-11.md`, review `docs/reviews/090-release.md`, segurança `docs/security/090-release.md`.

## Escopo
A árvore da worktree é a `develop` em `85394c5b` mais o CHANGELOG (`81e30293`) e os pareceres de review e segurança (`git diff 85394c5b HEAD --stat`: 3 arquivos, todos em `docs/` e `CHANGELOG.md`). Sem código novo em relação à develop, sem teste novo escrito por mim: a release é a soma de PRs que já têm parecer de QA próprio (#293, #294, #297; #295 só documentação; #296 Forge). Esta passada confere a suíte inteira na ponta da develop. Sem base real, sem `.env`.

## Execução
`pnpm run pronto` na worktree, sozinho na máquina, saída em arquivo; rc=0.

| Pacote | Arquivos | Testes |
|---|---|---|
| tools/spec-check | 1 | 14 passaram |
| tools/homolog | 6 | 73 passaram |
| packages/contratos | 12 | 219 passaram |
| tools/pesquisa | 3 | 33 passaram |
| packages/metricas | 44 | 1278 passaram |
| packages/mock | 14 | 258 passaram |
| server | 102 (41 pulados) | 1941 passaram, 274 pulados |
| web | 98 | 1499 passaram |
| tools/docs-contratos | 14 | 102 passaram |

Cobertura do servidor: 100% em instruções, ramos, funções e linhas. Nenhuma falha por carga da máquina.

## Obrigações, testes e resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| 089 D2 e D3: `sem-vinculo` fora de `execucao-tecnica`, versão T2.6 `089:sem-vinculo-so-sem-comentario` por INSERT idempotente | `apontamento-classificador`, `criterios-apontamento`, `ref-sync-apontamento-entrada` (server) | regra de classificação; versão sem sobrescrever histórico | passou (pronto rc=0) |
| 089 web: rótulo "Sem comentário", nota de execução técnica com piso de 20 | testes de `web/src/features/apontamento` | n abaixo de 20 sem percentual | passou (pronto rc=0) |
| K-261: teste da entrada não lê o `.env` real | `ref-sync-apontamento-entrada.test.ts` | isolamento do ambiente | passou (pronto rc=0) |
| Forge 0.45.5 e retrospectivas: sem código de produção | `tools/docs-contratos`, `tools/homolog` | n/a | passou (pronto rc=0) |

## Limites desta passada
Os 274 testes pulados do servidor são os que exigem PostgreSQL (`*.pg.test.ts`): não rodaram aqui por regra (nada contra base real). Prova deles: check-run `bateria` do CI na `develop` em `85394c5b` (sucesso, segundo o review). Vermelho antes do verde e mutação ficam nos pareceres de QA de cada PR; esta release não adiciona teste.

## Achados
- A1 (recomendado) server/tests · 274 testes com banco ficaram pulados no pronto local; confirme no check-run `bateria` do PR de release `develop`/`homolog` (sha da ponta) que eles rodaram verdes antes do merge.
