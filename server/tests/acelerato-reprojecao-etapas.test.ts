import { acelerato } from '@metricas-dspd/metricas';
import { FERIADOS_NACIONAIS, horasUteisEntre } from '@metricas-dspd/metricas/core';
import { describe, expect, it } from 'vitest';
import { TAMANHO_LOTE } from '../src/modulos/acelerato/projetor.js';
import { ErroReprojecao, VERSAO_REPROJECAO_D7, reprojetarEtapasAcelerato } from '../src/modulos/acelerato/reprojecao-etapas.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

// K-308 (ADR 0027, item 7.4): comando de reprojeção, com o banco falso. O banco real é o `.pg.test.ts` irmão.
const S = montarEsquemas('');
const SUST = acelerato.CALENDARIO_SUSTENTACAO_PADRAO;
const AGORA = new Date('2026-11-14T02:30:00Z'); // 23:30 de 13/11 em Brasília
const dim = (id: string, over: Record<string, unknown> = {}) => ({ chamado_id: id, data_finalizado: new Date('2026-09-16T18:00:00Z'), excluido: false, fora_do_recorte: false, ...over });
const etapaStg = (chamado: string, id: string, descricao: string, tempo: number) => ({
  chamado_id: chamado, id_origem: id, stg_sk: '1', payload_sha256: Buffer.alloc(32), ausente_na_extracao: false, payload: { descricao, descricao_workflow: null, tempo_sla_segundos: tempo, quantidade_vezes: 1 },
});
const TURNOS_528 = [{ dia_semana: 1, inicio_min: 480, fim_min: 720 }, { dia_semana: 1, inicio_min: 780, fim_min: 1068 }];
const turnosDeSemana = (base: { inicio_min: number; fim_min: number }[]) => [1, 2, 3, 4, 5].flatMap((d) => base.map((t) => ({ ...t, dia_semana: d })));

type Cenario = {
  calendario?: { offset_minutos: number; feriados: string[] } | null; turnos?: { dia_semana: number; inicio_min: number; fim_min: number }[];
  lotes?: ReturnType<typeof dim>[][]; etapas?: ReturnType<typeof etapaStg>[]; versaoExiste?: boolean; falharEm?: string;
};
function montar(c: Cenario = {}) {
  let lote = 0;
  const cal = c.calendario === undefined ? { offset_minutos: -180, feriados: [...FERIADOS_NACIONAIS] } : c.calendario;
  return criarDublePg((q: Chamada) => {
    const t = q.texto;
    if (c.falharEm !== undefined && t.includes(c.falharEm)) return new Error('falhou');
    if (t.includes('ref_calendario_turno')) return c.turnos ?? turnosDeSemana(TURNOS_528.map(({ inicio_min, fim_min }) => ({ inicio_min, fim_min })));
    if (t.includes('FROM dspd_core.ref_calendario_aplicacao')) return cal === null ? [] : [{ calendario_id: '2', offset_minutos: cal.offset_minutos }];
    if (t.includes('FROM dspd_core.ref_feriado')) return (cal?.feriados ?? []).map((data) => ({ data }));
    if (t.startsWith('SELECT count(*)')) return [{ n: '0' }];
    if (t.includes('SELECT 1 FROM dspd_core.ref_versao_criterio')) return c.versaoExiste === true ? [{ x: 1 }] : [];
    if (t.includes('INSERT INTO dspd_core.ref_versao_criterio (')) return [{ versao_id: '9' }];
    if (t.includes('INSERT INTO dspd_ac.ctl_coleta ')) return [{ coleta_id: '88' }];
    if (t.includes('FROM dspd_ac.dim_chamado')) return c.lotes?.[lote++] ?? [];
    if (t.includes('FROM dspd_ac.stg_etapa')) return c.etapas ?? [];
    return [];
  });
}
const gravacoes = (d: ReturnType<typeof montar>) => d.chamadas.filter((x) => /^(INSERT|UPDATE|DELETE)/.test(x.texto));
const com = (d: ReturnType<typeof montar>, trecho: string): Chamada[] => d.chamadas.filter((x) => x.texto.includes(trecho));

describe('reprojetarEtapasAcelerato: pré-condição (sem gravar nada)', () => {
  const recusa = async (c: Cenario): Promise<{ msg: string; d: ReturnType<typeof montar> }> => {
    const d = montar(c);
    const msg = await reprojetarEtapasAcelerato(d.pool, S, () => AGORA).then(() => '', (e: unknown) => (e instanceof ErroReprojecao ? e.message : `outro: ${String(e)}`));
    expect(gravacoes(d)).toEqual([]);
    expect(d.chamadas.map((x) => x.texto)).toContain('ROLLBACK');
    return { msg, d };
  };

  it('sem calendário da Sustentação na referência: recusa pedindo o ref:sync-calendario', async () => {
    const { msg } = await recusa({ calendario: null });
    expect(msg).toMatch(/rode ref:sync-calendario antes/);
  });
  it('turnos diferentes: lista só os turnos', async () => {
    const { msg } = await recusa({ turnos: turnosDeSemana([{ inicio_min: 480, fim_min: 720 }, { inicio_min: 780, fim_min: 1020 }]) });
    expect(msg).toContain('turnos: referência 480-720;780-1020, código 480-720;780-1068');
    expect(msg).not.toMatch(/feriado|deslocamento/);
  });
  it('deslocamento diferente e feriados a mais e a menos, por data: lista só o que diverge', async () => {
    const [primeiro, ...resto] = [...FERIADOS_NACIONAIS];
    const { msg } = await recusa({ calendario: { offset_minutos: -120, feriados: [...resto, '2027-01-01'] } });
    expect(msg).toContain('deslocamento: referência -120, código -180');
    expect(msg).toContain('feriado a mais na referência: 2027-01-01');
    expect(msg).toContain(`feriado a menos na referência: ${primeiro}`);
    expect(msg).not.toMatch(/turnos:/);
  });
  it('turno inválido na referência (fim de semana) não vira recusa de calendário: o erro da leitura propaga e nada é gravado', async () => {
    const d = montar({ turnos: [{ dia_semana: 0, inicio_min: 480, fim_min: 720 }] });
    await expect(reprojetarEtapasAcelerato(d.pool, S, () => AGORA)).rejects.toThrow(/dia 0/);
    expect(gravacoes(d)).toEqual([]);
  });
});

describe('reprojetarEtapasAcelerato: reprojeção', () => {
  it('refaz só fato_etapa_chamado em 8 h 48 numa transação, com ctl_coleta de projeção, versão nova e saída só com contagens', async () => {
    const d = montar({
      lotes: [[dim('1'), dim('2')]],
      etapas: [etapaStg('1', '5', 'Pendente', 16 * 3600), etapaStg('2', '5', 'Aguardando Atribuição', 720), etapaStg('2', '6', 'Em Atendimento N2', 1e15)],
    });
    const r = await reprojetarEtapasAcelerato(d.pool, S, () => AGORA);
    expect(r).toEqual({ vigenteDesde: '2026-11-13', versaoNova: true, coletaId: 88, chamados: 2, etapas: 2, semIntervalo: 1 });
    expect(Object.keys(r).sort()).toEqual(['chamados', 'coletaId', 'etapas', 'semIntervalo', 'versaoNova', 'vigenteDesde']);
    expect(d.chamadas[0]!.texto).toBe('BEGIN');
    expect(d.chamadas.at(-1)!.texto).toBe('COMMIT');
    // só fato_etapa_chamado, ctl_coleta e a versão de critério são escritos
    const alvos = new Set(gravacoes(d).map((x) => /^(?:INSERT INTO|UPDATE|DELETE FROM) (\S+)/.exec(x.texto)![1]));
    expect([...alvos].sort()).toEqual(['dspd_ac.ctl_coleta', 'dspd_ac.fato_etapa_chamado', 'dspd_core.ref_versao_criterio', 'dspd_core.ref_versao_criterio_metrica']);
    const ctl = com(d, 'INSERT INTO dspd_ac.ctl_coleta ')[0]!;
    expect(ctl.texto).toContain("'projecao'");
    expect(ctl.valores).toEqual([AGORA, VERSAO_REPROJECAO_D7]);
    expect(VERSAO_REPROJECAO_D7).toBe('acelerato-f2/2-reprojecao-d7');
    expect(com(d, 'UPDATE dspd_ac.ctl_coleta')[0]!.valores[0]).toBe(88);
    expect(com(d, 'INSERT INTO dspd_core.ref_versao_criterio (')[0]!.valores.slice(0, 1)).toEqual(['2026-11-13']);
    expect(com(d, 'DELETE FROM dspd_ac.fato_etapa_chamado')[0]!.valores).toEqual([['1', '2']]);
    const fato = com(d, 'INSERT INTO dspd_ac.fato_etapa_chamado')[0]!;
    const [c1, , e1, s1] = fato.valores as string[];
    expect(c1).toBe('1');
    expect(horasUteisEntre(new Date(e1!).getTime(), new Date(s1!).getTime(), SUST)).toBeCloseTo(16, 6);
  });
  it('a seleção pede só chamado fechado, não excluído e dentro do recorte, em lotes por chamado_id', async () => {
    const l1 = Array.from({ length: TAMANHO_LOTE }, (_, i) => dim(String(1000 + i)));
    const d = montar({ lotes: [l1, [dim('9999')]] });
    const r = await reprojetarEtapasAcelerato(d.pool, S, () => AGORA);
    expect(r.chamados).toBe(TAMANHO_LOTE + 1);
    const consultas = com(d, 'FROM dspd_ac.dim_chamado');
    expect(consultas[0]!.texto).toMatch(/data_finalizado IS NOT NULL AND NOT excluido AND NOT fora_do_recorte AND chamado_id > \$1/);
    expect(consultas.map((x) => x.valores[0])).toEqual(['', String(1000 + TAMANHO_LOTE - 1), '9999']);
  });
  it('base sem chamado fechado: versão e ctl_coleta gravados, nenhum intervalo, contagens zeradas', async () => {
    const d = montar();
    expect(await reprojetarEtapasAcelerato(d.pool, S, () => AGORA)).toMatchObject({ chamados: 0, etapas: 0, semIntervalo: 0, versaoNova: true });
    expect(com(d, 'fato_etapa_chamado')).toHaveLength(0);
  });
  it('repetir é seguro: com a versão já gravada não duplica (versaoNova false), mas refaz os intervalos e abre outro ctl_coleta', async () => {
    const d = montar({ versaoExiste: true, lotes: [[dim('1')]], etapas: [etapaStg('1', '5', 'Pendente', 3600)] });
    expect(await reprojetarEtapasAcelerato(d.pool, S, () => AGORA)).toMatchObject({ versaoNova: false, chamados: 1, etapas: 1 });
    expect(com(d, 'INSERT INTO dspd_core.ref_versao_criterio')).toHaveLength(0);
    expect(com(d, 'INSERT INTO dspd_ac.ctl_coleta ')).toHaveLength(1);
  });
  it('turnos gravados vazios valem como os da Sustentação (mesma regra da medição nas métricas)', async () => {
    const d = montar({ turnos: [], lotes: [[dim('1')]], etapas: [etapaStg('1', '5', 'Pendente', 3600)] });
    // `[]` sem linhas: lerTurnosVigentes devolve lista vazia e o comando segue
    expect(await reprojetarEtapasAcelerato(d.pool, S, () => AGORA)).toMatchObject({ chamados: 1, etapas: 1 });
  });
  it('falha no meio desfaz tudo (ROLLBACK) e propaga', async () => {
    const d = montar({ lotes: [[dim('1')]], etapas: [etapaStg('1', '5', 'Pendente', 3600)], falharEm: 'INSERT INTO dspd_ac.fato_etapa_chamado' });
    await expect(reprojetarEtapasAcelerato(d.pool, S, () => AGORA)).rejects.toThrow('falhou');
    expect(d.chamadas.map((x) => x.texto)).toContain('ROLLBACK');
    expect(d.chamadas.map((x) => x.texto)).not.toContain('COMMIT');
  });
  it('esquema com coleta do seed: a guarda recusa antes de qualquer escrita', async () => {
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT count(*)') ? [{ n: '3' }] : []));
    await expect(reprojetarEtapasAcelerato(d.pool, S, () => AGORA)).rejects.toThrow(/seed/);
    expect(gravacoes(d as unknown as ReturnType<typeof montar>)).toEqual([]);
  });
});
