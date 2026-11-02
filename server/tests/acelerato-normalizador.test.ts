import { describe, expect, it } from 'vitest';
import { Contadores, type RegistroChamado } from '../src/modulos/acelerato/allow-list.js';
import {
  ETAPAS_DA_BIBLIOTECA, etapaDaBiblioteca, instanteDe, naturezaDaCategoria, nivelDeResolucao, normalizarChamado, prioridadeDaEscala, vereditoSla,
  type EtapaTotal,
} from '../src/modulos/acelerato/normalizador.js';

const NATUREZA = new Map<string, 'incidente' | 'requisicao'>([['PFX-R', 'requisicao'], ['PFX-I', 'incidente'], ['PFX-I-GRAVE', 'requisicao']]);
const base = (o: Partial<RegistroChamado> = {}): RegistroChamado => ({
  ticket_key: 7, tipo_ticket: 'TIPO-FICTICIO', status: 'Em Diagnóstico', categoria_key: 31, categoria: 'PFX-I Sistema Alfa', organizacao: 'ORG-FICTICIA', equipe: 'SSSC TOTVS',
  com_agente: true, prioridade: 'P2 - ALTO', data_criacao: '2026-09-01 09:00:00', data_pronto: null, lixeira: false, arquivado: false,
  sla_pa_violado: false, sla_pa_status: 'REALIZADO_NO_PRAZO', sla_r_violado: false, sla_r_status: 'DENTRO_DO_PRAZO', campos: { reincidente_90d: 'nao' }, ...o,
});
const marcas = { ausente: false, fora: false };

describe('CT-40 e CT-41: veredito de SLA (D-2, plano §3.1)', () => {
  it.each([
    ['REALIZADO_NO_PRAZO', false, 'dentro', false],
    ['REALIZADO_NO_PRAZO', true, 'dentro', true],
    ['REALIZADO_APOS_VENCIMENTO', true, 'fora', false],
    ['REALIZADO_APOS_VENCIMENTO', false, 'fora', true],
    ['REALIZADO_APOS_VENCIMENTO', null, 'fora', false],
    ['DENTRO_DO_PRAZO', false, 'dentro', false],
    ['DENTRO_DO_PRAZO', true, 'fora', true],
    ['VENCIDO', true, 'fora', false],
    ['VENCIDO', false, 'dentro', true],
    ['DENTRO_DO_PRAZO', null, null, false],
    ['VENCIDO', null, null, false],
    ['REALIZADO_OUTRA_COISA', null, null, false],
    ['REALIZADO_OUTRA_COISA', true, null, false],
    ['EM_ANDAMENTO', true, 'fora', false],
    [null, true, 'fora', false],
    [null, false, 'dentro', false],
    [null, null, null, false],
  ] as const)('%s com violado %s: veredito %s, divergente %s', (status, violado, veredito, divergente) => {
    expect(vereditoSla(status, violado)).toEqual({ veredito, divergente });
  });
});

describe('CT-43: fuso fixo -03:00 nas viradas', () => {
  it.each([
    ['2026-09-01 09:00:00', '2026-09-01T12:00:00.000Z'],
    ['2026-09-30 23:59:59', '2026-10-01T02:59:59.000Z'],
    ['2026-12-31 00:00:00', '2026-12-31T03:00:00.000Z'],
    ['2026-10-31 21:00:00', '2026-11-01T00:00:00.000Z'],
  ])('%s -> %s', (texto, utc) => { expect(instanteDe(texto)?.toISOString()).toBe(utc); });
  it('nulo e texto que não é data viram nulo', () => {
    expect(instanteDe(null)).toBeNull();
    expect(instanteDe('0000-00-00 00:00:00')).toBeNull();
    expect(instanteDe('ontem')).toBeNull();
  });
});

describe('CT-45 e CT-46: natureza pelo prefixo e prioridade só da escala P', () => {
  it('prefixo mais longo vence; sem prefixo ou sem categoria é nulo', () => {
    expect(naturezaDaCategoria('PFX-I Alfa', NATUREZA)).toBe('incidente');
    expect(naturezaDaCategoria('PFX-R Beta', NATUREZA)).toBe('requisicao');
    expect(naturezaDaCategoria('PFX-I-GRAVE Gama', NATUREZA)).toBe('requisicao');
    expect(naturezaDaCategoria('Outra coisa', NATUREZA)).toBeNull();
    expect(naturezaDaCategoria(null, NATUREZA)).toBeNull();
    expect(naturezaDaCategoria('PFX-I', new Map())).toBeNull();
  });
  it.each([
    ['P1 - CRÍTICO', 'P1'], ['P2 - ALTO', 'P2'], ['P3 - MÉDIO', 'P3'], ['P4 - BAIXO', 'P4'], ['P5 - PLANEJADO/MUITO BAIXO', 'P5'],
    ['P6 - OUTRO', null], ['P1', null], [null, null],
  ])('%s -> %s (escala P como está)', (valor, esperado) => { expect(prioridadeDaEscala(valor)).toBe(esperado); });
  it.each([
    ['URGENTE', 'P1'], ['ALTA', 'P2'], ['MÉDIA', 'P3'], ['NORMAL', 'P4'], ['BAIXA', 'P5'],
  ])('D-12: as quatro famílias, %s = %s', (nivel, esperado) => {
    for (const familia of ['SSSC - INCIDENTE', 'SSSC - REQUISIÇÃO', 'DSPD - INCIDENTE', 'DSPD - REQUISIÇÃO']) {
      expect(prioridadeDaEscala(`${familia} - ${nivel}`)).toBe(esperado);
    }
  });
  it.each([
    ['SSSC - REQUISICAO - NORMAL'], ['SSSC - INCIDENTE - MEDIA'], ['SSSC - INCIDENTE - alta'], ['SSSC - PADRAO'], ['DHO - ALTA'], ['CONTABILIDADE - PADRAO'], [''],
  ])('%s: grafia sem acento, caixa diferente, outra área ou vazio ficam sem prioridade', (valor) => { expect(prioridadeDaEscala(valor)).toBeNull(); });
});

describe('etapas: nome da biblioteca e nível de resolução', () => {
  it('compara sem diferença de caixa, mantém o nome da origem quando não há correspondência', () => {
    expect(etapaDaBiblioteca('Em Atendimento N1')).toBe('Em atendimento N1');
    expect(etapaDaBiblioteca('  PENDENTE ')).toBe('Pendente');
    expect(etapaDaBiblioteca('Aguardando Atribuição')).toBe('Aguardando atribuição');
    expect(etapaDaBiblioteca('Causa Raiz')).toBe('Causa Raiz');
    expect(etapaDaBiblioteca(null)).toBeNull();
    expect(ETAPAS_DA_BIBLIOTECA).toHaveLength(11);
  });
  const e = (descricao: string, tempo: number | null, vezes: number | null): EtapaTotal => ({ descricao, tempo_sla_segundos: tempo, quantidade_vezes: vezes });
  it('vale o nível mais alto por onde o chamado passou (tempo ou passagem), e nulo se nenhum', () => {
    expect(nivelDeResolucao([e('Em Atendimento N1', 60, 1), e('Em Atendimento N3', 10, 1), e('Em Atendimento N2', 5, 1)])).toBe('N3');
    expect(nivelDeResolucao([e('Em Atendimento N1', 60, 1), e('Em Atendimento N2', 0, 0)])).toBe('N1');
    expect(nivelDeResolucao([e('Em Atendimento N2', null, 2)])).toBe('N2');
    expect(nivelDeResolucao([e('Em Atendimento N3', 0, null), e('Pendente', 100, 1)])).toBeNull();
    expect(nivelDeResolucao([])).toBeNull();
  });
});

describe('normalizarChamado', () => {
  it('chamado aberto: sem fechamento, sem veredito de resolução, MTTA não projetado, prioridade da escala P', () => {
    const c = new Contadores();
    const l = normalizarChamado('7', base({ data_primeiro_comentario: '2026-09-01 09:05:00' }), marcas, [], NATUREZA, c);
    expect(l).toMatchObject({
      chamado_id: '7', natureza: 'incidente', equipe: 'SSSC TOTVS', organizacao: 'ORG-FICTICIA', tipo: 'TIPO-FICTICIO', categoria_sistema: 'PFX-I Sistema Alfa',
      categoria_key: 31, excluido: false, status: 'Aberto', etapa: 'Em diagnóstico', prioridade: 'P2', restaurado_em: null, data_finalizado: null,
      status_sla_r: null, status_sla_pa: 'NO_PRAZO', nivel_resolucao: null, arquivado: false, com_agente: true, reincidente_90d: 'nao', fora_do_recorte: false,
    });
    expect(l.aberto_em?.toISOString()).toBe('2026-09-01T12:00:00.000Z');
    expect(l).not.toHaveProperty('primeiro_atendimento_em');
    expect(c.entradas()).toEqual([]);
  });

  it('CT-44: fechado é só data_pronto preenchida; encerrado nunca define', () => {
    const c = new Contadores();
    const fechado = normalizarChamado('7', base({ data_pronto: '2026-09-02 10:00:00', encerrado: false, sla_r_status: 'REALIZADO_APOS_VENCIMENTO', sla_r_violado: true }), marcas,
      [{ descricao: 'Em Atendimento N2', tempo_sla_segundos: 3600, quantidade_vezes: 1 }], NATUREZA, c);
    expect(fechado).toMatchObject({ status: 'Concluído', status_sla_r: 'REALIZADO_APOS_VENCIMENTO', nivel_resolucao: 'N2' });
    expect(fechado.restaurado_em?.toISOString()).toBe('2026-09-02T13:00:00.000Z');
    expect(fechado.data_finalizado?.toISOString()).toBe('2026-09-02T13:00:00.000Z');
    const encerradoSemPronto = normalizarChamado('8', base({ encerrado: true, data_pronto: null }), marcas, [], NATUREZA, c);
    expect(encerradoSemPronto).toMatchObject({ status: 'Aberto', data_finalizado: null });
  });

  it('CT-42: sem agente é contado à parte e continua na projeção; CT-41: divergência e sem veredito contados sem valor', () => {
    const c = new Contadores();
    const l = normalizarChamado('9', base({ com_agente: false, sla_pa_status: 'DENTRO_DO_PRAZO', sla_pa_violado: true, sla_r_status: null, sla_r_violado: null }), marcas, [], NATUREZA, c);
    expect(l.com_agente).toBe(false);
    expect(l.status_sla_pa).toBe('APOS_VENCIMENTO');
    expect(Object.fromEntries(c.entradas())).toEqual({ sem_agente: 1, sla_pa_divergente: 1, sla_r_sem_veredito: 1 });
  });

  it('marcas de saída do recorte viram fora_do_recorte; lixeira vira excluido; arquivado permanece', () => {
    const c = new Contadores();
    expect(normalizarChamado('1', base(), { ausente: true, fora: false }, [], NATUREZA, c).fora_do_recorte).toBe(true);
    expect(normalizarChamado('1', base(), { ausente: false, fora: true }, [], NATUREZA, c).fora_do_recorte).toBe(true);
    const x = normalizarChamado('1', base({ lixeira: true, arquivado: true }), marcas, [], NATUREZA, c);
    expect(x).toMatchObject({ excluido: true, arquivado: true, fora_do_recorte: false });
  });

  it('fora da escala P, sem prefixo de natureza e valores ausentes: nulos contados, nunca inferidos', () => {
    const c = new Contadores();
    const l = normalizarChamado('2', { ticket_key: 2 }, marcas, [], new Map(), c);
    expect(l).toMatchObject({
      natureza: null, prioridade: null, equipe: null, organizacao: null, tipo: null, categoria_sistema: null, categoria_key: null, aberto_em: null, etapa: null,
      com_agente: true, reincidente_90d: null, excluido: false, arquivado: false, status_sla_pa: null,
    });
    expect(Object.fromEntries(c.entradas())).toMatchObject({ natureza_sem_prefixo: 1, prioridade_fora_da_escala_p: 1, sla_pa_sem_veredito: 1, sla_r_sem_veredito: 1 });
  });
});
