# 105 · Revisão de UX do O8 por tamanho (régua de seis faixas por time)

parecer: aprovado com ressalvas (nenhum achado crítico ou alto)
commit: 0ccb21ef

Revisão sobre 0ccb21ef de `web/src/features/complementares/fluxo.tsx` (E7.134), contra as decisões do dono de 16/11 e a heurística de Nielsen. Tudo abaixo é `lido` (código e nomes de testes); não rodei a interface, não medi contraste nem leitor de tela (o QA mede, `@axe`). Sem shell: o `forge-check proximo` foi pulado. Sem PR para a branch: não afirmo CI verde; os testes citados são do autor e não os executei.

## Decisões do dono contra o código (lido)
| Decisão | Resultado | Onde |
|---|---|---|
| Seis faixas, sempre na mesma ordem (PP, P, M, G, GG, XG) | atende | `FAIXAS_O8` parte de `TAMANHOS_REGUA` (`packages/contratos/src/comum.ts:99`) |
| Faixa sem entrega diz "sem entregas neste tamanho", nunca 0 | atende | `fluxo.tsx:147-148`; faixa ausente da resposta cai no mesmo texto |
| Abaixo de 20, amostra insuficiente | atende | `mediana == null` com `n > 0` mostra "amostra insuficiente (N de 20 itens mínimos)"; sem mediana nem P85 inventados |
| Demais times "sem tamanho registrado" | atende no dado, não no texto | entram em "Sem tamanho", só quando `n > 0`; a expressão do dono não aparece na tela (R-2) |
| Nota da régua por time, sem comparar times | atende em parte | `nota-O8-regua` diz que cada time tem a sua régua e que os tamanhos aparecem somados, sem comparar times (R-2) |
| Texto simples | atende | lista de `li` com texto, sem tooltip |

Nada de métrica proibida: sem ranking, sem meta por pessoa, sem comparação entre times, sem média isolada (a tabela mantém média só com mediana e P85). Sem dado de pessoa.

## Achados
### Médio
- **R-1 · A nota "Sem divisão por tamanho" afirma uma causa que o novo critério não garante.** `fluxo.tsx:266-268` diz "Nenhum card concluído ... tem tamanho declarado no quadro". Pela régua, o tamanho nulo também vem de size fora da régua do time ou de time sem régua. O texto induz a ler "ninguém preencheu" quando pode ser "preenchido fora da régua" (heurística 1, correspondência com o mundo real; risco de ação errada no quadro). Correção: texto neutro, por exemplo "Sem divisão por tamanho: <tipos>. Nenhum card concluído desse tipo, no período, tem tamanho na régua do time. A mediana e o P85 dele estão na tabela acima." Atualizar o teste da linha 365-383 junto.

### Baixo
- **R-2 · A nota da régua não diz o que acontece com os times sem régua.** `nota-O8-regua` (255-258) não explica "Sem tamanho" nem o "sem tamanho registrado" decidido pelo dono. Quem vê a faixa "Sem tamanho: mediana..." não sabe se é time sem régua ou card sem size. Correção: acrescentar uma frase, por exemplo "Cards de times sem régua, ou sem tamanho registrado, ficam em Sem tamanho." Sem nomear times, para manter a ausência de comparação.
- **R-3 · Legenda do gráfico com série vazia (era R-4 do K-361, segue aberto, `lido`).** `series={FAIXAS_O8.map(...)}` (247-250) inclui "Sem tamanho" sempre; `Barras` monta a legenda de todas as séries. Quando ninguém está em "Sem tamanho", a legenda mostra uma série sem barra, enquanto a lista abaixo a omite de propósito: duas telas dizendo coisas diferentes. Correção: passar às séries só as faixas com algum valor em `comTamanho`. Faixas da régua (PP a XG) podem continuar sempre na legenda, coerente com "seis faixas sempre".
- **R-4 · O gráfico e a lista não distinguem as faixas pelo mesmo canal.** No gráfico, faixa com amostra insuficiente e faixa sem entregas são ambas ausência de barra; só a lista abaixo as separa. A lista cumpre a decisão do dono, então não bloqueia, mas o `Leia` poderia dizer "Faixas sem barra: veja a lista abaixo" (heurística 6, reconhecer em vez de lembrar). Sem mudança obrigatória.
- **R-5 · Repetição.** Com N tipos, são 6N linhas quase iguais ("sem entregas neste tamanho"). Aceitável pela decisão do dono (seis faixas sempre); se o cartão ficar longo, considerar `<details>` por tipo. Sem ação agora.

## Acessibilidade (WCAG 2.2 AA, `lido`)
- Estrutura: `section` com `aria-label`, `h4` > `h5`, `ul` semântica; ordem de leitura lógica (título, gráfico, nota, faixas).
- Informação em texto, não só em cor; a lista é a alternativa textual do gráfico.
- Contraste dos tokens `texto` e `texto-2` e a legenda de 7 séries: `lido`, sem medição; o QA mede.
- Sem alvos interativos novos, sem animação nova.

## Microcopy
Português claro, voz direta. "sem entregas neste tamanho" e "amostra insuficiente (N de 20 itens mínimos)" conferem com as decisões. Só R-1 e R-2 pedem ajuste de texto.

## Veredito
Aprovado com ressalvas: sem achado crítico ou alto. Recomendo corrigir R-1 antes da liberação (texto pode induzir erro de leitura); R-2 a R-5 podem virar cartão próprio.
