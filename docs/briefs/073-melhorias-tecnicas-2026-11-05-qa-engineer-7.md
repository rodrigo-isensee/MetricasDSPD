Agente destino: forge:qa-engineer
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-ca8-ref-dominio   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: qa   Cobre: E3.3

## Objetivo
QA do delta da volta do E3 (K-224): 848e4320 corrige a simulação do MySQL no teste pg do ref-sync e cobre o desempate do comparador de listasSha256, com o review aprovado em 979072e8 e a CI do push verde no head aaa52dab (run 42233046914) (pedido 073, E3.3, K-224). Worktree `/home/rodrigoisensee/MetricasDSPD-052e`, branch `feature/073-ca8-ref-dominio`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052e show 848e4320` (só o delta: o merge aaa52dab trouxe a develop, conferido por conteúdo), o parecer de review na branch e o parecer de QA anterior (`docs/qa/073-ca8-ref-dominio.md`).

## Entregar
- "E3.3 (qa-engineer): QA por item." (E3.3)
- (E3) (E3.3) `git -C /home/rodrigoisensee/MetricasDSPD-052e pull --ff-only origin feature/073-ca8-ref-dominio`; conferir que o 848e4320 não tira asserção e que o teste novo cobre o desempate; conferir a CI do push no head que tiver o código (`gh run list --branch feature/073-ca8-ref-dominio --event push --limit 3 --json headSha,conclusion`), que prova os testes pg e a cobertura de 100%; rodar `acelerato-ca8-listas` e `acelerato-campos-etapa` com no máximo 2 workers; reescrever `docs/qa/073-ca8-ref-dominio.md` inteiro pela ferramenta Write com `commit: aaa52dab2e3850063edf34a645a60117e71dc143`, veredito e bloco `## Achados` só com linhas de achado no formato (mantenha o A1 que vale); commit só do parecer com `Cartão: K-224` (mensagem por arquivo e `git commit -F`); envio com `git -C /home/rodrigoisensee/MetricasDSPD-052e push origin HEAD:refs/heads/feature/073-ca8-ref-dominio`; sem PR.
- (E1, E2, E4, E5, E6, E7, E8, E9, E10) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (linhas DECISÃO DO DONO copiadas literalmente do pedido; nenhuma muda esta entrega além do que está dito)
### DECISÃO DO DONO
- 2026-11-05 20:24: [SUSPENSA em 2026-11-05 20:31: a pergunta do Jarvis disse que nenhum dos dois alertas roda em produção; pela triagem o 27 roda no deploy, no CLI de migração; pergunta refeita ao dono] DECISÃO DO DONO: "A" (alertas 16 e 27 do Dependabot): aceitar o risco com prazo de revisão de 30 dias ou quando o pacote pai corrigir; o security-engineer registra a aceitação num parecer.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (P-0023-2): a ADR 0023 é vigente desde 2026-11-04, data do merge do PR 203 (4e755edd); as decisões do dono no 056 ("B") e no 060 ("A") mais esse merge contam como aceitação. O software-architect edita o estado da ADR pela proposta de docs/analises/073-adr-0023-estado.md, com review.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (próxima release): uma release só com a L9-c e o pedido 073, depois que os PRs do 073 estiverem na develop.
- 2026-11-05 20:34: DECISÃO DO DONO: "A" (alertas 16 e 27, pergunta refeita): aceitar o risco do 16 (zod via lighthouse, só teste) agora; o 27 (glob via node-pg-migrate, roda no deploy pelo CLI de migração) só depois de o security-engineer ler o advisory e confirmar que não se aplica ao uso do projeto (o glob lê só a pasta de migrações do repositório, sem entrada externa); confirmado, a aceitação do 27 entra no mesmo parecer, com revisão em 2026-12-05 ou quando o pacote pai corrigir; achado risco real, volta ao dono como pergunta nova.
- 2026-11-05 21:05: [SEM EFEITO no ajuste do CLAUDE.md em 2026-11-05 21:17: o CLAUDE.md da develop já diz isso desde a decisão do dono de 2026-10-27 ("enviada" quer dizer o PR para a develop; o push da feature branch é liberado antes); só o checkout velho da branch do Jarvis não tinha o texto] DECISÃO DO DONO: "A" (envio da branch antes do QA): a regra do CLAUDE.md ("nenhuma branch é enviada sem o parecer do QA") vale para o PR: nenhum PR para a develop sem o parecer do QA; a branch de trabalho pode ir ao GitHub antes. O tech-lead ajusta o texto do CLAUDE.md num PR de documentação. Com isso, o review do E8 (347106ef) é enviado e o QA do E8 segue.
- 2026-11-05 21:07: DECISÃO DO DONO: "A" (P-E3-1, natureza_prefixo, pelo "faça sua recomendação" do dono): a mudança de natureza_prefixo não para a coleta; fica registrada como versão de critério pelo ac:ref-sync e marcada nos gráficos (T2.6).
- 2026-11-05 21:08: DECISÃO DO DONO: "A" (P-E3-2, equipe, organização ou tipo que entra no recorte): os chamados antigos entram junto com o reconhecimento: reconhecer uma mudança de recorte dispara a releitura completa do recorte (só leitura no Acelerato, carga só acrescenta versões).
- 2026-11-06 10:31: DECISÃO DO DONO: "A" (P-E9-3, literal "Decisao e a A"): o E9 (CA-8 no coletor do BusinessMap) entra junto com o P-L2-1, quando o mapa de campos do BusinessMap tiver listas. DECISÃO TÉCNICA (Jarvis): o E9 sai do 073 em andamento e o K-234 volta à Entrada com a dependência do P-L2-1; P-E9-1, P-E9-2 e P-E9-4 ficam para quando ele voltar; o desenho docs/analises/073-e9-desenho.md fica como base. Próxima pergunta da fila: P-E10-1.
### ADRs citadas no pedido
- ADR 0023 (citada no pedido): vigente desde 2026-11-04 pela decisão do dono acima; nada nesta entrega além do que o Entregar diz
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023; nada nesta entrega
### Do Histórico deste pedido (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-06 11:30: Volta do E3 entregue pelo node-backend: CI do push verde no head aaa52dab (848e4320 correção; aaa52dab merge do origin, porque o remoto tinha 6eb7e21d, merge da develop feito fora do time); causa do pg: o MySQL falso do teste devolvia o nome antigo da equipe e o chamado caía em fora-do-recorte; o código do E3 estava certo, a expectativa do teste mudou sem tirar asserção; cobertura: teste novo para o desempate do comparador de listasSha256 (controle.ts:43), branches 100%. DECISÃO TÉCNICA (Jarvis): conferência da entrega agora; depois review e QA do delta 268c7e5c..aaa52dab, sem segurança (só teste e desempate de ordenação).
- 2026-11-06 11:33: DECISÃO TÉCNICA (Jarvis): os 20 arquivos que o merge da develop trouxe (PRs 240 a 243) ficam no escopo por conteúdo (diff vazio contra origin/develop 6754df7a), como o conferente leu; review e QA do delta 268c7e5c..aaa52dab olham só o 848e4320.
- 2026-11-06 11:42: Review do delta do E3 aprovado: docs/reviews/073-ca8-ref-dominio.md em 979072e8 (commit: aaa52dab), enviado; o teste pg pega o falso novo pela closure; o teste de cobertura prova o desempate de controle.ts:43; CI do push verde (run 42233046914); A1 a A3 seguem recomendados. DECISÃO TÉCNICA (Jarvis): conferência da entrega e brief do QA do delta em paralelo.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, os pareceres de outros papéis, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, a base real, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E3.2 (tech-lead): review por item." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): branch de documentação a partir da develop com os dois pareceres de segurança do E1 trazidos da branch do Jarvis sem mudança de texto; base para a E2.2; o PR vem depois da E2.2, do review e do QA." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por item, depois do QA." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho curto do E3 (K-224), só leitura, sem commit, antes da implementação." · etapa de outra delegação; continua no pedido
- "E3.6 (security-engineer): parecer de segurança por item com gatilho (o E3 toca controle de coleta e banco)." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido
- "E6.1 (tech-lead): proposta, só leitura e sem commit, de como as releases entram no CHANGELOG pela §8 do fluxo-homologacao (seção por versão), com o texto das seções que faltam (releases 068 e 071) e o passo para a release combinada." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E9.1 (software-architect): desenho curto do E9 (K-234), só leitura, sem commit, antes de qualquer implementação; o que for regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E10.1 (software-architect): desenho curto do E10 (K-235), só leitura, sem commit, antes de qualquer implementação; o que for regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido


## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052e show origin/feature/073-ca8-ref-dominio:docs/qa/073-ca8-ref-dominio.md` · espera: contém 'commit: aaa52dab2e3850063edf34a645a60117e71dc143'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
