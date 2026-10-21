# Pedido 025 — Front do pedido 011, lote 2 (táticas)

- **Data:** 2026-10-17 (retomado em 2026-10-20, sessão Forge 0.26.0)
- **Origem:** pedido 021 (divisão por lote). Decisão do usuário de 2026-10-17: lotes por nível, nesta ordem. Em 2026-10-20, ordem do dono: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- **Modo:** implementar
- **Objetivo:** pôr no painel tático (/tatico) as métricas do lote 2, cujo back (fase 2 em mock) já está na main.
- **Clareza:** 4 confirmado, 2 suposição, 1 técnico; 0 pergunta na fila (T14-ordem fica para antes da fase 3, não bloqueia).

## Escopo
- E1. (K-110) Front do lote 2 em /tatico: T10, T11, T12, T13 e T14, conforme `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (protótipo validado em 2026-10-14, pedido 011). · `confirmado` (recibo "sim", 2026-10-20)
- E2. T14 com R-1 = B: "outros times" oculto quando somar menos de 2 pessoas (mostra só "meu time: k de n" na regra original; ver E3). · `confirmado` (decisão de 2026-10-16, pedido 011)
- E3. T14 com T14-M1 = B: com "outros times" oculto, a tela mostra só a fatia do meu time, sem o total exato do projeto (não dá para calcular n − k na tela). · `confirmado` (decisão de 2026-10-17, pedido 011; leitura confirmada no recibo de 2026-10-20: "sem o total" = não mostrar o total)
- E4. T10 com B11-001: nome do fornecedor sem diferença de maiúsculas e espaços, exibido como vem da API (a normalização já está no back, pedido 022). · `confirmado` (B11-001 = sim, pedido 011)

## Etapas
- E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde.
- E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1.
- E1.3 (forge:tech-lead): code review.
- E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3.
- E1.5 (forge:qa-engineer): QA e parecer.
- E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação.
- E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch.

## Fora do escopo
- Operacionais (pedido 026, K-111) e integrações oficiais (fase 3): vêm depois, nesta ordem.
- Back das táticas (contrato e cálculo). A aplicação da T14-M1 = B no contrato e no agregado (`total`, `base.n`, pré-condição M-1a) é pré-condição da fase 3, não deste lote.
- T14-ordem (ordenação dos projetos com "outros times" oculto): pergunta ao dono antes da fase 3.
- Promoção para a homolog e a `main` (R-MAIN).

## Suposições
- S1. O E3 se cumpre na tela: o front não exibe `n` nem o total do projeto quando "outros times" está oculto, ainda que a API em mock devolva `n`. Base: a decisão T14-M1 = B (pedido 011, linha 135) fala do que a T14 "mostra", e o ajuste do contrato está marcado como pré-condição da fase 3. · `suposição`
- S2. Gatilho de segurança (R-SEGURANCA): dados pessoais por reidentificação na T14 (pedido 011, R-1 e T14-M1). Base: o lote 2 do back teve review de segurança pelo mesmo motivo. · `técnico`
- S3. A branch parte da develop depois do merge do pedido 036 e corre em paralelo com o pedido 037 (Worker), sem arquivos em comum esperados; confirmar com `forge-check sobreposicao`. · `suposição`

## Critério de pronto
- /tatico mostra T10 a T14 conforme a especificação, com E2, E3 e E4 cumpridos. · `confirmado`
- Review, segurança (T14), QA e UX aprovados; `pnpm run pronto` verde; PR mesclado na develop. · `técnico`

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).

## Andamento
- 2026-10-20 — Recibo ao usuário: vou fazer: front de T10 a T14 em /tatico com R-1 = B e T14-M1 = B na T14 e o B11-001 no T10; review, QA, UX e PR para a develop; não vou fazer: operacionais, integrações, back das táticas; T14-ordem fica para antes da fase 3. "sem o total exato do projeto" citado com as duas leituras (não mostrar o total × mostrar sem arredondar). Usuário: "sim".
- PERGUNTA: 2026-10-20 · recibo do pedido 025 (táticas), com a leitura de "sem o total"
- 2026-10-21 — Conferência da entrega 07969c8: não cumpriu (escopo e E4). Decisão técnica do Jarvis (`técnico`, base: precedente do lote 1, d83024b, que mexeu em `packages/contratos/src/cartoes.ts` e pôs o Leia junto num cartão do núcleo, CartaoE2.tsx): o catálogo de cartões em `packages/contratos/src/cartoes.ts` (com os Leia junto recíprocos) e o Leia junto em `CartaoBloqueados.tsx` fazem parte do E1 (catálogo e Leia junto das fichas T10 a T14); não é o contrato da API. O teste do E4 com variantes de caixa e espaço volta ao react-frontend (brief 2).
- 2026-10-21 — Decisão técnica do Jarvis (`técnico`, base: R-VERIFY proíbe `--force`; o PR para a develop é por squash): o parecer de segurança em dois commits (6c37789 e 35686fd, o segundo só ajusta o formato do bloco `## Achados` para o `forge-check docs`) é aceito no lugar de "um commit só do parecer".
- 2026-10-21 — Decisão técnica do Jarvis (`técnico`, base: parecer de QA do 037, `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/037-c6-operacional.md`, defeito D1, e cartão K-131): falhas de E2E que já existem na develop (D1: 96 testes em `e2e/tests/intensivo-filtros.spec.ts` e 4 em outros arquivos) não são defeito do 025; o QA do 025 as registra como "já existente".
- 2026-10-21 — Decisões técnicas do Jarvis sobre a entrega de QA (f06a6fb e 9e11071), `técnico`: (1) os dois commits do QA são aceitos no lugar de "um commit" (o segundo só aponta o `commit:` do parecer; R-VERIFY proíbe `--force`; o PR é por squash), só para esses dois commits; (2) `E2E_PORTA` e `E2E_PORTA_ALT` em `e2e/playwright.config.ts` fazem parte do E1 (infraestrutura dos E2E desta entrega: sem elas a suíte da worktree -025 usava o preview de outra worktree na porta 4173), com padrões inalterados; a investigação do D1 continua no K-131.
- 2026-10-21 — Confirmação do Jarvis: o brief -1 (sha256 7f128f63021e13043c393bea277c074bf454cc043cbbf740c4221c6106c6b1b1) foi aprovado pelo conferente em 2026-10-20 23:13 (docs/kanban/conferencias.md, linha 57) e continua válido para a entrega 07969c8, feita sob ele; a "DECISÃO DO DONO (2026-10-21): comando de pronto, opção A" é posterior e vale a partir do brief -2, que a traz. A entrega é conferida pela união -1 + -2.

## Histórico
- 2026-10-21 13:58: entrega conferida 32a509fa4e6798ab43f777dca15823592db67383
- 2026-10-21 14:20: entrega conferida b6c76731f21cfddd320cb3a75a4490f11df688c7
