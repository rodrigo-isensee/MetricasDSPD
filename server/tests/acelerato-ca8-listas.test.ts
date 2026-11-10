import { describe, expect, it } from 'vitest';
import { CHAVES_COMPARADAS, hashesDasListas, listasSha256, montarParametros } from '../src/modulos/acelerato/controle.js';
import { coletarAcelerato, type DepsColeta, type ResultadoColeta } from '../src/modulos/acelerato/index.js';
import { campoDominioEtapa } from '../src/modulos/acelerato/listas-fechadas.js';
import { sha256Texto } from '../src/modulos/acelerato/sql.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { CONFIG, LISTAS_BANCO, TLS, criarBancoMemoria, criarMysqlFalso, linha } from './acelerato-duble.js';

/** K-224 (pedido 073, E3.1): as listas de recorte e de vocabulário de `ref_dominio` entram no CA-8 (`recorte_sha256`, `vocabulario_sha256`). */
const AGORA = new Date('2026-11-05T12:00:00Z');
const L = (campo: string, codigo: string, rotulo = codigo) => ({ campo, codigo, rotulo });
const ok = (r: ResultadoColeta): Extract<ResultadoColeta, { estado: 'ok' }> => { if (r.estado !== 'ok') throw new Error('esperava ok'); return r; };
type Banco = ReturnType<typeof criarBancoMemoria>;
type Mysql = ReturnType<typeof criarMysqlFalso>;

function deps(banco: Banco, mysql: Mysql, extra: Partial<DepsColeta> = {}): DepsColeta {
  const log = { info: () => undefined, error: () => undefined };
  return { pool: banco.pool, config: CONFIG, tls: TLS, S: montarEsquemas(''), agora: () => AGORA, log, cliente: { conectar: mysql.conectar }, dormir: () => Promise.resolve(), ...extra };
}
const q1 = (mysql: Mysql) => mysql.reg.consultas.filter((c) => c.sql.startsWith('SELECT ticket_key, tipo_ticket_key'));
/** Banco novo com outras listas e o mesmo histórico de controle e staging do anterior. */
const comListas = (banco: Banco, listas: ReturnType<typeof L>[]): Banco => {
  const novo = criarBancoMemoria({ listas });
  novo.estado.ctl.push(...banco.estado.ctl);
  novo.estado.stgChamado.push(...banco.estado.stgChamado);
  return novo;
};

describe('hash das listas de ref_dominio (CA-8)', () => {
  it('é o hash de campo|codigo|rotulo ordenado por campo e codigo; a ordem de chegada não muda; lista vazia é estável', () => {
    const a = [L('equipe', '2', 'B'), L('equipe', '1', 'A'), L('categoria', 'x')];
    expect(listasSha256(a)).toBe(sha256Texto('categoria|x|x\nequipe|1|A\nequipe|2|B'));
    expect(listasSha256([...a].reverse())).toBe(listasSha256(a));
    expect(listasSha256([])).toBe(sha256Texto(''));
  });
  it('mesmo campo e mesmo código (não ocorre em lista vigente): a ordenação é estável e mantém a ordem de chegada', () => {
    expect(listasSha256([L('equipe', '1', 'B'), L('equipe', '1', 'A')])).toBe(sha256Texto('equipe|1|B\nequipe|1|A'));
  });
  it('incluir ou tirar código e trocar rótulo mudam o hash; a ordem de exibição não entra', () => {
    const base = [L('equipe', '1', 'A'), L('equipe', '2', 'B')];
    expect(listasSha256([...base, L('equipe', '3', 'C')])).not.toBe(listasSha256(base));
    expect(listasSha256(base.slice(1))).not.toBe(listasSha256(base));
    expect(listasSha256([L('equipe', '1', 'Z'), L('equipe', '2', 'B')])).not.toBe(listasSha256(base));
    expect(listasSha256(base.map((l, ordem) => ({ ...l, ordem })))).toBe(listasSha256(base));
  });
  it('separa recorte e vocabulário; natureza_prefixo, etapa_fluxo e campo_personalizado ficam fora dos dois; cpe_* entra no vocabulário', () => {
    const lista = [L('tipo_recorte', '1'), L('equipe', '2'), L('prioridade', 'Alta'), L('natureza_prefixo', 'SSSC-I', 'incidente'), L('etapa_fluxo', '10'), L('campo_personalizado', 'c')];
    const cpe = [L(campoDominioEtapa('motivo_escalacao'), 'Hardware')];
    const h = hashesDasListas(lista, cpe);
    expect(h.recorte_sha256).toBe(listasSha256([L('tipo_recorte', '1'), L('equipe', '2')]));
    expect(h.vocabulario_sha256).toBe(listasSha256([L('prioridade', 'Alta'), ...cpe]));
    expect(hashesDasListas([...lista, L('natureza_prefixo', 'SSSC-R', 'requisição')], cpe)).toEqual(h);
    expect(montarParametros(CONFIG, null, new Map(), h)).toMatchObject(h);
    expect(CHAVES_COMPARADAS).toEqual(expect.arrayContaining(['recorte_sha256', 'vocabulario_sha256']));
  });
});

describe('CT-34: lista de ref_dominio mudou sem reconhecimento', () => {
  const primeira = async (listas = LISTAS_BANCO) => {
    const banco = criarBancoMemoria({ listas });
    const mysql = criarMysqlFalso([linha()]);
    await coletarAcelerato(deps(banco, mysql), 'incremental');
    return { banco, mysql };
  };

  it.each([
    ['equipe nova no recorte', [...LISTAS_BANCO, L('equipe', '999', 'Outra')], 'recorte_sha256'],
    ['organização nova no recorte', [...LISTAS_BANCO, L('organizacao_recorte', '998', 'Outra')], 'recorte_sha256'],
    ['tipo novo no recorte', [...LISTAS_BANCO, L('tipo_recorte', '997', 'Outro')], 'recorte_sha256'],
    ['rótulo de equipe trocado', LISTAS_BANCO.map((l) => (l.campo === 'equipe' ? { ...l, rotulo: 'Renomeada' } : l)), 'recorte_sha256'],
    ['prioridade nova', [...LISTAS_BANCO, L('prioridade', 'Crítica')], 'vocabulario_sha256'],
    ['etapa a menos', LISTAS_BANCO.filter((l) => l.codigo !== 'Aguardando atribuicao'), 'vocabulario_sha256'],
    ['categoria nova', [...LISTAS_BANCO, L('categoria', 'Nova')], 'vocabulario_sha256'],
    ['workflow novo', [...LISTAS_BANCO, L('descricao_workflow', 'Outro Fluxo')], 'vocabulario_sha256'],
    ['domínio cpe_* novo', [...LISTAS_BANCO, L(campoDominioEtapa('motivo_escalacao'), 'Hardware')], 'vocabulario_sha256'],
  ])('%s: recusa na partida só com o nome da chave, sem abrir conexão', async (_n, listas, chave) => {
    const { banco, mysql } = await primeira();
    const antes = mysql.reg.conexoes;
    const erro = await coletarAcelerato(deps(comListas(banco, listas), mysql), 'incremental').catch((e: unknown) => e);
    expect(erro).toMatchObject({ codigo: 'parametros-mudaram', coluna: chave });
    expect(mysql.reg.conexoes).toBe(antes);
    expect(JSON.stringify(erro)).not.toMatch(/Outra|Outro|Renomeada|Hardware/);
  });

  it('com a opção de reconhecer a coleta segue e grava o hash novo; a seguinte, sem a opção, passa', async () => {
    const { banco, mysql } = await primeira();
    const novo = comListas(banco, [...LISTAS_BANCO, L('prioridade', 'Crítica')]);
    ok(await coletarAcelerato(deps(novo, mysql, { reconhecerMudanca: true }), 'incremental'));
    const [antes, depois] = [novo.estado.ctl[0]!.parametros!, novo.estado.ctl.at(-1)!.parametros!];
    expect(depois.vocabulario_sha256).not.toBe(antes.vocabulario_sha256);
    expect(depois.recorte_sha256).toBe(antes.recorte_sha256);
    ok(await coletarAcelerato(deps(novo, mysql), 'incremental'));
  });

  it('primeira coleta depois do deploy (linha anterior sem as chaves novas): recusa, e o reconhecimento libera', async () => {
    const { banco, mysql } = await primeira();
    delete banco.estado.ctl[0]!.parametros!.recorte_sha256;
    delete banco.estado.ctl[0]!.parametros!.vocabulario_sha256;
    await expect(coletarAcelerato(deps(banco, mysql), 'incremental')).rejects.toMatchObject({ codigo: 'parametros-mudaram', coluna: 'recorte_sha256,vocabulario_sha256' });
    ok(await coletarAcelerato(deps(banco, mysql, { reconhecerMudanca: true }), 'incremental'));
    expect(banco.estado.ctl.at(-1)!.parametros).toMatchObject({ recorte_sha256: expect.any(String), vocabulario_sha256: expect.any(String) });
  });

  it('natureza_prefixo não é chave: mudar a lista não recusa a coleta (P-E3-1)', async () => {
    const { banco, mysql } = await primeira([...LISTAS_BANCO, L('natureza_prefixo', 'SSSC-I', 'incidente')]);
    const novo = comListas(banco, [...LISTAS_BANCO, L('natureza_prefixo', 'SSSC-I', 'requisicao'), L('natureza_prefixo', 'SSSC-R', 'requisicao')]);
    ok(await coletarAcelerato(deps(novo, mysql), 'incremental'));
  });
});

describe('P-E3-2: reconhecer mudança de recorte relê o recorte inteiro', () => {
  const nova = [...LISTAS_BANCO, L('equipe', '999', 'Outra')];
  async function cenario() {
    const banco = criarBancoMemoria();
    const mysql = criarMysqlFalso([linha()]);
    await coletarAcelerato(deps(banco, mysql), 'incremental');
    await coletarAcelerato(deps(banco, mysql), 'incremental'); // a segunda já parte da marca d'água
    return { banco, mysql };
  }

  it('recorte mudou e reconhecido: varredura sem marca, lendo desde a data mínima; só acrescenta versões e grava o hash novo', async () => {
    const { banco, mysql } = await cenario();
    const novo = comListas(banco, nova);
    const chamadosAntes = novo.estado.stgChamado.length;
    const r = ok(await coletarAcelerato(deps(novo, mysql, { reconhecerMudanca: true }), 'incremental'));
    expect(r.modo).toBe('releitura');
    expect(novo.estado.ctl.at(-1)).toMatchObject({ tarefa: 'varredura', marcaAte: null });
    expect(q1(mysql).at(-1)!.valores.at(-4)).toBe('1000-01-01 00:00:00');
    expect(novo.estado.stgChamado.length).toBeGreaterThanOrEqual(chamadosAntes); // nada é apagado nem sobrescrito
    expect(novo.estado.stgChamado.slice(0, chamadosAntes)).toEqual(banco.estado.stgChamado);
    expect(novo.estado.ctl.at(-1)!.parametros!.recorte_sha256).toBe(hashesDasListas(nova, []).recorte_sha256);
  });

  it('só o vocabulário mudou: o reconhecimento não relê, segue incremental', async () => {
    const { banco, mysql } = await cenario();
    const novo = comListas(banco, [...LISTAS_BANCO, L('prioridade', 'Crítica')]);
    const r = ok(await coletarAcelerato(deps(novo, mysql, { reconhecerMudanca: true }), 'incremental'));
    expect(r.modo).toBe('incremental');
    expect(novo.estado.ctl.at(-1)!.tarefa).toBe('coleta_incremental');
  });

  it('linha anterior sem recorte_sha256 (primeira vez da chave): reconhece sem reler', async () => {
    const { banco, mysql } = await cenario();
    delete banco.estado.ctl.at(-1)!.parametros!.recorte_sha256;
    const r = ok(await coletarAcelerato(deps(banco, mysql, { reconhecerMudanca: true }), 'incremental'));
    expect(r.modo).toBe('incremental');
  });

  it('sem a opção a mudança de recorte recusa e a falha é registrada com a tarefa pedida', async () => {
    const { banco, mysql } = await cenario();
    const novo = comListas(banco, nova);
    await expect(coletarAcelerato(deps(novo, mysql), 'incremental')).rejects.toMatchObject({ codigo: 'parametros-mudaram', coluna: 'recorte_sha256' });
    expect(novo.estado.ctl.at(-1)).toMatchObject({ status: 'falha', tarefa: 'coleta_incremental' });
  });
});
