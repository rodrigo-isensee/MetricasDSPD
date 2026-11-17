---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: ci/105-ci-economia
commit: 06aecfda01fb7ee2981a4ce4f11309ac8a24ef15
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-17
---
# Review de segurança: CI econômico (E7.598)

Escopo: `.github/workflows/ci.yml` no diff `origin/develop...06aecfda` (mais `changelog.d/ci-105-ci-economia.md` e a nota `docs/devops/105-ci-economia.md`, sem efeito de segurança). Decisão do dono: gastar menos minutos sem afrouxar portão e sem custo novo (`R-CUSTO`).

Resultado: **aprovado**, com duas recomendações de endurecimento (A1, A2). Nenhum portão exigido some ou fica pendente; a classificação "só documento" não deixa passar arquivo que o código lê; não há `continue-on-error`, retry, `[skip ci]`, segredo, permissão ou ação nova no diff.

Suíte: sem PR para a branch e com o Actions parado por cobrança, este parecer **não afirma CI verde**; a suíte inteira fica para o CI do PR. O autor não rodou o `pronto` (sem dependências instaladas na worktree dele) nem o `actionlint` (ausente do PATH), lacunas registradas na nota dele. Não há teste de abuso novo a rodar (o diff não toca código de produção nem teste); a prova aqui é por leitura do código da ação de filtro na SHA fixada e por reprodução local da lógica (sondas abaixo).

## Gatilhos
`R-SEGURANCA`: pipeline de CI (condições dos jobs que compõem os checks exigidos da `develop` e da `homolog`). Sem dado pessoal, segredo, permissão nem dependência nova.

## Achados
- A1 (recomendado) .github/workflows/ci.yml:136 · Passo `p` falha aberto: FORA vazio dá pesado=false. Hoje inalcançável (falha do filtro derruba o check exigido `filtro`), mas o certo é fechar: só `[ "$FORA" = 'false' ]` libera o modo leve.
- A2 (recomendado) tools/homolog/src/aprovacao.ts:145 · Hotfix aceita qualquer execução `pull_request` do ci.yml com sucesso no SHA; com o modo leve, um PR só de documento para a develop no mesmo SHA conta como "CI completo". Exigir o job `build` em sucesso (não pulado) na execução.

## Sondas

## Detalhe dos achados

### Conferências (o que foi provado)
1. **Checks exigidos não somem nem ficam pendentes.** A leitura do ruleset pela API devolveu HTTP 403 ("Upgrade to GitHub Pro", ver Observação 1); a lista usada é a documentada em `docs/engineering/fluxo-homologacao.md` §15: `rapida`, `testes`, `build`, `e2e`, `filtro`, `banco`, `openapi`, `imagem`, `seguranca`. Os nove jobs continuam no `ci.yml` com os mesmos `name` (YAML lido: `banco, build, e2e, e2e-parte, filtro, imagem, openapi, perf, rapida, seguranca, testes`). `openapi`, `imagem` e `build` pulados por `if` de job contam como sucesso; `testes` sempre roda (`spec:check` e `docs:check`); `rapida` (lint, formatação, typecheck) não mudou e roda em todo evento fora do agendamento.
2. **Falha fechada quando o filtro falha.** Cinco jobs passaram a depender de `filtro`. Se ele falhar, os dependentes ficam pulados, mas `filtro` é check exigido (vermelho barra o merge) e o agregador `e2e` (`ci.yml:274-289`, `if: always()`) recebe `PESADO` vazio e `RESULTADO=skipped`, cai em `test "skipped" = "success"` e falha. O `skipped` só passa com `pesado=false` literal.
3. **"Só documento" não cobre o que o código lê.** O código lido em tempo de execução e pelos testes sob `docs/` é JSON e SQL (`server/src/modulos/referencia/calendario.ts:17`, `dominio-acelerato.ts:13`, `alvos-acelerato.ts:19`, `sle-businessmap.ts:18`, `businessmap/dominio-businessmap.ts:19`, `businessmap/conferencia.ts:8`, `apontamento/dicionario.ts:17`, `server/src/entradas/openapi.ts:7`, `server/tests/acelerato-estatico.test.ts:87`); nenhum `.md` de `docs/` é importado pelo servidor, pela interface nem pela E2E. `changelog.d/` só é lido por `scripts/changelog.mjs:81` (só `.md`). O que lê Markdown (`docs:check`, `spec:check`) continua rodando no modo leve. A ação de filtro (SHA `ceb8a2b8…`, `src/filter.ts`) usa `dot: true`, então `.github/**`, `.npmrc` e `.githooks/**` contam como código; em PR, renomeação vira remoção do nome antigo mais adição do novo (`src/main.ts`, `listFiles`), então mover código para `docs/x.md` não vira "só documento".
4. **Modo leve só onde a decisão permite.** `pesado=false` exige evento `pull_request` com base diferente de `homolog` e `main`, ou `push` em `develop`. PR para `homolog` ou `main`, push em `homolog`, `workflow_dispatch` e agendamento rodam inteiros. Em push na `develop` a ação compara com a branch padrão (`main`), o que, na prática, quase sempre inclui código e mantém o modo inteiro (lado seguro). As entradas do passo vêm por `env:` (sem injeção de expressão no script).
5. **Push em `main` (e em `feature/*`, `hotfix/*`) deixa de disparar o CI.** Nada depende dessas execuções: o `homolog-aprovada` lê o `homolog.yml` (push em `homolog`) e, para hotfix, execuções `pull_request` do `ci.yml` (`tools/homolog/src/aprovacao.ts:142-146`); o agendamento segue na branch padrão. Efeito colateral positivo: some a execução de push no mesmo SHA do PR, que podia deixar `e2e`/`banco` pulados no mesmo nome de check (dúvida registrada na §15 do fluxo de homologação). A `main` só recebe PR de release, cujo CI roda inteiro.
6. **Sem afrouxamento nem custo.** O diff não acrescenta `continue-on-error`, retry, `[skip ci]`, `secrets.`, `permissions`, `pull_request_target` nem ação nova; as ações seguem fixadas por SHA. O `continue-on-error` do `seguranca` é anterior e decidido pelo dono.

### A1. Passo `p` falha aberto com saída vazia
- Evidência: `.github/workflows/ci.yml:136` (`if [ "$FORA" != 'true' ]`).
- Caminho de ataque: nenhum hoje. A ação de filtro sempre escreve `true` ou `false`; se falhar, o job `filtro` (exigido) fica vermelho. O risco é de regressão: uma troca de versão da ação ou de nome do filtro que deixe a saída vazia ligaria o modo leve em silêncio (nos PRs para a develop, `typecheck` por pacote, cobertura, `build`, `openapi`, `imagem` e E2E pulados).
- Severidade: baixa. Correção mínima: trocar a condição por `if [ "$FORA" = 'false' ]; then` (o resto igual). Esforço P. Dono: `devops-engineer`.

### A2. Hotfix aceita execução leve como "CI completo"
- Evidência: `tools/homolog/src/aprovacao.ts:142-146` filtra só por arquivo, evento `pull_request` e SHA; a mensagem da linha 154 promete "CI completo verde".
- Caminho de ataque: um `hotfix/*` só de documento com um PR aberto para a `develop` no mesmo SHA ganha uma execução `pull_request` verde no modo leve, que satisfaz o `homolog-aprovada` do PR para a `main`. Impacto limitado: o conteúdo é só documento, o PR para a `main` roda o CI inteiro e os checks exigidos da `main` continuam valendo, e a aprovação do usuário é obrigatória. Por isso não bloqueia.
- Severidade: baixa. Correção mínima: em `decidirHotfix`, aceitar só execução cujo job `build` tenha `conclusion === 'success'` (já existe `api.jobsComSucesso`), ou cuja base seja `main`. Esforço P. Dono: `devops-engineer` (com teste do `qa-engineer`).

### Informativo (sem achado)
- PR com base trocada sem novo push (`pull_request` sem o tipo `edited`) mantém os checks calculados para a base antiga. Já valia antes para `banco` e `perf`; o fluxo nunca abre `feature/*` para `homolog`, e o `homolog.yml` e o `homolog-aprovada` cobrem a promoção. Nada a mudar agora.
- A API de PR lista no máximo 3.000 arquivos; um PR maior poderia ser classificado só pelos primeiros. Irrealista no fluxo, e `rapida` e a promoção rodam inteiros.

### Observações fora do diff (ao dono, pelo Jarvis)
1. **Proteção da `develop`, `homolog` e `main` possivelmente não aplicada.** `gh api .../rulesets/25003880` e `.../rules/branches/develop` devolvem HTTP 403 "Upgrade to GitHub Pro or make this repository public to enable this feature" (repositório privado). Em repositório privado sem plano pago, ruleset e proteção de branch não são aplicados; se for o caso, os nove checks exigidos, o squash obrigatório, o bloqueio de force-push e o `homolog-aprovada` na `main` valem só pelo processo e pelo hook local. Não foi possível provar o estado; é decisão do dono (`R-DECISAO`, `R-CUSTO`).
2. `tools/homolog/src/escopo.ts:9` classifica qualquer arquivo de `docs/` (inclusive JSON lido pelo servidor) como documentação no portão da `homolog`, mais largo que o filtro novo do `ci.yml`. Mitigado porque o PR para `homolog` roda o `ci.yml` inteiro; vale alinhar ao critério do `ci.yml` (dono: `devops-engineer`).

## Riscos aceitos e ferramentas
- Riscos aceitos: nenhum.
- Ferramentas: leitura do diff e do código da ação de filtro na SHA fixada (API pública do GitHub, só leitura); sondas locais da classificação de caminhos (mesmo casador de padrões, versão 4 localmente contra a 2 empacotada na ação) e do passo `p` (mesma lógica de shell), com os resultados da seção 3 e 4; YAML lido com um parser padrão.
- Faltaram no PATH (lacuna, não instalado): `actionlint`, `zizmor`, `gitleaks`, `semgrep`, `osv-scanner`, `trivy`. O `seguranca` do CI cobre auditoria e segredos quando o Actions voltar.
