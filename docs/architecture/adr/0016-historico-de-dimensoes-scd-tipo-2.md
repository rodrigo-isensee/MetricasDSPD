# 0016 - Histórico de dimensões: SCD Tipo 2 só onde muda o significado da métrica
- Status: **proposta** (aguarda revisão de modelagem com o `tech-lead`; **U-1 e U-2 decididas pelo dono em 2026-10-29**, pedido 052, seguindo a recomendação; U-3 superada pela ADR 0020 4b, que mantém `responsaveis` em `dim_card_versao`)
- Data: 2026-10-11
- Relacionadas: `data-model.md` §1–§3.4, §4, §9; ADR 0011 (biblioteca única), 0013 §4 (Metabase), 0014 (Postgres, camadas append-only), 0015 (Kysely); briefing T2.2, T2.4, T2.5, T2.6; `docs/integracao/businessmap-estrutura-real.md`
- **Não muda:** staging append-only com hash, `dim_card_versao`/`dim_chamado_versao`, `ref_versao_criterio` (T2.6), projeções reconstruíveis, regras invioláveis do `CLAUDE.md`.

## Contexto
O usuário pediu para avaliar Slowly Changing Dimension Tipo 2 (SCD2) porque "hoje o BusinessMap funciona de um jeito, mas pode mudar". O que pode mudar: colunas e workflows renomeados, movidos ou removidos; o papel de uma coluna (onde fica o compromisso, o que é entrega); a seção de uma coluna; tipos de card; campos customizados e suas opções; quadros arquivados; times que trocam de workflow. No Acelerato: etapas, o mapeamento etapa → totalizador, prioridades e prazos de SLA.

A pergunta útil não é "SCD2 sim ou não", e sim: **quando a estrutura muda, um número já publicado pode mudar em silêncio, ou um item pode perder a classificação?** Se pode, é falha da T2.6 ("impedir que mudança silenciosa de definição apareça como melhoria de indicador").

### 1. O que realmente muda e o que já está coberto

Legenda: **coberto** = o modelo e o código tratam; **parcial** = o modelo guarda, mas o cálculo não usa; **lacuna** = não existe.

| Dimensão | Muda? | Afeta o significado da métrica? | Hoje | Situação |
|---|---|---|---|---|
| Nome de coluna, workflow, quadro, tipo de card | sim, com frequência (fato 1 da estrutura real) | **não**, se a identificação for por id | `ref_coluna.nome` com vigência; a biblioteca identifica coluna **pelo nome** (`indice.ts` `papelDe(quadro, nomeColuna)`, `mapa.ts` converte id → nome vigente) | **lacuna (risco real)**: o quadro 23 tem 9 workflows com colunas homônimas ("Backlog", "Concluído"); id → nome → papel colapsa colunas diferentes na mesma chave |
| Papel da coluna (backlog, compromisso, trabalho, homologação, entrega, descarte) e fila × execução | sim (time muda o ponto de compromisso, cria Homologação) | **sim**: marcos, tempo de ciclo, WIP, CFD | `ref_coluna` com `vigente_de`/`vigente_ate`; `fato_transicao` grava `tipo_coluna` e `direcao` do instante | **parcial**: a API lê só `vigente_ate IS NULL` (`metricas/repositorio.ts` `lerColunas`) e a biblioteca não tem vigência, então **reclassificar reescreve o passado inteiro**; e `tipo_coluna`/`direcao` ficam numa tabela imutável que o data-model manda "reconstruir" (contradição: `fato_transicao` não é projeção) |
| Coluna removida | sim | sim | a vigência é fechada e a coluna some de `lerColunas` | **lacuna**: transições antigas para ela ficam sem papel e saem do cálculo (`colunasDe` descarta papel desconhecido). Um card entregue nela deixa de contar como entregue |
| Seção da coluna (1–5) | raramente | sim (a regra adotada deriva o papel da seção) | `stg_coluna` guarda a estrutura bruta; `ref_coluna` não tem `secao` | **parcial**. `transitions[]` traz `section` por transição: se for a seção **do instante** (a confirmar no T2.1), a própria fonte já dá o "como foi" |
| Workflow → time (setor = quadro, time = workflow) | sim (time muda de workflow, workflow vira projeto) | sim: filtro por equipe, WIP do time | `ref_quadro` mapeia quadro → equipe; não há workflow no modelo; `ref_coluna` não tem `workflow_id` | **lacuna** (a estrutura real mostrou que time = workflow) |
| Card que muda de quadro/workflow | sim | sim: a qual time pertence | `dim_card_versao` guarda; a biblioteca usa o `quadro_id` **atual** do card para achar o papel de transições antigas | **lacuna**: transições no quadro antigo perdem o papel |
| Tipo de card → granularidade (story, frente, projeto, sprint) | raro | sim (nunca no mesmo histograma) | `ref_dominio` `tipo_card` por código (nome) | **parcial**: deveria ser por `type_id`, com vigência |
| Campo customizado e opções | sim (opção renomeada, campo trocado) | sim nos recortes (sistema, classe de serviço) | `stg_custom_field` versionado; `ref_dominio` com vigência | **parcial**: mapear por id de campo/opção, não pelo texto (a confirmar se a API devolve id de opção) |
| Quadro arquivado ou fora do escopo | sim | sim (população) | `ref_quadro` com vigência e `eh_teste`; staging nunca apaga | **coberto** |
| Atributos do card (classe, sistema, tipo...) | sim | sim | `dim_card_versao` (SCD2) | **coberto**, com dois excessos: `coluna_atual_id` e `responsaveis` geram versão a cada movimento ou troca de pessoa (ver LGPD e tamanho) |
| Etapa do Acelerato → totalizador | sim (fila antiga, etapa nova) | sim (S-métricas por totalizador) | `ref_etapa_totalizador` com vigência; `fato_etapa_chamado.totalizador` é projeção | **coberto no modelo**, ainda sem leitor no código; etapa nova sem mapeamento precisa de alerta |
| Prioridade, alvos P1–P5 | sim | sim | `ref_alvo_prioridade` com vigência; `dim_chamado_versao` guarda a prioridade; o status do SLA vem pronto da fonte (`status_sla_r`) | **parcial**: a API lê só o alvo vigente; o instante de referência do alvo (abertura do chamado?) não está escrito |
| Colunas da tabela do Metabase | sim | sim | contrato zod falha a coleta; SHA do SQL é critério (ADR 0013) | **coberto** |
| Calendário, feriados, turnos | sim | sim | `ref_calendario_turno` com vigência, T2.6 | **coberto** |

Conclusão honesta: **o projeto já tem SCD2** onde mais importa (staging versionado, `*_versao`, `ref_*` com vigência). O que falta não é o padrão, é **usá-lo no cálculo** (resolver o papel no instante do evento, não o vigente hoje), **identificar por id** e **detectar** mudança de estrutura.

## Decisão (proposta)

### Princípios
1. **Identidade por id estável, nunca por nome.** `coluna_id`, `workflow_id`, `quadro_id`, `type_id`, `field_id`/id de opção, número da seção. Nome é rótulo: exibido com o valor atual (SCD1 de exibição), sem gerar versão nem marcação T2.6. O nome histórico continua no staging.
2. **SCD2 só nos mapeamentos que mudam o significado**, todos em `ref_*` com vigência (que já é SCD2): papel e tipo da coluna, seção, workflow → classificação e equipe, tipo de card → granularidade, opção de campo → domínio, etapa → totalizador, alvos, SLE, calendário. Não versionar rótulos.
3. **Classificação calculada, não congelada.** O fato imutável guarda só o que a fonte disse (`coluna_id`, `workflow_id`, `quadro_id`, `section` informada, instante). Papel, fila × execução e direção são resolvidos **no instante do evento** por uma função única da biblioteca (`classificarNoInstante`), usada pelo projetor, pela API e pelo mock. Mudar o mapeamento = nova vigência + `ref_versao_criterio` + rebuild das projeções, sem tocar o histórico.
4. **Detectar, não inferir.** A estrutura de cada quadro é fotografada a cada coleta e comparada por hash. Mudança vira registro e alerta. Coluna, workflow, tipo ou etapa nova **sem mapeamento fica "não mapeada"**: entra na contagem de itens não classificados e fica fora da estatística, nunca recebe papel deduzido pelo nome ou pela seção sem regra registrada.
5. **Correção ≠ mudança de processo.** Mudança de processo vale a partir de uma data ("como foi"). Correção de mapeamento errado vale para todo o período ("como deveria ter sido"). As duas são novas linhas, nunca UPDATE do passado, e as duas geram `ref_versao_criterio` com `motivo` distinto.

### Modelo
- **`ref_coluna`** passa a ter chave (`quadro_id`, `workflow_id`, `coluna_id`) e as colunas `secao smallint NULL`, `coluna_pai_id`, `papel`, `tipo_coluna`, `limite_wip`, `versao_id` (FK lógica para `ref_versao_criterio`). Coluna removida no BusinessMap **não** fecha a vigência do papel: o mapeamento continua valendo para os eventos passados; a remoção é só um fato de estrutura.
- **Novas referências:** `ref_workflow` (`quadro_id`, `workflow_id` → `classificacao CHECK IN ('time','projeto','sprint','fora')`, `equipe`) e `ref_tipo_card` (`type_id` → `granularidade`), ambas com vigência. Substituem o mapeamento quadro → equipe de `ref_quadro` para o portfólio "Times".
- **Linha do tempo por versão (para permitir correção).** Hoje a chave é (chave, `vigente_de`) e só se fecha `vigente_ate` por UPDATE, o que não deixa corrigir um período passado. Proposta para as referências desta ADR: cada `ref:sync` que muda uma chave grava a **linha do tempo inteira** dessa chave sob uma `versao_id` nova (são 1 a 3 períodos por coluna). Leitura: para cada chave, a linha do tempo da maior `versao_id`; dentro dela, o período que contém o instante. Integridade: `EXCLUDE USING gist (chave WITH =, versao_id WITH =, daterange(vigente_de, vigente_ate) WITH &&)` (extensão `btree_gist`, presente na imagem `postgres:17`). Ganhos: tudo vira só INSERT (some o `UPDATE (vigente_ate)`), e dá para reproduzir o que foi publicado em qualquer versão anterior. As demais `ref_*` ficam como estão até precisarem de correção (adiado).
- **`fato_transicao`**: `tipo_coluna` e `direcao` saem da tabela imutável (ou ficam só como valor informado, sem uso no cálculo); entram `workflow_id` e `secao_informada` (o que a fonte devolveu na transição). A classificação vai para a projeção ou é calculada ao montar o contexto.
- **`dim_card_versao`**: `coluna_atual_id` sai do conjunto que gera versão (é derivável de `fato_transicao` e geraria uma versão por movimento). `responsaveis`: ver U-3.
- **Estrutura do quadro** (staging): `stg_estrutura_quadro` (`quadro_id`, `anterior_sk`, `payload jsonb`, `payload_sha256`), mesma deduplicação do §3.1 (versão nova só quando o hash muda). O payload é o JSON canônico de workflows, colunas (id, nome, seção, pai, posição, limite), lanes, tipos de card e definições de campos, **sem cards e sem pessoas**. `stg_coluna` e `stg_custom_field` continuam (granularidade por item); a fotografia do quadro é a unidade de detecção.
- **Controle:** `ctl_mudanca_estrutura` (`coleta_id`, `quadro_id`, `tipo CHECK IN ('coluna_nova','coluna_removida','coluna_renomeada','coluna_movida_secao','coluna_movida_workflow','workflow_novo','workflow_removido','tipo_card_novo','campo_alterado')`, `objeto_id`, `antes`, `depois`, `requer_mapeamento boolean`), só INSERT.
- **Join por instante:** as `ref_` de estrutura são pequenas (estimativa: 8 quadros × até 9 workflows × cerca de 15 colunas ≈ 1 000 colunas, dezenas de mudanças por ano; inferência a confirmar com a primeira leitura completa). São carregadas inteiras em memória e resolvidas na biblioteca, sem `JOIN ... BETWEEN` no SQL do caminho quente. Índice: o existente (chave, `vigente_de`) mais a restrição de exclusão. A vigência continua em `date` no fuso do calendário (−03:00): a mudança no BusinessMap é detectada pela coleta diária, então o dia é a resolução real; a hora exata não é conhecida.

### Cálculo
- **Biblioteca (`@metricas-dspd/metricas`):** `DimColuna` ganha `coluna_id`, `workflow_id`, `secao` e a vigência; `FatoTransicao` passa a referenciar `coluna_id` e `quadro_id`/`workflow_id` **da transição** (não do card). `papelDe(quadro, nome)` vira `classificarNoInstante(quadro, workflow, coluna_id, instante)`. Marcos, WIP, CFD, aging e retornos usam essa função; nenhuma métrica resolve papel por conta própria (T2.5).
- **Janela de 12 semanas** atravessando uma mudança: cada evento é classificado pela regra do seu instante (U-1 = "como foi", decidida em 2026-10-29); a série já recebe a marcação T2.6 pela `ref_versao_criterio`, e o alerta de comparação que cruza a data já existe. Itens com evento "não mapeado" saem da estatística e são contados à parte; a regra de mínimo de 20 vale sobre os mapeados.
- **Granularidade e time de um card que mudou** (U-2, decidida em 2026-10-29): resolvidos no instante do evento medido (entrega para vazão e tempo de ciclo; o dia para WIP e CFD). Um card conta numa única granularidade por métrica, então story, frente e projeto continuam fora do mesmo histograma.
- **Hashes e cache:** a chave do cache do `ServicoMetricas` (lru-cache, ADR 0015) inclui a maior `versao_id` de referência do domínio; `ref:sync` invalida. O hash da base mock (critério de paridade da ADR 0002) muda uma vez, no PR que acrescentar os cenários abaixo.
- **Gráficos:** sem mudança de componente. Renomear não marca. Mudança de papel, de workflow → time, de tipo → granularidade ou de etapa → totalizador marca, porque o `ref:sync` já recusa referência sem `ref_versao_criterio`.

### Mock
O gerador e a base mock ganham uma linha do tempo de estrutura, com uma `VersaoCriterio` em cada data:
1. coluna renomeada (mesmo id, nome novo): nenhuma métrica muda, nenhuma marcação;
2. ponto de compromisso movido numa data: itens anteriores com o compromisso antigo, posteriores com o novo, marcação na data;
3. coluna "Homologação" criada no meio da seção 3;
4. coluna de entrega removida: cards entregues nela antes da remoção continuam entregues;
5. coluna nova sem mapeamento: itens contados como "não mapeados", fora da estatística;
6. card que muda de workflow/time no meio do ciclo;
7. Acelerato: etapa nova sem totalizador (alerta, sem inferência) e alvo de P2 alterado numa data.
Teste de paridade mock × seed no Postgres cobre os sete casos com os mesmos números.

### Coleta e reprocessamento
1. Toda coleta do BusinessMap lê primeiro a estrutura de cada quadro do escopo (`/boards/{id}/workflows`, `/columns`, tipos, `/customFields`), grava `stg_estrutura_quadro` (dedup por hash) e, se o hash mudou, calcula o diff contra a versão anterior e grava `ctl_mudanca_estrutura`.
2. Mudança com `requer_mapeamento` publica `bm.estrutura.mudou` na outbox (alerta pelo canal I-7; até lá, log `warn` e estado em `GET /fontes/businessmap/estado`, com a contagem de colunas e itens não mapeados).
3. A coleta de cards **não para**: staging e eventos brutos são sempre seguros. A projeção classifica o que tem mapeamento e marca o resto como não mapeado.
4. Quando a governança registra o mapeamento (arquivo versionado + `ref:sync` + `ref_versao_criterio`), as projeções do domínio são refeitas (`DELETE` + `INSERT` numa transação, como hoje). Como a classificação não está no histórico imutável, nada precisa ser regravado no staging nem nos eventos.
5. Acelerato: o contrato zod e o SHA do SQL já detectam mudança de colunas. Falta o equivalente para **valores**: etapa, prioridade ou domínio sem linha em `ref_*` vira `ctl_mudanca_estrutura` (em `dspd_ac`, tabela separada) e item não mapeado.

### LGPD
- **Tensão real:** histórico imutável × eliminação. Cada versão SCD2 que carrega nome multiplica cópias do dado pessoal e, pior, monta uma linha do tempo "quem era responsável quando", que é exatamente o insumo de uma visão individual (proibida). Nenhuma métrica usa `responsaveis` (data-model §9, garantia 6).
- **Recomendação:** dado pessoal **fora** das tabelas versionadas analíticas. `dim_card_versao.responsaveis` sai (fica em `dim_card`, valor atual, como no modelo 4.5, e no staging) e a troca de responsável deixa de gerar versão (U-3). As tabelas de estrutura desta ADR não têm dado pessoal.
- **Redação sob retenção** (quando o DPO definir, I-12): redigir, não apagar. A linha permanece, os campos de pessoa viram nulo, e chaves de pessoa são removidas do `payload` do staging, por **uma** função `SECURITY DEFINER` do `dspd_migrador`, a única exceção aceita pelo gatilho de imutabilidade (o gatilho checa uma variável de sessão definida só dentro da função), com registro em `ctl_expurgo`. O `payload_sha256` antigo continua valendo para deduplicação. Implementação adiada até I-12. O desenho já precisa estar decidido agora, para que nenhuma tabela nova crie cópia de nome.

### Custo × ganho
| Item | Custo | Ganho |
|---|---|---|
| Id em vez de nome na biblioteca e no mapa | M (toca `indice.ts`, `estado.ts`, `mapa.ts`, mock, testes de paridade) | corrige um defeito latente com dados reais (colunas homônimas entre workflows) |
| Classificação no instante + vigência na biblioteca | M | reclassificar deixa de reescrever o passado; coluna removida não apaga entregas |
| `ref_workflow`, `ref_tipo_card`, `workflow_id` | P–M | modela time = workflow (estrutura real) |
| Fotografia + diff de estrutura | M | mudança deixa de ser silenciosa; base para o alerta |
| Linha do tempo por versão nas `ref_` de estrutura | P–M | correção retroativa sem UPDATE, reprodutibilidade |
| SCD2 em todas as dimensões, inclusive rótulos | G | nenhum além do acima; ruído de versões e de marcações |

## Alternativas consideradas
1. **SCD1 (sobrescrever o mapeamento):** mais simples e sem join temporal. Contra: viola "nunca sobrescrever histórico" na referência e torna toda reclassificação uma reescrita silenciosa do passado, o oposto da T2.6. **Rejeitada.** Fica só para rótulos de exibição.
2. **SCD2 completo em todas as dimensões** (nomes, rótulos, todo atributo de coluna, quadro e workflow, com chave substituta em cada versão e o fato apontando para a `*_sk`): histórico máximo. Contra: renomear vira versão e marcação sem efeito na métrica; todo lookup passa a ser temporal; o fato precisaria apontar para a chave substituta **vigente na escrita**, o que congela a classificação e impede correção; mais versões com nome de pessoa. Custo G sem ganho além da opção 3. **Rejeitada.**
3. **SCD2 só nas dimensões que mudam o significado** (mapeamentos semânticos em `ref_*` com vigência, chave natural + instante, sem chave substituta no fato): pouco volume, histórico onde importa, reversível. Contra: exige resolver no instante dentro da biblioteca e disciplina de governança para registrar o mapeamento. **Adotada** como núcleo.
4. **Referência com vigência + fato com snapshot do papel no instante do evento** (gravar papel e tipo na linha de `fato_transicao`): leitura trivial, sem join temporal. Contra: `fato_transicao` é imutável (gatilho), então o snapshot congela erros de mapeamento, e corrigir exigiria nova linha de fato ou quebrar a imutabilidade. É o que o modelo faz hoje com `tipo_coluna`/`direcao`, e por isso há a contradição apontada no §1. **Adotada só na forma "snapshot do que a fonte disse"** (`section`, `workflow_id` da transição). A classificação vai para a projeção reconstruível.
5. **Snapshot/versionamento da estrutura do quadro inteira a cada coleta:** barato (poucos KB por quadro, só grava quando o hash muda), dá evidência e detecção. Contra: sozinho não resolve, porque o papel é conceito nosso e não do BusinessMap. Usar a fotografia como dimensão do cálculo acoplaria a métrica à forma da API. **Adotada como mecanismo de detecção e auditoria**, não como fonte do cálculo.

## Consequências
- **Mais fácil:** o time pode reorganizar o quadro sem quebrar séries; renomear é inofensivo; remover coluna não apaga entregas; uma correção de mapeamento é uma linha nova e um rebuild; dá para reproduzir números publicados por versão; mudança de estrutura deixa de ser silenciosa.
- **Mais difícil:** a biblioteca passa a receber referências com vigência e resolver por instante (custo de CPU pequeno: tabela em memória, busca por chave + data); a governança precisa registrar o mapeamento quando o alerta disparar (a operação depende de gente, WS1/WS6); a migração de `ref_coluna` e `fato_transicao` acontece antes de haver dado real, o que é a janela barata para fazê-la.
- **Riscos:**
  - Alerta de estrutura ignorado: itens não mapeados crescem. Mitigação: contagem visível em `/dados` e na faixa de calibração, e limiar de alerta.
  - `section` de `transitions[]` ser a seção atual da coluna, e não a do instante: aí o "como foi" depende só da nossa fotografia, com resolução diária. **Inferência a verificar no T2.1** (comparar uma coluna movida).
  - Diff de estrutura ruidoso (campos voláteis no JSON): o payload canônico lista explicitamente os campos que entram no hash.
  - Tamanho do staging: `stg_card` com `expand=transitions` guarda o array inteiro a cada versão, o que cresce de forma quadrática com o número de movimentos. É independente desta ADR, mas medir na primeira carga real; se crescer, `stg_card` passa a ser coletado sem `expand` e as transições ficam só em `stg_revision`/`fato_transicao`.
- **Reversível:** cada passo é aditivo. Se o usuário escolher "como é hoje" em U-1, a mesma estrutura atende: todo registro passa a usar `motivo = 'correcao'` (vigência desde o início), e o cálculo não muda.

## O que fazer agora e o que adiar
**Agora** (antes da primeira carga real; tudo é barato sem dados):
1. Identidade por id na biblioteca, no mapa e no mock.
2. `classificarNoInstante` e vigência em `DimColuna`; `workflow_id` na transição; classificação fora do fato imutável.
3. `ref_workflow`, `ref_tipo_card`, `secao` e `workflow_id` em `ref_coluna`, com linha do tempo por versão.
4. Fotografia de estrutura + diff + alerta, junto com o primeiro coletor de estrutura do WS2.
5. Tirar `coluna_atual_id` (e, com U-3, `responsaveis`) da geração de versão de `dim_card_versao`.

**Adiar** (com gatilho):
- Linha do tempo por versão nas demais `ref_*` (SLE, alocação, domínios, alvos): quando a primeira correção retroativa for pedida.
- Redação LGPD: quando o DPO responder I-12.
- Detecção de valores novos no Acelerato: junto da S-13 (cliente do Metabase), bloqueada por P6/P12.
- SCD2 de rótulos: não fazer.

## Decisões que cabem ao usuário
| # | Pergunta | Recomendação | Alternativa |
|---|---|---|---|
| U-1 | Quando o papel de uma coluna muda por **mudança de processo** (ex.: o time move o ponto de compromisso), os itens anteriores são medidos com a regra antiga ("como foi") ou com a nova ("como é hoje")? | **como foi**, com marcação T2.6 na data; correção de erro de mapeamento sempre vale para todo o período | **como é hoje**: série homogênea, mas o passado muda de valor a cada reorganização do quadro |
| U-2 | Card que muda de workflow (time) ou de tipo (granularidade): a qual time e granularidade pertence? | a do **instante do evento medido** (entrega para vazão e tempo de ciclo; o dia para WIP e CFD) | sempre a atual do card (simples, mas move a história de um time para outro) |

> **Decidido pelo dono em 2026-10-29 (pedido 052, Q-6; registro literal em `docs/pedidos/052-integracao-businessmap.md`):**
> - **U-1 = A:** "mudança de processo no quadro mede os cartões anteriores "como foi", com marcação T2.6 na data; correção de erro de mapeamento vale para todo o período."
> - **U-2 = A:** "card que muda de workflow (time) ou de tipo (granularidade) conta no time e na granularidade do instante do evento medido (entrega para vazão e tempo de ciclo; o dia para WIP e CFD)."
>
> As duas seguem a recomendação; o desenho desta ADR não muda. Aplicação: fatias F2 e F4 do plano `docs/architecture/features/052-integracao-businessmap.md`. U-3 não foi perguntada: a ADR 0020 4b (vigente) manteve `responsaveis` em `dim_card_versao`, o que a supera.
| U-3 | Tirar `responsaveis` de `dim_card_versao` (o histórico "quem era responsável quando")? Mantém o nome em `dim_card` e no staging, como decidido em §8 | **sim** (minimização; nenhuma métrica usa; reduz o risco de visão individual) | manter (a decisão §8 do usuário não citou a tabela de versões) |

Já em aberto e relacionada: I-12 (retenção com o DPO); classificação de cada workflow (`businessmap-estrutura-real.md`, "A confirmar").

## Cartões sugeridos (não implementados)
Esforço: **P** até meio dia, **M** 1 a 2 dias, **G** 3 dias ou mais.

| Cartão | Dono | Escopo | Esforço | Depende de |
|---|---|---|---|---|
| H-01 | `software-architect` + `tech-lead` | Revisão de modelagem desta ADR; atualizar `data-model.md` (§3.2, §3.4, §9) e o ER | P | — |
| H-02 | `node-backend` | Biblioteca: `DimColuna` e `FatoTransicao` por id, com vigência e `workflow_id`; `classificarNoInstante` usada por `indice.ts`/`estado.ts`; `mapa.ts` sem conversão id → nome para chave; testes de colunas homônimas entre workflows | M | H-01 |
| H-03 | `node-backend` | Migração: `ref_coluna` (`workflow_id`, `secao`, `coluna_pai_id`, `versao_id`, exclusão gist), `ref_workflow`, `ref_tipo_card`; `ref:sync` grava linha do tempo por versão; `fato_transicao` sem classificação congelada, com `workflow_id` e `secao_informada`; `dim_card_versao` sem `coluna_atual_id` | M | H-01 |
| H-04 | `node-backend` | Mock e seed: os sete cenários de mudança de estrutura, `VersaoCriterio` em cada data, hash da base atualizado, paridade mock × Postgres | M | H-02, H-03 |
| H-05 | `node-backend` | Coletor de estrutura BM: `stg_estrutura_quadro` (JSON canônico, dedup por hash), diff → `ctl_mudanca_estrutura`, evento `bm.estrutura.mudou`, contagem de não mapeados em `/fontes/businessmap/estado` | M | S-22, T2.1, H-03 |
| H-06 | `node-backend` | Projeção e cache: rebuild por versão de critério, chave do cache com a `versao_id` de referência, itens não mapeados fora da estatística e contados | P | H-02 |
| H-07 | `ux-designer` → `react-frontend` | Sinal de "itens com coluna/etapa sem mapeamento" e de mudança de estrutura detectada em `/dados` (reaproveitar a faixa de calibração) | P | H-05 |
| H-08 | `qa-engineer` | Plano e testes: como foi × correção, coluna removida mantém entregas, não mapeado nunca inferido, renomear sem marcação, BM × AC separados | M | H-04 |
| H-09 | `node-backend` | Acelerato: valor novo de etapa, prioridade ou domínio sem referência → `ctl_mudanca_estrutura` em `dspd_ac` e item não mapeado | P | S-13 (bloqueada por P6/P12) |
| H-10 | `software-architect` | Desenho da redação LGPD (função única, exceção do gatilho, `ctl_expurgo`) registrado em `docs/security/`; implementação só após I-12 | P | U-3, I-12 |

**Ordem:** H-01 → (H-02 ∥ H-03) → H-04 → H-06 → H-08. H-05 entra com o primeiro coletor do WS2 e libera H-07. H-09 e H-10 aguardam as dependências externas.
