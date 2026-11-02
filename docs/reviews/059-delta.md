---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-aba-front
commit: 9eb48bc1928bb350e8ab714c6e1aace92b46c68a
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Code review: front da aba Apontamento, volta dos achados do QA (pedido 059, E2.62, K-193)

**Ponta revisada:** `9eb48bc` (volta da E2.58: `22d18fc` A1, `b555de6` A2, `9eb48bc` spec e fixture do QA).
**Veredito: aprovado.** A1 e A2 do QA do front estão resolvidos, com as duas extensões aceitas na DECISÃO TÉCNICA de 23:50 conferidas. Nenhum achado novo.

## Delta lido
Intervalo `60194ef..9eb48bc` (saída de `forge-check delta --parecer docs/reviews/059-delta.md`); o trecho `60194ef..48d1157` só traz o parecer do QA. Lido o diff inteiro de `web/` (3 arquivos, 16 linhas somadas e 2 removidas) e dos dois specs antigos de `e2e/` (8 somadas e 8 removidas).
**Spec e fixture do QA** (`e2e/tests/apontamento-qa.spec.ts`, `e2e/fixtures/apontamento-respostas.json`): comparados com as cópias do QA no scratchpad citado no parecer de QA. A fixture é igual em conteúdo JSON; o spec difere só em formatação do Prettier (quebra de linha, vírgula final, aspas, parênteses de arrow), sem caso novo, removido ou alterado.
**Já lido (fora do delta, não relido):** a aba em `web/src/features/apontamento/` como revisada em `60194ef`.

## Conferência dos achados do QA
- **A1: resolvido.** CA-2 (`sustentacao-no-operacional.spec.ts:37-40`) confere 5 rádios e os cinco rótulos na ordem (Resumo, Diária, Semanal, Sustentação, Apontamento). CT-32 (`sustentacao-no-operacional-qa.spec.ts:490-527`) aceita até 3 linhas em 375 px com fonte normal e, pela extensão aceita, também com fonte a 200% (contagem de rótulos passa a 5; alvos de 44 px e o seletor cabendo no recipiente continuam afirmados). O afrouxamento é de 2 para 3 linhas, só o que a quinta opção exige; o aceite do UX fica para a revisão seguinte, como a DECISÃO TÉCNICA de 22:00 manda.
- **A2: resolvido.** `[overflow-wrap:anywhere]` no parágrafo de leitura de `CartaoMetrica.tsx:313` e, pela extensão aceita, no item do achado em `CartaoAchados.tsx:78` (com `min-w-0`, para o item flex encolher). Mudança só de CSS, sem lógica. O teste novo (`barra-e-ramos.test.tsx:219-232`) usa rótulo de 100 caracteres sem espaço no achado de concentração e afirma a classe na frase do achado e em todas as leituras `AP-*` (`getAllByTestId` falha se não houver nenhuma, então não passa vazio). A prova de rolagem no navegador é o caso CT-70 borda do spec do QA, que entra agora em `e2e/`.

## Resto
- Sem regra inviolável tocada; sem dado de pessoa novo; fixture só com pessoas fictícias (conforme o parecer de QA).
- Teto M14: o delta de código e teste do front é de 24 linhas somadas e 10 removidas fora do spec do QA; spec (811) e fixture ficam como teste e fixture trazidos do QA. O PR do front segue com a linha `teto: excedido, <n> linhas, <motivo>` no corpo, pela decisão do dono de 2026-11-02.

## Ferramentas (citadas, não refeitas)
- CI: run 41449874843 sobre `9eb48bc`, sucesso.
- Pronto e E2E: `pnpm run pronto` verde (1401 testes no web) e `pnpm run test:e2e` verde (795 em 24,8 min) na 052h, rodados pelo assistente do app a pedido do dono (registro de 23:35).
- Segurança: `docs/security/059-delta.md`, não renovado pela DECISÃO TÉCNICA de 23:35 (volta só de CSS e testes). UX: `docs/ux/059-revisao-delta-r3.md`, commitada nesta etapa.

## Achados
- A1 (bloqueante) e2e/tests/sustentacao-no-operacional.spec.ts:39 · achado do QA resolvido nesta rodada: CA-2 com cinco opções e CT-32 com até 3 linhas em 375 px, também a 200% de fonte. Sem pendência.
- A2 (bloqueante) web/src/components/ui/CartaoMetrica.tsx:313 · achado do QA resolvido nesta rodada: quebra de palavra longa na leitura e na frase do achado (CartaoAchados.tsx:78), com teste. Sem pendência.

## Parecer
**Aprovado.** Sem achado aberto. Segue o QA do front sobre esta ponta. Condições do PR para a `develop` (não desta rodada): linha de teto no corpo, merge do PR da exceção antes, pareceres de QA, segurança e UX em dia e CI verde na ponta.
