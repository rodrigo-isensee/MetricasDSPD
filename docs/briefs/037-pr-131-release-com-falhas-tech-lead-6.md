Agente destino: forge:tech-lead
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Tipo: codigo
Branch: feature/037-c6-operacional   Base: develop   Base-sha: 794b9820cb4bab30e50b7de64748030b474a3074

## Objetivo
Levar o 037 (Worker da ADR 0021 e correção do W037-001) para a develop: atualizar o PR #137 com o estado atual dos pareceres, deixar todos os checks verdes e mesclar (squash). Etapa E2.4b do pedido 037, cartão K-113. Worktree `/home/rodrigoisensee/MetricasDSPD-037`, branch `feature/037-c6-operacional` (head 47c3e66, review aprovado em 7700366 e QA aprovado em 47c3e66, ambos com `commit: 35bfd72`). Primeiro corrige o parecer de review, achado da conferência de entrega.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/037-c6-operacional.md` (frontmatter, veredito e pendências).
- `/home/rodrigoisensee/MetricasDSPD-037/docs/reviews/037-c6-operacional.md` (frontmatter e veredito).
- `gh pr view 137` (corpo atual e checks).

## Entregar
- (E2) Corrigir o parecer `docs/reviews/037-c6-operacional.md` (achado da conferência de entrega de 2026-10-22): a linha 66 ("D1 (K-131) e D2 (K-132) seguem como pendências do PR") e a 57 ("acompanham o PR como pendência listada") passam a dizer que o D1 é o W037-001, encontrado e corrigido nesta entrega (35bfd72), e que só o D2 (K-132) segue como pendência, pela decisão do dono de 2026-10-21 (opção A sobre o D1); frontmatter continua `commit: 35bfd72` e `parecer: aprovado`; gravar com Write ou Edit (nunca por Bash); validar com o `forge-check docs`; um commit só do parecer, `git add` explícito por caminho, linha `Cartão: K-113`; push da branch.
- (E2) Atualizar o corpo do PR #137: o D1 aparece como W037-001, encontrado e corrigido nesta entrega (35bfd72), com a condição da decisão do dono (check `e2e` do PR verde); só o D2 (K-132) fica como pendência; links dos pareceres de review e QA; não copiar a frase antiga do parecer de QA de que os dois defeitos "já existem na develop".
- (E2) Rodar o `forge-check pr` da branch e deixar todos os checks do PR verdes, inclusive o `e2e`; check vermelho por defeito de código ou de teste não se contorna: pare e relate, sem mudar código, teste nem limite.
- (E2) Com os checks verdes e os pareceres aprovados no head, mesclar o #137 na `develop` (squash), com mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-113`; depois do merge, apagar a branch remota, a local e a worktree `/home/rodrigoisensee/MetricasDSPD-037` (R-FLUXO, "Depois do merge").

## Fora do escopo
- "E2.6 (forge:qa-engineer): parecer de QA da promoção develop → homolog." · etapa de outro papel, depois desta.
- "E2.7 (forge:tech-lead): parecer de review da promoção, PR develop → homolog (merge commit) e merge com o portão disparado." e "E2.8 (forge:tech-lead): abrir o PR de release homolog → main com o Worker do 037, depois do E2.7, para o dono validar e mesclar." · etapas do mesmo papel em outro momento, depois do QA da promoção.
- "E2.5 (dono): mesclar o #136 (homolog → main) com o homolog-aprovada verde. Feito pelo dono em 2026-10-21 13:10 (merge 17fee18), antes do 037 entrar: a correção do C6 vai na próxima release (E2.8)." · etapa do dono, cumprida.
- "E2.4a (forge:tech-lead): code review da branch (inclusive o que o QA acrescentar), parecer em docs com o commit do head." · etapa cumprida (7700366, conferida).
- "E2.3c (forge:qa-engineer): verificar se os 101 E2E vermelhos do PR #137 também falham na develop (794b982), com porta própria (`E2E_PORTA`) e sem preview de outra worktree; registrar no parecer de QA se são regressão do Worker ou defeito antigo." · etapa de outro papel, cumprida (47c3e66, conferida).
- "E2.2 (forge:react-frontend): implementar a ADR 0021 (núcleo puro e Worker), depois do veredito da S0." e "E2.2b (forge:react-frontend): corrigir o W037-001 (101 E2E vermelhos com o Worker) sem afrouxar teste nem limite." · etapas de outro papel, cumpridas (0bde5eb e 35bfd72, conferidas).
- "E2.1 (forge:qa-engineer): sonda S0 da proposta 037 (C6 do perf-api em /operacional, /operacional?cadencia=diaria e /, e dois perfis do Chromium com pilha), registrada no arquivo do bug C6.", "E2.3 (forge:qa-engineer): paridade E2E, C5 com o heap do Worker e medição do pronto (mediana < 150 ms nas 7 rotas)." e "E2.3b (forge:qa-engineer): atualizar o frontmatter do parecer de QA para o head testado (9ee640f), com D1 e D2 como pendências pela decisão do dono de 2026-10-21." · etapas cumpridas.
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas cumpridas.
- Mudar código, teste ou o parecer de QA; fechar o K-131 e mexer no quadro (do Jarvis); a promoção para a homolog; tocar a `main`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136. (Superada pelo ato do dono: o #136 foi mesclado em 2026-10-21 13:10; ver E2.5 e E2.8.)
- ADR 0003 (citada no pedido): C6 < 200 ms bloqueia e não muda; F6 sem aumento além de 2 KB gzip e F9 dentro do limite (`pnpm --filter web size`); check de performance vermelho não se contorna.
- ADR 0021 (citada no pedido): o Worker fica atrás da `MockFonteMetricas`; nada a mudar nesta etapa.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio de check ou de hook não se contorna; vira relato. R-TETO: antes de rodar algo pesado, `pgrep -fa 'playwright|vitest'` sem processo de outra worktree (o 025 pode estar rodando).

## Pronto quando
- PQ-1 (pr): `gh pr view 137 --json state --jq .state` · espera: igual 'MERGED'
- PQ-2 (merge): `gh pr view 137 --json mergeCommit --jq .mergeCommit.oid` · espera: o sha40 do squash na `develop`
- PQ-3 (run): `gh pr checks 137` · espera: nenhum check `fail` nem `pending`; `e2e` em `pass`; `skipping` só nos checks que o próprio workflow pula por filtro de caminho (perf e banco)
- PQ-7 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD log origin/develop -1 -p -- docs/reviews/037-c6-operacional.md | grep -c 'seguem como pendências do PR'` · espera: igual '0'
- PQ-8 (sha): `git log -1 --format=%H origin/feature/037-c6-operacional -- docs/reviews/037-c6-operacional.md` (antes do merge) · espera: o sha40 do commit da correção do parecer de review, depois de 47c3e66
- PQ-4 (cmd): `git ls-remote origin refs/heads/feature/037-c6-operacional | wc -l` · espera: igual '0'
- PQ-5 (cmd): `git worktree list | grep -c MetricasDSPD-037` · espera: igual '0'
- PQ-6 (sha): `git fetch -q origin && git log -1 --format=%H origin/develop` · espera: o mesmo sha40 do PQ-2

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
