---
tipo: qa
contrato: 1
pedido: 078-release-noite-2026-11-07
branch: docs/078-release-b
commit: ace67959d5560fb3563cf3230e11776e00506a3c
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---
# Parecer de QA 078-release (E1.2, K-242), volta sobre a develop atual

Commit revisado: ace67959 (`Revisar-sha`, CHANGELOG do tech-lead), base develop 31d98e27 (PRs 238 a 285, com 281, 283, 284 e 285 entrados depois do parecer anterior). A worktree testada estava em 9314a17c, que só soma a ace67959 os pareceres de review (82c176db) e de segurança, ambos só em `docs/`; o código é o mesmo do `Revisar-sha`.

## Achados

Nenhum bloqueante. Observação, sem acionar o portão: o achado recomendado A1 da segurança (pre-push só vê o diff contra `origin/develop`) não tem teste meu; o A2 dela está resolvido (`.forge/versao` em 0.45.2). Os recomendados do review seguem com o tech-lead.

## Ambiente
- `pnpm run pronto` na worktree `/home/rodrigoisensee/MetricasDSPD-052d`, uma execução, saída em arquivo; `rc=0`. Cita-se o `pronto` local porque o check-run `bateria` do PR da release ainda não existe; a suíte inteira do PR é do CI.
- `bash scripts/demo-dado-real.test.sh` (pedido 087, PR 284): saída `tudo ok`, `rc=0`.

## Resultado
| Pacote | Arquivos | Testes |
|---|---|---|
| tools/spec-check | 1 aprovado | 14 aprovados (cobertura 100%) |
| tools/homolog | 6 aprovados | 73 aprovados |
| packages/contratos | 12 aprovados | 219 aprovados |
| tools/pesquisa | 3 aprovados | 33 aprovados |
| packages/metricas | 44 aprovados | 1278 aprovados |
| packages/mock | 14 aprovados | 258 aprovados |
| server | 102 aprovados, 41 pulados | 1926 aprovados, 274 pulados |
| web | 98 aprovados | 1494 aprovados |
| tools/docs-contratos | 14 aprovados | 102 aprovados |

Total: 5397 testes aprovados, 0 falhas (parecer anterior: 5386; o server ganhou 2 arquivos e 11 testes com os PRs 283 e 284). `docs:check` ok (1140 páginas, 69 métricas, 2 eventos). Os pulados do server são os testes pg, do portão da homologação.

## Não executado aqui
- Testes pg (pulados do server) e E2E: do portão da homologação; sem parecer meu sobre eles.
- Nada foi rodado contra a base real; arquivos `.env*` não foram abertos.
- Vermelho antes do verde e mutação: não refeitos; os testes novos dos PRs 281, 283, 284 e 285 foram vistos nos pareceres de cada PR, e a release não traz teste novo de correção próprio.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Pareceres de QA dos PRs 238 a 285 seguem válidos na ponta integrada | `pnpm run pronto` (suítes acima) | n/a | passou |
| Comando da demo com dado real (PR 284) segue íntegro | `scripts/demo-dado-real.test.sh` | .env ausente, variável ausente, argumento inválido, erro na carga | passou |
| Estilo, tipo e documentação sem regressão | lint, tipo e `docs:check` dentro do `pronto` | n/a | passou |

Sem bugs abertos; nenhum arquivo em `docs/qa/bugs/` criado.
