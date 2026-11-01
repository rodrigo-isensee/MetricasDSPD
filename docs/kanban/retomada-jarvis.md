# Retomada do Jarvis: estado salvo para a mudança de sessão (2026-11-01, por volta das 16:00)

Este arquivo é para uma sessão nova do Jarvis que não tem a memória da anterior. Leia-o inteiro antes de agir. A fonte da verdade de cada pedido é o arquivo dele em `docs/pedidos/`; leia sempre o fim do `## Histórico`. O quadro fica em `KANBAN.md`, e o relógio dos movimentos em `docs/kanban/historico.md`.

- Repositório principal: `/home/rodrigoisensee/Metricas/MetricasDSPD`, branch `docs/jarvis-2026-10-23` (quadro, pedidos e briefs do Jarvis).
- Prazo: métricas operacionais funcionando na **segunda, 2026-11-02**. Recorte "A" do dono:
  - BusinessMap: FL1 com dado real; O19 a O26 seguem em mock até a F6b.
  - Acelerato: sustentação com dado real.

## 1. Agentes que estavam rodando na hora da parada (ver o que deixaram antes de relançar)
- **E2.107 (`forge:node-backend`, brief `docs/briefs/052-integracao-businessmap-node-backend-35.md`):** corrige o `test:pg`, que deixou a develop vermelha.
  - Worktree `/home/rodrigoisensee/MetricasDSPD-052e`, branch `feature/052-fix-test-pg`.
  - Na parada, a branch existia só localmente, ainda sem push.
  - Ao retomar: `git -C /home/rodrigoisensee/MetricasDSPD-052e status -sb` e `log origin/develop..HEAD`.
    - Se houver commit pronto e testes verdes, só falta o push com `git -C /home/rodrigoisensee/MetricasDSPD-052e push origin HEAD:refs/heads/feature/052-fix-test-pg`.
    - Se não houver commit, relançar com o mesmo brief: ele está protegido e foi aprovado pelo conferente.
- **Conferente do brief da E2.108** (`docs/briefs/052-integracao-businessmap-node-backend-36.md`, volta da limpeza do seed): o veredito não chegou a ser registrado.
  - Ao retomar: gerar a mensagem de novo com `forge-check brief mensagem --arquivo docs/briefs/052-integracao-businessmap-node-backend-36.md --pedido 052-integracao-businessmap --destino forge:node-backend --anterior docs/briefs/052-integracao-businessmap-node-backend-34.md --ref origin/feature/052-limpa-seed`.
  - Mandar ao `forge:conferente` a saída **a partir da linha `modo: brief`**. O hook do Agent recusa a mensagem se ela começar pelas linhas `jarvis-recorrente`.
  - Aprovado: registrar com `forge-check conferencia registrar` e delegar ao `forge:node-backend` com "Leia e execute literalmente o arquivo <brief>".
- **E2.100:** o agente morreu na troca de conta. O PR 188 já existe e saiu do draft (`isDraft=false` às 16:00). Não relançar; só acompanhar os checks.

## 2. Pedido 052 (`docs/pedidos/052-integracao-businessmap.md`): onde cada frente está
### F6: painel FL1 com origem real ou fictícia por métrica
- **PR 188 aberto** para a develop (squash). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/052-f6-painel`, ponta `2efa879`.
- Pareceres todos em dia: review, segurança, QA e UX. O review aceitou a exceção de tamanho (cerca de 1962 linhas).
- **Check vermelho `banco`.** A causa não é a F6: a develop quebrou com o PR 182 do Dependabot (`4a01e39`: @types/node, typescript-eslint e vite, mesclado pelo dono às 14:56). O `test:pg` falha ao iniciar (vitest "Startup Error", `TypeError: code.charCodeAt is not a function` no jiti), e a run da develop `41334017161` também falha.
- Para ler o log da CI: `XDG_CACHE_HOME=/tmp/claude-1000/ghcache gh run view <id> --log-failed`, com `allowed_domains` contendo `github.com`, `api.github.com`, `*.actions.githubusercontent.com` e `*.blob.core.windows.net`.
- Caminho:
  1. E2.107 corrige a develop.
  2. Etapas novas a abrir: review, segurança (dependência) e QA da correção, e o PR da `feature/052-fix-test-pg`, que o dono mescla.
  3. Os checks do PR 188 rodam de novo (sem push na F6: `gh run rerun <id>` ou atualizar a branch se a CI pedir).
  4. **O dono mescla o PR 188.** O sandbox barra o `gh pr merge` do agente.

### Limpeza do seed mock da base real (`db:limpar-seed`)
- Decisão do dono "A" de 2026-11-01 14:25, gravada no Histórico.
- Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/052-limpa-seed`, ponta `89073dd`. O código está em `26d097c`.
- Comando: `pnpm --filter @metricas-dspd/server run db:limpar-seed` simula; com `--aplicar`, escreve.
- Situação dos pareceres:
  - E2.101, segurança: aprovada (`a217f1e`). A1 e A2 recomendados.
  - E2.102, review: **reprovado** (`89073dd`).
    - A1 bloqueante: as linhas de `ref_versao_criterio` com motivo seed-mock, dos domínios businessmap e acelerato, também precisam sair, junto com `ref_versao_criterio_metrica`; o domínio pesquisa fica.
    - `fato_bloqueio` está coberto pela decisão do dono, e o PR tem de avisar que sai junto.
    - Teto excedido aceito (579 linhas); o PR leva a linha `teto: excedido, <n> linhas, ...`.
- Próximas etapas, já gravadas no pedido:
  1. E2.108, volta do node-backend: A1 do review, A3 do review (linhas 83 e 85 de `docs/architecture/server.md`), A2 da segurança (`lock_timeout`), com teste .pg.
  2. E2.109 (revalidação do review) e E2.110 (renovação da segurança), em paralelo.
  3. E2.103, QA (`docs/qa/052-limpa-seed.md`, suíte .pg com `PG_TESTE_URL`).
  4. E2.104, PR. **O dono mescla.**
- Ficam para depois de segunda: o A2 do review e o A1 da segurança.

### Do dono, depois dos dois merges (limpeza e F6)
1. No banco dele: `db:limpar-seed` sem opção, para ver só as contagens, e depois com `--aplicar`.
2. Depois que a F6 estiver mesclada, gerar de novo o mock no esquema próprio, com `DSPD_SCHEMA_PREFIXO_SEED`.
3. Com isso, o FL1 e a sustentação mostram só dado real. A sustentação já lê o esquema do Acelerato, recarregado em 2026-11-01: 5093 chamados.

### Outras etapas abertas do 052
- E2.81 (tech-lead): limpeza das branches já mescladas (worktrees 052b, 052c, 052d, 052f e 056). Não iniciada; depois de segunda.

## 3. Pedido 056 (`docs/pedidos/056-acelerato-mysql.md`)
- PR 187 mesclado (develop `81fcd63`). A releitura do dono passou (E4.47).
- Pendente só depois de segunda:
  - cartão com os recomendados A1 a A5 do review e A1 da segurança;
  - o teste do QA guardado em `/tmp/claude-1000/qa-056-e445/`.

## 4. Worktrees e branches
| Worktree | Branch | Estado |
|---|---|---|
| `Metricas/MetricasDSPD` | `docs/jarvis-2026-10-23` | quadro, pedidos e briefs do Jarvis |
| `MetricasDSPD-052e` | `feature/052-fix-test-pg` | E2.107 em curso (sem push na parada) |
| `MetricasDSPD-052g` | `feature/052-limpa-seed` | limpeza do seed; volta E2.108 pendente |
| `MetricasDSPD-052h` | `feature/052-f6-painel` | PR 188 |
| `MetricasDSPD-056d` | destacada em `81fcd63` | worktree de execução do dono (`.env` dele) |
| 052b, 052c, 052d, 052f, 056, 041, 041b | já mescladas ou antigas | entram na E2.81 |

## 5. Decisões e ações pendentes do dono
- Nenhuma decisão bloqueante agora.
- Ações do dono:
  - mesclar o PR da correção do `test:pg`, o PR 188 e o PR da limpeza;
  - rodar `db:limpar-seed` e gerar o mock de novo.
- O clone principal tem alterações sem commit que **não são do Jarvis**: `.env.example`, `.env.homolog.example`, `server/.env.example`, `web/.env.example` e a pasta `docs/security/aceites/`, que é do dono. Não tocar.
- Arquivos não rastreados como `.bashrc`, `.bash_profile` e `.claude/agents` são marcas de montagem do sandbox. Não commitar.
- No push, o GitHub avisou de 15 alertas do Dependabot na develop (1 crítico). Abrir cartão de triagem depois de segunda.

## 6. Como trabalhar (regras do Forge que valem aqui)
- **O Jarvis não implementa.** Delega a `forge:<agente>`: tech-lead (review, PR), node-backend, react-frontend, qa-engineer, security-engineer, ux-designer, software-architect, conferente, agile-coach.
- **Cada delegação:**
  1. Grave a etapa no pedido (`## Etapas`, `E2.n (papel): ...`). O texto da etapa não pode citar outro ID de etapa entre parênteses, ou o forge-check acusa.
  2. Gere o brief com `forge-check brief gerar --pedido <p> --destino forge:<a> --branch <b> --cobre E2.n`, preencha os `PREENCHER` e confira com `forge-check brief <arquivo> --pedido <p> --destino forge:<a>`.
  3. Mande ao conferente a saída de `forge-check brief mensagem` a partir de `modo: brief`, inteira.
  4. Registre o veredito com `forge-check conferencia registrar`. Reprovado exige `--classe`.
  5. Mova o cartão com `forge-check movimento K-182 --de ... --para ... --motivo ...`.
  6. Delegue com "Leia e execute literalmente o arquivo <brief>".
  - Na sessão antiga, os scripts que montavam os briefs ficavam no scratchpad e não servem mais.
- **Portões:** todo código passa por review, por segurança quando houver gatilho (banco, dependência, segredo, dado de pessoa) e por QA, antes do PR. Parecer commitado deixa outros pareceres desatualizados: rode `forge-check pr 052-integracao-businessmap --ref <ref> --base origin/develop` antes do PR.
- **Fluxo:**
  - `feature/*` → `develop` → `homolog` → `main`. A `main` é do dono.
  - O PR para a develop é squash. O tech-lead abre; se o sandbox barrar o merge, quem mescla é o dono.
  - Nunca `--force`, `--no-verify` nem `--admin`.
  - Depois do merge, apagar a branch, a remota e a worktree (R-FLUXO).
- **Segurança do projeto:**
  - agentes nunca leem o `.env`;
  - BusinessMap só GET, Acelerato só SELECT;
  - nenhum dado de pessoa em documento, nem endereço de servidor, nem organização cliente;
  - saídas brutas ficam fora do repositório;
  - nenhuma métrica individual;
  - a carga real roda na máquina do dono;
  - uma suíte de teste por vez.
- **Decisões do dono:** uma pergunta por vez, com opções e recomendação, gravada no pedido no mesmo turno.

## 7. Comandos úteis do ambiente
- **Sandbox:** comandos que começam com `pnpm`, `tsx`, `psql` e `docker` rodam fora dele. A rede pede `allowed_domains` (GitHub: `github.com` e `api.github.com`).
- **Hook do Bash:** barra cifrão, crase, chaves, interrogação e heredoc. Escreva arquivos com a ferramenta Write e mande um comando literal por linha.
- **Worktrees:** a branch não tem upstream. Crie com `git switch -c <b> --no-track origin/develop` e envie com `git push origin HEAD:refs/heads/<b>`.
- **Node e pnpm:** via nvm (`nvm use`, se o `.nvmrc` pedir). `pnpm install --frozen-lockfile` em prioridade baixa (`nice`).
- **Testes:** suíte .pg com `pnpm --filter @metricas-dspd/server run test:pg` e `PG_TESTE_URL` apontando para o banco de teste local (PostgreSQL em Docker local).
- **GitHub:**
  - `gh pr view 188 --json state,isDraft,mergeable,statusCheckRollup`
  - `gh run list --branch <b> --limit 3`
  - log de run com falha: ver a seção F6 acima.
- **forge-check:** fica em `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.8/bin/`. A versão do plugin está em `.forge/versao`.

## 8. Melhorias para o Forge (levar para a retrospectiva)
- `forge-check pr` conta parecer de `docs/ux` como mudança relevante e força renovações em cadeia.
- `forge-check brief mensagem` imprime linhas `jarvis-recorrente` antes de `modo: brief`, e o hook do Agent recusa a mensagem.
- `docs/security/_modelo.md` é citado, mas não existe.
- Em `gh run view --log-failed`, o cache precisa de `XDG_CACHE_HOME` gravável no sandbox.
- Itens anteriores: `--volta` × etapa nova; timeout do brief gerar; `gh pr checks --watch` estoura 600 s; hook recusa `git branch` e `git worktree list` ao conferente; `forge-check pr` não lê o clone de contribuição.
