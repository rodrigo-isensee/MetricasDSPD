Agente destino: forge:qa-engineer
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l4a-evt-bloqueio   Base: develop   Base-sha: 718d46beb4be314dd6d1f1c55454e64e62e4fe7d
Etapa: qa   Cobre: E1.8

## Objetivo
QA do lote 4a do pedido 075 (cartão K-204): o projetor do BusinessMap grava `evt_bloqueio` de forma idempotente (`server/src/modulos/businessmap/projetor.ts`, ajuste em `bloqueios.ts`). Segurança (c228cc7d) e review (d5d693bb) aprovados; o PR só sai depois do seu parecer. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/075-l4a-evt-bloqueio`, código em b44f714aa4216a02b53482b9f8f7538da52e14f2.

## Ler
- docs/pedidos/075-bloqueios-reais.md: só `## Escopo`, `## Etapas` e, do `## Histórico`, as linhas da entrega, da segurança e do review do 4a (2026-11-07).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`: só a seção "Lote 4a" e o item QA da seção 7.
- Na worktree: `docs/reviews/075-l4a-evt-bloqueio.md` e `docs/security/075-l4a-evt-bloqueio.md` (achados).

## Entregar
- "E1.8 (qa-engineer): QA por lote." (E1.8)
- (E1) (E1.8) Conferir o lote 4a contra o plano: reprojeção e coleta repetida com sobreposição de 3600 s não criam linha nova (CA-075-6); card bloqueado depois arquivado e card descartado mantêm os eventos (CA-075-7); UPDATE e DELETE em `evt_bloqueio` negados pelo gatilho (CA-075-8); `limpar-seed` remove só o seed (CA-075-9); motivo-marcador vira nulo com nota por código (CA-075-10); fornecedor só do `bm` (CA-075-12); `motivo_codigo` só dígitos ou nulo; marco de arquivamento limitado à coleta (SEG A1 do 2b) e o teste "arquivado" que mudou de T3 para T2; o CA-075-1 ponta a ponta fica no 4c (não é bug deste lote); `allow-list.ts`, `coleta.ts`, `grants.ts`, `lgpd.ts`, `server/migrations` e `packages/contratos` sem diferença contra a base.
- (E1) (E1.8) Rodar, com no máximo 2 workers, só `server/tests/bloqueios.test.ts` e `server/tests/projetor-businessmap.test.ts`; os `.pg` ficam com a CI do push (`gh run view 42359938014 --repo rodrigo-isensee/MetricasDSPD --json headSha,conclusion`, job banco); fazer o vermelho dos testes novos contra a base (cópia em `/tmp/claude-1000/qa-engineer-075-l4a/`), sem mexer na worktree; mutação à mão se o vermelho só provar a ausência do código.
- (E1) (E1.8) Escrever o parecer `docs/qa/075-l4a-evt-bloqueio.md` pela ferramenta Write (sem editar depois), com `commit: b44f714aa4216a02b53482b9f8f7538da52e14f2`, veredito (aprovado ou reprovado) e o bloco `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-204` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-qa-075-l4a.txt` e `git commit -F` com esse caminho literal, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/075-l4a-evt-bloqueio`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052f rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/075-l4a-evt-bloqueio`, em primeiro plano, com o comando puro (sem pipe nem variável); se o rc não for 0, conferir `git ls-remote` antes de repetir; sem PR. O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres. Push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 01:20).
- (E4) Nada a entregar aqui: não nesta delegação.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-1): a via A: o bloqueio vem da comparação entre coletas do que já chega ao stg_card (is_blocked, block_reason_id, current_block_time), sem dado novo da fonte; perde bloqueio curto e o passado anterior à primeira coleta.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-2): início e fim do bloqueio = instante da coleta que viu a mudança.
- 2026-11-06 11:28: DECISÃO DO DONO: "A" (P-075-10, pela recomendação): com troca de motivo no mesmo bloqueio, vale o motivo do início.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-4): o fornecedor do bloqueio é o do card no início do bloqueio.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-5): card arquivado, descartado ou entregue ainda bloqueado: o bloqueio fecha nesse instante.
- 2026-11-06 11:28: DECISÃO DO DONO: "A" (P-075-9, pela recomendação): fim antes do início observado vira fim = início (duração 0; o bloqueio conta).
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-8): O19, T10 e T12 entram no mapa real neste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-11, pela recomendação): o T10 espera o campo fornecedor no mapa de campos (WS1); o lote 7 sai deste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-12, pela recomendação): o T12 espera a WS1 preencher a área solicitante; o lote 8 sai deste pedido. ESCOPO- (dono): o T10 e o T12 da E4 (P-075-8) ficam para depois da WS1; o O19 continua.
- ADR 0020 (citada no pedido): proteção de pessoa; aqui vale que o evento só leva `is_blocked`, o código do motivo e o instante, nunca texto de pessoa (CA-075-1).
- ADR 0022 (citada no pedido): o item 3 nega o stg_bloqueio por padrão; a via A não o usa.
- ADR 0004 (citada no pedido; leia na develop): formato dos pareceres de QA e aceite do dono a bug médio ou baixo aberto (aceite_usuario).
- ADR 0029 (citada no pedido; em proposta, na develop pelo PR 248): derivação de bloqueio por comparação de versões; este lote completa a derivação com os marcos.
- Recursos: no máximo 2 workers de teste (DECISÃO TÉCNICA do Jarvis, 075, 14:40); regra da noite do dono (075, 2026-11-07 00:07): até 3 agentes e 1 git push por vez, escalonados pelo Jarvis.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. R-VERIFY: nunca `--no-verify` nem `--force`; recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`.
- NÃO tocar: código, testes do lote, os outros pareceres, `KANBAN.md`, os pedidos, outras worktrees, `develop`, `homolog` e `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
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
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052f/docs/qa/075-l4a-evt-bloqueio.md`
- PQ-2 (cmd): `grep -c '^commit: b44f714aa4216a02b53482b9f8f7538da52e14f2' /home/rodrigoisensee/MetricasDSPD-052f/docs/qa/075-l4a-evt-bloqueio.md` · espera: igual '1'
- PQ-3 (push): `git ls-remote origin refs/heads/feature/075-l4a-evt-bloqueio` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052f rev-parse HEAD`)
- PQ-4 (sha): o sha40 do commit do parecer.

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
