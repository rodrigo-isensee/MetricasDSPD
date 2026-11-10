# Pedido 080: testes instáveis da web (K-173 e K-192)

- **Modo:** implementar
- **Objetivo:** tirar a instabilidade de dois testes da web que já derrubaram checks sem mudança de código: o teste do O20 que lê o SVG de forma síncrona (K-173) e o E2E L3-01 que falha no axe target-size do leia-junto do O15 (K-192)
- **Clareza:** 0 confirmado; 2 técnico; 1 suposição; 0 perguntas
- **Depende de:** —

## Escopo
- E1. K-173: o teste do O20 que lia o SVG de forma síncrona (operacionais.test.tsx:177 no 026; o arquivo mudou desde então) espera a renderização antes de ler; se o teste já não existir ou já estiver estável, registrar a evidência e fechar o cartão sem código · `técnico`
- E2. K-192: o E2E L3-01 (`e2e/tests/operacional-lote3.spec.ts`, axe target-size em `leia-junto-o15`) deixa de falhar de forma intermitente, corrigindo a causa achada (o teste mede o axe com a página ainda mudando de altura; DECISÃO TÉCNICA de 08:46), sem afrouxar a regra do axe, timeout ou retry · `técnico`

## Etapas
- E1.1 (react-frontend): implementação de E1 e E2 num lote só (mesmo papel, arquivos de teste da web e o alvo de toque).
- E1.2 (tech-lead): review.
- E1.3 (qa-engineer): QA.
- E1.4 (ux-designer): revisão de interface, só se o alvo de toque mudar a tela.
- E1.5 (tech-lead): PR para a develop, depois do QA.
- E1.6 (agile-coach): retrospectiva do pedido 080.

## Fora do escopo
- Desligar regra do axe, aumentar timeout ou acrescentar retry · `técnico`
- Outros testes instáveis (cartões K-174 e K-120) · `técnico`

## Suposições
- Os dois cartões ainda valem na develop atual (852b9406); o react-frontend confirma antes de mudar. Base: K-173 de 2026-10-28 e K-192 de 2026-10-31, sem registro de correção. Muda com: teste já corrigido por outro PR (o item fecha com a evidência). Custo de reverter: baixo.

## Perguntas na fila

## Histórico
- 2026-11-07 07:38: pedido aberto (Jarvis) pela autonomia de melhoria técnica do projeto (cartões K-173 e K-192, testes instáveis que derrubaram checks); não muda produto, não afrouxa portão, não custa dinheiro; sem recibo ao dono, aviso no resumo da manhã. Lote por arquivo: os dois são testes da web do mesmo papel. Sem gatilho de segurança. Worktree 056d (HEAD destacado em f21220fe, limpa), branch feature/080-testes-instaveis-web da develop 852b9406.
- 2026-11-07 07:40: Brief react-frontend-1 aprovado e delegado (056d).
- 2026-11-07 08:01: E1.1 entregue pelo react-frontend: feature/080-testes-instaveis-web em 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82, CI verde (run 42365672784); K-173 já resolvido (operacionais.test.tsx:169 espera a renderização; 20 rodadas sem falha), sem código; K-192 não reproduz (72 de 72 execuções; alvos já com 24 e 44 px), endurecimento com gap-y-1 em LeiaJunto.tsx (2+2 linhas); mudança de 4 px entre linhas quebradas: E1.4 (revisão de interface) se aplica.
- 2026-11-07 08:02: DECISÃO TÉCNICA (Jarvis): a E1.4 (revisão de interface) se aplica (gap-y-1 muda 4 px entre linhas quebradas); review e revisão de interface em paralelo; o parecer de interface fica na worktree sem commit e o tech-lead o leva ao PR (docs/ux/ não desatualiza os pareceres).
- 2026-11-07 08:03: Conferência da E1.1: cumpriu (o waitFor do O20 está na linha 176 hoje, não 169).
- 2026-11-07 08:03: entrega conferida 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82
- 2026-11-07 08:03: Revisão de interface (E1.4): aprovada, parecer em 056d/docs/ux/080-revisao-leia-junto.md (sem commit), regravado na forma (ux-designer-2); achado baixo: medir o alvo de 24 px a 1280 px fica com o QA.
- 2026-11-07 08:03: Brief tech-lead-1 (review) aprovado; sai quando o tech-lead terminar o PR do 077 6a.
- 2026-11-07 08:23: Review da E1.2: aprovado, parecer em 58b866d728b4e73815b29531156602d0998f3f3c (commit: 6b7b3f5e), enviado; A1 recomendado (gap-y-1 sem teste próprio).
- 2026-11-07 08:25: Conferência do review: cumpriu.
- 2026-11-07 08:25: entrega conferida 58b866d728b4e73815b29531156602d0998f3f3c
- 2026-11-07 08:26: DECISÃO TÉCNICA (Jarvis): neste pedido vale a regra de push da noite: push ou pre-push com mais de 15 minutos está preso; o agente para e relata, o Jarvis avisa o dono e refaz; 1 push por vez enquanto a regra da noite do dono valer.
- 2026-11-07 08:27: Brief qa-engineer-1 (QA) aprovado e delegado (056d).
- 2026-11-07 08:38: QA da E1.3: REPROVADO, parecer em 3c3a7aff4e540a55af5ea533cddab28abc0a2562 (commit: 6b7b3f5e), enviado; K-173 estável (5 de 5); K-192 reproduzido: E2E L3-01 falhou 2 de 9 a 1280 px (target-size em leia-junto-o15 li:nth-child(3) a) e 1 de 9 a 375 px por tempo; o gap-y-1 não resolve. A1 bloqueante (E2 não cumprida), A2 recomendado (timeout a 375 px sem causa). DECISÃO TÉCNICA (Jarvis): volta ao react-frontend para achar a causa pelo trace da falha antes de mudar CSS de novo; conferência da entrega do QA antes.
- 2026-11-07 08:40: Conferência do QA: cumpriu (a entrega do parecer reprovado).
- 2026-11-07 08:40: entrega conferida 3c3a7aff4e540a55af5ea533cddab28abc0a2562
- 2026-11-07 08:40: Brief react-frontend-2 (volta 1) aprovado e delegado (056d).
- 2026-11-07 08:46: Volta 1 parada pelo react-frontend sem código: causa achada. O L3-01 mede o axe com o scroll deixado pelo summary.click() numa página que ainda muda de altura (cartões saindo do esqueleto, ~58 px); conforme o reajuste, o link do O15 fica fora da tela (passa) ou com a parte de cima sob a barra sticky de filtros (só a partir de 768 px), e o axe desconta a área coberta (falha). O tamanho do link (24 px) está certo; o gap-y-1 não age na causa; A2 (375 px) não reproduziu em 10 rodadas. DECISÃO TÉCNICA (Jarvis), item técnico: a E2 se cumpre no teste, não na tela: o L3-01 espera os cartões saírem do esqueleto (altura estável) antes de abrir 'Mais métricas' e rodar o axe, sem mudar regra, timeout nem retry, e sem scroll ao topo (para não mudar o que o axe avalia); o gap-y-1 é revertido (não age na causa); prova com 20 rodadas a 1280 e a 375; a revisão de interface deixa de se aplicar se a tela voltar ao que era. MELHORIA (projeto): outros testes de axe de páginas longas com barra sticky podem ter o mesmo padrão (vai à retrospectiva).
- 2026-11-07 08:49: DECISÃO TÉCNICA (Jarvis): neste pedido vale o teto de 150 linhas de código e teste por entrega (M14 da fábrica), contado pela saída literal de git diff --numstat; o A2 do QA (375 px) sai do escopo desta volta, registrado sem mudança (não reproduziu em 10 rodadas).
- 2026-11-07 08:51: Briefs react-frontend-3 e -4 (volta 2) reprovados pelo conferente (forma: teto sem decisão, desde do PQ-4, rótulo da volta e marca de corte em achado que não é item de Escopo); corrigidos no -5.
- 2026-11-07 08:52: Brief react-frontend-5 (volta 2) aprovado na rodada 3 e delegado (056d).
- 2026-11-07 09:17: Volta 2 entregue pelo react-frontend (react-frontend-5): head 8784bf130f3290f5bfb6e0c9d30f8e20d1782605, CI verde (run 42370666658); esperarAlturaEstavel no L3-01 (nenhum metrica-* com aria-busy e scrollHeight igual em 5 amostras) antes e depois de abrir 'Mais métricas' e antes do axe; gap-y-1 revertido (LeiaJunto.tsx igual à base); 40 de 40 rodadas (20 a 1280, 20 a 375); 91 linhas. Com a tela de volta ao original, a E1.4 (revisão de interface) deixa de se aplicar; o parecer docs/ux/080-revisao-leia-junto.md (sem commit) não entra no PR.
- 2026-11-07 09:19: Brief tech-lead-2 (review da volta 2) aprovado; sai quando o tech-lead terminar o PR do 081.
- 2026-11-07 09:19: Conferência da volta 2: cumpriu (91 linhas).
- 2026-11-07 09:19: entrega conferida 8784bf130f3290f5bfb6e0c9d30f8e20d1782605
- 2026-11-07 10:07: Review da volta 2 delegado ao tech-lead (tech-lead-2).
- 2026-11-07 10:11: Review da volta 2 (tech-lead-2): aprovado, parecer em 64b2ed0c (commit: 8784bf13), enviado; helper espera por condição, gap-y-1 revertido, teto 25 pelo numstat base..ponta; A1 recomendado (outros axe em páginas longas com barra sticky, vai à retrospectiva).
- 2026-11-07 10:11: DECISÃO TÉCNICA (Jarvis): com o gap-y-1 revertido na volta 2 (LeiaJunto.tsx igual à base), a E1.4 (revisão de interface) deixou de se aplicar: a tela não muda; o parecer de interface sem commit (056d/docs/ux/080-revisao-leia-junto.md) não entra no PR. O K-173 (E1) fica com a evidência do QA anterior (5 de 5), sem código novo.
- 2026-11-07 10:12: Brief qa-engineer-2 (QA de novo) aprovado; sai depois da conferência do review da volta 2.
- 2026-11-07 10:13: Conferência do review da volta 2: cumpriu.
- 2026-11-07 10:13: entrega conferida 64b2ed0c6e47a0c5cecac1eabe214b24dc897ee7
- 2026-11-07 10:13: QA de novo delegado (qa-engineer-2).
- 2026-11-07 10:46: O agente do QA travou (sem progresso por 600 s, sem commit nem parecer na worktree); redisparado com o mesmo brief aprovado (qa-engineer-2).
- 2026-11-07 11:37: QA de novo (qa-engineer-2, retomada): aprovado, parecer em 88bae466f04eb090e32e10ca347ca1707c2b20c1 (commit: 8784bf13), enviado; L3-01 20 de 20 a 375 px e 17 de 20 a 1280 px (3 timeouts com carga 16 em 8 núcleos; série extra com carga 2: 10 de 10); target-size não voltou; A1 recomendado (timeout a 1280 px sob carga: observar a CI). Há um commit d0a19ce1 da tentativa travada por baixo do 88bae466.
- 2026-11-07 11:39: Conferência do QA de novo: PQ-1 a PQ-3 cumpriram; não cumpriu porque o parecer diz "Fora de escopo, conforme o brief: suíte inteira, vermelho antes do verde e mutação", e o brief não traz essa exclusão. DECISÃO TÉCNICA (Jarvis): volta ao qa-engineer só para regravar o parecer sem a atribuição falsa (dizendo o que rodou e o que não rodou, com o motivo); sai quando ele terminar o QA do 077.
- 2026-11-07 11:41: Brief qa-engineer-3 (volta do parecer) aprovado; sai quando o qa-engineer terminar o QA do 077.
- 2026-11-07 11:45: Volta do parecer delegada ao qa-engineer (qa-engineer-3).
- 2026-11-07 11:47: Volta do parecer de QA (qa-engineer-3): regravado por Write sem a atribuição falsa, f96d4b9228f08ed54438cde8d744796ca7a38edb, enviado; veredito e números iguais.
- 2026-11-07 11:48: Conferência da volta do parecer de QA: cumpriu; forge-check pr a conferir antes do brief do PR.
- 2026-11-07 11:48: entrega conferida f96d4b9228f08ed54438cde8d744796ca7a38edb
- 2026-11-07 11:51: Brief tech-lead-3 (PR para a develop, E1.5) aprovado e delegado.
- 2026-11-07 12:00: PR 265 (aberto pelo tech-lead, tech-lead-3) mesclado na develop pelo dono às 11:59 (squash ab423d02). Próximo: retrospectiva do 080 (E1.6).
- 2026-11-07 12:00: PR 265 aberto pelo tech-lead (tech-lead-3) e mesclado pelo dono (update-branch e merge às 11:59); o tech-lead parou no BEHIND sem merge, como o brief manda.
- 2026-11-07 12:04: Brief agile-coach-1 (retrospectiva, E1.6) aprovado e delegado (052e, docs/retros-2026-11-07).
- 2026-11-07 12:06: Retrospectiva (agile-coach-1): commitada em docs/retros-2026-11-07 (052e), faf03af55b5869af99b00c1113083a340cb0d5af, sem push; 5 linhas MELHORIA (1 projeto, 4 Forge).
- 2026-11-07 12:07: A branch docs/retros-2026-11-07 já tinha a retrospectiva do 081, conferida no pedido 081 às 11:51 (cumpriu): entrega conferida 434120f603ed2b30beb01e26e08fb72f05f472ac (cópia da linha do 081, para o Desde desta branch).
