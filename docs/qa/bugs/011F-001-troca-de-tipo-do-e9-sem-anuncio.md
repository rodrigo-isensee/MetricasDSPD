# 011F-001 - Troca de tipo no E9 não é anunciada a leitor de tela
- Estado: **fechado** em 0a75f63 (correção 65fcd72; reconferido pelo QA: região `role="status"` `aria-live="polite"` do E9 muda de texto na troca de tipo, ET-06 e `ui.test.tsx`; demais usos do `SeletorLocal` sem a região).
- Severidade: baixa
- Responsável sugerido: react-frontend
- Ambiente: `feature/011-front-estrategicas` (dc2c9c0), Chromium (Playwright), mock

## Passos para reproduzir
1. Abrir `/estrategico` e expandir "Mais métricas deste painel".
2. No E9, focar a aba selecionada ("Melhoria") e apertar `Home` ou as setas.

## Resultado esperado
Além do foco e do `aria-selected` da aba, a linha "Mostrando N de M projetos (tipo X)" e o gráfico novo são anunciados (região `aria-live="polite"` ou `tabpanel` rotulado pela aba), como a UX pediu verificar (revisão de UX, seção 5).

## Resultado obtido
`SeletorLocal` é um `tablist` sem `tabpanel` associado nem região `aria-live`: o leitor anuncia a aba ("Iniciativa (0), aba, 1 de 2"), mas não o novo conteúdo. O foco fica visível (outline global 2 px, verificado no ET-06) e o teclado funciona; o defeito é só o anúncio da mudança de conteúdo. O componente é compartilhado (`web/src/components/ui/SeletorLocal.tsx`), então a correção vale para os demais usos.

## Evidência
`e2e/tests/estrategico-011-lote1.spec.ts` ET-06 (foco, `aria-selected`, texto muda). O `aria-live` ausente foi confirmado por leitura do componente e do snapshot de acessibilidade do Playwright (sem `tabpanel`).
