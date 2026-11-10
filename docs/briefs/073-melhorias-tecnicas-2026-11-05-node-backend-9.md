Agente destino: forge:node-backend
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-ca8-ref-dominio   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: codigo   Cobre: E3.1

## Objetivo
Volta do item E3 do pedido 073 (K-224): a CI do push da branch, no head 268c7e5c112259df88b3d37564e720e6d22389ce, falhou em dois checks que não rodam no sandbox (run 42220481120), e o PR 244 está parado; corrigir as duas falhas (pedido 073, E3.1, K-224). Worktree `/home/rodrigoisensee/MetricasDSPD-052e`, branch `feature/073-ca8-ref-dominio`.

## Ler
- O check `banco` (job 127901054654): `gh api repos/rodrigo-isensee/MetricasDSPD/check-runs/127901054654/annotations` (falha em `server/tests/acelerato-ca8-ref-sync.pg.test.ts:81`: o `ErroColeta` não casa com `{ codigo: 'parametros-mudaram', ... }`; o tech-lead leu `fora-do-recorte` para o chamado 91; 2 de 3 testes do arquivo) e o check `testes` (job 127900982403): cobertura de branches do server 99,97% contra o limiar de 100%.
- O teste pg e o código que ele exercita (`server/src/modulos/acelerato/coletor.ts`, `controle.ts`, `referencia.ts`) na worktree.

## Entregar
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." (E3.1)
- (E3) (E3.1) Corrigir `server/tests/acelerato-ca8-ref-sync.pg.test.ts` ou o código do E3 (o que estiver errado; se o teste espera o comportamento das decisões P-E3-1 e P-E3-2 e o código não o cumpre, o código muda; mudar o que o teste espera exige explicar no relatório por que a expectativa estava errada), sem tirar asserção; achar o ramo sem cobertura (por exemplo com `pnpm --dir /home/rodrigoisensee/MetricasDSPD-052e/server exec vitest run --coverage --maxWorkers=2` e o relatório de cobertura) e cobri-lo com teste, sem baixar o limiar nem pôr exclusão de cobertura; rodar eslint e tsc; commit com `Cartão: K-224`, `git add` explícito por caminho; envio com `git -C /home/rodrigoisensee/MetricasDSPD-052e push origin HEAD:refs/heads/feature/073-ca8-ref-dominio` (confira `git -C /home/rodrigoisensee/MetricasDSPD-052e branch --show-current`); como os testes pg e a cobertura completa não rodam no sandbox, esperar a CI do push por chamadas curtas (`gh run list --branch feature/073-ca8-ref-dominio --event push --limit 1 --json headSha,status,conclusion`) e, vermelha, corrigir de novo (até 3 voltas) ou parar e relatar; sem PR e sem mexer no PR 244.
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
- 2026-11-06 11:03: PR 244 do E3 aberto (head 268c7e5c) e não mesclado: a CI do push falhou no mesmo head (run 42220481120): banco: server/tests/acelerato-ca8-ref-sync.pg.test.ts:81 recebe codigo fora-do-recorte (chamado 91) no lugar de parametros-mudaram, 2 de 3 testes; testes: cobertura de branches do server 99,97% contra 100%. Escape registrado (depois do QA). DECISÃO TÉCNICA (Jarvis): volta ao node-backend (brief node-backend-9) com as duas falhas; depois review e QA revalidam o delta e o PR é atualizado. MELHORIA (processo, do tech-lead): review e QA conferem a CI do push da branch (gh run list --branch) antes do parecer.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: arquivos fora do E3, os pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, a base real, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): branch de documentação a partir da develop com os dois pareceres de segurança do E1 trazidos da branch do Jarvis sem mudança de texto; base para a E2.2; o PR vem depois da E2.2, do review e do QA." · etapa de outra delegação; continua no pedido
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


## Pronto quando
- PQ-1 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/073-ca8-ref-dominio --event push --limit 1 --json conclusion` · espera: contém '"success"'
- PQ-2 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052e ls-remote origin refs/heads/feature/073-ca8-ref-dominio` igual ao head local

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
