Agente destino: forge:tech-lead
Pedido: docs/pedidos/052-integracao-businessmap.md
Tipo: codigo
Branch: docs/052-businessmap-discovery   Base: develop   Base-sha: a6e75433716727edc3256419740f384775290a66
Etapa: merge-integracao   Cobre: E1.11

## Objetivo
Etapa E1.11 do pedido 052 (cartão K-182): o dono validou o plano em 2026-10-29 e o arquiteto registrou a Q-2c e a validação (E1.10, na worktree, sem commit). Grave, revise e integre o discovery na `develop`, para as fatias de código partirem dele. Worktree `/home/rodrigoisensee/MetricasDSPD-052`, branch `docs/052-businessmap-discovery` (HEAD 00d459c2874c16be866fc1113b9953e610235c82, igual ao remoto).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052 status --short` e o diff dos 2 arquivos modificados (o plano `docs/architecture/features/052-integracao-businessmap.md` e a ADR `docs/architecture/adr/0022-coleta-incremental-e-webhook-businessmap.md`).
- Para o review: `git -C /home/rodrigoisensee/MetricasDSPD-052 diff a6e75433716727edc3256419740f384775290a66..HEAD --stat` e os documentos do discovery que o diff lista; a seção de commits e a de review de `/home/rodrigoisensee/MetricasDSPD-052/docs/engineering/praticas.md`.

## Entregar
- "E1.11 (tech-lead): commit e push da E1.10 na `docs/052-businessmap-discovery` com `Cartão: K-182`; parecer de review do discovery em `docs/reviews/052-integracao-businessmap.md`; PR para a `develop` (squash) e merge com os checks verdes e os pareceres que o `forge-check pr` exigir." (E1.11), com:
  - (E1.11) Um commit da E1.10, `git add` explícito dos 2 caminhos acima, mensagem conforme o `praticas.md`, com `Cartão: K-182` no corpo.
  - (E1.11) Parecer de review do discovery inteiro (da base a6e7543 ao HEAD) em `docs/reviews/052-integracao-businessmap.md`, no formato dos pareceres de review do projeto, com o bloco `## Achados`; avalie também a ressalva que o arquiteto relatou ter saído do §8 do plano na E1.10 ("Se o spike F1 mostrar que esses filtros não funcionam combinados com `state`, a fatia volta ao arquiteto antes do código, e a troca de filtro vai ao dono"): se ela precisa voltar ao plano (na F1 ou nos riscos), é achado bloqueante para o arquiteto, e você para antes do PR e relata. Commit do parecer, com `Cartão: K-182`.
  - (E1.11) `pnpm run docs:check` na raiz da worktree antes do push (se o `pnpm` não estiver no PATH, use `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin pnpm run docs:check`); vermelho: pare e relate, sem corrigir o conteúdo dos documentos (é dos autores).
  - (E1.11) Push com `git -C /home/rodrigoisensee/MetricasDSPD-052 push origin HEAD:refs/heads/docs/052-businessmap-discovery`, depois de conferir `git -C /home/rodrigoisensee/MetricasDSPD-052 branch --show-current`.
  - (E1.11) `forge-check pr 052-integracao-businessmap`, rodado de dentro da worktree, sai com rc=0 antes do PR; se acusar algo, pare e relate, sem PR.
  - (E1.11) PR de `docs/052-businessmap-discovery` para a `develop`, título no padrão de commits do `praticas.md`, corpo com o resumo do discovery e a tabela dos pareceres (caminho e veredito); espere os checks obrigatórios verdes e mescle com squash pelo nome da branch (`gh pr merge docs/052-businessmap-discovery --squash`), sem `--admin`, sem apagar a branch remota.
- (E2, E3, E4, E5, E6) Nada a entregar aqui: não nesta delegação (as fatias de código vêm depois deste PR).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-052` e branch `docs/052-businessmap-discovery` a partir da `develop`, sem commit." · etapa de outra delegação; já entregue (worktree e branch em a6e7543)
- "E1.1 (software-architect): atualizar o desenho já feito no pedido 006 (`docs/architecture/features/integracao-real.md`, `docs/integracao/businessmap-api-configuracao.md`, `docs/architecture/data-model.md`) contra o código atual de `server/src/modulos/businessmap` e as ADRs posteriores a 2026-10-11, e escrever o plano técnico da coleta (T2.2) e do webhook (T2.3) em fatias, com o que cada fatia espera do roteiro §7 do dono, em `docs/architecture/features/052-integracao-businessmap.md`, na worktree 052, sem commit." · etapa de outra delegação; já entregue
- "E1.2 (security-engineer): atualizar o modelo de ameaças da integração (apikey, allow-list, webhook, coleta agendada) a partir de `docs/security/adr-0020-protecao-de-pessoa.md` e `docs/security/k084-coletor-allow-list.md`, em `docs/security/052-integracao-businessmap-ameacas.md`, na worktree 052, sem commit." · etapa de outra delegação; já entregue
- "E1.3 (ux-designer): conferir a especificação validada `docs/ux/integracao-real/05-especificacao.md` (validação de 2026-10-10) contra os painéis atuais (FL1 a FL3 e as operacionais O19 a O26) e registrar só o que mudou, em `docs/ux/integracao-real/06-delta-2026-10-29.md`, na worktree 052, sem commit." · etapa de outra delegação; já entregue
- "E1.4 (dono): apikey do BusinessMap no `.env` e confirmação da WS1." · etapa de outra delegação; continua no pedido (do dono)
- "E1.5 (tech-lead): commit e push dos documentos do discovery (E1.1 a E1.3) na `docs/052-businessmap-discovery`, sem PR; o PR vem depois da validação do dono." · etapa de outra delegação; já entregue
- "E1.6 (software-architect): revisar o plano `docs/architecture/features/052-integracao-businessmap.md`, a ADR 0022, a ADR 0020 (item 4b: nomes dos responsáveis por GET /users), a ADR 0016 (U-1 e U-2 decididos), `docs/architecture/data-model.md`, `docs/integracao/businessmap-api-configuracao.md` e `docs/architecture/features/integracao-real.md` com as decisões do dono de 2026-10-29, na worktree 052, sem commit." · etapa de outra delegação; já entregue (00d459c)
- "E1.7 (security-engineer): revisar `docs/security/052-integracao-businessmap-ameacas.md` com as decisões do dono de 2026-10-29 (chave do dono, coleta só na máquina do dono, nomes por GET /users), na worktree 052, sem commit." · etapa de outra delegação; já entregue (00d459c)
- "E1.8 (ux-designer): revisar `docs/ux/integracao-real/06-delta-2026-10-29.md` com as decisões do dono P-1 a P-5 e o escopo só operacional, na worktree 052, sem commit." · etapa de outra delegação; já entregue (00d459c)
- "E1.9 (tech-lead): commit e push das revisões E1.6 a E1.8 na `docs/052-businessmap-discovery`, com `Cartão: K-182` no corpo, sem PR." · etapa de outra delegação; já entregue (00d459c no remoto)
- "E1.10 (software-architect): registrar a decisão Q-2c do dono no plano (`docs/architecture/features/052-integracao-businessmap.md`, §7 e §8) e na ADR 0022 (item 4), e marcar o plano como validado pelo dono em 2026-10-29 (frontmatter `estado` do plano e linha `Estado:` da ADR 0022 de proposta para vigente, o valor que o projeto usa), na worktree 052, sem commit." · etapa de outra delegação; já entregue (na worktree, sem commit: o plano e a ADR 0022 modificados, que esta etapa commita)
- Conteúdo dos documentos (é dos autores); código; a `homolog` e a `main`; o quadro e o arquivo de pedido; apagar a branch remota (ação do dono).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): "depois disso vamos trabalhar na integracao com o business map"
- DECISÃO DO DONO (2026-10-29): recibo do 052 aceito ("A", leitura a): a integração com dados reais do BusinessMap passa à frente do que falta do 048 em mock; E1 a E6 entram; Acelerato, WS1 e o resto do 048 ficam fora.
- DECISÃO DO DONO (2026-10-29): "facarecomendacao" (resposta ao roteiro §7): no item de decisão do roteiro ainda aberto (8, webhook ou só polling) vale a recomendação do time, escrita no plano da E1.1 e mostrada ao dono antes do código; o item 9 (dados de pessoa) já foi decidido pelo dono (2026-10-10 e R-2 = B em 2026-10-16, ADR 0020 itens 4b e 4c); os itens de ação (1 a 7 e 10) continuam com o dono.
- DECISÃO DO DONO (2026-10-29): "i" — E4 fica só no painel operacional inteiro (18 do FL1 e O19 a O26) com dado real do BusinessMap. Retira do escopo original: FL2 e FL3 com dado real (trecho "Painéis do fluxo (FL1, FL2, FL3)"); motivo: decisão do dono de priorizar as operacionais; consequência: FL2 e FL3 seguem em mock; decisão: "vamos fazer funionar as do bm operacionais so" + "i". Acelerato e sustentação: pedido seguinte.
- DECISÃO DO DONO (2026-10-29): "A" (MCP): o MCP do BusinessMap é só ferramenta do time nesta sessão (consulta ao quadro real no discovery e desenvolvimento; spike K-087 e mapa de campos); o coletor do sistema segue pela API REST. O dono configura o MCP e põe o token ("eu coloco o token"); o Jarvis não toca configuração do Claude Code nem o .env; dado de pessoa vindo do MCP não entra em documento.
- DECISÃO DO DONO (2026-10-29): "por enquanto sera o meu, entao B" (S-1=Q-5): a chave do BusinessMap (MCP e coletor) é a do próprio dono, não de usuário só leitor; risco aceito pelo dono por ora (a chave pode alterar o quadro). Mitigação do time: coletor só GET; no MCP o time usa só ferramentas de leitura, nunca de escrita; troca para usuário de serviço só leitor fica como pendência antes da coleta agendada em produção.
- DECISÃO DO DONO (2026-10-29): "A" (S-3=Q-4): a coleta real roda só na máquina do dono (chave no .env local, banco local); homologação e servidor ficam fora.
- DECISÃO DO DONO (2026-10-29): "B" (Q-8): os responsáveis do card ficam também pelo nome, resolvido por GET /users (fields=user_id,realname), confirmando a decisão de 2026-10-10 ("nomes" nas tabelas analíticas). Consequência: revisão da ADR 0020 (4b) pelo arquiteto e leitura do security-engineer; nomes só em colunas de COLUNAS_PESSOA, fora do GRANT do dspd_api; nenhuma métrica individual.
- DECISÃO DO DONO (2026-10-29): "C" (Q-2): a carga inicial traz os últimos 12 meses; mais antigo pode vir depois (carga retomável).
- DECISÃO DO DONO (2026-10-29): "A" (Q-6, U-1 da ADR 0016): mudança de processo no quadro mede os cartões anteriores "como foi", com marcação T2.6 na data; correção de erro de mapeamento vale para todo o período.
- DECISÃO DO DONO (2026-10-29): "A" (Q-6, U-2 da ADR 0016): card que muda de workflow (time) ou de tipo (granularidade) conta no time e na granularidade do instante do evento medido (entrega para vazão e tempo de ciclo; o dia para WIP e CFD).
- DECISÃO DO DONO (2026-10-29): "A" (Q-7a): janela de calibração confirmada em 60 dias corridos (D3 do 006 deixa de ser provisória).
- DECISÃO DO DONO (2026-10-29): "A" (Q-7b): coleta diária às 06:00; selo vira "Atrasado" se até 12:00 não houver coleta ok (folga de 6 h).
- DECISÃO DO DONO (2026-10-29): "A" (Q-7c, N-5): SLE, alocação acordada, limites de frentes e fichas de resultado vêm de arquivo versionado no repositório, preenchido pela governança (WS6).
- DECISÃO DO DONO (2026-10-29): "B" (P-1): selo "Dados fictícios" por cartão mais nota no cabeçalho do painel com a contagem de cartões ainda fictícios. P-2 (fonte de PV1 e EI) e P-3 (mínimo de 20 nos complementares) saem da fila do dono: o time confere no catálogo e o QA confere cartão a cartão (técnico); P-2 volta ao dono se o catálogo não disser.
- DECISÃO DO DONO (2026-10-29): "A" (P-4): o arquivo exportado leva, por cartão, fonte, "Atualizado em", selo de frescor, "em calibração" e "dados fictícios".
- DECISÃO DO DONO (2026-10-29): "B" (P-5): faixa "Dados de calibração" e selo de frescor continuam visíveis mesmo com todas as métricas da fonte ocultas nas preferências (CA-04).
- DECISÃO DO DONO (2026-10-29): "A" (Q-2b): na carga inicial de 12 meses (Q-2 = C), os cards ainda abertos vêm todos, qualquer que seja a idade; arquivados e descartados só os dos últimos 12 meses.
- DECISÃO DO DONO (2026-10-29): "A" (Q-2c): "arquivados e descartados dos últimos 12 meses" (Q-2b) conta pela data em que o card foi arquivado ou descartado (filtros `archived_from` e `discarded_from`), não pela última modificação.
- DECISÃO DO DONO (2026-10-29): "A" (validação do plano): o plano `docs/architecture/features/052-integracao-businessmap.md` (branch `docs/052-businessmap-discovery`, 00d459c) está validado como está; é o ponto de compromisso do 052.
- ADR 0020 (citada no pedido): proteção de pessoa no coletor; revisada no discovery (item 4b, nomes por GET /users); o review confere que o plano a segue.
- ADR 0022 (citada no pedido): coleta incremental e webhook; passa a vigente nesta etapa (commit da E1.10), com a Q-2c no item 4.
- ADR 0016 (citada no pedido): histórico de dimensões (U-1 e U-2 decididos pelo dono); o review confere que o plano a segue.
- Regras invioláveis do `CLAUDE.md` do projeto: BusinessMap e Acelerato nunca se misturam; nenhuma métrica individual; abaixo de 20 itens não se publica estatística; carga incremental nunca sobrescreve histórico; credenciais só no `.env`; dúvida de regra de negócio vira pergunta ao dono.
- Não ler nem editar o `.env`; não chamar a API do BusinessMap.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook ou check vermelho: pare e relate a mensagem literal, sem rodar de novo o check vermelho.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052 status --short` · espera: linhas=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052 log --format=%b 00d459c2874c16be866fc1113b9953e610235c82..HEAD | grep -c '^Cartão: K-182'` · espera: igual '2'
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052/docs/reviews/052-integracao-businessmap.md`
- PQ-4 (cmd): `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin pnpm run docs:check` rodado na raiz de `/home/rodrigoisensee/MetricasDSPD-052` · espera: rc=0
- PQ-5 (merge): `gh pr list --head docs/052-businessmap-discovery --base develop --state merged --json number --jq length` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com os shas e o número do PR; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
