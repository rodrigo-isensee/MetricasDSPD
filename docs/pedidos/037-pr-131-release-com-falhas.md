# Pedido 037: PR #131 (release homolog → main) com checks vermelhos

- **Data:** 2026-10-20
- **Origem:** usuário: "o pr 131 esta com problema, me ajude a resolver".
- **Modo:** implementar
- **Objetivo:** deixar o PR de release #131 com o portão verde para o dono mesclar na main.
- **Clareza:** recibo enviado, aguardando; 1 pergunta (rodar de novo os jobs que falharam).

## Diagnóstico (2026-10-20)
- O #131 (aberto pelo dono, homolog → main, a92807b) leva só #124, #126, #127, #130 e o merge do #128.
- `qualidade`: 1 de 1078 testes do web falhou na CI: `leiajunto.test.tsx` "T5 leva ao O14 no painel Operacional" (7,8 s). Localmente, na develop 12018de (mesmas dependências), os 1078 passaram (forge:react-frontend, pedido 036): indica instabilidade, não regressão.
- `perf-homolog`: C6 em /operacional 227 ms e 200 ms no retry, limite 200 ms (ADR 0003); já conhecido (K-113, 188 a 215 ms).
- `homolog-aprovada`: consequência das duas acima.

## Escopo
- E2. Tirar o C6 do limite com o Web Worker da ADR 0021, sem afrouxar o orçamento (proposta 037, alternativa A). · `confirmado` (decisão do dono, 2026-10-20)
- E1. Separar instabilidade de regressão no T5 (leiajunto) e no C6 (/operacional) e, se for regressão, corrigir pelo fluxo feature → develop → homolog. · `suposição` (recibo pendente)

## Etapas
- E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.
- E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado.
- E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).
- E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.
- E2.1 (forge:qa-engineer): sonda S0 da proposta 037 (C6 do perf-api em /operacional, /operacional?cadencia=diaria e /, e dois perfis do Chromium com pilha), registrada no arquivo do bug C6.
- E2.2 (forge:react-frontend): implementar a ADR 0021 (núcleo puro e Worker), depois do veredito da S0.
- E2.3 (forge:qa-engineer): paridade E2E, C5 com o heap do Worker e medição do pronto (mediana < 150 ms nas 7 rotas).
- E2.4 (forge:tech-lead): review, PR para a develop e promoção para a homolog (com os pareceres de review e QA da promoção), deixando o portão verde no PR de release #136. Dividida em:
- E2.3b (forge:qa-engineer): atualizar o frontmatter do parecer de QA para o head testado (9ee640f), com D1 e D2 como pendências pela decisão do dono de 2026-10-21.
- E2.2b (forge:react-frontend): corrigir o W037-001 (101 E2E vermelhos com o Worker) sem afrouxar teste nem limite.
- E2.3c (forge:qa-engineer): verificar se os 101 E2E vermelhos do PR #137 também falham na develop (794b982), com porta própria (`E2E_PORTA`) e sem preview de outra worktree; registrar no parecer de QA se são regressão do Worker ou defeito antigo.
- E2.4a (forge:tech-lead): code review da branch (inclusive o que o QA acrescentar), parecer em docs com o commit do head.
- E2.4b (forge:tech-lead): PR para a develop (squash), com D1 e D2 listados como pendências, e merge com os checks verdes; limpeza da branch e da worktree -037 depois do merge.
- E2.5b (forge:tech-lead): no PR de documentação do Jarvis (branch `docs/jarvis-2026-10-20-noite`) para a develop, corrigir a linha 57 do parecer `docs/reviews/037-c6-operacional.md` (achado da conferência de 2026-10-22 15:02), revisar o diff só de documentação, abrir o PR e mesclar.
- E2.5c (forge:qa-engineer): parecer de QA só de documentação (`docs:check`) da branch do Jarvis, antes do merge do E2.5b.
- E2.6 (forge:qa-engineer): parecer de QA da promoção develop → homolog.
- E2.7 (forge:tech-lead): parecer de review da promoção, PR develop → homolog (merge commit) e merge com o portão disparado.
- E2.5 (dono): mesclar o #136 (homolog → main) com o homolog-aprovada verde. Feito pelo dono em 2026-10-21 13:10 (merge 17fee18), antes do 037 entrar: a correção do C6 vai na próxima release (E2.8).
- E2.8 (forge:tech-lead): abrir o PR de release homolog → main com o Worker do 037, depois do E2.7, para o dono validar e mesclar.
- E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação).

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136.
DECISÃO DO DONO (2026-10-22): "Vou dormir toque tudo que puder" (ordem ampla: só o que já está confirmado ou delegado segue, R-DECISAO "Complemento"; aqui, E2.6 a E2.8, a promoção com o 025 e o PR de release para o dono validar).

## Fora do escopo
- Mudar o limite de 200 ms da ADR 0003, desligar check, mexer no #131 ou na main.

## Andamento
- 2026-10-20 — Recibo e pergunta enviados ao usuário (rodar de novo os jobs: A agora; B esperar o diagnóstico local). Recomendação: A.
- PERGUNTA: 2026-10-20 · rodar de novo os jobs que falharam no #131
- 2026-10-20 — Usuário: "A". Rodar de novo os jobs que falharam (decisão gravada).
- 2026-10-20 — E1.4 (devops): rodada única. `qualidade` passou (T5 = instabilidade). `perf-homolog` falhou de novo: C6 em /operacional 225 ms e 208 ms no retry (limite 200 ms, ADR 0003); `homolog-aprovada` falhou por consequência. O #131 segue bloqueado só pelo C6. Hipótese a medir: o #130 subiu o @playwright/test para 1.64.1 (navegador novo), o que pode ter mudado a medição. Recibo do E1.2 em diante ainda não confirmado pelo dono.
- 2026-10-20 — Conferência da entrega do E1.4: "não cumpriu" por falhas do brief do Jarvis (PQ-3 com campo inexistente no gh; Base-sha da main não é ancestral da homolog). O trabalho foi feito e confirmado pelo gh: não é retrabalho do autor.
- 2026-10-20 — Usuário: "A" (medir antes). Recibo do E1.2 confirmado por essa resposta.
- 2026-10-20 — E1.2 (QA): o @playwright/test 1.64.1 NÃO explica o C6 (Chromium e playwright-core iguais nos dois lados). Local: main mediana 194 ms (uma de 211), develop 180 ms; a CI, mais lenta, passa de 200. O C6 de /operacional vive no limite (K-113). Registro em 1f715e8 (feature/037-c6-operacional), conferido.
- ESCOPO+: 2026-10-20 · E2 (Web Worker da ADR 0021) entra por decisão do dono ("A"), depois da proposta do software-architect (E1.5: causa = geração da base de exemplo na thread principal, 198 a 240 ms na CI em todas as rotas; recomendação A).
- 2026-10-20 22:50 — E2.1 (QA, sonda S0, eeb59fa): pior caso do C6 em /operacional de 113 ms (< 120), com p85 de 135 e máximo de 182, sob load de 2,15 a 4,96. A maior tarefa é a geração do mock na thread principal (gerarMock), e o render do React é a segunda (71 a 113 ms). Veredito pela condição de parada: Worker sem o render fatiado. Achado extra: /tatico com CLS 0,103 numa execução (F2 < 0,1), que vai para a medição do E2.3. Conferida (eeb59fa, rodada 2; a rodada 1 falhou por erro do Jarvis na etapa).

- 2026-10-21 — Conferência da entrega 0bde5eb: não cumpriu só por escopo (`docs/tecnica/arquitetura-front.md`, `eslint.config.js`, `web/vite.config.ts` fora do Entregar). Decisão técnica do Jarvis (`técnico`, base: ADR 0021 exige o Worker em módulo ES, que pede `worker: { format: 'es' }` no Vite e as globais do Worker no ESLint; o diagrama de sequência é documentação afetada, exigida pelo checklist do code review): os três arquivos fazem parte do E2. Brief 2 só formaliza, sem mudança de código.

- 2026-10-21 — Decisão técnica do Jarvis (`técnico`, base: R-VERIFY proíbe reescrever história com `--force`, e o PR para a develop é por squash, que junta os dois): o parecer de review do 037 em dois commits (51ba511 e d549417, o segundo só encurta achados para o `forge-check docs`) é aceito no lugar de "um commit só do parecer"; o conteúdo do parecer não muda. Vale só para esses dois commits: atualizações seguintes do parecer seguem "um commit só".

- 2026-10-21 18:45 — PR #137 aberto; o check `e2e` da CI falhou com 101 testes (97 em `intensivo-filtros.spec.ts`, 2 em `b12-fluxo`, 1 em `intensivo-filtros-bordas`, 1 em `filtros`). Achado do QA do 025: com porta própria, esses testes passam numa branch sem o Worker; a medição "falha igual na develop" do QA do 037 pode ter usado o preview da worktree -037 (porta 4173, `reuseExistingServer`). Então o D1 pode ser regressão do Worker, e não defeito antigo: a premissa da decisão do dono sobre D1 ("já existentes na develop") está em verificação. Sem merge com check vermelho. E2.3c aberta.

- 2026-10-21 19:30 — E2.3c (2688e85): regressão do Worker confirmada. Com porta própria, develop 794b982: 213/216 (3 instáveis, D2); head 85d1896: 115/216 (101 falham). O "D1" era artefato do `reuseExistingServer` na 4173 servindo o build do Worker. Bug W037-001 (alto, bloqueante), responsável react-frontend. A premissa da decisão do dono sobre D1 ("já existentes na develop") era falsa: o D1 sai das pendências e vira defeito desta entrega (W037-001); D2 continua pendência. Parecer de QA reprovado. E2.2b aberta.

- 2026-10-21 — Decisão técnica do Jarvis (`técnico`, base: o passo Mermaid do job `e2e` da CI falhava com os `;` do diagrama): a correção de sintaxe do diagrama em `docs/tecnica/arquitetura-front.md` feita pelo tech-lead no PR #137 (3ffed20, 3230067, 85d1896) faz parte do E2 (documentação afetada pela entrega, já coberta pela decisão técnica de 0bde5eb). E a mudança de `ROTAS_APLIC` em `e2e/tests/intensivo-filtros.spec.ts` não é desta entrega: veio da develop (568ea48, PR #133, pedido 036) pelo merge 04e529f.

- 2026-10-22 — O dono mesclou o #136 (homolog → main) em 2026-10-21 13:10 (merge 17fee18), antes do 037. A decisão "esperar o 037" ficou superada pelo ato do dono. A `main` está sem o Worker. O escopo do 037 não muda: a correção do C6 sobe numa próxima release (E2.8). Isso é registro, não pergunta: o ato foi do dono e não altera o que o time entrega.
- 2026-10-22 — Decisão técnica do Jarvis (`técnico`, base: tabela de etapas do conferente, linha "Qualquer etapa": o PR #137 foi criado em 2026-10-21 20:45Z, antes dos pareceres de review 7700366 e de QA 47c3e66). O #137 é fechado sem merge, e um PR novo da mesma branch é aberto depois do commit da correção do parecer de review. A CI desse commit roda de qualquer jeito, então o custo extra é próximo de zero e nenhum controle é afrouxado. Brief tech-lead-7.
- 2026-10-22 15:02 — Conferência da entrega do tech-lead-7: não cumpriu, mérito parcial. Os PQ-1 a 5 e 7 a 9 cumpriram: #139 mesclado (squash 2bb9f68), `e2e` verde, #137 fechado e branch e worktree apagadas. O K-131 fecha porque a condição do D1 foi cumprida. Decisões técnicas do Jarvis (`técnico`): (1) o PQ-6 é falso positivo, porque a develop andou com o #138 (306cf6e, pai 2bb9f68); (2) o escopo "fora" também é falso positivo, porque o squash leva a branch inteira, com as etapas E2.2, E2.2b e E2.3 já conferidas. (3) Procedente: o primeiro período da linha 57 do parecer de review ("Já existem na develop; não são regressão deste diff") contradiz o E2.3c, que identificou o D1 como regressão do Worker. A correção entra no parecer de review da promoção (E2.7), que o tech-lead grava de qualquer jeito. Um PR só de documentação custaria uma rodada inteira de CI.

## Histórico
- 2026-10-20 22:31: entrega conferida 1f715e8d888f67befb2a6b45f0585422332de26f
- 2026-10-20 22:54: entrega conferida eeb59fa202c2b1583c1dedd18c14a8b6676616f3
- 2026-10-21 13:42: entrega conferida 0bde5eb4200993311881d1d6207d2ea6f80fb70e
- 2026-10-21 14:10: entrega conferida d54941763ff6dcb3a87f5bff96fda7d6f45795e3
- 2026-10-21 17:10: entrega conferida fd3f8519cf7594091204ce5ac8ad4f41b6273c39
- 2026-10-21 19:50: entrega conferida 35bfd72ab8d4a66fd4237000e6e83c3619a17bf4
