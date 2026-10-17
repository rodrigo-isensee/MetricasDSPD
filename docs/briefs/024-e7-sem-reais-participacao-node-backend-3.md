Agente destino: forge:node-backend
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Trazer a develop (com o front das estratégicas, #108, d83024ba35763c0b56bebf8184cdbdf1d8da26e0) para a branch do pedido 024, resolvendo os 5 conflitos que o tech-lead encontrou e não podia resolver (contrato e teste de cálculo). Você é o autor do E3 (janela do cálculo do E8 e do E9), que é a origem dos conflitos. Etapa E1.6 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head df75e29d2b6d3ebe8920fb5fbb175c60a5a7ce52).

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md`, seções "Escopo", "Etapas" e "Decisões técnicas do time".
- Os seus commits do E3 e do E1 na branch: `git show --stat 7e92cd9c9eba973156595de9760892957c979597 1bdf1a535df95930b20cc540b51b79f77666d9d4`.
- O que o #108 mudou nos mesmos arquivos: `git diff 5ad02ea4e927c5d6799b5fc7f71e6a37cc39fd92 d83024ba35763c0b56bebf8184cdbdf1d8da26e0 -- docs/api/metricas.md docs/architecture/regras-metricas.md docs/contratos/metricas/E9.md docs/tecnica/biblioteca-de-calculo.md packages/metricas/src/fase2.regras.test.ts`.

## Entregar
- (E1, E3) `git fetch` e `git merge origin/develop` (sem rebase), resolvendo os conflitos em `docs/api/metricas.md`, `docs/architecture/regras-metricas.md`, `docs/contratos/metricas/E9.md`, `docs/tecnica/biblioteca-de-calculo.md` e `packages/metricas/src/fase2.regras.test.ts`: mantenha a regra do pedido 024 (E7 sem R$, E8 e E9 com a janela do cálculo, `concluidoEm` no E6) e preserve o que o #108 acrescentou (textos e testes do front das estratégicas). No corpo do commit de merge, uma linha por arquivo com a resolução.
- (E1, E3) Depois do merge, rodar `pnpm --filter @metricas-dspd/metricas test`, `pnpm --filter @metricas-dspd/contratos test` e `pnpm run docs:check`, todos da raiz da worktree; teste que quebrar só no front (o `custoConfigurado` de `estrategicas.test.tsx`) fica para o E1.4, relate sem corrigir.
- (E1) Push da branch, sem `--force`.

## Fora do escopo
- "E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado`, depois de trazer a develop com o #108" · etapa de outro papel; continua no pedido.
- "E1.2 (forge:tech-lead): review." · a rodada 2 vem depois do E1.4.
- "E1.3 (forge:qa-engineer): QA." · etapa de outro papel.
- "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feita (E4, beb71c64b4a043e7845eace5cf41effe586a3c58); nada novo.
- "E2.1 (forge:software-architect): plano §2 E7 e ADR." · já feita (2de5d80838da8284db9f8ec91c00a5bf3f2bbd7e e df75e29d2b6d3ebe8920fb5fbb175c60a5a7ce52).
- Mudar regra de cálculo além de resolver os conflitos; o front; o PR; o nome do E7 (pendente de confirmação do usuário); o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas, mínimo de 20 entregas por sistema; renomear o E7 está pendente de confirmação do usuário (pedido 021).
- Decisão técnica do Jarvis (pedido 024, 2026-10-17): o node-backend, autor do E3, resolve o merge (E1.6); o tech-lead revisa na rodada 2.
- Regras invioláveis do `CLAUDE.md`: todo cálculo pela biblioteca compartilhada; mudança de critério registrada com data (T2.6); BusinessMap e Acelerato nunca se misturam.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato. Conflito que pede regra de negócio nova: pare (`git merge --abort`) e relate; não decida por inferência.
- NÃO tocar: `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só os testes de pacote e o `docs:check`; sem `pronto` nem E2E local.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 merge-base --is-ancestor d83024ba35763c0b56bebf8184cdbdf1d8da26e0 HEAD && echo contem` · espera: igual 'contem'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 grep -n '<<<<<<<' -- docs packages server web | wc -l` · espera: igual '0'
- PQ-3 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-024 run docs:check` · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha do merge, resolução por arquivo, resultado dos testes de pacote); riscos e mudanças de contrato. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
