Agente destino: forge:react-frontend
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Branch: feature/037-c6-operacional   Base: develop   Base-sha: 794b9820cb4bab30e50b7de64748030b474a3074

## Objetivo
Corrigir o W037-001: com o Web Worker do mock, 101 E2E falham (B3-002, IF-C-operacional-diaria-01, IF-U-operacional e outros), e na develop sem o Worker passam. Etapa E2.2b do pedido 037 (volta da E2.2, entregue em 0bde5eb), cartão K-113. Worktree `/home/rodrigoisensee/MetricasDSPD-037`, branch `feature/037-c6-operacional` (head 2688e85), já existente: não crie outra.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/bugs/W037-001-e2e-100-vermelhos-com-o-worker.md` (passos, amostra de erros e a hipótese do QA sobre `e2e/pages/PainelPage.ts:53`, `esperarCartoesProntos`).
- `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/037-c6-operacional.md`, seção "E2E do PR #137 (E2.3c)".
- `docs/architecture/adr/0021-calculo-do-mock-em-web-worker.md`, seções de transporte e de testes.

## Entregar
- (E2) Achar a causa raiz do W037-001 e corrigir: se o app expõe o estado "pronto" antes de os dados do Worker chegarem, corrigir no app; se os testes esperam um sinal que o Worker torna assíncrono, ajustar a espera dos helpers E2E para aguardar o estado real (nunca `waitForTimeout`, nunca retirar asserção, nunca aumentar timeout como correção). Registrar a causa no arquivo do bug.
- (E2) Rodar as 4 specs (`intensivo-filtros`, `b12-fluxo`, `intensivo-filtros-bordas`, `filtros`) com build e porta exclusivos desta worktree (sem `vite preview` de outra worktree; conferir com `ss -ltnp`), até 216 de 216 (ou só as instáveis de D2, nomeadas); e a paridade `e2e/tests/mock-transporte-worker.spec.ts` verde.
- (E2) Commits com `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-113`; durante o trabalho, só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final; push da branch.

## Fora do escopo
- "E2.3c (forge:qa-engineer): verificar se os 101 E2E vermelhos do PR #137 também falham na develop (794b982), com porta própria (`E2E_PORTA`) e sem preview de outra worktree; registrar no parecer de QA se são regressão do Worker ou defeito antigo." · etapa de outro papel, cumprida (2688e85); o QA reconfirma depois desta.
- "E2.4a (forge:tech-lead): code review da branch (inclusive o que o QA acrescentar), parecer em docs com o commit do head." e "E2.4b (forge:tech-lead): PR para a develop (squash), com D1 e D2 listados como pendências, e merge com os checks verdes; limpeza da branch e da worktree -037 depois do merge." · etapas de outro papel, depois desta.
- "E2.5 (dono): mesclar o #136 (homolog → main) com o homolog-aprovada verde.", "E2.6 (forge:qa-engineer): parecer de QA da promoção develop → homolog." e "E2.7 (forge:tech-lead): parecer de review da promoção, PR develop → homolog (merge commit) e merge com o portão disparado." · etapas de outro papel ou do dono.
- "E2.1 (forge:qa-engineer): sonda S0 da proposta 037 (C6 do perf-api em /operacional, /operacional?cadencia=diaria e /, e dois perfis do Chromium com pilha), registrada no arquivo do bug C6.", "E2.3 (forge:qa-engineer): paridade E2E, C5 com o heap do Worker e medição do pronto (mediana < 150 ms nas 7 rotas)." e "E2.3b (forge:qa-engineer): atualizar o frontmatter do parecer de QA para o head testado (9ee640f), com D1 e D2 como pendências pela decisão do dono de 2026-10-21." · etapas cumpridas.
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas cumpridas.
- Render fatiado; mudar limites da ADR 0003 ou o método do C6; D2; o parecer de QA; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- ADR 0003 (citada no pedido): C6 < 200 ms bloqueia e não muda; F6 sem aumento além de 2 KB gzip e F9 dentro do limite (`pnpm --filter web size`).
- ADR 0021 (citada no pedido): o Worker fica atrás da `MockFonteMetricas` (a interface já é assíncrona; nenhum painel muda); paridade 1 a 3 em Vitest.
- Regras invioláveis do `CLAUDE.md`: todo cálculo de tempo, percentil e Monte Carlo passa pela biblioteca compartilhada (T2.5); o núcleo chama `@metricas-dspd/metricas`, sem cálculo próprio. No modo Worker, a thread principal não importa `@metricas-dspd/mock` nem `@metricas-dspd/metricas`.
- R-TETO: `pnpm run pronto` e Vitest são pesados; antes de cada execução, `pgrep -fa 'playwright|vitest'` vazio (sem `flock`, que o hook recusa). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136.
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- O E2.3c (2688e85) mostrou que o D1 não existe na develop: é o W037-001, regressão desta entrega, e por isso é corrigido aqui (a decisão de D1 como pendência não se aplica ao 037). D2 continua pendência.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-037 log -1 --format=%h` da branch · espera: o hash do último commit da correção.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/037-c6-operacional` igual ao head local.
- PQ-3 (cmd): `pnpm run pronto` na raiz de `/home/rodrigoisensee/MetricasDSPD-037` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
