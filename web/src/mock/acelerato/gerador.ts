import type {
  EquipeSustentacao,
  MotivoEncerramento,
  MotivoEscalacao,
  NivelResolucao,
  Prioridade,
} from '@/contracts/comum'
import { MOTIVOS_ENCERRAMENTO, MOTIVOS_ESCALACAO } from '@/contracts/comum'
import {
  CALENDARIO_PADRAO as cal,
  diaLocal,
  ehDiaUtil,
  instanteDe,
  instanteDeIso,
  isoDeDia,
  somarHorasUteis,
  somarMeses,
} from '@/lib/metrics/core'
import {
  ALVOS_PADRAO,
  MATRIZ_PRIORIDADE,
  type BaseAC,
  type Chamado,
  type EtapaAcelerato,
  type EtapaChamado,
  type MotivoPendencia,
} from '@/lib/metrics/acelerato/modelo'
import type { ConfigMock } from '../config'
import { bernoulli, escolha, escolhaPonderada, inteiro, lognormal, poisson } from '../distribuicoes'
import { derivar } from '../prng'
import { CRITERIOS_MOCK } from '../criterios'
import { CATEGORIAS, EQUIPES_SUST, MEDIANA_PA, MEDIANA_R, PARES_POR_PRIORIDADE } from './catalogos'

const hU = (t: number, h: number): number => Math.round(somarHorasUteis(t, Math.max(h, 0.01), cal))

interface Seg {
  etapa: EtapaAcelerato
  /** horas úteis de duração (relógio de SLA corre, salvo `pausa`). */
  horas: number
  pausa?: boolean
  motivo?: MotivoPendencia
}

export function gerarBaseAcelerato(cfg: ConfigMock): BaseAC {
  const hoje = instanteDeIso(cfg.hoje, cal)
  const hojeDia = diaLocal(hoje, cal)
  const diaIni = somarMeses(hojeDia, -cfg.mesesHistorico)
  const rng = derivar(cfg.semente, 'acelerato')
  const chamados: Chamado[] = []
  const etapas: EtapaChamado[] = []

  const dias: number[] = []
  for (let d = diaIni; d <= hojeDia; d++) if (ehDiaUtil(d, cal)) dias.push(d)
  const lambda = (6000 * cfg.escala) / dias.length
  let seq = 0

  for (const d of dias) {
    const mes = isoDeDia(d).slice(0, 7)
    const sazonal = mes === '2026-06' ? 1.1 : 1
    const n = poisson(rng, lambda * sazonal)
    for (let i = 0; i < n; i++) {
      const aberto = instanteDe(d, 7 * 60 + 30 + inteiro(rng, 0, 10 * 60), cal)
      if (aberto > hoje) continue
      const spike = mes === '2026-06'
      const prioridade = escolhaPonderada(rng, [
        ['P1', spike ? 4 : 1],
        ['P2', spike ? 22 : 6],
        ['P3', 30],
        ['P4', 43],
        ['P5', 20],
      ] as const) as Prioridade
      const [impacto, urgencia] = escolha(rng, PARES_POR_PRIORIDADE[prioridade])
      let prio = MATRIZ_PRIORIDADE[impacto][urgencia]
      const ajustada = bernoulli(rng, 0.04)
      if (ajustada) {
        const idx = Number(prio.slice(1))
        prio =
          `P${Math.min(5, Math.max(1, idx + (idx === 1 ? 1 : idx === 5 ? -1 : bernoulli(rng, 0.5) ? 1 : -1)))}` as Prioridade
      }
      const equipe = escolhaPonderada(rng, EQUIPES_SUST) as EquipeSustentacao
      const id = `CH-${String(++seq).padStart(5, '0')}`

      // --- relógio de SLA e etapas ---
      const a = lognormal(rng, MEDIANA_PA[prio] ?? 1, 0.8)
      const R = Math.max(a * 1.3, lognormal(rng, MEDIANA_R[prio] ?? 10, 0.8))
      const rest = R - a
      const nivel = escolhaPonderada(rng, [
        ['N1', 52],
        ['N2', 30],
        ['N3', 9],
        ['Fornecedor', 9],
      ] as const) as NivelResolucao
      const segs: Seg[] = [
        { etapa: 'Novo', horas: a * 0.3 },
        { etapa: 'Em triagem', horas: a * 0.7 },
        { etapa: 'Em diagnóstico', horas: rest * 0.12 },
      ]
      let escalacao: MotivoEscalacao | null = null
      const pendExtra = bernoulli(rng, 0.25)
      const pend = (m?: MotivoPendencia): Seg => ({
        etapa: 'Pendente',
        horas: lognormal(rng, 14, 0.8),
        pausa: true,
        motivo:
          m ??
          (escolhaPonderada(rng, [
            ['Aguardando fornecedor', 20],
            ['Aguardando solicitante', 45],
            ['Aguardando área vinculada', 20],
            ['Aguardando janela de mudança', 15],
          ] as const) as MotivoPendencia),
      })
      if (nivel === 'N1') {
        segs.push({ etapa: 'Em atendimento N1', horas: rest * 0.88 })
        if (pendExtra) segs.splice(3, 0, pend())
      } else {
        escalacao = escolhaPonderada(rng, [
          [MOTIVOS_ESCALACAO[0], 35],
          [MOTIVOS_ESCALACAO[1], 22],
          [MOTIVOS_ESCALACAO[2], 12],
          [MOTIVOS_ESCALACAO[3], 16],
          [MOTIVOS_ESCALACAO[4], 15],
        ] as const)
        segs.push({ etapa: 'Em atendimento N1', horas: rest * 0.25 })
        segs.push({ etapa: 'Aguardando atribuição', horas: rest * 0.06 })
        if (nivel === 'N2') segs.push({ etapa: 'Em atendimento N2', horas: rest * 0.57 })
        else if (nivel === 'N3') {
          segs.push({ etapa: 'Em atendimento N2', horas: rest * 0.2 })
          segs.push({ etapa: 'Em atendimento N3', horas: rest * 0.37 })
        } else {
          segs.push({ etapa: 'Em atendimento N2', horas: rest * 0.2 })
          segs.push(pend('Aguardando fornecedor'))
          segs.push({ etapa: 'Em atendimento N2', horas: rest * 0.37 })
        }
        if (pendExtra && nivel !== 'Fornecedor') segs.splice(4, 0, pend())
      }
      segs.push({ etapa: 'Aguardando validação', horas: lognormal(rng, 5, 0.9), pausa: true })

      // linha do tempo (calendário útil)
      const tl: {
        etapa: EtapaAcelerato
        entrada: number
        saida: number | null
        motivo: MotivoPendencia | null
      }[] = []
      let t = aberto
      let paEm: number | null = null
      for (const s of segs) {
        const fim = hU(t, s.horas)
        if (s.etapa === 'Em diagnóstico') paEm = t
        tl.push({ etapa: s.etapa, entrada: t, saida: fim, motivo: s.motivo ?? null })
        t = fim
      }
      const encerrado = t
      tl.push({ etapa: 'Encerrado', entrada: encerrado, saida: null, motivo: null })

      const fechado = encerrado <= hoje
      const registrados = tl.filter((x) => x.entrada <= hoje)
      for (const x of registrados) {
        etapas.push({
          chamado_id: id,
          etapa: x.etapa,
          entrada: x.entrada,
          saida: x.saida !== null && x.saida <= hoje ? x.saida : null,
          motivo_pendencia: x.motivo,
        })
      }
      const pa = paEm !== null && paEm <= hoje ? paEm : null
      const alvo = ALVOS_PADRAO.find((x) => x.prioridade === prio)
      const slaR =
        fechado && alvo
          ? R <= alvo.restauracao_horas
            ? 'REALIZADO_NO_PRAZO'
            : 'REALIZADO_APOS_VENCIMENTO'
          : null
      const slaPa =
        pa !== null && alvo
          ? a <= alvo.primeiro_atendimento_horas
            ? 'NO_PRAZO'
            : 'APOS_VENCIMENTO'
          : null
      const ultima = registrados[registrados.length - 1]
      const reclassTipo = fechado && bernoulli(rng, 0.08)
      const encMotivo: MotivoEncerramento | null = fechado
        ? reclassTipo
          ? MOTIVOS_ENCERRAMENTO[2]
          : escolhaPonderada(rng, [
              [MOTIVOS_ENCERRAMENTO[0], 62],
              [MOTIVOS_ENCERRAMENTO[1], 24],
              [MOTIVOS_ENCERRAMENTO[3], 8],
              [MOTIVOS_ENCERRAMENTO[4], 6],
            ] as const)
        : null
      const motivoPend = !fechado && ultima?.etapa === 'Pendente' ? ultima.motivo : null
      const escReg =
        escalacao !== null &&
        tl.some((x) => x.etapa === 'Aguardando atribuição' && x.entrada <= hoje)
      chamados.push({
        chamado_id: id,
        organizacao: 'DSPD Sustentação',
        tipo_fila: 'DSPD - SSSC',
        equipe,
        natureza: bernoulli(rng, 0.6) ? 'incidente' : 'requisicao',
        categoria_sistema: escolha(rng, CATEGORIAS[equipe]),
        excluido: bernoulli(rng, 0.01),
        status: fechado ? 'Concluído' : 'Aberto',
        impacto,
        urgencia,
        prioridade: prio,
        prioridade_ajustada_manualmente: ajustada,
        justificativa_ajuste:
          ajustada && bernoulli(rng, 0.9) ? 'Impacto reavaliado com o solicitante' : null,
        aberto_em: aberto,
        primeiro_atendimento_em: pa,
        restaurado_em: fechado ? encerrado : null,
        data_finalizado: fechado ? encerrado : null,
        status_sla_r: slaR,
        status_sla_pa: slaPa,
        motivo_escalacao: escReg ? escalacao : null,
        motivo_pendencia_atual: motivoPend,
        previsao_retorno: motivoPend ? hU(hoje, 16) : null,
        motivo_encerramento: encMotivo,
        avaliacao_problema:
          fechado && (prio === 'P1' || prio === 'P2' || encMotivo === 'Contorno aplicado')
            ? bernoulli(rng, 0.7)
              ? 'Aberto'
              : 'Não aplicável'
            : null,
        excecao_sla_registro_posterior: bernoulli(rng, 0.03),
        incidente_critico_coordenado: prio === 'P1' || (prio === 'P2' && bernoulli(rng, 0.3)),
        nivel_resolucao: fechado ? nivel : null,
      })
    }
  }

  return {
    chamados,
    etapas,
    config: { alvos: ALVOS_PADRAO.map((a) => ({ ...a })), criterios: CRITERIOS_MOCK },
  }
}
