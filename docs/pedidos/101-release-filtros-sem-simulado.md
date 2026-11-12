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
- Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch.

## Fora do escopo
- O que ainda não estiver na develop quando a release começar (cartões K-283, K-285, K-287 e seguintes, as perguntas abertas ao dono) · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-12 03:20: pedido aberto pelo Jarvis; começa quando a fila de merges da develop (PRs 345, 347, 350, 351, 352, 353 e o do K-292) terminar com a develop verde. Lição do 093 e do 100: nenhum merge novo na develop durante a release.
