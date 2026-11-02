import { readdirSync } from 'node:fs';
import * as m0001 from '../migrations/0001_schemas.js';
import * as m0002 from '../migrations/0002_bm_controle.js';
import * as m0003 from '../migrations/0003_ac_controle.js';
import * as m0004 from '../migrations/0004_bm_staging.js';
import * as m0005 from '../migrations/0005_bm_historico.js';
import * as m0006 from '../migrations/0006_bm_projecoes.js';
import * as m0007 from '../migrations/0007_bm_referencia.js';
import * as m0008 from '../migrations/0008_ac_staging_historico.js';
import * as m0009 from '../migrations/0009_ac_projecoes_referencia.js';
import * as m0010 from '../migrations/0010_core_referencia.js';
import * as m0011 from '../migrations/0011_core_outbox.js';
import * as m0012 from '../migrations/0012_bm_limite_wip_fluxo_indices.js';
import * as m0013 from '../migrations/0013_core_pesquisa.js';
import * as m0014 from '../migrations/0014_ac_justificativa_informada.js';
import * as m0015 from '../migrations/0015_bm_remove_usuario_transicao.js';
import * as m0016 from '../migrations/0016_ac_stg_chamado_recorte.js';
import * as m0017 from '../migrations/0017_ac_projecao_f2.js';
import * as m0018 from '../migrations/0018_bm_referencia_workflow_tipo_times.js';
import * as m0019 from '../migrations/0019_bm_carga_inicial_times.js';
import * as m0020 from '../migrations/0020_bm_dim_responsavel.js';
import * as m0021 from '../migrations/0021_bm_ctl_coleta_tarefa_apontamento.js';
import * as m0022 from '../migrations/0022_bm_stg_apontamento.js';
import * as m0023 from '../migrations/0023_bm_evt_apontamento.js';
import * as m0024 from '../migrations/0024_bm_dim_responsavel_pessoa_ref.js';
import * as m0025 from '../migrations/0025_bm_cfg_pessoa_eliminada.js';
import * as m0026 from '../migrations/0026_bm_ref_apontamento.js';
import * as m0027 from '../migrations/0027_bm_dim_card_raiz.js';
import * as m0028 from '../migrations/0028_bm_fato_apontamento.js';
import * as m0029 from '../migrations/0029_bm_fato_apontamento_tipo.js';
import * as m0030 from '../migrations/0030_bm_ref_apontamento_vigencia.js';
import * as m0031 from '../migrations/0031_bm_cfg_pessoa_eliminada_executado_por.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

type Modulo = { ddl: (S: Esquemas) => Ddl; up: unknown; down: unknown };

/** Ordem = nome do arquivo. */
export const MIGRACOES: Record<string, Modulo> = {
  '0001_schemas': m0001, '0002_bm_controle': m0002, '0003_ac_controle': m0003, '0004_bm_staging': m0004,
  '0005_bm_historico': m0005, '0006_bm_projecoes': m0006, '0007_bm_referencia': m0007,
  '0008_ac_staging_historico': m0008, '0009_ac_projecoes_referencia': m0009, '0010_core_referencia': m0010,
  '0011_core_outbox': m0011, '0012_bm_limite_wip_fluxo_indices': m0012, '0013_core_pesquisa': m0013,
  '0014_ac_justificativa_informada': m0014, '0015_bm_remove_usuario_transicao': m0015, '0016_ac_stg_chamado_recorte': m0016,
  '0017_ac_projecao_f2': m0017, '0018_bm_referencia_workflow_tipo_times': m0018, '0019_bm_carga_inicial_times': m0019, '0020_bm_dim_responsavel': m0020,
  '0021_bm_ctl_coleta_tarefa_apontamento': m0021, '0022_bm_stg_apontamento': m0022, '0023_bm_evt_apontamento': m0023,
  '0024_bm_dim_responsavel_pessoa_ref': m0024, '0025_bm_cfg_pessoa_eliminada': m0025, '0026_bm_ref_apontamento': m0026,
  '0027_bm_dim_card_raiz': m0027, '0028_bm_fato_apontamento': m0028,
  '0029_bm_fato_apontamento_tipo': m0029, '0030_bm_ref_apontamento_vigencia': m0030,
  '0031_bm_cfg_pessoa_eliminada_executado_por': m0031,
};

export const arquivosDeMigracao = (): string[] =>
  readdirSync(new URL('../migrations', import.meta.url)).filter((n) => /^\d{4}_.+\.ts$/.test(n)).map((n) => n.replace(/\.ts$/, '')).sort();
