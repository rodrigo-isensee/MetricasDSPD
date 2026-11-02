---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: docs/059-apontamento-discovery
commit: 784659c5efb8eaabeb521772f2a21b105d1c32f8
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-01
---
# Review de modelagem: 059-aba-apontamento (§3.3 do plano, F2 do §7.2)

Escopo: tabelas, chaves, grants, `pessoa_ref`, `dim_card_raiz` e `ref_apontamento_*` do §3.3 de `docs/architecture/features/059-aba-apontamento.md` (linhas 105 a 116), lidos com a ADR 0025 (renomeada de 0024 nesta entrega), a revisão 4 da ADR 0020 e a convenção das migrações vigentes (`0020_bm_dim_responsavel.ts`: ids `text` com `CHECK` de dígitos, `DT()` para datas). Não há código nem migração nesta entrega; o parecer vale antes da A1 (migrações). `reprovado` quer dizer: A1 e A2 voltam ao arquiteto antes de a migração ser escrita; o resto entra na A1 como ajuste.

## Achados
- A1 (bloqueante) docs/architecture/features/059-aba-apontamento.md:109 · `evt_apontamento` sem chave natural: a sobreposição de 1 h do histórico (§3.2) relê o mesmo evento e duplica a linha. Definir UNIQUE (logged_time_id, tipo, id do evento de origem ou detectado_em truncado) e INSERT ON CONFLICT DO NOTHING.
- A2 (bloqueante) docs/architecture/features/059-aba-apontamento.md:110 · eliminação a pedido anula `pessoa_ref`, mas a recoleta (reconstrução ou apontamento relido) resolve o `user_id` em memória e recria o vínculo e uma nova `pessoa_ref`. Falta lista de supressão (tabela de chaves de origem eliminadas, hash com sal, lida pelo projetor) e o teste.
- A3 (recomendado) docs/architecture/features/059-aba-apontamento.md:108 · `registro_sha256` sem definição: calcular só sobre a allow-list gravada (nunca comentário nem user_id), senão vira hash do comentário (ADR 0020 4h). Registrar que edição só de comentário não gera versão.
- A4 (recomendado) docs/architecture/features/059-aba-apontamento.md:108 · tipos não declarados: seguir a convenção (ids `text` com CHECK de dígitos, `DT()` para datas); CHECK em `segundos` (1 a 86400), `qtd_palavras` (>= 0) e `flags_qualidade` (máscara dentro da lista fechada). Renomear a coluna `data` para `data_apontamento`.
- A5 (recomendado) docs/architecture/features/059-aba-apontamento.md:110 · sem índices: toda consulta da aba filtra por data e agrupa por pessoa ou iniciativa. Propor (data_apontamento) e (pessoa_ref, data_apontamento) e (iniciativa_card_id, data_apontamento), parciais com excluido_em nulo; índice em card_id e coleta_id na staging; registrar EXPLAIN.
- A6 (recomendado) docs/architecture/features/059-aba-apontamento.md:110 · `iniciativa_card_id` no fato duplica `dim_card_raiz.raiz_card_id`: duas fontes da mesma verdade. Ou o projetor grava as duas na mesma transação e há teste de igualdade, ou o fato não guarda e a consulta junta.
- A7 (recomendado) docs/architecture/features/059-aba-apontamento.md:111 · `pessoa_ref` identity: a ordem sequencial revela a ordem de descoberta; aceitável, mas declarar. Eliminação do titular fica com o `dspd_migrador` (como DT-3), não com o `dspd_coletor` sem DELETE e sem UPDATE de pessoa.
- A8 (recomendado) docs/architecture/features/059-aba-apontamento.md:112 · `dim_card_raiz`: índice em `raiz_card_id`; CHECK de profundidade máxima e proteção contra ciclo em `card_pai`; refeita por substituição por card na transação do projetor.
- A9 (recomendado) docs/architecture/features/059-aba-apontamento.md:113 · `ref_apontamento_*`: UNIQUE (termo_normalizado, subgrupo_codigo) e prioridade única; `versao_dicionario` na staging referencia `ref_versao_criterio`. O comentário não é guardado, então mudar o dicionário não reclassifica o passado sem nova carga: registrar e marcar o gráfico (T2.6).
- A10 (recomendado) docs/architecture/features/059-aba-apontamento.md:116 · `dspd_api_apontamento` lê `dim_responsavel` inteira (nomes de quem nunca apontou). Expor por view só das pessoas com apontamento no escopo, com GRANT na view e não na tabela; manter `responsavel_id` e `dim_card.responsaveis` fora do papel.
- A11 (recomendado) docs/architecture/features/059-aba-apontamento.md:106 · uma mudança por migração: separar em migrações próprias a coluna `pessoa_ref`, `dim_card_raiz`, a staging com eventos e fato, as `ref_*` e o papel com grants, cada uma com `down`. `ref_categoria_tempo` só nasce se a Q-A3 pedir.

## Parecer
Reprovado só pelos dois bloqueantes, que têm gatilho real e se resolvem no texto do plano, sem refazer a arquitetura: A1 (idempotência dos eventos, regra de modelagem do `engineering-practices`) e A2 (a eliminação a pedido, decisão do dono "A" de retenção, não se sustenta se a próxima coleta recria o vínculo). O desenho geral está certo: staging sem pessoa nem texto livre, fato como projeção com `pessoa_ref` opaca fora do gatilho, papel dedicado com GRANT por coluna e `dspd_api` sem leitura. Os demais achados são recomendações para a A1; nenhum devolve. Revalidar com `forge-check delta` sobre este parecer depois do ajuste do §3.3.

Fora deste review: segurança (parecer próprio do `security-engineer`, `docs/security/059-adrs.md`) e a forma final das colunas depois do spike (PE-1).
