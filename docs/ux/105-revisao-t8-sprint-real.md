# Revisão de UX do cartão T8 com dado real (E7.531, revalidada em E7.540)

commit: 7c403716af70267388fb1cf15cda3c28023178c3

parecer: aprovado com ressalva (nenhum crítico ou alto; 1 médio aberto, 2 baixos resolvidos, 1 baixo mantido)

Escopo: `web/src/features/complementares/previsao.tsx` (`CartaoT8`, `notaForaDaContaT8`). Leitura só pelo código; nada medido. Sem PR: não afirmo CI verde.

## Achados originais (head 453348a2)
- M1 (médio) Frase de menos de 20 sprints convive com gráfico e tabela por sprint.
- B1 (baixo) Legenda da tabela misturava regra de itens com a de sprints.
- B2 (baixo) A frase não dizia o que fazer.
- B3 (baixo) Nota "Fora da conta" com peso visual baixo.

## Revalidação (head 7c403716)
- **B1 resolvido** (lido, previsao.tsx:183): legenda agora diz "abaixo de 20 sprints no recorte nada é publicado".
- **B2 resolvido** (lido, :158): "Só N sprint(s) no recorte: abaixo de 20 não se publica estatística; amplie o período para ver a taxa." Plural correto; o limite vem de `MINIMO_AMOSTRA` do contrato (:2, :149), sem número solto.
- **Nota da conta** (lido, :113): o comentário e a regra "só entre as sprints concluídas no período" são coerentes com a decisão 2 = A; texto da nota inalterado e claro.
- **M1 continua aberto** (lido, :164-204): com `poucas` verdadeiro o corpo ainda renderiza `Barras` e `TabelaDados` com `textoTaxa` por sprint. Não verifiquei o back-end (fora do meu recorte). Se os percentuais por sprint vierem como `insuficiente`, a tela é coerente; se vierem valores, contradiz a frase. Correção: não renderizar as barras quando `poucas` e/ou garantir teste que cubra esse estado. Severidade média mantida; não bloqueia.
- **B3 mantido** (baixo): nota em `Leia`, contraste do token não medido; aceitável.

## Pontos bons mantidos
Sem alvo de 100%, leitura junto da entrada não planejada, "sem comparar times" (sem ranking individual); séries por padrão liso/hachura e tabela como alternativa textual (WCAG 1.4.1, lido).
