import { describe, expect, it } from 'vitest';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { Contadores, registroChamado, registroEtapas } from '../src/modulos/acelerato/allow-list.js';
import { COLUNAS_DA_LINHA } from '../src/modulos/acelerato/listas-fechadas.js';
import { naturezaDaCategoria, prioridadeDaEscala } from '../src/modulos/acelerato/normalizador.js';
import { carregarNaturezaPorPrefixo } from '../src/modulos/acelerato/projetor.js';
import { carregarListas } from '../src/modulos/acelerato/referencia.js';
import { lerDominio } from '../src/modulos/referencia/dominio-acelerato.js';
import { LISTAS_BANCO, linha } from './acelerato-duble.js';
import { criarDublePg } from './duble-pg.js';

/**
 * E4.42 (K-190, causa da E4.39): os valores REAIS da carga de 2026-11-01 (consulta só leitura E4.40; só nomes de domínio, nenhuma linha de
 * chamado nem dado de pessoa) casam com as listas do arquivo versionado, passando pela mesma leitura e pela mesma allow-list da coleta.
 */
const S = montarEsquemas('');
const dominios = lerDominio().arquivo.dominios;
const doArquivo = (campo: 'etapa' | 'prioridade' | 'categoria' | 'descricao_workflow' | 'natureza_prefixo'): { campo: string; codigo: string; rotulo: string }[] =>
  (dominios[campo] ?? []).map((i) => ({ campo, ...i }));
const RECORTE = LISTAS_BANCO.filter((x) => ['tipo_recorte', 'organizacao_recorte', 'equipe'].includes(x.campo));

/** Nomes distintos de `status` da E4.40 (o nome se repete por workflow, com várias chaves). */
const STATUS_REAIS = [
  'Concluído', 'Causa Raiz', 'Novo',
  'Encerrado', 'Novo Atendimento', 'Pendente',
  'Aguardando Solicitante', 'Aguardando Suporte Terceiros', 'Data Acordada',
  'Backlog', 'Em Análise', 'Retorno',
  'Em Atendimento N3', 'Aguardando Validação', 'Em Diagnóstico',
  'Em triagem', 'Em Definição de Solução', 'Em Atendimento N2',
  'Nova Demanda', 'Em Classificação', 'Encerramento',
  'Aguardando Equipe Interna',
];
/** Nomes distintos de etapa (`estatisticas.workflow.etapas[].descricao`) da E4.40: 79 pares de chave e nome. */
const ETAPAS_REAIS = [
  'Novo Atendimento', 'Concluído', 'Encerramento',
  'Backlog', 'Em Análise', 'Aguardando Solicitante',
  'Retorno', 'Aguardando Suporte Terceiros', 'Aguardando Equipe Interna',
  'Data Acordada', 'Revisão', 'Causa Raiz',
  'Em Andamento', 'Novo', 'Em triagem',
  'Encerrado', 'Aguardando Validação', 'Pendente',
  'Em Diagnóstico', 'Em Atendimento N1', 'Em Atendimento N3',
  'Aguardando Aprovação', 'Em Classificação', 'Aguardando Atribuição',
  'Encaminhar para Desenvolvimento', 'Em Atendimento N2', 'Aguardando Validação de Prioridade',
  'Encaminhar para Projeto', 'Em Investigação', 'Em Definição de Solução',
  'Aguardando Mudança', 'Em Verificação de Efetividade', 'Em Planejamento',
  'Novo Mudança', 'Aguardando Fornecedor', 'Em Validação',
  'Em Avaliação de Escalação', 'Nova Demanda', 'Em Aprovação',
  'Aguardando Janela de Mudança (Deploy Produção)', 'Solicitar RDM', 'Testes Integrados (Usuários)',
  'Pronto para Desenvolver', 'Planejamento',
];
/** Prioridades da E4.40, sem as 29 nulas. */
const PRIORIDADES_REAIS = [
  'SSSC - REQUISIÇÃO - NORMAL', 'SSSC - INCIDENTE - NORMAL', 'DSPD - INCIDENTE - NORMAL',
  'DSPD - REQUISIÇÃO - NORMAL', 'SSSC - REQUISIÇÃO - BAIXA', 'SSSC - INCIDENTE - BAIXA',
  'P4 - BAIXO', 'P2 - ALTO', 'DSPD - REQUISIÇÃO - BAIXA',
  'SSSC - INCIDENTE - ALTA', 'P3 - MÉDIO', 'SSSC - INCIDENTE - MÉDIA',
  'SSSC - REQUISIÇÃO - MÉDIA', 'SSSC - INCIDENTE - URGENTE', 'DSPD - INCIDENTE - BAIXA',
  'SSSC - REQUISIÇÃO - ALTA', 'P1 - CRÍTICO', 'P5 - PLANEJADO/MUITO BAIXO',
  'DSPD - INCIDENTE - ALTA', 'DSPD - REQUISIÇÃO - ALTA', 'DSPD - INCIDENTE - MÉDIA',
  'SSSC - REQUISIÇÃO - URGENTE', 'DSPD - REQUISIÇÃO - MÉDIA',
];

async function listasDoArquivo() {
  const { pool } = criarDublePg(() => [...RECORTE, ...doArquivo('etapa'), ...doArquivo('prioridade'), ...doArquivo('categoria'), ...doArquivo('descricao_workflow')]);
  return carregarListas(pool, S);
}
const projetada = (sobre: Record<string, unknown>): Record<string, unknown> => ({
  ...Object.fromEntries(COLUNAS_DA_LINHA.map((c) => [c, c === 'com_agente' ? 1 : (linha() as Record<string, unknown>)[c]])),
  status: 'Novo Atendimento', prioridade: 'P2 - ALTO', categoria: dominios.categoria![0]!.rotulo, ...sobre,
});

describe('E4.42: o arquivo de domínio traz etapa, prioridade e natureza_prefixo', () => {
  it('os três campos existem e não estão vazios (a ausência deles foi a causa da E4.39)', () => {
    for (const campo of ['etapa', 'prioridade', 'natureza_prefixo'] as const) expect(dominios[campo]?.length ?? 0, campo).toBeGreaterThan(0);
  });
  it('etapa: os 44 nomes distintos reais, nome exato em código e rótulo (status e etapa partilham o vocabulário)', () => {
    expect(STATUS_REAIS.every((s) => ETAPAS_REAIS.includes(s))).toBe(true);
    expect(ETAPAS_REAIS).toHaveLength(44);
    expect(dominios.etapa!.map((i) => i.codigo)).toEqual(ETAPAS_REAIS);
    expect(dominios.etapa!.every((i) => i.codigo === i.rotulo)).toBe(true);
  });
  it('prioridade: os 23 nomes reais, nome exato em código e rótulo', () => {
    expect(PRIORIDADES_REAIS).toHaveLength(23);
    expect([...dominios.prioridade!.map((i) => i.codigo)].sort()).toEqual([...PRIORIDADES_REAIS].sort());
    expect(dominios.prioridade!.every((i) => i.codigo === i.rotulo)).toBe(true);
  });
  it('natureza_prefixo (decisão c): SSSC-I e SSSC-R, com hífen ou com espaço; mais nada', () => {
    expect(dominios.natureza_prefixo).toEqual([
      { codigo: 'SSSC-I-', rotulo: 'incidente' }, { codigo: 'SSSC-I ', rotulo: 'incidente' },
      { codigo: 'SSSC-R-', rotulo: 'requisicao' }, { codigo: 'SSSC-R ', rotulo: 'requisicao' },
    ]);
  });
  it('recorte (decisão b): só a organização 3', () => {
    expect(dominios.organizacao_recorte).toHaveLength(1);
    expect(dominios.organizacao_recorte![0]!.codigo).toBe('3');
  });
  it('a versão de critério (T2.6) cita a correção e a data', () => {
    const v = lerDominio().arquivo.versao_criterio;
    expect(v.motivo).toContain('2026-11-01');
    expect(v.motivo).toContain('E4.42');
  });
});

describe('E4.42: os valores reais casam pela allow-list, sem cair fora do domínio', () => {
  it('todo status real passa (nada anulado, nenhuma contagem)', async () => {
    const listas = await listasDoArquivo();
    for (const status of STATUS_REAIS) {
      const c = new Contadores();
      expect(registroChamado(projetada({ status }), listas, c).payload.status, status).toBe(status);
      expect(c.entradas()).toEqual([]);
    }
  });
  it('toda prioridade real passa', async () => {
    const listas = await listasDoArquivo();
    for (const prioridade of PRIORIDADES_REAIS) {
      const c = new Contadores();
      expect(registroChamado(projetada({ prioridade }), listas, c).payload.prioridade, prioridade).toBe(prioridade);
      expect(c.entradas()).toEqual([]);
    }
  });
  it('toda etapa real passa e o fora do domínio continua contado, sem o valor', async () => {
    const listas = await listasDoArquivo();
    for (const descricao of ETAPAS_REAIS) {
      const c = new Contadores();
      const [e] = registroEtapas([{ ticket_key: 1, etapa_key: 5, descricao, descricao_workflow: null, tempo_sla: 0, quantidade_vezes: 1 }], listas, c);
      expect(e!.payload.descricao, descricao).toBe(descricao);
      expect(c.entradas()).toEqual([]);
    }
    const c = new Contadores();
    const [fora] = registroEtapas([{ ticket_key: 1, etapa_key: 6, descricao: 'Etapa Inexistente', descricao_workflow: null, tempo_sla: 0, quantidade_vezes: 1 }], listas, c);
    expect(fora!.payload.descricao).toBeNull();
    expect(c.entradas()).toEqual([['fora_dominio_etapa', 1]]);
  });
  it('a caixa e o acento não são normalizados: grafia diferente cai fora e é contada', async () => {
    const listas = await listasDoArquivo();
    const c = new Contadores();
    expect(registroChamado(projetada({ status: 'CONCLUIDO', prioridade: 'ssscs - incidente - alta' }), listas, c).payload.status).toBeNull();
    expect(c.obter('fora_dominio_status')).toBe(1);
    expect(c.obter('fora_dominio_prioridade')).toBe(1);
  });
});

describe('E4.42: natureza pelo prefixo da categoria real e prioridade pela escala P (D-12)', () => {
  it('toda categoria do arquivo que começa por SSSC-I é incidente, SSSC-R é requisição, e as demais (SSSC-P, SSSC-CFG, Outros) ficam sem natureza', async () => {
    const { pool } = criarDublePg(() => doArquivo('natureza_prefixo'));
    const mapa = await carregarNaturezaPorPrefixo(pool, S);
    const categorias = dominios.categoria!.map((i) => i.rotulo);
    let incidentes = 0;
    let requisicoes = 0;
    for (const categoria of categorias) {
      const esperado = categoria.startsWith('SSSC-I') ? 'incidente' : categoria.startsWith('SSSC-R') ? 'requisicao' : null;
      expect(naturezaDaCategoria(categoria, mapa), categoria).toBe(esperado);
      if (esperado === 'incidente') incidentes++;
      if (esperado === 'requisicao') requisicoes++;
    }
    expect(incidentes).toBeGreaterThan(0);
    expect(requisicoes).toBeGreaterThan(0);
  });
  it('prefixos reais com hífen e com espaço', async () => {
    const { pool } = criarDublePg(() => doArquivo('natureza_prefixo'));
    const mapa = await carregarNaturezaPorPrefixo(pool, S);
    expect(naturezaDaCategoria('SSSC-I- Fiscal', mapa)).toBe('incidente');
    expect(naturezaDaCategoria('SSSC-I Fiscal', mapa)).toBe('incidente');
    expect(naturezaDaCategoria('SSSC-R-PROTHEUS-DUVIDA', mapa)).toBe('requisicao');
    expect(naturezaDaCategoria('SSSC-R – GMUD', mapa)).toBe('requisicao');
    for (const sem of ['SSSC-P-Alguma', 'PEQUENAS MELHORIAS', 'TESTADE', 'Outros']) expect(naturezaDaCategoria(sem, mapa), sem).toBeNull();
  });
  it('toda prioridade real das quatro famílias e da escala P vira P1 a P5; vazio e outras áreas, nada', () => {
    const mapeadas = PRIORIDADES_REAIS.filter((p) => prioridadeDaEscala(p) !== null);
    expect(mapeadas).toHaveLength(PRIORIDADES_REAIS.length);
    expect(prioridadeDaEscala('SSSC - INCIDENTE - URGENTE')).toBe('P1');
    expect(prioridadeDaEscala('DSPD - REQUISIÇÃO - MÉDIA')).toBe('P3');
    expect(prioridadeDaEscala(null)).toBeNull();
    expect(prioridadeDaEscala('DHO - ALTA')).toBeNull();
  });
});

describe('E4.42: vocabulário vazio falha em vez de anular em silêncio', () => {
  it.each(['etapa', 'prioridade', 'categoria', 'descricao_workflow'])('%s vazio em ref_dominio: a coleta não começa (listas-vazias, só o nome do campo)', async (campo) => {
    const linhas = [...RECORTE, ...doArquivo('etapa'), ...doArquivo('prioridade'), ...doArquivo('categoria'), ...doArquivo('descricao_workflow')].filter((x) => x.campo !== campo);
    const { pool } = criarDublePg(() => linhas);
    await expect(carregarListas(pool, S)).rejects.toMatchObject({ codigo: 'listas-vazias', coluna: campo });
  });
  it('natureza_prefixo vazio (ou só com rótulo desconhecido): a projeção não começa', async () => {
    for (const linhas of [[], [{ campo: 'natureza_prefixo', codigo: 'SSSC-I-', rotulo: 'outro' }]]) {
      const { pool } = criarDublePg(() => linhas);
      await expect(carregarNaturezaPorPrefixo(pool, S)).rejects.toMatchObject({ codigo: 'listas-vazias', coluna: 'natureza_prefixo' });
    }
  });
});
