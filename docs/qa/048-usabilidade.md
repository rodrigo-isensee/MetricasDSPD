---
tipo: qa
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: feature/048-usabilidade
commit: 3db78a933da28d41cc4acca3998f7fd0b1f52e62
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 2
bugs_baixos: 0
aceite_usuario: sim
data: 2026-10-29
---

# QA: usabilidade U1 a U5, catálogo na Ajuda, barra única (K-074, E5.2)

Links: decisões `docs/ux/revisao-geral-usabilidade/04-decisoes.md`, propostas `02-propostas.md` (2.2, 2.3, 3, 4 e 6), review `docs/reviews/048-usabilidade.md` (aprovado, c984b0f), ADR 0003 (F2, F2m), bugs `docs/qa/bugs/048-01` a `048-03`. Não há plano antecipado: o pedido nasceu das decisões U1 a U5 (não há `CA-n` EARS); as obrigações são as linhas de `04-decisoes.md`, P2/P3 e as correções A1 a A4 do review.

## Reteste de 2026-10-29 (head 3db78a9, depois de 048-01, 048-02, A4 e da decisão 048-03 = A)
**Reprovado de novo**, por dois defeitos médios que a E2E acusa no head 3db78a9 (cada um reproduzido duas vezes).
- **048-02 corrigido**: SNO-001 verde nas 4 rotas (scrollWidth <= 375 a 200%). **A4 corrigido no código**: o `rootMargin` usa a altura medida (cabeçalho + índice); o CLS segue dentro do orçamento.
- **048-01 só em parte**: o título da seção fica abaixo do índice (CT-31 verde; `#fila h2` em y=98 com o índice terminando em y=82), mas o destaque do índice **continua em "Publicado"** depois de clicar em "Fila" (`aria-current` de "Fila" vazio; `#publicado` termina em y=82, encostando na borda da faixa do observador). USAB-05b (sem `test.fail`, A6) cai. Bug reaberto; CA-C da 048-03 não cumprido.
- **048-03 ainda aberto**: COMP-01 e `aba-p3` passam, mas CT-29 (Sustentação, "Mais métricas" aberto, 1280 px) cai nas duas rodadas com o mesmo alvo (`leia-junto-s7 li a`, link em top=5 px, sob o cabeçalho fixo de 49 px), e o percurso de CA-B (USAB-19, passos de 100 px, 1280x720, "Mais métricas" aberto) acha `target-size` sério em 5 posições (y=1700, 1900, 4500, 8700 e 9700). CA-B não cumprido. L3-04 caiu uma vez na suíte completa (`target-size` de um botão `aria-controls`) e passou em duas rodadas isoladas: instável, mesma família, sem bug próprio.
- A5, A6 e A7 do review resolvidos como código de teste.

### Resultado real do reteste
- **E2E completa** (`test:e2e`, pela trava, 798 testes): **795 passaram, 3 falharam** (L3-04 instável, CT-29, USAB-05b). Com o USAB-19 novo (cai por CA-B): 799 testes, 4 abertos. Reexecução de L3-04, CT-29 e `usabilidade-048.spec.ts` com `--repeat-each 2`: 82 passaram, 4 falharam (CT-29 x2, USAB-05b x2); L3-04 passou nas 2.
- **Axe** das telas alteradas (USAB-AXE x20 e USAB-AXE-b): 21 de 21 sem violação séria ou crítica (1280 e 375 px, claro e escuro, diálogo aberto).
- **CLS (mock, alerta)**, `test:perf`, 32 de 32 passam. F2 1366x768: `/` 0,026, semanal 0,011, `/tatico` 0,002. F2m (rede limitada, CPU 4x): 375x812 0,043 / 0,001 / 0,005; 390x844 0,040 / 0,002 / 0,005; 375x667 0,059 / 0,000 / 0,001. Todos < 0,1 (CA-D cumprido).
- **CA-A cumprido** a 1280x720: altura fixa total 82 px (cabeçalho 0 a 49, índice 49 a 82; limite 100) e a barra de filtros rola para fora (USAB-06 reescrito, com asserção de até 100 px; A7 de `responsivo.spec.ts` verde). **CA-E** cumprido: abaixo de 768 px nada mudou e os casos existentes seguem verdes.
- **Specs (código de teste)**: A5 `responsivo.spec.ts` reescrito (barra que rola, sem `fVar`); A6 `test.fail` removido do USAB-05b (o caso fica e cai: bug real); A7 USAB-06 e o título do describe reescritos; USAB-19 novo para CA-B.
- **Vermelho antes do verde**: USAB-06 e A7 são asserções novas de regra; USAB-06 falharia sobre o head anterior (barra sticky: `bBottom` > cabeçalho); não rodei o vermelho sobre c984b0f, evidência apenas por leitura. USAB-05b e USAB-19 foram vistos falhando no head testado.

## Veredito do primeiro teste (c984b0f, histórico)
**Reprovado** sobre o HEAD **c984b0f**. A usabilidade funciona nos casos novos (40 de 40 do spec novo, 0 violações sérias ou críticas de acessibilidade nos 21 casos axe, CLS dentro do orçamento), mas a branch quebra 7 testes que passam na base 4137981 (conferido com o mesmo comando numa cópia da base): 3 defeitos de produto, todos no código novo (índice fixo e aviso do "Copiar link"). O `pnpm run pronto` passou (rc=0): ele não roda a E2E, e foi a E2E que achou os defeitos.

## Resultado real
- **Spec novo** `e2e/tests/usabilidade-048.spec.ts` (projeto `chromium`): 40 de 40 passam (19 funcionais, 20 axe, 1 diálogo aberto). O USAB-05b está marcado `test.fail` por causa do bug 048-01 (sem `skip`): quando o front corrigir, o Playwright acusa e o `test.fail` sai.
- **E2E completa** (`pnpm run test:e2e`, pela trava, portas 4183/4184 porque a 4173 estava ocupada por um `vite preview` esquecido da worktree 045, que serviria o build errado): 798 testes, **780 passaram, 18 falharam**. Das 18:
  - 11 eram especificações antigas que a própria decisão do usuário torna obsoletas e eu atualizei como código de teste (menu sem "Catálogo": NAV-01/02, CA-1, SIS-ROB-03; catálogo na Ajuda: COMP-03 a 1280 e 375; sem sugestão por papel: PREF-03 x4; ocultar lembrado com "Mostrar" no marcador: PREF-11 e PREF-13). Reexecutadas depois do ajuste: 11 de 11 passam.
  - **7 são defeitos do produto** (reproduzidos duas vezes cada um e ausentes na base): SNO-001 x4 (bug 048-02), COMP-01 sustentação a 1280 e espera invisível a 1280 (bug 048-03), CT-31 a 375 px (bug 048-01). Esses 7 continuam vermelhos e eu não os mexi.
- A suíte completa não foi rodada de novo depois dos ajustes: rodei só os 11 ajustados e os 7 defeitos, por serem os únicos afetados.
- **Acessibilidade (axe WCAG 2.2 AA)** das telas alteradas (Visão geral, Operacional semanal com métrica oculta, Tático, Preferências, Ajuda com catálogo; 1280 e 375 px; claro e escuro) mais o diálogo "Restaurar padrão": 21 de 21 sem violação crítica ou séria. As violações `target-size` do bug 048-03 aparecem em testes existentes da Sustentação, não nestas telas.
- **CLS (mock, alerta, 1 amostra por tela; projeto `perf`, spec novo `e2e/perf/cls-usabilidade-048.spec.ts`, com o "Copiar link" clicado e o aviso esperado até sumir, e com uma métrica oculta)**: F2 a 1366x768: `/` 0,026; `/operacional?cadencia=semanal` 0,011; `/tatico` 0,002 (todos < 0,1). F2m (rede limitada e CPU 4x, como na ADR 0003): 375x812: 0,043 / 0,001 / 0,005; 390x844: 0,032 / 0,002 / 0,005; 375x667: 0,059 / 0,000 / 0,001 (todos < 0,1). `perf` inteiro: 32 de 32 passam. Marcado "mock": o número vale só como alerta (ADR 0003). O A4 está fechado quanto ao CLS, mas o mesmo aviso reservado causou o bug 048-02.
- **`pnpm run pronto`**: rc=0 (typecheck, testes unitários do web e demais pacotes, `docs:check` ok com 767 páginas).

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| U1 ocultar é lembrado | USAB-01, USAB-02, PREF-11 | recarregar a página; guardado em `localStorage`, nunca na URL | passou |
| U2 marcador sempre visível e opção de desligar | USAB-01, USAB-03, USAB-04 | marcador por 5,5 s sem sumir; opção desligada; link para métrica oculta | passou |
| U3 índice por seção, "N de M visíveis", seção toda oculta | USAB-05, USAB-07, USAB-08 | seção com 1 oculta; seção toda oculta (marcador único e sai do índice) | passou |
| U3/A1 índice abaixo da barra de filtros ao rolar | USAB-06 | rolagem de 600 px; filtros não cobertos | passou |
| U3 leva ao título sem encobri-lo e destaca a seção | USAB-05b, CT-31 | título sob o índice; foco encoberto a 375 px | **falhou (bug 048-01)** |
| U4 sem sugestão por papel; restaurar com confirmação e desfazer sem prazo | USAB-09, USAB-10, USAB-12, PREF-03 | cancelar; Esc e foco no gatilho; desfazer após 5,5 s | passou |
| A2 Desfazer sobrevive a restaurar sem nada oculto | USAB-11 | restaurar com n = 0 | passou |
| U5 "Por reunião" logo abaixo de "Pede atenção" | USAB-13 | ordem vertical dos três blocos | passou |
| A3 `recorte-resumo` à vista fora do recolhido | USAB-14 | fora do `details`, `details` fechado | passou |
| Catálogo na Ajuda, fora do menu, `/metricas` continua | USAB-15, NAV-01/02, CA-1, COMP-03 | redirecionamento para `/ajuda#catalogo` | passou |
| P2 barra única de ações | USAB-16 | um só "Copiar link"; ações no grupo | passou |
| A4 aviso do "Copiar link" sem deslocar o layout; link sem `mock`, sem seleção de métricas, sem dado de pessoa | USAB-17, USAB-18, CLS | aviso entra e sai (5 s); falha da área de transferência; layout igual antes e depois | passou nos casos novos; **falhou a 200% em 375 px (bug 048-02)** |
| Acessibilidade das telas alteradas | USAB-AXE x20, USAB-AXE-b | 1280 e 375 px; claro e escuro; diálogo aberto | passou |
| F2 e F2m (ADR 0003) | `perf/cls-usabilidade-048.spec.ts` | rede limitada, CPU 4x, três viewports | passou (mock, alerta) |
| Regressão: sem violação séria nem rolagem horizontal fora das telas novas | COMP-01, espera-invisível, SNO-001 | alvo de toque 24 px; reflow a 200% | **falhou (bugs 048-02 e 048-03)** |

## Vermelho antes do verde e mutação
- O spec novo é de regra (`R-QA`). A prova do vermelho não foi feita pela ferramenta do Forge (`forge-testes --vermelho` é do repositório do Forge). Evidência indireta: a primeira execução do spec bateu num `vite preview` esquecido da worktree 045 (build sem a feature) e **22 de 39 falharam (o USAB-05b ainda não existia)** ali (USAB-01 a 05, 09, 13, AXE-b etc.), contra 0 de 40 no build da branch. É evidência incidental, não um vermelho rodado de propósito sobre a base 4137981.
- Mutação: a stack não declara ferramenta de mutação para o web e o diff não toca `bin/`, `hooks/`, `.githooks/` nem `tests/catraca.py`: não aplicável.

## Achados
- A1 (bloqueante) web/src/features/operacional/IndiceDeSecoes.tsx:72 · Depois do clique em "Fila" o título fica livre (y=98, índice até y=82), mas o destaque fica em "Publicado" (`#publicado` termina em y=82, encosta na faixa do observador); USAB-05b cai. Bug 048-01 reaberto, CA-C.
- A2 (resolvido) web/src/components/ui/BotaoCopiarLink.tsx:44 · Bug 048-02 corrigido: SNO-001 verde nas 4 rotas a 375 px com fonte a 200%.
- A3 (bloqueante) web/src/features/operacional/IndiceDeSecoes.tsx:101 · `target-size` sério na Sustentação a 1280 px com alvo sob o cabeçalho fixo: CT-29 cai (`leia-junto-s7`, top 5 px) e USAB-19 acha 5 posições em passos de 100 px (CA-B). Bug 048-03 aberto.
- A4 (resolvido) web/src/features/operacional/IndiceDeSecoes.tsx:74 · O `rootMargin` usa a altura medida (cabeçalho + índice); CLS dentro do orçamento nos 3 viewports.
- A5 (recomendado) e2e/tests/responsivo.spec.ts:42 · Resolvido: assert reescrito para a barra que rola e anotação `fVar` removida (A5 do review).
- A6 (recomendado) e2e/tests/usabilidade-048.spec.ts:84 · Resolvido: `test.fail` removido, caso mantido; ele cai pelo bug 048-01 (A6 do review).
- A7 (recomendado) e2e/tests/usabilidade-048.spec.ts:95 · Resolvido: USAB-06 e o describe reescritos para a barra que rola, com asserção de até 100 px (A7 do review).

## Observações para o fechamento
- Os 11 testes antigos ajustados (`shell`, `sustentacao-no-operacional`, `intensivo-sistemico`, `complementares`, `preferencias`) deveriam ter ido na própria entrega do E4.1; o front só ajustou o `integracao-real.spec.ts`. Lição do processo: rodar a E2E completa antes do review.
- Um `vite preview` da worktree 045 continua ouvindo na porta 4173 e pode servir o build errado a qualquer outra worktree (use `E2E_PORTA`).
- Revalidação: reexecutar os 7 testes vermelhos e o `usabilidade-048.spec.ts` (o `test.fail` do USAB-05b precisa sair) e a E2E completa.
