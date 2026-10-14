import { describe, expect, it } from 'vitest'
import { CHAVE_PREFERENCIAS, PREFERENCIAS_PADRAO, cartoesDoPainel } from '@metricas-dspd/contratos'
import { LocalStoragePreferencias, ocultosDaSugestao, ocultosValidos } from './fonte'

function armazenamentoFalso(inicial?: string) {
  const dados = new Map<string, string>(
    inicial === undefined ? [] : [[CHAVE_PREFERENCIAS, inicial]],
  )
  return {
    dados,
    getItem: (k: string) => dados.get(k) ?? null,
    setItem: (k: string, v: string) => void dados.set(k, v),
  }
}

describe('LocalStoragePreferencias', () => {
  it('sem nada guardado, devolve o padrão (tudo visível) e diz que é do navegador', async () => {
    const f = new LocalStoragePreferencias(armazenamentoFalso())
    expect(f.origem).toBe('navegador')
    expect(await f.obter()).toEqual(PREFERENCIAS_PADRAO)
  })

  it('JSON quebrado ou formato inválido viram o padrão, nunca um erro', async () => {
    expect(await new LocalStoragePreferencias(armazenamentoFalso('{nao-json')).obter()).toEqual(
      PREFERENCIAS_PADRAO,
    )
    expect(await new LocalStoragePreferencias(armazenamentoFalso('{"versao":9}')).obter()).toEqual(
      PREFERENCIAS_PADRAO,
    )
  })

  it('perfil de versão futura: lê o padrão e nunca é sobrescrito (A6)', async () => {
    const guardado = '{"versao":2,"paineis":{"operacional":{"ocultar":["o9"]}}}'
    const arm = armazenamentoFalso(guardado)
    const f = new LocalStoragePreferencias(arm)
    expect(await f.obter()).toEqual(PREFERENCIAS_PADRAO)
    await expect(f.salvar(PREFERENCIAS_PADRAO)).rejects.toThrow('versão mais nova')
    expect(arm.dados.get('metricas-dspd:preferencias:v1')).toBe(guardado)
  })

  it('perfil corrompido: lê o padrão sem gravar, e a primeira escolha grava versao 1 (A6)', async () => {
    for (const lixo of ['{nao-json', 'null', '"x"', '{"versao":"2"}', '{"versao":1,"paineis":3}']) {
      const arm = armazenamentoFalso(lixo)
      const f = new LocalStoragePreferencias(arm)
      expect(await f.obter()).toEqual(PREFERENCIAS_PADRAO)
      expect(arm.dados.get('metricas-dspd:preferencias:v1')).toBe(lixo)
      const p = { ...PREFERENCIAS_PADRAO, atualizadoEm: '2026-10-14T00:00:00.000Z' }
      await f.salvar(p)
      expect(await f.obter()).toEqual(p)
    }
  })

  it('grava e lê de volta com a chave versionada', async () => {
    const arm = armazenamentoFalso()
    const f = new LocalStoragePreferencias(arm)
    const p = {
      versao: 1 as const,
      paineis: { operacional: { ocultar: ['o9'] } },
      atualizadoEm: '2026-10-10T00:00:00.000Z',
    }
    await f.salvar(p)
    expect(arm.dados.has('metricas-dspd:preferencias:v1')).toBe(true)
    expect(await f.obter()).toEqual(p)
  })

  it('falha de gravação rejeita (a tela mantém a escolha e avisa)', async () => {
    const f = new LocalStoragePreferencias({
      getItem: () => null,
      setItem: () => {
        throw new Error('cota')
      },
    })
    await expect(f.salvar(PREFERENCIAS_PADRAO)).rejects.toThrow('cota')
  })

  it('usa o localStorage do navegador por padrão', async () => {
    const f = new LocalStoragePreferencias()
    await f.salvar(PREFERENCIAS_PADRAO)
    expect(await f.obter()).toEqual(PREFERENCIAS_PADRAO)
  })
})

describe('ocultosValidos', () => {
  it('ignora em silêncio ids inexistentes, de outro painel e repetidos', () => {
    expect(ocultosValidos('operacional', ['o9', 'o9', 'xx', 't5'])).toEqual(['o9'])
    expect(ocultosValidos('operacional', undefined)).toEqual([])
  })

  it('mapeia ids retirados para o novo ou descarta (CARTOES_RETIRADOS)', () => {
    const retirados = { antigo: 'o9', morto: null }
    expect(ocultosValidos('operacional', ['antigo', 'morto', 'o2'], retirados)).toEqual([
      'o9',
      'o2',
    ])
  })
})

describe('ocultosDaSugestao', () => {
  it('time: só o Operacional visível; gerente: Tático e Estratégico; nada é gravado como papel', () => {
    const time = ocultosDaSugestao('time')
    expect(time.operacional).toEqual([])
    expect(time.tatico).toHaveLength(cartoesDoPainel('tatico').length)
    const gerente = ocultosDaSugestao('gerente')
    expect(gerente.tatico).toEqual([])
    expect(gerente.estrategico).toEqual([])
    expect(gerente.sustentacao).toHaveLength(cartoesDoPainel('sustentacao').length)
    expect(ocultosDaSugestao('coordenador').tatico).toEqual([])
  })
})
