## Objetivo
Preparar o lote 3 (operacionais: O22, O26) do back da fase 2 do pedido 011 para o PR, agora que os lotes 1 (#105) e 2 (#107, 8516ff8) estão na develop. A branch `feature/011-fase2-operacionais` (aab7a46) foi cortada sobre commits antigos das táticas (ace8db8) e não contém a develop; o seu review dela (aab7a46) é anterior à develop atual. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2` (na `feature/011-fase2-back`, com o parecer de segurança das operacionais sem commit, que não é seu).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 log --oneline ace8db8..origin/feature/011-fase2-operacionais` e `git diff --stat ace8db8 origin/feature/011-fase2-operacionais`.
- O seu parecer `docs/reviews/011-fase2-operacionais.md` na branch das operacionais.
- Na develop: `docs/reviews/011-fase2-taticas.md` (rodadas 2 a 5, o que mudou nas táticas depois de ace8db8 e pode afetar as operacionais).

## Entregar
- (E1, E2) Trazer as operacionais para cima da develop 8516ff8 sem resíduo das táticas antigas: o diff final da branch contra a develop deve ter só o O22, o O26 e o que eles exigem (mock, contratos, testes, parecer). Escolha o método (merge da develop com conflitos resolvidos a favor da develop nos arquivos das táticas, ou branch nova da develop com os commits das operacionais aplicados) e registre no parecer; sem `--force` (se precisar de branch nova, use um nome novo e apague a antiga só depois do PR).
- (E1, E2) `pnpm run pronto` na branch resultante, da raiz da worktree, com `uptime` e `free -m` antes (load abaixo de 4).
- (E1, E2) Revalidar o review sobre o commit final: nova rodada no parecer `docs/reviews/011-fase2-operacionais.md` (`commit:` para o commit revisado), gravada com a ferramenta Write do começo ao fim (nunca `sed`, Edit parcial nem script); commits por caminho, push.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1 e E3.2 já feitas): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E3.2 (forge:ux-designer): CAs na especificação."; "E1.3/E2.3 (forge:security-engineer): review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)." (revalida o parecer dele depois desta etapa); "E1.4/E2.4 (forge:qa-engineer): QA do back da fase 2." (depois da segurança); "E9.2 (dono): merge na main."
- Fora do escopo: o PR das operacionais e a promoção para a homolog (pedido 023); o E7 sem R$ (pedido 024); o front dos lotes.

## Decisões e restrições
- Decisões do usuário (pedido 011) que este lote exercita: D-5' = B (O26: passagem só quando alguém sai e outro entra, ou o conjunto é substituído); E1 do O26 com Q-a = 1 passagem e Q-b = conta; R-1 = B de 2026-10-16; R-2 = B; R-2' = A e P-1 = A; O19-pct = B; O20-destaque = A; O25(b) = B; D2 = A (pedido 024, não deste lote); métricas por nível em lotes separados, nesta ordem.
- ADR 0020 vigente para a fase 2; ADR 0011 (cálculo pela biblioteca); ADR 0003. Regras invioláveis do `CLAUDE.md`: nada de pessoa na saída, abaixo de 20 itens sem estatística, sem comparação entre times, mudança de critério registrada (T2.6).
- R-REVIEW: o parecer de review é do tech-lead, com Write. R-VERIFY: sem `--no-verify` nem `--force`. R-MAIN.
- NÃO tocar: a develop e a `main` direto, o diretório principal, a worktree `-011-front-estrategicas`, o parecer de segurança das operacionais sem commit (deixe-o intacto na worktree), `.github/`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): o `pronto` é a única tarefa pesada.

## Pronto quando
- PQ-1 (push): branch das operacionais sobre a develop 8516ff8, com a nova rodada do review, no origin.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 merge-base --is-ancestor 8516ff8 <branch das operacionais no origin> && echo contem` · espera: igual 'contem'
- PQ-3 (cmd): `pnpm run pronto` na branch, da raiz da worktree · espera: rc=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short -- server packages docs/reviews` · espera: linhas=0

## Relatório
Até 8 linhas: estado (veredito do review); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (método, nome da branch e sha, `git diff --stat` contra a develop); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
