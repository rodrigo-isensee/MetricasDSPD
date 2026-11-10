Agente destino: forge:qa-engineer
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l1b-leitura   Base: develop   Base-sha: da61dbc2318e23db7e848c8702591522a6700aad
Etapa: qa   Cobre: E1.8

## Objetivo
QA do lote 1b do pedido 075 (cartão K-204): a leitura publica "não classificado" para motivo fora dos 7 e o O19 lista os 8 motivos publicados. Review e segurança aprovados e conferidos; o PR só sai depois do seu parecer. Worktree `/home/rodrigoisensee/MetricasDSPD-052e`, branch `feature/075-l1b-leitura`, código em 0af840f66c10d7136766800eacf025f055c0856f, head com os pareceres em d6a3d9071fcebb1604f318eedb498dcee609e5c5.

## Ler
- docs/pedidos/075-bloqueios-reais.md: só `## Escopo`, `## Etapas` e, do `## Histórico`, as linhas de 14:15 (lote 1b entregue) e 14:18 (conferência).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`: só a seção "Lote 1b" e o item QA da seção 7.
- Na worktree: `docs/reviews/075-l1b-leitura.md` e `docs/security/075-l1b-leitura.md` (achados recomendados).

## Entregar
- "E1.8 (qa-engineer): QA por lote." (E1.8)
- (E1) (E1.8) Conferir o lote 1b contra o plano: `bloqueioDe` (`server/src/modulos/metricas/mapa.ts`) devolve "não classificado" para motivo desconhecido, vazio e com `MARCADOR-PESSOA-075`, nunca o texto lido; o O19 (`packages/metricas/src/businessmap/o19.ts`) devolve 8 linhas com "não classificado" por último; `t12.ts`, `packages/contratos`, `server/src/modulos/businessmap/allow-list.ts` e `coleta.ts` sem diferença contra a base.
- (E4) (E1.8) O O19 com "não classificado" é a parte do E4 (P-075-8) neste lote: conferir que ele soma o "não classificado" ao total.
- (E1) (E1.8) Rodar, com no máximo 2 workers, só os testes dos arquivos tocados pelo lote (`git -C /home/rodrigoisensee/MetricasDSPD-052e diff --name-only da61dbc2318e23db7e848c8702591522a6700aad 0af840f66c10d7136766800eacf025f055c0856f`); usar a CI do push no head do código (`gh run view 42258362444 --json headSha,conclusion`) como prova da suíte; fazer o vermelho dos testes novos contra a base (cópia em `$TMPDIR/qa-engineer-075-l1b/`), sem mexer na worktree.
- (E1) (E1.8) Escrever o parecer `docs/qa/075-l1b-leitura.md` pela ferramenta Write, com `commit: 0af840f66c10d7136766800eacf025f055c0856f`, veredito (aprovado ou reprovado) e o bloco `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-204` (mensagem gravada por Write num arquivo de caminho literal e `git commit -F`, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052e pull --ff-only origin feature/075-l1b-leitura`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052e rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052e push origin HEAD:refs/heads/feature/075-l1b-leitura`, em primeiro plano; sem PR. O pre-push roda lint e typecheck (1 a 3 minutos) e, com o `forge-check docs`, barra frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres. Push ou pre-push com mais de 15 minutos está preso: pare e relate.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-8): O19, T10 e T12 entram no mapa real neste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-11, pela recomendação): o T10 espera o campo fornecedor no mapa de campos (WS1); o lote 7 sai deste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-12, pela recomendação): o T12 espera a WS1 preencher a área solicitante; o lote 8 sai deste pedido. ESCOPO- (dono): o T10 e o T12 da E4 (P-075-8) ficam para depois da WS1; o O19 continua.
- ADR 0020 (citada no pedido): proteção de pessoa; aqui vale que texto lido da projeção nunca é publicado fora da lista fechada dos motivos (controle 2), por isso o "não classificado".
- ADR 0022 (citada no pedido): não se aplica a este lote (só leitura, sem tabela nem coleta nova).
- ADR 0029 (citada no pedido): derivação de bloqueio por comparação (lote 2a); não se aplica a este lote.
- Recursos: no máximo 2 workers de teste (DECISÃO TÉCNICA do Jarvis, 075, 14:40); no máximo 2 pushes ao mesmo tempo e até 5 agentes em paralelo (DECISÃO DO DONO, 075, 15:08, registrada no KANBAN.md).
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
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052e/docs/qa/075-l1b-leitura.md`
- PQ-2 (cmd): `grep -c '^commit: 0af840f66c10d7136766800eacf025f055c0856f' /home/rodrigoisensee/MetricasDSPD-052e/docs/qa/075-l1b-leitura.md` · espera: igual '1'
- PQ-3 (push): `git ls-remote origin refs/heads/feature/075-l1b-leitura` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052e rev-parse HEAD`)
- PQ-4 (sha): o sha40 do commit do parecer.

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
