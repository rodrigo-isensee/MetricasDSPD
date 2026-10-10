#!/usr/bin/env node
// Gera os PNG do pacote da UX (M-010) em docs/qa/evidencias/fase-a/. Pré-requisito: vite preview em :4173.
// Uso: cd e2e && node scripts/evidencias-fase-a.mjs
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL ?? 'http://localhost:4173';
const dir = resolve(import.meta.dirname, '../../docs/qa/evidencias/fase-a');
mkdirSync(dir, { recursive: true });
const b = await chromium.launch();
for (const tema of ['claro', 'escuro']) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR' });
  await ctx.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), tema);
  const p = await ctx.newPage();
  for (const w of [320, 768, 1024, 1100, 1180, 1280]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.goto(`${base}/operacional`);
    await p.getByTestId('metrica-O4').scrollIntoViewIfNeeded();
    await p.locator('svg text').first().waitFor();
    await p.screenshot({ path: `${dir}/operacional-${w}-${tema}.png`, fullPage: true });
  }
  await p.setViewportSize({ width: 1280, height: 900 });
  const estados = { carregando: '?mock=carregando', vazio: '?mock=vazio', erro: '?mock=erro:o4', 'erro-de-painel': '?mock=erro', 'amostra-insuficiente': '?tipo=divida-tecnica&equipe=plataforma-5g' };
  for (const [nome, q] of Object.entries(estados)) {
    await p.goto(`${base}/operacional${q}`);
    await p.getByRole('heading', { level: 1 }).waitFor();
    await p.waitForLoadState('networkidle');
    await p.screenshot({ path: `${dir}/estado-${nome}-${tema}.png`, fullPage: true });
  }
  await ctx.close();
}
await b.close();
