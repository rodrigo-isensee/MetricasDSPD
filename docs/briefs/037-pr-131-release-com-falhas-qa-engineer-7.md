Agente destino: forge:qa-engineer
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Branch: feature/037-c6-operacional   Base: develop   Base-sha: 794b9820cb4bab30e50b7de64748030b474a3074

## Objetivo
Reconfirmar a correção do W037-001 (35bfd72, conferida e revisada em 7700366) e fechar o parecer de QA do 037 para o PR: o `forge-check pr` acusa o parecer de QA reprovado e sem autoria registrada. Etapa E2.3c (reconfirmação) do pedido 037, cartão K-113. Worktree `/home/rodrigoisensee/MetricasDSPD-037`, branch `feature/037-c6-operacional` (head 7700366).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/bugs/W037-001-e2e-100-vermelhos-com-o-worker.md`, seção "Causa raiz e correção".
- `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/037-c6-operacional.md` (frontmatter, seção "E2E do PR #137 (E2.3c)" e defeitos).

## Entregar
- (E2) Rodar, sem mudar arquivo de teste, as 4 specs (`intensivo-filtros`, `b12-fluxo`, `intensivo-filtros-bordas`, `filtros`) e a paridade `e2e/tests/mock-transporte-worker.spec.ts` no head, com build e porta exclusivos desta worktree (variável de ambiente local, sem commitar configuração; conferir com `ss -ltnp`), `--retries=0`; registrar os números e o load.
- (E2) Atualizar o parecer `docs/qa/037-c6-operacional.md`: veredito aprovado se o W037-001 estiver resolvido (fechar o bug no arquivo de bug), frontmatter `commit: 35bfd72` (o head de código; depois dele só o parecer de review), pendências do PR conforme as decisões do dono: só o D2 (K-132); o D1 sai das pendências e aparece como W037-001, encontrado e corrigido nesta entrega, com a condição da decisão do dono de 2026-10-21 (check `e2e` do PR do 037 verde), escrita no parecer; validar com o `forge-check docs`; gravar o parecer com a ferramenta Write ou Edit, nunca por Bash, para o hook registrar a autoria.
- (E2) `pnpm run pronto` completo uma vez, antes do commit (decisão do dono de 2026-10-21); um commit do parecer e do arquivo de bug, com `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-113`; push da branch.

## Fora do escopo
- "E2.4b (forge:tech-lead): PR para a develop (squash), com D1 e D2 listados como pendências, e merge com os checks verdes; limpeza da branch e da worktree -037 depois do merge." · etapa de outro papel, depois desta.
- "E2.5 (dono): mesclar o #136 (homolog → main) com o homolog-aprovada verde.", "E2.6 (forge:qa-engineer): parecer de QA da promoção develop → homolog." e "E2.7 (forge:tech-lead): parecer de review da promoção, PR develop → homolog (merge commit) e merge com o portão disparado." · etapas de outro papel ou do dono.
- "E2.2 (forge:react-frontend): implementar a ADR 0021 (núcleo puro e Worker), depois do veredito da S0." e "E2.2b (forge:react-frontend): corrigir o W037-001 (101 E2E vermelhos com o Worker) sem afrouxar teste nem limite." · etapas de outro papel, cumpridas (0bde5eb e 35bfd72, conferidas).
- "E2.4a (forge:tech-lead): code review da branch (inclusive o que o QA acrescentar), parecer em docs com o commit do head." · etapa de outro papel, cumprida (7700366, `commit: 35bfd72`).
- "E2.1 (forge:qa-engineer): sonda S0 da proposta 037 (C6 do perf-api em /operacional, /operacional?cadencia=diaria e /, e dois perfis do Chromium com pilha), registrada no arquivo do bug C6.", "E2.3 (forge:qa-engineer): paridade E2E, C5 com o heap do Worker e medição do pronto (mediana < 150 ms nas 7 rotas)." e "E2.3b (forge:qa-engineer): atualizar o frontmatter do parecer de QA para o head testado (9ee640f), com D1 e D2 como pendências pela decisão do dono de 2026-10-21." · etapas cumpridas.
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas cumpridas.
- Mudar código ou arquivo de teste (achado vira bug); D2; o quadro; PR.

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
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-037 log -1 --format=%h -- docs/qa/037-c6-operacional.md` · espera: o hash do commit do parecer.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/037-c6-operacional` igual ao head local.
- PQ-3 (cmd): `grep -c '^commit: 35bfd72' /home/rodrigoisensee/MetricasDSPD-037/docs/qa/037-c6-operacional.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
