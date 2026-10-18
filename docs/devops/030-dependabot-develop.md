---
tipo: revisao-devops
contrato: 1
pedido: 030-prs-do-dependabot-para-develop
branch: feature/030-dependabot-develop
commit: 9b2ffe998297d06ee8cbfee944fedcd330f494d1
parecer: aprovado
revisor: devops-engineer
data: 2026-10-17
---

# Dependabot abre PRs na develop

## Mudança

`.github/dependabot.yml`: `target-branch: develop` nos dois blocos de `updates` (npm e github-actions). Agendas, grupos e limites ficam como estavam. Nenhum workflow foi alterado.

## Efeito

O Dependabot lê a configuração da branch padrão (`main`). A mudança só passa a valer quando chegar à `main`, na próxima release `homolog` → `main`, que é do dono. Até lá, novos PRs do Dependabot continuam saindo contra a `main`; os PRs #110, #111 e #112 têm a base trocada para `develop` pelo `tech-lead` (etapa E1.1).

Alinha com o fluxo `feature/*` → `develop` → `homolog` → `main` (R-FLUXO, R-MAIN): nenhum PR de dependência vai direto à `main`.

## Risco

- Baixo. Só muda a base dos PRs; o custo é zero (R-CUSTO).
- Com `target-branch`, o Dependabot deixa de abrir PRs de alerta de segurança contra a `main` para os ecossistemas configurados: atualizações de segurança também passam a ir para a `develop` e dependem do fluxo de promoção para chegar à `main`. Aceitável, mas mais lento para correção urgente (hotfix sai da `main`, por decisão do dono).
- A `develop` precisa existir e aceitar PRs de bots; ela é protegida, e os checks exigidos rodam normalmente.

## Lacunas

`actionlint` não se aplica (arquivo não é workflow). O parecer de segurança (E2.2) é etapa separada.
