import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { carregarConfigApi } from '../src/plataforma/config.js';

// Pedido 059, B4 (ADR 0020 revisão 4, R4-5; CA-AP-4): interruptor `APONTAMENTO_NOMES` e guarda de partida, mais os testes estáticos sobre os arquivos de
// compose e de CI (nunca ligam o nome real; portas só em 127.0.0.1) e o lint do pool.
const BASE = { PG_API_URL: 'postgres://dspd_api:SENHA-SECRETA-059@127.0.0.1:5432/metricas' };
const cfg = (extra: Record<string, string>) => carregarConfigApi({ ...BASE, ...extra });
const recusa = (extra: Record<string, string>): string => {
  try { cfg(extra); } catch (e) { return (e as Error).message; }
  throw new Error('a partida deveria ter sido recusada');
};

describe('APONTAMENTO_NOMES (padrão desligado)', () => {
  it('ausente = desligado; 0 e 1 são aceitos; a rota só existe com PG_APONTAMENTO_URL', () => {
    expect(cfg({}).APONTAMENTO_NOMES).toBe('0');
    expect(cfg({ APONTAMENTO_NOMES: '0' }).APONTAMENTO_NOMES).toBe('0');
    expect(cfg({}).PG_APONTAMENTO_URL).toBeUndefined();
    expect(cfg({ PG_APONTAMENTO_URL: 'postgres://dspd_api_apontamento:x@h/db' }).PG_APONTAMENTO_URL).toContain('dspd_api_apontamento');
  });
  for (const valor of ['talvez', '', 'true', 'sim', '2'])
    it(`valor inválido recusa a partida e cita só o nome da variável: "${valor}"`, () => {
      const msg = recusa({ APONTAMENTO_NOMES: valor });
      expect(msg).toContain('APONTAMENTO_NOMES');
      expect(msg).not.toContain('SENHA-SECRETA-059');
    });
});

describe('guarda de partida com o nome real ligado (R4-5)', () => {
  const ligado = { APONTAMENTO_NOMES: '1' };
  it('aceita 127.0.0.1 e ::1', () => {
    expect(cfg({ ...ligado, HOST: '127.0.0.1' }).HOST).toBe('127.0.0.1');
    expect(cfg({ ...ligado, HOST: '::1' }).HOST).toBe('::1');
  });
  it('HOST=0.0.0.0 (o padrão) só com APONTAMENTO_PUBLICACAO_LOOPBACK=1', () => {
    expect(recusa(ligado)).toContain('HOST');
    expect(recusa({ ...ligado, HOST: '0.0.0.0' })).toContain('HOST');
    expect(cfg({ ...ligado, HOST: '0.0.0.0', APONTAMENTO_PUBLICACAO_LOOPBACK: '1' }).HOST).toBe('0.0.0.0');
    expect(recusa({ ...ligado, HOST: '0.0.0.0', APONTAMENTO_PUBLICACAO_LOOPBACK: '2' })).toContain('APONTAMENTO_PUBLICACAO_LOOPBACK');
  });
  it('rede local: HOST igual ao APONTAMENTO_REDE_LOCAL; endereço privado sem declarar é recusado', () => {
    expect(cfg({ ...ligado, HOST: '192.168.1.20', APONTAMENTO_REDE_LOCAL: '192.168.1.20' }).HOST).toBe('192.168.1.20');
    expect(recusa({ ...ligado, HOST: '192.168.1.20' })).toContain('HOST');
    expect(recusa({ ...ligado, HOST: '192.168.1.21', APONTAMENTO_REDE_LOCAL: '192.168.1.20' })).toContain('HOST');
  });
  it('HOST público, `::` ou nome de host são recusados', () => {
    for (const HOST of ['::', '8.8.8.8', 'minha-maquina', 'localhost']) expect(recusa({ ...ligado, HOST }), HOST).toContain('HOST');
  });
  it('desligado, o HOST padrão passa (ambiente de homologação e CI nunca ligam)', () => {
    expect(cfg({ APONTAMENTO_NOMES: '0', HOST: '0.0.0.0' }).HOST).toBe('0.0.0.0');
  });
});

describe('APONTAMENTO_REDE_LOCAL: um IPv4 privado específico', () => {
  for (const valor of ['10.1.2.3', '172.16.0.5', '172.31.255.254', '192.168.0.1'])
    it(`aceita ${valor}`, () => { expect(cfg({ APONTAMENTO_REDE_LOCAL: valor }).APONTAMENTO_REDE_LOCAL).toBe(valor); });
  for (const valor of ['0.0.0.0', '::', '192.168.1.0/24', '192.168.1.2,192.168.1.3', 'minha-maquina', '8.8.8.8', '172.32.0.1', '172.15.0.1', '11.0.0.1', '192.168.1.256', '192.168.01.1', ' 192.168.1.2'])
    it(`recusa "${valor}" (mesmo com o nome real desligado)`, () => { expect(recusa({ APONTAMENTO_REDE_LOCAL: valor })).toContain('APONTAMENTO_REDE_LOCAL'); });
  it('vazio é "não declarado"', () => { expect(cfg({ APONTAMENTO_REDE_LOCAL: '' }).APONTAMENTO_REDE_LOCAL).toBeUndefined(); });
});

const raiz = fileURLToPath(new URL('../../', import.meta.url));
const ler = (c: string): string => readFileSync(`${raiz}${c}`, 'utf8');

describe('arquivos de compose e de CI (R4-5)', () => {
  const composes = ['docker-compose.yml', 'docker-compose.homolog.yml'];
  const workflows = readdirSync(`${raiz}.github/workflows`).filter((f) => f.endsWith('.yml')).map((f) => `.github/workflows/${f}`);
  it('nenhum liga APONTAMENTO_NOMES (homologação, CI e servidor nunca ligam o nome real)', () => {
    for (const a of [...composes, ...workflows]) expect(ler(a), a).not.toMatch(/APONTAMENTO_NOMES\s*[:=]\s*["']?1/);
    expect(ler('docker-compose.yml')).toContain('APONTAMENTO_NOMES: ${APONTAMENTO_NOMES:-0}');
    expect(ler('docker-compose.homolog.yml')).not.toMatch(/PG_APONTAMENTO_URL|APONTAMENTO_NOMES/); // a rota nem existe em homologação
  });
  it('toda porta publicada é só em 127.0.0.1, e o contêiner declara a publicação em loopback', () => {
    for (const a of composes) {
      const portas = [...ler(a).matchAll(/ports:\s*\[?\s*-?\s*"([^"]+)"/g)].map((m) => m[1]!);
      expect(portas.length, a).toBeGreaterThan(0);
      for (const p of portas) expect(p, a).toMatch(/^127\.0\.0\.1:/);
    }
    expect(ler('docker-compose.yml')).toContain('APONTAMENTO_PUBLICACAO_LOOPBACK: "1"');
  });
  it('o nginx do painel repassa o Host original para a validação de Host valer atrás dele', () => {
    expect(ler('docker/web/nginx.conf')).toMatch(/location \/api\/ \{[^}]*proxy_set_header Host \$host;/);
  });
});

describe('lint do pool (R4-5): só o módulo da aba o conhece; diretiva inline proibida no módulo', () => {
  const eslint = new ESLint({ cwd: fileURLToPath(new URL('..', import.meta.url)) });
  const mensagens = async (codigo: string, arquivo: string) => (await eslint.lintText(codigo, { filePath: fileURLToPath(new URL(`../${arquivo}`, import.meta.url)) }))[0]!.messages;
  it('outro módulo importar o módulo da aba (e por ele o pool) falha o lint', async () => {
    for (const origem of ["'../apontamento/index.js'", "'../apontamento/pool.js'", "'../../modulos/apontamento/index.js'"]) {
      const m = await mensagens(`import { abrirPoolApontamento } from ${origem};\nexport const x = abrirPoolApontamento;\n`, 'src/modulos/metricas/zz-lint.ts');
      expect(m.map((x) => x.ruleId), origem).toContain('no-restricted-imports');
    }
  });
  it('a entrada api e o app podem importar o index do módulo; arquivo interno dele não', async () => {
    expect(await mensagens("import { abrirPoolApontamento } from '../modulos/apontamento/index.js';\nexport const x = abrirPoolApontamento;\n", 'src/entradas/zz-lint.ts')).toEqual([]);
    const m = await mensagens("import { abrirPoolApontamento } from '../modulos/apontamento/pool.js';\nexport const x = abrirPoolApontamento;\n", 'src/entradas/zz-lint.ts');
    expect(m.map((x) => x.ruleId)).toContain('no-restricted-imports');
  });
  it('a biblioteca do coletor só entra em modulos/businessmap', async () => {
    const codigo = "import { MASCARA_FLAG } from '@metricas-dspd/metricas/coletor';\nexport const x = MASCARA_FLAG;\n";
    expect((await mensagens(codigo, 'src/modulos/apontamento/zz-lint.ts')).map((x) => x.ruleId)).toContain('no-restricted-imports');
    expect((await mensagens(codigo, 'src/plataforma/zz-lint.ts')).map((x) => x.ruleId)).toContain('no-restricted-imports');
    expect((await mensagens(codigo, 'src/modulos/businessmap/apontamento/zz-lint.ts')).map((x) => x.ruleId)).not.toContain('no-restricted-imports');
  });
  it('no módulo da aba a diretiva eslint-disable é ignorada: o import proibido continua falhando', async () => {
    const m = await mensagens("// eslint-disable-next-line no-restricted-imports\nimport { MASCARA_FLAG } from '@metricas-dspd/metricas/coletor';\nexport const x = MASCARA_FLAG;\n", 'src/modulos/apontamento/zz-lint.ts');
    expect(m.map((x) => x.ruleId)).toContain('no-restricted-imports');
  });
});
