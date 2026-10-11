# Contrato de dados (staging e analítico)

- **Propósito:** resumir o que a base garante a quem escreve e a quem lê: camadas, colunas de pessoa, paridade com a biblioteca, histórico e retenção. É um resumo com links; o detalhe vive em `docs/architecture/data-model.md`, que continua sendo a fonte (não duplicar).
- **Público:** node-backend, arquiteto, tech lead, QA.
- **Revisão:** 2026-10-11.
- **Fontes:** [`data-model.md`](../architecture/data-model.md) §1 a §9, migrações em `server/`, `server/src/plataforma/db/` (`lgpd.ts`, `grants.ts`, `ddl.ts`), ADR 0014.

## 1. Camadas e regra de escrita

| Camada | Prefixo | Escrita | Reconstruível |
|---|---|---|---|
| Staging | `stg_` | só INSERT (grant + gatilho) | não: é a fonte da verdade fora da ferramenta |
| Eventos e histórico | `evt_`, `dim_*_versao`, `fato_transicao`, `rec_` | só INSERT (grant + gatilho) | sim, a partir do staging |
| Projeções | `dim_card`, `fato_bloqueio`, `dim_chamado`, `fato_etapa_chamado` | substituição por entidade (`DELETE` + `INSERT` na mesma transação) | sim |
| Referência | `ref_` | INSERT de nova vigência; fechar vigência = `UPDATE (vigente_ate)` | arquivo versionado (`ref:sync`) |
| Controle | `ctl_` | INSERT; `UPDATE` por coluna só em `ctl_coleta` e `ctl_coleta_contagem` | não |
| Operacional | `outbox` (`dspd_core`) | ver [eventos.md](eventos.md) | não precisa |

`data-model.md` §1. O gatilho `dspd_core.proibir_alteracao()` bloqueia `UPDATE`, `DELETE` e `TRUNCATE` nas tabelas append-only para qualquer papel, inclusive o migrador (`server/src/plataforma/db/ddl.ts:48-49`). **Nunca sobrescrever histórico; cards arquivados e excluídos permanecem.**

Três schemas: `dspd_bm` (BusinessMap), `dspd_ac` (Acelerato) e `dspd_core`. Nenhuma FK nem chave lógica cruza `dspd_bm` e `dspd_ac` (`data-model.md` §2): as fontes nunca se misturam.

## 2. Colunas de pessoa

Fonte única: `server/src/plataforma/db/lgpd.ts`.

| Coluna permitida (`COLUNAS_PESSOA`, `lgpd.ts:11-15`) | Papel que lê |
|---|---|
| `dspd_bm.dim_card.responsaveis` | `dspd_coletor`, `dspd_migrador` |
| `dspd_bm.dim_card_versao.responsaveis` | idem |
| `dspd_bm.fato_transicao.usuario` | idem |

- `dspd_api` **não** tem `SELECT` nessas colunas (GRANT por coluna) nem em `stg_`; tentar ler falha com `42501`. Por isso `SELECT *` é proibido nos repositórios da API (`data-model.md` §9, garantia 2).
- Fora de `stg_`, qualquer coluna cujo nome tenha segmento de pessoa (`SEGMENTO_PESSOA`, `lgpd.ts:7-8`) e não esteja na lista nem em `EXCECOES_PESSOA` (`lgpd.ts:18-21`: `area_solicitante`, área organizacional) reprova no teste estático. Entrada nova nas listas exige alterar `data-model.md` §9 e revisão de modelagem (arquiteto + tech lead) e decisão do usuário.
- Nenhuma view, rota, DTO ou tela agrega, filtra ou exibe por pessoa. `DimCard.responsaveis` e `FatoTransicao.usuario` ficam fora dos tipos de `@metricas-dspd/metricas` e do mock.
- Solicitante, atendente e e-mail do Acelerato: só no staging; trazê-los ao analítico exige nova decisão do usuário (L-3 em `data-model.md` §12).

## 3. Paridade de colunas e de resultado
- **Colunas:** as projeções têm os campos dos tipos da biblioteca (`BaseBM`, `BaseAC`); teste estático compara as colunas de `dim_chamado` com as chaves de `Chamado` do mock, com as exceções declaradas (`server/tests/migracoes.estatico.test.ts:133`, caso C5).
- **Resultado:** o resultado de cada métrica sobre o mock em memória deve ser igual ao calculado sobre o seed no banco (`server/tests/metricas.paridade.test.ts:15`, sem Postgres; `server/tests/metricas.pg.test.ts:21`, com Postgres, lido pelo papel `dspd_api`). Diferença = falha.

## 4. Retenção
| Dado | Retenção | Fonte |
|---|---|---|
| Staging, eventos, versões | indefinida; nunca apagados | `data-model.md` §1 |
| `outbox` com `processado` | 30 dias (`RETENCAO_DIAS`, `server/src/plataforma/eventos/outbox.ts:10`) | [eventos.md](eventos.md) |
| Colunas de pessoa | **a definir com o DPO** (I-12) [planejado] | `data-model.md` §9, fim |
| Log de coleta (`ctl_`) | sem política de expurgo; histórico não é apagado | `data-model.md` §6 |

## 5. Histórico por versão (SCD2) e a ADR 0016 [proposta]
Hoje o histórico é SCD2 nas tabelas `dim_card_versao` (chave `card_id`, `vigente_de`) e `dim_chamado_versao` (chave `chamado_id`, `vigente_de`), com uma versão por mudança de atributo (`data-model.md` §3.2 e §4); a projeção guarda o estado vigente. Quando a fonte deixa de enviar um chamado, grava-se nova versão com `ausente_na_extracao = true`, sem apagar nada (`data-model.md` §4, "Ausência").

A **ADR 0016** é uma **proposta**: não consta em `docs/architecture/adr/` neste ramo (último arquivo: 0015). Este contrato **não** descreve o que ela decide; quando for aceita, atualizar esta seção com o que mudar em versões, vigências e retenção, e registrar a data. Até lá vale o `data-model.md`.

## 6. Quem lê o quê (resumo de `data-model.md` §8)
`dspd_api` lê projeções, `vw_`, `ref_` e `ctl_`; `dspd_coletor` escreve staging, eventos e projeções; `dspd_webhook` só insere em `stg_webhook_evento` e `outbox`; `dspd_migrador` é dono dos objetos. O teste de grants compara o banco com `gerarGrants` (`server/src/plataforma/db/grants.ts`).
