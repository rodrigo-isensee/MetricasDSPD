Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-deps-patch   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: pr   Cobre: E3.4

## Objetivo
Volta do PR 242 do item E8 do pedido 073 (K-232): depois do `gh pr update-branch` (head 23282c48f76ae1eaad6bfd1f398c522601e0ea98), o check `e2e-parte (2/2)` falhou (run 42221287919, job 127903691428), e no head anterior a8810bf2 o mesmo job passou com o mesmo pnpm-lock.yaml; rodar de novo só o que falhou e, verde, mesclar (pedido 073, E3.4, K-232). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/073-deps-patch`.

## Ler
- Os pareceres `docs/reviews/073-deps-patch.md`, `docs/security/073-deps-patch.md` e `docs/qa/073-deps-patch.md` na branch (só o veredito e os achados).

## Entregar
- "E3.4 (tech-lead): PR por item, depois do QA." (E3.4)
- (E8) (E3.4) `gh run rerun 42221287919 --failed --repo rodrigo-isensee/MetricasDSPD`; esperar os checks por chamadas curtas com pausa (sem `--watch`; `gh pr checks` sai com código diferente de zero enquanto há check pendente, então decida pelo estado de cada check e não pelo código de saída); se a develop andou de novo e o PR pedir atualização, `gh pr update-branch` e esperar a rodada nova; com todos verdes, `gh pr merge 242 --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se o `e2e-parte (2/2)` falhar de novo, não mescle: tente ler a falha pela API sem baixar log (`gh api repos/rodrigo-isensee/MetricasDSPD/actions/jobs/<job>`, as annotations do check) e relate o nome do teste se aparecer; não peça hosts novos nem contorne o classificador; sem promover para a homolog.
- (E1, E2, E3, E4, E5, E6, E7, E9, E10) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

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
- 2026-11-05 19:42: E8 parado antes do push: commit local b9441f58 só no pnpm-lock.yaml (body-parser 1.20.9, qs 6.16.1, ip-address 10.7.4, nada mais); install frozen ok; pacotes verdes; server 1781 passam e 25 falham, todos nos 4 testes de entrada que lançam tsx em processo filho com env limpo (mkdir /tmp/tsx-1000 negado no sandbox, limitação já conhecida e registrada no brief do QA da 071); eslint e docs:check verdes. DECISÃO TÉCNICA (Jarvis): a falha é do ambiente do time e não da versão; o push segue e a CI do PR (suíte completa fora do sandbox) é a prova desses 4 arquivos antes de qualquer merge; o node-backend só faz o push. MELHORIA (técnica do projeto): os testes de entrada ignoram TMPDIR por usarem env limpo; passar TMPDIR adiante tiraria a dependência de /tmp (cartão).
- 2026-11-05 20:35: Review do E8 aprovado: docs/reviews/073-deps-patch.md em 347106ef, local, sem envio (commit: b9441f58); só as três versões subiram, package.json dispensado; A1 (recomendado): confirmar na CI do PR a instalação congelada, a varredura de dependências e os 4 testes de entrada do server. DECISÃO TÉCNICA (Jarvis): conferência da entrega e brief do QA do E8 em paralelo; o QA commita o parecer e envia a branch; o PR (E3.4) depois.
- 2026-11-06 10:50: PR 242 do E8: no head 23282c48 (depois do update-branch) o e2e-parte (2/2) falhou em 19m22s; no head a8810bf2 o mesmo job passou; o log não foi lido (hosts de log fora do sandbox, classificador negou). DECISÃO TÉCNICA (Jarvis): o lockfile não mudou entre as duas rodadas e o E2E tem instabilidade conhecida (K-191, K-192); o tech-lead roda de novo só o job que falhou e mescla se ficar verde; falhando de novo, para e relata.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: os pareceres, o pnpm-lock.yaml, código, testes, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`; a develop só muda pelo merge do PR.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): branch de documentação a partir da develop com os dois pareceres de segurança do E1 trazidos da branch do Jarvis sem mudança de texto; base para a E2.2; o PR vem depois da E2.2, do review e do QA." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por item." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho curto do E3 (K-224), só leitura, sem commit, antes da implementação." · etapa de outra delegação; continua no pedido
- "E3.6 (security-engineer): parecer de segurança por item com gatilho (o E3 toca controle de coleta e banco)." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido
- "E6.1 (tech-lead): proposta, só leitura e sem commit, de como as releases entram no CHANGELOG pela §8 do fluxo-homologacao (seção por versão), com o texto das seções que faltam (releases 068 e 071) e o passo para a release combinada." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E9.1 (software-architect): desenho curto do E9 (K-234), só leitura, sem commit, antes de qualquer implementação; o que for regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E10.1 (software-architect): desenho curto do E10 (K-235), só leitura, sem commit, antes de qualquer implementação; o que for regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/073-deps-patch --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
