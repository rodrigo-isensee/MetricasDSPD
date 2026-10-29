---
tipo: review
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: feature/048-usabilidade
commit: fc1e59fffd58c683be3b5338fc37a37ca3d77452
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-29
---
# Review: usabilidade U1 a U5 e P2 (K-074, E4.1)

Diff `4137981..2916b05`: 11 commits, 50 arquivos. Por leitura; suíte, `pronto` e CLS ficam para o QA. A conta do teto M14 e a integração na develop ficam para o fechamento (fora deste review).

## Contra as decisões
- U1: ocultar e mostrar pelo cartão ou marcador chamam `lembrar` (`definirSalvos` e limpa o ajuste da visita) em `ProvedorPainelPreferencias.tsx`. Cumpre. As caixas do popover "Métricas" seguem só na visita, como o texto do botão diz.
- U2: `MarcadorOculto` ocupa a posição da grade, diz o estado e traz "Mostrar"; a opção de desligar é do aparelho (`localStorage`, `OpcaoMarcadores`). Cumpre. O aviso de critério vai dentro do marcador, ou fica no topo sem marcador (CA-11 preservado).
- U3: índice fixo com seção em vista (`aria-current`), contagem de ocultas e foco no título. Cumpre no conteúdo, mas tinha o defeito A1.
- U4: sugestão por papel removida (`aplicarSugestao`, `PAPEIS` fora). "Restaurar padrão" confirma em diálogo modal (Radix), anuncia por `aria-live`, devolve o foco e oferece Desfazer sem prazo. Cumpre; ver A2.
- U5: "Por reunião" logo abaixo de "Pede atenção", com teste de ordem. Cumpre.
- Catálogo: sai do menu, entra na Ajuda (`/ajuda#catalogo`), `/metricas` redireciona com teste. Cumpre.
- P2 (opção B): barra única Cadência · Filtros · Métricas · Exportar · Copiar link; "Entenda" virou "Detalhes da coleta" em popover (sobreposto, não desloca o layout). A falha de coleta, o selo e "Dados fictícios" ficaram fora do popover, como a exceção da seção 3 manda. Cumpre, com A3 e A4.

## Outros pontos
- Dado de pessoa: as preferências guardam só ids de cartão e a chave `marcadores-ocultas`, no navegador (`fonte.ts` e `localStorage`); o link copiado ainda remove o parâmetro `mock`. Nada novo de pessoa. Sem métrica individual nem comparação entre times.
- Acessibilidade: o marcador é `role="group"` com rótulo, o "Mostrar" recebe o foco, o anúncio é `role="status"` polite, o diálogo é modal com foco devolvido. O aviso flutuante de 10 s saiu (WCAG 2.2.1). Os desvios do E4.0 (44 px, foco no botão Métricas sem marcador, rótulo "Restaurar") ficam para o E4.3.
- CLS e bundle (ADR 0003 F2, F6): popover e marcador não empurram o layout; o catálogo entrou no chunk da Ajuda (F7, alerta) e saiu como rota própria. A medição é do QA.
- Regras de ferramenta do `praticas.md`: o `pronto` completo e o lint rodam no QA e no fechamento (decisão do dono 2026-10-21); sem saída a citar aqui.

## Re-review depois das voltas do QA (E5.1, 2026-10-29)
Intervalo `c984b0f..1451778` (4 commits, 21 arquivos, +725/-40), por leitura, sem rodar suíte nem `pronto` (fora do escopo; a medição é do reteste do QA).

- Bug 048-01 (índice cobre o título): corrigido. `IndiceDeSecoes` publica a própria altura em `--h-indice` (`useAlturaCss`) e o `scroll-padding-top` a soma nas duas faixas (`tokens.css:107` e `:116`); abaixo de 768 px o índice é o único fixo e o padding agora o cobre. Teste: `indice.test.tsx` confere `--h-indice` publicado e retirado ao desmontar; falha sem a mudança (o nav não publicava nada).
- Bug 048-02 (aviso do "Copiar link" a 200%): corrigido. O `role="status"` sai do fluxo (`absolute right-0 top-full`, `w-max max-w-[90vw]`), sem `min-w-` e sem `gap-2` no contêiner; continua no DOM, então o anúncio e o CLS zero se mantêm. Teste em `componentes.test.tsx` (falha sem a mudança: a classe antiga tinha `min-w-` e não `absolute`).
- O A4 do QA (`rootMargin`): corrigido. A faixa do observador usa `reservado` = cabeçalho medido + índice medido, não `topo + 56`; teste com observador falso confere `-82px 0px -60% 0px` (49 + 33).
- Decisão 048-03 = A: cumprida no código. `BarraFiltros` perdeu `md:sticky md:top-[...]` e o `useAlturaCss('--h-filtros')`; o índice usa `top: <topo>px`, sem `--h-filtros`; `--h-filtros` saiu do `tokens.css`. CA-A (fixos só cabeçalho e índice) e CA-E (abaixo de 768 px nada muda na barra) se leem no código; o limite de 100 px do CA-A, o CA-B (axe `target-size` em passos de 100 px), o CA-C (USAB-05b e CT-31) e o CA-D (CLS) são de medição e ficam com o reteste do QA. Teste de unidade: `filtros-componentes.test.tsx` (sem `sticky`), `indice.test.tsx` (sem `var(`) e `cobertura.test.tsx:278` (`48px`).
- `web/src/styles/tokens.test.ts`: falha sem a mudança do `tokens.css` (o valor antigo tinha `--h-filtros` e não `--h-indice` no bloco de 48rem, e `--h-filtros` era publicado na raiz).
- Specs E2E antigos ajustados pelo QA: `shell` e `sustentacao-no-operacional` trocam a lista exata de destinos (sem "Catálogo de métricas"); `intensivo-sistemico` baixa o mínimo de 6 para 5 pelo mesmo motivo; `complementares` passa o título do catálogo a `h2` (seção da Ajuda); `preferencias` PREF-03 chega ao painel todo oculto desmarcando as caixas (a sugestão por papel saiu, U4) e confere o contador `0 de 12`; PREF-11 passa a exigir a escolha guardada (U1) e o foco no "Mostrar" do marcador (U2). Todos seguem o comportamento decidido; nenhuma asserção ficou mais frouxa que a regra nova. Os specs novos do QA (`usabilidade-048.spec.ts`, `perf/cls-usabilidade-048.spec.ts`) testam U1 a U5, P2 e o CLS com orçamento da ADR 0003.
- Obsoletos pela 048-03 (A5 a A7), para o reteste do QA, sem correção aqui (decisão técnica do Jarvis de 2026-10-29 08:16).
- Documentação (praticas.md §8, item 10, "falta de doc é bloqueia"): a decisão 048-03 muda a especificação de filtros, e a especificação e o design system ainda dizem barra sticky a partir de 768 px e `--h-filtros` medido (A8).
- Dado de pessoa e métrica individual: nada novo; o diff só mexe em layout, CSS e testes.

## Achados
- A1 (bloqueante) web/src/features/operacional/IndiceDeSecoes.tsx:88 · RESOLVIDO (substituído pela 048-03): o índice fica logo abaixo do cabeçalho fixo (`top` = altura medida do cabeçalho); a barra de filtros rola e não há mais `--h-filtros`; `indice.test.tsx` e `cobertura.test.tsx:278` conferem.
- A2 (recomendado) web/src/features/preferencias/ProvedorPreferencias.tsx:150 · RESOLVIDO: `setAntes` e `setRestauradas` só rodam com n > 0; o Desfazer pendente sobrevive. O teste em preferencias.test.tsx falha sem a correção.
- A3 (recomendado) web/src/features/visao-geral/VisaoGeralPage.tsx:228 · RESOLVIDO: linha curta `recorte-resumo` à vista, fora do `details`; o teste confere visível e fora do recolhido.
- A4 (recomendado) web/src/components/ui/BotaoCopiarLink.tsx:46 · RESOLVIDO: o aviso agora é sobreposto (`absolute`), sem largura reservada (bug 048-02); o campo manual segue sobreposto; o CLS segue com o QA.
- A5 (recomendado) e2e/tests/responsivo.spec.ts:42 · ABERTO, com o reteste do QA: assert "a barra sticky começa abaixo do fim do cabeçalho" e a anotação `fVar` (`--h-filtros`, :39) ficaram obsoletos pela 048-03: a barra rola. Reescrever no reteste do QA (CA-A).
- A6 (recomendado) e2e/tests/usabilidade-048.spec.ts:85 · ABERTO, com o reteste do QA: o `test.fail` do USAB-05b segue com o 048-01 corrigido: o teste passa e o Playwright o acusa como falha. Remover o `test.fail` no reteste, mantendo o caso.
- A7 (recomendado) e2e/tests/usabilidade-048.spec.ts:98 · ABERTO, com o reteste do QA: USAB-06 exige o índice abaixo da barra de filtros visível após rolar 600 px; com a 048-03 a barra sai da tela e o `elementFromPoint` dela não vale. Reescrever no reteste (CA-A), junto do título do describe (:71).
- A8 (bloqueante) docs/ux/dashboard-metricas/especificacao.md:228 · RESOLVIDO (fc1e59f): a spec (:228, :808, :1023, :1033-1034, :1213) e o design system (:51, :53, :101) dizem barra de filtros rolando a partir de 768 px, fixos só cabeçalho e índice; sem sticky nem `--h-filtros`.
- A9 (recomendado) web/src/features/filtros/BarraFiltros.tsx:126 · ABERTO, não devolve: o ref `barra` ficou sem leitor (o `useAlturaCss` saiu) e o comentário de :166 ainda cita "a barra sticky"; remover o ref e ajustar o comentário.
- A10 (recomendado) web/src/features/operacional/IndiceDeSecoes.tsx:47 · ABERTO, não devolve: `nav.current as HTMLElement` sem comentário e `MutationObserver` no `style` da raiz como sinal indireto da altura do índice; preferir guarda de nulo e medir pelo próprio `ResizeObserver` do nav.
- A11 (recomendado) docs/ux/dashboard-metricas/especificacao.md:1023 · ABERTO, não devolve: a regra geral diz cabeçalho e índice fixos e padding = cabeçalho + índice, mas abaixo de 768 px o cabeçalho não é fixo e o código (`tokens.css:107`) soma só o índice; dizer "a partir de 768 px" ou citar as duas faixas.

## Revalidação
Rodada 1 (2026-10-28): delta `2916b05..2aac602` (9 arquivos, +61/-11), por leitura. Sem achado novo.

Rodada 2 (2026-10-29): delta lido `c984b0f..1451778` (21 arquivos, os 4 commits f82b656, ba9c002, d1df428 e 1451778), por leitura, sem rodar suíte. Já lido e inalterado: o restante da branch até `c984b0f`. Lidos também, fora do diff, os pontos que a 048-03 torna obsoletos: `e2e/tests/responsivo.spec.ts`, `docs/ux/dashboard-metricas/especificacao.md` e `docs/ux/design-system.md`.

Rodada 3 (2026-10-29, E5.1): `forge-check delta --parecer` listou `1451778..fc1e59f`, 2 arquivos de documentação: `especificacao.md` (:228, :808, :1023, :1033-1034, :1213; +6 -6) e `design-system.md` (:51, :53, :101; +3 -3), lidos por leitura, sem suíte. Já lido e inalterado: todo o código e os testes até `1451778` (aprovados na rodada 2). `grep` de `sticky` e `h-filtros` nos dois documentos não acha mais a barra fixa. O texto bate com o código aprovado (`AppShell.tsx:100` `md:sticky`, `BarraFiltros` sem sticky, `tokens.css:116` cabeçalho + índice) e com CA-A e CA-E; CA-B a CA-D seguem como medição do reteste do QA, e nada no texto reabre o CLS (ADR 0003). A8 resolvido; A11 novo, recomendado.

## Parecer
Aprovado. A rodada 2 tinha reprovado só pela documentação (A8); o fc1e59f a corrige (rodada 3). O código corrige 048-01, 048-02 e o A4 do QA com teste que falha sem a mudança, e cumpre a 048-03 no que se lê (CA-A e CA-E); CA-B, CA-C e CA-D ficam com o reteste do QA. A5 a A7 vão ao reteste do QA; A9, A10 e A11 são recomendações e não devolvem.
