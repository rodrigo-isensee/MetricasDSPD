# Configuração da integração real: Acelerato via Metabase

> **Substituído em 2026-10-30** (pedido 056, [ADR 0023](../architecture/adr/0023-acelerato-pela-tabela-mysql.md)): o Acelerato passa a ser lido da tabela MySQL mantida pelo time de ciência de dados, só leitura. Este roteiro nunca foi executado e fica só como registro; não use para configurar a coleta. O roteiro novo será `docs/integracao/acelerato-mysql-configuracao.md`, escrito na fatia de código.

- Data: 2026-10-11 · Autor: `tech-lead` · Público: o usuário e o Jarvis (roteiro de configuração; o time não executa WS1/WS4/WS6).
- Contexto: o Acelerato é lido de **uma tabela no Metabase, só leitura, 1 vez por dia** (ADR 0013 §4, `docs/architecture/data-model.md` §4). A API **não** pode ler colunas de pessoa. BusinessMap e Acelerato nunca se misturam.
- Como ler as marcas: **[DOC]** = afirmado na documentação oficial do Metabase (latest), consultada em 2026-10-11 (páginas `people-and-groups/api-keys`, `permissions/data`, `permissions/row-and-column-security`, `questions/exporting-results`, `configuring-metabase/environment-variables` e a especificação OpenAPI `docs/latest/api.json`). **[INF]** = inferência nossa, a confirmar na instância real. **[PROJ]** = decisão já registrada no projeto. A referência de API do Metabase é versionada junto da instância e o Metabase avisa que **não versiona a API**: o endpoint pode mudar; por isso o teste de conexão (§9) roda a cada coleta.
- A versão e a edição (OSS, Pro, Enterprise) da instância do usuário são desconhecidas. Vários recursos de segurança abaixo dependem da edição (marcado).

## 1. Autenticação: API key versus sessão

| Opção | Como | Veredito |
|---|---|---|
| **API key** | Cabeçalho `X-API-Key: <chave>` [DOC: esquema `ApiKeyAuth`, `in: header`, `name: X-API-Key`]. Criada em Admin > Settings > Authentication > API Keys > Create API Key; **a chave herda as permissões do grupo escolhido**; o valor é mostrado uma só vez [DOC]. | **Recomendada.** Não depende de usuário humano nem de SSO; permissão controlada por grupo [DOC]. Cobre o que o ADR 0013 já decidiu [PROJ]. |
| Sessão | `POST /api/session` (descrição da API: "Login") devolve um id de sessão, enviado em `X-Metabase-Session` [DOC para o endpoint; o nome do cabeçalho é de uso comum, confirmar na instância: INF]. Exige usuário e senha. | **Inviável com SSO** [INF]: se o login por senha estiver desligado (`MB_ENABLE_PASSWORD_LOGIN`, é recurso Pro/Enterprise [DOC]), não há como obter sessão sem navegador. Além disso, expira e guarda senha de pessoa no `.env`. Não usar. |
| SSO (Google, LDAP, SAML, JWT) | Fluxo interativo de navegador [DOC: lista de métodos de autenticação]. | Não serve para o coletor. A API key independe do método de login dos humanos [INF]. |

Decisão sugerida: **API key**, em grupo próprio, com a menor permissão possível (§2). Quem cria a chave precisa ser administrador do Metabase; a pergunta "qual é o SSO" (P3) é independente deste roteiro.

## 2. Permissões mínimas

Objetivo: a chave lê **somente** a pergunta salva do Acelerato e nada mais.

1. **Grupo dedicado** (ex.: `dspd-coletor-leitura`), com a API key associada a ele [DOC]. Nenhum membro humano. Não usar o grupo `Administrators` nem `All Users` com acesso amplo [INF: boa prática; lembrar que `All Users` soma permissões, então a chave só fica restrita se `All Users` também estiver restrito ou "sem acesso" ao banco (INF sobre o modelo de soma de grupos; a doc afirma que a permissão mais permissiva prevalece quando há mais de um grupo [DOC, texto sobre Blocked])].
2. **Dados (View data / Create queries)** [DOC: as duas permissões existem por banco/schema/tabela]:
   - Opção A (mais simples, qualquer edição) [INF]: o grupo **não recebe acesso direto às tabelas** e recebe **só acesso de visualização (Curate = não) à coleção** onde está a pergunta salva. Em edições sem "Blocked", o acesso a uma pergunta salva depende da permissão de coleção; a execução de pergunta SQL salva usa a conexão do banco [INF; confirmar na instância].
   - Opção B (Pro/Enterprise) [DOC]: View data = **Blocked** na tabela/banco de colunas sensíveis, ou **Granular** com **Can view** só na tabela necessária. Atenção: **Blocked num banco impede ver perguntas SQL nativas de qualquer tabela daquele banco**, porque o Metabase não analisa o SQL [DOC]. Conclusão: se a pergunta for SQL nativa, não bloquear o banco; usar o caminho de §4.
3. **Create queries**: "No" (sem editor de consultas) [DOC: a permissão controla query builder e SQL editor]. Se a chave for liberada para o editor nativo, ela passa a poder consultar colunas de pessoa [DOC: grupos com permissão de consulta nativa **contornam** a segurança de linha e coluna]. Esta é a razão central para não dar essa permissão.
4. **Banco**: o usuário do banco que o Metabase usa para o Acelerato deveria ser somente leitura (SELECT) [INF; confirmar com quem administra o Metabase].
5. Rotina: ao registrar a chave, anotar nome, grupo, data e responsável; renovar por solicitação (a doc não menciona expiração automática; **não afirmar** que ela expira [INF]).

## 3. Como obter os dados

### 3.1 Endpoints (todos com `X-API-Key`) [DOC: presentes em `api.json`]
| Endpoint | Uso | Limite de linhas |
|---|---|---|
| `POST /api/card/{card-id}/query` | executa a pergunta salva, resposta JSON "usual" | **2.000 linhas** para consulta sem agregação (padrão `MB_UNAGGREGATED_QUERY_ROW_LIMIT = 2000`) e 10.000 para agregada (`MB_AGGREGATED_QUERY_ROW_LIMIT = 10000`) [DOC]. Truncamento silencioso: **não usar para a carga** [INF sobre ser silencioso; confira `row_count` versus total]. |
| **`POST /api/card/{card-id}/query/json`** | executa a pergunta e devolve **arquivo JSON**; formatos aceitos `csv`, `api`, `xlsx`, `json` [DOC] | Limite de **1.048.575 linhas** por padrão; para CSV é ajustável por `MB_DOWNLOAD_ROW_LIMIT` [DOC]. É o caminho escolhido pelo projeto [PROJ]. O corpo aceita `parameters`, `format_rows`, `pivot_results`, `csv_include_bom` [DOC]. Use `format_rows: false` para valores crus (datas ISO, números sem formatação) [INF]. |
| `POST /api/dataset` | consulta ad hoc (MBQL ou nativa), sem cache [DOC] | mesmos 2.000/10.000; exige permissão de consulta no banco, portanto **não usar** com a chave do coletor |
| `POST /api/dataset/json` | exportação ad hoc | idem; exige permissão de consulta; não usar |
| `GET /api/user/current` | quem sou eu (teste de conexão) [DOC] | — |
| `GET /api/database`, `GET /api/database/{id}/metadata` | descobrir ids e colunas | exige permissão sobre o banco; usar só com o administrador, na configuração |
| `GET /api/health` | disponibilidade [INF: existe em versões recentes; não está no recorte que verificamos; confirmar] | — |

Regra do projeto: **a carga sai de uma pergunta salva (card) exportada em JSON**; nenhuma consulta nativa ad hoc é montada pelo coletor [PROJ]. Assim a lista de colunas é fixada por quem cria a pergunta (§4) e o SQL fica versionado em `docs/architecture/fontes/acelerato-metabase.sql`; mudar o SQL é mudança de critério (T2.6) [PROJ].

### 3.2 Paginação e volume
- A exportação **não tem paginação** pelo protocolo; devolve até o limite de 1.048.575 linhas [DOC]. Sobre o volume do Acelerato: **desconhecido; perguntar** (§8). Se passar de ~100 mil linhas, **particionar por data** (§5) em vez de elevar o limite do servidor [INF].
- Se for preciso fatiar: criar o parâmetro de pergunta (ex.: `{{atualizado_desde}}` com variável SQL) e enviá-lo em `parameters` [DOC: a rota aceita `parameters`; formato exato do item de parâmetro deve ser confirmado no OpenAPI da instância].
- Nunca usar `LIMIT`/`OFFSET` num endpoint interativo para "paginar a carga": o corte de 2.000 linhas é silencioso [INF]. Validar `linhas_recebidas` com `SELECT COUNT(*)` de uma pergunta de contagem equivalente (teste de completude na coleta) [INF].
- Pesos: JSON de milhares de linhas pode ocupar centenas de MB; ler em *stream* ou aumentar o limite de memória do worker [INF].

### 3.3 Limites e timeouts
- Tempo máximo de consulta no banco: `MB_DB_QUERY_TIMEOUT_MINUTES`, padrão **20 minutos** [DOC]. Timeout HTTP intermediário (proxy, balanceador do Metabase) pode ser menor [INF; perguntar a quem administra].
- Cliente do coletor: timeout próprio (sugestão 5 min; configurável por env, §7), até 3 tentativas com *backoff*, **sem repetição em 401/403** (erro `autenticacao`; vide `tipoErroColetaSchema`) [PROJ/INF]. 429 e 5xx são repetíveis; resposta > limite de tamanho aborta com `dados-invalidos`.
- Uma execução por dia às 06:00 America/Sao_Paulo [PROJ]. Evitar horário de pico do Metabase [INF].
- A `Cache-Control`/cache de pergunta: `/api/dataset` não usa cache [DOC]; o de `card/query` pode usar o cache da pergunta, se habilitado, e devolver dado antigo; o parâmetro `ignore_cache: true` existe no corpo de `/api/card/{id}/query` [DOC]. Para o `.../query/json`, não está no recorte; conferir se o cache da pergunta está desligado [INF].

## 4. Como excluir colunas de pessoa no nível do Metabase

Princípio: **minimização na origem** (LGPD): o que o coletor não recebe não pode vazar. Hoje o projeto aceita pessoa em `stg_*` (lista fechada em `server/src/db/lgpd.ts`; Acelerato: solicitante, agente e e-mail ficam só no staging, decisão L-3 do `data-model.md`). Recomendação: **nem chegar ao staging**, salvo decisão do usuário em contrário.

Opções, da mais robusta para a menos:
1. **View no banco do Acelerato sem colunas de pessoa**, e o Metabase usa esse view (a pergunta consulta a view). Independe da edição do Metabase [INF]. Pedir ao dono do banco.
2. **Pergunta SQL salva com lista explícita de colunas** (sem `SELECT *`) e só essa pergunta é acessível à chave (§2, opção A). Funciona em qualquer edição [INF]. Fraqueza: quem edita a pergunta pode incluir colunas; limitar permissão de curadoria da coleção.
3. **Row and column security (sandboxing)** [DOC]: Pro/Enterprise. Permite regra por tabela com "custom view" que omite colunas. **Limitações documentadas**: grupos com consulta nativa **contornam** a regra; **perguntas SQL ignoram** a regra (usam as tabelas originais) e devem ser isoladas em coleção própria; não vale para links públicos [DOC]. Logo, **não confiar nesta opção sozinha** com pergunta SQL.
4. **Impersonation** (papel do banco) [DOC: Pro/Enterprise, definido por banco]: a chave consulta com um papel do banco sem permissão nas colunas de pessoa (GRANT por coluna). É a opção com garantia no banco; combina bem com 1 [INF].
5. **Metadata do Metabase** ("ocultar campo") **não é controle de segurança** [INF; a doc trata visibilidade de campos como organização do modelo de dados, não como autorização]. Não usar como proteção.

Colunas que **não** podem constar na pergunta [PROJ, `data-model.md` §9, `COLUNAS_PESSOA`/`SEGMENTO_PESSOA`]: solicitante, atendente/agente, e-mail, usuário, login, e **`justificativa_ajuste`** (texto livre que pode conter pessoas). O schema zod da tabela **rejeita coluna extra** (`strict`) e a coleta falha com aviso `dados-invalidos` [PROJ]: serve de segunda barreira se alguém acrescentar uma coluna de pessoa à pergunta.
Texto livre (título, descrição, comentários) pode conter nome; confirmar no roteiro (§8) se algum entra.

## 5. Coleta incremental e append-only

[PROJ]: o staging é só INSERT; cada linha tem hash SHA-256; hash igual = ignora; diferente = nova versão (SCD2, `anterior_sk`); linha ausente = nova versão com `ausente_na_extracao = true`; nada apagado; `ctl_coleta` registra id da pergunta e hash do SQL.

Estratégias, dependentes de a tabela ter **data de atualização** (pergunta P6/P7 do `data-model.md`):
- **Com coluna de atualização confiável** (ex.: `atualizado_em`) [INF]: pergunta com parâmetro `atualizado_desde`; o coletor lê `marca_dagua_ate` da última coleta ok, subtrai **margem de segurança** (sugestão 2 dias, configurável) para cobrir atrasos de gravação, e pede `atualizado_em >= marca - margem`. A deduplicação por hash torna a sobreposição inofensiva. **Chamado arquivado/excluído continua na base**: a coluna de exclusão (`excluido`) vem como atributo, nunca como filtro [PROJ].
- **Sem coluna** (hipótese atual do `data-model.md` §4) [PROJ]: **leitura integral** diária; o hash deduplica. Funciona enquanto o volume couber no limite de 1.048.575 linhas e em tempo aceitável.
- **Detecção de ausência** só vale em leitura integral; em incremental, a ausência é verificada numa varredura integral semanal (como no BusinessMap) [INF: a replicar; decidir com o arquiteto].
- Atualização retroativa na origem (chamado antigo editado) é capturada por hash (nova versão) mesmo sem o parâmetro, apenas se o chamado estiver no recorte lido [INF].
- Se a coleta falhar, **nada é gravado pela metade que sobrescreva histórico**; o evento de coleta registra `falha` e o selo mostra o estado (K-034) [PROJ].

## 6. Mapeamento tabela → modelo

Fonte da verdade do destino: `docs/architecture/data-model.md` §4 (`stg_chamado`, `stg_etapa`, `dim_chamado`, `fato_etapa_chamado`, `ref_*`), interface `Chamado`/`EtapaChamado` em `packages/metricas/src/acelerato/modelo.ts`, DTOs em `packages/contratos/src`. **Os nomes das colunas de origem são desconhecidos**: a coluna "origem" abaixo é preenchida pelo usuário/Jarvis (§8). Nada é inferido do nome; dúvida vira pergunta.

| Campo no modelo (`dim_chamado`) | Origem na tabela (a preencher) | Observação |
|---|---|---|
| `chamado_id` (= `id_origem`) | ? | chave natural; unicidade por (`id_origem`, `anterior_sk`) |
| `organizacao`, `tipo_fila`, `equipe`, `natureza`, `categoria_sistema` | ? | recortes do `ref_dominio` (3.2) |
| `status`, `excluido`, `aberto_em`, `data_finalizado` | ? | datas UTC; `excluido` é atributo |
| `primeiro_atendimento_em`, `restaurado_em` | ? | pode estar ausente em abertos |
| `impacto`, `urgencia`, `prioridade`, `prioridade_ajustada_manualmente` | ? | `justificativa_ajuste` **não entra** (§4) |
| `status_sla_r` (SLA de resolução) | ? | só `REALIZADO_NO_PRAZO` ou `REALIZADO_APOS_VENCIMENTO`; nulo só em aberto; nunca converter nulo em "dentro" |
| `status_sla_pa` (SLA de primeiro atendimento) | ? | **P5**: valores e nome pendentes de confirmação do usuário |
| `excecao_sla_registro_posterior` | ? | coluna explícita, nunca filtrada em silêncio |
| `motivo_escalacao`, `motivo_pendencia_atual`, `previsao_retorno`, `motivo_encerramento`, `avaliacao_problema`, `incidente_critico_coordenado`, `nivel_resolucao`, `etapa` | ? | domínios fechados em `ref_dominio` |

Pontos que exigem atenção especial:
- **Reincidência / ticket anterior (S8, S12)**: o briefing 3.x diz que o campo de recorrência é pouco preenchido e que ausente conta como não reincidente (subestima). A coluna (ex.: referência a chamado anterior) **ainda não está no modelo `Chamado`**: é campo novo, com decisão do usuário sobre (a) nome da coluna, (b) se aponta para o chamado original (id) ou é só marcação, (c) como tratar ausência (nunca como "não reincidente" em silêncio: expor cobertura "n de N"). Reabertura (S8) depende da transição "Aguardando validação → Em diagnóstico" (T4.2) e do histórico de etapas.
- **Causa raiz (O17)**: decisão do usuário (2026-10-11): é da Sustentação, fonte Acelerato; o campo causa raiz vem pelo Metabase e liga ao chamado (incidente encerrado), agrupado por sistema (categoria). Nunca se liga a card do BusinessMap. Valores do mock em `CAUSAS_RAIZ` provisórios; falta confirmar o nome da coluna no Metabase.
- **Totalizadores de etapa**: precisa de **histórico de etapas** (uma linha por entrada/saída: `chamado_id`, `etapa`, `entrada`, `saida`, `motivo_pendencia`) → `stg_etapa`/`evt_etapa_chamado`/`fato_etapa_chamado` (P6). Sem histórico na fonte, as métricas dependentes ficam `pendente-usuario` e **nunca são inferidas do estado diário** [PROJ]. O mapeamento etapa → um dos 5 totalizadores (sem atendimento, em atendimento, espera combinada, espera do solicitante, espera de outros times) é por natureza (requisição, incidente, fila antiga) em `ref_etapa_totalizador` e entra como `ref_versao_criterio` (T4.4).
- **SLA**: horas úteis pelo calendário, prazos de `ref_alvo_prioridade` (P1 a P5); o cálculo de tempo passa pela biblioteca compartilhada (T2.5).

## 7. Variáveis do `.env` (nomes; **sem valores**; nunca no código, nunca versionadas)

Propostas (nomes ainda não existem em `.env.example`; criar na tarefa de coleta do Acelerato e validar no zod da `config` ao subir, sem ecoar o valor):

| Variável | Uso |
|---|---|
| `METABASE_URL` | URL base, `https://...`, sem barra final; HTTPS obrigatório fora do dev |
| `METABASE_API_KEY` | chave de API (redigida nos logs: `*.apikey`, `*_API_KEY`) |
| `METABASE_CARD_ID` | id da pergunta salva do Acelerato (chamados) |
| `METABASE_CARD_ETAPAS_ID` | id da pergunta de etapas, se a tabela de etapas existir (P6) |
| `METABASE_TIMEOUT_MS` | timeout do cliente (sugerido 300000) |
| `METABASE_MARGEM_INCREMENTAL_DIAS` | margem de sobreposição (§5), se houver coluna de atualização |
| `METABASE_TLS_CA_FILE` (opcional) | CA interna, se o certificado não for público |

Id do banco e da tabela só são necessários na configuração (descoberta) e não precisam ir ao `.env`.

## 8. Roteiro: o que o usuário precisa entregar ou fazer

Marque cada item e responda por escrito. Não envie a chave por chat nem por commit; o valor vai só no `.env` da máquina.

1. **Dados de ambiente**: URL do Metabase; versão e edição (OSS, Pro, Enterprise: Admin > Settings > About); como o servidor é alcançável da máquina onde o worker roda (internet, VPN, LAN) e se exige liberação de IP/firewall.
2. **Administrador** (ou quem tem a permissão) cria: (a) grupo `dspd-coletor-leitura`; (b) a **pergunta salva** do Acelerato com **lista explícita de colunas**, sem pessoa (§4); (c) coleção própria para ela; (d) permissão do grupo conforme §2; (e) **API key** vinculada ao grupo (Admin > Settings > Authentication > API Keys) [DOC]. Guardar a chave num cofre; colocar em `METABASE_API_KEY`.
3. **Entregar ao Jarvis**: `id` da pergunta (número na URL `/question/<id>`); `id` do banco; nome da tabela ou view de origem; **lista completa de colunas** com tipo, exemplo anonimizado e indicação "pessoa? sim/não"; quantidade aproximada de linhas e crescimento por mês; se há colunas de **data de atualização**, **ticket anterior/recorrência**, **etapa** e **SLA de primeiro atendimento** (nome e valores possíveis); se existe tabela/pergunta de **histórico de etapas** (entrada e saída por etapa).
4. **Respostas de negócio** (não inferidas): os valores exatos do SLA (P5); se ausência na extração significa saída do recorte ou exclusão (P7); como tratar reincidência ausente; qual a regra para chamados arquivados/excluídos; se campos de texto livre entram.
5. **Confirmar** que o usuário do banco que o Metabase usa é só leitura, e se há limite de IP/horário para consultas pesadas.
6. **Testar** a chamada simples (§9) e enviar o resultado (status HTTP e contagem de linhas; **sem** o conteúdo).
7. **Decisões de segurança** (§10), principalmente a de armazenar ou não pessoa no staging (hoje a lista fechada permite no `stg_`; recomendo não trazer).

## 9. Como testar a conexão

Em máquina de confiança, com as variáveis exportadas só no shell (não gravar no histórico; usar `read -s`):

```bash
# 1. a chave funciona e a que grupo pertence? (esperado: 200; 401/403 = chave errada ou sem permissão)
curl -sS -o /dev/null -w '%{http_code}\n' -H "X-API-Key: $METABASE_API_KEY" "$METABASE_URL/api/user/current"

# 2. a pergunta executa e devolve JSON (esperado: 200; conferir o número de linhas, sem imprimir os dados)
curl -sS -X POST -H "X-API-Key: $METABASE_API_KEY" -H 'Content-Type: application/json' \
  -d '{}' "$METABASE_URL/api/card/$METABASE_CARD_ID/query/json" \
  | python3 -I -c 'import json,sys; d=json.load(sys.stdin); print(len(d), sorted(d[0].keys()) if d else [])'
```
- `GET /api/user/current` [DOC: endpoint existente] retorna dados do usuário da chave; em chave de API o retorno é o usuário técnico associado [INF].
- O passo 2 imprime **só as chaves (nomes das colunas) e a contagem**, para conferir que **não há coluna de pessoa** e que a contagem não é exatamente 2000 (sinal de truncamento caso se tenha usado o endpoint errado) [INF].
- Em produção: o mesmo teste vira verificação antes da coleta; falha → `tipoErro` seguro (`autenticacao`, `indisponivel`, `tempo-esgotado`, `dados-invalidos`) sem mensagem do servidor, SQL nem credencial [PROJ].

## 10. Checklist de segurança do acesso

Referência: `docs/security/revisao-de-seguranca.md` (existe no working tree principal `/home/rodrigoisensee/MetricasDSPD`, branch `develop`; ainda não está neste worktree). Pontos relevantes extraídos dele: F3 (worker → Metabase), **I-8** (conta de serviço só leitura não definida), **M-3** (plugin Siegard lê `.env`), **M-4** (token do `gh`), **M-5** (LGPD/retenção em append-only), **S-31** (negar leitura do `.env` aos agentes) e **S-24** (portas em loopback).

- [ ] API key em grupo dedicado, sem Admin, sem permissão de consulta nativa, sem curadoria (§2). Revisão semestral e **rotação** quando houver troca de responsável ou suspeita.
- [ ] Chave só em `.env` (fora do git; `git check-ignore .env`), **nunca** em transcrição, issue, PR, log ou commit; **negar leitura de `.env` aos agentes** (S-31) antes de colocar a chave real; varredura do histórico git por segredos (S-30) feita.
- [ ] **HTTPS** com certificado válido; recusar `http://` fora do desenvolvimento; verificação de TLS ligada (nunca `NODE_TLS_REJECT_UNAUTHORIZED=0`).
- [ ] **Host fixo** (a URL vem do `.env` e é validada; o cliente **não segue redirecionamento** para outro host nem aceita URL vinda de dado) para evitar SSRF e vazamento da chave por redirect [INF].
- [ ] Logs redigem `X-API-Key`/`*_API_KEY`; erro de coleta grava só categoria (`tipoErro`), sem corpo de resposta nem SQL (CA-15).
- [ ] Sem coluna de pessoa na pergunta; schema zod `strict` ativo; teste de contrato que **falha** se aparecer coluna cujo segmento case `SEGMENTO_PESSOA` (§4).
- [ ] Armazenar pessoa apenas se houver decisão do usuário registrada; senão excluir na origem e o `stg_chamado` também não a recebe. Retenção e eliminação definidas (M-5) antes da primeira carga real.
- [ ] Respeitar a regra: Acelerato em `dspd_ac`, BusinessMap em `dspd_bm`, sem cruzamento; **nenhuma métrica individual** nem comparação entre times.
- [ ] Banco do Metabase: usuário de leitura apenas; coleta fora do horário de pico; timeout e limite de tamanho no cliente (proteção contra resposta enorme).
- [ ] Tráfego: o Metabase é alcançado por rede autorizada (VPN/IP liberado); nada de abrir portas locais para a internet para isso (M-1, M-2).
- [ ] Plano de resposta: se a chave vazar, **revogar no Metabase** (Admin > API Keys > regenerar/excluir [DOC]), gerar nova, rodar o teste do §9 e registrar o incidente.

## 11. Pendências e o que não foi verificado
- Não foi testada nenhuma chamada real (não há URL nem chave). Todas as marcas [DOC] vêm da documentação e do `api.json` oficiais; a instância pode estar numa versão diferente.
- Não verificados na doc: exato formato do item de `parameters` em `.../query/json`; nome oficial do cabeçalho de sessão; expiração de API key; existência de `/api/health`; comportamento do cache em `.../query/json`.
- Perguntas ao usuário: P5 (SLA de primeiro atendimento), P6 (histórico de etapas), P7 (ausência), L-3 (pessoa no analítico), edição do Metabase, SSO (P3), coluna de reincidência/ticket anterior.
