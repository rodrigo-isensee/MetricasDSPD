import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

// Coletor do Acelerato, F2 (ADR 0023; plano 056 §5.2): atributos novos da projeção (`dim_chamado` e `dim_chamado_versao`) e índice
// de apoio ao projetor. Aditiva (`ADD COLUMN ... DEFAULT` não reescreve a tabela no PostgreSQL 11+), fora de `ATRIBUTOS_CHAMADO`
// (0008/0009 imutáveis, como a 0014). `com_agente` é só o booleano (ADR 0020; exceção nominal em `EXCECOES_PESSOA`); o id do agente
// nunca sai do MySQL. `reincidente_90d` tem os três valores do campo dos 90 dias (D-10). `fora_do_recorte` cobre a saída do recorte e
// a ausência na extração (a projeção trata os dois como fora do recorte, sem inferir exclusão).
const TABELAS = ['dim_chamado', 'dim_chamado_versao'] as const;
const COLUNAS = [
  'arquivado boolean NOT NULL DEFAULT false',
  'com_agente boolean NOT NULL DEFAULT true',
  `reincidente_90d varchar(12) NULL CHECK (reincidente_90d IN ('sim', 'nao', 'sem_resposta'))`,
  'fora_do_recorte boolean NOT NULL DEFAULT false',
  'categoria_key bigint NULL',
];
const NOMES = COLUNAS.map((c) => c.split(' ')[0]!);

export const ddl = (S: Esquemas): Ddl => ({
  up: [
    ...TABELAS.flatMap((t) => COLUNAS.map((c) => `ALTER TABLE ${S.ac}.${t} ADD COLUMN IF NOT EXISTS ${c}`)),
    `CREATE INDEX IF NOT EXISTS ix_dim_chamado_versao_stg ON ${S.ac}.dim_chamado_versao (stg_chamado_sk)`,
  ],
  down: [
    `DROP INDEX IF EXISTS ${S.ac}.ix_dim_chamado_versao_stg`,
    ...TABELAS.map((t) => `ALTER TABLE ${S.ac}.${t} ${NOMES.map((n) => `DROP COLUMN IF EXISTS ${n}`).join(', ')}`),
  ],
});
export const { up, down } = migracao(ddl);
