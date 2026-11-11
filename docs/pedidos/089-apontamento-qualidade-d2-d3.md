# Pedido 089: Apontamento, "execução técnica" fora da falha de qualidade e rótulo "Sem comentário"

- **Modo:** implementar
- **Objetivo:** aplicar as respostas do dono às dúvidas D2 e D3 do K-213 (análise `docs/analises/087-k213-qualidade-apontamento.md`): o apontamento com comentário que o dicionário não reconheceu (`execucao-tecnica`) deixa de contar como falha de qualidade (`sem-vinculo`) e passa a aparecer à parte, como insumo para ampliar o dicionário, com a mudança de critério registrada com data e marcada nos gráficos (T2.6); e o subgrupo "Não classificado" passa a se chamar "Sem comentário".
- **Clareza:** 2 confirmado; 3 técnico; 3 suposição; 3 perguntas
- **Depende de:** 087 (K-213, análise)

## Escopo
- E1. `sem-vinculo` deixa de incluir `execucao-tecnica` (só `nao-classificado` continua como falha de qualidade); `execucao-tecnica` fica visível à parte como sinal para ampliar o dicionário; nova versão de critério com data, marcada nos gráficos (T2.6) · `confirmado`
- E2. O rótulo do subgrupo `nao-classificado` passa de "Não classificado" a "Sem comentário" na tela, nos achados e na documentação do dicionário · `confirmado`

## Etapas
- E1.1 (software-architect): plano curto: onde a flag é calculada e gravada, como a versão de critério entra (ref_versao_criterio, T2.6), o que acontece com os apontamentos já gravados (nunca sobrescrever histórico), o impacto na tela e no achado; sem commit, parecer em docs/analises/.
- E1.2 (node-backend): implementação de E1 e da parte de E2 no servidor e na biblioteca de métricas, pelo plano.
- E1.3 (react-frontend): parte de tela de E1 e E2, pelo plano.
- E1.4 (ux-designer): revisão de interface.
- E1.5 (tech-lead): review; E1.6 (qa-engineer): QA; cada parecer (review, QA e revisão de UX) commitado e enviado na própria branch por quem o grava, ou pelo tech-lead quando o papel não tem shell; E1.7 (tech-lead): PR (o merge é do dono).
- E1.8 (agile-coach): retrospectiva curta.

## Fora do escopo
- Ampliar o dicionário de termos do apontamento · `técnico`
- A conferência do campo `comment` da API contra as observações do BusinessMap (fica para a próxima execução com dado real, pedido 087) · `técnico`

## Suposições
- SUPOSIÇÃO: Q1, Q2 e Q3 seguem a recomendação do plano até a resposta do dono (reversíveis; sem resposta, vale a recomendação) · `suposição`

## Perguntas na fila
- PERGUNTA: Q1, manter o flag `sem-vinculo`, o contrato e o rótulo como estão e rever com dado real? Recomendação: sim.
- PERGUNTA: Q2, manter os dois achados (`nao-classificado-alto` e `sem-comentario-alto`) e decidir a fusão na revisão do limiar? Recomendação: sim.
- PERGUNTA: Q3, vigência da versão nova na data da primeira varredura completa (não a da decisão)? Recomendação: sim.

## Decisões do usuário (registro literal)
- DECISÃO DO DONO (2026-11-10 21:32): recibo confirmado: "faca as recomendacoes" (sobre D2 = A, "execução técnica" não conta como falha de qualidade, com mudança de critério registrada; e D3 = A, trocar "Não classificado" por "Sem comentário").

## Histórico
- 2026-11-10 21:34: brief selado docs/briefs/089-apontamento-qualidade-d2-d3-software-architect-1.md 3ee0fa807921d9d7453dcd5b3427014b297fb17bdb5597b899370c3140e1d1ee
- 2026-11-10 21:37: E1.1 entregue pelo software-architect: docs/analises/089-plano-apontamento-d2-d3.md (sem commit; test -s rc=0). A regra sai de packages/metricas/src/coletor/classificarApontamento.ts:198-199; o dado já gravado muda pela releitura da carga (versão nova na staging, a antiga fica); duas versões de critério em ref_versao_criterio; o texto do achado nao-classificado-alto muda; divisão node-backend (E1.2) e react-frontend (E1.3) sem arquivo em comum. Dois defeitos que já existiam entram na E1.2: a marca T2.6 do dicionário não chega à tela com dado real (id numérico em repositorio.ts:111) e lerRotulosSubgrupo não filtra vigência (repositorio.ts:76-79). PERGUNTA ao dono (em lote, com recomendação; sem resposta vale a recomendação, por serem reversíveis): Q1 manter o flag sem-vinculo como está e rever com dado real; Q2 manter os dois achados (nao-classificado-alto e sem-comentario-alto) e decidir a fusão na revisão do limiar; Q3 vigência da versão nova = data da primeira varredura completa. SUPOSIÇÃO: as três recomendações valem até a resposta.
- 2026-11-10 21:39: brief selado docs/briefs/089-apontamento-qualidade-d2-d3-react-frontend-1.md 641ca167fa880bad139979a2222a3407db83c36d85aa65df460d08b46cda11a7
- 2026-11-10 21:40: brief selado docs/briefs/089-apontamento-qualidade-d2-d3-node-backend-1.md c70c9a747c6e68a0cb9be13ff374f81ced1e959d02c6d8c1b98eb9c4c44ea201
- 2026-11-10 22:06: E1.3 entregue pelo react-frontend: 957e30c9 e 7a9b5055 na feature/089-apontamento-d2-d3-web (pronto rc=0). O forge-check entrega acusou e2e/tests/apontamento-qa.spec.ts fora do declarado: ERRO-JARVIS, a mensagem da delegação autorizou ajustar o E2E sem que o arquivo estivesse no brief. DECISÃO TÉCNICA (Jarvis): o brief react-frontend-2 é o -1 com esse arquivo na lista, sem trabalho novo, e é contra ele que a entrega 7a9b5055 é conferida (não é delegado).
- 2026-11-10 22:07: brief selado docs/briefs/089-apontamento-qualidade-d2-d3-react-frontend-2.md 9c825c3dd1e39fa905e22356a82045a4c60514ce47c22980c2f4e2675281793a
- 2026-11-10 22:07: entrega conferida 7a9b50557a47c0189dc01f60a5c66bc391b98a3c
- 2026-11-10 22:08: brief selado docs/briefs/089-apontamento-qualidade-d2-d3-ux-designer-1.md 6d4f16f1df9ed5876326154d7fb2043ddffba7b1a24bc55fda38706c1c576e8d
- 2026-11-10 22:09: E1.4 (ux-designer): revisão gravada em docs/ux/089-revisao-apontamento.md na worktree 052f (sem commit): aprovado com ressalvas, 0 crítico, 0 alto, 3 médios (M-1 dois "Sem comentário" com contagens diferentes, a marca de qualidade e o subgrupo; M-2 os achados nao-classificado-alto e sem-comentario-alto quase iguais; M-3 texto do botão do subgrupo fora de textos.ts e lista diferente da do achado) e 5 baixos (B-1 a B-5). PERGUNTA ao dono (Q4, reversível; sem resposta vale a recomendação): o subgrupo fica "Sem comentário" com uma explicação ao lado que o diferencia da marca de qualidade "Sem comentário" (recomendação), ou ganha outro nome. DECISÃO TÉCNICA (Jarvis): volta ao react-frontend com M-1 (desambiguação no ponto de uso), M-2 (redação diferente dos dois achados, mantendo os dois pela Q2), M-3 e B-1 a B-5.
- 2026-11-10 22:11: brief selado docs/briefs/089-apontamento-qualidade-d2-d3-react-frontend-3.md ff9276f7130bfc7be088c4c39ef3100373c1e39b3252e89665135b01e66b45a7
- 2026-11-10 22:15: E1.2 entregue pelo node-backend: 254e12cd, 17015b67 e 2ea9c636 na feature/089-apontamento-d2-d3 (pronto rc=0; os testes .pg não rodaram, sem banco). Desvios do plano, por GRANT por coluna do papel dspd_api_apontamento (sem migração): vigência do rótulo por DISTINCT ON (codigo) ordenado pela versão, em vez de vigente_ate; família "dicionario" do critério pela métrica apontamento-dicionario, em vez de referencia. Pendente: teste no Postgres da releitura (append-only e bits 8 e 16), fora da lista, para o QA. Dois arquivos fora do brief (server/src/modulos/referencia/index.ts e server/tests/criterios-apontamento.test.ts). DECISÃO TÉCNICA (Jarvis): o brief node-backend-2 é o -1 com esses dois arquivos na lista, sem trabalho novo, e é contra ele que a entrega 2ea9c636 é conferida (não é delegado). Melhoria vista (para a retrospectiva): planejar leitura pelo papel da aba conferindo COLUNAS_API_APONTAMENTO antes.
- 2026-11-10 22:16: brief selado docs/briefs/089-apontamento-qualidade-d2-d3-node-backend-2.md f5ff6ac16c50f0d21c26b630efa0d4af0a66dcd87a742d41f4d01326d55332e5
- 2026-11-10 22:16: entrega conferida 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e
- 2026-11-10 22:18: brief selado docs/briefs/089-apontamento-qualidade-d2-d3-tech-lead-1.md f2547041234a8ae0ef268c0931243b818c8a8d88073d53353f873ea8cbe9fca6
- 2026-11-10 22:21: brief selado docs/briefs/089-apontamento-qualidade-d2-d3-qa-engineer-1.md 3374d33456d72487f2749cf11feb9ed2a4e3c8ac567a8a4eab12bd28c492e9c2
- 2026-11-10 22:23: Back-end (feature/089-apontamento-d2-d3): review 92b65a3f aprovado (A1 a A3 recomendados: ordem de implantação escrita no PR ou em docs/api/apontamento.md; .pg sem banco local; ref:sync e criterios-apontamento no mesmo dia) e QA 3dda6189 aprovado sem bug (mutação morta; lacuna: .pg e teste da releitura no Postgres sem banco local, o verde vem do CI). Falta a branch do front (volta da revisão de UX em curso) e depois os PRs.
- 2026-11-10 22:30: brief selado docs/briefs/089-apontamento-qualidade-d2-d3-qa-engineer-2.md 8345b224886b7cfb892f634d7333ccf01a4d8224e01ed60eaff41e73a47f7be3
- 2026-11-10 22:31: PONTO DE RETOMADA (reinício da sessão para o Forge 0.45.5, a pedido do dono). Back-end (052h, feature/089-apontamento-d2-d3): entrega conferida 2ea9c636; review 92b65a3f e QA 3dda6189 aprovados; em curso ao parar: volta de forma do parecer de QA (brief qa-engineer-2, selado), pode ter ficado sem commit ou sem push: conferir git log e git status na 052h; depois, PR do back-end (brief tech-lead-2 a refazer, E1.7). Front-end (052f, feature/089-apontamento-d2-d3-web): entrega conferida 7a9b5055; revisão de UX gravada sem commit (docs/ux/089-revisao-apontamento.md); em curso ao parar: volta da revisão de UX (brief react-frontend-3, selado), conferir git log e git status na 052f; depois, conferência da entrega, review, QA e o tech-lead leva o parecer de UX à branch; depois, PR do front. Perguntas Q1 a Q4 com o dono (sem resposta, valem as recomendações).
