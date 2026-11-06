Agente destino: forge:qa-engineer
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-deps-patch   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: qa   Cobre: E3.3

## Objetivo
QA do item E8 do pedido 073 (K-232): o pnpm-lock.yaml sobe body-parser para 1.20.9, qs para 6.16.1 e ip-address para 10.7.4 (commit b9441f58), com parecer de segurança e review aprovados, na ponta 347106ef4402c38ec0c28aae9c6bb9b17ce386bc (pedido 073, E3.3, K-232). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/073-deps-patch`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f log --stat 8a789d43dd6227255e7f686728bcaaaaa1ed1797..HEAD` e os pareceres `docs/reviews/073-deps-patch.md` e `docs/security/073-deps-patch.md` na branch.

## Entregar
- "E3.3 (qa-engineer): QA por item." (E3.3)
- (E8) (E3.3) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/073-deps-patch` (a ponta é 347106ef4402c38ec0c28aae9c6bb9b17ce386bc, com o review 347106ef). Se o review ou o parecer de segurança não estiverem aprovados, pare e relate; rodar `pnpm install --frozen-lockfile` (rc=0), os testes dos pacotes e o vitest do server com no máximo 2 workers, `npx eslint .` e `pnpm run docs:check`; os 4 testes de entrada do server que lançam tsx em processo filho falham no sandbox (mkdir /tmp/tsx-1000 negado, limitação conhecida, decisão técnica das 19:42): registre-os como "prova na CI do PR", não como bug; parecer em `docs/qa/073-deps-patch.md` gravado inteiro pela ferramenta Write, com `pedido: 073-melhorias-tecnicas-2026-11-05`, `branch: feature/073-deps-patch`, `commit: b9441f58e669e954a50e965ea8c5023bf38e7ca5`, veredito e bloco `## Achados`; commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052f add docs/qa/073-deps-patch.md` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-232' -- docs/qa/073-deps-patch.md` (sem heredoc e sem pipe); envio da branch com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/073-deps-patch`; sem PR.
- (E1, E2, E3, E4, E5, E6, E7) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (linhas DECISÃO DO DONO copiadas literalmente do pedido; nenhuma muda esta entrega além do que está dito)
### DECISÃO DO DONO
- 2026-11-05 20:24: [SUSPENSA em 2026-11-05 20:31: a pergunta do Jarvis disse que nenhum dos dois alertas roda em produção; pela triagem o 27 roda no deploy, no CLI de migração; pergunta refeita ao dono] DECISÃO DO DONO: "A" (alertas 16 e 27 do Dependabot): aceitar o risco com prazo de revisão de 30 dias ou quando o pacote pai corrigir; o security-engineer registra a aceitação num parecer.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (P-0023-2): a ADR 0023 é vigente desde 2026-11-04, data do merge do PR 203 (4e755edd); as decisões do dono no 056 ("B") e no 060 ("A") mais esse merge contam como aceitação. O software-architect edita o estado da ADR pela proposta de docs/analises/073-adr-0023-estado.md, com review.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (próxima release): uma release só com a L9-c e o pedido 073, depois que os PRs do 073 estiverem na develop.
- 2026-11-05 20:34: DECISÃO DO DONO: "A" (alertas 16 e 27, pergunta refeita): aceitar o risco do 16 (zod via lighthouse, só teste) agora; o 27 (glob via node-pg-migrate, roda no deploy pelo CLI de migração) só depois de o security-engineer ler o advisory e confirmar que não se aplica ao uso do projeto (o glob lê só a pasta de migrações do repositório, sem entrada externa); confirmado, a aceitação do 27 entra no mesmo parecer, com revisão em 2026-12-05 ou quando o pacote pai corrigir; achado risco real, volta ao dono como pergunta nova.
- 2026-11-05 21:05: DECISÃO DO DONO: "A" (envio da branch antes do QA): a regra do CLAUDE.md ("nenhuma branch é enviada sem o parecer do QA") vale para o PR: nenhum PR para a develop sem o parecer do QA; a branch de trabalho pode ir ao GitHub antes. O tech-lead ajusta o texto do CLAUDE.md num PR de documentação. Com isso, o review do E8 (347106ef) é enviado e o QA do E8 segue.
- 2026-11-05 21:07: DECISÃO DO DONO: "A" (P-E3-1, natureza_prefixo, pelo "faça sua recomendação" do dono): a mudança de natureza_prefixo não para a coleta; fica registrada como versão de critério pelo ac:ref-sync e marcada nos gráficos (T2.6).
### ADRs citadas no pedido
- ADR 0023 (citada no pedido): vigente desde 2026-11-04 pela decisão do dono acima; nada nesta entrega além do que o Entregar diz
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023; nada nesta entrega
### Do Histórico deste pedido (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 19:42: E8 parado antes do push: commit local b9441f58 só no pnpm-lock.yaml (body-parser 1.20.9, qs 6.16.1, ip-address 10.7.4, nada mais); install frozen ok; pacotes verdes; server 1781 passam e 25 falham, todos nos 4 testes de entrada que lançam tsx em processo filho com env limpo (mkdir /tmp/tsx-1000 negado no sandbox, limitação já conhecida e registrada no brief do QA da 071); eslint e docs:check verdes. DECISÃO TÉCNICA (Jarvis): a falha é do ambiente do time e não da versão; o push segue e a CI do PR (suíte completa fora do sandbox) é a prova desses 4 arquivos antes de qualquer merge; o node-backend só faz o push. MELHORIA (técnica do projeto): os testes de entrada ignoram TMPDIR por usarem env limpo; passar TMPDIR adiante tiraria a dependência de /tmp (cartão).
- 2026-11-05 19:45: E8 enviado: feature/073-deps-patch em b9441f58 (só pnpm-lock.yaml: body-parser 1.20.9, qs 6.16.1, ip-address 10.7.4). DECISÃO TÉCNICA (Jarvis): parecer de segurança da dependência (security-engineer) e review (tech-lead) em paralelo, pareceres 073-deps-patch.md; QA depois do review, com os 4 testes de entrada provados na CI do PR.
- 2026-11-05 20:35: Review do E8 aprovado: docs/reviews/073-deps-patch.md em 347106ef, local, sem envio (commit: b9441f58); só as três versões subiram, package.json dispensado; A1 (recomendado): confirmar na CI do PR a instalação congelada, a varredura de dependências e os 4 testes de entrada do server. DECISÃO TÉCNICA (Jarvis): conferência da entrega e brief do QA do E8 em paralelo; o QA commita o parecer e envia a branch; o PR (E3.4) depois.
- 2026-11-05 21:05: DECISÃO DO DONO: "A" (envio da branch antes do QA): a regra do CLAUDE.md ("nenhuma branch é enviada sem o parecer do QA") vale para o PR: nenhum PR para a develop sem o parecer do QA; a branch de trabalho pode ir ao GitHub antes. O tech-lead ajusta o texto do CLAUDE.md num PR de documentação. Com isso, o review do E8 (347106ef) é enviado e o QA do E8 segue.
- 2026-11-05 21:07: envio do review do E8: o forge-check brief recusa o brief de envio com o head só na worktree e manda enviar antes; o Jarvis enviou feature/073-deps-patch em 347106ef (commit do tech-lead já conferido às 20:41), sem mudar nada.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers; MemAvailable acima de 3000 MB e load abaixo de 4 antes da suíte.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: o pnpm-lock.yaml, o package.json, os outros pareceres, código, testes, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho curto do E3 (K-224), só leitura, sem commit, antes da implementação." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por item." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por item, depois do QA." · etapa de outra delegação; continua no pedido
- "E6.1 (tech-lead): proposta, só leitura e sem commit, de como as releases entram no CHANGELOG pela §8 do fluxo-homologacao (seção por versão), com o texto das seções que faltam (releases 068 e 071) e o passo para a release combinada." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/073-deps-patch:docs/qa/073-deps-patch.md` · espera: contém 'commit: b9441f58e669e954a50e965ea8c5023bf38e7ca5'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
