# Pedido 092: melhorias técnicas da fila (K-121, K-172, K-174)

- **Modo:** implementar
- **Objetivo:** tocar três cartões técnicos de "Pronto para fazer" que não dependem do dono, em paralelo e sem arquivo em comum.
- **Clareza:** 0 confirmado; 3 técnico; 0 suposição; 0 perguntas
- **Origem:** fila de trabalho sem o dono ("nao fique parado. Continue a fila de trabalho agora", assistente do app a pedido do dono, 2026-11-11; "continue", dono, 2026-11-11).

## Escopo
- E1. K-121: os 10 documentos antigos de docs/qa e docs/architecture sem frontmatter (ADR 0004) ganham o frontmatter, para o `forge-check docs` parar de acusar erro antigo e esconder achado novo · `técnico`
- E2. K-172: `docs/engineering/praticas.md` (seção 9, "Autores") diz "`pnpm run pronto` verde antes de cada commit"; alinhar o texto à decisão do dono de 2026-10-21 (pronto completo uma vez, antes do commit final), sem afrouxar · `técnico`
- E5. K-264: os testes de CLI do server (apontamento-entradas e ref-sync-*-entrada) rodam o processo filho com env só com PATH; o tsx não acha pasta temporária gravável no sandbox e 31 testes falham no pronto local; passar a pasta temporária ao filho, sem afrouxar o isolamento do K-261 · `técnico`
- E6. K-268: o caso do mock criado uma só vez em web/src/features/coleta/simulado.test.tsx é intermitente no CI (selo-simulado-O12 não aparece a tempo); estabilizar sem timeout nem retry · `técnico`
- E3. K-174: o teste de `tools/docs-contratos` "as páginas geradas coincidem com o código" (insumos.test.ts) estoura o timeout de 5 s sob carga e derruba o pronto; deixá-lo mais barato, sem aumentar timeout nem retry · `técnico`

## Etapas
- E1.1 (qa-engineer): K-121, frontmatter nos 8 documentos de docs/qa que o forge-check docs acusa, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041.
- E1.4 (tech-lead): K-121, frontmatter em docs/reviews/front-via-api.md, na mesma branch, depois da E1.1.
- E1.5 (software-architect): K-121, frontmatter em docs/architecture/features/front-via-api.md, na mesma branch (o tech-lead leva o arquivo ao commit).
- E2.1 (tech-lead): K-172, na branch docs/k172-pronto-praticas, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b.
- E3.1 (node-backend): K-174, na branch fix/k174-insumos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052c (primeira tentativa em fix/k174-docs-contratos-carga, 052g, sem PR).
- E1.2 (tech-lead): review do K-121.
- E1.3 (tech-lead): PR do K-121 para a develop; o merge é do dono.
- E2.2 (tech-lead): review do K-172.
- E2.3 (tech-lead): PR do K-172 para a develop; o merge é do dono.
- E3.2 (tech-lead): review do K-174.
- E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T).
- E3.4 (tech-lead): PR do K-174 para a develop; o merge é do dono.
- E3.5 (software-architect): plano do K-174: tornar mais barato o cálculo de tempo da biblioteca compartilhada (packages/metricas/src/core/calendario.ts: horasUteisEntre, diaDeIso, ehDiaUtil) e o gerarBaseMock, sem mudar nenhum resultado, com o efeito no servidor e a forma de provar; só leitura, parecer em docs/analises/, sem commit.
- E5.1 (node-backend): K-264, na branch fix/k264-cli-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052g.
- E5.2 (tech-lead): review do K-264.
- E5.3 (qa-engineer): QA do K-264.
- E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono.
- E6.1 (react-frontend): K-268, teste intermitente de simulado.test.tsx, na branch fix/k268-simulado-intermitente, worktree /home/rodrigoisensee/MetricasDSPD-052d.
- E6.2 (tech-lead): review do K-268.
- E6.3 (qa-engineer): QA do K-268.
- E6.4 (tech-lead): PR do K-268; o merge é do dono.
- E4.1 (agile-coach): retrospectiva curta.
- E4.2 (tech-lead): review e envio das retrospectivas do 091 e do 092 (worktree 052g, branch docs/retros-2026-11-11b): parecer de review, commit, push e PR para a develop; o merge é do dono.

## Fora do escopo
- Outros testes com orçamento de tempo sob carga (K-175, K-120) · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-11 09:05: pedido aberto pelo Jarvis com três cartões técnicos sem arquivo em comum (lote de até 3 tópicos); worktrees 041 (K-121), 041b (K-172) e 052g (K-174), todas a partir da develop 6e42dfb8.
- 2026-11-11 09:12: DECISÃO TÉCNICA (Jarvis): E1 (K-121) adiado nesta rodada: o tech-lead não grava em docs/qa (é do qa-engineer) e os documentos de docs/architecture são do software-architect; volta dividido por papel numa próxima rodada. Seguem E2 (K-172) e E3 (K-174).
- 2026-11-11 09:12: brief selado docs/briefs/092-melhorias-tecnicas-fila-node-backend-1.md 4fb59f7806ae56c78c2cfa4782e3e12eca2d374af9ff75265ccc3ec62bb68533
- 2026-11-11 09:13: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-2.md f687c2791f002e96c8eb18f3a47e7eb871937c7675ac96d41679676920d8236b
- 2026-11-11 09:15: entrega conferida 87079bef3a22cd3215d99576fd96a1d38e04f068
- 2026-11-11 09:20: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-3.md 93f72033d69783a02d6370cce13290d6317211e334fc1e838c805e236be40c40
- 2026-11-11 09:22: E3.1 (K-174) entregue pelo node-backend (e90993ee, só o teste: leitura com cache), mas a causa não foi reproduzida: o caso gasta 26 a 67 ms; o custo real é o carregarInsumos no nível do módulo (cerca de 1,2 s a frio), fora do timeout do caso e no código de produção, fora do brief. Ganho medido dentro do ruído. DECISÃO TÉCNICA (Jarvis): a branch fix/k174-docs-contratos-carga fica sem PR (mudança sem efeito medido não entra); E3.2 a E3.4 não seguem nesta rodada; o K-174 volta a Pronto para fazer com a pista (tornar o carregarInsumos mais barato no gerador, com novo brief). Pronto do autor caiu só no server por K-264.
- 2026-11-11 09:23: E2.2: review do K-172 aprovado (7ce0d7c5); A1 recomendado: docs/engineering/guia-do-desenvolvedor.md:44 ainda diz pronto antes de cada commit; vira o cartão K-265. Próximo: E2.3 (PR).
- 2026-11-11 09:24: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-4.md 573b12d4a11da21e6589f678d7f0e18651add0a69b54b20904aa1316d9840e4f
- 2026-11-11 09:25: ESCOPO+ (técnico): E5 (K-264) entra no lugar do K-174 nesta rodada (worktree 052g na branch fix/k264-cli-tmpdir a partir da develop); destrava o pronto local de todas as entregas.
- 2026-11-11 09:27: brief selado docs/briefs/092-melhorias-tecnicas-fila-node-backend-2.md d364db53bccd74522cd6d82b155ad417b290c3025fbd3cbb0d4d76ecff61be23
- 2026-11-11 09:33: DECISÃO TÉCNICA (Jarvis): o E1 (K-121) volta dividido por papel (8 em docs/qa com o qa-engineer, 1 em docs/reviews com o tech-lead, 1 em docs/architecture com o software-architect), em série na branch docs/k121-frontmatter; fila de trabalho sem o dono.
- 2026-11-11 09:33: brief selado docs/briefs/092-melhorias-tecnicas-fila-qa-engineer-1.md fb1881c73bb9f0948d19d8999e3d15509e3d25aee272061b550a1e7253b4c224
- 2026-11-11 09:36: E1.1 (K-121) entregue pelo QA (32d41e80): os 8 de docs/qa com frontmatter, forge-check docs sem erro neles. Atenção para o review: o validador só aceita parecer aprovado ou reprovado e commit em hexadecimal, e 7 dos 8 (planos, medições e diagnósticos sem veredito) receberam parecer aprovado e bugs zero sem terem veredito próprio; o review decide se isso é aceitável ou se o certo é tirar esses documentos do alcance do validador (melhoria ao Forge: parecer n/a quando escopo plano). docs:check não rodou (worktree sem node_modules).
- 2026-11-11 09:36: entrega conferida 6d2e15be27630e6f75d21ddb7876f7b3ed18b074
- 2026-11-11 09:37: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-5.md 23b5458e0d45a190d4e18a82e5c61e813399597664a0ea25ea03805db4f5bef4
- 2026-11-11 09:40: E5.1 (K-264) entregue (6d2e15be; pronto rc=0 no sandbox; 31 falhas antes, 0 depois), entrega conferida; E5.2 review aprovado (3b3affe9; A1: seed-recusa-real.pg.test.ts:108 tem o mesmo padrão, vira cartão). Próximo: E5.3 (QA).
- 2026-11-11 09:40: brief selado docs/briefs/092-melhorias-tecnicas-fila-qa-engineer-2.md 460866717adec64a369172f241093da92ac490d658689e45b18b32ec6eadb894
- 2026-11-11 09:42: E5.3 QA do K-264 aprovado (1c7ec288; 0 bugs; mutação sem a pasta temporária derruba 31 testes). Próximo: E5.4 (PR).
- 2026-11-11 09:43: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-6.md 3553c93a2cb34b6127b4c0a847e3f792c78a7964347e11784940a94b18b5a767
- 2026-11-11 09:44: E2.3: PR 303 (K-172) aberto, checks verdes; o merge é do dono, depois da release 093 (develop congelada).
- 2026-11-11 09:54: brief selado docs/briefs/092-melhorias-tecnicas-fila-software-architect-1.md 8a0dc12ba84fd1acdac1a8d9a3414b4e28191f008ae2e6d05738d0f1547f6b1a
- 2026-11-11 09:55: E1.5 (K-121, arquiteto): frontmatter contrato: 0 em docs/architecture/features/front-via-api.md (sem commit; documento anterior ao contrato, como os outros planos da pasta). DECISÃO TÉCNICA (Jarvis): o QA volta aos 8 de docs/qa para usar contrato: 0 no lugar dos campos inventados (parecer aprovado e bugs zero sem veredito), forma honesta que o validador aceita.
- 2026-11-11 09:56: brief selado docs/briefs/092-melhorias-tecnicas-fila-qa-engineer-3.md d5232473f3c0cfdf31d5a49d0531ab6e86aad21bc9d29467e5a54aa62aa15e4c
- 2026-11-11 09:58: E1.1 (volta): os 8 de docs/qa com contrato: 0 (b4c5f702), sem campo inventado; nenhum dos 8 tem pedido e commit escritos para o frontmatter completo. Próximo: E1.4 (tech-lead).
- 2026-11-11 09:59: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-7.md 5bf2677efe024f57c1281d16766ae90a2d869d30163fbb6803181858d52672d2
- 2026-11-11 10:01: E1.4/E1.5 (K-121): docs/reviews/front-via-api.md com contrato: 0 e o arquivo do arquiteto, commit 80bfc064; os 10 documentos saíram do forge-check docs. Próximo: E1.2 (review).
- 2026-11-11 10:01: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-8.md b4bc568bc9508b8a1c79a84fc41317c7544c471b3013eda41dea6e5ebe840b79
- 2026-11-11 10:03: E1.2 review do K-121 aprovado (8ccf2196; A1: linha em branco depois do frontmatter só nos 8 de docs/qa). Próximo: E1.3 (PR).
- 2026-11-11 10:04: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-9.md 845066d4c1a6550e912278032649077d0ef0abe731e8f4f96ff2b58d6c3c70fb
- 2026-11-11 10:19: E5.4: PR 305 (K-264) aberto, CI verde, CLEAN (a branch recebeu um merge da develop pela conta do dono às 09:57; patch igual, pareceres valem). O merge é do dono.
- 2026-11-11 10:30: PRs 303 (K-172), 305 (K-264) e 307 (K-121) mesclados na develop pelo dono. Falta: retrospectiva (E4.1); o K-174 voltou à fila.
- 2026-11-11 10:57: brief selado docs/briefs/092-melhorias-tecnicas-fila-agile-coach-1.md 8388ce76a1f094a6852844fca022f7bd08b88eb1115620c6644a89be222323a3
- 2026-11-11 10:58: E4.1: retrospectiva escrita pelo agile-coach (052g, branch docs/retros-2026-11-11b, sem commit; o envio vai depois da promoção da release 093, com a do 091). 15 briefs, 0 reprovados; 0 devoluções; 7 linhas MELHORIA (2 vão ao Forge). Pedido 092 fecha com a retrospectiva gravada; K-174 volta à fila.
- 2026-11-11 11:14: DECISÃO TÉCNICA (Jarvis): o K-174 volta com a pista da primeira tentativa (custo no carregarInsumos, código do gerador), na branch fix/k174-insumos-carga (worktree 052c) a partir da develop 7b2325a9; o PR vem depois da release 093 (develop congelada).
- 2026-11-11 11:15: brief selado docs/briefs/092-melhorias-tecnicas-fila-node-backend-3.md 27a5bc66cf3c7a9e8a7ea9610c3c7230552f7af46d24d4a7564b6d76c6261531
- 2026-11-11 11:17: E3.1 (K-174, segunda tentativa) parado sem mudança: o custo (cerca de 0,9 a 1,4 s a frio) está na biblioteca compartilhada de tempo (packages/metricas/src/core/calendario.ts: horasUteisEntre, diaDeIso e ehDiaUtil, cerca de 300 ms) e no gerarBaseMock (cerca de 210 ms), não no insumos.ts. DECISÃO TÉCNICA (Jarvis): não mexer na biblioteca de tempo (T2.5, compartilhada com o servidor) só para encurtar um teste; o K-174 volta à fila com o perfil e o próximo passo é um plano do software-architect (memoização do calendário, efeito no servidor). Branch fix/k174-insumos-carga sem commit.
- 2026-11-11 11:53: ESCOPO+ (técnico): E4.2 leva as retrospectivas do 091 e do 092 à develop num só PR, com o review no mesmo envio, depois da promoção da release 093 à homolog.
- 2026-11-11 11:54: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-10.md 1d93468325ae6237471e40e64ead555251266c7411ea33b41a8f6959020c4259
- 2026-11-11 12:00: ESCOPO+ (técnico): E3.5, plano do arquiteto para o K-174 antes de qualquer mudança na biblioteca de tempo (T2.5).
- 2026-11-11 12:00: brief selado docs/briefs/092-melhorias-tecnicas-fila-software-architect-2.md ae5df4d88b6dc64d43292458e595ea7ff06cc842ab960aed6130f8b0d0b661aa
- 2026-11-11 12:04: E3.5 plano do K-174 entregue (docs/analises/092-k174-plano.md, sem commit; PQ-1 conferido pelo Jarvis, rc=0): lote 1 com feriados guardados como número de dia, lote 2 só se a medição pedir; critério de parada: reproduzir o estouro antes de mudar, ganho de 30% e estouro sumir sob carga. Sem pergunta ao dono. Próximo: implementação do lote 1 pelo node-backend, quando houver vaga.
- 2026-11-11 12:07: DECISÃO TÉCNICA (Jarvis), substitui a de 11:17 para o K-174: com o plano do arquiteto (docs/analises/092-k174-plano.md), o lote 1 mexe na biblioteca de tempo só para ganho medido e com prova de resultado igual bit a bit; e só segue se o estouro for reproduzido antes (critério de parada do plano, mais restrito).
- 2026-11-11 12:07: brief selado docs/briefs/092-melhorias-tecnicas-fila-node-backend-4.md a8fb06a617fc90d116cf75959dd6b84ea1b6893cda2d10386f4313478a5807d0
- 2026-11-11 12:08: E4.2: retrospectivas do 091 e do 092 commitadas (e4826523), review aprovado (fe257e59; A1 a A3 recomendados) e PR 315 aberto; CI vermelha por instabilidade, não pela mudança: simulado.test.tsx (selo-simulado-O12, intermitente, vira K-268) e e2e-parte pelo apt do Playwright (mesma falha de DNS do runner que o devops trata na E1.9 do 093). O merge é do dono.
- 2026-11-11 12:09: ESCOPO+ (técnico): E6 (K-268), teste intermitente visto nos PRs 311 e 315; worktree 052d na branch fix/k268-simulado-intermitente a partir da develop d8d52103.
- 2026-11-11 12:12: brief selado docs/briefs/092-melhorias-tecnicas-fila-react-frontend-1.md cf39317485559ca5ae42030c36cdb28c15a80fe7615e845e2732d934fa5cb84d
- 2026-11-11 12:24: E6.1 (K-268) primeira rodada parou sem commit: a mudança (esperar o cartão do O12 sair do carregando) ficou na worktree 052d; 1 falha em 30 sem caso identificado. Nova rodada para achar e tratar a falha restante.
- 2026-11-11 12:25: brief selado docs/briefs/092-melhorias-tecnicas-fila-react-frontend-2.md 789560725046e4a2b1c4623432f88a1ede6339609fce3352123e3dd0ad422e6c
- 2026-11-11 12:30: E3.1 (K-174, lote 1) entregue (e722029a): -34% no carregarInsumos a frio, resultados iguais bit a bit, pronto verde. O estouro reproduzido (4/6 sob carga extrema) caiu para 2/6, sem sumir; o caso que estoura é o insumos-removida.test.ts, que chama o carregarInsumos dentro do caso. DECISÃO TÉCNICA (Jarvis): o lote 1 segue para review, QA e PR pelo ganho medido; o caso do insumos-removida vira o próximo passo do K-174 (carregar uma vez fora do caso), em cartão próprio; o lote 2 do plano não entra agora.
- 2026-11-11 12:30: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-11.md ba1961aabc3ad439ada95661c7716b11864edc54914d1ac9f2699b24e6c46067
- 2026-11-11 12:31: E6.1 (K-268) entregue (52aa703d; 30/30 verdes; a falha da rodada anterior não se reproduziu). Próximo: E6.2 (review).
- 2026-11-11 12:32: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-12.md 21713a2effce52923524a98934b3b84479e54b4b130a7852fd7b24c797f75230
- 2026-11-11 12:34: E6.2 review do K-268 aprovado (41ce5e3d, sem achados). Próximo: E6.3 (QA).
- 2026-11-11 12:35: E3.2 review do K-174 aprovado (3ec5fbe1, sem achados; teto excedido, 250 linhas, quase tudo teste de equivalência). Próximo: E3.3 (QA).
- 2026-11-11 12:35: brief selado docs/briefs/092-melhorias-tecnicas-fila-qa-engineer-4.md 0a34e5612b0c3077580986e1197f6a1e6ada6e43d5d8dbe779fb95f898e52ca8
- 2026-11-11 12:36: brief selado docs/briefs/092-melhorias-tecnicas-fila-qa-engineer-5.md 693752a43a5f9b0de785b5aa1a5d4ff880eda2e0edf50450c5d4a9a1f3b75459
- 2026-11-11 12:43: E6.3 QA do K-268 aprovado, 0 bugs (a20b357c; 20 de 20 com 2 workers; 2 mutantes mortos). ERRO-JARVIS: a entrega do código (52aa703d) não foi conferida às 12:31; agora o forge-check entrega confere contra o brief mais recente da branch (o do QA) e acusa o arquivo de teste como fora do declarado. DECISÃO TÉCNICA (Jarvis): o brief do PR (E6.4) declara os três arquivos da branch e a conferência roda contra ele.
- 2026-11-11 12:43: E3.3 QA do K-174 lote 1 aprovado (9efaf446): 1299 testes, cobertura 100%, hash da base mock igual, 2 mutantes mortos; tempo a frio do carregarInsumos 1268 para 1189 ms (cerca de -6%, máquina com load 2,6) e geração do mock 245 para 187 ms (-24%); não reproduziu os -34% do autor nem o limiar de 30% do plano (A1 recomendado). DECISÃO TÉCNICA (Jarvis): o lote 1 segue para PR (resultado bit a bit igual, ganho real menor que o medido pelo autor, declarado no PR); o tech-lead decide no PR se o lote 2 vem ou se o limiar muda.
- 2026-11-11 12:45: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-16.md ceda0ef8acac9557617187687a576fccdb1f1f99f2bfd33b070962a3b957eaea
- 2026-11-11 12:45: brief selado docs/briefs/092-melhorias-tecnicas-fila-tech-lead-14.md 4d17286823a3c98be0aaf07084ef8d0de246705fc13702e1e4825c93be459879
- 2026-11-11 12:46: entrega conferida a20b357c63e2302e552034f7984c07ba011c43c1
- 2026-11-11 12:46: entrega conferida 9efaf4460995a7b12323b22b24a76e325d6bcac7
- 2026-11-11 13:00: E3.4 PR 316 (K-174 lote 1) aberto pelo tech-lead, head 759a9f2a (merge da develop, sem rebase); checks verdes menos e2e-parte 1/2 e 2/2, que caem pelo DNS do runner Ubuntu 26.04 (corrige o pedido 095). Decisão do tech-lead sobre o A1 do QA: o lote 2 vem (opção B do plano), o K-174 não fecha com o lote 1. DECISÃO TÉCNICA (Jarvis): o lote 2 vira etapa nova do K-174, medida antes e depois com mediana de 10 processos novos e sem outros agentes rodando; por isso fica para uma janela com a máquina parada, depois dos PRs em curso. O PR 316 espera o 095 na develop para o e2e ficar verde; o merge é do dono.
