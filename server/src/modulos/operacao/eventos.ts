import {
  tipoErroColetaSchema,
  type ContagensColeta,
  type EventoColeta,
  type TipoErroColeta,
} from '@metricas-dspd/contratos';
import { isoLocal } from '@metricas-dspd/metricas/core';

/** Linha de `ctl_coleta` (tarefa coleta_incremental), já sem `em_andamento`. */
export type LinhaColeta = {
  coletaId: number | string;
  iniciadoEm: Date;
  finalizadoEm: Date;
  status: 'sucesso' | 'parcial' | 'falha';
  erroResumo: string | null;
};
/** Soma de `ctl_coleta_contagem` de uma coleta (entidades de dados) + marcadores de preservação. */
export type LinhaContagem = {
  coletaId: number | string; entidade: string; lidos: number | string; inseridos: number | string; jaExistentes: number | string;
};

/**
 * Convenção com o coletor (002): linhas de contagem com estas entidades carregam o total preservado
 * no momento da coleta (coluna `lidos`). Ausente = 0.
 */
export const ENTIDADE_ARQUIVADOS = 'arquivado_preservado';
export const ENTIDADE_EXCLUIDOS = 'excluido_preservado';

/**
 * Só a categoria sai (CA-15): `erro_resumo` é texto livre e pode ter SQL, caminho ou credencial,
 * então nunca é repassado. O coletor escreve a categoria como prefixo `categoria: detalhe`.
 */
export function classificarErro(resumo: string | null): TipoErroColeta {
  const prefixo = (resumo ?? '').split(':', 1)[0]!.trim();
  const r = tipoErroColetaSchema.safeParse(prefixo);
  return r.success ? r.data : 'desconhecido';
}

const EFEITO = { sucesso: 'aplicada', parcial: 'parcial-aplicada', falha: 'anteriores-mantidos' } as const;
const RESULTADO = { sucesso: 'ok', parcial: 'parcial', falha: 'falha' } as const;

export function agregarContagens(linhas: readonly LinhaContagem[]): ContagensColeta {
  const c: ContagensColeta = { lidos: 0, novos: 0, atualizados: 0, arquivadosPreservados: 0, excluidosPreservados: 0 };
  for (const l of linhas) {
    if (l.entidade === ENTIDADE_ARQUIVADOS) c.arquivadosPreservados += Number(l.lidos);
    else if (l.entidade === ENTIDADE_EXCLUIDOS) c.excluidosPreservados += Number(l.lidos);
    else {
      c.lidos += Number(l.lidos);
      c.novos += Number(l.inseridos);
      c.atualizados += Number(l.jaExistentes);
    }
  }
  return c;
}

export function eventoDeLinhas(
  prefixo: 'bm' | 'ac',
  linha: LinhaColeta,
  contagens: readonly LinhaContagem[],
): EventoColeta {
  const falha = linha.status === 'falha';
  return {
    id: `${prefixo}-${linha.coletaId}`,
    inicio: isoLocal(linha.iniciadoEm.getTime()),
    fim: isoLocal(linha.finalizadoEm.getTime()),
    duracaoMs: linha.finalizadoEm.getTime() - linha.iniciadoEm.getTime(),
    resultado: RESULTADO[linha.status],
    tipoErro: linha.status === 'sucesso' ? null : classificarErro(linha.erroResumo),
    efeito: EFEITO[linha.status],
    contagens: falha ? null : agregarContagens(contagens),
  };
}
