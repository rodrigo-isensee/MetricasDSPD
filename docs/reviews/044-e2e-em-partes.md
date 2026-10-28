---
tipo: review
contrato: 1
pedido: 044-e2e-da-ci-dentro-do-teto
branch: feature/044-e2e-em-partes
commit: 19549b9c6dc80704a40dadf22fc81860cb16308c
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-28
---

# Code review: E2E da CI em 2 partes (044, K-155)

## Parecer
Aprovado. O diff de código é só `.github/workflows/ci.yml` (+19/-4 em duas hunks, dentro do teto M14 de 400 linhas); o resto é o parecer de devops em `.md`. Revisado em 19549b9; o commit seguinte (3eae989, parecer de segurança) é só documentação e não altera o workflow.

## O que foi conferido
- Agregador `e2e`: `name: e2e` mantido (check obrigatório do ruleset), `needs: e2e-parte`, `if: always()` com o mesmo gatilho de antes (pull_request ou workflow_dispatch). `test "$RESULTADO" = "success"` com `needs.e2e-parte.result`: o resultado agregado da matriz é `failure` se uma parte falha, `cancelled` se cancelada e `skipped` se pulada, e nos três casos o teste falha e o `e2e` fica vermelho. Fora do gatilho o agregador é pulado, como o `e2e` antigo.
- Cobertura dos 726 testes: `--shard=N/2` com N em 1 e 2 particiona a suíte do Playwright sem sobra nem repetição, sobre os mesmos projetos (`test:chromium` em `e2e/package.json`); o argumento é repassado pelo `pnpm run`. A soma de 726 é medida no run do QA (E1.4).
- Mermaid só com `if: matrix.parte == 1`.
- Artefatos: `e2e-relatorio-${{ matrix.parte }}`, distintos, só em falha. O `homolog.yml` segue com o nome antigo e não foi tocado, o que é correto (job próprio).
- Nada de teto, timeout nem retry aumentado: `timeout-minutes: 30` por parte (igual ao anterior), agregador com 5, `fail-fast: false` só para as duas partes terminarem e mostrarem os dois relatórios. Nenhuma ação nova, SHAs mantidos, `permissions` inalterado.
- Regras de leitura do `praticas.md` que alcançam o diff: nenhuma além de R-CUSTO (sem custo de dinheiro) e R-SEGURANCA (parecer próprio da segurança, citado e não refeito).

## Achados
- A1 (recomendado) .github/workflows/ci.yml:231 · a parte 2 leva 19 min contra 13 da parte 1; se a suíte crescer, mudar a matriz para 3 partes (`--shard=N/3`) sem mexer no agregador.
- A2 (recomendado) .github/workflows/ci.yml:239 · os checks `e2e-parte (1/2)` e `e2e-parte (2/2)` são novos e não devem entrar no ruleset (o agregador cobre); é decisão do dono, sem ação aqui.
