import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { coletarAcelerato, projetarAcelerato } from '../src/modulos/acelerato/index.js';
import { campoDominioEtapa } from '../src/modulos/acelerato/listas-fechadas.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { semear } from '../src/plataforma/db/seed.js';
import { CONFIG, LISTAS_BANCO, TLS, criarMysqlFalso, linha } from './acelerato-duble.js';
import { novaColeta, poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const F3 = ['motivo_escalacao', 'motivo_encerramento', 'avaliacao_problema', 'motivo_pendencia', 'prioridade_ajustada'] as const;

/** L9-c do 069 (K-220): migração de previsao_retorno para booleano, projeção das colunas da F3 e paridade das cinco métricas reais. */
d('L9-c (pg): previsao_retorno booleano e projeção da F3', () => {
  const P = prefixoDeTeste(), E = montarEsquemas(P);
  let dono: pg.Pool, coletor: pg.Pool;
  const tipoDe = async (t: string): Promise<string> => (await dono.query<{ t: string }>(
    `SELECT format_type(a.atttypid, a.atttypmod) AS t FROM pg_attribute a WHERE a.attrelid = '${E.ac}.${t}'::regclass AND a.attname = 'previsao_retorno'`)).rows[0]!.t;
  const linhas = async (): Promise<string> => JSON.stringify((await dono.query(`SELECT * FROM ${E.ac}.dim_chamado ORDER BY chamado_id`)).rows);
  const insere = async (id: string, previsao: string): Promise<void> => {
    await dono.query(`INSERT INTO ${E.ac}.dim_chamado (chamado_id, motivo_escalacao, previsao_retorno, coletado_em, atualizado_por_coleta_id)
      VALUES ($1, 'X', ${previsao}, now(), $2)`, [id, await novaColeta(dono, E.ac)]);
  };

  let relogio = new Date('2026-11-05T10:00:00Z');
  const coletar = (t: ReturnType<typeof linha>[], reconhecerMudanca = false) => coletarAcelerato({
    pool: coletor, config: CONFIG, tls: TLS, S: E, agora: () => relogio, log: { info: () => undefined, error: () => undefined },
      cliente: { conectar: criarMysqlFalso(t).conectar }, dormir: () => Promise.resolve(), reconhecerMudanca,
    }, 'releitura');
    const etapa = (campos: { nome: string; tipo: string; valor: string; kanbanStatusKey?: number }[]) =>
      linha({ ticket_key: 91, campos_personalizados_etapa: JSON.stringify(campos.map((c) => ({ kanbanStatusKey: 10, ...c, obrigatorio: false }))) });

  beforeAll(async () => {
    await migrar(url!, { prefixo: P });
    dono = poolDe();
    coletor = criarPool(urlDoPapel(url!, 'dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev'), { max: 2 });
  }, 120_000);
  afterAll(async () => {
    await coletor.end();
    for (const e of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await dono.end();
  });

  it('migração: linhas nulas seguem nulas, só o tipo muda nas duas dimensões, as views seguem lidas pela API; com valor, falha sem mudar nada', async () => {
    await migrar(url!, { prefixo: P, direcao: 'down', quantas: 1 });
    expect(await tipoDe('dim_chamado')).toMatch(/timestamp\(3\) with time zone/);
    await insere('n1', 'NULL'); await insere('n2', 'NULL');
    const antes = await linhas();
    await migrar(url!, { prefixo: P });
    expect(await tipoDe('dim_chamado')).toBe('boolean');
    expect(await tipoDe('dim_chamado_versao')).toBe('boolean');
    expect(await linhas()).toBe(antes); // nenhuma linha muda, previsao_retorno segue nula
    expect((await dono.query(`SELECT count(*)::int AS n FROM ${E.ac}.dim_chamado WHERE previsao_retorno IS NOT NULL`)).rows[0].n).toBe(0);
    const api = poolDe('dspd_api');
    for (const v of ['vw_abertos', 'vw_fechados_sla', 'vw_populacao_sssc']) await expect(api.query(`SELECT previsao_retorno FROM ${E.ac}.${v} LIMIT 1`), v).resolves.toBeDefined();
    await api.end();

    await migrar(url!, { prefixo: P, direcao: 'down', quantas: 1 });
    await insere('v1', 'now()');
    const comValor = await linhas();
    await expect(migrar(url!, { prefixo: P })).rejects.toThrow(/previsao_retorno tem valor/);
    expect(await tipoDe('dim_chamado')).toMatch(/timestamp\(3\) with time zone/);
    expect(await linhas()).toBe(comValor);
    await dono.query(`DELETE FROM ${E.ac}.dim_chamado WHERE chamado_id = 'v1'`);
    await migrar(url!, { prefixo: P });
    await insere('b1', 'true'); // booleano gravado: a volta recusa sem mudar nada
    await expect(migrar(url!, { prefixo: P, direcao: 'down', quantas: 1 })).rejects.toThrow(/volta para timestamptz foi recusada/);
    expect(await tipoDe('dim_chamado')).toBe('boolean');
    await dono.query(`DELETE FROM ${E.ac}.dim_chamado`);
  }, 120_000);

  it('projetor: versão nova do staging projeta as colunas da F3; vazio depois de valor não apaga; versão antiga e histórico ficam', async () => {
    const listas = [...LISTAS_BANCO, { campo: 'natureza_prefixo', codigo: 'SSSC - Incidente', rotulo: 'incidente' },
      ...F3.flatMap((c) => ['Alfa', 'Beta', 'SIM'].map((v) => ({ campo: campoDominioEtapa(c), codigo: v, rotulo: v })))];
    for (const [i, l] of listas.entries())
      await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, '2026-01-01', $3, $4)`, [l.campo, l.codigo, l.rotulo, i]);
    // Desenho do fluxo (L9-c, decisão "B"): a etapa 20 vem depois da 10. A posição é o `ordem` da linha de `etapa_fluxo`.
    for (const [codigo, ordem] of [['10', 0], ['20', 1]] as const)
      await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ('etapa_fluxo', $1, '2026-01-01', $2, $3)`, [codigo, `Etapa ${codigo}`, ordem]);
    await coletar([linha({ ticket_key: 91, campos_personalizados_etapa: '[]' })]);
    await projetarAcelerato(coletor, E, () => relogio);
    const vazia = (await dono.query(`SELECT * FROM ${E.ac}.dim_chamado WHERE chamado_id = '91'`)).rows[0];
    expect(vazia).toMatchObject({ motivo_escalacao: null, previsao_retorno: false, justificativa_informada: false, prioridade_ajustada_manualmente: false });

    relogio = new Date('2026-11-05T11:00:00Z');
    await coletar([etapa([
      { nome: 'Motivo da Escalação', tipo: 'lista', valor: 'Alfa' }, { nome: 'Motivo da Escalação', tipo: 'lista', valor: '', kanbanStatusKey: 20 },
      // 'Beta' vem primeiro na lista e vence porque a etapa 20 vem por último no desenho do fluxo (a ordem das linhas não decide).
      { nome: 'Motivo de Encerramento', tipo: 'lista', valor: 'Beta', kanbanStatusKey: 20 }, { nome: 'Motivo de Encerramento', tipo: 'lista', valor: 'Alfa', kanbanStatusKey: 10 },
      { nome: 'Avaliação de Problema', tipo: 'lista', valor: 'Beta' }, { nome: 'Motivo de Pendência', tipo: 'lista', valor: 'Alfa' },
      { nome: 'Prioridade ajustada manualmente?', tipo: 'lista', valor: 'SIM' },
      { nome: 'Se a prioridade foi ajustada, justifique', tipo: 'texto', valor: 'TEXTO-LIVRE-L9C' }, { nome: 'Previsão de retorno', tipo: 'data', valor: '2026-12-01' },
    ])]);
    await projetarAcelerato(coletor, E, () => relogio);
    expect((await dono.query(`SELECT * FROM ${E.ac}.dim_chamado WHERE chamado_id = '91'`)).rows[0]).toMatchObject({
      motivo_escalacao: 'Alfa', motivo_encerramento: 'Beta', avaliacao_problema: 'Beta', motivo_pendencia_atual: 'Alfa',
      prioridade_ajustada_manualmente: true, justificativa_informada: true, previsao_retorno: true,
    });
    expect((await dono.query(`SELECT count(*)::int AS n FROM ${E.ac}.dim_chamado_versao WHERE chamado_id = '91'`)).rows[0].n).toBe(2);
    expect((await dono.query(`SELECT motivo_escalacao FROM ${E.ac}.dim_chamado_versao WHERE chamado_id = '91' ORDER BY vigente_de LIMIT 1`)).rows[0].motivo_escalacao).toBeNull();
    const tudo = JSON.stringify((await dono.query(`SELECT * FROM ${E.ac}.dim_chamado_versao`)).rows) + JSON.stringify((await dono.query(`SELECT * FROM ${E.ac}.dim_chamado`)).rows);
    expect(tudo).not.toContain('TEXTO-LIVRE-L9C');
    expect(tudo).not.toMatch(/kanban/i); // a chave da etapa só decide o valor; não é gravada na dimensão nem no staging projetado
    expect(JSON.stringify((await dono.query(`SELECT payload FROM ${E.ac}.stg_chamado WHERE id_origem = '91'`)).rows)).not.toMatch(/kanban/i);
  }, 60_000);

  it('versão nova de critério: a lista etapa_fluxo trocada muda o valor decidido do mesmo chamado, gera versão nova e a antiga fica intacta', async () => {
    const versoes = async (): Promise<{ motivo_encerramento: string | null; vigente_de: Date }[]> =>
      (await dono.query(`SELECT motivo_encerramento, vigente_de FROM ${E.ac}.dim_chamado_versao WHERE chamado_id = '91' ORDER BY vigente_de`)).rows;
    const antes = await versoes();
    const atual = (await dono.query(`SELECT motivo_encerramento FROM ${E.ac}.dim_chamado WHERE chamado_id = '91'`)).rows[0].motivo_encerramento;
    expect(atual).toBe('Beta'); // lista semeada no teste anterior: a etapa 20 vem depois da 10
    // Lista trocada (semeada aqui): a etapa 10 passa a vir por último. A linha antiga fecha a vigência, a nova abre; nada é apagado.
    await dono.query(`UPDATE ${E.ac}.ref_dominio SET vigente_ate = '2026-11-05' WHERE campo = 'etapa_fluxo' AND vigente_ate IS NULL`);
    for (const [codigo, ordem] of [['20', 0], ['10', 1]] as const)
      await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ('etapa_fluxo', $1, '2026-11-05', $2, $3)`, [codigo, `Etapa ${codigo}`, ordem]);
    // Opção C (E10): o reconhecimento exige a versão que o ac:ref-sync deixaria na data da vigência nova.
    await dono.query(`INSERT INTO ${E.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
      VALUES ('2026-11-05', 'acelerato', 'Teste L9-c', 'Lista etapa_fluxo trocada', '056:ref-dominio:teste-l9c:2026-11-05', '2026-11-05T12:00:00Z')`);
    relogio = new Date('2026-11-05T12:00:00Z');
    const mesmo = [{ nome: 'Motivo de Encerramento', tipo: 'lista', valor: 'Beta', kanbanStatusKey: 20 }, { nome: 'Motivo de Encerramento', tipo: 'lista', valor: 'Alfa', kanbanStatusKey: 10 }];
    await coletar([etapa(mesmo)], true); // a lista mudou: a coleta pede o reconhecimento da mudança de critério (CA-8)
    await projetarAcelerato(coletor, E, () => relogio);
    expect((await dono.query(`SELECT motivo_encerramento FROM ${E.ac}.dim_chamado WHERE chamado_id = '91'`)).rows[0].motivo_encerramento).toBe('Alfa');
    const depois = await versoes();
    expect(depois).toHaveLength(antes.length + 1);
    expect(depois.at(-1)).toMatchObject({ motivo_encerramento: 'Alfa' });
    expect(depois.slice(0, antes.length).map((v) => v.motivo_encerramento)).toEqual(antes.map((v) => v.motivo_encerramento)); // valores antigos intactos
    // SCD2 append-only sem coluna de fim (migração 0008): a anterior segue como está e a nova abre depois dela
    expect(depois.at(-1)!.vigente_de.getTime()).toBeGreaterThan(depois[antes.length - 1]!.vigente_de.getTime());
    expect(depois[antes.length - 1]!.motivo_encerramento).toBe('Beta');
  }, 60_000);

  it('paridade: S2, S3, S4, S8 e S10 reais não mudam quando as colunas da F3 mudam (constante de ajuste de prioridade falsa)', async () => {
    const base = gerarBaseMock({ escala: 0.05 });
    const PR = prefixoDeTeste();
    const R = montarEsquemas(PR);
    await migrar(url!, { prefixo: PR });
    await semear(dono, base, R);
    const api = poolDe('dspd_api');
    const ler = async (): Promise<string[]> => {
      const app = await buildApp({ db: api, S: R, agora: () => new Date('2026-10-10T15:00:00Z'), nivelLog: 'silent' });
      return Promise.all(['S2', 'S3', 'S4', 'S8', 'S10'].map(async (id) => (await app.inject(`/api/v1/metricas/${id}`)).body));
    };
    const antes = await ler();
    await dono.query(`UPDATE ${R.ac}.dim_chamado SET motivo_escalacao = 'Z', motivo_encerramento = 'Z', avaliacao_problema = 'Z', motivo_pendencia_atual = 'Z',
      previsao_retorno = NOT coalesce(previsao_retorno, false), prioridade_ajustada_manualmente = NOT prioridade_ajustada_manualmente`);
    expect(await ler()).toEqual(antes);
    await api.end();
    for (const s of [R.bm, R.ac, R.core]) await dono.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
  }, 180_000);
});
