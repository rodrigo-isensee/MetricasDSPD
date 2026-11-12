# Pedido 101: release da develop para a main (filtros por equipe e busca do 097, nada simulado do 099, correções K-277 a K-292)

- **Modo:** implementar
- **Objetivo:** levar à main o que entrou na develop desde a release 100: os lotes do 097 (busca nos filtros, Equipe no Apontamento e no Resumo, Equipe da Sustentação por slug, Tipo do dado real, tendências com equipe) e do 099 (web sem fonte simulada nem selo, contrato sem campos de simulado, textos novos, guardas G1 a G4, mock fora do build api), e as correções K-277 a K-292, com o PR de homolog para main aberto para o dono pela manhã.
- **Clareza:** 1 confirmado; 1 técnico; 0 suposição; 0 perguntas
- **Origem:** Jarvis, pela meta do dono ("amanha cedo com nada pendente e os prs pra main abertos").

## Escopo
- E1. Release develop para homolog para main, com CHANGELOG, pareceres de release e o PR de homolog para main aberto para o dono · `confirmado`

## Etapas
- E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/101-release.
- E1.2 (security-engineer): parecer de segurança da release, na branch docs/101-release.
- E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/101-release.
- E1.4 (tech-lead): PR da docs/101-release para a develop e merge com os checks verdes.
- E1.5 (tech-lead): PR da develop para a homolog e merge com o portão verde (o merge até a homolog é do time, pela autorização do dono de 17:51).
- E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono.
- E1.7 (agile-coach): retrospectiva curta da release.
- E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041.
- Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch.

## Fora do escopo
- O que ainda não estiver na develop quando a release começar (cartões K-283, K-285, K-287 e seguintes, as perguntas abertas ao dono) · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-12 03:20: pedido aberto pelo Jarvis; começa quando a fila de merges da develop (PRs 345, 347, 350, 351, 352, 353 e o do K-292) terminar com a develop verde. Lição do 093 e do 100: nenhum merge novo na develop durante a release.
- 2026-11-12 05:18: brief selado docs/briefs/101-release-filtros-sem-simulado-tech-lead-0.md c24c42f2aff7a16ca802d2a676774bf3f97be06e3e1c0e785a07820fa6203d8b
- 2026-11-12 05:19: E1.8 (PR só de documentos: revisões de UX e análises da noite, sem commit na árvore principal, e a segunda rodada do UX do 097) delegada ao tech-lead (tech-lead-0), worktree 041, branch docs/101-documentos-da-noite; mescla depois dos PRs 355 e 351. O diagnóstico do QA (docs/qa/bugs) e a nota de devops (docs/devops) ficam para os papéis donos, depois da release.
- 2026-11-12 05:21: entrega conferida 1628d4b755e34615aec0b438a6ddbdcbb68d620f
- 2026-11-12 05:22: brief selado docs/briefs/101-release-filtros-sem-simulado-tech-lead-1.md f33eaa144cad36ab8d8e0926fca48c2fd492e54400899f4099851888f1570779
- 2026-11-12 05:27: brief selado docs/briefs/101-release-filtros-sem-simulado-tech-lead-2.md 7e21f4bf62bd311bcb15a68b81d183a8d241e6f8a536ecdabcbb9e65a24282e9
- 2026-11-12 05:30: Review da E1.8 aprovado (69a5c48e, em 1628d4b7), sem bloqueante. A1 (recomendado): depois do merge, apagar da árvore principal as cópias da primeira rodada da spec e do protótipo do 097, que são antigas e não versionadas (fica com o Jarvis, por ser a árvore do quadro). PR e merge delegados (tech-lead-2), depois dos PRs 355 e 351.
