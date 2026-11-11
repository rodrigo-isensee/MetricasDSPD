---
tipo: revisao-devops
contrato: 1
pedido: 100-release-bloqueios-simulador
branch: docs/100-release-b
commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-11
---
# Review de devops: 100-release-bloqueios-simulador

## Achados
- A1 (recomendado) homolog.yml (e2e-parte, perf) · o container do Playwright nunca rodou no portão da homolog; a primeira prova é o push em homolog. Se falhar, o `portao` fica vermelho e se corrige em PR para a develop, sem tocar a homolog.
- A2 (recomendado) ci.yml e homolog.yml · tag e digest do container (v1.64.0-noble) não são vistos pelo Dependabot; ao subir o Playwright no lock, trocar os dois no mesmo PR (já registrado no parecer 095, A2).
- A3 (informativo) actionlint ausente do PATH (lacuna); validei só leitura do diff e `shellcheck` presente, sem script de shell novo além do passo `run:` da ação.

## Detalhes
Escopo: `git diff origin/homolog 27ac9064 -- .github` toca três arquivos: `.github/actions/playwright/action.yml`, `.github/workflows/ci.yml` e `.github/workflows/homolog.yml` (PR 318, parecer de devops 095 já aprovado). Nenhum outro arquivo de `.github/`, `Dockerfile*`, `compose*` ou IaC muda.

Container e ação: `e2e-parte` e `perf` do `homolog.yml` (e os dois do `ci.yml`) passam a `runs-on: ubuntu-24.04` com `container: mcr.microsoft.com/playwright:v1.64.0-noble@sha256:06a9939e...` e `--ipc=host`. A ação `./.github/actions/playwright`, usada pelos dois jobs da homolog depois de `preparar`, deixa de instalar por apt e passa a conferir `chromium.executablePath()` no container, falhando alto se a versão divergir do lock. O passo Mermaid da homolog já usa esse mesmo `executablePath()`, coerente com o container. `checkout`, `pnpm/action-setup` e `setup-node` não dependem de apt do host; o job não usa `services:` (o Postgres é do job `banco`/`migracao-smoke`, que seguem em `ubuntu-latest` e fora do container).

Nomes dos checks: não mudaram. `e2e-parte` mantém `e2e-homolog-parte (N/2)`, o agregador `e2e-homolog`, `perf-homolog`, `banco-homolog`, `migracao-smoke`, `qualidade`, `portao-docs` e o `portao <sha>` (que consome `needs: [escopo, portao-docs, qualidade, banco, e2e, perf, migracao-smoke]`, intacto). O `homolog-aprovada.yml` e o `homolog-reavalia.yml` não são tocados e leem o job `portao <sha>` da execução `push`; a rodada noturna (`schedule`) usa os mesmos jobs e segue informativa. Os checks exigidos na proteção da `homolog` (`rapida`, `testes`, `banco`, `build`, `e2e`, `openapi`, `imagem`, `perf`, `fluxo-homologacao.md` §4) são jobs do `ci.yml` e mantêm id e nome (`e2e` e `perf` só trocaram runner e passos).

Segurança e regras: `permissions:`, ações fixadas por SHA e `timeout-minutes: 30` inalterados; sem `continue-on-error`, `[skip ci]` ou teste pulado (`R-VERIFY`); nada escreve na `main` (`R-MAIN`); imagem pública e runner padrão, custo zero (`R-CUSTO`). O container roda como root (padrão da imagem), sem segredo extra.

Passo manual no ambiente: nenhum. A release não adiciona variável, segredo, `environment`, regra de proteção nem migração de infraestrutura; o ambiente local de homologação (`pnpm run homolog:subir`) não depende dos workflows. Pendências do fluxo, já do 095: o envio de commit que toca workflow é do dono (escopo `workflow`) e o PR com arquivo protegido de `.github/` pede o rótulo `afrouxa-regra` na catraca, que vale enquanto esses arquivos não mudarem; avise o dono ao promover.

Evidência de execução: a API do GitHub respondeu 502 ao listar os jobs dos runs de PR recentes, então não confirmei aqui o verde dos jobs de container no `ci.yml`; os runs de PR que rodaram a suíte (k272-teste-pg, 43084331544, e fix/099-l1-sem-simulador, 43077704649) concluíram em sucesso, mas o detalhe por job não foi lido. A prova definitiva dos jobs da homolog é o portão no push em `homolog`.

## Custo e rollback
Custo zero. Rollback: reverter o PR 318 (commit `2e81af41`) volta ao apt do host, que hoje falha, ou trocar tag e digest do container para outra versão do mesmo produto.
