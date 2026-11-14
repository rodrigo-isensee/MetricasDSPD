# Revisão de interface: "Leia junto" (E1.4 do pedido 080)

pedido: 080-testes-instaveis-web
branch: feature/080-testes-instaveis-web
commit: 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82
data: 2026-11-07
agente: forge:ux-designer (revisão só leitura, sem edição de código)
veredito: aprovado para a E1.4, sem ressalva bloqueante de interface. A medição do alvo de 24 px em navegador fica com o QA (`@axe`).

## Escopo da mudança
`web/src/features/complementares/LeiaJunto.tsx`: `gap-y-1` (4 px) acrescentado ao contêiner do "Leia junto" (linha 38) e à lista de links (linha 42). Só afeta o espaço entre linhas quebradas; a aparência de uma linha não muda.

## Conferido
- Padrão visual: `gap-y-1` já é usado em outros 8 arquivos da web (10 ocorrências, por exemplo `FrescorFonte.tsx`, `Legenda.tsx`, `CartaoDiario.tsx`). O valor é múltiplo de 4 px, como manda o layout.
- Alvo de toque a 1280 px: `.alvo` define `min-height` e `min-width` de 1,5 rem (24 px) fora da média de 768 px (`web/src/styles/tokens.css:134`). Lido pelo código.
- Alvo de toque a 375 px: a média `max-width: 47.99rem` troca para 2,75 rem (44 px) (`tokens.css:138`). Lido pelo código.
- Espaçamento entre alvos de 24 px: a distância entre centros de linhas é 28 px, com folga de 4 px acima dos 24 px do alvo. O espaçamento da WCAG 2.5.8 é atendido pela folga. Lido pelo código, pelo cálculo com `gap-y-1`.
- Largura de 375 px: o alvo de 44 px com 4 px de folga não cria sobreposição. Lido pelo código.
- Controle e rótulo: os links mantêm o texto visível no início do `aria-label` (`LeiaJunto.tsx`, linhas 48 a 59), então o nome acessível contém o texto visível.

## Limites desta revisão
- Nenhum navegador foi aberto, nenhuma medição foi feita. "24 px" e "44 px" são lidos do CSS, não medidos na página.
- Contraste e leitor de tela não foram medidos nesta revisão; a parte de cor do "Leia junto" não mudou.

## Achados
- [baixo] Medição do alvo de 24 px a 1280 px: está só no CSS (`tokens.css:134`). Onde: `LeiaJunto.tsx` e `tokens.css`. Por quê: a revisão não roda navegador. Correção: o QA confirma com `@axe` (target-size) nas duas larguras; nenhuma mudança de código é pedida aqui. Regra: WCAG 2.5.8.

## Resultado por larguras
| Largura | Alvo (lido do CSS) | Folga entre linhas | Situação |
|---|---|---|---|
| 1280 px | 24 px | 4 px | atende 2.5.8 pela folga (lido) |
| 375 px | 44 px | 4 px | atende (lido) |
