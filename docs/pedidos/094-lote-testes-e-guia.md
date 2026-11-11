# Pedido 094: lote técnico (K-265, K-266, K-267)

- **Modo:** implementar
- **Objetivo:** três cartões técnicos sem arquivo em comum, vistos nos reviews da manhã, tocados em paralelo enquanto a release 093 espera o dono.
- **Clareza:** 0 confirmado; 3 técnico; 0 suposição; 0 perguntas
- **Origem:** fila de trabalho sem o dono ("nao fique parado. Continue a fila de trabalho agora", assistente do app a pedido do dono, 2026-11-11).

## Escopo
- E1. K-265: `docs/engineering/guia-do-desenvolvedor.md` (linha 44) ainda diz rodar `pnpm run pronto` antes de cada commit; alinhar à decisão do dono de 2026-10-21 (pedido 026, linha 40), como o K-172 fez em praticas.md · `técnico`
- E2. K-266: `server/tests/seed-recusa-real.pg.test.ts` (linha 108) roda o processo filho sem a pasta temporária, o mesmo padrão corrigido no K-264; usar o ajudante `server/tests/ajuda-cli-filho.ts` · `técnico`
- E3. K-267: o teste S6 de `server/tests/painel-real-f6.test.ts` (linha 339) procura dado de pessoa por uma regex que não cobre "bloqueado por", "quem", "comentário" e "observação", que o modelo de ameaças do 075 cita (A1 da segurança do 6b e da release 093) · `técnico`

## Etapas
- E1.1 (tech-lead): K-265, na branch docs/k265-guia-pronto, worktree /home/rodrigoisensee/MetricasDSPD-052c.
- E2.1 (node-backend): K-266, na branch fix/k266-seed-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052d.
- E3.1 (node-backend): K-267, na branch fix/k267-regex-pessoa, worktree /home/rodrigoisensee/MetricasDSPD-052f.
- E1.2 (tech-lead): review do K-265.
- E2.2 (tech-lead): review do K-266.
- E3.2 (tech-lead): review do K-267.
- E2.3 (qa-engineer): QA do K-266.
- E3.3 (qa-engineer): QA do K-267.
- E1.3 (tech-lead): PR do K-265; o merge é do dono.
- E2.4 (tech-lead): PR do K-266; o merge é do dono.
- E3.4 (tech-lead): PR do K-267; o merge é do dono.
- E4.1 (agile-coach): retrospectiva curta.

## Fora do escopo
- Outros testes com processo filho fora dos citados · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-11 10:15: pedido aberto pelo Jarvis; worktrees 052c, 052d e 052f a partir da develop 18701297.
- 2026-11-11 10:16: DECISÃO TÉCNICA (Jarvis): no E2 (K-266), como o ajudante ajuda-cli-filho só existe na branch do K-264 (PR em aberto), o ajuste vai local no próprio arquivo, do mesmo jeito do ajudante; quem integrar depois do K-264 troca pelo ajudante.
- 2026-11-11 10:16: brief selado docs/briefs/094-lote-testes-e-guia-node-backend-1.md 82606d1e019c22acaea53a1dc2b01c7f3359dcb52ca3ef7e3c7a692649c5245f
- 2026-11-11 10:17: brief selado docs/briefs/094-lote-testes-e-guia-node-backend-2.md c56f7141a2860c0f3389acd9de731bc38c7f94c449d16a5235744c704a789196
- 2026-11-11 10:17: brief selado docs/briefs/094-lote-testes-e-guia-tech-lead-1.md 541168a1055357dc376a43055e9762ce3be9219e38b9caa9a2cdc9d2fcee62f7
- 2026-11-11 10:18: E1.1 (K-265) entregue (26511df5; só a linha 44 do guia; docs:check ok). Próximo: E1.2 (review).
- 2026-11-11 10:18: E2.1 (K-266) entregue (1d7c4291; 1 linha; tsc ok; o .pg roda no CI). Próximo: E2.2 (review).
- 2026-11-11 10:19: brief selado docs/briefs/094-lote-testes-e-guia-tech-lead-3.md 25b8433000423e3fb805911710898f5316a69528f4b8030f738357d870039954
- 2026-11-11 10:19: brief selado docs/briefs/094-lote-testes-e-guia-tech-lead-2.md 0117d02ed9547008b6e5c159360aa22a5f8b1f10e82eb19b4c23cc99b2709645
- 2026-11-11 10:21: E1.2 review do K-265 aprovado (d1d28369, sem achados). Próximo: E1.3 (PR).
- 2026-11-11 10:22: E2.2 review do K-266 aprovado (52427ad2; A1: trocar pelo ajudante quando os dois estiverem na develop). Próximo: E2.3 (QA).
- 2026-11-11 10:22: brief selado docs/briefs/094-lote-testes-e-guia-tech-lead-4.md 927cb279397f370cf24203881663779e0e9a0a00137ce773d001aa1987d6ba36
- 2026-11-11 10:23: brief selado docs/briefs/094-lote-testes-e-guia-qa-engineer-1.md e52ed4811bd2d0866005a643281363363c6081081c550b699bf9855646752b89
- 2026-11-11 10:25: E2.3 QA do K-266 aprovado (34b29e9a; 0 bugs; o .pg roda no CI). Próximo: E2.4 (PR).
- 2026-11-11 10:26: brief selado docs/briefs/094-lote-testes-e-guia-tech-lead-5.md 6b1cee00c5fd11a04461a432fa694353351499686cf7f681927298f6a0fb4dee
- 2026-11-11 10:34: entrega conferida 9f4ecf9923e4aa567e26649346fa5f8f18d63db3
- 2026-11-11 10:34: E3.1 (K-267) entregue (9f4ecf99; regex ampliada e caso S6b; 39/39 no arquivo; sem vazamento real). Próximo: E3.2 (review).
- 2026-11-11 10:35: brief selado docs/briefs/094-lote-testes-e-guia-tech-lead-6.md fc8321b5714d2dc8698e285a99dc0dad1259e62c472294235629beb84e06999b
- 2026-11-11 10:37: E3.2 review do K-267 aprovado (aa4f287d). DECISÃO TÉCNICA (Jarvis): os recomendados A1 (quem dentro de esquema) e A2 (user_id, userId e motivo_texto, T2 e T3 do modelo de ameaças) voltam ao autor nesta branch, antes do QA, por serem pequenos e do mesmo teste.
- 2026-11-11 10:38: brief selado docs/briefs/094-lote-testes-e-guia-node-backend-3.md c35f6214272032239573aeb6af232a6d96c22c5fdbbb2a67ff2275ce4dc697be
- 2026-11-11 10:39: E3.1 volta do K-267 (91448084): A1 e A2 resolvidos, 39/39, sem vazamento. Próximo: revalidação do review e QA.
- 2026-11-11 10:40: brief selado docs/briefs/094-lote-testes-e-guia-tech-lead-7.md e3c92d0e4c65e6e46a07ea959273e81e5b96547cce3e1b72e3776e9a47e05161
- 2026-11-11 10:41: E1.3: PR 308 (K-265) aberto, CI verde; o merge é do dono, depois da promoção da release 093 (develop congelada).
- 2026-11-11 10:43: E3.2 revalidado (b653e6d4): A1 e A2 resolvidos; A3 recomendado (QUEM em maiúsculas), segue como pendência no PR. Próximo: E3.3 (QA).
- 2026-11-11 10:43: brief selado docs/briefs/094-lote-testes-e-guia-qa-engineer-2.md 42d3676f017bb901296b2e116b70699640c0fe27a574c314cb065f3863b15693
- 2026-11-11 10:46: E3.3 QA do K-267 aprovado (c90340ee; 0 bugs; mutação morta). Próximo: E3.4 (PR).
- 2026-11-11 10:46: brief selado docs/briefs/094-lote-testes-e-guia-tech-lead-8.md 7a625ad274dedbff32435ac2b150e79cf3f986c8f58f92cf1978f29d00f27a59
- 2026-11-11 10:58: E2.4: PR 309 (K-266) mesclado na develop pelo dono (ce401fd5); o check com banco rodou o arquivo (8 testes).
