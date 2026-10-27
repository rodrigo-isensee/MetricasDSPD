---
tipo: revisao-seguranca
contrato: 1
pedido: 042-forge-0-30-3-e-retomada
branch: feature/042-protecao-develop
commit: 3efb7b43cac8c6787ce5ac7fa1ab1b04043e446b
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-27
---
# Review de segurança, rodada 2: proteção da `develop` pelo ruleset 25003880 (pedido 042, K-148)

Propósito: revalidar, por delta sobre `docs/security/042-protecao-develop.md` (r1, commit 90e8dcc), a troca da proposta (PUT na proteção clássica, `strict` desligado) pela decisão B do dono: o ruleset 25003880 "develop: PR, squash, checks" com nove checks. Público: tech-lead, devops-engineer, dono do repositório.

**Veredito: aprovado**, sem achado bloqueante, com três recomendações (A1 a A3). O A1 do r1 está atendido; o A2 do r1 está atendido no texto, mas a leitura da API respondeu a pergunta que o texto deixa em aberto (A1 abaixo). Nada foi alterado no GitHub (`R-CONFORMIDADE`); só GET.

## Escopo e método
- `forge-check delta --parecer docs/security/042-protecao-develop.md`: intervalo `90e8dcc..3efb7b4`, só `docs/engineering/fluxo-homologacao.md` (linhas 44, 48, 68, 149, 180-181, 195-217). Todas relidas.
- GET `repos/rodrigo-isensee/MetricasDSPD/rulesets/25003880` (2026-10-27), GET `repos/rodrigo-isensee/MetricasDSPD` (`permissions`) e `gh api user`, com o token desta sessão, que é o mesmo dos agentes.
- `.github/workflows/ci.yml:3-8` (gatilhos), sem mudança desde o r1.

## Gatilhos
CI/CD e controle de merge (proteção de branch).

## Conferências pedidas

1. **O ruleset com os nove checks fecha a brecha do merge com CI vermelha ou em curso: sim, para merge sem bypass.** GET: `enforcement: active`, alvo `refs/heads/develop`, `required_status_checks` com `rapida`, `testes`, `build`, `e2e` e `strict_required_status_checks_policy: true`. Os cinco que faltam (`filtro`, `banco`, `openapi`, `imagem`, `seguranca`) entram na E4.4 pelo dono; a análise do r1 sobre "skipped" e o `filtro` (conferência 2 do r1) continua valendo, porque o `ci.yml` não mudou. Já com os quatro de hoje, PR com `rapida`, `testes`, `build` ou `e2e` vermelho ou em curso não entra.
2. **`strict` ligado melhora o r1.** O risco residual do r1 (conflito semântico entre dois PRs verdes, conferência 4) deixa de existir: o PR precisa estar atualizado com a `develop` e com a CI verde sobre essa base. Custo de tempo, não de segurança.
3. **O resto do ruleset não afrouxa nada.** `deletion` e `non_fast_forward` (sem deleção, sem force push); `pull_request` com 0 aprovações, `allowed_merge_methods: ["squash"]`, `dismiss_stale_reviews_on_push: true`, `require_extra_approval_for_unattributed_changes: true`; `do_not_enforce_on_create: false`. O texto da §15 (linha 199) descreve o GET corretamente.
4. **Bypass do administrador em modo `pull_request` no lugar do `enforce_admins`: equivalente em risco ao r1, decidido pelo dono.** `bypass_actors: [{actor_id: 5, actor_type: RepositoryRole, bypass_mode: pull_request}]`: o papel Admin pode mesclar um PR ignorando as regras, mas não pode fazer push direto, force push nem deletar a branch (o modo `pull_request` não libera isso). É mais restrito que `enforce_admins: false` da proteção clássica. Porém o GET devolve `current_user_can_bypass: "pull_requests_only"` e `permissions.admin: true` para `rodrigo-isensee`: o token que os agentes usam tem esse bypass (ver A1).
5. **Duas execuções do `ci.yml` no mesmo sha (push e pull_request, `ci.yml:4-5`).** A §15 (linhas 204 e 215) registra que não está provado que o check de push pulado não libere o merge com o `e2e` do PR em curso, e põe um passo de prova na conferência. Tratamento correto: a brecha só se considera fechada depois dessa prova (A2).
6. **Rollback pelas Settings é seguro.** Remover os cinco checks acrescentados volta ao estado de hoje (quatro checks, `strict`, resto igual); não deixa a `develop` mais aberta do que está. O rollback não deve ser "desativar o ruleset" (`enforcement: disabled`), que tiraria também a proteção contra force push e deleção; o texto (linha 217) não sugere isso.

## Achados

- A1 (recomendado) docs/engineering/fluxo-homologacao.md:207 · Pede confirmar que o token dos agentes não é admin; o GET diz que é (`current_user_can_bypass: pull_requests_only`). `gh pr merge --admin` de agente passa com CI vermelha. Registrar isso e o controle (agente não usa `--admin`).
- A2 (recomendado) docs/engineering/fluxo-homologacao.md:215 · A brecha só fica provada fechada com o passo de prova (merge bloqueado com o `e2e` do PR em curso e o do push pulado). Se falhar: limitar o `push` do `ci.yml:4` a `develop`, `homolog` e `main`. Dono: dono, devops-engineer.
- A3 (recomendado) docs/engineering/fluxo-homologacao.md:201 · Contextos sem `integration_id`: token com escrita publica status de mesmo nome e satisfaz o check. Na E4.4, escolher a origem GitHub Actions amarra os checks ao app. Endurecimento opcional. Dono: dono.

## Achados do r1
- A1 do r1 (`seguranca` com `continue-on-error`): **atendido**, a §15 (linha 205) o declara informativo e deixa a mudança ao dono.
- A2 do r1 (`enforce_admins: false`): **atendido no texto** (linha 207, risco decidido pelo dono), com a ressalva factual do A1 acima.

## Riscos residuais (informativos)
- Os agentes operam na conta do dono (fluxo-homologacao.md:40) até a conta de serviço do Git corporativo; até lá, o bypass é contido só pelo prompt de permissão do `gh pr merge` e pelas regras dos agentes.

## Lacunas de ferramenta
`actionlint` e `zizmor` não rodados: nenhum workflow mudou nesta rodada.

## Plano em cartões
Nenhum bloqueante. A1: devops-engineer (uma frase na §15), com o dono decidindo se tira o bypass ou mantém. A2: dono, na conferência da E4.4; devops-engineer se a prova falhar. A3: dono, opcional, na E4.4.
