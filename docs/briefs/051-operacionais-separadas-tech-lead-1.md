Agente destino: forge:tech-lead
Pedido: 051-operacionais-separadas
Tipo: codigo
Branch: docs/051-o23-regras   Base: develop   Base-sha: 739bdbf69574304c87ad9671715537746db987ac
Etapa: codigo   Cobre: E5.1

## Objetivo
Etapa E5.1 do pedido 051: preparar a worktree e a branch onde o node-backend vai escrever no contrato da O23 as decisões do dono de 2026-10-29 (U-11 e parado com bloqueado), para fechar as operacionais. O K-180 já está na `develop` (PR #163, 739bdbf).

## Ler
- Nada além deste brief.

## Entregar
- "E5.1 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-051` e branch `docs/051-o23-regras` a partir da `develop` depois do merge do K-180." (E5.1): `git -C /home/rodrigoisensee/MetricasDSPD fetch origin develop`, depois `git -C /home/rodrigoisensee/MetricasDSPD worktree add -b docs/051-o23-regras /home/rodrigoisensee/MetricasDSPD-051 739bdbf69574304c87ad9671715537746db987ac`; sem commit novo; push da branch com `git -C /home/rodrigoisensee/MetricasDSPD-051 push -u origin docs/051-o23-regras`. Sem `pnpm install` (a etapa seguinte só edita documentação).
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (E1 e E2 já entregues no PR #163; E3 cancelado pelo dono; E4 segue no pedido 050).

## Fora do escopo
- "E1.1 (qa-engineer): parecer de QA do K-180 e do K-093 na `feature/048-ajustes-back`; dispensado: diff só de documentação, isento de QA pelo `forge-check` (R-QA); o review aprovado (45991e4) vale." · etapa de outra delegação; dispensada (isento de QA)
- "E1.2 (tech-lead): PR da `feature/048-ajustes-back` para a `develop` (squash) e merge com os checks verdes." · etapa de outra delegação; já entregue (PR #163, 739bdbf)
- "E3.1 (tech-lead): worktree e branch do K-173 a partir da `develop`. Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E3.2 (react-frontend): correção do teste da O20 (K-173). Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E3.3 (tech-lead): code review do K-173, PR e merge. Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E3.4 (qa-engineer): parecer de QA do K-173. Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E5.2 (node-backend): atualizar `docs/contratos/metricas/O23.md` (E5), commit e push." · etapa de outra delegação; continua no pedido
- "E5.3 (tech-lead): code review do E5.2, PR para a `develop` e merge (só documentação, isento de QA)." · etapa de outra delegação; continua no pedido
- Editar qualquer arquivo; apagar branch ou worktree; o quadro e os arquivos de pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): "preciso quevoce separe tudo que tem das operacionais, para fazer.."
- DECISÃO DO DONO (2026-10-29): recibo do 051 aceito ("isso preciso terminar tudo do operacional"): E1 a E4 entram; K-129 e dados reais ficam fora; a mensagem "seria um so de 380" foi retirada pelo dono ("ignore a ultima mensagem").
- DECISÃO DO DONO (2026-10-29): K-173, opção A ("A"): o K-173 (lint contra leitura síncrona de DOM, dependência nova) sai do 051 e volta ao quadro; as etapas E3.1 a E3.4 caem.
- DECISÃO DO DONO (2026-10-29): U-11 da O23, opção A ("A"): "parado há mais de uma semana" na O23 = mais de 5 dias úteis; o código fica como está e a lacuna sai da página de contrato.
- DECISÃO DO DONO (2026-10-29): O23 parado e bloqueado, opção A ("A"): item parado que está bloqueado conta como parado (como o código faz hoje); a regra passa a ser escrita no contrato, e o motivo do bloqueio segue na lista.
- DECISÃO DO DONO (2026-10-29): "foquet odo poder computacional em terminar os operacionais": o 051 e a release 050 (que leva as operacionais à main) têm prioridade sobre o resto do 048, que espera.
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 5 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): base em 4 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-051 rev-parse HEAD` · espera: igual '739bdbf69574304c87ad9671715537746db987ac'
- PQ-2 (push): `git ls-remote origin refs/heads/docs/051-o23-regras` igual ao head local (739bdbf69574304c87ad9671715537746db987ac)
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-051 branch --show-current` · espera: igual 'docs/051-o23-regras'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
