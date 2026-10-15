import { MINIMO_AMOSTRA, METRICA_IDS, type MetricaId } from '@metricas-dspd/contratos';
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao';
import { slug } from '@metricas-dspd/metricas';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { resultadoO2PaginadoSchema } from '../src/modulos/metricas/schemas.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg } from './duble-pg.js';

/**
 * QA do back do pedido 011, fase 1 (docs/qa/011-back.md): A-2, A-5, A-6, A-11 e A-12 do plano. O que as suítes
 * `api.sistemico-intensivo` e `metricas.paridade` já varrem nas 60 ids (A-1, A-3, A-4, A-7, A-9) não se repete aqui.
 * O T11 fica de fora: não existe no back até o B11b (quando entrar, o caso A-2 não pode listá-lo).
 */
const AGORA = new Date('2026-10-10T15:00:00Z');
const base = gerarBaseMock({ escala: 0.25 });
const FASE1 = ['O2', 'O19', 'O20', 'O21', 'O24', 'O25', 'T10', 'T12', 'E7', 'E9'] as const satisfies readonly MetricaId[];
const url = (id: string, q = ''): string => `/api/v1/metricas/${id}${q ? `?${q}` : ''}`;
const schemaDe = (id: MetricaId) => (id === 'O2' ? resultadoO2PaginadoSchema : SCHEMAS_RESULTADO[id]);
let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp({ db: criarDublePg(bancoDoMock(base)).pool, agora: () => AGORA, nivelLog: 'silent' });
}, 60_000);

/** Objetos com percentil numérico e n abaixo do mínimo, ou `insuficiente` com percentil. */
function violacoes(x: unknown, caminho = '$', out: string[] = []): string[] {
  if (Array.isArray(x)) x.forEach((v, i) => violacoes(v, `${caminho}[${i}]`, out));
  else if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>;
    const pct = ['p50', 'p85', 'p95'].some((k) => typeof o[k] === 'number');
    if (pct && typeof o.n === 'number' && o.n < MINIMO_AMOSTRA) out.push(`${caminho} n=${o.n}`);
    if (pct && o.status === 'insuficiente') out.push(`${caminho} insuficiente com percentil`);
    for (const [k, v] of Object.entries(o)) violacoes(v, `${caminho}.${k}`, out);
  }
  return out;
}

describe('A-2: ids das fases 2 e 3 não têm rota (nenhum dado inventado)', () => {
  it.each(['O22', 'O26', 'T13', 'T14', 'E6', 'E8'])('%s: 404 METRICA_NAO_ENCONTRADA', async (id) => {
    expect((METRICA_IDS as readonly string[]).includes(id), `${id} não pode estar no catálogo`).toBe(false);
    const r = await app.inject(url(id));
    expect(r.statusCode).toBe(404);
    expect(r.json().error.code).toBe('METRICA_NAO_ENCONTRADA');
  });
});

describe('A-5 / A-6: recorte pequeno e recorte vazio nas 10 ids da fase 1', () => {
  const equipes = base.bm.config.equipes.map((e) => slug(e.nome));
  const periodos = ['', 'periodo=4s', 'periodo=12m', 'periodo=custom&de=2025-04-09&ate=2025-04-20'];
  it.each(FASE1)('%s: toda equipe e todo período dão 200 no schema, sem percentil abaixo de 20', async (id) => {
    expect(equipes.length).toBeGreaterThanOrEqual(2);
    let vistas = 0;
    for (const eq of ['', ...equipes.map((e) => `equipe=${e}`)]) {
      for (const p of periodos) {
        const q = [eq, p].filter(Boolean).join('&');
        const r = await app.inject(url(id, q));
        expect(r.statusCode, `${id}?${q} ${r.body.slice(0, 160)}`).toBe(200);
        expect(schemaDe(id).safeParse(r.json()).success, `${id}?${q} fora do schema`).toBe(true);
        expect(violacoes(r.json()), `${id}?${q}`).toEqual([]);
        vistas++;
      }
    }
    expect(vistas).toBe((equipes.length + 1) * periodos.length);
  }, 120_000);

  it('período futuro não inventa dado: 422 PERIODO_FORA_DO_HISTORICO nas 10 ids', async () => {
    for (const id of FASE1) {
      const r = await app.inject(url(id, 'periodo=custom&de=2027-01-04&ate=2027-01-29'));
      expect(r.statusCode, id).toBe(422);
      expect(r.json().error.code, id).toBe('PERIODO_FORA_DO_HISTORICO');
    }
  });

  it('recorte sem dado dentro do histórico: T10 vazio (0 bloqueios, nenhum fornecedor) e O20 de fim de semana sem dias, 200 válido', async () => {
    const inicio = 'periodo=custom&de=2025-04-09&ate=2025-04-20';
    const t10 = (await app.inject(url('T10', inicio))).json();
    expect(t10.base.n).toBe(0);
    expect(t10.fornecedores).toEqual([]);
    const fds = await app.inject(url('O20', 'periodo=custom&de=2025-04-12&ate=2025-04-13'));
    expect(fds.statusCode).toBe(200);
    expect(schemaDe('O20').safeParse(fds.json()).success).toBe(true);
    expect(fds.json().dias).toEqual([]);
  });
});

describe('A-11: as rotas de métrica são só de leitura', () => {
  it.each(['POST', 'PUT', 'PATCH', 'DELETE'] as const)('%s em /metricas/O20 não é aceito e nada muda', async (metodo) => {
    const antes = (await app.inject(url('O20'))).body;
    const r = await app.inject({ method: metodo, url: url('O20'), payload: { qualquer: 'coisa' } });
    expect([404, 405]).toContain(r.statusCode);
    expect((await app.inject(url('O20'))).body).toBe(antes);
  });
});

describe('A-12 / AL-1: a Visão geral não alerta por nenhuma métrica da fase 1', () => {
  it('nenhum alerta nem indicador é de O19, O20, O21, O23, O24, O25, T10, T12, E7 ou E9', async () => {
    const r = await app.inject(url('VISAO_GERAL'));
    expect(r.statusCode).toBe(200);
    const vg = r.json() as { alertas: { codigo: string }[]; niveis: { indicadores: { metrica: string; codigo: string }[] }[] };
    const fase1 = /^(O19|O20|O21|O23|O24|O25|T10|T12|E7|E9)(_|$)/;
    for (const a of vg.alertas) expect(a.codigo).not.toMatch(fase1);
    const indicadores = vg.niveis.flatMap((n) => n.indicadores);
    expect(indicadores.length).toBeGreaterThan(5);
    for (const i of indicadores) {
      expect(i.metrica).not.toMatch(fase1);
      expect(i.codigo).not.toMatch(fase1);
    }
  });
});
