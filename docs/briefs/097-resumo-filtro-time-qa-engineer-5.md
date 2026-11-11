Agente destino: forge:qa-engineer
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: fix/k272-ap-tipo-categoria   Base: develop   Base-sha: f4c122f15c05fbf5fea86797c9c348656d11ab36
Etapa: codigo   Cobre: E6.3

## Objetivo
Revalidação curta do QA do K-272 depois do merge da develop na branch: worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `fix/k272-ap-tipo-categoria`, head local dbd120a49bfbe801f75c829d0eead0e12018d358 (merge da develop sem conflito; ainda não enviado). O `forge-check pr` marca o parecer de QA como desatualizado porque `.github/actions/playwright/action.yml` veio da develop (PR 318); o patch do item não mudou (`git diff 1d691f4e dbd120a4 -- server/src/modulos/apontamento server/tests/apontamento-rota.test.ts` vazio).

## Ler
- A saída do `forge-check parecer delta` do seu parecer, rodado na worktree.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/097-k272-ap-tipo.md` (o seu parecer em d7702b7b).

## Entregar
- "E6.3 (qa-engineer): QA do K-272." (E6.3) Nesta delegação, a revalidação no head dbd120a4.
- (E6) (E6.3) Conferir que o delta do domínio do QA é só o que veio da base; rodar `server/tests/apontamento-rota.test.ts` com no máximo 2 workers (R-TETO) no head dbd120a4; regravar `docs/qa/097-k272-ap-tipo.md` pela ferramenta Write com `commit: dbd120a49bfbe801f75c829d0eead0e12018d358`, o mesmo veredito se nada mudou, e uma linha dizendo que é revalidação depois do merge da develop. Commit só do parecer com `Cartão: K-272` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-ap-tipo-categoria` (`github.com` em allowed_domains; o push leva também o merge da develop); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/097-k272-ap-tipo.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até 0599c10d0bd5e7e5c6e9661f0a3db26ed1d8d87b288a4821e9f19bd7b59e28c1 (10 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024
- aplicáveis a E6.3 (copiadas literalmente):
- - 2026-11-11 13:51: DECISÃO DO DONO repassada pela sessão "WSL ativação" (literal do dono): "Agrupar". P-097-7 respondida pela opção (a): no AP-TIPO e na lista do filtro tipo do Apontamento, uma linha e uma opção por categoria do contrato (dim_card.tipo), somando todos os type_id dela; filtrar por categoria cobre todos os type_id; lerCardsIncompletos deixa de filtrar por type_id; "Sem tipo" segue à parte; teste com dois type_id da mesma categoria. E6 (K-272) começa já, na worktree 041, branch fix/k272-ap-tipo-categoria, a partir da develop eac38a64.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 096; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/fix/k272-ap-tipo-categoria:docs/qa/097-k272-ap-tipo.md` · espera: contém 'commit: dbd120a49bfbe801f75c829d0eead0e12018d358'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
