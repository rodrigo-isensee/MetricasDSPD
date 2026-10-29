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
- E1.1 (tech-lead): commit do parecer de segurança, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde.
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

## Histórico
- 2026-10-29 10:10: recibo aceito pelo dono ("isso"): E1 a E3 confirmados como registrados; fora do escopo confirmado.
- 2026-10-29 10:17: DECISÃO TÉCNICA do Jarvis: o forge-check exige pareceres de review, QA, devops e segurança da promoção (o diff toca .github/workflows); etapas refeitas como na promoção do 037 (branch de pareceres para a develop, depois develop → homolog); a versão e o CHANGELOG vão na mesma branch, sem dependência nova.
- 2026-10-29 11:06: base da release atualizada: a develop depois do merge do E5.3 do 051 (O23 sem lacunas), pela prioridade do dono às operacionais; mesmo critério de pronto (mesclado na develop), sem escopo novo.
- 2026-10-29 11:28: brief tech-lead-1 (E1.0, base 311691b) no conferente.
- 2026-10-29 11:34: brief tech-lead-1 (E1.0) aprovado na rodada 2 (rodada 1 reprovada: molde 037 citado na cópia principal); delegado ao forge:tech-lead (sonnet); K-181 em andamento.
- 2026-10-29 11:37: E1.0 entregue pelo tech-lead: review aprovado (89227a2), versão 0.2.0 com CHANGELOG (6aa0ac3), push feito; conferência da entrega em curso. Briefs de devops (E1.3) e segurança (E1.4) aprovados e delegados (sonnet); brief do QA (E1.2) no conferente. O alerta Dependabot 12 citado no push é o dompurify do K-178, fora do 050.

## Registro de clareza
PERGUNTA: nenhuma
