## Objetivo
Deixar verdes os checks do PR #101 (homolog → main, registro da versão 0.16.0 do Forge), para o usuário poder mesclar. Hoje `perf` e `homolog-aprovada` estão em FAILURE. Cartão K-106, pedido 014. Sem worktree; trabalho só pelo `gh`.

## Ler
- `gh pr checks 101` e os logs dos runs que falharam.
- O seu parecer de 2026-10-16 (`homolog-2026-10-16.md`, na pasta de pareceres de devops), seção "Release #96": a mesma corrida do `homolog-aprovada` e o C6 do `perf` perto de 200 ms.

## Entregar
- (E1) Diagnóstico dos dois checks vermelhos do #101: é a mesma corrida e o mesmo ruído do #96 ou é falha nova?
- (E1) Se for corrida ou ruído: `gh run rerun --failed` (no `homolog-aprovada`, só depois do portão de homolog do mesmo SHA ficar verde).
- (E1) Nova seção "Release #101" no parecer de devops (no mesmo arquivo de 2026-10-16 ou num de 2026-10-17), gravada com Write.
- Fora do escopo: corrigir o workflow do `homolog-aprovada` (pedido 016, K-108); mudar orçamento de perf; commit do parecer (vai no PR de docs do tech-lead); "E1.2 (dono): merge do #101 na main."

## Decisões e restrições
- NÃO tocar: workflow, código, o PR nem a branch `homolog`. R-MAIN: o merge na main é do usuário.
- Falha nova e real: não rerode até passar. Relate a causa e o dono.

## Pronto quando
- PQ-1 (run): ids dos runs rerodados e a conclusão de cada um.
- PQ-2 (cmd): `gh pr checks 101 | grep -c -E "fail"` · espera: igual '0'
- PQ-3 (cmd): `grep -r -l -F "Release #101" /home/rodrigoisensee/MetricasDSPD/docs/devops` · espera: linhas>=1

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
