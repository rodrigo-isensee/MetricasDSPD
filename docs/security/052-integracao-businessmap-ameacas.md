# Modelo de ameaças da integração real com o BusinessMap (pedido 052, E1.2)

Propósito: atualizar o modelo de ameaças da coleta (ADR 0020, K-084) para o cenário real: coleta agendada pela API, apikey de verdade e webhook. Público: software-architect (plano E1.1), tech-lead, node-backend, qa-engineer, devops-engineer, Jarvis. Data: 2026-10-29 (revisado em 2026-10-29 com as decisões do dono S-1 = Q-5 B, S-3 = Q-4 A e Q-8 B, E1.7). Estado: modelo de ameaças e requisitos, **não é parecer**; o parecer de segurança (R-SEGURANCA) vem sobre o commit final de cada fatia de código. Base: `docs/security/adr-0020-protecao-de-pessoa.md`, `docs/security/k084-coletor-allow-list.md`, `docs/integracao/businessmap-api-configuracao.md` (§1, 4.8, 4.9, 6, 7), `server/src/modulos/businessmap/webhook.ts` e `allow-list.ts`, `server/src/plataforma/log.ts`, `server/src/plataforma/config.ts`. Leitura estática; nenhuma chamada à API, o `.env` não foi lido.

**Gatilhos (R-SEGURANCA):** credencial de integração externa (apikey), endpoint público novo (webhook), dado pessoal e texto livre na fronteira, rede de saída (cliente HTTP novo), log e erro com dado de terceiro.

## 1. Ativos
| Ativo | Por que importa | Onde vive |
|---|---|---|
| `BUSINESSMAP_APIKEY` | Decisão do dono (2026-10-29): é a chave **do próprio dono**, não de usuário só leitor; herda as permissões dele e a API não tem escopo somente leitura (§1). Vazada, dá leitura **e escrita** ao BusinessMap inteiro da conta, inclusive pessoas e texto livre. Também alimenta o MCP do BusinessMap (ferramenta do time nesta sessão). | `.env` local da máquina do dono (e o token do MCP, configurado por ele) |
| `WEBHOOK_BM_SEGREDO` | Única autenticação do receptor. | `.env`; cabeçalho `x-webhook-secret` |
| Dado de pessoa do BusinessMap (`owner_user_id`, `co_owner_ids`, `user_id`, autor de comentário, `realname` de `GET /users` e os demais campos de `/users`, como e-mail) | LGPD; base append-only sem eliminação viável; proibição de métrica individual | memória do coletor; ids e nomes só em colunas de `COLUNAS_PESSOA` (`dim_card.responsaveis`, `dim_card_versao.responsaveis`; nomes por Q-8 B, ADR 0020 4b, revisão 3 lida na E1.7), fora do GRANT do `dspd_api` |
| Texto livre (`title`, `custom_id`, `description`, `discard_comment`, comentários, subtarefas) | Pode conter nome de cliente, CPF, dado de terceiro | `title` e `custom_id` entram na `stg_card` por decisão (L-2, I-4); o resto nunca |
| Base analítica (`stg_*`, `dim_*`, `fato_*`, `ctl_*`) | Integridade do histórico; separação BusinessMap × Acelerato | PostgreSQL; papéis `dspd_coletor`, `dspd_webhook`, `dspd_api`, `dspd_migrador` |
| Disponibilidade da cota da API (30/min, 600/h, §3) | A cota é da conta inteira: coleta descontrolada consome a cota de quem usa o BusinessMap | conta BusinessMap |
| Credenciais dos papéis PG no `.env` | Credenciais só em `.env` (regra inviolável) | `.env` |

## 2. Fluxo e fronteiras de confiança

```mermaid
flowchart LR
  subgraph EXT[Fora: internet / SaaS]
    BM[(API BusinessMap)]
    BMW[Webhook do BusinessMap]
  end
  PROXY[Proxy ou túnel TLS, se houver] 
  BMW -->|POST + x-webhook-secret| PROXY --> WH[Receptor dspd_webhook]
  AG[Agendador 06:00] --> CO[Coletor dspd_coletor]
  CO -->|GET + apikey, limitador local| BM
  BM -->|cards, revisions, block_times| CO
  CO -->|registro allow-list| STG[(stg_card, stg_revision)]
  CO -->|ids e nomes em memória; GET /users fields=user_id,realname| RESP[(colunas de COLUNAS_PESSOA - sem GRANT à API)]
  WH -->|registro allow-list| STGW[(stg_webhook_evento + outbox)]
  CO -->|código, entidade, id_origem| CTL[(ctl_coleta_falha)]
  CO --> LOG[[log pino]]
  STG --> PR[Projetor] --> DIM[(dim_, fato_)] --> API[API dspd_api] --> WEB[Painel]
  CTL --> API
```
Fronteiras: **F1** BusinessMap → coletor (resposta da API é entrada não confiável); **F2** internet → receptor do webhook; **F3** coletor e receptor → banco (allow-list, GRANT por papel); **F4** banco → `dspd_api` (GRANT por coluna); **F5** processo → log e `ctl_`; **F6** `.env` e ambiente → processo (segredos); **F7** API → painel (reidentificação por agregado, já coberta pela ADR 0020 e pelo 048/T14, fora deste documento).

## 3. Ameaças (STRIDE), por prioridade
Severidade = probabilidade × impacto. "Estado" diz o que já existe no código (K-084) e o que falta.

### A1. Apikey com poder além da leitura (E, I) · **alta; risco aceito pelo dono por ora (S-1 = Q-5 B, 2026-10-29)**
- Decisão do dono: "por enquanto será o meu": a chave do coletor e do MCP é a do próprio dono, que pode alterar o quadro. O aceite está registrado no pedido; o registro formal de risco aceito segue `R-DECISAO` (com `commit:` do parecer correspondente). A pendência fica explícita: **antes da coleta agendada em produção ou fora da máquina do dono, trocar por usuário de serviço só leitor** (item 1 do roteiro, E1.4).
- Caminho: a chave tem os poderes do dono (edição ou administração). Quem obtém a chave (backup do `.env`, log, histórico de shell, máquina do dev) lê tudo e pode escrever no BusinessMap, onde um erro ou ataque vira corrupção do fluxo real do time.
- Controles existentes: o doc §1 manda usuário de serviço com papel leitor; segredo só em `.env`; `redact` do pino cobre `*.apikey` (`log.ts:5-16`).
- Mitigações que passam a ser o único freio, portanto obrigatórias: coletor só GET (a); MCP só com ferramentas de leitura (nunca criar, mover, editar ou excluir card; regra de uso do time); token do MCP e apikey só em configuração local do dono, nunca em documento, brief nem log.
- **Faltantes:** (a) cliente HTTP só com GET, sem método genérico exportado, e teste que falha se existir chamada não-GET (já pedido em §1 do doc; vira requisito de segurança); (b) lista de hosts permitidos: o cliente só fala com o host de `BUSINESSMAP_URL_BASE`, validado na partida como `https`; (c) troca por usuário de serviço só leitor antes da coleta agendada em produção (pendência, ver acima); até lá, o risco é do dono; (d) rotação documentada: gerar nova chave invalida a anterior (§1), então rotação é feita à mão pelo dono e o coletor trata 401 como parada (item 4 do §3 do doc), sem retry.

### A2. Apikey em log, erro, URL ou payload gravado (I) · **alta**
- Caminho: erro do cliente HTTP (axios/undici/fetch) carrega a configuração da requisição, inclusive cabeçalhos; o pino registra o objeto de erro. O `redact` atual casa `*.apikey` com **um nível de profundidade** e com a chave exata `apikey`; um caminho como `err.config.headers.apikey` ou `err.request.headers.apikey` não casa. Cabeçalho `Authorization` de resposta/requisição do cliente também. Quem lê: qualquer pessoa com acesso ao log do worker.
- Estado: `CAMINHOS_REDIGIDOS` (`log.ts:5-16`) cobre o cabeçalho de entrada, não o de saída do cliente novo.
- **Faltantes:** o cliente nunca anexa a requisição ao erro (captura e relança erro próprio com `codigo`, `status`, `entidade`, `id_origem`, sem `cause` do cliente HTTP); a apikey fica só num cabeçalho montado dentro do cliente, nunca em query string nem em URL; acrescentar caminhos de `redact` para `*.headers.apikey` e `*.*.headers.apikey` (defesa em profundidade, não substitui o erro próprio); teste do marcador: apikey de teste fixa, forçar 401, 429, 5xx e timeout, e conferir que o valor não aparece no log, em `ctl_coleta_falha` nem em exceção propagada; `gitleaks --redact` no CI sobre o histórico (lacuna: não está no PATH desta máquina).

### A3. Webhook sem assinatura confiável (S, T) · **média, alta se for exposto sem TLS**
- Fato: o método de assinatura do BusinessMap **não foi lido** (§4.8: "NÃO LIDO"). O receptor usa um **segredo compartilhado estático em cabeçalho** (`x-webhook-secret`, `webhook.ts:12, 64-66`), comparado em tempo constante por SHA-256 (`webhook.ts:27-28`), antes de ler o corpo. Isso é autenticação por portador, não assinatura do corpo: não prova integridade nem impede replay.
- Caminho: (1) sem TLS ou com proxy que registra cabeçalhos, o segredo é capturado; com ele, qualquer um posta eventos forjados, que entram na `stg_webhook_evento` e disparam o evento `bm.webhook.recebido` na outbox (envenenamento de dado e de reconciliação, `rec_transicao_par`). (2) Replay: uma entrega capturada é idêntica, então o `ON CONFLICT` por SHA-256 do corpo a descarta (`webhook.ts:46-50`); replay idêntico é inofensivo, mas corpo alterado com o mesmo segredo não. (3) O formato do payload é suposto (`allow-list.ts:107-130`); se o real for diferente, falha fechado (nada gravado), o que é seguro e silencioso (I-1 do K-084). (4) Se o BusinessMap só permitir segredo em corpo ou HMAC, o receptor atual não confere o método e rejeita tudo com 401.
- Impacto contido: o receptor só grava o registro filtrado (ids de card e coluna, tipo, instante) e o papel `dspd_webhook` só tem INSERT em `stg_webhook_evento` e `outbox`; nenhuma métrica lê o webhook como verdade (polling é a fonte de verdade, §4.8).
- **Faltantes:** (a) ler o artigo de webhooks (roteiro §7.7) antes de ligar; se houver HMAC do corpo, implementar a verificação sobre o corpo bruto em tempo constante, com janela de tempo se o BusinessMap enviar instante assinado; (b) TLS obrigatório no caminho público (proxy ou túnel), a API em `127.0.0.1` e **só** a rota `/webhooks/businessmap` publicada, nenhuma outra rota da API pelo túnel; (c) limite de taxa por origem no proxy (o limite de corpo de 256 KB existe: `webhook.ts:11, 62`); (d) o evento do webhook só aciona reconsulta pela API (acelerador), nunca é fonte de valor para as tabelas de fato; (e) segredo com mínimo de 16 caracteres já é validado (`config.ts:28`), recomendar 32 bytes aleatórios e rotação com janela de dois segredos aceitos; (f) contador de ignorados por tipo e de 401 (alerta de tentativa).
- Decisão do dono (item 8 do roteiro): vale a recomendação do time, mostrada antes do código; a pergunta 4 do §6 fica adiada até o webhook existir. A vista de segurança favorece **só polling** na primeira entrega, porque elimina um endpoint público e a necessidade de túnel; o webhook entra depois, com (a) a (f) resolvidos. Recomendação, não decisão.

### A4. Dado de pessoa e texto livre chegam à base (I) · **média**
- Caminho: a resposta da API traz `owner_user_id`, `co_owner_ids`, autor de revisão, `description`, `discard_comment`, nomes e e-mails. A allow-list do K-084 fecha `stg_card`, `stg_revision` e `stg_webhook_evento` (`allow-list.ts:14-27, 66-130`; parecer K-084, M-1 a M-3 fechados). O `title` e o `custom_id` entram por decisão (L-2, I-4).
- Faltantes ainda abertos do K-084, que passam a ser **pré-condição da coleta real**:
  - B-K1: validar a **forma** das strings nas chaves permitidas (ids, instantes ISO 8601, `link_type` em conjunto fechado). Com dado real, o formato real é conhecido; sem isso, texto arbitrário entra em chave permitida.
  - B-K3: "negado por padrão" para `stg_bloqueio`, `stg_custom_field`, `stg_vinculo`, `stg_coluna` (hoje com `payload jsonb` sem allow-list) e teste estrutural dos `INSERT` em `stg_`. `block_times` traz o comentário e o autor de quem bloqueou: a allow-list de `stg_bloqueio` precisa de ADR antes do código.
  - I-2: `fields=` restrito no pedido à API (2ª camada) e garantia de que `extrairResponsaveis`/`gravarResponsaveis` rodam na mesma execução que `gravarStgCard` (4b); critérios de pronto do cliente e do worker.
  - `GET /users` **permitido só com `fields=user_id,realname`** (Q-8 B, 2026-10-29; antes era proibido, §4.9). Entra na lista fechada de caminhos (`/cards`, `/boards`, `/workflows`, `/customFields`, `/apiLimits`, `/cards/{id}/revisions`, `/users` e o que a E1.1 listar). O cliente monta a consulta de `/users` sozinho, com o `fields` fixo no código: o chamador não passa `fields` nem filtro livre; `/users` sem `fields`, com outro `fields` ou com campo a mais (e-mail, username, avatar, papéis e demais) é recusado antes de enviar. Segunda camada: a resposta passa por allow-list (`user_id`, `realname`) e qualquer outra chave é descartada na fronteira. Risco novo: `realname` é nome de pessoa; vai só para colunas de `COLUNAS_PESSOA`, **nunca** para `stg_`, log, `ctl_coleta_falha` ou exceção; o mapa `user_id` para `realname` vive em memória na execução, sem tabela de usuários e sem persistir e-mail. Nenhuma métrica, rota ou tela usa o nome (regra inviolável: sem métrica individual); a ADR 0020 4b (em revisão pelo arquiteto, E1.6) deve dizer onde a coluna de nomes mora.
  - Responsáveis (ids e agora nomes): `dim_card.responsaveis` e `dim_card_versao.responsaveis` seguem em `COLUNAS_PESSOA` (`lgpd.ts:12-13`) sem GRANT à API; qualquer coluna nova de nome entra em `COLUNAS_PESSOA` na mesma migração e o teste de GRANT confere o `dspd_api`; nome não é pseudônimo, então a eliminação a pedido do titular recai sobre essas colunas (projeção atualizável, não staging); `fato_transicao.usuario` continua sem fonte (R-2 = B, ADR 0020).
  - Dados antigos: o levantamento do `docs/security/k097-levantamento-staging.md` (e do K-084, seção "Dados antigos") precisa estar concluído e o resultado conhecido **antes da primeira coleta real** no ambiente que a recebe.

### A5. Log com payload ou valor de dado (I) · **média**
- Caminho: exceção de JSON, zod ou Postgres ecoa um trecho do registro (K-084 B-K2: `\u0000` no `title` gera erro do Postgres com `CONTEXT: JSON data ...` que o pino registra e o catch pode copiar para `ctl_coleta_falha.erro`, que o `dspd_api` lê). O receptor já rejeita `\u0000` (`webhook.ts:80`) e loga só o tipo (`webhook.ts:84`); o coletor ainda não existe.
- **Faltantes:** remover `\u0000` e surrogate isolado nas strings de `registroCard` e `registroRevisao`; o catch do coletor grava só `err.code`, entidade e `id_origem` (categoria segura: `indisponivel`, `tempo-esgotado`, `autenticacao`, `formato`); o log do worker no nível `info` e `warn` nunca leva corpo de resposta da API nem do webhook; `LOG_LEVEL=debug` e `trace` proibidos em ambiente com dado real (validar na partida ou documentar); teste do marcador (item 7 da ADR 0020).

### A6. Taxa, retry e disponibilidade (D) · **média**
- Caminho: (1) retry sem limite ou sem jitter, ou várias instâncias do coletor, esgotam a cota de 30/min e 600/h da conta e **bloqueiam outras integrações e o uso do BusinessMap pelo time** (a cota é da conta, §3); (2) a carga inicial histórica é a única cara (~35 min por 1.000 cards só em revisões, §3.5); (3) 429 tratado como falha, ou 401/403 repetido, gera tempestade de chamadas e pode travar a chave; (4) resposta enorme ou paginação infinita (filtro ignorado sem erro, §3) consome memória do worker; (5) webhook inundado por quem tem o segredo ou por proxy aberto enche `stg_webhook_evento` (append-only, sem expurgo) e a outbox.
- **Faltantes:** limitador local abaixo do real (`BUSINESSMAP_LIMITE_POR_MINUTO` ≤ 25) lendo `PerMinute-Remaining`; 429 dorme `retry_after` mais jitter, sem contar falha; 5xx e rede: no máximo 3 tentativas com backoff e timeout por chamada; 401/403 interrompem a coleta, sem retry; teto de páginas e de bytes por resposta e validação de que a página devolvida respeita o filtro (contar e conferir datas); **exclusão mútua** da coleta (uma execução por vez, por trava no banco, `ctl_coleta`), inclusive entre carga inicial e incremental; carga inicial só manual, com o dono presente, nunca no agendador; alerta quando `Remaining` cai abaixo de um piso; teto de linhas por hora no receptor e política de retenção da `stg_webhook_evento` decidida pelo dono (hoje é append-only por regra: o volume é um risco de disco, não de segredo).

### A7. Resposta da API como entrada não confiável (T, S) · **média-baixa**
- Caminho: o host da API vem de `BUSINESSMAP_URL_BASE`; se alguém altera o `.env` para outro host (ou um proxy corporativo faz MITM), o coletor envia a apikey a terceiro e aceita dados forjados; um redirecionamento HTTP (3xx) leva o cabeçalho `apikey` a outro host. Resposta malformada (tipos errados, campos enormes) quebra o parse.
- **Faltantes:** `https` obrigatório e host fixo validado por zod na partida; **não seguir redirecionamento** (ou só para o mesmo host, sem reenviar `apikey`); sem desligar a verificação de certificado (`NODE_TLS_REJECT_UNAUTHORIZED`); o coletor valida o formato da resposta por esquema e trata falha de formato como falha do item, sem gravar parcial; limite de tamanho de string por campo.

### A8. Integridade da base e mistura de fontes (T) · **média**
- Caminho: dado do BusinessMap gravado em tabela do Acelerato (ou o contrário), ou carga que sobrescreve histórico. Mudança de apikey para outra conta (outro tenant) mistura dados de duas contas sem aviso.
- **Faltantes:** o coletor só escreve em `stg_` do esquema `bm` e `ctl_` (papel `dspd_coletor`, GRANT por tabela); `board_id` coletado sempre pertence a `BUSINESSMAP_QUADROS_IDS` e quadro de teste (`eh_teste`) é excluído do cálculo; registrar na `ctl_coleta` o host e o hash da lista de quadros e recusar a coleta se o host mudar sem migração explícita; nenhum `UPDATE` nem `DELETE` em `stg_` e histórico (regra do append-only).

### A9. Segredos e configuração (I) · **média**
- `.env` fora do git e `.env.example` só com nomes (§6); variáveis novas (`BUSINESSMAP_APIKEY` e as demais) validadas por zod na partida, **sem valor padrão** para a apikey e para a URL; a mensagem de erro do zod nunca imprime o valor (o `config.ts` atual usa mensagens fixas, manter); `docker-compose` não injeta a apikey em imagem nem em `environment` visível em `docker inspect` além do necessário (preferir `env_file`); a apikey existe só no `.env` local da máquina do dono (S-3 = Q-4 A); homologação e servidor ficam sem apikey (fora do escopo atual); `gitleaks` no CI e antes do commit do `.env.example`.

## 4. Controles existentes (resumo)
| Controle | Evidência |
|---|---|
| Allow-list por entidade na fronteira (card, revisão, webhook) e responsáveis (ids e nomes) só em memória até as colunas de `COLUNAS_PESSOA` | `allow-list.ts:14-152`; K-084 aprovado |
| Papéis PG por função e GRANT por coluna; colunas de pessoa fora da API | `lgpd.ts:12-13`; K-085 |
| Receptor: segredo em tempo constante antes de ler o corpo, 256 KB, objeto JSON, `\u0000` recusado, tipo fora da lista não grava, log só do tipo | `webhook.ts:11, 27-28, 62-66, 80, 84` |
| Hash do corpo bruto para dedupe do webhook; `ON CONFLICT DO NOTHING` | `webhook.ts:41-50` |
| `redact` de `x-webhook-secret`, `authorization`, `*.apikey` e outros | `log.ts:5-16` |
| Configuração do webhook exige as duas variáveis ou nenhuma | `config.ts:27-31` |
| Staging append-only (trigger) | `0004_bm_staging.ts` |

## 5. Controles faltantes, em ordem de pré-condição
1. **Antes de qualquer chamada real à API (primeira fatia do cliente):** A1(a), A1(b), A2, A7, A9; B-K1; teste de GET-apenas e de caminhos permitidos.
2. **Antes do worker de coleta:** A5 (B-K2), A6 (limitador, retry, exclusão mútua, teto de página), I-2 do K-084 (`fields=` e "mesma execução"), A8; levantamento de dados antigos concluído.
3. **Antes de qualquer tabela `stg_` além das três:** B-K3 ("negado por padrão" e ADR da allow-list de `stg_bloqueio`).
4. **Antes de ligar o webhook:** A3 (a) a (f) e o artigo de webhooks lido; revisão do parecer K-084 sobre `registroWebhook` com o formato real.
5. **Antes da primeira coleta com dado real:** E1.4 do dono (apikey no `.env` local da máquina do dono), resultado do levantamento de dados antigos, teste de `GET /users` só com `fields=user_id,realname`, nomes só em `COLUNAS_PESSOA`.
6. **Antes da coleta agendada em produção (fora do escopo atual):** troca da chave por usuário de serviço só leitor (A1) e nova rodada deste modelo para o ambiente (retenção, backup, acesso, levantamento de dados antigos).

## 6. Perguntas ao dono (R-DECISAO; nenhuma resolvida por inferência)
1. **Usuário de serviço é leitor?** **Decidida pelo dono em 2026-10-29 (S-1 = Q-5 B):** "por enquanto será o meu": a chave é a do dono, não de usuário só leitor; risco aceito por ele por ora. Mitigações: coletor só GET e MCP só com ferramentas de leitura; pendência de trocar por usuário de serviço só leitor antes da coleta agendada em produção (A1).
2. **Webhook na primeira entrega?** **Decidida pelo dono em 2026-10-29 (S-2):** vale a recomendação do time (item 8 do roteiro), escrita no plano da E1.1 e mostrada antes do código; a vista de segurança continua a de A3 (só polling primeiro).
3. **A coleta real roda onde?** **Decidida pelo dono em 2026-10-29 (S-3 = Q-4 A):** só na máquina do dono (chave no `.env` local, banco local); homologação e servidor ficam fora.
4. **Retenção da `stg_webhook_evento` e do log do worker.** **Adiada até o webhook existir** (S-4): o append-only da base impede expurgo e a política (por exemplo, rotação do log em 30 dias) é do dono.

### Nota de leitura da revisão do item 4b da ADR 0020 (Q-8 B)
**Lida em 2026-10-29 (E1.7), sobre a "Revisão 3 (2026-10-29, pedido 052, E1.6)" gravada na worktree. De acordo, com 1 condição para a implementação e 2 recomendações não bloqueantes.** Conferência das 5 condições:
- (i) `fields` fixo no cliente e allow-list de duas chaves: de acordo. ADR 0020 R3-1 (`/users` só com `user_ids=` e `fields=user_id,realname`, cliente rejeita outro `fields`, allow-list `user_id`/`realname` na resposta, campo a mais descartado); plano 052 F0 (linhas 79 e 81) exige a consulta montada com `fields` fixo no código e testa a recusa; `businessmap-api-configuracao.md` §4.9.
- (ii) nomes só em `COLUNAS_PESSOA`, fora do GRANT do `dspd_api`, nunca em `stg_`, log ou `ctl_coleta_falha`: de acordo. R3-2 e R3-3 (também `fato_*`, `agg_*`, `vw_*`, outbox, evento, rota, DTO, tela, exportação e filtro) e teste de grants em R3-4.
- (iii) nenhum e-mail nem outro campo de `/users`: de acordo. R3-1 ("Nunca `emails`, `usernames`, `expand`, nem `lastActivity`") e teste de fixture com e-mail e username em R3-4.
- (iv) nenhuma métrica, rota ou tela usa o nome: de acordo. R3-3 e o critério de reversão (nome fora de `COLUNAS_PESSOA` reabre a decisão).
- (v) reconstrução preserva o nome: **de acordo só em parte.** O item 4b preserva `responsaveis` (ids) na reconstrução, mas nem o 4b nem a R3-2 dizem o mesmo de `dim_responsavel`. O nome não vem da staging, então uma reconstrução que recrie ou esvazie a tabela o perde e só volta por nova leitura de `/users`. **Condição para a implementação (E2):** a reconstrução da projeção não trunca nem recria `dim_responsavel`, ou o plano diz que ela é refeita por `/users` na mesma execução; teste cobrindo isso. Dono: `software-architect` (texto) e `node-backend` (código).

Sobre a proposta `dim_responsavel (responsavel_id, responsavel_nome, atualizado_em)`: não cria ameaça nova; melhora a posição (nome em um só lugar, uma linha por pessoa, eliminação a pedido do titular em uma tabela). Ajustes ao modelo: (a) `responsavel_id` também é dado de pessoa e fica em `COLUNAS_PESSOA` junto do nome (a R3-2 já diz); só `atualizado_em` pode ser legível, e o `dspd_api` não pode ter GRANT de tabela inteira: o teste de grants de R3-4 cobre `SELECT` na tabela e nas colunas. (b) Casos de abuso para o QA: `dspd_api` tenta `SELECT` em `dim_responsavel` (tabela, `responsavel_id` e `responsavel_nome`), esperado negado; fixture de `/users` com nome marcador e e-mail, esperado marcador só em `dim_responsavel`, e-mail em lugar nenhum e log e `ctl_coleta_falha` sem o marcador.

Recomendações (não bloqueantes): (R-a) a R3-1 busca só ids "ainda sem nome conhecido", mas a R3-2 diz que a troca de nome atualiza a linha; sem releitura periódica o nome nunca atualiza. Definir a regra (releitura por `atualizado_em` antigo) ou aceitar o nome como foto da primeira coleta. (R-b) Registrar a retenção de `dim_responsavel` na I-12 (DPO), como o R-11 do plano prevê; sem prazo, o nome de quem saiu do quadro fica indefinidamente. Coleta só na máquina do dono (R-10): sem superfície de rede nova para o nome.

### Fora do escopo atual, registrado como futuro (S-3 = Q-4 A)
Ameaças de homologação e de servidor (apikey em `.env` de outro ambiente, dado real em backup e log de homologação, retenção, acesso de terceiros, levantamento de dados antigos nesses ambientes, webhook com túnel público) saem do escopo desta rodada. Voltam a este modelo se o dono decidir levar a coleta para fora da máquina dele.

## 7. Casos de abuso (para o qa-engineer escrever como teste na implementação)
| # | Entrada | Caminho | Resultado esperado |
|---|---|---|---|
| CA-1 | Card com `owner_user_id`, `co_owner_ids`, `description`, `discard_comment`, `reporter`, `subtasks` e chave desconhecida contendo marcador | resposta da API → `registroCard` → `stg_card` | nenhum dos campos nem o marcador aparece em nenhuma `stg_`, nem no log; os ids de responsável só em `dim_card.responsaveis` |
| CA-2 | Erro 401, 429, 5xx e timeout do cliente com apikey de teste fixa | cliente HTTP → catch do coletor → log e `ctl_coleta_falha` | o valor da apikey não aparece no log, em `ctl_coleta_falha` nem na exceção; 401 interrompe sem retry; 429 espera `retry_after` sem contar falha |
| CA-3 | Qualquer método diferente de GET, ou caminho fora da lista (por exemplo `/my/apiKey/generate`, `/users/{id}`), ou `/users` sem `fields`, com `fields` diferente de `user_id,realname` ou com campo a mais (e-mail, username) | cliente HTTP | o cliente recusa antes de enviar; só `GET /users?fields=user_id,realname` passa |
| CA-3b | Resposta de `/users` com e-mail, username e chave desconhecida contendo marcador, além de `user_id` e `realname` | resposta → allow-list → projetor | só `user_id` e `realname` saem; e-mail e marcador não aparecem em `stg_`, log, `ctl_coleta_falha` nem tabela alguma; `realname` só em coluna de `COLUNAS_PESSOA` |
| CA-3c | `dspd_api` lendo as colunas de nome e de `responsaveis`; rota ou DTO que exponha nome | API → banco e API → painel | permissão negada; nenhuma rota, DTO ou tela contém nome de responsável |
| CA-4 | `BUSINESSMAP_URL_BASE` com `http://`, host diferente ou resposta 3xx apontando a outro host | partida e cliente | partida falha com mensagem sem o valor da chave; redirecionamento não é seguido e a apikey não é reenviada |
| CA-5 | POST ao webhook sem segredo, com segredo errado, vazio e de tamanho diferente | internet → receptor | 401 sem ler o corpo, sem gravar, sem outbox |
| CA-6 | POST com segredo certo e corpo de 300 KB, JSON inválido, array, `\u0000`, tipo de evento fora da lista | receptor | 413, 400, 400, 400, 202 sem gravar; nada em `stg_webhook_evento` nem na outbox (fora o último caso, que grava nada) |
| CA-7 | Mesmo corpo enviado duas vezes; corpo igual com campo de pessoa extra | receptor | primeira grava o registro filtrado; segunda é `duplicado`, sem nova outbox; o campo de pessoa não é gravado |
| CA-8 | Título com `\u0000` e com surrogate isolado; comentário malformado com marcador | coletor → Postgres → log e `ctl_coleta_falha` | caracteres removidos e coleta segue; em erro, só `codigo`, entidade e `id_origem`; marcador ausente |
| CA-9 | Resposta paginada que ignora o filtro e devolve muitas páginas, ou página gigante | cliente → coletor | para no teto de páginas e de bytes, registra falha categorizada, não esgota a cota |
| CA-10 | Duas execuções da coleta ao mesmo tempo (agendador e manual) | coletor → banco | a segunda não inicia (trava) e não consome cota |
| CA-11 | Card de quadro fora de `BUSINESSMAP_QUADROS_IDS` ou de quadro de teste | resposta → coletor | não gravado, ou gravado fora do cálculo; nunca misturado ao Acelerato |
| CA-12 | `INSERT INTO ...stg_` fora de função `registro*` da allow-list (teste estrutural) | código-fonte | o teste falha |
| CA-13 | Papel `dspd_api` lendo `responsaveis`, `stg_` e `ref_conta_automacao` | API → banco | permissão negada (já coberto por K-085; reexecutar com os dados reais) |

## 8. Riscos aceitos
Nenhum aceite formal gravado. O dono decidiu em 2026-10-29 usar a chave dele em vez de usuário só leitor (S-1 = Q-5 B, A1); o registro formal depende do usuário, pelo Jarvis, com `commit:` igual ao do parecer correspondente (`R-DECISAO`), e vale só até a coleta agendada em produção.

## 9. Ferramentas e lacunas
Revisão estática de documento e de código. `gitleaks`, `semgrep` e `osv-scanner`: não executados nesta etapa (lacuna a confirmar no PATH; as varreduras rodam no CI do projeto, `devops-engineer`). Nada foi executado contra o BusinessMap nem contra produção.
