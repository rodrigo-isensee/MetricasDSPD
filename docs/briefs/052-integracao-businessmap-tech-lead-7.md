Agente destino: forge:tech-lead
Pedido: 052-integracao-businessmap
Tipo: codigo
Branch: feature/052-ws1-estrutura   Base: develop   Base-sha: 9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5
Etapa: codigo   Cobre: E1.14

## Objetivo
Abrir a worktree e a branch do diagnóstico da WS1 (pedido 052, K-185): o node-backend vai escrever ali um script só leitura que lista a estrutura do BusinessMap, que o dono roda na máquina dele (DECISÃO DO DONO "faca a C"). Worktree `/home/rodrigoisensee/MetricasDSPD-052b`, branch `feature/052-ws1-estrutura`, a partir da `develop` em 9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5.

## Ler
- Seção de commits e de branches do `docs/engineering/praticas.md` (nada mais; esta entrega não commita).

## Entregar
- "E1.14 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-052b` e branch `feature/052-ws1-estrutura` a partir da `develop`, com push e `pnpm install --frozen-lockfile`, sem testes (K-185)." (E1.14)
- (E1.14) `git -C /home/rodrigoisensee/MetricasDSPD fetch origin`, depois `git -C /home/rodrigoisensee/MetricasDSPD worktree add /home/rodrigoisensee/MetricasDSPD-052b -b feature/052-ws1-estrutura origin/develop`; confira que o HEAD da worktree é 9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5 (se a develop andou, pare e relate o sha, sem seguir).
- (E1.14) Push da branch nova sem commit: `git -C /home/rodrigoisensee/MetricasDSPD-052b push -u origin HEAD:refs/heads/feature/052-ws1-estrutura`, sem `--force` e sem PR.
- (E1.14) `pnpm install --frozen-lockfile` na raiz da worktree; sem testes, sem suíte, sem commit, sem mexer em arquivo versionado.
- (E2, E3, E4, E5, E6) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).
- (E1.14) Mover cartão: nada (o K-185 já está em Em andamento; o quadro é do Jarvis).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-052` e branch `docs/052-businessmap-discovery` a partir da `develop`, sem commit." · etapa de outra delegação; feita (worktree 052; PR 170 mesclado)
- "E1.1 (software-architect): atualizar o desenho já feito no pedido 006 (`docs/architecture/features/integracao-real.md`, `docs/integracao/businessmap-api-configuracao.md`, `docs/architecture/data-model.md`) contra o código atual de `server/src/modulos/businessmap` e as ADRs posteriores a 2026-10-11, e escrever o plano técnico da coleta (T2.2) e do webhook (T2.3) em fatias, com o que cada fatia espera do roteiro §7 do dono, em `docs/architecture/features/052-integracao-businessmap.md`, na worktree 052, sem commit." · etapa de outra delegação; feita (PR 170 mesclado)
- "E1.2 (security-engineer): atualizar o modelo de ameaças da integração (apikey, allow-list, webhook, coleta agendada) a partir de `docs/security/adr-0020-protecao-de-pessoa.md` e `docs/security/k084-coletor-allow-list.md`, em `docs/security/052-integracao-businessmap-ameacas.md`, na worktree 052, sem commit." · etapa de outra delegação; feita (PR 170 mesclado)
- "E1.3 (ux-designer): conferir a especificação validada `docs/ux/integracao-real/05-especificacao.md` (validação de 2026-10-10) contra os painéis atuais (FL1 a FL3 e as operacionais O19 a O26) e registrar só o que mudou, em `docs/ux/integracao-real/06-delta-2026-10-29.md`, na worktree 052, sem commit." · etapa de outra delegação; feita (PR 170 mesclado)
- "E1.4 (dono): apikey do BusinessMap no `.env` e confirmação da WS1." · etapa de outra delegação; em andamento com o dono (conexão testada; WS1 por confirmar)
- "E1.5 (tech-lead): commit e push dos documentos do discovery (E1.1 a E1.3) na `docs/052-businessmap-discovery`, sem PR; o PR vem depois da validação do dono." · etapa de outra delegação; feita
- "E1.6 (software-architect): revisar o plano `docs/architecture/features/052-integracao-businessmap.md`, a ADR 0022, a ADR 0020 (item 4b: nomes dos responsáveis por GET /users), a ADR 0016 (U-1 e U-2 decididos), `docs/architecture/data-model.md`, `docs/integracao/businessmap-api-configuracao.md` e `docs/architecture/features/integracao-real.md` com as decisões do dono de 2026-10-29, na worktree 052, sem commit." · etapa de outra delegação; feita
- "E1.7 (security-engineer): revisar `docs/security/052-integracao-businessmap-ameacas.md` com as decisões do dono de 2026-10-29 (chave do dono, coleta só na máquina do dono, nomes por GET /users), na worktree 052, sem commit." · etapa de outra delegação; feita
- "E1.8 (ux-designer): revisar `docs/ux/integracao-real/06-delta-2026-10-29.md` com as decisões do dono P-1 a P-5 e o escopo só operacional, na worktree 052, sem commit." · etapa de outra delegação; feita
- "E1.9 (tech-lead): commit e push das revisões E1.6 a E1.8 na `docs/052-businessmap-discovery`, com `Cartão: K-182` no corpo, sem PR." · etapa de outra delegação; feita
- "E1.10 (software-architect): registrar a decisão Q-2c do dono no plano (`docs/architecture/features/052-integracao-businessmap.md`, §7 e §8) e na ADR 0022 (item 4), e marcar o plano como validado pelo dono em 2026-10-29 (frontmatter `estado` do plano e linha `Estado:` da ADR 0022 de proposta para vigente, o valor que o projeto usa), na worktree 052, sem commit." · etapa de outra delegação; feita
- "E1.11 (tech-lead): commit e push da E1.10 na `docs/052-businessmap-discovery` com `Cartão: K-182`; parecer de review do discovery em `docs/reviews/052-integracao-businessmap.md`; PR para a `develop` (squash) e merge com os checks verdes e os pareceres que o `forge-check pr` exigir." · etapa de outra delegação; feita (retomada na E1.13)
- "E1.12 (software-architect): corrigir os achados A1 (bloqueante: a ressalva do spike F1 volta à F1 ou ao §6 do plano, e a referência "(§8)" é trocada), A2 e A3 (recomendados, entram por decisão técnica do time: linhas 14 e 16 do plano sem "proposta"; bloco "Decidido pelo dono" da ADR 0016 depois da linha U-3 da tabela) do review `docs/reviews/052-integracao-businessmap.md` (7fa5116), na worktree 052, sem commit." · etapa de outra delegação; feita
- "E1.13 (tech-lead): depois da E1.12, commit da correção e do parecer de review revisado (bloco `## Achados` no formato que o `forge-check brief gerar --volta` aceita), push, `forge-check pr`, PR para a `develop` (squash) e merge com os checks verdes; retoma a E1.11." · etapa de outra delegação; feita (PR 170 mesclado em 1a6617e)
- "E1.15 (node-backend): script de diagnóstico da WS1, só leitura (K-185, E1): lê `BUSINESSMAP_URL_BASE` e `BUSINESSMAP_APIKEY` do ambiente, faz só GET numa lista fechada de caminhos de estrutura (quadros, workflows, colunas, raias, tipos de card, definições de campos customizados), sem cards, sem usuários e sem a chave em saída ou log, e imprime um relatório em Markdown que o dono roda na máquina dele; testes contra servidor falso; commit e push, sem PR." · etapa de outra delegação; próxima delegação, ao node-backend, depois desta
- "E1.16 (security-engineer): review de segurança do E1.15 (gatilho: segredo e integração externa, R-SEGURANCA), parecer em `docs/security/052-ws1-estrutura.md`." · etapa de outra delegação; depois da E1.15
- "E1.17 (tech-lead): code review do E1.15 em `docs/reviews/052-ws1-estrutura.md`, em paralelo ao E1.16." · etapa de outra delegação; depois da E1.15
- "E1.18 (qa-engineer): parecer de QA do E1.15 em `docs/qa/052-ws1-estrutura.md` (contra servidor falso; o agente não lê o `.env` nem chama o BusinessMap real)." · etapa de outra delegação; depois das E1.16 e E1.17
- "E1.19 (tech-lead): PR da `feature/052-ws1-estrutura` para a `develop` (squash) e merge com os checks verdes e os pareceres em dia." · etapa de outra delegação; depois da E1.18
- "E1.20 (dono): rodar o script na máquina dele e colar a saída, conferida antes, sem nome de pessoa (E1.4, confirmação da WS1)." · etapa de outra delegação; do dono, depois da E1.19
- "E1.21 (software-architect): comparar a saída do E1.20 e a explicação do dono sobre a hierarquia com o plano 052 e o `docs/integracao/businessmap-api-configuracao.md`; o que não bater vira pergunta ao dono." · etapa de outra delegação; depois da E1.20
- Escrever o script, testes ou documentos; abrir PR; tocar outras worktrees; ler ou editar o `.env`; chamar o BusinessMap.

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
- DECISÃO DO DONO (2026-10-30): "faca a C" (pergunta WS1): o time escreve um script só leitura que lista a estrutura do quadro (quadros, colunas, raias, campos customizados; sem cards e sem nomes de pessoa), o dono roda na máquina dele e cola a saída; o time compara com o briefing e mostra o que bate e o que falta. O dono também vai explicar a hierarquia e o funcionamento ("ainda tenho que te mostrar a hierarquia e como as coisas funcionam").
- Erro recorrente deste destino (forge-check, 30 dias): base em 11 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 9 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 5 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- ESCOPO+ (2026-10-30, registrado no pedido): o "faca a C" supera o recibo "WS1 fica fora" só neste ponto; o script de diagnóstico entra como apoio à WS1; a configuração da WS1 segue fora e com as pessoas.
- ADR 0020 (citada no pedido): não é objeto desta entrega (nenhum dado é lido; só worktree e branch).
- ADR 0022 (citada no pedido): não é objeto desta entrega (a coleta não começa aqui).
- ADR 0016 (citada no pedido): não é objeto desta entrega (nenhuma regra de cálculo muda).
- O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook ou de comando: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052b ls-remote origin refs/heads/feature/052-ws1-estrutura` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-052b rev-parse HEAD`
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052b branch --show-current` · espera: igual 'feature/052-ws1-estrutura'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052b rev-parse HEAD` · espera: igual '9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052b status --porcelain` · espera: linhas=0
- PQ-5 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052b/node_modules/.modules.yaml`

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
