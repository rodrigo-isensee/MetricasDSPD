Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l3-motivo-dominio   Base: develop   Base-sha: c5a4728e5afb92df1fab2ba2c0dce35892d6ead0
Etapa: merge-integracao   Cobre: E1.9

## Objetivo
Abrir e mesclar na develop (squash) o PR do lote 3 do pedido 075 (K-204): o `bm:ref-sync` carrega o domínio `motivo_bloqueio` do arquivo de referência, hoje vazio. Código em 86f6dbb7c63ee3968482dc69092c68bce5c3c5b8; segurança (1dd75ff7d8215e786db0970c645c889d79d93d18), review (75375d91efadf6a168e209660f87614d5171b171) e QA (c54f74be729491590110da00fe225a0e810cc582) aprovados. O lote 4b usa a leitura deste lote. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/075-l3-motivo-dominio`; ainda não há PR.

## Ler
- docs/pedidos/075-bloqueios-reais.md: só `## Etapas` e, do `## Histórico`, as linhas de 13:19, 13:27, 13:39 e 13:53.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`: só a seção "Lote 3".
- Na branch: `docs/reviews/075-l3-motivo-dominio.md`, `docs/security/075-l3-motivo-dominio.md` e `docs/qa/075-l3-motivo-dominio.md` (só o veredito e os achados).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9)
- (E1) (E1.9) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/075-l3-motivo-dominio`; `forge-check pr 075-bloqueios-reais --ref origin/feature/075-l3-motivo-dominio --base origin/develop` limpo (pareceres em dia no head); se a develop andou e o PR pedir, `gh pr update-branch feature/075-l3-motivo-dominio --repo rodrigo-isensee/MetricasDSPD`.
- (E1) (E1.9) Abrir o PR para a `develop` (`gh pr create --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/075-l3-motivo-dominio --title ... --body-file <arquivo>`, corpo escrito pela ferramenta Write num arquivo de caminho literal), com o resumo do lote 3 (campo `motivo_bloqueio`, lista vazia e `regra` no `businessmap-dominio.json`, `motivosDeLinhas` para o projetor), a linha `contrato: sem mudança`, os três pareceres com veredito e os A1 recomendados (comentário de `listasDoArquivo`; `.pg` com dois `reason_id` para o mesmo motivo) como pendência do lote 4b; `Cartão: K-204`.
- (E1) (E1.9) Esperar todos os checks do PR concluídos e verdes no head, por chamadas curtas com pausa (decida pelo estado de cada check, não pelo código de saída do `gh pr checks`), e mesclar por squash (`gh pr merge feature/075-l3-motivo-dominio --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head>`, pelo nome da branch). Se o sandbox, um hook ou a proteção da branch barrar o merge, pare, relate a mensagem literal e deixe o PR pronto para o dono mesclar.
- (E2) Nada a entregar aqui: não nesta delegação.
- (E3) Nada a entregar aqui: não nesta delegação.
- (E4) Nada a entregar aqui: não nesta delegação.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- 2026-11-06 13:39: E1.6 do lote 3 entregue pelo tech-lead: docs/reviews/075-l3-motivo-dominio.md aprovado em 86f6dbb (75375d91, enviado): aderente ao plano; vários reason_id por motivo e recusa de repetido corretos; 112 linhas; A1 recomendado (comentário de listasDoArquivo não cita motivo_bloqueio, corrigir no lote 4b). DECISÃO TÉCNICA (Jarvis): conferência da entrega agora; depois QA do lote 3 (E1.8); os A1 do review e da segurança ficam recomendados para o lote 4b. Lote 5a delegado ao react-frontend (brief react-frontend-1 aprovado na rodada 2).
- 2026-11-06 13:53: E1.8 do lote 3 entregue pelo qa-engineer: docs/qa/075-l3-motivo-dominio.md aprovado, sem bug (c54f74be729491590110da00fe225a0e810cc582, enviado): 57 de 57 testes; vermelho na base 5 caem; 7 mutantes manuais mortos; .pg provado pela CI do 86f6dbb7 (job banco); A1 recomendado igual ao da segurança (.pg com dois reason_id para o mesmo motivo), para o lote 4b. DECISÃO TÉCNICA (Jarvis): conferência da entrega agora; depois PR e merge do lote 3 com o tech-lead (E1.9, etapa merge-integracao).
- ADR 0020 (citada no pedido): proteção de pessoa no coletor; nesta entrega só o CA-075-3 (rótulo vindo de pessoas fechado nos 7), já aprovado.
- ADR 0022 (citada no pedido): não se aplica a este lote (usa o ref_dominio existente, sem tabela nem coleta nova).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Push ou pre-push com mais de 15 minutos está preso: pare e relate.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, os pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`; a develop só muda pelo merge do PR. Não apagar branch nem worktree depois do merge (a limpeza é do dono).

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; feita
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; feita
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; feita
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; feita no lote 3
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; feita no lote 3
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; feita no lote 3
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; feita
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; feita
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; feita
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; feita
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l3-motivo-dominio --state all --json number,state` com o número do PR aberto para a develop.
- PQ-2 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l3-motivo-dominio --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
