# Revisão de UX: faixa Sem prioridade com n = 0 (E7.461, K-378)

Head revisado: 7e75897e. Leitura do código na worktree; nada medido (`lido`).

parecer: aprovado, sem achados críticos, altos ou médios; um baixo.

## O que foi verificado

- Com n = 0 a faixa mostra "Sem prioridade (BusinessMap): nenhum cartão sem prioridade neste recorte." (SemPrioridade.tsx, linhas 44-45). Frase clara, em voz direta, no vocabulário do usuário; a frase fixa "trabalhados normalmente..." e o complemento não aparecem. Não afirma nada sobre cartões que não existem. (lido)
- Com n = 0 o destaque fica desligado (pct = 0, menor que 20), então a faixa não ganha ícone nem fundo de alerta; coerente com a mensagem, que é informativa. (lido)
- Com n > 0 o ramo é o mesmo de antes: contagem "n de total universo (pct)", frase fixa e complemento. Teste novo cobre os dois ramos (SemPrioridade.test.tsx). (lido)
- Não contradiz o cartão: `maioriaSemPrioridade` exige n * 2 > total, logo é falso com n = 0, e a leitura do cartão não avisa de "maioria sem prioridade" junto com a faixa. Os sete consumidores (T1, T2, T4, T6, O6, O24) usam o mesmo componente. (lido)
- Acessibilidade: continua texto em parágrafo; informação não depende de cor. Sem mudança de contraste ou foco. (lido)

## Achados

- Baixo: com n = 0 e total = 0 (recorte vazio) a faixa também diz "nenhum cartão sem prioridade neste recorte". É verdadeiro, mas quando o recorte está vazio o cartão já mostra estado vazio e a faixa é redundante. Sem correção obrigatória; opcional ocultar a faixa quando total = 0 e n = 0.

## Fora do que foi verificado

- Suíte completa e CI: sem PR para a branch, ficam para o CI do PR; este parecer não afirma CI verde. Cito apenas o PQ do autor (pronto rc=0 na terceira execução, informado no brief).
