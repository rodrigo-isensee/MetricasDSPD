Agente destino: forge:tech-lead
Pedido: 093-release-6b-homolog
Tipo: merge
Branch: origin/homolog   Base: main   Base-sha: 9bb2a5bee0a2af4cf9eee71863da1b662ff25fc1
Etapa: pedido-de-merge-ao-dono   Cobre: E1.7

## Objetivo
Release 093, último degrau: o PR de release da homolog para a main fica aberto para a validação e o merge do dono. A homolog já recebeu a develop pelo PR 313 (lote 6b, bloqueios reais; K-121, K-172, K-263, K-264, K-265, K-266 e K-267; CHANGELOG e pareceres da release).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`, seção do PR de release e do check `homolog-aprovada`.
- Os pareceres `docs/reviews/090-release.md` (novo), `docs/security/090-release.md` (novo) e `docs/qa/090-release.md` (novo), na homolog: ler com `git show` sobre `origin/homolog` na worktree 052h.

## Entregar
- "E1.7 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." (E1.7)
- (E1) (E1.7) Abrir o PR de release da homolog para a main (`--base main --head homolog`; corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-204`; o que entra (lote 6b com os bloqueios reais e os cartões técnicos); o aviso ao dono da E1.6: validar no Operacional da homolog os bloqueios reais de BLOQUEADOS, O1, O2, O5 e O19 e o corte da série do O1 em 2026-11-01 antes do merge; o que fica de fora (lotes 9a e 9b do 075, depois dessa validação)) e conferir o check `homolog-aprovada` em laços de até 170 s por chamada. Não mesclar (a main é do dono). Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 093-release-6b-homolog até 632e60e947bfed72300e678824bbe825e99937da2a24a179a76b2ade3f5f0472 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/093-release-6b-homolog.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.7 (copiadas literalmente):
- - 2026-11-11 11:51: DECISÃO DO DONO (literal): "pronto mesclei". E1.5: PR 313 (develop d8d52103 para a homolog) mesclado pelo dono (homolog 4803081e). Próximo: E1.6 (validação do dono do 6b na homolog) e E1.7 (PR de release homolog para main, aberto).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/093-release para a develop, CI verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono ou do tech-lead se o hook deixar (CLAUDE.md)." · etapa de outra delegação; continua no pedido
- "E1.6 (dono): validar o 6b na homolog (painel Operacional com os bloqueios reais)." · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state open --head homolog --base main --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
