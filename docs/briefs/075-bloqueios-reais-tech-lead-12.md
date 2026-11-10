Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l1b-leitura   Base: develop   Base-sha: da61dbc2318e23db7e848c8702591522a6700aad
Etapa: merge-integracao   Cobre: E1.9

## Objetivo
Abrir e mesclar na develop (squash) o PR do lote 1b do pedido 075 (K-204): a leitura publica "não classificado" para motivo fora dos 7 (`bloqueioDe` em `server/src/modulos/metricas/mapa.ts`) e o O19 (`packages/metricas/src/businessmap/o19.ts`) lista os 8 motivos publicados. Código em 0af840f66c10d7136766800eacf025f055c0856f; segurança (543f43ab), review (d6a3d9071fcebb1604f318eedb498dcee609e5c5) e QA (603b3e865355a2b4abcc0aeab9d6b08d0f500fa6) aprovados. Worktree `/home/rodrigoisensee/MetricasDSPD-052e`, branch `feature/075-l1b-leitura`; ainda não há PR.

## Ler
- docs/pedidos/075-bloqueios-reais.md: só `## Etapas` e, do `## Histórico`, as linhas que registram o lote 1b entregue (14:15) e o QA do 1b.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`: só a seção "Lote 1b".
- Na branch: `docs/reviews/075-l1b-leitura.md`, `docs/security/075-l1b-leitura.md` e `docs/qa/075-l1b-leitura.md` (só o veredito e os achados).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9)
- (E1) (E1.9) `git -C /home/rodrigoisensee/MetricasDSPD-052e pull --ff-only origin feature/075-l1b-leitura`; `forge-check pr 075-bloqueios-reais --ref origin/feature/075-l1b-leitura --base origin/develop` limpo (pareceres em dia no head); a develop andou (d1f22008, lote 3): se o PR pedir, `gh pr update-branch feature/075-l1b-leitura --repo rodrigo-isensee/MetricasDSPD`.
- (E1) (E1.9) Abrir o PR para a `develop` (`gh pr create --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/075-l1b-leitura --title ... --body-file <arquivo>`, corpo escrito pela ferramenta Write num arquivo de caminho literal), com o resumo do lote 1b, a linha `contrato: sem mudança`, os três pareceres com veredito e os recomendados (A1: comentário de `o19.ts:12`, do review e do QA; A2 do QA: teste do O19 somando "não classificado" ao total) como pendência de lote seguinte; `Cartão: K-204`.
- (E1) (E1.9) Esperar todos os checks do PR concluídos e verdes no head, por chamadas curtas com pausa (decida pelo estado de cada check, não pelo código de saída do `gh pr checks`), e mesclar por squash (`gh pr merge feature/075-l1b-leitura --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head>`, pelo nome da branch). Se o sandbox, um hook ou a proteção da branch barrar o merge, pare, relate a mensagem literal e deixe o PR pronto para o dono mesclar.
- (E4) O O19 com "não classificado" é a parte do E4 (P-075-8) neste lote; entra com o merge.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- ADR 0020 (citada no pedido): proteção de pessoa; nesta entrega, a defesa de leitura do controle 2 (texto lido nunca publicado fora dos 7), já aprovada.
- ADR 0022 (citada no pedido): não se aplica a este lote (só leitura, sem tabela nem coleta nova).
- ADR 0029 (citada no pedido; em proposta na branch do lote 2a): não se aplica a este lote.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Push ou pre-push com mais de 15 minutos está preso: pare e relate.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, os pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`; a develop só muda pelo merge do PR. Não apagar branch nem worktree depois do merge (a limpeza é do dono).

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; feita
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; feita
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; feita
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; feita no lote 1b
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; feita no lote 1b
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; feita no lote 1b
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; feita
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; feita
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; feita
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; feita
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; feita
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; feita
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l1b-leitura --state all --json number,state` com o número do PR aberto para a develop.
- PQ-2 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l1b-leitura --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
