import { expect, type Locator, type Page } from '@playwright/test';

export type FiltroId = 'equipe' | 'tipo' | 'sistema' | 'periodo' | 'prioridade';

/** Barra de filtros (spec 2.4): botões com popover, chips, "Limpar filtros", folha em < 768 px. */
export class BarraFiltros {
  readonly barra: Locator;
  readonly limpar: Locator;
  readonly consolidado: Locator;
  readonly invalidos: Locator;
  readonly naoAplicaveis: Locator;
  readonly abrirFolha: Locator;
  readonly regiaoAnuncios: Locator;

  constructor(private readonly page: Page) {
    this.barra = page.getByTestId('barra-filtros');
    this.limpar = page.getByTestId('limpar-filtros');
    this.consolidado = page.getByTestId('aviso-consolidado');
    this.invalidos = page.getByTestId('aviso-filtros-invalidos');
    this.naoAplicaveis = page.getByTestId('aviso-filtros-nao-aplicaveis');
    this.abrirFolha = page.getByTestId('abrir-filtros');
    this.regiaoAnuncios = page.locator('[aria-live="polite"]');
  }

  botao(filtro: FiltroId): Locator {
    return this.page.getByTestId(`filtro-${filtro}`);
  }

  /** Abre o popover, marca/desmarca `opcoes` por rótulo visível e fecha com Esc (foco volta ao botão). */
  async alternar(filtro: FiltroId, opcoes: string[]): Promise<void> {
    await this.botao(filtro).click();
    for (const nome of opcoes) {
      const item = this.page.getByRole('checkbox', { name: nome }).or(this.page.getByRole('radio', { name: nome }));
      await item.first().click();
    }
    await this.page.keyboard.press('Escape');
    await expect(this.botao(filtro)).toBeFocused();
  }

  chip(nome: string | RegExp): Locator {
    return this.page.getByTestId(/^chip-filtro-/).filter({ hasText: nome });
  }

  botaoRemover(rotulo: string): Locator {
    return this.page.getByRole('button', { name: `Remover filtro ${rotulo}` });
  }

  /** Texto do aviso de consolidação como número de equipes, ou null se ausente. */
  async equipesConsolidadas(): Promise<number | null> {
    await expect(this.page.locator('[aria-busy="true"]')).toHaveCount(0); // espera os cartões carregarem antes de ler o rótulo
    if (!(await this.consolidado.isVisible())) return null;
    const m = (await this.consolidado.innerText()).match(/consolidado de (\d+) equipes/i);
    return m ? Number(m[1]) : null;
  }

  /** Parâmetros da URL atual, sem `mock`. */
  parametros(): URLSearchParams {
    return new URL(this.page.url()).searchParams;
  }
}
