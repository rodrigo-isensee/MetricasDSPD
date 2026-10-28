Agente destino: forge:tech-lead
Pedido: 044-e2e-da-ci-dentro-do-teto
Tipo: codigo
Branch: feature/044-e2e-em-partes   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: review

## Objetivo
Etapa E1.2 do pedido 044 (cartão K-155): code review da divisão da E2E da CI em 2 partes com o job agregador `e2e` (commit b0c0f69d5ded8ee349317b25598eb8c2a5de1a5d, devops-engineer-1), que destrava o merge dos PRs #151 e #152 (o `e2e` estourava o teto de 30 min). Run de workflow_dispatch 40674397824 verde (parte 1 em 13 min 10 s, parte 2 em 19 min 13 s). Worktree `/home/rodrigoisensee/MetricasDSPD-044`, head 19549b9c6dc80704a40dadf22fc81860cb16308c, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-044 diff 9cc84d3861b323fb84818a1458dc97cbfd09ae9b 19549b9c6dc80704a40dadf22fc81860cb16308c`.
- `/home/rodrigoisensee/MetricasDSPD-044/docs/devops/044-e2e-em-partes.md`: frontmatter e `## Achados`.
- `docs/pedidos/044-e2e-da-ci-dentro-do-teto.md`: `## Escopo` e `## Fora do escopo`.

## Entregar
- (E1, E1.2) Code review do diff: o `e2e` fica vermelho quando uma parte falha, é cancelada ou pulada por erro, e fica como antes fora do gatilho; os 726 testes cobertos pelas 2 partes; Mermaid numa parte só; artefatos distintos (E2); nada de teto, timeout ou retry aumentado.
- (E1, E1.2) Parecer em `docs/reviews/044-e2e-em-partes.md` pela ferramenta de escrita (Write): frontmatter com `parecer:` (aprovado ou reprovado) e `commit: 19549b9c6dc80704a40dadf22fc81860cb16308c`; seção `## Achados` só com linhas de achado, uma por linha, até 300 caracteres cada. Commit com `git add` explícito desse caminho, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-155`; push sem `--force` e sem PR.
- (E3) Nada a entregar aqui: não nesta delegação (parecer de devops já entregue; o de segurança é do E1.3, no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:devops-engineer): a divisão em 2 partes e o job agregador `e2e` (E1, E2), na branch `feature/044-e2e-em-partes`, com o parecer de devops (E3)." · etapa de outra delegação; já entregue (b0c0f69 e 19549b9)
- "E1.3 (forge:security-engineer): parecer de segurança do workflow, junto com o code review." · etapa de outra delegação; em paralelo a esta
- "E1.4 (forge:qa-engineer): parecer de QA: o run de workflow_dispatch na branch mostra as 2 partes somando os 726 testes e o `e2e` verde." · etapa de outra delegação; continua no pedido (depois do review)
- "E1.5 (forge:tech-lead): PR para a develop e merge; depois, os PRs #151 e #152 recebem a develop." · etapa de outra delegação; continua no pedido (depois do QA)
- Mudar o workflow ou outro parecer (achado vira relato, não correção); abrir PR; rodar suítes locais; re-executar checks dos PRs #151, #152 e #153; ruleset; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -026, -041b e -upgrade.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): "Eu estou indo dormir faça tudo Que não depende de mim".
- Decisão técnica do Jarvis (Histórico do pedido 044, 2026-10-28 07:39): dividir em partes, não subir o teto.
- O check obrigatório do ruleset se chama `e2e`: o job agregador mantém exatamente esse `name`. O ruleset é do dono; não mexer.
- Fora do escopo do pedido 041 (E2): "sem aumentar timeout e sem retry como solução".
- O parecer é gravado pela ferramenta de escrita (Write), nunca por Bash, e sem `commit --amend`. Push concorrente: o security-engineer empurra a mesma branch em paralelo; antes do push, `git pull --rebase` sem `--force`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (cmd): `grep -c -e '^parecer: ' -e '^commit: 19549b9c6dc80704a40dadf22fc81860cb16308c' /home/rodrigoisensee/MetricasDSPD-044/docs/reviews/044-e2e-em-partes.md` · espera: igual '2'
- PQ-2 (push): `git -C /home/rodrigoisensee/MetricasDSPD-044 ls-remote origin refs/heads/feature/044-e2e-em-partes` · espera: contém o sha40 de `git -C /home/rodrigoisensee/MetricasDSPD-044 rev-parse HEAD`
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-044 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o parecer, os achados bloqueantes e o sha do commit. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
