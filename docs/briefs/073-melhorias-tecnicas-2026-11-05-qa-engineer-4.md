Agente destino: forge:qa-engineer
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/073-adr-0023-claude   Base: develop   Base-sha: 898a888fde7115b784deb0948e982408602122df
Etapa: qa   Cobre: E3.3

## Objetivo
QA do item E2 do pedido 073 (K-227): ADR 0023 vigente desde 2026-11-04 e os dois pareceres de segurança do E1 copiados sem mudança de texto, com review aprovado, na ponta 90fc009702fa52451f9627616652af78829ddf3d (pedido 073, E3.3, K-227). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `docs/073-adr-0023-claude`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g log --stat 898a888fde7115b784deb0948e982408602122df..90fc009702fa52451f9627616652af78829ddf3d`, o parecer de review `docs/reviews/073-adr-0023-claude.md` na branch e a proposta `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-adr-0023-estado.md` (§3 e §4).

## Entregar
- "E3.3 (qa-engineer): QA por item." (E3.3)
- (E2) (E3.3) `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin docs/073-adr-0023-claude` (confira `git -C /home/rodrigoisensee/MetricasDSPD-052g branch --show-current`); se o review não estiver aprovado, pare e relate; conferir que os blobs de `docs/security/073-dependabot-triagem.md` e `docs/security/073-aceite-alertas-16-27.md` são iguais aos de 3478fcfc e d82ac9b7, que a ADR 0023 diz "vigente desde 2026-11-04" e segue a proposta (só cabeçalho, condição, Contexto, Consequências e Leituras; Decisão e Alternativas sem mudança), que nenhum outro arquivo mudou e rodar `pnpm run docs:check`; parecer em `docs/qa/073-adr-0023-claude.md` gravado inteiro pela ferramenta Write, com `pedido: 073-melhorias-tecnicas-2026-11-05`, `branch: docs/073-adr-0023-claude`, `commit: 9d0c1b990926180effef4e223ac23a533b8cde05`, veredito e bloco `## Achados` só com linhas de achado no formato (sem linha solta; o pre-push barra frase de regra copiada, cite só o ID, e achado com mais de 300 caracteres); commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052g add docs/qa/073-adr-0023-claude.md` e `git -C /home/rodrigoisensee/MetricasDSPD-052g commit -m <mensagem> -m 'Cartão: K-227' -- docs/qa/073-adr-0023-claude.md` (sem heredoc e sem pipe); envio com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/docs/073-adr-0023-claude`; sem PR.
- (E1, E3, E4, E5, E6, E7, E8) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (linhas DECISÃO DO DONO copiadas literalmente do pedido; nenhuma muda esta entrega além do que está dito)
### DECISÃO DO DONO
- 2026-11-05 20:24: [SUSPENSA em 2026-11-05 20:31: a pergunta do Jarvis disse que nenhum dos dois alertas roda em produção; pela triagem o 27 roda no deploy, no CLI de migração; pergunta refeita ao dono] DECISÃO DO DONO: "A" (alertas 16 e 27 do Dependabot): aceitar o risco com prazo de revisão de 30 dias ou quando o pacote pai corrigir; o security-engineer registra a aceitação num parecer.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (P-0023-2): a ADR 0023 é vigente desde 2026-11-04, data do merge do PR 203 (4e755edd); as decisões do dono no 056 ("B") e no 060 ("A") mais esse merge contam como aceitação. O software-architect edita o estado da ADR pela proposta de docs/analises/073-adr-0023-estado.md, com review.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (próxima release): uma release só com a L9-c e o pedido 073, depois que os PRs do 073 estiverem na develop.
- 2026-11-05 20:34: DECISÃO DO DONO: "A" (alertas 16 e 27, pergunta refeita): aceitar o risco do 16 (zod via lighthouse, só teste) agora; o 27 (glob via node-pg-migrate, roda no deploy pelo CLI de migração) só depois de o security-engineer ler o advisory e confirmar que não se aplica ao uso do projeto (o glob lê só a pasta de migrações do repositório, sem entrada externa); confirmado, a aceitação do 27 entra no mesmo parecer, com revisão em 2026-12-05 ou quando o pacote pai corrigir; achado risco real, volta ao dono como pergunta nova.
- 2026-11-05 21:05: [SEM EFEITO no ajuste do CLAUDE.md em 2026-11-05 21:17: o CLAUDE.md da develop já diz isso desde a decisão do dono de 2026-10-27 ("enviada" quer dizer o PR para a develop; o push da feature branch é liberado antes); só o checkout velho da branch do Jarvis não tinha o texto] DECISÃO DO DONO: "A" (envio da branch antes do QA): a regra do CLAUDE.md ("nenhuma branch é enviada sem o parecer do QA") vale para o PR: nenhum PR para a develop sem o parecer do QA; a branch de trabalho pode ir ao GitHub antes. O tech-lead ajusta o texto do CLAUDE.md num PR de documentação. Com isso, o review do E8 (347106ef) é enviado e o QA do E8 segue.
- 2026-11-05 21:07: DECISÃO DO DONO: "A" (P-E3-1, natureza_prefixo, pelo "faça sua recomendação" do dono): a mudança de natureza_prefixo não para a coleta; fica registrada como versão de critério pelo ac:ref-sync e marcada nos gráficos (T2.6).
- 2026-11-05 21:08: DECISÃO DO DONO: "A" (P-E3-2, equipe, organização ou tipo que entra no recorte): os chamados antigos entram junto com o reconhecimento: reconhecer uma mudança de recorte dispara a releitura completa do recorte (só leitura no Acelerato, carga só acrescenta versões).
### ADRs citadas no pedido
- ADR 0023 (citada no pedido): vigente desde 2026-11-04 pela decisão do dono acima; nada nesta entrega além do que o Entregar diz
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023; nada nesta entrega
### Do Histórico deste pedido (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 20:39: DECISÃO TÉCNICA (Jarvis): o E7 passa pelo QA (CLAUDE.md, Fluxo de uma demanda, item 4, acima da isenção do forge-check pr) antes do PR.
- 2026-11-06 08:28: E2.2 entregue pelo software-architect: ADR 0023 vigente desde 2026-11-04 gravada na worktree 052g sem commit (cabeçalho, condição para passar a vigente com o merge 4e755edd e a P-0023-2, Contexto, Consequências e linha nas Leituras datada 2026-11-06 E2.2); P-0023-3 continua pendente. Jarvis conferiu o diff (1 arquivo, +5 -3). DECISÃO TÉCNICA (Jarvis): o tech-lead revisa, commita o texto do arquiteto citando a autoria, grava o parecer de review da branch e envia.
### Restrições
- Esta branch só tem .md e o forge-check pr a acha isenta de QA (R-QA); pelo CLAUDE.md do projeto todo desenvolvimento passa pelo QA, e vale o CLAUDE.md.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: a ADR, os pareceres de segurança, o parecer de review, código, testes, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): branch de documentação a partir da develop com os dois pareceres de segurança do E1 trazidos da branch do Jarvis sem mudança de texto; base para a E2.2; o PR vem depois da E2.2, do review e do QA." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por item." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por item, depois do QA." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho curto do E3 (K-224), só leitura, sem commit, antes da implementação." · etapa de outra delegação; continua no pedido
- "E3.6 (security-engineer): parecer de segurança por item com gatilho (o E3 toca controle de coleta e banco)." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido
- "E6.1 (tech-lead): proposta, só leitura e sem commit, de como as releases entram no CHANGELOG pela §8 do fluxo-homologacao (seção por versão), com o texto das seções que faltam (releases 068 e 071) e o passo para a release combinada." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/docs/073-adr-0023-claude:docs/qa/073-adr-0023-claude.md` · espera: contém 'commit: 9d0c1b990926180effef4e223ac23a533b8cde05'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
