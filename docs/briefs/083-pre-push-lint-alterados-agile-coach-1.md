estado: nenhum PR para docs/retros-2026-11-09
estado: origin/develop 0 commits à frente do Base-sha
jarvis-recorrente: decisao em 103 briefs codigo (30 dias) · confira: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
jarvis-recorrente: escopo em 57 briefs codigo (30 dias) · confira: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
jarvis-recorrente: forma em 47 briefs codigo (30 dias) · confira: envie a saída de `forge-check brief mensagem` (cabeçalho, caminho e hash; R-BRIEF)
Agente destino: forge:agile-coach
Pedido: 083-pre-push-lint-alterados
Tipo: codigo
Branch: docs/retros-2026-11-09   Base: develop   Base-sha: 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc
Etapa: codigo   Cobre: E1.5

## Objetivo
Retrospectiva curta do pedido 083 (pre-push com lint só nos alterados; PR 268 mesclado pelo dono, com o complemento do typecheck no PR 270) e envio, numa branch nova a partir da develop, das retrospectivas do 079, do 080, do 081 e do 082, que estão só em commits locais da branch `docs/retros-2026-11-07`. Worktree `/home/rodrigoisensee/MetricasDSPD-052h` (livre: o 077 4b já está na develop), branch nova `docs/retros-2026-11-09`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/083-pre-push-lint-alterados.md` (inteiro, curto).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 083.

## Entregar
- "E1.5 (agile-coach): retrospectiva curta." (E1.5)
- (E1) (E1.5) Preparar: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052h status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052h fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052h switch -c docs/retros-2026-11-09 origin/develop`; pela DECISÃO TÉCNICA do Histórico de 2026-11-09 10:19 (copiada em Decisões e restrições), trazer os quatro commits de retrospectiva da branch local `docs/retros-2026-11-07` (os do 081, 080, 079 e 082, que a develop não tem) com `git -C /home/rodrigoisensee/MetricasDSPD-052h cherry-pick origin/develop..docs/retros-2026-11-07` (antes, `git -C /home/rodrigoisensee/MetricasDSPD-052h log --oneline origin/develop..docs/retros-2026-11-07` deve listar 4 commits, cada um só com um arquivo em `docs/retrospectivas/`; se listar outro número, pare e relate; conflito: `git cherry-pick --abort`, pare e relate).
- (E1) (E1.5) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052h/docs/retrospectivas/2026-11-09-083-pre-push-lint-alterados.md`: o que correu bem, o que travou (o hook que recusa edição de `.githooks/` por agente e virou ação do dono; os pushes presos por 40 min antes do typecheck só nos alterados; o guarda do dono que matava pushes como órfãos; o comando de push em segundo plano), retrabalho medido pelas conferências do 083, e as linhas `MELHORIA:` (uma por linha, com o problema observado, a evidência e como medir o efeito), dizendo em cada uma se vai ao Forge ou fica no projeto, sem repetir as das retrospectivas trazidas (cite-as pelo arquivo se forem as mesmas). Commit só desse arquivo, com `git add` explícito pelo caminho e mensagem `docs(retro): retrospectiva do pedido 083 (pre-push com lint só nos alterados)` gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-ac-083.txt` (`git commit -F` com esse caminho literal).
- (E1) (E1.5) Conferir `git -C /home/rodrigoisensee/MetricasDSPD-052h branch --show-current` = `docs/retros-2026-11-09` e enviar em primeiro plano, timeout de 600 s na ferramenta: `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/retros-2026-11-09` (`github.com` em allowed_domains); sem PR (o PR é do tech-lead, em outra delegação).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- - 2026-11-08 20:01: DECISÃO DO DONO (literal): "A" (aplicar a correção 1 do diagnóstico E2.7 do 077: pre-push com lint só nos .ts/.tsx alterados e cache, pulando push só de docs; a CI segue com eslint inteiro). Pedido aberto (Jarvis). Recibo: vou fazer: o devops-engineer muda o pre-push numa branch, com parecer de devops, review, QA e PR para a develop; não vou: mudar CI, typecheck, ambiente nem o guarda; o merge é do dono. DECISÃO TÉCNICA (Jarvis): branch melhoria/083-pre-push-lint na worktree 052e (livre: a integração foi descartada), a partir da develop 54f02c42; depois do merge, cada branch em curso recebe a develop e passa a usar o hook novo.
- - 2026-11-08 20:02: DECISÃO DO DONO (2026-11-08 20:02): recibo confirmado: "A" (a opção A levada ao dono descrevia o que se faz: lint só nos arquivos alterados, com cache, CI com o lint inteiro, mudança numa branch com review e PR, merge do dono).
- 2026-11-09 10:19: DECISÃO TÉCNICA (Jarvis): a retrospectiva (E1.5) sai numa branch nova docs/retros-2026-11-09 a partir da develop, na worktree 052h, junto com as do 079, 080, 081 e 082 (commits locais da docs/retros-2026-11-07, trazidos por cherry-pick); a worktree 052e fica como está (staging pendente de operação interrompida). O PR da branch é do tech-lead, em delegação própria.
- O agente não abre, lê nem edita arquivos `.env*`.
- Sem métrica individual: a retrospectiva fala do processo, nunca de pessoa.
- Recusa de hook: pare e relate a mensagem literal, sem contornar. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outros arquivos (o pedido, o quadro e as conferências inclusive), o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees (a 052e inclusive), a branch `docs/retros-2026-11-07` (só leitura), a branch `docs/jarvis-2026-10-23`, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): implementação em `.githooks/pre-push` (e `package.json`, se precisar de script novo), com teste do hook se o projeto já testa scripts, e parecer de devops em docs/devops/." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (push com e sem `.ts` alterado; push só de docs; CI ainda com eslint inteiro)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança (o pre-push é controle local; o forge-check pr exige revisão de segurança)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/MetricasDSPD-052h/docs/retrospectivas/2026-11-09-083-pre-push-lint-alterados.md` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h diff --name-only origin/develop origin/docs/retros-2026-11-09` · espera: linhas=5
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
