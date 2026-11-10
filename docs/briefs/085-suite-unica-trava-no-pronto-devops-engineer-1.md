Agente destino: forge:devops-engineer
Pedido: 085-suite-unica-trava-no-pronto
Tipo: codigo
Branch: feature/085-suite-unica-pronto   Base: develop   Base-sha: 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce
Etapa: codigo   Cobre: E1.1

## Objetivo
Corrigir a trava do teste 4 de `scripts/suite-unica.test.sh` sob `pnpm run pronto` (pedido 085, K-256): o `pronto` roda dentro de `scripts/suite-unica.sh`, segura a trava padrão da estação, e o teste 4 espera por ela sem fim. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch nova `feature/085-suite-unica-pronto`.

## Ler
- `scripts/suite-unica.sh` e `scripts/suite-unica.test.sh` da develop (o teste 4 nas linhas 51 a 61); a linha `"pronto"` do `package.json` da raiz.

## Entregar
- "E1.1 (devops-engineer): correção em `scripts/suite-unica.test.sh` (e, se preciso, em `scripts/suite-unica.sh`), com o próprio teste provando os dois casos, e parecer de devops em docs/devops/." (E1.1)
- (E1) (E1.1) Preparar: conferir `git -C /home/rodrigoisensee/MetricasDSPD-056d status --short` só com `docs/ux/080-revisao-leia-junto.md` não rastreado (de outro pedido: não adicionar nem apagar); `git -C /home/rodrigoisensee/MetricasDSPD-056d fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-056d switch -c feature/085-suite-unica-pronto 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce` (a partir do sha, sem rastreio); logo depois conferir `branch --show-current` = `feature/085-suite-unica-pronto` (se não, pare e relate).
- (E1) (E1.1) Corrigir para que o teste 4 não pendure quando já roda dentro de uma suíte que segura a trava padrão, mantendo a prova de que, fora disso, a segunda chamada espera a primeira no caminho padrão (por exemplo: detectar a trava padrão já ocupada pelo processo de fora e provar o caminho padrão sem depender dela, ou dar timeout à primeira chamada e registrar o caso como pulado com o motivo). Sem afrouxar o que a trava protege; a CI continua igual. Provar: `bash scripts/suite-unica.test.sh` sozinho passa (todos os casos), e rodado de dentro de `bash scripts/suite-unica.sh bash scripts/suite-unica.test.sh` termina em menos de 60 s com rc 0. Commit com `Cartão: K-256` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad), `git add` explícito por caminho; push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/085-suite-unica-pronto` (`github.com` em allowed_domains); parecer de devops curto em `docs/devops/085-suite-unica-pronto.md` no mesmo commit ou em commit à parte; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 085-suite-unica-trava-no-pronto até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/085-suite-unica-trava-no-pronto.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (`bash scripts/suite-unica.test.sh` sozinho e `pnpm run pronto` inteiro sem pendurar)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta, junto com a próxima rodada." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d ls-remote origin refs/heads/feature/085-suite-unica-pronto` · espera: linhas=1
- PQ-2 (cmd): `timeout 120 bash -c "cd /home/rodrigoisensee/MetricasDSPD-056d && bash scripts/suite-unica.sh bash scripts/suite-unica.test.sh"` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
