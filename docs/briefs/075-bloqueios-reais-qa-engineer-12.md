Agente destino: forge:qa-engineer
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l5b-historico-parcial   Base: develop   Base-sha: c66b5d212adce58ed7e3c9efcd25b7d15fcaf571
Etapa: qa   Cobre: E1.8

## Objetivo
QA do lote 5b do pedido 075 (K-204): histórico parcial na série do O1 (linha "Bloqueados" nula antes do dado real) e no O5, e o texto de precisão do início do bloqueio. Código em caee6f68686c5cf719583f4080670edaee4a4b5c; review e revisão de interface (docs/ux/075-revisao-l5b.md, aprovada com ressalvas) feitos. O PR só sai depois do seu parecer. Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/075-l5b-historico-parcial`.

## Ler
- docs/pedidos/075-bloqueios-reais.md: só `## Escopo`, `## Etapas` e, do `## Histórico`, as linhas da entrega do 5b, da conferência dele, da revisão de interface e do review do 5b (2026-11-07).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/075-bloqueios-reais.md`: CA-6 a CA-9 e CA-11.
- Na worktree: `docs/reviews/075-l5b-historico-parcial.md`; e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/075-revisao-l5b.md` (achados).

## Entregar
- "E1.8 (qa-engineer): QA por lote." (E1.8)
- (E1) (E1.8) Conferir o lote 5b contra a especificação: CA-6 (faixa de histórico parcial no O5 mesmo em amostra insuficiente), CA-7 (série do O1 com faixa e linha na data, trecho anterior sem ponto, nunca zero), CA-8 (faixa do O5 some com a janela toda depois da data), CA-9 (com a divergência aceita na revisão de interface) e CA-11 (texto de precisão com `aria-describedby`); `server/` e `packages/` sem diferença contra a base.
- (E1) (E1.8) Rodar, com no máximo 2 workers, só os testes dos arquivos tocados no `web` (`historico-parcial.test.tsx` e os de `CartaoO1`); usar a CI do push no head do código (`gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/075-l5b-historico-parcial --event push --limit 3 --json headSha,conclusion`) como prova da suíte; fazer o vermelho dos testes novos contra a base (cópia em `/tmp/claude-1000/qa-engineer-075-l5b/`), sem mexer na worktree; o axe de tela fica com o e2e do PR (o filtro da CI do push pula o e2e).
- (E1) (E1.8) Escrever o parecer `docs/qa/075-l5b-historico-parcial.md` pela ferramenta Write (sem editar depois), com `commit: caee6f68686c5cf719583f4080670edaee4a4b5c`, veredito (aprovado ou reprovado) e o bloco `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-204` (mensagem gravada por Write num arquivo do scratchpad, fora do repositório, e `git commit -F`, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/075-l5b-historico-parcial`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052c rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/075-l5b-historico-parcial`, em primeiro plano, com o comando puro (sem pipe nem variável); se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 01:20); sem PR. O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- (E4) Nada a entregar aqui: o O19 já veio no 5a.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-07 01:40: DECISÃO TÉCNICA (Jarvis): a divergência do CA-9 é questão de interface e se decide na revisão de interface (aceita em docs/ux/075-revisao-l5b.md).
- 2026-11-06 14:20: DECISÃO TÉCNICA (Jarvis): opção B do E3.5: a distribuição por motivo sai do O2 e fica só no O19 (docs/analises/075-o2-distribuicao.md).
- 2026-11-06 15:22: DECISÃO TÉCNICA (Jarvis): na leitura do O19, o "não classificado" é citado pelo valor publicado (dias), sem percentual calculado na tela (T2.5).
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-8): O19, T10 e T12 entram no mapa real neste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-11, pela recomendação): o T10 espera o campo fornecedor no mapa de campos (WS1); o lote 7 sai deste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-12, pela recomendação): o T12 espera a WS1 preencher a área solicitante; o lote 8 sai deste pedido. ESCOPO- (dono): o T10 e o T12 da E4 (P-075-8) ficam para depois da WS1; o O19 continua.
- ADR 0020 (citada no pedido): proteção de pessoa; aqui vale que a tela não mostra nenhum campo de pessoa (CA-5).
- ADR 0022 (citada no pedido): não se aplica a este lote de tela.
- ADR 0029 (citada no pedido): derivação de bloqueio por comparação (lote 2a); não se aplica a este lote de tela.
- Recursos: no máximo 2 workers de teste (DECISÃO TÉCNICA do Jarvis, 075, 14:40); regra da noite do dono (075, 2026-11-07 00:07): até 3 agentes e 1 git push por vez, escalonados pelo Jarvis.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. R-VERIFY: nunca `--no-verify` nem `--force`; recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`.
- NÃO tocar: código, testes do lote, o `Barras` compartilhado, os outros pareceres, `KANBAN.md`, os pedidos, outras worktrees, `develop`, `homolog` e `main`.

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
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052c/docs/qa/075-l5b-historico-parcial.md`
- PQ-2 (cmd): `grep -c '^commit: caee6f68686c5cf719583f4080670edaee4a4b5c' /home/rodrigoisensee/MetricasDSPD-052c/docs/qa/075-l5b-historico-parcial.md` · espera: igual '1'
- PQ-3 (push): `git ls-remote origin refs/heads/feature/075-l5b-historico-parcial` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052c rev-parse HEAD`)
- PQ-4 (sha): o sha40 do commit do parecer.

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
