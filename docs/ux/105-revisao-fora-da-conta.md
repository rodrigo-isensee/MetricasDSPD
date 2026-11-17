# Revisão de UX do K-404 (E7.490): "Fora da conta:" no cartão vazio

parecer: aprovado com ressalvas (3 achados baixos, nenhum bloqueia). Revisado em 6e7dfe71, leitura do código; nada medido. Sem PR: a suíte fica para o CI do PR, e este parecer não afirma CI verde (cita só o pronto rc=0 do autor).

## Escopo lido
CartaoS1.tsx (notaForaDaMatriz), sustentacao/components/comuns.tsx (S5 a S7, S11), operacionais.tsx (notaPreenchimentoO25, nota do vazio), estrategicas.tsx, complementares/sustentacao.tsx, CartaoT9.tsx.

## Achados
1. Baixo, T9 (CartaoT9.tsx:47 e :35): no vazio lê "Fora da conta: 3 projetos sem data de início ficaram fora desta conta." Repete "fora da conta" duas vezes. Correção: no vazio, "Fora da conta: 3 projetos sem data de início." (ou manter a frase longa só no corpo).
2. Baixo, S5 a S7 e S11 (comuns.tsx:41 a 42): "Fora da conta: 2 chamados ficaram fora desta métrica: ..." repete a ideia e empilha dois dois-pontos. Correção sugerida: no vazio, o prefixo substitui "ficaram fora desta métrica": "Fora da conta: 2 chamados, de outro fluxo, sem fluxo ou com mais de um. A métrica vale só para os cinco fluxos do PROC."
3. Baixo, O25 (operacionais.tsx:707 a 709): o vazio termina com "fora da taxa", redundante com o prefixo. Correção: "Fora da conta: 2 cards têm motivo de descarte sem estar descartado nem excluído." (cortar "fora da taxa" no vazio).

Os três são de redação; o prefixo cumpre o objetivo (nota do vazio deixa de parecer contradição) e com dado nada muda.

## As duas escolhas do autor
- O25 vazio troca "Aviso de preenchimento:" por "Fora da conta:": concordo. Com a taxa sem dado, "aviso de preenchimento" sugere erro do usuário e o cartão vazio parece contradizer o aviso; "Fora da conta:" diz o que é (itens excluídos do cálculo) e é coerente com os demais cartões. No corpo, o rótulo original permanece, e é correto, pois ali o foco é qualidade de dado. Há uma inconsistência de rótulo entre corpo e vazio no mesmo cartão, aceitável porque cada rótulo descreve o papel da nota naquele estado. Ver achado 3.
- S1 vazio: nota antes da frase da escala: concordo. No vazio a informação nova é o que ficou fora; "Mede só P1 a P5" é contexto e vem depois, e a leitura "Fora da conta: N de outras escalas ... Mede só a escala P1 a P5" fecha com a explicação. Com dado a ordem original fica (escala, depois exceção), então o cartão do S1 usa duas ordens conforme o estado; é consistente com a regra "no vazio a exclusão vem primeiro". Sem `f` (undefined), mantém só a frase da escala, sem prefixo vazio: correto, não há nada fora da conta a informar.

## Acessibilidade e outros
- Texto puro em parágrafos, sem depender de cor; `lido`, sem mudança de contraste ou foco (mesmos elementos e classes). Leitor de tela: `lido`, o prefixo é lido na ordem natural; não medido.
- Nenhuma ocorrência de "Fora da conta:" restante fora dos 10 cartões listados no brief (Grep em web/src, excluindo testes); O19 e E6 aparecem via operacionais.tsx:136 e estrategicas.tsx:196, S8 via complementares/sustentacao.tsx:97.

## Provas
- Revisão por leitura; PQ do autor (pronto rc=0) citado, não reexecutado.
