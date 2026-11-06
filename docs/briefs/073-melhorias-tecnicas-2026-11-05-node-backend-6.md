Agente destino: forge:node-backend
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-ca8-ref-dominio   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: codigo   Cobre: E3.1

## Objetivo
Implementar o item E3 do pedido 073 (K-224): mudança de lista em ref_dominio passa a pedir o reconhecimento da coleta (CA-8), pelo desenho docs/analises/073-e3-desenho.md e pelas decisões do dono P-E3-1 e P-E3-2 (pedido 073, E3.1, K-224). Worktree nova `/home/rodrigoisensee/MetricasDSPD-052e`, branch `feature/073-ca8-ref-dominio` a partir de origin/develop (8a789d43dd6227255e7f686728bcaaaaa1ed1797).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-e3-desenho.md` (§3 proposta e §4 impacto; §5 riscos só o que tocar o código) e, na worktree, os arquivos que ele cita: `server/src/modulos/acelerato/controle.ts`, `coletor.ts`, `referencia.ts`, `erros.ts`, `server/src/entradas/coleta.ts` e os testes vizinhos.

## Entregar
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." (E3.1)
- (E3) (E3.1) Criar a worktree: `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree add /home/rodrigoisensee/MetricasDSPD-052e -b feature/073-ca8-ref-dominio 8a789d43dd6227255e7f686728bcaaaaa1ed1797` e `pnpm install --frozen-lockfile` nela. Implementar o §3 do desenho: chaves `recorte_sha256` (tipo_recorte, organizacao_recorte, equipe) e `vocabulario_sha256` (etapa, prioridade, categoria, descricao_workflow e os domínios cpe_*) em `ParametrosColeta` e `CHAVES_COMPARADAS`, forma canônica `campo|codigo|rotulo` ordenada por campo e codigo, sem a ordem; calculadas na partida antes de abrir a conexão (`carregarDominiosEtapa` sobe para antes de `montarParametros`); recusa pelo `parametros-mudaram` de hoje, só com o nome da chave. Pela P-E3-1, natureza_prefixo fica fora das chaves. Pela P-E3-2, quando a coleta roda com `--reconhecer-mudanca` e o `recorte_sha256` mudou, ela faz a releitura completa do recorte (o mesmo caminho da releitura semanal da ADR 0023 §6), só leitura no Acelerato e sem sobrescrever histórico; se esse caminho não existir no código, pare antes de inventar um e relate. Testes do §4 (unitário do hash, coletor com duplo para as duas chaves e para a releitura da P-E3-2, pg do ac:ref-sync seguido de recusa e reconhecimento); atualizar o CT-34 em `docs/qa/056-coletor-plano-de-testes.md` e `docs/architecture/fontes/acelerato-listas.md` (passo de reconhecer depois do ac:ref-sync); a ADR 0023 fica para outra entrega. Validar: `npx eslint .` e `npx tsc --noEmit` com cwd em `server/`, o vitest do server com no máximo 2 workers (os 4 testes de entrada que lançam tsx em processo filho falham no sandbox por /tmp/tsx-1000; registre como "prova na CI"), `pnpm run docs:check`. Commits pela seção de commits do docs/engineering/praticas.md, `git add` por caminho, `Cartão: K-224`; envio com `git -C /home/rodrigoisensee/MetricasDSPD-052e push origin HEAD:refs/heads/feature/073-ca8-ref-dominio` (sem `-u`; confira `git -C /home/rodrigoisensee/MetricasDSPD-052e branch --show-current`); sem PR.
- (E1, E2, E4, E5, E6, E7, E8) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (linhas DECISÃO DO DONO copiadas literalmente do pedido; nenhuma muda esta entrega além do que está dito)
### DECISÃO DO DONO
- 2026-11-05 20:24: [SUSPENSA em 2026-11-05 20:31: a pergunta do Jarvis disse que nenhum dos dois alertas roda em produção; pela triagem o 27 roda no deploy, no CLI de migração; pergunta refeita ao dono] DECISÃO DO DONO: "A" (alertas 16 e 27 do Dependabot): aceitar o risco com prazo de revisão de 30 dias ou quando o pacote pai corrigir; o security-engineer registra a aceitação num parecer.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (P-0023-2): a ADR 0023 é vigente desde 2026-11-04, data do merge do PR 203 (4e755edd); as decisões do dono no 056 ("B") e no 060 ("A") mais esse merge contam como aceitação. O software-architect edita o estado da ADR pela proposta de docs/analises/073-adr-0023-estado.md, com review.
- 2026-11-05 20:27: DECISÃO DO DONO: "A" (próxima release): uma release só com a L9-c e o pedido 073, depois que os PRs do 073 estiverem na develop.
- 2026-11-05 20:34: DECISÃO DO DONO: "A" (alertas 16 e 27, pergunta refeita): aceitar o risco do 16 (zod via lighthouse, só teste) agora; o 27 (glob via node-pg-migrate, roda no deploy pelo CLI de migração) só depois de o security-engineer ler o advisory e confirmar que não se aplica ao uso do projeto (o glob lê só a pasta de migrações do repositório, sem entrada externa); confirmado, a aceitação do 27 entra no mesmo parecer, com revisão em 2026-12-05 ou quando o pacote pai corrigir; achado risco real, volta ao dono como pergunta nova.
- 2026-11-05 21:05: DECISÃO DO DONO: "A" (envio da branch antes do QA): a regra do CLAUDE.md ("nenhuma branch é enviada sem o parecer do QA") vale para o PR: nenhum PR para a develop sem o parecer do QA; a branch de trabalho pode ir ao GitHub antes. O tech-lead ajusta o texto do CLAUDE.md num PR de documentação. Com isso, o review do E8 (347106ef) é enviado e o QA do E8 segue.
- 2026-11-05 21:07: DECISÃO DO DONO: "A" (P-E3-1, natureza_prefixo, pelo "faça sua recomendação" do dono): a mudança de natureza_prefixo não para a coleta; fica registrada como versão de critério pelo ac:ref-sync e marcada nos gráficos (T2.6).
- 2026-11-05 21:08: DECISÃO DO DONO: "A" (P-E3-2, equipe, organização ou tipo que entra no recorte): os chamados antigos entram junto com o reconhecimento: reconhecer uma mudança de recorte dispara a releitura completa do recorte (só leitura no Acelerato, carga só acrescenta versões).
### ADRs citadas no pedido
- ADR 0023 (citada no pedido): vigente desde 2026-11-04 pela decisão do dono acima; nada nesta entrega além do que o Entregar diz
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023; nada nesta entrega
### Do Histórico deste pedido (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 20:53: Desenho do E3 entregue pelo software-architect (docs/analises/073-e3-desenho.md, sem commit): duas chaves novas no CA-8 (recorte_sha256: tipo, organização, equipe; vocabulario_sha256: etapa, prioridade, categoria, workflow e cpe_*), hash de campo|codigo|rotulo em ordem, calculado na partida, gravado em ctl_coleta.parametros, sem migração; recusa pelo caminho de hoje (parametros-mudaram, --reconhecer-mudanca); a primeira coleta depois do deploy pede reconhecimento manual (entra no roteiro da release). Riscos: lista nova só vale para a frente; R1 do review 056 fora; o coletor do BusinessMap não tem CA-8 (cartão a decidir).
- 2026-11-05 20:53: DECISÃO TÉCNICA (Jarvis): a implementação do E3 (E3.1) espera as respostas de P-E3-1 e P-E3-2 (regra de negócio não se resolve por inferência); as perguntas vão ao dono uma por vez, depois da pergunta do envio da branch.
- 2026-11-05 21:08: DECISÃO TÉCNICA (Jarvis): o E3 (E3.1) começa com o node-backend pelo desenho docs/analises/073-e3-desenho.md e pelas decisões P-E3-1 e P-E3-2, numa worktree nova /home/rodrigoisensee/MetricasDSPD-052e, branch feature/073-ca8-ref-dominio a partir de origin/develop; review, QA e segurança (gatilho: banco e controle de coleta) depois.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: o coletor do BusinessMap, natureza_prefixo, migrações (o desenho diz que não precisa), as ADRs, o `CLAUDE.md`, os arquivos `.env*`, a base real, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): registrar num parecer a aceitação de risco dos alertas 16 e 27, com prazo de revisão, pela decisão do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): editar o estado da ADR 0023 para vigente desde 2026-11-04, pela proposta e pela decisão do dono, numa branch de documentação com review." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho curto do E3 (K-224), só leitura, sem commit, antes da implementação." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por item." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por item, depois do QA." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- "E6.1 (tech-lead): proposta, só leitura e sem commit, de como as releases entram no CHANGELOG pela §8 do fluxo-homologacao (seção por versão), com o texto das seções que faltam (releases 068 e 071) e o passo para a release combinada." · etapa de outra delegação; continua no pedido
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." · etapa de outra delegação; continua no pedido
- "E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052e ls-remote origin feature/073-ca8-ref-dominio` · espera: contém 'refs/heads/feature/073-ca8-ref-dominio'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052e grep -c recorte_sha256 origin/feature/073-ca8-ref-dominio -- server/src/modulos/acelerato/controle.ts` · espera: contém 'controle.ts'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052e grep -c vocabulario_sha256 origin/feature/073-ca8-ref-dominio -- server/src/modulos/acelerato/controle.ts` · espera: contém 'controle.ts'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
