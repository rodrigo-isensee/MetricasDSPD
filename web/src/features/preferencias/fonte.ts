import {
  CARTOES_RETIRADOS,
  CHAVE_PREFERENCIAS,
  PAINEIS_COM_CARTOES,
  PAINEIS_DO_PAPEL,
  PREFERENCIAS_PADRAO,
  cartoesDoPainel,
  preferenciasMetricasSchema,
  type CartaoId,
  type Papel,
  type PainelComCartoes,
  type PreferenciasMetricas,
} from '@metricas-dspd/contratos'

/**
 * Porta das preferências de métricas. Hoje: `LocalStoragePreferencias` (sem login). Com o SSO entra
 * uma implementação HTTP (`GET`/`PUT /me/preferencias-metricas`, sem parâmetro de usuário) e a tela
 * não muda; o diálogo de primeiro login ("Usar estas preferências" / "Começar do padrão do meu papel",
 * CA-14) usa `origem` e fica para essa entrega.
 */
export interface FontePreferencias {
  readonly origem: 'navegador' | 'conta'
  /** Ausente ou inválido vira o padrão (tudo visível): preferência corrompida nunca quebra o painel. */
  obter(): Promise<PreferenciasMetricas>
  salvar(p: PreferenciasMetricas): Promise<void>
}

/** `versao` numérica maior que 1 no JSON guardado; JSON quebrado ou outro formato não conta (esses viram o padrão). */
function versaoGuardadaEhFutura(bruto: string | null): boolean {
  if (bruto === null) return false
  try {
    const v: unknown = (JSON.parse(bruto) as { versao?: unknown } | null)?.versao
    return typeof v === 'number' && v > 1
  } catch {
    return false
  }
}

type Armazenamento = Pick<Storage, 'getItem' | 'setItem'>

export class LocalStoragePreferencias implements FontePreferencias {
  readonly origem = 'navegador' as const
  private readonly armazenamento: Armazenamento
  constructor(armazenamento: Armazenamento = window.localStorage) {
    this.armazenamento = armazenamento
  }

  obter(): Promise<PreferenciasMetricas> {
    return new Promise((resolver) => {
      try {
        const bruto = this.armazenamento.getItem(CHAVE_PREFERENCIAS)
        const lido = preferenciasMetricasSchema.safeParse(bruto === null ? null : JSON.parse(bruto))
        resolver(lido.success ? lido.data : PREFERENCIAS_PADRAO)
      } catch {
        resolver(PREFERENCIAS_PADRAO)
      }
    })
  }

  /**
   * Falha de gravação (cota cheia, armazenamento bloqueado) rejeita: a tela mantém a escolha e avisa. Perfil guardado
   * com `versao` maior que 1 (de uma versão futura do sistema) nunca é sobrescrito: rejeita sem gravar (A6).
   */
  salvar(p: PreferenciasMetricas): Promise<void> {
    return new Promise((resolver, rejeitar) => {
      if (versaoGuardadaEhFutura(this.armazenamento.getItem(CHAVE_PREFERENCIAS))) {
        rejeitar(new Error('Perfil guardado em versão mais nova: não foi sobrescrito.'))
        return
      }
      this.armazenamento.setItem(CHAVE_PREFERENCIAS, JSON.stringify(p))
      resolver()
    })
  }
}

/** Ids válidos do painel: retirados são mapeados em silêncio; inexistentes, ignorados (CA-16). */
export function ocultosValidos(
  painel: PainelComCartoes,
  ids: readonly CartaoId[] | undefined,
  retirados: Readonly<Record<string, string | null>> = CARTOES_RETIRADOS,
): CartaoId[] {
  const validos = new Set(cartoesDoPainel(painel).map((c) => c.id))
  const mapeados = (ids ?? []).map((id) => (id in retirados ? retirados[id] : id))
  return [...new Set(mapeados)].filter((id): id is CartaoId => !!id && validos.has(id))
}

/** Sugestão do papel: só marca caixas (esconde os painéis fora do conjunto); o papel não é gravado (CA-3). */
export function ocultosDaSugestao(papel: Papel): Record<PainelComCartoes, CartaoId[]> {
  return Object.fromEntries(
    PAINEIS_COM_CARTOES.map((p) => [
      p,
      PAINEIS_DO_PAPEL[papel].includes(p) ? [] : cartoesDoPainel(p).map((c) => c.id),
    ]),
  ) as Record<PainelComCartoes, CartaoId[]>
}
