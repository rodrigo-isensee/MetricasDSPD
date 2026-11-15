---
tipo: review
contrato: 1
pedido: 105-registro-posterior
branch: fix/105-s1-registro-posterior
commit: f78a493bd068412dbf2bc1476363121b887b16b1
parecer: aprovado
revisor: tech-lead
data: 2026-11-15
---

# Code review: texto do registro posterior (E3.50)

Pedido 105-melhorias-15-11. Diff de 157b50e0 a f78a493b: 12 arquivos, 27 adições e 22 remoções, só texto (S1, S2, S12, duas notas do contrato e o MTTR do S1), com testes e e2e de API ajustados.

## Conferência contra o código
- Decisão "A" (chamado aberto depois do atendimento) e "B" (o Acelerato não traz a marca): todas as frases novas dizem as duas coisas. `indice.ts:95` calcula `apuravel: fechado && !excecao_sla_registro_posterior` e `s1.ts:74` conta `excecoesForaDaApuracao` pela diferença; "fora da apuração pela regra" bate com isso. `s12.ts:91-94` dá `excecaoSla` nulo sem fonte, e o texto "campo sem fonte" bate.
- MTTR "pendente ou em validação": `totalizadores.ts:37` e `:50` (`ETAPAS_PAUSA = ['Pendente', 'Aguardando validação']`) confirmam as duas pausas do relógio de resolução.
- Contrato: `packages/contratos/src/origem.ts` mudou só o valor de duas strings (`excecao-sla-sem-fonte`, `excecao-sla-s12-sem-fonte`); chaves, tipos e schemas intactos. Sem mudança de cálculo em `packages/metricas`.
- Resíduos do texto antigo: só comentários de código e `schemas.ts` (comentário de contrato), não texto de interface.

## Testes e CI
- Testes e e2e acompanham as frases novas (`ramos.test.tsx`, `leitura-s12.test.ts`, `sustentacao.test.tsx`, `sem-zero-ajuste-069-l9a.spec.ts`), sem afrouxar asserção.
- CI do head f78a493b (run 43755872923): concluído com sucesso (rapida, testes, banco, build, openapi, seguranca, imagem, filtro; perf e e2e skipped pelo filtro).
- Tamanho: 49 linhas de código e teste, abaixo do teto de 150.

## Achados
