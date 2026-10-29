Agente destino: forge:tech-lead
Pedido: 051-operacionais-separadas
Tipo: review
Branch: docs/051-o23-regras   Base: develop   Base-sha: 739bdbf69574304c87ad9671715537746db987ac
Etapa: review   Cobre: E5.3

## Objetivo
Etapa E5.3 do pedido 051: code review da página de contrato da O23 sem lacunas (commit 38bbb94 do node-backend), PR para a `develop` e merge, para a release 050 levar as operacionais com o contrato da O23 fechado. Worktree `/home/rodrigoisensee/MetricasDSPD-051`, branch `docs/051-o23-regras`, head 38bbb94 (já no origin).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-051 diff 739bdbf69574304c87ad9671715537746db987ac 38bbb9474f43b8cebf1bb770d01d656630937937` (o diff inteiro, só O23.md).
- `/home/rodrigoisensee/MetricasDSPD-051/docs/reviews/048-ajustes-back.md`, só a seção `## Achados` (A1 a A3, que este commit corrige).
- `/home/rodrigoisensee/MetricasDSPD-051/packages/metricas/src/businessmap/o2.ts`, linhas 40 a 70 (para conferir a nova linha "Quebra").

## Entregar
- "E5.3 (tech-lead): code review do E5.2, PR para a `develop` e merge (só documentação, isento de QA)." (E5.3), com:
  - (E5) Parecer em `docs/reviews/051-o23-regras.md` no formato dos pareceres de `docs/reviews/` (frontmatter com `commit: 38bbb9474f43b8cebf1bb770d01d656630937937`, veredito e `## Achados`): conferir que as duas decisões do dono de 2026-10-29 (abaixo) estão escritas como decididas, que A1 a A3 foram corrigidos e que nenhuma regra nova foi decidida no texto. Reprovado, pare e relate os achados, sem PR.
  - (E5.3) Um commit só do parecer, `git add docs/reviews/051-o23-regras.md`, padrão de commits do `docs/engineering/praticas.md`, `Cartão: K-180`; commit em chamada própria do Bash (o hook recusa heredoc junto de outros comandos); antes do push, `git branch --show-current` deve dar `docs/051-o23-regras`; push com `git push origin HEAD:refs/heads/docs/051-o23-regras`.
  - (E5.3) Validar com `forge-check pr 051-operacionais-separadas` antes do PR.
  - (E5.3) PR com `gh pr create --base develop --head docs/051-o23-regras`, título `docs(contratos): O23 sem lacunas, regras decididas pelo dono (K-180)`, corpo por `--body-file` com arquivo em `/tmp/claude-1000/` de nome `pr-051-o23-regras.md`: o que muda, as duas decisões do dono, A1 a A3 corrigidos, review (arquivo e commit), QA isento (só documentação).
  - (E5.3) Esperar os checks obrigatórios com `gh pr checks docs/051-o23-regras --watch`; só com todos concluídos e verdes, mesclar com `gh pr merge docs/051-o23-regras --squash` (o hook recusa `gh pr merge` com número); vermelho ou barrado por hook, parar e relatar, sem rodar de novo e sem contornar. Sem `--auto`.
  - (E5.3) Depois do merge, `git -C /home/rodrigoisensee/MetricasDSPD fetch origin develop`; não apagar branch nem worktree.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (E1 e E2 já entregues no PR #163; E3 cancelado pelo dono; E4 segue no pedido 050).

## Fora do escopo
- "E1.1 (qa-engineer): parecer de QA do K-180 e do K-093 na `feature/048-ajustes-back`; dispensado: diff só de documentação, isento de QA pelo `forge-check` (R-QA); o review aprovado (45991e4) vale." · etapa de outra delegação; dispensada (isento de QA)
- "E1.2 (tech-lead): PR da `feature/048-ajustes-back` para a `develop` (squash) e merge com os checks verdes." · etapa de outra delegação; já entregue (PR #163, 739bdbf)
- "E3.1 (tech-lead): worktree e branch do K-173 a partir da `develop`. Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E3.2 (react-frontend): correção do teste da O20 (K-173). Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E3.3 (tech-lead): code review do K-173, PR e merge. Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E3.4 (qa-engineer): parecer de QA do K-173. Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E5.1 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-051` e branch `docs/051-o23-regras` a partir da `develop` depois do merge do K-180." · etapa de outra delegação; já entregue (worktree em 739bdbf)
- "E5.2 (node-backend): atualizar `docs/contratos/metricas/O23.md` (E5), commit e push." · etapa de outra delegação; já entregue (38bbb94)
- Editar O23.md ou código (achado volta ao autor pelo Jarvis); o quadro e os arquivos de pedido; a promoção para a `homolog` (pedido 050); ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): "preciso quevoce separe tudo que tem das operacionais, para fazer.."
- DECISÃO DO DONO (2026-10-29): recibo do 051 aceito ("isso preciso terminar tudo do operacional"): E1 a E4 entram; K-129 e dados reais ficam fora; a mensagem "seria um so de 380" foi retirada pelo dono ("ignore a ultima mensagem").
- DECISÃO DO DONO (2026-10-29): K-173, opção A ("A"): o K-173 (lint contra leitura síncrona de DOM, dependência nova) sai do 051 e volta ao quadro; as etapas E3.1 a E3.4 caem.
- DECISÃO DO DONO (2026-10-29): U-11 da O23, opção A ("A"): "parado há mais de uma semana" na O23 = mais de 5 dias úteis; o código fica como está e a lacuna sai da página de contrato.
- DECISÃO DO DONO (2026-10-29): O23 parado e bloqueado, opção A ("A"): item parado que está bloqueado conta como parado (como o código faz hoje); a regra passa a ser escrita no contrato, e o motivo do bloqueio segue na lista.
- DECISÃO DO DONO (2026-10-29): "foquet odo poder computacional em terminar os operacionais": o 051 e a release 050 (que leva as operacionais à main) têm prioridade sobre o resto do 048, que espera.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; check vermelho não se roda de novo nem se contorna. R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 38bbb9474f43b8cebf1bb770d01d656630937937' /home/rodrigoisensee/MetricasDSPD-051/docs/reviews/051-o23-regras.md` · espera: igual '1'
- PQ-2 (pr): `gh pr view docs/051-o23-regras --json state` · espera: contém 'MERGED'
- PQ-3 (merge): `git -C /home/rodrigoisensee/MetricasDSPD merge-base --is-ancestor <mergeCommit> origin/develop` · espera: rc=0 (troque <mergeCommit> pelo sha do squash)

## Relatório
Até 8 linhas, resultado real: veredito do review, sha do commit do parecer, número do PR, resultado de cada check obrigatório com a hora em que concluiu, hora do merge e sha do squash; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
