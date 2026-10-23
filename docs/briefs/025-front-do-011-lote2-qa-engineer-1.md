Agente destino: forge:qa-engineer
Pedido: 025-front-do-011-lote2
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Plano de testes, E2E e QA do front das táticas T10 a T14 (entrega 32a509f, review e segurança aprovados e conferidos em b6c7673), com o parecer de QA. Etapas E1.2 e E1.5 do pedido 025, cartão K-110. Worktree `/home/rodrigoisensee/MetricasDSPD-025`, branch `feature/025-front-taticas`.

## Ler
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: §5 (fichas T10 a T14), §6 (estados) e os critérios de aceite da §10 que citam T10 a T14.
- `docs/pedidos/025-front-do-011-lote2.md`: Escopo e Decisões.
- `/home/rodrigoisensee/MetricasDSPD-025/docs/reviews/025-front-taticas.md` e `/home/rodrigoisensee/MetricasDSPD-025/docs/security/025-t14-reidentificacao.md`, seções `## Achados`.

## Entregar
- (E1) Plano de testes do lote 2 e testes E2E de /tatico para T10 a T14 (estados, microcopy, catálogo e "Leia junto"), na API em mock (projeto do Playwright que o lote 1 usou); F2 CLS e C6 de /tatico (ADR 0003).
- (E2, E3) E2E da T14: com "outros times" oculto, a tela mostra só a fatia do meu time, sem `n`, total do projeto nem percentual (R-1 = B e T14-M1 = B), inclusive em frentes; acessibilidade (axe) do cartão.
- (E4) E2E do T10: fornecedor com grafias diferentes só em caixa ou espaços aparece numa linha só.
- (E1) Parecer de QA em `docs/qa/025-front-taticas.md` com o plano, os resultados, o load da máquina e a lista de defeitos (passos para reproduzir), aprovado ou reprovado. Falhas de E2E que já existem na develop (D1 do parecer de QA do 037: 96 testes em `e2e/tests/intensivo-filtros.spec.ts` e 4 em outros arquivos) entram como "já existente", não como defeito desta entrega, e são listados como pendências do PR (decisão do dono abaixo; cartões K-131 e K-132).
- (E1) Um commit do parecer e dos testes novos, com `git add` explícito por caminho (sem as evidências regravadas em `docs/qa/evidencias/` pela suíte completa), mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-110`; `pnpm run pronto` verde uma vez antes do commit; push da branch.

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde." · etapa de outro papel, cumprida (32a509f, conferida).
- "E1.3 (forge:tech-lead): code review." e "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapas de outro papel, cumpridas (b6c7673, conferida).
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." · etapa de outro papel, depois desta.
- "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapa de outro papel, depois desta.
- Corrigir código de `web/` (defeito vira relato); corrigir os E2E defasados da develop (D1, cartão próprio); o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual nem comparação entre times (a T14 não nomeia nem ranqueia outros times); abaixo de 20 itens não publicar estatística; nenhum cálculo no front (percentis e tempos vêm da biblioteca compartilhada, via API).
- ADR 0003: F2 CLS < 0,1 e C6 < 200 ms em /tatico (a S0 do pedido 037 viu CLS 0,103 em /tatico numa execução: reserve altura dos cartões).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.
- R-TETO: uma suíte pesada por vez; antes de cada execução, `pgrep -af 'node .*(vitest|playwright)'` sem processo de outra worktree (o 037 pode estar com o portão ou o PR rodando). R-CONFORMIDADE: bloqueio não se contorna; vira relato.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-025 log -1 --format=%h -- docs/qa/025-front-taticas.md` · espera: o hash do commit do parecer.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/025-front-taticas` igual ao head local.
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-025/docs/qa/025-front-taticas.md`

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
