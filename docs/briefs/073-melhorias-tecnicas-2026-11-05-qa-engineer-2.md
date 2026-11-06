Agente destino: forge:qa-engineer
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/073-pareceres-faltantes   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: qa   Cobre: E3.3

## Objetivo
QA do item E7 do pedido 073 (K-230): quatro pareceres antigos copiados sem mudança de texto para a branch de documentação, com review aprovado, na ponta 33242d82ccfc9d86f3dd8b66cd68c0d758045f40 (pedido 073, E3.3, K-230). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `docs/073-pareceres-faltantes`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d log --stat 8a789d43dd6227255e7f686728bcaaaaa1ed1797..33242d82ccfc9d86f3dd8b66cd68c0d758045f40` e o parecer de review `docs/reviews/073-pareceres-faltantes.md` na branch.

## Entregar
- "E3.3 (qa-engineer): QA por item." (E3.3)
- (E7) (E3.3) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin docs/073-pareceres-faltantes`; se o review não estiver aprovado, pare e relate; conferir os blobs dos 4 arquivos contra as origens citadas na mensagem de 2bb96c3e, que nenhum arquivo além deles e do parecer de review mudou, e rodar `pnpm run docs:check`; parecer em `docs/qa/073-pareceres-faltantes.md` gravado inteiro pela ferramenta Write, com `pedido: 073-melhorias-tecnicas-2026-11-05`, `branch: docs/073-pareceres-faltantes`, `commit: 2bb96c3ed749fdc465ece610c12411e33cde3a91`, veredito e bloco `## Achados`; commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052d add docs/qa/073-pareceres-faltantes.md` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-230' -- docs/qa/073-pareceres-faltantes.md` (sem heredoc e sem pipe); envio com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/docs/073-pareceres-faltantes`; sem PR.
- (E1, E2, E3, E4, E5, E6, E8) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

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
- 2026-11-05 20:26: E7.1 entregue pelo tech-lead: docs/073-pareceres-faltantes em 2bb96c3e (4 pareceres, blobs idênticos às origens; docs:check ok). DECISÃO TÉCNICA (Jarvis): conferência da entrega agora; review e PR depois.
- 2026-11-05 20:34: Review do E7.1 aprovado: docs/reviews/073-pareceres-faltantes.md em 33242d82 (commit: 2bb96c3e), blobs iguais às origens, docs:check ok; A1 (recomendado): docs/reviews/011-back.md traz commit curto no cabeçalho, mantido por ser cópia. DECISÃO TÉCNICA (Jarvis): conferência da entrega agora; o QA e o PR do E7 depois.
- 2026-11-05 20:36: DECISÃO TÉCNICA (Jarvis): QA do E7 (só documentação copiada: blobs, docs:check e cabeçalhos) e QA do E8 (instalação congelada, testes dos pacotes e do server, com os 4 testes de entrada provados depois na CI do PR) em paralelo, cada um commitando o parecer e enviando a branch (CLAUDE.md item 4: o envio vai com o parecer do QA); os PRs (E3.4) depois.
- 2026-11-05 20:39: DECISÃO TÉCNICA (Jarvis): o E7 passa pelo QA (CLAUDE.md, Fluxo de uma demanda, item 4, acima da isenção do forge-check pr) antes do PR. PERGUNTA (ao dono): o CLAUDE.md diz "nenhuma branch é enviada sem o parecer do QA", e o Forge manda o autor enviar a branch de trabalho e exige a branch enviada antes do brief do QA; o E4, o E7 e o E8 já foram enviados assim. Ler a regra como "nenhum PR para a develop sem o parecer do QA" ou manter a leitura literal? O envio do review do E8 (347106ef) e o QA do E8 esperam a resposta.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers; MemAvailable acima de 3000 MB e load abaixo de 4 antes da suíte.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: os 4 pareceres copiados, o parecer de review, código, testes, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por item." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por item, depois do QA." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/docs/073-pareceres-faltantes:docs/qa/073-pareceres-faltantes.md` · espera: contém 'commit: 2bb96c3ed749fdc465ece610c12411e33cde3a91'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
