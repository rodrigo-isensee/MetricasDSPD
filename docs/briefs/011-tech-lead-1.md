## Objetivo
Code review do back da fase 2 do pedido 011 (K-103) e separação da entrega em 3 branches por nível, para os 3 PRs que o usuário pediu (estratégicas → táticas → operacionais, em lotes separados). Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2`, branch `feature/011-fase2-back`, commits 3297fda (E1) e 11113d0 (E2) sobre b73bad3.

## Ler
- `docs/pedidos/011-metricas-tambem-disponiveis.md`: "Decisões do usuário", "Retomada 2026-10-17" (Escopo, Decisão do usuário de 2026-10-17 sobre os lotes, Etapas) e "Decisões do usuário (2026-10-17, depois da retomada)".
- `docs/architecture/features/metricas-tambem-disponiveis.md`: §2 do E6, E7, E8, T13, T14, O22 e O26; §4; §5 "Fase 2"; §9.
- `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`: "Decisão" e "Decisões do usuário".
- `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 diff b73bad3..11113d0`.
- `docs/engineering/praticas.md`, seções 2, 4 e 5 e a de commits.

## Entregar
- (E1, E2) Code review dos dois commits contra o plano, a ADR 0020 e as regras invioláveis do `CLAUDE.md`. Pontos que o autor deixou para o review: (a) E7 com R$ só para sistema com 20 ou mais entregas: diga se a regra "abaixo de 20 itens, não publicar estatística" do briefing cobre o rateio e o custo por demanda; se os documentos não decidirem, registre como pergunta ao usuário, sem decidir no código; (b) ratificar o aceite de uso único do enum `indicadores[].metrica` do `VISAO_GERAL` (6 ids novas); (c) as mudanças em testes do QA (`qa011-fase1.api.test.ts`, `o23.test.ts`, `t11.test.ts`) e em `docs/architecture/regras-metricas.md`; (d) as suposições do autor (O22 e O26 por tipo, T13 e T14 por granularidade, `histograma` nulo abaixo de 20, E6 com `semData`, T14 "em andamento no período").
- (E1, E2) Separar a entrega em 3 branches a partir da `develop` atual, cada uma com a sua parte e os seus commits, `git add` por caminho: `feature/011-fase2-estrategicas` (E6, E7 com R$, E8), `feature/011-fase2-taticas` (T13, T14) e `feature/011-fase2-operacionais` (O22, O26). Os arquivos compartilhados (`METRICA_IDS`, `APLICABILIDADE_FLUXO`, `COM_EXTENSAO_MOCK`, OpenAPI, snapshots, `docs/api`) entram em cada branch só com a parte do seu nível; a tática sai da estratégica e a operacional sai da tática, se isso evitar conflito. Cada branch com `pnpm run pronto` verde e push.
- (E1, E2) Um parecer de review por branch em `docs/reviews/011-fase2-<nível>.md` (`pedido:` igual ao nome do arquivo sem `.md`), gravado com Write e commitado na branch do nível.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"): "E1.3/E2.3 (forge:security-engineer): review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)."; "E1.4/E2.4 (forge:qa-engineer): QA do back da fase 2."; "E3.2 (forge:ux-designer): CAs na especificação."; "E4.1 (forge:react-frontend): front, depois do K-102."; "E4.2 (forge:ux-designer): revisão da interface implementada."; "E4.3 (forge:qa-engineer): QA do front."; "E9.2 (dono): merge na main."
- Fora do escopo (do pedido, "### Fora do escopo"): os PRs do back da fase 2 e a promoção para a homolog (pedido 020); a fase 3.

## Decisões e restrições
- Decisões do usuário do pedido 011 (todas as listadas em "Decisões do usuário" e nas duas seções de 2026-10-17), entre elas: R-1 = B; T14 nova = A; Q-T14-5 = D; Q-T14-6 = A com o refinamento da R-1 = B; Q-T14-10 = B (cadastro de membros por time, só na fase 3; no mock o booleano é gerado direto); Q-a = 1 passagem; Q-b = conta; Q-E7-1 = pró-rata por dias corridos; D-1' = A; D-5' = B; métricas por nível em lotes separados; "4-seguir".
- ADR 0020 vigente para a fase 2; ADR 0011 (biblioteca única); ADR 0003 (orçamento de performance).
- Regras invioláveis do `CLAUDE.md`. Dúvida de regra de negócio que os documentos não decidem vira pergunta ao usuário.
- NÃO tocar: `web/`, `.github/`, migrações de banco, a `main`, o diretório principal e a worktree `-perf-semanal`. Ajuste de código que o review pedir volta ao autor; separar commits e arquivos entre as 3 branches não é ajuste de código. R-VERIFY: sem `--no-verify` nem `--force`.
- Teto reduzido a 2 agentes a pedido do usuário (2026-10-17): o QA do K-102 roda E2E na `-perf-semanal`. Rode o `pronto` de uma branch por vez, com `uptime` e `free -m` antes, e só com load abaixo de 4.

## Pronto quando
- PQ-1 (push): as 3 branches `feature/011-fase2-estrategicas`, `feature/011-fase2-taticas` e `feature/011-fase2-operacionais` no origin.
- PQ-2 (sha): o commit do parecer de review em cada uma das 3 branches.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short` · espera: linhas=0
- PQ-4 (cmd): `pnpm run pronto` em cada uma das 3 branches, da raiz da worktree · espera: rc=0

## Relatório
Até 8 linhas: estado (veredito por branch); o que precisa do usuário (inclui a resposta sobre o mínimo de 20 do E7, se os documentos não decidirem); suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
