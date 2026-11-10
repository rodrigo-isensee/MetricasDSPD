---
tipo: qa
contrato: 1
pedido: 078-release-noite-2026-11-07
branch: docs/078-release
commit: 21eac2c47150b3134af04aef422fc2ff44199860
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---
# Parecer de QA 078-release (E1.2, K-242)

Commit testado: 21eac2c4, ponta da `docs/078-release` (develop 4388083c, PRs 238 a 280, mais o CHANGELOG 8548bc17, o review 3c4cffa7 e a segurança 21eac2c4, os três só em `docs/`). O `Revisar-sha` do brief (8548bc17) é ancestral do HEAD testado. A develop ganhou depois só o PR 281 (versão do Forge), fora desta passada. Os pareceres de QA de cada PR já estão na develop; aqui entram só as suítes sobre a ponta integrada.

## Achados

Nenhum bloqueante. Observação, sem acionar o portão: os achados recomendados do review (A1 ordem da migração 0035 no roteiro da VM; A2 6 vulnerabilidades do Dependabot) e da segurança (A1 pre-push só no diff; A2 marcador `.forge/versao`) não têm teste meu que os cubra; seguem com o tech-lead e a segurança.

## Ambiente
- `pnpm run pronto` na worktree `/home/rodrigoisensee/MetricasDSPD-052d`, uma execução só, saída em arquivo; `rc=0`. Cita-se o `pronto` local porque o check-run `bateria` do PR da release ainda não existe; a suíte inteira do PR é do CI.

## Resultado
| Pacote | Arquivos | Testes |
|---|---|---|
| tools/spec-check | 1 aprovado | 14 aprovados |
| tools/homolog | 6 aprovados | 73 aprovados |
| packages/contratos | 12 aprovados | 219 aprovados |
| tools/pesquisa | 3 aprovados | 33 aprovados |
| packages/metricas | 44 aprovados | 1278 aprovados |
| packages/mock | 14 aprovados | 258 aprovados |
| server | 100 aprovados, 41 pulados | 1915 aprovados, 274 pulados |
| web | 98 aprovados | 1494 aprovados |
| tools/docs-contratos | 14 aprovados | 102 aprovados |

Total: 5386 testes aprovados, 0 falhas. `docs:check` ok (1128 páginas, 69 métricas, 2 eventos). Os pulados do server são os testes pg, que rodam no portão da homologação (migração a partir da main, smoke); a lint e o tipo do `pronto` passaram.

## Não executado aqui
- Testes pg (pulados do server) e E2E: do portão da homologação; sem parecer meu sobre eles.
- Nada foi rodado contra a base real; arquivos `.env*` não foram abertos.
- Vermelho antes do verde e mutação: não se aplicam, pois a release não traz teste novo de correção; os de cada PR já foram vistos no parecer do PR.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Pareceres de QA dos PRs 238 a 280 seguem válidos na ponta integrada | `pnpm run pronto` (suítes acima) | n/a | passou |
| Estilo, tipo e documentação sem regressão | lint, tipo e `docs:check` dentro do `pronto` | n/a | passou |

Sem bugs abertos; nenhum arquivo em `docs/qa/bugs/` criado.
