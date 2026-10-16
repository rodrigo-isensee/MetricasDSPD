# Plano de testes - Back do pedido 011, fase 1 (K-078)

Links: especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (CA-1 a CA-44, regras gerais da seção 3); pedido `docs/pedidos/011-metricas-tambem-disponiveis.md` ("Decisões do usuário", inclusive 2026-10-16); review `docs/reviews/011-back.md` (lote B2 a B10 e B11a); contrato `docs/api/metricas.md` (seção "Métricas também disponíveis, fase 1") na worktree `/home/rodrigoisensee/MetricasDSPD-011-back`.

Branch `feature/011-metricas-tambem-back` (35 commits à frente da `develop` na leitura de 2026-10-15; HEAD de partida do plano `83796d9`). Este documento é o **plano**: nada foi executado. O parecer `R-QA` é outro arquivo, `docs/qa/011-back.md`, escrito depois do review final (B12) aprovado, com o commit HEAD testado.

## 1. Escopo

Dentro (back da fase 1): O19, O20, O21, O23 (bloco do O2), O24, O25, T10, T11, T12, E7 (sem R$) e E9; as rotas `GET /api/v1/metricas/:id` novas; a biblioteca (`packages/metricas`), o mock da fase 1 (B11a; B11b para o T11), os contratos (`packages/contratos`), as versões de critério (T2.6) e o orçamento C1 a C4.

Fora, por não existir no back da fase 1 (cada item vira lacuna declarada, não teste):
- CA-1, CA-2, CA-3, CA-15, CA-16 (parte de tela: seções, "Como ler", "Ver como tabela", selo), CA-12 (chip e listrado do T11), CA-7 (rodapé "Fonte: BusinessMap"): são do front (K-075 em diante). No back guarda-se o equivalente: fonte `businessmap` no catálogo e nenhum dado do Acelerato (casos F-1 a F-3).
- O22, O26, T13, T14, E6, E8 e os CAs 8, 9, 10, 18, 20, 21, 25 a 34, 38, 40 a 43: fases 2 e 3 (coleta nova).
- CA-35 (E7 com custo): o contrato já traz `custoRateado`/`custoPorDemanda` anuláveis e `custoConfigurado: false`; o cálculo com R$ é da fase 2 (K-078, T2.6). Só o estado sem R$ (CA-13) é testado.
- Segurança (R-SEGURANCA) e CI/container: de outros agentes. Os casos de abuso do `security-engineer` entram aqui quando chegarem (seção 6).

Pendências de entrada (bloqueiam a execução, não o plano): B11a-1 (O23 em 6,7%, alvo 20 a 30%), B11a-2 (docs), B11a-3 (C1 medido), B11b (T11 no back; hoje T11 não existe em `METRICA_IDS`, são 60 ids) e o merge de `origin/develop` (emenda C4 da ADR 0003).

## 2. Regras invioláveis a proteger (suítes transversais)

| ID | Regra | Caso | Teste existente / a escrever |
|---|---|---|---|
| INV-1 | Mínimo de 20 (percentil e percentual) | N-1: em cada métrica, 19 não publica e 20 publica; censo (contagem, soma) sempre sai | existe por métrica (ver seção 3: `o24.test.ts:54`, `bloqueios.test.ts:234`, `e7.test.ts:76`, `t12.test.ts:141`, `o25.test.ts:64`, `o21.test.ts:86`, `o23.test.ts:71`). **A escrever:** guarda de suíte vazia, um teste varrendo as 11 ids da fase 1 afirma que cada uma tem ao menos um caso 19/20 (lista nominal, mínimo 11) |
| INV-2 | Percentis P50/P85/P95 em janela móvel de 12 semanas (84 dias; dia 84 dentro, 85 fora) | J-1: O19 e T10 | existe (`bloqueios.test.ts:373`, `:396`) |
|  |  | J-2: O24, O25, O21 usam a janela de 12 semanas para o percentil mesmo com período de 12 meses | **a escrever** (um teste por métrica: período de 12 meses, item no dia 85 conta no censo e fora do percentil) |
|  |  | J-3: T10-janela = A (usuário, 2026-10-16): percentil em 12 semanas, contagem segue o período | existe (`bloqueios.test.ts:317`, "com 12 meses a janela..."); conferir a asserção ao rodar |
| INV-3 | Nenhuma pessoa nem equipe na saída | P-1: contratos `strict`, sem chave de pessoa/equipe/time/quadro (varredura recursiva com mínimo de objetos) | existe (`packages/contratos/src/tambem.test.ts`, R1/R2 do B1) |
|  |  | P-2: R5, com "Todas" ou várias equipes o eixo é `papel` e nenhuma `chave`/`origem`/`destino` é código de equipe (O20, O21); O24 e T12 sem equipe | existe (`o20.test.ts:422`, `o21.test.ts:121`, `o24.test.ts:138`, `t12.test.ts:181`) |
|  |  | P-3: resposta HTTP real das 11 rotas, serializada e varrida por e-mail, nome do mock e chaves proibidas | **a escrever** (`e2e/tests-api/api.spec.ts` ou `server/tests`, ver A-9) |
|  |  | P-4: lint `no-restricted-properties` para `responsaveis`/`usuario` em `businessmap/**` | existe (meta-teste do B1); rodar `pnpm run lint` |
| INV-4 | BusinessMap × Acelerato nunca se misturam | F-1: as 11 ids têm `fonteDaMetrica = 'businessmap'` | **a escrever** (lista nominal) |
|  |  | F-2: dobrar/apagar `base.ac` não altera nenhum resultado das 11 ids (igualdade profunda) | **a escrever** (mesmo padrão do critério 1 do B11a: `hashJson(base.ac)` inalterado) |
|  |  | F-3: B11a não mudou o Acelerato (hash `ac` antes/depois, escalas 1 e 0,2) | existe (critério 1 do B11a, em `packages/mock`); conferir que roda |
| INV-5 | Story, frente e projeto nunca no mesmo histograma | G-1: O19, T10, T12, O21, O24, O25, E7: só story-demanda; frente, projeto, subtarefa e bug interno fora | existe (`o25.test.ts:337`, `o21.test.ts:241`, `t12.test.ts:197`, `e7.test.ts:110`, `bloqueios.test.ts:157`); E9 usa só projeto (`e9.test.ts:45`) |
| INV-6 | Nada de tempo apontado (CA-22) | H-1: nenhum campo de horas apontadas é lido; `o23` não usa apontamento como sinal de movimento | existe parcial (`o23.test.ts:71`, só mudança de coluna conta). **A escrever:** teste do tipo "card com horas apontadas e sem mudança de coluna segue parado" no O23 e no O19 (o `fato_bloqueio` usa horas úteis de bloqueio, não apontadas: afirmar que nenhum campo `horas*`/`apontad*` aparece em contratos e fixtures) |
| INV-7 | Carga: histórico nunca sobrescrito; arquivados e excluídos permanecem | H-2: O20 usa `fimDeVidaAberta`; excluído conta no instante certo | existe (`o20.test.ts:251`, `:265`, `o25.test.ts:134`) |
| INV-8 | Dias úteis, biblioteca única (sem cálculo próprio) | B-1: percentis e dias úteis passam pela biblioteca (T2.5) | existe parcial (`o21.test.ts:223`, "ciclo vem da mesma função do O3"; O20 "usa a varredura do B8"). **A escrever:** teste estático que afirma que os arquivos das 11 métricas não definem percentil/dias úteis próprios (grep dos símbolos, com mínimo de 11 arquivos) |
| INV-9 | Sem alertas em "Pede atenção" (CA-14) | AL-1: `VISAO_GERAL` não emite nenhum id da fase 1 em alertas/indicadores | existe de fato (review: `visaoGeral.ts` só emite ids do núcleo); **a escrever** teste explícito sobre `alertas` (lista nominal das 11 ids, afirmar ausência) |
| INV-10 | Ordem neutra (CA-11) | O-1: T10 alfabético, T12 por volume (desempate nome), E7 por participação (menos de 20 no fim); embaralhar a entrada não muda a saída | existe (`bloqueios.test.ts:221`, `t12.test.ts:164`, `e7.test.ts:32/84`) |

### T2.6: marcações de critério (INV-11)

Cinco versões na biblioteca (`packages/metricas/src/core/criterios.ts`, `VERSOES_DA_BIBLIOTECA`). O plano pedido cobre as 3 de 2026-10-16 e o descarte nativo; a v1 do O23 entra por completude.

| ID | Versão (`id`) | Data | `afeta` | Caso | Teste |
|---|---|---|---|---|---|
| CR-1 | `criterio-2026-10-16-excluido-entregue` | 2026-10-16 | todas as ids BusinessMap | período que cruza 16/10 traz a marcação; período anterior (termina em 15/10) não traz; o `afeta` é igual a `METRICA_IDS` de fonte BusinessMap menos as nascidas depois (B11a-7) | existe parcial (`o25.test.ts:273`). **A escrever:** o teste de igualdade do `afeta` (B11a-7) e a marcação em 3 métricas fora do O25 (O19, O3, E7) |
| CR-2 | `criterio-2026-10-16-o19-pct-em-dias-uteis` | 2026-10-16 | só O19 | marcação só no O19 e na sua janela (não no T10: `bloqueios.test.ts:437`); outras métricas não a trazem | existe (`bloqueios.test.ts:147`, `:432`) |
| CR-3 | `criterio-2026-10-16-o20-destaque-sem-backlog` | 2026-10-16 | só O20 | `mudancasCriterio` do O20 traz a versão se o período a cruza; destaque nunca é Backlog nem Entregue | existe (`o20.test.ts:366`, `:403`) |
| CR-4 | `criterio-2026-10-15-descarte-nativo` | 2026-10-15 | todas as ids BusinessMap | marcação em período que cruza 15/10; o `afeta` não tem id nascida depois (`NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`) | existe (`o23.test.ts:50`) |
| CR-5 | `criterio-2026-10-14-parados-v1` | 2026-10-14 | O2 | O2 traz "v1 do estoque parado" quando o período cruza 14/10; no mock ("hoje" 2026-10-09) não aparece | existe (`o23.test.ts:30`, `:35`) |
| CR-6 | Marcação é **série** (O24, O25, T11 `marcacoes`; O20 `mudancasCriterio`) e não repete id quando base e biblioteca trazem a mesma | existe (review B2, "prova que não repete id") |
| CR-7 | Toda série da fase 1 tem o campo de marcação (O19, O24, O25, T10, T12, E7, E9: `criterios.serie`) | existe (`t12.test.ts:287`, `e9.test.ts:219`, `e7.test.ts:174`) |
| CR-8 | (review L3) marcação cruzando o período em O19, T10, T12, E7, E9 | existe após o ajuste do review; conferir uma `VersaoCriterio` **dentro** do período em cada |
| CR-9 | O dia 16/10 exatamente: versão em 2026-10-16 e período `[.., 2026-10-16]` incluem, `[.., 2026-10-15]` excluem (fronteira) | **a escrever** (um teste parametrizado) |

## 3. Casos por critério de aceite (back)

Legenda: **E** = existe (arquivo; confirmar por execução, sem rodar a suíte pesada agora); **AE** = a escrever. Os números de linha são os da leitura de 2026-10-15 e podem mudar.

### O23 (bloco do O2) - CA-4, CA-5

| Caso | Cenário | Teste |
|---|---|---|
| O23-1 | CA-4: `parados` com `k`/`n`; limite 5 dias úteis; só mudança de coluna conta como mover | E `o23.test.ts:71` |
| O23-2 | CA-5/N-1: n < 20 sai "k de n" sem percentual; n = 20 publica | E `o23.test.ts:71`, `:83` |
| O23-3 | Borda do limite: item com exatamente 5 dias úteis sem mover não conta; com 5,01/6 conta ("mais de 5") | AE |
| O23-4 | Vazio: 0 de 0, sem divisão por zero | E `o23.test.ts:97` |
| O23-5 | `porEtapa` igual às etapas do O2; campo obrigatório no schema (B2) | E (`tambem.test.ts` invertido) |
| O23-6 | Mock: 20 a 30% em "Todas"/12 semanas | E `o23.test.ts:107` (**vermelho hoje, 6,7%: B11a-1**; deve ficar verde antes do QA) |

### O19 Bloqueios por causa - CA-5, CA-7, CA-24 (base), decisão O19-pct = B

| Caso | Cenário | Teste |
|---|---|---|
| O19-1 | 7 motivos sempre, ordem do domínio, soma e contagem sempre, P50/P85 só com ≥ 20 bloqueios | E `bloqueios.test.ts:59` |
| O19-2 | **O19-pct = B:** `pctDoTotal` = dias úteis da causa ÷ total de dias úteis | E `:88` |
| O19-3 | Mínimo de 20 sobre bloqueios da causa (19 não publica mesmo com total ≥ 20; 20 publica) | E `:122` |
| O19-4 | 20 bloqueios sem dia útil (total 0): 0%, sem divisão por zero | E `:138` |
| O19-5 | Abertos fora da soma e contados em `abertosForaDaSoma`; só `fim` dentro do período | E `:157`, `:445` |
| O19-6 | Filtros equipe/sistema/tipo pelo card; base vazia | E `:175`, `:188` |
| O19-7 | Janela 84/85 | E `:373` |
| O19-8 | Mock: ≥ 120 encerrados, 3 a 5 abertos, um motivo ≥ 20 e ≥ 2 abaixo | E `:292`, `:307` |
| O19-9 | Soma dos `pctDoTotal` publicados nunca passa de 100% (propriedade, arredondamento) | AE |

### O20 Fluxo cumulativo - decisão O20-destaque = A

| Caso | Cenário | Teste |
|---|---|---|
| O20-1 | Uma equipe: faixa por coluna; destaque na fila que mais cresceu | E `o20.test.ts:76` |
| O20-2 | **Destaque nunca é Backlog** nem coluna de execução nem Entregue; considera só filas a partir do compromisso | E `:133`, `:155`, `:403` |
| O20-3 | Sem fila que cresça: destaque nulo ("Nenhuma etapa acumulou") | E `:110` |
| O20-4 | "Todas": faixa por papel, nunca equipe (R5) | E `:310`, `:422` |
| O20-5 | Arquivado sai no instante do arquivamento; entregue e depois arquivado segue em Entregue | E `:251`, `:265` |
| O20-6 | Sem transição no período: estado vazio | E `:293`, `:300` |
| O20-7 | `emProgresso` por dia = WIP do O1 | E `:485` |
| O20-8 | Alvo do mock com uma equipe: `para - de >= 5` (B11a-8) | AE (review pede; hoje afirma só > 0) |
| O20-9 | Alvo do mock no "Todas": `destaqueDoTodasAceito` aceitava Backlog; com O20-destaque = A deve aceitar só fila a partir do compromisso | AE (reescrever a asserção; hoje ainda admite Backlog) |

### O21 Fluxo reverso - CA-5, CA-6

| Caso | Cenário | Teste |
|---|---|---|
| O21-1 | Taxa de entregas com retorno: ≥ 20 percentual; < 20 "k de n" | E `o21.test.ts:86` |
| O21-2 | Matriz só de retornos; reabertura em linha própria e contada à parte | E `:97` |
| O21-3 | **CA-6:** par com × sem só com ≥ 20 em cada grupo; `grupoAbaixoDoMinimo` diz qual (19/20, em cada lado) | E `:174` (AE: caso com o grupo "sem" em 19 e o "com" em 20, e o inverso, se só um lado estiver coberto) |
| O21-4 | Regra 7: par por tipo, tipos nunca juntos | E `:197` |
| O21-5 | Eixo por papel em "Todas"/várias equipes (R5) | E `:121` |
| O21-6 | Retorno sem origem não conta; origem fora do quadro vira `sem-papel` | E `:155` |
| O21-7 | Retorno dentro do intervalo de execução: O3, O4, T1 iguais com e sem o passo do mock | E `:335` |
| O21-8 | Mock: 20 a 30% com retorno; par com ≥ 1 tipo publicado e ≥ 1 insuficiente | E `:294`, `:327` |

### O24 Ordem de chegada - CA-17, CA-37

| Caso | Cenário | Teste |
|---|---|---|
| O24-1 | **CA-17:** só classe Padrão (quem passa e quem espera); Urgente, Prazo fixo e Intangível fora | E `o24.test.ts:109` |
| O24-2 | Mesmo tipo e fila da mesma equipe (D-6' = A); nada compara equipes | E `:123`, `:128` |
| O24-3 | **CA-37:** espera = dias úteis do início do **primeiro** item que passou até o início do ultrapassado | E `:61` |
| O24-4 | Mínimo: percentual com ≥ 20 inícios; P50/P85 com ≥ 20 ultrapassados no tipo; por tipo | E `:54`, `:77`, `:86` |
| O24-5 | Fronteiras: mesmo instante não é ultrapassagem; ultrapassado que não iniciou fora; descartado/arquivado antes não esperava | E `:100`, `:181`, `:217` |
| O24-6 | Excluído fora da fila; subtarefa e bug interno fora | E `:197` |
| O24-7 | Varredura O(n log n) = comparação ingênua par a par (mock, 12 meses) | E `:293` |
| O24-8 | Mock: 20 a 30% fora de ordem; B11a trocou `criado_em` (desvio aceito, B11a-5) | E `:266` |
| O24-9 | Texto-contrato: a rota nunca devolve texto "dias a mais"; só números (o texto é do front) | n/a no back; vira caso do front |
| O24-10 | B11a-6: `criado_em` permutado não deixa subtarefa "criada antes do pai" | AE (coerência pai/filho no mock) |

### O25 Descarte - CA-19, CA-26, CA-44, decisão O25(b) = B

| Caso | Cenário | Teste |
|---|---|---|
| O25-1 | Taxa = descartados ÷ encerrados; ≥ 20 publica, < 20 "k de n" | E `o25.test.ts:64` |
| O25-2 | **CA-19:** tempo consumido do início ao descarte; antes do início à parte com zero | E `:84` |
| O25-3 | P50/P85 do consumido só dos descartados depois do início, por tipo, mínimo 20 (19/20) | E `:103`, `:118` |
| O25-4 | **CA-26:** nativo `discarded` e excluído contam; excluído no instante da exclusão, senão última revisão marcada aproximada | E `:134`, `:152`, `:164`, `:456` |
| O25-5 | **CA-26:** motivo sem descarte nem exclusão: aviso, fora da taxa; aviso segue o período | E `:176`, `:188` |
| O25-6 | **O25(b) = B:** entregue e depois excluído segue como entrega (vazão, ciclo, O25 não conta); exclusão na mesma hora da entrega também é entregue; o que não estava entregue segue descarte | E `:227`, `:241`, `:281` |
| O25-7 | O25(b) nas demais métricas: o card entregue-e-excluído aparece no O3/O4 como entrega | E `:227` (conferir que cobre O3 e O4, não só O25) |
| O25-8 | **CA-44:** `porMotivo = null`; nenhum campo de motivo, comentário ou pessoa | E `:295` |
| O25-9 | Série mensal, mês corrente "em andamento", marcações | E `:313` |
| O25-10 | Mock: 6 a 10% descartados, 55 a 75% antes do início, ≥ 1 aviso e ≥ 1 excluído; nenhum tipo com 20 depois do início em 12 semanas | E `:375`, `:387`, `:395` |

### T10 Tempo de terceiros - CA-11, CA-24, CA-36

| Caso | Cenário | Teste |
|---|---|---|
| T10-1 | **CA-24:** todo bloqueio encerrado com fornecedor, qualquer motivo; sem fornecedor (nulo ou em branco) fora | E `bloqueios.test.ts:197` |
| T10-2 | **CA-11:** ordem alfabética, independente da entrada | E `:221` |
| T10-3 | P50/P85 por fornecedor só com ≥ 20 (19/20); contagem e soma sempre | E `:234` |
| T10-4 | **CA-36:** sem `prazoDiasUteis`, sem `status`, sem `prazoFornecedor` em nenhum nível | E `:256` |
| T10-5 | Janela 84/85 por fornecedor (T10-janela = A) | E `:396` |
| T10-6 | Mock: 40 a 70 bloqueios, 3 fornecedores, ≥ 1 com 20 e ≥ 1 abaixo | E `:317` |
| T10-7 | Fornecedor com nome só de espaços e com caixa diferente não dividem em duas linhas | AE |

### T11 Sazonalidade - CA-12 (parte de dados)

Depende do B11b; **hoje não há id, rota nem cálculo no back**. Casos prontos para escrever quando entrar:

| Caso | Cenário | Teste |
|---|---|---|
| T11-1 | Janela fixa de 24 meses fechados mais o corrente; "Não afetado por: Período" (período ignorado: resultados iguais com 3 períodos) | AE |
| T11-2 | Mês corrente marcado "em andamento"; contagem por `criado_em`; filtros equipe/tipo/sistema atuam | AE |
| T11-3 | Menos de 24 meses de histórico: devolve o que existe sem erro | AE |
| T11-4 | Picos de janeiro e julho no mock; hash próprio; base BM intacta (P-T4) | AE |
| T11-5 | Chave `mes-do-ano` no contrato; `marcacoes` presentes; nenhum percentil (censo) | AE (contrato existe) |
| T11-6 | T11 entra no `afeta` correto (nascida depois do descarte nativo, `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`) | AE (B11a-7) |

### T12 Qualidade da entrada por área - CA-11, CA-39

| Caso | Cenário | Teste |
|---|---|---|
| T12-1 | **CA-39 (a):** bloqueio "Falta de informação no chamado" **antes** do início conta; depois, não; card não iniciado conta | E `t12.test.ts:53`, `:70` |
| T12-2 | **CA-39 (b):** retorno da coluna de compromisso ao backlog conta; outro retorno não | E `:84` |
| T12-3 | Os dois critérios no mesmo card contam uma vez; card sem transição entra no n | E `:125`, `:120` |
| T12-4 | Percentual por área só com ≥ 20 (19/20); "k de n" sempre | E `:141` |
| T12-5 | **CA-11:** ordem por volume (desempate nome), sem depender da taxa | E `:164` |
| T12-6 | Linha é a área, nunca equipe (R5) | E `:181` |
| T12-7 | Só demandas criadas no período; frente e bug interno fora | E `:197` |
| T12-8 | Mock: 10 a 25% de ida e volta; ≥ 1 área com 20; 2 áreas com menos de 20; os dois critérios aparecem | E `:221`, `:236` |

### E7 Capacidade por sistema - CA-11, CA-13, CA-23

| Caso | Cenário | Teste |
|---|---|---|
| E7-1 | Participação por contagem de entregas; ordem por volume; `custoConfigurado: false` e R$ nulo | E `e7.test.ts:32` |
| E7-2 | **CA-13:** nenhum `custoRateado`/`custoPorDemanda` não nulo na saída enquanto não configurado (varredura das 2 chaves) | E parcial (`:32`); AE varredura sobre o mock inteiro |
| E7-3 | Sistema < 20 entregas: participação nula e fim da lista; total < 20: tudo nulo; fronteira 19/20 | E `:53`, `:66`, `:76` |
| E7-4 | **CA-23:** 4 naturezas sempre presentes, pela mesma função do T3 | E `:89`, `e7.natureza.test.ts` (AE: afirmar que `e7.ts` importa a classificação do T3 e não redefine) |
| E7-5 | Só demanda entregue no período; Estratégico sem Equipe (filtro de equipe não atua) | E `:110`, `:142` |
| E7-6 | Mock: soma das participações fecha 100%; 8 sistemas (a spec previa 18 a 20: divergência registrada na API, a levar ao usuário se importar) | E `:162` |
| E7-7 | Nenhum campo "por equipe" nem "por pessoa" | E parcial (P-1) |

### E9 Projetos aguardando início

| Caso | Cenário | Teste |
|---|---|---|
| E9-1 | Só projeto aberto e não iniciado, fora descartados e arquivados sem desfecho; ordem do mais antigo | E `e9.test.ts:45`, `:78` |
| E9-2 | Faixas 0–30, 31–90, 91–180, > 180, limites inclusivos (30/31, 90/91, 180/181) | E `:106` |
| E9-3 | Referência P85 só com ≥ 20 concluídos **por tipo**; Iniciativa e Melhoria nunca juntas | E `:116`, `:128`, `:146` |
| E9-4 | Retrato do dia: período ignorado; filtro de sistema atua | E `:180` |
| E9-5 | Lista vazia válida | E `:193` |
| E9-6 | Mock: 6 a 8 abertos, um > 180, todas as faixas, referência insuficiente | E `:199` |

### Critérios transversais

| CA | Caso | Teste |
|---|---|---|
| CA-5 | N-1 (INV-1) em todas as 11 ids | E por métrica + AE guarda |
| CA-6 | O21-3; T13 é fase 3 | E |
| CA-7 | F-1 a F-3 (INV-4) | AE |
| CA-11 | O-1 (INV-10) | E |
| CA-14 | AL-1 (INV-9) | AE |
| CA-22 | H-1 (INV-6) | AE parcial |
| CA-12 (dados) | T11-1 a T11-6 | AE (B11b) |

Total de casos: 80 (O23 6, O19 9, O20 9, O21 8, O24 10, O25 10, T10 7, T11 6, T12 8, E7 7, E9 6) mais 10 invariantes (INV-1 a INV-10), 9 de T2.6 (CR-1 a CR-9), e os de API, desempenho e mutação abaixo. Dos 80, 17 são "a escrever" (O23-3, O19-9, O20-8, O20-9, O21-3 parcial, O24-10, T10-7, E7-2 e E7-4 parciais, e os 6 do T11) e 63 já existem.

## 4. Testes de API (rotas novas, filtros, n < 20)

As rotas vivem em `server/src/modulos/metricas`. Dublê de banco: `server/tests/base-duble.ts`. Suítes existentes a estender: `server/tests/api.sistemico-intensivo.test.ts`, `server/tests/metricas.test.ts`, `server/tests/metricas.paridade.test.ts`, `e2e/tests-api/api.spec.ts`. Verificar antes de escrever o que elas já varrem (hoje percorrem os 60 ids).

| ID | Cenário | Esperado | Teste |
|---|---|---|---|
| A-1 | `GET /api/v1/metricas/:id` para cada uma das 10 ids com rota (O19, O20, O21, O24, O25, T10, T12, E7, E9 e o O2 com `parados`); T11 depois do B11b | 200, corpo valida no schema `strict` do contrato, `x-request-id` | AE por id (ou confirmar a varredura de 60 ids com mínimo de 60) |
| A-2 | Id fora de `METRICA_IDS` (`O22`, `O26`, `T13`, `T14`, `E6`, `E8`) | 404 `METRICA_NAO_ENCONTRADA`: não pode existir rota que devolva dado inventado | AE |
| A-3 | Filtros: `equipe`, `tipo`, `sistema`, período (12 semanas, 12 meses, custom) em cada rota onde se aplicam | 200; resultado muda como a biblioteca; filtro não aplicável é aceito e ignorado (E7, E9, T11) | AE por métrica |
| A-4 | Filtro inválido (equipe inexistente, período com fim antes do início, tipo fora do domínio, `pessoa=`/`responsavel=`) | 400 `details[{caminho, mensagem}]`, sem o valor recebido; `pessoa`/`responsavel` recusados (regra "nenhuma rota expõe pessoa") | AE |
| A-5 | n < 20 no recorte (equipe com poucos itens) em cada métrica com estatística | 200 com `insuficiente` ou taxa sem `pct`; **nunca** percentil numérico; vazio válido, não 500 | AE por métrica (usar a equipe pequena do mock) |
| A-6 | Recorte sem dado (período futuro) | 200 vazio válido (O20 estado vazio, O24 vazio, E9 lista vazia) | AE |
| A-7 | Paridade API × biblioteca: o JSON da rota é igual ao `calcularMetrica` do mesmo contexto | igualdade profunda | E (`metricas.paridade.test.ts`); conferir que inclui as 10 ids |
| A-8 | OpenAPI: gerado × versionado; as rotas novas e o `metrica` do `VISAO_GERAL` | igual; `pnpm --filter @metricas-dspd/server run openapi:verificar` | E |
| A-9 | Varredura de pessoa e equipe no corpo HTTP bruto de todas as rotas da fase 1 (INV-3, P-3) | nenhum e-mail, nenhum nome do mock, nenhuma chave de pessoa/equipe/time/quadro; mínimo de ids varridas | AE |
| A-10 | Payload gzip < 50 KB (ADR 0003, A3) nas rotas novas | dentro | E (`api-perf.sistemico-intensivo.test.ts`; B9 mediu 1,8 a 2,1 KB no O20) |
| A-11 | Somente GET: `POST`/`PUT`/`DELETE` nas rotas novas | 404/405, sem efeito | AE (uma rota, amostra) |
| A-12 | `GET /api/v1/metricas/VISAO_GERAL` | sem id da fase 1 em `alertas`; ids novas em `indicadores[].metrica` válidas no enum | AE (AL-1) |
| A-13 | Banco PostgreSQL real (papel `dspd_api`, GRANT por coluna) | rotas novas leem só colunas permitidas | fora do back da fase 1 (a base real da fase 1 é o dublê); rodar `pnpm run test:pg` só se o review pedir |

## 5. Mutação (no diff, nunca no projeto inteiro)

Ferramenta: Stryker, conforme `stacks/node-react/pronto.md`; meta em `docs/engineering/praticas.md`. Alvo: arquivos de produção do diff `develop...HEAD` em `packages/metricas/src/businessmap` (o19, o20, o21, o23/o2, o24, o25, t10, t12, e7, e9, `descartado.ts`, `varredura.ts`) e `core/criterios.ts`. Vermelho antes do verde: cada mutante abaixo precisa ser visto **falhando** contra o código mutado; registrar o comando e a falha no parecer. Cada linha: o que mudar, qual teste deve falhar.

| ID | Mutação | Deve falhar |
|---|---|---|
| M-1 | `MINIMO_AMOSTRA` 20 → 19 e → 21 (todas as métricas, uma por vez nas locais: `e7.ts`, `o21.ts`) | N-1 de cada métrica (19/20) |
| M-2 | O19: `pctDoTotal` volta a ser sobre bloqueios (reverter O19-pct) | `bloqueios.test.ts:88`, `:122` |
| M-3 | O20: voltar a incluir Backlog no destaque | `o20.test.ts:133/403` |
| M-4 | O25: contar entregue-e-excluído como descarte (reverter O25(b)) | `o25.test.ts:227`, `:241` |
| M-5 | O25: excluído sem instante usa data de criação em vez da última revisão | `o25.test.ts:456` |
| M-6 | O24: incluir classe Urgente na fila | `o24.test.ts:109` |
| M-7 | O24: `<` por `<=` na comparação de início | `o24.test.ts:217` |
| M-8 | O24: espera do segundo item que passou, em vez do primeiro | `o24.test.ts:61` |
| M-9 | T12: critério (a) vale também depois do início | `t12.test.ts:53` |
| M-10 | T10: aceitar bloqueio sem fornecedor / filtrar por motivo | `bloqueios.test.ts:197` |
| M-11 | T10/O19: janela 84 → 85 dias | `bloqueios.test.ts:373/396` |
| M-12 | O23: `> 5` por `>= 5` (limite) | O23-3 (a escrever) |
| M-13 | O21: com × sem passa a usar grupo de todos os tipos juntos | `o21.test.ts:197` |
| M-14 | E9: faixa 90/91 → 91/92 | `e9.test.ts:106` |
| M-15 | E7: `custoRateado` devolve número com `custoConfigurado` falso | E7-2 |
| M-16 | Criterios: remover a id nova de `VERSOES_DA_BIBLIOTECA`; remover O20 do `afeta` | CR-1 a CR-3 |
| M-17 | Qualquer saída: adicionar campo `equipe` ou `responsaveis` | P-1, P-3, A-9 |
| M-18 | Remover a ordenação alfabética do T10 | `bloqueios.test.ts:221` |

Mutante sobrevivente vira teste novo ou justificativa registrada no parecer.

## 6. Desempenho: C1 e C3 a frio (ADR 0003)

Medido na máquina de referência (registrar CPU, RAM, Node; hoje: estação WSL 8 GB, 8 núcleos), um processo por vez, sem outra suíte rodando (o `pnpm -r` em paralelo já causou o timeout do L1; usar `flock /tmp/metricas-pesado.lock nice -n 19`).

| ID | Métrica | Orçamento | Como | Observação |
|---|---|---|---|---|
| PF-1 | **C1:** gerar base mock + montar contexto | < 500 ms total | `packages/mock/src/desempenho.test.ts` (impressão do valor real, `performance.now()`), 3 rodadas, mediana | B11a-3 **bloqueia**: a base ganhou 4 projetos e ~25% mais transições; medir em `1f4d90e^` e no HEAD, número antes e depois. Referência da ADR: 309 a 422 ms |
| PF-2 | C2: gerador no CI | < 1,5 s | mesmo teste | B11a mediu 175 → 196 ms |
| PF-3 | **C3 a frio:** cada uma das 11 ids, contexto montado, primeira chamada | < 50 ms p95, inclusive a frio (CI: 150 ms, em CPU time) | teste de tempo do `packages/metricas` (cada `MetricaId` a frio e depois 20x); medir por `process.cpuUsage`, 3 processos novos (frio de verdade) | Review: O20 18 a 24 ms, O24 11 ms; faltam números de O19, O21, O25, T10, T12, E7, E9 e O23. T6 sozinho 950 ms na varredura (já era assim, não é da fase 1) |
| PF-4 | C4: painel inteiro (Operacional, Tático, Estratégico e `VISAO_GERAL`) com as ids novas | < 300 ms (CI 900 ms) | idem | C4 do `VISAO_GERAL` estava fora do orçamento em 2026-10-09 (655 ms); registrar o estado atual, sem culpar a fase 1 se for anterior |
| PF-5 | O1 sem regressão | igual ou melhor (review: ~3x mais rápido) | comparar número | |
| PF-6 | Caches sem teto (`memoSelecao`, `memo`, `memoVida`, memo do O24) | n/a | caso de abuso: 200 períodos custom distintos e conferir memória (RSS) | aponta ao `security-engineer` (já registrado no review, disponibilidade, baixo) |
| PF-7 | API A1 a A3 (tempo CPU e payload) | A3 < 50 KB | `server/tests/api-perf.sistemico-intensivo.test.ts` | |

Critério: C1 e C3 dentro do orçamento com o número registrado; se C1 passar de 500 ms, a decisão volta ao tech-lead (B11a: "se passar do orçamento, volta ao tech-lead"). Não se afrouxa limite.

## 7. Pontos do review que o QA precisa ratificar

### R-1: exceção do INV-F7 do O20 (`packages/metricas/src/filtros.intensivo.test.ts:352-353`)

Código: `if (id === 'O20' && (na === 0 || nb === 0)) continue`. Invariante: a base do consolidado de 2 equipes fica entre o maior e a soma das bases individuais.

Leitura do QA (a confirmar na execução):
- O argumento procede: a base do O20 é o pico diário, e o pico respeita max ≤ (a+b) ≤ soma. O estado vazio (base 0 por não haver transição no período, spec "estado vazio") não é contagem e rompe a aditividade.
- **Ratificação condicional.** A exceção, como está, é larga demais: pula qualquer combinação em que uma das duas bases seja 0, inclusive quando a equipe tem WIP no período e a outra não. Posição do QA, a aplicar antes da rodada:
  1. Restringir a exceção ao estado vazio de fato (a lista `dias` do resultado vazia), não a `base === 0`.
  2. Manter a asserção `nab >= max(na, nb)` também nesses casos, porque ela não depende da aditividade.
  3. Adicionar um teste dedicado ao estado vazio (ambos vazios dão vazio; um vazio mais um com dados dá o do que tem dados), com o caso afirmado, não só pulado.
  4. Registrar a exceção no cabeçalho do arquivo (INV-F7) com o motivo e o commit.
- Vermelho antes do verde: provar que a versão restrita falha se o O20 passar a somar picos de equipes (mutar a base para soma de equipes + 1).
- Dono da alteração: o teste é do QA; o `node-backend` não mexe. Se a execução mostrar que (1) quebra algum caso legítimo, a decisão volta ao tech-lead com o par `a`, `b`, `ab` que violou.

### R-2: EI-03 com tolerância derivada (`e2e/tests/b3-sust-ei-vg.spec.ts:104`, commit `a310864`)

Mudança: de tolerância fixa 1,5 pp para o intervalo que o arredondamento de cada mediana exibida permite (meio passo da última casa de cada mediana e do índice).

Leitura do QA:
- O princípio é correto: o índice vem do valor exato, e as medianas aparecem arredondadas; a tolerância fixa 1,5 não era derivável e falhou (2,0 contra 1,5).
- **Ratificação condicional**, com estas verificações antes de aceitar:
  1. **Teste fraco com mediana inteira.** Se as medianas aparecerem sem casa decimal (por exemplo "3 d" e "2 d"), o meio passo é 0,5 dia e o intervalo do índice chega a mais de 17 pp: o teste passa para quase qualquer índice. Exigir que o teste afirme o número de casas (pelo menos 1) ou, melhor, compare com o valor exato da API (`/api/v1/metricas/EI_FL1`) em vez de reconstruir pela tela.
  2. **Mutação:** mudar a fórmula do índice na UI (por exemplo `(cli - tim)/tim`) deve fazer o EI-03 falhar. Provar o vermelho; se não falhar, a tolerância derivada anula o teste.
  3. Os 4 extremos usam `±meio` em cada mediana; confirmar que `cli - meioCli` nunca é ≤ 0 (divisão por zero).
  4. As 5 falhas de timeout "por carga" do mesmo E2E (603 de 609) são instabilidade: não se marca `skip`; reportar, e rodar com 1 worker para a evidência.
- Se (1) ou (2) falhar, o QA reescreve o teste (é do QA) com a comparação contra a API.

### R-3: outras ratificações e decisões do usuário que o QA testa mas não fecha

- O20-destaque = A, O19-pct = B, O25(b) = B, T10-janela = A: decididas em 2026-10-15/16 e já com teste (seções 2 e 3). O QA testa a regra decidida.
- Pendentes com o usuário (não testar como definitivas): R-1 de reidentificação do E8 e da T14 (fase 3), R-2 de `fato_transicao.usuario` (coluna nula até a resposta).
- Divergência E7: spec previa 18 a 20 sistemas; o mock gera 8. Levar ao usuário na validação, não decide o QA.
- Aceites de mudança incompatível: falta ratificação do architect (review); o QA confere só que `aceitas.json` não ficou com resíduo.

## 8. Dados de teste

- Mock padrão: `gerarBaseMock()` escala 1, "hoje" 2026-10-09; escala 0,2 para recortes pequenos; hashes de base: BM+AC `68a67741`, escala 0,2 `824092e4`, extensões `495a0e07` (B11a, valores de 2026-10-16); mudam só no B11b e num rebaseline consciente.
- Fixtures sintéticas por métrica (as dos arquivos `*.test.ts`) para fronteiras 19/20 e 84/85.
- Equipes e quadros do mock (Fluig tem o destaque do O20; equipe pequena para n < 20).
- Nenhum dado real; nenhuma credencial; Acelerato só como base separada para o teste F-2.

## 9. Comandos de execução

Rodar um por vez, sob `flock /tmp/metricas-pesado.lock nice -n 19`, na worktree `/home/rodrigoisensee/MetricasDSPD-011-back`:

```bash
# 0. Pré-condições
git fetch origin && git merge-base --is-ancestor origin/develop HEAD   # B12: branch atualizada com a develop
git rev-parse HEAD                                                     # registrar o commit testado no parecer

# 1. Unidade e contrato (biblioteca, mock, contratos)
pnpm --filter @metricas-dspd/contratos test
pnpm --filter @metricas-dspd/metricas test         # inclui varredura, propriedades e filtros intensivos (lento)
pnpm --filter @metricas-dspd/mock test             # inclui C1/C2 e hashes

# 2. Alvos por métrica (rápido, para o ciclo de escrita)
pnpm --filter @metricas-dspd/metricas exec vitest run src/businessmap/bloqueios.test.ts src/businessmap/o20.test.ts \
  src/businessmap/o21.test.ts src/businessmap/o23.test.ts src/businessmap/o24.test.ts src/businessmap/o25.test.ts \
  src/businessmap/t12.test.ts src/businessmap/e7.test.ts src/businessmap/e9.test.ts

# 3. Invariantes dos filtros (INV-F7 etc.)
pnpm --filter @metricas-dspd/metricas exec vitest run src/filtros.intensivo.test.ts

# 4. API
pnpm --filter @metricas-dspd/server test
pnpm --filter @metricas-dspd/server run openapi:verificar
pnpm --filter @metricas-dspd/e2e run test:api

# 5. Front (regressão por contrato novo; sem teste novo do front nesta fase)
pnpm --filter @metricas-dspd/web test

# 6. E2E completo e a11y (regressão: o mock mudou no B11a)
pnpm run e2e                                         # não use skip; falha por carga: repetir com --workers=1 e reportar

# 7. Desempenho (um processo por vez)
pnpm --filter @metricas-dspd/mock exec vitest run src/desempenho.test.ts
pnpm --filter @metricas-dspd/server exec vitest run tests/api-perf.sistemico-intensivo.test.ts
pnpm --filter @metricas-dspd/e2e run hash-base       # conferir hashes do rebaseline

# 8. Mutação no diff
pnpm stryker run --mutate "$(git diff --name-only origin/develop -- '*.ts' '*.tsx' | grep -v '\.test\.' | paste -sd,)"

# 9. Vermelho antes do verde (para cada teste novo): guardar o código de produção
git stash push -- packages/metricas/src/businessmap/<arquivo>.ts   # ou rodar contra o commit anterior
pnpm --filter @metricas-dspd/metricas exec vitest run src/businessmap/<arquivo>.test.ts   # deve falhar
git stash pop

# 10. Pronto da branch (confirmação final)
flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto
pnpm run docs:check
```

Os testes pg (`pnpm run test:pg`) só rodam se o review pedir; a fase 1 não toca o banco real.

## 10. Entradas de execução e critério de pronto

Para o QA começar: review final (B12) aprovado; B11a-1 a B11a-3 resolvidos; B11b entregue (T11) ou o T11 declarado fora do parecer incremental; branch com `origin/develop`.

Pronto: todos os casos de prioridade alta passando (seções 2 a 4 e 6), nenhum bug crítico ou alto aberto, C1 e C3 dentro do orçamento com o número registrado, mutação com a meta de `praticas.md` e sobreviventes justificados, R-1 e R-2 ratificados ou reescritos. Parecer em `docs/qa/011-back.md` com frontmatter (`tipo: qa`, `contrato: 1`, `pedido`, `branch`, `commit`, `parecer`, `escopo`, `bugs_*`, `data`; `aceite_usuario: sim` se houver médio ou baixo aberto) e tabela critério, teste, resultado, fronteira protegida. Bugs em `docs/qa/bugs/`.

Prioridades: alta = INV-1 a INV-5, CR-1 a CR-4, os casos de fronteira 19/20 e 84/85, A-1 a A-5, A-9, PF-1, PF-3, R-1 e R-2; média = demais de métrica e mock; baixa = O24-9, T10-7.

## 11. Resultado da execução

A preencher no parecer (data, ambiente, aprovados e falhos, links para bugs).
