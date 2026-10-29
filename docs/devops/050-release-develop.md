---
tipo: revisao-devops
contrato: 1
pedido: 050-release-develop
branch: docs/promocao-2026-10-29
commit: 311691bace0582d80ea06ffc12f20096f1248b87
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-10-29
---
# Review de devops: promoção da `develop` à `homolog` (release O19 a O26)

Aprovado, sem achado bloqueante. Escopo: `git diff origin/homolog origin/develop -- .github package.json pnpm-lock.yaml` (`ci.yml`, `homolog-aprovada.yml`, `homolog-reavalia.yml` novo, `homolog.yml`, `package.json`, `pnpm-lock.yaml`), lido por diff, sem rodar workflow nem suíte. Os pareceres de devops dos PRs (041, 044, 047) já aprovaram cada mudança; aqui só a conferência do conjunto.

## O que muda nos workflows
- **#154 e #159, E2E em 2 partes** (`ci.yml:190-253`, `homolog.yml`): o job `e2e` vira matriz `e2e-parte` (`parte: [1, 2]`, `fail-fast: false`, `--shard=N/2`, `timeout-minutes: 30` por parte) e um agregador leve (`timeout-minutes: 5`, `if: always()`) que falha se `needs.e2e-parte.result` não for `success`; o resultado entra por `env`, sem interpolação em `run`. O `docs:mermaid` roda só na parte 1. Artefato de falha por parte (`e2e-relatorio-N`, 3 dias de retenção). Custo: dois jobs em paralelo no lugar de um, mesma franquia gratuita (`R-CUSTO`), tempo de parede menor.
- **#153, `homolog-aprovada` sem corrida** (`homolog-aprovada.yml`): sem espera; avalia o estado atual do portão e, se ele ainda roda, falha com mensagem clara. O critério de aprovação não mudou (mesmo `aprovacao.ts` da base, checkout do `base.sha`). Acrescenta `GH_TOKEN` e `REPO_BASE` só no passo que precisa, com `permissions: contents: read, actions: read`.
- **`homolog-reavalia.yml` novo** (`workflow_run` do workflow `Homologação`, nome conferido com `homolog.yml:1`): ao fim do portão `push` em `homolog`, reexecuta o `homolog-aprovada` do PR aberto para a `main` com o mesmo sha. Sem checkout, sem código da branch; `permissions` `contents: read`, `actions: write`, `pull-requests: read`; os valores de contexto vão por `env`; `timeout-minutes: 5`; até 6 tentativas de 10 s. Sem `continue-on-error` nem escrita na `main` (`R-MAIN`, `R-VERIFY`).
- Ações permanecem fixadas por SHA; nenhuma ação nova.

## Dependências
- #145 `typescript-eslint` 8.71.2 → 8.72.0 e família `@typescript-eslint/*` (minor); #146 `@tanstack/react-query` 5.104.2 → 5.104.5 (patch); `ignore` 7.0.12 → 7.0.13.
- #147 `react-router` 7.18.4 → **8.5.0 (major)**: troca `cookie`/`set-cookie-parser` por `cookie-es` e traz `@remix-run/route-pattern`. A quebra no web foi corrigida em #149 (`fix(web)`), que está na `develop`. Lockfile coerente com o `package.json`; instalação congelada continua válida.
- `package.json` (scripts): `test`, `pronto`, `test:pg` e `e2e` passam por `scripts/suite-unica.sh` (trava `flock`; sem aninhamento; recusa link simbólico). `flock` existe no `ubuntu-latest`; a trava só serializa suítes na máquina local e é inócua num runner limpo. Novos `test:trava` e `pronto:interno`, este com o teste da trava dentro do `pronto`.
- Política do Dependabot (#160, K-169) só documental.

## Checks obrigatórios do ruleset (§10) e portão da `homolog` (§4)
- Nomes preservados: `e2e` continua sendo o job agregador do `ci.yml` (`name: e2e`), então o ruleset 25003880 (nove checks) segue casando. Os checks `e2e-parte (1/2)` e `(2/2)` são novos e **não** devem ser exigidos. Nada a mudar no ruleset (é do dono, `R-CONFORMIDADE`). `rapida`, `testes`, `filtro`, `banco`, `openapi`, `imagem`, `build`, `seguranca` e `perf` não mudaram.
- Portão do push em `homolog`: `portao <sha>` mantém `needs: [escopo, portao-docs, qualidade, banco, e2e, perf, migracao-smoke]` e lê `needs.e2e.result`; o agregador mantém o id `e2e` e o nome `e2e-homolog`. Com escopo `codigo` exige `success` dos cinco jobs; com escopo `docs`, só o `docs:check`. Roda como a §4 descreve (2b). `EXIGIR_NOTURNA` segue `false` (noturna informativa).

## Achados
- A1 (recomendado) `.github/workflows/homolog-reavalia.yml:4-6` · Workflows disparados por `workflow_run` só valem com o arquivo na branch padrão. Na primeira release que o leva à `main`, o PR `homolog` → `main` ainda não terá a reavaliação automática; se o `homolog-aprovada` falhar por "portão ainda não terminou", use Re-run jobs no PR depois do portão verde. O comentário do arquivo já avisa. Sem efeito no critério de aprovação. Dono: tech-lead (ciente no PR de release).
- A2 (recomendado) `.github/workflows/ci.yml:190-229` · Parte 2 da E2E mais longa que a 1 (registro do parecer 044: ~6 min); se a suíte crescer, subir para 3 partes é mudança de matriz, sem tocar no agregador.
- A3 (recomendado) `.github/workflows/homolog-aprovada.yml` · O YAML do check vem do merge ref e a regra, da base: `.github/**` e `tools/homolog/**` pedem olhar atento do dono no PR de release, e a mudança em `.github/` exige o rótulo `afrouxa-regra` do dono (catraca) no PR que a leva.
- A4 (recomendado) lacuna de ferramenta: `actionlint` fora do PATH, não executado; sintaxe conferida por leitura contra os workflows já aprovados.

## Riscos e rollback
- Risco baixo: mudança só de orquestração; custo de dinheiro zero. O maior risco operacional é o portão novo da E2E partida estourar 30 min por parte, o que o histórico (parte mais lenta bem abaixo do teto) não indica.
- Rollback: reverter o PR de promoção (revert do merge commit na `homolog`) restaura os workflows anteriores (`e2e` em job único e `homolog-aprovada` com a regra antiga); nome `e2e` preservado nos dois sentidos, então o ruleset não precisa mudar. Dependências: reverter `package.json` e `pnpm-lock.yaml` (react-router 8 sai junto com o #149, que deve ir no mesmo revert). Sem migração de banco neste diff, portanto sem caminho de volta de dados a conferir.
