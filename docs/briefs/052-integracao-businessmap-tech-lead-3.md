Agente destino: forge:tech-lead
Pedido: 052-integracao-businessmap
Tipo: codigo
Branch: docs/052-businessmap-discovery   Base: develop   Base-sha: a6e75433716727edc3256419740f384775290a66
Etapa: codigo   Cobre: E1.9

## Objetivo
Etapa E1.9 do pedido 052 (cartão K-182): gravar e enviar as revisões do discovery feitas com as decisões do dono de 2026-10-29 (E1.6 a E1.8), já escritas na worktree e sem commit, para o dono validar o plano a partir da branch. Worktree `/home/rodrigoisensee/MetricasDSPD-052`, branch `docs/052-businessmap-discovery` (HEAD be1932f8fdb5adbb206528ae10a43f4a5de75bf1).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052 status --short` e o diff dos 9 arquivos modificados.
- Seção de commits de `/home/rodrigoisensee/MetricasDSPD-052/docs/engineering/praticas.md`.

## Entregar
- "E1.9 (tech-lead): commit e push das revisões E1.6 a E1.8 na `docs/052-businessmap-discovery`, com `Cartão: K-182` no corpo, sem PR." (E1.9), com:
  - (E1) Um commit por etapa, com `git add` explícito por caminho: E1.6 = `docs/architecture/features/052-integracao-businessmap.md`, `docs/architecture/adr/0022-coleta-incremental-e-webhook-businessmap.md`, `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`, `docs/architecture/adr/0016-historico-de-dimensoes-scd-tipo-2.md`, `docs/architecture/data-model.md`, `docs/architecture/features/integracao-real.md`, `docs/integracao/businessmap-api-configuracao.md`; E1.7 = `docs/security/052-integracao-businessmap-ameacas.md`; E1.8 = `docs/ux/integracao-real/06-delta-2026-10-29.md`. Mensagens conforme o `praticas.md`, citando o pedido 052, com `Cartão: K-182` no corpo de cada uma.
  - (E1) `pnpm run docs:check` na raiz da worktree antes do push; vermelho: pare e relate, sem corrigir o conteúdo dos documentos (é do autor).
  - (E1) Push com `git -C /home/rodrigoisensee/MetricasDSPD-052 push origin HEAD:refs/heads/docs/052-businessmap-discovery`, depois de conferir `git -C /home/rodrigoisensee/MetricasDSPD-052 branch --show-current`.
- (E2, E3, E4, E5, E6) Nada a entregar aqui: não nesta delegação (coleta, webhook, painel operacional com dado real, itens de segurança K-086, K-088 e K-089 e a ordem WS1 → WS2 → WS3 vêm depois do discovery validado).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-052` e branch `docs/052-businessmap-discovery` a partir da `develop`, sem commit." · etapa de outra delegação; já entregue (worktree e branch em a6e7543)
- "E1.1 (software-architect): atualizar o desenho já feito no pedido 006 (`docs/architecture/features/integracao-real.md`, `docs/integracao/businessmap-api-configuracao.md`, `docs/architecture/data-model.md`) contra o código atual de `server/src/modulos/businessmap` e as ADRs posteriores a 2026-10-11, e escrever o plano técnico da coleta (T2.2) e do webhook (T2.3) em fatias, com o que cada fatia espera do roteiro §7 do dono, em `docs/architecture/features/052-integracao-businessmap.md`, na worktree 052, sem commit." · etapa de outra delegação; já entregue (commit 214696d)
- "E1.2 (security-engineer): atualizar o modelo de ameaças da integração (apikey, allow-list, webhook, coleta agendada) a partir de `docs/security/adr-0020-protecao-de-pessoa.md` e `docs/security/k084-coletor-allow-list.md`, em `docs/security/052-integracao-businessmap-ameacas.md`, na worktree 052, sem commit." · etapa de outra delegação; já entregue (commit 01b9288)
- "E1.3 (ux-designer): conferir a especificação validada `docs/ux/integracao-real/05-especificacao.md` (validação de 2026-10-10) contra os painéis atuais (FL1 a FL3 e as operacionais O19 a O26) e registrar só o que mudou, em `docs/ux/integracao-real/06-delta-2026-10-29.md`, na worktree 052, sem commit." · etapa de outra delegação; já entregue (commit be1932f)
- "E1.4 (dono): apikey do BusinessMap no `.env` e confirmação da WS1." · etapa de outra delegação; continua no pedido (do dono)
- "E1.5 (tech-lead): commit e push dos documentos do discovery (E1.1 a E1.3) na `docs/052-businessmap-discovery`, sem PR; o PR vem depois da validação do dono." · etapa de outra delegação; já entregue (HEAD be1932f no remoto)
- "E1.6 (software-architect): revisar o plano `docs/architecture/features/052-integracao-businessmap.md`, a ADR 0022, a ADR 0020 (item 4b: nomes dos responsáveis por GET /users), a ADR 0016 (U-1 e U-2 decididos), `docs/architecture/data-model.md`, `docs/integracao/businessmap-api-configuracao.md` e `docs/architecture/features/integracao-real.md` com as decisões do dono de 2026-10-29, na worktree 052, sem commit." · etapa de outra delegação; já entregue (sem commit, na worktree), não edite o conteúdo dela
- "E1.7 (security-engineer): revisar `docs/security/052-integracao-businessmap-ameacas.md` com as decisões do dono de 2026-10-29 (chave do dono, coleta só na máquina do dono, nomes por GET /users), na worktree 052, sem commit." · etapa de outra delegação; já entregue (sem commit, na worktree), não edite o conteúdo dela
- "E1.8 (ux-designer): revisar `docs/ux/integracao-real/06-delta-2026-10-29.md` com as decisões do dono P-1 a P-5 e o escopo só operacional, na worktree 052, sem commit." · etapa de outra delegação; já entregue (sem commit, na worktree), não edite o conteúdo dela
- Código, PR e merge; o quadro e os arquivos de pedido; conteúdo dos documentos (é dos autores); Acelerato e sustentação.

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
- ADR 0020 (citada no pedido): allow-list na fronteira; nenhum id de pessoa, autor nem texto livre nas tabelas `stg_` nem no receptor do webhook (item 1); responsáveis do card só em `dim_card.responsaveis` e `dim_card_versao.responsaveis` (item 4b); `fato_transicao.usuario` removida (R-2 = B). O arquiteto gravou na E1.6 a "Revisão 3 (2026-10-29, pedido 052, E1.6)", só no item 4b, pela decisão Q-8 B; aqui você só grava o commit, sem editar a ADR.
- ADR 0022 (citada no pedido): proposta (polling como fonte de verdade, webhook condicionado, staging negado por padrão); na E1.6 (arquiteto, já entregue) recebeu as decisões Q-2, Q-4, Q-5 e Q-7b; segue proposta até a validação do dono.
- ADR 0016 (citada no pedido): U-1 e U-2 decididos pelo dono (ver as linhas acima); o arquiteto registra na E1.6; o resto não muda.
- Regras invioláveis do `CLAUDE.md` do projeto: BusinessMap e Acelerato nunca se misturam; nenhuma métrica individual; abaixo de 20 itens não se publica estatística; carga incremental nunca sobrescreve histórico; credenciais só no `.env`; dúvida de regra de negócio vira pergunta ao dono, nunca decisão no documento.
- Não ler nem editar o `.env`; não chamar a API do BusinessMap; dado de pessoa vindo do MCP não entra em documento.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052 status --short` · espera: linhas=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052 rev-list --count be1932f8fdb5adbb206528ae10a43f4a5de75bf1..HEAD` · espera: igual '3'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052 log --format=%b be1932f8fdb5adbb206528ae10a43f4a5de75bf1..HEAD | grep -c '^Cartão: K-182'` · espera: igual '3'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052 ls-remote origin refs/heads/docs/052-businessmap-discovery` igual a `git -C /home/rodrigoisensee/MetricasDSPD-052 rev-parse HEAD`
- PQ-5 (cmd): `pnpm run docs:check` rodado na raiz de `/home/rodrigoisensee/MetricasDSPD-052` · espera: rc=0

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com os shas; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
