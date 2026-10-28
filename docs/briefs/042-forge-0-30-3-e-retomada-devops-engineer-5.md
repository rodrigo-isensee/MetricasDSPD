Agente destino: forge:devops-engineer
Pedido: docs/pedidos/042-forge-0-30-3-e-retomada.md
Tipo: codigo
Branch: feature/042-protecao-develop   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Volta da etapa E4.1 do pedido 042 (cartão K-148), segunda. A proteção real da develop é o ruleset 25003880 "develop: PR, squash, checks" e não a proteção clássica que a seção 15 propõe; pela decisão B do dono, o documento passa a descrever esse ruleset com 9 checks. A conferência da entrega anterior (ea3358139feb4e16dbdf193a99a48bf85492c966) achou ainda a linha 149 (seção 12) com a proteção antiga. Worktree `/home/rodrigoisensee/MetricasDSPD-042p`, branch `feature/042-protecao-develop` (head ea3358139feb4e16dbdf193a99a48bf85492c966).


## Ler
- `/home/rodrigoisensee/MetricasDSPD-042p/docs/engineering/fluxo-homologacao.md`: seções 4, 5, 12, 14 e 15.
- `/home/rodrigoisensee/MetricasDSPD-042p/docs/devops/042-protecao-develop.md`.
- Leitura do ruleset, só GET: `gh api repos/rodrigo-isensee/MetricasDSPD/rulesets/25003880`. Estado lido pelo Jarvis às 14:43: regras deletion, non_fast_forward, pull_request (só squash, 0 aprovações), required_status_checks com `strict` ligado e `rapida`, `testes`, `build`, `e2e`; bypass do papel de administrador em modo pull_request.


## Entregar
- (E4.1) Seção 15 de `docs/engineering/fluxo-homologacao.md` reescrita para o ruleset 25003880: a proteção da develop é esse ruleset, com os 9 checks (`rapida`, `testes`, `build`, `e2e`, `filtro`, `banco`, `openapi`, `imagem`, `seguranca`), `strict` ligado como está, PR obrigatório e só squash; o dono acrescenta os 5 que faltam pelas Settings do ruleset (passo a passo curto); conferência pós-aplicação por GET no ruleset e pelo PR com merge bloqueado enquanto o `e2e` roda; rollback = tirar os 5 checks nas Settings. Sai o comando PUT na proteção clássica. Mantém o que a volta anterior já registrou (seguranca informativo, checks de push e PR de mesmo nome, `banco` skipped só no run de PR) e troca o risco de `enforce_admins` pelo do bypass de administrador do ruleset.
- (E4.1) Seções 4, 5, 12 (linha 149) e 14 alinhadas à seção 15: ao fim, o documento descreve uma única proteção da develop, o ruleset 25003880 com 9 checks.
- (E4.1) Parecer `docs/devops/042-protecao-develop.md` ajustado ao ruleset, com a decisão B.
- (E4.1) Commit com `Cartão: K-148`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`; sem push e sem PR.
- (E1, E2, E3, E4) Forge 0.30.3, ambiente, retomada da fila e aplicação da proteção: não nesta delegação.


## Fora do escopo
- "E1.1 (dono): no terminal, na raiz do projeto: `forge-upgrade` (cria a branch `forge/upgrade-0.30.3` com o commit da versão; nada vai ao GitHub)." · já entregue
- "E1.2 (forge:tech-lead): push da branch, PR para a develop, parecer de review, merge por squash depois do QA, limpeza da branch." · etapa de outro papel
- "E1.3 (forge:qa-engineer): parecer de QA (CI do PR verde e `pnpm run pronto`)." · etapa de outro papel
- "E2.1 (dono): Docker Engine no WSL (sudo; decisão A do 040), `cp .env.example .env`, Node 24 pelo nvm, `sudo` das dependências do Chromium (`pnpm exec playwright install-deps chromium`), `forge doutor` no terminal (proteção do git e branch homolog) e `/sandbox`." · etapa do dono
- "E2.2 (forge:tech-lead): `pnpm install --frozen-lockfile` e `pnpm exec playwright install chromium`." · já entregue
- "E2.3 (forge:devops-engineer): banco (db:up, db:migrate, db:seed) e consulta de prova." · já entregue
- "E3.1 (forge:software-architect): E2.3 do 041 (ADR 0003, regra do F4), sem depender do ambiente." · já entregue
- "E3.2 (forge:qa-engineer, forge:devops-engineer, forge:tech-lead): o resto do 041 na ordem do pedido 041, depois do E2." · etapa de outra delegação
- "E3.3 (forge:tech-lead): PR de docs do Jarvis, PRs do dependabot (#145, #146, #147) e K-125, depois do E2." · etapa de outro papel
- "E4.2 (forge:security-engineer): parecer de segurança da proposta de proteção da develop (branch `feature/042-protecao-develop`), na pasta de pareceres de segurança." · já entregue (3f2afd2)
- "E4.3 (forge:tech-lead): code review da branch `feature/042-protecao-develop`; push, PR para a develop e merge por squash depois dos pareceres." · etapa de outro papel
- "E4.4 (dono): acrescentar no ruleset 25003880 da develop, pelas Settings do GitHub, os checks `filtro`, `banco`, `openapi`, `imagem` e `seguranca` (decisão B; R-CONFORMIDADE: proteção de branch é do dono)." · etapa do dono
- Alterar a proteção no GitHub (R-CONFORMIDADE: é do dono); `ci.yml` e demais workflows; os pareceres de review e de segurança; amarrar os checks ao app do Actions (risco residual informativo da segurança); push; PR; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): "talvez precise atualizar algo no banco ja quetroquei de maquina" (coberto pelo E2.3: banco recriado do zero, migrações e seed).
- DECISÃO DO DONO (2026-10-27): "pode usar o poder computacional disponivl para paralelizar" (lido como: agentes em paralelo até o teto de R-TETO desta máquina; suítes de teste limitadas pela memória medida, 7 GB visíveis).
- DECISÃO DO DONO (2026-10-27): pedido de origem acima (atualizar para 0.30.3 por branch e PR para a develop; retomar a fila).
- DECISÃO DO DONO (2026-10-27): integrações, opção B ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais"): integrações reais só depois de todo o backlog.
- DECISÃO DO DONO (2026-10-27): proteção da develop, opção A ("A"): a develop passa a exigir os checks da CI verdes para aceitar merge; o devops-engineer configura no GitHub e registra no fluxo de homologação.
- DECISÃO DO DONO (2026-10-27): quem aplica a proteção da develop, opção A ("A"): o dono aplica os checks obrigatórios no GitHub (R-CONFORMIDADE); o devops-engineer só registra a regra e o comando no fluxo de homologação; substitui a parte "o devops-engineer configura no GitHub" da decisão anterior.
- DECISÃO DO DONO (2026-10-27): qual proteção da develop vale, opção B ("B"): vale só o ruleset 25003880 "develop: PR, squash, checks", com os 9 checks (`rapida`, `testes`, `build`, `e2e`, `filtro`, `banco`, `openapi`, `imagem`, `seguranca`); o dono acrescenta os 5 que faltam nas Settings do ruleset; o devops-engineer ajusta o documento para descrever esse ruleset; o comando PUT na proteção clássica não se roda.
- ADR 0003, ADR 0014 e ADR 0020 (citadas no pedido): nada nelas muda nesta entrega.
- A lista de nove checks e `perf` fora, aprovados pelo review e pela segurança, não mudam; `strict` fica ligado como está no ruleset (não afrouxa). R-CONFORMIDADE: nenhuma chamada que altere o GitHub; R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-042p log -1 --format=%H -- docs/engineering/fluxo-homologacao.md` · espera: o sha40 de um commit posterior a ea3358139feb4e16dbdf193a99a48bf85492c966, com `Cartão: K-148`
- PQ-2 (cmd): `grep -c 'branches/develop/protection' /home/rodrigoisensee/MetricasDSPD-042p/docs/engineering/fluxo-homologacao.md` · espera: igual '0'
- PQ-3 (cmd): `grep -c 'rulesets/25003880' /home/rodrigoisensee/MetricasDSPD-042p/docs/engineering/fluxo-homologacao.md` · espera: rc=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-042p status --porcelain` · espera: linhas=0


## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
