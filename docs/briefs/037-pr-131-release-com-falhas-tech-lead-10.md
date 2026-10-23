Agente destino: forge:tech-lead
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Tipo: codigo
Branch: docs/promocao-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8

## Objetivo
Promover para a homolog a develop com o 037, o 025, o Forge 0.28.0 e a documentação, e deixar o PR de release para o dono. Etapas E2.7, E2.6b e E2.8 do pedido 037, cartão K-113, depois do parecer de QA da promoção aprovado (f50c99c). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-promo`, branch `docs/promocao-2026-10-23`, com o parecer de QA já no remoto.

## Ler
- `docs/engineering/fluxo-homologacao.md`, §4: as tabelas de gates e o critério de promoção.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-promo/docs/qa/037-promocao-2026-10-23.md`.
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log --oneline origin/homolog..origin/develop`.

## Entregar
- (E2) Parecer de review da promoção em `docs/reviews/037-promocao-2026-10-23.md`, na branch `docs/promocao-2026-10-23`. Ele cobre os PRs #138, #139, #140 e #141: cada um com review aprovado, o que entra na homolog, os riscos (CLS de /tatico sem equipe em 0,091 contra o limite de 0,1; D2/K-132) e o roteiro de rollback. Frontmatter com `commit: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8` e `parecer:`. Gravar só com Write ou Edit. Um commit só desse arquivo, com a linha `Cartão: K-113`, e push.
- (E2, E2.6b) PR da branch `docs/promocao-2026-10-23` para a `develop` (squash), com os dois pareceres. Com os checks verdes, mesclar e apagar a branch remota, a local e a worktree `-promo` (R-FLUXO, "Depois do merge").
- (E2) PR `develop` → `homolog` (merge commit), aberto depois do merge acima. O corpo traz as notas de versão (o que entra, por PR), os links dos pareceres de QA e de review da promoção, os riscos e o rollback. Com os checks verdes, mesclar por merge commit. Depois, acompanhar o portão do `homolog.yml` no push da homolog (job `portao <sha>`) até terminar. Portão vermelho não se contorna: pare e relate o job e o motivo. Se o portão não disparar, relate (é o caso do K-108).
- (E2) Com o portão verde, abrir o PR de release `homolog` → `main`, sem mesclar: o merge é do dono (R-MAIN). O corpo traz as notas de versão, o parecer de QA da promoção, os riscos, o rollback e o resultado do portão.

## Fora do escopo
- "E2.6 (forge:qa-engineer): parecer de QA da promoção develop → homolog." · etapa de outro papel, cumprida (f50c99c).
- "E2.5 (dono): mesclar o #136 (homolog → main) com o homolog-aprovada verde. Feito pelo dono em 2026-10-21 13:10 (merge 17fee18), antes do 037 entrar: a correção do C6 vai na próxima release (E2.8)." · etapa do dono, cumprida.
- "E2.5b (forge:tech-lead): no PR de documentação do Jarvis (branch `docs/jarvis-2026-10-20-noite`) para a develop, corrigir a linha 57 do parecer `docs/reviews/037-c6-operacional.md` (achado da conferência de 2026-10-22 15:02), revisar o diff só de documentação, abrir o PR e mesclar." e "E2.5c (forge:qa-engineer): parecer de QA só de documentação (`docs:check`) da branch do Jarvis, antes do merge do E2.5b." · etapas cumpridas (#141).
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas cumpridas.
- Mesclar na `main`; mudar código, teste ou limite; rodar suíte de teste local (o WSL tem teto de 14 GB e o diagnóstico do 041 roda junto); o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- Para o D1 vale a decisão "D1, opção A", resposta do dono posterior à outra (ordem registrada no Andamento do pedido 025, 2026-10-22). Ela revê a anterior só no D1: no 037 o D1 é o W037-001, regressão do Worker corrigida em 35bfd72 (E2.3c), e não pendência; o K-131 já fechou (e2e do #139 verde). O D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- O comando de pronto da decisão acima vale para commit de código. Esta etapa só commita documentação (o parecer de review) e faz merges, então não se aplica. A suíte roda na CI do PR de promoção e no portão da homolog.
- ADR 0003 (citada no pedido): C6 < 200 ms bloqueia e não muda; check de performance vermelho não se contorna.
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136. (Superada pelo ato do dono: o #136 foi mesclado em 2026-10-21 13:10; ver E2.5 e E2.8.)
- DECISÃO DO DONO (2026-10-22): "Vou dormir toque tudo que puder" (ordem ampla: só o que já está confirmado ou delegado segue, R-DECISAO "Complemento"; aqui, E2.6 a E2.8, a promoção com o 025 e o PR de release para o dono validar).
- R-MAIN: nada na `main`; o PR de release fica aberto para o dono. R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase e `?` no Bash. O merge pede o nome da branch.

## Pronto quando
- PQ-1 (sha): `git log -1 --format=%H origin/docs/promocao-2026-10-23 -- docs/reviews/037-promocao-2026-10-23.md` (antes do merge) · espera: o sha40 do commit do parecer de review
- PQ-2 (merge): `gh pr list --head docs/promocao-2026-10-23 --state merged --json mergeCommit --jq '.[0].mergeCommit.oid'` · espera: o sha40 do squash na `develop`
- PQ-3 (merge): `gh pr list --base homolog --head develop --state merged --limit 1 --json number,mergeCommit` · espera: o PR da promoção, mesclado
- PQ-4 (run): `gh run list --workflow homolog.yml --branch homolog --limit 1 --json headSha,conclusion` · espera: contém 'success'
- PQ-5 (pr): `gh pr list --base main --head homolog --state open --json number,url` · espera: um PR aberto

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
