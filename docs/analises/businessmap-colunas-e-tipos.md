# BusinessMap: colunas, seções e tipos para as métricas

Data: 2026-10-11. Status: **análise parcial**. Leia a seção 1 antes de usar qualquer conclusão.

## 1. Limite desta pesquisa (acesso à documentação)

- `knowledgebase.businessmap.io`: o `WebFetch` foi bloqueado (verificação de domínio) e um artigo retornou HTTP 403. **Não consegui ler os artigos oficiais na íntegra.**
- `businessmap.io/api`: leitura direta ok, mas é só uma página de entrada (diz que a API v2 fica em "Minha conta > API"; sem detalhes técnicos).
- A documentação técnica da API v2 (swagger da conta, `developers.businessmap.io`) **não foi acessada**.
- O que sei vem de: (a) trechos de resultados de busca (snippets) de páginas oficiais; (b) um espelho de terceiros (withone.ai) para alguns endpoints; (c) o que o projeto já assume. Marco cada afirmação com a origem. Itens sem fonte estão na seção 7 como "a confirmar".

Fontes consultadas:
- [Blog: Commitment points](https://businessmap.io/blog/what-are-commitment-points-in-kanban) (apenas snippet)
- [KB 360027050871](https://knowledgebase.businessmap.io/hc/en-us/articles/360027050871) (apenas snippet; cycle time por coluna)
- [KB 115003995005](https://knowledgebase.businessmap.io/hc/en-us/articles/115003995005) (snippet; layout padrão do quadro)
- [KB 360011311520](https://knowledgebase.businessmap.io/hc/en-us/articles/360011311520), [115003093585](https://knowledgebase.businessmap.io/hc/en-us/articles/115003093585), [360021663959](https://knowledgebase.businessmap.io/hc/en-us/articles/360021663959), [360013807760](https://knowledgebase.businessmap.io/hc/en-us/articles/360013807760), [8594862942482](https://knowledgebase.businessmap.io/hc/en-us/articles/8594862942482), [360003232991](https://knowledgebase.businessmap.io/hc/en-us/articles/360003232991) (apareceram na busca; não lidos)
- [Espelho withone.ai: limites da API](https://www.withone.ai/knowledge/businessmap/conn_mod_def%3A%3AGKz3pt0UEVg%3A%3ANssoSEzISSu6Aof3y8TSRg) (terceiro, não oficial)
- [Espelho withone.ai: outcomes de card](https://www.withone.ai/knowledge/businessmap/conn_mod_def%3A%3AGKz3w_8ZcKA%3A%3AVnfS60MgSWattXLkx0ZJaw) (terceiro, não oficial)
- [businessmap.io/api](https://businessmap.io/api)

## 2. O que a documentação afirma (conforme trechos lidos)

**Estrutura do quadro**
- O Cards Workflow nasce com três colunas, **Requested, In Progress, Done**, mais **Backlog** e **Archive** dobrados nas bordas esquerda e direita. Fonte: KB 115003995005.
- O editor de workflow (modo de edição do quadro) permite criar colunas, **subcolunas**, **raias (swimlanes)**, mesclar células e ter **mais de um Cards Workflow** (estrutura em várias camadas). Fonte: KB 115003995005.
- Cada coluna pode ser marcada como **activity** ou **queue** (ícone de engrenagem no designer). Fonte: KB 360027050871.

**Cycle time**
- O cycle time é configurado **por quadro**: o sistema soma o tempo do card em cada coluna escolhida. Por padrão só **Requested e In Progress** entram. O módulo de Analytics pode ignorar essa configuração ("Ignore Cycle Time Configuration"). Colunas de fila podem ou não entrar, conforme "Configure Cycle Time". Fonte: KB 360027050871 e FAQ.
- No Analytics é possível **ignorar o tempo bloqueado em colunas de fila**. O relatório "Cycle time per column" mostra o tempo bloqueado por coluna. Fonte: snippets da KB.

**Commitment point**
- O blog descreve commitment point como ponto do fluxo que torna o trabalho comprometido mais previsível; "puxar do backlog é o momento do compromisso". O snippet **não diz** em qual coluna do BusinessMap ele fica. Fonte: blog de commitment points.

**API**
- Espelho de terceiros: `GET /api/v2/apiLimits` devolve limites por hora e por minuto; cabeçalhos `X-RateLimit-PerHour-Limit/Remaining` e `X-RateLimit-PerMinute-Limit/Remaining`. O exemplo mostra 600/h e 30/min, que são **valores ilustrativos**, não garantidos.
- Espelho de terceiros: existem `GET /cards/{id}/cardOutcomes` (resultados vinculados ao card) e `GET /outcomes/{id}/history` (7 dias por padrão se não houver intervalo). `GET /cardTypes/history` lista eventos de tipos de card (paginado). **Isso não é histórico de transição de card.**

## 3. O que NÃO foi confirmado (lacunas da pesquisa)

Nada abaixo foi encontrado em fonte oficial nesta sessão:
- Campo/atributo de "seção" ou "tipo" de coluna exposto pela API (valores como requested, in progress, done) e como o "início do trabalho" e o "fim" são decididos pelo produto.
- Existência e formato de **endpoint de histórico de transições** (colunas com timestamps), de `cards/{id}/...` de log/atividades, e de **histórico de bloqueios**.
- Pai/filho (parent-child), links entre cards, card template, e como a API os devolve.
- Campos customizados na API, cards arquivados e descartados (`discard`) na listagem, filtros por data.
- Paginação (nome dos parâmetros, tamanho máximo de página) e valores reais de limite de taxa da conta.

## 4. Inferência (conhecimento prévio, NÃO verificado aqui)

Marcado como inferência porque não li a fonte. Deve ser conferido contra o swagger da conta.
- Conhecimento geral do produto: colunas têm "seção" fixa por trás da flexibilidade (Requested/Backlog, In Progress, Done, Archive); os estados de card são tipicamente `Draft/Backlog`, `In Progress`, `Done`, `Archived`, e o que decide "em progresso" é a seção da coluna, não o nome. Provável que o horário de entrada no In Progress seja o "início" nativo do cycle time e o de entrada em Done o "fim".
- A API v2 provavelmente tem listagem de cards com `?expand=` e filtros de data, e um endpoint de **histórico/transições por card** (conhecido como `.../cards/{id}/history` ou equivalente) e de **bloqueio** com motivo e datas. Nome exato e campos: confirmar.
- Paginação v2 costuma usar `page` e `per_page` com teto por página; **não confirmado**.
- Parent/child: card pai com filhos vinculados por "linked cards" tipo parent/child; um card pai pode estar no seu próprio quadro/coluna, e o progresso dele pode ser derivado dos filhos. **Não confirmado**; depende de como o time criou os cards de sprint.
- Cards descartados: o produto trata "discard" como ação com motivo ("discard reason"), parecido com a nossa taxa de descarte (briefing 4.2). Confirmar se cards descartados voltam na listagem padrão ou exigem filtro.

## 5. O que o projeto já assume (para comparar)

- `PapelColuna = 'backlog' | 'compromisso' | 'trabalho' | 'homologacao' | 'entrega'` em `packages/metricas/src/businessmap/modelo.ts`; `DimColuna` ainda tem `tipo_coluna: 'fila' | 'execucao'`, `ordem` e `limite_wip`.
- Briefing 4.1: **compromisso** = entrada na coluna de priorizado/comprometido; **início** = primeira entrada em coluna de execução; **entrega** = disponível em produção.
- Briefing 4.2: coluna de fila = nome começa com "Aguardando" ou "Pronto para"; execução = nome da atividade; **bloqueio é marcação no card e não move o card**; subtarefa não conta; descartado sai do tempo de ciclo.
- O gerador do mock já deriva `comprometido_em` pelo papel `compromisso` e `iniciado_em` pela primeira entrada em `execucao` com papel `trabalho`.
- O11 (composição do backlog) separa `definicao` e `prontos`. **A fronteira entre "em definição" e "pronto" não está ligada a nenhum papel de coluna** hoje; no mock, "Pronto para iniciar" aparece como coluna.

## 6. Mapeamento proposto e riscos

| Papel do projeto | Candidato no BusinessMap (inferência) | Risco |
|---|---|---|
| backlog | colunas da seção Requested/Backlog antes do compromisso | O11 precisa dividir isso em "em definição" x "pronto"; pode exigir subcoluna ou papel novo |
| compromisso | coluna "priorizado/comprometido" (nome do time), não é um conceito nativo garantido | O BusinessMap pode considerar essa coluna só como Requested; o commitment point nativo talvez nem esteja configurado no quadro |
| trabalho | seção In Progress, colunas de execução | Colunas "Aguardando..." também estão em In Progress mas são fila: início = primeira execução, não a primeira In Progress |
| homologacao | colunas finais de In Progress | Sem equivalente nativo; é papel do projeto |
| entrega | seção Done | "Done" do produto pode ser anterior a "disponível em produção" (briefing 4.1) |

Riscos gerais:
1. **Seção nativa x papel do projeto**: a seção só distingue 3 a 5 estados; os 5 papéis e fila/execução precisam de **tabela de mapeamento por quadro** (configuração, `dim_coluna`), não de inferência pelo nome do produto.
2. **Cycle time nativo diverge do nosso**: o produto soma por coluna conforme configuração por quadro; nosso cálculo usa horas úteis e passa pela biblioteca compartilhada (T2.5). Usar só timestamps de transição, nunca o cycle time pronto da API.
3. **Sprints como card pai**: se o card pai agrupa entregas, filhos e pai não podem entrar no mesmo histograma (regra "story, frente e projeto nunca no mesmo"). Precisa de regra de filtro explícita e de saber se o pai tem transições próprias.
4. **Bloqueios**: precisamos de histórico com início, fim e motivo; sem ele, aging com bloqueio fica impreciso.
5. **Colunas renomeadas ou movidas**: mudança de estrutura do quadro altera a série; registrar com data (T2.6).
6. **Arquivados e descartados**: a coleta precisa buscá-los explicitamente e nunca sobrescrever histórico.
7. **Taxa de API**: se o limite real for da ordem de 30/min e 600/h (valor ilustrativo), a carga inicial por card com histórico individual (N+1) precisa de fila com respeito ao cabeçalho de limite, retentativa e carga incremental.
8. **Hierarquia de quadros e múltiplos workflows**: um quadro pode ter vários workflows; o modelo `quadro_id + coluna` pode precisar de `workflow_id`.

## 7. Recomendação: o que confirmar com o usuário

1. Pode dar acesso (ou colar) ao swagger da conta (`https://<conta>.kanbanize.com/api/docs`) ou um export dos endpoints de card, histórico e bloqueio? Sem isso, as seções 3 e 4 permanecem sem confirmação.
2. Em cada quadro, qual coluna é o **compromisso** (priorizado/comprometido) e qual é o **início do trabalho**? Elas coincidem com seções/colunas Requested e In Progress do produto, ou o time usa nomes próprios?
3. O que define **"em definição" x "pronto"** para O11: coluna, subcoluna, campo, tag? Precisamos de um sexto papel?
4. O que é "Done" no quadro: já em produção ou só concluído pelo time? Existe coluna de aceite separada?
5. Como os **cards de sprint (pai)** são modelados: quadro, tipo e coluna do pai; filhos ficam em outro quadro? O pai deve ser excluído da vazão?
6. Como bloqueios são usados (campo de bloqueio nativo com motivo ou coluna/tag)? Confirma o briefing 4.2 (bloqueio não move o card).
7. Quantos quadros e workflows por quadro existem, e os limites de taxa efetivos da conta (`GET /api/v2/apiLimits`)?
8. Cards descartados e arquivados: aparecem na listagem com a apikey que usaremos?
