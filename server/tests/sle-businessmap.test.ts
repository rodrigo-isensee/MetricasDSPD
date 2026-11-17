import { readFileSync } from 'node:fs';
import { CALENDARIO_PADRAO } from '@metricas-dspd/metricas';
import { criarContextoBM } from '@metricas-dspd/metricas/businessmap';
import { describe, expect, it } from 'vitest';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import type { PoolLike } from '../src/plataforma/db/pool.js';
import { configBM } from '../src/modulos/metricas/mapa.js';
import { calcularT2 } from '../../packages/metricas/src/businessmap/index.js';
import { diaDeIso, isoDeDia } from '../../packages/metricas/src/core/calendario.js';
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from '../../packages/metricas/src/businessmap/testing.js';
import { ARQUIVO_SLE_BM, ErroSle, analisarSleBm, lerSleBm, planejarSle, sincronizarSleBm } from '../src/modulos/referencia/index.js';

// K-214 (pedido 105, E7.485): carregador do `ref_sle` a partir do arquivo versionado, vazio até o dono aprovar. Sem banco: um dublê em memória da tabela.
const S = montarEsquemas('dspd');
const AGORA = new Date('2026-11-17T12:00:00Z');
const HOJE = '2026-11-17';

const texto = (prazos: unknown[], extra: Record<string, unknown> = {}): string => JSON.stringify({
  versao: 1, regra: 'teste', versao_criterio: { descricao: 'SLE de teste', motivo: 'Teste do carregador' }, prazos, ...extra,
});
const prazo = (prioridade: string, dias: number, aprovado: string): Record<string, unknown> => ({ prioridade, dias_uteis: dias, aprovado_em: aprovado });

interface Linha { classe: string; dias: number; de: string; ate: string | null }
/** Dublê de `ref_sle`, `ref_versao_criterio` e `ref_versao_criterio_metrica`: só as consultas que o carregador faz. */
function criarDuble(linhas: Linha[] = []): { pool: PoolLike; linhas: Linha[]; versoes: string[]; metricas: string[]; escritas: string[] } {
  const versoes: string[] = [];
  const metricas: string[] = [];
  const escritas: string[] = [];
  const query = (t: string, v: unknown[] = []): Promise<{ rows: unknown[]; rowCount: number }> => {
    const res = (rows: unknown[] = []) => Promise.resolve({ rows, rowCount: rows.length });
    if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(t)) return res();
    if (/^SELECT classe_servico AS classe, dias_uteis/.test(t)) return res(linhas.filter((l) => l.ate === null).map((l) => ({ classe: l.classe, dias: String(l.dias), de: l.de })));
    if (/^SELECT classe_servico AS classe, max/.test(t)) {
      return res([...new Set(linhas.map((l) => l.classe))].map((c) => ({ classe: c, ultima: linhas.filter((l) => l.classe === c).flatMap((l) => [l.de, l.ate ?? l.de]).sort().at(-1) })));
    }
    if (/^UPDATE .*ref_sle SET vigente_ate/.test(t)) {
      escritas.push('update');
      for (const l of linhas) if (l.ate === null && l.classe === v[2]) l.ate = v[0] as string;
      return res();
    }
    if (/^INSERT INTO .*ref_sle /.test(t)) {
      escritas.push('insert');
      linhas.push({ classe: v[1] as string, dias: v[4] as number, de: v[3] as string, ate: null });
      return res();
    }
    if (/^SELECT 1 FROM .*ref_versao_criterio /.test(t)) return res(versoes.includes(v[0] as string) ? [{ '?column?': 1 }] : []);
    if (/^INSERT INTO .*ref_versao_criterio \(/.test(t)) { versoes.push(v[3] as string); return res([{ versao_id: '1' }]); }
    if (/^INSERT INTO .*ref_versao_criterio_metrica/.test(t)) { metricas.push(v[1] as string); return res(); }
    throw new Error(`consulta inesperada: ${t.slice(0, 60)}`);
  };
  return { pool: { query, connect: () => Promise.resolve({ query, release: () => undefined }), end: () => Promise.resolve() } as unknown as PoolLike, linhas, versoes, metricas, escritas };
}

describe('arquivo versionado do SLE do BusinessMap', () => {
  it('o arquivo real traz os quatro prazos aprovados em 2026-11-17 e grava na base vazia (E7.497)', async () => {
    const lido = lerSleBm();
    expect(lido.arquivo.prazos).toEqual([
      { prioridade: 'Crítica', dias_uteis: 12.5, aprovado_em: '2026-11-17' },
      { prioridade: 'Alta', dias_uteis: 5.8, aprovado_em: '2026-11-17' },
      { prioridade: 'Média', dias_uteis: 11.2, aprovado_em: '2026-11-17' },
      { prioridade: 'Baixa', dias_uteis: 2.1, aprovado_em: '2026-11-17' },
    ]);
    expect(lido.sha256).toBe(analisarSleBm(readFileSync(ARQUIVO_SLE_BM, 'utf8')).sha256);
    const d = criarDuble();
    const r = await sincronizarSleBm(d.pool, S, lido, HOJE, AGORA);
    expect(r).toMatchObject({ prazos: 4, inseridas: 4, fechadas: 0, versaoRegistrada: true });
    const r2 = await sincronizarSleBm(d.pool, S, lido, HOJE, AGORA);
    expect(r2).toMatchObject({ inseridas: 0, fechadas: 0 });
  });

  it('arquivo vazio não fecha nem apaga prazo já gravado (o histórico fica)', async () => {
    const d = criarDuble([{ classe: 'Média', dias: 5, de: '2026-11-10', ate: null }]);
    const r = await sincronizarSleBm(d.pool, S, analisarSleBm(texto([])), HOJE, AGORA);
    expect(r.inseridas + r.fechadas).toBe(0);
    expect(d.linhas).toEqual([{ classe: 'Média', dias: 5, de: '2026-11-10', ate: null }]);
  });

  it.each([
    ['prioridade fora das quatro', [prazo('Urgente', 5, '2026-11-10')], 'prazos.#1.prioridade'],
    ['prazo zero', [prazo('Alta', 0, '2026-11-10')], 'prazos.#1.dias_uteis'],
    ['prazo negativo', [prazo('Alta', -2, '2026-11-10')], 'prazos.#1.dias_uteis'],
    ['prazo com duas casas', [prazo('Alta', 5.55, '2026-11-10')], 'prazos.#1.dias_uteis'],
    ['prazo em texto', [{ prioridade: 'Alta', dias_uteis: '5', aprovado_em: '2026-11-10' }], 'prazos.#1.dias_uteis'],
    ['data inexistente', [prazo('Alta', 5, '2026-02-30')], 'prazos.#1.aprovado_em'],
    ['data sem o formato', [prazo('Alta', 5, '10/11/2026')], 'prazos.#1.aprovado_em'],
    ['sem a data de aprovação', [{ prioridade: 'Alta', dias_uteis: 5 }], 'prazos.#1.aprovado_em'],
    ['campo a mais na linha', [{ ...prazo('Alta', 5, '2026-11-10'), nome: 'x' }], 'prazos.#1 (campo desconhecido)'],
    ['prioridade repetida', [prazo('Alta', 5, '2026-11-10'), prazo('Alta', 6, '2026-11-11')], 'prazos.#2.prioridade'],
  ])('%s: recusa o arquivo e o erro nomeia o campo', (_nome, prazos, campo) => {
    expect(() => analisarSleBm(texto(prazos))).toThrowError(new ErroSle('arquivo', `o arquivo de SLE do BusinessMap é inválido (campo: ${campo})`));
  });

  it('JSON inválido, versão errada e campo desconhecido na raiz recusam sem eco do conteúdo', () => {
    expect(() => analisarSleBm('{ nao e json')).toThrow('não é um JSON válido');
    expect(() => analisarSleBm(texto([], { versao: 2 }))).toThrow('(campo: versao)');
    expect(() => analisarSleBm(texto([], { segredo: 'abc' }))).toThrow('(campo: raiz (campo desconhecido))');
    expect(() => analisarSleBm(texto([], { segredo: 'abc' }))).not.toThrow('abc');
  });
});

describe('sincronizarSleBm', () => {
  it('linha válida grava a vigência na data da aprovação (equipe global, percentil 85) e registra a versão de critério do T2 e do O3', async () => {
    const d = criarDuble();
    const lido = analisarSleBm(texto([prazo('Média', 8, '2026-11-12'), prazo('Alta', 4.5, '2026-11-16')]));
    const r = await sincronizarSleBm(d.pool, S, lido, HOJE, AGORA);
    expect(r).toMatchObject({ prazos: 2, inseridas: 2, fechadas: 0, versaoRegistrada: true });
    expect(d.linhas).toEqual([{ classe: 'Média', dias: 8, de: '2026-11-12', ate: null }, { classe: 'Alta', dias: 4.5, de: '2026-11-16', ate: null }]);
    expect(d.versoes).toEqual([`105:sle-bm:${lido.sha256}`]);
    expect(d.metricas).toEqual(['T2', 'O3']);
  });

  it('é idempotente: repetir o mesmo arquivo não grava nem registra versão de novo', async () => {
    const d = criarDuble();
    const lido = analisarSleBm(texto([prazo('Média', 8, '2026-11-12')]));
    await sincronizarSleBm(d.pool, S, lido, HOJE, AGORA);
    const r = await sincronizarSleBm(d.pool, S, lido, HOJE, AGORA);
    expect(r).toMatchObject({ inseridas: 0, fechadas: 0, versaoRegistrada: false });
    expect(d.linhas).toHaveLength(1);
    expect(d.versoes).toHaveLength(1);
  });

  it('prazo novo com data posterior fecha o anterior e abre outro: o histórico não é sobrescrito', async () => {
    const d = criarDuble();
    await sincronizarSleBm(d.pool, S, analisarSleBm(texto([prazo('Média', 8, '2026-11-12')])), HOJE, AGORA);
    const r = await sincronizarSleBm(d.pool, S, analisarSleBm(texto([prazo('Média', 6, '2026-11-15')], { regra: 'outra' })), HOJE, AGORA);
    expect(r).toMatchObject({ inseridas: 1, fechadas: 1 });
    expect(d.linhas).toEqual([{ classe: 'Média', dias: 8, de: '2026-11-12', ate: '2026-11-15' }, { classe: 'Média', dias: 6, de: '2026-11-15', ate: null }]);
  });

  it.each([
    ['mesma data da vigência aberta', '2026-11-12'],
    ['data anterior à vigência aberta', '2026-11-01'],
  ])('prazo diferente com %s é recusado, nomeia a prioridade e não grava nada', async (_n, data) => {
    const d = criarDuble([{ classe: 'Média', dias: 8, de: '2026-11-12', ate: null }]);
    const lido = analisarSleBm(texto([prazo('Alta', 3, '2026-11-16'), prazo('Média', 6, data)]));
    await expect(sincronizarSleBm(d.pool, S, lido, HOJE, AGORA)).rejects.toThrow('sle Média: aprovado_em tem de ser posterior à última vigência registrada (2026-11-12)');
    expect(d.escritas).toEqual([]);
    expect(d.versoes).toEqual([]);
  });

  it('arquivo acima do tamanho máximo é recusado antes do JSON', () => {
    expect(() => analisarSleBm(texto([], { regra: 'x'.repeat(70_000) }))).toThrow('passa do tamanho máximo');
  });

  it('versão de critério do mesmo hash já registrada não é duplicada, mesmo com prazo novo a gravar', async () => {
    const d = criarDuble();
    const lido = analisarSleBm(texto([prazo('Baixa', 12, '2026-11-14')]));
    d.versoes.push(`105:sle-bm:${lido.sha256}`);
    const r = await sincronizarSleBm(d.pool, S, lido, HOJE, AGORA);
    expect(r).toMatchObject({ inseridas: 1, versaoRegistrada: false });
    expect(d.versoes).toHaveLength(1);
    expect(d.metricas).toEqual([]);
  });

  it('data de aprovação no futuro é recusada', () => {
    expect(() => planejarSle(analisarSleBm(texto([prazo('Baixa', 9, '2026-11-18')])).arquivo, [], new Map(), HOJE)).toThrow('sle Baixa: aprovado_em é posterior a hoje');
  });
});

describe('o prazo aprovado chega ao T2', () => {
  const F = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } } as never;
  const D0 = diaDeIso('2026-08-03');
  const util = (k: number): string => isoDeDia(D0 + k + 2 * Math.floor(k / 5));
  const em = (k: number, hora: string): string => `${util(k)}T${hora}-03:00`;
  // 20 stories da prioridade Média entregues na janela: o mínimo para o T2 publicar.
  const media = Array.from({ length: 20 }, (_, i): EspecCard => ({
    id: `M${i}`, prioridade: 'Média', criado: em(i % 8, '08:00'),
    trilha: trilhaSimples(em(i % 8, '08:00'), em(i % 8, '09:00'), em(i % 8, '10:00'), em((i % 8) + 2, '16:00')),
  }));
  const classeMedia = (sle: { classe: string; valor: string; desde: string }[]) => {
    const b = umaBase(media);
    const config = configBM({ equipes: [], sistemas: [], limitesWip: [], limiteFrentes: null, sle, alocacao: [], objetivos: [], areasInternas: [], fichas: [], criterios: [] });
    const r = calcularT2(criarContextoBM({ ...b, config: { ...b.config, sle: config.sle } }, HOJE_TESTE, CALENDARIO_PADRAO), F);
    return r.classes.find((c) => c.classe === 'Média')!;
  };

  it('arquivo vazio: sem linha gravada o T2 segue sem referencia ("nao definido")', () => {
    const c = classeMedia([]);
    expect(c.n).toBe(20);
    expect(c.sle).toBeNull();
    expect(c.statusMeta).toBe('sem-referencia');
  });

  it('linha válida gravada pelo carregador: o T2 mostra o prazo da prioridade e a data da aprovação', async () => {
    const d = criarDuble();
    await sincronizarSleBm(d.pool, S, analisarSleBm(texto([prazo('Média', 8, '2026-11-12')])), HOJE, AGORA);
    const c = classeMedia(d.linhas.map((l) => ({ classe: l.classe, valor: String(l.dias), desde: l.de })));
    expect(c.sle).toEqual({ diasUteis: 8, publicadoEm: '2026-11-12' });
    expect(c.statusMeta).not.toBe('sem-referencia');
  });
});
