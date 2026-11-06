Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-deps-patch   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: review   Cobre: E3.2

## Objetivo
Code review do item E8 do pedido 073 (K-232): só o pnpm-lock.yaml muda, subindo body-parser para 1.20.9, qs para 6.16.1 e ip-address para 10.7.4 (alertas 17, 26 e 13 da triagem), na ponta b9441f58e669e954a50e965ea8c5023bf38e7ca5 (pedido 073, E3.2, K-232). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/073-deps-patch`. A branch já tem também o parecer de segurança (e49e6a3c, E8.1, aprovado).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff 8a789d43dd6227255e7f686728bcaaaaa1ed1797...b9441f58e669e954a50e965ea8c5023bf38e7ca5` (só o lock), o parecer de segurança `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/073-deps-patch:docs/security/073-deps-patch.md` e a triagem `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/docs/jarvis-2026-10-23:docs/security/073-dependabot-triagem.md`.

## Entregar
- "E3.2 (tech-lead): review e PR por item." (E3.2)
- (E8) (E3.2) Só a parte de review da E3.2; o PR do E8 é delegação posterior, depois do QA. `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/073-deps-patch`; revisar se só as três versões subiram, se nada mais mudou no lock, se as versões corrigem os alertas da triagem e se a mudança dispensa package.json; parecer em `docs/reviews/073-deps-patch.md` gravado inteiro pela ferramenta Write, com `pedido: 073-melhorias-tecnicas-2026-11-05`, `branch: feature/073-deps-patch`, `commit: b9441f58e669e954a50e965ea8c5023bf38e7ca5`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052f add docs/reviews/073-deps-patch.md` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-232' -- docs/reviews/073-deps-patch.md` (sem heredoc e sem pipe); envio da branch de trabalho com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/073-deps-patch` (decisão técnica das 20:28 abaixo); sem PR.
- (E1, E2, E3, E4, E5, E6, E7) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (linhas DECISÃO DO DONO copiadas literalmente do pedido; nenhuma muda esta entrega além do que está dito)
### DECISÃO DO DONO
- 2026-11-05 20:24: DECISÃO DO DONO: "A" (alertas 16 e 27 do Dependabot): aceitar o risco com prazo de revisão de 30 dias ou quando o pacote pai corrigir; o security-engineer registra a aceitação num parecer.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (P-0023-2): a ADR 0023 é vigente desde 2026-11-04, data do merge do PR 203 (4e755edd); as decisões do dono no 056 ("B") e no 060 ("A") mais esse merge contam como aceitação. O software-architect edita o estado da ADR pela proposta de docs/analises/073-adr-0023-estado.md, com review.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (próxima release): uma release só com a L9-c e o pedido 073, depois que os PRs do 073 estiverem na develop.
### ADRs citadas no pedido
- ADR 0023 (citada no pedido): vigente desde 2026-11-04 pela decisão do dono acima; nada nesta entrega além do que o Entregar diz
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023; nada nesta entrega
### Do Histórico deste pedido (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:24: DECISÃO TÉCNICA (Jarvis): o E8 começa em paralelo ao E4, com outro node-backend na worktree 052f (livre: a docs/071-release já está na develop pelo PR 235), branch feature/073-deps-patch; depende só da triagem, já pronta; pede parecer de segurança da dependência antes do PR.
- 2026-11-05 19:42: E8 parado antes do push: commit local b9441f58 só no pnpm-lock.yaml (body-parser 1.20.9, qs 6.16.1, ip-address 10.7.4, nada mais); install frozen ok; pacotes verdes; server 1781 passam e 25 falham, todos nos 4 testes de entrada que lançam tsx em processo filho com env limpo (mkdir /tmp/tsx-1000 negado no sandbox, limitação já conhecida e registrada no brief do QA da 071); eslint e docs:check verdes. DECISÃO TÉCNICA (Jarvis): a falha é do ambiente do time e não da versão; o push segue e a CI do PR (suíte completa fora do sandbox) é a prova desses 4 arquivos antes de qualquer merge; o node-backend só faz o push. MELHORIA (técnica do projeto): os testes de entrada ignoram TMPDIR por usarem env limpo; passar TMPDIR adiante tiraria a dependência de /tmp (cartão).
- 2026-11-05 19:45: E8 enviado: feature/073-deps-patch em b9441f58 (só pnpm-lock.yaml: body-parser 1.20.9, qs 6.16.1, ip-address 10.7.4). DECISÃO TÉCNICA (Jarvis): parecer de segurança da dependência (security-engineer) e review (tech-lead) em paralelo, pareceres 073-deps-patch.md; QA depois do review, com os 4 testes de entrada provados na CI do PR.
- 2026-11-05 20:28: DECISÃO TÉCNICA (Jarvis): o review do E8 e o do E7.1 commitam o parecer na branch de trabalho e a enviam (R-FLUXO: o autor envia a branch de trabalho; foi assim no E4, review 5598410a); o "nenhuma branch é enviada sem o parecer do QA" do CLAUDE.md é o envio para a develop, pelo PR, que vem depois do QA. Os dois reviews cobrem só a parte de review da E3.2 (E8) e o review do E7.1; os PRs são delegações posteriores.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, o pnpm-lock.yaml, os outros pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/073-deps-patch:docs/reviews/073-deps-patch.md` · espera: contém 'commit: b9441f58e669e954a50e965ea8c5023bf38e7ca5'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
