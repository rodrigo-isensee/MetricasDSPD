import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ARQUIVO_DOMINIO_BM, fasesDeLinhas, prioridadesDeLinhas, reguaDeLinhas, TIPOS_SELECAO_UNICA, TAMANHO_MAXIMO_ARQUIVO, analisarDominioBm, dominiosDeLinhas, lerDominioBm, listasDoArquivo, sincronizarDominioBm,
} from '../src/modulos/businessmap/dominio-businessmap.js';
import { reguaSoDeTimesDaReferencia } from '../src/modulos/businessmap/projetor.js';
import { TIMES } from '../migrations/0019_bm_carga_inicial_times.js';
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

describe('K-385: texto acima do limite nomeia o campo e o tamanho', () => {
  it('regra com 3001 caracteres: a mensagem diz o campo e o tamanho, sem o valor', () => {
    const msg = recusa(arquivo([campo()], { regra: 'x'.repeat(3001) }));
    expect(msg).toContain('campo regra tem 3001 caracteres, limite 3000');
    expect(msg).not.toContain('xxxxx');
  });
  it('texto aninhado acima do limite também nomeia o campo; regra no limite (3000) passa', () => {
    expect(() => analisarDominioBm(arquivo([campo()], { regra: 'x'.repeat(3000) }), TIPOS_DO_TESTE)).not.toThrow();
    const msg = recusa(arquivo([campo({ valores: [{ codigo: 'a1', rotulo: 'r'.repeat(121) }] })]));
    expect(msg).toContain('campo campos.#.valores.#.rotulo tem 121 caracteres, limite 120');
  });
});

describe('bm:ref-sync: o arquivo versionado', () => {
  it('E7.203: os campos 48 e 49 trazem o value_id de cada opção (catálogo do spike); o 49 tem as 6 opções; value_id vira lista valor_id_<coluna> no ref_dominio', () => {
    const lido = lerDominioBm();
    const ids48 = lido.arquivo.campos[0]!.valores.map((v) => v.value_id);
    expect([...ids48].sort()).toEqual(['114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125']);
    expect(lido.arquivo.campos[1]).toMatchObject({ field_id: '49', type: 'dropdown', coluna: 'origem_demanda' });
    expect(lido.arquivo.campos[1]!.valores.map((v) => [v.value_id, v.codigo])).toEqual([
      ['126', 'Erro em entrega anterior'], ['127', 'Configuração incorreta'], ['128', 'Falta de treinamento do usuário'],
      ['129', 'Informação não repassada'], ['130', 'Processo manual que deveria estar automatizado'], ['131', 'Demanda nova'],
    ]);
    const listas = listasDoArquivo(lido.arquivo);
    expect(listas['valor_id_causa_raiz']).toHaveLength(12);
    expect(listas['valor_id_origem_demanda']![0]).toEqual({ codigo: '126', rotulo: 'Erro em entrega anterior' });
    expect(listas['origem_demanda']![0]).toEqual({ codigo: 'Erro em entrega anterior', rotulo: '1. Erro em entrega anterior' });
    expect(lido.arquivo.versao_criterio.afeta).toEqual(['O8', 'O14', 'O17', 'BLOQUEADOS', 'O2', 'O19', 'T10', 'T12']);
  });

  it('E7.214: o campo 51 (Responsabilidade do Atraso) traz as 3 opções do catálogo pelo value_id, com o código do contrato; o campo 42 (pessoa) não entra', () => {
    const lido = lerDominioBm();
    expect(lido.arquivo.campos[2]).toMatchObject({ field_id: '51', type: 'dropdown', coluna: 'responsabilidade_atraso' });
    // Escrito AQUI, não importado do código (B-1 da ADR 0020): catálogo do spike allowedValues de 2026-11-16.
    expect(lido.arquivo.campos[2]!.valores.map((v) => [v.value_id, v.codigo])).toEqual([['137', 'Interno'], ['138', 'Solicitante'], ['139', 'Terceiro']]);
    expect(lido.arquivo.campos.map((c) => c.field_id)).not.toContain('42');
    expect(listasDoArquivo(lido.arquivo)['valor_id_responsabilidade_atraso']).toEqual([
      { codigo: '137', rotulo: 'Interno' }, { codigo: '138', rotulo: 'Solicitante' }, { codigo: '139', rotulo: 'Terceiro' }]);
  });

  it('E7.203: value_id repetido ou não numérico no arquivo é recusado', () => {
    const ruim = JSON.parse(readFileSync(ARQUIVO_DOMINIO_BM, 'utf8')) as { campos: { valores: { value_id?: string }[] }[] };
    ruim.campos[0]!.valores[1]!.value_id = ruim.campos[0]!.valores[0]!.value_id!;
    expect(() => analisarDominioBm(JSON.stringify(ruim))).toThrow(ErroDominio);
    ruim.campos[0]!.valores[1]!.value_id = '12a';
    expect(() => analisarDominioBm(JSON.stringify(ruim))).toThrow(ErroDominio);
  });

  it('E7.86: o arquivo traz o campo 48 (Causa Raiz, dropdown) com as 12 opções do dono, e a lista positiva de tipos é só dropdown', () => {
    const lido = lerDominioBm();
    // Escrito AQUI, não importado do código (B-1 da ADR 0020): rótulos exatamente como o dono passou, na ordem dele.
    const ROTULOS = ['Requisitos mal definidos', 'Requisito alterado', 'Erro de lógica / codificação', 'Falha de integração', 'Dados / massa de teste',
      'Configuração de ambiente', 'Efeito colateral', 'Dependência externa', 'Teste insuficiente', 'Layout / Interface', 'Não é bug', 'Outros'];
    expect(lido.arquivo.campos).toHaveLength(3);
    expect(lido.arquivo.campos[0]).toMatchObject({ field_id: '48', type: 'dropdown', coluna: 'causa_raiz' });
    expect(lido.arquivo.campos[0]!.valores.map((v) => v.rotulo)).toEqual(ROTULOS);
    expect(new Set(lido.arquivo.campos[0]!.valores.map((v) => v.codigo)).size).toBe(12);
    expect(listasDoArquivo(lido.arquivo)['campo_customizado']).toEqual([{ codigo: '48', rotulo: 'causa_raiz' }, { codigo: '49', rotulo: 'origem_demanda' }, { codigo: '51', rotulo: 'responsabilidade_atraso' }]);
    expect(lido.arquivo.versao_criterio.descricao).toContain('2026-11-16');
    // C8a: escrito AQUI, não importado do código (B-1 da ADR 0020); fato da OpenAPI v2 do BusinessMap, escala decrescente
    expect(lido.arquivo.prioridade_severidade).toEqual([
      { codigo: '1', rotulo: 'Crítica' }, { codigo: '2', rotulo: 'Alta' }, { codigo: '3', rotulo: 'Média' }, { codigo: '4', rotulo: 'Baixa' },
    ]);
    // 105 (E7.102, E7.203 e E7.184): uma versão de critério marca a régua de tamanho (O8), os campos 48 e 49 pelo value_id (O14, O17)
    // e os 11 motivos de bloqueio do BusinessMap (BLOQUEADOS, O2, O19, T10, T12)
    expect(lido.arquivo.versao_criterio.afeta).toEqual(['O8', 'O14', 'O17', 'BLOQUEADOS', 'O2', 'O19', 'T10', 'T12']);
    expect(lido.arquivo.versao_criterio.descricao).toContain('105:tamanho-pela-regua-do-time');
    expect(lido.arquivo.versao_criterio.descricao).toContain('motivos de bloqueio');
    expect(lido.arquivo.motivo_bloqueio.map((m) => m.codigo)).toEqual(['1', '2', '3', '6', '7', '9', '10', '11', '12', '13', '14']);
    expect(lido.sha256).toBe(createHash('sha256').update(readFileSync(ARQUIVO_DOMINIO_BM, 'utf8')).digest('hex'));
    expect(TIPOS_SELECAO_UNICA).toEqual(['dropdown']);
  });

  it('E7.86: o field 48 com tipo de texto livre é recusado pela lista positiva do código', () => {
    const ruim = JSON.parse(readFileSync(ARQUIVO_DOMINIO_BM, 'utf8')) as { campos: { type: string }[] };
    ruim.campos[0]!.type = 'single_line_text';
    expect(() => analisarDominioBm(JSON.stringify(ruim))).toThrow(ErroDominio);
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
      valor_id_area_solicitante: [],
      sistema: [{ codigo: 's1', rotulo: 'Sistema Um' }],
      valor_id_sistema: [],
      motivo_bloqueio: [],
      setor_quadro: [],
      prioridade_severidade: [],
      fase_deteccao_coluna: [],
      tamanho_regua: [],
    });
    expect(listasDoArquivo(aceita([]).arquivo)).toEqual({ campo_customizado: [], motivo_bloqueio: [], setor_quadro: [], prioridade_severidade: [], fase_deteccao_coluna: [], tamanho_regua: [] });
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

  it.each(['owner_user_id', 'inexistente', 'campo_customizado', 'fase_deteccao', '__proto__'])('CA-069-2: coluna %s fora do enum fechado recusa', (coluna) => {
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

  it('E7.203: valor_id_<coluna> liga value_id ao código; value_id duplicado, não numérico ou de código fora da lista é ignorado', () => {
    const m = dominiosDeLinhas([
      cc('48', 'causa_raiz'), v('causa_raiz', 'outros', 'Outros'), v('causa_raiz', 'efeito', 'Efeito'),
      v('valor_id_causa_raiz', '122', 'outros'), v('valor_id_causa_raiz', '117', 'efeito'), v('valor_id_causa_raiz', '9', 'efeito'), v('valor_id_causa_raiz', '9', 'outros'),
      v('valor_id_causa_raiz', '1x', 'outros'), v('valor_id_causa_raiz', '500', 'inexistente'), v('valor_id_causa_raiz', '600', 'desconhecido'),
    ]);
    expect([...m.get('48')!].sort()).toEqual([['117', 'efeito'], ['122', 'outros'], ['Efeito', 'efeito'], ['Outros', 'outros']].sort());
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
    expect(r).toEqual({ sha256: lido.sha256, campos: 1, inseridas: 2, fechadas: 0, versaoRegistrada: true, recusados: [] });
    const sql = d.chamadas.map((c) => c.texto);
    expect(sql.filter((t) => t.startsWith('INSERT INTO dspd_bm.ref_dominio'))).toHaveLength(2);
    expect(sql.join('\n')).not.toMatch(/dspd_ac|DELETE|TRUNCATE/);
    const versao = d.chamadas.find((c) => c.texto.includes('INSERT INTO dspd_core.ref_versao_criterio'))!;
    expect(versao.valores).toEqual([HOJE, 'Teste do bm:ref-sync', 'Teste', `069:ref-bm-campos:${lido.sha256}`, AGORA.toISOString()]);
    expect(d.chamadas.find((c) => c.texto.includes('campo = ANY'))!.valores).toEqual([['campo_customizado', 'area_solicitante', 'valor_id_area_solicitante', 'motivo_bloqueio', 'setor_quadro', 'prioridade_severidade', 'fase_deteccao_coluna', 'tamanho_regua']]);
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
    const r = await sincronizarDominioBm(retro.pool, S, vazio, HOJE, AGORA);
    expect(r).toMatchObject({ inseridas: 0, fechadas: 0, versaoRegistrada: false });
    expect(r.recusados.map((x) => x.campo)).toEqual(['campo_customizado']);
    expect(retro.chamadas.some((c) => /^(INSERT|UPDATE)/.test(c.texto))).toBe(false);
  });

  describe('K-383: grava por campo, append-only', () => {
    const SEL = 'SELECT campo, codigo, rotulo, vigente_de';
    const mapa = { campo: 'campo_customizado', codigo: '7', rotulo: 'area_solicitante' };
    const valor = (rotulo: string, vigente_de: string) => ({ campo: 'area_solicitante', codigo: 'a1', rotulo, vigente_de });
    const escritas = (d: ReturnType<typeof criarDublePg>) => d.chamadas.filter((c) => /^(INSERT INTO dspd_bm|UPDATE)/.test(c.texto));

    it('campo igual ao vigente é pulado: sem nova vigência e sem erro, mesmo com vigência aberta hoje', async () => {
      const d = criarDublePg((c) => (c.texto.startsWith(SEL) ? [{ ...mapa, vigente_de: HOJE }, valor('Area Um', HOJE)] : []));
      expect(await sincronizarDominioBm(d.pool, S, lido, HOJE, AGORA)).toMatchObject({ inseridas: 0, fechadas: 0, versaoRegistrada: false, recusados: [] });
      expect(escritas(d)).toEqual([]);
    });

    it('campo novo é gravado ao lado de campo igual', async () => {
      const d = criarDublePg((c) => (c.texto.startsWith(SEL) ? [{ ...mapa, vigente_de: HOJE }] : []));
      const r = await sincronizarDominioBm(d.pool, S, lido, HOJE, AGORA);
      expect(r).toMatchObject({ inseridas: 1, fechadas: 0, versaoRegistrada: true, recusados: [] });
      expect(escritas(d).map((c) => c.valores)).toEqual([['area_solicitante', 'a1', HOJE, 'Area Um', 0]]);
    });

    it('campo mudado com vigência aberta hoje é recusado com a mesma mensagem, sozinho: o outro campo mudado grava', async () => {
      const lido3 = analisarDominioBm(arquivo([campo({ valores: [{ codigo: 'a1', rotulo: 'Area Um nova' }] })], { setores: [{ codigo: '5', rotulo: 'Novo' }] }), TIPOS_DO_TESTE);
      const vigentes = [{ ...mapa, vigente_de: '2026-11-01' }, valor('Area Um', HOJE), { campo: 'setor_quadro', codigo: '5', rotulo: 'Antigo', vigente_de: '2026-11-01' }];
      const d = criarDublePg((c) => (c.texto.startsWith(SEL) ? vigentes : []));
      const r = await sincronizarDominioBm(d.pool, S, lido3, HOJE, AGORA);
      expect(r.recusados).toEqual([{ campo: 'area_solicitante', mensagem: `ref_dominio area_solicitante: já existe vigência aberta em ${HOJE} para o mesmo código; repita depois dessa data` }]);
      expect(escritas(d).filter((c) => c.texto.startsWith('UPDATE')).map((c) => c.valores)).toEqual([[HOJE, 'setor_quadro', '5']]);
      expect(escritas(d).filter((c) => c.texto.includes('INSERT INTO dspd_bm')).map((c) => c.valores[0])).toEqual(['setor_quadro']);
      expect(r.versaoRegistrada).toBe(true);
    });

    it('nunca apaga: nenhuma carga emite DELETE ou TRUNCATE', async () => {
      const d = criarDublePg((c) => (c.texto.startsWith(SEL) ? [valor('Antigo', HOJE)] : []));
      await sincronizarDominioBm(d.pool, S, lido, HOJE, AGORA);
      expect(d.chamadas.map((c) => c.texto).join('\n')).not.toMatch(/DELETE|TRUNCATE/);
    });
  });
});

// L10a do pedido 097 (E7): dicionário quadro -> setor. Casos de abuso escritos aqui, sem importar a regra do código.
describe('bm:ref-sync: lista setores (097 L10a)', () => {
  const comSetores = (setores: unknown[]): string => arquivo([], { setores });
  const bom = [{ codigo: '23', rotulo: 'Plataformas' }, { codigo: '35', rotulo: 'Desenv Sistemas Plataformas Digitais - Gerencial' }];

  it('o arquivo versionado traz os 6 quadros que o dono nomeou (o 35 fica fora até a P-097-10)', () => {
    expect(lerDominioBm().arquivo.setores).toEqual([
      { codigo: '23', rotulo: 'Sistemas Corporativos' },
      { codigo: '24', rotulo: 'Escritório de Processos e Projetos' },
      { codigo: '25', rotulo: 'Sistemas de Vendas e Operações' },
      { codigo: '27', rotulo: 'Plataformas' },
      { codigo: '31', rotulo: 'Ciência de Dados' },
      { codigo: '79', rotulo: 'Marketing e Vendas' },
    ]);
  });

  it('arquivo sem a lista é aceito (padrão vazio) e a lista vira a lista setor_quadro de ref_dominio', () => {
    expect(analisarDominioBm(arquivo([])).arquivo.setores).toEqual([]);
    expect(listasDoArquivo(analisarDominioBm(comSetores(bom)).arquivo).setor_quadro).toEqual(bom);
  });

  it.each([
    ['rótulo com sobrenome em caixa alta', [{ codigo: '23', rotulo: 'Plataformas - SILVA' }]],
    ['rótulo com sobrenome e espaço no fim', [{ codigo: '23', rotulo: 'Plataformas - SILVA ' }]],
    ['rótulo com e-mail', [{ codigo: '23', rotulo: 'fulano@empresa.com' }]],
    ['rótulo vazio', [{ codigo: '23', rotulo: '' }]],
    ['rótulo com caractere de controle', [{ codigo: '23', rotulo: 'Plata\u0000formas' }]],
    ['código não numérico', [{ codigo: 'abc', rotulo: 'Plataformas' }]],
    ['código com sinal', [{ codigo: '-5', rotulo: 'Plataformas' }]],
    ['código vazio', [{ codigo: '', rotulo: 'Plataformas' }]],
    ['código repetido', [{ codigo: '23', rotulo: 'Plataformas' }, { codigo: '23', rotulo: 'Ciência de Dados' }]],
    ['código repetido com zeros à esquerda', [{ codigo: '23', rotulo: 'Plataformas' }, { codigo: '023', rotulo: 'Ciência de Dados' }]],
    ['rótulo repetido', [{ codigo: '23', rotulo: 'Plataformas' }, { codigo: '24', rotulo: 'Plataformas' }]],
    ['campo extra (nome do quadro)', [{ codigo: '23', rotulo: 'Plataformas', nome_quadro: 'Plataformas - SILVA' }]],
  ])('recusa a carga inteira: %s, sem o valor na mensagem', (_n, setores) => {
    const msg = recusa(comSetores(setores));
    expect(msg).toContain('inválido');
    expect(msg).not.toContain('SILVA');
    expect(msg).not.toContain('empresa');
  });

  it('mais de 50 setores recusa', () => {
    recusa(comSetores(Array.from({ length: 51 }, (_v, i) => ({ codigo: String(i + 1), rotulo: `Setor ${i + 1}` }))));
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

// Pedido 105 (E7.5): tabela coluna_id -> fase de detecção do bug. As cinco fases e as colunas conferidas estão escritas AQUI, não importadas do código (B-1 da ADR 0020).
describe('105: tabela coluna -> fase de detecção (fase_deteccao_coluna)', () => {
  const FASES = ['Desenvolvimento', 'Revisão de código', 'Teste interno', 'Homologação do negócio', 'Produção'];
  const comFases = (f: unknown, afeta: unknown = []): string => JSON.stringify({
    ...JSON.parse(arquivo([])), fase_deteccao_coluna: f,
    versao_criterio: { dominio: 'businessmap', descricao: 'Teste', motivo: 'Teste', referencia: 'teste', afeta },
  });

  it('o arquivo versionado traz as 347 colunas aprovadas pelo dono, só com as cinco fases, sem coluna repetida', () => {
    const t = lerDominioBm().arquivo.fase_deteccao_coluna;
    expect(t).toHaveLength(347);
    expect(new Set(t.map((x) => x.codigo)).size).toBe(347);
    expect(new Set(t.map((x) => x.rotulo))).toEqual(new Set(FASES));
    const por = (f: string): number => t.filter((x) => x.rotulo === f).length;
    expect([por(FASES[0]!), por(FASES[1]!), por(FASES[2]!), por(FASES[3]!), por(FASES[4]!)]).toEqual([104, 44, 18, 36, 145]);
  });

  it('colunas conferidas na análise: uma de cada fase, as duvidosas D-1 a D-6 como propostas e as sem fase fora do mapa', () => {
    const m = new Map(lerDominioBm().arquivo.fase_deteccao_coluna.map((x) => [x.codigo, x.rotulo]));
    expect([m.get('400'), m.get('686'), m.get('1298'), m.get('1416'), m.get('396')]).toEqual(FASES);
    // D-5 (quadro 27, "Validação") e D-4 (quadro 27, "Aguardando Deploy") como propostos
    expect([m.get('2313'), m.get('2314')]).toEqual(['Homologação do negócio', 'Produção']);
    // D-7 (ponta do quadro 25: Aguardando Build 1891, Em Andamento 1890, Pronto 1895 e 1892) fica sem fase
    for (const id of ['1890', '1891', '1892', '1895']) expect(m.has(id), id).toBe(false);
    // sem movimento ou sem papel: nenhum id desconhecido entra
    expect(m.has('1')).toBe(false);
  });

  it('a tabela vira a lista fase_deteccao_coluna de ref_dominio e a versão de critério afeta o O15', () => {
    const lido = analisarDominioBm(comFases([{ codigo: '400', rotulo: 'Desenvolvimento' }, { codigo: '396', rotulo: 'Produção' }], ['O15']));
    expect(listasDoArquivo(lido.arquivo).fase_deteccao_coluna).toEqual([{ codigo: '400', rotulo: 'Desenvolvimento' }, { codigo: '396', rotulo: 'Produção' }]);
    expect(lido.arquivo.versao_criterio.afeta).toEqual(['O15']);
  });

  it.each([
    ['fase fora das cinco', [{ codigo: '400', rotulo: 'Planejamento' }]],
    ['código não numérico', [{ codigo: 'Em andamento', rotulo: 'Desenvolvimento' }]],
    ['código com sinal', [{ codigo: '-4', rotulo: 'Desenvolvimento' }]],
    ['código vazio', [{ codigo: '', rotulo: 'Desenvolvimento' }]],
    ['coluna repetida', [{ codigo: '400', rotulo: 'Desenvolvimento' }, { codigo: '400', rotulo: 'Produção' }]],
    ['coluna repetida com zeros à esquerda', [{ codigo: '400', rotulo: 'Desenvolvimento' }, { codigo: '0400', rotulo: 'Produção' }]],
    ['campo extra (nome da coluna)', [{ codigo: '400', rotulo: 'Desenvolvimento', nome: 'Em andamento' }]],
  ])('recusa a carga inteira: %s, sem o valor na mensagem', (_n, f) => {
    const msg = recusa(comFases(f));
    expect(msg).toContain('inválido');
    expect(msg).not.toContain('Planejamento');
    expect(msg).not.toContain('Em andamento');
  });

  it('mais de 2000 colunas recusa', () => {
    recusa(comFases(Array.from({ length: 2001 }, (_v, i) => ({ codigo: String(i + 1), rotulo: 'Produção' }))));
  });

  it('a leitura do projetor desconfia do banco: só coluna numérica e uma das cinco fases; coluna ligada a duas fases sai', () => {
    const l = (campo: string, codigo: string, rotulo: string) => ({ campo, codigo, rotulo });
    expect([...fasesDeLinhas([
      l('fase_deteccao_coluna', '400', 'Desenvolvimento'), l('fase_deteccao_coluna', '401', 'Planejamento'), l('fase_deteccao_coluna', 'x', 'Produção'),
      l('outro', '402', 'Produção'), l('fase_deteccao_coluna', '403', 'Teste interno'), l('fase_deteccao_coluna', '403', 'Produção'),
      l('fase_deteccao_coluna', '0404', 'Revisão de código'),
    ])]).toEqual([['400', 'Desenvolvimento'], ['404', 'Revisão de código']]);
  });

  it('a primeira carga registra a versão de critério do O15, uma linha de métrica, só em dspd_core', async () => {
    const lido = analisarDominioBm(comFases([{ codigo: '400', rotulo: 'Desenvolvimento' }], ['O15']));
    const d = criarDublePg((c) => (c.texto.includes('RETURNING versao_id') ? [{ versao_id: '78' }] : []));
    const r = await sincronizarDominioBm(d.pool, montarEsquemas(''), lido, '2026-11-15', new Date('2026-11-15T12:00:00Z'));
    expect(r).toMatchObject({ inseridas: 1, versaoRegistrada: true });
    expect(d.chamadas.filter((c) => c.texto.startsWith('INSERT INTO dspd_core.ref_versao_criterio_metrica')).map((c) => c.valores)).toEqual([['78', 'O15']]);
    expect(d.chamadas.find((c) => c.texto.startsWith('INSERT INTO dspd_bm.ref_dominio'))!.valores).toEqual(['fase_deteccao_coluna', '400', '2026-11-15', 'Desenvolvimento', 0]);
  });
});

// Pedido 105 (E7.102): régua de tamanho por time (`tamanho_regua`). As seis faixas e as chaves conferidas estão escritas AQUI, não importadas do código (B-1 da ADR 0020).
describe('105: régua de tamanho por time (tamanho_regua)', () => {
  const FAIXAS = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
  const comRegua = (r: unknown): string => JSON.stringify({ ...JSON.parse(arquivo([])), tamanho_regua: r });
  const l = (campo: string, codigo: string, rotulo: string) => ({ campo, codigo, rotulo });

  it('o arquivo versionado traz as 63 linhas da seção 2a, só com as seis faixas, sem chave repetida, nos 7 times aprovados', () => {
    const t = lerDominioBm().arquivo.tamanho_regua;
    expect(t).toHaveLength(63);
    expect(new Set(t.map((x) => x.codigo)).size).toBe(63);
    expect(new Set(t.map((x) => x.rotulo))).toEqual(new Set(FAIXAS));
    expect(new Set(t.map((x) => x.codigo.split(':')[0]))).toEqual(new Set(['26', '38', '42', '6', '5', '18', '14']));
    const m = new Map(t.map((x) => [x.codigo, x.rotulo]));
    // conferência por amostra: meio ponto com ponto; o 191 (26) tem o 1 em P, o 2 em GG e do 2,5 em diante XG; o 243 (14) preenche as seis faixas
    expect([m.get('26:0.5'), m.get('26:1'), m.get('26:2'), m.get('26:2.5'), m.get('26:64')]).toEqual(['P', 'P', 'GG', 'XG', 'XG']);
    expect([m.get('38:5'), m.get('14:2.5'), m.get('6:2'), m.get('5:3'), m.get('18:13')]).toEqual(['M', 'P', 'M', 'M', 'XG']);
    expect(['14:0.5', '14:2', '14:3', '14:4', '14:5', '14:6'].map((k) => m.get(k))).toEqual(['PP', 'P', 'M', 'G', 'GG', 'XG']);
    // por time, as contagens de valores do plano (19, 7, 6, 7, 6, 6, 12)
    const por = (id: string): number => t.filter((x) => x.codigo.startsWith(`${id}:`)).length;
    expect([por('26'), por('38'), por('42'), por('6'), por('5'), por('18'), por('14')]).toEqual([19, 7, 6, 7, 6, 6, 12]);
  });

  it('vira a lista tamanho_regua de ref_dominio; chave repetida, faixa fora das seis, código fora da forma canônica e campo extra são recusados', () => {
    const ok = analisarDominioBm(comRegua([{ codigo: '26:0.5', rotulo: 'P' }, { codigo: '26:13', rotulo: 'XG' }]));
    expect(listasDoArquivo(ok.arquivo).tamanho_regua).toEqual([{ codigo: '26:0.5', rotulo: 'P' }, { codigo: '26:13', rotulo: 'XG' }]);
    expect(() => analisarDominioBm(comRegua([{ codigo: '26:1', rotulo: 'P' }, { codigo: '26:1', rotulo: 'M' }]))).toThrow(ErroDominio);
    for (const rotulo of ['PPP', 'p', 'Sem tamanho', 'Média']) expect(() => analisarDominioBm(comRegua([{ codigo: '26:1', rotulo }])), rotulo).toThrow(ErroDominio);
    for (const codigo of ['26', '26:', ':1', '26:1,5', '26:01', '26:1.50', '26:1.', '026:1', 'x:1', '26:-1', '26:1:2', '26: 1', '26:1e3', '26:12345', '26:1.2345'])
      expect(() => analisarDominioBm(comRegua([{ codigo, rotulo: 'P' }])), codigo).toThrow(ErroDominio);
    expect(() => analisarDominioBm(comRegua([{ codigo: '26:1', rotulo: 'P', extra: 1 }]))).toThrow(ErroDominio);
  });

  it('a leitura do projetor desconfia do banco: código canônico e uma das seis faixas; chave ligada a duas faixas sai; time só entra com linha válida', () => {
    const r = reguaDeLinhas([
      l('tamanho_regua', '26:1', 'P'), l('tamanho_regua', '26:0.5', 'P'), l('tamanho_regua', '26:2', 'GG'), l('tamanho_regua', '26:2', 'XG'),
      l('tamanho_regua', '26:1.50', 'P'), l('tamanho_regua', '26:3', 'Grande'), l('outro', '26:4', 'XG'), l('tamanho_regua', '38:3', 'M'), l('tamanho_regua', '99:1', 'Grande'),
      l('tamanho_regua', '77:5', 'M'), l('tamanho_regua', '77:5', 'G'),
    ]);
    expect([...r.faixas]).toEqual([['26:1', 'P'], ['26:0.5', 'P'], ['38:3', 'M']]);
    expect([...r.times].sort()).toEqual(['26', '38']);
    expect(reguaDeLinhas([]).faixas.size).toBe(0);
  });

  it('a primeira carga registra a versão de critério que afeta só o O8, só em dspd_core', async () => {
    const lido = analisarDominioBm(JSON.stringify({
      ...JSON.parse(comRegua([{ codigo: '26:1', rotulo: 'P' }])),
      versao_criterio: { dominio: 'businessmap', descricao: 'Teste', motivo: 'Teste', referencia: 'teste', afeta: ['O8'] },
    }));
    const d = criarDublePg((c) => (c.texto.includes('RETURNING versao_id') ? [{ versao_id: '90' }] : []));
    const r = await sincronizarDominioBm(d.pool, montarEsquemas(''), lido, '2026-11-16', new Date('2026-11-16T12:00:00Z'));
    expect(r).toMatchObject({ inseridas: 1, versaoRegistrada: true });
    expect(d.chamadas.filter((c) => c.texto.startsWith('INSERT INTO dspd_core.ref_versao_criterio_metrica')).map((c) => c.valores)).toEqual([['90', 'O8']]);
    expect(d.chamadas.find((c) => c.texto.startsWith('INSERT INTO dspd_bm.ref_dominio'))!.valores).toEqual(['tamanho_regua', '26:1', '2026-11-16', 'P', 0]);
  });

  it('os 7 times da régua do arquivo existem na carga inicial dos times (migração 0019), com o nome de workflow do plano', () => {
    const porId = new Map(TIMES.map((t) => [String(t.id), t.workflow]));
    const ids = [...new Set(lerDominioBm().arquivo.tamanho_regua.map((x) => x.codigo.split(':')[0]!))];
    expect(ids.map((id) => [id, porId.get(id)])).toEqual([['26', '191'], ['38', '208'], ['42', '76'], ['6', '63'], ['5', '255'], ['18', '192'], ['14', '243']]);
  });

  it('o projetor só usa a régua de time que existe na referência de times; linha de time desconhecido é ignorada', () => {
    const r = reguaSoDeTimesDaReferencia(reguaDeLinhas([l('tamanho_regua', '26:1', 'P'), l('tamanho_regua', '999:1', 'M'), l('tamanho_regua', '38:3', 'M')]), new Set(['26', '5']));
    expect([...r.faixas]).toEqual([['26:1', 'P']]);
    expect([...r.times]).toEqual(['26']);
  });
});
