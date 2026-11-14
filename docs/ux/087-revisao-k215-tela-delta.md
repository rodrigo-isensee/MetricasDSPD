# K-215 tela: delta da revisão de UX (R1 e R2)

Pedido 087, etapa E3.26 · autor: ux-designer · 2026-11-14 · sem commit · contra `docs/ux/087-revisao-k215-tela.md`.
Revisado: `web/src/features/sustentacao/components/RecorteSustentacao.tsx` (worktree 052b, head d47167f1). Tudo `lido` (código); nada medido nem executado (sem shell). Render real da seta e anúncio em leitor de tela ficam para o QA e para a conferência do dono.

## Veredito
R1 e R2 resolvidos. Nenhum achado novo crítico, alto ou médio; 1 observação baixa. A validação final continua do dono, na tela: estado **aguardando o usuário**.

## R1 (seta nativa sumia): resolvido
- `lido`: o `<summary>` mantém `flex` (linha 15), mas agora carrega o marcador nativo oculto (`list-none` e `[&::-webkit-details-marker]:hidden`) e uma seta própria `<span aria-hidden="true">▸</span>` (linhas 16 a 18), que ganha `rotate-90` quando aberto, lendo-se como ▾. Era exatamente uma das duas correções que propus.
- A seta se lê bem, `lido`: fica à esquerda do texto, com `gap-2`, herda a cor do texto do resumo (mesmo contraste do texto em negrito), é decorativa para leitor de tela (o estado vem do `<details>` nativo e o texto "Ver as N" / "Ocultar as N" muda), e a rotação sem `transition` não envolve movimento, então `prefers-reduced-motion` não se aplica. Por ser item de um contêiner `flex`, o `span` é blockificado e a transformação vale (num `span` inline ela seria ignorada).
- A rotação gira em torno do centro da caixa do glifo; como o `span` tem a largura do glifo, o deslocamento é desprezível.

## R2 (onToggle): resolvido
- `lido`: o `<details>` não tem mais `open` controlado; `onToggle={(e) => setAberta(e.currentTarget.open)}` (linha 12) só lê o estado real do navegador. Abrir por busca na página, Enter, Espaço ou clique mantém texto e seta sincronizados, e o React não refecha na renderização seguinte. O comentário da linha 11 explica o motivo.
- Estado inicial fechado e sem persistência (CA-3, CA-10) preservados: `useState(false)`, sem URL nem armazenamento.

## Observação (baixa)
O glifo `▸` depende da fonte do sistema; em fontes sem esse caractere o navegador usa fallback e a seta pode variar de tamanho. Não bloqueia; conferir no navegador na conferência do dono. O `jsdom` não dispara `toggle` sozinho: os testes devem disparar o evento manualmente (conferir no parecer do QA, fora do que revi aqui).

## Fora do que revi
Contraste, leitor de tela e render em 375px e 1024px (QA, `@axe`). A validação do dono (P-K215-1 e P-K215-2) segue pendente.
