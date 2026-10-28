Agente destino: forge:security-engineer
Pedido: docs/pedidos/042-forge-0-30-3-e-retomada.md
Tipo: codigo
Branch: feature/042-protecao-develop   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E4.2 do pedido 042 (cartão K-148), segunda rodada: a proposta que você aprovou (PUT na proteção clássica, 9 checks, `strict` desligado) mudou. Pela decisão B do dono, a proteção da develop é o ruleset 25003880 "develop: PR, squash, checks", que já existia com 4 checks (`rapida`, `testes`, `build`, `e2e`) e `strict` ligado; o dono acrescenta os 5 que faltam nas Settings (E4.4), para chegar aos 9; o documento foi reescrito nos commits ea3358139feb4e16dbdf193a99a48bf85492c966 e 3efb7b43cac8c6787ce5ac7fa1ab1b04043e446b. Worktree `/home/rodrigoisensee/MetricasDSPD-042p`, branch `feature/042-protecao-develop`.

## Ler
- Seu parecer `/home/rodrigoisensee/MetricasDSPD-042p/docs/security/042-protecao-develop.md`, bloco `## Achados`.
- `git -C /home/rodrigoisensee/MetricasDSPD-042p diff 3f2afd2b638d65ac1bf5715bb2b327559e5f6009 3efb7b43cac8c6787ce5ac7fa1ab1b04043e446b -- docs/engineering/fluxo-homologacao.md` (só a seção 15 e as linhas alinhadas a ela).
- Leitura do ruleset, só GET: `gh api repos/rodrigo-isensee/MetricasDSPD/rulesets/25003880` (regras, checks, bypass).

## Entregar
- (E4.2) Parecer de segurança da mudança em `docs/security/042-protecao-develop-r2.md`, por delta sobre o seu r1: o ruleset com os 9 checks fecha a brecha do merge com CI vermelha ou em curso; o bypass do papel de administrador em modo pull_request (no lugar do `enforce_admins`) e o rollback pelas Settings; seus A1 e A2 continuam atendidos. Achados no bloco `## Achados`, cada um com até 300 caracteres, os bloqueantes marcados.
- (E4.2) Commit só do parecer, com `Cartão: K-148`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`; sem push e sem PR.
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
- "E4.1 (forge:devops-engineer): configurar na develop os checks obrigatórios da CI (gh api), provar pela leitura da proteção e registrar em `docs/engineering/fluxo-homologacao.md` e no parecer de devops." · já entregue (90e8dcc, ea33581 e 3efb7b4; a aplicação passou ao dono na E4.4)
- "E4.3 (forge:tech-lead): code review da branch `feature/042-protecao-develop`; push, PR para a develop e merge por squash depois dos pareceres." · etapa de outro papel, depois desta
- "E4.4 (dono): acrescentar no ruleset 25003880 da develop, pelas Settings do GitHub, os checks `filtro`, `banco`, `openapi`, `imagem` e `seguranca` (decisão B; R-CONFORMIDADE: proteção de branch é do dono)." · etapa do dono
- Alterar a proteção no GitHub, `fluxo-homologacao.md`, o parecer de devops, o seu r1 e os workflows; push; PR; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): "talvez precise atualizar algo no banco ja quetroquei de maquina" (coberto pelo E2.3: banco recriado do zero, migrações e seed).
- DECISÃO DO DONO (2026-10-27): "pode usar o poder computacional disponivl para paralelizar" (lido como: agentes em paralelo até o teto de R-TETO desta máquina; suítes de teste limitadas pela memória medida, 7 GB visíveis).
- DECISÃO DO DONO (2026-10-27): pedido de origem acima (atualizar para 0.30.3 por branch e PR para a develop; retomar a fila).
- DECISÃO DO DONO (2026-10-27): integrações, opção B ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais"): integrações reais só depois de todo o backlog.
- DECISÃO DO DONO (2026-10-27): proteção da develop, opção A ("A"): a develop passa a exigir os checks da CI verdes para aceitar merge; o devops-engineer configura no GitHub e registra no fluxo de homologação.
- DECISÃO DO DONO (2026-10-27): quem aplica a proteção da develop, opção A ("A"): o dono aplica os checks obrigatórios no GitHub (R-CONFORMIDADE); o devops-engineer só registra a regra e o comando no fluxo de homologação; substitui a parte "o devops-engineer configura no GitHub" da decisão anterior.
- DECISÃO DO DONO (2026-10-27): qual proteção da develop vale, opção B ("B"): vale só o ruleset 25003880 "develop: PR, squash, checks", com os 9 checks (`rapida`, `testes`, `build`, `e2e`, `filtro`, `banco`, `openapi`, `imagem`, `seguranca`); o dono acrescenta os 5 que faltam nas Settings do ruleset; o devops-engineer ajusta o documento para descrever esse ruleset; o comando PUT na proteção clássica não se roda.
- DECISÃO DO DONO (2026-10-27): base do delta da branch feature/042-protecao-develop, opção A ("A"): a conferência mede a branch desde o ponto em que saiu da develop, e342a2cd71c46df5acf60b756637ebf5a6c84709.
- ADR 0003, ADR 0014 e ADR 0020 (citadas no pedido): nada nelas muda nesta entrega.
- R-CONFORMIDADE: proteção de branch é do dono; nenhuma chamada que altere o GitHub. O `forge:tech-lead` revisa e envia a mesma branch depois desta entrega: commite só o seu caminho.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-042p/docs/security/042-protecao-develop-r2.md` · parecer gravado
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-042p log -1 --format=%H -- docs/security/042-protecao-develop-r2.md` · espera: o sha40 do commit do parecer, com `Cartão: K-148`
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-042p status --porcelain -- docs/security` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito do parecer. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
