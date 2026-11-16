# Revisão de UX: classe pela prioridade nativa (105, E7.175 e E7.206)

parecer: aprovado (A1, M1, M2 e B1 resolvidos no código novo; 1 baixo novo). Nada crítico, nada alto.
commit: d4c535de
Método: leitura do código (`lido`); sem ferramenta de medição. Itens de acessibilidade abaixo são todos `lido`; o QA mede (@axe).

## Revalidação dos achados anteriores (E7.206)

| Achado | Resultado | Evidência (`lido`) |
|---|---|---|
| A1 (alto): faixa só com número absoluto | Resolvido | `SemPrioridade.tsx` recebe `n` e `total`; escreve "N de M universo (P%)" e a frase "Esses cartões foram trabalhados normalmente; só não têm prioridade preenchida no BusinessMap...". Com P >= 20% (`LIMITE_DESTAQUE_SEM_PRIORIDADE_PCT`) ganha borda, fundo, ícone e texto, nunca só cor; `data-destaque` testável. |
| M1 (médio): unidade ambígua | Resolvido | Prop `universo` obrigatória: T1 e T2 "entregues", T4 "cartões com chegada ou entrega no período", O24 "inícios no período", O6 e T6 "itens entregues". |
| M2 (médio): T4 e a razão chegada/vazão | Resolvido | Em `CartaoT4.tsx` a faixa vem logo abaixo da tabela de razão (antes do seletor) e traz o complemento "A chegada total é maior que a soma das prioridades acima." |
| B1 (baixo): sem pista quando a faixa é a maioria | Resolvido | `maioriaSemPrioridade` (n*2 > total) troca a leitura em T1, T2 e O6 para "A maior parte dos cartões deste recorte está sem prioridade; nenhuma prioridade tem amostra suficiente...". |

Prioridade nos seis cartões (O6, O24, T1, T2, T4, T6) usa a faixa única, com `data-testid` por código. Sem "classe de serviço" na UI. `lido`

## Achados novos

### Baixo
**B2. Frase fixa da faixa e o complemento do T4 ficam sem sentido quando n = 0.**
Onde: `SemPrioridade.tsx` (frase "Esses cartões foram trabalhados normalmente...") e `CartaoT4.tsx:89` (complemento sempre passado).
Por quê: com `n = 0` a faixa lê "0 de 252 entregues (0%). Esses cartões foram trabalhados...", e no T4 afirma que "a chegada total é maior que a soma das prioridades", o que é falso. Pouco provável hoje (a base real tem sem prioridade), mas vale em recorte filtrado.
Correção: com `n = 0`, mostrar só "Sem prioridade (BusinessMap): nenhum cartão sem prioridade neste recorte." e omitir a frase e o complemento.

## Acessibilidade (`lido`)
- A faixa é texto (`<p>` com `<strong>`); o destaque soma ícone, fundo e borda ao texto, então não depende de cor. Ícone decorativo ao lado de texto completo.
- Contraste de `text-texto-2` e de `bg-alerta-fundo` com `text-sm`: sem medição, o QA mede.

## Perguntas ao dono
As duas perguntas do parecer anterior (proporção na faixa; frase "foi entregue" na faixa) foram implementadas com a recomendação da UX; a confirmação é do dono na homologação (hipótese até lá).
