# 0025 - Coleta do worklog do BusinessMap: `GET /loggedTime` incremental por lista de cards, com histórico de edição e exclusão

Estado: proposta (passa a vigente com a leitura do `security-engineer`, PE-2 do plano 059, e com os itens marcados `[SPIKE]` confirmados pelo spike E2.3). Data: 2026-11-01.
Propósito: fixar de onde e como o worklog (apontamentos de horas) do BusinessMap entra na base, sem sobrescrever histórico e sem levar pessoa nem comentário à staging. Público: node-backend, security-engineer, tech-lead, qa-engineer. Revisão: 2026-12-01.

- Origem: pedido 059 (aba Apontamento, K-193), plano `docs/architecture/features/059-aba-apontamento.md` §3.1, §3.2 e §7; modelo de ameaças `docs/security/059-aba-apontamento-ameacas.md` (AP-4, AP-6, AP-7).
- Relacionadas: ADR 0015 (cliente HTTP de lista fechada), ADR 0020 (revisão 4, item 4h: allow-list do apontamento, chave opaca, papel da aba), ADR 0022 (polling como fonte de verdade, coleta só na máquina do dono, carga inicial manual de 12 meses, staging negado por padrão).

## Contexto
- A aba Apontamento precisa de horas apontadas por pessoa, por card e por dia, com edição e exclusão refletidas, e de uma classificação do comentário (subgrupo e qualidade). A especificação do dono parte de um export CSV substituído a cada carga, que perde editados e removidos (C-1 e C-2 do plano) e contraria a regra de carga incremental sem sobrescrever histórico.
- Fato lido na OpenAPI pública do BusinessMap (`demo.kanbanize.com/openapi/json`, 2026-11-01; plano 059, topo):
  - `GET /loggedTime`: filtros `card_ids`, `parent_card_ids`, `user_ids`, `category_ids`, `include_logged_time_for_subtasks`, `from_date`/`to_date` (data do apontamento), `logged_from`/`logged_to` (quando foi registrado), `page`, `per_page` (até 1000), `fields` com lista fechada (`logged_time_id`, `parent_card_id`, `card_id`, `subtask_id`, `lane_id`, `column_id`, `user_id`, `category_id`, `date`, `time`, `comment`, `logged_at`). **Não há filtro por quadro.** `time` em segundos.
  - `GET /loggedTime/history`: eventos `logged_time_created`, `logged_time_updated`, `logged_time_deleted`, `logged_time_transferred_to_card_after_subtask_deleted`, `logged_time_updated_after_subtask_converted_to_card`; filtros `logged_time_ids`, `card_ids`, `user_ids`, `event_types`, `from`/`to`, `per_page` até 200. Campos do evento `[NÃO LIDO]`.
  - `GET /loggedTimeCategories`: catálogo de categorias de tempo.
- O card já coletado traz `logged_times`, mas a ADR 0020 item 4a o deixa fora (pessoa e texto livre, sem chave por apontamento), e a ADR 0022 item 3 nega gravação em `stg_` sem lista fechada registrada.
- Restrições herdadas: cota de 30/min e 600/h compartilhada com a coleta de cards (limitador local ≤ 25/min); coleta real só na máquina do dono, chave no `.env` local (ADR 0022 item 5); carga inicial só manual, com o dono presente (ADR 0022 item 4); cliente só GET de lista fechada (ADR 0015).

## Decisão
1. **Fonte.** O worklog vem de `GET /loggedTime` e `GET /loggedTime/history`, pelo cliente HTTP da ADR 0015, com os dois caminhos na lista fechada `CAMINHOS_PERMITIDOS`, só GET, `fields` de valor fixo (ADR 0020, R4-2) e consulta própria de cada caminho (datas, listas de id de até 200, `event_types` de lista fechada). Nada de `/loggedTime/{id}` nem outro método. `GET /loggedTimeCategories` só é lido no spike; entra no cliente com a melhoria M-1 (categoria como fonte do subgrupo), fora deste prazo.
2. **Escopo pela lista de cards, nunca pela conta inteira.** As duas rotas são chamadas **sempre** com `card_ids`, em lotes de até 200, tirados de `dim_card` no escopo da aba (Q-A1 pelo bloco do dono: os 7 quadros do 052 com todos os workflows, menos os fora de todo cálculo, H-7), em todos os estados (ativo, arquivado, descartado), com `include_logged_time_for_subtasks=1`. Chamada sem `card_ids` é recusada pelo cliente. Motivo: sem filtro por quadro, a rota devolveria o worklog de pessoas de outras áreas (minimização).
3. **Execução e marca d'água.** Fonte própria `bm_apontamento` em `ctl_coleta`. Roda na mesma execução da coleta de cards, depois dela, sob a mesma trava de fonte, e não roda se a de cards falhou (precisa de `dim_card` atual para o escopo e a hierarquia). Agendamento: o da coleta de cards (diária às 06:00, ADR 0022), só na máquina do dono; homologação e CI só contra servidor falso.
4. **Novos e editados (incremental, com sobreposição de 1 h).**
   - (a) `GET /loggedTime` por lote de cards com `logged_from = marca d'água − 1 h`: apontamentos registrados desde a última execução.
   - (b) `GET /loggedTime/history` por lote de cards com `from = marca d'água − 1 h` e `event_types` de edição e transferência (`logged_time_updated`, `logged_time_transferred_to_card_after_subtask_deleted`, `logged_time_updated_after_subtask_converted_to_card`): devolve os cards afetados, que são relidos em `/loggedTime` sem filtro de data `[SPIKE: campos do evento]`.
   - Cada registro passa pela allow-list e pela classificação na fronteira (ADR 0020, R4-2) e vira linha em `stg_apontamento`, append-only, com `UNIQUE (logged_time_id, registro_sha256)`: a mesma versão relida não duplica; versão nova vira linha nova. Nunca `UPDATE` nem `DELETE` na staging.
5. **Exclusões, sem apagar nada.**
   - `logged_time_deleted` no histórico (por lote de cards, mesma janela) vira linha em `evt_apontamento` com `tipo = excluido_origem` `[SPIKE: o evento traz logged_time_id]`.
   - Rede de segurança: varredura semanal de presença por lote de cards com `from_date = hoje − 90 dias` (padrão de `stg_card_presenca`); apontamento ativo da janela que não volta da origem vira `excluido_detectado`. Se o spike mostrar que o evento de exclusão não traz o id, a varredura é o único caminho e não pode ser cortada (corte C-3 do plano).
   - `fato_apontamento` marca `excluido_em` e o apontamento sai das somas da aba (Q-A2 pelo bloco); a staging e os eventos ficam.
6. **Projeção e pessoa na mesma execução.** O `user_id` de cada apontamento fica só em memória (mapa `logged_time_id → user_id`) e é resolvido para `dim_responsavel.pessoa_ref` (ids novos ou com mais de 30 dias por `GET /users`, R3-1); o projetor grava `fato_apontamento` (última versão de cada `logged_time_id`, `iniciativa_card_id` por `dim_card_raiz`, `pessoa_ref`) para **todos** os apontamentos lidos na execução, inclusive versões já presentes na staging. A marca d'água só avança depois da projeção com pessoa; execução que falha entre a staging e a projeção é relida pela sobreposição na seguinte. Reconstruir o fato a partir da staging preserva `pessoa_ref` (ADR 0020, R4-4).
7. **Carga inicial.** Comando manual (`pnpm` do server), nunca agendado, na máquina do dono e com ele presente: `from_date = hoje − 12 meses` (Q-A6 pelo bloco), por lotes de cards, **retomável por lote** (último lote concluído em `ctl_coleta`), sob o mesmo limitador e em exclusão mútua com a coleta de cards. Período mais antigo pode vir depois pelo mesmo comando, sem alterar o gravado.
8. **Erros.** 401 e 403 interrompem sem nova tentativa (A2 do 052); 429 e 5xx seguem a política de tentativas do cliente; registro fora da validação da fronteira vai a `ctl_coleta_falha` só com código, entidade e `id_origem` (ADR 0020 item 6) e a coleta fecha `parcial`, sem derrubar o resto. Soma diária acima do limite não é recusada: vira a flag `valor_atipico` na projeção.
9. **Custo esperado.** Por execução diária: `ceil(cards do escopo / 200)` chamadas para (a), outro tanto para (b) e para as exclusões do histórico, mais as páginas e as releituras dos cards editados. Com alguns milhares de cards, dezenas de chamadas, dentro do limitador; a varredura semanal soma outro `ceil(N/200)`. Lido em `ctl_coleta` a cada execução (critério de reversão).

## Alternativas
- **Export CSV manual (especificação do dono):** rejeitada. Substitui a base a cada carga, perde editados e removidos e não tem chave por apontamento (C-1, C-2, C-4 do plano).
- **`logged_times` no card (`expand` de `/cards`):** rejeitada. Está fora da allow-list 4a da ADR 0020 (pessoa e texto livre), não tem histórico de edição nem evento de exclusão, e alargaria a lista do card só para a aba.
- **`/loggedTime` sem `card_ids`, filtrando o escopo em memória:** menos chamadas, mas lê o worklog da conta inteira, com pessoas de outras áreas, sem necessidade; rejeitada pela minimização. Volta à mesa só se o custo por lote passar do critério de reversão.
- **Só `logged_from` (sem o histórico):** rejeitada; não vê edição de apontamento antigo nem exclusão, e a aba mostraria horas que não existem mais.
- **Releitura completa dos 12 meses a cada execução:** pega edição e exclusão sem depender do histórico, mas multiplica as páginas por execução contra a cota de 600/h compartilhada; fica como plano B se o spike mostrar que o histórico não serve para nada (nem para card afetado).
- **Webhook de worklog:** fora; o webhook do BusinessMap segue condicionado pela ADR 0022 item 2.

## Consequências
- **Melhora:** o histórico de edição e exclusão é preservado (staging append-only e eventos), cumprindo a carga incremental sem sobrescrever; a chave natural `logged_time_id` acaba com a deduplicação por combinação de campos; a staging do worklog não tem pessoa nem texto livre; o escopo por cards limita a leitura de pessoas às do escopo da aba.
- **Piora:** a coleta diária fica mais longa e consome cota compartilhada; a releitura por card editado depende do histórico; reclassificar apontamentos antigos depois de mudar o dicionário exige reler a API pelo período (custo da carga inicial), porque o comentário não é guardado (P-8 pelo bloco do dono); refazer o vínculo com pessoa também exige reler a API.
- **A manter:** toda chamada ao worklog com `card_ids`; marca d'água só avança depois da projeção com pessoa; qualquer campo novo do worklog passa pela ADR 0020 (item 4h) antes do código; coleta real só na máquina do dono enquanto a ADR 0022 item 5 valer.

## Por que o existente não basta
Mecanismo novo: dois caminhos no cliente HTTP, a fonte `bm_apontamento` com marca d'água própria e as tabelas `stg_apontamento` e `evt_apontamento`. O existente para a mesma necessidade, e onde para:
- **Coleta de cards (`/cards`, F2 e F3 do 052):** não traz o worklog utilizável. `logged_times` está na lista "ficam fora" do item 4a da ADR 0020 e a doc de integração manda evitá-lo (`docs/integracao/businessmap-api-configuracao.md` §4.2); mesmo incluído, não tem chave por apontamento nem evento de exclusão.
- **Cliente HTTP de lista fechada (ADR 0015, `server/src/plataforma/http.ts`):** recusa qualquer caminho fora de `CAMINHOS_PERMITIDOS`, que hoje não tem `/loggedTime` nem `/loggedTime/history` (CA-3 do 052); é reaproveitado, só ganha as entradas.
- **Staging do BusinessMap:** a ADR 0022 item 3 nega gravação em `stg_` sem lista fechada em ADR, e nenhuma tabela existente tem a forma do apontamento (`stg_card` é por card e versão; `stg_revision` é por transição).
- **`ctl_coleta` e a varredura de presença (`stg_card_presenca`):** são reaproveitadas como padrão (marca por fonte, sobreposição de 1 h, varredura semanal); a fonte nova é só uma linha a mais.

## Critério de reversão
Rever o escopo por lista de cards se `ctl_coleta` mostrar, em qualquer execução diária da fonte `bm_apontamento`, mais de 300 chamadas à API (metade da cota horária). Fatos derivados que também levam à revisão: o spike mostrar que `/loggedTime` não aceita `card_ids` ou `logged_from` como documentado (a forma de incremental muda e a decisão volta ao time e à segurança), ou que o evento `logged_time_deleted` não traz `logged_time_id` e a varredura semanal também não detecta a exclusão de um apontamento de teste em uma semana.

## Leituras
| Data | Medida | Veredito (manter, ajustar, reverter) |
|---|---|---|
| 2026-11-01 | Proposta a partir da OpenAPI pública; spike E2.3 ainda não rodou; nenhuma chamada de worklog feita; nenhum código | pendente; leitura do security-engineer (PE-2) e confirmação dos itens `[SPIKE]` |
