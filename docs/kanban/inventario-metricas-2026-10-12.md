# Inventário: o que falta para as métricas estarem completas com mock (2026-10-12)

Escopo: só o que falta para as métricas funcionarem de ponta a ponta com dados mockados (70% do esforço). Integrações reais, banco e CI ficam fora (os 30%). Levantamento por leitura, sem execução do app; itens marcados "verificar" dependem de conferência no código atual.

## Visão geral (fatos)
- Catálogo do briefing (seção 06): 18 FL1 + 9 FL2 + 5 FL3 + EI + 12 sustentação = 45 métricas. `METRICA_IDS` cobre todas (O1-O18, T1-T9, E1-E5, S1-S12, EI_FL1/2/3/SUST, BLOQUEADOS, VISAO_GERAL). **Nenhuma métrica do briefing está sem implementação.**
- Os 8 cartões de status `mock` ("Dados fictícios" por falta de fonte real): O17, T8, E4, S8, S11, S12 (6 segundo o QA de 2026-10-11).
- `REGRAS_METRICA` com `status: 'pendente-usuario'`: **O1, O2, BLOQUEADOS, O10, T4, T7, T9**, todos por uma única dúvida, a P1 (arquivado sem desfecho conta como aberto?).
- A decisão delegada nº 9 (2026-10-11) já diz que a P1 é definitiva (arquivado sem entrega e sem `motivo_descarte` sai do aberto e é contado à parte) e manda retirar `pendente-usuario` das 8 células. O código em `packages/metricas/src/core/regras.ts` ainda tem `PENDENTE` (linhas 82-274). Falta executar a decisão.
- Das 17 pendências de regra complementares, todas constam como resolvidas; nenhuma bloqueia o mock.

## Tabela, ordenada por valor
Esforço: P (até uma sessão), M (poucas sessões), G (mais de isso). "Decisão" = precisa do usuário.

| # | Item | Tipo | Esforço | Dono sugerido | Dependência | Decisão do usuário? |
|---|---|---|---|---|---|---|
| 1 | Retirar `pendente-usuario` de O1, O2, BLOQUEADOS, O10, T4, T7, T9 conforme decisão nº 9; ajustar testes de `regras.test.ts` e a propriedade 1 que exclui as células nominalmente | Regra provisória | P | node-backend (+ tech-lead review) | Nenhuma (decisão já tomada) | Não (apenas confirmar que nº 9 vale para o mock) |
| 2 | UX N-1 (alto): "Leia junto" renderiza em poucos cartões; mapa usa 14. Verificar quantos cartões já renderizam `<LeiaJunto>` hoje (em `web/src` há O3, O4, O10, T1, T4, T9, E1, S3...; a revisão de 11/10 contava 4) e fechar os faltantes | UX pendente, bloqueante da aprovação de UX | P a M | react-frontend | Mapa provisório (N-3) | Não para renderizar; sim para confirmar o mapa (item 3) |
| 3 | N-3: usuário confirma o mapa "Leia junto" (decisão nº 19 diverge do vigente por exigir mesmo painel) | Regra provisória | P | jarvis leva ao usuário | Nenhuma | **Sim** |
| 4 | N-2 (médio): S12 sem cobertura "n de N" (decisão nº 13 exige em S8 e S12); `cobertura` só existe no schema de S8 | Estado de UI faltando | P | node-backend (schema) + react-frontend | Nenhuma | Não |
| 5 | M-5: validação do usuário da seção "Mais métricas" não registrada; falta `especificacao.md` do upstream (`05-validacao.md` aguardando) | UX pendente | P | ux-designer + usuário | Nenhuma | **Sim** (validar) |
| 6 | Revisão UX final a 375 e 1280 px do pedido "métricas fora do núcleo": nunca foi feita com app rodando (só revisão estática); sem ela UX não aprova para QA final | UX pendente | P | ux-designer | App buildável | Não |
| 7 | L-1: "taxa de escape (O15)" em O13 e O16 é texto; virar link (âncora `#o15` ou Leia junto) | UX baixo | P | react-frontend | Item 2 | Não |
| 8 | L-4: `MaisMetricas` retorna `null` se tudo oculto; `FaixaOcultas` não menciona complementares | UX baixo | P | react-frontend | Nenhuma | Não |
| 9 | N-4 (baixo): coluna "Dados" do catálogo mostra "Da coleta" para o núcleo, mas o app inteiro roda em mock; diverge da decisão nº 20 e do DS 2.11 | Rótulo enganoso | P | react-frontend | Nenhuma | **Sim** (manter "Fictícios" em todos até a coleta real ou aceitar o desvio) |
| 10 | L-7: falta teste explícito de que O6 nunca mostra "Fora da meta" | Teste | P | qa-engineer | Nenhuma | Não |
| 11 | Bug 004 (baixa, aberto, FIL-04): marcar todas as equipes não remove o parâmetro da URL | Bug de filtro | P | react-frontend | Nenhuma | Não |
| 12 | Bug 002 (média): estado vazio do O4 mostra também "Amostra insuficiente: 0 de 20"; spec 6.2 pede estados distintos (verificar se ainda aberto) | Bug de estado de UI | P | react-frontend | Nenhuma | Não |
| 13 | Bug B12-001 (média): leitura do O2 aponta a etapa do item errado (verificar se ainda aberto) | Bug de métrica | P | react-frontend / node-backend | Item 1 | Não |
| 14 | Bug B12-003 (baixa): `data-testid` de BLOQUEADOS em caixa mista; faltam `estado-vazio-*` e `estado-erro-*` desse cartão | Estado de UI + teste | P | react-frontend | Nenhuma | Não |
| 15 | Bugs B3-001 (média, Sustentação sem faixa "pede atenção"), B3-002 (média, alerta da Visão Geral aponta para âncora inexistente; reavaliar com O12 entregue), B3-003 (baixa, recorte da Visão Geral com período ambíguo) | Bugs da Visão Geral/Sustentação | M (os 3 juntos) | react-frontend | Nenhuma | Não |
| 16 | Bug 001 (média, gerador Acelerato importa BusinessMap: fere "nunca se misturam") e 003 (média, filtros não ficam sticky) e 005 (baixa, alvos do cabeçalho < 44 px) | Bugs; 001 toca regra inviolável | M | node-backend (001), react-frontend (003, 005) | Nenhuma | Não; 001 é bloqueante pelo critério do quadro (fere regra inviolável), conferir se foi corrigido |
| 17 | Bugs de performance 009, IR-001, IR-002 (CLS, C6 instável, leitura de coleta presa em "Verificando") | Bugs transversais | M | react-frontend | ADR 0003 | Não |
| 18 | **K-036, lacuna de valor (fit for purpose)**: discovery pronto (`docs/ux/lacuna-de-valor`, `05-validacao.md` com "Registro do retorno" vazio); precisa de validação do usuário e respostas D-1 a D-10 (texto das 5 perguntas, quem responde, base mínima 5/3 vs regra 20, comentário livre, meta, "O que mudou", lugar Sustentação vs Estratégico, por área vs consolidado, quem carrega) antes de plano técnico. O plano está sendo escrito por outro agente. Depois: contrato, cálculo com mock, cartão e estados na Sustentação. Não está no catálogo nem em `METRICA_IDS` | Métrica nova (fora do briefing, citada como lacuna conhecida) | G (após decisão) | ux-designer, software-architect, node-backend, react-frontend | Decisões D-1 a D-10; cuidado com anonimato e anti-avaliação | **Sim** (10 decisões) |
| 19 | KANBAN.md desatualizado: última atualização 2026-10-10 10:55; não reflete o trabalho de 11 e 12/10 (complementares, homologação) | Processo | P | jarvis (agile-coach audita) | Nenhuma | Não |

## Fora do inventário (os 30% de "resto")
Coleta real de O17 (campo causa raiz via Metabase), campos sem fonte real (sprint, natureza Manter/Evoluir, `registro_problema`) que permanecem `mock` por decisão, integração BusinessMap e Acelerato, banco, CI e homologação.

## Leitura do coach
- Ganho rápido de maior valor: itens 1, 2, 4 e 3/5/9 (três decisões que cabem em uma conversa). Com isso as 45 métricas ficam sem regra provisória de código e a aprovação de UX deixa de ficar bloqueada.
- Com 17 bugs registrados em `docs/qa/bugs/`, só 5 têm menção de fechamento (006, 007, 008, B12-002, MC-001); o resto precisa de triagem (verificar status) antes de virar cartões agrupados por origem e severidade, conforme a política do quadro. Sugestão: um cartão `[bug]` para os médios de Visão Geral/Sustentação e outro para filtros/UI.
- K-036 é o único item grande e o único que adiciona métrica nova; recomendo tratá-lo como decisão do usuário primeiro, sem esforço de código até o retorno.
