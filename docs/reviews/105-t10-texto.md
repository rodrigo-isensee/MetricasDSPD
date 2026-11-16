---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t10-texto
commit: a505dc99d86ba4fb1e5022ee5705fa3eae78d2ba
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: texto do T10 com os motivos 11 e 14 (105, K-391, E7.363)

Escopo: `d999ee29..a505dc99`, um commit (a505dc99), 3 arquivos, 8 linhas a mais e 8 a menos (`notas.ts`, `taticas.tsx`, `taticas.test.tsx`). Está dentro do teto de 150 linhas (M14).

**Veredito: reprovado.** O texto novo está de acordo com o cálculo. O defeito é que o e2e `tatico-011-lote2.spec.ts` ainda afirma a frase antiga do aviso de vazio, que esta mudança trocou (A1). A correção é de uma linha.

## Conferência contra o cálculo (develop)
- `packages/contratos/src/comum.ts:127`: `MOTIVOS_FORNECEDOR = ['Aguardando fornecedor', 'Dependência Externa']`. `packages/metricas/src/businessmap/t10.ts` filtra `encerrados` por essa lista e soma as horas úteis.
- `notas.ts:266` (Como se calcula), `taticas.tsx:53` (leitura), `taticas.tsx:77-78` (aviso de vazio) e `taticas.tsx:56` (comentário) agora citam os dois motivos, e "encerrados" continua no texto. O aviso de vazio usa "ou", e a soma usa "e". As duas formas estão corretas.

## Ferramentas (citadas, sem refazer)
- Sem PR para a branch, então a suíte inteira fica para o CI do PR. Não afirmo CI verde. O PQ do autor (brief react-frontend-40) é só o push (`ls-remote`) e não traz a saída do `pnpm run pronto`.
- Rodei o teste tocado: `pnpm exec vitest run src/features/complementares/taticas.test.tsx` (em `web/`). Resultado: 1 arquivo, 37 testes, todos passaram.
- O projeto `chromium-api` não roda no CI (`ci.yml` usa `test:chromium`, sem `E2E_API_URL`). É por isso que o A1 não aparece em verificador automático.

## Checklist (leitura)
1. Escopo: faz o que o K-391 pede, só texto e asserções. Não muda cálculo nem contrato.
2. Regras invioláveis: não há impacto. O texto não cita fornecedor nem pessoa.
3. Legibilidade: os textos estão claros. A lista de motivos está escrita à mão em três lugares, quando o brief sugeria ler `MOTIVOS_FORNECEDOR` "se couber" (A2).
7. Testes: a leitura com e sem percentis e o aviso de vazio têm asserção de texto exato. O "Como se calcula" (`notas.ts:266`) não tem asserção (A2).
11. Teste de ausência ou de texto cujo alvo mudou: o e2e da API com a frase antiga ficou para trás (A1).
9. Commit: um commit, Conventional Commits em português, e a mensagem diz o que muda.

## Achados
- A1 (bloqueante) e2e/tests-api/tatico-011-lote2.spec.ts:139 · o TT-04 afirma `toHaveText('Nenhum bloqueio com o motivo "Aguardando fornecedor" foi encerrado no período.')`, mas `taticas.tsx:77-78` agora renderiza 'Nenhum bloqueio com os motivos "Dependência Externa" ou "Aguardando fornecedor" foi encerrado no período.'. Com `toHaveText` exato, o teste falha sempre que o projeto `chromium-api` rodar. Defeito provado, causado pela própria mudança. Correção: trocar a frase esperada pela nova.
- A2 (recomendado) web/src/features/complementares/taticas.tsx:53 · os nomes dos motivos estão fixos no texto, em `notas.ts:266` e `taticas.tsx:53,77`. Se `MOTIVOS_FORNECEDOR` mudar, os textos ficam desatualizados sem que nenhum teste falhe. Há duas saídas: montar os textos a partir da lista do contrato, ou pôr no `taticas.test.tsx` uma asserção que confira que cada item de `MOTIVOS_FORNECEDOR` aparece no `comoSeCalcula` do T10.
- A3 (recomendado) packages/contratos/src/tambem.ts:197 · os comentários de contrato `tambem.ts:197` e `origem.ts:57` ainda dizem 'com o motivo "Aguardando fornecedor"'. Fica para um cartão, porque esses arquivos estão fora dos arquivos do brief do autor. (`criterios.ts:106` é histórico datado e está certo.)
