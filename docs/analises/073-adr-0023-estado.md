# Pedido 073, E2.1: proposta de estado da ADR 0023 (sem commit)

Autor: software-architect. Data: 2026-11-05. Só proposta de texto; a edição da ADR 0023 é de um PR de documentação posterior. Base: ADR 0023 e CLAUDE.md como estão na develop (lidos na worktree MetricasDSPD-052c, mesmo conteúdo).

## 1. O que está registrado (evidência)

- **Decisão do dono sobre a fonte:** 2026-10-30, pedido 056, "B" (ler a tabela MySQL, só leitura). ADR 0023 criada em 2026-10-30 como proposta.
- **Decisão do dono sobre o texto do CLAUDE.md:** 2026-11-02, pedido 060, "A" (atualizar o CLAUDE.md para a leitura pelo MySQL da ADR 0023, só leitura, mantendo a allow-list). `docs/pedidos/060-triagem-dependabot.md` linha 105.
- **Texto entregue e revisado:** branch `docs/060-claude-md-acelerato`, commit `51078b115b20f3c979dbed1572473ef693ec7220` (E4.1, 2026-11-02 20:39); review aprovado em 2026-11-02 21:18 (`docs/reviews/060-claude-md-acelerato.md`, ponta 475862bddea4af09070ca2e526dc1897fa51fbea), que já recomendava A1: "ADR 0023 ainda como proposta"; QA aprovado 21:41 (A1 repetido).
- **PR:** PR 203 para a `develop`, ponta `dad55358e575887c97aee15b865ffa6c99cae00c`, aberto em 2026-11-02 22:02 (pedido 060, E4.3). Que o PR 203 já está na develop consta no brief `docs/briefs/063-worklog-cards-acima-do-teto-tech-lead-18.md` (E2.11: "a develop atual (com o 060 do web, PR 208, e o PR 203)"). O CLAUDE.md da develop traz hoje a regra pela ADR 0023.
- **Revisão da ADR em 2026-11-02 (§8, pedido 061, E2.1)** já trata a conta compartilhada e a coleta agendada como decididas pelo dono ("B", "B1", "A", "A").
- **Coleta com dado real pela tabela MySQL:** `docs/analises/064-lacunas-dado-real.md` (linha 81) mede S2 e S3 com dado real do Acelerato (318 fechados e 317 abertos em 84 dias, consultas Q23 e Q25), e o mapa `METRICAS_ORIGEM_REAL` (ADR 0028, Contexto) lista S2, S3, S4, S8 e S10 como reais. Isso mostra que a coleta pela tabela rodou.

## 2. Lacunas (viram pergunta, não texto)

- **P-0023-1:** a data e o SHA do merge do PR 203 na develop não estão em nenhum documento que li (o histórico do pedido 060 e o `docs/kanban/historico.md` param em "Aguardando o dono: mesclar o PR 203", 2026-11-02 22:02). Precisa de `gh pr view 203` ou `git log --merges`; o Jarvis ou o tech-lead confirma.
- **P-0023-2:** não achei registro de que o arquiteto ou o dono tenha "aceito" a ADR 0023 formalmente; o review e o QA do 060 só recomendaram. A aceitação é, de fato, o merge do PR 203 mais a decisão "A" do dono de 2026-11-02 (CLAUDE.md pela ADR 0023). O dono confirma que essa leitura basta, ou aceita a data do merge como data da vigência.
- **P-0023-3:** a primeira conexão real (E4.8) e o valor de `fora_organizacoes_recorte` constam como "pendente" nas Leituras. A tabela `ctl_coleta` do servidor interno é quem prova a coleta agendada; não consegui lê-la (sem Bash). Confirmar o primeiro `ctl_coleta` do Acelerato (data) e se foi no servidor interno ou na máquina do dono.

## 3. Cabeçalho novo proposto (linhas 3 e 4 da ADR 0023)

```
Estado: vigente desde <DATA DO MERGE DO PR 203, P-0023-1> (proposta em 2026-10-30). Data: 2026-10-30 (revisão 2026-11-02, pedido 061 E2.1: §1 item 2 e §6 frequência revistos pelo §8, coleta agendada no servidor interno com a conta compartilhada, sem host amarrado nem `REQUIRE SSL`; revisão de <data da edição>, pedido 073 E2.1: estado alinhado).
```

E um item novo, logo depois da linha `Propósito`, no molde da ADR 0028 ("Condição para passar a `vigente`"):

```
- **Condição para passar a `vigente`:** (1) a decisão do dono sobre a fonte (pedido 056, "B", 2026-10-30) e sobre a regra do `CLAUDE.md` (pedido 060, "A", 2026-11-02); (2) o `CLAUDE.md` da `develop` trazer a regra pela ADR 0023. **Cumprida em <DATA DO MERGE, P-0023-1>:** (1) decisões acima, com a conta compartilhada e a coleta agendada no §8 (pedido 061, 2026-11-02); (2) PR 203 (`dad55358e575887c97aee15b865ffa6c99cae00c`, texto de `51078b115b20f3c979dbed1572473ef693ec7220`) mesclado na `develop`. A coleta pela tabela já gera dado real no painel de sustentação (S2, S3, S4, S8, S10; `docs/analises/064-lacunas-dado-real.md`).
```

A frase sobre vigência fica só se P-0023-2 for confirmada; se o dono quiser outra data, vale a dele.

## 4. Trechos que ainda falam como proposta e o que trocar

| Local na ADR 0023 | Hoje | Trocar por |
|---|---|---|
| Linha 3, `Estado:` | "proposta" | cabeçalho da seção 3 |
| Linha 4, `Revisão: 2026-11-30` | mantém | manter (é a data da próxima leitura; não é estado) |
| Linha 12, Contexto, 1º item | "o que muda a regra do `CLAUDE.md` que mandava ler o Acelerato só pela API pública" | acrescentar no fim: "(regra mudada no `CLAUDE.md` pelo PR 203)" |
| §1 item 2 | "pedidos ao DBA antes da coleta agendada ... até lá vale o aceite do dono" (já com nota do §8) | sem troca: a nota *(Revisto em 2026-11-02, §8)* já cobre |
| §2, último item "Compatibilidade com o MySQL 8.0.35: a confirmar na primeira conexão real (E4.8)" | futuro | trocar só se P-0023-3 provar a conexão real: "confirmada em <data>"; senão, manter |
| §2 "Pontos para o parecer da E4.2" | futuro | trocar só com a evidência do parecer da E4.2 do 056 (não li); senão, manter |
| §4, "O texto final vai para `acelerato-mysql.sql` na E4.5" e "Na F1 e na F2" | futuro de plano | verificar se o arquivo existe e passou à E4.5; se sim, trocar por "está em ..." (fora do que li) |
| §6 "a primeira carga é manual, com o dono presente" | futuro | confirmar com P-0023-3 |
| Consequências, "`CLAUDE.md`: a regra nova (E2.1) não cita o TLS ... Esta ADR não edita o `CLAUDE.md`" | descreve o CLAUDE.md antes do PR 203 | trocar por: "`CLAUDE.md`: a regra vigente (PR 203) cita a tabela MySQL, a transação só de leitura e a ADR 0023; o TLS fixado e o filtro na origem ficam só nesta ADR (A1 do review do 056, mantido). Esta ADR não edita o `CLAUDE.md`." |
| Leituras, linha 2026-11-02 "primeira conexão real (E4.8) ... `fora_organizacoes_recorte` = ?" / "pendente" | pendente | preencher só com a medição do P-0023-3 (data, resultado); não inventar |
| Leituras | falta a linha de 2026-11-05 | acrescentar: `2026-11-05 | alinhamento do estado (pedido 073, E2.1): ADR vigente pelo PR 203 e pelas decisões do dono de 2026-10-30, 2026-11-02 | manter` |

O que **não** se troca: Decisão (§1 a §8), Alternativas, Critério de reversão e os pontos em "pendente" que dependem de fato ainda não medido. A "Por que o existente não basta" fica como está (o molde atual não a exige para o estado, mas ela já existe).

## 5. Fora desta proposta

A ADR 0013 (a §4 já está dita como substituída pela 0023) e o CLAUDE.md não mudam por esta proposta. Verificar, no PR da edição, se a 0013 já marca a §4 como substituída (não li).
