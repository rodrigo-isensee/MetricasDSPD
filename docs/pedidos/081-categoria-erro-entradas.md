# Pedido 081: entradas de comando dizem a categoria do erro (K-241)

- **Modo:** implementar
- **Objetivo:** quando uma entrada de comando de referência (ref:sync-calendario e afins) falha por configuração ou banco, a mensagem diz a categoria (variável ausente ou inválida, com o nome da variável; autenticação; conexão; outro), sem expor valor, URL, senha nem texto do erro do banco
- **Clareza:** 0 confirmado; 2 técnico; 1 suposição; 0 perguntas
- **Depende de:** 076-publicacao-local (MELHORIA da retrospectiva)

## Escopo
- E1. K-241: as entradas de referência que hoje imprimem só "configuração ou banco inválidos" passam a imprimir a categoria do erro e, para configuração, o nome da variável ausente ou inválida; nunca o valor · `técnico`

## Etapas
- E1.1 (node-backend): implementação com testes, numa função única de classificação usada pelas entradas de referência.
- E1.2 (tech-lead): review.
- E1.3 (security-engineer): parecer de segurança (mensagem de erro e log de entrada que lida com segredo).
- E1.4 (qa-engineer): QA.
- E1.5 (tech-lead): PR para a develop, depois do QA.
- E1.6 (agile-coach): retrospectiva do pedido 081.

## Fora do escopo
- Mudar o código de saída das entradas (1 para falha, 2 para uso) · `técnico`
- Entradas do coletor e do apontamento, que já têm mensagens próprias · `técnico`

## Suposições
- O "sem causa por desenho" das entradas (comentário de `ref-sync-calendario.ts`) é sobre não vazar valor, URL, senha e texto do erro do banco, e a categoria com o nome da variável não fere isso. Base: o próprio comentário e o K-241. Muda com: parecer de segurança contrário (o item volta ao dono como pergunta). Custo de reverter: baixo.

## Perguntas na fila

## Histórico
- 2026-11-07 08:04: pedido aberto (Jarvis) pela autonomia de melhoria técnica do projeto (K-241, MELHORIA da retrospectiva do 076: o passo 4 da publicação local falhou duas vezes sem a causa); não muda produto nem custo; gatilho de segurança (mensagem de erro de entrada que lida com segredo): parecer do security-engineer na E1.3; sem recibo ao dono, aviso no resumo da manhã. Worktree 052d (o PR 258 do 073 segue aberto pelo gh; a branch dele fica no remoto), branch feature/081-categoria-erro-entradas da develop 852b9406.
- 2026-11-07 08:05: DECISÃO TÉCNICA (Jarvis): neste pedido vale a regra de push do 075 (01:20): push ou pre-push com mais de 15 minutos está preso; o agente para e relata, o Jarvis avisa o dono e refaz; 1 push por vez enquanto a regra da noite do dono valer.
- 2026-11-07 08:06: Brief node-backend-2 aprovado na rodada 2 e delegado (052d).
- 2026-11-07 08:25: E1.1 entregue pelo node-backend: feature/081-categoria-erro-entradas em 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af, CI verde (run 42367687534; o primeiro push caiu no typecheck de tools/docs-contratos por parameter property); categoriaDoErro em plataforma/categoria-erro.ts (configuração com nomes, autenticação, conexão, outro), ErroConfiguracao lançado por config.ts, usado por ref:sync-calendario, ac:ref-sync e bm:ref-sync; ref-sync-apontamento fora (exclusão do brief); teste prova que senha, URL, host e texto do banco não saem; 109 linhas; testes de subprocesso rodados fora do sandbox (tsx em /tmp).
- 2026-11-07 08:27: Conferência da E1.1: cumpriu. Correção do Jarvis: a Suposição cita 'sem causa por desenho' como comentário de ref-sync-calendario.ts; a frase vem do Histórico do 076 (11:30); o comentário do arquivo diz 'nunca a URL, a senha nem o texto do erro do banco'. O cabeçalho do arquivo ('imprime só contagens e o hash') ficou desatualizado: vai ao review.
- 2026-11-07 08:27: entrega conferida 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af
- 2026-11-07 08:28: Brief security-engineer-1 aprovado e delegado (052d).
- 2026-11-07 08:33: Segurança da E1.3: aprovado, sem achados, parecer em dbdbb4170264ae3c16e23d31f17253b75d18751a (commit: 1f8a19c6), enviado.
- 2026-11-07 08:34: Conferência da segurança: cumpriu.
- 2026-11-07 08:34: entrega conferida dbdbb4170264ae3c16e23d31f17253b75d18751a
- 2026-11-07 08:35: Brief tech-lead-1 (review) aprovado; sai quando o tech-lead terminar o PR do 079.
- 2026-11-07 08:38: Review da E1.2 delegado ao tech-lead (tech-lead-1).
- 2026-11-07 08:41: Review da E1.2: aprovado, parecer em 5f906a661e60b145e4aebb755dc4d05e7e658863 (commit: 1f8a19c6), enviado; 111 linhas; A1 cabeçalho de ref-sync-calendario.ts sem a categoria, A2 ref-sync-apontamento.ts ainda com a mensagem antiga (fora do escopo; vira cartão K-244).
- 2026-11-07 08:43: Brief qa-engineer-1 (QA) aprovado e delegado (052d).
- 2026-11-07 08:43: Conferência do review: cumpriu.
- 2026-11-07 08:43: entrega conferida 5f906a661e60b145e4aebb755dc4d05e7e658863
