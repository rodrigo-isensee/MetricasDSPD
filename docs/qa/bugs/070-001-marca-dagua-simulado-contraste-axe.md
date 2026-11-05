# 070-001 - Marca d'água "SIMULADO" reprova no axe (color-contrast, séria)
- Severidade: alta (critério de pronto: zero violações de acessibilidade sérias ou críticas)
- Responsável sugerido: react-frontend (`web/src/components/ui/SeloSimulado.tsx`, `MarcaDaguaSimulado`)
- Ambiente: branch feature/070-l3-e2e (base develop 0a4f139), Chromium, SPA em VITE_FONTE=api, 1280 px

## Passos para reproduzir
1. Subir `server/tests/pg/api-stub-065.ts` (PORT=3199) e rodar, em `e2e/`, `E2E_API_URL=http://127.0.0.1:3199 pnpm exec playwright test --project=chromium-api tests-api/simulado-070-l3.spec.ts -g T-E6`.
2. O teste abre a Sustentação (S1 e S7 simulados, com selo) e roda o axe com as tags WCAG 2.2 AA.

## Resultado esperado
Zero violações sérias ou críticas.

## Resultado obtido
`color-contrast` (séria) em 2 nós: `[data-testid="marca-dagua-simulado"] > .-rotate-12.text-4xl.opacity-15` nos cartões `#s1` e `#s7`. A marca é `aria-hidden` e decorativa, mas o axe mede o contraste do texto com `opacity-15`.

## Evidência
Teste `T-E6` em `e2e/tests-api/simulado-070-l3.spec.ts` (vermelho; não foi pulado). Saída do axe: id `color-contrast`, impacto `serious`, nos 2.
