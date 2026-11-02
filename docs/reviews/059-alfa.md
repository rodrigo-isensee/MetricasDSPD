---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-contrato-biblioteca
commit: 51d9ed4fd9ff124a56ae167939cdc649ff8eab9d
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 059-aba-apontamento, trilha B (contrato, classificarApontamento e cálculos, E2.17, K-193)

**Veredito: reprovado** em `51d9ed4`. O contrato bate com o §3.9 e o classificador com o §3.4. Três bloqueantes: (A1) a CI está vermelha na ponta, porque o teste de orçamento do classificador estoura os 5 s; (A2) a biblioteca trata a entrada `outra-area`, que soma várias pessoas, como se fosse uma pessoa só, no dia atípico e na capacidade; (A3) o tamanho e a forma do PR pela decisão M14.

## Escopo lido
- `git log origin/develop..origin/feature/059-contrato-biblioteca`: 12 commits, de `279f9e2` a `51d9ed4` (B1 a B3, E2.21 e a volta E2.25 do parecer de segurança).
- Diff contra a develop (base `b1c2865`): 19 arquivos, todos lidos. Código: `packages/contratos/src/apontamento.ts`, `packages/metricas/src/coletor/classificarApontamento.ts`, `packages/metricas/src/businessmap/apontamento/*.ts` e os três `index.ts`. Nos testes, li os blocos de orçamento, matriz e ordem.
- Plano `docs/architecture/features/059-aba-apontamento.md` no ramo `origin/docs/059-apontamento-discovery`: §1.3 (o1 a o4), §3.4, §3.7 e §3.9.
- Para o A2, a forma como a rota usa a biblioteca: `server/src/modulos/apontamento/servico.ts:38-39` em `origin/feature/059-rota-apontamento` (`agruparOutraArea` troca o `pessoaRef` de quem não é do time por `outra-area`, e as linhas vão ao `calcularApontamento`).

## Conferência pedida
- **Contrato contra o §3.9:** confere. Comparei o bloco do plano com o arquivo (`diff -w`). A forma é a mesma. As diferenças são as permitidas ou já decididas: `diaCivil` recusa data inexistente; `conferirJanela` implementa o `superRefine` que o plano só descrevia (366 e 62 dias, sem eco do valor); `MAX_ROTULO` e o `superRefine` de rótulo fixo vêm do A5 e do A6 da segurança; `achado.valores` é uma união discriminada por decisão técnica do Jarvis de 2026-11-01 22:20; e há tipos exportados a mais.
- **Chave fixa `outra-area`:** `PESSOA_OUTRA_AREA` na união do `pessoaRefSchema` (`apontamento.ts:47-51`) e `ROTULO_OUTRA_AREA` entre os rótulos fixos aceitos com `nomesReais` falso (`:171-175`). Confere com a decisão do dono de 2026-11-02 sobre quem é do time.
- **Biblioteca compartilhada (T2.5):** confere. O piso vem de `publicavel` e `taxa` (`core/estatistica`), o calendário com feriados de `core/calendario` (`diasUteisNoIntervalo`, `ehDiaUtil`) e a ordem de `ordenarNeutro`. `pctComPiso` (`comum.ts:35`) fica no pacote de métricas e delega o piso a `publicavel`. A aba não calcula percentil nem Monte Carlo, e o domínio é só BusinessMap.
- **Piso de 20 (o3):** confere. Participação, qualidade por flag, matriz (com o `n` da pessoa), utilização por pessoa e por mês, e achados, que só saem com `status: 'ok'`. No contrato, `pctComPisoSchema` não aceita `pct` quando `n < 20`.
- **Genérico só para comentário escrito:** confere. Está em `classificarApontamento.ts:170` (`!semComentario && qtdPalavras <= 3`): o comentário vazio fica só com `sem-comentario`.
- **o1:** `ordenarPorPessoa` (`comum.ts:64`) ordena por rótulo com nomes ligados e pelo número da chave com nomes desligados, com `outra-area` sempre por último. Nunca ordena por total. **o2:** nenhum campo de meta, faixa, status ou média por pessoa, nem no contrato nem no cálculo. **o3:** ver acima. **o4:** não se aplica a esta branch, porque a exportação é do front (E2.31 e E2.32).
- **Classificador (§3.4):** truncagem em 2000 pontos de código antes de normalizar, normalização na ordem do plano, palavras `\p{L}\p{N}`, `startsWith` sem regex do dicionário (busca binária nas palavras ordenadas, equivalente à comparação ingênua, como a segurança conferiu) e nenhum log. Confere.

## Achados
- A1 (bloqueante) packages/metricas/src/coletor/classificarApontamento.test.ts:776 · CI vermelha em 51d9ed4 (run 41409248198, job testes): 10 000 comentários levaram 5919 ms, acima dos 5 s do §3.4. Reordenar as regras a cada chamada (:159) custa; ordene uma vez por dicionário ou meça fora da cobertura.
- A2 (bloqueante) packages/metricas/src/businessmap/apontamento/filtros.ts:267 · outra-area soma várias pessoas, mas diasAtipicos e capacidadePessoa/Mensal a tratam como uma: 3 pessoas com 6 h no dia dão dia atípico e 225% de utilização (teste no scratch). Tire outra-area desses cálculos, com teste.
- A3 (bloqueante) packages/metricas/src/businessmap/apontamento/index.ts:1 · decisão M14: 3674 linhas de código e teste e três comportamentos (contrato, classificador, cálculos). Divida em três PRs ou leve ao dono a exceção, com a linha teto: excedido no corpo do PR, como no 052 F4.
- A4 (recomendado) packages/metricas/src/businessmap/apontamento/index.ts:230 · pessoasAtivas conta outra-area como 1, qualquer que seja o número de pessoas por trás. Contar só quem é do time ou outro critério é pergunta ao dono, pelo Jarvis.
- A5 (recomendado) packages/metricas/src/businessmap/apontamento/diario.ts:149 · a faixa do mapa diário da linha outra-area soma várias pessoas (8 h de duas pessoas dá a faixa mais alta). Avaliar com o UX se essa linha leva faixa ou só a soma.
- A6 (recomendado) packages/metricas/src/businessmap/apontamento/index.ts:174 · segundo import de './comum' (o primeiro está em :167). Junte os dois.

## Detalhe

### A1: orçamento
O run 41409248198 roda em `51d9ed4`, com conclusão `failure`. O job `testes` (`pnpm run cobertura`, pacote `metricas`) falha em `classificarApontamento.test.ts > A3: orçamento de tempo > 10 000 comentários ... em até 5 s`, com `expected 5919.25702 to be less than 5000`. Os runs anteriores da branch (`de9e320`, `6de38da`, `7254244`) passaram, mas não tinham esse teste. O critério do plano é "termina em menos de 5 s na máquina de CI", então é requisito, e o teste mede o que o plano pede. O que mais custa por chamada, além do casamento, é a reordenação das regras (`ordenarNeutro` sobre 50 regras com espalhamento de objeto) a cada comentário. Pré-ordenar o dicionário uma vez, por exemplo numa função `prepararDicionario` que o coletor chama ao carregar a versão, tira esse custo sem mudar a saída. Se a instrumentação da cobertura for a causa principal, o teste de orçamento pode rodar fora dela, desde que meça o mesmo código e o mesmo teto. A escolha é do autor, e o teste não pode afrouxar o teto de 5 s.

### A2: `outra-area` não é uma pessoa
A biblioteca já conhece a chave (`comum.ts:52` e `:72`, ordem por último), e a rota (`servico.ts:38-39` da branch da rota) entrega todas as linhas de quem não é do time com `pessoaRef: 'outra-area'`. Com isso, três funções somam várias pessoas como se fossem uma:
- `diasAtipicos` (`filtros.ts:267`) agrupa por `pessoaRef|data`. O dia de "Outra área" passa de 16 h com três pessoas de 6 h, e as linhas delas ganham `valor-atipico`. Isso contamina `kpis.atipicos`, a qualidade por flag, o achado `dias-atipicos`, o filtro `anomalos=ocultar` e a marca `atipico` do diário. A regra do §3.6 é "a soma do dia da pessoa".
- `capacidadePessoa` (`capacidade.ts:46`) dá a "Outra área" a capacidade de uma pessoa (dias úteis do intervalo × 8 h) contra as horas de várias pessoas.
- `capacidadeMensal` (`capacidade.ts:86`) conta o intervalo de "Outra área" como uma pessoa ativa na capacidade do mês e soma todas as horas dela no realizado.

Prova: um teste de fora do repositório (no scratch do review, sem tocar a branch) chamou `diasAtipicos` e `capacidadePessoa` com três linhas `outra-area` de 6 h no mesmo dia útil. Saída: `atipicos [ 'outra-area|2026-09-01' ]` e `capacidadeSegundos 28800`, `realizadoSegundos 64800`.

A correção mínima, que não decide regra nova, é: `outra-area` fora do cálculo de dia atípico e fora da capacidade por pessoa e da mensal (na capacidade e no realizado, para a utilização do mês não inflar). Cada caso precisa de teste. Se o dono quiser as horas de outras áreas na utilização do time, é pergunta ao dono (vai junto com o A4).

### A3: decisão M14
Contagem com `git diff --numstat --no-renames origin/develop...HEAD`, sem `.md`: **3674 linhas** (só adições). A branch carrega três comportamentos: contrato zod, classificador na fronteira e cálculos da aba. Ainda não existe PR, então a linha de exceção ainda não tem onde estar. Sem divisão nem decisão do dono, o PR para a develop nasce acima do teto. O caminho do 052 F4 (exceção decidida pelo dono e registrada no corpo do PR com o número recontado) vale aqui se o Jarvis levar a pergunta. A alternativa é separar em três PRs empilhados. O plano §7.2 juntou B1 a B3 numa trilha só por causa do prazo, e isso pesa a favor da exceção, mas a decisão é do dono.

## Ferramentas e outros pareceres
- O `docs/engineering/praticas.md` não tem regra "decidida por: `<comando>`". Fica como pendência do tech-lead com o arquiteto, sem review manual de lint ou formatação.
- CI de `51d9ed4` (run 41409248198): `rapida`, `openapi`, `seguranca`, `imagem`, `build`, `filtro` e `banco` verdes; `testes` vermelho só no orçamento (A1), com 1248 de 1249 testes do `metricas` verdes; `e2e` e `perf` pulados. Não refiz a suíte.
- Segurança: `docs/security/059-alfa.md`, aprovado em `51d9ed4` (renovação por delta do security-engineer, no commit local `f42897e`). Não refiz os achados dele. O A2 deste review não é de segurança, porque nenhum dado de pessoa sai.
- QA: ainda não houve, e vem depois deste review.
