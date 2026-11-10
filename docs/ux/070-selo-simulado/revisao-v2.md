# Revisão de interface, volta 2: selo Simulado (pedido 070, E1.7)

pedido: 070-simulado-por-cartao
branch: feature/070-simulado-por-cartao
commit: e8c148ba97d99eaf2cac3eb5e5557bc302d481c1
revisor: ux-designer
data: 2026-11-05
base da revisão: especificação e protótipo validados pelo dono (K-221, decisão "A" de 2026-11-04), desenho 070 (R1 a R7), revisão anterior (`revisao-v1.md`, commit 3fc35ab), heurísticas de Nielsen e WCAG 2.2 AA. Só leitura do código em `web/src` da worktree; nada executado.

## Veredito
Aprovado. A-9, A-10 e A-11 foram resolvidos conforme a especificação e o protótipo validados. Nenhum achado novo e nada regrediu. Fica só o A-12 (baixo), herdado e fora desta volta.

## Conferência dos achados da volta 1

| Achado | Resultado | Onde |
|---|---|---|
| A-9 selo de desvio no T3 simulado | resolvido | `CartaoT3.tsx:13-14`: `SeloDesvio` devolve nulo quando `useCartaoSimulado()` é verdadeiro. A lista de desvio por natureza continua com texto, sem avaliação de meta. O aviso de desvio de `TaticoPage.tsx:46` fica no resumo, que só traz dado real. |
| A-10 alvo de 44px no botão | resolvido | `tokens.css:145-149`: `.alvo-44` vem depois de `.alvo` e do media query, mesma especificidade, então vence por ordem em qualquer largura. `SeloSimulado.tsx:71` usa `alvo-44`; `Botao.tsx:29` mantém `.alvo` intacta. |
| A-11 marca d'água contida | resolvido | `SeloSimulado.tsx:94`: contêiner `absolute inset-0 overflow-hidden` com o texto girado dentro; `aria-hidden` e `pointer-events-none` mantidos; pai `relative` em `CartaoMetrica.tsx:361`; só em `modo === 'grafico'`. |

## Sem regressão
Selo com `role="img"` e nome completo, faixa `role="note"`, botão com `aria-expanded` e `aria-controls`, textos constantes, legenda da tabela e prefixo "Exemplo:" iguais à volta 1 e aos textos validados. No T3, o ramo real continua mostrando o selo de desvio quando `statusMeta === 'fora'`.

## Achados
- A-12 (baixo) Herdado da volta 1: o estado "Sem dado real" usa `p.erro.motivo` cru (`CartaoMetrica.tsx:158`), que pode trazer sigla. Aplicar `motivoSemSigla` se o dono quiser texto sem jargão; fora do escopo desta volta.

## Pendências herdadas, sem mudança
A-6 (nota "N cartões sem dado real") segue como decisão de microcopy do dono. A-8 é só observação.

## Limites desta revisão
Não executei a interface nem os testes. A medida real de 44px e o comportamento da marca d'água em 320px e no tema escuro vêm de leitura de CSS e ficam para o QA.
