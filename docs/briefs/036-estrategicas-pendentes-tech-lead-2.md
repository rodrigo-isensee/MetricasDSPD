Agente destino: forge:tech-lead
Pedido: docs/pedidos/036-estrategicas-pendentes.md
Branch: feature/036-estrategicas-pendentes   Base: develop   Base-sha: bbbc70c84335f5ca332ebc42d4813d2b245bd924

## Objetivo
Levar as estratégicas pendentes à develop (etapa E1.5 do pedido 036): commitar a revisão de UX (E1.6, feita sem commit pelo forge:ux-designer, que não tem Bash), abrir o PR para a `develop` e mesclar por squash com review, QA e UX em dia. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/036-estrategicas-pendentes` (head 97f8545).

## Ler
- `docs/reviews/036-estrategicas-pendentes.md` e `docs/qa/036-estrategicas-pendentes.md` (pareceres).
- `/home/rodrigoisensee/MetricasDSPD-030/docs/ux/revisao-036-e7-pergunta.md` (revisão de UX, sem commit).
- `docs/pedidos/036-estrategicas-pendentes.md`, seções Escopo, Etapas e Andamento.

## Entregar
- (E1) (E3) Commitar `docs/ux/revisao-036-e7-pergunta.md` sozinho, com `git add` explícito, mensagem conforme a seção de commits do `docs/engineering/praticas.md` (cartão K-119; autoria do ux-designer citada no corpo), e push. Se a revisão de UX trouxer achado bloqueante, pare e relate antes do PR.
- (E1) (E2) (E3) `forge-check pr 036-estrategicas-pendentes --ref feature/036-estrategicas-pendentes --base origin/develop` sem saída; PR da branch para a `develop` com o resumo do pedido 036 (E7 no catálogo e na especificação; FA-006 não reproduz; IF-A de /estrategico com mínimo de verificados); checks verdes (`gh pr checks`); merge por squash com a mensagem do squash trazendo as linhas `Cartão: K-091`, `Cartão: K-118` e `Cartão: K-119` (achado A1 do review).
- (E1) Depois do merge (R-FLUXO, "Depois do merge"): apagar a branch remota e a local e remover a worktree `/home/rodrigoisensee/MetricasDSPD-030` (`git worktree remove`, sem `--force`; se houver arquivo não commitado, pare e relate).

## Fora do escopo
- "E1.6 (forge:ux-designer): revisão de UX da interface implementada (texto do E7 no cartão de /estrategico) contra a especificação, antes do PR; parecer gravado sem commit (o UX não tem Bash), commitado pelo tech-lead no E1.5." · etapa de outro papel (aqui só o commit do arquivo dela).
- "E1.4 (forge:qa-engineer): QA e parecer." · etapa de outro papel, cumprida (97f8545).
- "E1.3 (forge:tech-lead): code review." · etapa do mesmo papel, cumprida (fc9ecf2).
- "E1.1 (forge:qa-engineer): medição do FA-006 (3 execuções, mock e api), na branch do pedido." e "E2.1 (forge:qa-engineer): teste do IFA-001 em /estrategico, na mesma branch, depois do E1.1 (R-WIP)." · etapas de outro papel, cumpridas.
- "E1.2 (forge:react-frontend): correção do FA-006, só se a medição confirmar o estouro." · etapa de outro papel; não se aplica.
- "E3.1 (dono): decidir o texto do E7 no catálogo (feito: opção A)." · etapa do dono, cumprida.
- "E3.2 (forge:react-frontend): trocar o texto no catálogo e o teste que o cita." e "E3.3 (forge:ux-designer): trocar o texto na especificação." · etapas de outro papel, cumpridas.
- Promoção develop → homolog (vem com o pedido 037, depois do Worker); a `main`; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 036 aceito ("sim").
- DECISÃO DO DONO (2026-10-20): E7 no catálogo, opção A ("A"): a pergunta passa a ser "Qual a participação de cada sistema nas nossas entregas?" (catálogo `web/src/content/catalogo-metricas.ts` e especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §E7).
- ADR 0003 (citada no pedido): F2, CLS < 0,1; o limite não muda.
- ADR 0004 (citada no pedido): documentos com frontmatter.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio (hook, check vermelho, proteção da develop) não se contorna; vira relato.

## Pronto quando
- PQ-1 (merge): `gh pr list --head feature/036-estrategicas-pendentes --base develop --state merged --json number -q length` · espera: igual '1'
- PQ-2 (sha): `git log -1 --format=%h origin/develop` · espera: o hash do commit de squash do PR.
- PQ-3 (cmd): `git ls-remote origin refs/heads/feature/036-estrategicas-pendentes` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD worktree list --porcelain | grep -c 'MetricasDSPD-030$'` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
