import { classificarApontamento } from '@metricas-dspd/metricas/coletor';
import { describe, expect, it } from 'vitest';
import {
  analisarDicionario, carregarDicionario, ErroDicionario, lerDicionario, planejarDicionario, sincronizarDicionario,
  type ArquivoDicionario, type DicionarioBanco, type TipoDoCard,
} from '../src/modulos/businessmap/apontamento/dicionario.js';
import { ErroColetaBm } from '../src/modulos/businessmap/coleta.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// Pedido 059, E2.19: carga do dicionário de subgrupo por ref:sync (com vigência: abre, fecha e nunca apaga) e leitura pelo coletor. Sem banco: o SQL real vai ao .pg.
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

describe('planejarDicionario: carga com vigência (E2.27)', () => {
  const vazio: DicionarioBanco = { subgrupos: [], termos: [], regras: [] };
  const semMudanca = { abrir: [], fechar: [] };
  const termo = (subgrupo_codigo: string, termo_normalizado: string) => ({ subgrupo_codigo, termo_normalizado });
  it('primeira carga: tudo abre, o rótulo do tipo vira type_id sem acento nem caixa e sem-comentario vira sem_comentario', () => {
    const arq = arquivoMinimo({ regrasPorTipo: [{ tipoRotulo: 'INCIDENTE DE PRODUCAO', condicao: 'sem-comentario', subgrupo: 'a' }] });
    expect(planejarDicionario(arq, vazio, TIPOS)).toEqual({
      subgrupos: { abrir: [{ codigo: 'a', rotulo: 'A', prioridade: 1 }, { codigo: 'b', rotulo: 'B', prioridade: 2 }], fechar: [] },
      termos: { abrir: [termo('b', 'teste'), termo('b', 'homolog')], fechar: [] },
      regras: { abrir: [{ type_id: '22', condicao: 'sem_comentario', subgrupo_codigo: 'a' }], fechar: [] },
    });
  });
  it('idempotente: com o vigente igual ao arquivo o plano é vazio (e a ordem dos termos não importa)', () => {
    const banco = bancoDe();
    banco.termos.reverse();
    expect(planejarDicionario(arquivoMinimo(), banco, TIPOS)).toEqual({ subgrupos: semMudanca, termos: semMudanca, regras: semMudanca });
  });
  it('termo novo entra: subgrupo, termo e regra novos abrem; o que já está vigente não é tocado', () => {
    const arq = arquivoMinimo({
      subgrupos: [...arquivoMinimo().subgrupos, { codigo: 'c', rotulo: 'C', prioridade: 3 }],
      termos: [{ subgrupo: 'b', termos: ['teste', 'homolog', 'novo'] }, { subgrupo: 'c', termos: ['ccc'] }],
      regrasPorTipo: [...arquivoMinimo().regrasPorTipo, { tipoRotulo: 'Story', condicao: 'sem-comentario', subgrupo: 'c' }],
    });
    expect(planejarDicionario(arq, bancoDe(), TIPOS)).toEqual({
      subgrupos: { abrir: [{ codigo: 'c', rotulo: 'C', prioridade: 3 }], fechar: [] },
      termos: { abrir: [termo('b', 'novo'), termo('c', 'ccc')], fechar: [] },
      regras: { abrir: [{ type_id: '33', condicao: 'sem_comentario', subgrupo_codigo: 'c' }], fechar: [] },
    });
  });
  it('termo retirado só fecha, sem abrir nada; termo que trocou de subgrupo fecha a linha antiga e abre a nova', () => {
    const retirado = planejarDicionario(arquivoMinimo({ termos: [{ subgrupo: 'b', termos: ['teste'] }] }), bancoDe(), TIPOS);
    expect(retirado.termos).toEqual({ abrir: [], fechar: [termo('b', 'homolog')] });
    expect(retirado.subgrupos).toEqual(semMudanca);
    const trocou = planejarDicionario(arquivoMinimo({ termos: [{ subgrupo: 'a', termos: ['homolog'] }, { subgrupo: 'b', termos: ['teste'] }] }), bancoDe(), TIPOS);
    expect(trocou.termos).toEqual({ abrir: [termo('a', 'homolog')], fechar: [termo('b', 'homolog')] });
  });
  it('termo mudado: o que o arquivo traz no lugar fecha o antigo e abre o novo (o termo é a própria chave, então "mudar" é retirar e trazer outro)', () => {
    const p = planejarDicionario(arquivoMinimo({ termos: [{ subgrupo: 'b', termos: ['teste', 'validac'] }] }), bancoDe(), TIPOS);
    expect(p.termos).toEqual({ abrir: [termo('b', 'validac')], fechar: [termo('b', 'homolog')] });
  });
  it('subgrupo com rótulo ou prioridade mudados fecha e abre o mesmo código, sem mexer nos termos; troca de prioridades entre dois subgrupos também', () => {
    const rotulo = planejarDicionario(arquivoMinimo({ subgrupos: [{ codigo: 'a', rotulo: 'A novo', prioridade: 1 }, { codigo: 'b', rotulo: 'B', prioridade: 2 }] }), bancoDe(), TIPOS);
    expect(rotulo.subgrupos).toEqual({ abrir: [{ codigo: 'a', rotulo: 'A novo', prioridade: 1 }], fechar: [{ codigo: 'a', rotulo: 'A', prioridade: 1 }] });
    expect(rotulo.termos).toEqual(semMudanca);
    const troca = planejarDicionario(arquivoMinimo({ subgrupos: [{ codigo: 'a', rotulo: 'A', prioridade: 2 }, { codigo: 'b', rotulo: 'B', prioridade: 1 }] }), bancoDe(), TIPOS);
    expect(troca.subgrupos.fechar.map((x) => x.codigo)).toEqual(['a', 'b']);
    expect(troca.subgrupos.abrir).toEqual([{ codigo: 'a', rotulo: 'A', prioridade: 2 }, { codigo: 'b', rotulo: 'B', prioridade: 1 }]);
  });
  it('subgrupo retirado fecha, junto com os termos e as regras que o arquivo deixou de trazer', () => {
    const arq = arquivoMinimo({ subgrupos: [{ codigo: 'a', rotulo: 'A', prioridade: 1 }], termos: [], regrasPorTipo: [{ tipoRotulo: 'Kaizen', condicao: 'sempre', subgrupo: 'a' }] });
    const p = planejarDicionario(arq, bancoDe(), TIPOS);
    expect(p.subgrupos).toEqual({ abrir: [], fechar: [{ codigo: 'b', rotulo: 'B', prioridade: 2 }] });
    expect(p.termos).toEqual({ abrir: [], fechar: [termo('b', 'teste'), termo('b', 'homolog')] });
    expect(p.regras).toEqual(semMudanca);
  });
  it('regra retirada só fecha; regra que mudou de subgrupo fecha e abre', () => {
    expect(planejarDicionario(arquivoMinimo({ regrasPorTipo: [] }), bancoDe(), TIPOS).regras).toEqual({ abrir: [], fechar: [{ type_id: '11', condicao: 'sempre', subgrupo_codigo: 'a' }] });
    const mudou = planejarDicionario(arquivoMinimo({ regrasPorTipo: [{ tipoRotulo: 'Kaizen', condicao: 'sempre', subgrupo: 'b' }] }), bancoDe(), TIPOS);
    expect(mudou.regras).toEqual({ abrir: [{ type_id: '11', condicao: 'sempre', subgrupo_codigo: 'b' }], fechar: [{ type_id: '11', condicao: 'sempre', subgrupo_codigo: 'a' }] });
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
    expect(planejarDicionario(arquivoMinimo(), vazio, [...TIPOS, { tipo_id: '11', nome: 'Kaizen' }]).regras.abrir).toHaveLength(1);
  });
  it('recusa só o que deixaria a classificação sem saída: tirar execucao-tecnica ou nao-classificado do arquivo', () => {
    for (const reservado of ['execucao-tecnica', 'nao-classificado']) {
      const banco = bancoDe();
      banco.subgrupos.push({ codigo: reservado, rotulo: 'R', prioridade: 9 });
      const e = recusa(() => planejarDicionario(arquivoMinimo(), banco, TIPOS));
      expect(e, reservado).toMatchObject({ tipo: 'mudanca' });
      expect(e.message, reservado).toContain(reservado);
      // mudar o rótulo dele continua permitido (fecha e abre o mesmo código)
      const arq = arquivoMinimo({ subgrupos: [...arquivoMinimo().subgrupos, { codigo: reservado, rotulo: 'R novo', prioridade: 9 }] });
      expect(planejarDicionario(arq, banco, TIPOS).subgrupos.abrir).toEqual([{ codigo: reservado, rotulo: 'R novo', prioridade: 9 }]);
    }
  });
});

/** Banco falso do `sincronizarDicionario` e do `carregarDicionario`: responde pelas tabelas e guarda os INSERT. */
interface EstadoBanco { banco: DicionarioBanco; tipos: TipoDoCard[]; ultima: string | null; referencias: string[] }
function planejarComoBanco(arq: ArquivoDicionario): EstadoBanco {
  const regras = arq.regrasPorTipo.map((r) => ({ type_id: r.tipoRotulo === 'Kaizen' ? '11' : '22', condicao: r.condicao === 'sempre' ? 'sempre' : 'sem_comentario', subgrupo_codigo: r.subgrupo }));
  return {
    banco: { subgrupos: arq.subgrupos.map((s) => ({ ...s })), termos: arq.termos.flatMap((t) => t.termos.map((termo) => ({ subgrupo_codigo: t.subgrupo, termo_normalizado: termo }))), regras },
    tipos: TIPOS, ultima: null, referencias: [`059:ref-apontamento:${arq.versao}:${'a'.repeat(64)}`],
  };
}
const bancoComoResposta = (e: EstadoBanco, inserts: Chamada[] = []) => (c: Chamada): Resposta => {
  const t = c.texto;
  if ((t.startsWith('INSERT INTO') && !t.includes('RETURNING')) || t.startsWith('UPDATE ')) { inserts.push(c); return []; }
  if (t.includes('FROM dspd_bm.ref_apontamento_subgrupo')) return e.banco.subgrupos;
  if (t.includes('FROM dspd_bm.ref_apontamento_termo')) return e.banco.termos;
  if (t.includes('FROM dspd_bm.ref_apontamento_regra_tipo')) return e.banco.regras;
  if (t.includes('FROM dspd_bm.ref_tipo_card')) return e.tipos;
  if (t.includes('max(vigente_desde)')) return [{ ultima: e.ultima }];
  if (t.includes('INSERT INTO dspd_core.ref_versao_criterio')) { inserts.push(c); return [{ versao_id: '77' }]; }
  if (t.includes('SELECT referencia')) return e.referencias.map((referencia) => ({ referencia }));
  return [];
};

describe('sincronizarDicionario (dspd_ref: INSERT e UPDATE de vigente_ate, numa transação)', () => {
  const arquivo = (a = arquivoMinimo()) => ({ arquivo: a, sha256: 'b'.repeat(64) });
  const vazio = (): EstadoBanco => ({ banco: { subgrupos: [], termos: [], regras: [] }, tipos: TIPOS, ultima: null, referencias: [] });
  const zero = { subgrupos: 0, termos: 0, regras: 0 };
  it('primeira carga: registra a versão de critério (domínio businessmap, referência com a versão e o hash) e abre as linhas com o id dela e a data', async () => {
    const inserts: Chamada[] = [];
    const db = criarDublePg(bancoComoResposta(vazio(), inserts));
    const r = await sincronizarDicionario(db.pool, S, arquivo(), '2026-11-02', new Date('2026-11-02T12:00:00Z'));
    expect(r).toEqual({ sha256: 'b'.repeat(64), versao: 'v1', subgrupos: 2, termos: 2, regras: 1, fechados: zero, versaoRegistrada: true });
    const versao = inserts.find((c) => c.texto.includes('ref_versao_criterio'))!;
    expect(versao.valores[0]).toBe('2026-11-02');
    expect(versao.valores[3]).toBe(`059:ref-apontamento:v1:${'b'.repeat(64)}`);
    const linhas = inserts.filter((c) => c.texto.includes('dspd_bm.ref_apontamento_'));
    expect(linhas).toHaveLength(5);
    for (const l of linhas) {
      expect(l.valores.at(-2)).toBe('77');
      expect(l.valores.at(-1)).toBe('2026-11-02');
      expect(l.texto).toContain('vigente_de');
    }
    const textos = db.chamadas.map((c) => c.texto);
    expect(textos[0]).toBe('BEGIN');
    expect(textos.at(-1)).toBe('COMMIT');
    expect(db.estado.liberados).toBe(1);
    expect(textos.join('\n')).not.toMatch(/DELETE|DO UPDATE|TRUNCATE/i);
  });
  it('lê só o vigente: todo SELECT do dicionário filtra vigente_ate IS NULL', async () => {
    const db = criarDublePg(bancoComoResposta(vazio()));
    await sincronizarDicionario(db.pool, S, arquivo(), '2026-11-02', new Date());
    const leituras = db.chamadas.map((c) => c.texto).filter((t) => t.startsWith('SELECT') && t.includes('dspd_bm.ref_apontamento_'));
    expect(leituras).toHaveLength(3);
    for (const t of leituras) expect(t).toContain('vigente_ate IS NULL');
  });
  it('idempotente: com o dicionário vigente igual ao arquivo nada é gravado nem versão registrada', async () => {
    const e = vazio();
    e.banco = bancoDe();
    const inserts: Chamada[] = [];
    const db = criarDublePg(bancoComoResposta(e, inserts));
    expect(await sincronizarDicionario(db.pool, S, arquivo(), '2026-11-02', new Date())).toMatchObject({ subgrupos: 0, termos: 0, regras: 0, fechados: zero, versaoRegistrada: false });
    expect(inserts).toEqual([]);
  });
  it('termo retirado só fecha (UPDATE de vigente_ate com a data da carga), registra versão nova e não insere nem apaga', async () => {
    const e = vazio();
    e.banco = bancoDe();
    const inserts: Chamada[] = [];
    const db = criarDublePg(bancoComoResposta(e, inserts));
    const r = await sincronizarDicionario(db.pool, S, arquivo(arquivoMinimo({ termos: [{ subgrupo: 'b', termos: ['teste'] }] })), '2026-11-05', new Date());
    expect(r).toMatchObject({ subgrupos: 0, termos: 0, regras: 0, fechados: { subgrupos: 0, termos: 1, regras: 0 }, versaoRegistrada: true });
    const alteracoes = inserts.filter((c) => c.texto.includes('dspd_bm.ref_apontamento_'));
    expect(alteracoes).toHaveLength(1);
    expect(alteracoes[0]!.texto).toMatch(/^UPDATE dspd_bm\.ref_apontamento_termo SET vigente_ate = \$1 WHERE vigente_ate IS NULL/);
    expect(alteracoes[0]!.valores).toEqual(['2026-11-05', 'homolog', 'b']);
    expect(db.chamadas.map((c) => c.texto).join('\n')).not.toMatch(/DELETE|TRUNCATE/i);
  });
  it('subgrupo mudado: fecha antes de abrir (o índice único da prioridade vigente exige) e abre com a versão nova', async () => {
    const e = vazio();
    e.banco = bancoDe();
    const inserts: Chamada[] = [];
    const db = criarDublePg(bancoComoResposta(e, inserts));
    const troca = arquivoMinimo({ subgrupos: [{ codigo: 'a', rotulo: 'A', prioridade: 2 }, { codigo: 'b', rotulo: 'B', prioridade: 1 }] });
    const r = await sincronizarDicionario(db.pool, S, arquivo(troca), '2026-11-05', new Date());
    expect(r).toMatchObject({ subgrupos: 2, fechados: { subgrupos: 2, termos: 0, regras: 0 } });
    const ordem = inserts.filter((c) => c.texto.includes('ref_apontamento_subgrupo')).map((c) => c.texto.split(' ')[0]);
    expect(ordem).toEqual(['UPDATE', 'UPDATE', 'INSERT', 'INSERT']);
  });
  it('toda carga que muda algo registra uma versão nova, mesmo com o mesmo hash de uma anterior (cada mudança tem a sua data)', async () => {
    const inserts: Chamada[] = [];
    for (const dia of ['2026-11-02', '2026-11-03']) {
      const db = criarDublePg(bancoComoResposta(vazio(), inserts));
      expect(await sincronizarDicionario(db.pool, S, arquivo(), dia, new Date())).toMatchObject({ versaoRegistrada: true });
    }
    expect(inserts.filter((c) => c.texto.includes('ref_versao_criterio')).map((c) => c.valores[0])).toEqual(['2026-11-02', '2026-11-03']);
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
  it('recusa do plano (tipo inexistente, subgrupo reservado) desfaz a transação sem gravar nada', async () => {
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
