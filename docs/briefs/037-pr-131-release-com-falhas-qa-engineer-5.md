Agente destino: forge:qa-engineer
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Branch: feature/037-c6-operacional   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Brief único do QA do 037 (etapas E2.3 e E2.3b, cartão K-113), reunindo a medição e o E2E de paridade (9ee640f) e a atualização do parecer (fd3f851), com todas as decisões do dono em vigor; sem trabalho novo, só a confirmação. Worktree `/home/rodrigoisensee/MetricasDSPD-037`, branch `feature/037-c6-operacional` (head fd3f851).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/037-c6-operacional.md`.
- `docs/pedidos/037-pr-131-release-com-falhas.md`: Decisões.

## Entregar
- (E2) Feito em 9ee640f (só registro nesta rodada, sem refazer): itens 1, 2, 3, 5 e 6 da lista "O que o QA mede depois" da proposta: C6 nas 7 rotas de `ROTAS_PAINEL` (build mock com latência 0, 2 execuções, `PERF_RODADAS_C6=3`, `PERF_REPETICOES_C6=5`, load de 1 min registrado); C6 de `/operacional` no build da CI; comparação com a develop na mesma sessão; sem regressão (F5, F3, F1, F6/F9 com `pnpm --filter web size`, C5 somando os dois heaps); determinismo e paridade E2E (o mesmo painel com `transporte` Worker e em processo). Sem `flock` (o hook recusa): antes de cada medição, `pgrep -f 'node.*(vitest|playwright)'` sem processo de outra worktree; uma suíte pesada por vez (R-TETO).
- (E2) Feito em 9ee640f (só registro nesta rodada, sem refazer): o CLS 0,103 de /tatico visto na S0, F2 medido de novo em /tatico e registrado.
- (E2) Feito em fd3f851 (só registro nesta rodada): no parecer `docs/qa/037-c6-operacional.md`: frontmatter `commit: 9ee640f` (o head de código testado; depois dele só há o parecer de review, sem código), `aceite_usuario` conforme a DECISÃO DO DONO de D1 e D2 (citando a data), e D1 e D2 listados como pendências do PR (K-131, K-132). Sem nova medição: o resultado continua o de 9ee640f. Validar com o `forge-check docs` antes do commit.
- (E2) Feito em fd3f851 (só registro nesta rodada): um commit só do parecer, com `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-113`; push da branch.
- (E2) Trabalho desta rodada, o único: confirme que o head da branch é fd3f851, igual ao remoto, sem mudança pendente na worktree, e que o E2E `e2e/tests/mock-transporte-worker.spec.ts` (9ee640f) e o parecer (fd3f851) estão versionados.

## Fora do escopo
- "E2.4a (forge:tech-lead): code review da branch (inclusive o que o QA acrescentar), parecer em docs com o commit do head." · etapa de outro papel, cumprida (6fdebb0).
- "E2.4b (forge:tech-lead): PR para a develop (squash), merge com os checks verdes e promoção develop → homolog com os pareceres de review e QA da promoção." · etapa de outro papel, depois desta.
- "E2.5 (dono): mesclar o #136 (homolog → main) com o homolog-aprovada verde." · etapa do dono.
- "E2.1 (forge:qa-engineer): sonda S0 da proposta 037 (C6 do perf-api em /operacional, /operacional?cadencia=diaria e /, e dois perfis do Chromium com pilha), registrada no arquivo do bug C6." e "E2.2 (forge:react-frontend): implementar a ADR 0021 (núcleo puro e Worker), depois do veredito da S0." · etapas cumpridas (eeb59fa e 0bde5eb, conferidas).
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas cumpridas.
- Item 4 da lista (CI do PR e do portão: vai com o E2.4b); nova medição; corrigir D1 ou D2; código de `web/`; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136.
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- ADR 0003 (citada no pedido) e ADR 0021 (citada no pedido). Regras invioláveis do `CLAUDE.md` (T2.5). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-037 log -1 --format=%h -- docs/qa/037-c6-operacional.md` · espera: igual 'fd3f851'
- PQ-2 (push): `git ls-remote origin refs/heads/feature/037-c6-operacional` igual ao head local.
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-037/e2e/tests/mock-transporte-worker.spec.ts`

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
