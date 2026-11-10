# Revisão de interface, volta 1: selo Simulado (pedido 070, E1.7)

pedido: 070-simulado-por-cartao
branch: feature/070-simulado-por-cartao
commit: 3fc35abd548067b3d2d76b19223e84403f96d6ac
revisor: ux-designer
data: 2026-11-05
base da revisão: especificação e protótipo validados pelo dono (K-221, decisão "A" de 2026-11-04), desenho 070 (R1 a R7), revisão anterior (`revisao.md`, commit 9605ead), heurísticas de Nielsen e WCAG 2.2 AA. Só leitura do código em `web/src` da worktree; nada executado.

## Veredito
Aprovado com ressalvas. A-2, A-4 e A-5 foram resolvidos conforme a especificação. A-1 foi resolvido para o selo de status (`StatusMeta` não aparece mais em cartão simulado), mas sobrou um selo de desvio no T3. A-7 não surtiu efeito no desktop pela ordem das regras de CSS. Nenhum achado crítico ou alto; o que sobrou é pequeno e pode entrar no lote seguinte, a critério do tech-lead. O que já estava conforme não mudou.

## Conferência dos achados da revisão anterior

| Achado | Resultado | Onde |
|---|---|---|
| A-1 dentro/fora da meta no corpo | resolvido, com resto (ver A-9) | `StatusMeta.tsx:25-30` devolve nulo no contexto simulado; `CartaoMetrica.tsx:337` põe o contexto em volta do corpo; rodapé `:376` também protegido. S1, S7, T2, T4, T7 e o complementar de sustentação passam todos por `StatusMeta`, dentro do corpo. Resumo e Visão geral usam o componente fora do contexto e só com dado real. |
| A-2 nome acessível do selo | resolvido | `SeloSimulado.tsx:36-37` usa `role="img"` com o nome completo da especificação (CA-5). |
| A-4 sigla interna no motivo | resolvido | `motivoSemSigla` (`OrigemDosCartoes.tsx:38`) tira "(P-DS-19)" e ", P-DS-19"; os dois motivos de `origem.ts:38` e `:40` ficam sem sigla. Aplicado só ao motivo da faixa do simulado. |
| A-5 marca d'água na tabela | resolvido | `CartaoMetrica.tsx:363` só desenha a marca em `modo === 'grafico'`. |
| A-7 alvo de 44px no botão | não resolvido no desktop (ver A-10) | `SeloSimulado.tsx:71` |

## Sem regressão
Selo no cabeçalho depois da base, faixa `role="note"` antes da pergunta, borda tracejada, prefixo "Exemplo:", legenda da tabela, ausência de selo em carregando e erro, e selo mantido no vazio: iguais à revisão anterior. Textos constantes iguais aos validados. Filtros de dimensão listados em "não afetam" (T-W8). Calibração desligada no simulado.

## Achados
- A-9 (médio) T3 mostra o selo "Desvio acima de 10 p.p." por natureza em cartão simulado (`CartaoT3.tsx:100`), em marcação própria, fora do `StatusMeta`. É avaliação de meta sobre número inventado, contra R6. Ocultar com `useCartaoSimulado` e testar.
- A-10 (baixo) O botão "O que é simulado?" usa `min-h-11` junto de `.alvo`. A regra `.alvo` (`tokens.css:134`) está fora de camada e vence os utilitários do Tailwind v4, então o desktop fica com 24px mais o padding, não 44px. Passa na WCAG 2.2 AA; medir no navegador.
- A-11 (baixo) A marca d'água continua sem `overflow` contido (`text-4xl`, girada). Em 320px o QA deve conferir se o texto escapa da área do gráfico.
- A-12 (baixo) O motivo sem sigla vale só na faixa do simulado. O estado "Sem dado real" usa `p.erro.motivo` cru (`CartaoMetrica.tsx:158`), que pode trazer sigla. Aplicar `motivoSemSigla` também ali, se o dono quiser texto sem jargão.

## Pendências herdadas, sem mudança
A-6 (nota "N cartões sem dado real" com cartões simulados) segue decisão de microcopy do dono. A-3 ficou resolvido com o A-2. A-8 é só observação.

## Limites desta revisão
Não executei a interface nem os testes. A-9 e A-10 vêm de leitura de código e de CSS; o contraste do tema escuro e o comportamento em 320px ficam para o QA. A busca de `StatusMeta` e de textos de dentro/fora cobriu `web/src/features` e `components`; outros desvios com marcação própria, como o do T3, podem existir.
