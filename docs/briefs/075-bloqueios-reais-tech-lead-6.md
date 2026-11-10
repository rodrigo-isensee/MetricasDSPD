Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l1a-contrato   Base: develop   Base-sha: 6754df7ada0199644d3cae52a01d5ade9be907fb
Etapa: merge-integracao   Cobre: E1.9

## Objetivo
Abrir e mesclar na develop (squash) o PR do lote 1a do pedido 075 (K-204): o contrato de BLOQUEADOS, O2 e O19 aceita o 8º motivo "não classificado". Código em 5f51fdcd72e9962e6fcbd3b63e41038cb73c8785; review (4947dae6a877665a02d7911c73b7b4af7ccef3be), segurança (e6416c5f974d3cf253279bccfc1b2929885bf875) e QA (165d23c0b4313c1f88ebedb06e97ba5437b963e6) aprovados. O lote 1b e o 5a esperam este merge. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/075-l1a-contrato`; ainda não há PR.

## Ler
- docs/pedidos/075-bloqueios-reais.md: só `## Etapas` e, do `## Histórico`, as linhas de 12:16, 12:17, 12:28, 13:07 e 13:09.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`: só a seção "Lote 1a" (o que o corpo do PR precisa levar).
- Na branch: `docs/reviews/075-l1a-contrato.md`, `docs/security/075-l1a-contrato.md` e `docs/qa/075-l1a-contrato.md` (só o veredito e os achados).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9)
- (E1) (E1.9) `git -C /home/rodrigoisensee/MetricasDSPD-052h pull --ff-only origin feature/075-l1a-contrato`; `forge-check pr 075-bloqueios-reais --ref origin/feature/075-l1a-contrato --base origin/develop` limpo (pareceres em dia no head); se a develop andou e o PR pedir, `gh pr update-branch`.
- (E1) (E1.9) Abrir o PR para a `develop` (`gh pr create --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/075-l1a-contrato --title ... --body-file <arquivo>`, corpo escrito pela ferramenta Write num arquivo de `$TMPDIR/tech-lead-075/`), com o que a seção Lote 1a do plano pede: as entradas de aceite usadas e removidas, a linha do checklist `contrato: incompatível (valor novo de enum na resposta; aceite em aceitas.json)`, a conferência de que nenhum `switch` ou `Record<MotivoBloqueio, ...>` do `web` é exaustivo, o ajuste de `estado.ts` (DECISÃO TÉCNICA de 12:17), os três pareceres com veredito e o A1 do QA como recomendado; `Cartão: K-204`.
- (E1) (E1.9) Esperar todos os checks do PR concluídos e verdes no head, por chamadas curtas com pausa (decida pelo estado de cada check, não pelo código de saída do `gh pr checks`), e mesclar por squash (`gh pr merge --squash`). Se o sandbox, um hook ou a proteção da branch barrar o merge, pare, relate a mensagem literal e deixe o PR pronto para o dono mesclar.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E4) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- 2026-11-06 12:17: DECISÃO TÉCNICA (Jarvis): estado.ts (+2 -2, tipo de bloqueioAberto.motivo) entra no lote 1a como ajuste mínimo de tipo que o tsc exige (o plano não o listava); a seção Lote 1a de docs/analises/075-plano.md lista comum.ts, schemas.ts, tambem.ts e modelo.ts.
- 2026-11-06 13:07: E1.8 do lote 1a entregue pelo qa-engineer: docs/qa/075-l1a-contrato.md aprovado, sem bug (165d23c0b4313c1f88ebedb06e97ba5437b963e6, enviado). DECISÃO TÉCNICA (Jarvis): conferência da entrega agora; depois, PR do lote 1a com o tech-lead (E1.9); o A1 fica como recomendado no PR, sem cartão.
- ADR 0020 (citada no pedido): proteção de pessoa no coletor; nesta entrega só o CA-075-11 (nenhuma chave de pessoa no contrato), já aprovado.
- ADR 0022 (citada no pedido): não se aplica a este lote (sem tabela nem coleta nova).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Push ou pre-push com mais de 15 minutos está preso: pare e relate.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, os pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`; a develop só muda pelo merge do PR. Não apagar branch nem worktree depois do merge (a limpeza é do dono).

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; feita
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; feita
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; feita
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; feita no lote 1a
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; feita no lote 1a
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; feita no lote 1a
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; feita
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; feita
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; feita
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; feita
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l1a-contrato --state all --json number,state` com o número do PR aberto para a develop.
- PQ-2 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l1a-contrato --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
