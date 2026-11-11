import { describe, expect, it } from 'vitest';
import { LIMIARES_ACHADO_PADRAO } from '@metricas-dspd/metricas/businessmap';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { CRITERIOS_APONTAMENTO, METRICA_ACHADOS_APONTAMENTO, METRICA_DICIONARIO_APONTAMENTO, registrarCriteriosApontamento } from '../src/modulos/referencia/criterios-apontamento.js';
import { lerCriterios, lerRotulosSubgrupo } from '../src/modulos/apontamento/repositorio.js';
import { LIMITE_ATIPICO_SEGUNDOS } from '../src/modulos/apontamento/servico.js';
import { criarDublePg } from './duble-pg.js';

const S = montarEsquemas('');
const AGORA = new Date('2026-11-02T12:00:00Z');

describe('E2.21: limiares provisórios dos achados da aba Apontamento em ref_versao_criterio (T2.6)', () => {
  it('uma versão de critério do domínio businessmap, com a data de vigência e a métrica dos achados', async () => {
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [] : q.texto.includes('RETURNING versao_id') ? [{ versao_id: '7' }] : []));
    expect(await registrarCriteriosApontamento(d.pool, S, '2026-11-02', AGORA)).toEqual(['059:limiares-achados', '067:limite-dia-atipico', '089:sem-vinculo-so-sem-comentario']);
    const versoes = d.chamadas.filter((c) => c.texto.includes('INSERT INTO dspd_core.ref_versao_criterio ('));
    expect(versoes).toHaveLength(3);
    expect(versoes[0]!.texto).toContain("'businessmap'");
    expect(versoes[0]!.valores[0]).toBe('2026-11-02');
    expect(versoes[0]!.valores[3]).toBe('059:limiares-achados');
    expect(versoes[1]!.valores[0]).toBe('2026-11-02');
    expect(versoes[1]!.valores[3]).toBe('067:limite-dia-atipico');
    expect(versoes[2]!.valores[0]).toBe('2026-11-02'); // a data é a informada (Q3: a da primeira varredura completa), nunca fixa no código
    expect(versoes[2]!.valores[3]).toBe('089:sem-vinculo-so-sem-comentario');
    expect(d.chamadas.filter((c) => c.texto.includes('ref_versao_criterio_metrica')).map((c) => c.valores)).toEqual([
      ['7', METRICA_ACHADOS_APONTAMENTO], ['7', METRICA_ACHADOS_APONTAMENTO], ['7', METRICA_ACHADOS_APONTAMENTO], ['7', METRICA_DICIONARIO_APONTAMENTO],
    ]);
  });
  it('pedido 089: o critério do sem-vinculo diz o que mudou, cabe nas colunas e nunca edita as linhas já registradas (só INSERT)', async () => {
    const c = CRITERIOS_APONTAMENTO.find((x) => x.referencia === '089:sem-vinculo-so-sem-comentario')!;
    expect(c.descricao).toContain('Execução técnica deixa de contar em sem-vínculo');
    expect(c.descricao).toContain('Sem comentário');
    expect(c.descricao.length).toBeLessThanOrEqual(300);
    expect(c.motivo.length).toBeLessThanOrEqual(500);
    expect(c.metricas).toContain(METRICA_DICIONARIO_APONTAMENTO);
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [] : q.texto.includes('RETURNING versao_id') ? [{ versao_id: '9' }] : []));
    await registrarCriteriosApontamento(d.pool, S, '2026-11-16', AGORA);
    expect(d.chamadas.some((x) => /\b(UPDATE|DELETE)\b/.test(x.texto))).toBe(false);
  });
  it('pedido 089 (A): o id do critério lido leva o prefixo da família (dicionario-, calendario-, achados-), que o front usa para a marca', async () => {
    const d = criarDublePg(() => [
      { versao_id: '5', vigente_desde: '2026-11-01', descricao: 'a', familia: 'dicionario' },
      { versao_id: '6', vigente_desde: '2026-11-02', descricao: 'b', familia: 'calendario' },
      { versao_id: '7', vigente_desde: '2026-11-03', descricao: 'c', familia: 'achados' },
    ]);
    expect((await lerCriterios(d.pool, S)).map((x) => x.id)).toEqual(['dicionario-5', 'calendario-6', 'achados-7']);
    const sql = d.chamadas[0]!.texto;
    expect(sql).toContain(METRICA_DICIONARIO_APONTAMENTO);
    expect(sql).not.toMatch(/v\.referencia/); // `referencia` não está no GRANT do papel da aba
  });
  it('pedido 089 (B): o rótulo do subgrupo vem da linha mais recente do código, sem ler `vigente_ate` (fora do GRANT da aba)', async () => {
    const d = criarDublePg(() => [{ codigo: 'nao-classificado', rotulo: 'Sem comentário' }]);
    expect((await lerRotulosSubgrupo(d.pool, S)).get('nao-classificado')).toBe('Sem comentário');
    const sql = d.chamadas[0]!.texto;
    expect(sql).toContain('DISTINCT ON (codigo)');
    expect(sql).toContain('incluido_por_versao_id DESC');
    expect(sql).not.toContain('vigente_ate');
  });
  it('pedido 067: a versão do limite do dia atípico diz 10 h e antes 16 h, e vale a partir da data informada (2026-11-04)', async () => {
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [] : q.texto.includes('RETURNING versao_id') ? [{ versao_id: '8' }] : []));
    await registrarCriteriosApontamento(d.pool, S, '2026-11-04', AGORA);
    const c = CRITERIOS_APONTAMENTO.find((x) => x.referencia === '067:limite-dia-atipico')!;
    expect(c.descricao).toContain('10 h');
    expect(c.descricao).toContain('16 h');
    expect(c.descricao.length).toBeLessThanOrEqual(300);
    expect(c.motivo.length).toBeLessThanOrEqual(500);
    expect(LIMITE_ATIPICO_SEGUNDOS).toBe(10 * 3600);
    expect(d.chamadas.filter((x) => x.texto.includes('INSERT INTO dspd_core.ref_versao_criterio ('))[1]!.valores[0]).toBe('2026-11-04');
  });
  it('idempotente: o que já existe pela referência não é gravado de novo', async () => {
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [{ x: 1 }] : []));
    expect(await registrarCriteriosApontamento(d.pool, S, '2026-11-02', AGORA)).toEqual([]);
    expect(d.chamadas.some((c) => c.texto.includes('INSERT'))).toBe(false);
  });
  it('a descrição traz os cinco limiares vigentes da biblioteca (20, 20, 50, 1, 10) e cabe nas colunas (300 e 500)', () => {
    expect(LIMIARES_ACHADO_PADRAO).toEqual({ naoClassificadoPct: 20, semComentarioPct: 20, concentracaoPct: 50, diasAtipicos: 1, variacaoUtilizacaoPp: 10 });
    const c = CRITERIOS_APONTAMENTO[0]!; // só o critério 059 traz os cinco limiares
    for (const n of Object.values(LIMIARES_ACHADO_PADRAO)) expect(c.descricao).toContain(String(n));
    expect(c.descricao.length).toBeLessThanOrEqual(300);
    expect(c.motivo.length).toBeLessThanOrEqual(500);
    expect(new Set(CRITERIOS_APONTAMENTO.map((x) => x.referencia)).size).toBe(CRITERIOS_APONTAMENTO.length);
  });
});
