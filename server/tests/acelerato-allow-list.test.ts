import { describe, expect, it } from 'vitest';
import {
  Contadores, limpar, registroChamado, registroContagem, registroEtapas, registroSaida, reincidente90d, type ListasRecorte,
} from '../src/modulos/acelerato/allow-list.js';
import { carregarListas } from '../src/modulos/acelerato/referencia.js';
import { expandir, Q1_CHAMADOS, Q3_CAMPOS } from '../src/modulos/acelerato/sql.js';
import { instanteParaTexto, textoParaInstante } from '../src/modulos/acelerato/tempo.js';
import { COLUNAS_DA_LINHA, NOME_CAMPO_90_DIAS } from '../src/modulos/acelerato/listas-fechadas.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { LISTAS_BANCO, linha } from './acelerato-duble.js';
import { criarDublePg } from './duble-pg.js';
import {
  COLUNAS_50, COLUNAS_BARRADAS, DOMINIO_FIXTURE, PROIBIDOS, linhaCompleta, linhaComColunaDesconhecida, linhaForaDoRecorte,
} from './fixtures/acelerato-linha-50-colunas.js';

const D = DOMINIO_FIXTURE;
const LISTAS: ListasRecorte = {
  tipos: new Map([[D.tipoTicketKey, D.tipoTicket]]), organizacoes: new Map([[D.organizacaoKey, D.organizacao]]), equipes: new Map([[D.equipeKey, D.equipe]]),
  etapas: new Set([D.status, 'Aguardando atribuicao']), prioridades: new Set([D.prioridade]),
  categorias: new Set([D.categoria]), workflows: new Set(['Fluxo Ficticio']),
};
/** A linha como a Q1 a devolve: as 35 colunas e `com_agente` (0/1). */
const projetada = (sobre: Record<string, unknown> = {}): Record<string, unknown> => {
  const base = Object.fromEntries(COLUNAS_DA_LINHA.map((c) => [c, c === 'com_agente' ? 1 : (linha() as Record<string, unknown>)[c]]));
  return { ...base, ...sobre };
};
const lido = (sobre: Record<string, unknown> = {}, c = new Contadores()) => registroChamado(projetada(sobre), LISTAS, c);
const erroDe = (f: () => unknown): Record<string, unknown> => {
  try { f(); } catch (e) { return { ...(e as object), message: (e as Error).message }; }
  throw new Error('esperava erro');
};

describe('F-0: guarda da fixture', () => {
  it('as 50 colunas, sem repetição; as 11 barradas dentro delas; PROIBIDOS com pelo menos 30 itens e cada um presente na fixture', () => {
    expect(Object.keys(linhaCompleta())).toEqual(COLUNAS_50);
    expect(new Set(COLUNAS_50).size).toBe(50);
    expect(COLUNAS_BARRADAS).toHaveLength(11);
    for (const b of COLUNAS_BARRADAS) expect(COLUNAS_50).toContain(b);
    expect(PROIBIDOS.length).toBeGreaterThanOrEqual(30);
    // O marcador da coluna desconhecida só existe em `linhaComColunaDesconhecida()` (a 51ª coluna); os demais, em `linhaCompleta()`.
    const json = JSON.stringify([linhaCompleta(), linhaComColunaDesconhecida()]);
    for (const p of PROIBIDOS) expect(json.includes(p), p).toBe(true);
  });
  it('CT-04 (classificação das 50): lidas 35 + 3 json + 1 derivada + 11 barradas', () => {
    const lidas = COLUNAS_DA_LINHA.filter((c) => c !== 'com_agente');
    expect(lidas).toHaveLength(35);
    const json = ['campos_personalizados', 'campos_personalizados_etapa', 'estatisticas'];
    const resto = COLUNAS_50.filter((c) => !lidas.includes(c as never) && !COLUNAS_BARRADAS.includes(c) && !json.includes(c));
    expect(resto).toEqual(['agente_key']);
  });
});

describe('registroChamado (Q1 -> staging)', () => {
  it('monta o payload na ordem da lista fechada, com flags booleanas e DECIMAL como número', () => {
    const c = new Contadores();
    const r = lido({ tempo_vida_dias: '12.500000', lixeira: 1, arquivado: false, com_agente: 0 }, c);
    expect(Object.keys(r.payload)).toEqual([...COLUNAS_DA_LINHA]);
    expect(r.payload).toMatchObject({ tempo_vida_dias: 12.5, lixeira: true, arquivado: false, com_agente: false, status: D.status });
    expect(r.idOrigem).toBe('900000001');
    expect(r.dataAtualizacao).toBe('2026-09-02 10:30:00');
    expect(c.entradas()).toEqual([]);
  });

  it('CT-01: a linha crua de 50 colunas (barradas, json) é recusada inteira, com o NOME da primeira coluna, nunca o valor', () => {
    const e = erroDe(() => registroChamado(linhaCompleta(), LISTAS, new Contadores()));
    expect(e).toMatchObject({ codigo: 'dados-invalidos', entidade: 'chamado', idOrigem: '900000001' });
    expect(JSON.stringify(e)).not.toContain('MARCADOR-056-');
  });

  it('coluna a mais (51ª) falha fechado, citando só o nome', () => {
    const e = erroDe(() => lido({ coluna_nova_do_time: 'MARCADOR-056-COLUNA-DESCONHECIDA' }));
    expect(e).toMatchObject({ codigo: 'dados-invalidos', coluna: 'coluna_nova_do_time' });
    expect(JSON.stringify(e)).not.toContain('MARCADOR-056');
  });

  it('coluna faltando e tipo errado (CT-21) falham fechado sem ecoar o valor', () => {
    const semChave: Record<string, unknown> = projetada();
    delete semChave.ticket_key;
    expect(erroDe(() => registroChamado(semChave, LISTAS, new Contadores()))).toMatchObject({ codigo: 'dados-invalidos', coluna: 'ticket_key' });
    const e = erroDe(() => lido({ status_key: 'MARCADOR-056-TIPO-ERRADO' }));
    expect(e).toMatchObject({ codigo: 'dados-invalidos', coluna: 'status_key' });
    expect(JSON.stringify(e)).not.toContain('MARCADOR');
    expect(erroDe(() => registroChamado(null, LISTAS, new Contadores()))).toMatchObject({ codigo: 'dados-invalidos' });
    expect(erroDe(() => lido({ data_criacao: '02/09/2026' }))).toMatchObject({ coluna: 'data_criacao' });
    expect(erroDe(() => lido({ ticket_key: 0 }))).toMatchObject({ coluna: 'ticket_key' });
  });

  it('status de SLA fora dos 4 valores da origem falha fechado (CHECK do staging)', () => {
    expect(erroDe(() => lido({ sla_r_status: 'Realizado dentro do prazo' }))).toMatchObject({ coluna: 'sla_r_status' });
    for (const v of ['REALIZADO_NO_PRAZO', 'REALIZADO_APOS_VENCIMENTO', 'DENTRO_DO_PRAZO', 'VENCIDO', null]) expect(lido({ sla_pa_status: v }).payload.sla_pa_status).toBe(v);
  });

  it('CT-22: tipo, organização, equipe (ou o nome correspondente), cada um sozinho, fora da lista vigente recusa a linha', () => {
    for (const sobre of [{ tipo_ticket_key: D.tipoTicketKeyFora }, { organizacao_key: D.organizacaoKeyFora }, { equipe_key: D.equipeKeyFora },
      { tipo_ticket: 'Outro' }, { organizacao: 'Outra' }, { equipe: 'Outra' }]) {
      expect(erroDe(() => lido(sobre)), JSON.stringify(sobre)).toMatchObject({ codigo: 'fora-do-recorte', idOrigem: '900000001' });
    }
    const fora = linhaForaDoRecorte();
    expect(fora.ticket_key).toBe(900000002);
  });

  it('CT-05: status, prioridade e categoria só entram por domínio fechado; fora vira nulo com contagem, sem o valor', () => {
    const c = new Contadores();
    const longo = `MARCADOR-056-TEXTO-LIVRE ${'x'.repeat(200)}`;
    const r = lido({ status: longo, prioridade: 'texto livre qualquer', categoria: longo }, c);
    expect(r.payload).toMatchObject({ status: null, prioridade: null, categoria: null });
    expect(c.entradas()).toEqual([['fora_dominio_categoria', 1], ['fora_dominio_prioridade', 1], ['fora_dominio_status', 1]]);
    expect(JSON.stringify(c.entradas())).not.toContain('MARCADOR');
    expect(lido({ status: null, prioridade: null, categoria: null }).payload).toMatchObject({ status: null, categoria: null });
    expect(lido({ categoria: 'a@b.com' }, c).payload.categoria).toBeNull();
    expect(lido({ categoria: 'Maria Souza' }, c).payload.categoria).toBeNull(); // nome curto digitado à mão: não está no domínio (A5)
  });

  it('CT-21: NUL e substituto isolado são limpos antes de chegar ao jsonb', () => {
    expect(limpar('a\u0000b')).toBe('ab');
    expect(limpar('x\uD800y')).toBe('x�y');
    expect(limpar('ok 😀')).toBe('ok 😀');
    expect(lido({ status: `${D.status}\u0000` }).payload.status).toBe(D.status);
  });
});

describe('registroEtapas (Q2)', () => {
  const e = (extra: Record<string, unknown> = {}) => ({ ticket_key: 1, etapa_key: 101, descricao: D.status, descricao_workflow: 'Fluxo Ficticio', tempo_sla: 600, quantidade_vezes: 2, ...extra });

  it('uma linha por etapa; segundos e quantidade gravados; sem instante de entrada ou saída', () => {
    const r = registroEtapas([e(), e({ etapa_key: 102, descricao: 'Aguardando atribuicao', tempo_sla: 0, quantidade_vezes: 0 })], LISTAS, new Contadores());
    expect(r).toEqual([
      { idOrigem: '101', payload: { descricao: D.status, descricao_workflow: 'Fluxo Ficticio', tempo_sla_segundos: 600, quantidade_vezes: 2 } },
      { idOrigem: '102', payload: { descricao: 'Aguardando atribuicao', descricao_workflow: 'Fluxo Ficticio', tempo_sla_segundos: 0, quantidade_vezes: 0 } },
    ]);
  });

  it('etapa sem chave e etapa repetida são descartadas e contadas; descrição fora do domínio vira nula, sem o valor', () => {
    const c = new Contadores();
    const r = registroEtapas([e({ etapa_key: null }), e(), e({ tempo_sla: 5 }), e({ etapa_key: 7, descricao: 'MARCADOR-056-X', descricao_workflow: 'a@b' })], LISTAS, c);
    expect(r.map((x) => x.idOrigem)).toEqual(['101', '7']);
    expect(r[1]!.payload).toMatchObject({ descricao: null, descricao_workflow: null });
    expect(c.entradas()).toEqual([['etapa_repetida', 1], ['etapa_sem_chave', 1], ['fora_dominio_etapa', 1], ['fora_dominio_workflow', 1]]);
    expect(registroEtapas([], LISTAS, c)).toEqual([]);
  });

  it('linha com coluna a mais ou tipo errado falha fechado', () => {
    expect(erroDe(() => registroEtapas([e({ impedimentos: 'MARCADOR-056-EST-IMPEDIMENTO-NOME' })], LISTAS, new Contadores()))).toMatchObject({ codigo: 'dados-invalidos', entidade: 'etapa', coluna: 'impedimentos' });
    expect(erroDe(() => registroEtapas([e({ quantidade_vezes: -1 })], LISTAS, new Contadores()))).toMatchObject({ coluna: 'quantidade_vezes' });
  });
});

describe('reincidente90d (Q3, D-10) e CT-08', () => {
  const c90 = (valor: unknown, nome = NOME_CAMPO_90_DIAS) => ({ ticket_key: 1, nome, valor });

  it('SIM, NÃO e NAO pelo domínio; vazio, nulo e ausente = sem resposta', () => {
    const k = new Contadores();
    expect(reincidente90d([c90('SIM')], k)).toBe('sim');
    expect(reincidente90d([c90('NÃO')], k)).toBe('nao');
    expect(reincidente90d([c90('NAO')], k)).toBe('nao');
    expect(reincidente90d([c90('')], k)).toBe('sem_resposta');
    expect(reincidente90d([c90(null)], k)).toBe('sem_resposta');
    expect(reincidente90d([], k)).toBe('sem_resposta');
    expect(k.entradas()).toEqual([]);
  });

  it('outra grafia, ou nome de propriedade do protótipo, fica fora do domínio: nulo com contagem, sem o valor', () => {
    const k = new Contadores();
    expect(reincidente90d([c90('Sim')], k)).toBeNull();
    expect(reincidente90d([c90('constructor')], k)).toBeNull();
    expect(reincidente90d([c90('MARCADOR-056-CP-TEXTO-INFORME')], k)).toBeNull();
    expect(k.entradas()).toEqual([['campo_90d_fora_dominio', 3]]);
  });

  it('só igualdade exata do nome: espaço final, caixa, prefixo, sufixo e trecho ficam fora e contados', () => {
    const k = new Contadores();
    for (const nome of [`${NOME_CAMPO_90_DIAS} `, NOME_CAMPO_90_DIAS.toLowerCase(), `x ${NOME_CAMPO_90_DIAS}`, `${NOME_CAMPO_90_DIAS} x`, 'últimos 90 dias', 'Cargo', 'Acelerato - Atendente']) {
      expect(reincidente90d([c90('SIM', nome)], k), nome).toBe('sem_resposta');
    }
    expect(k.obter('campo_nome_fora_da_lista')).toBe(7);
  });

  it('o texto da Q3 pede só o nome por igualdade, com valor limitado a 80 caracteres; coluna a mais falha fechado', () => {
    expect(Q3_CAMPOS).toContain('f.nome IN (<nomes>)');
    expect(Q3_CAMPOS).toContain('valor VARCHAR(80)');
    expect(erroDe(() => reincidente90d([{ ticket_key: 1, nome: 'x', valor: 'y', obrigatorio: true }], new Contadores()))).toMatchObject({ codigo: 'dados-invalidos', entidade: 'campo' });
  });
});

describe('saída do recorte, contagem e utilidades', () => {
  it('registroSaida e registroContagem validam o formato e recusam coluna a mais', () => {
    expect(registroSaida({ ticket_key: 5, tipo_ticket_key: 1, organizacao_key: 2, equipe_key: 3, lixeira: 1, data_atualizacao: '2026-09-02 10:30:00' }))
      .toEqual({ idOrigem: '5', tipo: 1, organizacao: 2, equipe: 3 });
    expect(erroDe(() => registroSaida({ ticket_key: 5, titulo: 'MARCADOR-056-TITULO' }))).toMatchObject({ codigo: 'dados-invalidos', entidade: 'saida' });
    expect(registroContagem({ n: 4 })).toBe(4);
    expect(erroDe(() => registroContagem(undefined))).toMatchObject({ codigo: 'dados-invalidos', entidade: 'contagem' });
    expect(erroDe(() => registroContagem({ n: -1 }))).toMatchObject({ coluna: 'n' });
  });

  it('Contadores soma por chave e lista em ordem alfabética', () => {
    const k = new Contadores();
    k.somar('b'); k.somar('a', 2); k.somar('b');
    expect(k.entradas()).toEqual([['a', 2], ['b', 2]]);
    expect(k.obter('c')).toBe(0);
  });

  it('expandir só produz marcadores; recusa lista vazia, grande demais ou sem tamanho', () => {
    const sql = expandir(Q1_CHAMADOS, { tipos: 2, organizacoes: 1, equipes: 3 });
    expect(sql).toContain('tipo_ticket_key IN (?, ?) AND organizacao_key IN (?) AND equipe_key IN (?, ?, ?)');
    expect(sql).not.toMatch(/['"]/);
    expect(() => expandir(Q1_CHAMADOS, { tipos: 0, organizacoes: 1, equipes: 1 })).toThrowError(RangeError);
    expect(() => expandir(Q1_CHAMADOS, { tipos: 5001, organizacoes: 1, equipes: 1 })).toThrowError(RangeError);
    expect(() => expandir(Q1_CHAMADOS, { tipos: 1 })).toThrowError(RangeError);
  });

  it('datas: texto da origem em -03:00 para instante e de volta; viradas de dia e de mês; texto inválido é nulo', () => {
    expect(textoParaInstante('2026-09-01 09:00:00')!.toISOString()).toBe('2026-09-01T12:00:00.000Z');
    expect(textoParaInstante('2026-09-30 23:59:59')!.toISOString()).toBe('2026-10-01T02:59:59.000Z');
    expect(textoParaInstante('2026-09-01 00:00:00')!.toISOString()).toBe('2026-09-01T03:00:00.000Z');
    expect(textoParaInstante('2026-09-01 09:00:00.123456')!.toISOString()).toBe('2026-09-01T12:00:00.123Z');
    expect(instanteParaTexto(new Date('2026-10-01T02:59:59Z'))).toBe('2026-09-30 23:59:59');
    expect(textoParaInstante('0000-00-00 00:00:00')).toBeNull();
    expect(textoParaInstante('ontem')).toBeNull();
  });
});

describe('referência (ref_dominio)', () => {
  const S = montarEsquemas('');
  it('lê as listas vigentes: chave numérica e rótulo para o recorte; código e rótulo para os vocabulários', async () => {
    const { pool, chamadas } = criarDublePg(() => LISTAS_BANCO);
    const l = await carregarListas(pool, S);
    expect(l.tipos.get(D.tipoTicketKey)).toBe(D.tipoTicket);
    expect(l.organizacoes.size).toBe(1);
    expect(l.etapas.has(D.status)).toBe(true);
    expect(l.prioridades.has(D.prioridade)).toBe(true);
    expect(l.categorias.has(D.categoria)).toBe(true);
    expect(l.workflows.has('Fluxo Ficticio')).toBe(true);
    expect(chamadas[0]!.texto).toContain('vigente_ate IS NULL');
    expect(chamadas[0]!.texto).toContain('dspd_ac.ref_dominio');
  });
  it('lista de recorte vazia ou chave que não é número: recusa, citando só o campo', async () => {
    for (const campo of ['tipo_recorte', 'organizacao_recorte', 'equipe']) {
      const { pool } = criarDublePg(() => LISTAS_BANCO.filter((x) => x.campo !== campo));
      await expect(carregarListas(pool, S)).rejects.toMatchObject({ codigo: 'listas-vazias', coluna: campo });
    }
    const { pool } = criarDublePg(() => [{ campo: 'equipe', codigo: 'SSSC TOTVS', rotulo: 'x' }]);
    await expect(carregarListas(pool, S)).rejects.toMatchObject({ codigo: 'dados-invalidos', coluna: 'equipe' });
  });
});
