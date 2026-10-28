Agente destino: forge:security-engineer
Pedido: docs/pedidos/042-forge-0-30-3-e-retomada.md
Tipo: codigo
Branch: feature/042-protecao-develop   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E4.2 do pedido 042 (cartão K-148): parecer de segurança da proposta de checks obrigatórios da CI na develop (controle de merge, gatilho de R-SEGURANCA), antes de o dono aplicá-la. Worktree `/home/rodrigoisensee/MetricasDSPD-042p`, branch `feature/042-protecao-develop` (já existe, head 90e8dcc704bc96e4f76e1ccc119e11abcef40d44).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-042p/docs/engineering/fluxo-homologacao.md`, seção 15 (regra, lista de checks, comando PUT e rollback).
- `/home/rodrigoisensee/MetricasDSPD-042p/docs/devops/042-protecao-develop.md` (parecer de devops).
- `.github/workflows/ci.yml` da worktree: só os jobs da lista e os filtros de caminho que fazem cada um sair "skipped".

## Entregar
- (E4.2) Parecer de segurança em `docs/security/042-protecao-develop.md` sobre a proposta: a lista de checks fecha a brecha do merge com CI vermelha ou em curso; check "skipped" pelo filtro não abre caminho para código sem teste chegar à develop; o PUT do comando repete as regras atuais sem afrouxar nenhuma (force push e deleção bloqueados); `strict` desligado e `perf` fora são aceitáveis; rollback seguro. Achados bloqueantes no bloco `## Achados`.
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
- "E4.1 (forge:devops-engineer): configurar na develop os checks obrigatórios da CI (gh api), provar pela leitura da proteção e registrar em `docs/engineering/fluxo-homologacao.md` e no parecer de devops." · já entregue (90e8dcc, texto e comando; a aplicação passou ao dono na E4.4)
- "E4.3 (forge:tech-lead): code review da branch `feature/042-protecao-develop`; push, PR para a develop e merge por squash depois dos pareceres." · etapa de outro papel
- "E4.4 (dono): aplicar na develop os checks obrigatórios pelo comando da seção 15 de `docs/engineering/fluxo-homologacao.md` ou pelas Settings do GitHub (R-CONFORMIDADE: proteção de branch é do dono)." · etapa do dono
- Alterar a proteção no GitHub, `fluxo-homologacao.md`, o parecer de devops e os workflows; push; PR; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): "talvez precise atualizar algo no banco ja quetroquei de maquina" (coberto pelo E2.3: banco recriado do zero, migrações e seed).
- DECISÃO DO DONO (2026-10-27): "pode usar o poder computacional disponivl para paralelizar" (lido como: agentes em paralelo até o teto de R-TETO desta máquina; suítes de teste limitadas pela memória medida, 7 GB visíveis).
- DECISÃO DO DONO (2026-10-27): pedido de origem acima (atualizar para 0.30.3 por branch e PR para a develop; retomar a fila).
- DECISÃO DO DONO (2026-10-27): integrações, opção B ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais"): integrações reais só depois de todo o backlog.
- DECISÃO DO DONO (2026-10-27): proteção da develop, opção A ("A"): a develop passa a exigir os checks da CI verdes para aceitar merge; o devops-engineer configura no GitHub e registra no fluxo de homologação.
- ADR 0003, ADR 0014 e ADR 0020 (citadas no pedido): nada nelas muda nesta entrega.
- R-CONFORMIDADE: proteção de branch é do dono; nenhuma chamada que altere o GitHub. O `forge:tech-lead` revisa a mesma branch em paralelo e commita só o arquivo dele: commite só o seu caminho.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-042p/docs/security/042-protecao-develop.md` · parecer gravado
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-042p log -1 --format=%H -- docs/security/042-protecao-develop.md` · espera: o sha40 do commit do parecer, com `Cartão: K-148`
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-042p status --porcelain -- docs/security` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito do parecer. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
