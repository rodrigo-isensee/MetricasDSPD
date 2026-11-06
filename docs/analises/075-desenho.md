# 075: desenho dos bloqueios reais na coleta do BusinessMap (E1.1, K-204)

Autor: software-architect, 2026-11-06. Só leitura no checkout da develop `/home/rodrigoisensee/MetricasDSPD-056d` (HEAD f21220fe); nada executado contra API ou base. Caminhos abaixo são relativos a esse checkout. Vias A, B e C com os mesmos nomes do modelo de ameaças (`docs/security/075-modelo-ameacas.md` §2).

## 1. O que a coleta já traz
- Pedido à API: `fields=` inclui `is_blocked`, `current_block_time` (`allow-list.ts:16-21`, `CAMPOS_CARD`) e `block_reason` (`coleta.ts:33`, `CAMPOS_PEDIDO_CARDS`).
- Na fronteira, `block_reason` é reduzido a `block_reason_id` (`allow-list.ts:98-99`); rótulo, comentário e autor são descartados (teste em `server/tests/allow-list.test.ts:27`).
- Destino: `stg_card`, append-only com dedupe por hash; cada mudança no card (inclusive bloquear e desbloquear) gera nova versão. São **instantâneos**, não eventos.
- Histórico: `expand=block_times` está fora de propósito (`coleta.ts:35` e `:38`, `EXPAND_COLETA` sem ele; ADR 0020 item 4c "fica fora até a F3b"). `stg_bloqueio` existe (`migrations/0004_bm_staging.ts:29`) mas segue negada por padrão (ADR 0022 item 3; revisão 5 da ADR 0020 nunca escrita).
- Ninguém projeta bloqueio: `projetor.ts` e `normalizador.ts` não citam `block`/`bloque` (grep). `fato_bloqueio` (`0006_bm_projecoes.ts:32-38`) e `evt_bloqueio` (`0005_bm_historico.ts:49-53`) só recebem linha do seed (`plataforma/db/seed.ts:114`). Base real: 0 e 0 (064, Q01 e Q02).

## 2. O que falta (pedir à API ou confirmar)
- **Semântica de `current_block_time`**: duração (o duble usa `120`) ou instante? Unidade? Sem isso, o início do bloqueio aberto não sai do instantâneo. Confirmar com 1 card real bloqueado (spike F1 sem pessoa), não por inferência.
- **Se bloquear/desbloquear altera `last_modified`**: a coleta incremental lê por `last_modified_from` com sobreposição de 1 h (`coleta.ts:22`). Se não alterar, a via A perde eventos.
- **Domínio de `reason_id`**: lista de motivos do quadro (`/blockReasons` ou equivalente), para mapear aos 7 motivos fechados do briefing §4.4 (`MOTIVOS_BLOQUEIO`, usado por O19 e T12).
- **Via B (`block_times`)**: forma real dos itens (instantes, motivo, coluna?) ainda não anexada; o spike F1 guardou a saída fora do clone. Traz comentário e autor (exige revisão 5 da ADR 0020 antes do código).

## 3. Proposta: via A como base, B só se o dono exigir o passado ou a precisão
**Projeção (no projetor, não na coleta; mesma transação da F4):**
1. Por card, percorrer as versões de `stg_card` em ordem de coleta. Passagem `is_blocked` falso→verdadeiro (ou primeira versão já bloqueada) gera `evt_bloqueio` tipo `inicio`; verdadeiro→falso gera `fim`. Troca de `block_reason_id` com o card ainda bloqueado: pergunta P-075-3b.
2. `evt_bloqueio.id_origem` = hash determinístico de (`card_id`, `revision` ou `last_modified` da versão que abriu), como o `revisionIdDaTransicao` (`allow-list.ts:147-153`); `uq_evt_bloqueio (card_id, id_origem, tipo)` torna a reprojeção idempotente (`ON CONFLICT DO NOTHING`). `motivo_codigo` = código do `ref_dominio` para o `reason_id`; `coluna_id` = `column_id` da versão; `fornecedor_codigo` conforme P-075-4.
3. `fato_bloqueio` = par início/fim de `evt_bloqueio`; aberto com `fim` nulo. É `PROJECAO` (`grants.ts:53`): fechar o bloqueio atualiza a linha; o histórico imutável fica em `evt_bloqueio` (`IMUTAVEL`, `grants.ts:54`). Assim "nunca sobrescrever histórico" vale.
4. `duracao_horas_uteis` só por `horasUteisEntre` da biblioteca (T2.5), nunca em SQL; recalculada quando o calendário muda, pela mesma regra do `cicloHU`.
5. Cards arquivados e descartados: a coleta já lê os três estados (`coleta.ts:24`), então o bloqueio deles fica na base. O que fazer com bloqueio aberto em card arquivado é P-075-5.
6. Mapa `reason_id`→motivo: novo campo `motivo_bloqueio` no `ref_dominio` pelo arquivo versionado (`bm:ref-sync`, pedido 069 L2-a), não constante no código. `reason_id` sem mapa vira `desconhecido` (como `allow-list.ts:88`).
7. Retroativo: reprojetar o `stg_card` já gravado desde a primeira coleta real dá os bloqueios vistos desde então, sem chamada nova à API.

**Via B** (se escolhida): `block_times` em `EXPAND_COLETA`, `registroBloqueio` com lista fechada (instantes, `reason_id`, coluna) gravando `stg_bloqueio`, teto de itens por card; o projetor prefere B a A quando houver os dois. Pré-requisito: revisão 5 da ADR 0020 lida pelo security-engineer.

## 4. Tela, O5 e contrato
- `packages/contratos/src/origem.ts`: `BLOQUEIOS_COM_DADO_REAL` (`:51`) vira `true`; BLOQUEADOS e O5 voltam a `METRICAS_ORIGEM_REAL` (`:25`) e saem de `MOTIVO_ORIGEM_MOCK` (`:83-84`); `METRICAS_COM_PARTE_DE_BLOQUEIO` (`:58`), a nota `bloqueio-sem-dado-real` (`:151`, `:157`) e `semParteDeBloqueio` (`server/src/modulos/metricas/parte-sem-dado.ts`, chamado em `servico.ts:306-307`) saem. Leitura já existe (`repositorio.ts:74-79`, `mapa.ts:62-69`); O5 já desconta bloqueio (`packages/metricas/src/businessmap/o5.ts:33-40`). Nenhum cálculo novo.
- Os ramos "sem dado real" de BLOQUEADOS, O1, O2 e da faixa "Pede atenção" no web saem (065-desenho §5).
- **A tela muda (UX entra)** em dois casos, ambos dependentes de resposta do dono: (a) motivo `desconhecido` exige valor fora do enum de 7 (`MotivoBloqueio`), logo contrato e rótulo novos; (b) se o início na via A for aproximado (instante da coleta), o "bloqueado há N dias úteis" precisa de aviso de precisão. Sem (a) e (b), é só a remoção do "sem dado real".
- O5 com 12 semanas de janela: com histórico só a partir da primeira coleta, a janela fica incompleta até completar 12 semanas (P-075-6). Abaixo de 20 itens por tipo, a biblioteca já não publica (`estatistica`).

## 5. Versão de critério (T2.6)
Sim: nova `VersaoCriterio` em `packages/metricas/src/core/criterios.ts` (ao lado de `criterio-2026-11-04-bloqueio-sem-dado-real`, `:115`), "bloqueio com dado real a partir de AAAA-MM-DD", `afeta` O1, O2, O5 e BLOQUEADOS (mais O19, T10 e T12 se P-075-8 os incluir). O O5 deve cair (tempo bloqueado sai da execução); o degrau fica marcado. Se a via for A, a versão registra também a regra do instante (P-075-2).

## 6. Impacto
- **Migração:** tabelas já existem. Provável uma migração só se o dono quiser marcar precisão (coluna `origem_instante` em `fato_bloqueio`/`evt_bloqueio`: `coleta` ou `historico`). Via B: nenhuma (usa `stg_bloqueio`), mas exige a revisão 5. GRANT inalterado (motivo e fornecedor são códigos, sem pessoa).
- **Testes:** unidade do derivador de eventos (abre, fecha, reabre, troca de motivo, card arquivado bloqueado, versão fora de ordem, reprojeção idempotente); `.pg` do projetor com `uq_evt_bloqueio`; `limpar-seed` (já cobre `fato_bloqueio`, `limpar-seed.ts:95`); contrato de `origem.ts`; E2E `*-api` dos cartões sem o "sem dado real" (casos Q65 invertidos); casos de abuso CA-075 do security-engineer.
- **Documentação:** `docs/api/metricas.md` §065 (`:56`, `:407-415`), `openapi.json` regenerado, `docs/integracao/businessmap-api-configuracao.md` §4.4 (`current_block_time`, `last_modified`), ADR 0020 (revisão 5 só na via B), `data-model.md` (regra de derivação), CHANGELOG, `064-lacunas-dado-real.md` L1.

## 7. Riscos
- R1. Via A não vê bloqueio que abre e fecha entre duas coletas; com a coleta **manual** (H-20 = C, `coleta.ts:15-17`), o furo pode ser de dias. Subestima O19, T10 e o tempo bloqueado do O5.
- R2. Instante do início/fim com erro de até um intervalo de coleta; mexe em "bloqueado há N dias" e no O5.
- R3. `last_modified` sem mudar no bloqueio faz a incremental perder eventos (verificar, §2).
- R4. `reason_id` sem mapa vira `desconhecido` em massa se o quadro usar motivos fora dos 7 do briefing (configuração WS1, feita por pessoas).
- R5. Primeira versão já bloqueada na carga: sem `current_block_time` confiável, o início é a data da coleta (subestima a duração).
- R6. Virar o interruptor sem prova de linhas reais repete a L1 (número que parece real). Critério: interruptor só depois de consulta do dono com `fato_bloqueio` > 0.

## 8. Perguntas ao dono (E1.3; nada disto foi decidido)
- **P-075-1 (via):** A (instantâneo já coletado, sem dado novo da fonte, perde bloqueios curtos e o passado) ou B (`block_times`, histórico completo, exige ADR e segurança antes)?
- **P-075-2 (instante, via A):** início e fim = instante da coleta que viu a mudança, `last_modified` da versão, ou derivado de `current_block_time`?
- **P-075-3 (motivo):** qual o mapa dos motivos do quadro para os 7 do briefing? Motivo sem mapa aparece como "não classificado" na tela ou o bloqueio fica fora das métricas por motivo? (3b) troca de motivo sem desbloquear é um bloqueio novo ou o mesmo?
- **P-075-4 (fornecedor):** o fornecedor do bloqueio é o campo `fornecedor` do card no início do bloqueio, no fim, ou outro?
- **P-075-5 (card arquivado/descartado/entregue bloqueado):** o bloqueio fecha no instante do arquivamento/entrega ou fica aberto?
- **P-075-6 (janela):** O5 e série do O1 voltam já com histórico parcial (com marca T2.6) ou só depois de 12 semanas de dado?
- **P-075-7 (cadência):** a coleta passa a ter agenda (hoje manual, H-20 = C) para a via A ter precisão diária?
- **P-075-8 (escopo):** O19, T10 e T12 entram no mapa real neste pedido ou em outro?
