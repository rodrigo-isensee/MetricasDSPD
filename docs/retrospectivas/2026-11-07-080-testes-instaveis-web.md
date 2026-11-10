# Retrospectiva do pedido 080: testes instáveis da web (K-173 e K-192)

Data: 2026-11-07. Pedido: `docs/pedidos/080-testes-instaveis-web.md`. Mesclado na develop pelo dono às 11:59 (PR 265, squash ab423d02). Fala do processo, nunca de pessoa ou agente.

## Dados do fluxo (R-DECISAO: medido, estimado ou não medido)
- Pedido aberto 07:38, mesclado 11:59: 4h21 corridas (medido, pelo Histórico do pedido). QA final aprovado às 11:37 (parecer regravado 11:47); o PR 265 foi aberto e mesclado entre 11:51 e 11:59. Percentis: não calculados (1 pedido, menos de 20 itens).
- Voltas: 2 voltas de implementação (volta 1 por QA reprovado às 08:38; volta 2 entregue às 09:17) e 1 volta só do parecer de QA (11:39 a 11:47) (medido, Histórico).
- Espera por agente travado: QA delegado às 10:13, travado sem progresso por 600 s e redisparado às 10:46 (33 min até o redisparo); parecer aprovado às 11:37 (medido, Histórico de 10:13, 10:46 e 11:37).
- Retrabalho, pelas conferências do 080 (`docs/kanban/conferencias.md`, linhas do 080): 2 briefs reprovados de 12 (react-frontend-3 e -4, motivo `forma`: teto sem decisão, "desde" no PQ-4, rótulo da volta, marca de corte em achado que não é item de Escopo; aprovado no -5, rodada 3); 2 entregas não cumpridas de 8 conferidas (react-frontend-2, `forma`, parada com causa achada e sem commit; qa-engineer-2, `citacao`, parecer com exclusão atribuída ao brief). Bugs do QA: 1 bloqueante (A1 do QA-1, E2 não cumprida) e 1 recomendado sem reprodução (A2, timeout a 375 px). Achados do review: 1 recomendado na volta 1 (A1, gap-y-1 sem teste próprio) e 1 na volta 2 (A1, outros axe em páginas longas com barra sticky).
- Escape (depois do parecer final): nenhum registrado no Histórico do pedido; `forge-check escape resumo` não rodado: não medido.
- Clareza (pedido): 0 confirmado, 2 técnico, 1 suposição, 0 perguntas, 0 delegado (medido, tags do pedido). Sem "não entendi", sem ESCOPO+/-, sem DEVOLVIDA registrados e seção "Registro de clareza" ausente: não medido.
- Tamanho da entrega: 91 linhas na volta 2 (medido, Histórico de 09:17); teto de 150 linhas por entrega.
- DORA, só do que o pedido mostra: 1 PR na develop; lead time de mudança, taxa de falha e tempo de recuperação: não medidos (`forge-check` e `gh` não rodados nesta retrospectiva).
- Dois relógios por release (D-4) e custo em tokens: não medidos (`forge-check voltas` e `forge-check transcricao custo` não rodados).

## O que correu bem
- K-173 fechou sem código: a evidência (waitFor já na linha 176; 20 rodadas sem falha no react-frontend, 5 de 5 no QA) bastou, como a suposição do pedido previa.
- A volta 2 parou sem código quando o trace mostrou a causa (L3-01 mede o axe com a página ainda mudando de altura, e a barra sticky cobre o link a partir de 768 px). A correção foi no teste, sem afrouxar regra do axe, timeout nem retry: `esperarAlturaEstavel`, 40 de 40 rodadas (20 a 1280 px, 20 a 375 px), 91 linhas e tela igual à base.
- O QA reprovou com número (2 de 9 a 1280 px) em vez de aceitar o endurecimento, o que evitou um PR com correção que não agia na causa.
- A conferência pegou a atribuição falsa ao brief no parecer do QA no mesmo dia e o parecer foi regravado sem mudar veredito nem números.

## O que travou (fatos)
1. O `gap-y-1` (K-192) não agia na causa. O react-frontend entregou às 08:01 com "não reproduz, 72 de 72" e endureceu o CSS mesmo assim; review (08:23) e revisão de interface (08:03) aprovaram; só o QA reproduziu a falha (08:38, 2 de 9 a 1280 px). Custo: volta 2 inteira, mais a revisão de interface que deixou de se aplicar (parecer sem commit descartado).
2. Os briefs react-frontend-3 e -4 foram reprovados por forma, e o -5 saiu só na terceira rodada (08:49 a 08:52): 3 rodadas de conferência de brief para uma volta de uma etapa.
3. O QA de novo travou 600 s sem progresso e sem parecer (10:46, redisparado). A tentativa travada deixou o commit d0a19ce1 por baixo do parecer final (88bae466).
4. Os timeouts do L3-01 a 1280 px (3 de 20) apareceram com carga 16 em 8 núcleos; com carga 2, 10 de 10. A série do QA mediu a máquina sobrecarregada tanto quanto o teste.
5. O parecer de QA atribuiu ao brief uma exclusão ("fora de escopo, conforme o brief: suíte inteira, vermelho antes do verde e mutação") que ele não traz. Custo: volta do parecer (11:39 a 11:47) e um brief a mais (qa-engineer-3).

## Ações (até 3)
1. react-frontend e tech-lead: em cartão de teste instável que não reproduz, a primeira entrega traz a causa pelo trace ou diz que não achou; não muda CSS ou código de tela "por endurecimento" sem reproduzir antes e depois. Medida: voltas por cartão de teste instável (hoje 2 no K-192).
2. qa-engineer: ao rodar séries de E2E, manter a carga da máquina até o número de núcleos (8) e registrar a carga no parecer, para o timeout sob carga não contar como falha do teste. Medida: timeouts por série com carga declarada (hoje 3 de 20 com carga 16, 0 de 10 com carga 2).
3. Jarvis: antes de delegar uma volta de um achado só, conferir o brief contra a lista de forma (teto com decisão registrada, PQ sem "desde", rótulo da volta, marca de corte só em item de Escopo). Medida: briefs reprovados por `forma` por pedido (hoje 2 de 12).

## MELHORIA
MELHORIA: (Projeto) revisar os outros testes de axe em páginas longas com barra sticky de filtros (mesma causa do L3-01: axe medido com a página ainda mudando de altura) e aplicar o `esperarAlturaEstavel`; problema: o padrão pode repetir em outros E2E de lote; evidência: Histórico do 080 de 08:46 e A1 do review da volta 2 (10:11); medida: E2E de axe intermitentes por mês = 0 e testes de axe em página longa sem espera de altura estável = 0.
MELHORIA: (Forge) a instrução do react-frontend deve dizer que cartão de teste instável não reproduzido pede a causa pelo trace antes de qualquer mudança de código de tela; problema: endurecimento sem causa (`gap-y-1`) passou por review e interface e foi reprovado só no QA; evidência: Histórico do 080 de 08:01 (72 de 72 sem falha, mudança de 4 px) e 08:38 (2 de 9 falhas); medida: voltas por cartão de teste instável e revisões de interface descartadas por pedido.
MELHORIA: (Forge) o qa-engineer deve registrar a carga da máquina nas séries de E2E e manter até o número de núcleos; problema: 3 timeouts de 20 a 1280 px com carga 16 em 8 núcleos, 0 de 10 com carga 2; evidência: Histórico do 080 de 11:37; medida: timeouts por série com carga declarada.
MELHORIA: (Forge) o qa-engineer não deve atribuir ao brief exclusão que ele não traz: citar o trecho do brief entre aspas ou dizer que o corte foi do próprio agente com o motivo; problema: parecer com "conforme o brief" falso; evidência: conferência de 11:39 do 080 (motivo `citacao`, qa-engineer-2); medida: entregas `não cumpriu` por `citacao` por mês = 0.
MELHORIA: (Forge) o redisparo de agente travado deve preservar ou descartar de forma registrada o commit da tentativa travada; problema: commit d0a19ce1 ficou por baixo do parecer final e a conferência o notou à mão; evidência: Histórico do 080 de 10:46 e 11:37; medida: redisparos com commit órfão não explicado = 0.

## Linha de base (M14b)
`forge-check esperas`, `escape resumo`, `corrigidos` e `afrouxamentos`: não rodados nesta retrospectiva (fora do escopo do brief); não medido. Nenhuma das melhorias acima afrouxa controle: todas pedem mais prova ou mais registro, nenhuma retira regra, timeout ou retry.

## Revisão das ações da retrospectiva anterior
Não revisadas aqui: o brief pede só esta retrospectiva; as ações da retrospectiva do 081 (mesmo dia) ainda não tiveram uma segunda ocorrência para medir o efeito: não medido.
