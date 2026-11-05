import { describe, expect, it } from 'vitest';
import { Contadores, camposEtapa, type DominiosEtapa, type OrdemFluxo, type RegistroChamado } from '../src/modulos/acelerato/allow-list.js';
import { CAMPOS_ETAPA_F3 } from '../src/modulos/acelerato/listas-fechadas.js';
import { normalizarChamado } from '../src/modulos/acelerato/normalizador.js';

/**
 * L9-c do 069 (K-220): campo de etapa repetido, pela ordem do desenho do fluxo (decisão "B" do dono de 2026-11-05; P-L9C-1 e P-L9C-2 "A") e
 * projeção das colunas da F3. A ordem das linhas nunca decide: cada linha traz um `kanbanStatusKey` diferente.
 */
const dom: DominiosEtapa = new Map([['motivo_escalacao', new Set(['A', 'B', 'C'])]]);
const lista = (valor: string | null, etapa: number | null, nome = 'Motivo da Escalação') => ({ ticket_key: 1, nome, tipo: 'lista', valor, kanban_status_key: etapa });
/** Desenho do fluxo escrito à mão: etapa 10 vem antes da 20, que vem antes da 30; a 40 tem a mesma posição da 30. */
const FLUXO: OrdemFluxo = new Map([[10, 1], [20, 2], [30, 3], [40, 3], [50, 4], [60, 4]]);
const campo = (l: unknown[], c = new Contadores(), fluxo: OrdemFluxo = FLUXO) => camposEtapa(l, [], dom, fluxo, c).motivo_escalacao;

const permutacoes = <T>(xs: T[]): T[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => permutacoes([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])));

describe('campo repetido em várias etapas: vale o valor preenchido da etapa que vem por último no desenho do fluxo', () => {
  it('linhas embaralhadas: todas as permutações de 4 linhas, cada uma com etapa diferente, dão o valor da maior posição', () => {
    const linhas = [lista('A', 10), lista('B', 20), lista('C', 30), lista('A', 50)];
    const todas = permutacoes(linhas);
    expect(todas).toHaveLength(24);
    for (const p of todas) {
      const c = new Contadores();
      expect(campo(p, c)).toBe('A'); // 'A' na etapa 50 (posição 4) vence 'C' na 30 (posição 3)
      expect(c.entradas()).toEqual([]);
    }
  });
  it('etapas fora de ordem: a etapa que vem por último no desenho chega primeiro e vence; a última linha não vence', () => {
    expect(campo([lista('B', 30), lista('A', 10)])).toBe('B');
    expect(campo([lista('A', 10), lista('B', 30)])).toBe('B');
    expect(campo([lista('A', 20), lista('C', 30), lista('B', 10)])).toBe('C');
  });
  it('a posição vale, não o número da chave: chave menor com posição maior vence', () => {
    const fluxo: OrdemFluxo = new Map([[5, 9], [900, 1]]);
    expect(campo([lista('A', 900), lista('B', 5)], new Contadores(), fluxo)).toBe('B');
  });
  it('vazio depois de valor (nulo e texto vazio) em etapa de maior posição: vence o preenchido de posição menor', () => {
    expect(campo([lista('A', 10), lista(null, 30)])).toBe('A');
    expect(campo([lista('A', 10), lista('', 30)])).toBe('A');
    expect(campo([lista(null, 30), lista('A', 10), lista('', 20)])).toBe('A');
    expect(campo([lista('A', 10), lista('B', 20), lista(null, 30)])).toBe('B');
    expect(campo([lista(null, 10), lista('B', 20)])).toBe('B');
    expect(campo([lista(null, 10), lista('', 20)])).toBeNull();
  });
  it('valor só de espaços é vazio (como o TRIM da consulta B): não compete nem apaga o preenchido, e sozinho dá nulo sem contagem', () => {
    const c = new Contadores();
    expect(campo([lista('A', 10), lista('   ', 30)], c)).toBe('A');
    expect(campo([lista(' \t', 30), lista('A', 10), lista('B', 10)], c)).toBeNull(); // empate A/B na posição 1, o branco não entra
    expect(campo([lista('  ', 10)], c)).toBeNull();
    expect(c.entradas()).toEqual([['empate_fluxo_motivo_escalacao', 1]]);
  });
  it('valores iguais ou um só preenchido: o valor segue sem consultar a posição (chave nula ou fora da lista) e nada é contado', () => {
    const c = new Contadores();
    expect(campo([lista('A', null)], c)).toBe('A');
    expect(campo([lista('A', 999)], c)).toBe('A');
    expect(campo([lista('A', 999), lista('A', null), lista('A', 10)], c)).toBe('A');
    expect(campo([lista('A', 999), lista(null, 10)], c)).toBe('A');
    expect(campo([lista('A', 10)], c, new Map())).toBe('A');
    expect(c.entradas()).toEqual([]);
  });
  it('etapa fora da lista em competição: dois valores diferentes, um sem posição, campo nulo com contagem e sem o valor', () => {
    for (const etapaSem of [999, null]) {
      for (const p of permutacoes([lista('A', 10), lista('MARCADOR-L9C', etapaSem)])) {
        const c = new Contadores();
        const r = camposEtapa(p, [], dom, FLUXO, c);
        expect(r.motivo_escalacao).toBeNull();
        expect(c.entradas()).toEqual([['etapa_fora_do_fluxo_motivo_escalacao', 1]]);
        expect(JSON.stringify([r, c.entradas()])).not.toContain('MARCADOR-L9C');
      }
    }
  });
  it('empate: valores diferentes na mesma posição (a maior) deixam o campo nulo com contagem; o empate abaixo do topo não atrapalha', () => {
    for (const p of permutacoes([lista('A', 10), lista('B', 30), lista('C', 40)])) {
      const c = new Contadores();
      expect(campo(p, c)).toBeNull();
      expect(c.entradas()).toEqual([['empate_fluxo_motivo_escalacao', 1]]);
    }
    expect(campo([lista('A', 30), lista('B', 40), lista('C', 20)])).toBeNull();
    expect(campo([lista('A', 30), lista('B', 40), lista('C', 50)])).toBe('C');
    expect(campo([lista('C', 50), lista('B', 60)])).toBeNull(); // 50 e 60 têm a mesma posição
  });
  it('mesma posição com o mesmo valor não é empate', () => {
    const c = new Contadores();
    expect(campo([lista('A', 30), lista('A', 40), lista('B', 20)], c)).toBe('A');
    expect(c.entradas()).toEqual([]);
  });
  it('lista de ordem vazia: competição vira nulo com contagem; sem competição o campo segue; a coleta não depende da lista', () => {
    const c = new Contadores();
    expect(campo([lista('A', 10), lista('B', 20)], c, new Map())).toBeNull();
    expect(c.entradas()).toEqual([['etapa_fora_do_fluxo_motivo_escalacao', 1]]);
    expect(campo([lista('A', 10), lista('A', 20), lista(null, 30)], new Contadores(), new Map())).toBe('A');
  });
  it('o vencedor fora do domínio vira nulo com contagem, sem recuar para o valor de posição menor e sem guardar o valor', () => {
    const c = new Contadores();
    expect(campo([lista('A', 10), lista('MARCADOR-L9C', 30)], c)).toBeNull();
    expect(c.entradas()).toEqual([['fora_dominio_motivo_escalacao', 1]]);
  });
  it('a regra vale por campo: um vazio ou competição em outro nome não toca o valor deste', () => {
    const r = camposEtapa([lista('A', 10), lista(null, 20, 'Motivo de Encerramento'), lista('A', 20, 'Motivo de Pendência'), lista('B', 30, 'Motivo de Pendência')], [], dom, FLUXO, new Contadores());
    expect(r).toMatchObject({ motivo_escalacao: 'A', motivo_encerramento: null, motivo_pendencia: null });
  });
  it('as contagens novas cabem no varchar(40) de ctl_coleta_contagem para todos os campos de lista', () => {
    for (const f of CAMPOS_ETAPA_F3.filter((x) => x.tratamento === 'lista')) {
      expect(`etapa_fora_do_fluxo_${f.chave}`.length).toBeLessThanOrEqual(40);
      expect(`empate_fluxo_${f.chave}`.length).toBeLessThanOrEqual(40);
    }
  });
  it('tipo texto em qualquer linha anula o campo, mesmo com posição e valores iguais (regra mantida)', () => {
    const c = new Contadores();
    expect(camposEtapa([lista('A', 10), { ...lista('B', 20), tipo: 'texto' }], [], dom, FLUXO, c).motivo_escalacao).toBeNull();
    expect(c.entradas()).toEqual([['tipo_texto_motivo_escalacao', 1]]);
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
