# Pedido 042: Forge 0.30.3 no projeto e retomada na máquina nova

- **Data:** 2026-10-27
- **Origem:** usuário: "esta maquina acabou de ser preparada. O projeto foi clonado do GitHub e esta na develop atualizada (e342a2c). O plugin do Forge instalado e o 0.30.3 (ultima release), mas o projeto ainda declara 0.28.0 em .forge/versao. 1) Atualize o Forge do projeto para a 0.30.3 pelo fluxo normal (forge atualizar, branch e PR para a develop). 2) Depois, retome o trabalho de onde parou: leia o KANBAN.md, os PRs e branches abertos (inclusive docs/jarvis-2026-10-23) e siga a fila. Me traga as decisoes que forem minhas."
- **Modo:** implementar
- **Objetivo:** registrar a 0.30.3 do Forge na develop pelo fluxo normal e retomar a fila (041 e o que estava aberto) nesta máquina.
- **Clareza:** 2 confirmado, 3 técnico, 2 suposições; 0 perguntas.

## Diagnóstico (2026-10-27 12:26)
- Plugin na sessão: 0.30.3. `.forge/versao` na develop: 0.28.0. `forge-upgrade --simular`: "versão atual 0.28.0 -> 0.30.3; branch forge/upgrade-0.30.3 a partir de develop", sem outra migração listada.
- `forge atualizar` recusa rodar dentro do Claude e pede terminal; com o plugin já na 0.30.3 ele responde "já está na última versão" e não toca no projeto. Quem aplica no projeto é o `forge-upgrade` (grava `.forge/versao`, que só o dono altera: hook R-CONFORMIDADE, visto no 038).
- Doutor: proteção do git (pre-push da main) desligada neste clone; sandbox desligado; branch `homolog` só no remoto.
- Máquina sem Node, pnpm, Docker, `.env` e `node_modules`; 7 GB de memória visíveis no WSL (a anterior tinha teto de 14 GB); 16 núcleos.
- Fila retomada da branch `docs/jarvis-2026-10-23` (quadro e pedido 041 mais novos que os da develop). Os briefs aprovados do 041 apontam para `/home/rodrigoisensee/Metricas/...` (máquina anterior) e para a base c4db73e: serão refeitos com os caminhos e a base novos.
- PRs abertos: #145, #146 e #147 (dependabot; #147 é react-router 7 → 8, versão maior). Branches abertas: `feature/041-estabilidade` (5 commits), `feature/041-homolog-aprovada` (2), `feature/011-*` (K-125), `docs/jarvis-2026-10-23` (22 commits de docs, inclui o K-139).

## Escopo
- E1. Levar à develop `.forge/versao` = 0.30.3 pela branch `forge/upgrade-0.30.3`, com PR, review, QA e merge por squash. · `confirmado`
- E2. Ambiente desta máquina para rodar o projeto (Node 24, pnpm, dependências, Docker, banco, Chromium do Playwright). · `técnico`
- E3. Retomar a fila: pedido 041 (E2.1, E2.3, volta da E3.2 com a opção B, E4.1, E5.1), PR de docs do Jarvis (`docs/jarvis-2026-10-23`, com o K-139), PRs do dependabot e K-125. · `confirmado`

## Etapas
- E1.1 (dono): no terminal, na raiz do projeto: `forge-upgrade` (cria a branch `forge/upgrade-0.30.3` com o commit da versão; nada vai ao GitHub).
- E1.2 (forge:tech-lead): push da branch, PR para a develop, parecer de review, merge por squash depois do QA, limpeza da branch.
- E1.3 (forge:qa-engineer): parecer de QA (CI do PR verde e `pnpm run pronto`).
- E2.1 (dono): Docker Engine no WSL (sudo; decisão A do 040), `cp .env.example .env`, Node 24 pelo nvm, `sudo` das dependências do Chromium (`pnpm exec playwright install-deps chromium`), `forge doutor` no terminal (proteção do git e branch homolog) e `/sandbox`.
- E2.2 (forge:tech-lead): `pnpm install --frozen-lockfile` e `pnpm exec playwright install chromium`.
- E2.3 (forge:devops-engineer): banco (db:up, db:migrate, db:seed) e consulta de prova.
- E3.1 (forge:software-architect): E2.3 do 041 (ADR 0003, regra do F4), sem depender do ambiente.
- E3.2 (forge:qa-engineer, forge:devops-engineer, forge:tech-lead): o resto do 041 na ordem do pedido 041, depois do E2.
- E3.3 (forge:tech-lead): PR de docs do Jarvis, PRs do dependabot (#145, #146, #147) e K-125, depois do E2.

## Fora do escopo
- Promover para homolog e main (vai na próxima release; a main é do dono). · `confirmado` · base: CLAUDE.md
- Rodar `forge atualizar` ou gravar `.forge/versao` pelo time (o hook barra; é do dono). · `técnico`
- Mudar a configuração de memória do WSL (é do dono, no Windows). · `suposição` · base: decisões do dono de 2026-10-23 sobre memória

## Suposições
- "pelo fluxo normal (forge atualizar ...)" = aplicar a versão no projeto com `forge-upgrade` no terminal do dono, porque o plugin já está na 0.30.3 e o `forge atualizar` não teria o que fazer. · `suposição` · base: código de `bin/forge-atualizar` e simulação do `forge-upgrade`
- As decisões do dono de 2026-10-23 sobre consumo (uma suíte de teste por vez, poucos agentes) continuam valendo nesta máquina. · `suposição` · base: pedido 041, Decisões

## Critério de pronto
- PQ-1 `.forge/versao` na origin/develop igual a `0.30.3` · prova: merge · `técnico`

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-27): pedido de origem acima (atualizar para 0.30.3 por branch e PR para a develop; retomar a fila).

## Registro de clareza
PERGUNTA: nenhuma
NAO-ENTENDI: 2026-10-27 · "pelo fluxo normal (forge atualizar ...)": leitura 1, rodar `forge atualizar` (não faz nada, o plugin já está na 0.30.3); leitura 2, aplicar no projeto com `forge-upgrade`, que cria a branch. Adotada a leitura 2, citada no recibo.
ESCOPO+: 2026-10-27 · E2 (ambiente da máquina nova), necessário para o E1.3 e para a retomada
ESCOPO-: nenhuma
DEVOLVIDA: nenhuma

## Histórico
- 2026-10-27 12:26: pedido aberto; diagnóstico; recibo e ações do dono enviados.
