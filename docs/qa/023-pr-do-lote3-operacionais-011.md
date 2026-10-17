---
tipo: qa
contrato: 1
pedido: 023-pr-do-lote3-operacionais-011
branch: develop
commit: ed6ba46
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
aceite_usuario: sim
data: 2026-10-17
---

# QA: promoção develop → homolog (#102, #103, #105, #107, #108, #109, #114)

Escopo: `origin/homolog` (0eebfe7) .. `origin/develop` (ed6ba46f39ed98fa76972c9fffe12c982f223e7f). Decisão do dono (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica"; vale a tabela de etapas da fábrica, com parecer de QA próprio antes do PR de promoção. Review da promoção: `docs/reviews/023-pr-do-lote3-operacionais-011.md` (aprovado).

Este parecer é de consolidação: confere que cada PR incluído tem parecer de QA aprovado e que a CI do head da develop está verde. Não rodei suíte local (restrição do usuário: nada pesado local; a CI é a prova).

## Veredito

**Aprovado, escopo completo.** Zero bug crítico, alto ou médio aberto. Uma ressalva baixa aberta (R-1 do 024), com aceite do dono registrado.

## PR × parecer de QA × ressalvas

| PR | Conteúdo | Parecer de QA (commit) | Resultado | Ressalvas abertas |
|---|---|---|---|---|
| #102 | documentação da retomada | não se aplica (só documentação; review `013-docs-retomada.md` aprovado) | n/a | nenhuma |
| #103 | K-102, fila de montagem dos gráficos | `docs/qa/k102-perf-semanal.md` (51bb652) | aprovado | R1 e R2 do parecer (E2E completo não verde numa execução local sob carga; TBT da semanal depende de runner limpo): ressalvas de ambiente, sem bug; a CI do PR e a do push na develop passaram (E2E verde). O `perf` da CI e o `perf-homolog` seguem como confirmação no portão da homolog |
| #105 | fase 2, estratégicas (E6, E7 com R$, E8) | `docs/qa/011-fase2-estrategicas.md` (1193689) | aprovado | nenhuma |
| #107 | fase 2, táticas (T13, T14, B11-001 no T10) | `docs/qa/011-fase2-taticas.md` (a1c0ee0) | aprovado | nenhuma |
| #108 | front das estratégicas (E9, E6, E7, E8) | `docs/qa/011-front-estrategicas.md` (cb68ace) | aprovado | nenhuma |
| #109 | fase 2, operacionais (O22, O26) | `docs/qa/011-fase2-operacionais.md` (b99ee1f) | aprovado | nenhuma |
| #114 | E7 sem R$, participação por entregas, "Entregas por sistema" | `docs/qa/024-e7-sem-reais.md` (781e171) | aprovado | R-1 (baixa, documental): registro `docs/qa/bugs/024-001-e8-test-fora-do-prettier.md` diz "`git diff -w` vazio", impreciso (o diff real é quebra de linha). Sem efeito em código. Aceite do dono: pedido 024, 2026-10-17, opção A |

Bugs por severidade (abertos): crítica 0, alta 0, média 0, baixa 1 (R-1). O bug médio 024-001 foi corrigido em b390b0c.

## CI e E2E

| Prova | Evidência | Resultado |
|---|---|---|
| CI do push na develop, head ed6ba46f39ed98fa76972c9fffe12c982f223e7f | run 39046337856: https://github.com/rodrigo-isensee/MetricasDSPD/actions/runs/39046337856 | success |
| E2E do conjunto no PR #114 | run 39040656592 (evento pull_request, head e2406736 do branch do PR, antes do squash): https://github.com/rodrigo-isensee/MetricasDSPD/actions/runs/39040656592; jobs e2e, rapida, filtro, imagem, testes, seguranca, openapi, build e banco success; perf skipped | success |
| E2E sobre o head do push na develop | o run 39046337856 é o da develop; o do conjunto rodará de novo no PR de promoção e no portão da homolog | pendente (portão seguinte) |

Observação: o run 39040656592 testou o head do branch do PR #114 (e2406736), não o commit squash ed6ba46. A prova sobre ed6ba46 é o run 39046337856 do push na develop. Também há o push de e2406736 (run 39040264631, success).

## Riscos residuais

- Mutação e rodada local não repetidas nesta promoção (consolidação sobre pareceres e CI); cada parecer de PR registra a sua.
- TBT da semanal (K-102) depende de runner limpo: confirmar no `perf` do PR de promoção e no `perf-homolog`; critério de reversão na seção 10 de `docs/tecnica/arquitetura-front.md`.
- Validação visual do dono na homolog, pois a promoção muda interface (#108, #114).
