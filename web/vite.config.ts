/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    chunkSizeWarningLimit: 600,
    // F8 (ADR 0003): gráficos (Recharts + components/charts) em chunk próprio, carregado só pelas rotas com gráfico.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler|clsx)[\\/]|vite[\\/]preload-helper/,
              priority: 20,
            },
            // F11 (ADR 0003): jsPDF em chunk próprio, só sob demanda (sem svg2pdf, que estourou o orçamento).
            // O helper de preload fica no chunk inicial: sem isso o rolldown o coloca aqui e o jsPDF vira dependência estática.
            {
              name: 'exportar-pdf',
              priority: 15,
              test: /node_modules[\\/](jspdf|fflate|fast-png|iobuffer|svg-pathdata)[\\/]/,
            },
            {
              name: 'graficos',
              priority: 10,
              test: /node_modules[\\/](recharts|d3-[a-z-]+|victory-vendor)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
    testTimeout: 15000,
    // K-054: render pesado (jsdom + Recharts) é CPU-bound; com todos os núcleos o tempo por teste
    // estourava sob carga. 4 workers mantêm o tempo total e baixam o pico por teste de ~15 s para ~4 s.
    maxWorkers: 4,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        // Exclusões permitidas por docs/qa/estrategia-de-cobertura.md (K-057):
        'src/main.tsx', // entrypoint trivial (createRoot + render), sem lógica.
        'src/features/painel/PlaceholderPainel.tsx', // sem uso: restou da fase A; remoção pendente de aprovação.
      ],
    },
  },
})
