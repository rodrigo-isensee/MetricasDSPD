Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l4a-evt-bloqueio   Base: develop   Base-sha: 718d46beb4be314dd6d1f1c55454e64e62e4fe7d
Etapa: merge-integracao   Cobre: E1.9

## Objetivo
Mesclar na develop (squash) o PR 260 do lote 4a do pedido 075 (K-204): o projetor do BusinessMap grava `evt_bloqueio` de forma idempotente. Código em b44f714aa4216a02b53482b9f8f7538da52e14f2; segurança (c228cc7db74ad1e379520da2b04b5525c7445b9e), review (d5d693bb72ae4da59fb15567a34118e9baeabf58) e QA (ea39e65fba7c697a24492959280cf86b0942e440) aprovados e conferidos. O PR já está aberto e o dono atualizou a branch (head cb77b8a4031ae19fda74d356a779149736c20473). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/075-l4a-evt-bloqueio`.

## Ler
- docs/pedidos/075-bloqueios-reais.md: só `## Etapas` e, do `## Histórico`, as linhas da entrega, da segurança, do review e do QA do 4a (2026-11-07).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`: só a seção "Lote 4a".
- Na branch: `docs/reviews/075-l4a-evt-bloqueio.md`, `docs/security/075-l4a-evt-bloqueio.md` e `docs/qa/075-l4a-evt-bloqueio.md` (só o veredito e os achados).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9)
- (E1) (E1.9) O PR 260 já existe; o dono atualizou a branch (head cb77b8a4031ae19fda74d356a779149736c20473, merge da develop bc78a3b8, Histórico 09:28). `forge-check pr 075-bloqueios-reais --ref origin/feature/075-l4a-evt-bloqueio --base origin/develop` limpo; esperar todos os checks do PR concluídos e verdes nesse head, por chamadas curtas (decida pelo estado de cada check), e mesclar por squash com `gh pr merge feature/075-l4a-evt-bloqueio --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit cb77b8a4031ae19fda74d356a779149736c20473`, cada comando sozinho na chamada (sem pipe nem variável), com `api.github.com` e `github.com` em `allowed_domains`. Se o head mudar ou o PR ficar BEHIND, não rode o update-branch: pare e relate; se o sandbox, um hook ou a proteção barrar, repita uma vez e, persistindo, pare e relate a mensagem literal. Sem `--admin`. Nenhum commit na branch.
- (E4) Nada a entregar aqui: não nesta delegação.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- ADR 0020 (citada no pedido): proteção de pessoa; nesta entrega, o evento só leva is_blocked, o código do motivo e o instante; segurança aprovada; o CA-075-1 ponta a ponta ficou para o 4c (Histórico, 06:54).
- ADR 0022 (citada no pedido): o item 3 nega o stg_bloqueio por padrão; a via A não o usa.
- ADR 0004 (citada no pedido; leia na develop): formato dos pareceres e aceite do dono a bug médio ou baixo aberto; o 4a não tem bug aberto.
- ADR 0029 (citada no pedido; em proposta nesta branch): entra com o merge no estado em que está (proposta); o estado dela não muda nesta delegação.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Push ou pre-push com mais de 15 minutos está preso: pare e relate.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, os pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`; a develop só muda pelo merge do PR. Não apagar branch nem worktree depois do merge (a limpeza é do dono).

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; feita
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; feita
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; feita
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; feita no lote 4a
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; feita no lote 4a
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; feita no lote 4a
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; feita
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; feita
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; feita
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; feita
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; feita
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; feita
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l4a-evt-bloqueio --state all --json number,state` com o número do PR aberto para a develop.
- PQ-2 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l4a-evt-bloqueio --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
