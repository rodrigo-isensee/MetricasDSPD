Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l5a-tela   Base: develop   Base-sha: da61dbc2318e23db7e848c8702591522a6700aad
Etapa: merge-integracao   Cobre: E1.9

## Objetivo
Abrir e mesclar na develop (squash) o PR do lote 5a do pedido 075 (K-204): a tela mostra o motivo "não classificado" em BLOQUEADOS, na coluna "Bloqueado" do O2 e no O19, com o caso E2E do axe. Código e teste em 09a2d16c6de02f6ee6f95fba02e44de9bcf34bbc; review (d7798cdc8a2c940f037f90d084674efd408bef56), revisão de interface (docs/ux/075-revisao-l5a.md) e QA (3a5108248665716d467ed6df13dbe22959282fcb) aprovados. Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/075-l5a-tela`; ainda não há PR.

## Ler
- docs/pedidos/075-bloqueios-reais.md: só `## Etapas` e, do `## Histórico`, as linhas do review do delta do 5a, da conferência da volta do QA do 5a e do parecer do QA do 5a (2026-11-07).
- Na branch: `docs/reviews/075-l5a-tela.md` (veredito, achados e a linha de teto), `docs/ux/075-revisao-l5a.md` e `docs/qa/075-l5a-tela.md` (só o veredito e os achados).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9)
- (E1) (E1.9) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/075-l5a-tela`; `forge-check pr 075-bloqueios-reais --ref origin/feature/075-l5a-tela --base origin/develop` limpo (pareceres em dia no head); a develop andou: se o PR pedir (BEHIND), `gh pr update-branch feature/075-l5a-tela --repo rodrigo-isensee/MetricasDSPD` e o forge-check pr de novo no head novo.
- (E1) (E1.9) Abrir o PR para a `develop` (`gh pr create --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/075-l5a-tela --title ... --body-file <arquivo>`, corpo escrito pela ferramenta Write num arquivo de caminho literal), com o resumo do 5a, `contrato: sem mudança`, a linha de teto copiada do parecer do review, as exceções aceitas (médio 2 da UX, teto), os pareceres com veredito, os recomendados como pendência (review A3 a A5, QA A1) e `Cartão: K-204`.
- (E1) (E1.9) Esperar todos os checks do PR concluídos e verdes no head, por chamadas curtas (decida pelo estado de cada check), com o job e2e EXECUTADO e verde (é a prova de CI do axe do caso E2E novo; se ele vier pulado, pare e relate, sem mesclar); mesclar por squash com `gh pr merge feature/075-l5a-tela --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head>`, pelo nome da branch e cada comando sozinho na chamada (sem pipe nem variável). Se o hook R-REVIEW recusar por tempo, espere 1 minuto e tente mais uma vez; recusou de novo, ou se o sandbox, outro hook ou a proteção da branch barrar, pare, relate a mensagem literal e deixe o PR pronto para o dono.
- (E4) O O19 com "não classificado" é a parte do E4 (P-075-8) neste lote; entra com o merge.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-07 00:02: DECISÃO TÉCNICA (Jarvis): a prova do axe vem da CI do PR do 5a (o PR roda e2e) e o PR do 5a só mescla com o e2e verde.
- 2026-11-06 14:20: DECISÃO TÉCNICA (Jarvis): opção B do E3.5: a distribuição por motivo sai do O2 e fica só no O19.
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
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; feita no lote 5a
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; feita no lote 5a
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; feita no lote 5a
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; feita
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; feita
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; feita
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; feita
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; feita
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; feita
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l5a-tela --state all --json number,state` com o número do PR aberto para a develop.
- PQ-2 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l5a-tela --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
