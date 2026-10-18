---
tipo: review
contrato: 1
pedido: 030-prs-do-dependabot-para-develop
branch: feature/030-dependabot-develop
commit: 523372c3777ac254aae7d1b4e13e1dc36c068585
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-17
---
# Code review: Dependabot com `target-branch: develop` (pedido 030)

Propósito: revisar a mudança em `.github/dependabot.yml` antes do QA (`R-REVIEW`). Público: QA, dono.

**Parecer: aprovado.** Nenhum ajuste necessário.

## Escopo conferido
- O diff contra a base `0cad9f3` tem 3 arquivos: `.github/dependabot.yml` (+2 linhas) e os pareceres de devops e de segurança. Nada mais mudou no yml.
- Os dois blocos (`npm` e `github-actions`) ganharam `target-branch: develop`, logo abaixo de `directory`. É chave válida do Dependabot v2, no nível da entrada de `updates`. Indentação e sintaxe estão corretas. Grupos, agenda e limite de PRs seguem como estavam.
- Isso atende ao fluxo `feature/*` → `develop` → `homolog` → `main` e à `R-MAIN`: o Dependabot deixa de abrir PR contra a `main`.
- Regras invioláveis, `R-NEUTRO` e `R-CUSTO`: não são tocadas. Não há dependência nova, segredo nem custo.
- Devops e segurança: parecer de devops (`docs/devops/030-dependabot-develop.md`) e de segurança (`docs/security/030-dependabot-develop.md`, aprovado, com observações O-1 e O-2 sem bloqueio) citados e não refeitos.

## Observações (não bloqueiam)
- O Dependabot lê a configuração da branch padrão. A mudança só vale quando chegar à `main`, na próxima release `homolog` → `main`, que é do dono (E2.6 do pedido).
- Critério de reversão: remover as duas linhas `target-branch`.
