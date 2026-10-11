import { carregarConfigMigrar } from '../plataforma/config.js';
import { migrar } from '../plataforma/db/migrar.js';

// Entrada `migrar` (serviço avulso do Compose): migrações + GRANTs com `dspd_migrador`; roda e sai.
const cfg = carregarConfigMigrar();
const r = await migrar(cfg.PG_MIGRADOR_URL, { prefixo: cfg.DSPD_SCHEMA_PREFIXO, log: (m) => console.log(m) });
console.log(`migrar: ${r.migracoes.length} migração(ões), ${r.grants} GRANT(s)`);
