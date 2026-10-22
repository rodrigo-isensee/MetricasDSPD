Agente destino: forge:tech-lead
Pedido: docs/pedidos/025-front-do-011-lote2.md
Branch: feature/025-front-taticas   Base: develop   Base-sha: 306cf6ef29db7bbae2509194406e0b7fcc6ab232

## Objetivo
Trazer para a branch do 025 a develop com o Worker do 037 (ruleset da develop exige branch atualizada: `strict_required_status_checks_policy: true`, checks `rapida`, `testes`, `build` e `e2e`) e revisar o merge, antes do reteste do QA e do PR. Etapas E1.7, parte 1 (atualizar a branch com a develop e enviá-la; decisão técnica gravada no Andamento do pedido 025 em 2026-10-22), e E1.3 (review incremental do merge) do pedido 025, cartão K-110. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-025`, branch `feature/025-front-taticas` (head 8a97686, já no remoto; a worktree não existe neste computador, por causa da troca de máquina em 2026-10-22: criá-la com `git worktree add /home/rodrigoisensee/Metricas/MetricasDSPD-025 feature/025-front-taticas`, a partir de `origin/feature/025-front-taticas`; review aprovado com `commit: 5a0a999`, QA aprovado com `commit: ea533a3`).

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-025 diff 8a97686...origin/develop --stat` (o que entra com o merge: o squash do 037).
- `/home/rodrigoisensee/Metricas/MetricasDSPD-025/docs/reviews/025-front-taticas.md`, frontmatter e a última seção.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/qa/bugs/W037-001-e2e-100-vermelhos-com-o-worker.md` na develop (`git show origin/develop:docs/qa/bugs/W037-001-e2e-100-vermelhos-com-o-worker.md`), seção "Causa raiz e correção": as esperas de `aguardando-coleta` que os E2E precisam com o Worker.

## Entregar
- (E1, E1.7 parte 1) `git fetch` e merge de `origin/develop` (já com o squash do 037, 2bb9f68, e o registro da 0.28.0 do Forge, #138) na branch, nunca rebase nem `--force`; o merge 4fe19af da tl-5 trouxe só a develop de antes do 037 (794b982, `.forge/versao`); conflito em código: pare e relate, sem resolver por conta própria o que muda comportamento; push da branch logo depois do merge, para o commit a revisar estar no remoto.
- (E1) Revisão incremental do merge no parecer `docs/reviews/025-front-taticas.md`: interseção entre o Worker do 037 e o front das táticas (`web/src/features/complementares/`, `e2e/tests-api/tatico-011-lote2.spec.ts`, `e2e/perf/perf.spec.ts`, `e2e/tests-api/t10-grafias.spec.ts`), em especial se os E2E do 025 esperam o fim de `aguardando-coleta` como os corrigidos no W037-001; achado bloqueante em `## Achados` se algum E2E do 025 lê o painel antes disso; frontmatter `commit:` no head do merge; gravar com Write ou Edit, nunca por Bash; validar com o `forge-check docs`; um commit só do parecer, `git add` explícito por caminho, linha `Cartão: K-110`; push da branch.
- (E1.7, parte 2) PR para a develop (squash), merge e limpeza: não nesta delegação. Pela decisão técnica de 2026-10-22, só depois do reteste do QA no head do merge (E1.5), numa delegação de volta ao tech-lead.
- (E2, E3, E4) Sem mudança esperada: o merge não toca a T14 nem o T10; se tocar, registre no parecer.

## Fora do escopo
- "E1.5 (forge:qa-engineer): QA e parecer." · etapa de outro papel, depois desta (reteste dos E2E do 025 no head do merge).
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." · etapa de outro papel, cumprida (5a0a999).
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde.", "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." e "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapas cumpridas.
- Mudar código ou testes (achado vira parecer); abrir PR; o parecer de QA; o quadro; tocar a `main`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- Para o D1 vale a decisão "D1, opção A", resposta do dono posterior à outra (ordem registrada no Andamento do pedido 025, 2026-10-22: a decisão D1/D2 já constava do brief aprovado às 19:53; a pergunta sobre o D1 foi ao dono às 19:58; a resposta "A se d1 foi feito e vai subir certo" aparece no brief aprovado às 20:47), e ela revê a anterior só no D1: no 025 o D1 não se aplica e não entra como pendência; o D2 continua pendência.
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- Pré-condição: o PR do 037 (#139) já mesclado na develop (cumprida: squash 2bb9f68 em 2026-10-22).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`; nada de `reset` nem reescrita de histórico.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-025 merge-base --is-ancestor origin/develop HEAD` · espera: rc=0
- PQ-2 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-025 log -1 --format=%H -- docs/reviews/025-front-taticas.md` · espera: o sha40 do commit do parecer, depois do merge
- PQ-3 (push): `git ls-remote origin refs/heads/feature/025-front-taticas` igual ao head local

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
