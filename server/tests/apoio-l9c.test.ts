import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CONSULTA_A, CONSULTA_B, RECORTE_APOIO, executarApoioL9c } from '../src/apoio/apoio-l9c.js';
import type { SessaoMysql } from '../src/modulos/acelerato/cliente-mysql.js';
import { NOMES_ETAPA_LISTA } from '../src/modulos/acelerato/listas-fechadas.js';
import { CONSULTAS, sqlSha256, textoVersionado } from '../src/modulos/acelerato/sql.js';

/** Comando de apoio do L9-c (K-220): duas consultas só leitura, só contagens. Conexão falsa: nada roda contra base real. */
const ler = (c: string): string => readFileSync(new URL(c, import.meta.url), 'utf8');

describe('estrutura das duas consultas', () => {
  it.each([['A', CONSULTA_A], ['B', CONSULTA_B]])('%s: só SELECT, sem ponto e vírgula, sem escrita, sem asterisco, sem valor no texto', (_n, q) => {
    expect(q.startsWith('SELECT')).toBe(true);
    expect(q).not.toContain(';');
    expect(q).not.toMatch(/\b(INSERT|UPDATE|DELETE|DROP|LOAD|ALTER|CREATE|TRUNCATE|GRANT|UNION|LIKE|OFFSET)\b|\*\s*FROM|\w\.\*/i);
    expect(q).toContain('f.nome IN (<nomes>)');
    expect(q).toContain('c.equipe_key IN (<equipes>)');
    expect(q).toContain('c.tipo_ticket_key = ? AND c.organizacao_key = ?');
    for (const n of NOMES_ETAPA_LISTA) expect(q).not.toContain(n);
    const semCaminhos = q.replace(/PATH '[^']*'/g, '').replace(/NULLIF\(TRIM\(f\.valor\), ''\)/, '');
    expect(semCaminhos.replace(/JSON_TABLE\(c\.\w+, '[^']*'/g, '')).not.toMatch(/'/);
  });
  it('colunas json só dentro de JSON_TABLE: campos_personalizados_etapa uma vez, estatisticas uma vez (só na A); nenhuma coluna de pessoa ou texto livre', () => {
    for (const q of [CONSULTA_A, CONSULTA_B]) {
      expect(q.split('campos_personalizados_etapa')).toHaveLength(2);
      expect(q).toContain("JSON_TABLE(c.campos_personalizados_etapa, '$[*]'");
      expect(q).not.toMatch(/\b(agente_key|solicitante|email|login|usuario|titulo|descricao|raw|campos_personalizados)\b/i);
    }
    expect(CONSULTA_A).toContain("JSON_TABLE(c.estatisticas, '$.workflow.etapas[*]'");
    expect(CONSULTA_A.split('estatisticas')).toHaveLength(2);
    expect(CONSULTA_B).not.toContain('estatisticas');
  });
  it('a saída é só de contagens: a A projeta COUNT e SUM; a B projeta o nome do campo e COUNT; o valor só aparece no HAVING', () => {
    const projecao = (q: string): string => q.slice('SELECT '.length, q.indexOf('\nFROM')).replaceAll('\n', ' ');
    expect(projecao(CONSULTA_A).replace(/\(EXISTS \(.*\)\)/, '(EXISTS)')).toBe(
      'COUNT(*) AS itens, SUM(f.k IS NULL) AS sem_chave,        SUM(EXISTS) AS casa_etapa_key,        SUM(f.k = c.status_key) AS igual_status_atual');
    expect(projecao(CONSULTA_B)).toBe('x.nome, COUNT(*) AS chamados');
    expect(CONSULTA_B.match(/\bf\.valor\b/g)).toHaveLength(1); // só dentro do HAVING (a coluna nunca é projetada)
    expect(CONSULTA_B).toContain("HAVING COUNT(DISTINCT NULLIF(TRIM(f.valor), '')) >= 2");
    expect(CONSULTA_B.endsWith('GROUP BY x.nome ORDER BY x.nome')).toBe(true);
  });
  it('fora da coleta: nenhuma das duas entra em CONSULTAS nem no texto versionado que gera o hash do SQL', () => {
    expect(CONSULTAS).not.toContain(CONSULTA_A);
    expect(CONSULTAS).not.toContain(CONSULTA_B);
    expect(textoVersionado()).not.toContain('casa_etapa_key');
    expect(sqlSha256()).toMatch(/^[0-9a-f]{64}$/);
  });
});

/** Sessão falsa: registra o que foi pedido e responde por ordem (a primeira consulta é a A, a segunda a B). */
const sessaoFalsa = (a: unknown[], b: unknown[]) => {
  const pedidos: { sql: string; valores: readonly unknown[] }[] = [];
  const sessao: SessaoMysql = {
    consultar: <T extends Record<string, unknown>>(sql: string, valores: readonly unknown[]) => {
      pedidos.push({ sql, valores });
      return Promise.resolve((pedidos.length === 1 ? a : b) as T[]);
    },
  };
  return { sessao, pedidos };
};
const A_OK = { itens: 1, sem_chave: 0, casa_etapa_key: 0, igual_status_atual: 0 };

describe('executarApoioL9c com conexão falsa', () => {
  it('roda só as duas consultas, por placeholder (recorte e os 7 nomes da lista fechada), e devolve só contagens', async () => {
    const { sessao, pedidos } = sessaoFalsa(
      [{ itens: '120', sem_chave: '3', casa_etapa_key: '100', igual_status_atual: '40' }],
      [{ nome: 'Motivo da Escalação', chamados: 5 }, { nome: 'Avaliação de Problema', chamados: '2' }],
    );
    const r = await executarApoioL9c(sessao);
    expect(r.a).toEqual({ itens: 120, sem_chave: 3, casa_etapa_key: 100, igual_status_atual: 40 });
    expect(r.b.map((x) => x.campo)).toEqual([...NOMES_ETAPA_LISTA]);
    expect(Object.fromEntries(r.b.map((x) => [x.campo, x.chamados]))).toMatchObject({ 'Motivo da Escalação': 5, 'Avaliação de Problema': 2, 'Motivo de Pendência': 0 });
    expect(pedidos).toHaveLength(2);
    expect(pedidos.every((p) => p.sql.startsWith('SELECT') && !p.sql.includes('<') && !p.sql.includes(';'))).toBe(true);
    for (const p of pedidos) expect(p.valores).toEqual([RECORTE_APOIO.tipo, RECORTE_APOIO.organizacao, ...RECORTE_APOIO.equipes, ...NOMES_ETAPA_LISTA]);
    expect(Object.keys(r)).toEqual(['a', 'b']);
  });
  it('soma sem nenhuma linha (nulo) conta zero; sem chamado com valores diferentes, todos os campos dão zero', async () => {
    const r = await executarApoioL9c(sessaoFalsa([{ itens: 0, sem_chave: null, casa_etapa_key: null, igual_status_atual: null }], []).sessao);
    expect(r.a).toEqual({ itens: 0, sem_chave: 0, casa_etapa_key: 0, igual_status_atual: 0 });
    expect(r.b.every((x) => x.chamados === 0)).toBe(true);
  });
  it.each([
    ['A com coluna extra', [{ ...A_OK, valor: 'MARCADOR-L9C' }], [], 'apoio_l9c_a', 'valor'],
    ['A com texto no lugar da contagem', [{ ...A_OK, itens: 'MARCADOR-L9C' }], [], 'apoio_l9c_a', 'itens'],
    ['A com contagem negativa', [{ ...A_OK, itens: -1 }], [], 'apoio_l9c_a', 'itens'],
    ['A sem linha', [], [], 'apoio_l9c_a', undefined],
    ['A com duas linhas', [A_OK, A_OK], [], 'apoio_l9c_a', undefined],
    ['B com nome fora da lista fechada', [A_OK], [{ nome: 'MARCADOR-L9C', chamados: 1 }], 'apoio_l9c_b', 'nome'],
    ['B com coluna a mais', [A_OK], [{ nome: 'Motivo da Escalação', chamados: 1, valor: 'MARCADOR-L9C' }], 'apoio_l9c_b', 'valor'],
  ])('%s: falha fechado dados-invalidos, citando só o nome da coluna, sem o valor', async (_n, a, b, entidade, coluna) => {
    const erro = (await executarApoioL9c(sessaoFalsa(a, b).sessao).catch((e: unknown) => e)) as { codigo: string; entidade: string; coluna?: string; message: string };
    expect(erro).toMatchObject({ codigo: 'dados-invalidos', entidade });
    expect(erro.coluna).toBe(coluna);
    expect(JSON.stringify(erro) + erro.message).not.toContain('MARCADOR-L9C');
  });
});

describe('entrada e package.json', () => {
  it('o script ac:apoio-l9c existe e a entrada só lê: sem PostgreSQL, sem escrita, sem imprimir configuração', () => {
    const pacote = JSON.parse(ler('../package.json')) as { scripts: Record<string, string> };
    expect(pacote.scripts['ac:apoio-l9c']).toBe('tsx src/entradas/apoio-l9c.ts');
    const entrada = ler('../src/entradas/apoio-l9c.ts');
    expect(entrada).toContain('comSessaoMysql');
    expect(entrada).not.toMatch(/criarPool|PG_|INSERT|UPDATE|DELETE|console\.|config\.(senha|host|usuario)/);
    expect(ler('../src/apoio/apoio-l9c.ts')).not.toMatch(/process\.env|console\.|criarPool/);
  });
});
