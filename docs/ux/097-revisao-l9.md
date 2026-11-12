# 097 L9: revisão de UX da interface implementada (E3.5)

- **Escopo:** AP-PROJETO com os 10 projetos de mais horas, linha Demais e botão Ver todos (E5, CA-33 a CA-38).
- **Base:** `feature/097-l9-dez-maiores`, head 98e32134 (QA b3b50478, review a805056f aprovados). Arquivos lidos: `CartaoDistribuicao.tsx`, `textos.ts` (bloco `MAIORES`), `dezMaiores.ts`, `dez-maiores.test.tsx`, `Botao.tsx`, `tokens.css`; plano `docs/analises/097-plano-e5-e7.md` (§3).
- **Método:** leitura do código e dos testes; a interface não foi executada no navegador e nenhuma ferramenta de acessibilidade foi rodada. Todo item de acessibilidade abaixo é `lido`, nenhum `medido`; contraste, leitor de tela e tamanho real do alvo ficam para a medição do QA (`@axe`). O texto da especificação de UX dos CA-33 a CA-38 (branch `origin/docs/097-ux-recolher-setor`) não pôde ser lido por mim (sem acesso a git); conferi os critérios pelo plano e pelos nomes dos testes.

## Veredito
**Aprovado com ressalvas.** Nenhum achado crítico ou alto. Dois médios e três baixos, todos tratáveis em lote posterior (cartão K) sem bloquear o merge do L9.

## Conferência pedida

| Item | Resultado | Evidência (`lido`) |
|---|---|---|
| Textos | Conforme, com um desvio de redação (B-1) | `MAIORES.mostrando` = "Mostrando os 10 projetos com mais horas, de N."; `demais` = "Demais N projeto(s): X h" com singular; `verTodos` = "Ver todos os N projetos"; `verMaiores` = "Ver só os 10 maiores". Número 10 vem de `LIMITE_MAIORES`, sem número escrito à mão. Testes provam 12 e 11 projetos (plural e singular). |
| Botão com estado anunciado | Conforme, com ressalva (M-1) | `aria-expanded` falso/verdadeiro; o mesmo elemento permanece montado nos dois estados, por isso o foco se mantém (teste CA-35 afirma `toHaveFocus`). |
| Região com rolagem | Conforme, com ressalva (M-2) | `role="region"`, `tabIndex=0`, `aria-label` "Todos os projetos, com rolagem", `max-h-[360px] overflow-y-auto`: a rolagem é alcançável por teclado (WCAG 2.1.1) e nomeada. Foco visível vem do `:focus-visible` global (`tokens.css:128`). |
| Selo de incompleto sobre todos | Conforme | `comSelo` é calculado sobre `todas`, não sobre as 10; a lista "Projetos com horas incompletas" e a coluna Observação aparecem com ou sem corte. Teste cobre projeto 11 fora dos 10 (R5 do plano). |
| Nenhum ranking de pessoa | Conforme | O corte é de projetos por horas, rótulo de agrupamento; nenhum texto, linha ou ordem cita pessoa. O cartão mantém o "como ler" que diz que projeto não mede entrega. |
| Corte e ordem | Conforme | `dezMaiores` corta a ordem do servidor sem reordenar; empate na 10ª vaga tem teste. CA-36 (10 ou menos: sem frase, sem Demais, sem botão) tem teste. CA-38 (não lembra a escolha) tem teste. |
| Alvo e tamanho do botão | Provável conforme | `Botao` usa a classe `alvo` e `py-1.5`; `text-xs` reduz a fonte. Tamanho de 24 px (WCAG 2.5.8) não medido: `lido`. |

## Achados

### Médio
**M-1. Botão que muda o rótulo e também o `aria-expanded`** (`CartaoDistribuicao.tsx:104-110`). Onde: botão Ver todos / Ver só os 10 maiores. Por quê: o padrão de botão de alternância pede um rótulo fixo com `aria-expanded`, ou rótulo que muda sem `aria-expanded`; os dois juntos fazem alguns leitores dizerem "Ver só os 10 maiores, expandido", o que confunde (WCAG 4.1.2, Nielsen: correspondência com o mundo real). Correção: manter só a troca de rótulo e retirar o `aria-expanded`, ou manter o `aria-expanded` com o rótulo fixo "Ver todos os N projetos". Recomendação: manter o rótulo que muda (o texto já diz a ação) e remover `aria-expanded`; acrescentar `aria-controls` apontando para a região, se mantiver o atributo. Confirmar com leitor de tela na medição do QA.

**M-2. A mudança de conteúdo ao expandir não é anunciada e o foco é mantido no botão sem contexto** (`CartaoDistribuicao.tsx:79-101`). Onde: ao ativar o botão somem a frase "Mostrando os 10..." e a linha Demais, e surge a região. Por quê: quem usa leitor de tela só ouve o novo rótulo e não sabe que a lista cresceu nem onde ela está (WCAG 4.1.3, visibilidade do status). Correção: uma região viva discreta (`role="status"`, fora da tela ou em texto visível) com "Mostrando todos os N projetos" ao expandir e "Mostrando os 10 projetos com mais horas, de N" ao recolher, ou trocar a frase "Mostrando..." por uma versão para os dois estados em vez de removê-la.

### Baixo
**B-1. Redação da frase de contagem.** Pedido pelo brief: "Mostrando os 10 de N". Implementado: "Mostrando os 10 projetos com mais horas, de N." É mais clara (diz o critério de corte) e fica; registrar a decisão para o QA não tratar como divergência. Sem ação, salvo contrário do dono.

**B-2. Linha Demais não indica horas incompletas.** Se um projeto incompleto está entre os demais, a soma Demais pode estar abaixo do real e a linha não diz isso; a lista de selos logo abaixo cobre, mas separada. Correção opcional: acrescentar o selo "Horas incompletas" à linha Demais quando algum dos demais está em `incompletos`. Mitigado pelo aviso do topo da aba.

**B-3. Altura do gráfico expandido e tabela.** O gráfico em `Barras` usa `altura = max(200, linhas*40)` dentro de uma região de 360 px: com muitos projetos a rolagem fica longa, e a tabela de detalhe lista todas as linhas abaixo sem recolher. Aceitável pelo plano; observar no uso real e, se o número de projetos for grande (centenas), considerar paginar a tabela. Não verifiquei se `TabelaDados` tem região de rolagem própria (os testes de `revisao-ux` sugerem que sim).

### Observação fora do L9 (pré-existente)
O texto de leitura do cartão diz que o projeto do topo "reúne a maior parte das horas apontadas" mesmo quando o percentual é pequeno (`CartaoDistribuicao.tsx:164-170`). Com a lista maior isso pode enganar; ajustar para "É o projeto com mais horas apontadas" em lote próprio.

## Não deve mudar
Selo sobre todos os projetos, ordem do servidor, ausência de pessoa, volta aos 10 ao reabrir (CA-38), sem botão com 10 ou menos (CA-36).

## Estado
Revisão entregue ao Jarvis; nenhuma decisão de produto pendente do dono nesta revisão. M-1 e M-2 vão como ajuste ao react-frontend, a critério do tech-lead.
