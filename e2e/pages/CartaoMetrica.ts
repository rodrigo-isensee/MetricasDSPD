import { expect, type Locator, type Page } from '@playwright/test';

/** Estados do cartão (`data-estado`, contrato proposto ao react-frontend; ver plano rev. 2, R2.7). */
export type EstadoCartao = 'carregando' | 'atualizando' | 'pronto' | 'vazio' | 'insuficiente' | 'erro';

/** Um cartão de métrica: `metrica-{codigo}` e filhos pela convenção de testids da spec (seção 10). */
export class CartaoMetrica {
  readonly raiz: Locator;
  readonly base: Locator;
  readonly nota: Locator;
  readonly tabela: Locator;
  readonly insuficiente: Locator;
  readonly vazio: Locator;
  readonly erro: Locator;
  readonly carregando: Locator;
  readonly marcadorCriterio: Locator;
  readonly leitura: Locator;

  /** @param codigo em MAIÚSCULAS: O2, T9, S1, BLOQUEADOS, EI-FL1... */
  constructor(
    private readonly page: Page,
    readonly codigo: string,
  ) {
    this.raiz = page.getByTestId(`metrica-${codigo}`);
    this.base = page.getByTestId(`base-${codigo}`);
    this.nota = page.getByTestId(`nota-${codigo}`);
    this.tabela = page.getByTestId(`tabela-${codigo}`);
    this.insuficiente = page.getByTestId(`amostra-insuficiente-${codigo}`);
    this.vazio = page.getByTestId(`estado-vazio-${codigo}`);
    this.erro = page.getByTestId(`estado-erro-${codigo}`);
    this.carregando = page.getByTestId(`estado-carregando-${codigo}`);
    this.marcadorCriterio = this.raiz.getByTestId('marcador-criterio');
    this.leitura = page.getByTestId(`leitura-${codigo}`);
  }

  /** `id` de âncora = código em minúsculas (critério 7). */
  get ancora(): string {
    return this.codigo.toLowerCase();
  }

  get tentarDeNovo(): Locator {
    return this.erro.getByRole('button', { name: 'Tentar de novo' });
  }

  get botaoNota(): Locator {
    return this.raiz.getByRole('button', { name: 'Como ler e como é calculado' });
  }

  get verComoTabela(): Locator {
    return this.raiz.getByRole('button', { name: /Ver (como|dados em) tabela/ });
  }

  async estado(): Promise<string | null> {
    return this.raiz.getAttribute('data-estado');
  }

  async esperarEstado(estado: EstadoCartao | RegExp): Promise<void> {
    await expect(this.raiz).toHaveAttribute('data-estado', estado);
  }

  async esperarPronto(): Promise<void> {
    await expect(this.raiz).toBeVisible();
    await expect(this.raiz).not.toHaveAttribute('aria-busy', 'true');
    await expect(this.carregando).toHaveCount(0);
  }

  /** "n de 20 itens mínimos" do estado de amostra insuficiente; `null` se o estado não aparece. */
  async amostraInsuficiente(): Promise<{ n: number; minimo: number } | null> {
    if (!(await this.insuficiente.isVisible())) return null;
    const m = (await this.insuficiente.innerText()).match(/(\d+) de (\d+) (?:itens|projetos|frentes)/);
    return m ? { n: Number(m[1]), minimo: Number(m[2]) } : null;
  }

  /** Número de itens do BadgeBase ("em 384 itens"), ou null. */
  async baseItens(): Promise<number | null> {
    const m = (await this.base.innerText()).replace(/\./g, '').match(/(\d+)\s*(?:itens|projetos|frentes|chamados|cards|demandas)/i);
    return m ? Number(m[1]) : null;
  }

  async cabecalhosDeTabela(): Promise<string[]> {
    return (await this.tabela.locator('th').allInnerTexts()).map((t) => t.trim());
  }

  async abrirNota(): Promise<void> {
    await this.botaoNota.click();
    await expect(this.botaoNota).toHaveAttribute('aria-expanded', 'true');
  }

  async rolarAte(): Promise<void> {
    await this.raiz.scrollIntoViewIfNeeded();
  }
}
