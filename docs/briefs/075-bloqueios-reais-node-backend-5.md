Agente destino: forge:node-backend
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l2a-derivador   Base: develop   Base-sha: d1f22008a43447c11d174973d7b150c84b455614
Etapa: codigo   Cobre: E1.4

## Objetivo
Lote 2a do plano dos bloqueios reais (K-204): o derivador puro que, das versões de um card no `stg_card`, deriva os eventos de início e fim de bloqueio pela via A (decisões do dono P-075-1, P-075-2, P-075-3b e P-075-10), mais a ADR curta da regra de derivação (DECISÃO TÉCNICA de 11:28) (pedido 075, E1.4). Worktree `/home/rodrigoisensee/MetricasDSPD-052f` (livre: a branch dela, `feature/075-l3-motivo-dominio`, já foi mesclada pelo PR 246), branch nova `feature/075-l2a-derivador` a partir de `origin/develop` (d1f22008a43447c11d174973d7b150c84b455614).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`: só as seções `## Lote 2a` e `## 8.` (o item da ADR da regra de derivação).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-desenho.md`: só a regra R5 (primeira versão já bloqueada).
- Na worktree: `server/src/modulos/businessmap/staging.ts` (forma das versões do `stg_card`), `docs/architecture/adr/0028-simulado-por-cartao.md` (só como molde de cabeçalho de ADR).

## Entregar
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." (E1.4) Nesta delegação, só o lote 2a; os outros lotes vêm em delegações seguintes da mesma etapa.
- (E1) (E1.4) Preparar a worktree: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052f status --short` vazio, depois `git -C /home/rodrigoisensee/MetricasDSPD-052f switch -c feature/075-l2a-derivador d1f22008a43447c11d174973d7b150c84b455614` e `pnpm install --frozen-lockfile` nela (não apagar a branch antiga). Implementar o Lote 2a como o plano descreve: novo `server/src/modulos/businessmap/bloqueios.ts` com a função pura `derivarBloqueios(versoes, marcos, mapaCampos)`, sem banco nem relógio, que só abre e fecha por `is_blocked` (falso para verdadeiro, ou primeira versão já bloqueada, abre no `coletado_em` da versão; verdadeiro para falso fecha no `coletado_em`); troca de `block_reason_id` com o card bloqueado não gera evento e o `motivo_codigo` do início é o `block_reason_id` da versão que abriu; `motivo_codigo` validado por `^\d{1,10}$`, nulo, ausente ou fora do padrão vira `null` com nota `motivo_codigo_invalido`, nunca o valor lido; nenhuma tradução para os 7; `id_origem` = hash determinístico de (`card_id`, `coletado_em` da versão que abriu), nunca de texto, e o `fim` usa o mesmo `id_origem`; marcos de saída e fornecedor ficam para o 2b. Testes de unidade da seção do plano (abre, fecha, reabre com dois `id_origem`, troca de motivo sem evento, primeira versão bloqueada, versões repetidas, `reason_id` numérico, nulo, ausente, não numérico e com 11 dígitos, CA-075-2, fixture com `label`, `comment` e `user_id` marcadores que não aparecem na saída, CA-075-1). ADR curta em `docs/architecture/adr/0029-derivacao-de-bloqueio-por-comparacao.md`, estado proposta, registrando a via A, o evento com o código da fonte e a tradução na projeção (lote 4b), com as decisões P-075-1, P-075-2, P-075-3b e P-075-10 citadas pelo ID. Teto 150 linhas de código e teste (a ADR fora do teto); eslint, tsc e `pnpm run docs:check` verdes; commit com `Cartão: K-204` (mensagem gravada por Write num arquivo de caminho literal e `git commit -F`), `git add` explícito por caminho; conferir `git branch --show-current` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/075-l2a-derivador`; push ou pre-push com mais de 15 minutos está preso: pare e relate; esperar a CI do push por chamadas curtas e relatar o resultado; sem PR.
- (E4) Nada a entregar aqui: o O19 já veio nos lotes 1a, 1b e 5a; não nesta delegação.
- (E2, E3, E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-1): a via A: o bloqueio vem da comparação entre coletas do que já chega ao stg_card (is_blocked, block_reason_id, current_block_time), sem dado novo da fonte; perde bloqueio curto e o passado anterior à primeira coleta.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-2): início e fim do bloqueio = instante da coleta que viu a mudança.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-4): o fornecedor do bloqueio é o do card no início do bloqueio.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-5): card arquivado, descartado ou entregue ainda bloqueado: o bloqueio fecha nesse instante.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-6): O5 e a série do O1 voltam já com o histórico parcial, marcados nos gráficos (T2.6), respeitando o mínimo de 20 itens.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-7): a coleta do BusinessMap passa a ter agenda diária (depois da VM).
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-8): O19, T10 e T12 entram no mapa real neste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO (literal "faca as recomendacoes", resposta às P-075-9 a P-075-12): as quatro recomendações do Jarvis.
- 2026-11-06 11:28: DECISÃO DO DONO: "A" (P-075-9, pela recomendação): fim antes do início observado vira fim = início (duração 0; o bloqueio conta).
- 2026-11-06 11:28: DECISÃO DO DONO: "A" (P-075-10, pela recomendação): com troca de motivo no mesmo bloqueio, vale o motivo do início.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-11, pela recomendação): o T10 espera o campo fornecedor no mapa de campos (WS1); o lote 7 sai deste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-12, pela recomendação): o T12 espera a WS1 preencher a área solicitante; o lote 8 sai deste pedido. ESCOPO- (dono): o T10 e o T12 da E4 (P-075-8) ficam para depois da WS1; o O19 continua.
### Dos pedidos de que este depende (064, 065), literais
- (064) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- (064) 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- (064) 2026-11-04 14:11: DECISÃO DO DONO "B" (S8): contar só os incidentes com resposta; abaixo de 20 não publica. DECISÃO TÉCNICA (Jarvis): vira o pedido 066 (implementar).
- (064) 2026-11-04 14:13: DECISÃO DO DONO "Atipico acima de 10 horas" (L6): o dia atípico passa a acima de 10 h. DECISÃO TÉCNICA (Jarvis): vira o pedido 067 (implementar); os outros limites seguem provisórios até o dono dizer o contrário (suposição no recibo).
- (065) DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- (065) DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- (065) DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- Nota do Jarvis: as do 064 sobre S8 e dia atípico não tocam esta entrega; as do 065 valem "até a coleta gravar bloqueios" e este pedido é essa parte B.
- ADR 0020 (citada no pedido; leia na develop): a revisão 5 dela é a condição da via B, que o dono não escolheu; nada nesta entrega.
- ADR 0022 (citada no pedido; leia na develop): o item 3 nega o stg_bloqueio por padrão; a via A não o usa; nada nesta entrega.
- 2026-11-06 11:47: Plano corrigido pelo software-architect (docs/analises/075-plano.md, sem commit; tabela §0 liga achado a trecho): lotes de até 150 linhas e um comportamento (1a/1b, 2a/2b, 3, 4a/4b/4c, 5a/5b, 6a/6b, 9a/9b); 1a e 9b incompatíveis com entrada em aceitas.json; evt_bloqueio guarda o reason_id e fato_bloqueio aplica o mapa na projeção (o mapa preenchido depois reclassifica o passado); P-075-9 a 12 decididas, T10 e T12 fora, pendências na §5; recomendados todos aplicados. Ponto aberto TL-A7: de qual checkout roda a projeção real. DECISÃO TÉCNICA (Jarvis): pela decisão do dono de 10:29 ("faça tudo por aqui"), a projeção real roda no ambiente local a partir da worktree da main (pedido 076), então a release que leva os lotes à main vem antes da prova do lote 6b; o tech-lead confirma os bloqueantes do plano (E3.3) e o lote 1a começa depois.
- 2026-11-06 11:50: E3.3 confirmada pelo tech-lead: docs/analises/075-plano-revisao-tech-lead.md, aprovado com ressalvas, A1 a A8 resolvidos; regra de reabertura do TL-A5 aceita sem pergunta ao dono; recomendados novos A9 (lote 2b: card arquivado ou entregue que segue bloqueado não abre bloqueio novo, com teste), A10 (lotes 4a, 5b e 9a sem margem no teto), A11 (lote 4b: VERSAO_PROJETOR sobe para bm-f4/3?). Desenho técnico fechado. DECISÃO TÉCNICA (Jarvis): o lote 1a começa com o node-backend; os recomendados A9 a A11 entram nos briefs dos lotes 2b, 4a, 4b, 5b e 9a.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers (regra de recursos do dono, KANBAN.md, 2026-11-03 13:48).
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`; o npm, de `registry.npmjs.org`. R-VERIFY: nunca `--no-verify` nem `--force`.
- 2026-11-06 13:00: Retomada do Jarvis em sessão nova (a anterior perdeu o controle remoto). DECISÃO TÉCNICA (Jarvis): push simples dos dois commits dos pareceres do lote 1a, com limite de 15 minutos; em paralelo, QA do lote 1a (E1.8) e o lote 3 com o node-backend (E1.4, independente do 1a, branch feature/075-l3-motivo-dominio a partir da develop, pela ordem do plano §7 que permite o 3 antes do 2a); o 1b espera o 1a mesclado na develop.

- 2026-11-06 14:15: Lote 1b entregue pelo node-backend: feature/075-l1b-leitura (worktree 052e) em 0af840f66c10d7136766800eacf025f055c0856f, CI do push verde (run 42258362444), 2 commits, cerca de 30 linhas: bloqueioDe em mapa.ts devolve "não classificado" para motivo fora dos 7 (nunca o texto lido); o O19 fica em packages/metricas/src/businessmap/o19.ts (não em server/, como o brief supunha) e itera MOTIVOS_BLOQUEIO_PUBLICADOS com "não classificado" por último; 4 testes que contavam 7 motivos passaram a 8 (o de metricas.test.ts só apareceu na CI do primeiro push); contratos e businessmap sem diff. DECISÃO TÉCNICA (Jarvis): conferências do merge do PR 246 e da entrega do 1b em paralelo; depois review (tech-lead) e segurança (controle 2, leitura de projeção) do 1b; o node-backend segue para o lote 2a (derivador puro) a partir da develop d1f22008.
- NÃO tocar: `allow-list.ts` e `coleta.ts` (o parecer de segurança confere que não mudaram), o projetor (lote 4), o domínio do lote 3, a leitura do 1b, o contrato, a tela, as ADRs existentes, o `CLAUDE.md`, os arquivos `.env*`, a branch antiga `feature/075-l3-motivo-dominio` (não apagar), outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido


## Pronto quando
- PQ-1 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/075-l2a-derivador --event push --limit 1 --json conclusion` · espera: contém '"success"'
- PQ-2 (push): `git ls-remote origin refs/heads/feature/075-l2a-derivador` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052f rev-parse HEAD`)
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --name-only d1f22008a43447c11d174973d7b150c84b455614 -- server/src/modulos/businessmap/allow-list.ts server/src/modulos/businessmap/coleta.ts packages/contratos` · espera: linhas=0
- PQ-4 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052f/docs/architecture/adr/0029-derivacao-de-bloqueio-por-comparacao.md`

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
