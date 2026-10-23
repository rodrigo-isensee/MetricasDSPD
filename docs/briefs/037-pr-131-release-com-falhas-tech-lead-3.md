Agente destino: forge:tech-lead
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Branch: feature/037-c6-operacional   Base: develop   Base-sha: 794b9820cb4bab30e50b7de64748030b474a3074

## Objetivo
Levar o Web Worker do C6 (ADR 0021) para a develop: PR por squash e merge com os checks verdes, depois do review (6fdebb0) e do QA (fd3f851) aprovados e conferidos (fd3f851). Etapa E2.4b do pedido 037, cartão K-113. Worktree `/home/rodrigoisensee/MetricasDSPD-037`, branch `feature/037-c6-operacional` (head fd3f851).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-037/docs/reviews/037-c6-operacional.md` e `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/037-c6-operacional.md` (vereditos, pendências D1 e D2, achados recomendados).
- `docs/engineering/fluxo-homologacao.md`, seção do PR para a develop.

## Entregar
- (E2) Antes do PR: regravar `docs/reviews/037-c6-operacional.md` na worktree -037 com a ferramenta Write ou Edit (não por script no Bash), sem mudar o conteúdo, para o hook registrar a autoria do tech-lead nesta versão; o `forge-check pr` hoje acusa "autoria: sem registro de que o papel `tech-lead` gravou esta versão" porque a versão 6fdebb0 foi escrita por script. Se o conteúdo não mudar, fica sem commit novo.
- (E2) Atualizar a branch com a `origin/develop` (794b982) por merge, sem rebase e sem `--force`, se o PR acusar conflito ou desatualização; rodar `forge-check pr 037-pr-131-release-com-falhas --ref feature/037-c6-operacional --base origin/develop` antes de abrir o PR.
- (E2) PR `feature/037-c6-operacional` → `develop` com a descrição do pedido 037 (o que muda, medição do C6 antes/depois, links para os pareceres) e a seção "Pendências" com D1 (K-131) e D2 (K-132), pela decisão do dono; linha `Cartão: K-113` no corpo do squash.
- (E2) Merge por squash só com todos os checks do PR verdes (sem merge pelo site com check pendente); depois do merge, apagar a branch remota e local e remover a worktree -037 sem `--force` (R-FLUXO, "Depois do merge").

## Fora do escopo
- "E2.6 (forge:qa-engineer): parecer de QA da promoção develop → homolog." · etapa de outro papel, depois desta.
- "E2.7 (forge:tech-lead): parecer de review da promoção, PR develop → homolog (merge commit) e merge com o portão disparado." · etapa do mesmo papel em outro momento, depois do E2.6.
- "E2.5 (dono): mesclar o #136 (homolog → main) com o homolog-aprovada verde." · etapa do dono.
- "E2.1 (forge:qa-engineer): sonda S0 da proposta 037 (C6 do perf-api em /operacional, /operacional?cadencia=diaria e /, e dois perfis do Chromium com pilha), registrada no arquivo do bug C6.", "E2.2 (forge:react-frontend): implementar a ADR 0021 (núcleo puro e Worker), depois do veredito da S0.", "E2.3 (forge:qa-engineer): paridade E2E, C5 com o heap do Worker e medição do pronto (mediana < 150 ms nas 7 rotas).", "E2.3b (forge:qa-engineer): atualizar o frontmatter do parecer de QA para o head testado (9ee640f), com D1 e D2 como pendências pela decisão do dono de 2026-10-21." e "E2.4a (forge:tech-lead): code review da branch (inclusive o que o QA acrescentar), parecer em docs com o commit do head." · etapas cumpridas (conferidas até fd3f851).
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas cumpridas.
- Código; promoção para a homolog; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136.
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- ADR 0003 (citada no pedido) e ADR 0021 (citada no pedido). Regras invioláveis do `CLAUDE.md` (T2.5). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (pr): `gh pr list --head feature/037-c6-operacional --base develop --state merged --json number --jq length` · espera: igual '1'
- PQ-2 (merge): `git -C /home/rodrigoisensee/MetricasDSPD log -1 --format=%B origin/develop` · espera: contém 'Cartão: K-113'
- PQ-3 (cmd): `forge-check pr 037-pr-131-release-com-falhas --ref feature/037-c6-operacional --base origin/develop`, rodado antes de abrir o PR · espera: rc=0
- PQ-4 (cmd): `git ls-remote origin refs/heads/feature/037-c6-operacional` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
