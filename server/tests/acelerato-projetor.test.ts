import { describe, expect, it } from 'vitest';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { carregarNaturezaPorPrefixo, projetarAcelerato, TAMANHO_LOTE } from '../src/modulos/acelerato/projetor.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

const S = montarEsquemas('');
const AGORA = new Date('2026-10-30T12:00:00Z');
const stg = (sk: number, id: string, payload: Record<string, unknown>, marcas: { ausente?: boolean; fora?: boolean } = {}) => ({
  stg_sk: String(sk), id_origem: id, ausente_na_extracao: marcas.ausente ?? false, fora_do_recorte: marcas.fora ?? false, coletado_em: new Date('2026-10-29T09:00:00Z'),
  payload: { ticket_key: Number(id), tipo_ticket: 'TIPO-FICTICIO', status: 'Concluído', categoria: 'PFX-I Alfa', categoria_key: 1, organizacao: 'ORG-FICTICIA', equipe: 'SSSC TOTVS',
    com_agente: true, prioridade: 'P2 - ALTO', data_criacao: '2026-09-01 09:00:00', data_pronto: '2026-09-02 15:00:00', lixeira: false, arquivado: false,
    sla_pa_violado: false, sla_pa_status: 'REALIZADO_NO_PRAZO', sla_r_violado: false, sla_r_status: 'REALIZADO_NO_PRAZO', campos: { reincidente_90d: 'sim' }, ...payload },
});
const etapaStg = (chamado: string, id: string, descricao: string, tempo: number) => ({
  chamado_id: chamado, id_origem: id, stg_sk: '1', payload_sha256: Buffer.alloc(32), ausente_na_extracao: false, payload: { descricao, descricao_workflow: null, tempo_sla_segundos: tempo, quantidade_vezes: 1 },
});

type Cenario = { pendentes: ReturnType<typeof stg>[][]; etapas?: ReturnType<typeof etapaStg>[]; naturezas?: { codigo: string; rotulo: string }[]; semPendencia?: boolean };
function montar(c: Cenario) {
  let lote = 0;
  const d = criarDublePg((q: Chamada) => {
    const t = q.texto;
    if (t.startsWith('SELECT 1 FROM')) return c.semPendencia === true ? [] : [{ '?column?': 1 }];
    if (t.includes("campo = 'natureza_prefixo'")) return c.naturezas ?? [{ codigo: 'PFX-I', rotulo: 'incidente' }, { codigo: 'PFX-R', rotulo: 'requisicao' }, { codigo: 'PFX-X', rotulo: 'outro' }];
    if (t.includes('INSERT INTO dspd_ac.ctl_coleta ')) return [{ coleta_id: '77' }];
    if (t.includes('FROM dspd_ac.stg_chamado s')) return c.pendentes[lote++] ?? [];
    if (t.includes('FROM dspd_ac.stg_etapa')) return c.etapas ?? [];
    return [];
  });
  return d;
}
const com = (d: ReturnType<typeof montar>, trecho: string): Chamada[] => d.chamadas.filter((x) => x.texto.includes(trecho));

describe('carregarNaturezaPorPrefixo', () => {
  it('lê só o domínio vigente e ignora rótulo que não é incidente nem requisição', async () => {
    const d = montar({ pendentes: [] });
    const m = await carregarNaturezaPorPrefixo(d.pool, S);
    expect([...m]).toEqual([['PFX-I', 'incidente'], ['PFX-R', 'requisicao']]);
  });
});

describe('projetarAcelerato (F2)', () => {
  it('sem versão do staging pendente: nada é gravado e não há ctl_coleta de projeção', async () => {
    const d = montar({ pendentes: [], semPendencia: true });
    const r = await projetarAcelerato(d.pool, S, () => AGORA);
    expect(r).toEqual({ coletaId: null, versoes: 0, chamados: 0, etapas: 0, semIntervalo: 0, contagens: {} });
    expect(d.chamadas.some((x) => /INSERT|UPDATE|DELETE/.test(x.texto.replace('BEGIN', '')))).toBe(false);
    expect(d.chamadas.map((x) => x.texto)).toContain('COMMIT');
  });

  it('projeta versão (append-only), vigente (upsert) e intervalos por etapa, na mesma transação, com a marca de carga', async () => {
    const d = montar({
      pendentes: [[stg(10, '1', {}), stg(11, '1', { status: 'Concluído', com_agente: false }), stg(12, '2', { data_pronto: null, prioridade: 'SSSC - INCIDENTE - ALTA' })]],
      etapas: [etapaStg('1', '5', 'Pendente', 7200), etapaStg('1', '6', 'Em Atendimento N2', 3600), etapaStg('2', '5', 'Pendente', 900)],
    });
    const r = await projetarAcelerato(d.pool, S, () => AGORA);
    expect(r).toMatchObject({ coletaId: 77, versoes: 3, chamados: 2, etapas: 2, semIntervalo: 0 });
    expect(r.contagens).toMatchObject({ sem_agente: 1, prioridade_fora_da_escala_p: 1 });
    const v = com(d, 'INSERT INTO dspd_ac.dim_chamado_versao')[0]!;
    expect(v.texto).toContain('ON CONFLICT ON CONSTRAINT uq_dim_chamado_versao DO NOTHING');
    expect(v.valores.filter((x) => x === '10' || x === '11' || x === '12')).toEqual(['10', '11', '12']); // stg_chamado_sk de cada versão
    const dim = com(d, 'INSERT INTO dspd_ac.dim_chamado ')[0]!;
    expect(dim.texto).not.toContain('ON CONFLICT');
    expect(dim.valores.filter((x) => x === '1' || x === '2')).toEqual(['1', '2']);
    expect(com(d, 'DELETE FROM dspd_ac.dim_chamado WHERE')[0]!.valores).toEqual([['1', '2']]);
    const apagou = com(d, 'DELETE FROM dspd_ac.fato_etapa_chamado')[0]!;
    expect(apagou.valores).toEqual([['1', '2']]);
    const fato = com(d, 'INSERT INTO dspd_ac.fato_etapa_chamado')[0]!;
    expect(fato.valores.filter((x) => x === 'Pendente' || x === 'Em atendimento N2')).toEqual(['Em atendimento N2', 'Pendente']);
    expect(com(d, 'UPDATE dspd_ac.ctl_coleta')[0]!.valores[0]).toBe(77);
    expect(com(d, 'INSERT INTO dspd_ac.ctl_coleta_contagem').map((x) => x.valores[1])).toEqual(expect.arrayContaining(['projecao_versao', 'projecao_chamado', 'projecao_etapa', 'projecao_sem_agente']));
    // BEGIN primeiro, COMMIT por último: tudo atômico.
    expect(d.chamadas[0]!.texto).toBe('BEGIN');
    expect(d.chamadas.at(-1)!.texto).toBe('COMMIT');
  });

  it('chamado aberto, excluído ou fora do recorte não gera intervalo por etapa; a vigente é a última versão do lote', async () => {
    const d = montar({
      pendentes: [[stg(20, '3', { data_pronto: null }), stg(21, '4', { lixeira: true }), stg(22, '5', {}, { fora: true }), stg(23, '5', {}, { ausente: true })]],
      etapas: ['3', '4', '5'].map((c) => etapaStg(c, '9', 'Pendente', 3600)),
    });
    const r = await projetarAcelerato(d.pool, S, () => AGORA);
    expect(r).toMatchObject({ versoes: 4, chamados: 3, etapas: 0 });
    expect(com(d, 'INSERT INTO dspd_ac.fato_etapa_chamado')).toHaveLength(0);
  });

  it('etapa cujo total não cabe na busca é contada em projecao_etapa_sem_intervalo', async () => {
    const d = montar({ pendentes: [[stg(30, '6', {})]], etapas: [etapaStg('6', '1', 'Pendente', 1e15)] });
    const r = await projetarAcelerato(d.pool, S, () => AGORA);
    expect(r).toMatchObject({ etapas: 0, semIntervalo: 1 });
    expect(com(d, 'INSERT INTO dspd_ac.ctl_coleta_contagem').map((x) => x.valores[1])).toContain('projecao_etapa_sem_intervalo');
  });

  it('vários lotes: continua do último stg_sk até acabar', async () => {
    const l1 = Array.from({ length: TAMANHO_LOTE }, (_, i) => stg(100 + i, String(1000 + i), {}));
    const d = montar({ pendentes: [l1, [stg(5000, '2000', {})]] });
    const r = await projetarAcelerato(d.pool, S, () => AGORA);
    expect(r.versoes).toBe(TAMANHO_LOTE + 1);
    const consultas = com(d, 'FROM dspd_ac.stg_chamado s').filter((x) => !x.texto.startsWith('SELECT 1'));
    expect(consultas.map((x) => x.valores[0])).toEqual(['0', String(100 + TAMANHO_LOTE - 1), '5000']);
  });

  it('falha no meio desfaz tudo (ROLLBACK) e propaga', async () => {
    const d = criarDublePg((q) => (q.texto.includes('INSERT INTO dspd_ac.dim_chamado_versao') ? new Error('falhou') : q.texto.startsWith('SELECT 1 FROM') ? [{ x: 1 }] : q.texto.includes('INSERT INTO dspd_ac.ctl_coleta ') ? [{ coleta_id: '1' }] : q.texto.includes('FROM dspd_ac.stg_chamado s') ? [stg(1, '1', {})] : []));
    await expect(projetarAcelerato(d.pool, S, () => AGORA)).rejects.toThrow('falhou');
    expect(d.chamadas.map((x) => x.texto)).toContain('ROLLBACK');
  });
});
