---
tipo: revisao-devops
contrato: 1
pedido: 107-ci-sem-gasto
branch: ci/107-runs-on-proprio
commit: acb62951646cfebc2243c8429e1f6582bc9d1175
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-17
---
# Review de devops: 107-ci-sem-gasto, runs-on próprio (E1.14 e revalidação E1.18)

## Parecer
Aprovado o diff, na revalidação (E1.18). A primeira passada reprovou por 1 defeito provado (o `migracao-smoke` chamava `docker compose` no runner sem Docker). A correção na worktree 091 (ainda sem commit) o resolve. Condição para o merge, fora do diff: o runner v2 ainda sem sonda e sem prova do JIT, que depende do `sudo` do dono (A4). Os achados A1, A2 e A3 da primeira passada estão fechados (ver Revalidação).

## Revalidação
Lida por `git diff acb62951` e `git status` na 091 (só leitura). Arquivos alterados: `ci.yml`, `homolog.yml`, `restauracao.yml`, `playwright/action.yml`, `tools/homolog/src/artefatos.test.ts` e `changelog.d/ci-107-runs-on-proprio.md`.
- **A1 fechado.** `homolog.yml` divide em `migracao` (runner próprio, Postgres local, sem passos de compose) e `smoke` (`ubuntu-latest`, `needs: escopo`, `if` de código e `github.event_name != 'schedule'`, `timeout-minutes: 30`, gera o `.env.homolog`, `homolog:subir` e `homolog:derrubar -- --volume` com `if: always()`). O `portao` tem `migracao` e `smoke` no `needs`; `migracao` entra no `RESULTADOS_CODIGO`; o smoke é avaliado à parte (`RESULTADO_SMOKE`): fora da noturna exige `success`, na noturna aceita `skipped`. Não restou `docker` em passo de job de runner (as 2 ocorrências de `docker/postgres/init/...` são caminho de script). Teste novo em `artefatos.test.ts` cobre runs-on, `if` e o `skipped`. Mantém `R-VERIFY`: skipped só vale na noturna, e esta já era informativa.
- **A2 fechado.** O filtro `imagem` agora cobre `server/Dockerfile`, `server/package.json`, `docker/**`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` e `ci.yml`, e o job roda sempre em PR para `homolog` e `main`; pulado conta como aprovado no check exigido (`R-CUSTO` dentro da franquia).
- **A3 fechado.** O `gitleaks` falha fechado se o binário faltar (`command -v ... || exit 1`), com `::error::`; o job segue informativo (`continue-on-error` anterior, não novo).
- `playwright/action.yml`: só comentário e mensagem. Changelog registra a divisão e o critério de reversão (voltar ao job único em `ubuntu-latest` com `services`).
- Sem `continue-on-error` novo, sem `[skip ci]`, sem teste pulado, ações por SHA, `permissions` e `concurrency` intactos.

## Achados
- A4 (recomendado) .github/workflows/ci.yml:23 · condição para o merge: o runner v2 (`[self-hosted, metricas]`) segue sem sonda e sem prova do JIT (depende do `sudo` do dono); sem o runner de pé, todo job fica pendente e nenhum PR fecha. O dono executa e a sonda confirma antes do merge.

## Notas
Rollback: reverter o commit (volta para `ubuntu-latest`, `services` e `container`); ver critério no changelog. Arquivos protegidos de `.github/` mudam: pode exigir o rótulo `afrouxa-regra` do dono no PR (catraca); o `tech-lead` avalia; o envio de workflow é do dono (escopo `workflow`). Custo: o `smoke` hospedado roda só em push para `homolog` e `workflow_dispatch`, poucos minutos; medir no checkpoint com `gh run list`. Lacunas: `actionlint` ausente do PATH, não executado; nenhum script de shell mudou. A imagem do runner (Postgres 17, Chromium, gitleaks) é do `107-runner-v2.md` e não foi verificada aqui. Este parecer não afirma CI verde: a suíte e o e2e ficam para o CI do PR (ainda sem PR).
