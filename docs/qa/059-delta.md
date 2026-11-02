---
tipo: qa
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-aba-front
commit: d08d785a853b85fc53f0176481858d5aa3369d24
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-03
---
# QA: 059-aba-apontamento, front da aba (trilha delta; E2.53 e E2.63, K-193)

Links: plano de testes `docs/qa/059-plano-testes.md` (ramo `origin/docs/059-apontamento-discovery`, casos do front: CA-1 a CA-11, o1 a o4, CT-60 a CT-70), especificação de UX `docs/ux/059-aba-apontamento.md`, contrato `docs/api/apontamento.md`, review `docs/reviews/059-delta.md` (renovado e aprovado em `9eb48bc`), segurança `docs/security/059-delta.md` (aprovada sobre `7509a63`, delta `d13cdde`; a volta só muda CSS e testes, sem gatilho), UX `docs/ux/059-revisao-delta-r2.md` e `r3` (aprovadas).

**Parecer: aprovado** (renovação por delta, E2.63), sobre a ponta `d08d785` (código de `9eb48bc`; `eb6d491` e `d08d785` só somam pareceres). Escopo `completo` mantido: o front inteiro contra `origin/develop`, com a rota interceptada (só mock, pessoas fictícias). O delta `48d1157..d08d785` muda duas linhas de CSS (`CartaoMetrica.tsx:313`, `CartaoAchados.tsx:78`), testes e a fixture do QA. Os dois bloqueantes do parecer anterior (A1 e A2) estão resolvidos, com vermelho antes do verde; nenhum bug aberto; zero violação de acessibilidade. Ficam três recomendações (A3 a A5), que não devolvem. O aceite de UX das 3 linhas do seletor é da revisão r4 (E2.64), fora deste parecer.

## Achados
- A1 (recomendado) e2e/tests/sustentacao-no-operacional.spec.ts:39 · resolvido da volta anterior: o CA-2 confere as cinco opções e o CT-32 aceita até 3 linhas em 375 px e a 200% de fonte; verde na suíte completa.
- A2 (recomendado) web/src/components/ui/CartaoMetrica.tsx:313 · resolvido da volta anterior: quebra de palavra na frase de leitura e no achado de concentração; sem rolagem horizontal em 375 e 1280 px com rótulo de 100 caracteres sem espaço.
- A3 (recomendado) web/src/features/apontamento/ApontamentoPage.tsx:96 · cartões sem "Ocultar" por preferência (CT-68, UX item 15: ids ap-*). A aba não monta o provedor de preferências e a trava o4 exige a aba fora do catálogo; decidir entre as duas leituras antes do PR.
- A4 (recomendado) web/src/components/ui/EstadoErro.tsx:43 · o erro por cartão traz "Detalhes técnicos" recolhido com "ErroApi: API 500 CODIGO". É o padrão do painel e não vaza corpo nem pessoa; o CT-60 diz "sem detalhe técnico", então o texto do plano é que precisa ser confirmado.
- A5 (recomendado) web/src/features/apontamento/components/CartoesQualidade.tsx:154 · Outra área aparece na qualidade por pessoa, na matriz e na distribuição como soma, o que bate com a decisão técnica de 2026-11-02 (fora só de capacidade, mapa diário e faixa de erro); confirmar com o dono que a qualidade por pessoa também mostra a soma.

## Critério → teste → resultado
Fixtures só sintéticas: pessoas `Pessoa n` e, com nomes ligados, `Ana Exemplo` e afins; rótulos de projeto fictícios; nenhum teste lê o `.env`, chama o BusinessMap ou grava resposta real. Teste: `e2e/tests/apontamento-qa.spec.ts` (49 casos, Playwright, Chromium), contra o build de produção (`vite preview`) com `GET /api/apontamento` interceptada e a fixture do contrato v1 (`e2e/fixtures/apontamento-respostas.json`, gerada da fixture tipada do front); agora versionados na branch.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 (selo e período) | CT-01: quinta visão do seletor abre a aba; selo "Atual" com ícone e texto; "Dados de 03/08/2026 a 30/10/2026"; nenhum chip nem selo do Acelerato; Resumo volta ao Operacional | fonte única BusinessMap | passou |
| CA-1 (três estados do selo) | CT-02: atrasado com texto, ícone e aviso, dado velho continua na tela; axe em "atrasada" | coleta velha | passou |
| CA-2 (vazio) | CT-03: tipo=999 e projeto=1042 dão "Nenhum apontamento encontrado", 2 botões "Remover filtro" e "Limpar filtros"; remover Tipo mantém Projeto e restaura o recorte | zero itens; dois filtros | passou |
| CA-2 do Operacional (cinco opções) | `sustentacao-no-operacional.spec.ts:37`: cinco rádios na ordem Resumo, Diária, Semanal, Sustentação, Apontamento; Resumo marcado | quinta opção | passou (A1 do parecer anterior resolvido) |
| CT-32 (seletor, 375 px e 200%) | `sustentacao-no-operacional-qa.spec.ts`: até 3 linhas em 375 px, também com fonte a 200%, alvos de 44 px, cabe no recipiente | 375 px; fonte 200% | passou |
| CA-3 e o3 (piso de 20) | CT-07: 12 apontamentos mostram soma (19,5 h) e contagem, sem percentual; CT-26: com 421 há percentual, e a linha de Pessoa 7 (12 apontamentos) não mostra o dela | 12 e 421; piso por pessoa | passou |
| CA-4 (filtros na URL) | CT-08: tipo vai a `tipo=5` na URL e na rota; subgrupo a `subgrupo=reuniao`; recarregar restaura; storage sem filtro; valor inválido (`pessoa=Ana Exemplo`, `tipo=<script>`, nível `xyz`) descartado com aviso, sem eco e sem 500 | valor inexistente na URL | passou |
| CA-4 e CT-10 (chave opaca) | CT-10: com nomes reais ligados, o filtro grava `pessoa=p1` e a rota recebe `p1`; nome e `p1` nunca em URL, requisição, `localStorage` nem `sessionStorage`; recarregar restaura o chip | URL e armazenamento | passou |
| CA-5 (matriz um nível por vez) | CT-11: três rádios; trocar para Subgrupo vai a `nivelMatriz=subgrupo`, mostra "Reunião" e some "Correção"; voltar a Tipo limpa a URL; nível inválido cai em Tipo | nível inválido | passou |
| CA-6 (tabela de todo gráfico) | CT-13: os 11 cartões da aba têm tabela com os números (a própria ou "Ver como tabela"); piso de 9 cartões; KPIs e achados ficam de fora por não terem gráfico | cartão sem dado | passou |
| CA-7 (possível erro) | CT-15: marca com texto e ícone na legenda e no mapa, dica visível; "Ocultar possíveis erros" vai a `anomalos=ocultar` na rota e volta ao desmarcar | 115 h num dia | passou |
| CA-8 (375 px) | CT-16: página sem rolagem horizontal, só o mapa rola e a coluna Pessoa fica fixa; CT-17: "Filtros (1)" recolhe a barra e os alvos têm 44 px ou mais; E2E de 375 px em todos os estados | 375 px | passou |
| CA-8 e CT-70 (rótulo longo) | CT-70: rótulo de 200 caracteres com HTML, emoji e RTL sai como texto, sem `img` nem script, página sem rolagem; CT-70 borda: 100 caracteres sem espaço em 1280 e 375 px (frase de leitura) | uma palavra de 100 caracteres | passou (A2 resolvido; vermelho em `60194ef` e com o CSS retirado, verde em `d08d785`) |
| CA-8 (frase do achado de concentração) | teste do web em `barra-e-ramos.test.tsx` (rótulo de 100 caracteres: classe de quebra na frase do achado e em toda leitura `leitura-AP-*`); no navegador a página não rola com a frase do achado | achado com palavra longa | passou (obrigação do autor, extensão de 23:50) |
| CA-9 e o2 (sem semáforo) | CT-19 e CT-25: "Comparação relativa; não é jornada total" visível; sem "acima da média", "abaixo da média", "média da equipe", "ranking", "melhor que", "pior que"; barras de utilização com o mesmo tom | utilização 40, 100 e 130% | passou |
| CA-10 (pessoa não identificada) | parcial: a fixture traz a linha "Pessoa não identificada" e todos os casos acima passam com ela; sem teste do QA com duas pessoas sem de-para no mesmo recorte (o front testa a linha própria e a explicação em `apontamento.test.tsx:513`, citado e não refeito) | duas sem de-para | passou (parcial) |
| CA-11 (achados) | CT-23: 5 achados com a frase do código e os números do contrato ("20% dos apontamentos (84)"); com lista vazia aparece "Nenhum destaque" | achados vazios | passou |
| o1 (ordem neutra) | CT-24: ordem do servidor mantida (Álvaro, Bruno, Carla); "Total de horas" reordena sem nova chamada à rota, mostra o chip "Ordem" e "Limpar filtros" volta à alfabética | acento, ordem local | passou |
| o4 (fora da exportação) | CT-27: a aba não tem "Exportar" nem CSV; o diálogo de exportar da Diária não cita Apontamento nem Outra área | exportação | passou |
| Outra área (decisão de 2026-11-02) | sem nome com nomes reais ligados, nota "Outra área: pessoas que não foram responsáveis…", entra na matriz, filtro `pessoa=outra-area`, fora do mapa diário e da capacidade por pessoa | soma de várias pessoas | passou |
| Estados (CT-60, CT-61, CT-62) | 500 com corpo secreto: erro com "Tentar de novo" e nova tentativa funciona; conexão derrubada: mesmo erro; resposta com campo extra e status desconhecido vira erro do cartão, sem `pageerror`; carregando anuncia "Carregando apontamentos" e esvazia ao chegar | corpo nunca na tela | passou |
| Teclado (CT-64) | grade do mapa: setas andam entre células (uma parada de Tab por vez, `tabindex` 0 só na célula ativa), seta além da borda não sai; Tab alcança "Pessoa que apontou" e "Ver como tabela" | borda da grade | passou |
| A-1 e A-2 da UX (R2-2, no navegador) | A-1: nas duas tabelas por pessoa, em 375 px, a região rola e a coluna Pessoa fica fixa; A-2: com foco por teclado na 26ª coluna a célula fica entre as colunas fixas (sobra de 1,3 px, só borda, tolerância de 2 px) | 375 px | passou |
| Acessibilidade (CT-65) | axe (wcag2a, wcag2aa, wcag22aa), zero crítica ou séria em carregada, vazia, amostra insuficiente, atrasada, nomes reais, Outra área e erro, em 1280 e 375 px (14 casos), mais tema escuro com todas as tabelas abertas e a legenda expandida | contraste, nome acessível | passou |
| CT-31 e CT-66 | versão vigente do dicionário "desde 15/09/2026" na nota do cartão de subgrupo; com movimento reduzido a transição é de 0,001 s ou menos | marca de critério | passou |
| CT-67 e CT-69 | sem nomes: "Pessoa 1", linha dos nomes ocultos, sem aviso e com a finalidade; a única rota chamada é `/api/apontamento` | fonte única | passou |
| CT-68 (ocultar cartão) | n/a: a aba não oferece "Ocultar" | n/a | não coberto (A3, recomendado) |

## Cenários e resultado real
- **Recursos:** antes de cada suíte `free -m` com 14 500 MB disponíveis e load abaixo de 4; uma suíte por vez; `git pull --ff-only` já em dia (HEAD igual a `origin/feature/059-aba-front`).
- **`pnpm run pronto`** (worktree 052h, `d08d785`): rc 0. Contratos 199; metricas 1257; mock 258; server 1542 passaram e 224 pulados (os `.pg`, sem banco aqui); web 91 arquivos e 1401 testes; tools (homolog 73, pesquisa 33, spec-check 14, docs-contratos 102 e `docs:check` ok); orçamentos de bundle ok.
- **`pnpm run test:e2e`** (`d08d785`, todos os projetos, 25,0 min): rc 0, 795 passaram, 0 falharam, 0 pulados. Inclui `apontamento-qa.spec.ts` (49 verdes) e os três casos que estavam vermelhos no parecer anterior. Firefox e WebKit só rodam na CI.
- **Retestes pedidos:** A1: CA-2 com cinco opções e CT-32 com até 3 linhas em 375 px, normal e com fonte a 200%, verdes. A2: palavra longa sem rolagem horizontal em 375 e 1280 px na frase de leitura (CT-70 borda, duas larguras) e, no web, na frase do achado de concentração (`barra-e-ramos.test.tsx`), verdes.
- **Vermelho antes do verde:** forma da stack (mutação reversível na árvore, restaurada com `git checkout` e conferida com `git status`). O CT-70 borda em 375 px caiu no código de `60194ef` (parecer anterior: `scrollWidth` 631 contra 375) e cai de novo, agora, com a classe de quebra retirada de `CartaoMetrica.tsx` e `CartaoAchados.tsx`: `playwright test apontamento-qa --project=chromium -g "CT-70|palavra|longo"` deu `1 failed, 2 passed` (375 px: `Expected: true, Received: false` em `apontamento-qa.spec.ts:501`; 1280 px e o caso de 200 caracteres com espaços passaram). Árvore restaurada, só o arquivo da revisão UX r4 do outro papel segue não rastreado.
- **Mutação por ferramenta:** o projeto não tem Stryker e `docs/engineering/praticas.md` não fixa meta. Mutantes à mão do parecer anterior (M1 a M3 sobre filtros, Outra área e selo, todos mortos) seguem válidos, porque o delta não tocou essas linhas; o mutante novo (retirada da quebra de palavra nas duas linhas do delta) morreu, como acima.
- **Cobertura da UX r2/r3:** R2-2 provado no navegador. R2-1 (z-10 do cabeçalho fixo com o popover em 375 px) sem sobreposição nos casos de axe nem de teclado. R2-3 (texto da nota de Outra área) segue com o dono.
- **Teste e fixture do QA:** agora em `e2e/tests/apontamento-qa.spec.ts` e `e2e/fixtures/apontamento-respostas.json` na branch (commit `9eb48bc`, lidos sem mudança de caso).

## Bugs
Nenhum aberto. BUG-059-D1 (rótulo longo faz a página rolar, média) e BUG-059-D2 (E2E existentes vermelhos com a quinta opção, média), do parecer anterior, estão corrigidos e retestados em `d08d785`; os registros anteriores ficam neste parecer, por ordem da entrega (só ele entra no commit).

## Observações sem achado
- A célula focada do mapa fica 1,3 px sob a coluna fixa de total em 375 px; é borda e passa na tolerância de 2 px (WCAG 2.4.11 pede que não fique oculta por inteiro).
- Pendências fora do QA: ordem do PR (teto M14 com a linha `teto: excedido`, PR da exceção mesclado antes) e os alertas do Dependabot na branch padrão, já tratados nos pareceres de segurança.
