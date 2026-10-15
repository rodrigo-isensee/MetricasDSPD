# Revisão de desenho técnico do pedido 011 (K-078), 2026-10-14

- **Revisor:** tech-lead. **Entrada:** `docs/architecture/features/metricas-tambem-disponiveis.md` (estado `proposta`, inteiro).
- **Conferido contra:** `docs/pedidos/011-metricas-tambem-disponiveis.md` ("Decisões do usuário", inclusive as linhas ainda não commitadas na árvore de trabalho), `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (§3 e §10), `docs/engineering/praticas.md` (§3, §4, §6, §7), regras invioláveis do `CLAUDE.md` e o código de `packages/metricas` e `packages/mock` em `fa84112`.
- **Escopo:** desenho e corte do back. Não houve mudança de código. Nenhuma decisão do usuário foi reaberta. Onde duas decisões do usuário se chocam, o choque vai como pergunta (R-DECISAO).

## Veredito geral: **aprovado com ajustes**

O desenho está correto: biblioteca única, mínimo de 20, BusinessMap e Acelerato separados, nenhuma pessoa e nenhum ranking de times. O que falta é atualizar o plano: ele foi escrito antes de seis decisões do usuário de 2026-10-14 e ainda as trata como abertas ou com outra opção (ajustes A1 a A7). Esses ajustes **não bloqueiam a fase 1 do back**, desde que os cartões B1 a B12 sigam o que está nesta ata, que prevalece sobre o plano onde os dois divergem, até o architect atualizá-lo.

## 1. Veredito item por item

| # | Item | Veredito | Fundamento |
|---|---|---|---|
| 1 | Coerência com as decisões do usuário | **ajustes** | Corretas: D-8 (T12), D-5' (O26), D-6' e R-1 (O24). Desatualizadas no plano: D-1' = A, D-10 = A, R-2' = A, motivos de descarte = A, D-9' (só comentário), D-14' = A com R-4 = sim, Q-T14-1 = B, Q-T14-5 = D e Q-T14-6 = A. Detalhe em A1 a A7. Há também um choque entre duas decisões do usuário (Q6 × R-2'), em §5 P-1. |
| 2 | Biblioteca compartilhada (T2.5) | **aprovado** | Tempo, percentil, taxa e histograma vêm de `core/`. Reaproveita o que já existe em vez de recalcular: ciclo do O3 (O21, O26), lead time do T1 (T13), `naturezaDe` do T3 (E7, CA-23), P85 do E1 (E9) e a varredura do O1 generalizada (O20). As funções de contagem em `packages/metricas/src/coletor/` estão aprovadas em princípio, mas ficam para a fase 2 e dependem da ADR de A10. |
| 3 | Não publicar com menos de 20 | **aprovado, com 1 ajuste** | A regra está correta nas 16. O "com × sem" (O21, T13) exige 20 em **cada** grupo e diz qual grupo faltou (CA-6). O E8 tem um recorte mínimo próprio (5 sistemas, CA-10), que se soma ao de 20 e não o substitui. **Ajuste no T14 (A6):** o denominador do percentual são as demandas **com time informado** (CA-31, CA-33). O plano usa `taxa(k, n)` com `semTime` dentro de `n`. |
| 4 | BusinessMap × Acelerato | **aprovado** | As 17 só leem `BaseBM`. Nenhuma importa `acelerato/`, e a regra de lint de fronteira já cobre isso. O gêmeo de sazonalidade na Sustentação (D-11) ficou fora. CA-7 entra no teste de cada cartão. |
| 5 | Ausência de pessoa e de comparação entre times | **aprovado, com ajustes** | (a) A regra de lint `no-restricted-properties` (proíbe ler `responsaveis` e `usuario` em `businessmap/*.ts`) entra **já no B1**, antes da primeira métrica nova. É a decisão da P-T6 (§4). (b) O property test de pessoa cobre as 16 ids novas (o plano diz 15). (c) T14: o filtro com **mais de uma** equipe também leva a `semEquipe` (CA-28; o plano cobre só "Todas"). A ordem dos projetos é pelo total de demandas, do maior para o menor (CA-30; o plano diz `ordenarNeutro` por código). (d) E6 e E9 listam projetos com código e título. Projeto não é pessoa: aprovado. |
| 6 | Versionamento de critério (T2.6) | **ajustes** | (a) O plano diz que o limite do O23 (5 dias úteis) entra "como parâmetro versionado em `criterios`". Hoje `VersaoCriterio` é `{id, data, descricao, afeta}`, sem valor de parâmetro. Na fase 1 vale o padrão que já existe: constante num lugar só (como `DURACAO_CALIBRACAO_DIAS`), e mudança de valor gera nova `VersaoCriterio`. Parâmetro com valor e vigência é mecanismo novo, que fica com o architect (A8). (b) Todo DTO de série devolve `marcacoes` (`praticas.md` §3). O plano só prevê isso no O20; faltam O24 `meses`, O25 `meses` e T11 `anos` (A9). |
| 7 | Contratos e OpenAPI | **aprovado, com ajustes** | O envelope é o atual (`base`, `janela`, `criterio`, `estatistica`/`taxa`). As rotas nascem da iteração de `METRICA_IDS`. O acréscimo em `ResultadoO2` é compatível (ADR 0007). Ajustes: **T10** sem `prazoDiasUteis` e sem `status` (D-10 = A, CA-36); **E7** com `custoPorDemanda` além de `custoRateado`, os dois anuláveis (CA-35); **O25** com o bloco de aviso de preenchimento e a marca de instante aproximado (R-2', CA-26), e `porMotivo` anulável (CA-44); todos os schemas `strict`. A OpenAPI é regenerada por `pnpm run openapi:gerar` em cada cartão que acrescenta id, e o CI confere com o job `openapi`. A documentação vai em `docs/api/` e `docs/tecnica/` no mesmo cartão (`praticas.md` §7.7). |
| 8 | Orçamento da ADR 0003 | **aprovado, com 1 ajuste** | Os riscos de §6 estão bem mapeados: O20 em C3 a frio é o maior, O24 vem em seguida, e K1 só pesa na coleta real. **Ajuste (A11):** a ADR 0003 define C4 como "todas as métricas do painel", e a seção "Mais métricas" é lazy. Falta dizer se C4 vale com a seção fechada, com ela aberta ou nos dois casos, e com que limite. Sem isso, o QA mede algo que a ADR não define. Como a ADR 0003 está em alteração no PR #74 (orçamento móvel), a emenda entra depois desse merge. |
| 9 | ADRs necessárias | **ajustes** | A fase 1 **não precisa de ADR nova** para começar. Antes do fim da fase 1: a emenda de C4 na ADR 0003 (A11). Antes da fase 2: uma ADR de proteção de pessoa no coletor (A10), cobrindo a subpasta `coletor/` fora do `index.ts` público, a regra de lint de import só a partir de `server/src/modulos/coleta*`, a allow-list de revisões e comentários e o agregado por faixa (P-T5). Ela precisa de "por que o existente não basta" e de critério de reversão. Se o architect não reaproveitar o padrão do item 6, entra também uma ADR de parâmetro versionado (A8). Fica sem ADR: o gerador de extensão separado (precedente das complementares). |

## 2. Decisões técnicas do tech-lead (perguntas P-T do plano)

- **P-T3 = (a):** a série própria `entradasSazonais` fica na extensão, e a base não muda (`924448d4` e `b2bfd4c0` intactos). A divergência entre T11 e O7 no mock fica documentada no teste do T11 e na nota de QA. Para o O19, se faltar amostra, o cartão mostra o que existe e a base não muda.
- **P-T4 = gerador separado:** `gerarExtensaoTambemMock(base)`, com streams `derivar(semente, 'tambem:<campo>')`, teste de hash próprio e de determinismo. O hash `fbddcf28` das extensões atuais não muda.
- **P-T5 = faixa (1, 2, 3+):** confirmada para a fase 2.
- **P-T6 = alinhar o documento ao código:** `responsaveis` e `usuario` continuam em `modelo.ts`, porque o property test e o lint protegem a saída. O `data-model.md` §9, garantia 6, passa a dizer isso (A12). A regra de lint de leitura entra no B1.
- **§8 a, passo 5 (estado de partida do O26):** a escolha fica para a fase 3, com o K1 medido.

## 3. Back da fase 1: cartões

**Escopo:** dado que já está em `BaseBM` e mock (inclusive a extensão nova só de mock do T11). Sem coleta nova, sem migração e sem tocar em `gerarBaseMock`. As métricas são O19, O20, O21, O23, O24, O25, T10 (sem prazo, D-10 = A), T11, T12, E7 (sem R$) e E9.

**Critérios de pronto comuns a todo cartão** (somam-se aos de cada um):
- `pnpm run pronto` verde, inclusive a cobertura de 100%, e os limites de CI de C3 (métrica < 150 ms a frio e 20×) no `desempenho.test.ts`;
- os testes de borda de `praticas.md` §4: 19/20, janela vazia, dia 84 dentro e 85 fora, marcação de critério cruzando o período e, quando houver tempo, fim de semana, feriado e intervalo nulo;
- os hashes `924448d4`, `b2bfd4c0` e `fbddcf28` e os snapshots das métricas existentes sem mudança;
- o id novo em toda a cascata (`METRICA_IDS`, `SCHEMAS_RESULTADO`, `ContratoMetricas`, `APLICABILIDADE_FLUXO`, `REGRAS_METRICA`, `CALCULOS`, `CATALOGO_CARTOES` com `grupo: 'complementar'` e `status: 'mock'`, `calibracao.ts` e `varredura.test.ts`), com o teste de rota `GET /api/v1/metricas/:id` e a OpenAPI regenerada;
- o property test de pessoa cobrindo o id novo, e a rota sem campo de pessoa nem de outra equipe;
- recomendações ainda abertas como `pendencias` com `status: 'pendente-usuario'` em `REGRAS_METRICA`; as decididas não entram como pendência;
- `docs/tecnica/` e `docs/api/` atualizados no mesmo commit do cartão;
- parecer de code review aprovado antes de seguir para o próximo cartão.

| Cartão | Conteúdo | Critérios de pronto próprios |
|---|---|---|
| **B1** Contratos da fase 1 e trava de pessoa | Schemas zod `strict` dos 10 resultados novos e de `ResultadoO2.parados`. Chaves `'motivo-bloqueio'`, `'fornecedor'` e `'mes-do-ano'` em `ChaveSegmentacao` (`'faixa-passagens'` fica para a fase 2). Regra de lint `no-restricted-properties` para `responsaveis` e `usuario` em `businessmap/*.ts`. Nenhum id entra em `METRICA_IDS` neste cartão: cada id entra com o seu cálculo, para não existir rota que devolva dado inventado. | Teste de contrato: o schema rejeita campo extra e campo com nome de pessoa. Os contratos incorporam os ajustes do item 7 (T10 sem prazo, E7 com `custoPorDemanda` anulável, O25 com aviso e `porMotivo` anulável) e `marcacoes` em toda série (item 6 b). A regra de lint falha num arquivo de teste que lê `responsaveis`. Tipos exportados por `@metricas-dspd/contratos`, sem duplicação no web. |
| **B2** O23 no O2 | Campo `parados` calculado em `o2.ts`, a partir do `semMoverHaDiasUteis` que já existe. Limite de 5 dias úteis numa constante única, com `VersaoCriterio` v1 registrada (item 6 a). | CA-4: "k de n" sempre, e a taxa só com n ≥ 20. Quebra por etapa igual à do O2. Resultado atual do O2 idêntico nos campos antigos (snapshot). |
| **B3** O19 e T10 (bloqueios) | `o19.ts`: os 7 motivos em ordem neutra do domínio, com soma em dias úteis, contagem, P50/P85 com n ≥ 20 por motivo e os abertos à parte. `t10.ts`: todo bloqueio encerrado com fornecedor informado, de qualquer motivo, em ordem alfabética, com P50/P85 com n ≥ 20 e sem prazo nem status. | CA-24 (bloqueio sem fornecedor fica fora), CA-36 e CA-11 (T10 alfabético). Medir no mock se algum motivo passa de 20 em 12 semanas e algum fica abaixo, e registrar o número no teste. A base não muda. |
| **B4** T12 | `t12.ts` com a D-8 = A: bloqueio "Falta de informação no chamado" com `inicio < iniciado_em` (ou card não iniciado), **ou** retorno compromisso → backlog. Áreas por volume. | CA-39 e CA-11. Teste com card que tem os dois critérios e conta uma vez só. Taxa por área só com n ≥ 20. Parcela medida no mock e registrada. |
| **B5** E7 sem R$ e E9 | `e7.ts`: participação por contagem de entregas (D-2), as 4 naturezas por `naturezaDe` do T3 (R-3, CA-23), sistemas com menos de 20 no fim com "k de n", `custoConfigurado: false`. `e9.ts`: projetos abertos e não iniciados, fora os descartados e arquivados, com a idade em dias úteis por faixa e o P85 **importado** do E1, só com ≥ 20. | CA-13: nenhum valor em R$ no mock. Teste que falha se o E7 tiver mapeamento próprio de natureza. Teste de E9 com o E1 abaixo de 20, sem referência. Número de projetos abertos no mock registrado; se forem menos de 6, nenhum projeto é criado. |
| **B6** O25 | Funções novas `instanteDoDescarte(card)` e `motivoDoDescarte(card)` em `descartado.ts` (o único arquivo que pode ler os campos). O índice tira os excluídos dos cálculos (`indice.ts:147`), mas o O25 **inclui** o card excluído como descarte, com instante `excluido_em`. "Criado por engano" é mapeado para `null` no adaptador. `porMotivo = null`. O tempo consumido segue a D-13: descartado antes do início conta zero e aparece à parte. | CA-19, CA-44 e a parte de CA-26 que o mock exercita. Não usa `discard_comment`. `descartado()` continua com a definição atual (Q6) enquanto a pergunta P-1 estiver aberta. Teste de borda com card excluído e card descartado antes do início. |
| **B7** O21 | `o21.ts`: entregas com retorno até a conclusão, matriz por coluna ou por papel, reaberturas e o par com × sem pelo ciclo do O3 (sem recálculo). | CA-6: com um grupo com menos de 20, o contrato diz qual grupo faltou. Parcela de retornos no mock registrada. Teste de reaproveitamento: o ciclo vem da mesma função do O3. |
| **B8** Varredura por coluna (refatoração) | Generalizar a varredura +1/−1 do O1 para "por coluna", memoizada por quadro no contexto. Commit `refactor`, sem métrica nova. | O1 com resultado idêntico (snapshot e hash) e C3 do O1 a frio sem regressão, com o número antes e depois no PR. A chave de memoização inclui o quadro e os filtros normalizados. |
| **B9** O20 | `o20.ts` sobre a varredura do B8: faixa por coluna (com equipe) ou por papel ("Todas"), destaque pelo maior crescimento nas filas e `mudancasCriterio` de `core/criterios`. | C3 do O20 a frio < 150 ms no CI, com o valor real impresso e registrado. Payload do período máximo medido no teste de rota, abaixo de 50 KB gzip (A3). Estado "Nenhuma etapa acumulou" testado. |
| **B10** O24 | `o24.ts`: grupo `equipe-tipo-padrao` (D-6' = A), varredura com conjunto ordenado em O(n log n), custo da ultrapassagem pela R-1 = A. | CA-17 e CA-37. Teste que Urgente, Prazo fixo e Intangível ficam fora. Ultrapassado não iniciado fora da estatística. C3 a frio < 150 ms no CI. Parcela fora de ordem no mock registrada. |
| **B11** Extensão `ExtensaoTambemBM` e T11 | `businessmap/extensao.ts` com a interface (por ora, só `entradasSazonais`; os outros campos entram com as métricas da fase 2). `gerarExtensaoTambemMock` lazy, com hash próprio (P-T3 e P-T4). `ContextosMetricas.tambem?`. `t11.ts` com 24 meses fechados mais o corrente, ancorado em `hoje`, `historicoCurto` e agregação por `core/series`. | CA-12: o T11 não muda com o período (teste). Sem extensão, devolve vazio ou insuficiente, nunca erro 500. C1 e C2 sem mudança: o gerador novo não roda na montagem do contexto, e tem teste de tempo próprio. A divergência entre T11 e O7 no mock fica documentada no teste. |
| **B12** Fechamento da fase 1 | Medição de C4 por painel nas condições da emenda A11, teste de rota de todas as ids da fase 1, `docs:check`, `openapi:verificar` e conferência do property test de pessoa com as 10 ids. | C4 dentro do limite de CI (900 ms) nas duas condições, com o valor registrado. Nenhum dos novos em "Pede atenção" (CA-14). Pronto para o QA: o parecer de review cobre a branch inteira. |

**Ordem:** B1 primeiro, porque desbloqueia o front quando chegar a vez dele. Depois B2 a B7, B10 e B11, em qualquer ordem. B8 antes de B9, e B12 por último. Com um `node-backend` e um cartão em andamento por agente, a sequência sugerida é B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11, B12. O `qa-engineer` prepara o plano em paralelo (plano §5).

## 4. Fila: fases 2 e 3

**Fase 2: métricas de extração nova, primeiro em mock.** Começa depois do B12, da ADR de A10 e dos ajustes A4 a A6 no plano.
- **E6:** extensão `datasProjeto` (D-7, CA-20), com variante `lenta` abaixo de 20.
- **T13:** extensão `vinculos`, só `predecessor` com outro quadro e o vínculo vigente em algum momento antes da entrega (D-14' = A, R-4 = sim, CA-40, CA-21), seletor story/frente (CA-8) e CA-6.
- **O22:** extensão `primeiroToque`, só com o primeiro comentário humano (D-9', CA-43).
- **O26:** extensão `passagens`, função pura `houveTroca` com property test (CA-38). As bordas Q-a e Q-b seguem com o usuário e ficam como `pendente-usuario`. Entra aqui a chave `'faixa-passagens'`.
- **E8:** extensão `conhecimentoSistema` gerada direto como agregado, com recorte de 5 sistemas e lista "1 pessoa" (D-3, D-4 = B, CA-9, CA-10, CA-18, CA-25).
- **T14:** extensão `equipeResponsavel` (Q-T14-1 = B), com CA-27 a CA-34 e CA-41 e CA-42 (Q-T14-5 = D, Q-T14-6 = A).
- **E7 com R$:** custo total do DSPD como configuração versionada (D-1' = A), rateio e custo por demanda (CA-35), exercitado por fixture. O mock segue sem custo (CA-13).

**Fase 3: coleta real e integração.** Depende do coletor real do BusinessMap (WS2) e da configuração da WS1.
- Spike P-T1 no card real (plano §8 a e b): troca de responsável e vínculo geram revisão? Qual é o instante? Como fica o quadro do card relacionado sem permissão? Se o resultado for negativo, O26 e T13 voltam ao usuário.
- **Revisão de modelagem (architect + tech-lead) antes de qualquer migração:**
  - `dim_card`: `primeiro_toque_em`, `passagens`, `data_acordada_original`, `replanejamentos`, `equipe_responsavel` (também em `dim_card_versao`), e o instante e o motivo nativos de descarte (`discarded_at`, `reason_id`);
  - `stg_comentario_instante`, `stg_vinculo_relacao`, `fato_vinculo`, `agg_conhecimento_sistema`, `ref_conta_automacao`, o catálogo de `/discardReasons` e o custo total do DSPD;
  - `gerarGrants`, `lgpd.ts` e os índices de §6.
- Allow-list do coletor com teste que falha se `owner_user_id`, `co_owner_ids` ou `user_id` chegarem a staging. Medição de K1 por entidade, com a carga histórica de 24 meses numa execução separada.
- `porMotivo` do O25 a partir do catálogo nativo (motivos de descarte = A). O tratamento definitivo do descarte depende da resposta à P-1.
- Prazo contratado do T10 (`ref_prazo_fornecedor`, R-7 = P85) só quando o usuário informar os contratos (D-10 = A). Fica fora da fila até lá.

## 5. Para o usuário (via Jarvis) e para o architect

**Pergunta ao usuário (R-DECISAO), sem inferência:**
- **P-1, Q6 × R-2':** a Q6 (2026-10-09, definitiva em 2026-10-10) define, para **todas** as métricas, que descartado é o card com `motivo_descarte` preenchido. A R-2' = A (2026-10-14) define, no O25, que descartado é o card com estado nativo `discarded` ou excluído, e que motivo preenchido sem descarte é só aviso. A pergunta: a R-2' vale só para o O25 ou substitui a Q6 em todas as métricas (WIP, aberto, vazão)? No mock, as duas dão o mesmo resultado, porque o gerador sempre arquiva junto com o motivo. Por isso a pergunta não bloqueia a fase 1, mas precisa de resposta antes da coleta real.

**Ajustes que só o architect pode fazer** (no plano, salvo indicação):
- **A1, E7:** D-1' = A decidida. O plano ainda diz "D-1' em aberto" e usa `ref_custo_area` "só com D-1 = B". Passa a ser o custo total do DSPD, com valor e periodicidade versionados, rateio pela participação e custo por demanda (CA-35).
- **A2, T10:** D-10 = A. Tirar `prazoDiasUteis`, `status` e `prazoFornecedor` do contrato e do mock, tirar o "prazo do T10" da fase 2 e deixar `ref_prazo_fornecedor` condicionado aos contratos informados (R-7 = P85).
- **A3, O25:** R-2' = A e motivos = A. O instante passa a ser `discarded_at` (no excluído, o instante da exclusão ou a última revisão marcada como aproximada). O aviso de preenchimento fica fora da taxa. `porMotivo` vem do catálogo `/discardReasons` (`reason_id`), não de `ref_dominio`. Registrar a P-1.
- **A4, O22:** D-9' = só comentário humano. Tirar a mudança de coluna e a atribuição da definição e a dependência de `stg_revision` para o O22.
- **A5, T13:** incorporar D-14' = A e R-4 = sim. Tirar as duas das pendências (§4 e §7).
- **A6, T14:** Q-T14-1 = B (fase 3, extensão `equipeResponsavel`), Q-T14-5 = D, Q-T14-6 = A (sem a frase "nenhum time é identificado"). Ordem pelo total de demandas (CA-30). Denominador só com time informado (CA-31, CA-33). Mais de uma equipe no filtro leva a `semEquipe` (CA-28).
- **A7, contagens:** são 17 métricas e 16 ids novas em `METRICA_IDS`. O plano diz "16 métricas" e "15 ids". Corrigir também §3, que fala em "15 métricas novas".
- **A8, parâmetro versionado:** alinhar o texto ao mecanismo que existe (constante única mais `VersaoCriterio`) ou propor ADR de parâmetro com valor e vigência.
- **A9, `marcacoes`:** nos contratos de série do O24, do O25 e do T11.
- **A10, ADR de proteção de pessoa no coletor:** antes da fase 2 (item 9).
- **A11, emenda de C4 na ADR 0003:** seção "Mais métricas" fechada e aberta, depois do merge do PR #74.
- **A12, `data-model.md` §9, garantia 6:** alinhar ao código (P-T6).
- **A13, estado do plano:** de `proposta` para `vigente`, depois de A1 a A9. A §5 passa a refletir a divisão desta ata (T11 na fase 1, T14 na fase 2).

## 6. Branch e worktree do back

- **Branch:** `feature/011-metricas-tambem-back`, criada a partir de `origin/develop` (hoje em `cdb5f8a`).
- **Worktree:** `/home/rodrigoisensee/MetricasDSPD-011-back`.
- **Comando**, rodado pelo tech-lead quando o B1 for liberado: `git fetch origin && git worktree add -b feature/011-metricas-tambem-back /home/rodrigoisensee/MetricasDSPD-011-back origin/develop`.
- **Pré-condição:** as decisões mais recentes do pedido 011 (D-10, R-2', motivos de descarte e outras), as mudanças da especificação e esta ata estão só na árvore de trabalho da `docs/orcamento-movel`, sem commit, e **não estão na `develop`**. Ou o PR de docs que as leva é mesclado antes de criar a worktree, ou a delegação do B1 aponta para os arquivos do diretório principal.
- **Envio:** uma branch para os 12 cartões, com um commit por cartão e review por cartão. Um único PR para a `develop` (squash) depois do B12 e do QA. Se a branch ficar longa demais para um review final, ela pode ser fatiada em dois PRs (B1 a B7 e B8 a B12).
