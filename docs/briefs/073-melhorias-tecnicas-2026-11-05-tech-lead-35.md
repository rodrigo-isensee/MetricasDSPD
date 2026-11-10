Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-e10-l1-versao   Base: develop   Base-sha: 78cf396ce11acbe4a1caa2babf6306407690dd80
Etapa: review   Cobre: E10.4

## Objetivo
Review do Lote 1 do E10 do pedido 073 (K-235): o `ac:ref-sync` registra versão nova com a data da carga a cada mudança de vigência (P-E10-4), pela referência `056:ref-dominio:<sha256>:<AAAA-MM-DD>`, na ponta c9f887118bf9d6272e027b1043e1d2541123f55b, com a CI do push verde (run 42331476876) e a entrega conferida. Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/073-e10-l1-versao`; o parecer de segurança corre em paralelo na mesma worktree.

## Entregar
- "E10.4 (tech-lead): review por lote do E10." (E10.4) Nesta delegação, só o Lote 1.
- (E10) (E10.4) Foco: aderência à seção "Lote 1" do plano (referência com a data, idempotência por ela, versões antigas intactas, limite de mesmo dia mantido, `ref-sync-ac.ts` sem mudança), os três testes do plano, a documentação em `docs/architecture/server.md`, o teto de 150 linhas e a CI do push no head. Parecer em `docs/reviews/073-e10-l1-versao.md` gravado inteiro pela ferramenta Write, com `pedido: 073-melhorias-tecnicas-2026-11-05`, `branch: feature/073-e10-l1-versao`, `commit: c9f887118bf9d6272e027b1043e1d2541123f55b`, veredito e bloco `## Achados` só com linhas de achado no formato (sem linha solta; cite regra só pelo ID; achado com até 300 caracteres); commit só do parecer com `Cartão: K-235` (mensagem gravada por Write num arquivo de caminho literal e `git commit -F`, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/073-e10-l1-versao`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052d rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/073-e10-l1-versao`, em primeiro plano, com o comando puro (sem pipe nem variável); se o push for recusado porque o outro parecer entrou antes, `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --rebase origin feature/073-e10-l1-versao` (arquivos diferentes) e envie de novo; se o rc não for 0 por outro motivo, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate; sem PR.
- (E1, E2, E3, E4, E5, E6, E7, E8, E9) Nada a entregar aqui: não nesta delegação.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 78cf396ce11acbe4a1caa2babf6306407690dd80...c9f887118bf9d6272e027b1043e1d2541123f55b` e a seção "Lote 1" de `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-e10-plano.md`.
- Do pedido `docs/pedidos/073-melhorias-tecnicas-2026-11-05.md`, a linha do `## Histórico` que registra a entrega do Lote 1 do E10.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- 2026-11-05 20:24: [SUSPENSA em 2026-11-05 20:31: a pergunta do Jarvis disse que nenhum dos dois alertas roda em produção; pela triagem o 27 roda no deploy, no CLI de migração; pergunta refeita ao dono] DECISÃO DO DONO: "A" (alertas 16 e 27 do Dependabot): aceitar o risco com prazo de revisão de 30 dias ou quando o pacote pai corrigir; o security-engineer registra a aceitação num parecer.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (P-0023-2): a ADR 0023 é vigente desde 2026-11-04, data do merge do PR 203 (4e755edd); as decisões do dono no 056 ("B") e no 060 ("A") mais esse merge contam como aceitação. O software-architect edita o estado da ADR pela proposta de docs/analises/073-adr-0023-estado.md, com review.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (próxima release): uma release só com a L9-c e o pedido 073, depois que os PRs do 073 estiverem na develop.
- 2026-11-05 20:34: DECISÃO DO DONO: "A" (alertas 16 e 27, pergunta refeita): aceitar o risco do 16 (zod via lighthouse, só teste) agora; o 27 (glob via node-pg-migrate, roda no deploy pelo CLI de migração) só depois de o security-engineer ler o advisory e confirmar que não se aplica ao uso do projeto (o glob lê só a pasta de migrações do repositório, sem entrada externa); confirmado, a aceitação do 27 entra no mesmo parecer, com revisão em 2026-12-05 ou quando o pacote pai corrigir; achado risco real, volta ao dono como pergunta nova.
- 2026-11-05 21:05: [SEM EFEITO no ajuste do CLAUDE.md em 2026-11-05 21:17: o CLAUDE.md da develop já diz isso desde a decisão do dono de 2026-10-27 ("enviada" quer dizer o PR para a develop; o push da feature branch é liberado antes); só o checkout velho da branch do Jarvis não tinha o texto] DECISÃO DO DONO: "A" (envio da branch antes do QA): a regra do CLAUDE.md ("nenhuma branch é enviada sem o parecer do QA") vale para o PR: nenhum PR para a develop sem o parecer do QA; a branch de trabalho pode ir ao GitHub antes. O tech-lead ajusta o texto do CLAUDE.md num PR de documentação. Com isso, o review do E8 (347106ef) é enviado e o QA do E8 segue.
- 2026-11-05 21:07: DECISÃO DO DONO: "A" (P-E3-1, natureza_prefixo, pelo "faça sua recomendação" do dono): a mudança de natureza_prefixo não para a coleta; fica registrada como versão de critério pelo ac:ref-sync e marcada nos gráficos (T2.6).
- 2026-11-05 21:08: DECISÃO DO DONO: "A" (P-E3-2, equipe, organização ou tipo que entra no recorte): os chamados antigos entram junto com o reconhecimento: reconhecer uma mudança de recorte dispara a releitura completa do recorte (só leitura no Acelerato, carga só acrescenta versões).
- 2026-11-06 10:31: DECISÃO DO DONO: "A" (P-E9-3, literal "Decisao e a A"): o E9 (CA-8 no coletor do BusinessMap) entra junto com o P-L2-1, quando o mapa de campos do BusinessMap tiver listas. DECISÃO TÉCNICA (Jarvis): o E9 sai do 073 em andamento e o K-234 volta à Entrada com a dependência do P-L2-1; P-E9-1, P-E9-2 e P-E9-4 ficam para quando ele voltar; o desenho docs/analises/073-e9-desenho.md fica como base. Próxima pergunta da fila: P-E10-1.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-E10-1): editar ref_dominio direto no banco não é caminho aceito: a coleta recusa até a lista voltar pelo ac:ref-sync (opção C do desenho do E10).
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-E10-2): o time propõe quais métricas de sustentação cada grupo de lista afeta e o dono valida (vale também para a marca da P-E3-1).
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-E10-3): mudança de SQL, colunas e campos também exige versão de critério, registrada no deploy.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-E10-4): voltar uma lista a um estado anterior é nova mudança de critério, com data nova.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (DEV-1): exigir checks verdes para mesclar na develop (proteção da branch no GitHub).
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211): as tendências do Resumo entram no mapa real, como pedido novo (077).
- ADR 0023 (citada no pedido): vigente desde 2026-11-04 (E2 deste pedido); este lote não muda o que ela decide.
- ADR 0028 (citada no pedido): não se aplica a este lote.
- 2026-11-06 12:27: DECISÃO TÉCNICA (Jarvis): a validação da tabela P-E10-2 e as P-E10-5 e P-E10-6 vão ao dono; os lotes 1 a 3 não dependem delas e podem começar com o node-backend quando ele estiver livre.
- Recursos: vitest com no máximo 2 workers (DECISÃO TÉCNICA do Jarvis, 075, 14:40); regra da noite do dono (075, 2026-11-07 00:07): até 3 agentes e 1 git push por vez, escalonados pelo Jarvis.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`; npm: `registry.npmjs.org`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, o parecer do outro papel, o plano, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): branch de documentação a partir da develop com os dois pareceres de segurança do E1 trazidos da branch do Jarvis sem mudança de texto; base para a E2.2; o PR vem depois da E2.2, do review e do QA." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por item." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por item, depois do QA." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho curto do E3 (K-224), só leitura, sem commit, antes da implementação." · etapa de outra delegação; continua no pedido
- "E3.6 (security-engineer): parecer de segurança por item com gatilho (o E3 toca controle de coleta e banco)." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido
- "E6.1 (tech-lead): proposta, só leitura e sem commit, de como as releases entram no CHANGELOG pela §8 do fluxo-homologacao (seção por versão), com o texto das seções que faltam (releases 068 e 071) e o passo para a release combinada." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E9.1 (software-architect): desenho curto do E9 (K-234), só leitura, sem commit, antes de qualquer implementação; o que for regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E10.1 (software-architect): desenho curto do E10 (K-235), só leitura, sem commit, antes de qualquer implementação; o que for regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E10.2 (software-architect): plano de lotes do E10 pela opção C e pelas P-E10-1 a P-E10-4, com a proposta do vínculo de métricas por grupo de lista (P-E10-2) para o dono validar, em docs/analises/073-e10-plano.md, sem commit." · etapa de outra delegação; continua no pedido
- "E10.3 (node-backend): implementação por lote do E10, com review, QA e segurança." · etapa de outra delegação; continua no pedido (Lote 1 entregue e conferido)
- "E10.5 (security-engineer): parecer de segurança por lote do E10 com gatilho (banco)." · etapa de outra delegação; continua no pedido
- "E10.6 (qa-engineer): QA por lote do E10." · etapa de outra delegação; continua no pedido
- "E10.7 (tech-lead): PR por lote do E10, depois do QA." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/073-e10-l1-versao:docs/reviews/073-e10-l1-versao.md` · espera: contém 'commit: c9f887118bf9d6272e027b1043e1d2541123f55b'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
