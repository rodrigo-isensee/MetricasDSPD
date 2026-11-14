import { describe, expect, it } from 'vitest';
import { lerDominioBm, listasDoArquivo } from '../src/modulos/businessmap/dominio-businessmap.js';
import { opcoesFiltro } from '../src/modulos/referencia/servico.js';
import type { Consultavel } from '../src/plataforma/db/pool.js';

// K-332 (097 E4.82): do arquivo versionado real até opcoes.setores. Os 6 nomes são escritos AQUI (dados do dono), não lidos do código.
const NOMES = ['Ciência de Dados', 'Escritório de Projetos', 'Marketing e Vendas', 'Plataformas', 'Sistemas Corporativos', 'Sistemas de Vendas e Operações'];
const AGORA = new Date('2026-11-14T12:00:00-03:00');
const dbCom = (linhas: { codigo: string; rotulo: string }[]): Consultavel => ({
  query: async (texto: string, valores?: unknown[]) => {
    if (texto.includes('ref_dominio') && valores?.[0] === 'setor_quadro') return { rows: linhas };
    if (texto.includes('min(')) return { rows: [{ inicio: null }] };
    return { rows: [] };
  },
}) as unknown as Consultavel;

describe('K-332: arquivo real -> opcoes.setores', () => {
  it('depois da carga do arquivo real, opcoes.setores traz exatamente os 6 nomes, sem o quadro 35 e sem código de quadro', async () => {
    const lista = listasDoArquivo(lerDominioBm().arquivo).setor_quadro;
    expect(lista.map((l) => l.codigo)).toEqual(['23', '24', '25', '27', '31', '79']);
    const o = (await opcoesFiltro(dbCom(lista), 'businessmap', AGORA)) as { setores: { id: string; nome: string }[] };
    expect(o.setores.map((s) => s.nome)).toEqual(NOMES);
    expect(new Set(o.setores.map((s) => s.id)).size).toBe(6);
    expect(JSON.stringify(o)).not.toMatch(/Gerencial|Desenvolvimento de Sistemas|"35"/);
  });

  it('antes da carga (ref_dominio sem setor_quadro) a lista é vazia', async () => {
    const o = (await opcoesFiltro(dbCom([]), 'businessmap', AGORA)) as { setores: unknown[] };
    expect(o.setores).toEqual([]);
  });
});
