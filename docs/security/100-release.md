---
tipo: revisao-seguranca
contrato: 1
pedido: 100-release-bloqueios-simulador
branch: docs/100-release-b
commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: release 100 (develop 27ac9064 contra homolog, PRs 315 a 325)

Propósito: parecer de segurança da release 100 (E1.2), revalidado na volta por delta. A primeira passada revisou `git diff origin/homolog 77c208a9` (61 arquivos, +2021 -294) com parecer aprovado no commit `fc0f952a`; depois dela entrou na develop o PR 325 (K-271, commit `c7c3e092`), e a develop passou a `27ac9064`. Esta volta lê o delta `fc0f952a..27ac9064`: o K-271 (`server/src/entradas/criterios-apontamento.ts` e o teste dele), a linha do CHANGELOG e pareceres de outros papéis. O restante da release é o mesmo código já revisado e as conclusões da primeira passada valem como estão. Nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
- CI/CD: `.github/workflows/ci.yml`, `.github/workflows/homolog.yml`, `.github/actions/playwright/action.yml` (container do Playwright, PR 318).
- Segredos e configuração: leitura do `.env` em `server/src/entradas/criterios-apontamento.ts` (PR 319) e o tratamento de falha dessa entrada (PR 325).
- Manifesto: `server/package.json` (script novo).
- Contrato da API: enum de `notas` do O1, O2 e O3 (PR 323, lote 9b).

## Resultado
- **K-271, falha do banco imprime só a categoria: conforme.** `server/src/entradas/criterios-apontamento.ts:26-37` passa a carregar a configuração e criar o pool dentro do `try`; o `catch` (`:32-34`) imprime só `bm:criterios-apontamento falhou: <categoria>` com `categoriaDoErro` (`server/src/plataforma/categoria-erro.ts:24-31`), que devolve `configuração: <nomes>`, `autenticação`, `conexão` ou `outro`, nunca valor, URL, host, porta, usuário nem texto do erro do banco; sai com código 1 e `pool?.end()` no `finally`. Trecho idêntico ao modelo `server/src/entradas/ref-sync-apontamento.ts`. Fecha o A1 do parecer 096.
- **K-271, data civil e argumento a mais: conforme.** `:22` usa `dataCivilValida` (regex mais ida e volta por `Date`, `server/src/modulos/referencia/dominio-acelerato.ts:28-32`) e recusa `process.argv.length > 3` com o uso e código 2, antes de qualquer conexão. Fecha o A2 do parecer 096.
- **Teste do K-271 com segredo falso, sem base real: conforme.** Os casos novos (`server/tests/criterios-apontamento-entrada.test.ts:62-81`) usam o isolador que troca `process.loadEnvFile`, e o caso de conexão (`:91-101`) afirma a saída exata `falhou: (conexão|outro)` e a ausência de `127.0.0.1`, `migrador` e `segredo-de-teste`. Rodado nesta volta: `vitest run tests/criterios-apontamento-entrada.test.ts`, 8 verdes.
- **CHANGELOG do delta sem credencial: conforme.** A linha alterada (`CHANGELOG.md:44`) só descreve o K-271.
- **Container do Playwright fixado por digest: conforme** (primeira passada, sem diff no delta). `ci.yml:198` e `ci.yml:254` e os dois jobs do `homolog.yml` usam `mcr.microsoft.com/playwright:v1.64.0-noble@sha256:06a9939e…971f`; o passo composto só confere o executável, sem `${{ }}` no script; saem o `apt` no runner e o cache de `~/.cache/ms-playwright`. A atualização do digest é manual (A1).
- **Permissões dos workflows: conforme** (sem diff no delta). `permissions: contents: read` no topo, nenhum `secrets.`, sem `pull_request_target`, ações fixadas por SHA.
- **Remoção do simulador (ADR 0030, L1): conforme** (sem diff no delta). `HttpFonteMetricas` pura no modo `api` (`web/src/app/App.tsx:39-40`); caso hostil `simulavel: true` sem selo (`web/src/app/composicao.test.tsx:44-69`); `mock` só por `VITE_FONTE=mock` explícito. O chunk do mock ainda vai no build `api` (A2).
- **Contrato do 9b, dado de pessoa, calendário e dependências: conforme** (sem diff no delta). `notas` continua `z.enum`; a única consulta nova lê só `type_id` e `dim_card.tipo`; filtro `tipo` por parâmetro `$n::text[]`; `pnpm-lock.yaml` sem diff.
- **Lacunas de ferramenta:** `gitleaks`, `semgrep`, `osv-scanner`, `zizmor` e `actionlint` não estão no PATH; não rodei nenhum. Sem dependência nova e sem expressão nova nos workflows, fica com o CI.

## Achados
- A1 (recomendado) .github/workflows/ci.yml:198 · digest da imagem do Playwright é atualizado só à mão e o .github/dependabot.yml não cobre imagem em workflow; amarrar a troca de tag e digest ao PR que sobe o Playwright (4 jobs: ci.yml e2e-parte e perf, homolog.yml e2e-homolog-parte e perf-homolog). Dono: devops-engineer.
- A2 (recomendado) web/src/data/index.ts:22 · FonteComSimulado e o chunk do mock seguem no build api, sem uso no modo api; manter os lotes L2 a L3 e as guardas G1 a G4 da ADR 0030 como condição para a próxima release, para o simulador não voltar por um import. Dono: react-frontend.

## Plano em cartões
Nenhum bloqueante. O A3 da primeira passada (A1 e A2 do parecer 096) está fechado pelo K-271 e sai da lista. A1 ao devops-engineer (envio de workflow é do dono, escopo `workflow`); A2 no plano do pedido 099 (lotes L2 a L3). Nenhum segura a release.

## Riscos aceitos
Nenhum.
