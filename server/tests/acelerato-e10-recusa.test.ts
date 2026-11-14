import { describe, expect, it } from 'vitest';
import { GRUPOS_DE_LISTA, exigirVersaoDasListas, type ParametrosColeta } from '../src/modulos/acelerato/controle.js';
import { coletarAcelerato, type DepsColeta } from '../src/modulos/acelerato/index.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { CONFIG, LISTAS_BANCO, TLS, criarBancoMemoria, criarMysqlFalso, linha } from './acelerato-duble.js';

/** E10 (pedido 073), Lote 2: reconhecer mudança de lista exige vigência nova e versão `056:ref-dominio:` na data (opção C, P-E10-1). */
const AGORA = new Date('2026-11-05T12:00:00Z');
const L = (campo: string, codigo: string, rotulo = codigo) => ({ campo, codigo, rotulo });
type Vigencias = NonNullable<Parameters<typeof criarBancoMemoria>[0]>['vigencias'];

const cenario = async (vigencias?: Vigencias) => {
  const primeiro = criarBancoMemoria();
  const mysql = criarMysqlFalso([linha()]);
  const deps = (banco: ReturnType<typeof criarBancoMemoria>, extra: Partial<DepsColeta> = {}): DepsColeta => ({
    pool: banco.pool, config: CONFIG, tls: TLS, S: montarEsquemas(''), agora: () => AGORA, log: { info: () => undefined, error: () => undefined },
    cliente: { conectar: mysql.conectar }, dormir: () => Promise.resolve(), ...extra,
  });
  await coletarAcelerato(deps(primeiro), 'incremental');
  const comListas = (listas: Record<string, unknown>[]) => {
    const novo = criarBancoMemoria({ listas, ...(vigencias ? { vigencias } : {}) });
    novo.estado.ctl.push(...primeiro.estado.ctl);
    novo.estado.stgChamado.push(...primeiro.estado.stgChamado);
    return novo;
  };
  return { primeiro, mysql, deps, comListas };
};
const MUDADAS = [
  ['recorte_sha256', [...LISTAS_BANCO, L('equipe', '999', 'Valor secreto')]],
  ['vocabulario_sha256', [...LISTAS_BANCO, L('prioridade', 'Valor secreto')]],
  ['fluxo_sha256', [...LISTAS_BANCO, { ...L('etapa_fluxo', '99', '99'), ordem: 1 }]],
] as const;

describe('E10 Lote 2: recusa do reconhecimento sem versão ou com sobrescrita', () => {
  it.each(MUDADAS)('%s mudou, vigência nova sem versão: recusa com reconhecimento-sem-versao, sem conexão, falha sem marca e só o nome da chave', async (chave, listas) => {
    const { mysql, deps, comListas } = await cenario(() => [{ tem_versao: true }, { tem_versao: false }]);
    const antes = mysql.reg.conexoes;
    const banco = comListas([...listas]);
    const erro = await coletarAcelerato(deps(banco, { reconhecerMudanca: true }), 'incremental').catch((e: unknown) => e);
    expect(erro).toMatchObject({ codigo: 'reconhecimento-sem-versao', coluna: chave });
    expect(JSON.stringify(erro)).not.toContain('secreto');
    expect(mysql.reg.conexoes).toBe(antes);
    expect(banco.estado.ctl.at(-1)).toMatchObject({ status: 'falha', marcaAte: null, erro: `reconhecimento-sem-versao (${chave})` });
  });

  it.each(MUDADAS)('%s mudou sem vigência nova (sobrescrita): recusa com lista-sobrescrita', async (chave, listas) => {
    const { deps, comListas } = await cenario(() => []);
    await expect(coletarAcelerato(deps(comListas([...listas]), { reconhecerMudanca: true }), 'incremental'))
      .rejects.toMatchObject({ codigo: 'lista-sobrescrita', coluna: chave });
  });

  it('com versão na data o reconhecimento passa; a consulta usa só os campos do grupo e o dia civil em -03:00 do último sucesso', async () => {
    const consultas: { campos: string[]; dia: string }[] = [];
    const { deps, comListas } = await cenario((campos, dia) => { consultas.push({ campos, dia }); return [{ tem_versao: true }]; });
    const banco = comListas([...LISTAS_BANCO, L('prioridade', 'Crítica')]);
    banco.estado.ctl[0]!.finalizadoEm = new Date('2026-11-05T01:00:00Z'); // 22:00 do dia 4 em -03:00
    expect((await coletarAcelerato(deps(banco, { reconhecerMudanca: true }), 'incremental')).estado).toBe('ok');
    expect(consultas).toEqual([{ campos: GRUPOS_DE_LISTA.vocabulario_sha256, dia: '2026-11-04' }]);
    expect(GRUPOS_DE_LISTA.vocabulario_sha256).toContain('cpe_motivo_escalacao');
    expect(GRUPOS_DE_LISTA.vocabulario_sha256).not.toContain('cpe_justificativa_informada');
  });

  it.each([
    ['recorte_sha256', [...LISTAS_BANCO, L('equipe', '999', 'Outra')], ['tipo_recorte', 'organizacao_recorte', 'equipe']],
    ['fluxo_sha256', [...LISTAS_BANCO, { ...L('etapa_fluxo', '99', '99'), ordem: 1 }], ['etapa_fluxo']],
  ])('%s: a consulta de vigência recebe exatamente os campos do grupo, escritos aqui (não lidos da constante do código)', async (chave, listas, campos) => {
    const recebidos: string[][] = [];
    const { deps, comListas } = await cenario((c) => { recebidos.push(c); return [{ tem_versao: true }]; });
    const resultado = await coletarAcelerato(deps(comListas([...listas]), { reconhecerMudanca: true }), 'incremental');
    expect(resultado.estado, chave).toBe('ok');
    expect(recebidos).toEqual([campos]);
  });

  it('chave ausente na linha anterior não é conferida (isenção); sem mudança não consulta nada', async () => {
    const consultas: unknown[] = [];
    const { deps, comListas } = await cenario(() => { consultas.push(1); return []; });
    const sem = comListas([...LISTAS_BANCO]);
    expect((await coletarAcelerato(deps(sem, { reconhecerMudanca: true }), 'incremental')).estado).toBe('ok');
    expect(consultas).toHaveLength(0);
    const banco = comListas([...LISTAS_BANCO, L('equipe', '999', 'Outra')]);
    delete banco.estado.ctl[0]!.parametros!.recorte_sha256;
    expect((await coletarAcelerato(deps(banco, { reconhecerMudanca: true }), 'incremental')).estado).toBe('ok');
    expect(consultas).toHaveLength(0);
  });

  it('sem último sucesso datado (finalizado_em nulo) a data de corte é a época', async () => {
    const dias: unknown[] = [];
    const db = { query: (_t: string, v: unknown[]) => { dias.push(v[1]); return Promise.resolve({ rows: [{ tem_versao: true }] }); } };
    const p = { recorte_sha256: 'a' } as ParametrosColeta;
    await exigirVersaoDasListas(db as never, montarEsquemas(''), { recorte_sha256: 'b' } as ParametrosColeta, p, null);
    expect(dias).toEqual(['1970-01-01']);
  });
});
