---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-aba-front
commit: 60194ef7c73df23c57cb33fdf9856c91c686a250
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Code review: front da aba Apontamento, filtro por tipo ligado (pedido 059, E2.31, K-193)

**Ponta revisada:** `60194ef` (o código do front é o de `d2b3d14`; `60194ef` só traz por merge a ponta da rota `abfd287`, sem mudança em `web/`).
**Veredito: aprovado.** A3 e A8 da rodada anterior estão resolvidos, com teste de ponta a ponta. Nenhum achado novo.

## Delta lido
Intervalo `7efbd57..60194ef` (saída de `forge-check delta --parecer docs/reviews/059-delta.md`). Lido o diff completo de `web/` (10 arquivos, 68 linhas somadas e 139 removidas) e de `docs/tecnica/arquitetura-front.md` (item "Filtro por tipo" no lugar da sonda). O resto do delta é servidor (`docs/api`, `openapi.json`, módulo e migrações) que veio pelo merge da rota e tem review próprio na branch da rota; não relido aqui.
**Já lido (fora do delta, não relido):** a aba em `web/src/features/apontamento/` como revisada em `7efbd57`.

## Conferência dos achados anteriores
- **A3: resolvido.** O filtro por tipo fica sempre visível (`BarraFiltrosApontamento.tsx`) e `definirLista('tipo', ids)` manda o `id` de `opcoes.tipos` (dígitos de `type_id`), validado por `consultaApontamentoSchema` (`tipo: lista(idNumerico, 50)`, contrato linha 141). `ligacao.test.tsx` prova de ponta a ponta: um tipo (`tipo=5`, chip com o rótulo), dois tipos (`tipo=3%2C7`, ordem escolhida), id inexistente (recorte vazio com orientação, chip sai pelo X) e rótulo antigo na URL (descartado com aviso, nunca vai à rota). A fixture usa ids em dígitos (`3`, `5`, `7`) como o contrato exige; a rota falsa trata `tipo` em CSV como a rota real.
- **A8: resolvido.** `useFiltroTipoDisponivel`, `filtroTipoDisponivel`, `VALIDADE_SONDA_TIPO_MS`, o campo de `FonteApontamento` e as opções `tipo` e `falhasDaSonda` da rota falsa saíram, com os testes que só serviam à sonda. Sem referência restante (busca em `web/src/features/apontamento`); a primeira chamada da aba é a consulta real, afirmada em teste. A seção do `arquitetura-front.md` foi atualizada na mesma entrega.

## Resto
- Código removido e simplificado, sem lógica nova fora do filtro; sem regra inviolável tocada (a tela não calcula métrica, nada de pessoa em armazenamento). O teste de ausência da sonda procura o que existia (`tipo=1&` na consulta) e afirma a primeira chamada exata, não só a ausência.
- Teto M14: o delta de código e teste do front tem 67 linhas somadas e 139 removidas; o PR do front para a `develop` segue com a linha `teto: excedido, <n> linhas, <motivo>` no corpo, pela decisão do dono de 2026-11-02.

## Ferramentas (citadas, não refeitas)
- CI: run 41424467207 sobre `d2b3d14` (mesmo código de `web/`), sucesso. Run 41430986768 sobre `60194ef` estava em andamento na hora da leitura; o merge não muda `web/`.
- Pronto interno verde é o relato do autor (registros de 16:30 e 19:00); o pronto com a trava global não rodou no sandbox, a conferir no CI e no QA.
- Segurança: `docs/security/059-delta.md`; UX: `docs/ux/059-revisao-delta-r2.md`. Citados, não refeitos; o filtro por tipo não toca URL de pessoa nem armazenamento.

## Achados
- A3 (recomendado) web/src/features/apontamento/filtros.ts:28 · resolvido nesta rodada: o filtro por tipo usa o id de opcoes.tipos, validado pelo contrato, com teste de ponta a ponta. Sem pendência.
- A8 (recomendado) web/src/features/apontamento/useApontamento.ts:37 · resolvido nesta rodada: a sonda do tipo foi retirada. Sem pendência.

## Parecer
**Aprovado.** Sem achado aberto. Condições do PR para a `develop` (não desta rodada): linha de teto no corpo, merge do PR da exceção antes, pareceres de QA, segurança e UX em dia e CI verde na ponta.
