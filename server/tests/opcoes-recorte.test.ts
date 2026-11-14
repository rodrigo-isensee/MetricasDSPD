import { describe, expect, it } from 'vitest';
import { opcoesFiltroSchema } from '@metricas-dspd/contratos';
import { opcoesFiltro } from '../src/modulos/referencia/servico.js';
import { lerRecorteAC } from '../src/modulos/referencia/repositorio.js';
import type { Consultavel } from '../src/plataforma/db/pool.js';

// K-215: opcoes.recorte (Sustentação) a partir do ref_dominio do Acelerato. Rótulos inventados; nada contra a base real.
type Linha = { campo: string; rotulo: string };
const ORG: Linha = { campo: 'organizacao_recorte', rotulo: 'Organização Alfa - Sustentação' };
const TIPO: Linha = { campo: 'tipo_recorte', rotulo: 'Tipo Beta - SSSC' };
const EQ1: Linha = { campo: 'equipe', rotulo: 'SSSC UM' };
const EQ2: Linha = { campo: 'equipe', rotulo: 'SSSC DOIS' };
const db = (linhas: Linha[], consultas: { texto: string; valores?: unknown[] }[] = []): Consultavel => ({
  query: async (texto: string, valores?: unknown[]) => {
    consultas.push({ texto, valores });
    if (texto.includes('ref_dominio')) return { rows: linhas };
    if (texto.includes('min(')) return { rows: [{ inicio: null }] };
    return { rows: [] };
  },
}) as unknown as Consultavel;
const AGORA = new Date('2026-11-14T12:00:00-03:00');

describe('opcoes.recorte (K-215)', () => {
  it('traz os rótulos vigentes literais das três listas, na ordem do banco, e a resposta é válida no contrato estrito', async () => {
    const o = await opcoesFiltro(db([ORG, TIPO, EQ1, EQ2]), 'acelerato', AGORA);
    expect(o).toMatchObject({ recorte: { organizacoes: ['Organização Alfa - Sustentação'], tipos: ['Tipo Beta - SSSC'], equipes: ['SSSC UM', 'SSSC DOIS'] } });
    expect(opcoesFiltroSchema.safeParse(o).success).toBe(true);
  });

  it('lista de N itens em cada campo (serve ao recorte ampliado)', async () => {
    const o = await opcoesFiltro(db([ORG, { ...ORG, rotulo: 'Org Dois' }, TIPO, EQ1, EQ2, { campo: 'equipe', rotulo: 'SSSC TRES' }]), 'acelerato', AGORA);
    expect((o as { recorte: { organizacoes: string[]; equipes: string[] } }).recorte.organizacoes).toEqual(['Organização Alfa - Sustentação', 'Org Dois']);
    expect((o as { recorte: { equipes: string[] } }).recorte.equipes).toHaveLength(3);
  });

  it.each([
    ['organização', [TIPO, EQ1]],
    ['tipo', [ORG, EQ1]],
    // sonda review dc171ab S1: `repositorio.ts:57` `recorte.equipes.length > 0` trocado por `>= 0` · espera: vermelho (este caso e o do rótulo ruim que esvazia a lista)
    ['equipe', [ORG, TIPO]],
    ['todas', []],
  ])('lista de %s vazia: o campo recorte não vai (nunca lista vazia)', async (_nome, linhas) => {
    const o = await opcoesFiltro(db(linhas as Linha[]), 'acelerato', AGORA);
    expect(o).not.toHaveProperty('recorte');
    expect(opcoesFiltroSchema.safeParse(o).success).toBe(true);
  });

  it('rótulo com arroba, controle, formatação invisível, vazio ou longo demais é ignorado; se a lista esvazia, o campo some', async () => {
    const ruins = ['a@b.com', 'x\ty', 'x​y', '', 'x'.repeat(121)];
    const r = await lerRecorteAC(db([ORG, TIPO, EQ1, ...ruins.map((rotulo) => ({ campo: 'equipe', rotulo }))]));
    expect(r?.equipes).toEqual(['SSSC UM']);
    expect(await lerRecorteAC(db([ORG, TIPO, { campo: 'equipe', rotulo: 'a@b.com' }]))).toBeNull();
    expect((await lerRecorteAC(db([ORG, TIPO, { campo: 'equipe', rotulo: 'x'.repeat(120) }])))?.equipes).toHaveLength(1);
  });

  it('linha de outro campo do ref_dominio não entra em nenhuma lista', async () => {
    const r = await lerRecorteAC(db([ORG, TIPO, EQ1, { campo: 'etapa', rotulo: 'Etapa X' }]));
    expect(r).toEqual({ organizacoes: [ORG.rotulo], tipos: [TIPO.rotulo], equipes: ['SSSC UM'] });
  });

  it('a consulta é parametrizada, só vigentes, lê só campo e rótulo (sem chave nem pessoa) e a resposta não traz chave numérica', async () => {
    const consultas: { texto: string; valores?: unknown[] }[] = [];
    const o = await opcoesFiltro(db([ORG, TIPO, EQ1], consultas), 'acelerato', AGORA);
    const c = consultas.find((x) => x.texto.includes('ref_dominio'));
    expect(c?.texto).toMatch(/SELECT campo, rotulo FROM dspd_ac\.ref_dominio/);
    expect(c?.texto).toContain('vigente_ate IS NULL');
    expect(c?.texto).toContain('ORDER BY campo, ordem, codigo');
    expect(c?.valores).toEqual([['organizacao_recorte', 'tipo_recorte', 'equipe']]);
    expect(JSON.stringify(o)).not.toMatch(/codigo|"3"|"23"/);
  });

  it('o BusinessMap nunca traz recorte (fontes não se misturam)', async () => {
    const consultas: { texto: string; valores?: unknown[] }[] = [];
    const o = await opcoesFiltro(db([], consultas), 'businessmap', AGORA);
    expect(consultas.some((x) => x.texto.includes('dspd_ac'))).toBe(false);
    expect(o).not.toHaveProperty('recorte');
  });
});
