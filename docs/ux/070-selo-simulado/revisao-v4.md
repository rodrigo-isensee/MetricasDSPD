# Revisão de interface, volta 4: marca d'água Simulado em svg (pedido 070, E1.7)

pedido: 070-simulado-por-cartao
branch: feature/070-l3-e2e
commit: 3c552b062392a664b0bbe6a66dbb518b2df7fe61
revisor: ux-designer
data: 2026-11-05
base da revisão: especificação e protótipo validados pelo dono (K-221, decisão "A" de 2026-11-04), desenho 070 (R1 a R7, T-W1 a T-W8), `revisao-v3.md`, heurísticas de Nielsen e WCAG 2.2 AA. Só leitura de `web/src/components/ui/SeloSimulado.tsx`, `web/src/styles/tokens.css` e do ponto de uso em `CartaoMetrica.tsx:363`; nada executado, nada escrito na worktree.

## Veredito
Aprovado com ressalva de medição. A marca d'água em svg preserva texto, cor (token), rotação, posição, peso, fonte herdada e o caráter decorativo. Há dois desvios pequenos de número contra o protótipo (tamanho e opacidade) que não mudam a intenção "discreta"; a medição visual fica para o QA. Selo, faixa, botão e textos seguem iguais à v3.

## Marca d'água contra o protótipo validado

| Atributo | Protótipo | Implementado (svg) | Resultado |
|---|---|---|---|
| Texto | SIMULADO | SIMULADO | igual |
| Peso | 700 | `fontWeight="700"` | igual |
| Tamanho | 40px | `fontSize="36"` (sem viewBox, 1 unidade = 1px) | desvio de 4px, menor |
| Cor | rgba(107,58,0,.12) | `fill-atencao` (#8a5a00 claro, #e0b040 escuro) com `opacity-15` | cor vem do token, opacidade .15 em vez de .12 |
| Rotação | -12deg | `-rotate-12` no svg que cobre o contêiner | igual, gira em torno do centro |
| Posição | centro do gráfico | `x=50%`, `y=50%`, `textAnchor=middle`, `dominantBaseline=central` | igual |
| Fonte | herdada | `text` herda do contêiner (nenhuma família definida) | igual |
| Decorativa | `aria-hidden`, sem clique | contêiner `aria-hidden`, `pointer-events-none`, `select-none`, `data-testid` igual, svg `focusable=false` | igual |
| Contenção | dentro da área do gráfico | `absolute inset-0 overflow-hidden` | igual |
| Quando aparece | só cartão simulado | só `simulado && modo === 'grafico'` (`CartaoMetrica.tsx:363`) | igual (CA-3) |

O texto some do alcance do axe como pretendido: svg `text` com `aria-hidden` não entra em color-contrast, e a informação continua nos outros marcadores (texto do selo, faixa, borda, prefixo), como a especificação já previa.

## Resto da interface (conferência contra a v3)

| Item | Resultado | Onde |
|---|---|---|
| Selo | igual: `role="img"`, nome completo, ícone, borda, texto | `SeloSimulado.tsx:33-45` |
| Faixa | igual: `role="note"`, motivo, botão com `aria-expanded` e `aria-controls` | `SeloSimulado.tsx:51-85` |
| Botão | igual: `alvo-44` | `SeloSimulado.tsx:71` |
| Textos | constantes iguais às validadas | `SeloSimulado.tsx:7-15` |

## Achados
- A-13 (baixo) Tamanho 36 contra 40 do protótipo e opacidade .15 contra .12; cor agora é o token, #8a5a00 em vez de #6b3a00. Mantém a discrição; o dono pode aceitar, ou ajustar para 40 e opacity-10 se quiser fidelidade exata.
- A-14 (baixo) Em 320px, texto de cerca de 190px girado em -12 graus pode tocar as bordas do gráfico estreito e ser cortado por `overflow-hidden`; sem perda de informação. Medir no QA, também no tema escuro.
- A-12 (baixo) Herdado da v3: "Sem dado real" usa `p.erro.motivo` cru; `motivoSemSigla` se o dono quiser. Fora desta volta.

## Pendências herdadas, sem mudança
A-6 (nota "N cartões sem dado real") segue como decisão de microcopy do dono. A-8 é só observação.

## Limites desta revisão
Não executei a interface nem os testes; a aparência contra o protótipo foi conferida pelo código, não por captura (o desenvolvedor também informa que não mediu). Medida de 44px, marca d'água em 320px e no tema escuro continuam para o QA.
