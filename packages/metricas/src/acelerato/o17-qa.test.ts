import { describe, expect, it } from 'vitest'
import { CALENDARIO_PADRAO, instanteDeIso as t } from '../core/calendario'
import { ALVOS_PADRAO, calcularO17, criarContextoAC, type BaseAC, type Chamado } from './index'

// QA do O17 por sistema (pedido 099, B' da Q-099-7): a definição de "incidente encerrado no período" e a ordem neutra por
// sistema, com os números fixados à mão (nunca derivados da própria função). Falha se o filtro de natureza, o de encerrado,
// o de período ou a ordem (contagem decrescente, desempate por nome) mudarem.
const HOJE = '2026-10-09T18:00:00-03:00'
const F = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } }
const iso = (s: string) => t(s, CALENDARIO_PADRAO)

function chamado(i: number, sistema: string, extra: Partial<Chamado> = {}): Chamado {
  return {
    chamado_id: `Q${i}`,
    organizacao: 'DSPD Sustentação',
    tipo_fila: 'DSPD - SSSC',
    equipe: 'SSSC TOTVS',
    natureza: 'incidente',
    categoria_sistema: sistema,
    excluido: false,
    status: 'Concluído',
    impacto: 'Alto',
    urgencia: 'Baixa',
    prioridade: 'P3',
    prioridade_ajustada_manualmente: false,
    justificativa_ajuste: null,
    aberto_em: iso('2026-09-14T09:00-03:00'),
    primeiro_atendimento_em: iso('2026-09-14T10:00-03:00'),
    restaurado_em: iso('2026-09-15T10:00-03:00'),
    data_finalizado: iso('2026-09-15T10:00-03:00'),
    status_sla_r: 'REALIZADO_NO_PRAZO',
    status_sla_pa: 'NO_PRAZO',
    motivo_escalacao: null,
    motivo_pendencia_atual: null,
    previsao_retorno: null,
    motivo_encerramento: 'Resolução definitiva',
    avaliacao_problema: null,
    excecao_sla_registro_posterior: false,
    incidente_critico_coordenado: false,
    nivel_resolucao: 'N1',
    ...extra,
  }
}

function contexto(chamados: Chamado[]) {
  const base: BaseAC = { chamados, etapas: [], config: { alvos: ALVOS_PADRAO, criterios: [] } }
  return criarContextoAC(base, HOJE, CALENDARIO_PADRAO)
}

describe('O17 por sistema: definição e ordem (QA 099)', () => {
  const lista: Chamado[] = []
  let i = 0
  const mais = (n: number, sistema: string, extra: Partial<Chamado> = {}) => {
    for (let k = 0; k < n; k++) lista.push(chamado(i++, sistema, extra))
  }
  // contam: Protheus 5, Fluig 5 (empate: desempate por nome, Fluig antes), Senior 3 = 13
  mais(5, 'Protheus - Compras')
  mais(5, 'Fluig - Portal')
  mais(3, 'Senior - Folha')
  // não contam: requisição, em aberto, excluído, encerrado fora da janela de 12 semanas
  mais(4, 'Protheus - Compras', { natureza: 'requisicao' })
  mais(2, 'Senior - Folha', { status: 'Aberto', data_finalizado: null, restaurado_em: null })
  mais(1, 'Senior - Folha', { status: 'Aberto' }) // reaberto: data de finalização antiga, status não concluído
  mais(1, 'Senior - Folha', { excluido: true })
  mais(2, 'Fluig - Portal', { data_finalizado: iso('2026-01-12T10:00-03:00') })

  const r = calcularO17(contexto(lista), F)

  it('só incidentes encerrados, não excluídos, dentro do período', () => {
    expect(r.base.n).toBe(13)
    expect(r.porSistema.reduce((s, x) => s + x.n, 0)).toBe(13)
  })

  it('ordem neutra: contagem decrescente e desempate por nome do sistema', () => {
    expect(r.porSistema).toEqual([
      { sistema: 'Fluig - Portal', n: 5 },
      { sistema: 'Protheus - Compras', n: 5 },
      { sistema: 'Senior - Folha', n: 3 },
    ])
  })

  it('sem extensão (base real): causa raiz nula com o motivo, nunca lista vazia nem "Não informada"', () => {
    expect(r.porCausa).toBeNull()
    expect(r.campoDisponivel).toBe(false)
    expect(r.motivoCausaRaiz).toContain('causa aparente')
  })

  it('período sem incidentes: base 0 e por sistema vazio, sem erro', () => {
    const vazio = calcularO17(
      contexto([chamado(900, 'Fluig - Portal', { natureza: 'requisicao' })]),
      F,
    )
    expect(vazio.base.n).toBe(0)
    expect(vazio.porSistema).toEqual([])
  })
})
