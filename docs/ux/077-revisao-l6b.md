# 077 · Revisão de interface do Lote 6b: ressalva do S2 na tendência de SLA (E2.6)

pedido: 077-tendencias-dado-real
branch: feature/077-l6b-tela-ressalva
commit: 1335576d27fca37b7e7781b18c5a31fc89dbc91a
autor: ux-designer, 2026-11-07
veredito: aprovado, sem achado crítico, alto ou médio; dois achados baixos, não bloqueiam

Base: `docs/ux/077-tendencias.md` (seção 2, seções 5 e 6, CA-8 a CA-11 e CA-13). Revisão só pelo código (`TendenciaSustentacao.tsx`, `SerieMensal.tsx`, `componentes.test.tsx`); nenhum item de acessibilidade foi medido com ferramenta, todos são `lido`.

## Conferência contra a especificação
| Item | Resultado | Evidência (lido) |
|---|---|---|
| Posição entre subtítulo e gráfico | conforme | `SerieMensal.tsx`: lista de notas (linhas 102-114) vem depois do bloco título/subtítulo e antes do gráfico; o teste compara a ordem no DOM |
| Texto do contrato, sem duplicar (CA-13) | conforme | `TendenciaSustentacao.tsx` linha 56 lê `TEXTO_NOTA_QUALQUER['excecao-sla-sem-fonte']`; texto igual ao de `origem.ts:168`; sem literal na web |
| Só com ponto publicado (CA-8) | conforme | `comNota` exige `notas` com o id e `sla.some(p => p.valor !== null)` |
| Sem nota no resultado, sem ressalva (CA-9) | conforme | `t.notas?.includes` falso, lista nem renderiza; teste CA-9 |
| Nunca nos chamados abertos (CA-10) | conforme | a série de volume não recebe `notas`; teste confere ausência e 1 só ocorrência do texto |
| Some com o S2 oculto (CA-11) | conforme | `verSla` falso, a série inteira (e a nota, que é filha dela) não renderiza; volume segue |
| Série vazia sem nota | conforme | sem ponto publicado `comNota` é falso; só o vazio aparece; teste dedicado |
| Visual igual ao do cartão do S2 | conforme | ícone `info` `size-3.5`, `text-xs text-texto-2`, mesma estrutura de `li` do `CartaoMetrica` |
| Microcopy da seção 6 | conforme | texto da nota idêntico ao da especificação |
| Nota visível na tabela alternativa | conforme | a lista fica fora do ramo gráfico/tabela |
| Sem depender de cor | conforme | informação em texto; ícone decorativo com `aria-hidden` (padrão de `Icone` sem título) |
| Leitor de tela | conforme | texto estático em lista, sem tooltip nem hover; título da seção por `aria-labelledby` |

## Achados
- (baixo) `SerieMensal.tsx:103`: `ul` com `list-none` e sem `role="list"` perde a semântica de lista no VoiceOver/Safari; é o mesmo padrão do `CartaoMetrica`, então a correção cabe num lote de consistência.
- (baixo) `TendenciaSustentacao.tsx:37`: a nota é ligada a um único id; outras notas de `TENDENCIA_SUST` não aparecem na tela. Hoje o contrato só prevê esse caso na tendência, então só vale revisitar se surgir um segundo id.
