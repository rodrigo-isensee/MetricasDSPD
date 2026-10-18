# Revisão de UX do 024: nome do E7 ("Entregas por sistema")

Data: 2026-10-17. Revisor: ux-designer. Base: delta `024-delta-ux.diff` (2 arquivos, 28 linhas) contra `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (§5 E7, §11 e linha 15 de `01-cobertura.md`). Decisão do dono: pedido 021, opção A (= A-10 da revisão 011). Leitura do código na worktree `-024`, sem gravar nada lá.

## Mudança 1: `web/src/content/catalogo-metricas.ts` (nome do E7)
Troca "Capacidade por sistema" por "Entregas por sistema".
- Texto: igual ao título da §5 da especificação ("### E7 Entregas por sistema") e ao registro da §11. Conforme.
- Maiúsculas: só a inicial maiúscula, como os demais nomes do catálogo e da especificação. Conforme.
- Consistência: o catálogo (`catalogo-metricas.ts:534`) e o título do cartão passam a coincidir, e o teste `estrategicas.test.tsx:463-466` trava as duas fontes e a ausência do nome antigo.
- Nome coerente com o que o cartão mostra (participação nas entregas, sem R$; CA-13): melhora a correspondência com o mundo real (Nielsen).
- WCAG 2.2 AA: texto puro, sem mudança de contraste, foco ou alvo. Nada a aplicar.
- Veredito: aprovado.

## Mudança 2: `web/src/features/complementares/estrategicas.tsx` (texto "Leia junto" do E8)
Troca "Leia junto com a capacidade por sistema (E7)" por "Leia junto com as entregas por sistema (E7)".
- Texto: o nome em minúsculas no meio da frase segue o padrão de prosa; o artigo muda para "as" (feminino plural), gramática correta. A referência "(E7)" permanece e liga ao cartão. Conforme.
- Consistência: o E8 volta a concordar com o título do cartão vizinho (achado A-7 da revisão de código, fechado). Não resta o nome antigo na interface (busca em `web/src`: só o teste de ausência).
- Especificação: §5 E8 manda "Leia junto: E7"; o nome em si não é fixado pelo texto do E8, então não há conflito.
- WCAG 2.2 AA: o texto é lido por leitor de tela como frase corrida; sem dependência de cor ou posição (1.3.1, 3.1.5 sem impacto). Nada a aplicar.
- Veredito: aprovado.

## Observações (não bloqueiam)
1. A pergunta do E7 no catálogo ("Quanto da nossa capacidade vai para manter cada sistema do parque?") ainda usa "capacidade". A especificação (§11) diz que a pergunta não muda neste pedido, então está conforme. Sugestão para depois, sujeita a decisão do dono: reformular para "Qual a participação de cada sistema nas nossas entregas?", que casa com o novo nome e com CA-13.
2. Restos do nome antigo fora da interface e aceitos: `criterios.ts:109` (registro datado de mudança de critério, deve permanecer), `docs/qa/` e `docs/reviews/` (histórico), `02-especificacao.md:10` (lista de temas, não o nome do cartão).
3. Fora do escopo, não reavaliadas: A-9, A-11 e `aria-hidden` do ícone `info`.

## Veredito final
**Aprovado.** As duas mudanças do delta cumprem a especificação validada e a decisão do dono (texto, maiúsculas e consistência entre catálogo, título do cartão e texto do E8). Zero achado crítico, alto, médio ou baixo. Sem impacto em WCAG 2.2 AA. Duas observações informativas acima, sem ação exigida para o PR.
