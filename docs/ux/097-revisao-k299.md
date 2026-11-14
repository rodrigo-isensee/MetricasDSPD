# 097 K-299: revisão de UX do ajuste do AP-PROJETO depois do L9 (E4.38)

- **Escopo:** conferir M-1, M-2, B-2 e B-3 de `docs/ux/097-revisao-l9.md` no código.
- **Base:** `fix/k299-ap-projeto-l9`, head 6279c8a4. Lidos: `CartaoDistribuicao.tsx`, `dezMaiores.ts`, `textos.ts` (bloco `MAIORES`), `dez-maiores.test.tsx` (trechos), `charts/Barras.tsx` (linhas de eixo).
- **Método:** leitura do código e dos testes. A interface não foi executada e nenhuma ferramenta de acessibilidade foi rodada: todo item de acessibilidade é `lido`, nenhum `medido`. Leitor de tela e tamanho real das barras ficam para a medição do QA.

## Veredito
**Aprovado.** Nenhum achado crítico, alto ou médio. Dois baixos, sem bloqueio.

## Conferência

| Item | Resultado | Evidência (`lido`) |
|---|---|---|
| M-1 rótulo que muda, sem `aria-expanded` | Conforme | O botão (`CartaoDistribuicao.tsx:107-109`) não tem `aria-expanded`; o rótulo alterna entre `verTodos(n)` e `verMaiores`. Teste da linha 80 e da 97 afirma `not.toHaveAttribute('aria-expanded')` nos dois estados. O botão fica montado nos dois estados (foco mantido). |
| M-2 região viva | Conforme | `<p role="status">` fica montado enquanto `cortado` (linha 81-85) e troca o texto: "Mostrando os 10 projetos com mais horas, de N." / "Mostrando todos os N projetos." Por estar montado antes da troca, o anúncio é confiável. Teste da linha 98 e 105 cobre os dois textos. A região de rolagem segue nomeada e com `tabIndex=0`. |
| B-2 selo Horas incompletas no Demais | Conforme | `demaisIncompleto` olha só as linhas depois dos 10 visíveis (linhas 56-57) e o selo entra na linha Demais; testes das linhas 157-172 cobrem com e sem incompleto, e com selo só na linha Demais. O selo tem texto, não depende de cor. |
| B-3 altura do gráfico | Aceito com ressalva (B-4 abaixo) | `alturaGrafico = min(1200, max(200, linhas*40))`, teste da linha 176. |
| Nenhuma métrica individual nem ranking de pessoa | Conforme | O cartão agrupa projetos por horas; nenhum texto novo cita pessoa; o "como ler" que diz que projeto não mede entrega segue no cartão. |

## Posição sobre o teto de 1200 px
Aceito o teto de 1200 px **para esta entrega**, sem exigir mudança. Os 40 px por linha e o piso de 200 px estão bons. O teto vale até 30 projetos sem perda alguma. Acima disso as linhas encolhem: o eixo usa `interval={0}` (todos os rótulos) com fonte 12 px, então a partir de cerca de 75 projetos (1200/16 px) os rótulos passam a se sobrepor. Se o dono quiser um valor, recomendo **2400 px** (60 linhas a 40 px; 100 linhas ainda a 24 px, que também é o piso do alvo da WCAG 2.5.8). Não é bloqueio: a tabela de detalhe abaixo lista todos os projetos e é a alternativa em texto do gráfico. Não conheço o número real de projetos por período; vale conferir no dado antes de mexer no teto.

## Achados

### Baixo
**B-4. Teto de 1200 px com mais de 30 projetos** (`dezMaiores.ts:7`). Onde: gráfico de Ver todos. Por quê: acima de 30 linhas a barra encolhe e, acima de cerca de 75, os rótulos se sobrepõem (`lido`; a sobreposição não foi medida). Correção: subir o teto para 2400 px (uma constante e o teste da linha 176) ou, se o dono preferir manter 1200, aceitar o risco enquanto o dado real não passar de 30 projetos.

**B-5. Texto de leitura do cartão** (`CartaoDistribuicao.tsx:164`), pré-existente e já registrado na revisão do L9: "reúne a maior parte das horas apontadas" pode enganar quando o percentual é pequeno. Não corrigido neste ajuste; segue para lote próprio: "É o projeto com mais horas apontadas".

## Não deve mudar
Selo calculado sobre todos os projetos, ordem do servidor sem reordenar, volta aos 10 ao reabrir, sem botão nem linha Demais com 10 projetos ou menos, ausência de pessoa.

## Estado
Revisão entregue ao Jarvis. Nenhuma decisão de produto pendente do dono; o valor do teto (B-4) é opcional.
