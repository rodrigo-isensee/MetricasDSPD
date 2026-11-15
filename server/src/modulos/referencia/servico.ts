import {
  PRIORIDADES, TIPOS_FILTRO, TIPO_ID, type Dominio,
} from '@metricas-dspd/contratos';
import { isoLocal, slug } from '@metricas-dspd/metricas/core';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { marcaDagua, ultimaColetaOk } from '../operacao/index.js';
import { lerEquipesAC, lerEquipesBM, lerPrioridadesAC, lerTiposBM, lerTimesAtivos, lerInicioAC, lerInicioBM, lerSistemasBM, lerSetoresBM, lerVersaoCriterioVigente } from './repositorio.js';
import type { OpcoesFiltroDto, ReferenciaDto } from './schemas.js';

/** Data civil de hoje em America/Sao_Paulo (o relógio é sempre parâmetro). */
export const dataCivil = (agora: Date): string => isoLocal(agora.getTime()).slice(0, 10);

/**
 * Opções dos filtros de UMA fonte. Nunca há opção de pessoa. `historico.fim` é a data de hoje;
 * base vazia: `inicio = fim`.
 */
export async function opcoesFiltro(db: Consultavel, dominio: Dominio, agora: Date, S?: Esquemas, opcoes: { times?: boolean } = {}): Promise<OpcoesFiltroDto> {
  const fim = dataCivil(agora);
  if (dominio === 'businessmap') {
    const inicio = await lerInicioBM(db, S);
    const tiposPresentes = new Set(await lerTiposBM(db, S));
    return {
      dominio,
      // F6 do 052: na base real o filtro de equipe lista os times ativos da tabela de times (só filtro; nada compara times).
      equipes: (opcoes.times === true ? await lerTimesAtivos(db, S) : await lerEquipesBM(db, S)).map((nome) => ({ id: slug(nome), nome })),
      // L6 do 097 (E4): só as categorias que têm story na base, na ordem de TIPOS_FILTRO ("Incidente" some: nenhuma story cai nele).
      tipos: TIPOS_FILTRO.filter((t) => t !== 'Incidente' && tiposPresentes.has(t)).map((t) => ({ id: TIPO_ID[t], nome: t })),
      sistemas: (await lerSistemasBM(db, S)).map((s) => ({ id: slug(s.id), nome: s.nome })),
      // L10a do 097 (E7): setores do dicionário versionado (nome sem sobrenome), id = slug do nome; 6 quadros no dicionário, o 35 fora até a P-097-10; a lista só existe após o bm:ref-sync.
      setores: setoresPorSlug(await lerSetoresBM(db, S)),
      historico: { inicio: inicio ?? fim, fim },
    };
  }
  const inicio = await lerInicioAC(db, S);
  const prioridadesPresentes = new Set(await lerPrioridadesAC(db, S));
  return {
    dominio,
    // L7a do 097 (E4): equipes do dado real (corte de lerChamados); id = slug do nome, sem repetir id.
    equipes: equipesPorSlug(await lerEquipesAC(db, S)),
    prioridades: PRIORIDADES.filter((p) => prioridadesPresentes.has(p)).map((p) => ({ id: p.toLowerCase(), nome: p })),
    historico: { inicio: inicio ?? fim, fim },
  };
}

/** Setores em ordem alfabética (CA-40); dois quadros com o mesmo nome viram uma opção só (id = slug do nome). */
function setoresPorSlug(linhas: { nome: string }[]): { id: string; nome: string }[] {
  const porId = new Map<string, { id: string; nome: string }>();
  for (const { nome } of linhas) if (slug(nome) !== '' && !porId.has(slug(nome))) porId.set(slug(nome), { id: slug(nome), nome });
  return [...porId.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** K-288: `nomes` vem em ordem de bytes; em slug repetido vale o primeiro, sem id repetido. */
function equipesPorSlug(nomes: string[]): { id: string; nome: string }[] {
  const porId = new Map<string, { id: string; nome: string }>();
  for (const nome of nomes) if (!porId.has(slug(nome))) porId.set(slug(nome), { id: slug(nome), nome });
  return [...porId.values()];
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
