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
- E1.4b (forge:security-engineer): review de segurança incremental do que mudou na T14 depois de 32a509f (L2T-002, textos "Meu time: k", 4 arquivos), já na develop em c4db73e; parecer novo (`docs/security/025-t14-reidentificacao-incremental.md`) na branch de documentação do Jarvis, antes da promoção para a homolog (achado da conferência de 2026-10-23 06:26).
- E1.5 (forge:qa-engineer): QA e parecer.
- E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação.
- E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch.
- E1.8 (forge:ux-designer): ajustar a ficha da T14 na especificação ao que a tela mostra (só "Meu time: k" com o projeto oculto), sem mudar a tela, pela decisão T14-1 = A (K-139).
- R.1 (forge:agile-coach): retrospectiva do pedido 025.

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
DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": T14-1 = A, ajustar a ficha da T14 ao que a tela mostra (só "Meu time: k" com o projeto oculto), sem mudar a tela. Cartão K-139 (ux-designer).
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
- 2026-10-22 — QA (1062b91): D1 "não se aplica ao 025" no parecer; PNGs de evidência descartados. O brief tech-lead-4 (review incremental de 7807199) foi reprovado 4 vezes: o conferente exige a marca de corte para o E1.7, etapa do mesmo papel em outro momento. A mesma forma passou no brief 037 tech-lead-7. Decisão técnica do Jarvis (`técnico`): o E1.3 incremental e o E1.7 vão juntos no brief tech-lead-5, depois da revisão de UX.
- 2026-10-22 — UX (E1.6): aprovado com ressalvas, sem bloqueante (`docs/ux/revisao-025-front-taticas.md`, sem commit; o tech-lead commita no E1.7). Recomendado T14-1: com o projeto oculto, a tela mostra só "Meu time: k", enquanto a ficha prevê também a barra da fatia e o "sem time informado". Pergunta ao dono, que não bloqueia o PR.
- 2026-10-22 — Tech-lead (tl-5, parou antes do push): review incremental aprovado; UX commitada em 5a0a999; develop trazida por merge em 4fe19af; parecer de review com `commit: 5a0a999` (ea533a3). Desvios do autor: gravou o parecer primeiro por Bash, contra o brief, e regravou com Edit; tentou um `reset --hard`, que o classificador negou. O `forge-check pr` acusa o parecer de QA desatualizado por causa do arquivo de UX. Vai ao QA (qa-6, revalidação por delta), e depois o tech-lead retoma o E1.7.
- 2026-10-22 — Registro da ordem das duas decisões do dono de 2026-10-21 sobre o D1. A decisão "defeitos D1 (média...) e D2 (baixa...), opção A" já constava do brief 037-pr-131-release-com-falhas-tech-lead-4, aprovado às 19:53 (`docs/kanban/conferencias.md`). Às 19:58, a conferência do brief 037 qa-engineer-7 levou ao dono o conflito "D1: decisão do dono (pendência) x Andamento 19:30 (premissa falsa)". A resposta do dono, "A se d1 foi feito e vai subir certo", aparece pela primeira vez no brief 037 qa-engineer-7, aprovado às 20:47. A decisão "D1, opção A" é, portanto, a resposta posterior que revê a anterior no D1 ("o D1 deixa de ser pendência"). A anterior continua valendo para o D2.
- 2026-10-22 — Decisão técnica do Jarvis (`técnico`). Base: o ruleset da develop (`gh api repos/rodrigo-isensee/MetricasDSPD/rules/branches/develop`) exige a branch atualizada (`strict_required_status_checks_policy: true`; checks `rapida`, `testes`, `build` e `e2e`), e o 037 (#139) entra na develop antes do 025. O E1.7 se faz em duas partes. (1) O tech-lead traz a develop por merge, revisa o merge (o Worker do 037 muda o carregamento dos painéis; ver W037-001) e envia a branch. (2) Depois do reteste do QA no head do merge (E1.5), o tech-lead abre o PR e mescla.
- MELHORIA: 2026-10-22 · o `forge-check pr` invalida os pareceres de review e QA quando entra só `docs/ux/` depois deles (um diff só de documentação, que R-QA isenta). Proposta ao Forge: tirar documentação do cálculo de "desatualizado", ou mandar no brief commitar a UX antes dos pareceres.
- 2026-10-22 — Retomada em outro computador. O repositório agora está em `/home/rodrigoisensee/Metricas/MetricasDSPD`, e a worktree -025 não existe aqui. A branch `feature/025-front-taticas` está no remoto em 8a97686 (push feito antes da troca). O #139 (037) foi mesclado na develop (2bb9f68), e a develop está em 306cf6e (#138, Forge 0.28.0). O brief tech-lead-6 foi atualizado com o caminho novo, a base nova e a criação da worktree a partir do remoto.
- 2026-10-22 15:10 — Tech-lead-6: o merge da develop (d3356a8, sem conflito) e o review incremental aprovado (43f29b3, `commit: d3356a8`) estão feitos, só no local. O push foi barrado pelo `.githooks/pre-push`, porque falta pnpm nesta máquina; não houve `--no-verify`. O PQ-3 depende do E4 do pedido 040 (toolchain). Recomendação do tech-lead para o QA no E1.5: medir de novo o CLS da L2T-003 com o Worker.
- 2026-10-22 15:35 — Push feito pelo tech-lead (o mesmo brief tech-lead-6, continuação depois do E4.1 do 040): 8a97686..43f29b3, pre-push verde (lint e typecheck). Em seguida: conferência da entrega desde b6c7673 e brief do QA para o reteste (E1.5).
- 2026-10-22 15:40 — A conferência da entrega do tech-lead-6 deu "não cumpriu", mérito parcial. Os PQ-1 a 3 foram cumpridos, nada ficou pendente e o merge e o parecer estão corretos. O "fora" vem só da faixa b6c7673..8a97686, de briefs anteriores (qa-4 a 7, tl-5 e UX) que nunca foram conferidos. Decisão técnica do Jarvis (`técnico`, base: conferências de 2026-10-22 15:35 e precedente do 037 às 15:02): seguir para o E1.5. Os arquivos da faixa passaram pelo review (ea533a3) e pelo QA (ea55e8c) e vão de novo ao review e ao QA da promoção. Sem linha `conferida`, então o `Desde` continua b6c7673. MELHORIA ao Forge: R-PROVA não prevê como fechar uma faixa de várias entregas que ficou sem conferência depois de uma pausa.
- 2026-10-22 16:10 — Reteste do QA (qa-8, relançado) parado por ambiente. O Chromium do Playwright não abre porque faltam `libnspr4` e `libnss3` (exit 127), e por isso os 19 testes de `tatico-011-lote2` caíram no launch, sem nenhuma asserção avaliada. Typecheck dos E2E e `pronto` deram rc=0. O parecer d586518 (sem push) ficou `reprovado` por impedimento de ambiente (ENV-025-001), não por defeito. Desvio do autor: gravou o parecer e o bug por script Python, contra o brief, mas o conteúdo foi conferido na entrega. Ação do dono: instalar as dependências de sistema do Chromium. Depois disso, relançar o qa-8.
- MELHORIA: 2026-10-22 · o tech-lead propõe que o pre-push avise e siga quando o pnpm faltar. O Jarvis não recomenda: isso afrouxa um controle local. O caso só acontece numa troca de máquina, e quem resolve é a toolchain do 040. Fica registrado e não vira cartão.
- PERGUNTA: 2026-10-22 · T14-1: ajustar a ficha da T14 ao que a tela mostra (só "Meu time: k" no projeto oculto) ou mudar a tela para a ficha
- MELHORIA: 2026-10-22 · R-BRIEF não deixa claro se "etapa do mesmo papel em outro momento" fica no Fora do escopo sem a marca. Dois conferentes deram vereditos opostos para a mesma forma (037-tl-7 aprovado; 025-tl-4 reprovado nas rodadas 3 e 4). Proposta ao Forge: escrever a exceção por papel ou momento em R-BRIEF e no conferente.

## Histórico
- 2026-10-21 13:58: entrega conferida 32a509fa4e6798ab43f777dca15823592db67383
- 2026-10-21 14:20: entrega conferida b6c76731f21cfddd320cb3a75a4490f11df688c7
