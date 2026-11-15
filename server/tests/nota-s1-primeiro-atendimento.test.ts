import { describe, expect, it } from 'vitest';
import { TEXTO_NOTA_QUALQUER } from '@metricas-dspd/contratos';
import { comNotaS1PrimeiroAtendimento } from '../src/modulos/metricas/parte-sem-dado.js';

const NOTA = 'primeiro-atendimento-inclui-automatica';

describe('D4 (Q-099-5b = A): nota do primeiro atendimento no S1 real', () => {
  it('acrescenta a nota ao S1, com ou sem amostra, sem tocar no resto e sem repetir', () => {
    const r = { prioridades: [], excecoesForaDaApuracao: 0 };
    expect(comNotaS1PrimeiroAtendimento('S1', r)).toEqual({ ...r, notas: [NOTA] });
    const jaTem = { ...r, notas: [NOTA] };
    expect(comNotaS1PrimeiroAtendimento('S1', jaTem)).toEqual(jaTem);
  });

  it('não toca outra métrica e o texto da nota diz que inclui resposta automática', () => {
    const r = { notas: [] as string[] };
    expect(comNotaS1PrimeiroAtendimento('S2', r)).toBe(r);
    expect(comNotaS1PrimeiroAtendimento('S12', r)).toBe(r);
    expect(TEXTO_NOTA_QUALQUER[NOTA]).toContain('respostas automáticas');
  });
});
