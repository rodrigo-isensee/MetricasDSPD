# Pedido 031 — Levar o que está pronto à develop, limpar branches, promover para a homolog e abrir o PR para a main

- **Data:** 2026-10-17
- **Origem:** usuário: "atualize tyudo que esta pronto na develop e apague as branchs. Depois atualize a hml e deixe o pr aberto para main".
- **Modo:** implementar.
- **Clareza:** média: "tudo que está pronto" e "as branchs" dependem do inventário abaixo; uma pergunta ao dono sobre branches com trabalho fora da develop.

## Inventário (2026-10-17, 15h40)
- Pronto e fora da develop: a branch `docs/jarvis-quadro-2026-10-17-noite` (quadro, pedidos, briefs, revisão de UX do 024; só documentação).
- Em andamento, não pronto: `feature/030-dependabot-develop` (falta segurança, review e QA); PRs do Dependabot #110 a #112 (sem review nem QA; o #112 é versão maior do react-router).
- Branches já incorporadas à develop (nada a perder): `forge/upgrade-0.15.1`, `forge/upgrade-0.16.0`, `forge/upgrade-0.19.0` (locais e remotas) e `chore/forge-0.13.0-versao`; worktree `-023` (na develop, limpa).
- Branches locais com commits que não estão na develop: `feature/011-metricas-tambem-back` (53), `ref/c6-cede-por-metrica` (44), `ref/c6-gerador-em-fases` (47), `test/qa-intensivo-main` (5), `tmp/taticas-sobre-develop` (2), `feature/011-fase2-back` (2, com a worktree `-011-fase2`; trabalho refeito nos #105, #107 e #109).

## Escopo
- E1. PR só de documentação da branch `docs/jarvis-quadro-2026-10-17-noite` para a develop, mesclado; branch apagada. · `confirmado`
- E2. Apagar as branches já incorporadas e a worktree `-023`. · `confirmado`
- E3. Branches com trabalho fora da develop: tratamento conforme a resposta do dono (pergunta abaixo). · `suposição` até a resposta
- E4. Promover a develop para a homolog (com os pareceres próprios da promoção, pela decisão do dono de 2026-10-17 no pedido 023) e abrir o PR de release homolog → main, sem mesclar. · `confirmado`

## Fora do escopo
- Mesclar os PRs do Dependabot (#110 a #112) e o pedido 030: não estão prontos.
- Mesclar na `main` (R-MAIN): o PR fica aberto para o dono.

## Andamento
- 2026-10-17 — Recibo ao usuário: vou fazer: levar à develop a branch de documentação do quadro, apagar as branches já incorporadas, promover a develop para a homolog com os pareceres e deixar o PR para a main aberto; não vou fazer: mesclar o Dependabot e o pedido 030, que não estão prontos; o PR de release que eu ia abrir agora (brief 8 do pedido 023) fica substituído pelo desta nova promoção.
- PERGUNTA: 2026-10-17 — As seis branches locais com commits fora da develop: A arquivar cada uma com uma tag `arquivo/<nome>` e apagar a branch (reversível); B apagar sem guardar; C manter. Recomendação: A.
