# Pedido 066: S8 (taxa de reabertura) só com incidentes que têm resposta

- **Modo:** implementar
- **Objetivo:** parar de mostrar 0% enganoso no S8: o denominador passa a ser só os incidentes com resposta no campo de reabertura em 90 dias (sim ou não); abaixo de 20, a tela não publica (decisão "B" do dono)
- **Clareza:** 2 confirmado; 0 suposição; 0 perguntas
- **Depende de:** 064-lacunas-dado-real (achado M5, mapa em docs/analises/064-lacunas-dado-real.md)

## Escopo
- E1. O S8 conta só os incidentes com resposta (sim ou não) no denominador, pela biblioteca compartilhada, com a mudança de critério registrada com data e marcada no gráfico (T2.6), substituindo a regra D-10 nesse ponto · `confirmado`
- E2. O cartão do S8 explica, quando não publica, que falta preenchimento do campo no Acelerato · `confirmado`

## Etapas
- E1.1 (software-architect): desenho curto da mudança da D-10 (onde está a conta, versão de critério, efeito no contrato da API e no cartão).
- E1.2 (node-backend): implementação na biblioteca e no server, com testes.
- E1.3 (react-frontend): ajuste do cartão, se o desenho pedir.
- E1.7 (ux-designer): revisão de interface do cartão do S8 com os textos novos, sem commit (o tech-lead commita no começo do review).
- E1.4 (tech-lead): code review.
- E1.5 (qa-engineer): QA.
- E1.6 (tech-lead): PR para a develop e merge.

- E1.8 (tech-lead): trazer a develop para a branch do 066 resolvendo o conflito em docs/api/metricas.md (as duas seções ficam), revalidar pelo forge-check pr e mesclar o PR 216.
- E1.9 (tech-lead): review regravado na ponta depois do merge da develop.
- E1.10 (qa-engineer): parecer de QA regravado na ponta depois do merge da develop.
- E1.11 (tech-lead): merge do PR 216.
- E1.12 (agile-coach): retrospectiva do pedido 066.
## Fora do escopo
- O preenchimento do campo no Acelerato: configuração de ferramenta por pessoas (WS4) · `confirmado`
- Outras métricas da sustentação · `confirmado`

DECISÃO DO DONO (2026-11-04): "B" (S8 com 95% dos incidentes sem resposta e taxa 0% pela regra D-10): contar só os incidentes com resposta (sim ou não); abaixo de 20, a tela não publica e mostra dados insuficientes até o campo ser preenchido; a mudança de critério é registrada com data (T2.6).

DECISÃO DO DONO (2026-11-04): "é isso" (recibo do 066): o S8 conta só os incidentes com resposta, abaixo de 20 não publica, mudança de critério registrada com data, e o cartão explica que falta preencher o campo no Acelerato quando não publica; sem mexer no Acelerato nem em outras métricas.

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-04 14:11: pedido aberto pela decisão "B" do dono no S8 (achado M5 do 064). Recibo enviado (E2 como suposição). Cartão K-217.
- 2026-11-04 14:12: recibo confirmado pelo dono: "e isso". Sem gatilho de segurança (sem dado de pessoa, segredo, dependência nem banco novo). DECISÃO TÉCNICA (Jarvis): discovery só com o arquiteto (E1.1), porque o estado de dados insuficientes já tem padrão de tela.
- 2026-11-04 14:17: E1.1 cumprida pelo software-architect: desenho em docs/analises/066-desenho.md (sem commit): a biblioteca (packages/metricas/src/acelerato/s8.ts) já divide só pelos que responderam e não publica abaixo de 20; o 0% vem do adaptador extrasAC (server/src/modulos/metricas/mapa.ts), que não marca sem_resposta nem null como ausentes; correção no adaptador; versão de critério 066:S8-com-resposta em CRITERIOS_ACELERATO (056:D-10 fica como histórico); contrato compatível (só valores), texto de docs/api/metricas.md; web muda só nos textos (AmostraInsuficiente, coluna Com resposta, nota do S8) e o E2E COMP-12; back e front podem rodar em paralelo. DECISÃO TÉCNICA (Jarvis): E1.2 com o node-backend na worktree MetricasDSPD-041 (limpa), branch nova feature/066-s8 a partir da origin/develop; o front vem depois na mesma branch, para não haver dois agentes na mesma worktree.
- 2026-11-04 14:37: E1.2 cumprida pelo node-backend: feature/066-s8 em baf0b8e37c43ac81a387771283ba85e56b1a412a (push ok): extrasAC marca sem_resposta e null como ausentes; versão de critério 066:S8-com-resposta; testes do M5 (9 com resposta: insuficiente, nunca 0%) e das fronteiras 19 e 20; docs/api/metricas.md; contrato sem mudança de forma; docs:check ok; a worktree precisou de pnpm install offline (faltava o mariadb). DECISÃO TÉCNICA (Jarvis): E1.3 com o react-frontend na mesma worktree, depois do back: textos do cartão do S8 e o E2E COMP-12.
- 2026-11-04 14:45: E1.3 cumprida pelo react-frontend: 69168ac3f0484a8fe5ddc772f64a2863e8070ceb (push ok): quando não publica, o cartão do S8 diz que falta preencher o campo "Este problema já ocorreu nos últimos 90 dias?" no Acelerato; leitura só quando publica; cobertura "Com resposta em n de N incidentes"; coluna Com resposta; nota do S8 (como se calcula e cuidados); teste novo do caso 9 de 195; E2E COMP-12 atualizado e só tipado. DECISÃO TÉCNICA (Jarvis): revisão de interface (E1.7) antes do review, sem commit; depois review e QA; o QA roda o pronto completo que der no sandbox (cobertura do web e docs-contratos), para não repetir o PR 214.
- 2026-11-04 14:48: E1.7 cumprida pelo ux-designer: aprovado com ressalvas, sem crítico nem alto (docs/ux/066-revisao-s8.md sem commit na worktree 041, commit: 69168ac): médio 1 reabertura no comoLer contra reincidência no resto do cartão; médio 2 o aviso de falta de preenchimento fica no fim do cartão; baixos: contraste de text-atencao e o caso de zero respostas. DECISÃO TÉCNICA (Jarvis): E1.4 com o tech-lead: commit do parecer de interface e review na ponta seguinte; os médios ficam para o review avaliar; depois o QA.
- 2026-11-04 15:04: E1.4 cumprida pelo tech-lead: parecer de interface commitado em 7073c1ce637d2ecd42c5a34a396e15c530b76f67; review aprovado em 80f7e8d (commit: 7073c1c), sem bloqueante; docs:check ok; server 1616 e web 1421 com cobertura 100%; recomendados: A1 reabertura contra reincidência no comoLer (notas.ts:153), A2 aviso depois do gráfico (sustentacao.tsx:128), A3 comentário longo em s8.ts. DECISÃO TÉCNICA (Jarvis): E1.5 com o QA citando 7073c1c, rodando também docs:check e a cobertura do web, para não repetir o PR 214; os recomendados ficam como ressalva no PR.
- 2026-11-04 15:29: E1.5 cumprida pelo qa-engineer: aprovado sem bug em 2b394b5 (commit: 7073c1c); server 1616 e web com cobertura 100%, docs-contratos 102, docs:check ok, E2E COMP-12 2/2; recomendados: A1 sem teste ligando o S8 real à marca 066 no cartão, A2 e A3 os do review (reabertura e posição do aviso). DECISÃO TÉCNICA (Jarvis): E1.6 com o tech-lead: PR para a develop com os recomendados como ressalva e merge por squash com a CI verde; se a permissão do ambiente negar o merge, parar e relatar.
- 2026-11-04 15:34: E1.6 parou antes do PR: forge-check pr recusou docs/reviews/066-s8.md por autoria (sem registro de que o papel tech-lead gravou esta versão). DECISÃO TÉCNICA (Jarvis): o tech-lead regrava o parecer de review inteiro pela ferramenta Write, com o mesmo conteúdo e commit: 7073c1c, e segue com o PR e o merge na mesma delegação.
- 2026-11-04 15:45: E1.6 parou antes do PR: forge-check pr recusou docs/reviews/066-s8.md por autoria (sem registro de que o papel tech-lead gravou esta versão). DECISÃO TÉCNICA (Jarvis): o tech-lead regrava o parecer de review inteiro pela ferramenta Write, com o mesmo conteúdo e commit: 7073c1c, e segue com o PR e o merge na mesma delegação.
- 2026-11-04 16:17: E1.6 parcial pelo tech-lead: review regravado pela ferramenta Write sem diferença de conteúdo (forge-check pr passou a sair limpo); PR 216 aberto com checks verdes; o squash falhou por conflito com a develop em docs/api/metricas.md (a develop recebeu o 065 e o 067). DECISÃO TÉCNICA (Jarvis): E1.8 com o tech-lead: merge da develop na branch, mantendo as duas seções de docs/api/metricas.md, sem mudar código; forge-check pr de novo; se ele pedir revalidação de parecer, parar e relatar; senão, push, checks e merge.
- 2026-11-04 16:23: E1.8 parcial pelo tech-lead: merge da develop em a54ac8d (conflito só numa linha de docs/api/metricas.md, as duas seções mantidas, sem código); docs:check ok; forge-check pr pede parecer novo de review e QA (delta só em docs/api/metricas.md). DECISÃO TÉCNICA (Jarvis): review (E1.9) e QA (E1.10) regravam ao mesmo tempo citando a ponta nova; depois o merge do PR 216 (E1.11).
- 2026-11-04 16:41: E1.9 e E1.10 cumpridas: review regravado em 0f8bee3 e QA em 6cef210, os dois com commit: a54ac8d e aprovados; server 1625 e web 1427 verdes, docs:check ok. DECISÃO TÉCNICA (Jarvis): E1.11 com o tech-lead, merge do PR 216.
- 2026-11-04 17:03: E1.11 cumprida pelo tech-lead: PR 216 mesclado na develop por squash (head 6cef210947b65c6618c953d6b70481782030e226, checks verdes, forge-check pr limpo). Pedido 066 entregue na develop; vai à main na próxima release; falta a retrospectiva. Ação do dono depois do deploy: criterios-ac com a data do deploy.
- 2026-11-04 20:48: DECISÃO TÉCNICA (Jarvis): E1.12 com o agile-coach, retrospectiva do 066 com commit na branch do Jarvis (docs/jarvis-2026-10-23), sem push.
