import { readdirSync, writeFileSync } from 'node:fs';
import { checksumDe } from './checksums.js';
import { DIR_MIGRACOES } from './migrar.js';

// Regenera migrations/checksums.json. Só para migração NOVA, antes da primeira aplicação; nunca para editar uma aplicada.
const nomes = readdirSync(DIR_MIGRACOES).filter((n) => /^\d{4}_.+\.ts$/.test(n)).sort();
const mapa: Record<string, string> = {};
for (const n of nomes) mapa[n.replace(/\.ts$/, '')] = checksumDe((await import(`${DIR_MIGRACOES}/${n}`)).ddl);
writeFileSync(`${DIR_MIGRACOES}/checksums.json`, JSON.stringify(mapa, null, 2) + '\n');
console.log(`${nomes.length} checksums gravados`);
