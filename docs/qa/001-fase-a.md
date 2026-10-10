# Parecer de QA 001 - Fase A (K-004, K-022, retrabalho K-027..K-029)
Código: develop @ 252bed4. Ambiente: `vite preview` com `VITE_MOCK_LATENCIA=0`, Chromium headless local, pt-BR. Plano: `docs/qa/plano-testes-dashboard-mock.md`.

## Resultado da execução
- E2E Chromium (`cd e2e && npx playwright test --project=chromium`): **71 aprovados, 7 falhos** (todos por defeitos reais, nenhum teste pulado). Especificações em `e2e/tests/`: `shell`, `filtros`, `estados`, `a11y`, `responsivo`.
- axe (wcag2a, wcag2aa, wcag22aa): 31 execuções (9 rotas e 4 estados x 2 temas, overlays abertos, 375 px). **0 violações** críticas, sérias ou menores. Resumo: `docs/qa/evidencias/fase-a/axe-resumo.json`.
- `npm run gate` (e2e): **APROVADO** (fronteiras, hash da base idêntico, bundle: gráficos 104,5 KB gz < 130, mock+lib 26,6 KB, fora do chunk inicial).
- `web` `npm test`: 333 testes passam, 1 arquivo falha: `src/mock/desempenho.test.ts` (O1 a frio 208 ms > 150 ms). Instável sob carga (outras rodadas na mesma máquina); **reporto, não corrijo**; o orçamento de teste depende da máquina (react-frontend deve avaliar).

## Cenários cobertos (aprovados salvo indicação)
NAV-01..06,08,09,12; AVI-01..03; ST-01,03,03b,04,05b,10,12,12b,12c,13; FIL-01..10,12,13,16,19,22; A11Y-01..04,13(falha),14,15; RESP-01 (320..1920, 7 rotas), RESP-05; A7; M6.
Reprovados: ST-05 (bug 002), A7 em 1024/1100/1180/1200 (bug 003), FIL-04 (bug 004), A11Y-13 (bug 005).

## Verificações pedidas pela UX
- **A7:** a altura real do cabeçalho agora é medida (`--h-cabecalho` = 87 px em 1024-1180 px, 49 px a 1280), e o `scroll-padding` acompanha. Mas o cabeçalho ainda quebra em 2 linhas até ~1200 px, e a barra de filtros **não fica sticky** em nenhuma largura (bug 003).
- **M6:** a 320 px os rótulos do eixo X do O4 não colidem (o Recharts mostra 4 de 12 datas: 20/07, 10/08, 31/08, 05/10) e não há rolagem horizontal. Observação: o eixo Y segue sem unidade escrita no eixo (só no texto de leitura e na tabela).
- Os gráficos só renderizam depois de entrarem na viewport (testes rolam até o cartão).

## Medições (perf, 1366x768, `npm run test:perf`, build com latência 0)
- F1 LCP em `/` (n=20): p95 100-156 ms (orçamento 2,0 s). Com CPU 4x: 300-704 ms.
- F4 resposta visual na troca de filtro: p95 21 ms. F5 painel atualizado (Operacional): mediana 19 ms, p95 323 ms (n=20; 2 outliers). F3 INP 32 ms. CLS `/` 0,001.
- C6 maior tarefa longa em `/`: 190 ms e 447 ms em duas rodadas: **instável** (varia com carga da máquina), reprovou na segunda. Como o projeto é `serial`, a falha interrompe as demais rotas; medi F3/F4/F5 e C5 isoladamente. C5 (heap) retorna NaN: a métrica `JSHeapUsedSize` não vem do CDP no headless-shell; ajustar a medição antes da pré-entrega.
- Ressalva: com `VITE_MOCK_LATENCIA=0` a F5 não inclui a latência simulada.

## Bugs (por severidade)
- Média: 002 vazio mostra também "Amostra insuficiente: 0 de 20" (react-frontend); 003 barra de filtros não fica sticky e cabeçalho quebra de 1024 a 1200 px (react-frontend).
- Baixa: 004 marcar todas as equipes não remove `equipe` e vírgula codificada `%2C` (react-frontend); 005 link da marca com 28 px a 375 px (react-frontend); 006 script de setup do Chromium falhava sem `apt-file` (corrigido por QA).
- Nenhum bug crítico ou alto.

## Esclarecimentos de regra (não são bugs)
Spec 6.2/FIL-10: a mensagem de consolidação aparece também em "Todas" (6 equipes), como a spec manda; o plano antigo (FIL-10) dizia o contrário e foi seguido o texto da spec.

## Pacote para a UX (M-010)
`docs/qa/evidencias/fase-a/`: `operacional-{320,768,1024,1100,1180,1280}-{claro,escuro}.png` (página inteira, cartão O4), `estado-{carregando,vazio,erro,erro-de-painel,amostra-insuficiente}-{claro,escuro}.png`, `axe-resumo.json`. Regerar: `node e2e/scripts/evidencias-fase-a.mjs` com o preview em :4173.

## Pendências
Navegação por setas nas barras (A11Y-16), Firefox/WebKit (só CI), teclado completo (A11Y-06/07 em todos os focáveis) e tema forçado/escala de cinza (A11Y-09) ficam para a fase B, quando houver mais cartões.

Critério de pronto da fase A: sem críticos/altos e axe zerado; **dois médios abertos** (002, 003) devem voltar ao react-frontend antes da fase B.
