import { expect, type Locator, type Page } from '@playwright/test';
import { SLUG_PAINEL } from '../fixtures/constantes';
import { BarraFiltros } from './BarraFiltros';
import { CartaoMetrica } from './CartaoMetrica';
import { Cabecalho } from './Cabecalho';

/** Página genérica de painel (rotas da spec 1.1). Compõe cabeçalho, filtros e cartões. */
export class PainelPage {
  readonly cabecalho: Cabecalho;
  readonly filtros: BarraFiltros;
  readonly h1: Locator;
  readonly main: Locator;
  readonly faixaAtencao: Locator;
  readonly cadencia: Locator;
  readonly erroDePainel: Locator;
  readonly naoEncontrada: Locator;

  constructor(readonly page: Page) {
    this.cabecalho = new Cabecalho(page);
    this.filtros = new BarraFiltros(page);
    this.h1 = page.getByRole('heading', { level: 1 });
    this.main = page.getByRole('main');
    this.faixaAtencao = page.getByTestId('faixa-atencao');
    this.cadencia = page.getByTestId('seletor-cadencia');
    this.erroDePainel = page.getByRole('heading', { name: 'Não foi possível abrir este painel' });
    this.naoEncontrada = page.getByRole('heading', { name: 'Página não encontrada' });
  }

  cartao(codigo: string): CartaoMetrica {
    return new CartaoMetrica(this.page, codigo);
  }

  painel(rota: keyof typeof SLUG_PAINEL | string): Locator {
    const slug = (SLUG_PAINEL as Record<string, string>)[rota] ?? rota;
    return this.page.getByTestId(`painel-${slug}`);
  }

  /** Abre a rota. `mock` aplica `?mock=` (spec 6.6) sem interferir nos demais parâmetros. */
  async ir(rota: string, opcoes: { mock?: string } = {}): Promise<void> {
    const url = new URL(rota, 'http://x');
    if (opcoes.mock) url.searchParams.set('mock', opcoes.mock);
    await this.page.goto(url.pathname + url.search + url.hash);
    await expect(this.h1).toBeVisible();
    // Com o mock no Worker (ADR 0021) o estado de coleta chega depois do h1; até lá o painel é só o bloco reservado.
    await expect(this.page.getByTestId('aguardando-coleta')).toHaveCount(0);
  }

  /** Códigos dos cartões presentes, na ordem do DOM. */
  async codigosDosCartoes(): Promise<string[]> {
    const ids = await this.page.locator('[data-testid^="metrica-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid') ?? ''));
    return ids.map((id) => id.replace(/^metrica-/, ''));
  }

  /**
   * Helper único de "painel pronto": espera por estado (h1, `aguardando-coleta`, `aria-busy`, `estado-carregando-*`),
   * nunca por tempo. Com `resumo`, espera também as duas tendências do resumo do Operacional.
   */
  async esperarPronto(opcoes: { resumo?: boolean } = {}): Promise<void> {
    const cartoes = this.page.locator('[data-testid^="metrica-"]');
    const ocupados = this.page.locator('[aria-busy="true"]');
    // Fase 0: enquanto o estado de coleta e as preferências não chegam (o mock calcula no Worker, ADR 0021), o painel
    // mostra só o cabeçalho e o bloco reservado `aguardando-coleta`; os cartões ainda não existem no DOM.
    await expect(this.page.getByTestId('aguardando-coleta')).toHaveCount(0, { timeout: 30_000 });
    // Fase A: rotas sem cartões (Visão geral e placeholders) só precisam do h1.
    await expect(cartoes.first().or(this.h1).first()).toBeVisible();
    await expect(this.h1).toBeVisible();
    await expect(ocupados).toHaveCount(0, { timeout: 30_000 });
    await expect(this.page.locator('[data-testid^="estado-carregando-"]')).toHaveCount(0);
    await expect(this.page.locator('[data-testid^="metrica-"][data-estado="carregando"], [data-testid^="metrica-"][data-estado="atualizando"]')).toHaveCount(0, { timeout: 30_000 });
    if (opcoes.resumo) {
      await expect(this.page.getByTestId('tendencia-fluxo')).toBeVisible({ timeout: 30_000 });
      await expect(this.page.getByTestId('tendencia-sustentacao')).toBeVisible({ timeout: 30_000 });
      await expect(ocupados).toHaveCount(0);
    }
  }

  /** Foco atual é o h1 (critério 4). */
  async focoNoH1(): Promise<void> {
    await expect(this.h1).toBeFocused();
  }

  /** Parâmetros da URL (sem o hash). */
  get url(): URL {
    return new URL(this.page.url());
  }
}
