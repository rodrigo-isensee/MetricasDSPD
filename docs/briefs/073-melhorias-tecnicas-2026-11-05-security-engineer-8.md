Agente destino: forge:security-engineer
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: d8754a08978ecd18fc14bb0e80120b3c3a7845b7
Etapa: seguranca   Cobre: E1.2

## Objetivo
Registrar num parecer a aceitação de risco dos alertas 16 e 27 do Dependabot pela decisão do dono "A" (pergunta refeita), lendo antes o advisory do 27 (pedido 073, E1.2, K-228), ao lado da sua triagem, na branch do Jarvis `docs/jarvis-2026-10-23` (diretório `/home/rodrigoisensee/Metricas/MetricasDSPD`), onde está a triagem (3478fcfc).

## Ler
- `docs/security/073-dependabot-triagem.md` (só as linhas dos alertas 16 e 27 e o achado A4), a linha DECISÃO DO DONO da pergunta refeita abaixo e o advisory do alerta 27 pela API do GitHub, só leitura (`gh api repos/rodrigo-isensee/MetricasDSPD/dependabot/alerts/27` e o GHSA que ele cita, com github.com e api.github.com em allowed_domains).

## Entregar
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." (E1.2)
- (E1) (E1.2) Parecer `docs/security/073-aceite-alertas-16-27.md` gravado inteiro pela ferramenta Write, sempre com a aceitação do 16 (zod 3.25 via lighthouse, só teste): pedido, alerta, por que o risco é aceitável, decisão do dono com a data, revisão em 2026-12-05 ou quando o pacote pai corrigir, e o gatilho que reabre (uso fora do teste). Para o 27 (glob 13.0.6 via node-pg-migrate, roda no deploy pelo CLI de migração), leia antes o advisory e decida se a falha alcança o uso do projeto (o node-pg-migrate usa o glob só para listar a pasta de migrações do repositório, sem entrada externa): se não alcança, a aceitação do 27 entra no mesmo parecer, com o que o advisory diz, a mesma revisão e o gatilho que reabre (glob recebendo caminho de fora do repositório); se alcança, ou se não der para ler o advisory, o parecer registra o 27 como "não aceito, volta ao dono" com o motivo, e você relata. Sem dado de pessoa. Commit só desse arquivo com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD add docs/security/073-aceite-alertas-16-27.md` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD commit -m <mensagem> -m 'Cartão: K-228' -- docs/security/073-aceite-alertas-16-27.md`; envio com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD push origin HEAD:refs/heads/docs/jarvis-2026-10-23` (confira `git branch --show-current`); outros arquivos modificados nesse diretório são do Jarvis e não entram no commit.
- (E2, E3, E4, E5, E6, E7, E8) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

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
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outros arquivos do diretório (o quadro, os pedidos, os briefs e docs/kanban são do Jarvis), código, a triagem já commitada, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por item." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por item, depois do QA." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/docs/jarvis-2026-10-23:docs/security/073-aceite-alertas-16-27.md` · espera: contém '2026-12-05'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
