-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 9000_grants.sql (rode depois de TODAS as migrações; gere de novo a cada migração nova)
BEGIN;
REVOKE ALL ON SCHEMA dspd_bm FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

REVOKE ALL ON ALL TABLES IN SCHEMA dspd_bm FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

REVOKE ALL ON SCHEMA dspd_ac FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

REVOKE ALL ON ALL TABLES IN SCHEMA dspd_ac FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

REVOKE ALL ON SCHEMA dspd_core FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

REVOKE ALL ON ALL TABLES IN SCHEMA dspd_core FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

GRANT USAGE ON SCHEMA dspd_bm, dspd_ac, dspd_core TO dspd_coletor;

GRANT USAGE ON SCHEMA dspd_bm, dspd_ac, dspd_core TO dspd_api;

GRANT USAGE ON SCHEMA dspd_bm, dspd_ac, dspd_core TO dspd_ref;

GRANT USAGE ON SCHEMA dspd_bm, dspd_core TO dspd_webhook;

GRANT USAGE ON SCHEMA dspd_ac, dspd_core TO dspd_automacao;

GRANT USAGE ON SCHEMA dspd_core TO dspd_pesquisa;

GRANT USAGE ON SCHEMA dspd_bm, dspd_core TO dspd_api_apontamento;

GRANT SELECT, INSERT ON dspd_bm.dim_card_versao TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.evt_apontamento TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.evt_bloqueio TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.evt_card TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.fato_transicao TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.rec_transicao_par TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_apontamento TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_bloqueio TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_card TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_card_presenca TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_coluna TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_custom_field TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_revision TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_toque_instante TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_vinculo TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_webhook_evento TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_webhook_processamento TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE, DELETE ON dspd_bm.dim_card TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE, DELETE ON dspd_bm.fato_bloqueio TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_apontamento_cobertura TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_coleta TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_coleta_contagem TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_coleta_falha TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_reconciliacao TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_toque_leitura TO dspd_coletor;

GRANT UPDATE (status, finalizado_em, marca_dagua_ate, erro_resumo) ON dspd_bm.ctl_coleta TO dspd_coletor;

GRANT UPDATE ON dspd_bm.ctl_coleta_contagem TO dspd_coletor;

GRANT UPDATE (parametros) ON dspd_bm.ctl_coleta TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE ON dspd_bm.dim_responsavel TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE ON dspd_bm.dim_card_raiz TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE ON dspd_bm.fato_apontamento TO dspd_coletor;

GRANT SELECT ON dspd_bm.cfg_pessoa_eliminada TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_alocacao_acordada TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_apontamento_regra_tipo TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_apontamento_subgrupo TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_apontamento_termo TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_coluna TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_dominio TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_ficha_resultado TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_limite_frentes TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_limite_wip_fluxo TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_quadro TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_sle TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_time TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_time_workflow TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_tipo_card TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_workflow TO dspd_coletor;

GRANT SELECT (card_id, tipo, classe_servico, sistema, area_solicitante, fornecedor, objetivo_estrategico, card_pai, criado_em, comprometido_em, iniciado_em, concluido_em, arquivado_em, motivo_descarte, tamanho_declarado, titulo, granularidade, equipe, quadro_id, coluna_atual_id, excluido_em, eh_subtarefa, data_acordada, responsabilidade_atraso, origem_demanda, fase_deteccao, severidade, causa_raiz, origem_bug, adicionado_apos_inicio_pai, coletado_em, atualizado_por_coleta_id, sistema_origem, primeiro_toque_em, toque_situacao) ON dspd_bm.dim_card TO dspd_api;

GRANT SELECT ON dspd_bm.fato_bloqueio TO dspd_api;

GRANT SELECT ON dspd_bm.fato_transicao TO dspd_api;

GRANT SELECT ON dspd_bm.rec_transicao_par TO dspd_api;

GRANT SELECT ON dspd_bm.ctl_apontamento_cobertura TO dspd_api;

GRANT SELECT ON dspd_bm.ctl_coleta TO dspd_api;

GRANT SELECT ON dspd_bm.ctl_coleta_contagem TO dspd_api;

GRANT SELECT ON dspd_bm.ctl_coleta_falha TO dspd_api;

GRANT SELECT ON dspd_bm.ctl_reconciliacao TO dspd_api;

GRANT SELECT ON dspd_bm.ref_alocacao_acordada TO dspd_api;

GRANT SELECT ON dspd_bm.ref_coluna TO dspd_api;

GRANT SELECT ON dspd_bm.ref_dominio TO dspd_api;

GRANT SELECT ON dspd_bm.ref_ficha_resultado TO dspd_api;

GRANT SELECT ON dspd_bm.ref_limite_frentes TO dspd_api;

GRANT SELECT ON dspd_bm.ref_limite_wip_fluxo TO dspd_api;

GRANT SELECT ON dspd_bm.ref_quadro TO dspd_api;

GRANT SELECT ON dspd_bm.ref_sle TO dspd_api;

GRANT SELECT (time_id, vigente_de, vigente_ate, nome, ativo, motivo, versao_id, registrado_em) ON dspd_bm.ref_time TO dspd_api;

GRANT SELECT (workflow_id, vigente_de, vigente_ate, quadro_id, time_id, situacao, motivo_fora, motivo, versao_id, registrado_em) ON dspd_bm.ref_time_workflow TO dspd_api;

GRANT SELECT ON dspd_bm.ref_tipo_card TO dspd_api;

GRANT SELECT ON dspd_bm.ref_workflow TO dspd_api;

GRANT SELECT ON dspd_bm.vw_marca_dagua TO dspd_api;

GRANT SELECT ON dspd_bm.vw_transicao_canonica TO dspd_api;

GRANT SELECT, INSERT ON dspd_bm.ref_alocacao_acordada TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_apontamento_regra_tipo TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_apontamento_subgrupo TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_apontamento_termo TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_coluna TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_dominio TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_ficha_resultado TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_limite_frentes TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_limite_wip_fluxo TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_quadro TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_sle TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_time TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_time_workflow TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_tipo_card TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_workflow TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_alocacao_acordada TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_apontamento_regra_tipo TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_apontamento_subgrupo TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_apontamento_termo TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_coluna TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_dominio TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_ficha_resultado TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_limite_frentes TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_limite_wip_fluxo TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_quadro TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_sle TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_time TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_time_workflow TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_tipo_card TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_workflow TO dspd_ref;

GRANT SELECT, INSERT ON dspd_ac.dim_chamado_versao TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.evt_etapa_chamado TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.stg_chamado TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.stg_etapa TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE, DELETE ON dspd_ac.dim_chamado TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE, DELETE ON dspd_ac.fato_etapa_chamado TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.ctl_automacao TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.ctl_coleta TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.ctl_coleta_contagem TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.ctl_coleta_falha TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.ctl_reconciliacao TO dspd_coletor;

GRANT UPDATE (status, finalizado_em, marca_dagua_ate, erro_resumo) ON dspd_ac.ctl_coleta TO dspd_coletor;

GRANT UPDATE ON dspd_ac.ctl_coleta_contagem TO dspd_coletor;

GRANT SELECT ON dspd_ac.ref_alvo_prioridade TO dspd_coletor;

GRANT SELECT ON dspd_ac.ref_dominio TO dspd_coletor;

GRANT SELECT ON dspd_ac.ref_etapa_totalizador TO dspd_coletor;

GRANT SELECT ON dspd_ac.dim_chamado TO dspd_api;

GRANT SELECT ON dspd_ac.fato_etapa_chamado TO dspd_api;

GRANT SELECT ON dspd_ac.ctl_automacao TO dspd_api;

GRANT SELECT ON dspd_ac.ctl_coleta TO dspd_api;

GRANT SELECT ON dspd_ac.ctl_coleta_contagem TO dspd_api;

GRANT SELECT ON dspd_ac.ctl_coleta_falha TO dspd_api;

GRANT SELECT ON dspd_ac.ctl_reconciliacao TO dspd_api;

GRANT SELECT ON dspd_ac.ref_alvo_prioridade TO dspd_api;

GRANT SELECT ON dspd_ac.ref_dominio TO dspd_api;

GRANT SELECT ON dspd_ac.ref_etapa_totalizador TO dspd_api;

GRANT SELECT ON dspd_ac.vw_abertos TO dspd_api;

GRANT SELECT ON dspd_ac.vw_fechados_sla TO dspd_api;

GRANT SELECT ON dspd_ac.vw_marca_dagua TO dspd_api;

GRANT SELECT ON dspd_ac.vw_populacao_sssc TO dspd_api;

GRANT SELECT, INSERT ON dspd_ac.ref_alvo_prioridade TO dspd_ref;

GRANT SELECT, INSERT ON dspd_ac.ref_dominio TO dspd_ref;

GRANT SELECT, INSERT ON dspd_ac.ref_etapa_totalizador TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_ac.ref_alvo_prioridade TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_ac.ref_dominio TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_ac.ref_etapa_totalizador TO dspd_ref;

GRANT SELECT ON dspd_core.ref_calendario TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_calendario_aplicacao TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_calendario_turno TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_feriado TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_pesq_area TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_pesq_pergunta TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_versao_criterio TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_versao_criterio_metrica TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_calendario TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_calendario_aplicacao TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_calendario_turno TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_feriado TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_pesq_area TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_pesq_pergunta TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_versao_criterio TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_versao_criterio_metrica TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_calendario TO dspd_api;

GRANT SELECT ON dspd_core.ref_calendario_aplicacao TO dspd_api;

GRANT SELECT ON dspd_core.ref_calendario_turno TO dspd_api;

GRANT SELECT ON dspd_core.ref_feriado TO dspd_api;

GRANT SELECT ON dspd_core.ref_pesq_area TO dspd_api;

GRANT SELECT ON dspd_core.ref_pesq_pergunta TO dspd_api;

GRANT SELECT ON dspd_core.ref_versao_criterio TO dspd_api;

GRANT SELECT ON dspd_core.ref_versao_criterio_metrica TO dspd_api;

GRANT SELECT, INSERT ON dspd_core.ref_calendario TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_calendario_aplicacao TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_calendario_turno TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_feriado TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_pesq_area TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_pesq_pergunta TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_versao_criterio TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_versao_criterio_metrica TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_core.ref_calendario_aplicacao TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_core.ref_calendario_turno TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_core.ref_pesq_area TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_core.ref_pesq_pergunta TO dspd_ref;

GRANT SELECT, INSERT, DELETE ON dspd_core.outbox TO dspd_coletor;

GRANT UPDATE (status, tentativas, disponivel_em, reservado_ate, processado_em, ultimo_erro) ON dspd_core.outbox TO dspd_coletor;

GRANT INSERT ON dspd_core.outbox TO dspd_webhook;

GRANT SELECT, INSERT ON dspd_core.pesq_carga TO dspd_pesquisa;

GRANT SELECT, INSERT ON dspd_core.pesq_participacao TO dspd_pesquisa;

GRANT SELECT, INSERT ON dspd_core.pesq_resultado TO dspd_pesquisa;

GRANT SELECT ON dspd_core.ref_pesq_area TO dspd_pesquisa;

GRANT SELECT ON dspd_core.ref_pesq_pergunta TO dspd_pesquisa;

GRANT SELECT ON dspd_core.ref_versao_criterio TO dspd_pesquisa;

GRANT SELECT ON dspd_core.ref_versao_criterio_metrica TO dspd_pesquisa;

GRANT SELECT ON dspd_core.pesq_carga TO dspd_api;

GRANT SELECT ON dspd_core.pesq_participacao TO dspd_api;

GRANT SELECT ON dspd_core.pesq_resultado TO dspd_api;

GRANT SELECT ON dspd_core.vw_pesq_vigente TO dspd_api;

GRANT SELECT (card_id, parent_card_id, subtask_id, data_apontamento, segundos, subgrupo_codigo, flags_qualidade, iniciativa_card_id, pessoa_ref, type_id, excluido_em) ON dspd_bm.fato_apontamento TO dspd_api_apontamento;

GRANT SELECT (card_id, raiz_card_id, raiz_fora_do_escopo) ON dspd_bm.dim_card_raiz TO dspd_api_apontamento;

GRANT SELECT (card_id, titulo, tipo, equipe, quadro_id) ON dspd_bm.dim_card TO dspd_api_apontamento;

GRANT SELECT (campo, codigo, rotulo, ordem, vigente_ate) ON dspd_bm.ref_dominio TO dspd_api_apontamento;

GRANT SELECT (pessoa_ref, responsavel_nome) ON dspd_bm.dim_responsavel TO dspd_api_apontamento;

GRANT SELECT (pessoa_ref, vigencia_ate) ON dspd_bm.apt_pessoa_time TO dspd_api_apontamento;

GRANT SELECT (codigo, rotulo, incluido_por_versao_id) ON dspd_bm.ref_apontamento_subgrupo TO dspd_api_apontamento;

GRANT SELECT (incluido_por_versao_id) ON dspd_bm.ref_apontamento_termo TO dspd_api_apontamento;

GRANT SELECT (incluido_por_versao_id) ON dspd_bm.ref_apontamento_regra_tipo TO dspd_api_apontamento;

GRANT SELECT (coleta_id, tarefa, status, iniciado_em, finalizado_em) ON dspd_bm.ctl_coleta TO dspd_api_apontamento;

GRANT SELECT (cobertura_sk, card_id, estado, detectado_em) ON dspd_bm.ctl_apontamento_cobertura TO dspd_api_apontamento;

GRANT SELECT (calendario_id, offset_minutos) ON dspd_core.ref_calendario TO dspd_api_apontamento;

GRANT SELECT (dominio, classe, calendario_id, vigente_ate) ON dspd_core.ref_calendario_aplicacao TO dspd_api_apontamento;

GRANT SELECT (calendario_id, data, incluido_por_versao_id) ON dspd_core.ref_feriado TO dspd_api_apontamento;

GRANT SELECT (versao_id, vigente_desde, dominio, descricao) ON dspd_core.ref_versao_criterio TO dspd_api_apontamento;

GRANT SELECT (versao_id, metrica_id) ON dspd_core.ref_versao_criterio_metrica TO dspd_api_apontamento;

GRANT INSERT ON dspd_bm.stg_webhook_evento TO dspd_webhook;

GRANT SELECT (webhook_sk, payload_sha256) ON dspd_bm.stg_webhook_evento TO dspd_webhook;

GRANT SELECT, INSERT ON dspd_ac.ctl_automacao TO dspd_automacao;
COMMIT;
