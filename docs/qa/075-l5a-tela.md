---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l5a-tela
commit: 6d4a392cf75ecf6c9f3c9c5589fc5ac878335991
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-06
---
# QA: 075 lote 5a, motivo "não classificado" na tela (E1.8, K-204)

Código testado: `6d4a392c`. O HEAD `92c10424` só soma o parecer do review (`docs/reviews/075-l5a-tela.md`). Especificação: `docs/ux/075-bloqueios-reais.md` com a nota datada de 2026-11-06 (distribuição por motivo só no O19). CA-6 a CA-9 e CA-12 são do lote 5b e ficam fora.

## Escopo
- Dentro: BLOQUEADOS (`CartaoBloqueados.tsx`), coluna "Bloqueado" do O2 (`CartaoO2.tsx`), O19 (`operacionais.tsx`), componente `MotivoBloqueio.tsx`, `TabelaDados` com `descritoPor`.
- Fora: lote 5b, servidor e contratos.
- Acessibilidade: axe do projeto (`@axe-core/playwright`) num caso E2E novo, `e2e/tests-api/motivo-nao-classificado-075-l5a.spec.ts` (seção "Axe" abaixo).
- `server/` e `packages/`: `git diff da61dbc2..6d4a392c -- server packages` vazio.
- E2E funcional não exigido por este parecer: a tela é coberta por teste de componente com a fonte ajustada. O E2E novo cobre só a acessibilidade (a fixture de E2E não traz motivo "não classificado" nessas telas; a resposta da API é simulada por `page.route`).

## Critério → teste → resultado
Arquivo de teste: `web/src/features/operacional/motivo-nao-classificado.test.tsx` (6 casos).

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 marca com texto, itálico e ícone `aria-hidden` | caso "CA-1, CA-3, CA-4 e CA-11" (BLOQUEADOS) e "CA-1 e CA-5" (O2) | valor "não classificado" entre os 7 | passou |
| CA-1 só "não classificado" no O19 lê sem soar motivo de negócio | caso "só não classificado lê bloqueio sem motivo classificado" | só um motivo na lista | passou |
| CA-2 O19: por último mesmo sendo o maior, com os dias publicados na linha, leitura cita a lacuna | caso "CA-2 e CA-4" | maior valor; ordem | passou |
| CA-2 O2 sem distribuição por motivo | caso "CA-1 e CA-5" (O2 só com a coluna "Bloqueado") | ausência de agregado | passou |
| CA-3 leitura "por motivo não classificado" | caso "CA-1, CA-3, CA-4 e CA-11" | texto exato | passou |
| CA-4 texto e ícone sem depender de cor; O19 com hachura e legenda; contraste | casos CA-4 do O19 (`fill` com `url(#`, legenda só com o valor) e medição abaixo | série própria; legenda só se existe | passou |
| CA-5 nenhum campo de pessoa | varredura de `th`, `caption`, `legend`, legenda e texto de `svg` nos três cartões | colunas e rótulos | passou |
| CA-10 zero bloqueados | caso "CA-10" | lista vazia | passou |
| CA-11 apoio de precisão sob a tabela | caso "CA-1, CA-3, CA-4 e CA-11" | sempre que há itens | passou |
| Leitura do O19 sem dias bloqueados | caso "sem dias bloqueados no período" | total zero | passou |

## Execução
- CI do push no head do código: `gh run list ... --event push` devolveu `success` para `6d4a392c` (e para `92c10424`).
- Testes locais, `vitest run --maxWorkers=2` em `web`, pastas `operacional`, `complementares` e `components/ui` (inclui os arquivos tocados): 24 arquivos, 530 testes, todos passaram.
- Vermelho contra a base (cópia em `$TMPDIR/qa-engineer-075-l5a/`: fontes do lote voltadas a `da61dbc2`, teste novo mantido, `MotivoBloqueio.tsx` removido): 4 de 6 falham (BLOQUEADOS, O2, O19 ordem e O19 só não classificado); os 2 que passam são guardas de regressão (CA-10 e "sem dias bloqueados"), que a base já cumpria. O teste novo só passa com a implementação.
- Mutação: sem ferramenta gratuita declarada para o `web`; não rodada.

## Axe (`@axe-core/playwright`, ferramenta do projeto; E2E em `e2e/package.json`)
Caso novo `e2e/tests-api/motivo-nao-classificado-075-l5a.spec.ts` (`Q75-5A-AXE`, temas claro e escuro). Projeto `chromium-api`, Chromium, 2 workers, só esse arquivo, `uptime` com load 2,5 antes. SPA em `VITE_FONTE=api` e o stub `server/tests/pg/api-stub-065.ts` (porta 3199, sem banco), `E2E_API_URL=http://127.0.0.1:3199`. A resposta é simulada por `page.route`, sem tocar em `server/` nem em `web/src`: BLOQUEADOS e O19 com corpos de contrato (o stub os devolve `sem-dado-real`), O2 com o corpo do stub e `bloqueioMotivo` = "não classificado" em todos os itens, sem notas. Os três cartões mostram "não classificado" (conferido por `getByText` visível, `data-estado="ok"`).
- Regras: `AXE_TAGS` do projeto (`wcag2a`, `wcag2aa`, `wcag22aa`), `include` por cartão (`metrica-BLOQUEADOS`, `metrica-O2` na visão diária; `metrica-O19` em "Mais métricas" da semanal), sem separar por gravidade: qualquer violação reprova.
- Resultado: BLOQUEADOS, O2 e O19, nos dois temas: zero violações em todas as regras (`2 passed (17.0s)`).
- Dentes do teste: cópia ad hoc (apagada, não commitada) com `color: #bbb` forçado no texto itálico do tema claro derrubou o caso claro com `color-contrast`; o escuro, onde #bbb tem contraste, passou. A regra roda e reprova quando deve.

## Contraste (regra `color-contrast` do axe, acima, e a conferência anterior pela fórmula de luminância WCAG com os tokens de `web/src/styles/tokens.css`)
Resultado da ferramenta: zero violações de `color-contrast` nos três cartões, nos dois temas (a regra roda isolada por cartão e exige ao menos uma verificação ou `incomplete`). Os valores abaixo são a conferência por fórmula anterior e batem com o resultado da ferramenta.
| Token | Tema claro (sobre `superficie` / `fundo` / `superficie-2`) | Tema escuro (sobre `superficie` / `fundo` / `superficie-2`) |
|---|---|---|
| `text-texto-2` | 7,73 / 7,21 / 6,83 | 8,08 / 8,73 / 7,17 |
| série 7 (hachura e legenda) | 5,94 / n/a / 5,25 | 6,71 / n/a / 5,96 |

Todos acima de 4,5:1, mínimo da CA-4. O axe real rodou com o motivo na tela (seção "Axe") e confirmou sem violação.

## Baixo 5 da revisão de UX (apoio do motivo no O2)
O apoio ("Motivo ainda sem classificação...") aparece só se houver "não classificado" entre os 10 itens listados (`CartaoO2.tsx:71`), como a especificação e a revisão de UX descrevem. Conferido por teste ad hoc em cópia (não commitado), 3 casos:
- nenhum item "não classificado": sem apoio;
- nota `bloqueio-sem-dado-real` com "não classificado": sem apoio (A1 do review resolvido);
- "não classificado" só no 11º item (fora dos 10 listados): sem apoio, 11 linhas (cabeçalho e 10 itens).
Comportamento aceito; vira linha de teste só se o dono pedir.

## Exceções aceitas pelo review
- Médio 2 da UX (rótulo do eixo do O19 sem itálico e ícone): hachura, texto e legenda distinguem; a linha da tabela traz itálico e ícone (A3 do review). Sem bug aberto.
- Teto de 317 linhas: aceito pelo review com a linha de exceção no PR.

## E4 (P-075-8): O19
O O19 mostra o "não classificado" como linha da tabela e barra com os dias publicados (70 de `totalDiasUteis` 100 no caso "CA-2 e CA-4"), junto dos demais motivos; a tela não recalcula o total, usa o do contrato (T2.5). O teste não afirma uma linha de total na tela, porque ela não existe: a soma ao total é do servidor (lote 1b, QA próprio).

## Veredito revisto (volta do E1.8, 2026-11-06)
Aprovado mantido: o axe do projeto e a regra de contraste rodaram nos três cartões com o motivo na tela, nos dois temas, com zero violações. `commit:` segue o código testado (`6d4a392c`).

## Bugs
Nenhum aberto (críticos 0, altos 0, médios 0, baixos 0).

## Achados

- A1 (recomendado) web/src/features/operacional/motivo-nao-classificado.test.tsx:57 · Sem teste fixo do O2 sem "não classificado" e com a nota de dado real ausente (conferido só ad hoc); incluir se o O2 ganhar nova regra de apoio.
