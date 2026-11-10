---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l8b-tela-contagem-parcial
commit: aa137dd451a22454409ccd833ecd0d11925590a1
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---
# Code review: 077 lote 8b, contagem parcial na tela das tendências (K-211, E2.2)

Diff lido: `git diff origin/feature/077-l6b-tela-ressalva aa137dd4` (só o intervalo do 8b; a branch nasce da ponta do 6b, que tem parecer próprio em `docs/reviews/077-l6b-tela-ressalva.md`). 3 arquivos em `web/`: `modelo.ts`, `SerieMensal.tsx` e `componentes.test.tsx`. Referências: seções "Lote 8" e "P-077-5 revista" de `docs/analises/077-desenho.md` (P-077-5 = A, molde aditivo).

## Parecer
**Aprovado.** O lote faz o que o desenho pede para o 8b, nem mais nem menos.

- **Número do mês marcado não aparece:** `serieConcluidos` e `serieVolume` (`modelo.ts:280-290` e `:315-325`) trocam o ponto marcado por `contagemIncompleta` (`modelo.ts:250-257`): `valor: null`, `n: null` e texto só com o motivo. Daí o gráfico recebe ponto sem valor, a tabela mostra `—` nas colunas de valor e de base, o `figcaption` (resumo `p.texto`) e a lista de meses sem valor mostram "Histórico incompleto", e a `fraseDaSerie` cai no ramo `valor === null` (sem comparação com o mês vizinho). O `concluidos`/`volume` do payload não é lido no ramo marcado.
- **Molde aditivo aceito:** a web é o único consumidor e lê a marca no mesmo item; o critério de reversão do desenho (segundo consumidor que leia o número sem a marca) segue valendo. Nada em `server`, `packages` ou contrato no diff.
- **Meses sem a marca e série de SLA não mudam:** o ramo sem a marca é o objeto de antes, idêntico; `serieSla` e `serieP85` não foram tocadas. A coluna "Situação" ganha `não publicado · histórico incompleto` (`SerieMensal.tsx:44`), depois da janela incompleta, sem afetar os outros casos.
- **T2.5:** nenhuma conta na tela; o lote só decide, pela marca vinda do contrato, não exibir o número. Nenhum componente novo (só uma função de modelo e uma linha na situação).
- **Testes provam o que dizem:** três casos novos (fluxo, sustentação e série sem marca). Mutações refeitas por mim, uma a uma, restauradas por `git checkout -- web/src` (árvore limpa ao fim): cada uma reprova ao menos um teste (sondas abaixo).
- **Revisão de interface (E2.6):** de outra delegação; não refeita aqui.

## Ferramentas
- Testes do arquivo tocado: `npx vitest run src/features/operacional/resumo/componentes.test.tsx` no head `aa137dd4`: 1 arquivo, 33 testes verdes. Suíte inteira, lint e typecheck: no CI do PR.

## Teto M14
`git diff --numstat --no-renames origin/feature/077-l6b-tela-ressalva aa137dd4`: 1+0, 64+0, 32+12 = 109 linhas, dentro do teto de 150. Um comportamento só (não mostrar a contagem do mês de histórico incompleto).

## Sondas
- S1 · `modelo.ts:282` com `m.contagemParcial` trocado por `false` (concluídos) · espera: teste reprova · obtido: "fluxo: o número do mês marcado não aparece..." reprovado (1 failed, 32 passed)
- S2 · `modelo.ts:317` com `m.contagemParcial` trocado por `false` (volume) · espera: teste reprova · obtido: "sustentação: o volume do mês marcado não aparece..." reprovado (1 failed, 32 passed)
- S3 · `SerieMensal.tsx:44` removida (situação na tabela) · espera: teste reprova · obtido: os dois casos de mês marcado reprovados (2 failed, 31 passed)

## Achados
- A1 (recomendado) web/src/features/operacional/resumo/componentes.test.tsx:532 · "o SLA do mesmo mês não muda" só afirma a ausência do texto "Histórico incompleto" na série de SLA, com `prioridades: []`; um mês de SLA com valor publicado no mês marcado provaria que o ponto segue igual.
- A2 (recomendado) web/src/features/operacional/resumo/modelo.ts:345 · nenhum teste cobre o mês marcado como último ou penúltimo da série (frase sem comparação); o ramo `valor === null` já existe e está coberto por outros casos, por isso não bloqueia.
