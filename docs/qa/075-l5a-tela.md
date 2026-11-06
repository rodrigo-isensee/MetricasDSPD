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
- Fora: lote 5b, servidor e contratos, E2E.
- `server/` e `packages/`: `git diff da61dbc2..6d4a392c -- server packages` vazio.
- E2E não exigido por este parecer: o brief pede só se o plano do projeto exigir, e a fixture de E2E não traz motivo "não classificado" nessas telas; a tela é coberta por teste de componente com a fonte ajustada.

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

## Contraste (medido pela fórmula de luminância WCAG, a mesma do axe, com os tokens de `web/src/styles/tokens.css`)
| Token | Tema claro (sobre `superficie` / `fundo` / `superficie-2`) | Tema escuro (sobre `superficie` / `fundo` / `superficie-2`) |
|---|---|---|
| `text-texto-2` | 7,73 / 7,21 / 6,83 | 8,08 / 8,73 / 7,17 |
| série 7 (hachura e legenda) | 5,94 / n/a / 5,25 | 6,71 / n/a / 5,96 |

Todos acima de 4,5:1, mínimo da CA-4. Medição por cálculo sobre os tokens: o E2E com axe real não roda este valor porque a fixture não o traz.

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

## Bugs
Nenhum aberto (críticos 0, altos 0, médios 0, baixos 0).

## Achados

- A1 (recomendado) web/src/features/operacional/motivo-nao-classificado.test.tsx:57 · Sem teste fixo do O2 sem "não classificado" e com a nota de dado real ausente (conferido só ad hoc); incluir se o O2 ganhar nova regra de apoio.
