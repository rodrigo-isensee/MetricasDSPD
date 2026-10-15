import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

// K-096 (ADR 0020, R-2 = B, decisão do usuário em 2026-10-16): remove `fato_transicao.usuario`. Nenhuma métrica a lê e ela
// perdeu a fonte (o coletor não grava mais o autor da transição, K-084). Carga incremental: a migração NÃO sobrescreve
// histórico; se alguma linha ainda tiver valor, ela aborta (cenário de dado antigo) em vez de perder o dado em silêncio.
// O `down` recria a coluna vazia (o conteúdo removido não existe mais).
export const ddl = (S: Esquemas): Ddl => ({
  up: [
    `DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM ${S.bm}.fato_transicao WHERE usuario IS NOT NULL) THEN
    RAISE EXCEPTION 'fato_transicao.usuario tem valor gravado; remover a coluna perderia dado. Trate antes (K-096).';
  END IF;
END $$`,
    `ALTER TABLE ${S.bm}.fato_transicao DROP COLUMN IF EXISTS usuario`,
  ],
  down: [`ALTER TABLE ${S.bm}.fato_transicao ADD COLUMN IF NOT EXISTS usuario text NULL`],
});
export const { up, down } = migracao(ddl);
