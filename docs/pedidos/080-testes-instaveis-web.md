# Pedido 080: testes instáveis da web (K-173 e K-192)

- **Modo:** implementar
- **Objetivo:** tirar a instabilidade de dois testes da web que já derrubaram checks sem mudança de código: o teste do O20 que lê o SVG de forma síncrona (K-173) e o E2E L3-01 que falha no axe target-size do leia-junto do O15 (K-192)
- **Clareza:** 0 confirmado; 2 técnico; 1 suposição; 0 perguntas
- **Depende de:** —

## Escopo
- E1. K-173: o teste do O20 que lia o SVG de forma síncrona (operacionais.test.tsx:177 no 026; o arquivo mudou desde então) espera a renderização antes de ler; se o teste já não existir ou já estiver estável, registrar a evidência e fechar o cartão sem código · `técnico`
- E2. K-192: o E2E L3-01 (`e2e/tests/operacional-lote3.spec.ts`, axe target-size em `leia-junto-o15`) deixa de falhar de forma intermitente, corrigindo o alvo de toque na tela (não afrouxando a regra do axe) · `técnico`

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
