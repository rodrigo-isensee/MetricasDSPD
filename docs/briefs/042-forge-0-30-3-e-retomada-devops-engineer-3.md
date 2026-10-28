Agente destino: forge:devops-engineer
Pedido: docs/pedidos/042-forge-0-30-3-e-retomada.md
Tipo: codigo
Branch: feature/042-protecao-develop   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Volta da etapa E4.1 do pedido 042 (cartão K-148): corrigir o achado bloqueante do review e os recomendados do review e da segurança, num brief único, antes de o dono aplicar a proteção. Worktree `/home/rodrigoisensee/MetricasDSPD-042p`, branch `feature/042-protecao-develop` (head a9b35204943b6cd50734abb77497cdec7cdc89c7).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-042p/docs/reviews/042-protecao-develop-r1.md`, bloco `## Achados` (A1 a A4).
- `/home/rodrigoisensee/MetricasDSPD-042p/docs/security/042-protecao-develop.md`, bloco `## Achados` (A1 e A2).
- `/home/rodrigoisensee/MetricasDSPD-042p/docs/engineering/fluxo-homologacao.md`: linhas 40 a 70, 175 a 185 e a seção 15.

## Entregar
- (E4.1) Review A1, bloqueante: alinhar com a seção 15 as linhas 44, 48 e 68 (seções 4 e 5) e 180 e 181 (seção 14) de `docs/engineering/fluxo-homologacao.md`, que ainda descrevem outra proteção da develop (`strict` ligado, PR obrigatório, lista menor de checks); ao fim, o documento descreve uma única proteção da develop, a da seção 15.
- (E4.1) Review A4 e segurança A1: dizer na seção 15 que o check `seguranca` continua informativo (`continue-on-error`), e que exigi-lo só garante que o job rodou; o `ci.yml` não muda.
- (E4.1) Review A2 e A3: na seção 15 e no parecer `docs/devops/042-protecao-develop.md`, registrar que push e PR geram checks de mesmo nome no mesmo sha, corrigir a frase do `banco` "skipping" (só no run de PR) e acrescentar à conferência pós-aplicação o passo de abrir um PR e ver o merge bloqueado enquanto o `e2e` do PR roda.
- (E4.1) Segurança A2: registrar na seção 15 o risco conhecido de `enforce_admins` desligado (administrador ignora os checks), como ponto que o dono decide ao aplicar.
- (E4.1) Commits com `Cartão: K-148`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`; sem push e sem PR.
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
- "E4.4 (dono): aplicar na develop os checks obrigatórios pelo comando da seção 15 de `docs/engineering/fluxo-homologacao.md` ou pelas Settings do GitHub (R-CONFORMIDADE: proteção de branch é do dono)." · etapa do dono
- Alterar a proteção no GitHub (R-CONFORMIDADE: é do dono); `ci.yml` e demais workflows; os pareceres de review e de segurança; amarrar os checks ao app do Actions (risco residual informativo da segurança); push; PR; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): "talvez precise atualizar algo no banco ja quetroquei de maquina" (coberto pelo E2.3: banco recriado do zero, migrações e seed).
- DECISÃO DO DONO (2026-10-27): "pode usar o poder computacional disponivl para paralelizar" (lido como: agentes em paralelo até o teto de R-TETO desta máquina; suítes de teste limitadas pela memória medida, 7 GB visíveis).
- DECISÃO DO DONO (2026-10-27): pedido de origem acima (atualizar para 0.30.3 por branch e PR para a develop; retomar a fila).
- DECISÃO DO DONO (2026-10-27): integrações, opção B ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais"): integrações reais só depois de todo o backlog.
- DECISÃO DO DONO (2026-10-27): proteção da develop, opção A ("A"): a develop passa a exigir os checks da CI verdes para aceitar merge; o devops-engineer configura no GitHub e registra no fluxo de homologação.
- ADR 0003, ADR 0014 e ADR 0020 (citadas no pedido): nada nelas muda nesta entrega.
- A lista de nove checks, `strict` desligado e `perf` fora, aprovados pelo review e pela segurança, não mudam. R-CONFORMIDADE: nenhuma chamada que altere o GitHub; R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-042p log -1 --format=%H -- docs/engineering/fluxo-homologacao.md` · espera: o sha40 de um commit posterior a a9b35204943b6cd50734abb77497cdec7cdc89c7, com `Cartão: K-148`
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-042p status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
