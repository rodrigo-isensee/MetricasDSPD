Agente destino: forge:node-backend
Pedido: 051-operacionais-separadas
Tipo: codigo
Branch: docs/051-o23-regras   Base: develop   Base-sha: 739bdbf69574304c87ad9671715537746db987ac
Etapa: codigo   Cobre: E5.2

## Objetivo
Etapa E5.2 do pedido 051: deixar a página de contrato da O23 sem lacunas, escrevendo as duas decisões do dono de 2026-10-29 e corrigindo os achados recomendados A1 a A3 do review do K-180, para fechar as operacionais antes da release 050. Worktree `/home/rodrigoisensee/MetricasDSPD-051`, branch `docs/051-o23-regras`, head 739bdbf (já no origin).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-051/docs/contratos/metricas/O23.md` inteiro (o arquivo a mudar).
- `/home/rodrigoisensee/MetricasDSPD-051/docs/reviews/048-ajustes-back.md`, só a seção `## Achados` (A1 a A3).
- `/home/rodrigoisensee/MetricasDSPD-051/packages/metricas/src/businessmap/o2.ts`, linhas 40 a 70 (para A1).
- `/home/rodrigoisensee/MetricasDSPD-051/web/src/features/operacional/components/CartaoO2.tsx`, só a função `BlocoParados` (para A3).

## Entregar
- "E5.2 (node-backend): atualizar `docs/contratos/metricas/O23.md` (E5), commit e push." (E5.2), com:
  - (E5) U-11 = A: na tabela de regras, a linha "Parado" diz que "parado há mais de uma semana" = mais de 5 dias úteis, por decisão do dono de 2026-10-29; o primeiro item de `## Lacunas` sai.
  - (E5) Parado e bloqueado = A: nova linha na tabela de regras, "Parado e bloqueado": item parado que está bloqueado conta como parado (o bloqueio não altera `semMoverHaDiasUteis`), decisão do dono de 2026-10-29; o motivo do bloqueio segue na lista. O segundo item de `## Lacunas` sai.
  - (E5) Achado A1: a linha "Quebra" deixa de afirmar que a soma dos `k` de `porEtapa` é sempre igual ao `k` da taxa; descreve o que o código faz em `o2.ts` (item iniciado que voltou a uma coluna fora das etapas do O2 fica fora de `porEtapa`), sem decidir regra nova.
  - (E5) Achado A2: com as duas lacunas resolvidas, a linha "Status" fica `ok`, sem lacuna de regra pendente; se `## Lacunas` ficar só com o item do texto da tela (que é da especificação de UX, não do contrato), mantenha esse item.
  - (E5) Achado A3: na seção de cartões, troque "linhas 208 a 239" pela citação da função `BlocoParados` e do `data-testid` `o23-parados`, sem número de linha.
  - Mantenha "Revisão: 2026-10-29".
- (E5.2) Um commit só, `git add docs/contratos/metricas/O23.md`, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-180` no corpo; antes do push, `git branch --show-current` deve dar `docs/051-o23-regras`; push com `git push origin HEAD:refs/heads/docs/051-o23-regras`.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (E1 e E2 já entregues no PR #163; E3 cancelado pelo dono; E4 segue no pedido 050).

## Fora do escopo
- "E1.1 (qa-engineer): parecer de QA do K-180 e do K-093 na `feature/048-ajustes-back`; dispensado: diff só de documentação, isento de QA pelo `forge-check` (R-QA); o review aprovado (45991e4) vale." · etapa de outra delegação; dispensada (isento de QA)
- "E1.2 (tech-lead): PR da `feature/048-ajustes-back` para a `develop` (squash) e merge com os checks verdes." · etapa de outra delegação; já entregue (PR #163, 739bdbf)
- "E3.1 (tech-lead): worktree e branch do K-173 a partir da `develop`. Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E3.2 (react-frontend): correção do teste da O20 (K-173). Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E3.3 (tech-lead): code review do K-173, PR e merge. Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E3.4 (qa-engineer): parecer de QA do K-173. Cancelada: K-173 = A (2026-10-29)." · etapa de outra delegação; cancelada
- "E5.1 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-051` e branch `docs/051-o23-regras` a partir da `develop` depois do merge do K-180." · etapa de outra delegação; já entregue (worktree em 739bdbf, branch no origin)
- "E5.3 (tech-lead): code review do E5.2, PR para a `develop` e merge (só documentação, isento de QA)." · etapa de outra delegação; continua no pedido
- Código (o2.ts, criterios.ts, CartaoO2.tsx e testes não mudam); outros arquivos de `docs/`; abrir PR; `pnpm install`; o quadro e os arquivos de pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): "preciso quevoce separe tudo que tem das operacionais, para fazer.."
- DECISÃO DO DONO (2026-10-29): recibo do 051 aceito ("isso preciso terminar tudo do operacional"): E1 a E4 entram; K-129 e dados reais ficam fora; a mensagem "seria um so de 380" foi retirada pelo dono ("ignore a ultima mensagem").
- DECISÃO DO DONO (2026-10-29): K-173, opção A ("A"): o K-173 (lint contra leitura síncrona de DOM, dependência nova) sai do 051 e volta ao quadro; as etapas E3.1 a E3.4 caem.
- DECISÃO DO DONO (2026-10-29): U-11 da O23, opção A ("A"): "parado há mais de uma semana" na O23 = mais de 5 dias úteis; o código fica como está e a lacuna sai da página de contrato.
- DECISÃO DO DONO (2026-10-29): O23 parado e bloqueado, opção A ("A"): item parado que está bloqueado conta como parado (como o código faz hoje); a regra passa a ser escrita no contrato, e o motivo do bloqueio segue na lista.
- DECISÃO DO DONO (2026-10-29): "foquet odo poder computacional em terminar os operacionais": o 051 e a release 050 (que leva as operacionais à main) têm prioridade sobre o resto do 048, que espera.
- Dúvida de regra de negócio que apareça ao escrever não se resolve por inferência: pare e relate como pergunta ao dono (CLAUDE.md, regras invioláveis).
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `grep -c 'pendente de confirmação' /home/rodrigoisensee/MetricasDSPD-051/docs/contratos/metricas/O23.md` · espera: igual '0'
- PQ-2 (cmd): `grep -c 'linhas 208 a 239' /home/rodrigoisensee/MetricasDSPD-051/docs/contratos/metricas/O23.md` · espera: igual '0'
- PQ-3 (cmd): `grep -c 'o23-parados' /home/rodrigoisensee/MetricasDSPD-051/docs/contratos/metricas/O23.md` · espera: igual '1'
- PQ-4 (cmd): `grep -c 'Parado e bloqueado' /home/rodrigoisensee/MetricasDSPD-051/docs/contratos/metricas/O23.md` · espera: igual '1'
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-051 diff --name-only 739bdbf69574304c87ad9671715537746db987ac HEAD` · espera: igual 'docs/contratos/metricas/O23.md'
- PQ-6 (push): `git ls-remote origin refs/heads/docs/051-o23-regras` igual ao head local

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
