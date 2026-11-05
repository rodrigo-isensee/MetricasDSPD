import { describe, expect, it } from 'vitest';
import { Contadores, camposEtapa, type DominiosEtapa, type RegistroChamado } from '../src/modulos/acelerato/allow-list.js';
import { normalizarChamado } from '../src/modulos/acelerato/normalizador.js';

/** L9-c do 069 (K-220): campo de etapa repetido (decisão do dono de 2026-11-05) e projeção das colunas da F3. */
const dom: DominiosEtapa = new Map([['motivo_escalacao', new Set(['A', 'B'])]]);
const lista = (valor: string | null, nome = 'Motivo da Escalação') => ({ ticket_key: 1, nome, tipo: 'lista', valor });
const campo = (l: unknown[], c = new Contadores()) => camposEtapa(l, [], dom, c).motivo_escalacao;

describe('campo repetido em várias etapas: vale o valor preenchido mais recente, vazio nunca apaga', () => {
  it('um valor só vale; dois valores diferentes valem o da etapa mais recente (o último na ordem da fonte)', () => {
    expect(campo([lista('A')])).toBe('A');
    expect(campo([lista('A'), lista('B')])).toBe('B');
    expect(campo([lista('B'), lista('A')])).toBe('A');
  });
  it('vazio depois de valor (nulo ou texto vazio) não apaga o valor; vazio antes do valor também não o esconde', () => {
    expect(campo([lista('A'), lista(null)])).toBe('A');
    expect(campo([lista('A'), lista('')])).toBe('A');
    expect(campo([lista('A'), lista(null), lista('')])).toBe('A');
    expect(campo([lista(null), lista('B')])).toBe('B');
    expect(campo([lista(null), lista('')])).toBeNull();
  });
  it('o valor preenchido mais recente fora do domínio vira nulo com contagem, sem recuar para o antigo e sem guardar o valor', () => {
    const c = new Contadores();
    expect(campo([lista('A'), lista('MARCADOR-L9C')], c)).toBeNull();
    expect(c.entradas()).toEqual([['fora_dominio_motivo_escalacao', 1]]);
  });
  it('a regra vale por campo: um vazio em outro nome não toca o valor deste', () => {
    const r = camposEtapa([lista('A'), lista(null, 'Motivo de Encerramento')], [], dom, new Contadores());
    expect(r).toMatchObject({ motivo_escalacao: 'A', motivo_encerramento: null });
  });
});

const base = (campos: unknown): RegistroChamado => ({ ticket_key: 7, com_agente: true, campos } as RegistroChamado);
const norm = (campos: unknown) => normalizarChamado('7', base(campos), { ausente: false, fora: false }, [], new Map(), new Contadores());

describe('normalizador: colunas da F3', () => {
  it('copia os valores de domínio, o indicador de preenchido e o "tem previsão"', () => {
    expect(norm({
      reincidente_90d: null, motivo_escalacao: 'A', motivo_encerramento: 'B', avaliacao_problema: 'C', motivo_pendencia: 'D',
      prioridade_ajustada: 'SIM', justificativa_informada: true, previsao_retorno_informada: true,
    })).toMatchObject({
      motivo_escalacao: 'A', motivo_encerramento: 'B', avaliacao_problema: 'C', motivo_pendencia_atual: 'D',
      prioridade_ajustada_manualmente: true, justificativa_informada: true, previsao_retorno: true,
    });
  });
  it('nulo vira nulo; sem previsão é false; justificativa e ajuste ficam false (colunas NOT NULL), "não" e outro valor não ajustam', () => {
    const l = norm({ reincidente_90d: null, motivo_escalacao: null, previsao_retorno_informada: false, justificativa_informada: false, prioridade_ajustada: null });
    expect(l).toMatchObject({ motivo_escalacao: null, previsao_retorno: false, justificativa_informada: false, prioridade_ajustada_manualmente: false });
    for (const v of ['NÃO', 'nao', 'talvez']) expect(norm({ prioridade_ajustada: v }).prioridade_ajustada_manualmente).toBe(false);
    expect(norm({ prioridade_ajustada: ' sim ' }).prioridade_ajustada_manualmente).toBe(true);
  });
  it('versão do staging sem os campos da F3 (anterior ao L9-b) ou com tipo errado: nulo, false, nunca inferido', () => {
    for (const campos of [undefined, { reincidente_90d: 'sim' }, { previsao_retorno_informada: 'sim', motivo_escalacao: 3, justificativa_informada: 'sim' }])
      expect(norm(campos)).toMatchObject({ previsao_retorno: null, motivo_escalacao: null, justificativa_informada: false, prioridade_ajustada_manualmente: false });
  });
});
