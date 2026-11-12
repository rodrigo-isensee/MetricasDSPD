import { describe, expect, it } from 'vitest';
import { opcoesFiltroFluxoSchema } from '@metricas-dspd/contratos';
import { opcoesFiltro } from '../src/modulos/referencia/servico.js';
import { lerSetoresBM } from '../src/modulos/referencia/repositorio.js';
import type { Consultavel } from '../src/plataforma/db/pool.js';

// L10a do pedido 097 (E7): opcoes.setores. Nomes inventados; nada contra a base real.
const SETOR = 'setor_quadro';
const db = (setores: { codigo: string; rotulo: string }[], consultas: string[] = []): Consultavel => ({
  query: async (texto: string, valores?: unknown[]) => {
    consultas.push(texto);
    if (texto.includes('ref_dominio') && valores?.[0] === SETOR) return { rows: setores };
    if (texto.includes('ref_dominio')) return { rows: [] };
    if (texto.includes('min(')) return { rows: [{ inicio: null }] };
    return { rows: [] };
  },
}) as unknown as Consultavel;
const AGORA = new Date('2026-11-12T12:00:00-03:00');

describe('opcoes.setores (097 L10a)', () => {
  it('lista vazia enquanto o dicionário não tem linhas (P-097-9), e a resposta segue válida no contrato', async () => {
    const o = await opcoesFiltro(db([]), 'businessmap', AGORA);
    expect(o).toMatchObject({ setores: [] });
    expect(opcoesFiltroFluxoSchema.safeParse(o).success).toBe(true);
  });

  it('id = slug do nome, ordem alfabética, e dois quadros com o mesmo nome viram uma opção só', async () => {
    const o = await opcoesFiltro(db([
      { codigo: '31', rotulo: 'Plataformas' }, { codigo: '23', rotulo: 'Ciência de Dados' }, { codigo: '24', rotulo: 'Plataformas' },
    ]), 'businessmap', AGORA);
    expect((o as { setores: unknown }).setores).toEqual([{ id: 'ciencia-de-dados', nome: 'Ciência de Dados' }, { id: 'plataformas', nome: 'Plataformas' }]);
  });

  it('a leitura do banco ignora código não numérico, rótulo com sobrenome, com arroba ou vazio', async () => {
    const r = await lerSetoresBM(db([
      { codigo: 'x', rotulo: 'Plataformas' }, { codigo: '1', rotulo: 'Plataformas - SILVA' }, { codigo: '2', rotulo: 'a@b.com' },
      { codigo: '3', rotulo: '  ' }, { codigo: '4', rotulo: 'Sistemas Corporativos' },
    ]));
    expect(r).toEqual([{ id: '4', nome: 'Sistemas Corporativos' }]);
  });

  it('a consulta é parametrizada (campo por parâmetro) e nenhuma resposta traz código de quadro', async () => {
    const consultas: string[] = [];
    const o = await opcoesFiltro(db([{ codigo: '23', rotulo: 'Plataformas' }], consultas), 'businessmap', AGORA);
    expect(JSON.stringify(o)).not.toContain('"23"');
    expect(consultas.some((c) => c.includes('campo = $1'))).toBe(true);
  });

  it('a sustentação não ganha setores', async () => {
    const o = await opcoesFiltro(db([{ codigo: '23', rotulo: 'Plataformas' }]), 'acelerato', AGORA);
    expect(o).not.toHaveProperty('setores');
  });
});
