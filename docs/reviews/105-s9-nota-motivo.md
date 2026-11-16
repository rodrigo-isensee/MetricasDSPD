---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s9-nota-motivo
commit: 235e3acb32abd470e05f80e49873b8f398656f31
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: nota do S9 sobre o motivo da Pendente (105, K-381, E7.280)

Revisado de `57989aa0` (Base-sha) até `235e3acb`: um commit, 3 arquivos, +12/-1 (`notas.ts`, `notas.test.ts`, `CHANGELOG.md`).

## Escopo e decisões
- Cumpre a DECISÃO DO DONO D5b "A" (2026-11-16 12:45): não mexe na projeção do motivo; só a nota no cartão do S9. Cálculo, contrato e consultas não mudam.
- O texto bate com o código: `packages/metricas/src/acelerato/s9.ts:21` classifica Pendente sem motivo como "Não classificado", e o critério em `packages/metricas/src/core/criterios.ts:204` diz o mesmo.
- O S9 só é renderizado por `CartaoComplementar.tsx:84` a partir de `NOTAS_COMPLEMENTARES`; não há segunda nota do S9 em `sustentacao/notas.ts` que fique desatualizada.
- Regras invioláveis: nada de pessoa, nada mistura BusinessMap e Acelerato; a nota não avalia ninguém.

## Testes
- Teste novo `notas.test.ts:12` afirma a frase exata em `S9.cuidados`; rodado aqui: `vitest run src/features/complementares/notas.test.ts` → 2 passed. O teste antigo de pontuação dupla segue cobrindo o texto novo.
- Sem guarda nova no diff: nenhum mutante a declarar.
- Suíte inteira: sem PR para a branch, fica para o CI do PR; vale o pronto do autor registrado no pedido (E7.263, "K-381 enviado (235e3acb)"). Este parecer não afirma CI verde.

## Tamanho
11 linhas de código e teste; um comportamento só.

Sem achados.
