Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l4b-fato-bloqueio   Base: develop   Base-sha: b906f4fa41cdffcd9526a6a382d74d1138797782
Etapa: merge-integracao   Cobre: E1.9

## Objetivo
Mesclar na develop (squash) o PR 266 do lote 4b do pedido 075 (K-204): o projetor do BusinessMap monta `fato_bloqueio` a partir de `evt_bloqueio`. Código, segurança, review e QA aprovados e conferidos (QA 78ef8e68ddf5d81ccf9438ebd1db8e5852cdb6fe). O PR está aberto em rascunho e o dono atualizou a branch (head 3ae2d53d2be8d61573226af64ee1e6f505dd4fba). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/075-l4b-fato-bloqueio`.

## Ler
- docs/pedidos/075-bloqueios-reais.md: só `## Etapas` e, do `## Histórico`, as linhas da entrega, da segurança, do review e do QA do 4b (2026-11-07).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`: só a seção "Lote 4b".
- Na branch: `docs/reviews/075-l4b-fato-bloqueio.md`, `docs/security/075-l4b-fato-bloqueio.md` e `docs/qa/075-l4b-fato-bloqueio.md` (só o veredito e os achados).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9)
- (E1) (E1.9) Pela DECISÃO TÉCNICA de 2026-11-07 12:25 deste pedido: `forge-check pr 075-bloqueios-reais --ref origin/feature/075-l4b-fato-bloqueio --base origin/develop` limpo no head 3ae2d53d2be8d61573226af64ee1e6f505dd4fba; marcar o PR como pronto com `gh pr ready 266 --repo rodrigo-isensee/MetricasDSPD`; esperar todos os checks do PR concluídos e verdes nesse head, por chamadas curtas (decida pelo estado de cada check), e mesclar por squash com `gh pr merge feature/075-l4b-fato-bloqueio --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit 3ae2d53d2be8d61573226af64ee1e6f505dd4fba`, cada comando sozinho na chamada (sem pipe nem variável), com `api.github.com` e `github.com` em `allowed_domains`. Se o head mudar ou o PR ficar BEHIND, não rode o update-branch: pare e relate; se o sandbox, um hook ou a proteção barrar, repita uma vez e, persistindo, pare e relate a mensagem literal. Sem `--admin`. Nenhum commit na branch; não apagar branch nem worktree.
- (E4) Nada a entregar aqui: não nesta delegação.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- ADR 0020 (citada no pedido): proteção de pessoa; nesta entrega, o evento só leva is_blocked, o código do motivo e o instante (CA-075-1), já aprovado.
- ADR 0022 (citada no pedido): o item 3 nega o stg_bloqueio por padrão; a via A não o usa.
- ADR 0004 (citada no pedido; leia na develop): formato dos pareceres e aceite do dono a bug médio ou baixo aberto; o 4b não tem bug aberto.
- ADR 0029 (citada no pedido; em proposta, já na develop pelo PR 248): o estado dela não muda nesta delegação.
- 2026-11-07 10:12: Lote 4b entregue pelo node-backend (node-backend-9): feature/075-l4b-fato-bloqueio em 65859649df7bc4525b94521938fe9bc75150038d, CI do push verde com banco (run 42375310643); 123 linhas; recomendados 1 a 4 todos dentro; performance não medida (sem PostgreSQL local, vai ao review). Desvio declarado: o eslint do projeto proíbe DO UPDATE, então gravou com UPDATE ... IS DISTINCT FROM só do que mudou e INSERT ... ON CONFLICT DO NOTHING (padrão de gravacao.ts). DECISÃO TÉCNICA (Jarvis): aceito o desvio (mesmo efeito, sem afrouxar a regra do eslint); o review confere a equivalência. MELHORIA: o plano pediu DO UPDATE sem olhar a regra do eslint (retrospectiva).
- 2026-11-07 11:41: DECISÃO TÉCNICA (Jarvis): recomendados do review do 4b: A1 (comentários de append-only em projetor.ts) e A2 (teste .pg de bloqueio aberto que fecha depois, atualizado_por_coleta_id só nas linhas mudadas) vão ao lote 4c; A3 (medida do TL-A6) fica com o QA do 4b se houver PostgreSQL local, senão vai ao 4c; o A1 da segurança (CHECK de motivo) vai ao primeiro lote com migração. Próximo: QA do 4b (E1.8), quando o qa-engineer terminar o QA do 077 e a volta do 080.
- 2026-11-07 12:25: DECISÃO TÉCNICA (Jarvis): o head novo do PR 266 (3ae2d53d2be8d61573226af64ee1e6f505dd4fba) é só o merge da develop feito pelo dono, e o forge-check pr segue aprovado nele; o tech-lead marca o PR como pronto (gh pr ready) e mescla por squash preso a esse head quando todos os checks fecharem verdes (brief tech-lead-28).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Push ou pre-push com mais de 15 minutos está preso: pare e relate.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, os pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`; a develop só muda pelo merge do PR. Não apagar branch nem worktree depois do merge (a limpeza é do dono).

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; feita
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; feita
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; feita
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; feita no lote 4b
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; feita no lote 4b
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; feita no lote 4b
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; feita
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; feita
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; feita
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; feita
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; feita
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; feita
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l4b-fato-bloqueio --state all --json number,state` com o número do PR aberto para a develop.
- PQ-2 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l4b-fato-bloqueio --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
