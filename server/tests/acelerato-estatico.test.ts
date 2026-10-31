import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ddl as ddl0016 } from '../migrations/0016_ac_stg_chamado_recorte.js';
import { COLUNAS_DA_LINHA, COLUNAS_LIDAS } from '../src/modulos/acelerato/listas-fechadas.js';
import { CONSULTAS, Q1_CHAMADOS, Q2_ETAPAS, Q3_CAMPOS, Q4_FORA_ORGANIZACOES, Q5_SAIDA, SET_TETO, sha256Texto, sqlSha256, textoVersionado } from '../src/modulos/acelerato/sql.js';
import { COLUNAS_PESSOA } from '../src/plataforma/db/lgpd.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { COLUNAS_50, COLUNAS_BARRADAS } from './fixtures/acelerato-linha-50-colunas.js';

const RAIZ = new URL('../..', import.meta.url).pathname;
const MODULO = join(RAIZ, 'server/src/modulos/acelerato');
const ler = (caminho: string): string => readFileSync(caminho, 'utf8');
/** Código sem comentários (a prosa dos comentários cita UPDATE, COMMIT etc. sem executar nada). */
const codigo = (caminho: string): string => ler(caminho).replace(/\/\*[^]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const arquivos = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? arquivos(p) : p.endsWith('.ts') ? [p] : []; });
const fontesModulo = arquivos(MODULO);
const noModulo = (nome: string): string => ler(join(MODULO, nome));

describe('guarda de suíte vazia', () => {
  it('lê os arquivos do módulo (pelo menos 12) e as 5 consultas', () => {
    expect(fontesModulo.length).toBeGreaterThanOrEqual(12);
    expect(CONSULTAS).toHaveLength(5);
  });
});

describe('CT-03/04: lista fechada de colunas na consulta', () => {
  const lista = Q1_CHAMADOS.slice('SELECT '.length, Q1_CHAMADOS.indexOf('\nFROM')).replaceAll('\n', ' ').replace('(agente_key IS NOT NULL) AS com_agente', 'com_agente');
  const colunas = lista.split(',').map((x) => x.trim());

  it('o SELECT lista as 35 lidas e a derivada, na ordem da constante, sem asterisco', () => {
    expect([...colunas].sort()).toEqual([...COLUNAS_DA_LINHA].sort()); // com_agente fica no meio do SELECT, como na ADR
    expect(colunas).toHaveLength(36);
    expect(COLUNAS_LIDAS).toHaveLength(35);
    for (const q of CONSULTAS) expect(q).not.toMatch(/SELECT\s+\*|\w\.\*|\*\s+FROM/i);
  });

  it('nenhuma das 11 barradas aparece em consulta alguma; agente_key só como IS NOT NULL', () => {
    const todo = CONSULTAS.join('\n');
    for (const b of COLUNAS_BARRADAS) expect(new RegExp(`\\b${b}\\b`).test(todo), b).toBe(false);
    expect([...todo.matchAll(/agente_key[^,\n]*/g)].map((m) => m[0])).toEqual(['agente_key IS NOT NULL) AS com_agente']);
    expect(COLUNAS_50.filter((c) => !COLUNAS_LIDAS.includes(c as never) && !COLUNAS_BARRADAS.includes(c)
      && !['campos_personalizados', 'campos_personalizados_etapa', 'estatisticas'].includes(c))).toEqual(['agente_key']);
  });

  it('colunas json só por caminho: estatisticas e campos_personalizados dentro de JSON_TABLE, campos_personalizados_etapa em lugar nenhum', () => {
    expect(Q1_CHAMADOS).not.toMatch(/\b(estatisticas|campos_personalizados\w*)\b/);
    expect(Q2_ETAPAS).toContain("JSON_TABLE(c.estatisticas, '$.workflow.etapas[*]'");
    expect(Q3_CAMPOS).toContain("JSON_TABLE(c.campos_personalizados, '$[*]'");
    expect(CONSULTAS.join('\n')).not.toContain('campos_personalizados_etapa');
    expect(Q2_ETAPAS).not.toMatch(/impedimentos|tempoSlaHoras/);
  });
});

describe('CT-14/15: só SELECT, filtro de origem, valores por placeholder', () => {
  it('todas as consultas começam por SELECT, sem ponto e vírgula, sem OFFSET nem escrita', () => {
    for (const q of CONSULTAS) {
      expect(q.startsWith('SELECT')).toBe(true);
      expect(q).not.toContain(';');
      expect(q).not.toMatch(/\b(OFFSET|INSERT|UPDATE|DELETE|DROP|LOAD|ALTER|CREATE|TRUNCATE|GRANT)\b/i);
      expect(q).not.toMatch(/['"]\s*\+|\$\{/);
    }
  });

  it('a Q1 tem o filtro de origem por chave, a ordem, o LIMIT e a paginação por chave composta', () => {
    for (const c of ['tipo_ticket_key IN (<tipos>)', 'organizacao_key IN (<organizacoes>)', 'equipe_key IN (<equipes>)',
      'ORDER BY data_atualizacao, ticket_key', 'LIMIT 1000', 'data_atualizacao >= ?', '(data_atualizacao > ? OR (data_atualizacao = ? AND ticket_key > ?))']) {
      expect(Q1_CHAMADOS).toContain(c);
    }
    expect(Q4_FORA_ORGANIZACOES).toContain('organizacao_key NOT IN (<organizacoes>)');
    expect(Q5_SAIDA).toContain('WHERE ticket_key IN (<ids>)');
  });

  it('a sessão fixa o teto de execução por placeholder', () => {
    expect(SET_TETO).toBe('SET SESSION max_execution_time = ?');
  });

  it('nenhum valor entra no texto: o único literal de cada consulta é caminho de JSON e o LIMIT', () => {
    for (const q of CONSULTAS) expect(q.replace(/'\$[^']*'/g, '').replace(/PATH '[^']*'/g, '')).not.toMatch(/'/);
  });
});

describe('SQL versionado (docs/architecture/fontes/acelerato-mysql.sql)', () => {
  const arquivo = ler(join(RAIZ, 'docs/architecture/fontes/acelerato-mysql.sql'));
  const blocos = arquivo.split(/\n\n(?=-- Q\d)/).slice(0).map((b) => b.split('\n').filter((l) => !l.startsWith('--')).join('\n').trim()).filter(Boolean);

  it('contém exatamente as consultas do código, na mesma ordem; o hash do texto constante é o do arquivo', () => {
    expect(blocos).toEqual([...CONSULTAS]);
    expect(sha256Texto(blocos.join('\n\n'))).toBe(sqlSha256());
    expect(textoVersionado()).toBe(CONSULTAS.join('\n\n'));
  });
});

describe('CT-37 e fronteiras do módulo', () => {
  it('só escreve em dspd_ac: nenhuma referência a dspd_bm nem a dspd_core, nenhum import do BusinessMap', () => {
    for (const f of fontesModulo) {
      const t = ler(f);
      expect(t, f).not.toMatch(/S\.(bm|core)\b|dspd_bm|dspd_core|businessmap/i);
      expect(t, f).not.toMatch(/from '\.\.\/(businessmap|metricas|operacao|referencia)\//);
    }
    const sql = fontesModulo.map(codigo).join('\n');
    const escritas = [...sql.matchAll(/(INSERT INTO|UPDATE|DELETE FROM|ALTER TABLE|CREATE TABLE|DROP TABLE)\s+(\S+)/g)].map((m) => m[2]!);
    expect(escritas.length).toBeGreaterThan(5);
    for (const alvo of escritas) expect(alvo).toMatch(/^\$\{S\.ac\}\./);
  });

  it('o driver é importado por um arquivo só (cliente-mysql.ts); nenhum outro driver MySQL no servidor', () => {
    const importam = arquivos(join(RAIZ, 'server/src')).filter((f) => /from '(mariadb|mysql2|mysql)(\/[^']*)?'|require\('(mariadb|mysql2?)'\)/.test(ler(f)));
    expect(importam).toEqual([join(MODULO, 'cliente-mysql.ts')]);
    const pacote = JSON.parse(ler(join(RAIZ, 'server/package.json'))) as { dependencies: Record<string, string> };
    expect(pacote.dependencies.mariadb).toMatch(/^\d+\.\d+\.\d+$/); // versão exata, sem ^ nem ~
    expect(Object.keys(pacote.dependencies).filter((d) => /^mysql/.test(d))).toEqual([]);
    expect(ler(join(RAIZ, 'pnpm-lock.yaml'))).toContain(`mariadb@${pacote.dependencies.mariadb}`);
  });

  it('as opções de segurança do driver estão escritas no código, e só execute com placeholder (query só para os 3 controles)', () => {
    const c = codigo(join(MODULO, 'cliente-mysql.ts'));
    expect(c).toContain('multipleStatements: false');
    expect(c).toContain('permitLocalInfile: false');
    expect(c).not.toMatch(/infileStreamFactory\s*:|rejectUnauthorized\s*:\s*false|insecureAuth|multipleStatements\s*:\s*true|permitLocalInfile\s*:\s*true|compress\s*:\s*true/);
    expect([...c.matchAll(/\.query\(([^)]*)\)/g)].map((m) => m[1])).toEqual(['CONTROLE.somenteLeituraSessao', 'CONTROLE.iniciarSomenteLeitura', 'CONTROLE.desfazer']);
    expect(c).not.toMatch(/COMMIT/);
    expect(codigo(join(MODULO, 'tls.ts'))).not.toMatch(/rejectUnauthorized\s*:\s*false/);
  });

  it('CT-24: o filtro de origem não vem do .env: nenhuma variável de tipo, organização ou equipe; process.env só na configuração', () => {
    expect(noModulo('config.ts')).not.toMatch(/TIPO|ORGANIZACAO|EQUIPE/);
    for (const f of fontesModulo.filter((x) => !x.endsWith('config.ts'))) expect(ler(f), f).not.toContain('process.env');
  });

  it('CT-07: COLUNAS_PESSOA não ganha entrada do Acelerato; a lista de colunas lidas não tem coluna de pessoa', () => {
    expect(COLUNAS_PESSOA.filter((c) => c.startsWith('dspd_ac'))).toEqual([]);
    expect(COLUNAS_LIDAS.filter((c) => /agente|solicitante|email|login|usuario|titulo|raw/.test(c))).toEqual([]);
  });

  it('CT-50/57/58: o módulo não calcula percentil, média nem ranking, e nada é por agente', () => {
    for (const f of fontesModulo) expect(ler(f), f).not.toMatch(/percentil|quantile|ranking|\bmedia\b|média|Math\.sqrt|GROUP BY/i);
  });
});

describe('CT-39: .env.example', () => {
  const env = ler(join(RAIZ, '.env.example'));
  it('traz os nomes ACELERATO_MYSQL_*, inclusive a impressão e o PEM, e nenhum valor sensível', () => {
    for (const n of ['HOST', 'PORT', 'DATABASE', 'USER', 'PASSWORD', 'TLS_SHA256', 'TLS_CERT_FILE', 'MAX_EXEC_MS', 'MARGEM_HORAS']) expect(env).toContain(`ACELERATO_MYSQL_${n}=`);
    for (const n of ['HOST', 'PORT', 'DATABASE', 'USER', 'PASSWORD', 'TLS_SHA256', 'TLS_CERT_FILE']) expect(env).toMatch(new RegExp(`^# ACELERATO_MYSQL_${n}=$`, 'm'));
    expect(env).not.toMatch(/[0-9a-f]{64}/i);
    expect(env).not.toMatch(/mysql:\/\//i);
  });
});

describe('migração 0016 (recorte e CHECK de SLA do staging)', () => {
  const S = montarEsquemas('');
  const { up, down } = ddl0016(S);
  it('acrescenta fora_do_recorte (padrão false) e o CHECK dos 4 status; o down desfaz os dois', () => {
    expect(up[0]).toBe('ALTER TABLE dspd_ac.stg_chamado ADD COLUMN IF NOT EXISTS fora_do_recorte boolean NOT NULL DEFAULT false');
    expect(up[1]).toContain("(payload->>'sla_pa_status') IN ('REALIZADO_NO_PRAZO','REALIZADO_APOS_VENCIMENTO','DENTRO_DO_PRAZO','VENCIDO')");
    expect(up[1]).toContain("(payload->>'sla_r_status') IN (");
    expect(down.join('\n')).toContain('DROP CONSTRAINT IF EXISTS ck_stg_chamado_status_sla');
    expect(down.join('\n')).toContain('DROP COLUMN IF EXISTS fora_do_recorte');
    expect(up.join('\n')).not.toMatch(/\bUPDATE\b|\bDELETE\b|GRANT/);
  });
});
