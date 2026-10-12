# 0012 - Biblioteca de gráficos (Recharts encapsulado)
Estado: vigente
- Status: aceita
- Data: 2026-10-10
- Relacionadas: ADR 0001 (escolha original e comparação detalhada), ADR 0003 (orçamento F8), ADR 0011 (nenhum componente calcula)

## Contexto
Os painéis FL1–FL3 e de sustentação usam histograma, faixas de percentis, dispersão, CFD/áreas empilhadas e linhas de referência (WIP, percentil, mudança de critério T2.6). A escolha foi feita na ADR 0001 e o peso limitado na ADR 0003; esta ADR registra a decisão de forma autônoma e as regras de uso, sem repetir a comparação.

## Decisão
1. **Recharts 3 (SVG).** Motivos e recursos usados: ADR 0001 §Gráficos.
2. **Isolamento em `web/src/components/charts/`.** Nenhum painel ou feature importa `recharts` diretamente (regra de lint `no-restricted-imports`). Os componentes recebem séries já calculadas por `@metricas-dspd/metricas` (ADR 0011); histograma é `BarChart` sobre faixas prontas.
3. **Acessibilidade por tabela alternativa.** Todo gráfico tem tabela de dados equivalente (alternável e lida por leitor de tela), mais `accessibilityLayer`. Testes de conteúdo usam a tabela, não o SVG; axe e E2E cobrem a tabela.
4. **Chunk sob demanda.** Recharts e `components/charts` ficam em chunk próprio, carregado por `lazy` só nas rotas com gráfico; fora do chunk inicial.
5. **Orçamento.** Chunk de gráficos < 130 KB gzip (F8, ADR 0003), verificado no CI. Se estourar: primeiro importações por submódulo, depois revisão desta ADR.

## Alternativas consideradas
Detalhe na ADR 0001. Resumo:
- **Apache ECharts:** completo e rápido em canvas; ~300 KB gz, canvas também exige tabela alternativa, tema fora dos tokens CSS. Descartada por peso.
- **Visx / D3 direto:** controle total e bundle pequeno; tudo (eixos, legenda, tooltip, teclado) seria código nosso. Descartada por custo de manutenção.
- **Nivo / Chart.js:** Nivo tem um pacote por tipo e exige camadas customizadas para faixas e referências; Chart.js é canvas com acessibilidade fraca. Descartadas.

## Consequências
- Mais fácil: troca de biblioteca afeta só `components/charts/`; tema claro/escuro via CSS variables; acessibilidade garantida pela tabela.
- Mais difícil: cada tipo novo de gráfico entra em `components/charts/` com sua tabela; jsdom precisa de `ResizeObserver` simulado.
- Riscos: volume de pontos com dados reais pode pesar em SVG; mitigação prevista (amostragem no servidor ou canvas para dispersões) fica contida no encapsulamento.
