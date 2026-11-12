import { cartoesDoPainel, type PainelComCartoes } from '@metricas-dspd/contratos'
import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SemDadoRealErro } from '@/data'
import { fonteDeTeste, renderizarApp } from '@/test/helpers'

/**
 * Guarda G4 da ADR 0030 (D6), pedido 099 (K-275): "painel sem nenhum dado real".
 * Fonte de teste em que TODA métrica responde `SemDadoRealErro`, como a API sem fonte real. Cada cartão do `CATALOGO_CARTOES`
 * tem de acabar no estado `sem-dado-real`, com "Sem dado real" e o motivo, e a tela não pode dizer "Simulado", "Dados de exemplo" nem "fictíci".
 * Falha quando algum cartão mostra conteúdo que não veio da fonte (número gerado no navegador, selo, resultado de exemplo).
 */
const MOTIVO = 'motivo de teste da guarda G4'
const fonteSemNenhumDadoReal = Object.create(fonteDeTeste, {
  tipo: { value: 'api' },
  obter: { value: (id: string) => Promise.reject(new SemDadoRealErro(id, MOTIVO)) },
}) as typeof fonteDeTeste

const TEXTO_PROIBIDO = /Simulado|Dados de exemplo/
const TEXTO_FICTICIO = /fictíci/i

const cartoesNaTela = () => [...document.querySelectorAll<HTMLElement>('[data-testid^="metrica-"]')]

/** Renderiza a rota, abre "Mais métricas" (onde ficam os complementares) e espera todo cartão sair do carregamento. */
async function abrirTudo(rota: string): Promise<{ cartoes: HTMLElement[]; texto: string }> {
  const { unmount } = renderizarApp(rota, fonteSemNenhumDadoReal)
  try {
    await waitFor(
      () => {
        const cs = cartoesNaTela()
        expect(cs.length).toBeGreaterThan(0)
        expect(
          cs.filter((c) => ['carregando', 'atualizando'].includes(c.dataset.estado ?? '')),
        ).toEqual([])
      },
      { timeout: 10_000 },
    )
    for (const d of document.querySelectorAll<HTMLDetailsElement>(
      'details[data-testid="mais-metricas"]',
    ))
      if (!d.open) d.querySelector('summary')?.click()
    // os complementares montam depois do clique: espera o conjunto de cartões parar de crescer e de carregar
    const assinatura = () =>
      cartoesNaTela()
        .map((c) => `${c.dataset.testid}:${c.dataset.estado}`)
        .join('|')
    let anterior = ''
    await waitFor(
      () => {
        const atual = assinatura()
        const estavel = atual === anterior
        anterior = atual
        expect(estavel && !/:(carregando|atualizando)(\||$)/.test(atual)).toBe(true)
      },
      { timeout: 10_000, interval: 150 },
    )
    // o texto da tela é lido antes do desmonte; os cartões são devolvidos como texto e atributos já copiados
    return {
      cartoes: cartoesNaTela().map((c) => c.cloneNode(true) as HTMLElement),
      texto: document.body.textContent,
    }
  } finally {
    unmount()
  }
}

const ROTAS: Record<PainelComCartoes, readonly string[]> = {
  // as duas cadências do Operacional juntas cobrem as seções do painel `operacional`
  operacional: ['/operacional?cadencia=diaria', '/operacional?cadencia=semanal'],
  sustentacao: ['/operacional?cadencia=sustentacao'],
  tatico: ['/tatico'],
  estrategico: ['/estrategico'],
}

describe('G4: painel sem nenhum dado real (ADR 0030, D6)', () => {
  for (const [painel, rotas] of Object.entries(ROTAS) as [PainelComCartoes, readonly string[]][]) {
    it(`${painel}: todo cartão do catálogo termina em "Sem dado real", sem selo nem texto de simulado`, async () => {
      const codigos = new Set<string>()
      for (const rota of rotas) {
        const { cartoes, texto } = await abrirTudo(rota)
        for (const c of cartoes) {
          const codigo = c.dataset.testid!.replace(/^metrica-/, '')
          codigos.add(codigo)
          expect(c.dataset.estado, `${codigo} em ${rota}`).toBe('sem-dado-real')
          const estado = c.querySelector(`[data-testid="estado-sem-dado-real-${codigo}"]`)
          expect(estado, `${codigo}: bloco "Sem dado real"`).not.toBeNull()
          expect(estado!.textContent).toContain('Sem dado real')
          expect(estado!.textContent).toContain(MOTIVO)
          expect(
            c.querySelector('[data-testid*="simulado"]'),
            `${codigo}: selo ou faixa "Simulado"`,
          ).toBeNull()
        }
        expect(texto, `texto da tela ${rota}`).not.toMatch(TEXTO_PROIBIDO)
      }
      // guarda contra suíte vazia: cada cartão do catálogo do painel foi visto (o catálogo tem 12 a 33 cartões por painel)
      const esperados = cartoesDoPainel(painel).map((c) => c.codigo)
      expect(esperados.length).toBeGreaterThanOrEqual(8)
      expect(esperados.filter((c) => !codigos.has(c))).toEqual([])
    }, 60_000)
  }

  it('Resumo: as duas tendências mostram "Sem dado real", sem selo nem texto de simulado', async () => {
    const { unmount } = renderizarApp('/operacional', fonteSemNenhumDadoReal)
    try {
      await waitFor(
        () => {
          for (const id of ['tendencia-fluxo', 'tendencia-sustentacao'])
            expect(document.querySelector(`[data-testid="${id}-sem-dado-real"]`)).not.toBeNull()
        },
        { timeout: 10_000 },
      )
      expect(document.body.textContent).not.toMatch(TEXTO_PROIBIDO)
      expect(document.querySelector('[data-testid*="simulado"]')).toBeNull()
    } finally {
      unmount()
    }
  }, 30_000)

  // ADR 0030, D7: os textos "fictício" do Catálogo e das notas saem pelo L4 (já na develop).
  it('nenhuma tela diz "fictíci" (Operacional, Sustentação, Tático, Estratégico)', async () => {
    for (const rota of [
      '/operacional?cadencia=semanal',
      '/operacional?cadencia=sustentacao',
      '/tatico',
      '/estrategico',
    ]) {
      const { texto } = await abrirTudo(rota)
      expect(texto, `texto da tela ${rota}`).not.toMatch(TEXTO_FICTICIO)
    }
  }, 60_000)
})
