Agente destino: forge:node-backend
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-9b   Base: develop   Base-sha: f4c122f15c05fbf5fea86797c9c348656d11ab36
Etapa: codigo   Cobre: E1.4

## Objetivo
Lote 9b dos bloqueios reais (K-204): com o 9a na develop (PR 320), o contrato perde a nota `bloqueio-sem-dado-real`, que a API não emite desde o 6b. Worktree `/home/rodrigoisensee/MetricasDSPD-056`, branch `feature/075-9b` (a partir da develop f4c122f15c05fbf5fea86797c9c348656d11ab36).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 9b" e a §7.
- `/home/rodrigoisensee/MetricasDSPD-056/docs/contratos/politica-de-mudanca.md` (aceite de mudança incompatível, mesmo fluxo do lote 1a).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/075-revisao-l9a.md`, achado 1 (o O1 com `bloqueados` nulo).

## Entregar
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." (E1.4) Nesta delegação, o lote 9b do plano (contrato), como registrado no Histórico de 13:08.
- (E1) (E1.4) Como o plano manda: `bloqueio-sem-dado-real` sai de `TEXTO_NOTA_CARTAO` e de `NOTA_CARTAO_IDS`; `METRICAS_COM_PARTE_DE_BLOQUEIO`, `MOTIVO_BLOQUEIOS_NAO_COLETADOS` e `MOTIVO_O5_BLOQUEIOS_NAO_COLETADOS` saem de `origem.ts`; `VERSAO_CRITERIO_BLOQUEIO_SEM_DADO_REAL` fica (história, T2.6). Contrato incompatível: entradas em `docs/contratos/snapshots/aceitas.json` copiadas da saída do `docs:check`, com o motivo do plano, gravadas, fotografadas e removidas no mesmo PR (linha do checklist §6 para o corpo do PR). Os casos do 065 que esperavam a nota saem; CA-12 passa a valer só pelo interruptor (teste de unidade com `BLOQUEIOS_COM_DADO_REAL` falso). Se o `bloqueados` nulo do O1 puder sair do contrato neste lote sem quebrar o "nulo nunca vira 0", tire também o ramo "sem dado real" do O1 (achado 1 da UX); se não puder, relate por quê. Rodar `pnpm run pronto` da raiz da worktree. Commits com `Cartão: K-204` e a linha `teto:` na mensagem se passar de 150 linhas (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/075-9b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: packages/contratos/, server/src/, server/tests/, web/src/features/operacional/, docs/contratos/, docs/api/, e2e/

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 075-bloqueios-reais até c166a8738a8bd344c2b9d3c3d78fffc1ddf47073e303a80503f9145ee45b4171 (21 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/075-bloqueios-reais.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0020, ADR 0022, ADR 0029, ADR 0004
- aplicáveis a E1.4 (copiadas literalmente):
- - 2026-11-11 13:08: DECISÃO DO DONO (literal, pedido 093): "A". O 6b fica validado pelas provas já feitas, sem conferência com dado real (risco aceito pelo dono). Libera o lote 9a. DECISÃO TÉCNICA (Jarvis): vale a divisão do plano corrigido (docs/analises/075-plano.md §7): 9a é o lote de tela (react-frontend, E1.5) e 9b o de contrato (node-backend, E1.4, depois do 9a); as listas de lotes das linhas E1.4 e E1.5 deste pedido são anteriores ao plano. Worktree 056 na branch feature/075-9a a partir da develop eac38a64.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 log -1 --format=%B origin/feature/075-9b` · espera: contém 'Cartão: K-204'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
