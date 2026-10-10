import { expect, type Locator, type Page } from '@playwright/test';

/** Cabeçalho global, navegação, tema e rodapé (spec 1.2). */
export class Cabecalho {
  readonly nav: Locator;
  readonly aviso: Locator;
  readonly seletorTema: Locator;
  readonly ajuda: Locator;
  readonly menu: Locator;
  readonly pularConteudo: Locator;
  readonly rodape: Locator;

  constructor(private readonly page: Page) {
    this.nav = page.getByRole('navigation', { name: /principal|navegação/i }).first();
    this.aviso = page.getByTestId('aviso-dados-ficticios');
    this.seletorTema = page.getByTestId('seletor-tema'); // nome acessível "Tema" (spec 10, L5)
    this.ajuda = page.getByRole('link', { name: 'Ajuda' }).first();
    this.menu = page.getByRole('button', { name: 'Menu' });
    this.pularConteudo = page.getByRole('link', { name: 'Pular para o conteúdo' });
    this.rodape = page.getByRole('contentinfo');
  }

  /** Destinos na ordem do DOM (critério 2). */
  async destinos(): Promise<string[]> {
    return (await this.nav.getByRole('link').allInnerTexts()).map((t) => t.trim()).filter(Boolean);
  }

  linkPara(nome: string | RegExp): Locator {
    return this.nav.getByRole('link', { name: nome });
  }

  async itemAtual(): Promise<string | null> {
    const atual = this.nav.locator('[aria-current="page"]');
    return (await atual.count()) ? ((await atual.first().innerText()).trim()) : null;
  }

  async escolherTema(tema: 'Claro' | 'Escuro' | 'Sistema'): Promise<void> {
    await this.seletorTema.click();
    await this.page.getByRole('option', { name: tema }).or(this.page.getByRole('radio', { name: tema })).or(this.page.getByRole('menuitemradio', { name: tema })).first().click();
  }

  async esperarAvisoFicticio(): Promise<void> {
    await expect(this.aviso).toBeVisible();
    await expect(this.aviso).toContainText('Dados fictícios');
  }
}
