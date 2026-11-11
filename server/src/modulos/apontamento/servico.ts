import {
  FLAGS_QUALIDADE, MAX_ROTULO, PESSOA_OUTRA_AREA, ROTULO_PESSOA_NAO_IDENTIFICADA, type ConsultaApontamento, type EventoColeta, type FlagQualidade, type PessoaApontamento, type PessoaRef, type RespostaApontamento,
} from '@metricas-dspd/contratos';
import { calcularApontamento, LIMITE_ATIPICO_SEGUNDOS_PADRAO, ordenarPorPessoa, type LinhaApontamento } from '@metricas-dspd/metricas/businessmap';
import { CALENDARIO_PADRAO, criarCalendario, dataIso, diaDeIso, isoDeDia, isoLocal, ordenarNeutro, seloFrescor } from '@metricas-dspd/metricas/core';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { lerCalendario, lerCardsIncompletos, lerCriterios, lerHistorico, lerLinhas, lerNomes, lerPessoasDoTime, lerRotulosSubgrupo, lerUltimasColetas, type ColetaLida, type LinhaBruta } from './repositorio.js';

// Pedido 059 (K-193), rota da aba Apontamento. Este serviço só LÊ e MONTA a moldura da resposta (período, opções, frescor, critérios); todo cálculo
// (soma, capacidade, utilização, distribuição, qualidade, matriz, diário, achados, piso de 20) é de `calcularApontamento`, da biblioteca T2.5.
// Só o BusinessMap. Pessoa só por `pessoaRef` (chave opaca); o nome sai apenas com `nomesReais` (R4-5) e só em `opcoes.pessoas[].rotulo`.

/** Soma do dia da pessoa acima disto vira `valor-atipico` (decisão do dono, pedido 067, 2026-11-04: 10 h; antes 16 h). Marca, nunca descarta. */
export const LIMITE_ATIPICO_SEGUNDOS = LIMITE_ATIPICO_SEGUNDOS_PADRAO;
/** Período padrão do painel (P-3 do UX): 12 semanas terminando hoje; mapa diário: 4 semanas. */
export const DIAS_PERIODO_PADRAO = 84;
export const DIAS_DIARIO_PADRAO = 28;
const ROTULO_RESIDUAL: Readonly<Record<string, string>> = { 'execucao-tecnica': 'Execução técnica', 'nao-classificado': 'Sem comentário' };
const FLAGS_DA_CLASSIFICACAO = FLAGS_QUALIDADE.slice(0, 3);
const BIT_SEM_INICIATIVA = 8;
/** Tipo sem `type_id` (linha ainda não relida pela coleta): entra nas somas, mas não é opção de filtro (o filtro só aceita `type_id` em dígitos). */
const TIPO_SEM_ID = 'sem-tipo';
const RESULTADO = { sucesso: 'ok', parcial: 'parcial', falha: 'falha' } as const;
const EFEITO = { sucesso: 'aplicada', parcial: 'parcial-aplicada', falha: 'anteriores-mantidos' } as const;

export interface DepsMontagem { db: Consultavel; S: Esquemas; agora: () => Date; nomesReais: boolean }

const refDe = (pessoaRef: string): PessoaRef => (pessoaRef === PESSOA_OUTRA_AREA ? PESSOA_OUTRA_AREA : `p${pessoaRef}`);
/** Janela de "ser do time": responsável por card do escopo nos últimos 12 meses (decisão do dono, 2026-11-02). */
export const MESES_DO_TIME = 12;
const ROTULO_OUTRA_AREA = 'Outra área';

/**
 * Quem não é do time entra somado numa entrada única `outra-area`, sem nome nem chave da pessoa (vale com o interruptor de nome ligado).
 * Pessoa sem de-para (`null`, eliminada a pedido) continua sem pessoa.
 */
export function agruparOutraArea(brutas: readonly LinhaBruta[], doTime: ReadonlySet<string>): LinhaBruta[] {
  return brutas.map((l) => (l.pessoaRef === null || doTime.has(l.pessoaRef) ? l : { ...l, pessoaRef: PESSOA_OUTRA_AREA }));
}

const mesesAntes = (d: Date, meses: number): Date => {
  const r = new Date(d.getTime());
  r.setUTCMonth(r.getUTCMonth() - meses);
  return r;
};

/** Flags decididas na classificação (bits 1, 2 e 4 de `flags_qualidade`, na ordem do contrato): `sem-iniciativa` e `valor-atipico` vêm de outro lugar. */
export function flagsDaMascara(mascara: number): FlagQualidade[] {
  return FLAGS_DA_CLASSIFICACAO.filter((_, i) => (mascara & (1 << i)) !== 0);
}

function linhaDaBiblioteca(l: LinhaBruta, rotulosSubgrupo: ReadonlyMap<string, string>): LinhaApontamento {
  return {
    pessoaRef: l.pessoaRef === null ? null : refDe(l.pessoaRef),
    data: l.data,
    segundos: l.segundos,
    // `id` é o `type_id` em dígitos, o mesmo valor que o filtro `tipo` aceita; o rótulo é o da categoria do card (`dim_card.tipo`)
    tipo: l.typeId === null ? { id: TIPO_SEM_ID, rotulo: 'Sem tipo' } : { id: l.typeId, rotulo: l.tipo ?? 'Sem tipo' },
    projeto: { id: l.projetoId ?? 'sem-projeto', rotulo: l.projetoTitulo ?? (l.projetoId === null ? 'Sem iniciativa' : `Card ${l.projetoId}`), foraDoEscopo: l.foraDoEscopo },
    subgrupo: { id: l.subgrupo, rotulo: rotulosSubgrupo.get(l.subgrupo) ?? ROTULO_RESIDUAL[l.subgrupo] ?? l.subgrupo },
    subtarefa: l.emSubtarefa ? { id: 'em-subtarefa', rotulo: 'Em subtarefa' } : { id: 'direto-no-card', rotulo: 'Direto no card' },
    semIniciativa: l.projetoId === null || (l.flags & BIT_SEM_INICIATIVA) !== 0,
    flags: flagsDaMascara(l.flags),
  };
}

const eventoDe = (c: ColetaLida): EventoColeta => ({
  id: `bm-apontamento-${c.id}`, inicio: isoLocal(c.iniciadoEm.getTime()), fim: isoLocal(c.finalizadoEm.getTime()),
  duracaoMs: c.finalizadoEm.getTime() - c.iniciadoEm.getTime(), resultado: RESULTADO[c.status], tipoErro: null, efeito: EFEITO[c.status], contagens: null,
});

/**
 * Períodos pedidos ou o padrão (termina hoje, em America/Sao_Paulo); o diário padrão termina no fim do período. O contrato garante os dois limites
 * juntos ou nenhum (`conferirJanela`), então basta olhar o primeiro de cada par.
 */
export function janelas(c: ConsultaApontamento, hoje: string): { periodo: { de: string; ate: string }; diario: { de: string; ate: string } } {
  const periodo = c.de === undefined
    ? { de: isoDeDia(diaDeIso(hoje) - (DIAS_PERIODO_PADRAO - 1)), ate: hoje }
    : { de: c.de, ate: c.ate as string };
  const diario = c.diarioDe === undefined
    ? { de: isoDeDia(diaDeIso(periodo.ate) - (DIAS_DIARIO_PADRAO - 1)), ate: periodo.ate }
    : { de: c.diarioDe, ate: c.diarioAte as string };
  return { periodo, diario };
}

const menor = (a: string, b: string): string => (a < b ? a : b);
const maior = (a: string, b: string): string => (a > b ? a : b);

export async function montarApontamento(d: DepsMontagem, c: ConsultaApontamento): Promise<RespostaApontamento> {
  const { db, S } = d;
  const hoje = dataIso(d.agora().getTime(), CALENDARIO_PADRAO);
  const { periodo, diario } = janelas(c, hoje);

  const doTime = await lerPessoasDoTime(db, S, mesesAntes(d.agora(), MESES_DO_TIME));
  const brutas = agruparOutraArea(await lerLinhas(db, S, menor(periodo.de, diario.de), maior(periodo.ate, diario.ate)), doTime);
  const rotulosSubgrupo = await lerRotulosSubgrupo(db, S);
  const linhas = brutas.map((l) => linhaDaBiblioteca(l, rotulosSubgrupo));
  const todasRefs = [...new Set(brutas.flatMap((l) => (l.pessoaRef === null ? [] : [l.pessoaRef])))];
  const refs = todasRefs.filter((r) => r !== PESSOA_OUTRA_AREA);
  const haOutraArea = todasRefs.length > refs.length;
  const nomes = d.nomesReais ? await lerNomes(db, S, refs) : new Map<string, string>();

  const calendarioRef = await lerCalendario(db, S);
  const calendario = calendarioRef === null
    ? criarCalendario({ feriados: new Set<string>() })
    : criarCalendario({ feriados: new Set(calendarioRef.feriados), offsetMinutos: calendarioRef.offsetMinutos });
  const { ultima, ultimaOk } = await lerUltimasColetas(db, S);
  const fimOk = ultimaOk?.finalizadoEm.getTime() ?? null;
  const historico = (await lerHistorico(db, S)) ?? { inicio: periodo.de, fim: periodo.ate };
  const criterios = await lerCriterios(db, S);

  const pessoasDoTime: PessoaApontamento[] = refs.map((ref) => {
    const nome = nomes.get(ref);
    if (d.nomesReais) return { pessoaRef: refDe(ref), rotulo: nome ?? ROTULO_PESSOA_NAO_IDENTIFICADA, identificada: nome !== undefined };
    // nomes desligados: só o rótulo fixo "Pessoa n" (a chave `p<n>` e o rótulo seguem o mesmo formato do contrato)
    return { pessoaRef: refDe(ref), rotulo: `Pessoa ${ref}`, identificada: true };
  });
  const pessoasSemOrdem: PessoaApontamento[] = haOutraArea
    ? [...pessoasDoTime, { pessoaRef: PESSOA_OUTRA_AREA, rotulo: ROTULO_OUTRA_AREA, identificada: true }]
    : pessoasDoTime;
  const pessoas = ordenarPorPessoa(pessoasSemOrdem, new Map(pessoasSemOrdem.map((p) => [p.pessoaRef, p.rotulo])), d.nomesReais);

  const unicos = <T extends { id: string }>(itens: readonly T[]): T[] => [...new Map(itens.map((i) => [i.id, i])).values()];
  const emOrdem = <T extends { id: string; rotulo: string }>(itens: readonly T[]): T[] => ordenarNeutro(unicos(itens), (i) => [i.rotulo, i.id]);
  const noRecorte = linhas.filter((l) => l.data >= periodo.de && l.data <= periodo.ate);

  const calculo = calcularApontamento({
    linhas, periodo, diario, nivelMatriz: c.nivelMatriz, calendario, limiteAtipicoSegundos: LIMITE_ATIPICO_SEGUNDOS,
    ultimaColetaOk: fimOk === null ? null : dataIso(fimOk, calendario), pessoas, nomesReais: d.nomesReais,
    filtros: { pessoa: c.pessoa, projeto: c.projeto, tipo: c.tipo, subtarefa: c.subtarefa, subgrupo: c.subgrupo, qualidade: c.qualidade, anomalos: c.anomalos },
  });

  const incompletos = await lerCardsIncompletos(db, S, periodo.de, periodo.ate, c.projeto, c.tipo);
  const registroIncompleto = {
    total: incompletos.length,
    cards: incompletos.map((i) => ({
      cardId: i.cardId, titulo: (i.titulo ?? `Card ${i.cardId}`).slice(0, MAX_ROTULO),
      projeto: {
        id: i.projetoId ?? 'sem-projeto', rotulo: (i.projetoTitulo ?? (i.projetoId === null ? 'Sem iniciativa' : `Card ${i.projetoId}`)).slice(0, MAX_ROTULO), foraDoEscopo: i.foraDoEscopo,
      },
    })),
    projetoIds: [...new Set(incompletos.map((i) => i.projetoId ?? 'sem-projeto'))],
  };

  return {
    versaoContrato: 1,
    dominio: 'businessmap',
    periodo,
    frescor: { selo: seloFrescor(ultimaOk === null ? null : eventoDe(ultimaOk), ultima === null ? null : eventoDe(ultima), d.agora().getTime()), ultimaColetaOk: fimOk === null ? null : isoLocal(fimOk),
      ultimaTentativa: ultima === null ? null : { resultado: RESULTADO[ultima.status], fim: isoLocal(ultima.finalizadoEm.getTime()) } },
    nomesReais: d.nomesReais,
    opcoes: {
      pessoas,
      projetos: emOrdem(noRecorte.map((l) => ({ id: l.projeto.id, rotulo: l.projeto.rotulo, foraDoEscopo: l.projeto.foraDoEscopo }))),
      tipos: emOrdem(noRecorte.map((l) => l.tipo).filter((t) => t.id !== TIPO_SEM_ID)),
      subtarefas: emOrdem(linhas.map((l) => l.subtarefa)),
      subgrupos: emOrdem(noRecorte.map((l) => l.subgrupo)),
      historico,
    },
    ...calculo,
    criterios,
    registroIncompleto,
  };
}
