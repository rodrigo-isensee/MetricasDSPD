Agente destino: forge:qa-engineer
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-ca8-ref-dominio   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: qa   Cobre: E3.3

## Objetivo
QA do item E3 do pedido 073 (K-224): mudança de lista em ref_dominio passa a pedir o reconhecimento da coleta (CA-8), com recorte_sha256 e vocabulario_sha256, natureza_prefixo fora (P-E3-1) e releitura no reconhecimento de recorte mudado (P-E3-2), com review e parecer de segurança aprovados, na ponta 2aedc573446143b1151de2b9f56eb06726037aa2 (pedido 073, E3.3, K-224). Worktree `/home/rodrigoisensee/MetricasDSPD-052e`, branch `feature/073-ca8-ref-dominio`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052e log --stat 8a789d43dd6227255e7f686728bcaaaaa1ed1797..2aedc573446143b1151de2b9f56eb06726037aa2`, o desenho `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-e3-desenho.md` (§3 e §4), o CT-34 em `docs/qa/056-coletor-plano-de-testes.md` e os pareceres `docs/reviews/073-ca8-ref-dominio.md` e `docs/security/073-ca8-ref-dominio.md` na branch.

## Entregar
- "E3.3 (qa-engineer): QA por item." (E3.3)
- (E3) (E3.3) `git -C /home/rodrigoisensee/MetricasDSPD-052e pull --ff-only origin feature/073-ca8-ref-dominio` (confira `git -C /home/rodrigoisensee/MetricasDSPD-052e branch --show-current`); se o review ou o parecer de segurança não estiverem aprovados, pare e relate; conferir os casos do CT-34 e do §4 do desenho contra os testes (mudança de recorte e de vocabulário recusa com só o nome da chave; natureza_prefixo não recusa e grava versão de critério; reconhecimento de recorte mudado vira releitura que só acrescenta versões; primeira coleta depois do deploy é recusada por falta do hash anterior e o reconhecimento manual a libera sem reler, como no review e no desenho §4), com uma mutação à mão num desses pontos que quebre ao menos um teste (desfeita depois, sem commit); rodar o vitest do server com no máximo 2 workers, `npx eslint .`, o typecheck e `pnpm run docs:check`; os 4 testes de entrada do server que lançam tsx em processo filho falham no sandbox (mkdir /tmp/tsx-1000 negado) e os testes pg pulam sem banco: registre-os como "prova na CI do PR", não como bug; parecer em `docs/qa/073-ca8-ref-dominio.md` gravado inteiro pela ferramenta Write, com `pedido: 073-melhorias-tecnicas-2026-11-05`, `branch: feature/073-ca8-ref-dominio`, `commit: a6363d2cd51fabf2e2fd6233c97cc05f32deaf62`, veredito e bloco `## Achados` só com linhas de achado no formato (sem linha solta; o pre-push barra frase de regra copiada, cite só o ID, e achado com mais de 300 caracteres); commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052e add docs/qa/073-ca8-ref-dominio.md` e `git -C /home/rodrigoisensee/MetricasDSPD-052e commit -m <mensagem> -m 'Cartão: K-224' -- docs/qa/073-ca8-ref-dominio.md` (sem heredoc e sem pipe); envio com `git -C /home/rodrigoisensee/MetricasDSPD-052e push origin HEAD:refs/heads/feature/073-ca8-ref-dominio`; sem PR.
- (E1, E2, E4, E5, E6, E7, E8) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

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
- 2026-11-06 08:31: E3 entregue pelo node-backend: feature/073-ca8-ref-dominio em a6363d2c (805c583d código e testes, a6363d2c CT-34 e acelerato-listas.md): recorte_sha256 e vocabulario_sha256 no CA-8; natureza_prefixo fora e com teste pg da versão de critério (P-E3-1); com --reconhecer-mudanca e recorte mudado a coleta vira releitura, e a primeira coleta depois do deploy reconhece sem reler (P-E3-2); eslint e tsc limpos; server 1800 passam, 251 pg pulados, 25 falham só nos 4 arquivos de entrada (tsx em /tmp; prova na CI, como os pg); docs:check ok. DECISÃO TÉCNICA (Jarvis): conferência da entrega, review (tech-lead) e parecer de segurança (security-engineer; gatilho: controle de coleta e banco) em paralelo, pareceres 073-ca8-ref-dominio.md; QA depois.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers; MemAvailable acima de 3000 MB e load abaixo de 4 antes da suíte.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes (a mutação é desfeita), os pareceres de review e de segurança, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, a base real, outras worktrees, a `develop`, a `homolog` e a `main`.

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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052e show origin/feature/073-ca8-ref-dominio:docs/qa/073-ca8-ref-dominio.md` · espera: contém 'commit: a6363d2cd51fabf2e2fd6233c97cc05f32deaf62'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
