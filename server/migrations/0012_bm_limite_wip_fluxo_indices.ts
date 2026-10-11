import { migracao } from '../src/plataforma/db/executar.js';
import { VIG, drop, indice, refVigencia, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

// Limite de WIP do fluxo por equipe (O1): a biblioteca o recebe em `config.limite_wip_fluxo` e nenhuma tabela o guardava.
// Valor da equipe nomeada; sem linha, o limite é 0 (O1 mostra tudo acima do limite: sinal de configuração faltando).
// Índices do módulo `metricas` (medidos com ~5x o volume do mock, `tests/pg/desempenho.ts`): `min(aberto_em)` (filtros do
// Acelerato) fazia varredura da tabela; marca d'água e histórico de coletas ordenam por data e filtram status/tarefa.
export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      ...refVigencia(s, 'ref_limite_wip_fluxo', `equipe varchar(60) NOT NULL, ${VIG}, limite smallint NOT NULL CHECK (limite >= 0),
  PRIMARY KEY (equipe, vigente_de)`, 'equipe'),
      indice(S.ac, 'ix_dim_chamado_aberto', 'dim_chamado', 'aberto_em'),
      indice(S.bm, 'ix_ctl_coleta_ok', 'ctl_coleta', 'finalizado_em DESC, coleta_id DESC', "status = 'sucesso'"),
      indice(S.ac, 'ix_ctl_coleta_ok', 'ctl_coleta', 'finalizado_em DESC, coleta_id DESC', "status = 'sucesso'"),
      indice(S.bm, 'ix_ctl_coleta_incremental', 'ctl_coleta', 'iniciado_em DESC, coleta_id DESC', "tarefa = 'coleta_incremental'"),
      indice(S.ac, 'ix_ctl_coleta_incremental', 'ctl_coleta', 'iniciado_em DESC, coleta_id DESC', "tarefa = 'coleta_incremental'"),
    ],
    down: [
      ...['bm', 'ac'].flatMap((c) => ['ix_ctl_coleta_incremental', 'ix_ctl_coleta_ok'].map((i) => `DROP INDEX IF EXISTS ${S[c as 'bm' | 'ac']}.${i}`)),
      `DROP INDEX IF EXISTS ${S.ac}.ix_dim_chamado_aberto`,
      ...drop(`${s}.ref_limite_wip_fluxo`),
    ],
  };
};
export const { up, down } = migracao(ddl);
