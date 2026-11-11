# Pedido 093: release do lote 6b (bloqueios reais) para a homolog e a main

- **Modo:** implementar
- **Objetivo:** levar à homolog a develop em c6e5fd8f (PR 298, lote 6b do 075: bloqueios reais no Operacional; PR 302, retrospectivas), para o dono validar o 6b na homolog (o plano do 075 só libera o lote 9a depois dessa validação), e deixar o PR de release homolog para main aberto para o merge do dono.
- **Clareza:** 1 confirmado; 1 técnico; 0 suposição; 0 perguntas
- **Origem:** pergunta do dono "o que falta para termionar as metricas operacionais, acelerato e apontamento?" (2026-11-11) e a fila de trabalho sem o dono; o 6b entrou na develop pelo merge do dono (PR 298, 2026-11-11 09:40).
- **Depende de:** 075-bloqueios-reais (lote 6b na develop)

## Escopo
- E1. A develop em c6e5fd8f vai à homolog por PR com o portão verde e o PR de release homolog para main fica aberto, com review, QA e segurança da release antes · `confirmado`

## Etapas
- E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/093-release.
- E1.2 (security-engineer): parecer de segurança da release, na branch docs/093-release.
- E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/093-release.
- E1.4 (tech-lead): PR da docs/093-release para a develop, CI verde; o merge é do dono.
- E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono ou do tech-lead se o hook deixar (CLAUDE.md).
- E1.6 (dono): validar o 6b na homolog (painel Operacional com os bloqueios reais).
- E1.7 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono.
- E1.8 (agile-coach): retrospectiva curta.
- E1.9 (devops-engineer): desbloqueio do portão da homolog (reexecução dos jobs com navegador que falharam por DNS no runner; se repetir, diagnóstico e correção do runner em PR próprio).

## Fora do escopo
- PRs que entrarem na develop depois da segunda volta (PR 312); os PRs 303 a 310 entraram nesta release (ver Histórico) · `técnico`
- Lotes 9a e 9b do 075 (depois da validação do dono, E1.6) · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-11 09:41: pedido aberto pelo Jarvis com o 6b na develop (c6e5fd8f). Worktree 052h para a branch docs/093-release.
- 2026-11-11 09:41: brief selado docs/briefs/093-release-6b-homolog-tech-lead-1.md fac4a7656598f7bf0d5ce9f095479f1aa88aaf728b51b3919ccbb8aa5422fb2c
- 2026-11-11 09:45: entrega conferida 56e4e8af5bc2086595223797d76a97580e4b86a6
- 2026-11-11 09:46: brief selado docs/briefs/093-release-6b-homolog-security-engineer-1.md 3d1cf876b0278b5237ab10142b681375d28ef0103509508ca4e541618fe6d2bd
- 2026-11-11 09:46: brief selado docs/briefs/093-release-6b-homolog-qa-engineer-1.md 765b5a477b39cd61e1341e463a9bf8ab38f4186e6bcbf0b1ea4ab0e5e6e8ec27
- 2026-11-11 09:59: E1.2 segurança aprovada (e5b17cfd); E1.3 QA aprovado (d2e2d5ec; 0 bugs; pronto local caiu só no server pelo sandbox, K-264; web 1505/1505). Próximo: E1.4 (PR para a develop).
- 2026-11-11 10:00: brief selado docs/briefs/093-release-6b-homolog-tech-lead-2.md e84e1a5f334f5d551f9a8dabb20ff25d94cec51f9a31d15218aad084ddea2863
- 2026-11-11 10:14: a develop andou durante a release: PRs 303 (K-172) e 304 (K-263) mesclados pelo dono (develop 18701297). DECISÃO TÉCNICA (Jarvis): a release 093 passa a levar a develop em 18701297; os dois PRs já têm review, QA e segurança próprios aprovados; depois do PR 299-like da docs/093-release, uma volta curta cobre o delta (CHANGELOG dos PRs 303 e 304, review e segurança do delta, QA na ponta nova) antes da E1.5. ESCOPO+ (técnico): PRs 303 e 304 entram nesta release.
- 2026-11-11 10:20: E1.4: PR 306 (docs/093-release para a develop) aberto, CI verde; o merge é do dono. O delta dos PRs 303 e 304 é conferido no passo da E1.5 (review, segurança e QA próprios já aprovados).
- 2026-11-11 10:30: PRs 305 (K-264), 306 (CHANGELOG e pareceres da release) e 307 (K-121) mesclados na develop pelo dono (9fe4b61f). Próximo: E1.5, com a conferência do delta (303, 304, 305 e 307).
- 2026-11-11 10:32: o forge-check recusa a E1.5: os pareceres da release citam c6e5fd8f e a develop recebeu os PRs 303, 304, 305 e 307 depois deles (pareceres desatualizados). DECISÃO TÉCNICA (Jarvis): volta curta da release na branch docs/093-release-b a partir da develop 9fe4b61f (CHANGELOG do delta, review, segurança e QA regravados), PR para a develop e então a E1.5; pedido ao dono para segurar os PRs 308 e 309 até a promoção.
- 2026-11-11 10:33: brief selado docs/briefs/093-release-6b-homolog-tech-lead-4.md ad4c9aa8fa868deb4284d12b3ce74df82c8a5c79b2f912c42b9bba48e67baa63
- 2026-11-11 10:36: volta E1.1 feita (docs/093-release-b: CHANGELOG 1d1dc74c, review f632f8a6 aprovado; delta sem tocar código de produção). Próximo: segurança e QA da volta.
- 2026-11-11 10:36: brief selado docs/briefs/093-release-6b-homolog-qa-engineer-2.md f24149f0960def2fc6e048f662ef02fd2e94943ef5a9600bcc71d285ee6fe186
- 2026-11-11 10:36: brief selado docs/briefs/093-release-6b-homolog-security-engineer-2.md eb9ee54eb7be61f6d2852b092eeb485e7feb8d57be2052eab8f749b8c9306364
- 2026-11-11 10:39: volta E1.2 segurança aprovada (9bbf0e80; K-263 com patch idêntico ao revisado; K-264 sem credencial no filho). Próximo: QA da volta (pronto na ponta 9fe4b61f).
- 2026-11-11 10:48: volta E1.3 QA aprovado (f7c556a1; pronto rc=0 no sandbox; 0 bugs). Próximo: PR da docs/093-release-b para a develop (E1.4 da volta).
- 2026-11-11 10:48: brief selado docs/briefs/093-release-6b-homolog-tech-lead-5.md ad979490758cd4f4ed8c710acd8b2a53527a485b6ea4f5fb18a858f29716ff5b
- 2026-11-11 10:54: PR 308 (K-265, só documentação) mesclado na develop pelo dono (87eaef8f) durante a release; se o parecer de review da release vencer de novo, a volta atualiza só o review (delta só de documentação).
- 2026-11-11 10:58: PR 309 (K-266) mesclado na develop pelo dono. PR 311 (volta da release, docs/093-release-b) e PR 310 (K-267) abertos. DECISÃO TÉCNICA (Jarvis): depois do merge dos PRs 310 e 311 pelo dono, uma só atualização dos pareceres da release cobre os PRs 308, 309 e 310 (só testes e documentação) e então a E1.5; pedido ao dono para não mesclar mais nada na develop até a promoção.
- 2026-11-11 11:01: PR 311 (volta) e PR 310 (K-267) mesclados pelo dono (develop 7b2325a9). O forge-check ainda recusa o review e o QA da release (os PRs 308 a 310 vieram depois); a segurança vale. DECISÃO TÉCNICA (Jarvis): segunda volta só de review e QA na branch docs/093-release-c a partir da develop 7b2325a9; depois PR para a develop e a E1.5.
- 2026-11-11 11:02: a segunda volta leva também as notas dos PRs 308, 309 e 310 ao CHANGELOG (o parecer cita o commit do CHANGELOG da volta); cartão K-204, o do lote 6b que esta release leva.
- 2026-11-11 11:02: brief selado docs/briefs/093-release-6b-homolog-tech-lead-6.md 02c181f0cbfb7aa304a2aaf47aa8ca2a4e7c39b07e3bb92e4171a8b2d18f79eb
- 2026-11-11 11:05: segunda volta E1.1: CHANGELOG 773876f7 e review da311afa aprovado (develop 7b2325a9; delta 308 a 310 igual ao revisado; 6b intacto). Próximo: QA da segunda volta.
- 2026-11-11 11:06: brief selado docs/briefs/093-release-6b-homolog-qa-engineer-3.md a0859de359ab1f571cf145b959613d4897a1ad2707c8dbcf14a2cabd2039d52f
- 2026-11-11 11:23: segunda volta E1.3 QA aprovado (24aacfd1; pronto rc=0 no sandbox; 0 bugs). Próximo: PR da docs/093-release-c para a develop.
- 2026-11-11 11:24: ESCOPO+ (técnico): os PRs da release levam no corpo o aviso ao dono para a validação da E1.6: no Operacional da homolog, os bloqueios reais (BLOQUEADOS, O1, O2, O5 e O19) e o corte da série do O1 em 2026-11-01 (achado dos pareceres de review e QA da release).
- 2026-11-11 11:24: brief selado docs/briefs/093-release-6b-homolog-tech-lead-7.md d142e4d44569891dfbcb271d7c42c603d4941e0df548144506964b9aed993f2e
- 2026-11-11 11:32: PR 312 (segunda volta) mesclado pelo dono (develop d8d52103); o forge-check libera a E1.5. Próximo: PR da develop para a homolog.
- 2026-11-11 11:34: brief selado docs/briefs/093-release-6b-homolog-tech-lead-8.md ffee98980165c3631a77aaa609fef92de206c97421581f54950ffc9eb5c56363
- 2026-11-11 11:51: DECISÃO DO DONO (literal): "pronto mesclei". E1.5: PR 313 (develop d8d52103 para a homolog) mesclado pelo dono (homolog 4803081e). Próximo: E1.6 (validação do dono do 6b na homolog) e E1.7 (PR de release homolog para main, aberto).
- 2026-11-11 11:52: o PR 313 foi mesclado com e2e-parte 1/2, 2/2 e perf pendentes (falha de DNS do runner no playwright install-deps; reexecução pedida pelo tech-lead). O portão da homolog em 4803081e é a prova antes do PR de release para a main.
- 2026-11-11 11:53: brief selado docs/briefs/093-release-6b-homolog-tech-lead-9.md eb040f4350f56283fb845134f03053b7282ae4579f193c60244a7c9a11f04f98
- 2026-11-11 12:06: E1.7: PR 314 (homolog 4803081e para main) aberto pelo tech-lead; homolog-aprovada vermelho porque o portão da homolog falhou só nos jobs com navegador por DNS no runner Ubuntu 26 (Failed to install browser dependencies, security.ubuntu.com). DECISÃO TÉCNICA (Jarvis): o devops reexecuta os jobs que falharam e, se repetir, diagnostica a imagem do runner (correção em PR próprio).
- 2026-11-11 12:08: brief selado docs/briefs/093-release-6b-homolog-devops-engineer-1.md 873f49cf63421183e0512e759e68e8d5f57539b6b3603fd46ad72dbfe14b63e8
- 2026-11-11 12:13: DECISÃO DO DONO (literal): "feito mas tive que dar bypassa veja senao subiu um erro". PR 314 (homolog para main) mesclado pelo dono com bypass da proteção (main c9354a82), com o homolog-aprovada vermelho só pela falha de DNS do runner nos jobs com navegador; rapida, testes, banco, build, openapi, imagem e seguranca tinham passado. A reexecução do portão (run 43042533708) segue com o devops como prova. PR 315 (retrospectivas 091 e 092) mesclado na develop. Falta confirmar com o dono a validação do 6b (E1.6) antes dos lotes 9a e 9b.
- 2026-11-11 12:22: E1.9: duas reexecuções falharam pelo mesmo DNS do apt no runner Ubuntu 26.04 (diagnóstico em docs/devops/093-runner-ubuntu26-dns.md, sem commit). A correção vai no pedido 095 (K-269): jobs com navegador no ubuntu-24.04, push do workflow pelo dono. A release já está na main pelo merge do dono com bypass; a prova dos testes com navegador sobre ela fica para depois do 095.
- 2026-11-11 12:37: apontamento (pedido 089) implantado na base local da demo (origin/main c9354a82) pela sessão "WSL ativação" a pedido do dono: versão de referência 2026-11-10-v3 vigente desde 2026-11-11, critérios 059, 067 e 089 gravados, carga inicial desde 2025-11-11 com 49.501 registros, 0 inválidos, 0 falhas; a repetição não duplicou nada. Achados: o passo de critérios não carrega o .env sozinho (vira K-270, pedido 096); api e web da demo seguem paradas depois do reinício do WSL (o Postgres foi religado).
