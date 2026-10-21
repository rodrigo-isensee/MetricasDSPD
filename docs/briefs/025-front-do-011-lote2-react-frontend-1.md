Agente destino: forge:react-frontend
Pedido: 025-front-do-011-lote2
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Pôr no painel tático (/tatico) as métricas do lote 2 do pedido 011 (T10, T11, T12, T13 e T14), cujo back em mock já está na develop; etapa E1.1 do pedido 025, cartão K-110. Crie a worktree `/home/rodrigoisensee/MetricasDSPD-025` com a branch `feature/025-front-taticas` a partir de `origin/develop` (568ea48).

## Ler
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: §3 (regras transversais), §5 só as fichas T10 a T14 (linhas 154 a ~215), §6 (estados), §9 (microcopy), os critérios de aceite da §10 que citam T10 a T14 e a §11 (alinhamentos de 2026-10-17).
- `docs/pedidos/025-front-do-011-lote2.md`: Escopo, Suposições e Decisões.
- Modelo de implementação: o commit `d83024b` (lote 1, cartões E6 a E9 no Estratégico) e `web/src/features/tatico/`.
- O contrato das táticas na API em mock (rotas e DTOs de T10 a T14 em `server/` ou `packages/`, conforme o lote 1).

## Entregar
- (E1) Cartões T10, T11, T12, T13 e T14 em /tatico conforme as fichas da especificação, com estados (§6), microcopy (§9), catálogo de métricas e testes de unidade (cobertura exigida do `web/`).
- (E2) T14: "outros times" oculto quando o back sinalizar que soma menos de 2 pessoas (R-1 = B).
- (E3) T14: com "outros times" oculto, a tela mostra só a fatia do meu time, sem `n` nem o total do projeto (T14-M1 = B; suposição S1 do pedido), com teste que prova que o total não aparece.
- (E4) T10: exibir o fornecedor como vem da API (normalização do B11-001 já no back); teste com nomes que diferem só em caixa ou espaços aparecendo numa linha só.
- (E1) Commits conforme a seção de commits do `docs/engineering/praticas.md`, com `git add` explícito por caminho e a linha `Cartão: K-110`; `pnpm run pronto` verde rodado da raiz da worktree; documentação afetada atualizada na mesma entrega (catálogo, ajuda); push da branch.

## Fora do escopo
- "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." · etapa de outro papel.
- "E1.3 (forge:tech-lead): code review." e "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapas de outro papel.
- "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapa de outro papel.
- "E1.5 (forge:qa-engineer): QA e parecer." · etapa de outro papel.
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." · etapa de outro papel.
- Back das táticas (contrato, cálculo, `server/`, `packages/metricas`); T14-ordem; operacionais; integrações; o Worker do pedido 037 (worktree -037: não tocar em `MockFonteMetricas`); o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual nem comparação entre times (a T14 não nomeia nem ranqueia outros times); abaixo de 20 itens não publicar estatística; nenhum cálculo no front (percentis e tempos vêm da biblioteca compartilhada, via API).
- ADR 0003: F2 CLS < 0,1 e C6 < 200 ms em /tatico (a S0 do pedido 037 viu CLS 0,103 em /tatico numa execução: reserve altura dos cartões).
- R-TETO: `pnpm run pronto` e Vitest são pesados; antes de cada execução, `pgrep -fa 'playwright|vitest'` vazio (sem `flock`). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-025 log -1 --format=%h` da branch · espera: o hash do último commit da implementação.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/025-front-taticas` igual ao head local.
- PQ-3 (cmd): `pnpm run pronto` na raiz de `/home/rodrigoisensee/MetricasDSPD-025` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
