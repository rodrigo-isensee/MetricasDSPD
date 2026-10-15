---
tipo: revisao-seguranca
contrato: 1
pedido: 011-metricas-tambem-disponiveis
branch: fix/coletor-allow-list
commit: 5352a67aed8e58eef846bb4d0b7bf53c524cbd37
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-15
---
# Review de segurança: K-084, allow-list do coletor do BusinessMap

Propósito: parecer de segurança (R-SEGURANCA, gatilho de dado pessoal e texto livre na fronteira) sobre o K-084, que implementa os itens 4a, 4b, 4c, 4d e 4f da ADR 0020 e responde aos achados M-1, M-2 e M-3 do parecer `docs/security/adr-0020-protecao-de-pessoa.md`. Público: node-backend (autor), tech-lead (code review em paralelo), qa-engineer, Jarvis.

**Veredito: aprovado.** Os três caminhos de pessoa e texto livre para a staging apontados no parecer da ADR (M-1, M-2, M-3) estão fechados no código revisado, e o 4b está atendido. Não sobra nenhum caminho de id de pessoa, autor, `discard_comment` ou descrição para `stg_card`, `stg_revision` ou `stg_webhook_evento`. Os achados abaixo são de severidade baixa ou informativa. Três deles são **pré-condição dos próximos cartões do coletor** (cliente da API, worker de coleta, demais `stg_`), não deste.

**Revisado:** worktree `MetricasDSPD-k084`, `git diff origin/develop...HEAD` (b5ac4f5..5352a67): `server/src/modulos/businessmap/allow-list.ts`, `responsaveis.ts`, `staging.ts`, `webhook.ts`, `index.ts`, os testes `allow-list.test.ts`, `responsaveis.pg.test.ts`, `webhook.test.ts`, `webhook.pg.test.ts`, `staging*.test.ts`, e `docs/contratos/fontes.md`. Contexto: `server/migrations/0004_bm_staging.ts`, `server/src/plataforma/log.ts`, `server/src/plataforma/erros.ts`, `server/src/plataforma/db/lgpd.ts`, `server/src/entradas/worker.ts`, `docker-compose.yml`, `docker-compose.homolog.yml`.

## Achados do parecer da ADR, um a um

| Achado | Situação no K-084 | Evidência |
|---|---|---|
| **M-1** `stg_card` com o card inteiro | **Fechado.** `gravarStgCard` recebe o objeto da API e grava só `registroCard(card)`: escalares de `CAMPOS_CARD`, `block_reason` reduzido a `block_reason_id`, `child_card_stats` só com números e booleanos, `linked_cards` reduzidos a `(card_id, link_type)`, `custom_fields` por domínio. Valor não escalar numa chave permitida (por exemplo `title` como objeto) é descartado. `discard_comment`, `description`, `owner_user_id`, `co_owner_ids`, `reporter`, `subtasks` e o resto não têm entrada. A segunda camada da ADR (`fields=` no pedido à API) ainda não existe porque o cliente da API não existe (I-2). | `allow-list.ts:14-19, 66-83`; `staging.ts:29-30, 41`; `allow-list.test.ts:48-79, 115-124`; `responsaveis.pg.test.ts:17-34` (papel real `dspd_coletor`) |
| **M-2** webhook grava o corpo bruto | **Fechado.** `receberWebhook` grava `registroWebhook(payload)` (tipo, ids de card, quadro, fluxo, coluna e raia atual e anterior, instante). O corpo bruto não é gravado. O `payload_sha256` continua sendo o do corpo bruto, como pede a ADR 4f(c). Tipo fora de `TIPOS_EVENTO_WEBHOOK` recebe 202 e não grava nada (nem a outbox). O log leva só o tipo, e só se ele tiver forma de identificador (`TIPO_SEGURO`). O formato real do webhook ainda não foi lido (I-1). | `allow-list.ts:100-129`; `webhook.ts:38-56, 83-84`; `webhook.test.ts` (M-2, dois casos); `allow-list.test.ts:148-179` |
| **M-3** `stg_revision` sem lista fechada | **Fechado.** `CAMPOS_REVISAO` é a lista do item 4c. `troca_responsavel` vem calculado pelo chamador, e `user_id`, `owner_user_id`, `co_owner_ids` e `subtasks` não entram. O teste com Postgres real confere o `payload` gravado, campo a campo. `fato_transicao.usuario` não é gravado por nenhum código novo, o que está coerente com a R-2 pendente. | `allow-list.ts:22, 86-98`; `staging.ts:56-67`; `responsaveis.pg.test.ts:36-44` |
| **4b** responsáveis fora da staging | **Atendido.** `extrairResponsaveis` lê os ids em memória. `gravarResponsaveis` grava só em `dim_card.responsaveis` (UPDATE na projeção) e em `dim_card_versao.responsaveis` (INSERT de uma versão nova, copiada da vigente). As duas colunas estão em `COLUNAS_PESSOA` (`lgpd.ts:12-13`), e o `dspd_api` não as lê. `null` não sobrescreve nada. Ainda falta ligar o "na mesma execução" ao coletor (I-2). | `allow-list.ts:135-145`; `responsaveis.ts:27-44`; `responsaveis.pg.test.ts` |
| **B-1** (parecer da ADR) teste só com a constante | **Atendido.** `PROIBIDOS` está escrito à mão no teste, há um fixture com as chaves do schema mais chaves desconhecidas, e o marcador é procurado em todos os níveis. | `allow-list.test.ts:11-46` |
| **B-5** campo customizado | **Atendido no código.** Sem entrada no mapa de domínios, o campo não entra. Valor fora do domínio vira `desconhecido`. O mapa vem vazio por padrão, e a confirmação do tipo do "Time responsável" continua no spike. | `allow-list.ts:48-63`; `allow-list.test.ts:81-93` |
| **B-4** (parecer da ADR) erro e log | **Parcial.** O receptor está coberto: o log leva só o tipo, e o erro 500 não leva detalhe. O caminho de erro do coletor ainda não existe. Ver B-K2. | `webhook.ts:84`; `erros.ts:41, 48` |

## Ainda há caminho de pessoa ou texto livre?

- **Staging (`stg_card`, `stg_revision`, `stg_webhook_evento`):** não, para id de pessoa, autor, `discard_comment`, descrição e subtarefas. O que é texto e continua entrando por decisão: `title`, provisório pela decisão L-2 do usuário, e `custom_id`, que a ADR 4a lista e que no BusinessMap é digitado por pessoas (I-4). Fora isso, uma chave permitida pode receber uma string arbitrária se o formato real for diferente do esperado (B-K1).
- **Demais `stg_` do BusinessMap (`stg_bloqueio`, `stg_custom_field`, `stg_vinculo`, `stg_coluna`):** hoje ninguém escreve nelas (grep de `INSERT` em `server/src`). Elas têm `payload jsonb`, mas não têm allow-list nem lista na ADR (B-K3).
- **Log:** o receptor registra só o tipo do evento. O Fastify não registra o corpo, e o `redact` cobre o segredo do webhook (`log.ts:8`). O worker ainda não coleta (`worker.ts:16-18`, `tarefas: []`).
- **Erro:** o caminho futuro de erro do coletor pode levar um trecho do registro, incluindo o `title` (B-K2).

## Suposições do autor

1. **Formato do webhook assumido (`evento`, `card.id`, `anterior`, `timestamp`).** Aceitável do ponto de vista da segurança, porque falha fechado: se o formato real for outro, `registroWebhook` devolve `null`, nada é gravado e a resposta é 202. Do ponto de vista funcional, o risco é perder eventos em silêncio (I-1).
2. **Hash de dedupe sobre o registro filtrado (`stg_card`, `stg_revision`).** Concordo, e é melhor que o hash do bruto: mudança só em campo fora da lista não gera versão nova, e o hash não depende de dado pessoal. No webhook, o hash continua sendo o do corpo bruto (ADR 4f(c)). Um SHA-256 de um corpo inteiro com instantes e ids não permite, na prática, confirmar um palpite sobre o conteúdo. Informativo.
3. **`gravarResponsaveis` faz insert append-only em `dim_card_versao`.** Confirmado: só há `INSERT ... SELECT` da versão vigente com `ON CONFLICT DO NOTHING`, sem `UPDATE` nem `DELETE` em `dim_card_versao`. O `UPDATE` vai só em `dim_card`, que é projeção. Vai ao tech-lead uma observação funcional, não de segurança: se `vigente_de` colidir com a versão existente, `dim_card` é atualizado e a versão não, e as duas divergem.

## Achados do K-084

### Baixa

**B-K1. Strings em chaves permitidas não têm forma validada**
- Evidência: `allow-list.ts:10-11, 31-33` (`ehEscalar` aceita qualquer string, sem limite de tamanho); `allow-list.ts:112-119` (ids do webhook aceitam qualquer string); `allow-list.ts:121-122` (`instante` aceita qualquer string de até 40 caracteres); `allow-list.ts:37` (`link_type`).
- Caminho: não há atacante externo, porque o webhook exige segredo e o coletor lê a API com apikey. O caminho é o formato real ser diferente do assumido, que é justamente a suposição 1. Uma chave permitida (`card_id`, `timestamp`, `link_type`) passa a trazer texto, e esse texto vai para uma tabela append-only.
- Correção mínima: validar a forma, não só o tipo. Ids como inteiro ou `^[A-Za-z0-9_-]{1,64}$`; instantes em ISO 8601; `link_type` num conjunto fechado; datas de card (`deadline`, `*_time`) em ISO 8601. Valor fora da forma é descartado. Esforço P. Dono: node-backend. Pode entrar neste cartão ou no do cliente da API, a critério do tech-lead.

**B-K2. O erro do Postgres sobre `jsonb` ecoa um trecho do registro (B-4 ainda aberto no coletor)**
- Evidência: `staging.ts:29, 41` (o `payload` vai como texto para `$4::jsonb`). Uma string com `\u0000` (ou com surrogate isolado) no `title` gera um erro do Postgres cujo `where`/CONTEXT traz `JSON data, line 1: ...` com o início do registro. O `pino` registra o objeto de erro inteiro (`erros.ts:48` na API; o worker usa o mesmo logger). O receptor do webhook já rejeita `\u0000` no corpo (`webhook.ts:80`), mas o coletor não.
- Caminho: alguém cola texto com um caractere de controle no título de um card. A coleta falha, e o trecho do registro (título, ids) vai para o log do worker e, se o catch copiar `err.message`/`where`, para `ctl_coleta_falha.erro`, que o `dspd_api` lê.
- Correção mínima: remover `\u0000` e surrogate isolado das strings em `registroCard`/`registroRevisao`; no catch do coletor, registrar só o código do erro (`err.code`), a entidade e o `id_origem` (ADR 0020, item 6); e o teste do marcador do item 7 da ADR (payload inválido com marcador, que não pode aparecer no log nem em `ctl_coleta_falha`). Esforço P. Dono: node-backend. **Pré-condição do cartão do worker de coleta.**

**B-K3. `stg_bloqueio`, `stg_custom_field`, `stg_vinculo` e `stg_coluna` não têm allow-list**
- Evidência: `server/migrations/0004_bm_staging.ts:26-29` (`payload jsonb` nas quatro); `allow-list.ts` não tem constante para elas; a ADR 0020, item 4a, deixa `block_times` e `transitions` "depois do spike" e não enumera as definições de campo customizado.
- Caminho: o próximo cartão grava o bloqueio (com o comentário e o `user_id` de quem bloqueou) ou a definição de um campo customizado de tipo usuário (com as opções, que são nomes) do jeito que veio da API, como fazia o `gravarStgCard` antigo.
- Correção mínima: (a) a ADR declara "negado por padrão": `stg_` sem lista enumerada na ADR não recebe escrita; (b) um teste estrutural falha se algum `INSERT INTO ...stg_` em `server/src` não passar por uma função `registro*` de `allow-list.ts` (grep no teste, como o de catálogo). Esforço P. Dono: software-architect (a), node-backend e qa-engineer (b). **Pré-condição do primeiro cartão que escrever numa dessas tabelas.**

### Informativa

**I-1. O webhook falha fechado com um formato que ainda não foi lido.** Pelo lado da segurança, está certo. Pelo lado funcional, se o BusinessMap não mandar `evento: "card_moved"`, todo evento é ignorado com 202, e o único rastro é uma linha de log `info`. Sugestão ao tech-lead e ao QA: um contador de ignorados por tipo, e revisar `TIPOS_EVENTO_WEBHOOK` e `registroWebhook` (com nova leitura deste parecer) quando o artigo de webhooks for lido.

**I-2. Faltam duas partes da ADR, por falta de chamador.** O `fields=` restrito no pedido à API (4a) e a garantia de que `extrairResponsaveis` e `gravarResponsaveis` rodam na mesma execução que `gravarStgCard` (4b) dependem do cliente e do worker de coleta, que não existem. Ficam como critério de pronto desses cartões.

**I-3. `docs/contratos/fontes.md:16` contradiz o código.** A linha "Formato real do payload do webhook" ainda diz "o corpo é guardado como veio (`jsonb`)". Corrigir para "só o registro da allow-list (ADR 0020, 4f); o hash é o do corpo bruto". Dono: node-backend.

**I-4. `custom_id` é texto digitado por pessoas no BusinessMap.** Está na lista da ADR (4a), como o `title` (L-2), e por isso não é achado deste cartão. Fica registrado para a releitura da ADR: se o spike mostrar que `custom_id` é texto livre (e não um código gerado), ele merece o mesmo aviso do título, ou a forma validada de B-K1.

**I-5. Ferramentas.** Revisão estática do diff e `grep`; nada foi executado contra sistema algum. `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH (lacuna registrada; o diff não mexe em dependências nem em configuração). Nenhum segredo apareceu no diff. `forge-check docs` validou o formato deste arquivo.

## Dados antigos (recomendação; a decisão de expurgo é do usuário)

Antes do K-084, `gravarStgCard` gravava o objeto inteiro e o receptor gravava o corpo bruto. Qualquer linha já existente em `stg_card` ou `stg_webhook_evento` pode ter `discard_comment`, descrição, ids de responsável e autor. As tabelas são append-only, com trigger que impede `DELETE`/`UPDATE` (`0004_bm_staging.ts`, `appendOnly`).

**Exposição provável: baixa.** O worker nunca coletou (`worker.ts:16-18`, `tarefas: []`), nenhum seed ou script grava em `stg_` (grep em `*.ts`), o webhook está desligado em homologação (`docker-compose.homolog.yml:43`) e, no ambiente de desenvolvimento, só liga com `WEBHOOK_BM_SEGREDO` no `.env` (`docker-compose.yml:44-45`). Mesmo assim, "provável" não basta para LGPD. Fica o levantamento abaixo, feito pelo dono do ambiente com o papel `dspd_migrador`, só em leitura. O resultado é registrado por contagem e por nome de chave, nunca pelo valor.

**O que levantar:**
1. Contagem de linhas de `stg_card`, `stg_revision`, `stg_webhook_evento`, `stg_bloqueio`, `stg_custom_field`, `stg_vinculo` e `stg_coluna`, por esquema (incluindo os esquemas com prefixo de teste).
2. Para cada tabela com linhas: as chaves de primeiro nível presentes (`SELECT DISTINCT jsonb_object_keys(payload)`), e quantas linhas têm alguma chave fora da allow-list atual, em especial `discard_comment`, `description`, `owner_user_id`, `co_owner_ids`, `user_id`, `reporter`, `author`, `text`, `user` e `subtasks`.
3. Origem dessas linhas: se vieram de teste (ids gerados por `unico()`, marcadores) ou de card real (ids de quadro reais, `coleta_id` de uma coleta manual). Linha de teste não é dado pessoal.
4. Se algum dia o webhook do BusinessMap (WS1) foi apontado para alguma máquina: confirmar com quem configura o BusinessMap.
5. Cópias fora do banco: dumps, backups e volumes Docker antigos (`pg_dump` feitos para homologação ou testes de migração a partir da `main`).

**Em quais ambientes:**
- Desenvolvimento local de cada pessoa do time (volume do `docker-compose.yml`), principalmente se alguém já ligou o webhook ou fez uma coleta manual contra o BusinessMap real.
- Homologação local (`pnpm run homolog:subir`), incluindo os volumes e os dumps usados no teste de migração a partir da `main`.
- Qualquer banco compartilhado ou de produção, se existir; não encontrei evidência de um.
- O CI não precisa de levantamento: o banco é efêmero por execução. Vale confirmar só que nenhum artefato ou cache do CI guarda dump.

**Se aparecer dado real:** a decisão é do usuário (R-DECISAO), com estas opções: (a) recriar o ambiente do zero, se ele for descartável, que é o caso esperado para desenvolvimento e homologação local; (b) expurgo por migração explícita, com o papel migrador e o trigger de append-only suspenso só nessa migração, registrado em ADR, porque contorna a regra "nunca sobrescrever histórico"; (c) manter, como risco aceito registrado. Nada disso é feito por agente sem a resposta do usuário (R-CONFORMIDADE).

## Riscos aceitos
Nenhum. A decisão sobre dados antigos, se o levantamento achar dado real, vai ao usuário.

## Plano em cartões (para o Jarvis)
| Cartão | Achado | Dono | Quando |
|---|---|---|---|
| Validação de forma nas chaves permitidas | B-K1 | node-backend | neste cartão ou no do cliente da API |
| Saneamento de `\u0000`, catch do coletor só com código, teste do marcador | B-K2 | node-backend, qa-engineer | pré-condição do worker de coleta |
| "Negado por padrão" para `stg_` sem lista na ADR, e teste estrutural dos `INSERT` em `stg_` | B-K3 | software-architect, node-backend | pré-condição do primeiro cartão de bloqueio, campo customizado ou vínculo |
| `fields=` e "mesma execução" do 4b como critério de pronto | I-2 | tech-lead | cartões do cliente e do worker |
| Corrigir `docs/contratos/fontes.md:16` | I-3 | node-backend | neste cartão (ou no próximo) |
| Contador de webhooks ignorados; revisar o formato quando for lido | I-1 | tech-lead, qa-engineer | quando o formato for lido |
| Levantamento de dados antigos e decisão de expurgo | Dados antigos | Jarvis → usuário (dono de cada ambiente executa) | antes da primeira coleta real |
