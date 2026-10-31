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
  '0017_ac_projecao_f2': m0017,
};

export const arquivosDeMigracao = (): string[] =>
  readdirSync(new URL('../migrations', import.meta.url)).filter((n) => /^\d{4}_.+\.ts$/.test(n)).map((n) => n.replace(/\.ts$/, '')).sort();
