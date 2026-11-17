# Revisão de UX: K-366, cor e padrão estáveis por série nas barras (E7.455)

Head revisado: 1a42330a. Itens de acessibilidade marcados `lido` (pelo código); nada foi medido (sem Bash).

parecer: aprovado, sem achados crítico, alto ou médio abertos; 2 observações baixas.

## O que foi conferido
- Cor e padrão saem de `i` na lista completa de `series` (Barras.tsx, linhas 115-122), antes do `.filter` das vazias. Legenda (161-165), tabela alternativa (126-159) e desenho (291-315) leem o mesmo `cfg`. `lido`.
- O teste "série vazia no meio" (graficos-composicao.test.tsx:116-132) confere Alfa liso/serie-1, Beta pontos (posição 2), Gama hachura (posição 3): coincide com PADROES e corNaPosicao em tema.ts. `lido`.
- Leitura sem cor (WCAG 1.4.1): o padrão continua como segundo canal; série vazia some da legenda e da tabela de forma consistente. `lido`.
- Contraste e tokens das cores não mudaram nesta alteração. `lido`.
- Tooltip usa `name={s.rotulo}`, sem dependência de posição. `lido`.

## Observações
- Baixo: a estabilidade vale só se o chamador passa a lista completa. Quem filtra as séries antes de passar a `Barras` continua com cor e padrão deslocados. Correção: documentar no TSDoc de `series` (hoje só há comentário interno) e, se houver chamadores assim, passar `cor`/`padrao` explícitos.
- Baixo: `semPadrao` conta também séries vazias, então uma única série visível pode sair com padrão (ex.: listras) em vez de lisa. É coerente com a estabilidade pedida e não prejudica a leitura; só vale saber ao ver o gráfico.

## Provas citadas
Parecer do autor (PQ do autor, rc=0) citado; não afirmo CI verde (sem PR; a suíte inteira fica para o CI do PR).
