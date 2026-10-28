---
tipo: revisao-seguranca
contrato: 1
pedido: 047-pendencias-decididas-2026-10-28
branch: docs/047-portao-e2e
commit: 808694f7a81ff892f8a3a63951d2fe008660c067
parecer: aprovado
veredito: aprovado
revisor: forge:security-engineer
data: 2026-10-28
---
# Review de segurança: E2E do portão da homolog em 2 partes (pedido 047, E2.6, K-172)

Propósito: parecer de segurança sobre a mudança em `.github/workflows/homolog.yml` (job `e2e` dividido em `e2e-parte` com matriz 1/2 mais um agregador `e2e`), gatilho de `R-SEGURANCA` (CI/CD e portão de release). Público: tech-lead, devops-engineer.

**Veredito: aprovado**, sem bloqueante. Revisão estática do diff `455d360..359cec1` em `homolog.yml` e do job `portao` na worktree. Nada foi executado. `actionlint`, `zizmor`, `gitleaks` e `osv-scanner` não foram invocados: lacuna registrada (o diff não toca dependência, lockfile nem segredo; os workflows seguem para a CI).

## O que foi verificado
- **Permissões e segredos.** `permissions: contents: read` é global (`homolog.yml:18-19`), sem override nos jobs novos. `e2e-parte` e o agregador não usam `secrets.*` nem PAT; o agregador não tem checkout nem ação. Nenhum privilégio novo.
- **Injeção.** `matrix.parte` é literal `[1, 2]` definido no próprio arquivo (não vem de evento) e entra em `--shard=` e no nome do artefato. O agregador passa `needs.e2e-parte.result` por `env:` (`RESULTADO`), não pelo `run:`. Nenhuma expressão com dado controlável é interpolada em shell.
- **Ações de terceiros.** `checkout` e `upload-artifact` seguem fixados por sha com comentário de versão; as ações locais (`./.github/actions/preparar`, `playwright`) estão no repositório. Nenhuma ação nova.
- **Agregador `if: always()` e o `portao`.** O resultado de `needs.e2e-parte.result` em matriz é `success` só se as 2 partes passarem; `failure` se alguma falhar (`fail-fast: false` deixa as duas terminarem, sem mascarar); `cancelled` ou `skipped` também não são `success`. O agregador faz `test "$RESULTADO" = "success"`, e qualquer outro valor falha o job. O `portao` (`homolog.yml:262-287`) continua exigindo `success` literal de `needs.e2e.result` entre os cinco resultados de código ("skipped não vale"), então: parte falha, cancelada ou pulada, agregador pulado (escopo não `codigo` ou escopo falho, em que as saídas ficam vazias) ou agregador cancelado, tudo vira `failure` no `portao`. Em escopo `docs` o `portao` só olha `portao-docs`, como antes. O nome `e2e-homolog` e o id `e2e` são mantidos, o que preserva o contrato lido pelo `homolog-aprovada` (que procura o job `portao <sha>`).
- **Artefatos de falha.** Cada parte sobe `e2e-relatorio-${{ matrix.parte }}` só em `failure()`, com retenção de 3 dias; o nome único evita colisão entre as partes. Conteúdo: `e2e/playwright-report` e `e2e/test-results` (trace e screenshot só na falha, `e2e/playwright.config.ts:29-30`). A E2E roda contra dados sintéticos de semente, sem credencial real nem dado de pessoa do Acelerato; o job não carrega `.env` nem segredo. Sem caminho de ataque realista de vazamento; ver A1.
- **Mudança sem efeito de segurança.** O passo Mermaid agora roda só na parte 1 (`if: matrix.parte == 1`); não reduz cobertura de segurança, e a cobertura da E2E fica dividida por `--shard`, que particiona sem omitir (as duas partes são exigidas pelo agregador).

Nenhum achado bloqueante.

## Revalidação
Em 2026-10-28 (E2.16, K-144), sobre o head `808694f7a81ff892f8a3a63951d2fe008660c067`. A revalidação anterior (E2.12) foi sobre `5ee00a9250c4308a293e1c9ca93452a7e74696b8`; o `commit:` imediatamente anterior a este era `14ebc32c7a1b7b63d8488320751373e6dc94cf82`. Entre `14ebc32` e este head mudaram 8 arquivos: 1 linha do `CLAUDE.md` (o passo 4 do fluxo: "enviada" é o PR para a `develop`, push da feature branch liberado antes do parecer de QA, decisão do usuário de 2026-10-27) e pareceres em `docs/` (qa, reviews e devops, vindos pela develop com o #157 e revalidados). `git diff --name-only` sobre `.github`, `server`, `web` e `e2e` entre os dois commits é vazio: o `homolog.yml` e o job `portao` que este parecer avaliou não mudaram, e o `CLAUDE.md` é texto de processo, sem controle de segurança do workflow. Nada ali toca permissões, segredos, injeção, ações de terceiros, agregador nem artefatos. Veredito inalterado: aprovado, A1 e A2 seguem como estão.

## Achados
- A1 (recomendado) .github/workflows/homolog.yml:151 · os artefatos de falha (`e2e/test-results`, com trace e screenshot) só têm dado sintético hoje; se a semente da E2E passar a usar dado real, o artefato vira vazamento por 3 dias. Informativa, sem correção agora; manter a E2E só com semente sintética e a retenção curta. Dono devops-engineer.
- A2 (recomendado) .github/workflows/homolog.yml:164 · o agregador só confere `e2e-parte` e depende do `if` do job para o escopo; hoje o `portao` cobre os demais casos (agregador pulado vira falha). Manter `e2e` na lista `needs` do `portao` e o teste de `success` literal em qualquer refatoração futura. Informativa, sem correção.  Dono devops-engineer.
