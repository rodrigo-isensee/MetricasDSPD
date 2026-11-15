# 105 · Revisão de UX do K-361 (O8, tipo sem tamanho)

parecer: aprovado com ressalvas (nenhum achado crítico ou alto). Revisão sobre 9bc48a00, contra `docs/ux/105-k361-o8-sem-tamanho.md`. Tudo abaixo é `lido` (código e testes); não rodei a interface nem medi contraste ou leitor de tela (o QA mede, `@axe`).

## Critérios de aceite (lido em `web/src/features/complementares/fluxo.tsx`)
| CA | Resultado | Onde |
|---|---|---|
| CA-1 | atende | `comTamanho` alimenta `categorias` do gráfico (linha 196); o tipo sem tamanho sai |
| CA-2 | atende | nota nas linhas 209-216, depois do gráfico; lista na ordem da tabela (`ok.filter` mantém a ordem); singular e plural tratados |
| CA-3 | atende | a tabela continua com `ok.map`, e a nota aponta "na tabela acima" |
| CA-4 | atende, com ressalva R-2 | sem número de dado, sem %, sem "zero" |
| CA-5 | atende | `motivoPorTamanho != null` mantém `EstadoSemDadoReal` e a nota exige `motivoPorTamanho == null` |
| CA-6 | atende | a nota exige `semTamanho.length > 0` |
| CA-7 | atende (`lido`) | é um `<p>` fora do svg; o teste confere `tagName === 'P'` e `closest('svg') === null` |

O que não deve mudar fica intacto: `o8.ts`, o contrato e o `motivoPorTamanho` não foram tocados. Nenhuma métrica proibida, comparação entre times ou dado de pessoa entra.

## Achados
### Médio
- **R-1 · O gráfico por tamanho não tem o título "Por tamanho declarado" quando é desenhado.** O wireframe da especificação abre com "Por tamanho declarado" acima do gráfico. No código o `h4` (linha 187) só existe no ramo do `motivoPorTamanho`. No ramo com gráfico, `descricao` do `Barras` vira só a legenda da tabela alternativa (`Barras.tsx:171`), não um título visível. Resultado: a nota "Sem divisão por tamanho..." aparece sem o subtítulo da seção, e o gráfico fica sem rótulo visível (heurística 1, visibilidade, e 2, correspondência). Isso já era assim antes do K-361, mas a nota agora depende desse contexto. Correção: renderizar o `h4` "Por tamanho declarado" também quando houver gráfico (`ok.length > 0`), antes das barras. Se preferirem manter o escopo, o ajuste vira cartão próprio. Hoje o teste da linha 332 afirma a ausência do título no caso incoerente, então ele muda junto.

### Baixo
- **R-2 · A especificação se contradiz no CA-4.** A nota exigida contém "P85" (dígitos), e o CA-4 diz "sem número". O código segue a microcopy, que é o correto, e o teste remove "P85" antes de checar. Ajuste meu: o CA-4 deve dizer "sem número de dado (P85 é o nome do percentil)". Sem mudança no código.
- **R-3 · O teste de CA-3 só confere que o nome do tipo está na tabela**, não que a mediana e o P85 dele aparecem. Reforçar com uma asserção da linha do tipo na tabela. Baixo, a tabela não foi tocada.
- **R-4 · Legenda do gráfico (não verificado).** `series` sempre inclui "Sem tamanho" e "Tamanho P/M/G". Se `Barras` mostrar a legenda de séries sem valor, pode aparecer "Sem tamanho" sem nenhuma barra, o que lembra a decisão L24 (a). Não li a lógica de legenda de `Barras`; peço ao QA que confira no navegador. Se aparecer, filtrar as séries sem valor.

## Acessibilidade e microcopy
- Parágrafo com `text-sm text-texto`: sem cor como único canal, sem tooltip; contraste do token `texto` `lido`, sem medição.
- Português claro, voz direta, concordância correta em singular e plural ("dele estão", "deles estão"). Os nomes dos tipos vêm do contrato.

## Fora do escopo (como a especificação previu)
Tipo com `porTamanho` mas com todas as medianas nulas (menos de 20 itens por tamanho) segue sem barra e sem texto. Nenhum teste o cobre. Se o QA o reproduzir, vira pergunta ao tech-lead.
