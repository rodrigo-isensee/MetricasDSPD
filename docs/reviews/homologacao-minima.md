# Code review: homologação mínima (develop → homolog → main) — rodada 1

- Branch: `chore/homologacao-minima` sobre `origin/develop` · Autor: `tech-lead` · Revisor: `software-architect` (com a skill `cyber-security`) · Data: 2026-10-12
- Escopo: `tools/homolog/`, `docker-compose.homolog.yml`, `.env.homolog.example`, `.gitignore`, `.github/workflows/{ci,homolog,homolog-aprovada}.yml`, `.github/actions/{preparar,playwright}`, `package.json`, `CLAUDE.md`, `.claude/agents/{jarvis,tech-lead}.md`, `docs/engineering/{praticas,fluxo-homologacao}.md`.
- Referências: decisões do usuário em `docs/alinhamentos/2026-10-12-homologacao.md` (prevalecem), `docs/architecture/features/homologacao.md`, ADR 0018.

## Parecer: AJUSTES NECESSÁRIOS (sem bloqueante)

O desenho segue a decisão do usuário: o fluxo `develop` → `homolog` → `main` está coerente entre CLAUDE.md, jarvis.md, tech-lead.md, praticas.md e fluxo-homologacao.md, e nenhum gate obrigatório foi enfraquecido. As permissões estão no mínimo, as ações estão fixadas por SHA, não há `pull_request_target` e o Compose de homologação fica só no loopback, com senhas obrigatórias e limites de memória.

O ponto fraco é o check `homolog-aprovada`. Hoje ele é uma conferência de boa-fé, não um portão. Há quatro caminhos para burlá-lo: o atalho `hotfix/*` (I1), status que se falsificam com um `gh api` sem confirmação (I2), a regra lida da própria branch candidata (I3) e uma identidade só para o usuário e os agentes (I5). Na prática, quem garante que "só o usuário mescla na `main`" é o prompt de permissão do `gh pr merge` e a atenção do usuário. Há ainda um impasse na primeira release (I4). Corrigir I1 a I4 antes de ligar `homolog-aprovada` como obrigatório na `main`. I5 é decisão do usuário. I6 e I7 são de coerência e entram nesta branch ou viram cartão. As menores viram cartão.

## O que foi verificado

| Verificação | Resultado |
|---|---|
| `flock /tmp/metricas-pesado.lock pnpm run pronto` e `pnpm run docs:check` | **não executados nesta revisão**: a sessão do revisor não tinha shell. O `tools/homolog/coverage/coverage-summary.json` existente mostra 100% (102/102 linhas, 69/69 ramos). **O Jarvis ou o tech-lead precisa rodar os dois antes do envio.** |
| Fluxo e "só o usuário mescla na main" | coerente em `CLAUDE.md:55-62`, `jarvis.md:68-70`, `tech-lead.md:18-24`, `praticas.md:112-131`, `fluxo-homologacao.md` §2-§3. Sem contradição com o CLAUDE.md. |
| Jobs obrigatórios | `rapida`, `testes`, `banco`, `build` e `e2e` mantêm os nomes e os passos. A única mudança no `ci.yml` é `banco` (`ci.yml:108`), que passa a rodar **sempre** em PR para `homolog`/`main`, ou seja, fica mais rígido. Há teste de regressão em `artefatos.test.ts:122-127`. |
| Permissões | `homolog.yml:18-19` `contents: read`; só o job `portao` (`homolog.yml:239-241`) pede `statuses: write`; `homolog-aprovada.yml:10-12` só leitura. Travado em `artefatos.test.ts:102-105,120`. |
| `pull_request_target` e injeção | nenhum `pull_request_target`. `head.ref` e `head.sha` chegam ao `run:` por `env` (`homolog-aprovada.yml:24-28`), sem interpolação. A action `playwright` passou o `cache-hit` para `env` (`action.yml:18-21`), o que é uma melhoria. |
| Ações por SHA | checkout, setup-node, upload-artifact, cache e pnpm/action-setup fixadas por SHA, também nas actions compostas. |
| Segredos | nenhum segredo do repositório é usado. Na CI, `.env.homolog` é gerado por execução com `openssl rand` e `chmod 600` (`homolog.yml:219-226`). `.env.homolog` está ignorado no `.gitignore:6-8` e no `.dockerignore:6-8`. `validarEnv` nunca devolve o valor (`ambiente.ts:34-48`, testado). |
| Compose | portas só em `127.0.0.1` (`docker-compose.homolog.yml:20,49,74`), senhas `:?` obrigatórias, `mem_limit` em todos os serviços, `restart: "no"`, projeto e volume próprios, webhook sem URL nem segredo. Tudo travado em `artefatos.test.ts:23-57`. |
| Dado real | nenhum: o seed é mock, e o `.env.homolog.example` vem sem valores. |
| Testes falham se a regra quebrar | sim para aprovação, escopo, ambiente, comandos e compose. Lacunas em M2. |

## Importantes

**I1. `hotfix/*` aprova qualquer conteúdo, sem aviso visível.** `tools/homolog/src/aprovacao.ts:24-25`; `homolog-aprovada.yml:27`.
Caminho realista: um agente (ou qualquer conta com escrita, ou uma branch de fork chamada `hotfix/x`) abre um PR para a `main` a partir de `hotfix/qualquer-coisa` com o conteúdo da `develop`. O check fica verde e só imprime a mensagem com `console.log` (`main.ts:100`), sem anotação. A regra "a `main` só recebe de `homolog`" passa a depender só de o usuário perceber o nome da branch. O GitHub não tem regra nativa de "origem só `homolog`", então este check é a única barreira (o `fluxo-homologacao.md` §5 linha 66 dá a entender o contrário; ver I7).
Correção mínima:
- passar `github.event.pull_request.head.repo.full_name` e exigir que seja o próprio repositório;
- para `hotfix/*`, exigir que a ponta da `main` seja ancestral do candidato e que o candidato tenha poucos commits à frente (`GET compare/main...<sha>`: `behind_by == 0`), o que impede um "hotfix" com a `develop` inteira;
- emitir `::warning::HOTFIX sem soak` e uma linha no `$GITHUB_STEP_SUMMARY`;
- acrescentar casos de teste. Esforço P. Dono: `tech-lead`.

**I2. `homolog-portao` e `homolog-noturna` são status falsificáveis.** `aprovacao.ts:44`, `main.ts:59-63`, `.claude/settings.json:23`.
O check confia em qualquer status de commit com aquele contexto e não confere quem o criou. Há dois caminhos:
- (a) qualquer agente roda `gh api repos/<repo>/statuses/<sha> -f state=success -f context=homolog-noturna`. É um POST, que não casa com o `ask` de `gh api * -X PUT*` e, portanto, roda sem confirmação. Basta um agente tentar "destravar" o PR para pular a noite de soak que o usuário exigiu;
- (b) um workflow em qualquer branch, com `statuses: write`, publica o status em nome de `github-actions[bot]`.
Correção mínima: trocar a leitura de status por evidência de execução. Consultar `GET actions/workflows/homolog.yml/runs?head_sha=<sha>&branch=homolog&event=schedule&status=success` (e `event=push` para o portão) e conferir `path == .github/workflows/homolog.yml`. Execuções de `schedule` usam o arquivo da `main`, e as de `push` usam o arquivo da própria `homolog`; os dois só mudam por PR revisado. Paliativo mínimo: exigir `creator.login == 'github-actions[bot]'`. Mover a interpretação da resposta da API de `main.ts`, que está fora da cobertura (`vitest.config.ts:14`), para um módulo testado. Recomendação ao usuário (configuração é dele): acrescentar `Bash(gh api *statuses*)` ao `deny` de `.claude/settings.json`. Esforço P. Dono: `tech-lead`.

**I3. A regra do check vem da própria candidata.** `homolog-aprovada.yml:20` faz checkout do merge ref do PR e executa `tools/homolog/src/aprovacao.ts` dessa árvore.
Caminho: um PR de `feature/x` para a `main` que altera `aprovacao.ts` para `return { aprovada: true }` (por engano ou para "fazer passar") deixa o check verde.
Correção: `actions/checkout` com `ref: ${{ github.event.pull_request.base.sha }}`. É seguro em `pull_request`, e a regra passa a ser a da `main` já revisada. O resíduo é inerente ao GitHub: o próprio YAML vem do merge ref, e qualquer job chamado `homolog-aprovada` satisfaz o check obrigatório. Ele se mitiga com revisão do usuário em `.github/**` e `tools/homolog/**` (CODEOWNERS com o usuário). Registrar como risco aceito em `docs/security/`. Atenção: com o checkout da base, o primeiro PR que leva `tools/homolog` à `main` falha por ausência do arquivo (ver I4). Esforço P. Dono: `tech-lead`.

**I4. Impasse na primeira release.** `homolog.yml:6,12`, `fluxo-homologacao.md:163` e `:185`.
O `schedule` só dispara com o arquivo na branch padrão, e o `workflow_dispatch` não publica `homolog-noturna`. Logo, enquanto `homolog.yml` não estiver na `main`, nenhum SHA de `homolog` recebe `homolog-noturna`. Se o administrador seguir o §14 item 3 e tornar `homolog-aprovada` obrigatório antes disso, a primeira release `homolog` → `main` fica bloqueada para sempre, e só sai com bypass de administrador.
Correção: no §14, ordenar explicitamente. Primeira release sem `homolog-aprovada` obrigatório (o usuário mescla com a justificativa no PR); depois dela, acrescentar o check. Alternativa de mesmo nível de confiança: permitir que `workflow_dispatch` com `ref: homolog` publique `homolog-noturna`. Decisão do usuário, porque troca a "noite" por uma execução manual. Esforço P. Dono: `tech-lead`.

**I5. "1 aprovação do usuário" e "sem bypass para agentes" pressupõem identidades separadas.** `fluxo-homologacao.md:66,186-188`.
Os agentes abrem PR com `gh pr create` e fazem push com a credencial da máquina do usuário. Se for a conta dele (a confirmar), o autor do PR é o próprio usuário. O GitHub não aceita autoaprovação, então a `main` fica impossível de mesclar sem bypass, e o bypass vale para qualquer processo com o mesmo token. As garantias reais de hoje são o `pre-push` e o `ask` do `gh pr merge` (`.claude/settings.json:23`).
Pergunta ao usuário:
- (a) conta de serviço para os agentes, com escrita, sem bypass e sem permissão de mesclar na `main`; ou
- (b) não exigir aprovação no ruleset e registrar em `docs/security/` que o controle é o prompt de permissão mais `homolog-aprovada` (risco aceito).
Esforço P (documentação) ou M (conta). Dono: `jarvis` leva ao usuário; o `software-architect` registra.

**I6. O gate 2 diverge da decisão.** Decisão (alinhamento, linha 5): o "PR para homolog" roda a suíte completa (banco, openapi, imagem, perf, Lighthouse).
No código, `perf` só roda em PR com base `main` (`ci.yml:233-236`). O `fluxo-homologacao.md` §4 (linha 49) e o §10.3 (linha 118) dizem que ele roda em PR para `homolog`, mas a implementação o levou para o portão **depois** do merge (`homolog.yml:149-171`). Além disso, o ruleset da `homolog` no §14 (linha 180) não exige `openapi`, `imagem` nem `perf`.
Correção: escolher um dos dois caminhos.
- Opção 1: acrescentar `github.base_ref == 'homolog'` ao `perf` e listar `openapi`, `imagem` e `perf` no §14 item 2.
- Opção 2: registrar no alinhamento que perf/Lighthouse rodam no portão pós-merge, o que é uma mudança de decisão e pede o "de acordo" do usuário.

Esforço P. Dono: `tech-lead`.

**I7. A documentação não reflete o que foi implementado.**
- `fluxo-homologacao.md:50-60`: ainda cita o job `homolog-e2e`, o rótulo `sem-soak` e o "cron já existente, perf das 02:00", enquanto o código usa `homolog-portao`/`homolog-noturna` às 02:30 e não tem rótulo.
- `fluxo-homologacao.md:80`: o hotfix exige `homolog-e2e` num deploy temporário ou justificativa no PR, mas o código aprova automaticamente.
- `fluxo-homologacao.md:66`: trata "origem só `homolog` ou `hotfix/*`" como regra de proteção, mas isso não existe no GitHub; quem faz é o check.
- `docs/architecture/features/homologacao.md` (do arquiteto) está desatualizado frente ao fluxo aprovado: estado "discovery" (l.3), branches saindo da `main` (S3, l.22, l.31, l.50), fast-forward `main` → `homolog` (l.39, l.54), agendador do Windows (l.96, contra a decisão H-5), `perf` saindo do PR para a `main` (l.133). A ADR 0018 continua "proposta".

Correção: alinhar os textos do `tech-lead` nesta branch. O plano e a ADR ficam com o `software-architect`, em cartão próprio. Esforço P.

## Menores

- **M1.** Escopo do push calculado contra `github.event.before` (`homolog.yml:46-47`). Um push só de docs depois de um push de código vermelho recebe `homolog-portao` verde num SHA cujo código nunca passou. A noturna (base `origin/main`) cobre o caso, porque `homolog-aprovada` exige as duas. Basta documentar, ou usar como base o último SHA com portão verde.
- **M2.** Os testes não travam:
  - que `portao` dependa dos cinco jobs de código e os avalie (`homolog.yml:235,250,261`): tirar `perf` de `needs` e de `RESULTADOS_CODIGO` passa nos testes;
  - que todo `uses:` de terceiros esteja fixado por SHA;
  - que `head.ref` só chegue ao `run:` por `env`.

  Acrescentar as asserções em `artefatos.test.ts:89-121`.
- **M3.** `validarEnv` não restringe caracteres (`ambiente.ts:35-47`). O Compose interpola `$` no `--env-file`, e as URLs (`docker-compose.homolog.yml:37,47,65`; `comandos.ts:38`) não codificam a senha. Com `@ : / # $` a pilha não sobe e o erro é confuso. Restringir a `[A-Za-z0-9_-]` e sugerir `openssl rand -hex 16` no `.env.homolog.example`.
- **M4.** O `typecheck` da raiz (`package.json:13`) não inclui `@metricas-dspd/homolog`, então o job `rapida` não o checa (o `testes` checa, via `-r`). O resumo de cobertura (`ci.yml:61`) lista só `server web`.
- **M5.** Endurecimento do Compose, alinhado ao de dev:
  - `postgres:17` por tag e não por digest (`docker-compose.homolog.yml:8`);
  - sem `security_opt: [no-new-privileges:true]`;
  - sem `read_only` no `web`.

  Vai para o cartão da S-27.
- **M6.** `homolog-aprovada` vale para o instante em que rodou. Uma noturna que falhe depois no mesmo SHA não o deixa vermelho. Instruir "Re-run imediatamente antes do merge" no modelo de PR de release (`fluxo-homologacao.md:164`).
- **M7.** O `e2e-homolog` (`homolog.yml:123-139`) roda o Playwright contra o servidor de mock, não contra a pilha implantada. A decisão fala em "deploy no ambiente + homolog-e2e". Está declarado como pendente (H4, `fluxo-homologacao.md:167`); manter como cartão visível.
- **M8.** A origem `develop` dos PRs para `homolog` não é conferida automaticamente (`fluxo-homologacao.md:179`). Uma variante barata de `decidirAprovacao` para a base `homolog` (origem `develop`, `hotfix/*` ou `main` na ressincronização) fecha o "nada pula degrau".
- **M9.** `jarvis.md:32` ("O usuário valida e faz o merge") ficou ambíguo agora que o tech-lead mescla em `develop`/`homolog`. Trocar por "na `main`".
- **M10.** Informativo: `homolog.yml:271` interpola `${{ github.repository }}` no `run:`. Não há caminho de ataque (o nome do repositório não é controlado por terceiros), mas `$GITHUB_REPOSITORY` mantém o padrão de só usar `env`.

## Cartões sugeridos

| Item | Dono | Esforço | Quando |
|---|---|---|---|
| I1, I2, I3, M2 (check robusto e testes) | `tech-lead` | P | antes de tornar `homolog-aprovada` obrigatório |
| I4, I6, I7 (textos do fluxo e §14) | `tech-lead` | P | nesta branch |
| I5 (identidade e aprovação) | `jarvis` → usuário; registro pelo `software-architect` em `docs/security/` | P/M | antes de configurar o ruleset da `main` |
| Plano `features/homologacao.md` e ADR 0018 | `software-architect` | P | cartão próprio |
| M3, M4, M5, M6, M7, M8, M9 | `tech-lead` / `node-backend` / `qa-engineer` | P | backlog |

## Rodada 2 — correções (tech-lead, 2026-10-12)

Todas as correções estão na branch `chore/homologacao-minima`; cada item consta no commit indicado.

| Commit | Achados |
|---|---|
| `cf36946` | I1, I2, I3, I4, I6, M2, M10 |
| `382d23e` | M3, M4 |
| `c22609a` | I7, M1, M6 (e I5, decisão do usuário) |
| `40e09de` | M9 |

| Achado | Resolução |
|---|---|
| I1 hotfix | `decidirHotfix` (`tools/homolog/src/aprovacao.ts`): PR do próprio repositório (fork recusado), `behind_by == 0` contra a `main`, de 1 a 10 commits novos e workflow `CI` do PR verde para o SHA (API de Actions). Emite `::warning::HOTFIX sem soak` e resumo do job. Documentado em `fluxo-homologacao.md` §6. |
| I2 evidência | Status de commit removido. `homolog-aprovada` lê execuções de `homolog.yml` (`status=success`, `head_sha`, `event` push/schedule) e exige o job `portao <sha>` em sucesso; o job agora leva o SHA no nome (um `schedule` tem `head_sha` da `main`, por isso o SHA vai no nome do job). Interpretação da API em `tools/homolog/src/github.ts`, testada. `homolog.yml` ficou sem permissões de escrita. Sugestão ao usuário permanece: `Bash(gh api *statuses*)` no `deny` (configuração dele). |
| I3 regra da base | `actions/checkout` com `ref: base.sha` e `persist-credentials: false`; se a base ainda não tem o script (primeira release), o job passa com aviso e a conferência é do usuário. Teste trava o `ref`. Risco residual aceito: o YAML vem do merge ref (CODEOWNERS e revisão do usuário em `.github/**` e `tools/homolog/**`). |
| I4 primeira release | `workflow_dispatch` em `homolog` vale como a noturna enquanto `homolog.yml` não está na `main` (`portaoNaMain`); desliga sozinho depois. §14 manda a primeira release sem `homolog-aprovada` obrigatório. |
| I5 identidade | Decisão do usuário registrada no §3 do fluxo (conta de serviço no GitHub corporativo; até lá, prompt do `gh pr merge` e a regra dos agentes). Registro em `docs/security/` fica para o `software-architect`. |
| I6 perf | Opção 1: `perf` (com Lighthouse) roda em PR para `homolog` e `main`; §14 lista `openapi`, `imagem` e `perf` para a `homolog`. Teste trava a condição. |
| I7 textos | `fluxo-homologacao.md` (job, rótulo, cron, hotfix, regra de origem), `features/homologacao.md` (estado vigente e nota das decisões que superam trechos) e ADR 0018 (vigente). A reescrita completa do plano do arquiteto segue em cartão próprio. |
| M1 | Documentado (§13). |
| M2 | Testes: `portao` depende dos cinco jobs e os avalia; actions de terceiros por SHA; sem `pull_request_target` nem `${{` em `run:` do check. |
| M3 | `validarEnv` restringe a `[A-Za-z0-9_-]` com a sugestão `openssl rand -hex 16` (o `.env.homolog.example` não foi alterado). |
| M4 | `typecheck` da raiz inclui `@metricas-dspd/homolog`; resumo de cobertura do CI lista `tools/homolog`. |
| M6 | Documentado (§13, "Re-run jobs antes do merge"). |
| M9 | `jarvis.md`: "faz o merge na `main`". |
| M10 | Resolvido (o passo que interpolava `github.repository` foi removido com os status). |

Viram cartão (backlog): **M5** endurecimento do Compose (digest, `no-new-privileges`, `read_only`; cartão da S-27); **M7** E2E contra a pilha implantada (H4); **M8** conferir a origem `develop` nos PR para `homolog`; registro do risco aceito em `docs/security/` (I3 e I5); `Bash(gh api *statuses*)` no `deny` (usuário).

O que só a CI valida: a leitura real da API de Actions (nome do job com SHA, `path` das execuções, filtros), o `exclude_pull_requests`, o `actions: read` do token e o comportamento de `homolog-aprovada` num PR de verdade. Os testes cobrem a lógica com respostas simuladas (cobertura 100% em `tools/homolog`).
