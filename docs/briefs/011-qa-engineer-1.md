## Objetivo
QA do lote 1 (estratégicas: E6, E7 com R$, E8) do back da fase 2 do pedido 011, portão obrigatório antes do PR (R-QA). Review e segurança aprovados. Branch `feature/011-fase2-estrategicas` (3aeaa3d, no origin), que sai da develop f81567e. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2` (hoje na `feature/011-fase2-back`; troque para a branch do lote antes de testar e volte no fim).

## Ler
- `docs/qa/011-back-plano.md`: os casos do E6, E7 e E8.
- Na branch do lote: `docs/reviews/011-fase2-estrategicas.md` (ajustes recomendados e riscos).
- Na worktree: `docs/security/011-fase2-estrategicas.md` (sem commit, na `feature/011-fase2-back`).
- `docs/architecture/features/metricas-tambem-disponiveis.md` da develop (`/home/rodrigoisensee/MetricasDSPD/...`): §2 do E6, E7 e E8.

## Entregar
- (E1, E2) QA do lote 1: `pnpm run pronto` na branch do lote; os casos do plano para o E6, o E7 com R$ (fixture, pró-rata por dias corridos, mínimo de 20 entregas por sistema, "k de n" abaixo disso) e o E8 (só a contagem de sistemas com 1 pessoa, sem nomes, R-1 = B); conferir, como pede o ponto (c) do parecer de review do lote (`011-fase2-estrategicas.md`, na branch), a mudança feita pelo node-backend no seu teste `server/tests/qa011-fase1.api.test.ts` (A-2 de 404 para 200) e nos testes do O23 e do T11, que o lote também altera.
- (E1, E2) Parecer em `docs/qa/011-fase2-estrategicas.md` (`pedido: 011-fase2-estrategicas`), gravado com Write e commitado na branch do lote, `git add` por caminho, sem push.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1, E1.2/E2.2 e E1.3/E2.3 já feitas): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E1.2/E2.2 (forge:tech-lead): code review do back da fase 2 e separação em 3 branches por nível (estratégicas, táticas, operacionais), uma por PR."; "E1.3/E2.3 (forge:security-engineer): review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)."; "E3.2 (forge:ux-designer): CAs na especificação."; "E9.2 (dono): merge na main."
- Fora do escopo: o front do 011 (pedido 021); o QA dos lotes 2 e 3 (táticas e operacionais), que vem depois; corrigir código (bug volta ao autor); o PR (pedido 020).

## Decisões e restrições
- Decisões do usuário do pedido 011 que este lote exercita: D-1' = A (custo total do DSPD rateado pela participação por entregas; horas apontadas não entram), Q-E7-1 = pró-rata por dias corridos, D-7 (E6), R-1 = B (E8 sem nomes de sistema), e métricas por nível em lotes separados.
- Regras invioláveis do `CLAUDE.md`: abaixo de 20 itens, sem estatística; nada de pessoa na saída; cálculo pela biblioteca (ADR 0011). Orçamento de performance: ADR 0003.
- NÃO tocar: código de produção, `web/`, `.github/`, a `main`, o diretório principal e as outras branches. Sem `--no-verify`.
- Teto reduzido a 2 agentes a pedido do usuário (2026-10-17): `pronto` uma vez, com `uptime` e `free -m` antes e load abaixo de 4.

## Pronto quando
- PQ-1 (sha): commit do parecer em `feature/011-fase2-estrategicas`.
- PQ-2 (cmd): `pnpm run pronto` na branch do lote, da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short -- server packages web e2e docs/qa` · espera: linhas=0

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ressalvas ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
