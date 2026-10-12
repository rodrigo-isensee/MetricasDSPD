# Fluxo de branches e gates: develop → homolog → main

Status: **aprovado pelo usuário em 2026-10-12** (decisões em [`docs/alinhamentos/2026-10-12-homologacao.md`](../alinhamentos/2026-10-12-homologacao.md), que prevalecem sobre as propostas e perguntas abaixo). Mínimo útil implementado (HM-01 a HM-03, etapas H1, H2, H3 parcial e H8 parcial): §13. `praticas.md` §9 e §10 apontam para este documento.
Autor: tech-lead. O ambiente de homologação (infra, dados, URL, deploy) é desenhado em [`docs/architecture/features/homologacao.md`](../architecture/features/homologacao.md) e não é repetido aqui; este documento trata só de branches, gates, versionamento e rollback.

## 1. Pedido e princípio

"Uma branch para homologação; sempre subimos para homolog, rodamos mais testes, e só depois vai para a main." Princípio: **a `main` só recebe o que já provou, em homolog, que funciona**. A main continua sendo do usuário.

## 2. Fluxo

```
feature/* fix/* docs/* chore/*
        │  PR (squash)         gate 1: CI do PR
        ▼
     develop                   integração contínua, pode estar "meio" quebrada só por pouco tempo
        │  PR (merge commit)   gate 2: suíte completa; deploy em homolog
        ▼
     homolog                   ambiente de homologação = esta branch
        │  PR (merge commit)   gate 3: soak + aprovação do usuário
        ▼
      main                     produção; cada promoção recebe tag vX.Y.Z
```

Regras:
- Branches de trabalho saem da `develop` (e não mais da `main`); hotfix é a exceção (§6).
- Toda promoção é **por pull request**, nunca push direto, nem entre `develop` e `homolog`.
- Só se promove adiante, de degrau em degrau: nada pula `homolog`.
- `homolog` só recebe de `develop` (e de `hotfix/*`, §6); `main` só recebe de `homolog` (e de `hotfix/*`).
- Nenhuma feature nova entra em `homolog` enquanto a candidata atual aguarda o gate 3, exceto correções dela (congelamento da candidata; §4).

## 3. Quem mescla

| Degrau | Quem mescla | Por quê |
|---|---|---|
| feature → develop | `tech-lead` (após review e QA do cartão); em dispensa de review, ninguém | é o fluxo de hoje, com agentes; a develop não é produção |
| develop → homolog | `tech-lead`, com o Jarvis abrindo o PR; o usuário é avisado | é rotina de time, sem decisão de produto; os gates automáticos decidem |
| homolog → main | **somente o usuário** | a main é do usuário (CLAUDE.md); é a validação de negócio |

Ressalva: `gh pr merge` hoje é "do usuário" para qualquer PR (jarvis.md). Para o tech-lead mesclar nos dois primeiros degraus, é preciso aprovação explícita e a redação do jarvis.md muda (ver §10). Na proteção de branch, o bypass fica restrito: nenhum agente pode mesclar na `main`. Identidade (I5, decisão do usuário): no GitHub corporativo os agentes usarão uma conta de serviço com escrita e sem permissão de mesclar na `main` (o ruleset exige a aprovação do usuário). Até a migração, os agentes seguem na conta do usuário, e a proteção é o prompt de permissão do `gh pr merge` mais as regras dos agentes, com o `homolog-aprovada` corrigido (I1 a I4).

## 4. Gates e checks por branch

Nomes dos jobs obrigatórios atuais **não mudam**: `rapida`, `testes`, `banco`, `build`, `e2e`. Só o *quando* rodam muda. Os demais ficam como estão (`filtro`, `openapi`, `imagem`, `perf`).

| Gate | Evento | Obrigatório para mesclar | Roda |
|---|---|---|---|
| 1. PR → `develop` | `pull_request` base `develop` | `rapida`, `testes`, `build`, `e2e` (os mesmos do PR hoje); `banco` quando o `filtro` detectar mudança | rápido: feedback em minutos |
| 2. PR → `homolog` | `pull_request` base `homolog` | **todos**: `rapida`, `testes`, `banco` (sem o filtro: sempre), `build`, `e2e`, `openapi`, `imagem`, `perf` (perf + Lighthouse; roda em PR para `homolog` e para `main`) | suíte completa; o `banco` com migrações do zero **e** sobre cópia do esquema de homolog (migração forward-only ensaiada) |
| 2b. após o merge em `homolog` | `push` em `homolog` | portão do `homolog.yml`: qualidade, banco, e2e, perf/Lighthouse, migração e smoke da pilha (E2E contra o ambiente implantado fica pendente, H4) | job `portao <sha>` (não obrigatório para PR; é o que alimenta o gate 3) |
| 3. PR → `main` | `pull_request` base `main` | `rapida`, `testes`, `banco`, `build`, `e2e`, `perf` (já é assim hoje) **+** o check `homolog-aprovada` (abaixo) | revalidação barata; a prova pesada já foi feita em homolog |

Critério de promoção `homolog` → `main` (check `homolog-aprovada` + decisão humana):
1. O commit candidato é exatamente o HEAD de `homolog` (sem commit novo desde o início do soak).
2. O portão (execução `push` do `homolog.yml`) verde nesse commit **e** a rodada noturna (execução `schedule` do `homolog.yml`, 02:30 BRT) verde nesse commit: **pelo menos uma noite completa em homolog sem falha**. Mudança só de docs também passa por homolog e roda só o `docs:check` (H-2); não há rótulo de dispensa.
3. Se a mudança toca coleta ou migração: pelo menos um ciclo de carga incremental completo em homolog, com a contagem de linhas conferida e histórico intacto (cards arquivados e excluídos presentes).
4. Parecer do QA da candidata em `docs/qa/` e notas de versão no PR.
5. **Aprovação do usuário**: ele revisa e mescla.

O check `homolog-aprovada` é um workflow que consulta, pela API de Actions, as **execuções concluídas com sucesso** do `homolog.yml` (job `portao <sha>`); falha se faltarem ou se HEAD diferir. Não usa status de commit (qualquer um publica um). A regra executada é a do código da **base** do PR (`main`), nunca a da branch candidata. Ele **não** substitui o julgamento do usuário; evita que se mescle sem a evidência. Limite conhecido: o GitHub não tem regra nativa de "origem só `homolog`", então a origem é conferida por este check (PR de fork é recusado); o YAML do check vem do merge ref, e por isso `.github/**` e `tools/homolog/**` pedem revisão atenta do usuário (CODEOWNERS quando houver).

## 5. Proteção de branch (GitHub; portável)

| Branch | Regras |
|---|---|
| `main` | já existe (PR + checks). Acrescentar: check `homolog-aprovada` (é ele que confere a origem `homolog` ou `hotfix/*`; o GitHub não tem regra nativa para isso); 1 aprovação do usuário (dono); sem force-push, sem deleção; sem bypass para agentes; histórico linear **não** exigido (usa merge commit). |
| `homolog` | PR obrigatório; checks do gate 2; sem force-push e sem deleção; branch deletada nunca. Mescla por tech-lead ou usuário. |
| `develop` | PR obrigatório; checks do gate 1; sem force-push e sem deleção. (Hoje sem checks: passa a ter. É a mudança mais barata e que mais evita develop quebrada.) |

Portabilidade (Git corporativo na terça):
- **GitLab**: branches protegidas + "Merge request approvals" + "Pipelines must succeed"; os jobs viram `.gitlab-ci.yml` com `rules: if $CI_MERGE_REQUEST_TARGET_BRANCH_NAME == "homolog"`; cron = pipeline schedule; `environments` + `deploy` para homolog; "Fast-forward merge" disponível (ver §7). Tags protegidas.
- **Azure DevOps**: *branch policies* (reviewers, build validation por branch, status checks) e *Pipelines* com `trigger`/`pr` filtrados por branch; cron = schedule; *Environments* com aprovação para a promoção a main; estratégia de merge "Semi-linear" ou "Merge (no fast-forward)".
- Para facilitar a troca: o gate vive em **scripts do repositório** (`pnpm run ...`), e o YAML só decide quando chamá-los; nenhuma lógica de gate dentro de actions específicas do GitHub, exceto o `homolog-aprovada`, que precisa ser reescrito na plataforma nova (consulta a status de pipeline).
- O hook `.githooks/pre-push` passa a recusar `homolog` também? **Não**: ele bloqueia só a `main`; homolog é bloqueada pela proteção de branch. (Se o usuário quiser homolog só por PR local também, é uma linha no hook.)

## 6. Hotfix

Defeito em produção, urgente demais para esperar o ciclo:
1. `hotfix/<slug>` sai da `main` (que é o que está em produção).
2. PR para `main`, com os checks do gate 3 e **aprovação do usuário**, sem soak. O `homolog-aprovada` só aprova `hotfix/*` que (a) seja do próprio repositório, (b) saia da ponta atual da `main` (`behind_by == 0`), (c) tenha de 1 a 10 commits novos (conteúdo maior vai por homolog) e (d) tenha o workflow `CI` completo verde para o SHA do PR (reexecute o check depois do CI). O check emite aviso `HOTFIX sem soak` e resumo no job.
3. Imediatamente depois, o tech-lead leva a correção às demais branches: PR `main` → `homolog` e depois `main` → `develop` (merge commit, mesma correção, sem cherry-pick, para o git reconhecer que já está lá).
4. Tag de patch (`vX.Y.Z+1`).

Correção **não urgente** não é hotfix: entra pelo fluxo normal, como qualquer `fix/`.
Defeito encontrado em homolog: corrige em `fix/` → `develop` → promove de novo; reinicia o soak. Nunca se corrige direto na `homolog`.

## 7. Manter as três branches sincronizadas

Problema: promoção por merge commit deixa a branch de destino com um commit de merge que a origem não tem. Isso é inofensivo (o conteúdo é o mesmo) e **não** se corrige com "merge reverso" a cada promoção.

Regras:
- Promoção = PR com **merge commit** (não squash, não rebase: squash/rebase reescrevem SHAs e fazem as branches divergirem de verdade).
- `develop → homolog` e `homolog → main` são sempre **para frente**; as branches só divergem pelos commits de merge de promoção, e o git resolve com o merge-base correto.
- Só há fluxo reverso em duas situações: hotfix (§6) e ressincronização pós-release, em que o tech-lead faz `main → homolog → develop` por PR com a mensagem `chore(release): sincroniza vX.Y.Z`. Fazer isso **uma vez por release**, nunca por PR de feature.
- Nunca commitar direto em `homolog` ou `main`; nunca `rebase` nem `force` nelas.
- Alternativa limpa quando houver Git corporativo com *fast-forward merge* (GitLab) ou *semi-linear* (Azure): promover `develop → homolog → main` por fast-forward torna as três branches idênticas no instante da promoção e elimina a ressincronização. No GitHub não existe merge fast-forward pelo botão, por isso a recomendação acima.
- Feature → develop em **squash**: um commit por cartão, mensagem em Conventional Commits, o que alimenta o CHANGELOG (§8). (Hoje o histórico mostra merge de PR; mudar para squash é decisão do usuário, ver perguntas.)

## 8. Versionamento, tags e notas de versão

- **SemVer** `vMAJOR.MINOR.PATCH` aplicado **na promoção para a main**: `feat` → MINOR, `fix`/`perf` → PATCH, `BREAKING CHANGE` (ou mudança de contrato da API, de critério de cálculo ou de esquema não retrocompatível) → MAJOR. Enquanto for `0.x`, MINOR absorve o que seria MAJOR.
- Pré-releases em homolog: tag `vX.Y.Z-rc.N` no HEAD de `homolog` a cada candidata; a tag final `vX.Y.Z` vai no commit de merge na `main`. Quem tagueia: o tech-lead cria a tag `-rc`; a tag final é criada pelo usuário ou automaticamente por workflow ao mesclar na `main` (workflow com permissão de tag, não de branch). Tags protegidas.
- **CHANGELOG.md** (raiz), gerado dos Conventional Commits desde a última tag (por exemplo `git-cliff` ou `conventional-changelog`, a decidir; dependência de dev, registrada no PR). Seções: Adicionado (feat), Corrigido (fix), Desempenho (perf), Mudanças que quebram, e **Mudanças de critério de cálculo** (conforme T2.6, com data). Um commit `chore(release): vX.Y.Z` atualiza o arquivo **na `homolog`** (antes do gate 3), de modo que as notas são revisadas pelo usuário no PR para a main.
- Notas de versão no PR para a main = trecho novo do CHANGELOG + parecer do QA + riscos + roteiro de rollback.
- Impacto em quem consome: a versão exposta pela API/UI/rodapé vem do `package.json` raiz (uma fonte).

## 9. Rollback

- **Código**: `git revert -m 1 <merge da promoção>` via PR (`revert` na `main`, depois levado a `homolog` e `develop` pelo mesmo caminho do hotfix). Nunca reset nem force. Como cada promoção é um merge commit único, reverter uma release inteira é um comando.
- **Deploy**: o artefato (imagem) é identificado pela tag; rollback de aplicação = reimplantar a imagem da tag anterior, sem esperar PR (operação do usuário; o procedimento fica no doc do arquiteto).
- **Banco**: migrações são forward-only com caminho de volta (praticas): reversão de esquema só com a migração `down` ensaiada no gate 2 (`banco` sobre cópia). Dado nunca é apagado para voltar atrás (histórico não é sobrescrito): se uma migração destrutiva for necessária, vira ADR e aprovação do usuário. Rollback de código **não** desfaz carga já feita; a carga incremental é idempotente e reprocessável.
- Janela: se a candidata falhar no gate 3 (usuário recusa), `homolog` não é revertida; corrige-se para frente com `fix/` e nova candidata.

## 10. Mudanças no CI (sem renomear os obrigatórios)

1. `on.pull_request` passa a listar `branches: [develop, homolog, main]`; `push` em `homolog` e `main` para o deploy/tag; `push` em outras branches continua (feedback do autor).
2. `banco`: o `filtro` continua para base `develop`; para base `homolog` ou `main` o job roda sempre (`if: needs.filtro.outputs.banco == 'true' || github.base_ref != 'develop'`). Mesmo nome, mesmo job.
3. `perf`: condição passa de `base_ref == 'main'` para `base_ref in (homolog, main)` (feito); a rodada noturna do `homolog.yml` roda contra a ponta de `homolog`.
4. `e2e` mantém o nome; o `e2e-homolog` do portão roda hoje contra o mock (E2E contra o ambiente implantado: pendente, H4).
5. Job novo `homolog-aprovada` (apenas para PR com base `main`).
6. Job novo `release` (push em `main`): cria a tag e a release com o trecho do CHANGELOG; permissões mínimas `contents: write` só nele.
7. `concurrency` já separa por PR/ref: sem mudança.

Duração: o gate 2 deve caber em ~30 min; se `perf` estourar, o `perf` completo fica só no cron e o gate 2 roda a versão curta (decisão com o QA).

## 11. Aprovações e perguntas

Mudanças que exigem **aprovação do usuário** antes de valer:
1. `CLAUDE.md`: seção "Fluxo de uma demanda" (passos 6 e 7: PR para `develop`, promoção por `homolog`, usuário mescla `homolog`→`main`) e a seção "A main é do usuário" (acrescentar `homolog` como branch protegida, de mesclagem do tech-lead ou do usuário).
2. `.claude/agents/jarvis.md` (Versionamento): hoje diz "a `develop` é a branch de PR para a `main`" e "`gh pr merge` é do usuário"; passa a: develop → homolog → main, tech-lead mescla até `homolog`.
3. `.claude/agents/tech-lead.md`: responsabilidade de mesclar PRs nos dois primeiros degraus, tags `-rc`, ressincronização.
4. `docs/engineering/praticas.md` §9 e §10 (hoje descrevem outra era: `feature/dashboard-mock`; já desatualizados) e a skill `engineering-practices`.
5. Proteção de branch no GitHub (e depois no Git corporativo): criar `homolog`, checks obrigatórios na `develop`, `homolog-aprovada` na `main`, tags protegidas.
6. Hook `.githooks/pre-push`: opcional (homolog).
7. Workflow `ci.yml` (jobs novos e condições), com o QA.

Perguntas que só o usuário responde:
1. **Quem mescla `develop → homolog`**: o tech-lead (proposta) ou você? Aceita que agentes mesclem por `gh pr merge` nesses dois degraus?
2. **Soak**: 1 noite/24 h é suficiente? Mais para mudanças de coleta ou de critério de cálculo? Dispensa para docs?
3. **Feature → develop em squash** (changelog limpo) ou manter merge de PR como hoje?
4. **Congelamento**: aceita não promover novas features à `homolog` enquanto a candidata aguarda a sua validação, ou prefere promover em fluxo contínuo e validar a ponta?
5. **Hotfix**: pode ir direto para a `main` com sua aprovação, sem soak, tendo homolog só depois?
6. **Quem cria a tag final**: você, manualmente, ou o workflow ao mesclar?
7. **Git corporativo na terça**: é GitHub Enterprise, GitLab ou Azure DevOps? Há runners, ambiente de homologação e aprovações nativas? Os checks e o cron (perf noturno) precisam ser recriados lá; sugiro migrar depois de aprovar este fluxo, não no meio.
8. Existem ambiente e dados de homologação já definidos (o arquiteto precisa disso), e a fonte do Acelerato em homolog é a mesma (somente leitura)?

## 12. Ordem sugerida de implantação

1. Usuário aprova (itens 1–5 acima). 2. Criar `homolog` a partir da `develop` e a proteção. 3. Checks obrigatórios na `develop` (`rapida`, `testes`, `build`, `e2e`). 4. Ajustes no `ci.yml` (§10) com QA. 5. Ambiente de homologação (arquiteto). 6. Primeira promoção de ensaio com tag `v0.x.0-rc.1`. 7. Migração para o Git corporativo, reaplicando §5.

## 13. O que está implementado e como usar

| Peça | Onde |
|---|---|
| Ambiente Docker Compose separado (projeto `metricasdspd-homolog`, portas 15432/13000/18080 só em `127.0.0.1`, volume próprio, limites de memória, sem webhook, sem senha padrão) | `docker-compose.homolog.yml`, `.env.homolog.example` |
| Comandos (lógica testada, cobertura 100%) | `pnpm run homolog:subir`, `homolog:derrubar [-- --volume]`, `homolog:smoke`, `homolog:migracao -- --origem <dir da main> --destino .`; código em `tools/homolog/` |
| Portão no push em `homolog` e rodada noturna na CI (02:30 BRT) | `.github/workflows/homolog.yml` (o job `portao <sha>` das execuções `push` e `schedule` é a evidência) |
| Check `homolog-aprovada` (PR para a `main`) | `.github/workflows/homolog-aprovada.yml` |

Uso local (sob demanda, nunca em rotina; respeite o teto de recursos): `cp .env.homolog.example .env.homolog`, preencha as senhas (12+ caracteres, nada de `*_dev`), `chmod 600 .env.homolog`, `pnpm run homolog:subir` (build, migração, seed mock e smoke), abrir `http://127.0.0.1:18080`, `pnpm run homolog:derrubar` ao terminar (o volume é preservado; `-- --volume` apaga os dados). Só mock até as integrações (H-7).

Observações do desenho:
- O `schedule` do GitHub só dispara com o workflow na branch padrão (`main`): a rodada noturna começa a valer depois da primeira release com este arquivo. Até lá, `workflow_dispatch` em `homolog` faz o papel da noturna (ver abaixo).
- O check `homolog-aprovada` não é reexecutado sozinho quando a noturna termina: use "Re-run jobs" no PR depois dela.
- Documentação pura (só `docs/` e `.md` da raiz) roda só `docs:check` no portão (H-2); a noturna classifica pelo diff contra a `main`.
- `hotfix/*` segue as regras do §6 em `homolog-aprovada` (sem soak, com aviso); vale a aprovação do usuário no PR.
- O portão de um push só de docs compara com o push anterior (`github.event.before`); a noturna compara com a `main` e fecha a lacuna, e `homolog-aprovada` exige as duas.
- `homolog-aprovada` vale para o instante em que rodou: no PR de release, use **Re-run jobs imediatamente antes do merge** (uma noturna que falhe depois no mesmo SHA só aparece assim).
- Primeira release: o `schedule` só existe com o arquivo na `main`. Enquanto `homolog.yml` não estiver na `main`, uma execução manual (`workflow_dispatch`, ref `homolog`) do `homolog.yml` vale como a noturna; a regra se desliga sozinha quando o arquivo chegar à `main`. Também nessa release a regra do check ainda não está na base: o job passa com aviso e a conferência é manual do usuário.
- Status de commit `homolog-portao`/`homolog-noturna` não existem mais (eram falsificáveis).
- Pendente (fora do mínimo útil; é cartão visível: M7 E2E contra a pilha implantada, M8 conferir origem `develop` no PR para `homolog`, M5 endurecimento do Compose): etapas H3 completa (contrato e paridade por HTTP), H4 contra o ambiente, H5 contra o Postgres de homologação, H6, H7, tags `-rc`, CHANGELOG e workflow de release.

## 14. Roteiro: proteção de branches no GitHub (feito pelo administrador)

Pré-requisitos: ter este PR mesclado em `develop` e criar a branch `homolog` a partir da `develop` (`Branches` > `New branch`). Depois, em **Settings > Branches > Add branch ruleset** (ou "Branch protection rule", se o repositório não tiver rulesets). Os nomes dos checks aparecem na busca depois da primeira execução do workflow.

1. **`develop`** (alvo: `develop`)
   - Require a pull request before merging; 0 aprovações exigidas (mescla o tech-lead).
   - Require status checks to pass: `rapida`, `testes`, `build`, `e2e` (e `banco`, que fica "pulado = aprovado" quando o filtro não detecta mudança). Marque "Require branches to be up to date".
   - Block force pushes; restrict deletions.
   - Allowed merge methods: **Squash**.
2. **`homolog`** (alvo: `homolog`)
   - Require a pull request before merging; apenas de `develop` (ruleset: restrinja a origem se a versão do GitHub permitir; senão, conferência do tech-lead).
   - Require status checks: `rapida`, `testes`, `banco`, `build`, `e2e`, `openapi`, `imagem`, `perf` (no PR de promoção o `banco` roda sempre; `perf` inclui o Lighthouse).
   - Block force pushes; restrict deletions.
   - Allowed merge methods: **Merge commit**.
   - O portão `portao` roda **depois** do merge (push): não o exija no PR; ele alimenta `homolog-aprovada`.
3. **`main`** (já protegida; acrescentar)
   - **Primeira release, sem `homolog-aprovada` obrigatório:** o usuário mescla com a justificativa no PR (o `schedule` ainda não existe na `main`). **Depois dela**, acrescentar `homolog-aprovada` aos checks obrigatórios (mantendo `rapida`, `testes`, `banco`, `build`, `e2e`).
   - Require 1 approval (o usuário); sem bypass para agentes; block force pushes; restrict deletions.
   - Allowed merge methods: **Merge commit**.
4. **Permissões:** o tech-lead precisa de permissão de escrita para mesclar em `develop` e `homolog`; ninguém além do usuário mescla na `main` (Restrict who can merge, se disponível). Em **Settings > Actions > General**, confirme "Workflow permissions: Read repository contents" (os workflows só pedem leitura; `homolog-aprovada` usa `actions: read`).
5. **Conferência:** abra um PR de teste `develop` → `homolog` e veja os checks; depois de mesclado, confira em **Actions** a execução do workflow "Homologação" para o commit da `homolog` (job `portao <sha>` verde).
