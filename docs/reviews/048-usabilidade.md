---
tipo: review
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: feature/048-usabilidade
commit: 2aac60225a5927f399b7ef12fe8833b786a022e8
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-28
---
# Review: usabilidade U1 a U5 e P2 (K-074, E4.1)

Diff `4137981..2916b05`: 11 commits, 50 arquivos. Por leitura; suíte, `pronto` e CLS ficam para o QA. A conta do teto M14 e a integração na develop ficam para o fechamento (fora deste review).

## Contra as decisões
- U1: ocultar e mostrar pelo cartão ou marcador chamam `lembrar` (`definirSalvos` e limpa o ajuste da visita) em `ProvedorPainelPreferencias.tsx`. Cumpre. As caixas do popover "Métricas" seguem só na visita, como o texto do botão diz.
- U2: `MarcadorOculto` ocupa a posição da grade, diz o estado e traz "Mostrar"; a opção de desligar é do aparelho (`localStorage`, `OpcaoMarcadores`). Cumpre. O aviso de critério vai dentro do marcador, ou fica no topo sem marcador (CA-11 preservado).
- U3: índice fixo com seção em vista (`aria-current`), contagem de ocultas e foco no título. Cumpre no conteúdo, mas tem o defeito A1.
- U4: sugestão por papel removida (`aplicarSugestao`, `PAPEIS` fora). "Restaurar padrão" confirma em diálogo modal (Radix), anuncia por `aria-live`, devolve o foco e oferece Desfazer sem prazo. Cumpre; ver A2.
- U5: "Por reunião" logo abaixo de "Pede atenção", com teste de ordem. Cumpre.
- Catálogo: sai do menu, entra na Ajuda (`/ajuda#catalogo`), `/metricas` redireciona com teste. Cumpre.
- P2 (opção B): barra única Cadência · Filtros · Métricas · Exportar · Copiar link; "Entenda" virou "Detalhes da coleta" em popover (sobreposto, não desloca o layout). A falha de coleta, o selo e "Dados fictícios" ficaram fora do popover, como a exceção da seção 3 manda. Cumpre, com A3 e A4.

## Outros pontos
- Dado de pessoa: as preferências guardam só ids de cartão e a chave `marcadores-ocultas`, no navegador (`fonte.ts` e `localStorage`); o link copiado ainda remove o parâmetro `mock`. Nada novo de pessoa. Sem métrica individual nem comparação entre times.
- Acessibilidade: o marcador é `role="group"` com rótulo, o "Mostrar" recebe o foco, o anúncio é `role="status"` polite, o diálogo é modal com foco devolvido. O aviso flutuante de 10 s saiu (WCAG 2.2.1). Os desvios do E4.0 (44 px, foco no botão Métricas sem marcador, rótulo "Restaurar") ficam para o E4.3.
- CLS e bundle (ADR 0003 F2, F6): popover e marcador não empurram o layout; o catálogo entrou no chunk da Ajuda (F7, alerta) e saiu como rota própria. Risco de CLS: a mensagem "Link copiado." e o campo manual entram na barra em fluxo (A4). A medição é do QA.
- Testes: há cobertura para U1 a U5, P2, redirecionamento e a barra. Nenhum teste cobre a posição do índice frente à barra de filtros (A1).
- Regras de ferramenta do `praticas.md`: o `pronto` completo e o lint rodam no QA e no fechamento (decisão do dono 2026-10-21); sem saída a citar aqui.

## Achados
- A1 (bloqueante) web/src/features/operacional/IndiceDeSecoes.tsx:71 · RESOLVIDO: `top` agora é `calc(topo + var(--h-filtros))` (variável medida em runtime pela BarraFiltros); indice.test.tsx confere `--h-filtros` no style e cobertura.test.tsx:278 o valor.
- A2 (recomendado) web/src/features/preferencias/ProvedorPreferencias.tsx:150 · RESOLVIDO: `setAntes` e `setRestauradas` só rodam com n > 0; o Desfazer pendente sobrevive. O teste em preferencias.test.tsx falha sem a correção (o Desfazer sumiria).
- A3 (recomendado) web/src/features/visao-geral/VisaoGeralPage.tsx:228 · RESOLVIDO: linha curta `recorte-resumo` à vista, fora do `details`; o teste confere visível e fora do recolhido.
- A4 (recomendado) web/src/components/ui/BotaoCopiarLink.tsx:43 · RESOLVIDO: aviso com `min-w-[7rem]` reservado e campo manual `absolute` sobreposto; dois testes. A medição de CLS segue com o QA.

## Revalidação
Delta lido: `2916b05..2aac602` (9 arquivos, +61/-11), por leitura, sem rodar suíte. Já lido e inalterado: o restante da branch. Sem achado novo; sem regressão de foco, rótulos ou `aria-live` (o `role="status"` do aviso foi mantido); sem métrica individual nem dado de pessoa.

## Parecer
Aprovado. A1 a A4 resolvidos no código e cobertos por teste. Segue ao QA, que mede o CLS (ADR 0003 F2).
