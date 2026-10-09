import type { Page } from '@playwright/test';

// Medição de troca de filtro (ADR 0003: F4 resposta visual < 100 ms; F5 painel atualizado < 500 ms).
//
// Contrato de DOM combinado com o react-frontend (PENDENTE de confirmação, ver plano rev. 2, seção R2.7):
//  - cada `[data-testid^="metrica-"]` tem `data-estado` em: carregando | atualizando | pronto | vazio | insuficiente | erro;
//  - a "indicação discreta de atualização" (D7) é `data-estado="atualizando"` nos cartões e/ou o texto
//    "Atualizando painel" na região aria-live.
// Sem `data-estado`, o helper cai para `aria-busy="true"` (esqueleto/cartão ocupado) e para a mudança do
// texto do `main`. Se nenhuma das duas existir o resultado vem com `motivo` e o teste do QA falha de forma explícita.

export interface MedicaoTroca {
  respostaVisualMs: number | null;
  painelAtualizadoMs: number | null;
  motivo?: string;
}

const SCRIPT = `
(() => {
  const w = window;
  if (w.__trocaFiltro) return;
  const ocupado = () => !!document.querySelector(
    '[data-testid^="metrica-"][data-estado="carregando"], [data-testid^="metrica-"][data-estado="atualizando"], [data-testid^="metrica-"][aria-busy="true"]');
  const assinatura = () => (document.querySelector('main') || document.body).innerText.length + ':' + (document.querySelector('main') || document.body).innerText.slice(0, 4000);
  const respostaVisual = () => {
    // indicação de atualização OU chip novo do filtro (o chip é a confirmação visual do filtro aplicado)
    return ocupado() || w.__trocaFiltro.chips !== document.querySelectorAll('[data-testid^="chip-filtro-"]').length;
  };
  const estado = (w.__trocaFiltro = { t0: 0, visual: null, final: null, viuOcupado: false, assin: '', chips: 0, ativo: false });
  const checar = () => {
    if (!estado.ativo) return;
    const agora = performance.now();
    if (estado.visual === null && respostaVisual()) { estado.visual = agora; performance.mark('filtro-resposta-visual'); }
    if (ocupado()) estado.viuOcupado = true;
    if (estado.final === null && !ocupado() && (estado.viuOcupado || assinatura() !== estado.assin)) {
      estado.final = agora; performance.mark('painel-atualizado');
    }
  };
  new MutationObserver(checar).observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
  w.__trocaFiltro.armar = () => {
    estado.visual = null; estado.final = null; estado.viuOcupado = false;
    estado.assin = assinatura(); estado.chips = document.querySelectorAll('[data-testid^="chip-filtro-"]').length;
    estado.ativo = true; estado.t0 = performance.now(); performance.mark('filtro-clique');
  };
  w.__trocaFiltro.checar = checar;
})();
`;

export async function prepararMedicaoTroca(page: Page): Promise<void> {
  await page.evaluate(SCRIPT);
}

/**
 * Executa `acao` (o clique/seleção do filtro) e mede, em tempo de página, o intervalo entre o evento de clique
 * e (a) a primeira resposta visual, (b) o painel com todos os cartões em estado final.
 * A marca `filtro-clique` é gravada no listener de `click` em fase de captura, antes de qualquer código do app.
 */
export const SELETOR_OPCAO_FILTRO =
  'input[type="checkbox"], input[type="radio"], [role="checkbox"], [role="radio"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [data-testid^="chip-filtro-"] button, [data-testid="limpar-filtros"]';

export async function medirTrocaFiltro(
  page: Page,
  acao: () => Promise<void>,
  opcoes: { limiteMs?: number; seletorGatilho?: string } = {},
): Promise<MedicaoTroca> {
  const limiteMs = opcoes.limiteMs ?? 10_000;
  const seletor = opcoes.seletorGatilho ?? SELETOR_OPCAO_FILTRO;
  await prepararMedicaoTroca(page);
  // Só o clique que de fato aplica o filtro arma a medição (abrir o popover não conta). Listener único por página.
  await page.evaluate((sel) => {
    const w = window as unknown as { __trocaFiltro: { armar: () => void }; __trocaFiltroListener?: (ev: Event) => void };
    if (w.__trocaFiltroListener) document.removeEventListener('click', w.__trocaFiltroListener, true);
    w.__trocaFiltroListener = (ev: Event) => {
      if (ev.target instanceof Element && ev.target.closest(sel)) w.__trocaFiltro.armar();
    };
    document.addEventListener('click', w.__trocaFiltroListener, true);
  }, seletor);
  await acao();
  const resultado = await page
    .waitForFunction(
      () => {
        const e = (window as unknown as { __trocaFiltro: { final: number | null; visual: number | null; t0: number; checar: () => void } }).__trocaFiltro;
        e.checar();
        return e.final !== null ? { visual: e.visual, final: e.final, t0: e.t0 } : false;
      },
      undefined,
      { timeout: limiteMs, polling: 'raf' },
    )
    .then((h) => h.jsonValue())
    .catch(() => null);

  if (!resultado) {
    const parcial = await page.evaluate(() => {
      const e = (window as unknown as { __trocaFiltro: { visual: number | null; t0: number } }).__trocaFiltro;
      return { visual: e.visual, t0: e.t0 };
    });
    return {
      respostaVisualMs: parcial.visual === null ? null : parcial.visual - parcial.t0,
      painelAtualizadoMs: null,
      motivo: 'Painel não chegou ao estado final no limite (falta data-estado/aria-busy ou o conteúdo não mudou).',
    };
  }
  return {
    respostaVisualMs: resultado.visual === null ? null : resultado.visual - resultado.t0,
    painelAtualizadoMs: resultado.final - resultado.t0,
  };
}
