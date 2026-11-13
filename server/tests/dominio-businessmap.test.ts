import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ARQUIVO_DOMINIO_BM, prioridadesDeLinhas, TIPOS_SELECAO_UNICA, TAMANHO_MAXIMO_ARQUIVO, analisarDominioBm, dominiosDeLinhas, lerDominioBm, listasDoArquivo, sincronizarDominioBm,
} from '../src/modulos/businessmap/dominio-businessmap.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { ErroDominio } from '../src/modulos/referencia/dominio-acelerato.js';
import { criarDublePg } from './duble-pg.js';

// Lote L2-a do pedido 069 (modelo de ameaças, A3 e A4; CA-069-1 a CA-069-4). As listas de proibidos e de tipos estão escritas AQUI, não importadas
// das constantes do código (B-1 da ADR 0020).
const TIPOS_DO_TESTE = ['tipo-de-selecao-do-teste'] as const;
const PROIBIDOS = ['36', '42'];

const campo = (extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  field_id: '7', type: TIPOS_DO_TESTE[0], coluna: 'area_solicitante', valores: [{ codigo: 'a1', rotulo: 'Area Um' }], ...extra,
});
const arquivo = (campos: unknown[] = [], extra: Record<string, unknown> = {}): string => JSON.stringify({
  versao: 1,
  versao_criterio: { dominio: 'businessmap', descricao: 'Teste do bm:ref-sync', motivo: 'Teste', referencia: 'teste' },
  schema: 'dspd_bm', tabela: 'ref_dominio', regra: 'teste', campos, ...extra,
});
const aceita = (campos: unknown[] = [campo()]): ReturnType<typeof analisarDominioBm> => analisarDominioBm(arquivo(campos), TIPOS_DO_TESTE);
const recusa = (texto: string, tipos: readonly string[] = TIPOS_DO_TESTE): string => {
  try {
    analisarDominioBm(texto, tipos);
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDominio);
    return (e as Error).message;
  }
  throw new Error('deveria recusar');
};

describe('bm:ref-sync: o arquivo versionado', () => {
  it('nasce vazio de campos, valido, e a lista positiva de tipos nasce vazia', () => {
    const lido = lerDominioBm();
    expect(lido.arquivo.campos).toEqual([]);
    // C8a: escrito AQUI, não importado do código (B-1 da ADR 0020); fato da OpenAPI v2 do BusinessMap, escala decrescente
    expect(lido.arquivo.prioridade_severidade).toEqual([
      { codigo: '1', rotulo: 'Crítica' }, { codigo: '2', rotulo: 'Alta' }, { codigo: '3', rotulo: 'Média' }, { codigo: '4', rotulo: 'Baixa' },
    ]);
    expect(lido.arquivo.versao_criterio.afeta).toEqual(['O16']);
    expect(lido.sha256).toBe(createHash('sha256').update(readFileSync(ARQUIVO_DOMINIO_BM, 'utf8')).digest('hex'));
    expect(TIPOS_SELECAO_UNICA).toEqual([]);
  });

  it('com a lista positiva vazia (a do código), toda carga com campo é recusada inteira', () => {
    expect(() => analisarDominioBm(arquivo([campo()]))).toThrow(ErroDominio);
    expect(() => analisarDominioBm(arquivo([]))).not.toThrow();
  });

  it('tipo da lista positiva (escrita no teste) é aceito e vira listas de ref_dominio', () => {
    const lido = aceita([campo(), campo({ field_id: '8', coluna: 'sistema', valores: [{ codigo: 's1', rotulo: 'Sistema Um' }] })]);
    expect(listasDoArquivo(lido.arquivo)).toEqual({
      campo_customizado: [{ codigo: '7', rotulo: 'area_solicitante' }, { codigo: '8', rotulo: 'sistema' }],
      area_solicitante: [{ codigo: 'a1', rotulo: 'Area Um' }],
      sistema: [{ codigo: 's1', rotulo: 'Sistema Um' }],
      motivo_bloqueio: [],
      prioridade_severidade: [],
    });
    expect(listasDoArquivo(aceita([]).arquivo)).toEqual({ campo_customizado: [], motivo_bloqueio: [], prioridade_severidade: [] });
  });

  it.each(PROIBIDOS)('CA-069-1: o field %s no arquivo recusa a carga inteira, sem valor na mensagem', (id) => {
    const msg = recusa(arquivo([campo(), campo({ field_id: id, coluna: 'sistema' })]));
    expect(msg).not.toContain(id === '36' ? 'sistema' : 'Area Um');
    expect(msg).toContain('inválido');
  });

  it.each(['036', '0042'])('o field proibido com zeros à esquerda (%s) também é recusado', (id) => {
    recusa(arquivo([campo({ field_id: id })]));
  });

  it.each([['usuário', 'user'], ['texto', 'text'], ['desconhecido', 'tipo-que-ninguem-previu'], ['vazio', '']])('CA-069-2: type %s fora da lista positiva recusa', (_n, tipo) => {
    recusa(arquivo([campo({ type: tipo })]));
  });

  it('CA-069-2: type ausente ou não texto recusa', () => {
    const semTipo = { ...campo(), type: undefined };
    recusa(arquivo([semTipo]));
    recusa(arquivo([campo({ type: null })]));
    recusa(arquivo([campo({ type: ['tipo-de-selecao-do-teste'] })]));
  });

  it.each(['42 ', '4a', '-1', '', '12345678901', ' 7', '7\n', '１２'])('CA-069-2: field_id %j recusa', (id) => {
    recusa(arquivo([campo({ field_id: id })]));
  });

  it.each(['owner_user_id', 'inexistente', 'campo_customizado', 'causa_raiz', '__proto__'])('CA-069-2: coluna %s fora do enum fechado recusa', (coluna) => {
    recusa(arquivo([campo({ coluna })]));
  });

  it.each([['arroba', 'pessoa@exemplo.invalid'], ['U+200B', 'a​b'], ['U+202E', 'a‮b'], ['U+2028', 'a b'], ['controle', 'a\u0007b']])(
    'CA-069-2: rótulo e código com %s recusam', (_n, texto) => {
      recusa(arquivo([campo({ valores: [{ codigo: 'a1', rotulo: texto }] })]));
      recusa(arquivo([campo({ valores: [{ codigo: texto, rotulo: 'ok' }] })]));
    });

  it('chave extra na raiz, no campo, no valor e na versão de critério recusa; __proto__ como chave recusa sem efeito', () => {
    recusa(arquivo([campo()], { extra: 1 }));
    recusa(arquivo([campo({ nome: 'Campo' })]));
    recusa(arquivo([campo({ valores: [{ codigo: 'a1', rotulo: 'A', descricao: 'x' }] })]));
    recusa(arquivo([campo()], { versao_criterio: { dominio: 'businessmap', descricao: 'd', motivo: 'm', referencia: 'r', extra: 1 } }));
    const comProto = arquivo([campo()]).replace('"versao":1', '"versao":1,"__proto__":{"polluido":true}');
    recusa(comProto);
    expect(({} as Record<string, unknown>).polluido).toBeUndefined();
    recusa(arquivo([JSON.parse('{"__proto__":{"polluido":true},"field_id":"7","type":"tipo-de-selecao-do-teste","coluna":"sistema","valores":[{"codigo":"a","rotulo":"A"}]}')]));
    expect(({} as Record<string, unknown>).polluido).toBeUndefined();
  });

  it('duplicata de field_id, de coluna, de código, de rótulo e o código reservado desconhecido recusam', () => {
    recusa(arquivo([campo(), campo({ coluna: 'sistema' })]));
    recusa(arquivo([campo(), campo({ field_id: '8' })]));
    recusa(arquivo([campo({ valores: [{ codigo: 'a1', rotulo: 'A' }, { codigo: 'a1', rotulo: 'B' }] })]));
    recusa(arquivo([campo({ valores: [{ codigo: 'a1', rotulo: 'A' }, { codigo: 'a2', rotulo: 'A' }] })]));
    recusa(arquivo([campo({ valores: [{ codigo: 'desconhecido', rotulo: 'A' }] })]));
    recusa(arquivo([campo({ valores: [] })]));
  });

  it('JSON malformado, tipo errado na raiz, schema ou tabela trocados e arquivo grande recusam com mensagem fixa', () => {
    expect(recusa('{nao e json')).toContain('não é um JSON válido');
    recusa('[]');
    recusa('null');
    recusa(arquivo([], { schema: 'dspd_ac' }));
    recusa(arquivo([], { tabela: 'outra' }));
    recusa(arquivo([], { versao: 2 }));
    recusa(arquivo([], { versao_criterio: { dominio: 'acelerato', descricao: 'd', motivo: 'm', referencia: 'r' } }));
    expect(recusa(' '.repeat(TAMANHO_MAXIMO_ARQUIVO + 1))).toContain('tamanho máximo');
  });

  it('a mensagem de recusa traz só caminho do esquema, nunca o valor recebido', () => {
    const msg = recusa(arquivo([campo({ valores: [{ codigo: 'a1', rotulo: 'MARCADOR-PESSOA-069@exemplo.invalid' }] })]));
    expect(msg).not.toContain('MARCADOR-PESSOA-069');
    expect(msg).not.toContain('exemplo.invalid');
  });
});

describe('coletor: dominiosDeLinhas desconfia do ref_dominio (A4)', () => {
  const cc = (codigo: string, coluna: string): { campo: string; codigo: string; rotulo: string } => ({ campo: 'campo_customizado', codigo, rotulo: coluna });
  const v = (campo: string, codigo: string, rotulo: string): { campo: string; codigo: string; rotulo: string } => ({ campo, codigo, rotulo });

  it('monta field_id -> (rótulo -> código) com o vigente', () => {
    const m = dominiosDeLinhas([cc('7', 'area_solicitante'), v('area_solicitante', 'a1', 'Area Um'), v('area_solicitante', 'a2', 'Area Dois')]);
    expect([...m.keys()]).toEqual(['7']);
    expect([...m.get('7')!]).toEqual([['Area Um', 'a1'], ['Area Dois', 'a2']]);
  });

  it.each(PROIBIDOS)('CA-069-3: linha inserida direto por SQL para o field %s não entra no mapa', (id) => {
    const m = dominiosDeLinhas([cc('7', 'area_solicitante'), cc(id, 'area_solicitante'), cc(id, 'sistema'), v('area_solicitante', 'a1', 'Area Um'), v('sistema', 's1', 'S')]);
    expect([...m.keys()]).toEqual(['7']);
    expect(m.has(id)).toBe(false);
  });

  it('field com zeros à esquerda do 42 e field_id não numérico ou fora do enum são ignorados', () => {
    const m = dominiosDeLinhas([
      cc('042', 'area_solicitante'), cc('4a', 'area_solicitante'), cc('-1', 'area_solicitante'), cc('7 ', 'area_solicitante'), cc('9', 'owner_user_id'),
      cc('10', 'inexistente'), cc('', 'sistema'), v('area_solicitante', 'a1', 'A'), v('sistema', 's1', 'S'), v('owner_user_id', 'x', 'Pessoa'),
    ]);
    expect(m.size).toBe(0);
  });

  it('linha de valor de coluna fora do enum, com código inseguro, reservado ou rótulo ambíguo não vira domínio', () => {
    const m = dominiosDeLinhas([
      cc('7', 'area_solicitante'), v('area_solicitante', 'a@b', 'Com Arroba'), v('area_solicitante', 'desconhecido', 'Reservado'), v('area_solicitante', 'a​1', 'Invisivel'),
      v('area_solicitante', 'a1', 'Dois Codigos'), v('area_solicitante', 'a2', 'Dois Codigos'), v('area_solicitante', 'ok', 'Bom'), v('owner_user_id', 'p1', 'Pessoa'),
    ]);
    expect([...m.get('7')!]).toEqual([['Bom', 'ok']]);
  });

  it('field ligado a duas colunas é ignorado inteiro; campo sem valor não entra', () => {
    const m = dominiosDeLinhas([cc('7', 'area_solicitante'), cc('7', 'sistema'), v('area_solicitante', 'a1', 'A'), v('sistema', 's1', 'S'), cc('8', 'fornecedor')]);
    expect(m.size).toBe(0);
  });
});

describe('sincronizarDominioBm (dublê de PostgreSQL)', () => {
  const S = montarEsquemas('');
  const HOJE = '2026-11-04';
  const AGORA = new Date('2026-11-04T12:00:00Z');
  const lido = analisarDominioBm(arquivo([campo()]), TIPOS_DO_TESTE);

  it('arquivo novo: insere campo_customizado e o domínio, só em dspd_bm, e registra a versão de critério com o hash', async () => {
    const d = criarDublePg((c) => (c.texto.includes('FROM dspd_core.ref_versao_criterio') ? [] : []));
    const r = await sincronizarDominioBm(d.pool, S, lido, HOJE, AGORA);
    expect(r).toEqual({ sha256: lido.sha256, campos: 1, inseridas: 2, fechadas: 0, versaoRegistrada: true });
    const sql = d.chamadas.map((c) => c.texto);
    expect(sql.filter((t) => t.startsWith('INSERT INTO dspd_bm.ref_dominio'))).toHaveLength(2);
    expect(sql.join('\n')).not.toMatch(/dspd_ac|DELETE|TRUNCATE/);
    const versao = d.chamadas.find((c) => c.texto.includes('INSERT INTO dspd_core.ref_versao_criterio'))!;
    expect(versao.valores).toEqual([HOJE, 'Teste do bm:ref-sync', 'Teste', `069:ref-bm-campos:${lido.sha256}`, AGORA.toISOString()]);
    expect(d.chamadas.find((c) => c.texto.includes('campo = ANY'))!.valores).toEqual([['campo_customizado', 'area_solicitante', 'motivo_bloqueio', 'prioridade_severidade']]);
  });

  it('já vigente e igual: nada é gravado e nenhuma versão é registrada; versão já existente não duplica', async () => {
    const vigentes = [{ campo: 'campo_customizado', codigo: '7', rotulo: 'area_solicitante', vigente_de: '2026-11-01' }, { campo: 'area_solicitante', codigo: 'a1', rotulo: 'Area Um', vigente_de: '2026-11-01' }];
    const igual = criarDublePg((c) => (c.texto.startsWith('SELECT campo, codigo, rotulo, vigente_de') ? vigentes : []));
    expect(await sincronizarDominioBm(igual.pool, S, lido, HOJE, AGORA)).toMatchObject({ inseridas: 0, fechadas: 0, versaoRegistrada: false });
    expect(igual.chamadas.some((c) => /^(INSERT|UPDATE)/.test(c.texto))).toBe(false);
    const jaTem = criarDublePg((c) => (c.texto.includes('SELECT 1 FROM dspd_core.ref_versao_criterio') ? [{ '?column?': 1 }] : []));
    expect(await sincronizarDominioBm(jaTem.pool, S, lido, HOJE, AGORA)).toMatchObject({ inseridas: 2, versaoRegistrada: false });
  });

  it('campo retirado do arquivo só fecha a vigência (UPDATE de vigente_ate); data retroativa é recusada', async () => {
    const vigentes = [{ campo: 'campo_customizado', codigo: '7', rotulo: 'area_solicitante', vigente_de: '2026-11-01' }];
    const d = criarDublePg((c) => (c.texto.startsWith('SELECT campo, codigo, rotulo, vigente_de') ? vigentes : []));
    const vazio = analisarDominioBm(arquivo([]), TIPOS_DO_TESTE);
    expect(await sincronizarDominioBm(d.pool, S, vazio, HOJE, AGORA)).toMatchObject({ inseridas: 0, fechadas: 1, campos: 0 });
    expect(d.chamadas.filter((c) => c.texto.startsWith('UPDATE dspd_bm.ref_dominio SET vigente_ate')).map((c) => c.valores)).toEqual([[HOJE, 'campo_customizado', '7']]);
    const retro = criarDublePg((c) => (c.texto.startsWith('SELECT campo, codigo, rotulo, vigente_de') ? vigentes : c.texto.includes('max(greatest') ? [{ campo: 'campo_customizado', ultima: '2026-11-10' }] : []));
    await expect(sincronizarDominioBm(retro.pool, S, vazio, HOJE, AGORA)).rejects.toBeInstanceOf(ErroDominio);
  });
});

describe('C8a: mapa priority -> severidade (prioridade_severidade)', () => {
  const comPrioridade = (p: unknown, afeta: unknown = []): string => JSON.stringify({
    ...JSON.parse(arquivo([])), prioridade_severidade: p,
    versao_criterio: { dominio: 'businessmap', descricao: 'Teste', motivo: 'Teste', referencia: 'teste', afeta },
  });
  it('aceita as quatro severidades do contrato e vira lista de ref_dominio', () => {
    const lido = analisarDominioBm(comPrioridade([{ codigo: '1', rotulo: 'Crítica' }, { codigo: '4', rotulo: 'Baixa' }]));
    expect(listasDoArquivo(lido.arquivo).prioridade_severidade).toEqual([{ codigo: '1', rotulo: 'Crítica' }, { codigo: '4', rotulo: 'Baixa' }]);
  });
  it.each([
    ['rótulo fora das quatro', [{ codigo: '1', rotulo: 'Urgente' }]],
    ['código com zero à esquerda', [{ codigo: '01', rotulo: 'Crítica' }]],
    ['código não numérico', [{ codigo: 'a', rotulo: 'Crítica' }]],
    ['código repetido', [{ codigo: '1', rotulo: 'Crítica' }, { codigo: '1', rotulo: 'Alta' }]],
    ['campo extra', [{ codigo: '1', rotulo: 'Crítica', extra: 1 }]],
  ])('recusa %s, sem valor na mensagem', (_n, p) => {
    expect(recusa(comPrioridade(p))).toMatch(/inválido/);
  });
  it('recusa métrica afetada que não existe', () => {
    expect(() => analisarDominioBm(comPrioridade([], ['X99']))).toThrow(ErroDominio);
  });
  it('a leitura do projetor desconfia do banco: só código de 1 a 3 dígitos e severidade das quatro; código ligado a duas severidades sai', () => {
    const l = (campo: string, codigo: string, rotulo: string) => ({ campo, codigo, rotulo });
    expect([...prioridadesDeLinhas([
      l('prioridade_severidade', '1', 'Crítica'), l('prioridade_severidade', '2', 'Alta'), l('prioridade_severidade', '3', 'Urgente'),
      l('prioridade_severidade', '04', 'Baixa'), l('outro', '4', 'Baixa'), l('prioridade_severidade', '5', 'Baixa'), l('prioridade_severidade', '5', 'Alta'),
    ])]).toEqual([['1', 'Crítica'], ['2', 'Alta']]);
  });
  it('a versão de critério grava as métricas de afeta, uma linha por métrica, só em dspd_core', async () => {
    const lido = analisarDominioBm(comPrioridade([{ codigo: '1', rotulo: 'Crítica' }], ['O16']));
    const d = criarDublePg((c) => (c.texto.includes('RETURNING versao_id') ? [{ versao_id: '77' }] : []));
    const r = await sincronizarDominioBm(d.pool, montarEsquemas(''), lido, '2026-11-04', new Date('2026-11-04T12:00:00Z'));
    expect(r).toMatchObject({ inseridas: 1, versaoRegistrada: true });
    const m = d.chamadas.filter((c) => c.texto.startsWith('INSERT INTO dspd_core.ref_versao_criterio_metrica'));
    expect(m.map((c) => c.valores)).toEqual([['77', 'O16']]);
  });
});
