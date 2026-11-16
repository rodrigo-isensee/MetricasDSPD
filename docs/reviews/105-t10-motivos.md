---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t10-develop
commit: 0b4db1fa002ed7eb872fafc7a0866c2a8f61f15c
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: T10 trazido da homolog para a develop (105, E7.286)

Escopo: `655029ad..0b4db1fa`, um commit. É o squash da branch do PR 487 (head `4319bb04`, merge `51d847e1` na homolog) sobre a develop `655029ad`, que já tem o O12 (#499). O `git merge --squash 4319bb04` resolveu sozinho, sem conflito: `CHANGELOG.md`, `docs/api/metricas.md`, `origem.ts`, `origem.test.ts` e `criterios.ts` foram mesclados automaticamente. A develop não perdeu nada: o diff só acrescenta ou altera o que o PR 487 mudava. Os arquivos do T10 (`t10.ts`, `taticas.tsx`) ficaram iguais aos do `4319bb04` (`git diff 4319bb04 HEAD` vazio nesses arquivos). Os docs do #500 (`105-sal-apontamento`), que o merge na homolog trouxe junto, já estavam na develop e não entram de novo.

**Veredito: reprovado.** A integração está correta, mas o conteúdo do T10 não segue a decisão do dono das 09:29 (A1).

## Ferramentas (citadas, sem refazer)
- `pnpm run pronto` pela raiz da worktree, no head `0b4db1fa`: o resultado vai no relatório do brief (PQ do autor). A suíte inteira roda no CI do PR que levar a branch à develop.
- Tamanho (M14): 728 linhas de código e teste fora de `docs/` e `.md` (`git diff --numstat --no-renames origin/develop...HEAD`). É o PR 487 inteiro, já revisado em `docs/reviews/105-t10-real.md`, só trazido de base.

## Checklist (leitura)
- **Integração:** os pontos de contato com o O12 (`criterios.ts`: versões do T10 e do motivo coexistem em `VERSOES_DA_BIBLIOTECA`; `origem.ts`: `T10` real ao lado do O12) estão coerentes. Nada da develop foi desfeito.
- **Biblioteca compartilhada, mínimo de 20, janela de 12 semanas, texto livre fora da base, contrato com campos opcionais:** sem mudança desde o parecer `105-t10-real.md` (aprovado no `4a49d5fd`).
- **Regra do motivo:** `t10.ts:30` filtra `b.motivo === MOTIVO_FORNECEDOR`, e `MOTIVO_FORNECEDOR` é só `'Aguardando fornecedor'` (`t10.ts:12`). A decisão do dono de 2026-11-16 09:29 manda contar o 14 (Aguardando fornecedor) e o 11 (Dependência Externa), com o histórico entrando pelo 11. A própria develop já diz isso: `MOTIVOS_FORNECEDOR` (`packages/contratos/src/comum.ts:127`) tem os dois motivos, a versão de critério dos motivos (`criterios.ts:151`) diz que "o fornecedor do T10 são os motivos Aguardando fornecedor e Dependência Externa", e o mock (`gerador.ts:312`) gera bloqueio de fornecedor com os dois. O T10 ignora o 11.
- **Origem da diferença:** a mudança para 11 e 14 (E7.264) existe em quatro commits (`cbf18434`, `5ab2cf43`, `81029c2c`, `e65a710a`) que não estão no `4319bb04` (`git merge-base --is-ancestor cbf18434 4319bb04` falha). Eles estão só na worktree `MetricasDSPD-041`, com HEAD destacado, e não foram enviados a nenhuma branch remota. O PR 487 foi mesclado sem eles.

## Achados
- A1 (bloqueante) packages/metricas/src/businessmap/t10.ts:30 · O T10 conta só o motivo "Aguardando fornecedor" (14) e deixa de fora "Dependência Externa" (11), contra a decisão do dono de 2026-11-16 09:29, contra `MOTIVOS_FORNECEDOR` (comum.ts:127) e contra o texto da versão de critério (criterios.ts:151). Gatilho: na base real, o histórico de fornecedor está no 11 (8 bloqueios; 3 encerrados em 12 semanas, pelo registro das 09:19), então o T10 publicado sai sem esses bloqueios. Correção: trazer o E7.264 (`cbf18434..e65a710a`, hoje só local na worktree 041), que filtra por `MOTIVOS_FORNECEDOR`, com review e QA, sobre esta branch.
- A2 (recomendado) packages/metricas/src/core/criterios.ts:101 · Os textos do critério (`criterios.ts:101` e `:106`), da regra (`regras.ts:570`) e da nota (`notas.ts:266`) dizem só "Aguardando fornecedor". Atualizá-los junto com o A1.
- A3 (recomendado) packages/metricas/src/businessmap/bloqueios.test.ts:209 · O teste do T10 não tem caso com "Dependência Externa". Com o A1, ele deve afirmar que o 11 entra e que o 2 (outro setor) fica fora.
