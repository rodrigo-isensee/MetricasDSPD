---
tipo: review
contrato: 1
pedido: 011-front-estrategicas
branch: feature/011-front-estrategicas
commit: b13dfe6
parecer: aprovado
revisor: tech-lead
data: 2026-10-17
---
# Code review: front do pedido 011, lote 1 (E9, E6, E7 sem R$, E8)

- Cartão K-109, pedido 021 (etapa E1.4). Branch `feature/011-front-estrategicas`, commits `4c5d6f5` e `919554b` sobre a `develop` `1607a5f` (a ponta atual de `origin/develop`, então a integração já está feita).
- Referências: `docs/pedidos/021-front-do-011-por-nivel.md`, `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (§3, §4, §5 do E6 ao E9, §10), `docs/engineering/praticas.md` (§2 a §5 e §8), contratos `docs/contratos/metricas/E6.md` a `E9.md`.
- Ferramentas: o `praticas.md` não marca nenhuma regra como "decidida por: `<comando>`". Cito a saída do autor sem refazê-la: `pnpm run pronto` com rc=0 no `919554b` (o brief dispensou a execução local, com o teto de 2 agentes). Lint, tipos, cobertura de 100%, `docs:check` e E2E estão no `pronto`.

## Volta 8 (2026-10-17): aprovado

- Escopo: só o commit `b13dfe6` (`docs(ux)`, seção 10 da reconferência de UX), posterior ao parecer, que deixou o review e o QA desatualizados no `forge-check pr` (pedido 028, decisão técnica do time de 2026-10-17). O `commit` do frontmatter passa a `b13dfe6`.
- Diff: 14 linhas acrescentadas em `docs/ux/revisao-011-front-estrategicas.md`; nenhum código, teste ou contrato mudou. Não há regra de `praticas.md` de leitura que alcance o diff além de conteúdo e commit limpo.
- Leitura: a seção 10 reconfere o delta de interface (anúncio do E9, plural do E7, comentário de `ordenarPorDeslize`) e aprova, sem achado novo; coerente com o que revisei nas voltas 6 e 7. Commit com mensagem convencional.
- Ferramentas: nada a rodar (só documentação). Suíte e E2E ficam com a CI do PR #108.
- Veredito: aprovado. Resta a revalidação do QA sobre o head (E1.4).

## Volta 7 (2026-10-17): aprovado

- Escopo: integração da `develop` na branch (pedido 028, decisão técnica do time de 2026-10-17). Merge commit `a9c2348` (`origin/develop` em `5ad02ea`, que já tem o #107, táticas `8516ff8`, e o #109, operacionais), sobre o `4f9f229`. O `commit` do frontmatter passa a `a9c2348`. Olhei só o que o merge trouxe para o front: os contratos de O22, O26, T13 e T14 (lotes 2 e 3 do back, já revisados nos PRs deles) e o catálogo de cartões.
- Conflitos: nenhum. O merge correu automático (sem rebase, sem `--force`), então não houve resolução a registrar.
- Ferramentas: `uptime` antes (load 0,06). Da raiz da worktree: `pnpm run typecheck` rc=0 (metricas, contratos, server, web). `@metricas-dspd/contratos` test: 7 arquivos, 160 testes passaram. `@metricas-dspd/web` test: 75 arquivos, 1076 testes passaram. O E2E e a suíte completa ficam com a CI do PR #108.

### O que o merge trouxe para o front

- `web/`: nada. O diff `4f9f229..a9c2348` em `web/` é vazio, então nenhum arquivo do front (E6 a E9) mudou, e não houve reescrita por conflito.
- `packages/contratos`: `comum.ts` e `metricas.ts` ganham os ids O22, O26, T13 e T14 (`METRICA_IDS`, `ContratoMetricas`, `APLICABILIDADE_FLUXO`); `tambem.ts` ganha os resultados deles; `validacao.ts` os valida; `cartoes.ts` muda só `COM_EXTENSAO_MOCK`, que passa a listar O22, O26, T13 e T14 (mais o E6 e o E8 que a branch já tinha) e o comentário que a descreve.
- Catálogo de cartões: a lista `CATALOGO_CARTOES` não mudou. As quatro métricas novas entram apenas no conjunto `COM_EXTENSAO_MOCK`, não como linhas do catálogo. Logo o catálogo continua com 53 linhas, e a contagem que o E2E `intensivo-sistemico` afirma (53, volta 5) segue valendo; o `cartoes.test.ts` passou. Os cartões desses quatro vêm no front do lote 2 e do lote 3 (pedido 011, fases seguintes), fora deste PR.
- Sem colisão com o lote 1: a união do conjunto `COM_EXTENSAO_MOCK` mantém E6 e E8 com o selo de mock, e E7 e E9 continuam fora dele (E7 sem custo, D2 = A; E9 disponível), como na volta 2.
- `docs/contratos/metricas/` (O22, O26, T13, T14, README, VISAO_GERAL) e `docs/contratos/snapshots/resultados/`: arquivos gerados que vieram do back. Não editei.

### Regras invioláveis e decisões

Conformes. O merge não toca no cálculo, no custo (D2 = A), no E8 (R-1 = B), não cria visão por pessoa nem por time, e o nome do E7 segue pendente da confirmação do usuário.

### Commits

O merge é um commit só, `chore:` com mensagem clara e as atribuições. Nenhum outro commit de código nesta volta.

### Próximo passo

O QA revalida o parecer dele sobre o novo head (R-QA: o merge mudou o head). Depois, o merge do #108 e a limpeza saem numa delegação seguinte do pedido 028; em seguida o pedido 024.

## Volta 6 (2026-10-18): aprovado

- Escopo: diff `3d2ee5b..357936b` em `e2e`, `web`, `packages` e `server`. Mudou só `e2e/tests/intensivo-filtros.spec.ts` (3 linhas, commit `357936b`, `test(e2e)`). Não há código de produção no diff. O `commit` do frontmatter passa a `357936b`. A `develop` não foi reintegrada nesta volta.
- Motivo: o QA abriu o bug 011F-002 (o IF-I01 estoura os 30 s padrão na suíte E2E completa local), e o autor deu ao teste um orçamento de tempo próprio. Isso desatualizou o parecer da volta 5.
- Ferramentas: não rodei nada local, porque o brief dispensa (teto de 3 agentes, uma tarefa pesada por vez). A prova da suíte completa é o check `e2e` da CI do PR #106.

### O diff

- `test.setTimeout(120_000)` no começo do IF-I01, com um comentário que explica a causa (cinco rotas, cada uma com navegação, assentar do painel e dezenas de cliques; o teto de 30 s vale para o teste inteiro) e cita o bug 011F-002.
- É o mesmo padrão e o mesmo valor do IF-A (K-083), que está na linha 410 do mesmo arquivo (`test.setTimeout(120_000)`); o IF-I01 fica na linha 506. Não é mecanismo novo.
- O teste não é pulado nem enfraquecido: o corpo e as asserções ficam como estavam, então a cobertura de "marcar todas e desmarcar todas" continua a mesma (item 11 do checklist: nada de ausência que mudou de alvo). O teto de 120 s só dá folga sob carga; em máquina normal o teste termina bem antes.
- Decisão do time (pedido 021, 2026-10-18): saída (a), orçamento próprio, sem skip. A instabilidade de outros testes sob carga local vira o K-115, fora deste PR.

### Regras invioláveis e decisões

Conformes. O diff é só de teste: não toca no cálculo, no custo (D2 = A), no E8 (R-1 = B) nem no nome do E7, que segue pendente da confirmação do usuário.

### Commits

Um commit, `test(e2e)`, coerente, com o bug 011F-002 na mensagem. Os PNGs de `docs/qa/evidencias/` regenerados pela suíte E2E ficam sem commit e fora deste review; o QA os restaura na etapa dele.

### Próximo passo

O QA revalida o parecer dele sobre `357936b`. Depois, o PR #106 segue pelo pedido 028, com o check `e2e` verde na CI como prova da suíte completa.

## Volta 5 (2026-10-16): aprovado

- Escopo: diff `89b755c..59dfb37` em `e2e`, `web`, `packages` e `server`. Mudou só `e2e/tests/intensivo-sistemico.spec.ts` (2 linhas, commit `59dfb37`, `test(e2e)`). Não há código de produção no diff. O `commit` do frontmatter passou a `59dfb37`. A `develop` não foi reintegrada nesta volta.
- Motivo: o check `e2e` do PR #106 falhou no SIS-CONS-01. O catálogo tem 53 linhas depois dos cartões E6 a E9 e o teste ainda esperava 49.
- Ferramentas: não rodei nada local, porque o brief dispensa (teto de 3 agentes, uma tarefa pesada por vez). A prova é a CI do PR #106, que roda a suíte E2E completa.

### O diff

- O título do teste passa de "46 linhas" para "53 linhas" e o `toHaveLength(49)` passa a `toHaveLength(53)`. Os dois números batem com o catálogo do lote 1: 49 mais os 4 cartões novos (E9, E6, E7 e E8), a mesma contagem que os E2E `complementares.spec.ts` e `lacuna-de-valor.spec.ts` já afirmam desde a volta 1 (49 para 53).
- O título antigo dizia 46 enquanto a asserção dizia 49: já estava desatualizado antes desta branch. A correção deixa os dois alinhados.
- A asserção mantém o formato de contagem exata (não é só um mínimo), então um cartão perdido ou duplicado continua falhando (item 11 do checklist). Nenhuma regra inviolável é tocada.

### Por que o furo passou

O review (voltas 1 a 4) e o QA rodaram o spec do lote (`estrategico-011-lote1`, `complementares`, `lacuna-de-valor`) e a leitura do diff. O `intensivo-sistemico.spec.ts` não faz parte desse conjunto e só é executado na suíte E2E completa. O autor dispensou o `pronto` local pelo teto de recursos, então a primeira execução da suíte inteira foi a da CI do PR. Eu também citei a contagem 49 para 53 nos dois E2E que conferi na volta 1, mas não busquei por outros testes que dependam do tamanho do catálogo. A lição para o review é buscar por `toHaveLength` e pelas contagens do catálogo (`49`, `45`, `46`) quando o diff altera `cartoes.ts`, e a lição para o QA é incluir os specs que leem o catálogo inteiro (`intensivo-sistemico`) quando a contagem muda. Isso vale como recomendação ao QA e ao agile-coach, sem exigir mecanismo novo agora.

### Comentário desatualizado em `CatalogoPage.tsx:10`

O JSDoc diz "49 linhas" e agora são 53 (além de falar em "45 métricas do briefing + 1 de percepção", que também mudou). É comentário de código, sem efeito em comportamento, em teste ou em contrato, e o `docs:check` não o cobre. Não bloqueia. Fica como ressalva baixa: o `react-frontend` corrige na próxima vez que tocar no arquivo, ou o comentário passa a não citar o número (por exemplo, "uma linha por métrica do catálogo, com a espera invisível por nível"), o que evita a repetição do problema. Não abro nova volta só por isso.

### Regras invioláveis e decisões

Conformes. O diff é só de teste: não toca no cálculo, no custo (D2 = A), no E8 (R-1 = B) nem no nome do E7, que segue pendente da confirmação do usuário.

### Commits

Um commit, `test(e2e)`, coerente, com o cartão K-109 na mensagem.

### Próximo passo

O QA revalida o parecer dele sobre `59dfb37`. Depois, o PR #106 segue pelo pedido 028, com o check `e2e` verde na CI.

## Volta 4 (2026-10-16): aprovado

- Escopo: diff `0a75f63..d542aa9` em `e2e`, `web`, `packages` e `server`. Só mudou `e2e/tests/estrategico-011-lote1.spec.ts` (+5 linhas, commit `d542aa9` do QA). Não há código de produção no diff. O resto do commit é o parecer do QA e a ficha do bug 011F-001, que não são deste review. O `commit` do frontmatter passou a `d542aa9`. A `develop` continua em `1607a5f`, então não houve nova integração.
- Ferramentas: não rodei nada local, porque o brief dispensa (teto de 3 agentes, uma tarefa pesada por vez). Cito o QA: `playwright test --project=chromium estrategico-011-lote1` deu 10 de 10, com o ET-06 já afirmando a região, e `ui.test.tsx` deu 18 de 18. O `pronto` completo vai rodar no envio (pedido 028).

### O diff do ET-06

- A região é localizada por `e9.getByRole('status')`, dentro do cartão do E9. No `web/src`, o único `role="status"` do cartão é o do `SeletorLocal` (`SeletorLocal.tsx:100`), que só existe com a prop `anuncio`. O localizador não é ambíguo, e o QA confirmou isso na execução.
- `toHaveAttribute('aria-live', 'polite')` confere o atributo que o leitor de tela usa.
- O texto inicial é conferido contra `/^Tipo .+: \d+ de \d+ projetos\.$/`, o mesmo formato montado em `estrategicas.tsx:117`. É um teste de presença: o alvo existe e bate com o código atual (item 11 do checklist).
- Depois do `Home`, `not.toHaveText(anuncioAntes)` prova que a troca de tipo muda o texto anunciado. Essa asserção falharia sem a correção do 011F-001: sem a prop não há região, e o localizador não acharia nada. Ela usa a espera automática do Playwright, igual à linha `e9-mostrando` logo acima, então não depende de tempo fixo.
- O teste é determinístico. Roda sobre o mock (2 abas de tipo no E9) e não depende de hora nem de ordem de execução.

### Observação, sem ajuste

O `\d+` do regex não aceita separador de milhar, e o `fmtInteiro` formata "1.234". Com o mock (7 projetos), isso não acontece. Só seria um problema se o mesmo E2E rodasse com dados que tenham mil ou mais projetos de um tipo, o que não está previsto. Não abro recomendado.

### Regras invioláveis e decisões

Conformes. O diff é só de teste: não toca no cálculo, no custo (D2 = A), no E8 (R-1 = B) nem no nome do E7, que segue pendente da confirmação do usuário.

### Commits

O `d542aa9` (`docs(qa)`) junta o parecer do QA e a asserção nova do E2E. Teria ficado melhor com `test(e2e)` em separado, mas a asserção é só a evidência da reconferência do 011F-001, então aceito como está.

### Próximo passo

O QA revalida o parecer dele sobre `d542aa9` (o `forge-check` ainda acusa o parecer do QA de desatualizado e sem registro de autoria). Depois, o PR sai pelo pedido 028.

## Volta 3 (2026-10-16): aprovado

- Escopo: diff `9465709..c5e379b`, três commits do autor: `075a5a8` (`fix(web)`, bug 011F-001 do QA), `65fcd72` (`fix(web)`, R-4 e R-5) e `c5e379b` (`docs(api)`, R-6). O `commit` do frontmatter passou a `c5e379b`, a ponta revisada. A `develop` continua em `1607a5f`, ancestral da branch, então não houve nova integração.
- Ferramentas: cito o autor sem refazer, `pnpm run pronto` com rc=0 no `c5e379b`. O brief desta volta dispensa a execução local (teto de 3 agentes, uma tarefa pesada por vez).

### 011F-001 (troca de tipo do E9 sem anúncio): resolvido

- `web/src/components/ui/SeletorLocal.tsx`: prop opcional `anuncio?: string`, documentada no tipo. Só quando ela é passada o componente renderiza um `div` `sr-only` com `role="status"` e `aria-live="polite"` (e `data-testid="anuncio-<codigo>"`). Sem a prop, a saída é a mesma de antes. Dos 15 usos do `SeletorLocal` no `web/src`, só o E9 passa `anuncio` (busca por `anuncio=`), então os demais não mudam. O padrão é o mesmo do anúncio de preferências (`ProvedorPainelPreferencias.tsx:175`).
- `web/src/features/complementares/estrategicas.tsx:117`: o E9 anuncia "Tipo X: N de M projetos.", com os mesmos números da linha visível "Mostrando N de M projetos". O seletor só aparece com 2 ou mais tipos, então M é sempre 2 ou mais e o plural "projetos" é sempre correto.
- Teste (`web/src/components/ui/ui.test.tsx`): o teste já existente ganha `queryByRole('status')` nulo, que prova que sem a prop não há região. O teste novo prova que com a prop a região tem `aria-live="polite"`, mostra o texto inicial e muda ao trocar de aba pelo teclado (`End`). Cobre os dois ramos da condição. Não há outro `role="status"` nos E2E do Estratégico que entre em conflito com o seletor de papel.
- Observação, sem ajuste: uma região viva montada já com texto em geral não é lida na montagem, só nas mudanças. É o comportamento desejado (anunciar a troca), e o bug pede exatamente isso. A reconferência com leitor de tela fica com o QA (E1.3).

### Recomendados da volta 2

| # | Situação | Evidência |
|---|---|---|
| R-4 | Resolvido | O comentário de `ordenarPorDeslize` agora diz "empate pelo id do card (`cardId`)", igual ao código. |
| R-5 | Resolvido | A linha `e7-demais` usa `plural(demais.length, 'sistema', 'sistemas')`. |
| R-6 | Resolvido | `docs/api/metricas.md:157` acrescenta "(título revisto no pedido 021: 'Onde o parque se concentra, e qual o risco de continuidade?')" e mantém o registro histórico. |

### Regras invioláveis e decisões

Conformes. O diff não lê campo de custo (D2 = A), não toca no E8 (R-1 = B), não cria visão por pessoa nem por time e não calcula estatística no front. O nome do E7 continua sem mudança, à espera da confirmação do usuário (pedido 021), como deve ser.

### Commits

São três commits coerentes, em Conventional Commits em português, e cada um cita o bug ou o recomendado que resolve.

### Próximo passo

A branch volta ao QA (E1.3) no `c5e379b`, que reconfere o 011F-001. O R-1 da volta 1 (aplicabilidade do E8 e do E9 em `contratos`) e a ordem cronológica do E6 (A-4) seguem fora deste escopo, como registrado na volta 2.

## Volta 2 (2026-10-16): aprovado

- Escopo: diff `515714c..8d6999c` (ajustes do autor, `fix(web,contratos)`) e o commit `ccb9443` (`docs(ux)`: especificação alinhada às decisões e revisão de UX, sem código). O `commit` do frontmatter era o `ccb9443`, a ponta revisada naquela volta.
- Ferramentas: cito o autor sem refazer, `pnpm run pronto` com rc=0 no `8d6999c`. O brief desta volta dispensa a execução local (teto de 3 agentes, uma tarefa pesada por vez).

### Bloqueantes da volta 1

| # | Situação | Evidência |
|---|---|---|
| B-1 | Resolvido | `leituraE7` agora decide primeiro pelo `d.total < 20` (frase "abaixo de 20" só nesse caso). Com total ≥ 20 e o primeiro sistema sem participação publicada, diz "N entregas no período, mas nenhum sistema chegou a 20 entregas: só a contagem por sistema é publicada." Teste novo em `estrategicas.test.tsx`: "E7 com total de 20 ou mais e nenhum sistema com 20 não diz 'abaixo de 20'". |
| B-2 | Resolvido | `docs/tecnica/arquitetura-front.md` §11 reescrita: as entradas estão em `COMPLEMENTARES` e no `CATALOGO_CARTOES`; o selo vem só do catálogo, sem fallback no `CartaoComplementar`; a "Dependência aberta" saiu e deu lugar ao estado atual do catálogo (seção nova, contador "+6") e aos ajustes desta volta. |

### Diff dos ajustes

- **Título e id da seção (título = A, pedido 021):** `packages/contratos/src/cartoes.ts` troca `custo-do-parque` por `concentracao-do-parque` e o título por "Onde o parque se concentra, e qual o risco de continuidade?". `E7.md` e `E8.md` mudam só entre as marcas `gerado`. Fora de `docs/` históricos, não sobra referência ao id antigo no código nem nos E2E (busca por `custo-do-parque` e pelo título antigo).
- **E9 ordenado (A-4 da UX):** a tabela ordena por `idadeDiasUteis` decrescente sobre uma cópia do vetor, então a legenda "do mais antigo para o mais novo" não depende mais da API. Teste com a API em outra ordem. Também entraram a linha "Mostrando N de M projetos (tipo X)" (A-3), a unidade e o "do tipo" na referência P85 (A-5) e o "É esperado concluir poucos projetos." (A-13).
- **E7 com no máximo 10 sistemas (A-12):** `MAX_SISTEMAS_E7 = 10` no gráfico, linha `e7-demais` com a contagem dos demais e a tabela continua com `r.sistemas` inteiro. A ordem continua a do back, por volume (regra 9 da §3). Teste com mais de 10 sistemas.
- **R-2:** resolvido. A coluna do E9 vem de `colunaE9(idadeDiasUteis)`, com os limites 30, 90 e 180, e não mais do texto da faixa.
- **R-3:** resolvido como sugerido: um comentário em `COM_TAMBEM` liga a lista ao `COM_EXTENSAO_MOCK` e pede atualização conjunta nos lotes 2 e 3.
- **Leitura do E6:** cobre "nenhum na data" no singular e no plural, sem "o outro" nem "os demais" quando todos atrasaram, com quatro testes novos. O E8 ganha `grid-cols-1 sm:grid-cols-3` (A-14).
- **Regras invioláveis:** continuam conformes. Os ajustes não leem campo de custo (D2 = A), não nomeiam sistema no E8 (R-1 = B), não ordenam por pessoa nem por time e não calculam estatística no front, porque ordenar e contar são censo.

### A-4 do E6 (ordem por deslize): aceito como provisório

Aceito a ordem do menor para o maior deslize até o back expor a data de conclusão no contrato do E6. O critério é declarado na legenda da tabela, a ordem é estável (desempate por `cardId`) e a unidade é o projeto, não pessoa nem time, então não há ranking proibido. O que fica: quando o contrato trouxer `concluidoEm`, o eixo X passa à ordem cronológica de conclusão, como no protótipo. Isso vira cartão para o back, no pedido 024 ou num cartão próprio, e o Jarvis registra no quadro. Critério de reversão: com o campo no contrato, troca-se `ordenarPorDeslize` pela ordem de conclusão e a legenda é ajustada.

### Recomendados novos (não bloqueiam)

| # | Arquivo:linha | Problema | Sugestão |
|---|---|---|---|
| R-4 | `web/src/features/complementares/estrategicas.tsx` (`ordenarPorDeslize`, comentário) | O comentário diz "empate pelo código", mas o desempate usa `cardId`. | Alinhar o comentário ao código, ou desempatar por `codigo`. |
| R-5 | `web/src/features/complementares/estrategicas.tsx` (linha `e7-demais`) | Com 11 sistemas a frase sai "Demais 1 sistemas". | Usar `plural(demais.length, 'sistema', 'sistemas')`. |
| R-6 | `docs/api/metricas.md:157` | A nota do B5 ainda cita o título antigo da seção do E7. É registro histórico, mas quem procura a seção acha o nome velho. | Acrescentar "(título revisto no pedido 021: 'Onde o parque se concentra, e qual o risco de continuidade?')". |

O R-1 da volta 1 (aplicabilidade do E8 e do E9 em `contratos`) segue aberto e vai para o pedido 024, fora deste escopo. O nome do E7 ("Entregas por sistema", A-10 da UX) aguarda a confirmação do usuário e não foi aplicado, o que está correto.

### Próximo passo

A branch vai para o QA (E1.3) no `ccb9443`. A UX reconfere os ajustes da interface (E1.2). R-4 a R-6 podem entrar numa volta do autor ou num cartão, a critério do Jarvis: não reabrem o review.

## Volta 1: parecer

**Ajustes necessários (reprovado nesta rodada).** São 2 bloqueantes pequenos: uma frase de leitura do E7 que fica falsa num caso comum e a documentação técnica do front que descreve o estado do primeiro commit, não o do segundo. As regras invioláveis, a D2 = A e a R-1 = B estão conformes.

## Bloqueantes

| # | Arquivo:linha | Problema | Sugestão |
|---|---|---|---|
| B-1 | `web/src/features/complementares/estrategicas.tsx:275-276` | `leituraE7` decide pela `participacao` do **primeiro sistema** e então diz "`total` entregas no período: abaixo de 20". Pelo contrato (`packages/metricas/src/businessmap/e7.ts:17-18`), a participação é `null` em **todo sistema com menos de 20 entregas**, e esses sistemas vão para o fim. Se nenhum sistema chega a 20 mas o total chega (por exemplo, 6 sistemas com 10 entregas = 60), a frase fica "60 entregas no período: abaixo de 20", que é falsa. No Estratégico, com 12 semanas e muitos sistemas, esse caso é provável. O teste "com menos de 20 entregas no total" (`estrategicas.test.tsx:150`) só cobre total < 20. | Separar os dois casos: total < 20 mantém a frase atual; total ≥ 20 sem nenhum sistema com 20 diz que nenhum sistema chegou a 20 entregas e por isso só a contagem por sistema é publicada (texto final com o UX). Teste novo com total ≥ 20 e todos os sistemas abaixo de 20. |
| B-2 | `docs/tecnica/arquitetura-front.md:284`, `:290`, `:291` | A §11 descreve o estado do `4c5d6f5`, não o do `919554b`: cita a lista `COMPLEMENTARES_011` "fora de `CATALOGO`" (ela não existe: as quatro entradas foram para `COMPLEMENTARES`); diz que o `CartaoComplementar` cai em `COM_EXTENSAO_MOCK` sem entrada no catálogo (o fallback foi removido); e mantém a "Dependência aberta" do `CATALOGO_CARTOES` sem E6 a E9, que o segundo commit resolveu. Pelo `praticas.md` §8, item 10, documentação desatualizada bloqueia. | Reescrever as três linhas: as entradas estão em `COMPLEMENTARES`; o selo vem só do `CATALOGO_CARTOES` (status `mock` derivado de `COM_EXTENSAO_MOCK` em `contratos`); a seção "Mais métricas" já lista E9, E6, E7 e E8 e o contador vai de "+2" para "+6". |

## Recomendados (não bloqueiam)

| # | Arquivo:linha | Problema | Sugestão |
|---|---|---|---|
| R-1 | `web/src/features/complementares/estrategicas.tsx:37` e `:377`; `CartaoComplementar.tsx` (prop `aplicaveis`) | O front sobrescreve a aplicabilidade do contrato: E9 com `['sistema']` e E8 com `[]`. Está certo quanto ao comportamento real: o E9 usa janela móvel fixa (`e9.ts:30`) e o E8 usa a janela fixa de 12 meses (`e8.ts:17-18`). Mas os contratos gerados dizem "Atuam: sistema, periodo" (E9) e "Atuam: periodo" (E8). Com isso há duas fontes da verdade, e a de `contratos` está errada. | Cartão para o back: corrigir a aplicabilidade do E8 e do E9 em `contratos` (cabe no pedido 024 ou num cartão próprio) e depois remover a prop `aplicaveis`. |
| R-2 | `web/src/features/complementares/estrategicas.tsx:74` | `Math.max(0, FAIXAS_E9.indexOf(...))` põe na coluna 0–30, sem aviso, uma faixa que o contrato venha a mudar. | Derivar a faixa de `idadeDiasUteis` (como faz `formaE9`) ou tipar `faixa` no contrato como a união das quatro. |
| R-3 | `web/src/data/mock/MockFonteMetricas.ts:51` | `COM_TAMBEM` repete à mão o subconjunto E6/E8 de `COM_EXTENSAO_MOCK`. Hoje bate; nos lotes 2 e 3 (O22, O26, T13, T14) as duas listas podem divergir. | Comentar a relação entre as duas listas, ou derivar uma da outra quando o lote 2 entrar. |

## Pontos que o autor deixou

- **(a) `packages/contratos/src/cartoes.ts` e `cartoes.test.ts`:** conforme e dentro da liberação do pedido 021 (só catálogo e testes de contagem). Seções e ordem batem com a §4 e o CA-3 (E9 antes do E4, E6 depois do E5, seção nova `custo-do-parque` com E7 e E8). O status `mock` de E6 e E8 vem de `COM_EXTENSAO_MOCK`, que já existia, e E7 e E9 ficam `disponivel`, como manda a §3, item 2 (o E7 só é mock com custo, e o custo saiu pela D2 = A). O teste de alcance por "leia junto" passou a percorrer a cadeia e continua afirmando todas as 21 complementares. Também afirma a contagem: complementares listadas uma a uma e núcleo com 32.
- **(b) Arquivos fora do brief:** `docs/contratos/metricas/E6` a `E9` e o `README` só mudam entre as marcas `gerado` (nome e cartão); são saída do `docs:gerar` e não editei. Os E2E `complementares.spec.ts` e `lacuna-de-valor.spec.ts` mudam só contagens (49 → 53; Complementar 17 → 21; Estratégico com 6), o conjunto `MOCK` e o "leia junto" esperado, consistentes com o catálogo. `CartaoE2.tsx` ganha o `LeiaJunto` do `e2` → `e7`, coerente com o "Leia junto" do E7 na §5. Os três são consequência direta do catálogo e entram no escopo.
- **(c) Remoção do fallback para `COM_EXTENSAO_MOCK` em `CartaoComplementar.tsx`:** correta. Com os quatro no catálogo, o fallback virou código morto, e o selo volta a ter uma fonte única. Falta só refletir isso no doc (B-2).
- **(d) D2 = A e R-1 = B:** conformes. O E7 não lê `custoRateado`, `custoPorDemanda` nem `custoConfigurado` (nenhuma referência no `estrategicas.tsx`), não tem o aviso de rateio e não tem coluna de custo. O teste com fixture que injeta os campos de custo afirma ausência de "R$", do valor e de "custo" ou "rateio" no cartão. O alvo existe: o valor injetado é o que seria exibido. O E8 mostra só as três contagens, a barra 100% e o selo fixo da §9, sem lista de sistemas (o CA-18 cai pela R-1 = B) e sem nome de pessoa. Com `recortePequeno`, mostra a mensagem fixa do CA-10 e oculta as faixas.

## Checklist (`praticas.md` §8)

| Item | Situação |
|---|---|
| 1. Especificação | Atende à §5 do E6 ao E9, com as decisões D2 = A e R-1 = B. Desvios de forma (rótulo das barras do E7, faixas do E9 como categorias e não como fundo, coluna "Tipo" na tabela do E9) ficam para a revisão de UX (E1.2), que corre em paralelo. Exceção: B-1. |
| 2. Regras invioláveis | Conformes. Tudo é BusinessMap; o E7 avisa que os chamados do Acelerato estão no S12 e não os soma. Cada gráfico tem uma granularidade só (projeto no E6 e no E9; demanda agregada por sistema no E7; sistema no E8). Não há campo, filtro ou visão por pessoa ou time. A ordenação é neutra (por volume, vinda do back). Não há horas apontadas. |
| 3. Cálculo pela `core` e n < 20 | O front não calcula estatística: percentual e percentis chegam como `Estatistica`/taxa do back e são exibidos só com `status: 'ok'`. Abaixo de 20 aparecem `AmostraInsuficiente` (variante `lenta` no E6) e "k de n". As agregações locais (mais antigo, contagem acima de 90, faixa de atraso) são contagens de censo, não estatística. |
| 4. Legibilidade | Boa: funções de leitura separadas e nomes de domínio. `aEntrada` em `catalogo-metricas.ts` reduz a duplicação. |
| 5. Tipos e erros | Tipos do `contratos`, sem `any`. Os estados de erro e de vazio vêm do `CartaoComplementar`. Há um `as never` no teste (fixture parcial), aceitável. |
| 6. Segurança e dados pessoais | Conforme. Rótulos de ponto e tabelas usam código e título de projeto, que não são dado de pessoa. O E8 não recebe nomes do back. Nenhum segredo. |
| 7. Performance | Os cartões são complementares e montam só quando a seção abre. Os gráficos usam `Dispersao` e `Barras` (fila de montagem da §10). A extensão `tambem` do mock é lazy e separada. Não há dependência nova. |
| 8. Testes | 306 linhas novas em `estrategicas.test.tsx`, cobrindo estados ok, insuficiente, vazio, erro e os ramos de leitura. Lacuna: B-1. |
| 9. Acessibilidade | Cada gráfico tem `TabelaDados` (E9, E6, E7) ou `dl` com os números (E8), e `descricao` em todos. O axe AA está nos E2E do `pronto`. |
| 10. Documentação | Os contratos foram regenerados. `arquitetura-front.md` §11 está desatualizada (B-2). |
| 11. Commits | São dois commits coerentes, em Conventional Commits em português, e cada um compila. |

## Para a próxima rodada

Correções de lógica e de texto voltam ao `react-frontend`: B-1 (com teste) e B-2. A revalidação cobre só esses dois pontos e o diff que vier deles. Os recomendados R-1 a R-3 viram cartão ou entram nesta rodada, a critério do autor. O R-1 depende do back.
