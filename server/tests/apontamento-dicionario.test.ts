import { classificarApontamento } from '@metricas-dspd/metricas/coletor';
import { describe, expect, it } from 'vitest';
import {
  analisarDicionario, carregarDicionario, ErroDicionario, lerDicionario, planejarDicionario, sincronizarDicionario,
  type ArquivoDicionario, type DicionarioBanco, type TipoDoCard,
} from '../src/modulos/businessmap/apontamento/dicionario.js';
import { ErroColetaBm } from '../src/modulos/businessmap/coleta.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// Pedido 059, E2.19: carga do dicionário de subgrupo por ref:sync (aditiva, só INSERT) e leitura pelo coletor. Sem banco: o SQL real vai ao .pg.
const S = montarEsquemas('');
const TIPOS: TipoDoCard[] = [{ tipo_id: '11', nome: 'Kaizen' }, { tipo_id: '22', nome: 'Incidente de Produção' }, { tipo_id: '33', nome: 'Story' }];
const arquivoMinimo = (extra: Partial<ArquivoDicionario> = {}): ArquivoDicionario => ({
  versao: 'v1',
  subgrupos: [{ codigo: 'a', rotulo: 'A', prioridade: 1 }, { codigo: 'b', rotulo: 'B', prioridade: 2 }],
  termos: [{ subgrupo: 'b', termos: ['teste', 'homolog'] }],
  regrasPorTipo: [{ tipoRotulo: 'kaizen', condicao: 'sempre', subgrupo: 'a' }],
  subtarefa: [{ codigo: 'direto-no-card', rotulo: 'Direto no card' }],
  ...extra,
});
const bancoDe = (a: ArquivoDicionario = arquivoMinimo()): DicionarioBanco => ({
  subgrupos: a.subgrupos.map((s) => ({ ...s })),
  termos: a.termos.flatMap((t) => t.termos.map((termo) => ({ subgrupo_codigo: t.subgrupo, termo_normalizado: termo }))),
  regras: [{ type_id: '11', condicao: 'sempre', subgrupo_codigo: 'a' }],
});
const recusa = (f: () => unknown): ErroDicionario => {
  try { f(); } catch (e) { return e as ErroDicionario; }
  throw new Error('esperava recusa');
};

describe('arquivo versionado do dicionário (como está no discovery)', () => {
  it('o arquivo do repositório é válido: 12 subgrupos, os termos da seção 4, as duas regras por tipo e os dois códigos de subtarefa', () => {
    const { arquivo, sha256 } = lerDicionario();
    expect(arquivo.versao).toBe('2026-11-02-v1');
    expect(arquivo.subgrupos.map((s) => [s.prioridade, s.codigo])).toEqual([
      [1, 'gestao-backlog-rituais'], [2, 'testes'], [3, 'reunioes-comunicacao'], [4, 'analise-diagnostico'], [5, 'gestao-mudanca'], [6, 'documentacao'],
      [7, 'configuracao-infra'], [8, 'apoio-areas'], [9, 'desenvolvimento-correcao'], [10, 'incidente-sem-detalhe'], [11, 'execucao-tecnica'], [12, 'nao-classificado'],
    ]);
    expect(arquivo.termos.flatMap((t) => t.termos)).toHaveLength(2 + 4 + 2 + 3 + 1 + 3 + 1 + 9);
    expect(arquivo.regrasPorTipo).toEqual([
      { tipoRotulo: 'Kaizen', condicao: 'sempre', subgrupo: 'gestao-backlog-rituais' },
      { tipoRotulo: 'Incidente de Produção', condicao: 'sem-comentario', subgrupo: 'incidente-sem-detalhe' },
    ]);
    expect(arquivo.subtarefa.map((s) => s.codigo)).toEqual(['direto-no-card', 'em-subtarefa']);
    expect(sha256).toMatch(/^[0-9a-f]{64}$/);
  });
  it('o dicionário do arquivo, ligado à função da biblioteca, classifica pela ordem de prioridade da especificação', async () => {
    const { arquivo } = lerDicionario();
    const db = criarDublePg(bancoComoResposta(planejarComoBanco(arquivo)));
    const dic = await carregarDicionario(db.pool, S);
    const c = (comentario: string | null, typeId: string | null = null) => classificarApontamento({ comentario, typeId }, dic).subgrupo;
    expect(c('Análise de teste')).toBe('testes');
    expect(c('reunião de análise')).toBe('reunioes-comunicacao');
    expect(c('ajuste de ambiente')).toBe('configuracao-infra');
    expect(c('qualquer coisa', '11')).toBe('gestao-backlog-rituais');
    expect(c(null, '11')).toBe('gestao-backlog-rituais');
    expect(c(null, '22')).toBe('incidente-sem-detalhe');
    expect(c('algo sem termo', '22')).toBe('execucao-tecnica');
    expect(c(null, '33')).toBe('nao-classificado');
    expect(dic.versao).toBe('2026-11-02-v1');
  });
});

describe('analisarDicionario: validação do arquivo (recusa sem eco do valor)', () => {
  const texto = (a: unknown): string => JSON.stringify(a);
  const invalido = (a: unknown): string => recusa(() => analisarDicionario(texto(a))).message;
  const base = (): Record<string, unknown> => JSON.parse(texto(arquivoMinimo())) as Record<string, unknown>;
  it('JSON inválido e campo desconhecido', () => {
    expect(recusa(() => analisarDicionario('{ não é json')).message).toMatch(/não é um JSON válido/);
    expect(invalido({ ...base(), extra: 1 })).toMatch(/inválido \(raiz\)/);
    expect(invalido([])).toMatch(/inválido/);
  });
  it('termo com maiúscula, acento, espaço, 1 caractere ou repetido entre subgrupos', () => {
    const com = (termos: string[], extra: unknown[] = []): unknown => ({ ...base(), termos: [{ subgrupo: 'b', termos }, ...extra] });
    for (const ruim of ['Teste', 'análise', 'dois palavras', 'x', 'a_b', '']) expect(invalido(com([ruim])), ruim).toMatch(/termos\.0/);
    expect(invalido(com(['teste', 'teste']))).toMatch(/termos/);
    expect(invalido(com(['teste'], [{ subgrupo: 'a', termos: ['teste'] }]))).toMatch(/termos/);
    expect(invalido(com(['teste'], [{ subgrupo: 'b', termos: ['outro'] }]))).toMatch(/termos/);
  });
  it('termos acima de 500 no total', () => {
    const muitos = (n: number, ini: number): string[] => Array.from({ length: n }, (_, i) => `t${String(ini + i).padStart(4, '0')}`);
    expect(invalido({ ...base(), termos: [{ subgrupo: 'a', termos: muitos(500, 0) }, { subgrupo: 'b', termos: muitos(1, 900) }] })).toMatch(/termos/);
  });
  it('subgrupo, prioridade e código repetidos; subgrupo inexistente em termos e em regras; regra repetida; subtarefa repetida', () => {
    const sub = (s: unknown[]): unknown => ({ ...base(), subgrupos: s });
    expect(invalido(sub([{ codigo: 'a', rotulo: 'A', prioridade: 1 }, { codigo: 'a', rotulo: 'A2', prioridade: 2 }]))).toMatch(/subgrupos/);
    expect(invalido(sub([{ codigo: 'a', rotulo: 'A', prioridade: 1 }, { codigo: 'b', rotulo: 'B', prioridade: 1 }]))).toMatch(/subgrupos/);
    expect(invalido(sub([{ codigo: 'A', rotulo: 'A', prioridade: 1 }]))).toMatch(/subgrupos/);
    expect(invalido(sub([{ codigo: 'a', rotulo: 'A', prioridade: 0 }]))).toMatch(/subgrupos/);
    expect(invalido({ ...base(), termos: [{ subgrupo: 'zzz', termos: ['teste'] }] })).toMatch(/termos\.0/);
    expect(invalido({ ...base(), regrasPorTipo: [{ tipoRotulo: 'Kaizen', condicao: 'sempre', subgrupo: 'zzz' }] })).toMatch(/regrasPorTipo\.0/);
    expect(invalido({ ...base(), regrasPorTipo: [{ tipoRotulo: 'Kaizen', condicao: 'sempre', subgrupo: 'a' }, { tipoRotulo: 'KAIZEN', condicao: 'sempre', subgrupo: 'b' }] })).toMatch(/regrasPorTipo/);
    expect(invalido({ ...base(), regrasPorTipo: [{ tipoRotulo: 'Kaizen', condicao: 'nunca', subgrupo: 'a' }] })).toMatch(/regrasPorTipo/);
    expect(invalido({ ...base(), subtarefa: [{ codigo: 'x', rotulo: 'X' }, { codigo: 'x', rotulo: 'Y' }] })).toMatch(/subtarefa/);
    expect(invalido({ ...base(), versao: 'com espaço' })).toMatch(/versao/);
  });
  it('texto livre com arroba, controle ou separador de linha no rótulo não entra, e a mensagem não repete o valor', () => {
    for (const ruim of ['fulano@exemplo.com', 'linha\nquebrada', 'zero​width', 'sep linha']) {
      const msg = invalido({ ...base(), subgrupos: [{ codigo: 'a', rotulo: ruim, prioridade: 1 }] });
      expect(msg).toMatch(/subgrupos/);
      expect(msg).not.toContain('fulano');
    }
  });
  it('o hash é o do texto exato do arquivo', () => {
    const a = analisarDicionario(texto(arquivoMinimo()));
    const b = analisarDicionario(`${texto(arquivoMinimo())}\n`);
    expect(a.sha256).not.toBe(b.sha256);
    expect(a.arquivo).toEqual(b.arquivo);
  });
});

describe('planejarDicionario: carga aditiva', () => {
  const vazio: DicionarioBanco = { subgrupos: [], termos: [], regras: [] };
  it('primeira carga: tudo entra, o rótulo do tipo vira type_id sem acento nem caixa e sem-comentario vira sem_comentario', () => {
    const arq = arquivoMinimo({ regrasPorTipo: [{ tipoRotulo: 'INCIDENTE DE PRODUCAO', condicao: 'sem-comentario', subgrupo: 'a' }] });
    expect(planejarDicionario(arq, vazio, TIPOS)).toEqual({
      subgrupos: [{ codigo: 'a', rotulo: 'A', prioridade: 1 }, { codigo: 'b', rotulo: 'B', prioridade: 2 }],
      termos: [{ subgrupo_codigo: 'b', termo_normalizado: 'teste' }, { subgrupo_codigo: 'b', termo_normalizado: 'homolog' }],
      regras: [{ type_id: '22', condicao: 'sem_comentario', subgrupo_codigo: 'a' }],
    });
  });
  it('idempotente: com o banco igual ao arquivo o plano é vazio (e a ordem dos termos não importa)', () => {
    const banco = bancoDe();
    banco.termos.reverse();
    expect(planejarDicionario(arquivoMinimo(), banco, TIPOS)).toEqual({ subgrupos: [], termos: [], regras: [] });
  });
  it('aditivo: subgrupo, termo e regra novos entram; o que já existe fica', () => {
    const arq = arquivoMinimo({
      subgrupos: [...arquivoMinimo().subgrupos, { codigo: 'c', rotulo: 'C', prioridade: 3 }],
      termos: [{ subgrupo: 'b', termos: ['teste', 'homolog', 'novo'] }, { subgrupo: 'c', termos: ['ccc'] }],
      regrasPorTipo: [...arquivoMinimo().regrasPorTipo, { tipoRotulo: 'Story', condicao: 'sem-comentario', subgrupo: 'c' }],
    });
    expect(planejarDicionario(arq, bancoDe(), TIPOS)).toEqual({
      subgrupos: [{ codigo: 'c', rotulo: 'C', prioridade: 3 }],
      termos: [{ subgrupo_codigo: 'b', termo_normalizado: 'novo' }, { subgrupo_codigo: 'c', termo_normalizado: 'ccc' }],
      regras: [{ type_id: '33', condicao: 'sem_comentario', subgrupo_codigo: 'c' }],
    });
  });
  it('tipo de card inexistente ou ambíguo: recusa a carga, sem adivinhar o id', () => {
    const arq = arquivoMinimo({ regrasPorTipo: [{ tipoRotulo: 'Tipo que não existe', condicao: 'sempre', subgrupo: 'a' }] });
    const e1 = recusa(() => planejarDicionario(arq, vazio, TIPOS));
    expect(e1).toMatchObject({ tipo: 'tipo' });
    expect(e1.message).toMatch(/não existe em ref_tipo_card/);
    const e2 = recusa(() => planejarDicionario(arquivoMinimo(), vazio, [...TIPOS, { tipo_id: '99', nome: 'KAIZEN' }]));
    expect(e2).toMatchObject({ tipo: 'tipo' });
    expect(e2.message).toMatch(/mais de um id/);
    // o mesmo tipo vigente listado duas vezes com o mesmo id não é ambiguidade
    expect(planejarDicionario(arquivoMinimo(), vazio, [...TIPOS, { tipo_id: '11', nome: 'Kaizen' }]).regras).toHaveLength(1);
  });
  it('recusa mudar ou tirar o que já foi carregado (exige coluna de vigência), sem gravar nada', () => {
    const casos: [string, ArquivoDicionario, DicionarioBanco, RegExp][] = [
      ['subgrupo saiu do arquivo', arquivoMinimo({ subgrupos: [{ codigo: 'a', rotulo: 'A', prioridade: 1 }], termos: [], regrasPorTipo: [] }), bancoDe(), /subgrupo b saiu do arquivo/],
      ['rótulo mudou', arquivoMinimo({ subgrupos: [{ codigo: 'a', rotulo: 'A novo', prioridade: 1 }, { codigo: 'b', rotulo: 'B', prioridade: 2 }] }), bancoDe(), /mudou de rótulo ou de prioridade/],
      ['prioridade mudou', arquivoMinimo({ subgrupos: [{ codigo: 'a', rotulo: 'A', prioridade: 5 }, { codigo: 'b', rotulo: 'B', prioridade: 2 }] }), bancoDe(), /mudou de rótulo ou de prioridade/],
      ['prioridade ocupada', arquivoMinimo({ subgrupos: [...arquivoMinimo().subgrupos, { codigo: 'c', rotulo: 'C', prioridade: 2 }] }), bancoDe(), /prioridade 2 do subgrupo c já é de outro/],
      ['termo saiu', arquivoMinimo({ termos: [{ subgrupo: 'b', termos: ['teste'] }] }), bancoDe(), /termo homolog saiu do subgrupo b/],
      ['regra saiu', arquivoMinimo({ regrasPorTipo: [] }), bancoDe(), /regra do tipo 11 \(sempre\) saiu/],
      ['regra mudou de subgrupo', arquivoMinimo({ regrasPorTipo: [{ tipoRotulo: 'Kaizen', condicao: 'sempre', subgrupo: 'b' }] }), bancoDe(), /regra do tipo 11 \(sempre\) mudou de subgrupo/],
    ];
    for (const [nome, arq, banco, re] of casos) {
      const e = recusa(() => planejarDicionario(arq, banco, TIPOS));
      expect(e, nome).toMatchObject({ tipo: 'mudanca' });
      expect(e.message, nome).toMatch(re);
      expect(e.message, nome).toMatch(/coluna de vigência/);
    }
  });
});

/** Banco falso do `sincronizarDicionario` e do `carregarDicionario`: responde pelas tabelas e guarda os INSERT. */
interface EstadoBanco { banco: DicionarioBanco; tipos: TipoDoCard[]; ultima: string | null; versaoExistente: string | null; referencias: string[] }
function planejarComoBanco(arq: ArquivoDicionario): EstadoBanco {
  const regras = arq.regrasPorTipo.map((r) => ({ type_id: r.tipoRotulo === 'Kaizen' ? '11' : '22', condicao: r.condicao === 'sempre' ? 'sempre' : 'sem_comentario', subgrupo_codigo: r.subgrupo }));
  return {
    banco: { subgrupos: arq.subgrupos.map((s) => ({ ...s })), termos: arq.termos.flatMap((t) => t.termos.map((termo) => ({ subgrupo_codigo: t.subgrupo, termo_normalizado: termo }))), regras },
    tipos: TIPOS, ultima: null, versaoExistente: null, referencias: [`059:ref-apontamento:${arq.versao}:${'a'.repeat(64)}`],
  };
}
const bancoComoResposta = (e: EstadoBanco, inserts: Chamada[] = []) => (c: Chamada): Resposta => {
  const t = c.texto;
  if (t.startsWith('INSERT INTO') && !t.includes('RETURNING')) { inserts.push(c); return []; }
  if (t.includes('FROM dspd_bm.ref_apontamento_subgrupo')) return e.banco.subgrupos;
  if (t.includes('FROM dspd_bm.ref_apontamento_termo')) return e.banco.termos;
  if (t.includes('FROM dspd_bm.ref_apontamento_regra_tipo')) return e.banco.regras;
  if (t.includes('FROM dspd_bm.ref_tipo_card')) return e.tipos;
  if (t.includes('max(vigente_desde)')) return [{ ultima: e.ultima }];
  if (t.includes('SELECT versao_id')) return e.versaoExistente === null ? [] : [{ versao_id: e.versaoExistente }];
  if (t.includes('INSERT INTO dspd_core.ref_versao_criterio')) { inserts.push(c); return [{ versao_id: '77' }]; }
  if (t.includes('SELECT referencia')) return e.referencias.map((referencia) => ({ referencia }));
  return [];
};

describe('sincronizarDicionario (dspd_ref, só INSERT, numa transação)', () => {
  const arquivo = (a = arquivoMinimo()) => ({ arquivo: a, sha256: 'b'.repeat(64) });
  const vazio = (): EstadoBanco => ({ banco: { subgrupos: [], termos: [], regras: [] }, tipos: TIPOS, ultima: null, versaoExistente: null, referencias: [] });
  it('primeira carga: registra a versão de critério (domínio businessmap, referência com a versão e o hash) e insere com o id dela', async () => {
    const inserts: Chamada[] = [];
    const db = criarDublePg(bancoComoResposta(vazio(), inserts));
    const r = await sincronizarDicionario(db.pool, S, arquivo(), '2026-11-02', new Date('2026-11-02T12:00:00Z'));
    expect(r).toEqual({ sha256: 'b'.repeat(64), versao: 'v1', subgrupos: 2, termos: 2, regras: 1, versaoRegistrada: true });
    const versao = inserts.find((c) => c.texto.includes('ref_versao_criterio'))!;
    expect(versao.valores[0]).toBe('2026-11-02');
    expect(versao.valores[3]).toBe(`059:ref-apontamento:v1:${'b'.repeat(64)}`);
    const linhas = inserts.filter((c) => c.texto.includes('dspd_bm.ref_apontamento_'));
    expect(linhas).toHaveLength(5);
    for (const l of linhas) expect(l.valores.at(-1)).toBe('77');
    const textos = db.chamadas.map((c) => c.texto);
    expect(textos[0]).toBe('BEGIN');
    expect(textos.at(-1)).toBe('COMMIT');
    expect(db.estado.liberados).toBe(1);
    expect(textos.join('\n')).not.toMatch(/DELETE|UPDATE|DO UPDATE|TRUNCATE/i);
  });
  it('idempotente: com o dicionário já carregado nada é gravado nem versão registrada', async () => {
    const e = vazio();
    e.banco = bancoDe();
    const inserts: Chamada[] = [];
    const db = criarDublePg(bancoComoResposta(e, inserts));
    expect(await sincronizarDicionario(db.pool, S, arquivo(), '2026-11-02', new Date())).toMatchObject({ subgrupos: 0, termos: 0, regras: 0, versaoRegistrada: false });
    expect(inserts).toEqual([]);
  });
  it('carga aditiva reaproveita a versão já registrada para o mesmo hash', async () => {
    const e = vazio();
    e.versaoExistente = '55';
    const inserts: Chamada[] = [];
    const db = criarDublePg(bancoComoResposta(e, inserts));
    const r = await sincronizarDicionario(db.pool, S, arquivo(), '2026-11-02', new Date());
    expect(r.versaoRegistrada).toBe(false);
    expect(inserts.every((c) => !c.texto.includes('ref_versao_criterio') && c.valores.at(-1) === '55')).toBe(true);
  });
  it('data anterior à última versão do dicionário: recusa e desfaz tudo; a mesma data ou posterior passa', async () => {
    const e = vazio();
    e.ultima = '2026-11-05';
    const inserts: Chamada[] = [];
    const db = criarDublePg(bancoComoResposta(e, inserts));
    await expect(sincronizarDicionario(db.pool, S, arquivo(), '2026-11-04', new Date())).rejects.toMatchObject({ tipo: 'vigencia' });
    expect(inserts).toEqual([]);
    expect(db.chamadas.at(-1)!.texto).toBe('ROLLBACK');
    await expect(sincronizarDicionario(criarDublePg(bancoComoResposta(e)).pool, S, arquivo(), '2026-11-05', new Date())).resolves.toMatchObject({ versaoRegistrada: true });
  });
  it('recusa do plano (tipo inexistente, mudança) desfaz a transação sem inserir nada', async () => {
    const e = vazio();
    e.tipos = [];
    const inserts: Chamada[] = [];
    const db = criarDublePg(bancoComoResposta(e, inserts));
    await expect(sincronizarDicionario(db.pool, S, arquivo(), '2026-11-02', new Date())).rejects.toMatchObject({ tipo: 'tipo' });
    expect(inserts).toEqual([]);
    expect(db.chamadas.map((c) => c.texto)).toContain('ROLLBACK');
  });
});

describe('carregarDicionario (leitura pelo coletor)', () => {
  it('monta a forma da biblioteca: prioridade do subgrupo nos termos e nas regras, condição de volta com hífen, versão do arquivo da última carga', async () => {
    const e = planejarComoBanco(arquivoMinimo({ regrasPorTipo: [{ tipoRotulo: 'Kaizen', condicao: 'sem-comentario', subgrupo: 'a' }] }));
    const db = criarDublePg(bancoComoResposta(e));
    expect(await carregarDicionario(db.pool, S)).toEqual({
      versao: 'v1',
      termos: [{ prioridade: 2, subgrupo: 'b', termos: ['teste', 'homolog'] }],
      regrasPorTipo: [{ prioridade: 1, subgrupo: 'a', typeId: '11', condicao: 'sem-comentario' }],
    });
  });
  it('sem carga (sem versão, referência malformada ou sem subgrupo): a coleta não roda, com a instrução de rodar o ref:sync', async () => {
    const semVersao = planejarComoBanco(arquivoMinimo());
    semVersao.referencias = [];
    const malformada = planejarComoBanco(arquivoMinimo());
    malformada.referencias = ['059:ref-apontamento:v1:curto'];
    const semSubgrupo = planejarComoBanco(arquivoMinimo());
    semSubgrupo.banco.subgrupos = [];
    for (const e of [semVersao, malformada, semSubgrupo]) {
      const erro = await carregarDicionario(criarDublePg(bancoComoResposta(e)).pool, S).catch((x: unknown) => x);
      expect(erro).toBeInstanceOf(ErroColetaBm);
      expect(erro).toMatchObject({ codigo: 'dicionario' });
      expect((erro as Error).message).toMatch(/bm:ref-sync-apontamento/);
    }
  });
});
