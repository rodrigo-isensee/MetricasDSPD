# K-215 tela: revisão de UX da interface implementada

Pedido 087, etapa E3.22 · autor: ux-designer · 2026-11-14 · sem commit · contra `docs/ux/087-k215-lista-longa.md` (CA-1 a CA-10).
Revisado: `RecorteSustentacao.tsx`, `recorte.ts`, `recorte.test.tsx`, `VisaoSustentacao.tsx` (head ce3ddb17). Todos os itens de acessibilidade e de comportamento são `lido` (código e testes); nada foi medido nem executado (sem shell). Contraste, leitor de tela e layout real em 375px ficam para o QA (`@axe`) e para a conferência do dono na tela.

## Veredito
Aprovado com 2 ressalvas (1 média, 1 baixa), nenhuma crítica. A estrutura segue a alternativa B escolhida. A validação final continua sendo do dono, na tela: estado **aguardando o usuário**.

## Desvio da frase de 2 a 3 organizações
Implementado: "Chamados das organizações A e B, tipo ..." Desenhado no wireframe: "de 2 organizações (A e B)".
**Aceitável, e mais fiel ao desenho do que o wireframe.** A seção 3 diz que, até o limite, os nomes vão por extenso na frase, e a seção 8 manda o plural conforme a contagem ("da organização" / "das organizações"). O wireframe do caso 098 misturou contagem com nomes, o que contradiz essas duas seções e não corresponde a nenhum CA. A forma implementada é uma só regra para 1, 2 e 3 itens e deixa a contagem só para o caso acima do limite. Registro: o wireframe da seção 4 estava inconsistente e vale a seção 3 mais o código. Ressalva já prevista na seção 7 (P-K215-1): com duas organizações de 49 caracteres a frase fica pesada; se o dono achar, baixar `LIMITE_ORGANIZACOES` para 1, sem outra mudança.

## Critério a critério
| CA | Resultado | Evidência (`lido`) |
|---|---|---|
| CA-1 | Atende | `segmento` com `n <= limite` devolve nomes por extenso; teste 4 equipes sem `details`. |
| CA-2 | Atende | `n > limite` troca a frase por "de N equipes" e cria `<details>` fechado; teste da fronteira 4/5. |
| CA-3 | Atende | `<summary>` nativo; `aberta` troca "Ver as N" por "Ocultar as N"; lista na ordem recebida (teste com ordem Zeta, Alfa, Mu...). Enter e Espaço são o clique nativo (sem tratador próprio). Ver ressalva R2. |
| CA-4 | Atende | `ul` com `break-words`, sem `overflow`, `truncate` nem `max-h` (afirmado no teste). |
| CA-5 | Atende | Mesma função para as 3 listas; rótulos "Ver as N organizações", "Ver os N tipos de chamado"; teste das fronteiras 3/4. |
| CA-6 | Atende | `data?.recorte` ausente, carregando, erro e listas vazias caem em `RECORTE_RESERVA`, igual ao texto anterior (teste caractere por caractere). |
| CA-7 | Atende, `lido` | `<summary>` nativo, sem `role`, `aria-*` nem `tabindex`; nome acessível contém contagem e substantivo. Anúncio real de recolhido/expandido só o QA mede. Ver R1 sobre a seta. |
| CA-8 | Atende, `lido` | `min-h-11` (44px) em todas as larguras (mais estrito que o desenho) e `.alvo`; colunas só em `md:`/`lg:`, 1 coluna no celular. Ausência de rolagem horizontal em 375px não foi medida. |
| CA-9 | Atende | Nomes fixos só em `RECORTE_RESERVA`; parte fixa do parágrafo é constante de regra (CA-9 do teste). |
| CA-10 | Atende | Estado em `useState` local, sem URL nem armazenamento; teste de remontagem. |

## Achados
**R1 (médio) — a seta de expandir pode não aparecer.**
- Onde: `RecorteSustentacao.tsx`, linha 15: `<summary className="alvo flex ...">`.
- Por quê: `display: flex` no `<summary>` remove o marcador nativo (triângulo) nos navegadores Chromium e Firefox, que só o desenham em `display: list-item`. O desenho (seção 4 e 6) prevê o marcador de seta; sem ele, o controle parece só um texto em negrito e perde a indicação de que expande (heurística de visibilidade e de reconhecer em vez de lembrar). O estado continua exposto pelo `<details>`, então não é falha de leitor de tela, só de descoberta visual. `lido`: não vi CSS global que recoloque o marcador (busca em `web/src/**/*.css` não achou regra de `summary` nem de marker); só o teste do `jsdom`, que não renderiza marcador, não pegaria isso.
- Correção: manter o `<summary>` em `list-item` (alinhar o conteúdo com `min-h-11` e `py-` em vez de `flex items-center`), ou desenhar uma seta própria `aria-hidden` que gira com `open`, sem animação (respeita `prefers-reduced-motion`). Conferir no navegador antes do dono validar.

**R2 (baixo) — texto do resumo depende do clique, não do estado real do `<details>`.**
- Onde: `RecorteSustentacao.tsx`, linhas 10 e 17: `open={aberta}` com `onClick` que inverte o estado.
- Por quê: se o navegador abrir o `<details>` sem clique no resumo (busca na página, por exemplo), o `open` real e o `aberta` divergem: o texto continua "Ver as N" com a lista aberta, e o React pode refechar na próxima renderização. Caso raro, e o comentário no código explica que evitou o evento `toggle` por causa do `jsdom`.
- Correção: deixar o `<details>` sem `open` controlado e sincronizar com `onToggle={(e) => setAberta(e.currentTarget.open)}`; no teste, disparar `toggle` manualmente. Não bloqueia a entrega.

## Heurísticas e WCAG (lido)
- Visibilidade do status e controle: resumo muda de texto, abre e fecha livremente. Consistência: mesmo `<details>` nativo de `MaisMetricas`; o foco usa `:focus-visible` global dos tokens (2px). Sem animação, então `prefers-reduced-motion` não se aplica. Sem live region, como desenhado.
- Rótulo repetido: os três resumos têm texto único ("Ver as N organizações" etc.), sem ambiguidade com mais de um `<details>`.

## Fora do que revi
Não conferi contraste, leitor de tela, nem render em 375px e 1024px; isso é do QA. A validação do dono (limites 3/4, forma B, P-K215-1 e P-K215-2) segue pendente e não foi registrada aqui.
