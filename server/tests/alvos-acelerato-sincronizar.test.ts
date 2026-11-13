import { describe, expect, it } from 'vitest';
import { ErroAlvos, analisarAlvos, lerArquivoAlvos, sincronizarAlvos } from '../src/modulos/referencia/alvos-acelerato.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

// Pedido 099, D3: o carregador de alvos (lerEstado e sincronizarAlvos) sem banco, com o pool falso. O `.pg` cobre o mesmo contra o Postgres real;
// o job `testes` da CI pula os `.pg`, então a cobertura de 100% precisa deste teste.
const S = montarEsquemas();
const AGORA = new Date('2031-01-10T12:00:00.000Z');
const lido = lerArquivoAlvos();
type LinhaEstado = { prioridade: string; vigente_de: string; vigente_ate: string | null; prazo_pa_horas: string; unidade_pa: string; prazo_r_horas: string; unidade_r: string };

/** Uma vigência aberta por prioridade, iguais ao arquivo (o que o carregador grava). */
const gravadas = (de: string): LinhaEstado[] =>
  lido.arquivo.alvos.map((a) => ({
    prioridade: a.prioridade, vigente_de: de, vigente_ate: null,
    prazo_pa_horas: a.primeiro_atendimento.horas.toFixed(2), unidade_pa: a.primeiro_atendimento.unidade,
    prazo_r_horas: a.restauracao.horas.toFixed(2), unidade_r: a.restauracao.unidade,
  }));

function montar(estado: LinhaEstado[], ultimaVersao: string | null, versaoExiste = false) {
  return criarDublePg((c: Chamada) => {
    if (c.texto.includes('FROM ' + S.ac + '.ref_alvo_prioridade')) return estado;
    if (c.texto.includes('max(vigente_desde)')) return [{ ultima: ultimaVersao }];
    if (c.texto.includes('SELECT versao_id')) return versaoExiste ? [{ versao_id: '7' }] : [];
    if (c.texto.includes('INSERT INTO ' + S.core + '.ref_versao_criterio ')) return [{ versao_id: '9' }];
    return [];
  });
}
const escritas = (cs: Chamada[]): string[] => cs.map((c) => c.texto).filter((t) => /^\s*(INSERT|UPDATE)/.test(t));

describe('sincronizarAlvos (pool falso)', () => {
  it('banco vazio: grava as 5 vigências, registra a versão de critério com S1 e Visão geral e confirma a transação', async () => {
    const d = montar([], null);
    const r = await sincronizarAlvos(d.pool, S, lido, '2031-01-10', AGORA);
    expect(r).toEqual({ sha256: lido.sha256, inseridos: 5, fechados: 0, versaoRegistrada: true });
    const textos = d.chamadas.map((c) => c.texto);
    expect(textos[0]).toBe('BEGIN');
    expect(textos.at(-1)).toBe('COMMIT');
    expect(escritas(d.chamadas).filter((t) => t.includes('ref_alvo_prioridade'))).toHaveLength(5);
    const metricas = d.chamadas.filter((c) => c.texto.includes('ref_versao_criterio_metrica')).map((c) => c.valores);
    expect(metricas).toEqual([['9', 'S1'], ['9', 'VISAO_GERAL']]);
    const ins = d.chamadas.find((c) => c.texto.includes('ref_alvo_prioridade (prioridade'))!;
    expect(ins.valores).toEqual(['P1', '2031-01-10', 0.25, 'corrido', 4, 'corrido']);
  });

  it('arquivo igual ao gravado: não escreve nada (idempotente), mesmo em outra data', async () => {
    const d = montar(gravadas('2031-01-01'), '2031-01-01');
    expect(await sincronizarAlvos(d.pool, S, lido, '2031-02-01', AGORA)).toEqual({ sha256: lido.sha256, inseridos: 0, fechados: 0, versaoRegistrada: false });
    expect(escritas(d.chamadas)).toEqual([]);
  });

  it('um prazo mudou: fecha a vigência aberta só daquela prioridade, abre a nova e registra a versão', async () => {
    const estado = gravadas('2031-01-01');
    estado[2]!.unidade_pa = 'corrido'; // P3 difere do arquivo (util)
    const d = montar(estado, '2031-01-01');
    expect(await sincronizarAlvos(d.pool, S, lido, '2031-02-01', AGORA)).toEqual({ sha256: lido.sha256, inseridos: 1, fechados: 1, versaoRegistrada: true });
    const fecha = d.chamadas.filter((c) => c.texto.startsWith('UPDATE'));
    expect(fecha.map((c) => c.valores)).toEqual([['2031-02-01', 'P3']]);
  });

  it('versão de critério do mesmo arquivo já registrada: grava as vigências sem duplicar a versão', async () => {
    const d = montar([], '2031-01-01', true);
    expect(await sincronizarAlvos(d.pool, S, lido, '2031-02-01', AGORA)).toEqual({ sha256: lido.sha256, inseridos: 5, fechados: 0, versaoRegistrada: false });
    expect(d.chamadas.some((c) => c.texto.includes('INSERT INTO ' + S.core))).toBe(false);
  });

  it('data que não é posterior à última vigência (aberta ou fechada) da prioridade: recusa e desfaz a transação', async () => {
    const aberta = montar(gravadas('2031-02-01').map((l, i) => (i === 0 ? { ...l, prazo_pa_horas: '1.00' } : l)), null);
    await expect(sincronizarAlvos(aberta.pool, S, lido, '2031-02-01', AGORA)).rejects.toBeInstanceOf(ErroAlvos);
    expect(aberta.chamadas.map((c) => c.texto).at(-1)).toBe('ROLLBACK');
    expect(escritas(aberta.chamadas)).toEqual([]);
    // vigência fechada: vale o vigente_ate (posterior ao vigente_de); uma antiga e a nova aberta na mesma prioridade ficam com a maior data
    const fechada: LinhaEstado[] = [
      { ...gravadas('2030-01-01')[0]!, vigente_ate: '2031-03-01' },
      { ...gravadas('2031-03-01')[0]!, prazo_pa_horas: '1.00' },
    ];
    await expect(sincronizarAlvos(montar(fechada, null).pool, S, lido, '2031-03-01', AGORA)).rejects.toThrow(/não é posterior à última vigência \(2031-03-01\)/);
    // vigência fechada no próprio dia em que abriu (vigente_ate = vigente_de): vale o vigente_de
    const mesmoDia: LinhaEstado[] = [{ ...gravadas('2031-03-05')[0]!, vigente_ate: '2031-03-05' }];
    await expect(sincronizarAlvos(montar(mesmoDia, null).pool, S, lido, '2031-03-05', AGORA)).rejects.toBeInstanceOf(ErroAlvos);
  });

  it('data anterior à última versão de critério dos alvos: recusa; data inválida: recusa sem abrir transação', async () => {
    const d = montar([], '2031-05-01');
    await expect(sincronizarAlvos(d.pool, S, lido, '2031-04-01', AGORA)).rejects.toThrow(/anterior à última versão de critério/);
    const invalida = montar([], null);
    await expect(sincronizarAlvos(invalida.pool, S, lido, '2031-02-30', AGORA)).rejects.toThrow(/data de vigência inválida/);
    expect(invalida.estado.conexoes).toBe(0);
  });

  it('arquivo que não é um objeto: o erro aponta a raiz, sem vazar o conteúdo', () => {
    expect(() => analisarAlvos('[]')).toThrow('o arquivo de alvos é inválido (raiz)');
  });
});
