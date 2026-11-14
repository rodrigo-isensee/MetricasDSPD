import { readFileSync } from 'node:fs';
import { acelerato } from '@metricas-dspd/metricas';
import { describe, expect, it } from 'vitest';
import { unidadeDeExibicao } from '../src/modulos/referencia/alvos-acelerato.js';
import { lerArquivoAlvos, lerCalendario, lerTurnosVigentes } from '../src/modulos/referencia/index.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg } from './duble-pg.js';

// Pedido 099, D3b (Decisão 13): o dia útil da Sustentação de 528 min. Paridade entre os arquivos versionados e a biblioteca, e a leitura dos turnos.
const S = montarEsquemas();
const minutos = (hhmm: string): number => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

describe('paridade do dia útil da Sustentação (arquivos x biblioteca)', () => {
  it('calendario.json (turnos do dspd-acelerato) é igual a TURNOS_SUSTENTACAO, soma 528 min, e o BusinessMap não tem turnos', () => {
    const { arquivo } = lerCalendario();
    const ac = arquivo.calendarios.find((c) => c.nome === 'dspd-acelerato')!;
    expect(ac.turnos!.map((t) => ({ inicioMin: minutos(t.inicio), fimMin: minutos(t.fim) }))).toEqual(acelerato.TURNOS_SUSTENTACAO);
    expect(acelerato.CALENDARIO_SUSTENTACAO_PADRAO.horasPorDia).toBe(8.8);
    expect(acelerato.TURNOS_SUSTENTACAO.reduce((n, t) => n + t.fimMin - t.inicioMin, 0)).toBe(528);
    expect(arquivo.calendarios.find((c) => c.nome === 'dspd-businessmap')!.turnos).toBeUndefined();
  });
  it('K-308: feriados e deslocamento do dspd-acelerato em calendario.json são iguais aos do CALENDARIO_SUSTENTACAO_PADRAO (a montagem D-7 usa este)', () => {
    const { arquivo } = lerCalendario();
    const ac = arquivo.calendarios.find((c) => c.nome === 'dspd-acelerato')!;
    expect(ac.feriados.map((f) => f.data).sort()).toEqual([...acelerato.CALENDARIO_SUSTENTACAO_PADRAO.feriados].sort());
    expect(ac.offset_minutos).toBe(acelerato.CALENDARIO_SUSTENTACAO_PADRAO.offsetMinutos);
  });
  it('acelerato-alvos.json é igual a ALVOS_PADRAO (horas, relógio e unidade de exibição) e horas_por_dia_util é o dia do calendário', () => {
    const { arquivo } = lerArquivoAlvos();
    expect(arquivo.horas_por_dia_util).toBe(acelerato.CALENDARIO_SUSTENTACAO_PADRAO.horasPorDia);
    expect(arquivo.alvos.map((a) => ({
      prioridade: a.prioridade, primeiro_atendimento_horas: a.primeiro_atendimento.horas, unidade_primeiro_atendimento: a.primeiro_atendimento.unidade,
      restauracao_horas: a.restauracao.horas, unidade_restauracao: a.restauracao.unidade,
      // K-314: a unidade de exibição que o carregador deriva do texto do PROC; o mock nunca diverge do arquivo
      exibir_primeiro_atendimento: unidadeDeExibicao(a.primeiro_atendimento.texto_proc, a.primeiro_atendimento.horas, arquivo.horas_por_dia_util, a.primeiro_atendimento.unidade),
      exibir_restauracao: unidadeDeExibicao(a.restauracao.texto_proc, a.restauracao.horas, arquivo.horas_por_dia_util, a.restauracao.unidade),
    }))).toEqual(acelerato.ALVOS_PADRAO);
  });
  it('todo prazo util escrito em dias é dias x 8,8 (tabela fixa); os escritos em horas ficam como no PROC', () => {
    const porDias: Record<string, number> = { 'Até 2 dias úteis': 17.6, 'Até 5 dias úteis': 44, 'Até 1 dia útil': 8.8, 'Até 10 dias úteis': 88 };
    const { arquivo } = lerArquivoAlvos();
    for (const a of arquivo.alvos) for (const c of [a.primeiro_atendimento, a.restauracao]) {
      if (/dia/.test(c.texto_proc)) expect(c.horas, c.texto_proc).toBe(porDias[c.texto_proc]);
      else if (c.unidade === 'util') expect([2, 4, 8]).toContain(c.horas);
    }
  });
  it('o arquivo de alvos cita a Decisão 13 e o de calendário cobre a jornada na versão de critério', () => {
    expect(readFileSync(new URL('../../docs/architecture/fontes/calendario.json', import.meta.url), 'utf8')).toContain('Decisão 13');
  });
});

describe('lerTurnosVigentes', () => {
  const linhas = (dias: number[], fatias: [number, number][]) => dias.flatMap((d) => fatias.map(([i, f]) => ({ dia_semana: d, inicio_min: i, fim_min: f })));
  const ler = (rows: unknown[]) => lerTurnosVigentes(criarDublePg(() => rows).pool, S, 'acelerato', 'sustentacao');

  it('sem turnos gravados devolve lista vazia (quem chama usa o padrão do domínio)', async () => {
    expect(await ler([])).toEqual([]);
  });
  it('turnos iguais de segunda a sexta: devolve uma lista só, em minutos', async () => {
    expect(await ler(linhas([1, 2, 3, 4, 5], [[480, 720], [780, 1068]]))).toEqual([{ inicioMin: 480, fimMin: 720 }, { inicioMin: 780, fimMin: 1068 }]);
  });
  it('sem esquemas explícitos usa os do ambiente', async () => {
    const d = criarDublePg(() => []);
    await lerTurnosVigentes(d.pool, undefined, 'acelerato', 'sustentacao');
    expect(d.chamadas[0]!.texto).toContain('.ref_calendario_turno');
  });
  it('lê só os vigentes da aplicação vigente do domínio e da classe pedidos, por parâmetro', async () => {
    const d = criarDublePg(() => []);
    await lerTurnosVigentes(d.pool, S, 'acelerato', 'sustentacao');
    expect(d.chamadas[0]!.valores).toEqual(['acelerato', 'sustentacao']);
    expect(d.chamadas[0]!.texto).toMatch(/t\.vigente_ate IS NULL/);
    expect(d.chamadas[0]!.texto).toMatch(/a\.vigente_ate IS NULL/);
  });
  it('recusa turnos diferentes entre os dias, dia faltando e turno em fim de semana', async () => {
    await expect(ler([...linhas([1, 2, 3, 4], [[480, 720]]), ...linhas([5], [[480, 700]])])).rejects.toThrow(/não são iguais/);
    await expect(ler(linhas([1, 2, 3, 4], [[480, 720]]))).rejects.toThrow(/não são iguais/);
    await expect(ler(linhas([0, 1, 2, 3, 4, 5], [[480, 720]]))).rejects.toThrow(/dia 0/);
    await expect(ler(linhas([1, 2, 3, 4, 5, 6], [[480, 720]]))).rejects.toThrow(/dia 6/);
  });
});
