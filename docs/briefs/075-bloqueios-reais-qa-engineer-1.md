Agente destino: forge:qa-engineer
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l1a-contrato   Base: develop   Base-sha: 6754df7ada0199644d3cae52a01d5ade9be907fb
Etapa: qa   Cobre: E1.8

## Objetivo
QA do lote 1a do pedido 075 (cartão K-204): o contrato de BLOQUEADOS, O2 e O19 aceita o 8º valor de motivo "não classificado". Review e segurança aprovados; o PR só sai depois do seu parecer. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/075-l1a-contrato`, código em 5f51fdcd72e9962e6fcbd3b63e41038cb73c8785, head com os pareceres em e6416c5f974d3cf253279bccfc1b2929885bf875.

## Ler
- docs/pedidos/075-bloqueios-reais.md: só `## Escopo`, `## Etapas` e, do `## Histórico`, as linhas de 12:16, 12:17 e 12:28.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`: só a seção "Lote 1a" e o item QA da seção 7.
- Na worktree: `docs/reviews/075-l1a-contrato.md` e `docs/security/075-l1a-contrato.md`; o diff `git -C /home/rodrigoisensee/MetricasDSPD-052h diff 6754df7ada0199644d3cae52a01d5ade9be907fb...5f51fdcd72e9962e6fcbd3b63e41038cb73c8785 --stat` e os arquivos de teste novos dele.

## Entregar
- "E1.8 (qa-engineer): QA por lote." (E1.8)
- (E1) (E1.8) Conferir o lote 1a contra o plano: os 8 motivos aceitos e um nono recusado nos schemas de BLOQUEADOS, O2 e O19; CA-075-11 (nenhuma chave com segmento de pessoa nos schemas); os 7 motivos do briefing intactos; `aceitas.json` sem diferença contra a base (`git diff 6754df7ada0199644d3cae52a01d5ade9be907fb...HEAD -- docs/contratos/snapshots/aceitas.json` vazio); o `web` compila.
- (E1) (E1.8) Rodar, com no máximo 2 workers, a suíte do pacote `packages/contratos` e o typecheck do `web`; conferir a CI do push no head do código (`gh run list --branch feature/075-l1a-contrato --event push --limit 3 --json headSha,conclusion`), que prova `docs:check` e `openapi:verificar`; se a run do head e6416c5f ainda estiver rodando, use a do 5f51fdcd e diga isso no parecer.
- (E1) (E1.8) Escrever o parecer `docs/qa/075-l1a-contrato.md` pela ferramenta Write, com `commit: 5f51fdcd72e9962e6fcbd3b63e41038cb73c8785`, veredito (aprovado ou reprovado) e o bloco `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-204` (mensagem por arquivo e `git commit -F`, `git add` explícito pelo caminho); conferir `git branch --show-current` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/075-l1a-contrato`; sem PR. O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres. Push ou pre-push com mais de 15 minutos está preso: pare e relate.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E4) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- 2026-11-06 12:17: DECISÃO TÉCNICA (Jarvis): estado.ts (+2 -2, tipo de bloqueioAberto.motivo) entra no lote 1a como ajuste mínimo de tipo que o tsc exige (o plano não o listava); a seção Lote 1a de docs/analises/075-plano.md lista comum.ts, schemas.ts, tambem.ts e modelo.ts.
- ADR 0020 (citada no pedido): proteção de pessoa no coletor; aqui só vale que nenhum campo de pessoa entra no contrato (CA-075-11).
- ADR 0022 (citada no pedido): não se aplica a este lote (o lote não cria tabela nem coleta dado novo).
- Recursos: uma tarefa pesada por vez, no máximo 2 workers de teste; MemAvailable acima de 3000 MB e load abaixo de 4 antes da suíte (KANBAN.md, "Recursos (dono, 2026-11-03 13:48)").
- NÃO tocar: código, testes do lote, `aceitas.json`, `KANBAN.md`, os pedidos, outras worktrees, `develop`, `homolog` e `main`. Defeito achado vira achado no parecer, não correção.

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
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; feita no lote 1a
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; feita no lote 1a
- "E1.9 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052h/docs/qa/075-l1a-contrato.md`
- PQ-2 (cmd): `grep -c '^commit: 5f51fdcd72e9962e6fcbd3b63e41038cb73c8785' /home/rodrigoisensee/MetricasDSPD-052h/docs/qa/075-l1a-contrato.md` · espera: igual '1'
- PQ-3 (push): `git ls-remote origin refs/heads/feature/075-l1a-contrato` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052h rev-parse HEAD`)
- PQ-4 (sha): o sha40 do commit do parecer.

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
