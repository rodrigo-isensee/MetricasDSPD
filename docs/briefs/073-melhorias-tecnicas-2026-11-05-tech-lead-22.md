Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/073-adr-0023-claude   Base: develop   Base-sha: 898a888fde7115b784deb0948e982408602122df
Etapa: codigo   Cobre: E2.3

## Objetivo
Montar a branch de documentação do pedido 073 (E2.3, K-227 e K-228) trazendo da branch do Jarvis os dois pareceres de segurança do E1, sem mudar o texto deles; a mesma worktree recebe depois a edição da ADR 0023 (E2.2). Worktree nova `/home/rodrigoisensee/MetricasDSPD-052g`, branch `docs/073-adr-0023-claude` a partir de origin/develop (898a888fde7115b784deb0948e982408602122df).

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log --oneline -1 -- docs/security/073-dependabot-triagem.md` e o mesmo para `docs/security/073-aceite-alertas-16-27.md`, para os commits de origem.

## Entregar
- "E2.3 (tech-lead): branch de documentação a partir da develop com os dois pareceres de segurança do E1 trazidos da branch do Jarvis sem mudança de texto; base para a E2.2; o PR vem depois da E2.2, do review e do QA." (E2.3)
- (E2) (E2.3) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree add /home/rodrigoisensee/MetricasDSPD-052g -b docs/073-adr-0023-claude 898a888fde7115b784deb0948e982408602122df`. Trazer `docs/security/073-dependabot-triagem.md` (de 3478fcfc) e `docs/security/073-aceite-alertas-16-27.md` (de d82ac9b7) com `git -C /home/rodrigoisensee/MetricasDSPD-052g checkout <commit> -- <arquivo>`, conferindo que o blob fica igual ao da origem. `pnpm run docs:check` verde. Um commit, `git add` por caminho, mensagem pela seção de commits do docs/engineering/praticas.md com `Cartão: K-228`; envio da branch de trabalho com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/docs/073-adr-0023-claude` (sem `-u`; confira a branch). O PR desta branch vem depois da E2.2, do review e do QA, em outra delegação. Se um hook recusar a cópia, pare e relate a mensagem literal.
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
- 2026-11-05 20:41: E1.2 entregue pelo security-engineer: parecer de aceite dos alertas 16 e 27 em d82ac9b7 (docs/jarvis-2026-10-23), aprovado: 16 aceito (só e2e); 27 aceito depois de ler o advisory GHSA-3g3m-2fjr-6pw4 (falha de disponibilidade no abort por signal; o migrar.ts chama o runner sem useGlob, então o glob não roda, e o pacote não passa signal); revisão em 2026-12-05. O aceite formal em docs/security/aceites/ só o dono escreve (R-SEGURANCA) e só é exigido se um PR tiver parecer riscos-aceitos; fica como ação opcional do dono. DECISÃO TÉCNICA (Jarvis): conferência da entrega agora.
- 2026-11-05 20:44: DECISÃO TÉCNICA (Jarvis): os pareceres de segurança do E1 na branch do Jarvis (triagem 3478fcfc e aceite d82ac9b7) ficam com o mérito conferido (PQ cumpridos, fatos do parecer conferidos) e sem linha conferida: a branch do Jarvis diverge da develop desde ae009a75, então o intervalo pega commits antigos do quadro. Eles chegam à develop numa branch de documentação a partir da develop, antes da release, e aí ganham a conferência da entrega. MELHORIA (fábrica, ao agile-coach): parecer de segurança só de documentação não deveria ir para a branch do Jarvis; nasce numa branch de documentação a partir da develop.
- 2026-11-05 21:14: DECISÃO TÉCNICA (Jarvis): uma branch de documentação só, docs/073-adr-0023-claude, a partir da develop (898a888f), worktree /home/rodrigoisensee/MetricasDSPD-052g: o tech-lead (E2.3) cria a branch, alinha o CLAUDE.md à decisão do envio e traz a triagem e o aceite do E1 da branch do Jarvis; depois o software-architect (E2.2) edita o estado da ADR 0023 na mesma worktree; review, QA e PR depois.
- 2026-11-05 21:17: NAO-ENTENDI: (Jarvis) a pergunta do envio da branch antes do QA já estava respondida: o CLAUDE.md da develop traz a decisão do dono de 2026-10-27; o Jarvis leu o CLAUDE.md da própria branch, velha, e o conferente também. Achado pelo conferente no brief tech-lead-21. A E2.3 perde o ajuste do CLAUDE.md. MELHORIA (fábrica, ao agile-coach): o Jarvis e o conferente leem regras do projeto da develop, não do checkout da branch do Jarvis.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: o CLAUDE.md, a ADR 0023 (é da E2.2), o texto dos pareceres, código, testes, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

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
- "E6.1 (tech-lead): proposta, só leitura e sem commit, de como as releases entram no CHANGELOG pela §8 do fluxo-homologacao (seção por versão), com o texto das seções que faltam (releases 068 e 071) e o passo para a release combinada." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g ls-remote origin docs/073-adr-0023-claude` · espera: contém 'refs/heads/docs/073-adr-0023-claude'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g diff --name-only 898a888fde7115b784deb0948e982408602122df origin/docs/073-adr-0023-claude` · espera: linhas=2

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
