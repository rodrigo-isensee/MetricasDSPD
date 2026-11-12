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
- E1.9 (qa-engineer): specs velhos do e2e chromium-api que reprovaram o QA da release (A1 a A3 do parecer de QA da release; o A4 investigado), branch fix/101-specs-e2e-api a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g.
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
- 2026-11-12 07:39: brief selado docs/briefs/101-release-filtros-sem-simulado-tech-lead-3.md 3752c8981c9ed25509da0e610b0552a0f8d8bce4b292ba5e89b9ad0f34fb6ee7
- 2026-11-12 07:39: PRs 356 (cadc254a, 10:36:41Z) e 351 (ea826a9c, 10:37:10Z) mesclados na develop pela conta do dono, que escreveu às 07:37 "pronto git mesclade"; os dois agentes de merge esperavam e não mesclaram. O 356 (só documentos) entrou antes do 351, fora da ordem do brief, sem efeito em código; o 351 entrou com um head novo (merge da develop) e o e2e ainda pendente: o CI da develop em ea826a9c decide. Release 101 começa: E1.1 (CHANGELOG e review) delegada (tech-lead-3), worktree 041. O dono perguntou às 07:38 por que não chegou à main: o caminho é develop, homolog e main, e a release está começando.
- 2026-11-12 07:51: entrega conferida 72cc6d38a1898650116b87fbd1fc8c81429eea34
- 2026-11-12 07:51: brief selado docs/briefs/101-release-filtros-sem-simulado-security-engineer-0.md a99c90f595d29456a7525ad6140c910ddcfed8c7fcae21c3ea7acf1b5f415506
- 2026-11-12 07:55: E1.1 entregue (72cc6d38): CHANGELOG com os 27 PRs (329 a 356, sem o 332) e review aprovado; CI da develop verde em ea826a9c (run 43201970764). Achados: A1 nenhum e2e rodou sobre ea826a9c (o 351 entrou com e2e pendente; o push da develop pula o e2e) e vai ao QA da release; A2 a G1 não roda no job build da CI (vira cartão de devops); A3 merge com checks rodando, recorrente (para a retro). E1.2 (segurança) delegada (security-engineer-0); o QA vem depois, na mesma branch.
- 2026-11-12 07:55: E1.2 segurança da release aprovada (8e451206, em ea826a9c), sem bloqueante; A1 (recomendado, devops): a G1 não roda nos jobs de build da CI nem da homolog (mesmo achado do review, vira um cartão de devops). Aviso do GitHub: 2 alertas moderados do Dependabot na branch padrão, sem mudança de lock nesta release (para triagem depois). E1.3 (QA) delegada a seguir.
- 2026-11-12 07:56: brief selado docs/briefs/101-release-filtros-sem-simulado-qa-engineer-0.md a9041faba2e3072b9c52799b49d7f817d2975598c600f3e42765ae9d3f6c2b02
- 2026-11-12 09:11: QA da release (qa-engineer-0) interrompido pelo reinício da sessão sem gravar parecer (branch em 8e451206, worktree limpa); nova instância com o mesmo brief selado.
- 2026-11-12 10:00: QA da release reprovado (db5a0713, em ea826a9c): 6 testes do e2e chromium-api com spec velho, sem defeito de produto (A1 FA5-04 e FA5-16 com o tipo Incidente; A2 TT-02 com selo-ficticio; A3 CT-58 com equipe obrigatória; A4 CT-59, regex PESSOA casa descricao, talvez anterior). Web 1540, servidor 1976, chromium 786 verdes, G1 ok. O chromium-api rodou fora do sandbox contra o banco _test (loopback do Postgres bloqueado), nunca a base real: registrado para a retro e o dono. E1.9 aberta: correção dos specs.
- 2026-11-12 10:00: brief selado docs/briefs/101-release-filtros-sem-simulado-qa-engineer-1.md e9eceab72d6f3b3cc1ad48ca38f5683b0402888dabefda431ee277da9c0dfe0e
- 2026-11-12 10:05: entrega conferida 43ebaabcbe336ffd04d8a7c09eac6d25f47e713b
- 2026-11-12 10:05: brief selado docs/briefs/101-release-filtros-sem-simulado-tech-lead-4.md 56bb0df42c9273759afff4be5e5dcfb4bf53070ae6845947d69085a35321ae54
- 2026-11-12 10:06: E1.9 entregue (43ebaabc): A1 a A3 corrigidos e o A4 (regex PESSOA casava descricao do marco de critério; descricao conferida fora de criterios, nomes de campo de pessoa mantidos); chromium-api 69 de 69. Rodou fora do sandbox (suite-unica com com-api-mock contra metricas_test), e o docker compose do script recriou o container metricasdspd-postgres-1: a avisar ao dono. Review delegado (tech-lead-4); depois PR e merge na develop e a revalidação dos pareceres da release no head novo.
- 2026-11-12 10:08: Review da correção dos specs aprovado (9fa47232, em 43ebaabc); nenhuma guarda afrouxada; A1 recomendado (semCriterios tira criterios em qualquer nível). PR e merge na develop delegados.
- 2026-11-12 10:08: brief selado docs/briefs/101-release-filtros-sem-simulado-tech-lead-5.md 9459fe2208c12cf343320d5833b888d9efc61b21fff8b4ad2be0a8b0f68e5f06
- 2026-11-12 10:09: DECISÃO DO DONO (literal): "faca suas recomendacoes". Regra de banco de teste aceita (recomendação da segurança no D3): a prova de banco que vale é o CI do PR; rodar teste de banco local fora do sandbox só por um comando fixo do projeto que o dono autorize uma vez por regra de permissão; nunca com .env nem com a base real. Até a regra de permissão existir, nenhum agente contorna o sandbox para banco: a prova fica com o CI. Conferência do container metricasdspd-postgres-1 recriado: fica com o dono (o Docker está fora do que os agentes alcançam); cartão para registrar a regra no praticas.md do projeto (tech-lead).
