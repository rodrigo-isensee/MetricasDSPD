import { describe, expect, it } from 'vitest';
import { TAMANHO_LOTE } from '../src/modulos/acelerato/projetor.js';
import { VERSAO_REPROJECAO_FLUXO, reprojetarFluxoAcelerato } from '../src/modulos/acelerato/reprojecao-fluxo.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

// Pedido 105, E6.16/E6.20: `ac:reprojetar-fluxo` com o banco falso. O banco real é o `.pg.test.ts` irmão.
const S = montarEsquemas('');
const AGORA = new Date('2026-11-15T12:00:00Z');
const FIM = new Date('2026-11-15T12:00:05Z');
const etapaStg = (chamado: string, id: string, workflow: string | null) => ({
  chamado_id: chamado, id_origem: id, stg_sk: '1', payload_sha256: Buffer.alloc(32), ausente_na_extracao: false,
  payload: { descricao: 'Pendente', descricao_workflow: workflow, tempo_sla_segundos: 600, quantidade_vezes: 1 },
});

type Cenario = { lotes?: { chamado_id: string }[][]; etapas?: ReturnType<typeof etapaStg>[]; rowCount?: number; falharEm?: string; seed?: boolean };
function montar(c: Cenario = {}) {
  let lote = 0;
  return criarDublePg((q: Chamada) => {
    const t = q.texto;
    if (c.falharEm !== undefined && t.includes(c.falharEm)) return new Error('falhou');
    if (t.startsWith('SELECT count(*)')) return [{ n: c.seed === true ? '3' : '0' }];
    if (t.includes('INSERT INTO dspd_ac.ctl_coleta ')) return [{ coleta_id: '77' }];
    if (t.includes('FROM dspd_ac.dim_chamado')) return c.lotes?.[lote++] ?? [];
    if (t.includes('FROM dspd_ac.stg_etapa')) return c.etapas ?? [];
    if (t.startsWith('UPDATE dspd_ac.dim_chamado')) return { rows: [], rowCount: c.rowCount ?? 0 };
    return [];
  });
}
const ids = (...x: string[]) => x.map((chamado_id) => ({ chamado_id }));
const com = (d: ReturnType<typeof montar>, trecho: string): Chamada[] => d.chamadas.filter((x) => x.texto.includes(trecho));
const tempos = (() => { let i = 0; return () => (i++ === 0 ? AGORA : FIM); });

describe('reprojetarFluxoAcelerato', () => {
  it('chamado com fluxo nulo e um workflow ganha o fluxo; múltiplo e sem etapa seguem nulos, com as contagens', async () => {
    const d = montar({
      lotes: [ids('1', '2', '3')], rowCount: 1,
      etapas: [etapaStg('1', '5', 'Fluxo Novo'), etapaStg('2', '5', 'Fluxo A'), etapaStg('2', '6', 'Fluxo B'), etapaStg('3', '5', null)],
    });
    const r = await reprojetarFluxoAcelerato(d.pool, S, tempos());
    expect(r).toEqual({ coletaId: 77, lidos: 3, preenchidos: 1, fluxoMultiplo: 1, semFluxo: 1 });
    const up = com(d, 'UPDATE dspd_ac.dim_chamado')[0]!;
    expect(up.texto).toContain('d.fluxo IS NULL');
    expect(up.valores).toEqual([['1'], ['Fluxo Novo']]);
    expect(d.chamadas[0]!.texto).toBe('BEGIN');
    expect(d.chamadas.at(-1)!.texto).toBe('COMMIT');
    const sel = com(d, 'FROM dspd_ac.dim_chamado')[0]!;
    expect(sel.texto).toContain('fluxo IS NULL AND chamado_id > $1');
    const contagens = com(d, 'ctl_coleta_contagem').flatMap((x) => x.valores);
    expect(contagens).toContain('reprojecao_fluxo_multiplo');
  });

  it('grava a execução em ctl_coleta com a tarefa e a versão certas e a fecha com sucesso', async () => {
    const d = montar({ lotes: [ids('1')], etapas: [etapaStg('1', '5', 'Fluxo Novo')], rowCount: 1 });
    await reprojetarFluxoAcelerato(d.pool, S, tempos());
    const ctl = com(d, 'INSERT INTO dspd_ac.ctl_coleta ')[0]!;
    expect(ctl.texto).toContain("'projecao'");
    expect(ctl.texto).toContain("'em_andamento'");
    expect(ctl.valores).toEqual([AGORA, VERSAO_REPROJECAO_FLUXO]);
    expect(VERSAO_REPROJECAO_FLUXO).toBe('acelerato-f2/2-reprojecao-fluxo');
    const fim = com(d, 'UPDATE dspd_ac.ctl_coleta')[0]!;
    expect(fim.texto).toContain("status = 'sucesso'");
    expect(fim.valores).toEqual([77, FIM]);
  });

  it('K-397: lote vazio (sem mudança) não grava nada, nem ctl_coleta que moveria a marca d agua', async () => {
    const d = montar();
    expect(await reprojetarFluxoAcelerato(d.pool, S, tempos())).toEqual({ coletaId: null, lidos: 0, preenchidos: 0, fluxoMultiplo: 0, semFluxo: 0 });
    expect(d.chamadas.filter((x) => /^(INSERT|UPDATE|DELETE)/.test(x.texto))).toEqual([]);
    expect(d.chamadas.at(-1)!.texto).toBe('COMMIT');
  });

  it('K-397: só chamados sem fluxo derivável (nenhuma linha mudada): lote lido, nenhuma escrita', async () => {
    const d = montar({ lotes: [ids('1')], etapas: [] });
    expect(await reprojetarFluxoAcelerato(d.pool, S, tempos())).toMatchObject({ coletaId: null, lidos: 1, preenchidos: 0, semFluxo: 1 });
    expect(d.chamadas.filter((x) => /^(INSERT|UPDATE|DELETE)/.test(x.texto))).toEqual([]);
  });

  it('vários lotes: o cursor avança pelo último chamado_id', async () => {
    const l1 = Array.from({ length: TAMANHO_LOTE }, (_, i) => ({ chamado_id: String(1000 + i) }));
    const d = montar({ lotes: [l1, ids('9999')] });
    const r = await reprojetarFluxoAcelerato(d.pool, S, tempos());
    expect(r.lidos).toBe(TAMANHO_LOTE + 1);
    expect(com(d, 'FROM dspd_ac.dim_chamado').map((x) => x.valores[0])).toEqual(['', String(1000 + TAMANHO_LOTE - 1), '9999']);
  });

  it('falha no meio desfaz tudo (ROLLBACK) e propaga', async () => {
    const d = montar({ lotes: [ids('1')], etapas: [etapaStg('1', '5', 'Fluxo Novo')], falharEm: 'UPDATE dspd_ac.dim_chamado' });
    await expect(reprojetarFluxoAcelerato(d.pool, S, tempos())).rejects.toThrow('falhou');
    const textos = d.chamadas.map((x) => x.texto);
    expect(textos).toContain('ROLLBACK');
    expect(textos).not.toContain('COMMIT');
  });

  it('esquema com coleta do seed: a guarda recusa antes de qualquer escrita', async () => {
    const d = montar({ seed: true });
    await expect(reprojetarFluxoAcelerato(d.pool, S, tempos())).rejects.toThrow(/seed/);
    expect(d.chamadas.filter((x) => /^(INSERT|UPDATE|DELETE)/.test(x.texto))).toEqual([]);
  });
});
