# Pedido 050: release-develop

- **Modo:** implementar
- **Objetivo:** "suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- **Clareza:** 3 confirmado, 3 suposição, 2 técnico; 0 perguntas feitas (recibo enviado)
- **Depende de:** nenhum

## Escopo
- E1. Promover para a `homolog` tudo o que já está na `develop` (commits desde a última release, de 16e2617 até a `develop` depois do merge do E5.3 do pedido 051, entre eles as operacionais O19 a O26 do #152, a T14 em mock do #161, o Forge 0.30.5 do #162 e o contrato da O23 do #163 e do 051), por PR `develop` → `homolog` (merge commit), com o portão da CI verde · `confirmado`
- E2. Versão nova: tag `-rc` na `homolog`, `chore(release)` com o CHANGELOG e notas de versão (`docs/engineering/fluxo-homologacao.md` §8) · `confirmado`
- E3. PR de release `homolog` → `main` aberto, com notas, parecer do QA da candidata e roteiro de rollback; o merge na `main` é do dono · `confirmado`

## Etapas
- E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-050` e branch `docs/promocao-2026-10-29` a partir da `develop` depois do merge do E5.3 do pedido 051; parecer de review da promoção no diretório de reviews com o nome `050-release-develop.md` (PR × review, riscos, rollback, no molde do parecer de promoção do 037); versão (E2): `package.json` raiz, `CHANGELOG.md` escrito à mão dos Conventional Commits (sem dependência nova) e commit `chore(release)`; commit e push, sem PR.
- E1.2 (qa-engineer): parecer do QA da candidata em `docs/qa/050-release-develop.md`, na worktree 050, com commit e push.
- E1.3 (devops-engineer): parecer de devops da promoção em `docs/devops/050-release-develop.md` (workflows e dependências do diff), na worktree 050, com commit e push.
- E1.4 (security-engineer): parecer de segurança da promoção em `docs/security/050-release-develop.md`, na worktree 050 (sem Bash; o tech-lead o commita no E1.1).
- E1.5 (tech-lead): volta do parecer de review: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (inclui `CHANGELOG.md` e `package.json`), com a leitura desses dois arquivos no parecer; commit e push.
- E1.6 (qa-engineer): volta do parecer de QA: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` e a contagem da abertura corrigida (13 PRs com parecer, 7 isentos); commit e push.
- E1.7 (security-engineer): volta do parecer de segurança: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7`; o próprio security-engineer commita e envia o parecer (o `forge-check pr` exige que quem emitiu o parecer o commite, R-SEGURANCA).
- E1.1 (tech-lead): depois de E1.5 a E1.7, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde.
- E1.8 (devops-engineer): volta do parecer de devops: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (o `forge-check pr` contra a `main` o acusa desatualizado), na worktree 050, em branch nova `docs/050-devops-commit` a partir da `develop`; commit e push, sem PR.
- E1.9 (tech-lead): PR da `docs/050-devops-commit` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde.
- E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8).
- E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão.
- E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8.

## Fora do escopo
- As branches do pedido 048 ainda em andamento (`feature/048-usabilidade`, `feature/048-ajustes-front`, `feature/048-dompurify`; a `feature/048-ajustes-back` já entrou na `develop` pelo #163): não estão prontas, entram numa próxima release · `confirmado`
- Correção do alerta crítico #12 (dompurify, K-178): segue no pedido 048; a `main` já tem o alerta hoje, esta release não o piora · `confirmado`

## Suposições
- "Tudo que estiver pronto" = o que já está mesclado na `develop`; branch sem review e QA aprovados não está pronta · `suposição` · base: R-QA e R-REVIEW (nada sai sem review e QA)
- Número da versão: o `tech-lead` decide pelo SemVer a partir da última tag (há `feat`, então minor) · `técnico` · base: fluxo-homologacao.md §8
- A release não muda interface de forma que peça validação manual além das telas das operacionais e da T14 já vistas no mock · `suposição` · base: CLAUDE.md, "validação manual só quando a release muda a interface"

## Critério de pronto
- PQ-1 PR `develop` → `homolog` mesclado com o portão verde · prova: merge · `técnico`
- PQ-2 tag `-rc` e CHANGELOG na `homolog` · prova: push · `técnico`
- PQ-3 PR `homolog` → `main` aberto, check `homolog-aprovada` verde · prova: pr · `técnico`

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
DECISÃO DO DONO (2026-10-29): "A" (LACUNA R-PROVA): a checagem do Desde fica dispensada nas entregas E1.8, E1.9 e E2.1; PQs, escopo e conteúdo continuam conferidos.

## Histórico
- 2026-10-29 10:10: recibo aceito pelo dono ("isso"): E1 a E3 confirmados como registrados; fora do escopo confirmado.
- 2026-10-29 10:17: DECISÃO TÉCNICA do Jarvis: o forge-check exige pareceres de review, QA, devops e segurança da promoção (o diff toca .github/workflows); etapas refeitas como na promoção do 037 (branch de pareceres para a develop, depois develop → homolog); a versão e o CHANGELOG vão na mesma branch, sem dependência nova.
- 2026-10-29 11:06: base da release atualizada: a develop depois do merge do E5.3 do 051 (O23 sem lacunas), pela prioridade do dono às operacionais; mesmo critério de pronto (mesclado na develop), sem escopo novo.
- 2026-10-29 11:28: brief tech-lead-1 (E1.0, base 311691b) no conferente.
- 2026-10-29 11:34: brief tech-lead-1 (E1.0) aprovado na rodada 2 (rodada 1 reprovada: molde 037 citado na cópia principal); delegado ao forge:tech-lead (sonnet); K-181 em andamento.
- 2026-10-29 11:37: E1.0 entregue pelo tech-lead: review aprovado (89227a2), versão 0.2.0 com CHANGELOG (6aa0ac3), push feito; conferência da entrega em curso. Briefs de devops (E1.3) e segurança (E1.4) aprovados e delegados (sonnet); brief do QA (E1.2) no conferente. O alerta Dependabot 12 citado no push é o dompurify do K-178, fora do 050.
- 2026-10-29 11:38: E1.4 entregue: parecer de segurança aprovado, sem achado bloqueante (A1 react-router 8.5.0 a confirmar no portão; A2 laço de rerun do homolog-reavalia), gravado na worktree 050 sem commit; o tech-lead o commita no E1.1.
- 2026-10-29 11:38: E1.3 entregue: parecer de devops aprovado, sem achado bloqueante (2e322ff, push feito); recomendações: re-run manual do homolog-aprovada nesta release (o homolog-reavalia só vale na main) e rótulo afrouxa-regra do dono no PR que toca .github; conferência da entrega em curso.
- 2026-10-29 11:39: E1.2 entregue: parecer de QA aprovado, 0 bugs (3a20716, push feito); CI da develop em 311691b verde (run 40891567526); ressalva: a frase de abertura conta 12 com parecer e 8 isentos, a tabela dá 13 e 7 (#162 tem parecer 049); não bloqueia.
- 2026-10-29 11:39: entrega conferida 6aa0ac38c35e8298f50511077527368b53ca08f7
- 2026-10-29 11:40: etapas E1.5 a E1.7 acrescentadas (decisão técnica do Jarvis, sem escopo novo): o forge-check pr acusa os pareceres de review, QA e segurança desatualizados (CHANGELOG.md mudou depois de 311691b) e o de segurança sem commit do autor; voltas curtas dos três autores para o commit da versão 6aa0ac3; E1.1 deixa de commitar o parecer de segurança.
- 2026-10-29 11:43: briefs tech-lead-2 (E1.5) e security-engineer-2 (E1.7) aprovados na rodada 1; delegados (sonnet).
- 2026-10-29 11:44: E1.7 entregue: parecer de segurança aprovado sem mudança, commit: 6aa0ac3, commitado pelo autor (83a6ca9), push feito; conferência da entrega em curso.
- 2026-10-29 11:45: E1.5 entregue: review aprovado sem mudança, commit: 6aa0ac3 com a seção Versão 0.2.0 (172cd22), push feito; conferências das entregas E1.5 e E1.7 e brief do QA (E1.6) em curso.
- 2026-10-29 11:46: brief qa-engineer-2 (E1.6) aprovado na rodada 1; delegado (sonnet).
- 2026-10-29 11:47: E1.5 com veredito cumpriu do conferente (172cd22; não é linha de delta, as voltas E1.5 a E1.7 entram juntas no delta desde 6aa0ac3). E1.6 entregue: parecer de QA aprovado, commit: 6aa0ac3, abertura 13/7 (261a3f1), push feito; conferência em curso.
- 2026-10-29 11:52: entrega conferida 261a3f13e2b671cac23afc6035e60d979a43befb
- 2026-10-29 11:52: E1.6 e E1.7 com veredito cumpriu (conferência conjunta das três voltas); forge-check pr rc=0. Ressalva sem bloqueio: a seção Critério do parecer de QA ainda diz 12 e 8 (a abertura e a tabela dizem 13 e 7). Brief tech-lead-3 (E1.1) no conferente.
- 2026-10-29 11:53: brief tech-lead-3 (E1.1) aprovado na rodada 1; delegado (sonnet). K-181 segue em andamento no E1.1.
- 2026-10-29 13:11: E1.1 entregue: PR #165 (promoção → develop, squash, d3095a7) e PR #166 (develop → homolog, merge commit, 485578c) mesclados; portão da homolog verde (run 40905414149) e CI verde (run 40905414183). A1: react-router 8.5.0 travado no lock da homolog (o log do portão não imprime a versão instalada). Conferência em curso.
- 2026-10-29 13:17: reconferência da entrega E1.1 (rodada 2): PQ-1 a PQ-3 cumpriram, escopo e etapa em ordem; pendente: o título do PR #165 não está no imperativo. Já foi mesclado por squash e a develop não se reescreve; fica como ressalva para a retrospectiva, sem nova linha de delta.
- 2026-10-29 13:17: brief tech-lead-4 (E2.1) aprovado na rodada 1 e retido: a tag sai no HEAD da homolog depois do E1.9 (brief novo). Brief tech-lead-5 (E3.1) reprovado: o forge-check pr contra origin/main acusa o parecer de devops com commit 311691b desatualizado (o CHANGELOG mudou depois). DECISÃO TÉCNICA do Jarvis, sem escopo novo: etapas E1.8 (volta do devops) e E1.9 (develop e homolog de novo).
- 2026-10-29 13:18: brief devops-engineer-2 (E1.8) aprovado na rodada 1; delegado (sonnet).
- 2026-10-29 13:20: E1.8 entregue pelo devops-engineer: parecer aprovado sem mudança de veredito, commit: 6aa0ac3 (e42d03f na docs/050-devops-commit, push feito). Conferência da entrega e brief tech-lead-6 (E1.9) no conferente, em paralelo.
- 2026-10-29 13:22: entrega E1.8 com veredito não cumpriu só por forma do delta: PQ-1 a PQ-3 e escopo ok, mas o Desde 261a3f1 não está na branch nova (ela parte do squash d3095a7 do PR 165). Pergunta ao dono: fixar a base do delta em d3095a71653c0ea50d5b0e6ab46b1fcc5727d7ee. E1.9 aprovado e retido até a resposta.
- 2026-10-29 14:46: DECISÃO DO DONO: opção A, a base do delta fixada pelo dono d3095a71653c0ea50d5b0e6ab46b1fcc5727d7ee (develop depois do squash do PR 165), para conferir a E1.8 e o que vem depois.
- 2026-10-29 14:46: base do delta fixada pelo dono d3095a71653c0ea50d5b0e6ab46b1fcc5727d7ee
- 2026-10-29 14:48: reconferência da E1.8 (rodada 2) não cumpriu de novo: o forge-check entrega não aceita como Desde um sha ancestral do Base-sha, e a base fixada pelo dono é o próprio Base-sha. Erro do Jarvis: numa branch nova, a primeira conferência é sem Desde (forge-check entrega sem --desde: intervalo d3095a7..e42d03f, rc=0). A pergunta ao dono não era necessária. Rodada 3 sem Desde.
- 2026-10-29 14:49: E1.8 rodada 3 não cumpriu só por forma: PQ-1 a PQ-3 e escopo ok, branch inteira lida (d3095a7..e42d03f). O conferente exige o Desde da linha mais recente do Histórico, e o forge-check recusa esse sha por ser o próprio Base-sha: a regra não tem saída para branch nova depois de squash. Vai ao dono como lacuna R-PROVA (R-CONFORMIDADE).
- 2026-10-29 15:09: DECISÃO DO DONO: "A": LACUNA R-PROVA registrada para as entregas E1.8, E1.9 e E2.1. O conferente segue conferindo PQs, escopo e conteúdo; só a checagem formal do Desde fica dispensada, porque não tem saída para branch nova depois de squash. Review, QA e portão sem mudança; o merge na main segue do dono. A correção da ferramenta vai ao Forge.
- 2026-10-29 15:09: E1.8 aceita sob a LACUNA R-PROVA (PQ-1 a PQ-3 e escopo cumpridos, rodada 3). E1.9 delegado ao tech-lead (brief tech-lead-6, sonnet).

## Registro de clareza
PERGUNTA: nenhuma
