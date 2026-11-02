---
tipo: qa
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-aba-front
commit: d13cddefe89fe0250c8ad88ad19e5681463bce86
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 2
bugs_baixos: 0
data: 2026-11-02
---
# QA: 059-aba-apontamento, front da aba (trilha delta; E2.53, K-193)

Links: plano de testes `docs/qa/059-plano-testes.md` (ramo `origin/docs/059-apontamento-discovery`, casos do front: CA-1 a CA-11, o1 a o4, CT-60 a CT-70), especificação de UX `docs/ux/059-aba-apontamento.md`, contrato `docs/api/apontamento.md`, review `docs/reviews/059-delta.md` (aprovado em `60194ef`), segurança `docs/security/059-delta.md` (aprovada sobre `7509a63`, delta `d13cdde`), UX `docs/ux/059-revisao-delta-r2.md` e `r3` (aprovadas).

**Parecer: reprovado**, sobre o código de `60194ef` (HEAD testado `d13cdde`, que só soma pareceres). Escopo `completo`: o front inteiro contra `origin/develop`, com a rota interceptada (só mock, pessoas fictícias). A aba cumpre os critérios do plano e tem zero violação de acessibilidade em todos os estados, mas a entrega derruba três E2E que já existiam (A1) e um rótulo longo sem espaço faz a página rolar na horizontal em 375 px (A2). Os dois são defeitos provados, de severidade média.

## Achados
- A1 (bloqueante) e2e/tests/sustentacao-no-operacional.spec.ts:39 · a quinta opção do seletor Visão deixa vermelhos 3 E2E existentes: CA-2 espera 4 opções (:39) e CT-32 de sustentacao-no-operacional-qa.spec.ts (:499 e :527) espera até 2 linhas em 375 px, e agora são 3. Atualizar os testes (e o limite de linhas só com o aceite do UX).
- A2 (bloqueante) web/src/components/ui/CartaoMetrica.tsx:313 · a frase de leitura não quebra palavra longa. Rótulo de projeto de 60 caracteres sem espaço (ex.: nome_com_sublinhado) em 375 px faz o documento rolar na horizontal (scrollWidth 631 contra 375); origem em CartaoDistribuicao.tsx:94.
- A3 (recomendado) web/src/features/apontamento/ApontamentoPage.tsx:96 · cartões sem "Ocultar" por preferência (CT-68, UX item 15: ids ap-*). A aba não monta o provedor de preferências e a trava o4 exige a aba fora do catálogo; decidir entre as duas leituras antes do PR.
- A4 (recomendado) web/src/components/ui/EstadoErro.tsx:43 · o erro por cartão traz "Detalhes técnicos" recolhido com "ErroApi: API 500 CODIGO". É o padrão do painel e não vaza corpo nem pessoa; o CT-60 diz "sem detalhe técnico", então o texto do plano é que precisa ser confirmado.
- A5 (recomendado) web/src/features/apontamento/components/CartoesQualidade.tsx:154 · Outra área aparece na qualidade por pessoa, na matriz e na distribuição como soma, o que bate com a decisão técnica de 2026-11-02 (fora só de capacidade, mapa diário e faixa de erro); confirmar com o dono que a qualidade por pessoa também mostra a soma.

## Critério → teste → resultado
Fixtures só sintéticas: pessoas `Pessoa n` e, com nomes ligados, `Ana Exemplo` e afins; rotulos de projeto fictícios; nenhum teste lê o `.env`, chama o BusinessMap ou grava resposta real. Teste: `e2e/tests/apontamento-qa.spec.ts` (49 casos, Playwright, Chromium), contra o build de produção (`vite preview`) com `GET /api/apontamento` interceptada e a fixture do contrato v1 (`e2e/fixtures/apontamento-respostas.json`, gerada da fixture tipada do front).

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 (selo e período) | CT-01: quinta visão do seletor abre a aba; selo "Atual" com ícone e texto; "Dados de 03/08/2026 a 30/10/2026"; nenhum chip nem selo do Acelerato; Resumo volta ao Operacional | fonte única BusinessMap | passou |
| CA-1 (três estados do selo) | CT-02: atrasado com texto, ícone e aviso, dado velho continua na tela; axe em "atrasada" | coleta velha | passou |
| CA-2 (vazio) | CT-03: tipo=999 e projeto=1042 dão "Nenhum apontamento encontrado", 2 botões "Remover filtro" e "Limpar filtros"; remover Tipo mantém Projeto e restaura o recorte | zero itens; dois filtros | passou |
| CA-3 e o3 (piso de 20) | CT-07: 12 apontamentos mostram soma (19,5 h) e contagem, sem percentual; CT-26: com 421 há percentual, e a linha de Pessoa 7 (12 apontamentos) não mostra o dela | 12 e 421; piso por pessoa | passou |
| CA-4 (filtros na URL) | CT-08: tipo vai a `tipo=5` na URL e na rota; subgrupo a `subgrupo=reuniao`; recarregar restaura; storage sem filtro; valor inválido (`pessoa=Ana Exemplo`, `tipo=<script>`, nível `xyz`) descartado com aviso, sem eco e sem 500 | valor inexistente na URL | passou |
| CA-4 e CT-10 (chave opaca) | CT-10: com nomes reais ligados, o filtro grava `pessoa=p1` e a rota recebe `p1`; nome e `p1` nunca em URL, requisição, `localStorage` nem `sessionStorage`; recarregar restaura o chip | URL e armazenamento | passou |
| CA-5 (matriz um nível por vez) | CT-11: três rádios; trocar para Subgrupo vai a `nivelMatriz=subgrupo`, mostra "Reunião" e some "Correção"; voltar a Tipo limpa a URL; nível inválido cai em Tipo | nível inválido | passou |
| CA-6 (tabela de todo gráfico) | CT-13: os 11 cartões da aba têm tabela com os números (a própria ou "Ver como tabela"); piso de 9 cartões; KPIs e achados ficam de fora por não terem gráfico | cartão sem dado | passou |
| CA-7 (possível erro) | CT-15: marca com texto e ícone na legenda e no mapa, dica visível; "Ocultar possíveis erros" vai a `anomalos=ocultar` na rota e volta ao desmarcar | 115 h num dia | passou |
| CA-8 (375 px) | CT-16: página sem rolagem horizontal, só o mapa rola e a coluna Pessoa fica fixa; CT-17: "Filtros (1)" recolhe a barra e os alvos têm 44 px ou mais; E2E de 375 px em todos os estados | 375 px | passou |
| CA-8 e CT-70 (rótulo longo) | CT-70: rótulo de 200 caracteres com HTML, emoji e RTL sai como texto, sem `img` nem script, página sem rolagem; CT-70 borda: 100 caracteres sem espaço, em 1280 px passou e em 375 px caiu | uma palavra de 100 caracteres | falhou em 375 px (A2) |
| CA-9 e o2 (sem semáforo) | CT-19 e CT-25: "Comparação relativa; não é jornada total" visível; sem "acima da média", "abaixo da média", "média da equipe", "ranking", "melhor que", "pior que"; barras de utilização com o mesmo tom | utilização 40, 100 e 130% | passou |
| CA-10 (pessoa não identificada) | parcial: a fixture traz a linha "Pessoa não identificada" e todos os casos acima (CT-13, axe, mapa por teclado) passam com ela; sem teste do QA com duas pessoas sem de-para no mesmo recorte (o front testa a linha própria e a explicação em `apontamento.test.tsx:513`, citado e não refeito) | duas sem de-para | passou (parcial) |
| CA-11 (achados) | CT-23: 5 achados com a frase do código e os números do contrato ("20% dos apontamentos (84)"); com lista vazia aparece "Nenhum destaque" | achados vazios | passou |
| o1 (ordem neutra) | CT-24: ordem do servidor mantida (Álvaro, Bruno, Carla); "Total de horas" reordena sem nova chamada à rota (chamadas inalteradas), mostra o chip "Ordem" e "Limpar filtros" volta à alfabética | acento, ordem local | passou |
| o4 (fora da exportação) | CT-27: a aba não tem "Exportar" nem CSV; o diálogo de exportar da Diária não cita Apontamento nem Outra área | exportação | passou |
| Outra área (decisão de 2026-11-02) | sem nome com nomes reais ligados, nota "Outra área: pessoas que não foram responsáveis…", entra na matriz, filtro `pessoa=outra-area`, fora do mapa diário e da capacidade por pessoa | soma de várias pessoas | passou |
| Estados (CT-60, CT-61, CT-62) | 500 com corpo secreto: erro com "Tentar de novo" e nova tentativa funciona; conexão derrubada: mesmo erro; resposta com campo extra e status desconhecido vira erro do cartão, sem `pageerror`; carregando anuncia "Carregando apontamentos" e esvazia ao chegar | corpo nunca na tela | passou |
| Teclado (CT-64) | grade do mapa: setas andam entre células (uma parada de Tab por vez, `tabindex` 0 só na célula ativa), seta além da borda não sai; Tab alcança "Pessoa que apontou" e "Ver como tabela" | borda da grade | passou |
| A-1 e A-2 da UX (R2-2, no navegador) | A-1: nas duas tabelas por pessoa, em 375 px, a região rola e a coluna Pessoa fica fixa; A-2: com foco por teclado na 26ª coluna a célula fica entre as colunas fixas (sobra de 1,3 px sob o total, só borda, tolerância de 2 px) | 375 px | passou |
| Acessibilidade (CT-65) | axe (wcag2a, wcag2aa, wcag22aa), zero crítica ou séria em carregada, vazia, amostra insuficiente, atrasada, nomes reais, Outra área e erro, em 1280 e 375 px (14 casos), mais tema escuro com todas as tabelas abertas e a legenda expandida | contraste, nome acessível | passou |
| CT-31 e CT-66 | versão vigente do dicionário "desde 15/09/2026" na nota do cartão de subgrupo; com movimento reduzido a transição é de 0,001 s ou menos | marca de critério | passou |
| CT-67 e CT-69 | sem nomes: "Pessoa 1", linha dos nomes ocultos, sem aviso e com a finalidade; a única rota chamada é `/api/apontamento` | fonte única | passou |
| CT-68 (ocultar cartão) | n/a: a aba não oferece "Ocultar" | n/a | não coberto (A3) |

## Cenários e resultado real
- **Recursos:** antes de cada suíte `free -m` com 10 800 a 14 500 MB disponíveis e load abaixo de 3; uma suíte por vez.
- **`pnpm run pronto`** (worktree 052h, `60194ef`): rc 0. `test:trava` ok, lint e `format:check` limpos, typecheck do e2e incluído. Contratos 199 testes; metricas 1257; mock 258; server 1542 passaram e 224 pulados (os `.pg`, sem banco aqui); web 91 arquivos e 1400 testes; tools (homolog 73, pesquisa 33, spec-check 14, docs-contratos 102).
- **E2E novo** (`apontamento-qa.spec.ts`): 49 casos, 48 verdes e 1 vermelho (CT-70 borda em 375 px, A2). Rodado com `playwright test apontamento-qa --project=chromium`.
- **E2E completo** (`pnpm run test:e2e`, projetos chromium e semente alternativa, 789 passaram e 4 falharam em 25 min): o caso do A2 e três que já existiam e quebram com a quinta opção do seletor, em `sustentacao-no-operacional.spec.ts` (CA-2, "quatro opções") e `sustentacao-no-operacional-qa.spec.ts` (CT-32, duas vezes: seletor em até 2 linhas, agora 3). Isso é o A1. Firefox e WebKit só rodam na CI.
- **Vermelho antes do verde** (o Forge não é este repositório; vale a forma da stack: o teste contra o código com a falha posta numa mutação reversível na árvore, restaurada com `git checkout` e conferida com `git status`): 4 mutantes, os 4 mortos.
  - M1: `'tipo'` retirado de `consultaParaQuery` (`api.ts`): CT-08 falha (a rota não recebe `tipo=5`).
  - M2: `filter(... !== PESSOA_OUTRA_AREA)` trocado por comparação que nunca exclui, em `CartoesCapacidade.tsx` e `CartaoDiario.tsx`: o teste de Outra área falha (`toHaveCount(0)` recebe 1).
  - M3: aviso de defasado invertido (`selo !== 'atrasado'`) em `CabecalhoApontamento.tsx`: CT-01 e CT-02 falham.
  - A falha real do A2 foi vista vermelha no código entregue, e os 3 casos do A1 caem no código da branch (a causa é a quinta opção, ausente na `develop`; não rodei a suíte antiga contra a `develop`).
- **Mutação por ferramenta:** o projeto não tem Stryker e `docs/engineering/praticas.md` não fixa meta; fiz os 4 mutantes à mão acima, sobre as linhas de guarda do diff do front que o E2E cobre (filtros, Outra área, selo).
- **Cobertura da UX r2/r3:** R2-2 provado no navegador (A-1 e A-2 passam). R2-1 (z-10 do cabeçalho fixo com o popover em 375 px) não gerou sobreposição nos casos de axe nem de teclado; sem achado. R2-3 (texto da nota de Outra área) segue com o dono.
- **Teste e fixture do QA ficam fora do commit**, porque a entrega manda commitar só este parecer: cópias em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/b137b592-4e44-436e-8a8d-3ffa9e1b0ad4/scratchpad/qa059-delta/` (`apontamento-qa.spec.ts` e `apontamento-respostas.json`). O `e2e/` e o `web/` se conhecem por arquivo de dados (lint do ADR 0002 barra o import relativo), por isso o JSON gerado da fixture tipada. Entram em `e2e/tests/` e `e2e/fixtures/` na volta, junto da correção.

## Bugs
Sem arquivo em `docs/qa/bugs/` por ordem da entrega (só este parecer entra no commit); o registro completo está aqui.

### BUG-059-D1 (média, responsável: react-frontend): rótulo longo sem espaço faz a página rolar na horizontal
- Ambiente: `feature/059-aba-front` em `60194ef`, Chromium, build de produção, 375 px de largura.
- Passos: abrir `/operacional/apontamento` com a rota devolvendo `distribuicao.porProjeto[0].rotulo = "PROJETO_" + 92 vezes "X"` (e o mesmo rótulo em `opcoes.projetos`, 100 caracteres, dentro do teto de 200 do contrato). Medir `document.documentElement.scrollWidth` contra `window.innerWidth`.
- Esperado: página sem rolagem horizontal; palavra longa quebra ou trunca, como o plano pede em CT-70.
- Obtido: `scrollWidth` 631 contra 375. Ocultar só o cartão "Horas por projeto" derruba para 375; dentro dele, ocultar só o parágrafo `leitura-AP-PROJETO` (frase "<rótulo> reúne a maior parte das horas apontadas…") também. Com 120 caracteres sem espaço a página rola até em 1280 px. Rótulo com espaços (200 caracteres) não causa nada.
- Causa provável: o `<p>` da leitura em `CartaoMetrica.tsx:313` não tem quebra de palavra, e a frase da aba monta o rótulo cru. Mesma exposição no achado `concentracao-em-projeto` (rótulo entre aspas). Correção sugerida: quebra de palavra no parágrafo de leitura e no item do achado.
- Evidência: caso `CT-70 borda ... em 375 px` do `apontamento-qa.spec.ts`; saída do teste: `Expected: true, Received: false` na checagem de `scrollWidth`.

### BUG-059-D2 (média, responsável: react-frontend com o ux-designer): E2E existentes vermelhos com a quinta opção do seletor
- Ambiente: `feature/059-aba-front` em `60194ef`, Chromium, `pnpm run test:e2e`.
- Passos: rodar `sustentacao-no-operacional.spec.ts` e `sustentacao-no-operacional-qa.spec.ts`.
- Esperado: suíte verde; a quinta visão (decisão do dono de 2026-11-02) vem com os testes que contavam quatro atualizados.
- Obtido: CA-2 (`:39`) `Expected: 4, Received: 5`; CT-32 (`:527`) `Expected: <= 2, Received: 3` linhas do seletor em 375 px, e a variante de fonte ampliada a 200% (`:499`) falha pela mesma causa.
- Correção sugerida: CA-2 passa a conferir os cinco rótulos (Resumo, Diária, Semanal, Sustentação, Apontamento); o limite de linhas do CT-32 em 375 px é decisão de UX (cinco opções em grade de duas colunas dão 3 linhas); sem esse aceite não se afrouxa o teste.

## Observações sem achado
- A célula focada do mapa fica 1,3 px sob a coluna fixa de total em 375 px; é borda e passa na tolerância de 2 px (WCAG 2.4.11 pede que não fique oculta por inteiro).
- Pendências fora do QA: ordem do PR (teto M14 com a linha `teto: excedido`, PR da exceção mesclado antes) e os 15 alertas do Dependabot na branch padrão, já tratados nos pareceres de segurança.
