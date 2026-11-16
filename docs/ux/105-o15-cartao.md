# O15 com dado real: especificação do cartão (pedido 105, E7.11)

## Objetivo
O O15 passou a usar dado real (commit 248e8155). Duas coisas novas chegam do contrato: `fases[].contagem` pode ser `null` (fase com menos de 20 bugs) e há `bugsSemFase` (bugs do período sem fase de detecção). O cartão precisa dizer isso sem frase falsa e sem número inventado. Vale para o `CartaoO15` (`web/src/features/operacional/components/CartaoO15.tsx`).

## Decisões do dono que valem aqui (15/11/2026)
- O O15 só conta bugs que têm card da demanda (pai) na base. A nota diz quantos ficaram de fora.
- Mínimo de 20 bugs por fase. Abaixo disso a fase não publica contagem.
- Bug com pai Sprint ou com pai em backlog também fica sem fase (regras P-1 e P-2 da tabela aprovada).

## Definições para ler o contrato
- `bugsSemFase` = N (bugs fora da conta). `base.n` = bugs com fase. M = `base.n` + `bugsSemFase`.
- `fases[]` vem na ordem do processo; cada fase tem `contagem` (número ou `null`).
- Se `base.n` < 20, nenhuma fase chega a 20, então todas vêm nulas. Se `base.n` >= 20, pode haver fases nulas e não nulas, ou todas nulas (bugs espalhados).
- Fase nula continua somando em `base.n`, e as taxas usam `base.n`. Não somar contagens do gráfico para obter o total.

## O que mostrar

### 1. Nota de bugs fora da conta (nova)
Parágrafo fixo logo abaixo do texto "O que se cobra é a taxa de escape...", antes dos dois números grandes. `data-testid="o15-fora"`, texto normal (`text-sm`), sem cor de alerta e sem ícone: é informação, não erro.

Só aparece quando `bugsSemFase` > 0. Com `bugsSemFase` = 0, não aparece nada (nada de "0 de M").

Texto exato (N = `bugsSemFase`, M = `base.n` + `bugsSemFase`, números com `fmtInteiro`):
- N = 1: `1 de {M} bugs do período ficou fora desta conta: não tem fase de detecção na base.`
- N >= 2: `{N} de {M} bugs do período ficaram fora desta conta: não têm fase de detecção na base.`
- Segunda frase, sempre que a nota aparece: `O O15 conta só bugs ligados a um card da demanda; bug sem card da demanda, ligado a Sprint ou a item em backlog não entra.`

Caso de borda: M = 1 (só pode ser N = 1 e `base.n` = 0) usa `1 de 1 bug do período ficou fora desta conta: não tem fase de detecção na base.`

### 2. Frase de leitura (`leitura` do cartão), substitui a atual
A frase atual "As contagens por fase estão no gráfico." deixa de existir.

Monte a leitura em duas partes: parte das taxas + parte das fases.

Parte das taxas:
- Contenção e escape com `status` = `ok`: `{contenção} dos bugs foram contidos antes da homologação; {escape} chegaram à produção.` (igual à de hoje).
- Caso contrário (`base.n` < 20): `Percentuais indisponíveis: {base.n} de 20 bugs mínimos.`

Parte das fases (acrescentada depois de um espaço):
- Nenhuma fase nula: nada.
- Algumas nulas e outras não: `Fases com menos de 20 bugs aparecem sem contagem (—).`
- Todas nulas e `base.n` = 0: `Nenhum bug com fase de detecção no período.`
- Todas nulas e `base.n` >= 1: `Nenhuma fase chegou a 20 bugs, por isso o gráfico não mostra contagens.`

Exemplos de montagem (só ilustram o formato; os números vêm do contrato):
- `Percentuais indisponíveis: {base.n} de 20 bugs mínimos. Nenhuma fase chegou a 20 bugs, por isso o gráfico não mostra contagens.`
- `{contenção} dos bugs foram contidos antes da homologação; {escape} chegaram à produção. Fases com menos de 20 bugs aparecem sem contagem (—).`

### 3. Gráfico de barras por fase
- Algumas fases nulas: mantém o gráfico. A fase nula entra na ordem do processo, sem barra, e na tabela alternativa mostra `—` (o componente `Barras` já faz isso para `null`). Não usar zero no lugar de `null`.
- Logo abaixo do gráfico, linha `data-testid="o15-fases-sem-contagem"` com as fases nulas pelo nome (`fases[].fase`), na ordem do processo:
  - 1 fase: `Fase sem contagem (menos de 20 bugs): {fase}.`
  - 2 ou mais: `Fases sem contagem (menos de 20 bugs cada): {fase 1}, {fase 2} e {fase 3}.` (vírgulas, "e" antes da última).
- Todas as fases nulas: não desenhar o gráfico (seria um eixo vazio). No lugar, não mostrar nada além da leitura acima e da linha de fases sem contagem, nesta forma: `Fases sem contagem (menos de 20 bugs cada): ...` com todas as fases. Se `fases` vier vazio, a linha não aparece.

### 4. Números grandes e série mensal
- Sem mudança. Os dois números continuam `k de n` quando a taxa é `insuficiente`, e a série mensal continua só com `contencao.status` = `ok`.
- A marcação da versão de critério (`criterio-2026-11-15-o15-fase-dado-real`) já vem em `criterios.serie` e continua marcada no gráfico da série.

### 5. Estados que não mudam
Carregando, erro e "sem dado" seguem o `CartaoMetrica` atual. Nenhum texto novo aparece enquanto `d` for indefinido.

## Ajuste de nota metodológica (opcional, para o react-frontend)
Em `NOTAS_OPERACIONAL.O15.comoSeCalcula` (`web/src/features/operacional/notas.ts`), acrescentar no fim: `A fase é a coluna do card da demanda quando o bug foi aberto. Fase com menos de 20 bugs não mostra contagem.` Se alterar, atualizar os testes que leem esse texto.

## Acessibilidade (lido, pelo código; sem medição)
- A nota e a linha de fases sem contagem são parágrafos de texto, na ordem de leitura, sem depender de cor.
- O traço `—` do gráfico tem equivalente em texto na linha de fases sem contagem; a tabela alternativa do `Barras` já lista `—`.
- Nenhum elemento novo é interativo.

## Respeito às regras do briefing
Sem ranking, sem meta e sem comparação entre times. Só BusinessMap. Abaixo de 20 não publica estatística, e a contagem por fase segue a mesma regra.

## Critérios de aceite
- `CA-1` QUANDO `bugsSemFase` for maior que 0 O SISTEMA DEVE mostrar, abaixo do texto fixo, a nota `data-testid="o15-fora"` com N e M, M = `base.n` + `bugsSemFase`, e a segunda frase da seção 1.
- `CA-2` QUANDO `bugsSemFase` for 1 O SISTEMA DEVE usar "ficou" e "não tem" (singular); QUANDO for 2 ou mais, "ficaram" e "não têm".
- `CA-3` QUANDO `bugsSemFase` for 0 O SISTEMA NÃO DEVE mostrar a nota `o15-fora`.
- `CA-4` O SISTEMA NÃO DEVE mostrar a frase "As contagens por fase estão no gráfico" em nenhum estado.
- `CA-5` QUANDO `base.n` for menor que 20 O SISTEMA DEVE mostrar "Percentuais indisponíveis: {base.n} de 20 bugs mínimos." seguido da frase de fases correspondente (`base.n` = 0: "Nenhum bug com fase de detecção no período."; `base.n` >= 1: "Nenhuma fase chegou a 20 bugs, por isso o gráfico não mostra contagens.").
- `CA-6` QUANDO as taxas estiverem `ok` e ao menos uma fase tiver `contagem` nula e outra não O SISTEMA DEVE acrescentar à leitura "Fases com menos de 20 bugs aparecem sem contagem (—)."
- `CA-7` QUANDO as taxas estiverem `ok` e todas as fases tiverem `contagem` nula O SISTEMA DEVE acrescentar à leitura "Nenhuma fase chegou a 20 bugs, por isso o gráfico não mostra contagens." e não desenhar o gráfico de barras.
- `CA-8` QUANDO ao menos uma fase tiver `contagem` nula O SISTEMA DEVE mostrar a linha `o15-fases-sem-contagem` com os nomes dessas fases na ordem do processo, no singular ("Fase sem contagem (menos de 20 bugs): X.") com uma fase e no plural ("Fases sem contagem (menos de 20 bugs cada): X e Y.") com duas ou mais.
- `CA-9` QUANDO uma fase tiver `contagem` nula e o gráfico for desenhado O SISTEMA DEVE mostrar `—` para essa fase na tabela alternativa e nunca o valor 0.
- `CA-10` QUANDO nenhuma fase tiver `contagem` nula O SISTEMA NÃO DEVE mostrar a linha `o15-fases-sem-contagem` nem frase de fases na leitura.
- `CA-11` O SISTEMA DEVE manter os números `o15-contencao` e `o15-escape` e a série mensal como estão hoje (`k de n` com taxa `insuficiente`; série só com taxa `ok`).

## Necessidades de dados
Já entregues pelo contrato `resultadoO15`: `fases[].fase`, `fases[].contagem` (nulável), `bugsSemFase`, `base.n`, `contencao`, `escape`, `serieMensal`, `criterios`. Nada novo ao back-end.

## Perguntas abertas
Nenhuma. O texto da nota usa "não têm fase de detecção na base" e lista os três motivos da decisão do dono (sem card da demanda, Sprint, backlog) numa frase só; se o dono preferir separar a contagem por motivo, o contrato precisa trazer essa quebra (hoje traz só o total).
