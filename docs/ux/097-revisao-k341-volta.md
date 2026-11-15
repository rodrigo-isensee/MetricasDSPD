# Revisão de UX da volta do K-341 (E4.107): linha sem projeto fora do gráfico

Escopo: `CartaoDistribuicao.tsx`, `textos.ts` e `sem-projeto-fixo.test.tsx` na worktree `MetricasDSPD-052h` (head e51c38c1), CA-33 e CA-34 de `docs/ux/097-filtros-time-busca.md`, contra a decisão do dono (opção a, 14/11 15:20) e os achados médios de `docs/ux/097-revisao-k341.md`. Sem shell: não rodei testes nem ferramenta de acessibilidade. Itens de acessibilidade marcados `lido`.

## Veredito
Aprovado do ponto de vista de UX, sem achado crítico, alto ou médio. Dois achados baixos e uma sugestão de texto.

## Achados médios da revisão anterior
1. Barra extra sem explicação: **resolvido** (lido). O `Barras` recebe só `projetosMostrados`; a linha sem projeto saiu do gráfico e vira o parágrafo `linha-sem-projeto`. Com 12 projetos o gráfico tem 10 barras, igual ao "Mostrando os 10 ... de 12".
2. Ordem "Demais" depois da linha fixa: **resolvido** (lido). Ordem no DOM: gráfico, "Demais", botão, linha sem projeto, selos, tabela. O teste compara posição no DOM contra `projetos-demais` e contra o botão.
3. Região rolável incluía a barra: **resolvido** (lido). Com "Ver todos", a região `projetos-todos` envolve só o gráfico; a linha vem depois dela. Teste `regiao.contains(linha) === false`.
Baixos 4 e 5 da revisão anterior: também resolvidos (a linha tem texto próprio com 10 projetos ou menos; há teste de posição no DOM). O baixo 6 não muda.

## CA-33 e CA-34 novos
Atendidos (lido): a linha fica fora das dez vagas, de N, de N-10, de X e do "Ver todos os N", depois de "Demais" e do botão, e fora da região rolável. A tabela de dados mantém a linha por último, com horas e parte das horas.

## O texto "Sem iniciativa, não conta como projeto: X h"
Lê-se bem. Diz o rótulo, a regra e o valor, em uma frase curta, na cor secundária, que a separa dos "Demais". Duas observações:
- Baixo. A vírgula e os dois-pontos deixam uma leitura possível de que as X h ficam fora do total. Elas entram nas horas totais (o resumo recolhido diz "e horas sem projeto, ... no total"). Sugestão, a critério do dono: "Sem iniciativa (não conta como projeto): 50 h, incluídas no total." Não bloqueia.
- Baixo. "Iniciativa" e "projeto" aparecem juntos; o "Como ler" do cartão já explica que projeto é a iniciativa raiz, então a leitura se sustenta. Nada a mudar.
- Acessibilidade (lido): é um `<p>` simples, na ordem de leitura do leitor de tela depois de "Demais" e do botão; não depende de cor; a informação também está na tabela.

## Caso em que só existe a linha sem projeto
Funciona (lido). `projetos` fica vazio, `dezMaiores` não corta, `projetosMostrados.length === 0` faz o gráfico não ser renderizado (retorna `null`), não aparecem "Mostrando", "Demais" nem botão, e a frase de leitura não é montada. O cartão mostra a linha própria ("Sem iniciativa, não conta como projeto: 12 h") e a tabela com uma linha. O resumo recolhido diz "0 projetos e horas sem projeto, 12 h no total".
- Baixo. O título do cartão pergunta "Quais projetos receberam mais horas apontadas?" e a resposta é nenhum projeto, sem nenhuma frase que diga isso; a pessoa vê só a linha e a tabela. Sugestão para o dono decidir: uma frase "Nenhum projeto com horas neste período; as horas ficaram sem projeto." no lugar do gráfico. Se vier, precisa de CA próprio. Hoje não viola CA algum.

## Cobertura de teste (lido)
- O caso "só a linha" (`sem-projeto-fixo.test.tsx`, "só a linha sem projeto") afirma uma linha na tabela, sem Demais e sem botão, mas não afirma que a linha própria existe nem que não há gráfico. Baixo: acrescentar `getByTestId('linha-sem-projeto')` e a ausência do gráfico.
- O nome do teste "aparece com as horas dela no gráfico acessível e na tabela" ficou desatualizado: ela não está mais no gráfico, e o corpo só olha a tabela. Baixo: renomear.

## O que não deve mudar e foi preservado
Frase de leitura sem a linha, achado de concentração com "À parte, X h", selo de horas incompletas na lista de selos, região rolável com `role=region`, `tabIndex=0` e rótulo.
