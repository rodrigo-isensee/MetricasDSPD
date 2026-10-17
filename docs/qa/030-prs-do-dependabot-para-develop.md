---
tipo: qa
contrato: 1
pedido: 030-prs-do-dependabot-para-develop
branch: feature/030-dependabot-develop
commit: fc33b44
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-17
---

# QA: Dependabot abre PRs na develop (pedido 030)

Mudança testada: `target-branch: develop` nos dois blocos de `.github/dependabot.yml` (diff de 0cad9f3 a fc33b44). Review: `docs/reviews/030-prs-do-dependabot-para-develop.md`.

## Critério, teste e resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| YAML válido | `yaml.safe_load` (python3) do arquivo | n/a | passou |
| `version: 2` | leitura do campo após o parse | n/a | passou: 2 |
| Dois blocos (npm, github-actions), cada um com `target-branch: develop` | parse e `grep -c 'target-branch: develop'` | nenhum bloco sem a chave (não pode sobrar um bloco na main) | passou: npm=develop, github-actions=develop, grep=2 |
| Nenhuma outra chave alterada | remove `target-branch` dos dois blocos e compara o dicionário com o de 0cad9f3 | schedule, limites e grupos intactos | passou: iguais |
| Suíte do projeto | `pnpm run pronto` na raiz da worktree | n/a | passou: rc=0 (docs:check ok, 499 páginas, cobertura 100% em docs-contratos) |

Vermelho antes do verde e mutação: não se aplicam, porque a mudança é de configuração sem código de produção. O estado anterior (0cad9f3) tem 0 ocorrências da chave.

## Pendência registrada (não testável agora)
O Dependabot lê a configuração da branch padrão. O efeito real (PRs nascendo na develop) só aparece depois que a mudança chegar à `main` na próxima release homolog → main, etapa do dono (E2.6). Até lá, a verificação do efeito fica aberta.

## Bugs
Nenhum aberto.
