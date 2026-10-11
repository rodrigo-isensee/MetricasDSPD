import {
  EQUIPES_SUSTENTACAO_ID, NOME_EQUIPE_SUSTENTACAO, PRIORIDADES, TIPOS_FILTRO, TIPO_ID, type Dominio,
} from '@metricas-dspd/contratos';
import { isoLocal, slug } from '@metricas-dspd/metricas/core';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { marcaDagua, ultimaColetaOk } from '../operacao/index.js';
import { lerEquipesBM, lerInicioAC, lerInicioBM, lerSistemasBM, lerVersaoCriterioVigente } from './repositorio.js';
import type { OpcoesFiltroDto, ReferenciaDto } from './schemas.js';

/** Data civil de hoje em America/Sao_Paulo (o relógio é sempre parâmetro). */
export const dataCivil = (agora: Date): string => isoLocal(agora.getTime()).slice(0, 10);

/**
 * Opções dos filtros de UMA fonte. Nunca há opção de pessoa. `historico.fim` é a data de hoje;
 * base vazia: `inicio = fim`.
 */
export async function opcoesFiltro(db: Consultavel, dominio: Dominio, agora: Date, S?: Esquemas): Promise<OpcoesFiltroDto> {
  const fim = dataCivil(agora);
  if (dominio === 'businessmap') {
    const inicio = await lerInicioBM(db, S);
    return {
      dominio,
      equipes: (await lerEquipesBM(db, S)).map((nome) => ({ id: slug(nome), nome })),
      tipos: TIPOS_FILTRO.map((t) => ({ id: TIPO_ID[t], nome: t })),
      sistemas: (await lerSistemasBM(db, S)).map((s) => ({ id: slug(s.id), nome: s.nome })),
      historico: { inicio: inicio ?? fim, fim },
    };
  }
  const inicio = await lerInicioAC(db, S);
  return {
    dominio,
    equipes: EQUIPES_SUSTENTACAO_ID.map((id) => ({ id, nome: NOME_EQUIPE_SUSTENTACAO[id] })),
    prioridades: PRIORIDADES.map((p) => ({ id: p.toLowerCase(), nome: p })),
    historico: { inicio: inicio ?? fim, fim },
  };
}

/**
 * Data de referência (S-a: data da última coleta bem-sucedida; a mais recente entre as fontes, ou hoje se nunca houve),
 * última coleta por fonte (sem agregação entre elas) e versão de critério vigente.
 */
export async function referencia(db: Consultavel, agora: Date, S?: Esquemas): Promise<ReferenciaDto> {
  const marcas = [await marcaDagua(db, 'businessmap', S), await marcaDagua(db, 'acelerato', S)];
  const ultima = Math.max(...marcas.map((m) => m?.finalizadoEm.getTime() ?? -Infinity));
  const dataReferencia = dataCivil(Number.isFinite(ultima) ? new Date(ultima) : agora);
  return {
    dataReferencia,
    ultimaColeta: {
      businessmap: await ultimaColetaOk(db, 'businessmap', S),
      acelerato: await ultimaColetaOk(db, 'acelerato', S),
    },
    versaoCriterio: (await lerVersaoCriterioVigente(db, dataReferencia, S)) ?? '0',
  };
}
