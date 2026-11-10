Agente destino: forge:qa-engineer
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l3-motivo-dominio   Base: develop   Base-sha: c5a4728e5afb92df1fab2ba2c0dce35892d6ead0
Etapa: qa   Cobre: E1.8

## Objetivo
QA do lote 3 do pedido 075 (cartão K-204): o `bm:ref-sync` carrega o domínio `motivo_bloqueio` (mapa `reason_id` → um dos 7 motivos) do arquivo de referência, hoje vazio. Review e segurança aprovados; o PR só sai depois do seu parecer. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/075-l3-motivo-dominio`, código em 86f6dbb7c63ee3968482dc69092c68bce5c3c5b8, head com os pareceres em 75375d91.

## Ler
- docs/pedidos/075-bloqueios-reais.md: só `## Escopo`, `## Etapas` e, do `## Histórico`, as linhas de 13:19, 13:27 e 13:39.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`: só a seção "Lote 3" e o item QA da seção 7.
- Na worktree: `docs/reviews/075-l3-motivo-dominio.md` e `docs/security/075-l3-motivo-dominio.md`; o diff `git -C /home/rodrigoisensee/MetricasDSPD-052f diff c5a4728e5afb92df1fab2ba2c0dce35892d6ead0...86f6dbb7c63ee3968482dc69092c68bce5c3c5b8 --stat` e os testes novos dele.

## Entregar
- "E1.8 (qa-engineer): QA por lote." (E1.8)
- (E1) (E1.8) Conferir o lote 3 contra o plano: CA-075-3 (rótulo com `MARCADOR-PESSOA-075`, com `@`, fora dos 7, "não classificado" ou código não numérico recusam a carga inteira, sem o valor na mensagem); arquivo vazio carrega zero linhas; `reason_id` repetido recusado (inclusive `5` e `05`) e vários `reason_id` para o mesmo motivo aceitos; `motivosDeLinhas` descarta código inválido, rótulo fora dos 7 e `reason_id` ambíguo; `allow-list.ts`, `coleta.ts` e `packages/contratos` sem diferença contra a base.
- (E1) (E1.8) Rodar, com no máximo 2 workers, os testes de `dominio-motivo-bloqueio.test.ts` e `dominio-businessmap.test.ts`; o `.pg` não roda sem banco de teste: use a CI do push no head do código (`gh run list --branch feature/075-l3-motivo-dominio --event push --limit 3 --json headSha,conclusion`), que prova o job `banco`, e diga isso no parecer; fazer o vermelho dos testes novos contra a base (cópia em `$TMPDIR/qa-engineer-075/`), sem mexer na worktree.
- (E1) (E1.8) Escrever o parecer `docs/qa/075-l3-motivo-dominio.md` pela ferramenta Write, com `commit: 86f6dbb7c63ee3968482dc69092c68bce5c3c5b8`, veredito (aprovado ou reprovado) e o bloco `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-204` (mensagem gravada por Write num arquivo de caminho literal e `git commit -F`, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/075-l3-motivo-dominio`; conferir `git branch --show-current` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/075-l3-motivo-dominio`; sem PR. O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres. Push ou pre-push com mais de 15 minutos está preso: pare e relate.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E4) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- 2026-11-06 13:39: E1.6 do lote 3 entregue pelo tech-lead: docs/reviews/075-l3-motivo-dominio.md aprovado em 86f6dbb (75375d91, enviado): aderente ao plano; vários reason_id por motivo e recusa de repetido corretos; 112 linhas; A1 recomendado (comentário de listasDoArquivo não cita motivo_bloqueio, corrigir no lote 4b). DECISÃO TÉCNICA (Jarvis): conferência da entrega agora; depois QA do lote 3 (E1.8); os A1 do review e da segurança ficam recomendados para o lote 4b. Lote 5a delegado ao react-frontend (brief react-frontend-1 aprovado na rodada 2).
- ADR 0020 (citada no pedido): proteção de pessoa no coletor; aqui vale que texto vindo de pessoas (rótulo do mapa) nunca entra sem passar pela lista fechada dos 7 (CA-075-3).
- ADR 0022 (citada no pedido): não se aplica a este lote (usa o ref_dominio existente, sem tabela nem coleta nova).
- Recursos: uma tarefa pesada por vez, no máximo 2 workers de teste; MemAvailable acima de 3000 MB e load abaixo de 4 antes da suíte (KANBAN.md, "Recursos (dono, 2026-11-03 13:48)").
- NÃO tocar: código, testes do lote, os outros pareceres, `KANBAN.md`, os pedidos, outras worktrees, `develop`, `homolog` e `main`. Defeito achado vira achado no parecer, não correção.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; feita
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; feita
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; feita
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; feita
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; feita
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; feita
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; feita
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; feita no lote 3
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; feita no lote 3
- "E1.9 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052f/docs/qa/075-l3-motivo-dominio.md`
- PQ-2 (cmd): `grep -c '^commit: 86f6dbb7c63ee3968482dc69092c68bce5c3c5b8' /home/rodrigoisensee/MetricasDSPD-052f/docs/qa/075-l3-motivo-dominio.md` · espera: igual '1'
- PQ-3 (push): `git ls-remote origin refs/heads/feature/075-l3-motivo-dominio` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052f rev-parse HEAD`)
- PQ-4 (sha): o sha40 do commit do parecer.

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
