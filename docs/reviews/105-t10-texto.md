---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t10-texto
commit: df13bf908df26292414cf6f45d2f57147c434146
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: texto do T10 com os motivos 11 e 14 (105, K-391, E7.363, revalidação E7.389)

Escopo original: `d999ee29..a505dc99`, um commit, 3 arquivos (`notas.ts`, `taticas.tsx`, `taticas.test.tsx`), 8 linhas a mais e 8 a menos. Revalidação: `a505dc99..df13bf90`, lida só pelo `forge-check parecer delta`. Dentro do teto de 150 linhas (M14).

**Veredito: aprovado.** O A1 foi corrigido, e o A2 foi atendido pelo lado do teste.

## Revalidação (delta lido)
`forge-check parecer delta docs/reviews/105-t10-texto.md` mostra o intervalo `a505dc99..df13bf90` e 2 arquivos no domínio:
- `e2e/tests-api/tatico-011-lote2.spec.ts:139`: o TT-04 agora espera a frase nova ('com os motivos "Dependência Externa" ou "Aguardando fornecedor"'). É o mesmo texto de `taticas.tsx:77-78`. Isso fecha o A1.
- `web/src/features/complementares/taticas.test.tsx`: há um teste novo que percorre `MOTIVOS_FORNECEDOR` (importado de `@metricas-dspd/contratos`) e confere cada motivo, entre aspas, no aviso `t10-sem-fornecedor` e em `NOTAS_COMPLEMENTARES.T10.comoSeCalcula`. O texto ainda está escrito à mão, mas um motivo novo na lista sem o texto correspondente agora faz o teste falhar. Isso atende o A2.
- O A3 (comentários em `tambem.ts:197` e `origem.ts:57`) fica como cartão, fora do brief.

## Ferramentas (citadas, sem refazer)
- Não há PR para a branch, então a suíte inteira fica para o CI do PR, e este parecer não afirma CI verde. O brief do autor registra `pnpm run pronto` com rc=0 no head df13bf90.
- Rodei o teste tocado no head df13bf90: `npx vitest run src/features/complementares/taticas.test.tsx` (em `web/`). Resultado: 1 arquivo, 38 testes, todos passaram (eram 37, mais o teste novo dos motivos).
- O projeto `chromium-api` continua fora do CI. O TT-04 foi conferido por leitura contra `taticas.tsx:77-78`.

## Conferência contra o cálculo (develop)
- `packages/contratos/src/comum.ts:127`: `MOTIVOS_FORNECEDOR = ['Aguardando fornecedor', 'Dependência Externa']`. `packages/metricas/src/businessmap/t10.ts` filtra `encerrados` por essa lista e soma as horas úteis.
- `notas.ts:266`, `taticas.tsx:53`, `taticas.tsx:56` e `taticas.tsx:77-78` citam os dois motivos. O aviso de vazio usa "ou", e a soma usa "e". As duas formas estão corretas.

## Checklist (leitura)
1. Escopo: só texto e asserções. Não muda cálculo nem contrato.
2. Regras invioláveis: não há impacto. O texto não cita fornecedor nem pessoa.
7. Testes: o aviso de vazio e a leitura têm asserção de texto exato. O "Como se calcula" agora é coberto pelo teste dos motivos.
9. Commits: Conventional Commits em português, e as mensagens dizem o que muda.
11. Teste cujo alvo mudou: o TT-04 foi atualizado. O laço sobre `MOTIVOS_FORNECEDOR` percorre uma lista de 2 itens, e a lista é um contrato tipado.

## Achados
- A1 (bloqueante) e2e/tests-api/tatico-011-lote2.spec.ts:139 · resolvido em df13bf90: o TT-04 espera a frase nova.
- A2 (recomendado) web/src/features/complementares/notas.ts:266 · atendido em df13bf90 por `taticas.test.tsx`, que confere cada motivo de `MOTIVOS_FORNECEDOR` no aviso e na nota.
- A3 (recomendado) packages/contratos/src/tambem.ts:197 · os comentários de `tambem.ts:197` e `origem.ts:57` ainda citam só "Aguardando fornecedor". Estão fora do brief e viram cartão.
