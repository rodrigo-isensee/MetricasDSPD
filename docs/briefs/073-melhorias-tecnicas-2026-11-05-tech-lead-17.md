Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/073-pareceres-faltantes   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: pr   Cobre: E3.4

## Objetivo
Abrir o PR do item E7 do pedido 073 (K-230) para a develop, na ponta 33242d82ccfc9d86f3dd8b66cd68c0d758045f40 (quatro pareceres antigos copiados sem mudança, review aprovado, isento de QA por ser só .md fora do controle), e enviar o review do E8 que ficou só na worktree 052f (pedido 073, E3.4, K-230 e K-232). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `docs/073-pareceres-faltantes`.

## Ler
- O parecer `docs/reviews/073-pareceres-faltantes.md` na branch (só o veredito e os achados).

## Entregar
- "E3.4 (tech-lead): PR por item, depois do QA." (E3.4)
- (E7) (E3.4) `forge-check pr 073-melhorias-tecnicas-2026-11-05 --ref origin/docs/073-pareceres-faltantes --base origin/develop` limpo antes de abrir; abrir o PR com `gh pr create --repo rodrigo-isensee/MetricasDSPD --base develop --head docs/073-pareceres-faltantes --title <título> --body-file <arquivo>`, corpo escrito pela ferramenta Write com o que muda, o review e o A1 dele (commit curto no cabeçalho de docs/reviews/011-back.md, mantido por ser cópia); esperar os checks por chamadas curtas com pausa (sem `--watch`); com todos verdes, `gh pr merge docs/073-pareceres-faltantes --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se um check falhar ou o sandbox ou a permissão negar o merge, pare e relate a mensagem literal (o merge do PR 240 já foi negado assim); sem promover para a homolog.
- (E8) (E3.4) Antes do PR, enviar o review do E8, que é seu: `git -C /home/rodrigoisensee/MetricasDSPD-052f log --oneline -1` deve mostrar 347106ef; então `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/073-deps-patch` (confira `git -C /home/rodrigoisensee/MetricasDSPD-052f branch --show-current`); nada mais na 052f, sem PR do E8.
- (E1, E2, E3, E4, E5, E6) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (linhas DECISÃO DO DONO copiadas literalmente do pedido; nenhuma muda esta entrega além do que está dito)
### DECISÃO DO DONO
- 2026-11-05 20:24: [SUSPENSA em 2026-11-05 20:31: a pergunta do Jarvis disse que nenhum dos dois alertas roda em produção; pela triagem o 27 roda no deploy, no CLI de migração; pergunta refeita ao dono] DECISÃO DO DONO: "A" (alertas 16 e 27 do Dependabot): aceitar o risco com prazo de revisão de 30 dias ou quando o pacote pai corrigir; o security-engineer registra a aceitação num parecer.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (P-0023-2): a ADR 0023 é vigente desde 2026-11-04, data do merge do PR 203 (4e755edd); as decisões do dono no 056 ("B") e no 060 ("A") mais esse merge contam como aceitação. O software-architect edita o estado da ADR pela proposta de docs/analises/073-adr-0023-estado.md, com review.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (próxima release): uma release só com a L9-c e o pedido 073, depois que os PRs do 073 estiverem na develop.
- 2026-11-05 20:34: DECISÃO DO DONO: "A" (alertas 16 e 27, pergunta refeita): aceitar o risco do 16 (zod via lighthouse, só teste) agora; o 27 (glob via node-pg-migrate, roda no deploy pelo CLI de migração) só depois de o security-engineer ler o advisory e confirmar que não se aplica ao uso do projeto (o glob lê só a pasta de migrações do repositório, sem entrada externa); confirmado, a aceitação do 27 entra no mesmo parecer, com revisão em 2026-12-05 ou quando o pacote pai corrigir; achado risco real, volta ao dono como pergunta nova.
### ADRs citadas no pedido
- ADR 0023 (citada no pedido): vigente desde 2026-11-04 pela decisão do dono acima; nada nesta entrega além do que o Entregar diz
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023; nada nesta entrega
### Do Histórico deste pedido (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 20:32: [SUBSTITUÍDA no envio do review do E8 pela linha do E7 isento de QA: o forge-check exige a branch enviada antes do brief do QA] DECISÃO TÉCNICA (Jarvis): a etapa E3.2 "review e PR por item" vira E3.2 (review) e E3.4 (PR, depois do QA), para o brief de review não cobrir o PR. O review do E8 commita o parecer na worktree sem enviar; o envio da branch vai junto com o parecer do QA (CLAUDE.md, Fluxo de uma demanda, item 4). MELHORIA (processo, ao agile-coach na retrospectiva): o CLAUDE.md diz que nenhuma branch é enviada sem o parecer do QA e o R-FLUXO manda o autor enviar a branch de trabalho; o E4 e o E7.1 enviaram antes do QA; alinhar o texto do CLAUDE.md com o dono.
- 2026-11-05 20:34: Review do E7.1 aprovado: docs/reviews/073-pareceres-faltantes.md em 33242d82 (commit: 2bb96c3e), blobs iguais às origens, docs:check ok; A1 (recomendado): docs/reviews/011-back.md traz commit curto no cabeçalho, mantido por ser cópia. DECISÃO TÉCNICA (Jarvis): conferência da entrega agora; o QA e o PR do E7 depois.
- 2026-11-05 20:35: Review do E8 aprovado: docs/reviews/073-deps-patch.md em 347106ef, local, sem envio (commit: b9441f58); só as três versões subiram, package.json dispensado; A1 (recomendado): confirmar na CI do PR a instalação congelada, a varredura de dependências e os 4 testes de entrada do server. DECISÃO TÉCNICA (Jarvis): conferência da entrega e brief do QA do E8 em paralelo; o QA commita o parecer e envia a branch; o PR (E3.4) depois.
- 2026-11-05 20:37: DECISÃO TÉCNICA (Jarvis): o E7 fica isento de QA (forge-check pr: diff só de .md fora do controle, R-QA; o review continua exigido e foi aprovado em 33242d82), e a linha anterior sobre o QA do E7 fica sem efeito; o PR do E7 (E3.4) segue agora. O QA do E8 pede a branch enviada antes do brief (forge-check brief: head só na worktree); o envio do review do E8 (347106ef) vai com o PR do E7 numa delegação só ao tech-lead, autor do review.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: os pareceres, código, testes, o pnpm-lock.yaml, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees além da 052d e do push da 052f, a `homolog` e a `main`; a develop só muda pelo merge do PR.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por item." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head docs/073-pareceres-faltantes --state all --json state` · espera: contém 'MERGED'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f ls-remote origin feature/073-deps-patch` · espera: contém '347106ef4402c38ec0c28aae9c6bb9b17ce386bc'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
