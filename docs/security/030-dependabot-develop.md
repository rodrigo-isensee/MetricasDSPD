---
tipo: revisao-seguranca
contrato: 1
pedido: 030-prs-do-dependabot-para-develop
branch: feature/030-dependabot-develop
commit: 523372c3777ac254aae7d1b4e13e1dc36c068585
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-17
---
# Review de segurança: Dependabot com `target-branch: develop` (pedido 030)

Propósito: dar o parecer de segurança sobre a mudança em `.github/dependabot.yml` (gatilho: CI/CD, `R-SEGURANCA`). Público: tech-lead, devops-engineer, dono do repositório.

**Veredito: aprovado**, com duas observações (O-1, informativa; O-2, baixa) e nenhum achado que bloqueie.

Revisão estática do diff `0cad9f3..523372c` (`.github/dependabot.yml`, `docs/devops/030-dependabot-develop.md`). Nada foi executado; nenhuma ferramenta de varredura se aplica a uma mudança de duas linhas de configuração.

## Gatilhos
CI/CD e cadeia de suprimentos (configuração do Dependabot).

## O que mudou
Duas linhas `target-branch: develop`, uma em cada bloco (`npm` e `github-actions`) em `.github/dependabot.yml` (linhas 5 e 17). Nada mais: nenhuma `permissions:`, segredo, workflow, agrupamento, frequência ou limite de PRs foi tocado (`open-pull-requests-limit: 5`, `groups` e `schedule` idênticos).

## Efeito de segurança
- **Superfície de ataque: inalterada.** O Dependabot continua com as mesmas permissões e o mesmo escopo; só muda a branch de destino. Não há segredo novo nem `pull_request_target`.
- **Fluxo de chegada à `main`:** os PRs de atualização passam a mirar a `develop` e chegam à `main` só por develop → homolog → main, passando pelo portão da CI e pelo merge do dono. Isso é coerente com a `R-MAIN` e reforça o controle: nenhuma atualização de dependência ou de ação do Actions chega à produção sem o fluxo completo (supply chain: a dependência é testada em `develop` e `homolog` antes da release).
- **Ações do GitHub Actions:** o bloco `github-actions` também vai para `develop`; a atualização de uma ação altera workflow, que passa pelo review do tech-lead e pela CI antes de promover. Sem mudança de risco.

## Observações
- **O-1 (informativa): atraso de correção de vulnerabilidade.** Antes, um PR de atualização (inclusive de correção de vulnerabilidade) caía na `main`, mas o dono tinha de mesclar de qualquer forma; agora o caminho tem três degraus. O atraso real é o intervalo até a próxima release homolog → main (que é sob demanda). Não pede ressalva ao veredito: o PR em `develop` já recebe a CI e a correção pode ser promovida fora do ciclo normal quando a severidade pedir (recomendação: tratar vulnerabilidade alta ou crítica com release sob demanda, decisão do dono).
- **O-2 (baixa): alertas de segurança do Dependabot (security updates).** A documentação do GitHub trata `target-branch` principalmente como configuração de atualizações de versão; não afirmo, sem consultar a documentação vigente, se os PRs de security updates seguem o `target-branch` ou continuam na branch padrão (`main`). Se continuarem na `main`, o risco é só de um PR de segurança aberto na base errada, e o tech-lead pode trocar a base como foi feito nos PRs #110, #111 e #112 (`gh pr edit <n> --base develop`); a `main` continua protegida por R-MAIN (nenhum agente mescla). Correção mínima, se ocorrer: o tech-lead trocar a base do PR; dono: tech-lead. Verificar na primeira ocorrência após a mudança chegar à `main`.
- **Vigência:** o Dependabot lê a configuração da branch padrão; a mudança só vale depois da release homolog → main (E2.6, do dono). Até lá, os PRs novos continuam mirando a `main`; sem efeito de segurança novo, só atenção para trocar a base manualmente.

## Plano em cartões
Nenhum cartão obrigatório. Opcionais: O-2, verificação pelo tech-lead na primeira ocorrência de PR de alerta de segurança.

## Riscos aceitos
Nenhum. O parecer é `aprovado`, sem depender de aceite do usuário.
