# 077 · Desenho: tendências do Resumo no mapa real (E1.1, revisão 3)

Autor: software-architect, 2026-11-06. Revisão 3: achados A1 a A11 de `docs/analises/077-desenho-revisao-tech-lead.md` (código em `origin/develop` d1f22008, linhas citadas pelo tech-lead tomadas como referência; sem consulta à base) e P-077-4 = A (14:54). Revisões 1 e 2: lacuna L4 do 064, K-211 = A (11:11), P-077-1 a P-077-3 = A (12:06), `docs/ux/077-tendencias.md` (CA-1 a CA-15).

## 1. Decisões do dono
- **P-077-1 = A:** ponto mensal cuja janela de 12 semanas começa antes do início do histórico não publica e mostra "janela incompleta" (P50/P85 do fluxo, SLA da sustentação).
- **P-077-2 = A:** a tendência de SLA leva a ressalva do S2 (`excecao-sla-sem-fonte`), no contrato (`notas`) e na tela.
- **P-077-3 = A:** a passagem para dado real vira marca de critério (T2.6) no eixo das tendências.
- **P-077-4 = A:** "primeira carga" é a data em que o histórico carregado começa (`inicio_carga` da carga inicial), não o dia em que a carga rodou.
- **Em aberto:** P-077-5 (contagem mensal, §8) e P-077-6 (nova, início do histórico no Acelerato, §9).

## 2. O que existe
- Cálculo (ADR 0019, fora do escopo): `TENDENCIA_FLUXO` (`packages/metricas/src/businessmap/tendencia.ts:20-57`, janela por `janelaMovelDia(b.fimDia, JANELA_POR_GRANULARIDADE.story)` em `:28`) e `TENDENCIA_SUST` (`acelerato/tendencia.ts:20-52`); mínimo de 20.
- Portão: fora de `METRICAS_ORIGEM_REAL` (`packages/contratos/src/origem.ts:12-33`), dentro de `METRICAS_SEM_SIMULACAO` (`:125-130`); a API responde `sem-dado-real` antes do cálculo (`server/src/modulos/metricas/servico.ts:259`). Consequência: **nenhum teste de rota prova a janela ou a nota antes da virada** (Lotes 5 e 7); antes disso, a prova é de função ou de carregador.
- Contrato: `resultadoTendenciaFluxo` / `resultadoTendenciaSust` (`schemas.ts:1328-1362`), `concluidos` e `volume` obrigatórios (`:1344`, `:1359`); `z.object` sem `.strict()` (descarta chave extra, não recusa).
- `Carga.inicio` (`servico.ts:59`, `:155-168`) é o menor `criado_em`/`aberto_em`, usado no 422 do período custom (`:276-278`). Não é o `historicoDesde` e não muda.
- Coletas: BusinessMap grava `carga_inicial` com `inicio_carga` em `dspd_bm.ctl_coleta` em duas tarefas: cards (`tarefa = 'coleta_incremental'`, `businessmap/coleta.ts:116`, `:179-182`) e apontamento (`tarefa = 'apontamento'`, `apontamento/coleta.ts:87`, `:293-294`); a carga pode ser refeita com outro `--inicio` (`coleta-comando.ts:37-41`). Acelerato **não grava início**: lê tudo desde `DATA_MINIMA = '1000-01-01'` (`acelerato/sql.ts:105`, `coletor.ts:227-228`) e grava só hashes e `sincronizado_em_max` (`acelerato/controle.ts:55-60`).
- GRANT: `dspd_api` já tem `SELECT` nas tabelas `ctl_` (`plataforma/db/grants.ts:108-114`).
- Versões de critério da biblioteca: `VERSOES_DA_BIBLIOTECA` (`core/criterios.ts:113-133`), precedente do 065 e do 075 (Lote 6a).

## 3. Regras técnicas fixadas
- **`historicoDesde` do BusinessMap (A2):** `min(parametros ->> 'inicio_carga')` em `dspd_bm.ctl_coleta` com `tarefa = 'coleta_incremental' AND parametros ->> 'tipo' = 'carga_inicial' AND status = 'sucesso'`. `min` porque o histórico é append-only: a carga mais antiga continua na base mesmo se outra for refeita com `--inicio` mais recente. O apontamento nunca entra. Linha cujo `parametros` não passa no parse é ignorada, com log estruturado `warn` (sem conteúdo do campo); se nenhuma sobrar, conta como sem carga.
- **BusinessMap sem carga inicial com sucesso:** `TENDENCIA_FLUXO` responde `sem-dado-real` (como as demais métricas da fonte).
- **`historicoDesde` do Acelerato (A1):** depende da P-077-6 (§9). Pela recomendação (a): ausente sempre que houver coleta com sucesso (a carga não tem recorte, logo não trunca janela); `sem-dado-real` só sem nenhuma coleta com sucesso.
- **Fonte nunca misturada:** o do BusinessMap só chega a `TENDENCIA_FLUXO`; o do Acelerato só a `TENDENCIA_SUST`.
- **Onde vive (A3):** campo novo `historicoDesde?: string` em `Carga`, lido dentro de `carregarBM` / `carregarAC`, em cache junto da marca d'água (uma consulta por recarga, não por requisição). `Carga.inicio` fica intacto.
- **Regra da janela (A4):** função única `janelaIncompleta(janela: Intervalo, historicoDesde?: string): boolean` em `core/series.ts`, verdadeira quando `janela.inicio < historicoDesde`; recebe a janela já calculada por `janelaMovelDia`, nunca reimplementa as 12 semanas. `historicoDesde` ausente = falso (mock e testes atuais intactos). Servidor e web não decidem a janela.

## 4. Contrato (política `docs/contratos/politica-de-mudanca.md` §2)
| Mudança | Onde | Classe | Lote | Ação no PR |
|---|---|---|---|---|
| `janelaIncompleta: { historicoDesde }` opcional por item de `meses` | `resultadoTendenciaFluxo`, `resultadoTendenciaSust` | aditiva (campo opcional novo) | 1a | `docs:fotografar`; 2 fotografias |
| refine: mês com `janelaIncompleta` não traz estatística (`p85PorTipo: []` / `prioridades: []`) | mesmos schemas | sem diferença de JSON Schema | 1a | nenhuma |
| `notas: z.array(notaSustentacaoIdSchema).optional()` no resultado | `resultadoTendenciaSust` | aditiva | 6a | `docs:fotografar`; 1 fotografia |
| constante de versão da virada | `VERSOES_DA_BIBLIOTECA` | não é schema (T2.6, política §4) | 5, 7 | nenhuma |
| ids em `METRICAS_ORIGEM_REAL` | `origem.ts` | não é schema de resposta | 5, 7 | nenhuma |
| Lote 8 (só se P-077-5 = A): ver §8 | | aditiva no molde recomendado | 8a | `docs:fotografar` |

- Nenhuma entrada em `aceitas.json` nos Lotes 1 a 7. Se o `docs:check` acusar "mudança INCOMPATÍVEL", o lote para e volta ao arquiteto (política §5).
- Objeto em vez de enum de motivo: valor novo de enum na resposta é incompatível; campo opcional novo não é. Precedência (CA-4): mês com janela incompleta não traz estatística, então "poucos itens" nunca aparece nele.

## 5. Ordem, teto e conflito com o 075 (A6, A9)
- Teto de 150 linhas por lote (estimativas abaixo); lote que passar leva `teto: excedido, <n> linhas, <motivo>` no PR, com um comportamento só, aceito no review.
- node-backend, um cartão por vez: **1a → 2 → 1b → 3a → 6a → (8a) → 5 → 3b → 7**. react-frontend: **4a → 4b → 6b → (8b)**. 4a depende de 1a; 4b de 1a; 6b de 6a; 8b de 8a.
- Presos: Lote 5 espera a resposta da P-077-5 (se A, 8a/8b antes); Lotes 3b e 7 esperam a P-077-6. Lotes 1a, 1b, 2, 3a, 4a, 4b, 6a e 6b não dependem de nenhuma pergunta aberta.
- Conflito com o 075 (`origem.ts`/`origem.test.ts` no 6b e 9b; `criterios.ts` no 6a; `servico.ts:300-310` no 6a e 6b): a branch se atualiza só no merge (`R-FLUXO`) e cada PR roda `forge-check sobreposicao` contra os PRs abertos do 075. Testes de `origem.test.ts` afirmam presença e ausência de ids listados, nunca um tamanho fixo.
- Revisão de interface do ux-designer (E2.6): 4a, 4b, 6b, 8b e a tela real depois dos Lotes 5 e 7. `gatilhos_seguranca`: nenhum previsto (GRANT já existe; conferir no 3a); nenhum dado de pessoa, dependência nova ou escrita em fonte externa.

## Lote 1a · função da janela e contrato (node-backend, ~120 linhas)
- Comportamento: o contrato aceita e a biblioteca decide "janela incompleta" por mês.
- `core/series.ts`: `janelaIncompleta` (§3). `schemas.ts`: campo opcional e refine nos dois schemas (§4, aditiva).
- Testes: fronteira (`janela.inicio = historicoDesde` é completa; um dia antes é incompleta); ausente = falso; refine recusa mês com `janelaIncompleta` e estatística; refine aceita mês com `janelaIncompleta` e contagens; item com campo extra de pessoa: o objeto devolvido pelo parse não traz o campo (A5; sem `.strict()`, que mudaria a fotografia); `docs:check` verde após `docs:fotografar`.

## Lote 1b · tendências aplicam a janela (node-backend, ~110 linhas)
- Comportamento: mês de janela incompleta sai com `janelaIncompleta` e sem estatística, nas duas tendências.
- Os dois `tendencia.ts` recebem `historicoDesde` opcional pelo contexto e chamam `janelaIncompleta` com a janela que já calculam.
- Testes: 30 itens e janela incompleta sem estatística e com a data (CA-1); 14 itens e janela incompleta só com `janelaIncompleta` (CA-4); janela completa com 19 itens segue `insuficiente` (CA-3); contagens do mês inalteradas; propriedade "cada ponto = `calcularO3`" roda sem `historicoDesde` (A4).

## Lote 2 · herança de marcações (node-backend, ~90 linhas)
- Comportamento: a tendência mostra toda mudança de critério das métricas de origem (P-077-3).
- Tabela única `ORIGEM_DA_TENDENCIA` (`TENDENCIA_FLUXO` → O3, O4; `TENDENCIA_SUST` → S2, S3) usada por `marcacoesNoPeriodo`.
- Testes: versão com `afeta: ['O3']` marca `TENDENCIA_FLUXO`; `['S2']` marca `TENDENCIA_SUST`; nunca cruzado; versão de fixture que afeta a tendência aparece em `criterios` com data e descrição (base de CA-12). A versão real da virada não entra aqui (A8).

## Lote 3a · início do histórico do BusinessMap (node-backend, ~130 linhas)
- Comportamento: o servidor conhece o `historicoDesde` do BusinessMap e o entrega a `TENDENCIA_FLUXO`.
- `Carga.historicoDesde` em `carregarBM` pela regra do §3 (A2, A3); repasse no contexto do cálculo; sem carga inicial com sucesso, `TENDENCIA_FLUXO` = `sem-dado-real`.
- node-backend confere `colunasApi('bm', 'ctl_coleta')` e registra no PR; se faltar coluna, para e aciona o `security-engineer` (gatilho `banco`).
- Testes (carregador sobre a base de teste; a rota só prova no Lote 5): duas cargas iniciais de cards com `inicio_carga` diferentes e uma linha de apontamento com `inicio_carga` mais antigo → menor das cargas de cards; sem carga inicial com sucesso (só falha ou só apontamento) → ausente e `sem-dado-real`; `parametros` inválido ignorado; `historicoDesde` nunca chega ao contexto de `TENDENCIA_SUST`. Um teste por ramo (100% de ramos no server).

## Lote 3b · início do histórico do Acelerato (node-backend, ~60 linhas; espera P-077-6)
- Comportamento pela recomendação (a): `Carga.historicoDesde` do Acelerato fica ausente com coleta com sucesso; `TENDENCIA_SUST` = `sem-dado-real` sem nenhuma coleta com sucesso (reaproveita a regra já usada pelas métricas do Acelerato, se houver). Pela (b): `historicoDesde = Carga.inicio` do Acelerato (menor `aberto_em`), sem consulta nova.
- Testes: os dois ramos da opção escolhida; o valor nunca chega a `TENDENCIA_FLUXO`.

## Lote 4a · tela da janela incompleta no fluxo (react-frontend, ~120 linhas)
- `SerieMensal` (marcador vazado sem linha, motivo na lista `{id}-sem-valor`, situação na tabela, frase do subtítulo, `figcaption`, texto de vazio) e o mapeador de `TendenciaFluxo.tsx`. Nenhum componente novo.
- Testes: CA-1, CA-2, CA-3, CA-4, CA-5, CA-6, CA-7, CA-14 no fluxo.

## Lote 4b · tela da janela incompleta na sustentação (react-frontend, ~80 linhas)
- Mapeador de `TendenciaSustentacao.tsx` sobre o `SerieMensal` do 4a.
- Testes: CA-1, CA-2, CA-4, CA-5 e CA-14 na série de SLA; série de volume sem marcador de janela.

## Lote 5 · TENDENCIA_FLUXO no mapa real (node-backend, ~90 linhas; espera P-077-5)
- `origem.ts`: id em `METRICAS_ORIGEM_REAL`, mantido em `METRICAS_SEM_SIMULACAO`; `origem.test.ts` afirma o id presente e "id do mapa real nunca simulável" no lugar de `:178` (A9). Constante da virada do BusinessMap em `VERSOES_DA_BIBLIOTECA`, `afeta: ['TENDENCIA_FLUXO']`, data = dia da abertura do PR, corrigida no merge se escorregar (A8; pela R5 a marca só aparece no mês fechado).
- Testes (rota, base real-like, sem mock; A11): `historicoDesde = 2026-01-01` e `dataReferencia = 2026-12-01` → fevereiro com `janelaIncompleta` e abril em diante publicados no mesmo resultado (CA-2 de ponta a ponta); tipo com 19 entregues sai `insuficiente`; dado do Acelerato não altera o resultado; marca da virada em `criterios` (CA-12); latência medida no QA contra A1/C3 da ADR 0003 (R3).

## Lote 6a · ressalva do S2 na tendência de SLA (node-backend, ~90 linhas)
- `notas` opcional em `resultadoTendenciaSust` (§4, aditiva); `semParteDeAjusteDePrioridade` (`parte-sem-dado.ts:39-47`) ganha o ramo `TENDENCIA_SUST`, mesma condição do S2 (`servico.ts:309`), sem regra nova.
- Testes (função pura, A7): nota presente quando o S2 a teria; ausente quando não; id fora do enum recusado pelo schema; `docs:check` verde. Ponta a ponta no Lote 7.

## Lote 6b · tela da ressalva (react-frontend, ~120 linhas)
- Lista `notas-tendencia-sla` entre o subtítulo e o gráfico de SLA, texto de `TEXTO_NOTA_QUALQUER`.
- Testes: CA-8 (com ponto publicado), CA-9, CA-10, CA-11, CA-13, série de SLA vazia sem nota.

## Lote 7 · TENDENCIA_SUST no mapa real (node-backend, ~90 linhas; espera 3b)
- `origem.ts`: id em `METRICAS_ORIGEM_REAL`; `origem.test.ts` afirma o id fora do mock (`:74-79`) por lista. Constante da virada do Acelerato, `afeta: ['TENDENCIA_SUST']`, mesma regra de data do Lote 5.
- Testes (rota, base real-like): prioridade com 19 apuráveis `insuficiente`; BusinessMap não interfere; marca da virada; nota presente no resultado real (CA-8 de ponta a ponta); se P-077-6 = (b), um mês incompleto e um publicado no mesmo resultado (A11).

## Lote 8 · contagem de mês anterior ao histórico (só se P-077-5 = A)
- 8a (node-backend, ~80 linhas): campo opcional `contagemParcial: { historicoDesde }` no item de `meses` (aditiva), marcado quando o primeiro dia do mês é anterior a `historicoDesde` (condição diferente da janela, A10), decidido por função única em `core/series.ts`. `concluidos` / `volume` continuam no payload. Testes: fronteira (mês que começa no `historicoDesde` não é parcial); ausente sem `historicoDesde`; `docs:check` verde.
- 8b (react-frontend, ~80 linhas): a web não plota nem tabela o número do mês marcado; mostra "histórico incompleto" pelo padrão do 4a. Testes: número nunca aparece em gráfico, tabela ou `figcaption`. Revisão de interface (E2.6).
- Ordem: 8a depois de 1b, antes do Lote 5.

## P-077-5 revista
A recomendação da revisão 2 ("campo opcional novo, compatível") estava errada para o molde que o próprio desenho adota (A10): retirar o número exige mexer em campo obrigatório.

**Opção A, molde incompatível (número sai do payload).**
- Contrato: `concluidos` (`schemas.ts:1344`) e `volume` (`:1359`) passam a opcionais (ou nulos), com refine "ausente se e só se `contagemParcial`". Obrigatório que vira opcional na resposta é incompatível (política §2): `docs:check` falha nas fotografias `TENDENCIA_FLUXO` e `TENDENCIA_SUST`.
- Saída pela política: `/api/v2` (regra da tabela §2) ou duas entradas em `aceitas.json` (uma por contrato, hash de cada mudança, motivo, data), de uso único: entram, `docs:fotografar`, saem no mesmo PR. O aceite exige software-architect + tech-lead e o **prazo de convivência é do usuário** (§5): outra pergunta ao dono, ainda que a resposta seja "zero" porque a web é o único consumidor e sobe junto.
- Lotes afetados: 1a (mesmos schemas: o 8 não pode correr junto), 4a e 4b (os mapeadores passam a tratar número ausente; o TypeScript obriga a mexer de novo), mock e fixtures que montam `concluidos`/`volume`, Lotes 5 e 7 (presos até o 8 entrar). Estimativa: 8a ~140 linhas, 8b ~100 linhas, mais retrabalho em 4a/4b.

**Opção A, molde aditivo (recomendado, se o dono escolher A).** Lote 8 do jeito descrito acima: número mantido com marca no mesmo item, web não o mostra. Custo: 8a ~80 e 8b ~80 linhas, sem aceite, sem `/api/v2`, sem pergunta de convivência, sem retrabalho nos Lotes 1 e 4. Contra: abre exceção ao princípio "o payload não carrega o número que a regra proíbe". Aceito porque a contagem não é estatística inválida (é o que a base tem, parcial), a marca viaja no mesmo item e a web é o único consumidor. Critério de reversão: surgir um segundo consumidor do resultado (exportação, outra tela, integração) que leia `concluidos`/`volume` sem ler a marca; aí o molde passa ao incompatível, com aceite.

**Opção B (publica como hoje).** Custo zero de código. Risco: mês anterior ao histórico mostra 0 ou contagem parcial como se fosse real (R6), lado a lado com pontos de linha marcados "janela incompleta".

**Recomendação refeita ao dono: A, com o molde aditivo.** Motivo: mesmo efeito na tela que a A incompatível (o número parcial não aparece e o motivo é dito), por um terço do custo e sem decisão extra de convivência; e coerente com a P-077-1, que já esconde o ponto de linha do mesmo mês. A escolha do molde é técnica (aditiva, aprovação do tech-lead no review); a pergunta ao dono continua só "mostra ou não mostra a contagem". Efeito da P-077-6: com (a), o Acelerato não tem `historicoDesde` e a P-077-5 só muda o fluxo; com (b), muda as duas.

## 9. Pergunta nova ao dono (A1 muda a premissa da P-077-4 para o Acelerato)
- **P-077-6:** a P-077-4 tomou como início do histórico o `inicio_carga` da carga inicial, mas a carga do Acelerato não tem recorte: lê tudo o que o Acelerato tem. Para a tendência de SLA, o início do histórico do Acelerato é (a) inexistente, isto é, todo mês tem o histórico inteiro e nenhum ponto sai "janela incompleta" (recomendado: é o que a carga faz; os meses antes do primeiro chamado já saem sem estatística pelo mínimo de 20; diferença prática só se a série alcançar os primeiros meses de uso do Acelerato), ou (b) a data do chamado mais antigo na base, com janela incompleta nos meses próximos a ela (mais conservador; vale se houve chamados da DSPD antes do Acelerato, fora dele)? Bloqueia só os Lotes 3b e 7.

## 10. Riscos
- R1: série quase toda "janela incompleta" com histórico curto (efeito esperado; texto de vazio do UX). Com `historicoDesde` em agosto, a série real do fluxo fica vazia até novembro fechar (A11).
- R2: sustentação rala (318 fechados em 84 dias, 064 Q23): série de SLA tende a sair vazia por prioridade.
- R3: primeira consulta sobre 18175 cards não medida contra a ADR 0003; medir no QA do Lote 5; se estourar, pré-cálculo na carga (ADR 0019) sem mudar semântica.
- R4: pontos passados mudam com reabertura ou reclassificação (ADR 0019); não é defeito.
- R5: marca da virada só aparece quando o mês dela fechar; o QA testa com `dataReferencia` posterior.
- R6: contagem de mês anterior ao histórico (P-077-5).
- R7: sobreposição com o 075 em `origem.ts`, `criterios.ts` e `servico.ts` (§5).
