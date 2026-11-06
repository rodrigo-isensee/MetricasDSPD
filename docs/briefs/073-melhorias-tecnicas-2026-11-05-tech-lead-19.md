Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E6.1

## Objetivo
Proposta de como as releases entram no CHANGELOG (pedido 073, E6.1, K-229): a §8 do fluxo-homologacao já define seção por versão, mas as releases 068 e 071 não ganharam seção e a [Não publicado] acumula itens já publicados. Leitura no checkout da develop em `/home/rodrigoisensee/MetricasDSPD-056d` (8a789d43, sem branch).

## Ler
- Em `/home/rodrigoisensee/MetricasDSPD-056d`: `CHANGELOG.md` inteiro (curto), `docs/engineering/fluxo-homologacao.md` §8 e as perguntas abertas dele sobre CHANGELOG, e `git -C /home/rodrigoisensee/MetricasDSPD-056d log --oneline --first-parent origin/main` só para achar os merges das releases 068 e 071 e as datas.

## Entregar
- "E6.1 (tech-lead): proposta, só leitura e sem commit, de como as releases entram no CHANGELOG pela §8 do fluxo-homologacao (seção por versão), com o texto das seções que faltam (releases 068 e 071) e o passo para a release combinada." (E6.1)
- (E6) (E6.1) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-changelog.md` pela ferramenta Write, sem commit: o número de versão de cada release já na main (068 e 071) pela §8, o texto das seções que faltam (o que sai da [Não publicado] para cada uma), o que fica na [Não publicado] (a L9-c e o 073), o passo para a release combinada (commit chore(release) na homolog, com versão) e o que da §8 continua pendente (ferramenta de geração, tag, job de release), sem decidir nada que a §8 deixa ao usuário. Até 60 linhas.
- (E1, E2, E3, E4, E5, E7, E8) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

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
- 2026-11-05 19:41: O E6 (K-229, CHANGELOG) fica parado: a conferência mostrou que o CHANGELOG da develop não tem seções por release (só [Não publicado] e [0.2.0]), então "tirar os itens da 068 da [Não publicado]" exige primeiro decidir como as releases entram no CHANGELOG (número de versão ou data). DECISÃO TÉCNICA (Jarvis): o tech-lead propõe essa prática junto com a próxima release; o brief tech-lead-5 não segue. O E7 ganha a etapa E7.1 do tech-lead (a cópia dos pareceres é trabalho dele, não implementação de código).
- 2026-11-05 21:00: DECISÃO TÉCNICA (Jarvis): o E6 sai da espera: a prática já está escrita na §8 do docs/engineering/fluxo-homologacao.md (CHANGELOG por versão vX.Y.Z, commit chore(release) na homolog), só não foi aplicada nas releases 068 e 071. O tech-lead propõe (E6.1), sem commit, em docs/analises/073-changelog.md, as seções que faltam e o passo da release combinada; a edição do CHANGELOG vem depois, na branch da release.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: o CHANGELOG.md, código, testes, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, qualquer worktree (só leitura) e qualquer branch; nada é commitado.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho curto do E3 (K-224), só leitura, sem commit, antes da implementação." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por item." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por item, depois do QA." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-changelog.md` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
