---
tipo: revisao-seguranca
contrato: 1
pedido: 100-release-bloqueios-simulador
branch: docs/100-release
commit: fc0f952ab1d746fbd0a4cd1728cf086126a66cfb
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: release 100 (develop 77c208a9 contra homolog, PRs 315 a 324)

Propósito: parecer de segurança da release 100 (E1.2). Revisão estática de `git diff origin/homolog 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047` (61 arquivos, +2021 -294) nos arquivos de código, CI e contrato, mais os pareceres de segurança do range (`docs/security/095-runner-ubuntu-2404.md`, `docs/security/096-criterios-apontamento-env.md`). O commit `fc0f952a` só soma o CHANGELOG ao código de `77c208a9`. Nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
- CI/CD: `.github/workflows/ci.yml`, `.github/workflows/homolog.yml`, `.github/actions/playwright/action.yml` (container do Playwright, PR 318).
- Segredos e configuração: leitura do `.env` em `server/src/entradas/criterios-apontamento.ts` (PR 319).
- Manifesto: `server/package.json` (script novo).
- Contrato da API: enum de `notas` do O1, O2 e O3 (PR 323, lote 9b).

## Resultado
- **Container do Playwright fixado por digest: conforme.** `ci.yml:198` (`e2e-parte`), `ci.yml:254` (`perf`) e os dois jobs equivalentes do `homolog.yml` (`e2e-homolog-parte`, `perf-homolog`) usam `mcr.microsoft.com/playwright:v1.64.0-noble@sha256:06a9939e…971f`, imagem oficial da Microsoft, imutável pelo digest. Esta é a primeira revisão de segurança do container: o parecer do 095 (`commit 60bdc206`) cobriu só a troca de `runs-on`. Efeito líquido positivo: saem o `apt` no runner e o `actions/cache` de `~/.cache/ms-playwright` (uma superfície de envenenamento de cache a menos); o passo composto (`.github/actions/playwright/action.yml:11-14`) só confere o executável, sem expressão `${{ }}` nem entrada externa no script, e falha alto se a versão do container divergir da do `pnpm-lock.yaml`. `options: --ipc=host` é a recomendação oficial do Playwright para o Chromium; em runner hospedado e efêmero, sem segredo no job, não abre caminho realista. A atualização do digest é manual (A1).
- **Permissões dos workflows: conforme.** `permissions: contents: read` no topo (`ci.yml:14`, `homolog.yml:18`) sem diff; nenhuma `permissions:` nova por job, nenhum `secrets.` nos dois arquivos, sem `pull_request_target`, `on:` sem diff; as ações seguem fixadas por SHA. Os jobs no container não recebem segredo; o `GITHUB_TOKEN` só lê.
- **Critérios do apontamento lendo o `.env` sem imprimir nada dele: conforme.** `server/src/entradas/criterios-apontamento.ts:11-19` resolve a raiz pelo próprio arquivo e chama `process.loadEnvFile`; na falha imprime só o `code` do erro, `ENOENT` é silencioso; a saída normal é só `{ vigenteDesde, gravadas }` (`:29`). Mesmo trecho e mesmas sondas do parecer 096 (aprovado, S1 a S3 sem vazamento da senha falsa). Os dois recomendados daquele parecer seguem abertos no código da release (A3).
- **Remoção do simulador (ADR 0030, L1): conforme.** `web/src/app/App.tsx:39-40` devolve `HttpFonteMetricas` pura no modo `api`; o `useMetrica` só simula com fonte `FonteSimuladora` (`web/src/data/useMetrica.ts:74`), que `HttpFonteMetricas` não é, então o `simulado: true` que ficou nos cartões não tem efeito. Teste novo prova o caso hostil (API marcando `simulavel: true`) sem o selo "Simulado" (`web/src/app/composicao.test.tsx:44-69`). O modo `mock` continua só por `VITE_FONTE=mock` explícito, com valor inválido falhando na partida (`App.tsx:41`); o modo homologação (`docker-compose.homolog.yml`, `DSPD_MODO_MOCK=homologacao`) e a guarda do servidor não estão no diff. O código do mock ainda entra no build `api` como chunk sob demanda não baixado; as guardas G1 a G4 contra a volta chegam nos lotes L2 a L3 (A2).
- **Contrato do 9b: conforme.** `bloqueio-sem-dado-real` sai de `NOTA_CARTAO_IDS` e `TEXTO_NOTA_CARTAO` (`packages/contratos/src/origem.ts:146-155`), do OpenAPI e das três fotografias; `notas` continua `z.enum` e recusa id fora do contrato (`origem.test.ts:158-166`). O servidor deixa de emitir a nota (`server/src/modulos/metricas/parte-sem-dado.ts`) e a parte de bloqueio do O1 continua `null`, nunca 0, com o interruptor de reversão desligado (`servico.ts:322-323`). Mudança incompatível declarada e aceita por `aceitas.json` de uso único, que não ficou na árvore. Sem efeito de confidencialidade.
- **Nenhum dado de pessoa novo exposto: conforme.** A única consulta nova, `lerTiposDoHistorico` (`server/src/modulos/apontamento/repositorio.ts:55-64`), lê só `type_id` e `dim_card.tipo` (rótulo de categoria), sem coluna de pessoa; esquemas vêm de `montarEsquemas`, não do pedido. O filtro `tipo` continua validado pelo schema da rota com recusa de repetidos (`rotas.ts:27-32`) e chega ao banco por parâmetro `$n::text[]` (`lerCardsIncompletos`, `repositorio.ts:164-178`). O erro 400 continua sem ecoar o valor recebido. CA-075-11 (sem chave de pessoa em O1, O2, O5, O19, BLOQUEADOS) sem mudança.
- **Calendário (K-174): conforme.** `packages/metricas/src/core/calendario.ts` passa a copiar o conjunto de feriados na criação e guarda um cache em `WeakMap`; só integridade de cálculo, sem entrada externa nem custo novo de memória que um cliente controle.
- **Nenhuma dependência nova: conforme.** `pnpm-lock.yaml` e `package.json` sem diff; o único manifesto tocado é `server/package.json:31`, um script `tsx` (devDependency existente).
- **Testes dos arquivos tocados (rodados nesta revisão):** `packages/contratos` `vitest run src/origem.test.ts` 17 verdes; `server` `vitest run tests/criterios-apontamento-entrada.test.ts tests/apontamento-rota.test.ts` 77 verdes; `web` `vitest run src/app/composicao.test.tsx` 9 verdes. A suíte inteira fica com o CI do PR.
- **Lacunas de ferramenta:** `gitleaks`, `semgrep`, `osv-scanner`, `zizmor` e `actionlint` não estão no PATH; não rodei nenhum. Sem dependência nova e sem expressão nova nos workflows, fica com o CI.

## Achados
- A1 (recomendado) .github/workflows/ci.yml:198 · digest da imagem do Playwright é atualizado só à mão e o .github/dependabot.yml não cobre imagem em workflow; amarrar a troca de tag e digest ao PR que sobe o Playwright (4 jobs: ci.yml e2e-parte e perf, homolog.yml e2e-homolog-parte e perf-homolog). Dono: devops-engineer.
- A2 (recomendado) web/src/data/index.ts:22 · FonteComSimulado e o chunk do mock seguem no build api, sem uso no modo api; manter os lotes L2 a L3 e as guardas G1 a G4 da ADR 0030 como condição para a próxima release, para o simulador não voltar por um import. Dono: react-frontend.
- A3 (recomendado) server/src/entradas/criterios-apontamento.ts:27 · os recomendados A1 e A2 do parecer 096 seguem abertos na release (falha do banco como pilha não tratada; data só por regex, sem recusar argumento extra); levar ao cartão do node-backend já previsto. Dono: node-backend.

## Plano em cartões
Nenhum bloqueante. A1 ao devops-engineer (envio de workflow é do dono, escopo `workflow`); A2 já está no plano do pedido 099 (lotes L2 a L3); A3 no cartão do node-backend aberto pelo parecer 096. Nenhum segura a release.

## Riscos aceitos
Nenhum.
