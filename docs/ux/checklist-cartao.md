# Checklist de UX por cartão

O dev cola este bloco na descrição do cartão do Kanban e marca cada item com evidência (print, teste ou trecho). Revisão de UX só começa com todos marcados ou justificados. Spec: `docs/ux/dashboard-metricas/especificacao.md` (seções entre parênteses).

```markdown
### Checklist UX — <código do cartão, ex.: O3>
- [ ] 1. Texto da janela vem do parâmetro único, nunca digitado (4.0.3, J1)
- [ ] 2. Selo de janela/recorte visível no cartão ("12 semanas", período, equipe) (4.0)
- [ ] 3. Séries com cor e padrão (traço/marcador); legenda com os dois (8)
- [ ] 4. Alvos interativos ≥ 24×24 px, com foco visível (8, WCAG 2.5.8)
- [ ] 5. Unidade no eixo e nos valores ("dias úteis", "h úteis", "%") (4.0.4)
- [ ] 6. Base ("em N itens") e meta a 14 px ou mais; contraste ≥ 4.5:1 (4.0, 8)
- [ ] 7. Cor fixa por tipo/série, igual em todo o sistema (5, tokens de cor)
- [ ] 8. Variante de estado: lenta/alerta/dentro da meta com ícone + texto, não só cor (4.0, 6)
- [ ] 9. Estados: carregando, vazio, erro e amostra insuficiente (< 20) com o texto da spec (6, 6.3.1)
- [ ] 10. `data-testid` da convenção: metrica-, base-, tabela-, estado-vazio-{CÓDIGO} (10)
- [ ] 11. Tabela alternativa presente, com os mesmos números do gráfico (8)
- [ ] 12. "Remover filtro" funciona (URL + dados), e nenhum link interno carrega `mock` (2.6, 6.6)
```

Itens que dependem do cartão: se não se aplica (ex.: sem filtro no cartão), marque "n/a" com o motivo. Regras inegociáveis (sem pessoas, sem mistura de fontes ou granularidades, uma classe por vez onde a spec manda) têm revisão própria do code review.
