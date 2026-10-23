Agente destino: forge:react-frontend
Pedido: 025-front-do-011-lote2
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Corrigir dois textos errados da tela achados no QA do 025 (L2T-001 e L2T-002), por decisão do dono, antes do review final e do PR. Etapa E1.1 (correção) do pedido 025, cartão K-110. Worktree `/home/rodrigoisensee/MetricasDSPD-025` (branch `feature/025-front-taticas`, head 9e11071), já existente: não crie outra.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-025/docs/qa/bugs/L2T-001-t13-frentes-base-diz-147-de-20-itens-minimos.md` e `/home/rodrigoisensee/MetricasDSPD-025/docs/qa/bugs/L2T-002-t14-meu-time-1-demandas-plural.md` (passos para reproduzir).
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: §6 (estados) e §9 (microcopy), só o que trata de amostra insuficiente e da T14.
- `web/src/features/complementares/taticas.tsx` (T13 e T14) e o helper `plural` de `web/src/lib/formatar`.

## Entregar
- (E1) L2T-001: no T13 em Frentes, a mensagem de amostra insuficiente segue a §6/§9 (n abaixo de 20; nunca "147 de 20"), com teste de unidade que reproduz o caso do bug e passa.
- (E3) L2T-002: na T14, "Meu time: k demanda(s)" com o plural correto pelo helper `plural` (1 demanda, 2 demandas), sem mostrar `n` nem total do projeto, com teste de unidade para k = 1 e k > 1.
- (E2, E4) Sem mudança nesta rodada: R-1 = B na T14 e o fornecedor do T10 (B11-001) continuam como em 32a509f; os testes deles seguem verdes no `pronto`.
- (E1) Commit com `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-110`; durante o trabalho, só os testes e o typecheck do `web/`; `pnpm run pronto` completo uma vez, antes do commit; push da branch.

## Fora do escopo
- "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." e "E1.5 (forge:qa-engineer): QA e parecer." · etapas de outro papel (feitas em 9e11071; o QA reconfirma os dois bugs depois).
- "E1.3 (forge:tech-lead): code review." e "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapas de outro papel.
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." e "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapas de outro papel, depois desta.
- L2T-003 (CLS, pendência do PR por decisão do dono); back da T14 e o resto do `server/`; testes E2E e o parecer de QA; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual nem comparação entre times (a T14 não nomeia nem ranqueia outros times); abaixo de 20 itens não publicar estatística; nenhum cálculo no front (percentis e tempos vêm da biblioteca compartilhada, via API).
- ADR 0003: F2 CLS < 0,1 e C6 < 200 ms em /tatico (a S0 do pedido 037 viu CLS 0,103 em /tatico numa execução: reserve altura dos cartões).
- R-TETO: `pnpm run pronto` e Vitest são pesados; antes de cada execução, `pgrep -fa 'playwright|vitest'` vazio (sem `flock`). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-025 log -1 --format=%h` da branch · espera: o hash do commit da correção.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/025-front-taticas` igual ao head local.
- PQ-3 (cmd): `pnpm run pronto` na raiz de `/home/rodrigoisensee/MetricasDSPD-025` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
