Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/073-pareceres-faltantes   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: review   Cobre: E3.2

## Objetivo
Code review do item E7 do pedido 073 (K-230): a branch traz à develop quatro pareceres que só existiam em branches antigas, copiados sem mudança de texto, na ponta 2bb96c3ed749fdc465ece610c12411e33cde3a91 (pedido 073, E3.2, K-230). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `docs/073-pareceres-faltantes`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d show --stat 2bb96c3ed749fdc465ece610c12411e33cde3a91` e a mensagem do commit, que cita os commits de origem; cada parecer só na parte que precisar para conferir o cabeçalho.

## Entregar
- "E3.2 (tech-lead): review e PR por item." (E3.2)
- (E7) (E3.2) Só a parte de review da E3.2; o PR do E7 é delegação posterior. `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin docs/073-pareceres-faltantes`; conferir que cada um dos 4 arquivos tem blob igual ao da origem citada na mensagem do commit (`git rev-parse <origem>:<arquivo>` contra `HEAD:<arquivo>`), que nada mais mudou e que `pnpm run docs:check` passa; parecer em `docs/reviews/073-pareceres-faltantes.md` gravado inteiro pela ferramenta Write, com `pedido: 073-melhorias-tecnicas-2026-11-05`, `branch: docs/073-pareceres-faltantes`, `commit: 2bb96c3ed749fdc465ece610c12411e33cde3a91`, veredito e bloco `## Achados`; commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052d add docs/reviews/073-pareceres-faltantes.md` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-230' -- docs/reviews/073-pareceres-faltantes.md` (sem heredoc e sem pipe); envio da branch de trabalho com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/docs/073-pareceres-faltantes` (decisão técnica das 20:28 abaixo); sem PR.
- (E1, E2, E3, E4, E5, E6, E8) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (linhas DECISÃO DO DONO copiadas literalmente do pedido; nenhuma muda esta entrega além do que está dito)
### DECISÃO DO DONO
- 2026-11-05 20:24: DECISÃO DO DONO: "A" (alertas 16 e 27 do Dependabot): aceitar o risco com prazo de revisão de 30 dias ou quando o pacote pai corrigir; o security-engineer registra a aceitação num parecer.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (P-0023-2): a ADR 0023 é vigente desde 2026-11-04, data do merge do PR 203 (4e755edd); as decisões do dono no 056 ("B") e no 060 ("A") mais esse merge contam como aceitação. O software-architect edita o estado da ADR pela proposta de docs/analises/073-adr-0023-estado.md, com review.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (próxima release): uma release só com a L9-c e o pedido 073, depois que os PRs do 073 estiverem na develop.
### ADRs citadas no pedido
- ADR 0023 (citada no pedido): vigente desde 2026-11-04 pela decisão do dono acima; nada nesta entrega além do que o Entregar diz
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023; nada nesta entrega
### Do Histórico deste pedido (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 19:43: DECISÃO TÉCNICA (Jarvis): E7.1 em dois passos: nesta delegação o tech-lead monta a branch docs/073-pareceres-faltantes e envia; o PR vem depois do review dela. Os dois arquivos do 011 já existem na develop em versão anterior (de f9fc3cd3, 2026-10-16); a revalidação de 2026-10-16 os substitui: docs/qa/011-back.md vem de 21fca162 e docs/reviews/011-back.md vem de 4d0539e8; os do 069 (069-zz2-l7a) são arquivos novos.
- 2026-11-05 20:26: E7.1 entregue pelo tech-lead: docs/073-pareceres-faltantes em 2bb96c3e (4 pareceres, blobs idênticos às origens; docs:check ok). DECISÃO TÉCNICA (Jarvis): conferência da entrega agora; review e PR depois.
- 2026-11-05 20:28: DECISÃO TÉCNICA (Jarvis): o review do E8 e o do E7.1 commitam o parecer na branch de trabalho e a enviam (R-FLUXO: o autor envia a branch de trabalho; foi assim no E4, review 5598410a); o "nenhuma branch é enviada sem o parecer do QA" do CLAUDE.md é o envio para a develop, pelo PR, que vem depois do QA. Os dois reviews cobrem só a parte de review da E3.2 (E8) e o review do E7.1; os PRs são delegações posteriores.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: os 4 pareceres copiados, código, testes, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/docs/073-pareceres-faltantes:docs/reviews/073-pareceres-faltantes.md` · espera: contém 'commit: 2bb96c3ed749fdc465ece610c12411e33cde3a91'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
