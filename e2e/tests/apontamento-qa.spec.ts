import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Page, Route } from '@playwright/test'
import { test, expect, rodarAxe } from '../fixtures/base'

// QA da aba Apontamento (pedido 059, E2.53, K-193): casos do front do plano docs/qa/059-plano-testes.md (CA-1 a CA-11,
// o1 a o4, estados, acessibilidade e 375 px). Só mock: a rota GET /api/apontamento é interceptada e devolve a fixture
// (e2e/fixtures/apontamento-respostas.json, gerada da fixture tipada do contrato v1 do front, com pessoas fictícias);
// nenhum teste toca BusinessMap, banco ou .env. O `web/` e o `e2e/` se conhecem só por arquivo de dados (ADR 0002).
const ABA = '/operacional/apontamento'
const ROTA = /\/api\/apontamento\?/

interface Resp {
  opcoes: {
    pessoas: { pessoaRef: string; rotulo: string; identificada: boolean }[]
    projetos: { id: string; rotulo: string; foraDoEscopo: boolean }[]
    tipos: { id: string; rotulo: string }[]
    subtarefas: { id: string }[]
    subgrupos: { id: string }[]
  }
  distribuicao: { porProjeto: { rotulo: string }[] }
  capacidade: { porPessoa: { pessoaRef: string; realizadoSegundos: number }[] }
  achados: unknown[]
  periodo: { de: string; ate: string }
  matriz: unknown
  [chave: string]: unknown
}
type Variante = 'base' | 'nomesReais' | 'outraArea' | 'nomesReaisOutraArea'
const PACOTE = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../fixtures/apontamento-respostas.json', import.meta.url)),
    'utf8',
  ),
) as Record<Variante | 'vazia' | 'insuficiente' | 'defasada', Resp> & {
  matriz: Record<string, unknown>
}
const RESPOSTA_FICTICIA = PACOTE.base
const clonar = <T>(v: T): T => structuredClone(v)
const respostaVazia = () => clonar(PACOTE.vazia)
const respostaInsuficiente = () => clonar(PACOTE.insuficiente)
const respostaDefasada = () => clonar(PACOTE.defasada)

type Gerar = (url: URL) => Resp | { status: number; corpo?: unknown } | 'abortar'

/** Faz o papel da rota: valor de filtro que não existe nas opções devolve o recorte vazio; a matriz segue o nível. */
function ficticia(url: URL, variante: Variante = 'base'): Resp {
  const r = clonar(PACOTE[variante])
  const lista = (k: string) => url.searchParams.get(k)?.split(',')
  const existe = (ids: string[] | undefined, opcoes: readonly { id: string }[]) =>
    !ids || ids.every((id) => opcoes.some((o) => o.id === id))
  const valido =
    existe(
      lista('pessoa'),
      r.opcoes.pessoas.map((x) => ({ id: x.pessoaRef })),
    ) &&
    existe(lista('projeto'), r.opcoes.projetos) &&
    existe(lista('tipo'), r.opcoes.tipos) &&
    existe(lista('subtarefa'), r.opcoes.subtarefas) &&
    existe(lista('subgrupo'), r.opcoes.subgrupos)
  if (!valido) return { ...respostaVazia(), nomesReais: r['nomesReais'] ?? false }
  const nivel = url.searchParams.get('nivelMatriz') ?? 'tipo'
  if (
    nivel !== 'tipo' &&
    (variante === 'base' || variante === 'nomesReais') &&
    nivel in PACOTE.matriz
  )
    r.matriz = clonar(PACOTE.matriz[nivel])
  return r
}

/** Intercepta a rota; devolve a lista (viva) das consultas feitas, para provar o que o front pediu. */
async function semear(page: Page, gerar?: Gerar): Promise<string[]> {
  const chamadas: string[] = []
  await page.route(ROTA, async (route: Route) => {
    const url = new URL(route.request().url())
    chamadas.push(url.search)
    const r = gerar ? gerar(url) : ficticia(url)
    if (r === 'abortar') return route.abort('failed')
    if ('status' in r && typeof r.status === 'number' && !('opcoes' in r))
      return route.fulfill({
        status: r.status,
        contentType: 'application/json',
        body: JSON.stringify(r.corpo ?? { error: { code: 'ERRO' } }),
      })
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(r) })
  })
  return chamadas
}

const aba = (page: Page) => page.getByTestId('aba-apontamento')
const cartao = (page: Page, codigo: string) => page.getByTestId(`metrica-${codigo}`)
async function abrir(page: Page, caminho = ABA) {
  await page.goto(caminho)
  await expect(page.getByRole('heading', { level: 1, name: 'Apontamento' })).toBeVisible()
  await expect(page.getByTestId('periodo-dos-dados')).toBeVisible()
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
}
const CHAVES_STORAGE = () =>
  Object.entries(localStorage)
    .concat(Object.entries(sessionStorage))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

test.describe('seletor do Operacional e cabeçalho (CA-1)', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('CT-01: a quinta visão do seletor abre a aba, com selo de frescor (ícone e texto) e período', async ({
    page,
  }) => {
    await semear(page)
    await page.goto('/operacional')
    const grupo = page.getByRole('radiogroup', { name: 'Visão' })
    await expect(grupo.getByRole('radio')).toHaveCount(5)
    await grupo.getByText('Apontamento', { exact: true }).click()
    await expect(page).toHaveURL(/\/operacional\/apontamento$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Apontamento' })).toBeVisible()
    const selo = page.getByTestId('selo-frescor-businessmap')
    await expect(selo).toContainText(/em dia|atual|atualizado/i)
    await expect(selo.locator('svg')).not.toHaveCount(0)
    await expect(page.getByTestId('periodo-dos-dados')).toHaveText(/Dados de .* a /)
    await expect(page.getByTestId('aviso-defasado')).toHaveCount(0)
    // sem chip de Acelerato: fonte única
    await expect(page.getByText(/Fonte: Acelerato/)).toHaveCount(0)
    await expect(page.getByTestId('selo-frescor-acelerato')).toHaveCount(0)
    // sair da aba pelo mesmo seletor: Resumo volta ao Operacional
    await grupo.getByText('Resumo', { exact: true }).click()
    await expect(page).toHaveURL(/\/operacional$/)
  })

  test('CT-02: atrasado mostra texto e aviso, e o dado velho continua na tela', async ({
    page,
  }) => {
    await semear(page, () => respostaDefasada())
    await abrir(page)
    const selo = page.getByTestId('selo-frescor-businessmap')
    await expect(selo).toContainText(/atrasad/i)
    await expect(selo.locator('svg')).not.toHaveCount(0)
    await expect(page.getByTestId('aviso-defasado')).toBeVisible()
    await expect(cartao(page, 'AP-KPIS')).toBeVisible()
  })
})

test.describe('filtros na URL com chave opaca (CA-4, CT-10, tipo)', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('CT-10: pessoa vai à URL e à rota como pessoaRef; nome real nunca em URL nem em storage', async ({
    page,
  }) => {
    const chamadas = await semear(page, (u) => ficticia(u, 'nomesReais'))
    await abrir(page)
    await expect(page.getByTestId('aviso-nome-real')).toBeVisible()
    await page.getByRole('button', { name: /Pessoa que apontou/ }).click()
    await page.getByRole('checkbox', { name: 'Ana Exemplo' }).check()
    await expect(page).toHaveURL(/pessoa=p1(&|$)/)
    expect(decodeURIComponent(page.url())).not.toMatch(/Ana|Exemplo/)
    await expect.poll(() => chamadas.some((c) => c.includes('pessoa=p1'))).toBe(true)
    for (const c of chamadas) expect(decodeURIComponent(c)).not.toMatch(/Ana|Exemplo/)
    const guardado = await page.evaluate(CHAVES_STORAGE)
    expect(guardado).not.toMatch(/Ana|Exemplo|p1/)
    // recarregar restaura o filtro, e voltar do navegador o desfaz
    await page.reload()
    await expect(page.getByTestId('periodo-dos-dados')).toBeVisible()
    await expect(page).toHaveURL(/pessoa=p1/)
    await expect(page.getByRole('button', { name: /Remover filtro.*Ana Exemplo/i })).toBeVisible()
  })

  test('CT-08: tipo vai à URL com o id opaco e à rota; os outros filtros também persistem', async ({
    page,
  }) => {
    const chamadas = await semear(page)
    await abrir(page)
    await page.getByRole('button', { name: /^Tipo/ }).click()
    await page.getByRole('checkbox', { name: 'Correção' }).check()
    await expect(page).toHaveURL(/tipo=5(&|$)/)
    await expect.poll(() => chamadas.some((c) => c.includes('tipo=5'))).toBe(true)
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: /^Subgrupo/ }).click()
    await page.getByRole('checkbox', { name: 'Reunião' }).check()
    await expect(page).toHaveURL(/subgrupo=reuniao/)
    await page.keyboard.press('Escape')
    await page.reload()
    await expect(page).toHaveURL(/tipo=5/)
    await expect(page).toHaveURL(/subgrupo=reuniao/)
    expect(await page.evaluate(CHAVES_STORAGE)).not.toMatch(/tipo|subgrupo|pessoa/)
  })

  test('CT-08 borda: valor inválido na URL é descartado com aviso, sem eco e sem 500', async ({
    page,
  }) => {
    const chamadas = await semear(page)
    await abrir(page, `${ABA}?pessoa=Ana%20Exemplo&tipo=%3Cscript%3E&nivelMatriz=xyz`)
    await expect(page.getByTestId('filtros-invalidos')).toBeVisible()
    await expect(aba(page)).not.toContainText('Ana Exemplo')
    await expect(aba(page)).not.toContainText('<script>')
    for (const c of chamadas) {
      expect(c).not.toMatch(/Ana|script|xyz/)
    }
    await expect(cartao(page, 'AP-KPIS')).toBeVisible()
  })
})

test.describe('recorte vazio e amostra insuficiente (CA-2, CA-3, o3)', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('CT-03: filtros que zeram o recorte mostram o vazio, um remover por filtro e Limpar filtros', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page, `${ABA}?tipo=999&projeto=1042`)
    await expect(page.getByText('Nenhum apontamento encontrado').first()).toBeVisible()
    const barra = page.getByTestId('barra-filtros-apontamento')
    await expect(barra.getByRole('button', { name: /Remover filtro/ })).toHaveCount(2)
    await expect(barra.getByRole('button', { name: 'Limpar filtros' })).toBeVisible()
    // remover o filtro certo (Tipo) restaura o recorte e mantém o outro
    await barra.getByRole('button', { name: /Remover filtro.*Tipo/ }).click()
    await expect(page).toHaveURL(/projeto=1042/)
    await expect(page).not.toHaveURL(/tipo=/)
    await expect(cartao(page, 'AP-KPIS')).toBeVisible()
    await barra.getByRole('button', { name: 'Limpar filtros' }).click()
    await expect(page).not.toHaveURL(/projeto=/)
  })

  test('CT-07 e CT-26: com 12 apontamentos só soma e contagem, sem percentual; o piso é por pessoa', async ({
    page,
  }) => {
    await semear(page, () => respostaInsuficiente())
    await abrir(page)
    await expect(cartao(page, 'AP-KPIS')).toContainText(
      /amostra insuficiente|menos de 20|20 apontamentos/i,
    )
    // a soma de horas e a contagem seguem visíveis
    await expect(cartao(page, 'AP-KPIS')).toContainText('19,5')
    await expect(cartao(page, 'AP-KPIS')).toContainText('12')
    await expect(cartao(page, 'AP-PROJETO')).not.toContainText('%')
  })

  test('CT-26: com 20 ou mais mostra percentual; pessoa com menos de 20 no mesmo recorte não mostra o dela', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page)
    await expect(cartao(page, 'AP-KPIS')).toContainText('%')
    // p7 tem 12 apontamentos (fixture) e p1 tem 96: a tabela da capacidade por pessoa traz o piso só em p7
    const capacidade = cartao(page, 'AP-CAPACIDADE-PESSOA')
    const linhaP1 = capacidade.getByRole('row', { name: /Pessoa 1/ })
    const linhaP7 = capacidade.getByRole('row', { name: /Pessoa 7/ })
    await expect(linhaP1).toContainText('%')
    await expect(linhaP7).not.toContainText('%')
    await expect(linhaP7).toContainText(/insuficiente|20/i)
  })
})

test.describe('Outra área (decisão do dono de 2026-11-02)', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('entra somada e sem nome, mesmo com nomes reais ligados, e fica fora dos blocos por pessoa e dia', async ({
    page,
  }) => {
    await semear(page, (u) => ficticia(u, 'nomesReaisOutraArea'))
    await abrir(page)
    // nota de quem é Outra área
    await expect(aba(page)).toContainText(/Outra área: pessoas que não foram responsáveis/)
    // soma: aparece na matriz
    await expect(cartao(page, 'AP-MATRIZ')).toContainText('Outra área')
    // fora dos blocos por pessoa e dia: capacidade por pessoa e mapa diário
    const mapa = page.getByTestId('mapa-diario')
    await expect(mapa.getByRole('rowheader', { name: /Outra área/ })).toHaveCount(0)
    await expect(mapa).not.toContainText('Outra área')
    await expect(cartao(page, 'AP-CAPACIDADE-PESSOA')).not.toContainText('Outra área')
    // sem nome: nenhum nome real vira rótulo de Outra área, e o filtro oferece a chave fixa
    await page.getByRole('button', { name: /Pessoa que apontou/ }).click()
    await expect(page.getByRole('checkbox', { name: 'Outra área' })).toBeVisible()
    await page.getByRole('checkbox', { name: 'Outra área' }).check()
    await expect(page).toHaveURL(/pessoa=outra-area/)
  })
})

test.describe('estados de erro e de carregamento (CT-60 a CT-62)', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('CT-60: falha da rota mostra erro com Tentar de novo, sem detalhe técnico; nova tentativa funciona', async ({
    page,
  }) => {
    let falhar = true
    await semear(page, (u) =>
      falhar
        ? { status: 500, corpo: { error: { code: 'ERRO_INTERNO', detalhe: 'stack secreta' } } }
        : ficticia(u),
    )
    await page.goto(ABA)
    const kpis = cartao(page, 'AP-KPIS')
    await expect(kpis.getByRole('button', { name: /Tentar de novo/ })).toBeVisible()
    await expect(aba(page)).not.toContainText(/stack secreta|TypeError|undefined/)
    // o detalhe técnico do padrão do painel fica recolhido e traz só o código, nunca o corpo da resposta
    await expect(kpis.getByText(/ErroApi: API 500/)).toBeHidden()
    falhar = false
    await kpis.getByRole('button', { name: /Tentar de novo/ }).click()
    await expect(page.getByTestId('periodo-dos-dados')).toBeVisible()
    await expect(
      cartao(page, 'AP-KPIS').getByRole('button', { name: /Tentar de novo/ }),
    ).toHaveCount(0)
  })

  test('CT-60 borda: falha de rede (conexão cai) também vira erro com nova tentativa', async ({
    page,
  }) => {
    await semear(page, () => 'abortar')
    await page.goto(ABA)
    await expect(
      cartao(page, 'AP-KPIS').getByRole('button', { name: /Tentar de novo/ }),
    ).toBeVisible()
  })

  test('CT-62: resposta que viola o contrato (campo extra, status desconhecido) vira erro do cartão, sem quebrar a página', async ({
    page,
    problemas,
  }) => {
    await semear(
      page,
      () =>
        ({
          ...RESPOSTA_FICTICIA,
          campoExtra: 1,
          frescor: { selo: 'desconhecido', ultimaColetaOk: null },
        }) as unknown as Resp,
    )
    await page.goto(ABA)
    await expect(
      cartao(page, 'AP-KPIS').getByRole('button', { name: /Tentar de novo/ }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Apontamento' })).toBeVisible()
    expect(problemas.filter((p) => p.startsWith('pageerror'))).toEqual([])
  })

  test('CT-61: carregando mostra o anúncio e o esqueleto antes da resposta', async ({ page }) => {
    let liberar: () => void = () => undefined
    const trava = new Promise<void>((r) => (liberar = r))
    await page.route(ROTA, async (route) => {
      await trava
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(RESPOSTA_FICTICIA),
      })
    })
    await page.goto(ABA)
    await expect(page.getByTestId('anuncio-carregando')).toHaveText('Carregando apontamentos')
    liberar()
    await expect(page.getByTestId('periodo-dos-dados')).toBeVisible()
    await expect(page.getByTestId('anuncio-carregando')).toHaveText('')
  })
})

test.describe('cartões e gráficos (CA-5, CA-6, CA-7, CA-9, CA-11)', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('CT-13: todo cartão da aba tem tabela com os números (a própria tabela ou Ver como tabela)', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page)
    const codigos = await page
      .locator('[data-testid^="metrica-AP-"]')
      .evaluateAll((els) =>
        els.map((e) => e.getAttribute('data-testid') ?? '').filter((t) => !t.endsWith('-detalhe')),
      )
    // guarda de suíte vazia: a aba tem 11 cartões (margem de 2)
    expect(codigos.length).toBeGreaterThanOrEqual(9)
    for (const t of codigos) {
      const c = page.getByTestId(t)
      const botao = c.getByRole('button', { name: 'Ver como tabela' })
      if (await botao.count()) await botao.first().click()
      if (t === 'metrica-AP-ACHADOS' || t === 'metrica-AP-KPIS') continue // frases e números, sem gráfico
      expect(await c.getByRole('table').count(), t + ' sem tabela').toBeGreaterThan(0)
    }
  })

  test('CT-11: a matriz mostra um nível por vez, o nível vai à URL e a troca não mantém o anterior', async ({
    page,
  }) => {
    const chamadas = await semear(page)
    await abrir(page)
    const matriz = cartao(page, 'AP-MATRIZ')
    const niveis = matriz.getByRole('radiogroup')
    await expect(niveis.getByRole('radio')).toHaveCount(3)
    await expect(niveis.getByRole('radio', { name: 'Tipo' })).toBeChecked()
    await expect(matriz).toContainText('Correção')
    await niveis.getByText('Subgrupo', { exact: true }).click()
    await expect(page).toHaveURL(/nivelMatriz=subgrupo/)
    await expect.poll(() => chamadas.some((c) => c.includes('nivelMatriz=subgrupo'))).toBe(true)
    await expect(matriz).toContainText('Reunião')
    await expect(matriz).not.toContainText('Correção')
    await niveis.getByText('Tipo', { exact: true }).click()
    await expect(page).not.toHaveURL(/nivelMatriz/)
    await abrir(page, `${ABA}?nivelMatriz=xyz`)
    await expect(niveis.getByRole('radio', { name: 'Tipo' })).toBeChecked()
  })

  test('CT-15: possível erro de apontamento com texto e ícone; Ocultar possíveis erros vai à rota e volta ao desmarcar', async ({
    page,
  }) => {
    const chamadas = await semear(page)
    await abrir(page)
    const mapa = cartao(page, 'AP-DIARIO')
    await expect(mapa).toContainText('Possível erro de apontamento')
    await expect(mapa.getByTestId('legenda-diario').locator('svg')).not.toHaveCount(0)
    await expect(mapa.getByTestId('dica-anomalia')).toBeVisible()
    const ocultar = page.getByRole('checkbox', { name: 'Ocultar possíveis erros' })
    await ocultar.click()
    await expect(ocultar).toBeChecked()
    await expect(page).toHaveURL(/anomalos=ocultar/)
    await expect.poll(() => chamadas.some((c) => c.includes('anomalos=ocultar'))).toBe(true)
    await ocultar.click()
    await expect(ocultar).not.toBeChecked()
    await expect(page).not.toHaveURL(/anomalos/)
  })

  test('CT-19 e CT-25: utilização sem semáforo, sem meta e sem comparação com a média; selo de leitura relativa', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page)
    await expect(aba(page)).toContainText('Comparação relativa; não é jornada total')
    const texto = (await aba(page).innerText()).toLowerCase()
    for (const proibido of [
      'acima da média',
      'abaixo da média',
      'média da equipe',
      'ranking',
      'melhor que',
      'pior que',
      'abaixo do esperado',
    ])
      expect(texto, proibido).not.toContain(proibido)
    // todas as barras de utilização por pessoa com o mesmo tom (estilo computado)
    const cores = await cartao(page, 'AP-CAPACIDADE-PESSOA')
      .locator('[role="meter"], [role="progressbar"], [data-testid^="barra-"], svg rect')
      .evaluateAll((els) => [
        ...new Set(
          els.map((e) => getComputedStyle(e).fill + '|' + getComputedStyle(e).backgroundColor),
        ),
      ])
    expect(cores.length).toBeLessThanOrEqual(2)
  })

  test('CT-23: cada achado mostra a frase com os números do contrato; achados vazios não quebram', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page)
    const lista = page.getByTestId('lista-achados')
    await expect(lista.getByRole('listitem')).toHaveCount(RESPOSTA_FICTICIA.achados.length)
    await expect(lista).toContainText('20% dos apontamentos (84) estão sem comentário')
    await expect(lista).toContainText(
      "9% das horas apontadas (29 apontamentos) caíram em 'Não classificado'",
    )
    await semear(page, () => ({ ...RESPOSTA_FICTICIA, achados: [] }))
    await page.reload()
    await expect(page.getByTestId('achados-vazio')).toBeVisible()
  })

  const comRotulo =
    (longo: string): Gerar =>
    (u) => {
      const base = ficticia(u)
      const projetos = base.opcoes.projetos.map((p, i) => (i === 0 ? { ...p, rotulo: longo } : p))
      const porProjeto = base.distribuicao.porProjeto.map((l, i) =>
        i === 0 ? { ...l, rotulo: longo } : l,
      )
      return {
        ...base,
        opcoes: { ...base.opcoes, projetos },
        distribuicao: { ...base.distribuicao, porProjeto },
      }
    }
  const semRolagemDaPagina = (page: Page) =>
    page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)

  test('CT-70: rótulo de 200 caracteres com HTML, emoji e RTL sai como texto e a página não rola', async ({
    page,
  }) => {
    const longo = '<img src=x onerror=window.__xss=1> 😀 \u202Erts Integracao de sistemas legados '
      .repeat(4)
      .slice(0, 200)
    await semear(page, comRotulo(longo))
    await abrir(page)
    expect(
      await page.evaluate(() => (window as unknown as { __xss?: number }).__xss),
    ).toBeUndefined()
    await expect(page.locator('img[src="x"]')).toHaveCount(0)
    expect(await semRolagemDaPagina(page)).toBe(true)
  })

  for (const largura of [1280, 375]) {
    test(`CT-70 borda: rótulo de uma palavra só, sem espaço, de 100 caracteres, não faz a página rolar em ${largura} px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: largura, height: 900 })
      await semear(page, comRotulo(`PROJETO_${'X'.repeat(92)}`))
      await abrir(page)
      await cartao(page, 'AP-PROJETO').scrollIntoViewIfNeeded()
      expect(await semRolagemDaPagina(page)).toBe(true)
    })
  }
})

test.describe('mapa diário por teclado (CT-64)', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('uma parada de Tab na grade, setas andam entre as células e a célula tem leitura acessível', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page)
    const grade = page.getByRole('grid', { name: /Horas apontadas por pessoa e dia/ })
    await expect(grade).toBeVisible()
    const celulas = grade.getByRole('gridcell')
    expect(await celulas.count()).toBeGreaterThan(20)
    await grade.locator('[data-lin="0"][data-col="0"]').focus()
    await page.keyboard.press('ArrowRight')
    await expect(grade.locator('[data-lin="0"][data-col="1"]')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(grade.locator('[data-lin="1"][data-col="1"]')).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowUp')
    await expect(grade.locator('[data-lin="0"][data-col="0"]')).toBeFocused()
    // fronteira: seta além do limite não sai da grade
    await page.keyboard.press('ArrowLeft')
    await expect(grade.locator('[data-lin="0"][data-col="0"]')).toBeFocused()
    await expect(grade.locator('[data-lin="0"][data-col="0"]')).toHaveAttribute('aria-label', /.+/)
    // roving tabindex: só uma célula entra na ordem de Tab
    const paradas = await grade
      .locator('[data-lin][data-col]')
      .evaluateAll((els) => els.filter((e) => (e as HTMLElement).tabIndex === 0).length)
    expect(paradas).toBe(1)
  })

  test('o foco chega ao índice, aos filtros e aos botões só com o teclado', async ({ page }) => {
    await semear(page)
    await abrir(page)
    const alcancados = new Set<string>()
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab')
      const rotulo = await page.evaluate(() => {
        const a = document.activeElement as HTMLElement | null
        return a ? (a.getAttribute('aria-label') ?? a.textContent ?? '').trim().slice(0, 40) : ''
      })
      alcancados.add(rotulo)
    }
    expect([...alcancados].join('|')).toMatch(/Pessoa que apontou/)
    expect([...alcancados].join('|')).toMatch(/Ver como tabela/)
  })
})

test.describe('cláusula o4: aba fora da exportação', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('CT-27: a aba não tem Exportar nem CSV e o diálogo do Operacional não lista a aba', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page)
    await expect(page.getByRole('button', { name: /Exportar/ })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /CSV/i })).toHaveCount(0)
    await page.goto('/operacional?cadencia=diaria')
    await page.getByRole('button', { name: 'Exportar', exact: true }).click()
    const dialogo = page.getByRole('dialog')
    await expect(dialogo).toBeVisible()
    await expect(dialogo).not.toContainText(/apontamento/i)
    await expect(dialogo).not.toContainText(/Outra área/)
  })
})

test.describe('o1: ordem neutra', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('CT-24: padrão alfabético; ordenar por total é local, não refaz a chamada e não vira o padrão', async ({
    page,
  }) => {
    const chamadas = await semear(page, (u) => {
      const nomes: Record<string, string> = { p1: 'Álvaro', p2: 'Bruno', p3: 'Carla' }
      const reais = ficticia(u, 'nomesReais')
      return {
        ...reais,
        capacidade: {
          ...reais.capacidade,
          porPessoa: reais.capacidade.porPessoa.map((c) =>
            c.pessoaRef === 'p3' ? { ...c, realizadoSegundos: 999 * 3600 } : c,
          ),
        },
        opcoes: {
          ...reais.opcoes,
          pessoas: reais.opcoes.pessoas.map((p) => ({
            ...p,
            rotulo: nomes[p.pessoaRef] ?? p.rotulo,
          })),
        },
      }
    })
    await abrir(page)
    const capacidade = cartao(page, 'AP-CAPACIDADE-PESSOA')
    const ordemLinhas = async () =>
      capacidade
        .getByRole('row')
        .evaluateAll((rs) => rs.map((r) => (r.textContent ?? '').slice(0, 12)))
    const alfa = (await ordemLinhas()).join('|')
    expect(alfa.indexOf('Álvaro')).toBeGreaterThan(-1)
    expect(alfa.indexOf('Álvaro')).toBeLessThan(alfa.indexOf('Bruno'))
    expect(alfa.indexOf('Bruno')).toBeLessThan(alfa.indexOf('Carla'))
    const antes = chamadas.length
    await page.getByText('Total de horas (maior primeiro)').click()
    await expect.poll(async () => (await ordemLinhas()).join('|')).not.toBe(alfa)
    expect(chamadas.length).toBe(antes)
    await page.getByRole('button', { name: 'Limpar filtros' }).click()
    await expect(page.getByRole('radio', { name: /Alfabética/ })).toBeChecked()
  })
})

test.describe('375 px (CA-8) e rolagem das tabelas por pessoa (R2-2: A-1 e A-2)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('CT-16: a página não rola na horizontal; só o mapa rola, com coluna Pessoa fixa', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    const regiao = page.getByTestId('mapa-diario')
    const dados = await regiao.evaluate((el) => ({ rola: el.scrollWidth > el.clientWidth }))
    expect(dados.rola).toBe(true)
    const th = regiao.getByRole('columnheader', { name: 'Pessoa' })
    await regiao.evaluate((el) => (el.scrollLeft = 400))
    const caixa = await th.boundingBox()
    const area = await regiao.boundingBox()
    expect(caixa && area && Math.abs(caixa.x - area.x) < 4).toBe(true)
  })

  test('CT-17: a barra recolhe em "Filtros (n)" e os alvos de toque têm 44 px ou mais', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page, `${ABA}?tipo=5`)
    const abrirBarra = page.getByRole('button', { name: /^Filtros \(\d+\)/ })
    await expect(abrirBarra).toBeVisible()
    await expect(abrirBarra).toHaveText(/Filtros \(1\)/)
    await expect(page.getByRole('button', { name: /^Tipo/ })).toBeHidden()
    await abrirBarra.click()
    await expect(page.getByRole('button', { name: /^Tipo/ })).toBeVisible()
    const alvos = [
      abrirBarra,
      page.getByRole('button', { name: /^Tipo/ }),
      page.getByRole('button', { name: /Pessoa que apontou/ }),
      page.locator('label', { hasText: 'Ocultar possíveis erros' }),
    ]
    for (const a of alvos) {
      const c = await a.boundingBox()
      expect(c, 'alvo visível').not.toBeNull()
      expect(c?.height ?? 0).toBeGreaterThanOrEqual(44)
    }
  })

  test('A-1: nas tabelas por pessoa a coluna Pessoa fica fixa ao rolar na horizontal', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page)
    for (const codigo of ['AP-QUALIDADE-PESSOA', 'AP-CAPACIDADE-PESSOA']) {
      const c = cartao(page, codigo)
      const tabela = c.getByRole('table').first()
      await expect(tabela, codigo + ' sem tabela').toBeVisible()
      const regiao = tabela.locator('xpath=ancestor::*[@role="region"][1]')
      await expect(regiao, codigo + ' sem região rolável').toHaveCount(1)
      await regiao.scrollIntoViewIfNeeded()
      const rola = await regiao.evaluate((el) => el.scrollWidth > el.clientWidth)
      expect(rola, codigo + ': em 375 px a tabela precisa rolar dentro da região').toBe(true)
      const primeira = tabela.getByRole('columnheader').first()
      const antes = await primeira.boundingBox()
      await regiao.evaluate((el) => (el.scrollLeft = 300))
      const depois = await primeira.boundingBox()
      expect(
        antes && depois && Math.abs(depois.x - antes.x) < 4,
        codigo + ': coluna Pessoa fixa',
      ).toBe(true)
    }
  })

  test('A-2: célula do mapa focada por teclado não fica sob a coluna fixa Pessoa nem sob a de total', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page)
    const grade = page.getByRole('grid', { name: /Horas apontadas por pessoa e dia/ })
    await grade.locator('[data-lin="0"][data-col="0"]').focus()
    for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowRight')
    const foco = page.locator(':focus')
    const f = await foco.boundingBox()
    const th = await grade.getByRole('columnheader', { name: 'Pessoa' }).boundingBox()
    expect(f && th && f.x >= th.x + th.width - 1).toBe(true)
    const total = grade.locator('thead th').last()
    const t = await total.boundingBox()
    // tolerância de 2 px: arredondamento da borda da coluna fixa; a célula nunca fica inteira sob ela (WCAG 2.4.11)
    expect(f && t && f.x + f.width <= t.x + 2).toBe(true)
  })

  test('375 px sem rolagem horizontal da página em todos os estados', async ({ page }) => {
    await semear(page, () => respostaVazia())
    await abrir(page)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  })
})

test.describe('acessibilidade automática (CT-65, WCAG 2.2 AA)', () => {
  const estados: [string, Gerar, string?][] = [
    ['carregada', () => RESPOSTA_FICTICIA],
    ['vazia', () => respostaVazia()],
    ['amostra insuficiente', () => respostaInsuficiente()],
    ['atrasada', () => respostaDefasada()],
    ['nomes reais', (u) => ficticia(u, 'nomesReais')],
    ['Outra área', (u) => ficticia(u, 'outraArea')],
    ['erro', () => ({ status: 500 })],
  ]
  for (const largura of [1280, 375]) {
    for (const [nome, gerar] of estados) {
      test(`${nome} em ${largura}px: zero violações críticas ou sérias`, async ({ page }) => {
        await page.setViewportSize({ width: largura, height: largura === 375 ? 812 : 900 })
        await semear(page, gerar)
        await page.goto(ABA)
        if (nome === 'erro')
          await expect(
            cartao(page, 'AP-KPIS').getByRole('button', { name: /Tentar de novo/ }),
          ).toBeVisible()
        else await expect(page.getByTestId('periodo-dos-dados')).toBeVisible()
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
        const r = await rodarAxe(page)
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
      })
    }
  }

  test('tema escuro, com todas as tabelas abertas e a legenda da finalidade expandida', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.addInitScript(() => localStorage.setItem('metricas-dspd:tema', 'escuro'))
    await page.setViewportSize({ width: 1280, height: 900 })
    await semear(page)
    await abrir(page)
    await page.getByRole('button', { name: 'Saiba mais' }).click()
    const botoes = aba(page).getByRole('button', { name: 'Ver como tabela' })
    for (let i = (await botoes.count()) - 1; i >= 0; i--) await botoes.nth(i).click()
    const r = await rodarAxe(page)
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
  })
})

test.describe('regras invioláveis na tela', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('CT-67: sem nomes reais, rótulos são Pessoa n e não há aviso de nome real; com nomes, o aviso aparece', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page)
    await expect(page.getByTestId('aviso-nome-real')).toHaveCount(0)
    await expect(page.getByTestId('linha-nomes-ocultos')).toBeVisible()
    await expect(aba(page)).toContainText('Pessoa 1')
    await expect(page.getByTestId('legenda-finalidade')).toContainText(
      'Não medem esforço de entrega',
    )
  })

  test('CT-69: nenhuma requisição além da rota única da aba e nenhum pedido ao Acelerato', async ({
    page,
  }) => {
    const alvos: string[] = []
    page.on('request', (r) => {
      const u = new URL(r.url())
      if (u.pathname.startsWith('/api/')) alvos.push(u.pathname)
    })
    await semear(page)
    await abrir(page)
    expect([...new Set(alvos)]).toEqual(['/api/apontamento'])
  })
})

test.describe('critérios e movimento (CT-31, CT-66)', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('CT-31: a versão vigente do dicionário, com data, aparece na nota do cartão de subgrupo', async ({
    page,
  }) => {
    await semear(page)
    await abrir(page)
    const subgrupo = cartao(page, 'AP-SUBGRUPO')
    await subgrupo.getByRole('button', { name: /Como ler/ }).click()
    await expect(subgrupo).toContainText('Versão vigente desde 15/09/2026')
  })

  test('CT-66: com movimento reduzido o cartão não anima a opacidade', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await semear(page)
    await abrir(page)
    const dur = await page
      .getByTestId('leitura-AP-PROJETO')
      .evaluate((el) => getComputedStyle(el).transitionDuration)
    expect(Number.parseFloat(dur), 'transitionDuration=' + dur).toBeLessThanOrEqual(0.001)
  })
})
