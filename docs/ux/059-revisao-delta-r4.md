# Revisão de UX da aba Apontamento, renovação r4 (pedido 059, E2.64)

Veredito: aprovada. O seletor do Operacional com cinco opções fica em até 3 linhas em 375 px, também com fonte a 200%, e a quebra de palavra longa está na frase de leitura dos cartões e na frase do achado. Nenhum achado crítico, alto ou médio; dois baixos, que não bloqueiam o PR.

Método: leitura estática na worktree 052h de `SeletorCadencia.tsx`, `CartaoMetrica.tsx` (linha 313), `CartaoAchados.tsx` (linha 78), do teste "rótulo de projeto longo" em `barra-e-ramos.test.tsx` e de `e2e/tests/sustentacao-no-operacional-qa.spec.ts` (CT-32), contra `docs/ux/059-revisao-delta-r3.md`. Não executei a aplicação nem a suíte (o papel não tem Bash); o resultado verde do E2E (795 testes) vem do registro de 23:35. Medição visual real segue com o QA. Nenhum nome de pessoa neste parecer.

## Conferência

| Ponto | Resultado | Evidência |
|---|---|---|
| Seletor com cinco opções em até 3 linhas a 375 px | Atendido | Abaixo de 400 px o grupo é uma grade de 2 colunas (`grid-cols-[repeat(2,minmax(0,1fr))]`): 5 opções dão 2 + 2 + 1, no máximo 3 linhas, por construção e não por acaso de largura. A partir de 400 px vira linha que quebra (`inline-flex flex-wrap`). CT-32 "seletor a 375 px (fonte normal)" confere `tops` distintos menor ou igual a 3. |
| Mesmo limite com fonte a 200% | Atendido | A grade de 2 colunas não depende do tamanho da fonte, então o número de linhas não cresce. CT-32 "fonte ampliada a 200%" confere 5 rótulos, no máximo 3 linhas, altura de cada rótulo maior ou igual a 43,5 px e todos dentro do recipiente. |
| Alvo de toque | Atendido | Classe `alvo` nos rótulos, teste exige 44 px a 375 px (acima do mínimo de 24 px da WCAG 2.2 AA, 2.5.8). |
| Palavra longa na frase de leitura | Atendido | `[overflow-wrap:anywhere]` no parágrafo `leitura-<código>` de `CartaoMetrica`; o teste confere a classe em todos os cartões `leitura-AP-*`. |
| Palavra longa na frase do achado | Atendido | `min-w-0 [overflow-wrap:anywhere]` no `span` da frase em `CartaoAchados`, dentro do `li` flex com quebra; `min-w-0` é o que deixa o item encolher. O teste usa rótulo de 100 caracteres sem espaço. |
| Rótulo do seletor | Atendido | `[overflow-wrap:anywhere]` e `min-w-0` nos rótulos impedem que a quinta visão estoure a célula. |
| Foco, seleção e rádio | Sem regressão | Contorno de foco no rótulo por `has-[:focus-visible]`, marca de seleção com ícone (não só cor), grupo com `aria-label`, como na r3. |

## Achados

- [baixo] R4-1. Onde: `SeletorCadencia`, 375 px com fonte a 200%. Por quê: a coluna tem cerca de metade da largura, e "Sustentação" não cabe com o recuo lateral, então a quebra por `anywhere` parte a palavra no meio, o que atrapalha a leitura embora cumpra o reflow. Correção: avaliar reduzir o recuo lateral (`px-2`) só abaixo de 400 px ou rótulo curto "Sustent." só nesse caso, se o dono quiser evitar a palavra partida.
- [baixo] R4-2. Onde: `SeletorCadencia`, abaixo de 400 px. Por quê: a quinta opção fica sozinha na última linha, com meia largura vazia, e a borda do grupo deixa o espaço em branco com aparência de lacuna. Correção: fazer a última opção ocupar as duas colunas (`last:col-span-2` quando o total for ímpar) ou aceitar a lacuna como está.

## Pendências herdadas, sem mudança

- R3-1 a R3-3 (rótulo "Tipo não encontrado", texto de saída do estado vazio, lista de tipos vazia) e R2-1 a R2-3 (verificação visual em 375 px com o QA; texto de `NOTA_OUTRA_AREA` a confirmar pelo dono): seguem como baixos, sem bloqueio.

## Recomendação

Aceitar as três linhas do seletor em 375 px, com fonte normal e a 200%, e a quebra de palavra longa nas duas frases. Liberar da perspectiva de UX; R4-1 e R4-2 podem virar melhoria depois.
