# Pedido 083: pre-push com lint só nos arquivos alterados

- **Modo:** implementar
- **Objetivo:** o `.githooks/pre-push` deixa de rodar `eslint .` no repositório inteiro e passa a rodar o eslint só nos `.ts`/`.tsx` alterados contra a base, com cache, pulando o lint em push só de documentação; a CI segue rodando `eslint .` inteiro. Destrava os pushes dos agentes (diagnóstico E2.7 do pedido 077).
- **Clareza:** 1 confirmado; 3 técnico; 1 suposição; 0 perguntas
- **Depende de:** 077 (diagnóstico E2.7)

## Escopo
- E1. Pre-push com eslint só nos `.ts`/`.tsx` alterados contra a base (`git diff --name-only --diff-filter=d <base>...HEAD`), com `--cache --cache-location node_modules/.cache/eslint`, e sem lint quando o push não traz nenhum desses arquivos; a CI continua com `eslint .` inteiro · `confirmado`

## Etapas
- E1.1 (devops-engineer): implementação em `.githooks/pre-push` (e `package.json`, se precisar de script novo), com teste do hook se o projeto já testa scripts, e parecer de devops em docs/devops/.
- E1.2 (tech-lead): review.
- E1.3 (qa-engineer): QA (push com e sem `.ts` alterado; push só de docs; CI ainda com eslint inteiro).
- E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono.
- E1.5 (agile-coach): retrospectiva curta.
- E1.6 (security-engineer): parecer de segurança (o pre-push é controle local; o forge-check pr exige revisão de segurança).

## Fora do escopo
- Mudar o typecheck do pre-push · `técnico`
- Mudar a CI · `técnico`
- Mudar o guarda de lint do dono ou o ambiente (memória, antivírus) · `técnico`

## Suposições
- A base do diff do pre-push é `origin/develop` (o fluxo do projeto manda tudo para a develop). Base: CLAUDE.md, fluxo de branches. Muda com: branch que mira outra base. Custo de reverter: baixo.

## Perguntas na fila

## Histórico
- 2026-11-08 20:01: DECISÃO DO DONO (literal): "A" (aplicar a correção 1 do diagnóstico E2.7 do 077: pre-push com lint só nos .ts/.tsx alterados e cache, pulando push só de docs; a CI segue com eslint inteiro). Pedido aberto (Jarvis). Recibo: vou fazer: o devops-engineer muda o pre-push numa branch, com parecer de devops, review, QA e PR para a develop; não vou: mudar CI, typecheck, ambiente nem o guarda; o merge é do dono. DECISÃO TÉCNICA (Jarvis): branch melhoria/083-pre-push-lint na worktree 052e (livre: a integração foi descartada), a partir da develop 54f02c42; depois do merge, cada branch em curso recebe a develop e passa a usar o hook novo.
- 2026-11-08 20:02: Correção (Jarvis): a branch é feature/083-pre-push-lint (o fluxo do projeto é feature/* → develop), não melhoria/.
- 2026-11-08 20:02: DECISÃO DO DONO (2026-11-08 20:02): recibo confirmado: "A" (a opção A levada ao dono descrevia o que se faz: lint só nos arquivos alterados, com cache, CI com o lint inteiro, mudança numa branch com review e PR, merge do dono).
- 2026-11-08 20:03: Brief devops-engineer-1 (E1.1) aprovado e delegado (052e).
- 2026-11-08 20:04: E1.1 (devops-engineer-1) não cumprida: o hook R-CONFORMIDADE recusa edição de .githooks/ por agente ("arquivo em vigor; só o usuário altera; proponha o diff"). Feito sem commit na 052e (feature/083-pre-push-lint): scripts/lint-alterados.sh e scripts/lint-alterados.test.sh (5 de 6 casos passam; falha o caso com espaço no caminho). AÇÃO DO DONO: aplicar no .githooks/pre-push a troca de 'pnpm run lint' por 'bash scripts/lint-alterados.sh' (diff no relatório). Correção (Jarvis): a branch é feature/083-pre-push-lint (linha de correção já gravada). MELHORIA (Forge): o brief aprovado não previu que .githooks/ é do usuário.
- 2026-11-08 20:12: DECISÃO TÉCNICA (Jarvis): enquanto o dono não aplica a troca no .githooks/pre-push, o devops-engineer termina o que não toca .githooks/ (devops-engineer-2): corrige o caso de teste com espaço no caminho, registra o teste em package.json (test:trava), escreve o parecer de devops (com o diff do hook como pendência do dono) e faz o commit local, sem push (o push sai depois da troca do hook, já com o hook novo).
- 2026-11-08 20:14: Brief devops-engineer-2 (volta, sem .githooks/) aprovado e delegado (052e).
- 2026-11-08 20:15: Volta E1.1 (devops-engineer-2): commit local 7c1f6532 em feature/083-pre-push-lint (052e): scripts/lint-alterados.sh e .test.sh (6 de 6 casos; a falha era a ordem na asserção), package.json (test:trava), parecer de devops aprovado com a troca do hook como pendência do dono. Sem push. AÇÃO DO DONO: trocar a linha 13 do .githooks/pre-push (pnpm run lint → bash scripts/lint-alterados.sh) na 052e e commitar; depois o push sai com o hook novo.
- 2026-11-09 01:49: AÇÃO DO DONO cumprida (pelo assistente do app): linha 13 do .githooks/pre-push trocada para 'bash scripts/lint-alterados.sh && pnpm run typecheck', commit e19c23b3 na feature/083-pre-push-lint (052e), sem push. Próximo: push da 083 (com o hook novo), review, QA e PR.
- 2026-11-09 02:00: Push da 083 com o hook novo em ~30 s (e19c23b3; o hook imprimiu 'lint pulado'); CI run 42563929635 success. Próximo: conferência da entrega e review.
- 2026-11-09 02:02: Conferência da entrega do devops-engineer-2: não cumpriu só porque o intervalo inclui o commit e19c23b3 do dono em .githooks/pre-push (ação do dono registrada às 01:4x); o commit do agente (7c1f6532) está limpo. DECISÃO TÉCNICA (Jarvis): a entrega do agente se confere até 7c1f6532; o e19c23b3 é ação do dono, fora da conferência do agente, e entra no review.
- 2026-11-09 02:02: Brief tech-lead-1 (review, E1.2) aprovado e delegado (052e).
- 2026-11-09 02:04: Conferência da entrega do devops-engineer-2 (rodada 2): não cumpriu só pela linha 'união de briefs de entregas diferentes' do forge-check (mesma limitação do K-245); escopo dos 4 arquivos, PQ-2, base e pendente ok por leitura. DECISÃO TÉCNICA (Jarvis): não repito a conferência; o conteúdo do agente está conferido por leitura, e a conferida do head sai na conferência do review. MELHORIA: K-245 (forge-check entrega e branch com commit do dono).
- 2026-11-09 02:04: Review do 083 (tech-lead-1): aprovado, parecer em 2ae86c46 (commit: e19c23b3), enviado; A1 recomendado (regravar o parecer de devops com commit: e19c23b3 e a pendência do hook resolvida), A2 recomendado (git diff -z). Próximo: conferência do review e QA (E1.3).
- 2026-11-09 02:07: Conferência do review (tech-lead-1): cumpriu.
- 2026-11-09 02:07: entrega conferida 2ae86c465f87b8d2144f91c5784374a8ec0e1a01
- 2026-11-09 02:07: DECISÃO TÉCNICA (Jarvis): etapa E1.6 (security-engineer) acrescentada: o forge-check pr do 083 exige revisão de segurança (o pre-push é controle local). Corre em paralelo ao QA.
- 2026-11-09 02:10: Brief qa-engineer-1 (E1.3) aprovado e delegado (052e).
- 2026-11-09 02:11: Brief security-engineer-1 (E1.6) aprovado e delegado (052e), em paralelo ao QA.
- 2026-11-09 02:27: Segurança do 083 (security-engineer-1): aprovado, A1 (falta -- antes da lista) e A2 (-z) recomendados; commit local 12da35b5, push encerrado no corte de 15 min sem saída (o typecheck do pre-push segue inteiro; o QA rodava ao mesmo tempo). Push refeito depois que o QA terminar.
- 2026-11-09 02:28: QA do 083 (qa-engineer-1): aprovado, 0 bugs, parecer em d0d6c430 (commit: e19c23b3), enviado junto com o parecer de segurança 12da35b5; 5 cenários, 6 de 6 testes, 2 mutantes mortos; A1 e A2 recomendados.
- 2026-11-09 02:30: Conferência da segurança (security-engineer-1): cumpriu.
- 2026-11-09 02:30: entrega conferida d0d6c430cf9b122d298c060d2b96d35cf69fe1b3
- 2026-11-09 02:31: Brief tech-lead-2 (PR, E1.4) aprovado e delegado.
- 2026-11-09 02:32: Conferência do QA (qa-engineer-1, rodada 2): cumpriu (o aviso de 376 caracteres é a soma dos dois achados; cada um tem menos de 300).
- 2026-11-09 02:58: PR 268 aberto pelo tech-lead (tech-lead-2) e marcado como pronto; head d386a7a8 (merge da develop bc6a8518 feito pelo dono), checks verdes, forge-check pr aprovado. AÇÃO DO DONO: mesclar o PR 268.
- 2026-11-09 03:13: PR 268 mesclado pelo dono na develop (06:12Z). Falta a retrospectiva (E1.5).
- 2026-11-09 08:12: Pelo assistente do dono: PR 270 (feature/083b-typecheck-alterados, typecheck do pre-push só nos pacotes alterados, decisão do dono) aberto, checks rodando; PR 271 (Forge 0.42.0, .forge/versao) aberto, merge do dono. Os pushes de 8a, 4c e 3b estouraram 40 min no typecheck inteiro: esperam o PR 270 na develop. Nota: a worktree 052e (branch 083, já mesclada) tem arquivos em staging de outra operação (aparenta merge interrompido); não mexo.
- 2026-11-09 10:19: DECISÃO TÉCNICA (Jarvis): a retrospectiva (E1.5) sai numa branch nova docs/retros-2026-11-09 a partir da develop, na worktree 052h, junto com as do 079, 080, 081 e 082 (commits locais da docs/retros-2026-11-07, trazidos por cherry-pick); a worktree 052e fica como está (staging pendente de operação interrompida). O PR da branch é do tech-lead, em delegação própria.
- 2026-11-10 08:58: Retrospectiva (agile-coach-1) não cumprida: na 052h, o git switch -c docs/retros-2026-11-09 origin/develop criou a branch (8e2889ba) e levou índice e arquivos à develop, mas o HEAD ficou em feature/077-l4b-tela-janela-sust; o cherry-pick recusou e deixou o sequencer. Conferido pelo Jarvis: índice igual à origin/develop de então (git diff --cached vazio); ninguém mais usa a 052h; a 052e tem o mesmo sintoma.
- 2026-11-10 08:58: DECISÃO TÉCNICA (Jarvis): volta ao agile-coach (agile-coach-2) na 052h: git cherry-pick --quit (limpa o sequencer sem tocar no índice), conferir o índice igual a docs/retros-2026-11-09, git symbolic-ref HEAD refs/heads/docs/retros-2026-11-09, status vazio conferido; depois trazer a develop atual e seguir o -1.
- 2026-11-10 09:00: brief selado docs/briefs/083-pre-push-lint-alterados-agile-coach-2.md 477027c402e96fe4bfd9ba887ef665a0239d806b06a90d07a4e8bafa4b3639eb
- 2026-11-10 09:05: entrega conferida 6368d936ace89f9e93cb0bfc9b09365c300b8726
- 2026-11-10 09:05: Retrospectiva (agile-coach-2) conferida: branch docs/retros-2026-11-09 enviada com as retrospectivas do 079, 080, 081, 082 e 083 (4 linhas MELHORIA: no 083). Próximo: as MELHORIA: viram cartão ou decisão; PR da branch com o tech-lead.
- 2026-11-10 09:06: MELHORIAS da retrospectiva do 083: as duas de Forge viram os cartões K-252 (.githooks/ no brief) e K-253 (git switch -c que não troca o HEAD); as duas de projeto (duração no pre-push; guarda do dono não matar push) viram o K-251, decisão ao dono (.githooks/ e o guarda são do dono). PERGUNTA: (Jarvis) P-083-1 ao dono sobre o K-251.
- 2026-11-10 09:38: DECISÃO TÉCNICA (Jarvis): o forge-check pr 083-pre-push-lint-alterados --ref origin/docs/retros-2026-11-09 diz "classe T (só documentação)", "isento de QA" e que falta o parecer de review da branch. A E1.2 (review) vale também para a branch das retrospectivas antes do PR (E1.4): o tech-lead revisa a branch (tech-lead-3) e depois abre o PR (delegação própria).
- 2026-11-10 09:39: brief selado docs/briefs/083-pre-push-lint-alterados-tech-lead-3.md 49e9fca27f9df540a00c24565c7f7ec565388f03f885388d3167f0eb89b884ab
- 2026-11-10 09:42: entrega conferida bf913e4101cf258a5caa1d021c18038f3677ea21
- 2026-11-10 09:42: Review das retrospectivas (tech-lead-3) aprovado e conferido; A1 e A2 recomendados. Próximo: PR da branch docs/retros-2026-11-09 (tech-lead-4).
- 2026-11-10 09:42: O brief gerar do PR das retrospectivas recusou: o parecer de review da branch não tem registro de autoria do papel tech-lead na versão commitada (bf913e41; a gravada pela ferramenta Write é outra versão). DECISÃO TÉCNICA (Jarvis): volta ao tech-lead (tech-lead-5) só para regravar o parecer idêntico pela ferramenta Write, sem novo commit.
- 2026-11-10 09:44: brief selado docs/briefs/083-pre-push-lint-alterados-tech-lead-5.md 7553a21c87d86933b6371768d965513786506dc83a3af534408a6992e4e542e2
- 2026-11-10 09:46: brief selado docs/briefs/083-pre-push-lint-alterados-tech-lead-6.md 74a0cb496dbc16ff7bfff3af7c39d3a56cf41b1d481c81c419746cd99bdb1962
- 2026-11-10 10:09: PR 277 (retrospectivas 079 a 083) aberto e marcado como pronto (tech-lead-6, retomado depois do reinício), checks verdes, ato conferido (cumpriu). AÇÃO DO DONO: mesclar o PR 277.
