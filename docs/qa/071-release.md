---
tipo: qa
contrato: 1
pedido: 071-release-069-070
branch: docs/071-release
commit: 555a002cc7bb5f898f31256c3b7245ca24647071
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-05
---
# Parecer de QA 071-release (E1.2, K-222)

Commit testado: 555a002c (docs(changelog), ponta da `docs/071-release` quando o CHANGELOG chegou), sobre a ponta da develop 39b761d. A release leva os PRs 222, 223, 230, 231, 232, 233 e 234 (069 L7-a e L7-b; 070 simulado por cartão, correção do contraste, E2E e ADR 0028 vigente; Forge 0.32.0). Depois dele a branch só recebeu os pareceres de segurança (7bfec8f) e de review (fc7f08f), ambos em `docs/`, sem código: as suítes abaixo valem para o HEAD. Os pareceres de QA, review e segurança de cada PR já estão na develop; aqui entram só as suítes sobre a ponta integrada.

## Achados

Nenhum.

## Ambiente
- vitest com `--maxWorkers=2`, TZ=UTC no web e nos pacotes; load abaixo de 4 e MemAvailable acima de 3000 MB antes de cada suíte, uma por vez.
- A primeira execução do web foi cortada por um `timeout` meu de 280 s (sem veredito); refeita sem esse corte, inteira.

## Resultado
| Verificação | Resultado |
|---|---|
| vitest do server, com cobertura | 87 arquivos aprovados, 35 pulados; 1755 testes aprovados, 244 pulados, 0 falhas; cobertura 100% (instruções, ramos, funções, linhas) |
| vitest de packages/metricas, com cobertura | 43 arquivos, 1262 testes aprovados; cobertura 100% |
| vitest de packages/contratos, com cobertura | 10 arquivos, 208 testes aprovados; cobertura 100% |
| vitest de packages/mock, com cobertura | 14 arquivos, 258 testes aprovados; cobertura 100% |
| vitest do web, com cobertura | 97 arquivos, 1471 testes aprovados; cobertura 100% |
| `npx eslint .` em `server/` | rc 0, sem avisos |
| `npx eslint .` em `web/` | rc 0, sem avisos |
| `pnpm exec prettier --check web packages tools` | rc 0, todos os arquivos conformes |
| `pnpm run docs:check` | ok (1007 páginas, 69 métricas, 2 eventos) |

Total: 4954 testes de unidade aprovados (server, três pacotes e web), 0 falhas.

## Não executado aqui
- Testes pg (os arquivos pulados do server) e E2E: rodam no portão da homologação, conforme o brief; sem parecer meu sobre eles.
- Testes que lançam tsx em processo filho: nenhum falhou no sandbox nesta rodada, então nada precisou rodar fora dele.
- Nada foi rodado contra a base real; arquivos `.env*` não foram abertos.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Pareceres de QA dos 7 PRs seguem válidos na ponta integrada | suítes acima | n/a | passou |
| Cobertura de 100% mantida | vitest com cobertura nos cinco pacotes | n/a | passou |
| Estilo e documentação sem regressão | eslint, prettier, docs:check | n/a | passou |

Sem bugs abertos; nenhum arquivo em `docs/qa/bugs/` criado.
