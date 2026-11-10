Agente destino: forge:software-architect
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E10.2

## Objetivo
Plano de lotes do E10 (K-235) pela opção C do desenho e pelas decisões P-E10-1 a P-E10-4, com a proposta do vínculo de métricas de sustentação por grupo de lista (P-E10-2) para o dono validar (pedido 073, E10.2). Leitura no checkout destacado `/home/rodrigoisensee/MetricasDSPD-056d` em f21220fe, que está contido em `origin/develop`; o E3 já está na develop (merge c5a4728e), leia o código dele pelo `git show origin/develop:<arquivo>`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-e10-desenho.md` (o seu desenho) e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-e3-desenho.md` §3.
- Pela develop: `server/src/modulos/acelerato/controle.ts`, `coletor.ts`, o `ac:ref-sync` (`dominio-acelerato.ts`), `operacao/repositorio.ts` (lerVersoes) e o catálogo de métricas de sustentação (S1 a S8); só o necessário.

## Entregar
- "E10.2 (software-architect): plano de lotes do E10 pela opção C e pelas P-E10-1 a P-E10-4, com a proposta do vínculo de métricas por grupo de lista (P-E10-2) para o dono validar, em docs/analises/073-e10-plano.md, sem commit." (E10.2)
- (E10) (E10.2) Sem tocar em código, escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-e10-plano.md` pela ferramenta Write: uma seção `## Lote <n>` por lote (até 150 linhas cada, um comportamento), com arquivos, migração se houver, testes, versão de critério T2.6, gatilho de segurança e a CI do push como prova; a regra de recusa da opção C, a versão de critério para SQL, colunas e campos registrada no deploy (P-E10-3) e a lista revertida como mudança nova (P-E10-4); e uma seção `## Proposta P-E10-2` com uma tabela grupo de lista (recorte, vocabulário, fluxo, natureza_prefixo) por métricas de sustentação afetadas, com a base de cada linha, para o dono validar (vale também para a marca da P-E3-1).
- (E1, E2, E3, E4, E5, E6, E7, E8, E9) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições
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
### Do Histórico deste pedido (contexto)
- 2026-11-06 10:12: Desenho do E10 entregue pelo software-architect (docs/analises/073-e10-desenho.md, sem commit): --reconhecer-mudanca pula toda a comparação (coletor.ts:206-211 na develop; 210-223 na branch do E3) e ninguém confere ref_versao_criterio; só o ac:ref-sync registra versão, então INSERT direto ou UPDATE de rotulo passam. Opções: A exigir versão 056:ref-dominio registrada depois do último sucesso; B o reconhecimento grava a versão (grant novo); C recusar edição feita fora do ac:ref-sync (contém A). Recomendação C, dependente da P-E10-1. Riscos: a versão do ac:ref-sync não tem métrica vinculada e lerVersoes filtra metrica_id não nulo (operacao/repositorio.ts:53), então a marca nos gráficos não aparece, o que também atinge a decisão P-E3-1 ("marcada nos gráficos (T2.6)"); lista revertida não gera versão nova; a primeira coleta depois do deploy precisa isentar a chave nova.
- 2026-11-06 10:12: Achado (Jarvis): a decisão P-E3-1 ("fica registrada como versão de critério pelo ac:ref-sync e marcada nos gráficos (T2.6)") não se cumpre hoje: a versão é registrada, a marca não aparece por falta do vínculo de métricas. O E3 entrega a parte da coleta (não parar) e está certo; a marca vira item novo, que depende da P-E10-2. Fila de perguntas ao dono, uma por vez, depois da P-E9-3: P-E10-1 (edição direta no banco é caminho aceito?), P-E10-2 (quais métricas cada grupo de lista afeta, para marcar os gráficos), P-E10-3 (exigir versão também para mudança de SQL, colunas e campos?), P-E10-4 (voltar uma lista a um estado anterior é mudança de critério nova?).
- ADR 0023 (citada no pedido): vigente desde 2026-11-04; nada nesta entrega além do que o Entregar diz.
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023; nada nesta entrega.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- NÃO tocar: outros arquivos (ADRs, código, testes, `CLAUDE.md`), as worktrees (só leitura na 056d), a `develop`, a `homolog` e a `main`.

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
- "E10.3 (node-backend): implementação por lote do E10, com review, QA e segurança." · etapa de outra delegação; continua no pedido


## Pronto quando
- PQ-1 (cmd): `grep -c "^## Proposta P-E10-2" /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-e10-plano.md` · espera: linhas=1
- PQ-2 (cmd): `grep -c "^## Lote" /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-e10-plano.md` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
