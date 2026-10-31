import { estadoColetaSchema, paginaColetasSchema } from '@metricas-dspd/contratos';
import { describe, expect, it } from 'vitest';
import { agregarContagens, classificarErro, eventoDeLinhas, type LinhaColeta } from '../src/modulos/operacao/eventos.js';
import { lerEventos, lerVersoes } from '../src/modulos/operacao/repositorio.js';
import { estadoColeta, historicoColetas } from '../src/modulos/operacao/servico.js';
import { lerVersaoCriterioVigente } from '../src/modulos/referencia/repositorio.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg } from './duble-pg.js';

const d = (iso: string): Date => new Date(iso);
const linha = (status: LinhaColeta['status'], erro: string | null = null): LinhaColeta => ({
  coletaId: 7, iniciadoEm: d('2026-10-09T09:00:00Z'), finalizadoEm: d('2026-10-09T09:01:00Z'), status, erroResumo: erro,
});

describe('classificarErro: só categoria, nunca o texto', () => {
  it('categorias conhecidas, desconhecidas e nulo', () => {
    expect(classificarErro('tempo-esgotado: GET https://x?apikey=SEGREDO')).toBe('tempo-esgotado');
    expect(classificarErro('SELECT * FROM t -- senha=1')).toBe('desconhecido');
    expect(classificarErro(null)).toBe('desconhecido');
  });
});

describe('eventoDeLinhas', () => {
  const cont = [
    { coletaId: 7, entidade: 'card', lidos: '10', inseridos: '3', jaExistentes: '7' },
    { coletaId: 7, entidade: 'arquivado_preservado', lidos: 5, inseridos: 0, jaExistentes: 0 },
    { coletaId: 7, entidade: 'excluido_preservado', lidos: 2, inseridos: 0, jaExistentes: 0 },
  ];
  it('sucesso, parcial e falha', () => {
    expect(eventoDeLinhas('bm', linha('sucesso'), cont)).toMatchObject({ id: 'bm-7', inicio: '2026-10-09T06:00:00-03:00', duracaoMs: 60000,
      resultado: 'ok', tipoErro: null, efeito: 'aplicada',
      contagens: { lidos: 10, novos: 3, atualizados: 7, arquivadosPreservados: 5, excluidosPreservados: 2 } });
    expect(eventoDeLinhas('ac', linha('parcial', 'dados-invalidos: x'), cont)).toMatchObject({ resultado: 'parcial', tipoErro: 'dados-invalidos', efeito: 'parcial-aplicada' });
    expect(eventoDeLinhas('bm', linha('falha', 'boom'), cont)).toMatchObject({ resultado: 'falha', tipoErro: 'desconhecido', efeito: 'anteriores-mantidos', contagens: null });
    expect(agregarContagens([])).toEqual({ lidos: 0, novos: 0, atualizados: 0, arquivadosPreservados: 0, excluidosPreservados: 0 });
  });
});

const coleta = (id: string, status: string, erro: string | null = null) => ({
  coleta_id: id, iniciado_em: d('2026-10-08T09:00:00Z'), finalizado_em: d('2026-10-08T09:01:00Z'), status, erro_resumo: erro,
});
const responder = (c: { texto: string }): unknown[] => {
  if (c.texto.includes('ctl_coleta_contagem'))
    return [
      { coleta_id: '1', entidade: 'card', lidos: 10, inseridos: 4, ja_existentes: 6 },
      { coleta_id: '1', entidade: 'card', lidos: '5', inseridos: '1', ja_existentes: '4' },
    ];
  if (c.texto.includes('ctl_coleta')) return [coleta('1', 'sucesso'), coleta('2', 'falha', 'tempo-esgotado: x'), coleta('3', 'parcial')];
  return [];
};

describe('lerEventos', () => {
  it('consulta só o schema da fonte, sem parâmetros, e agrega contagens por coleta', async () => {
    const { pool, chamadas } = criarDublePg(responder);
    const ev = await lerEventos(pool, 'businessmap');
    expect(chamadas.every((c) => c.texto.includes('dspd_bm.') && !c.texto.includes('dspd_ac') && c.valores.length === 0)).toBe(true);
    expect(ev.map((e) => e.id)).toEqual(['bm-1', 'bm-2', 'bm-3']);
    expect(ev[0]!.contagens).toMatchObject({ lidos: 15, novos: 5, atualizados: 10 });
    expect(ev[1]).toMatchObject({ resultado: 'falha', tipoErro: 'tempo-esgotado', contagens: null });
    expect(ev[2]!.contagens).toMatchObject({ lidos: 0 });
  });
  it('acelerato usa o schema ac com prefixo e o prefixo de id ac', async () => {
    const { pool, chamadas } = criarDublePg(responder);
    expect((await lerEventos(pool, 'acelerato', montarEsquemas('t_')))[0]!.id).toBe('ac-1');
    expect(chamadas[0]!.texto).toContain('t_dspd_ac.ctl_coleta');
  });
});

describe('lerVersoes', () => {
  it('agrupa métricas por versão, ignora ids desconhecidos e parametriza o domínio', async () => {
    const { pool, chamadas } = criarDublePg(() => [
      { versao_id: '1', vigente_desde: '2026-09-01', descricao: 'a', metrica_id: 'O2' },
      { versao_id: '1', vigente_desde: '2026-09-01', descricao: 'a', metrica_id: 'O3' },
      { versao_id: '1', vigente_desde: '2026-09-01', descricao: 'a', metrica_id: 'XX' },
      { versao_id: '2', vigente_desde: '2026-09-02', descricao: 'b', metrica_id: 'XX' },
    ]);
    const v = await lerVersoes(pool, 'businessmap');
    expect(chamadas[0]!.valores).toEqual(['businessmap']);
    expect(chamadas[0]!.texto).toContain('dspd_core.ref_versao_criterio');
    // filtro novo: só versão que afeta alguma métrica (o dublê ignora o SQL, então o filtro é afirmado no texto)
    expect(chamadas[0]!.texto).toContain('m.metrica_id IS NOT NULL');
    expect(v).toHaveLength(2);
    expect(v[0]).toMatchObject({ id: '1', data: '2026-09-01' });
    expect(v[0]!.afeta).toHaveLength(2);
    expect(v[1]!.afeta).toEqual([]);
  });
});

describe('lerVersaoCriterioVigente', () => {
  it('aplica o mesmo critério do lerVersoes (só versão com métrica) e parametriza a data', async () => {
    const { pool, chamadas } = criarDublePg(() => [{ versao_id: '9' }]);
    expect(await lerVersaoCriterioVigente(pool, '2026-10-01')).toBe('9');
    expect(chamadas[0]!.valores).toEqual(['2026-10-01']);
    expect(chamadas[0]!.texto).toMatch(/versao_id IN \(SELECT versao_id FROM dspd_core\.ref_versao_criterio_metrica\)/);
    expect(await lerVersaoCriterioVigente(criarDublePg(() => []).pool, '2026-10-01')).toBeNull();
  });
});

describe('servico', () => {
  it('estado de uma fonte sem coletas', async () => {
    const { pool } = criarDublePg();
    expect((await estadoColeta(pool, 'acelerato', d('2026-10-09T21:00:00Z'))).selo).toBe('sem-coleta');
  });
  it('estado reflete falha mais recente e é um DTO válido', async () => {
    const { pool } = criarDublePg((c) => (c.texto.includes('ctl_coleta_contagem') ? [] : c.texto.includes('ctl_coleta') ? [coleta('2', 'falha', 'tempo-esgotado: x')] : []));
    const e = estadoColetaSchema.parse(await estadoColeta(pool, 'businessmap', d('2026-10-08T21:00:00Z'), montarEsquemas()));
    expect(e.selo).toBe('falha');
  });
  it('histórico paginado, válido pelo contrato', async () => {
    const { pool } = criarDublePg(responder);
    expect(paginaColetasSchema.parse(await historicoColetas(pool, 'businessmap', 1))).toMatchObject({ total: 3, pagina: 1 });
  });
});
